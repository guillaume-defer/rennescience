import { buildSTARUrl, buildRennesMetropoleUrl, API_CONFIG } from '../config/apiConfig';
import { apiManager, type APIConnectionResult } from './apiConnectionManager';
import type {
  VeloStation,
  ParkingRelais,
  BusPosition,
  TrafficAlert,
  MetroLine,
  BusLine,
  DashboardStats,
  NextDeparture,
  MetroLineStatus,
  MetroStationStatus,
  MetroEquipmentStatus,
  BusStop,
  MetroStop,
  Commune,
  FrequentationData,
  Tarif,
} from '../types';

// === Types pour les réponses API ===
interface OpenDataSoftResponse<T> {
  total_count: number;
  results: T[];
}

// === Classe de service principale ===
// Utilise maintenant le apiConnectionManager centralisé pour toutes les requêtes API
class TerritorialDataService {

  // === Méthode helper pour utiliser le manager centralisé ===
  private async fetchFromManager<T>(endpointId: string): Promise<OpenDataSoftResponse<T> | null> {
    const result: APIConnectionResult<OpenDataSoftResponse<T>> = await apiManager.fetch<OpenDataSoftResponse<T>>(endpointId);

    if (!result.success) {
      console.warn(`[TerritorialService] Failed to fetch ${endpointId}:`, result.error);
      return null;
    }

    return result.data;
  }

  // === Méthode legacy pour les endpoints non-migrés ===
  private async fetchWithCache<T>(url: string, cacheKey: string, fallbackUrl?: string): Promise<T | null> {
    const tryFetch = async (targetUrl: string): Promise<T | null> => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const response = await fetch(targetUrl, {
          signal: controller.signal,
          headers: {
            'Accept': 'application/json',
          }
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          console.warn(`API Warning: ${response.status} for ${targetUrl}`);
          return null;
        }

        return await response.json() as T;
      } catch (error) {
        if (error instanceof Error) {
          if (error.name === 'AbortError') {
            console.warn(`API Timeout for ${targetUrl}`);
          } else {
            console.warn(`Fetch error for ${targetUrl}:`, error.message);
          }
        }
        return null;
      }
    };

    let result = await tryFetch(url);

    if (!result && fallbackUrl) {
      console.log(`[API] Trying fallback URL for ${cacheKey}`);
      result = await tryFetch(fallbackUrl);
    }

    return result;
  }

  // === Extraction sécurisée des coordonnées ===
  private extractCoordinates(record: Record<string, unknown>): [number, number] | null {
    // Format 1: { coordonnees: { lat, lon } }
    if (record.coordonnees && typeof record.coordonnees === 'object') {
      const coords = record.coordonnees as { lat?: number; lon?: number };
      if (typeof coords.lat === 'number' && typeof coords.lon === 'number') {
        return [coords.lon, coords.lat];
      }
    }
    
    // Format 2: { geo_point_2d: { lat, lon } }
    if (record.geo_point_2d && typeof record.geo_point_2d === 'object') {
      const coords = record.geo_point_2d as { lat?: number; lon?: number };
      if (typeof coords.lat === 'number' && typeof coords.lon === 'number') {
        return [coords.lon, coords.lat];
      }
    }
    
    // Format 3: { latitude, longitude }
    if (typeof record.latitude === 'number' && typeof record.longitude === 'number') {
      return [record.longitude, record.latitude];
    }
    
    // Format 4: { lat, lon } au niveau racine
    if (typeof record.lat === 'number' && typeof record.lon === 'number') {
      return [record.lon, record.lat];
    }
    
    return null;
  }

  // === Vélos en libre-service ===
  async getVeloStations(): Promise<VeloStation[]> {
    // Utilise le manager centralisé
    const data = await this.fetchFromManager<Record<string, unknown>>('star-velo-realtime');

    if (!data?.results) {
      console.warn('[Velos] No data received from API');
      return [];
    }

    console.log('[Velos] Received', data.results.length, 'records from API');

    return data.results
      .map((record): VeloStation | null => {
        const coords = this.extractCoordinates(record);
        if (!coords) return null;

        // Parsing plus robuste du statut - multiple conditions pour OUVERT
        const etatStr = String(record.etat || record.status || record.state || 'inconnu').toLowerCase();
        const isOpen = etatStr.includes('fonctionnement') || 
                       etatStr.includes('ouvert') || 
                       etatStr.includes('open') ||
                       etatStr.includes('service') ||
                       etatStr === 'ok' ||
                       etatStr === '1';
        
        return {
          id: String(record.idstation || record.id || Math.random().toString(36).substr(2, 9)),
          name: String(record.nom || record.name || record.station || 'Station inconnue'),
          coordinates: coords,
          bikesAvailable: Number(record.nombrevelosdisponibles ?? record.velos_disponibles ?? record.ebikes ?? record.bikes ?? 0),
          slotsAvailable: Number(record.nombreemplacementsdisponibles ?? record.emplacements_disponibles ?? record.slots ?? 0),
          totalSlots: Number(record.nombreemplacementsactuels ?? record.capacite ?? record.capacity ?? 20),
          status: isOpen ? 'OUVERT' : 'FERME',
          lastUpdate: record.lastupdate ? new Date(String(record.lastupdate)) : new Date(),
        };
      })
      .filter((s): s is VeloStation => s !== null);
  }

  // === Parkings P+R ===
  async getParkingRelais(): Promise<ParkingRelais[]> {
    // Utilise le manager centralisé
    const data = await this.fetchFromManager<Record<string, unknown>>('star-parking-realtime');

    if (!data?.results) {
      console.warn('[Parkings] No data received from API');
      return [];
    }

    console.log('[Parkings] Received', data.results.length, 'records from API');

    return data.results
      .map((record): ParkingRelais | null => {
        const coords = this.extractCoordinates(record);
        if (!coords) return null;

        // Parsing robuste des capacités
        // Champs possibles: capacitesoliste, capaciteactuelle, capacitetotale, capacite
        const capacity = Number(
          record.capaciteactuelle ?? 
          record.capacitetotale ?? 
          record.capacitesoliste ?? 
          record.capacite ?? 
          0
        );
        
        // Champs possibles: nombreplacesdisponiblessoliste, placesdisponibles, disponibles
        const available = Number(
          record.nombreplacesdisponiblessoliste ?? 
          record.placesdisponibles ?? 
          record.disponibles ?? 
          0
        );
        
        const occupancyRate = capacity > 0 
          ? Math.round(((capacity - available) / capacity) * 100)
          : 0;

        // Parsing plus robuste du statut
        const etatStr = String(record.etat || record.status || record.state || 'ouvert').toLowerCase();
        const isOpen = !etatStr.includes('ferme') && 
                       !etatStr.includes('closed') && 
                       !etatStr.includes('hors');

        return {
          id: String(record.idparc || record.id || Math.random().toString(36).substr(2, 9)),
          name: String(record.nom || record.name || 'Parking inconnu'),
          coordinates: coords,
          capacityTotal: capacity || 100, // Fallback si pas de capacité
          availableSpaces: available,
          occupancyRate,
          status: isOpen ? 'OUVERT' : 'FERME',
          fillStatus: String(record.etatremplissage || '') as 'LIBRE' | 'COMPLET' | '',
          lastUpdate: record.jrdheuremaj ? new Date(String(record.jrdheuremaj)) : new Date(),
        };
      })
      .filter((p): p is ParkingRelais => p !== null);
  }

  // === Positions des bus en temps réel ===
  async getBusPositions(): Promise<BusPosition[]> {
    // Utilise le manager centralisé
    const data = await this.fetchFromManager<Record<string, unknown>>('star-bus-positions');

    if (!data?.results) {
      console.warn('[Bus] No data received from API - positions temps réel indisponibles');
      return [];
    }

    console.log('[Bus] Received', data.results.length, 'records from API');

    return data.results
      .map((record): BusPosition | null => {
        const coords = this.extractCoordinates(record);
        if (!coords) return null;

        return {
          id: String(record.idbus || record.id || ''),
          lineId: String(record.idligne || ''),
          lineName: String(record.nomligne || record.ligne || ''),
          destination: String(record.destination || ''),
          coordinates: coords,
          // Note: precisionsituation = précision GPS, pas l'orientation
          // Le champ cap/direction n'existe pas dans l'API STAR actuelle
          bearing: undefined,
          delay: record.ecartsecondes ? Number(record.ecartsecondes) : undefined,
          lastUpdate: new Date(),
        };
      })
      .filter((b): b is BusPosition => b !== null);
  }

  // === Lignes de métro (topologie) ===
  async getMetroLines(): Promise<MetroLine[]> {
    // Utilise le manager centralisé
    const data = await this.fetchFromManager<Record<string, unknown>>('star-metro-lines-topo');

    if (!data?.results) return [];

    return data.results
      .filter(record => record.geo_shape)
      .map((record): MetroLine => {
        const shortName = String(record.nomcourt || record.id || '').toLowerCase();
        const color = shortName.includes('a') ? '#d9272e' : 
                      shortName.includes('b') ? '#0055a4' : 
                      String(record.couleurligne || '#6b7280');

        return {
          id: String(record.id || ''),
          name: String(record.nomlong || record.nomcourt || ''),
          color,
          geometry: record.geo_shape as GeoJSON.LineString | GeoJSON.MultiLineString,
        };
      });
  }

  // === Lignes de bus (topologie) ===
  async getBusLines(): Promise<BusLine[]> {
    // Utilise le manager centralisé
    const data = await this.fetchFromManager<Record<string, unknown>>('star-bus-lines-topo');

    if (!data?.results) return [];

    return data.results
      .filter(record => record.geo_shape)
      .map((record): BusLine => ({
        id: String(record.id || ''),
        name: String(record.nomlong || ''),
        shortName: String(record.nomcourt || ''),
        color: String(record.couleurligne || '#6b7280'),
        geometry: record.geo_shape as GeoJSON.LineString | GeoJSON.MultiLineString,
      }));
  }

  // === Alertes trafic (RÉACTIVÉ avec le bon endpoint) ===
  async getTrafficAlerts(): Promise<TrafficAlert[]> {
    // Utilise le manager centralisé
    const data = await this.fetchFromManager<Record<string, unknown>>('star-alerts');

    if (!data?.results) {
      console.warn('[TrafficAlerts] No data received from API');
      return [];
    }

    console.log('[TrafficAlerts] Received', data.results.length, 'alerts from API');

    return data.results.map((record): TrafficAlert => {
      // Déterminer la sévérité basée sur le niveau ou le type
      const niveau = String(record.niveau || record.level || record.severite || 'info').toLowerCase();
      let severity: 'info' | 'warning' | 'critical' = 'info';
      if (niveau.includes('critique') || niveau.includes('critical') || niveau.includes('grave')) {
        severity = 'critical';
      } else if (niveau.includes('moyen') || niveau.includes('warning') || niveau.includes('perturbation')) {
        severity = 'warning';
      }

      // Extraire les lignes affectées
      const lignesStr = String(record.lignes || record.idlignes || record.lines || '');
      const affectedLines = lignesStr ? lignesStr.split(/[,;|]/).map(l => l.trim()).filter(Boolean) : [];

      return {
        id: String(record.idalerte || record.idperturbation || record.id || Math.random().toString(36).substr(2, 9)),
        title: String(record.titre || record.title || record.objet || 'Alerte'),
        description: String(record.description || record.message || record.texte || ''),
        severity,
        affectedLines,
        startDate: record.datedebut ? new Date(String(record.datedebut)) : new Date(),
        endDate: record.datefin ? new Date(String(record.datefin)) : undefined,
      };
    });
  }

  // === Prochains passages métro ===
  async getMetroNextDepartures(limit: number = 100): Promise<NextDeparture[]> {
    const url = buildSTARUrl(API_CONFIG.STAR.METRO_NEXT_DEPARTURES, limit);
    const data = await this.fetchWithCache<OpenDataSoftResponse<Record<string, unknown>>>(url, 'metro-departures');
    
    if (!data?.results) {
      console.warn('[MetroDepartures] No data received from API');
      return [];
    }
    
    console.log('[MetroDepartures] Received', data.results.length, 'departures from API');

    return data.results.map((record): NextDeparture => {
      const lineShort = String(record.nomcourtligne || record.ligne || '').toLowerCase();
      const lineColor = lineShort.includes('a') ? '#d9272e' : lineShort.includes('b') ? '#0055a4' : '#6b7280';

      return {
        id: String(record.id || Math.random().toString(36).substr(2, 9)),
        stopId: String(record.idarret || record.idpointarret || ''),
        stopName: String(record.nomarret || record.nomstop || ''),
        lineId: String(record.idligne || ''),
        lineName: String(record.nomcourtligne || record.nomligne || ''),
        lineColor,
        destination: String(record.destination || record.sens || ''),
        departureTime: new Date(String(record.depart || record.heuredepart || record.arrivee || new Date())),
        arrivalTime: record.arrivee ? new Date(String(record.arrivee)) : undefined,
        delay: record.ecart ? Number(record.ecart) : undefined,
        isRealtime: Boolean(record.precision === 'Temps réel' || record.tempsreel),
        platform: record.quai ? String(record.quai) : undefined,
      };
    });
  }

  // === Prochains passages bus ===
  async getBusNextDepartures(limit: number = 200): Promise<NextDeparture[]> {
    const url = buildSTARUrl(API_CONFIG.STAR.BUS_NEXT_DEPARTURES, limit);
    const data = await this.fetchWithCache<OpenDataSoftResponse<Record<string, unknown>>>(url, 'bus-departures');
    
    if (!data?.results) {
      console.warn('[BusDepartures] No data received from API');
      return [];
    }
    
    console.log('[BusDepartures] Received', data.results.length, 'departures from API');

    return data.results.map((record): NextDeparture => ({
      id: String(record.id || Math.random().toString(36).substr(2, 9)),
      stopId: String(record.idarret || record.idpointarret || ''),
      stopName: String(record.nomarret || record.nomstop || ''),
      lineId: String(record.idligne || ''),
      lineName: String(record.nomcourtligne || record.nomligne || ''),
      lineColor: String(record.couleurligne || '#6b7280'),
      destination: String(record.destination || record.sens || ''),
      departureTime: new Date(String(record.depart || record.heuredepart || new Date())),
      arrivalTime: record.arrivee ? new Date(String(record.arrivee)) : undefined,
      delay: record.ecart ? Number(record.ecart) : undefined,
      isRealtime: Boolean(record.precision === 'Temps réel' || record.tempsreel),
      platform: undefined,
    }));
  }

  // === État des lignes de métro ===
  async getMetroLinesStatus(): Promise<MetroLineStatus[]> {
    // Utilise le manager centralisé
    const data = await this.fetchFromManager<Record<string, unknown>>('star-metro-status');

    if (!data?.results) {
      console.warn('[MetroLinesStatus] No data received from API');
      return [];
    }

    console.log('[MetroLinesStatus] Received', data.results.length, 'lines status from API');

    return data.results.map((record): MetroLineStatus => {
      const shortName = String(record.nomcourt || record.ligne || '').toLowerCase();
      const color = shortName.includes('a') ? '#d9272e' : shortName.includes('b') ? '#0055a4' : '#6b7280';
      
      // Déterminer le statut
      const etatStr = String(record.etat || record.status || 'normal').toLowerCase();
      let status: 'normal' | 'perturbé' | 'interrompu' = 'normal';
      if (etatStr.includes('interrompu') || etatStr.includes('arret') || etatStr.includes('stopped')) {
        status = 'interrompu';
      } else if (etatStr.includes('perturbé') || etatStr.includes('ralenti') || etatStr.includes('degraded')) {
        status = 'perturbé';
      }

      return {
        id: String(record.idligne || record.id || ''),
        name: String(record.nomlong || record.nom || ''),
        shortName: String(record.nomcourt || ''),
        color,
        status,
        message: record.message ? String(record.message) : undefined,
        lastUpdate: record.lastupdate ? new Date(String(record.lastupdate)) : new Date(),
      };
    });
  }

  // === État des stations de métro ===
  async getMetroStationsStatus(): Promise<MetroStationStatus[]> {
    // Utilise le manager centralisé
    const data = await this.fetchFromManager<Record<string, unknown>>('star-metro-stations');

    if (!data?.results) {
      console.warn('[MetroStationsStatus] No data received from API');
      return [];
    }

    console.log('[MetroStationsStatus] Received', data.results.length, 'stations status from API');

    return data.results.map((record): MetroStationStatus => {
      const etatStr = String(record.etat || record.status || 'ouvert').toLowerCase();
      const isOpen = etatStr.includes('ouvert') || etatStr.includes('open') || !etatStr.includes('ferme');
      const coords = this.extractCoordinates(record);

      return {
        id: String(record.idstation || record.id || ''),
        name: String(record.nom || record.nomstation || ''),
        lineId: String(record.idligne || ''),
        isOpen,
        coordinates: coords || undefined,
        lastUpdate: record.lastupdate ? new Date(String(record.lastupdate)) : new Date(),
      };
    });
  }

  // === État des équipements métro (ascenseurs, escalators) ===
  async getMetroEquipmentStatus(): Promise<MetroEquipmentStatus[]> {
    const url = buildSTARUrl(API_CONFIG.STAR.METRO_EQUIPMENT_REALTIME, 300);
    const data = await this.fetchWithCache<OpenDataSoftResponse<Record<string, unknown>>>(url, 'metro-equipment-status');
    
    if (!data?.results) {
      console.warn('[MetroEquipment] No data received from API');
      return [];
    }
    
    console.log('[MetroEquipment] Received', data.results.length, 'equipment status from API');

    return data.results.map((record): MetroEquipmentStatus => {
      // Déterminer le type d'équipement
      const typeStr = String(record.type || record.typeequipement || '').toLowerCase();
      let type: 'ascenseur' | 'escalator' | 'distributeur' | 'autre' = 'autre';
      if (typeStr.includes('ascenseur') || typeStr.includes('elevator')) {
        type = 'ascenseur';
      } else if (typeStr.includes('escalator') || typeStr.includes('escalier')) {
        type = 'escalator';
      } else if (typeStr.includes('distributeur') || typeStr.includes('dab')) {
        type = 'distributeur';
      }

      const etatStr = String(record.etat || record.status || 'fonctionnement').toLowerCase();
      const isOperational = etatStr.includes('fonctionnement') || etatStr.includes('ok') || etatStr.includes('operational');

      return {
        id: String(record.idequipement || record.id || ''),
        stationId: String(record.idstation || ''),
        stationName: String(record.nomstation || record.station || ''),
        type,
        name: String(record.nom || record.nomequipement || typeStr),
        isOperational,
        lastUpdate: record.lastupdate ? new Date(String(record.lastupdate)) : new Date(),
      };
    });
  }

  // === Arrêts de bus ===
  async getBusStops(): Promise<BusStop[]> {
    const url = buildSTARUrl(API_CONFIG.STAR.BUS_STOPS, 2000);
    const data = await this.fetchWithCache<OpenDataSoftResponse<Record<string, unknown>>>(url, 'bus-stops');
    
    if (!data?.results) {
      console.warn('[BusStops] No data received from API');
      return [];
    }
    
    console.log('[BusStops] Received', data.results.length, 'stops from API');

    return data.results
      .map((record): BusStop | null => {
        const coords = this.extractCoordinates(record);
        if (!coords) return null;

        return {
          id: String(record.idarret || record.id || ''),
          name: String(record.nom || record.nomarret || ''),
          commune: String(record.commune || record.nomcommune || ''),
          coordinates: coords,
          lines: record.lignes ? String(record.lignes).split(/[,;]/).map(l => l.trim()) : undefined,
        };
      })
      .filter((s): s is BusStop => s !== null);
  }

  // === Stations de métro (topologie) ===
  async getMetroStations(): Promise<MetroStop[]> {
    // Utilise le manager centralisé
    const data = await this.fetchFromManager<Record<string, unknown>>('star-metro-stops-topo');

    if (!data?.results) {
      console.warn('[MetroStations] No data received from API');
      return [];
    }

    console.log('[MetroStations] Received', data.results.length, 'stations from API');

    return data.results
      .map((record): MetroStop | null => {
        const coords = this.extractCoordinates(record);
        if (!coords) return null;

        return {
          id: String(record.idstation || record.id || ''),
          name: String(record.nom || record.nomstation || ''),
          stationId: String(record.idstation || ''),
          coordinates: coords,
          lineId: String(record.idligne || ''),
        };
      })
      .filter((s): s is MetroStop => s !== null);
  }

  // === Communes de Rennes Métropole ===
  async getCommunesMetropole(): Promise<Commune[]> {
    // Utilise le manager centralisé
    const data = await this.fetchFromManager<Record<string, unknown>>('star-communes');

    if (!data?.results) {
      console.warn('[Communes] No data received from API');
      return [];
    }

    console.log('[Communes] Received', data.results.length, 'communes from API');

    return data.results.map((record): Commune => ({
      id: String(record.code || record.codeinsee || record.id || ''),
      name: String(record.nom || record.nomcommune || ''),
      code: String(record.code || record.codeinsee || ''),
      population: record.population ? Number(record.population) : undefined,
      geometry: record.geo_shape as GeoJSON.Polygon | GeoJSON.MultiPolygon | undefined,
    }));
  }

  // === Données de fréquentation ===
  async getFrequentationData(limit: number = 100): Promise<FrequentationData[]> {
    const url = buildSTARUrl(API_CONFIG.STAR.FREQUENTATION_MAX_LIGNE, limit);
    const data = await this.fetchWithCache<OpenDataSoftResponse<Record<string, unknown>>>(url, 'frequentation');
    
    if (!data?.results) {
      console.warn('[Frequentation] No data received from API');
      return [];
    }
    
    console.log('[Frequentation] Received', data.results.length, 'records from API');

    return data.results.map((record): FrequentationData => {
      // Déterminer le niveau de fréquentation
      const niveauStr = String(record.niveau || record.niveaufrequentation || '').toLowerCase();
      let level: 'faible' | 'moyenne' | 'haute' | 'très haute' = 'moyenne';
      if (niveauStr.includes('faible') || niveauStr.includes('low')) {
        level = 'faible';
      } else if (niveauStr.includes('haute') || niveauStr.includes('high')) {
        level = niveauStr.includes('très') ? 'très haute' : 'haute';
      }

      return {
        lineId: String(record.idligne || record.ligne || ''),
        lineName: String(record.nomligne || record.nomcourtligne || ''),
        date: record.date ? new Date(String(record.date)) : new Date(),
        period: String(record.periode || record.tranchehoraire || ''),
        level,
        value: record.valeur ? Number(record.valeur) : undefined,
      };
    });
  }

  // === Tarifs STAR ===
  async getTarifs(): Promise<Tarif[]> {
    const url = buildSTARUrl(API_CONFIG.STAR.TARIFS, 300);
    const data = await this.fetchWithCache<OpenDataSoftResponse<Record<string, unknown>>>(url, 'tarifs');
    
    if (!data?.results) {
      console.warn('[Tarifs] No data received from API');
      return [];
    }
    
    console.log('[Tarifs] Received', data.results.length, 'tarifs from API');

    return data.results.map((record): Tarif => ({
      id: String(record.idtarif || record.id || Math.random().toString(36).substr(2, 9)),
      name: String(record.nom || record.libelle || ''),
      description: String(record.description || ''),
      price: Number(record.prix || record.tarif || 0),
      validity: record.validite ? String(record.validite) : undefined,
      category: record.categorie ? String(record.categorie) : undefined,
    }));
  }

  // === Données supplémentaires Rennes Métropole ===
  async getEquipmentCount(dataset: string): Promise<number> {
    const url = buildRennesMetropoleUrl(dataset, 1);
    const data = await this.fetchWithCache<OpenDataSoftResponse<unknown>>(url, `count-${dataset}`);
    return data?.total_count ?? 0;
  }

  // === Statistiques globales du dashboard ===
  async getDashboardStats(): Promise<DashboardStats> {
    const [veloStations, parkings, busPositions, alerts] = await Promise.all([
      this.getVeloStations(),
      this.getParkingRelais(),
      this.getBusPositions(),
      this.getTrafficAlerts(),
    ]);

    const bikesAvailable = veloStations.reduce((sum, s) => sum + s.bikesAvailable, 0);
    const bikeStationsActive = veloStations.filter(s => s.status === 'OUVERT').length;

    const parkingSpacesAvailable = parkings.reduce((sum, p) => sum + p.availableSpaces, 0);
    const totalParkingCapacity = parkings.reduce((sum, p) => sum + p.capacityTotal, 0);
    const parkingOccupancyRate = totalParkingCapacity > 0 
      ? Math.round(((totalParkingCapacity - parkingSpacesAvailable) / totalParkingCapacity) * 100)
      : 0;

    return {
      transport: {
        bikesAvailable,
        bikeStationsActive,
        parkingSpacesAvailable,
        parkingOccupancyRate,
        busesInService: busPositions.length,
        activeAlerts: alerts.length,
      },
      lastUpdate: new Date(),
    };
  }

  // === Vérifier le statut de toutes les APIs ===
  // Délégué au apiConnectionManager centralisé
  async checkAllAPIStatuses() {
    await apiManager.checkAllEndpoints();
    return apiManager.getHealthStatus();
  }

  // === Obtenir le dernier statut des APIs ===
  // Délégué au apiConnectionManager centralisé
  getAPIStatuses() {
    return apiManager.getHealthStatus();
  }

  // === Vider le cache ===
  // Délégué au apiConnectionManager centralisé
  clearCache(): void {
    apiManager.clearCache();
  }
}

// === Export singleton ===
export const territorialDataService = new TerritorialDataService();
export default territorialDataService;

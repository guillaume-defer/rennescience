import { useState, useEffect, useCallback, useRef } from 'react';
import { territorialDataService } from '../services/territorialDataService';
import type {
  VeloStation,
  ParkingRelais,
  BusPosition,
  TrafficAlert,
  DashboardStats,
  MetroLine,
  BusLine,
  MetroStop,
  BusStop,
  Commune,
} from '../types';
import { REFRESH_INTERVALS } from '../config/apiConfig';
import { logger } from '../utils/logger';

// === Types pour le hook ===
interface UseRealtimeDataResult {
  veloStations: VeloStation[];
  parkings: ParkingRelais[];
  busPositions: BusPosition[];
  alerts: TrafficAlert[];
  metroLines: MetroLine[];
  busLines: BusLine[];
  metroStations: MetroStop[];
  busStops: BusStop[];
  communes: Commune[];
  stats: DashboardStats | null;
  loading: boolean;
  error: string | null;
  lastUpdate: Date | null;
  refresh: () => Promise<void>;
}

// === Hook principal ===
export function useRealtimeData(autoRefresh: boolean = true): UseRealtimeDataResult {
  const [veloStations, setVeloStations] = useState<VeloStation[]>([]);
  const [parkings, setParkings] = useState<ParkingRelais[]>([]);
  const [busPositions, setBusPositions] = useState<BusPosition[]>([]);
  const [alerts, setAlerts] = useState<TrafficAlert[]>([]);
  const [metroLines, setMetroLines] = useState<MetroLine[]>([]);
  const [busLines, setBusLines] = useState<BusLine[]>([]);
  const [metroStations, setMetroStations] = useState<MetroStop[]>([]);
  const [busStops, setBusStops] = useState<BusStop[]>([]);
  const [communes, setCommunes] = useState<Commune[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  
  const intervalRef = useRef<number | null>(null);
  const staticDataLoadedRef = useRef(false);
  const staticRetryRef = useRef(0);

  // === Chargement des données statiques (une seule fois) ===
  const loadStaticData = useCallback(async () => {
    if (staticDataLoadedRef.current) return;

    try {
      const [metro, bus, metroStops, busStopsData, communesData] = await Promise.all([
        territorialDataService.getMetroLines(),
        territorialDataService.getBusLines(),
        territorialDataService.getMetroStations(),
        territorialDataService.getBusStops(),
        territorialDataService.getCommunesMetropole(),
      ]);

      // Vérifier qu'on a des données critiques avant de marquer comme chargé
      const hasMinimalData =
        metro.length > 0 || metroStops.length > 0 || communesData.length > 0 || bus.length > 0;
      if (!hasMinimalData) {
        staticRetryRef.current += 1;
        if (staticRetryRef.current >= 3) {
          logger.warn('[StaticData] No data after 3 attempts, marking as loaded to prevent silent loop');
          staticDataLoadedRef.current = true;
        } else {
          logger.warn('[StaticData] No data received, will retry on next refresh');
        }
        return;
      }

      setMetroLines(metro);
      setBusLines(bus);
      setMetroStations(metroStops);
      setBusStops(busStopsData);
      setCommunes(communesData);
      staticDataLoadedRef.current = true;
      logger.debug('[StaticData] Loaded:', {
        metroLines: metro.length,
        busLines: bus.length,
        metroStations: metroStops.length,
        busStops: busStopsData.length,
        communes: communesData.length,
      });
    } catch (err) {
      logger.error('[StaticData] Error loading, will retry:', err);
      // Ne PAS marquer comme chargé - permettre retry au prochain refresh
    }
  }, []);

  // === Chargement des données temps réel ===
  const loadRealtimeData = useCallback(async () => {
    try {
      const [velo, parking, buses, trafficAlerts, dashboardStats] = await Promise.all([
        territorialDataService.getVeloStations(),
        territorialDataService.getParkingRelais(),
        territorialDataService.getBusPositions(),
        territorialDataService.getTrafficAlerts(),
        territorialDataService.getDashboardStats(),
      ]);

      setVeloStations(velo);
      setParkings(parking);
      setBusPositions(buses);
      setAlerts(trafficAlerts);
      setStats(dashboardStats);
      setLastUpdate(new Date());
      setError(null);
    } catch (err) {
      logger.error('[RealtimeData] Error loading realtime data:', err);
      setError('Erreur de chargement des données');
    }
  }, []);

  // === Fonction de rafraîchissement complète ===
  const refresh = useCallback(async () => {
    setLoading(true);
    await Promise.all([loadStaticData(), loadRealtimeData()]);
    setLoading(false);
  }, [loadStaticData, loadRealtimeData]);

  // === Effet initial et rafraîchissement automatique ===
  useEffect(() => {
    refresh();

    if (autoRefresh) {
      // Rafraîchissement des données temps réel toutes les 30 secondes
      intervalRef.current = window.setInterval(() => {
        loadRealtimeData();
      }, REFRESH_INTERVALS.REALTIME);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [refresh, autoRefresh]);

  return {
    veloStations,
    parkings,
    busPositions,
    alerts,
    metroLines,
    busLines,
    metroStations,
    busStops,
    communes,
    stats,
    loading,
    error,
    lastUpdate,
    refresh,
  };
}


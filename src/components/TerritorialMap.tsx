import { useEffect, useRef, useState, useCallback } from 'react';
import maplibregl from 'maplibre-gl';

// === Security: HTML escaping to prevent XSS in popup content ===
function escapeHTML(value: string | number | null | undefined): string {
  if (value == null) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Validates CSS color value to prevent CSS injection in style attributes
function sanitizeCSSColor(color: string): string {
  return /^#[0-9a-fA-F]{3,8}$/.test(color) ? color : '#808080';
}
import {
  Layers,
  Bike,
  Car,
  Bus,
  Train,
  Eye,
  EyeOff,
  ZoomIn,
  ZoomOut,
  Locate,
  Navigation,
  AlertCircle,
  Box,
  Map as MapIcon,
  MapPin,
} from 'lucide-react';
import { MAP_STYLES, RENNES_CENTER } from '../config/apiConfig';
import type { 
  VeloStation, 
  ParkingRelais, 
  BusPosition, 
  MetroLine, 
  BusLine,
  MetroStop,
  Commune,
  TrafficAlert 
} from '../types';

interface TerritorialMapProps {
  veloStations: VeloStation[];
  parkings: ParkingRelais[];
  busPositions: BusPosition[];
  metroLines: MetroLine[];
  busLines: BusLine[];
  metroStations: MetroStop[];
  communes: Commune[];
  alerts: TrafficAlert[];
}

interface LayerVisibility {
  velos: boolean;
  parkings: boolean;
  buses: boolean;
  metro: boolean;
  busLines: boolean;
  metroStations: boolean;
  communes: boolean;
}

export default function TerritorialMap({
  veloStations,
  parkings,
  busPositions,
  metroLines,
  busLines,
  metroStations,
  communes,
  alerts,
}: TerritorialMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const veloMarkersRef = useRef<maplibregl.Marker[]>([]);
  const parkingMarkersRef = useRef<maplibregl.Marker[]>([]);
  const busMarkersRef = useRef<maplibregl.Marker[]>([]);
  const metroStationMarkersRef = useRef<maplibregl.Marker[]>([]);
  const userLocationMarkerRef = useRef<maplibregl.Marker | null>(null);
  
  const [mapLoaded, setMapLoaded] = useState(false);
  const [layersOpen, setLayersOpen] = useState(false);
  const [is3D, setIs3D] = useState(true);
  const [isLocating, setIsLocating] = useState(false);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [dataStatus, setDataStatus] = useState({
    velos: 0,
    parkings: 0,
    buses: 0,
    metro: 0,
    busLines: 0,
    metroStations: 0,
    communes: 0,
  });
  
  const [layerVisibility, setLayerVisibility] = useState<LayerVisibility>({
    velos: true,
    parkings: true,
    buses: true,
    metro: true,
    busLines: false, // Désactivé par défaut pour les performances (beaucoup de lignes)
    metroStations: true,
    communes: true,
  });

  // Initialisation de la carte
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    console.log('[Map] Initializing MapLibre...');

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: MAP_STYLES.DARK,
      center: RENNES_CENTER,
      zoom: 13,
      pitch: 45, // Vue 3D par défaut
      bearing: -17.6,
      antialias: true,
      attributionControl: false,
    });

    map.current.addControl(
      new maplibregl.AttributionControl({ compact: true }),
      'bottom-left'
    );

    map.current.addControl(
      new maplibregl.NavigationControl({ showCompass: true, visualizePitch: true }),
      'top-right'
    );

    map.current.on('load', () => {
      console.log('[Map] Map loaded successfully');
      setMapLoaded(true);
    });

    map.current.on('error', (e) => {
      console.error('[Map] Map error:', e);
    });

    return () => {
      console.log('[Map] Cleaning up...');
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Mise à jour des couches métro
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    console.log('[Metro] Processing', metroLines.length, 'lines');

    if (metroLines.length === 0) {
      setDataStatus(prev => ({ ...prev, metro: 0 }));
      return;
    }

    const validLines = metroLines.filter(line => line.geometry);
    console.log('[Metro] Valid lines with geometry:', validLines.length);

    if (validLines.length === 0) return;

    const metroGeoJSON: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features: validLines.map(line => ({
        type: 'Feature' as const,
        properties: {
          id: line.id,
          name: line.name,
          color: line.color,
        },
        geometry: line.geometry,
      })),
    };

    try {
      // Reuse existing source via setData() to avoid layer removal/re-add
      if (map.current.getSource('metro-source')) {
        (map.current.getSource('metro-source') as maplibregl.GeoJSONSource).setData(metroGeoJSON);
      } else {
        map.current.addSource('metro-source', {
          type: 'geojson',
          data: metroGeoJSON,
        });

        map.current.addLayer({
          id: 'metro-lines',
          type: 'line',
          source: 'metro-source',
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
            visibility: layerVisibility.metro ? 'visible' : 'none',
          },
          paint: {
            'line-color': ['get', 'color'],
            'line-width': 5,
            'line-opacity': 0.9,
          },
        });
      }

      setDataStatus(prev => ({ ...prev, metro: validLines.length }));
      console.log('[Metro] Layer updated successfully');
    } catch (e) {
      console.error('[Metro] Error updating layer:', e);
    }

  }, [mapLoaded, metroLines]);

  // Mise à jour visibilité métro
  useEffect(() => {
    if (!map.current || !mapLoaded) return;
    try {
      if (map.current.getLayer('metro-lines')) {
        map.current.setLayoutProperty(
          'metro-lines',
          'visibility',
          layerVisibility.metro ? 'visible' : 'none'
        );
      }
    } catch (e) {
      console.warn('[Metro] Visibility error:', e);
    }
  }, [mapLoaded, layerVisibility.metro]);

  // === Mise à jour des couches lignes de bus ===
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    console.log('[BusLines] Processing', busLines.length, 'lines');

    if (busLines.length === 0) {
      setDataStatus(prev => ({ ...prev, busLines: 0 }));
      return;
    }

    const validLines = busLines.filter(line => line.geometry);
    console.log('[BusLines] Valid lines with geometry:', validLines.length);

    if (validLines.length === 0) return;

    const busLinesGeoJSON: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features: validLines.map(line => ({
        type: 'Feature' as const,
        properties: {
          id: line.id,
          name: line.name,
          shortName: line.shortName,
          color: line.color.startsWith('#') ? line.color : `#${line.color}`,
        },
        geometry: line.geometry,
      })),
    };

    try {
      // Reuse existing source via setData() to avoid layer removal/re-add
      if (map.current.getSource('bus-lines-source')) {
        (map.current.getSource('bus-lines-source') as maplibregl.GeoJSONSource).setData(busLinesGeoJSON);
        setDataStatus(prev => ({ ...prev, busLines: validLines.length }));
        console.log('[BusLines] Layer data updated via setData');
        return;
      }

      map.current.addSource('bus-lines-source', {
        type: 'geojson',
        data: busLinesGeoJSON,
      });

      // Outline pour la lisibilité
      map.current.addLayer({
        id: 'bus-lines-outline',
        type: 'line',
        source: 'bus-lines-source',
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
          visibility: layerVisibility.busLines ? 'visible' : 'none',
        },
        paint: {
          'line-color': '#000000',
          'line-width': 4,
          'line-opacity': 0.4,
        },
      });

      // Ligne principale avec couleur
      map.current.addLayer({
        id: 'bus-lines',
        type: 'line',
        source: 'bus-lines-source',
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
          visibility: layerVisibility.busLines ? 'visible' : 'none',
        },
        paint: {
          'line-color': ['get', 'color'],
          'line-width': 2.5,
          'line-opacity': 0.8,
        },
      });

      // Ajouter popup au clic sur les lignes de bus
      const handleBusLineClick = (e: maplibregl.MapLayerMouseEvent) => {
        if (!map.current || !e.features || e.features.length === 0) return;
        const props = e.features[0].properties;
        if (!props) return;

        new maplibregl.Popup({ closeButton: false, className: 'palantir-popup' })
          .setLngLat(e.lngLat)
          .setHTML(`
            <div style="padding: 12px; min-width: 160px; background: #151b23; border-radius: 8px;">
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
                <div style="
                  width: 24px;
                  height: 24px;
                  border-radius: 4px;
                  background: ${sanitizeCSSColor(props.color)};
                  display: flex;
                  align-items: center;
                  justify-content: center;
                ">
                  <span style="color: white; font-weight: bold; font-size: 10px;">${escapeHTML(props.shortName)}</span>
                </div>
                <h4 style="font-weight: 600; color: #e6edf3; font-size: 14px;">Ligne ${escapeHTML(props.shortName)}</h4>
              </div>
              <p style="font-size: 12px; color: #7d8590;">${escapeHTML(props.name)}</p>
            </div>
          `)
          .addTo(map.current);
      };

      const handleBusLineMouseEnter = () => {
        if (map.current) map.current.getCanvas().style.cursor = 'pointer';
      };

      const handleBusLineMouseLeave = () => {
        if (map.current) map.current.getCanvas().style.cursor = '';
      };

      map.current.on('click', 'bus-lines', handleBusLineClick);
      map.current.on('mouseenter', 'bus-lines', handleBusLineMouseEnter);
      map.current.on('mouseleave', 'bus-lines', handleBusLineMouseLeave);

      setDataStatus(prev => ({ ...prev, busLines: validLines.length }));
      console.log('[BusLines] Layer added successfully');

      // Cleanup
      return () => {
        if (map.current) {
          map.current.off('click', 'bus-lines', handleBusLineClick);
          map.current.off('mouseenter', 'bus-lines', handleBusLineMouseEnter);
          map.current.off('mouseleave', 'bus-lines', handleBusLineMouseLeave);
        }
      };
    } catch (e) {
      console.error('[BusLines] Error adding layer:', e);
    }

  }, [mapLoaded, busLines]);

  // Mise à jour visibilité lignes de bus
  useEffect(() => {
    if (!map.current || !mapLoaded) return;
    try {
      if (map.current.getLayer('bus-lines')) {
        map.current.setLayoutProperty(
          'bus-lines',
          'visibility',
          layerVisibility.busLines ? 'visible' : 'none'
        );
      }
      if (map.current.getLayer('bus-lines-outline')) {
        map.current.setLayoutProperty(
          'bus-lines-outline',
          'visibility',
          layerVisibility.busLines ? 'visible' : 'none'
        );
      }
    } catch (e) {
      console.warn('[BusLines] Visibility error:', e);
    }
  }, [mapLoaded, layerVisibility.busLines]);

  // Fonction utilitaire pour nettoyer les marqueurs
  const clearMarkers = (markers: maplibregl.Marker[]) => {
    markers.forEach(m => m.remove());
    return [];
  };

  // Mise à jour des marqueurs vélos
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    console.log('[Velos] Processing', veloStations.length, 'stations, visibility:', layerVisibility.velos);

    // Nettoyer les anciens marqueurs
    veloMarkersRef.current = clearMarkers(veloMarkersRef.current);

    if (!layerVisibility.velos || veloStations.length === 0) {
      setDataStatus(prev => ({ ...prev, velos: 0 }));
      return;
    }

    // Ne plus filtrer par status - afficher toutes les stations
    console.log('[Velos] Total stations:', veloStations.length);
    const openStations = veloStations.filter(s => s.status === 'OUVERT');
    console.log('[Velos] Open stations:', openStations.length);

    // Afficher TOUTES les stations (même fermées, avec couleur différente)
    veloStations.forEach(station => {
      // Vérifier les coordonnées
      if (!station.coordinates || 
          !Array.isArray(station.coordinates) || 
          station.coordinates.length !== 2 ||
          isNaN(station.coordinates[0]) || 
          isNaN(station.coordinates[1])) {
        console.warn('[Velos] Invalid coordinates for station:', station.name);
        return;
      }

      const el = document.createElement('div');
      el.className = 'velo-marker';
      el.style.cssText = 'cursor: pointer;';
      
      // Couleur selon le statut
      const isOpen = station.status === 'OUVERT';
      const bgColor = isOpen ? 'rgba(34, 197, 94, 0.9)' : 'rgba(107, 114, 128, 0.9)';
      const borderColor = isOpen ? '#4ade80' : '#9ca3af';
      const textColor = isOpen ? '#4ade80' : '#9ca3af';
      
      el.innerHTML = `
        <div style="
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: ${bgColor};
          border: 2px solid ${borderColor};
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          transition: transform 0.2s;
        ">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5">
            <circle cx="5" cy="18" r="3"/>
            <circle cx="19" cy="18" r="3"/>
            <path d="M12 18V9l-5 9h10l-5-9"/>
          </svg>
          <span style="
            position: absolute;
            top: -6px;
            right: -6px;
            width: 20px;
            height: 20px;
            background: #151b23;
            border: 1px solid ${borderColor};
            border-radius: 50%;
            font-size: 10px;
            font-weight: bold;
            color: ${textColor};
            display: flex;
            align-items: center;
            justify-content: center;
          ">${station.bikesAvailable}</span>
        </div>
      `;

      el.addEventListener('mouseenter', () => {
        el.firstElementChild?.setAttribute('style', 
          el.firstElementChild.getAttribute('style') + 'transform: scale(1.15);'
        );
      });
      el.addEventListener('mouseleave', () => {
        el.firstElementChild?.setAttribute('style', 
          el.firstElementChild.getAttribute('style')?.replace('transform: scale(1.15);', '') || ''
        );
      });

      const popup = new maplibregl.Popup({
        offset: 25,
        closeButton: false,
        className: 'palantir-popup'
      }).setHTML(`
        <div style="padding: 12px; min-width: 200px; background: #151b23; border-radius: 8px;">
          <h4 style="font-weight: 600; color: #e6edf3; font-size: 14px; margin-bottom: 8px;">${escapeHTML(station.name)}</h4>
          <div style="display: flex; flex-direction: column; gap: 6px; font-size: 12px;">
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #7d8590;">Vélos disponibles</span>
              <span style="font-family: monospace; font-weight: 600; color: #4ade80;">${station.bikesAvailable}</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #7d8590;">Places libres</span>
              <span style="font-family: monospace; font-weight: 600; color: #e6edf3;">${station.slotsAvailable}</span>
            </div>
            <div style="width: 100%; height: 6px; background: #21262d; border-radius: 3px; margin-top: 4px;">
              <div style="height: 6px; background: #22c55e; border-radius: 3px; width: ${station.totalSlots > 0 ? (station.bikesAvailable / station.totalSlots) * 100 : 0}%;"></div>
            </div>
          </div>
        </div>
      `);

      try {
        const marker = new maplibregl.Marker({ element: el })
          .setLngLat(station.coordinates)
          .setPopup(popup)
          .addTo(map.current!);

        veloMarkersRef.current.push(marker);
      } catch (e) {
        console.error('[Velos] Error adding marker:', e);
      }
    });

    setDataStatus(prev => ({ ...prev, velos: veloMarkersRef.current.length }));
    console.log('[Velos] Added', veloMarkersRef.current.length, 'markers');

  }, [mapLoaded, veloStations, layerVisibility.velos]);

  // Mise à jour des marqueurs parkings
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    console.log('[Parkings] Processing', parkings.length, 'parkings, visibility:', layerVisibility.parkings);

    parkingMarkersRef.current = clearMarkers(parkingMarkersRef.current);

    if (!layerVisibility.parkings || parkings.length === 0) {
      setDataStatus(prev => ({ ...prev, parkings: 0 }));
      return;
    }

    // Ne plus filtrer par status - afficher tous les parkings
    console.log('[Parkings] Total parkings:', parkings.length);
    const openParkings = parkings.filter(p => p.status === 'OUVERT');
    console.log('[Parkings] Open parkings:', openParkings.length);

    // Afficher TOUS les parkings
    parkings.forEach(parking => {
      if (!parking.coordinates || 
          !Array.isArray(parking.coordinates) || 
          parking.coordinates.length !== 2 ||
          isNaN(parking.coordinates[0]) || 
          isNaN(parking.coordinates[1])) {
        console.warn('[Parkings] Invalid coordinates for parking:', parking.name);
        return;
      }

      const fillLevel = parking.capacityTotal > 0 
        ? parking.availableSpaces / parking.capacityTotal 
        : 0;
      
      const colors = fillLevel > 0.3 
        ? { bg: 'rgba(59, 130, 246, 0.9)', border: '#60a5fa', text: '#60a5fa' }
        : fillLevel > 0.1 
          ? { bg: 'rgba(249, 115, 22, 0.9)', border: '#fb923c', text: '#fb923c' }
          : { bg: 'rgba(239, 68, 68, 0.9)', border: '#f87171', text: '#f87171' };

      const el = document.createElement('div');
      el.className = 'parking-marker';
      el.style.cssText = 'cursor: pointer;';
      el.innerHTML = `
        <div style="
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 8px;
          background: ${colors.bg};
          border: 2px solid ${colors.border};
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          transition: transform 0.2s;
        ">
          <span style="color: white; font-weight: bold; font-size: 11px;">P+R</span>
          <span style="
            position: absolute;
            top: -6px;
            right: -6px;
            min-width: 22px;
            height: 20px;
            padding: 0 4px;
            background: #151b23;
            border: 1px solid ${colors.border};
            border-radius: 10px;
            font-size: 10px;
            font-weight: bold;
            color: ${colors.text};
            display: flex;
            align-items: center;
            justify-content: center;
          ">${parking.availableSpaces}</span>
        </div>
      `;

      const popup = new maplibregl.Popup({
        offset: 25,
        closeButton: false,
        className: 'palantir-popup'
      }).setHTML(`
        <div style="padding: 12px; min-width: 220px; background: #151b23; border-radius: 8px;">
          <h4 style="font-weight: 600; color: #e6edf3; font-size: 14px; margin-bottom: 8px;">${escapeHTML(parking.name)}</h4>
          <div style="display: flex; flex-direction: column; gap: 6px; font-size: 12px;">
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #7d8590;">Places disponibles</span>
              <span style="font-family: monospace; font-weight: 600; color: ${colors.text};">${parking.availableSpaces}</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #7d8590;">Capacité totale</span>
              <span style="font-family: monospace; font-weight: 600; color: #e6edf3;">${parking.capacityTotal}</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #7d8590;">Taux d'occupation</span>
              <span style="font-family: monospace; font-weight: 600; color: ${colors.text};">${parking.occupancyRate}%</span>
            </div>
            <div style="width: 100%; height: 6px; background: #21262d; border-radius: 3px; margin-top: 4px;">
              <div style="height: 6px; background: ${colors.border}; border-radius: 3px; width: ${parking.occupancyRate}%;"></div>
            </div>
          </div>
        </div>
      `);

      try {
        const marker = new maplibregl.Marker({ element: el })
          .setLngLat(parking.coordinates)
          .setPopup(popup)
          .addTo(map.current!);

        parkingMarkersRef.current.push(marker);
      } catch (e) {
        console.error('[Parkings] Error adding marker:', e);
      }
    });

    setDataStatus(prev => ({ ...prev, parkings: parkingMarkersRef.current.length }));
    console.log('[Parkings] Added', parkingMarkersRef.current.length, 'markers');

  }, [mapLoaded, parkings, layerVisibility.parkings]);

  // Mise à jour des marqueurs bus
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    console.log('[Bus] Processing', busPositions.length, 'buses, visibility:', layerVisibility.buses);

    busMarkersRef.current = clearMarkers(busMarkersRef.current);

    if (!layerVisibility.buses || busPositions.length === 0) {
      setDataStatus(prev => ({ ...prev, buses: 0 }));
      return;
    }

    // Create lookup map for line colors
    const lineColorMap = new Map<string, string>();
    busLines.forEach(line => {
      lineColorMap.set(line.id, line.color);
      lineColorMap.set(line.shortName, line.color);
      lineColorMap.set(line.name, line.color);
    });

    // Limiter le nombre de bus pour les performances
    const busesToShow = busPositions.slice(0, 150);

    busesToShow.forEach(bus => {
      if (!bus.coordinates ||
          !Array.isArray(bus.coordinates) ||
          bus.coordinates.length !== 2 ||
          isNaN(bus.coordinates[0]) ||
          isNaN(bus.coordinates[1])) {
        return;
      }

      // Get line color from map, default to orange
      const lineColor = lineColorMap.get(bus.lineId) ||
                       lineColorMap.get(bus.lineName) ||
                       '#f59e0b';
      const lineName = escapeHTML((bus.lineName || bus.lineId || '?').slice(0, 4));

      const el = document.createElement('div');
      el.className = 'bus-marker';
      el.style.cssText = 'cursor: pointer; position: relative;';

      // Bus tracker style: circle indicator + pill badge with line number
      el.innerHTML = `
        <div style="
          display: flex;
          flex-direction: column;
          align-items: center;
          transform: translateY(-50%);
        ">
          <div style="
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background: ${sanitizeCSSColor(lineColor)};
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.4);
            margin-bottom: 2px;
          "></div>
          <div style="
            background: ${sanitizeCSSColor(lineColor)};
            color: white;
            font-size: 11px;
            font-weight: 700;
            padding: 2px 6px;
            border-radius: 10px;
            box-shadow: 0 2px 6px rgba(0,0,0,0.35);
            white-space: nowrap;
            text-shadow: 0 1px 2px rgba(0,0,0,0.3);
            border: 1px solid rgba(255,255,255,0.3);
          ">${lineName}</div>
        </div>
      `;

      const delayText = bus.delay !== undefined
        ? bus.delay > 0
          ? `<span style="color: #fb923c;">+${Math.round(bus.delay / 60)}min</span>`
          : `<span style="color: #4ade80;">À l'heure</span>`
        : '';

      const popup = new maplibregl.Popup({
        offset: 25,
        closeButton: false,
        className: 'palantir-popup'
      }).setHTML(`
        <div style="padding: 10px; min-width: 160px; background: #151b23; border-radius: 8px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="
              background: ${sanitizeCSSColor(lineColor)};
              color: white;
              font-weight: 700;
              padding: 2px 8px;
              border-radius: 8px;
              font-size: 12px;
            ">${lineName}</span>
            <span style="color: #e6edf3; font-size: 13px; font-weight: 500;">Bus</span>
          </div>
          <p style="color: #7d8590; font-size: 12px; margin-top: 6px;">→ ${escapeHTML(bus.destination || 'Destination inconnue')}</p>
          ${delayText ? `<p style="font-size: 11px; margin-top: 4px;">${delayText}</p>` : ''}
        </div>
      `);

      try {
        const marker = new maplibregl.Marker({ element: el, anchor: 'bottom' })
          .setLngLat(bus.coordinates)
          .setPopup(popup)
          .addTo(map.current!);

        busMarkersRef.current.push(marker);
      } catch (e) {
        // Silent fail for individual markers
      }
    });

    setDataStatus(prev => ({ ...prev, buses: busMarkersRef.current.length }));
    console.log('[Bus] Added', busMarkersRef.current.length, 'markers');

  }, [mapLoaded, busPositions, busLines, layerVisibility.buses]);

  // Mise à jour des marqueurs stations de métro
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    // Supprimer les anciens marqueurs
    metroStationMarkersRef.current.forEach(m => m.remove());
    metroStationMarkersRef.current = [];

    if (!layerVisibility.metroStations || metroStations.length === 0) {
      setDataStatus(prev => ({ ...prev, metroStations: 0 }));
      return;
    }

    console.log('[MetroStations] Processing', metroStations.length, 'stations');

    metroStations.forEach((station) => {
      if (!station.coordinates || 
          station.coordinates.length !== 2 ||
          isNaN(station.coordinates[0]) || 
          isNaN(station.coordinates[1])) {
        return;
      }

      // Déterminer la couleur basée sur la ligne
      const lineLower = station.lineId.toLowerCase();
      const color = lineLower.includes('a') ? '#d9272e' : 
                    lineLower.includes('b') ? '#0055a4' : '#6b7280';

      const el = document.createElement('div');
      el.className = 'metro-station-marker';
      el.style.cssText = 'cursor: pointer;';
      el.innerHTML = `
        <div style="
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: ${color};
          border: 2px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.2s;
        ">
          <span style="color: white; font-weight: bold; font-size: 10px;">M</span>
        </div>
      `;

      const popup = new maplibregl.Popup({
        offset: 15,
        closeButton: false,
        className: 'palantir-popup'
      }).setHTML(`
        <div style="padding: 12px; min-width: 180px; background: #151b23; border-radius: 8px;">
          <h4 style="font-weight: 600; color: #e6edf3; font-size: 14px; margin-bottom: 6px;">🚇 ${escapeHTML(station.name)}</h4>
          <div style="display: flex; align-items: center; gap: 6px;">
            <div style="
              width: 20px;
              height: 20px;
              border-radius: 50%;
              background: ${color};
              display: flex;
              align-items: center;
              justify-content: center;
            ">
              <span style="color: white; font-weight: bold; font-size: 10px;">
                ${escapeHTML(station.lineId.toUpperCase().replace('LIGNE_', ''))}
              </span>
            </div>
            <span style="color: #7d8590; font-size: 12px;">Station Métro</span>
          </div>
        </div>
      `);

      try {
        const marker = new maplibregl.Marker({ element: el })
          .setLngLat(station.coordinates)
          .setPopup(popup)
          .addTo(map.current!);

        metroStationMarkersRef.current.push(marker);
      } catch (e) {
        // Silent fail for individual markers
      }
    });

    setDataStatus(prev => ({ ...prev, metroStations: metroStationMarkersRef.current.length }));
    console.log('[MetroStations] Added', metroStationMarkersRef.current.length, 'markers');

  }, [mapLoaded, metroStations, layerVisibility.metroStations]);

  // Mise à jour des polygones des communes
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    const sourceId = 'communes-source';
    const layerId = 'communes-fill';
    const lineLayerId = 'communes-line';

    if (!layerVisibility.communes || communes.length === 0) {
      setDataStatus(prev => ({ ...prev, communes: 0 }));
      return;
    }

    console.log('[Communes] Processing', communes.length, 'communes');

    // Créer le GeoJSON
    const geojson: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features: communes
        .filter(c => c.geometry)
        .map(commune => ({
          type: 'Feature' as const,
          geometry: commune.geometry!,
          properties: {
            id: commune.id,
            name: commune.name,
            code: commune.code,
            population: commune.population,
          },
        })),
    };

    if (geojson.features.length === 0) {
      setDataStatus(prev => ({ ...prev, communes: 0 }));
      return;
    }

    try {
      // Reuse existing source via setData() to avoid layer removal/re-add
      if (map.current.getSource(sourceId)) {
        (map.current.getSource(sourceId) as maplibregl.GeoJSONSource).setData(geojson);
        setDataStatus(prev => ({ ...prev, communes: geojson.features.length }));
        console.log('[Communes] Layer data updated via setData');
        return;
      }

      map.current.addSource(sourceId, {
        type: 'geojson',
        data: geojson,
      });

      // Couche de remplissage
      map.current.addLayer({
        id: layerId,
        type: 'fill',
        source: sourceId,
        paint: {
          'fill-color': '#06b6d4',
          'fill-opacity': 0.1,
        },
      });

      // Couche de contour
      map.current.addLayer({
        id: lineLayerId,
        type: 'line',
        source: sourceId,
        paint: {
          'line-color': '#06b6d4',
          'line-width': 1.5,
          'line-opacity': 0.6,
        },
      });

      // Event handlers - stockés pour cleanup
      const handleMouseEnter = () => {
        if (map.current) {
          map.current.getCanvas().style.cursor = 'pointer';
        }
      };

      const handleMouseLeave = () => {
        if (map.current) {
          map.current.getCanvas().style.cursor = '';
        }
      };

      const handleClick = (e: maplibregl.MapLayerMouseEvent) => {
        if (!map.current || !e.features || e.features.length === 0) return;
        const props = e.features[0].properties;
        if (!props) return;

        new maplibregl.Popup({ closeButton: false, className: 'palantir-popup' })
          .setLngLat(e.lngLat)
          .setHTML(`
            <div style="padding: 12px; min-width: 160px; background: #151b23; border-radius: 8px;">
              <h4 style="font-weight: 600; color: #e6edf3; font-size: 14px; margin-bottom: 6px;">📍 ${escapeHTML(props.name)}</h4>
              <div style="font-size: 12px; color: #7d8590;">
                Code INSEE: ${escapeHTML(props.code)}
                ${props.population ? `<br/>Population: ${Number(props.population).toLocaleString('fr-FR')}` : ''}
              </div>
            </div>
          `)
          .addTo(map.current);
      };

      map.current.on('mouseenter', layerId, handleMouseEnter);
      map.current.on('mouseleave', layerId, handleMouseLeave);
      map.current.on('click', layerId, handleClick);

      setDataStatus(prev => ({ ...prev, communes: geojson.features.length }));
      console.log('[Communes] Added', geojson.features.length, 'polygons');

      // Cleanup: retirer les event listeners
      return () => {
        if (map.current) {
          map.current.off('mouseenter', layerId, handleMouseEnter);
          map.current.off('mouseleave', layerId, handleMouseLeave);
          map.current.off('click', layerId, handleClick);
        }
      };

    } catch (e) {
      console.error('[Communes] Error adding layer:', e);
    }

  }, [mapLoaded, communes, layerVisibility.communes]);

  // Gestion de la visibilité des couches
  const toggleLayer = useCallback((layer: keyof LayerVisibility) => {
    setLayerVisibility(prev => ({ ...prev, [layer]: !prev[layer] }));
  }, []);

  // Toggle 3D
  const toggle3D = useCallback(() => {
    if (!map.current) return;
    const newIs3D = !is3D;
    setIs3D(newIs3D);
    map.current.easeTo({
      pitch: newIs3D ? 45 : 0,
      bearing: newIs3D ? -17.6 : 0,
      duration: 1000,
    });
  }, [is3D]);

  // Géolocalisation
  const handleLocate = useCallback(() => {
    if (!map.current) return;
    
    if (!navigator.geolocation) {
      alert('La géolocalisation n\'est pas supportée par votre navigateur');
      return;
    }

    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { longitude, latitude } = position.coords;
        const coords: [number, number] = [longitude, latitude];
        
        setUserLocation(coords);
        setIsLocating(false);

        // Supprimer l'ancien marqueur
        if (userLocationMarkerRef.current) {
          userLocationMarkerRef.current.remove();
        }

        // Créer le marqueur de position utilisateur
        const el = document.createElement('div');
        el.innerHTML = `
          <div style="
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: #3b82f6;
            border: 3px solid white;
            box-shadow: 0 0 0 2px #3b82f6, 0 2px 8px rgba(0,0,0,0.3);
          "></div>
        `;

        userLocationMarkerRef.current = new maplibregl.Marker({ element: el })
          .setLngLat(coords)
          .addTo(map.current!);

        map.current!.flyTo({
          center: coords,
          zoom: 15,
          duration: 1500,
        });
      },
      (error) => {
        setIsLocating(false);
        console.error('[Location] Error:', error);
        alert('Impossible d\'obtenir votre position. Vérifiez les permissions.');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  }, []);

  // Contrôles de navigation
  const handleZoomIn = useCallback(() => {
    map.current?.zoomIn();
  }, []);

  const handleZoomOut = useCallback(() => {
    map.current?.zoomOut();
  }, []);

  const handleRecenter = useCallback(() => {
    map.current?.flyTo({ 
      center: RENNES_CENTER, 
      zoom: 13,
      pitch: is3D ? 45 : 0,
      bearing: is3D ? -17.6 : 0,
      duration: 1500,
    });
  }, [is3D]);

  return (
    <div className="relative w-full h-full">
      {/* Map Container */}
      <div ref={mapContainer} className="w-full h-full" />

      {/* Loading Overlay */}
      {!mapLoaded && (
        <div className="absolute inset-0 bg-palantir-bg flex items-center justify-center z-20">
          <div className="text-center">
            <div className="w-10 h-10 border-2 border-palantir-accent border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-sm text-palantir-text-muted">Chargement de la carte...</p>
          </div>
        </div>
      )}

      {/* Layer Control Panel */}
      <div className="absolute top-4 left-4 z-10">
        <div className="card-palantir overflow-hidden">
          <button
            onClick={() => setLayersOpen(prev => !prev)}
            className="flex items-center gap-2 px-4 py-3 w-full hover:bg-palantir-hover transition-colors"
          >
            <Layers className="w-4 h-4 text-palantir-accent" />
            <span className="text-sm font-medium">Couches</span>
            <span className="ml-auto text-xs text-palantir-text-muted">
              {dataStatus.velos + dataStatus.parkings + dataStatus.buses + dataStatus.metro + dataStatus.busLines + dataStatus.metroStations + dataStatus.communes}
            </span>
          </button>

          {layersOpen && (
            <div className="border-t border-palantir-border p-2 space-y-1">
              <LayerToggle
                icon={Train}
                label="Lignes Métro"
                active={layerVisibility.metro}
                onClick={() => toggleLayer('metro')}
                color="text-red-400"
                count={dataStatus.metro}
              />
              <LayerToggle
                icon={MapPin}
                label="Stations Métro"
                active={layerVisibility.metroStations}
                onClick={() => toggleLayer('metroStations')}
                color="text-orange-400"
                count={dataStatus.metroStations}
              />
              <LayerToggle
                icon={Bus}
                label="Lignes de bus"
                active={layerVisibility.busLines}
                onClick={() => toggleLayer('busLines')}
                color="text-amber-400"
                count={dataStatus.busLines}
              />
              <LayerToggle
                icon={Bike}
                label="Vélos"
                active={layerVisibility.velos}
                onClick={() => toggleLayer('velos')}
                color="text-emerald-400"
                count={dataStatus.velos}
              />
              <LayerToggle
                icon={Car}
                label="Parkings P+R"
                active={layerVisibility.parkings}
                onClick={() => toggleLayer('parkings')}
                color="text-blue-400"
                count={dataStatus.parkings}
              />
              <LayerToggle
                icon={Bus}
                label="Bus temps réel"
                active={layerVisibility.buses}
                onClick={() => toggleLayer('buses')}
                color="text-purple-400"
                count={dataStatus.buses}
              />
              <LayerToggle
                icon={MapIcon}
                label="Communes"
                active={layerVisibility.communes}
                onClick={() => toggleLayer('communes')}
                color="text-cyan-400"
                count={dataStatus.communes}
              />
            </div>
          )}
        </div>
      </div>

      {/* Map Controls */}
      <div className="absolute top-20 right-4 z-10 flex flex-col gap-2">
        <button
          onClick={toggle3D}
          className={`card-palantir p-2.5 transition-colors ${is3D ? 'bg-palantir-accent/20 border-palantir-accent' : 'hover:bg-palantir-hover'}`}
          aria-label="Vue 3D"
          title={is3D ? 'Vue 2D' : 'Vue 3D'}
        >
          {is3D ? (
            <Box className="w-4 h-4 text-palantir-accent" />
          ) : (
            <MapIcon className="w-4 h-4 text-palantir-text-muted" />
          )}
        </button>
        <button
          onClick={handleZoomIn}
          className="card-palantir p-2.5 hover:bg-palantir-hover transition-colors"
          aria-label="Zoom avant"
        >
          <ZoomIn className="w-4 h-4 text-palantir-text-muted" />
        </button>
        <button
          onClick={handleZoomOut}
          className="card-palantir p-2.5 hover:bg-palantir-hover transition-colors"
          aria-label="Zoom arrière"
        >
          <ZoomOut className="w-4 h-4 text-palantir-text-muted" />
        </button>
        <button
          onClick={handleRecenter}
          className="card-palantir p-2.5 hover:bg-palantir-hover transition-colors"
          aria-label="Recentrer sur Rennes"
          title="Recentrer sur Rennes"
        >
          <Locate className="w-4 h-4 text-palantir-text-muted" />
        </button>
        <button
          onClick={handleLocate}
          disabled={isLocating}
          className={`card-palantir p-2.5 transition-colors ${
            userLocation ? 'bg-blue-500/20 border-blue-500' : 'hover:bg-palantir-hover'
          } ${isLocating ? 'opacity-50' : ''}`}
          aria-label="Ma position"
          title="Ma position"
        >
          <Navigation className={`w-4 h-4 ${userLocation ? 'text-blue-400' : 'text-palantir-text-muted'} ${isLocating ? 'animate-pulse' : ''}`} />
        </button>
      </div>

      {/* Alerts Banner */}
      {alerts.length > 0 && (
        <div className="absolute bottom-20 left-4 right-20 z-10">
          <div className="card-palantir p-3 border-palantir-warning/30 bg-palantir-warning/5">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-palantir-warning flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-palantir-warning">
                  {alerts.length} alerte{alerts.length > 1 ? 's' : ''} en cours
                </p>
                <p className="text-xs text-palantir-text-muted mt-1 truncate">
                  {alerts[0]?.title}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Bar */}
      <div className="absolute bottom-4 right-4 z-10">
        <div className="card-palantir p-3">
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5" title="Vélos disponibles">
              <Bike className="w-4 h-4 text-emerald-400" />
              <span className="font-mono font-semibold">{veloStations.reduce((s, v) => s + v.bikesAvailable, 0)}</span>
            </div>
            <div className="flex items-center gap-1.5" title="Places P+R disponibles">
              <Car className="w-4 h-4 text-blue-400" />
              <span className="font-mono font-semibold">{parkings.reduce((s, p) => s + p.availableSpaces, 0)}</span>
            </div>
            <div className="flex items-center gap-1.5" title="Bus en circulation">
              <Bus className="w-4 h-4 text-purple-400" />
              <span className="font-mono font-semibold">{busPositions.length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// === Layer Toggle Component ===
interface LayerToggleProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active: boolean;
  onClick: () => void;
  color: string;
  count?: number;
}

function LayerToggle({ icon: Icon, label, active, onClick, color, count }: LayerToggleProps) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors
        ${active ? 'bg-palantir-hover' : 'hover:bg-palantir-hover/50'}
      `}
    >
      <Icon className={`w-4 h-4 ${active ? color : 'text-palantir-text-muted'}`} />
      <span className={`text-sm flex-1 text-left ${active ? 'text-palantir-text' : 'text-palantir-text-muted'}`}>
        {label}
      </span>
      {count !== undefined && (
        <span className={`text-xs font-mono ${active ? 'text-palantir-text' : 'text-palantir-text-muted'}`}>
          {count}
        </span>
      )}
      {active ? (
        <Eye className="w-4 h-4 text-palantir-accent" />
      ) : (
        <EyeOff className="w-4 h-4 text-palantir-text-muted" />
      )}
    </button>
  );
}

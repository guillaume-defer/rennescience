// === DGCL Competencies Types ===
export interface DGCLCompetency {
  id: string;
  name: string;
  category: string;
  icon: string;
  description: string;
  status: 'active' | 'development' | 'unavailable';
  dataSources: DataSourceConfig[];
  indicators: Indicator[];
  requiredConventions?: string[];
}

export interface DataSourceConfig {
  id: string;
  name: string;
  apiUrl: string;
  updateFrequency: 'realtime' | 'hourly' | 'daily' | 'static';
  requiresAuth: boolean;
  authType?: 'basic' | 'bearer' | 'apikey';
  isAvailable: boolean;
  lastUpdate?: Date;
}

export interface Indicator {
  id: string;
  name: string;
  value: number | string | null;
  unit?: string;
  trend?: 'up' | 'down' | 'stable';
  status: 'live' | 'loading' | 'error' | 'unavailable';
  lastUpdate?: Date;
}

// === Transport Types ===
export interface VeloStation {
  id: string;
  name: string;
  coordinates: [number, number];
  bikesAvailable: number;
  slotsAvailable: number;
  totalSlots: number;
  status: 'OUVERT' | 'FERME';
  lastUpdate: Date;
}

export interface ParkingRelais {
  id: string;
  name: string;
  coordinates: [number, number];
  capacityTotal: number;
  availableSpaces: number;
  occupancyRate: number;
  status: 'OUVERT' | 'FERME';
  fillStatus: 'LIBRE' | 'COMPLET' | '';
  lastUpdate: Date;
}

export interface BusPosition {
  id: string;
  lineId: string;
  lineName: string;
  destination: string;
  coordinates: [number, number];
  bearing?: number;
  delay?: number;
  lastUpdate: Date;
}

export interface MetroLine {
  id: string;
  name: string;
  color: string;
  geometry: GeoJSON.LineString | GeoJSON.MultiLineString;
}

export interface BusLine {
  id: string;
  name: string;
  shortName: string;
  color: string;
  geometry: GeoJSON.LineString | GeoJSON.MultiLineString;
}

export interface TrafficAlert {
  id: string;
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'critical';
  affectedLines: string[];
  startDate: Date;
  endDate?: Date;
}

// === Prochains Passages Types ===
export interface NextDeparture {
  id: string;
  stopId: string;
  stopName: string;
  lineId: string;
  lineName: string;
  lineColor?: string;
  destination: string;
  departureTime: Date;
  arrivalTime?: Date;
  delay?: number; // en secondes
  isRealtime: boolean;
  platform?: string;
}

// === État Lignes Métro ===
export interface MetroLineStatus {
  id: string;
  name: string;
  shortName: string;
  color: string;
  status: 'normal' | 'perturbé' | 'interrompu';
  message?: string;
  lastUpdate: Date;
}

// === État Stations Métro ===
export interface MetroStationStatus {
  id: string;
  name: string;
  lineId: string;
  isOpen: boolean;
  coordinates?: [number, number];
  lastUpdate: Date;
}

// === État Équipements Métro ===
export interface MetroEquipmentStatus {
  id: string;
  stationId: string;
  stationName: string;
  type: 'ascenseur' | 'escalator' | 'distributeur' | 'autre';
  name: string;
  isOperational: boolean;
  lastUpdate: Date;
}

// === Arrêts de Bus ===
export interface BusStop {
  id: string;
  name: string;
  commune: string;
  coordinates: [number, number];
  lines?: string[];
}

// === Arrêts de Métro ===
export interface MetroStop {
  id: string;
  name: string;
  stationId: string;
  coordinates: [number, number];
  lineId: string;
}

// === Communes ===
export interface Commune {
  id: string;
  name: string;
  code: string;
  population?: number;
  geometry?: GeoJSON.Polygon | GeoJSON.MultiPolygon;
}

// === Fréquentation ===
export interface FrequentationData {
  lineId: string;
  lineName: string;
  date: Date;
  period: string;
  level: 'faible' | 'moyenne' | 'haute' | 'très haute';
  value?: number;
}

// === Tarifs ===
export interface Tarif {
  id: string;
  name: string;
  description: string;
  price: number;
  validity?: string;
  category?: string;
}

// === API Response Types ===
export interface OpenDataSoftResponse<T> {
  total_count: number;
  results: T[];
}

export interface STARParkingRecord {
  idparc: string;
  nom: string;
  coordonnees: { lat: number; lon: number };
  etat: 'OUVERT' | 'FERME';
  etatremplissage: 'LIBRE' | 'COMPLET' | '';
  capacitesoliste: number;
  nombreplacesdisponiblessoliste: number;
  capaciteactuelle?: number;
  jrdheuremaj?: string;
}

export interface STARVeloRecord {
  idstation: string;
  nom: string;
  coordonnees: { lat: number; lon: number };
  etat: 'En fonctionnement' | 'Hors service';
  nombrevelosdisponibles: number;
  nombreemplacementsdisponibles: number;
  nombreemplacementsactuels: number;
  lastupdate?: string;
}

export interface STARBusPositionRecord {
  idbus: string;
  idligne: string;
  nomligne: string;
  destination: string;
  coordonnees: { lat: number; lon: number };
  precisionsituation?: number;
  ecartsecondes?: number;
}

export interface STARLineRecord {
  id: string;
  nomcourt: string;
  nomlong: string;
  couleurligne?: string;
  geo_shape?: GeoJSON.Geometry;
}

export interface STARTrafficAlertRecord {
  idperturbation: string;
  titre: string;
  description: string;
  niveau: string;
  lignes?: string;
  datedebut?: string;
  datefin?: string;
}

// === Dashboard Types ===
export interface DashboardStats {
  transport: {
    bikesAvailable: number;
    bikeStationsActive: number;
    parkingSpacesAvailable: number;
    parkingOccupancyRate: number;
    busesInService: number;
    activeAlerts: number;
  };
  lastUpdate: Date;
}

// === Navigation Types ===
export type NavigationView = 'dashboard' | 'map' | 'crisis' | 'analytics';

export interface NavigationItem {
  id: NavigationView;
  label: string;
  icon: string;
  available: boolean;
}

// === Map Layer Types ===
export interface MapLayer {
  id: string;
  name: string;
  type: 'point' | 'line' | 'polygon';
  visible: boolean;
  source: string;
}

// === API Status Types ===
export interface APIStatus {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'degraded';
  lastCheck: Date;
  responseTime?: number;
}

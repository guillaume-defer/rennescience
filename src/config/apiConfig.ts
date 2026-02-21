// === API Configuration ===
// Toutes les sources de données documentées pour RenneScience

export const API_CONFIG = {
  // === STAR Rennes Métropole (OpenDataSoft) ===
  STAR: {
    BASE_URL: 'https://data.explore.star.fr/api/explore/v2.1/catalog/datasets',
    
    // === VÉLOS ===
    VELO_STATIONS_REALTIME: 'vls-stations-etat-tr',
    VELO_STATIONS_TOPOLOGY: 'vls-stations-topologie-td',
    VELO_GBFS: 'vls-gbfs-tr',
    
    // === PARKINGS P+R ===
    PARKING_REALTIME: 'tco-parcsrelais-star-etat-tr',
    PARKING_TOPOLOGY: 'tco-parcsrelais-star-topologie-td',
    
    // === BUS ===
    BUS_LINES_TOPOLOGY: 'tco-bus-topologie-lignes-td',
    BUS_ROUTES_TOPOLOGY: 'tco-bus-topologie-parcours-td',
    BUS_POSITIONS_REALTIME: 'tco-bus-vehicules-position-tr',
    BUS_STOPS: 'tco-bus-topologie-pointsarret-td',
    BUS_NEXT_DEPARTURES: 'tco-bus-circulation-passages-tr',
    BUS_DESSERTES: 'tco-bus-topologie-dessertes-td',
    BUS_VEHICLES: 'tco-bus-materiel-vehicules-td',
    BUS_PICTOGRAMS: 'tco-bus-lignes-pictogrammes-dm',
    
    // === MÉTRO ===
    METRO_LINES_TOPOLOGY: 'tco-metro-topologie-lignes-td',
    METRO_ROUTES_TOPOLOGY: 'tco-metro-topologie-parcours-td',
    METRO_STATIONS_REALTIME: 'tco-metro-stations-etat-tr',
    METRO_STATIONS_TOPOLOGY: 'tco-metro-topologie-stations-td',
    METRO_EQUIPMENT_REALTIME: 'tco-metro-equipements-etat-tr',
    METRO_EQUIPMENT_TOPOLOGY: 'tco-metro-topologie-equipements-td',
    METRO_LINES_STATUS: 'tco-metro-lignes-etat-tr',
    METRO_NEXT_DEPARTURES: 'tco-metro-circulation-deux-prochains-passages-tr',
    METRO_ALL_DEPARTURES: 'tco-metro-circulation-passages-tr',
    METRO_STOPS: 'tco-metro-topologie-pointsarret-td',
    METRO_DESSERTES: 'tco-metro-topologie-dessertes-td',
    METRO_VEHICLES: 'tco-metro-materiel-vehicules-td',
    METRO_PICTOGRAMS: 'tco-metro-lignes-pictogrammes-dm',
    
    // === ALERTES & TRAFIC ===
    TRAFFIC_ALERTS: 'tco-busmetro-trafic-alertes-tr',
    
    // === FRÉQUENTATION ===
    FREQUENTATION_AGREGEE: 'tco-billettique-star-frequentation-agregee-td',
    FREQUENTATION_DETAILLEE: 'tco-billettique-frequentation-detaillee-td',
    FREQUENTATION_MAX_LIGNE: 'mkt-frequentation-niveau-freq-max-ligne',
    FREQUENTATION_ESTIMATION: 'mkt-frequentation-estimation-niveau-freq-max-ligne-td',
    
    // === HORAIRES & GTFS ===
    GTFS_VERSIONS: 'tco-busmetro-horaires-gtfs-versions-td',
    GTFS_COVOITURAGE: 'tco-covoiturage-horaires-gtfs-versions-td',
    
    // === AGENCES & VENTE ===
    AGENCES: 'mkt-titres-pointsvente-agences-td',
    AGENCES_REALTIME: 'mkt-titres-pointsvente-agences-etat-tr',
    POINTS_VENTE: 'mkt-titres-pointsvente-partenaires-td',
    TARIFS: 'mkt-titres-gamme-td',
    GARAGES: 'mkt-partenaires-garages-td',
    
    // === DOCUMENTS & PLANS ===
    DOCUMENTS_PDF: 'mkt-information-documents-td',
    
    // === GÉOGRAPHIE ===
    COMMUNES_METROPOLE: 'geo-communes-rennesmetropole-td',
    COMMUNES_35: 'communes-france',
  },
  
  // === Rennes Métropole Open Data ===
  RENNES_METROPOLE: {
    BASE_URL: 'https://data.rennesmetropole.fr/api/explore/v2.1/catalog/datasets',
    
    // Éducation
    ECOLES_PRIMAIRES: 'ecoles_primaires',
    ECOLES_SECONDAIRES: 'etablissement_scolaire_2nd_degre',
    ENSEIGNEMENT_SUPERIEUR: 'principaux-etablissements-denseignement-superieur',
    CARTE_SCOLAIRE: 'carte_scolaire_primaire_rennes',
    
    // Équipements et organismes
    SITES_ORGANISMES: 'sites_organismes_sites',
    ORGANISMES: 'sites_organismes_organismes',
    
    // Sports et loisirs
    LOISIRS_AZ: 'loisirs-az-4bis',
    AIRES_JEUX: 'aires-de-jeux-des-espaces-verts-rennes',
    
    // Urbanisme
    PLUI: 'plui',
    LOTISSEMENTS: 'lotissements',
    NRU: 'nru',
    
    // Environnement
    ARBRES: 'arbres-dornement-rennes',
    ESPACES_VERTS: 'espaces_verts',
    
    // Déchets
    DECHETTERIES: 'dechetteries-rennes-metropole',
    POINTS_APPORT: 'points-apport-volontaire',
  },
  
  // === Région Bretagne (BreizhGo) ===
  BRETAGNE: {
    BASE_URL: 'https://data.bretagne.bzh/api/explore/v2.1/catalog/datasets',
    BREIZHGO_CAR: 'breizhgo-car',
    BREIZHGO_TER: 'breizhgo-ter',
    REGIONAL_LINES: 'lignes-routieres-departementales-gerees-par-la-region-bretagne',
    REGIONAL_STOPS: 'arrets-physiques-routiers-departementaux-de-la-region-bretagne',
    KORRIGO: 'korrigo',
  },
  
  // === SNCF ===
  SNCF: {
    BASE_URL: 'https://api.sncf.com/v1',
    // API key moved to environment variable for security
    API_KEY: import.meta.env.VITE_SNCF_API_KEY || '',
  },
  
  // === Environnement ===
  VIGICRUES: {
    RSS_URL: 'https://www.vigicrues.gouv.fr/services/1/InfoVigiCru.rss',
    STATION_ID: 'J3621810',
  },
  
  AIR_BREIZH: {
    BASE_URL: 'https://data.airbreizh.asso.fr',
    GEOSERVER_WFS: '/geoserver/ows',
    GEOCATALOG: '/geonetwork/srv/fre/catalog.search',
    // Air quality data layers (via WFS)
    LAYERS: {
      STATIONS: 'airbreizh:stations',
      MESURES: 'airbreizh:mesures',
      INDICES: 'airbreizh:indices_qualite_air',
    },
  },
  
  HUB_EAU: {
    BASE_URL: 'https://hubeau.eaufrance.fr/api',
    HYDROMETRIE: '/v1/hydrometrie/observations_tr',
    QUALITE: '/v2/qualite_eau_potable/resultats_dis',
  },
  
  // === Énergie ===
  IRVE: {
    BASE_URL: 'https://odre.opendatasoft.com/api/explore/v2.1/catalog/datasets',
    BORNES: 'bornes-irve',
  },

  // === ODRE - Open Data Réseaux Énergies (RTE + Enedis + Gas) ===
  ODRE: {
    BASE_URL: 'https://odre.opendatasoft.com/api/explore/v2.1/catalog/datasets',
    // Consommation
    CONSO_DEPARTEMENT_ANNUELLE: 'conso-departement-annuelle',
    CONSO_REGION_ANNUELLE: 'soutirages-regionaux-quotidiens-consolides-rpt',
    // Production
    PROD_REGION_ENR: 'prod-region-annuelle-enr',
    PARC_REGION_PRODUCTION: 'parc-region-annuel-production-filiere',
    // Installations
    INSTALLATIONS_PRODUCTION: 'nombre-installation-production-stockage-electricite',
    REGISTRE_INSTALLATIONS: 'registre-national-installation-production-stockage-electricite-agrege-311223',
  },
  
  // === Urbanisme / Logement ===
  DVF: {
    BASE_URL: 'https://api.cquest.org/dvf',
  },
  
  ADEME_DPE: {
    BASE_URL: 'https://data.ademe.fr/data-fair/api/v1/datasets/dpe-v2-logements-existants',
  },
  
  BAN: {
    BASE_URL: 'https://api-adresse.data.gouv.fr',
  },
  
  // === Éducation Nationale ===
  EDUCATION: {
    BASE_URL: 'https://data.education.gouv.fr/api/explore/v2.1/catalog/datasets',
    ETABLISSEMENTS: 'fr-en-adresse-et-geolocalisation-etablissements-premier-et-second-degre',
  },
} as const;

// === Helper Functions ===
export function buildSTARUrl(dataset: string, limit: number = 100): string {
  // API OpenDataSoft v2.1 n'utilise pas offset, mais pagination par token
  return `${API_CONFIG.STAR.BASE_URL}/${dataset}/records?limit=${limit}`;
}

export function buildRennesMetropoleUrl(dataset: string, limit: number = 100): string {
  return `${API_CONFIG.RENNES_METROPOLE.BASE_URL}/${dataset}/records?limit=${limit}`;
}

export function buildBretagneUrl(dataset: string, limit: number = 100): string {
  return `${API_CONFIG.BRETAGNE.BASE_URL}/${dataset}/records?limit=${limit}`;
}

// === Refresh Intervals (en millisecondes) ===
export const REFRESH_INTERVALS = {
  REALTIME: 30000,      // 30 secondes
  FREQUENT: 60000,      // 1 minute
  MODERATE: 120000,     // 2 minutes
  SLOW: 300000,         // 5 minutes
  HOURLY: 3600000,      // 1 heure
} as const;

// === Rennes Center Coordinates ===
export const RENNES_CENTER: [number, number] = [-1.6778, 48.1173];
export const RENNES_BOUNDS: [[number, number], [number, number]] = [
  [-1.85, 48.03],  // SW
  [-1.50, 48.22],  // NE
];

// === Map Styles ===
export const MAP_STYLES = {
  DARK: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
  DARK_NOLABELS: 'https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json',
  POSITRON: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
  VOYAGER: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
} as const;

// === Transport Colors ===
export const TRANSPORT_COLORS = {
  METRO_A: '#d9272e',    // Rouge
  METRO_B: '#0055a4',    // Bleu
  BUS: '#6b7280',        // Gris par défaut
  VELO: '#22c55e',       // Vert
  PARKING: '#3b82f6',    // Bleu
  TER: '#7c3aed',        // Violet
} as const;

// === API Status Registry ===
export interface APIEndpoint {
  id: string;
  name: string;
  url: string;
  category: string;
  updateFrequency: 'realtime' | 'hourly' | 'daily' | 'static';
  isPublic: boolean;
}

export const API_REGISTRY: APIEndpoint[] = [
  // === STAR Transport - Temps Réel ===
  { id: 'star-velo', name: 'Vélos STAR', url: buildSTARUrl(API_CONFIG.STAR.VELO_STATIONS_REALTIME, 1), category: 'Transport', updateFrequency: 'realtime', isPublic: true },
  { id: 'star-parking', name: 'Parkings P+R', url: buildSTARUrl(API_CONFIG.STAR.PARKING_REALTIME, 1), category: 'Transport', updateFrequency: 'realtime', isPublic: true },
  { id: 'star-bus-pos', name: 'Bus Positions', url: buildSTARUrl(API_CONFIG.STAR.BUS_POSITIONS_REALTIME, 1), category: 'Transport', updateFrequency: 'realtime', isPublic: true },
  { id: 'star-bus-passages', name: 'Passages Bus', url: buildSTARUrl(API_CONFIG.STAR.BUS_NEXT_DEPARTURES, 1), category: 'Transport', updateFrequency: 'realtime', isPublic: true },
  { id: 'star-metro-passages', name: 'Passages Métro', url: buildSTARUrl(API_CONFIG.STAR.METRO_NEXT_DEPARTURES, 1), category: 'Transport', updateFrequency: 'realtime', isPublic: true },
  { id: 'star-metro-status', name: 'État Lignes Métro', url: buildSTARUrl(API_CONFIG.STAR.METRO_LINES_STATUS, 1), category: 'Transport', updateFrequency: 'realtime', isPublic: true },
  { id: 'star-metro-stations', name: 'État Stations Métro', url: buildSTARUrl(API_CONFIG.STAR.METRO_STATIONS_REALTIME, 1), category: 'Transport', updateFrequency: 'realtime', isPublic: true },
  { id: 'star-metro-equip', name: 'Équipements Métro', url: buildSTARUrl(API_CONFIG.STAR.METRO_EQUIPMENT_REALTIME, 1), category: 'Transport', updateFrequency: 'realtime', isPublic: true },
  { id: 'star-alerts', name: 'Alertes Trafic', url: buildSTARUrl(API_CONFIG.STAR.TRAFFIC_ALERTS, 1), category: 'Transport', updateFrequency: 'realtime', isPublic: true },
  
  // === STAR Transport - Topologie ===
  { id: 'star-metro-lines', name: 'Lignes Métro', url: buildSTARUrl(API_CONFIG.STAR.METRO_LINES_TOPOLOGY, 1), category: 'Transport', updateFrequency: 'static', isPublic: true },
  { id: 'star-bus-lines', name: 'Lignes Bus', url: buildSTARUrl(API_CONFIG.STAR.BUS_LINES_TOPOLOGY, 1), category: 'Transport', updateFrequency: 'static', isPublic: true },
  { id: 'star-bus-stops', name: 'Arrêts Bus', url: buildSTARUrl(API_CONFIG.STAR.BUS_STOPS, 1), category: 'Transport', updateFrequency: 'static', isPublic: true },
  { id: 'star-metro-stops', name: 'Arrêts Métro', url: buildSTARUrl(API_CONFIG.STAR.METRO_STOPS, 1), category: 'Transport', updateFrequency: 'static', isPublic: true },
  
  // === STAR Fréquentation ===
  { id: 'star-freq', name: 'Fréquentation', url: buildSTARUrl(API_CONFIG.STAR.FREQUENTATION_AGREGEE, 1), category: 'Analytics', updateFrequency: 'daily', isPublic: true },
  { id: 'star-freq-max', name: 'Fréquentation Max', url: buildSTARUrl(API_CONFIG.STAR.FREQUENTATION_MAX_LIGNE, 1), category: 'Analytics', updateFrequency: 'daily', isPublic: true },
  
  // === STAR Géographie ===
  { id: 'star-communes', name: 'Communes Métropole', url: buildSTARUrl(API_CONFIG.STAR.COMMUNES_METROPOLE, 1), category: 'Géographie', updateFrequency: 'static', isPublic: true },
  
  // === STAR Commercial ===
  { id: 'star-tarifs', name: 'Tarifs', url: buildSTARUrl(API_CONFIG.STAR.TARIFS, 1), category: 'Commercial', updateFrequency: 'daily', isPublic: true },
  { id: 'star-agences', name: 'Agences', url: buildSTARUrl(API_CONFIG.STAR.AGENCES, 1), category: 'Commercial', updateFrequency: 'static', isPublic: true },
  
  // === Rennes Métropole ===
  { id: 'rm-ecoles', name: 'Écoles Primaires', url: buildRennesMetropoleUrl(API_CONFIG.RENNES_METROPOLE.ECOLES_PRIMAIRES, 1), category: 'Éducation', updateFrequency: 'daily', isPublic: true },
  { id: 'rm-colleges', name: 'Collèges & Lycées', url: buildRennesMetropoleUrl(API_CONFIG.RENNES_METROPOLE.ECOLES_SECONDAIRES, 1), category: 'Éducation', updateFrequency: 'daily', isPublic: true },
  { id: 'rm-sites', name: 'Sites & Organismes', url: buildRennesMetropoleUrl(API_CONFIG.RENNES_METROPOLE.SITES_ORGANISMES, 1), category: 'Équipements', updateFrequency: 'daily', isPublic: true },
  { id: 'rm-loisirs', name: 'Loisirs A-Z', url: buildRennesMetropoleUrl(API_CONFIG.RENNES_METROPOLE.LOISIRS_AZ, 1), category: 'Culture & Sports', updateFrequency: 'daily', isPublic: true },
  { id: 'rm-plui', name: 'PLUi', url: buildRennesMetropoleUrl(API_CONFIG.RENNES_METROPOLE.PLUI, 1), category: 'Urbanisme', updateFrequency: 'static', isPublic: true },
];

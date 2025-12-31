import type { DGCLCompetency } from '../types';

// === 17 Catégories DGCL pour les Métropoles ===
export const DGCL_COMPETENCIES: DGCLCompetency[] = [
  {
    id: 'securite',
    name: 'Sécurité',
    category: 'Services Régaliens',
    icon: 'Shield',
    description: 'Police municipale, prévention de la délinquance, vidéoprotection',
    status: 'development',
    dataSources: [],
    indicators: [
      { id: 'sec-1', name: 'Interventions PM', value: null, status: 'unavailable' },
    ],
    requiredConventions: ['Convention SDIS 35', 'Convention Préfecture'],
  },
  {
    id: 'action-sociale',
    name: 'Action sociale et santé',
    category: 'Social',
    icon: 'Heart',
    description: 'CCAS, aide aux personnes âgées, PMI, insertion sociale, professionnels de santé',
    status: 'active',
    dataSources: [
      {
        id: 'rm-professionnels-sante',
        name: 'Professionnels de santé',
        apiUrl: 'https://data.rennesmetropole.fr/api/explore/v2.1/catalog/datasets/professionnel_sante/records',
        updateFrequency: 'daily',
        requiresAuth: false,
        isAvailable: true,
      },
      {
        id: 'rm-etablissements-sante',
        name: 'Établissements de santé',
        apiUrl: 'https://data.rennesmetropole.fr/api/explore/v2.1/catalog/datasets/etablissement_sante/records',
        updateFrequency: 'daily',
        requiresAuth: false,
        isAvailable: true,
      },
    ],
    indicators: [
      { id: 'soc-1', name: 'Professionnels de santé', value: null, status: 'loading' },
      { id: 'soc-2', name: 'Bénéficiaires CCAS', value: null, status: 'unavailable' },
    ],
    requiredConventions: ['Données CCAS Rennes Métropole'],
  },
  {
    id: 'emploi',
    name: 'Emploi / Insertion',
    category: 'Économie',
    icon: 'Briefcase',
    description: 'Insertion professionnelle, maisons de l\'emploi, PLIE',
    status: 'development',
    dataSources: [],
    indicators: [
      { id: 'emp-1', name: 'Demandeurs d\'emploi', value: null, status: 'unavailable' },
    ],
    requiredConventions: ['Convention Pôle Emploi / France Travail'],
  },
  {
    id: 'enseignement',
    name: 'Enseignement',
    category: 'Éducation',
    icon: 'GraduationCap',
    description: 'Écoles primaires, collèges, lycées, enseignement supérieur',
    status: 'active',
    dataSources: [
      {
        id: 'rm-ecoles-primaires',
        name: 'Écoles primaires',
        apiUrl: 'https://data.rennesmetropole.fr/api/explore/v2.1/catalog/datasets/ecoles_primaires/records',
        updateFrequency: 'daily',
        requiresAuth: false,
        isAvailable: true,
      },
      {
        id: 'rm-ecoles-secondaires',
        name: 'Collèges et Lycées',
        apiUrl: 'https://data.rennesmetropole.fr/api/explore/v2.1/catalog/datasets/etablissement_scolaire_2nd_degre/records',
        updateFrequency: 'daily',
        requiresAuth: false,
        isAvailable: true,
      },
      {
        id: 'rm-enseignement-sup',
        name: 'Enseignement supérieur',
        apiUrl: 'https://data.rennesmetropole.fr/api/explore/v2.1/catalog/datasets/principaux-etablissements-denseignement-superieur/records',
        updateFrequency: 'daily',
        requiresAuth: false,
        isAvailable: true,
      },
    ],
    indicators: [
      { id: 'ens-1', name: 'Écoles primaires', value: null, status: 'loading' },
      { id: 'ens-2', name: 'Collèges/Lycées', value: null, status: 'loading' },
      { id: 'ens-3', name: 'Établissements sup.', value: null, status: 'loading' },
    ],
  },
  {
    id: 'enfance',
    name: 'Enfance / Jeunesse',
    category: 'Éducation',
    icon: 'Baby',
    description: 'Crèches, accueil périscolaire, centres de loisirs, aires de jeux',
    status: 'active',
    dataSources: [
      {
        id: 'rm-aires-jeux',
        name: 'Aires de jeux',
        apiUrl: 'https://data.rennesmetropole.fr/api/explore/v2.1/catalog/datasets/aires-de-jeux-des-espaces-verts-rennes/records',
        updateFrequency: 'daily',
        requiresAuth: false,
        isAvailable: true,
      },
    ],
    indicators: [
      { id: 'enf-1', name: 'Aires de jeux', value: null, status: 'loading' },
      { id: 'enf-2', name: 'Places en crèche', value: null, status: 'unavailable' },
    ],
    requiredConventions: ['Données Petite Enfance Ville de Rennes'],
  },
  {
    id: 'sports',
    name: 'Sports',
    category: 'Culture & Loisirs',
    icon: 'Dumbbell',
    description: 'Équipements sportifs, piscines, stades, activités sportives',
    status: 'active',
    dataSources: [
      {
        id: 'rm-equipements-sportifs',
        name: 'Équipements sportifs de proximité',
        apiUrl: 'https://data.rennesmetropole.fr/api/explore/v2.1/catalog/datasets/equipements_sportifs_proximite_rennes/records',
        updateFrequency: 'daily',
        requiresAuth: false,
        isAvailable: true,
      },
      {
        id: 'rm-terrains-sport',
        name: 'Terrains de sport',
        apiUrl: 'https://data.rennesmetropole.fr/api/explore/v2.1/catalog/datasets/terrains_sport/records',
        updateFrequency: 'daily',
        requiresAuth: false,
        isAvailable: true,
      },
      {
        id: 'rm-loisirs',
        name: 'Loisirs A à Z',
        apiUrl: 'https://data.rennesmetropole.fr/api/explore/v2.1/catalog/datasets/loisirs-az-4bis/records',
        updateFrequency: 'daily',
        requiresAuth: false,
        isAvailable: true,
      },
    ],
    indicators: [
      { id: 'spo-1', name: 'Équipements sportifs', value: null, status: 'loading' },
      { id: 'spo-2', name: 'Terrains de sport', value: null, status: 'loading' },
    ],
  },
  {
    id: 'culture',
    name: 'Culture',
    category: 'Culture & Loisirs',
    icon: 'Theater',
    description: 'Bibliothèques, musées, conservatoires, événements culturels',
    status: 'active',
    dataSources: [
      {
        id: 'rm-loisirs-culture',
        name: 'Loisirs A à Z (Culture)',
        apiUrl: 'https://data.rennesmetropole.fr/api/explore/v2.1/catalog/datasets/loisirs-az-4bis/records',
        updateFrequency: 'daily',
        requiresAuth: false,
        isAvailable: true,
      },
    ],
    indicators: [
      { id: 'cul-1', name: 'Activités culturelles', value: null, status: 'loading' },
    ],
  },
  {
    id: 'tourisme',
    name: 'Tourisme',
    category: 'Économie',
    icon: 'Compass',
    description: 'Office de tourisme, hébergements, sites touristiques',
    status: 'development',
    dataSources: [],
    indicators: [
      { id: 'tou-1', name: 'Nuitées touristiques', value: null, status: 'unavailable' },
    ],
    requiredConventions: ['Convention Office de Tourisme'],
  },
  {
    id: 'formation',
    name: 'Formation professionnelle',
    category: 'Éducation',
    icon: 'Award',
    description: 'Centres de formation, apprentissage, VAE',
    status: 'development',
    dataSources: [],
    indicators: [
      { id: 'for-1', name: 'Stagiaires formés', value: null, status: 'unavailable' },
    ],
    requiredConventions: ['Données Région Bretagne Formation'],
  },
  {
    id: 'economie',
    name: 'Économie',
    category: 'Économie',
    icon: 'TrendingUp',
    description: 'Zones d\'activité, aides aux entreprises, développement économique',
    status: 'active',
    dataSources: [
      {
        id: 'rm-sirene',
        name: 'Base SIRENE Rennes Métropole',
        apiUrl: 'https://data.rennesmetropole.fr/api/explore/v2.1/catalog/datasets/insee-sirene/records',
        updateFrequency: 'daily',
        requiresAuth: false,
        isAvailable: true,
      },
      {
        id: 'rm-commerces',
        name: 'Inventaire commerces',
        apiUrl: 'https://data.rennesmetropole.fr/api/explore/v2.1/catalog/datasets/inventaire_commerces_2019/records',
        updateFrequency: 'static',
        requiresAuth: false,
        isAvailable: true,
      },
    ],
    indicators: [
      { id: 'eco-1', name: 'Entreprises actives', value: null, status: 'loading' },
      { id: 'eco-2', name: 'Commerces', value: null, status: 'loading' },
    ],
  },
  {
    id: 'politique-ville',
    name: 'Politique de la ville',
    category: 'Urbanisme',
    icon: 'Building2',
    description: 'Quartiers prioritaires, rénovation urbaine, cohésion sociale',
    status: 'development',
    dataSources: [],
    indicators: [
      { id: 'pol-1', name: 'Quartiers QPV', value: null, status: 'unavailable' },
    ],
    requiredConventions: ['Données ANRU / ANCT'],
  },
  {
    id: 'urbanisme',
    name: 'Urbanisme / Aménagement',
    category: 'Urbanisme',
    icon: 'Map',
    description: 'PLUi, permis de construire, lotissements, projets d\'aménagement',
    status: 'active',
    dataSources: [
      {
        id: 'rm-plui',
        name: 'PLUi Rennes Métropole',
        apiUrl: 'https://data.rennesmetropole.fr/api/explore/v2.1/catalog/datasets/plui/records',
        updateFrequency: 'static',
        requiresAuth: false,
        isAvailable: true,
      },
      {
        id: 'rm-lotissements',
        name: 'Lotissements',
        apiUrl: 'https://data.rennesmetropole.fr/api/explore/v2.1/catalog/datasets/lotissements/records',
        updateFrequency: 'daily',
        requiresAuth: false,
        isAvailable: true,
      },
      {
        id: 'dvf',
        name: 'DVF (Valeurs Foncières)',
        apiUrl: 'https://api.cquest.org/dvf',
        updateFrequency: 'daily',
        requiresAuth: false,
        isAvailable: true,
      },
    ],
    indicators: [
      { id: 'urb-1', name: 'Zones PLUi', value: null, status: 'loading' },
      { id: 'urb-2', name: 'Lotissements', value: null, status: 'loading' },
    ],
  },
  {
    id: 'logement',
    name: 'Logement / Habitat',
    category: 'Urbanisme',
    icon: 'Home',
    description: 'Logement social, rénovation énergétique, PLH',
    status: 'development',
    dataSources: [
      {
        id: 'dpe',
        name: 'DPE ADEME',
        apiUrl: 'https://data.ademe.fr/datasets/dpe-v2-logements-existants',
        updateFrequency: 'daily',
        requiresAuth: false,
        isAvailable: true,
      },
    ],
    indicators: [
      { id: 'log-1', name: 'Logements sociaux', value: null, status: 'unavailable' },
    ],
    requiredConventions: ['Données Archipel Habitat / Bailleurs sociaux'],
  },
  {
    id: 'environnement',
    name: 'Environnement / Patrimoine',
    category: 'Environnement',
    icon: 'TreePine',
    description: 'Espaces verts, arbres, biodiversité, protection du patrimoine naturel',
    status: 'active',
    dataSources: [
      {
        id: 'rm-arbres',
        name: 'Arbres sur l\'espace public',
        apiUrl: 'https://data.rennesmetropole.fr/api/explore/v2.1/catalog/datasets/arbre/records',
        updateFrequency: 'daily',
        requiresAuth: false,
        isAvailable: true,
      },
      {
        id: 'rm-espaces-verts',
        name: 'Surfaces espaces verts',
        apiUrl: 'https://data.rennesmetropole.fr/api/explore/v2.1/catalog/datasets/surface_espace_vert/records',
        updateFrequency: 'daily',
        requiresAuth: false,
        isAvailable: true,
      },
      {
        id: 'vigicrues',
        name: 'Vigicrues',
        apiUrl: 'https://www.vigicrues.gouv.fr/services/1/InfoVigiCru.rss',
        updateFrequency: 'hourly',
        requiresAuth: false,
        isAvailable: true,
      },
      {
        id: 'airbreizh',
        name: 'Air Breizh',
        apiUrl: 'https://data.airbreizh.asso.fr/api/v1/',
        updateFrequency: 'hourly',
        requiresAuth: false,
        isAvailable: true,
      },
    ],
    indicators: [
      { id: 'env-1', name: 'Arbres référencés', value: null, status: 'loading' },
      { id: 'env-2', name: 'Qualité air', value: 'Bon', status: 'live', unit: 'IQA' },
      { id: 'env-3', name: 'Vigilance crues', value: 'Vert', status: 'live' },
    ],
  },
  {
    id: 'dechets-eau',
    name: 'Déchets / Eau / Assainissement',
    category: 'Environnement',
    icon: 'Droplets',
    description: 'Collecte déchets, déchèteries, traitement eau, assainissement',
    status: 'active',
    dataSources: [
      {
        id: 'rm-dechetteries',
        name: 'Déchèteries',
        apiUrl: 'https://data.rennesmetropole.fr/api/explore/v2.1/catalog/datasets/decheteries_plateformes_vegetaux/records',
        updateFrequency: 'daily',
        requiresAuth: false,
        isAvailable: true,
      },
      {
        id: 'rm-points-apport',
        name: 'Points d\'apport volontaire',
        apiUrl: 'https://data.rennesmetropole.fr/api/explore/v2.1/catalog/datasets/points-apport-volontaire/records',
        updateFrequency: 'daily',
        requiresAuth: false,
        isAvailable: true,
      },
      {
        id: 'hubeau',
        name: 'Hub\'Eau',
        apiUrl: 'https://hubeau.eaufrance.fr/api/',
        updateFrequency: 'daily',
        requiresAuth: false,
        isAvailable: true,
      },
    ],
    indicators: [
      { id: 'dec-1', name: 'Déchèteries', value: null, status: 'loading' },
      { id: 'dec-2', name: 'Points d\'apport volontaire', value: null, status: 'loading' },
    ],
  },
  {
    id: 'numerique',
    name: 'Numérique / Télécommunications',
    category: 'Infrastructure',
    icon: 'Wifi',
    description: 'Fibre optique, couverture mobile, services numériques',
    status: 'development',
    dataSources: [],
    indicators: [
      { id: 'num-1', name: 'Couverture fibre', value: null, unit: '%', status: 'unavailable' },
    ],
    requiredConventions: ['Données ARCEP / Opérateurs'],
  },
  {
    id: 'energie-transports',
    name: 'Énergie / Transports',
    category: 'Infrastructure',
    icon: 'Zap',
    description: 'Transports en commun, mobilités douces, réseaux énergétiques',
    status: 'active',
    dataSources: [
      {
        id: 'star-velo',
        name: 'Vélos STAR',
        apiUrl: 'https://data.explore.star.fr/api/explore/v2.1/catalog/datasets/vls-stations-etat-tr/records',
        updateFrequency: 'realtime',
        requiresAuth: false,
        isAvailable: true,
      },
      {
        id: 'star-parking',
        name: 'Parkings P+R STAR',
        apiUrl: 'https://data.explore.star.fr/api/explore/v2.1/catalog/datasets/tco-parcsrelais-star-etat-tr/records',
        updateFrequency: 'realtime',
        requiresAuth: false,
        isAvailable: true,
      },
      {
        id: 'star-bus',
        name: 'Bus STAR',
        apiUrl: 'https://data.explore.star.fr/api/explore/v2.1/catalog/datasets/tco-bus-vehicules-position-tr/records',
        updateFrequency: 'realtime',
        requiresAuth: false,
        isAvailable: true,
      },
      {
        id: 'star-metro',
        name: 'Métro STAR',
        apiUrl: 'https://data.explore.star.fr/api/explore/v2.1/catalog/datasets/tco-metro-topologie-lignes-td/records',
        updateFrequency: 'static',
        requiresAuth: false,
        isAvailable: true,
      },
      {
        id: 'star-alerts',
        name: 'Alertes trafic STAR',
        apiUrl: 'https://data.explore.star.fr/api/explore/v2.1/catalog/datasets/mkt-information-voyageurs-tr/records',
        updateFrequency: 'realtime',
        requiresAuth: false,
        isAvailable: true,
      },
      {
        id: 'irve',
        name: 'Bornes IRVE',
        apiUrl: 'https://opendata.reseaux-energies.fr/api/explore/v2.1/catalog/datasets/bornes-irve/records',
        updateFrequency: 'daily',
        requiresAuth: false,
        isAvailable: true,
      },
    ],
    indicators: [
      { id: 'tra-1', name: 'Vélos disponibles', value: null, status: 'loading' },
      { id: 'tra-2', name: 'Places P+R libres', value: null, status: 'loading' },
      { id: 'tra-3', name: 'Bus en service', value: null, status: 'loading' },
      { id: 'tra-4', name: 'Alertes trafic', value: null, status: 'loading' },
    ],
  },
];

// === Catégories groupées ===
export const DGCL_CATEGORIES = [
  { id: 'services-regaliens', name: 'Services Régaliens', color: '#ef4444' },
  { id: 'social', name: 'Social', color: '#f97316' },
  { id: 'education', name: 'Éducation', color: '#eab308' },
  { id: 'culture-loisirs', name: 'Culture & Loisirs', color: '#22c55e' },
  { id: 'economie', name: 'Économie', color: '#3b82f6' },
  { id: 'urbanisme', name: 'Urbanisme', color: '#8b5cf6' },
  { id: 'environnement', name: 'Environnement', color: '#06b6d4' },
  { id: 'infrastructure', name: 'Infrastructure', color: '#ec4899' },
] as const;

// === Helper pour obtenir les compétences actives ===
export function getActiveCompetencies(): DGCLCompetency[] {
  return DGCL_COMPETENCIES.filter(c => c.status === 'active');
}

// === Helper pour obtenir une compétence par ID ===
export function getCompetencyById(id: string): DGCLCompetency | undefined {
  return DGCL_COMPETENCIES.find(c => c.id === id);
}

// === Compter les sources de données disponibles ===
export function countAvailableDataSources(): { available: number; total: number } {
  let available = 0;
  let total = 0;
  
  DGCL_COMPETENCIES.forEach(c => {
    c.dataSources.forEach(ds => {
      total++;
      if (ds.isAvailable) available++;
    });
  });
  
  return { available, total };
}

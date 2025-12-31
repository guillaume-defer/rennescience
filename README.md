# 🌆 RenneScience v7.0

**Plateforme de Pilotage Territorial - Vision Palantir Foundry**

Une plateforme de visualisation et d'analyse des données territoriales de Rennes Métropole, intégrant les données ouvertes de la STAR et d'autres sources pour une aide à la décision en temps réel.

## 🎯 Fonctionnalités

### ✅ Implémentées

- **Dashboard DGCL** : 17 compétences métropolitaines selon la nomenclature DGCL
- **Carte territoriale interactive** : MapLibre GL JS avec fond sombre Carto
- **Transport temps réel** :
  - Vélos en libre-service (stations + disponibilité)
  - Parkings P+R (places disponibles + taux d'occupation)
  - Bus en temps réel (positions)
  - Lignes de métro (tracés A/B)
  - Alertes trafic
- **Interface Palantir-style** : Dark theme, données live, indicateurs temps réel

### 🚧 En Développement

- **Centre de crise** : Nécessite conventions SDIS/Préfecture
- **Analyses IA** : Prédictions et corrélations (nécessite historique de données)

## 📊 Sources de Données

### Transport (STAR Rennes)
| Source | Fréquence | Statut |
|--------|-----------|--------|
| Vélos libre-service | 30 sec | ✅ Actif |
| Parkings P+R | 30 sec | ✅ Actif |
| Bus positions | 30 sec | ✅ Actif |
| Métro lignes | Statique | ✅ Actif |
| Alertes trafic | 30 sec | ✅ Actif |

### Autres sources identifiées
- BreizhGo / Région Bretagne
- SNCF (nécessite clé API)
- Vigicrues
- Air Breizh
- Hub'Eau
- DVF / DPE ADEME

## 🛠️ Stack Technique

- **Frontend** : React 18.2 + TypeScript + Vite
- **Cartographie** : MapLibre GL JS 4.x
- **Styling** : Tailwind CSS 3.x
- **Icônes** : Lucide React
- **Dates** : date-fns

## 🚀 Installation

```bash
# Installation des dépendances
npm install

# Développement
npm run dev

# Build production
npm run build

# Preview production
npm run preview
```

## 📁 Structure du Projet

```
src/
├── App.tsx                     # Composant principal
├── main.tsx                    # Point d'entrée
├── index.css                   # Styles globaux Tailwind
├── components/
│   ├── Header.tsx              # En-tête avec logo et contrôles
│   ├── Sidebar.tsx             # Navigation et mini-stats
│   ├── DGCLDashboard.tsx       # Dashboard des 17 compétences
│   ├── TerritorialMap.tsx      # Carte MapLibre
│   ├── CrisisCenter.tsx        # Module centre de crise (dev)
│   └── AnalyticsPanel.tsx      # Module analyses IA (dev)
├── config/
│   ├── apiConfig.ts            # URLs et configuration APIs
│   └── dgclCompetencies.ts     # Définition des 17 compétences DGCL
├── services/
│   └── territorialDataService.ts # Appels API et parsing
├── hooks/
│   └── useRealtimeData.ts      # Hook de données temps réel
└── types/
    └── index.ts                # Types TypeScript
```

## 🔧 Configuration APIs

Les APIs STAR sont publiques et ne nécessitent pas d'authentification.
Base URL : `https://data.explore.star.fr/api/explore/v2.1/catalog/datasets/`

Datasets utilisés :
- `vls-stations-etat-tr` : Vélos temps réel
- `tco-parcsrelais-star-etat-tr` : Parkings temps réel
- `tco-bus-vehicules-position-tr` : Bus positions
- `tco-metro-topologie-lignes-td` : Lignes métro
- `mkt-information-voyageurs-tr` : Alertes trafic

## 📋 Nomenclature DGCL

Les 17 compétences métropolitaines :

1. Sécurité
2. Action sociale et santé
3. Emploi / Insertion
4. Enseignement
5. Enfance / Jeunesse
6. Sports
7. Culture
8. Tourisme
9. Formation professionnelle
10. Économie
11. Politique de la ville
12. Urbanisme / Aménagement
13. Logement / Habitat
14. Environnement / Patrimoine
15. Déchets / Eau / Assainissement
16. Numérique / Télécommunications
17. Énergie / Transports ✅ (seule compétence avec données temps réel actives)

## 🚀 Déploiement

Le projet est configuré pour un déploiement sur Netlify :
1. Push sur GitHub
2. Netlify détecte automatiquement le push
3. Build via `npm run build`
4. Déploiement du dossier `dist/`

## 📄 Licence

Projet développé pour Rennes Métropole.
Données ouvertes sous licence ODbL (STAR / Rennes Métropole).

---

*Développé avec ❤️ pour Rennes Métropole*

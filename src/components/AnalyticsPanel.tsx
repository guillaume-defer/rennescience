import { 
  BrainCircuit, 
  BarChart3, 
  LineChart,
  Sparkles,
  Lock,
  Database,
  Cpu,
  GitBranch,
} from 'lucide-react';

export default function AnalyticsPanel() {
  return (
    <div className="h-full overflow-auto p-6 grid-overlay">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
            <BrainCircuit className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-palantir-text">
              Analyses IA
            </h2>
            <p className="text-palantir-text-muted text-sm">
              Intelligence artificielle et prédictions
            </p>
          </div>
        </div>
      </div>

      {/* Development Notice */}
      <div className="card-palantir p-6 border-purple-500/30 bg-purple-500/5 mb-8">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
            <Lock className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-purple-400 mb-2">
              Module en développement
            </h3>
            <p className="text-palantir-text-muted mb-4">
              Ce module d'analyse avancée est en cours de développement. Il nécessite :
            </p>
            <ul className="space-y-2 text-sm text-palantir-text-muted">
              <li className="flex items-center gap-2">
                <Database className="w-4 h-4 text-blue-400" />
                <span>Accumulation de données historiques (6 mois minimum)</span>
              </li>
              <li className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-green-400" />
                <span>Infrastructure de calcul pour les modèles ML</span>
              </li>
              <li className="flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-orange-400" />
                <span>Corrélation des sources de données multiples</span>
              </li>
              <li className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-yellow-400" />
                <span>Validation des modèles prédictifs</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Preview of Analytics Features */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-palantir-text mb-4">
          Analyses prévues
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Prédiction de trafic */}
        <AnalyticsPreview
          icon={LineChart}
          title="Prédiction de trafic"
          description="Prévision de la charge du réseau de transport à J+1, J+7"
          metrics={[
            { label: 'Précision actuelle', value: '-', color: 'text-palantir-text-muted' },
            { label: 'Données requises', value: '6 mois', color: 'text-palantir-warning' },
          ]}
        />

        {/* Analyse de fréquentation */}
        <AnalyticsPreview
          icon={BarChart3}
          title="Analyse de fréquentation"
          description="Patterns d'utilisation des vélos et P+R par heure/jour/saison"
          metrics={[
            { label: 'Sources connectées', value: '2/5', color: 'text-palantir-info' },
            { label: 'Historique', value: '30 jours', color: 'text-orange-400' },
          ]}
        />

        {/* Corrélations */}
        <AnalyticsPreview
          icon={GitBranch}
          title="Corrélations multi-sources"
          description="Impact météo/événements sur les transports, qualité air/trafic"
          metrics={[
            { label: 'Corrélations identifiées', value: '0', color: 'text-palantir-text-muted' },
            { label: 'Sources croisées', value: '0/8', color: 'text-palantir-text-muted' },
          ]}
        />

        {/* Détection d'anomalies */}
        <AnalyticsPreview
          icon={Sparkles}
          title="Détection d'anomalies"
          description="Alertes automatiques sur comportements inhabituels"
          metrics={[
            { label: 'Modèle', value: 'Non entraîné', color: 'text-palantir-danger' },
            { label: 'Alertes générées', value: '0', color: 'text-palantir-text-muted' },
          ]}
        />
      </div>

      {/* Roadmap */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-palantir-text mb-4">
          Feuille de route
        </h3>
        <div className="card-palantir p-4">
          <div className="space-y-4">
            <RoadmapItem
              phase="Phase 1"
              title="Collecte et stockage"
              description="Accumulation des données historiques, mise en place du data lake"
              status="current"
            />
            <RoadmapItem
              phase="Phase 2"
              title="Analyses descriptives"
              description="Tableaux de bord historiques, rapports automatisés"
              status="planned"
            />
            <RoadmapItem
              phase="Phase 3"
              title="Modèles prédictifs"
              description="ML pour prédiction de charge, détection d'anomalies"
              status="planned"
            />
            <RoadmapItem
              phase="Phase 4"
              title="IA conversationnelle"
              description="Assistant IA pour requêtes en langage naturel"
              status="planned"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// === Analytics Preview Component ===
interface AnalyticsPreviewProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  metrics: { label: string; value: string; color: string }[];
}

function AnalyticsPreview({ icon: Icon, title, description, metrics }: AnalyticsPreviewProps) {
  return (
    <div className="card-palantir p-4 opacity-60">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
          <Icon className="w-5 h-5 text-purple-400" />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-palantir-text">{title}</h4>
          <p className="text-xs text-palantir-text-muted mt-1">{description}</p>
        </div>
      </div>

      {/* Placeholder chart */}
      <div className="h-32 bg-palantir-border/30 rounded-lg mb-4 flex items-center justify-center">
        <span className="text-xs text-palantir-text-muted">Graphique non disponible</span>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-4">
        {metrics.map((metric, index) => (
          <div key={index}>
            <p className="text-[10px] uppercase tracking-wider text-palantir-text-muted mb-1">
              {metric.label}
            </p>
            <p className={`text-sm font-mono font-semibold ${metric.color}`}>
              {metric.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// === Roadmap Item Component ===
interface RoadmapItemProps {
  phase: string;
  title: string;
  description: string;
  status: 'completed' | 'current' | 'planned';
}

function RoadmapItem({ phase, title, description, status }: RoadmapItemProps) {
  const statusColors = {
    completed: 'border-palantir-accent bg-palantir-accent/10',
    current: 'border-purple-500 bg-purple-500/10',
    planned: 'border-palantir-border bg-transparent',
  };

  const statusBadge = {
    completed: { text: 'Terminé', color: 'text-palantir-accent' },
    current: { text: 'En cours', color: 'text-purple-400' },
    planned: { text: 'Planifié', color: 'text-palantir-text-muted' },
  };

  return (
    <div className={`flex items-start gap-4 p-3 rounded-lg border ${statusColors[status]}`}>
      <div className="flex-shrink-0">
        <span className="text-xs font-semibold text-palantir-text-muted">{phase}</span>
      </div>
      <div className="flex-1">
        <h5 className="font-medium text-palantir-text">{title}</h5>
        <p className="text-xs text-palantir-text-muted mt-0.5">{description}</p>
      </div>
      <span className={`text-xs font-medium ${statusBadge[status].color}`}>
        {statusBadge[status].text}
      </span>
    </div>
  );
}

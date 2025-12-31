import { 
  AlertTriangle, 
  Shield, 
  Flame, 
  Waves, 
  Wind, 
  Zap,
  Phone,
  Users,
  Radio,
  MapPin,
  Lock,
  FileText,
} from 'lucide-react';
import TransportRealtimePanel from './TransportRealtimePanel';

export default function CrisisCenter() {
  return (
    <div className="h-full overflow-auto p-6 grid-overlay">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-palantir-danger/20 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-palantir-danger" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-palantir-text">
              Centre de Crise
            </h2>
            <p className="text-palantir-text-muted text-sm">
              Coordination des services d'urgence et supervision temps réel
            </p>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Left: Transport Realtime Panel */}
        <TransportRealtimePanel className="lg:row-span-2" />

        {/* Right: Development Notice */}
        <div className="card-palantir p-6 border-palantir-warning/30 bg-palantir-warning/5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-palantir-warning/20 flex items-center justify-center flex-shrink-0">
              <Lock className="w-6 h-6 text-palantir-warning" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-palantir-warning mb-2">
                Modules en développement
              </h3>
              <p className="text-palantir-text-muted mb-4 text-sm">
                Ces modules nécessitent des conventions de partenariat :
              </p>
              <ul className="space-y-2 text-sm text-palantir-text-muted">
                <li className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-blue-400" />
                  <span>SDIS 35 - Incendie et Secours</span>
                </li>
                <li className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-400" />
                  <span>Préfecture - Gestion de crise</span>
                </li>
                <li className="flex items-center gap-2">
                  <Radio className="w-4 h-4 text-green-400" />
                  <span>SAMU 35 - Régulation médicale</span>
                </li>
                <li className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-yellow-400" />
                  <span>Police / Gendarmerie</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Preview of Features */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-palantir-text mb-4">
          Fonctionnalités prévues
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <FeaturePreview
          icon={Flame}
          title="Incidents en cours"
          description="Visualisation temps réel des interventions SDIS et positionnement des véhicules de secours"
          color="text-orange-400"
        />
        <FeaturePreview
          icon={Waves}
          title="Risques naturels"
          description="Surveillance Vigicrues, alertes météo, risques d'inondation de la Vilaine"
          color="text-blue-400"
        />
        <FeaturePreview
          icon={Wind}
          title="Qualité de l'air"
          description="Données Air Breizh en temps réel, alertes pollution, recommandations"
          color="text-cyan-400"
        />
        <FeaturePreview
          icon={Zap}
          title="Réseau électrique"
          description="État du réseau Enedis, coupures en cours, zones impactées"
          color="text-yellow-400"
        />
        <FeaturePreview
          icon={Phone}
          title="Coordination"
          description="Interface de communication entre services, main courante partagée"
          color="text-green-400"
        />
        <FeaturePreview
          icon={MapPin}
          title="Cartographie opérationnelle"
          description="Visualisation des périmètres de sécurité, itinéraires de déviation"
          color="text-red-400"
        />
      </div>

      {/* Contact */}
      <div className="mt-8 card-palantir p-4">
        <div className="flex items-center gap-3">
          <FileText className="w-5 h-5 text-palantir-text-muted" />
          <p className="text-sm text-palantir-text-muted">
            Pour plus d'informations sur les conventions de partenariat, contactez la Direction 
            du Numérique de Rennes Métropole.
          </p>
        </div>
      </div>
    </div>
  );
}

// === Feature Preview Component ===
interface FeaturePreviewProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  color: string;
}

function FeaturePreview({ icon: Icon, title, description, color }: FeaturePreviewProps) {
  return (
    <div className="card-palantir p-4 opacity-60">
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-lg bg-palantir-card flex items-center justify-center ${color}/20`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-palantir-text mb-1">{title}</h4>
          <p className="text-xs text-palantir-text-muted">{description}</p>
        </div>
      </div>
      <div className="mt-3 h-24 bg-palantir-border/30 rounded-lg flex items-center justify-center">
        <span className="text-xs text-palantir-text-muted">Aperçu non disponible</span>
      </div>
    </div>
  );
}

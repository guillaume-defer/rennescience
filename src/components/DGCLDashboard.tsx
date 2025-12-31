import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Shield,
  Heart,
  Briefcase,
  GraduationCap,
  Baby,
  Dumbbell,
  Theater,
  Compass,
  Award,
  TrendingUp,
  Building2,
  Map as MapIcon,
  Home,
  TreePine,
  Droplets,
  Wifi,
  Zap,
  AlertCircle,
  CheckCircle,
  Clock,
  Activity,
  AlertTriangle,
  XCircle,
  Scale,
  RefreshCw,
} from 'lucide-react';
import { DGCL_COMPETENCIES, DGCL_CATEGORIES } from '../config/dgclCompetencies';
import { metropolitanDataService, type CompetencyData, type LegalComplianceIndicator } from '../services/metropolitanDataService';
import type { DashboardStats, TrafficAlert, DGCLCompetency } from '../types';

interface DGCLDashboardProps {
  stats: DashboardStats | null;
  alerts: TrafficAlert[];
  loading: boolean;
}

// Mapping des icônes
const ICON_MAP: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  Shield, Heart, Briefcase, GraduationCap, Baby, Dumbbell, Theater, Compass,
  Award, TrendingUp, Building2, Map: MapIcon, Home, TreePine, Droplets, Wifi, Zap,
};

export default function DGCLDashboard({ stats, alerts, loading }: DGCLDashboardProps) {
  const [metroData, setMetroData] = useState<Map<string, CompetencyData>>(new Map());
  const [legalCompliance, setLegalCompliance] = useState<LegalComplianceIndicator[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'competencies' | 'legal'>('competencies');

  // Charger les données métropolitaines
  const loadMetroData = useCallback(async () => {
    setDataLoading(true);
    try {
      const [data, legal] = await Promise.all([
        metropolitanDataService.loadAllData(),
        metropolitanDataService.getAllLegalCompliance(),
      ]);
      setMetroData(data);
      setLegalCompliance(legal);
    } catch (error) {
      console.error('[DGCLDashboard] Error loading metro data:', error);
    } finally {
      setDataLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMetroData();
  }, [loadMetroData]);

  // Enrichir les compétences avec les données temps réel
  const enrichedCompetencies = useMemo(() => {
    return DGCL_COMPETENCIES.map(comp => {
      // Données transport temps réel
      if (comp.id === 'energie-transports' && stats) {
        return {
          ...comp,
          indicators: [
            { id: 'tra-1', name: 'Vélos disponibles', value: stats.transport.bikesAvailable, status: 'live' as const },
            { id: 'tra-2', name: 'Places P+R libres', value: stats.transport.parkingSpacesAvailable, status: 'live' as const },
            { id: 'tra-3', name: 'Bus en service', value: stats.transport.busesInService, status: 'live' as const },
            { id: 'tra-4', name: 'Alertes trafic', value: stats.transport.activeAlerts, status: 'live' as const },
          ],
        };
      }

      // Données métropolitaines
      const competencyData = metroData.get(comp.id);
      if (competencyData) {
        return {
          ...comp,
          indicators: competencyData.indicators.map(ind => ({
            id: ind.id,
            name: comp.indicators.find(i => i.id === ind.id)?.name || ind.id,
            value: ind.value,
            unit: ind.unit,
            status: ind.status,
          })),
          legalCompliance: competencyData.legalCompliance,
        };
      }

      return comp;
    });
  }, [stats, metroData]);

  // Stats de conformité légale
  const complianceStats = useMemo(() => {
    const total = legalCompliance.length;
    const compliant = legalCompliance.filter(l => l.status === 'compliant').length;
    const nonCompliant = legalCompliance.filter(l => l.status === 'non-compliant').length;
    const warning = legalCompliance.filter(l => l.status === 'warning').length;
    const unknown = legalCompliance.filter(l => l.status === 'unknown').length;
    return { total, compliant, nonCompliant, warning, unknown };
  }, [legalCompliance]);

  return (
    <div className="h-full overflow-auto p-6 grid-overlay">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-palantir-text mb-2">
              Tableau de Bord Métropolitain
            </h2>
            <p className="text-palantir-text-muted">
              Compétences DGCL • Conformité légale • Aide à la décision
            </p>
          </div>
          <button
            onClick={loadMetroData}
            disabled={dataLoading}
            className="flex items-center gap-2 px-4 py-2 bg-palantir-card border border-palantir-border rounded-lg hover:bg-palantir-hover transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${dataLoading ? 'animate-spin' : ''}`} />
            <span className="text-sm">Actualiser</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('competencies')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'competencies'
              ? 'bg-palantir-accent/20 text-palantir-accent border border-palantir-accent'
              : 'bg-palantir-card text-palantir-text-muted hover:text-white border border-palantir-border'
          }`}
        >
          Compétences ({DGCL_COMPETENCIES.length})
        </button>
        <button
          onClick={() => setActiveTab('legal')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
            activeTab === 'legal'
              ? 'bg-palantir-accent/20 text-palantir-accent border border-palantir-accent'
              : 'bg-palantir-card text-palantir-text-muted hover:text-white border border-palantir-border'
          }`}
        >
          <Scale className="w-4 h-4" />
          Conformité légale ({legalCompliance.length})
          {complianceStats.nonCompliant > 0 && (
            <span className="px-1.5 py-0.5 bg-red-500/30 text-red-400 rounded text-xs">
              {complianceStats.nonCompliant}
            </span>
          )}
          {complianceStats.warning > 0 && (
            <span className="px-1.5 py-0.5 bg-amber-500/30 text-amber-400 rounded text-xs">
              {complianceStats.warning}
            </span>
          )}
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
        <StatCard
          label="Compétences actives"
          value={DGCL_COMPETENCIES.filter(c => c.status === 'active').length}
          total={17}
          icon={CheckCircle}
          color="text-palantir-accent"
        />
        <StatCard
          label="Sources connectées"
          value={DGCL_COMPETENCIES.flatMap(c => c.dataSources.filter(d => d.isAvailable)).length}
          icon={Activity}
          color="text-palantir-info"
        />
        <StatCard
          label="Conformes"
          value={complianceStats.compliant}
          icon={CheckCircle}
          color="text-green-400"
        />
        <StatCard
          label="Attention"
          value={complianceStats.warning}
          icon={AlertTriangle}
          color="text-amber-400"
        />
        <StatCard
          label="Non-conformes"
          value={complianceStats.nonCompliant}
          icon={XCircle}
          color="text-red-400"
        />
        <StatCard
          label="Alertes trafic"
          value={alerts.length}
          icon={AlertCircle}
          color={alerts.length > 0 ? 'text-palantir-warning' : 'text-palantir-text-muted'}
        />
      </div>

      {/* Content based on active tab */}
      {activeTab === 'competencies' ? (
        // Competencies Grid by Category
        <div className="space-y-8">
          {DGCL_CATEGORIES.map(category => {
            const competencies = enrichedCompetencies.filter(c => c.category === category.name);
            if (competencies.length === 0) return null;

            return (
              <div key={category.id}>
                <div className="flex items-center gap-3 mb-4">
                  <div 
                    className="w-1 h-6 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <h3 className="text-lg font-semibold text-palantir-text">
                    {category.name}
                  </h3>
                  <span className="text-xs text-palantir-text-muted">
                    {competencies.length} compétence{competencies.length > 1 ? 's' : ''}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {competencies.map(comp => (
                    <CompetencyCard
                      key={comp.id}
                      competency={comp}
                      categoryColor={category.color}
                      loading={loading || dataLoading}
                      legalCompliance={metroData.get(comp.id)?.legalCompliance || []}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        // Legal Compliance View
        <div className="space-y-6">
          {/* EGalim Section */}
          <LegalSection
            title="🍽️ Restauration Collective - EGalim"
            items={legalCompliance.filter(l => l.id.startsWith('egalim'))}
          />

          {/* Logement SRU Section */}
          <LegalSection
            title="🏠 Logement - SRU & DPE"
            items={legalCompliance.filter(l => l.id.startsWith('log-'))}
          />

          {/* Urbanisme Section */}
          <LegalSection
            title="🏗️ Urbanisme - ZAN & PLUi"
            items={legalCompliance.filter(l => l.id.startsWith('urb-'))}
          />

          {/* Transport Section */}
          <LegalSection
            title="🚗 Transport & Mobilité"
            items={legalCompliance.filter(l => ['pdm', 'zfe', 'vel-stationnement'].includes(l.id))}
          />

          {/* Environnement Section */}
          <LegalSection
            title="🌿 Environnement & Climat"
            items={legalCompliance.filter(l => l.id.startsWith('env-'))}
          />

          {/* Déchets Section */}
          <LegalSection
            title="♻️ Déchets & Économie Circulaire"
            items={legalCompliance.filter(l => l.id.startsWith('dec-'))}
          />

          {/* Other */}
          <LegalSection
            title="📋 Autres obligations"
            items={legalCompliance.filter(l => 
              !l.id.startsWith('egalim') && 
              !l.id.startsWith('log-') && 
              !l.id.startsWith('urb-') &&
              !l.id.startsWith('env-') &&
              !l.id.startsWith('dec-') &&
              !['pdm', 'zfe', 'vel-stationnement'].includes(l.id)
            )}
          />
        </div>
      )}

      {/* Active Alerts Section */}
      {alerts.length > 0 && activeTab === 'competencies' && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-palantir-text mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-palantir-warning" />
            Alertes en cours ({alerts.length})
          </h3>
          <div className="space-y-3">
            {alerts.slice(0, 5).map(alert => (
              <AlertCard key={alert.id} alert={alert} />
            ))}
            {alerts.length > 5 && (
              <p className="text-sm text-palantir-text-muted text-center py-2">
                +{alerts.length - 5} autres alertes
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// === Legal Section Component ===
interface LegalSectionProps {
  title: string;
  items: LegalComplianceIndicator[];
}

function LegalSection({ title, items }: LegalSectionProps) {
  if (items.length === 0) return null;

  return (
    <div className="card-palantir p-4">
      <h4 className="text-md font-semibold text-palantir-text mb-4">{title}</h4>
      <div className="space-y-3">
        {items.map(item => (
          <LegalComplianceCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}

// === Legal Compliance Card ===
interface LegalComplianceCardProps {
  item: LegalComplianceIndicator;
}

function LegalComplianceCard({ item }: LegalComplianceCardProps) {
  const statusColors = {
    compliant: 'border-green-500/30 bg-green-500/5',
    'non-compliant': 'border-red-500/30 bg-red-500/5',
    warning: 'border-amber-500/30 bg-amber-500/5',
    unknown: 'border-slate-500/30 bg-slate-500/5',
  };

  const statusIcons = {
    compliant: <CheckCircle className="w-5 h-5 text-green-400" />,
    'non-compliant': <XCircle className="w-5 h-5 text-red-400" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-400" />,
    unknown: <Clock className="w-5 h-5 text-slate-400" />,
  };

  const statusLabels = {
    compliant: 'Conforme',
    'non-compliant': 'Non conforme',
    warning: 'Attention requise',
    unknown: 'À vérifier',
  };

  return (
    <div className={`rounded-lg border p-3 ${statusColors[item.status]}`}>
      <div className="flex items-start gap-3">
        {statusIcons[item.status]}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h5 className="font-medium text-palantir-text text-sm">{item.law}</h5>
            <span className={`text-xs px-2 py-0.5 rounded ${
              item.status === 'compliant' ? 'bg-green-500/20 text-green-400' :
              item.status === 'non-compliant' ? 'bg-red-500/20 text-red-400' :
              item.status === 'warning' ? 'bg-amber-500/20 text-amber-400' :
              'bg-slate-500/20 text-slate-400'
            }`}>
              {statusLabels[item.status]}
            </span>
          </div>
          <p className="text-xs text-palantir-text-muted mb-2">{item.description}</p>
          <div className="flex flex-wrap gap-3 text-xs">
            <div>
              <span className="text-palantir-text-muted">Seuil: </span>
              <span className="text-palantir-text font-mono">{item.threshold}{item.unit || ''}</span>
            </div>
            {item.currentValue !== null && (
              <div>
                <span className="text-palantir-text-muted">Actuel: </span>
                <span className={`font-mono ${
                  item.status === 'compliant' ? 'text-green-400' :
                  item.status === 'non-compliant' ? 'text-red-400' :
                  'text-amber-400'
                }`}>
                  {item.currentValue}{item.unit || ''}
                </span>
              </div>
            )}
            {item.deadline && (
              <div>
                <span className="text-palantir-text-muted">Échéance: </span>
                <span className="text-palantir-text font-mono">{item.deadline}</span>
              </div>
            )}
          </div>
          <p className="text-[10px] text-palantir-text-muted mt-2 italic">{item.lawReference}</p>
        </div>
      </div>
    </div>
  );
}

// === Stat Card Component ===
interface StatCardProps {
  label: string;
  value: number;
  total?: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

function StatCard({ label, value, total, icon: Icon, color }: StatCardProps) {
  return (
    <div className="card-palantir p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="stat-label mb-1">{label}</p>
          <p className={`stat-value ${color}`}>
            {value}
            {total && <span className="text-palantir-text-muted text-lg">/{total}</span>}
          </p>
        </div>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
    </div>
  );
}

// === Competency Card Component ===
interface CompetencyCardProps {
  competency: DGCLCompetency & { legalCompliance?: LegalComplianceIndicator[] };
  categoryColor: string;
  loading: boolean;
  legalCompliance: LegalComplianceIndicator[];
}

function CompetencyCard({ competency, categoryColor, loading, legalCompliance }: CompetencyCardProps) {
  const Icon = ICON_MAP[competency.icon] || Shield;
  const isActive = competency.status === 'active';
  const isDevelopment = competency.status === 'development';

  // Calculer le statut de conformité
  const complianceIssues = legalCompliance.filter(l => l.status === 'non-compliant' || l.status === 'warning');

  return (
    <div className={`card-palantir p-4 relative overflow-hidden ${isActive ? 'glow-accent' : ''}`}>
      {/* Status Badge */}
      <div className="absolute top-3 right-3 flex gap-1">
        {complianceIssues.length > 0 && (
          <span className="data-badge bg-amber-500/20 text-amber-400">
            <AlertTriangle className="w-3 h-3" />
            {complianceIssues.length}
          </span>
        )}
        {isActive ? (
          <span className="data-badge data-badge-live">
            <span className="status-dot status-dot-live" />
            Live
          </span>
        ) : isDevelopment ? (
          <span className="data-badge data-badge-warning">
            <Clock className="w-3 h-3" />
            Dev
          </span>
        ) : (
          <span className="data-badge">Indisponible</span>
        )}
      </div>

      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <div 
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${categoryColor}20` }}
        >
          <Icon className="w-5 h-5" style={{ color: categoryColor }} />
        </div>
        <div className="flex-1 min-w-0 pr-16">
          <h4 className="font-semibold text-palantir-text truncate">
            {competency.name}
          </h4>
          <p className="text-xs text-palantir-text-muted line-clamp-2">
            {competency.description}
          </p>
        </div>
      </div>

      {/* Indicators */}
      {isActive && competency.indicators.length > 0 && (
        <div className="space-y-2 mt-4 pt-4 border-t border-palantir-border">
          {competency.indicators.map(indicator => (
            <div key={indicator.id} className="flex items-center justify-between">
              <span className="text-xs text-palantir-text-muted">{indicator.name}</span>
              {loading ? (
                <div className="w-12 h-4 skeleton rounded" />
              ) : (
                <span className={`text-sm font-mono font-semibold ${
                  indicator.status === 'live' ? 'text-palantir-accent' :
                  indicator.status === 'error' ? 'text-red-400' :
                  'text-palantir-text'
                }`}>
                  {indicator.value !== null ? (
                    typeof indicator.value === 'number' 
                      ? indicator.value.toLocaleString('fr-FR')
                      : indicator.value
                  ) : '-'}
                  {indicator.unit && <span className="text-palantir-text-muted ml-1">{indicator.unit}</span>}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Data Sources Count */}
      {competency.dataSources.length > 0 && (
        <div className="mt-4 pt-3 border-t border-palantir-border">
          <span className="text-[10px] text-palantir-text-muted uppercase tracking-wider">
            {competency.dataSources.filter(d => d.isAvailable).length} / {competency.dataSources.length} sources connectées
          </span>
        </div>
      )}

      {/* Development placeholder */}
      {isDevelopment && (
        <div className="mt-4 p-3 bg-palantir-warning/5 border border-palantir-warning/20 rounded-lg">
          <p className="text-xs text-palantir-warning">
            Cette compétence nécessite des conventions de données avec les partenaires institutionnels.
          </p>
        </div>
      )}
    </div>
  );
}

// === Alert Card Component ===
interface AlertCardProps {
  alert: TrafficAlert;
}

function AlertCard({ alert }: AlertCardProps) {
  const severityColors = {
    info: 'border-palantir-info/30 bg-palantir-info/5',
    warning: 'border-palantir-warning/30 bg-palantir-warning/5',
    critical: 'border-palantir-danger/30 bg-palantir-danger/5',
  };

  const severityTextColors = {
    info: 'text-palantir-info',
    warning: 'text-palantir-warning',
    critical: 'text-palantir-danger',
  };

  return (
    <div className={`rounded-lg border p-4 ${severityColors[alert.severity]}`}>
      <div className="flex items-start gap-3">
        <AlertCircle className={`w-5 h-5 flex-shrink-0 ${severityTextColors[alert.severity]}`} />
        <div className="flex-1 min-w-0">
          <h4 className={`font-medium ${severityTextColors[alert.severity]}`}>
            {alert.title}
          </h4>
          <p className="text-sm text-palantir-text-muted mt-1 line-clamp-2">
            {alert.description}
          </p>
          {alert.affectedLines.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {alert.affectedLines.map(line => (
                <span 
                  key={line}
                  className="px-2 py-0.5 text-xs bg-palantir-card rounded border border-palantir-border"
                >
                  {line}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

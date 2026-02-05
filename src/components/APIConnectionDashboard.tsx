/**
 * API Connection Dashboard
 * Visual dashboard for monitoring all API connections
 */

import { useState, useMemo } from 'react';
import {
  Activity,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Wifi,
  WifiOff,
  Database,
  ChevronDown,
  ChevronRight,
  Zap,
  Server,
  Globe,
  Trash2,
  Play,
  Pause,
  X,
} from 'lucide-react';
import { useAPIMonitor } from '../hooks/useAPIMonitor';
import type { APICategory, APIHealthStatus } from '../services/apiConnectionManager';

interface APIConnectionDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORY_LABELS: Record<APICategory, string> = {
  transport: 'Transport',
  environment: 'Environnement',
  education: 'Éducation',
  urban: 'Urbanisme',
  regional: 'Régional',
  other: 'Autres',
};

const CATEGORY_ICONS: Record<APICategory, React.ReactNode> = {
  transport: <Activity className="w-4 h-4" />,
  environment: <Globe className="w-4 h-4" />,
  education: <Database className="w-4 h-4" />,
  urban: <Server className="w-4 h-4" />,
  regional: <Globe className="w-4 h-4" />,
  other: <Database className="w-4 h-4" />,
};

export default function APIConnectionDashboard({ isOpen, onClose }: APIConnectionDashboardProps) {
  const {
    endpoints,
    healthStatus,
    summary,
    isChecking,
    lastFullCheck,
    checkAll,
    checkEndpoint,
    startMonitoring,
    stopMonitoring,
    clearCache,
    getStatusColor,
  } = useAPIMonitor(true);

  const [expandedCategories, setExpandedCategories] = useState<Set<APICategory>>(
    new Set(['transport'])
  );
  const [isMonitoringActive, setIsMonitoringActive] = useState(true);
  const [selectedEndpoint, setSelectedEndpoint] = useState<string | null>(null);

  // Group endpoints by category
  const endpointsByCategory = useMemo(() => {
    const grouped = new Map<APICategory, typeof endpoints>();

    endpoints.forEach(endpoint => {
      const existing = grouped.get(endpoint.category) || [];
      grouped.set(endpoint.category, [...existing, endpoint]);
    });

    return grouped;
  }, [endpoints]);

  // Get category stats
  const getCategoryStats = (category: APICategory) => {
    const categoryEndpoints = endpointsByCategory.get(category) || [];
    let online = 0;
    let offline = 0;
    let degraded = 0;

    categoryEndpoints.forEach(endpoint => {
      const status = healthStatus.get(endpoint.id);
      if (status?.status === 'online') online++;
      else if (status?.status === 'offline') offline++;
      else if (status?.status === 'degraded') degraded++;
    });

    return { total: categoryEndpoints.length, online, offline, degraded };
  };

  const toggleCategory = (category: APICategory) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const toggleMonitoring = () => {
    if (isMonitoringActive) {
      stopMonitoring();
    } else {
      startMonitoring(60000);
    }
    setIsMonitoringActive(!isMonitoringActive);
  };

  const handleRefreshAll = async () => {
    await checkAll();
  };

  const handleRefreshEndpoint = async (endpointId: string) => {
    await checkEndpoint(endpointId);
  };

  const getStatusBadge = (status: APIHealthStatus['status']) => {
    switch (status) {
      case 'online':
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs rounded-full">
            <CheckCircle className="w-3 h-3" />
            En ligne
          </span>
        );
      case 'offline':
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded-full">
            <XCircle className="w-3 h-3" />
            Hors ligne
          </span>
        );
      case 'degraded':
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs rounded-full">
            <AlertTriangle className="w-3 h-3" />
            Dégradé
          </span>
        );
      case 'checking':
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded-full">
            <RefreshCw className="w-3 h-3 animate-spin" />
            Vérification
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 bg-gray-500/20 text-gray-400 text-xs rounded-full">
            <Clock className="w-3 h-3" />
            Inconnu
          </span>
        );
    }
  };

  const formatTime = (date: Date | null) => {
    if (!date) return '-';
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const formatResponseTime = (ms: number | null) => {
    if (ms === null) return '-';
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-4xl max-h-[90vh] m-4 bg-palantir-bg border border-palantir-border rounded-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-palantir-border bg-palantir-surface">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-palantir-accent/20 rounded-lg">
              <Zap className="w-5 h-5 text-palantir-accent" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-palantir-text">
                Gestionnaire de Connexions API
              </h2>
              <p className="text-xs text-palantir-text-muted">
                Monitoring en temps réel de {summary.total} endpoints
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-palantir-hover rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-palantir-text-muted" />
          </button>
        </div>

        {/* Summary Bar */}
        <div className="px-6 py-3 bg-palantir-card border-b border-palantir-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              {/* Status counts */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="text-sm text-palantir-text">
                    <span className="font-mono font-bold">{summary.online}</span>
                    <span className="text-palantir-text-muted ml-1">en ligne</span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-400" />
                  <span className="text-sm text-palantir-text">
                    <span className="font-mono font-bold">{summary.offline}</span>
                    <span className="text-palantir-text-muted ml-1">hors ligne</span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-400" />
                  <span className="text-sm text-palantir-text">
                    <span className="font-mono font-bold">{summary.degraded}</span>
                    <span className="text-palantir-text-muted ml-1">dégradé</span>
                  </span>
                </div>
              </div>

              {/* Response time */}
              <div className="flex items-center gap-2 text-sm text-palantir-text-muted">
                <Clock className="w-4 h-4" />
                <span>Latence moy: <span className="font-mono text-palantir-text">{summary.avgResponseTime}ms</span></span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={toggleMonitoring}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  isMonitoringActive
                    ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                    : 'bg-gray-500/20 text-gray-400 hover:bg-gray-500/30'
                }`}
                title={isMonitoringActive ? 'Pause monitoring' : 'Start monitoring'}
              >
                {isMonitoringActive ? (
                  <>
                    <Pause className="w-4 h-4" />
                    <Wifi className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    <WifiOff className="w-4 h-4" />
                  </>
                )}
              </button>
              <button
                onClick={clearCache}
                className="flex items-center gap-2 px-3 py-1.5 bg-palantir-hover rounded-lg text-sm text-palantir-text-muted hover:text-palantir-text transition-colors"
                title="Vider le cache"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={handleRefreshAll}
                disabled={isChecking}
                className="flex items-center gap-2 px-3 py-1.5 bg-palantir-accent/20 text-palantir-accent rounded-lg text-sm hover:bg-palantir-accent/30 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
                Tester tout
              </button>
            </div>
          </div>

          {lastFullCheck && (
            <p className="text-xs text-palantir-text-muted mt-2">
              Dernière vérification complète: {formatTime(lastFullCheck)}
            </p>
          )}
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-3">
            {Array.from(endpointsByCategory.entries()).map(([category, categoryEndpoints]) => {
              const stats = getCategoryStats(category);
              const isExpanded = expandedCategories.has(category);

              return (
                <div
                  key={category}
                  className="border border-palantir-border rounded-lg overflow-hidden"
                >
                  {/* Category Header */}
                  <button
                    onClick={() => toggleCategory(category)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-palantir-surface hover:bg-palantir-hover transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-palantir-text-muted" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-palantir-text-muted" />
                      )}
                      <span className="text-palantir-accent">
                        {CATEGORY_ICONS[category]}
                      </span>
                      <span className="font-medium text-palantir-text">
                        {CATEGORY_LABELS[category]}
                      </span>
                      <span className="text-xs text-palantir-text-muted">
                        ({stats.total} APIs)
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {stats.online > 0 && (
                        <span className="flex items-center gap-1 text-xs text-emerald-400">
                          <CheckCircle className="w-3 h-3" />
                          {stats.online}
                        </span>
                      )}
                      {stats.offline > 0 && (
                        <span className="flex items-center gap-1 text-xs text-red-400">
                          <XCircle className="w-3 h-3" />
                          {stats.offline}
                        </span>
                      )}
                      {stats.degraded > 0 && (
                        <span className="flex items-center gap-1 text-xs text-amber-400">
                          <AlertTriangle className="w-3 h-3" />
                          {stats.degraded}
                        </span>
                      )}
                    </div>
                  </button>

                  {/* Endpoints List */}
                  {isExpanded && (
                    <div className="divide-y divide-palantir-border">
                      {categoryEndpoints.map(endpoint => {
                        const status = healthStatus.get(endpoint.id);
                        const isSelected = selectedEndpoint === endpoint.id;

                        return (
                          <div
                            key={endpoint.id}
                            className={`px-4 py-3 hover:bg-palantir-hover/50 transition-colors ${
                              isSelected ? 'bg-palantir-hover/30' : ''
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`text-lg ${getStatusColor(status?.status || 'unknown')}`}
                                  >
                                    ●
                                  </span>
                                  <span className="font-medium text-palantir-text truncate">
                                    {endpoint.name}
                                  </span>
                                  {getStatusBadge(status?.status || 'unknown')}
                                </div>
                                <p className="text-xs text-palantir-text-muted mt-1 truncate">
                                  {endpoint.description}
                                </p>
                              </div>

                              <div className="flex items-center gap-4 ml-4">
                                {/* Stats */}
                                <div className="hidden sm:flex items-center gap-4 text-xs text-palantir-text-muted">
                                  {status?.responseTime !== null && (
                                    <span className="font-mono">
                                      {formatResponseTime(status?.responseTime ?? null)}
                                    </span>
                                  )}
                                  {status?.recordCount != null && status.recordCount > 0 && (
                                    <span className="font-mono">
                                      {status.recordCount} records
                                    </span>
                                  )}
                                </div>

                                {/* Actions */}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRefreshEndpoint(endpoint.id);
                                  }}
                                  className="p-1.5 hover:bg-palantir-hover rounded transition-colors"
                                  title="Tester cet endpoint"
                                >
                                  <RefreshCw
                                    className={`w-4 h-4 text-palantir-text-muted ${
                                      status?.status === 'checking' ? 'animate-spin' : ''
                                    }`}
                                  />
                                </button>
                                <button
                                  onClick={() =>
                                    setSelectedEndpoint(isSelected ? null : endpoint.id)
                                  }
                                  className="p-1.5 hover:bg-palantir-hover rounded transition-colors"
                                  title="Voir les détails"
                                >
                                  <ChevronDown
                                    className={`w-4 h-4 text-palantir-text-muted transition-transform ${
                                      isSelected ? 'rotate-180' : ''
                                    }`}
                                  />
                                </button>
                              </div>
                            </div>

                            {/* Expanded Details */}
                            {isSelected && status && (
                              <div className="mt-3 pt-3 border-t border-palantir-border">
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                                  <div>
                                    <span className="text-palantir-text-muted">Dernière vérif.</span>
                                    <p className="font-mono text-palantir-text">
                                      {formatTime(status.lastCheck)}
                                    </p>
                                  </div>
                                  <div>
                                    <span className="text-palantir-text-muted">Dernier succès</span>
                                    <p className="font-mono text-palantir-text">
                                      {formatTime(status.lastSuccess)}
                                    </p>
                                  </div>
                                  <div>
                                    <span className="text-palantir-text-muted">Erreurs totales</span>
                                    <p className={`font-mono ${status.errorCount > 0 ? 'text-red-400' : 'text-palantir-text'}`}>
                                      {status.errorCount}
                                    </p>
                                  </div>
                                  <div>
                                    <span className="text-palantir-text-muted">Échecs consécutifs</span>
                                    <p className={`font-mono ${status.consecutiveFailures > 0 ? 'text-amber-400' : 'text-palantir-text'}`}>
                                      {status.consecutiveFailures}
                                    </p>
                                  </div>
                                </div>

                                {status.errorMessage && (
                                  <div className="mt-3 p-2 bg-red-500/10 border border-red-500/20 rounded">
                                    <p className="text-xs text-red-400 font-mono">
                                      {status.errorMessage}
                                    </p>
                                  </div>
                                )}

                                <div className="mt-3 p-2 bg-palantir-card rounded">
                                  <p className="text-xs text-palantir-text-muted font-mono break-all">
                                    {endpoint.baseUrl}/{endpoint.endpoint}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-palantir-border bg-palantir-surface">
          <div className="flex items-center justify-between text-xs text-palantir-text-muted">
            <span>
              Cache actif avec TTL variable par endpoint
            </span>
            <span className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isMonitoringActive ? 'bg-emerald-400 animate-pulse' : 'bg-gray-400'}`} />
              {isMonitoringActive ? 'Monitoring actif' : 'Monitoring en pause'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

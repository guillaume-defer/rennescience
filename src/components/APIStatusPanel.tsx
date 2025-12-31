import { useState, useEffect } from 'react';
import {
  Wifi,
  WifiOff,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  Database,
} from 'lucide-react';
import { API_REGISTRY } from '../config/apiConfig';
import { territorialDataService } from '../services/territorialDataService';

interface APIStatus {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'error' | 'checking';
  responseTime: number;
  lastCheck: Date;
  recordCount?: number;
}

interface APIStatusPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function APIStatusPanel({ isOpen, onClose }: APIStatusPanelProps) {
  const [statuses, setStatuses] = useState<APIStatus[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [lastFullCheck, setLastFullCheck] = useState<Date | null>(null);

  // Initialiser les statuts
  useEffect(() => {
    const initialStatuses: APIStatus[] = API_REGISTRY.map(api => ({
      id: api.id,
      name: api.name,
      status: 'checking' as const,
      responseTime: 0,
      lastCheck: new Date(),
    }));
    setStatuses(initialStatuses);
    
    // Lancer une vérification automatique au montage
    checkAllAPIs();
  }, []);

  const checkAllAPIs = async () => {
    setIsChecking(true);
    
    try {
      const results = await territorialDataService.checkAllAPIStatuses();
      
      setStatuses(results.map(r => ({
        id: r.id,
        name: r.name,
        status: r.status,
        responseTime: r.responseTime,
        lastCheck: r.lastCheck,
        recordCount: r.recordCount,
      })));
      
      setLastFullCheck(new Date());
    } catch (error) {
      console.error('Error checking APIs:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const onlineCount = statuses.filter(s => s.status === 'online').length;
  const totalCount = statuses.length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="card-palantir w-full max-w-lg mx-4 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-palantir-border">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${onlineCount === totalCount ? 'bg-emerald-500/20' : 'bg-palantir-warning/20'}`}>
              {onlineCount === totalCount ? (
                <Wifi className="w-5 h-5 text-emerald-400" />
              ) : (
                <WifiOff className="w-5 h-5 text-palantir-warning" />
              )}
            </div>
            <div>
              <h2 className="font-semibold text-palantir-text">APIs Connectées</h2>
              <p className="text-xs text-palantir-text-muted">
                {onlineCount}/{totalCount} sources actives
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={checkAllAPIs}
              disabled={isChecking}
              className="p-2 rounded-lg hover:bg-palantir-hover transition-colors disabled:opacity-50"
              title="Rafraîchir les statuts"
            >
              <RefreshCw className={`w-4 h-4 text-palantir-text-muted ${isChecking ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-palantir-hover transition-colors"
            >
              <XCircle className="w-5 h-5 text-palantir-text-muted" />
            </button>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-3 gap-3 p-4 border-b border-palantir-border">
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-400">{onlineCount}</div>
            <div className="text-xs text-palantir-text-muted">En ligne</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-400">{statuses.filter(s => s.status === 'offline' || s.status === 'error').length}</div>
            <div className="text-xs text-palantir-text-muted">Hors ligne</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-palantir-text">
              {Math.round(statuses.filter(s => s.status === 'online').reduce((sum, s) => sum + s.responseTime, 0) / Math.max(onlineCount, 1))}ms
            </div>
            <div className="text-xs text-palantir-text-muted">Latence moy.</div>
          </div>
        </div>

        {/* API List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {statuses.map(api => (
            <APIStatusItem key={api.id} api={api} />
          ))}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-palantir-border bg-palantir-surface/50">
          <div className="flex items-center justify-between text-xs text-palantir-text-muted">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>
                Dernière vérification : {lastFullCheck 
                  ? lastFullCheck.toLocaleTimeString('fr-FR')
                  : 'En cours...'
                }
              </span>
            </div>
            <span>Open Data APIs</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// === API Status Item Component ===
function APIStatusItem({ api }: { api: APIStatus }) {
  const [expanded, setExpanded] = useState(false);

  const statusConfig = {
    online: {
      icon: CheckCircle2,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      label: 'En ligne',
    },
    offline: {
      icon: XCircle,
      color: 'text-red-400',
      bg: 'bg-red-500/10',
      label: 'Hors ligne',
    },
    error: {
      icon: AlertCircle,
      color: 'text-orange-400',
      bg: 'bg-orange-500/10',
      label: 'Erreur',
    },
    checking: {
      icon: RefreshCw,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
      label: 'Vérification...',
    },
  };

  const config = statusConfig[api.status];
  const StatusIcon = config.icon;

  return (
    <div className={`rounded-lg border border-palantir-border overflow-hidden ${config.bg}`}>
      <button
        onClick={() => setExpanded(prev => !prev)}
        className="w-full flex items-center gap-3 p-3 hover:bg-palantir-hover/30 transition-colors"
      >
        <StatusIcon className={`w-4 h-4 ${config.color} ${api.status === 'checking' ? 'animate-spin' : ''}`} />
        
        <div className="flex-1 text-left">
          <p className="text-sm font-medium text-palantir-text">{api.name}</p>
        </div>

        <div className="flex items-center gap-3">
          {api.status === 'online' && (
            <span className="text-xs font-mono text-palantir-text-muted">
              {api.responseTime}ms
            </span>
          )}
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-palantir-text-muted" />
          ) : (
            <ChevronDown className="w-4 h-4 text-palantir-text-muted" />
          )}
        </div>
      </button>

      {expanded && (
        <div className="px-3 pb-3 pt-1 border-t border-palantir-border/50">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-palantir-text-muted">Statut</span>
              <p className={`font-medium ${config.color}`}>{config.label}</p>
            </div>
            <div>
              <span className="text-palantir-text-muted">Temps de réponse</span>
              <p className="font-mono text-palantir-text">{api.responseTime}ms</p>
            </div>
            {api.recordCount !== undefined && (
              <div>
                <span className="text-palantir-text-muted">Enregistrements</span>
                <p className="font-mono text-palantir-text flex items-center gap-1">
                  <Database className="w-3 h-3" />
                  {api.recordCount.toLocaleString('fr-FR')}
                </p>
              </div>
            )}
            <div>
              <span className="text-palantir-text-muted">Dernière vérification</span>
              <p className="text-palantir-text">
                {api.lastCheck.toLocaleTimeString('fr-FR')}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

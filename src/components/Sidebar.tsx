import { 
  LayoutDashboard, 
  Map, 
  AlertTriangle, 
  BrainCircuit,
  Bike,
  Car,
  Bus,
  AlertCircle,
} from 'lucide-react';
import type { NavigationView, DashboardStats } from '../types';

interface SidebarProps {
  isOpen: boolean;
  currentView: NavigationView;
  onNavigate: (view: NavigationView) => void;
  stats: DashboardStats | null;
}

const NAV_ITEMS = [
  { id: 'dashboard' as const, label: 'Compétences DGCL', icon: LayoutDashboard, available: true },
  { id: 'map' as const, label: 'Carte territoriale', icon: Map, available: true },
  { id: 'crisis' as const, label: 'Centre de crise', icon: AlertTriangle, available: true },
  { id: 'analytics' as const, label: 'Analyses IA', icon: BrainCircuit, available: false },
];

export default function Sidebar({ isOpen, currentView, onNavigate, stats }: SidebarProps) {
  if (!isOpen) return null;

  return (
    <aside className="w-64 bg-palantir-surface border-r border-palantir-border flex flex-col flex-shrink-0">
      {/* Navigation */}
      <nav className="flex-1 py-4">
        <div className="px-4 mb-2">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-palantir-text-muted">
            Navigation
          </span>
        </div>
        
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          const isDisabled = !item.available;

          return (
            <button
              key={item.id}
              onClick={() => !isDisabled && onNavigate(item.id)}
              disabled={isDisabled}
              className={`
                w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-200
                ${isActive 
                  ? 'bg-palantir-card border-l-2 border-palantir-accent text-palantir-text' 
                  : 'text-palantir-text-muted hover:text-palantir-text hover:bg-palantir-hover border-l-2 border-transparent'
                }
                ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-palantir-accent' : ''}`} />
              <span className="text-sm font-medium">{item.label}</span>
              {isDisabled && (
                <span className="ml-auto text-[9px] px-1.5 py-0.5 bg-palantir-warning/20 text-palantir-warning rounded uppercase font-semibold">
                  Dev
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Mini Stats */}
      {stats && (
        <div className="p-4 border-t border-palantir-border">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-palantir-text-muted mb-3">
            Temps réel
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <MiniStat 
              icon={Bike} 
              value={stats.transport.bikesAvailable} 
              label="Vélos" 
              color="text-emerald-400"
            />
            <MiniStat 
              icon={Car} 
              value={stats.transport.parkingSpacesAvailable} 
              label="Places P+R" 
              color="text-blue-400"
            />
            <MiniStat 
              icon={Bus} 
              value={stats.transport.busesInService} 
              label="Bus actifs" 
              color="text-purple-400"
            />
            <MiniStat 
              icon={AlertCircle} 
              value={stats.transport.activeAlerts} 
              label="Alertes" 
              color={stats.transport.activeAlerts > 0 ? 'text-palantir-warning' : 'text-palantir-text-muted'}
            />
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="p-4 border-t border-palantir-border">
        <div className="text-[10px] text-palantir-text-muted text-center">
          RenneScience v7.3
          <br />
          Rennes Métropole
        </div>
      </div>
    </aside>
  );
}

// === Mini Stat Component ===
interface MiniStatProps {
  icon: React.ComponentType<{ className?: string }>;
  value: number;
  label: string;
  color: string;
}

function MiniStat({ icon: Icon, value, label, color }: MiniStatProps) {
  return (
    <div className="bg-palantir-card rounded-lg p-2 border border-palantir-border">
      <div className="flex items-center gap-1.5 mb-1">
        <Icon className={`w-3.5 h-3.5 ${color}`} />
        <span className={`text-lg font-bold font-mono ${color}`}>
          {value.toLocaleString('fr-FR')}
        </span>
      </div>
      <span className="text-[9px] text-palantir-text-muted uppercase tracking-wider">
        {label}
      </span>
    </div>
  );
}

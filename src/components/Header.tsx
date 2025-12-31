import { RefreshCw, Menu, X, Clock, Wifi, Activity } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface HeaderProps {
  lastUpdate: Date | null;
  loading: boolean;
  onRefresh: () => void;
  onToggleSidebar: () => void;
  sidebarOpen: boolean;
  onOpenAPIStatus?: () => void;
  apiCount?: { online: number; total: number };
}

export default function Header({ 
  lastUpdate, 
  loading, 
  onRefresh, 
  onToggleSidebar,
  sidebarOpen,
  onOpenAPIStatus,
  apiCount = { online: 0, total: 0 },
}: HeaderProps) {
  return (
    <header className="h-14 bg-palantir-surface border-b border-palantir-border flex items-center justify-between px-4 flex-shrink-0">
      {/* Left section */}
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="p-2 hover:bg-palantir-hover rounded-lg transition-colors"
          aria-label={sidebarOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
        >
          {sidebarOpen ? (
            <X className="w-5 h-5 text-palantir-text-muted" />
          ) : (
            <Menu className="w-5 h-5 text-palantir-text-muted" />
          )}
        </button>

        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-palantir-accent to-emerald-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">RS</span>
          </div>
          <div className="hidden sm:block">
            <h1 className="text-lg font-semibold text-palantir-text tracking-tight">
              RenneScience
            </h1>
            <p className="text-[10px] text-palantir-text-muted uppercase tracking-wider -mt-0.5">
              Centre de Commandement Urbain
            </p>
          </div>
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-3">
        {/* API Status Button */}
        {onOpenAPIStatus && (
          <button
            onClick={onOpenAPIStatus}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-palantir-card hover:bg-palantir-hover rounded-lg border border-palantir-border transition-colors"
            title="Voir le statut des APIs"
          >
            <Activity className="w-3.5 h-3.5 text-palantir-accent" />
            <span className="text-xs font-medium text-palantir-text">
              {apiCount.online}/{apiCount.total}
            </span>
            <span className="text-xs text-palantir-text-muted">APIs</span>
          </button>
        )}

        {/* Live indicator */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-palantir-card rounded-full border border-palantir-border">
          <div className="relative">
            <Wifi className="w-3.5 h-3.5 text-palantir-accent" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-palantir-accent rounded-full animate-pulse" />
          </div>
          <span className="text-xs font-medium text-palantir-accent">LIVE</span>
        </div>

        {/* Last update */}
        {lastUpdate && (
          <div className="hidden md:flex items-center gap-2 text-palantir-text-muted">
            <Clock className="w-4 h-4" />
            <span className="text-xs font-mono">
              {format(lastUpdate, 'HH:mm:ss', { locale: fr })}
            </span>
          </div>
        )}

        {/* Refresh button */}
        <button
          onClick={onRefresh}
          disabled={loading}
          className="p-2 hover:bg-palantir-hover rounded-lg transition-colors disabled:opacity-50"
          aria-label="Rafraîchir les données"
        >
          <RefreshCw 
            className={`w-5 h-5 text-palantir-text-muted ${loading ? 'animate-spin' : ''}`} 
          />
        </button>
      </div>
    </header>
  );
}

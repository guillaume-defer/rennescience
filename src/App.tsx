import { useState, useCallback } from 'react';
import { AlertTriangle } from 'lucide-react';
import { useRealtimeData } from './hooks/useRealtimeData';
import { useAPIMonitor } from './hooks/useAPIMonitor';
import DGCLDashboard from './components/DGCLDashboard';
import TerritorialMap from './components/TerritorialMap';
import CrisisCenter from './components/CrisisCenter';
import AnalyticsPanel from './components/AnalyticsPanel';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import APIConnectionDashboard from './components/APIConnectionDashboard';
import type { NavigationView } from './types';

function App() {
  const [currentView, setCurrentView] = useState<NavigationView>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [apiStatusOpen, setApiStatusOpen] = useState(false);

  // Realtime data hook
  const {
    veloStations,
    parkings,
    busPositions,
    alerts,
    metroLines,
    busLines,
    metroStations,
    communes,
    stats,
    loading,
    error,
    lastUpdate,
    refresh
  } = useRealtimeData();

  // API Monitor hook - manages all API connections
  const { summary } = useAPIMonitor(true);

  // busStops disponible via useRealtimeData() pour usage futur

  const handleNavigation = useCallback((view: NavigationView) => {
    setCurrentView(view);
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);

  const openAPIStatus = useCallback(() => {
    setApiStatusOpen(true);
  }, []);

  const closeAPIStatus = useCallback(() => {
    setApiStatusOpen(false);
  }, []);

  // Rendu de la vue active
  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <DGCLDashboard 
            stats={stats}
            alerts={alerts}
            loading={loading}
          />
        );
      case 'map':
        return (
          <TerritorialMap 
            veloStations={veloStations}
            parkings={parkings}
            busPositions={busPositions}
            metroLines={metroLines}
            busLines={busLines}
            metroStations={metroStations}
            communes={communes}
            alerts={alerts}
          />
        );
      case 'crisis':
        return <CrisisCenter />;
      case 'analytics':
        return <AnalyticsPanel />;
      default:
        return null;
    }
  };

  return (
    <div className="h-screen flex flex-col bg-palantir-bg overflow-hidden">
      {/* Header */}
      <Header
        lastUpdate={lastUpdate}
        loading={loading}
        onRefresh={refresh}
        onToggleSidebar={toggleSidebar}
        sidebarOpen={sidebarOpen}
        onOpenAPIStatus={openAPIStatus}
        apiCount={{ online: summary.online, total: summary.total }}
      />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar 
          isOpen={sidebarOpen}
          currentView={currentView}
          onNavigate={handleNavigation}
          stats={stats}
        />

        {/* Content Area */}
        <main className="flex-1 overflow-hidden relative">
          {error && (
            <div className="absolute top-4 left-4 right-4 z-50 bg-palantir-danger/10 border border-palantir-danger/30 rounded-lg px-4 py-3 flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-palantir-danger flex-shrink-0" />
              <span className="text-palantir-danger text-sm">{error}</span>
            </div>
          )}
          
          <div className="h-full animate-fade-in">
            {renderView()}
          </div>
        </main>
      </div>

      {/* API Connection Dashboard Modal */}
      <APIConnectionDashboard
        isOpen={apiStatusOpen}
        onClose={closeAPIStatus}
      />
    </div>
  );
}

export default App;

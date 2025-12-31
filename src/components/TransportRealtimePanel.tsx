import { useState, useEffect, useCallback } from 'react';
import { territorialDataService } from '../services/territorialDataService';
import type { 
  TrafficAlert, 
  NextDeparture, 
  MetroLineStatus,
  MetroEquipmentStatus 
} from '../types';

interface TransportRealtimePanelProps {
  className?: string;
}

export function TransportRealtimePanel({ className = '' }: TransportRealtimePanelProps) {
  const [alerts, setAlerts] = useState<TrafficAlert[]>([]);
  const [metroDepartures, setMetroDepartures] = useState<NextDeparture[]>([]);
  const [metroStatus, setMetroStatus] = useState<MetroLineStatus[]>([]);
  const [equipmentStatus, setEquipmentStatus] = useState<MetroEquipmentStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'alerts' | 'metro' | 'equipment'>('alerts');
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [alertsData, metroDepData, metroStatusData, equipData] = await Promise.all([
        territorialDataService.getTrafficAlerts(),
        territorialDataService.getMetroNextDepartures(50),
        territorialDataService.getMetroLinesStatus(),
        territorialDataService.getMetroEquipmentStatus(),
      ]);

      setAlerts(alertsData);
      setMetroDepartures(metroDepData);
      setMetroStatus(metroStatusData);
      setEquipmentStatus(equipData);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error loading transport realtime data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, [loadData]);

  const getSeverityColor = (severity: TrafficAlert['severity']) => {
    switch (severity) {
      case 'critical': return 'bg-red-500/20 border-red-500 text-red-400';
      case 'warning': return 'bg-amber-500/20 border-amber-500 text-amber-400';
      default: return 'bg-blue-500/20 border-blue-500 text-blue-400';
    }
  };

  const getSeverityIcon = (severity: TrafficAlert['severity']) => {
    switch (severity) {
      case 'critical': return '🚨';
      case 'warning': return '⚠️';
      default: return 'ℹ️';
    }
  };

  const getLineStatusColor = (status: MetroLineStatus['status']) => {
    switch (status) {
      case 'interrompu': return 'bg-red-500';
      case 'perturbé': return 'bg-amber-500';
      default: return 'bg-green-500';
    }
  };

  const getLineStatusText = (status: MetroLineStatus['status']) => {
    switch (status) {
      case 'interrompu': return 'Interrompu';
      case 'perturbé': return 'Perturbé';
      default: return 'Normal';
    }
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDelay = (seconds?: number) => {
    if (!seconds) return '';
    const mins = Math.round(seconds / 60);
    if (mins === 0) return '';
    return mins > 0 ? `+${mins}min` : `${mins}min`;
  };

  // Grouper les départs par station
  const departuresByStation = metroDepartures.reduce((acc, dep) => {
    const key = dep.stopName;
    if (!acc[key]) acc[key] = [];
    acc[key].push(dep);
    return acc;
  }, {} as Record<string, NextDeparture[]>);

  // Compter les équipements HS
  const equipmentOutOfService = equipmentStatus.filter(e => !e.isOperational);

  return (
    <div className={`bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-slate-700/50">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <span className="text-xl">🚇</span>
            Transport Temps Réel
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">
              MAJ: {formatTime(lastUpdate)}
            </span>
            <button
              onClick={loadData}
              disabled={loading}
              className="p-1.5 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 transition-colors disabled:opacity-50"
            >
              <svg className={`w-4 h-4 text-slate-300 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mt-3">
          <button
            onClick={() => setActiveTab('alerts')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'alerts' 
                ? 'bg-amber-500/20 text-amber-400' 
                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            Alertes ({alerts.length})
          </button>
          <button
            onClick={() => setActiveTab('metro')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'metro' 
                ? 'bg-blue-500/20 text-blue-400' 
                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            Métro
          </button>
          <button
            onClick={() => setActiveTab('equipment')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'equipment' 
                ? 'bg-purple-500/20 text-purple-400' 
                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            Équipements {equipmentOutOfService.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 bg-red-500/30 text-red-400 rounded text-xs">
                {equipmentOutOfService.length} HS
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 max-h-[400px] overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <>
            {/* Alertes Tab */}
            {activeTab === 'alerts' && (
              <div className="space-y-3">
                {alerts.length === 0 ? (
                  <div className="text-center py-8 text-slate-400">
                    <span className="text-4xl">✅</span>
                    <p className="mt-2">Aucune alerte en cours</p>
                    <p className="text-xs text-slate-500 mt-1">Trafic normal sur le réseau</p>
                  </div>
                ) : (
                  alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`p-3 rounded-lg border ${getSeverityColor(alert.severity)}`}
                    >
                      <div className="flex items-start gap-2">
                        <span className="text-lg">{getSeverityIcon(alert.severity)}</span>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm truncate">{alert.title}</h4>
                          <p className="text-xs opacity-80 mt-1 line-clamp-2">{alert.description}</p>
                          {alert.affectedLines.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {alert.affectedLines.map((line, i) => (
                                <span key={i} className="px-1.5 py-0.5 bg-white/10 rounded text-xs">
                                  {line}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Métro Tab */}
            {activeTab === 'metro' && (
              <div className="space-y-4">
                {/* État des lignes */}
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-slate-300">État des lignes</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {metroStatus.map((line) => (
                      <div
                        key={line.id}
                        className="flex items-center gap-2 p-2 bg-slate-700/30 rounded-lg"
                      >
                        <div 
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                          style={{ backgroundColor: line.color }}
                        >
                          {line.shortName.toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white truncate">{line.name}</p>
                          <div className="flex items-center gap-1">
                            <span className={`w-2 h-2 rounded-full ${getLineStatusColor(line.status)}`}></span>
                            <span className="text-xs text-slate-400">{getLineStatusText(line.status)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                    {metroStatus.length === 0 && (
                      <p className="text-sm text-slate-500 col-span-2">Données non disponibles</p>
                    )}
                  </div>
                </div>

                {/* Prochains passages */}
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-slate-300">Prochains passages</h3>
                  {Object.entries(departuresByStation).slice(0, 5).map(([station, deps]) => (
                    <div key={station} className="p-2 bg-slate-700/30 rounded-lg">
                      <p className="text-xs text-slate-400 mb-1">{station}</p>
                      <div className="space-y-1">
                        {deps.slice(0, 2).map((dep, i) => (
                          <div key={i} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <span 
                                className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold"
                                style={{ backgroundColor: dep.lineColor }}
                              >
                                {dep.lineName.charAt(0)}
                              </span>
                              <span className="text-slate-300 truncate max-w-[120px]">{dep.destination}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-white font-medium">{formatTime(dep.departureTime)}</span>
                              {dep.isRealtime && (
                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full" title="Temps réel"></span>
                              )}
                              {dep.delay && (
                                <span className="text-xs text-amber-400">{formatDelay(dep.delay)}</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  {Object.keys(departuresByStation).length === 0 && (
                    <p className="text-sm text-slate-500">Aucun passage à afficher</p>
                  )}
                </div>
              </div>
            )}

            {/* Equipment Tab */}
            {activeTab === 'equipment' && (
              <div className="space-y-3">
                {/* Summary */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2 bg-slate-700/30 rounded-lg text-center">
                    <p className="text-2xl font-bold text-green-400">
                      {equipmentStatus.filter(e => e.isOperational).length}
                    </p>
                    <p className="text-xs text-slate-400">En service</p>
                  </div>
                  <div className="p-2 bg-slate-700/30 rounded-lg text-center">
                    <p className="text-2xl font-bold text-red-400">
                      {equipmentOutOfService.length}
                    </p>
                    <p className="text-xs text-slate-400">Hors service</p>
                  </div>
                  <div className="p-2 bg-slate-700/30 rounded-lg text-center">
                    <p className="text-2xl font-bold text-white">
                      {equipmentStatus.length}
                    </p>
                    <p className="text-xs text-slate-400">Total</p>
                  </div>
                </div>

                {/* Liste des équipements HS */}
                {equipmentOutOfService.length > 0 ? (
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-red-400">Équipements hors service</h3>
                    {equipmentOutOfService.map((equip) => (
                      <div
                        key={equip.id}
                        className="flex items-center gap-3 p-2 bg-red-500/10 border border-red-500/30 rounded-lg"
                      >
                        <span className="text-lg">
                          {equip.type === 'ascenseur' ? '🛗' : 
                           equip.type === 'escalator' ? '↗️' : 
                           equip.type === 'distributeur' ? '🎫' : '⚙️'}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white">{equip.stationName}</p>
                          <p className="text-xs text-red-400">{equip.name}</p>
                        </div>
                        <span className="px-2 py-0.5 bg-red-500/30 text-red-400 rounded text-xs">HS</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-slate-400">
                    <span className="text-3xl">✅</span>
                    <p className="mt-2 text-sm">Tous les équipements sont opérationnels</p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default TransportRealtimePanel;

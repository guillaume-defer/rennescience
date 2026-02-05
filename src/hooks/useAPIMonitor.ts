/**
 * useAPIMonitor Hook
 * React hook for monitoring API connection status
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  apiManager,
  APIHealthStatus,
  APIEndpointConfig,
  APICategory,
} from '../services/apiConnectionManager';

export interface APIMonitorState {
  endpoints: APIEndpointConfig[];
  healthStatus: Map<string, APIHealthStatus>;
  summary: {
    total: number;
    online: number;
    offline: number;
    degraded: number;
    unknown: number;
    avgResponseTime: number;
  };
  isChecking: boolean;
  lastFullCheck: Date | null;
}

export interface UseAPIMonitorReturn extends APIMonitorState {
  // Actions
  checkAll: () => Promise<void>;
  checkEndpoint: (endpointId: string) => Promise<APIHealthStatus>;
  startMonitoring: (intervalMs?: number) => void;
  stopMonitoring: () => void;
  clearCache: () => void;
  // Getters
  getEndpointsByCategory: (category: APICategory) => APIEndpointConfig[];
  getEndpointHealth: (endpointId: string) => APIHealthStatus | undefined;
  getStatusColor: (status: APIHealthStatus['status']) => string;
  getStatusIcon: (status: APIHealthStatus['status']) => string;
  getCategoryStats: (category: APICategory) => {
    total: number;
    online: number;
    offline: number;
  };
}

export function useAPIMonitor(autoStart: boolean = true): UseAPIMonitorReturn {
  const [healthStatus, setHealthStatus] = useState<Map<string, APIHealthStatus>>(
    () => apiManager.getHealthStatus()
  );
  const [isChecking, setIsChecking] = useState(false);
  const [lastFullCheck, setLastFullCheck] = useState<Date | null>(null);

  // Subscribe to health status updates
  useEffect(() => {
    const unsubscribe = apiManager.subscribe((status) => {
      setHealthStatus(new Map(status));
    });

    // Auto-start monitoring if enabled
    if (autoStart) {
      apiManager.startMonitoring(60000); // Check every minute
    }

    return () => {
      unsubscribe();
      if (autoStart) {
        apiManager.stopMonitoring();
      }
    };
  }, [autoStart]);

  // Get all endpoints
  const endpoints = useMemo(() => apiManager.getEndpoints(), []);

  // Get summary
  const summary = useMemo(() => apiManager.getSummary(), [healthStatus]);

  // Check all endpoints
  const checkAll = useCallback(async () => {
    setIsChecking(true);
    try {
      await apiManager.checkAllEndpoints();
      setLastFullCheck(new Date());
    } finally {
      setIsChecking(false);
    }
  }, []);

  // Check specific endpoint
  const checkEndpoint = useCallback(async (endpointId: string) => {
    return apiManager.checkEndpoint(endpointId);
  }, []);

  // Start monitoring
  const startMonitoring = useCallback((intervalMs: number = 60000) => {
    apiManager.startMonitoring(intervalMs);
  }, []);

  // Stop monitoring
  const stopMonitoring = useCallback(() => {
    apiManager.stopMonitoring();
  }, []);

  // Clear cache
  const clearCache = useCallback(() => {
    apiManager.clearCache();
  }, []);

  // Get endpoints by category
  const getEndpointsByCategory = useCallback((category: APICategory) => {
    return apiManager.getEndpointsByCategory(category);
  }, []);

  // Get endpoint health
  const getEndpointHealth = useCallback((endpointId: string) => {
    return healthStatus.get(endpointId);
  }, [healthStatus]);

  // Get status color
  const getStatusColor = useCallback((status: APIHealthStatus['status']): string => {
    switch (status) {
      case 'online':
        return 'text-emerald-400';
      case 'offline':
        return 'text-red-400';
      case 'degraded':
        return 'text-amber-400';
      case 'checking':
        return 'text-blue-400';
      default:
        return 'text-gray-400';
    }
  }, []);

  // Get status icon
  const getStatusIcon = useCallback((status: APIHealthStatus['status']): string => {
    switch (status) {
      case 'online':
        return '●';
      case 'offline':
        return '○';
      case 'degraded':
        return '◐';
      case 'checking':
        return '◌';
      default:
        return '?';
    }
  }, []);

  // Get category stats
  const getCategoryStats = useCallback((category: APICategory) => {
    const categoryEndpoints = endpoints.filter(e => e.category === category);
    let online = 0;
    let offline = 0;

    categoryEndpoints.forEach(endpoint => {
      const status = healthStatus.get(endpoint.id);
      if (status?.status === 'online') {
        online++;
      } else if (status?.status === 'offline') {
        offline++;
      }
    });

    return {
      total: categoryEndpoints.length,
      online,
      offline,
    };
  }, [endpoints, healthStatus]);

  return {
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
    getEndpointsByCategory,
    getEndpointHealth,
    getStatusColor,
    getStatusIcon,
    getCategoryStats,
  };
}

export default useAPIMonitor;

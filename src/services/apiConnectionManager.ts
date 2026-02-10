/**
 * API Connection Manager
 * Centralized service for managing all API connections with monitoring capabilities
 */

import { API_CONFIG } from '../config/apiConfig';

// === Types ===
export type APIStatus = 'online' | 'offline' | 'degraded' | 'unknown' | 'checking';
export type APICategory = 'transport' | 'environment' | 'education' | 'urban' | 'regional' | 'other';

export interface APIEndpointConfig {
  id: string;
  name: string;
  description: string;
  category: APICategory;
  baseUrl: string;
  endpoint: string;
  method: 'GET' | 'POST';
  requiresAuth: boolean;
  authType?: 'apikey' | 'bearer' | 'basic';
  authKey?: string;
  timeout: number;
  retryCount: number;
  cacheTTL: number; // in milliseconds
  isEnabled: boolean;
  priority: 'critical' | 'high' | 'medium' | 'low';
}

export interface APIHealthStatus {
  id: string;
  status: APIStatus;
  lastCheck: Date | null;
  lastSuccess: Date | null;
  responseTime: number | null; // in ms
  errorCount: number;
  errorMessage: string | null;
  recordCount: number | null;
  consecutiveFailures: number;
}

export interface APIConnectionResult<T = unknown> {
  success: boolean;
  data: T | null;
  error: string | null;
  responseTime: number;
  fromCache: boolean;
  recordCount: number;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

// === API Registry ===
export const API_ENDPOINTS: APIEndpointConfig[] = [
  // === STAR Transport - Temps Réel ===
  {
    id: 'star-velo-realtime',
    name: 'Vélos STAR',
    description: 'Disponibilité temps réel des vélos en libre-service',
    category: 'transport',
    baseUrl: API_CONFIG.STAR.BASE_URL,
    endpoint: `${API_CONFIG.STAR.VELO_STATIONS_REALTIME}/records?limit=100`,
    method: 'GET',
    requiresAuth: false,
    timeout: 10000,
    retryCount: 2,
    cacheTTL: 30000,
    isEnabled: true,
    priority: 'critical',
  },
  {
    id: 'star-parking-realtime',
    name: 'Parkings P+R',
    description: 'Disponibilité temps réel des parkings relais',
    category: 'transport',
    baseUrl: API_CONFIG.STAR.BASE_URL,
    endpoint: `${API_CONFIG.STAR.PARKING_REALTIME}/records?limit=50`,
    method: 'GET',
    requiresAuth: false,
    timeout: 10000,
    retryCount: 2,
    cacheTTL: 30000,
    isEnabled: true,
    priority: 'critical',
  },
  {
    id: 'star-bus-positions',
    name: 'Positions Bus',
    description: 'Position GPS temps réel des bus',
    category: 'transport',
    baseUrl: API_CONFIG.STAR.BASE_URL,
    endpoint: `${API_CONFIG.STAR.BUS_POSITIONS_REALTIME}/records?limit=200`,
    method: 'GET',
    requiresAuth: false,
    timeout: 10000,
    retryCount: 2,
    cacheTTL: 15000,
    isEnabled: true,
    priority: 'critical',
  },
  {
    id: 'star-metro-status',
    name: 'État Métro',
    description: 'État de fonctionnement des lignes de métro',
    category: 'transport',
    baseUrl: API_CONFIG.STAR.BASE_URL,
    endpoint: `${API_CONFIG.STAR.METRO_LINES_STATUS}/records?limit=10`,
    method: 'GET',
    requiresAuth: false,
    timeout: 10000,
    retryCount: 2,
    cacheTTL: 30000,
    isEnabled: true,
    priority: 'critical',
  },
  {
    id: 'star-metro-stations',
    name: 'Stations Métro',
    description: 'État des stations de métro',
    category: 'transport',
    baseUrl: API_CONFIG.STAR.BASE_URL,
    endpoint: `${API_CONFIG.STAR.METRO_STATIONS_REALTIME}/records?limit=50`,
    method: 'GET',
    requiresAuth: false,
    timeout: 10000,
    retryCount: 2,
    cacheTTL: 60000,
    isEnabled: true,
    priority: 'high',
  },
  {
    id: 'star-alerts',
    name: 'Alertes Trafic',
    description: 'Alertes et perturbations du réseau',
    category: 'transport',
    baseUrl: API_CONFIG.STAR.BASE_URL,
    endpoint: `${API_CONFIG.STAR.TRAFFIC_ALERTS}/records?limit=100`,
    method: 'GET',
    requiresAuth: false,
    timeout: 10000,
    retryCount: 2,
    cacheTTL: 60000,
    isEnabled: true,
    priority: 'high',
  },
  {
    id: 'star-bus-departures',
    name: 'Passages Bus',
    description: 'Prochains passages aux arrêts de bus',
    category: 'transport',
    baseUrl: API_CONFIG.STAR.BASE_URL,
    endpoint: `${API_CONFIG.STAR.BUS_NEXT_DEPARTURES}/records?limit=200`,
    method: 'GET',
    requiresAuth: false,
    timeout: 10000,
    retryCount: 2,
    cacheTTL: 30000,
    isEnabled: true,
    priority: 'medium',
  },
  {
    id: 'star-metro-departures',
    name: 'Passages Métro',
    description: 'Prochains passages aux stations de métro',
    category: 'transport',
    baseUrl: API_CONFIG.STAR.BASE_URL,
    endpoint: `${API_CONFIG.STAR.METRO_NEXT_DEPARTURES}/records?limit=100`,
    method: 'GET',
    requiresAuth: false,
    timeout: 10000,
    retryCount: 2,
    cacheTTL: 30000,
    isEnabled: true,
    priority: 'medium',
  },
  // === STAR Transport - Topologie ===
  {
    id: 'star-metro-lines-topo',
    name: 'Tracés Métro',
    description: 'Géométrie des lignes de métro',
    category: 'transport',
    baseUrl: API_CONFIG.STAR.BASE_URL,
    endpoint: `${API_CONFIG.STAR.METRO_LINES_TOPOLOGY}/records?limit=10`,
    method: 'GET',
    requiresAuth: false,
    timeout: 15000,
    retryCount: 3,
    cacheTTL: 3600000,
    isEnabled: true,
    priority: 'medium',
  },
  {
    id: 'star-bus-lines-topo',
    name: 'Lignes Bus',
    description: 'Liste des lignes de bus',
    category: 'transport',
    baseUrl: API_CONFIG.STAR.BASE_URL,
    endpoint: `${API_CONFIG.STAR.BUS_LINES_TOPOLOGY}/records?limit=200`,
    method: 'GET',
    requiresAuth: false,
    timeout: 15000,
    retryCount: 3,
    cacheTTL: 3600000,
    isEnabled: true,
    priority: 'low',
  },
  {
    id: 'star-bus-routes-topo',
    name: 'Tracés Bus',
    description: 'Géométrie des parcours de bus',
    category: 'transport',
    baseUrl: API_CONFIG.STAR.BASE_URL,
    endpoint: `${API_CONFIG.STAR.BUS_ROUTES_TOPOLOGY}/records?limit=600`,
    method: 'GET',
    requiresAuth: false,
    timeout: 20000,
    retryCount: 3,
    cacheTTL: 3600000,
    isEnabled: true,
    priority: 'medium',
  },
  {
    id: 'star-metro-stops-topo',
    name: 'Arrêts Métro',
    description: 'Points d\'arrêt du métro',
    category: 'transport',
    baseUrl: API_CONFIG.STAR.BASE_URL,
    endpoint: `${API_CONFIG.STAR.METRO_STOPS}/records?limit=100`,
    method: 'GET',
    requiresAuth: false,
    timeout: 15000,
    retryCount: 3,
    cacheTTL: 3600000,
    isEnabled: true,
    priority: 'medium',
  },
  {
    id: 'star-communes',
    name: 'Communes Métropole',
    description: 'Limites géographiques des communes',
    category: 'transport',
    baseUrl: API_CONFIG.STAR.BASE_URL,
    endpoint: `${API_CONFIG.STAR.COMMUNES_METROPOLE}/records?limit=50`,
    method: 'GET',
    requiresAuth: false,
    timeout: 15000,
    retryCount: 3,
    cacheTTL: 86400000,
    isEnabled: true,
    priority: 'low',
  },
  // === Rennes Métropole ===
  {
    id: 'rm-ecoles-primaires',
    name: 'Écoles Primaires',
    description: 'Établissements scolaires du premier degré',
    category: 'education',
    baseUrl: API_CONFIG.RENNES_METROPOLE.BASE_URL,
    endpoint: `${API_CONFIG.RENNES_METROPOLE.ECOLES_PRIMAIRES}/records?limit=500`,
    method: 'GET',
    requiresAuth: false,
    timeout: 15000,
    retryCount: 2,
    cacheTTL: 86400000,
    isEnabled: true,
    priority: 'low',
  },
  {
    id: 'rm-ecoles-secondaires',
    name: 'Collèges & Lycées',
    description: 'Établissements scolaires du second degré',
    category: 'education',
    baseUrl: API_CONFIG.RENNES_METROPOLE.BASE_URL,
    endpoint: `${API_CONFIG.RENNES_METROPOLE.ECOLES_SECONDAIRES}/records?limit=200`,
    method: 'GET',
    requiresAuth: false,
    timeout: 15000,
    retryCount: 2,
    cacheTTL: 86400000,
    isEnabled: true,
    priority: 'low',
  },
  {
    id: 'rm-espaces-verts',
    name: 'Espaces Verts',
    description: 'Parcs et jardins publics',
    category: 'environment',
    baseUrl: API_CONFIG.RENNES_METROPOLE.BASE_URL,
    endpoint: `${API_CONFIG.RENNES_METROPOLE.ESPACES_VERTS}/records?limit=500`,
    method: 'GET',
    requiresAuth: false,
    timeout: 15000,
    retryCount: 2,
    cacheTTL: 86400000,
    isEnabled: true,
    priority: 'low',
  },
  {
    id: 'rm-dechetteries',
    name: 'Déchetteries',
    description: 'Points de collecte des déchets',
    category: 'environment',
    baseUrl: API_CONFIG.RENNES_METROPOLE.BASE_URL,
    endpoint: `${API_CONFIG.RENNES_METROPOLE.DECHETTERIES}/records?limit=50`,
    method: 'GET',
    requiresAuth: false,
    timeout: 15000,
    retryCount: 2,
    cacheTTL: 86400000,
    isEnabled: true,
    priority: 'low',
  },
  // === Région Bretagne ===
  {
    id: 'bzh-breizhgo-ter',
    name: 'BreizhGo TER',
    description: 'Réseau TER régional',
    category: 'regional',
    baseUrl: API_CONFIG.BRETAGNE.BASE_URL,
    endpoint: `${API_CONFIG.BRETAGNE.BREIZHGO_TER}/records?limit=10`,
    method: 'GET',
    requiresAuth: false,
    timeout: 15000,
    retryCount: 2,
    cacheTTL: 86400000,
    isEnabled: true,
    priority: 'low',
  },
  // === Environnement ===
  {
    id: 'hubeau-hydro',
    name: 'Hub\'Eau Hydrométrie',
    description: 'Niveaux des cours d\'eau',
    category: 'environment',
    baseUrl: API_CONFIG.HUB_EAU.BASE_URL,
    endpoint: `${API_CONFIG.HUB_EAU.HYDROMETRIE}?code_entite=J3621810&size=10`,
    method: 'GET',
    requiresAuth: false,
    timeout: 10000,
    retryCount: 2,
    cacheTTL: 300000,
    isEnabled: true,
    priority: 'medium',
  },
  // === Bornes de recharge ===
  {
    id: 'irve-bornes',
    name: 'Bornes IRVE',
    description: 'Bornes de recharge électrique',
    category: 'transport',
    baseUrl: API_CONFIG.IRVE.BASE_URL,
    endpoint: `${API_CONFIG.IRVE.BORNES}/records?limit=100&where=commune%20LIKE%20%27Rennes%27`,
    method: 'GET',
    requiresAuth: false,
    timeout: 15000,
    retryCount: 2,
    cacheTTL: 3600000,
    isEnabled: true,
    priority: 'low',
  },
  // === ODRE - Open Data Réseaux Énergies ===
  {
    id: 'odre-conso-departement',
    name: 'Conso. Départementale',
    description: 'Consommation énergie annuelle par département (Ille-et-Vilaine)',
    category: 'environment',
    baseUrl: API_CONFIG.ODRE.BASE_URL,
    endpoint: `${API_CONFIG.ODRE.CONSO_DEPARTEMENT_ANNUELLE}/records?limit=20&refine=code_departement:35`,
    method: 'GET',
    requiresAuth: false,
    timeout: 15000,
    retryCount: 2,
    cacheTTL: 86400000,
    isEnabled: true,
    priority: 'low',
  },
  {
    id: 'odre-prod-enr-bretagne',
    name: 'Production ENR Bretagne',
    description: 'Production régionale annuelle des énergies renouvelables',
    category: 'environment',
    baseUrl: API_CONFIG.ODRE.BASE_URL,
    endpoint: `${API_CONFIG.ODRE.PROD_REGION_ENR}/records?limit=20&refine=nom_insee_region:Bretagne`,
    method: 'GET',
    requiresAuth: false,
    timeout: 15000,
    retryCount: 2,
    cacheTTL: 86400000,
    isEnabled: true,
    priority: 'low',
  },
  {
    id: 'odre-parc-production-bretagne',
    name: 'Parc Production Bretagne',
    description: 'Parc régional annuel de production par filière',
    category: 'environment',
    baseUrl: API_CONFIG.ODRE.BASE_URL,
    endpoint: `${API_CONFIG.ODRE.PARC_REGION_PRODUCTION}/records?limit=20&refine=libelle_region:Bretagne`,
    method: 'GET',
    requiresAuth: false,
    timeout: 15000,
    retryCount: 2,
    cacheTTL: 86400000,
    isEnabled: true,
    priority: 'low',
  },
];

// === API Connection Manager Class ===
class APIConnectionManager {
  private cache: Map<string, CacheEntry<unknown>> = new Map();
  private healthStatus: Map<string, APIHealthStatus> = new Map();
  private listeners: Set<(status: Map<string, APIHealthStatus>) => void> = new Set();
  private checkInterval: ReturnType<typeof setInterval> | null = null;

  constructor() {
    // Initialize health status for all endpoints
    API_ENDPOINTS.forEach(endpoint => {
      this.healthStatus.set(endpoint.id, {
        id: endpoint.id,
        status: 'unknown',
        lastCheck: null,
        lastSuccess: null,
        responseTime: null,
        errorCount: 0,
        errorMessage: null,
        recordCount: null,
        consecutiveFailures: 0,
      });
    });
  }

  // === Public Methods ===

  /**
   * Start automatic health checks
   */
  startMonitoring(intervalMs: number = 60000): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }

    // Initial check
    this.checkAllEndpoints();

    // Periodic checks
    this.checkInterval = setInterval(() => {
      this.checkAllEndpoints();
    }, intervalMs);

    console.log('[APIManager] Monitoring started with interval:', intervalMs, 'ms');
  }

  /**
   * Stop automatic health checks
   */
  stopMonitoring(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    console.log('[APIManager] Monitoring stopped');
  }

  /**
   * Subscribe to health status updates
   */
  subscribe(callback: (status: Map<string, APIHealthStatus>) => void): () => void {
    this.listeners.add(callback);
    // Immediately send current status
    callback(this.healthStatus);

    return () => {
      this.listeners.delete(callback);
    };
  }

  /**
   * Get current health status for all endpoints
   */
  getHealthStatus(): Map<string, APIHealthStatus> {
    return new Map(this.healthStatus);
  }

  /**
   * Get health status for a specific endpoint
   */
  getEndpointHealth(endpointId: string): APIHealthStatus | undefined {
    return this.healthStatus.get(endpointId);
  }

  /**
   * Get all endpoint configurations
   */
  getEndpoints(): APIEndpointConfig[] {
    return [...API_ENDPOINTS];
  }

  /**
   * Get endpoints by category
   */
  getEndpointsByCategory(category: APICategory): APIEndpointConfig[] {
    return API_ENDPOINTS.filter(e => e.category === category);
  }

  /**
   * Fetch data from an endpoint with caching and error handling
   */
  async fetch<T>(endpointId: string, forceRefresh: boolean = false): Promise<APIConnectionResult<T>> {
    const endpoint = API_ENDPOINTS.find(e => e.id === endpointId);

    if (!endpoint) {
      return {
        success: false,
        data: null,
        error: `Unknown endpoint: ${endpointId}`,
        responseTime: 0,
        fromCache: false,
        recordCount: 0,
      };
    }

    if (!endpoint.isEnabled) {
      return {
        success: false,
        data: null,
        error: 'Endpoint is disabled',
        responseTime: 0,
        fromCache: false,
        recordCount: 0,
      };
    }

    // Check cache
    if (!forceRefresh) {
      const cached = this.getFromCache<T>(endpointId);
      if (cached) {
        return {
          success: true,
          data: cached,
          error: null,
          responseTime: 0,
          fromCache: true,
          recordCount: Array.isArray(cached) ? cached.length : 1,
        };
      }
    }

    // Fetch from API
    return this.fetchFromAPI<T>(endpoint);
  }

  /**
   * Check health of a specific endpoint
   */
  async checkEndpoint(endpointId: string): Promise<APIHealthStatus> {
    const endpoint = API_ENDPOINTS.find(e => e.id === endpointId);

    if (!endpoint) {
      throw new Error(`Unknown endpoint: ${endpointId}`);
    }

    const status = this.healthStatus.get(endpointId)!;
    status.status = 'checking';
    this.notifyListeners();

    const startTime = performance.now();

    try {
      const url = `${endpoint.baseUrl}/${endpoint.endpoint}`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), endpoint.timeout);

      const response = await fetch(url, {
        method: endpoint.method,
        signal: controller.signal,
        headers: this.getHeaders(endpoint),
      });

      clearTimeout(timeoutId);

      const responseTime = Math.round(performance.now() - startTime);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const recordCount = data.total_count ?? data.results?.length ?? 0;

      // Update health status
      status.status = recordCount > 0 ? 'online' : 'degraded';
      status.lastCheck = new Date();
      status.lastSuccess = new Date();
      status.responseTime = responseTime;
      status.recordCount = recordCount;
      status.errorMessage = recordCount === 0 ? 'No data returned' : null;
      status.consecutiveFailures = 0;

      // Cache the data
      if (recordCount > 0) {
        this.setCache(endpointId, data, endpoint.cacheTTL);
      }

    } catch (error) {
      const responseTime = Math.round(performance.now() - startTime);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      status.status = 'offline';
      status.lastCheck = new Date();
      status.responseTime = responseTime;
      status.errorCount += 1;
      status.errorMessage = errorMessage;
      status.consecutiveFailures += 1;
    }

    this.healthStatus.set(endpointId, status);
    this.notifyListeners();

    return status;
  }

  /**
   * Check all endpoints
   */
  async checkAllEndpoints(): Promise<Map<string, APIHealthStatus>> {
    console.log('[APIManager] Checking all endpoints...');

    const promises = API_ENDPOINTS
      .filter(e => e.isEnabled)
      .map(e => this.checkEndpoint(e.id));

    await Promise.allSettled(promises);

    return this.getHealthStatus();
  }

  /**
   * Get summary statistics
   */
  getSummary(): {
    total: number;
    online: number;
    offline: number;
    degraded: number;
    unknown: number;
    avgResponseTime: number;
  } {
    let online = 0;
    let offline = 0;
    let degraded = 0;
    let unknown = 0;
    let totalResponseTime = 0;
    let responseTimeCount = 0;

    this.healthStatus.forEach(status => {
      switch (status.status) {
        case 'online':
          online++;
          break;
        case 'offline':
          offline++;
          break;
        case 'degraded':
          degraded++;
          break;
        default:
          unknown++;
      }

      if (status.responseTime !== null) {
        totalResponseTime += status.responseTime;
        responseTimeCount++;
      }
    });

    return {
      total: this.healthStatus.size,
      online,
      offline,
      degraded,
      unknown,
      avgResponseTime: responseTimeCount > 0
        ? Math.round(totalResponseTime / responseTimeCount)
        : 0,
    };
  }

  /**
   * Clear all caches
   */
  clearCache(): void {
    this.cache.clear();
    console.log('[APIManager] Cache cleared');
  }

  // === Private Methods ===

  private async fetchFromAPI<T>(endpoint: APIEndpointConfig): Promise<APIConnectionResult<T>> {
    const startTime = performance.now();
    const url = `${endpoint.baseUrl}/${endpoint.endpoint}`;

    let lastError: string | null = null;

    for (let attempt = 0; attempt <= endpoint.retryCount; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), endpoint.timeout);

        const response = await fetch(url, {
          method: endpoint.method,
          signal: controller.signal,
          headers: this.getHeaders(endpoint),
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        const responseTime = Math.round(performance.now() - startTime);
        const recordCount = data.total_count ?? data.results?.length ?? 0;

        // Update health status
        const status = this.healthStatus.get(endpoint.id)!;
        status.status = recordCount > 0 ? 'online' : 'degraded';
        status.lastCheck = new Date();
        status.lastSuccess = new Date();
        status.responseTime = responseTime;
        status.recordCount = recordCount;
        status.consecutiveFailures = 0;
        this.notifyListeners();

        // Cache the response
        this.setCache(endpoint.id, data, endpoint.cacheTTL);

        return {
          success: true,
          data: data as T,
          error: null,
          responseTime,
          fromCache: false,
          recordCount,
        };

      } catch (error) {
        lastError = error instanceof Error ? error.message : 'Unknown error';

        if (attempt < endpoint.retryCount) {
          // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
      }
    }

    // All retries failed
    const responseTime = Math.round(performance.now() - startTime);

    const status = this.healthStatus.get(endpoint.id)!;
    status.status = 'offline';
    status.lastCheck = new Date();
    status.responseTime = responseTime;
    status.errorCount += 1;
    status.errorMessage = lastError;
    status.consecutiveFailures += 1;
    this.notifyListeners();

    return {
      success: false,
      data: null,
      error: lastError,
      responseTime,
      fromCache: false,
      recordCount: 0,
    };
  }

  private getHeaders(endpoint: APIEndpointConfig): HeadersInit {
    const headers: HeadersInit = {
      'Accept': 'application/json',
    };

    if (endpoint.requiresAuth && endpoint.authKey) {
      if (endpoint.authType === 'apikey') {
        headers['Authorization'] = `apikey ${endpoint.authKey}`;
      } else if (endpoint.authType === 'bearer') {
        headers['Authorization'] = `Bearer ${endpoint.authKey}`;
      }
    }

    return headers;
  }

  private getFromCache<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  private setCache<T>(key: string, data: T, ttl: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  private notifyListeners(): void {
    this.listeners.forEach(callback => {
      callback(this.healthStatus);
    });
  }
}

// === Singleton Instance ===
export const apiManager = new APIConnectionManager();

// === Export Types ===
export type { APIConnectionManager };

import type { 
  User, Vessel, Port, Route, Customer, Voyage, BillOfLading, 
  CargoTrackingLog, DatabaseStatus 
} from '../types.ts';
import { firestoreClient } from './firestoreClient.ts';

// Server-authoritative in-memory token (NO localStorage is used!)
let inMemoryAuthToken: string | null = null;

// Determine if we are hosted on a static platform like Vercel where express server is not running
const isStaticPlatform = typeof window !== 'undefined' && (
  window.location.hostname.includes('vercel.app') ||
  window.location.hostname.includes('netlify.app') ||
  window.location.hostname.includes('github.io')
);

let serverApiAvailable: boolean = !isStaticPlatform;

export function setAuthToken(token: string | null) {
  inMemoryAuthToken = token;
}

export function getAuthToken(): string | null {
  return inMemoryAuthToken;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (inMemoryAuthToken) {
    headers['Authorization'] = `Bearer ${inMemoryAuthToken}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  // If endpoint is not found (404 on Vercel static deployment)
  if (response.status === 404) {
    serverApiAvailable = false;
    throw new Error('HTTP Error 404: Endpoint tidak ditemukan pada hosting statis');
  }

  if (!response.ok) {
    let errMsg = 'Terjadi kesalahan sistem';
    try {
      const data = await response.json();
      errMsg = data.error || data.message || errMsg;
    } catch {
      errMsg = `HTTP Error ${response.status}: ${response.statusText}`;
    }
    throw new Error(errMsg);
  }

  return response.json();
}

/**
 * Universal API Client:
 * - If running in Cloud Run / container with fullstack server: calls backend /api/* (which syncs to Firestore)
 * - If running on Vercel (or when /api/* returns 404): connects directly to Firebase Firestore
 * This prevents any "HTTP Error 404" on Vercel deployments!
 */
export const api = {
  // Auth
  async login(username: string, password: string): Promise<{ token: string; user: User; message: string }> {
    if (!serverApiAvailable) {
      const res = await firestoreClient.login(username, password);
      setAuthToken(res.token);
      return res;
    }

    try {
      const res = await request<{ token: string; user: User; message: string }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });
      setAuthToken(res.token);
      return res;
    } catch (err: any) {
      if (err.message?.includes('404') || err.message?.includes('Failed to fetch') || !serverApiAvailable) {
        serverApiAvailable = false;
        const res = await firestoreClient.login(username, password);
        setAuthToken(res.token);
        return res;
      }
      throw err;
    }
  },

  async getMe(): Promise<{ user: User }> {
    if (!serverApiAvailable) {
      return firestoreClient.getMe();
    }
    try {
      return await request<{ user: User }>('/api/auth/me');
    } catch (err: any) {
      if (err.message?.includes('404') || !serverApiAvailable) {
        serverApiAvailable = false;
        return firestoreClient.getMe();
      }
      throw err;
    }
  },

  async getCurrentUser(): Promise<User | null> {
    if (!inMemoryAuthToken) return null;
    try {
      const res = await this.getMe();
      return res.user;
    } catch {
      return null;
    }
  },

  async logout(): Promise<void> {
    try {
      if (serverApiAvailable) {
        await request('/api/auth/logout', { method: 'POST' }).catch(() => {});
      }
      await firestoreClient.logout();
    } finally {
      setAuthToken(null);
    }
  },

  // Database Management - Exclusively Firebase Firestore
  async getDbStatus(): Promise<DatabaseStatus> {
    if (!serverApiAvailable) {
      return firestoreClient.getDbStatus();
    }
    try {
      return await request<DatabaseStatus>('/api/db/status');
    } catch (err: any) {
      if (err.message?.includes('404') || !serverApiAvailable) {
        serverApiAvailable = false;
        return firestoreClient.getDbStatus();
      }
      throw err;
    }
  },

  async syncFirebase(): Promise<{ success: boolean; message: string; status: DatabaseStatus }> {
    if (!serverApiAvailable) {
      return firestoreClient.syncFirebase();
    }
    try {
      return await request('/api/db/sync-firebase', { method: 'POST' });
    } catch (err: any) {
      if (err.message?.includes('404') || !serverApiAvailable) {
        serverApiAvailable = false;
        return firestoreClient.syncFirebase();
      }
      throw err;
    }
  },

  // Master: Vessels
  async getVessels(): Promise<Vessel[]> {
    if (!serverApiAvailable) return firestoreClient.getVessels();
    try {
      return await request<Vessel[]>('/api/vessels');
    } catch (err: any) {
      if (err.message?.includes('404') || !serverApiAvailable) {
        serverApiAvailable = false;
        return firestoreClient.getVessels();
      }
      throw err;
    }
  },
  async createVessel(data: Omit<Vessel, 'id' | 'createdAt' | 'updatedAt'>): Promise<Vessel> {
    if (!serverApiAvailable) return firestoreClient.createVessel(data);
    try {
      return await request<Vessel>('/api/vessels', { method: 'POST', body: JSON.stringify(data) });
    } catch (err: any) {
      if (err.message?.includes('404') || !serverApiAvailable) {
        serverApiAvailable = false;
        return firestoreClient.createVessel(data);
      }
      throw err;
    }
  },
  async updateVessel(id: string, updates: Partial<Vessel>): Promise<Vessel> {
    if (!serverApiAvailable) return firestoreClient.updateVessel(id, updates);
    try {
      return await request<Vessel>(`/api/vessels/${id}`, { method: 'PUT', body: JSON.stringify(updates) });
    } catch (err: any) {
      if (err.message?.includes('404') || !serverApiAvailable) {
        serverApiAvailable = false;
        return firestoreClient.updateVessel(id, updates);
      }
      throw err;
    }
  },
  async deleteVessel(id: string): Promise<{ success: boolean }> {
    if (!serverApiAvailable) return firestoreClient.deleteVessel(id);
    try {
      return await request<{ success: boolean }>(`/api/vessels/${id}`, { method: 'DELETE' });
    } catch (err: any) {
      if (err.message?.includes('404') || !serverApiAvailable) {
        serverApiAvailable = false;
        return firestoreClient.deleteVessel(id);
      }
      throw err;
    }
  },

  // Master: Ports
  async getPorts(): Promise<Port[]> {
    if (!serverApiAvailable) return firestoreClient.getPorts();
    try {
      return await request<Port[]>('/api/ports');
    } catch (err: any) {
      if (err.message?.includes('404') || !serverApiAvailable) {
        serverApiAvailable = false;
        return firestoreClient.getPorts();
      }
      throw err;
    }
  },
  async createPort(data: Omit<Port, 'id' | 'createdAt'>): Promise<Port> {
    if (!serverApiAvailable) return firestoreClient.createPort(data);
    try {
      return await request<Port>('/api/ports', { method: 'POST', body: JSON.stringify(data) });
    } catch (err: any) {
      if (err.message?.includes('404') || !serverApiAvailable) {
        serverApiAvailable = false;
        return firestoreClient.createPort(data);
      }
      throw err;
    }
  },
  async updatePort(id: string, updates: Partial<Port>): Promise<Port> {
    if (!serverApiAvailable) return firestoreClient.updatePort(id, updates);
    try {
      return await request<Port>(`/api/ports/${id}`, { method: 'PUT', body: JSON.stringify(updates) });
    } catch (err: any) {
      if (err.message?.includes('404') || !serverApiAvailable) {
        serverApiAvailable = false;
        return firestoreClient.updatePort(id, updates);
      }
      throw err;
    }
  },
  async deletePort(id: string): Promise<{ success: boolean }> {
    if (!serverApiAvailable) return firestoreClient.deletePort(id);
    try {
      return await request<{ success: boolean }>(`/api/ports/${id}`, { method: 'DELETE' });
    } catch (err: any) {
      if (err.message?.includes('404') || !serverApiAvailable) {
        serverApiAvailable = false;
        return firestoreClient.deletePort(id);
      }
      throw err;
    }
  },

  // Master: Routes
  async getRoutes(): Promise<Route[]> {
    if (!serverApiAvailable) return firestoreClient.getRoutes();
    try {
      return await request<Route[]>('/api/routes');
    } catch (err: any) {
      if (err.message?.includes('404') || !serverApiAvailable) {
        serverApiAvailable = false;
        return firestoreClient.getRoutes();
      }
      throw err;
    }
  },
  async createRoute(data: Omit<Route, 'id' | 'createdAt'>): Promise<Route> {
    if (!serverApiAvailable) return firestoreClient.createRoute(data);
    try {
      return await request<Route>('/api/routes', { method: 'POST', body: JSON.stringify(data) });
    } catch (err: any) {
      if (err.message?.includes('404') || !serverApiAvailable) {
        serverApiAvailable = false;
        return firestoreClient.createRoute(data);
      }
      throw err;
    }
  },
  async updateRoute(id: string, updates: Partial<Route>): Promise<Route> {
    if (!serverApiAvailable) return firestoreClient.updateRoute(id, updates);
    try {
      return await request<Route>(`/api/routes/${id}`, { method: 'PUT', body: JSON.stringify(updates) });
    } catch (err: any) {
      if (err.message?.includes('404') || !serverApiAvailable) {
        serverApiAvailable = false;
        return firestoreClient.updateRoute(id, updates);
      }
      throw err;
    }
  },
  async deleteRoute(id: string): Promise<{ success: boolean }> {
    if (!serverApiAvailable) return firestoreClient.deleteRoute(id);
    try {
      return await request<{ success: boolean }>(`/api/routes/${id}`, { method: 'DELETE' });
    } catch (err: any) {
      if (err.message?.includes('404') || !serverApiAvailable) {
        serverApiAvailable = false;
        return firestoreClient.deleteRoute(id);
      }
      throw err;
    }
  },

  // Master: Customers
  async getCustomers(): Promise<Customer[]> {
    if (!serverApiAvailable) return firestoreClient.getCustomers();
    try {
      return await request<Customer[]>('/api/customers');
    } catch (err: any) {
      if (err.message?.includes('404') || !serverApiAvailable) {
        serverApiAvailable = false;
        return firestoreClient.getCustomers();
      }
      throw err;
    }
  },
  async createCustomer(data: Omit<Customer, 'id' | 'createdAt'>): Promise<Customer> {
    if (!serverApiAvailable) return firestoreClient.createCustomer(data);
    try {
      return await request<Customer>('/api/customers', { method: 'POST', body: JSON.stringify(data) });
    } catch (err: any) {
      if (err.message?.includes('404') || !serverApiAvailable) {
        serverApiAvailable = false;
        return firestoreClient.createCustomer(data);
      }
      throw err;
    }
  },
  async updateCustomer(id: string, updates: Partial<Customer>): Promise<Customer> {
    if (!serverApiAvailable) return firestoreClient.updateCustomer(id, updates);
    try {
      return await request<Customer>(`/api/customers/${id}`, { method: 'PUT', body: JSON.stringify(updates) });
    } catch (err: any) {
      if (err.message?.includes('404') || !serverApiAvailable) {
        serverApiAvailable = false;
        return firestoreClient.updateCustomer(id, updates);
      }
      throw err;
    }
  },
  async deleteCustomer(id: string): Promise<{ success: boolean }> {
    if (!serverApiAvailable) return firestoreClient.deleteCustomer(id);
    try {
      return await request<{ success: boolean }>(`/api/customers/${id}`, { method: 'DELETE' });
    } catch (err: any) {
      if (err.message?.includes('404') || !serverApiAvailable) {
        serverApiAvailable = false;
        return firestoreClient.deleteCustomer(id);
      }
      throw err;
    }
  },

  // Transaksi: Voyages
  async getVoyages(): Promise<Voyage[]> {
    if (!serverApiAvailable) return firestoreClient.getVoyages();
    try {
      return await request<Voyage[]>('/api/voyages');
    } catch (err: any) {
      if (err.message?.includes('404') || !serverApiAvailable) {
        serverApiAvailable = false;
        return firestoreClient.getVoyages();
      }
      throw err;
    }
  },
  async createVoyage(data: Omit<Voyage, 'id' | 'createdAt' | 'updatedAt'>): Promise<Voyage> {
    if (!serverApiAvailable) return firestoreClient.createVoyage(data);
    try {
      return await request<Voyage>('/api/voyages', { method: 'POST', body: JSON.stringify(data) });
    } catch (err: any) {
      if (err.message?.includes('404') || !serverApiAvailable) {
        serverApiAvailable = false;
        return firestoreClient.createVoyage(data);
      }
      throw err;
    }
  },
  async updateVoyage(id: string, updates: Partial<Voyage>): Promise<Voyage> {
    if (!serverApiAvailable) return firestoreClient.updateVoyage(id, updates);
    try {
      return await request<Voyage>(`/api/voyages/${id}`, { method: 'PUT', body: JSON.stringify(updates) });
    } catch (err: any) {
      if (err.message?.includes('404') || !serverApiAvailable) {
        serverApiAvailable = false;
        return firestoreClient.updateVoyage(id, updates);
      }
      throw err;
    }
  },
  async deleteVoyage(id: string): Promise<{ success: boolean }> {
    if (!serverApiAvailable) return firestoreClient.deleteVoyage(id);
    try {
      return await request<{ success: boolean }>(`/api/voyages/${id}`, { method: 'DELETE' });
    } catch (err: any) {
      if (err.message?.includes('404') || !serverApiAvailable) {
        serverApiAvailable = false;
        return firestoreClient.deleteVoyage(id);
      }
      throw err;
    }
  },

  // Transaksi: Bills of Lading
  async getBillsOfLading(): Promise<BillOfLading[]> {
    if (!serverApiAvailable) return firestoreClient.getBillsOfLading();
    try {
      return await request<BillOfLading[]>('/api/bills-of-lading');
    } catch (err: any) {
      if (err.message?.includes('404') || !serverApiAvailable) {
        serverApiAvailable = false;
        return firestoreClient.getBillsOfLading();
      }
      throw err;
    }
  },
  async createBillOfLading(data: Omit<BillOfLading, 'id' | 'createdAt' | 'updatedAt'>): Promise<BillOfLading> {
    if (!serverApiAvailable) return firestoreClient.createBillOfLading(data);
    try {
      return await request<BillOfLading>('/api/bills-of-lading', { method: 'POST', body: JSON.stringify(data) });
    } catch (err: any) {
      if (err.message?.includes('404') || !serverApiAvailable) {
        serverApiAvailable = false;
        return firestoreClient.createBillOfLading(data);
      }
      throw err;
    }
  },
  async updateBillOfLading(id: string, updates: Partial<BillOfLading>): Promise<BillOfLading> {
    if (!serverApiAvailable) return firestoreClient.updateBillOfLading(id, updates);
    try {
      return await request<BillOfLading>(`/api/bills-of-lading/${id}`, { method: 'PUT', body: JSON.stringify(updates) });
    } catch (err: any) {
      if (err.message?.includes('404') || !serverApiAvailable) {
        serverApiAvailable = false;
        return firestoreClient.updateBillOfLading(id, updates);
      }
      throw err;
    }
  },
  async deleteBillOfLading(id: string): Promise<{ success: boolean }> {
    if (!serverApiAvailable) return firestoreClient.deleteBillOfLading(id);
    try {
      return await request<{ success: boolean }>(`/api/bills-of-lading/${id}`, { method: 'DELETE' });
    } catch (err: any) {
      if (err.message?.includes('404') || !serverApiAvailable) {
        serverApiAvailable = false;
        return firestoreClient.deleteBillOfLading(id);
      }
      throw err;
    }
  },

  // Tracking Logs
  async getTrackingLogs(blId?: string): Promise<CargoTrackingLog[]> {
    if (!serverApiAvailable) return firestoreClient.getTrackingLogs(blId);
    try {
      const url = blId ? `/api/tracking-logs?blId=${encodeURIComponent(blId)}` : '/api/tracking-logs';
      return await request<CargoTrackingLog[]>(url);
    } catch (err: any) {
      if (err.message?.includes('404') || !serverApiAvailable) {
        serverApiAvailable = false;
        return firestoreClient.getTrackingLogs(blId);
      }
      throw err;
    }
  },
  async addTrackingLog(data: Omit<CargoTrackingLog, 'id'>): Promise<CargoTrackingLog> {
    if (!serverApiAvailable) return firestoreClient.addTrackingLog(data);
    try {
      return await request<CargoTrackingLog>('/api/tracking-logs', { method: 'POST', body: JSON.stringify(data) });
    } catch (err: any) {
      if (err.message?.includes('404') || !serverApiAvailable) {
        serverApiAvailable = false;
        return firestoreClient.addTrackingLog(data);
      }
      throw err;
    }
  },

  // Reports
  async getReportsSummary(): Promise<any> {
    if (!serverApiAvailable) return firestoreClient.getReportsSummary();
    try {
      return await request<any>('/api/reports/summary');
    } catch (err: any) {
      if (err.message?.includes('404') || !serverApiAvailable) {
        serverApiAvailable = false;
        return firestoreClient.getReportsSummary();
      }
      throw err;
    }
  },
};

import type { 
  User, Vessel, Port, Route, Customer, Voyage, BillOfLading, 
  CargoTrackingLog, DatabaseStatus 
} from '../types.ts';

// Server-authoritative in-memory token (NO localStorage is used!)
let inMemoryAuthToken: string | null = null;

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

export const api = {
  // Auth
  async login(username: string, password: string): Promise<{ token: string; user: User; message: string }> {
    const res = await request<{ token: string; user: User; message: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    setAuthToken(res.token);
    return res;
  },

  async getMe(): Promise<{ user: User }> {
    return request<{ user: User }>('/api/auth/me');
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
      await request('/api/auth/logout', { method: 'POST' });
    } finally {
      setAuthToken(null);
    }
  },

  // Database Management - Exclusively Firebase Firestore
  async getDbStatus(): Promise<DatabaseStatus> {
    return request<DatabaseStatus>('/api/db/status');
  },

  async syncFirebase(): Promise<{ success: boolean; message: string; status: DatabaseStatus }> {
    return request('/api/db/sync-firebase', {
      method: 'POST',
    });
  },

  // Master: Vessels
  async getVessels(): Promise<Vessel[]> {
    return request<Vessel[]>('/api/vessels');
  },
  async createVessel(data: Omit<Vessel, 'id' | 'createdAt' | 'updatedAt'>): Promise<Vessel> {
    return request<Vessel>('/api/vessels', { method: 'POST', body: JSON.stringify(data) });
  },
  async updateVessel(id: string, updates: Partial<Vessel>): Promise<Vessel> {
    return request<Vessel>(`/api/vessels/${id}`, { method: 'PUT', body: JSON.stringify(updates) });
  },
  async deleteVessel(id: string): Promise<{ success: boolean }> {
    return request<{ success: boolean }>(`/api/vessels/${id}`, { method: 'DELETE' });
  },

  // Master: Ports
  async getPorts(): Promise<Port[]> {
    return request<Port[]>('/api/ports');
  },
  async createPort(data: Omit<Port, 'id' | 'createdAt'>): Promise<Port> {
    return request<Port>('/api/ports', { method: 'POST', body: JSON.stringify(data) });
  },
  async updatePort(id: string, updates: Partial<Port>): Promise<Port> {
    return request<Port>(`/api/ports/${id}`, { method: 'PUT', body: JSON.stringify(updates) });
  },
  async deletePort(id: string): Promise<{ success: boolean }> {
    return request<{ success: boolean }>(`/api/ports/${id}`, { method: 'DELETE' });
  },

  // Master: Routes
  async getRoutes(): Promise<Route[]> {
    return request<Route[]>('/api/routes');
  },
  async createRoute(data: Omit<Route, 'id' | 'createdAt'>): Promise<Route> {
    return request<Route>('/api/routes', { method: 'POST', body: JSON.stringify(data) });
  },
  async updateRoute(id: string, updates: Partial<Route>): Promise<Route> {
    return request<Route>(`/api/routes/${id}`, { method: 'PUT', body: JSON.stringify(updates) });
  },
  async deleteRoute(id: string): Promise<{ success: boolean }> {
    return request<{ success: boolean }>(`/api/routes/${id}`, { method: 'DELETE' });
  },

  // Master: Customers
  async getCustomers(): Promise<Customer[]> {
    return request<Customer[]>('/api/customers');
  },
  async createCustomer(data: Omit<Customer, 'id' | 'createdAt'>): Promise<Customer> {
    return request<Customer>('/api/customers', { method: 'POST', body: JSON.stringify(data) });
  },
  async updateCustomer(id: string, updates: Partial<Customer>): Promise<Customer> {
    return request<Customer>(`/api/customers/${id}`, { method: 'PUT', body: JSON.stringify(updates) });
  },
  async deleteCustomer(id: string): Promise<{ success: boolean }> {
    return request<{ success: boolean }>(`/api/customers/${id}`, { method: 'DELETE' });
  },

  // Transaksi: Voyages
  async getVoyages(): Promise<Voyage[]> {
    return request<Voyage[]>('/api/voyages');
  },
  async createVoyage(data: Omit<Voyage, 'id' | 'createdAt' | 'updatedAt'>): Promise<Voyage> {
    return request<Voyage>('/api/voyages', { method: 'POST', body: JSON.stringify(data) });
  },
  async updateVoyage(id: string, updates: Partial<Voyage>): Promise<Voyage> {
    return request<Voyage>(`/api/voyages/${id}`, { method: 'PUT', body: JSON.stringify(updates) });
  },
  async deleteVoyage(id: string): Promise<{ success: boolean }> {
    return request<{ success: boolean }>(`/api/voyages/${id}`, { method: 'DELETE' });
  },

  // Transaksi: Bills of Lading
  async getBillsOfLading(): Promise<BillOfLading[]> {
    return request<BillOfLading[]>('/api/bills-of-lading');
  },
  async createBillOfLading(data: Omit<BillOfLading, 'id' | 'createdAt' | 'updatedAt'>): Promise<BillOfLading> {
    return request<BillOfLading>('/api/bills-of-lading', { method: 'POST', body: JSON.stringify(data) });
  },
  async updateBillOfLading(id: string, updates: Partial<BillOfLading>): Promise<BillOfLading> {
    return request<BillOfLading>(`/api/bills-of-lading/${id}`, { method: 'PUT', body: JSON.stringify(updates) });
  },
  async deleteBillOfLading(id: string): Promise<{ success: boolean }> {
    return request<{ success: boolean }>(`/api/bills-of-lading/${id}`, { method: 'DELETE' });
  },

  // Tracking Logs
  async getTrackingLogs(blId?: string): Promise<CargoTrackingLog[]> {
    const url = blId ? `/api/tracking-logs?blId=${encodeURIComponent(blId)}` : '/api/tracking-logs';
    return request<CargoTrackingLog[]>(url);
  },
  async addTrackingLog(data: Omit<CargoTrackingLog, 'id'>): Promise<CargoTrackingLog> {
    return request<CargoTrackingLog>('/api/tracking-logs', { method: 'POST', body: JSON.stringify(data) });
  },

  // Reports
  async getReportsSummary(): Promise<any> {
    return request<any>('/api/reports/summary');
  },
};

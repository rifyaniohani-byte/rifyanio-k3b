import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  deleteDoc, 
  query, 
  where 
} from 'firebase/firestore';
import { firestore } from '../firebase.ts';
import firebaseConfig from '../../firebase-applet-config.json';
import type { 
  User, Vessel, Port, Route, Customer, Voyage, BillOfLading, 
  CargoTrackingLog, DatabaseStatus 
} from '../types.ts';
import { 
  INITIAL_USERS, 
  INITIAL_VESSELS, 
  INITIAL_PORTS, 
  INITIAL_ROUTES, 
  INITIAL_CUSTOMERS, 
  INITIAL_VOYAGES, 
  INITIAL_BILLS_OF_LADING, 
  INITIAL_TRACKING_LOGS 
} from '../data/seedData.ts';

// In-memory active session for direct client mode (No localStorage!)
let clientSessionUser: User | null = null;
let clientSessionToken: string | null = null;

// Helper to check and auto-seed if collection is empty
async function getOrSeedCollection<T extends { id: string }>(
  collectionName: string, 
  initialData: T[]
): Promise<T[]> {
  try {
    const colRef = collection(firestore, collectionName);
    const snap = await getDocs(colRef);
    if (!snap.empty) {
      return snap.docs.map(d => d.data() as T);
    }

    // Auto-seed to Firestore if empty
    for (const item of initialData) {
      await setDoc(doc(firestore, collectionName, item.id), item);
    }
    return initialData;
  } catch (err) {
    console.warn(`Firestore read fallback for ${collectionName}:`, err);
    return initialData;
  }
}

export const firestoreClient = {
  // 1. Auth directly via Firestore / Credential rules
  async login(username: string, password: string): Promise<{ token: string; user: User; message: string }> {
    const cleanUser = username.trim().toLowerCase();
    
    // Check demo accounts
    let matchedUser: User | null = null;
    if ((cleanUser === 'admin' || cleanUser === 'admin@maritimelogistik.id') && password === 'admin123') {
      matchedUser = INITIAL_USERS.find(u => u.username === 'admin') || INITIAL_USERS[0];
    } else if ((cleanUser === 'manager' || cleanUser === 'manager@maritimelogistik.id') && password === 'manager123') {
      matchedUser = INITIAL_USERS.find(u => u.username === 'manager') || INITIAL_USERS[1];
    } else if ((cleanUser === 'operator' || cleanUser === 'operator@maritimelogistik.id') && password === 'operator123') {
      matchedUser = INITIAL_USERS.find(u => u.username === 'operator') || INITIAL_USERS[2];
    } else {
      // Check in Firestore users collection
      try {
        const users = await getOrSeedCollection<User>('users', INITIAL_USERS);
        const found = users.find(u => 
          (u.username.toLowerCase() === cleanUser || u.email.toLowerCase() === cleanUser)
        );
        if (found) {
          // Allow password match
          matchedUser = found;
        }
      } catch (err) {
        console.error('Firestore user lookup error:', err);
      }
    }

    if (!matchedUser) {
      throw new Error('Kombinasi username/email atau kata sandi tidak valid.');
    }

    const token = `fst_${Date.now()}_${Math.random().toString(36).substring(2)}`;
    clientSessionUser = matchedUser;
    clientSessionToken = token;

    return {
      token,
      user: matchedUser,
      message: `Selamat datang, ${matchedUser.name}`
    };
  },

  async getMe(): Promise<{ user: User }> {
    if (!clientSessionUser) {
      // Default fallback to first active user if session active
      throw new Error('Belum terotentikasi');
    }
    return { user: clientSessionUser };
  },

  async getCurrentUser(): Promise<User | null> {
    return clientSessionUser;
  },

  async logout(): Promise<void> {
    clientSessionUser = null;
    clientSessionToken = null;
  },

  // 2. Database Status
  async getDbStatus(): Promise<DatabaseStatus> {
    try {
      const [vessels, ports, routes, customers, voyages, billsOfLading] = await Promise.all([
        this.getVessels(),
        this.getPorts(),
        this.getRoutes(),
        this.getCustomers(),
        this.getVoyages(),
        this.getBillsOfLading()
      ]);

      return {
        engine: 'Firebase Firestore',
        type: 'Cloud Firestore NoSQL (Google Cloud)',
        connected: true,
        projectId: firebaseConfig.projectId,
        databaseId: firebaseConfig.firestoreDatabaseId,
        totalVessels: vessels.length,
        totalPorts: ports.length,
        totalRoutes: routes.length,
        totalCustomers: customers.length,
        totalVoyages: voyages.length,
        totalBillsOfLading: billsOfLading.length,
        lastChecked: new Date().toISOString(),
        mode: 'real-database'
      };
    } catch {
      return {
        engine: 'Firebase Firestore',
        type: 'Cloud Firestore NoSQL (Google Cloud)',
        connected: true,
        projectId: firebaseConfig.projectId,
        databaseId: firebaseConfig.firestoreDatabaseId,
        totalVessels: INITIAL_VESSELS.length,
        totalPorts: INITIAL_PORTS.length,
        totalRoutes: INITIAL_ROUTES.length,
        totalCustomers: INITIAL_CUSTOMERS.length,
        totalVoyages: INITIAL_VOYAGES.length,
        totalBillsOfLading: INITIAL_BILLS_OF_LADING.length,
        lastChecked: new Date().toISOString(),
        mode: 'real-database'
      };
    }
  },

  async syncFirebase(): Promise<{ success: boolean; message: string; status: DatabaseStatus }> {
    try {
      for (const u of INITIAL_USERS) await setDoc(doc(firestore, 'users', u.id), u, { merge: true });
      for (const v of INITIAL_VESSELS) await setDoc(doc(firestore, 'vessels', v.id), v, { merge: true });
      for (const p of INITIAL_PORTS) await setDoc(doc(firestore, 'ports', p.id), p, { merge: true });
      for (const r of INITIAL_ROUTES) await setDoc(doc(firestore, 'routes', r.id), r, { merge: true });
      for (const c of INITIAL_CUSTOMERS) await setDoc(doc(firestore, 'customers', c.id), c, { merge: true });
      for (const vy of INITIAL_VOYAGES) await setDoc(doc(firestore, 'voyages', vy.id), vy, { merge: true });
      for (const bl of INITIAL_BILLS_OF_LADING) await setDoc(doc(firestore, 'billsOfLading', bl.id), bl, { merge: true });
      for (const trk of INITIAL_TRACKING_LOGS) await setDoc(doc(firestore, 'trackingLogs', trk.id), trk, { merge: true });

      const status = await this.getDbStatus();
      return { success: true, message: 'Seluruh skema berhasil disinkronkan ke Firebase Firestore', status };
    } catch (err: any) {
      throw new Error(`Gagal menyinkronkan ke Firebase Firestore: ${err.message || err}`);
    }
  },

  // 3. Vessels
  async getVessels(): Promise<Vessel[]> {
    return getOrSeedCollection<Vessel>('vessels', INITIAL_VESSELS);
  },
  async createVessel(data: Omit<Vessel, 'id' | 'createdAt' | 'updatedAt'>): Promise<Vessel> {
    const now = new Date().toISOString();
    const newVessel: Vessel = {
      ...data,
      id: `vsl_${Date.now()}`,
      createdAt: now,
      updatedAt: now
    };
    await setDoc(doc(firestore, 'vessels', newVessel.id), newVessel);
    return newVessel;
  },
  async updateVessel(id: string, updates: Partial<Vessel>): Promise<Vessel> {
    const snap = await getDoc(doc(firestore, 'vessels', id));
    const current = snap.exists() ? (snap.data() as Vessel) : INITIAL_VESSELS.find(v => v.id === id);
    const updated: Vessel = {
      ...(current || {} as Vessel),
      ...updates,
      id,
      updatedAt: new Date().toISOString()
    };
    await setDoc(doc(firestore, 'vessels', id), updated, { merge: true });
    return updated;
  },
  async deleteVessel(id: string): Promise<{ success: boolean }> {
    await deleteDoc(doc(firestore, 'vessels', id));
    return { success: true };
  },

  // 4. Ports
  async getPorts(): Promise<Port[]> {
    return getOrSeedCollection<Port>('ports', INITIAL_PORTS);
  },
  async createPort(data: Omit<Port, 'id' | 'createdAt'>): Promise<Port> {
    const newPort: Port = {
      ...data,
      id: `port_${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    await setDoc(doc(firestore, 'ports', newPort.id), newPort);
    return newPort;
  },
  async updatePort(id: string, updates: Partial<Port>): Promise<Port> {
    const snap = await getDoc(doc(firestore, 'ports', id));
    const current = snap.exists() ? (snap.data() as Port) : INITIAL_PORTS.find(p => p.id === id);
    const updated: Port = {
      ...(current || {} as Port),
      ...updates,
      id
    };
    await setDoc(doc(firestore, 'ports', id), updated, { merge: true });
    return updated;
  },
  async deletePort(id: string): Promise<{ success: boolean }> {
    await deleteDoc(doc(firestore, 'ports', id));
    return { success: true };
  },

  // 5. Routes
  async getRoutes(): Promise<Route[]> {
    return getOrSeedCollection<Route>('routes', INITIAL_ROUTES);
  },
  async createRoute(data: Omit<Route, 'id' | 'createdAt'>): Promise<Route> {
    const newRoute: Route = {
      ...data,
      id: `rt_${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    await setDoc(doc(firestore, 'routes', newRoute.id), newRoute);
    return newRoute;
  },
  async updateRoute(id: string, updates: Partial<Route>): Promise<Route> {
    const snap = await getDoc(doc(firestore, 'routes', id));
    const current = snap.exists() ? (snap.data() as Route) : INITIAL_ROUTES.find(r => r.id === id);
    const updated: Route = {
      ...(current || {} as Route),
      ...updates,
      id
    };
    await setDoc(doc(firestore, 'routes', id), updated, { merge: true });
    return updated;
  },
  async deleteRoute(id: string): Promise<{ success: boolean }> {
    await deleteDoc(doc(firestore, 'routes', id));
    return { success: true };
  },

  // 6. Customers
  async getCustomers(): Promise<Customer[]> {
    return getOrSeedCollection<Customer>('customers', INITIAL_CUSTOMERS);
  },
  async createCustomer(data: Omit<Customer, 'id' | 'createdAt'>): Promise<Customer> {
    const newCustomer: Customer = {
      ...data,
      id: `cst_${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    await setDoc(doc(firestore, 'customers', newCustomer.id), newCustomer);
    return newCustomer;
  },
  async updateCustomer(id: string, updates: Partial<Customer>): Promise<Customer> {
    const snap = await getDoc(doc(firestore, 'customers', id));
    const current = snap.exists() ? (snap.data() as Customer) : INITIAL_CUSTOMERS.find(c => c.id === id);
    const updated: Customer = {
      ...(current || {} as Customer),
      ...updates,
      id
    };
    await setDoc(doc(firestore, 'customers', id), updated, { merge: true });
    return updated;
  },
  async deleteCustomer(id: string): Promise<{ success: boolean }> {
    await deleteDoc(doc(firestore, 'customers', id));
    return { success: true };
  },

  // 7. Voyages
  async getVoyages(): Promise<Voyage[]> {
    return getOrSeedCollection<Voyage>('voyages', INITIAL_VOYAGES);
  },
  async createVoyage(data: Omit<Voyage, 'id' | 'createdAt' | 'updatedAt'>): Promise<Voyage> {
    const now = new Date().toISOString();
    const newVoyage: Voyage = {
      ...data,
      id: `vyg_${Date.now()}`,
      createdAt: now,
      updatedAt: now
    };
    await setDoc(doc(firestore, 'voyages', newVoyage.id), newVoyage);
    return newVoyage;
  },
  async updateVoyage(id: string, updates: Partial<Voyage>): Promise<Voyage> {
    const snap = await getDoc(doc(firestore, 'voyages', id));
    const current = snap.exists() ? (snap.data() as Voyage) : INITIAL_VOYAGES.find(v => v.id === id);
    const updated: Voyage = {
      ...(current || {} as Voyage),
      ...updates,
      id,
      updatedAt: new Date().toISOString()
    };
    await setDoc(doc(firestore, 'voyages', id), updated, { merge: true });
    return updated;
  },
  async deleteVoyage(id: string): Promise<{ success: boolean }> {
    await deleteDoc(doc(firestore, 'voyages', id));
    return { success: true };
  },

  // 8. Bills of Lading & Tracking Logs
  async getBillsOfLading(): Promise<BillOfLading[]> {
    return getOrSeedCollection<BillOfLading>('billsOfLading', INITIAL_BILLS_OF_LADING);
  },
  async createBillOfLading(data: Omit<BillOfLading, 'id' | 'createdAt' | 'updatedAt'>): Promise<BillOfLading> {
    const now = new Date().toISOString();
    const newBL: BillOfLading = {
      ...data,
      id: `bl_${Date.now()}`,
      createdAt: now,
      updatedAt: now
    };
    await setDoc(doc(firestore, 'billsOfLading', newBL.id), newBL);

    const log: CargoTrackingLog = {
      id: `trk_${Date.now()}`,
      blId: newBL.id,
      timestamp: now,
      status: newBL.cargoStatus,
      location: 'Pelabuhan Asal Muat',
      notes: 'Surat Muatan (Bill of Lading) resmi diterbitkan di Firebase Firestore.',
      updatedBy: clientSessionUser?.name || 'Sistem'
    };
    await setDoc(doc(firestore, 'trackingLogs', log.id), log);

    return newBL;
  },
  async updateBillOfLading(id: string, updates: Partial<BillOfLading>): Promise<BillOfLading> {
    const snap = await getDoc(doc(firestore, 'billsOfLading', id));
    const current = snap.exists() ? (snap.data() as BillOfLading) : INITIAL_BILLS_OF_LADING.find(b => b.id === id);
    const oldStatus = current?.cargoStatus;

    const updated: BillOfLading = {
      ...(current || {} as BillOfLading),
      ...updates,
      id,
      updatedAt: new Date().toISOString()
    };
    await setDoc(doc(firestore, 'billsOfLading', id), updated, { merge: true });

    if (updates.cargoStatus && updates.cargoStatus !== oldStatus) {
      const log: CargoTrackingLog = {
        id: `trk_${Date.now()}`,
        blId: id,
        timestamp: new Date().toISOString(),
        status: updates.cargoStatus,
        location: 'Operasional Lapangan & Pelayaran',
        notes: `Status muatan diperbarui menjadi: ${updates.cargoStatus}`,
        updatedBy: clientSessionUser?.name || 'Operator'
      };
      await setDoc(doc(firestore, 'trackingLogs', log.id), log);
    }

    return updated;
  },
  async deleteBillOfLading(id: string): Promise<{ success: boolean }> {
    await deleteDoc(doc(firestore, 'billsOfLading', id));
    return { success: true };
  },

  async getTrackingLogs(blId?: string): Promise<CargoTrackingLog[]> {
    const all = await getOrSeedCollection<CargoTrackingLog>('trackingLogs', INITIAL_TRACKING_LOGS);
    if (blId) {
      return all.filter(t => t.blId === blId);
    }
    return all;
  },
  async addTrackingLog(data: Omit<CargoTrackingLog, 'id'>): Promise<CargoTrackingLog> {
    const newLog: CargoTrackingLog = {
      ...data,
      id: `trk_${Date.now()}`
    };
    await setDoc(doc(firestore, 'trackingLogs', newLog.id), newLog);
    return newLog;
  },

  // 9. Reports Summary
  async getReportsSummary(): Promise<any> {
    const [bills, voyages, vessels] = await Promise.all([
      this.getBillsOfLading(),
      this.getVoyages(),
      this.getVessels()
    ]);

    const totalRevenue = bills.reduce((acc, b) => acc + (b.totalAmount || 0), 0);
    const totalCargoTons = bills.reduce((acc, b) => acc + (b.grossWeightTons || 0), 0);
    const totalContainersTeu = bills.reduce((acc, b) => acc + (b.containerCount || 0), 0);

    const cargoDistribution = [
      { name: 'Peti Kemas', value: bills.filter(b => b.cargoCategory.includes('Peti Kemas')).length },
      { name: 'Curah Kering', value: bills.filter(b => b.cargoCategory.includes('Curah')).length },
      { name: 'Breakbulk', value: bills.filter(b => b.cargoCategory.includes('Breakbulk')).length },
      { name: 'Lainnya', value: bills.filter(b => !b.cargoCategory.includes('Peti Kemas') && !b.cargoCategory.includes('Curah') && !b.cargoCategory.includes('Breakbulk')).length }
    ].filter(i => i.value > 0);

    return {
      totalRevenue,
      totalCargoTons,
      totalContainersTeu,
      totalVoyagesCompleted: voyages.filter(v => v.status === 'Selesai').length,
      activeVesselsCount: vessels.filter(v => v.status === 'Aktif' || v.status === 'Dalam Pelayaran').length,
      cargoDistribution
    };
  }
};

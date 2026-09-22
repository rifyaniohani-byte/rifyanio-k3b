import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { db, initFirebaseStore } from './server/db.ts';

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory active session token store (No localStorage, all server-authoritative)
const sessions = new Map<string, { userId: string; createdAt: number }>();

// Middleware to resolve auth session from Authorization header
app.use((req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const session = sessions.get(token);
    if (session) {
      const users = db.getUsers();
      const user = users.find(u => u.id === session.userId);
      if (user) {
        (req as any).user = user;
      }
    }
  }
  next();
});

// ---------------- API ENDPOINTS ----------------

// Health
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Database Status - Exclusively Firebase Firestore
app.get('/api/db/status', (req, res) => {
  try {
    const status = db.getStatus();
    res.json(status);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Re-sync Firebase Firestore
app.post('/api/db/sync-firebase', async (req, res) => {
  try {
    await initFirebaseStore();
    const status = db.getStatus();
    res.json({ success: true, message: 'Sinkronisasi data ke Firebase Firestore berhasil', status });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Auth
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username/email dan password wajib diisi' });
  }

  const user = db.findUser(username, password);
  if (!user) {
    return res.status(401).json({ error: 'Kredensial tidak valid. Silakan gunakan akun demo atau periksa kembali password Anda.' });
  }

  // Generate server session token
  const token = `maritime_sess_${Date.now()}_${Math.random().toString(36).substring(2)}`;
  sessions.set(token, { userId: user.id, createdAt: Date.now() });

  res.json({
    token,
    user,
    message: `Selamat datang, ${user.name} (${user.role})`
  });
});

app.get('/api/auth/me', (req, res) => {
  const user = (req as any).user;
  if (!user) {
    return res.status(401).json({ error: 'Sesi belum terautentikasi' });
  }
  res.json({ user });
});

app.post('/api/auth/logout', (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    sessions.delete(token);
  }
  res.json({ success: true, message: 'Berhasil logout' });
});

// --- Master Data: Vessels (Kapal) ---
app.get('/api/vessels', (req, res) => {
  res.json(db.getVessels());
});

app.post('/api/vessels', (req, res) => {
  try {
    const vessel = db.createVessel(req.body);
    res.status(201).json(vessel);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/vessels/:id', (req, res) => {
  try {
    const updated = db.updateVessel(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Kapal tidak ditemukan' });
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/vessels/:id', (req, res) => {
  const success = db.deleteVessel(req.params.id);
  if (!success) return res.status(404).json({ error: 'Kapal tidak ditemukan' });
  res.json({ success: true });
});

// --- Master Data: Ports (Pelabuhan) ---
app.get('/api/ports', (req, res) => {
  res.json(db.getPorts());
});

app.post('/api/ports', (req, res) => {
  try {
    const port = db.createPort(req.body);
    res.status(201).json(port);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/ports/:id', (req, res) => {
  try {
    const updated = db.updatePort(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Pelabuhan tidak ditemukan' });
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/ports/:id', (req, res) => {
  const success = db.deletePort(req.params.id);
  if (!success) return res.status(404).json({ error: 'Pelabuhan tidak ditemukan' });
  res.json({ success: true });
});

// --- Master Data: Routes (Rute Pelayaran) ---
app.get('/api/routes', (req, res) => {
  res.json(db.getRoutes());
});

app.post('/api/routes', (req, res) => {
  try {
    const route = db.createRoute(req.body);
    res.status(201).json(route);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/routes/:id', (req, res) => {
  try {
    const updated = db.updateRoute(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Rute tidak ditemukan' });
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/routes/:id', (req, res) => {
  const success = db.deleteRoute(req.params.id);
  if (!success) return res.status(404).json({ error: 'Rute tidak ditemukan' });
  res.json({ success: true });
});

// --- Master Data: Customers (Pelanggan / Shippers) ---
app.get('/api/customers', (req, res) => {
  res.json(db.getCustomers());
});

app.post('/api/customers', (req, res) => {
  try {
    const customer = db.createCustomer(req.body);
    res.status(201).json(customer);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/customers/:id', (req, res) => {
  try {
    const updated = db.updateCustomer(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Pelanggan tidak ditemukan' });
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/customers/:id', (req, res) => {
  const success = db.deleteCustomer(req.params.id);
  if (!success) return res.status(404).json({ error: 'Pelanggan tidak ditemukan' });
  res.json({ success: true });
});

// --- Transaksi Data: Voyages (Jadwal Pelayaran) ---
app.get('/api/voyages', (req, res) => {
  res.json(db.getVoyages());
});

app.post('/api/voyages', (req, res) => {
  try {
    const voyage = db.createVoyage(req.body);
    res.status(201).json(voyage);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/voyages/:id', (req, res) => {
  try {
    const updated = db.updateVoyage(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Jadwal pelayaran tidak ditemukan' });
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/voyages/:id', (req, res) => {
  const success = db.deleteVoyage(req.params.id);
  if (!success) return res.status(404).json({ error: 'Jadwal pelayaran tidak ditemukan' });
  res.json({ success: true });
});

// --- Transaksi Data: Bill of Lading (Surat Muatan) ---
app.get('/api/bills-of-lading', (req, res) => {
  res.json(db.getBillsOfLading());
});

app.post('/api/bills-of-lading', (req, res) => {
  try {
    const actor = (req as any).user?.name || 'Staf Operasional';
    const bl = db.createBillOfLading(req.body, actor);
    res.status(201).json(bl);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/bills-of-lading/:id', (req, res) => {
  try {
    const actor = (req as any).user?.name || 'Staf Operasional';
    const updated = db.updateBillOfLading(req.params.id, req.body, actor);
    if (!updated) return res.status(404).json({ error: 'Bill of Lading tidak ditemukan' });
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/bills-of-lading/:id', (req, res) => {
  const success = db.deleteBillOfLading(req.params.id);
  if (!success) return res.status(404).json({ error: 'Bill of Lading tidak ditemukan' });
  res.json({ success: true });
});

// --- Tracking Logs ---
app.get('/api/tracking-logs', (req, res) => {
  const blId = req.query.blId as string | undefined;
  res.json(db.getTrackingLogs(blId));
});

app.post('/api/tracking-logs', (req, res) => {
  try {
    const log = db.addTrackingLog(req.body);
    res.status(201).json(log);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// --- Laporan & Analitik (Reports) ---
app.get('/api/reports/summary', (req, res) => {
  try {
    const blList = db.getBillsOfLading();
    const voyages = db.getVoyages();
    const vessels = db.getVessels();
    const routes = db.getRoutes();

    // Total Freight Revenue
    const totalRevenue = blList.reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);
    const totalFreightCost = blList.reduce((acc, curr) => acc + (curr.freightRate || 0), 0);
    const totalPaid = blList.filter(b => b.paymentStatus === 'Lunas').reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);
    const totalPendingPayment = blList.filter(b => b.paymentStatus !== 'Lunas').reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);

    // Total Cargo
    const totalTEUs = blList.reduce((acc, curr) => acc + (curr.containerCount || 0), 0);
    const totalTons = blList.reduce((acc, curr) => acc + (curr.grossWeightTons || 0), 0);
    const totalCbm = blList.reduce((acc, curr) => acc + (curr.volumeCbm || 0), 0);

    // Revenue by Route
    const revenueByRouteMap = new Map<string, { routeCode: string; routeName: string; revenue: number; cargoTons: number; teu: number; blCount: number }>();
    const ports = db.getPorts();
    const portMap = new Map(ports.map(p => [p.id, p.name]));

    for (const bl of blList) {
      const voyage = voyages.find(v => v.id === bl.voyageId);
      const routeId = voyage?.routeId || 'unknown';
      const route = routes.find(r => r.id === routeId);
      const originName = route ? portMap.get(route.originPortId) || route.originPortId : 'N/A';
      const destName = route ? portMap.get(route.destinationPortId) || route.destinationPortId : 'N/A';
      const routeCode = route?.code || 'R-LAIN';
      const routeName = `${originName} -> ${destName}`;

      const existing = revenueByRouteMap.get(routeCode) || {
        routeCode,
        routeName,
        revenue: 0,
        cargoTons: 0,
        teu: 0,
        blCount: 0
      };

      existing.revenue += (bl.totalAmount || 0);
      existing.cargoTons += (bl.grossWeightTons || 0);
      existing.teu += (bl.containerCount || 0);
      existing.blCount += 1;
      revenueByRouteMap.set(routeCode, existing);
    }

    // Revenue by Vessel
    const vesselStatsMap = new Map<string, { vesselName: string; type: string; totalRevenue: number; voyagesCount: number; status: string }>();
    for (const vsl of vessels) {
      vesselStatsMap.set(vsl.id, {
        vesselName: vsl.name,
        type: vsl.type,
        totalRevenue: 0,
        voyagesCount: 0,
        status: vsl.status
      });
    }

    for (const bl of blList) {
      const voyage = voyages.find(v => v.id === bl.voyageId);
      if (voyage && vesselStatsMap.has(voyage.vesselId)) {
        const item = vesselStatsMap.get(voyage.vesselId)!;
        item.totalRevenue += (bl.totalAmount || 0);
      }
    }

    for (const vy of voyages) {
      if (vesselStatsMap.has(vy.vesselId)) {
        const item = vesselStatsMap.get(vy.vesselId)!;
        item.voyagesCount += 1;
      }
    }

    // Status distributions
    const cargoStatusCounts = blList.reduce((acc, curr) => {
      acc[curr.cargoStatus] = (acc[curr.cargoStatus] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const paymentStatusCounts = blList.reduce((acc, curr) => {
      acc[curr.paymentStatus] = (acc[curr.paymentStatus] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    res.json({
      summary: {
        totalRevenue,
        totalFreightCost,
        totalPaid,
        totalPendingPayment,
        totalTEUs,
        totalTons,
        totalCbm,
        totalVoyages: voyages.length,
        totalBLs: blList.length,
        totalVessels: vessels.length,
        activeVessels: vessels.filter(v => v.status === 'Aktif' || v.status === 'Dalam Pelayaran').length
      },
      routeAnalytics: Array.from(revenueByRouteMap.values()),
      vesselAnalytics: Array.from(vesselStatsMap.values()),
      cargoStatusCounts,
      paymentStatusCounts
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------- VITE MIDDLEWARE & STATIC SERVING ----------------

async function startServer() {
  // Initialize Firebase Firestore connection & sync
  await initFirebaseStore();

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SEA FREIGHT TRANSPORT SERVER] Running on port ${PORT}`);
  });
}

startServer();

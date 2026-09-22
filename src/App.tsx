import React, { useState, useEffect, useCallback } from 'react';
import { api } from './services/api.ts';
import { Navbar } from './components/Navbar.tsx';
import { LoginForm } from './components/LoginForm.tsx';
import { DatabaseModal } from './components/DatabaseModal.tsx';
import { DashboardView } from './components/DashboardView.tsx';
import { MasterDataView } from './components/MasterDataView.tsx';
import { TransactionsView } from './components/TransactionsView.tsx';
import { ReportsView } from './components/ReportsView.tsx';
import { RefreshCw, AlertCircle, Ship, Database } from 'lucide-react';
import type { 
  User, DatabaseStatus, Vessel, Port, Route, 
  Customer, Voyage, BillOfLading, CargoTrackingLog 
} from './types.ts';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'master' | 'transactions' | 'reports'>('dashboard');
  
  // Database status & modal
  const [dbStatus, setDbStatus] = useState<DatabaseStatus | null>(null);
  const [isDbModalOpen, setIsDbModalOpen] = useState(false);

  // Quick transaction triggers
  const [triggerNewBL, setTriggerNewBL] = useState(false);
  const [triggerNewVoyage, setTriggerNewVoyage] = useState(false);

  // App data collections
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [ports, setPorts] = useState<Port[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [voyages, setVoyages] = useState<Voyage[]>([]);
  const [billsOfLading, setBillsOfLading] = useState<BillOfLading[]>([]);
  const [trackingLogs, setTrackingLogs] = useState<CargoTrackingLog[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load database status
  const fetchDbStatus = useCallback(async () => {
    try {
      const status = await api.getDbStatus();
      setDbStatus(status);
    } catch (err: any) {
      console.error('Failed to fetch DB status:', err);
    }
  }, []);

  // Fetch all domain data from database
  const refreshAllData = useCallback(async () => {
    if (!currentUser) return;
    setIsRefreshing(true);
    setErrorMessage(null);
    try {
      const [
        vesselsData,
        portsData,
        routesData,
        customersData,
        voyagesData,
        blData,
        trackingData,
      ] = await Promise.all([
        api.getVessels(),
        api.getPorts(),
        api.getRoutes(),
        api.getCustomers(),
        api.getVoyages(),
        api.getBillsOfLading(),
        api.getTrackingLogs(),
      ]);

      setVessels(vesselsData);
      setPorts(portsData);
      setRoutes(routesData);
      setCustomers(customersData);
      setVoyages(voyagesData);
      setBillsOfLading(blData);
      setTrackingLogs(trackingData);
    } catch (err: any) {
      console.error('Error loading data from database:', err);
      setErrorMessage(err.message || 'Gagal memuat data dari database');
    } finally {
      setIsRefreshing(false);
    }
  }, [currentUser]);

  // Initial user check
  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await fetchDbStatus();
      try {
        const user = await api.getCurrentUser();
        setCurrentUser(user);
      } catch {
        setCurrentUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, [fetchDbStatus]);

  // When user logs in or switches, refresh data
  useEffect(() => {
    if (currentUser) {
      refreshAllData();
    }
  }, [currentUser, refreshAllData]);

  // Handle Logout
  const handleLogout = async () => {
    try {
      await api.logout();
    } catch (e) {
      console.error(e);
    }
    setCurrentUser(null);
  };

  // Shortcut triggers
  const handleQuickNewBL = () => {
    setActiveTab('transactions');
    setTriggerNewBL(true);
  };

  const handleQuickNewVoyage = () => {
    setActiveTab('transactions');
    setTriggerNewVoyage(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin mb-4" />
        <div className="flex items-center gap-2 text-sm font-medium text-slate-300">
          <Ship className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span>Menghubungkan ke Database Angkutan Laut...</span>
        </div>
      </div>
    );
  }

  // If not logged in, display login form with demo accounts
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        {/* Top Minimal Brand Bar */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-600 flex items-center justify-center text-white shadow-md shadow-cyan-900/40">
              <Ship className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-sm text-white tracking-wide">SAMUDERA LOGISTIK</span>
              <span className="text-[10px] text-cyan-400 block font-medium">Sistem Angkutan Laut & Maritim</span>
            </div>
          </div>

          <button
            onClick={() => setIsDbModalOpen(true)}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs flex items-center gap-1.5 transition"
          >
            <Database className="w-3.5 h-3.5 text-cyan-400" />
            <span>Koneksi Real Database</span>
          </button>
        </div>

        {/* Login Container */}
        <div className="flex-1 flex items-center justify-center p-4">
          <LoginForm
            onLoginSuccess={(user) => {
              setCurrentUser(user);
              fetchDbStatus();
            }}
            dbStatus={dbStatus}
            onOpenDbModal={() => setIsDbModalOpen(true)}
          />
        </div>

        {/* Database Modal */}
        <DatabaseModal
          isOpen={isDbModalOpen}
          onClose={() => setIsDbModalOpen(false)}
          currentStatus={dbStatus}
          onRefreshStatus={fetchDbStatus}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Global Navigation Bar */}
      <Navbar
        currentUser={currentUser}
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          setTriggerNewBL(false);
          setTriggerNewVoyage(false);
        }}
        onLogout={handleLogout}
        dbStatus={dbStatus}
        onOpenDbModal={() => setIsDbModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Error Alert Bar */}
        {errorMessage && (
          <div className="p-3.5 bg-rose-950/80 border border-rose-800 rounded-xl text-xs text-rose-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={refreshAllData}
              className="px-2 py-1 bg-rose-900 hover:bg-rose-800 text-white rounded text-[11px] font-medium"
            >
              Coba Lagi
            </button>
          </div>
        )}

        {/* Refreshing Indicator */}
        {isRefreshing && (
          <div className="flex items-center gap-2 text-xs text-cyan-400 font-medium animate-pulse">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            <span>Menyinkronkan data real-time dari database...</span>
          </div>
        )}

        {/* View Routing */}
        {activeTab === 'dashboard' && (
          <DashboardView
            vessels={vessels}
            ports={ports}
            routes={routes}
            voyages={voyages}
            billsOfLading={billsOfLading}
            onNavigateTab={setActiveTab}
            onNewBL={handleQuickNewBL}
            onNewVoyage={handleQuickNewVoyage}
          />
        )}

        {activeTab === 'master' && (
          <MasterDataView
            vessels={vessels}
            ports={ports}
            routes={routes}
            customers={customers}
            onRefreshData={refreshAllData}
            userRole={currentUser.role}
          />
        )}

        {activeTab === 'transactions' && (
          <TransactionsView
            voyages={voyages}
            billsOfLading={billsOfLading}
            vessels={vessels}
            ports={ports}
            routes={routes}
            customers={customers}
            trackingLogs={trackingLogs}
            onRefreshData={refreshAllData}
            userRole={currentUser.role}
            initialOpenBLModal={triggerNewBL}
            initialOpenVoyageModal={triggerNewVoyage}
          />
        )}

        {activeTab === 'reports' && (
          <ReportsView
            voyages={voyages}
            billsOfLading={billsOfLading}
            vessels={vessels}
            ports={ports}
            routes={routes}
            customers={customers}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-4 px-6 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2 max-w-7xl w-full mx-auto print:hidden">
        <div>
          &copy; {new Date().getFullYear()} PT Samudera Logistik Nusantara &bull; Copyright <span className="text-slate-400 font-medium">Rifyanio K3B</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-slate-400">Database: <strong className="text-amber-300">Firebase Firestore</strong></span>
          </span>
          <span>&bull;</span>
          <span>Sumber Tunggal Kebenaran (Single Source of Truth)</span>
        </div>
      </footer>

      {/* Real Database Configuration Modal */}
      <DatabaseModal
        isOpen={isDbModalOpen}
        onClose={() => setIsDbModalOpen(false)}
        currentStatus={dbStatus}
        onStatusUpdated={(status) => {
          setDbStatus(status);
          refreshAllData();
        }}
      />
    </div>
  );
}

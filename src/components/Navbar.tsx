import React from 'react';
import { Ship, Database, LogOut, User as UserIcon, Shield, Layers, FileText, Navigation, BarChart3, Radio } from 'lucide-react';
import type { User, DatabaseStatus } from '../types.ts';

interface NavbarProps {
  currentUser: User;
  currentTab: 'dashboard' | 'master' | 'transactions' | 'reports';
  onSelectTab: (tab: 'dashboard' | 'master' | 'transactions' | 'reports') => void;
  dbStatus: DatabaseStatus | null;
  onOpenDbModal: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  currentTab,
  onSelectTab,
  dbStatus,
  onOpenDbModal,
  onLogout,
}) => {
  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-rose-950 text-rose-300 border-rose-800';
      case 'MANAGER':
        return 'bg-blue-950 text-blue-300 border-blue-800';
      default:
        return 'bg-emerald-950 text-emerald-300 border-emerald-800';
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-700 flex items-center justify-center text-white shadow-lg shadow-cyan-950 ring-2 ring-cyan-500/20">
              <Ship className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white tracking-tight text-sm sm:text-base">
                  SAMUDERA LOGISTIK
                </span>
                <span className="hidden md:inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold bg-cyan-950 text-cyan-400 border border-cyan-800 uppercase font-mono">
                  Angkutan Laut
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Sistem Terpadu Pelayaran & Muatan Nasional
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center space-x-1 sm:space-x-2">
            <button
              id="nav-tab-dashboard"
              onClick={() => onSelectTab('dashboard')}
              className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition flex items-center gap-1.5 ${
                currentTab === 'dashboard'
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/80 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </button>

            <button
              id="nav-tab-master"
              onClick={() => onSelectTab('master')}
              className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition flex items-center gap-1.5 ${
                currentTab === 'master'
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/80 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Master Data</span>
            </button>

            <button
              id="nav-tab-transactions"
              onClick={() => onSelectTab('transactions')}
              className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition flex items-center gap-1.5 ${
                currentTab === 'transactions'
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/80 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Transaksi Data</span>
            </button>

            <button
              id="nav-tab-reports"
              onClick={() => onSelectTab('reports')}
              className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition flex items-center gap-1.5 ${
                currentTab === 'reports'
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/80 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Laporan</span>
            </button>
          </nav>

          {/* Right Controls: Database Pill & User Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Firebase Firestore Status Button */}
            <button
              id="btn-db-status-pill"
              onClick={onOpenDbModal}
              title="Koneksi Database: Firebase Firestore"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-950 border border-amber-500/40 hover:border-amber-400 text-slate-300 hover:text-white text-xs transition group"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
              <Database className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden lg:inline font-mono text-[11px] text-amber-300 font-medium">
                Firebase Firestore
              </span>
            </button>

            {/* User Profile */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <div className="hidden sm:block text-right">
                <div className="text-xs font-semibold text-slate-200 truncate max-w-[130px]">
                  {currentUser.name}
                </div>
                <div className="flex items-center justify-end gap-1">
                  <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded border ${getRoleBadge(currentUser.role)}`}>
                    {currentUser.role}
                  </span>
                </div>
              </div>

              <button
                id="btn-logout"
                onClick={onLogout}
                title="Keluar / Logout"
                className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 border border-transparent hover:border-rose-900/50 transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

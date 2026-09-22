import React, { useState } from 'react';
import { Ship, Lock, User as UserIcon, ShieldCheck, Database, Anchor, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api.ts';
import type { User, DatabaseStatus } from '../types.ts';

interface LoginFormProps {
  onLoginSuccess: (user: User) => void;
  dbStatus: DatabaseStatus | null;
  onOpenDbModal?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess, dbStatus }) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    try {
      const res = await api.login(username, password);
      onLoginSuccess(res.user);
    } catch (err: any) {
      setErrorMessage(err.message || 'Login gagal, periksa username dan password Anda');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoUser: string, demoPass: string) => {
    setUsername(demoUser);
    setPassword(demoPass);
    setLoading(true);
    setErrorMessage('');
    api.login(demoUser, demoPass)
      .then(res => {
        onLoginSuccess(res.user);
      })
      .catch(err => {
        setErrorMessage(err.message || 'Login gagal');
      })
      .finally(() => setLoading(false));
  };

  return (
    <div id="login-screen-container" className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 py-8 relative overflow-hidden">
      {/* Background Decorative Nautical Elements */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-cyan-600 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-blue-700 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md z-10">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-700 text-white shadow-xl shadow-cyan-900/30 mb-3 ring-4 ring-cyan-500/20">
            <Ship className="w-9 h-9" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            MARITIM LOGISTIK NUSANTARA
          </h1>
          <p className="text-sm text-cyan-200/80 mt-1">
            Sistem Informasi Operasional & Manajemen Angkutan Laut
          </p>
        </div>

        {/* Database Live Status Indicator */}
        <div className="mb-4 bg-slate-900/80 border border-amber-500/30 rounded-xl p-3 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></div>
            <span className="text-xs font-medium text-slate-300">
              Database Terhubung:
            </span>
            <span className="text-xs font-semibold text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/60">
              Firebase Firestore
            </span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-slate-400">
            <Database className="w-3.5 h-3.5 text-amber-400" />
            <span>Koneksi Tunggal (Cloud)</span>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur-md">
          <h2 className="text-lg font-semibold text-slate-100 mb-1 flex items-center gap-2">
            <Lock className="w-4 h-4 text-cyan-400" />
            Autentikasi Staf & Manajerial
          </h2>
          <p className="text-xs text-slate-400 mb-5">
            Masuk dengan kredensial terdaftar untuk mengakses manifes dan armada.
          </p>

          {errorMessage && (
            <div className="mb-4 p-3 bg-rose-950/80 border border-rose-800 text-rose-300 text-xs rounded-xl flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Username atau Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <UserIcon className="w-4 h-4" />
                </div>
                <input
                  id="login-username-input"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin atau email"
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Kata Sandi
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="login-password-input"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                />
              </div>
            </div>

            <button
              id="btn-login-submit"
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium text-sm rounded-xl transition duration-150 flex items-center justify-center gap-2 shadow-lg shadow-cyan-900/30 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Masuk ke Sistem Pelayaran</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Akun Demo Buttons */}
          <div className="mt-6 pt-5 border-t border-slate-800">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              Pilih Akun Demo Cepat
            </p>
            <div className="space-y-2">
              <button
                type="button"
                id="btn-demo-admin"
                onClick={() => handleQuickLogin('admin', 'admin123')}
                className="w-full p-2.5 bg-slate-800/90 hover:bg-slate-750 border border-slate-700 hover:border-cyan-500/50 rounded-xl flex items-center justify-between text-left transition group"
              >
                <div>
                  <div className="text-xs font-semibold text-cyan-300 group-hover:text-cyan-200">
                    Administrator Utama (Capt. Hendra)
                  </div>
                  <div className="text-[11px] text-slate-400">
                    user: admin | pass: admin123 (Akses Penuh CRUD)
                  </div>
                </div>
                <span className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-800 px-2 py-0.5 rounded font-mono">
                  ADMIN
                </span>
              </button>

              <button
                type="button"
                id="btn-demo-manager"
                onClick={() => handleQuickLogin('manager', 'manager123')}
                className="w-full p-2.5 bg-slate-800/90 hover:bg-slate-750 border border-slate-700 hover:border-blue-500/50 rounded-xl flex items-center justify-between text-left transition group"
              >
                <div>
                  <div className="text-xs font-semibold text-blue-300 group-hover:text-blue-200">
                    Manager Operasional (Dewi Rahmadani)
                  </div>
                  <div className="text-[11px] text-slate-400">
                    user: manager | pass: manager123 (Transaksi & Laporan)
                  </div>
                </div>
                <span className="text-[10px] bg-blue-950 text-blue-300 border border-blue-800 px-2 py-0.5 rounded font-mono">
                  MANAGER
                </span>
              </button>

              <button
                type="button"
                id="btn-demo-operator"
                onClick={() => handleQuickLogin('operator', 'operator123')}
                className="w-full p-2.5 bg-slate-800/90 hover:bg-slate-750 border border-slate-700 hover:border-slate-600 rounded-xl flex items-center justify-between text-left transition group"
              >
                <div>
                  <div className="text-xs font-semibold text-slate-200 group-hover:text-white">
                    Staf Operasi & Manifest (Rizky Pratama)
                  </div>
                  <div className="text-[11px] text-slate-400">
                    user: operator | pass: operator123 (Manifest & B/L)
                  </div>
                </div>
                <span className="text-[10px] bg-slate-800 text-slate-300 border border-slate-600 px-2 py-0.5 rounded font-mono">
                  OPERATOR
                </span>
              </button>
            </div>
          </div>

          {/* Copyright below login form card */}
          <div id="login-card-copyright" className="mt-4 pt-3 border-t border-slate-800/80 text-center text-xs text-slate-400">
            <span>Copyright &copy; {new Date().getFullYear()} <strong className="text-cyan-400 font-semibold">Rifyanio K3B</strong></span>
          </div>
        </div>

        {/* Footer info & Copyright */}
        <div className="mt-4 text-center flex flex-col items-center justify-center gap-2">
          <div className="text-xs text-slate-500 flex items-center justify-center gap-2">
            <Anchor className="w-3.5 h-3.5 text-slate-400" />
            <span>Direktori Pelayaran Niaga Indonesia &bull; Standar SOLAS & BKI</span>
          </div>
          <div id="login-footer-copyright" className="text-xs text-slate-400 font-medium tracking-wide">
            Copyright &copy; {new Date().getFullYear()} <span className="text-cyan-400 font-semibold">Rifyanio K3B</span> &bull; All rights reserved
          </div>
        </div>
      </div>
    </div>
  );
};

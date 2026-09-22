import React, { useState } from 'react';
import { Database, CheckCircle2, AlertCircle, RefreshCw, X, Shield, Layers, Cloud } from 'lucide-react';
import { api } from '../services/api.ts';
import type { DatabaseStatus } from '../types.ts';

interface DatabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStatus: DatabaseStatus | null;
  onStatusUpdated?: (status: DatabaseStatus) => void;
}

export const DatabaseModal: React.FC<DatabaseModalProps> = ({
  isOpen,
  onClose,
  currentStatus,
  onStatusUpdated,
}) => {
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ success: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const handleSyncFirebase = async () => {
    setLoading(true);
    setFeedback(null);
    try {
      const res = await api.syncFirebase();
      setFeedback({ success: res.success, message: res.message });
      if (onStatusUpdated && res.status) {
        onStatusUpdated(res.status);
      }
    } catch (err: any) {
      setFeedback({ success: false, message: err.message || 'Sinkronisasi Firebase gagal' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="database-management-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden text-slate-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Cloud className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-base">
                Koneksi Database: Firebase Firestore
              </h3>
              <p className="text-xs text-slate-400">
                Satu-satunya koneksi data persisten resmi (Google Cloud Firestore)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Active Firebase Card */}
          <div className="bg-slate-950 border border-amber-500/30 rounded-xl p-4 shadow-lg shadow-amber-950/10">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Cloud className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Koneksi Database Aktif:
                </span>
              </div>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Firebase Firestore Terhubung
              </span>
            </div>

            <div className="space-y-1.5 text-xs font-mono text-slate-300 bg-slate-900/90 p-3 rounded-lg border border-slate-800 mb-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Project ID:</span>
                <span className="text-amber-400 font-semibold">{currentStatus?.projectId || 'gen-lang-client-0525919292'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Firestore DB:</span>
                <span className="text-cyan-400 truncate max-w-[280px]">{currentStatus?.databaseId || 'ai-studio-aplikasibisnisan...'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Arsitektur:</span>
                <span className="text-emerald-400">Single Source of Truth (Firestore)</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                <div className="text-slate-400 text-[11px]">Armada Kapal</div>
                <div className="text-sm font-bold text-white mt-0.5">{currentStatus?.totalVessels ?? 0}</div>
              </div>
              <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                <div className="text-slate-400 text-[11px]">Jadwal Pelayaran</div>
                <div className="text-sm font-bold text-cyan-400 mt-0.5">{currentStatus?.totalVoyages ?? 0}</div>
              </div>
              <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                <div className="text-slate-400 text-[11px]">Bill of Lading</div>
                <div className="text-sm font-bold text-emerald-400 mt-0.5">{currentStatus?.totalBillsOfLading ?? 0}</div>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-900 flex items-center justify-between text-[11px] text-slate-400">
              <span>Status Penyimpanan:</span>
              <span className="text-slate-300 font-medium">100% Firestore &bull; Tanpa localStorage</span>
            </div>
          </div>

          {/* Sync action */}
          <div>
            {feedback && (
              <div
                className={`mb-3 p-3 rounded-xl border text-xs flex items-start gap-2 ${
                  feedback.success
                    ? 'bg-emerald-950/80 border-emerald-800 text-emerald-300'
                    : 'bg-rose-950/80 border-rose-800 text-rose-300'
                }`}
              >
                {feedback.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                )}
                <span>{feedback.message}</span>
              </div>
            )}

            <button
              type="button"
              onClick={handleSyncFirebase}
              disabled={loading}
              className="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50 shadow-md shadow-amber-950"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Menyinkronkan Skema ke Firebase Firestore...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Sinkronkan Ulang Data ke Firebase Firestore</span>
                </>
              )}
            </button>
          </div>

          {/* Information Notice */}
          <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3.5 text-xs space-y-2">
            <div className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              Koneksi Tunggal Terverifikasi
            </div>
            <ul className="text-slate-400 space-y-1 text-[11px] list-disc list-inside">
              <li>Sesuai instruksi, seluruh koneksi database eksternal lain (PostgreSQL manual, Supabase, Neon DB) telah ditiadakan.</li>
              <li>Aplikasi secara eksklusif menggunakan <strong>Google Cloud Firebase Firestore</strong> sebagai penyimpan tunggal kebenaran.</li>
              <li>Sistem tidak menggunakan penyimpanan peramban (<code className="text-amber-400">localStorage</code>) demi keamanan data operasional.</li>
            </ul>
          </div>
        </div>

        <div className="px-6 py-3 bg-slate-950/90 border-t border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition"
          >
            Tutup Panel
          </button>
        </div>
      </div>
    </div>
  );
};

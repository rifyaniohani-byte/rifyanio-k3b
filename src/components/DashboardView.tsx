import React from 'react';
import { 
  Ship, Anchor, Navigation, TrendingUp, Package, DollarSign, 
  MapPin, Clock, ArrowRight, ShieldCheck, CheckCircle2, AlertTriangle, 
  Layers, PlusCircle
} from 'lucide-react';
import type { Vessel, Port, Route, Voyage, BillOfLading } from '../types.ts';

interface DashboardViewProps {
  vessels: Vessel[];
  ports: Port[];
  routes: Route[];
  voyages: Voyage[];
  billsOfLading: BillOfLading[];
  onNavigateTab: (tab: 'master' | 'transactions' | 'reports') => void;
  onNewBL: () => void;
  onNewVoyage: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  vessels,
  ports,
  routes,
  voyages,
  billsOfLading,
  onNavigateTab,
  onNewBL,
  onNewVoyage,
}) => {
  const portMap = new Map<string, Port>(ports.map(p => [p.id, p]));
  const vesselMap = new Map<string, Vessel>(vessels.map(v => [v.id, v]));
  const routeMap = new Map<string, Route>(routes.map(r => [r.id, r]));

  // Metrics
  const totalRevenue = billsOfLading.reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);
  const totalPaid = billsOfLading.filter(b => b.paymentStatus === 'Lunas').reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);
  const activeVesselsCount = vessels.filter(v => v.status === 'Aktif' || v.status === 'Dalam Pelayaran').length;
  const activeVoyages = voyages.filter(v => v.status === 'Dalam Pelayaran' || v.status === 'Proses Muat');
  const totalCargoTons = billsOfLading.reduce((acc, curr) => acc + (curr.grossWeightTons || 0), 0);
  const totalTeu = billsOfLading.reduce((acc, curr) => acc + (curr.containerCount || 0), 0);

  const formatIDR = (num: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);
  };

  return (
    <div id="dashboard-view-content" className="space-y-6 animate-fade-in">
      {/* Top Banner Overview */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-cyan-950 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-950/80 border border-cyan-700/50 text-cyan-300 text-xs font-semibold mb-2">
              <Anchor className="w-3.5 h-3.5" />
              <span>Pusat Kendali Operasi Angkutan Laut Nasional</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Manajemen Logistik Maritim Nusantara
            </h2>
            <p className="text-sm text-slate-300 max-w-2xl mt-1">
              Pantau armada kapal niaga, manifes kargo peti kemas & curah, rute pelayaran antar-pulau, serta validasi dokumen Bill of Lading secara tersentralisasi.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              id="btn-quick-new-bl"
              onClick={onNewBL}
              className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-cyan-950 flex items-center gap-2 transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Terbitkan B/L Baru</span>
            </button>
            <button
              id="btn-quick-new-voyage"
              onClick={onNewVoyage}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-2 transition"
            >
              <Navigation className="w-4 h-4 text-cyan-400" />
              <span>Jadwal Pelayaran</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Omset */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Ongkos Angkut</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-950/80 border border-emerald-800/80 flex items-center justify-center text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-white mt-2">
            {formatIDR(totalRevenue)}
          </div>
          <div className="flex items-center justify-between text-[11px] mt-2 text-slate-400">
            <span>Terealisasi Lunas:</span>
            <span className="text-emerald-400 font-semibold">{formatIDR(totalPaid)}</span>
          </div>
        </div>

        {/* Kargo Tonase & TEU */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Muatan Kargo Terangkut</span>
            <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-800/80 flex items-center justify-center text-cyan-400">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-cyan-400 mt-2">
            {totalCargoTons.toLocaleString('id-ID')} <span className="text-xs font-normal text-slate-400">Tonase</span>
          </div>
          <div className="flex items-center justify-between text-[11px] mt-2 text-slate-400">
            <span>Peti Kemas Kontainer:</span>
            <span className="text-cyan-300 font-semibold">{totalTeu} TEUs</span>
          </div>
        </div>

        {/* Armada Kapal */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Status Armada Kapal</span>
            <div className="w-8 h-8 rounded-lg bg-blue-950/80 border border-blue-800/80 flex items-center justify-center text-blue-400">
              <Ship className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-white mt-2">
            {activeVesselsCount} <span className="text-xs font-normal text-slate-400">/ {vessels.length} Beroperasi</span>
          </div>
          <div className="flex items-center justify-between text-[11px] mt-2 text-slate-400">
            <span>Dalam Perbaikan/Dock:</span>
            <span className="text-amber-400 font-semibold">
              {vessels.filter(v => v.status === 'Docking / Perbaikan').length} Kapal
            </span>
          </div>
        </div>

        {/* Pelayaran Aktif */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Pelayaran Aktif (Voyage)</span>
            <div className="w-8 h-8 rounded-lg bg-purple-950/80 border border-purple-800/80 flex items-center justify-center text-purple-400">
              <Navigation className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-purple-300 mt-2">
            {activeVoyages.length} <span className="text-xs font-normal text-slate-400">Sedang Berjalan</span>
          </div>
          <div className="flex items-center justify-between text-[11px] mt-2 text-slate-400">
            <span>Total Terjadwal:</span>
            <span className="text-purple-400 font-semibold">{voyages.length} Voyage</span>
          </div>
        </div>
      </div>

      {/* Active Voyages Live Operations Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div>
            <h3 className="font-semibold text-white text-sm sm:text-base flex items-center gap-2">
              <Navigation className="w-4 h-4 text-cyan-400" />
              Operasional Pelayaran Aktif di Laut (Live Voyaging)
            </h3>
            <p className="text-xs text-slate-400">
              Monitoring jadwal pelayaran, kapal pengangkut, dan estimasi waktu sandar (ETA).
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('transactions')}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1 transition"
          >
            <span>Lihat Semua Jadwal</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold text-[11px]">
              <tr>
                <th className="px-4 py-3">No. Voyage</th>
                <th className="px-4 py-3">Armada Kapal</th>
                <th className="px-4 py-3">Rute Pelayaran</th>
                <th className="px-4 py-3">Jadwal Keberangkatan (ETD)</th>
                <th className="px-4 py-3">Estimasi Kedatangan (ETA)</th>
                <th className="px-4 py-3">Muatan</th>
                <th className="px-4 py-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {voyages.slice(0, 5).map((vy) => {
                const vsl = vesselMap.get(vy.vesselId);
                const rt = routeMap.get(vy.routeId);
                const orig = rt ? portMap.get(rt.originPortId) : null;
                const dest = rt ? portMap.get(rt.destinationPortId) : null;

                const getStatusBadge = (status: string) => {
                  switch (status) {
                    case 'Dalam Pelayaran':
                      return 'bg-blue-950 text-blue-300 border-blue-800';
                    case 'Proses Muat':
                      return 'bg-amber-950 text-amber-300 border-amber-800';
                    case 'Selesai':
                      return 'bg-emerald-950 text-emerald-300 border-emerald-800';
                    default:
                      return 'bg-slate-800 text-slate-300 border-slate-700';
                  }
                };

                return (
                  <tr key={vy.id} className="hover:bg-slate-850/60 transition">
                    <td className="px-4 py-3.5 font-mono text-cyan-300 font-semibold">
                      {vy.voyageNumber}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="text-white font-semibold flex items-center gap-1.5">
                        <Ship className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span>{vsl?.name || vy.vesselId}</span>
                      </div>
                      <div className="text-[10px] text-slate-400">{vsl?.type} &bull; Nakhoda: {vy.masterCaptain}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="text-slate-200">
                        {orig?.city || 'Asal'} &rarr; {dest?.city || 'Tujuan'}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {rt?.distanceNm || 0} Mil Laut (NM)
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="text-slate-200">
                        {new Date(vy.departureDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {new Date(vy.departureDate).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="text-slate-200">
                        {new Date(vy.arrivalDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {new Date(vy.arrivalDate).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="text-cyan-300 font-mono">
                        {vy.totalLoadedTons > 0 ? `${vy.totalLoadedTons.toLocaleString()} Ton` : `${vy.totalLoadedTeu} TEU`}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${getStatusBadge(vy.status)}`}>
                        {vy.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Master Data Quick Matrix & Bill of Lading Recent Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Bill of Lading Feed */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white text-sm flex items-center gap-2">
              <Package className="w-4 h-4 text-emerald-400" />
              Surat Muatan Laut Terakhir (Bill of Lading / B/L)
            </h3>
            <button
              onClick={() => onNavigateTab('transactions')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-medium"
            >
              Lihat Semua
            </button>
          </div>

          <div className="space-y-3">
            {billsOfLading.slice(0, 4).map((bl) => {
              const vy = voyages.find(v => v.id === bl.voyageId);
              const vsl = vy ? vesselMap.get(vy.vesselId) : null;

              return (
                <div key={bl.id} className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-cyan-400">
                        {bl.blNumber}
                      </span>
                      <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                        {bl.cargoCategory}
                      </span>
                    </div>
                    <div className="text-xs text-slate-200 font-medium mt-1">
                      {bl.consigneeName}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                      <span>Kapal: {vsl?.name || 'Armada'}</span>
                      <span>&bull;</span>
                      <span>Muatan: {bl.grossWeightTons.toLocaleString()} Ton {bl.containerCount > 0 ? `(${bl.containerCount} TEU)` : ''}</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0 flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800">
                    <div className="text-xs font-bold text-emerald-400 font-mono">
                      {formatIDR(bl.totalAmount)}
                    </div>
                    <span className={`mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                      bl.paymentStatus === 'Lunas' 
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                        : 'bg-amber-950 text-amber-300 border-amber-800'
                    }`}>
                      {bl.paymentStatus}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Master Data Quick Status */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-semibold text-white text-sm mb-1 flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              Infrastruktur Master Data
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Data referensi utama pelayaran dan jaringan pelabuhan.
            </p>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-300">Pelabuhan & Terminal Niaga</span>
                <span className="font-bold text-white font-mono">{ports.length} Pelabuhan</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-300">Trayek / Rute Pelayaran Laut</span>
                <span className="font-bold text-cyan-400 font-mono">{routes.length} Rute</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-300">Total Armada Kapal Terdaftar</span>
                <span className="font-bold text-purple-400 font-mono">{vessels.length} Unit</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('master')}
            className="w-full mt-4 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5"
          >
            <span>Kelola Master Data (CRUD)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

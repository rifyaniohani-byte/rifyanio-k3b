import React, { useState } from 'react';
import { 
  FileText, Navigation, Package, Search, Plus, Edit2, Trash2, 
  Printer, ArrowRight, CheckCircle2, Clock, MapPin, Ship, DollarSign,
  AlertCircle, RefreshCw, X, Shield, Eye
} from 'lucide-react';
import { api } from '../services/api.ts';
import { BillOfLadingPrintModal } from './BillOfLadingPrintModal.tsx';
import type { 
  Voyage, BillOfLading, Vessel, Port, Route, Customer, 
  VoyageStatus, CargoStatus, PaymentStatus, CargoCategory, CargoTrackingLog 
} from '../types.ts';

interface TransactionsViewProps {
  voyages: Voyage[];
  billsOfLading: BillOfLading[];
  vessels: Vessel[];
  ports: Port[];
  routes: Route[];
  customers: Customer[];
  trackingLogs: CargoTrackingLog[];
  onRefreshData: () => Promise<void>;
  userRole: string;
  initialOpenBLModal?: boolean;
  initialOpenVoyageModal?: boolean;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  voyages,
  billsOfLading,
  vessels,
  ports,
  routes,
  customers,
  trackingLogs,
  onRefreshData,
  userRole,
  initialOpenBLModal = false,
  initialOpenVoyageModal = false,
}) => {
  const [activeTab, setActiveTab] = useState<'bl' | 'voyages' | 'tracking'>('bl');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Selected item for print
  const [selectedBLForPrint, setSelectedBLForPrint] = useState<BillOfLading | null>(null);

  // Modal states
  const [openVoyageModal, setOpenVoyageModal] = useState<boolean>(initialOpenVoyageModal);
  const [editingVoyage, setEditingVoyage] = useState<Voyage | null>(null);

  const [openBLModal, setOpenBLModal] = useState<boolean>(initialOpenBLModal);
  const [editingBL, setEditingBL] = useState<BillOfLading | null>(null);

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Maps for fast lookups
  const vesselMap = new Map<string, Vessel>(vessels.map(v => [v.id, v]));
  const portMap = new Map<string, Port>(ports.map(p => [p.id, p]));
  const routeMap = new Map<string, Route>(routes.map(r => [r.id, r]));
  const customerMap = new Map<string, Customer>(customers.map(c => [c.id, c]));
  const voyageMap = new Map<string, Voyage>(voyages.map(v => [v.id, v]));

  // ---------------- VOYAGE FORM STATE ----------------
  const [voyageForm, setVoyageForm] = useState({
    voyageNumber: `VOY-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
    vesselId: vessels[0]?.id || '',
    routeId: routes[0]?.id || '',
    departureDate: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
    arrivalDate: new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 16),
    status: 'Terjadwal' as VoyageStatus,
    masterCaptain: 'Capt. Bambang Sudirman, M.Mar',
    totalLoadedTeu: 200,
    totalLoadedTons: 4500,
    fuelConsumptionEstLiters: 22000,
    notes: '',
  });

  // ---------------- BILL OF LADING FORM STATE ----------------
  const [blForm, setBlForm] = useState({
    blNumber: `BL-MAR-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    bookingDate: new Date().toISOString().slice(0, 10),
    voyageId: voyages[0]?.id || '',
    customerId: customers[0]?.id || '',
    cargoCategory: 'Peti Kemas (FCL/LCL)' as CargoCategory,
    cargoDescription: '',
    containerCount: 10,
    grossWeightTons: 150,
    volumeCbm: 380,
    freightRate: 0,
    handlingFee: 5000000,
    insuranceFee: 4500000,
    taxAmount: 0,
    totalAmount: 0,
    paymentStatus: 'Belum Lunas' as PaymentStatus,
    cargoStatus: 'Booking Diterima' as CargoStatus,
    consigneeName: '',
    consigneeAddress: '',
    consigneePhone: '',
    shipperNotes: '',
    containerNumbersText: 'SNLU-102030-1, SNLU-102031-7',
  });

  // Auto calculate Freight Rate when Voyage, Cargo Category, or Quantity changes
  const calculateBLRates = (voyId: string, category: CargoCategory, teuCount: number, tons: number, handling: number, insurance: number) => {
    const vy = voyageMap.get(voyId);
    const rt = vy ? routeMap.get(vy.routeId) : null;
    let baseFreight = 0;

    if (rt) {
      if (category.includes('Peti Kemas') && teuCount > 0) {
        baseFreight = teuCount * rt.baseRatePerTeu;
      } else {
        baseFreight = tons * rt.baseRatePerTon;
      }
    } else {
      baseFreight = 50000000;
    }

    const subtotal = baseFreight + handling + insurance;
    const tax = Math.round(subtotal * 0.11); // PPN 11%
    const total = subtotal + tax;

    return { baseFreight, tax, total };
  };

  const handleOpenCreateBL = () => {
    setEditingBL(null);
    const defaultVoyId = voyages[0]?.id || '';
    const { baseFreight, tax, total } = calculateBLRates(defaultVoyId, 'Peti Kemas (FCL/LCL)', 10, 150, 5000000, 4500000);
    setBlForm({
      blNumber: `BL-MAR-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      bookingDate: new Date().toISOString().slice(0, 10),
      voyageId: defaultVoyId,
      customerId: customers[0]?.id || '',
      cargoCategory: 'Peti Kemas (FCL/LCL)',
      cargoDescription: 'Muatan komoditas industri terstandarisasi kontainer',
      containerCount: 10,
      grossWeightTons: 150,
      volumeCbm: 380,
      freightRate: baseFreight,
      handlingFee: 5000000,
      insuranceFee: 4500000,
      taxAmount: tax,
      totalAmount: total,
      paymentStatus: 'Belum Lunas',
      cargoStatus: 'Booking Diterima',
      consigneeName: 'PT Penerima Muatan Sejahtera',
      consigneeAddress: 'Kawasan Pergudangan Logistik Pelabuhan',
      consigneePhone: '+62 812-9988-7766',
      shipperNotes: 'Pastikan segel kontainer utuh sebelum proses muat',
      containerNumbersText: 'SNLU-778811-0, SNLU-778812-5',
    });
    setOpenBLModal(true);
  };

  const handleOpenEditBL = (bl: BillOfLading) => {
    setEditingBL(bl);
    setBlForm({
      blNumber: bl.blNumber,
      bookingDate: bl.bookingDate.slice(0, 10),
      voyageId: bl.voyageId,
      customerId: bl.customerId,
      cargoCategory: bl.cargoCategory,
      cargoDescription: bl.cargoDescription,
      containerCount: bl.containerCount,
      grossWeightTons: bl.grossWeightTons,
      volumeCbm: bl.volumeCbm,
      freightRate: bl.freightRate,
      handlingFee: bl.handlingFee,
      insuranceFee: bl.insuranceFee,
      taxAmount: bl.taxAmount,
      totalAmount: bl.totalAmount,
      paymentStatus: bl.paymentStatus,
      cargoStatus: bl.cargoStatus,
      consigneeName: bl.consigneeName,
      consigneeAddress: bl.consigneeAddress,
      consigneePhone: bl.consigneePhone,
      shipperNotes: bl.shipperNotes || '',
      containerNumbersText: (bl.containerNumbers || []).join(', '),
    });
    setOpenBLModal(true);
  };

  const handleSubmitBL = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const containerList = blForm.containerNumbersText
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

      const payload = {
        blNumber: blForm.blNumber,
        bookingDate: new Date(blForm.bookingDate).toISOString(),
        voyageId: blForm.voyageId,
        customerId: blForm.customerId,
        cargoCategory: blForm.cargoCategory,
        cargoDescription: blForm.cargoDescription,
        containerNumbers: containerList,
        containerCount: Number(blForm.containerCount),
        grossWeightTons: Number(blForm.grossWeightTons),
        volumeCbm: Number(blForm.volumeCbm),
        freightRate: Number(blForm.freightRate),
        handlingFee: Number(blForm.handlingFee),
        insuranceFee: Number(blForm.insuranceFee),
        taxAmount: Number(blForm.taxAmount),
        totalAmount: Number(blForm.totalAmount),
        paymentStatus: blForm.paymentStatus,
        cargoStatus: blForm.cargoStatus,
        consigneeName: blForm.consigneeName,
        consigneeAddress: blForm.consigneeAddress,
        consigneePhone: blForm.consigneePhone,
        shipperNotes: blForm.shipperNotes,
      };

      if (editingBL) {
        await api.updateBillOfLading(editingBL.id, payload);
      } else {
        await api.createBillOfLading(payload);
      }

      await onRefreshData();
      setOpenBLModal(false);
      setEditingBL(null);
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan Bill of Lading');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ---------------- VOYAGE CRUD HANDLERS ----------------
  const handleOpenCreateVoyage = () => {
    setEditingVoyage(null);
    setVoyageForm({
      voyageNumber: `VOY-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      vesselId: vessels[0]?.id || '',
      routeId: routes[0]?.id || '',
      departureDate: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
      arrivalDate: new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 16),
      status: 'Terjadwal',
      masterCaptain: 'Capt. Yanuar Pratama, M.Mar',
      totalLoadedTeu: 150,
      totalLoadedTons: 3500,
      fuelConsumptionEstLiters: 18000,
      notes: '',
    });
    setOpenVoyageModal(true);
  };

  const handleOpenEditVoyage = (vy: Voyage) => {
    setEditingVoyage(vy);
    setVoyageForm({
      voyageNumber: vy.voyageNumber,
      vesselId: vy.vesselId,
      routeId: vy.routeId,
      departureDate: vy.departureDate.slice(0, 16),
      arrivalDate: vy.arrivalDate.slice(0, 16),
      status: vy.status,
      masterCaptain: vy.masterCaptain,
      totalLoadedTeu: vy.totalLoadedTeu,
      totalLoadedTons: vy.totalLoadedTons,
      fuelConsumptionEstLiters: vy.fuelConsumptionEstLiters,
      notes: vy.notes || '',
    });
    setOpenVoyageModal(true);
  };

  const handleSubmitVoyage = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        voyageNumber: voyageForm.voyageNumber,
        vesselId: voyageForm.vesselId,
        routeId: voyageForm.routeId,
        departureDate: new Date(voyageForm.departureDate).toISOString(),
        arrivalDate: new Date(voyageForm.arrivalDate).toISOString(),
        status: voyageForm.status,
        masterCaptain: voyageForm.masterCaptain,
        totalLoadedTeu: Number(voyageForm.totalLoadedTeu),
        totalLoadedTons: Number(voyageForm.totalLoadedTons),
        fuelConsumptionEstLiters: Number(voyageForm.fuelConsumptionEstLiters),
        notes: voyageForm.notes,
      };

      if (editingVoyage) {
        await api.updateVoyage(editingVoyage.id, payload);
      } else {
        await api.createVoyage(payload);
      }

      await onRefreshData();
      setOpenVoyageModal(false);
      setEditingVoyage(null);
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan jadwal voyage');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, type: 'bl' | 'voyage') => {
    setIsSubmitting(true);
    try {
      if (type === 'bl') {
        await api.deleteBillOfLading(id);
      } else {
        await api.deleteVoyage(id);
      }
      await onRefreshData();
      setDeleteConfirmId(null);
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus data');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatIDR = (num: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);
  };

  return (
    <div id="transactions-view" className="space-y-6 animate-fade-in">
      {/* Top Banner Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyan-400" />
            Transaksi Operasional & Surat Muatan Laut
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Penerbitan Bill of Lading (B/L), manifes kargo pelayaran, jadwal voyage kapal, dan riwayat tracking muatan.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'bl' && (
            <button
              id="btn-create-bl-modal"
              onClick={handleOpenCreateBL}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition shadow-md shadow-cyan-950"
            >
              <Plus className="w-4 h-4" />
              <span>Terbitkan B/L Baru</span>
            </button>
          )}

          {activeTab === 'voyages' && (
            <button
              id="btn-create-voyage-modal"
              onClick={handleOpenCreateVoyage}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition shadow-md shadow-cyan-950"
            >
              <Plus className="w-4 h-4" />
              <span>Buat Jadwal Voyage</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => { setActiveTab('bl'); setSearchTerm(''); }}
          className={`px-4 py-2.5 rounded-t-xl text-xs font-semibold flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
            activeTab === 'bl'
              ? 'border-cyan-400 text-cyan-300 bg-slate-900/90'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Surat Muatan / Bill of Lading ({billsOfLading.length})</span>
        </button>

        <button
          onClick={() => { setActiveTab('voyages'); setSearchTerm(''); }}
          className={`px-4 py-2.5 rounded-t-xl text-xs font-semibold flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
            activeTab === 'voyages'
              ? 'border-cyan-400 text-cyan-300 bg-slate-900/90'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Navigation className="w-4 h-4" />
          <span>Jadwal Pelayaran / Voyages ({voyages.length})</span>
        </button>

        <button
          onClick={() => { setActiveTab('tracking'); setSearchTerm(''); }}
          className={`px-4 py-2.5 rounded-t-xl text-xs font-semibold flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
            activeTab === 'tracking'
              ? 'border-cyan-400 text-cyan-300 bg-slate-900/90'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Pelacakan & Log Muatan ({trackingLogs.length})</span>
        </button>
      </div>

      {/* Search Filter */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={`Cari transaksi ${activeTab === 'bl' ? 'No. B/L, Shipper, Penerima...' : activeTab === 'voyages' ? 'No. Voyage, Kapal, Nakhoda...' : 'No. B/L atau Lokasi Tracking...'}`}
          className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
        />
      </div>

      {/* TAB 1: BILLS OF LADING (SURAT MUATAN LAUT) */}
      {activeTab === 'bl' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold text-[11px]">
                <tr>
                  <th className="px-4 py-3">No. B/L & Tanggal</th>
                  <th className="px-4 py-3">Shipper & Penerima (Consignee)</th>
                  <th className="px-4 py-3">Jadwal Voyage & Kapal</th>
                  <th className="px-4 py-3">Kategori & Muatan</th>
                  <th className="px-4 py-3">Total Ongkos Angkut</th>
                  <th className="px-4 py-3">Pembayaran</th>
                  <th className="px-4 py-3">Status Kargo</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {billsOfLading
                  .filter(b => 
                    b.blNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    b.consigneeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (customerMap.get(b.customerId)?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((b) => {
                    const cust = customerMap.get(b.customerId);
                    const vy = voyageMap.get(b.voyageId);
                    const vsl = vy ? vesselMap.get(vy.vesselId) : null;
                    const rt = vy ? routeMap.get(vy.routeId) : null;

                    return (
                      <tr key={b.id} className="hover:bg-slate-850/60 transition">
                        <td className="px-4 py-3">
                          <div className="font-mono font-bold text-cyan-400 flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                            <span>{b.blNumber}</span>
                          </div>
                          <div className="text-[10px] text-slate-500">
                            {new Date(b.bookingDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-white font-semibold">{cust?.name || 'Shipper'}</div>
                          <div className="text-[11px] text-slate-400">Penerima: {b.consigneeName}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-slate-200 font-mono">{vy?.voyageNumber || '-'}</div>
                          <div className="text-[10px] text-cyan-400">{vsl?.name || 'Armada Kapal'}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-slate-200 font-medium">{b.cargoCategory}</div>
                          <div className="text-[10px] text-slate-400">
                            {b.grossWeightTons.toLocaleString()} Ton {b.containerCount > 0 ? `(${b.containerCount} TEU)` : ''}
                          </div>
                        </td>
                        <td className="px-4 py-3 font-mono">
                          <div className="text-emerald-400 font-bold">{formatIDR(b.totalAmount)}</div>
                          <div className="text-[10px] text-slate-500">Dasar: {formatIDR(b.freightRate)}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                            b.paymentStatus === 'Lunas'
                              ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                              : 'bg-amber-950 text-amber-300 border-amber-800'
                          }`}>
                            {b.paymentStatus}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-200 border border-slate-700">
                            {b.cargoStatus}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          {deleteConfirmId === b.id ? (
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => handleDelete(b.id, 'bl')}
                                disabled={isSubmitting}
                                className="px-2 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded text-[10px] font-bold"
                              >
                                Ya, Hapus
                              </button>
                              <button
                                onClick={() => setDeleteConfirmId(null)}
                                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px]"
                              >
                                Batal
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => setSelectedBLForPrint(b)}
                                className="p-1.5 hover:bg-cyan-950/60 text-slate-400 hover:text-cyan-300 rounded transition"
                                title="Cetak / Pratinjau Dokumen B/L Resmi"
                              >
                                <Printer className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleOpenEditBL(b)}
                                className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded transition"
                                title="Edit Status B/L"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setDeleteConfirmId(b.id)}
                                className="p-1.5 hover:bg-rose-950/50 text-slate-400 hover:text-rose-400 rounded transition"
                                title="Hapus B/L"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: VOYAGES (JADWAL PELAYARAN) */}
      {activeTab === 'voyages' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold text-[11px]">
                <tr>
                  <th className="px-4 py-3">No. Voyage</th>
                  <th className="px-4 py-3">Armada Kapal</th>
                  <th className="px-4 py-3">Rute Pelayaran</th>
                  <th className="px-4 py-3">Jadwal Keberangkatan & Kedatangan</th>
                  <th className="px-4 py-3">Nakhoda (Master)</th>
                  <th className="px-4 py-3">Muatan & Konsumsi BBM</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {voyages
                  .filter(v => 
                    v.voyageNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (vesselMap.get(v.vesselId)?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                    v.masterCaptain.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((v) => {
                    const vsl = vesselMap.get(v.vesselId);
                    const rt = routeMap.get(v.routeId);
                    const orig = rt ? portMap.get(rt.originPortId) : null;
                    const dest = rt ? portMap.get(rt.destinationPortId) : null;

                    return (
                      <tr key={v.id} className="hover:bg-slate-850/60 transition">
                        <td className="px-4 py-3 font-mono font-bold text-cyan-400">
                          {v.voyageNumber}
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-white font-semibold flex items-center gap-1.5">
                            <Ship className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                            <span>{vsl?.name || v.vesselId}</span>
                          </div>
                          <div className="text-[10px] text-slate-500">{vsl?.type}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-slate-200">{orig?.city} &rarr; {dest?.city}</div>
                          <div className="text-[10px] text-slate-500">{rt?.distanceNm} Mil Laut</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-slate-200">
                            ETD: {new Date(v.departureDate).toLocaleDateString('id-ID')}
                          </div>
                          <div className="text-slate-400 text-[10px]">
                            ETA: {new Date(v.arrivalDate).toLocaleDateString('id-ID')}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-300">
                          {v.masterCaptain}
                        </td>
                        <td className="px-4 py-3 font-mono">
                          <div className="text-cyan-300">{v.totalLoadedTons.toLocaleString()} Ton</div>
                          <div className="text-[10px] text-slate-500">Est. BBM: {v.fuelConsumptionEstLiters.toLocaleString()} L</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                            v.status === 'Dalam Pelayaran'
                              ? 'bg-blue-950 text-blue-300 border-blue-800'
                              : v.status === 'Selesai'
                              ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                              : 'bg-amber-950 text-amber-300 border-amber-800'
                          }`}>
                            {v.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          {deleteConfirmId === v.id ? (
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => handleDelete(v.id, 'voyage')}
                                disabled={isSubmitting}
                                className="px-2 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded text-[10px] font-bold"
                              >
                                Ya, Hapus
                              </button>
                              <button
                                onClick={() => setDeleteConfirmId(null)}
                                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px]"
                              >
                                Batal
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => handleOpenEditVoyage(v)}
                                className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-cyan-300 rounded transition"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setDeleteConfirmId(v.id)}
                                className="p-1.5 hover:bg-rose-950/50 text-slate-400 hover:text-rose-400 rounded transition"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: TRACKING & CARGO LOGS */}
      {activeTab === 'tracking' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold text-white text-sm mb-1 flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            Riwayat Log Status & Pelacakan Kargo (Audit Trail)
          </h3>
          <p className="text-xs text-slate-400 mb-6">
            Pencatatan real-time perubahan posisi dan status kargo dari muat pelabuhan asal hingga serah terima di pelabuhan tujuan.
          </p>

          <div className="space-y-4">
            {trackingLogs
              .filter(t => {
                const bl = billsOfLading.find(b => b.id === t.blId);
                return (
                  t.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  t.notes.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  (bl?.blNumber || '').toLowerCase().includes(searchTerm.toLowerCase())
                );
              })
              .map((t) => {
                const bl = billsOfLading.find(b => b.id === t.blId);

                return (
                  <div key={t.id} className="p-4 bg-slate-950/70 border border-slate-800/80 rounded-xl flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-800/60 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-cyan-300">
                            {bl?.blNumber || t.blId}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                            {t.status}
                          </span>
                        </div>
                        <div className="text-xs text-white font-medium mt-1">
                          {t.location}
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {t.notes}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0 text-[11px] text-slate-500 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800">
                      <div className="text-slate-300 font-mono">
                        {new Date(t.timestamp).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {new Date(t.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB &bull; {t.updatedBy}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* CREATE / EDIT BILL OF LADING MODAL */}
      {openBLModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden text-slate-200">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <h3 className="font-semibold text-white text-base">
                {editingBL ? 'Perbarui Surat Muatan (B/L)' : 'Penerbitan Surat Muatan Baru (Bill of Lading)'}
              </h3>
              <button
                onClick={() => setOpenBLModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitBL} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Nomor B/L (Bill of Lading)</label>
                  <input
                    type="text"
                    value={blForm.blNumber}
                    onChange={(e) => setBlForm({ ...blForm, blNumber: e.target.value })}
                    required
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono font-bold text-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Tanggal Booking</label>
                  <input
                    type="date"
                    value={blForm.bookingDate}
                    onChange={(e) => setBlForm({ ...blForm, bookingDate: e.target.value })}
                    required
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Pilih Jadwal Voyage & Kapal</label>
                  <select
                    value={blForm.voyageId}
                    onChange={(e) => {
                      const newVoyId = e.target.value;
                      const { baseFreight, tax, total } = calculateBLRates(
                        newVoyId,
                        blForm.cargoCategory,
                        blForm.containerCount,
                        blForm.grossWeightTons,
                        blForm.handlingFee,
                        blForm.insuranceFee
                      );
                      setBlForm({
                        ...blForm,
                        voyageId: newVoyId,
                        freightRate: baseFreight,
                        taxAmount: tax,
                        totalAmount: total,
                      });
                    }}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100"
                  >
                    {voyages.map(v => {
                      const vsl = vesselMap.get(v.vesselId);
                      const rt = routeMap.get(v.routeId);
                      return (
                        <option key={v.id} value={v.id}>
                          {v.voyageNumber} - {vsl?.name} ({rt?.code})
                        </option>
                      );
                    })}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Pengirim / Shipper</label>
                  <select
                    value={blForm.customerId}
                    onChange={(e) => setBlForm({ ...blForm, customerId: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100"
                  >
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.category})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Kategori Kargo</label>
                  <select
                    value={blForm.cargoCategory}
                    onChange={(e) => {
                      const newCategory = e.target.value as CargoCategory;
                      const { baseFreight, tax, total } = calculateBLRates(
                        blForm.voyageId,
                        newCategory,
                        blForm.containerCount,
                        blForm.grossWeightTons,
                        blForm.handlingFee,
                        blForm.insuranceFee
                      );
                      setBlForm({
                        ...blForm,
                        cargoCategory: newCategory,
                        freightRate: baseFreight,
                        taxAmount: tax,
                        totalAmount: total,
                      });
                    }}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100"
                  >
                    <option value="Peti Kemas (FCL/LCL)">Peti Kemas (FCL/LCL)</option>
                    <option value="Curah Kering (Bulk)">Curah Kering (Bulk)</option>
                    <option value="Curah Cair (Liquid)">Curah Cair (Liquid)</option>
                    <option value="Breakbulk / Kendaraan">Breakbulk / Kendaraan</option>
                    <option value="Barang Berbahaya (DG)">Barang Berbahaya (DG)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Jumlah Kontainer (TEU)</label>
                  <input
                    type="number"
                    value={blForm.containerCount}
                    onChange={(e) => {
                      const count = Number(e.target.value);
                      const { baseFreight, tax, total } = calculateBLRates(
                        blForm.voyageId,
                        blForm.cargoCategory,
                        count,
                        blForm.grossWeightTons,
                        blForm.handlingFee,
                        blForm.insuranceFee
                      );
                      setBlForm({
                        ...blForm,
                        containerCount: count,
                        freightRate: baseFreight,
                        taxAmount: tax,
                        totalAmount: total,
                      });
                    }}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Berat Kotor (Gross Ton)</label>
                  <input
                    type="number"
                    value={blForm.grossWeightTons}
                    onChange={(e) => {
                      const tons = Number(e.target.value);
                      const { baseFreight, tax, total } = calculateBLRates(
                        blForm.voyageId,
                        blForm.cargoCategory,
                        blForm.containerCount,
                        tons,
                        blForm.handlingFee,
                        blForm.insuranceFee
                      );
                      setBlForm({
                        ...blForm,
                        grossWeightTons: tons,
                        freightRate: baseFreight,
                        taxAmount: tax,
                        totalAmount: total,
                      });
                    }}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Deskripsi & Rincian Muatan</label>
                <input
                  type="text"
                  value={blForm.cargoDescription}
                  onChange={(e) => setBlForm({ ...blForm, cargoDescription: e.target.value })}
                  placeholder="Contoh: Plat baja, pupuk urea curah, atau 20 kontainer bahan makanan..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Nomor Kontainer / Seal (Pisahkan koma)</label>
                <input
                  type="text"
                  value={blForm.containerNumbersText}
                  onChange={(e) => setBlForm({ ...blForm, containerNumbersText: e.target.value })}
                  placeholder="SNLU-123456-7, SNLU-765432-1..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Nama Penerima (Consignee)</label>
                  <input
                    type="text"
                    value={blForm.consigneeName}
                    onChange={(e) => setBlForm({ ...blForm, consigneeName: e.target.value })}
                    required
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Telepon Penerima</label>
                  <input
                    type="text"
                    value={blForm.consigneePhone}
                    onChange={(e) => setBlForm({ ...blForm, consigneePhone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Alamat Penerima di Pelabuhan Tujuan</label>
                <input
                  type="text"
                  value={blForm.consigneeAddress}
                  onChange={(e) => setBlForm({ ...blForm, consigneeAddress: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100"
                />
              </div>

              {/* Financial Calculation Box */}
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2 text-xs">
                <div className="font-semibold text-slate-300 flex items-center justify-between">
                  <span>Rincian Biaya Freight (Dihitung Otomatis Sesuai Tarif Rute):</span>
                  <span className="text-emerald-400 font-mono font-bold text-sm">
                    {formatIDR(blForm.totalAmount)}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-400">
                  <div>
                    <span>Tarif Angkut:</span>
                    <div className="font-mono font-bold text-slate-200">{formatIDR(blForm.freightRate)}</div>
                  </div>
                  <div>
                    <span>Handling + Asuransi:</span>
                    <div className="font-mono text-slate-200">{formatIDR(blForm.handlingFee + blForm.insuranceFee)}</div>
                  </div>
                  <div>
                    <span>PPN (11%):</span>
                    <div className="font-mono text-slate-200">{formatIDR(blForm.taxAmount)}</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Status Pembayaran</label>
                  <select
                    value={blForm.paymentStatus}
                    onChange={(e) => setBlForm({ ...blForm, paymentStatus: e.target.value as PaymentStatus })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100"
                  >
                    <option value="Belum Lunas">Belum Lunas</option>
                    <option value="DP (Uang Muka)">DP (Uang Muka)</option>
                    <option value="Lunas">Lunas</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Status Kargo</label>
                  <select
                    value={blForm.cargoStatus}
                    onChange={(e) => setBlForm({ ...blForm, cargoStatus: e.target.value as CargoStatus })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100"
                  >
                    <option value="Booking Diterima">Booking Diterima</option>
                    <option value="Muat di Pelabuhan">Muat di Pelabuhan</option>
                    <option value="Dalam Pelayaran">Dalam Pelayaran</option>
                    <option value="Bongkar Muat">Bongkar Muat</option>
                    <option value="Telah Diterima (Delivered)">Telah Diterima (Delivered)</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setOpenBLModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-xl text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <span>Simpan B/L ke Database</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE / EDIT VOYAGE MODAL */}
      {openVoyageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden text-slate-200">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <h3 className="font-semibold text-white text-base">
                {editingVoyage ? 'Perbarui Jadwal Voyage' : 'Buat Jadwal Pelayaran Baru'}
              </h3>
              <button
                onClick={() => setOpenVoyageModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitVoyage} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Nomor Voyage</label>
                  <input
                    type="text"
                    value={voyageForm.voyageNumber}
                    onChange={(e) => setVoyageForm({ ...voyageForm, voyageNumber: e.target.value })}
                    required
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono font-bold text-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Status Pelayaran</label>
                  <select
                    value={voyageForm.status}
                    onChange={(e) => setVoyageForm({ ...voyageForm, status: e.target.value as VoyageStatus })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100"
                  >
                    <option value="Terjadwal">Terjadwal</option>
                    <option value="Proses Muat">Proses Muat</option>
                    <option value="Dalam Pelayaran">Dalam Pelayaran</option>
                    <option value="Tiba di Tujuan">Tiba di Tujuan</option>
                    <option value="Selesai">Selesai</option>
                    <option value="Dibatalkan">Dibatalkan</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Armada Kapal</label>
                  <select
                    value={voyageForm.vesselId}
                    onChange={(e) => setVoyageForm({ ...voyageForm, vesselId: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100"
                  >
                    {vessels.map(v => (
                      <option key={v.id} value={v.id}>{v.name} ({v.type})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Trayek / Rute</label>
                  <select
                    value={voyageForm.routeId}
                    onChange={(e) => setVoyageForm({ ...voyageForm, routeId: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100"
                  >
                    {routes.map(r => {
                      const orig = portMap.get(r.originPortId);
                      const dest = portMap.get(r.destinationPortId);
                      return (
                        <option key={r.id} value={r.id}>
                          {r.code} ({orig?.city} &rarr; {dest?.city})
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Jadwal Berangkat (ETD)</label>
                  <input
                    type="datetime-local"
                    value={voyageForm.departureDate}
                    onChange={(e) => setVoyageForm({ ...voyageForm, departureDate: e.target.value })}
                    required
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Estimasi Tiba (ETA)</label>
                  <input
                    type="datetime-local"
                    value={voyageForm.arrivalDate}
                    onChange={(e) => setVoyageForm({ ...voyageForm, arrivalDate: e.target.value })}
                    required
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Nakhoda Kapal (Master Captain)</label>
                <input
                  type="text"
                  value={voyageForm.masterCaptain}
                  onChange={(e) => setVoyageForm({ ...voyageForm, masterCaptain: e.target.value })}
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Muatan (TEU)</label>
                  <input
                    type="number"
                    value={voyageForm.totalLoadedTeu}
                    onChange={(e) => setVoyageForm({ ...voyageForm, totalLoadedTeu: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Muatan (Tonase)</label>
                  <input
                    type="number"
                    value={voyageForm.totalLoadedTons}
                    onChange={(e) => setVoyageForm({ ...voyageForm, totalLoadedTons: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Est. BBM (Liter)</label>
                  <input
                    type="number"
                    value={voyageForm.fuelConsumptionEstLiters}
                    onChange={(e) => setVoyageForm({ ...voyageForm, fuelConsumptionEstLiters: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setOpenVoyageModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-xl text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <span>Simpan Jadwal Voyage</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRINT OFFICIAL BILL OF LADING MODAL */}
      {selectedBLForPrint && (
        <BillOfLadingPrintModal
          bl={selectedBLForPrint}
          voyage={voyages.find(v => v.id === selectedBLForPrint.voyageId)}
          vessel={vessels.find(v => v.id === voyages.find(vy => vy.id === selectedBLForPrint.voyageId)?.vesselId)}
          route={routes.find(r => r.id === voyages.find(vy => vy.id === selectedBLForPrint.voyageId)?.routeId)}
          originPort={ports.find(p => p.id === routes.find(r => r.id === voyages.find(vy => vy.id === selectedBLForPrint.voyageId)?.routeId)?.originPortId)}
          destinationPort={ports.find(p => p.id === routes.find(r => r.id === voyages.find(vy => vy.id === selectedBLForPrint.voyageId)?.routeId)?.destinationPortId)}
          customer={customers.find(c => c.id === selectedBLForPrint.customerId)}
          onClose={() => setSelectedBLForPrint(null)}
        />
      )}
    </div>
  );
};

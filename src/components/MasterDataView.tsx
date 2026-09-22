import React, { useState } from 'react';
import { 
  Ship, Anchor, MapPin, Users, Plus, Edit2, Trash2, Search, 
  Filter, Check, X, AlertCircle, RefreshCw 
} from 'lucide-react';
import { api } from '../services/api.ts';
import type { Vessel, Port, Route, Customer, VesselType, VesselStatus, CustomerCategory } from '../types.ts';

interface MasterDataViewProps {
  vessels: Vessel[];
  ports: Port[];
  routes: Route[];
  customers: Customer[];
  onRefreshData: () => Promise<void>;
  userRole: string;
}

export const MasterDataView: React.FC<MasterDataViewProps> = ({
  vessels,
  ports,
  routes,
  customers,
  onRefreshData,
  userRole,
}) => {
  const [activeTab, setActiveTab] = useState<'vessels' | 'ports' | 'routes' | 'customers'>('vessels');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal State
  const [modalType, setModalType] = useState<'create' | 'edit' | null>(null);
  const [targetItem, setTargetItem] = useState<any>(null);

  // Delete Confirm State
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form States for Vessel
  const [vesselForm, setVesselForm] = useState({
    code: '',
    name: '',
    type: 'Container' as VesselType,
    callSign: '',
    imoNumber: '',
    capacityDWT: 10000,
    capacityTEU: 500,
    yearBuilt: 2020,
    flag: 'Indonesia',
    currentPortId: ports[0]?.id || '',
    status: 'Aktif' as VesselStatus,
    speedKnots: 14,
    notes: '',
  });

  // Form States for Port
  const [portForm, setPortForm] = useState({
    code: '',
    name: '',
    city: '',
    province: '',
    wharfLengthMeters: 2000,
    maxDraftMeters: 12,
    operationalHours: '24 Jam Nonstop',
    contactPhone: '',
    status: 'Aktif' as 'Aktif' | 'Pemeliharaan',
    lat: -6.1,
    lng: 106.8,
  });

  // Form States for Route
  const [routeForm, setRouteForm] = useState({
    code: '',
    originPortId: ports[0]?.id || '',
    destinationPortId: ports[1]?.id || '',
    distanceNm: 400,
    estimatedDurationHours: 36,
    baseRatePerTeu: 5000000,
    baseRatePerTon: 250000,
    status: 'Aktif' as 'Aktif' | 'Nonaktif',
  });

  // Form States for Customer
  const [customerForm, setCustomerForm] = useState({
    code: '',
    name: '',
    category: 'B2B Manufaktur' as CustomerCategory,
    picName: '',
    phone: '',
    email: '',
    address: '',
    npwp: '',
    status: 'Aktif' as 'Aktif' | 'Nonaktif',
  });

  // Open Create Modal
  const openCreateModal = () => {
    setModalType('create');
    setTargetItem(null);
    if (activeTab === 'vessels') {
      setVesselForm({
        code: `VSL-${Date.now().toString().slice(-4)}`,
        name: '',
        type: 'Container',
        callSign: 'PK-X',
        imoNumber: '9' + Math.floor(100000 + Math.random() * 900000),
        capacityDWT: 12000,
        capacityTEU: 600,
        yearBuilt: 2021,
        flag: 'Indonesia',
        currentPortId: ports[0]?.id || '',
        status: 'Aktif',
        speedKnots: 14.5,
        notes: '',
      });
    } else if (activeTab === 'ports') {
      setPortForm({
        code: 'ID' + Math.random().toString(36).substring(2, 5).toUpperCase(),
        name: '',
        city: '',
        province: '',
        wharfLengthMeters: 2500,
        maxDraftMeters: 13,
        operationalHours: '24 Jam Nonstop',
        contactPhone: '+62 21-',
        status: 'Aktif',
        lat: -6.1,
        lng: 106.8,
      });
    } else if (activeTab === 'routes') {
      setRouteForm({
        code: `R-TRK-${Math.floor(10 + Math.random() * 90)}`,
        originPortId: ports[0]?.id || '',
        destinationPortId: ports[1]?.id || '',
        distanceNm: 450,
        estimatedDurationHours: 40,
        baseRatePerTeu: 6000000,
        baseRatePerTon: 300000,
        status: 'Aktif',
      });
    } else if (activeTab === 'customers') {
      setCustomerForm({
        code: `CST-${Math.floor(100 + Math.random() * 900)}`,
        name: '',
        category: 'B2B Manufaktur',
        picName: '',
        phone: '+62 ',
        email: '',
        address: '',
        npwp: '01.000.000.0-000.000',
        status: 'Aktif',
      });
    }
  };

  // Open Edit Modal
  const openEditModal = (item: any) => {
    setModalType('edit');
    setTargetItem(item);
    if (activeTab === 'vessels') {
      setVesselForm({
        code: item.code,
        name: item.name,
        type: item.type,
        callSign: item.callSign,
        imoNumber: item.imoNumber,
        capacityDWT: item.capacityDWT,
        capacityTEU: item.capacityTEU,
        yearBuilt: item.yearBuilt,
        flag: item.flag,
        currentPortId: item.currentPortId,
        status: item.status,
        speedKnots: item.speedKnots,
        notes: item.notes || '',
      });
    } else if (activeTab === 'ports') {
      setPortForm({
        code: item.code,
        name: item.name,
        city: item.city,
        province: item.province,
        wharfLengthMeters: item.wharfLengthMeters,
        maxDraftMeters: item.maxDraftMeters,
        operationalHours: item.operationalHours,
        contactPhone: item.contactPhone,
        status: item.status,
        lat: item.coordinates?.lat || 0,
        lng: item.coordinates?.lng || 0,
      });
    } else if (activeTab === 'routes') {
      setRouteForm({
        code: item.code,
        originPortId: item.originPortId,
        destinationPortId: item.destinationPortId,
        distanceNm: item.distanceNm,
        estimatedDurationHours: item.estimatedDurationHours,
        baseRatePerTeu: item.baseRatePerTeu,
        baseRatePerTon: item.baseRatePerTon,
        status: item.status,
      });
    } else if (activeTab === 'customers') {
      setCustomerForm({
        code: item.code,
        name: item.name,
        category: item.category,
        picName: item.picName,
        phone: item.phone,
        email: item.email,
        address: item.address,
        npwp: item.npwp,
        status: item.status,
      });
    }
  };

  // Submit Form handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (activeTab === 'vessels') {
        if (modalType === 'create') {
          await api.createVessel(vesselForm);
        } else if (modalType === 'edit' && targetItem) {
          await api.updateVessel(targetItem.id, vesselForm);
        }
      } else if (activeTab === 'ports') {
        const payload = {
          code: portForm.code,
          name: portForm.name,
          city: portForm.city,
          province: portForm.province,
          wharfLengthMeters: portForm.wharfLengthMeters,
          maxDraftMeters: portForm.maxDraftMeters,
          operationalHours: portForm.operationalHours,
          contactPhone: portForm.contactPhone,
          status: portForm.status,
          coordinates: { lat: portForm.lat, lng: portForm.lng }
        };
        if (modalType === 'create') {
          await api.createPort(payload);
        } else if (modalType === 'edit' && targetItem) {
          await api.updatePort(targetItem.id, payload);
        }
      } else if (activeTab === 'routes') {
        if (modalType === 'create') {
          await api.createRoute(routeForm);
        } else if (modalType === 'edit' && targetItem) {
          await api.updateRoute(targetItem.id, routeForm);
        }
      } else if (activeTab === 'customers') {
        if (modalType === 'create') {
          await api.createCustomer(customerForm);
        } else if (modalType === 'edit' && targetItem) {
          await api.updateCustomer(targetItem.id, customerForm);
        }
      }

      await onRefreshData();
      setModalType(null);
      setTargetItem(null);
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan data');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Action Handler
  const handleDelete = async (id: string) => {
    setIsSubmitting(true);
    try {
      if (activeTab === 'vessels') {
        await api.deleteVessel(id);
      } else if (activeTab === 'ports') {
        await api.deletePort(id);
      } else if (activeTab === 'routes') {
        await api.deleteRoute(id);
      } else if (activeTab === 'customers') {
        await api.deleteCustomer(id);
      }
      await onRefreshData();
      setDeleteConfirmId(null);
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus data');
    } finally {
      setIsSubmitting(false);
    }
  };

  const portMap = new Map<string, Port>(ports.map(p => [p.id, p]));

  return (
    <div id="master-data-view" className="space-y-6 animate-fade-in">
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Anchor className="w-5 h-5 text-cyan-400" />
            Manajemen Master Data Operasional
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Kelola data fundamental armada kapal, dermaga pelabuhan, rute pelayaran dan pelanggan shipper.
          </p>
        </div>

        <button
          id="btn-add-master-item"
          onClick={openCreateModal}
          className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition shadow-md shadow-cyan-950"
        >
          <Plus className="w-4 h-4" />
          <span>
            Tambah {activeTab === 'vessels' ? 'Kapal Baru' : activeTab === 'ports' ? 'Pelabuhan Baru' : activeTab === 'routes' ? 'Rute Baru' : 'Pelanggan Baru'}
          </span>
        </button>
      </div>

      {/* Tabs Switcher */}
      <div className="flex border-b border-slate-800 gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => { setActiveTab('vessels'); setSearchTerm(''); }}
          className={`px-4 py-2.5 rounded-t-xl text-xs font-semibold flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
            activeTab === 'vessels'
              ? 'border-cyan-400 text-cyan-300 bg-slate-900/90'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Ship className="w-4 h-4" />
          <span>Armada Kapal ({vessels.length})</span>
        </button>

        <button
          onClick={() => { setActiveTab('ports'); setSearchTerm(''); }}
          className={`px-4 py-2.5 rounded-t-xl text-xs font-semibold flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
            activeTab === 'ports'
              ? 'border-cyan-400 text-cyan-300 bg-slate-900/90'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Anchor className="w-4 h-4" />
          <span>Pelabuhan & Terminal ({ports.length})</span>
        </button>

        <button
          onClick={() => { setActiveTab('routes'); setSearchTerm(''); }}
          className={`px-4 py-2.5 rounded-t-xl text-xs font-semibold flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
            activeTab === 'routes'
              ? 'border-cyan-400 text-cyan-300 bg-slate-900/90'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Rute Pelayaran ({routes.length})</span>
        </button>

        <button
          onClick={() => { setActiveTab('customers'); setSearchTerm(''); }}
          className={`px-4 py-2.5 rounded-t-xl text-xs font-semibold flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
            activeTab === 'customers'
              ? 'border-cyan-400 text-cyan-300 bg-slate-900/90'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Pelanggan & Shippers ({customers.length})</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={`Cari dalam data ${activeTab}...`}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* TAB CONTENT: 1. VESSELS (ARMADA KAPAL) */}
      {activeTab === 'vessels' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold text-[11px]">
                <tr>
                  <th className="px-4 py-3">Kode & Nama Kapal</th>
                  <th className="px-4 py-3">Tipe Kapal</th>
                  <th className="px-4 py-3">Call Sign / IMO</th>
                  <th className="px-4 py-3">Kapasitas (DWT/TEU)</th>
                  <th className="px-4 py-3">Tahun & Kecepatan</th>
                  <th className="px-4 py-3">Lokasi Pelabuhan</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {vessels
                  .filter(v => 
                    v.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                    v.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    v.type.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((v) => {
                    const port = portMap.get(v.currentPortId);
                    return (
                      <tr key={v.id} className="hover:bg-slate-850/60 transition">
                        <td className="px-4 py-3">
                          <div className="text-white font-bold flex items-center gap-1.5">
                            <Ship className="w-4 h-4 text-cyan-400 shrink-0" />
                            <span>{v.name}</span>
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">{v.code}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
                            {v.type}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono text-[11px]">
                          <div>{v.callSign}</div>
                          <div className="text-slate-500 text-[10px]">IMO: {v.imoNumber}</div>
                        </td>
                        <td className="px-4 py-3 font-mono">
                          <div className="text-slate-200">{v.capacityDWT.toLocaleString()} DWT</div>
                          <div className="text-cyan-400 text-[10px]">{v.capacityTEU > 0 ? `${v.capacityTEU} TEUs` : '-'}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div>Th. {v.yearBuilt}</div>
                          <div className="text-slate-500 text-[10px]">{v.speedKnots} Knot</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-slate-200">{port?.city || 'Pelabuhan Asal'}</div>
                          <div className="text-[10px] text-slate-500">{port?.name}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                            v.status === 'Aktif'
                              ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                              : v.status === 'Dalam Pelayaran'
                              ? 'bg-blue-950 text-blue-300 border-blue-800'
                              : v.status === 'Bongkar Muat'
                              ? 'bg-amber-950 text-amber-300 border-amber-800'
                              : 'bg-rose-950 text-rose-300 border-rose-800'
                          }`}>
                            {v.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          {deleteConfirmId === v.id ? (
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => handleDelete(v.id)}
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
                                onClick={() => openEditModal(v)}
                                className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-cyan-300 rounded transition"
                                title="Edit Data Kapal"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setDeleteConfirmId(v.id)}
                                className="p-1.5 hover:bg-rose-950/50 text-slate-400 hover:text-rose-400 rounded transition"
                                title="Hapus Data Kapal"
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

      {/* TAB CONTENT: 2. PORTS (PELABUHAN) */}
      {activeTab === 'ports' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold text-[11px]">
                <tr>
                  <th className="px-4 py-3">Kode Pelabuhan</th>
                  <th className="px-4 py-3">Nama Pelabuhan</th>
                  <th className="px-4 py-3">Kota & Provinsi</th>
                  <th className="px-4 py-3">Panjang Dermaga</th>
                  <th className="px-4 py-3">Kedalaman (Draft)</th>
                  <th className="px-4 py-3">Operasional & Kontak</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {ports
                  .filter(p => 
                    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                    p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    p.city.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((p) => (
                    <tr key={p.id} className="hover:bg-slate-850/60 transition">
                      <td className="px-4 py-3 font-mono font-bold text-cyan-400">
                        {p.code}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-white font-semibold">{p.name}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div>{p.city}</div>
                        <div className="text-[10px] text-slate-500">{p.province}</div>
                      </td>
                      <td className="px-4 py-3 font-mono">
                        {p.wharfLengthMeters} Meter
                      </td>
                      <td className="px-4 py-3 font-mono text-cyan-300">
                        {p.maxDraftMeters} Meter
                      </td>
                      <td className="px-4 py-3">
                        <div>{p.operationalHours}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{p.contactPhone}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800">
                          {p.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        {deleteConfirmId === p.id ? (
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleDelete(p.id)}
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
                              onClick={() => openEditModal(p)}
                              className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-cyan-300 rounded transition"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(p.id)}
                              className="p-1.5 hover:bg-rose-950/50 text-slate-400 hover:text-rose-400 rounded transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT: 3. ROUTES (RUTE PELAYARAN) */}
      {activeTab === 'routes' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold text-[11px]">
                <tr>
                  <th className="px-4 py-3">Kode Rute</th>
                  <th className="px-4 py-3">Pelabuhan Asal</th>
                  <th className="px-4 py-3">Pelabuhan Tujuan</th>
                  <th className="px-4 py-3">Jarak Tempuh</th>
                  <th className="px-4 py-3">Estimasi Durasi</th>
                  <th className="px-4 py-3">Tarif Dasar Peti Kemas</th>
                  <th className="px-4 py-3">Tarif Dasar Kargo Curah</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {routes
                  .filter(r => r.code.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map((r) => {
                    const origin = portMap.get(r.originPortId);
                    const dest = portMap.get(r.destinationPortId);
                    return (
                      <tr key={r.id} className="hover:bg-slate-850/60 transition">
                        <td className="px-4 py-3 font-mono font-bold text-cyan-400">
                          {r.code}
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-white font-semibold">{origin?.city || r.originPortId}</div>
                          <div className="text-[10px] text-slate-500">{origin?.name}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-white font-semibold">{dest?.city || r.destinationPortId}</div>
                          <div className="text-[10px] text-slate-500">{dest?.name}</div>
                        </td>
                        <td className="px-4 py-3 font-mono text-cyan-300">
                          {r.distanceNm} NM (Mil Laut)
                        </td>
                        <td className="px-4 py-3">
                          {r.estimatedDurationHours} Jam (~{(r.estimatedDurationHours / 24).toFixed(1)} Hari)
                        </td>
                        <td className="px-4 py-3 font-mono text-emerald-400">
                          Rp {r.baseRatePerTeu.toLocaleString('id-ID')} / TEU
                        </td>
                        <td className="px-4 py-3 font-mono text-slate-200">
                          Rp {r.baseRatePerTon.toLocaleString('id-ID')} / Ton
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800">
                            {r.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          {deleteConfirmId === r.id ? (
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => handleDelete(r.id)}
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
                                onClick={() => openEditModal(r)}
                                className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-cyan-300 rounded transition"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setDeleteConfirmId(r.id)}
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

      {/* TAB CONTENT: 4. CUSTOMERS (PELANGGAN) */}
      {activeTab === 'customers' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold text-[11px]">
                <tr>
                  <th className="px-4 py-3">Kode & Nama Perusahaan</th>
                  <th className="px-4 py-3">Kategori</th>
                  <th className="px-4 py-3">PIC / Penanggung Jawab</th>
                  <th className="px-4 py-3">Kontak & Email</th>
                  <th className="px-4 py-3">Alamat</th>
                  <th className="px-4 py-3">NPWP</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {customers
                  .filter(c => 
                    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                    c.code.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((c) => (
                    <tr key={c.id} className="hover:bg-slate-850/60 transition">
                      <td className="px-4 py-3">
                        <div className="text-white font-bold">{c.name}</div>
                        <div className="text-[10px] text-cyan-400 font-mono">{c.code}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
                          {c.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-200">
                        {c.picName}
                      </td>
                      <td className="px-4 py-3 font-mono">
                        <div>{c.phone}</div>
                        <div className="text-slate-500 text-[10px]">{c.email}</div>
                      </td>
                      <td className="px-4 py-3 text-slate-400 max-w-[200px] truncate">
                        {c.address}
                      </td>
                      <td className="px-4 py-3 font-mono text-[11px] text-slate-400">
                        {c.npwp}
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800">
                          {c.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        {deleteConfirmId === c.id ? (
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleDelete(c.id)}
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
                              onClick={() => openEditModal(c)}
                              className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-cyan-300 rounded transition"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(c.id)}
                              className="p-1.5 hover:bg-rose-950/50 text-slate-400 hover:text-rose-400 rounded transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CRUD MODAL FOR MASTER DATA */}
      {modalType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden text-slate-200">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <h3 className="font-semibold text-white text-base">
                {modalType === 'create' ? 'Tambah Data Baru' : 'Perbarui Data'} - {activeTab.toUpperCase()}
              </h3>
              <button
                onClick={() => setModalType(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* VESSEL FIELDS */}
              {activeTab === 'vessels' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Kode Kapal</label>
                      <input
                        type="text"
                        value={vesselForm.code}
                        onChange={(e) => setVesselForm({ ...vesselForm, code: e.target.value })}
                        required
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Nama Kapal</label>
                      <input
                        type="text"
                        value={vesselForm.name}
                        onChange={(e) => setVesselForm({ ...vesselForm, name: e.target.value })}
                        required
                        placeholder="KM ..."
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Tipe Kapal</label>
                      <select
                        value={vesselForm.type}
                        onChange={(e) => setVesselForm({ ...vesselForm, type: e.target.value as VesselType })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100"
                      >
                        <option value="Container">Container</option>
                        <option value="Bulk Carrier">Bulk Carrier</option>
                        <option value="Tanker">Tanker</option>
                        <option value="LCT">LCT</option>
                        <option value="Tongkang / Barge">Tongkang / Barge</option>
                        <option value="General Cargo">General Cargo</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Status Kapal</label>
                      <select
                        value={vesselForm.status}
                        onChange={(e) => setVesselForm({ ...vesselForm, status: e.target.value as VesselStatus })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100"
                      >
                        <option value="Aktif">Aktif</option>
                        <option value="Dalam Pelayaran">Dalam Pelayaran</option>
                        <option value="Bongkar Muat">Bongkar Muat</option>
                        <option value="Docking / Perbaikan">Docking / Perbaikan</option>
                        <option value="Standby">Standby</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Kapasitas DWT (Ton)</label>
                      <input
                        type="number"
                        value={vesselForm.capacityDWT}
                        onChange={(e) => setVesselForm({ ...vesselForm, capacityDWT: Number(e.target.value) })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Kapasitas TEU</label>
                      <input
                        type="number"
                        value={vesselForm.capacityTEU}
                        onChange={(e) => setVesselForm({ ...vesselForm, capacityTEU: Number(e.target.value) })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Call Sign</label>
                      <input
                        type="text"
                        value={vesselForm.callSign}
                        onChange={(e) => setVesselForm({ ...vesselForm, callSign: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">IMO Number</label>
                      <input
                        type="text"
                        value={vesselForm.imoNumber}
                        onChange={(e) => setVesselForm({ ...vesselForm, imoNumber: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Kecepatan (Knot)</label>
                      <input
                        type="number"
                        value={vesselForm.speedKnots}
                        onChange={(e) => setVesselForm({ ...vesselForm, speedKnots: Number(e.target.value) })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Pelabuhan Pangkalan / Saat Ini</label>
                    <select
                      value={vesselForm.currentPortId}
                      onChange={(e) => setVesselForm({ ...vesselForm, currentPortId: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100"
                    >
                      {ports.map(p => (
                        <option key={p.id} value={p.id}>{p.name} ({p.city})</option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {/* PORT FIELDS */}
              {activeTab === 'ports' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Kode UN/LOCODE</label>
                      <input
                        type="text"
                        value={portForm.code}
                        onChange={(e) => setPortForm({ ...portForm, code: e.target.value })}
                        required
                        placeholder="Contoh: IDJKT"
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Nama Pelabuhan</label>
                      <input
                        type="text"
                        value={portForm.name}
                        onChange={(e) => setPortForm({ ...portForm, name: e.target.value })}
                        required
                        placeholder="Pelabuhan Tanjung ..."
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Kota / Kabupaten</label>
                      <input
                        type="text"
                        value={portForm.city}
                        onChange={(e) => setPortForm({ ...portForm, city: e.target.value })}
                        required
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Provinsi</label>
                      <input
                        type="text"
                        value={portForm.province}
                        onChange={(e) => setPortForm({ ...portForm, province: e.target.value })}
                        required
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Panjang Dermaga (Meter)</label>
                      <input
                        type="number"
                        value={portForm.wharfLengthMeters}
                        onChange={(e) => setPortForm({ ...portForm, wharfLengthMeters: Number(e.target.value) })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Kedalaman Maksimal (Meter Draft)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={portForm.maxDraftMeters}
                        onChange={(e) => setPortForm({ ...portForm, maxDraftMeters: Number(e.target.value) })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Telepon Syahbandar / Otoritas Pelabuhan</label>
                    <input
                      type="text"
                      value={portForm.contactPhone}
                      onChange={(e) => setPortForm({ ...portForm, contactPhone: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100"
                    />
                  </div>
                </>
              )}

              {/* ROUTE FIELDS */}
              {activeTab === 'routes' && (
                <>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Kode Rute Trayek</label>
                    <input
                      type="text"
                      value={routeForm.code}
                      onChange={(e) => setRouteForm({ ...routeForm, code: e.target.value })}
                      required
                      placeholder="Contoh: R-JKT-SBY"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Pelabuhan Asal</label>
                      <select
                        value={routeForm.originPortId}
                        onChange={(e) => setRouteForm({ ...routeForm, originPortId: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100"
                      >
                        {ports.map(p => (
                          <option key={p.id} value={p.id}>{p.name} ({p.city})</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Pelabuhan Tujuan</label>
                      <select
                        value={routeForm.destinationPortId}
                        onChange={(e) => setRouteForm({ ...routeForm, destinationPortId: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100"
                      >
                        {ports.map(p => (
                          <option key={p.id} value={p.id}>{p.name} ({p.city})</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Jarak (Nautical Miles / NM)</label>
                      <input
                        type="number"
                        value={routeForm.distanceNm}
                        onChange={(e) => setRouteForm({ ...routeForm, distanceNm: Number(e.target.value) })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Estimasi Waktu Tempuh (Jam)</label>
                      <input
                        type="number"
                        value={routeForm.estimatedDurationHours}
                        onChange={(e) => setRouteForm({ ...routeForm, estimatedDurationHours: Number(e.target.value) })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Tarif Dasar per TEU (Rp)</label>
                      <input
                        type="number"
                        value={routeForm.baseRatePerTeu}
                        onChange={(e) => setRouteForm({ ...routeForm, baseRatePerTeu: Number(e.target.value) })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Tarif Dasar per Ton (Rp)</label>
                      <input
                        type="number"
                        value={routeForm.baseRatePerTon}
                        onChange={(e) => setRouteForm({ ...routeForm, baseRatePerTon: Number(e.target.value) })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* CUSTOMER FIELDS */}
              {activeTab === 'customers' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Kode Shipper / Klien</label>
                      <input
                        type="text"
                        value={customerForm.code}
                        onChange={(e) => setCustomerForm({ ...customerForm, code: e.target.value })}
                        required
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Kategori Usaha</label>
                      <select
                        value={customerForm.category}
                        onChange={(e) => setCustomerForm({ ...customerForm, category: e.target.value as CustomerCategory })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100"
                      >
                        <option value="B2B Manufaktur">B2B Manufaktur</option>
                        <option value="Agrikultur & Perkebunan">Agrikultur & Perkebunan</option>
                        <option value="Pertambangan">Pertambangan</option>
                        <option value="Ekspedisi / Freight Forwarder">Ekspedisi / Freight Forwarder</option>
                        <option value="Distributor Ritel">Distributor Ritel</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Nama Perusahaan / Shipper</label>
                    <input
                      type="text"
                      value={customerForm.name}
                      onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })}
                      required
                      placeholder="PT ..."
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Nama PIC (Person in Charge)</label>
                      <input
                        type="text"
                        value={customerForm.picName}
                        onChange={(e) => setCustomerForm({ ...customerForm, picName: e.target.value })}
                        required
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Nomor Telepon / WhatsApp</label>
                      <input
                        type="text"
                        value={customerForm.phone}
                        onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
                        required
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Email Korespondensi</label>
                    <input
                      type="email"
                      value={customerForm.email}
                      onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Alamat Kantor / Pabrik</label>
                    <textarea
                      rows={2}
                      value={customerForm.address}
                      onChange={(e) => setCustomerForm({ ...customerForm, address: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1">NPWP Badan Usaha</label>
                    <input
                      type="text"
                      value={customerForm.npwp}
                      onChange={(e) => setCustomerForm({ ...customerForm, npwp: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono"
                    />
                  </div>
                </>
              )}

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
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
                    <span>Simpan ke Database</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { 
  BarChart3, TrendingUp, Ship, Download, Printer, Filter, 
  Calendar, CheckCircle2, DollarSign, Package, MapPin, Fuel
} from 'lucide-react';
import type { Voyage, BillOfLading, Vessel, Port, Route, Customer } from '../types.ts';

interface ReportsViewProps {
  voyages: Voyage[];
  billsOfLading: BillOfLading[];
  vessels: Vessel[];
  ports: Port[];
  routes: Route[];
  customers: Customer[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  voyages,
  billsOfLading,
  vessels,
  ports,
  routes,
  customers,
}) => {
  const [reportType, setReportType] = useState<'financial' | 'fleet' | 'cargo' | 'routes'>('financial');
  const [statusFilter, setStatusFilter] = useState('all');

  const vesselMap = new Map<string, Vessel>(vessels.map(v => [v.id, v]));
  const portMap = new Map<string, Port>(ports.map(p => [p.id, p]));
  const routeMap = new Map<string, Route>(routes.map(r => [r.id, r]));
  const customerMap = new Map<string, Customer>(customers.map(c => [c.id, c]));

  // Calculations
  const totalRevenue = billsOfLading.reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);
  const totalFreight = billsOfLading.reduce((acc, curr) => acc + (curr.freightRate || 0), 0);
  const totalHandling = billsOfLading.reduce((acc, curr) => acc + (curr.handlingFee || 0), 0);
  const totalInsurance = billsOfLading.reduce((acc, curr) => acc + (curr.insuranceFee || 0), 0);
  const totalTax = billsOfLading.reduce((acc, curr) => acc + (curr.taxAmount || 0), 0);

  const totalPaidRevenue = billsOfLading
    .filter(b => b.paymentStatus === 'Lunas')
    .reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);

  const totalOutstanding = billsOfLading
    .filter(b => b.paymentStatus !== 'Lunas')
    .reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);

  const totalTonnage = billsOfLading.reduce((acc, curr) => acc + (curr.grossWeightTons || 0), 0);
  const totalContainers = billsOfLading.reduce((acc, curr) => acc + (curr.containerCount || 0), 0);

  const formatIDR = (num: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);
  };

  // Export to CSV
  const handleExportCSV = () => {
    let headers: string[] = [];
    let rows: string[][] = [];
    let filename = `laporan-angkutan-laut-${Date.now()}.csv`;

    if (reportType === 'financial') {
      headers = ['Nomor BL', 'Shipper', 'Penerima', 'Ongkos Angkut (Rp)', 'Handling (Rp)', 'Asuransi (Rp)', 'PPN (Rp)', 'Total (Rp)', 'Status Pembayaran'];
      rows = billsOfLading.map(b => [
        b.blNumber,
        `"${customerMap.get(b.customerId)?.name || ''}"`,
        `"${b.consigneeName}"`,
        b.freightRate.toString(),
        b.handlingFee.toString(),
        b.insuranceFee.toString(),
        b.taxAmount.toString(),
        b.totalAmount.toString(),
        b.paymentStatus,
      ]);
    } else if (reportType === 'fleet') {
      headers = ['Kode Kapal', 'Nama Kapal', 'Tipe', 'Kapasitas DWT', 'Kapasitas TEU', 'Tahun', 'Status'];
      rows = vessels.map(v => [
        v.code,
        `"${v.name}"`,
        v.type,
        v.capacityDWT.toString(),
        v.capacityTEU.toString(),
        v.yearBuilt.toString(),
        v.status,
      ]);
    } else if (reportType === 'cargo') {
      headers = ['Nomor BL', 'Kategori Kargo', 'Deskripsi', 'Tonase (Ton)', 'TEU', 'Volume (CBM)', 'Status Muatan'];
      rows = billsOfLading.map(b => [
        b.blNumber,
        `"${b.cargoCategory}"`,
        `"${b.cargoDescription}"`,
        b.grossWeightTons.toString(),
        b.containerCount.toString(),
        b.volumeCbm.toString(),
        b.cargoStatus,
      ]);
    } else {
      headers = ['Nomor Voyage', 'Kapal', 'Rute', 'Jarak (NM)', 'Berangkat', 'Tiba', 'Status'];
      rows = voyages.map(v => {
        const vsl = vesselMap.get(v.vesselId);
        const rt = routeMap.get(v.routeId);
        return [
          v.voyageNumber,
          `"${vsl?.name || ''}"`,
          `"${rt?.code || ''}"`,
          (rt?.distanceNm || 0).toString(),
          v.departureDate,
          v.arrivalDate,
          v.status,
        ];
      });
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="reports-view-content" className="space-y-6 animate-fade-in">
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            Laporan Operasional & Keuangan Maritim
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Analitik pendapatan ongkos angkut (freight), efisiensi kapasitas armada kapal, dan rekapitulasi volume manifes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-2 transition"
          >
            <Printer className="w-4 h-4 text-cyan-400" />
            <span>Cetak Laporan</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition shadow-md shadow-emerald-950"
          >
            <Download className="w-4 h-4" />
            <span>Ekspor Data CSV</span>
          </button>
        </div>
      </div>

      {/* Report Selection Tabs */}
      <div className="flex border-b border-slate-800 gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setReportType('financial')}
          className={`px-4 py-2.5 rounded-t-xl text-xs font-semibold flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
            reportType === 'financial'
              ? 'border-cyan-400 text-cyan-300 bg-slate-900/90'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Laporan Finansial & Omset</span>
        </button>

        <button
          onClick={() => setReportType('fleet')}
          className={`px-4 py-2.5 rounded-t-xl text-xs font-semibold flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
            reportType === 'fleet'
              ? 'border-cyan-400 text-cyan-300 bg-slate-900/90'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Ship className="w-4 h-4" />
          <span>Utilitas & Efisiensi Armada</span>
        </button>

        <button
          onClick={() => setReportType('cargo')}
          className={`px-4 py-2.5 rounded-t-xl text-xs font-semibold flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
            reportType === 'cargo'
              ? 'border-cyan-400 text-cyan-300 bg-slate-900/90'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Manifes & Muatan Kargo</span>
        </button>

        <button
          onClick={() => setReportType('routes')}
          className={`px-4 py-2.5 rounded-t-xl text-xs font-semibold flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
            reportType === 'routes'
              ? 'border-cyan-400 text-cyan-300 bg-slate-900/90'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Trafik Trayek & Pelayaran</span>
        </button>
      </div>

      {/* REPORT TYPE 1: FINANCIAL & REVENUE */}
      {reportType === 'financial' && (
        <div className="space-y-6">
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
              <span className="text-xs text-slate-400">Total Pendapatan Kotor</span>
              <div className="text-lg font-bold text-white mt-1">{formatIDR(totalRevenue)}</div>
              <div className="text-[11px] text-slate-500 mt-1">Akumulasi seluruh B/L</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
              <span className="text-xs text-slate-400">Pendapatan Diterima (Lunas)</span>
              <div className="text-lg font-bold text-emerald-400 mt-1">{formatIDR(totalPaidRevenue)}</div>
              <div className="text-[11px] text-emerald-500/80 mt-1">
                {totalRevenue > 0 ? `${((totalPaidRevenue / totalRevenue) * 100).toFixed(1)}% terbayar` : '0%'}
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
              <span className="text-xs text-slate-400">Piutang Belum Terbayar</span>
              <div className="text-lg font-bold text-amber-400 mt-1">{formatIDR(totalOutstanding)}</div>
              <div className="text-[11px] text-amber-500/80 mt-1">Menunggu pelunasan shipper</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
              <span className="text-xs text-slate-400">Setoran Pajak PPN (11%)</span>
              <div className="text-lg font-bold text-cyan-400 mt-1">{formatIDR(totalTax)}</div>
              <div className="text-[11px] text-slate-500 mt-1">Kewajiban perpajakan negara</div>
            </div>
          </div>

          {/* Table Breakdown */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/50">
              <h3 className="font-semibold text-white text-sm">
                Rincian Tagihan & Penerimaan Freight per Surat Muatan
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold text-[11px]">
                  <tr>
                    <th className="px-4 py-3">No. B/L</th>
                    <th className="px-4 py-3">Shipper / Pelanggan</th>
                    <th className="px-4 py-3">Tarif Laut (Freight)</th>
                    <th className="px-4 py-3">Handling (THC)</th>
                    <th className="px-4 py-3">Asuransi</th>
                    <th className="px-4 py-3">PPN 11%</th>
                    <th className="px-4 py-3">Total Tagihan</th>
                    <th className="px-4 py-3 text-right">Status Bayar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {billsOfLading.map(b => (
                    <tr key={b.id} className="hover:bg-slate-850/60 transition">
                      <td className="px-4 py-3 font-mono font-bold text-cyan-400">
                        {b.blNumber}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-white font-semibold">{customerMap.get(b.customerId)?.name || 'Shipper'}</div>
                        <div className="text-[10px] text-slate-500">{b.cargoCategory}</div>
                      </td>
                      <td className="px-4 py-3 font-mono">{formatIDR(b.freightRate)}</td>
                      <td className="px-4 py-3 font-mono">{formatIDR(b.handlingFee)}</td>
                      <td className="px-4 py-3 font-mono">{formatIDR(b.insuranceFee)}</td>
                      <td className="px-4 py-3 font-mono">{formatIDR(b.taxAmount)}</td>
                      <td className="px-4 py-3 font-mono font-bold text-emerald-400">{formatIDR(b.totalAmount)}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                          b.paymentStatus === 'Lunas'
                            ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                            : 'bg-amber-950 text-amber-300 border-amber-800'
                        }`}>
                          {b.paymentStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* REPORT TYPE 2: FLEET UTILIZATION */}
      {reportType === 'fleet' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
              <span className="text-xs text-slate-400">Total Daya Angkut Armada</span>
              <div className="text-lg font-bold text-white mt-1">
                {vessels.reduce((acc, v) => acc + v.capacityDWT, 0).toLocaleString()} DWT
              </div>
              <div className="text-[11px] text-slate-500 mt-1">Total kapasitas tonase seluruh armada</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
              <span className="text-xs text-slate-400">Kapasitas Slot Kontainer</span>
              <div className="text-lg font-bold text-cyan-400 mt-1">
                {vessels.reduce((acc, v) => acc + v.capacityTEU, 0).toLocaleString()} TEU
              </div>
              <div className="text-[11px] text-slate-500 mt-1">Slot kontainer peti kemas</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
              <span className="text-xs text-slate-400">Armada Siap Berlayar (Ready)</span>
              <div className="text-lg font-bold text-emerald-400 mt-1">
                {vessels.filter(v => v.status === 'Aktif' || v.status === 'Dalam Pelayaran').length} / {vessels.length} Kapal
              </div>
              <div className="text-[11px] text-slate-500 mt-1">Tingkat kesiapan operasional kapal</div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/50">
              <h3 className="font-semibold text-white text-sm">
                Status Kesiapan & Spesifikasi Teknis Kapal
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold text-[11px]">
                  <tr>
                    <th className="px-4 py-3">Nama Kapal & Kode</th>
                    <th className="px-4 py-3">Tipe Armada</th>
                    <th className="px-4 py-3">Kapasitas DWT</th>
                    <th className="px-4 py-3">Kapasitas TEU</th>
                    <th className="px-4 py-3">Tahun & Kecepatan</th>
                    <th className="px-4 py-3">Home Port</th>
                    <th className="px-4 py-3 text-right">Status Operasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {vessels.map(v => (
                    <tr key={v.id} className="hover:bg-slate-850/60 transition">
                      <td className="px-4 py-3">
                        <div className="text-white font-bold">{v.name}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{v.code} &bull; IMO: {v.imoNumber}</div>
                      </td>
                      <td className="px-4 py-3 text-slate-200">{v.type}</td>
                      <td className="px-4 py-3 font-mono">{v.capacityDWT.toLocaleString()} Ton</td>
                      <td className="px-4 py-3 font-mono text-cyan-300">{v.capacityTEU > 0 ? `${v.capacityTEU} TEU` : '-'}</td>
                      <td className="px-4 py-3">{v.yearBuilt} ({v.speedKnots} Knot)</td>
                      <td className="px-4 py-3">{portMap.get(v.currentPortId)?.city || '-'}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                          v.status === 'Aktif'
                            ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                            : v.status === 'Dalam Pelayaran'
                            ? 'bg-blue-950 text-blue-300 border-blue-800'
                            : 'bg-rose-950 text-rose-300 border-rose-800'
                        }`}>
                          {v.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* REPORT TYPE 3: CARGO MANIFEST */}
      {reportType === 'cargo' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
              <span className="text-xs text-slate-400">Total Tonase Kargo</span>
              <div className="text-lg font-bold text-white mt-1">
                {totalTonnage.toLocaleString('id-ID')} Ton
              </div>
              <div className="text-[11px] text-slate-500 mt-1">Kargo terangkut di laut</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
              <span className="text-xs text-slate-400">Volume Peti Kemas</span>
              <div className="text-lg font-bold text-cyan-400 mt-1">
                {totalContainers} TEUs
              </div>
              <div className="text-[11px] text-slate-500 mt-1">Total kontainer 20ft & 40ft</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
              <span className="text-xs text-slate-400">Volume Kubikasi (CBM)</span>
              <div className="text-lg font-bold text-purple-400 mt-1">
                {billsOfLading.reduce((acc, b) => acc + (b.volumeCbm || 0), 0).toLocaleString()} CBM
              </div>
              <div className="text-[11px] text-slate-500 mt-1">Total kubikasi ruang palka</div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/50">
              <h3 className="font-semibold text-white text-sm">
                Manifes Lengkap Kargo Berdasarkan Bill of Lading
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold text-[11px]">
                  <tr>
                    <th className="px-4 py-3">No. B/L</th>
                    <th className="px-4 py-3">Kategori Kargo</th>
                    <th className="px-4 py-3">Deskripsi Muatan</th>
                    <th className="px-4 py-3">Jumlah (TEU)</th>
                    <th className="px-4 py-3">Tonase</th>
                    <th className="px-4 py-3">Kubikasi</th>
                    <th className="px-4 py-3 text-right">Status Kargo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {billsOfLading.map(b => (
                    <tr key={b.id} className="hover:bg-slate-850/60 transition">
                      <td className="px-4 py-3 font-mono font-bold text-cyan-400">
                        {b.blNumber}
                      </td>
                      <td className="px-4 py-3 text-white">{b.cargoCategory}</td>
                      <td className="px-4 py-3 text-slate-300">{b.cargoDescription}</td>
                      <td className="px-4 py-3 font-mono">{b.containerCount > 0 ? `${b.containerCount} TEU` : '-'}</td>
                      <td className="px-4 py-3 font-mono font-bold text-slate-200">{b.grossWeightTons.toLocaleString()} Ton</td>
                      <td className="px-4 py-3 font-mono">{b.volumeCbm.toLocaleString()} CBM</td>
                      <td className="px-4 py-3 text-right">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-200 border border-slate-700">
                          {b.cargoStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* REPORT TYPE 4: ROUTE TRAFFIC */}
      {reportType === 'routes' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/50">
              <h3 className="font-semibold text-white text-sm">
                Rekapitulasi Pelayaran & Kepadatan Trayek Maritim
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold text-[11px]">
                  <tr>
                    <th className="px-4 py-3">Kode Trayek</th>
                    <th className="px-4 py-3">Pelabuhan Asal &rarr; Tujuan</th>
                    <th className="px-4 py-3">Jarak Tempuh</th>
                    <th className="px-4 py-3">Jumlah Pelayaran Terjadwal</th>
                    <th className="px-4 py-3">Estimasi Konsumsi BBM</th>
                    <th className="px-4 py-3 text-right">Status Trayek</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {routes.map(r => {
                    const orig = portMap.get(r.originPortId);
                    const dest = portMap.get(r.destinationPortId);
                    const routeVoyages = voyages.filter(v => v.routeId === r.id);
                    const totalFuel = routeVoyages.reduce((acc, v) => acc + (v.fuelConsumptionEstLiters || 0), 0);

                    return (
                      <tr key={r.id} className="hover:bg-slate-850/60 transition">
                        <td className="px-4 py-3 font-mono font-bold text-cyan-400">
                          {r.code}
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-white font-semibold">{orig?.city} &rarr; {dest?.city}</div>
                          <div className="text-[10px] text-slate-500">{orig?.name} ke {dest?.name}</div>
                        </td>
                        <td className="px-4 py-3 font-mono text-cyan-300">
                          {r.distanceNm} Mil Laut (NM)
                        </td>
                        <td className="px-4 py-3 font-mono">
                          {routeVoyages.length} Pelayaran
                        </td>
                        <td className="px-4 py-3 font-mono text-slate-300">
                          {totalFuel.toLocaleString()} Liter
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800">
                            {r.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

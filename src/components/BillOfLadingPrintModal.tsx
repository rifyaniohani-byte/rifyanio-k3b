import React from 'react';
import { Printer, X, Ship, Anchor, CheckCircle2, ShieldCheck, FileCheck } from 'lucide-react';
import type { BillOfLading, Voyage, Vessel, Port, Route, Customer } from '../types.ts';

interface BillOfLadingPrintModalProps {
  bl: BillOfLading | null;
  voyage?: Voyage;
  vessel?: Vessel;
  route?: Route;
  originPort?: Port;
  destinationPort?: Port;
  customer?: Customer;
  onClose: () => void;
}

export const BillOfLadingPrintModal: React.FC<BillOfLadingPrintModalProps> = ({
  bl,
  voyage,
  vessel,
  route,
  originPort,
  destinationPort,
  customer,
  onClose,
}) => {
  if (!bl) return null;

  const handlePrint = () => {
    window.print();
  };

  const formatIDR = (num: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <div className="bg-white text-slate-900 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden my-8 border border-slate-300 print:m-0 print:border-none print:shadow-none">
        {/* Modal Action Bar (hidden in print) */}
        <div className="px-6 py-3 bg-slate-900 text-white flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-semibold">Pratinjau Dokumen Resmi Bill of Lading (B/L)</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak / Simpan PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Bill of Lading Body */}
        <div className="p-8 font-sans text-xs border-b border-slate-200 print:p-4">
          {/* Header */}
          <div className="border-b-2 border-slate-900 pb-4 mb-4 flex justify-between items-start">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 bg-slate-900 text-cyan-400 rounded-lg flex items-center justify-center font-bold">
                <Ship className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                  PT SAMUDERA LOGISTIK NUSANTARA
                </h1>
                <p className="text-[11px] text-slate-600">
                  Jasa Angkutan Laut & Pelayaran Niaga Antar-Pulau Terintegrasi
                </p>
                <p className="text-[10px] text-slate-500">
                  Gedung Maritim Lantai 8, Pelabuhan Tanjung Priok, Jakarta Utara | Telp: (021) 4301-8899
                </p>
              </div>
            </div>

            <div className="text-right">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                SURAT MUATAN LAUT
              </div>
              <div className="text-base font-extrabold font-mono text-cyan-800">
                {bl.blNumber}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                Tanggal Terbit: {new Date(bl.bookingDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}
              </div>
            </div>
          </div>

          {/* Parties Matrix (Shipper & Consignee) */}
          <div className="grid grid-cols-2 border border-slate-400 mb-4 divide-x divide-slate-400">
            <div className="p-3">
              <div className="text-[10px] font-bold uppercase text-slate-500 mb-1">
                PENGIRIM (SHIPPER):
              </div>
              <div className="font-bold text-slate-900 text-sm">{customer?.name || 'Shipper'}</div>
              <div className="text-slate-600 mt-1">{customer?.address}</div>
              <div className="text-slate-600 font-mono mt-0.5">NPWP: {customer?.npwp}</div>
              <div className="text-slate-600 mt-0.5">Kontak: {customer?.picName} ({customer?.phone})</div>
            </div>

            <div className="p-3">
              <div className="text-[10px] font-bold uppercase text-slate-500 mb-1">
                PENERIMA (CONSIGNEE):
              </div>
              <div className="font-bold text-slate-900 text-sm">{bl.consigneeName}</div>
              <div className="text-slate-600 mt-1">{bl.consigneeAddress}</div>
              <div className="text-slate-600 mt-0.5">Telepon: {bl.consigneePhone}</div>
              <div className="text-slate-500 text-[10px] italic mt-1">Notify Party: Sama dengan Penerima</div>
            </div>
          </div>

          {/* Voyage & Vessel Details */}
          <div className="grid grid-cols-4 border border-slate-400 mb-4 divide-x divide-slate-400 text-center text-[11px]">
            <div className="p-2">
              <div className="text-[9px] font-bold uppercase text-slate-500">ARMADA KAPAL</div>
              <div className="font-bold text-slate-900">{vessel?.name || 'KM Armada'}</div>
              <div className="text-[9px] text-slate-500">IMO: {vessel?.imoNumber}</div>
            </div>
            <div className="p-2">
              <div className="text-[9px] font-bold uppercase text-slate-500">NOMOR VOYAGE</div>
              <div className="font-bold text-slate-900 font-mono">{voyage?.voyageNumber || '-'}</div>
              <div className="text-[9px] text-slate-500">Nakhoda: {voyage?.masterCaptain}</div>
            </div>
            <div className="p-2">
              <div className="text-[9px] font-bold uppercase text-slate-500">PELABUHAN MUAT</div>
              <div className="font-bold text-slate-900">{originPort?.name || 'Asal'}</div>
              <div className="text-[9px] text-slate-500">{originPort?.city} ({originPort?.code})</div>
            </div>
            <div className="p-2">
              <div className="text-[9px] font-bold uppercase text-slate-500">PELABUHAN BONGKAR</div>
              <div className="font-bold text-slate-900">{destinationPort?.name || 'Tujuan'}</div>
              <div className="text-[9px] text-slate-500">{destinationPort?.city} ({destinationPort?.code})</div>
            </div>
          </div>

          {/* Cargo Manifest Table */}
          <div className="border border-slate-400 mb-4">
            <table className="w-full text-left">
              <thead className="bg-slate-100 border-b border-slate-400 text-[10px] uppercase font-bold text-slate-700">
                <tr>
                  <th className="p-2">No. Kontainer / Tanda Muatan</th>
                  <th className="p-2">Kategori & Deskripsi Muatan</th>
                  <th className="p-2 text-right">Jumlah / TEU</th>
                  <th className="p-2 text-right">Berat Kotor (Gross)</th>
                  <th className="p-2 text-right">Volume (CBM)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300 text-xs">
                <tr>
                  <td className="p-2 font-mono text-[11px] align-top">
                    {bl.containerNumbers && bl.containerNumbers.length > 0 ? (
                      <div className="space-y-0.5">
                        {bl.containerNumbers.map((c, i) => (
                          <div key={i}>{c}</div>
                        ))}
                      </div>
                    ) : (
                      <span className="italic text-slate-500">Non-Kontainer (Curah/Breakbulk)</span>
                    )}
                  </td>
                  <td className="p-2 align-top">
                    <div className="font-bold text-slate-900">{bl.cargoCategory}</div>
                    <div className="text-slate-600 mt-1">{bl.cargoDescription}</div>
                    {bl.shipperNotes && (
                      <div className="text-[10px] text-amber-700 bg-amber-50 p-1 rounded mt-1 border border-amber-200">
                        Catatan Khusus: {bl.shipperNotes}
                      </div>
                    )}
                  </td>
                  <td className="p-2 text-right font-mono align-top font-bold">
                    {bl.containerCount > 0 ? `${bl.containerCount} TEU` : '1 Lot'}
                  </td>
                  <td className="p-2 text-right font-mono align-top font-bold">
                    {bl.grossWeightTons.toLocaleString()} Ton
                  </td>
                  <td className="p-2 text-right font-mono align-top">
                    {bl.volumeCbm.toLocaleString()} CBM
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Freight & Payment Summary */}
          <div className="grid grid-cols-2 gap-4 border border-slate-400 p-3 mb-6">
            <div>
              <div className="text-[10px] font-bold uppercase text-slate-500 mb-1">
                KETERANGAN PEMBAYARAN & STATUS:
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-slate-600">Status Pembayaran:</span>
                <span className={`px-2 py-0.5 font-bold rounded text-[11px] ${
                  bl.paymentStatus === 'Lunas' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {bl.paymentStatus}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-slate-600">Posisi Muatan:</span>
                <span className="font-semibold text-slate-800">{bl.cargoStatus}</span>
              </div>
            </div>

            <div className="text-right space-y-1 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Ongkos Angkut Laut (Ocean Freight):</span>
                <span className="font-mono font-bold text-slate-900">{formatIDR(bl.freightRate)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Terminal Handling Charge (THC):</span>
                <span className="font-mono">{formatIDR(bl.handlingFee)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Asuransi Kargo Maritim:</span>
                <span className="font-mono">{formatIDR(bl.insuranceFee)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Pajak PPN (11%):</span>
                <span className="font-mono">{formatIDR(bl.taxAmount)}</span>
              </div>
              <div className="flex justify-between border-t border-slate-300 pt-1 text-sm font-extrabold text-slate-900">
                <span>TOTAL ONGKOS ANGKUT:</span>
                <span className="font-mono text-cyan-800">{formatIDR(bl.totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Official Signatures */}
          <div className="grid grid-cols-3 text-center text-[10px] text-slate-700 pt-3">
            <div>
              <p className="font-bold">Pengirim / Shipper</p>
              <div className="h-16 flex items-end justify-center text-slate-400 italic">
                (Tanda tangan & Stempel)
              </div>
              <p className="border-t border-slate-400 pt-1 mx-4 font-semibold">{customer?.picName || 'Shipper'}</p>
            </div>
            <div>
              <p className="font-bold">Syahbandar / Port Authority</p>
              <div className="h-16 flex items-end justify-center text-slate-400 italic">
                (Legalisasi Otoritas Pelabuhan)
              </div>
              <p className="border-t border-slate-400 pt-1 mx-4 font-semibold">Port Officer On Duty</p>
            </div>
            <div>
              <p className="font-bold">Nakhoda Kapal / Carrier Agent</p>
              <div className="h-16 flex items-end justify-center text-slate-400 italic">
                (Capt. Master of Vessel)
              </div>
              <p className="border-t border-slate-400 pt-1 mx-4 font-semibold">{voyage?.masterCaptain || 'Master Mariner'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

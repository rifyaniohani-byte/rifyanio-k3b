export type UserRole = 'ADMIN' | 'MANAGER' | 'OPERATOR';

export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  createdAt: string;
}

export type VesselType = 'Container' | 'Bulk Carrier' | 'Tanker' | 'LCT' | 'Tongkang / Barge' | 'General Cargo';
export type VesselStatus = 'Aktif' | 'Dalam Pelayaran' | 'Bongkar Muat' | 'Docking / Perbaikan' | 'Standby';

export interface Vessel {
  id: string;
  code: string;
  name: string;
  type: VesselType;
  callSign: string;
  imoNumber: string;
  capacityDWT: number; // Deadweight tonnage
  capacityTEU: number; // Twenty-foot Equivalent Units
  yearBuilt: number;
  flag: string;
  currentPortId: string;
  status: VesselStatus;
  speedKnots: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Port {
  id: string;
  code: string;
  name: string;
  city: string;
  province: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  wharfLengthMeters: number;
  maxDraftMeters: number;
  operationalHours: string;
  contactPhone: string;
  status: 'Aktif' | 'Pemeliharaan';
  createdAt: string;
}

export interface Route {
  id: string;
  code: string;
  originPortId: string;
  destinationPortId: string;
  distanceNm: number; // Nautical miles
  estimatedDurationHours: number;
  baseRatePerTeu: number; // Tarif kontainer
  baseRatePerTon: number; // Tarif kargo curah
  status: 'Aktif' | 'Nonaktif';
  createdAt: string;
}

export type CustomerCategory = 'B2B Manufaktur' | 'Agrikultur & Perkebunan' | 'Pertambangan' | 'Ekspedisi / Freight Forwarder' | 'Distributor Ritel';

export interface Customer {
  id: string;
  code: string;
  name: string;
  category: CustomerCategory;
  picName: string;
  phone: string;
  email: string;
  address: string;
  npwp: string;
  status: 'Aktif' | 'Nonaktif';
  createdAt: string;
}

export type VoyageStatus = 'Terjadwal' | 'Proses Muat' | 'Dalam Pelayaran' | 'Tiba di Tujuan' | 'Selesai' | 'Dibatalkan';

export interface Voyage {
  id: string;
  voyageNumber: string;
  vesselId: string;
  routeId: string;
  departureDate: string; // ISO string
  arrivalDate: string; // ISO string
  actualDepartureDate?: string;
  actualArrivalDate?: string;
  status: VoyageStatus;
  masterCaptain: string;
  totalLoadedTeu: number;
  totalLoadedTons: number;
  fuelConsumptionEstLiters: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type PaymentStatus = 'Belum Lunas' | 'DP (Uang Muka)' | 'Lunas';
export type CargoStatus = 'Booking Diterima' | 'Muat di Pelabuhan' | 'Dalam Pelayaran' | 'Bongkar Muat' | 'Telah Diterima (Delivered)';
export type CargoCategory = 'Peti Kemas (FCL/LCL)' | 'Curah Kering (Bulk)' | 'Curah Cair (Liquid)' | 'Breakbulk / Kendaraan' | 'Barang Berbahaya (DG)';

export interface BillOfLading {
  id: string;
  blNumber: string;
  bookingDate: string;
  voyageId: string;
  customerId: string;
  cargoCategory: CargoCategory;
  cargoDescription: string;
  containerNumbers?: string[];
  containerCount: number;
  grossWeightTons: number;
  volumeCbm: number;
  freightRate: number;
  handlingFee: number;
  insuranceFee: number;
  taxAmount: number;
  totalAmount: number;
  paymentStatus: PaymentStatus;
  cargoStatus: CargoStatus;
  consigneeName: string;
  consigneeAddress: string;
  consigneePhone: string;
  shipperNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CargoTrackingLog {
  id: string;
  blId: string;
  timestamp: string;
  status: CargoStatus;
  location: string;
  notes: string;
  updatedBy: string;
}

export interface DatabaseStatus {
  engine: 'Firebase Firestore';
  type: 'Cloud Firestore NoSQL (Google Cloud)';
  connected: boolean;
  projectId?: string;
  databaseId?: string;
  totalVessels: number;
  totalPorts: number;
  totalRoutes: number;
  totalCustomers: number;
  totalVoyages: number;
  totalBillsOfLading: number;
  lastChecked: string;
  mode: 'real-database';
}

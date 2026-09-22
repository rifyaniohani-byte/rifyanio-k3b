import type { User, Vessel, Port, Route, Customer, Voyage, BillOfLading, CargoTrackingLog } from '../types.ts';

export const INITIAL_USERS: User[] = [
  {
    id: 'usr_admin',
    username: 'admin',
    name: 'Capt. Hendra Wicaksono, M.Mar',
    email: 'admin@maritimelogistik.id',
    role: 'ADMIN',
    phone: '+62 811-9876-5432',
    createdAt: '2025-01-10T08:00:00.000Z'
  },
  {
    id: 'usr_manager',
    username: 'manager',
    name: 'Dewi Rahmadani, S.T., M.Log',
    email: 'manager@maritimelogistik.id',
    role: 'MANAGER',
    phone: '+62 812-3456-7890',
    createdAt: '2025-01-11T09:30:00.000Z'
  },
  {
    id: 'usr_operator',
    username: 'operator',
    name: 'Rizky Pratama',
    email: 'operator@maritimelogistik.id',
    role: 'OPERATOR',
    phone: '+62 813-2233-4455',
    createdAt: '2025-01-15T10:00:00.000Z'
  }
];

export const INITIAL_PORTS: Port[] = [
  {
    id: 'port_jkt',
    code: 'IDJKT',
    name: 'Pelabuhan Tanjung Priok',
    city: 'Jakarta Utara',
    province: 'DKI Jakarta',
    coordinates: { lat: -6.1038, lng: 106.8833 },
    wharfLengthMeters: 4500,
    maxDraftMeters: 14.5,
    operationalHours: '24 Jam Nonstop',
    contactPhone: '+62 21-4301080',
    status: 'Aktif',
    createdAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'port_sby',
    code: 'IDSBY',
    name: 'Pelabuhan Tanjung Perak',
    city: 'Surabaya',
    province: 'Jawa Timur',
    coordinates: { lat: -7.1994, lng: 112.7303 },
    wharfLengthMeters: 3800,
    maxDraftMeters: 12.0,
    operationalHours: '24 Jam Nonstop',
    contactPhone: '+62 31-3291991',
    status: 'Aktif',
    createdAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'port_mak',
    code: 'IDMAK',
    name: 'Pelabuhan Soekarno-Hatta Makassar',
    city: 'Makassar',
    province: 'Sulawesi Selatan',
    coordinates: { lat: -5.1167, lng: 119.4167 },
    wharfLengthMeters: 2200,
    maxDraftMeters: 12.5,
    operationalHours: '24 Jam Nonstop',
    contactPhone: '+62 411-316549',
    status: 'Aktif',
    createdAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'port_bpn',
    code: 'IDBPN',
    name: 'Pelabuhan Semayang Balikpapan',
    city: 'Balikpapan',
    province: 'Kalimantan Timur',
    coordinates: { lat: -1.2783, lng: 116.8122 },
    wharfLengthMeters: 1800,
    maxDraftMeters: 11.0,
    operationalHours: '24 Jam Nonstop',
    contactPhone: '+62 542-422114',
    status: 'Aktif',
    createdAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'port_blw',
    code: 'IDBLW',
    name: 'Pelabuhan Belawan Medan',
    city: 'Medan',
    province: 'Sumatera Utara',
    coordinates: { lat: 3.7833, lng: 98.6833 },
    wharfLengthMeters: 2500,
    maxDraftMeters: 10.5,
    operationalHours: '24 Jam Nonstop',
    contactPhone: '+62 61-6941300',
    status: 'Aktif',
    createdAt: '2025-01-01T00:00:00.000Z'
  }
];

export const INITIAL_ROUTES: Route[] = [
  {
    id: 'rt_jkt_sby',
    code: 'R-JKT-SBY',
    originPortId: 'port_jkt',
    destinationPortId: 'port_sby',
    distanceNm: 410,
    estimatedDurationHours: 32,
    baseRatePerTeu: 4500000,
    baseRatePerTon: 220000,
    status: 'Aktif',
    createdAt: '2025-01-05T00:00:00.000Z'
  },
  {
    id: 'rt_jkt_mak',
    code: 'R-JKT-MAK',
    originPortId: 'port_jkt',
    destinationPortId: 'port_mak',
    distanceNm: 850,
    estimatedDurationHours: 70,
    baseRatePerTeu: 9500000,
    baseRatePerTon: 480000,
    status: 'Aktif',
    createdAt: '2025-01-05T00:00:00.000Z'
  },
  {
    id: 'rt_sby_mak',
    code: 'R-SBY-MAK',
    originPortId: 'port_sby',
    destinationPortId: 'port_mak',
    distanceNm: 510,
    estimatedDurationHours: 42,
    baseRatePerTeu: 6200000,
    baseRatePerTon: 310000,
    status: 'Aktif',
    createdAt: '2025-01-05T00:00:00.000Z'
  },
  {
    id: 'rt_sby_bpn',
    code: 'R-SBY-BPN',
    originPortId: 'port_sby',
    destinationPortId: 'port_bpn',
    distanceNm: 490,
    estimatedDurationHours: 40,
    baseRatePerTeu: 6800000,
    baseRatePerTon: 340000,
    status: 'Aktif',
    createdAt: '2025-01-05T00:00:00.000Z'
  },
  {
    id: 'rt_jkt_blw',
    code: 'R-JKT-BLW',
    originPortId: 'port_jkt',
    destinationPortId: 'port_blw',
    distanceNm: 780,
    estimatedDurationHours: 64,
    baseRatePerTeu: 8500000,
    baseRatePerTon: 420000,
    status: 'Aktif',
    createdAt: '2025-01-05T00:00:00.000Z'
  }
];

export const INITIAL_VESSELS: Vessel[] = [
  {
    id: 'vsl_01',
    code: 'VSL-SN-01',
    name: 'KM Samudera Nusantara 01',
    type: 'Container',
    callSign: 'PK-SN01',
    imoNumber: '9512341',
    capacityDWT: 12500,
    capacityTEU: 850,
    yearBuilt: 2018,
    flag: 'Indonesia',
    currentPortId: 'port_jkt',
    status: 'Aktif',
    speedKnots: 14.5,
    notes: 'Kapal kontainer utama rute Jakarta - Surabaya - Makassar',
    createdAt: '2025-01-02T00:00:00.000Z',
    updatedAt: '2025-01-02T00:00:00.000Z'
  },
  {
    id: 'vsl_02',
    code: 'VSL-MP-08',
    name: 'KM Maritim Perkasa',
    type: 'Container',
    callSign: 'PK-MP08',
    imoNumber: '9678221',
    capacityDWT: 18000,
    capacityTEU: 1200,
    yearBuilt: 2021,
    flag: 'Indonesia',
    currentPortId: 'port_mak',
    status: 'Dalam Pelayaran',
    speedKnots: 16.0,
    notes: 'Kapal kontainer berkapasitas besar tol laut Indonesia Timur',
    createdAt: '2025-01-02T00:00:00.000Z',
    updatedAt: '2025-01-02T00:00:00.000Z'
  },
  {
    id: 'vsl_03',
    code: 'VSL-BC-03',
    name: 'MV Borneo Carrier III',
    type: 'Bulk Carrier',
    callSign: 'PK-BC03',
    imoNumber: '9345112',
    capacityDWT: 28000,
    capacityTEU: 0,
    yearBuilt: 2016,
    flag: 'Indonesia',
    currentPortId: 'port_bpn',
    status: 'Bongkar Muat',
    speedKnots: 12.5,
    notes: 'Pengangkut batubara, bijih besi, dan semen curah antarpulau',
    createdAt: '2025-01-02T00:00:00.000Z',
    updatedAt: '2025-01-02T00:00:00.000Z'
  },
  {
    id: 'vsl_04',
    code: 'VSL-TK-05',
    name: 'MT Barito Tanker V',
    type: 'Tanker',
    callSign: 'PK-TK05',
    imoNumber: '9456789',
    capacityDWT: 9500,
    capacityTEU: 0,
    yearBuilt: 2019,
    flag: 'Indonesia',
    currentPortId: 'port_sby',
    status: 'Standby',
    speedKnots: 13.0,
    notes: 'Tanker CPO (Minyak Kelapa Sawit) dan Biodiesel B35',
    createdAt: '2025-01-02T00:00:00.000Z',
    updatedAt: '2025-01-02T00:00:00.000Z'
  },
  {
    id: 'vsl_05',
    code: 'VSL-LCT-02',
    name: 'LCT Selat Sunda II',
    type: 'LCT',
    callSign: 'PK-LC02',
    imoNumber: '9788345',
    capacityDWT: 2500,
    capacityTEU: 60,
    yearBuilt: 2020,
    flag: 'Indonesia',
    currentPortId: 'port_blw',
    status: 'Aktif',
    speedKnots: 10.5,
    notes: 'Landing Craft Tank khusus alat berat konstruksi dan logistik proyek',
    createdAt: '2025-01-02T00:00:00.000Z',
    updatedAt: '2025-01-02T00:00:00.000Z'
  }
];

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cst_01',
    code: 'CST-KS-001',
    name: 'PT Krakatau Steel (Persero) Tbk',
    category: 'B2B Manufaktur',
    picName: 'Ir. Budi Santoso',
    phone: '+62 254-391150',
    email: 'logistik@krakatausteel.com',
    address: 'Kawasan Industri Krakatau Cilegon, Banten',
    npwp: '01.000.123.4-081.000',
    status: 'Aktif',
    createdAt: '2025-01-03T00:00:00.000Z'
  },
  {
    id: 'cst_02',
    code: 'CST-WA-002',
    name: 'PT Wilmar Nabati Indonesia',
    category: 'Agrikultur & Perkebunan',
    picName: 'Siti Rahmawati',
    phone: '+62 31-3981122',
    email: 'shipping.sub@wilmar.co.id',
    address: 'Jl. Kapten Darmo Sugondo Gresik, Jawa Timur',
    npwp: '01.234.567.8-091.000',
    status: 'Aktif',
    createdAt: '2025-01-03T00:00:00.000Z'
  },
  {
    id: 'cst_03',
    code: 'CST-PK-003',
    name: 'PT Pupuk Kalimantan Timur',
    category: 'B2B Manufaktur',
    picName: 'Ahmad Fauzi',
    phone: '+62 548-41202',
    email: 'shipping@pupukkaltim.com',
    address: 'Bontang, Kalimantan Timur',
    npwp: '01.000.321.4-001.000',
    status: 'Aktif',
    createdAt: '2025-01-03T00:00:00.000Z'
  },
  {
    id: 'cst_04',
    code: 'CST-IF-004',
    name: 'PT Indofood CBP Sukses Makmur Tbk',
    category: 'Distributor Ritel',
    picName: 'Diana Kusuma',
    phone: '+62 21-57958822',
    email: 'supplychain@indofood.co.id',
    address: 'Sudirman Plaza, Jakarta Selatan',
    npwp: '01.338.455.9-092.000',
    status: 'Aktif',
    createdAt: '2025-01-03T00:00:00.000Z'
  },
  {
    id: 'cst_05',
    code: 'CST-SL-005',
    name: 'PT Samudera Logistik Prima',
    category: 'Ekspedisi / Freight Forwarder',
    picName: 'Hendra Gunawan',
    phone: '+62 21-43901122',
    email: 'booking@samuderaprima.com',
    address: 'Jl. Enggano No. 45 Tanjung Priok, Jakarta Utara',
    npwp: '02.415.890.3-043.000',
    status: 'Aktif',
    createdAt: '2025-01-03T00:00:00.000Z'
  }
];

export const INITIAL_VOYAGES: Voyage[] = [
  {
    id: 'vyg_2025_001',
    voyageNumber: 'VOY-2025-081',
    vesselId: 'vsl_01',
    routeId: 'rt_jkt_sby',
    departureDate: '2025-03-02T14:00:00.000Z',
    arrivalDate: '2025-03-04T02:00:00.000Z',
    actualDepartureDate: '2025-03-02T15:30:00.000Z',
    actualArrivalDate: '2025-03-04T03:15:00.000Z',
    status: 'Selesai',
    masterCaptain: 'Capt. Bambang Sudirman',
    totalLoadedTeu: 420,
    totalLoadedTons: 6200,
    fuelConsumptionEstLiters: 18500,
    notes: 'Pelayaran lancar, kondisi cuaca laut Jawa tenang (ombak 0.5-1.0m)',
    createdAt: '2025-02-25T00:00:00.000Z',
    updatedAt: '2025-03-04T04:00:00.000Z'
  },
  {
    id: 'vyg_2025_002',
    voyageNumber: 'VOY-2025-082',
    vesselId: 'vsl_02',
    routeId: 'rt_jkt_mak',
    departureDate: '2025-03-05T10:00:00.000Z',
    arrivalDate: '2025-03-08T08:00:00.000Z',
    actualDepartureDate: '2025-03-05T11:00:00.000Z',
    status: 'Dalam Pelayaran',
    masterCaptain: 'Capt. Yanuar Pratama',
    totalLoadedTeu: 780,
    totalLoadedTons: 11400,
    fuelConsumptionEstLiters: 42000,
    notes: 'Melintas Selat Makassar, estimasi sandar dermaga Hatta Makassar tepat waktu',
    createdAt: '2025-02-28T00:00:00.000Z',
    updatedAt: '2025-03-05T12:00:00.000Z'
  },
  {
    id: 'vyg_2025_003',
    voyageNumber: 'VOY-2025-083',
    vesselId: 'vsl_03',
    routeId: 'rt_sby_mak',
    departureDate: '2025-03-06T18:00:00.000Z',
    arrivalDate: '2025-03-08T12:00:00.000Z',
    status: 'Proses Muat',
    masterCaptain: 'Capt. Dedi Kurniawan',
    totalLoadedTeu: 0,
    totalLoadedTons: 18500,
    fuelConsumptionEstLiters: 28000,
    notes: 'Pemuatan kargo batubara di dermaga curah Tanjung Perak',
    createdAt: '2025-03-01T00:00:00.000Z',
    updatedAt: '2025-03-06T19:00:00.000Z'
  }
];

export const INITIAL_BILLS_OF_LADING: BillOfLading[] = [
  {
    id: 'bl_2025_001',
    blNumber: 'BL-SLN-2025-0012',
    bookingDate: '2025-02-26T08:00:00.000Z',
    voyageId: 'vyg_2025_001',
    customerId: 'cst_01',
    cargoCategory: 'Breakbulk / Kendaraan',
    cargoDescription: 'Gulungan Baja Hot Rolled Coil (HRC) Standard SNI 07-0601',
    containerNumbers: [],
    containerCount: 0,
    grossWeightTons: 850.5,
    volumeCbm: 420,
    freightRate: 187110000,
    handlingFee: 15000000,
    insuranceFee: 4500000,
    taxAmount: 22727100,
    totalAmount: 229337100,
    paymentStatus: 'Lunas',
    cargoStatus: 'Telah Diterima (Delivered)',
    consigneeName: 'PT Steel Pipe Industry of Indonesia (SPINDO)',
    consigneeAddress: 'Jl. Kalibutuh No. 189-191 Surabaya, Jawa Timur',
    consigneePhone: '+62 31-5320921',
    shipperNotes: 'Kargo baja berat, wajib handling crane minimal 40 ton di Tanjung Perak',
    createdAt: '2025-02-26T09:00:00.000Z',
    updatedAt: '2025-03-04T09:30:00.000Z'
  },
  {
    id: 'bl_2025_002',
    blNumber: 'BL-SLN-2025-0015',
    bookingDate: '2025-02-27T10:30:00.000Z',
    voyageId: 'vyg_2025_002',
    customerId: 'cst_04',
    cargoCategory: 'Peti Kemas (FCL/LCL)',
    cargoDescription: '15 x 40ft Kontainer Mie Instan & Makanan Olahan Kemasan',
    containerNumbers: [
      'SLNU-452109-1', 'SLNU-452110-5', 'SLNU-452111-0', 'SLNU-452112-6', 'SLNU-452113-1',
      'SLNU-452114-7', 'SLNU-452115-2', 'SLNU-452116-8', 'SLNU-452117-3', 'SLNU-452118-9',
      'SLNU-452119-4', 'SLNU-452120-8', 'SLNU-452121-3', 'SLNU-452122-9', 'SLNU-452123-4'
    ],
    containerCount: 15,
    grossWeightTons: 360,
    volumeCbm: 1020,
    freightRate: 142500000,
    handlingFee: 18500000,
    insuranceFee: 6200000,
    taxAmount: 18392000,
    totalAmount: 185592000,
    paymentStatus: 'Lunas',
    cargoStatus: 'Dalam Pelayaran',
    consigneeName: 'PT Indomarco Adi Prima Cabang Makassar',
    consigneeAddress: 'Kawasan Industri Makassar (KIMA) Kav. 12 BTP, Makassar',
    consigneePhone: '+62 411-510091',
    shipperNotes: 'Kargo kering, segel kontainer utuh terdaftar di JICT Tanjung Priok',
    createdAt: '2025-02-27T11:00:00.000Z',
    updatedAt: '2025-03-05T11:00:00.000Z'
  },
  {
    id: 'bl_2025_003',
    blNumber: 'BL-SLN-2025-0018',
    bookingDate: '2025-03-01T14:15:00.000Z',
    voyageId: 'vyg_2025_003',
    customerId: 'cst_03',
    cargoCategory: 'Curah Kering (Bulk)',
    cargoDescription: 'Pupuk Urea Curah Prill Non-Subsidi untuk Perkebunan',
    containerNumbers: [],
    containerCount: 0,
    grossWeightTons: 5000,
    volumeCbm: 3800,
    freightRate: 1550000000,
    handlingFee: 65000000,
    insuranceFee: 25000000,
    taxAmount: 180400000,
    totalAmount: 1820400000,
    paymentStatus: 'DP (Uang Muka)',
    cargoStatus: 'Muat di Pelabuhan',
    consigneeName: 'Dinas Pertanian & Ketahanan Pangan Sulawesi Selatan',
    consigneeAddress: 'Jl. Urip Sumoharjo Km. 7 Makassar, Sulawesi Selatan',
    consigneePhone: '+62 411-442211',
    shipperNotes: 'Terpal kedap air terpasang rapat di atas palka, hindari kelembapan',
    createdAt: '2025-03-01T15:00:00.000Z',
    updatedAt: '2025-03-06T18:30:00.000Z'
  }
];

export const INITIAL_TRACKING_LOGS: CargoTrackingLog[] = [
  {
    id: 'trk_01',
    blId: 'bl_2025_001',
    timestamp: '2025-02-26T09:00:00.000Z',
    status: 'Booking Diterima',
    location: 'Tanjung Priok Jakarta',
    notes: 'Pemesanan muatan diverifikasi dan slot palka KM Samudera Nusantara 01 dialokasikan.',
    updatedBy: 'Dewi Rahmadani'
  },
  {
    id: 'trk_02',
    blId: 'bl_2025_001',
    timestamp: '2025-03-02T12:00:00.000Z',
    status: 'Muat di Pelabuhan',
    location: 'Dermaga 102 Tanjung Priok',
    notes: 'Pemuatan HRC ke palka kapal KM Samudera Nusantara selesai diperiksa surveyor.',
    updatedBy: 'Rizky Pratama'
  },
  {
    id: 'trk_03',
    blId: 'bl_2025_001',
    timestamp: '2025-03-02T15:30:00.000Z',
    status: 'Dalam Pelayaran',
    location: 'Laut Jawa (Posisi 05°45\'S 108°12\'E)',
    notes: 'Kapal berlayar menuju Pelabuhan Tanjung Perak Surabaya.',
    updatedBy: 'Capt. Bambang Sudirman'
  },
  {
    id: 'trk_04',
    blId: 'bl_2025_001',
    timestamp: '2025-03-04T03:30:00.000Z',
    status: 'Bongkar Muat',
    location: 'Dermaga Jamrud Tanjung Perak Surabaya',
    notes: 'Kapal bersandar, proses bongkar muatan dimulai.',
    updatedBy: 'Staf Lapangan Tanjung Perak'
  },
  {
    id: 'trk_05',
    blId: 'bl_2025_001',
    timestamp: '2025-03-04T09:30:00.000Z',
    status: 'Telah Diterima (Delivered)',
    location: 'Gudang Penerima Rungkut Industri',
    notes: 'Kargo diterima dalam kondisi baik lengkap dengan Berita Acara Serah Terima.',
    updatedBy: 'Dewi Rahmadani'
  },
  {
    id: 'trk_06',
    blId: 'bl_2025_002',
    timestamp: '2025-02-27T14:00:00.000Z',
    status: 'Booking Diterima',
    location: 'Tanjung Priok Jakarta',
    notes: 'Booking 15 kontainer FMCG dikonfirmasi.',
    updatedBy: 'Rizky Pratama'
  },
  {
    id: 'trk_07',
    blId: 'bl_2025_002',
    timestamp: '2025-03-04T20:00:00.000Z',
    status: 'Muat di Pelabuhan',
    location: 'Jakarta International Container Terminal (JICT)',
    notes: 'Kontainer telah masuk stowing bay KM Maritim Perkasa.',
    updatedBy: 'Rizky Pratama'
  },
  {
    id: 'trk_08',
    blId: 'bl_2025_002',
    timestamp: '2025-03-05T11:00:00.000Z',
    status: 'Dalam Pelayaran',
    location: 'Selat Makassar (Posisi 03°20\'S 118°10\'E)',
    notes: 'Kapal dalam kecepatan 15.8 knot menuju Makassar.',
    updatedBy: 'Capt. Yanuar Pratama'
  }
];

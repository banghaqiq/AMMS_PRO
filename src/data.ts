/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ACAsset, Technician, WorkOrder, SystemAlert } from './types';

export const INITIAL_ASSETS: ACAsset[] = [
  {
    id: 'AC-001',
    name: 'AC Server Room Lt. 2 Utama',
    brand: 'Daikin',
    type: 'VRV',
    location: 'Gedung A - Lantai 2, Ruang Server',
    powerPK: 5.0,
    status: 'Normal',
    lastService: '2026-06-15',
    nextService: '2026-12-15',
    installationDate: '2024-03-10',
    serialNumber: 'DK-VRV-99812-B'
  },
  {
    id: 'AC-002',
    name: 'AC Cassette Ruang Rapat Utama',
    brand: 'Panasonic',
    type: 'Cassette',
    location: 'Gedung A - Lantai 1, R. Rapat Utama',
    powerPK: 2.0,
    status: 'Butuh Servis',
    lastService: '2025-11-20',
    nextService: '2026-05-20',
    installationDate: '2023-08-15',
    serialNumber: 'PN-CS-44120-X'
  },
  {
    id: 'AC-003',
    name: 'AC Standing Lobby Utama',
    brand: 'Sharp',
    type: 'Standing',
    location: 'Gedung A - Lantai 1, Lobby',
    powerPK: 3.0,
    status: 'Dalam Perbaikan',
    lastService: '2026-02-14',
    nextService: '2026-08-14',
    installationDate: '2025-01-05',
    serialNumber: 'SH-ST-22109-M'
  },
  {
    id: 'AC-004',
    name: 'AC Split R. Direktur Utama',
    brand: 'Daikin',
    type: 'Split',
    location: 'Gedung B - Lantai 4, R. Direksi',
    powerPK: 1.5,
    status: 'Normal',
    lastService: '2026-06-01',
    nextService: '2026-12-01',
    installationDate: '2024-11-12',
    serialNumber: 'DK-SP-10492-Y'
  },
  {
    id: 'AC-005',
    name: 'AC Split Ruang HRD Lt. 3',
    brand: 'LG',
    type: 'Split',
    location: 'Gedung A - Lantai 3, Ruang HRD',
    powerPK: 1.0,
    status: 'Rusak',
    lastService: '2025-08-10',
    nextService: '2026-02-10',
    installationDate: '2022-05-20',
    serialNumber: 'LG-SP-00219-Z'
  },
  {
    id: 'AC-006',
    name: 'AC Cassette Kafetaria',
    brand: 'Panasonic',
    type: 'Cassette',
    location: 'Gedung B - Lantai 5, Kafetaria',
    powerPK: 2.0,
    status: 'Normal',
    lastService: '2026-05-18',
    nextService: '2026-11-18',
    installationDate: '2023-12-01',
    serialNumber: 'PN-CS-51002-K'
  },
  {
    id: 'AC-007',
    name: 'AC Split R. Kerja Developer',
    brand: 'Mitsubishi',
    type: 'Split',
    location: 'Gedung A - Lantai 2, R. IT Dev',
    powerPK: 2.0,
    status: 'Normal',
    lastService: '2026-04-10',
    nextService: '2026-10-10',
    installationDate: '2024-06-18',
    serialNumber: 'ME-SP-88310-H'
  }
];

export const INITIAL_TECHNICIANS: Technician[] = [
  {
    id: 'T-001',
    name: 'Agus Saputra',
    specialty: 'Sistem VRV & AC Cassette',
    status: 'Bertugas',
    phone: '0812-3456-7890',
    rating: 4.8
  },
  {
    id: 'T-002',
    name: 'Rian Hidayat',
    specialty: 'AC Split & Standing Unit',
    status: 'Tersedia',
    phone: '0857-9876-5432',
    rating: 4.6
  },
  {
    id: 'T-003',
    name: 'Budi Santoso',
    specialty: 'Kelistrikan & Kompresor',
    status: 'Offline',
    phone: '0813-5555-1212',
    rating: 4.9
  },
  {
    id: 'T-004',
    name: 'Dewi Lestari',
    specialty: 'Perawatan Berkala & Pembersihan',
    status: 'Tersedia',
    phone: '0821-2222-3333',
    rating: 4.7
  }
];

export const INITIAL_WORK_ORDERS: WorkOrder[] = [
  {
    id: 'WO-101',
    title: 'Pembersihan Filter & Pengisian Freon',
    assetId: 'AC-002',
    technicianId: 'T-002',
    priority: 'Sedang',
    status: 'Diproses',
    createdAt: '2026-07-10',
    description: 'Unit mengeluarkan udara kurang dingin. Butuh pembersihan filter evaporator dan pengecekan tekanan freon R32.',
    cost: 150000
  },
  {
    id: 'WO-102',
    title: 'Perbaikan Motor Fan Outdoor Terbakar',
    assetId: 'AC-003',
    technicianId: 'T-001',
    priority: 'Tinggi',
    status: 'Diproses',
    createdAt: '2026-07-11',
    description: 'Kipas kondensor outdoor tidak berputar dan mengeluarkan bau gosong. Suku cadang motor fan orisinal sudah disiapkan.',
    cost: 1250000
  },
  {
    id: 'WO-103',
    title: 'Diagnosis Suhu Overheat & Mati Total',
    assetId: 'AC-005',
    technicianId: 'T-003',
    priority: 'Tinggi',
    status: 'Menunggu',
    createdAt: '2026-07-12',
    description: 'AC tiba-tiba mati total dengan kode error E6 pada display panel. Dicurigai kerusakan sensor termistor atau overload protector.'
  },
  {
    id: 'WO-104',
    title: 'Pembersihan Rutin Cuci AC Berkala',
    assetId: 'AC-006',
    technicianId: 'T-004',
    priority: 'Rendah',
    status: 'Selesai',
    createdAt: '2026-07-05',
    completedAt: '2026-07-06',
    description: 'Cuci rutin 3 bulanan AC Cassette area kafetaria demi menjaga efisiensi daya dan kebersihan udara makan karyawan.',
    cost: 180000
  },
  {
    id: 'WO-105',
    title: 'Perawatan Preventif Ruang Server Utama',
    assetId: 'AC-001',
    technicianId: 'T-001',
    priority: 'Tinggi',
    status: 'Selesai',
    createdAt: '2026-06-15',
    completedAt: '2026-06-15',
    description: 'Pengecekan rutin sistem kelistrikan VRV, pembersihan coil condenser outdoor, dan kalibrasi dual-thermostat.',
    cost: 450000
  }
];

export const INITIAL_ALERTS: SystemAlert[] = [
  {
    id: 'AL-001',
    severity: 'critical',
    message: 'AC Ruang HRD Lt. 3 mengalami mati total (Error E6) - Butuh tindakan segera!',
    timestamp: '10 Menit lalu',
    isRead: false,
    assetId: 'AC-005'
  },
  {
    id: 'AL-002',
    severity: 'warning',
    message: 'Jadwal servis berkala AC Cassette Ruang Rapat Utama telah terlewat 1 bulan.',
    timestamp: '1 Jam lalu',
    isRead: false,
    assetId: 'AC-002'
  },
  {
    id: 'AL-003',
    severity: 'info',
    message: 'Pekerjaan Pembersihan Rutin Kafetaria telah diselesaikan oleh Dewi Lestari.',
    timestamp: '3 Jam lalu',
    isRead: true,
    assetId: 'AC-006'
  }
];

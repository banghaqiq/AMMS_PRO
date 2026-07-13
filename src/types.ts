/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ACAsset {
  id: string;
  name: string;
  brand: string;
  type: 'Split' | 'Cassette' | 'Standing' | 'VRV';
  location: string;
  powerPK: number; // PK capacity (0.5, 1.0, 1.5, 2.0, etc.)
  status: 'Normal' | 'Butuh Servis' | 'Dalam Perbaikan' | 'Rusak';
  lastService: string;
  nextService: string;
  installationDate: string;
  serialNumber: string;
}

export interface Technician {
  id: string;
  name: string;
  specialty: string;
  status: 'Tersedia' | 'Bertugas' | 'Offline';
  phone: string;
  rating: number;
}

export interface WorkOrder {
  id: string;
  title: string;
  assetId: string;
  technicianId?: string; // Optional if not assigned yet
  priority: 'Rendah' | 'Sedang' | 'Tinggi';
  status: 'Menunggu' | 'Diproses' | 'Selesai';
  createdAt: string;
  completedAt?: string;
  cost?: number;
  description: string;
}

export interface SystemAlert {
  id: string;
  severity: 'warning' | 'critical' | 'info';
  message: string;
  timestamp: string;
  isRead: boolean;
  assetId?: string;
}

export type TabType = 'dashboard' | 'assets' | 'work-orders' | 'technicians' | 'analytics' | 'settings';

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Search, 
  Filter, 
  MapPin, 
  Calendar, 
  Cpu, 
  Tag, 
  Wrench, 
  Trash2, 
  Edit,
  X,
  CheckCircle,
  AlertTriangle,
  Flame,
  Info
} from 'lucide-react';
import { ACAsset } from '../types';

interface AssetsViewProps {
  assets: ACAsset[];
  setAssets: React.Dispatch<React.SetStateAction<ACAsset[]>>;
  onCreateWorkOrderFromAsset: (assetId: string, title: string) => void;
}

export default function AssetsView({
  assets,
  setAssets,
  onCreateWorkOrderFromAsset,
}: AssetsViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [brandFilter, setBrandFilter] = useState<string>('All');
  
  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<ACAsset | null>(null);

  // Form states
  const [formData, setFormData] = useState<Omit<ACAsset, 'id'>>({
    name: '',
    brand: 'Daikin',
    type: 'Split',
    location: '',
    powerPK: 1.0,
    status: 'Normal',
    lastService: new Date().toISOString().split('T')[0],
    nextService: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    installationDate: new Date().toISOString().split('T')[0],
    serialNumber: '',
  });

  // Search & Filter computation
  const filteredAssets = assets.filter((asset) => {
    const matchesSearch = 
      asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || asset.status === statusFilter;
    const matchesBrand = brandFilter === 'All' || asset.brand === brandFilter;

    return matchesSearch && matchesStatus && matchesBrand;
  });

  const uniqueBrands = ['All', ...new Set(assets.map(a => a.brand))];

  // Handlers
  const handleAddAssetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.location || !formData.serialNumber) {
      alert('Mohon lengkapi seluruh kolom yang wajib diisi.');
      return;
    }

    const newId = `AC-${String(assets.length + 1).padStart(3, '0')}`;
    const newAsset: ACAsset = {
      ...formData,
      id: newId,
    };

    setAssets(prev => [newAsset, ...prev]);
    setIsAddModalOpen(false);
    resetForm();
  };

  const handleEditAssetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAsset) return;

    setAssets(prev => prev.map(a => a.id === selectedAsset.id ? { ...selectedAsset } : a));
    setIsEditModalOpen(false);
    setSelectedAsset(null);
  };

  const handleDeleteAsset = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus aset AC ini dari sistem? Semua data riwayat terkait akan terpengaruh.')) {
      setAssets(prev => prev.filter(a => a.id !== id));
    }
  };

  const openEditModal = (asset: ACAsset) => {
    setSelectedAsset({ ...asset });
    setIsEditModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      brand: 'Daikin',
      type: 'Split',
      location: '',
      powerPK: 1.0,
      status: 'Normal',
      lastService: new Date().toISOString().split('T')[0],
      nextService: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      installationDate: new Date().toISOString().split('T')[0],
      serialNumber: '',
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Header controls: Search & Filter bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            id="asset-search"
            type="text"
            placeholder="Cari AC berdasarkan nama, lokasi, serial number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-sky-500 text-slate-800 dark:text-slate-100 transition-all placeholder:text-slate-400"
          />
        </div>

        {/* Filters & Add Button */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              id="filter-status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
            >
              <option value="All">Semua Status</option>
              <option value="Normal">Normal</option>
              <option value="Butuh Servis">Butuh Servis</option>
              <option value="Dalam Perbaikan">Dalam Perbaikan</option>
              <option value="Rusak">Rusak</option>
            </select>
          </div>

          {/* Brand Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <Tag className="w-4 h-4 text-slate-400" />
            <select
              id="filter-brand"
              value={brandFilter}
              onChange={(e) => setBrandFilter(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
            >
              {uniqueBrands.map(b => (
                <option key={b} value={b}>{b === 'All' ? 'Semua Merek' : b}</option>
              ))}
            </select>
          </div>

          {/* Add Asset trigger */}
          <button
            id="btn-add-asset"
            onClick={() => {
              resetForm();
              setIsAddModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow-md shadow-sky-600/10 cursor-pointer transition-colors"
          >
            <Plus className="w-4.5 h-4.5" />
            Tambah Aset AC
          </button>
        </div>
      </div>

      {/* Grid of AC Assets */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredAssets.length === 0 ? (
          <div className="col-span-full p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
            <Cpu className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto animate-bounce mb-3" />
            <p className="font-semibold text-slate-700 dark:text-slate-300">Aset Tidak Ditemukan</p>
            <p className="text-xs text-slate-400 mt-1">Coba sesuaikan kata kunci pencarian atau bersihkan filter Anda.</p>
          </div>
        ) : (
          filteredAssets.map((asset) => {
            const isCritical = asset.status === 'Rusak';
            const isWarning = asset.status === 'Butuh Servis';
            const isProgress = asset.status === 'Dalam Perbaikan';

            return (
              <motion.div
                layout
                key={asset.id}
                whileHover={{ y: -3 }}
                className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs hover:shadow-md flex flex-col justify-between transition-all"
              >
                <div>
                  {/* Card Header: Brand, PK, Type */}
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <span className="font-mono text-[10px] font-bold text-slate-400 dark:text-slate-500 block">
                        {asset.id} • {asset.brand.toUpperCase()}
                      </span>
                      <h4 className="font-display font-bold text-slate-800 dark:text-white text-sm md:text-base leading-snug">
                        {asset.name}
                      </h4>
                    </div>

                    {/* Status Badge */}
                    <span className={`px-2.5 py-0.5 font-bold font-sans text-[10px] rounded-full flex items-center gap-1 ${
                      isCritical
                        ? 'bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400'
                        : isWarning
                        ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400'
                        : isProgress
                        ? 'bg-sky-100 dark:bg-sky-950/40 text-sky-700 dark:text-sky-400'
                        : 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        isCritical ? 'bg-rose-500 animate-ping' : isWarning ? 'bg-amber-500 animate-pulse' : isProgress ? 'bg-sky-500' : 'bg-emerald-500'
                      }`} />
                      {asset.status}
                    </span>
                  </div>

                  {/* Quick specs section (Bento grid accents) */}
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    <div className="p-2.5 bg-slate-50 dark:bg-slate-850/50 rounded-xl border border-slate-100 dark:border-slate-800/20 text-center">
                      <span className="text-[10px] text-slate-400 block font-medium">Kapasitas PK</span>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{asset.powerPK} PK</span>
                    </div>
                    <div className="p-2.5 bg-slate-50 dark:bg-slate-850/50 rounded-xl border border-slate-100 dark:border-slate-800/20 text-center">
                      <span className="text-[10px] text-slate-400 block font-medium">Model Unit</span>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{asset.type}</span>
                    </div>
                  </div>

                  {/* Info lines: Location, Next scheduled service, Serial Number */}
                  <div className="space-y-2 mt-4 border-t border-slate-100 dark:border-slate-800/60 pt-4 text-xs">
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      <span className="truncate">{asset.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <Calendar className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      <span>Jadwal Servis: <strong className="text-slate-700 dark:text-slate-300">{asset.nextService}</strong></span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500 font-mono text-[10px]">
                      <span className="text-slate-400 uppercase">S/N:</span>
                      <span>{asset.serialNumber}</span>
                    </div>
                  </div>
                </div>

                {/* Actions row: Service Request, Edit, Delete */}
                <div className="flex items-center justify-between mt-5 pt-3 border-t border-slate-100 dark:border-slate-800/60 gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      id={`btn-edit-asset-${asset.id}`}
                      onClick={() => openEditModal(asset)}
                      className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 hover:text-sky-500 transition-colors cursor-pointer"
                      title="Edit Detail Aset"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      id={`btn-delete-asset-${asset.id}`}
                      onClick={() => handleDeleteAsset(asset.id)}
                      className="p-2 hover:bg-rose-50 dark:hover:bg-rose-950/25 rounded-lg text-slate-500 hover:text-rose-500 transition-colors cursor-pointer"
                      title="Hapus Aset"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {(isCritical || isWarning || isProgress) ? (
                    <button
                      id={`btn-wo-shortcut-${asset.id}`}
                      onClick={() => onCreateWorkOrderFromAsset(
                        asset.id, 
                        isCritical ? `Reparasi Darurat: ${asset.name}` : `Pemeliharaan Rutin: ${asset.name}`
                      )}
                      className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl cursor-pointer transition-colors shadow-xs"
                    >
                      <Wrench className="w-3.5 h-3.5" />
                      Proses WO
                    </button>
                  ) : (
                    <button
                      id={`btn-wo-shortcut-normal-${asset.id}`}
                      onClick={() => onCreateWorkOrderFromAsset(
                        asset.id,
                        `Servis Kebersihan Cuci AC: ${asset.name}`
                      )}
                      className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl cursor-pointer transition-colors"
                    >
                      <Wrench className="w-3.5 h-3.5" />
                      Jadwalkan Servis
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* MODAL 1: Tambah Aset Baru */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddModalOpen(false)}
              className="fixed inset-0 bg-black cursor-pointer"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl relative overflow-hidden z-10"
            >
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <h3 className="font-display font-bold text-slate-800 dark:text-white text-base">
                  Registrasi Unit AC Baru
                </h3>
                <button
                  id="btn-close-add-modal"
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddAssetSubmit} className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
                {/* Name */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block">
                    Nama Unit AC <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="add-asset-name"
                    type="text"
                    required
                    placeholder="Contoh: AC Split R. Rapat Direksi Lt. 3"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                {/* Brand & Type */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block">Merek / Brand</label>
                    <select
                      id="add-asset-brand"
                      value={formData.brand}
                      onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                      className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-sky-500 cursor-pointer"
                    >
                      <option value="Daikin">Daikin</option>
                      <option value="Panasonic">Panasonic</option>
                      <option value="Sharp">Sharp</option>
                      <option value="LG">LG</option>
                      <option value="Mitsubishi">Mitsubishi</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block">Tipe Model</label>
                    <select
                      id="add-asset-type"
                      value={formData.type}
                      onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                      className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-sky-500 cursor-pointer"
                    >
                      <option value="Split">Split</option>
                      <option value="Cassette">Cassette</option>
                      <option value="Standing">Standing</option>
                      <option value="VRV">VRV (Sistem Sentral)</option>
                    </select>
                  </div>
                </div>

                {/* Location */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block">
                    Detail Lokasi Penempatan <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="add-asset-location"
                    type="text"
                    required
                    placeholder="Contoh: Gedung B - Lantai 3, Ruang HRD"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                {/* PK Power Capacity & Serial Number */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block">Kapasitas PK</label>
                    <input
                      id="add-asset-pk"
                      type="number"
                      step="0.5"
                      min="0.5"
                      max="15"
                      required
                      value={formData.powerPK}
                      onChange={(e) => setFormData(prev => ({ ...prev, powerPK: parseFloat(e.target.value) }))}
                      className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block">
                      Serial Number (S/N) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="add-asset-sn"
                      type="text"
                      required
                      placeholder="Contoh: SN-DK-2102-Y"
                      value={formData.serialNumber}
                      onChange={(e) => setFormData(prev => ({ ...prev, serialNumber: e.target.value }))}
                      className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                </div>

                {/* Installation & Next Service dates */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block">Tanggal Pasang</label>
                    <input
                      id="add-asset-install"
                      type="date"
                      value={formData.installationDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, installationDate: e.target.value }))}
                      className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block">Servis Berikutnya</label>
                    <input
                      id="add-asset-nextservice"
                      type="date"
                      value={formData.nextService}
                      onChange={(e) => setFormData(prev => ({ ...prev, nextService: e.target.value }))}
                      className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                </div>

                {/* Initial Status */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block">Status Operasional Pertama</label>
                  <select
                    id="add-asset-status"
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                    className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-sky-500 cursor-pointer"
                  >
                    <option value="Normal">Normal (Berfungsi Baik)</option>
                    <option value="Butuh Servis">Butuh Servis (Kotor/Kurang Dingin)</option>
                    <option value="Dalam Perbaikan">Sedang Diperbaiki Mekanik</option>
                    <option value="Rusak">Rusak Total / Kompresor Mati</option>
                  </select>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                  <button
                    id="btn-add-asset-cancel"
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    id="btn-add-asset-submit"
                    type="submit"
                    className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-lg cursor-pointer transition-colors shadow-md shadow-sky-600/10"
                  >
                    Simpan Unit AC
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: Edit Aset */}
      <AnimatePresence>
        {isEditModalOpen && selectedAsset && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsEditModalOpen(false);
                setSelectedAsset(null);
              }}
              className="fixed inset-0 bg-black cursor-pointer"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl relative overflow-hidden z-10"
            >
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <h3 className="font-display font-bold text-slate-800 dark:text-white text-base">
                  Ubah Data Unit AC ({selectedAsset.id})
                </h3>
                <button
                  id="btn-close-edit-modal"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setSelectedAsset(null);
                  }}
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleEditAssetSubmit} className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
                {/* Name */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block">Nama Unit AC</label>
                  <input
                    id="edit-asset-name"
                    type="text"
                    required
                    value={selectedAsset.name}
                    onChange={(e) => setSelectedAsset(prev => prev ? ({ ...prev, name: e.target.value }) : null)}
                    className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                {/* Brand & Type */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block">Merek / Brand</label>
                    <select
                      id="edit-asset-brand"
                      value={selectedAsset.brand}
                      onChange={(e) => setSelectedAsset(prev => prev ? ({ ...prev, brand: e.target.value }) : null)}
                      className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-sky-500 cursor-pointer"
                    >
                      <option value="Daikin">Daikin</option>
                      <option value="Panasonic">Panasonic</option>
                      <option value="Sharp">Sharp</option>
                      <option value="LG">LG</option>
                      <option value="Mitsubishi">Mitsubishi</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block">Tipe Model</label>
                    <select
                      id="edit-asset-type"
                      value={selectedAsset.type}
                      onChange={(e) => setSelectedAsset(prev => prev ? ({ ...prev, type: e.target.value as any }) : null)}
                      className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-sky-500 cursor-pointer"
                    >
                      <option value="Split">Split</option>
                      <option value="Cassette">Cassette</option>
                      <option value="Standing">Standing</option>
                      <option value="VRV">VRV (Sistem Sentral)</option>
                    </select>
                  </div>
                </div>

                {/* Location */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block">Lokasi Unit</label>
                  <input
                    id="edit-asset-location"
                    type="text"
                    required
                    value={selectedAsset.location}
                    onChange={(e) => setSelectedAsset(prev => prev ? ({ ...prev, location: e.target.value }) : null)}
                    className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                {/* PK Power Capacity & Serial Number */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block">Kapasitas PK</label>
                    <input
                      id="edit-asset-pk"
                      type="number"
                      step="0.5"
                      min="0.5"
                      max="15"
                      required
                      value={selectedAsset.powerPK}
                      onChange={(e) => setSelectedAsset(prev => prev ? ({ ...prev, powerPK: parseFloat(e.target.value) }) : null)}
                      className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block">Serial Number (S/N)</label>
                    <input
                      id="edit-asset-sn"
                      type="text"
                      required
                      value={selectedAsset.serialNumber}
                      onChange={(e) => setSelectedAsset(prev => prev ? ({ ...prev, serialNumber: e.target.value }) : null)}
                      className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                </div>

                {/* Last service, Installation, next service dates */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-slate-600 dark:text-slate-400 block">Tanggal Pasang</label>
                    <input
                      id="edit-asset-install"
                      type="date"
                      value={selectedAsset.installationDate}
                      onChange={(e) => setSelectedAsset(prev => prev ? ({ ...prev, installationDate: e.target.value }) : null)}
                      className="w-full px-2 py-1.5 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-lg text-[11px] text-slate-800 dark:text-slate-100 focus:outline-hidden"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-slate-600 dark:text-slate-400 block">Terakhir Servis</label>
                    <input
                      id="edit-asset-lastservice"
                      type="date"
                      value={selectedAsset.lastService}
                      onChange={(e) => setSelectedAsset(prev => prev ? ({ ...prev, lastService: e.target.value }) : null)}
                      className="w-full px-2 py-1.5 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-lg text-[11px] text-slate-800 dark:text-slate-100 focus:outline-hidden"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-slate-600 dark:text-slate-400 block">Servis Berikutnya</label>
                    <input
                      id="edit-asset-nextservice"
                      type="date"
                      value={selectedAsset.nextService}
                      onChange={(e) => setSelectedAsset(prev => prev ? ({ ...prev, nextService: e.target.value }) : null)}
                      className="w-full px-2 py-1.5 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-lg text-[11px] text-slate-800 dark:text-slate-100 focus:outline-hidden"
                    />
                  </div>
                </div>

                {/* Status */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block">Status Operasional Unit</label>
                  <select
                    id="edit-asset-status"
                    value={selectedAsset.status}
                    onChange={(e) => setSelectedAsset(prev => prev ? ({ ...prev, status: e.target.value as any }) : null)}
                    className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-sky-500 cursor-pointer"
                  >
                    <option value="Normal">Normal (Berfungsi Baik)</option>
                    <option value="Butuh Servis">Butuh Servis (Kotor/Kurang Dingin)</option>
                    <option value="Dalam Perbaikan">Sedang Diperbaiki Mekanik</option>
                    <option value="Rusak">Rusak Total / Kompresor Mati</option>
                  </select>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                  <button
                    id="btn-edit-asset-cancel"
                    type="button"
                    onClick={() => {
                      setIsEditModalOpen(false);
                      setSelectedAsset(null);
                    }}
                    className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    id="btn-edit-asset-submit"
                    type="submit"
                    className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-lg cursor-pointer transition-colors shadow-md"
                  >
                    Simpan Perubahan
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

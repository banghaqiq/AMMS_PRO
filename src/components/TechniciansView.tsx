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
  User, 
  Phone, 
  Star, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  X, 
  Trash2, 
  Edit,
  ShieldAlert,
  Sliders,
  Send,
  Wrench
} from 'lucide-react';
import { Technician, WorkOrder } from '../types';

interface TechniciansViewProps {
  technicians: Technician[];
  setTechnicians: React.Dispatch<React.SetStateAction<Technician[]>>;
  workOrders: WorkOrder[];
}

export default function TechniciansView({
  technicians,
  setTechnicians,
  workOrders,
}: TechniciansViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  
  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTech, setSelectedTech] = useState<Technician | null>(null);

  // Form states
  const [formData, setFormData] = useState<Omit<Technician, 'id'>>({
    name: '',
    specialty: 'AC Split & Cassette',
    status: 'Tersedia',
    phone: '',
    rating: 4.5
  });

  // Filters
  const filteredTechs = technicians.filter((tech) => {
    const matchesSearch = 
      tech.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tech.specialty.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || tech.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Calculate technician's active job counts
  const getActiveJobsCount = (techId: string) => {
    return workOrders.filter(w => w.technicianId === techId && w.status !== 'Selesai').length;
  };

  const handleAddTechSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      alert('Nama Lengkap dan Nomor Telepon wajib diisi!');
      return;
    }

    const newId = `T-${String(technicians.length + 1).padStart(3, '0')}`;
    const newTech: Technician = {
      ...formData,
      id: newId,
    };

    setTechnicians(prev => [...prev, newTech]);
    setIsAddModalOpen(false);
    resetForm();
  };

  const handleEditTechSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTech) return;

    setTechnicians(prev => prev.map(t => t.id === selectedTech.id ? { ...selectedTech } : t));
    setIsEditModalOpen(false);
    setSelectedTech(null);
  };

  const handleDeleteTech = (id: string) => {
    const activeJobs = getActiveJobsCount(id);
    if (activeJobs > 0) {
      alert(`Tidak dapat menghapus teknisi ini. Saat ini ia memiliki ${activeJobs} perintah kerja aktif yang sedang berjalan.`);
      return;
    }

    if (confirm('Apakah Anda yakin ingin menonaktifkan akun teknisi ini dari database internal?')) {
      setTechnicians(prev => prev.filter(t => t.id !== id));
    }
  };

  const toggleTechStatus = (id: string, currentStatus: 'Tersedia' | 'Bertugas' | 'Offline') => {
    let nextStatus: 'Tersedia' | 'Bertugas' | 'Offline' = 'Tersedia';
    if (currentStatus === 'Tersedia') nextStatus = 'Offline';
    else if (currentStatus === 'Offline') nextStatus = 'Tersedia';
    else {
      // If busy (Bertugas), let user know
      if (!confirm('Teknisi sedang bertugas di lapangan. Yakin ingin mengubah statusnya secara manual?')) {
        return;
      }
      nextStatus = 'Tersedia';
    }

    setTechnicians(prev => prev.map(t => t.id === id ? { ...t, status: nextStatus } : t));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      specialty: 'AC Split & Cassette',
      status: 'Tersedia',
      phone: '',
      rating: 4.5
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Search & Filter Header bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
        
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            id="tech-search"
            type="text"
            placeholder="Cari mekanik berdasarkan nama, spesialisasi, keahlian..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-sky-500 text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              id="tech-filter-status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
            >
              <option value="All">Semua Ketersediaan</option>
              <option value="Tersedia">Tersedia (Standby)</option>
              <option value="Bertugas">Bertugas (Di Lapangan)</option>
              <option value="Offline">Offline</option>
            </select>
          </div>

          <button
            id="btn-add-tech"
            onClick={() => {
              resetForm();
              setIsAddModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-colors"
          >
            <Plus className="w-4.5 h-4.5" />
            Daftarkan Teknisi
          </button>

        </div>

      </div>

      {/* Grid of Technician Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredTechs.length === 0 ? (
          <div className="col-span-full p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
            <User className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto animate-bounce mb-3" />
            <p className="font-semibold text-slate-700 dark:text-slate-300">Teknisi Tidak Ditemukan</p>
            <p className="text-xs text-slate-400 mt-1">Sesuaikan filter status atau periksa kembali penulisan nama mekanik.</p>
          </div>
        ) : (
          filteredTechs.map((tech) => {
            const activeJobs = getActiveJobsCount(tech.id);
            const isStandby = tech.status === 'Tersedia';
            const isBusy = tech.status === 'Bertugas';

            return (
              <motion.div
                layout
                key={tech.id}
                whileHover={{ y: -3 }}
                className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs hover:shadow-md flex flex-col justify-between transition-all"
              >
                <div>
                  {/* Card Header: Avatar & Name */}
                  <div className="flex items-start gap-3.5">
                    {/* Avatar Initials Bubble */}
                    <div className="w-11 h-11 bg-slate-100 dark:bg-slate-800/80 rounded-xl flex items-center justify-center font-bold text-sky-600 dark:text-sky-400 text-sm flex-shrink-0 border border-slate-200/50 dark:border-slate-700/30">
                      {tech.name.split(' ').map(word => word[0]).join('').slice(0, 2).toUpperCase()}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-mono text-[9px] font-bold text-slate-400">
                          {tech.id}
                        </span>
                        
                        {/* Status Badge */}
                        <span className={`px-2 py-0.5 font-bold font-sans text-[9px] rounded-full flex items-center gap-1 ${
                          isStandby
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400'
                            : isBusy
                            ? 'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-400 animate-pulse'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}>
                          <span className={`w-1 h-1 rounded-full ${isStandby ? 'bg-emerald-500' : isBusy ? 'bg-sky-500' : 'bg-slate-400'}`} />
                          {tech.status}
                        </span>
                      </div>

                      <h4 className="font-display font-bold text-slate-800 dark:text-white text-base leading-snug mt-1 truncate">
                        {tech.name}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        {tech.specialty}
                      </p>
                    </div>
                  </div>

                  {/* Rating Stars & Quick stats */}
                  <div className="flex items-center justify-between bg-slate-50/50 dark:bg-slate-850/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800/30 mt-4 text-xs">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <strong className="text-slate-800 dark:text-slate-200">{tech.rating}</strong>
                      <span className="text-slate-400">/ 5.0</span>
                    </div>

                    <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                      <Wrench className="w-3.5 h-3.5 text-slate-400" />
                      <span>{activeJobs} WO Berjalan</span>
                    </div>
                  </div>

                  {/* Info list: phone number */}
                  <div className="mt-4 space-y-2 text-xs border-t border-slate-100 dark:border-slate-800/60 pt-3.5 text-slate-600 dark:text-slate-400">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-medium">Nomor Telepon:</span>
                      <a href={`tel:${tech.phone}`} className="font-mono text-slate-800 dark:text-slate-200 font-semibold hover:underline flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-sky-500" />
                        {tech.phone}
                      </a>
                    </div>
                  </div>
                </div>

                {/* Actions: toggle status, edit details, delete tech */}
                <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/60 mt-5 pt-3.5 gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      id={`btn-edit-tech-${tech.id}`}
                      onClick={() => {
                        setSelectedTech({ ...tech });
                        setIsEditModalOpen(true);
                      }}
                      className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-450 hover:text-sky-500 cursor-pointer"
                      title="Edit Profil"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      id={`btn-delete-tech-${tech.id}`}
                      onClick={() => handleDeleteTech(tech.id)}
                      className="p-2 hover:bg-rose-50 dark:hover:bg-rose-950/25 rounded-lg text-slate-450 hover:text-rose-500 cursor-pointer"
                      title="Hapus Teknisi"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Availability toggle switch */}
                  <button
                    id={`btn-toggle-availability-${tech.id}`}
                    onClick={() => toggleTechStatus(tech.id, tech.status)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-bold text-[10px] cursor-pointer transition-all ${
                      isStandby
                        ? 'bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/15 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/40'
                        : 'bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/15 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/40'
                    }`}
                  >
                    <Sliders className="w-3 h-3" />
                    <span>{isStandby ? 'Atur Off-Duty' : 'Atur On-Duty'}</span>
                  </button>

                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* MODAL 1: Tambah Teknisi Baru */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddModalOpen(false)}
              className="fixed inset-0 bg-black cursor-pointer"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md shadow-2xl relative overflow-hidden z-10"
            >
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <h3 className="font-display font-bold text-slate-800 dark:text-white text-base">
                  Daftarkan Akun Teknisi Lapangan
                </h3>
                <button
                  id="btn-close-add-modal"
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddTechSubmit} className="p-5 space-y-4">
                
                {/* Name */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block">
                    Nama Lengkap Mekanik <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="add-tech-name"
                    type="text"
                    required
                    placeholder="Contoh: Muhammad Yusuf"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                {/* Specialty */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block">Spesialisasi AC & Mekanikal</label>
                  <input
                    id="add-tech-specialty"
                    type="text"
                    required
                    placeholder="Contoh: VRV Central & Cassette System"
                    value={formData.specialty}
                    onChange={(e) => setFormData(prev => ({ ...prev, specialty: e.target.value }))}
                    className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                {/* Phone & Status */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block">
                      No. Telepon Aktif <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="add-tech-phone"
                      type="text"
                      required
                      placeholder="Contoh: 0812-XXXX-XXXX"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-sky-500 font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block">Ketersediaan</label>
                    <select
                      id="add-tech-status"
                      value={formData.status}
                      onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                      className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-hidden cursor-pointer"
                    >
                      <option value="Tersedia">Tersedia (On-Duty)</option>
                      <option value="Offline">Sedang Offline</option>
                    </select>
                  </div>
                </div>

                {/* Rating */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block">Rating Bintang Awal</label>
                  <input
                    id="add-tech-rating"
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={formData.rating}
                    onChange={(e) => setFormData(prev => ({ ...prev, rating: parseFloat(e.target.value) || 5.0 }))}
                    className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-hidden font-mono"
                  />
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                  <button
                    id="btn-add-tech-cancel"
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    Batal
                  </button>
                  <button
                    id="btn-add-tech-submit"
                    type="submit"
                    className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-lg shadow-md shadow-sky-600/10"
                  >
                    Daftarkan Akun
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: Edit Teknisi */}
      <AnimatePresence>
        {isEditModalOpen && selectedTech && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsEditModalOpen(false);
                setSelectedTech(null);
              }}
              className="fixed inset-0 bg-black cursor-pointer"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md shadow-2xl relative overflow-hidden z-10"
            >
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <h3 className="font-display font-bold text-slate-800 dark:text-white text-base">
                  Ubah Profil Teknisi ({selectedTech.id})
                </h3>
                <button
                  id="btn-close-edit-modal"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setSelectedTech(null);
                  }}
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleEditTechSubmit} className="p-5 space-y-4">
                
                {/* Name */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block">Nama Lengkap</label>
                  <input
                    id="edit-tech-name"
                    type="text"
                    required
                    value={selectedTech.name}
                    onChange={(e) => setSelectedTech(prev => prev ? ({ ...prev, name: e.target.value }) : null)}
                    className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-hidden"
                  />
                </div>

                {/* Specialty */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block">Spesialisasi Keahlian</label>
                  <input
                    id="edit-tech-specialty"
                    type="text"
                    required
                    value={selectedTech.specialty}
                    onChange={(e) => setSelectedTech(prev => prev ? ({ ...prev, specialty: e.target.value }) : null)}
                    className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-hidden"
                  />
                </div>

                {/* Phone & Status */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block">No. Telepon</label>
                    <input
                      id="edit-tech-phone"
                      type="text"
                      required
                      value={selectedTech.phone}
                      onChange={(e) => setSelectedTech(prev => prev ? ({ ...prev, phone: e.target.value }) : null)}
                      className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-hidden font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block">Status Akun</label>
                    <select
                      id="edit-tech-status"
                      value={selectedTech.status}
                      onChange={(e) => setSelectedTech(prev => prev ? ({ ...prev, status: e.target.value as any }) : null)}
                      className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-hidden cursor-pointer"
                    >
                      <option value="Tersedia">Tersedia (Standby)</option>
                      <option value="Bertugas">Bertugas (Di Lapangan)</option>
                      <option value="Offline">Offline</option>
                    </select>
                  </div>
                </div>

                {/* Rating */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block">Rating Kinerja</label>
                  <input
                    id="edit-tech-rating"
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={selectedTech.rating}
                    onChange={(e) => setSelectedTech(prev => prev ? ({ ...prev, rating: parseFloat(e.target.value) || 4.5 }) : null)}
                    className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-hidden font-mono"
                  />
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                  <button
                    id="btn-edit-tech-cancel"
                    type="button"
                    onClick={() => {
                      setIsEditModalOpen(false);
                      setSelectedTech(null);
                    }}
                    className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    Batal
                  </button>
                  <button
                    id="btn-edit-tech-submit"
                    type="submit"
                    className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-lg shadow-md"
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

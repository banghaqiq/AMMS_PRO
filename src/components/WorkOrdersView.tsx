/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Search, 
  Filter, 
  Wrench, 
  User, 
  Calendar, 
  Clock, 
  TrendingUp, 
  DollarSign, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  X,
  Check,
  ChevronRight,
  MapPin,
  Tag
} from 'lucide-react';
import { WorkOrder, ACAsset, Technician } from '../types';

interface WorkOrdersViewProps {
  workOrders: WorkOrder[];
  setWorkOrders: React.Dispatch<React.SetStateAction<WorkOrder[]>>;
  assets: ACAsset[];
  setAssets: React.Dispatch<React.SetStateAction<ACAsset[]>>;
  technicians: Technician[];
  setAlerts: React.Dispatch<React.SetStateAction<any[]>>;
  refData?: { assetId: string; title: string };
  onClearPrefill?: () => void;
}

export default function WorkOrdersView({
  workOrders,
  setWorkOrders,
  assets,
  setAssets,
  technicians,
  setAlerts,
  refData,
  onClearPrefill,
}: WorkOrdersViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedWO, setSelectedWO] = useState<WorkOrder | null>(null);

  // Form state for creating WO
  const [newWOTitle, setNewWOTitle] = useState('');
  const [newWOAssetId, setNewWOAssetId] = useState('');
  const [newWOTechId, setNewWOTechId] = useState('');
  const [newWOPriority, setNewWOPriority] = useState<'Rendah' | 'Sedang' | 'Tinggi'>('Sedang');
  const [newWODesc, setNewWODesc] = useState('');
  const [newWOCost, setNewWOCost] = useState<number>(150000);

  // Auto-fill from external tab trigger (e.g., clicking "Jadwal Servis" on Assets view)
  useEffect(() => {
    if (refData && refData.assetId) {
      setNewWOAssetId(refData.assetId);
      setNewWOTitle(refData.title);
      setNewWOPriority('Sedang');
      setNewWODesc(`Pekerjaan pemeliharaan preventif yang dipicu langsung dari tab Manajemen Unit AC untuk unit ID ${refData.assetId}.`);
      setIsAddModalOpen(true);
      
      if (onClearPrefill) {
        onClearPrefill();
      }
    }
  }, [refData, onClearPrefill]);

  // Filter calculation
  const filteredWOs = workOrders.filter((wo) => {
    const asset = assets.find(a => a.id === wo.assetId);
    const tech = technicians.find(t => t.id === wo.technicianId);
    
    const matchesSearch = 
      wo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wo.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (asset && asset.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (tech && tech.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'All' || wo.status === statusFilter;
    const matchesPriority = priorityFilter === 'All' || wo.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Calculate dynamic stats
  const totalWOsCount = workOrders.length;
  const pendingCount = workOrders.filter(w => w.status === 'Menunggu').length;
  const progressCount = workOrders.filter(w => w.status === 'Diproses').length;
  const finishedCount = workOrders.filter(w => w.status === 'Selesai').length;

  const totalExpense = workOrders
    .filter(w => w.status === 'Selesai')
    .reduce((sum, current) => sum + (current.cost || 0), 0);

  // Format currency helper
  const formatIDR = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  // Status transitions
  const advanceWOStatus = (wo: WorkOrder) => {
    let nextStatus: 'Menunggu' | 'Diproses' | 'Selesai' = 'Menunggu';
    let alertMessage = '';
    let updatedAssetStatus: any = undefined;

    if (wo.status === 'Menunggu') {
      nextStatus = 'Diproses';
      alertMessage = `Surat Tugas "${wo.title}" telah diproses oleh teknisi.`;
      // Update asset status as "Dalam Perbaikan"
      updatedAssetStatus = 'Dalam Perbaikan';
    } else if (wo.status === 'Diproses') {
      nextStatus = 'Selesai';
      alertMessage = `Tugas Pemeliharaan "${wo.title}" telah SELESAI dikerjakan.`;
      // Update asset status back to "Normal"
      updatedAssetStatus = 'Normal';
    } else {
      return; // Already completed
    }

    // Update Work Order
    setWorkOrders(prev => prev.map(w => {
      if (w.id === wo.id) {
        return { 
          ...w, 
          status: nextStatus,
          completedAt: nextStatus === 'Selesai' ? new Date().toISOString().split('T')[0] : w.completedAt
        };
      }
      return w;
    }));

    // Update Asset Status
    if (updatedAssetStatus) {
      setAssets(prev => prev.map(a => {
        if (a.id === wo.assetId) {
          return { 
            ...a, 
            status: updatedAssetStatus,
            lastService: nextStatus === 'Selesai' ? new Date().toISOString().split('T')[0] : a.lastService,
            nextService: nextStatus === 'Selesai' ? new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : a.nextService
          };
        }
        return a;
      }));
    }

    // Generate System Alert
    const newAlert = {
      id: `AL-${String(Date.now()).slice(-4)}`,
      severity: nextStatus === 'Selesai' ? 'info' : 'warning',
      message: alertMessage,
      timestamp: 'Baru saja',
      isRead: false,
      assetId: wo.assetId
    };
    setAlerts(prev => [newAlert, ...prev]);
  };

  const handleAddWOSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWOTitle || !newWOAssetId) {
      alert('Judul Tugas dan Unit AC wajib dipilih!');
      return;
    }

    const newId = `WO-${String(workOrders.length + 101).padStart(3, '0')}`;
    const newWO: WorkOrder = {
      id: newId,
      title: newWOTitle,
      assetId: newWOAssetId,
      technicianId: newWOTechId || undefined,
      priority: newWOPriority,
      status: 'Menunggu',
      createdAt: new Date().toISOString().split('T')[0],
      description: newWODesc,
      cost: newWOCost,
    };

    // If assigned immediately, trigger status update or keep awaiting
    setWorkOrders(prev => [newWO, ...prev]);

    // Also update AC asset status if priority is High
    if (newWOPriority === 'Tinggi') {
      setAssets(prev => prev.map(a => {
        if (a.id === newWOAssetId) {
          return { ...a, status: 'Butuh Servis' };
        }
        return a;
      }));
    }

    setIsAddModalOpen(false);
    clearForm();
  };

  const handleEditWOSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWO) return;

    setWorkOrders(prev => prev.map(w => w.id === selectedWO.id ? { ...selectedWO } : w));
    setIsEditModalOpen(false);
    setSelectedWO(null);
  };

  const handleDeleteWO = (id: string) => {
    if (confirm('Hapus Surat Tugas Perintah Kerja ini dari sistem?')) {
      setWorkOrders(prev => prev.filter(w => w.id !== id));
    }
  };

  const clearForm = () => {
    setNewWOTitle('');
    setNewWOAssetId('');
    setNewWOTechId('');
    setNewWOPriority('Sedang');
    setNewWODesc('');
    setNewWOCost(150000);
  };

  return (
    <div className="space-y-6">
      
      {/* Dynamic Summary Cards for Work Orders */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* Pending */}
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block">
            Antrean Menunggu
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl md:text-2xl font-display font-extrabold text-amber-500">
              {pendingCount}
            </span>
            <span className="text-xs text-slate-400">WO</span>
          </div>
        </div>

        {/* In progress */}
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block">
            Sedang Dikerjakan
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl md:text-2xl font-display font-extrabold text-sky-500">
              {progressCount}
            </span>
            <span className="text-xs text-slate-400">Unit AC</span>
          </div>
        </div>

        {/* Selesai */}
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block">
            Berhasil Selesai
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl md:text-2xl font-display font-extrabold text-emerald-500">
              {finishedCount}
            </span>
            <span className="text-xs text-slate-400">Tugas</span>
          </div>
        </div>

        {/* Expenses */}
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block">
            Biaya Servis Selesai
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-sm md:text-base font-mono font-bold text-slate-800 dark:text-slate-200 truncate block max-w-full">
              {formatIDR(totalExpense)}
            </span>
          </div>
        </div>

      </div>

      {/* Control bar: Search, Filter, Add */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
        
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            id="wo-search"
            type="text"
            placeholder="Cari tugas, nama AC, teknisi bertugas, spesifikasi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-sky-500 text-slate-800 dark:text-slate-100 transition-all placeholder:text-slate-400"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Status filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              id="wo-filter-status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
            >
              <option value="All">Semua Status</option>
              <option value="Menunggu">Menunggu</option>
              <option value="Diproses">Diproses</option>
              <option value="Selesai">Selesai</option>
            </select>
          </div>

          {/* Priority filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <Tag className="w-4 h-4 text-slate-400" />
            <select
              id="wo-filter-priority"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
            >
              <option value="All">Semua Prioritas</option>
              <option value="Tinggi">Tinggi</option>
              <option value="Sedang">Sedang</option>
              <option value="Rendah">Rendah</option>
            </select>
          </div>

          {/* Add WO Button */}
          <button
            id="btn-add-wo"
            onClick={() => {
              clearForm();
              setIsAddModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-colors"
          >
            <Plus className="w-4.5 h-4.5" />
            Buat Perintah Kerja
          </button>

        </div>

      </div>

      {/* Main List layout of Work Orders */}
      <div className="space-y-3.5">
        {filteredWOs.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
            <Wrench className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto animate-bounce mb-3" />
            <p className="font-semibold text-slate-700 dark:text-slate-300">Tidak Ada Perintah Kerja</p>
            <p className="text-xs text-slate-400 mt-1">Gunakan tombol "Buat Perintah Kerja" untuk menerbitkan tugas perawatan AC baru.</p>
          </div>
        ) : (
          filteredWOs.map((wo) => {
            const asset = assets.find(a => a.id === wo.assetId);
            const tech = technicians.find(t => t.id === wo.technicianId);

            const isHigh = wo.priority === 'Tinggi';
            const isMedium = wo.priority === 'Sedang';

            return (
              <motion.div
                layout
                key={wo.id}
                className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all hover:border-slate-300 dark:hover:border-slate-700"
              >
                {/* Left block: Title, Asset, Technician info */}
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-md">
                      {wo.id}
                    </span>
                    <span className={`px-2 py-0.5 font-bold text-[9px] uppercase rounded-md ${
                      isHigh
                        ? 'bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 font-bold'
                        : isMedium
                        ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}>
                      Prioritas: {wo.priority}
                    </span>
                    <span className={`px-2.5 py-0.5 font-bold text-[9px] uppercase rounded-full ${
                      wo.status === 'Selesai'
                        ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400'
                        : wo.status === 'Diproses'
                        ? 'bg-sky-100 dark:bg-sky-950/50 text-sky-700 dark:text-sky-400'
                        : 'bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400'
                    }`}>
                      {wo.status}
                    </span>
                  </div>

                  <h4 className="font-display font-bold text-slate-850 dark:text-white text-base md:text-lg leading-tight truncate">
                    {wo.title}
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Wrench className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span className="font-semibold text-slate-700 dark:text-slate-300 truncate">
                        {asset?.name || 'Aset Tidak Terdaftar'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 min-w-0">
                      <User className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span className="truncate">
                        Teknisi: <strong className="text-slate-700 dark:text-slate-300">{tech?.name || 'Belum Ditunjuk'}</strong>
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span>Dibuat: {wo.createdAt}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 italic bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-xl border border-dashed border-slate-100 dark:border-slate-800">
                    "{wo.description}"
                  </p>
                </div>

                {/* Right block: Action buttons to advance state */}
                <div className="flex items-center gap-3 w-full md:w-auto justify-end border-t md:border-t-0 border-slate-100 dark:border-slate-800 pt-3 md:pt-0">
                  
                  {/* Expense cost display */}
                  {wo.cost && (
                    <div className="hidden lg:flex flex-col text-right mr-2">
                      <span className="text-[10px] text-slate-400 uppercase font-medium">Estimasi Biaya</span>
                      <span className="text-xs font-bold font-mono text-slate-800 dark:text-slate-200">
                        {formatIDR(wo.cost)}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-1.5">
                    <button
                      id={`btn-edit-wo-${wo.id}`}
                      onClick={() => {
                        setSelectedWO({ ...wo });
                        setIsEditModalOpen(true);
                      }}
                      className="px-3 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold text-xs rounded-xl cursor-pointer transition-colors"
                    >
                      Ubah
                    </button>
                    <button
                      id={`btn-delete-wo-${wo.id}`}
                      onClick={() => handleDeleteWO(wo.id)}
                      className="p-2 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-slate-400 hover:text-rose-500 rounded-xl transition-colors cursor-pointer"
                      title="Hapus Tugas"
                    >
                      X
                    </button>
                  </div>

                  {wo.status !== 'Selesai' ? (
                    <button
                      id={`btn-advance-status-${wo.id}`}
                      onClick={() => advanceWOStatus(wo)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow-md shadow-sky-600/10 transition-colors cursor-pointer"
                    >
                      <span>
                        {wo.status === 'Menunggu' ? 'Mulai Kerjakan' : 'Selesaikan Tugas'}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <div className="flex items-center gap-1 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-150 dark:border-emerald-950/40 rounded-xl font-bold text-xs">
                      <Check className="w-3.5 h-3.5" />
                      Selesai
                    </div>
                  )}

                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* MODAL 1: Tambah Perintah Kerja Baru */}
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
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl relative overflow-hidden z-10 animate-in fade-in"
            >
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <h3 className="font-display font-bold text-slate-800 dark:text-white text-base">
                  Penerbitan Surat Perintah Kerja AC
                </h3>
                <button
                  id="btn-close-add-modal"
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddWOSubmit} className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
                
                {/* Title */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block">
                    Judul Tugas / Perbaikan <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="add-wo-title"
                    type="text"
                    required
                    placeholder="Contoh: Overhaul Kondensor Outdoor AC Server"
                    value={newWOTitle}
                    onChange={(e) => setNewWOTitle(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                {/* Target Asset Selection */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block">
                    Pilih Unit AC yang Diservis <span className="text-rose-500">*</span>
                  </label>
                  <select
                    id="add-wo-asset"
                    required
                    value={newWOAssetId}
                    onChange={(e) => setNewWOAssetId(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-hidden cursor-pointer"
                  >
                    <option value="">-- Pilih Unit AC --</option>
                    {assets.map(a => (
                      <option key={a.id} value={a.id}>
                        [{a.id}] {a.name} ({a.location}) - Status: {a.status}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Technician & Priority */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block">Tugaskan Teknisi</label>
                    <select
                      id="add-wo-tech"
                      value={newWOTechId}
                      onChange={(e) => setNewWOTechId(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-hidden cursor-pointer"
                    >
                      <option value="">-- Hubungi Teknisi Nanti --</option>
                      {technicians.map(t => (
                        <option key={t.id} value={t.id}>
                          {t.name} ({t.specialty}) - {t.status}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block">Prioritas Penanganan</label>
                    <select
                      id="add-wo-priority"
                      value={newWOPriority}
                      onChange={(e) => setNewWOPriority(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-hidden cursor-pointer"
                    >
                      <option value="Rendah">Rendah (Servis Bulanan)</option>
                      <option value="Sedang">Sedang (Kurang Dingin/Kotor)</option>
                      <option value="Tinggi">Tinggi (Bocor/Mati Total)</option>
                    </select>
                  </div>
                </div>

                {/* Cost Estimation */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block">Estimasi Biaya Suku Cadang/Servis (IDR)</label>
                  <input
                    id="add-wo-cost"
                    type="number"
                    min="0"
                    value={newWOCost}
                    onChange={(e) => setNewWOCost(parseInt(e.target.value) || 0)}
                    className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-hidden font-mono"
                  />
                </div>

                {/* Description Details */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block">Deskripsi Detail Keluhan & Suku Cadang</label>
                  <textarea
                    id="add-wo-desc"
                    rows={3}
                    placeholder="Contoh: Unit mengeluarkan hembusan angin hangat. Perlu dicuci kondensor outdoor, bersihkan filter debu, dan isi tekanan freon."
                    value={newWODesc}
                    onChange={(e) => setNewWODesc(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-hidden"
                  />
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                  <button
                    id="btn-add-wo-cancel"
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    id="btn-add-wo-submit"
                    type="submit"
                    className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-lg cursor-pointer transition-colors shadow-md shadow-sky-600/10"
                  >
                    Terbitkan Surat WO
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: Edit Perintah Kerja */}
      <AnimatePresence>
        {isEditModalOpen && selectedWO && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsEditModalOpen(false);
                setSelectedWO(null);
              }}
              className="fixed inset-0 bg-black cursor-pointer"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl relative overflow-hidden z-10"
            >
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <h3 className="font-display font-bold text-slate-800 dark:text-white text-base">
                  Ubah Surat Perintah Kerja ({selectedWO.id})
                </h3>
                <button
                  id="btn-close-edit-modal"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setSelectedWO(null);
                  }}
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleEditWOSubmit} className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
                
                {/* Title */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block">Judul Tugas / Perbaikan</label>
                  <input
                    id="edit-wo-title"
                    type="text"
                    required
                    value={selectedWO.title}
                    onChange={(e) => setSelectedWO(prev => prev ? ({ ...prev, title: e.target.value }) : null)}
                    className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                {/* Technician & Priority */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block">Ubah Teknisi</label>
                    <select
                      id="edit-wo-tech"
                      value={selectedWO.technicianId || ''}
                      onChange={(e) => setSelectedWO(prev => prev ? ({ ...prev, technicianId: e.target.value || undefined }) : null)}
                      className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-hidden cursor-pointer"
                    >
                      <option value="">-- Belum Ditugaskan --</option>
                      {technicians.map(t => (
                        <option key={t.id} value={t.id}>
                          {t.name} ({t.specialty})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block">Ubah Prioritas</label>
                    <select
                      id="edit-wo-priority"
                      value={selectedWO.priority}
                      onChange={(e) => setSelectedWO(prev => prev ? ({ ...prev, priority: e.target.value as any }) : null)}
                      className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-hidden cursor-pointer"
                    >
                      <option value="Rendah">Rendah (Servis Bulanan)</option>
                      <option value="Sedang">Sedang (Kurang Dingin/Kotor)</option>
                      <option value="Tinggi">Tinggi (Bocor/Mati Total)</option>
                    </select>
                  </div>
                </div>

                {/* Cost */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block">Revisi Biaya Perawatan (IDR)</label>
                  <input
                    id="edit-wo-cost"
                    type="number"
                    min="0"
                    value={selectedWO.cost || 0}
                    onChange={(e) => setSelectedWO(prev => prev ? ({ ...prev, cost: parseInt(e.target.value) || 0 }) : null)}
                    className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-hidden font-mono"
                  />
                </div>

                {/* Status */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block">Status Surat Perintah Kerja</label>
                  <select
                    id="edit-wo-status"
                    value={selectedWO.status}
                    onChange={(e) => setSelectedWO(prev => prev ? ({ ...prev, status: e.target.value as any }) : null)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-hidden cursor-pointer"
                  >
                    <option value="Menunggu">Menunggu</option>
                    <option value="Diproses">Diproses</option>
                    <option value="Selesai">Selesai</option>
                  </select>
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block">Ubah Deskripsi Penugasan</label>
                  <textarea
                    id="edit-wo-desc"
                    rows={3}
                    value={selectedWO.description}
                    onChange={(e) => setSelectedWO(prev => prev ? ({ ...prev, description: e.target.value }) : null)}
                    className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-hidden"
                  />
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                  <button
                    id="btn-edit-wo-cancel"
                    type="button"
                    onClick={() => {
                      setIsEditModalOpen(false);
                      setSelectedWO(null);
                    }}
                    className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    id="btn-edit-wo-submit"
                    type="submit"
                    className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-lg cursor-pointer transition-colors"
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

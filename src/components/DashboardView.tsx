/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Wind, 
  Wrench, 
  Users, 
  Activity, 
  ArrowUpRight, 
  AlertOctagon, 
  Plus, 
  Calendar, 
  UserPlus, 
  TrendingUp, 
  MapPin, 
  Settings,
  X,
  FileSpreadsheet
} from 'lucide-react';
import { ACAsset, Technician, WorkOrder, SystemAlert, TabType } from '../types';

interface DashboardViewProps {
  assets: ACAsset[];
  technicians: Technician[];
  workOrders: WorkOrder[];
  alerts: SystemAlert[];
  setActiveTab: (tab: TabType) => void;
  onQuickAddAsset: () => void;
  onQuickAddWorkOrder: () => void;
  onQuickAddTechnician: () => void;
}

export default function DashboardView({
  assets,
  technicians,
  workOrders,
  alerts,
  setActiveTab,
  onQuickAddAsset,
  onQuickAddWorkOrder,
  onQuickAddTechnician,
}: DashboardViewProps) {
  const [hoveredChartBar, setHoveredChartBar] = useState<number | null>(null);
  
  // Calculate stats dynamically
  const totalAssets = assets.length;
  const activeWOs = workOrders.filter(wo => wo.status !== 'Selesai').length;
  const availableTechs = technicians.filter(t => t.status === 'Tersedia').length;
  
  const normalAssets = assets.filter(a => a.status === 'Normal').length;
  const butuhServisAssets = assets.filter(a => a.status === 'Butuh Servis').length;
  const perbaikanAssets = assets.filter(a => a.status === 'Dalam Perbaikan').length;
  const rusakAssets = assets.filter(a => a.status === 'Rusak').length;

  const uptimePercentage = totalAssets > 0 
    ? Math.round(((normalAssets + butuhServisAssets) / totalAssets) * 1000) / 10 
    : 100;

  // SVG Chart Mock Data
  const weeklyCosts = [
    { day: 'Senin', cost: 150000, count: 2 },
    { day: 'Selasa', cost: 450000, count: 3 },
    { day: 'Rabu', cost: 180000, count: 1 },
    { day: 'Kamis', cost: 0, count: 0 },
    { day: 'Jumat', cost: 1250000, count: 2 },
    { day: 'Sabtu', cost: 350000, count: 1 },
    { day: 'Minggu', cost: 150000, count: 1 },
  ];

  const maxCost = Math.max(...weeklyCosts.map(d => d.cost), 1);

  // Format currency
  const formatIDR = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  const getRecentWOs = () => {
    return [...workOrders]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 4);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="space-y-6"
    >
      {/* 4 Core Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        
        {/* Total Assets */}
        <motion.div 
          whileHover={{ y: -4 }}
          onClick={() => setActiveTab('assets')}
          className="p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-xs hover:shadow-md cursor-pointer flex items-center justify-between transition-all"
        >
          <div className="space-y-2">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium tracking-wide uppercase">
              Total Unit AC
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl md:text-3xl font-display font-bold text-slate-800 dark:text-white">
                {totalAssets}
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500">Unit</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>{normalAssets} unit status normal</span>
            </div>
          </div>
          <div className="p-3 bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 rounded-xl">
            <Wind className="w-6 h-6" />
          </div>
        </motion.div>

        {/* Active Work Orders */}
        <motion.div 
          whileHover={{ y: -4 }}
          onClick={() => setActiveTab('work-orders')}
          className="p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-xs hover:shadow-md cursor-pointer flex items-center justify-between transition-all"
        >
          <div className="space-y-2">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium tracking-wide uppercase">
              Perintah Kerja Aktif
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl md:text-3xl font-display font-bold text-slate-800 dark:text-white">
                {activeWOs}
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500">Tugas</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-amber-600 dark:text-amber-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              <span>{workOrders.filter(w => w.status === 'Menunggu').length} antrean pending</span>
            </div>
          </div>
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-xl">
            <Wrench className="w-6 h-6" />
          </div>
        </motion.div>

        {/* Available Technicians */}
        <motion.div 
          whileHover={{ y: -4 }}
          onClick={() => setActiveTab('technicians')}
          className="p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-xs hover:shadow-md cursor-pointer flex items-center justify-between transition-all"
        >
          <div className="space-y-2">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium tracking-wide uppercase">
              Teknisi Standby
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl md:text-3xl font-display font-bold text-slate-800 dark:text-white">
                {availableTechs}
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500">Orang</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-sky-600 dark:text-sky-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
              <span>Dari {technicians.length} teknisi terdaftar</span>
            </div>
          </div>
          <div className="p-3 bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
        </motion.div>

        {/* Operating Efficiency Rate */}
        <motion.div 
          whileHover={{ y: -4 }}
          className="p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-xs hover:shadow-md flex items-center justify-between transition-all"
        >
          <div className="space-y-2">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium tracking-wide uppercase">
              Rasio Operasional AC
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl md:text-3xl font-display font-bold text-slate-800 dark:text-white">
                {uptimePercentage}%
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500">Sehat</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Standar keandalan prima</span>
            </div>
          </div>
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl">
            <Activity className="w-6 h-6 animate-pulse" />
          </div>
        </motion.div>

      </div>

      {/* Main Grid: Charts, Logs, Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2/3: High-Fidelity Interactive SVG Analytics Charts */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Cost History Custom SVG Chart */}
          <div className="p-5 md:p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <h3 className="font-display font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-sky-500" />
                  Grafik Pembiayaan Perawatan Mingguan
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Total pengeluaran & frekuensi perbaikan unit AC</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <span className="w-3 h-3 bg-sky-500 rounded-xs" />
                  Biaya (IDR)
                </span>
                <span className="text-xs font-semibold px-2.5 py-1 bg-sky-50 dark:bg-sky-950/30 text-sky-600 dark:text-sky-400 rounded-lg">
                  7 Hari Terakhir
                </span>
              </div>
            </div>

            {/* Custom Responsive SVG Bar Chart */}
            <div className="relative w-full h-64 pt-6 select-none">
              <svg className="w-full h-full" viewBox="0 0 600 200" preserveAspectRatio="none">
                {/* Y-Axis Grid Lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
                  const y = 20 + ratio * 140;
                  const value = formatIDR(maxCost * (1 - ratio));
                  return (
                    <g key={idx}>
                      <line 
                        x1="60" 
                        y1={y} 
                        x2="580" 
                        y2={y} 
                        className="stroke-slate-100 dark:stroke-slate-800/60" 
                        strokeWidth="1" 
                        strokeDasharray="4 4"
                      />
                      <text 
                        x="50" 
                        y={y + 4} 
                        className="fill-slate-400 dark:fill-slate-500 font-mono text-[9px] text-right" 
                        textAnchor="end"
                      >
                        {value}
                      </text>
                    </g>
                  );
                })}

                {/* Bars rendering with spring motion simulator */}
                {weeklyCosts.map((data, idx) => {
                  const barWidth = 45;
                  const spacing = 72;
                  const x = 80 + idx * spacing;
                  const barHeight = (data.cost / maxCost) * 140;
                  const y = 160 - barHeight;
                  const isHovered = hoveredChartBar === idx;

                  return (
                    <g 
                      key={idx}
                      onMouseEnter={() => setHoveredChartBar(idx)}
                      onMouseLeave={() => setHoveredChartBar(null)}
                      className="cursor-pointer group"
                    >
                      {/* Interactive hover background column */}
                      <rect
                        x={x - 10}
                        y="15"
                        width={barWidth + 20}
                        height="150"
                        className="fill-transparent group-hover:fill-slate-50/50 dark:group-hover:fill-slate-800/15"
                        rx="8"
                      />
                      {/* Active data bar */}
                      <rect
                        x={x}
                        y={y}
                        width={barWidth}
                        height={Math.max(barHeight, 4)} // Ensure at least a line is visible
                        className={`${
                          isHovered 
                            ? 'fill-sky-500 dark:fill-sky-400' 
                            : 'fill-sky-600/80 dark:fill-sky-500/80'
                        } transition-colors`}
                        rx="4"
                      />
                      {/* Task count indicator on top of the bar */}
                      {data.count > 0 && (
                        <text
                          x={x + barWidth / 2}
                          y={y - 8}
                          className="fill-sky-600 dark:fill-sky-400 font-mono text-[10px] font-bold text-center"
                          textAnchor="middle"
                        >
                          {data.count} WO
                        </text>
                      )}
                      {/* X-Axis labels */}
                      <text
                        x={x + barWidth / 2}
                        y="182"
                        className="fill-slate-600 dark:fill-slate-400 font-sans text-[11px] font-medium"
                        textAnchor="middle"
                      >
                        {data.day}
                      </text>
                    </g>
                  );
                })}
                
                {/* Base horizontal X axis line */}
                <line x1="60" y1="162" x2="580" y2="162" className="stroke-slate-200 dark:stroke-slate-800" strokeWidth="1" />
              </svg>

              {/* Float popover details */}
              {hoveredChartBar !== null && (
                <div 
                  className="absolute p-3 bg-slate-900 text-white rounded-lg shadow-xl border border-slate-800 text-xs font-sans pointer-events-none"
                  style={{
                    left: `${Math.min(hoveredChartBar * 74 + 75, 420)}px`,
                    top: '20px'
                  }}
                >
                  <p className="font-bold text-slate-400">{weeklyCosts[hoveredChartBar].day}</p>
                  <p className="mt-1 font-semibold">Pengeluaran: <span className="text-sky-400">{formatIDR(weeklyCosts[hoveredChartBar].cost)}</span></p>
                  <p className="text-[10px] text-slate-400">Total {weeklyCosts[hoveredChartBar].count} unit AC diservis</p>
                </div>
              )}
            </div>
          </div>

          {/* Bottom row: Asset Status Donut Analysis + Recent Work Orders */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            {/* Asset Status Distribution Donut Representation */}
            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="font-display font-bold text-slate-800 dark:text-white text-sm">
                  Komposisi Status Unit AC
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Status operasional aset gedung</p>
              </div>

              {/* Gorgeous custom SVG pie/donut simulation */}
              <div className="flex items-center justify-around py-4">
                <div className="relative w-28 h-28 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    {/* Circle placeholders */}
                    <circle cx="18" cy="18" r="15.915" className="fill-transparent stroke-slate-100 dark:stroke-slate-800" strokeWidth="3" />
                    {/* Normal status circle segment (green) */}
                    <circle 
                      cx="18" cy="18" r="15.915" 
                      className="fill-transparent stroke-emerald-500" 
                      strokeWidth="3.2" 
                      strokeDasharray={`${totalAssets > 0 ? (normalAssets/totalAssets)*100 : 0} ${100 - (totalAssets > 0 ? (normalAssets/totalAssets)*100 : 0)}`}
                      strokeDashoffset="0"
                    />
                    {/* Butuh Servis segment (yellow) */}
                    <circle 
                      cx="18" cy="18" r="15.915" 
                      className="fill-transparent stroke-amber-500" 
                      strokeWidth="3.2" 
                      strokeDasharray={`${totalAssets > 0 ? (butuhServisAssets/totalAssets)*100 : 0} ${100 - (totalAssets > 0 ? (butuhServisAssets/totalAssets)*100 : 0)}`}
                      strokeDashoffset={`-${(normalAssets/totalAssets)*100}`}
                    />
                    {/* Perbaikan segment (blue) */}
                    <circle 
                      cx="18" cy="18" r="15.915" 
                      className="fill-transparent stroke-sky-500" 
                      strokeWidth="3.2" 
                      strokeDasharray={`${totalAssets > 0 ? (perbaikanAssets/totalAssets)*100 : 0} ${100 - (totalAssets > 0 ? (perbaikanAssets/totalAssets)*100 : 0)}`}
                      strokeDashoffset={`-${((normalAssets+butuhServisAssets)/totalAssets)*100}`}
                    />
                    {/* Rusak segment (red) */}
                    <circle 
                      cx="18" cy="18" r="15.915" 
                      className="fill-transparent stroke-rose-500" 
                      strokeWidth="3.2" 
                      strokeDasharray={`${totalAssets > 0 ? (rusakAssets/totalAssets)*100 : 0} ${100 - (totalAssets > 0 ? (rusakAssets/totalAssets)*100 : 0)}`}
                      strokeDashoffset={`-${((normalAssets+butuhServisAssets+perbaikanAssets)/totalAssets)*100}`}
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center">
                    <span className="font-display font-extrabold text-slate-800 dark:text-white text-lg">
                      {totalAssets}
                    </span>
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest leading-none">
                      Total
                    </span>
                  </div>
                </div>

                {/* Status legends */}
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span className="text-slate-600 dark:text-slate-400">Normal ({normalAssets})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <span className="text-slate-600 dark:text-slate-400">Servis ({butuhServisAssets})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                    <span className="text-slate-600 dark:text-slate-400">Perbaikan ({perbaikanAssets})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    <span className="text-slate-600 dark:text-slate-400">Rusak ({rusakAssets})</span>
                  </div>
                </div>
              </div>
            </div>

            {/* List of Recent Work Orders */}
            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2 mb-2">
                <div>
                  <h3 className="font-display font-bold text-slate-800 dark:text-white text-sm">
                    Tugas Perbaikan Terbaru
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Status perintah kerja lapangan</p>
                </div>
                <button
                  id="btn-all-work-orders"
                  onClick={() => setActiveTab('work-orders')}
                  className="text-xs text-sky-600 hover:text-sky-500 font-semibold cursor-pointer"
                >
                  Lihat Semua
                </button>
              </div>

              <div className="space-y-2.5 flex-1 mt-2">
                {getRecentWOs().map((wo) => {
                  const asset = assets.find(a => a.id === wo.assetId);
                  return (
                    <div key={wo.id} className="flex items-center justify-between p-2 rounded-xl bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100/50 dark:border-slate-800/20">
                      <div className="min-w-0">
                        <p className="font-sans font-semibold text-xs text-slate-800 dark:text-slate-200 truncate" title={wo.title}>
                          {wo.title}
                        </p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                          {asset?.name || 'Aset Tidak Dikenal'} • {wo.createdAt}
                        </p>
                      </div>
                      <span className={`px-2.5 py-0.5 font-sans font-bold text-[9px] rounded-full flex-shrink-0 ${
                        wo.status === 'Selesai'
                          ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400'
                          : wo.status === 'Diproses'
                          ? 'bg-sky-100 dark:bg-sky-950/50 text-sky-700 dark:text-sky-400'
                          : 'bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400'
                      }`}>
                        {wo.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

        </div>

        {/* Right 1/3: Quick Actions & Live System Alerts Panel */}
        <div className="space-y-6">
          
          {/* Quick Action Bento Panel */}
          <div className="p-5 bg-gradient-to-tr from-slate-900 via-slate-950 to-slate-900 border border-slate-800 text-slate-100 rounded-2xl shadow-xl space-y-4">
            <div>
              <h3 className="font-display font-bold text-white text-base flex items-center gap-2">
                <Settings className="w-5 h-5 text-sky-400 animate-spin" style={{ animationDuration: '6s' }} />
                Aksi Cepat Supervisor
              </h3>
              <p className="text-xs text-slate-400">Instruksi langsung untuk kru lapangan</p>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {/* Add New AC */}
              <button
                id="quick-add-ac"
                onClick={onQuickAddAsset}
                className="w-full flex items-center justify-between p-3.5 bg-slate-800/50 hover:bg-slate-800 text-left rounded-xl transition-all border border-slate-800 hover:border-slate-700 cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-sky-500/10 text-sky-400 rounded-lg group-hover:scale-105 transition-transform">
                    <Plus className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white leading-none">Registrasi AC Baru</p>
                    <p className="text-[10px] text-slate-400 mt-1">Masukkan unit AC yang baru dipasang</p>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
              </button>

              {/* Create Work Order */}
              <button
                id="quick-add-wo"
                onClick={onQuickAddWorkOrder}
                className="w-full flex items-center justify-between p-3.5 bg-slate-800/50 hover:bg-slate-800 text-left rounded-xl transition-all border border-slate-800 hover:border-slate-700 cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg group-hover:scale-105 transition-transform">
                    <Wrench className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white leading-none">Terbitkan Surat Tugas</p>
                    <p className="text-[10px] text-slate-400 mt-1">Buat tugas perbaikan/cuci AC baru</p>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
              </button>

              {/* Add Technician */}
              <button
                id="quick-add-tech"
                onClick={onQuickAddTechnician}
                className="w-full flex items-center justify-between p-3.5 bg-slate-800/50 hover:bg-slate-800 text-left rounded-xl transition-all border border-slate-800 hover:border-slate-700 cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg group-hover:scale-105 transition-transform">
                    <UserPlus className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white leading-none">Tambah Teknisi Baru</p>
                    <p className="text-[10px] text-slate-400 mt-1">Daftarkan mekanik kontraktor/pegawai</p>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
              </button>
            </div>
          </div>

          {/* Alert Logs Panel */}
          <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display font-bold text-slate-800 dark:text-white text-sm flex items-center gap-2">
                  <AlertOctagon className="w-4.5 h-4.5 text-rose-500 animate-bounce" />
                  Log Alergi Aktif
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Suhu overheat & malfungsi real-time</p>
              </div>
            </div>

            <div className="space-y-3 max-h-[290px] overflow-y-auto pr-1">
              {alerts.length === 0 ? (
                <div className="p-8 text-center text-slate-400 dark:text-slate-500">
                  <p className="text-xs font-semibold">Tidak ada peringatan terdeteksi</p>
                  <p className="text-[10px] mt-1">Suhu operasional seluruh gedung terjaga aman.</p>
                </div>
              ) : (
                alerts.map((alert) => {
                  return (
                    <div 
                      key={alert.id}
                      className={`p-3.5 rounded-xl border flex flex-col justify-between gap-1.5 transition-all ${
                        alert.severity === 'critical'
                          ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-100 dark:border-rose-950/50'
                          : alert.severity === 'warning'
                          ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-100 dark:border-amber-950/50'
                          : 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-100 dark:border-blue-950/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`px-2 py-0.5 font-bold font-mono text-[9px] uppercase rounded-md ${
                          alert.severity === 'critical'
                            ? 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300'
                            : alert.severity === 'warning'
                            ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300'
                            : 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
                        }`}>
                          {alert.severity}
                        </span>
                        <span className="text-[9px] font-mono text-slate-400 dark:text-slate-500">
                          {alert.timestamp}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-normal">
                        {alert.message}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>

      </div>
    </motion.div>
  );
}

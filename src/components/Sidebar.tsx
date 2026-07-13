/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  Wind, 
  Wrench, 
  Users, 
  BarChart3, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  X,
  ShieldCheck
} from 'lucide-react';
import { TabType } from '../types';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  isCollapsed,
  setIsCollapsed,
  isMobileOpen,
  setIsMobileOpen,
}: SidebarProps) {
  
  const menuItems = [
    { id: 'dashboard', name: 'Beranda', icon: LayoutDashboard, desc: 'Ringkasan sistem & metriks' },
    { id: 'assets', name: 'Daftar Aset AC', icon: Wind, desc: 'Pemantauan unit air conditioner' },
    { id: 'work-orders', name: 'Perintah Kerja', icon: Wrench, desc: 'Pengelolaan tugas & reparasi' },
    { id: 'technicians', name: 'Kelola Teknisi', icon: Users, desc: 'Status & jadwal kru lapangan' },
    { id: 'analytics', name: 'Laporan & Analitik', icon: BarChart3, desc: 'Efisiensi energi & analisis biaya' },
    { id: 'settings', name: 'Pengaturan', icon: Settings, desc: 'Konfigurasi sistem & batas alarm' },
  ] as const;

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-slate-900 text-slate-100 border-r border-slate-800 shadow-xl select-none">
      {/* Brand Logo Header */}
      <div className="p-5 flex items-center justify-between border-b border-slate-800/80">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="p-2.5 bg-sky-600 text-white rounded-xl shadow-md shadow-sky-500/20 flex-shrink-0">
            <Wind className="w-6 h-6 animate-pulse" />
          </div>
          {!isCollapsed && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col"
            >
              <span className="font-display font-bold text-lg leading-tight tracking-wide text-white bg-gradient-to-r from-sky-400 to-indigo-300 bg-clip-text text-transparent">
                AMMS PRO
              </span>
              <span className="text-[10px] text-slate-400 tracking-widest font-medium uppercase">
                Asset Control
              </span>
            </motion.div>
          )}
        </div>

        {/* Desktop Collapse Button */}
        <button
          id="btn-sidebar-collapse"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden md:flex p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>

      {/* Main Navigation Menu */}
      <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;

          return (
            <button
              id={`nav-item-${item.id}`}
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setIsMobileOpen(false); // Close drawer on mobile click
              }}
              className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-left transition-all relative group cursor-pointer ${
                isActive
                  ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/15'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              {/* Highlight bar for inactive on hover, or active indicator */}
              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-white rounded-r-md"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}
              
              <Icon className={`w-5.5 h-5.5 flex-shrink-0 transition-transform duration-300 group-hover:scale-105 ${
                isActive ? 'text-white' : 'text-slate-400 group-hover:text-sky-400'
              }`} />
              
              {!isCollapsed && (
                <div className="flex flex-col overflow-hidden">
                  <span className="font-sans font-medium text-sm leading-none">
                    {item.name}
                  </span>
                  <span className={`text-[10px] mt-0.5 font-normal truncate opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                    isActive ? 'text-sky-100' : 'text-slate-500'
                  }`}>
                    {item.desc}
                  </span>
                </div>
              )}

              {/* Tooltip on Collapsed */}
              {isCollapsed && (
                <div className="absolute left-16 scale-0 group-hover:scale-100 bg-slate-950 text-white text-xs font-medium px-3 py-2 rounded-lg shadow-xl border border-slate-800 pointer-events-none transition-transform duration-200 origin-left z-50 whitespace-nowrap">
                  <p className="font-bold">{item.name}</p>
                  <p className="text-[10px] text-slate-400">{item.desc}</p>
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Branding Info */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/40 text-center">
        {!isCollapsed ? (
          <div className="flex flex-col items-center justify-center gap-1">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Sistem Berjalan Normal</span>
            </div>
            <span className="text-[10px] text-slate-500 mt-1">
              AMMS Pro v2.4.0 • Standar ISO 9001
            </span>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" title="Sistem Sehat" />
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside 
        className={`hidden md:block h-screen flex-shrink-0 transition-all duration-300 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        <SidebarContent />
      </aside>

      {/* Mobile Drawer (AnimatePresence) */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="fixed inset-0 bg-black z-40 md:hidden cursor-pointer"
            />
            {/* Slide-out Sidebar */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="fixed top-0 bottom-0 left-0 w-72 z-50 md:hidden"
            >
              <div className="h-full relative">
                <SidebarContent />
                {/* Floating Close Button on Drawer */}
                <button
                  id="btn-sidebar-close"
                  onClick={() => setIsMobileOpen(false)}
                  className="absolute top-4 -right-12 p-2 bg-slate-900 text-white rounded-r-lg border-y border-r border-slate-800 shadow-md hover:text-sky-400 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

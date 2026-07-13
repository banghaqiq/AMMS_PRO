/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Menu, 
  Bell, 
  Sun, 
  Moon, 
  Search, 
  Clock, 
  Check, 
  AlertTriangle,
  Info,
  ChevronDown,
  User,
  LogOut,
  Sliders
} from 'lucide-react';
import { SystemAlert, TabType } from '../types';

interface HeaderProps {
  activeTab: TabType;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  alerts: SystemAlert[];
  setAlerts: React.Dispatch<React.SetStateAction<SystemAlert[]>>;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

export default function Header({
  activeTab,
  darkMode,
  setDarkMode,
  alerts,
  setAlerts,
  isMobileOpen,
  setIsMobileOpen,
}: HeaderProps) {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const getTabTitle = (tab: TabType) => {
    switch (tab) {
      case 'dashboard':
        return { main: 'Pusat Kendali', sub: 'Ringkasan performa & telemetri sistem AC' };
      case 'assets':
        return { main: 'Manajemen Unit AC', sub: 'Pemantauan inventaris, lokasi & status unit AC' };
      case 'work-orders':
        return { main: 'Perintah Kerja', sub: 'Penugasan reparasi & servis preventif teknisi' };
      case 'technicians':
        return { main: 'Database Teknisi', sub: 'Kelola status ketersediaan & jadwal mekanik' };
      case 'analytics':
        return { main: 'Laporan Analitikal', sub: 'Analisis konsumsi listrik, COP, & grafik biaya' };
      case 'settings':
        return { main: 'Konfigurasi AMMS', sub: 'Atur batas parameter operasional & siklus alarm' };
      default:
        return { main: 'AMMS Pro Dashboard', sub: 'Sistem Manajemen Aset Terpadu' };
    }
  };

  const { main, sub } = getTabTitle(activeTab);
  const unreadAlerts = alerts.filter(a => !a.isRead);

  const markAllAlertsAsRead = () => {
    setAlerts(prev => prev.map(a => ({ ...a, isRead: true })));
  };

  const markAlertAsRead = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, isRead: true } : a));
  };

  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return date.toLocaleDateString('id-ID', options);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WIB';
  };

  return (
    <header className="sticky top-0 z-30 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 md:px-6 py-4 flex items-center justify-between shadow-xs transition-colors duration-200">
      
      {/* Left section: Breadcrumbs / Title */}
      <div className="flex items-center gap-3">
        {/* Mobile menu trigger */}
        <button
          id="btn-mobile-sidebar"
          onClick={() => setIsMobileOpen(true)}
          className="md:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>

        <div className="flex flex-col">
          <h1 className="font-display font-bold text-lg md:text-xl text-slate-800 dark:text-white leading-tight">
            {main}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-normal hidden sm:block mt-0.5">
            {sub}
          </p>
        </div>
      </div>

      {/* Right section: Actions (Clock, Dark Mode, Alert Bell, Profile) */}
      <div className="flex items-center gap-2 sm:gap-4">
        
        {/* Real-Time Clock Widget */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 rounded-xl font-mono text-xs text-slate-600 dark:text-slate-300">
          <Clock className="w-4 h-4 text-sky-500" />
          <span className="font-medium">{formatDate(currentTime)}</span>
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <span className="font-bold text-slate-800 dark:text-slate-200">{formatTime(currentTime)}</span>
        </div>

        {/* Dark Mode Switch */}
        <button
          id="btn-toggle-dark-mode"
          onClick={() => setDarkMode(!darkMode)}
          className="p-2.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer transition-all active:scale-95 border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
          title={darkMode ? "Aktifkan Mode Terang" : "Aktifkan Mode Gelap"}
        >
          {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-600" />}
        </button>

        {/* Alerts Center Bell with Interactive Dropdown */}
        <div className="relative">
          <button
            id="btn-alerts-bell"
            onClick={() => {
              setIsAlertOpen(!isAlertOpen);
              setIsProfileOpen(false);
            }}
            className="p-2.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer transition-all active:scale-95 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 relative"
            title="Pusat Alarm AMMS"
          >
            <Bell className="w-5 h-5" />
            {unreadAlerts.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-[10px] font-bold text-white flex items-center justify-center rounded-full animate-bounce ring-2 ring-white dark:ring-slate-900">
                {unreadAlerts.length}
              </span>
            )}
          </button>

          {isAlertOpen && (
            <>
              {/* Backscreen overlay to close */}
              <div className="fixed inset-0 z-40" onClick={() => setIsAlertOpen(false)} />
              
              {/* Dropdown Menu */}
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden transform origin-top-right transition-all">
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-sky-500" />
                    <span className="font-semibold text-slate-800 dark:text-white text-sm">Notifikasi Alarm</span>
                  </div>
                  {unreadAlerts.length > 0 && (
                    <button
                      id="btn-mark-all-read"
                      onClick={markAllAlertsAsRead}
                      className="text-xs text-sky-600 hover:text-sky-500 font-medium cursor-pointer"
                    >
                      Tandai semua dibaca
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                  {alerts.length === 0 ? (
                    <div className="p-6 text-center text-slate-500 dark:text-slate-400">
                      <p className="text-sm font-medium">Semua lancar!</p>
                      <p className="text-xs mt-1">Tidak ada alert sistem aktif saat ini.</p>
                    </div>
                  ) : (
                    alerts.map((alert) => {
                      const isUnread = !alert.isRead;
                      return (
                        <div 
                          key={alert.id} 
                          className={`p-3.5 flex gap-3 transition-colors ${
                            isUnread ? 'bg-sky-50/40 dark:bg-sky-950/20' : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                          }`}
                        >
                          <div className="flex-shrink-0 mt-0.5">
                            {alert.severity === 'critical' ? (
                              <div className="p-1.5 bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-lg">
                                <AlertTriangle className="w-4 h-4" />
                              </div>
                            ) : alert.severity === 'warning' ? (
                              <div className="p-1.5 bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-lg">
                                <AlertTriangle className="w-4 h-4" />
                              </div>
                            ) : (
                              <div className="p-1.5 bg-sky-100 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 rounded-lg">
                                <Info className="w-4 h-4" />
                              </div>
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs text-slate-700 dark:text-slate-200 leading-normal ${isUnread ? 'font-semibold' : 'font-normal'}`}>
                              {alert.message}
                            </p>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-1">
                              {alert.timestamp}
                            </span>
                          </div>

                          {isUnread && (
                            <button
                              id={`btn-mark-read-${alert.id}`}
                              onClick={(e) => markAlertAsRead(alert.id, e)}
                              className="p-1 text-slate-400 hover:text-sky-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md self-center transition-colors cursor-pointer"
                              title="Tandai selesai"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 text-center">
                  <p className="text-[10px] text-slate-500">
                    Menampilkan {alerts.length} rekaman alarm terakhir
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Divider */}
        <span className="h-6 w-px bg-slate-200 dark:bg-slate-800" />

        {/* User Account / Profile Dropdown */}
        <div className="relative">
          <button
            id="btn-profile-dropdown"
            onClick={() => {
              setIsProfileOpen(!isProfileOpen);
              setIsAlertOpen(false);
            }}
            className="flex items-center gap-2 p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer select-none"
          >
            <div className="w-9 h-9 bg-gradient-to-tr from-sky-500 to-indigo-600 text-white font-bold rounded-xl flex items-center justify-center shadow-md shadow-indigo-500/10">
              AD
            </div>
            <div className="hidden md:flex flex-col text-left mr-1">
              <span className="font-sans font-semibold text-xs text-slate-800 dark:text-slate-200 leading-tight">
                Admin AMMS
              </span>
              <span className="text-[10px] text-slate-500 font-normal">
                Supervisor Utama
              </span>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-500 hidden md:block" />
          </button>

          {isProfileOpen && (
            <>
              {/* Backscreen overlay to close */}
              <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)} />
              
              {/* Profile Menu Dropdown */}
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl z-50 overflow-hidden">
                <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 text-center sm:text-left">
                  <p className="font-semibold text-sm text-slate-800 dark:text-white">Admin AMMS</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">admin@amms.co.id</p>
                  <span className="inline-block mt-2 px-2.5 py-0.5 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-bold text-[10px] rounded-full">
                    Sistem: Aktif
                  </span>
                </div>

                <div className="p-1.5 space-y-0.5">
                  <button
                    id="btn-profile-settings"
                    onClick={() => {
                      setIsProfileOpen(false);
                      // Let's redirect to settings tab or trigger dummy modal
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                  >
                    <Sliders className="w-4 h-4 text-slate-400" />
                    Profil & Keamanan
                  </button>
                  <button
                    id="btn-logout"
                    onClick={() => {
                      setIsProfileOpen(false);
                      alert("Demo mode: Sesi admin tidak dapat dimatikan.");
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 cursor-pointer transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Keluar Sistem
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

      </div>
    </header>
  );
}

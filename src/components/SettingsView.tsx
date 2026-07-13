/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Settings, 
  BellRing, 
  ShieldAlert, 
  RefreshCw, 
  Wrench, 
  Check, 
  Thermometer, 
  Sliders, 
  Wifi, 
  HelpCircle,
  Database
} from 'lucide-react';

interface SettingsViewProps {
  onSimulateOverheat: () => void;
  onResetCache: () => void;
}

export default function SettingsView({
  onSimulateOverheat,
  onResetCache,
}: SettingsViewProps) {
  // Local state for toggles
  const [cycleDays, setCycleDays] = useState<number>(180);
  const [maxTemp, setMaxTemp] = useState<number>(26);
  const [enableEmail, setEnableEmail] = useState<boolean>(true);
  const [enableSound, setEnableSound] = useState<boolean>(false);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="grid grid-cols-1 lg:grid-cols-3 gap-6"
    >
      
      {/* Left 2/3: Main Settings Form */}
      <form onSubmit={handleSaveSettings} className="lg:col-span-2 p-5 md:p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-6">
        
        {/* Section 1: Maintenance parameters */}
        <div className="space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 dark:border-slate-800">
            <Sliders className="w-5 h-5 text-sky-500" />
            <h3 className="font-display font-bold text-slate-850 dark:text-white text-base">
              Konfigurasi Siklus Pemeliharaan AC
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Days cycle */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block">Siklus Servis Rutin (Hari)</label>
              <input
                id="setting-cycle-days"
                type="number"
                min="30"
                max="365"
                value={cycleDays}
                onChange={(e) => setCycleDays(parseInt(e.target.value) || 180)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-hidden"
              />
              <span className="text-[10px] text-slate-400 block">Jeda alarm otomatis AC butuh servis berkala</span>
            </div>

            {/* Overheat Temp trigger */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block">Batas Suhu Maksimal Server Room (°C)</label>
              <div className="flex items-center gap-2">
                <input
                  id="setting-max-temp"
                  type="number"
                  min="16"
                  max="35"
                  value={maxTemp}
                  onChange={(e) => setMaxTemp(parseInt(e.target.value) || 26)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-hidden font-mono"
                />
                <span className="text-xs text-slate-400 font-semibold">°C</span>
              </div>
              <span className="text-[10px] text-slate-400 block">Memicu alarm overheat darurat di dasbor</span>
            </div>
          </div>
        </div>

        {/* Section 2: Notifications Switches */}
        <div className="space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 dark:border-slate-800">
            <BellRing className="w-5 h-5 text-sky-500" />
            <h3 className="font-display font-bold text-slate-850 dark:text-white text-base">
              Saluran Alarm & Notifikasi
            </h3>
          </div>

          <div className="space-y-3">
            {/* Switch 1: Email alerts */}
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-850/40 rounded-xl border border-slate-100 dark:border-slate-800/20">
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Kirim Email Laporan Otomatis</p>
                <p className="text-[10px] text-slate-400">Kirim daftar rincian WO bulanan ke manajer operasional</p>
              </div>
              <button
                id="toggle-email-setting"
                type="button"
                onClick={() => setEnableEmail(!enableEmail)}
                className={`w-11 h-6 rounded-full p-1 transition-colors focus:outline-hidden ${enableEmail ? 'bg-sky-600' : 'bg-slate-300 dark:bg-slate-700'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${enableEmail ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>

            {/* Switch 2: Sound alerts */}
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-850/40 rounded-xl border border-slate-100 dark:border-slate-800/20">
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Suara Kritis (Sound Effect)</p>
                <p className="text-[10px] text-slate-400">Bunyikan sirene pendek pada browser jika suhu overheat terdeteksi</p>
              </div>
              <button
                id="toggle-sound-setting"
                type="button"
                onClick={() => setEnableSound(!enableSound)}
                className={`w-11 h-6 rounded-full p-1 transition-colors focus:outline-hidden ${enableSound ? 'bg-sky-600' : 'bg-slate-300 dark:bg-slate-700'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${enableSound ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
          <div>
            {isSaved && (
              <span className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                <Check className="w-4 h-4" />
                Konfigurasi disimpan berhasil!
              </span>
            )}
          </div>
          <button
            id="btn-save-settings"
            type="submit"
            className="px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-colors"
          >
            Simpan Konfigurasi
          </button>
        </div>

      </form>

      {/* Right 1/3: Simulated Testing & Cache Utilities */}
      <div className="space-y-6">
        
        {/* Simulation Bento Panel */}
        <div className="p-5 bg-gradient-to-tr from-slate-900 via-slate-950 to-slate-900 border border-slate-800 text-white rounded-2xl shadow-xl space-y-4">
          <div>
            <span className="inline-block px-2.5 py-0.5 bg-amber-500/10 text-amber-400 font-mono font-bold text-[9px] uppercase rounded-md mb-2">
              Lingkungan Simulasi Sandbox
            </span>
            <h3 className="font-display font-bold text-white text-base flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-400" />
              Alat Penguji Sistem
            </h3>
            <p className="text-xs text-slate-400 leading-normal">
              Gunakan kontrol di bawah untuk mensimulasikan malfungsi darurat AC guna menguji respons alarm dasbor secara real-time.
            </p>
          </div>

          <button
            id="btn-simulate-overheat"
            type="button"
            onClick={onSimulateOverheat}
            className="w-full flex items-center justify-center gap-2.5 py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-600/10 cursor-pointer transition-transform duration-100 active:scale-98"
          >
            <Thermometer className="w-4.5 h-4.5 animate-pulse" />
            Simulasikan Overheat (AC-005)
          </button>

          <p className="text-[10px] text-slate-500 italic text-center">
            *Menekan tombol ini akan memicu alarm status kritis baru pada header lonceng notifikasi & panel alert dasbor.
          </p>
        </div>

        {/* Cache & Data Reset Box */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-4">
          <div>
            <h3 className="font-display font-bold text-slate-800 dark:text-white text-sm">
              Perawatan Database AMMS
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Setel ulang seluruh input penambahan aset ke bawaan pabrik</p>
          </div>

          <button
            id="btn-reset-cache"
            type="button"
            onClick={onResetCache}
            className="w-full flex items-center justify-center gap-2 py-2.5 border border-dashed border-rose-200 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-600 dark:text-rose-400 font-bold text-xs rounded-xl cursor-pointer transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Reset Database & Singkirkan Aset Baru
          </button>

          <p className="text-[10px] text-slate-400 text-center leading-normal">
            Aksi ini akan menghapus semua unit AC, perintah kerja, dan teknisi baru yang telah Anda tambahkan dan mengembalikannya ke mock bawaan.
          </p>
        </div>

      </div>

    </motion.div>
  );
}

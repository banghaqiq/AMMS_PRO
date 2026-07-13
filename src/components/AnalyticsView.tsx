/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  BarChart3, 
  TrendingUp, 
  BatteryCharging, 
  Activity, 
  Lightbulb, 
  DollarSign, 
  Zap, 
  Sparkles, 
  HelpCircle,
  Clock,
  Gauge
} from 'lucide-react';
import { ACAsset, WorkOrder } from '../types';

interface AnalyticsViewProps {
  assets: ACAsset[];
  workOrders: WorkOrder[];
}

export default function AnalyticsView({
  assets,
  workOrders,
}: AnalyticsViewProps) {
  // Calculator State
  const [pkInput, setPkInput] = useState<number>(1.5);
  const [hoursInput, setHoursInput] = useState<number>(10);
  const [rateInput, setRateInput] = useState<number>(1444.7); // Standard PLN rate (IDR/kWh)
  const [isClean, setIsClean] = useState<boolean>(true);

  // Compute stats
  const totalAssets = assets.length;
  const finishedWOs = workOrders.filter(w => w.status === 'Selesai');
  const totalRepairCost = finishedWOs.reduce((sum, current) => sum + (current.cost || 0), 0);
  const avgRepairCost = finishedWOs.length > 0 ? Math.round(totalRepairCost / finishedWOs.length) : 0;

  // Estimate energy saved through cleaning
  // A dirty AC loses 15% efficiency. Cleaning saves ~15% power!
  const estKwhSavedMonthly = assets.filter(a => a.status === 'Normal').length * 24.5; 
  const estMoneySavedMonthly = estKwhSavedMonthly * rateInput;

  // COP / ROI Calculator Formula
  // 1 PK ~= 735 Watts. 
  // Under poor heat rejection (dirty filter/condenser), power draw increases by ~15-20%.
  // Monthly savings = PK * 0.735 kW * hours/day * 30 days * 0.15 efficiency_loss * rate
  const computeMonthlySavings = () => {
    const powerKw = pkInput * 0.735;
    const monthlyKwhUncleaned = powerKw * hoursInput * 30 * 1.18; // 18% extra draw
    const monthlyKwhCleaned = powerKw * hoursInput * 30;
    const savingsKwh = monthlyKwhUncleaned - monthlyKwhCleaned;
    const savingsCost = savingsKwh * rateInput;
    return {
      savingsKwh: Math.round(savingsKwh),
      savingsCost: Math.round(savingsCost),
      carbonReduced: Math.round(savingsKwh * 0.85 * 10) / 10 // 0.85 kg CO2 per kWh
    };
  };

  const calcResult = computeMonthlySavings();

  // Format IDR Helper
  const formatIDR = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="space-y-6"
    >
      
      {/* Dynamic Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Estimasi Energi Diselamatkan */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase block tracking-wider">
              Estimasi Energi Terselamatkan
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-mono font-bold text-sky-600 dark:text-sky-400">
                {Math.round(estKwhSavedMonthly)}
              </span>
              <span className="text-xs text-slate-400 font-bold">kWh / Bulan</span>
            </div>
            <p className="text-[10px] text-slate-400">Dari pembersihan & cuci berkala</p>
          </div>
          <div className="p-3 bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 rounded-xl">
            <Zap className="w-6 h-6 animate-pulse" />
          </div>
        </div>

        {/* Biaya Rata-Rata Perbaikan */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase block tracking-wider">
              Rata-Rata Biaya Servis
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg md:text-xl font-mono font-bold text-slate-800 dark:text-slate-200">
                {formatIDR(avgRepairCost)}
              </span>
              <span className="text-xs text-slate-400">/ WO</span>
            </div>
            <p className="text-[10px] text-slate-400">Dihitung dari {finishedWOs.length} WO selesai</p>
          </div>
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-xl">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Total Cost Savings */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase block tracking-wider">
              Penghematan Anggaran Listrik
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg md:text-xl font-mono font-bold text-emerald-600 dark:text-emerald-400">
                {formatIDR(estMoneySavedMonthly)}
              </span>
              <span className="text-xs text-slate-400">/ Bulan</span>
            </div>
            <p className="text-[10px] text-slate-400">Efisiensi kompresor pasca servis</p>
          </div>
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl">
            <BatteryCharging className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Charts & ROI Calculator section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* SVG Energy chart and location breakdown */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Energy Efficiency Comparison Chart */}
          <div className="p-5 md:p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-4">
            <div>
              <h3 className="font-display font-bold text-slate-800 dark:text-white text-base flex items-center gap-2">
                <Gauge className="w-5 h-5 text-sky-500" />
                Tren Konsumsi Energi & Kehilangan Efisiensi
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Perbandingan daya tersedot sebelum vs sesudah overhaul cuci filter</p>
            </div>

            {/* Custom SVG Line comparison Chart */}
            <div className="w-full h-56 pt-2">
              <svg className="w-full h-full" viewBox="0 0 500 180" preserveAspectRatio="none">
                {/* Horizontal grid lines */}
                {[0, 0.5, 1].map((ratio, idx) => {
                  const y = 20 + ratio * 120;
                  return (
                    <line 
                      key={idx} 
                      x1="40" 
                      y1={y} 
                      x2="480" 
                      y2={y} 
                      className="stroke-slate-100 dark:stroke-slate-800" 
                      strokeWidth="1" 
                    />
                  );
                })}

                {/* Line 1 (Dirty/Dirty - Red/Amber) */}
                <path
                  d="M 50 140 Q 120 130 200 90 T 350 110 T 450 70"
                  fill="none"
                  className="stroke-amber-500/50"
                  strokeWidth="3.5"
                  strokeDasharray="5 3"
                />

                {/* Line 2 (Optimized Clean - Emerald) */}
                <path
                  d="M 50 110 Q 120 90 200 60 T 350 70 T 450 40"
                  fill="none"
                  className="stroke-sky-500"
                  strokeWidth="4"
                  strokeLinecap="round"
                />

                {/* Legend points */}
                <circle cx="50" cy="110" r="5" className="fill-sky-500 ring-4 ring-white" />
                <circle cx="200" cy="60" r="5" className="fill-sky-500 ring-4 ring-white" />
                <circle cx="350" cy="70" r="5" className="fill-sky-500 ring-4 ring-white" />
                <circle cx="450" cy="40" r="5" className="fill-sky-500 ring-4 ring-white" />

                {/* X Axis Labels */}
                <text x="50" y="165" className="fill-slate-400 font-mono text-[9px]" textAnchor="middle">Maret</text>
                <text x="200" y="165" className="fill-slate-400 font-mono text-[9px]" textAnchor="middle">April</text>
                <text x="350" y="165" className="fill-slate-400 font-mono text-[9px]" textAnchor="middle">Mei</text>
                <text x="450" y="165" className="fill-slate-400 font-mono text-[9px]" textAnchor="middle">Juni</text>
              </svg>
            </div>

            <div className="flex items-center gap-4 text-xs font-medium justify-center border-t border-slate-100 dark:border-slate-800/60 pt-3">
              <span className="flex items-center gap-1.5 text-slate-500">
                <span className="w-3 h-3 bg-amber-500 rounded-full" />
                Daya Kotor (Suhu tidak stabil)
              </span>
              <span className="flex items-center gap-1.5 text-slate-500">
                <span className="w-3 h-3 bg-sky-500 rounded-full" />
                Daya Optimal (Rasio COP 3.8+)
              </span>
            </div>
          </div>

          {/* Breakdown issue frequency by brand */}
          <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
            <h3 className="font-display font-bold text-slate-800 dark:text-white text-sm mb-4">
              Frekuensi Gangguan Berdasarkan Lokasi Unit
            </h3>
            
            <div className="space-y-3">
              {[
                { location: 'Gedung A - Ruang Server (Suhu Kritis)', percentage: 85, count: 5, color: 'bg-rose-500' },
                { location: 'Gedung A - Lantai 1, Lobby (Beban Tinggi)', percentage: 60, count: 3, color: 'bg-amber-500' },
                { location: 'Gedung B - Lantai 3, Ruang HRD (Sering Mati)', percentage: 40, count: 2, color: 'bg-sky-500' },
                { location: 'Gedung A - R. Rapat Utama (Melewati Jadwal)', percentage: 25, count: 1, color: 'bg-slate-400' },
              ].map((item, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{item.location}</span>
                    <span className="text-slate-500 font-mono font-medium">{item.count} Perintah Kerja</span>
                  </div>
                  {/* Progress track */}
                  <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${item.color} rounded-full transition-all duration-1000`}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right 1/3: Interactive COP & ROI Saving Calculator */}
        <div className="p-5 md:p-6 bg-slate-900 border border-slate-800 text-white rounded-2xl shadow-xl space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-sky-500/10 text-sky-400 font-bold font-mono text-[9px] uppercase rounded-md mb-2">
                <Sparkles className="w-3 h-3" />
                AMMS Intelligence
              </span>
              <h3 className="font-display font-bold text-lg text-white flex items-center gap-2">
                <Gauge className="w-5 h-5 text-sky-400" />
                Estimator Hemat Listrik
              </h3>
              <p className="text-xs text-slate-400 leading-normal">
                Hitung berapa anggaran penghematan gedung Anda per bulan pasca servis filter AC.
              </p>
            </div>

            {/* Input Slider 1: PK capacity */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Kapasitas Kompresor (PK)</span>
                <strong className="text-sky-400 font-mono">{pkInput} PK</strong>
              </div>
              <input
                id="calc-pk"
                type="range"
                min="0.5"
                max="5.0"
                step="0.5"
                value={pkInput}
                onChange={(e) => setPkInput(parseFloat(e.target.value))}
                className="w-full accent-sky-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
              />
            </div>

            {/* Input Slider 2: Hours/Day */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Durasi Operasional Harian</span>
                <strong className="text-sky-400 font-mono">{hoursInput} Jam / Hari</strong>
              </div>
              <input
                id="calc-hours"
                type="range"
                min="1"
                max="24"
                step="1"
                value={hoursInput}
                onChange={(e) => setHoursInput(parseInt(e.target.value))}
                className="w-full accent-sky-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
              />
            </div>

            {/* Input rate */}
            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 font-semibold block">Tarif PLN Nasional (IDR/kWh)</label>
              <input
                id="calc-rate"
                type="number"
                value={rateInput}
                onChange={(e) => setRateInput(parseFloat(e.target.value) || 1444.7)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono focus:outline-hidden text-slate-200"
              />
            </div>
          </div>

          {/* Savings results box */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80 space-y-3 mt-6">
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">
              Proyeksi Efisiensi Bulanan
            </span>
            
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Daya Terpangkas</span>
                <span className="text-sm font-mono font-bold text-sky-400">
                  ~{calcResult.savingsKwh} kWh
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Anggaran Diselamatkan</span>
                <span className="text-sm font-mono font-bold text-emerald-400">
                  {formatIDR(calcResult.savingsCost)}
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-slate-800/80 pt-2 text-[10px]">
                <span className="text-slate-500 flex items-center gap-1">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                  Reduksi Emisi Karbon
                </span>
                <span className="font-semibold text-slate-300 font-mono">
                  -{calcResult.carbonReduced} kg CO₂
                </span>
              </div>
            </div>
          </div>

          <div className="text-[10px] text-slate-500 text-center mt-3">
            *Asumsi efisiensi AC kembali optimal 100% pasca pembersihan filter & perbaikan sirip evaporator.
          </div>

        </div>

      </div>

    </motion.div>
  );
}

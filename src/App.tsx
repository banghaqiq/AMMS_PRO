/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  INITIAL_ASSETS, 
  INITIAL_TECHNICIANS, 
  INITIAL_WORK_ORDERS, 
  INITIAL_ALERTS 
} from './data';
import { ACAsset, Technician, WorkOrder, SystemAlert, TabType } from './types';

// Import sub components
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardView from './components/DashboardView';
import AssetsView from './components/AssetsView';
import WorkOrdersView from './components/WorkOrdersView';
import TechniciansView from './components/TechniciansView';
import AnalyticsView from './components/AnalyticsView';
import SettingsView from './components/SettingsView';

export default function App() {
  // Page routing and layout
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // App states initialized with LocalStorage persistent caching
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const cached = localStorage.getItem('amms_dark_mode');
    return cached ? cached === 'true' : false;
  });

  const [assets, setAssets] = useState<ACAsset[]>(() => {
    const cached = localStorage.getItem('amms_assets');
    return cached ? JSON.parse(cached) : INITIAL_ASSETS;
  });

  const [technicians, setTechnicians] = useState<Technician[]>(() => {
    const cached = localStorage.getItem('amms_technicians');
    return cached ? JSON.parse(cached) : INITIAL_TECHNICIANS;
  });

  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(() => {
    const cached = localStorage.getItem('amms_work_orders');
    return cached ? JSON.parse(cached) : INITIAL_WORK_ORDERS;
  });

  const [alerts, setAlerts] = useState<SystemAlert[]>(() => {
    const cached = localStorage.getItem('amms_alerts');
    return cached ? JSON.parse(cached) : INITIAL_ALERTS;
  });

  // Cross-tab interaction pre-fills
  const [prefilledAssetId, setPrefilledAssetId] = useState<string | null>(null);
  const [prefilledWoTitle, setPrefilledWoTitle] = useState<string | null>(null);

  // Synchronize state with LocalStorage
  useEffect(() => {
    localStorage.setItem('amms_assets', JSON.stringify(assets));
  }, [assets]);

  useEffect(() => {
    localStorage.setItem('amms_technicians', JSON.stringify(technicians));
  }, [technicians]);

  useEffect(() => {
    localStorage.setItem('amms_work_orders', JSON.stringify(workOrders));
  }, [workOrders]);

  useEffect(() => {
    localStorage.setItem('amms_alerts', JSON.stringify(alerts));
  }, [alerts]);

  useEffect(() => {
    localStorage.setItem('amms_dark_mode', String(darkMode));
    // Apply Tailwind dark class
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Handler: Simulation Overheat Alarm
  const handleSimulateOverheat = () => {
    const targetAssetId = 'AC-005';
    const targetAsset = assets.find(a => a.id === targetAssetId);
    
    // Add new Critical Alert
    const newAlert: SystemAlert = {
      id: `AL-${String(Date.now()).slice(-4)}`,
      severity: 'critical',
      message: `SIMULASI: Suhu Kompresor AC ${targetAsset?.name || 'HRD Lt.3'} melewati batas toleransi (${26}°C)!`,
      timestamp: 'Baru saja',
      isRead: false,
      assetId: targetAssetId
    };

    setAlerts(prev => [newAlert, ...prev]);

    // Update target AC state to critical "Rusak" or "Butuh Servis"
    setAssets(prev => prev.map(a => {
      if (a.id === targetAssetId) {
        return { ...a, status: 'Rusak' };
      }
      return a;
    }));

    // Alert Sound/Vibrate notification simulator
    if ('vibrate' in navigator) {
      navigator.vibrate([100, 50, 100]);
    }
    
    alert('Simulasi Overheat Berhasil Diaktifkan! Silakan periksa lonceng notifikasi di atas atau panel log alert dasbor.');
  };

  // Handler: Database Reset to Factory Defaults
  const handleResetCache = () => {
    if (confirm('Konfirmasi: Ini akan menghapus semua rekaman modifikasi dan mengembalikan data aset bawaan pabrik (AMMS Pro original). Lanjutkan?')) {
      setAssets(INITIAL_ASSETS);
      setTechnicians(INITIAL_TECHNICIANS);
      setWorkOrders(INITIAL_WORK_ORDERS);
      setAlerts(INITIAL_ALERTS);
      setActiveTab('dashboard');
      alert('Database berhasil disetel ulang ke kondisi orisinal.');
    }
  };

  // Direct tab dispatcher links
  const handleCreateWorkOrderFromAsset = (assetId: string, title: string) => {
    setPrefilledAssetId(assetId);
    setPrefilledWoTitle(title);
    setActiveTab('work-orders');
  };

  // Render view router
  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardView
            assets={assets}
            technicians={technicians}
            workOrders={workOrders}
            alerts={alerts}
            setActiveTab={setActiveTab}
            onQuickAddAsset={() => {
              setActiveTab('assets');
              setTimeout(() => {
                const btn = document.getElementById('btn-add-asset');
                if (btn) btn.click();
              }, 100);
            }}
            onQuickAddWorkOrder={() => {
              setActiveTab('work-orders');
              setTimeout(() => {
                const btn = document.getElementById('btn-add-wo');
                if (btn) btn.click();
              }, 100);
            }}
            onQuickAddTechnician={() => {
              setActiveTab('technicians');
              setTimeout(() => {
                const btn = document.getElementById('btn-add-tech');
                if (btn) btn.click();
              }, 100);
            }}
          />
        );
      case 'assets':
        return (
          <AssetsView
            assets={assets}
            setAssets={setAssets}
            onCreateWorkOrderFromAsset={handleCreateWorkOrderFromAsset}
          />
        );
      case 'work-orders':
        // Pre-fill fields on rendering if shortcuts were clicked
        return (
          <WorkOrdersView
            workOrders={workOrders}
            setWorkOrders={setWorkOrders}
            assets={assets}
            setAssets={setAssets}
            technicians={technicians}
            setAlerts={setAlerts}
            // Pass prefilled data for immediate creation and clear immediately
            refData={
              prefilledAssetId ? { assetId: prefilledAssetId, title: prefilledWoTitle || '' } : undefined
            }
            onClearPrefill={() => {
              setPrefilledAssetId(null);
              setPrefilledWoTitle(null);
            }}
          />
        );
      case 'technicians':
        return (
          <TechniciansView
            technicians={technicians}
            setTechnicians={setTechnicians}
            workOrders={workOrders}
          />
        );
      case 'analytics':
        return (
          <AnalyticsView
            assets={assets}
            workOrders={workOrders}
          />
        );
      case 'settings':
        return (
          <SettingsView
            onSimulateOverheat={handleSimulateOverheat}
            onResetCache={handleResetCache}
          />
        );
      default:
        return <div className="p-8 text-center text-slate-500">View Tidak Diketahui</div>;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 font-sans overflow-hidden antialiased transition-colors duration-200">
      
      {/* Sidebar Navigation (Collapsible + responsive mobile drawer) */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* Main Workspace Frame */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden relative">
        
        {/* Top Header Panel (Alarm notifications, clock, search, profile, theme toggle) */}
        <Header
          activeTab={activeTab}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          alerts={alerts}
          setAlerts={setAlerts}
          isMobileOpen={isMobileOpen}
          setIsMobileOpen={setIsMobileOpen}
        />

        {/* Content canvas with smooth motion slide animation */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50/50 dark:bg-slate-950/60 transition-colors">
          <div className="max-w-7xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.22, ease: 'easeInOut' }}
                className="w-full"
              >
                {renderActiveView()}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

    </div>
  );
}

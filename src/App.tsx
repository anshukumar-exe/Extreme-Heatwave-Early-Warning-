import React, { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ViewMode, Region, WardData, AlertItem, SystemLog, ProtocolItem, SensorNode } from './types';
import { INITIAL_ALERTS, INITIAL_LOGS } from './data/mockData';
import { ALL_INDIA_REGIONS, findClosestIndianRegion, generateWardsForRegion } from './data/indiaRegions';

import { LandingPageProMax } from './components/LandingPageProMax';
import { TopAppBar } from './components/Dashboard/TopAppBar';
import { SideNavBar } from './components/Dashboard/SideNavBar';
import { InteractiveMap } from './components/Dashboard/InteractiveMap';
import { WardDetailDrawer } from './components/Dashboard/WardDetailDrawer';
import { WeatherForecastPanel } from './components/Dashboard/WeatherForecastPanel';
import { AnalyticsView } from './components/Dashboard/AnalyticsView';
import { AlertsView } from './components/Dashboard/AlertsView';
import { SettingsView } from './components/Dashboard/SettingsView';
import { DashboardOverview } from './components/Dashboard/DashboardOverview';
import { ThermalStressView } from './components/Dashboard/ThermalStressView';
import { HeatwaveAnalysisView } from './components/Dashboard/HeatwaveAnalysisView';
import { HistoricalAnalysisView } from './components/Dashboard/HistoricalAnalysisView';
import { UrbanHeatIslandView } from './components/Dashboard/UrbanHeatIslandView';
import { VulnerabilityView } from './components/Dashboard/VulnerabilityView';
import { InfrastructureView } from './components/Dashboard/InfrastructureView';
import { DataSourcesView } from './components/Dashboard/DataSourcesView';
import { AdminView } from './components/Dashboard/AdminView';

import { DeployResponseModal } from './components/Modals/DeployResponseModal';
import { LogEventModal } from './components/Modals/LogEventModal';
import { LogsModal } from './components/Modals/LogsModal';
import { ScientificAuditModal } from './components/Modals/ScientificAuditModal';
import { EmergencyHelplineModal, HelplineType } from './components/Modals/EmergencyHelplineModal';

export default function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('landing');
  const [currentRegion, setCurrentRegion] = useState<Region>(ALL_INDIA_REGIONS[0]);
  
  // Initialize wards and sensors generated for the active Indian region
  const initialData = generateWardsForRegion(ALL_INDIA_REGIONS[0]);
  const [wards, setWards] = useState<WardData[]>(initialData.wards);
  const [selectedWard, setSelectedWard] = useState<WardData | null>(initialData.wards[0]);
  const [sensors, setSensors] = useState<SensorNode[]>(initialData.sensors);
  const [alerts, setAlerts] = useState<AlertItem[]>(INITIAL_ALERTS);
  const [logs, setLogs] = useState<SystemLog[]>(INITIAL_LOGS);
  const [forecastDayOffset, setForecastDayOffset] = useState<number>(0);
  const [operatorName, setOperatorName] = useState<string>('Commander J. Vance');

  // User Geolocation tracking
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [userLocationName, setUserLocationName] = useState<string | null>(null);

  // Modals state
  const [isDeployModalOpen, setIsDeployModalOpen] = useState<boolean>(false);
  const [isLogEventModalOpen, setIsLogEventModalOpen] = useState<boolean>(false);
  const [isLogsModalOpen, setIsLogsModalOpen] = useState<boolean>(false);
  const [isScientificAuditOpen, setIsScientificAuditOpen] = useState<boolean>(false);
  const [helplineModalType, setHelplineModalType] = useState<HelplineType | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Location detection across all India
  const detectUserLocation = useCallback(() => {
    if (!navigator.geolocation) {
      showToast('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    showToast('Detecting your GPS location across India Heat Action Grid...');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserCoords({ lat: latitude, lng: longitude });

        // Match with nearest Indian municipal / heat action zone
        const closest = findClosestIndianRegion(latitude, longitude);
        setCurrentRegion(closest);
        setUserLocationName(`${closest.name}, ${closest.state}`);

        // Generate ward micro-grid for this location
        const generated = generateWardsForRegion(closest);
        setWards(generated.wards);
        setSelectedWard(generated.wards[0]);
        setSensors(generated.sensors);
        setIsLocating(false);

        showToast(`📍 Located: ${closest.name} (${closest.state}) • IMD Heat Action Grid Synced`);
      },
      (error) => {
        console.warn('Geolocation access warning:', error.message);
        setIsLocating(false);
        // Default to active default Indian region
        showToast(`Live GPS: Defaulted to ${currentRegion.name} (${currentRegion.state}). Select any Indian city from the menu.`);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  }, [currentRegion.name, currentRegion.state]);

  // Attempt automatic detection on mount
  useEffect(() => {
    detectUserLocation();
  }, []);

  const handleNavigate = (view: ViewMode) => {
    if (view === 'auth') {
      setViewMode('overview');
    } else {
      setViewMode(view);
    }
    setIsMobileMenuOpen(false);
  };

  const handleSelectRegion = (region: Region) => {
    setCurrentRegion(region);
    const generated = generateWardsForRegion(region);
    setWards(generated.wards);
    setSelectedWard(generated.wards[0]);
    setSensors(generated.sensors);
    showToast(`Switched operational grid to: ${region.name} (${region.state})`);
  };

  const handleSelectWard = (ward: WardData) => {
    setSelectedWard(ward);
  };

  const handleExecuteProtocol = (wardId: string, protocol: ProtocolItem) => {
    // Mark protocol as deployed
    setWards(prev => prev.map(w => {
      if (w.id === wardId) {
        return {
          ...w,
          coolingCentersOpen: protocol.id.includes('cooling') ? w.coolingCentersOpen + 2 : w.coolingCentersOpen,
          gridLoadPercent: protocol.id.includes('grid') ? Math.max(50, w.gridLoadPercent - 15) : w.gridLoadPercent,
          recommendedProtocols: w.recommendedProtocols.map(p => 
            p.id === protocol.id ? { ...p, status: 'deployed' } : p
          )
        };
      }
      return w;
    }));

    // Update selected ward if matched
    if (selectedWard && selectedWard.id === wardId) {
      setSelectedWard(prev => {
        if (!prev) return null;
        return {
          ...prev,
          coolingCentersOpen: protocol.id.includes('cooling') ? prev.coolingCentersOpen + 2 : prev.coolingCentersOpen,
          gridLoadPercent: protocol.id.includes('grid') ? Math.max(50, prev.gridLoadPercent - 15) : prev.gridLoadPercent,
          recommendedProtocols: prev.recommendedProtocols.map(p => 
            p.id === protocol.id ? { ...p, status: 'deployed' } : p
          )
        };
      });
    }

    // Add log
    const newLog: SystemLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      level: 'ACTION',
      operator: operatorName,
      wardId,
      action: `Executed: ${protocol.title}`,
      details: `${protocol.description} Authorized for immediate deployment.`
    };
    setLogs(prev => [newLog, ...prev]);

    showToast(`Action Dispatched: ${protocol.title}`);
  };

  const handleConfirmDeploy = (modules: string[], targetWardId: string) => {
    const target = wards.find(w => w.id === targetWardId);
    const wardName = target ? target.name : 'Metro Region';

    // Add new emergency log
    const newLog: SystemLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      level: 'CRITICAL',
      operator: operatorName,
      wardId: targetWardId,
      action: `Emergency Fleet Mobilized in ${wardName}`,
      details: `Authorized modules: ${modules.join(', ')}.`
    };
    setLogs(prev => [newLog, ...prev]);

    // Add new alert acknowledgment
    const newAlert: AlertItem = {
      id: `alert-${Date.now()}`,
      title: `Emergency Deployment Active: ${wardName}`,
      description: `Rapid emergency units deployed by ${operatorName}. Modules: ${modules.join(', ')}.`,
      severity: 'info',
      timestamp: 'Just now',
      sector: wardName,
      acknowledged: true,
      resolved: false
    };
    setAlerts(prev => [newAlert, ...prev]);

    showToast(`Emergency Units Mobilized across ${wardName} (${modules.length} modules active)`);
  };

  const handleSaveLogEvent = (logData: Omit<SystemLog, 'id' | 'timestamp'>) => {
    const newLog: SystemLog = {
      ...logData,
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };
    setLogs(prev => [newLog, ...prev]);
    showToast(`Incident event recorded in system audit log.`);
  };

  const handleBroadcastAdvisory = (targetSector: string, message: string) => {
    const newAlert: AlertItem = {
      id: `alert-${Date.now()}`,
      title: `Public Emergency Broadcast Dispatched`,
      description: message,
      severity: 'critical',
      timestamp: 'Just now',
      sector: targetSector,
      acknowledged: true,
      resolved: false,
      metrics: {
        recipients: 14203
      }
    };
    setAlerts(prev => [newAlert, ...prev]);

    const newLog: SystemLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      level: 'CRITICAL',
      operator: operatorName,
      action: `Broadcast Public Advisory to ${targetSector}`,
      details: message
    };
    setLogs(prev => [newLog, ...prev]);

    showToast(`Emergency broadcast transmitted to ${targetSector} residents.`);
  };

  const handleAcknowledgeAlert = (alertId: string) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, acknowledged: true } : a));
    showToast('Alert acknowledged by commander.');
  };

  const handleResolveAlert = (alertId: string) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, resolved: true, acknowledged: true } : a));
    showToast('Incident marked as resolved.');
  };

  const unreadAlertsCount = alerts.filter(a => !a.acknowledged && !a.resolved).length;
  const isDashboardView = viewMode !== 'landing';

  return (
    <div className="bg-[#070a12] text-[#e5e7eb] min-h-screen flex flex-col font-body-md overflow-hidden selection:bg-[#3b82f6] selection:text-white">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-16 right-6 z-50 bg-[#0f172a] border border-blue-500/40 text-blue-100 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 font-medium text-[13px] backdrop-blur-md transition-all">
          <span className="material-symbols-outlined text-[18px] text-blue-400">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Screen 1: Landing Page / Public Threat Hub */}
      {viewMode === 'landing' && (
        <LandingPageProMax 
          onNavigate={handleNavigate}
          currentRegion={currentRegion}
          wards={wards}
          onOpenHelplineModal={(type) => setHelplineModalType(type)}
          onOpenIncidentModal={() => setIsLogEventModalOpen(true)}
          onOpenDeployModal={() => setIsDeployModalOpen(true)}
        />
      )}

      {/* Dashboard Views */}
      {isDashboardView && (
        <div className="flex flex-col h-screen overflow-hidden">
          {/* Top App Bar */}
          <TopAppBar
            currentRegion={currentRegion}
            regions={ALL_INDIA_REGIONS}
            onSelectRegion={handleSelectRegion}
            onNavigate={handleNavigate}
            currentView={viewMode}
            activeAlerts={alerts}
            operatorName={operatorName}
            onOpenDeployModal={() => setIsDeployModalOpen(true)}
            onOpenHelplineModal={(type = 'helpline') => setHelplineModalType(type)}
            onDetectLocation={detectUserLocation}
            isLocating={isLocating}
            userCoords={userCoords}
            onToggleMobileMenu={() => setIsMobileMenuOpen(prev => !prev)}
            isMobileMenuOpen={isMobileMenuOpen}
          />

          {/* Main Dashboard Workspace (Side Nav + Central Content) */}
          <div className="flex-1 flex overflow-hidden relative">
            {/* Side Navigation Bar */}
            <SideNavBar
              currentView={viewMode}
              onNavigate={handleNavigate}
              unreadAlertsCount={unreadAlertsCount}
              onOpenDeployModal={() => setIsDeployModalOpen(true)}
              onOpenLogsModal={() => setIsLogsModalOpen(true)}
              onOpenHelplineModal={(type = 'helpline') => setHelplineModalType(type)}
              isMobileOpen={isMobileMenuOpen}
              onCloseMobile={() => setIsMobileMenuOpen(false)}
            />

            {/* View Switching with fluid entrance and exit transitions */}
            <div className="flex-1 flex overflow-hidden relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={viewMode === 'dashboard' ? 'overview' : viewMode}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                  className="flex-1 flex overflow-hidden relative w-full h-full"
                >
                  {(viewMode === 'overview' || viewMode === 'dashboard') && (
                    <DashboardOverview
                      currentRegion={currentRegion}
                      wards={wards}
                      alerts={alerts}
                      onNavigate={handleNavigate}
                      onSelectWard={(w) => {
                        setSelectedWard(w);
                        setViewMode('map');
                      }}
                      onOpenDeployModal={() => setIsDeployModalOpen(true)}
                    />
                  )}

                  {viewMode === 'map' && (
                    <div className="flex-1 flex relative overflow-hidden w-full h-full">
                      <InteractiveMap
                        wards={wards}
                        selectedWard={selectedWard}
                        onSelectWard={handleSelectWard}
                        sensors={sensors}
                        forecastDayOffset={forecastDayOffset}
                        onForecastDayChange={setForecastDayOffset}
                        currentRegion={currentRegion}
                        onDetectLocation={detectUserLocation}
                        isLocating={isLocating}
                        userLocationName={userLocationName}
                        onOpenForecastView={() => handleNavigate('forecast')}
                      />

                      {/* Right Drawer (Screen 3 & 4 Ward Detail Drawer) */}
                      <AnimatePresence>
                        {selectedWard && (
                          <WardDetailDrawer
                            ward={selectedWard}
                            onClose={() => setSelectedWard(null)}
                            onExecuteProtocol={handleExecuteProtocol}
                            onOpenLogEventModal={(w) => {
                              setSelectedWard(w);
                              setIsLogEventModalOpen(true);
                            }}
                            onOpenLogsModal={() => setIsLogsModalOpen(true)}
                            forecastDayOffset={forecastDayOffset}
                            onOpenForecastView={() => handleNavigate('forecast')}
                          />
                        )}
                      </AnimatePresence>
                    </div>
                  )}

            {viewMode === 'forecast' && (
              <WeatherForecastPanel
                currentRegion={currentRegion}
                wards={wards}
                onOpenDeployModal={() => setIsDeployModalOpen(true)}
                onNavigateToMap={() => handleNavigate('map')}
                onNavigate={handleNavigate}
              />
            )}

            {viewMode === 'thermal_stress' && (
              <ThermalStressView
                currentRegion={currentRegion}
                onOpenAuditModal={() => setIsScientificAuditOpen(true)}
                onNavigate={handleNavigate}
              />
            )}

            {viewMode === 'heatwave' && (
              <HeatwaveAnalysisView
                currentRegion={currentRegion}
                wards={wards}
                onOpenDeployModal={() => setIsDeployModalOpen(true)}
                onNavigate={handleNavigate}
              />
            )}

            {(viewMode === 'historical' || viewMode === 'history') && (
              <HistoricalAnalysisView
                currentRegion={currentRegion}
                regions={ALL_INDIA_REGIONS}
                onSelectRegion={handleSelectRegion}
                onNavigate={handleNavigate}
              />
            )}

            {viewMode === 'uhi' && (
              <UrbanHeatIslandView
                currentRegion={currentRegion}
                wards={wards}
                onSelectWard={(w) => {
                  setSelectedWard(w);
                  setViewMode('map');
                }}
                onNavigate={handleNavigate}
              />
            )}

            {viewMode === 'vulnerability' && (
              <VulnerabilityView
                currentRegion={currentRegion}
                wards={wards}
                onSelectWard={(w) => {
                  setSelectedWard(w);
                  setViewMode('map');
                }}
                onOpenDeployModal={() => setIsDeployModalOpen(true)}
                onNavigate={handleNavigate}
              />
            )}

            {viewMode === 'infrastructure' && (
              <InfrastructureView
                currentRegion={currentRegion}
                onOpenDeployModal={() => setIsDeployModalOpen(true)}
                onNavigate={handleNavigate}
              />
            )}

            {viewMode === 'analytics' && (
              <AnalyticsView
                wards={wards}
                currentRegion={currentRegion}
                onSelectWard={(w) => {
                  setSelectedWard(w);
                  setViewMode('map');
                }}
                onNavigate={handleNavigate}
              />
            )}

            {viewMode === 'alerts' && (
              <AlertsView
                alerts={alerts}
                wards={wards}
                onAcknowledgeAlert={handleAcknowledgeAlert}
                onResolveAlert={handleResolveAlert}
                onSelectWard={(w) => {
                  setSelectedWard(w);
                  setViewMode('map');
                }}
                onOpenDeployModal={() => setIsDeployModalOpen(true)}
                onBroadcastAdvisory={handleBroadcastAdvisory}
                onNavigate={handleNavigate}
              />
            )}

            {(viewMode === 'sources' || viewMode === 'datasources') && (
              <DataSourcesView onNavigate={handleNavigate} />
            )}

            {viewMode === 'admin' && (
              <AdminView onNavigate={handleNavigate} />
            )}

            {viewMode === 'settings' && (
              <SettingsView
                operatorName={operatorName}
                onUpdateOperatorName={setOperatorName}
                onNavigate={handleNavigate}
              />
            )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      )}

      {/* Emergency Helpline & Dispatch Modal */}
      <AnimatePresence>
        {helplineModalType && (
          <EmergencyHelplineModal
            type={helplineModalType}
            currentRegion={currentRegion}
            wards={wards}
            onClose={() => setHelplineModalType(null)}
            onDispatchSuccess={(msg) => showToast(msg)}
          />
        )}
      </AnimatePresence>

      {/* Global Modals */}
      <AnimatePresence>
        {isDeployModalOpen && (
          <DeployResponseModal
            wards={wards}
            onClose={() => setIsDeployModalOpen(false)}
            onConfirmDeploy={handleConfirmDeploy}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isLogEventModalOpen && (
          <LogEventModal
            ward={selectedWard}
            operatorName={operatorName}
            onClose={() => setIsLogEventModalOpen(false)}
            onSaveLog={handleSaveLogEvent}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isLogsModalOpen && (
          <LogsModal
            logs={logs}
            onClose={() => setIsLogsModalOpen(false)}
            onClearLogs={() => {
              setLogs([]);
              showToast('Local session logs cleared.');
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isScientificAuditOpen && (
          <ScientificAuditModal
            onClose={() => setIsScientificAuditOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

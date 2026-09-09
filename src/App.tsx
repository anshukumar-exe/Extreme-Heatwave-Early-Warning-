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

  // ML heatwave prediction state
  const [isMlPanelOpen, setIsMlPanelOpen] = useState<boolean>(true);
  const [mlLoading, setMlLoading] = useState<boolean>(false);
  const [mlResult, setMlResult] = useState<{
    Alert_Status: string;
    Alert_Probability_Percent: number;
    Prediction_Confidence: string;
    State_UT: string;
    Year: number;
    Month: number;
    Model: string;
  } | null>(null);

  const [mlInputs, setMlInputs] = useState({
    Temperature_Mean_C: 32,
    Temperature_Max_C: 42,
    Temperature_Min_C: 26,
    Relative_Humidity_Mean: 55,
    Dew_Point_Mean_C: 21,
    Precipitation_Sum_mm: 2,
    Pressure_msl_Mean_hPa: 1000,
    Wind_Speed_kmh: 12,
    Wind_Direction_Dominant_deg: 90,
    Wet_Bulb_Temp_C: 27,
    Heat_Index_C: 44,
    WBGT_C: 31,
  });

  const runMLPrediction = async () => {
    setMlLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:8001/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          State_UT: currentRegion.state,
          Year: new Date().getFullYear(),
          Month: new Date().getMonth() + 1,
          ...mlInputs,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Prediction request failed.');
      }

      setMlResult(data);
      showToast(`ML Prediction: ${data.Alert_Status} • ${data.Alert_Probability_Percent}%`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to reach ML prediction server.';
      showToast(`ML Prediction Error: ${message}`);
      console.error('ML prediction error:', error);
    } finally {
      setMlLoading(false);
    }
  };


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

  const unreadAlertsCount = alerts.filter(
  a => !a.acknowledged && !a.resolved
).length;

  const isDashboardView = viewMode !== 'landing';

  return (
    <div className="bg-[#0a0b10] text-[#e5e7eb] min-h-screen flex flex-col font-body-md overflow-hidden selection:bg-[#3b82f6] selection:text-white">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#0f1422]/95 border border-[#3b82f6]/70 text-[#93c5fd] px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 animate-bounce font-data-point text-[13px]">
          <span className="material-symbols-outlined text-[18px] text-[#3b82f6]">verified</span>
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

      {/* Screen 2: Integrated Command Dashboard Views */}
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
            onOpenHelplineModal={(type) => setHelplineModalType(type || 'helpline')}
            onDetectLocation={detectUserLocation}
            isLocating={isLocating}
            userCoords={userCoords}
            onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
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
              onOpenHelplineModal={(type) => setHelplineModalType(type || 'helpline')}
              isMobileOpen={isMobileMenuOpen}
              onCloseMobile={() => setIsMobileMenuOpen(false)}
            />

            {/* Live ML Prediction Panel (XGBoost Heatwave Alert Predictor) */}
            {isMlPanelOpen ? (
              <div
                className={`absolute bottom-4 z-30 w-[360px] max-w-[calc(100vw-2rem)] max-h-[78vh] overflow-y-auto rounded-2xl border border-[#263149] bg-[#0d111b]/95 backdrop-blur-xl shadow-2xl p-4 transition-all duration-300 ${
                  selectedWard && viewMode === 'map' ? 'right-4 md:right-[455px]' : 'right-4'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse shrink-0" />
                    <div>
                      <div className="text-[10.5px] uppercase tracking-[0.18em] text-[#64748b] font-medium font-mono">
                        ML Heatwave Engine
                      </div>
                      <div className="text-sm font-semibold text-white">
                        XGBoost Alert Predictor
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#162033] text-[#93c5fd] font-mono border border-blue-500/20">
                      51 FEATURES
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsMlPanelOpen(false)}
                      className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                      title="Minimize Predictor"
                      aria-label="Minimize Predictor"
                    >
                      <span className="material-symbols-outlined text-[16px]">close</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {[
                    ['Temperature_Mean_C', 'Mean Temp °C'],
                    ['Temperature_Max_C', 'Max Temp °C'],
                    ['Temperature_Min_C', 'Min Temp °C'],
                    ['Relative_Humidity_Mean', 'Humidity %'],
                    ['Dew_Point_Mean_C', 'Dew Point °C'],
                    ['Precipitation_Sum_mm', 'Rain mm'],
                    ['Pressure_msl_Mean_hPa', 'Pressure hPa'],
                    ['Wind_Speed_kmh', 'Wind km/h'],
                    ['Wind_Direction_Dominant_deg', 'Wind Dir °'],
                    ['Wet_Bulb_Temp_C', 'Wet Bulb °C'],
                    ['Heat_Index_C', 'Heat Index °C'],
                    ['WBGT_C', 'WBGT °C'],
                  ].map(([key, label]) => (
                    <label key={key} className="text-[10px] text-[#94a3b8] flex flex-col">
                      <span>{label}</span>
                      <input
                        type="number"
                        step="any"
                        value={mlInputs[key as keyof typeof mlInputs]}
                        onChange={(e) =>
                          setMlInputs(prev => ({
                            ...prev,
                            [key]: Number(e.target.value),
                          }))
                        }
                        className="mt-1 w-full rounded-lg border border-[#263149] bg-[#090d15] px-2.5 py-1.5 text-xs text-white outline-none focus:border-[#3b82f6] transition-colors"
                      />
                    </label>
                  ))}
                </div>

                <div className="mt-3 rounded-lg bg-[#090d15] border border-[#1e293b] px-3 py-2 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-[#64748b]">Prediction target</div>
                    <div className="text-xs text-white font-medium">
                      {currentRegion.state} • {new Date().getFullYear()} • Month {new Date().getMonth() + 1}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setMlInputs({
                        Temperature_Mean_C: 36,
                        Temperature_Max_C: 45,
                        Temperature_Min_C: 29,
                        Relative_Humidity_Mean: 60,
                        Dew_Point_Mean_C: 24,
                        Precipitation_Sum_mm: 0,
                        Pressure_msl_Mean_hPa: 998,
                        Wind_Speed_kmh: 8,
                        Wind_Direction_Dominant_deg: 110,
                        Wet_Bulb_Temp_C: 30,
                        Heat_Index_C: 50,
                        WBGT_C: 34,
                      });
                    }}
                    className="text-[10.5px] text-blue-400 hover:text-blue-300 underline underline-offset-2 cursor-pointer"
                  >
                    Heatwave Preset
                  </button>
                </div>

                <button
                  type="button"
                  onClick={runMLPrediction}
                  disabled={mlLoading}
                  className="mt-3 w-full rounded-lg bg-[#2563eb] hover:bg-[#1d4ed8] active:bg-[#1e40af] disabled:opacity-50 disabled:cursor-not-allowed px-3 py-2.5 text-xs font-semibold text-white transition flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 cursor-pointer"
                >
                  {mlLoading ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Running XGBoost...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[16px]">bolt</span>
                      <span>Run Heatwave Prediction</span>
                    </>
                  )}
                </button>

                {mlResult && (
                  <div className={`mt-3 rounded-xl border p-3 transition-all ${
                    mlResult.Alert_Status === 'Alert'
                      ? 'border-red-500/50 bg-red-500/10'
                      : 'border-emerald-500/40 bg-emerald-500/10'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase tracking-wider text-[#94a3b8] font-medium font-mono">
                        Model Result
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/40 text-[#94a3b8] font-mono border border-white/[0.06]">
                        {mlResult.Model}
                      </span>
                    </div>
                    <div className="mt-2 flex items-end justify-between">
                      <div>
                        <div className={`text-xl font-bold ${
                          mlResult.Alert_Status === 'Alert' ? 'text-red-400' : 'text-emerald-400'
                        }`}>
                          {mlResult.Alert_Status}
                        </div>
                        <div className="text-[11px] text-[#94a3b8] mt-1">
                          Confidence: <span className="text-white font-medium">{mlResult.Prediction_Confidence}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-white">
                          {mlResult.Alert_Probability_Percent}%
                        </div>
                        <div className="text-[10px] text-[#64748b]">alert probability</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsMlPanelOpen(true)}
                className={`absolute bottom-4 z-30 flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-blue-500/40 bg-[#0d111b]/95 backdrop-blur-md shadow-2xl hover:bg-[#162033] hover:border-blue-500 text-xs text-white transition group cursor-pointer ${
                  selectedWard && viewMode === 'map' ? 'right-4 md:right-[455px]' : 'right-4'
                }`}
                title="Open XGBoost ML Predictor"
              >
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping shrink-0" />
                <span className="material-symbols-outlined text-[16px] text-blue-400 group-hover:scale-110 transition-transform">bolt</span>
                <span className="font-semibold tracking-wide">XGBoost ML Predictor</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono">51 FEAT</span>
              </button>
            )}

            {/* View Switching */}
            {(viewMode === 'dashboard' || viewMode === 'overview') && (
              <DashboardOverview
                currentRegion={currentRegion}
                wards={wards}
                alerts={alerts}
                onNavigate={handleNavigate}
                onSelectWard={handleSelectWard}
                onOpenDeployModal={() => setIsDeployModalOpen(true)}
              />
            )}

            {viewMode === 'map' && (
              <div className="flex-1 flex relative overflow-hidden">
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

                {/* Right Drawer (Ward Detail Drawer) */}
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

            {(viewMode === 'history' || viewMode === 'historical') && (
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
                onSelectWard={handleSelectWard}
                onNavigate={handleNavigate}
              />
            )}

            {viewMode === 'vulnerability' && (
              <VulnerabilityView
                currentRegion={currentRegion}
                wards={wards}
                onSelectWard={handleSelectWard}
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

            {(viewMode === 'datasources' || viewMode === 'sources') && (
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
          </div>
        </div>
      )}

      {/* Emergency Helpline & Dispatch Modal */}
      {helplineModalType && (
        <EmergencyHelplineModal
          type={helplineModalType}
          currentRegion={currentRegion}
          wards={wards}
          onClose={() => setHelplineModalType(null)}
          onDispatchSuccess={(msg) => showToast(msg)}
        />
      )}

      {/* Global Modals */}
      {isDeployModalOpen && (
        <DeployResponseModal
          wards={wards}
          onClose={() => setIsDeployModalOpen(false)}
          onConfirmDeploy={handleConfirmDeploy}
        />
      )}

      {isLogEventModalOpen && (
        <LogEventModal
          ward={selectedWard}
          operatorName={operatorName}
          onClose={() => setIsLogEventModalOpen(false)}
          onSaveLog={handleSaveLogEvent}
        />
      )}

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

      {isScientificAuditOpen && (
        <ScientificAuditModal
          result={null}
          onClose={() => setIsScientificAuditOpen(false)}
        />
      )}
    </div>
  );
}
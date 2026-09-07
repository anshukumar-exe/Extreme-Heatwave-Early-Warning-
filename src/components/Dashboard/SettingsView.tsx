import React, { useState } from 'react';

interface SettingsViewProps {
  operatorName: string;
  onUpdateOperatorName: (name: string) => void;
  onNavigate?: (view: any) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  operatorName,
  onUpdateOperatorName,
  onNavigate
}) => {
  const [dangerThreshold, setDangerThreshold] = useState<number>(35.0);
  const [warningThreshold, setWarningThreshold] = useState<number>(31.0);
  const [autoSmsDispatch, setAutoSmsDispatch] = useState<boolean>(true);
  const [autoCoolingCenterTrigger, setAutoCoolingCenterTrigger] = useState<boolean>(true);
  const [gridThrottlingAuto, setGridThrottlingAuto] = useState<boolean>(false);
  const [telemetryRefreshRate, setTelemetryRefreshRate] = useState<number>(15);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="flex-1 bg-[#0c0f17] p-6 md:p-8 overflow-y-auto selection:bg-[#2563eb] selection:text-white" id="settings-view-panel">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="pb-6 border-b border-[#1e2638]">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            {onNavigate && (
              <button
                onClick={() => onNavigate('dashboard')}
                className="flex items-center gap-1.5 text-[11.5px] font-medium text-[#60a5fa] hover:text-[#93c5fd] transition-colors py-1 px-2.5 rounded-lg bg-[#141a29] hover:bg-[#1c2438] border border-[#263147] group"
                id="settings-back-btn"
              >
                <span className="material-symbols-outlined text-[15px] group-hover:-translate-x-0.5 transition-transform">
                  arrow_back
                </span>
                <span>Command Overview</span>
              </button>
            )}
            <span className="text-[#334155]">•</span>
            <span className="material-symbols-outlined text-blue-400 text-[18px]">settings</span>
            <span className="text-[11px] text-blue-400 uppercase tracking-wider font-semibold">
              PLATFORM CONFIGURATION
            </span>
          </div>
          <h2 className="text-[22px] md:text-[28px] text-white font-bold tracking-tight">
            System Settings &amp; Emergency Trigger Thresholds
          </h2>
          <p className="text-[13px] text-[#94a3b8] mt-1">
            Configure thermal thresholds, auto-deployment protocols, and sensor network telemetry intervals.
          </p>
        </div>

        {savedSuccess && (
          <div className="p-4 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 rounded-xl text-[13px] flex items-center gap-2 shadow-sm">
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            <span>Settings successfully synced across municipal command nodes.</span>
          </div>
        )}

        <form onSubmit={handleSave} className="flex flex-col gap-6">
          {/* Section 1: Temperature Trigger Thresholds */}
          <div className="bg-[#121622] border border-[#212a3d] rounded-xl p-6 shadow-sm">
            <h3 className="text-[17px] text-white font-bold mb-1">
              Thermal Hazard Thresholds
            </h3>
            <p className="text-[12.5px] text-[#94a3b8] mb-6">
              Define the boundary values for Level 2 (Warning) and Level 3 (Danger/Critical) emergency protocols.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-[11.5px] text-red-300 uppercase font-semibold mb-2">
                  Extreme Danger Threshold (°C)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    step="0.5"
                    value={dangerThreshold}
                    onChange={(e) => setDangerThreshold(parseFloat(e.target.value))}
                    className="w-full bg-[#182030] border border-[#263147] rounded-lg p-3 text-[14px] text-white outline-none focus:border-blue-500"
                  />
                  <span className="text-[#94a3b8] text-[13px] whitespace-nowrap">WBGT °C</span>
                </div>
                <span className="text-[11px] text-[#64748b] mt-1 block">
                  Triggers mandatory cooling center activation
                </span>
              </div>

              <div>
                <label className="block text-[11.5px] text-amber-300 uppercase font-semibold mb-2">
                  Warning Advisory Threshold (°C)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    step="0.5"
                    value={warningThreshold}
                    onChange={(e) => setWarningThreshold(parseFloat(e.target.value))}
                    className="w-full bg-[#182030] border border-[#263147] rounded-lg p-3 text-[14px] text-white outline-none focus:border-blue-500"
                  />
                  <span className="text-[#94a3b8] text-[13px] whitespace-nowrap">WBGT °C</span>
                </div>
                <span className="text-[11px] text-[#64748b] mt-1 block">
                  Triggers public health awareness advisory
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Automation Rules */}
          <div className="bg-[#121622] border border-[#212a3d] rounded-xl p-6 shadow-sm">
            <h3 className="text-[17px] text-white font-bold mb-1">
              Autonomous Dispatch Protocols
            </h3>
            <p className="text-[12.5px] text-[#94a3b8] mb-6">
              Enable or disable automated system triggers when mesonet sensors confirm sustained heat spikes.
            </p>

            <div className="flex flex-col gap-3">
              <label className="flex items-center justify-between p-4 bg-[#182030] rounded-xl border border-[#263147] cursor-pointer hover:border-[#334155] transition-colors">
                <div>
                  <div className="text-[14px] text-white font-semibold">
                    Autonomous SMS Advisory Broadcast
                  </div>
                  <div className="text-[12px] text-[#94a3b8] mt-0.5">
                    Instantly broadcast localized alerts to residents in sector when threshold exceeds 36.0°C for &gt; 30 mins.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={autoSmsDispatch}
                  onChange={(e) => setAutoSmsDispatch(e.target.checked)}
                  className="w-5 h-5 accent-blue-600 cursor-pointer rounded"
                />
              </label>

              <label className="flex items-center justify-between p-4 bg-[#182030] rounded-xl border border-[#263147] cursor-pointer hover:border-[#334155] transition-colors">
                <div>
                  <div className="text-[14px] text-white font-semibold">
                    Automatic Cooling Center Standby Signal
                  </div>
                  <div className="text-[12px] text-[#94a3b8] mt-0.5">
                    Notify municipal facilities and volunteers 24 hours ahead of forecasted heat peaks.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={autoCoolingCenterTrigger}
                  onChange={(e) => setAutoCoolingCenterTrigger(e.target.checked)}
                  className="w-5 h-5 accent-blue-600 cursor-pointer rounded"
                />
              </label>

              <label className="flex items-center justify-between p-4 bg-[#182030] rounded-xl border border-[#263147] cursor-pointer hover:border-[#334155] transition-colors">
                <div>
                  <div className="text-[14px] text-white font-semibold">
                    Automated Power Grid Load Shedding Request
                  </div>
                  <div className="text-[12px] text-[#94a3b8] mt-0.5">
                    Send automated curtailment signal to municipal utility when substation load reaches 90%.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={gridThrottlingAuto}
                  onChange={(e) => setGridThrottlingAuto(e.target.checked)}
                  className="w-5 h-5 accent-blue-600 cursor-pointer rounded"
                />
              </label>
            </div>
          </div>

          {/* Section 3: Telemetry & Operator Profile */}
          <div className="bg-[#121622] border border-[#212a3d] rounded-xl p-6 shadow-sm">
            <h3 className="text-[17px] text-white font-bold mb-1">
              Operator &amp; Telemetry Polling
            </h3>
            <p className="text-[12.5px] text-[#94a3b8] mb-6">
              Sensor network polling cadence and logged commander identifier.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-[11.5px] text-[#94a3b8] uppercase font-semibold mb-2">
                  Active Commander Name
                </label>
                <input
                  type="text"
                  value={operatorName}
                  onChange={(e) => onUpdateOperatorName(e.target.value)}
                  className="w-full bg-[#182030] border border-[#263147] rounded-lg p-3 text-[14px] text-white outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11.5px] text-[#94a3b8] uppercase font-semibold mb-2">
                  Sensor Polling Cadence (Seconds)
                </label>
                <select
                  value={telemetryRefreshRate}
                  onChange={(e) => setTelemetryRefreshRate(parseInt(e.target.value))}
                  className="w-full bg-[#182030] border border-[#263147] rounded-lg p-3 text-[14px] text-white outline-none focus:border-blue-500"
                >
                  <option value={5}>5 seconds (High Frequency)</option>
                  <option value={15}>15 seconds (Standard Operational)</option>
                  <option value={30}>30 seconds (Power Conservation)</option>
                  <option value={60}>60 seconds (Low Bandwidth)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white text-[13.5px] font-medium px-8 py-3 rounded-lg transition-all shadow-sm"
            >
              Save Configuration
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Region, WardData } from '../../types';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine
} from 'recharts';

interface HeatwaveAnalysisViewProps {
  currentRegion: Region;
  wards: WardData[];
  onOpenDeployModal: () => void;
  onNavigate?: (view: any) => void;
}

export const HeatwaveAnalysisView: React.FC<HeatwaveAnalysisViewProps> = ({
  currentRegion,
  wards,
  onOpenDeployModal,
  onNavigate
}) => {
  const [selectedCriteria, setSelectedCriteria] = useState<'IMD_PLAINS' | 'NDMA_WBGT' | 'WMO_ANOMALY'>('IMD_PLAINS');

  // Baseline 30-year normal for region
  const baselineNormalTemp = 34.5;
  const currentTemp = currentRegion.averageTemp;
  const anomalyDelta = Number((currentTemp - baselineNormalTemp).toFixed(1));
  const nightMinTemp = 30.8; // High night-time temperature (tropical night)
  const isTropicalNight = nightMinTemp >= 28.0;

  // IMD Criteria Calculation:
  // Heatwave: Max Temp >= 40°C & Anomaly >= 4.5°C to 6.4°C
  // Severe Heatwave: Max Temp >= 40°C & Anomaly >= 6.5°C, OR Max Temp >= 45°C
  const isSevereHeatwave = currentTemp >= 45.0 || anomalyDelta >= 6.5;
  const isHeatwave = currentTemp >= 40.0 && anomalyDelta >= 4.5;

  const heatwaveStatus = isSevereHeatwave 
    ? 'SEVERE HEATWAVE (RED ALERT)' 
    : isHeatwave 
    ? 'HEATWAVE (ORANGE ALERT)' 
    : 'ELEVATED HEAT STRESS (YELLOW)';

  // 7-day Heatwave Trend progression data
  const trendData = [
    { day: 'Day -3', maxTemp: 38.5, normal: 34.5, anomaly: 4.0, nightMin: 27.2, threshold: 40.0 },
    { day: 'Day -2', maxTemp: 40.2, normal: 34.5, anomaly: 5.7, nightMin: 28.6, threshold: 40.0 },
    { day: 'Day -1', maxTemp: 41.8, normal: 34.5, anomaly: 7.3, nightMin: 29.8, threshold: 40.0 },
    { day: 'Today', maxTemp: currentTemp, normal: 34.5, anomaly: anomalyDelta, nightMin: nightMinTemp, threshold: 40.0 },
    { day: 'Day +1', maxTemp: 43.5, normal: 34.5, anomaly: 9.0, nightMin: 31.2, threshold: 40.0 },
    { day: 'Day +2', maxTemp: 44.2, normal: 34.5, anomaly: 9.7, nightMin: 31.8, threshold: 40.0 },
    { day: 'Day +3', maxTemp: 42.0, normal: 34.5, anomaly: 7.5, nightMin: 30.1, threshold: 40.0 }
  ];

  return (
    <div className="flex-1 bg-[#0c0f17] p-6 md:p-8 overflow-y-auto selection:bg-[#2563eb] selection:text-white space-y-6" id="heatwave-analysis-view-panel">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#1e2638]">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            {onNavigate && (
              <button
                onClick={() => onNavigate('dashboard')}
                className="flex items-center gap-1.5 text-[11.5px] font-medium text-[#60a5fa] hover:text-[#93c5fd] transition-colors py-1 px-2.5 rounded-lg bg-[#141a29] hover:bg-[#1c2438] border border-[#263147] group"
                id="heatwave-back-btn"
              >
                <span className="material-symbols-outlined text-[15px] group-hover:-translate-x-0.5 transition-transform">
                  arrow_back
                </span>
                <span>Command Overview</span>
              </button>
            )}
            <span className="text-[#334155]">•</span>
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            <span className="text-[11px] text-red-400 uppercase tracking-wider font-semibold">
              IMD &amp; NDMA PROTOCOL ENGINE
            </span>
          </div>
          <h1 className="text-[22px] md:text-[28px] text-white font-bold tracking-tight">
            Heatwave Detection &amp; Anomaly Analysis
          </h1>
          <p className="text-[13px] text-[#94a3b8] mt-1">
            Climatological heatwave thresholds, nocturnal heat entrapment metrics, and departures from 30-year normal.
          </p>
        </div>

        <button
          onClick={onOpenDeployModal}
          className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-[12.5px] font-medium flex items-center gap-2 transition-colors self-start md:self-auto shadow-sm"
        >
          <span className="material-symbols-outlined text-[17px]">emergency</span>
          <span>Deploy Emergency Response</span>
        </button>
      </div>

      {/* Primary Heatwave Status Banner */}
      <div className="bg-[#121622] border border-red-500/30 rounded-xl p-6 shadow-sm relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-semibold bg-red-600 text-white">
                OFFICIAL IMD CLASSIFICATION
              </span>
              <span className="text-[12px] font-mono text-[#64748b]">Region: {currentRegion.imdZone}</span>
            </div>

            <h2 className="text-[26px] md:text-[32px] font-bold text-white tracking-tight">
              {heatwaveStatus}
            </h2>

            <p className="text-[13px] text-[#94a3b8] mt-2 max-w-2xl">
              Air temperatures are exceeding the 30-year climatological normal by <strong className="text-red-400 font-mono">+{anomalyDelta}°C</strong>. 
              Under Indian Meteorological Department (IMD) Guidelines for Plains, this constitutes an active operational heat hazard.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 min-w-[280px]">
            <div className="bg-[#182030] p-3.5 rounded-xl border border-[#263147]">
              <span className="text-[10px] text-[#94a3b8] uppercase font-medium block">CURRENT TEMP</span>
              <div className="text-[22px] font-bold text-red-400 font-mono mt-0.5">{currentTemp}°C</div>
              <span className="text-[10.5px] text-[#64748b]">Normal: {baselineNormalTemp}°C</span>
            </div>

            <div className="bg-[#182030] p-3.5 rounded-xl border border-[#263147]">
              <span className="text-[10px] text-[#94a3b8] uppercase font-medium block">NIGHT MIN TEMP</span>
              <div className="text-[22px] font-bold text-orange-400 font-mono mt-0.5">{nightMinTemp}°C</div>
              <span className="text-[10.5px] text-red-400 font-medium">Tropical Night</span>
            </div>

            <div className="bg-[#182030] p-3.5 rounded-xl border border-[#263147]">
              <span className="text-[10px] text-[#94a3b8] uppercase font-medium block">ANOMALY DELTA</span>
              <div className="text-[22px] font-bold text-amber-400 font-mono mt-0.5">+{anomalyDelta}°C</div>
              <span className="text-[10.5px] text-[#64748b]">Threshold: +4.5°C</span>
            </div>

            <div className="bg-[#182030] p-3.5 rounded-xl border border-[#263147]">
              <span className="text-[10px] text-[#94a3b8] uppercase font-medium block">CONFIDENCE</span>
              <div className="text-[22px] font-bold text-emerald-400 font-mono mt-0.5">98.4%</div>
              <span className="text-[10.5px] text-[#64748b]">ERA5 / IMD Ground</span>
            </div>
          </div>
        </div>
      </div>

      {/* 7-Day Anomaly & Progression Chart */}
      <div className="bg-[#121622] border border-[#212a3d] rounded-xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-[17px] text-white font-bold">
              Heatwave Temperature &amp; Anomaly Trajectory
            </h3>
            <p className="text-[12.5px] text-[#94a3b8] mt-0.5">
              Max day temperatures, nocturnal minimums, and departure from 30-year climatological normal
            </p>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-[#94a3b8] flex-wrap">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-red-500"></span>Max Temp</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-orange-400"></span>Night Min</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-0.5 bg-emerald-400"></span>30-Yr Normal</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-0.5 border-t border-dashed border-red-400"></span>Heatwave Threshold (40°C)</span>
          </div>
        </div>

        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={trendData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2638" />
              <XAxis dataKey="day" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis domain={[20, 50]} stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#121622', borderColor: '#263147', borderRadius: '8px', fontSize: '12px' }}
                labelStyle={{ color: '#fff', fontWeight: 'bold' }}
              />
              <ReferenceLine y={40.0} stroke="#ef4444" strokeDasharray="4 4" label={{ value: 'IMD Heatwave (40°C)', fill: '#ef4444', fontSize: 10 }} />
              <ReferenceLine y={34.5} stroke="#10b981" strokeWidth={1.5} label={{ value: 'Historical Normal (34.5°C)', fill: '#10b981', fontSize: 10 }} />
              <Bar dataKey="maxTemp" fill="#ef4444" name="Max Temp (°C)" radius={[4, 4, 0, 0]} maxBarSize={40} />
              <Line type="monotone" dataKey="nightMin" stroke="#fb923c" strokeWidth={2.5} name="Night Min (°C)" dot={{ r: 4 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Two Columns: Night-time Entrapment + Official Warning Explanations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Night-time Temperature Entrapment */}
        <div className="bg-[#121622] border border-[#212a3d] rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-orange-400 text-[20px]">nights_stay</span>
            <div>
              <h3 className="text-[16.5px] text-white font-bold">
                Nocturnal Heat Entrapment Risk
              </h3>
              <span className="text-[11px] text-[#64748b]">Biological Recovery Impairment</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#182030] border border-[#263147] space-y-2.5">
            <div className="flex justify-between items-center text-[13px]">
              <span className="text-[#94a3b8]">Minimum Night Temp:</span>
              <span className="text-orange-400 font-bold font-mono">{nightMinTemp}°C</span>
            </div>
            <div className="flex justify-between items-center text-[13px]">
              <span className="text-[#94a3b8]">Physiological Recovery Threshold:</span>
              <span className="text-white font-bold">&lt; 25.0°C</span>
            </div>
            <div className="flex justify-between items-center text-[13px]">
              <span className="text-[#94a3b8]">Nocturnal Thermal Delta:</span>
              <span className="text-red-400 font-bold font-mono">+{Number((nightMinTemp - 25.0).toFixed(1))}°C Above Safe Limit</span>
            </div>
          </div>

          <p className="text-[12.5px] text-[#94a3b8] leading-relaxed">
            When ambient night temperatures stay above 28°C (tropical nights), human thermoregulation cannot dissipate accumulated daytime heat load, 
            amplifying cardiovascular strain among the elderly and vulnerable demographics.
          </p>
        </div>

        {/* Official Criteria Comparison */}
        <div className="bg-[#121622] border border-[#212a3d] rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-400 text-[20px]">gavel</span>
            <div>
              <h3 className="text-[16.5px] text-white font-bold">
                Multi-Agency Criteria Comparison
              </h3>
              <span className="text-[11px] text-[#64748b]">IMD vs NDMA vs WMO Thresholds</span>
            </div>
          </div>

          <div className="space-y-2.5 text-[12px]">
            <div className="p-3 rounded-lg bg-[#182030] border border-[#263147] flex justify-between items-center">
              <div>
                <span className="font-semibold text-white block">1. IMD (Indian Meteorological Dept)</span>
                <span className="text-[#64748b] text-[11px]">Criteria: Temp &ge; 40°C &amp; Anomaly &ge; 4.5°C</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-red-500/15 text-red-400 border border-red-500/30">
                TRIGGERED
              </span>
            </div>

            <div className="p-3 rounded-lg bg-[#182030] border border-[#263147] flex justify-between items-center">
              <div>
                <span className="font-semibold text-white block">2. NDMA WBGT Outdoor Worker Rule</span>
                <span className="text-[#64748b] text-[11px]">Criteria: WBGT &ge; 32.0°C (Mandatory Work Halt)</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-red-500/15 text-red-400 border border-red-500/30">
                TRIGGERED
              </span>
            </div>

            <div className="p-3 rounded-lg bg-[#182030] border border-[#263147] flex justify-between items-center">
              <div>
                <span className="font-semibold text-white block">3. WMO Heat-Health Anomaly</span>
                <span className="text-[#64748b] text-[11px]">Criteria: 95th percentile exceedance &gt; 3 days</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-orange-500/15 text-orange-400 border border-orange-500/30">
                ACTIVE (DAY 4)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

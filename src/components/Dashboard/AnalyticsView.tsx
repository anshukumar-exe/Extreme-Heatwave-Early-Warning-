import React, { useState } from 'react';
import { motion } from 'motion/react';
import { WardData, Region } from '../../types';

interface AnalyticsViewProps {
  wards: WardData[];
  currentRegion: Region;
  onSelectWard: (ward: WardData) => void;
  onNavigate?: (view: any) => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.04
    }
  }
};

const itemVariants: any = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] }
  }
};

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  wards,
  currentRegion,
  onSelectWard,
  onNavigate
}) => {
  const [selectedMetric, setSelectedMetric] = useState<'heatIndex' | 'temp' | 'vulnerability' | 'grid'>('heatIndex');

  // Sorted wards by heat index
  const sortedWards = [...wards].sort((a, b) => b.heatIndex - a.heatIndex);

  const avgTemp = (wards.reduce((acc, w) => acc + w.currentTemp, 0) / wards.length).toFixed(1);
  const totalPopulationAtRisk = wards
    .filter(w => w.status === 'critical' || w.status === 'danger')
    .reduce((acc, w) => acc + w.population, 0);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex-1 bg-[#0c0f17] p-6 md:p-8 overflow-y-auto selection:bg-[#2563eb] selection:text-white space-y-6"
      id="analytics-view-panel"
    >
      {/* Analytics Header */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#1e2638]">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            {onNavigate && (
              <button
                onClick={() => onNavigate('dashboard')}
                className="flex items-center gap-1.5 text-[11.5px] font-medium text-[#60a5fa] hover:text-[#93c5fd] transition-colors py-1 px-2.5 rounded-lg bg-[#141a29] hover:bg-[#1c2438] border border-[#263147] group"
                id="analytics-back-btn"
              >
                <span className="material-symbols-outlined text-[15px] group-hover:-translate-x-0.5 transition-transform">
                  arrow_back
                </span>
                <span>Command Overview</span>
              </button>
            )}
            <span className="text-[#334155]">•</span>
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
            <span className="text-[11px] text-blue-400 uppercase tracking-wider font-semibold">
              URBAN THERMAL INTELLIGENCE
            </span>
          </div>
          <h2 className="text-[22px] md:text-[28px] text-white font-bold tracking-tight">
            {currentRegion.name} • Deep Analytics
          </h2>
          <p className="text-[13px] text-[#94a3b8] mt-1">
            Real-time heat anomaly correlation, grid stress index, and vulnerable population exposure modeling.
          </p>
        </div>

        {/* Metric Selector Pills */}
        <div className="flex bg-[#121622] p-1 rounded-lg border border-[#212a3d] text-[11.5px] self-start md:self-auto">
          <button
            onClick={() => setSelectedMetric('heatIndex')}
            className={`px-3 py-1.5 rounded-md transition-colors font-medium ${
              selectedMetric === 'heatIndex' ? 'bg-blue-600 text-white shadow-sm' : 'text-[#94a3b8] hover:text-white'
            }`}
          >
            Heat Index
          </button>
          <button
            onClick={() => setSelectedMetric('temp')}
            className={`px-3 py-1.5 rounded-md transition-colors font-medium ${
              selectedMetric === 'temp' ? 'bg-blue-600 text-white shadow-sm' : 'text-[#94a3b8] hover:text-white'
            }`}
          >
            Temperature
          </button>
          <button
            onClick={() => setSelectedMetric('vulnerability')}
            className={`px-3 py-1.5 rounded-md transition-colors font-medium ${
              selectedMetric === 'vulnerability' ? 'bg-blue-600 text-white shadow-sm' : 'text-[#94a3b8] hover:text-white'
            }`}
          >
            Vulnerability
          </button>
          <button
            onClick={() => setSelectedMetric('grid')}
            className={`px-3 py-1.5 rounded-md transition-colors font-medium ${
              selectedMetric === 'grid' ? 'bg-blue-600 text-white shadow-sm' : 'text-[#94a3b8] hover:text-white'
            }`}
          >
            Grid Load
          </button>
        </div>
      </motion.div>

      {/* Top 4 Summary Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#121622] border border-[#212a3d] rounded-xl p-5 shadow-sm">
          <span className="text-[10.5px] text-[#94a3b8] uppercase font-medium block mb-1">
            REGIONAL AVG TEMP
          </span>
          <div className="flex items-baseline gap-1 text-red-400 font-mono">
            <span className="text-[30px] font-bold">{avgTemp}</span>
            <span className="text-[14px]">°C</span>
          </div>
          <div className="text-[11.5px] text-[#64748b] mt-2 flex items-center gap-1">
            <span className="text-red-400 font-medium">▲ +3.4°C</span> vs 30-day baseline
          </div>
        </div>

        <div className="bg-[#121622] border border-[#212a3d] rounded-xl p-5 shadow-sm">
          <span className="text-[10.5px] text-[#94a3b8] uppercase font-medium block mb-1">
            HIGH-RISK POPULATION
          </span>
          <div className="flex items-baseline gap-1 text-rose-400 font-mono">
            <span className="text-[30px] font-bold">{totalPopulationAtRisk.toLocaleString()}</span>
          </div>
          <div className="text-[11.5px] text-[#94a3b8] mt-2">
            In Ward 7 &amp; Ward 3 Critical Zones
          </div>
        </div>

        <div className="bg-[#121622] border border-[#212a3d] rounded-xl p-5 shadow-sm">
          <span className="text-[10.5px] text-[#94a3b8] uppercase font-medium block mb-1">
            GRID AVERAGE LOAD
          </span>
          <div className="flex items-baseline gap-1 text-orange-400 font-mono">
            <span className="text-[30px] font-bold">78.8</span>
            <span className="text-[14px]">%</span>
          </div>
          <div className="text-[11.5px] text-[#64748b] mt-2">
            Substation 4 Peak: 92% (High Risk)
          </div>
        </div>

        <div className="bg-[#121622] border border-[#212a3d] rounded-xl p-5 shadow-sm">
          <span className="text-[10.5px] text-[#94a3b8] uppercase font-medium block mb-1">
            COOLING SHELTERS ACTIVE
          </span>
          <div className="flex items-baseline gap-1 text-emerald-400 font-mono">
            <span className="text-[30px] font-bold">
              {wards.reduce((a, b) => a + b.coolingCentersOpen, 0)}
            </span>
            <span className="text-[14px] text-[#94a3b8]">Sites</span>
          </div>
          <div className="text-[11.5px] text-[#64748b] mt-2">
            Avg Utilization: 74% Capacity
          </div>
        </div>
      </motion.div>

      {/* Main Grid: Sector Rankings & 72H Trajectory comparison */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ward Risk Matrix (2 cols) */}
        <div className="lg:col-span-2 bg-[#121622] border border-[#212a3d] rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-[17px] text-white font-bold">
              Ward Thermal &amp; Vulnerability Exposure Rankings
            </h3>
            <span className="text-[11px] text-blue-400 bg-blue-500/10 border border-blue-500/25 px-2.5 py-0.5 rounded-full font-medium">
              Live Telemetry
            </span>
          </div>

          <div className="flex flex-col gap-2.5">
            {sortedWards.map((w, rank) => {
              const isCrit = w.currentTemp >= 35.0;
              return (
                <div
                  key={w.id}
                  onClick={() => onSelectWard(w)}
                  className="bg-[#182030] hover:bg-[#1f293d] p-3.5 rounded-lg border border-[#263147] hover:border-[#3b82f6] flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-[#0c0f17] border border-[#263147] flex items-center justify-center font-mono text-[11.5px] text-blue-400 font-semibold">
                      #{rank + 1}
                    </div>
                    <div>
                      <div className="text-[13.5px] text-white font-semibold">{w.name}</div>
                      <div className="text-[11px] text-[#64748b]">
                        Pop: {w.population.toLocaleString()} • Vuln: {w.vulnerabilityIndex.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-5 self-end sm:self-center">
                    <div className="text-right">
                      <div className={`font-mono text-[15px] font-bold ${isCrit ? 'text-red-400' : 'text-emerald-400'}`}>
                        {w.currentTemp.toFixed(1)}°C
                      </div>
                      <div className="text-[10px] text-[#64748b]">
                        Heat Index: {w.heatIndex}°C
                      </div>
                    </div>

                    <div className="w-28 sm:w-32">
                      <div className="flex justify-between text-[10px] text-[#94a3b8] mb-1 font-mono">
                        <span>Grid</span>
                        <span>{w.gridLoadPercent}%</span>
                      </div>
                      <div className="w-full bg-[#0c0f17] h-1.5 rounded-full overflow-hidden border border-[#212a3d]">
                        <div
                          className={`h-full rounded-full ${
                            w.gridLoadPercent > 85 ? 'bg-red-500' : w.gridLoadPercent > 70 ? 'bg-orange-400' : 'bg-blue-500'
                          }`}
                          style={{ width: `${w.gridLoadPercent}%` }}
                        ></div>
                      </div>
                    </div>

                    <span className="material-symbols-outlined text-[17px] text-[#64748b]">chevron_right</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 72H Trajectory Forecast Analytics */}
        <div className="bg-[#121622] border border-[#212a3d] rounded-xl p-6 shadow-sm flex flex-col justify-between space-y-6">
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-[17px] text-white font-bold">
                72H Heatwave Trajectory
              </h3>
              <span className="text-[10.5px] text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded border border-emerald-500/30 font-medium">
                Confidence: 94%
              </span>
            </div>
            <p className="text-[12.5px] text-[#94a3b8] mb-5 leading-relaxed">
              Stagnant high-pressure thermal ridge creates extreme cumulative heat exposure peaking at +2d.
            </p>

            {/* Trajectory breakdown steps */}
            <div className="flex flex-col gap-2.5 text-[12px]">
              <div className="p-3 bg-[#182030] rounded-lg border border-[#263147] flex justify-between items-center">
                <span className="text-[#94a3b8]">Today (Baseline)</span>
                <span className="text-orange-400 font-mono font-bold">36.2°C Peak</span>
              </div>
              <div className="p-3 bg-[#182030] rounded-lg border border-[#263147] flex justify-between items-center">
                <span className="text-[#94a3b8]">+1 Day Trajectory</span>
                <span className="text-red-400 font-mono font-bold">37.8°C (Extreme Danger)</span>
              </div>
              <div className="p-3 bg-[#182030] rounded-lg border border-red-500/30 flex justify-between items-center bg-red-500/10">
                <span className="text-red-400 font-medium">+2 Days Critical Crest</span>
                <span className="text-red-400 font-mono font-bold">38.5°C (Maximum Peak)</span>
              </div>
              <div className="p-3 bg-[#182030] rounded-lg border border-[#263147] flex justify-between items-center">
                <span className="text-[#94a3b8]">+3 Days Subsidence</span>
                <span className="text-amber-400 font-mono font-bold">36.0°C</span>
              </div>
              <div className="p-3 bg-[#182030] rounded-lg border border-[#263147] flex justify-between items-center">
                <span className="text-[#94a3b8]">+4 Days Cold Front Passage</span>
                <span className="text-emerald-400 font-mono font-bold">33.4°C</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#1e2638] flex items-center justify-between text-[11px] text-[#64748b]">
            <span>Model: ECMWF &amp; NOAA Mesonet</span>
            <span className="text-blue-400 font-medium">Synoptic Ridge Tracking</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

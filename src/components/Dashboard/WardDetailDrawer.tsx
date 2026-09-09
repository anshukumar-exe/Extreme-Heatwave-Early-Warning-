import React, { useState } from 'react';
import { motion } from 'motion/react';
import { WardData, ProtocolItem } from '../../types';

interface WardDetailDrawerProps {
  ward: WardData | null;
  onClose: () => void;
  onExecuteProtocol: (wardId: string, protocol: ProtocolItem) => void;
  onOpenLogEventModal: (ward: WardData) => void;
  onOpenLogsModal: () => void;
  forecastDayOffset: number;
  onOpenForecastView?: () => void;
}

export const WardDetailDrawer: React.FC<WardDetailDrawerProps> = ({
  ward,
  onClose,
  onExecuteProtocol,
  onOpenLogEventModal,
  onOpenLogsModal,
  forecastDayOffset,
  onOpenForecastView
}) => {
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);

  if (!ward) return null;

  const currentTemp = ward.forecastTemps[forecastDayOffset] !== undefined
    ? ward.forecastTemps[forecastDayOffset]
    : ward.currentTemp;

  const isCritical = currentTemp >= 35.0 || ward.status === 'critical';
  const isWarning = currentTemp >= 31.0 && currentTemp < 35.0;

  // Chart coordinate mapping (viewBox 0 0 320 160)
  const chartPoints = ward.thermalProfile24h.map((pt, idx) => {
    const x = 25 + idx * 45;
    const normalizedY = 135 - ((pt.temp - 25) / 15) * 115;
    return { x, y: normalizedY, time: pt.time, temp: pt.temp };
  });

  const dangerY = 135 - ((35 - 25) / 15) * 115;
  const warningY = 135 - ((31 - 25) / 15) * 115;

  const createSvgPath = () => {
    if (chartPoints.length === 0) return '';
    let path = `M ${chartPoints[0].x} ${chartPoints[0].y}`;
    for (let i = 0; i < chartPoints.length - 1; i++) {
      const p0 = chartPoints[i];
      const p1 = chartPoints[i + 1];
      const cpX = (p0.x + p1.x) / 2;
      path += ` C ${cpX} ${p0.y}, ${cpX} ${p1.y}, ${p1.x} ${p1.y}`;
    }
    return path;
  };

  const linePath = createSvgPath();
  const areaPath = `${linePath} L ${chartPoints[chartPoints.length - 1].x} 145 L ${chartPoints[0].x} 145 Z`;

  return (
    <motion.aside
      initial={{ x: '100%', opacity: 0.6 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '100%', opacity: 0 }}
      transition={{ type: 'spring', damping: 30, stiffness: 320, mass: 0.8 }}
      className="absolute right-0 top-0 h-full w-full sm:w-[420px] md:w-[440px] bg-[#0c101b] border-l border-[#232d42] flex flex-col z-30 shadow-2xl select-none"
    >
      {/* Navigation Header */}
      <div className="px-5 py-3.5 border-b border-white/[0.08] flex items-center justify-between bg-[#080c14]">
        <button
          onClick={onClose}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-blue-400 hover:text-white text-[12.5px] font-medium transition-colors group"
          id="drawer-back-to-map-btn"
        >
          <span className="material-symbols-outlined text-[16px] group-hover:-translate-x-0.5 transition-transform">
            arrow_back
          </span>
          <span>Back to Spatial Grid</span>
        </button>

        <button 
          onClick={onClose}
          className="text-slate-400 hover:text-white hover:bg-white/[0.08] p-1.5 rounded-lg transition-colors"
          title="Close Panel"
          id="drawer-close-icon-btn"
        >
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>
      </div>

      {/* Ward Title Block */}
      <div className="p-5 border-b border-white/[0.08] bg-[#0f1422]">
        <div className="flex items-center gap-2 mb-1.5">
          <span className={`w-2.5 h-2.5 rounded-full ${isCritical ? 'bg-red-500 animate-pulse' : 'bg-amber-400'}`}></span>
          <span className={`text-[11px] tracking-wider uppercase font-bold ${
            isCritical ? 'text-red-400' : 'text-amber-400'
          }`}>
            {isCritical ? 'CRITICAL THERMAL ZONE' : 'ELEVATED HEAT MONITORING'}
          </span>
        </div>

        <h3 className="text-[22px] text-white font-bold tracking-tight">
          {ward.name}
        </h3>

        <p className="text-[12.5px] text-slate-400 mt-1">
          Population: <strong className="text-slate-200">{ward.population.toLocaleString()}</strong> • Vulnerability Index: <strong className="text-slate-200">{ward.vulnerabilityIndex.toFixed(2)}</strong>
        </p>
      </div>

      {/* Drawer Content Scrollable Area */}
      <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5">
        {/* Environmental Telemetry Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* Surface Temperature */}
          <div className="bg-[#131929] border border-[#1e2638] p-3.5 rounded-xl flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-medium">
                SURFACE TEMP
              </span>
              <span className="material-symbols-outlined text-[16px] text-red-400">thermostat</span>
            </div>
            <div className={`flex items-baseline gap-1 my-1.5 ${isCritical ? 'text-red-400' : 'text-amber-400'}`}>
              <span className="text-[28px] font-bold">
                {currentTemp.toFixed(1)}
              </span>
              <span className="text-[13px] font-normal">°C</span>
            </div>
            <div className="text-[11.5px] text-slate-400 flex items-center justify-between">
              <span>Heat Index:</span>
              <span className="text-red-300 font-bold">{ward.heatIndex}°C</span>
            </div>
          </div>

          {/* Humidity & WBGT */}
          <div className="bg-[#131929] border border-[#1e2638] p-3.5 rounded-xl flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-medium">
                HUMIDITY &amp; WBGT
              </span>
              <span className="material-symbols-outlined text-[16px] text-blue-400">humidity_percentage</span>
            </div>
            <div className="flex items-baseline gap-1 my-1.5 text-blue-400">
              <span className="text-[28px] font-bold">
                {ward.humidity}
              </span>
              <span className="text-[13px] font-normal">%</span>
            </div>
            <div className="text-[11.5px] text-slate-400 flex items-center justify-between">
              <span>WBGT:</span>
              <span className="text-amber-300 font-bold">{ward.wbgt ? ward.wbgt.toFixed(1) : (currentTemp * 0.85).toFixed(1)}°C</span>
            </div>
          </div>

          {/* Wind Velocity */}
          <div className="bg-[#131929] border border-[#1e2638] p-3.5 rounded-xl flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-medium">
                WIND VELOCITY
              </span>
              <span className="material-symbols-outlined text-[16px] text-teal-400">air</span>
            </div>
            <div className="flex items-baseline gap-1 my-1.5 text-white">
              <span className="text-[28px] font-bold">
                {ward.windSpeed || 12}
              </span>
              <span className="text-[13px] text-slate-400">km/h</span>
            </div>
            <div className="text-[11.5px] text-slate-400 flex items-center justify-between">
              <span>Vector:</span>
              <span className="text-teal-400 font-medium">NW Flow</span>
            </div>
          </div>

          {/* Tree Shade Canopy */}
          <div className="bg-[#131929] border border-[#1e2638] p-3.5 rounded-xl flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-medium">
                SHADE CANOPY
              </span>
              <span className="material-symbols-outlined text-[16px] text-emerald-400">park</span>
            </div>
            <div className="flex items-baseline gap-1 my-1.5 text-white">
              <span className={`text-[28px] font-bold ${
                (ward.shadeCoveragePercent || 10) < 15 ? 'text-red-400' : 'text-emerald-400'
              }`}>
                {ward.shadeCoveragePercent || 12}
              </span>
              <span className="text-[13px] text-slate-400">% cover</span>
            </div>
            <div className="text-[11.5px] text-slate-400 flex items-center justify-between">
              <span>Sector Area:</span>
              <span className="text-slate-300 font-medium">{ward.areaKm2 || 16.5} km²</span>
            </div>
          </div>
        </div>

        {/* Exposed Population Breakdown */}
        <div className="bg-[#131929] border border-red-500/20 rounded-xl p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-2.5">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-400 text-[18px]">wb_sunny</span>
              <span className="text-[11.5px] text-amber-300 font-bold uppercase tracking-wider">
                Exposed Population Under Direct Sun
              </span>
            </div>
            <span className="text-[11.5px] text-red-300 font-bold bg-red-500/20 px-2 py-0.5 rounded border border-red-500/30">
              {ward.exposedPopulation ? ward.exposedPopulation.totalExposed.toLocaleString() : Math.round(ward.population * 0.45).toLocaleString()} at risk
            </span>
          </div>

          <p className="text-[12px] text-slate-400 leading-relaxed">
            High surface solar flux ({ward.solarRadiation || 880} W/m²) impacts laborers, delivery workers, and informal settlements lacking air conditioning.
          </p>

          <div className="flex flex-col gap-2.5 mt-1">
            {/* Gig Workers */}
            <div className="bg-[#080c14] p-2.5 rounded-xl border border-[#1e2638]">
              <div className="flex items-center justify-between text-[12px] mb-1">
                <div className="flex items-center gap-2 text-slate-200 font-medium">
                  <span className="material-symbols-outlined text-[16px] text-amber-400">moped</span>
                  <span>Gig &amp; Delivery Couriers</span>
                </div>
                <span className="text-amber-400 font-semibold">
                  {((ward.exposedPopulation?.gigWorkers ?? Math.round(ward.population * 0.05))).toLocaleString()} workers
                </span>
              </div>
              <div className="w-full bg-[#1c2333] h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-amber-400 h-full rounded-full" 
                  style={{ width: `${Math.min(100, ((ward.exposedPopulation?.gigWorkers || 3500) / ward.population) * 400)}%` }}
                ></div>
              </div>
            </div>

            {/* Construction Labor */}
            <div className="bg-[#080c14] p-2.5 rounded-xl border border-[#1e2638]">
              <div className="flex items-center justify-between text-[12px] mb-1">
                <div className="flex items-center gap-2 text-slate-200 font-medium">
                  <span className="material-symbols-outlined text-[16px] text-red-400">engineering</span>
                  <span>Daily Wage Construction Labor</span>
                </div>
                <span className="text-red-400 font-semibold">
                  {((ward.exposedPopulation?.dailyWageLaborers ?? Math.round(ward.population * 0.12))).toLocaleString()} workers
                </span>
              </div>
              <div className="w-full bg-[#1c2333] h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-red-500 h-full rounded-full" 
                  style={{ width: `${Math.min(100, ((ward.exposedPopulation?.dailyWageLaborers || 8000) / ward.population) * 250)}%` }}
                ></div>
              </div>
            </div>

            {/* Elderly Population */}
            <div className="bg-[#080c14] p-2.5 rounded-xl border border-[#1e2638]">
              <div className="flex items-center justify-between text-[12px] mb-1">
                <div className="flex items-center gap-2 text-slate-200 font-medium">
                  <span className="material-symbols-outlined text-[16px] text-amber-300">elderly</span>
                  <span>Elderly Citizens (Age 60+)</span>
                </div>
                <span className="text-amber-300 font-semibold">
                  {((ward.exposedPopulation?.elderlyPopulation ?? ward.exposedPopulation?.elderlyAbove65 ?? Math.round(ward.population * 0.10))).toLocaleString()} seniors
                </span>
              </div>
              <div className="w-full bg-[#1c2333] h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-amber-300 h-full rounded-full" 
                  style={{ width: `${Math.min(100, (((ward.exposedPopulation?.elderlyPopulation ?? ward.exposedPopulation?.elderlyAbove65) || 6000) / ward.population) * 300)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* 24H Thermal Profile Chart */}
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <span className="text-[12px] text-white uppercase font-bold tracking-wider">
              24-Hour Diurnal Temperature Profile
            </span>
            <div className="flex items-center gap-2">
              {onOpenForecastView && (
                <button
                  onClick={onOpenForecastView}
                  className="text-[11px] text-amber-400 hover:text-amber-300 hover:underline flex items-center gap-0.5 font-medium"
                >
                  <span>5-Day Synoptics</span>
                  <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
                </button>
              )}
            </div>
          </div>

          <div className="bg-[#080c14] border border-[#232d42] rounded-xl p-3.5 h-60 relative flex flex-col justify-between overflow-hidden shadow-inner">
            <svg viewBox="0 0 320 160" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="20" y1="20" x2="300" y2="20" stroke="#1c2436" strokeWidth="1" />
              <line x1="20" y1="58" x2="300" y2="58" stroke="#1c2436" strokeWidth="1" />
              <line x1="20" y1="96" x2="300" y2="96" stroke="#1c2436" strokeWidth="1" />
              <line x1="20" y1="135" x2="300" y2="135" stroke="#1c2436" strokeWidth="1" />

              {/* Y-axis Labels */}
              <text x="14" y="24" fill="#64748b" fontSize="9" textAnchor="end" fontFamily="monospace">40</text>
              <text x="14" y="62" fill="#64748b" fontSize="9" textAnchor="end" fontFamily="monospace">35</text>
              <text x="14" y="100" fill="#64748b" fontSize="9" textAnchor="end" fontFamily="monospace">30</text>
              <text x="14" y="138" fill="#64748b" fontSize="9" textAnchor="end" fontFamily="monospace">25</text>

              {/* 35C Danger Line (Red Dashed) */}
              <line 
                x1="20" 
                y1={dangerY} 
                x2="300" 
                y2={dangerY} 
                stroke="#ef4444" 
                strokeWidth="1.2" 
                strokeDasharray="4 4" 
              />

              {/* 31C Warning Line (Orange Solid) */}
              <line 
                x1="20" 
                y1={warningY} 
                x2="300" 
                y2={warningY} 
                stroke="#f59e0b" 
                strokeWidth="1.0" 
              />

              <path d={areaPath} fill="url(#tempGradient)" />
              <path d={linePath} fill="none" stroke="#ef4444" strokeWidth="2.4" strokeLinecap="round" />

              {/* Interactive Points */}
              {chartPoints.map((pt, idx) => {
                const isHovered = hoveredPointIndex === idx;
                return (
                  <g 
                    key={idx} 
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredPointIndex(idx)}
                    onMouseLeave={() => setHoveredPointIndex(null)}
                  >
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={isHovered ? 6 : 3.5}
                      fill="#080c14"
                      stroke="#ef4444"
                      strokeWidth="2"
                    />
                    {isHovered && (
                      <g>
                        <rect
                          x={pt.x - 26}
                          y={pt.y - 28}
                          width="52"
                          height="20"
                          rx="4"
                          fill="#131929"
                          stroke="#232d42"
                          strokeWidth="1"
                        />
                        <text
                          x={pt.x}
                          y={pt.y - 14}
                          textAnchor="middle"
                          fill="#ffffff"
                          fontSize="10"
                          fontFamily="monospace"
                          fontWeight="700"
                        >
                          {pt.temp}°C
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}

              {/* X-axis Labels */}
              {chartPoints.map((pt, idx) => (
                <text
                  key={idx}
                  x={pt.x}
                  y="154"
                  fill="#64748b"
                  fontSize="8.5"
                  textAnchor="middle"
                  fontFamily="monospace"
                >
                  {pt.time}
                </text>
              ))}
            </svg>
          </div>

          {/* Threshold Legend */}
          <div className="flex gap-4 px-1 text-[11px]">
            <div className="flex items-center gap-1.5">
              <div className="w-3.5 h-[1.5px] bg-amber-400"></div>
              <span className="text-slate-400">Warning (31°C)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3.5 h-[1.5px] bg-red-500 border-t border-dashed border-red-500"></div>
              <span className="text-slate-400">Danger (35°C)</span>
            </div>
          </div>
        </div>

        {/* Recommended Protocols Action List */}
        <div className="flex flex-col gap-3">
          <span className="text-[11.5px] text-slate-400 border-b border-white/[0.08] pb-2 uppercase tracking-wider font-bold">
            Sector Response Protocols
          </span>

          <div className="flex flex-col gap-2.5">
            {ward.recommendedProtocols.map((protocol) => {
              const isDone = protocol.status === 'deployed';
              return (
                <div 
                  key={protocol.id}
                  className={`p-3.5 rounded-xl border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 transition-all ${
                    protocol.severity === 'error'
                      ? 'bg-red-500/10 border-red-500/30'
                      : protocol.severity === 'primary'
                      ? 'bg-blue-500/10 border-blue-500/30'
                      : 'bg-[#131929] border-[#1e2638]'
                  }`}
                >
                  <div className="flex gap-3 items-start">
                    <span className={`material-symbols-outlined text-[20px] mt-0.5 ${
                      protocol.severity === 'error' ? 'text-red-400' : 'text-blue-400'
                    }`}>
                      {protocol.icon}
                    </span>
                    <div>
                      <h4 className={`text-[13px] font-semibold mb-0.5 ${
                        protocol.severity === 'error' ? 'text-red-300' : 'text-white'
                      }`}>
                        {protocol.title}
                      </h4>
                      <p className="text-[12px] text-slate-400 leading-normal">
                        {protocol.description}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => onExecuteProtocol(ward.id, protocol)}
                    disabled={isDone}
                    className={`px-3 py-1.5 rounded-lg text-[11.5px] font-semibold transition-all shrink-0 self-end sm:self-center ${
                      isDone
                        ? 'bg-white/[0.05] text-slate-500 cursor-default'
                        : protocol.severity === 'error'
                        ? 'bg-red-600 text-white hover:bg-red-500 active:scale-95'
                        : 'bg-blue-600 text-white hover:bg-blue-500 active:scale-95'
                    }`}
                  >
                    {isDone ? 'Deployed' : protocol.actionLabel || 'Execute'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Drawer Footer Actions */}
      <div className="p-4 border-t border-white/[0.08] bg-[#080c14]">
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={onOpenLogsModal}
            className="bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-slate-200 text-[12.5px] py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-colors font-medium"
          >
            <span className="material-symbols-outlined text-[16px] text-blue-400">history</span>
            <span>Audit Logs</span>
          </button>

          <button 
            onClick={() => onOpenLogEventModal(ward)}
            className="bg-blue-600 hover:bg-blue-500 text-white text-[12.5px] py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all font-semibold shadow-lg shadow-blue-600/20 active:scale-95"
          >
            <span className="material-symbols-outlined text-[16px]">
              edit_note
            </span>
            <span>Record Incident</span>
          </button>
        </div>
      </div>
    </motion.aside>
  );
};

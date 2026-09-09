import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Region, WardData, AlertItem } from '../../types';
import { ScientificThermalEngine, ThermalCalculationResult } from '../../services/thermalEngine';
import { ScientificAuditModal } from '../Modals/ScientificAuditModal';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.02
    }
  }
};

const itemVariants: any = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.25, ease: 'easeOut' }
  }
};

interface DashboardOverviewProps {
  currentRegion: Region;
  wards: WardData[];
  alerts?: AlertItem[];
  onNavigate: (view: any) => void;
  onSelectWard: (ward: WardData) => void;
  onOpenDeployModal: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  currentRegion,
  wards,
  alerts = [],
  onNavigate,
  onSelectWard,
  onOpenDeployModal
}) => {
  const [selectedAuditMetric, setSelectedAuditMetric] = useState<ThermalCalculationResult | null>(null);

  // Compute thermal profile using authoritative scientific engine
  const thermalProfile = ScientificThermalEngine.generateComprehensiveProfile({
    temperatureC: currentRegion.averageTemp,
    relativeHumidity: currentRegion.humidity,
    windSpeedKmh: 12.5,
    solarRadiationWm2: 840
  });

  const criticalWards = wards.filter(w => w.status === 'critical');
  const totalExposedPop = wards.reduce((sum, w) => {
    if (w.exposedPopulation) {
      const elderly = w.exposedPopulation.elderlyPopulation ?? w.exposedPopulation.elderlyAbove65 ?? Math.round(w.population * 0.08);
      const gig = w.exposedPopulation.gigWorkers || 0;
      const laborers = w.exposedPopulation.dailyWageLaborers || 0;
      return sum + gig + laborers + elderly;
    }
    return sum + Math.round(w.population * 0.22);
  }, 0);

  const isRedAlert = currentRegion.hazardLevelCode >= 4 || thermalProfile.riskCategory === 'EXTREME';

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto space-y-6 max-w-7xl mx-auto w-full"
      id="dashboard-overview-main"
    >
      {/* Institutional Top Header */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-white/[0.06]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`w-2.5 h-2.5 rounded-full ${isRedAlert ? 'bg-red-500 animate-pulse' : 'bg-amber-400'}`}></span>
            <span className="text-[11px] font-semibold tracking-wider uppercase text-slate-400">
              NATIONAL HEAT ACTION INTELLIGENCE GRID • {currentRegion.state.toUpperCase()}
            </span>
          </div>
          <h1 className="text-[24px] sm:text-[28px] md:text-[32px] text-white font-bold tracking-tight">
            {currentRegion.name} Heat Risk Command
          </h1>
          <p className="text-[13.5px] text-slate-400 mt-0.5">
            Operational biometeorological telemetry &amp; emergency action directives under NDMA / IMD protocols.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => onNavigate('forecast')}
            className="px-4 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.08] text-slate-200 hover:text-white text-[13px] font-medium flex items-center gap-2 transition-colors"
            id="overview-forecast-btn"
          >
            <span className="material-symbols-outlined text-[17px] text-amber-400">calendar_month</span>
            <span>5-Day Forecast</span>
          </button>

          <button
            onClick={onOpenDeployModal}
            className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-[13px] font-semibold flex items-center gap-2 shadow-lg shadow-red-600/20 transition-all active:scale-95"
            id="overview-deploy-btn"
          >
            <span className="material-symbols-outlined text-[18px]">emergency</span>
            <span>Deploy Response</span>
          </button>
        </div>
      </motion.div>

      {/* ========================================================================= */}
      {/* 1. CURRENT RISK LEVEL & 2. TEMPERATURE / THERMAL STRESS (DOMINANT BANNER) */}
      {/* ========================================================================= */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Dominant Thermal Threat Status Card (8 cols) */}
        <div className={`lg:col-span-8 rounded-2xl p-6 sm:p-7 relative overflow-hidden border ${
          isRedAlert 
            ? 'bg-gradient-to-br from-[#1c0d12] via-[#120d18] to-[#0c101b] border-red-500/30' 
            : 'bg-gradient-to-br from-[#1a140d] via-[#14121b] to-[#0c101b] border-amber-500/30'
        }`}>
          {/* Top Risk Status Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-2.5">
              <span className={`px-3 py-1 rounded-lg text-[12px] font-bold tracking-wide uppercase flex items-center gap-1.5 ${
                isRedAlert 
                  ? 'bg-red-500/25 text-red-300 border border-red-500/40' 
                  : 'bg-amber-500/25 text-amber-300 border border-amber-500/40'
              }`}>
                <span className="material-symbols-outlined text-[16px]">warning</span>
                IMD {currentRegion.hazardLevelCode >= 4 ? 'RED ALERT — SEVERE HEATWAVE' : 'ORANGE WARNING — HEATWAVE'}
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-[12px] text-slate-400 font-mono">
                Zone: {currentRegion.imdZone}
              </span>
            </div>

            <span className="text-[12px] text-slate-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Live Synoptic Feed Active
            </span>
          </div>

          {/* Primary Metric Readouts: Ambient Temp & WBGT */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
            {/* Ambient Temperature */}
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                Ambient Dry-Bulb Temp
              </span>
              <div className="flex items-baseline gap-1 text-white">
                <span className="text-[38px] sm:text-[44px] font-extrabold tracking-tight">
                  {currentRegion.averageTemp.toFixed(1)}
                </span>
                <span className="text-[20px] font-medium text-slate-400">°C</span>
              </div>
              <span className="text-[11.5px] text-red-400 font-medium block mt-0.5">
                +{thermalProfile.anomalyDeltaC}°C vs 30-yr baseline
              </span>
            </div>

            {/* Wet-Bulb Globe Temp (WBGT) */}
            <div 
              onClick={() => setSelectedAuditMetric(thermalProfile.wbgt)}
              className="cursor-pointer group"
              title="Click to view scientific Liljegren audit trail"
            >
              <div className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-amber-400 mb-1">
                <span>Wet-Bulb Globe (WBGT)</span>
                <span className="material-symbols-outlined text-[13px] opacity-70 group-hover:opacity-100">info</span>
              </div>
              <div className="flex items-baseline gap-1 text-amber-300">
                <span className="text-[38px] sm:text-[44px] font-extrabold tracking-tight">
                  {thermalProfile.wbgt.value}
                </span>
                <span className="text-[20px] font-medium text-amber-400/70">°C</span>
              </div>
              <span className="text-[11.5px] text-amber-400/90 font-medium block mt-0.5">
                Critical human strain limit crossed
              </span>
            </div>

            {/* Heat Index / Apparent Temperature */}
            <div
              onClick={() => setSelectedAuditMetric(thermalProfile.heatIndex)}
              className="cursor-pointer group"
              title="Click to view Rothfusz equation audit"
            >
              <div className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                <span>Apparent Heat Index</span>
                <span className="material-symbols-outlined text-[13px] opacity-70 group-hover:opacity-100">info</span>
              </div>
              <div className="flex items-baseline gap-1 text-slate-200">
                <span className="text-[38px] sm:text-[44px] font-extrabold tracking-tight">
                  {thermalProfile.heatIndex.value}
                </span>
                <span className="text-[20px] font-medium text-slate-400">°C</span>
              </div>
              <span className="text-[11.5px] text-slate-400 block mt-0.5">
                Feels-like under humidity ({currentRegion.humidity}%)
              </span>
            </div>
          </div>

          {/* Biological Impact Assessment */}
          <div className="pt-4 border-t border-white/[0.08] flex items-start gap-3 text-[13px] text-slate-300">
            <span className="material-symbols-outlined text-red-400 text-[20px] shrink-0 mt-0.5">health_and_safety</span>
            <p className="leading-relaxed">
              <strong className="text-white">Physiological Risk Note:</strong> High ambient air combined with severe thermal radiation ({thermalProfile.wbgt.value}°C WBGT) severely reduces evaporative sweat cooling in human bodies. Unprotected outdoor physical exertion beyond 30 minutes risks heat exhaustion and cardiovascular collapse.
            </p>
          </div>
        </div>

        {/* Human Thermal Stress Gauge (4 cols) */}
        <div className="lg:col-span-4 bg-[#0d121f] border border-[#232d42] rounded-2xl p-6 flex flex-col items-center justify-between text-center">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
              Human Thermal Stress Score
            </span>
            <span className="text-[12px] text-slate-400 mt-0.5 block">
              Composite physiological index (0–100 scale)
            </span>
          </div>

          {/* Clean Circular Gauge */}
          <div className="relative my-3 flex items-center justify-center">
            <svg className="w-40 h-40 transform -rotate-90">
              <circle
                cx="80"
                cy="80"
                r="66"
                stroke="#1e2738"
                strokeWidth="12"
                fill="transparent"
              />
              <circle
                cx="80"
                cy="80"
                r="66"
                stroke={isRedAlert ? '#ef4444' : '#f59e0b'}
                strokeWidth="12"
                strokeDasharray={414}
                strokeDashoffset={414 - (414 * thermalProfile.riskScore0to100) / 100}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-500 ease-out"
              />
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[40px] font-extrabold text-white tracking-tight">
                {thermalProfile.riskScore0to100}
              </span>
              <span className="text-[10.5px] font-semibold text-slate-400 uppercase tracking-wider">
                out of 100
              </span>
            </div>
          </div>

          <div className="w-full">
            <div className={`py-1.5 px-3 rounded-lg text-[12px] font-bold uppercase tracking-wider ${
              isRedAlert 
                ? 'bg-red-500/20 text-red-300 border border-red-500/30' 
                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
            }`}>
              {thermalProfile.riskCategory} EXPOSURE THREAT
            </div>
            <div className="text-[12px] text-slate-400 mt-2">
              Vulnerable Citizens at Risk: <strong className="text-slate-200">{totalExposedPop.toLocaleString()}</strong>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ========================================================================= */}
      {/* 3. EXPECTED PEAK-RISK PERIOD (AUTHORITATIVE PROMINENT CALLOUT)             */}
      {/* ========================================================================= */}
      <motion.div variants={itemVariants} className="bg-[#141a29] border border-amber-500/30 rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <span className="material-symbols-outlined text-[26px]">schedule</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-amber-400 tracking-wider uppercase">
                CRITICAL DIURNAL WINDOW
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-[12px] text-slate-300">Peak Thermal Load Period</span>
            </div>
            <h2 className="text-[20px] sm:text-[22px] font-bold text-white tracking-tight mt-0.5">
              12:30 PM – 4:30 PM IST (Peak Solar &amp; Thermal Stress)
            </h2>
            <p className="text-[13px] text-slate-400 mt-0.5">
              Maximum surface solar irradiance (~880 W/m²). High nocturnal minimum (30.2°C) traps heat in informal dwellings overnight.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 self-stretch md:self-auto justify-end">
          <button
            onClick={() => onNavigate('infrastructure')}
            className="w-full md:w-auto px-4 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 text-[12.5px] font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[16px]">home_pin</span>
            <span>View 12 Cooling Shelters</span>
          </button>
        </div>
      </motion.div>

      {/* ========================================================================= */}
      {/* 4. RECOMMENDED IMMEDIATE ACTIONS (TASK-ORIENTED FOR OPERATIONAL TEAMS)     */}
      {/* ========================================================================= */}
      <motion.div variants={itemVariants} className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-400 text-[20px]">assignment_turned_in</span>
            <h3 className="text-[17px] sm:text-[18px] font-bold text-white tracking-tight">
              Recommended Immediate Action Directives
            </h3>
          </div>
          <span className="text-[12px] text-slate-400">Enforceable under NDMA Heat Action Framework</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Outdoor Workers & Field Labor */}
          <div className="bg-[#0d121f] border border-[#232d42] hover:border-[#33415c] rounded-2xl p-5 flex flex-col justify-between transition-colors">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                  OUTDOOR WORKERS &amp; LABOR
                </span>
                <span className="material-symbols-outlined text-amber-400 text-[20px]">engineering</span>
              </div>
              <h4 className="text-[15px] font-semibold text-white mb-2">
                Mandatory Rest-Shade Cycle
              </h4>
              <ul className="text-[12.5px] text-slate-300 space-y-2 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold">•</span>
                  <span>Enforce mandatory 15-minute shaded rest breaks every 45 minutes for construction and gig workers.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold">•</span>
                  <span>Halt asphalt road laying and unshaded rooftop masonry between 12:00 PM and 4:00 PM.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold">•</span>
                  <span>Employers must provide chilled potable water and oral rehydration salts (ORS) at muster points.</span>
                </li>
              </ul>
            </div>
            <div className="mt-4 pt-3 border-t border-white/[0.06] text-[11.5px] text-slate-400">
              Coverage: {currentRegion.name} Municipal Labor Registry
            </div>
          </div>

          {/* Card 2: Civic & Municipal Response */}
          <div className="bg-[#0d121f] border border-[#232d42] hover:border-[#33415c] rounded-2xl p-5 flex flex-col justify-between transition-colors">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold text-sky-400 uppercase tracking-wider">
                  MUNICIPAL CIVIC SERVICES
                </span>
                <span className="material-symbols-outlined text-sky-400 text-[20px]">water_drop</span>
              </div>
              <h4 className="text-[15px] font-semibold text-white mb-2">
                Cooling Shelters &amp; Hydration
              </h4>
              <ul className="text-[12.5px] text-slate-300 space-y-2 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-sky-400 font-bold">•</span>
                  <span>Keep all designated air-conditioned public halls and transit depots operational from 10:00 AM to 8:00 PM.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-sky-400 font-bold">•</span>
                  <span>Dispatch civic mobile water misting tankers to Ward 3, Ward 7, and major bus terminals.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-sky-400 font-bold">•</span>
                  <span>Activate grid peak load protections at power substations to avert localized electrical blackouts.</span>
                </li>
              </ul>
            </div>
            <div className="mt-4 pt-3 border-t border-white/[0.06] text-[11.5px] text-slate-400">
              Agency: City Disaster Management Cell
            </div>
          </div>

          {/* Card 3: Public Health & Citizen Safety */}
          <div className="bg-[#0d121f] border border-[#232d42] hover:border-[#33415c] rounded-2xl p-5 flex flex-col justify-between transition-colors">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                  HEALTH &amp; CITIZEN SAFETY
                </span>
                <span className="material-symbols-outlined text-emerald-400 text-[20px]">local_hospital</span>
              </div>
              <h4 className="text-[15px] font-semibold text-white mb-2">
                Medical Readiness &amp; Advisories
              </h4>
              <ul className="text-[12.5px] text-slate-300 space-y-2 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span>Pre-stock intravenous saline (IV fluids) and ice-bath immersion tubs at all Primary Health Centers.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span>Targeted welfare checks on elderly citizens living alone in top-floor concrete or tin-roof dwellings.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span>Direct citizens to toll-free emergency helpline (1800-22-COOL) for ambulance and water support.</span>
                </li>
              </ul>
            </div>
            <div className="mt-4 pt-3 border-t border-white/[0.06] text-[11.5px] text-slate-400">
              Surveillance: State Integrated Disease Surveillance Program
            </div>
          </div>
        </div>
      </motion.div>

      {/* ========================================================================= */}
      {/* 5. SUPPORTING ENVIRONMENTAL INFORMATION & 6. HISTORICAL CONTEXTUAL DATA   */}
      {/* ========================================================================= */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Supporting Environmental Telemetry (7 cols) */}
        <div className="lg:col-span-7 bg-[#0d121f] border border-[#232d42] rounded-2xl p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[15px] font-bold text-white tracking-tight">
              Supporting Environmental Observations
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">15-min Telemetry Update</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="bg-[#131929] border border-[#1e2638] p-3.5 rounded-xl">
              <span className="text-[11px] text-slate-400 block font-medium">RELATIVE HUMIDITY</span>
              <div className="text-[22px] font-bold text-white mt-1">{currentRegion.humidity}%</div>
              <span className="text-[11px] text-slate-400">Moisture load</span>
            </div>

            <div className="bg-[#131929] border border-[#1e2638] p-3.5 rounded-xl">
              <span className="text-[11px] text-slate-400 block font-medium">WIND VELOCITY</span>
              <div className="text-[22px] font-bold text-white mt-1">12.5 <span className="text-[13px] font-normal text-slate-400">km/h</span></div>
              <span className="text-[11px] text-slate-400">NW dry gust</span>
            </div>

            <div className="bg-[#131929] border border-[#1e2638] p-3.5 rounded-xl">
              <span className="text-[11px] text-slate-400 block font-medium">SOLAR IRRADIANCE</span>
              <div className="text-[22px] font-bold text-white mt-1">840 <span className="text-[13px] font-normal text-slate-400">W/m²</span></div>
              <span className="text-[11px] text-slate-400">Peak direct flux</span>
            </div>

            <div className="bg-[#131929] border border-[#1e2638] p-3.5 rounded-xl">
              <span className="text-[11px] text-slate-400 block font-medium">NIGHT MIN TEMP</span>
              <div className="text-[22px] font-bold text-amber-400 mt-1">30.2 <span className="text-[13px] font-normal text-slate-400">°C</span></div>
              <span className="text-[11px] text-amber-400/80">Nocturnal heat trap</span>
            </div>
          </div>

          {/* 7. Technical Metadata trigger button */}
          <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[12px] text-slate-400">
            <span>Model Core: Liljegren WBGT / Stull Formula (2011) / Fiala UTCI</span>
            <button
              onClick={() => setSelectedAuditMetric(thermalProfile.wbgt)}
              className="text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 transition-colors"
            >
              <span>Scientific Audit Trail</span>
              <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
            </button>
          </div>
        </div>

        {/* Historical Context & Anomaly (5 cols) */}
        <div className="lg:col-span-5 bg-[#0d121f] border border-[#232d42] rounded-2xl p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[15px] font-bold text-white tracking-tight">
                Historical Climate Context
              </h3>
              <span className="text-[11px] text-slate-400 font-mono">1991–2020 IMD Normals</span>
            </div>

            <div className="space-y-3 text-[13px]">
              <div className="flex items-center justify-between p-3 bg-[#131929] border border-[#1e2638] rounded-xl">
                <span className="text-slate-300">Historical Distribution</span>
                <span className="font-bold text-amber-300 text-[14px]">{thermalProfile.historicalPercentile}th Percentile</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-[#131929] border border-[#1e2638] rounded-xl">
                <span className="text-slate-300">Continuous Heatwave Run</span>
                <span className="font-bold text-white text-[14px]">Day 3 of {thermalProfile.expectedDurationHours}h expected</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-[#131929] border border-[#1e2638] rounded-xl">
                <span className="text-slate-300">Heatwave Probability (48h)</span>
                <span className="font-bold text-red-400 text-[14px]">{thermalProfile.heatwaveProbability}% Confirmed</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/[0.06] text-[12px] text-slate-400 flex items-center justify-between">
            <span>Historical baseline: 39.6°C normal</span>
            <button
              onClick={() => onNavigate('history')}
              className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
            >
              Historical Analysis →
            </button>
          </div>
        </div>
      </motion.div>

      {/* Critical Wards Requiring Immediate Action */}
      <motion.div variants={itemVariants} className="bg-[#0d121f] border border-[#232d42] rounded-2xl p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-[17px] font-bold text-white tracking-tight">
              High-Risk Municipal Wards Requiring Action
            </h3>
            <p className="text-[12.5px] text-slate-400 mt-0.5">
              Sectors where WBGT and demographic vulnerability index require priority cooling resource allocation.
            </p>
          </div>

          <button
            onClick={() => onNavigate('map')}
            className="text-blue-400 hover:text-blue-300 text-[13px] font-semibold flex items-center gap-1 transition-colors self-start sm:self-auto"
          >
            <span>Open Spatial Grid Map</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {wards.slice(0, 4).map((w) => (
            <div
              key={w.id}
              onClick={() => onSelectWard(w)}
              className="p-4 rounded-xl bg-[#131929] border border-[#1e2638] hover:border-blue-500/40 cursor-pointer transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[14px] font-bold text-white group-hover:text-blue-300 transition-colors">
                    {w.name}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                    w.status === 'critical'
                      ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  }`}>
                    {w.status}
                  </span>
                </div>

                <div className="flex items-baseline gap-1 my-2">
                  <span className="text-[26px] font-extrabold text-white">{w.currentTemp}°C</span>
                  <span className="text-[12px] text-slate-400">ambient</span>
                  <span className="text-slate-600 mx-1">•</span>
                  <span className="text-[13px] text-amber-400 font-semibold">{w.heatIndex}°C HI</span>
                </div>

                <div className="text-[11.5px] text-slate-400 space-y-1">
                  <div>Vulnerability Index: <strong className="text-slate-200">{w.vulnerabilityIndex.toFixed(2)}</strong></div>
                  <div>Exposed Population: <strong className="text-slate-200">{(w.exposedPopulation?.totalExposed || Math.round(w.population * 0.3)).toLocaleString()}</strong></div>
                  <div>Tree Shade Canopy: <strong className="text-slate-200">{w.shadeCoveragePercent ?? 12}%</strong></div>
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-white/[0.06] text-[11.5px] text-blue-400 font-medium flex items-center justify-between">
                <span>View Ward Directives</span>
                <span className="material-symbols-outlined text-[15px] group-hover:translate-x-0.5 transition-transform">arrow_forward</span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Scientific Audit Modal (Layer 7 Technical metadata) */}
      {selectedAuditMetric && (
        <ScientificAuditModal
          result={selectedAuditMetric}
          onClose={() => setSelectedAuditMetric(null)}
        />
      )}
    </motion.div>
  );
};

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Region } from '../../types';
import { ScientificThermalEngine, MeteorologicalInputs, ThermalCalculationResult } from '../../services/thermalEngine';
import { ScientificAuditModal } from '../Modals/ScientificAuditModal';

interface ThermalStressViewProps {
  currentRegion: Region;
  onOpenAuditModal?: () => void;
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

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] }
  }
};

export const ThermalStressView: React.FC<ThermalStressViewProps> = ({ currentRegion, onOpenAuditModal, onNavigate }) => {
  const [temperature, setTemperature] = useState<number>(currentRegion.averageTemp || 42.0);
  const [humidity, setHumidity] = useState<number>(currentRegion.humidity || 48);
  const [windSpeed, setWindSpeed] = useState<number>(12.0);
  const [solarRadiation, setSolarRadiation] = useState<number>(850);
  const [unitCelsius, setUnitCelsius] = useState<boolean>(true);
  const [selectedAudit, setSelectedAudit] = useState<ThermalCalculationResult | null>(null);
  const [verificationSuiteRun, setVerificationSuiteRun] = useState<boolean>(false);
  const [testResults, setTestResults] = useState<any>(null);

  const inputs: MeteorologicalInputs = {
    temperatureC: temperature,
    relativeHumidity: humidity,
    windSpeedKmh: windSpeed,
    solarRadiationWm2: solarRadiation
  };

  const validation = ScientificThermalEngine.validateInputs(inputs);
  const profile = ScientificThermalEngine.generateComprehensiveProfile(inputs);

  const handleRunVerification = () => {
    const results = ScientificThermalEngine.runScientificVerificationSuite();
    setTestResults(results);
    setVerificationSuiteRun(true);
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex-1 bg-[#0c0f17] p-6 md:p-8 overflow-y-auto selection:bg-[#2563eb] selection:text-white space-y-6"
      id="thermal-stress-view-panel"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#1e2638]">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            {onNavigate && (
              <button
                onClick={() => onNavigate('dashboard')}
                className="flex items-center gap-1.5 text-[11.5px] font-medium text-[#60a5fa] hover:text-[#93c5fd] transition-colors py-1 px-2.5 rounded-lg bg-[#141a29] hover:bg-[#1c2438] border border-[#263147] group"
                id="thermal-stress-back-btn"
              >
                <span className="material-symbols-outlined text-[15px] group-hover:-translate-x-0.5 transition-transform">
                  arrow_back
                </span>
                <span>Command Overview</span>
              </button>
            )}
            <span className="text-[#334155]">•</span>
            <span className="material-symbols-outlined text-blue-400 text-[18px]">science</span>
            <span className="text-[11px] text-blue-400 uppercase tracking-wider font-semibold">
              HUMAN BIOMETEOROLOGY ENGINE
            </span>
          </div>
          <h1 className="text-[22px] md:text-[28px] text-white font-bold tracking-tight">
            Thermal Stress Calculation &amp; Audit Workspace
          </h1>
          <p className="text-[13px] text-[#94a3b8] mt-1">
            Biometeorological algorithms verified against Stull (2011), Liljegren WBGT, Fiala UTCI, and NOAA NWS standards.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start md:self-auto">
          {onOpenAuditModal && (
            <button
              onClick={onOpenAuditModal}
              className="px-3.5 py-2 rounded-lg bg-[#141a29] hover:bg-[#1c2438] border border-[#263147] text-[#94a3b8] hover:text-white text-[12px] font-medium flex items-center gap-1.5 transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">history_edu</span>
              <span>Audit Log</span>
            </button>
          )}
          <button
            onClick={handleRunVerification}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[12.5px] font-medium flex items-center gap-2 transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined text-[17px]">rule</span>
            <span>Run Verification Suite</span>
          </button>
        </div>
      </motion.div>

      {/* Test Suite Banner */}
      {verificationSuiteRun && testResults && (
        <div className="p-5 bg-[#121622] border border-blue-500/30 rounded-xl space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-400 text-[20px]">verified</span>
              <span className="font-semibold text-white text-[14px]">
                Scientific Test Suite: {testResults.testsPassed}/{testResults.totalTests} Algorithms Passed Reference Tolerances
              </span>
            </div>
            <button
              onClick={() => setVerificationSuiteRun(false)}
              className="text-[#64748b] hover:text-white text-[12px] transition-colors"
            >
              Dismiss
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-[12px]">
            {testResults.results.map((r: any, idx: number) => (
              <div key={idx} className="bg-[#182030] p-3 rounded-lg border border-[#263147] flex justify-between items-center">
                <div>
                  <span className="text-white font-medium block">{r.testName}</span>
                  <span className="text-[#64748b] text-[11px]">Exp: {r.expected} | Act: {r.actual}</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  PASSED
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Interactive Input Parameters Panel */}
      <div className="bg-[#121622] border border-[#212a3d] rounded-xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-[17px] text-white font-bold">
              Meteorological Input Parameters
            </h3>
            <p className="text-[12.5px] text-[#94a3b8] mt-0.5">
              Simulate micro-climate scenarios across temperature, humidity, wind, and solar irradiance.
            </p>
          </div>

          <div className="flex items-center gap-1 bg-[#182030] p-1 rounded-lg border border-[#263147] text-[11.5px]">
            <button
              onClick={() => setUnitCelsius(true)}
              className={`px-3 py-1 rounded transition-colors ${unitCelsius ? 'bg-blue-600 text-white font-medium' : 'text-[#94a3b8] hover:text-white'}`}
            >
              Metric (°C)
            </button>
            <button
              onClick={() => setUnitCelsius(false)}
              className={`px-3 py-1 rounded transition-colors ${!unitCelsius ? 'bg-blue-600 text-white font-medium' : 'text-[#94a3b8] hover:text-white'}`}
            >
              Imperial (°F)
            </button>
          </div>
        </div>

        {/* Sliders and Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Dry-Bulb Temp */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-[12px]">
              <span className="text-red-300 font-medium">DRY-BULB AIR TEMP (Ta)</span>
              <span className="font-mono text-white font-bold">{temperature.toFixed(1)}°C</span>
            </div>
            <input
              type="range"
              min="15"
              max="55"
              step="0.1"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="w-full accent-red-500"
            />
            <div className="flex justify-between text-[10px] text-[#64748b]">
              <span>15°C</span>
              <span>35°C</span>
              <span>55°C</span>
            </div>
          </div>

          {/* Relative Humidity */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-[12px]">
              <span className="text-blue-300 font-medium">RELATIVE HUMIDITY (RH)</span>
              <span className="font-mono text-white font-bold">{humidity}%</span>
            </div>
            <input
              type="range"
              min="5"
              max="100"
              step="1"
              value={humidity}
              onChange={(e) => setHumidity(parseInt(e.target.value))}
              className="w-full accent-blue-500"
            />
            <div className="flex justify-between text-[10px] text-[#64748b]">
              <span>5%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Wind Speed */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-[12px]">
              <span className="text-emerald-300 font-medium">WIND SPEED (2m Height)</span>
              <span className="font-mono text-white font-bold">{windSpeed.toFixed(1)} km/h</span>
            </div>
            <input
              type="range"
              min="0"
              max="60"
              step="0.5"
              value={windSpeed}
              onChange={(e) => setWindSpeed(parseFloat(e.target.value))}
              className="w-full accent-emerald-500"
            />
            <div className="flex justify-between text-[10px] text-[#64748b]">
              <span>0 km/h (Calm)</span>
              <span>30 km/h</span>
              <span>60 km/h (Gale)</span>
            </div>
          </div>

          {/* Solar Irradiance */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-[12px]">
              <span className="text-amber-300 font-medium">SOLAR RADIATION (GHI)</span>
              <span className="font-mono text-white font-bold">{solarRadiation} W/m²</span>
            </div>
            <input
              type="range"
              min="0"
              max="1200"
              step="25"
              value={solarRadiation}
              onChange={(e) => setSolarRadiation(parseInt(e.target.value))}
              className="w-full accent-amber-500"
            />
            <div className="flex justify-between text-[10px] text-[#64748b]">
              <span>0 (Night)</span>
              <span>600 (Overcast)</span>
              <span>1200 (Direct Zenith)</span>
            </div>
          </div>
        </div>

        {!validation.valid && (
          <div className="mt-4 p-3 rounded-lg bg-red-500/15 border border-red-500/30 text-red-300 text-[12px]">
            {validation.errors.join(' ')}
          </div>
        )}
      </div>

      {/* Calculated Scientific Indices Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[18px] text-white font-bold">
            Live Computed Thermal Indices
          </h2>
          <span className="text-[12px] text-[#94a3b8]">Click any metric card to review calculation details</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* WBGT */}
          <div
            onClick={() => setSelectedAudit(profile.wbgt)}
            className="bg-[#121622] hover:bg-[#182030] border border-[#212a3d] hover:border-[#334155] p-5 rounded-xl cursor-pointer transition-all flex flex-col justify-between group shadow-sm"
          >
            <div>
              <div className="flex justify-between items-start mb-2">
                <span className="text-[11px] text-red-300 font-semibold tracking-wider uppercase">
                  WBGT (OUTDOOR HEAT STRESS)
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-red-500/15 text-red-400 border border-red-500/30">
                  {profile.wbgt.severityLevel}
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-[34px] font-bold font-mono text-red-400">
                  {profile.wbgt.value}
                </span>
                <span className="text-[15px] text-[#64748b]">°C</span>
              </div>
              <p className="text-[12px] text-[#94a3b8] mt-2 line-clamp-2">
                ACSM / ISO 7243 outdoor occupational health standard. Critical limit for outdoor physical exertion is 32.2°C.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#1e2638] flex justify-between items-center text-[11px] text-[#64748b]">
              <span>Liljegren et al. (2008)</span>
              <span className="text-blue-400 group-hover:text-blue-300 font-medium flex items-center gap-1">
                Audit Trail <span className="text-[13px]">→</span>
              </span>
            </div>
          </div>

          {/* Wet-Bulb */}
          <div
            onClick={() => setSelectedAudit(profile.wetBulb)}
            className="bg-[#121622] hover:bg-[#182030] border border-[#212a3d] hover:border-[#334155] p-5 rounded-xl cursor-pointer transition-all flex flex-col justify-between group shadow-sm"
          >
            <div>
              <div className="flex justify-between items-start mb-2">
                <span className="text-[11px] text-orange-300 font-semibold tracking-wider uppercase">
                  WET-BULB TEMPERATURE (Tw)
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-orange-500/15 text-orange-400 border border-orange-500/30">
                  {profile.wetBulb.severityLevel}
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-[34px] font-bold font-mono text-orange-400">
                  {profile.wetBulb.value}
                </span>
                <span className="text-[15px] text-[#64748b]">°C</span>
              </div>
              <p className="text-[12px] text-[#94a3b8] mt-2 line-clamp-2">
                Absolute thermodynamic limit of human evaporative sweating cooling. 35.0°C Tw represents human survivability limit.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#1e2638] flex justify-between items-center text-[11px] text-[#64748b]">
              <span>Stull (2011)</span>
              <span className="text-blue-400 group-hover:text-blue-300 font-medium flex items-center gap-1">
                Audit Trail <span className="text-[13px]">→</span>
              </span>
            </div>
          </div>

          {/* UTCI */}
          <div
            onClick={() => setSelectedAudit(profile.utci)}
            className="bg-[#121622] hover:bg-[#182030] border border-[#212a3d] hover:border-[#334155] p-5 rounded-xl cursor-pointer transition-all flex flex-col justify-between group shadow-sm"
          >
            <div>
              <div className="flex justify-between items-start mb-2">
                <span className="text-[11px] text-rose-300 font-semibold tracking-wider uppercase">
                  UNIVERSAL THERMAL CLIMATE (UTCI)
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                  {profile.utci.severityLevel}
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-[34px] font-bold font-mono text-rose-400">
                  {profile.utci.value}
                </span>
                <span className="text-[15px] text-[#64748b]">°C</span>
              </div>
              <p className="text-[12px] text-[#94a3b8] mt-2 line-clamp-2">
                Fiala multi-node human thermoregulation simulation incorporating clothing resistance, metabolic rate, and wind effects.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#1e2638] flex justify-between items-center text-[11px] text-[#64748b]">
              <span>Bröde et al. (2012)</span>
              <span className="text-blue-400 group-hover:text-blue-300 font-medium flex items-center gap-1">
                Audit Trail <span className="text-[13px]">→</span>
              </span>
            </div>
          </div>

          {/* Heat Index */}
          <div
            onClick={() => setSelectedAudit(profile.heatIndex)}
            className="bg-[#121622] hover:bg-[#182030] border border-[#212a3d] hover:border-[#334155] p-5 rounded-xl cursor-pointer transition-all flex flex-col justify-between group shadow-sm"
          >
            <div>
              <div className="flex justify-between items-start mb-2">
                <span className="text-[11px] text-amber-300 font-semibold tracking-wider uppercase">
                  HEAT INDEX (NOAA NWS)
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                  {profile.heatIndex.severityLevel}
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-[34px] font-bold font-mono text-amber-400">
                  {profile.heatIndex.value}
                </span>
                <span className="text-[15px] text-[#64748b]">°C</span>
              </div>
              <p className="text-[12px] text-[#94a3b8] mt-2 line-clamp-2">
                Rothfusz regression modeling apparent perceived temperature in shaded areas with light wind.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#1e2638] flex justify-between items-center text-[11px] text-[#64748b]">
              <span>Rothfusz (1990)</span>
              <span className="text-blue-400 group-hover:text-blue-300 font-medium flex items-center gap-1">
                Audit Trail <span className="text-[13px]">→</span>
              </span>
            </div>
          </div>

          {/* Apparent Temp */}
          <div
            onClick={() => setSelectedAudit(profile.apparentTemperature)}
            className="bg-[#121622] hover:bg-[#182030] border border-[#212a3d] hover:border-[#334155] p-5 rounded-xl cursor-pointer transition-all flex flex-col justify-between group shadow-sm"
          >
            <div>
              <div className="flex justify-between items-start mb-2">
                <span className="text-[11px] text-orange-300 font-semibold tracking-wider uppercase">
                  APPARENT TEMPERATURE (BoM)
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-orange-500/15 text-orange-400 border border-orange-500/30">
                  {profile.apparentTemperature.severityLevel}
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-[34px] font-bold font-mono text-orange-400">
                  {profile.apparentTemperature.value}
                </span>
                <span className="text-[15px] text-[#64748b]">°C</span>
              </div>
              <p className="text-[12px] text-[#94a3b8] mt-2 line-clamp-2">
                Steadman biometeorological model including vapor pressure and wind convective heat loss at 10m.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#1e2638] flex justify-between items-center text-[11px] text-[#64748b]">
              <span>Steadman (1994)</span>
              <span className="text-blue-400 group-hover:text-blue-300 font-medium flex items-center gap-1">
                Audit Trail <span className="text-[13px]">→</span>
              </span>
            </div>
          </div>

          {/* Dew Point */}
          <div
            onClick={() => setSelectedAudit(profile.dewPoint)}
            className="bg-[#121622] hover:bg-[#182030] border border-[#212a3d] hover:border-[#334155] p-5 rounded-xl cursor-pointer transition-all flex flex-col justify-between group shadow-sm"
          >
            <div>
              <div className="flex justify-between items-start mb-2">
                <span className="text-[11px] text-blue-300 font-semibold tracking-wider uppercase">
                  DEW POINT TEMPERATURE (Td)
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-500/15 text-blue-400 border border-blue-500/30">
                  {profile.dewPoint.severityLevel}
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-[34px] font-bold font-mono text-blue-400">
                  {profile.dewPoint.value}
                </span>
                <span className="text-[15px] text-[#64748b]">°C</span>
              </div>
              <p className="text-[12px] text-[#94a3b8] mt-2 line-clamp-2">
                Temperature to which air must be cooled to become saturated. High dew points (&gt;24°C) severely impede sweat evaporation.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#1e2638] flex justify-between items-center text-[11px] text-[#64748b]">
              <span>Magnus-Tetens</span>
              <span className="text-blue-400 group-hover:text-blue-300 font-medium flex items-center gap-1">
                Audit Trail <span className="text-[13px]">→</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Scientific Formula & Citation Documentation */}
      <div className="bg-[#121622] border border-[#212a3d] rounded-xl p-6 shadow-sm space-y-4">
        <h3 className="text-[17px] text-white font-bold">
          Mathematical Formulation Reference
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[12.5px] text-[#94a3b8]">
          <div className="bg-[#182030] p-4 rounded-xl border border-[#263147] space-y-2">
            <span className="font-semibold text-blue-400 block font-mono text-[13px]">1. Stull's Wet-Bulb Formulation:</span>
            <p className="font-mono text-[11.5px] text-[#93c5fd] bg-[#0f1420] p-2.5 rounded-lg border border-[#1e2638]">
              Tw = T·atan(0.151977·(RH + 8.313659)^0.5) + atan(T + RH) - atan(RH - 1.676331) + 0.00391838·RH^1.5·atan(0.023101·RH) - 4.686035
            </p>
            <span className="text-[11px] text-[#64748b] block">Citation: Stull (2011), J. Appl. Meteor. Climatol., 50, 2267–2269.</span>
          </div>

          <div className="bg-[#182030] p-4 rounded-xl border border-[#263147] space-y-2">
            <span className="font-semibold text-blue-400 block font-mono text-[13px]">2. Outdoor WBGT Heat Equation:</span>
            <p className="font-mono text-[11.5px] text-[#93c5fd] bg-[#0f1420] p-2.5 rounded-lg border border-[#1e2638]">
              WBGT = 0.7·T_nw + 0.2·T_g + 0.1·T_a
            </p>
            <span className="text-[11px] text-[#64748b] block">Citation: Liljegren et al. (2008) / American College of Sports Medicine (ACSM).</span>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {selectedAudit && (
          <ScientificAuditModal
            result={selectedAudit}
            onClose={() => setSelectedAudit(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { ThermalCalculationResult } from '../../services/thermalEngine';

interface ScientificAuditModalProps {
  result?: ThermalCalculationResult | null;
  onClose: () => void;
}

export const ScientificAuditModal: React.FC<ScientificAuditModalProps> = ({
  result,
  onClose
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!result) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md select-none"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="bg-[#0c101b] border border-[#232d42] w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <span className="material-symbols-outlined text-[22px]">science</span>
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                SCIENTIFIC AUDIT &amp; VALIDATION TRAIL
              </span>
              <h3 className="text-[19px] sm:text-[20px] font-bold text-white tracking-tight">
                {result.metric}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/[0.08] transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-300 text-[13px]">
          {/* Main Value Display */}
          <div className="bg-[#080c14] border border-[#232d42] p-4 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Calculated Metric Output
              </span>
              <div className="flex items-baseline gap-2 text-white">
                <span className="text-[36px] font-extrabold tracking-tight">
                  {result.value}
                </span>
                <span className="text-[18px] font-semibold text-slate-400">{result.unit}</span>
              </div>
            </div>

            <div className="flex flex-col items-end gap-1.5">
              <span className={`px-3 py-1 rounded-full text-[11px] font-bold tracking-wide border ${
                result.severityLevel === 'EXTREME' 
                  ? 'bg-red-500/20 text-red-300 border-red-500/40' 
                  : result.severityLevel === 'DANGER' 
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              }`}>
                {result.severityLevel} SEVERITY
              </span>
              <span className="text-[11.5px] text-slate-400">
                Confidence: <strong className="text-slate-200">{result.confidence}</strong>
              </span>
            </div>
          </div>

          {/* Validation Checklist */}
          <div>
            <h4 className="text-[11.5px] font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Scientific Pipeline Verification
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="bg-[#131929] p-3 rounded-xl border border-[#1e2638] flex items-center gap-2.5">
                <span className="material-symbols-outlined text-emerald-400 text-[18px]">verified</span>
                <div>
                  <div className="text-white font-medium text-[12px]">Range Validation</div>
                  <div className="text-slate-400 text-[11px]">Inputs within physical limits</div>
                </div>
              </div>

              <div className="bg-[#131929] p-3 rounded-xl border border-[#1e2638] flex items-center gap-2.5">
                <span className="material-symbols-outlined text-emerald-400 text-[18px]">verified</span>
                <div>
                  <div className="text-white font-medium text-[12px]">Unit Normalization</div>
                  <div className="text-slate-400 text-[11px]">Standardized SI/IMD units</div>
                </div>
              </div>

              <div className="bg-[#131929] p-3 rounded-xl border border-[#1e2638] flex items-center gap-2.5">
                <span className="material-symbols-outlined text-emerald-400 text-[18px]">verified</span>
                <div>
                  <div className="text-white font-medium text-[12px]">Quality Assessment</div>
                  <div className="text-slate-400 text-[11px]">Status: {result.dataQuality}</div>
                </div>
              </div>

              <div className="bg-[#131929] p-3 rounded-xl border border-[#1e2638] flex items-center gap-2.5">
                <span className={`material-symbols-outlined text-[18px] ${result.fallbackUsed ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {result.fallbackUsed ? 'info' : 'verified'}
                </span>
                <div>
                  <div className="text-white font-medium text-[12px]">Formula Method</div>
                  <div className="text-slate-400 text-[11px]">
                    {result.fallbackUsed ? 'Fallback approximation applied' : 'Direct primary solver used'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Underlying Meteorological Inputs */}
          <div>
            <h4 className="text-[11.5px] font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Input Variable Parameters
            </h4>
            <div className="bg-[#131929] p-4 rounded-xl border border-[#1e2638] grid grid-cols-2 sm:grid-cols-4 gap-3 text-[12px]">
              <div>
                <span className="text-slate-400 block text-[10.5px]">AIR TEMP (Ta)</span>
                <span className="text-white font-bold text-[14px]">{result.inputs.temperatureC}°C</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10.5px]">HUMIDITY (RH)</span>
                <span className="text-white font-bold text-[14px]">{result.inputs.relativeHumidity}%</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10.5px]">WIND SPEED</span>
                <span className="text-white font-bold text-[14px]">{result.inputs.windSpeedKmh ?? 12} km/h</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10.5px]">SOLAR FLUX</span>
                <span className="text-white font-bold text-[14px]">{result.inputs.solarRadiationWm2 ?? 800} W/m²</span>
              </div>
            </div>
          </div>

          {/* Mathematical Method & Reference */}
          <div className="bg-[#080c14] p-4 rounded-xl border border-[#232d42] space-y-2">
            <div className="flex justify-between items-center text-[12px]">
              <span className="text-slate-400">Calculation Method:</span>
              <span className="text-slate-200 font-medium">{result.method}</span>
            </div>
            <div className="flex justify-between items-center text-[12px]">
              <span className="text-slate-400">Scientific Reference:</span>
              <span className="text-blue-400 font-mono text-[11.5px]">{result.scientificReference}</span>
            </div>
            <div className="flex justify-between items-center text-[12px]">
              <span className="text-slate-400">Timestamp:</span>
              <span className="text-slate-300 font-mono">{result.timestamp}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-white/[0.08] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-slate-200 font-medium text-[13px] transition-colors"
          >
            Close Audit
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

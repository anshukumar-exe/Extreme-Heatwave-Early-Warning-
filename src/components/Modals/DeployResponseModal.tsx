import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { WardData } from '../../types';

interface DeployResponseModalProps {
  wards: WardData[];
  onClose: () => void;
  onConfirmDeploy: (modules: string[], targetWardId: string) => void;
}

export const DeployResponseModal: React.FC<DeployResponseModalProps> = ({
  wards,
  onClose,
  onConfirmDeploy
}) => {
  const [selectedWardId, setSelectedWardId] = useState<string>(wards[0]?.id || '');
  const [coolingCenters, setCoolingCenters] = useState<boolean>(true);
  const [mistingUnits, setMistingUnits] = useState<boolean>(true);
  const [gridCurtailment, setGridCurtailment] = useState<boolean>(false);
  const [smsAdvisory, setSmsAdvisory] = useState<boolean>(true);
  const [transitRelief, setTransitRelief] = useState<boolean>(false);
  const [isDeploying, setIsDeploying] = useState<boolean>(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsDeploying(true);

    const modules: string[] = [];
    if (coolingCenters) modules.push('Cooling Centers Activation (Air Conditioned Shelters & ORS)');
    if (mistingUnits) modules.push('Mobile Hydration & Water Tanker Deployment');
    if (gridCurtailment) modules.push('Power Substation Brownout Protection Protocol');
    if (smsAdvisory) modules.push('Targeted Public SMS Heat Advisory');
    if (transitRelief) modules.push('Free Municipal Transit to Designated Cooling Shelters');

    setTimeout(() => {
      setIsDeploying(false);
      onConfirmDeploy(modules, selectedWardId);
      onClose();
    }, 600);
  };

  const currentWard = wards.find(w => w.id === selectedWardId) || wards[0];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="bg-[#0c101b] border border-[#232d42] rounded-2xl w-full max-w-xl p-6 sm:p-7 shadow-2xl relative overflow-hidden"
      >
        {/* Top Danger Glow Accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 via-rose-500 to-amber-500"></div>

        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400">
              <span className="material-symbols-outlined text-[22px]">emergency</span>
            </div>
            <div>
              <h3 className="text-[19px] sm:text-[20px] text-white font-bold tracking-tight">
                Deploy Emergency Heat Response
              </h3>
              <p className="text-[13px] text-slate-400 mt-0.5">
                Authorize rapid municipal resource mobilization under NDMA guidelines
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/[0.08] transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Target Ward Selector */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Target Municipal Sector
            </label>
            <select
              value={selectedWardId}
              onChange={(e) => setSelectedWardId(e.target.value)}
              className="w-full bg-[#080c14] border border-[#232d42] rounded-xl p-3 text-[13.5px] text-slate-100 outline-none focus:border-blue-500 transition-colors"
            >
              {wards.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} (Current: {w.currentTemp}°C • Vulnerability: {w.vulnerabilityIndex.toFixed(2)})
                </option>
              ))}
            </select>
          </div>

          {/* Checklist of Deployment Modules */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Action Modules to Authorize
            </label>

            <div className="flex flex-col gap-2.5">
              <label className="flex items-center justify-between p-3.5 bg-[#131929] rounded-xl border border-[#1e2638] cursor-pointer hover:border-blue-500/40 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-blue-400 text-[20px]">apartment</span>
                  <div>
                    <div className="text-[13px] text-slate-200 font-medium">
                      Activate Designated Cooling Centers
                    </div>
                    <div className="text-[11.5px] text-slate-400">
                      Open air-conditioned municipal community halls &amp; distribute ORS in {currentWard.name}.
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={coolingCenters}
                  onChange={(e) => setCoolingCenters(e.target.checked)}
                  className="w-4 h-4 accent-blue-500 cursor-pointer rounded"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 bg-[#131929] rounded-xl border border-[#1e2638] cursor-pointer hover:border-blue-500/40 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-sky-400 text-[20px]">water_drop</span>
                  <div>
                    <div className="text-[13px] text-slate-200 font-medium">
                      Mobile Water Tankers &amp; Misting Units
                    </div>
                    <div className="text-[11.5px] text-slate-400">
                      Dispatch water tankers to major bus stops, markets, and labor muster points.
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={mistingUnits}
                  onChange={(e) => setMistingUnits(e.target.checked)}
                  className="w-4 h-4 accent-blue-500 cursor-pointer rounded"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 bg-[#131929] rounded-xl border border-[#1e2638] cursor-pointer hover:border-blue-500/40 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-amber-400 text-[20px]">bolt</span>
                  <div>
                    <div className="text-[13px] text-slate-200 font-medium">
                      Substation Grid Overload Mitigation
                    </div>
                    <div className="text-[11.5px] text-slate-400">
                      Curtail non-critical municipal loads to avert grid failure during peak cooling demand.
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={gridCurtailment}
                  onChange={(e) => setGridCurtailment(e.target.checked)}
                  className="w-4 h-4 accent-blue-500 cursor-pointer rounded"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 bg-[#131929] rounded-xl border border-[#1e2638] cursor-pointer hover:border-blue-500/40 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-rose-400 text-[20px]">sms</span>
                  <div>
                    <div className="text-[13px] text-slate-200 font-medium">
                      Mass Public SMS Heat Advisory
                    </div>
                    <div className="text-[11.5px] text-slate-400">
                      Issue vernacular advisory with shelter coordinates to {currentWard.population.toLocaleString()} residents.
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={smsAdvisory}
                  onChange={(e) => setSmsAdvisory(e.target.checked)}
                  className="w-4 h-4 accent-blue-500 cursor-pointer rounded"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 bg-[#131929] rounded-xl border border-[#1e2638] cursor-pointer hover:border-blue-500/40 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-emerald-400 text-[20px]">directions_bus</span>
                  <div>
                    <div className="text-[13px] text-slate-200 font-medium">
                      Free Municipal Transit to Relief Sites
                    </div>
                    <div className="text-[11.5px] text-slate-400">
                      Waive local bus fares for vulnerable citizens traveling to designated cooling shelters.
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={transitRelief}
                  onChange={(e) => setTransitRelief(e.target.checked)}
                  className="w-4 h-4 accent-blue-500 cursor-pointer rounded"
                />
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-3 pt-4 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 rounded-xl text-[13px] font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isDeploying}
              className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-[13px] font-semibold flex items-center gap-2 shadow-lg shadow-red-600/20 transition-all active:scale-95"
            >
              {isDeploying ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Transmitting Orders...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">verified</span>
                  <span>Authorize &amp; Dispatch Fleet</span>
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

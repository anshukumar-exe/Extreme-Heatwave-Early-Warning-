import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { WardData, SystemLog } from '../../types';

interface LogEventModalProps {
  ward: WardData | null;
  operatorName: string;
  onClose: () => void;
  onSaveLog: (log: Omit<SystemLog, 'id' | 'timestamp'>) => void;
}

export const LogEventModal: React.FC<LogEventModalProps> = ({
  ward,
  operatorName,
  onClose,
  onSaveLog
}) => {
  const [level, setLevel] = useState<'ACTION' | 'CRITICAL' | 'WARN' | 'INFO'>('ACTION');
  const [actionTitle, setActionTitle] = useState<string>('Dispatched Emergency Relief Unit');
  const [details, setDetails] = useState<string>('Activated auxiliary cooling and water distribution in sector.');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveLog({
      level,
      operator: operatorName,
      wardId: ward?.id,
      action: actionTitle,
      details
    });
    onClose();
  };

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
        className="bg-[#0c101b] border border-[#232d42] rounded-2xl w-full max-w-lg p-6 sm:p-7 shadow-2xl relative overflow-hidden"
      >
        <div className="flex justify-between items-start mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <span className="material-symbols-outlined text-[22px]">edit_note</span>
            </div>
            <div>
              <h3 className="text-[19px] sm:text-[20px] text-white font-bold tracking-tight">
                Log Emergency Incident Event
              </h3>
              <p className="text-[13px] text-slate-400 mt-0.5">
                Record manual action taken by heat response team
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

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Logged Sector
              </label>
              <input
                type="text"
                disabled
                value={ward ? ward.name : 'Metro Region Wide'}
                className="w-full bg-[#080c14] border border-[#232d42] rounded-xl p-3 text-[13px] text-slate-300 font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Event Severity Level
              </label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value as any)}
                className="w-full bg-[#080c14] border border-[#232d42] rounded-xl p-3 text-[13px] text-slate-100 outline-none focus:border-blue-500 transition-colors"
              >
                <option value="ACTION">ACTION (Commander Order)</option>
                <option value="CRITICAL">CRITICAL (Emergency Hazard)</option>
                <option value="WARN">WARN (Warning Advisory)</option>
                <option value="INFO">INFO (Informational Update)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Action Title / Summary
            </label>
            <input
              type="text"
              value={actionTitle}
              onChange={(e) => setActionTitle(e.target.value)}
              className="w-full bg-[#080c14] border border-[#232d42] rounded-xl p-3 text-[13.5px] text-slate-100 outline-none focus:border-blue-500 transition-colors"
              placeholder="e.g. Dispatched Emergency Relief Unit"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Operational Details &amp; Field Notes
            </label>
            <textarea
              rows={3}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className="w-full bg-[#080c14] border border-[#232d42] rounded-xl p-3 text-[13px] text-slate-100 outline-none focus:border-blue-500 transition-colors resize-none"
              placeholder="Provide specific notes regarding resources, locations, or personnel..."
              required
            ></textarea>
          </div>

          <div className="text-[11.5px] text-slate-400">
            Recorded by Commander / Operator: <strong className="text-slate-200 font-medium">{operatorName}</strong>
          </div>

          <div className="flex justify-end gap-3 mt-2 pt-4 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 rounded-xl text-[13px] font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-[13px] shadow-lg shadow-blue-600/25 transition-all active:scale-95"
            >
              Commit Log Entry
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

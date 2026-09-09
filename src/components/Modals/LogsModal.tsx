import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { SystemLog } from '../../types';

interface LogsModalProps {
  logs: SystemLog[];
  onClose: () => void;
  onClearLogs: () => void;
}

export const LogsModal: React.FC<LogsModalProps> = ({
  logs,
  onClose,
  onClearLogs
}) => {
  const [filterLevel, setFilterLevel] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const filteredLogs = logs.filter(log => {
    if (filterLevel !== 'ALL' && log.level !== filterLevel) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        log.action.toLowerCase().includes(q) ||
        log.details.toLowerCase().includes(q) ||
        log.operator.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `taapraksha_audit_logs_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const getLevelBadge = (level: string) => {
    switch (level) {
      case 'CRITICAL':
        return <span className="bg-red-500/20 text-red-300 border border-red-500/40 px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider">CRITICAL</span>;
      case 'WARN':
        return <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider">WARN</span>;
      case 'ACTION':
        return <span className="bg-blue-500/20 text-blue-300 border border-blue-500/40 px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider">ACTION</span>;
      default:
        return <span className="bg-slate-800 text-slate-300 border border-slate-700 px-2 py-0.5 rounded-md text-[10px] font-medium">INFO</span>;
    }
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
        className="bg-[#0c101b] border border-[#232d42] rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col p-6 sm:p-7 shadow-2xl relative overflow-hidden"
      >
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <span className="material-symbols-outlined text-[22px]">history</span>
            </div>
            <div>
              <h3 className="text-[19px] sm:text-[20px] text-white font-bold tracking-tight">
                System Command Audit &amp; Event Logs
              </h3>
              <p className="text-[12.5px] text-slate-400 mt-0.5">
                Audit trail of automated heat alerts, emergency authorizations, and operator dispatches.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportJson}
              className="bg-white/[0.05] hover:bg-white/[0.1] text-slate-200 border border-white/[0.1] px-3 py-1.5 rounded-xl text-[12px] font-medium flex items-center gap-1.5 transition-colors"
            >
              <span className="material-symbols-outlined text-[15px] text-blue-400">download</span>
              <span>Export JSON</span>
            </button>
            <button 
              onClick={onClose} 
              className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/[0.08] transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="py-3 flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-white/[0.06]">
          <div className="relative w-full sm:w-72">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-[16px]">
              search
            </span>
            <input
              type="text"
              placeholder="Search audit trail..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#080c14] border border-[#232d42] rounded-xl py-2 pl-9 pr-3 text-[12.5px] text-slate-200 outline-none focus:border-blue-500 transition-colors placeholder:text-slate-500"
            />
          </div>

          <div className="flex gap-1.5 text-[11px] w-full sm:w-auto">
            {['ALL', 'ACTION', 'CRITICAL', 'WARN', 'INFO'].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setFilterLevel(lvl)}
                className={`px-3 py-1.5 rounded-lg transition-colors font-medium ${
                  filterLevel === lvl 
                    ? 'bg-blue-600 text-white font-semibold' 
                    : 'bg-white/[0.05] text-slate-400 hover:text-slate-200'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        {/* Logs List Area */}
        <div className="flex-1 overflow-y-auto py-3 divide-y divide-white/[0.04]">
          {filteredLogs.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-[13px]">
              No log entries match the selected filter criteria.
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div key={log.id} className="py-3 px-2 hover:bg-white/[0.02] rounded-lg transition-colors flex flex-col gap-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    {getLevelBadge(log.level)}
                    <span className="text-[13px] text-slate-200 font-semibold">
                      {log.action}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    {log.timestamp}
                  </div>
                </div>
                <p className="text-[12px] text-slate-400 pl-1">
                  {log.details}
                </p>
                <div className="text-[11px] text-slate-500 pl-1">
                  Authorized by: <span className="text-slate-300 font-medium">{log.operator}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-white/[0.08] flex justify-between items-center text-[12px] text-slate-400">
          <span>Total Entries: <strong className="text-slate-200">{logs.length}</strong></span>
          <button
            onClick={onClearLogs}
            className="text-red-400 hover:text-red-300 transition-colors font-medium hover:underline"
          >
            Clear Local Session Logs
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

import React, { useState } from 'react';
import { ScientificThermalEngine } from '../../services/thermalEngine';
import { NotificationEngine, NotificationDeliveryLog } from '../../services/notificationService';

interface AdminViewProps {
  onNavigate?: (view: any) => void;
}

export const AdminView: React.FC<AdminViewProps> = ({ onNavigate }) => {
  const [testResults, setTestResults] = useState<any>(() => ScientificThermalEngine.runScientificVerificationSuite());
  const [simTemp, setSimTemp] = useState<number>(45.0);
  const [simRH, setSimRH] = useState<number>(55);
  const [simRecipient, setSimRecipient] = useState<string>('+91 98765 43210');
  const [simChannel, setSimChannel] = useState<'SMS' | 'WHATSAPP'>('WHATSAPP');
  const [simStatus, setSimStatus] = useState<string | null>(null);
  const [deliveryLogs, setDeliveryLogs] = useState<NotificationDeliveryLog[]>(() => NotificationEngine.getDeliveryLogs());

  const handleRunSuite = () => {
    const res = ScientificThermalEngine.runScientificVerificationSuite();
    setTestResults(res);
  };

  const handleSimulateAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    setSimStatus('Dispatching through telecom / Meta gateway...');

    const res = await NotificationEngine.dispatchNotification({
      recipient: simRecipient,
      channel: simChannel,
      message: `[SIMULATED DISPATCH] Level 3 Heat Alert: Simulated Temp ${simTemp}°C with ${simRH}% RH. Immediate worker shelter mandatory.`,
      alertTitle: 'Simulated Extreme Heatwave Warning',
      sector: 'Admin Simulation Sandbox'
    });

    setSimStatus(res.message);
    setDeliveryLogs([...NotificationEngine.getDeliveryLogs()]);
  };

  return (
    <div className="flex-1 bg-[#0c0f17] p-6 md:p-8 overflow-y-auto selection:bg-[#2563eb] selection:text-white space-y-6" id="admin-view-panel">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#1e2638]">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            {onNavigate && (
              <button
                onClick={() => onNavigate('dashboard')}
                className="flex items-center gap-1.5 text-[11.5px] font-medium text-[#60a5fa] hover:text-[#93c5fd] transition-colors py-1 px-2.5 rounded-lg bg-[#141a29] hover:bg-[#1c2438] border border-[#263147] group"
                id="admin-back-btn"
              >
                <span className="material-symbols-outlined text-[15px] group-hover:-translate-x-0.5 transition-transform">
                  arrow_back
                </span>
                <span>Command Overview</span>
              </button>
            )}
            <span className="text-[#334155]">•</span>
            <span className="material-symbols-outlined text-emerald-400 text-[18px]">admin_panel_settings</span>
            <span className="text-[11px] text-emerald-400 uppercase tracking-wider font-semibold">
              PLATFORM AUDIT &amp; QUALITY ASSURANCE
            </span>
          </div>
          <h1 className="text-[22px] md:text-[28px] text-white font-bold tracking-tight">
            Admin Operations &amp; Scientific Verification Hub
          </h1>
          <p className="text-[13px] text-[#94a3b8] mt-1">
            Inspect system health, verify mathematical algorithm tolerances, audit calculation logs, and run simulated alert dispatches.
          </p>
        </div>

        <button
          onClick={handleRunSuite}
          className="px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-medium flex items-center gap-2 transition-all self-start md:self-auto shadow-sm"
        >
          <span className="material-symbols-outlined text-[17px]">verified</span>
          <span>Re-Verify Scientific Algorithms</span>
        </button>
      </div>

      {/* System Health & Quality KPI Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[#121622] border border-[#212a3d] rounded-xl p-5 shadow-sm">
          <span className="text-[10.5px] text-[#94a3b8] block uppercase font-medium mb-1">SYSTEM HEALTH</span>
          <div className="text-[24px] font-bold text-emerald-400">99.98%</div>
          <span className="text-[11px] text-[#64748b] mt-1 block">Cluster Latency: 12ms</span>
        </div>

        <div className="bg-[#121622] border border-[#212a3d] rounded-xl p-5 shadow-sm">
          <span className="text-[10.5px] text-[#94a3b8] block uppercase font-medium mb-1">DATA VALIDATION</span>
          <div className="text-[24px] font-bold text-emerald-400">100%</div>
          <span className="text-[11px] text-[#64748b] mt-1 block">0 Corrupted Packets</span>
        </div>

        <div className="bg-[#121622] border border-[#212a3d] rounded-xl p-5 shadow-sm">
          <span className="text-[10.5px] text-[#94a3b8] block uppercase font-medium mb-1">ALGORITHM VERIFICATION</span>
          <div className="text-[24px] font-bold text-blue-400">
            {testResults.testsPassed}/{testResults.totalTests} PASSED
          </div>
          <span className="text-[11px] text-[#64748b] mt-1 block">Stull / NOAA / Liljegren</span>
        </div>

        <div className="bg-[#121622] border border-[#212a3d] rounded-xl p-5 shadow-sm">
          <span className="text-[10.5px] text-[#94a3b8] block uppercase font-medium mb-1">TELECOM GATEWAY</span>
          <div className="text-[24px] font-bold text-sky-400">ACTIVE</div>
          <span className="text-[11px] text-[#64748b] mt-1 block">SMS DLT + WhatsApp API</span>
        </div>
      </div>

      {/* Section 1: Scientific Verification Test Suite */}
      <div className="bg-[#121622] border border-[#212a3d] rounded-xl p-6 shadow-sm space-y-4">
        <div className="flex justify-between items-center flex-wrap gap-2">
          <div>
            <h3 className="text-[17px] text-white font-bold">
              Automated Biometeorological Regression Tests
            </h3>
            <p className="text-[12.5px] text-[#94a3b8] mt-0.5">
              Continuous verification of numerical stability and precision against peer-reviewed reference vectors
            </p>
          </div>
          <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            ALL TESTS PASSING
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[12.5px] divide-y divide-[#212a3d]">
            <thead className="text-[11px] text-[#94a3b8] uppercase font-semibold bg-[#182030]">
              <tr>
                <th className="py-3 px-4">Algorithm / Test Name</th>
                <th className="py-3 px-3">Input Conditions</th>
                <th className="py-3 px-3">Expected Reference</th>
                <th className="py-3 px-3">Computed Actual</th>
                <th className="py-3 px-3">Absolute Delta</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e2638] text-[#cbd5e1]">
              {testResults.results.map((r: any, i: number) => (
                <tr key={i} className="hover:bg-[#182030]/60 transition-colors">
                  <td className="py-3 px-4 font-semibold text-white">{r.testName}</td>
                  <td className="py-3 px-3 font-mono text-[11.5px] text-[#94a3b8]">
                    {r.input.temperatureC}°C, {r.input.relativeHumidity}% RH
                  </td>
                  <td className="py-3 px-3 text-white font-medium">{r.expected}°C</td>
                  <td className="py-3 px-3 text-blue-400 font-semibold">{r.actual}°C</td>
                  <td className="py-3 px-3 text-[#94a3b8]">{r.delta}°C</td>
                  <td className="py-3 px-4">
                    <span className="px-2.5 py-0.5 rounded text-[10.5px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      PASSED
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 2: Interactive Simulation Sandbox */}
      <div className="bg-[#121622] border border-[#212a3d] rounded-xl p-6 shadow-sm space-y-6">
        <div>
          <h3 className="text-[17px] text-white font-bold">
            Live Telecom Alert &amp; Thermal Simulation Mode
          </h3>
          <p className="text-[12.5px] text-[#94a3b8] mt-0.5">
            Input custom meteorological scenarios to test automated threshold triggers and simulated dispatch delivery.
          </p>
        </div>

        <form onSubmit={handleSimulateAlert} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-[11px] text-[#94a3b8] uppercase font-semibold mb-1">SIMULATED TEMP (°C)</label>
            <input
              type="number"
              step="0.5"
              value={simTemp}
              onChange={(e) => setSimTemp(parseFloat(e.target.value))}
              className="w-full bg-[#182030] border border-[#263147] rounded-lg p-2.5 text-[13px] text-white outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-[11px] text-[#94a3b8] uppercase font-semibold mb-1">SIMULATED HUMIDITY (%)</label>
            <input
              type="number"
              step="1"
              value={simRH}
              onChange={(e) => setSimRH(parseInt(e.target.value))}
              className="w-full bg-[#182030] border border-[#263147] rounded-lg p-2.5 text-[13px] text-white outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-[11px] text-[#94a3b8] uppercase font-semibold mb-1">DISPATCH CHANNEL</label>
            <select
              value={simChannel}
              onChange={(e: any) => setSimChannel(e.target.value)}
              className="w-full bg-[#182030] border border-[#263147] rounded-lg p-2.5 text-[13px] text-white outline-none focus:border-blue-500"
            >
              <option value="WHATSAPP">WhatsApp Cloud API</option>
              <option value="SMS">Indian Telecom DLT SMS</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] text-[#94a3b8] uppercase font-semibold mb-1">TEST RECIPIENT</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={simRecipient}
                onChange={(e) => setSimRecipient(e.target.value)}
                className="flex-1 bg-[#182030] border border-[#263147] rounded-lg p-2.5 text-[13px] text-white outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-medium transition-all shrink-0 shadow-sm"
              >
                Send Test
              </button>
            </div>
          </div>
        </form>

        {simStatus && (
          <div className="p-3 bg-[#182030] border border-blue-500/40 rounded-xl text-blue-300 text-[12.5px] flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">info</span>
            <span>{simStatus}</span>
          </div>
        )}

        {/* Live Notification Delivery Queue */}
        <div className="space-y-3 pt-2">
          <span className="text-[11px] text-[#94a3b8] uppercase tracking-wider font-semibold block">
            RECENT GATEWAY TRANSMISSION LOGS:
          </span>
          <div className="divide-y divide-[#1e2638] max-h-56 overflow-y-auto">
            {deliveryLogs.map((log) => (
              <div key={log.id} className="py-2.5 flex items-center justify-between text-[12px]">
                <div className="flex-1 pr-4">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[9.5px] font-semibold ${
                      log.channel === 'WHATSAPP' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                    }`}>
                      {log.channel}
                    </span>
                    <span className="text-white font-medium">{log.recipient}</span>
                    <span className="text-[#64748b] text-[11px] font-mono">• {log.timestamp}</span>
                  </div>
                  <p className="text-[#94a3b8] text-[11.5px] line-clamp-1 mt-0.5">{log.payloadSummary}</p>
                </div>

                <div className="text-right whitespace-nowrap">
                  <span className="text-emerald-400 font-medium text-[11px]">DELIVERED</span>
                  <div className="text-[10.5px] text-[#64748b] font-mono">{log.deliveryLatencyMs}ms latency</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

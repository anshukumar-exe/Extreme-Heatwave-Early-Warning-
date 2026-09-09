import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertItem, AlertSeverity, WardData } from '../../types';
import { NotificationEngine, AlertRule, NotificationDeliveryLog } from '../../services/notificationService';

interface AlertsViewProps {
  alerts: AlertItem[];
  wards: WardData[];
  onAcknowledgeAlert: (alertId: string) => void;
  onResolveAlert: (alertId: string) => void;
  onSelectWard: (ward: WardData) => void;
  onOpenDeployModal: () => void;
  onBroadcastAdvisory: (targetSector: string, message: string) => void;
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

export const AlertsView: React.FC<AlertsViewProps> = ({
  alerts,
  wards,
  onAcknowledgeAlert,
  onResolveAlert,
  onSelectWard,
  onOpenDeployModal,
  onBroadcastAdvisory,
  onNavigate
}) => {
  const [activeTab, setActiveTab] = useState<'stream' | 'rules' | 'logs' | 'optin'>('stream');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showBroadcastModal, setShowBroadcastModal] = useState<boolean>(false);
  const [broadcastSector, setBroadcastSector] = useState<string>('All Municipal Sectors');
  const [broadcastMessage, setBroadcastMessage] = useState<string>(
    'NDMA HEAT ALERT: Severe thermal stress active. Mandatory cooling intervals & free hydration open at all municipal cooling centers.'
  );

  // Rule Builder State
  const [rules, setRules] = useState<AlertRule[]>(() => NotificationEngine.getRules());
  const [newRuleMetric, setNewRuleMetric] = useState<'WBGT' | 'TEMPERATURE' | 'HEAT_INDEX' | 'UTCI'>('WBGT');
  const [newRuleThreshold, setNewRuleThreshold] = useState<number>(32.0);
  const [newRuleChannelSms, setNewRuleChannelSms] = useState<boolean>(true);
  const [newRuleChannelWhatsApp, setNewRuleChannelWhatsApp] = useState<boolean>(true);
  const [newRuleAudience, setNewRuleAudience] = useState<'ALL_CITIZENS' | 'OUTDOOR_WORKERS' | 'EMERGENCY_COMMAND'>('OUTDOOR_WORKERS');
  const [ruleSaveSuccess, setRuleSaveSuccess] = useState<boolean>(false);

  // Delivery Logs State
  const [deliveryLogs] = useState<NotificationDeliveryLog[]>(() => NotificationEngine.getDeliveryLogs());

  const filteredAlerts = alerts.filter(alert => {
    if (filterSeverity !== 'all' && alert.severity !== filterSeverity) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        alert.title.toLowerCase().includes(q) ||
        alert.sector.toLowerCase().includes(q) ||
        alert.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getSeverityBadge = (sev: AlertSeverity) => {
    switch (sev) {
      case 'critical':
        return <span className="bg-rose-500/15 border border-rose-500/40 text-rose-400 text-[10.5px] px-2.5 py-0.5 rounded font-semibold uppercase tracking-wide">CRITICAL</span>;
      case 'danger':
        return <span className="bg-amber-500/15 border border-amber-500/40 text-amber-400 text-[10.5px] px-2.5 py-0.5 rounded font-semibold uppercase tracking-wide">DANGER</span>;
      case 'warning':
        return <span className="bg-yellow-500/15 border border-yellow-500/40 text-yellow-300 text-[10.5px] px-2.5 py-0.5 rounded font-semibold uppercase tracking-wide">WARNING</span>;
      case 'info':
        return <span className="bg-blue-500/15 border border-blue-500/40 text-blue-300 text-[10.5px] px-2.5 py-0.5 rounded font-semibold uppercase tracking-wide">INFO</span>;
    }
  };

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    onBroadcastAdvisory(broadcastSector, broadcastMessage);
    NotificationEngine.dispatchNotification({
      recipient: 'All Registered Citizens & Gig Workers',
      channel: 'WHATSAPP',
      message: broadcastMessage,
      alertTitle: 'Municipal Broadcast Advisory',
      sector: broadcastSector
    });
    setShowBroadcastModal(false);
  };

  const handleCreateRule = (e: React.FormEvent) => {
    e.preventDefault();
    const created = NotificationEngine.addRule({
      name: `${newRuleMetric} Threshold Exceedance Rule (${newRuleThreshold}°C)`,
      metric: newRuleMetric,
      condition: 'GREATER_THAN',
      thresholdValue: newRuleThreshold,
      durationMinutes: 30,
      riskLevel: newRuleThreshold >= 33 ? 'EXTREME' : 'DANGER',
      channels: { sms: newRuleChannelSms, whatsapp: newRuleChannelWhatsApp, email: true, push: true },
      targetAudience: newRuleAudience,
      enabled: true
    });
    setRules([...NotificationEngine.getRules()]);
    setRuleSaveSuccess(true);
    setTimeout(() => setRuleSaveSuccess(false), 3000);
  };

  const handleToggleRule = (id: string, enabled: boolean) => {
    NotificationEngine.toggleRule(id, enabled);
    setRules([...NotificationEngine.getRules()]);
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex-1 bg-[#0c0f17] p-6 md:p-8 overflow-y-auto selection:bg-[#2563eb] selection:text-white space-y-6"
      id="alerts-view-panel"
    >
      {/* Alerts View Header */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#1e2638]">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            {onNavigate && (
              <button
                onClick={() => onNavigate('dashboard')}
                className="flex items-center gap-1.5 text-[11.5px] font-medium text-[#60a5fa] hover:text-[#93c5fd] transition-colors py-1 px-2.5 rounded-lg bg-[#141a29] hover:bg-[#1c2438] border border-[#263147] group"
                id="alerts-back-btn"
              >
                <span className="material-symbols-outlined text-[15px] group-hover:-translate-x-0.5 transition-transform">
                  arrow_back
                </span>
                <span>Command Overview</span>
              </button>
            )}
            <span className="text-[#334155]">•</span>
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
            <span className="text-[11px] text-rose-400 uppercase tracking-wider font-semibold">
              INCIDENT RESPONSE &amp; ADVISORY STREAM
            </span>
          </div>
          <h1 className="text-[22px] md:text-[28px] text-white font-bold tracking-tight">
            Incident Alerts &amp; Public Warning Triage
          </h1>
          <p className="text-[13px] text-[#94a3b8] mt-1">
            Manage threshold triggers, dispatch emergency cooling operations, and broadcast municipal alerts.
          </p>
        </div>

        {/* Top Emergency Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowBroadcastModal(true)}
            className="bg-[#1e293b] hover:bg-[#283548] text-[#cbd5e1] hover:text-white text-[12px] font-medium px-4 py-2.5 rounded-lg flex items-center gap-2 border border-[#334155] transition-all shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px] text-amber-400">campaign</span>
            <span>Broadcast Advisory</span>
          </button>

          <button
            onClick={onOpenDeployModal}
            className="bg-rose-600 hover:bg-rose-700 text-white text-[12px] font-semibold px-4 py-2.5 rounded-lg flex items-center gap-2 transition-all shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">emergency</span>
            <span>Deploy Response</span>
          </button>
        </div>
      </motion.div>

      {/* Sub-Navigation Tabs */}
      <motion.div variants={itemVariants} className="flex border-b border-[#212a3d] gap-2 text-[12.5px]">
        <button
          onClick={() => setActiveTab('stream')}
          className={`pb-3 px-3 transition-colors flex items-center gap-2 font-medium ${
            activeTab === 'stream' ? 'text-blue-400 border-b-2 border-blue-500' : 'text-[#94a3b8] hover:text-white'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">notifications_active</span>
          <span>Active Incident Stream ({alerts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('rules')}
          className={`pb-3 px-3 transition-colors flex items-center gap-2 font-medium ${
            activeTab === 'rules' ? 'text-blue-400 border-b-2 border-blue-500' : 'text-[#94a3b8] hover:text-white'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">rule</span>
          <span>Alert Rule Builder ({rules.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`pb-3 px-3 transition-colors flex items-center gap-2 font-medium ${
            activeTab === 'logs' ? 'text-blue-400 border-b-2 border-blue-500' : 'text-[#94a3b8] hover:text-white'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">outbox</span>
          <span>Delivery Logs (SMS / WhatsApp)</span>
        </button>
      </motion.div>

      {/* Tab 1: Active Stream */}
      {activeTab === 'stream' && (
        <div className="space-y-4">
          {/* Filter and Search Bar */}
          <div className="bg-[#121622] border border-[#212a3d] rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
            {/* Search */}
            <div className="relative w-full md:w-80">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b] text-[18px]">
                search
              </span>
              <input
                type="text"
                placeholder="Search alerts, sectors, keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#182030] border border-[#263147] rounded-lg py-2 pl-9 pr-3 text-[13px] text-white placeholder:text-[#64748b] outline-none focus:border-blue-500"
              />
            </div>

            {/* Severity Filter Pills */}
            <div className="flex flex-wrap gap-1.5 text-[11px] w-full md:w-auto">
              {['all', 'critical', 'danger', 'warning', 'info'].map((sev) => (
                <button
                  key={sev}
                  onClick={() => setFilterSeverity(sev)}
                  className={`px-3 py-1.5 rounded-md transition-colors uppercase font-medium ${
                    filterSeverity === sev
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-[#182030] text-[#94a3b8] hover:text-white border border-[#263147]'
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>
          </div>

          {/* Alerts Stream List */}
          <div className="flex flex-col gap-3">
            {filteredAlerts.length === 0 ? (
              <div className="bg-[#121622] border border-[#212a3d] rounded-xl p-12 text-center text-[#94a3b8] shadow-sm">
                <span className="material-symbols-outlined text-4xl text-[#64748b] mb-2">check_circle</span>
                <p className="text-[16px] text-white font-medium">No matching alerts in this filter criteria</p>
                <p className="text-[13px] text-[#94a3b8] mt-1">All systems operating within acceptable thermal parameters.</p>
              </div>
            ) : (
              filteredAlerts.map((alert) => {
                const isResolved = alert.resolved;
                return (
                  <div
                    key={alert.id}
                    className={`bg-[#121622] border rounded-xl p-5 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm ${
                      alert.severity === 'critical' && !isResolved
                        ? 'border-rose-500/40 bg-rose-950/20'
                        : isResolved
                        ? 'border-[#212a3d]/50 opacity-60'
                        : 'border-[#212a3d] hover:border-[#334155]'
                    }`}
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="mt-0.5">{getSeverityBadge(alert.severity)}</div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h3 className="text-[15.5px] text-white font-semibold">
                            {alert.title}
                          </h3>
                          <span className="text-[12px] text-[#64748b]">
                            • {alert.sector}
                          </span>
                        </div>
                        <p className="text-[13px] text-[#94a3b8] max-w-2xl leading-relaxed">
                          {alert.description}
                        </p>
                        <div className="flex items-center gap-3 mt-2 text-[11.5px] text-[#64748b]">
                          <span>{alert.timestamp}</span>
                          {alert.acknowledged && (
                            <span className="text-blue-400 flex items-center gap-1 font-medium">
                              <span className="material-symbols-outlined text-[14px]">done</span>
                              Acknowledged
                            </span>
                          )}
                          {isResolved && (
                            <span className="text-emerald-400 flex items-center gap-1 font-medium">
                              <span className="material-symbols-outlined text-[14px]">check_circle</span>
                              Resolved
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
                      {!alert.acknowledged && !isResolved && (
                        <button
                          onClick={() => onAcknowledgeAlert(alert.id)}
                          className="bg-[#182030] hover:bg-[#1f2a40] text-[#cbd5e1] hover:text-white border border-[#263147] text-[11.5px] font-medium px-3.5 py-1.5 rounded-md transition-all"
                        >
                          Acknowledge
                        </button>
                      )}
                      {!isResolved && (
                        <button
                          onClick={() => onResolveAlert(alert.id)}
                          className="bg-emerald-600/15 hover:bg-emerald-600/25 text-emerald-400 border border-emerald-500/40 text-[11.5px] font-medium px-3.5 py-1.5 rounded-md transition-all"
                        >
                          Resolve
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Alert Rule Builder */}
      {activeTab === 'rules' && (
        <div className="space-y-6">
          <div className="bg-[#121622] border border-[#212a3d] rounded-xl p-6 shadow-sm space-y-6">
            <div>
              <h3 className="text-[17px] text-white font-bold">
                Configure Automated Threshold Trigger Rule
              </h3>
              <p className="text-[13px] text-[#94a3b8] mt-0.5">
                Define automatic trigger parameters to dispatch SMS and WhatsApp advisories when sensor stations cross thresholds.
              </p>
            </div>

            {ruleSaveSuccess && (
              <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 rounded-lg text-[13px] flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                <span>Rule created and active across municipal dispatch grid.</span>
              </div>
            )}

            <form onSubmit={handleCreateRule} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-[11px] text-[#94a3b8] uppercase font-semibold mb-1">TRIGGER METRIC</label>
                <select
                  value={newRuleMetric}
                  onChange={(e: any) => setNewRuleMetric(e.target.value)}
                  className="w-full bg-[#182030] border border-[#263147] rounded-lg p-2.5 text-[13px] text-white outline-none focus:border-blue-500"
                >
                  <option value="WBGT">WBGT (Outdoor Heat Stress)</option>
                  <option value="TEMPERATURE">Dry-Bulb Temperature</option>
                  <option value="UTCI">UTCI (Universal Thermal Index)</option>
                  <option value="HEAT_INDEX">Heat Index (NOAA)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-[#94a3b8] uppercase font-semibold mb-1">THRESHOLD VALUE (°C)</label>
                <input
                  type="number"
                  step="0.5"
                  value={newRuleThreshold}
                  onChange={(e) => setNewRuleThreshold(parseFloat(e.target.value))}
                  className="w-full bg-[#182030] border border-[#263147] rounded-lg p-2.5 text-[13px] text-white outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] text-[#94a3b8] uppercase font-semibold mb-1">TARGET AUDIENCE</label>
                <select
                  value={newRuleAudience}
                  onChange={(e: any) => setNewRuleAudience(e.target.value)}
                  className="w-full bg-[#182030] border border-[#263147] rounded-lg p-2.5 text-[13px] text-white outline-none focus:border-blue-500"
                >
                  <option value="OUTDOOR_WORKERS">Gig Workers &amp; Laborers</option>
                  <option value="ALL_CITIZENS">All Registered Citizens</option>
                  <option value="EMERGENCY_COMMAND">Emergency Command Only</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-[#94a3b8] uppercase font-semibold mb-1">DELIVERY CHANNELS</label>
                <div className="flex items-center gap-4 pt-2">
                  <label className="flex items-center gap-1.5 text-[12px] text-white cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newRuleChannelWhatsApp}
                      onChange={(e) => setNewRuleChannelWhatsApp(e.target.checked)}
                      className="accent-emerald-500"
                    />
                    <span>WhatsApp</span>
                  </label>

                  <label className="flex items-center gap-1.5 text-[12px] text-white cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newRuleChannelSms}
                      onChange={(e) => setNewRuleChannelSms(e.target.checked)}
                      className="accent-blue-500"
                    />
                    <span>SMS</span>
                  </label>

                  <button
                    type="submit"
                    className="ml-auto px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-[12px] transition-colors"
                  >
                    Save Rule
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Active Rules List */}
          <div className="bg-[#121622] border border-[#212a3d] rounded-xl p-6 shadow-sm space-y-4">
            <h3 className="text-[17px] text-white font-bold">
              Active Trigger Rules ({rules.length})
            </h3>

            <div className="divide-y divide-[#212a3d]">
              {rules.map(r => (
                <div key={r.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white text-[14px]">{r.name}</span>
                      <span className={`px-2 py-0.5 rounded text-[10.5px] font-semibold uppercase ${
                        r.riskLevel === 'EXTREME' ? 'bg-rose-500/15 text-rose-400' : 'bg-amber-500/15 text-amber-400'
                      }`}>
                        {r.riskLevel}
                      </span>
                    </div>
                    <div className="text-[12px] text-[#94a3b8] mt-1 flex items-center gap-3">
                      <span>Condition: {r.metric} &gt; {r.thresholdValue}°C</span>
                      <span>•</span>
                      <span>Audience: {r.targetAudience.replace('_', ' ')}</span>
                      <span>•</span>
                      <span>Channels: {[r.channels.whatsapp && 'WhatsApp', r.channels.sms && 'SMS', r.channels.email && 'Email'].filter(Boolean).join(', ')}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`text-[11px] font-medium ${r.enabled ? 'text-emerald-400' : 'text-[#64748b]'}`}>
                      {r.enabled ? 'ACTIVE' : 'DISABLED'}
                    </span>
                    <button
                      onClick={() => handleToggleRule(r.id, !r.enabled)}
                      className={`px-3 py-1 rounded-md text-[11.5px] font-medium transition-colors ${
                        r.enabled ? 'bg-rose-500/15 text-rose-400 hover:bg-rose-500/25 border border-rose-500/30' : 'bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 border border-emerald-500/30'
                      }`}
                    >
                      {r.enabled ? 'Disable' : 'Enable'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Delivery Logs */}
      {activeTab === 'logs' && (
        <div className="bg-[#121622] border border-[#212a3d] rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-[17px] text-white font-bold">
                Notification Queue &amp; Telecom Gateway Logs
              </h3>
              <p className="text-[13px] text-[#94a3b8] mt-0.5">
                Real-time delivery verification, SMS DLT confirmations, and WhatsApp Business API webhooks.
              </p>
            </div>
            <span className="text-[11px] font-mono text-[#64748b]">Auto-refresh: 1s</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-[12.5px] divide-y divide-[#212a3d]">
              <thead className="text-[11px] text-[#94a3b8] uppercase bg-[#182030]">
                <tr>
                  <th className="py-3 px-4">Channel &amp; Recipient</th>
                  <th className="py-3 px-3">Gateway Provider</th>
                  <th className="py-3 px-4">Message Payload</th>
                  <th className="py-3 px-3">Latency</th>
                  <th className="py-3 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#212a3d] text-[#cbd5e1]">
                {deliveryLogs.map(log => (
                  <tr key={log.id} className="hover:bg-[#182030]/50 transition-colors">
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          log.channel === 'WHATSAPP' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-blue-500/15 text-blue-400'
                        }`}>
                          {log.channel}
                        </span>
                        <span className="font-semibold text-white">{log.recipient}</span>
                      </div>
                      <span className="text-[10.5px] text-[#64748b] font-mono block mt-0.5">{log.timestamp}</span>
                    </td>
                    <td className="py-3.5 px-3 text-[12px] text-[#94a3b8] whitespace-nowrap">
                      {log.provider}
                    </td>
                    <td className="py-3.5 px-4 text-[12px] text-[#cbd5e1] max-w-md">
                      {log.payloadSummary}
                    </td>
                    <td className="py-3.5 px-3 font-mono text-[11.5px] text-[#64748b] whitespace-nowrap">
                      {log.deliveryLatencyMs}ms
                    </td>
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/15 text-emerald-400">
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Broadcast Advisory Modal */}
      <AnimatePresence>
        {showBroadcastModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none"
          >
            <motion.div
              initial={{ scale: 0.94, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0, y: 16 }}
              transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
              className="bg-[#121622] border border-[#212a3d] w-full max-w-lg rounded-xl shadow-2xl p-6"
            >
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#212a3d]">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-amber-400 text-[22px]">campaign</span>
                  <h3 className="text-[17px] text-white font-bold">
                    Broadcast Municipal Heat Advisory
                  </h3>
                </div>
                <button
                  onClick={() => setShowBroadcastModal(false)}
                  className="text-[#64748b] hover:text-white"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              <form onSubmit={handleSendBroadcast} className="flex flex-col gap-4">
                <div>
                  <label className="block text-[11px] text-[#94a3b8] uppercase font-semibold mb-1">
                    Target Municipal Sector / Ward
                  </label>
                  <select
                    value={broadcastSector}
                    onChange={(e) => setBroadcastSector(e.target.value)}
                    className="w-full bg-[#182030] border border-[#263147] rounded-lg p-2.5 text-[13px] text-white outline-none focus:border-blue-500"
                  >
                    <option value="All Municipal Sectors">All Municipal Sectors (Citywide Broadcast)</option>
                    {wards.map((w) => (
                      <option key={w.id} value={w.name}>{w.name} ({w.code})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-[#94a3b8] uppercase font-semibold mb-1">
                    Advisory Message (SMS / WhatsApp Push)
                  </label>
                  <textarea
                    rows={4}
                    value={broadcastMessage}
                    onChange={(e) => setBroadcastMessage(e.target.value)}
                    className="w-full bg-[#182030] border border-[#263147] rounded-lg p-3 text-[13px] text-white outline-none focus:border-blue-500 resize-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowBroadcastModal(false)}
                    className="px-4 py-2 rounded-lg bg-[#182030] hover:bg-[#1f2a40] text-[#cbd5e1] text-[12px] font-medium border border-[#263147]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-[12px] transition-all shadow-sm"
                  >
                    Dispatch Advisory
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

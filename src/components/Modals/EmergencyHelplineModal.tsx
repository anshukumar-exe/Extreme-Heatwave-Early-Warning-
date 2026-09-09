import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { WardData, Region } from '../../types';

export type HelplineType = 'helpline' | 'ambulance' | 'water' | 'guide';

interface EmergencyHelplineModalProps {
  type: HelplineType;
  currentRegion?: Region;
  wards?: WardData[];
  onClose: () => void;
  onDispatchSuccess?: (message: string) => void;
}

export const EmergencyHelplineModal: React.FC<EmergencyHelplineModalProps> = ({
  type: initialType = 'helpline',
  currentRegion,
  wards = [],
  onClose,
  onDispatchSuccess
}) => {
  const [activeTab, setActiveTab] = useState<HelplineType>(initialType);
  const [selectedWardId, setSelectedWardId] = useState<string>(wards[0]?.id || 'ward-1');
  const [callerName, setCallerName] = useState<string>('');
  const [callerPhone, setCallerPhone] = useState<string>('');
  const [addressDetails, setAddressDetails] = useState<string>('');
  const [urgencyLevel, setUrgencyLevel] = useState<'immediate' | 'high' | 'standard'>('immediate');
  const [tankerCapacity, setTankerCapacity] = useState<'10000L' | '15000L' | 'Misting_Cannon'>('10000L');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [callActive, setCallActive] = useState<boolean>(false);
  const [copiedNumber, setCopiedNumber] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const selectedWard = wards.find(w => w.id === selectedWardId) || wards[0];

  const handleCopy = (number: string) => {
    navigator.clipboard?.writeText?.(number);
    setCopiedNumber(number);
    setTimeout(() => setCopiedNumber(null), 2500);
  };

  const handleSimulateCall = (hotlineLabel: string = '1800-22-COOL') => {
    setCallActive(true);
    setTimeout(() => {
      setCallActive(false);
      if (onDispatchSuccess) {
        onDispatchSuccess(`Emergency connected: Tele-triage officer assigned to line (${hotlineLabel}).`);
      }
      onClose();
    }, 2400);
  };

  const handleDispatchTanker = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      if (onDispatchSuccess) {
        onDispatchSuccess(`Civic Water Tanker (${tankerCapacity}) dispatched to ${selectedWard?.name || 'Sector'} (${addressDetails || 'Informal Cluster'}). ETA 18 mins.`);
      }
      onClose();
    }, 1200);
  };

  const handleDispatchAmbulance = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      if (onDispatchSuccess) {
        onDispatchSuccess(`EMS Unit 108 Immersion-Cooling Ambulance dispatched to ${selectedWard?.name || 'Sector'} (${addressDetails || 'Reported Location'}). Sirens active.`);
      }
      onClose();
    }, 1200);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 selection:bg-[#3b82f6] selection:text-white"
      id="emergency-helpline-modal"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 14 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="bg-[#0e1017] border border-[#232936] rounded-2xl w-full max-w-xl p-5 sm:p-7 shadow-2xl relative overflow-hidden text-[#e5e7eb] max-h-[92vh] flex flex-col"
      >
        {/* Header Indicator Glow */}
        <div 
          className={`absolute top-0 left-0 right-0 h-1.5 ${
            activeTab === 'ambulance'
              ? 'bg-gradient-to-r from-[#ef4444] via-[#f87171] to-[#ef4444]'
              : activeTab === 'water'
              ? 'bg-gradient-to-r from-[#2563eb] via-[#60a5fa] to-[#2563eb]'
              : activeTab === 'guide'
              ? 'bg-gradient-to-r from-[#f59e0b] via-[#fbbf24] to-[#f59e0b]'
              : 'bg-gradient-to-r from-[#059669] via-[#34d399] to-[#059669]'
          }`}
        />

        {/* Title and Close */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div 
              className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                activeTab === 'ambulance'
                  ? 'bg-[#ef4444]/15 border border-[#ef4444]/40 text-[#f87171]'
                  : activeTab === 'water'
                  ? 'bg-[#2563eb]/15 border border-[#2563eb]/40 text-[#60a5fa]'
                  : activeTab === 'guide'
                  ? 'bg-[#f59e0b]/15 border border-[#f59e0b]/40 text-[#fbbf24]'
                  : 'bg-[#059669]/15 border border-[#059669]/40 text-[#34d399]'
              }`}
            >
              <span className="material-symbols-outlined text-[24px]">
                {activeTab === 'ambulance' ? 'medical_services' : activeTab === 'water' ? 'water_drop' : activeTab === 'guide' ? 'menu_book' : 'support_agent'}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-label-caps text-[10px] sm:text-[11px] uppercase tracking-wider text-[#9ca3af]">
                  {activeTab === 'ambulance' ? 'DISASTER MEDICAL COMMAND' : activeTab === 'water' ? 'CIVIC EMERGENCY WATER SUPPLY' : activeTab === 'guide' ? 'HEAT ACTION PROTOCOL GUIDE' : 'NDMA / IMD 24/7 HOTLINE'}
                </span>
                <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse"></span>
              </div>
              <h3 className="font-headline-md text-[18px] sm:text-[20px] text-white font-bold">
                {activeTab === 'ambulance' ? 'Ambulance & EMS Dispatch (108 / 112)' : activeTab === 'water' ? 'Civic Water Tanker Request (1916)' : activeTab === 'guide' ? 'Heat Health & First-Aid Guide' : 'National Heatwave Helpline (1800-22-COOL)'}
              </h3>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="text-[#9ca3af] hover:text-white p-1.5 rounded-lg hover:bg-[#1a1d26] transition-colors"
            id="close-helpline-modal-btn"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Tab Navigation Controls */}
        <div className="flex items-center gap-1.5 bg-[#141824] p-1 rounded-xl border border-[#232936] mb-4 overflow-x-auto no-scrollbar shrink-0">
          <button
            onClick={() => setActiveTab('helpline')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11.5px] font-label-caps whitespace-nowrap transition-all ${
              activeTab === 'helpline'
                ? 'bg-[#059669] text-white font-bold shadow-[0_0_12px_rgba(5,150,105,0.4)]'
                : 'text-[#9ca3af] hover:text-white hover:bg-[#1a2030]'
            }`}
            id="tab-helpline"
          >
            <span className="material-symbols-outlined text-[15px]">call</span>
            <span>24/7 Helpline</span>
          </button>

          <button
            onClick={() => setActiveTab('ambulance')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11.5px] font-label-caps whitespace-nowrap transition-all ${
              activeTab === 'ambulance'
                ? 'bg-[#dc2626] text-white font-bold shadow-[0_0_12px_rgba(220,38,38,0.4)]'
                : 'text-[#9ca3af] hover:text-white hover:bg-[#1a2030]'
            }`}
            id="tab-ambulance"
          >
            <span className="material-symbols-outlined text-[15px]">ambulance</span>
            <span>108 Ambulance</span>
          </button>

          <button
            onClick={() => setActiveTab('water')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11.5px] font-label-caps whitespace-nowrap transition-all ${
              activeTab === 'water'
                ? 'bg-[#2563eb] text-white font-bold shadow-[0_0_12px_rgba(37,99,235,0.4)]'
                : 'text-[#9ca3af] hover:text-white hover:bg-[#1a2030]'
            }`}
            id="tab-water"
          >
            <span className="material-symbols-outlined text-[15px]">water_drop</span>
            <span>1916 Water Relief</span>
          </button>

          <button
            onClick={() => setActiveTab('guide')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11.5px] font-label-caps whitespace-nowrap transition-all ${
              activeTab === 'guide'
                ? 'bg-[#d97706] text-white font-bold shadow-[0_0_12px_rgba(217,119,6,0.4)]'
                : 'text-[#9ca3af] hover:text-white hover:bg-[#1a2030]'
            }`}
            id="tab-guide"
          >
            <span className="material-symbols-outlined text-[15px]">help</span>
            <span>First-Aid &amp; Guide</span>
          </button>
        </div>

        {/* Modal Body Container with Smooth Scrolling */}
        <div className="overflow-y-auto pr-1 flex-1 space-y-4">
          {/* Content Type 1: Heatwave Helpline 1800-22-COOL */}
          {activeTab === 'helpline' && (
            <div className="space-y-4">
              <div className="p-4 bg-[#141822] rounded-xl border border-[#232936]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-label-caps text-[#9ca3af]">TOLL-FREE DEDICATED FREQUENCY</span>
                  <span className="flex items-center gap-1.5 text-[11px] font-bold text-[#34d399] bg-[#059669]/20 px-2 py-0.5 rounded-full border border-[#059669]/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#34d399] animate-pulse"></span>
                    Live 24/7 Desk
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="font-display-lg text-[26px] sm:text-[30px] font-bold text-[#34d399] tracking-tight">
                      1800-22-COOL
                    </div>
                    <div className="text-[12px] font-mono text-[#9ca3af]">
                      Alt: 1800-11-4328 (1800-11-HEAT)
                    </div>
                  </div>
                  <button
                    onClick={() => handleCopy('1800222665')}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1f2638] hover:bg-[#2b354d] border border-[#3b4763] rounded-lg text-[12px] font-label-caps text-[#93c5fd] transition-all"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {copiedNumber === '1800222665' ? 'check' : 'content_copy'}
                    </span>
                    <span>{copiedNumber === '1800222665' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <p className="text-[12px] text-[#9ca3af] mt-2.5 leading-relaxed">
                  Connected directly to the {currentRegion?.name || 'Regional'} Disaster Management Authority &amp; Tele-medicine desk. Free advice on heat exhaustion, ice hydration, and nearest air-cooled shelters.
                </p>
              </div>

              {/* Direct Quick-Call Channels */}
              <div className="space-y-2.5">
                <label className="block text-[11px] font-label-caps text-[#9ca3af] uppercase">
                  Available Triage &amp; Assistance Lines
                </label>

                <button
                  onClick={() => handleSimulateCall('Heat Stroke Medical Officer (1800-22-COOL)')}
                  disabled={callActive}
                  className="w-full p-3 bg-[#171c28] hover:bg-[#1f2637] border border-[#2d3748] rounded-xl flex items-center justify-between text-left transition-all group"
                  id="btn-call-medical-officer"
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[#34d399] text-[22px] group-hover:scale-110 transition-transform">phone_in_talk</span>
                    <div>
                      <div className="font-bold text-[13px] text-white group-hover:text-[#34d399] transition-colors">
                        Connect with Heat Stroke Medical Officer
                      </div>
                      <div className="text-[11px] text-[#9ca3af]">
                        Immediate triage &amp; first-aid instructions for high fever, dizziness, or delirium
                      </div>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-[#9ca3af] group-hover:text-white text-[18px]">
                    chevron_right
                  </span>
                </button>

                <button
                  onClick={() => handleSimulateCall('National Disaster Management Desk (1078)')}
                  disabled={callActive}
                  className="w-full p-3 bg-[#171c28] hover:bg-[#1f2637] border border-[#2d3748] rounded-xl flex items-center justify-between text-left transition-all group"
                  id="btn-call-ndma-desk"
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[#60a5fa] text-[22px] group-hover:scale-110 transition-transform">shield</span>
                    <div>
                      <div className="font-bold text-[13px] text-white group-hover:text-[#60a5fa] transition-colors">
                        NDMA Crisis Desk (1078)
                      </div>
                      <div className="text-[11px] text-[#9ca3af]">
                        State Emergency Operations Centre (SEOC) heat action coordination
                      </div>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-[#9ca3af] group-hover:text-white text-[18px]">
                    chevron_right
                  </span>
                </button>

                <button
                  onClick={() => handleSimulateCall('Cooling Sanctuary Locator')}
                  disabled={callActive}
                  className="w-full p-3 bg-[#171c28] hover:bg-[#1f2637] border border-[#2d3748] rounded-xl flex items-center justify-between text-left transition-all group"
                  id="btn-call-sanctuary-locator"
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[#fbbf24] text-[22px] group-hover:scale-110 transition-transform">ac_unit</span>
                    <div>
                      <div className="font-bold text-[13px] text-white group-hover:text-[#fbbf24] transition-colors">
                        Locate Nearest 24/7 Cooling Sanctuary
                      </div>
                      <div className="text-[11px] text-[#9ca3af]">
                        Air-conditioned shelters with free drinking water, beds, and ORS packets
                      </div>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-[#9ca3af] group-hover:text-white text-[18px]">
                    chevron_right
                  </span>
                </button>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#232936]">
                <button
                  onClick={onClose}
                  className="px-4 py-2.5 bg-[#171c28] hover:bg-[#1f2637] text-[#9ca3af] hover:text-white rounded-xl text-[12px] font-label-caps transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => handleSimulateCall('1800-22-COOL')}
                  disabled={callActive}
                  className="px-6 py-2.5 bg-[#059669] hover:bg-[#10b981] text-white font-bold rounded-xl text-[13px] font-label-caps flex items-center gap-2 shadow-[0_0_20px_rgba(5,150,105,0.3)] transition-all"
                  id="call-toll-free-btn"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {callActive ? 'ring_volume' : 'call'}
                  </span>
                  <span>{callActive ? 'Connecting Hotline...' : 'Call 1800-22-COOL'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Content Type 2: Ambulance 108 / 112 */}
          {activeTab === 'ambulance' && (
            <form onSubmit={handleDispatchAmbulance} className="space-y-4">
              <div className="p-3.5 bg-[#ef4444]/10 rounded-xl border border-[#ef4444]/30 flex items-center gap-3">
                <span className="material-symbols-outlined text-[#ef4444] text-[24px]">emergency</span>
                <div className="text-[12px] text-[#fca5a5]">
                  <strong className="text-white block font-semibold">Priority EMS Protocol Active (108 / 112)</strong>
                  Ambulances are equipped with rapid immersion ice-sheets, saline drips, and thermal monitoring.
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-label-caps text-[#9ca3af] uppercase mb-1">
                    Target Municipal Ward / Sector
                  </label>
                  <select
                    value={selectedWardId}
                    onChange={(e) => setSelectedWardId(e.target.value)}
                    className="w-full bg-[#141822] border border-[#2d3748] rounded-xl p-2.5 text-[13.5px] font-data-point text-white outline-none focus:border-[#ef4444]"
                  >
                    {wards.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name} (Temp: {w.currentTemp}°C • Vulnerability: {w.vulnerabilityIndex?.toFixed(2) || '0.70'})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-label-caps text-[#9ca3af] uppercase mb-1">
                    Patient Location / Street Landmark *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Near Bus Stand, Block 4, Informal Settlement Market"
                    value={addressDetails}
                    onChange={(e) => setAddressDetails(e.target.value)}
                    required
                    className="w-full bg-[#141822] border border-[#2d3748] rounded-xl p-2.5 text-[13px] text-white outline-none focus:border-[#ef4444]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-label-caps text-[#9ca3af] uppercase mb-1">
                      Contact Phone Number *
                    </label>
                    <input
                      type="tel"
                      placeholder="10-digit mobile number"
                      value={callerPhone}
                      onChange={(e) => setCallerPhone(e.target.value)}
                      required
                      className="w-full bg-[#141822] border border-[#2d3748] rounded-xl p-2.5 text-[13px] text-white outline-none focus:border-[#ef4444]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-label-caps text-[#9ca3af] uppercase mb-1">
                      Patient Condition
                    </label>
                    <select
                      value={urgencyLevel}
                      onChange={(e) => setUrgencyLevel(e.target.value as any)}
                      className="w-full bg-[#141822] border border-[#2d3748] rounded-xl p-2.5 text-[13px] text-white outline-none focus:border-[#ef4444]"
                    >
                      <option value="immediate">Unconscious / Heat Stroke (Critical)</option>
                      <option value="high">Severe Dehydration &amp; High Fever</option>
                      <option value="standard">Heat Exhaustion &amp; Muscle Cramps</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#232936]">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 bg-[#171c28] hover:bg-[#1f2637] text-[#9ca3af] hover:text-white rounded-xl text-[12px] font-label-caps transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-[#dc2626] hover:bg-[#ef4444] text-white font-bold rounded-xl text-[13px] font-label-caps flex items-center gap-2 shadow-[0_0_20px_rgba(220,38,38,0.35)] transition-all"
                  id="dispatch-ambulance-submit-btn"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      <span>Transmitting Dispatch...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[18px]">local_shipping</span>
                      <span>Dispatch 108 Ambulance</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Content Type 3: Water Tanker 1916 */}
          {activeTab === 'water' && (
            <form onSubmit={handleDispatchTanker} className="space-y-4">
              <div className="p-3.5 bg-[#2563eb]/10 rounded-xl border border-[#2563eb]/30 flex items-center gap-3">
                <span className="material-symbols-outlined text-[#60a5fa] text-[24px]">water_drop</span>
                <div className="text-[12px] text-[#bfdbfe]">
                  <strong className="text-white block font-semibold">Civic Disaster Cell Emergency Water Relief (1916)</strong>
                  Deploy potable drinking water tankers or evaporative misting cannons to prevent heat exhaustion in public hotspots.
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-label-caps text-[#9ca3af] uppercase mb-1">
                    Destination Ward &amp; Cluster
                  </label>
                  <select
                    value={selectedWardId}
                    onChange={(e) => setSelectedWardId(e.target.value)}
                    className="w-full bg-[#141822] border border-[#2d3748] rounded-xl p-2.5 text-[13.5px] font-data-point text-white outline-none focus:border-[#2563eb]"
                  >
                    {wards.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name} (Vulnerability: {w.vulnerabilityIndex?.toFixed(2) || '0.65'} • Temp: {w.currentTemp}°C)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-label-caps text-[#9ca3af] uppercase mb-1">
                    Specific Street / Colony / Bus Terminal *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Labor Chowk, Railway Market, Informal Settlement Gate 3"
                    value={addressDetails}
                    onChange={(e) => setAddressDetails(e.target.value)}
                    required
                    className="w-full bg-[#141822] border border-[#2d3748] rounded-xl p-2.5 text-[13px] text-white outline-none focus:border-[#2563eb]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-label-caps text-[#9ca3af] uppercase mb-1">
                      Resource Type
                    </label>
                    <select
                      value={tankerCapacity}
                      onChange={(e) => setTankerCapacity(e.target.value as any)}
                      className="w-full bg-[#141822] border border-[#2d3748] rounded-xl p-2.5 text-[13px] text-white outline-none focus:border-[#2563eb]"
                    >
                      <option value="10000L">10,000L Potable Water Tanker</option>
                      <option value="15000L">15,000L High-Capacity Tanker</option>
                      <option value="Misting_Cannon">Mobile Anti-Heat Misting Cannon</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-label-caps text-[#9ca3af] uppercase mb-1">
                      Ward Officer / Reporter Phone *
                    </label>
                    <input
                      type="tel"
                      placeholder="10-digit mobile number"
                      value={callerPhone}
                      onChange={(e) => setCallerPhone(e.target.value)}
                      required
                      className="w-full bg-[#141822] border border-[#2d3748] rounded-xl p-2.5 text-[13px] text-white outline-none focus:border-[#2563eb]"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#232936]">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 bg-[#171c28] hover:bg-[#1f2637] text-[#9ca3af] hover:text-white rounded-xl text-[12px] font-label-caps transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-[#2563eb] hover:bg-[#3b82f6] text-white font-bold rounded-xl text-[13px] font-label-caps flex items-center gap-2 shadow-[0_0_20px_rgba(37,99,235,0.35)] transition-all"
                  id="request-tanker-submit-btn"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      <span>Scheduling Tanker...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[18px]">local_shipping</span>
                      <span>Request Water Tanker</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Content Type 4: Emergency Help & First-Aid Guide */}
          {activeTab === 'guide' && (
            <div className="space-y-4 text-[13px]">
              {/* Heat Stroke vs Heat Exhaustion Guide */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-[#ef4444]/10 border border-[#ef4444]/30 p-3.5 rounded-xl">
                  <div className="flex items-center gap-2 text-[#ef4444] font-bold font-label-caps text-[12px] mb-2">
                    <span className="material-symbols-outlined text-[18px]">warning</span>
                    <span>Heat Stroke (EMERGENCY)</span>
                  </div>
                  <ul className="text-[12px] text-[#fca5a5] space-y-1 list-disc list-inside">
                    <li>Core temperature &gt; 40°C (104°F)</li>
                    <li>Hot, dry skin (no sweating)</li>
                    <li>Confusion, slurred speech, unconsciousness</li>
                    <li>Rapid heart rate &amp; throbbing headache</li>
                  </ul>
                  <div className="mt-2.5 p-2 bg-[#ef4444]/20 rounded text-[11px] text-white font-bold">
                    🚨 Call 108 immediately. Move to shade, apply ice water to neck, armpits, and groin.
                  </div>
                </div>

                <div className="bg-[#f59e0b]/10 border border-[#f59e0b]/30 p-3.5 rounded-xl">
                  <div className="flex items-center gap-2 text-[#f59e0b] font-bold font-label-caps text-[12px] mb-2">
                    <span className="material-symbols-outlined text-[18px]">info</span>
                    <span>Heat Exhaustion</span>
                  </div>
                  <ul className="text-[12px] text-[#fde68a] space-y-1 list-disc list-inside">
                    <li>Heavy sweating &amp; cold pale skin</li>
                    <li>Dizziness, nausea, extreme thirst</li>
                    <li>Muscle cramps and weakness</li>
                    <li>Fast, weak pulse</li>
                  </ul>
                  <div className="mt-2.5 p-2 bg-[#f59e0b]/20 rounded text-[11px] text-white font-bold">
                    💧 Move to cool AC room, loosen tight clothing, sip chilled ORS or electrolyte water.
                  </div>
                </div>
              </div>

              {/* National Key Emergency Numbers Directory */}
              <div className="p-3.5 bg-[#141824] rounded-xl border border-[#232936]">
                <span className="font-label-caps text-[11px] text-[#9ca3af] uppercase block mb-2">
                  Key National Heat Response Directory
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div className="p-2 bg-[#1a2030] rounded-lg text-center">
                    <div className="text-[10px] text-[#9ca3af] font-label-caps">Ambulance</div>
                    <div className="font-data-point text-[16px] text-white font-bold">108</div>
                  </div>
                  <div className="p-2 bg-[#1a2030] rounded-lg text-center">
                    <div className="text-[10px] text-[#9ca3af] font-label-caps">National Helpline</div>
                    <div className="font-data-point text-[16px] text-[#34d399] font-bold">1800-22-COOL</div>
                  </div>
                  <div className="p-2 bg-[#1a2030] rounded-lg text-center">
                    <div className="text-[10px] text-[#9ca3af] font-label-caps">Disaster (NDMA)</div>
                    <div className="font-data-point text-[16px] text-[#60a5fa] font-bold">1078</div>
                  </div>
                  <div className="p-2 bg-[#1a2030] rounded-lg text-center">
                    <div className="text-[10px] text-[#9ca3af] font-label-caps">Water Supply</div>
                    <div className="font-data-point text-[16px] text-[#38bdf8] font-bold">1916</div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setActiveTab('helpline')}
                  className="px-5 py-2 bg-[#059669] hover:bg-[#10b981] text-white font-bold rounded-xl text-[12px] font-label-caps transition-all"
                >
                  Return to Live Helpline
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

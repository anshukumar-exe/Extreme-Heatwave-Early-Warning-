import React, { useState } from 'react';
import { ViewMode, Region, WardData } from '../types';
import { HelplineType } from './Modals/EmergencyHelplineModal';
import { ThermometerLogo } from './ThermometerLogo';

interface LandingPageProps {
  onNavigate: (view: ViewMode) => void;
  currentRegion?: Region;
  wards?: WardData[];
  onOpenHelplineModal?: (type: HelplineType) => void;
  onOpenIncidentModal?: () => void;
  onOpenDeployModal?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigate,
  currentRegion,
  wards = [],
  onOpenHelplineModal,
  onOpenIncidentModal,
  onOpenDeployModal
}) => {
  // Alert Dispatcher interactive state
  const [activeChannel, setActiveChannel] = useState<'sms' | 'whatsapp' | 'siren'>('sms');
  const [broadcastSent, setBroadcastSent] = useState<boolean>(false);
  const [broadcastCount, setBroadcastCount] = useState<number>(14280);

  // Bio-Risk Diagnostic state
  const [activeBioMetric, setActiveBioMetric] = useState<'wbgt' | 'dlnm'>('wbgt');

  // Real-time Regional Monitor data
  const regionalReadings = [
    {
      city: 'Delhi-NCR',
      state: 'National Capital Region',
      temp: '43.8°C',
      wbgt: '33.2°C',
      nightMin: '30.1°C',
      status: 'RED ALERT',
      statusColor: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
      action: 'Work cessation 11AM–4PM enforced'
    },
    {
      city: 'Ahmedabad',
      state: 'Gujarat',
      temp: '42.4°C',
      wbgt: '31.8°C',
      nightMin: '28.9°C',
      status: 'ORANGE WARNING',
      statusColor: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
      action: 'Cooling shelters & tankers active'
    },
    {
      city: 'Nagpur',
      state: 'Maharashtra',
      temp: '44.5°C',
      wbgt: '33.6°C',
      nightMin: '31.2°C',
      status: 'RED ALERT',
      statusColor: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
      action: 'Severe nocturnal trap deficit'
    },
    {
      city: 'Kolkata',
      state: 'West Bengal',
      temp: '39.8°C',
      wbgt: '34.4°C',
      nightMin: '29.5°C',
      status: 'EXTREME WBGT',
      statusColor: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
      action: 'Critical vapor pressure: 78% RH'
    }
  ];

  const handleTriggerBroadcast = () => {
    setBroadcastSent(true);
    setBroadcastCount(prev => prev + 120);
    setTimeout(() => {
      setBroadcastSent(false);
    }, 3500);
  };

  return (
    <div className="min-h-screen bg-[#0c0f17] text-[#f1f5f9] flex flex-col selection:bg-[#2563eb] selection:text-white" id="tapraksha-landing">
      {/* Centered Main Brand Header */}
      <header className="w-full bg-[#121622] sticky top-0 z-40 backdrop-blur-md">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-8">
          <div className="py-3.5 border-b border-[#212a3d] flex items-center justify-center">
            <div 
              onClick={() => onNavigate('landing')}
              className="flex flex-col items-center justify-center cursor-pointer group select-none"
              id="brand-header-taapraksha"
            >
              <div className="flex items-center justify-center gap-2">
                <ThermometerLogo size="md" />
                <span className="font-display-lg text-[22px] sm:text-[24px] font-bold text-white tracking-tight">
                  TaapRaksha
                </span>
              </div>
              <span className="text-[12px] text-[#94a3b8] font-normal tracking-normal text-center mt-0.5">
                India’s Human Heat Risk Intelligence
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-8 pt-12 sm:pt-16 pb-12 flex flex-col items-center text-center">
        {/* Authoritative Status Banner */}
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#161d2c] border border-[#2b3954] text-[12.5px] text-[#cbd5e1] mb-6 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-rose-500"></span>
          <span className="font-semibold text-rose-300">CRITICAL THERMAL ADVISORY</span>
          <span className="text-[#475569]">•</span>
          <span>14 Municipal Clusters Crossing 32°C–35°C Wet-Bulb Strain</span>
        </div>

        {/* Primary Headline */}
        <h1 className="font-display-lg text-[36px] sm:text-[48px] md:text-[60px] font-bold text-white tracking-tight leading-[1.12] max-w-4xl mb-6">
          Predict what extreme heat is likely to do to people.
        </h1>

        {/* Clear, Grounded Subtitle */}
        <p className="text-[16px] sm:text-[18px] text-[#94a3b8] max-w-3xl mb-8 leading-relaxed font-normal">
          India’s human biometeorological intelligence platform. Moving beyond raw dry-bulb temperature to model physiological wet-bulb strain, nocturnal cooling deficits, and vulnerable outdoor population exposure under NDMA protocols.
        </p>

        {/* Action Button Row */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full sm:w-auto mb-16">
          <button
            onClick={() => onNavigate('map')}
            className="w-full sm:w-auto bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-semibold text-[15px] px-7 py-3.5 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
            id="hero-launch-command-btn"
          >
            <span className="material-symbols-outlined text-[19px]">map</span>
            <span>Launch Operational Command View</span>
          </button>

          <button
            onClick={() => onNavigate('infrastructure')}
            className="w-full sm:w-auto bg-[#182030] hover:bg-[#202b40] border border-[#2e3b56] text-[#f1f5f9] font-medium text-[14.5px] px-6 py-3.5 rounded-xl transition-all flex items-center justify-center gap-2"
            id="hero-find-shelters-btn"
          >
            <span className="material-symbols-outlined text-[18px] text-blue-400">home_pin</span>
            <span>Locate Free 24/7 Cooling Shelters</span>
          </button>

          <button
            onClick={() => onOpenHelplineModal ? onOpenHelplineModal('helpline') : onNavigate('alerts')}
            className="w-full sm:w-auto bg-[#064e3b]/80 hover:bg-[#065f46] border border-[#059669]/40 text-emerald-100 font-medium text-[14.5px] px-6 py-3.5 rounded-xl transition-all flex items-center justify-center gap-2"
            id="hero-helpline-pill-btn"
          >
            <span className="material-symbols-outlined text-[18px] text-emerald-400">call</span>
            <span>Helpline: 1800-22-COOL</span>
          </button>
        </div>

        {/* Live Regional Monitoring Grid */}
        <div className="w-full text-left">
          <div className="flex items-center justify-between mb-4 px-1">
            <div>
              <h2 className="text-[16px] sm:text-[18px] font-bold text-white tracking-tight">
                Live National Heat Strain Monitor
              </h2>
              <p className="text-[13px] text-[#94a3b8]">
                Real-time biometeorological feed across high-risk municipal grids
              </p>
            </div>
            <span className="text-[11px] font-label-caps text-[#64748b] bg-[#121622] px-2.5 py-1 rounded border border-[#212a3d]">
              Updated 5 mins ago • IMD Station Grid
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {regionalReadings.map((r) => (
              <div 
                key={r.city}
                onClick={() => onNavigate('map')}
                className="bg-[#121622] border border-[#212a3d] hover:border-[#3b82f6]/50 rounded-xl p-5 cursor-pointer transition-colors shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-bold text-[17px] text-white leading-tight">
                        {r.city}
                      </h3>
                      <span className="text-[12px] text-[#94a3b8]">
                        {r.state}
                      </span>
                    </div>
                    <span className={`text-[10.5px] font-label-caps px-2 py-0.5 rounded border font-semibold ${r.statusColor}`}>
                      {r.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 my-3 py-2.5 border-y border-[#1c2333]">
                    <div>
                      <span className="text-[10.5px] font-label-caps text-[#64748b] block">DRY BULB</span>
                      <span className="text-[19px] font-bold font-data-point text-amber-400">
                        {r.temp}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10.5px] font-label-caps text-[#64748b] block">WBGT STRAIN</span>
                      <span className="text-[19px] font-bold font-data-point text-rose-400">
                        {r.wbgt}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-[12px] text-[#94a3b8] flex items-center gap-1.5 pt-1">
                  <span className="material-symbols-outlined text-[15px] text-blue-400">info</span>
                  <span className="truncate">{r.action}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Strategic Architecture Section: "How TaapRaksha Protects Human Lives" */}
      <section className="w-full bg-[#0f131c] border-y border-[#1c2333] py-16 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-[12px] font-label-caps text-blue-400 uppercase tracking-wider font-semibold block mb-2">
              National Heat Action Architecture
            </span>
            <h2 className="font-display-lg text-[28px] sm:text-[36px] font-bold text-white tracking-tight">
              Science, logistics, and rapid civic response
            </h2>
            <p className="text-[15px] text-[#94a3b8] mt-3">
              Four core pillars engineered to prevent heat illness, protect informal labor, and equip municipal administrators.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pillar 1: Liljegren WBGT Thermodynamic Engine */}
            <div className="bg-[#141926] border border-[#242e42] rounded-xl p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2.5 mb-3 text-blue-400">
                  <span className="material-symbols-outlined text-[24px]">thermostat</span>
                  <span className="text-[11px] font-label-caps uppercase font-bold text-blue-400">
                    BIOMETRIC HEAT BALANCE
                  </span>
                </div>
                <h3 className="text-[20px] font-bold text-white mb-2">
                  Liljegren (2008) Thermodynamic WBGT Solver
                </h3>
                <p className="text-[14px] text-[#94a3b8] leading-relaxed mb-5">
                  Raw ambient temperature fails to measure physiological danger. TaapRaksha solves convective, radiative, and evaporative cooling equations to calculate true Wet-Bulb Globe Temperature (WBGT), predicting heat stroke thresholds for active human bodies.
                </p>

                {/* Diagnostic readout box */}
                <div className="bg-[#0b0e17] border border-[#1d2537] rounded-lg p-4 space-y-2.5">
                  <div className="flex items-center justify-between text-[12px]">
                    <span className="text-[#94a3b8]">Dry Bulb Temperature</span>
                    <span className="font-data-point text-white font-semibold">43.5°C</span>
                  </div>
                  <div className="flex items-center justify-between text-[12px]">
                    <span className="text-[#94a3b8]">Relative Humidity</span>
                    <span className="font-data-point text-white font-semibold">58%</span>
                  </div>
                  <div className="flex items-center justify-between text-[12px] pt-1 border-t border-[#1d2537]">
                    <span className="text-rose-400 font-semibold">Human Physiological WBGT</span>
                    <span className="font-data-point text-rose-400 font-bold">34.2°C (Critical Strain)</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-[#242e42] flex items-center justify-between text-[12.5px]">
                <span className="text-[#94a3b8]">Evaluated under ISO 7243 standards</span>
                <button 
                  onClick={() => onNavigate('thermal_stress')}
                  className="text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
                >
                  <span>Open Calculator</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </button>
              </div>
            </div>

            {/* Pillar 2: Ward Vulnerability & Social Covariates */}
            <div className="bg-[#141926] border border-[#242e42] rounded-xl p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2.5 mb-3 text-emerald-400">
                  <span className="material-symbols-outlined text-[24px]">groups</span>
                  <span className="text-[11px] font-label-caps uppercase font-bold text-emerald-400">
                    EXPOSURE DEMOGRAPHICS
                  </span>
                </div>
                <h3 className="text-[20px] font-bold text-white mb-2">
                  Ward Vulnerability &amp; Informal Labor Exposure
                </h3>
                <p className="text-[14px] text-[#94a3b8] leading-relaxed mb-5">
                  Thermal risk is socio-economic. TaapRaksha correlates satellite surface temperatures with ground censuses, flagging delivery riders, daily-wage construction laborers, informal settlements, and households without mechanical cooling.
                </p>

                {/* Priority Ward Metrics */}
                <div className="bg-[#0b0e17] border border-[#1d2537] rounded-lg p-4 space-y-2.5">
                  <div className="flex items-center justify-between text-[12px]">
                    <span className="text-[#94a3b8]">Outdoor Gig &amp; Construction Workers</span>
                    <span className="font-data-point text-amber-400 font-semibold">14,200 exposed</span>
                  </div>
                  <div className="flex items-center justify-between text-[12px]">
                    <span className="text-[#94a3b8]">Elderly &gt;65 in Non-AC Structures</span>
                    <span className="font-data-point text-rose-400 font-semibold">8,640 monitored</span>
                  </div>
                  <div className="flex items-center justify-between text-[12px] pt-1 border-t border-[#1d2537]">
                    <span className="text-emerald-400 font-semibold">Priority Ward Action Level</span>
                    <span className="font-data-point text-emerald-400 font-bold">Zone 4 (Immediate Triage)</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-[#242e42] flex items-center justify-between text-[12.5px]">
                <span className="text-[#94a3b8]">Census 2011 &amp; Municipal Ward Registry</span>
                <button 
                  onClick={() => onNavigate('vulnerability')}
                  className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
                >
                  <span>View Ward Ranks</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </button>
              </div>
            </div>

            {/* Pillar 3: Nocturnal Heat Trap & DLNM Mortality Displacement */}
            <div className="bg-[#141926] border border-[#242e42] rounded-xl p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2.5 mb-3 text-rose-400">
                  <span className="material-symbols-outlined text-[24px]">bedtime</span>
                  <span className="text-[11px] font-label-caps uppercase font-bold text-rose-400">
                    CARDIOVASCULAR RECOVERY DEFICIT
                  </span>
                </div>
                <h3 className="text-[20px] font-bold text-white mb-2">
                  Nocturnal Heat Trap &amp; DLNM Lagged Surge
                </h3>
                <p className="text-[14px] text-[#94a3b8] leading-relaxed mb-5">
                  When minimum nighttime temperatures stay above 27°C, human body core temperatures cannot discharge stored heat, triggering cardiac failure 24 to 72 hours later. TaapRaksha applies Distributed Lag Non-Linear Models (DLNM) to prepare hospitals before surges occur.
                </p>

                {/* Night temperature status */}
                <div className="bg-[#0b0e17] border border-[#1d2537] rounded-lg p-4 space-y-2.5">
                  <div className="flex items-center justify-between text-[12px]">
                    <span className="text-[#94a3b8]">Night Minimum Temperature</span>
                    <span className="font-data-point text-rose-400 font-semibold">30.4°C (Exceeds 27°C baseline)</span>
                  </div>
                  <div className="flex items-center justify-between text-[12px]">
                    <span className="text-[#94a3b8]">48-Hour Expected EMS Surge</span>
                    <span className="font-data-point text-amber-400 font-semibold">+28% Cardiac Admissions</span>
                  </div>
                  <div className="flex items-center justify-between text-[12px] pt-1 border-t border-[#1d2537]">
                    <span className="text-white font-medium">Pre-Alert Status</span>
                    <span className="font-data-point text-rose-400 font-bold">Tier-1 Hospital Reserve Armed</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-[#242e42] flex items-center justify-between text-[12.5px]">
                <span className="text-[#94a3b8]">Validated with NCDC Hospital Records</span>
                <button 
                  onClick={() => onNavigate('heatwave_analysis')}
                  className="text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1"
                >
                  <span>Analyze Heatwave</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </button>
              </div>
            </div>

            {/* Pillar 4: Automated CAP v1.2 Dispatcher */}
            <div className="bg-[#141926] border border-[#242e42] rounded-xl p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2.5 mb-3 text-amber-400">
                  <span className="material-symbols-outlined text-[24px]">campaign</span>
                  <span className="text-[11px] font-label-caps uppercase font-bold text-amber-400">
                    COMMON ALERTING PROTOCOL (CAP)
                  </span>
                </div>
                <h3 className="text-[20px] font-bold text-white mb-2">
                  Multi-Channel Citizen Warning Broadcast
                </h3>
                <p className="text-[14px] text-[#94a3b8] leading-relaxed mb-5">
                  Automates verified early warning dispatches across telecom SMS cells, WhatsApp citizen channels, and municipal acoustic sirens, notifying vulnerable zones before peak thermal exposure windows begin.
                </p>

                {/* Working broadcast trigger interactive console */}
                <div className="bg-[#0b0e17] border border-[#1d2537] rounded-lg p-3.5 space-y-3">
                  <div className="flex items-center justify-between border-b border-[#1d2537] pb-2">
                    <span className="text-[11px] font-label-caps text-[#cbd5e1] font-semibold">BROADCAST CHANNELS</span>
                    <span className="text-[10px] font-label-caps text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded">
                      Gateway Ready
                    </span>
                  </div>

                  {/* Channel Switcher */}
                  <div className="grid grid-cols-3 gap-1.5 bg-[#121622] p-1 rounded-lg border border-[#1c2333] text-[11px]">
                    <button
                      onClick={() => setActiveChannel('sms')}
                      className={`py-1 rounded font-medium transition-colors ${
                        activeChannel === 'sms' ? 'bg-[#2563eb] text-white' : 'text-[#94a3b8] hover:text-white'
                      }`}
                    >
                      Cell SMS
                    </button>
                    <button
                      onClick={() => setActiveChannel('whatsapp')}
                      className={`py-1 rounded font-medium transition-colors ${
                        activeChannel === 'whatsapp' ? 'bg-[#2563eb] text-white' : 'text-[#94a3b8] hover:text-white'
                      }`}
                    >
                      WhatsApp
                    </button>
                    <button
                      onClick={() => setActiveChannel('siren')}
                      className={`py-1 rounded font-medium transition-colors ${
                        activeChannel === 'siren' ? 'bg-[#2563eb] text-white' : 'text-[#94a3b8] hover:text-white'
                      }`}
                    >
                      Public Siren
                    </button>
                  </div>

                  {/* Channel Content Preview */}
                  <div className="p-2.5 bg-[#121622] rounded border border-[#1c2333] text-[11.5px] font-data-point text-[#cbd5e1]">
                    {activeChannel === 'sms' && (
                      <span><strong className="text-amber-400">[NDMA HEAT ALERT]</strong> Mandatory outdoor labor halt 11:30 AM–3:30 PM. Free hydration centers open at Ward 12 Municipal School.</span>
                    )}
                    {activeChannel === 'whatsapp' && (
                      <span><strong className="text-emerald-400">[CIVIC DISPATCH]</strong> Wet-bulb index crossing 34°C. Live cooling shelter locator map link attached.</span>
                    )}
                    {activeChannel === 'siren' && (
                      <span><strong className="text-rose-400">[ACOUSTIC GRID]</strong> Continuous 2-tone thermal warning armed for informal construction hubs.</span>
                    )}
                  </div>

                  {/* Trigger broadcast simulation */}
                  <button
                    onClick={handleTriggerBroadcast}
                    disabled={broadcastSent}
                    className={`w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-[12px] font-semibold transition-all ${
                      broadcastSent
                        ? 'bg-emerald-600 text-white'
                        : 'bg-[#2563eb] hover:bg-[#1d4ed8] text-white'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {broadcastSent ? 'check_circle' : 'send'}
                    </span>
                    <span>{broadcastSent ? 'Dispatched to 14,400 Registered Residents' : `Simulate Broadcast (${broadcastCount.toLocaleString()} Reach)`}</span>
                  </button>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-[#242e42] flex items-center justify-between text-[12.5px]">
                <span className="text-[#94a3b8]">NDMA CAP v1.2 XML Feed</span>
                <button 
                  onClick={() => onNavigate('alerts')}
                  className="text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
                >
                  <span>Alerts Feed</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Citizen Emergency Resource Desk (Helplines) */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-16">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-[12px] font-label-caps text-emerald-400 uppercase tracking-wider font-semibold block mb-2">
            Civic Emergency Lines
          </span>
          <h2 className="font-display-lg text-[26px] sm:text-[34px] font-bold text-white tracking-tight">
            Direct emergency access &amp; civic relief
          </h2>
          <p className="text-[14.5px] text-[#94a3b8] mt-2">
            Immediate 24/7 tele-triage, medical ambulance dispatch, and municipal tanker logistics.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: 1800-22-COOL */}
          <div className="bg-[#121622] border border-[#212a3d] hover:border-emerald-500/40 rounded-xl p-6 flex flex-col justify-between shadow-sm transition-colors">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[13px] font-semibold text-[#cbd5e1]">
                  Heatwave Helpline
                </span>
                <span className="material-symbols-outlined text-emerald-400 text-[22px]">
                  call
                </span>
              </div>
              <div className="font-display-lg text-[30px] font-bold text-emerald-400 tracking-tight mb-2">
                1800-22-COOL
              </div>
              <p className="text-[13.5px] text-[#94a3b8] leading-relaxed mb-6">
                24/7 toll-free medical triage, nearest cooling sanctuary routing, and real-time first-aid guidance.
              </p>
            </div>

            <button
              onClick={() => onOpenHelplineModal ? onOpenHelplineModal('helpline') : onNavigate('alerts')}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 rounded-lg text-[13.5px] transition-colors flex items-center justify-center gap-2"
              id="call-toll-free-btn"
            >
              <span className="material-symbols-outlined text-[17px]">phone_in_talk</span>
              <span>Open Triage Desk</span>
            </button>
          </div>

          {/* Card 2: 108 / 112 Paramedic Ambulance */}
          <div className="bg-[#121622] border border-[#212a3d] hover:border-rose-500/40 rounded-xl p-6 flex flex-col justify-between shadow-sm transition-colors">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[13px] font-semibold text-[#cbd5e1]">
                  Ambulance &amp; EMS Dispatch
                </span>
                <span className="material-symbols-outlined text-rose-400 text-[22px]">
                  medical_services
                </span>
              </div>
              <div className="font-display-lg text-[30px] font-bold text-rose-400 tracking-tight mb-2">
                108 / 112
              </div>
              <p className="text-[13.5px] text-[#94a3b8] leading-relaxed mb-6">
                Emergency paramedical ambulances equipped with active cold-water immersion packs and IV hydration.
              </p>
            </div>

            <button
              onClick={() => onOpenHelplineModal ? onOpenHelplineModal('ambulance') : onNavigate('alerts')}
              className="w-full bg-rose-600 hover:bg-rose-500 text-white font-semibold py-3 rounded-lg text-[13.5px] transition-colors flex items-center justify-center gap-2"
              id="call-emergency-108-btn"
            >
              <span className="material-symbols-outlined text-[17px]">ambulance</span>
              <span>Dispatch Ambulance</span>
            </button>
          </div>

          {/* Card 3: 1916 Civic Water Tanker */}
          <div className="bg-[#121622] border border-[#212a3d] hover:border-blue-500/40 rounded-xl p-6 flex flex-col justify-between shadow-sm transition-colors">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[13px] font-semibold text-[#cbd5e1]">
                  Civic Water Tanker Request
                </span>
                <span className="material-symbols-outlined text-blue-400 text-[22px]">
                  water_drop
                </span>
              </div>
              <div className="font-display-lg text-[30px] font-bold text-blue-400 tracking-tight mb-2">
                1916
              </div>
              <p className="text-[13.5px] text-[#94a3b8] leading-relaxed mb-6">
                Direct municipal request for mobile 10,000L drinking water tankers and public misting cannon deployment.
              </p>
            </div>

            <button
              onClick={() => onOpenHelplineModal ? onOpenHelplineModal('water') : onNavigate('alerts')}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-lg text-[13.5px] transition-colors flex items-center justify-center gap-2"
              id="request-water-tanker-btn"
            >
              <span className="material-symbols-outlined text-[17px]">local_shipping</span>
              <span>Request Water Tanker</span>
            </button>
          </div>
        </div>
      </section>

      {/* Institutional Footer */}
      <footer className="w-full border-t border-[#1c2333] bg-[#090c12] py-8 px-4 sm:px-8 mt-auto text-[#64748b] text-[12.5px]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <ThermometerLogo size="sm" />
            <div>
              <span className="text-white font-semibold block text-[13.5px]">
                TaapRaksha • India’s Human Heat Risk Intelligence
              </span>
              <span>
                Engineered under National Disaster Management Authority (NDMA) &amp; IMD Standards
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 font-medium text-[#94a3b8]">
            <button onClick={() => onNavigate('map')} className="hover:text-white transition-colors">
              Risk Map
            </button>
            <button onClick={() => onNavigate('thermal_stress')} className="hover:text-white transition-colors">
              WBGT Solver
            </button>
            <button onClick={() => onNavigate('infrastructure')} className="hover:text-white transition-colors">
              Cooling Shelters
            </button>
            <button onClick={() => onNavigate('datasources')} className="hover:text-white transition-colors">
              Data Governance
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

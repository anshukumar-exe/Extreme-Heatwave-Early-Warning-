import React from 'react';
import { motion } from 'motion/react';
import { ViewMode, Region, WardData } from '../types';
import { HelplineType } from './Modals/EmergencyHelplineModal';
import { ThermometerLogo } from './ThermometerLogo';

interface LandingPageProMaxProps {
  onNavigate: (view: ViewMode) => void;
  currentRegion?: Region;
  wards?: WardData[];
  onOpenHelplineModal?: (type: HelplineType) => void;
  onOpenIncidentModal?: () => void;
  onOpenDeployModal?: () => void;
}

export const LandingPageProMax: React.FC<LandingPageProMaxProps> = ({
  onNavigate,
  onOpenHelplineModal
}) => {
  // Key high-exposure regions with clean telemetry
  const keyRegions = [
    {
      city: 'Delhi-NCR',
      zone: 'Northern Plains',
      temp: '43.8°C',
      wbgt: '33.2°C',
      status: 'Critical Alert',
      statusColor: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    },
    {
      city: 'Ahmedabad',
      zone: 'Western Arid',
      temp: '42.4°C',
      wbgt: '31.8°C',
      status: 'High Strain',
      statusColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    },
    {
      city: 'Nagpur',
      zone: 'Central India',
      temp: '44.5°C',
      wbgt: '33.6°C',
      status: 'Critical Alert',
      statusColor: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    },
    {
      city: 'Kolkata',
      zone: 'Eastern Coastal',
      temp: '39.8°C',
      wbgt: '34.4°C',
      status: 'Extreme WBGT',
      statusColor: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    },
  ];

  const keyCapabilities = [
    {
      icon: 'thermostat',
      title: 'Biometeorological WBGT',
      description: 'Calculates true Wet-Bulb Globe Temperature to measure physiological strain and safe work-rest cycles for active human bodies.',
      view: 'thermal_stress' as ViewMode,
    },
    {
      icon: 'groups',
      title: 'Vulnerability Demographics',
      description: 'Maps high-exposure outdoor workers, elderly populations, and informal settlements lacking mechanical cooling.',
      view: 'vulnerability' as ViewMode,
    },
    {
      icon: 'emergency',
      title: 'Cooling & Emergency Response',
      description: 'Directs vulnerable citizens to municipal cooling shelters, hydration stations, and active NDMA heatwave advisories.',
      view: 'infrastructure' as ViewMode,
    },
  ];

  return (
    <div className="min-h-screen bg-[#070a12] text-[#f1f5f9] flex flex-col relative overflow-x-hidden selection:bg-amber-500 selection:text-slate-950" id="taapraksha-promax-landing">
      {/* Subtle Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-blue-600/10 via-indigo-600/5 to-transparent blur-[140px] pointer-events-none -z-10"></div>

      {/* Centered Main Brand Header */}
      <header className="w-full bg-[#070a12]/90 sticky top-0 z-40 backdrop-blur-md">
        <div className="w-full max-w-5xl mx-auto px-4 sm:px-8">
          <div className="py-3.5 border-b border-white/[0.08] flex items-center justify-center">
            <div 
              onClick={() => onNavigate('landing')}
              className="flex flex-col items-center justify-center cursor-pointer group select-none"
              id="brand-header-taapraksha"
            >
              <div className="flex items-center justify-center gap-2">
                <ThermometerLogo size="md" />
                <span className="text-[21px] sm:text-[23px] font-bold text-slate-100 group-hover:text-white tracking-tight transition-colors">
                  TaapRaksha
                </span>
              </div>
              <span className="text-[11.5px] text-slate-400 font-normal text-center mt-0.5">
                India’s Human Heat Risk Intelligence
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="w-full max-w-5xl mx-auto px-4 sm:px-8 pt-10 sm:pt-14 pb-16 flex flex-col items-center text-center">
        {/* Status Advisory Badge */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#111624] border border-white/10 text-[12px] text-slate-300 mb-6 backdrop-blur-sm"
        >
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
          <span className="font-semibold text-rose-300">LIVE ADVISORY</span>
          <span className="text-slate-600">•</span>
          <span>Monitoring Active Heat Stress Across Indian Municipal Grids</span>
        </motion.div>

        {/* Primary Headline */}
        <motion.h1 
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="text-[34px] sm:text-[46px] md:text-[54px] font-extrabold text-white tracking-tight leading-[1.15] max-w-3xl mb-5"
        >
          Predicting the human impact of extreme heat in India.
        </motion.h1>

        {/* Subtitle */}
        <motion.p 
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="text-[15px] sm:text-[17px] text-slate-400 max-w-2xl mb-8 leading-relaxed"
        >
          Translating biometeorological wet-bulb globe temperature (WBGT), nocturnal recovery deficits, and demographic exposure into life-saving civic action.
        </motion.p>

        {/* Primary Actions */}
        <motion.div 
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto mb-14"
        >
          <button
            onClick={() => onNavigate('map')}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white font-semibold text-[14px] px-6 py-3 rounded-xl shadow-lg shadow-blue-500/20 border border-blue-400/30 transition-all flex items-center justify-center gap-2 active:scale-95"
            id="hero-launch-command-btn"
          >
            <span className="material-symbols-outlined text-[19px]">map</span>
            <span>Launch Live Risk Map</span>
          </button>

          <button
            onClick={() => onNavigate('infrastructure')}
            className="w-full sm:w-auto bg-[#141b2b] hover:bg-[#1c263b] border border-white/10 text-slate-200 font-medium text-[14px] px-5 py-3 rounded-xl transition-all flex items-center justify-center gap-2 active:scale-95"
            id="hero-find-shelters-btn"
          >
            <span className="material-symbols-outlined text-[18px] text-blue-400">home_pin</span>
            <span>Locate Cooling Shelters</span>
          </button>

          <button
            onClick={() => onOpenHelplineModal ? onOpenHelplineModal('helpline') : onNavigate('alerts')}
            className="w-full sm:w-auto bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-500/30 text-emerald-300 font-medium text-[13.5px] px-4 py-3 rounded-xl transition-all flex items-center justify-center gap-2 active:scale-95"
            id="hero-helpline-pill-btn"
          >
            <span className="material-symbols-outlined text-[17px] text-emerald-400">call</span>
            <span>Toll-Free 1800-22-COOL</span>
          </button>
        </motion.div>

        {/* Live Regional Status - Clean & Streamlined */}
        <section className="w-full text-left mb-14">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-[17px] sm:text-[19px] font-bold text-white tracking-tight">
                Current Regional Threat Snapshot
              </h2>
              <p className="text-[12.5px] text-slate-400">
                Real-time biometeorological readings across high-exposure municipal hubs
              </p>
            </div>
            <button
              onClick={() => onNavigate('map')}
              className="text-[12.5px] text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 transition-colors"
            >
              <span>View Full Grid</span>
              <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {keyRegions.map((region) => (
              <div
                key={region.city}
                onClick={() => onNavigate('map')}
                className="bg-[#0f1422]/80 hover:bg-[#141b2c] border border-white/[0.08] hover:border-blue-500/30 rounded-xl p-4 cursor-pointer transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between mb-1">
                    <span className="font-semibold text-white group-hover:text-blue-300 transition-colors text-[15px]">
                      {region.city}
                    </span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border font-semibold ${region.statusColor}`}>
                      {region.status}
                    </span>
                  </div>
                  <span className="text-[11.5px] text-slate-400 block mb-3">
                    {region.zone}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/[0.06] text-[12px]">
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase font-mono">Temp</span>
                    <span className="font-mono font-bold text-amber-400">{region.temp}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 block uppercase font-mono">WBGT Strain</span>
                    <span className="font-mono font-bold text-rose-400">{region.wbgt}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 3 Core Pillars - Focused & Uncluttered */}
        <section className="w-full text-left mb-12">
          <div className="border-t border-white/[0.08] pt-10 mb-6">
            <h2 className="text-[17px] sm:text-[19px] font-bold text-white tracking-tight">
              Operational Heat Risk Framework
            </h2>
            <p className="text-[12.5px] text-slate-400">
              Three integrated systems protecting citizens and coordinating municipal response
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {keyCapabilities.map((cap) => (
              <div
                key={cap.title}
                onClick={() => onNavigate(cap.view)}
                className="bg-[#0e1320]/60 hover:bg-[#121828] border border-white/[0.07] hover:border-white/20 rounded-xl p-5 cursor-pointer transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="w-9 h-9 rounded-lg bg-blue-600/15 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-3 group-hover:scale-105 transition-transform">
                    <span className="material-symbols-outlined text-[20px]">{cap.icon}</span>
                  </div>
                  <h3 className="font-bold text-white text-[15px] mb-1.5 group-hover:text-blue-300 transition-colors">
                    {cap.title}
                  </h3>
                  <p className="text-[12.5px] text-slate-400 leading-relaxed">
                    {cap.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center text-[12px] text-blue-400 font-medium group-hover:text-blue-300">
                  <span>Explore Module</span>
                  <span className="material-symbols-outlined text-[15px] ml-1">arrow_forward</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Minimal Footer */}
        <footer className="w-full pt-8 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-3 text-[12px] text-slate-500">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">TaapRaksha Heat Risk Intelligence</span>
            <span>•</span>
            <span>NDMA &amp; IMD Aligned</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <button onClick={() => onNavigate('map')} className="hover:text-white transition-colors">
              Risk Map
            </button>
            <button onClick={() => onNavigate('forecast')} className="hover:text-white transition-colors">
              5-Day Forecast
            </button>
            <button onClick={() => onNavigate('thermal_stress')} className="hover:text-white transition-colors">
              Biometeorology
            </button>
            <button onClick={() => onNavigate('infrastructure')} className="hover:text-white transition-colors">
              Cooling Shelters
            </button>
            <button 
              onClick={() => onOpenHelplineModal ? onOpenHelplineModal('helpline') : onNavigate('alerts')} 
              className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
            >
              1800-22-COOL
            </button>
          </div>
        </footer>
      </main>
    </div>
  );
};

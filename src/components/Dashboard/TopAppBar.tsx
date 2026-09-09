import React, { useState, useEffect } from 'react';
import { Region, ViewMode, AlertItem } from '../../types';
import { ThermometerLogo } from '../ThermometerLogo';
import { HelplineType } from '../Modals/EmergencyHelplineModal';

interface TopAppBarProps {
  currentRegion: Region;
  regions: Region[];
  onSelectRegion: (region: Region) => void;
  onNavigate: (view: ViewMode) => void;
  currentView?: ViewMode;
  activeAlerts: AlertItem[];
  operatorName: string;
  onOpenDeployModal: () => void;
  onOpenHelplineModal?: (type?: HelplineType) => void;
  onDetectLocation?: () => void;
  isLocating?: boolean;
  userCoords?: { lat: number; lng: number } | null;
  onToggleMobileMenu?: () => void;
  isMobileMenuOpen?: boolean;
}

export const TopAppBar: React.FC<TopAppBarProps> = ({
  currentRegion,
  regions,
  onSelectRegion,
  onNavigate,
  currentView = 'dashboard',
  activeAlerts,
  operatorName,
  onOpenDeployModal,
  onOpenHelplineModal,
  onDetectLocation,
  isLocating = false,
  userCoords = null,
  onToggleMobileMenu,
  isMobileMenuOpen = false
}) => {
  const [showRegionDropdown, setShowRegionDropdown] = useState(false);
  const [showAlertsDropdown, setShowAlertsDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [currentTimeStr, setCurrentTimeStr] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedZone, setSelectedZone] = useState<string>('All');

  // Close dropdowns on outside click or escape key
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('#top-region-selector-container')) {
        setShowRegionDropdown(false);
      }
      if (!target.closest('#top-alerts-container')) {
        setShowAlertsDropdown(false);
      }
      if (!target.closest('#top-profile-container')) {
        setShowProfileDropdown(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowRegionDropdown(false);
        setShowAlertsDropdown(false);
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('click', handleOutsideClick);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = activeAlerts.filter(a => !a.acknowledged).length;

  const filteredRegions = regions.filter(reg => {
    const matchesSearch = 
      reg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reg.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (reg.district && reg.district.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (reg.imdZone && reg.imdZone.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesZone = selectedZone === 'All' || reg.zone === selectedZone;

    return matchesSearch && matchesZone;
  });

  const getSectionTitle = (view?: string) => {
    switch (view) {
      case 'dashboard': return 'Command Overview';
      case 'map': return 'Grid Map & Clusters';
      case 'forecast': return '5-Day Forecast';
      case 'thermal_stress': return 'Thermal Stress';
      case 'heatwave': return 'Heatwave Anomaly';
      case 'history': return '30-Yr Baselines';
      case 'uhi': return 'Urban Heat Island';
      case 'vulnerability': return 'Vulnerable Population';
      case 'infrastructure': return 'Cooling Shelters & ICUs';
      case 'alerts': return 'Emergency Alerts';
      case 'analytics': return 'Deep Analytics';
      case 'datasources': return 'Data Sources';
      case 'settings': return 'Operator Settings';
      case 'admin': return 'System Verification';
      default: return 'Command Center';
    }
  };

  const isSubView = currentView !== 'dashboard' && (currentView as string) !== 'overview';

  const getAlertBadge = () => {
    const code = currentRegion.hazardLevelCode;
    const txt = currentRegion.hazardLevel.toUpperCase();
    if (code >= 4 || txt.includes('RED') || txt.includes('SEVERE')) {
      return { label: 'IMD Red Alert', color: 'bg-rose-500/15 border-rose-500/40 text-rose-300', dot: 'bg-rose-500' };
    }
    if (code === 3 || txt.includes('ORANGE') || txt.includes('HEATWAVE')) {
      return { label: 'IMD Orange Alert', color: 'bg-amber-500/15 border-amber-500/40 text-amber-300', dot: 'bg-amber-400' };
    }
    if (code === 2 || txt.includes('YELLOW') || txt.includes('MODERATE')) {
      return { label: 'IMD Yellow Alert', color: 'bg-yellow-500/15 border-yellow-500/40 text-yellow-300', dot: 'bg-yellow-400' };
    }
    return { label: 'Normal Monitoring', color: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300', dot: 'bg-emerald-400' };
  };

  const alertBadge = getAlertBadge();

  return (
    <header className="glass-header backdrop-blur-xl bg-[#090d16]/85 border-b border-white/[0.08] shadow-[0_4px_30px_rgba(0,0,0,0.35)] flex justify-between items-center w-full px-4 sm:px-6 md:px-8 h-16 z-30 shrink-0 select-none text-[#e5e7eb] sticky top-0">
      {/* Left section: Back Arrow, Brand & Location Selector */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {/* Mobile Navigation Toggle Button */}
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            className="md:hidden w-8 h-8 rounded-lg flex items-center justify-center text-[#94a3b8] hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/[0.16] backdrop-blur-md transition-all shrink-0"
            title={isMobileMenuOpen ? 'Close Menu' : 'Open Navigation Menu'}
            id="header-mobile-menu-btn"
            aria-label="Toggle navigation drawer"
          >
            <span className="material-symbols-outlined text-[20px]">
              {isMobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        )}

        {/* Sleek Arrow Back Button - directly takes to landing page */}
        <button
          onClick={() => onNavigate('landing')}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-[#94a3b8] hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/[0.16] backdrop-blur-md transition-all shrink-0 group"
          title="Back to Landing Page"
          id="header-back-button"
          aria-label="Back to Landing Page"
        >
          <span className="material-symbols-outlined text-[18px] group-hover:-translate-x-0.5 transition-transform text-[#94a3b8] group-hover:text-white">
            arrow_back
          </span>
        </button>

        {/* Brand */}
        <div 
          onClick={() => onNavigate('landing')}
          className="flex items-center gap-2.5 cursor-pointer group shrink-0"
          title="Return to Public Threat Hub"
          id="topappbar-brand"
        >
          <ThermometerLogo size="sm" />
          <div className="flex flex-col">
            <span className="text-[16px] sm:text-[17px] font-bold text-slate-100 group-hover:text-white tracking-tight whitespace-nowrap leading-tight transition-colors">
              TaapRaksha
            </span>
            <span className="text-[9.5px] text-slate-400 tracking-wider uppercase font-medium">
              Heat Risk Grid
            </span>
          </div>
        </div>

        <div className="h-5 w-px bg-white/[0.08] shrink-0 mx-0.5"></div>

        {/* Clean, Decluttered Region Selector */}
        <div className="relative shrink-0" id="top-region-selector-container">
          <button
            onClick={() => setShowRegionDropdown(!showRegionDropdown)}
            className="flex items-center gap-2 text-[#cbd5e1] hover:text-white text-[12.5px] bg-white/[0.04] hover:bg-white/[0.08] px-3 py-1.5 rounded-lg border border-white/[0.08] hover:border-white/[0.16] backdrop-blur-md transition-all whitespace-nowrap shadow-sm group"
            id="top-region-selector-btn"
          >
            <span className="material-symbols-outlined text-[16px] text-amber-400 group-hover:scale-105 transition-transform">
              location_on
            </span>
            <span className="max-w-[150px] sm:max-w-[220px] md:max-w-[280px] truncate font-medium text-white">
              {currentRegion.name.replace(' Urban Heat Island Grid', '')}
            </span>
            <span className="material-symbols-outlined text-[15px] text-[#64748b] group-hover:text-[#94a3b8]">
              {showRegionDropdown ? 'expand_less' : 'expand_more'}
            </span>
          </button>

          {showRegionDropdown && (
            <div className="absolute left-0 mt-2 w-80 sm:w-96 glass-card bg-[#0b0f19]/95 backdrop-blur-2xl border border-white/10 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] py-2 z-50 overflow-hidden">
              {/* Header & Location Detect CTA */}
              <div className="px-3.5 pt-1.5 pb-2 border-b border-white/[0.08] space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-label-caps text-[#9ca3af] uppercase">
                    All-India Municipal &amp; Heat Zones
                  </span>
                  <span className="text-[10px] text-amber-400 font-data-point">
                    {regions.length} Locations Covered
                  </span>
                </div>

                {onDetectLocation && (
                  <button
                    onClick={() => {
                      onDetectLocation();
                      setShowRegionDropdown(false);
                    }}
                    disabled={isLocating}
                    className="w-full bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 px-3 py-1.5 rounded-lg flex items-center justify-center gap-2 text-[12px] font-data-point transition-colors"
                  >
                    <span className={`material-symbols-outlined text-[16px] ${isLocating ? 'animate-spin' : ''}`}>
                      my_location
                    </span>
                    <span>{isLocating ? 'Detecting GPS Location...' : 'Use My Live GPS Location'}</span>
                  </button>
                )}

                {/* Search Input */}
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[#9ca3af] text-[16px]">
                    search
                  </span>
                  <input
                    type="text"
                    placeholder="Search any Indian city, state, or district..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-[#070a12]/80 border border-white/[0.08] rounded-lg pl-8 pr-3 py-1.5 text-[12px] text-[#e5e7eb] focus:outline-none focus:border-amber-400/50"
                  />
                </div>

                {/* Zone Filter Chips */}
                <div className="flex gap-1 overflow-x-auto pb-1 no-scrollbar text-[10px] font-label-caps">
                  {['All', 'North', 'West', 'South', 'East', 'Central', 'North-East'].map((z) => (
                    <button
                      key={z}
                      onClick={() => setSelectedZone(z)}
                      className={`px-2 py-0.5 rounded-md shrink-0 transition-colors ${
                        selectedZone === z ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-white/[0.04] text-[#9ca3af] hover:bg-white/[0.08]'
                      }`}
                    >
                      {z}
                    </button>
                  ))}
                </div>
              </div>

              {/* Regions List */}
              <div className="max-h-72 overflow-y-auto divide-y divide-white/[0.05]">
                {filteredRegions.length === 0 ? (
                  <div className="p-4 text-center text-[12px] text-[#9ca3af]">
                    No matching Indian district found.
                  </div>
                ) : (
                  filteredRegions.map((reg) => (
                    <button
                      key={reg.id}
                      onClick={() => {
                        onSelectRegion(reg);
                        setShowRegionDropdown(false);
                      }}
                      className={`w-full text-left px-3.5 py-2.5 flex items-center justify-between text-[13px] hover:bg-[#171d2e] transition-colors ${
                        reg.id === currentRegion.id ? 'bg-[#171d2e] text-[#60a5fa] font-bold' : 'text-[#e5e7eb]'
                      }`}
                    >
                      <div className="flex-1 pr-2">
                        <div className="flex items-center gap-2">
                          <span className="font-data-point">{reg.name}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#21283b] text-[#9ca3af] font-label-caps">
                            {reg.state}
                          </span>
                        </div>
                        <div className="text-[11px] text-[#9ca3af] flex items-center gap-2 mt-0.5">
                          <span className={reg.hazardLevelCode >= 4 ? 'text-[#f87171]' : reg.hazardLevelCode === 3 ? 'text-[#fb923c]' : 'text-[#60a5fa]'}>
                            {reg.hazardLevel}
                          </span>
                          <span>•</span>
                          <span>{reg.averageTemp}°C</span>
                        </div>
                      </div>
                      {reg.id === currentRegion.id && (
                        <span className="material-symbols-outlined text-[16px] text-[#60a5fa] shrink-0">check</span>
                      )}
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Section: Threat Level Badge, Clean Live Clock, Alerts, Single Deploy Action, Profile */}
      <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
        {/* Threat Level Badge */}
        <div className={`hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full border whitespace-nowrap text-[11.5px] font-medium tracking-wide shadow-sm ${alertBadge.color}`}>
          <span className={`w-2 h-2 rounded-full ${alertBadge.dot} animate-pulse shrink-0`}></span>
          <span>{alertBadge.label}</span>
        </div>

        {/* Live Clock */}
        <div className="hidden xl:flex items-center gap-1.5 bg-white/[0.04] border border-white/[0.08] backdrop-blur-md px-2.5 py-1 rounded-lg text-[#94a3b8] text-[11.5px] whitespace-nowrap font-medium">
          <span className="material-symbols-outlined text-[14px] text-amber-400">schedule</span>
          <span className="font-mono text-slate-200">{currentTimeStr || '12:00 PM'}</span>
          <span className="text-[10px] text-[#64748b]">IST</span>
        </div>

        {/* Notifications / Alerts Button */}
        <div className="relative" id="top-alerts-container">
          <button
            onClick={() => setShowAlertsDropdown(!showAlertsDropdown)}
            className="hover:bg-white/[0.08] bg-white/[0.03] text-[#94a3b8] hover:text-white transition-colors p-2 rounded-lg flex items-center justify-center relative border border-white/[0.08] backdrop-blur-md"
            title="Active Alerts"
          >
            <span className="material-symbols-outlined text-[19px]">notifications</span>
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
            )}
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
            )}
          </button>

          {showAlertsDropdown && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 glass-card bg-[#0b0f19]/95 backdrop-blur-2xl border border-white/10 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] z-50 overflow-hidden">
              <div className="p-3 bg-white/[0.03] border-b border-white/[0.08] flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] text-white font-bold">Active Alerts Stream</span>
                  <span className="bg-red-500 text-white font-mono text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                    {activeAlerts.length}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setShowAlertsDropdown(false);
                    onNavigate('alerts');
                  }}
                  className="text-amber-400 hover:text-amber-300 text-[11px] font-medium"
                >
                  View All
                </button>
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-white/[0.05]">
                {activeAlerts.slice(0, 4).map((alert) => (
                  <div key={alert.id} className="p-3 hover:bg-white/[0.04] transition-colors">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-[12px] text-white font-bold">{alert.title}</span>
                      <span className="text-[10px] text-[#64748b]">{alert.timestamp}</span>
                    </div>
                    <p className="text-[11px] text-[#cbd5e1] line-clamp-2">{alert.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* SINGLE Unified Deploy Emergency Response Action Button */}
        <button
          onClick={onOpenDeployModal}
          className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 active:scale-95 text-white px-3.5 py-1.5 rounded-lg text-[12px] font-medium flex items-center gap-1.5 shadow-[0_4px_16px_rgba(225,29,72,0.35)] transition-all whitespace-nowrap shrink-0"
          id="top-deploy-action-btn"
          title="Deploy Immediate Emergency Heatwave Response"
        >
          <span className="material-symbols-outlined text-[16px]">bolt</span>
          <span>Deploy Response</span>
        </button>

        {/* Profile / Operator Button */}
        <div className="relative" id="top-profile-container">
          <button
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            className="hover:bg-white/[0.08] bg-white/[0.03] text-[#cbd5e1] hover:text-white transition-colors p-2 rounded-xl flex items-center justify-center border border-white/[0.08] backdrop-blur-md"
            title="Operator Profile"
          >
            <span className="material-symbols-outlined text-[22px]">account_circle</span>
          </button>

          {showProfileDropdown && (
            <div className="absolute right-0 mt-2 w-64 glass-card bg-[#0b0f19]/95 backdrop-blur-2xl border border-white/10 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] p-3.5 z-50">
              <div className="flex items-center gap-3 pb-3 border-b border-white/[0.08]">
                <div className="w-10 h-10 rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <span className="material-symbols-outlined text-[20px]">badge</span>
                </div>
                <div>
                  <div className="font-data-point text-[13px] text-white font-bold">{operatorName}</div>
                  <div className="text-[11px] text-[#9ca3af] font-label-caps">Role: Emergency Commander</div>
                </div>
              </div>

              <div className="py-2 flex flex-col gap-1 text-[12px] text-[#cbd5e1]">
                <div className="flex justify-between py-1">
                  <span>Access Mode:</span>
                  <span className="text-emerald-400 font-data-point">Full Public &amp; Command</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Operational Status:</span>
                  <span className="text-white font-data-point">Active Grid</span>
                </div>
              </div>

              <div className="pt-2 border-t border-white/[0.08] flex gap-2">
                <button
                  onClick={() => {
                    setShowProfileDropdown(false);
                    onNavigate('settings');
                  }}
                  className="flex-1 bg-white/[0.05] hover:bg-white/[0.1] py-1.5 rounded-lg text-[11px] font-label-caps text-[#cbd5e1] transition-colors"
                >
                  Settings
                </button>
                <button
                  onClick={() => {
                    setShowProfileDropdown(false);
                    onNavigate('landing');
                  }}
                  className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 py-1.5 rounded-lg text-[11px] font-label-caps transition-colors"
                >
                  Public Hub
                </button>
              </div>
            </div>
          )}
        </div>
        </div>
      </header>
    );
  };

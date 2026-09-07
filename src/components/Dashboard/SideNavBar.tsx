import React from 'react';
import { ViewMode } from '../../types';
import { HelplineType } from '../Modals/EmergencyHelplineModal';

interface SideNavBarProps {
  currentView: ViewMode;
  onNavigate: (view: ViewMode) => void;
  unreadAlertsCount: number;
  onOpenDeployModal: () => void;
  onOpenLogsModal: () => void;
  onOpenHelplineModal?: (type?: HelplineType) => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const SideNavBar: React.FC<SideNavBarProps> = ({
  currentView,
  onNavigate,
  unreadAlertsCount,
  onOpenDeployModal,
  onOpenLogsModal,
  onOpenHelplineModal,
  isMobileOpen = false,
  onCloseMobile
}) => {
  const handleNav = (view: ViewMode) => {
    onNavigate(view);
    if (onCloseMobile) onCloseMobile();
  };

  const getNavClass = (view: ViewMode) => {
    const isActive = 
      currentView === view || 
      (view === 'dashboard' && (currentView as string) === 'overview') ||
      (view === 'history' && (currentView as string) === 'historical') ||
      (view === 'datasources' && (currentView as string) === 'sources');

    return `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[12.5px] font-medium transition-all text-left group relative ${
      isActive
        ? 'bg-amber-500 text-slate-950 font-bold shadow-[0_2px_14px_rgba(245,158,11,0.35)]'
        : 'text-slate-400 hover:bg-white/[0.05] hover:text-white'
    }`;
  };

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/75 backdrop-blur-sm z-40 md:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <nav
        className={`
          glass-panel bg-[#090d16]/90 backdrop-blur-2xl border-r border-white/[0.08] h-full flex flex-col py-5 px-3 md:px-4 shrink-0 select-none overflow-y-auto no-scrollbar
          fixed inset-y-0 left-0 z-50 w-64 transition-transform duration-200 ease-in-out
          ${isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
          md:relative md:translate-x-0 md:w-56 lg:w-64 md:z-20 md:shadow-none
        `}
      >
        {/* Command Center Title */}
        <div className="mb-4 px-2 flex items-center justify-between">
          <div>
            <h2 className="font-headline-md text-[16px] md:text-[18px] text-white mb-0.5 font-bold flex items-center gap-2">
              <span>Command Center</span>
            </h2>
            <p className="font-body-md text-[12px] text-[#94a3b8]">
              Vigilant Heat Intelligence
            </p>
          </div>
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="md:hidden text-[#94a3b8] hover:text-white p-1 rounded hover:bg-[#1c2333]"
              title="Close menu"
              aria-label="Close navigation menu"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          )}
        </div>

      {/* Main Nav Links */}
      <div className="flex-1 flex flex-col gap-1">
        {/* Section: Live Surveillance */}
        <span className="text-[10px] font-label-caps text-[#64748b] px-3 pt-2 pb-1 font-semibold uppercase tracking-wider">
          Surveillance
        </span>

        <button
          onClick={() => handleNav('dashboard')}
          className={getNavClass('dashboard')}
          id="nav-tab-overview"
        >
          <span 
            className="material-symbols-outlined text-[19px]"
            style={currentView === 'dashboard' ? { fontVariationSettings: "'FILL' 1" } : {}}
          >
            dashboard
          </span>
          <span>Overview</span>
        </button>

        <button
          onClick={() => handleNav('map')}
          className={getNavClass('map')}
          id="nav-tab-map"
        >
          <span 
            className="material-symbols-outlined text-[19px]"
            style={currentView === 'map' ? { fontVariationSettings: "'FILL' 1" } : {}}
          >
            map
          </span>
          <span>Map &amp; Clusters</span>
        </button>

        <button
          onClick={() => handleNav('forecast')}
          className={getNavClass('forecast')}
          id="nav-tab-forecast"
        >
          <span 
            className="material-symbols-outlined text-[19px]"
            style={currentView === 'forecast' ? { fontVariationSettings: "'FILL' 1" } : {}}
          >
            wb_sunny
          </span>
          <span>5-Day Forecast</span>
          <span className="ml-auto text-[9px] font-data-point px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30 font-semibold">
            IMD
          </span>
        </button>

        {/* Section: Biometeorological Science */}
        <span className="text-[10px] font-label-caps text-[#64748b] px-3 pt-3 pb-1 font-semibold uppercase tracking-wider">
          Scientific Engines
        </span>

        <button
          onClick={() => handleNav('thermal_stress')}
          className={getNavClass('thermal_stress')}
          id="nav-tab-thermal-stress"
        >
          <span 
            className="material-symbols-outlined text-[19px]"
            style={currentView === 'thermal_stress' ? { fontVariationSettings: "'FILL' 1" } : {}}
          >
            thermostat
          </span>
          <span>Thermal Stress</span>
        </button>

        <button
          onClick={() => handleNav('heatwave')}
          className={getNavClass('heatwave')}
          id="nav-tab-heatwave"
        >
          <span 
            className="material-symbols-outlined text-[19px]"
            style={currentView === 'heatwave' ? { fontVariationSettings: "'FILL' 1" } : {}}
          >
            local_fire_department
          </span>
          <span>Heatwave &amp; Anomaly</span>
        </button>

        <button
          onClick={() => handleNav('uhi')}
          className={getNavClass('uhi')}
          id="nav-tab-uhi"
        >
          <span 
            className="material-symbols-outlined text-[19px]"
            style={currentView === 'uhi' ? { fontVariationSettings: "'FILL' 1" } : {}}
          >
            domain
          </span>
          <span>Urban Heat Island (UHI)</span>
        </button>

        <button
          onClick={() => handleNav('history')}
          className={getNavClass('history')}
          id="nav-tab-historical"
        >
          <span 
            className="material-symbols-outlined text-[19px]"
            style={currentView === 'history' ? { fontVariationSettings: "'FILL' 1" } : {}}
          >
            history_edu
          </span>
          <span>30-Yr Baselines</span>
        </button>

        {/* Section: Human Exposure & Operations */}
        <span className="text-[10px] font-label-caps text-[#64748b] px-3 pt-3 pb-1 font-semibold uppercase tracking-wider">
          Action &amp; Operations
        </span>

        <button
          onClick={() => handleNav('vulnerability')}
          className={getNavClass('vulnerability')}
          id="nav-tab-vulnerability"
        >
          <span 
            className="material-symbols-outlined text-[19px]"
            style={currentView === 'vulnerability' ? { fontVariationSettings: "'FILL' 1" } : {}}
          >
            groups
          </span>
          <span>Vulnerable Population</span>
        </button>

        <button
          onClick={() => handleNav('infrastructure')}
          className={getNavClass('infrastructure')}
          id="nav-tab-infrastructure"
        >
          <span 
            className="material-symbols-outlined text-[19px]"
            style={currentView === 'infrastructure' ? { fontVariationSettings: "'FILL' 1" } : {}}
          >
            domain_add
          </span>
          <span>Cooling Shelters &amp; ICUs</span>
        </button>

        <button
          onClick={() => handleNav('alerts')}
          className={getNavClass('alerts')}
          id="nav-tab-alerts"
        >
          <span 
            className="material-symbols-outlined text-[19px]"
            style={currentView === 'alerts' ? { fontVariationSettings: "'FILL' 1" } : {}}
          >
            warning
          </span>
          <span>Alerts &amp; Rules</span>
          {unreadAlertsCount > 0 && (
            <span className="ml-auto bg-rose-600 text-white font-data-point text-[10px] px-2 py-0.5 rounded-full font-bold">
              {unreadAlertsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => handleNav('analytics')}
          className={getNavClass('analytics')}
          id="nav-tab-analytics"
        >
          <span 
            className="material-symbols-outlined text-[19px]"
            style={currentView === 'analytics' ? { fontVariationSettings: "'FILL' 1" } : {}}
          >
            monitoring
          </span>
          <span>Analytics</span>
        </button>

        {/* Section: Platform Config & Feeds */}
        <span className="text-[10px] font-label-caps text-[#64748b] px-3 pt-3 pb-1 font-semibold uppercase tracking-wider">
          Platform
        </span>

        <button
          onClick={() => handleNav('datasources')}
          className={getNavClass('datasources')}
          id="nav-tab-sources"
        >
          <span 
            className="material-symbols-outlined text-[19px]"
            style={currentView === 'datasources' ? { fontVariationSettings: "'FILL' 1" } : {}}
          >
            database
          </span>
          <span>Data Sources</span>
        </button>

        <button
          onClick={() => handleNav('admin')}
          className={getNavClass('admin')}
          id="nav-tab-admin"
        >
          <span 
            className="material-symbols-outlined text-[19px]"
            style={currentView === 'admin' ? { fontVariationSettings: "'FILL' 1" } : {}}
          >
            admin_panel_settings
          </span>
          <span>Admin &amp; Verification</span>
        </button>

        <button
          onClick={() => handleNav('settings')}
          className={getNavClass('settings')}
          id="nav-tab-settings"
        >
          <span 
            className="material-symbols-outlined text-[19px]"
            style={currentView === 'settings' ? { fontVariationSettings: "'FILL' 1" } : {}}
          >
            settings
          </span>
          <span>Settings</span>
        </button>
      </div>

      {/* Bottom Tools & Emergency Deploy Button */}
      <div className="mt-4 pt-3 border-t border-white/[0.08] flex flex-col gap-1.5 shrink-0">
        <button
          onClick={() => {
            if (onCloseMobile) onCloseMobile();
            if (onOpenHelplineModal) onOpenHelplineModal('helpline');
            else onNavigate('alerts');
          }}
          className="flex items-center gap-3 px-3.5 py-2 text-[#94a3b8] hover:bg-white/[0.05] hover:text-white transition-colors rounded-lg font-label-caps text-[11px] text-left cursor-pointer group"
          id="side-hotline-help-btn"
          title="24/7 National Heat Helpline & Emergency Triage"
        >
          <span className="material-symbols-outlined text-[18px] text-emerald-400">support_agent</span>
          <span className="flex-1 font-semibold">Hotline &amp; Help</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
        </button>

        <button
          onClick={() => {
            if (onCloseMobile) onCloseMobile();
            onOpenLogsModal();
          }}
          className="flex items-center gap-3 px-3.5 py-2 text-[#94a3b8] hover:bg-white/[0.05] hover:text-white transition-colors rounded-lg font-label-caps text-[11px] text-left"
          id="side-logs-btn"
        >
          <span className="material-symbols-outlined text-[18px]">history</span>
          <span>System Logs</span>
        </button>

        {/* Deploy Response Button */}
        <button
          onClick={() => {
            if (onCloseMobile) onCloseMobile();
            onOpenDeployModal();
          }}
          className="mt-2 w-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-label-caps text-[12px] font-semibold py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(225,29,72,0.35)] active:scale-95"
          id="deploy-response-btn"
        >
          <span className="material-symbols-outlined text-[18px]">emergency</span>
          <span>Deploy Response</span>
        </button>
      </div>
    </nav>
  </>
  );
};

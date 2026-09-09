import React, { useState } from 'react';
import { Region, InfrastructureItem } from '../../types';

interface InfrastructureViewProps {
  currentRegion: Region;
  onOpenDeployModal: () => void;
  onNavigate?: (view: any) => void;
}

export const InfrastructureView: React.FC<InfrastructureViewProps> = ({
  currentRegion,
  onOpenDeployModal,
  onNavigate
}) => {
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [routedFacility, setRoutedFacility] = useState<string | null>(null);

  const facilities: InfrastructureItem[] = [
    {
      id: 'fac-01',
      name: `${currentRegion.name} Civil Hospital & Heatstroke Center`,
      type: 'HOSPITAL',
      address: 'Near Central Railway Junction, Sector 1',
      wardId: 'W-01',
      distanceKm: 1.4,
      capacity: 120,
      currentOccupancy: 86,
      status: 'OPERATIONAL',
      availableServices: ['Heatstroke ICU (24 Beds)', 'IV Cold Saline Protocol', 'Rapid Immersion Cooling Baths', '24/7 Triage'],
      contactNumber: '011-2334-5501',
      hasBackupPower: true,
      hasMedicalStaff: true,
      hasChilledWater: true,
      coordinates: [currentRegion.lng, currentRegion.lat]
    },
    {
      id: 'fac-02',
      name: 'Dr. B.R. Ambedkar Municipal Cooling Pavilion',
      type: 'COOLING_CENTRE',
      address: 'Community Center Complex, Sector 4',
      wardId: 'W-02',
      distanceKm: 0.8,
      capacity: 350,
      currentOccupancy: 210,
      status: 'OPERATIONAL',
      availableServices: ['Central Air-Conditioning', 'Free ORS & Electrolyte Sachets', 'Reclining Rest Cots', 'Medical Nurse on Duty'],
      contactNumber: '1800-11-HEAT',
      hasBackupPower: true,
      hasMedicalStaff: true,
      hasChilledWater: true,
      coordinates: [currentRegion.lng + 0.01, currentRegion.lat - 0.01]
    },
    {
      id: 'fac-03',
      name: 'NDMA Rapid Hydration Station & Water Kiosk #14',
      type: 'WATER_POINT',
      address: 'Main Bus Terminal, North Zone',
      wardId: 'W-03',
      distanceKm: 0.5,
      capacity: 1500,
      currentOccupancy: 620,
      status: 'OPERATIONAL',
      availableServices: ['UV Chilled Drinking Water (20L/min)', 'Free Clean Cups & Refills', 'ORS Sachet Dispenser', 'Shaded Seating'],
      contactNumber: '011-2334-9988',
      hasBackupPower: false,
      hasMedicalStaff: false,
      hasChilledWater: true,
      coordinates: [currentRegion.lng - 0.01, currentRegion.lat + 0.01]
    },
    {
      id: 'fac-04',
      name: 'Municipal Fire & Misting Van Dispatch Post',
      type: 'FIRE_STATION',
      address: 'Industrial Road, Gate 3',
      wardId: 'W-04',
      distanceKm: 2.1,
      capacity: 10,
      currentOccupancy: 4,
      status: 'OPERATIONAL',
      availableServices: ['4x High-Pressure Road Misting Cannons', '2x Water Tankers (10,000L)', 'Paramedic First Response'],
      contactNumber: '101 / 112',
      hasBackupPower: true,
      hasMedicalStaff: true,
      hasChilledWater: true,
      coordinates: [currentRegion.lng + 0.02, currentRegion.lat + 0.02]
    },
    {
      id: 'fac-05',
      name: 'West End Community Air-Cooled Shelter',
      type: 'COMMUNITY_SHELTER',
      address: 'Public Library Auditorium, Block B',
      wardId: 'W-05',
      distanceKm: 3.2,
      capacity: 200,
      currentOccupancy: 185,
      status: 'FULL',
      availableServices: ['High-Capacity Evaporative Chillers', 'Senior Citizen Care Staff', 'Hydration Dispensary'],
      contactNumber: '011-4455-8822',
      hasBackupPower: true,
      hasMedicalStaff: false,
      hasChilledWater: true,
      coordinates: [currentRegion.lng - 0.02, currentRegion.lat - 0.02]
    }
  ];

  const filteredFacilities = facilities.filter(f => {
    const matchesType = selectedType === 'ALL' || f.type === selectedType;
    const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          f.address.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="flex-1 bg-[#0c0f17] p-6 md:p-8 overflow-y-auto selection:bg-[#2563eb] selection:text-white space-y-6" id="infrastructure-view-panel">
      {/* Route Notification Banner */}
      {routedFacility && (
        <div className="p-3.5 bg-blue-500/15 border border-blue-500/30 rounded-xl text-blue-300 text-[13px] flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[18px] text-blue-400">navigation</span>
            <span>Fastest municipal transit route calculated to: <strong className="text-white">{routedFacility}</strong></span>
          </div>
          <button 
            onClick={() => setRoutedFacility(null)}
            className="text-[#94a3b8] hover:text-white text-[11.5px] px-2.5 py-1 bg-[#182030] hover:bg-[#212a3d] rounded-lg border border-[#263147] transition-colors"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#1e2638]">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            {onNavigate && (
              <button
                onClick={() => onNavigate('dashboard')}
                className="flex items-center gap-1.5 text-[11.5px] font-medium text-[#60a5fa] hover:text-[#93c5fd] transition-colors py-1 px-2.5 rounded-lg bg-[#141a29] hover:bg-[#1c2438] border border-[#263147] group"
                id="infra-back-btn"
              >
                <span className="material-symbols-outlined text-[15px] group-hover:-translate-x-0.5 transition-transform">
                  arrow_back
                </span>
                <span>Command Overview</span>
              </button>
            )}
            <span className="text-[#334155]">•</span>
            <span className="material-symbols-outlined text-blue-400 text-[18px]">domain_add</span>
            <span className="text-[11px] text-blue-400 uppercase tracking-wider font-semibold">
              RELIEF &amp; HEALTH INFRASTRUCTURE
            </span>
          </div>
          <h1 className="text-[22px] md:text-[28px] text-white font-bold tracking-tight">
            {currentRegion.name} • Cooling Shelters &amp; Hospitals
          </h1>
          <p className="text-[13px] text-[#94a3b8] mt-1">
            Real-time occupancy tracking, hydration kiosks, heatstroke emergency ICUs, and misting dispatch.
          </p>
        </div>

        <button
          onClick={onOpenDeployModal}
          className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-[12.5px] font-medium flex items-center gap-2 transition-colors self-start md:self-auto shadow-sm"
        >
          <span className="material-symbols-outlined text-[17px]">emergency</span>
          <span>Deploy Emergency Response</span>
        </button>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-[#121622] border border-[#212a3d] rounded-xl p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Type Filter Chips */}
        <div className="flex gap-2 overflow-x-auto pb-1 text-[11px] no-scrollbar">
          {['ALL', 'HOSPITAL', 'COOLING_CENTRE', 'WATER_POINT', 'FIRE_STATION'].map(t => (
            <button
              key={t}
              onClick={() => setSelectedType(t)}
              className={`px-3 py-1.5 rounded-lg transition-colors shrink-0 font-medium ${
                selectedType === t 
                  ? 'bg-blue-600 text-white shadow-sm' 
                  : 'bg-[#182030] text-[#94a3b8] hover:text-white border border-[#263147]'
              }`}
            >
              {t.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative min-w-[240px]">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b] text-[17px]">
            search
          </span>
          <input
            type="text"
            placeholder="Search facility by name or address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#182030] border border-[#263147] rounded-lg pl-9 pr-3 py-1.5 text-[12.5px] text-white placeholder-[#64748b] focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
      </div>

      {/* Facilities Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredFacilities.map(f => {
          const occupancyRate = Math.round((f.currentOccupancy / f.capacity) * 100);
          return (
            <div
              key={f.id}
              className="bg-[#121622] border border-[#212a3d] rounded-xl p-5 shadow-sm flex flex-col justify-between space-y-4 hover:border-[#334155] transition-colors"
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                    f.type === 'HOSPITAL' ? 'bg-red-500/15 text-red-400 border border-red-500/30' :
                    f.type === 'COOLING_CENTRE' ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30' :
                    f.type === 'WATER_POINT' ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30' :
                    'bg-orange-500/15 text-orange-400 border border-orange-500/30'
                  }`}>
                    {f.type.replace('_', ' ')}
                  </span>

                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                    f.status === 'OPERATIONAL' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/15 text-red-400 border border-red-500/30'
                  }`}>
                    {f.status}
                  </span>
                </div>

                <h3 className="text-[16px] text-white font-bold mb-1">
                  {f.name}
                </h3>
                <p className="text-[12px] text-[#94a3b8] flex items-center gap-1 mb-3">
                  <span className="material-symbols-outlined text-[15px] text-blue-400">place</span>
                  <span>{f.address} • <strong className="text-white">{f.distanceKm} km away</strong></span>
                </p>

                {/* Capacity Bar */}
                <div className="space-y-1.5 bg-[#182030] p-3 rounded-lg border border-[#263147] mb-3">
                  <div className="flex justify-between text-[11.5px]">
                    <span className="text-[#94a3b8]">Capacity Load:</span>
                    <span className="font-mono text-white font-medium">{f.currentOccupancy} / {f.capacity} ({occupancyRate}%)</span>
                  </div>
                  <div className="w-full bg-[#0c0f17] h-2 rounded-full overflow-hidden border border-[#212a3d]">
                    <div
                      className={`h-full ${occupancyRate >= 90 ? 'bg-red-500' : occupancyRate >= 70 ? 'bg-orange-400' : 'bg-blue-500'}`}
                      style={{ width: `${occupancyRate}%` }}
                    ></div>
                  </div>
                </div>

                {/* Services Tags */}
                <div className="space-y-1.5">
                  <span className="text-[10px] text-[#94a3b8] uppercase font-medium block">KEY CAPABILITIES:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {f.availableServices.map((srv, idx) => (
                      <span key={idx} className="text-[11px] bg-[#182030] text-[#93c5fd] px-2 py-0.5 rounded border border-[#263147]">
                        {srv}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Footer */}
              <div className="pt-3 border-t border-[#1e2638] flex items-center justify-between text-[12px]">
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <span className="material-symbols-outlined text-[15px]">call</span>
                  <span className="font-mono text-[11.5px]">{f.contactNumber}</span>
                </div>

                <button
                  onClick={() => setRoutedFacility(f.name)}
                  className="text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <span>Directions</span>
                  <span className="material-symbols-outlined text-[15px]">navigation</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

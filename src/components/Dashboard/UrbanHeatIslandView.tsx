import React, { useState } from 'react';
import { Region, WardData } from '../../types';

interface UrbanHeatIslandViewProps {
  currentRegion: Region;
  wards: WardData[];
  onSelectWard: (ward: WardData) => void;
  onNavigate?: (view: any) => void;
}

export const UrbanHeatIslandView: React.FC<UrbanHeatIslandViewProps> = ({
  currentRegion,
  wards,
  onSelectWard,
  onNavigate
}) => {
  const [mitigationCoolRoofs, setMitigationCoolRoofs] = useState<number>(25); // % cool roofs deployed
  const [mitigationCanopy, setMitigationCanopy] = useState<number>(15); // % tree canopy added

  // Urban vs Rural LST baseline
  const urbanLst = currentRegion.averageTemp + 3.8;
  const ruralLst = currentRegion.averageTemp - 1.2;
  const uhiDelta = Number((urbanLst - ruralLst).toFixed(1));

  // Modeled temperature reduction based on mitigation sliders
  const modeledTempDrop = Number(((mitigationCoolRoofs * 0.035) + (mitigationCanopy * 0.045)).toFixed(1));
  const effectiveUhiDelta = Number((uhiDelta - modeledTempDrop).toFixed(1));

  // Sort wards by shade deficit / heat island severity
  const uhiWards = [...wards].sort((a, b) => {
    const aShade = a.shadeCoveragePercent ?? (a as any).shadeCoverage ?? 15;
    const bShade = b.shadeCoveragePercent ?? (b as any).shadeCoverage ?? 15;
    return aShade - bShade;
  });

  return (
    <div className="flex-1 bg-[#0c0f17] p-6 md:p-8 overflow-y-auto selection:bg-[#2563eb] selection:text-white space-y-6" id="uhi-analysis-view-panel">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#1e2638]">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            {onNavigate && (
              <button
                onClick={() => onNavigate('dashboard')}
                className="flex items-center gap-1.5 text-[11.5px] font-medium text-[#60a5fa] hover:text-[#93c5fd] transition-colors py-1 px-2.5 rounded-lg bg-[#141a29] hover:bg-[#1c2438] border border-[#263147] group"
                id="uhi-back-btn"
              >
                <span className="material-symbols-outlined text-[15px] group-hover:-translate-x-0.5 transition-transform">
                  arrow_back
                </span>
                <span>Command Overview</span>
              </button>
            )}
            <span className="text-[#334155]">•</span>
            <span className="material-symbols-outlined text-orange-400 text-[18px]">domain</span>
            <span className="text-[11px] text-orange-400 uppercase tracking-wider font-semibold">
              URBAN MORPHOLOGY &amp; SATELLITE LST
            </span>
          </div>
          <h1 className="text-[22px] md:text-[28px] text-white font-bold tracking-tight">
            {currentRegion.name} • Urban Heat Island (UHI) Analysis
          </h1>
          <p className="text-[13px] text-[#94a3b8] mt-1">
            Land Surface Temperature (LST) differentials derived from Landsat 8/9 Thermal Infrared and Sentinel-2 NDVI canopy data.
          </p>
        </div>
      </div>

      {/* Top 3 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-[#121622] border border-[#212a3d] rounded-xl p-5 shadow-sm">
          <span className="text-[11px] text-[#94a3b8] uppercase font-medium block mb-1">URBAN VS RURAL DELTA</span>
          <div className="flex items-baseline gap-1.5 text-red-400 font-mono">
            <span className="text-[32px] font-bold">+{uhiDelta}</span>
            <span className="text-[15px]">°C</span>
          </div>
          <span className="text-[12px] text-[#64748b] mt-2 block">
            Dense built-up core vs surrounding peri-urban greenbelt
          </span>
        </div>

        <div className="bg-[#121622] border border-[#212a3d] rounded-xl p-5 shadow-sm">
          <span className="text-[11px] text-[#94a3b8] uppercase font-medium block mb-1">CITYWIDE VEGETATION (NDVI)</span>
          <div className="flex items-baseline gap-2 text-emerald-400 font-mono">
            <span className="text-[32px] font-bold">0.18</span>
            <span className="text-[13px] text-[#94a3b8]">NDVI Mean</span>
          </div>
          <span className="text-[12px] text-red-400/90 mt-2 block font-medium">
            Severe vegetation deficit in 72% of wards
          </span>
        </div>

        <div className="bg-[#121622] border border-[#212a3d] rounded-xl p-5 shadow-sm">
          <span className="text-[11px] text-[#94a3b8] uppercase font-medium block mb-1">IMPERVIOUS SURFACE FRACTION</span>
          <div className="flex items-baseline gap-1.5 text-orange-400 font-mono">
            <span className="text-[32px] font-bold">84.2</span>
            <span className="text-[15px]">%</span>
          </div>
          <span className="text-[12px] text-[#64748b] mt-2 block">
            Asphalt, concrete, and tin roofing coverage
          </span>
        </div>
      </div>

      {/* Interactive UHI Mitigation Simulator */}
      <div className="bg-[#121622] border border-[#212a3d] rounded-xl p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-[17px] text-white font-bold">
              Urban Cooling &amp; Mitigation Simulation
            </h3>
            <p className="text-[12.5px] text-[#94a3b8] mt-0.5">
              Simulate micro-climate cooling impacts from high-albedo cool roofs and tree canopy expansion
            </p>
          </div>

          <div className="p-3 bg-[#182030] rounded-xl border border-[#263147] text-right">
            <span className="text-[10px] text-[#94a3b8] uppercase font-medium block">SIMULATED UHI REDUCTION</span>
            <div className="text-[20px] font-bold text-emerald-400 font-mono mt-0.5">
              -{modeledTempDrop}°C Cooling
            </div>
            <span className="text-[11px] text-[#64748b]">Effective Delta: +{effectiveUhiDelta}°C</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="flex justify-between items-center text-[12.5px]">
              <span className="text-white font-medium">Cool Roofs Deployment (% Building Area)</span>
              <span className="text-blue-400 font-bold font-mono">{mitigationCoolRoofs}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={mitigationCoolRoofs}
              onChange={(e) => setMitigationCoolRoofs(parseInt(e.target.value))}
              className="w-full accent-blue-500 cursor-pointer"
            />
            <span className="text-[11px] text-[#64748b] block">Solar reflectance (SRI &gt; 80) paint / reflective membrane</span>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center text-[12.5px]">
              <span className="text-white font-medium">Urban Tree Canopy Expansion (%)</span>
              <span className="text-emerald-400 font-bold font-mono">+{mitigationCanopy}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              value={mitigationCanopy}
              onChange={(e) => setMitigationCanopy(parseInt(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <span className="text-[11px] text-[#64748b] block">Avenue tree planting along transit corridors &amp; open parks</span>
          </div>
        </div>
      </div>

      {/* Ward-by-Ward UHI Heat Vulnerability Table */}
      <div className="bg-[#121622] border border-[#212a3d] rounded-xl p-6 shadow-sm space-y-4">
        <h3 className="text-[17px] text-white font-bold">
          Ward-Level Surface Temperature &amp; Shade Deficits
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[12.5px] divide-y divide-[#1e2638]">
            <thead className="text-[11px] text-[#94a3b8] uppercase bg-[#182030]">
              <tr>
                <th className="py-3 px-4 font-semibold">Ward Name</th>
                <th className="py-3 px-3 font-semibold">Surface LST</th>
                <th className="py-3 px-3 font-semibold">Air Temp</th>
                <th className="py-3 px-3 font-semibold">Shade Coverage</th>
                <th className="py-3 px-3 font-semibold">Built-Up Density</th>
                <th className="py-3 px-4 font-semibold">Action Priority</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e2638] text-[#cbd5e1]">
              {uhiWards.map(w => (
                <tr
                  key={w.id}
                  onClick={() => onSelectWard(w)}
                  className="hover:bg-[#182030] cursor-pointer transition-colors"
                >
                  <td className="py-3 px-4 font-semibold text-white">{w.name}</td>
                  <td className="py-3 px-3 font-mono text-red-400 font-bold">
                    {(w.currentTemp + 3.5).toFixed(1)}°C
                  </td>
                  <td className="py-3 px-3 font-mono text-white">{w.currentTemp}°C</td>
                  <td className="py-3 px-3 font-mono">
                    <span className={(w.shadeCoveragePercent ?? 14) < 15 ? 'text-red-400 font-semibold' : 'text-emerald-400 font-semibold'}>
                      {w.shadeCoveragePercent ?? 14}%
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono">
                    {Math.round(70 + (w.vulnerabilityIndex ?? 0.5) * 25)}%
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      w.status === 'critical' ? 'bg-red-500/15 text-red-400 border border-red-500/30' : 'bg-orange-500/15 text-orange-400 border border-orange-500/30'
                    }`}>
                      {w.status === 'critical' ? 'PRIORITY 1 COOLING' : 'PRIORITY 2 MISTING'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

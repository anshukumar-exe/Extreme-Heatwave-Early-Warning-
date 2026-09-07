import React, { useState } from 'react';
import { Region, HistoricalHeatwaveEvent } from '../../types';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';

interface HistoricalAnalysisViewProps {
  currentRegion: Region;
  regions: Region[];
  onSelectRegion: (region: Region) => void;
  onNavigate?: (view: any) => void;
}

export const HistoricalAnalysisView: React.FC<HistoricalAnalysisViewProps> = ({
  currentRegion,
  regions,
  onSelectRegion,
  onNavigate
}) => {
  const [selectedMetric, setSelectedMetric] = useState<'temperature' | 'wbgt' | 'heatIndex' | 'anomaly'>('temperature');
  const [selectedYearRange, setSelectedYearRange] = useState<'1991-2020' | '2010-2025' | 'LAST_5_YEARS'>('1991-2020');

  // Sample historical climate baseline curve vs recent years
  const historicalMonthlyData = [
    { month: 'Jan', baselineNormal: 21.2, recorded2024: 22.4, recorded2025: 22.8, extremeMax: 29.5 },
    { month: 'Feb', baselineNormal: 24.8, recorded2024: 27.5, recorded2025: 28.1, extremeMax: 34.0 },
    { month: 'Mar', baselineNormal: 31.0, recorded2024: 35.2, recorded2025: 35.8, extremeMax: 40.6 },
    { month: 'Apr', baselineNormal: 37.4, recorded2024: 42.1, recorded2025: 42.6, extremeMax: 46.2 },
    { month: 'May', baselineNormal: 40.5, recorded2024: 46.8, recorded2025: 47.4, extremeMax: 49.9 },
    { month: 'Jun', baselineNormal: 39.2, recorded2024: 45.1, recorded2025: 45.7, extremeMax: 48.5 },
    { month: 'Jul', baselineNormal: 34.8, recorded2024: 37.4, recorded2025: 37.9, extremeMax: 42.0 },
    { month: 'Aug', baselineNormal: 33.2, recorded2024: 35.0, recorded2025: 35.4, extremeMax: 39.0 },
    { month: 'Sep', baselineNormal: 33.5, recorded2024: 35.8, recorded2025: 36.1, extremeMax: 40.2 },
    { month: 'Oct', baselineNormal: 31.8, recorded2024: 34.2, recorded2025: 34.6, extremeMax: 38.0 },
    { month: 'Nov', baselineNormal: 27.0, recorded2024: 28.9, recorded2025: 29.3, extremeMax: 34.5 },
    { month: 'Dec', baselineNormal: 22.5, recorded2024: 23.8, recorded2025: 24.1, extremeMax: 30.0 }
  ];

  // Major Historical Heatwave Events Database
  const historicalEvents: HistoricalHeatwaveEvent[] = [
    {
      id: 'event-2024-north',
      locationName: 'Delhi NCR & North-West India',
      state: 'Delhi / Rajasthan / UP',
      startDate: '14 May 2024',
      endDate: '22 June 2024',
      durationDays: 40,
      peakMaxTempC: 49.9,
      peakWbgtC: 34.2,
      peakUtciC: 48.5,
      peakHeatIndexC: 54.2,
      anomalyDeltaC: 8.2,
      severity: 'EXTREME',
      officialClassification: 'Severe Heatwave Spell (IMD Red Alert)',
      reportedImpacts: 'Peak electricity demand reached record 8,656 MW; over 40,000 heatstroke hospitalizations across North India.'
    },
    {
      id: 'event-2015-south',
      locationName: 'Andhra Pradesh & Telangana Basin',
      state: 'Andhra Pradesh / Telangana',
      startDate: '21 May 2015',
      endDate: '10 June 2015',
      durationDays: 21,
      peakMaxTempC: 47.6,
      peakWbgtC: 33.8,
      peakUtciC: 47.0,
      peakHeatIndexC: 52.8,
      anomalyDeltaC: 7.4,
      severity: 'EXTREME',
      officialClassification: 'Catastrophic Extreme Heatwave',
      reportedImpacts: 'Over 2,500 direct fatalities; prompted the nationwide formulation of NDMA Heat Action Plans (HAP).'
    },
    {
      id: 'event-2010-ahmedabad',
      locationName: 'Ahmedabad Urban Core',
      state: 'Gujarat',
      startDate: '20 May 2010',
      endDate: '28 May 2010',
      durationDays: 9,
      peakMaxTempC: 46.8,
      peakWbgtC: 32.5,
      peakUtciC: 45.8,
      peakHeatIndexC: 50.4,
      anomalyDeltaC: 6.8,
      severity: 'SEVERE',
      officialClassification: 'Severe Heatwave',
      reportedImpacts: 'Excess mortality estimated at 1,344 deaths; catalyzed South Asia’s first municipal Heat Action Plan in 2013.'
    },
    {
      id: 'event-1998-odisha',
      locationName: 'Coastal & Interior Odisha',
      state: 'Odisha',
      startDate: '22 May 1998',
      endDate: '15 June 1998',
      durationDays: 25,
      peakMaxTempC: 46.5,
      peakWbgtC: 34.0,
      peakUtciC: 47.2,
      peakHeatIndexC: 53.0,
      anomalyDeltaC: 7.1,
      severity: 'EXTREME',
      officialClassification: 'Severe Humid Heatwave',
      reportedImpacts: 'Over 2,042 heat-related fatalities; combination of high humidity and 45°C+ air temperatures.'
    }
  ];

  return (
    <div className="flex-1 bg-[#0c0f17] p-6 md:p-8 overflow-y-auto selection:bg-[#2563eb] selection:text-white space-y-6" id="historical-view-panel">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#1e2638]">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            {onNavigate && (
              <button
                onClick={() => onNavigate('dashboard')}
                className="flex items-center gap-1.5 text-[11.5px] font-medium text-[#60a5fa] hover:text-[#93c5fd] transition-colors py-1 px-2.5 rounded-lg bg-[#141a29] hover:bg-[#1c2438] border border-[#263147] group"
                id="historical-back-btn"
              >
                <span className="material-symbols-outlined text-[15px] group-hover:-translate-x-0.5 transition-transform">
                  arrow_back
                </span>
                <span>Command Overview</span>
              </button>
            )}
            <span className="text-[#334155]">•</span>
            <span className="material-symbols-outlined text-blue-400 text-[18px]">history_edu</span>
            <span className="text-[11px] text-blue-400 uppercase tracking-wider font-semibold">
              CLIMATOLOGICAL REFERENCE &amp; REANALYSIS
            </span>
          </div>
          <h1 className="text-[22px] md:text-[28px] text-white font-bold tracking-tight">
            Historical Heatwave Analysis &amp; 30-Year Baselines
          </h1>
          <p className="text-[13px] text-[#94a3b8] mt-1">
            Compare current anomalies against the 1991–2020 IMD/WMO standard climate normals and past extreme heat events.
          </p>
        </div>

        {/* Region Quick Selector */}
        <select
          value={currentRegion.id}
          onChange={(e) => {
            const reg = regions.find(r => r.id === e.target.value);
            if (reg) onSelectRegion(reg);
          }}
          className="bg-[#182030] border border-[#263147] text-white px-3.5 py-2 rounded-lg text-[13px] outline-none focus:border-blue-500 shadow-sm self-start md:self-auto"
        >
          {regions.map(r => (
            <option key={r.id} value={r.id}>{r.name} ({r.state})</option>
          ))}
        </select>
      </div>

      {/* Baseline Comparison Controls and Chart */}
      <div className="bg-[#121622] border border-[#212a3d] rounded-xl p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-[17px] text-white font-bold">
              {currentRegion.name} • Annual Thermal Normals vs Recent Observations
            </h3>
            <p className="text-[12.5px] text-[#94a3b8] mt-0.5">
              Comparing 30-year climatological normal (1991–2020) against 2024 and 2025 measured peak temperatures
            </p>
          </div>

          <div className="flex bg-[#182030] p-1 rounded-lg border border-[#263147] text-[12px]">
            <button
              onClick={() => setSelectedMetric('temperature')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${selectedMetric === 'temperature' ? 'bg-blue-600 text-white shadow-sm' : 'text-[#94a3b8] hover:text-white'}`}
            >
              Air Temp (°C)
            </button>
            <button
              onClick={() => setSelectedMetric('wbgt')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${selectedMetric === 'wbgt' ? 'bg-blue-600 text-white shadow-sm' : 'text-[#94a3b8] hover:text-white'}`}
            >
              WBGT (°C)
            </button>
            <button
              onClick={() => setSelectedMetric('heatIndex')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${selectedMetric === 'heatIndex' ? 'bg-blue-600 text-white shadow-sm' : 'text-[#94a3b8] hover:text-white'}`}
            >
              Heat Index
            </button>
          </div>
        </div>

        {/* Chart */}
        <div className="h-80 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={historicalMonthlyData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#252a36" />
              <XAxis dataKey="month" stroke="#6b7280" tick={{ fill: '#9ca3af', fontSize: 11 }} />
              <YAxis domain={[15, 52]} stroke="#6b7280" tick={{ fill: '#9ca3af', fontSize: 11 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                labelStyle={{ color: '#fff', fontWeight: 'bold' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Area type="monotone" dataKey="extremeMax" fill="#ef4444" fillOpacity={0.12} stroke="#ef4444" strokeDasharray="3 3" name="All-Time Record Max (°C)" />
              <Line type="monotone" dataKey="baselineNormal" stroke="#4ade80" strokeWidth={2.5} name="30-Year Normal (1991-2020)" dot={{ r: 3 }} />
              <Line type="monotone" dataKey="recorded2024" stroke="#fb923c" strokeWidth={2} name="2024 Recorded Peak" dot={{ r: 3 }} />
              <Line type="monotone" dataKey="recorded2025" stroke="#f87171" strokeWidth={2.5} name="2025 Recorded Peak" dot={{ r: 4 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Historical Heatwave Event Database */}
      <div className="bg-[#121622] border border-[#212a3d] rounded-xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="text-[17px] text-white font-bold">
              National Historical Heatwave Events Archive
            </h3>
            <p className="text-[12.5px] text-[#94a3b8] mt-0.5">
              Verified historical extreme heat emergencies documented across Indian meteorological records
            </p>
          </div>
          <span className="text-[11.5px] text-[#64748b]">Source: IMD / NDMA / WMO Climate Archive</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[12.5px] divide-y divide-[#212a3d]">
            <thead className="text-[11px] text-[#94a3b8] uppercase font-semibold bg-[#182030]">
              <tr>
                <th className="py-3 px-4">Event &amp; Region</th>
                <th className="py-3 px-3">Date &amp; Duration</th>
                <th className="py-3 px-3">Peak Temp / WBGT</th>
                <th className="py-3 px-3">Anomaly</th>
                <th className="py-3 px-3">Severity</th>
                <th className="py-3 px-4">Documented Impacts</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e2638] text-[#cbd5e1]">
              {historicalEvents.map(evt => (
                <tr key={evt.id} className="hover:bg-[#182030]/60 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-white">{evt.locationName}</div>
                    <div className="text-[11.5px] text-[#94a3b8]">{evt.state}</div>
                  </td>
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <div className="text-white">{evt.startDate} – {evt.endDate}</div>
                    <div className="text-[11.5px] text-[#94a3b8]">{evt.durationDays} Days Duration</div>
                  </td>
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <div className="font-semibold text-red-400">{evt.peakMaxTempC}°C Max</div>
                    <div className="text-[11.5px] text-amber-400">WBGT: {evt.peakWbgtC}°C</div>
                  </td>
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <span className="text-yellow-400 font-semibold">+{evt.anomalyDeltaC}°C</span>
                  </td>
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <span className="px-2.5 py-0.5 rounded text-[10.5px] font-semibold bg-red-500/15 text-red-400 border border-red-500/30">
                      {evt.severity}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-[12px] text-[#94a3b8] max-w-xs">
                    {evt.reportedImpacts}
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

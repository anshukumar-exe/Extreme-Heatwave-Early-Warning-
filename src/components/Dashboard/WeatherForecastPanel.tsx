import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { Region, DayForecast, WardData } from '../../types';
import { fetch5DayHeatwaveForecast, generateSyntheticForecast } from '../../services/weatherForecastService';
import {
  ResponsiveContainer,
  ComposedChart,
  AreaChart,
  Area,
  Line,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  Legend
} from 'recharts';

interface WeatherForecastPanelProps {
  currentRegion: Region;
  wards?: WardData[];
  onOpenDeployModal?: () => void;
  onNavigateToMap?: () => void;
  onNavigate?: (view: any) => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05
    }
  }
};

const itemVariants: any = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.32,
      ease: [0.16, 1, 0.3, 1]
    }
  }
};

export const WeatherForecastPanel: React.FC<WeatherForecastPanelProps> = ({
  currentRegion,
  wards = [],
  onOpenDeployModal,
  onNavigateToMap,
  onNavigate
}) => {
  // Initialize with synthetic data immediately so activeDay is always defined on initial render
  const [forecastDays, setForecastDays] = useState<DayForecast[]>(() => generateSyntheticForecast(currentRegion));
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [dataSource, setDataSource] = useState<string>('Mesonet Model');
  const [isLiveOnline, setIsLiveOnline] = useState<boolean>(false);
  const [chartMode, setChartMode] = useState<'peaks' | 'hourly' | 'wbgt'>('peaks');
  const [lastUpdated, setLastUpdated] = useState<string>(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

  // Fetch forecast data when region changes or on manual refresh
  const loadForecast = async () => {
    setIsLoading(true);
    try {
      const result = await fetch5DayHeatwaveForecast(currentRegion);
      if (result.forecast && result.forecast.length > 0) {
        setForecastDays(result.forecast);
      }
      setDataSource(result.source);
      setIsLiveOnline(result.isLive);
      setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    } catch (err) {
      if (import.meta.env.DEV) {
        console.info('Forecast fallback engaged:', err);
      }
      // Ensure synthetic fallback is preserved
      setForecastDays(prev => prev.length > 0 ? prev : generateSyntheticForecast(currentRegion));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // When region changes, update baseline synthetic forecast immediately then fetch
    const initial = generateSyntheticForecast(currentRegion);
    setForecastDays(initial);
    loadForecast();
  }, [currentRegion.id, currentRegion.lat, currentRegion.lng]);

  const activeDay: DayForecast = useMemo(() => {
    if (forecastDays && forecastDays.length > 0) {
      return forecastDays[selectedDayIndex] || forecastDays[0];
    }
    return generateSyntheticForecast(currentRegion)[0];
  }, [forecastDays, selectedDayIndex, currentRegion]);

  // Derived 5-day stats
  const highest5DayPeak = forecastDays.length
    ? Math.max(...forecastDays.map(d => d.maxTemp))
    : currentRegion.averageTemp;
  const criticalDay = (forecastDays.length ? forecastDays.find(d => d.maxTemp === highest5DayPeak) : null) || activeDay;
  const avgNightMin = forecastDays.length
    ? (forecastDays.reduce((acc, d) => acc + d.minTemp, 0) / forecastDays.length)
    : 28.5;
  const redAlertDaysCount = forecastDays.filter(d => d.hazardLevel === 'RED ALERT').length;

  // Format 5-day chart data
  const fiveDayChartData = forecastDays.map((d) => ({
    name: `${d.dayName} (${d.dateStr})`,
    shortName: d.dayName,
    maxTemp: d.maxTemp,
    minTemp: d.minTemp,
    apparentMaxTemp: d.apparentMaxTemp,
    wbgt: d.wbgt,
    humidity: d.humidity,
    uv: d.uvIndex,
    hazardLevel: d.hazardLevel,
    anomaly: d.anomalyDelta
  }));

  // Format hourly chart data for active selected day
  const hourlyChartData = activeDay?.hourly.map((h) => ({
    time: h.time,
    hour: h.hour,
    temp: h.temp,
    apparentTemp: h.apparentTemp,
    wbgt: h.wbgt,
    humidity: h.humidity,
    uv: h.uv,
    isPeakHazard: h.isPeakHazard
  })) || [];

  const handleBack = () => {
    if (onNavigate) {
      onNavigate('dashboard');
    } else if (onNavigateToMap) {
      onNavigateToMap();
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex-1 bg-[#0c0f17] p-6 md:p-8 overflow-y-auto selection:bg-[#2563eb] selection:text-white"
      id="weather-forecast-panel"
    >
      {/* Top Header & Region Identity */}
      <motion.div variants={itemVariants} className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 mb-6 border-b border-[#1e2638]">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            {(onNavigate || onNavigateToMap) && (
              <button
                onClick={handleBack}
                className="flex items-center gap-1.5 text-[11.5px] font-medium text-[#60a5fa] hover:text-[#93c5fd] transition-colors py-1 px-2.5 rounded-lg bg-[#141a29] hover:bg-[#1c2438] border border-[#263147] group"
                id="forecast-back-btn"
              >
                <span className="material-symbols-outlined text-[15px] group-hover:-translate-x-0.5 transition-transform">
                  arrow_back
                </span>
                <span>Command Overview</span>
              </button>
            )}
            <span className="text-[#334155]">•</span>
            <span className="text-[11px] text-[#94a3b8] uppercase tracking-wider font-semibold">
              IMD SYNOPTIC METEOROLOGICAL TELEMETRY
            </span>
            <span className="text-[#334155]">•</span>
            <span className="text-[11px] text-blue-400 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">
                {isLiveOnline ? 'cloud_done' : 'offline_bolt'}
              </span>
              {isLiveOnline ? 'Live High-Res Sync' : 'Mesonet Model'}
            </span>
          </div>

          <h1 className="text-[22px] md:text-[28px] text-white font-bold tracking-tight flex items-center gap-3">
            <span>5-Day Heatwave Forecast: {currentRegion.name}</span>
            <span className="text-[12px] font-normal px-2.5 py-0.5 rounded bg-[#141a29] border border-[#212a3d] text-[#94a3b8]">
              {currentRegion.state} • {currentRegion.zone} Zone
            </span>
          </h1>

          <p className="text-[13px] text-[#94a3b8] mt-1">
            Predictive diurnal temperature peaks, wet-bulb stress indexing, and NDMA heat action threshold modeling.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 self-start lg:self-center">
          <button
            onClick={loadForecast}
            disabled={isLoading}
            className="border border-[#212a3d] bg-[#121622] hover:bg-[#182030] text-[#cbd5e1] hover:text-white px-3.5 py-2 rounded-lg text-[12px] font-medium flex items-center gap-2 transition-all shadow-sm"
            title="Refresh 5-Day Forecast"
            id="refresh-forecast-btn"
          >
            <span className={`material-symbols-outlined text-[17px] ${isLoading ? 'animate-spin text-blue-400' : ''}`}>
              refresh
            </span>
            <span>{isLoading ? 'Updating...' : 'Refresh'}</span>
          </button>

          {onOpenDeployModal && (
            <button
              onClick={onOpenDeployModal}
              className="bg-rose-600 hover:bg-rose-700 text-white text-[12px] font-semibold px-4 py-2 rounded-lg transition-all flex items-center gap-2 shadow-sm"
              id="forecast-deploy-btn"
            >
              <span className="material-symbols-outlined text-[17px]">emergency</span>
              <span>Deploy Action</span>
            </button>
          )}
        </div>
      </motion.div>

      {/* 4 Summary Stat Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Highest 5-Day Peak */}
        <div className="bg-[#121622] border border-[#212a3d] rounded-xl p-5 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start mb-1">
            <span className="text-[11px] text-[#94a3b8] uppercase tracking-wider font-semibold">
              5-DAY PEAK CREST
            </span>
            <span className="material-symbols-outlined text-rose-400 text-[20px]">
              local_fire_department
            </span>
          </div>
          <div className="flex items-baseline gap-1 text-rose-400">
            <span className="text-[32px] md:text-[36px] font-bold">
              {highest5DayPeak ? highest5DayPeak.toFixed(1) : '--'}
            </span>
            <span className="text-[14px]">°C</span>
          </div>
          <div className="text-[12px] text-rose-300 mt-2 flex items-center gap-1 font-medium">
            <span>Critical peak expected {criticalDay?.dayName}</span>
          </div>
        </div>

        {/* Severe Alert Days */}
        <div className="bg-[#121622] border border-[#212a3d] rounded-xl p-5 shadow-sm">
          <div className="flex justify-between items-start mb-1">
            <span className="text-[11px] text-[#94a3b8] uppercase tracking-wider font-semibold">
              CRITICAL HEATWAVE DAYS
            </span>
            <span className="material-symbols-outlined text-amber-400 text-[20px]">
              warning
            </span>
          </div>
          <div className="flex items-baseline gap-1 text-amber-400">
            <span className="text-[32px] md:text-[36px] font-bold">
              {redAlertDaysCount}
            </span>
            <span className="text-[14px] text-[#94a3b8] font-normal">of 5 Days</span>
          </div>
          <div className="text-[12px] text-[#94a3b8] mt-2">
            Peak Danger: 12:00 – 16:30 IST
          </div>
        </div>

        {/* Avg Night Min / Cooling Deficit */}
        <div className="bg-[#121622] border border-[#212a3d] rounded-xl p-5 shadow-sm">
          <div className="flex justify-between items-start mb-1">
            <span className="text-[11px] text-[#94a3b8] uppercase tracking-wider font-semibold">
              NIGHT MINIMUM AVG
            </span>
            <span className="material-symbols-outlined text-blue-400 text-[20px]">
              bedtime
            </span>
          </div>
          <div className="flex items-baseline gap-1 text-blue-400">
            <span className="text-[32px] md:text-[36px] font-bold">
              {avgNightMin ? avgNightMin.toFixed(1) : '--'}
            </span>
            <span className="text-[14px]">°C</span>
          </div>
          <div className="text-[12px] text-[#94a3b8] mt-2">
            {Number(avgNightMin) >= 28.0 ? 'High night cooling deficit' : 'Moderate night cooling'}
          </div>
        </div>

        {/* Active Grid Wards Impacted */}
        <div className="bg-[#121622] border border-[#212a3d] rounded-xl p-5 shadow-sm">
          <div className="flex justify-between items-start mb-1">
            <span className="text-[11px] text-[#94a3b8] uppercase tracking-wider font-semibold">
              REGIONAL GRID NODES
            </span>
            <span className="material-symbols-outlined text-teal-400 text-[20px]">
              sensors
            </span>
          </div>
          <div className="flex items-baseline gap-1 text-teal-400">
            <span className="text-[32px] md:text-[36px] font-bold">
              {currentRegion.sensorCount || 148}
            </span>
            <span className="text-[14px] text-[#94a3b8] font-normal">Sensors</span>
          </div>
          <div className="text-[12px] text-[#94a3b8] mt-2">
            {wards.length || 6} Urban Wards Telemetry Synced
          </div>
        </div>
      </motion.div>

      {/* 5-Day Card Selectors (Horizontal Grid) */}
      <motion.div variants={itemVariants} className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <span className="text-[12px] text-white uppercase font-semibold tracking-wider flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-400 text-[18px]">calendar_month</span>
            <span>Select Day For Detailed Meteorological Drilldown</span>
          </span>
          <span className="text-[11.5px] text-[#94a3b8]">
            Updated: {lastUpdated || 'Live Sync'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          {forecastDays.map((day, idx) => {
            const isSelected = selectedDayIndex === idx;
            const isRed = day.hazardLevel === 'RED ALERT';
            const isOrange = day.hazardLevel === 'ORANGE ALERT';

            return (
              <button
                key={idx}
                onClick={() => setSelectedDayIndex(idx)}
                className={`p-4 rounded-xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                  isSelected
                    ? 'bg-[#182030] border-blue-500 shadow-md ring-1 ring-blue-500'
                    : 'bg-[#121622] border-[#212a3d] hover:bg-[#161d2d] hover:border-[#2b3954]'
                }`}
                id={`forecast-day-card-${idx}`}
              >
                {/* Top Day info & Hazard Tag */}
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="text-[14px] font-bold text-white">
                      {day.dayName}
                    </div>
                    <div className="text-[11px] text-[#94a3b8]">
                      {day.dateStr}
                    </div>
                  </div>

                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-semibold uppercase tracking-wide ${
                      isRed
                        ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                        : isOrange
                        ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                        : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    }`}
                  >
                    {isRed ? 'RED' : isOrange ? 'ORANGE' : 'YELLOW'}
                  </span>
                </div>

                {/* Main Peak Temp */}
                <div className="flex items-baseline justify-between mb-3">
                  <div className="flex items-baseline gap-1">
                    <span
                      className={`text-[28px] font-bold ${
                        isRed ? 'text-rose-400' : isOrange ? 'text-amber-400' : 'text-emerald-400'
                      }`}
                    >
                      {day.maxTemp.toFixed(1)}°
                    </span>
                    <span className="text-[12px] text-[#94a3b8]">
                      / {day.minTemp.toFixed(0)}°C
                    </span>
                  </div>

                  <span className="material-symbols-outlined text-[24px] text-amber-400">
                    {day.icon}
                  </span>
                </div>

                {/* Submetrics */}
                <div className="pt-2 border-t border-[#212a3d] flex justify-between text-[11px] text-[#94a3b8]">
                  <span>Heat Index: <b className="text-white">{day.apparentMaxTemp}°C</b></span>
                  <span>WBGT: <b className="text-amber-300">{day.wbgt}°C</b></span>
                </div>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Main Charts & Deep Analytics Section */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Left 2-Columns: Primary Interactive Recharts Graph */}
        <div className="lg:col-span-2 bg-[#121622] border border-[#212a3d] rounded-xl p-6 shadow-sm flex flex-col justify-between">
          {/* Chart Header with Mode Toggle */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                <h3 className="text-[17px] text-white font-bold">
                  {chartMode === 'peaks'
                    ? '5-Day Predicted Peak Temperatures & Anomaly Crest'
                    : chartMode === 'hourly'
                    ? `24-Hour Diurnal Temperature Profile (${activeDay?.dayName})`
                    : 'Heat Stress Index & Wet-Bulb Globe Temperature (WBGT)'}
                </h3>
              </div>
              <p className="text-[12.5px] text-[#94a3b8] mt-0.5">
                {chartMode === 'peaks'
                  ? 'Red line marks IMD Severe Heatwave danger threshold (44°C) with diurnal peak windows'
                  : chartMode === 'hourly'
                  ? `Hourly diurnal progression highlighting critical sun hazard window (11:00 AM - 16:30 PM)`
                  : 'Physiological thermal strain: WBGT exceeds safe outdoor metabolic threshold (32°C)'}
              </p>
            </div>

            {/* View Mode Pills */}
            <div className="flex bg-[#182030] p-1 rounded-lg border border-[#263147] text-[12px] shrink-0 self-start sm:self-center">
              <button
                onClick={() => setChartMode('peaks')}
                className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                  chartMode === 'peaks'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-[#94a3b8] hover:text-white'
                }`}
                id="chart-mode-peaks-btn"
              >
                5-Day Peaks
              </button>
              <button
                onClick={() => setChartMode('hourly')}
                className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                  chartMode === 'hourly'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-[#94a3b8] hover:text-white'
                }`}
                id="chart-mode-hourly-btn"
              >
                24H Diurnal
              </button>
              <button
                onClick={() => setChartMode('wbgt')}
                className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                  chartMode === 'wbgt'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-[#94a3b8] hover:text-white'
                }`}
                id="chart-mode-wbgt-btn"
              >
                WBGT Stress
              </button>
            </div>
          </div>

          {/* Recharts Area / Composed Chart Canvas */}
          <div className="h-80 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              {chartMode === 'peaks' ? (
                <ComposedChart
                  data={fiveDayChartData}
                  margin={{ top: 15, right: 25, left: 0, bottom: 5 }}
                >
                  <defs>
                    <linearGradient id="peakGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.45} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="minGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4fdbc8" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#4fdbc8" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid strokeDasharray="3 3" stroke="#263331" />
                  <XAxis
                    dataKey="shortName"
                    stroke="#859490"
                    tick={{ fill: '#bbcac6', fontSize: 11, fontFamily: 'JetBrains Mono' }}
                  />
                  <YAxis
                    domain={[24, 48]}
                    stroke="#859490"
                    tick={{ fill: '#bbcac6', fontSize: 11, fontFamily: 'JetBrains Mono' }}
                    unit="°C"
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-[#1c1b1b] border border-[#3c4947] p-3 rounded-lg shadow-2xl font-data-point text-[12px] min-w-[200px]">
                            <div className="font-bold text-[#e5e2e1] border-b border-[#3c4947] pb-1.5 mb-2 flex justify-between items-center">
                              <span>{data.name}</span>
                              <span className="text-[#ef4444] font-label-caps text-[10px]">{data.hazardLevel}</span>
                            </div>
                            <div className="flex justify-between text-[#ffb4ab] py-0.5">
                              <span>Predicted Peak:</span>
                              <span className="font-bold">{data.maxTemp}°C</span>
                            </div>
                            <div className="flex justify-between text-[#ffb59e] py-0.5">
                              <span>Apparent Heat Index:</span>
                              <span className="font-bold">{data.apparentMaxTemp}°C</span>
                            </div>
                            <div className="flex justify-between text-[#4fdbc8] py-0.5">
                              <span>Night Minimum:</span>
                              <span className="font-bold">{data.minTemp}°C</span>
                            </div>
                            <div className="flex justify-between text-[#bbcac6] py-0.5">
                              <span>Wet-Bulb (WBGT):</span>
                              <span className="font-bold">{data.wbgt}°C</span>
                            </div>
                            <div className="flex justify-between text-[#859490] pt-1 mt-1 border-t border-[#3c4947]/40 text-[10.5px]">
                              <span>Climatological Departure:</span>
                              <span className="text-[#ef4444] font-bold">+{data.anomaly}°C</span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: '11px', fontFamily: 'JetBrains Mono', paddingTop: '10px' }}
                  />

                  {/* IMD Threshold Reference Lines */}
                  <ReferenceLine
                    y={44}
                    stroke="#ef4444"
                    strokeDasharray="4 4"
                    strokeWidth={1.5}
                    label={{
                      value: 'IMD SEVERE HEATWAVE (44°C)',
                      fill: '#ef4444',
                      fontSize: 10,
                      position: 'top',
                      fontFamily: 'JetBrains Mono'
                    }}
                  />
                  <ReferenceLine
                    y={40}
                    stroke="#f38764"
                    strokeDasharray="3 3"
                    strokeWidth={1.2}
                    label={{
                      value: 'HEATWAVE WARNING (40°C)',
                      fill: '#f38764',
                      fontSize: 10,
                      position: 'insideBottomRight',
                      fontFamily: 'JetBrains Mono'
                    }}
                  />

                  {/* Peak Max Temp Area */}
                  <Area
                    type="monotone"
                    dataKey="maxTemp"
                    name="Daily Max Peak (°C)"
                    stroke="#ef4444"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#peakGradient)"
                  />

                  {/* Apparent Heat Index Line */}
                  <Line
                    type="monotone"
                    dataKey="apparentMaxTemp"
                    name="Apparent Heat Index (°C)"
                    stroke="#ffb59e"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ r: 4, fill: '#ffb59e' }}
                  />

                  {/* Night Minimum Temp Line */}
                  <Line
                    type="monotone"
                    dataKey="minTemp"
                    name="Night Recovery Min (°C)"
                    stroke="#4fdbc8"
                    strokeWidth={2}
                    dot={{ r: 4, fill: '#4fdbc8' }}
                  />
                </ComposedChart>
              ) : chartMode === 'hourly' ? (
                <AreaChart
                  data={hourlyChartData}
                  margin={{ top: 15, right: 25, left: 0, bottom: 5 }}
                >
                  <defs>
                    <linearGradient id="hourlyTempGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.5} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#263331" />
                  <XAxis
                    dataKey="time"
                    stroke="#859490"
                    tick={{ fill: '#bbcac6', fontSize: 10.5, fontFamily: 'JetBrains Mono' }}
                    interval={3}
                  />
                  <YAxis
                    domain={[24, 48]}
                    stroke="#859490"
                    tick={{ fill: '#bbcac6', fontSize: 11, fontFamily: 'JetBrains Mono' }}
                    unit="°C"
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-[#1c1b1b] border border-[#3c4947] p-3 rounded-lg shadow-2xl font-data-point text-[12px] min-w-[190px]">
                            <div className="font-bold text-[#e5e2e1] border-b border-[#3c4947] pb-1 mb-2">
                              {activeDay.dayName} @ {data.time} IST
                            </div>
                            <div className="flex justify-between text-[#ffb4ab] py-0.5">
                              <span>Temperature:</span>
                              <span className="font-bold">{data.temp}°C</span>
                            </div>
                            <div className="flex justify-between text-[#ffb59e] py-0.5">
                              <span>Apparent Temp:</span>
                              <span className="font-bold">{data.apparentTemp}°C</span>
                            </div>
                            <div className="flex justify-between text-[#4fdbc8] py-0.5">
                              <span>Wet-Bulb (WBGT):</span>
                              <span className="font-bold">{data.wbgt}°C</span>
                            </div>
                            <div className="flex justify-between text-[#bbcac6] py-0.5">
                              <span>Relative Humidity:</span>
                              <span className="font-bold">{data.humidity}%</span>
                            </div>
                            {data.uv > 0 && (
                              <div className="flex justify-between text-[#eab308] py-0.5">
                                <span>UV Index:</span>
                                <span className="font-bold">{data.uv} (Extreme)</span>
                              </div>
                            )}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <ReferenceLine
                    y={40}
                    stroke="#ef4444"
                    strokeDasharray="4 4"
                    label={{
                      value: '40°C DANGER THRESHOLD',
                      fill: '#ef4444',
                      fontSize: 10,
                      fontFamily: 'JetBrains Mono'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="temp"
                    name="Dry Bulb Temp (°C)"
                    stroke="#ef4444"
                    strokeWidth={2.8}
                    fillOpacity={1}
                    fill="url(#hourlyTempGradient)"
                  />
                  <Line
                    type="monotone"
                    dataKey="apparentTemp"
                    name="Apparent Heat Index (°C)"
                    stroke="#ffb59e"
                    strokeWidth={1.8}
                    strokeDasharray="3 3"
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="wbgt"
                    name="Wet Bulb Globe Temp (°C)"
                    stroke="#4fdbc8"
                    strokeWidth={1.8}
                    dot={false}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'JetBrains Mono', paddingTop: '10px' }} />
                </AreaChart>
              ) : (
                <ComposedChart
                  data={fiveDayChartData}
                  margin={{ top: 15, right: 25, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#263331" />
                  <XAxis
                    dataKey="shortName"
                    stroke="#859490"
                    tick={{ fill: '#bbcac6', fontSize: 11, fontFamily: 'JetBrains Mono' }}
                  />
                  <YAxis
                    domain={[20, 50]}
                    stroke="#859490"
                    tick={{ fill: '#bbcac6', fontSize: 11, fontFamily: 'JetBrains Mono' }}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload;
                        return (
                          <div className="bg-[#1c1b1b] border border-[#3c4947] p-3 rounded-lg font-data-point text-[12px]">
                            <div className="font-bold text-[#e5e2e1] mb-1">{d.name}</div>
                            <div className="text-[#ffb4ab]">Peak Temp: {d.maxTemp}°C</div>
                            <div className="text-[#f38764]">WBGT Index: {d.wbgt}°C</div>
                            <div className="text-[#4fdbc8]">Humidity: {d.humidity}%</div>
                            <div className="text-[#eab308]">UV Peak: {d.uv}</div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'JetBrains Mono', paddingTop: '10px' }} />
                  <ReferenceLine
                    y={32}
                    stroke="#ef4444"
                    strokeDasharray="4 4"
                    label={{ value: 'WBGT Work Stoppage (32°C)', fill: '#ef4444', fontSize: 10 }}
                  />
                  <Bar dataKey="wbgt" name="WBGT Thermal Stress (°C)" fill="#f38764" radius={[4, 4, 0, 0]} />
                  <Line dataKey="maxTemp" name="Peak Dry Temp (°C)" stroke="#ef4444" strokeWidth={2.5} />
                </ComposedChart>
              )}
            </ResponsiveContainer>
          </div>

          {/* Legend and Model Attribution */}
          <div className="mt-4 pt-3 border-t border-[#212a3d] flex flex-col sm:flex-row justify-between items-start sm:items-center text-[11px] text-[#94a3b8] gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-400"></span>
              <span>Model Source: {dataSource || 'IMD High-Resolution WRF Grid & Open-Meteo'}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-rose-400">■ Red Threshold: ≥44°C</span>
              <span className="text-amber-400">■ Orange: ≥40°C</span>
              <span className="text-yellow-400">■ Yellow: ≥37°C</span>
            </div>
          </div>
        </div>

        {/* Right Column: Active Day Heat Action Plan & Advisory Triggers */}
        <div className="bg-[#121622] border border-[#212a3d] rounded-xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-[11px] text-amber-400 font-semibold uppercase tracking-wider block mb-1">
                  NDMA PROTOCOL ENFORCEMENT
                </span>
                <h3 className="text-[17px] text-white font-bold">
                  {activeDay.dayName} Action Plan
                </h3>
              </div>

              <span
                className={`text-[10.5px] px-2.5 py-1 rounded font-semibold uppercase tracking-wider ${
                  activeDay.hazardLevel === 'RED ALERT'
                    ? 'bg-rose-500/15 text-rose-400 border border-rose-500/40'
                    : activeDay.hazardLevel === 'ORANGE ALERT'
                    ? 'bg-amber-500/15 text-amber-400 border border-amber-500/40'
                    : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/40'
                }`}
              >
                {activeDay.hazardLevel}
              </span>
            </div>

            {/* Active Day Key Numbers */}
            <div className="p-4 bg-[#182030] rounded-xl border border-[#263147] mb-5">
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="border-r border-[#263147] pr-2">
                  <span className="text-[11px] text-[#94a3b8] block mb-0.5">PEAK TEMPERATURE</span>
                  <span className="text-[26px] font-bold text-rose-400">
                    {activeDay.maxTemp.toFixed(1)}°C
                  </span>
                  <span className="text-[10.5px] text-rose-300 block">
                    +{activeDay.anomalyDelta}°C vs Normal
                  </span>
                </div>

                <div className="pl-2">
                  <span className="text-[11px] text-[#94a3b8] block mb-0.5">WET BULB (WBGT)</span>
                  <span className="text-[26px] font-bold text-amber-400">
                    {activeDay.wbgt.toFixed(1)}°C
                  </span>
                  <span className="text-[10.5px] text-amber-300 block">
                    High Metabolic Strain
                  </span>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-[#263147] grid grid-cols-3 gap-1 text-[11px] text-[#94a3b8] text-center">
                <div>
                  <span className="text-[10px] text-slate-400 block">HUMIDITY</span>
                  <span className="font-bold text-white">{activeDay.humidity}%</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">UV PEAK</span>
                  <span className="font-bold text-amber-300">{activeDay.uvIndex} (Extreme)</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">WIND</span>
                  <span className="font-bold text-blue-300">{activeDay.windSpeed} km/h</span>
                </div>
              </div>
            </div>

            {/* Mandatory NDMA Directives List */}
            <div className="flex flex-col gap-2.5 mb-6">
              <span className="text-[11px] text-[#94a3b8] uppercase tracking-wider font-semibold">
                MANDATORY MUNICIPAL PROTOCOLS
              </span>

              {activeDay.advisories.map((adv, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-[#182030]/80 rounded-lg border border-[#263147] flex items-start gap-2.5"
                >
                  <span className="material-symbols-outlined text-amber-400 text-[18px] shrink-0 mt-0.5">
                    shield
                  </span>
                  <p className="text-[12px] text-[#cbd5e1] leading-snug">
                    {adv}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Nav / Action Buttons */}
          <div className="flex flex-col gap-2 pt-4 border-t border-[#212a3d]">
            {(onNavigate || onNavigateToMap) && (
              <button
                onClick={handleBack}
                className="w-full bg-[#182030] hover:bg-[#1f2a40] border border-[#263147] text-[#cbd5e1] hover:text-white text-[12px] py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all font-medium"
                id="forecast-view-wards-btn"
              >
                <span className="material-symbols-outlined text-[17px]">map</span>
                <span>Return to Grid Map Overview</span>
              </button>
            )}

            {onOpenDeployModal && (
              <button
                onClick={onOpenDeployModal}
                className="w-full bg-rose-600 hover:bg-rose-700 text-white text-[12px] font-semibold py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 shadow-sm"
                id="forecast-dispatch-crew-btn"
              >
                <span className="material-symbols-outlined text-[17px]">broadcast_on_home</span>
                <span>Dispatch Heatwave Broadcast &amp; Tankers</span>
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

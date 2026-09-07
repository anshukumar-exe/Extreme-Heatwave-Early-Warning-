import React from 'react';
import { DataSourceItem } from '../../types';

interface DataSourcesViewProps {
  onNavigate?: (view: any) => void;
}

export const DataSourcesView: React.FC<DataSourcesViewProps> = ({ onNavigate }) => {
  const dataSources: DataSourceItem[] = [
    {
      id: 'ds-01',
      name: 'IMD Automatic Weather Station (AWS) Mesonet',
      agency: 'India Meteorological Department (MoES)',
      dataset: 'Real-Time Surface Hourly Telemetry',
      variables: ['Dry-Bulb Temp (°C)', 'Relative Humidity (%)', 'Surface Wind Speed & Direction', 'Precipitation (mm)'],
      coverage: 'Pan-India 700+ Synoptic & AWS Stations',
      updateCadence: 'Hourly Real-Time',
      latencySeconds: 120,
      status: 'ONLINE',
      lastIngested: '3 minutes ago',
      dataQualityScore: 99.4,
      apiEndpoint: 'https://mausam.imd.gov.in/api/v1/synoptic/live'
    },
    {
      id: 'ds-02',
      name: 'Copernicus ERA5-Land Reanalysis',
      agency: 'European Centre for Medium-Range Weather Forecasts (ECMWF)',
      dataset: 'High-Resolution Land Surface Global Reanalysis',
      variables: ['2m Dewpoint Temp', 'Surface Net Solar Radiation', 'Boundary Layer Height', 'Skin Temperature'],
      coverage: 'Global 9km Gridded Resolution',
      updateCadence: 'Hourly / 6-hourly Cycles',
      latencySeconds: 360,
      status: 'ONLINE',
      lastIngested: '12 minutes ago',
      dataQualityScore: 99.8,
      apiEndpoint: 'https://cds.climate.copernicus.eu/api/v2/resources'
    },
    {
      id: 'ds-03',
      name: 'NASA POWER (Prediction of Worldwide Energy Resources)',
      agency: 'NASA Langley Research Center',
      dataset: 'Solar Irradiance & Meteorology Global Assimilation',
      variables: ['All-Sky Direct Normal Irradiance (DNI)', 'Diffuse Solar Flux', 'Top-of-Atmosphere Insolation'],
      coverage: 'Global 0.5° x 0.5° Spatial Grid',
      updateCadence: 'Daily / Hourly Real-Time Stream',
      latencySeconds: 420,
      status: 'ONLINE',
      lastIngested: '18 minutes ago',
      dataQualityScore: 98.9,
      apiEndpoint: 'https://power.larc.nasa.gov/api/temporal/hourly/point'
    },
    {
      id: 'ds-04',
      name: 'Sentinel-2 & Landsat 8/9 Thermal Infrared Sensors (TIRS)',
      agency: 'ESA Copernicus & NASA / USGS',
      dataset: 'Radiometrically Calibrated Land Surface Temperature & NDVI',
      variables: ['LST (100m Resampled)', 'NDVI Canopy Fractional Cover', 'Impervious Surface Ratio'],
      coverage: 'All Major Indian Municipal Urban Regions',
      updateCadence: '5-Day Orbital Revisit',
      latencySeconds: 1800,
      status: 'ONLINE',
      lastIngested: '45 minutes ago',
      dataQualityScore: 97.6,
      apiEndpoint: 'https://earthexplorer.usgs.gov/inventory/json/v/1.4.0'
    },
    {
      id: 'ds-05',
      name: 'Central Pollution Control Board (CPCB) & OpenAQ',
      agency: 'Ministry of Environment, Forest and Climate Change (MoEFCC)',
      dataset: 'Continuous Ambient Air Quality Monitoring (CAAQMS)',
      variables: ['PM2.5', 'PM10', 'O3 (Ozone)', 'NO2', 'CO', 'National AQI'],
      coverage: '450+ Continuous Monitoring Stations in India',
      updateCadence: 'Hourly Continuous',
      latencySeconds: 180,
      status: 'ONLINE',
      lastIngested: '6 minutes ago',
      dataQualityScore: 98.2,
      apiEndpoint: 'https://api.openaq.org/v2/locations?country=IN'
    },
    {
      id: 'ds-06',
      name: 'Census of India & Periodic Labour Force Survey (PLFS)',
      agency: 'Ministry of Statistics & Programme Implementation (MoSPI)',
      dataset: 'Demographic, Occupational & Slum Settlement Registry',
      variables: ['Gig Worker Aggregates', 'Informal Labor Density', 'Elderly (65+) Counts', 'Piped Water Access %'],
      coverage: 'Ward-Level Municipal Extents',
      updateCadence: 'Annual / Decennial Baseline Harmonized',
      latencySeconds: 0,
      status: 'ONLINE',
      lastIngested: 'Synchronized on Startup',
      dataQualityScore: 99.1,
      apiEndpoint: 'https://censusindia.gov.in/data/wards/demographics'
    }
  ];

  return (
    <div className="flex-1 bg-[#0c0f17] p-6 md:p-8 overflow-y-auto selection:bg-[#2563eb] selection:text-white space-y-6" id="datasources-view-panel">
      {/* Header */}
      <div className="pb-6 border-b border-[#1e2638]">
        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
          {onNavigate && (
            <button
              onClick={() => onNavigate('dashboard')}
              className="flex items-center gap-1.5 text-[11.5px] font-medium text-[#60a5fa] hover:text-[#93c5fd] transition-colors py-1 px-2.5 rounded-lg bg-[#141a29] hover:bg-[#1c2438] border border-[#263147] group"
              id="datasources-back-btn"
            >
              <span className="material-symbols-outlined text-[15px] group-hover:-translate-x-0.5 transition-transform">
                arrow_back
              </span>
              <span>Command Overview</span>
            </button>
          )}
          <span className="text-[#334155]">•</span>
          <span className="material-symbols-outlined text-blue-400 text-[18px]">database</span>
          <span className="text-[11px] text-blue-400 uppercase tracking-wider font-semibold">
            TELEMETRY &amp; SATELLITE INGESTION ARCHITECTURE
          </span>
        </div>
        <h1 className="text-[22px] md:text-[28px] text-white font-bold tracking-tight">
          Authoritative Data Feeds &amp; Synoptic Sources
        </h1>
        <p className="text-[13px] text-[#94a3b8] mt-1">
          Real-time integration status of NASA, Copernicus ECMWF, IMD mesonet stations, Landsat/Sentinel sensors, and MoEFCC OpenAQ.
        </p>
      </div>

      {/* Global Ingestion Health Card */}
      <div className="bg-[#121622] border border-[#212a3d] rounded-xl p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <span className="material-symbols-outlined text-[24px]">cloud_sync</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-[16.5px] font-semibold text-white">
                All 6 Primary Telemetry Pipelines Operating Normally
              </h2>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </div>
            <p className="text-[12.5px] text-[#94a3b8] mt-0.5">
              Zero dropped ingestion frames in the last 24-hour monitoring window. Average latency: 240ms.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-right">
          <div>
            <span className="text-[10.5px] text-[#94a3b8] block uppercase font-medium">MEAN QUALITY</span>
            <span className="text-[20px] font-bold text-emerald-400">98.9%</span>
          </div>
          <div className="h-8 w-px bg-[#212a3d]"></div>
          <div>
            <span className="text-[10.5px] text-[#94a3b8] block uppercase font-medium">UPTIME</span>
            <span className="text-[20px] font-bold text-white">99.98%</span>
          </div>
        </div>
      </div>

      {/* Sources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {dataSources.map(ds => (
          <div
            key={ds.id}
            className="bg-[#121622] border border-[#212a3d] rounded-xl p-5 shadow-sm space-y-4 hover:border-[#334155] transition-all"
          >
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[11px] text-blue-400 font-semibold uppercase block mb-0.5">
                  {ds.agency}
                </span>
                <h3 className="text-[15.5px] text-white font-semibold">
                  {ds.name}
                </h3>
              </div>

              <span className="px-2.5 py-0.5 rounded text-[10.5px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                {ds.status}
              </span>
            </div>

            <p className="text-[12.5px] text-[#94a3b8]">
              <strong className="text-white font-medium">Dataset:</strong> {ds.dataset}
            </p>

            {/* Ingested Variables */}
            <div className="space-y-1.5 bg-[#182030] p-3 rounded-lg border border-[#263147]">
              <span className="text-[10.5px] text-[#94a3b8] uppercase font-semibold block">INGESTED METEOROLOGICAL CHANNELS:</span>
              <div className="flex flex-wrap gap-1.5">
                {ds.variables.map((v, i) => (
                  <span key={i} className="text-[11px] bg-[#141a29] text-[#93c5fd] px-2 py-0.5 rounded border border-[#263147]">
                    {v}
                  </span>
                ))}
              </div>
            </div>

            {/* Ingestion Specs */}
            <div className="grid grid-cols-2 gap-2 text-[12px] text-[#94a3b8]">
              <div>
                <span>Update Cadence:</span>
                <strong className="text-white block font-medium">{ds.updateCadence}</strong>
              </div>
              <div>
                <span>Coverage Extent:</span>
                <strong className="text-white block font-medium">{ds.coverage}</strong>
              </div>
              <div>
                <span>Last Synchronized:</span>
                <strong className="text-emerald-400 block font-medium">{ds.lastIngested}</strong>
              </div>
              <div>
                <span>Data Quality Index:</span>
                <strong className="text-white block font-medium">{ds.dataQualityScore}%</strong>
              </div>
            </div>

            {/* API Endpoint snippet */}
            <div className="pt-3 border-t border-[#212a3d] flex items-center justify-between text-[11.5px] text-[#64748b]">
              <span className="font-mono truncate max-w-[280px]">{ds.apiEndpoint}</span>
              <span className="text-blue-400 font-medium">REST / GeoJSON</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { WardData, SensorNode, Region } from '../../types';

interface InteractiveMapProps {
  wards: WardData[];
  selectedWard: WardData | null;
  onSelectWard: (ward: WardData) => void;
  sensors: SensorNode[];
  forecastDayOffset: number;
  onForecastDayChange: (day: number) => void;
  currentRegion?: Region;
  onDetectLocation?: () => void;
  isLocating?: boolean;
  userLocationName?: string | null;
  onOpenForecastView?: () => void;
}

const MAPTILER_STYLE_URL = 'https://api.maptiler.com/maps/01a05121-4b08-7b1f-88f6-2fe7877f52ef/style.json?key=idNOyIMZ9iu7nAvtOUEr';

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  wards,
  selectedWard,
  onSelectWard,
  sensors,
  forecastDayOffset,
  onForecastDayChange,
  currentRegion,
  onDetectLocation,
  isLocating = false,
  userLocationName = null,
  onOpenForecastView
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const sensorMarkersRef = useRef<maplibregl.Marker[]>([]);

  const [isPlayingForecast, setIsPlayingForecast] = useState<boolean>(false);
  const [hoveredWard, setHoveredWard] = useState<WardData | null>(null);
  const [hoveredSensor, setHoveredSensor] = useState<SensorNode | null>(null);
  const [activeLayer, setActiveLayer] = useState<'thermal' | 'vulnerability' | 'shade' | 'sensors'>('thermal');
  const [mapLoaded, setMapLoaded] = useState<boolean>(false);
  const [mapError, setMapError] = useState<string | null>(null);

  // Forecast simulation animation loop
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlayingForecast) {
      timer = setInterval(() => {
        onForecastDayChange((forecastDayOffset + 1) % 5);
      }, 1800);
    }
    return () => clearInterval(timer);
  }, [isPlayingForecast, forecastDayOffset, onForecastDayChange]);

  // Helper to get temp at current forecast offset
  const getWardTempAtOffset = useCallback((w: WardData) => {
    const forecasted = w.forecastTemps[forecastDayOffset];
    return forecasted !== undefined ? forecasted : w.currentTemp;
  }, [forecastDayOffset]);

  // Get color for a ward based on active layer
  const getWardColor = useCallback((w: WardData, isFill: boolean = true) => {
    const temp = getWardTempAtOffset(w);
    const isSelected = selectedWard?.id === w.id;

    if (activeLayer === 'vulnerability') {
      const v = w.vulnerabilityIndex;
      if (v >= 0.8) return isFill ? (isSelected ? 'rgba(239, 68, 68, 0.60)' : 'rgba(239, 68, 68, 0.40)') : '#ef4444';
      if (v >= 0.6) return isFill ? (isSelected ? 'rgba(249, 115, 22, 0.55)' : 'rgba(249, 115, 22, 0.35)') : '#f97316';
      if (v >= 0.4) return isFill ? (isSelected ? 'rgba(245, 158, 11, 0.50)' : 'rgba(245, 158, 11, 0.30)') : '#f59e0b';
      return isFill ? (isSelected ? 'rgba(20, 184, 166, 0.45)' : 'rgba(20, 184, 166, 0.25)') : '#14b8a6';
    }

    if (activeLayer === 'shade') {
      const shade = w.shadeCoveragePercent || 10;
      // Low shade is high danger
      if (shade < 10) return isFill ? (isSelected ? 'rgba(239, 68, 68, 0.65)' : 'rgba(239, 68, 68, 0.45)') : '#ef4444';
      if (shade < 20) return isFill ? (isSelected ? 'rgba(249, 115, 22, 0.55)' : 'rgba(249, 115, 22, 0.35)') : '#f97316';
      if (shade < 30) return isFill ? (isSelected ? 'rgba(245, 158, 11, 0.50)' : 'rgba(245, 158, 11, 0.28)') : '#f59e0b';
      return isFill ? (isSelected ? 'rgba(20, 184, 166, 0.45)' : 'rgba(20, 184, 166, 0.22)') : '#14b8a6';
    }

    // Default: Thermal Heat Map layer
    if (temp >= 42.0 || w.status === 'critical') {
      return isFill ? (isSelected ? 'rgba(239, 68, 68, 0.65)' : 'rgba(239, 68, 68, 0.45)') : '#ef4444';
    } else if (temp >= 38.0 || w.status === 'danger') {
      return isFill ? (isSelected ? 'rgba(249, 115, 22, 0.58)' : 'rgba(249, 115, 22, 0.38)') : '#f97316';
    } else if (temp >= 33.0 || w.status === 'warning') {
      return isFill ? (isSelected ? 'rgba(245, 158, 11, 0.50)' : 'rgba(245, 158, 11, 0.30)') : '#f59e0b';
    } else {
      return isFill ? (isSelected ? 'rgba(20, 184, 166, 0.45)' : 'rgba(20, 184, 166, 0.20)') : '#14b8a6';
    }
  }, [getWardTempAtOffset, activeLayer, selectedWard]);

  // Convert wards to GeoJSON FeatureCollection
  const buildGeoJson = useCallback(() => {
    return {
      type: 'FeatureCollection' as const,
      features: wards.map(w => {
        const centerLng = w.geoCenter ? w.geoCenter[0] : (currentRegion?.lng || 72.5714);
        const centerLat = w.geoCenter ? w.geoCenter[1] : (currentRegion?.lat || 23.0225);

        // Coordinates polygon (GeoJSON array of [lng, lat])
        const ring = w.coordinates && w.coordinates.length >= 3 
          ? w.coordinates 
          : [
              [centerLng - 0.018, centerLat + 0.014],
              [centerLng + 0.016, centerLat + 0.016],
              [centerLng + 0.020, centerLat - 0.008],
              [centerLng + 0.006, centerLat - 0.018],
              [centerLng - 0.016, centerLat - 0.012],
              [centerLng - 0.018, centerLat + 0.014]
            ];

        return {
          type: 'Feature' as const,
          id: w.id,
          properties: {
            id: w.id,
            name: w.name,
            code: w.code,
            currentTemp: getWardTempAtOffset(w),
            vulnerabilityIndex: w.vulnerabilityIndex,
            shadeCoveragePercent: w.shadeCoveragePercent || 12,
            windSpeed: w.windSpeed || 14,
            humidity: w.humidity,
            fillColor: getWardColor(w, true),
            strokeColor: getWardColor(w, false),
            strokeWidth: selectedWard?.id === w.id ? 3.5 : 2.0,
            isSelected: selectedWard?.id === w.id
          },
          geometry: {
            type: 'Polygon' as const,
            coordinates: [ring]
          }
        };
      })
    };
  }, [wards, currentRegion, getWardTempAtOffset, getWardColor, selectedWard]);

  // Initialize MapLibre GL Map with MapTiler Style
  useEffect(() => {
    if (!mapContainerRef.current) return;

    try {
      const initialCenter: [number, number] = currentRegion 
        ? [currentRegion.lng, currentRegion.lat] 
        : [72.5714, 23.0225];

      const map = new maplibregl.Map({
        container: mapContainerRef.current,
        style: MAPTILER_STYLE_URL,
        center: initialCenter,
        zoom: 12.2,
        pitch: 20,
        bearing: 0,
        attributionControl: false
      });

      // Add navigation controls
      map.addControl(new maplibregl.NavigationControl({ showCompass: true, showZoom: false }), 'bottom-right');

      map.on('load', () => {
        setMapLoaded(true);

        // Add Wards GeoJSON Source
        const geojsonData = buildGeoJson();
        map.addSource('heat-wards-source', {
          type: 'geojson',
          data: geojsonData
        });

        // Add Thermal Heat Polygon Fill Layer
        map.addLayer({
          id: 'heat-wards-fill',
          type: 'fill',
          source: 'heat-wards-source',
          paint: {
            'fill-color': ['get', 'fillColor'],
            'fill-opacity': 0.85
          }
        });

        // Add Heat Polygon Outline Stroke Layer
        map.addLayer({
          id: 'heat-wards-stroke',
          type: 'line',
          source: 'heat-wards-source',
          paint: {
            'line-color': ['get', 'strokeColor'],
            'line-width': ['get', 'strokeWidth'],
            'line-opacity': 0.95
          }
        });

        // Click on polygon selects the ward
        map.on('click', 'heat-wards-fill', (e) => {
          if (e.features && e.features.length > 0) {
            const featId = e.features[0].properties?.id;
            const targetWard = wards.find(w => w.id === featId);
            if (targetWard) {
              onSelectWard(targetWard);
            }
          }
        });

        // Hover cursor effect
        map.on('mouseenter', 'heat-wards-fill', (e) => {
          map.getCanvas().style.cursor = 'pointer';
          if (e.features && e.features.length > 0) {
            const featId = e.features[0].properties?.id;
            const targetWard = wards.find(w => w.id === featId);
            if (targetWard) setHoveredWard(targetWard);
          }
        });

        map.on('mouseleave', 'heat-wards-fill', () => {
          map.getCanvas().style.cursor = '';
          setHoveredWard(null);
        });
      });

      map.on('error', (err: any) => {
        // Suppress non-critical tile load 404s or network aborts
        const status = err?.error?.status;
        const name = err?.error?.name;
        if (status !== 404 && name !== 'AbortError') {
          // Non-blocking diagnostic log only in dev mode
          if (import.meta.env.DEV) {
            console.debug('MapLibre GL tile notice:', err);
          }
        }
      });

      mapRef.current = map;

      return () => {
        map.remove();
        mapRef.current = null;
      };
    } catch (e: unknown) {
      if (import.meta.env.DEV) {
        console.warn('MapLibre WebGL fallback active:', e);
      }
      setMapError('Unable to load WebGL vector map tiles.');
    }
  }, []); // Only once on mount

  // Update GeoJSON source when wards, forecastDayOffset, activeLayer or selection changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    const source = map.getSource('heat-wards-source') as maplibregl.GeoJSONSource;
    if (source) {
      source.setData(buildGeoJson());
    }
  }, [buildGeoJson, mapLoaded]);

  // Fly to new region when currentRegion changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded || !currentRegion) return;

    map.flyTo({
      center: [currentRegion.lng, currentRegion.lat],
      zoom: 12.2,
      speed: 1.2,
      curve: 1.4,
      essential: true
    });
  }, [currentRegion, mapLoaded]);

  // Create & manage interactive HTML markers on the MapTiler base map
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    // Clean up old markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    // Create ward label & temp badges
    wards.forEach((ward) => {
      const temp = getWardTempAtOffset(ward);
      const isSelected = selectedWard?.id === ward.id;
      const centerLng = ward.geoCenter ? ward.geoCenter[0] : (currentRegion?.lng || 72.5714);
      const centerLat = ward.geoCenter ? ward.geoCenter[1] : (currentRegion?.lat || 23.0225);

      const el = document.createElement('div');
      el.className = 'group cursor-pointer select-none';
      el.innerHTML = `
        <div class="px-2.5 py-1 rounded-lg backdrop-blur-md transition-all duration-200 transform group-hover:scale-110 flex items-center gap-1.5 shadow-2xl border ${
          isSelected 
            ? 'bg-[#14b8a6] border-white text-[#00302b] ring-2 ring-[#14b8a6]' 
            : 'bg-[#0e1118]/90 border-[#3c4947] text-white hover:border-[#14b8a6]'
        }">
          <span class="font-mono text-[10px] font-bold tracking-wider ${isSelected ? 'text-[#00302b]' : 'text-[#94a3b8]'}">
            ${ward.code}
          </span>
          <span class="w-[1px] h-3 ${isSelected ? 'bg-[#00302b]/30' : 'bg-[#3c4947]'}"></span>
          <span class="font-mono text-[12px] font-extrabold ${
            isSelected 
              ? 'text-[#00302b]' 
              : temp >= 42.0 ? 'text-[#ef4444]' : temp >= 38.0 ? 'text-[#f97316]' : 'text-[#14b8a6]'
          }">
            ${temp.toFixed(1)}°C
          </span>
        </div>
      `;

      el.onclick = (ev) => {
        ev.stopPropagation();
        onSelectWard(ward);
      };

      const marker = new maplibregl.Marker({ element: el, anchor: 'center' })
        .setLngLat([centerLng, centerLat])
        .addTo(map);

      markersRef.current.push(marker);
    });

    // Create sensor pins if sensors layer is active
    sensorMarkersRef.current.forEach(m => m.remove());
    sensorMarkersRef.current = [];

    if (activeLayer === 'sensors') {
      sensors.forEach((sensor) => {
        const targetWard = wards.find(w => w.id === sensor.wardId);
        const baseLng = targetWard?.geoCenter ? targetWard.geoCenter[0] : (currentRegion?.lng || 72.5714);
        const baseLat = targetWard?.geoCenter ? targetWard.geoCenter[1] : (currentRegion?.lat || 23.0225);

        // Small deterministic offset for sensor points around the ward center
        const sensorOffsetLng = (sensor.x - (targetWard?.center.x || 300)) * 0.00035;
        const sensorOffsetLat = (sensor.y - (targetWard?.center.y || 250)) * -0.00035;
        const sensorLng = baseLng + sensorOffsetLng;
        const sensorLat = baseLat + sensorOffsetLat;

        const isAlert = sensor.status === 'alert' || sensor.status === 'warning';
        const color = sensor.status === 'alert' ? '#ef4444' : sensor.status === 'warning' ? '#f59e0b' : '#14b8a6';

        const sEl = document.createElement('div');
        sEl.className = 'relative flex items-center justify-center cursor-pointer';
        sEl.innerHTML = `
          ${isAlert ? `<div class="absolute w-6 h-6 rounded-full animate-ping opacity-75" style="background-color: ${color}"></div>` : ''}
          <div class="w-3.5 h-3.5 rounded-full border-2 border-[#0e1118] shadow-md transition-transform hover:scale-150" style="background-color: ${color}"></div>
        `;

        sEl.onmouseenter = () => setHoveredSensor(sensor);
        sEl.onmouseleave = () => setHoveredSensor(null);
        sEl.onclick = (ev) => {
          ev.stopPropagation();
          if (targetWard) onSelectWard(targetWard);
        };

        const sMarker = new maplibregl.Marker({ element: sEl, anchor: 'center' })
          .setLngLat([sensorLng, sensorLat])
          .addTo(map);

        sensorMarkersRef.current.push(sMarker);
      });
    }
  }, [wards, sensors, selectedWard, activeLayer, mapLoaded, getWardTempAtOffset, onSelectWard, currentRegion]);

  // Zoom controls
  const handleZoomIn = () => mapRef.current?.zoomIn({ duration: 300 });
  const handleZoomOut = () => mapRef.current?.zoomOut({ duration: 300 });
  const handleResetView = () => {
    if (currentRegion && mapRef.current) {
      mapRef.current.flyTo({
        center: [currentRegion.lng, currentRegion.lat],
        zoom: 12.2,
        pitch: 20,
        bearing: 0,
        essential: true
      });
    }
  };

  const daysLabel = ['Today', '+1d', '+2d', '+3d', '+4d'];

  return (
    <div className="flex-1 relative h-full w-full overflow-hidden select-none flex flex-col bg-[#0b0d13]">
      {/* MapTiler Map WebGL Container */}
      <div 
        ref={mapContainerRef} 
        className="w-full h-full absolute inset-0 z-0" 
        style={{ minHeight: '100%' }}
      />

      {/* Top Floating Control Bar - Clean, unified header */}
      <div className={`absolute top-4 left-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none transition-all duration-300 ${selectedWard ? 'right-4 lg:right-[435px]' : 'right-4'}`}>
        {/* Left: Region & Telemetry Info Pill */}
        <div className="pointer-events-auto px-3.5 py-1.5 rounded-xl flex items-center gap-2 border border-[#212a3d] shadow-md text-[12px] bg-[#0f131f]/90 backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shrink-0"></span>
          <span className="text-[#f1f5f9] font-medium tracking-wide truncate max-w-[180px] sm:max-w-xs">
            {currentRegion ? currentRegion.name.replace(' Urban Heat Island Grid', '') : 'India Grid'}
          </span>
          <span className="text-[#334155]">•</span>
          <span className="text-[#94a3b8] text-[11px]">
            {wards.length} Wards Active
          </span>
          {userLocationName && (
            <span className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-blue-500/15 text-blue-400 border border-blue-500/30 text-[10px] font-medium">
              <span className="material-symbols-outlined text-[12px]">near_me</span>
              <span>GPS</span>
            </span>
          )}
        </div>

        {/* Right: Unified Map Controls Toolbar (Layers + Actions) */}
        <div className="pointer-events-auto flex items-center gap-2 bg-[#121622]/95 backdrop-blur-md p-1.5 rounded-xl border border-[#212a3d] shadow-lg">
          {/* Segmented Layer Switcher */}
          <div className="flex items-center p-0.5 bg-[#0c0f17] rounded-lg border border-[#1e2638] text-[11.5px]">
            <button
              onClick={() => setActiveLayer('thermal')}
              className={`px-2.5 py-1 rounded-md flex items-center gap-1.5 transition-all ${
                activeLayer === 'thermal'
                  ? 'bg-[#2563eb] text-white font-semibold shadow-sm'
                  : 'text-[#94a3b8] hover:text-white hover:bg-[#161f33]'
              }`}
              title="View Thermal Heat Wave Severity"
            >
              <span className="material-symbols-outlined text-[15px]">thermostat</span>
              <span className="hidden sm:inline">Thermal</span>
            </button>

            <button
              onClick={() => setActiveLayer('shade')}
              className={`px-2.5 py-1 rounded-md flex items-center gap-1.5 transition-all ${
                activeLayer === 'shade'
                  ? 'bg-[#2563eb] text-white font-semibold shadow-sm'
                  : 'text-[#94a3b8] hover:text-white hover:bg-[#161f33]'
              }`}
              title="View Shade & Canopy Deficit Hotspots"
            >
              <span className="material-symbols-outlined text-[15px]">park</span>
              <span className="hidden sm:inline">Shade Deficit</span>
            </button>

            <button
              onClick={() => setActiveLayer('vulnerability')}
              className={`px-2.5 py-1 rounded-md flex items-center gap-1.5 transition-all ${
                activeLayer === 'vulnerability'
                  ? 'bg-[#2563eb] text-white font-semibold shadow-sm'
                  : 'text-[#94a3b8] hover:text-white hover:bg-[#161f33]'
              }`}
              title="View Human Vulnerability Index"
            >
              <span className="material-symbols-outlined text-[15px]">group</span>
              <span className="hidden sm:inline">Vulnerability</span>
            </button>

            <button
              onClick={() => setActiveLayer('sensors')}
              className={`px-2.5 py-1 rounded-md flex items-center gap-1.5 transition-all ${
                activeLayer === 'sensors'
                  ? 'bg-[#2563eb] text-white font-semibold shadow-sm'
                  : 'text-[#94a3b8] hover:text-white hover:bg-[#161f33]'
              }`}
              title="View Mesonet Ground Sensors"
            >
              <span className="material-symbols-outlined text-[15px]">sensors</span>
              <span className="hidden sm:inline">Sensors</span>
            </button>
          </div>

          {/* Vertical Divider */}
          <div className="w-[1px] h-5 bg-[#212a3d]"></div>

          {/* Quick Action Tools */}
          <div className="flex items-center gap-1">
            <button 
              onClick={handleZoomIn}
              className="w-7 h-7 rounded-lg bg-[#182030] hover:bg-[#222d42] text-[#cbd5e1] hover:text-white border border-[#2b3954] flex items-center justify-center transition-all shadow-sm"
              title="Zoom In (+)"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
            </button>
            <button 
              onClick={handleZoomOut}
              className="w-7 h-7 rounded-lg bg-[#182030] hover:bg-[#222d42] text-[#cbd5e1] hover:text-white border border-[#2b3954] flex items-center justify-center transition-all shadow-sm"
              title="Zoom Out (-)"
            >
              <span className="material-symbols-outlined text-[16px]">remove</span>
            </button>
            <button 
              onClick={handleResetView}
              className="w-7 h-7 rounded-lg bg-[#182030] hover:bg-[#222d42] text-[#cbd5e1] hover:text-white border border-[#2b3954] flex items-center justify-center transition-all shadow-sm"
              title="Recenter Map View"
            >
              <span className="material-symbols-outlined text-[16px]">filter_center_focus</span>
            </button>

            {onDetectLocation && (
              <button 
                onClick={onDetectLocation}
                disabled={isLocating}
                className="w-7 h-7 rounded-lg bg-[#182030] hover:bg-[#222d42] text-[#60a5fa] border border-[#2b3954] flex items-center justify-center transition-all shadow-sm"
                title="Detect My Location (GPS)"
              >
                <span className={`material-symbols-outlined text-[16px] ${isLocating ? 'animate-spin text-amber-400' : ''}`}>
                  {isLocating ? 'sync' : 'my_location'}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Heatwave Severity Color Scale Legend */}
      <div className="absolute top-20 left-4 z-20 pointer-events-none hidden sm:block">
        <div className="glass-panel px-3 py-2 rounded-xl border border-[#3c4947] bg-[#0e1118]/90 text-[11px] flex flex-col gap-1.5 shadow-xl">
          <span className="font-label-caps text-[10px] text-[#94a3b8] uppercase font-bold tracking-wider">
            {activeLayer === 'thermal' ? 'HEATWAVE SEVERITY' : activeLayer === 'shade' ? 'SHADE DEFICIT' : 'VULNERABILITY LEVEL'}
          </span>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#ef4444]"></span>
              <span className="text-[#ffb4ab] font-data-point text-[10px]">&ge;42°C (Extreme)</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#f97316]"></span>
              <span className="text-[#ffb59e] font-data-point text-[10px]">38-41°C (Danger)</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#f59e0b]"></span>
              <span className="text-[#fbbf24] font-data-point text-[10px]">33-37°C (Alert)</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#14b8a6]"></span>
              <span className="text-[#4fdbc8] font-data-point text-[10px]">&lt;33°C (Normal)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Ward Hover Geography Card Tooltip */}
      {hoveredWard && !selectedWard && (
        <div 
          className="absolute z-30 pointer-events-none glass-panel p-3.5 rounded-xl border border-[#3c4947] text-[12px] shadow-2xl bg-[#0e1118]/95 backdrop-blur-md max-w-xs"
          style={{ right: '24px', top: '72px' }}
        >
          <div className="flex items-center justify-between gap-2 border-b border-[#2b3548] pb-1.5 mb-2">
            <span className="font-headline-md font-bold text-white text-[13px]">{hoveredWard.name}</span>
            <span className="font-data-point text-[10px] px-1.5 py-0.5 rounded bg-[#14b8a6]/20 text-[#14b8a6] border border-[#14b8a6]/30">
              {hoveredWard.code}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] font-data-point">
            <div>
              <span className="text-[#94a3b8] block text-[10px]">TEMP</span>
              <span className="text-[#ffb4ab] font-bold text-[13px]">
                {getWardTempAtOffset(hoveredWard).toFixed(1)}°C
              </span>
            </div>
            <div>
              <span className="text-[#94a3b8] block text-[10px]">HUMIDITY</span>
              <span className="text-white font-bold text-[13px]">{hoveredWard.humidity}%</span>
            </div>
            <div>
              <span className="text-[#94a3b8] block text-[10px]">WIND SPEED</span>
              <span className="text-[#4fdbc8] font-bold">{hoveredWard.windSpeed || 12} km/h</span>
            </div>
            <div>
              <span className="text-[#94a3b8] block text-[10px]">SHADE COVER</span>
              <span className={`${(hoveredWard.shadeCoveragePercent || 10) < 15 ? 'text-[#ffb4ab]' : 'text-[#71f8e4]'} font-bold`}>
                {hoveredWard.shadeCoveragePercent || 10}%
              </span>
            </div>
          </div>

          <div className="mt-2.5 pt-2 border-t border-[#2b3548] text-[10.5px] text-[#ffb59e] flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[14px]">wb_sunny</span>
            <span>
              Exposed outdoor pop: <strong>{(hoveredWard.exposedPopulation ? hoveredWard.exposedPopulation.totalExposed : Math.round(hoveredWard.population * 0.4)).toLocaleString()}</strong>
            </span>
          </div>
        </div>
      )}

      {/* Sensor Hover Tooltip */}
      {hoveredSensor && (
        <div 
          className="absolute z-30 pointer-events-none glass-panel px-3.5 py-2.5 rounded-xl border border-[#3c4947] text-[12px] shadow-2xl bg-[#0e1118]/95 backdrop-blur-md"
          style={{ right: '24px', top: '72px' }}
        >
          <div className="font-data-point font-bold text-[#14b8a6]">{hoveredSensor.name}</div>
          <div className="font-label-caps text-[#94a3b8] text-[10.5px]">Code: {hoveredSensor.code} • Last ping {hoveredSensor.lastPing}</div>
          <div className="flex gap-3.5 mt-1.5 text-[11px] font-data-point">
            <span className="text-[#f87171] font-semibold">Temp: {hoveredSensor.temp}°C</span>
            <span className="text-[#cbd5e1]">Humidity: {hoveredSensor.humidity}%</span>
            <span className="text-[#14b8a6]">Battery: {hoveredSensor.battery}%</span>
          </div>
        </div>
      )}

      {/* Bottom Timeline Forecast Scrubber */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4 z-20">
        <div className="glass-panel rounded-2xl p-3.5 sm:p-4 flex flex-col gap-3 shadow-2xl border border-white/10 bg-[#0e1118]/95 backdrop-blur-md">
          {/* Header Row */}
          <div className="flex justify-between items-center px-1">
            <span className="font-label-caps text-[11px] text-[#94a3b8] tracking-wider uppercase font-semibold">
              FORECAST HORIZON
            </span>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#14b8a6] animate-pulse"></span>
              <span className="font-data-point text-[12px] text-[#14b8a6] font-semibold">
                {forecastDayOffset === 0 ? 'Live Telemetry' : `${daysLabel[forecastDayOffset]} Forecast Model`}
              </span>
            </div>
          </div>

          {/* Scrubber Controls */}
          <div className="flex items-center gap-4">
            {/* Play/Pause Button */}
            <button
              onClick={() => setIsPlayingForecast(!isPlayingForecast)}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#14b8a6] text-[#00302b] flex items-center justify-center hover:bg-[#2dd4bf] transition-all shrink-0 shadow-[0_0_15px_rgba(20,184,166,0.35)] hover:scale-105"
              title={isPlayingForecast ? 'Pause Simulation' : 'Play 5-Day Forecast Loop'}
            >
              <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                {isPlayingForecast ? 'pause' : 'play_arrow'}
              </span>
            </button>

            {/* Timeline Track & Markers */}
            <div className="flex-1 relative h-9 flex items-center">
              {/* Background Track */}
              <div className="absolute w-full h-1.5 bg-[#262c3d] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#14b8a6] transition-all duration-300"
                  style={{ width: `${(forecastDayOffset / 4) * 100}%` }}
                ></div>
              </div>

              {/* Day Markers (Clickable) */}
              <div className="absolute w-full flex justify-between px-1">
                {daysLabel.map((label, idx) => (
                  <button
                    key={label}
                    onClick={() => onForecastDayChange(idx)}
                    className="flex flex-col items-center gap-1 group cursor-pointer focus:outline-none"
                  >
                    <div 
                      className={`w-1.5 h-3 rounded-full transition-colors ${
                        idx <= forecastDayOffset ? 'bg-[#14b8a6]' : 'bg-[#4b5563]'
                      } group-hover:bg-[#2dd4bf]`}
                    ></div>
                    <span 
                      className={`font-data-point text-[11px] transition-colors ${
                        idx === forecastDayOffset ? 'text-[#14b8a6] font-bold' : 'text-[#94a3b8]'
                      }`}
                    >
                      {label}
                    </span>
                  </button>
                ))}
              </div>

              {/* Draggable Thumb Indicator */}
              <div 
                className="absolute w-4 h-4 bg-[#14b8a6] rounded-full shadow-[0_0_12px_#14b8a6] border-2 border-[#0b0d13] pointer-events-none -translate-x-1/2 transition-all duration-300"
                style={{ left: `${(forecastDayOffset / 4) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

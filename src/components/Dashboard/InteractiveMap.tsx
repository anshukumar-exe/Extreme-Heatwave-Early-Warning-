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

type MapInstance = maplibregl.Map;

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
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapInstance | null>(null);

  const wardsRef = useRef(wards);
  wardsRef.current = wards;
  const sensorsRef = useRef(sensors);
  sensorsRef.current = sensors;
  const onSelectWardRef = useRef(onSelectWard);
  onSelectWardRef.current = onSelectWard;

  const [isPlayingForecast, setIsPlayingForecast] = useState(false);
  const [hoveredWard, setHoveredWard] = useState<WardData | null>(null);
  const [hoveredSensor, setHoveredSensor] = useState<SensorNode | null>(null);
  const [activeLayer, setActiveLayer] =
    useState<'thermal' | 'vulnerability' | 'shade' | 'sensors'>('thermal');
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  const getWardTempAtOffset = useCallback(
    (ward: WardData) => {
      const forecasted = ward.forecastTemps[forecastDayOffset];
      return forecasted !== undefined ? forecasted : ward.currentTemp;
    },
    [forecastDayOffset],
  );

  const getWardColor = useCallback(
    (ward: WardData, isFill = true) => {
      const temp = getWardTempAtOffset(ward);
      const isSelected = selectedWard?.id === ward.id;

      if (activeLayer === 'vulnerability') {
        const v = ward.vulnerabilityIndex;
        if (v >= 0.8)
          return isFill
            ? isSelected ? 'rgba(239,68,68,0.65)' : 'rgba(239,68,68,0.45)'
            : '#ef4444';
        if (v >= 0.6)
          return isFill
            ? isSelected ? 'rgba(249,115,22,0.58)' : 'rgba(249,115,22,0.38)'
            : '#f97316';
        if (v >= 0.4)
          return isFill
            ? isSelected ? 'rgba(245,158,11,0.52)' : 'rgba(245,158,11,0.32)'
            : '#f59e0b';
        return isFill
          ? isSelected ? 'rgba(20,184,166,0.48)' : 'rgba(20,184,166,0.25)'
          : '#14b8a6';
      }

      if (activeLayer === 'shade') {
        const shade = ward.shadeCoveragePercent || 10;
        if (shade < 10)
          return isFill
            ? isSelected ? 'rgba(239,68,68,0.65)' : 'rgba(239,68,68,0.45)'
            : '#ef4444';
        if (shade < 20)
          return isFill
            ? isSelected ? 'rgba(249,115,22,0.58)' : 'rgba(249,115,22,0.38)'
            : '#f97316';
        if (shade < 30)
          return isFill
            ? isSelected ? 'rgba(245,158,11,0.52)' : 'rgba(245,158,11,0.30)'
            : '#f59e0b';
        return isFill
          ? isSelected ? 'rgba(20,184,166,0.48)' : 'rgba(20,184,166,0.22)'
          : '#14b8a6';
      }

      if (temp >= 42 || ward.status === 'critical')
        return isFill
          ? isSelected ? 'rgba(239,68,68,0.65)' : 'rgba(239,68,68,0.45)'
          : '#ef4444';
      if (temp >= 38 || ward.status === 'danger')
        return isFill
          ? isSelected ? 'rgba(249,115,22,0.58)' : 'rgba(249,115,22,0.38)'
          : '#f97316';
      if (temp >= 33 || ward.status === 'warning')
        return isFill
          ? isSelected ? 'rgba(245,158,11,0.52)' : 'rgba(245,158,11,0.30)'
          : '#f59e0b';

      return isFill
        ? isSelected ? 'rgba(20,184,166,0.48)' : 'rgba(20,184,166,0.20)'
        : '#14b8a6';
    },
    [getWardTempAtOffset, activeLayer, selectedWard],
  );

  const buildWardGeoJson = useCallback(() => ({
    type: 'FeatureCollection',
    features: wards.map((ward) => {
      const centerLng = ward.geoCenter?.[0] ?? currentRegion?.lng ?? 77.5946;
      const centerLat = ward.geoCenter?.[1] ?? currentRegion?.lat ?? 12.9716;

      const ring =
        ward.coordinates && ward.coordinates.length >= 3
          ? ward.coordinates
          : [
              [centerLng - 0.018, centerLat + 0.014],
              [centerLng + 0.016, centerLat + 0.016],
              [centerLng + 0.020, centerLat - 0.008],
              [centerLng + 0.006, centerLat - 0.018],
              [centerLng - 0.016, centerLat - 0.012],
              [centerLng - 0.018, centerLat + 0.014],
            ];

      return {
        type: 'Feature',
        id: ward.id,
        properties: {
          id: ward.id,
          name: ward.name,
          code: ward.code,
          currentTemp: getWardTempAtOffset(ward),
          vulnerabilityIndex: ward.vulnerabilityIndex,
          shadeCoveragePercent: ward.shadeCoveragePercent || 12,
          fillColor: getWardColor(ward, true),
          strokeColor: getWardColor(ward, false),
          strokeWidth: selectedWard?.id === ward.id ? 3.5 : 2,
        },
        geometry: {
          type: 'Polygon',
          coordinates: [ring],
        },
      };
    }),
  }), [wards, currentRegion, getWardTempAtOffset, getWardColor, selectedWard]);

  const buildSensorGeoJson = useCallback(() => ({
    type: 'FeatureCollection',
    features: sensors.flatMap((sensor) => {
      const ward = wards.find((item) => item.id === sensor.wardId);
      if (!ward) return [];

      const baseLng = ward.geoCenter?.[0] ?? currentRegion?.lng ?? 77.5946;
      const baseLat = ward.geoCenter?.[1] ?? currentRegion?.lat ?? 12.9716;
      const sensorLng =
        baseLng + (sensor.x - (ward.center?.x ?? 300)) * 0.00035;
      const sensorLat =
        baseLat - (sensor.y - (ward.center?.y ?? 250)) * 0.00035;

      return [{
        type: 'Feature',
        id: sensor.id,
        properties: {
          id: sensor.id,
          wardId: sensor.wardId,
          status: sensor.status,
          color:
            sensor.status === 'alert'
              ? '#ef4444'
              : sensor.status === 'warning'
                ? '#f59e0b'
                : '#14b8a6',
        },
        geometry: {
          type: 'Point',
          coordinates: [sensorLng, sensorLat],
        },
      }];
    }),
  }), [sensors, wards, currentRegion]);

  const upsertWardLayers = useCallback((map: MapInstance) => {
    if (map.isStyleLoaded && !map.isStyleLoaded()) {
      return;
    }
    const data = buildWardGeoJson();
    const source = map.getSource?.('heat-wards-source');

    if (!source) {
      map.addSource('heat-wards-source', {
        type: 'geojson',
        data,
      });
    } else {
      (source as maplibregl.GeoJSONSource).setData(data as any);
    }

    if (!map.getLayer?.('heat-wards-fill')) {
      map.addLayer({
        id: 'heat-wards-fill',
        type: 'fill',
        source: 'heat-wards-source',
        paint: {
          'fill-color': ['get', 'fillColor'],
          'fill-opacity': 0.85,
        },
      });
    }

    if (!map.getLayer?.('heat-wards-stroke')) {
      map.addLayer({
        id: 'heat-wards-stroke',
        type: 'line',
        source: 'heat-wards-source',
        paint: {
          'line-color': ['get', 'strokeColor'],
          'line-width': ['get', 'strokeWidth'],
          'line-opacity': 0.95,
        },
      });
    }


  }, [buildWardGeoJson]);

  const upsertSensorLayer = useCallback((map: MapInstance) => {
    if (map.isStyleLoaded && !map.isStyleLoaded()) {
      return;
    }
    const data = buildSensorGeoJson();
    const source = map.getSource?.('heat-sensors-source');

    if (!source) {
      map.addSource('heat-sensors-source', {
        type: 'geojson',
        data,
      });
    } else {
      (source as maplibregl.GeoJSONSource).setData(data as any);
    }

    if (!map.getLayer?.('heat-sensors-circle')) {
      map.addLayer({
        id: 'heat-sensors-circle',
        type: 'circle',
        source: 'heat-sensors-source',
        paint: {
          'circle-radius': 7,
          'circle-color': ['get', 'color'],
          'circle-stroke-color': '#0e1118',
          'circle-stroke-width': 2,
        },
        layout: {
          visibility: activeLayer === 'sensors' ? 'visible' : 'none',
        },
      });
    } else {
      if (map.getLayer?.('heat-sensors-circle')) {
        map.setLayoutProperty(
          'heat-sensors-circle',
          'visibility',
          activeLayer === 'sensors' ? 'visible' : 'none',
        );
      }
    }
  }, [buildSensorGeoJson, activeLayer]);

  useEffect(() => {
    let disposed = false;

    const initializeMap = () => {
      if (!mapContainerRef.current || mapRef.current) return;

      const center: [number, number] = [
        currentRegion?.lng ?? 77.5946,
        currentRegion?.lat ?? 12.9716,
      ];

      try {
        const map = new maplibregl.Map({
          container: mapContainerRef.current,
          style: {
            version: 8,
            sources: {
              'osm-tiles': {
                type: 'raster',
                tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
                tileSize: 256,
                attribution: '© OpenStreetMap contributors',
              },
            },
            layers: [
              {
                id: 'osm-background',
                type: 'background',
                paint: {
                  'background-color': '#0b0d13',
                },
              },
              {
                id: 'osm-tiles',
                type: 'raster',
                source: 'osm-tiles',
                paint: {
                  'raster-opacity': 0.92,
                },
              },
            ],
          },
          center,
          zoom: 12.2,
          attributionControl:{
            compact:true,
          }
        });

        if (disposed) {
          map.remove();
          return;
        }

        mapRef.current = map;

        const setupLayers = () => {
          if (disposed || !map.isStyleLoaded()) return;

          try {
            upsertWardLayers(map);
            upsertSensorLayer(map);

            // Ward interactions
            map.on('click', 'heat-wards-fill', (event: any) => {
              const feature = event?.features?.[0];
              const wardId = feature?.properties?.id;
              const ward = wardsRef.current.find((item) => item.id === wardId);
              if (ward) onSelectWardRef.current(ward);
            });

            map.on('mousemove', 'heat-wards-fill', (event: any) => {
              const feature = event?.features?.[0];
              const wardId = feature?.properties?.id;
              const ward = wardsRef.current.find((item) => item.id === wardId);
              if (ward) {
                setHoveredWard(ward);
                map.getCanvas().style.cursor = 'pointer';
              }
            });

            map.on('mouseleave', 'heat-wards-fill', () => {
              setHoveredWard(null);
              map.getCanvas().style.cursor = '';
            });

            // Sensor interactions
            map.on('click', 'heat-sensors-circle', (event: any) => {
              const sensorId = event?.features?.[0]?.properties?.id;
              const sensor = sensorsRef.current.find((item) => item.id === sensorId);
              if (sensor) {
                setHoveredSensor(sensor);
                const ward = wardsRef.current.find((item) => item.id === sensor.wardId);
                if (ward) onSelectWardRef.current(ward);
              }
            });

            map.on('mousemove', 'heat-sensors-circle', (event: any) => {
              const sensorId = event?.features?.[0]?.properties?.id;
              const sensor = sensorsRef.current.find((item) => item.id === sensorId);
              if (sensor) setHoveredSensor(sensor);
              map.getCanvas().style.cursor = 'pointer';
            });

            map.on('mouseleave', 'heat-sensors-circle', () => {
              setHoveredSensor(null);
              map.getCanvas().style.cursor = '';
            });

            setMapLoaded(true);
            setMapError(null);
          } catch (layerError) {
            console.error('Map layer setup error:', layerError);
            setMapError(
              layerError instanceof Error
                ? layerError.message
                : 'Unable to load heatwave map layers.',
            );
          }
        };

        map.once('load', setupLayers);

        map.on('error', (event: any) => {
          const msg = event?.error?.message || '';
          console.warn('OpenStreetMap/MapLibre notice:', event);
          if (!mapLoaded && msg) setMapError(msg);
        });
      } catch (error) {
        console.error('MapLibre initialization error:', error);
        setMapError(
          error instanceof Error
            ? error.message
            : 'Unable to initialize the map.',
        );
      }
    };

    initializeMap();

    return () => {
      disposed = true;
      const map = mapRef.current;
      if (map) {
        try {
          map.remove();
        } catch {
          // Ignore cleanup errors during React unmount.
        }
      }
      mapRef.current = null;
      setMapLoaded(false);
    };
    // Initialize the map once. React state/data updates are handled below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    try {
      const wardSource = map.getSource?.('heat-wards-source');
      if (wardSource) (wardSource as maplibregl.GeoJSONSource).setData(buildWardGeoJson() as any);

      const sensorSource = map.getSource?.('heat-sensors-source');
      if (sensorSource) (sensorSource as maplibregl.GeoJSONSource).setData(buildSensorGeoJson() as any);

      if (map.getLayer?.('heat-sensors-circle')) {
        map.setLayoutProperty(
          'heat-sensors-circle',
          'visibility',
          activeLayer === 'sensors' ? 'visible' : 'none',
        );
      }
    } catch (error) {
      console.debug('Map layer update notice:', error);
    }
  }, [buildWardGeoJson, buildSensorGeoJson, activeLayer, mapLoaded]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    try {
      if (map.isStyleLoaded?.()) {
        upsertWardLayers(map);
        upsertSensorLayer(map);
      } else {
        map.once?.('style.load', () => {
          upsertWardLayers(map);
          upsertSensorLayer(map);
        });
      }
    } catch (error) {
      console.debug('Map layer setup notice:', error);
    }
  }, [mapLoaded, upsertWardLayers, upsertSensorLayer]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded || !currentRegion) return;

    map.flyTo?.({
      center: [currentRegion.lng, currentRegion.lat],
      zoom: 12.2,
      speed: 1.2,
      curve: 1.4,
      essential: true,
    });
  }, [currentRegion, mapLoaded]);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined;

    if (isPlayingForecast) {
      timer = setInterval(() => {
        onForecastDayChange((forecastDayOffset + 1) % 5);
      }, 1800);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlayingForecast, forecastDayOffset, onForecastDayChange]);

  const handleZoomIn = () => {
    mapRef.current?.zoomIn?.({ duration: 300 });
  };

  const handleZoomOut = () => {
    mapRef.current?.zoomOut?.({ duration: 300 });
  };

  const handleResetView = () => {
    if (!currentRegion || !mapRef.current) return;

    mapRef.current.flyTo?.({
      center: [currentRegion.lng, currentRegion.lat],
      zoom: 12.2,
      pitch: 20,
      bearing: 0,
      essential: true,
    });
  };

  const daysLabel = ['Today', '+1d', '+2d', '+3d', '+4d'];

  return (
    <div className="flex-1 relative h-full w-full overflow-hidden select-none flex flex-col bg-[#0b0d13]">
      <div
        ref={mapContainerRef}
        className="w-full h-full absolute inset-0 z-0"
        style={{ minHeight: '100%' }}
      />

      {!mapLoaded && !mapError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#090d16]/80 backdrop-blur-sm z-30 pointer-events-none">
          <div className="w-9 h-9 border-2 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin mb-3" />
          <div className="text-xs font-mono font-medium text-slate-200">Connecting to OpenStreetMap...</div>
          <div className="text-[11px] text-slate-400 mt-1">Syncing heatwave micro-grid telemetry</div>
        </div>
      )}

      {mapError && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 max-w-lg px-4 py-3 rounded-xl bg-[#111827]/95 border border-red-500/40 text-red-200 text-xs shadow-xl">
          <div className="font-semibold mb-1">Map notice</div>
          <div>{mapError}</div>
        </div>
      )}

      <div className={`absolute top-4 left-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none transition-all duration-300 ${selectedWard ? 'right-4 lg:right-[435px]' : 'right-4'}`}>
        <div className="pointer-events-auto px-3.5 py-1.5 rounded-xl flex items-center gap-2 border border-[#212a3d] shadow-md text-[12px] bg-[#0f131f]/90 backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shrink-0" />
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
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10.5px] font-medium font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>OpenStreetMap Connected</span>
          </span>
        </div>

        <div className="pointer-events-auto flex items-center gap-2 bg-[#121622]/95 backdrop-blur-md p-1.5 rounded-xl border border-[#212a3d] shadow-lg">
          <div className="flex items-center p-0.5 bg-[#0c0f17] rounded-lg border border-[#1e2638] text-[11.5px]">
            <button onClick={() => setActiveLayer('thermal')} className={`px-2.5 py-1 rounded-md flex items-center gap-1.5 transition-all ${activeLayer === 'thermal' ? 'bg-[#2563eb] text-white font-semibold shadow-sm' : 'text-[#94a3b8] hover:text-white hover:bg-[#161f33]'}`}>
              <span className="material-symbols-outlined text-[15px]">thermostat</span>
              <span className="hidden sm:inline">Thermal</span>
            </button>
            <button onClick={() => setActiveLayer('shade')} className={`px-2.5 py-1 rounded-md flex items-center gap-1.5 transition-all ${activeLayer === 'shade' ? 'bg-[#2563eb] text-white font-semibold shadow-sm' : 'text-[#94a3b8] hover:text-white hover:bg-[#161f33]'}`}>
              <span className="material-symbols-outlined text-[15px]">park</span>
              <span className="hidden sm:inline">Shade Deficit</span>
            </button>
            <button onClick={() => setActiveLayer('vulnerability')} className={`px-2.5 py-1 rounded-md flex items-center gap-1.5 transition-all ${activeLayer === 'vulnerability' ? 'bg-[#2563eb] text-white font-semibold shadow-sm' : 'text-[#94a3b8] hover:text-white hover:bg-[#161f33]'}`}>
              <span className="material-symbols-outlined text-[15px]">group</span>
              <span className="hidden sm:inline">Vulnerability</span>
            </button>
            <button onClick={() => setActiveLayer('sensors')} className={`px-2.5 py-1 rounded-md flex items-center gap-1.5 transition-all ${activeLayer === 'sensors' ? 'bg-[#2563eb] text-white font-semibold shadow-sm' : 'text-[#94a3b8] hover:text-white hover:bg-[#161f33]'}`}>
              <span className="material-symbols-outlined text-[15px]">sensors</span>
              <span className="hidden sm:inline">Sensors</span>
            </button>
          </div>

          <div className="w-[1px] h-5 bg-[#212a3d]" />

          <div className="flex items-center gap-1">
            <button onClick={handleZoomIn} className="w-7 h-7 rounded-lg bg-[#182030] hover:bg-[#222d42] text-[#cbd5e1] hover:text-white border border-[#2b3954] flex items-center justify-center transition-all shadow-sm" title="Zoom In (+)">
              <span className="material-symbols-outlined text-[16px]">add</span>
            </button>
            <button onClick={handleZoomOut} className="w-7 h-7 rounded-lg bg-[#182030] hover:bg-[#222d42] text-[#cbd5e1] hover:text-white border border-[#2b3954] flex items-center justify-center transition-all shadow-sm" title="Zoom Out (-)">
              <span className="material-symbols-outlined text-[16px]">remove</span>
            </button>
            <button onClick={handleResetView} className="w-7 h-7 rounded-lg bg-[#182030] hover:bg-[#222d42] text-[#cbd5e1] hover:text-white border border-[#2b3954] flex items-center justify-center transition-all shadow-sm" title="Recenter Map View">
              <span className="material-symbols-outlined text-[16px]">filter_center_focus</span>
            </button>
            {onDetectLocation && (
              <button onClick={onDetectLocation} disabled={isLocating} className="w-7 h-7 rounded-lg bg-[#182030] hover:bg-[#222d42] text-[#60a5fa] border border-[#2b3954] flex items-center justify-center transition-all shadow-sm" title="Detect My Location (GPS)">
                <span className={`material-symbols-outlined text-[16px] ${isLocating ? 'animate-spin text-amber-400' : ''}`}>
                  {isLocating ? 'sync' : 'my_location'}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="absolute top-20 left-4 z-20 pointer-events-none hidden sm:block">
        <div className="glass-panel px-3 py-2 rounded-xl border border-[#3c4947] bg-[#0e1118]/90 text-[11px] flex flex-col gap-1.5 shadow-xl">
          <span className="font-label-caps text-[10px] text-[#94a3b8] uppercase font-bold tracking-wider">
            {activeLayer === 'thermal' ? 'HEATWAVE SEVERITY' : activeLayer === 'shade' ? 'SHADE DEFICIT' : 'VULNERABILITY LEVEL'}
          </span>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-[#ef4444]" /><span className="text-[#ffb4ab] font-data-point text-[10px]">&ge;42°C (Extreme)</span></div>
            <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-[#f97316]" /><span className="text-[#ffb59e] font-data-point text-[10px]">38-41°C (Danger)</span></div>
            <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-[#f59e0b]" /><span className="text-[#fbbf24] font-data-point text-[10px]">33-37°C (Alert)</span></div>
            <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-[#14b8a6]" /><span className="text-[#4fdbc8] font-data-point text-[10px]">&lt;33°C (Normal)</span></div>
          </div>
        </div>
      </div>

      {hoveredWard && !selectedWard && (
        <div className="absolute z-30 pointer-events-none glass-panel p-3.5 rounded-xl border border-[#3c4947] text-[12px] shadow-2xl bg-[#0e1118]/95 backdrop-blur-md max-w-xs" style={{ right: '24px', top: '72px' }}>
          <div className="flex items-center justify-between gap-2 border-b border-[#2b3548] pb-1.5 mb-2">
            <span className="font-headline-md font-bold text-white text-[13px]">{hoveredWard.name}</span>
            <span className="font-data-point text-[10px] px-1.5 py-0.5 rounded bg-[#14b8a6]/20 text-[#14b8a6] border border-[#14b8a6]/30">{hoveredWard.code}</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px] font-data-point">
            <div><span className="text-[#94a3b8] block text-[10px]">TEMP</span><span className="text-[#ffb4ab] font-bold text-[13px]">{getWardTempAtOffset(hoveredWard).toFixed(1)}°C</span></div>
            <div><span className="text-[#94a3b8] block text-[10px]">HUMIDITY</span><span className="text-white font-bold text-[13px]">{hoveredWard.humidity}%</span></div>
            <div><span className="text-[#94a3b8] block text-[10px]">WIND SPEED</span><span className="text-[#4fdbc8] font-bold">{hoveredWard.windSpeed || 12} km/h</span></div>
            <div><span className="text-[#94a3b8] block text-[10px]">SHADE COVER</span><span className={`${(hoveredWard.shadeCoveragePercent || 10) < 15 ? 'text-[#ffb4ab]' : 'text-[#71f8e4]'} font-bold`}>{hoveredWard.shadeCoveragePercent || 10}%</span></div>
          </div>
          <div className="mt-2.5 pt-2 border-t border-[#2b3548] text-[10.5px] text-[#ffb59e] flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[14px]">wb_sunny</span>
            <span>Exposed outdoor pop: <strong>{(hoveredWard.exposedPopulation ? hoveredWard.exposedPopulation.totalExposed : Math.round(hoveredWard.population * 0.4)).toLocaleString()}</strong></span>
          </div>
        </div>
      )}

      {hoveredSensor && (
        <div className="absolute z-30 pointer-events-none glass-panel px-3.5 py-2.5 rounded-xl border border-[#3c4947] text-[12px] shadow-2xl bg-[#0e1118]/95 backdrop-blur-md" style={{ right: '24px', top: '72px' }}>
          <div className="font-data-point font-bold text-[#14b8a6]">{hoveredSensor.name}</div>
          <div className="font-label-caps text-[#94a3b8] text-[10.5px]">Code: {hoveredSensor.code} • Last ping {hoveredSensor.lastPing}</div>
          <div className="flex gap-3.5 mt-1.5 text-[11px] font-data-point">
            <span className="text-[#f87171] font-semibold">Temp: {hoveredSensor.temp}°C</span>
            <span className="text-[#cbd5e1]">Humidity: {hoveredSensor.humidity}%</span>
            <span className="text-[#14b8a6]">Battery: {hoveredSensor.battery}%</span>
          </div>
        </div>
      )}

      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4 z-20">
        <div className="glass-panel rounded-2xl p-3.5 sm:p-4 flex flex-col gap-3 shadow-2xl border border-white/10 bg-[#0e1118]/95 backdrop-blur-md">
          <div className="flex justify-between items-center px-1">
            <span className="font-label-caps text-[11px] text-[#94a3b8] tracking-wider uppercase font-semibold">FORECAST HORIZON</span>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#14b8a6] animate-pulse" />
              <span className="font-data-point text-[12px] text-[#14b8a6] font-semibold">
                {forecastDayOffset === 0 ? 'Live Telemetry' : `${daysLabel[forecastDayOffset]} Forecast Model`}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={() => setIsPlayingForecast(!isPlayingForecast)} className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#14b8a6] text-[#00302b] flex items-center justify-center hover:bg-[#2dd4bf] transition-all shrink-0 shadow-[0_0_15px_rgba(20,184,166,0.35)] hover:scale-105" title={isPlayingForecast ? 'Pause Simulation' : 'Play 5-Day Forecast Loop'}>
              <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                {isPlayingForecast ? 'pause' : 'play_arrow'}
              </span>
            </button>

            <div className="flex-1 relative h-9 flex items-center">
              <div className="absolute w-full h-1.5 bg-[#262c3d] rounded-full overflow-hidden">
                <div className="h-full bg-[#14b8a6] transition-all duration-300" style={{ width: `${(forecastDayOffset / 4) * 100}%` }} />
              </div>

              <div className="absolute w-full flex justify-between px-1">
                {daysLabel.map((label, idx) => (
                  <button key={label} onClick={() => onForecastDayChange(idx)} className="flex flex-col items-center gap-1 group cursor-pointer focus:outline-none">
                    <div className={`w-1.5 h-3 rounded-full transition-colors ${idx <= forecastDayOffset ? 'bg-[#14b8a6]' : 'bg-[#4b5563]'} group-hover:bg-[#2dd4bf]`} />
                    <span className={`font-data-point text-[11px] transition-colors ${idx === forecastDayOffset ? 'text-[#14b8a6] font-bold' : 'text-[#94a3b8]'}`}>{label}</span>
                  </button>
                ))}
              </div>

              <div className="absolute w-4 h-4 bg-[#14b8a6] rounded-full shadow-[0_0_12px_#14b8a6] border-2 border-[#0b0d13] pointer-events-none -translate-x-1/2 transition-all duration-300" style={{ left: `${(forecastDayOffset / 4) * 100}%` }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

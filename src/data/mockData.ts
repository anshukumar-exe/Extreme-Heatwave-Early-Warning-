import { WardData, SensorNode, AlertItem, SystemLog, Region } from '../types';
import { ALL_INDIA_REGIONS } from './indiaRegions';

export const REGIONS: Region[] = ALL_INDIA_REGIONS;

export const INITIAL_WARDS: WardData[] = [
  {
    id: 'ward-7',
    name: 'Ward 7 - Industrial Hub',
    code: 'WARD-07',
    population: 42500,
    vulnerabilityIndex: 0.85,
    currentTemp: 36.2,
    humidity: 68,
    windSpeed: 11,
    shadeCoveragePercent: 9,
    heatIndex: 43.1,
    wbgt: 33.8,
    solarRadiation: 890,
    areaKm2: 14.2,
    elevationM: 540,
    exposedPopulation: {
      gigWorkers: 3200,
      dailyWageLaborers: 9400,
      elderlyPopulation: 4100,
      childrenAndStudents: 7800,
      streetVendors: 2400,
      totalExposed: 26900
    },
    status: 'critical',
    polygonPath: 'M 200 150 L 350 120 L 450 200 L 400 350 L 250 380 Z',
    center: { x: 320, y: 250 },
    geoCenter: [77.585, 12.975],
    coordinates: [
      [77.575, 12.985],
      [77.595, 12.988],
      [77.605, 12.978],
      [77.595, 12.962],
      [77.578, 12.965],
      [77.575, 12.985]
    ],
    thermalProfile24h: [
      { time: '00:00', temp: 28.0 },
      { time: '04:00', temp: 27.5 },
      { time: '08:00', temp: 30.0 },
      { time: '12:00', temp: 34.5 },
      { time: '16:00', temp: 37.2 },
      { time: '20:00', temp: 36.8 },
      { time: 'Now', temp: 36.2 }
    ],
    forecastTemps: {
      0: 36.2,
      1: 37.8,
      2: 38.5,
      3: 36.0,
      4: 33.4
    },
    recommendedProtocols: [
      {
        id: 'p-1',
        title: 'Dispatch Cooling Centers',
        description: 'Threshold exceeded for 4+ hours. Initiate Phase 2 deployment.',
        icon: 'campaign',
        severity: 'error',
        status: 'recommended',
        actionLabel: 'Deploy Phase 2'
      },
      {
        id: 'p-2',
        title: 'Grid Load Warning',
        description: 'Substation 4 operating at 92% capacity. Monitor for brownouts.',
        icon: 'power',
        severity: 'primary',
        status: 'recommended',
        actionLabel: 'Reroute Power'
      },
      {
        id: 'p-3',
        title: 'Hydration Station Deployment',
        description: 'Deploy 4 mobile misting & hydration trucks to central transit hub.',
        icon: 'water_drop',
        severity: 'secondary',
        status: 'recommended',
        actionLabel: 'Dispatch Vans'
      }
    ],
    activeSensorsCount: 28,
    coolingCentersOpen: 3,
    gridLoadPercent: 92
  },
  {
    id: 'ward-3',
    name: 'Ward 3 - Central Core',
    code: 'SEC-3C',
    population: 118200,
    vulnerabilityIndex: 0.72,
    currentTemp: 34.8,
    humidity: 62,
    windSpeed: 14,
    shadeCoveragePercent: 12,
    heatIndex: 40.5,
    wbgt: 32.4,
    solarRadiation: 840,
    areaKm2: 18.6,
    elevationM: 535,
    exposedPopulation: {
      gigWorkers: 8500,
      dailyWageLaborers: 14200,
      elderlyPopulation: 16400,
      childrenAndStudents: 22100,
      streetVendors: 7300,
      totalExposed: 68500
    },
    status: 'danger',
    polygonPath: 'M 450 200 L 600 180 L 650 300 L 550 400 L 400 350 Z',
    center: { x: 520, y: 280 },
    geoCenter: [77.605, 12.972],
    coordinates: [
      [77.595, 12.978],
      [77.618, 12.982],
      [77.625, 12.966],
      [77.612, 12.955],
      [77.595, 12.962],
      [77.595, 12.978]
    ],
    thermalProfile24h: [
      { time: '00:00', temp: 27.2 },
      { time: '04:00', temp: 26.8 },
      { time: '08:00', temp: 29.1 },
      { time: '12:00', temp: 33.2 },
      { time: '16:00', temp: 35.6 },
      { time: '20:00', temp: 35.1 },
      { time: 'Now', temp: 34.8 }
    ],
    forecastTemps: {
      0: 34.8,
      1: 36.1,
      2: 37.0,
      3: 35.2,
      4: 32.8
    },
    recommendedProtocols: [
      {
        id: 'p-4',
        title: 'Public Transit Misting Fans',
        description: 'Activate automated outdoor misting at Subway Station 1 & 4.',
        icon: 'air',
        severity: 'primary',
        status: 'recommended',
        actionLabel: 'Activate Misting'
      },
      {
        id: 'p-5',
        title: 'High-Density Outreach',
        description: 'Automated SMS broadcast to 24,000 residents in unconditioned housing.',
        icon: 'sms',
        severity: 'secondary',
        status: 'recommended',
        actionLabel: 'Send SMS Advisory'
      }
    ],
    activeSensorsCount: 34,
    coolingCentersOpen: 5,
    gridLoadPercent: 86
  },
  {
    id: 'ward-5',
    name: 'Ward 5 - Waterfront Green',
    code: 'SEC-5W',
    population: 68400,
    vulnerabilityIndex: 0.38,
    currentTemp: 29.5,
    humidity: 78,
    windSpeed: 21,
    shadeCoveragePercent: 36,
    heatIndex: 32.1,
    wbgt: 28.2,
    solarRadiation: 650,
    areaKm2: 22.1,
    elevationM: 520,
    exposedPopulation: {
      gigWorkers: 2100,
      dailyWageLaborers: 3200,
      elderlyPopulation: 8900,
      childrenAndStudents: 12400,
      streetVendors: 1600,
      totalExposed: 28200
    },
    status: 'normal',
    polygonPath: 'M 250 380 L 400 350 L 550 400 L 480 550 L 300 500 Z',
    center: { x: 420, y: 450 },
    geoCenter: [77.592, 12.955],
    coordinates: [
      [77.578, 12.965],
      [77.595, 12.962],
      [77.612, 12.955],
      [77.602, 12.938],
      [77.582, 12.942],
      [77.578, 12.965]
    ],
    thermalProfile24h: [
      { time: '00:00', temp: 24.1 },
      { time: '04:00', temp: 23.5 },
      { time: '08:00', temp: 25.8 },
      { time: '12:00', temp: 28.4 },
      { time: '16:00', temp: 30.2 },
      { time: '20:00', temp: 29.9 },
      { time: 'Now', temp: 29.5 }
    ],
    forecastTemps: {
      0: 29.5,
      1: 30.8,
      2: 31.5,
      3: 29.8,
      4: 28.0
    },
    recommendedProtocols: [
      {
        id: 'p-6',
        title: 'Park Shade Canopy Inspection',
        description: 'Verify emergency water refill fountains along the boardwalk.',
        icon: 'park',
        severity: 'secondary',
        status: 'recommended',
        actionLabel: 'Check Stations'
      }
    ],
    activeSensorsCount: 22,
    coolingCentersOpen: 2,
    gridLoadPercent: 54
  },
  {
    id: 'ward-12',
    name: 'Ward 12 - West Heights',
    code: 'SEC-12W',
    population: 89000,
    vulnerabilityIndex: 0.64,
    currentTemp: 32.1,
    humidity: 55,
    windSpeed: 16,
    shadeCoveragePercent: 19,
    heatIndex: 35.8,
    wbgt: 30.1,
    solarRadiation: 780,
    areaKm2: 16.8,
    elevationM: 565,
    exposedPopulation: {
      gigWorkers: 4300,
      dailyWageLaborers: 8200,
      elderlyPopulation: 11400,
      childrenAndStudents: 15300,
      streetVendors: 3100,
      totalExposed: 42300
    },
    status: 'warning',
    polygonPath: 'M 80 220 L 200 150 L 250 380 L 150 420 L 60 330 Z',
    center: { x: 150, y: 280 },
    geoCenter: [77.562, 12.970],
    coordinates: [
      [77.550, 12.978],
      [77.575, 12.985],
      [77.578, 12.965],
      [77.565, 12.952],
      [77.548, 12.960],
      [77.550, 12.978]
    ],
    thermalProfile24h: [
      { time: '00:00', temp: 25.5 },
      { time: '04:00', temp: 25.0 },
      { time: '08:00', temp: 27.8 },
      { time: '12:00', temp: 31.0 },
      { time: '16:00', temp: 33.4 },
      { time: '20:00', temp: 32.8 },
      { time: 'Now', temp: 32.1 }
    ],
    forecastTemps: {
      0: 32.1,
      1: 33.9,
      2: 34.6,
      3: 33.0,
      4: 30.5
    },
    recommendedProtocols: [
      {
        id: 'p-7',
        title: 'Elder Care Facility Health Check',
        description: 'Dispatch volunteer teams to verify backup AC units in senior homes.',
        icon: 'medical_services',
        severity: 'warning',
        status: 'recommended',
        actionLabel: 'Mobilize Volunteers'
      }
    ],
    activeSensorsCount: 30,
    coolingCentersOpen: 4,
    gridLoadPercent: 74
  },
  {
    id: 'ward-9',
    name: 'Ward 9 - Logistics Corridor',
    code: 'SEC-9L',
    population: 53100,
    vulnerabilityIndex: 0.81,
    currentTemp: 35.6,
    humidity: 64,
    windSpeed: 10,
    shadeCoveragePercent: 8,
    heatIndex: 42.0,
    wbgt: 33.2,
    solarRadiation: 910,
    areaKm2: 19.5,
    elevationM: 530,
    exposedPopulation: {
      gigWorkers: 6100,
      dailyWageLaborers: 12800,
      elderlyPopulation: 5200,
      childrenAndStudents: 8900,
      streetVendors: 4200,
      totalExposed: 37200
    },
    status: 'danger',
    polygonPath: 'M 600 180 L 740 210 L 780 360 L 650 300 Z',
    center: { x: 680, y: 260 },
    geoCenter: [77.625, 12.975],
    coordinates: [
      [77.618, 12.982],
      [77.640, 12.985],
      [77.648, 12.965],
      [77.625, 12.966],
      [77.618, 12.982]
    ],
    thermalProfile24h: [
      { time: '00:00', temp: 27.9 },
      { time: '04:00', temp: 27.2 },
      { time: '08:00', temp: 30.4 },
      { time: '12:00', temp: 34.8 },
      { time: '16:00', temp: 36.9 },
      { time: '20:00', temp: 36.1 },
      { time: 'Now', temp: 35.6 }
    ],
    forecastTemps: {
      0: 35.6,
      1: 37.1,
      2: 37.9,
      3: 35.8,
      4: 33.0
    },
    recommendedProtocols: [
      {
        id: 'p-8',
        title: 'Outdoor Worker Mandatory Rest',
        description: 'Issue NDMA / State Labour Dept emergency heat stress advisory for freight terminals.',
        icon: 'engineering',
        severity: 'error',
        status: 'recommended',
        actionLabel: 'Issue Notice'
      }
    ],
    activeSensorsCount: 26,
    coolingCentersOpen: 2,
    gridLoadPercent: 88
  }
];

export const SENSOR_NODES: SensorNode[] = [
  {
    id: 'sns-01',
    code: 'S-W07-01',
    wardId: 'ward-7',
    name: 'Ward 7 Sensor Node A',
    x: 320,
    y: 250,
    temp: 36.2,
    humidity: 68,
    battery: 94,
    status: 'alert',
    lastPing: '12s ago'
  },
  {
    id: 'sns-02',
    code: 'S-W07-02',
    wardId: 'ward-7',
    name: 'Ward 7 Industrial Freight Corridor',
    x: 270,
    y: 290,
    temp: 37.1,
    humidity: 65,
    battery: 88,
    status: 'alert',
    lastPing: '45s ago'
  },
  {
    id: 'sns-03',
    code: 'S-3C-01',
    wardId: 'ward-3',
    name: 'Central Plaza Micro-station',
    x: 520,
    y: 280,
    temp: 34.8,
    humidity: 62,
    battery: 99,
    status: 'warning',
    lastPing: '5s ago'
  },
  {
    id: 'sns-04',
    code: 'S-5W-01',
    wardId: 'ward-5',
    name: 'Waterfront Marine Buoy 3',
    x: 420,
    y: 450,
    temp: 29.5,
    humidity: 78,
    battery: 92,
    status: 'active',
    lastPing: '2s ago'
  },
  {
    id: 'sns-05',
    code: 'S-12W-01',
    wardId: 'ward-12',
    name: 'West Hill Meteorological Mast',
    x: 150,
    y: 280,
    temp: 32.1,
    humidity: 55,
    battery: 83,
    status: 'warning',
    lastPing: '30s ago'
  },
  {
    id: 'sns-06',
    code: 'S-9L-01',
    wardId: 'ward-9',
    name: 'Logistics Depot South Tower',
    x: 680,
    y: 260,
    temp: 35.6,
    humidity: 64,
    battery: 91,
    status: 'alert',
    lastPing: '18s ago'
  }
];

export const INITIAL_ALERTS: AlertItem[] = [
  {
    id: 'alt-01',
    title: 'Extreme Heat Spike (+4.2°C Delta)',
    sector: 'Ward 7 - Industrial Sector',
    wardId: 'ward-7',
    severity: 'critical',
    timestamp: '2 mins ago',
    description: 'Temperature threshold exceeded 36.0°C for > 180 consecutive minutes.',
    metrics: { temp: 36.2, threshold: 35.0, recipients: 14203 },
    acknowledged: false,
    resolved: false
  },
  {
    id: 'alt-02',
    title: 'Substation 4 Grid Stress: 92%',
    sector: 'Ward 7 & Ward 9 Boundary',
    wardId: 'ward-7',
    severity: 'critical',
    timestamp: '8 mins ago',
    description: 'Transformer core temperature approaching maximum continuous load limits.',
    acknowledged: false,
    resolved: false
  },
  {
    id: 'alt-03',
    title: 'Wet Bulb Globe Temp Threat',
    sector: 'Ward 3 - Central Core',
    wardId: 'ward-3',
    severity: 'danger',
    timestamp: '14 mins ago',
    description: 'WBGT reached 31.8°C. Dangerous conditions for outdoor human activity.',
    metrics: { temp: 34.8, threshold: 31.0, recipients: 24500 },
    acknowledged: true,
    resolved: false
  },
  {
    id: 'alt-04',
    title: 'Automated SMS Advisory Dispatched',
    sector: 'Ward 7 Municipal Sector',
    wardId: 'ward-7',
    severity: 'warning',
    timestamp: '21 mins ago',
    description: '14,203 recipients notified of designated air-conditioned shelter locations.',
    metrics: { recipients: 14203 },
    acknowledged: true,
    resolved: false
  },
  {
    id: 'alt-05',
    title: 'Senior Living Facility AC Failure Alert',
    sector: 'Ward 12 - West Heights',
    wardId: 'ward-12',
    severity: 'critical',
    timestamp: '32 mins ago',
    description: 'Auxiliary chiller unit reported tripped breaker at St. Jude Care Center.',
    acknowledged: true,
    resolved: false
  },
  {
    id: 'alt-06',
    title: 'Forecast Trajectory +72h Peak: 44.5°C',
    sector: 'Ahmedabad Urban Zone (All Wards)',
    severity: 'danger',
    timestamp: '45 mins ago',
    description: 'IMD heatwave advisory indicates severe dry heat across north-western plains.',
    acknowledged: true,
    resolved: false
  },
  {
    id: 'alt-07',
    title: 'Cooling Center #4 at 88% Capacity',
    sector: 'Ward 3 - Central Core Community Hall',
    wardId: 'ward-3',
    severity: 'warning',
    timestamp: '52 mins ago',
    description: 'Recommending overflow diversion to East Municipal School Gymnasium.',
    acknowledged: true,
    resolved: false
  },
  {
    id: 'alt-08',
    title: 'Freight Terminal Heat Stress Protocol',
    sector: 'Ward 9 - Logistics Corridor',
    wardId: 'ward-9',
    severity: 'warning',
    timestamp: '1h 10m ago',
    description: 'Tarmac surface temps measured at 52.4°C. Mandating 15-min rest cycles.',
    acknowledged: true,
    resolved: false
  },
  {
    id: 'alt-09',
    title: 'Metro Rail Track Thermal Expansion Alert',
    sector: 'Urban Metro Corridor North',
    severity: 'warning',
    timestamp: '1h 25m ago',
    description: 'Speed restrictions implemented between KM 14 and KM 22.',
    acknowledged: true,
    resolved: false
  },
  {
    id: 'alt-10',
    title: 'Sensor Node S-12W-01 Battery 83%',
    sector: 'Ward 12 - West Heights',
    wardId: 'ward-12',
    severity: 'info',
    timestamp: '1h 40m ago',
    description: 'Telemetry nominal, solar recharge operational.',
    acknowledged: true,
    resolved: true
  },
  {
    id: 'alt-11',
    title: 'Water Pressure Drop at Hydrant Zone 8',
    sector: 'Ward 7 - Industrial',
    wardId: 'ward-7',
    severity: 'warning',
    timestamp: '2h 05m ago',
    description: 'Municipal utility booster pump engaged.',
    acknowledged: true,
    resolved: true
  },
  {
    id: 'alt-12',
    title: 'Thermal Boundary Layer Inversion',
    sector: 'Metro Region Alpha',
    severity: 'info',
    timestamp: '2h 30m ago',
    description: 'Atmospheric LiDAR confirms heat trapping under 400m altitude layer.',
    acknowledged: true,
    resolved: true
  }
];

export const INITIAL_LOGS: SystemLog[] = [
  {
    id: 'log-101',
    timestamp: '2026-08-29 22:20:14',
    level: 'ACTION',
    operator: 'Commander R. Vance (ID: TR-NDMA-772)',
    wardId: 'ward-7',
    action: 'Dispatched Emergency Cooling Protocol',
    details: 'Initiated Phase 2 cooling center activation in Ward 7 - Industrial sector.'
  },
  {
    id: 'log-102',
    timestamp: '2026-08-29 22:15:02',
    level: 'CRITICAL',
    operator: 'System Automator',
    wardId: 'ward-7',
    action: 'Automated Threshold Alert Breached',
    details: 'Ward 7 temperature crossed 36.0°C danger margin. SMS advisories pre-staged.'
  },
  {
    id: 'log-103',
    timestamp: '2026-08-29 22:04:30',
    level: 'ACTION',
    operator: 'Commander R. Vance (ID: TR-NDMA-772)',
    wardId: 'ward-3',
    action: 'Misting System Remote Engagement',
    details: 'Triggered 12 high-efficiency fine mist arrays at Central Subway Terminus.'
  },
  {
    id: 'log-104',
    timestamp: '2026-08-29 21:50:11',
    level: 'WARN',
    operator: 'Grid Analytics Daemon',
    wardId: 'ward-7',
    action: 'Substation 4 Load Exceeded 90%',
    details: 'Total demand 342 MW against rated capacity 370 MW. Power shedding requested.'
  },
  {
    id: 'log-105',
    timestamp: '2026-08-29 21:30:00',
    level: 'INFO',
    operator: 'Forecast Service Sync',
    action: 'Synchronized 72h Weather Trajectory Model',
    details: 'Updated ensemble forecast confidence to 94% using ECMWF and regional mesonet data.'
  }
];

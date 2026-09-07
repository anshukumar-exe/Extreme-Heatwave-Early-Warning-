export type ViewMode = 
  | 'landing' 
  | 'auth' 
  | 'dashboard'
  | 'map' 
  | 'forecast' 
  | 'thermal_stress' 
  | 'heatwave' 
  | 'history' 
  | 'analytics' 
  | 'uhi' 
  | 'vulnerability' 
  | 'infrastructure' 
  | 'alerts' 
  | 'datasources' 
  | 'admin' 
  | 'settings' 
  | 'logs';

export interface InfrastructureItem {
  id: string;
  name: string;
  type: 'HOSPITAL' | 'COOLING_CENTRE' | 'WATER_POINT' | 'FIRE_STATION' | 'COMMUNITY_SHELTER';
  address: string;
  wardId: string;
  distanceKm: number;
  capacity: number;
  currentOccupancy: number;
  status: 'OPERATIONAL' | 'FULL' | 'STANDBY' | 'MAINTENANCE';
  availableServices: string[];
  contactNumber: string;
  hasBackupPower: boolean;
  hasMedicalStaff: boolean;
  hasChilledWater: boolean;
  coordinates: [number, number]; // [lng, lat]
}

export interface HistoricalHeatwaveEvent {
  id: string;
  locationName: string;
  state: string;
  startDate: string;
  endDate: string;
  durationDays: number;
  peakMaxTempC: number;
  peakWbgtC: number;
  peakUtciC: number;
  peakHeatIndexC: number;
  anomalyDeltaC: number;
  severity: 'EXTREME' | 'SEVERE' | 'MODERATE';
  officialClassification: string;
  reportedImpacts: string;
}

export interface DataSourceItem {
  id: string;
  name: string;
  agency: string;
  dataset: string;
  variables: string[];
  coverage: string;
  updateCadence: string;
  latencySeconds: number;
  status: 'ONLINE' | 'DEGRADED' | 'STANDBY';
  lastIngested: string;
  dataQualityScore: number;
  apiEndpoint: string;
}

export interface AirQualityData {
  aqi: number;
  pm25: number;
  pm10: number;
  o3: number;
  no2: number;
  so2: number;
  co: number;
  category: 'GOOD' | 'MODERATE' | 'POOR' | 'VERY_POOR' | 'SEVERE';
  combinedHeatAirRisk: 'MODERATE' | 'HIGH' | 'VERY_HIGH' | 'CRITICAL';
}

export type AlertSeverity = 'critical' | 'danger' | 'warning' | 'info';

export interface DayForecast {
  dayIndex: number;
  dateStr: string;
  dayName: string;
  maxTemp: number;
  minTemp: number;
  apparentMaxTemp: number;
  humidity: number;
  uvIndex: number;
  windSpeed: number;
  wbgt: number;
  hazardLevel: 'RED ALERT' | 'ORANGE ALERT' | 'YELLOW ALERT' | 'NORMAL';
  hazardColor: string;
  condition: string;
  icon: string;
  anomalyDelta: number; // e.g. +4.2°C above normal
  peakTimeRange: string; // e.g. "13:00 - 16:30 IST"
  hourly: HourlyForecastPoint[];
  advisories: string[];
}

export interface HourlyForecastPoint {
  time: string;
  hour: number;
  temp: number;
  apparentTemp: number;
  humidity: number;
  uv: number;
  wbgt: number;
  isPeakHazard: boolean;
}

export interface WardExposedPopulation {
  gigWorkers: number; // Delivery riders (Swiggy, Zomato, Blinkit, Zepto, logistics)
  dailyWageLaborers: number; // Construction, masonry, loaders, roadside manual laborers
  elderlyPopulation: number; // Senior citizens aged 60+
  childrenAndStudents: number; // Children under 14 & outdoor students
  streetVendors: number; // Hawkers, cart sellers, informal kiosk vendors
  totalExposed: number;
  elderlyAbove65?: number;
  childrenUnder5?: number;
  informalSettlementPop?: number;
}

export interface WardData {
  id: string;
  name: string;
  code: string;
  population: number;
  vulnerabilityIndex: number; // 0.0 to 1.0
  currentTemp: number;
  humidity: number;
  windSpeed: number; // in km/h
  shadeCoveragePercent: number; // % area covered in shade canopy / shelters
  heatIndex: number;
  wbgt?: number; // Wet Bulb Globe Temp in °C
  solarRadiation?: number; // in W/m²
  areaKm2?: number;
  elevationM?: number;
  exposedPopulation: WardExposedPopulation;
  status: 'critical' | 'danger' | 'warning' | 'normal';
  polygonPath: string; // SVG path fallback
  coordinates?: [number, number][]; // GeoJSON [lng, lat] polygon boundary
  geoCenter?: [number, number]; // [lng, lat]
  center: { x: number; y: number };
  thermalProfile24h: { time: string; temp: number }[];
  forecastTemps: { [dayOffset: number]: number };
  recommendedProtocols: ProtocolItem[];
  activeSensorsCount: number;
  coolingCentersOpen: number;
  gridLoadPercent: number;
}

export interface ProtocolItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  severity: 'error' | 'warning' | 'primary' | 'secondary';
  status: 'recommended' | 'in-progress' | 'deployed' | 'dismissed';
  actionLabel?: string;
  deployedTime?: string;
}

export interface SensorNode {
  id: string;
  code: string;
  wardId: string;
  name: string;
  x: number;
  y: number;
  temp: number;
  humidity: number;
  battery: number;
  status: 'active' | 'warning' | 'alert';
  lastPing: string;
}

export interface AlertItem {
  id: string;
  title: string;
  sector: string;
  wardId?: string;
  severity: AlertSeverity;
  timestamp: string;
  description: string;
  metrics?: { temp?: number; threshold?: number; recipients?: number };
  acknowledged: boolean;
  resolved: boolean;
}

export interface SystemLog {
  id: string;
  timestamp: string;
  level: 'CRITICAL' | 'WARN' | 'INFO' | 'ACTION';
  operator: string;
  wardId?: string;
  action: string;
  details: string;
}

export interface Region {
  id: string;
  name: string;
  state: string;
  district?: string;
  zone: 'North' | 'South' | 'West' | 'East' | 'Central' | 'North-East';
  lat: number;
  lng: number;
  hazardLevel: string;
  hazardLevelCode: number; // 1: Normal, 2: Yellow, 3: Orange, 4: Red
  sensorCount: number;
  totalPopulation: number;
  averageTemp: number;
  humidity?: number;
  wbgtIndex?: number;
  imdZone?: string;
}

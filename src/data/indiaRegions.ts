import { Region, WardData, SensorNode, AlertItem } from '../types';

export const ALL_INDIA_REGIONS: Region[] = [
  // --- GUJARAT & WESTERN PLAINS ---
  {
    id: 'in-ahmedabad',
    name: 'Ahmedabad (AMC Heat Action Plan)',
    state: 'Gujarat',
    district: 'Ahmedabad',
    zone: 'West',
    lat: 23.0225,
    lng: 72.5714,
    hazardLevel: 'IMD RED ALERT: SEVERE HEATWAVE',
    hazardLevelCode: 4,
    sensorCount: 168,
    totalPopulation: 5570000,
    averageTemp: 44.2,
    humidity: 42,
    wbgtIndex: 34.5,
    imdZone: 'Saurashtra & Kutch - Western Plains'
  },
  {
    id: 'in-surat',
    name: 'Surat Municipal Zone',
    state: 'Gujarat',
    district: 'Surat',
    zone: 'West',
    lat: 21.1702,
    lng: 72.8311,
    hazardLevel: 'IMD ORANGE ALERT: HIGH HEAT INDEX',
    hazardLevelCode: 3,
    sensorCount: 120,
    totalPopulation: 4467000,
    averageTemp: 39.8,
    humidity: 68,
    wbgtIndex: 33.8,
    imdZone: 'Gujarat Coastal Basin'
  },
  {
    id: 'in-rajkot',
    name: 'Rajkot & Saurashtra Urban',
    state: 'Gujarat',
    district: 'Rajkot',
    zone: 'West',
    lat: 22.3039,
    lng: 70.8022,
    hazardLevel: 'IMD RED ALERT: EXTREME HEAT',
    hazardLevelCode: 4,
    sensorCount: 94,
    totalPopulation: 1390000,
    averageTemp: 43.8,
    humidity: 38,
    wbgtIndex: 33.2,
    imdZone: 'Saurashtra Plateau'
  },

  // --- DELHI NCR & NORTHERN PLAINS ---
  {
    id: 'in-delhi-ncr',
    name: 'Delhi NCR Heat Action Zone',
    state: 'Delhi (NCT)',
    district: 'National Capital Region',
    zone: 'North',
    lat: 28.6139,
    lng: 77.2090,
    hazardLevel: 'IMD RED ALERT: SEVERE HEATWAVE',
    hazardLevelCode: 4,
    sensorCount: 210,
    totalPopulation: 16780000,
    averageTemp: 45.1,
    humidity: 34,
    wbgtIndex: 35.2,
    imdZone: 'North-West Indo-Gangetic Plains'
  },
  {
    id: 'in-noida-ghaziabad',
    name: 'Noida - Ghaziabad Corridor',
    state: 'Uttar Pradesh',
    district: 'Gautam Buddha Nagar',
    zone: 'North',
    lat: 28.5355,
    lng: 77.3910,
    hazardLevel: 'IMD ORANGE ALERT: SEVERE ADVISORY',
    hazardLevelCode: 3,
    sensorCount: 115,
    totalPopulation: 2360000,
    averageTemp: 43.6,
    humidity: 36,
    wbgtIndex: 34.0,
    imdZone: 'Upper Doab'
  },
  {
    id: 'in-gurugram',
    name: 'Gurugram & Manesar Industrial',
    state: 'Haryana',
    district: 'Gurugram',
    zone: 'North',
    lat: 28.4595,
    lng: 77.0266,
    hazardLevel: 'IMD RED ALERT: EXTREME HEAT',
    hazardLevelCode: 4,
    sensorCount: 132,
    totalPopulation: 1514000,
    averageTemp: 44.5,
    humidity: 31,
    wbgtIndex: 34.2,
    imdZone: 'Haryana Southern Plains'
  },

  // --- MAHARASHTRA & CENTRAL DECCAN ---
  {
    id: 'in-mumbai',
    name: 'Mumbai Metropolitan & Coastal Core',
    state: 'Maharashtra',
    district: 'Mumbai City & Suburban',
    zone: 'West',
    lat: 18.9220,
    lng: 72.8347,
    hazardLevel: 'IMD ORANGE ALERT: HUMID HEAT STRESS',
    hazardLevelCode: 3,
    sensorCount: 184,
    totalPopulation: 12440000,
    averageTemp: 37.4,
    humidity: 78,
    wbgtIndex: 35.8,
    imdZone: 'Konkan Coastal Zone'
  },
  {
    id: 'in-pune',
    name: 'Pune Smart City Heat Grid',
    state: 'Maharashtra',
    district: 'Pune',
    zone: 'West',
    lat: 18.5204,
    lng: 73.8567,
    hazardLevel: 'IMD YELLOW ALERT: ELEVATED INDEX',
    hazardLevelCode: 2,
    sensorCount: 140,
    totalPopulation: 3124000,
    averageTemp: 38.6,
    humidity: 52,
    wbgtIndex: 32.4,
    imdZone: 'Madhya Maharashtra'
  },
  {
    id: 'in-nagpur',
    name: 'Vidarbha - Nagpur Inland Division',
    state: 'Maharashtra',
    district: 'Nagpur',
    zone: 'Central',
    lat: 21.1458,
    lng: 79.0882,
    hazardLevel: 'IMD RED ALERT: EXTREME HEATWAVE',
    hazardLevelCode: 4,
    sensorCount: 128,
    totalPopulation: 2405000,
    averageTemp: 46.2,
    humidity: 28,
    wbgtIndex: 34.8,
    imdZone: 'Vidarbha Inland Basin'
  },

  // --- RAJASTHAN DESERT & ARID ZONE ---
  {
    id: 'in-jaipur',
    name: 'Jaipur Heritage & Urban Basin',
    state: 'Rajasthan',
    district: 'Jaipur',
    zone: 'North',
    lat: 26.9124,
    lng: 75.7873,
    hazardLevel: 'IMD RED ALERT: SEVERE HEATWAVE',
    hazardLevelCode: 4,
    sensorCount: 145,
    totalPopulation: 3046000,
    averageTemp: 44.9,
    humidity: 26,
    wbgtIndex: 33.6,
    imdZone: 'East Rajasthan Dry Zone'
  },
  {
    id: 'in-jodhpur',
    name: 'Jodhpur Marwar Arid Division',
    state: 'Rajasthan',
    district: 'Jodhpur',
    zone: 'North',
    lat: 26.2389,
    lng: 73.0243,
    hazardLevel: 'IMD RED ALERT: CRITICAL ARID HEAT',
    hazardLevelCode: 4,
    sensorCount: 88,
    totalPopulation: 1033000,
    averageTemp: 46.8,
    humidity: 20,
    wbgtIndex: 34.1,
    imdZone: 'Thar Desert Fringe'
  },
  {
    id: 'in-kota',
    name: 'Kota Chambal Industrial Basin',
    state: 'Rajasthan',
    district: 'Kota',
    zone: 'North',
    lat: 25.1825,
    lng: 75.8398,
    hazardLevel: 'IMD RED ALERT: EXTREME HEAT',
    hazardLevelCode: 4,
    sensorCount: 76,
    totalPopulation: 1001000,
    averageTemp: 45.4,
    humidity: 29,
    wbgtIndex: 34.2,
    imdZone: 'Hadoti Region'
  },

  // --- TELANGANA & ANDHRA PRADESH ---
  {
    id: 'in-hyderabad',
    name: 'Hyderabad GHMC Heat Resilience Grid',
    state: 'Telangana',
    district: 'Hyderabad',
    zone: 'South',
    lat: 17.3850,
    lng: 78.4867,
    hazardLevel: 'IMD ORANGE ALERT: HIGH HEAT INDEX',
    hazardLevelCode: 3,
    sensorCount: 175,
    totalPopulation: 6809000,
    averageTemp: 41.5,
    humidity: 48,
    wbgtIndex: 33.9,
    imdZone: 'Telangana Deccan Plateau'
  },
  {
    id: 'in-visakhapatnam',
    name: 'Visakhapatnam GVMC Coastal Port',
    state: 'Andhra Pradesh',
    district: 'Visakhapatnam',
    zone: 'South',
    lat: 17.6868,
    lng: 83.2185,
    hazardLevel: 'IMD ORANGE ALERT: HUMID HEAT ADVISORY',
    hazardLevelCode: 3,
    sensorCount: 110,
    totalPopulation: 1728000,
    averageTemp: 38.2,
    humidity: 79,
    wbgtIndex: 35.6,
    imdZone: 'Coastal Andhra Pradesh'
  },
  {
    id: 'in-vijayawada',
    name: 'Vijayawada - Amaravati Division',
    state: 'Andhra Pradesh',
    district: 'NTR / Krishna',
    zone: 'South',
    lat: 16.5062,
    lng: 80.6480,
    hazardLevel: 'IMD RED ALERT: SEVERE HEATWAVE',
    hazardLevelCode: 4,
    sensorCount: 95,
    totalPopulation: 1048000,
    averageTemp: 44.6,
    humidity: 58,
    wbgtIndex: 36.4,
    imdZone: 'Krishna Delta Basin'
  },

  // --- KARNATAKA & TAMIL NADU & KERALA ---
  {
    id: 'in-bengaluru',
    name: 'Bengaluru BBMP Urban Heat Island Grid',
    state: 'Karnataka',
    district: 'Bengaluru Urban',
    zone: 'South',
    lat: 12.9716,
    lng: 77.5946,
    hazardLevel: 'IMD YELLOW ALERT: MODERATE MONITORING',
    hazardLevelCode: 2,
    sensorCount: 195,
    totalPopulation: 8443000,
    averageTemp: 34.2,
    humidity: 55,
    wbgtIndex: 30.8,
    imdZone: 'South Interior Karnataka'
  },
  {
    id: 'in-chennai',
    name: 'Chennai Greater Corporation Coastal',
    state: 'Tamil Nadu',
    district: 'Chennai',
    zone: 'South',
    lat: 13.0827,
    lng: 80.2707,
    hazardLevel: 'IMD ORANGE ALERT: SEVERE HUMID HEAT',
    hazardLevelCode: 3,
    sensorCount: 162,
    totalPopulation: 7088000,
    averageTemp: 39.5,
    humidity: 82,
    wbgtIndex: 36.9,
    imdZone: 'North Coastal Tamil Nadu'
  },
  {
    id: 'in-coimbatore',
    name: 'Coimbatore Kongu Heat Action Grid',
    state: 'Tamil Nadu',
    district: 'Coimbatore',
    zone: 'South',
    lat: 11.0168,
    lng: 76.9558,
    hazardLevel: 'IMD YELLOW ALERT: ELEVATED TEMP',
    hazardLevelCode: 2,
    sensorCount: 88,
    totalPopulation: 1601000,
    averageTemp: 36.0,
    humidity: 60,
    wbgtIndex: 31.8,
    imdZone: 'Western Ghats Rainshadow'
  },
  {
    id: 'in-kochi',
    name: 'Kochi & Ernakulam Coastal Division',
    state: 'Kerala',
    district: 'Ernakulam',
    zone: 'South',
    lat: 9.9312,
    lng: 76.2673,
    hazardLevel: 'IMD YELLOW ALERT: HUMID HEAT INDEX',
    hazardLevelCode: 2,
    sensorCount: 78,
    totalPopulation: 677000,
    averageTemp: 34.5,
    humidity: 86,
    wbgtIndex: 34.0,
    imdZone: 'Kerala Coastal Plain'
  },

  // --- UTTAR PRADESH & BIHAR & JHARKHAND ---
  {
    id: 'in-lucknow',
    name: 'Lucknow Municipal Heat Action Zone',
    state: 'Uttar Pradesh',
    district: 'Lucknow',
    zone: 'North',
    lat: 26.8467,
    lng: 80.9462,
    hazardLevel: 'IMD RED ALERT: SEVERE HEATWAVE',
    hazardLevelCode: 4,
    sensorCount: 154,
    totalPopulation: 2817000,
    averageTemp: 44.4,
    humidity: 39,
    wbgtIndex: 34.9,
    imdZone: 'Central Uttar Pradesh'
  },
  {
    id: 'in-kanpur',
    name: 'Kanpur Industrial & Urban Division',
    state: 'Uttar Pradesh',
    district: 'Kanpur Nagar',
    zone: 'North',
    lat: 26.4499,
    lng: 80.3319,
    hazardLevel: 'IMD RED ALERT: EXTREME HEAT',
    hazardLevelCode: 4,
    sensorCount: 126,
    totalPopulation: 2765000,
    averageTemp: 45.0,
    humidity: 35,
    wbgtIndex: 35.0,
    imdZone: 'Ganga-Yamuna Doab'
  },
  {
    id: 'in-varanasi',
    name: 'Varanasi Smart City Heat Action Grid',
    state: 'Uttar Pradesh',
    district: 'Varanasi',
    zone: 'North',
    lat: 25.3176,
    lng: 82.9739,
    hazardLevel: 'IMD RED ALERT: SEVERE HEAT',
    hazardLevelCode: 4,
    sensorCount: 104,
    totalPopulation: 1198000,
    averageTemp: 44.8,
    humidity: 41,
    wbgtIndex: 35.3,
    imdZone: 'East Uttar Pradesh Plains'
  },
  {
    id: 'in-patna',
    name: 'Patna Municipal Heat Grid',
    state: 'Bihar',
    district: 'Patna',
    zone: 'East',
    lat: 25.5941,
    lng: 85.1376,
    hazardLevel: 'IMD RED ALERT: SEVERE HEATWAVE',
    hazardLevelCode: 4,
    sensorCount: 118,
    totalPopulation: 1684000,
    averageTemp: 44.1,
    humidity: 46,
    wbgtIndex: 35.5,
    imdZone: 'Bihar Gangetic Basin'
  },
  {
    id: 'in-ranchi',
    name: 'Ranchi Plateau Heat Action Zone',
    state: 'Jharkhand',
    district: 'Ranchi',
    zone: 'East',
    lat: 23.3441,
    lng: 85.3096,
    hazardLevel: 'IMD ORANGE ALERT: ELEVATED HEAT',
    hazardLevelCode: 3,
    sensorCount: 78,
    totalPopulation: 1073000,
    averageTemp: 40.2,
    humidity: 38,
    wbgtIndex: 32.6,
    imdZone: 'Chota Nagpur Plateau'
  },

  // --- WEST BENGAL & ODISHA ---
  {
    id: 'in-kolkata',
    name: 'Kolkata KMC Urban Heat Division',
    state: 'West Bengal',
    district: 'Kolkata',
    zone: 'East',
    lat: 22.5726,
    lng: 88.3639,
    hazardLevel: 'IMD ORANGE ALERT: CRITICAL HUMID HEAT',
    hazardLevelCode: 3,
    sensorCount: 170,
    totalPopulation: 4496000,
    averageTemp: 39.2,
    humidity: 84,
    wbgtIndex: 37.1,
    imdZone: 'Gangetic West Bengal'
  },
  {
    id: 'in-bhubaneswar',
    name: 'Bhubaneswar BMC Heat Resilience Plan',
    state: 'Odisha',
    district: 'Khurda',
    zone: 'East',
    lat: 20.2961,
    lng: 85.8245,
    hazardLevel: 'IMD RED ALERT: SEVERE HEATWAVE',
    hazardLevelCode: 4,
    sensorCount: 96,
    totalPopulation: 837000,
    averageTemp: 43.8,
    humidity: 65,
    wbgtIndex: 36.8,
    imdZone: 'Coastal Odisha'
  },

  // --- MADHYA PRADESH & CHHATTISGARH ---
  {
    id: 'in-bhopal',
    name: 'Bhopal BMC Urban Heat Grid',
    state: 'Madhya Pradesh',
    district: 'Bhopal',
    zone: 'Central',
    lat: 23.2599,
    lng: 77.4126,
    hazardLevel: 'IMD RED ALERT: SEVERE HEAT',
    hazardLevelCode: 4,
    sensorCount: 112,
    totalPopulation: 1798000,
    averageTemp: 44.0,
    humidity: 30,
    wbgtIndex: 33.8,
    imdZone: 'West Madhya Pradesh'
  },
  {
    id: 'in-indore',
    name: 'Indore IMC Clean & Resilient Heat Grid',
    state: 'Madhya Pradesh',
    district: 'Indore',
    zone: 'Central',
    lat: 22.7196,
    lng: 75.8577,
    hazardLevel: 'IMD ORANGE ALERT: HEAT ADVISORY',
    hazardLevelCode: 3,
    sensorCount: 130,
    totalPopulation: 1964000,
    averageTemp: 42.5,
    humidity: 33,
    wbgtIndex: 33.1,
    imdZone: 'Malwa Plateau'
  },
  {
    id: 'in-raipur',
    name: 'Raipur RMC Mahanadi Basin',
    state: 'Chhattisgarh',
    district: 'Raipur',
    zone: 'Central',
    lat: 21.2514,
    lng: 81.6296,
    hazardLevel: 'IMD RED ALERT: EXTREME HEAT',
    hazardLevelCode: 4,
    sensorCount: 88,
    totalPopulation: 1010000,
    averageTemp: 44.7,
    humidity: 36,
    wbgtIndex: 34.6,
    imdZone: 'Chhattisgarh Plains'
  },

  // --- PUNJAB & HARYANA & CHANDIGARH ---
  {
    id: 'in-chandigarh',
    name: 'Chandigarh UT Heat Monitoring Grid',
    state: 'Chandigarh (UT)',
    district: 'Chandigarh',
    zone: 'North',
    lat: 30.7333,
    lng: 76.7794,
    hazardLevel: 'IMD ORANGE ALERT: SEVERE HEAT',
    hazardLevelCode: 3,
    sensorCount: 92,
    totalPopulation: 1055000,
    averageTemp: 43.1,
    humidity: 35,
    wbgtIndex: 33.7,
    imdZone: 'Punjab & Haryana Plains'
  },
  {
    id: 'in-ludhiana',
    name: 'Ludhiana Industrial Heat Sector',
    state: 'Punjab',
    district: 'Ludhiana',
    zone: 'North',
    lat: 30.9010,
    lng: 75.8573,
    hazardLevel: 'IMD RED ALERT: SEVERE HEATWAVE',
    hazardLevelCode: 4,
    sensorCount: 84,
    totalPopulation: 1618000,
    averageTemp: 44.3,
    humidity: 37,
    wbgtIndex: 34.2,
    imdZone: 'Central Punjab'
  },

  // --- NORTH-EAST & HIMALAYAN REGIONS ---
  {
    id: 'in-guwahati',
    name: 'Guwahati GMC Brahmaputra Valley',
    state: 'Assam',
    district: 'Kamrup Metropolitan',
    zone: 'North-East',
    lat: 26.1445,
    lng: 91.7362,
    hazardLevel: 'IMD YELLOW ALERT: HIGH HUMIDITY INDEX',
    hazardLevelCode: 2,
    sensorCount: 72,
    totalPopulation: 957000,
    averageTemp: 35.4,
    humidity: 85,
    wbgtIndex: 34.6,
    imdZone: 'Assam & Meghalaya Sub-Division'
  },
  {
    id: 'in-dehradun',
    name: 'Dehradun Doon Valley Heat Action Plan',
    state: 'Uttarakhand',
    district: 'Dehradun',
    zone: 'North',
    lat: 30.3165,
    lng: 78.0322,
    hazardLevel: 'IMD YELLOW ALERT: ELEVATED FOOTHILL HEAT',
    hazardLevelCode: 2,
    sensorCount: 68,
    totalPopulation: 578000,
    averageTemp: 37.8,
    humidity: 48,
    wbgtIndex: 31.9,
    imdZone: 'Sub-Himalayan Foothills'
  },
  {
    id: 'in-shimla',
    name: 'Shimla Urban Mountain Grid',
    state: 'Himachal Pradesh',
    district: 'Shimla',
    zone: 'North',
    lat: 31.1048,
    lng: 77.1734,
    hazardLevel: 'IMD GREEN: NORMAL MONITORING',
    hazardLevelCode: 1,
    sensorCount: 42,
    totalPopulation: 169000,
    averageTemp: 26.5,
    humidity: 45,
    wbgtIndex: 23.4,
    imdZone: 'Himachal Western Himalayas'
  },
  {
    id: 'in-srinagar',
    name: 'Srinagar J&K Valley Grid',
    state: 'Jammu & Kashmir (UT)',
    district: 'Srinagar',
    zone: 'North',
    lat: 34.0837,
    lng: 74.7973,
    hazardLevel: 'IMD YELLOW ALERT: ABNORMAL VALLEY HEAT',
    hazardLevelCode: 2,
    sensorCount: 56,
    totalPopulation: 1180000,
    averageTemp: 33.2,
    humidity: 42,
    wbgtIndex: 28.5,
    imdZone: 'Kashmir Valley Sub-Division'
  }
];

// Helper to calculate Haversine distance in KM between two coordinates
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in KM
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Find closest Indian region based on latitude and longitude
export function findClosestIndianRegion(userLat: number, userLng: number): Region {
  let closest = ALL_INDIA_REGIONS[0];
  let minDistance = Infinity;

  for (const reg of ALL_INDIA_REGIONS) {
    const dist = calculateDistanceKm(userLat, userLng, reg.lat, reg.lng);
    if (dist < minDistance) {
      minDistance = dist;
      closest = reg;
    }
  }

  return closest;
}

// Generate realistic Ward polygons and sensors tailored to any Indian city
export function generateWardsForRegion(region: Region): { wards: WardData[]; sensors: SensorNode[] } {
  const baseTemp = region.averageTemp;
  const isRed = region.hazardLevelCode >= 4;
  const isOrange = region.hazardLevelCode === 3;

  // 6 Representative Wards per Indian Municipal Grid with realistic geography
  const wardDefs = [
    {
      id: `${region.id}-ward-1`,
      name: `${region.name.split(' ')[0]} Central Historic Core`,
      code: 'SEC-1C',
      tempOffset: isRed ? +1.8 : +1.0,
      vulnerability: 0.88,
      populationRatio: 0.22,
      windSpeed: 10,
      shadeCoverage: 8, // Very low shade in old city core
      solarRadiation: 940,
      areaKm2: 12.8,
      elevationM: 520,
      polygonPath: 'M 350 150 L 490 130 L 520 280 L 420 310 L 330 250 Z',
      center: { x: 420, y: 220 },
      geoOffset: { dLng: 0.005, dLat: 0.008 },
      coolingCenters: 4,
      gridLoad: 94,
      desc: 'High building density and narrow street canyons leading to severe urban heat trapping.'
    },
    {
      id: `${region.id}-ward-2`,
      name: `${region.name.split(' ')[0]} Industrial & Freight Corridor`,
      code: 'SEC-2IND',
      tempOffset: isRed ? +2.4 : +1.6,
      vulnerability: 0.92,
      populationRatio: 0.18,
      windSpeed: 12,
      shadeCoverage: 6, // Harsh exposed industrial tin sheds & asphalt
      solarRadiation: 980,
      areaKm2: 24.5,
      elevationM: 510,
      polygonPath: 'M 180 180 L 340 160 L 320 320 L 160 340 Z',
      center: { x: 250, y: 250 },
      geoOffset: { dLng: -0.024, dLat: -0.005 },
      coolingCenters: 2,
      gridLoad: 96,
      desc: 'Extensive corrugated roofing and heavy manufacturing causing thermal anomaly spikes.'
    },
    {
      id: `${region.id}-ward-3`,
      name: `${region.name.split(' ')[0]} Northern Residential & Dense Wards`,
      code: 'SEC-3N',
      tempOffset: isRed ? +0.5 : +0.2,
      vulnerability: 0.74,
      populationRatio: 0.25,
      windSpeed: 15,
      shadeCoverage: 14,
      solarRadiation: 880,
      areaKm2: 18.2,
      elevationM: 535,
      polygonPath: 'M 220 80 L 480 70 L 490 130 L 350 150 L 220 120 Z',
      center: { x: 360, y: 110 },
      geoOffset: { dLng: -0.008, dLat: 0.028 },
      coolingCenters: 3,
      gridLoad: 88,
      desc: 'Dense low-income tenements with limited green cover and poor natural ventilation.'
    },
    {
      id: `${region.id}-ward-4`,
      name: `${region.name.split(' ')[0]} Eastern Tech & Commercial Hub`,
      code: 'SEC-4E',
      tempOffset: isRed ? +0.9 : -0.2,
      vulnerability: 0.58,
      populationRatio: 0.15,
      windSpeed: 18,
      shadeCoverage: 22,
      solarRadiation: 820,
      areaKm2: 28.0,
      elevationM: 545,
      polygonPath: 'M 520 150 L 680 170 L 670 340 L 520 310 Z',
      center: { x: 600, y: 240 },
      geoOffset: { dLng: 0.032, dLat: 0.005 },
      coolingCenters: 5,
      gridLoad: 91,
      desc: 'Air-conditioning exhaust loads create localized microclimate heat bubbles.'
    },
    {
      id: `${region.id}-ward-5`,
      name: `${region.name.split(' ')[0]} Riverfront / Eco Green Belt`,
      code: 'SEC-5G',
      tempOffset: isRed ? -1.8 : -1.5,
      vulnerability: 0.42,
      populationRatio: 0.10,
      windSpeed: 22,
      shadeCoverage: 44, // River breeze & dense urban forest canopy
      solarRadiation: 710,
      areaKm2: 15.6,
      elevationM: 505,
      polygonPath: 'M 320 320 L 500 300 L 520 440 L 330 460 Z',
      center: { x: 420, y: 380 },
      geoOffset: { dLng: 0.012, dLat: -0.025 },
      coolingCenters: 6,
      gridLoad: 72,
      desc: 'Vegetation and water bodies provide a 1.5°C to 2.5°C localized cooling buffer.'
    },
    {
      id: `${region.id}-ward-6`,
      name: `${region.name.split(' ')[0]} Transit Junction & Rail Terminal`,
      code: 'SEC-6TR',
      tempOffset: isRed ? +1.4 : +0.8,
      vulnerability: 0.82,
      populationRatio: 0.10,
      windSpeed: 13,
      shadeCoverage: 11,
      solarRadiation: 910,
      areaKm2: 11.4,
      elevationM: 518,
      polygonPath: 'M 160 340 L 320 320 L 330 460 L 170 450 Z',
      center: { x: 240, y: 390 },
      geoOffset: { dLng: -0.022, dLat: -0.028 },
      coolingCenters: 3,
      gridLoad: 89,
      desc: 'Heavy commuter footfall and tarmac surfaces require immediate hydration stations.'
    }
  ];

  const wards: WardData[] = wardDefs.map((def, idx) => {
    const curTemp = Number((baseTemp + def.tempOffset).toFixed(1));
    const humidity = region.humidity || 50;
    // Heat index calculation approximation
    const heatIndex = Number((curTemp + (humidity * 0.12)).toFixed(1));
    const status = curTemp >= 44.0 ? 'critical' : curTemp >= 41.0 ? 'danger' : curTemp >= 38.0 ? 'warning' : 'normal';
    const wardPop = Math.round(region.totalPopulation * def.populationRatio);

    // Calculate detailed vulnerable exposed population breakdown
    const gigWorkers = Math.round(wardPop * (0.04 + (idx % 2 === 0 ? 0.025 : 0.015)));
    const dailyWageLaborers = Math.round(wardPop * (0.08 + (def.vulnerability * 0.06)));
    const elderlyPopulation = Math.round(wardPop * (0.09 + (idx % 3 === 0 ? 0.03 : 0.01)));
    const childrenAndStudents = Math.round(wardPop * 0.16);
    const streetVendors = Math.round(wardPop * (0.025 + (def.vulnerability * 0.02)));
    const totalExposed = gigWorkers + dailyWageLaborers + elderlyPopulation + childrenAndStudents + streetVendors;

    // Real geo coordinates polygon around region.lng and region.lat
    const centerLng = region.lng + def.geoOffset.dLng;
    const centerLat = region.lat + def.geoOffset.dLat;
    const span = 0.016;

    const coordinates: [number, number][] = [
      [Number((centerLng - span * 1.1).toFixed(6)), Number((centerLat + span * 0.8).toFixed(6))],
      [Number((centerLng + span * 0.9).toFixed(6)), Number((centerLat + span * 1.0).toFixed(6))],
      [Number((centerLng + span * 1.2).toFixed(6)), Number((centerLat - span * 0.4).toFixed(6))],
      [Number((centerLng + span * 0.4).toFixed(6)), Number((centerLat - span * 1.1).toFixed(6))],
      [Number((centerLng - span * 0.9).toFixed(6)), Number((centerLat - span * 0.7).toFixed(6))],
      [Number((centerLng - span * 1.1).toFixed(6)), Number((centerLat + span * 0.8).toFixed(6))]
    ];

    const wbgt = Number((curTemp * 0.7 + humidity * 0.15 + (def.solarRadiation / 500)).toFixed(1));

    return {
      id: def.id,
      name: def.name,
      code: def.code,
      population: wardPop,
      vulnerabilityIndex: def.vulnerability,
      currentTemp: curTemp,
      humidity,
      windSpeed: def.windSpeed,
      shadeCoveragePercent: def.shadeCoverage,
      heatIndex,
      wbgt,
      solarRadiation: def.solarRadiation,
      areaKm2: def.areaKm2,
      elevationM: def.elevationM,
      exposedPopulation: {
        gigWorkers,
        dailyWageLaborers,
        elderlyPopulation,
        childrenAndStudents,
        streetVendors,
        totalExposed
      },
      status,
      polygonPath: def.polygonPath,
      coordinates,
      geoCenter: [Number(centerLng.toFixed(6)), Number(centerLat.toFixed(6))],
      center: def.center,
      coolingCentersOpen: def.coolingCenters,
      gridLoadPercent: def.gridLoad,
      activeSensorsCount: Math.round(region.sensorCount / 6),
      thermalProfile24h: [
        { time: '00:00', temp: Number((curTemp - 7.5).toFixed(1)) },
        { time: '04:00', temp: Number((curTemp - 9.0).toFixed(1)) },
        { time: '08:00', temp: Number((curTemp - 4.5).toFixed(1)) },
        { time: '12:00', temp: Number((curTemp - 1.2).toFixed(1)) },
        { time: '15:00', temp: Number((curTemp + 0.8).toFixed(1)) },
        { time: '18:00', temp: curTemp },
        { time: 'Now', temp: curTemp }
      ],
      forecastTemps: {
        0: curTemp,
        1: Number((curTemp + 0.9).toFixed(1)),
        2: Number((curTemp + 1.6).toFixed(1)),
        3: Number((curTemp - 0.5).toFixed(1)),
        4: Number((curTemp - 2.2).toFixed(1))
      },
      recommendedProtocols: [
        {
          id: `p-${def.id}-1`,
          title: `Activate NDMA Tier ${isRed ? '4' : isOrange ? '3' : '2'} Cooling Centers`,
          description: `Deploy shaded relief shelters across ${def.name}. Free ORS packets & drinking water.`,
          icon: 'campaign',
          severity: isRed ? 'error' : 'warning',
          status: 'recommended',
          actionLabel: 'Open Relief Shelters'
        },
        {
          id: `p-${def.id}-2`,
          title: 'Grid Power & Substation Load Relief',
          description: `Discom transformer operating at ${def.gridLoad}% capacity. Prevent peak-hour tripping.`,
          icon: 'power',
          severity: 'primary',
          status: 'recommended',
          actionLabel: 'Reroute Power'
        },
        {
          id: `p-${def.id}-3`,
          title: 'Outdoor Labour & Transit Advisory',
          description: `Mandatory halt on outdoor labour between 12:00 PM and 3:30 PM per State Disaster Act.`,
          icon: 'engineering',
          severity: 'secondary',
          status: 'recommended',
          actionLabel: 'Broadcast Advisory'
        }
      ]
    };
  });

  // Generate sensor nodes spread across the ward boundaries without colliding with center labels
  const sensors: SensorNode[] = [];
  wards.forEach((ward, wIdx) => {
    // 3 sensor nodes per ward positioned cleanly away from center tag
    const offsets = [
      { dx: -48, dy: -28, codeSuff: 'A' },
      { dx: 48, dy: 22, codeSuff: 'B' },
      { dx: -34, dy: 38, codeSuff: 'C' }
    ];

    offsets.forEach((off, sIdx) => {
      const isAlert = ward.currentTemp >= 44.0;
      sensors.push({
        id: `sns-${ward.id}-${sIdx + 1}`,
        code: `IND-${ward.code}-${off.codeSuff}`,
        wardId: ward.id,
        name: `${ward.name} Mesonet ${off.codeSuff}`,
        x: ward.center.x + off.dx,
        y: ward.center.y + off.dy,
        temp: Number((ward.currentTemp + (sIdx === 0 ? -0.4 : sIdx === 1 ? +0.6 : 0)).toFixed(1)),
        humidity: ward.humidity + (sIdx * 2 - 2),
        battery: 92 - (wIdx * 2 + sIdx),
        status: isAlert ? (sIdx === 1 ? 'alert' : 'warning') : 'active',
        lastPing: `${(sIdx + 1) * 3}s ago`
      });
    });
  });

  return { wards, sensors };
}

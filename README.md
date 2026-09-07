# TaapRaksha

> **🟠 IN DEVELOPMENT** — TaapRaksha is an active prototype and is not currently intended to be treated as an official operational warning or emergency-response system.

**TaapRaksha** is an India-focused **heat-risk intelligence and decision-support platform** designed to help users understand extreme heat, human thermal stress, vulnerable populations, urban heat patterns, forecasts, and response actions through a unified interface.

The project focuses on **human-centered heat-risk communication, scientific transparency, operational usability, and accessible decision support**.

---

## 🌡️ What is TaapRaksha?

Extreme heat is more than a temperature problem.

The health impact of heat depends on factors such as **temperature, humidity, wind, solar radiation, exposure duration, urban conditions, population vulnerability, and access to cooling resources**.

TaapRaksha aims to connect these factors into a single platform that helps answer:

> **How hot is it?**

> **Who is most vulnerable?**

> **Where is the risk highest?**

> **When is the risk expected to peak?**

> **Why is the risk elevated?**

> **What action can be taken?**

The long-term goal is to move heat-risk communication from simply asking **"What will the weather be?"** toward understanding:

> **"What is this heat likely to do to people, where, when, and what can be done about it?"**

---

## 🎯 Problem Statement

Traditional heatwave warnings often rely heavily on ambient temperature thresholds.

However, the human impact of heat can change significantly when factors such as **relative humidity, wind speed, and solar radiation** are considered.

For example, **40°C at low humidity can produce a very different physiological burden than 40°C at high humidity**.

TaapRaksha explores a more comprehensive approach by combining environmental conditions with thermal-stress indicators, geographic information, and population vulnerability.

The intended outcome is a system that can eventually support **localized, impact-based heat-risk assessment and early warning**.

---

## ✨ Current Capabilities

The current prototype provides a unified dashboard architecture covering several areas of heat-risk analysis and response.

### 🗺️ Surveillance

* Interactive heat-risk map
* Regional and ward-level views
* Weather information
* Forecast visualization
* Heat-risk overview
* Geographic risk exploration

### 🧠 Scientific Analysis

* Human thermal stress analysis
* Heatwave analysis
* Historical heat analysis
* Urban Heat Island analysis
* Population vulnerability analysis
* Infrastructure-related analysis

### 🚨 Action & Operations

* Heat alerts
* Response workflows
* Event logging
* Cooling shelter information
* Emergency-resource interfaces
* Public-health action concepts

### 📊 Platform

* Analytics
* Data-source information
* Settings
* Administrative views
* Authentication interface

> **Note:** Some current features use mock or simulated data. Data integrations, scientific calculations, authentication, and operational workflows are still being developed and validated.

---

## 🧠 Heat-Risk Intelligence

The planned intelligence layer is designed to combine multiple environmental and contextual factors rather than relying on temperature alone.

### Environmental Factors

* 🌡️ Air temperature
* 💧 Relative humidity
* 💨 Wind speed
* ☀️ Solar radiation
* 🕐 Time of day
* 📍 Geographic location

### Vulnerability Factors

* Population density
* Elderly population
* Outdoor worker exposure
* Urban characteristics
* Access to cooling resources
* Other relevant demographic indicators

### Thermal Stress Metrics

Potential metrics include:

* **Heat Index (HI)**
* **Wet-Bulb Globe Temperature (WBGT)**
* **Universal Thermal Climate Index (UTCI)**

These indicators are intended to provide a better representation of human thermal exposure than temperature alone.

---

## 🤖 AI & Machine Learning

The planned machine-learning layer will investigate relationships between:

```text
Environmental Conditions
        +
Thermal Stress
        +
Population Vulnerability
        +
Historical Health Outcomes
        ↓
Heat-Related Health Risk
```

Potential approaches include:

* Regression models
* Classification models
* Random Forest
* Gradient Boosting / XGBoost
* Time-series forecasting
* Explainable machine learning

The objective is to investigate whether heat-related **hospitalization and mortality risk** can be estimated several days in advance using validated historical datasets.

> Mortality and hospitalization prediction are research and validation areas of the project. They should not be interpreted as clinically validated predictions or medical advice.

---

## 🏗️ System Architecture

The planned system follows a pipeline from environmental data to human-centered decision support.

```text
┌──────────────────────────┐
│ Weather / Forecast Data  │
│ Temperature • Humidity   │
│ Wind • Solar Radiation   │
└────────────┬─────────────┘
             ↓
┌──────────────────────────┐
│ Data Processing          │
│ Cleaning • Validation    │
│ Feature Engineering      │
└────────────┬─────────────┘
             ↓
┌──────────────────────────┐
│ Thermal Stress Engine    │
│ HI • WBGT • UTCI         │
└────────────┬─────────────┘
             ↓
┌──────────────────────────┐
│ Risk Intelligence        │
│ Vulnerability • ML       │
│ Historical Analysis      │
└────────────┬─────────────┘
             ↓
┌──────────────────────────┐
│ GIS Decision Dashboard   │
│ Region / Ward Level      │
└────────────┬─────────────┘
             ↓
┌──────────────────────────┐
│ Alerts & Response        │
│ Advisories • Resources   │
└──────────────────────────┘
```

---

## 📊 Data

TaapRaksha is designed to integrate multiple categories of data.

| Data Category      | Examples                       | Purpose                       |
| ------------------ | ------------------------------ | ----------------------------- |
| 🌡️ Meteorological | Temperature, humidity, wind    | Environmental heat assessment |
| ☀️ Radiation       | Solar radiation                | Thermal stress estimation     |
| 🗺️ Geographic     | State, city, ward boundaries   | Hyper-local visualization     |
| 👥 Demographic     | Population, elderly density    | Vulnerability assessment      |
| 🏙️ Urban          | Built environment, urban heat  | Urban heat analysis           |
| 🏥 Health          | Hospitalization, mortality     | Health-risk modeling          |
| 🔮 Forecast        | Short-term weather predictions | Advance risk assessment       |

### Data Transparency

Because heat-risk information can influence real-world decisions, TaapRaksha prioritizes:

* Clear data provenance
* Source attribution
* Data timestamps
* Observed vs. modeled values
* Data freshness indicators
* Transparent calculations
* Explicit uncertainty
* Explainable risk indicators
* Separation of demonstration and operational data

> Current development may use mock or simulated datasets. Such data must not be interpreted as official measurements.

---

## 🗺️ GIS & Geographic Risk

TaapRaksha is designed around **localized geographic risk communication**.

The dashboard aims to support:

* State-level visualization
* City-level analysis
* Regional comparisons
* Ward-level risk
* Hyper-local heat patterns
* Vulnerability overlays
* Urban heat visualization
* Cooling-resource mapping

The long-term objective is to help authorities and communities identify **where intervention may be needed most**, rather than treating an entire city as having the same level of heat risk.

---

## 🚨 Alerts & Response

The planned alert layer is designed to translate heat-risk information into actionable guidance.

Potential interventions include:

* Opening cooling centers
* Adjusting outdoor working hours
* Issuing public-health advisories
* Preparing healthcare facilities
* Identifying vulnerable communities
* Monitoring electricity demand
* Deploying local response resources

Future integrations may support automated regional notifications through channels such as **SMS or WhatsApp**, subject to appropriate technical, legal, and operational requirements.

> Alert functionality is currently under development and should not be considered an official emergency notification system.

---

## 🖥️ Dashboard

The interface is designed around a human-centered decision workflow:

```text
1. What is happening?
        ↓
2. Where is the risk?
        ↓
3. Who may be affected?
        ↓
4. When will risk peak?
        ↓
5. Why is the risk elevated?
        ↓
6. What action is recommended?
        ↓
7. What evidence supports it?
```

### Preview

> 🚧 Screenshots and live demo will be added as the prototype develops.

---

## 🧱 Technology Stack

TaapRaksha is currently built with:

### Frontend

* **React 19**
* **TypeScript**
* **Vite**
* **Tailwind CSS**
* **Motion**
* **Lucide React**
* **Recharts**
* **MapLibre GL**

### Backend & Services

* **Supabase** for planned / ongoing authentication and backend capabilities
* Weather and forecast services
* Thermal calculation services
* Notification services

### AI

* **Google GenAI SDK**, where applicable to project functionality
* Planned machine-learning pipeline for heat-risk analysis

See [`package.json`](./package.json) for the authoritative dependency list.

---

## 📁 Project Structure

A simplified view of the current project:

```text
src/
├── components/
│   ├── AuthScreen.tsx
│   ├── LandingPage.tsx
│   ├── DashboardOverview.tsx
│   ├── InteractiveMap.tsx
│   ├── ThermalStressView.tsx
│   ├── HeatwaveAnalysisView.tsx
│   ├── HistoricalAnalysisView.tsx
│   ├── UrbanHeatIslandView.tsx
│   ├── VulnerabilityView.tsx
│   ├── InfrastructureView.tsx
│   ├── DataSourcesView.tsx
│   ├── AnalyticsView.tsx
│   ├── AlertsView.tsx
│   ├── SettingsView.tsx
│   └── AdminView.tsx
│
├── services/
│   ├── notificationService.ts
│   ├── weatherForecastService.ts
│   └── thermalEngine.ts
│
├── data/
│   ├── mockData.ts
│   └── indiaRegions.ts
│
├── types/
│   └── index.ts
│
├── App.tsx
├── main.tsx
└── index.css
```

---

## 🚀 Getting Started

### Prerequisites

Install a recent version of **Node.js**.

### 1. Clone the repository

```bash
git clone https://github.com/your-username/taapraksha.git
cd taapraksha
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a local environment file based on:

```text
.env.example
```

Never commit private credentials or secrets to the repository.

### 4. Start the development server

```bash
npm run dev
```

Vite will provide a local development URL in the terminal.

### 5. Build for production

```bash
npm run build
```

> Check `package.json` for the project's current scripts. Available scripts may evolve during development.

---

## 🔐 Authentication & Security

Authentication is currently an active area of development.

The project contains an authentication interface, while the complete production authentication and session architecture is still being developed.

If Supabase Auth is enabled, environment configuration should remain local.

### Never commit:

```text
.env
.env.local
.env.production
service-role keys
private API keys
access tokens
passwords
```

Only public client-side credentials specifically intended for browser use should be exposed to the frontend.

Production deployment should also include appropriate:

* Authentication controls
* Authorization
* Row Level Security
* API protection
* Input validation
* Secret management
* Rate limiting

---

## 🎨 Design Philosophy

TaapRaksha is being refined around a design language that is:

**Human-centered · Scientific · Calm · Trustworthy · Accessible · Operational**

The interface intentionally avoids unnecessary futuristic command-center aesthetics and instead prioritizes information that helps users make sense of heat risk.

### Design priorities

1. **Clarity**
   Users should quickly understand what is happening.

2. **Context**
   Risk should be explained rather than presented as an unexplained number.

3. **Human impact**
   Environmental conditions should be connected to people and vulnerability.

4. **Actionability**
   Risk information should lead toward understandable actions.

5. **Transparency**
   Data sources, calculations, timestamps, and uncertainty should be visible.

6. **Accessibility**
   Information should remain understandable across devices and user groups.

---

## 🛡️ Safety & Responsible Use

TaapRaksha is a developing software project and **should not currently be relied upon as the sole source** for:

* Emergency decisions
* Medical decisions
* Public evacuation decisions
* Official weather warnings
* Government response decisions
* Occupational safety decisions
* Disaster-management decisions

Official weather warnings, emergency instructions, and medical guidance should come from appropriate verified authorities and qualified professionals.

The project does not claim government endorsement, official certification, or clinical validation unless explicitly documented.

---

## ⚠️ Scientific Disclaimer

Heat-risk calculations and predictive models can contain uncertainty due to:

* Data quality
* Spatial resolution
* Forecast uncertainty
* Missing health data
* Model assumptions
* Population differences
* Local environmental conditions

Any scientific metric implemented by TaapRaksha should be documented with its methodology, assumptions, input variables, and limitations.

Model outputs should be treated as **decision-support indicators**, not absolute predictions.

---

## 🧪 Development Roadmap

### Platform

* [ ] Production-ready authentication
* [ ] Supabase database integration
* [ ] Row Level Security
* [ ] Authorization model
* [ ] Production deployment hardening

### Data

* [ ] Verified weather-data integrations
* [ ] Forecast-data integration
* [ ] Geographic dataset integration
* [ ] Population vulnerability datasets
* [ ] Historical health datasets
* [ ] Data freshness and provenance indicators

### Scientific Engine

* [ ] Validate Heat Index calculations
* [ ] Implement / validate WBGT
* [ ] Implement / validate UTCI
* [ ] Improve thermal-stress methodology
* [ ] Document scientific assumptions
* [ ] Quantify model uncertainty

### AI / ML

* [ ] Historical heat-health dataset preparation
* [ ] Feature engineering
* [ ] Baseline predictive models
* [ ] Mortality-risk modeling research
* [ ] Hospitalization-risk modeling research
* [ ] Model evaluation
* [ ] Explainable ML
* [ ] 3–5 day risk forecasting research

### Dashboard

* [ ] Human-centered UX refinement
* [ ] Responsive/mobile optimization
* [ ] Accessibility improvements
* [ ] Improved loading states
* [ ] Improved error states
* [ ] Improved empty states
* [ ] Expanded geographic coverage

### Alerts & Operations

* [ ] Operational alert workflows
* [ ] Localized public-health advisories
* [ ] SMS integration research
* [ ] WhatsApp integration research
* [ ] Cooling-center mapping
* [ ] Response-resource management

### Engineering

* [ ] Automated testing
* [ ] Performance optimization
* [ ] Error monitoring
* [ ] API hardening
* [ ] Production validation

---

## 🤝 Contributing

TaapRaksha is currently in active development.

If you would like to contribute:

1. Fork the repository.
2. Create a feature branch.

```bash
git checkout -b feature/your-feature
```

3. Make your changes.
4. Test the application.
5. Commit your changes.

```bash
git commit -m "Add: your feature"
```

6. Push the branch.

```bash
git push origin feature/your-feature
```

7. Open a Pull Request.

For substantial changes, especially those involving:

* Heat-risk calculations
* Scientific methodology
* Public-safety messaging
* Authentication
* Data architecture
* Machine-learning models

please document the reasoning and supporting evidence behind the change.

---

## 📚 Scientific & Data Sources

As verified data integrations are added, this section will document:

* Data provider
* Dataset name
* Geographic coverage
* Temporal resolution
* Update frequency
* Methodology
* Licensing
* Limitations

Scientific methodologies used for thermal-stress calculations should also be documented here with appropriate references.

---

## 📄 License

A project license has not yet been finalized.

Until a license is added to this repository, the source code should **not be assumed to be freely reusable, redistributed, or relicensed**.

---

## 👤 Project

# TaapRaksha

### *Heat-risk intelligence for a safer, more heat-resilient India.*

> **🟠 IN DEVELOPMENT**
>
> TaapRaksha is an evolving research and development project. Features, data sources, scientific methodology, predictive models, and interface design are subject to change.
>
> **The current prototype is not an official government warning system, emergency-response platform, or medically validated prediction system.**

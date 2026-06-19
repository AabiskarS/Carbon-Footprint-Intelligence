# Carbon Footprint Intelligence System

A full-stack Climate Strategy application hand-crafted by **Aabiskar Sharma** utilizing server-side Gemini 2.5 modeling to track carbon baselines, analyze logs, and receive intelligent eco-guidance.

## 🚀 Recent Key Advancements 

The application has been elevated to an **organization-centric ESG framework**:

### 1. Corporate & Organization-Centric Architecture
The data model has been refactored from a single-household profile to a robust corporate tracking system:
* **Company Profiles:** Track industry sector, employee count, reporting year, and location targets.
* **Asset Facility Management:** Add and manage multiple enterprise assets (such as offices, warehouses, manufacturing units, and vehicle-fleet bases) with custom type categories and addresses.
* **Facility-Linked Activities:** Activities and logistics logs are linked directly to specific physical facilities, allowing granular tracing of corporate footprints.
* **Refined Sector Focus:** Streamlined scope focusing strictly on high-impact categories: **Transport Fleet & Travel** and **Facility Energy Consumption**.

### 2. Multi-Dimensional Transportation Metrics
Transportation emissions calculations support measurement modes tailored for active logistics:
* **Gasoline/Diesel/Hybrid/Electric Cars & Vans:** Input in Miles (mi), Kilometers (km), Driving Hours (hrs), or Commute Trips (15mi average).
* **Public Transit:** Input in Miles (mi), Kilometers (km), Transit Minutes (mins), or Train/Bus Stops.
* **Flights (Short & Long-Haul):** Choose Flight Hours (hrs), Miles (mi), Kilometers (km), or individual Flights (qty).
* *Conversion factor scaling is done automatically* in real-time to translate custom metrics down to a precise Defra-aligned carbon footprint value.

### 3. Boundless Usage Inputs
Removed rigid default usage limits for large-scale operations:
* **Manual Input Panel:** A high-precision numerical input field allows users to type *any custom quantity* directly (including support for floating-point values/decimals).
* **Self-Scaling Limits:** Entering an amount larger than the standard range will auto-scale the slider boundary, granting limitless logging capabilities.

### 4. Professional Bespoke Interface
* **Aabiskar Sharma Signature & Branding:** Clean, professional craftsmanship badges integrated seamlessly into the user application footer and metadata records.
* **Streamlined Environment Integration:** Clean environmental error handling with automatic local high-fidelity fallback mechanisms during global API peaks or high-demand schedules.

---

## 🛠️ Stack Overview
* **Frontend:** React 18+, Vite, Tailwind CSS, Recharts (responsive custom-engineered `ObservedChartContainer`), and Framer Motion.
* **Backend:** Express API proxy routes with automatic local high-fidelity fallback mechanisms during global API peaks.
* **Intelligent Modeling:** Gemini 2.5 via `@google/genai` on server-side APIs to ensure complete confidentiality of API keys.

## 📦 Getting Started

### Development Mode
Runs the local proxy server with built-in HMR-ready Vite middleware:
```bash
npm run dev
```

### Production Build
Compiles static web files and bundles the Express server to dynamic Node.js CommonJS:
```bash
npm run build
```

Verify build success and boot production service:
```bash
npm start
```

### Environmental Configuration
To enable standard advanced AI Carbon Coach chat & report features, set your environment key:
```env
# .env
GEMINI_API_KEY=your_gemini_api_key_here
```

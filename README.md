# Carbon Footprint Intelligence System

A full-stack Climate Strategy application hand-crafted by **Aabiskar Sharma** utilizing server-side Gemini 3.5 modeling to track carbon baselines, analyze logs, and receive intelligent eco-guidance.

## 🚀 Recent Key Advancements 

The application has been elevated with the following updates:

### 1. Multi-Dimensional Transportation Metrics
Transportation emissions calculations are no longer restricted to standard miles. Users can customize their entries with measurement modes appropriate for each transport type:
* **Gasoline/Diesel/Hybrid/Electric Cars:** Input in Miles (mi), Kilometers (km), Driving Hours (hrs), or Commute Trips (15mi average).
* **Public Transit:** Input in Miles (mi), Kilometers (km), Transit Minutes (mins), or Train/Bus Stops.
* **Flights (Short & Long-Haul):** Choose Flight Hours (hrs), Miles (mi), Kilometers (km), or individual Flights (qty).
* *Conversion factor scaling is done automatically* in real-time under-the-hood to translate custom metrics down to a precise Defra-aligned carbon footprint value.

### 2. Boundless Usage Inputs
Removed rigid default usage limits! Users are now in complete control:
* **Manual Input Panel:** A high-precision numerical input field allows users to type *any custom quantity* directly (including support for floating-point values/decimals).
* **Self-Scaling Limits:** Entering an amount larger than the standard range will auto-scale the slider boundary, granting limitless logging capabilities.

### 3. Professional Bespoke Interface
* **Aabiskar Sharma Signature & Branding:** Clean, professional craftsmanship badges integrated seamlessly into the user application footer.
* **Streamlined Environment Integration:** Clean environmental error handling. Mentions and notices pointing directly to standard environmental secret configurations rather than generic external platform dependencies.

---

## 🛠️ Stack Overview
* **Frontend:** React 18+, Vite, Tailwind CSS, Recharts (responsive custom-engineered `ObservedChartContainer`), and Framer Motion.
* **Backend:** Express API proxy routes with automatic local high-fidelity fallback mechanisms during global API peaks.
* **Intelligent Modeling:** Gemini 3.5 via `@google/genai` on server-side APIs to ensure complete confidentiality of API keys.

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
npm start
```

### Environmental Configuration
To enable standard advanced AI Carbon Coach chat & report features, set your environment key:
```env
# .env
GEMINI_API_KEY=your_gemini_api_key_here
```

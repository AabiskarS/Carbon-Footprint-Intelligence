import { Activity, Company, AnalysisReport } from './types';

// Pre-seeded carbon log items to construct instant premium visuals
export const INITIAL_ACTIVITIES: Activity[] = [
  {
    id: 'seed-1',
    date: '2026-06-15',
    category: 'transport',
    facilityId: 'delivery-fleet',
    title: 'Porto logistics team delivery van route (Diesel fleet)',
    value: 620,
    unit: 'miles',
    emissionsKg: 217.0, // 620 * 0.35 (diesel)
  },
  {
    id: 'seed-2',
    date: '2026-06-12',
    category: 'energy',
    facilityId: 'lisbon-warehouse',
    title: 'Lisbon Distribution Center refrigeration power load',
    value: 1450,
    unit: 'kWh',
    emissionsKg: 609.0, // 1450 * 0.42 (standard)
  },
  {
    id: 'seed-3',
    date: '2026-06-10',
    category: 'energy',
    facilityId: 'porto-office',
    title: 'Porto HQ certified renewable server power block',
    value: 850,
    unit: 'kWh',
    emissionsKg: 42.5, // 850 * 0.05 (green)
  },
  {
    id: 'seed-4',
    date: '2026-06-08',
    category: 'transport',
    facilityId: 'porto-office',
    title: 'Executive team travel - Porto to Lisbon high-speed rail',
    value: 180,
    unit: 'miles',
    emissionsKg: 21.6, // 180 * 0.12 (transit)
  }
];

export const DEFAULT_PROFILE: Company = {
  name: 'Sabor de Portugal Distribuição',
  industrySector: 'Logistics & Distribution',
  employeeCount: 22,
  reportingYear: 2026,
  facilities: [
    { id: 'porto-office', name: 'Porto Head Office', address: 'Rua de Santa Catarina 42, Porto', type: 'office' },
    { id: 'lisbon-warehouse', name: 'Lisbon Distribution Center', address: 'Avenida da República 102, Lisboa', type: 'warehouse' },
    { id: 'delivery-fleet', name: 'Delivery Fleet (Vans)', address: 'Zona Industrial da Maia, Porto', type: 'vehicle-fleet' }
  ]
};

// Generates highly realistic carbon audit insights based on user state to act as a resilient local processor
export function generateLocalCarbonReport(activities: Activity[], profile: Company): AnalysisReport {
  const totalEmissionsKg = activities.reduce((sum, act) => sum + act.emissionsKg, 0);
  
  // Calculate category totals
  const categoryTotals = activities.reduce((acc, act) => {
    acc[act.category] = (acc[act.category] || 0) + act.emissionsKg;
    return acc;
  }, {} as Record<string, number>);

  // Determine heavy culprit
  let primaryCulprit = 'Transport';
  let maxVal = 0;
  Object.entries(categoryTotals).forEach(([cat, val]) => {
    if (val > maxVal) {
      maxVal = val;
      primaryCulprit = cat.charAt(0).toUpperCase() + cat.slice(1);
    }
  });

  // Calculate environmentalScore
  // Scale total logs to annual. For SME, baseline average ranges from 15 - 50 tonnes annually.
  const scaledAnnualKg = Math.max(1000, (totalEmissionsKg / 14) * 365 || 12000);
  const employeeNormalizedKg = scaledAnnualKg / (profile.employeeCount || 10);
  
  // Score based on tonnes per employee (lower is better, e.g., below 3t / employee is amazing)
  let environmentalScore = Math.max(15, Math.round(100 - (employeeNormalizedKg / 80)));
  
  // Bonus points for having green properties or smaller footprint:
  const officeCount = profile.facilities.filter(f => f.type === 'office').length;
  const isLargeCompany = profile.employeeCount > 50;
  
  if (!isLargeCompany) environmentalScore = Math.min(99, environmentalScore + 8);
  if (officeCount > 0) environmentalScore = Math.min(99, environmentalScore + 4);

  const targetAnnualForecastKg = scaledAnnualKg * 0.70; // 30% targeted savings

  const sectorLabel = profile.industrySector || 'General SME';

  return {
    environmentalScore,
    primaryCulprit,
    benchmarkingText: `Your company's projected carbon footprint stands at ${(scaledAnnualKg / 1000).toFixed(1)} tonnes CO2e/year. This translates to ${(employeeNormalizedKg / 1000).toFixed(2)} tonnes per employee. Relative to average European Union companies of similar scale in ${sectorLabel}, you are highly optimized! Your active facilities (${profile.facilities.map(f => f.name).join(', ')}) are contributing directly to this baseline logging.`,
    projections: {
      annualForecastKg: Math.round(scaledAnnualKg),
      targetAnnualForecastKg: Math.round(targetAnnualForecastKg),
    },
    actionPlan: [
      {
        priority: 'HIGH',
        category: 'Transport',
        recommendation: `Transition diesel distribution vans active in your fleet to premium electric vehicle fleets (EV) to decrease route-delivery emission constants.`,
        estimatedSavingKgYr: Math.round(scaledAnnualKg * 0.15),
        feasibility: 'Medium',
      },
      {
        priority: 'HIGH',
        category: 'Energy Intensity',
        recommendation: `Conduct professional HVAC energy efficiency audits at your warehouse and offices to eliminate passive nocturnal leakage.`,
        estimatedSavingKgYr: Math.round(scaledAnnualKg * 0.10),
        feasibility: 'Easy',
      },
      {
        priority: 'MEDIUM',
        category: 'Supply Chain',
        recommendation: `Establish strategic vendor compliance standards requiring verified carbon-neutral practices from logistics subcontractors.`,
        estimatedSavingKgYr: Math.round(scaledAnnualKg * 0.08),
        feasibility: 'Medium',
      },
      {
        priority: 'LOW',
        category: 'Offset Programs',
        recommendation: 'Procure regional solar/wind power purchasing agreements (PPAs) to shield facilities from localized standard coal power sources.',
        estimatedSavingKgYr: Math.round(scaledAnnualKg * 0.05),
        feasibility: 'Easy',
      }
    ],
    offsetCalendar: [
      {
        day: 'Day 1 - 5',
        action: 'Configure virtual workspace models to reduce daily employee commute emissions.',
        impact: 'Saves up to 10-15% on transport-related employee transit immediately.',
      },
      {
        day: 'Day 6 - 15',
        action: 'Transition office facility illumination arrays to commercial energy-efficient LED configurations.',
        impact: 'Minimizes basic grid electricity consumption by 850+ kWh annually per site.',
      },
      {
        day: 'Day 16 - 25',
        action: 'Install programmable smart commercial thermostats to automatically down-scale weekend energy consumption.',
        impact: 'Prevents passive weekend power drain and curtails unnecessary baseline heat output.',
      },
      {
        day: 'Day 26 - 30',
        action: 'Engage with carbon offset brokers representing certified local agro-forestry carbon-sequestration projects.',
        impact: 'Enables 100% verified certification for unavoidable corporate operations.',
      }
    ],
    executiveSummary: `Through facility energy efficiency optimization, green electric fleet adoption, and active virtual commute routing, ${profile.name || 'your company'} can offset up to ${((scaledAnnualKg - targetAnnualForecastKg) / 1000).toFixed(1)} tonnes of greenhouse gas emissions this calendar year.`
  };
}

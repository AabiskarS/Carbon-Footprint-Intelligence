import { Activity, UserProfile, AnalysisReport } from './types';

// Pre-seeded carbon log items to construct instant premium visuals
export const INITIAL_ACTIVITIES: Activity[] = [
  {
    id: 'seed-1',
    date: '2026-06-15',
    category: 'transport',
    title: 'Commuted to secondary campus site',
    value: 65,
    unit: 'miles',
    emissionsKg: 11.7, // 65 * 0.18 (hybrid)
  },
  {
    id: 'seed-2',
    date: '2026-06-14',
    category: 'food',
    title: 'Weekly grocery beef BBQ steak meals',
    value: 3,
    unit: 'meals',
    emissionsKg: 10.2, // 3 * 3.4
  },
  {
    id: 'seed-3',
    date: '2026-06-12',
    category: 'energy',
    title: 'Household base monthly energy bill',
    value: 240,
    unit: 'kWh',
    emissionsKg: 100.8, // 240 * 0.42
  },
  {
    id: 'seed-4',
    date: '2026-06-10',
    category: 'purchases',
    title: 'Imported wool winter sweater garment',
    value: 1,
    unit: 'items',
    emissionsKg: 14.2, // 1 * 14.2
  },
  {
    id: 'seed-5',
    date: '2026-06-08',
    category: 'transport',
    title: 'Weekend flight terminal commute (Short flight)',
    value: 450,
    unit: 'miles',
    emissionsKg: 108.0, // 450 * 0.24
  }
];

export const DEFAULT_PROFILE: UserProfile = {
  name: 'Eco Traveler',
  householdSize: 2,
  electricityState: 'standard',
  carType: 'hybrid',
  weeklyCommuteMiles: 80,
  dietaryPreference: 'low-meat',
  annualHeatingSource: 'gas',
};

// Generates highly realistic carbon audit insights based on user state to act as a resilient local processor
export function generateLocalCarbonReport(activities: Activity[], profile: UserProfile): AnalysisReport {
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

  // Calculate a contextual grade from 0 to 100
  // Safe world target averages around 2 tonnes per year (2000kg).
  // Assuming short logs, scale them.
  const scaledAnnualKg = Math.max(800, (totalEmissionsKg / 14) * 365 || 4800);
  let environmentalScore = Math.max(10, Math.round(100 - (scaledAnnualKg / 150)));
  
  // Adjust based on green profile choices
  if (profile.electricityState === 'green') environmentalScore = Math.min(99, environmentalScore + 12);
  if (profile.electricityState === 'solar') environmentalScore = Math.min(99, environmentalScore + 18);
  if (profile.carType === 'electric') environmentalScore = Math.min(99, environmentalScore + 14);
  if (profile.dietaryPreference === 'vegan') environmentalScore = Math.min(99, environmentalScore + 15);

  const targetAnnualForecastKg = scaledAnnualKg * 0.65; // 35% targeted savings

  return {
    environmentalScore,
    primaryCulprit,
    benchmarkingText: `Your calculated greenhouse intensity matches approximately ${(scaledAnnualKg / 1000).toFixed(1)} tonnes CO2e/year. This is well below the US per-capita average of 16 tonnes, but still highlights avenues to contract emissions closer to the world limit of 2 tonnes.`,
    projections: {
      annualForecastKg: Math.round(scaledAnnualKg),
      targetAnnualForecastKg: Math.round(targetAnnualForecastKg),
    },
    actionPlan: [
      {
        priority: 'HIGH',
        category: 'Transport',
        recommendation: profile.carType !== 'electric' ? 'Adopt smart carpooling or explore upgrading to an electric vehicle to escape high transit constants.' : 'Increase bicycle commute cycles for short trips under 3 miles.',
        estimatedSavingKgYr: Math.round(scaledAnnualKg * 0.18),
        feasibility: 'Medium',
      },
      {
        priority: 'HIGH',
        category: 'Home Energy',
        recommendation: profile.electricityState !== 'green' ? 'Reach out to your municipality grid provider to toggle your energy source to Certified 100% Green Wind/Solar.' : 'Install smart thermostats to limit passive night heating loads.',
        estimatedSavingKgYr: Math.round(scaledAnnualKg * 0.12),
        feasibility: 'Easy',
      },
      {
        priority: 'MEDIUM',
        category: 'Food Choice',
        recommendation: profile.dietaryPreference !== 'vegan' ? 'Establish three "Meatless Mondays" weekly, replacing heavy steaks with legume or lentil plant proteins.' : 'Focus on locally sourced seasonal agriculture to cut post-production transport variables.',
        estimatedSavingKgYr: Math.round(scaledAnnualKg * 0.08),
        feasibility: 'Easy',
      },
      {
        priority: 'LOW',
        category: 'Shopping Lifestyle',
        recommendation: 'Offset electronic hardware upgrades by purchasing certified refurbished gear instead of fresh high-impact consumer units.',
        estimatedSavingKgYr: 150,
        feasibility: 'Challenging',
      }
    ],
    offsetCalendar: [
      {
        day: 'Day 1 - 5',
        action: 'Perform a draft audit of your household thermal leaks & seal window cracks.',
        impact: 'Reduces passive HVAC heating and cooling overhead by 7-10% almost instantly.',
      },
      {
        day: 'Day 6 - 15',
        action: 'Transition commuting journeys equal to or less than 2 miles to carbonless pedestrian walking.',
        impact: 'Establishes sustainable habits while scaling 50kg carbon off the road annually.',
      },
      {
        day: 'Day 16 - 25',
        action: 'Integrate organic plant protein alternatives to beef, starting with soy blocks or chickpeas.',
        impact: 'Saves up to 2.8kg greenhouse gas output per meal according to DEFRA coefficients.',
      },
      {
        day: 'Day 26 - 30',
        action: 'Enroll in gold-standard verified forest preservation credits to cover non-compressible flight loads.',
        impact: 'Achieves verified neutral certification for inevitable transcontinental air trips.',
      }
    ],
    executiveSummary: `Through smart changes like energy efficiency adjustments, vehicle pool carpooling, and localized diet optimizations, ${profile.name || 'User'} can offset up to ${( (scaledAnnualKg - targetAnnualForecastKg) / 1000).toFixed(2)} tonnes of CO2 gas emissions this calendar year.`
  };
}

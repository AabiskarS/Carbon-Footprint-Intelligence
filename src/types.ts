export type ActivityCategory = 'transport' | 'energy' | 'food' | 'purchases';

export interface Activity {
  id: string;
  date: string;
  category: ActivityCategory;
  title: string;
  value: number; // raw value input
  unit: string;  // e.g. "miles", "kWh", "meals", "USD"
  emissionsKg: number; // calculated CO2 in kilograms
}

export interface UserProfile {
  name: string;
  householdSize: number;
  electricityState: 'standard' | 'green' | 'solar';
  carType: 'none' | 'electric' | 'hybrid' | 'gasoline' | 'diesel';
  weeklyCommuteMiles: number;
  dietaryPreference: 'vegan' | 'vegetarian' | 'low-meat' | 'standard' | 'heavy-meat';
  annualHeatingSource: 'gas' | 'electric' | 'heat-pump' | 'oil';
}

export interface ReductionAction {
  category: string;
  recommendation: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  estimatedSavingKgYr: number;
  feasibility: 'Easy' | 'Medium' | 'Challenging';
}

export interface OffsetMilestone {
  day: string;
  action: string;
  impact: string;
}

export interface AnalysisReport {
  environmentalScore: number;
  benchmarkingText: string;
  primaryCulprit: string;
  projections: {
    annualForecastKg: number;
    targetAnnualForecastKg: number;
  };
  actionPlan: ReductionAction[];
  offsetCalendar: OffsetMilestone[];
  executiveSummary: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

// Fixed emission factors based on EPA, DEFRA, and IPCC reports (kg CO2e per unit)
export const CARBON_FACTORS: Record<string, { factor: number; units: string; label: string }> = {
  // Transport - kg CO2 per mile
  'car-gasoline': { factor: 0.38, units: 'miles', label: 'Gasoline Passenger Vehicle' },
  'car-diesel': { factor: 0.35, units: 'miles', label: 'Diesel Passenger Vehicle' },
  'car-hybrid': { factor: 0.18, units: 'miles', label: 'Hybrid/Alternative Fuel Vehicle' },
  'car-electric': { factor: 0.08, units: 'miles', label: 'Electric Vehicle (Average Grid)' },
  'public-transit': { factor: 0.12, units: 'miles', label: 'Bus or Rail Travel' },
  'flight-short': { factor: 0.24, units: 'miles', label: 'Short Flight (< 3 hours)' },
  'flight-long': { factor: 0.16, units: 'miles', label: 'Long Flight (>= 3 hours)' },
  
  // Home Energy - kg CO2 per unit
  'electricity-standard': { factor: 0.42, units: 'kWh', label: 'Standard Grid Electricity' },
  'electricity-green': { factor: 0.05, units: 'kWh', label: 'Certified Renewable Grid' },
  'electricity-solar': { factor: 0.02, units: 'kWh', label: 'Rooftop Solar Generation' },
  'heating-gas': { factor: 1.83, units: 'therms', label: 'Natural Gas Heating' },
  'heating-oil': { factor: 2.68, units: 'gallons', label: 'Heating Oil Use' },
  'heating-heatpump': { factor: 0.15, units: 'kWh', label: 'Heat Pump (High Efficiency)' },
  
  // Food & Diet - kg CO2 per meal
  'diet-vegan': { factor: 0.61, units: 'meals', label: 'Plant-Based Vegan Meal' },
  'diet-vegetarian': { factor: 0.89, units: 'meals', label: 'Vegetarian Meal' },
  'diet-low-meat': { factor: 1.45, units: 'meals', label: 'Low Meat / Flexitarian Meal' },
  'diet-standard': { factor: 2.15, units: 'meals', label: 'Standard Diet Meal' },
  'diet-heavy-meat': { factor: 3.40, units: 'meals', label: 'Heavy Red Meat Meal' },
  
  // Purchases & Waste - kg CO2 per unit
  'purchase-clothing': { factor: 14.2, units: 'items', label: 'New Clothing Purchase' },
  'purchase-electronics': { factor: 85.0, units: 'items', label: 'New Electronic Device' },
  'waste-trash': { factor: 1.12, units: 'bags', label: 'Standard Bag of Household Trash' },
  'recycling-credit': { factor: -0.45, units: 'bags', label: 'Recycling Output Credit' }
};

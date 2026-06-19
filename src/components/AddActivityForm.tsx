import { useState, useMemo, useEffect } from 'react';
import { ActivityCategory, CARBON_FACTORS, Facility } from '../types';
import { Leaf, Car, Zap, PlusCircle, Building } from 'lucide-react';

interface AddActivityFormProps {
  facilities: Facility[];
  onAddActivity: (activity: {
    category: ActivityCategory;
    facilityId: string;
    title: string;
    value: number;
    unit: string;
    emissionsKg: number;
  }) => void;
}

interface TransportUnitConfig {
  key: string;
  label: string;
  factorToMiles: number; // multiply custom input by this to get value in miles
  defaultVal: number;
  minVal: number;
  maxVal: number;
  step: number;
}

// Config mapping for various transport measurements & factors
const TRANSPORT_UNITS: Record<string, TransportUnitConfig[]> = {
  cars: [
    { key: 'miles', label: 'Miles (mi)', factorToMiles: 1, defaultVal: 15, minVal: 1, maxVal: 500, step: 5 },
    { key: 'km', label: 'Kilometers (km)', factorToMiles: 0.621371, defaultVal: 25, minVal: 1, maxVal: 800, step: 10 },
    { key: 'hours', label: 'Driving Hours (hrs)', factorToMiles: 45, defaultVal: 1, minVal: 0.5, maxVal: 12, step: 0.5 },
    { key: 'trips', label: 'Commute Trips (15mi avg)', factorToMiles: 15, defaultVal: 2, minVal: 1, maxVal: 30, step: 1 },
  ],
  transit: [
    { key: 'miles', label: 'Miles (mi)', factorToMiles: 1, defaultVal: 10, minVal: 1, maxVal: 300, step: 5 },
    { key: 'km', label: 'Kilometers (km)', factorToMiles: 0.621371, defaultVal: 16, minVal: 1, maxVal: 500, step: 10 },
    { key: 'minutes', label: 'Transit Minutes', factorToMiles: 20 / 60, defaultVal: 30, minVal: 5, maxVal: 240, step: 5 },
    { key: 'stops', label: 'Train/Bus Stops', factorToMiles: 0.75, defaultVal: 5, minVal: 1, maxVal: 60, step: 1 },
  ],
  flightShort: [
    { key: 'flight-hours', label: 'Flight Hours (hrs)', factorToMiles: 400, defaultVal: 2, minVal: 0.5, maxVal: 5, step: 0.5 },
    { key: 'miles', label: 'Miles (mi)', factorToMiles: 1, defaultVal: 350, minVal: 50, maxVal: 1500, step: 50 },
    { key: 'km', label: 'Kilometers (km)', factorToMiles: 0.621371, defaultVal: 560, minVal: 80, maxVal: 2400, step: 100 },
    { key: 'flights', label: 'Short Flights (qty)', factorToMiles: 450, defaultVal: 1, minVal: 1, maxVal: 5, step: 1 },
  ],
  flightLong: [
    { key: 'flight-hours', label: 'Flight Hours (hrs)', factorToMiles: 500, defaultVal: 6, minVal: 3, maxVal: 18, step: 0.5 },
    { key: 'miles', label: 'Miles (mi)', factorToMiles: 1, defaultVal: 1500, minVal: 500, maxVal: 10000, step: 100 },
    { key: 'km', label: 'Kilometers (km)', factorToMiles: 0.621371, defaultVal: 2400, minVal: 800, maxVal: 16000, step: 200 },
    { key: 'flights', label: 'Long Flights (qty)', factorToMiles: 2500, defaultVal: 1, minVal: 1, maxVal: 5, step: 1 },
  ],
};

export default function AddActivityForm({ facilities, onAddActivity }: AddActivityFormProps) {
  const [category, setCategory] = useState<ActivityCategory>('transport');
  const [selectedFacilityId, setSelectedFacilityId] = useState<string>(() => {
    return facilities[0]?.id || '';
  });
  const [selectedSubtype, setSelectedSubtype] = useState<string>('car-gasoline');
  const [amount, setAmount] = useState<number>(15);
  const [customTitle, setCustomTitle] = useState<string>('');
  const [selectedUnitKey, setSelectedUnitKey] = useState<string>('miles');

  // Sync selectedFacilityId when list updates
  useEffect(() => {
    if (facilities.length > 0 && !facilities.some(f => f.id === selectedFacilityId)) {
      setSelectedFacilityId(facilities[0].id);
    }
  }, [facilities, selectedFacilityId]);

  // Helper to determine the key of TRANSPORT_UNITS based on selected transport subtype
  const getTransportUnitType = (subtype: string): string => {
    if (subtype.startsWith('car-')) return 'cars';
    if (subtype === 'public-transit') return 'transit';
    if (subtype === 'flight-short') return 'flightShort';
    if (subtype === 'flight-long') return 'flightLong';
    return 'cars';
  };

  // List subtypes based on category
  const subtypes = useMemo(() => {
    switch (category) {
      case 'transport':
        return [
          { key: 'car-gasoline', label: 'Gasoline Car/Van fleet' },
          { key: 'car-diesel', label: 'Diesel Car/Van fleet' },
          { key: 'car-hybrid', label: 'Hybrid Commuter Pool' },
          { key: 'car-electric', label: 'Electric Delivery Vehicle (EV)' },
          { key: 'public-transit', label: 'Public Bus/Metro Transit' },
          { key: 'flight-short', label: 'Short business flight (<3 hrs)' },
          { key: 'flight-long', label: 'Long business flight (>=3 hrs)' },
        ];
      case 'energy':
        return [
          { key: 'electricity-standard', label: 'Coal/Gas Electricity Grid (per kWh)', defaultVal: 200 },
          { key: 'electricity-green', label: 'Certified Clean Renewable (per kWh)', defaultVal: 350 },
          { key: 'electricity-solar', label: 'Rooftop Solar Generation (per kWh)', defaultVal: 300 },
          { key: 'heating-gas', label: 'Natural Gas Facility Heating (per therm)', defaultVal: 150 },
          { key: 'heating-oil', label: 'Heating Fuel Oil (per gallon)', defaultVal: 100 },
          { key: 'heating-heatpump', label: 'Geothermal/Heat Pump (per kWh)', defaultVal: 250 },
        ];
    }
  }, [category]);

  // Sync subtype key when category shifts
  const handleCategorySelection = (cat: ActivityCategory) => {
    setCategory(cat);
    const available = cat === 'transport' ? 'car-gasoline' : 'electricity-standard';
    setSelectedSubtype(available);
    
    if (cat === 'transport') {
      setSelectedUnitKey('miles');
      setAmount(15);
    } else {
      const def = CARBON_FACTORS[available];
      if (def) {
        setAmount(150);
      }
    }
  };

  // Get active unit options for transportation
  const transportUnitOptions = useMemo(() => {
    if (category !== 'transport') return [];
    const type = getTransportUnitType(selectedSubtype);
    return TRANSPORT_UNITS[type] || [];
  }, [category, selectedSubtype]);

  // Compute active unit object details
  const activeUnitObj = useMemo(() => {
    if (category === 'transport') {
      const units = transportUnitOptions;
      return units.find(u => u.key === selectedUnitKey) || units[0] || { key: 'miles', label: 'Miles (mi)', factorToMiles: 1, defaultVal: 15, minVal: 1, maxVal: 500, step: 5 };
    }
    // Standard static units from config
    const factorObj = CARBON_FACTORS[selectedSubtype];
    return {
      key: factorObj?.units || 'units',
      label: factorObj?.units || 'units',
      factorToMiles: 1,
      defaultVal: 1,
      minVal: 1,
      maxVal: 2000,
      step: 10
    };
  }, [category, selectedSubtype, selectedUnitKey, transportUnitOptions]);

  const activeFactorObj = useMemo(() => {
    return CARBON_FACTORS[selectedSubtype] || { factor: 0.1, units: 'qty', label: 'Miscellaneous' };
  }, [selectedSubtype]);

  // Handle live emission metrics with conversion factor scaling
  const liveEmissions = useMemo(() => {
    if (category === 'transport') {
      const factorToMiles = activeUnitObj.factorToMiles || 1;
      return amount * factorToMiles * activeFactorObj.factor;
    }
    return amount * activeFactorObj.factor;
  }, [amount, category, activeUnitObj, activeFactorObj]);

  const handlePlusActivity = (e: React.FormEvent) => {
    e.preventDefault();
    const finalTitle = customTitle.trim() || activeFactorObj.label;
    
    onAddActivity({
      category,
      facilityId: selectedFacilityId,
      title: finalTitle,
      value: amount,
      unit: category === 'transport' ? activeUnitObj.key : activeFactorObj.units,
      emissionsKg: liveEmissions,
    });
    setCustomTitle('');
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 hover:shadow-lg transition-all duration-300 p-6" id="add-activity-card">
      <div className="flex items-center space-x-3 mb-5">
        <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
          <Leaf className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-800 tracking-tight">Log Corporate Carbon Impact</h3>
          <p className="text-xs text-slate-400">Record a recent activity of transport fleet or facilities</p>
        </div>
      </div>

      {/* Category selector capsules */}
      <div className="grid grid-cols-2 gap-3 mb-6" id="category-selector-tabs">
        <button
          type="button"
          onClick={() => handleCategorySelection('transport')}
          className={`flex flex-col items-center justify-center p-3.5 rounded-xl border transition-all text-xs font-semibold cursor-pointer ${
            category === 'transport'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'border-slate-100 text-slate-500 hover:bg-slate-50'
          }`}
        >
          <Car className="w-4 h-4 mb-1" />
          Transport Fleet
        </button>
        <button
          type="button"
          onClick={() => handleCategorySelection('energy')}
          className={`flex flex-col items-center justify-center p-3.5 rounded-xl border transition-all text-xs font-semibold cursor-pointer ${
            category === 'energy'
              ? 'bg-sky-50 text-sky-700 border-sky-200'
              : 'border-slate-100 text-slate-500 hover:bg-slate-50'
          }`}
        >
          <Zap className="w-4 h-4 mb-1" />
          Facility Energy
        </button>
      </div>

      <form onSubmit={handlePlusActivity} className="space-y-4">
        {/* Associated Facility select */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1.5 flex items-center">
            <Building className="w-3.5 h-3.5 mr-1" /> Associated Active Facility
          </label>
          <select
            className="w-full text-slate-705 text-sm px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 outline-none focus:bg-white focus:border-emerald-500 transition-all cursor-pointer font-medium"
            value={selectedFacilityId}
            onChange={(e) => setSelectedFacilityId(e.target.value)}
            required
          >
            {facilities.map((fac) => (
              <option key={fac.id} value={fac.id}>
                {fac.name} ({fac.type.replace('-', ' ')})
              </option>
            ))}
            {facilities.length === 0 && (
              <option value="">(No facilities added yet. Please configuration in profile.)</option>
            )}
          </select>
        </div>

        {/* Custom description option */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1.5">Activity Description (Optional)</label>
          <input
            type="text"
            className="w-full text-slate-700 text-sm px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 outline-none focus:border-emerald-500 focus:bg-white transition-all duration-200 placeholder-slate-400"
            placeholder="e.g. Weekly dispatch deliveries route Porto-Braga"
            value={customTitle}
            onChange={(e) => setCustomTitle(e.target.value)}
          />
        </div>

        {/* Subtype Dropdown */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1.5">Emission source type</label>
          <select
            className="w-full text-slate-700 text-sm px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all cursor-pointer font-semibold"
            value={selectedSubtype}
            onChange={(e) => {
              const newSubtype = e.target.value;
              setSelectedSubtype(newSubtype);
              
              if (category === 'transport') {
                const type = getTransportUnitType(newSubtype);
                if (TRANSPORT_UNITS[type] && TRANSPORT_UNITS[type].length > 0) {
                  const defaultUnit = TRANSPORT_UNITS[type][0];
                  setSelectedUnitKey(defaultUnit.key);
                  setAmount(defaultUnit.defaultVal);
                }
              } else {
                const def = CARBON_FACTORS[newSubtype];
                if (def) {
                  setAmount(250);
                }
              }
            }}
          >
            {subtypes.map((sub) => (
              <option key={sub.key} value={sub.key}>
                {sub.label}
              </option>
            ))}
          </select>
        </div>

        {/* Dynamic Measurement Units for Transport */}
        {category === 'transport' && transportUnitOptions.length > 0 && (
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Select Distance / Measurement Type</label>
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-50 rounded-xl border border-slate-200">
              {transportUnitOptions.map((unitOpt) => (
                <button
                  key={unitOpt.key}
                  type="button"
                  onClick={() => {
                    setSelectedUnitKey(unitOpt.key);
                    setAmount(unitOpt.defaultVal);
                  }}
                  className={`text-center text-[10px] py-1.5 px-1 rounded-lg font-semibold transition-all cursor-pointer ${
                    selectedUnitKey === unitOpt.key
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-800 hover:bg-slate-200'
                  }`}
                >
                  {unitOpt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Live amount adjustment */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-slate-500">Resource usage quantity</span>
            <div className="flex items-center space-x-1.5">
              <input
                type="number"
                min="0.001"
                step="any"
                value={amount === 0 ? '' : amount}
                placeholder="0"
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setAmount(isNaN(val) ? 0 : val);
                }}
                className="w-28 text-right bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-sm font-extrabold text-slate-800 font-mono py-1 px-2 border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
              />
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono bg-slate-100 px-2 py-1 rounded">
                {category === 'transport' ? activeUnitObj.key : activeFactorObj.units}
              </span>
            </div>
          </div>
          <input
            type="range"
            min={category === 'transport' ? activeUnitObj.minVal : 5}
            max={category === 'transport' ? Math.max(activeUnitObj.maxVal, amount) : Math.max(2500, amount)}
            value={amount}
            step={category === 'transport' ? activeUnitObj.step : 25}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-500 outline-none"
          />
          <div className="flex justify-between text-[10px] text-slate-400 mt-1">
            <span>Min</span>
            <span>Type value or adjust slider</span>
            <span>Uncapped fields</span>
          </div>
        </div>

        {/* Responsive Carbon Output Badge */}
        <div className="bg-slate-50 border border-dotted border-slate-200 rounded-xl p-4 flex items-center justify-between">
          <div className="max-w-[70%]">
            <span className="text-[11px] uppercase font-semibold text-slate-400 block tracking-wider">Calculated Carbon footprint</span>
            <span className="text-slate-500 text-xs block leading-relaxed">
              {category === 'transport' ? (
                <>
                  Unit Factor: <strong className="text-slate-700 font-semibold">{(activeFactorObj.factor * activeUnitObj.factorToMiles).toFixed(3)}</strong> kg CO2e / {activeUnitObj.key}
                  <span className="text-[9.5px] text-slate-400 block mt-0.5 font-normal">
                    Derived from base factor ({activeFactorObj.factor} kg CO2e/mile)
                  </span>
                </>
              ) : (
                `Factor: ${activeFactorObj.factor} kg CO2e / ${activeFactorObj.units}`
              )}
            </span>
          </div>
          <div className="text-right">
            <span className={`text-2xl font-extrabold font-mono block transition-colors duration-200 ${
              liveEmissions < 0 ? 'text-emerald-500' : liveEmissions > 150 ? 'text-rose-500' : 'text-slate-800'
            }`}>
              {liveEmissions.toFixed(2)}
            </span>
            <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider font-semibold">kg CO2e</span>
          </div>
        </div>

        {/* Add Submission Button */}
        <button
          type="submit"
          disabled={facilities.length === 0}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm py-3 px-4 rounded-xl shadow-md cursor-pointer hover:shadow-emerald-100 active:scale-[0.98] transition-all flex items-center justify-center space-x-2 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed disabled:shadow-none"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add Corporate Activity to Logs</span>
        </button>
      </form>
    </div>
  );
}

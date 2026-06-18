import { useState, useMemo } from 'react';
import { ActivityCategory, CARBON_FACTORS } from '../types';
import { Leaf, Car, Zap, Flame, ShoppingBag, PlusCircle } from 'lucide-react';

interface AddActivityFormProps {
  onAddActivity: (activity: {
    category: ActivityCategory;
    title: string;
    value: number;
    unit: string;
    emissionsKg: number;
  }) => void;
}

export default function AddActivityForm({ onAddActivity }: AddActivityFormProps) {
  const [category, setCategory] = useState<ActivityCategory>('transport');
  const [selectedSubtype, setSelectedSubtype] = useState<string>('car-gasoline');
  const [amount, setAmount] = useState<number>(15);
  const [customTitle, setCustomTitle] = useState<string>('');

  // List subtypes based on category
  const subtypes = useMemo(() => {
    switch (category) {
      case 'transport':
        return [
          { key: 'car-gasoline', label: 'Gasoline Car (per mile)', defaultVal: 15 },
          { key: 'car-diesel', label: 'Diesel Car (per mile)', defaultVal: 15 },
          { key: 'car-hybrid', label: 'Hybrid/Alternative Car (per mile)', defaultVal: 20 },
          { key: 'car-electric', label: 'Electric Car (per mile)', defaultVal: 25 },
          { key: 'public-transit', label: 'Public Bus/Train (per mile)', defaultVal: 10 },
          { key: 'flight-short', label: 'Short Flight Express (per mile)', defaultVal: 350 },
          { key: 'flight-long', label: 'Transcontinental Flight (per mile)', defaultVal: 1200 },
        ];
      case 'energy':
        return [
          { key: 'electricity-standard', label: 'Coal/Gas Electricity Grid (per kWh)', defaultVal: 80 },
          { key: 'electricity-green', label: 'Certified Clean Renewable (per kWh)', defaultVal: 120 },
          { key: 'electricity-solar', label: 'Rooftop Solar Offset (per kWh)', defaultVal: 100 },
          { key: 'heating-gas', label: 'Natural Gas Heating (per therm)', defaultVal: 52 },
          { key: 'heating-oil', label: 'Heating Fuel Oil (per gallon)', defaultVal: 30 },
          { key: 'heating-heatpump', label: 'Geothermal/Heat Pump (per kWh)', defaultVal: 90 },
        ];
      case 'food':
        return [
          { key: 'diet-vegan', label: 'Strict Vegan/Plant meal', defaultVal: 3 },
          { key: 'diet-vegetarian', label: 'Vegetarian Meal', defaultVal: 3 },
          { key: 'diet-low-meat', label: 'Flexitarian/Low-meat meal', defaultVal: 2 },
          { key: 'diet-standard', label: 'Standard Average meal', defaultVal: 2 },
          { key: 'diet-heavy-meat', label: 'Heavy Red Meat (Beef/Lamb)', defaultVal: 1 },
        ];
      case 'purchases':
        return [
          { key: 'purchase-clothing', label: 'New Clothing Item', defaultVal: 2 },
          { key: 'purchase-electronics', label: 'Electronics (Laptop/Phone)', defaultVal: 1 },
          { key: 'waste-trash', label: 'Bag of Unsorted Landfill Trash', defaultVal: 4 },
          { key: 'recycling-credit', label: 'Binned Recyclable Bag (Credit)', defaultVal: 3 },
        ];
    }
  }, [category]);

  // Sync subtype key when category shifts
  const handleCategorySelection = (cat: ActivityCategory) => {
    setCategory(cat);
    const available = cat === 'transport' ? 'car-gasoline' :
                      cat === 'energy' ? 'electricity-standard' :
                      cat === 'food' ? 'diet-standard' : 'waste-trash';
    setSelectedSubtype(available);
    
    // Set a good default slider value for the subtype
    const def = CARBON_FACTORS[available];
    if (def) {
      if (cat === 'transport') setAmount(25);
      else if (cat === 'energy') setAmount(75);
      else if (cat === 'food') setAmount(1);
      else setAmount(1);
    }
  };

  const activeFactorObj = useMemo(() => {
    return CARBON_FACTORS[selectedSubtype] || { factor: 0.1, units: 'qty', label: 'Miscellaneous' };
  }, [selectedSubtype]);

  const liveEmissions = useMemo(() => {
    return amount * activeFactorObj.factor;
  }, [amount, activeFactorObj]);

  const handlePlusActivity = (e: React.FormEvent) => {
    e.preventDefault();
    const finalTitle = customTitle.trim() || activeFactorObj.label;
    onAddActivity({
      category,
      title: finalTitle,
      value: amount,
      unit: activeFactorObj.units,
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
          <h3 className="text-lg font-semibold text-slate-800 tracking-tight">Log Carbon Impact</h3>
          <p className="text-xs text-slate-400">Record a recent activity to compute real-time greenhouse metrics</p>
        </div>
      </div>

      {/* Category selector capsules */}
      <div className="grid grid-cols-4 gap-2 mb-6" id="category-selector-tabs">
        <button
          type="button"
          onClick={() => handleCategorySelection('transport')}
          className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all text-xs font-medium cursor-pointer ${
            category === 'transport'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'border-slate-100 text-slate-500 hover:bg-slate-50'
          }`}
        >
          <Car className="w-4 h-4 mb-1" />
          Transport
        </button>
        <button
          type="button"
          onClick={() => handleCategorySelection('energy')}
          className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all text-xs font-medium cursor-pointer ${
            category === 'energy'
              ? 'bg-sky-50 text-sky-700 border-sky-200'
              : 'border-slate-100 text-slate-500 hover:bg-slate-50'
          }`}
        >
          <Zap className="w-4 h-4 mb-1" />
          Household
        </button>
        <button
          type="button"
          onClick={() => handleCategorySelection('food')}
          className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all text-xs font-medium cursor-pointer ${
            category === 'food'
              ? 'bg-amber-50 text-amber-700 border-amber-200'
              : 'border-slate-100 text-slate-500 hover:bg-slate-50'
          }`}
        >
          <Flame className="w-4 h-4 mb-1" />
          Diet & Food
        </button>
        <button
          type="button"
          onClick={() => handleCategorySelection('purchases')}
          className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all text-xs font-medium cursor-pointer ${
            category === 'purchases'
              ? 'bg-purple-50 text-purple-700 border-purple-200'
              : 'border-slate-100 text-slate-500 hover:bg-slate-50'
          }`}
        >
          <ShoppingBag className="w-4 h-4 mb-1" />
          Lifestyle
        </button>
      </div>

      <form onSubmit={handlePlusActivity} className="space-y-4">
        {/* Custom description option */}
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1.5">Custom Title (Optional)</label>
          <input
            type="text"
            className="w-full text-slate-700 text-sm px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 outline-none focus:border-emerald-500 focus:bg-white transition-all duration-200 placeholder-slate-400"
            placeholder={`e.g., Commute to work via hybrid car`}
            value={customTitle}
            onChange={(e) => setCustomTitle(e.target.value)}
          />
        </div>

        {/* Subtype Dropdown */}
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1.5">Activity Detail Type</label>
          <select
            className="w-full text-slate-700 text-sm px-3 py-2.5 bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all cursor-pointer"
            value={selectedSubtype}
            onChange={(e) => setSelectedSubtype(e.target.value)}
          >
            {subtypes.map((sub) => (
              <option key={sub.key} value={sub.key}>
                {sub.label}
              </option>
            ))}
          </select>
        </div>

        {/* Live amount adjustment */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-medium text-slate-500">Usage Amount</span>
            <span className="text-sm font-bold text-slate-800">
              {amount} {activeFactorObj.units}
            </span>
          </div>
          <input
            type="range"
            min={category === 'transport' ? 1 : category === 'energy' ? 5 : 1}
            max={category === 'transport' ? Math.max(2000, amount) : category === 'energy' ? Math.max(1000, amount) : Math.max(20, amount)}
            value={amount}
            step={category === 'transport' ? 5 : category === 'energy' ? 5 : 1}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-500 outline-none"
          />
          <div className="flex justify-between text-[10px] text-slate-400 mt-1">
            <span>Min</span>
            <span>Adjust slider to dial precise usage</span>
            <span>Max</span>
          </div>
        </div>

        {/* Responsive Carbon Output Badge */}
        <div className="bg-slate-50 border border-dotted border-slate-200 rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] uppercase font-semibold text-slate-400 block tracking-wider">Calculated Carbon footprint</span>
            <span className="text-slate-500 text-xs">
              Factor: {activeFactorObj.factor} kg CO2e / {activeFactorObj.units}
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
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm py-3 px-4 rounded-xl shadow-md cursor-pointer hover:shadow-emerald-100 active:scale-[0.98] transition-all flex items-center justify-center space-x-2"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add Activity to Journey History</span>
        </button>
      </form>
    </div>
  );
}

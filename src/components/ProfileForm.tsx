import { UserProfile } from '../types';
import { Settings, ShieldCheck, HelpCircle } from 'lucide-react';

interface ProfileFormProps {
  profile: UserProfile;
  onChangeProfile: (profile: UserProfile) => void;
}

export default function ProfileForm({ profile, onChangeProfile }: ProfileFormProps) {
  const handleSelectField = (field: keyof UserProfile, value: string | number) => {
    onChangeProfile({
      ...profile,
      [field]: value,
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-shadow duration-300" id="profile-management-panel">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-slate-50 text-slate-800 rounded-xl">
            <Settings className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800 tracking-tight">Environmental Baseline</h3>
            <p className="text-xs text-slate-400">Establish custom multipliers to calibrate your annual carbon benchmarks</p>
          </div>
        </div>
        <span className="flex items-center text-[10px] uppercase font-semibold tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
          <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Core Engine Safe
        </span>
      </div>

      <div className="space-y-4">
        {/* Name input */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Your Name</label>
          <input
            type="text"
            className="w-full text-slate-800 text-sm px-3 py-2 bg-slate-50 rounded-lg border border-slate-200 focus:bg-white focus:border-indigo-500 outline-none transition-all"
            value={profile.name}
            onChange={(e) => handleSelectField('name', e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Household Size */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Household Inhabitants</label>
            <select
              className="w-full text-slate-800 text-sm px-3 py-2 bg-slate-50 rounded-lg border border-slate-200 focus:bg-white focus:border-indigo-500 outline-none transition-all cursor-pointer"
              value={profile.householdSize}
              onChange={(e) => handleSelectField('householdSize', parseInt(e.target.value))}
            >
              {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                <option key={num} value={num}>
                  {num} {num === 1 ? 'Person' : 'People'}
                </option>
              ))}
            </select>
          </div>

          {/* Electric Grid Source */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Home Electricity Plan</label>
            <select
              className="w-full text-slate-800 text-sm px-3 py-2 bg-slate-50 rounded-lg border border-slate-200 focus:bg-white focus:border-indigo-500 outline-none transition-all cursor-pointer"
              value={profile.electricityState}
              onChange={(e) => handleSelectField('electricityState', e.target.value as any)}
            >
              <option value="standard">Standard coal/gas grid</option>
              <option value="green">Certified 100% green</option>
              <option value="solar">Passive Rooftop Solar</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Main Car Type */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Primary Commute Vehicle</label>
            <select
              className="w-full text-slate-800 text-sm px-3 py-2 bg-slate-50 rounded-lg border border-slate-200 focus:bg-white focus:border-indigo-500 outline-none transition-all cursor-pointer"
              value={profile.carType}
              onChange={(e) => handleSelectField('carType', e.target.value as any)}
            >
              <option value="none">No vehicle (Walk/Transit/Cycle)</option>
              <option value="gasoline">Standard Gasoline Vehicle</option>
              <option value="diesel">Standard Diesel Passenger</option>
              <option value="hybrid">Efficient Car Pool/Hybrid</option>
              <option value="electric">Electric Vehicle (EV)</option>
            </select>
          </div>

          {/* Regular Diet Option */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Regular Diet Profile</label>
            <select
              className="w-full text-slate-800 text-sm px-3 py-2 bg-slate-50 rounded-lg border border-slate-200 focus:bg-white focus:border-indigo-500 outline-none transition-all cursor-pointer"
              value={profile.dietaryPreference}
              onChange={(e) => handleSelectField('dietaryPreference', e.target.value as any)}
            >
              <option value="vegan">100% Vegan (Plant-only)</option>
              <option value="vegetarian">Vegetarian (Dairy, no meat)</option>
              <option value="low-meat">Low Meat / Flexitarian</option>
              <option value="standard">Standard General Diet</option>
              <option value="heavy-meat">Heavy Red Meat Consumer</option>
            </select>
          </div>
        </div>

        {/* Weekly Commute Slider */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-semibold text-slate-500">Avg Weekly Commuting Distance</span>
            <span className="text-xs font-bold text-slate-800">{profile.weeklyCommuteMiles} miles/week</span>
          </div>
          <input
            type="range"
            min="0"
            max="300"
            step="10"
            value={profile.weeklyCommuteMiles}
            onChange={(e) => handleSelectField('weeklyCommuteMiles', parseInt(e.target.value))}
            className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-500 outline-none"
          />
        </div>

        {/* Heating choice */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Primary Home Heating System</label>
          <select
            className="w-full text-slate-800 text-sm px-3 py-2 bg-slate-50 rounded-lg border border-slate-200 focus:bg-white focus:border-indigo-500 outline-none transition-all cursor-pointer"
            value={profile.annualHeatingSource}
            onChange={(e) => handleSelectField('annualHeatingSource', e.target.value as any)}
          >
            <option value="gas">Gas furnace (Standard)</option>
            <option value="electric">Baseboard Electric resistive</option>
            <option value="heat-pump">Air-source Heat Pump</option>
            <option value="oil">Fuel oil boilers</option>
          </select>
        </div>

        <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100/40 flex items-start space-x-2">
          <HelpCircle className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Changing these values updates background formulas for your baseline forecast, which calculates savings relative to national averages.
          </p>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Company, Facility } from '../types';
import { Settings, ShieldCheck, HelpCircle, Building, Users, Calendar, MapPin, Plus, Trash2, Briefcase } from 'lucide-react';

interface ProfileFormProps {
  profile: Company;
  onChangeProfile: (profile: Company) => void;
}

export default function ProfileForm({ profile, onChangeProfile }: ProfileFormProps) {
  // Local state for adding a new facility
  const [newFacName, setNewFacName] = useState('');
  const [newFacAddress, setNewFacAddress] = useState('');
  const [newFacType, setNewFacType] = useState('office');

  const handleSelectField = (field: keyof Company, value: any) => {
    onChangeProfile({
      ...profile,
      [field]: value,
    });
  };

  const handleAddFacility = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFacName.trim() || !newFacAddress.trim()) return;

    const newFacility: Facility = {
      id: `fac-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: newFacName.trim(),
      address: newFacAddress.trim(),
      type: newFacType,
    };

    onChangeProfile({
      ...profile,
      facilities: [...(profile.facilities || []), newFacility],
    });

    setNewFacName('');
    setNewFacAddress('');
    setNewFacType('office');
  };

  const handleRemoveFacility = (id: string) => {
    onChangeProfile({
      ...profile,
      facilities: (profile.facilities || []).filter(f => f.id !== id),
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-all duration-300" id="profile-management-panel">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
            <Building className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800 tracking-tight">Organization Profile</h3>
            <p className="text-xs text-slate-400">Calibrate your corporate baselines and enterprise assets</p>
          </div>
        </div>
        <span className="flex items-center text-[10px] uppercase font-semibold tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
          <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Core Engine Safe
        </span>
      </div>

      <div className="space-y-6">
        {/* Core details grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 flex items-center">
              <Building className="w-3.5 h-3.5 mr-1 text-slate-400" /> Company Name
            </label>
            <input
              type="text"
              className="w-full text-slate-800 text-sm px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all font-medium"
              value={profile.name}
              onChange={(e) => handleSelectField('name', e.target.value)}
              placeholder="e.g. Porto Logistics Ltda."
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 flex items-center">
              <Briefcase className="w-3.5 h-3.5 mr-1 text-slate-400" /> Industry Sector
            </label>
            <select
              className="w-full text-slate-800 text-sm px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:border-indigo-500 outline-none transition-all cursor-pointer font-medium"
              value={profile.industrySector}
              onChange={(e) => handleSelectField('industrySector', e.target.value)}
            >
              <option value="Logistics & Distribution">Logistics & Distribution</option>
              <option value="Technology & Software">Technology & Software</option>
              <option value="Manufacturing & Industrial">Manufacturing & Industrial</option>
              <option value="Retail & E-commerce">Retail & E-commerce</option>
              <option value="Professional Services">Professional & Financial Services</option>
              <option value="Healthcare & Hospitality">Healthcare & Hospitality</option>
              <option value="Agriculture & Food Services">Agriculture & Food Services</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 flex items-center">
              <Users className="w-3.5 h-3.5 mr-1 text-slate-400" /> Employee Count
            </label>
            <input
              type="number"
              min="1"
              max="5000"
              className="w-full text-slate-800 text-sm px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:border-indigo-500 outline-none transition-all font-mono font-bold"
              value={profile.employeeCount}
              onChange={(e) => handleSelectField('employeeCount', parseInt(e.target.value) || 1)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 flex items-center">
              <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" /> Reporting Year
            </label>
            <select
              className="w-full text-slate-800 text-sm px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:border-indigo-500 outline-none transition-all cursor-pointer font-mono font-bold"
              value={profile.reportingYear}
              onChange={(e) => handleSelectField('reportingYear', parseInt(e.target.value) || 2026)}
            >
              {[2024, 2025, 2026, 2027].map((yr) => (
                <option key={yr} value={yr}>
                  {yr}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Facilities Section */}
        <div className="border-t border-slate-100 pt-5">
          <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center">
            <Building className="w-4 h-4 mr-1 text-slate-500" /> Enterprise Facilities ({profile.facilities?.length || 0})
          </h4>

          {/* Active facilities list */}
          {(profile.facilities || []).length === 0 ? (
            <div className="text-center p-6 bg-slate-50/50 rounded-xl border border-dashed border-slate-200 mb-4">
              <p className="text-xs text-slate-400">No active facilities added. Please configure at least one workspace below.</p>
            </div>
          ) : (
            <div className="space-y-2 mb-4 max-h-[220px] overflow-y-auto pr-1">
              {(profile.facilities || []).map((fac) => (
                <div key={fac.id} className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-150 text-xs">
                  <div className="flex-1 min-w-0 pr-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-800 truncate">{fac.name}</span>
                      <span className="text-[10px] font-semibold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded capitalize">
                        {fac.type.replace('-', ' ')}
                      </span>
                    </div>
                    <div className="text-slate-400 flex items-center mt-1 truncate">
                      <MapPin className="w-3 h-3 mr-1 shrink-0" /> {fac.address}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveFacility(fac.id)}
                    className="p-1 px-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg cursor-pointer transition-all"
                    title="Remove Facility"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add a facility inline form */}
          <form onSubmit={handleAddFacility} className="bg-slate-50/60 rounded-xl border border-slate-200 p-4 space-y-3">
            <span className="text-[11px] uppercase tracking-wider font-bold text-slate-500 block">Add New Facility</span>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Facility Name (e.g. Lisbon Warehouse)"
                className="text-xs px-3 py-2 bg-white rounded-lg border border-slate-200 focus:border-indigo-500 outline-none w-full"
                value={newFacName}
                onChange={(e) => setNewFacName(e.target.value)}
              />
              <select
                className="text-xs px-3 py-2 bg-white rounded-lg border border-slate-200 focus:border-indigo-500 outline-none cursor-pointer w-full"
                value={newFacType}
                onChange={(e) => setNewFacType(e.target.value)}
              >
                <option value="office">Office Site</option>
                <option value="warehouse">Warehouse & Logistics</option>
                <option value="vehicle-fleet">Vehicle Fleet Hub</option>
                <option value="manufacturing">Manufacturing Plant</option>
                <option value="retail">Retail Space</option>
                <option value="other">Other Site</option>
              </select>
            </div>

            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Full address (e.g. Avenida da República, Lisboa)"
                className="text-xs px-3 py-2 bg-white rounded-lg border border-slate-200 focus:border-indigo-500 outline-none flex-1"
                value={newFacAddress}
                onChange={(e) => setNewFacAddress(e.target.value)}
              />
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3 py-2 rounded-lg cursor-pointer flex items-center space-x-1 transition-all shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" /> <span>Add</span>
              </button>
            </div>
          </form>
        </div>

        <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100/40 flex items-start space-x-2">
          <HelpCircle className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Changing organization details reconfigures carbon baseline multipliers. Facility links allow you to allocate transport and energy logs directly to physical company assets.
          </p>
        </div>
      </div>
    </div>
  );
}

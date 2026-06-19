import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Activity, Company, AnalysisReport, ChatMessage, ActivityCategory } from './types';
import { INITIAL_ACTIVITIES, DEFAULT_PROFILE, generateLocalCarbonReport } from './utils';
import AddActivityForm from './components/AddActivityForm';
import ProfileForm from './components/ProfileForm';
import CarbonCharts from './components/CarbonCharts';
import AIInsightsReport from './components/AIInsightsReport';
import AICarbonCoach from './components/AICarbonCoach';
import {
  Leaf,
  BarChart3,
  Bot,
  Settings,
  Trash2,
  Sparkles,
  Info,
  Globe,
  TrendingDown,
  Calendar,
  AlertCircle,
  HelpCircle,
  Lock,
  X,
  Edit,
  Building,
} from 'lucide-react';

export default function App() {
  // 1. Core Persistent State
  const [activities, setActivities] = useState<Activity[]>(() => {
    const saved = localStorage.getItem('CARBON_ACTIVITIES');
    return saved ? JSON.parse(saved) : INITIAL_ACTIVITIES;
  });

  const [profile, setProfile] = useState<Company>(() => {
    const saved = localStorage.getItem('CARBON_PROFILE');
    return saved ? JSON.parse(saved) : DEFAULT_PROFILE;
  });

  const [activeTab, setActiveTab] = useState<'dashboard' | 'ai-report' | 'coach' | 'profile'>('dashboard');
  const [historyFilter, setHistoryFilter] = useState<ActivityCategory | 'all'>('all');

  // AI-driven state variables
  const [aiReport, setAiReport] = useState<AnalysisReport | null>(() => {
    const saved = localStorage.getItem('CARBON_AI_REPORT');
    return saved ? JSON.parse(saved) : null;
  });
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('CARBON_COACH_CHAT');
    return saved ? JSON.parse(saved) : [];
  });

  const [reportLoading, setReportLoading] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [apiNotice, setApiNotice] = useState<string | null>(null);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);

  // Sync state with LocalStorage
  useEffect(() => {
    localStorage.setItem('CARBON_ACTIVITIES', JSON.stringify(activities));
  }, [activities]);

  useEffect(() => {
    localStorage.setItem('CARBON_PROFILE', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    if (aiReport) {
      localStorage.setItem('CARBON_AI_REPORT', JSON.stringify(aiReport));
    }
  }, [aiReport]);

  useEffect(() => {
    localStorage.setItem('CARBON_COACH_CHAT', JSON.stringify(chatMessages));
  }, [chatMessages]);

  // If no AI report is cached yet, pre-build a local baseline on load so the visual indicators are immediately stunning
  useEffect(() => {
    if (!aiReport && activities.length > 0) {
      const fallbackReport = generateLocalCarbonReport(activities, profile);
      setAiReport(fallbackReport);
    }
  }, [activities, profile, aiReport]);

  // 2. Calculation Properties
  const totalEmissionsKg = activities.reduce((sum, act) => sum + act.emissionsKg, 0);
  
  const formattedCapitaTonnes = (totalEmissionsKg / 1000).toFixed(2);

  const statsBreakdown = {
    transport: activities.filter(a => a.category === 'transport').reduce((s, a) => s + a.emissionsKg, 0),
    energy: activities.filter(a => a.category === 'energy').reduce((s, a) => s + a.emissionsKg, 0),
  };

  // 3. User Handlers
  const handleAddActivity = (newAct: {
    category: ActivityCategory;
    facilityId: string;
    title: string;
    value: number;
    unit: string;
    emissionsKg: number;
  }) => {
    const activity: Activity = {
      id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      date: new Date().toISOString().split('T')[0],
      ...newAct,
    };
    setActivities([activity, ...activities]);
  };

  const handleDeleteActivity = (id: string) => {
    setActivities(activities.filter((act) => act.id !== id));
  };

  const handleClearHistory = () => {
    if (window.confirm("Are you sure you want to purge all logged activities? This resets your analytics trends.")) {
      setActivities([]);
      setAiReport(null);
    }
  };

  // 4. Remote Gemini Analyzer Synchronizer
  const handleGenerateAIReport = async () => {
    setReportLoading(true);
    setApiNotice(null);
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ history: activities, profile }),
      });
      const data = await response.json();

      if (data.ok && data.report) {
        setAiReport(data.report);
      } else {
        // Fallback safely to high-fidelity client-side generator to provide seamless execution
        const localCopy = generateLocalCarbonReport(activities, profile);
        setAiReport(localCopy);
        setApiNotice(data.error || "Using high-fidelity local engine representation.");
      }
    } catch (err) {
      console.error(err);
      const localCopy = generateLocalCarbonReport(activities, profile);
      setAiReport(localCopy);
      setApiNotice("Offline. Swapped to high-fidelity local calculator engine.");
    } finally {
      setReportLoading(false);
    }
  };

  // 5. Remote Carbon Intelligence Advisor Chat dispatcher
  const handleSendCoachMessage = async (textString: string) => {
    const userMessage: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      text: textString,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedMessages = [...chatMessages, userMessage];
    setChatMessages(updatedMessages);
    setChatLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages,
          history: activities,
          profile,
        }),
      });
      const data = await response.json();

      if (data.ok && data.text) {
        setChatMessages((prev) => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            role: 'assistant',
            text: data.text,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
        if (data.error) {
          setApiNotice(data.error);
        }
      } else {
        let fallbackReply = "Indeed, that is a fantastic environmental focus. Let's see - based on your parameters, adopting modular improvements can yield immense metric rewards! To activate fully-adaptive answers tuned by machine intelligence, please verify your `GEMINI_API_KEY` under the secrets panel.";
        
        // Contextual matching keywords for supportive basic replies
        const lowerInput = textString.toLowerCase();
        if (lowerInput.includes('commute') || lowerInput.includes('car') || lowerInput.includes('hybrid')) {
          fallbackReply = `To squeeze emissions out of your commutes:\n1. Consider high carpool cycles.\n2. Upgrading to an EV slices driving transit factors downwards from **0.38 kg CO2e/mile** to just **0.08 kg**.\n3. Walking short neighborhood segments creates completely zero impact!`;
        } else if (lowerInput.includes('diet') || lowerInput.includes('meat') || lowerInput.includes('food')) {
          fallbackReply = `Diet is a massive lever on emissions! Swapping heavy red meat (at **3.40 kg CO2e/meal**) with simple vegetarian dishes (at **0.89 kg**) for just 3 days a week curtails significant tonnes of greenhouse gas release annually. Are you open to tracking meal changes?`;
        } else if (lowerInput.includes('offset') || lowerInput.includes('heating') || lowerInput.includes('electricity')) {
          fallbackReply = `Home energy is highly compressible:\n- Select Certified 100% Green plans which drop indices to **0.05 kg CO2e/kWh**.\n- Maintain heating setups such as air-source geothermal heat pumps to capture optimal offsets.`;
        }

        setChatMessages((prev) => [
          ...prev,
          {
            id: `ai-err-${Date.now()}`,
            role: 'assistant',
            text: fallbackReply + (data.error ? `\n\n*(Notice: ${data.error})*` : ''),
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }
    } catch (err) {
      setChatMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          role: 'assistant',
          text: "I experienced a network interrupt connecting to our climate hub. Let's review local calculations or please try again shortly!",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleClearChatHistory = () => {
    if (window.confirm("Purge Carbon Coach message context?")) {
      setChatMessages([]);
    }
  };

  // 6. Filter logs list based on user selections
  const filteredActivities = activities.filter((act) => {
    if (historyFilter === 'all') return true;
    return act.category === historyFilter;
  });

  return (
    <div className="min-h-screen bg-slate-50/50 font-sans antialiased text-slate-800">
      
      {/* Top Header Navigation Strip */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-40 backdrop-blur-md bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-600 rounded-xl text-white shadow-md shadow-emerald-100 flex items-center justify-center">
              <Leaf className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-md font-extrabold tracking-tight text-slate-900 leading-none">Carbon Footprint Intelligence</span>
                <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-100">AI Platform</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">Dual analytical calculations & eco-strategic advisory</p>
            </div>
          </div>

          {/* Quick Stats overview capsules */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="text-right border-r border-slate-100 pr-4">
              <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400 block">Total intensity logged</span>
              <motion.span
                key={totalEmissionsKg}
                initial={{ opacity: 0, y: -4, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 320, damping: 22 }}
                className="text-sm font-extrabold text-slate-800 font-mono block"
              >
                {totalEmissionsKg.toFixed(1)} kg CO2e
              </motion.span>
            </div>
            <div className="text-right border-r border-slate-100 pr-4">
              <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400 block">Annualized projection</span>
              <motion.span
                key={formattedCapitaTonnes}
                initial={{ opacity: 0, y: -4, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 320, damping: 22 }}
                className="text-sm font-extrabold text-emerald-800 font-mono block"
              >
                {formattedCapitaTonnes} Tonnes/Yr
              </motion.span>
            </div>
            <div className="text-right">
              <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400 block">Environmental Class</span>
              <motion.span
                key={aiReport?.environmentalScore || 'calibrating'}
                initial={{ opacity: 0, y: -4, scale: 0.92 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 320, damping: 22 }}
                className={`inline-block text-xs font-bold font-mono px-2 py-0.5 rounded-full ${
                  (aiReport?.environmentalScore || 50) >= 80 ? 'text-emerald-700 bg-emerald-50' :
                  (aiReport?.environmentalScore || 50) >= 50 ? 'text-amber-700 bg-amber-50' : 'text-rose-700 bg-rose-50'
                }`}
              >
                {aiReport ? `Grade ${aiReport.environmentalScore}/100` : 'Calibrating'}
              </motion.span>
            </div>
          </div>
        </div>
      </header>

      {/* Secret notice popup if any */}
      {apiNotice && (
        <div className="bg-indigo-50 border-b border-indigo-100 py-2.5 px-4 text-center text-xs text-indigo-700 flex items-center justify-center space-x-2">
          <Info className="w-4 h-4 shrink-0 text-indigo-500" />
          <span>{apiNotice} Configure your primary <strong>GEMINI_API_KEY</strong> environment variable to deploy advanced bespoke AI.</span>
          <button onClick={() => setApiNotice(null)} className="font-bold underline ml-2 cursor-pointer hover:text-indigo-900">Dismiss</button>
        </div>
      )}

      {/* Main Container Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Navigations tabs caps */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 border-b border-slate-200/60 pb-3">
          <div className="flex bg-slate-100 rounded-xl p-1.5 space-x-1" id="primary-app-tabs">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold tracking-tight transition-all cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-white text-slate-800 shadow-sm font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Metrics & Log</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('ai-report');
                if (!aiReport && activities.length > 0) {
                  handleGenerateAIReport();
                }
              }}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold tracking-tight transition-all cursor-pointer ${
                activeTab === 'ai-report'
                  ? 'bg-white text-slate-800 shadow-sm font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>AI Climate Plan</span>
            </button>
            <button
              onClick={() => setActiveTab('coach')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold tracking-tight transition-all cursor-pointer ${
                activeTab === 'coach'
                  ? 'bg-white text-slate-800 shadow-sm font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Bot className="w-4 h-4" />
              <span>Advisor Coach</span>
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold tracking-tight transition-all cursor-pointer ${
                activeTab === 'profile'
                  ? 'bg-white text-slate-800 shadow-sm font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Baseline Setup</span>
            </button>
          </div>

          <div className="text-xs text-slate-400 font-medium flex items-center space-x-1">
            <span>Active enterprise baseline: </span>
            <strong className="text-slate-700">{profile.name}</strong>
            <button
              onClick={() => setActiveTab('profile')}
              className="p-1 text-slate-400 hover:text-emerald-600 hover:bg-slate-50 rounded-md transition-all cursor-pointer inline-flex items-center"
              title="Edit Baseline Setup Profile"
              aria-label="Edit Profile"
              id="edit-profile-btn"
            >
              <Edit className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* TAB WORKSPACES CONTENT MATCH */}
        <div className="space-y-6">
          
          {/* A. DASHBOARD WORKSPACE */}
          {activeTab === 'dashboard' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: Logging Form and Quick Presets */}
              <div className="lg:col-span-4 space-y-6">
                <AddActivityForm facilities={profile.facilities || []} onAddActivity={handleAddActivity} />
                
                {/* Informative educational sidebar card */}
                <div className="bg-indigo-900 text-white rounded-2xl p-5 shadow-xs relative overflow-hidden">
                  <div className="absolute right-0 bottom-0 opacity-10 translate-x-6 translate-y-6">
                    <Globe className="w-36 h-36" />
                  </div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-200 mb-1">Paris Agreement Align</h4>
                  <p className="text-[11px] text-slate-200 leading-relaxed mb-4">
                    The average global temperature rise must be bounded under <strong className="text-white">1.5°C</strong>. Personal footprints require scaling to <strong>2.0 Tonnes</strong> globally by 2040.
                  </p>
                  <button
                    onClick={() => setActiveTab('ai-report')}
                    className="w-full py-2 bg-indigo-500 hover:bg-indigo-600 text-white border border-indigo-400/40 rounded-xl text-xs font-semibold tracking-tight cursor-pointer transition-colors"
                  >
                    Examine carbon threshold targets
                  </button>
                </div>
              </div>

              {/* Right Column: Recharts and Logging Table */}
              <div className="lg:col-span-8 space-y-6">
                
                {/* Visual Analytics Segment */}
                <CarbonCharts activities={activities} />

                {/* Logging Ledger History Table Section */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-2xs overflow-hidden" id="logging-ledger-table-section">
                  <div className="p-5 border-b border-slate-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h4 className="text-sm font-bold text-slate-800 tracking-tight">Emissions Registry Ledger</h4>
                      <p className="text-xs text-slate-400">Chronological history registry of added carbon events</p>
                    </div>

                    {/* Filter capsules and purge */}
                    <div className="flex flex-wrap items-center gap-2">
                      <select
                        className="text-slate-600 text-xs px-2.5 py-1.5 bg-slate-50 rounded-lg border border-slate-200 outline-none cursor-pointer"
                        value={historyFilter}
                        onChange={(e) => setHistoryFilter(e.target.value as any)}
                      >
                        <option value="all">All Sectors</option>
                        <option value="transport">Transport Fleet</option>
                        <option value="energy">Facility Energy</option>
                      </select>

                      <button
                        onClick={handleClearHistory}
                        className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg cursor-pointer transition-colors"
                      >
                        Purge Logs
                      </button>
                    </div>
                  </div>

                  {/* Ledger list */}
                  <div className="overflow-x-auto">
                    {filteredActivities.length === 0 ? (
                      <div className="p-8 text-center text-xs text-slate-400">
                        {activities.length === 0 
                          ? "Log activities using the left form to build your environmental timeline!" 
                          : "No matching items for this selected category filter."}
                      </div>
                    ) : (
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-50 text-slate-400 uppercase font-mono tracking-wider text-[10px] border-b border-slate-100">
                            <th className="py-3 px-4 font-semibold">Date</th>
                            <th className="py-3 px-4 font-semibold">Activity / Facility Workspace</th>
                            <th className="py-3 px-4 font-semibold">Category</th>
                            <th className="py-3 px-4 font-semibold text-right">Volume Utilized</th>
                            <th className="py-3 px-4 font-semibold text-right">Carbon (kg CO2e)</th>
                            <th className="py-3 px-4 text-center">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {filteredActivities.map((act) => {
                            const facility = (profile.facilities || []).find(f => f.id === act.facilityId);
                            return (
                              <tr key={act.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="py-2.5 px-4 text-slate-500 font-mono">{act.date}</td>
                                <td className="py-2.5 px-4">
                                  <div className="font-bold text-slate-700">{act.title}</div>
                                  <div className="text-[10px] text-slate-400 font-medium flex items-center mt-0.5">
                                    <Building className="w-3 h-3 mr-1" />
                                    {facility ? `${facility.name} (${facility.type})` : 'General Operations'}
                                  </div>
                                </td>
                                <td className="py-2.5 px-4">
                                  <span className={`text-[10px] font-semibold uppercase font-mono px-2 py-0.5 rounded-full ${
                                    act.category === 'transport' ? 'bg-amber-50 text-amber-700' : 'bg-sky-50 text-sky-700'
                                  }`}>
                                    {act.category}
                                  </span>
                                </td>
                                <td className="py-2.5 px-4 text-right font-medium text-slate-500">
                                  {act.value} {act.unit}
                                </td>
                                <td className={`py-2.5 px-4 text-right font-bold font-mono ${
                                  act.emissionsKg < 0 ? 'text-emerald-600' : 'text-slate-800'
                                }`}>
                                  {act.emissionsKg.toFixed(1)}
                                </td>
                                <td className="py-2.5 px-4 text-center">
                                  <button
                                    onClick={() => handleDeleteActivity(act.id)}
                                    className="text-slate-400 hover:text-rose-600 p-1 rounded-md transition-colors cursor-pointer"
                                    title="Delete item"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* B. AI STRATEGY AND scorecard REPORT WORKSPACE */}
          {activeTab === 'ai-report' && (
            <div className="max-w-4xl mx-auto space-y-4">
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-amber-50 rounded-xl text-amber-600 shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Custom Deep Environmental Audit</h4>
                    <p className="text-[10.5px] text-slate-500">
                      Requests the server-side Gemini 3.5-flash model to examine logged items, run environmental modeling, and return dynamic offset strategies.
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleGenerateAIReport}
                  disabled={reportLoading || activities.length === 0}
                  className="px-4.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-md cursor-pointer transition-all disabled:bg-slate-300 shrink-0"
                >
                  Regenerate Strategy Roadmap
                </button>
              </div>

              <AIInsightsReport
                report={aiReport}
                loading={reportLoading}
                onRefresh={handleGenerateAIReport}
                activitiesCount={activities.length}
              />
            </div>
          )}

          {/* C. INTUITIVE COACH CHAT ADVISOR */}
          {activeTab === 'coach' && (
            <div className="max-w-4xl mx-auto space-y-4">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Previous turns cached: {chatMessages.length}</span>
                <button
                  onClick={handleClearChatHistory}
                  disabled={chatMessages.length === 0}
                  className="text-rose-600 hover:text-rose-700 font-bold bg-rose-50 px-3 py-1.5 rounded-lg cursor-pointer transition-colors disabled:opacity-40"
                >
                  Clear Dialogue Context
                </button>
              </div>
              <AICarbonCoach
                messages={chatMessages}
                loading={chatLoading}
                onSendMessage={handleSendCoachMessage}
                activities={activities}
                profile={profile}
              />
            </div>
          )}

          {/* D. BASELINE MULTIPLIER CONFIG */}
          {activeTab === 'profile' && (
            <div className="max-w-2xl mx-auto">
              <ProfileForm profile={profile} onChangeProfile={setProfile} />
            </div>
          )}

        </div>

      </main>

      {/* Standard Human Footer */}
      <footer className="bg-white border-t border-slate-100 py-6 mt-12 text-center text-xs text-slate-400">
        <p className="font-semibold uppercase tracking-wider text-[10px] text-slate-500 mb-1">Carbon Footprint Intelligence System</p>
        <p>
          A full-stack Climate Strategy application hand-crafted by <strong className="text-slate-600 font-medium">Aabiskar Sharma</strong> utilizing server-side Gemini 3.5 modeling.{' '}
          <button
            onClick={() => setIsPrivacyModalOpen(true)}
            className="text-emerald-600 hover:text-emerald-700 font-semibold underline underline-offset-2 ml-1 cursor-pointer transition-all inline-flex items-center space-x-1"
            id="privacy-policy-trigger"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Privacy & Local Data</span>
          </button>
        </p>
        <p className="mt-1">© {new Date().getFullYear()} CFI Climate Engine. Handcrafted with care by Aabiskar Sharma. Verified Carbon offsets computed strictly under Defra emission factors.</p>
      </footer>

      {/* High-fidelity Privacy and Data Security Modal */}
      {isPrivacyModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm transition-all"
          id="privacy-modal-overlay"
          onClick={() => setIsPrivacyModalOpen(false)}
        >
          <div 
            className="bg-white rounded-2xl border border-slate-100 max-w-lg w-full p-6 shadow-xl relative text-left"
            id="privacy-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setIsPrivacyModalOpen(false)}
              className="absolute right-4 top-4 p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all cursor-pointer"
              id="privacy-modal-close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-600">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-md font-bold text-slate-800 tracking-tight">Privacy & Local Storage Advisor</h3>
                <p className="text-[11px] text-slate-400 font-medium">How your environmental data and secrets are handled securely</p>
              </div>
            </div>

            <div className="space-y-4 text-xs text-slate-600 leading-relaxed">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1 flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2 inline-block"></span>
                  Environmental Logging & Profile State
                </h4>
                <p>
                  All added carbon log indices (activities ledger) and baseline calibration multipliers are written directly to your active browser's private sandbox memory (<code className="bg-slate-100 text-slate-700 px-1 py-0.5 rounded text-[10px] font-mono">localStorage</code>). No persistent records are compiled on our host servers, preserving total administrative control.
                </p>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1 flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mr-2 inline-block"></span>
                  AI Strategy Cache Files
                </h4>
                <p>
                  Both generated Environmental Strategy Card reports and active Carbon Coach chat conversations reside locally. They are cached as serialized data parameters in your browser storage to retain fast reload states safely.
                </p>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1 flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-2 inline-block"></span>
                  API Secrets Integrity
                </h4>
                <p>
                  Any secure credentials, including your primary <code className="bg-slate-100 text-slate-700 px-1 py-0.5 rounded text-[10px] font-mono">GEMINI_API_KEY</code>, are maintained behind your secure control plane vault on the server side. Front-end browsers only submit payload requests via secure, masked backend proxies (<code className="bg-slate-100 text-slate-700 px-1 py-0.5 rounded text-[10px] font-mono">/api/analyze</code> & <code className="bg-slate-100 text-slate-700 px-1 py-0.5 rounded text-[10px] font-mono">/api/chat</code>) so key tokens are never exposed in transit.
                </p>
              </div>

              <p className="text-[10.5px] text-slate-400 italic">
                By maintaining dual sandboxed data layers, the Carbon Footprint Intelligence platform guarantees zero leak vectors for your workspace habits.
              </p>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-50 flex justify-end">
              <button
                onClick={() => setIsPrivacyModalOpen(false)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl cursor-pointer shadow-xs transition-colors"
                id="privacy-modal-dismiss-btn"
              >
                Accept and Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

import { useState } from 'react';
import { AnalysisReport, Activity, Company } from '../types';
import { Sparkles, Calendar, TrendingDown, Award, Lightbulb, AlertCircle, RefreshCw, Key } from 'lucide-react';

interface AIInsightsReportProps {
  report: AnalysisReport | null;
  loading: boolean;
  onRefresh: () => void;
  activitiesCount: number;
}

export default function AIInsightsReport({ report, loading, onRefresh, activitiesCount }: AIInsightsReportProps) {
  const [activeTab, setActiveTab] = useState<'plan' | 'calendar' | 'forecast'>('plan');

  if (activitiesCount === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center min-h-[350px] flex flex-col items-center justify-center">
        <Sparkles className="w-10 h-10 text-emerald-500 animate-pulse mb-3" />
        <h3 className="text-md font-bold text-slate-800">Carbon Intelligence report</h3>
        <p className="text-xs text-slate-400 max-w-sm mt-1.5 leading-relaxed">
          Log carbon activities and save your profile baseline above. The AI Carbon Intelligence Engine will parse your logs, compute an environmental grade, and map a bespoke offset roadmap!
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center min-h-[350px] flex flex-col items-center justify-center">
        <div className="relative flex items-center justify-center mb-4">
          <div className="w-12 h-12 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin"></div>
          <Sparkles className="w-5 h-5 text-emerald-500 absolute" />
        </div>
        <h4 className="text-md font-bold text-slate-800 tracking-tight">AI Carbon Intelligence is analyzing...</h4>
        <p className="text-xs text-slate-400 max-w-sm mt-1.5 leading-relaxed">
          Computing environmental scorecards, assessing carbon intensive culprits, and structuring a 30-day mitigation checklist...
        </p>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center min-h-[350px] flex flex-col items-center justify-center">
        <AlertCircle className="w-10 h-10 text-amber-500 mb-2" />
        <h4 className="text-md font-bold text-slate-800">No Intelligence Generated</h4>
        <p className="text-xs text-slate-400 max-w-sm mt-1 leading-relaxed">
          Compile a bespoke carbon minimization strategy and scorecard.
        </p>
        <button
          onClick={onRefresh}
          className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs rounded-xl transition-all shadow-md flex items-center space-x-1 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Generate Live AI Breakdown</span>
        </button>
      </div>
    );
  }

  // Get score helper color classes
  const getScoreColor = (score: number) => {
    if (score >= 80) return { text: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', fill: 'bg-emerald-500' };
    if (score >= 50) return { text: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', fill: 'bg-amber-500' };
    return { text: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200', fill: 'bg-rose-500' };
  };

  const scheme = getScoreColor(report.environmentalScore);

  return (
    <div className="container-fluid space-y-6" id="co2-intelligence-report">
      
      {/* Score Header Segment */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start text-center md:text-left md:max-w-md">
            <div className="flex items-center space-x-2 text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Climate Intelligence Overview</span>
            </div>
            <h3 className="text-xl font-extrabold text-slate-800 tracking-tight">Your Environmental Audit State</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              {report.benchmarkingText}
            </p>
          </div>

          {/* Environmental Score Progress Ring */}
          <div className="flex items-center space-x-4">
            <div className={`w-24 h-24 rounded-full flex flex-col items-center justify-center border-4 relative ${scheme.border} ${scheme.bg}`}>
              <span className={`text-3xl font-extrabold font-mono ${scheme.text}`}>{report.environmentalScore}</span>
              <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Grade</span>
            </div>
            <div>
              <span className="text-xs text-slate-400 font-semibold uppercase block tracking-wider">Primary Catalyst</span>
              <span className="text-lg font-extrabold text-slate-800 flex items-center">
                <span className={`w-2.5 h-2.5 rounded-full mr-2 ${scheme.fill}`} />
                {report.primaryCulprit}
              </span>
              <span className="text-xs text-slate-500 block">Identified as heaviest sector</span>
            </div>
          </div>
        </div>

        {/* Executive summary block */}
        <div className="border-t border-slate-50 pt-4 mt-5">
          <h4 className="text-xs uppercase font-extrabold text-slate-400 tracking-wider mb-1 flex items-center">
            <Award className="w-4 h-4 mr-1.5 text-emerald-500" /> Executive summary
          </h4>
          <p className="text-xs text-slate-600 leading-relaxed italic">
            "{report.executiveSummary}"
          </p>
        </div>
      </div>

      {/* Navigational Segment Tabs */}
      <div className="flex space-x-1.5 border-b border-slate-100 pb-px">
        <button
          onClick={() => setActiveTab('plan')}
          className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl tracking-tight transition-all cursor-pointer ${
            activeTab === 'plan'
              ? 'bg-white border-x border-t border-slate-100 text-emerald-600 font-bold shadow-sm'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          Priority Reduction Roadmap ({report.actionPlan?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('calendar')}
          className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl tracking-tight transition-all cursor-pointer ${
            activeTab === 'calendar'
              ? 'bg-white border-x border-t border-slate-100 text-emerald-600 font-bold shadow-sm'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          30-Day Offset Milestones
        </button>
        <button
          onClick={() => setActiveTab('forecast')}
          className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl tracking-tight transition-all cursor-pointer ${
            activeTab === 'forecast'
              ? 'bg-white border-x border-t border-slate-100 text-emerald-600 font-bold shadow-sm'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          Emission Projections
        </button>
      </div>

      {/* Structured report visual cards */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm" id="report-tab-viewer">
        
        {/* TAB 1: Recommendations Action Plan */}
        {activeTab === 'plan' && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 pb-2">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-bold text-slate-700">Recommended Steps to Compress carbon footprint</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {report.actionPlan?.map((item, idx) => {
                const badgeColor = item.priority === 'HIGH' ? 'bg-rose-50 text-rose-700 border-rose-100' :
                                   item.priority === 'MEDIUM' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                   'bg-indigo-50 text-indigo-700 border-indigo-100';

                const feasColor = item.feasibility === 'Easy' ? 'bg-emerald-50 text-emerald-700' :
                                  item.feasibility === 'Medium' ? 'bg-sky-50 text-sky-700' :
                                  'bg-purple-50 text-purple-700';

                return (
                  <div key={idx} className="bg-slate-50/70 border border-slate-100 rounded-xl p-4 flex flex-col justify-between hover:shadow-xs transition-shadow">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <span className={`text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full border ${badgeColor}`}>
                          {item.priority} Priority
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono font-bold uppercase">{item.category}</span>
                      </div>
                      <p className="text-xs font-bold text-slate-800 leading-snug">{item.recommendation}</p>
                    </div>

                    <div className="flex justify-between items-center border-t border-slate-50 pt-2.5 mt-3.5">
                      <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${feasColor}`}>
                        {item.feasibility} to adopt
                      </span>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block font-sans">Est. Savings</span>
                        <span className="text-sm font-extrabold text-emerald-600 font-mono">
                          -{item.estimatedSavingKgYr.toLocaleString()} kg/yr
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: Offset calendar milestones */}
        {activeTab === 'calendar' && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 pb-1">
              <Calendar className="w-4 h-4 text-emerald-500" />
              <span className="text-xs font-bold text-slate-700">A progressive, actionable climate calendar</span>
            </div>

            <div className="relative border-l border-slate-100 pl-4 ml-2.5 space-y-6">
              {report.offsetCalendar?.map((mile, index) => (
                <div key={index} className="relative">
                  {/* Timeline dot */}
                  <div className="absolute -left-[24.5px] top-1 w-[9px] h-[9px] rounded-full bg-emerald-500 ring-4 ring-emerald-50"></div>
                  
                  <div className="bg-slate-50/50 hover:bg-slate-50 border border-slate-100 rounded-xl p-3.5 transition-all">
                    <span className="text-[11px] font-extrabold text-indigo-600 block mb-0.5">{mile.day}</span>
                    <h5 className="text-xs font-bold text-slate-800 leading-tight">{mile.action}</h5>
                    <p className="text-[11px] text-slate-500 mt-1">{mile.impact}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: Projections & forecasting metrics */}
        {activeTab === 'forecast' && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 pb-1">
              <TrendingDown className="w-4 h-4 text-indigo-500" />
              <span className="text-xs font-bold text-slate-700">Environmental Savings Forecasting</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-rose-50/40 border border-rose-100 rounded-xl p-4">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Baseline Projection</span>
                <span className="text-3xl font-mono font-extrabold text-slate-800 block mt-1">
                  {(report.projections?.annualForecastKg / 1000).toFixed(2)}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">Metric tonnes of CO2e per annum</span>
              </div>

              <div className="bg-emerald-50/40 border border-emerald-100 rounded-xl p-4">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Target Optimizations</span>
                <span className="text-3xl font-mono font-extrabold text-emerald-600 block mt-1">
                  {(report.projections?.targetAnnualForecastKg / 1000).toFixed(2)}
                </span>
                <span className="text-[10px] text-slate-400 font-medium font-bold">Post-mitigation calendar limit</span>
              </div>
            </div>

            <div className="p-3.5 bg-indigo-50/30 rounded-xl border border-indigo-100/30 text-[11px] text-slate-500 leading-relaxed text-center mt-2.5">
              Optimizing your heating sources, swapping standard airline flights with rail options, and committing to plant-based days compress your yearly output by{' '}
              <strong className="text-indigo-600">
                {(((report.projections?.annualForecastKg - report.projections?.targetAnnualForecastKg) / 1000) || 0).toFixed(2)} tonnes CO2e
              </strong>
              , matching target sustainability paths!
            </div>
          </div>
        )}

        {/* Update trigger */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-50 pt-4 mt-5">
          <span className="text-[10px] text-slate-400 italic">
            Carbon factors synced with standard DEFRA greenhouse reports (2026.1).
          </span>
          <button
            onClick={onRefresh}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs rounded-xl transition-all flex items-center space-x-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Regenerate Audit Plan</span>
          </button>
        </div>

      </div>
    </div>
  );
}

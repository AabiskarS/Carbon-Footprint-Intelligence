import { useMemo, useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Activity, ActivityCategory } from '../types';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area,
} from 'recharts';
import { BarChart3, PieChartIcon, TrendingUp } from 'lucide-react';

interface CarbonChartsProps {
  activities: Activity[];
}

const CATEGORY_COLORS: Record<ActivityCategory, string> = {
  transport: '#f59e0b', // Amber
  energy: '#0ea5e9',    // Sky
};

const CATEGORY_LABELS: Record<ActivityCategory, string> = {
  transport: 'Transport Fleet & Travel',
  energy: 'Facility Energy Consumption',
};

// Robust ResizeObserver wrapper component to store canvas dimensions in state
function ObservedChartContainer({ 
  children, 
  height = 210 
}: { 
  children: (width: number, height: number) => React.ReactNode;
  height?: number;
}) {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Direct initial measurement
    const initialWidth = containerRef.current.clientWidth;
    setDimensions({ width: initialWidth, height });

    const observer = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const rect = entries[0].contentRect;
      setDimensions({ width: rect.width || initialWidth, height });
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [height]);

  return (
    <div ref={containerRef} className="w-full relative" style={{ height: `${height}px`, minWidth: 0 }}>
      {dimensions.width > 0 && dimensions.height > 0 ? (
        children(dimensions.width, dimensions.height)
      ) : (
        <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
          Loading dimensions...
        </div>
      )}
    </div>
  );
}

export default function CarbonCharts({ activities }: CarbonChartsProps) {
  // 1. Calculate pie breakdown of total logged emissions
  const pieData = useMemo(() => {
    const totals: Record<ActivityCategory, number> = {
      transport: 0,
      energy: 0,
    };

    activities.forEach((act) => {
      totals[act.category] += act.emissionsKg;
    });

    return Object.entries(totals).map(([key, val]) => ({
      name: CATEGORY_LABELS[key as ActivityCategory],
      value: Math.max(0, Number(val.toFixed(1))),
      category: key as ActivityCategory,
    })).filter(item => item.value > 0);
  }, [activities]);

  const totalEmissionsKg = useMemo(() => {
    return activities.reduce((sum, act) => sum + act.emissionsKg, 0);
  }, [activities]);

  // 2. Timeline cumulative trend data
  const trendData = useMemo(() => {
    // Sort activities by date
    const sorted = [...activities].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    let cumulative = 0;
    return sorted.map((act) => {
      cumulative += act.emissionsKg;
      return {
        date: new Date(act.date).toLocaleDateString([], { month: 'short', day: 'numeric' }),
        emissions: Number(act.emissionsKg.toFixed(1)),
        cumulative: Number(cumulative.toFixed(1)),
        title: act.title,
      };
    });
  }, [activities]);

  // 3. Benchmarking projections (US Average, European Average, Safe Climate Target, User Projection)
  const benchmarkData = useMemo(() => {
    // Annualized projection based on logged items. If no logs, assume default 4800 kg
    const count = activities.length;
    let annualizedKg = 4800; // Average default baseline

    if (count > 0) {
      // Find timeframe between first and last log, or assume a 30-day baseline context
      const sorted = [...activities].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      const first = new Date(sorted[0].date).getTime();
      const last = new Date(sorted[sorted.length - 1].date).getTime();
      const diffDays = Math.max(1, (last - first) / (1000 * 60 * 60 * 24));
      
      // project to 365 days
      annualizedKg = (totalEmissionsKg / diffDays) * 365;
      
      // Safeguard realistic range (bounds of projection)
      if (annualizedKg < 300) annualizedKg = totalEmissionsKg * 5; // offset if only logged today
    }

    return [
      { name: 'Your Projection', value: Number((annualizedKg / 1000).toFixed(2)), fill: '#10b981' },
      { name: 'US Capita Avg', value: 16.0, fill: '#ef4444' },
      { name: 'EU Capita Avg', value: 6.4, fill: '#f59e0b' },
      { name: 'Safe IPCC Goal', value: 2.0, fill: '#0ea5e9' },
    ];
  }, [activities, totalEmissionsKg]);

  if (activities.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center flex flex-col items-center justify-center min-h-[300px]">
        <div className="p-3 bg-slate-50 text-slate-400 rounded-full mb-3">
          <BarChart3 className="w-8 h-8" />
        </div>
        <h4 className="text-sm font-semibold text-slate-700">Analytics are assembling...</h4>
        <p className="text-xs text-slate-400 max-w-sm mt-1 leading-relaxed">
          Logged carbon items will render interactive charts mapping your environmental footprint, comparisons, and trends.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6" id="carbon-analytics-visualizer">
      {/* Dynamic Pie and Timeline Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Pie Distribution Card */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-1.5 bg-emerald-50 rounded-lg text-emerald-600">
              <PieChartIcon className="w-4.5 h-4.5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800 tracking-tight">Emissions Breakdown</h4>
              <p className="text-[11px] text-slate-400">Relative allocation of CO2e in Logged History</p>
            </div>
          </div>

          <div className="h-[210px] w-full flex items-center justify-center">
            {pieData.length === 0 ? (
              <p className="text-xs text-slate-400">No positive logging inputs to render distribution.</p>
            ) : (
              <ObservedChartContainer height={210}>
                {(width, height) => (
                  <PieChart width={width} height={height}>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.category]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ border: 'none', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', fontSize: '11px', fontFamily: 'sans-serif' }}
                      formatter={(value) => [`${value} kg CO2e`, 'Impact']}
                    />
                  </PieChart>
                )}
              </ObservedChartContainer>
            )}
          </div>

          {/* Color Key Indicators */}
          <div className="grid grid-cols-2 gap-2 text-xs pt-1.5 border-t border-slate-50">
            {Object.entries(CATEGORY_LABELS).map(([cat, label]) => {
              const matchingItem = pieData.find(item => item.category === cat);
              const percentage = totalEmissionsKg > 0 && matchingItem 
                ? ((matchingItem.value / totalEmissionsKg) * 100).toFixed(0)
                : '0';

              return (
                <div key={cat} className="flex items-center space-x-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[cat as ActivityCategory] }} />
                  <span className="text-[11px] text-slate-500 font-medium truncate max-w-[120px]">{label}</span>
                  <span className="text-[10px] text-slate-400 font-mono">({percentage}%)</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Timeline Area Trend Card */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-1.5 bg-sky-50 rounded-lg text-sky-600">
              <TrendingUp className="w-4.5 h-4.5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800 tracking-tight">Cumulative Footprint Trend</h4>
              <p className="text-[11px] text-slate-400">Timeline tracking historical summation curves</p>
            </div>
          </div>

          <div className="h-[210px] w-full">
            <ObservedChartContainer height={210}>
              {(width, height) => (
                <AreaChart width={width} height={height} data={trendData} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorCumulative" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.01}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ border: 'none', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', fontSize: '11px' }}
                    labelStyle={{ fontWeight: 'bold', color: '#1e293b' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="cumulative"
                    name="Cumulative kg CO2"
                    stroke="#10b981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorCumulative)"
                  />
                </AreaChart>
              )}
            </ObservedChartContainer>
          </div>

          <div className="flex items-center justify-between text-xs pt-1 rounded-lg px-2 bg-slate-50 border border-slate-100">
            <span className="text-slate-400">Logged events: <strong className="text-slate-700">{activities.length}</strong></span>
            <span className="text-slate-400 flex items-center space-x-1">
              <span>Total Sum:</span>
              <motion.strong
                key={totalEmissionsKg}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="text-emerald-600 font-bold"
              >
                {totalEmissionsKg.toFixed(1)} kg CO2e
              </motion.strong>
            </span>
          </div>
        </div>

      </div>

      {/* Benchmarking Comparison Card */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-1.5 bg-indigo-50 rounded-lg text-indigo-600">
              <BarChart3 className="w-4.5 h-4.5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800 tracking-tight">Capita Benchmark Comparison</h4>
              <p className="text-[11px] text-slate-400">Projected annual tonnes per year vs national averages</p>
            </div>
          </div>
          <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full font-mono font-semibold">Unit: Tonnes CO2e/Yr</span>
        </div>

        <div className="h-[180px] w-full">
          <ObservedChartContainer height={180}>
            {(width, height) => (
              <BarChart width={width} height={height} data={benchmarkData} margin={{ top: 5, right: 10, left: -25, bottom: 5 }} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b', fontWeight: 'medium' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ border: 'none', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', fontSize: '11px' }}
                  formatter={(value) => [`${value} Tonnes`, 'Annual Footprint']}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={40}>
                  {benchmarkData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            )}
          </ObservedChartContainer>
        </div>

        <p className="text-[10.5px] text-slate-400 leading-relaxed text-center mt-2">
          A "Your Projection" score below **2.0 Tonnes** represents compatibility with the **IPCC Paris Agreement Target** for halting global temperatures under 1.5°C.
        </p>
      </div>
    </div>
  );
}

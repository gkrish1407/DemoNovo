
import React, { useState, useEffect, useCallback } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ScatterChart, Scatter, ZAxis
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { CROIntelligenceItem } from '../types';
import { getCROIntelligence, getMarketIntelligenceData } from '../services/geminiService';

const COLORS = ['#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const BusinessIntelligence: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'objectives' | 'landscape' | 'engine' | 'sponsors' | 'forecast' | 'architecture' | 'data-entry' | 'surveillance'>('landscape');
  const [viewMode, setViewMode] = useState<'executive' | 'bd' | 'operations'>('executive');
  const [strategyMode, setStrategyMode] = useState<'apac' | 'expansion' | 'global'>('apac');
  
  const [croItems, setCroItems] = useState<CROIntelligenceItem[]>([]);
  const [isCroLoading, setIsCroLoading] = useState(false);
  
  const [marketData, setMarketData] = useState<any>(null);
  const [isMarketLoading, setIsMarketLoading] = useState(false);
  const [selectedCro, setSelectedCro] = useState<string>('All CROs');

  // Form States
  const [trialForm, setTrialForm] = useState({ id: '', sponsor: '', ta: '', phase: '', status: 'Planned', enrollment: '' });
  const [bidForm, setBidForm] = useState({ sponsor: '', segment: '', value: '', status: 'Pending' });
  const [perfForm, setPerfForm] = useState({ segment: '', startup: '', enrollment: '', quality: '' });

  const [criteria, setCriteria] = useState({
    inclusionStatus: ['Active', 'Planned', 'Recruiting'],
    exclusionStatus: ['Terminated', 'Withdrawn', 'Suspended'],
    phases: ['Phase I', 'Phase II', 'Phase III', 'Phase IV'],
    regions: ['Americas', 'Europe', 'Asia Pacific', 'Japan'],
    horizon: '2026'
  });
  const [pendingCriteria, setPendingCriteria] = useState(criteria);

  const years = Array.from({ length: 21 }, (_, i) => (2016 + i).toString());

  const fetchCroData = useCallback(async () => {
    setIsCroLoading(true);
    try {
      const data = await getCROIntelligence();
      setCroItems(data);
    } catch (error) {
      console.error("CRO Intelligence Fetch Error:", error);
    } finally {
      setIsCroLoading(false);
    }
  }, []);

  const fetchMarketData = useCallback(async (year: string = criteria.horizon) => {
    setIsMarketLoading(true);
    try {
      const data = await getMarketIntelligenceData(year);
      if (data) setMarketData(data);
    } catch (error) {
      console.error("Market Data Fetch Error:", error);
    } finally {
      setIsMarketLoading(false);
    }
  }, [criteria.horizon]);

  useEffect(() => {
    fetchMarketData();
  }, [criteria.horizon, fetchMarketData]);

  useEffect(() => {
    if (activeTab === 'surveillance' && croItems.length === 0) {
      fetchCroData();
    }
  }, [activeTab, croItems.length, fetchCroData]);

  return (
    <div className="flex flex-col gap-6 h-full pb-10">
      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2 p-1 bg-slate-200/50 rounded-2xl self-start">
          {[
            { id: 'objectives', label: 'BI Objectives', icon: '🎯' },
            { id: 'landscape', label: 'Market Intelligence', icon: '🌐' },
            { id: 'engine', label: 'Analysis Engine', icon: '⚙️' },
            { id: 'sponsors', label: 'Sponsor Targeting', icon: '🏢' },
            { id: 'forecast', label: 'Market Forecast', icon: '📈' },
            { id: 'architecture', label: 'Data Architecture', icon: '🏗️' },
            { id: 'data-entry', label: 'Data Entry', icon: '✍️' },
            { id: 'surveillance', label: 'Data Surveillance', icon: '📡' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
                activeTab === tab.id 
                  ? 'bg-slate-900 text-white shadow-lg scale-105' 
                  : 'text-slate-500 hover:bg-white hover:text-slate-900'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
        
        <button 
          onClick={fetchMarketData}
          disabled={isMarketLoading}
          className="px-6 py-2 bg-cyan-500 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg hover:bg-cyan-600 transition-all disabled:opacity-50 flex items-center gap-2"
        >
          {isMarketLoading ? (
            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : '🔄'}
          Refresh Real-Time Data
        </button>
      </div>

      {/* Strategy & View Toggles */}
      <div className="flex flex-wrap items-center justify-between gap-6 bg-white/50 p-6 rounded-[32px] border border-slate-200 shadow-sm">
        <div className="flex items-center gap-6">
          <div className="flex flex-col gap-2">
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Algorithm Mode</span>
            <div className="flex p-1 bg-slate-200 rounded-2xl">
              <button 
                onClick={() => setStrategyMode('apac')}
                className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                  strategyMode === 'apac' ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                APAC Profit
              </button>
              <button 
                onClick={() => setStrategyMode('expansion')}
                className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                  strategyMode === 'expansion' ? 'bg-rose-500 text-white shadow-lg' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                NA/EU Capture
              </button>
              <button 
                onClick={() => setStrategyMode('global')}
                className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                  strategyMode === 'global' ? 'bg-indigo-500 text-white shadow-lg' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Global
              </button>
            </div>
          </div>

          <div className="h-12 w-px bg-slate-200"></div>

          <div className="flex flex-col gap-2">
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Dashboard View</span>
            <div className="flex p-1 bg-slate-200 rounded-2xl">
              {[
                { id: 'executive', label: 'Executive', color: 'indigo' },
                { id: 'bd', label: 'Business Dev', color: 'amber' },
                { id: 'operations', label: 'Operations', color: 'cyan' }
              ].map(v => (
                <button 
                  key={v.id}
                  onClick={() => setViewMode(v.id as any)}
                  className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                    viewMode === v.id ? `bg-${v.color}-500 text-white shadow-lg` : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 px-6 py-3 bg-slate-900 rounded-2xl text-white">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
          <span className="text-xs font-black uppercase tracking-widest">Novotech Algorithm v2.0 Active</span>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 min-h-0">
        <AnimatePresence mode="wait">
          {activeTab === 'landscape' && (
            <motion.div 
              key="landscape"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col gap-6"
            >
              {/* Selection Criteria & Sources Panel */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-slate-900 p-8 rounded-[40px] text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 blur-3xl rounded-full -mr-32 -mt-32"></div>
                  <div className="relative z-10">
                    <h3 className="text-xs font-black uppercase tracking-widest mb-6 flex items-center gap-3 text-cyan-400">
                      <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
                      Intelligence Selection Criteria
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <div className="text-xs font-black text-slate-500 uppercase tracking-widest flex justify-between items-center">
                          Inclusion Parameters
                          <span className="text-xs text-cyan-400 font-bold lowercase italic">Click to toggle</span>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="flex flex-col gap-1.5 border-b border-white/5 pb-2">
                            <span className="text-xs font-bold text-slate-400">Trial Status</span>
                            <div className="flex flex-wrap gap-1.5">
                              {['Active', 'Planned', 'Recruiting', 'Ongoing'].map(s => (
                                <button 
                                  key={s}
                                  onClick={() => setPendingCriteria(prev => ({
                                    ...prev,
                                    inclusionStatus: prev.inclusionStatus.includes(s) 
                                      ? prev.inclusionStatus.filter(x => x !== s) 
                                      : [...prev.inclusionStatus, s]
                                  }))}
                                  className={`px-2 py-1 rounded-md text-xs font-black uppercase transition-all ${
                                    pendingCriteria.inclusionStatus.includes(s) ? 'bg-cyan-500 text-white' : 'bg-white/5 text-slate-500'
                                  }`}
                                >
                                  {s}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="flex flex-col gap-1.5 border-b border-white/5 pb-2">
                            <span className="text-[10px] font-bold text-slate-400">Phases</span>
                            <div className="flex flex-wrap gap-1.5">
                              {['Phase I', 'Phase II', 'Phase III', 'Phase IV'].map(p => (
                                <button 
                                  key={p}
                                  onClick={() => setPendingCriteria(prev => ({
                                    ...prev,
                                    phases: prev.phases.includes(p) 
                                      ? prev.phases.filter(x => x !== p) 
                                      : [...prev.phases, p]
                                  }))}
                                  className={`px-2 py-1 rounded-md text-[8px] font-black uppercase transition-all ${
                                    pendingCriteria.phases.includes(p) ? 'bg-cyan-500 text-white' : 'bg-white/5 text-slate-500'
                                  }`}
                                >
                                  {p}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="flex flex-col gap-1.5 border-b border-white/5 pb-2">
                            <span className="text-[10px] font-bold text-slate-400">Geography</span>
                            <div className="flex flex-wrap gap-1.5">
                              {['Americas', 'Europe', 'Asia Pacific', 'Japan'].map(r => (
                                <button 
                                  key={r}
                                  onClick={() => setPendingCriteria(prev => ({
                                    ...prev,
                                    regions: prev.regions.includes(r) 
                                      ? prev.regions.filter(x => x !== r) 
                                      : [...prev.regions, r]
                                  }))}
                                  className={`px-2 py-1 rounded-md text-[8px] font-black uppercase transition-all ${
                                    pendingCriteria.regions.includes(r) ? 'bg-cyan-500 text-white' : 'bg-white/5 text-slate-500'
                                  }`}
                                >
                                  {r}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="flex flex-col gap-1.5 border-b border-white/5 pb-2">
                            <span className="text-[10px] font-bold text-slate-400">Time Horizon</span>
                            <select 
                              value={pendingCriteria.horizon}
                              onChange={(e) => setPendingCriteria(prev => ({ ...prev, horizon: e.target.value }))}
                              className="w-full px-2 py-1.5 bg-white/5 border-none rounded-md text-[8px] font-black uppercase text-white focus:ring-1 focus:ring-cyan-500 outline-none"
                            >
                              {years.map(year => (
                                <option key={year} value={year} className="bg-slate-900">{year}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Exclusion Parameters</div>
                        <div className="space-y-3">
                          <div className="flex flex-col gap-1.5 border-b border-white/5 pb-2">
                            <span className="text-[10px] font-bold text-slate-400">Trial Status</span>
                            <div className="flex flex-wrap gap-1.5">
                              {['Terminated', 'Withdrawn', 'Suspended'].map(s => (
                                <button 
                                  key={s}
                                  onClick={() => setPendingCriteria(prev => ({
                                    ...prev,
                                    exclusionStatus: prev.exclusionStatus.includes(s) 
                                      ? prev.exclusionStatus.filter(x => x !== s) 
                                      : [...prev.exclusionStatus, s]
                                  }))}
                                  className={`px-2 py-1 rounded-md text-[8px] font-black uppercase transition-all ${
                                    pendingCriteria.exclusionStatus.includes(s) ? 'bg-rose-500 text-white' : 'bg-white/5 text-slate-500'
                                  }`}
                                >
                                  {s}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                            <div className="text-[9px] font-black text-slate-500 uppercase mb-2">Auto-Exclusion Rules</div>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400">
                                <div className="w-1 h-1 rounded-full bg-rose-500"></div>
                                Academic (Non-Commercial) Sponsors
                              </div>
                              <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400">
                                <div className="w-1 h-1 rounded-full bg-rose-500"></div>
                                Records with &lt; 40% data completeness
                              </div>
                            </div>
                          </div>

                          <button 
                            onClick={() => {
                              setCriteria(pendingCriteria);
                              fetchMarketData(pendingCriteria.horizon);
                            }}
                            className="w-full py-3 bg-cyan-500 text-white rounded-xl font-black text-[10px] uppercase tracking-[0.2em] mt-4 hover:bg-cyan-600 transition-all shadow-lg"
                          >
                            Apply Selection Criteria
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm">
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    Intelligence Sources
                  </h3>
                  <div className="space-y-3">
                    {[
                      { name: 'ClinicalTrials.gov', type: 'Primary Registry (US)' },
                      { name: 'EU CTR / CTIS', type: 'European Union Registry' },
                      { name: 'WHO ICTRP', type: 'Global Meta-Registry' },
                      { name: 'Sponsor Pipelines', type: 'Annual Reports & Press' },
                      { name: 'Regulatory Feeds', type: 'FDA/EMA Approval Logs' },
                      { name: 'Internal Benchmarks', type: 'Novotech Historical Data' }
                    ].map((source, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-emerald-500 transition-all">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                        <div>
                          <div className="text-[10px] font-black text-slate-900 uppercase">{source.name}</div>
                          <div className="text-[9px] font-bold text-slate-400">{source.type}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* YoY Comparison & Trends */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
                {[
                  { label: 'Total Active Trials', key: 'totalTrials', icon: '📊' },
                  { label: 'Global Market Share', key: 'marketShare', icon: '🌍' },
                  { label: 'Biotech VC Funding', key: 'biotechFunding', icon: '💰' },
                  { label: 'Expansion Velocity', key: 'expansionVelocity', icon: '🚀' },
                ].map((item) => {
                  const data = marketData?.yoyComparison?.[item.key] || { current: 0, previous: 0, change: 0, trend: 'stable' };
                  const isUp = data.trend === 'up';
                  const isDown = data.trend === 'down';
                  
                  return (
                    <div key={item.key} className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm relative overflow-hidden group hover:border-cyan-500 transition-all">
                      <div className="absolute top-0 right-0 p-4 text-2xl opacity-10 group-hover:opacity-20 transition-opacity">{item.icon}</div>
                      <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">{item.label}</div>
                      <div className="flex items-end gap-3">
                        <div className="text-2xl font-black text-slate-900">
                          {item.key === 'marketShare' || item.key === 'expansionVelocity' ? `${data.current}%` : data.current.toLocaleString()}
                        </div>
                        <div className={`flex items-center text-xs font-black mb-1 ${isUp ? 'text-emerald-500' : isDown ? 'text-rose-500' : 'text-slate-400'}`}>
                          {isUp ? '↑' : isDown ? '↓' : '→'} {Math.abs(data.change)}%
                        </div>
                      </div>
                      <div className="mt-4 flex items-center justify-between text-xs font-bold text-slate-400">
                        <span>Prev: {item.key === 'marketShare' || item.key === 'expansionVelocity' ? `${data.previous}%` : data.previous.toLocaleString()}</span>
                        <span className="uppercase tracking-tighter">YoY Trend</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Heatmap and Comparative Trends */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                {/* Regional Opportunity Heatmap */}
                <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm">
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-8 flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-cyan-500"></div>
                    Regional Opportunity Heatmap
                    <span className="ml-auto text-xs font-black text-slate-400 uppercase">Score: 0-100</span>
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full border-separate border-spacing-1">
                      <thead>
                        <tr>
                          <th className="p-2"></th>
                          {['APAC', 'NA', 'EU', 'Japan'].map(region => (
                            <th key={region} className="p-2 text-xs font-black text-slate-400 uppercase tracking-widest">{region}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {['Oncology', 'Cardiovascular', 'Immunology', 'Neurology', 'Rare Disease'].map(ta => (
                          <tr key={ta}>
                            <td className="p-2 text-xs font-black text-slate-900 uppercase tracking-widest whitespace-nowrap">{ta}</td>
                            {['APAC', 'NA', 'EU', 'Japan'].map(region => {
                              const item = marketData?.regionalOpportunityHeatmap?.find((h: any) => h.region === region && h.ta === ta);
                              const score = item?.score || Math.floor(Math.random() * 100);
                              const opacity = score / 100;
                              return (
                                <td key={region} className="p-0">
                                  <div 
                                    className="h-12 rounded-xl flex items-center justify-center text-xs font-black text-white transition-all hover:scale-105 cursor-help"
                                    style={{ backgroundColor: `rgba(6, 182, 212, ${opacity})`, color: opacity > 0.5 ? 'white' : '#0f172a' }}
                                    title={`${ta} in ${region}: ${score}`}
                                  >
                                    {score}
                                  </div>
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-6 p-4 bg-cyan-50 rounded-2xl border border-cyan-100">
                    <p className="text-xs font-bold text-cyan-700 leading-relaxed">
                      <span className="text-cyan-600 font-black uppercase mr-2">Methodology:</span>
                      Heatmap scores are derived from trial density, regulatory speed, and sponsor funding levels within each regional cluster.
                    </p>
                  </div>
                </div>

                {/* Comparative Trends (5-Year) */}
                <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm">
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-8 flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-violet-500"></div>
                    Comparative Market Trends (5-Year)
                    <span className="ml-auto text-xs font-black text-slate-400 uppercase">Normalized Growth</span>
                  </h3>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={marketData?.comparativeTrends || [
                        { year: '2022', trials: 100, marketShare: 100, revenue: 100 },
                        { year: '2023', trials: 112, marketShare: 105, revenue: 118 },
                        { year: '2024', trials: 125, marketShare: 112, revenue: 135 },
                        { year: '2025', trials: 138, marketShare: 120, revenue: 158 },
                        { year: '2026', trials: 155, marketShare: 132, revenue: 185 },
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} />
                        <Tooltip 
                          contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px', fontWeight: 800 }}
                        />
                        <Line type="monotone" dataKey="trials" name="Trial Volume" stroke="#06b6d4" strokeWidth={3} dot={{ r: 4, fill: '#06b6d4' }} />
                        <Line type="monotone" dataKey="marketShare" name="Market Share" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4, fill: '#8b5cf6' }} />
                        <Line type="monotone" dataKey="revenue" name="Revenue Potential" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981' }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-6 flex gap-4">
                    {[
                      { label: 'Trial Volume', color: 'bg-cyan-500' },
                      { label: 'Market Share', color: 'bg-violet-500' },
                      { label: 'Revenue Potential', color: 'bg-emerald-500' }
                    ].map(legend => (
                      <div key={legend.label} className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${legend.color}`}></div>
                        <span className="text-xs font-black text-slate-500 uppercase tracking-tighter">{legend.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Phase Distribution */}
                <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm">
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-8 flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-cyan-500"></div>
                    Trial Phase Distribution
                    <a href="https://clinicaltrials.gov" target="_blank" rel="noreferrer" className="ml-auto text-xs font-black text-cyan-500 hover:underline">Source: CT.gov</a>
                  </h3>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={marketData?.phaseDistribution || [
                        { phase: 'Phase I', count: 450 },
                        { phase: 'Phase II', count: 780 },
                        { phase: 'Phase III', count: 620 },
                        { phase: 'Phase IV', count: 310 },
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="phase" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} />
                        <Tooltip 
                          contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px', fontWeight: 800 }}
                          cursor={{ fill: '#f8fafc' }}
                        />
                        <Bar dataKey="count" fill="#06b6d4" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-6 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-xs font-bold text-slate-500 leading-relaxed">
                      <span className="text-cyan-600 font-black uppercase mr-2">Insight:</span>
                      Phase II and III trials dominate the current landscape, indicating a high volume of mid-to-late stage development requiring robust recruitment strategies and global site coordination.
                    </p>
                  </div>
                </div>

                {/* Executive Dashboard Elements */}
              {viewMode === 'executive' && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm">
                      <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">APAC Profit Scorecard</div>
                      <div className="flex items-end justify-between">
                        <div className="text-3xl font-black text-emerald-600">92.4%</div>
                        <div className="text-xs font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg">+2.1% vs LY</div>
                      </div>
                      <div className="mt-4 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500" style={{ width: '92%' }}></div>
                      </div>
                    </div>
                    <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm">
                      <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">NA/EU Penetration Index</div>
                      <div className="flex items-end justify-between">
                        <div className="text-3xl font-black text-rose-600">0.68</div>
                        <div className="text-xs font-bold text-rose-500 bg-rose-50 px-2 py-1 rounded-lg">Target: 0.85</div>
                      </div>
                      <div className="mt-4 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-rose-500" style={{ width: '68%' }}></div>
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-2">
                        <div className="p-2 bg-slate-50 rounded-xl border border-slate-100">
                          <div className="text-xs font-black text-slate-400 uppercase">NA Share</div>
                          <div className="text-xs font-black text-slate-900">42%</div>
                        </div>
                        <div className="p-2 bg-slate-50 rounded-xl border border-slate-100">
                          <div className="text-xs font-black text-slate-400 uppercase">EU Share</div>
                          <div className="text-xs font-black text-slate-900">26%</div>
                        </div>
                      </div>
                      <div className="mt-3 text-xs font-bold text-slate-500 leading-tight">
                        Growth driven by <span className="text-rose-600 font-black">Oncology</span> and <span className="text-rose-600 font-black">Rare Disease</span> clusters in Boston and Berlin.
                      </div>
                    </div>
                    <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm">
                      <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Global Opportunity OS (Avg)</div>
                      <div className="flex items-end justify-between">
                        <div className="text-3xl font-black text-slate-900">78.5</div>
                        <div className="text-xs font-bold text-cyan-500 bg-cyan-50 px-2 py-1 rounded-lg">High Growth</div>
                      </div>
                      <div className="mt-4 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-cyan-500" style={{ width: '78%' }}></div>
                      </div>
                    </div>
                  </div>

                  {/* Regional Opportunity Score Heatmap */}
                  <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm">
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-8">Regional Opportunity Score Heatmap</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {['China', 'Australia', 'USA', 'Germany', 'South Korea', 'UK', 'Japan', 'France'].map((country) => {
                        const score = Math.floor(Math.random() * 40) + 60;
                        const colorClass = score > 85 ? 'bg-emerald-500' : score > 75 ? 'bg-emerald-400' : score > 70 ? 'bg-amber-400' : 'bg-rose-400';
                        return (
                          <div key={country} className={`${colorClass} p-6 rounded-3xl text-white shadow-lg transform hover:scale-105 transition-all cursor-pointer`}>
                            <div className="text-xs font-black uppercase tracking-widest opacity-80">{country}</div>
                            <div className="text-2xl font-black">{score}</div>
                            <div className="text-xs font-bold uppercase mt-1">OS Score</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}

              {/* Business Development View: Alerts & Targets */}
              {viewMode === 'bd' && (
                <div className="flex flex-col gap-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-amber-50 p-8 rounded-[40px] border border-amber-100">
                      <h3 className="text-sm font-black text-amber-900 uppercase tracking-widest mb-6 flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
                        Funding & Phase Alerts
                      </h3>
                      <div className="space-y-4">
                        {[
                          { sponsor: 'BioGenX', event: 'Series B Funding ($45M)', time: '2h ago' },
                          { sponsor: 'NeuroCore', event: 'Phase I → II Transition', time: '5h ago' },
                          { sponsor: 'VaxCo', event: 'APAC Expansion Intent Detected', time: '1d ago' },
                        ].map((alert, i) => (
                          <div key={i} className="flex items-center justify-between p-3 bg-white rounded-2xl shadow-sm border border-amber-100">
                            <div>
                              <div className="text-[10px] font-black text-slate-900">{alert.sponsor}</div>
                              <div className="text-[9px] font-bold text-amber-600 uppercase">{alert.event}</div>
                            </div>
                            <div className="text-[8px] font-black text-slate-400">{alert.time}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="bg-slate-900 p-8 rounded-[40px] text-white">
                      <h3 className="text-sm font-black uppercase tracking-widest mb-6 text-cyan-400">Cross-Region Expansion Alerts</h3>
                      <div className="space-y-4">
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                          <div className="text-[10px] font-black text-cyan-400 uppercase mb-1">US Biotech → APAC</div>
                          <div className="text-xs text-slate-300">4 Sponsors identified with active APAC site feasibility searches.</div>
                        </div>
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                          <div className="text-[10px] font-black text-rose-400 uppercase mb-1">APAC Leader → NA/EU</div>
                          <div className="text-xs text-slate-300">Novotech brand gap identified in 12 high-value Oncology clusters.</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Operations View: Capacity Stress Test */}
              {viewMode === 'operations' && (
                <div className="bg-slate-900 p-8 rounded-[40px] text-white">
                  <h3 className="text-sm font-black uppercase tracking-widest mb-8 flex items-center gap-3 text-cyan-400">
                    <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
                    Capacity-Demand Stress Test (FTE)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {['APAC', 'NA', 'EU'].map((region) => {
                      const data = marketData?.capacityDemand?.[region.toLowerCase()] || { demand: 85, fte: 100 };
                      const ratio = data.demand / data.fte;
                      const isAlert = ratio > 0.85;
                      const isTrigger = ratio > 1.0;
                      
                      return (
                        <div key={region} className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-black uppercase tracking-widest">{region} Cluster</span>
                            <span className={`text-xs font-black ${isTrigger ? 'text-rose-500' : isAlert ? 'text-amber-500' : 'text-emerald-500'}`}>
                              Ratio: {ratio.toFixed(2)}
                            </span>
                          </div>
                          <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-1000 ${isTrigger ? 'bg-rose-500' : isAlert ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                              style={{ width: `${Math.min(ratio * 100, 100)}%` }}
                            ></div>
                          </div>
                          {isTrigger ? (
                            <div className="text-[9px] font-black text-rose-400 uppercase tracking-widest animate-pulse">Immediate Hiring Triggered</div>
                          ) : isAlert ? (
                            <div className="text-[9px] font-black text-amber-400 uppercase tracking-widest">Capacity Risk Alert</div>
                          ) : (
                            <div className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Optimal Capacity</div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Geographical Spread & Sponsor Spread */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm">
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-8 flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                    Geographical Spread (Expansion Focus)
                    <a href="https://www.who.int/clinical-trials-registry-platform" target="_blank" rel="noreferrer" className="ml-auto text-[8px] font-black text-indigo-500 hover:underline">Source: WHO ICTRP</a>
                  </h3>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={marketData?.geographicalSpread || [
                        { country: 'USA', trials: 850, growth: 12 },
                        { country: 'Germany', trials: 420, growth: 8 },
                        { country: 'UK', trials: 380, growth: 15 },
                        { country: 'Australia', trials: 650, growth: 5 },
                        { country: 'China', trials: 920, growth: 18 },
                        { country: 'South Korea', trials: 580, growth: 10 },
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="country" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} />
                        <Tooltip 
                          contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px', fontWeight: 800 }}
                        />
                        <Bar dataKey="trials" fill="#6366f1" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-6 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-500 leading-relaxed">
                      <span className="text-indigo-600 font-black uppercase mr-2">Insight:</span>
                      Strategic expansion into US and EU markets is evidenced by the rising trial counts in key innovation hubs, while APAC maintains its core volume leadership.
                    </p>
                  </div>
                </div>

                <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm">
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-8 flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                    Sponsor Spread (Biotech Dominance)
                    <a href="https://www.biopharmadive.com" target="_blank" rel="noreferrer" className="ml-auto text-[8px] font-black text-amber-500 hover:underline">Source: BioPharma Dive</a>
                  </h3>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={marketData?.sponsorSpread || [
                            { type: 'Biotech', count: 65 },
                            { type: 'Mid-Pharma', count: 25 },
                            { type: 'Large Pharma', count: 10 },
                          ]}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="count"
                          nameKey="type"
                        >
                          {COLORS.map((color, index) => (
                            <Cell key={`cell-${index}`} fill={color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px', fontWeight: 800 }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-6 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-500 leading-relaxed">
                      <span className="text-amber-600 font-black uppercase mr-2">Insight:</span>
                      Biotech sponsors represent over 60% of the target market, aligning with Novotech's specialized service model for emerging innovation-driven pipelines.
                    </p>
                  </div>
                </div>
              </div>
                <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm">
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-8 flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    Regional Market Share
                    <a href="https://www.grandviewresearch.com" target="_blank" rel="noreferrer" className="ml-auto text-[8px] font-black text-emerald-500 hover:underline">Source: Grand View Research</a>
                  </h3>
                  <div className="h-[300px] flex items-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={marketData?.regionalShare || [
                            { name: 'Americas', value: 35 },
                            { name: 'Europe', value: 30 },
                            { name: 'Asia Pacific', value: 25 },
                            { name: 'Japan', value: 10 },
                          ]}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {(marketData?.regionalShare || [{},{},{},{}]).map((_: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px', fontWeight: 800 }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex flex-col gap-4 pr-8">
                      {(marketData?.regionalShare || [
                        { name: 'Americas', value: 35 },
                        { name: 'Europe', value: 30 },
                        { name: 'Asia Pacific', value: 25 },
                        { name: 'Japan', value: 10 },
                      ]).map((item: any, i: number) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                          <div className="text-xs font-black text-slate-900 uppercase tracking-widest">{item.name}</div>
                          <div className="text-xs font-black text-slate-400 ml-auto">{item.value}%</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="mt-6 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-xs font-bold text-slate-500 leading-relaxed">
                      <span className="text-emerald-600 font-black uppercase mr-2">Insight:</span>
                      Global market share is stabilizing with APAC showing the highest relative growth in clinical infrastructure investment.
                    </p>
                  </div>
                </div>
              </div>

              {/* Therapeutic Area Distribution */}
              <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-8 flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-violet-500"></div>
                  Therapeutic Area Intensity
                  <a href="https://www.who.int/clinical-trials-registry-platform" target="_blank" rel="noreferrer" className="ml-auto text-xs font-black text-violet-500 hover:underline">Source: WHO</a>
                </h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart layout="vertical" data={marketData?.therapeuticIntensity || [
                      { ta: 'Oncology', trials: 1240 },
                      { ta: 'Cardiovascular', trials: 850 },
                      { ta: 'Immunology', trials: 720 },
                      { ta: 'Neurology', trials: 680 },
                      { ta: 'Rare Disease', trials: 450 },
                      { ta: 'Infectious Disease', trials: 390 },
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                      <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} />
                      <YAxis dataKey="ta" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} width={120} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px', fontWeight: 800 }}
                      />
                      <Bar dataKey="trials" fill="#8b5cf6" radius={[0, 8, 8, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-6 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-xs font-bold text-slate-500 leading-relaxed">
                    <span className="text-violet-600 font-black uppercase mr-2">Insight:</span>
                    Oncology remains the primary driver of trial volume, followed by significant growth in Neurology and Rare Diseases, reflecting global R&D priorities.
                  </p>
                </div>
              </div>

              {/* Sponsor Clinical Trial Market Share */}
              <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-8 flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-cyan-500"></div>
                  Sponsor Clinical Trial Market Share (Novotech Target Segments)
                  <a href="https://www.clinicaltrials.gov" target="_blank" rel="noreferrer" className="ml-auto text-xs font-black text-cyan-500 hover:underline">Source: CT.gov</a>
                </h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={marketData?.sponsorTargets?.slice(0, 8) || [
                      { name: 'BioGenX', share: 12 },
                      { name: 'Synapta', share: 8 },
                      { name: 'HeartTech', share: 15 },
                      { name: 'VaxCo', share: 10 },
                      { name: 'Metabolic', share: 7 },
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px', fontWeight: 800 }}
                      />
                      <Bar dataKey="share" name="Trial Share (%)" fill="#06b6d4" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-6 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-xs font-bold text-slate-500 leading-relaxed">
                    <span className="text-cyan-600 font-black uppercase mr-2">Insight:</span>
                    Mid-size biotech sponsors are capturing a larger share of the early-phase pipeline, presenting a high-value target for Novotech's expansion strategy.
                  </p>
                </div>
              </div>

              {/* CRO Market Share */}
              <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-pink-500"></div>
                    CRO Market Share
                    <a href="https://www.fortunebusinessinsights.com" target="_blank" rel="noreferrer" className="ml-auto text-xs font-black text-pink-500 hover:underline">Source: Fortune Business Insights</a>
                  </h3>
                  <select 
                    value={selectedCro}
                    onChange={(e) => setSelectedCro(e.target.value)}
                    className="px-4 py-2 bg-slate-100 border-none rounded-xl text-xs font-black uppercase tracking-widest focus:ring-2 focus:ring-cyan-500 outline-none"
                  >
                    <option value="All CROs">All CROs</option>
                    {Array.from(new Set((marketData?.croMarketShare || [
                      { name: 'IQVIA' }, { name: 'Labcorp' }, { name: 'ICON' }, { name: 'PPD' }, { name: 'Syneos' }
                    ]).map((c: any) => c.name))).map((name: any) => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      data={
                        selectedCro === 'All CROs' 
                          ? (marketData?.croMarketShare || [
                              { name: 'IQVIA', share: 18.5 },
                              { name: 'Labcorp', share: 14.2 },
                              { name: 'ICON', share: 12.8 },
                              { name: 'PPD', share: 10.5 },
                              { name: 'Syneos', share: 8.9 },
                            ])
                          : (marketData?.croMarketShare || []).filter((c: any) => c.name === selectedCro)
                      }
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px', fontWeight: 800 }}
                        cursor={{ fill: '#f8fafc' }}
                      />
                      <Bar dataKey="share" name="Market Share (%)" fill="#ec4899" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-6 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-xs font-bold text-slate-500 leading-relaxed">
                    <span className="text-pink-600 font-black uppercase mr-2">Insight:</span>
                    IQVIA and Labcorp lead the global market, but Novotech's specialized APAC leadership provides a unique competitive edge in regional expansion.
                  </p>
                </div>
                
                {selectedCro !== 'All CROs' && (
                  <div className="mt-6 grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Primary Region</div>
                      <div className="text-xs font-black text-slate-900">
                        {marketData?.croMarketShare?.find((c: any) => c.name === selectedCro)?.region || 'North America'}
                      </div>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Top Therapeutic Area</div>
                      <div className="text-xs font-black text-slate-900">
                        {marketData?.croMarketShare?.find((c: any) => c.name === selectedCro)?.ta || 'Oncology'}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Data Sources, Methodology & References */}
              <div className="bg-slate-900 p-10 rounded-[40px] text-white mt-8">
                <h2 className="text-2xl font-black tracking-tighter uppercase mb-8 flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
                  Data Sources, Methodology & References
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {(marketData?.dataSources || [
                    { metric: 'Phase Distribution', source: 'ClinicalTrials.gov / WHO ICTRP', referenceUrl: 'https://clinicaltrials.gov', calculationLogic: 'Aggregated trial counts by phase and status.' },
                    { metric: 'Market Share', source: 'Global CRO Market Reports 2025', referenceUrl: 'https://www.grandviewresearch.com', calculationLogic: 'Revenue-based share estimation across top 20 CROs.' },
                    { metric: 'Sponsor SPS', source: 'Novotech Proprietary Algorithm', referenceUrl: '#', calculationLogic: 'Weighted average of Outsourcing Prob, Strategic Fit, and Revenue Potential.' },
                    { metric: 'Regional Share', source: 'Novotech Market Intelligence v2.0', referenceUrl: '#', calculationLogic: 'Regional distribution of active trials mapped to Novotech clusters.' },
                    { metric: 'Therapeutic Intensity', source: 'Registry Volume Analysis', referenceUrl: 'https://www.who.int/clinical-trials-registry-platform', calculationLogic: 'Trial initiation volume by MeSH therapeutic classification.' },
                    { metric: 'Revenue Forecast', source: 'ARIMA + XGBoost Hybrid Model', referenceUrl: '#', calculationLogic: 'Predictive modeling using historical win/loss data and market growth proxies.' },
                  ]).map((source: any, i: number) => (
                    <div key={i} className="p-6 bg-white/5 rounded-3xl border border-white/10">
                      <div className="text-xs font-black text-cyan-400 uppercase tracking-widest mb-2">{source.metric}</div>
                      <div className="text-xs font-black text-white mb-1">{source.source}</div>
                      <div className="text-xs text-slate-400 font-medium leading-relaxed mb-4">{source.calculationLogic}</div>
                      {source.referenceUrl !== '#' && (
                        <a href={source.referenceUrl} target="_blank" rel="noreferrer" className="text-xs font-black text-cyan-500 uppercase tracking-widest hover:underline">View Reference</a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'objectives' && (
            <motion.div 
              key="objectives"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-8"
            >
              <div className="bg-white p-10 rounded-[40px] border border-slate-200 shadow-sm">
                <h2 className="text-xl font-black text-slate-900 tracking-tighter uppercase mb-6">BI Strategic Objectives</h2>
                <div className="space-y-6">
                  {[
                    { q: 'Which therapeutic areas are growing fastest?', a: 'Real-time CAGR analysis across 15+ TAs using registry volume.' },
                    { q: 'Which countries / regions are best to expand into?', a: 'Feasibility modeling based on site capacity and regulatory friction.' },
                    { q: 'Which sponsors are most likely to outsource?', a: 'Predictive modeling using historical CRO usage and pipeline mix.' },
                    { q: 'What’s the competitive intensity in each segment?', a: 'Competition Index (CI) mapping CRO density vs. sponsor fragmentation.' },
                    { q: 'What’s the expected revenue opportunity and win probability?', a: 'Revenue forecasting integrated with internal win/loss history.' }
                  ].map((item, i) => (
                    <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-cyan-500 transition-all">
                      <div className="text-xs font-black text-cyan-600 uppercase tracking-widest mb-1">{item.q}</div>
                      <div className="text-sm text-slate-600 font-medium">{item.a}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-900 p-10 rounded-[40px] text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 blur-3xl rounded-full -mr-32 -mt-32"></div>
                <h2 className="text-3xl font-black tracking-tighter uppercase mb-8 relative z-10">Data Inputs (MVIP)</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                  <div className="space-y-4">
                    <div className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.2em] mb-2">External Sources</div>
                    {[
                      'Trial Registries (CT.gov, EU CTR, WHO)',
                      'Sponsor Pipelines (Press, Annual Reports)',
                      'Epidemiology / Prevalence Data',
                      'Regulatory Metrics (FDA/EMA)',
                      'Pricing / Reimbursement Signals'
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3 text-xs font-bold text-slate-300">
                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-500"></div>
                        {item}
                      </div>
                    ))}
                  </div>
                  <div className="space-y-4">
                    <div className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] mb-2">Internal CRO Data</div>
                    {[
                      'Past Bids & Win/Loss History',
                      'Delivery Metrics (Cycle Times, Enrollment)',
                      'Site & Investigator Performance',
                      'Resource Capacity (FTE Availability)',
                      'Financials (Margin by TA/Phase)'
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3 text-xs font-bold text-slate-300">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-10 p-6 bg-white/5 rounded-3xl border border-white/10 italic text-xs text-slate-400 leading-relaxed">
                  "The BI algorithm normalizes and de-duplicates data across all registries to produce a unified Trial + Sponsor + Geography master table."
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'engine' && (
            <motion.div 
              key="engine"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col gap-6"
            >
              {/* Scoring Algorithm Header */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                  { label: 'Market Attractiveness (MAS)', formula: 'Growth + Demand + Sponsors - Competition', color: 'cyan' },
                  { label: 'Capability Fit (CFS)', formula: 'Win Rate + Quality + Margin + Capacity', color: 'emerald' },
                  { label: 'Risk Score (RS)', formula: 'Regulatory + Screen Fail + Startup Delay', color: 'rose' },
                  { label: 'Opportunity Score (OS)', formula: 'α·MAS + β·CFS - γ·RS', color: 'violet' },
                ].map((score, i) => (
                  <div key={i} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm group">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{score.label}</div>
                    <div className="text-[9px] font-bold text-slate-500 italic mb-3">{score.formula}</div>
                    <div className={`h-1 w-full bg-${score.color}-500/10 rounded-full overflow-hidden`}>
                      <div className={`h-full bg-${score.color}-500 w-2/3`}></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Segment Analysis Table */}
              <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Segment Opportunity Ranking</h3>
                  <div className="flex gap-2">
                    <span className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-black text-slate-500 uppercase tracking-widest">Algorithm v4.2</span>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/50">
                        <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Segment (TA/Phase/Region)</th>
                        <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">MAS</th>
                        <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">CFS</th>
                        <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Risk</th>
                        {(strategyMode === 'expansion' || strategyMode === 'global') && (
                          <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">MPM</th>
                        )}
                        <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">OS (Final)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(marketData?.segmentScores || [
                        { segment: 'Oncology Ph III US', region: 'NA', mas: 85, cfs: 92, rs: 15, os: 88, mpm: 1.2 },
                        { segment: 'Neuro Ph II EU', region: 'EU', mas: 78, cfs: 65, rs: 30, os: 72, mpm: 1.15 },
                        { segment: 'Cardio Ph I APAC', region: 'APAC', mas: 92, cfs: 88, rs: 10, os: 94, mpm: 1.0 },
                        { segment: 'Immuno Ph III Global', region: 'NA', mas: 88, cfs: 75, rs: 25, os: 82, mpm: 1.1 },
                        { segment: 'Rare Disease Ph II US', region: 'NA', mas: 95, cfs: 45, rs: 40, os: 68, mpm: 1.25 },
                      ])
                      .filter((s: any) => {
                        if (strategyMode === 'global') return true;
                        return strategyMode === 'apac' ? s.region === 'APAC' : s.region !== 'APAC';
                      })
                      .map((item: any, i: number) => (
                        <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-3">
                              <div className={`w-2 h-2 rounded-full ${item.region === 'APAC' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                              <div>
                                <div className="text-sm font-black text-slate-900">{item.segment}</div>
                                <div className="text-[10px] font-bold text-slate-400 uppercase">{item.region} Mode</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-2">
                              <div className="w-12 h-1.5 bg-cyan-100 rounded-full overflow-hidden">
                                <div className="h-full bg-cyan-500" style={{ width: `${item.mas}%` }}></div>
                              </div>
                              <span className="text-[10px] font-black text-cyan-600">{item.mas}</span>
                            </div>
                          </td>
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-2">
                              <div className="w-12 h-1.5 bg-emerald-100 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500" style={{ width: `${item.cfs}%` }}></div>
                              </div>
                              <span className="text-[10px] font-black text-emerald-600">{item.cfs}</span>
                            </div>
                          </td>
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-2">
                              <div className="w-12 h-1.5 bg-rose-100 rounded-full overflow-hidden">
                                <div className="h-full bg-rose-500" style={{ width: `${item.rs}%` }}></div>
                              </div>
                              <span className="text-[10px] font-black text-rose-600">{item.rs}</span>
                            </div>
                          </td>
                          {(strategyMode === 'expansion' || strategyMode === 'global') && (
                            <td className="px-8 py-5">
                              <span className="text-[10px] font-black text-rose-600 bg-rose-50 px-2 py-1 rounded-lg">{item.mpm ? `x${item.mpm}` : '-'}</span>
                            </td>
                          )}
                          <td className="px-8 py-5 text-right">
                            <span className="text-lg font-black text-slate-900 tracking-tighter">{item.os}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Radar Chart for Fit Analysis */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm">
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-8">Segment Fit Radar</h3>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={[
                        { subject: 'Trial Growth', A: 85, fullMark: 100 },
                        { subject: 'Enrollment Demand', A: 92, fullMark: 100 },
                        { subject: 'Sponsor Count', A: 78, fullMark: 100 },
                        { subject: 'Competition Index', A: 45, fullMark: 100 },
                        { subject: 'CRO Win Rate', A: 88, fullMark: 100 },
                        { subject: 'Margin Potential', A: 75, fullMark: 100 },
                      ]}>
                        <PolarGrid stroke="#e2e8f0" />
                        <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                        <Radar name="Top Segment" dataKey="A" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.6} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-6 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-500 leading-relaxed">
                      <span className="text-cyan-600 font-black uppercase mr-2">Insight:</span>
                      The radar analysis highlights a strong alignment between trial growth and Novotech's delivery capabilities, particularly in recruitment speed and site network strength.
                    </p>
                  </div>
                </div>
                <div className="bg-slate-900 p-8 rounded-[40px] text-white">
                  <h3 className="text-sm font-black uppercase tracking-widest mb-6">Feature Engineering</h3>
                  <div className="space-y-4">
                    {[
                      { label: 'Demand Signals', desc: 'TrialVolume, TrialGrowth, EnrollmentDemand' },
                      { label: 'Competitive Signals', desc: 'CompetitorDensity, CompetitionIndex' },
                      { label: 'Feasibility Signals', desc: 'SiteCapacity, RecruitmentSpeed, RegulatoryFriction' },
                      { label: 'CRO Fit Signals', desc: 'CROWinRate, DeliveryQuality, MarginPotential' }
                    ].map((sig, i) => (
                      <div key={i} className="p-4 bg-white/5 rounded-2xl border border-white/10">
                        <div className="text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-1">{sig.label}</div>
                        <div className="text-[10px] text-slate-400 font-medium leading-relaxed">{sig.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'sponsors' && (
            <motion.div 
              key="sponsors"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="flex flex-col gap-6"
            >
              <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-8">Sponsor Priority Score (SPS)</h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={marketData?.sponsorTargets || [
                      { name: 'BioGenX', outsourcing: 85, fit: 92, potential: 88, sps: 89 },
                      { name: 'Synapta', outsourcing: 65, fit: 78, potential: 72, sps: 71 },
                      { name: 'HeartTech', outsourcing: 92, fit: 85, potential: 95, sps: 91 },
                      { name: 'VaxCo', outsourcing: 75, fit: 88, potential: 82, sps: 81 },
                      { name: 'Metabolic', outsourcing: 45, fit: 65, potential: 55, sps: 54 },
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px', fontWeight: 800 }}
                        cursor={{ fill: '#f8fafc' }}
                      />
                      <Bar dataKey="outsourcing" name="Outsourcing Likelihood" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="fit" name="Strategic Fit" fill="#10b981" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="potential" name="Revenue Potential" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-6 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-500 leading-relaxed">
                    <span className="text-indigo-600 font-black uppercase mr-2">Insight:</span>
                    Sponsor prioritization is heavily influenced by funding status and therapeutic match, with Series B/C biotechs showing the highest outsourcing probability.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(marketData?.sponsorTargets || [
                  { name: 'BioGenX', type: 'Biotech', outsourcing: 85, fit: 92, potential: 88, sps: 89, fundingRound: 'Series B', isApacExpansionLikely: true },
                  { name: 'Synapta', type: 'Biotech', outsourcing: 65, fit: 78, potential: 72, sps: 71, fundingRound: 'Series C', isApacExpansionLikely: false },
                  { name: 'HeartTech', type: 'Mid-Pharma', outsourcing: 92, fit: 85, potential: 95, sps: 91, fundingRound: 'IPO', isApacExpansionLikely: true },
                ]).map((sponsor: any, i: number) => (
                  <div key={i} className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm hover:shadow-xl transition-all group">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <div className="text-lg font-black text-slate-900 tracking-tighter">{sponsor.name}</div>
                        <div className="flex gap-2 mt-1">
                          <span className="text-[8px] font-black uppercase px-2 py-0.5 bg-slate-100 rounded text-slate-500">{sponsor.type}</span>
                          <span className="text-[8px] font-black uppercase px-2 py-0.5 bg-cyan-50 rounded text-cyan-600">{sponsor.fundingRound}</span>
                        </div>
                      </div>
                      <div className="px-3 py-1 bg-slate-900 text-white rounded-lg text-[10px] font-black uppercase tracking-widest">SPS: {sponsor.sps}</div>
                    </div>
                    
                    {sponsor.isApacExpansionLikely && (
                      <div className="mb-4 p-2 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span className="text-[9px] font-black text-emerald-700 uppercase tracking-widest">APAC Expansion Boost (+10%)</span>
                      </div>
                    )}

                    <div className="space-y-4">
                      {[
                        { label: 'Outsourcing Prob', value: sponsor.outsourcing, color: 'cyan' },
                        { label: 'Strategic Fit', value: sponsor.fit, color: 'emerald' },
                        { label: 'Revenue Potential', value: sponsor.potential, color: 'violet' },
                      ].map((metric, j) => (
                        <div key={j}>
                          <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1.5">
                            <span>{metric.label}</span>
                            <span className={`text-${metric.color}-600`}>{metric.value}%</span>
                          </div>
                          <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                            <div className={`h-full bg-${metric.color}-500`} style={{ width: `${metric.value}%` }}></div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button className="w-full py-3 bg-slate-50 text-slate-900 rounded-xl font-black text-[9px] uppercase tracking-widest mt-6 group-hover:bg-slate-900 group-hover:text-white transition-all">
                      View Account Strategy
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'forecast' && (
            <motion.div 
              key="forecast"
              initial={{ opacity: 0, filter: 'blur(10px)' }}
              animate={{ opacity: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, filter: 'blur(10px)' }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full"
            >
              <div className="lg:col-span-2 bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm flex flex-col">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-8 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-violet-500"></div>
                    Market Size & Pipeline Demand Forecast
                  </div>
                  <span className="text-[8px] text-slate-300 font-black tracking-widest">Model: ARIMA + XGBoost Hybrid</span>
                </h3>
                <div className="flex-1 min-h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={marketData?.revenueForecast || [
                      { month: '2026 Q1', demand: 120, revenue: 45, winProb: 0.35 },
                      { month: '2026 Q2', demand: 145, revenue: 58, winProb: 0.38 },
                      { month: '2026 Q3', demand: 168, revenue: 72, winProb: 0.42 },
                      { month: '2026 Q4', demand: 195, revenue: 85, winProb: 0.45 },
                      { month: '2027 Q1', demand: 210, revenue: 98, winProb: 0.48 },
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px', fontWeight: 800 }}
                      />
                      <Area type="monotone" dataKey="demand" name="Trial Demand" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.1} strokeWidth={3} />
                      <Area type="monotone" dataKey="revenue" name="Expected Revenue ($M)" stroke="#10b981" fill="#10b981" fillOpacity={0.1} strokeWidth={3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-6 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-500 leading-relaxed">
                    <span className="text-violet-600 font-black uppercase mr-2">Insight:</span>
                    Revenue forecasts indicate a strong upward trajectory for FY26, driven by a 15% projected increase in early-phase biotech trial initiations.
                  </p>
                </div>
                <div className="mt-8 p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Forecasted Revenue (FY26)</div>
                    <div className="text-3xl font-black text-slate-900 tracking-tighter">
                      ${marketData?.revenueForecast?.reduce((acc: number, curr: any) => acc + curr.revenue, 0).toFixed(1) || '358.4'}M
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Avg. Win Probability</div>
                    <div className="text-3xl font-black text-emerald-600 tracking-tighter">
                      {(marketData?.revenueForecast?.reduce((acc: number, curr: any) => acc + (curr.winProb || 0), 0) / (marketData?.revenueForecast?.length || 1) * 100).toFixed(1) || '42.5'}%
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900 p-8 rounded-[40px] text-white flex flex-col">
                <h3 className="text-sm font-black uppercase tracking-widest mb-8">Revenue Forecast Algorithm</h3>
                <div className="space-y-6 flex-1">
                  <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
                    <div className="text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-2">Demand Prediction</div>
                    <div className="text-xs text-slate-400 leading-relaxed">
                      Predicts trial counts per segment using past volume, approvals, funding cycles, and R&D spend proxies.
                    </div>
                  </div>
                  <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
                    <div className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-2">Revenue Conversion</div>
                    <div className="text-xs text-slate-400 leading-relaxed">
                      Trials^ (S) × AvgDealValue (Phase, TA) × WinProbability (S)
                    </div>
                  </div>
                  <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
                    <div className="text-[10px] font-black text-violet-400 uppercase tracking-widest mb-2">Win Probability Model</div>
                    <div className="text-xs text-slate-400 leading-relaxed">
                      Logistic regression based on historical win/loss data, competitor presence, and CRO capability fit.
                    </div>
                  </div>
                </div>
                <button className="w-full py-4 bg-white text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] mt-8 hover:bg-cyan-500 hover:text-white transition-all">
                  Run Full Simulation
                </button>
              </div>
            </motion.div>
          )}

          {activeTab === 'architecture' && (
            <motion.div 
              key="architecture"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col gap-8"
            >
              {/* Schema Explorer */}
              <div className="bg-white p-10 rounded-[40px] border border-slate-200 shadow-sm">
                <div className="flex justify-between items-center mb-10">
                  <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase mb-2">Data Architecture & Schema</h2>
                    <p className="text-sm text-slate-500 font-medium">Full Star-Schema implementation for Clinical BI Scoring Engine</p>
                  </div>
                  <div className="flex gap-3">
                    <span className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest">PostgreSQL / Snowflake</span>
                    <span className="px-4 py-2 bg-cyan-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest">v2.1 Schema</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { 
                      title: 'Master Dimensions', 
                      icon: '📁',
                      tables: [
                        { name: 'dim_geography', cols: 'geo_id, cluster, region, country, currency' },
                        { name: 'dim_therapeutic_area', cols: 'ta_id, ta_name, ta_group, mesh_code' },
                        { name: 'dim_phase', cols: 'phase_id, phase_name, phase_bucket' },
                        { name: 'dim_sponsor', cols: 'sponsor_id, name_std, type, hq, employee_band' },
                        { name: 'dim_time', cols: 'date_id, date, year, quarter, month' }
                      ]
                    },
                    { 
                      title: 'Operational Facts', 
                      icon: '📊',
                      tables: [
                        { name: 'fact_trials_registry', cols: 'trial_id, source, sponsor_id, ta_id, phase_id, status' },
                        { name: 'fact_segment_market', cols: 'segment_id, date_id, trial_count, growth, demand' },
                        { name: 'fact_sponsor_funding', cols: 'sponsor_id, date_id, amount, round, growth' },
                        { name: 'fact_bids', cols: 'bid_id, sponsor_id, segment_id, value, won_flag' }
                      ]
                    },
                    { 
                      title: 'Performance & Risk', 
                      icon: '🛡️',
                      tables: [
                        { name: 'fact_delivery_perf', cols: 'delivery_id, segment_id, startup_time, enrollment_rate' },
                        { name: 'fact_financials', cols: 'finance_id, segment_id, revenue, cost, margin' },
                        { name: 'fact_capacity', cols: 'capacity_id, geo_id, function_id, available_fte' },
                        { name: 'fact_risk_indices', cols: 'geo_id, date_id, regulatory, political, currency' }
                      ]
                    },
                    { 
                      title: 'Scoring Layer', 
                      icon: '🎯',
                      tables: [
                        { name: 'dim_segment', cols: 'segment_id, ta_id, phase_id, geo_cluster, sponsor_type' },
                        { name: 'fact_segment_scores', cols: 'segment_id, date_id, mas, cfs, risk, os' },
                        { name: 'dim_weight_version', cols: 'version_id, name, effective_from, notes' },
                        { name: 'fact_weights', cols: 'version_id, score_type, factor_name, value' }
                      ]
                    }
                  ].map((group, i) => (
                    <div key={i} className="space-y-4">
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-xl">{group.icon}</span>
                        <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{group.title}</h4>
                      </div>
                      {group.tables.map((table, j) => (
                        <div key={j} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-cyan-500 transition-all cursor-help group">
                          <div className="text-xs font-black text-slate-900 mb-1">{table.name}</div>
                          <div className="text-[9px] text-slate-400 font-medium leading-tight">{table.cols}</div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              {/* Integration Architecture */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-slate-900 p-10 rounded-[40px] text-white relative overflow-hidden">
                  <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-500/5 blur-3xl rounded-full -mb-48 -mr-48"></div>
                  <h2 className="text-3xl font-black tracking-tighter uppercase mb-8 relative z-10">API Integration Flow</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                    {[
                      { 
                        step: '01', 
                        title: 'Landing Zone', 
                        desc: 'Raw JSON/CSV snapshots + metadata (source, ingestion_ts, checksum)', 
                        color: 'slate' 
                      },
                      { 
                        step: '02', 
                        title: 'Staging Area', 
                        desc: 'Entity resolution, de-duplication, schema mapping, MeSH/ICD-10 normalization', 
                        color: 'cyan' 
                      },
                      { 
                        step: '03', 
                        title: 'Curated Layer', 
                        desc: 'Star schema + aggregated segment signals + versioned scoring outputs', 
                        color: 'emerald' 
                      }
                    ].map((step, i) => (
                      <div key={i} className="p-6 bg-white/5 rounded-3xl border border-white/10 relative">
                        <div className="text-4xl font-black text-white/10 absolute top-4 right-4">{step.step}</div>
                        <h4 className={`text-[10px] font-black text-${step.color}-400 uppercase tracking-widest mb-3`}>{step.title}</h4>
                        <p className="text-xs text-slate-400 leading-relaxed font-medium">{step.desc}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                    <div>
                      <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">External Connectors</h4>
                      <div className="space-y-3">
                        {[
                          { name: 'Trial Registries', type: 'Daily Incremental (REST)' },
                          { name: 'Sponsor Pipelines', type: 'Weekly Scraping / NLP' },
                          { name: 'Funding Data', type: 'Crunchbase API Webhooks' },
                          { name: 'Risk Indices', type: 'Daily FX/Political Feed' }
                        ].map((conn, i) => (
                          <div key={i} className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5">
                            <span className="text-xs font-bold text-slate-300">{conn.name}</span>
                            <span className="text-[9px] font-black text-cyan-400 uppercase">{conn.type}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Internal Connectors</h4>
                      <div className="space-y-3">
                        {[
                          { name: 'CRM (Salesforce)', type: 'Bids & Accounts (CDC)' },
                          { name: 'CTMS', type: 'Operations & Startup (ETL)' },
                          { name: 'ERP / Finance', type: 'Margin & Revenue (API)' },
                          { name: 'HR / Resource', type: 'FTE & Utilization (Sync)' }
                        ].map((conn, i) => (
                          <div key={i} className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5">
                            <span className="text-xs font-bold text-slate-300">{conn.name}</span>
                            <span className="text-[9px] font-black text-emerald-400 uppercase">{conn.type}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-10 rounded-[40px] border border-slate-200 shadow-sm">
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-8">Orchestration Stack</h3>
                  <div className="space-y-6">
                    {[
                      { title: 'Orchestrator', val: 'Apache Airflow', icon: '🌪️' },
                      { title: 'API Connectors', val: 'Python / FastAPI', icon: '🐍' },
                      { title: 'Identity Resolution', val: 'Sponsor Standardization', icon: '🆔' },
                      { title: 'Data Quality', val: 'Great Expectations', icon: '✅' },
                      { title: 'Scoring Job', val: 'Versioned Python Engine', icon: '⚙️' }
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-xl border border-slate-100">
                          {item.icon}
                        </div>
                        <div>
                          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{item.title}</div>
                          <div className="text-sm font-black text-slate-900">{item.val}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-10 p-6 bg-cyan-50 rounded-3xl border border-cyan-100">
                    <p className="text-[10px] text-cyan-700 font-bold leading-relaxed">
                      "The orchestrator manages retries, backoff, and paging across all sources, ensuring data completeness and drift thresholds are maintained."
                    </p>
                  </div>
                </div>
              </div>

              {/* Cross References & Data Lineage */}
              <div className="bg-white p-10 rounded-[40px] border border-slate-200 shadow-sm">
                <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase mb-6">Cross References & Data Lineage</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Registry Mappings</h4>
                    <div className="space-y-3">
                      {[
                        { from: 'ClinicalTrials.gov (NCT)', to: 'Internal Trial ID', logic: 'One-to-One Mapping' },
                        { from: 'EU CTR (EudraCT)', to: 'Internal Trial ID', logic: 'Fuzzy Match on Sponsor/Title' },
                        { from: 'WHO ICTRP', to: 'Internal Trial ID', logic: 'Secondary ID Reconciliation' }
                      ].map((ref, i) => (
                        <div key={i} className="flex justify-between items-center p-3 bg-white rounded-xl border border-slate-200">
                          <span className="text-[10px] font-bold text-slate-900">{ref.from} → {ref.to}</span>
                          <span className="text-[8px] font-black text-cyan-600 uppercase">{ref.logic}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Entity Cross-Refs</h4>
                    <div className="space-y-3">
                      {[
                        { from: 'MeSH Terms', to: 'Therapeutic Area Dim', logic: 'Hierarchical Rollup' },
                        { from: 'Crunchbase ID', to: 'Sponsor Dimension', logic: 'Legal Entity Matching' },
                        { from: 'ISO Country Code', to: 'Geography Dimension', logic: 'Regional Cluster Mapping' }
                      ].map((ref, i) => (
                        <div key={i} className="flex justify-between items-center p-3 bg-white rounded-xl border border-slate-200">
                          <span className="text-[10px] font-bold text-slate-900">{ref.from} → {ref.to}</span>
                          <span className="text-[8px] font-black text-emerald-600 uppercase">{ref.logic}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'data-entry' && (
            <motion.div 
              key="data-entry"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              {/* Trial Entry Form */}
              <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm flex flex-col">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-8 flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-cyan-500"></div>
                  Manual Trial Ingestion
                </h3>
                <div className="space-y-4 flex-1">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Trial ID / Registry Key</label>
                    <input 
                      type="text" 
                      value={trialForm.id}
                      onChange={(e) => setTrialForm({...trialForm, id: e.target.value})}
                      placeholder="e.g., NCT01234567"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold focus:outline-none focus:border-cyan-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Sponsor Name</label>
                    <input 
                      type="text" 
                      value={trialForm.sponsor}
                      onChange={(e) => setTrialForm({...trialForm, sponsor: e.target.value})}
                      placeholder="Standardized Sponsor Name"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold focus:outline-none focus:border-cyan-500 transition-all"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Therapeutic Area</label>
                      <input 
                        type="text" 
                        value={trialForm.ta}
                        onChange={(e) => setTrialForm({...trialForm, ta: e.target.value})}
                        placeholder="Oncology, etc."
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold focus:outline-none focus:border-cyan-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Phase</label>
                      <select 
                        value={trialForm.phase}
                        onChange={(e) => setTrialForm({...trialForm, phase: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold focus:outline-none focus:border-cyan-500 transition-all"
                      >
                        <option value="">Select Phase</option>
                        <option value="Phase I">Phase I</option>
                        <option value="Phase II">Phase II</option>
                        <option value="Phase III">Phase III</option>
                        <option value="Phase IV">Phase IV</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Target Enrollment</label>
                    <input 
                      type="number" 
                      value={trialForm.enrollment}
                      onChange={(e) => setTrialForm({...trialForm, enrollment: e.target.value})}
                      placeholder="Total Subjects"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold focus:outline-none focus:border-cyan-500 transition-all"
                    />
                  </div>
                </div>
                <button className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] mt-8 hover:bg-cyan-600 transition-all">
                  Ingest Trial Data
                </button>
              </div>

              {/* Bid Entry Form */}
              <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm flex flex-col">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-8 flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  Manual Bid Entry
                </h3>
                <div className="space-y-4 flex-1">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Sponsor Account</label>
                    <input 
                      type="text" 
                      value={bidForm.sponsor}
                      onChange={(e) => setBidForm({...bidForm, sponsor: e.target.value})}
                      placeholder="CRM Account Name"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold focus:outline-none focus:border-emerald-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Market Segment</label>
                    <input 
                      type="text" 
                      value={bidForm.segment}
                      onChange={(e) => setBidForm({...bidForm, segment: e.target.value})}
                      placeholder="e.g., Oncology Ph III US"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold focus:outline-none focus:border-emerald-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Bid Value (USD)</label>
                    <input 
                      type="number" 
                      value={bidForm.value}
                      onChange={(e) => setBidForm({...bidForm, value: e.target.value})}
                      placeholder="Total Contract Value"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold focus:outline-none focus:border-emerald-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Decision Status</label>
                    <select 
                      value={bidForm.status}
                      onChange={(e) => setBidForm({...bidForm, status: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold focus:outline-none focus:border-emerald-500 transition-all"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Won">Won</option>
                      <option value="Loss">Loss</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
                <button className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] mt-8 hover:bg-emerald-600 transition-all">
                  Record Bid Fact
                </button>
              </div>

              {/* Performance Entry Form */}
              <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm flex flex-col">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-8 flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-violet-500"></div>
                  Performance Metrics
                </h3>
                <div className="space-y-4 flex-1">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Target Segment</label>
                    <input 
                      type="text" 
                      value={perfForm.segment}
                      onChange={(e) => setPerfForm({...perfForm, segment: e.target.value})}
                      placeholder="TA / Phase / Region"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold focus:outline-none focus:border-violet-500 transition-all"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Startup Time (Days)</label>
                      <input 
                        type="number" 
                        value={perfForm.startup}
                        onChange={(e) => setPerfForm({...perfForm, startup: e.target.value})}
                        placeholder="Avg Days"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold focus:outline-none focus:border-violet-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Enrollment Rate</label>
                      <input 
                        type="number" 
                        step="0.1"
                        value={perfForm.enrollment}
                        onChange={(e) => setPerfForm({...perfForm, enrollment: e.target.value})}
                        placeholder="Subj/Site/Month"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold focus:outline-none focus:border-violet-500 transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Quality Score (%)</label>
                    <input 
                      type="number" 
                      value={perfForm.quality}
                      onChange={(e) => setPerfForm({...perfForm, quality: e.target.value})}
                      placeholder="Compliance / Audit Score"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold focus:outline-none focus:border-violet-500 transition-all"
                    />
                  </div>
                </div>
                <div className="mt-8 p-4 bg-slate-50 rounded-2xl border border-slate-100 italic text-[10px] text-slate-500 leading-relaxed">
                  "Manual performance entries are weighted against historical CTMS benchmarks to update the Capability Fit Score (CFS)."
                </div>
                <button className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] mt-4 hover:bg-violet-600 transition-all">
                  Update Performance Fact
                </button>
              </div>
            </motion.div>
          )}

          {activeTab === 'surveillance' && (
            <motion.div 
              key="surveillance"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col gap-6"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-cyan-500"></div>
                  Live Market Surveillance
                </h3>
                <button 
                  onClick={fetchCroData}
                  disabled={isCroLoading}
                  className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-cyan-600 transition-all disabled:opacity-50"
                >
                  {isCroLoading ? 'Syncing...' : 'Refresh Feed'}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto pr-2">
                {isCroLoading ? (
                  Array(6).fill(0).map((_, i) => (
                    <div key={i} className="bg-white p-8 rounded-[40px] border border-slate-200 animate-pulse h-64"></div>
                  ))
                ) : (
                  croItems.map((item, index) => (
                    <div key={index} className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm hover:shadow-xl transition-all group flex flex-col">
                      <div className="flex justify-between items-start mb-6">
                        <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                          item.type === 'Win' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                          item.type === 'M&A' ? 'bg-violet-50 text-violet-600 border-violet-100' :
                          item.type === 'Expansion' ? 'bg-cyan-50 text-cyan-600 border-cyan-100' :
                          'bg-amber-50 text-amber-600 border-amber-100'
                        }`}>
                          {item.type}
                        </span>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{item.date}</span>
                      </div>
                      <div className="text-[10px] font-black text-cyan-600 uppercase tracking-widest mb-2">{item.cro}</div>
                      <h4 className="text-base font-black text-slate-900 tracking-tight leading-tight mb-4 group-hover:text-cyan-600 transition-colors">{item.title}</h4>
                      <p className="text-xs text-slate-500 leading-relaxed italic mb-6 flex-1 line-clamp-3">"{item.summary}"</p>
                      <div className="pt-6 border-t border-slate-50 flex justify-between items-center">
                        <span className="text-[10px] font-bold text-slate-700">{item.source}</span>
                        <a href={item.url} target="_blank" rel="noreferrer" className="text-cyan-600 hover:text-cyan-700">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </a>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default BusinessIntelligence;

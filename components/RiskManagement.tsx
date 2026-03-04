
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { RegulationEntry, NewsItem, ImpactLevel, RiskSeverity } from '../types';
import { getRegulatoryNews, getArchivedRegulatoryNews } from '../services/geminiService';

const NewsSkeleton = () => (
    <div className="space-y-6">
        {Array(4).fill(0).map((_, i) => (
            <div key={i} className="space-y-2 animate-pulse bg-white/5 p-4 rounded-xl">
                <div className="h-3 bg-slate-700 rounded w-3/4"></div>
                <div className="h-2 bg-slate-800 rounded w-full"></div>
            </div>
        ))}
    </div>
);

const RiskCategoryCard = ({ title, activeSignals, icon, color, trend }: { title: string, activeSignals: number, icon: React.ReactNode, color: string, trend: 'up' | 'down' | 'stable' }) => (
    <div className="bg-slate-900 border border-white/5 rounded-3xl p-6 relative overflow-hidden group hover:border-white/10 transition-all duration-500 shadow-2xl">
        <div className={`absolute top-0 left-0 w-1 h-full bg-${color}-500 shadow-[0_0_10px_rgba(var(--${color}-rgb),0.5)]`}></div>
        <div className="flex justify-between items-start mb-6">
            <div className={`p-3 rounded-2xl bg-${color}-500/10 text-${color}-400 group-hover:scale-110 transition-transform`}>
                {icon}
            </div>
            <div className={`text-[10px] font-black uppercase tracking-[0.2em] px-2 py-1 rounded-lg ${trend === 'up' ? 'text-red-400 bg-red-400/5' : 'text-emerald-400 bg-emerald-400/5'}`}>
                {trend === 'up' ? 'Risk Rising ↑' : trend === 'down' ? 'Stabilizing ↓' : 'Stable'}
            </div>
        </div>
        <h4 className="text-xl font-black text-white tracking-tighter uppercase mb-1">{title}</h4>
        <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{activeSignals}</span>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Signals</span>
        </div>
    </div>
);

interface RiskManagementProps {
    data: RegulationEntry[];
}

const RiskManagement: React.FC<RiskManagementProps> = ({ data }) => {
    const [riskSignals, setRiskSignals] = useState<NewsItem[]>([]);
    const [historicalEvents, setHistoricalEvents] = useState<NewsItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const enrichWithRiskData = (items: NewsItem[]): NewsItem[] => {
        const categories: ('GMP' | 'GCP' | 'PV' | 'CRA')[] = ['GMP', 'GCP', 'PV', 'CRA'];
        const severities = [RiskSeverity.Critical, RiskSeverity.Major, RiskSeverity.Minor];
        return items.map(item => ({
            ...item,
            riskCategory: categories[Math.floor(Math.random() * categories.length)],
            severity: severities[Math.floor(Math.random() * severities.length)]
        }));
    };

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [live, archived] = await Promise.all([getRegulatoryNews(), getArchivedRegulatoryNews()]);
            setRiskSignals(enrichWithRiskData(live || []));
            setHistoricalEvents(enrichWithRiskData(archived || []));
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const stats = useMemo(() => ({
        critical: riskSignals.filter(s => s.severity === RiskSeverity.Critical).length,
        gmp: riskSignals.filter(s => s.riskCategory === 'GMP').length,
        gcp: riskSignals.filter(s => s.riskCategory === 'GCP').length,
        pv: riskSignals.filter(s => s.riskCategory === 'PV').length,
        cra: riskSignals.filter(s => s.riskCategory === 'CRA').length,
    }), [riskSignals]);

    return (
        <div className="flex flex-col gap-8 h-full overflow-y-auto pb-10 scrollbar-thin animate-in fade-in duration-1000">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <RiskCategoryCard 
                    title="GMP Integrity" 
                    activeSignals={stats.gmp} 
                    icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" strokeWidth="2.5"/></svg>}
                    color="emerald"
                    trend="stable"
                />
                <RiskCategoryCard 
                    title="GCP Adherence" 
                    activeSignals={stats.gcp} 
                    icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" strokeWidth="2.5"/></svg>}
                    color="blue"
                    trend="up"
                />
                <RiskCategoryCard 
                    title="PV Vigilance" 
                    activeSignals={stats.pv} 
                    icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" strokeWidth="2.5"/><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" strokeWidth="2.5"/></svg>}
                    color="amber"
                    trend="stable"
                />
                <RiskCategoryCard 
                    title="CRA Operations" 
                    activeSignals={stats.cra} 
                    icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" strokeWidth="2.5"/></svg>}
                    color="cyan"
                    trend="down"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 space-y-8">
                    <div className="bg-slate-950 rounded-[40px] shadow-3xl border border-white/5 overflow-hidden flex flex-col min-h-[700px] relative">
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-500/5 blur-[100px] rounded-full -mr-200 -mt-200"></div>
                        
                        <div className="p-10 bg-slate-900 border-b border-white/5 flex justify-between items-center z-10">
                            <div>
                                <h3 className="text-2xl font-black text-white tracking-tighter uppercase">Risk Surveillance Stream</h3>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mt-1">Live GxP Monitoring Node • Protocol Sensitivity High</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="text-right">
                                    <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Global Risk Index</div>
                                    <div className="text-xl font-black text-red-500 tracking-tighter">LEVEL 4</div>
                                </div>
                                <div className="w-1.5 h-12 bg-red-500 rounded-full shadow-[0_0_15px_rgba(239,68,68,0.6)]"></div>
                            </div>
                        </div>

                        <div className="p-10 flex-1 overflow-y-auto z-10 scrollbar-thin scrollbar-thumb-white/10">
                            {isLoading ? <NewsSkeleton /> : (
                                <div className="space-y-6">
                                    {riskSignals.map((signal, idx) => (
                                        <div key={idx} className="group bg-white/5 hover:bg-white/10 p-6 rounded-[32px] border border-white/5 transition-all duration-500 hover:scale-[1.01] hover:shadow-2xl">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex items-center gap-4">
                                                    <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                                                        signal.severity === RiskSeverity.Critical ? 'bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.4)]' : 
                                                        signal.severity === RiskSeverity.Major ? 'bg-amber-500 text-slate-900' : 'bg-blue-500 text-white'
                                                    }`}>
                                                        {signal.severity}
                                                    </span>
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Signal {idx + 1} • {signal.riskCategory} Risk</span>
                                                </div>
                                                <span className="text-[10px] font-mono text-slate-500 tracking-tighter">{signal.date}</span>
                                            </div>
                                            <a href={signal.url} target="_blank" rel="noreferrer" className="text-lg font-black text-white group-hover:text-cyan-400 transition-colors leading-tight block mb-4 underline decoration-white/10 underline-offset-4 decoration-2">
                                                {signal.title}
                                            </a>
                                            <p className="text-sm text-slate-400 leading-relaxed font-medium italic opacity-80">
                                                "{signal.summary}"
                                            </p>
                                            <div className="mt-8 flex justify-between items-center">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-500">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" strokeWidth="2.5"/></svg>
                                                    </div>
                                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{signal.source}</span>
                                                </div>
                                                <button className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg active:scale-95 border-b-4 border-cyan-800">Analyze Impact</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-4 space-y-8">
                    <div className="bg-slate-900 rounded-[40px] shadow-2xl p-10 text-white relative overflow-hidden border border-white/5">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 blur-3xl rounded-full -mr-16 -mt-16"></div>
                        <h3 className="text-lg font-black mb-6 uppercase tracking-tighter flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-cyan-500 flex items-center justify-center text-slate-900">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z" strokeWidth="3"/></svg>
                            </div>
                            Mitigation Ops
                        </h3>
                        <div className="space-y-6">
                            <div className="p-5 bg-white/5 rounded-3xl border border-white/10 hover:bg-white/10 transition-colors cursor-pointer group">
                                <h5 className="text-[11px] font-black text-cyan-400 uppercase tracking-widest mb-1">CRA Oversight Loop</h5>
                                <p className="text-xs text-slate-400 font-medium leading-relaxed group-hover:text-slate-200 transition-colors">Launch 1:1 intervention for sites affected by the recent GCP signal.</p>
                            </div>
                            <div className="p-5 bg-white/5 rounded-3xl border border-white/10 hover:bg-white/10 transition-colors cursor-pointer group">
                                <h5 className="text-[11px] font-black text-emerald-400 uppercase tracking-widest mb-1">GMP Change Control</h5>
                                <p className="text-xs text-slate-400 font-medium leading-relaxed group-hover:text-slate-200 transition-colors">Audit manufacturing SOPs against 21 signal updates.</p>
                            </div>
                            <div className="p-5 bg-white/5 rounded-3xl border border-white/10 hover:bg-white/10 transition-colors cursor-pointer group">
                                <h5 className="text-[11px] font-black text-amber-400 uppercase tracking-widest mb-1">PV Safety Protocol</h5>
                                <p className="text-xs text-slate-400 font-medium leading-relaxed group-hover:text-slate-200 transition-colors">Cross-reference safety news with active dose-management cohorts.</p>
                            </div>
                        </div>
                        <button onClick={() => (window as any).setActiveTab('chat')} className="w-full mt-10 py-5 bg-white text-slate-900 rounded-[20px] font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all">Consult Risk Agent</button>
                    </div>

                    <div className="bg-white rounded-[40px] shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[500px]">
                        <div className="p-8 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Risk Propagation Audit</h3>
                        </div>
                        <div className="p-8 flex-1 overflow-y-auto scrollbar-thin">
                             {isLoading ? <NewsSkeleton /> : (
                                 <div className="space-y-8">
                                     {historicalEvents.map((item, i) => (
                                         <div key={i} className="flex gap-6 group">
                                             <div className="flex flex-col items-center">
                                                 <div className={`w-2.5 h-2.5 rounded-full ${item.severity === RiskSeverity.Critical ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'bg-slate-300'} z-10 transition-transform group-hover:scale-150`}></div>
                                                 <div className="w-0.5 flex-1 bg-slate-100 mt-2"></div>
                                             </div>
                                             <div className="flex-1 pb-8 border-b border-slate-50 group-last:border-0 group-last:pb-0">
                                                 <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">{item.date}</div>
                                                 <div className="text-xs font-bold text-slate-800 leading-snug group-hover:text-cyan-600 transition-colors mb-2">{item.title}</div>
                                                 <div className="flex items-center gap-2">
                                                     <span className="text-[8px] font-black text-slate-400 uppercase bg-slate-100 px-2 py-0.5 rounded tracking-tighter">{item.riskCategory} Impact</span>
                                                     <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{item.source}</span>
                                                 </div>
                                             </div>
                                         </div>
                                     ))}
                                 </div>
                             )}
                        </div>
                    </div>
                </div>
            </div>
            <style>{`
                .shadow-3xl { box-shadow: 0 50px 100px -20px rgba(0,0,0,0.4), 0 30px 60px -30px rgba(0,0,0,0.5); }
                @keyframes glow { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }
                .glow-red { animation: glow 2s infinite ease-in-out; }
            `}</style>
        </div>
    );
};

export default RiskManagement;

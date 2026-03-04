
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { RegulationEntry, NewsItem, ImpactLevel, DatabaseFilters } from '../types';
import { getRegulatoryNews, getArchivedRegulatoryNews } from '../services/geminiService';

const NewsSkeleton = () => (
    <div className="space-y-6">
        {Array(3).fill(0).map((_, i) => (
            <div key={i} className="space-y-2 animate-pulse">
                <div className="h-3 bg-slate-200 rounded w-3/4"></div>
                <div className="h-3 bg-slate-200 rounded w-full"></div>
            </div>
        ))}
    </div>
);

const KpiCard = ({ title, value, icon, color, badge }: { title: string, value: string | number, icon: React.ReactNode, color: string, badge?: string }) => (
    <div className={`relative w-full p-8 bg-white rounded-[32px] shadow-sm border border-slate-200 flex items-center gap-6 hover:shadow-xl transition-all duration-500 overflow-hidden group`}>
        {badge && <span className="absolute top-0 right-0 px-3 py-1 bg-cyan-600 text-white text-[9px] font-black uppercase tracking-widest rounded-bl-xl shadow-lg">{badge}</span>}
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-${color}-50 text-${color}-600 flex-shrink-0 group-hover:scale-110 transition-transform duration-500`}>
            {icon}
        </div>
        <div>
            <div className="text-3xl font-black text-slate-900 tracking-tighter">{value}</div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{title}</div>
        </div>
    </div>
);

interface RegulatoryIntelligenceProps {
    data: RegulationEntry[];
}

const RegulatoryIntelligence: React.FC<RegulatoryIntelligenceProps> = ({ data }) => {
    const [news, setNews] = useState<NewsItem[]>([]);
    const [archivedNews, setArchivedNews] = useState<NewsItem[]>([]);
    const [isLiveLoading, setIsLiveLoading] = useState(true);
    const [isArchivedLoading, setIsArchivedLoading] = useState(true);

    const fetchData = useCallback(async () => {
        setIsLiveLoading(true);
        setIsArchivedLoading(true);
        try {
            const [live, archived] = await Promise.all([getRegulatoryNews(), getArchivedRegulatoryNews()]);
            setNews(live || []);
            setArchivedNews(archived || []);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLiveLoading(false);
            setIsArchivedLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const kpiData = useMemo(() => ({
        highImpact: data.filter(r => r.impact === ImpactLevel.High).length,
        total: data.length,
        recent: data.filter(r => (Date.now() - new Date(r.date).getTime()) <= (30 * 86400000)).length
    }), [data]);

    return (
        <div className="flex flex-col gap-8 h-full overflow-y-auto pb-10 scrollbar-thin">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <KpiCard 
                    title="Critical Findings" 
                    value={kpiData.highImpact} 
                    icon={<svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z" strokeWidth="2.5"/></svg>}
                    color="red"
                 />
                 <KpiCard 
                    title="Intelligence Vault" 
                    value={kpiData.total} 
                    icon={<svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4" strokeWidth="2.5"/></svg>}
                    color="indigo"
                    badge="LOCAL DB"
                 />
                 <KpiCard 
                    title="Global Updates (30d)" 
                    value={kpiData.recent} 
                    icon={<svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeWidth="2.5"/></svg>}
                    color="cyan"
                 />
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                 <div className="lg:col-span-8 flex flex-col gap-6">
                     <div className="bg-white rounded-[40px] shadow-sm border border-slate-200 overflow-hidden flex flex-col flex-1 min-h-[600px]">
                         <div className="p-8 bg-slate-900 text-white flex justify-between items-center relative overflow-hidden">
                             <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 blur-3xl rounded-full -mr-32 -mt-32"></div>
                             <div className="relative z-10 flex items-center gap-4">
                                <div className="w-12 h-12 bg-cyan-500 rounded-2xl flex items-center justify-center text-slate-900 shadow-lg">
                                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3" strokeWidth="2.5"/></svg>
                                </div>
                                <div>
                                    <h3 className="text-xl font-black tracking-tight uppercase">Live Global Surveillance</h3>
                                    <p className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.2em] mt-0.5">Monitoring Authorities • Real-time Sink</p>
                                </div>
                             </div>
                             <div className="relative z-10 flex items-center gap-3 bg-white/5 px-4 py-2 rounded-xl border border-white/10">
                                 <div className="w-2 h-2 rounded-full bg-cyan-500 animate-ping"></div>
                                 <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400">Node v2.1-Live</span>
                             </div>
                         </div>
                         <div className="p-8 flex-1 overflow-y-auto bg-slate-50/30 space-y-6">
                             {isLiveLoading ? <NewsSkeleton /> : (
                                 <div className="grid grid-cols-1 gap-4">
                                     {news.map((item, index) => (
                                         <div key={index} className="group bg-white p-6 rounded-3xl border border-slate-200 hover:border-cyan-500/50 hover:shadow-xl transition-all duration-500">
                                             <div className="flex justify-between items-start mb-3">
                                                <a href={item.url} target="_blank" rel="noreferrer" className="text-base font-black text-slate-800 hover:text-cyan-600 transition-colors leading-tight decoration-cyan-100 underline-offset-4 decoration-2">{item.title}</a>
                                             </div>
                                             <p className="text-xs text-slate-500 leading-relaxed italic">"{item.summary}"</p>
                                             <div className="flex gap-3 mt-5 items-center">
                                                 <span className="text-[9px] font-black bg-slate-900 text-white px-3 py-1 rounded-lg uppercase tracking-widest">{item.source}</span>
                                                 <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{item.date}</span>
                                             </div>
                                         </div>
                                     ))}
                                 </div>
                             )}
                         </div>
                     </div>
                 </div>

                 <div className="lg:col-span-4 space-y-6">
                     <div className="bg-slate-900 rounded-[40px] shadow-2xl p-8 text-white relative overflow-hidden">
                         <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 blur-3xl rounded-full -mr-16 -mt-16"></div>
                         <h3 className="text-lg font-black mb-1 flex items-center gap-3 uppercase tracking-tighter">
                             <div className="w-8 h-8 rounded-lg bg-cyan-500 flex items-center justify-center text-slate-900">
                                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z" strokeWidth="3"/></svg>
                             </div>
                             Surveillance NOC
                         </h3>
                         <p className="text-xs text-slate-400 mt-4 leading-relaxed font-medium uppercase tracking-tight opacity-70">Automated correlation logic actively syncing GMP/GCP/PV changes against active clinical protocols.</p>
                         <div className="mt-8 pt-8 border-t border-white/5 flex flex-col gap-4">
                            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-500">
                                <span>Signal Sensitivity</span>
                                <span className="text-cyan-500">Tier 4</span>
                            </div>
                            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-cyan-500 w-[92%] rounded-full shadow-[0_0_10px_rgba(6,182,212,0.8)]"></div>
                            </div>
                         </div>
                     </div>

                     <div className="bg-white rounded-[40px] shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[520px]">
                         <div className="p-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                             <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Clinical Milestones</h3>
                         </div>
                         <div className="p-6 flex-1 overflow-y-auto scrollbar-thin">
                              {isArchivedLoading ? <NewsSkeleton /> : (
                                  <div className="space-y-6">
                                      {archivedNews.map((item, i) => (
                                          <div key={i} className="flex gap-5 group">
                                              <div className="text-[10px] font-black text-slate-300 w-16 text-right tabular-nums pt-1 group-hover:text-cyan-500 transition-colors">{item.date}</div>
                                              <div className="flex-1 pb-4 border-b border-slate-50 group-last:border-0">
                                                  <div className="text-xs font-bold text-slate-800 leading-snug group-hover:text-cyan-600 transition-colors">{item.title}</div>
                                                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1 block">{item.source}</span>
                                              </div>
                                          </div>
                                      ))}
                                  </div>
                              )}
                         </div>
                     </div>
                 </div>
             </div>
        </div>
    );
};

export default RegulatoryIntelligence;

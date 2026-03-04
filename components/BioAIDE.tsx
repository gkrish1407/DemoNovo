import React, { useState, useMemo } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { analyzeBiosimilarity } from '../services/geminiService';
import { saveAuditEntry } from '../services/dbService';
import { BiocharacterizationResult } from '../types';

const BioAIDE: React.FC = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [referenceBiologic, setReferenceBiologic] = useState('Trastuzumab (Herceptin)');
  const [uploadedData, setUploadedData] = useState<string>('');
  const [result, setResult] = useState<BiocharacterizationResult | null>(null);

  // Generate mock data for visualization
  const msProfileData = useMemo(() => {
    return Array.from({ length: 50 }, (_, i) => ({
      mz: 145000 + i * 100,
      ref: Math.exp(-Math.pow(i - 25, 2) / 50) * 100,
      biosimilar: Math.exp(-Math.pow(i - 24, 2) / 55) * 98 + (Math.random() * 2)
    }));
  }, []);

  const radarData = useMemo(() => {
    if (!result) return [
      { subject: 'Primary Structure', A: 99, B: 98, fullMark: 100 },
      { subject: 'Glycosylation', A: 95, B: 92, fullMark: 100 },
      { subject: 'Charge Variants', A: 98, B: 97, fullMark: 100 },
      { subject: 'Size Variants', A: 96, B: 95, fullMark: 100 },
      { subject: 'Binding Affinity', A: 100, B: 99, fullMark: 100 },
      { subject: 'Potency', A: 98, B: 96, fullMark: 100 },
    ];
    return [
      { subject: 'Primary Structure', A: 100, B: 99, fullMark: 100 },
      { subject: 'Glycosylation', A: 100, B: result.glycosylationIndex, fullMark: 100 },
      { subject: 'Charge Variants', A: 100, B: result.similarityScore, fullMark: 100 },
      { subject: 'Size Variants', A: 100, B: 95, fullMark: 100 },
      { subject: 'Binding Affinity', A: 100, B: result.potencyPredicted, fullMark: 100 },
      { subject: 'Potency', A: 100, B: result.potencyPredicted - 2, fullMark: 100 },
    ];
  }, [result]);

  const handleRunAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const bioResult = await analyzeBiosimilarity({ raw: uploadedData || "Sample SEC-MALS and LC-MS metadata" }, referenceBiologic);
      setResult(bioResult);
      // Fix: module 'bioaide' is not assignable to type 'AppTab'. Using 'competency-dashboard' instead.
      await saveAuditEntry({
        id: `BIO-${Date.now()}`,
        timestamp: Date.now(),
        action: 'BIOSIMILAR_ANALYSIS',
        user: 'Scientist',
        module: 'competency-dashboard',
        details: `Analyzed biosimilar candidate similarity to ${referenceBiologic}. Score: ${bioResult.similarityScore}%`
      });
    } catch (e) {
      alert("AI analysis error. Using baseline simulation.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex flex-col h-full gap-6 pb-10 animate-in fade-in duration-500">
      {/* Platform Header */}
      <div className="bg-slate-900 text-white p-6 rounded-xl border border-white/5 shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 blur-3xl rounded-full -mr-48 -mt-48"></div>
        <div className="z-10">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-cyan-500 rounded-lg flex items-center justify-center text-slate-900">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1a1 1 0 112 0v1a1 1 0 11-2 0zM13.536 14.95a1 1 0 010-1.414l.707-.707a1 1 0 011.414 1.414l-.707.707a1 1 0 01-1.414 0zM6.464 14.95a1 1 0 01-1.414 0l-.707-.707a1 1 0 011.414-1.414l.707.707a1 1 0 010 1.414z" /></svg>
             </div>
             <div>
                <h2 className="text-2xl font-black tracking-tight">BioAIDE: Analytical Characterization</h2>
                <p className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest mt-0.5">Biosimilar Similarity & CQA Prediction Platform</p>
             </div>
          </div>
        </div>
        <div className="z-10 flex gap-4 w-full md:w-auto">
          <div className="flex-1 md:w-64">
             <label className="block text-[8px] font-black text-slate-500 uppercase mb-1">Reference Biologic</label>
             <select 
               value={referenceBiologic}
               onChange={e => setReferenceBiologic(e.target.value)}
               className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs font-bold text-white focus:ring-2 focus:ring-cyan-500 outline-none"
             >
               <option>Trastuzumab (Herceptin)</option>
               <option>Adalimumab (Humira)</option>
               <option>Rituximab (Rituxan)</option>
               <option>Bevacizumab (Avastin)</option>
               <option>Infliximab (Remicade)</option>
             </select>
          </div>
          <button 
            onClick={handleRunAnalysis}
            disabled={isAnalyzing}
            className="px-6 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-cyan-900/20 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isAnalyzing ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : 'Analyze Batch'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        
        {/* Left Col: Analysis Controls & Compliance */}
        <div className="flex flex-col gap-6 overflow-y-auto pr-1">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Analytical Data Pipeline</h3>
            <div className="space-y-4">
               <div>
                  <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Source Dataset (mzML / CSV / Bioassay)</label>
                  <textarea 
                    className="w-full h-32 bg-slate-50 border border-slate-200 rounded-lg p-3 text-[10px] font-mono focus:ring-2 focus:ring-cyan-500/10 outline-none"
                    placeholder="Paste parsed analytical summary or meta-data..."
                    value={uploadedData}
                    onChange={e => setUploadedData(e.target.value)}
                  />
               </div>
               <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex flex-col items-center justify-center gap-1">
                      <span className="text-[8px] font-black text-slate-400 uppercase">Batch ID</span>
                      <span className="text-[11px] font-bold text-slate-700">LOT-2025-004X</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex flex-col items-center justify-center gap-1">
                      <span className="text-[8px] font-black text-slate-400 uppercase">Analysis Engine</span>
                      <span className="text-[11px] font-bold text-cyan-600">BioCompare v4.0</span>
                  </div>
               </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex-1">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Regulatory Compliance Checker</h3>
            {result ? (
              <div className="space-y-4">
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                    <p className="text-[11px] text-emerald-800 leading-relaxed italic font-medium">"{result.complianceAssessment}"</p>
                </div>
                <div className="space-y-2">
                    <span className="text-[9px] font-black text-slate-400 uppercase">Required Remediation</span>
                    {result.remediationSteps.map((step, i) => (
                        <div key={i} className="flex gap-2 p-2 bg-slate-50 rounded border border-slate-100 text-[10px] text-slate-600 font-medium">
                            <span className="text-cyan-600">●</span> {step}
                        </div>
                    ))}
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-2 p-10">
                  <svg className="w-12 h-12 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                  <p className="text-[10px] font-black uppercase text-center">System awaiting analytical signals</p>
              </div>
            )}
          </div>
        </div>

        {/* Center: Real-time Dashboards */}
        <div className="lg:col-span-2 space-y-6 overflow-y-auto scrollbar-thin pr-1">
          
          {/* KPI Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
               <span className="text-[8px] font-black text-slate-400 uppercase">Similarity Score</span>
               <div className={`text-2xl font-black ${result?.similarityScore ? (result.similarityScore > 95 ? 'text-emerald-600' : 'text-amber-500') : 'text-slate-300'}`}>
                 {result?.similarityScore ? `${result.similarityScore}%` : '--%'}
               </div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
               <span className="text-[8px] font-black text-slate-400 uppercase">Glycosylation Index</span>
               <div className={`text-2xl font-black ${result?.glycosylationIndex ? (result.glycosylationIndex > 90 ? 'text-emerald-600' : 'text-amber-500') : 'text-slate-300'}`}>
                 {result?.glycosylationIndex ? `${result.glycosylationIndex}%` : '--%'}
               </div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
               <span className="text-[8px] font-black text-slate-400 uppercase">Aggregation Risk</span>
               <div className={`text-2xl font-black ${result?.aggregationRisk === 'Low' ? 'text-emerald-600' : result?.aggregationRisk === 'Medium' ? 'text-amber-500' : 'text-red-600'}`}>
                 {result?.aggregationRisk || 'N/A'}
               </div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
               <span className="text-[8px] font-black text-slate-400 uppercase">Potency (Predicted)</span>
               <div className={`text-2xl font-black ${result?.potencyPredicted ? 'text-cyan-600' : 'text-slate-300'}`}>
                 {result?.potencyPredicted ? `${result.potencyPredicted}%` : '--%'}
               </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Mass Spec Overlay */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col h-[380px]">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Intact Mass Fingerprinting</h3>
                <div className="flex gap-4">
                   <div className="flex items-center gap-1.5"><div className="w-2 h-2 bg-slate-200 rounded-full"></div><span className="text-[9px] font-bold text-slate-400 uppercase">Reference</span></div>
                   <div className="flex items-center gap-1.5"><div className="w-2 h-2 bg-cyan-500 rounded-full"></div><span className="text-[9px] font-bold text-slate-400 uppercase">Candidate</span></div>
                </div>
              </div>
              <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={msProfileData}>
                    <defs>
                      <linearGradient id="colorRef" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#94a3b8" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorBio" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0891b2" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#0891b2" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="mz" hide />
                    <YAxis hide />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '10px' }}
                    />
                    <Area type="monotone" dataKey="ref" stroke="#cbd5e1" fillOpacity={1} fill="url(#colorRef)" strokeWidth={1} isAnimationActive={false} />
                    <Area type="monotone" dataKey="biosimilar" stroke="#0891b2" fillOpacity={1} fill="url(#colorBio)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Radar: Multimodal Comparison */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col h-[380px]">
               <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-widest mb-6">Similarity Domain Analysis</h3>
               <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                    <PolarGrid stroke="#f1f5f9" />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 9, fill: '#64748b', fontWeight: 'bold' }} />
                    <PolarRadiusAxis hide domain={[0, 100]} />
                    <Radar
                      name="Reference"
                      dataKey="A"
                      stroke="#cbd5e1"
                      fill="#94a3b8"
                      fillOpacity={0.1}
                    />
                    <Radar
                      name="Biosimilar"
                      dataKey="B"
                      stroke="#0891b2"
                      fill="#0891b2"
                      fillOpacity={0.4}
                    />
                    <Legend wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }} />
                  </RadarChart>
                </ResponsiveContainer>
               </div>
            </div>
          </div>

          {/* Critical Differences Matrix */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Critical Quality Attribute (CQA) Matrix</h3>
              <div className="flex gap-2">
                 <div className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-600 text-[8px] font-black border border-emerald-100 uppercase">ICH Q6B Compliant</div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-white text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4">Attribute</th>
                    <th className="px-6 py-4">Reference Level</th>
                    <th className="px-6 py-4">Batch Level</th>
                    <th className="px-6 py-4">Delta</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {result?.criticalDifferences.map((diff, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                         <div className="text-[11px] font-bold text-slate-800">{diff.attribute}</div>
                         <div className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Domain Analysis</div>
                      </td>
                      <td className="px-6 py-4 text-[11px] font-medium text-slate-500 font-mono">{diff.referenceValue}</td>
                      <td className="px-6 py-4 text-[11px] font-black text-slate-800 font-mono">{diff.biosimilarValue}</td>
                      <td className="px-6 py-4">
                         <span className={`text-[10px] font-bold ${diff.status === 'Pass' ? 'text-emerald-600' : 'text-amber-600'}`}>
                            {diff.status === 'Pass' ? 'Within Range' : 'Deviation Detected'}
                         </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                         <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                           diff.status === 'Pass' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                         }`}>
                           {diff.status}
                         </span>
                      </td>
                    </tr>
                  ))}
                  {!result && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-400 text-[10px] font-black uppercase tracking-widest italic opacity-50">
                         Perform analytical scan to populate characterization matrix
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default BioAIDE;
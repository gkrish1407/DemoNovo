
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";

type CRAModule = 'Dashboard' | 'Productivity' | 'Onboarding' | 'OJT' | 'AVA' | 'One-to-One' | 'Career' | 'Handover';

// --- Types & Constants ---
interface Objective {
    title: string;
    description: string;
    successMeasures: string[];
}

interface GoalCategory {
    id: string;
    label: string;
    weight: string;
    objectives: Objective[];
}

const GOAL_FRAMEWORK: GoalCategory[] = [
    {
        id: 'deliverable',
        label: 'Deliverable Target',
        weight: '30%',
        objectives: [
            { 
                title: '1. Enhancing Site Engagement', 
                description: 'Build relationships to support recruitment, retention, and enrollment targets.',
                successMeasures: ['Sites enroll within 3 months of SIV', 'Supporting sites to achieve targets']
            },
            { 
                title: '2. SDV & Site Management', 
                description: 'Ensure efficient site data entry, query resolution, and monitoring practices.',
                successMeasures: ['Achieve DBL/IA targets', 'Adequate SDV oversight']
            },
            { 
                title: '3. Monitoring Oversight', 
                description: 'Maintain oversight of site activities through effective monitoring reports.',
                successMeasures: ['>95% MVR submission ≤ 5 BDs', 'Timely FUI resolution within 60 BDs']
            }
        ]
    },
    {
        id: 'quality',
        label: 'Quality Target',
        weight: '20%',
        objectives: [
            { 
                title: '1. First-Time Quality', 
                description: 'A first-time quality approach to monitoring and report writing.',
                successMeasures: ['No serious escalations', 'Avg ≤ 2 review cycles per report']
            },
            { 
                title: '2. Audit Readiness', 
                description: 'Proactively identifying and resolving issues to mitigate risks.',
                successMeasures: ['No critical audit findings', 'Major PD escalation within 24hrs']
            },
            { 
                title: '3. Compliance', 
                description: 'Compliance with Timesheets, Training, and Expenses.',
                successMeasures: ['>95% Timesheet compliance', '>95% Training compliance']
            }
        ]
    },
    {
        id: 'productivity',
        label: 'Productivity Target',
        weight: '20%',
        objectives: [
            { 
                title: '1. Optimization & DOS', 
                description: 'Drive progress through IMV completion and effective time use.',
                successMeasures: ['Achieve utilization target', '>6 DOS/month minimum']
            },
            { 
                title: '2. System Proficiency', 
                description: 'Leveraging technology (CTMS, TMF) for operational efficiency.',
                successMeasures: ['System SME status', 'Integration of technical skills']
            }
        ]
    },
    {
        id: 'competency',
        label: 'Competency Target',
        weight: '30%',
        objectives: [
            { 
                title: '1. Core Behaviors', 
                description: 'Performance across organizational behavioral markers.',
                successMeasures: ['Manages Complexity', 'Action Oriented', 'Self-Development']
            }
        ]
    }
];

const DIRECT_REPORTS = [
    { id: 'cr1', name: 'Michael Chen', role: 'CRA II', level: 'CRA II', doj: '12-Jan-2023', location: 'Sydney', region: 'APAC', status: 'Active' },
    { id: 'cr2', name: 'James Wilson', role: 'CRA I', level: 'Junior CRA', doj: '15-Mar-2024', location: 'London', region: 'UK', status: 'Active' },
    { id: 'cr3', name: 'Sarah Jenkins', role: 'Senior CRA', level: 'Senior CRA', doj: '05-Jun-2022', location: 'San Francisco', region: 'US', status: 'On Leave' },
    { id: 'cr4', name: 'Elena Rodriguez', role: 'CRA II', level: 'CRA II', doj: '20-Oct-2023', location: 'Madrid', region: 'EU', status: 'Active' },
];

const CRAManagementPortal: React.FC = () => {
    const [activeModule, setActiveModule] = useState<CRAModule>('Dashboard');
    const [selectedCRAId, setSelectedCRAId] = useState<string | null>(null);

    const handleSelectCRA = (id: string, moduleOverride?: CRAModule) => {
        setSelectedCRAId(id);
        if (moduleOverride) setActiveModule(moduleOverride);
    };

    const modules: { id: CRAModule; label: string; icon: string }[] = [
        { id: 'Dashboard', label: 'Workforce', icon: '👤' },
        { id: 'Productivity', label: 'Metrics', icon: '📈' },
        { id: 'Onboarding', label: 'Lifecycle', icon: '🔄' },
        { id: 'OJT', label: 'Mastery', icon: '🎓' },
        { id: 'AVA', label: 'Field Ops', icon: '🔍' },
        { id: 'One-to-One', label: '1:1 Vault', icon: '🛡️' },
        { id: 'Career', label: 'Pathways', icon: '🛤️' },
        { id: 'Handover', label: 'Archive', icon: '📦' },
    ];

    return (
        <div className="flex flex-col h-full bg-[#f8fafc] rounded-3xl overflow-hidden border border-slate-200 shadow-2xl animate-in fade-in duration-700">
            {selectedCRAId && activeModule !== 'Dashboard' && (
                <div className="bg-slate-900 px-8 py-3 flex justify-between items-center text-white no-print shadow-xl z-20">
                    <div className="flex items-center gap-4">
                        <div className="w-9 h-9 rounded-xl bg-cyan-500 flex items-center justify-center text-slate-900 font-black text-xs shadow-lg">
                            {DIRECT_REPORTS.find(c => c.id === selectedCRAId)?.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                            <div className="text-[10px] font-black text-cyan-500 uppercase tracking-[0.2em] leading-none">Personnel Folder Active</div>
                            <div className="text-sm font-bold text-white tracking-tight">{DIRECT_REPORTS.find(c => c.id === selectedCRAId)?.name}</div>
                        </div>
                    </div>
                    <button onClick={() => setSelectedCRAId(null)} className="group flex items-center gap-2 text-[10px] font-black text-slate-400 hover:text-white uppercase tracking-widest transition-all">
                        Close Record <span className="bg-slate-800 p-1.5 rounded-lg group-hover:bg-red-500 transition-colors">✕</span>
                    </button>
                </div>
            )}

            <div className="bg-white border-b border-slate-200 px-8 py-5 no-print sticky top-0 z-30">
                <div className="flex items-center justify-between gap-8">
                    <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl overflow-x-auto no-scrollbar">
                        {modules.map((m) => (
                            <button
                                key={m.id}
                                onClick={() => setActiveModule(m.id)}
                                className={`flex-shrink-0 flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 ${
                                    activeModule === m.id
                                        ? 'bg-slate-900 text-white shadow-xl scale-[1.03] translate-y-[-1px]'
                                        : 'text-slate-500 hover:bg-white hover:text-slate-900'
                                }`}
                            >
                                <span className="text-base">{m.icon}</span>
                                {m.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-10 bg-white/40 scrollbar-thin">
                <div className="max-w-[1700px] mx-auto space-y-12">
                    {activeModule === 'Dashboard' && <DashboardModule onSelect={handleSelectCRA} />}
                    {activeModule === 'Productivity' && <ProductivityManagementModule selectedId={selectedCRAId} onSelect={handleSelectCRA} />}
                    {activeModule === 'One-to-One' && <OneToOneModule selectedId={selectedCRAId} onSelect={handleSelectCRA} />}
                    
                    {!['Dashboard', 'Productivity', 'One-to-One'].includes(activeModule) && (
                        <div className="h-[60vh] flex flex-col items-center justify-center bg-white rounded-[40px] border border-slate-200 shadow-inner text-slate-400 animate-pulse">
                            <div className="text-6xl mb-6">🛠️</div>
                            <h3 className="text-xl font-black uppercase tracking-widest text-slate-300">Under Architectural Review</h3>
                            <p className="text-sm font-bold uppercase tracking-tighter mt-2 opacity-50">Module being upgraded to GxP Node v4.7</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const DashboardModule: React.FC<{ onSelect: (id: string, module: CRAModule) => void }> = ({ onSelect }) => {
    return (
        <div className="space-y-10 animate-in slide-in-from-bottom-6 duration-700">
            <div className="flex justify-between items-end gap-6">
                <div>
                    <h3 className="text-4xl font-black text-slate-900 tracking-tighter">Clinical Resource Registry</h3>
                    <p className="text-slate-500 font-bold text-sm mt-2 max-w-xl leading-relaxed uppercase tracking-tight">Access digital personnel folders for workforce management, quality metrics, and performance ingestion cycles.</p>
                </div>
                <div className="flex gap-10 bg-white p-6 rounded-[30px] shadow-sm border border-slate-100">
                    <div className="text-center">
                        <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Assets</div>
                        <div className="text-3xl font-black text-slate-900">{DIRECT_REPORTS.length}</div>
                    </div>
                    <div className="text-center border-l border-slate-100 pl-10">
                        <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Regional Nodes</div>
                        <div className="text-3xl font-black text-cyan-600">3</div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {DIRECT_REPORTS.map((cra) => (
                    <button
                        key={cra.id}
                        onClick={() => onSelect(cra.id, 'One-to-One')}
                        className="group bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm hover:shadow-2xl hover:border-cyan-500/50 hover:scale-[1.02] transition-all duration-500 text-left relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-full -mr-12 -mt-12 group-hover:bg-cyan-50 transition-colors"></div>
                        <div className="relative z-10 flex flex-col h-full justify-between">
                            <div className="flex justify-between items-start mb-8">
                                <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-2xl shadow-xl shadow-slate-200 group-hover:bg-cyan-600 transition-colors">
                                    <span className="text-white group-hover:scale-110 transition-transform">👤</span>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${cra.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                                    {cra.status}
                                </span>
                            </div>
                            <div>
                                <h4 className="text-xl font-black text-slate-900 tracking-tighter mb-1 group-hover:text-cyan-600 transition-colors">{cra.name}</h4>
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">{cra.role}</div>
                                <div className="space-y-2 pt-4 border-t border-slate-50">
                                    <div className="flex justify-between text-[10px] font-bold">
                                        <span className="text-slate-400">REGION</span>
                                        <span className="text-slate-700">{cra.region}</span>
                                    </div>
                                    <div className="flex justify-between text-[10px] font-bold">
                                        <span className="text-slate-400">LOCALE</span>
                                        <span className="text-slate-700">{cra.location}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

const ProductivityManagementModule: React.FC<{ selectedId: string | null, onSelect: (id: string) => void }> = ({ selectedId, onSelect }) => {
    const selectedCRA = DIRECT_REPORTS.find(r => r.id === selectedId);

    return (
        <div className="space-y-10 animate-in slide-in-from-bottom-6 duration-700">
            <div className="flex justify-between items-center">
                <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Productivity Surveillance</h3>
                <div className="text-xs font-black text-cyan-600 bg-cyan-50 px-4 py-2 rounded-xl uppercase tracking-widest border border-cyan-100">Live GCP Sync: Active</div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-3 space-y-4 no-print">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Registry Ingestion</h4>
                    <div className="space-y-2">
                        {DIRECT_REPORTS.map((report) => (
                            <button
                                key={report.id}
                                onClick={() => onSelect(report.id)}
                                className={`w-full text-left p-5 rounded-2xl border transition-all duration-300 ${
                                    selectedId === report.id
                                        ? 'bg-slate-900 text-white border-slate-900 shadow-2xl scale-[1.05]'
                                        : 'bg-white text-slate-700 border-slate-200 hover:border-cyan-500 shadow-sm'
                                }`}
                            >
                                <div className="text-sm font-black tracking-tight">{report.name}</div>
                                <div className={`text-[9px] font-bold uppercase tracking-widest ${selectedId === report.id ? 'text-cyan-400' : 'text-slate-400'}`}>
                                    {report.level}
                                </div >
                            </button>
                        ))}
                    </div>
                </div>

                <div className="lg:col-span-9 h-full">
                    {selectedCRA ? (
                        <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
                             <div className="bg-white p-12 rounded-[50px] border border-slate-200 shadow-2xl overflow-hidden relative">
                                 <div className="absolute top-0 left-0 w-2 h-full bg-cyan-500"></div>
                                 <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12 pb-8 border-b border-slate-100">
                                    <div>
                                        <h4 className="text-4xl font-black text-slate-900 tracking-tighter mb-2">{selectedCRA.name}</h4>
                                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Continuous Performance Verification Node</p>
                                    </div>
                                    <div className="flex items-end gap-10">
                                        <div className="text-center">
                                            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Composite Productivity</div>
                                            <div className="text-5xl font-black text-emerald-600">89<span className="text-lg text-emerald-400 ml-1">%</span></div>
                                        </div>
                                    </div>
                                 </div>

                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                     {GOAL_FRAMEWORK.map((cat) => (
                                         <div key={cat.id} className="p-8 bg-slate-50 rounded-[35px] border border-slate-100 group">
                                             <div className="flex justify-between items-center mb-6">
                                                 <h5 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">{cat.label}</h5>
                                                 <span className="text-[9px] font-black bg-white text-slate-500 px-3 py-1 rounded-full border border-slate-100">{cat.weight}</span>
                                             </div>
                                             <div className="space-y-6">
                                                 {cat.objectives.map((obj, i) => (
                                                     <div key={i} className="space-y-2">
                                                         <div className="flex justify-between items-end">
                                                            <div className="text-[10px] font-bold text-slate-600 uppercase tracking-tight">{obj.title}</div>
                                                         </div>
                                                         <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                                                            <div className="h-full bg-cyan-500 w-[75%] rounded-full group-hover:animate-pulse"></div>
                                                         </div>
                                                     </div>
                                                 ))}
                                             </div>
                                         </div>
                                     ))}
                                 </div>
                             </div>
                        </div>
                    ) : (
                        <div className="h-full min-h-[500px] flex items-center justify-center bg-white rounded-[50px] border-2 border-dashed border-slate-200 text-slate-400 p-20 text-center animate-in fade-in duration-500">
                             <div className="max-w-sm">
                                <div className="text-6xl mb-8 opacity-20">📂</div>
                                <h4 className="text-2xl font-black text-slate-300 uppercase tracking-tighter mb-2">Personnel Sync Standby</h4>
                                <p className="text-sm font-bold uppercase tracking-widest opacity-50 leading-relaxed">Select an associate from the left-hand ingestion registry.</p>
                             </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const OneToOneModule: React.FC<{ selectedId: string | null, onSelect: (id: string) => void }> = ({ selectedId, onSelect }) => {
    const selectedCRA = DIRECT_REPORTS.find(r => r.id === selectedId);
    
    const [discussionDate, setDiscussionDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [discussionTime, setDiscussionTime] = useState<string>(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
    const [discussionNotes, setDiscussionNotes] = useState<Record<string, string>>({});
    const [actionItems, setActionItems] = useState<string>('');
    const [isRecording, setIsRecording] = useState<string | null>(null);
    const [liveTranscript, setLiveTranscript] = useState<string>('');
    const [isSynthesizing, setIsSynthesizing] = useState<string | null>(null);
    const [isEvaluating, setIsEvaluating] = useState(false);
    const [aiEvaluation, setAiEvaluation] = useState<{ summary: string, yieldScore: number, gaps: string[], actions: string[] } | null>(null);
    const [currentLogId, setCurrentLogId] = useState<string>(`LOG-${Date.now()}`);
    
    const recognitionRef = useRef<any>(null);
    const accumulatedTranscriptRef = useRef<string>('');
    const emailInputRef = useRef<HTMLInputElement>(null);

    const handleNoteChange = (catId: string, value: string) => {
        setDiscussionNotes(prev => ({ ...prev, [catId]: value }));
    };

    useEffect(() => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.lang = 'en-US';

            recognitionRef.current.onresult = (event: any) => {
                let interimTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    const transcript = event.results[i][0].transcript;
                    if (event.results[i].isFinal) accumulatedTranscriptRef.current += ' ' + transcript;
                    else interimTranscript += transcript;
                }
                setLiveTranscript(accumulatedTranscriptRef.current + interimTranscript);
            };

            recognitionRef.current.onerror = (e: any) => setIsRecording(null);
            recognitionRef.current.onend = () => { if (isRecording) recognitionRef.current.start(); };
        }
    }, [isRecording]);

    const synthesizeSentences = async (catId: string, rawText: string) => {
        if (!rawText.trim()) return;
        setIsSynthesizing(catId);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `Synthesize formal GxP notes for "${catId}" from transcript: "${rawText}". Format as professional bullets. Target: ${selectedCRA?.name}.`;
            const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: prompt });
            const synthesizedText = response.text?.trim();
            if (synthesizedText) {
                if (catId === 'action_items') setActionItems(prev => (prev ? prev + '\n' : '') + synthesizedText);
                else setDiscussionNotes(prev => ({ ...prev, [catId]: (prev[catId] || '') + (prev[catId] ? '\n\n' : '') + synthesizedText }));
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsSynthesizing(null);
            setLiveTranscript('');
        }
    };

    const toggleRecording = (catId: string) => {
        if (isRecording === catId) {
            recognitionRef.current?.stop();
            const captured = accumulatedTranscriptRef.current;
            setIsRecording(null);
            synthesizeSentences(catId, captured);
        } else {
            if (isRecording) recognitionRef.current?.stop();
            accumulatedTranscriptRef.current = '';
            setIsRecording(catId);
            try { recognitionRef.current?.start(); } catch(e) {}
        }
    };

    const generateOutlookInvite = () => {
        const icsContent = `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nDTSTART:${discussionDate.replace(/-/g, '')}T100000Z\nSUMMARY:1:1 Discussion - ${selectedCRA?.name}\nDESCRIPTION:Performance notes: ${Object.values(discussionNotes).join('. ')}\nEND:VEVENT\nEND:VCALENDAR`;
        const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.setAttribute('download', `Followup_${selectedCRA?.name.replace(/\s/g,'_')}.ics`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const shareStatusViaEmail = () => {
        const body = encodeURIComponent(`Discussion with ${selectedCRA?.name} on ${discussionDate}.\n\nNotes:\n${Object.entries(discussionNotes).map(([k,v]) => `${k.toUpperCase()}: ${v}`).join('\n')}\n\nAction Items:\n${actionItems}`);
        window.location.href = `mailto:?subject=1:1 Summary - ${selectedCRA?.name}&body=${body}`;
    };

    const handleEvaluate = async () => {
        if (!selectedCRA) return;
        setIsEvaluating(true);
        setCurrentLogId(`LOG-${Date.now()}`);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `Evaluate CRA productivity from these notes: ${JSON.stringify(discussionNotes)}. JSON: { "summary": "...", "yieldScore": 92, "gaps": ["..."], "actions": ["..."] }`;
            const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: prompt, config: { responseMimeType: "application/json" } });
            setAiEvaluation(JSON.parse(response.text || '{}'));
        } catch (e) {
            alert("Analysis failed.");
        } finally {
            setIsEvaluating(false);
        }
    };

    return (
        <div className="space-y-12 animate-in slide-in-from-bottom-6 duration-700">
            <div className="flex justify-between items-center no-print">
                <div>
                    <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">1:1 Performance Ingestion Vault</h3>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-1">Neural Audio Ingestion Enabled</p>
                </div>
                <div className="flex gap-4">
                    <button onClick={shareStatusViaEmail} className="bg-white border border-slate-200 text-slate-600 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center gap-3 hover:bg-slate-50 transition-all">
                        <svg className="w-4 h-4 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                        Share Summary
                    </button>
                    <button onClick={() => window.print()} className="bg-slate-900 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-black transition-all">Export Protocol PDF</button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-3 space-y-6 no-print">
                    <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm space-y-8">
                        <div>
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-100 pb-2">Active Associates</h4>
                            <div className="space-y-2">
                                {DIRECT_REPORTS.map((report) => (
                                    <button
                                        key={report.id}
                                        onClick={() => onSelect(report.id)}
                                        className={`w-full text-left p-5 rounded-2xl border transition-all duration-300 ${
                                            selectedId === report.id
                                                ? 'bg-slate-900 text-white border-slate-900 shadow-2xl scale-[1.05]'
                                                : 'bg-slate-50 text-slate-700 border-slate-100 hover:border-cyan-500'
                                        }`}
                                    >
                                        <div className="text-sm font-black tracking-tight">{report.name}</div>
                                        <div className={`text-[9px] font-bold uppercase tracking-widest ${selectedId === report.id ? 'text-cyan-400' : 'text-slate-400'}`}>
                                            {report.level}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-5">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 border-b border-slate-100 pb-2">Session Parameters</h4>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Session Date</label>
                                    <input type="date" value={discussionDate} onChange={e => setDiscussionDate(e.target.value)} className="w-full bg-slate-100 border-none rounded-xl p-3 text-xs font-bold outline-none" />
                                </div>
                                <div>
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Session Time</label>
                                    <input type="time" value={discussionTime} onChange={e => setDiscussionTime(e.target.value)} className="w-full bg-slate-100 border-none rounded-xl p-3 text-xs font-bold outline-none" />
                                </div>
                                <button onClick={generateOutlookInvite} className="w-full py-3 bg-cyan-50 text-cyan-700 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-cyan-100 transition-colors flex items-center justify-center gap-2">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V8l8 5 8-5v10zm-8-7L4 6h16l-8 5z"/></svg>
                                    Outlook Invite
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-9 h-full">
                    {selectedCRA ? (
                        <div className="space-y-12 animate-in fade-in duration-500 pb-20">
                            <div className="bg-white p-10 rounded-[50px] border border-slate-200 shadow-2xl flex flex-col md:flex-row justify-between items-center gap-10 relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-2 h-full bg-cyan-500"></div>
                                <div className="flex items-center gap-8">
                                    <div className="w-24 h-24 bg-slate-900 rounded-[35px] flex items-center justify-center text-5xl text-white shadow-2xl">👤</div>
                                    <div>
                                        <h4 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">{selectedCRA.name}</h4>
                                        <div className="flex items-center gap-3 mt-2">
                                            <span className="text-[10px] font-black bg-cyan-500 text-slate-900 px-4 py-1 rounded-full uppercase tracking-widest">Q1 Performance cycle</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Status Yield</div>
                                    <div className={`text-4xl font-black ${aiEvaluation ? 'text-emerald-600' : 'text-slate-200'}`}>
                                        {aiEvaluation ? `${aiEvaluation.yieldScore}%` : '--%'}
                                    </div>
                                </div>
                            </div>

                            {isRecording && (
                                <div className="bg-slate-900 rounded-[35px] p-8 flex flex-col items-center gap-6 shadow-2xl">
                                    <div className="flex items-end justify-center gap-1.5 h-12 w-full max-w-xl">
                                        {Array.from({length: 32}).map((_, i) => (
                                            <div key={i} className="flex-1 bg-cyan-400 rounded-full animate-wave" style={{ animationDelay: `${i * 0.05}s`, height: `${Math.random() * 100}%` }}></div>
                                        ))}
                                    </div>
                                    <p className="text-[10px] text-cyan-300/60 font-mono tracking-widest italic truncate max-w-2xl">"{liveTranscript || 'Listening...'}"</p>
                                </div>
                            )}

                            <div className="grid grid-cols-1 gap-10">
                                {GOAL_FRAMEWORK.map((goal) => (
                                    <div key={goal.id} className="space-y-6">
                                        <div className="flex items-center gap-4 px-4">
                                            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">{goal.label}</h3>
                                            <div className="flex-1 h-px bg-slate-200"></div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-4">
                                                {goal.objectives.map((obj, i) => (
                                                    <div key={i} className="bg-white p-6 rounded-[30px] border border-slate-100 shadow-sm space-y-2">
                                                        <h5 className="text-[11px] font-black text-cyan-700 uppercase">{obj.title}</h5>
                                                        <p className="text-[11px] text-slate-500 italic leading-relaxed">"{obj.description}"</p>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="flex flex-col relative no-print">
                                                <button onClick={() => toggleRecording(goal.id)} className={`mb-3 self-end flex items-center gap-2 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl transition-all ${isRecording === goal.id ? 'bg-red-500 text-white animate-pulse' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>
                                                    {isRecording === goal.id ? 'Stop Ingestion' : 'Voice-to-Text'}
                                                    <span className={`w-2 h-2 rounded-full ${isRecording === goal.id ? 'bg-white' : 'bg-cyan-500'}`}></span>
                                                </button>
                                                <textarea
                                                    value={discussionNotes[goal.id] || ''}
                                                    onChange={(e) => handleNoteChange(goal.id, e.target.value)}
                                                    placeholder={isSynthesizing === goal.id ? "Synthesizing formal GxP bullets..." : `Discussion nodes for ${goal.label}...`}
                                                    className={`flex-1 min-h-[180px] bg-white border border-slate-200 rounded-[35px] p-8 text-sm outline-none focus:ring-8 focus:ring-cyan-500/5 transition-all shadow-inner font-medium italic ${isSynthesizing === goal.id ? 'opacity-30' : ''}`}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                <div className="space-y-6 pt-10">
                                    <div className="flex items-center gap-4 px-4">
                                        <h3 className="text-xl font-black text-red-600 uppercase tracking-tighter">Follow-up Action Items</h3>
                                        <div className="flex-1 h-px bg-red-100"></div>
                                    </div>
                                    <div className="bg-red-50/30 rounded-[40px] border border-red-100 p-10 relative">
                                        <button onClick={() => toggleRecording('action_items')} className={`absolute top-8 right-8 flex items-center gap-2 px-5 py-2 rounded-full text-[10px] font-black uppercase shadow-xl transition-all ${isRecording === 'action_items' ? 'bg-red-600 text-white animate-pulse' : 'bg-white text-red-600 border border-red-200 hover:bg-white'}`}>
                                            {isRecording === 'action_items' ? 'Stop' : 'Voice Actions'}
                                        </button>
                                        <textarea
                                            value={actionItems}
                                            onChange={(e) => setActionItems(e.target.value)}
                                            placeholder="Log specific retraining, site tasks, or remedial steps required..."
                                            className="w-full min-h-[150px] bg-white border border-red-100 rounded-[35px] p-8 text-sm outline-none focus:ring-8 focus:ring-red-500/5 font-bold shadow-sm"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-center pt-10 no-print">
                                <button onClick={handleEvaluate} disabled={isEvaluating} className="bg-cyan-600 text-white px-20 py-6 rounded-[30px] font-black text-sm uppercase tracking-[0.2em] hover:bg-cyan-700 shadow-2xl transition-all flex items-center gap-4">
                                    {isEvaluating ? <div className="w-5 h-5 border-3 border-white/20 border-t-white rounded-full animate-spin"></div> : '⚡ Process Intelligence Yield'}
                                </button>
                            </div>

                            {aiEvaluation && (
                                <div className="mt-16 p-12 bg-slate-950 text-white rounded-[60px] shadow-3xl relative overflow-hidden animate-in zoom-in-95">
                                    <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-cyan-500/5 blur-[120px] rounded-full -mr-300 -mt-300"></div>
                                    <div className="relative z-10 space-y-10">
                                        <div className="flex items-center justify-between border-b border-white/10 pb-10">
                                            <div className="flex items-center gap-6">
                                                <div className="w-16 h-16 bg-cyan-500 rounded-3xl flex items-center justify-center text-slate-950 shadow-[0_0_30px_rgba(6,182,212,0.4)]">
                                                    <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                                                </div>
                                                <div>
                                                    <h5 className="text-2xl font-black uppercase tracking-[0.2em] text-cyan-400">Neural Performance Verdict</h5>
                                                    <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest mt-1">Ingestion Cycle: {currentLogId}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-16">
                                            <div className="space-y-6">
                                                <h6 className="text-[11px] font-black text-cyan-400 uppercase tracking-[0.2em]">Summary</h6>
                                                <p className="text-lg leading-[1.8] font-medium text-slate-200 italic">"{aiEvaluation.summary}"</p>
                                            </div>
                                            <div className="bg-black/40 p-10 rounded-[50px] border border-white/5 flex flex-col items-center">
                                                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Productivity Yield</div>
                                                <div className="flex items-end gap-3">
                                                    <span className="text-7xl font-black text-white tracking-tighter">{aiEvaluation.yieldScore}</span>
                                                    <span className="text-3xl font-black text-cyan-500 mb-2">%</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center bg-white rounded-[50px] border-2 border-dashed border-slate-200 text-slate-400 p-20 animate-pulse">
                            <h4 className="text-3xl font-black text-slate-300 uppercase tracking-tighter">Vault Encryption Standby</h4>
                            <p className="text-sm uppercase font-black tracking-widest mt-2 opacity-50">Select an asset from the registry list to initialize session.</p>
                        </div>
                    )}
                </div>
            </div>
            <style>{`
                @keyframes wave { 0%, 100% { height: 20%; } 50% { height: 100%; } }
                .animate-wave { animation: wave 0.8s ease-in-out infinite; }
                .shadow-3xl { box-shadow: 0 35px 60px -15px rgba(0, 0, 0, 0.6); }
            `}</style>
        </div>
    );
};

export default CRAManagementPortal;

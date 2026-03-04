
import React, { useState, useEffect, useMemo } from 'react';
import { BidHeader, BidCountryPlan, CostLineItem, FTEAllocation, SUAItem, AlliancePartnerItem, LaborRateEntry, Invoice } from '../types';
import { ALL_COUNTRIES } from '../constants';

const DRIVERS = [
    "Per Site", "Per Total Site", "Per Study", "Per Submission", "Per Label", "Per site per ICF Template",
    "Per Internal TCs Per CTA (Close-out)", "Per Language", "Per Study Per CRA", "Per Site ID", "Per KO Meeting",
    "Per KO Meeting Per CRA", "Per QV", "Per Study Per uCRA", "Per KO Meeting Per uCRA", "Per IM", "Per IM Per CRA",
    "Per IMV", "Per Remote IMV", "Per UMV", "Per Query", "Per Vendor (Study Drug)", "Per Vendor (Study Drug) Per Month",
    "Per Vendor (Lab)", "Per Vendor (Lab) Per Month", "Per Vendor (Other)", "Per Vendor (Other) Per Month", "Per SAE",
    "Per SUSAR", "Per Year", "Per Month", "Per Total Sites Per Month", "Per Unique Page", "Per Spec", "Per SDTM Domain",
    "Per ADAM Analysis Datasets", "Per Patient", "Per Coding", "Per Export (S)", "Per Export (C)", "Per Vendor (DM)",
    "Per Transfer", "Per Analysis", "Per Month (Ex Startup & Closeout)", "Per SF Update", "Per Dataset", "Per Final Unique Table",
    "Per Final Repeat Table", "Per Final Unique Listing", "Per Final Repeat Listing", "Per Final Unique Figure",
    "Per Final Repeat Figure", "Per Month (Close-out)", "Per Report", "Per Site Audit", "Per Vendor Audit", "Per TMF Audit",
    "Per Over Retainer", "Per Month (Ex. Start-Up)", "Per PK Report", "Per Cohort", "Per Analytes & Metabolites", "Per Set Up",
    "Per SAE -Safety Monitoring (Follow-Up)", "Per Query (DM)", "Per Study Per Renewal", "Per Documents", "Per IM Per uCRA",
    "Per IB", "Per IB Review", "Per Call (IB)", "Per Call (Protocol)", "Per Half Year", "Per Questionnaire", "Per Local Lab",
    "Per DSMB Meeting", "Per DSMB Review", "Per DSMB Table", "Per DSMB Listing", "Per Amendment", "Per Plan", "Per Envelope",
    "Per Final TFLs", "Per Interim Unique Table", "Per Interim Repeat Table", "Per Interim Unique Listings",
    "Per Interim Repeat Listings", "Per Interim Unique Figures", "Per Interim Repeat Figures", "Per Interim TFLs",
    "Per DSMB Figure", "Per SRC Listings", "Per SRC Tables", "Per SRC Figures", "Per Call (Protocol Synopsis)", "Per Interim CSR",
    "Per Teleconferences (GMO)", "Per Protocol", "Per Calculation", "Per Table (DSUR)", "Per Listing (DSUR)", "Per Month (Recruitment)",
    "Per Month (Follow-Up)", "Per Month (Treatment)", "Per SAE -Safety Monitoring (Initial)", "Per Final Unique TFLs", "Per Country",
    "Per Site Per Amendment", "Per Site Per Renewal", "Per Call (Final CSR)", "Per Call (Interim CSR)", "Per Study Per MM",
    "Per KO Meeting Per MM", "Per IM Per MM", "Per Import & Export Application", "Per Export Application", "Per Transition Meeting",
    "Per SAE and SUSAR Report", "Per Final Validation Units", "Per Interim Validation Units", "Per Study Per CL",
    "Per KO Meeting Per CL", "Per IM Per CL", "Per Minor Amendment", "Per Major Amendment", "Per Site Per SUSAR", "Per Leading Site",
    "Per Site Per SAE", "Per Quarter (Ex. Start-Up)", "Per Internal TCs (Start-Up)", "Per Internal TCs (Recruitment & Treatment)",
    "Per Internal TCs (Follow-Up)", "Per Internal TCs (Close-Out)", "Per TC (Start-Up)", "Per Meeting", "Per Application And Submission",
    "Per Internal TCs Per CRA (Start-Up)", "Per Internal TCs Per CRA (Ex Startup & FU)", "Per Internal TCs Per CRA (Follow-Up)",
    "Per Internal TCs Per CRA (Recruitment & Treatment)", "Per Internal TCs Per CRA (Close-Out)", "Per Internal TCs Per CTA (Start-Up)",
    "Per Internal TCs Per CTA (Ex Startup & FU)", "Per Internal TCs Per CTA (Follow-Up)", "Per Internal TCs Per CTA (Recruitment & Treatment)",
    "Per Internal TCs Per CL (Start-Up)", "Per Internal TCs Per CL (Recruitment & Treatment)", "Per Internal TCs Per CL (Follow-Up)",
    "Per Internal TCs Per CL (Close-Out)", "Per Internal TCs Per uCRA (Start-Up)", "Per Internal TCs Per uCRA (Ex Startup & FU)",
    "Per Internal TCs Per uCRA (Follow-Up)", "Per Internal TCs Per uCRA (Recruitment & Treatment)", "Per Internal TCs Per uCRA (Close-Out)",
    "Per Internal TCs Per uCL (Start-Up)", "Per Internal TCs Per uCL (Recruitment & Treatment)", "Per Internal TCs Per uCL (Follow-Up)",
    "Per Internal TCs Per uCL (Close-Out)", "Per Internal TCs Per RSM (Ex Startup & FU)", "Per Internal TCs Per RSM (Follow-Up)",
    "Per Client TCs (Recruitment & Treatment)", "Per Client TCs (Follow-Up)", "Per Client TCs (Close-Out)", "Per TC Per CL (Start-Up)",
    "Per Client TCs Per CL (Recruitment & Treatment)", "Per Client TCs Per CL (Follow-Up)", "Per Client TCs Per CL (Close-Out)",
    "Per F-F Meeting (Recruitment & Treatment)", "Per Client TCs Per RSM (Ex Startup & FU)", "Per Client TCs Per RSM (Follow-Up)",
    "Per SUSARs - Initial", "Per SUSARs - Follow-up", "Per Month (Recruitment & Treatment)", "Per ICF Template", "Per Submission (DDC)",
    "Per Site Per Month (Ex Startup)-Escalation", "Per Site Per Month (Ex Startup)-Expansion", "Per Site Per Month (Ex Startup & FU)-Escalation",
    "Per Site Per Month (Ex Startup & FU)-Expansion", "Per Site Per Month (Recruitment)-Escalation", "Per Site Per Month (Recruitment)-Expansion",
    "Per Site Per Quarter (Ex Startup)-Escalation", "Per Site Per Quarter (Ex Startup)-Expansion", "Per Site Per Quarter (Recruitment & Treatment)-Escalation",
    "Per Site Per Quarter (Recruitment & Treatment)-Expansion", "Per Site Per Month (Startup)-Escalation", "Per Site Per Month (Startup)-Expansion",
    "Per Month (Recruitment)-Escalation", "Per Month (Recruitment)-Expansion", "Per Month (Ex Startup)-Escalation", "Per Month (Ex Startup)-Expansion",
    "Per Renewal", "Per Site Per Year", "Per Phone QV", "Per Month (Start-Up)", "Per SIV", "Per Additional 1 Day MV", "Per COV", "Per Export",
    "Per Final Analysis", "Per Month (Recruitment, Treatment, Follow-Up)", "Per SRC Meeting", "Per SAE Report (Initial)", "Per SAE Report (Follow-Up)",
    "Per SAE Report", "Per SUSAR Report", "Per CSR", "Per Set-Up Stage", "Per Protocol Synopsis", "Per Month (Pre-Start-Up)", "Per Rescue Site",
    "Per Start-Up Per Site Contracts Visit", "Per Country Per Month (Ex. Start-Up & Close-Out)", "Per Interim Analysis", "Per Vendor",
    "Per Compound", "Per Compound Per Year", "Per Permit", "Per Attendee", "Per Screen Fail Patient", "Per Consent", "Per Amendment Per Site",
    "Per First Site", "Per Additional Site", "Per Visit", "Per Month (EDC)", "Per HA Submission", "Per Site HA Submission", "T&M", "Per IND",
    "Per Site Per Month (Ex. Start-Up & Ex. Follow-up)", "Per Site Per Month (Follow-Up)", "Per Site Per Month (Start Up)", "Per Site Per Quarter (Recruitment & Treatment)",
    "Per Site Per Quarter (Follow-Up)", "Per Site Per Quarter (Close Out)", "Per Site Per Quarter (Ex Startup)", "Per Site Per Month",
    "Per Site Per Month (Ex Startup)", "Per Site Per Month (Recruitment)", "Per Site Per Month (Treatment)", "Per Site Per Month (Close-Out)",
    "Per Site Per Month (Recruitment & Treatment)", "Per Registration Per Year", "Per Month (Ex Startup)", "Per IMV (Rec-Treat)", "Per IMV (Follow-up)",
    "Per Central monitoring (KRIs)", "Per Central Monitoring (Stats)", "Per Central Monitoring (QTL)", "Per IRRMM Meeting", "Per Additional KRI Analysis",
    "Per Site Per Month (Recruitment) - SM", "Per Site Per Month (Follow-up) - SM", "Per Site Per Month (Treatment) - SM", "Per Site Per Month (Recruitment & Treatment) - SM",
    "Per Shipment", "Per Participant", "Per Global Site Per Month (Start-up)", "Per Global Site Per Month (Recruitment & Treatment)",
    "Per Global Site Per Month (Follow-up)", "Per Global Site Per Month (Close-Out)", "Per country (Reg Submission)", "Per internal TCs (start up) - RSM",
    "Per Client TCs (start up) - RSM", "Per Site Per Month (Start-up) - EU", "Per Site Per Month (Start-up) - Non-EU", "Per Country Per Quarter",
    "Per Site Per Month (Treatment) - EU", "Per Site Per Month (Treatment) - Non-EU", "Per Site Per Month (Follow-up) - EU", "Per Site Per Month (Follow-up) - Non-EU",
    "Per Site Per Month (Close-Out) - EU", "Per Site Per Month (Close-Out) - Non-EU", "Per Site Per Month (Recruitment) - SM - EU",
    "Per Site Per Month (Recruitment) - SM - Non-EU", "Per Site Per Month (Recruitment)-Escalation - EU", "Per Site Per Month (Recruitment)-Escalation - Non-EU",
    "Per Site Per Month (Recruitment)-Expansion - EU", "Per Site Per Month (Recruitment)-Expansion - Non-EU", "Per Primary Analytes", "Per ICF Amendment",
    "Per Study (Lab)", "Per Case", "Per XML", "Per Site (CN)", "Per Start Up Months (Regulatory)", "Per Start Up Months (Regulatory) - Expansion",
    "Per Site (Local Submission)", "Per Site (Initial Submission)", "Per Publication", "Per Call (Publication)", "Per Month (Manuscript)", "Per On-site QV"
];

const INITIAL_LABOR_RATES: LaborRateEntry[] = [
    { role: 'PM_01', country: 'Australia', baseRate: 155, inflationPercent: 4.5, standardRate: 161.98, discountPercent: 5, netRate: 153.88 },
    { role: 'CRA_02', country: 'Australia', baseRate: 125, inflationPercent: 4.5, standardRate: 130.63, discountPercent: 5, netRate: 124.10 },
    { role: 'PM_01', country: 'United States', baseRate: 195, inflationPercent: 3.5, standardRate: 201.83, discountPercent: 10, netRate: 181.65 },
    { role: 'DM_01', country: 'Singapore', baseRate: 110, inflationPercent: 3, standardRate: 113.30, discountPercent: 0, netRate: 113.30 }
];

const PricingTool: React.FC = () => {
    const [view, setView] = useState<'dashboard' | 'bid-editor' | 'reference-data'>('dashboard');
    const [editorTab, setEditorTab] = useState<'rfp-info' | 'study-config' | 'central-services' | 'fte-management' | 'forecasting' | 'pass-through-details' | 'sua-alliance' | 'invoices' | 'consolidated-summary'>('rfp-info');
    const [csSubTab, setCsSubTab] = useState<'dm' | 'bios' | 'mw' | 'mm' | 'pv-qa-vm' | 'ddc'>('dm');
    const [bids, setBids] = useState<BidHeader[]>([]);
    const [selectedBid, setSelectedBid] = useState<BidHeader | null>(null);
    const [laborRates, setLaborRates] = useState<LaborRateEntry[]>(INITIAL_LABOR_RATES);

    useEffect(() => {
        const stored = localStorage.getItem('aide_pricing_bids');
        if (stored) setBids(JSON.parse(stored));
        else {
            const initialBids: BidHeader[] = [{
                bidId: 'BID-2025-001',
                bidGridVersion: 'v4.5',
                paCo: 'APC',
                customerName: 'AdvancedBio',
                phase: 'II',
                currency: 'USD',
                ratesType: 'Standard Rates',
                sponsorRegion: 'NAM',
                studyDesign: 'Adaptive',
                ipImportRequired: true,
                oncologyFlag: true,
                lowComplexityFlag: false,
                doseExpansionFlag: false,
                discountFlag: false,
                edcSystem: 'Veeva CDMS',
                rtsmSystem: 'Suvoda',
                isTmStudy: false,
                inflationRateOverall: 3.5,
                totalDurationMths: 36,
                createdAt: Date.now(),
                updatedAt: Date.now(),
                status: 'Draft',
                feeMwStartup: 12000,
                mwProtocolSynopsisFee: 8500,
                mwProtocolWritingFee: 18000,
                overheadRate: 18.5,
                targetMargin: 17,
                fteAllocations: [{ country: 'Australia', role: 'CRA', allocation: 0.5, monthlyHours: 160, totalHours: 80 }],
                invoices: [{ id: 'INV-001', milestone: 'Contract Execution', amount: 25000, status: 'Sent', dueDate: '2025-06-01', type: 'Milestone' }],
                costLineItems: [],
                passThroughLineItems: [{ id: 'PT-1', category: 'Travel', description: 'Monitor Travel', driver: 'Per IMV', units: 10, unitCost: 1200, totalCost: 12000 }],
                suaDetails: [],
                alliancePartners: [],
                rbqmComplexity: 'Standard',
                crfPagesPerSubject: 120,
                totalSubjects: 100,
                novotechSubjects: 80,
                crfPagesSdvdPerVisit: 15,
                sdvMinuteConsidered: 10,
                crfPagesCriticalPercent: 25,
                sdvRateCriticalData: 100,
                sdvRateNonCriticalData: 20,
                overallSdvRate: 40
            }];
            setBids(initialBids);
        }
    }, []);

    const handleUpdateBid = (updates: Partial<BidHeader>) => {
        if (!selectedBid) return;
        const newBid = { ...selectedBid, ...updates, updatedAt: Date.now() };
        setSelectedBid(newBid);
        setBids(prev => prev.map(b => b.bidId === newBid.bidId ? newBid : b));
        localStorage.setItem('aide_pricing_bids', JSON.stringify(bids.map(b => b.bidId === newBid.bidId ? newBid : b)));
    };

    const financials = useMemo(() => {
        if (!selectedBid) return null;
        const laborFees = (selectedBid.feeMwStartup || 0) + 
                          (selectedBid.feeDdc || 0) + 
                          (selectedBid.feeRegEthics || 0) + 
                          (selectedBid.feeStudyMgmt || 0) +
                          (selectedBid.mwProtocolSynopsisFee || 0) +
                          (selectedBid.mwProtocolWritingFee || 0);
                          
        const totalNetProfFees = laborFees * (1 - (selectedBid.discountPercent || 0) / 100);
        const passThroughs = (selectedBid.ptInvestigatorFees || 0) + (selectedBid.passThroughLineItems?.reduce((s, i) => s + i.totalCost, 0) || 0);
        const overhead = laborFees * ((selectedBid.overheadRate || 0) / 100);
        const profit = laborFees - overhead;
        const margin = laborFees > 0 ? (profit / laborFees) * 100 : 0;
        const grandTotal = totalNetProfFees + passThroughs + (selectedBid.alliancePartners?.reduce((s, p) => s + p.budget, 0) || 0);
        
        return { laborFees, totalNetProfFees, passThroughs, overhead, profit, margin, grandTotal };
    }, [selectedBid]);

    const formatCurrency = (val: number | undefined) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: selectedBid?.currency || 'USD' }).format(val || 0);
    };

    return (
        <div className="flex flex-col h-full gap-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex justify-between items-center no-print">
                <div>
                    <h2 className="text-xl font-black text-slate-800 tracking-tight uppercase">Intelligent Pricing Ecosystem</h2>
                    <p className="text-xs text-slate-500 font-medium mt-1">Multi-region bidding node with RBQM monitoring logic and per-country rate adjustors.</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => setView('reference-data')} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-200 hover:bg-slate-200 transition-all">Reference Library</button>
                    <button onClick={() => { setSelectedBid({ ...bids[0], bidId: `BID-${Date.now()}` }); setView('bid-editor'); }} className="px-6 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black shadow-lg transition-all border-b-2 border-cyan-600">New Bid</button>
                </div>
            </div>

            {view === 'dashboard' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1 min-h-0">
                    <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
                        <div className="p-5 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Bids</span>
                        </div>
                        <div className="flex-1 overflow-y-auto scrollbar-thin">
                            <table className="w-full text-left">
                                <thead className="bg-white border-b border-slate-100 text-[9px] font-black text-slate-400 uppercase tracking-widest sticky top-0">
                                    <tr><th className="px-8 py-5">Bid ID</th><th className="px-8 py-5">Client</th><th className="px-8 py-5 text-right">Actions</th></tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {bids.map(bid => (
                                        <tr key={bid.bidId} className="hover:bg-slate-50 transition-all group">
                                            <td className="px-8 py-6 font-black text-slate-900">{bid.bidId}</td>
                                            <td className="px-8 py-6 font-bold text-slate-600">{bid.customerName}</td>
                                            <td className="px-8 py-6 text-right">
                                                <button onClick={() => { setSelectedBid(bid); setView('bid-editor'); }} className="px-4 py-2 bg-slate-900 text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-black">Open</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div className="space-y-6">
                        <div className="bg-slate-900 p-8 rounded-[40px] text-white shadow-2xl relative overflow-hidden h-fit">
                            <h3 className="text-lg font-black tracking-tight uppercase mb-6 flex items-center gap-3">Financial Performance</h3>
                            <div className="space-y-6">
                                <div className="flex justify-between items-end border-b border-white/5 pb-4">
                                    <div><div className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Avg. Regional Inflation</div><div className="text-3xl font-black">4.2<span className="text-lg text-cyan-400 ml-1">%</span></div></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {view === 'bid-editor' && selectedBid && (
                <div className="flex-1 bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-6 duration-500 min-h-0">
                    <div className="p-6 bg-slate-900 text-white flex justify-between items-center z-10 no-print flex-shrink-0">
                        <div className="flex items-center gap-4">
                            <button onClick={() => setView('dashboard')} className="text-slate-400 hover:text-white transition-colors"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeWidth="2.5"/></svg></button>
                            <h3 className="text-lg font-black tracking-tight uppercase">Bid Configuration: {selectedBid.bidId}</h3>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setView('dashboard')} className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/10 transition-all">Save Draft</button>
                        </div>
                    </div>

                    <div className="flex border-b border-slate-100 bg-slate-50 px-6 no-print overflow-x-auto no-scrollbar flex-shrink-0">
                        {[
                            { id: 'rfp-info', label: 'RFP Info' },
                            { id: 'study-config', label: 'Study Config' },
                            { id: 'fte-management', label: 'FTE Plan' },
                            { id: 'pass-through-details', label: 'Pass-Throughs' },
                            { id: 'forecasting', label: 'Margin Analytics' },
                            { id: 'invoices', label: 'Invoice Hub' },
                            { id: 'consolidated-summary', label: 'Financial Summary' }
                        ].map(t => (
                            <button key={t.id} onClick={() => setEditorTab(t.id as any)} className={`whitespace-nowrap px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all border-b-4 ${editorTab === t.id ? 'border-cyan-500 text-cyan-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
                                {t.label}
                            </button>
                        ))}
                    </div>

                    <div className="flex-1 overflow-y-auto p-10 bg-slate-50/30 scrollbar-thin">
                        <div className="max-w-[1400px] mx-auto space-y-12 pb-20">
                            
                            {editorTab === 'rfp-info' && (
                                <section className="bg-white p-10 rounded-[40px] shadow-sm border border-slate-100 animate-in fade-in">
                                    <div className="flex items-center gap-3 mb-8 border-b border-slate-50 pb-4">
                                        <div className="w-2 h-8 bg-cyan-500 rounded-full"></div>
                                        <h4 className="text-xl font-black text-slate-800 tracking-tighter uppercase">RFP Strategic Controls</h4>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-6">
                                            <div className="flex items-center justify-between">
                                                <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Time & Materials Study (T&M)</label>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input type="checkbox" className="sr-only peer" checked={selectedBid.isTmStudy} onChange={e => handleUpdateBid({ isTmStudy: e.target.checked })} />
                                                    <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
                                                </label>
                                            </div>
                                        </div>
                                        <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-4">
                                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest block">Project Specific Inflation (%)</label>
                                            <input type="number" step="0.1" className="w-full bg-white border border-slate-200 rounded-xl p-3 font-black text-xs outline-none" value={selectedBid.inflationRateOverall} onChange={e => handleUpdateBid({ inflationRateOverall: parseFloat(e.target.value) })} />
                                        </div>
                                    </div>
                                </section>
                            )}

                            {editorTab === 'study-config' && (
                                <section className="bg-white p-10 rounded-[40px] shadow-sm border border-slate-100">
                                    <div className="flex items-center gap-3 mb-8 border-b border-slate-50 pb-4">
                                        <div className="w-2 h-8 bg-cyan-500 rounded-full"></div>
                                        <h4 className="text-xl font-black text-slate-800 tracking-tighter uppercase">RBQM Monitoring Efficiency Matrix</h4>
                                    </div>

                                    <div className="mb-10">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4">Complexity Tier Selection</label>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            {['Phase I HV', 'Standard', 'Onc/ High Complexity', 'Vaccine'].map((type) => (
                                                <button key={type} onClick={() => handleUpdateBid({ rbqmComplexity: type as any })} className={`py-4 rounded-2xl text-[11px] font-black uppercase transition-all border-2 ${selectedBid.rbqmComplexity === type ? 'bg-slate-900 text-white border-slate-900 shadow-xl' : 'bg-white text-slate-500 border-slate-100 hover:border-cyan-200'}`}>{type}</button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                        <div className="space-y-4">
                                            <h5 className="text-[10px] font-black text-cyan-600 uppercase tracking-widest mb-2 border-b border-slate-50 pb-1">Core Metrics</h5>
                                            {[
                                                { label: '#CRF pages/subject', key: 'crfPagesPerSubject' },
                                                { label: '#Total Subjects', key: 'totalSubjects' },
                                                { label: '#Novotech Subjects', key: 'novotechSubjects' },
                                                { label: '#CRF pages SDV\'d per 1 visit', key: 'crfPagesSdvdPerVisit' },
                                            ].map(f => (
                                                <div key={f.key} className="flex items-center justify-between py-2.5 border-b border-slate-50">
                                                    <label className="text-[11px] font-bold text-slate-500 uppercase">{f.label}</label>
                                                    <input type="number" className="w-28 bg-white border border-slate-200 rounded-xl p-2 font-black text-center text-xs outline-none" value={(selectedBid as any)[f.key]} onChange={e => handleUpdateBid({ [f.key]: parseFloat(e.target.value) || 0 })} />
                                                </div>
                                            ))}
                                        </div>
                                        <div className="space-y-4">
                                            <h5 className="text-[10px] font-black text-purple-600 uppercase tracking-widest mb-2 border-b border-slate-50 pb-1">SDV Strategy Control</h5>
                                            {[
                                                { label: 'SDV Minute Considered', key: 'sdvMinuteConsidered' },
                                                { label: 'CRF pages (%) of Critical Data', key: 'crfPagesCriticalPercent' },
                                                { label: 'SDV rate for Critical Data (%)', key: 'sdvRateCriticalData' },
                                                { label: 'Overall SDV rate (%)', key: 'overallSdvRate' },
                                            ].map(f => (
                                                <div key={f.key} className="flex items-center justify-between py-2.5 border-b border-slate-50">
                                                    <label className="text-[11px] font-bold text-slate-500 uppercase">{f.label}</label>
                                                    <input type="number" className="w-28 bg-white border border-slate-200 rounded-xl p-2 font-black text-center text-xs outline-none" value={(selectedBid as any)[f.key]} onChange={e => handleUpdateBid({ [f.key]: parseFloat(e.target.value) || 0 })} />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </section>
                            )}

                            {editorTab === 'fte-management' && (
                                <section className="bg-white p-10 rounded-[40px] shadow-sm border border-slate-100 animate-in slide-in-from-right-4">
                                    <div className="flex justify-between items-center mb-8 border-b border-slate-50 pb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-8 bg-blue-500 rounded-full"></div>
                                            <h4 className="text-xl font-black text-slate-800 tracking-tighter uppercase">Resource FTE Allocation</h4>
                                        </div>
                                        <button onClick={() => handleUpdateBid({ fteAllocations: [...(selectedBid.fteAllocations || []), { country: 'Global', role: 'Project Manager', allocation: 0.1, monthlyHours: 160, totalHours: 16 }] })} className="bg-slate-900 text-white px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all">+ Add FTE Line</button>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead className="bg-slate-50 border-b border-slate-100 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                                <tr><th className="px-6 py-4">Country</th><th className="px-6 py-4">Role</th><th className="px-6 py-4 text-center">FTE</th><th className="px-6 py-4 text-center">Calc Hrs/Mth</th><th className="px-6 py-4"></th></tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-50">
                                                {selectedBid.fteAllocations?.map((fte, idx) => (
                                                    <tr key={idx} className="hover:bg-slate-50">
                                                        <td className="px-6 py-4"><input className="bg-transparent border-0 font-bold text-xs" value={fte.country} onChange={e => handleUpdateBid({ fteAllocations: selectedBid.fteAllocations?.map((f, i) => i === idx ? { ...f, country: e.target.value } : f) })} /></td>
                                                        <td className="px-6 py-4"><input className="bg-transparent border-0 font-bold text-xs" value={fte.role} onChange={e => handleUpdateBid({ fteAllocations: selectedBid.fteAllocations?.map((f, i) => i === idx ? { ...f, role: e.target.value } : f) })} /></td>
                                                        <td className="px-6 py-4 text-center"><input type="number" step="0.01" className="w-16 bg-white border border-slate-200 rounded p-1 text-center font-black text-xs" value={fte.allocation} onChange={e => handleUpdateBid({ fteAllocations: selectedBid.fteAllocations?.map((f, i) => i === idx ? { ...f, allocation: parseFloat(e.target.value) } : f) })} /></td>
                                                        <td className="px-6 py-4 text-center font-bold text-slate-500">{(fte.allocation * 160).toFixed(1)}</td>
                                                        <td className="px-6 py-4 text-right"><button onClick={() => handleUpdateBid({ fteAllocations: selectedBid.fteAllocations?.filter((_, i) => i !== idx) })} className="text-red-400">✕</button></td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </section>
                            )}

                            {editorTab === 'pass-through-details' && (
                                <section className="bg-white p-10 rounded-[40px] shadow-sm border border-slate-100">
                                    <div className="flex justify-between items-center mb-8 border-b border-slate-50 pb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-8 bg-amber-500 rounded-full"></div>
                                            <h4 className="text-xl font-black text-slate-800 tracking-tighter uppercase">Pass-Through Matrix</h4>
                                        </div>
                                        <button onClick={() => handleUpdateBid({ passThroughLineItems: [...(selectedBid.passThroughLineItems || []), { id: `${Date.now()}`, category: 'Travel', description: 'Monitoring Travel', driver: 'Per IMV', units: 1, unitCost: 1000, totalCost: 1000 }] })} className="bg-slate-900 text-white px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">+ Add Line</button>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead className="bg-slate-50 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                                <tr><th className="px-6 py-4">Category</th><th className="px-6 py-4">Driver</th><th className="px-6 py-4 text-center">Units</th><th className="px-6 py-4 text-right">Unit Cost</th><th className="px-6 py-4 text-right">Total</th><th className="px-6 py-4"></th></tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-50">
                                                {selectedBid.passThroughLineItems?.map((item) => (
                                                    <tr key={item.id}>
                                                        <td className="px-6 py-4"><input className="bg-transparent border-0 font-bold text-xs" value={item.category} onChange={e => handleUpdateBid({ passThroughLineItems: selectedBid.passThroughLineItems?.map(i => i.id === item.id ? { ...i, category: e.target.value } : i) })} /></td>
                                                        <td className="px-6 py-4">
                                                            <select className="bg-slate-50 rounded p-1 text-[10px] font-bold" value={item.driver} onChange={e => handleUpdateBid({ passThroughLineItems: selectedBid.passThroughLineItems?.map(i => i.id === item.id ? { ...i, driver: e.target.value } : i) })}>
                                                                {DRIVERS.slice(0, 10).map(d => <option key={d}>{d}</option>)}
                                                            </select>
                                                        </td>
                                                        <td className="px-6 py-4 text-center"><input type="number" className="w-16 bg-white border border-slate-200 rounded p-1 text-center text-xs" value={item.units} onChange={e => { const u = parseFloat(e.target.value) || 0; handleUpdateBid({ passThroughLineItems: selectedBid.passThroughLineItems?.map(i => i.id === item.id ? { ...i, units: u, totalCost: u * i.unitCost } : i) }) }} /></td>
                                                        <td className="px-6 py-4 text-right font-bold text-slate-500"><input type="number" className="w-24 bg-white border border-slate-200 rounded p-1 text-right text-xs" value={item.unitCost} onChange={e => { const uc = parseFloat(e.target.value) || 0; handleUpdateBid({ passThroughLineItems: selectedBid.passThroughLineItems?.map(i => i.id === item.id ? { ...i, unitCost: uc, totalCost: i.units * uc } : i) }) }} /></td>
                                                        <td className="px-6 py-4 text-right font-black text-slate-900">{formatCurrency(item.totalCost)}</td>
                                                        <td className="px-6 py-4 text-right"><button onClick={() => handleUpdateBid({ passThroughLineItems: selectedBid.passThroughLineItems?.filter(i => i.id !== item.id) })} className="text-red-400">✕</button></td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </section>
                            )}

                            {editorTab === 'forecasting' && financials && (
                                <div className="space-y-8 animate-in slide-in-from-right-4">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="bg-slate-900 p-8 rounded-[40px] text-white shadow-xl flex flex-col justify-between h-48">
                                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Gross Profit</span>
                                            <div className="text-4xl font-black text-emerald-400">{formatCurrency(financials.profit)}</div>
                                            <div className="text-[10px] font-bold text-slate-500">Based on {(selectedBid.overheadRate || 0)}% Overhead</div>
                                        </div>
                                        <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm flex flex-col justify-between h-48">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Margin (EBITDA)</span>
                                            <div className="text-4xl font-black text-blue-600">{financials.margin.toFixed(2)}%</div>
                                            <div className="w-full bg-slate-100 h-1.5 rounded-full"><div className="bg-blue-500 h-full" style={{ width: `${Math.min(100, financials.margin)}%` }}></div></div>
                                        </div>
                                        <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm flex flex-col justify-between h-48">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Revenue Forecast</span>
                                            <div className="text-4xl font-black text-slate-900">{formatCurrency(financials.laborFees / (selectedBid.totalDurationMths || 1))}</div>
                                            <div className="text-[10px] font-bold text-slate-500 uppercase">Avg. Monthly Invoicing</div>
                                        </div>
                                    </div>
                                    <section className="bg-white p-10 rounded-[40px] shadow-sm border border-slate-100">
                                        <div className="flex items-center justify-between border-b border-slate-50 pb-4">
                                            <h4 className="text-xl font-black text-slate-800 uppercase">Profitability Config</h4>
                                        </div>
                                        <div className="grid grid-cols-2 gap-12 mt-6">
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-center"><label className="text-xs font-bold text-slate-500 uppercase">Overhead Rate (%)</label><input type="number" className="w-24 bg-slate-50 border-0 rounded-xl p-2 text-center text-xs font-black" value={selectedBid.overheadRate} onChange={e => handleUpdateBid({ overheadRate: parseFloat(e.target.value) })} /></div>
                                                <div className="flex justify-between items-center"><label className="text-xs font-bold text-slate-500 uppercase">Target Margin (%)</label><input type="number" className="w-24 bg-slate-50 border-0 rounded-xl p-2 text-center text-xs font-black" value={selectedBid.targetMargin} onChange={e => handleUpdateBid({ targetMargin: parseFloat(e.target.value) })} /></div>
                                            </div>
                                        </div>
                                    </section>
                                </div>
                            )}

                            {editorTab === 'invoices' && (
                                <section className="bg-white p-10 rounded-[40px] shadow-sm border border-slate-100 animate-in slide-in-from-right-4">
                                    <div className="flex justify-between items-center mb-8 border-b border-slate-50 pb-4">
                                        <h4 className="text-xl font-black text-slate-800 uppercase tracking-tighter">Invoice Hub</h4>
                                        <button onClick={() => handleUpdateBid({ invoices: [...(selectedBid.invoices || []), { id: `INV-${Date.now()}`, milestone: 'New Milestone', amount: 0, status: 'Draft', dueDate: '', type: 'Milestone' }] })} className="bg-slate-900 text-white px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">+ Add Invoice</button>
                                    </div>
                                    <table className="w-full text-left">
                                        <thead className="bg-slate-50 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                            <tr><th className="px-6 py-4">Reference</th><th className="px-6 py-4">Date</th><th className="px-6 py-4 text-right">Amount</th><th className="px-6 py-4 text-center">Status</th><th className="px-6 py-4"></th></tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {selectedBid.invoices?.map((inv) => (
                                                <tr key={inv.id}>
                                                    <td className="px-6 py-4"><input className="bg-transparent border-0 font-bold text-xs" value={inv.milestone} onChange={e => handleUpdateBid({ invoices: selectedBid.invoices?.map(i => i.id === inv.id ? { ...i, milestone: e.target.value } : i) })} /></td>
                                                    <td className="px-6 py-4"><input type="date" className="bg-slate-50 rounded p-1 text-[10px]" value={inv.dueDate} onChange={e => handleUpdateBid({ invoices: selectedBid.invoices?.map(i => i.id === inv.id ? { ...i, dueDate: e.target.value } : i) })} /></td>
                                                    <td className="px-6 py-4 text-right font-black text-slate-900"><input type="number" className="bg-transparent text-right border-0 w-24" value={inv.amount} onChange={e => handleUpdateBid({ invoices: selectedBid.invoices?.map(i => i.id === inv.id ? { ...i, amount: parseFloat(e.target.value) } : i) })} /></td>
                                                    <td className="px-6 py-4 text-center">
                                                        <select className={`text-[9px] font-black uppercase rounded px-2 py-1 ${inv.status === 'Paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`} value={inv.status} onChange={e => handleUpdateBid({ invoices: selectedBid.invoices?.map(i => i.id === inv.id ? { ...i, status: e.target.value as any } : i) })}>
                                                            <option>Draft</option><option>Sent</option><option>Paid</option>
                                                        </select>
                                                    </td>
                                                    <td className="px-6 py-4 text-right"><button onClick={() => handleUpdateBid({ invoices: selectedBid.invoices?.filter(i => i.id !== inv.id) })} className="text-red-400">✕</button></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </section>
                            )}

                            {editorTab === 'consolidated-summary' && financials && (
                                <section className="bg-white rounded-[40px] shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95">
                                    <div className="bg-slate-900 p-10 text-white flex justify-between items-center border-b-4 border-cyan-500">
                                        <h4 className="text-3xl font-black tracking-tighter uppercase italic">Economic Proposal</h4>
                                        <div className="flex gap-4">
                                            <div className="px-6 py-2 bg-emerald-600 rounded-xl text-[10px] font-black uppercase tracking-widest">Margin: {financials.margin.toFixed(1)}%</div>
                                        </div>
                                    </div>
                                    <div className="p-10 space-y-10">
                                        <table className="w-full text-left border-collapse">
                                            <tbody>
                                                <tr className="bg-slate-800 text-white font-black"><td colSpan={2} className="px-8 py-3 text-[11px] uppercase tracking-widest">Service Breakdown</td></tr>
                                                <tr className="border-b border-slate-50"><td className="px-8 py-4 text-xs font-bold text-slate-600 uppercase">Core Management & Labor</td><td className="px-8 py-4 text-right font-black text-slate-900">{formatCurrency(financials.laborFees)}</td></tr>
                                                <tr className="border-b border-slate-50"><td className="px-8 py-4 text-xs font-bold text-slate-600 uppercase italic">Applied Strategic Discount</td><td className="px-8 py-4 text-right font-bold text-red-500">({selectedBid.discountPercent || 0}%)</td></tr>
                                                <tr className="border-b border-slate-50"><td className="px-8 py-4 text-xs font-bold text-slate-600 uppercase">Total Pass-Throughs (Travel/Labs)</td><td className="px-8 py-4 text-right font-black text-slate-900">{formatCurrency(financials.passThroughs)}</td></tr>
                                                <tr className="bg-teal-600 text-white font-black border-t-4 border-teal-800"><td className="px-8 py-6 text-sm uppercase tracking-widest">Grand Total Project Bid</td><td className="px-8 py-6 text-right text-2xl font-black">{formatCurrency(financials.grandTotal)}</td></tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </section>
                            )}

                        </div>
                    </div>
                </div>
            )}

            {view === 'reference-data' && (
                <div className="flex-1 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col animate-in fade-in">
                    <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <button onClick={() => setView('dashboard')} className="text-slate-400 hover:text-slate-900 transition-colors"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeWidth="2.5"/></svg></button>
                            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Standard Labor Rate Matrix</h3>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-10 scrollbar-thin">
                        <div className="bg-white border border-slate-200 rounded-[35px] overflow-hidden shadow-2xl">
                            <table className="w-full text-left">
                                <thead className="bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest">
                                    <tr><th className="px-8 py-6">Functional Node</th><th className="px-8 py-6">Jurisdiction</th><th className="px-8 py-6 text-center">Standard Rate</th><th className="px-8 py-6 text-center">Inflation (+%)</th><th className="px-8 py-6 text-right">Net Proposal Rate</th></tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {laborRates.map((rate, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50 transition-colors group">
                                            <td className="px-8 py-5 font-black text-slate-900 uppercase tracking-tighter text-sm">{rate.role}</td>
                                            <td className="px-8 py-5 text-xs font-bold text-slate-500 uppercase">{rate.country}</td>
                                            <td className="px-8 py-5 text-center font-bold text-slate-400">${rate.baseRate}</td>
                                            <td className="px-8 py-5 text-center font-bold text-slate-400">{rate.inflationPercent}%</td>
                                            <td className="px-8 py-5 text-right font-black text-emerald-600 text-lg decoration-2 underline underline-offset-4 decoration-emerald-100">${rate.netRate.toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PricingTool;

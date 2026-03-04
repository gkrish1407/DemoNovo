
import React, { useState, useRef, useEffect } from 'react';
import { translateDocument, getAlternateSuggestions } from '../services/geminiService';
import { TranslationLog, FunctionalGroup, TranslationDocType, TranslationDimension, CorrectionRationale, MQMSeverity, MQMType } from '../types';
import * as pdfjsLib from 'pdfjs-dist';
import { GoogleGenAI } from "@google/genai";
import { extractRawText } from 'mammoth';

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/build/pdf.worker.min.mjs`;

const generateTrackingId = (): string => {
  const existingLogsStr = localStorage.getItem('aide_translation_metrics');
  const existingLogs: TranslationLog[] = existingLogsStr ? JSON.parse(existingLogsStr) : [];
  const currentYear = new Date().getFullYear();
  const yearLogs = existingLogs.filter(l => l.trackingId.startsWith(`TR-${currentYear}`));
  return `TR-${currentYear}-${String(yearLogs.length + 1).padStart(3, '0')}`;
};

const LANGUAGES = [
    'English', 'Spanish', 'French', 'German', 'Chinese', 'Traditional Chinese', 'Japanese', 'Tamil', 
    'Hindi', 'Portuguese', 'Italian', 'Russian', 'Korean', 'Arabic', 'Thai',
    'Vietnamese', 'Turkish', 'Polish', 'Dutch', 'Greek', 'Czech'
];

const TIME_CODES = [
  '10.01 - Project Management',
  '20.01 - Clinical Operations',
  '30.01 - Regulatory Affairs',
  '40.01 - Medical Writing',
  '50.01 - Pharmacovigilance',
  '60.01 - Learning and Development',
  '70.01 - Data Management',
  '80.01 - Translation Services',
  '90.01 - Other Administrative'
];

const WorkflowFlowchart: React.FC = () => {
  const steps = [
    { label: 'Initiation', desc: 'TR-ID Generation', icon: '🆔' },
    { label: 'Ingestion', desc: 'Artifact Upload', icon: '📄' },
    { label: 'Synthesis', desc: 'Neural Translation', icon: '🧠' },
    { label: 'HITL QC', desc: 'Expert Review', icon: '👤', hitl: true },
    { label: 'Signing', desc: 'GxP Authorization', icon: '✍️' },
    { label: 'Certification', desc: 'Novotech AIDE Validation', icon: '📜' }
  ];

  return (
    <div className="w-full max-w-5xl mb-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <div className="text-center mb-8">
        <h3 className="text-[10px] font-black text-cyan-600 uppercase tracking-[0.3em] mb-2">AIDE Procedural Framework</h3>
        <p className="text-xs text-slate-400 font-bold uppercase">Standardized Clinical Translation Workflow</p>
      </div>
      <div className="relative flex flex-col md:flex-row items-center justify-between gap-4 md:gap-0">
        {/* Connector Line (Desktop) */}
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 -translate-y-1/2 hidden md:block z-0"></div>
        
        {steps.map((step, idx) => (
          <div key={idx} className="relative z-10 flex flex-col items-center group">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl shadow-lg transition-all duration-300 border-2 bg-white ${step.hitl ? 'border-amber-400' : 'border-slate-100 group-hover:border-cyan-500'}`}>
              {step.icon}
              {step.hitl && (
                <div className="absolute -top-1 -right-1 bg-amber-400 text-[8px] font-black px-1.5 py-0.5 rounded text-white uppercase tracking-tighter">HITL</div>
              )}
            </div>
            <div className="mt-3 text-center">
              <div className="text-[10px] font-black text-slate-800 uppercase tracking-widest">{step.label}</div>
              <div className="text-[8px] font-bold text-slate-400 uppercase mt-0.5 whitespace-nowrap">{step.desc}</div>
            </div>
            {idx < steps.length - 1 && (
              <div className="h-8 w-0.5 bg-slate-200 md:hidden mt-4"></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const TranslationTool: React.FC<{ initialText?: string }> = ({ initialText }) => {
  // --- Workflow State ---
  const [workflowStage, setWorkflowStage] = useState<'idle' | 'config' | 'processing' | 'qc' | 'finalized'>(initialText ? 'config' : 'idle');

  // --- Header Configuration States ---
  const [projectNumber, setProjectNumber] = useState('AZ-PH1-2025');
  const [sponsorName, setSponsorName] = useState('');
  const [timeCode, setTimeCode] = useState(TIME_CODES[2]); // Default to Regulatory
  const [currentTrackingId, setCurrentTrackingId] = useState<string>('');
  const [currentLogId, setCurrentLogId] = useState<string>('');
  const [sourceLanguage, setSourceLanguage] = useState('Detecting...');
  const [targetLanguage, setTargetLanguage] = useState('Spanish');
  const [documentType, setDocumentType] = useState<TranslationDocType>(TranslationDocType.EssentialDocuments);
  const [dimension, setDimension] = useState<TranslationDimension>(TranslationDimension.MedicalAccuracy);
  const [culturalNuances, setCulturalNuances] = useState(false);

  // --- Content States ---
  const [sourcePages, setSourcePages] = useState<string[]>([]); 
  const [sourceCurrentPage, setSourceCurrentPage] = useState(0);
  const [editedPages, setEditedPages] = useState<string[]>([]);
  const [outputCurrentPage, setOutputCurrentPage] = useState(0);
  
  // --- UI Layout States ---
  const [isOutputEnlarged, setIsOutputEnlarged] = useState(false);
  const [isSourceEnlarged, setIsSourceEnlarged] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  // --- Metrics & QC States ---
  const [wordCount, setWordCount] = useState(0);
  const [tokenCount, setTokenCount] = useState(0);
  const [estimatedCost, setEstimatedCost] = useState(0);
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [qcStatus, setQcStatus] = useState<'Draft' | 'QC Pending' | 'QC Finalized' | 'Downloaded'>('Draft');
  const [qcSeconds, setQcSeconds] = useState(0);
  const [qcReviewerName, setQcReviewerName] = useState('');

  // --- Intervention Modal States ---
  const [isWordModalOpen, setIsWordModalOpen] = useState(false);
  const [selectedWordData, setSelectedWordData] = useState<{ word: string, index: number } | null>(null);
  const [alternatives, setAlternatives] = useState<string[]>([]);
  const [isFetchingAlts, setIsFetchingAlts] = useState(false);
  const [selectedAlt, setSelectedAlt] = useState('');
  const [mqmSeverity, setMqmSeverity] = useState<MQMSeverity>(MQMSeverity.Minor);
  const [mqmType, setMqmType] = useState<MQMType>(MQMType.Terminology);
  const [rationaleText, setRationaleText] = useState('');

  // --- Neural Voice Reading States ---
  const [isReading, setIsReading] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [highlightedWordIndex, setHighlightedWordIndex] = useState<number | null>(null);
  const [lastCharIndex, setLastCharIndex] = useState(0);

  // --- Loader States ---
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const TOKEN_FACTOR = 1.35;
  const COST_PER_1M_TOKENS = 0.75; 

  // --- Initial Setup ---
  useEffect(() => {
    if (initialText) {
      startNewRequest(initialText);
    }
  }, [initialText]);

  const startNewRequest = (text?: string) => {
    const id = generateTrackingId();
    setCurrentTrackingId(id);
    setCurrentLogId(`trans-${Date.now()}`);
    setWorkflowStage('config');
    setQcStatus('Draft');
    setSourcePages(text ? [text] : []);
    setEditedPages([]);
    setQcSeconds(0);
    setQcReviewerName('');
    setSponsorName('');
    setIsReviewMode(false);
    
    if (text) {
      calculateMetrics([text]);
      detectLanguage(text);
    }
  };

  useEffect(() => {
    let timer: any;
    if (isReviewMode && (qcStatus === 'QC Pending' || qcStatus === 'Draft') && !isPaused && !isWordModalOpen) {
      timer = setInterval(() => setQcSeconds(s => s + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [isReviewMode, qcStatus, isPaused, isWordModalOpen]);

  // --- Core Functions ---
  const calculateMetrics = (pages: string[]) => {
    const text = pages.join(' ');
    const words = text.split(/\s+/).filter(w => w.length > 0).length;
    const tokens = Math.round(words * TOKEN_FACTOR);
    const cost = (tokens / 1000000) * COST_PER_1M_TOKENS;
    setWordCount(words);
    setTokenCount(tokens);
    setEstimatedCost(cost);
  };

  const detectLanguage = async (text: string) => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Identify the primary language of this text. Return ONLY the language name (e.g., "English", "Spanish", "French"). \n\n${text.substring(0, 1000)}`,
      });
      const detected = response.text?.trim();
      if (detected) setSourceLanguage(detected);
    } catch (e) {
      setSourceLanguage("Unknown");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    let pages: string[] = [];
    try {
        if (file.type === 'application/pdf') {
            const buffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const content = await page.getTextContent();
                pages.push(content.items.map((item: any) => item.str).join(' '));
            }
        } else if (file.name.endsWith('.docx')) {
            const buffer = await file.arrayBuffer();
            const result = await extractRawText({ arrayBuffer: buffer });
            pages = [result.value];
        } else {
            const text = await file.text();
            pages = [text];
        }

        setSourcePages(pages);
        setSourceCurrentPage(0);
        calculateMetrics(pages);
        setSourceLanguage('Analyzing...');
        detectLanguage(pages[0] || '');
    } catch (err) {
        alert("Failed to ingest document.");
    }
  };

  const handleTranslate = async () => {
    if (sourcePages.length === 0) return;
    setIsLoading(true);
    setWorkflowStage('processing');
    setProgress(`Executing Agentic Neural Cycle...`);
    try {
        const structuralPrompt = `
            Task: Regulatory Document Translation.
            Dimension: ${dimension}${culturalNuances ? ' + Cultural Nuance' : ''}.
            STRUCTURAL RULES:
            1. Preserve paragraph density and breaks exactly.
            2. Match bullet-point hierarchies and symbols.
            3. Maintain identical sentence sequence.
            4. Target language: ${targetLanguage}.
        `;
        const result = await translateDocument(sourcePages, targetLanguage, structuralPrompt, setProgress);
        const pages = Array.isArray(result) ? result : [result];
        setEditedPages(pages);
        setOutputCurrentPage(0);
        setQcStatus('QC Pending');
        setWorkflowStage('qc');
        setIsReviewMode(true);

        // Initial save to logs
        const newLog: TranslationLog = {
            id: currentLogId,
            trackingId: currentTrackingId,
            functionalGroup: FunctionalGroup.RegulatoryAffairs,
            docType: documentType,
            projectNumber: projectNumber,
            sponsorName: sponsorName,
            timeCode: timeCode,
            timestamp: Date.now(),
            sourceLanguage,
            targetLanguage,
            wordCount,
            charCount: pages.join('').length,
            pageCount: pages.length,
            mode: dimension,
            provider: 'Gemini 3.0 Pro',
            status: 'QC Pending',
            qcTimeSpentSeconds: 0,
            workflowTimeCodes: [{ event: 'TRANSLATION_COMPLETED', timestamp: Date.now() }],
            estimatedCost
        };
        const existing = JSON.parse(localStorage.getItem('aide_translation_metrics') || '[]');
        localStorage.setItem('aide_translation_metrics', JSON.stringify([...existing, newLog]));

    } catch (e) { 
        alert("Translation Pipeline Breach"); 
    } finally { 
        setIsLoading(false); 
        setProgress(''); 
    }
  };

  const handleWordClick = async (word: string, index: number) => {
    setSelectedWordData({ word, index });
    setIsWordModalOpen(true);
    setIsFetchingAlts(true);
    setAlternatives([]);
    setSelectedAlt('');
    setRationaleText('');
    try {
      const alts = await getAlternateSuggestions(word, editedPages[outputCurrentPage], targetLanguage);
      setAlternatives(alts);
    } catch (e) {
      console.error(e);
    } finally {
      setIsFetchingAlts(false);
    }
  };

  const confirmIntervention = () => {
    if (!selectedWordData || !selectedAlt) return;
    const newPages = [...editedPages];
    const words = newPages[outputCurrentPage].split(/\s+/);
    words[selectedWordData.index] = selectedAlt;
    newPages[outputCurrentPage] = words.join(' ');
    setEditedPages(newPages);

    const rationale: CorrectionRationale = {
      originalText: selectedWordData.word,
      updatedText: selectedAlt,
      rationale: rationaleText,
      timestamp: Date.now(),
      pageIndex: outputCurrentPage,
      wordIndex: selectedWordData.index,
      mqmSeverity,
      mqmType
    };

    const stored = localStorage.getItem('aide_translation_metrics');
    const logs: TranslationLog[] = stored ? JSON.parse(stored) : [];
    const logIndex = logs.findIndex(l => l.id === currentLogId);
    if (logIndex !== -1) {
        logs[logIndex].rationales = [...(logs[logIndex].rationales || []), rationale];
        localStorage.setItem('aide_translation_metrics', JSON.stringify(logs));
    }

    setIsWordModalOpen(false);
    setSelectedWordData(null);
  };

  const handleToggleVoice = () => {
    if (isReading && !isPaused) {
        window.speechSynthesis.cancel();
        setIsPaused(true);
    } else {
        handleStartReading(lastCharIndex);
    }
  };

  const handleStartReading = (startIndex: number = 0) => {
    const fullText = editedPages[outputCurrentPage];
    if (!fullText) return;
    window.speechSynthesis.cancel();
    setTimeout(() => {
        const textToSpeak = fullText.substring(startIndex);
        if (!textToSpeak.trim()) return;
        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        utterance.onboundary = (e) => {
            if (e.name === 'word') {
                const absolute = startIndex + e.charIndex;
                setLastCharIndex(absolute);
                const wordsSoFar = fullText.substring(0, absolute).trim().split(/\s+/).length;
                setHighlightedWordIndex(wordsSoFar);
            }
        };
        utterance.onstart = () => { setIsReading(true); setIsPaused(false); };
        utterance.onend = () => { if(!isPaused) { setIsReading(false); setLastCharIndex(0); setHighlightedWordIndex(null); } };
        window.speechSynthesis.speak(utterance);
    }, 50);
  };

  const handleDownloadCertificate = () => {
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>Novotech AIDE Translation Certificate</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&family=Playfair+Display:wght@700&display=swap');
            body { font-family: 'Inter', sans-serif; padding: 60px; color: #1e293b; max-width: 800px; margin: 0 auto; background: #fff; border: 15px solid #f1f5f9; }
            .header { text-align: center; border-bottom: 3px solid #0891b2; padding-bottom: 30px; margin-bottom: 50px; }
            .sys-name { font-family: 'Playfair Display', serif; font-size: 32px; font-weight: 800; color: #0f172a; margin-bottom: 10px; }
            .badge { display: inline-block; background: #0891b2; color: white; padding: 4px 12px; border-radius: 20px; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; }
            .content { font-size: 16px; line-height: 1.8; color: #334155; text-align: center; margin-bottom: 60px; }
            .details-grid { display: grid; grid-cols: 1fr 1fr; gap: 40px; margin-bottom: 60px; border-top: 1px solid #e2e8f0; padding-top: 40px; }
            .item { margin-bottom: 20px; }
            .label { font-size: 10px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px; }
            .value { font-size: 14px; color: #0f172a; font-weight: 600; }
            .signature-block { margin-top: 80px; text-align: center; }
            .sig-line { width: 250px; border-top: 2px solid #0f172a; margin: 0 auto 10px; }
            .footer { font-size: 10px; color: #94a3b8; text-align: center; margin-top: 100px; font-style: italic; }
            @media print { body { border: none; padding: 40px; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="sys-name">Novotech AIDE Translation</div>
            <div class="badge">Validation Certificate</div>
          </div>
          <div class="content">
            <p>This document certifies that the following clinical artifact has undergone high-precision neural translation and formal expert quality control verification within the AIDE Agentic Framework.</p>
            <p style="font-size: 18px; font-weight: 600; color: #0f172a; margin-top: 30px;">
              Accuracy of translation was reviewed and confirmed by <strong>${qcReviewerName}</strong> on ${dateStr} at ${timeStr}.
            </p>
          </div>
          <div style="display: flex; justify-content: space-between; gap: 40px;">
            <div style="flex: 1;">
              <div class="item"><div class="label">Sponsor Name</div><div class="value">${sponsorName || 'N/A'}</div></div>
              <div class="item"><div class="label">Project Number</div><div class="value">${projectNumber}</div></div>
              <div class="item"><div class="label">Time Code</div><div class="value">${timeCode}</div></div>
              <div class="item"><div class="label">Tracking ID</div><div class="value">${currentTrackingId}</div></div>
            </div>
            <div style="flex: 1;">
              <div class="item"><div class="label">Document Class</div><div class="value">${documentType}</div></div>
              <div class="item"><div class="label">Source Language</div><div class="value">${sourceLanguage}</div></div>
              <div class="item"><div class="label">Target Language</div><div class="value">${targetLanguage}</div></div>
              <div class="item"><div class="label">Word Count</div><div class="value">${wordCount.toLocaleString()}</div></div>
            </div>
          </div>
          <div class="signature-block">
            <div class="sig-line"></div>
            <div class="label">Authorized Quality Control Representative</div>
            <div class="value" style="font-family: serif; font-style: italic; font-size: 20px; margin-top: 5px;">${qcReviewerName}</div>
          </div>
          <div class="footer">Verification Hash: ${btoa(currentTrackingId + qcReviewerName).substring(0, 16).toUpperCase()} | AIDE Clinical Intelligence v2.1.1</div>
        </body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => { printWindow.print(); }, 500);
  };

  const handleDownloadWord = () => {
    setShowExportMenu(false);
    if (editedPages.length === 0) return;
    
    const element = document.createElement("a");
    const filename = `Translation_${currentTrackingId}.doc`;
    
    const styles = `
      <style>
        body { font-family: 'Times New Roman', serif; font-size: 11pt; line-height: 1.5; color: #333; }
        .page-break { page-break-after: always; }
        .header { border-bottom: 2px solid #0891b2; padding-bottom: 10px; margin-bottom: 20px; }
        .meta { font-size: 9pt; color: #666; margin-bottom: 20px; }
      </style>
    `;

    const content = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'><title>${filename}</title>${styles}</head>
      <body>
        <div class="header">
          <h1>Clinical Translation Artifact</h1>
        </div>
        <div class="meta">
          <strong>Sponsor:</strong> ${sponsorName || 'N/A'}<br/>
          <strong>Tracking ID:</strong> ${currentTrackingId}<br/>
          <strong>Project:</strong> ${projectNumber}<br/>
          <strong>Time Code:</strong> ${timeCode}<br/>
          <strong>Target Language:</strong> ${targetLanguage}<br/>
          <strong>Date:</strong> ${new Date().toLocaleString()}
        </div>
        <div class="content">
          ${editedPages.map((page, i) => `
            <div class="${i < editedPages.length - 1 ? 'page-break' : ''}">
              ${page.replace(/\n/g, '<br/>')}
            </div>
          `).join('')}
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([content], {type: 'application/msword'});
    element.href = URL.createObjectURL(blob);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleDownloadPdf = () => {
    setShowExportMenu(false);
    window.print();
  };

  const finalizeVerification = () => {
    if (!qcReviewerName.trim()) {
        alert("Authorized Name Required for GxP Finalization.");
        return;
    }
    setQcStatus('QC Finalized');
    setWorkflowStage('finalized');
    setIsReviewMode(false);
    
    // Update permanent log
    const stored = localStorage.getItem('aide_translation_metrics');
    const logs: TranslationLog[] = stored ? JSON.parse(stored) : [];
    const logIndex = logs.findIndex(l => l.id === currentLogId);
    if (logIndex !== -1) {
        logs[logIndex].status = 'QC Finalized';
        logs[logIndex].qcReviewerName = qcReviewerName;
        logs[logIndex].qcTimeSpentSeconds = qcSeconds;
        logs[logIndex].certifiedAt = Date.now();
        localStorage.setItem('aide_translation_metrics', JSON.stringify(logs));
    }
  };

  if (workflowStage === 'idle') {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-slate-50/50 p-8 rounded-2xl border-2 border-dashed border-slate-200 overflow-y-auto">
        <div className="w-20 h-20 bg-cyan-100 text-cyan-600 rounded-3xl flex items-center justify-center mb-6 shadow-sm">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
        </div>
        <h2 className="text-2xl font-black text-slate-800 mb-2">New Translation Request</h2>
        <p className="text-sm text-slate-500 mb-12 max-w-sm text-center">Initiate a formal TR-indexed workflow for clinical documents, including automated translation and GxP validation certificate generation.</p>
        
        {/* New Flowchart Component */}
        <WorkflowFlowchart />

        <button 
          onClick={() => startNewRequest()} 
          className="bg-slate-900 text-white px-12 py-5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl hover:bg-black transition-all active:scale-95 border-b-4 border-cyan-600"
        >
          Initialize Request Sequence
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full space-y-6">
        {/* Full Header Configuration Bar */}
        <div className={`bg-white p-6 rounded-xl shadow-sm border border-slate-200 transition-all ${(isSourceEnlarged || isOutputEnlarged || workflowStage === 'processing') ? 'hidden' : 'block'}`}>
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-50">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-cyan-600 text-white rounded-lg flex items-center justify-center text-xs font-black">TR</div>
                    <div className="text-sm font-black text-slate-900 uppercase tracking-widest">Request Reference: {currentTrackingId}</div>
                </div>
                <button onClick={() => setWorkflowStage('idle')} className="text-[10px] font-black text-slate-400 hover:text-red-500 uppercase tracking-widest">Abandon Task</button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Sponsor Name</label>
                    <input placeholder="e.g. Novartis, Roche..." value={sponsorName} onChange={e => setSponsorName(e.target.value)} className="w-full border-slate-200 rounded-lg p-2.5 font-bold text-sm bg-slate-50 focus:bg-white outline-none" />
                </div>
                <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Project Identification</label>
                    <input value={projectNumber} onChange={e => setProjectNumber(e.target.value)} className="w-full border-slate-200 rounded-lg p-2.5 font-bold text-sm bg-slate-50 focus:bg-white outline-none" />
                </div>
                <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Time Code</label>
                    <select value={timeCode} onChange={e => setTimeCode(e.target.value)} className="w-full border-slate-200 rounded-lg p-2.5 font-bold text-sm bg-slate-50 outline-none">
                        {TIME_CODES.map(tc => <option key={tc} value={tc}>{tc}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Document Class</label>
                    <select value={documentType} onChange={e => setDocumentType(e.target.value as TranslationDocType)} className="w-full border-slate-200 rounded-lg p-2.5 font-bold text-sm bg-slate-50 outline-none">
                        {Object.values(TranslationDocType).map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Source Locale</label>
                    <div className="w-full bg-slate-100 rounded-lg p-2.5 font-bold text-sm text-slate-600 border border-slate-200 min-h-[40px] flex items-center">{sourceLanguage}</div>
                </div>
                <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Target Locale</label>
                    <select value={targetLanguage} onChange={e => setTargetLanguage(e.target.value)} className="w-full border-slate-200 rounded-lg p-2.5 font-bold text-sm bg-slate-50 outline-none">
                        {LANGUAGES.map(lang => <option key={lang} value={lang}>{lang}</option>)}
                    </select>
                </div>
            </div>

            <div className="flex justify-between items-center pt-5 border-t border-slate-100">
                <button 
                  onClick={() => fileInputRef.current?.click()} 
                  className="flex items-center gap-3 bg-white border border-slate-200 text-slate-600 px-6 py-3 rounded-xl font-black uppercase text-[10px] hover:bg-slate-50 shadow-sm transition-all active:scale-95"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                  {sourcePages.length > 0 ? 'Update Artifact' : 'Upload Artifact'}
                </button>
                <input type="file" ref={fileInputRef} className="hidden" accept=".pdf,.docx,.txt" onChange={handleFileUpload} />
                
                <div className="flex gap-4 items-center">
                    <div className="text-right">
                        <div className="text-[10px] font-black text-slate-400 uppercase">Analysis Results</div>
                        <div className="text-xs font-bold text-slate-700">{wordCount.toLocaleString()} Words | ${estimatedCost.toFixed(4)} USD</div>
                    </div>
                    <button 
                      onClick={handleTranslate} 
                      disabled={sourcePages.length === 0}
                      className="bg-cyan-600 text-white px-10 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-cyan-700 shadow-lg disabled:opacity-30 transition-all active:scale-95"
                    >
                      Process Translation
                    </button>
                </div>
            </div>
        </div>

        {/* Dual-Channel Interface */}
        <div className={`flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0 ${workflowStage === 'processing' ? 'opacity-30 pointer-events-none' : ''}`}>
            {/* Clinical Source View */}
            <div className={`bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col h-full shadow-sm transition-all ${isOutputEnlarged ? 'hidden' : isSourceEnlarged ? 'lg:col-span-2' : 'flex'}`}>
                <div className="p-3 bg-slate-50 border-b border-slate-100 flex justify-between items-center sticky top-0 z-20">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-3">Clinical Source Artifact</span>
                    <div className="flex items-center gap-2">
                         <div className="flex items-center gap-2 bg-white px-2 py-1 rounded border border-slate-200">
                            <button onClick={() => setSourceCurrentPage(Math.max(0, sourceCurrentPage - 1))} className="p-1 hover:bg-slate-100 rounded text-slate-400"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7"/></svg></button>
                            <span className="text-[10px] font-bold text-slate-600 font-mono">{sourceCurrentPage + 1}/{sourcePages.length || 1}</span>
                            <button onClick={() => setSourceCurrentPage(Math.min(sourcePages.length - 1, sourceCurrentPage + 1))} className="p-1 hover:bg-slate-100 rounded text-slate-400"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg></button>
                        </div>
                        <button onClick={() => setIsSourceEnlarged(!isSourceEnlarged)} className="text-slate-400 hover:text-cyan-600 p-1.5"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"></path></svg></button>
                    </div>
                </div>
                <div className="flex-1 p-12 overflow-y-auto whitespace-pre-wrap text-[14px] leading-[2.6] text-slate-700 font-serif bg-slate-50/20">
                    {sourcePages[sourceCurrentPage] || "System Standby..."}
                </div>
            </div>

            {/* Neural Translation Output */}
            <div className={`bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col h-full shadow-sm relative transition-all ${isSourceEnlarged ? 'hidden' : isOutputEnlarged ? 'lg:col-span-2' : 'flex'}`}>
                <div className={`p-3 transition-colors duration-300 flex justify-between items-center sticky top-0 z-30 shadow-md ${isOutputEnlarged ? 'bg-slate-900 text-white' : 'bg-cyan-50/80 backdrop-blur border-b border-cyan-100'}`}>
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                             <div className={`w-2 h-2 rounded-full animate-pulse ${isOutputEnlarged ? 'bg-cyan-400' : 'bg-cyan-600'}`}></div>
                             <span className={`text-[10px] font-black uppercase tracking-widest ${isOutputEnlarged ? 'text-cyan-200' : 'text-cyan-800'}`}>Neural Review Engine</span>
                        </div>
                        <div className={`flex items-center gap-3 px-3 py-1.5 rounded-full border ${isOutputEnlarged ? 'bg-white/10 border-white/10' : 'bg-white border-cyan-200'}`}>
                            <button onClick={() => setOutputCurrentPage(Math.max(0, outputCurrentPage - 1))} className="text-cyan-600"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"/></svg></button>
                            <span className={`text-[10px] font-black font-mono tracking-widest min-w-[60px] text-center ${isOutputEnlarged ? 'text-white' : 'text-cyan-900'}`}>{outputCurrentPage + 1}/{editedPages.length || 1}</span>
                            <button onClick={() => setOutputCurrentPage(Math.min(editedPages.length - 1, outputCurrentPage + 1))} className="text-cyan-600"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"/></svg></button>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        {editedPages.length > 0 && (
                            <div className="flex items-center gap-2">
                              <button onClick={handleToggleVoice} className={`p-1.5 rounded transition-colors ${isReading && !isPaused ? 'text-emerald-500' : 'text-cyan-600 hover:bg-white'}`}><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 001.555.832l3-2z" clipRule="evenodd"></path></svg></button>
                              <div className="relative">
                                <button onClick={() => setShowExportMenu(!showExportMenu)} className="bg-slate-900 text-white px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-2">EXPORT <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"/></svg></button>
                                {showExportMenu && (
                                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-2xl border border-slate-100 z-[60] overflow-hidden">
                                    <button onClick={handleDownloadWord} className="w-full text-left px-4 py-3 text-[10px] font-bold text-slate-600 hover:bg-slate-50 border-b border-slate-50">Microsoft Word (.doc)</button>
                                    <button onClick={handleDownloadPdf} className="w-full text-left px-4 py-3 text-[10px] font-bold text-slate-600 hover:bg-slate-50">Clinical PDF</button>
                                  </div>
                                )}
                              </div>
                            </div>
                        )}
                        {qcStatus === 'QC Finalized' && (
                            <button onClick={handleDownloadCertificate} className="bg-emerald-600 text-white px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center gap-2">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                                Certificate
                            </button>
                        )}
                        <button onClick={() => setIsOutputEnlarged(!isOutputEnlarged)} className="text-slate-400 hover:text-cyan-600 p-1.5"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"></path></svg></button>
                    </div>
                </div>
                
                <div className="flex-1 p-12 overflow-y-auto bg-white font-serif relative">
                    {workflowStage === 'processing' && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-cyan-600 gap-6 z-50 bg-white/60 backdrop-blur-sm">
                            <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] animate-pulse">{progress}</span>
                        </div>
                    )}
                    <div className="whitespace-pre-wrap leading-[2.8] text-[15px] text-slate-900">
                        {editedPages[outputCurrentPage]?.split(/\s+/).map((word, i) => (
                            <span key={i} onClick={() => isReviewMode && handleWordClick(word, i)} className={`inline-block px-1 rounded transition-all duration-150 ${highlightedWordIndex === i ? 'bg-emerald-600 text-white shadow-[0_0_20px_rgba(5,150,105,0.7)] scale-110' : isReviewMode ? 'hover:bg-cyan-100 border-b border-transparent hover:border-cyan-400 cursor-pointer' : ''}`}>
                                {word}{' '}
                            </span>
                        ))}
                    </div>
                </div>

                {isReviewMode && qcStatus !== 'QC Finalized' && (
                    <div className="p-5 bg-slate-950 flex justify-between items-center text-white border-t border-white/5 shadow-2xl sticky bottom-0 z-40">
                        <div className="flex flex-col flex-1 max-w-sm mr-6">
                            <label className="text-[8px] font-black text-slate-500 uppercase mb-2">Reviewer Authorization (Full Name)</label>
                            <input type="text" value={qcReviewerName} onChange={e => setQcReviewerName(e.target.value)} placeholder="Type full name for audit trail..." className="bg-slate-900 border border-slate-800 rounded-lg px-4 py-3 text-[11px] font-bold outline-none focus:border-cyan-500 transition-all text-white placeholder:text-slate-700" />
                        </div>
                        <div className="text-right mr-8 hidden md:block">
                            <div className="text-[8px] font-black text-slate-500 uppercase mb-1">QC Clock</div>
                            <div className="text-sm font-mono font-black text-cyan-400">{Math.floor(qcSeconds/60)}m {qcSeconds%60}s</div>
                        </div>
                        <button onClick={finalizeVerification} className="bg-emerald-600 px-10 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-emerald-700 active:scale-95 transition-all">Finalize & Sign</button>
                    </div>
                )}
            </div>
        </div>

        {/* Semantic Correction Window */}
        {isWordModalOpen && (
            <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden animate-in zoom-in-95 duration-200">
                    <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                        <div>
                            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Semantic Intervention Window</h3>
                            <p className="text-[10px] text-slate-500 mt-1 uppercase">Token: <span className="font-bold text-red-500 underline decoration-2">{selectedWordData?.word}</span></p>
                        </div>
                        <button onClick={() => setIsWordModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-2"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg></button>
                    </div>
                    <div className="p-7 space-y-8">
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Intelligent Equivalents</label>
                            {isFetchingAlts ? <div className="flex gap-3 animate-pulse">{[1,2,3,4].map(i => <div key={i} className="h-11 w-28 bg-slate-100 rounded-xl" />)}</div> : (
                                <div className="flex flex-wrap gap-3">{alternatives.map((alt, i) => (<button key={i} onClick={() => setSelectedAlt(alt)} className={`px-5 py-2.5 rounded-xl text-xs font-bold border-2 transition-all ${selectedAlt === alt ? 'bg-cyan-600 text-white border-cyan-600 shadow-lg' : 'bg-white text-slate-600 border-slate-100 hover:border-cyan-300'}`}>{alt}</button>))}</div>
                            )}
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5 block">Severity</label><select value={mqmSeverity} onChange={e => setMqmSeverity(e.target.value as MQMSeverity)} className="w-full border-slate-200 rounded-xl text-xs h-11 px-3 font-bold bg-slate-50 outline-none">{Object.values(MQMSeverity).map(s => <option key={s} value={s}>{s}</option>)}</select></div>
                            <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5 block">Taxonomy</label><select value={mqmType} onChange={e => setMqmType(e.target.value as MQMType)} className="w-full border-slate-200 rounded-xl text-xs h-11 px-3 font-bold bg-slate-50 outline-none">{Object.values(MQMType).map(t => <option key={t} value={t}>{t}</option>)}</select></div>
                        </div>
                        <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5 block">Remediation Rationale</label><textarea value={rationaleText} onChange={e => setRationaleText(e.target.value)} className="w-full border-slate-200 rounded-2xl p-4 text-xs h-28 outline-none bg-slate-50 font-medium transition-all" placeholder="Required for digital audit trail..." /></div>
                        <button onClick={confirmIntervention} disabled={!selectedAlt || !rationaleText} className="w-full bg-slate-900 text-white py-4.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-black disabled:opacity-30 transition-all shadow-xl active:scale-95">Commit Correction</button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default TranslationTool;

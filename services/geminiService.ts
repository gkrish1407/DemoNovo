
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { AnalysisResult, RegulationEntry, NewsItem, TMFDocument, GapAnalysisResult, MonitoringReportLog, BiocharacterizationResult, GenieDomain, AIPeerReviewResult } from '../types';

/**
 * Robust AI Call Wrapper with Exponential Backoff
 * Handles 429 (Quota Exceeded) and 503 (Overloaded) errors.
 */
const safeAiCall = async (fn: () => Promise<any>, retries = 3, delay = 1000): Promise<any> => {
  try {
    return await fn();
  } catch (error: any) {
    const isRetryable = error.message?.includes('429') || error.message?.includes('503') || error.message?.includes('quota');
    if (isRetryable && retries > 0) {
      console.warn(`Gemini Quota/Busy: Retrying in ${delay}ms... (${retries} attempts left)`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return safeAiCall(fn, retries - 1, delay * 2);
    }
    throw error;
  }
};

const extractJson = (text: string): any => {
  if (!text) return null;
  let cleanText = text.trim();
  if (cleanText.startsWith('```')) {
    cleanText = cleanText.replace(/^```(?:json)?|```$/g, '').trim();
  }
  
  try {
    return JSON.parse(cleanText);
  } catch (e) {
    const match = cleanText.match(/\[[\s\S]*\]|\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch (innerE) {
        console.error("Critical JSON Parsing Error", innerE);
      }
    }
  }
  return null;
};

export const performOCR = async (base64Data: string, mimeType: string): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Extract all text from this clinical artifact. Focus on accuracy for GxP documentation.`;
    
    const response = await safeAiCall(() => ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
            parts: [{ text: prompt }, { inlineData: { data: base64Data, mimeType } }]
        }
    }));
    return response.text || "";
};

export const mapNotesToChecklist = async (
    notes: string,
    checklistItems: Array<{ id: string, description: string }>,
    language: string = 'English'
): Promise<Record<string, string>> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `
        ROLE: Expert Clinical Research Auditor.
        TASK: Extract findings from notes and map them to the specific IDs provided in the checklist below.
        
        CHECKLIST ITEMS:
        ${checklistItems.map(item => `ID: ${item.id} | Description: ${item.description}`).join('\n')}

        NOTES TO ANALYZE: 
        ${notes.substring(0, 15000)}

        TARGET LANGUAGE: ${language}
        
        INSTRUCTIONS:
        1. Read the notes carefully.
        2. For each checklist item, find relevant information in the notes.
        3. If relevant information is found, summarize it concisely for that ID.
        4. If no information is found for an ID, do NOT include it in the output.
        5. Focus on factual observations and GxP compliance.

        FORMAT: Return a JSON object with "findings" as an array of {id, summary}.
    `;

    try {
        const response = await safeAiCall(() => ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        findings: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    id: { type: Type.STRING },
                                    summary: { type: Type.STRING }
                                },
                                required: ["id", "summary"]
                            }
                        }
                    },
                    required: ["findings"]
                }
            }
        }));

        const parsed = extractJson(response.text);
        const resultMapping: Record<string, string> = {};
        if (parsed?.findings) {
            parsed.findings.forEach((f: any) => {
                if (f.id) resultMapping[f.id] = f.summary;
            });
        }
        return resultMapping;
    } catch (error) {
        console.error("Gemini Segregation Failure:", error);
        return {};
    }
};

export const performAIPeerReview = async (
    synthesis: string,
    requirement: string,
    protocolText: string,
    cmpText: string,
    annotatedReportText: string,
    language: string = 'English'
): Promise<AIPeerReviewResult> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `
        ROLE: Senior Clinical Quality Assurance Auditor.
        TASK: Perform a peer review of a monitoring report narrative.
        
        REQUIREMENT: "${requirement}"
        SYNTHESIS TO REVIEW: "${synthesis}"
        
        REFERENCE CONTEXT:
        - Protocol Excerpt: ${protocolText.substring(0, 2000)}
        - CMP Excerpt: ${cmpText.substring(0, 1000)}
        - Annotated Report Context: ${annotatedReportText.substring(0, 1000)}
        
        INSTRUCTIONS:
        1. Verify if the synthesis accurately reflects the requirement and aligns with the Protocol/CMP.
        2. Check for GxP compliance and professional tone.
        3. Identify any missing protocol references or potential risks.
        4. Provide critical feedback and suggested improvements.
        5. Assess protocol match status: Verified, Conflict, or Ambiguous.
        6. Target Language: ${language}

        FORMAT: Return JSON with { "criticalThinking": string, "curiosityQuestion": string, "suggestedComments": string[], "protocolMatch": "Verified" | "Conflict" | "Ambiguous", "ichReference": string }
    `;

    try {
        const response = await safeAiCall(() => ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        criticalThinking: { type: Type.STRING },
                        curiosityQuestion: { type: Type.STRING },
                        suggestedComments: { type: Type.ARRAY, items: { type: Type.STRING } },
                        protocolMatch: { type: Type.STRING, enum: ["Verified", "Conflict", "Ambiguous"] },
                        ichReference: { type: Type.STRING }
                    },
                    required: ["criticalThinking", "curiosityQuestion", "suggestedComments", "protocolMatch", "ichReference"]
                }
            }
        }));
        
        return extractJson(response.text) || { 
            criticalThinking: "Analysis unavailable.", 
            curiosityQuestion: "No risks flagged.", 
            suggestedComments: [], 
            protocolMatch: 'Ambiguous', 
            ichReference: "N/A" 
        };
    } catch (e) {
        return { 
            criticalThinking: "Peer review unavailable (Quota Limit).", 
            curiosityQuestion: "Please try again later.", 
            suggestedComments: [], 
            protocolMatch: 'Ambiguous', 
            ichReference: "N/A" 
        };
    }
};

export const generateGxPSentence = async (
    question: string,
    annotation: string,
    keywords: string,
    protocolText: string = '',
    cmpText: string = '',
    protocolMetadata: string = 'N/A',
    language: string = 'English'
): Promise<{ text: string, status: 'Pass' | 'Fail', findings?: Array<{ pdWording: string, fuiWording: string }> }> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const fallback = {
        text: "Documentation pending: Information missing or system rate-limited.",
        status: 'Fail' as const,
        findings: [{
            pdWording: "Oversight Gap: Analysis incomplete due to transient system error.",
            fuiWording: "CRA to verify visit notes manually."
        }]
    };

    if (!keywords || keywords.toLowerCase().includes("matching information not found")) {
        return fallback;
    }

    const prompt = `
        ROLE: Expert Clinical Research Medical Writer.
        TASK: Synthesize a professional GxP monitoring narrative for a monitoring report.
        
        REQUIREMENT: "${question}"
        OBSERVATIONS: "${keywords}"
        GUIDANCE: "${annotation}"
        
        CONTEXTUAL REFERENCES:
        - Protocol Metadata: ${protocolMetadata}
        - Protocol Excerpt: ${protocolText.substring(0, 3000)}
        - Clinical Monitoring Plan (CMP) Excerpt: ${cmpText.substring(0, 2000)}
        
        INSTRUCTIONS:
        1. Use the Observations to answer the Requirement.
        2. Incorporate specific references to the Protocol (e.g., section numbers, version) or CMP where applicable.
        3. Maintain a professional, objective, and GxP-compliant tone.
        4. If the observations indicate a failure or deviation, set status to "Fail" and provide specific "findings" with PD (Protocol Deviation) and FUI (Follow-Up Item) wording.
        5. Target Language: ${language}

        FORMAT: Return JSON with { "text": string, "status": "Pass" | "Fail", "findings": [{ "pdWording": string, "fuiWording": string }] }
    `;

    try {
        const response = await safeAiCall(() => ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        text: { type: Type.STRING },
                        status: { type: Type.STRING, enum: ["Pass", "Fail"] },
                        findings: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    pdWording: { type: Type.STRING },
                                    fuiWording: { type: Type.STRING }
                                },
                                required: ["pdWording", "fuiWording"]
                            }
                        }
                    },
                    required: ["text", "status"]
                }
            }
        }));
        const result = extractJson(response.text);
        return result || fallback;
    } catch (e) {
        return fallback;
    }
};

export const refineGxPWithClarification = async (
    originalText: string,
    clarification: string,
    suggestions: string,
    language: string = 'English'
): Promise<{ text: string }> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Refine this clinical narrative: "${originalText}" using feedback: "${suggestions}" and response: "${clarification}". Language: ${language}`;

    try {
        const response = await safeAiCall(() => ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: { text: { type: Type.STRING } },
                    required: ["text"]
                }
            }
        }));
        return extractJson(response.text) || { text: originalText };
    } catch (e) {
        return { text: originalText };
    }
};

export const generateFollowUpLetter = async (
    metadata: { sponsor: string, protocol: string, cra: string, siteName: string, piName: string, visitDate: string },
    findings: Array<{ requirement: string, summary: string, action: string }>,
    language: string = 'English'
): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Generate a formal HTML Follow-up Letter in ${language}. Metadata: ${JSON.stringify(metadata)}`;
    const response = await safeAiCall(() => ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: prompt }));
    return response.text || "";
};

export const streamChatResponse = async (history: any[], message: string, onChunk: (chunk: string, metadata?: any) => void, domain?: GenieDomain) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const chat = ai.chats.create({ model: 'gemini-3-flash-preview', history, config: { tools: [{ googleSearch: {} }] } });
  const stream = await chat.sendMessageStream({ message });
  for await (const chunk of stream) { onChunk(chunk.text || '', chunk.candidates?.[0]?.groundingMetadata); }
};

export const getRegulatoryNews = async (): Promise<NewsItem[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await safeAiCall(() => ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: "Recent healthcare regulatory news. JSON array.", config: { responseMimeType: "application/json", tools: [{ googleSearch: {} }] } }));
  return extractJson(response.text) || [];
};

export const getCROIntelligence = async (): Promise<any[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `
    Search for recent Contract Research Organization (CRO) intelligence, including:
    1. Recent contract wins or partnerships (last 6 months).
    2. M&A activity.
    3. Strategic expansions.
    4. Financial performance highlights.
    
    Return a JSON array of objects with:
    {
      "cro": "Name of CRO",
      "type": "Win | M&A | Expansion | Financial",
      "title": "Short headline",
      "summary": "Brief description",
      "date": "Approximate date",
      "source": "Public source name",
      "url": "URL to source"
    }
  `;
  const response = await safeAiCall(() => ai.models.generateContent({ 
    model: 'gemini-3-flash-preview', 
    contents: prompt, 
    config: { 
      responseMimeType: "application/json", 
      tools: [{ googleSearch: {} }] 
    } 
  }));
  return extractJson(response.text) || [];
};

export const getMarketIntelligenceData = async (year: string = '2026'): Promise<any> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `
    Fetch real-time clinical trial market intelligence data for Novotech (CRO), specifically aligned with their "Algorithm v2.0" strategy for the year ${year}.
    Novotech focus: APAC Leadership + Rapid Expansion in North America (NA) and Europe (EU).
    Target: Biotech-focused client base, early-phase clinical development.

    Provide the following data in a structured JSON format:
    1. phaseDistribution: Array of { phase: string, count: number } for Phases I, II, III, IV.
    2. regionalShare: Array of { name: string, value: number } for Americas, Europe, Asia Pacific, Japan.
    3. therapeuticIntensity: Array of { ta: string, trials: number } for top 6 TAs.
    4. segmentScores: Array of { 
         segment: string, 
         region: 'APAC' | 'NA' | 'EU',
         mas: number, 
         cfs: number, 
         rs: number, 
         os: number,
         mpm: number // Market Penetration Multiplier for expansion regions
       } for top 10 market segments.
    5. sponsorTargets: Array of { 
         name: string, 
         type: 'Biotech' | 'Mid-Pharma' | 'Large-Pharma',
         outsourcing: number, 
         fit: number, 
         potential: number, 
         sps: number,
         fundingRound: string,
         isApacExpansionLikely: boolean,
         share: number
       } for top 15 sponsors.
    6. revenueForecast: Array of { month: string, demand: number, revenue: number, winProb: number } for the 12 months starting from Jan ${year}.
    7. croMarketShare: Array of { name: string, share: number, region: string, ta: string } for top 10 CROs.
    8. capacityDemand: {
         apac: { demand: number, fte: number },
         na: { demand: number, fte: number },
         eu: { demand: number, fte: number }
       }
    9. geographicalSpread: Array of { country: string, trials: number, growth: number, region: string }
    10. sponsorSpread: Array of { type: string, count: number, revenuePotential: number }
    11. dataSources: Array of { metric: string, source: string, referenceUrl: string, calculationLogic: string }
    12. yoyComparison: {
          totalTrials: { current: number, previous: number, change: number, trend: 'up' | 'down' | 'stable' },
          marketShare: { current: number, previous: number, change: number, trend: 'up' | 'down' | 'stable' },
          biotechFunding: { current: number, previous: number, change: number, trend: 'up' | 'down' | 'stable' },
          expansionVelocity: { current: number, previous: number, change: number, trend: 'up' | 'down' | 'stable' }
        }
    13. regionalOpportunityHeatmap: Array of { region: string, ta: string, score: number } // score 0-100
    14. comparativeTrends: Array of { year: string, trials: number, marketShare: number, revenue: number } // last 5 years up to ${year}

    Use authentic sources like ClinicalTrials.gov, WHO ICTRP, and recent market reports (specifically for the year ${year}).
    Ensure the numbers reflect Novotech's strategic positioning and the selected year's projected/historical trends.
  `;

  try {
    const response = await safeAiCall(() => ai.models.generateContent({ 
      model: 'gemini-3-flash-preview', 
      contents: prompt, 
      config: { 
        responseMimeType: "application/json", 
        tools: [{ googleSearch: {} }] 
      } 
    }));
    return extractJson(response.text);
  } catch (error) {
    console.error("Market Intelligence Fetch Error:", error);
    return null;
  }
};

export const getArchivedRegulatoryNews = async (): Promise<NewsItem[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await safeAiCall(() => ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: "Historical clinical milestones. JSON array.", config: { responseMimeType: "application/json" } }));
  return extractJson(response.text) || [];
};

export const getTMFChecklist = async (country: string): Promise<TMFDocument[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await safeAiCall(() => ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: `DIA TMF checklist for ${country}. JSON array.`, config: { responseMimeType: "application/json" } }));
  return extractJson(response.text) || [];
};

export const generateGapAnalysis = async (sop: string, reg: string): Promise<GapAnalysisResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await safeAiCall(() => ai.models.generateContent({ model: 'gemini-3-pro-preview', contents: `Compare SOP against Regulation. JSON.`, config: { responseMimeType: "application/json" } }));
  return extractJson(response.text) || { complianceScore: 0, executiveSummary: '', missingElements: [], remediationPlan: [] };
};

export const generateICF = async (protocol: any, template: any, regulation: any, country: string, type: string, lang: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await safeAiCall(() => ai.models.generateContent({ model: 'gemini-3-pro-preview', contents: `Generate ICF. HTML.` }));
  return response.text || '';
};

export const translateDocument = async (content: string | string[], targetLanguage: string, instructions: string = '', onProgress?: any): Promise<string | string[]> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await safeAiCall(() => ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: `Translate to ${targetLanguage}. \n\n ${content}` }));
    return response.text || '';
};

export const getAlternateSuggestions = async (word: string, context: string, lang: string): Promise<string[]> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await safeAiCall(() => ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: `Alternatives for ${word} in ${lang}. JSON.`, config: { responseMimeType: "application/json" } }));
    return extractJson(response.text) || [];
};

export const analyzeDoseEscalation = async (data: any): Promise<any> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await safeAiCall(() => ai.models.generateContent({ model: 'gemini-3-pro-preview', contents: `Analyze dose escalation. JSON.`, config: { responseMimeType: "application/json" } }));
  return extractJson(response.text) || { recommendation: 'Unknown', predictedMTD: 'N/A', rationale: '', safetyWarnings: [], nextSteps: [] };
};

export const analyzeBiosimilarity = async (data: any, reference: string): Promise<BiocharacterizationResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await safeAiCall(() => ai.models.generateContent({ model: 'gemini-3-pro-preview', contents: `Analyze biosimilarity. JSON.`, config: { responseMimeType: "application/json" } }));
  return extractJson(response.text) || { similarityScore: 0, glycosylationIndex: 0, aggregationRisk: 'Medium', potencyPredicted: 0, complianceAssessment: 'Analysis Failed', remediationSteps: [], criticalDifferences: [] };
};

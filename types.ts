
export enum Category {
  ClinicalResearch = 'Clinical Research & Trials',
  Manufacturing = 'Manufacturing & Quality Systems',
  Pharmacovigilance = 'Pharmacovigilance & Drug Safety',
  RegulatorySubmissions = 'Regulatory Submissions & Compliance',
  MedicalDevices = 'Medical Devices & Diagnostics',
  Biologics = 'Biotechnology, Biologics & Biosimilars',
  DataIntegrity = 'Data Integrity & Electronic Records',
  QualityAssurance = 'Quality Assurance & Risk Management',
  Advertising = 'Advertising, Promotion & Labeling',
  DrugDevelopment = 'Drug Development & Regulatory Science',
  ControlledSubstances = 'Controlled Substances & Safety Controls',
  MarketAccess = 'Health Technology Assessment & Market Access',
  Privacy = 'Privacy, Security & Compliance',
  Environmental = 'Environmental, Occupational & Facility Regulations',
  SupplyChain = 'Supply Chain, Import/Export & Logistics'
}

export enum Region {
  US = 'United States (FDA)',
  EU = 'European Union (EMA)',
  APAC = 'Asia Pacific',
  Global = 'Global (ICH/WHO)',
  UK = 'United Kingdom (MHRA)'
}

export enum ImpactLevel {
  High = 'High',
  Medium = 'Medium',
  Low = 'Low',
  Unknown = 'Unknown'
}

export enum RiskSeverity {
  Critical = 'Critical',
  Major = 'Major',
  Minor = 'Minor',
  Observation = 'Observation'
}

export enum FunctionalGroup {
  ClinicalOperations = 'Clinical Operations',
  RegulatoryAffairs = 'Regulatory Affairs',
  QualityAssurance = 'Quality Assurance',
  Pharmacovigilance = 'Pharmacovigilance',
  Other = 'Other Functions'
}

export enum TranslationDocType {
  EssentialDocuments = 'Essential Documents',
  RegulatorySubmissions = 'IRB/EC/Regulatory Submissions',
  PatientFacing = 'Patient Facing Materials',
  ProtocolTechnical = 'Protocol and Other Technical Documents',
  Communication = 'Communication',
  Contract = 'Contract'
}

export enum TranslationDimension {
  PatientCentric = 'Patient Centric',
  RegulatoryFocused = 'Regulatory Focused',
  MedicalAccuracy = 'Medical Accuracy',
  LegalAspects = 'Legal Aspects'
}

export type PageRange = '1-10' | '10-50' | '50-100' | '100-500';

export enum MQMSeverity {
  Minor = 'Minor',
  Major = 'Major',
  Critical = 'Critical'
}

export enum MQMType {
  Terminology = 'Terminology',
  Accuracy = 'Accuracy',
  Fluency = 'Fluency',
  Style = 'Style'
}

export interface CorrectionRationale {
  originalText: string;
  updatedText: string;
  rationale: string;
  timestamp: number;
  pageIndex: number;
  wordIndex: number;
  mqmSeverity: MQMSeverity;
  mqmType: MQMType;
}

export interface TranslationLog {
  id: string;
  trackingId: string;
  functionalGroup: FunctionalGroup;
  docType: TranslationDocType;
  projectNumber: string;
  sponsorName?: string;
  timeCode?: string;
  timestamp: number;
  sourceLanguage: string;
  targetLanguage: string;
  wordCount: number;
  charCount: number;
  pageCount: number;
  mode: string;
  provider: string;
  qualityScore?: number;
  mqmErrorScore?: number;
  status: 'Draft' | 'QC Pending' | 'QC Finalized' | 'Downloaded';
  qcTimeSpentSeconds: number; 
  workflowTimeCodes: Array<{ event: string; timestamp: number }>;
  estimatedCost?: number;
  rationales?: CorrectionRationale[];
  qcReviewerName?: string;
  certifiedAt?: number;
}

export interface IMVReportAudit {
  action: string;
  timestamp: number;
  user: string;
}

export interface AIPeerReviewResult {
  criticalThinking: string;
  curiosityQuestion: string;
  suggestedComments: string[];
  protocolMatch: 'Verified' | 'Conflict' | 'Ambiguous';
  ichReference: string;
}

export interface IMVReport {
  id: string;
  projectNumber: string;
  protocolNumber: string;
  sponsorName: string;
  craName: string;
  reviewerName: string;
  protocolUrl: string;
  protocolVersion: string;
  openedAt: number;
  completedAt?: number;
  peerReviewTotalSeconds: number;
  status: 'Draft' | 'Review' | 'Finalized';
  isReviewerNotified: boolean;
  auditTrail: IMVReportAudit[];
  data: {
    fieldKeywords?: Record<string, string>;
    generatedResponses?: Record<string, any>;
    peerReviews?: Record<string, any>;
    fullProtocolText?: string;
    cmpText?: string;
    annotatedReportText?: string;
    ingestedArtifacts?: Array<{ name: string; type: string; content: string }>;
  };
}

export interface RegulationEntry {
  id: string;
  trackingId: string;
  title: string;
  agency: string;
  region: Region;
  country: string; 
  date: string;
  effectiveDate?: string;
  category: Category;
  summary: string;
  impact: ImpactLevel;
  status: 'Draft' | 'Final' | 'Consultation';
  content: string; 
  url?: string; 
}

export interface BuildRequirement {
  id: string;
  version: string;
  timestamp: number;
  prompt: string;
  status: 'Implemented' | 'Pending';
  scope: string[];
}

export interface AuditEntry {
  id: string;
  timestamp: number;
  action: string;
  user: string;
  module: AppTab;
  details: string;
}

export interface MonitoringReportLog {
  id: string;
  projectNumber: string;
  sponsor: string;
  visitDate: string;
  visitNumber: string;
  visitType: string;
  contentHtml: string;
  rawNotes: string;
}

export interface CROIntelligenceItem {
  cro: string;
  type: 'Win' | 'M&A' | 'Expansion' | 'Financial';
  title: string;
  summary: string;
  date: string;
  source: string;
  url: string;
}

export type AppTab = 'risk-management' | 'translation' | 'translation-metrics' | 'monitoring-report' | 'requirement-tracking' | 'chat' | 'dose-management' | 'agentic-monitoring' | 'competency-dashboard' | 'audit-log' | 'cra-management' | 'pricing-tool' | 'business-intelligence' | 'bio-analytical' | 'regulatory-intel' | 'cro-intelligence';

export type GenieDomain = 'SOP' | 'REG' | 'VEEVA' | 'CONTEXT' | 'AUDIT' | 'CRA' | 'PRICING';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  groundingMetadata?: any;
}

export interface GenieFeedback {
  id: string;
  rating: number;
  comment: string;
  timestamp: number;
  querySnippet?: string;
  topic?: string;
  responseSnippet?: string;
}

export interface BiocharacterizationResult {
  similarityScore: number;
  glycosylationIndex: number;
  aggregationRisk: 'Low' | 'Medium' | 'High';
  potencyPredicted: number;
  complianceAssessment: string;
  remediationSteps: string[];
  criticalDifferences: any[];
}

export interface NewsItem {
  title: string;
  url: string;
  summary: string;
  source: string;
  date: string;
  riskCategory?: 'GMP' | 'GCP' | 'PV' | 'CRA';
  severity?: RiskSeverity;
}

export interface TMFDocument {
  zone: string;
  documentName: string;
  description: string;
  mandatory: boolean;
  localRequirement?: string;
}

export interface GapAnalysisResult {
  complianceScore: number;
  executiveSummary: string;
  missingElements: Array<{
    requirement: string;
    gap: string;
    severity: string;
  }>;
  remediationPlan: Array<{
    priority: string;
    action: string;
    suggestedText?: string;
  }>;
}

export interface DatabaseFilters {
  region?: Region;
  category?: Category;
  impact?: ImpactLevel;
  searchQuery?: string;
}

export type SubTab = 'gemini' | 'chatgpt' | 'copilot';

export interface AnalysisResult {
  recommendation: string;
  predictedMTD: string;
  rationale: string;
  safetyWarnings: string[];
  nextSteps: string[];
}

/** 
 * PRICING TOOL TYPES
 */

export interface CostLineItem {
  id: string;
  category: string;
  description: string;
  driver: string;
  units: number;
  unitCost: number;
  totalCost: number;
  country?: string;
}

export interface FTEAllocation {
  country: string;
  role: string;
  allocation: number; 
  monthlyHours: number;
  totalHours: number;
}

export interface SUAItem {
  description: string;
  cost: number;
  deliverable: string;
}

export interface AlliancePartnerItem {
  partner: string;
  scope: string;
  budget: number;
  currency: string;
}

export interface Invoice {
  id: string;
  milestone: string;
  amount: number;
  status: 'Draft' | 'Sent' | 'Paid';
  dueDate: string;
  type: 'Milestone' | 'T&M Monthly' | 'Pass-through';
}

export interface LaborRateEntry {
  role: string;
  country: string;
  baseRate: number;
  inflationPercent: number;
  standardRate: number; // Derived: base * (1 + inflation/100)
  discountPercent: number;
  netRate: number; // Derived: standard * (1 - discount/100)
}

export interface BidHeader {
  bidId: string;
  bidGridVersion: string;
  paCo: string; 
  novotechNumber?: string;
  protocolNumber?: string;
  customerName?: string;
  indication?: string;
  compound?: string;
  phase: string;
  currency: string;
  ratesType?: string; 
  taxRebate?: boolean;
  biometricsPvgRates?: string; 
  sponsorRegion: string; 
  studyDesign: string;
  ipImportRequired: boolean;
  oncologyFlag: boolean;
  lowComplexityFlag: boolean;
  doseExpansionFlag: boolean;
  discountFlag: boolean;
  edcSystem: string;
  rtsmSystem: string;

  // --- Study Business Model ---
  isTmStudy: boolean; // Time and Materials flag
  inflationRateOverall: number;

  // --- Timeline ---
  projectStart?: string;
  projectEnd?: string;
  startupMths?: number;
  recruitmentMths?: number;
  treatmentMths?: number;
  followupMths?: number;
  closeoutMths?: number;
  totalDurationMths?: number;

  // --- Monitoring & RBQM Metrics ---
  rbqmComplexity?: 'Phase I HV' | 'Standard' | 'Onc/ High Complexity' | 'Vaccine';
  crfPagesPerSubject?: number;
  totalSubjects?: number;
  novotechSubjects?: number;
  crfPagesSdvdPerVisit?: number;
  sdvMinuteConsidered?: number;
  crfPagesCriticalPercent?: number;
  rangeCriticalData?: string;
  sdvRateCriticalData?: number;
  rangeSdvRate?: string;
  sdvRateNonCriticalData?: number;
  overallSdvRate?: number;
  
  sdvRate?: number; // Legacy field
  sdrRate?: number;
  studyType?: string;
  rbmCentralMonitoring?: boolean;

  // --- Medical Writing Details ---
  mwProtocolSynopsisFee?: number;
  mwProtocolWritingFee?: number;

  // --- Financial Sections ---
  feeMwStartup?: number;
  feeDdc?: number;
  feeRegEthics?: number;
  feeStartupActivities?: number;
  feeClinSiteMgmt?: number;
  feeStudyMgmt?: number;
  feeProtocolAmendments?: number;
  feeTransitionRescue?: number;
  feeDataMgmt?: number;
  feeBiostats?: number;
  feePv?: number;
  feeMedMonitoring?: number;
  feeQa?: number;
  feeCsr?: number;
  discountPercent?: number;
  feeLabDirect?: number;
  feeSystemsHosting?: number;
  feeEdcCost?: number;
  feeRbmHosting?: number;
  ptCostsGeneral?: number;
  ptInvestigatorFees?: number;
  ptPhase1UnitFees?: number;
  ptLabIndirectFees?: number;

  // --- Detailed Data ---
  costLineItems?: CostLineItem[];
  passThroughLineItems?: CostLineItem[];
  fteAllocations?: FTEAllocation[];
  suaDetails?: SUAItem[];
  alliancePartners?: AlliancePartnerItem[];
  invoices?: Invoice[];

  // --- Profitability ---
  overheadRate?: number;
  targetMargin?: number;

  createdAt: number;
  updatedAt: number;
  status: 'Draft' | 'Finalized' | 'Approved';
}

export interface BidCountryPlan {
  id: string;
  bidId: string;
  countryName: string;
  region: 'APAC' | 'NAM' | 'EUR' | 'CHN';
  regulatoryAffairs: boolean;
  clinicalOps: boolean;
  activeSites: number;
  patientNumbers: number;
  escalationSites: number;
  expansionSites: number;
  rescueSites: number;
}

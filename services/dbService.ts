
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { RegulationEntry, MonitoringReportLog, AuditEntry, IMVReport } from '../types';
import { INITIAL_REGULATIONS } from '../constants';

let db: any = null;
let isInitialized = false;

const initDB = () => {
  if (isInitialized) return db;
  
  // Safe environment variable check
  let configStr: string | undefined;
  try {
      configStr = (typeof process !== 'undefined' && process.env?.firebase_config) || localStorage.getItem('firebase_settings') || undefined;
  } catch (e) {
      configStr = undefined;
  }
  
  if (configStr) {
    try {
      const cleanConfig = configStr.replace(/^['"]|['"]$/g, '');
      const config = JSON.parse(cleanConfig);
      const app = initializeApp(config);
      db = getFirestore(app);
      isInitialized = true;
      console.log("🔥 Firebase Firestore Initialized");
    } catch (e) {
      console.error("Failed to initialize Firebase from config", e);
    }
  } else {
    console.warn("No Firebase config found. Falling back to local storage.");
  }
  return db;
};

// Generic Persistence Helper
const saveGeneric = async (collectionName: string, id: string, data: any) => {
    const database = initDB();
    try {
        const localKey = `local_${collectionName}`;
        const currentStr = localStorage.getItem(localKey);
        let current: any[] = currentStr ? JSON.parse(currentStr) : [];
        const index = current.findIndex(e => e.id === id);
        if (index >= 0) current[index] = data;
        else current = [data, ...current];
        localStorage.setItem(localKey, JSON.stringify(current));
    } catch (e) {
        console.error(`Local sync error: ${collectionName}`, e);
    }

    if (!database) return;
    try { await setDoc(doc(database, collectionName, id), data); } 
    catch (e) { console.error(`Remote sync error: ${collectionName}`, e); }
};

const getGeneric = async (collectionName: string, fallback: any[] = []): Promise<any[]> => {
    const database = initDB();
    const localKey = `local_${collectionName}`;
    if (!database) {
        const localData = localStorage.getItem(localKey);
        return localData ? JSON.parse(localData) : fallback;
    }
    try {
        const colRef = collection(database, collectionName);
        const snapshot = await getDocs(colRef);
        if (snapshot.empty) return fallback;
        return snapshot.docs.map(doc => doc.data());
    } catch (e) {
        const localData = localStorage.getItem(localKey);
        return localData ? JSON.parse(localData) : fallback;
    }
};

export const saveAuditEntry = (entry: AuditEntry) => saveGeneric('audit_logs', entry.id, entry);
export const getAuditLogs = (): Promise<AuditEntry[]> => getGeneric('audit_logs');
export const getAllRegulations = () => getGeneric('regulations', INITIAL_REGULATIONS);
export const saveRegulation = (entry: RegulationEntry) => saveGeneric('regulations', entry.id, entry);
export const updateRegulationInDb = (entry: RegulationEntry) => saveGeneric('regulations', entry.id, entry);
export const saveMonitoringReport = (report: MonitoringReportLog) => saveGeneric('monitoring_reports', report.id, report);
export const getAllMonitoringReports = (): Promise<MonitoringReportLog[]> => getGeneric('monitoring_reports');
export const saveIMVReport = (report: IMVReport) => saveGeneric('imv_reports', report.id, report);
export const getAllIMVReports = (): Promise<IMVReport[]> => getGeneric('imv_reports');

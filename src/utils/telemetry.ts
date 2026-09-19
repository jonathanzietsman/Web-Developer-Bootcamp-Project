// src/utils/telemetry.ts
export type TelemetryType = 'NAV' | 'CLICK' | 'API' | 'SYS';

export interface TelemetryLog {
  id: string;
  timestamp: string; // ISO string for reliable sorting and parsing
  type: TelemetryType;
  message: string;
}

const STORAGE_KEY = 'apex_telemetry_logs';
const MAX_LOGS = 100;

export function getStoredLogs(): TelemetryLog[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function pushTelemetry(type: TelemetryType, message: string): TelemetryLog[] {
  if (typeof window === 'undefined') return [];
  try {
    const logs = getStoredLogs();
    const newLog: TelemetryLog = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(), // Standardized ISO timestamp for sorting accuracy
      type,
      message,
    };
    
    const updated = [newLog, ...logs].slice(0, MAX_LOGS);
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    
    // Dispatch custom event to update active UI panels in real time
    window.dispatchEvent(new Event('apex_telemetry_update'));
    return updated;
  } catch {
    return getStoredLogs();
  }
}

export function clearTelemetry(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event('apex_telemetry_update'));
}
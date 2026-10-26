export * from './sexual';
export * from './urinary';
export * from './bowel';
export * from './notes';
export * from './customMetric';
export * from './customForm';

export type AppTab = 'sexual' | 'urinary' | 'bowel' | 'notes' | 'analytics' | 'customForms';

export interface AppSettings {
  privacyMode: boolean; // Blurs sensitive scores/entries on screen
  volumeUnit: 'mL' | 'oz';
  patientInitials?: string;
}

export type { DateRangeFilter } from '../utils/dateFilters';

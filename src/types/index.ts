export * from './sexual';
export * from './urinary';
export * from './bowel';
export * from './notes';
export * from './customMetric';
export * from './customForm';

export type AppTab = 'sexual' | 'urinary' | 'bowel' | 'notes' | 'analytics' | 'customForms';

export type AnatomyProfile = 'vulvovaginal' | 'phallic' | 'custom' | 'neutral';

export interface CustomAnatomyFeatures {
  trackErection: boolean;
  trackLubricationArousal: boolean;
  trackEjaculation: boolean;
  trackVaginalSplinting: boolean;
  trackPerinealSplinting: boolean;
  trackPostMicturitionDribble: boolean;
}

export interface AppSettings {
  privacyMode: boolean; // Blurs sensitive scores/entries on screen
  volumeUnit: 'mL' | 'oz';
  patientInitials?: string;
  onboardingCompleted?: boolean;
  anatomyProfile: AnatomyProfile;
  customAnatomy?: Partial<CustomAnatomyFeatures>;
}

export type { DateRangeFilter } from '../utils/dateFilters';

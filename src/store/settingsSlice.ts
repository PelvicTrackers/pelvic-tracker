import type { StateCreator } from 'zustand';
import type { AppSettings, AppTab, AnatomyProfile, CustomAnatomyFeatures } from '../types';
import { StorageService } from '../services/storage';

const DEFAULT_CUSTOM_ANATOMY: CustomAnatomyFeatures = {
  trackErection: true,
  trackLubricationArousal: true,
  trackEjaculation: true,
  trackVaginalSplinting: true,
  trackPerinealSplinting: true,
  trackPostMicturitionDribble: true
};

export interface SettingsSlice {
  activeTab: AppTab;
  privacyMode: boolean;
  volumeUnit: 'mL' | 'oz';
  patientInitials: string;
  onboardingCompleted: boolean;
  anatomyProfile: AnatomyProfile;
  customAnatomy: Partial<CustomAnatomyFeatures>;
  showPrivacyModal: boolean;
  showExportModal: boolean;
  showOnboardingModal: boolean;
  showSettingsModal: boolean;
  setActiveTab: (tab: AppTab) => void;
  togglePrivacyMode: () => void;
  setVolumeUnit: (unit: 'mL' | 'oz') => void;
  setPatientInitials: (initials: string) => void;
  setAnatomyProfile: (profile: AnatomyProfile, custom?: Partial<CustomAnatomyFeatures>) => void;
  completeOnboarding: (profile: AnatomyProfile, custom?: Partial<CustomAnatomyFeatures>) => void;
  setShowPrivacyModal: (show: boolean) => void;
  setShowExportModal: (show: boolean) => void;
  setShowOnboardingModal: (show: boolean) => void;
  setShowSettingsModal: (show: boolean) => void;
  loadSettings: () => Promise<void>;
}

export const createSettingsSlice: StateCreator<SettingsSlice, [], [], SettingsSlice> = (set, get) => ({
  activeTab: 'sexual',
  privacyMode: false,
  volumeUnit: 'mL',
  patientInitials: '',
  onboardingCompleted: false,
  anatomyProfile: 'neutral',
  customAnatomy: DEFAULT_CUSTOM_ANATOMY,
  showPrivacyModal: false,
  showExportModal: false,
  showOnboardingModal: false,
  showSettingsModal: false,

  setActiveTab: (tab) => set({ activeTab: tab }),

  togglePrivacyMode: () => {
    const nextVal = !get().privacyMode;
    set({ privacyMode: nextVal });
    const currentSettings: AppSettings = {
      privacyMode: nextVal,
      volumeUnit: get().volumeUnit,
      patientInitials: get().patientInitials,
      onboardingCompleted: get().onboardingCompleted,
      anatomyProfile: get().anatomyProfile,
      customAnatomy: get().customAnatomy
    };
    StorageService.saveSettings(currentSettings);
  },

  setVolumeUnit: (unit) => {
    set({ volumeUnit: unit });
    const currentSettings: AppSettings = {
      privacyMode: get().privacyMode,
      volumeUnit: unit,
      patientInitials: get().patientInitials,
      onboardingCompleted: get().onboardingCompleted,
      anatomyProfile: get().anatomyProfile,
      customAnatomy: get().customAnatomy
    };
    StorageService.saveSettings(currentSettings);
  },

  setPatientInitials: (initials) => {
    set({ patientInitials: initials });
    const currentSettings: AppSettings = {
      privacyMode: get().privacyMode,
      volumeUnit: get().volumeUnit,
      patientInitials: initials,
      onboardingCompleted: get().onboardingCompleted,
      anatomyProfile: get().anatomyProfile,
      customAnatomy: get().customAnatomy
    };
    StorageService.saveSettings(currentSettings);
  },

  setAnatomyProfile: (profile, custom) => {
    const customAnatomy = custom ?? get().customAnatomy;
    set({ anatomyProfile: profile, customAnatomy });
    const currentSettings: AppSettings = {
      privacyMode: get().privacyMode,
      volumeUnit: get().volumeUnit,
      patientInitials: get().patientInitials,
      onboardingCompleted: get().onboardingCompleted,
      anatomyProfile: profile,
      customAnatomy
    };
    StorageService.saveSettings(currentSettings);
  },

  completeOnboarding: (profile, custom) => {
    const customAnatomy = custom ?? get().customAnatomy;
    set({
      onboardingCompleted: true,
      anatomyProfile: profile,
      customAnatomy,
      showOnboardingModal: false
    });
    const currentSettings: AppSettings = {
      privacyMode: get().privacyMode,
      volumeUnit: get().volumeUnit,
      patientInitials: get().patientInitials,
      onboardingCompleted: true,
      anatomyProfile: profile,
      customAnatomy
    };
    StorageService.saveSettings(currentSettings);
  },

  setShowPrivacyModal: (show) => set({ showPrivacyModal: show }),

  setShowExportModal: (show) => set({ showExportModal: show }),

  setShowOnboardingModal: (show) => set({ showOnboardingModal: show }),

  setShowSettingsModal: (show) => set({ showSettingsModal: show }),

  loadSettings: async () => {
    const s = await StorageService.getSettings();
    set({
      privacyMode: s.privacyMode ?? false,
      volumeUnit: s.volumeUnit ?? 'mL',
      patientInitials: s.patientInitials ?? '',
      onboardingCompleted: Boolean(s.onboardingCompleted),
      anatomyProfile: s.anatomyProfile ?? 'neutral',
      customAnatomy: s.customAnatomy ?? DEFAULT_CUSTOM_ANATOMY,
      // If user hasn't finished onboarding on first launch, open onboarding guide
      showOnboardingModal: !s.onboardingCompleted
    });
  }
});

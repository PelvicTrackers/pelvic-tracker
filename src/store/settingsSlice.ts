import type { StateCreator } from 'zustand';
import type { AppSettings, AppTab } from '../types';
import { StorageService } from '../services/storage';

export interface SettingsSlice {
  activeTab: AppTab;
  privacyMode: boolean;
  volumeUnit: 'mL' | 'oz';
  patientInitials: string;
  showPrivacyModal: boolean;
  showExportModal: boolean;
  setActiveTab: (tab: AppTab) => void;
  togglePrivacyMode: () => void;
  setVolumeUnit: (unit: 'mL' | 'oz') => void;
  setPatientInitials: (initials: string) => void;
  setShowPrivacyModal: (show: boolean) => void;
  setShowExportModal: (show: boolean) => void;
  loadSettings: () => Promise<void>;
}

export const createSettingsSlice: StateCreator<SettingsSlice, [], [], SettingsSlice> = (set, get) => ({
  activeTab: 'sexual',
  privacyMode: false,
  volumeUnit: 'mL',
  patientInitials: '',
  showPrivacyModal: false,
  showExportModal: false,

  setActiveTab: (tab) => set({ activeTab: tab }),

  togglePrivacyMode: () => {
    const nextVal = !get().privacyMode;
    set({ privacyMode: nextVal });
    const currentSettings: AppSettings = {
      privacyMode: nextVal,
      volumeUnit: get().volumeUnit,
      patientInitials: get().patientInitials
    };
    StorageService.saveSettings(currentSettings);
  },

  setVolumeUnit: (unit) => {
    set({ volumeUnit: unit });
    const currentSettings: AppSettings = {
      privacyMode: get().privacyMode,
      volumeUnit: unit,
      patientInitials: get().patientInitials
    };
    StorageService.saveSettings(currentSettings);
  },

  setPatientInitials: (initials) => {
    set({ patientInitials: initials });
    const currentSettings: AppSettings = {
      privacyMode: get().privacyMode,
      volumeUnit: get().volumeUnit,
      patientInitials: initials
    };
    StorageService.saveSettings(currentSettings);
  },

  setShowPrivacyModal: (show) => set({ showPrivacyModal: show }),

  setShowExportModal: (show) => set({ showExportModal: show }),

  loadSettings: async () => {
    const s = await StorageService.getSettings();
    set({
      privacyMode: s.privacyMode ?? false,
      volumeUnit: s.volumeUnit ?? 'mL',
      patientInitials: s.patientInitials ?? ''
    });
  }
});

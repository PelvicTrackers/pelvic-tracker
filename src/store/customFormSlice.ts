import type { StateCreator } from 'zustand';
import type { CustomFormDefinition, CustomFormEntry } from '../types/customForm';
import { StorageService } from '../services/storage';
import { PREBUILT_CUSTOM_FORMS } from '../data/customFormTemplates';

export interface CustomFormSlice {
  customForms: CustomFormDefinition[];
  customEntries: CustomFormEntry[];
  activeFormId: string | null;
  isLoadingCustomForms: boolean;
  isShareModalOpen: boolean;
  sharingForm: CustomFormDefinition | null;
  shareModalMode: 'share' | 'import';

  loadCustomForms: () => Promise<void>;
  loadCustomEntries: () => Promise<void>;
  seedDefaultTemplatesIfEmpty: () => Promise<void>;
  saveCustomForm: (form: CustomFormDefinition) => Promise<void>;
  deleteCustomForm: (id: string) => Promise<void>;
  addCustomEntry: (entry: Omit<CustomFormEntry, 'id'>) => Promise<CustomFormEntry>;
  updateCustomEntry: (entry: CustomFormEntry) => Promise<void>;
  deleteCustomEntry: (id: string) => Promise<void>;
  setActiveFormId: (id: string | null) => void;
  openShareModal: (form?: CustomFormDefinition | null, mode?: 'share' | 'import') => void;
  closeShareModal: () => void;
}

export const createCustomFormSlice: StateCreator<CustomFormSlice, [], [], CustomFormSlice> = (set, get) => ({
  customForms: [],
  customEntries: [],
  activeFormId: null,
  isLoadingCustomForms: false,
  isShareModalOpen: false,
  sharingForm: null,
  shareModalMode: 'share',

  loadCustomForms: async () => {
    set({ isLoadingCustomForms: true });
    try {
      let forms = await StorageService.getAllCustomForms();
      // If patient has no forms yet, seed the prebuilt clinical templates
      if (forms.length === 0) {
        for (const tpl of PREBUILT_CUSTOM_FORMS) {
          await StorageService.saveCustomForm(tpl);
        }
        forms = await StorageService.getAllCustomForms();
      }
      set({
        customForms: forms,
        activeFormId: get().activeFormId ?? (forms.length > 0 ? forms[0].id : null),
        isLoadingCustomForms: false
      });
    } catch (e) {
      console.error('[customFormSlice] Failed to load forms', e);
      set({ isLoadingCustomForms: false });
    }
  },

  loadCustomEntries: async () => {
    try {
      const entries = await StorageService.getAllCustomFormEntries();
      entries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      set({ customEntries: entries });
    } catch (e) {
      console.error('[customFormSlice] Failed to load entries', e);
    }
  },

  seedDefaultTemplatesIfEmpty: async () => {
    const existing = await StorageService.getAllCustomForms();
    if (existing.length === 0) {
      for (const tpl of PREBUILT_CUSTOM_FORMS) {
        await StorageService.saveCustomForm(tpl);
      }
      const loaded = await StorageService.getAllCustomForms();
      set({ customForms: loaded, activeFormId: loaded[0]?.id ?? null });
    }
  },

  saveCustomForm: async (form) => {
    await StorageService.saveCustomForm(form);
    const existing = get().customForms;
    const idx = existing.findIndex((f) => f.id === form.id);
    let updated: CustomFormDefinition[];
    if (idx >= 0) {
      updated = [...existing];
      updated[idx] = form;
    } else {
      updated = [...existing, form];
    }
    set({ customForms: updated, activeFormId: form.id });
  },

  deleteCustomForm: async (id) => {
    await StorageService.deleteCustomForm(id);
    const updatedForms = get().customForms.filter((f) => f.id !== id);
    const updatedEntries = get().customEntries.filter((e) => e.formId !== id);
    set({
      customForms: updatedForms,
      customEntries: updatedEntries,
      activeFormId: get().activeFormId === id ? (updatedForms[0]?.id ?? null) : get().activeFormId
    });
  },

  addCustomEntry: async (entryData) => {
    const id = `cfe_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newEntry: CustomFormEntry = {
      ...entryData,
      id
    };
    await StorageService.saveCustomFormEntry(newEntry);
    const existing = get().customEntries;
    const updated = [newEntry, ...existing].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    set({ customEntries: updated });
    return newEntry;
  },

  updateCustomEntry: async (entry) => {
    await StorageService.saveCustomFormEntry(entry);
    const current = get().customEntries;
    const updated = current
      .map((item) => (item.id === entry.id ? entry : item))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    set({ customEntries: updated });
  },

  deleteCustomEntry: async (id) => {
    await StorageService.deleteCustomFormEntry(id);
    set({ customEntries: get().customEntries.filter((e) => e.id !== id) });
  },

  setActiveFormId: (id) => {
    set({ activeFormId: id });
  },

  openShareModal: (form = null, mode = 'share') => {
    set({
      isShareModalOpen: true,
      sharingForm: form ?? get().customForms.find((f) => f.id === get().activeFormId) ?? null,
      shareModalMode: mode
    });
  },

  closeShareModal: () => {
    set({ isShareModalOpen: false, sharingForm: null });
  }
});

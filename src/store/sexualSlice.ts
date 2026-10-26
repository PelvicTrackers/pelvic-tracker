import type { StateCreator } from 'zustand';
import type { SexualLogEntry } from '../types';
import { StorageService } from '../services/storage';

export interface SexualSlice {
  sexualEntries: SexualLogEntry[];
  isLoadingSexual: boolean;
  loadSexualEntries: () => Promise<void>;
  addSexualEntry: (entry: Omit<SexualLogEntry, 'id'>) => Promise<SexualLogEntry>;
  updateSexualEntry: (entry: SexualLogEntry) => Promise<void>;
  deleteSexualEntry: (id: string) => Promise<void>;
}

export const createSexualSlice: StateCreator<SexualSlice, [], [], SexualSlice> = (set, get) => ({
  sexualEntries: [],
  isLoadingSexual: false,

  loadSexualEntries: async () => {
    set({ isLoadingSexual: true });
    try {
      const items = await StorageService.getAllSexualEntries();
      // sort latest first
      items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      set({ sexualEntries: items, isLoadingSexual: false });
    } catch {
      set({ isLoadingSexual: false });
    }
  },

  addSexualEntry: async (entryData) => {
    const id = `sex_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newEntry: SexualLogEntry = {
      ...entryData,
      id,
      // Invariant: keep 0 and false explicit, preserve null for N/A
      painBefore: entryData.painBefore !== undefined ? entryData.painBefore : null,
      painDuring: entryData.painDuring !== undefined ? entryData.painDuring : null,
      painAfter: entryData.painAfter !== undefined ? entryData.painAfter : null,
      erectionArousalScore: entryData.erectionArousalScore !== undefined ? entryData.erectionArousalScore : null,
      pleasureScore: entryData.pleasureScore !== undefined ? entryData.pleasureScore : null,
      durationMinutes: entryData.durationMinutes !== undefined ? entryData.durationMinutes : null,
      metricComments: entryData.metricComments ?? {},
      customMetrics: entryData.customMetrics ?? []
    };
    await StorageService.saveSexualEntry(newEntry);
    const existing = get().sexualEntries;
    const updated = [newEntry, ...existing].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    set({ sexualEntries: updated });
    return newEntry;
  },

  updateSexualEntry: async (entry) => {
    await StorageService.saveSexualEntry(entry);
    const current = get().sexualEntries;
    const updated = current
      .map((item) => (item.id === entry.id ? entry : item))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    set({ sexualEntries: updated });
  },

  deleteSexualEntry: async (id) => {
    await StorageService.deleteSexualEntry(id);
    set({ sexualEntries: get().sexualEntries.filter((e) => e.id !== id) });
  }
});

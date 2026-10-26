import type { StateCreator } from 'zustand';
import type { BowelLogEntry } from '../types';
import { StorageService } from '../services/storage';

export interface BowelSlice {
  bowelEntries: BowelLogEntry[];
  isLoadingBowel: boolean;
  loadBowelEntries: () => Promise<void>;
  addBowelEntry: (entry: Omit<BowelLogEntry, 'id'>) => Promise<BowelLogEntry>;
  updateBowelEntry: (entry: BowelLogEntry) => Promise<void>;
  deleteBowelEntry: (id: string) => Promise<void>;
}

export const createBowelSlice: StateCreator<BowelSlice, [], [], BowelSlice> = (set, get) => ({
  bowelEntries: [],
  isLoadingBowel: false,

  loadBowelEntries: async () => {
    set({ isLoadingBowel: true });
    try {
      const items = await StorageService.getAllBowelEntries();
      items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      set({ bowelEntries: items, isLoadingBowel: false });
    } catch {
      set({ isLoadingBowel: false });
    }
  },

  addBowelEntry: async (entryData) => {
    const id = `bwl_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newEntry: BowelLogEntry = {
      ...entryData,
      id,
      bristolType: entryData.bristolType !== undefined ? entryData.bristolType : null,
      strainingLevel: entryData.strainingLevel !== undefined ? entryData.strainingLevel : null,
      evacuationCompleteness: entryData.evacuationCompleteness !== undefined ? entryData.evacuationCompleteness : null,
      urgencyLevel: entryData.urgencyLevel !== undefined ? entryData.urgencyLevel : null,
      accidentalLeakage: entryData.accidentalLeakage !== undefined ? entryData.accidentalLeakage : null,
      painBefore: entryData.painBefore !== undefined ? entryData.painBefore : null,
      painDuring: entryData.painDuring !== undefined ? entryData.painDuring : null,
      painAfter: entryData.painAfter !== undefined ? entryData.painAfter : null,
      metricComments: entryData.metricComments ?? {},
      customMetrics: entryData.customMetrics ?? []
    };
    await StorageService.saveBowelEntry(newEntry);
    const existing = get().bowelEntries;
    const updated = [newEntry, ...existing].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    set({ bowelEntries: updated });
    return newEntry;
  },

  updateBowelEntry: async (entry) => {
    await StorageService.saveBowelEntry(entry);
    const current = get().bowelEntries;
    const updated = current
      .map((item) => (item.id === entry.id ? entry : item))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    set({ bowelEntries: updated });
  },

  deleteBowelEntry: async (id) => {
    await StorageService.deleteBowelEntry(id);
    set({ bowelEntries: get().bowelEntries.filter((e) => e.id !== id) });
  }
});

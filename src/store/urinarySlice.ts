import type { StateCreator } from 'zustand';
import type { UrinaryLogEntry } from '../types';
import { StorageService } from '../services/storage';

export interface UrinarySlice {
  urinaryEntries: UrinaryLogEntry[];
  isLoadingUrinary: boolean;
  loadUrinaryEntries: () => Promise<void>;
  addUrinaryEntry: (entry: Omit<UrinaryLogEntry, 'id'>) => Promise<UrinaryLogEntry>;
  updateUrinaryEntry: (entry: UrinaryLogEntry) => Promise<void>;
  deleteUrinaryEntry: (id: string) => Promise<void>;
}

export const createUrinarySlice: StateCreator<UrinarySlice, [], [], UrinarySlice> = (set, get) => ({
  urinaryEntries: [],
  isLoadingUrinary: false,

  loadUrinaryEntries: async () => {
    set({ isLoadingUrinary: true });
    try {
      const items = await StorageService.getAllUrinaryEntries();
      items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      set({ urinaryEntries: items, isLoadingUrinary: false });
    } catch {
      set({ isLoadingUrinary: false });
    }
  },

  addUrinaryEntry: async (entryData) => {
    const id = `uri_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newEntry: UrinaryLogEntry = {
      ...entryData,
      id,
      eventType: entryData.eventType ?? 'void',
      fluidIntakeAmountMl: entryData.fluidIntakeAmountMl !== undefined ? entryData.fluidIntakeAmountMl : null,
      voidVolumeMl: entryData.voidVolumeMl !== undefined ? entryData.voidVolumeMl : null,
      urgencyLevel: entryData.urgencyLevel !== undefined ? entryData.urgencyLevel : null,
      metricComments: entryData.metricComments ?? {},
      customMetrics: entryData.customMetrics ?? []
    };
    await StorageService.saveUrinaryEntry(newEntry);
    const existing = get().urinaryEntries;
    const updated = [newEntry, ...existing].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    set({ urinaryEntries: updated });
    return newEntry;
  },

  updateUrinaryEntry: async (entry) => {
    await StorageService.saveUrinaryEntry(entry);
    const current = get().urinaryEntries;
    const updated = current
      .map((item) => (item.id === entry.id ? entry : item))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    set({ urinaryEntries: updated });
  },

  deleteUrinaryEntry: async (id) => {
    await StorageService.deleteUrinaryEntry(id);
    set({ urinaryEntries: get().urinaryEntries.filter((e) => e.id !== id) });
  }
});

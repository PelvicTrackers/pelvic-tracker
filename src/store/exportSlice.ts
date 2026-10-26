import type { StateCreator } from 'zustand';
import type { DateRangeFilter } from '../utils/dateFilters';

export interface ExportSlice {
  exportDateRange: DateRangeFilter;
  customStartDate: string;
  customEndDate: string;
  includeChartsInReport: boolean;
  setExportDateRange: (range: DateRangeFilter) => void;
  setCustomStartDate: (date: string) => void;
  setCustomEndDate: (date: string) => void;
  setIncludeChartsInReport: (include: boolean) => void;
  resetDateRange: () => void;
}

export const createExportSlice: StateCreator<ExportSlice, [], [], ExportSlice> = (set) => ({
  exportDateRange: 'all',
  customStartDate: '',
  customEndDate: '',
  includeChartsInReport: false,

  setExportDateRange: (range) => {
    set((state) => {
      // If switching to custom and dates are empty, initialize them sensibly
      if (range === 'custom') {
        const today = new Date().toISOString().slice(0, 10);
        const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
        return {
          exportDateRange: range,
          customStartDate: state.customStartDate || weekAgo,
          customEndDate: state.customEndDate || today
        };
      }
      return { exportDateRange: range };
    });
  },

  setCustomStartDate: (date) => set({ customStartDate: date }),

  setCustomEndDate: (date) => set({ customEndDate: date }),

  setIncludeChartsInReport: (include) => set({ includeChartsInReport: include }),

  resetDateRange: () =>
    set({
      exportDateRange: 'all',
      customStartDate: '',
      customEndDate: '',
      includeChartsInReport: false
    })
});

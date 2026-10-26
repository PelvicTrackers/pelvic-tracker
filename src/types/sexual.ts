import type { CustomMetricItem } from './customMetric';

export type SexualActivityType = 'M' | 'PVI' | 'RVI' | 'PAI' | 'RAI' | 'Other';

export type EjaculationType = 'N' | 'E' | 'D' | 'A' | 'P';

export interface SexualLogEntry {
  id: string;
  timestamp: string; // ISO string
  activity: SexualActivityType;
  position: string;
  durationMinutes: number | null;
  painBefore: number | null; // 0-10 NRS, or null if N/A
  painDuring: number | null; // 0-10 NRS, or null if N/A
  painAfter: number | null;  // 0-10 NRS, or null if N/A
  erectionArousalScore: number | null; // 0-100%, or null if N/A
  pleasureScore: number | null;        // 0-100%, or null if N/A
  ejaculation: EjaculationType;
  notes: string;
  metricComments?: Record<string, string>;
  customMetrics?: CustomMetricItem[];
}

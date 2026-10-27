import type { CustomMetricItem } from './customMetric';

export type BristolStoolType = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export type EvacuationCompleteness = 'complete' | 'incomplete';

export type BowelUrgencyLevel = 0 | 1 | 2 | 3;

export type AccidentalBowelLeakage = 'none' | 'gas' | 'soiling' | 'fecal_incontinence';

export type PosturalSplintingAssistance =
  | 'none'
  | 'squatty_potty'
  | 'manual_splinting'
  | 'perineal_splinting'
  | 'vaginal_splinting'
  | 'both';

export interface BowelLogEntry {
  id: string;
  timestamp: string; // ISO string
  bristolType: BristolStoolType | null;
  strainingLevel: number | null; // 0-10 or null if N/A
  evacuationCompleteness: EvacuationCompleteness | null;
  urgencyLevel: BowelUrgencyLevel | null; // 0-3 or null if N/A
  accidentalLeakage: AccidentalBowelLeakage | null;
  painBefore: number | null; // 0-10 NRS or null if N/A
  painDuring: number | null; // 0-10 NRS or null if N/A
  painAfter: number | null;  // 0-10 NRS or null if N/A
  posturalSplinting: PosturalSplintingAssistance;
  notes: string;
  metricComments?: Record<string, string>;
  customMetrics?: CustomMetricItem[];
}

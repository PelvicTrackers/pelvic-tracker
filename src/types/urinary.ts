import type { CustomMetricItem } from './customMetric';

export type FluidType = 'water' | 'caffeine' | 'alcohol' | 'carbonated' | 'tea' | 'other';

export type VoidVolumeDescriptor = 'Small' | 'Medium' | 'Large' | 'Measured';

export type VoidStreamCharacteristic = 'normal' | 'hesitant' | 'straining' | 'interrupted';

export type UrgencyLevel = 0 | 1 | 2 | 3;

export type LeakageType = 'none' | 'stress' | 'urge' | 'mixed' | 'continuous' | 'other';

export type LeakageAmount = 'none' | 'drops' | 'moderate' | 'soaked';

export type PadStatus = 'none' | 'dry' | 'damp' | 'wet' | 'replaced';

export type UrinaryEventType = 'void' | 'leakage' | 'combined';

export interface UrinaryLogEntry {
  id: string;
  timestamp: string; // ISO string
  eventType: 'void' | 'leakage' | 'combined';
  fluidIntakeAmountMl: number | null; // 0 if void-only entry, null if N/A
  fluidType: FluidType;
  voidVolumeType: VoidVolumeDescriptor;
  voidVolumeMl: number | null; // null if N/A or approximate descriptor used
  voidStream: VoidStreamCharacteristic;
  urgencyLevel: UrgencyLevel | null; // 0-3, or null if N/A
  leakageType: LeakageType;
  leakageAmount: LeakageAmount;
  leakageActivity: string;
  padUsage: PadStatus;
  notes: string;
  metricComments?: Record<string, string>;
  customMetrics?: CustomMetricItem[];
}

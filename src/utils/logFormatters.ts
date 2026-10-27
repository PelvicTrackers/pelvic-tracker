import {
  BRISTOL_STOOL_SCALE,
  SEXUAL_ACTIVITIES,
  URINARY_URGENCY_LEVELS,
  getClimaxOptions
} from '../data/clinicalScales';
import type {
  BristolStoolType,
  CustomMetricItem,
  EjaculationType,
  SexualActivityType,
  UrgencyLevel,
  AnatomyProfile
} from '../types';

export function getEjaculationName(ejac: EjaculationType, profile?: AnatomyProfile): string {
  const options = getClimaxOptions(profile);
  const match = options.find((e) => e.value === ejac);
  return match ? match.label : ejac;
}

export function formatDateTime(isoString: string): string {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return new Intl.DateTimeFormat(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(d);
  } catch {
    return isoString;
  }
}

export function formatDateOnly(isoString: string): string {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return new Intl.DateTimeFormat(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(d);
  } catch {
    return isoString;
  }
}

export function formatTimeOnly(isoString: string): string {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return new Intl.DateTimeFormat(undefined, {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(d);
  } catch {
    return isoString;
  }
}

export function toInputDateTimeLocal(isoString: string): string {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return new Date().toISOString().slice(0, 16);
    const offset = d.getTimezoneOffset();
    const local = new Date(d.getTime() - offset * 60000);
    return local.toISOString().slice(0, 16);
  } catch {
    return new Date().toISOString().slice(0, 16);
  }
}

export function fromInputDateTimeLocal(localString: string): string {
  try {
    const d = new Date(localString);
    if (isNaN(d.getTime())) return new Date().toISOString();
    return d.toISOString();
  } catch {
    return new Date().toISOString();
  }
}

export function getPainSeverityLabel(painScore: number | null): string {
  if (painScore === null) return 'N/A';
  if (painScore === 0) return 'No Pain';
  if (painScore <= 3) return 'Mild';
  if (painScore <= 6) return 'Moderate';
  return 'Severe';
}

export function getPainColor(painScore: number | null): string {
  if (painScore === null) return 'var(--text-muted, #9e9e9e)';
  if (painScore === 0) return 'var(--pain-0, #388E3C)';
  if (painScore <= 3) return 'var(--pain-mild, #8BC34A)';
  if (painScore <= 6) return 'var(--pain-mod, #FFA000)';
  if (painScore <= 8) return 'var(--pain-high, #F57C00)';
  return 'var(--pain-severe, #D32F2F)';
}

export function getSexualActivityName(activity: SexualActivityType): string {
  const match = SEXUAL_ACTIVITIES.find((a) => a.value === activity);
  return match ? `${match.value} (${match.fullTitle})` : activity;
}

export function getBristolDescription(type: BristolStoolType): string {
  const match = BRISTOL_STOOL_SCALE.find((b) => b.type === type);
  return match ? `${match.title} - ${match.description}` : `Type ${type}`;
}

export function getUrinaryUrgencyLabel(urgency: UrgencyLevel | null): string {
  if (urgency === null) return 'N/A';
  const match = URINARY_URGENCY_LEVELS.find((u) => u.value === urgency);
  return match ? match.label : `Level ${urgency}`;
}

export function formatVolume(ml: number | null, unit: 'mL' | 'oz'): string {
  if (ml === null) return 'N/A';
  if (unit === 'oz') {
    const oz = (ml * 0.033814).toFixed(1);
    return `${oz} oz`;
  }
  return `${ml} mL`;
}

export const CLINICAL_METRIC_LABELS: Record<string, string> = {
  // Sexual
  durationMinutes: 'Duration',
  painBefore: 'Pain Before',
  painDuring: 'Pain During',
  painAfter: 'Pain After',
  erectionArousalScore: 'Erection/Arousal',
  pleasureScore: 'Pleasure',
  ejaculation: 'Ejaculation',
  // Urinary
  fluidIntake: 'Fluid Intake',
  fluidIntakeAmountMl: 'Fluid Intake Amount',
  fluidType: 'Fluid Type',
  voidVolume: 'Void Volume',
  voidVolumeMl: 'Void Volume (mL)',
  voidStream: 'Void Stream',
  urgencyLevel: 'Urgency',
  leakageType: 'Leakage Type',
  leakageAmount: 'Leakage Amount',
  leakageActivity: 'Leak Activity',
  padUsage: 'Pad Status',
  // Bowel
  bristolType: 'Bristol Form',
  strainingLevel: 'Straining',
  evacuationCompleteness: 'Evacuation',
  accidentalLeakage: 'Leakage',
  posturalSplinting: 'Splinting'
};

export function formatCustomMetricValue(item: CustomMetricItem): string {
  if (item.isNA || item.value === null) {
    return 'N/A';
  }
  return item.scale === '1-10' ? `${item.value}/10` : `${item.value}%`;
}

export function formatCustomMetricSummary(item: CustomMetricItem): string {
  const val = formatCustomMetricValue(item);
  const comment = item.comment && item.comment.trim() ? ` (${item.comment.trim()})` : '';
  return `${item.name}: ${val}${comment}`;
}

export function formatMetricCommentSummary(key: string, comment: string): string {
  const label = CLINICAL_METRIC_LABELS[key] || key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase());
  return `${label}: ${comment.trim()}`;
}

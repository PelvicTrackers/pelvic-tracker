import type { SexualLogEntry, UrinaryLogEntry, BowelLogEntry } from '../types';

export type TrendPeriodDays = 7 | 14 | 30;

export interface MetricDelta {
  baselineAvg: number;
  currentAvg: number;
  delta: number; // current - baseline
  percentChange: number; // positive = increase, negative = decrease
  isImproved: boolean; // whether the direction of change represents clinical improvement
  baselineCount: number;
  currentCount: number;
}

export interface PainTrends {
  sexual: {
    painBefore: MetricDelta;
    painDuring: MetricDelta;
    painAfter: MetricDelta;
    overall: MetricDelta;
  };
  bowel: {
    painBefore: MetricDelta;
    painDuring: MetricDelta;
    painAfter: MetricDelta;
    overall: MetricDelta;
  };
}

export interface UrinaryTrends {
  voidsPerDay: MetricDelta;
  nocturiaPerDay: MetricDelta;
  leaksPerDay: MetricDelta;
  totalLeaks: {
    baseline: number;
    current: number;
    reductionRate: number; // e.g. 50% reduction
  };
  avgVoidVolumeMl: MetricDelta;
}

export interface BowelTrends {
  strainingLevel: MetricDelta; // 0-10
  bristolNormalizationRate: {
    baselinePercent: number; // % of BMs that were Bristol Type 3 or 4
    currentPercent: number;
    delta: number; // currentPercent - baselinePercent
    isImproved: boolean;
  };
}

export interface SexualFunctionTrends {
  arousalScore: MetricDelta; // 0-100%
  pleasureScore: MetricDelta; // 0-100%
}

export interface OverallSymptomTrends {
  periodDays: TrendPeriodDays;
  baselineStartDate: Date;
  baselineEndDate: Date;
  currentStartDate: Date;
  currentEndDate: Date;
  pain: PainTrends;
  urinary: UrinaryTrends;
  bowel: BowelTrends;
  sexualFunction: SexualFunctionTrends;
}

/**
 * Computes average of an array of numbers, returning 0 if empty.
 */
function computeAverage(nums: number[]): number {
  if (nums.length === 0) return 0;
  const sum = nums.reduce((acc, n) => acc + n, 0);
  return Number((sum / nums.length).toFixed(1));
}

/**
 * Calculates MetricDelta comparing baseline values against current period values.
 * lowerIsBetter: true for pain, leaks, straining; false for arousal, pleasure, normalization.
 */
function calculateDelta(
  baselineVals: number[],
  currentVals: number[],
  lowerIsBetter: boolean
): MetricDelta {
  const baselineAvg = computeAverage(baselineVals);
  const currentAvg = computeAverage(currentVals);
  const delta = Number((currentAvg - baselineAvg).toFixed(1));

  let percentChange = 0;
  if (baselineAvg > 0) {
    percentChange = Number((((currentAvg - baselineAvg) / baselineAvg) * 100).toFixed(1));
  } else if (currentAvg > 0) {
    percentChange = 100;
  }

  const isImproved = lowerIsBetter ? delta < 0 : delta > 0;

  return {
    baselineAvg,
    currentAvg,
    delta,
    percentChange,
    isImproved,
    baselineCount: baselineVals.length,
    currentCount: currentVals.length
  };
}

/**
 * Splits entries into baseline window and current window based on period in days.
 */
function splitByPeriod<T extends { timestamp: string }>(
  entries: T[],
  periodDays: TrendPeriodDays,
  referenceDate: Date = new Date()
): { baseline: T[]; current: T[]; baselineStart: Date; baselineEnd: Date; currentStart: Date; currentEnd: Date } {
  const ref = new Date(referenceDate);
  const msInDay = 86400000;

  const currentEnd = new Date(ref.getFullYear(), ref.getMonth(), ref.getDate(), 23, 59, 59, 999);
  const currentStart = new Date(currentEnd.getTime() - periodDays * msInDay + 1);

  const baselineEnd = new Date(currentStart.getTime() - 1);
  const baselineStart = new Date(baselineEnd.getTime() - periodDays * msInDay + 1);

  const current: T[] = [];
  const baseline: T[] = [];

  for (const item of entries) {
    if (!item.timestamp) continue;
    const t = new Date(item.timestamp).getTime();
    if (isNaN(t)) continue;

    if (t >= currentStart.getTime() && t <= currentEnd.getTime()) {
      current.push(item);
    } else if (t >= baselineStart.getTime() && t <= baselineEnd.getTime()) {
      baseline.push(item);
    }
  }

  // Fallback: If patient is relatively new and has zero baseline entries,
  // split available history chronologically (earliest half = baseline, latest half = current)
  if (baseline.length === 0 && current.length >= 4) {
    const sorted = [...current].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    const mid = Math.floor(sorted.length / 2);
    return {
      baseline: sorted.slice(0, mid),
      current: sorted.slice(mid),
      baselineStart,
      baselineEnd,
      currentStart,
      currentEnd
    };
  }

  return { baseline, current, baselineStart, baselineEnd, currentStart, currentEnd };
}

/**
 * Calculates complete symptom delta and trend metrics across all clinical domains.
 */
export function calculateSymptomTrends(data: {
  sexualEntries: SexualLogEntry[];
  urinaryEntries: UrinaryLogEntry[];
  bowelEntries: BowelLogEntry[];
  periodDays?: TrendPeriodDays;
  referenceDate?: Date;
}): OverallSymptomTrends {
  const periodDays = data.periodDays ?? 14;
  const refDate = data.referenceDate ?? new Date();

  const sexSplit = splitByPeriod(data.sexualEntries, periodDays, refDate);
  const uriSplit = splitByPeriod(data.urinaryEntries, periodDays, refDate);
  const bowelSplit = splitByPeriod(data.bowelEntries, periodDays, refDate);

  // 1. Sexual Pain & Function
  const sexPainBeforeB = sexSplit.baseline.map((e) => e.painBefore).filter((v): v is number => typeof v === 'number');
  const sexPainBeforeC = sexSplit.current.map((e) => e.painBefore).filter((v): v is number => typeof v === 'number');

  const sexPainDuringB = sexSplit.baseline.map((e) => e.painDuring).filter((v): v is number => typeof v === 'number');
  const sexPainDuringC = sexSplit.current.map((e) => e.painDuring).filter((v): v is number => typeof v === 'number');

  const sexPainAfterB = sexSplit.baseline.map((e) => e.painAfter).filter((v): v is number => typeof v === 'number');
  const sexPainAfterC = sexSplit.current.map((e) => e.painAfter).filter((v): v is number => typeof v === 'number');

  const sexAllPainB = [...sexPainBeforeB, ...sexPainDuringB, ...sexPainAfterB];
  const sexAllPainC = [...sexPainBeforeC, ...sexPainDuringC, ...sexPainAfterC];

  const arousalB = sexSplit.baseline.map((e) => e.erectionArousalScore).filter((v): v is number => typeof v === 'number');
  const arousalC = sexSplit.current.map((e) => e.erectionArousalScore).filter((v): v is number => typeof v === 'number');

  const pleasureB = sexSplit.baseline.map((e) => e.pleasureScore).filter((v): v is number => typeof v === 'number');
  const pleasureC = sexSplit.current.map((e) => e.pleasureScore).filter((v): v is number => typeof v === 'number');

  // 2. Bowel Pain & Stool Normalization
  const bwlPainBeforeB = bowelSplit.baseline.map((e) => e.painBefore).filter((v): v is number => typeof v === 'number');
  const bwlPainBeforeC = bowelSplit.current.map((e) => e.painBefore).filter((v): v is number => typeof v === 'number');

  const bwlPainDuringB = bowelSplit.baseline.map((e) => e.painDuring).filter((v): v is number => typeof v === 'number');
  const bwlPainDuringC = bowelSplit.current.map((e) => e.painDuring).filter((v): v is number => typeof v === 'number');

  const bwlPainAfterB = bowelSplit.baseline.map((e) => e.painAfter).filter((v): v is number => typeof v === 'number');
  const bwlPainAfterC = bowelSplit.current.map((e) => e.painAfter).filter((v): v is number => typeof v === 'number');

  const bwlAllPainB = [...bwlPainBeforeB, ...bwlPainDuringB, ...bwlPainAfterB];
  const bwlAllPainC = [...bwlPainBeforeC, ...bwlPainDuringC, ...bwlPainAfterC];

  const strainingB = bowelSplit.baseline.map((e) => e.strainingLevel).filter((v): v is number => typeof v === 'number');
  const strainingC = bowelSplit.current.map((e) => e.strainingLevel).filter((v): v is number => typeof v === 'number');

  // Normal stool is Bristol type 3 or 4
  const normalBMsBaseline = bowelSplit.baseline.filter((e) => e.bristolType === 3 || e.bristolType === 4).length;
  const normalBMsCurrent = bowelSplit.current.filter((e) => e.bristolType === 3 || e.bristolType === 4).length;
  const bristolNormBaselinePct = bowelSplit.baseline.length > 0 ? Number(((normalBMsBaseline / bowelSplit.baseline.length) * 100).toFixed(1)) : 0;
  const bristolNormCurrentPct = bowelSplit.current.length > 0 ? Number(((normalBMsCurrent / bowelSplit.current.length) * 100).toFixed(1)) : 0;
  const bristolNormDelta = Number((bristolNormCurrentPct - bristolNormBaselinePct).toFixed(1));

  // 3. Urinary & Leak Metrics
  const uriVoidsBaseline = uriSplit.baseline.filter((u) => u.eventType === 'void' || u.eventType === 'combined');
  const uriVoidsCurrent = uriSplit.current.filter((u) => u.eventType === 'void' || u.eventType === 'combined');

  const uriLeaksBaseline = uriSplit.baseline.filter(
    (u) => (u.eventType === 'leakage' || u.eventType === 'combined') && u.leakageAmount !== 'none'
  ).length;
  const uriLeaksCurrent = uriSplit.current.filter(
    (u) => (u.eventType === 'leakage' || u.eventType === 'combined') && u.leakageAmount !== 'none'
  ).length;

  const voidsPerDayB = Number((uriVoidsBaseline.length / periodDays).toFixed(1));
  const voidsPerDayC = Number((uriVoidsCurrent.length / periodDays).toFixed(1));
  const leaksPerDayB = Number((uriLeaksBaseline / periodDays).toFixed(1));
  const leaksPerDayC = Number((uriLeaksCurrent / periodDays).toFixed(1));

  let leakReductionRate = 0;
  if (uriLeaksBaseline > 0) {
    leakReductionRate = Number((((uriLeaksBaseline - uriLeaksCurrent) / uriLeaksBaseline) * 100).toFixed(1));
  } else if (uriLeaksCurrent === 0) {
    leakReductionRate = 0;
  } else {
    leakReductionRate = -100;
  }

  const voidVolB = uriSplit.baseline.map((u) => u.voidVolumeMl).filter((v): v is number => typeof v === 'number');
  const voidVolC = uriSplit.current.map((u) => u.voidVolumeMl).filter((v): v is number => typeof v === 'number');

  // Nocturia voids (between 22:00 and 05:59)
  const isNight = (iso: string) => {
    const h = new Date(iso).getHours();
    return h >= 22 || h < 6;
  };
  const nocturiaB = uriVoidsBaseline.filter((u) => isNight(u.timestamp)).length;
  const nocturiaC = uriVoidsCurrent.filter((u) => isNight(u.timestamp)).length;
  const nocturiaPerDayB = Number((nocturiaB / periodDays).toFixed(1));
  const nocturiaPerDayC = Number((nocturiaC / periodDays).toFixed(1));

  return {
    periodDays,
    baselineStartDate: sexSplit.baselineStart,
    baselineEndDate: sexSplit.baselineEnd,
    currentStartDate: sexSplit.currentStart,
    currentEndDate: sexSplit.currentEnd,
    pain: {
      sexual: {
        painBefore: calculateDelta(sexPainBeforeB, sexPainBeforeC, true),
        painDuring: calculateDelta(sexPainDuringB, sexPainDuringC, true),
        painAfter: calculateDelta(sexPainAfterB, sexPainAfterC, true),
        overall: calculateDelta(sexAllPainB, sexAllPainC, true)
      },
      bowel: {
        painBefore: calculateDelta(bwlPainBeforeB, bwlPainBeforeC, true),
        painDuring: calculateDelta(bwlPainDuringB, bwlPainDuringC, true),
        painAfter: calculateDelta(bwlPainAfterB, bwlPainAfterC, true),
        overall: calculateDelta(bwlAllPainB, bwlAllPainC, true)
      }
    },
    urinary: {
      voidsPerDay: {
        baselineAvg: voidsPerDayB,
        currentAvg: voidsPerDayC,
        delta: Number((voidsPerDayC - voidsPerDayB).toFixed(1)),
        percentChange: voidsPerDayB > 0 ? Number((((voidsPerDayC - voidsPerDayB) / voidsPerDayB) * 100).toFixed(1)) : 0,
        isImproved: voidsPerDayC < voidsPerDayB,
        baselineCount: uriVoidsBaseline.length,
        currentCount: uriVoidsCurrent.length
      },
      nocturiaPerDay: {
        baselineAvg: nocturiaPerDayB,
        currentAvg: nocturiaPerDayC,
        delta: Number((nocturiaPerDayC - nocturiaPerDayB).toFixed(1)),
        percentChange: nocturiaPerDayB > 0 ? Number((((nocturiaPerDayC - nocturiaPerDayB) / nocturiaPerDayB) * 100).toFixed(1)) : 0,
        isImproved: nocturiaPerDayC < nocturiaPerDayB,
        baselineCount: nocturiaB,
        currentCount: nocturiaC
      },
      leaksPerDay: {
        baselineAvg: leaksPerDayB,
        currentAvg: leaksPerDayC,
        delta: Number((leaksPerDayC - leaksPerDayB).toFixed(1)),
        percentChange: leaksPerDayB > 0 ? Number((((leaksPerDayC - leaksPerDayB) / leaksPerDayB) * 100).toFixed(1)) : 0,
        isImproved: leaksPerDayC < leaksPerDayB,
        baselineCount: uriLeaksBaseline,
        currentCount: uriLeaksCurrent
      },
      totalLeaks: {
        baseline: uriLeaksBaseline,
        current: uriLeaksCurrent,
        reductionRate: leakReductionRate
      },
      avgVoidVolumeMl: calculateDelta(voidVolB, voidVolC, false)
    },
    bowel: {
      strainingLevel: calculateDelta(strainingB, strainingC, true),
      bristolNormalizationRate: {
        baselinePercent: bristolNormBaselinePct,
        currentPercent: bristolNormCurrentPct,
        delta: bristolNormDelta,
        isImproved: bristolNormDelta > 0
      }
    },
    sexualFunction: {
      arousalScore: calculateDelta(arousalB, arousalC, false),
      pleasureScore: calculateDelta(pleasureB, pleasureC, false)
    }
  };
}

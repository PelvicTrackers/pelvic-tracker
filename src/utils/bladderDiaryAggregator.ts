import type { UrinaryLogEntry } from '../types';

export interface BladderTimelineItem {
  id: string;
  timestamp: string;
  timeFormatted: string;
  isNight: boolean; // Between 22:00 and 05:59 (nocturia hours)
  eventType: 'void' | 'leakage' | 'combined';
  fluidIntakeAmountMl: number | null;
  fluidType: string;
  voidVolumeMl: number | null;
  voidVolumeType: string;
  voidStream: string;
  urgencyLevel: number | null;
  leakageType: string;
  leakageAmount: string;
  leakageActivity: string;
  padUsage: string;
  notes: string;
}

export interface DailyBladderSummary {
  dayIndex: number; // 1, 2, 3...
  dateKey: string; // YYYY-MM-DD representing the cycle anchor
  dateLabel: string; // e.g. "Sat, Oct 24, 2026"
  periodLabel: string; // e.g. "06:00 (Oct 24) – 05:59 (Oct 25)"
  cycleStartIso: string;
  cycleEndIso: string;
  totalIntakeMl: number;
  totalVoidOutputMl: number;
  measuredVoidCount: number;
  estimatedVoidCount: number;
  totalVoidCount: number;
  daytimeVoidCount: number; // 06:00 – 21:59
  nocturiaVoidCount: number; // 22:00 – 05:59
  leakageEpisodeCount: number;
  fluidBalanceDeltaMl: number; // intake - output
  entries: UrinaryLogEntry[];
  timeline: BladderTimelineItem[];
}

export interface BladderDiaryAggregation {
  cycleStartHour: number; // 6 or 0
  days: DailyBladderSummary[];
  totalDays: number;
  overallStats: {
    totalIntakeMl: number;
    totalVoidOutputMl: number;
    totalVoids: number;
    totalDaytimeVoids: number;
    totalNocturiaVoids: number;
    totalLeaks: number;
    avgDailyIntakeMl: number;
    avgDailyVoidOutputMl: number;
    avgDaytimeVoids: number;
    avgNocturiaVoids: number;
    overallBalanceMl: number;
  };
}

/**
 * Determines whether a given Date object falls within sleeping/nocturia hours (22:00 to 05:59).
 */
export function isNocturiaHour(date: Date): boolean {
  const hour = date.getHours();
  return hour >= 22 || hour < 6;
}

/**
 * Formats a Date to 12-hour time (e.g. "9:15 AM").
 */
function formatTime(d: Date): string {
  return new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }).format(d);
}

/**
 * Formats a Date to day and date (e.g. "Sat, Oct 24, 2026").
 */
function formatDate(d: Date): string {
  return new Intl.DateTimeFormat(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(d);
}

/**
 * Calculates the cycle start Date for a given timestamp based on cycleStartHour (e.g. 6:00 AM).
 * Events occurring between 00:00 and 05:59 when cycleStartHour=6 belong to the previous day's cycle.
 */
export function getCycleStartDate(date: Date, cycleStartHour: number): Date {
  const y = date.getFullYear();
  const m = date.getMonth();
  const d = date.getDate();
  const h = date.getHours();

  if (h < cycleStartHour) {
    // Falls into the cycle that started on the previous calendar day
    return new Date(y, m, d - 1, cycleStartHour, 0, 0, 0);
  }
  return new Date(y, m, d, cycleStartHour, 0, 0, 0);
}

/**
 * Pure aggregation engine: groups urinary entries into 24-hour clinical cycles
 * and calculates daily intake, void output, daytime vs nocturia frequency, and fluid balance.
 */
export function aggregateBladderDiary(
  entries: UrinaryLogEntry[],
  cycleStartHour: number = 6
): BladderDiaryAggregation {
  if (entries.length === 0) {
    return {
      cycleStartHour,
      days: [],
      totalDays: 0,
      overallStats: {
        totalIntakeMl: 0,
        totalVoidOutputMl: 0,
        totalVoids: 0,
        totalDaytimeVoids: 0,
        totalNocturiaVoids: 0,
        totalLeaks: 0,
        avgDailyIntakeMl: 0,
        avgDailyVoidOutputMl: 0,
        avgDaytimeVoids: 0,
        avgNocturiaVoids: 0,
        overallBalanceMl: 0
      }
    };
  }

  // Sort ascending by timestamp
  const sorted = [...entries].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  // Group by cycle anchor key (local YYYY-MM-DD of cycle start)
  const cycleGroups = new Map<string, { start: Date; entries: UrinaryLogEntry[] }>();

  for (const entry of sorted) {
    const entryDate = new Date(entry.timestamp);
    if (isNaN(entryDate.getTime())) continue;

    const cycleStart = getCycleStartDate(entryDate, cycleStartHour);
    const y = cycleStart.getFullYear();
    const m = String(cycleStart.getMonth() + 1).padStart(2, '0');
    const d = String(cycleStart.getDate()).padStart(2, '0');
    const key = `${y}-${m}-${d}`;

    if (!cycleGroups.has(key)) {
      cycleGroups.set(key, { start: cycleStart, entries: [] });
    }
    cycleGroups.get(key)!.entries.push(entry);
  }

  // Transform each cycle into a DailyBladderSummary
  const days: DailyBladderSummary[] = [];
  let dayCounter = 1;

  for (const [key, group] of cycleGroups.entries()) {
    const cycleStart = group.start;
    const cycleEnd = new Date(cycleStart.getTime() + 24 * 60 * 60 * 1000 - 1); // 23:59:59.999 after start

    let totalIntakeMl = 0;
    let totalVoidOutputMl = 0;
    let measuredVoidCount = 0;
    let estimatedVoidCount = 0;
    let daytimeVoidCount = 0;
    let nocturiaVoidCount = 0;
    let leakageEpisodeCount = 0;

    const timeline: BladderTimelineItem[] = [];

    for (const item of group.entries) {
      const d = new Date(item.timestamp);
      const isNight = isNocturiaHour(d);

      // Intake (respecting 0 as valid clinical number)
      if (typeof item.fluidIntakeAmountMl === 'number' && item.fluidIntakeAmountMl >= 0) {
        totalIntakeMl += item.fluidIntakeAmountMl;
      }

      // Voids
      const isVoidEvent =
        item.eventType === 'void' ||
        item.eventType === 'combined' ||
        (!item.eventType && (item.voidVolumeType || typeof item.voidVolumeMl === 'number'));

      if (isVoidEvent) {
        const hasMeasuredMl = typeof item.voidVolumeMl === 'number' && item.voidVolumeMl >= 0;
        if (hasMeasuredMl) {
          totalVoidOutputMl += item.voidVolumeMl as number;
        }

        if (item.voidVolumeType === 'Measured' || hasMeasuredMl) {
          measuredVoidCount++;
        } else {
          estimatedVoidCount++;
        }

        if (isNight) {
          nocturiaVoidCount++;
        } else {
          daytimeVoidCount++;
        }
      }

      // Leaks: checking eventType === 'leakage' | 'combined' and leakageAmount !== 'none'
      const isLeakEvent =
        (item.eventType === 'leakage' || item.eventType === 'combined')
          ? item.leakageAmount !== 'none'
          : Boolean(item.leakageAmount && item.leakageAmount !== 'none');

      if (isLeakEvent) {
        leakageEpisodeCount++;
      }

      timeline.push({
        id: item.id,
        timestamp: item.timestamp,
        timeFormatted: formatTime(d),
        isNight,
        eventType: item.eventType || (isLeakEvent && isVoidEvent ? 'combined' : isLeakEvent ? 'leakage' : 'void'),
        fluidIntakeAmountMl: typeof item.fluidIntakeAmountMl === 'number' ? item.fluidIntakeAmountMl : null,
        fluidType: item.fluidType || 'water',
        voidVolumeMl: typeof item.voidVolumeMl === 'number' ? item.voidVolumeMl : null,
        voidVolumeType: item.voidVolumeType || 'Medium',
        voidStream: item.voidStream || 'normal',
        urgencyLevel: typeof item.urgencyLevel === 'number' ? item.urgencyLevel : null,
        leakageType: item.leakageType || 'none',
        leakageAmount: item.leakageAmount || 'none',
        leakageActivity: item.leakageActivity || '',
        padUsage: item.padUsage || 'none',
        notes: item.notes || ''
      });
    }

    const totalVoidCount = daytimeVoidCount + nocturiaVoidCount;
    const fluidBalanceDeltaMl = totalIntakeMl - totalVoidOutputMl;

    const startMonthDay = cycleStart.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    const endMonthDay = cycleEnd.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    const startFormatted = `${formatTime(cycleStart)} (${startMonthDay})`;
    const endFormatted = `${formatTime(cycleEnd)} (${endMonthDay})`;

    days.push({
      dayIndex: dayCounter++,
      dateKey: key,
      dateLabel: formatDate(cycleStart),
      periodLabel: `${startFormatted} – ${endFormatted}`,
      cycleStartIso: cycleStart.toISOString(),
      cycleEndIso: cycleEnd.toISOString(),
      totalIntakeMl,
      totalVoidOutputMl,
      measuredVoidCount,
      estimatedVoidCount,
      totalVoidCount,
      daytimeVoidCount,
      nocturiaVoidCount,
      leakageEpisodeCount,
      fluidBalanceDeltaMl,
      entries: group.entries,
      timeline
    });
  }

  // Calculate overall stats
  const totalDays = days.length;
  const totalIntakeMl = days.reduce((sum, d) => sum + d.totalIntakeMl, 0);
  const totalVoidOutputMl = days.reduce((sum, d) => sum + d.totalVoidOutputMl, 0);
  const totalVoids = days.reduce((sum, d) => sum + d.totalVoidCount, 0);
  const totalDaytimeVoids = days.reduce((sum, d) => sum + d.daytimeVoidCount, 0);
  const totalNocturiaVoids = days.reduce((sum, d) => sum + d.nocturiaVoidCount, 0);
  const totalLeaks = days.reduce((sum, d) => sum + d.leakageEpisodeCount, 0);

  const avgDailyIntakeMl = totalDays > 0 ? Math.round(totalIntakeMl / totalDays) : 0;
  const avgDailyVoidOutputMl = totalDays > 0 ? Math.round(totalVoidOutputMl / totalDays) : 0;
  const avgDaytimeVoids = totalDays > 0 ? Number((totalDaytimeVoids / totalDays).toFixed(1)) : 0;
  const avgNocturiaVoids = totalDays > 0 ? Number((totalNocturiaVoids / totalDays).toFixed(1)) : 0;
  const overallBalanceMl = totalIntakeMl - totalVoidOutputMl;

  return {
    cycleStartHour,
    days,
    totalDays,
    overallStats: {
      totalIntakeMl,
      totalVoidOutputMl,
      totalVoids,
      totalDaytimeVoids,
      totalNocturiaVoids,
      totalLeaks,
      avgDailyIntakeMl,
      avgDailyVoidOutputMl,
      avgDaytimeVoids,
      avgNocturiaVoids,
      overallBalanceMl
    }
  };
}

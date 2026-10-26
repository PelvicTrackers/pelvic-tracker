export type DateRangeFilter = 'all' | '3days' | '7days' | '14days' | '30days' | 'custom';

export interface DateRangePresetOption {
  value: DateRangeFilter;
  label: string;
  description?: string;
}

export const DATE_RANGE_PRESETS: readonly DateRangePresetOption[] = [
  { value: 'all', label: 'All Time', description: 'Complete recorded clinical history' },
  { value: '3days', label: '3-Day Diary', description: 'Standard clinical 72-hour bladder/bowel log' },
  { value: '7days', label: 'Last 7 Days', description: 'Past 1-week pelvic symptom summary' },
  { value: '14days', label: 'Last 14 Days', description: 'Past 2-week PT appointment interval' },
  { value: '30days', label: 'Last 30 Days', description: 'Past 1-month clinical baseline' },
  { value: 'custom', label: 'Custom Range', description: 'Specific start and end dates' }
];

export interface DateRangeBounds {
  start: Date | null;
  end: Date | null;
}

/**
 * Computes exact Date objects for local day boundaries (start of first day 00:00:00.000 to
 * end of last day 23:59:59.999) to avoid off-by-one errors across timezones.
 */
export function getDateRangeBounds(
  range: DateRangeFilter,
  customStart?: string,
  customEnd?: string,
  referenceDate: Date = new Date()
): DateRangeBounds {
  const ref = new Date(referenceDate);

  if (range === 'all') {
    return { start: null, end: null };
  }

  // Preset days calculation: includes today and preceding (N-1) calendar days
  if (range === '3days' || range === '7days' || range === '14days' || range === '30days') {
    const dayCount = range === '3days' ? 3 : range === '7days' ? 7 : range === '14days' ? 14 : 30;
    const end = new Date(ref.getFullYear(), ref.getMonth(), ref.getDate(), 23, 59, 59, 999);
    const start = new Date(ref.getFullYear(), ref.getMonth(), ref.getDate() - (dayCount - 1), 0, 0, 0, 0);
    return { start, end };
  }

  // Custom date range
  let start: Date | null = null;
  let end: Date | null = null;

  if (customStart && customStart.trim().length > 0) {
    if (customStart.includes('T')) {
      const parsed = new Date(customStart);
      if (!isNaN(parsed.getTime())) {
        start = parsed;
      }
    } else {
      const [y, m, d] = customStart.split('-').map(Number);
      if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
        start = new Date(y, m - 1, d, 0, 0, 0, 0);
      }
    }
  }

  if (customEnd && customEnd.trim().length > 0) {
    if (customEnd.includes('T')) {
      const parsed = new Date(customEnd);
      if (!isNaN(parsed.getTime())) {
        end = parsed;
      }
    } else {
      const [y, m, d] = customEnd.split('-').map(Number);
      if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
        end = new Date(y, m - 1, d, 23, 59, 59, 999);
      }
    }
  }

  return { start, end };
}

/**
 * Filters any list of entities possessing a `timestamp: string` (ISO format)
 * using local day boundary timestamps.
 */
export function filterEntriesByDateRange<T extends { timestamp: string }>(
  entries: T[],
  range: DateRangeFilter,
  customStart?: string,
  customEnd?: string
): T[] {
  if (range === 'all') {
    return entries;
  }

  const { start, end } = getDateRangeBounds(range, customStart, customEnd);

  if (!start && !end) {
    return entries;
  }

  const startTime = start ? start.getTime() : null;
  const endTime = end ? end.getTime() : null;

  return entries.filter((entry) => {
    if (!entry.timestamp) return false;
    const time = new Date(entry.timestamp).getTime();
    if (isNaN(time)) return false;

    if (startTime !== null && time < startTime) {
      return false;
    }
    if (endTime !== null && time > endTime) {
      return false;
    }
    return true;
  });
}

function formatLocalDate(d: Date): string {
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(d);
}

/**
 * Returns a human-readable summary label of the active date filter for reports.
 */
export function formatDateRangeLabel(
  range: DateRangeFilter,
  customStart?: string,
  customEnd?: string,
  referenceDate: Date = new Date()
): string {
  if (range === 'all') {
    return 'All Time (Complete History)';
  }

  const bounds = getDateRangeBounds(range, customStart, customEnd, referenceDate);

  if (range === 'custom') {
    if (bounds.start && bounds.end) {
      return `Custom Range: ${formatLocalDate(bounds.start)} – ${formatLocalDate(bounds.end)}`;
    }
    if (bounds.start) {
      return `Custom Range: From ${formatLocalDate(bounds.start)}`;
    }
    if (bounds.end) {
      return `Custom Range: Until ${formatLocalDate(bounds.end)}`;
    }
    return 'Custom Range (All Dates)';
  }

  const preset = DATE_RANGE_PRESETS.find((p) => p.value === range);
  const title = preset ? preset.label : range;

  if (bounds.start && bounds.end) {
    return `${title} (${formatLocalDate(bounds.start)} – ${formatLocalDate(bounds.end)})`;
  }

  return title;
}

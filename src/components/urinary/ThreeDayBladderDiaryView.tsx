import React, { useState, useMemo } from 'react';
import { Calendar, Droplets, Plus } from 'lucide-react';
import type { UrinaryLogEntry } from '../../types';
import { useLogStore } from '../../store/useLogStore';
import { aggregateBladderDiary } from '../../utils/bladderDiaryAggregator';
import { formatVolume } from '../../utils/logFormatters';
import { BladderDaySummaryCard } from './BladderDaySummaryCard';

interface ThreeDayBladderDiaryViewProps {
  entries: UrinaryLogEntry[];
  onOpenNew?: () => void;
}

export const ThreeDayBladderDiaryView: React.FC<ThreeDayBladderDiaryViewProps> = ({
  entries,
  onOpenNew
}) => {
  const volumeUnit = useLogStore((s) => s.volumeUnit);
  const [cycleStartHour, setCycleStartHour] = useState<number>(6);
  const [expandedDays, setExpandedDays] = useState<Record<number, boolean>>({
    1: true // Expand the first day by default
  });

  const aggregation = useMemo(() => {
    return aggregateBladderDiary(entries, cycleStartHour);
  }, [entries, cycleStartHour]);

  const toggleDayExpanded = (dayIndex: number) => {
    setExpandedDays((prev) => ({
      ...prev,
      [dayIndex]: !prev[dayIndex]
    }));
  };

  if (entries.length === 0) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: '48px 20px',
          backgroundColor: 'var(--card-surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px dashed var(--card-border)'
        }}
      >
        <Droplets size={44} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
        <h3 style={{ fontSize: '1.1rem', marginBottom: '6px' }}>No Bladder Diary Entries</h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '380px', margin: '0 auto 18px' }}>
          Record your voids, fluid intake, and any leakage episodes over 3 consecutive days to create a clinical frequency-volume bladder chart for your physical therapist.
        </p>
        {onOpenNew && (
          <button type="button" className="btn-primary" onClick={onOpenNew}>
            <Plus size={16} /> Log First Event
          </button>
        )}
      </div>
    );
  }

  const { overallStats, days } = aggregation;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Diary Header & Cycle Config Controls */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '10px',
          padding: '12px 14px',
          backgroundColor: 'var(--card-surface)',
          border: '1px solid var(--card-border)',
          borderRadius: 'var(--radius-md)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Calendar size={18} color="var(--accent-clinical)" />
          <div>
            <strong style={{ fontSize: '0.92rem' }}>Clinical Frequency-Volume Chart</strong>
            <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Tracking {days.length} clinical 24-hr day{days.length === 1 ? '' : 's'} ({entries.length} total events)
            </span>
          </div>
        </div>

        {/* 24-hr Cycle Start Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label htmlFor="cycle-start-select" style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            Day Cycle Start:
          </label>
          <select
            id="cycle-start-select"
            className="form-input"
            value={cycleStartHour}
            onChange={(e) => setCycleStartHour(Number(e.target.value))}
            style={{ minHeight: '34px', padding: '4px 8px', fontSize: '0.8rem', width: 'auto' }}
          >
            <option value={6}>06:00 AM (Clinical Standard)</option>
            <option value={0}>12:00 AM (Midnight Calendar)</option>
          </select>
        </div>
      </div>

      {/* Overall 3-Day Diary Summary Metrics */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: '10px'
        }}
      >
        <div className="entry-card" style={{ padding: '10px 12px', margin: 0 }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Avg Daily Intake</span>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent-secondary)' }}>
            {formatVolume(overallStats.avgDailyIntakeMl, volumeUnit)}
          </div>
        </div>

        <div className="entry-card" style={{ padding: '10px 12px', margin: 0 }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Avg Daily Output</span>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent-clinical)' }}>
            {formatVolume(overallStats.avgDailyVoidOutputMl, volumeUnit)}
          </div>
        </div>

        <div className="entry-card" style={{ padding: '10px 12px', margin: 0 }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Day Voids (Avg)</span>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {overallStats.avgDaytimeVoids}
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginLeft: '4px' }}>/ day</span>
          </div>
        </div>

        <div className="entry-card" style={{ padding: '10px 12px', margin: 0 }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Nocturia (Night Avg)</span>
          <div
            style={{
              fontSize: '1.25rem',
              fontWeight: 700,
              color: overallStats.avgNocturiaVoids >= 2 ? 'var(--danger)' : 'var(--text-primary)'
            }}
          >
            {overallStats.avgNocturiaVoids}
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginLeft: '4px' }}>/ night</span>
          </div>
        </div>

        <div className="entry-card" style={{ padding: '10px 12px', margin: 0 }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Total Leaks</span>
          <div
            style={{
              fontSize: '1.25rem',
              fontWeight: 700,
              color: overallStats.totalLeaks > 0 ? 'var(--danger)' : 'var(--success)'
            }}
          >
            {overallStats.totalLeaks}
          </div>
        </div>
      </div>

      {/* Day by Day Cards List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {days.map((day) => (
          <BladderDaySummaryCard
            key={day.dateKey}
            day={day}
            volumeUnit={volumeUnit}
            isExpanded={Boolean(expandedDays[day.dayIndex])}
            onToggleExpand={() => toggleDayExpanded(day.dayIndex)}
          />
        ))}
      </div>
    </div>
  );
};

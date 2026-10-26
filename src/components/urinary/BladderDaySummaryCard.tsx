import React from 'react';
import { Sun, Moon, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import type { DailyBladderSummary } from '../../utils/bladderDiaryAggregator';
import { formatVolume } from '../../utils/logFormatters';
import { BladderTimelineRow } from './BladderTimelineRow';

interface BladderDaySummaryCardProps {
  day: DailyBladderSummary;
  volumeUnit: 'mL' | 'oz';
  isExpanded: boolean;
  onToggleExpand: () => void;
}

export const BladderDaySummaryCard: React.FC<BladderDaySummaryCardProps> = ({
  day,
  volumeUnit,
  isExpanded,
  onToggleExpand
}) => {
  const balancePrefix = day.fluidBalanceDeltaMl > 0 ? '+' : '';
  const balanceColor =
    Math.abs(day.fluidBalanceDeltaMl) > 800 ? 'var(--warning, #B45309)' : 'var(--accent-clinical)';

  return (
    <div
      style={{
        backgroundColor: 'var(--card-surface)',
        border: '1px solid var(--card-border)',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden'
      }}
    >
      {/* Day Card Header */}
      <div
        role="button"
        tabIndex={0}
        aria-expanded={isExpanded}
        aria-label={`Toggle Day ${day.dayIndex} details`}
        style={{
          padding: '12px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '8px',
          borderBottom: isExpanded ? '1px solid var(--card-border-subtle)' : 'none',
          cursor: 'pointer',
          userSelect: 'none'
        }}
        onClick={onToggleExpand}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onToggleExpand();
          }
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              backgroundColor: 'var(--accent-light, #E3F2ED)',
              color: 'var(--accent-clinical)',
              fontWeight: 700,
              fontSize: '0.88rem'
            }}
          >
            D{day.dayIndex}
          </span>
          <div>
            <strong style={{ fontSize: '0.95rem' }}>{day.dateLabel}</strong>
            <span style={{ display: 'block', fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              {day.periodLabel}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ textAlign: 'right', fontSize: '0.8rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>
              Intake: <strong>{formatVolume(day.totalIntakeMl, volumeUnit)}</strong> | Output: <strong>{formatVolume(day.totalVoidOutputMl, volumeUnit)}</strong>
            </span>
            <span style={{ display: 'block', fontSize: '0.74rem', color: balanceColor }}>
              Net Balance: {balancePrefix}{formatVolume(day.fluidBalanceDeltaMl, volumeUnit)}
            </span>
          </div>

          <button
            type="button"
            className="icon-btn"
            aria-label={isExpanded ? `Collapse Day ${day.dayIndex} timeline` : `Expand Day ${day.dayIndex} timeline`}
            style={{ width: '32px', height: '32px' }}
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand();
            }}
          >
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {/* Quick Metrics Bar */}
      <div
        style={{
          padding: '8px 16px',
          backgroundColor: 'var(--bg-secondary)',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px 18px',
          fontSize: '0.78rem',
          color: 'var(--text-secondary)'
        }}
      >
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <Sun size={13} color="#F59E0B" />
          Day Voids: <strong>{day.daytimeVoidCount}</strong>
        </span>

        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <Moon size={13} color="#6366F1" />
          Night Voids (Nocturia):{' '}
          <strong style={{ color: day.nocturiaVoidCount >= 2 ? 'var(--danger)' : 'inherit' }}>
            {day.nocturiaVoidCount}
          </strong>
        </span>

        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <AlertCircle size={13} color={day.leakageEpisodeCount > 0 ? 'var(--danger)' : 'var(--text-muted)'} />
          Leak Episodes:{' '}
          <strong style={{ color: day.leakageEpisodeCount > 0 ? 'var(--danger)' : 'var(--success)' }}>
            {day.leakageEpisodeCount}
          </strong>
        </span>

        <span>
          Voids Measured: <strong>{day.measuredVoidCount}</strong> / Est: <strong>{day.estimatedVoidCount}</strong>
        </span>

        <span>
          Total Events: <strong>{day.timeline.length}</strong>
        </span>
      </div>

      {/* Expandable Chronological Timeline */}
      {isExpanded && (
        <div style={{ padding: '12px 16px' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent-clinical)', marginBottom: '8px' }}>
            Chronological 24-Hour Diary Events:
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {day.timeline.length === 0 ? (
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic', margin: '4px 0' }}>
                No events recorded in this 24-hour cycle.
              </p>
            ) : (
              day.timeline.map((item) => (
                <BladderTimelineRow key={item.id} item={item} volumeUnit={volumeUnit} />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

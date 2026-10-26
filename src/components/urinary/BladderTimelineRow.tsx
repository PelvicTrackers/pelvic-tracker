import React from 'react';
import { Sun, Moon } from 'lucide-react';
import type { BladderTimelineItem } from '../../utils/bladderDiaryAggregator';
import { formatVolume, getUrinaryUrgencyLabel } from '../../utils/logFormatters';

interface BladderTimelineRowProps {
  item: BladderTimelineItem;
  volumeUnit: 'mL' | 'oz';
}

export const BladderTimelineRow: React.FC<BladderTimelineRowProps> = ({ item, volumeUnit }) => {
  const isIntake = typeof item.fluidIntakeAmountMl === 'number' && item.fluidIntakeAmountMl >= 0;
  const isVoid = item.eventType === 'void' || item.eventType === 'combined' || item.voidVolumeMl !== null;
  const isLeak = item.eventType === 'leakage' || item.eventType === 'combined' || item.leakageAmount !== 'none';

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '10px',
        padding: '8px 10px',
        borderRadius: 'var(--radius-sm)',
        backgroundColor: item.isNight ? 'rgba(99, 102, 241, 0.05)' : 'var(--bg-secondary)',
        border: '1px solid var(--card-border-subtle)',
        fontSize: '0.8rem'
      }}
    >
      {/* Time & Day/Night Indicator */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          minWidth: '85px',
          color: item.isNight ? '#6366F1' : 'var(--text-secondary)'
        }}
      >
        {item.isNight ? <Moon size={13} color="#6366F1" /> : <Sun size={13} color="#F59E0B" />}
        <span style={{ fontWeight: 600 }}>{item.timeFormatted}</span>
      </div>

      {/* Event Badges and Clinical Details */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
          {/* Fluid Intake Pill */}
          {isIntake && (
            <span
              style={{
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                color: '#2563EB',
                padding: '1px 6px',
                borderRadius: '4px',
                fontSize: '0.75rem',
                fontWeight: 600
              }}
            >
              Intake: {formatVolume(item.fluidIntakeAmountMl, volumeUnit)} ({item.fluidType})
            </span>
          )}

          {/* Void Volume Pill */}
          {isVoid && (
            <span
              style={{
                backgroundColor: 'rgba(43, 122, 104, 0.1)',
                color: 'var(--accent-clinical)',
                padding: '1px 6px',
                borderRadius: '4px',
                fontSize: '0.75rem',
                fontWeight: 600
              }}
            >
              Void: {item.voidVolumeMl !== null ? formatVolume(item.voidVolumeMl, volumeUnit) : item.voidVolumeType}
              {item.voidStream !== 'normal' && ` (${item.voidStream})`}
            </span>
          )}

          {/* Urgency Pill */}
          {item.urgencyLevel !== null && (
            <span
              style={{
                backgroundColor: item.urgencyLevel >= 2 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(107, 114, 128, 0.1)',
                color: item.urgencyLevel >= 2 ? 'var(--danger)' : 'var(--text-secondary)',
                padding: '1px 6px',
                borderRadius: '4px',
                fontSize: '0.72rem'
              }}
            >
              Urgency: {getUrinaryUrgencyLabel(item.urgencyLevel as any)}
            </span>
          )}

          {/* Incontinence / Leakage Pill */}
          {isLeak && (
            <span
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.12)',
                color: 'var(--danger)',
                padding: '1px 6px',
                borderRadius: '4px',
                fontSize: '0.75rem',
                fontWeight: 600
              }}
            >
              Leak: {item.leakageAmount !== 'none' ? item.leakageAmount : ''} {item.leakageType !== 'none' ? `(${item.leakageType})` : ''}
              {item.leakageActivity ? ` during ${item.leakageActivity}` : ''}
            </span>
          )}

          {/* Pad Usage Pill if active */}
          {item.padUsage && item.padUsage !== 'none' && item.padUsage !== 'dry' && (
            <span
              style={{
                backgroundColor: 'rgba(107, 114, 128, 0.12)',
                color: 'var(--text-secondary)',
                padding: '1px 6px',
                borderRadius: '4px',
                fontSize: '0.72rem'
              }}
            >
              Pad: {item.padUsage}
            </span>
          )}
        </div>

        {/* Clinical Symptom Notes */}
        {item.notes && item.notes.trim().length > 0 && (
          <div style={{ fontSize: '0.75rem', fontStyle: 'italic', color: 'var(--text-muted)', marginTop: '2px' }}>
            "{item.notes.trim()}"
          </div>
        )}
      </div>
    </div>
  );
};

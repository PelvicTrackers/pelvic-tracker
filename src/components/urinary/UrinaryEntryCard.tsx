import React from 'react';
import { Calendar, Edit2, Trash2, Droplets, AlertTriangle, RefreshCw } from 'lucide-react';
import type { UrinaryLogEntry } from '../../types';
import {
  formatDateTime,
  formatVolume,
  getUrinaryUrgencyLabel
} from '../../utils/logFormatters';
import { useLogStore } from '../../store/useLogStore';
import { EntryMetricsDisplay } from '../common';

interface UrinaryEntryCardProps {
  entry: UrinaryLogEntry;
  onEdit: (entry: UrinaryLogEntry) => void;
  onDelete: (id: string) => void;
}

const METRIC_LABELS: Record<string, string> = {
  fluidIntake: 'Fluid Intake',
  voidVolume: 'Void Volume',
  voidStream: 'Void Stream',
  urgencyLevel: 'Urgency',
  leakageType: 'Leakage Type',
  leakageAmount: 'Leakage Amount',
  leakageActivity: 'Leakage Activity',
  padUsage: 'Pad Status'
};

export const UrinaryEntryCard: React.FC<UrinaryEntryCardProps> = ({ entry, onEdit, onDelete }) => {
  const privacyMode = useLogStore((s) => s.privacyMode);
  const volumeUnit = useLogStore((s) => s.volumeUnit);

  const hasIntake = typeof entry.fluidIntakeAmountMl === 'number' && entry.fluidIntakeAmountMl > 0;
  const hasLeak = (entry.leakageType && entry.leakageType !== 'none') || (entry.leakageAmount && entry.leakageAmount !== 'none');

  const renderEventBadge = () => {
    if (entry.eventType === 'void') {
      return (
        <span
          className="badge-tag"
          style={{
            marginLeft: '6px',
            backgroundColor: 'var(--accent-light, #E3F2ED)',
            color: 'var(--accent-clinical, #2B7A68)',
            border: '1px solid var(--accent-clinical, #2B7A68)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <Droplets size={12} />
          <span>Urination / Void</span>
        </span>
      );
    }
    if (entry.eventType === 'leakage') {
      return (
        <span
          className="badge-tag"
          style={{
            marginLeft: '6px',
            backgroundColor: '#FFEBEE',
            color: 'var(--danger, #C62828)',
            border: '1px solid var(--danger, #C62828)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <AlertTriangle size={12} />
          <span>Leakage / Incontinence</span>
        </span>
      );
    }
    return (
      <span
        className="badge-tag"
        style={{
          marginLeft: '6px',
          backgroundColor: '#EDE7F6',
          color: '#5E35B1',
          border: '1px solid #7E57C2',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px'
        }}
      >
        <RefreshCw size={12} />
        <span>Void + Leakage</span>
      </span>
    );
  };

  return (
    <article className="entry-card">
      <div className="card-header">
        <div className="card-timestamp" style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Calendar size={14} />
            <span>{formatDateTime(entry.timestamp)}</span>
          </div>
          {renderEventBadge()}
          {hasIntake && (
            <span
              className="badge-tag"
              style={{
                backgroundColor: 'var(--bg-secondary, #EDF2F0)',
                color: 'var(--text-secondary, #4A5B53)'
              }}
            >
              Intake: {formatVolume(entry.fluidIntakeAmountMl, volumeUnit)} ({entry.fluidType})
            </span>
          )}
        </div>

        <div style={{ display: 'flex', gap: '4px' }}>
          <button
            type="button"
            className="icon-btn"
            style={{ width: '36px', height: '36px' }}
            onClick={() => onEdit(entry)}
            aria-label="Edit bladder diary entry"
          >
            <Edit2 size={15} />
          </button>
          <button
            type="button"
            className="icon-btn"
            style={{ width: '36px', height: '36px', color: 'var(--danger)' }}
            onClick={() => {
              if (window.confirm('Delete this urinary entry?')) {
                onDelete(entry.id);
              }
            }}
            aria-label="Delete bladder diary entry"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      <div
        className={privacyMode ? 'privacy-blur' : ''}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: '8px',
          marginBottom: '12px'
        }}
      >
        {/* Void Volume */}
        <div style={{ padding: '8px 10px', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>Void Volume</span>
          <span style={{ fontWeight: 700, color: 'var(--accent-clinical)' }}>
            {entry.eventType === 'leakage' && !entry.voidVolumeMl
              ? 'N/A'
              : entry.voidVolumeType === 'Measured'
                ? formatVolume(entry.voidVolumeMl, volumeUnit)
                : entry.voidVolumeType}
          </span>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>
            Stream: {entry.eventType === 'leakage' && !entry.voidStream ? 'N/A' : (entry.voidStream ?? 'N/A')}
          </span>
        </div>

        {/* Urgency */}
        <div style={{ padding: '8px 10px', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>Urgency Level</span>
          <span
            style={{
              fontWeight: 700,
              color: entry.urgencyLevel !== null && entry.urgencyLevel >= 2 ? 'var(--danger)' : 'var(--text-primary)'
            }}
          >
            {getUrinaryUrgencyLabel(entry.urgencyLevel)}
          </span>
        </div>

        {/* Leakage */}
        <div style={{ padding: '8px 10px', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>Leakage / Incontinence</span>
          <span
            style={{
              fontWeight: 600,
              fontSize: '0.82rem',
              color: hasLeak ? 'var(--danger)' : 'var(--success)'
            }}
          >
            {hasLeak ? `${entry.leakageAmount ?? ''} (${entry.leakageType ?? ''})` : 'None'}
          </span>
          {entry.leakageActivity && (
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>
              At: {entry.leakageActivity}
            </span>
          )}
        </div>

        {/* Pad Status */}
        <div style={{ padding: '8px 10px', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>Pad Status</span>
          <span style={{ fontWeight: 600, fontSize: '0.82rem', color: 'var(--text-primary)' }}>
            {entry.padUsage ?? 'none'}
          </span>
        </div>
      </div>

      {/* Field Comments & Custom Metrics */}
      <EntryMetricsDisplay
        customMetrics={entry.customMetrics}
        metricComments={entry.metricComments}
        metricLabels={METRIC_LABELS}
        privacyMode={privacyMode}
      />

      {entry.notes && (
        <div
          className={privacyMode ? 'privacy-blur' : ''}
          style={{
            fontSize: '0.85rem',
            padding: '8px 12px',
            backgroundColor: 'var(--bg-primary)',
            borderRadius: 'var(--radius-sm)',
            borderLeft: '3px solid var(--accent-secondary)',
            color: 'var(--text-secondary)',
            marginTop: '8px'
          }}
        >
          {entry.notes}
        </div>
      )}
    </article>
  );
};

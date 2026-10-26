import React from 'react';
import { Calendar, Clock, Edit2, Trash2 } from 'lucide-react';
import type { SexualLogEntry } from '../../types';
import {
  formatDateTime,
  getSexualActivityName,
  getEjaculationName,
  getPainColor
} from '../../utils/logFormatters';
import { useLogStore } from '../../store/useLogStore';
import { EntryMetricsDisplay } from '../common';

interface SexualEntryCardProps {
  entry: SexualLogEntry;
  onEdit: (entry: SexualLogEntry) => void;
  onDelete: (id: string) => void;
}

const METRIC_LABELS: Record<string, string> = {
  durationMinutes: 'Duration',
  painBefore: 'Pain Before',
  painDuring: 'Pain During',
  painAfter: 'Pain After',
  erectionArousalScore: 'Erection / Arousal',
  pleasureScore: 'Pleasure Score',
  ejaculation: 'Ejaculation'
};

export const SexualEntryCard: React.FC<SexualEntryCardProps> = ({ entry, onEdit, onDelete }) => {
  const privacyMode = useLogStore((s) => s.privacyMode);

  return (
    <article className="entry-card">
      <div className="card-header">
        <div className="card-timestamp">
          <Calendar size={14} />
          <span>{formatDateTime(entry.timestamp)}</span>
          <span className="badge-tag" style={{ marginLeft: '6px' }}>
            {getSexualActivityName(entry.activity)}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '4px' }}>
          <button
            type="button"
            className="icon-btn"
            style={{ width: '36px', height: '36px' }}
            onClick={() => onEdit(entry)}
            aria-label="Edit sexual entry"
          >
            <Edit2 size={15} />
          </button>
          <button
            type="button"
            className="icon-btn"
            style={{ width: '36px', height: '36px', color: 'var(--danger)' }}
            onClick={() => {
              if (window.confirm('Delete this entry?')) {
                onDelete(entry.id);
              }
            }}
            aria-label="Delete sexual entry"
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
        <div style={{ padding: '8px 10px', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>Pain (Before / Dur / Aft)</span>
          <div style={{ display: 'flex', gap: '4px', alignItems: 'center', marginTop: '2px' }}>
            <span style={{ fontWeight: 700, color: getPainColor(entry.painBefore) }}>
              {entry.painBefore !== null ? entry.painBefore : 'N/A'}
            </span>
            <span style={{ color: 'var(--text-muted)' }}>/</span>
            <span style={{ fontWeight: 700, color: getPainColor(entry.painDuring) }}>
              {entry.painDuring !== null ? entry.painDuring : 'N/A'}
            </span>
            <span style={{ color: 'var(--text-muted)' }}>/</span>
            <span style={{ fontWeight: 700, color: getPainColor(entry.painAfter) }}>
              {entry.painAfter !== null ? entry.painAfter : 'N/A'}
            </span>
          </div>
        </div>

        <div style={{ padding: '8px 10px', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>Erection / Arousal</span>
          <span style={{ fontWeight: 700, color: entry.erectionArousalScore !== null ? 'var(--text-primary)' : 'var(--text-muted)' }}>
            {entry.erectionArousalScore !== null ? `${entry.erectionArousalScore}%` : 'N/A'}
          </span>
        </div>

        <div style={{ padding: '8px 10px', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>Pleasure Score</span>
          <span style={{ fontWeight: 700, color: entry.pleasureScore !== null ? 'var(--text-primary)' : 'var(--text-muted)' }}>
            {entry.pleasureScore !== null ? `${entry.pleasureScore}%` : 'N/A'}
          </span>
        </div>

        <div style={{ padding: '8px 10px', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>Ejaculation</span>
          <span style={{ fontWeight: 600, fontSize: '0.82rem', color: 'var(--text-primary)' }}>
            {getEjaculationName(entry.ejaculation)}
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '16px', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '8px', flexWrap: 'wrap' }}>
        {entry.position && (
          <div>
            <strong>Position:</strong> {entry.position}
          </div>
        )}
        <div>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <Clock size={13} />
            <span>
              <strong>Duration:</strong>{' '}
              {typeof entry.durationMinutes === 'number' ? `${entry.durationMinutes} mins` : 'N/A'}
            </span>
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
            borderLeft: '3px solid var(--accent-clinical)',
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

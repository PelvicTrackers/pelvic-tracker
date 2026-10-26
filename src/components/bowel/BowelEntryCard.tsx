import React from 'react';
import { Calendar, Edit2, Trash2 } from 'lucide-react';
import type { BowelLogEntry } from '../../types';
import {
  formatDateTime,
  getPainColor
} from '../../utils/logFormatters';
import { POSTURAL_SPLINTING_OPTIONS, BRISTOL_STOOL_SCALE } from '../../data/clinicalScales';
import { useLogStore } from '../../store/useLogStore';
import { EntryMetricsDisplay } from '../common';

interface BowelEntryCardProps {
  entry: BowelLogEntry;
  onEdit: (entry: BowelLogEntry) => void;
  onDelete: (id: string) => void;
}

const METRIC_LABELS: Record<string, string> = {
  bristolType: 'Bristol Stool Form',
  strainingLevel: 'Straining Effort',
  evacuationCompleteness: 'Evacuation Completeness',
  urgencyLevel: 'Bowel Urgency',
  accidentalLeakage: 'Accidental Leakage',
  posturalSplinting: 'Postural Splinting',
  painBefore: 'Pain Before',
  painDuring: 'Pain During',
  painAfter: 'Pain After'
};

export const BowelEntryCard: React.FC<BowelEntryCardProps> = ({ entry, onEdit, onDelete }) => {
  const privacyMode = useLogStore((s) => s.privacyMode);

  const bristolDetail = entry.bristolType !== null
    ? BRISTOL_STOOL_SCALE.find((b) => b.type === entry.bristolType)
    : null;
  const splintingMatch = POSTURAL_SPLINTING_OPTIONS.find((p) => p.value === entry.posturalSplinting);
  const hasLeakage = entry.accidentalLeakage !== null && entry.accidentalLeakage !== 'none';

  return (
    <article className="entry-card">
      <div className="card-header">
        <div className="card-timestamp">
          <Calendar size={14} />
          <span>{formatDateTime(entry.timestamp)}</span>
          <span
            className="badge-tag"
            style={{
              marginLeft: '6px',
              backgroundColor: bristolDetail?.colorHex ? `${bristolDetail.colorHex}22` : 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              border: `1px solid ${bristolDetail?.colorHex ?? 'var(--card-border)'}`
            }}
          >
            {entry.bristolType !== null
              ? `Type ${entry.bristolType}: ${bristolDetail?.title.split(':')[1]?.trim() ?? ''}`
              : 'Bristol: N/A'}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '4px' }}>
          <button
            type="button"
            className="icon-btn"
            style={{ width: '36px', height: '36px' }}
            onClick={() => onEdit(entry)}
            aria-label="Edit bowel entry"
          >
            <Edit2 size={15} />
          </button>
          <button
            type="button"
            className="icon-btn"
            style={{ width: '36px', height: '36px', color: 'var(--danger)' }}
            onClick={() => {
              if (window.confirm('Delete this bowel entry?')) {
                onDelete(entry.id);
              }
            }}
            aria-label="Delete bowel entry"
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
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>Straining (0–10)</span>
          <span style={{ fontWeight: 700, color: getPainColor(entry.strainingLevel) }}>
            {entry.strainingLevel !== null ? `${entry.strainingLevel} / 10` : 'N/A'}
          </span>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>
            Evacuation: {entry.evacuationCompleteness ?? 'N/A'}
          </span>
        </div>

        <div style={{ padding: '8px 10px', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>Pain (Bef / Dur / Aft)</span>
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
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>Bowel Leakage</span>
          <span
            style={{
              fontWeight: 600,
              fontSize: '0.82rem',
              color: hasLeakage ? 'var(--danger)' : (entry.accidentalLeakage === null ? 'var(--text-muted)' : 'var(--success)')
            }}
          >
            {entry.accidentalLeakage === null
              ? 'N/A'
              : entry.accidentalLeakage === 'none'
                ? 'None'
                : entry.accidentalLeakage.replace('_', ' ')}
          </span>
        </div>

        <div style={{ padding: '8px 10px', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>Postural Assist</span>
          <span style={{ fontWeight: 600, fontSize: '0.82rem', color: 'var(--text-primary)' }}>
            {splintingMatch ? splintingMatch.label : entry.posturalSplinting}
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

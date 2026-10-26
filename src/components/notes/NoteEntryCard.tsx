import React from 'react';
import { Calendar, Edit2, Trash2 } from 'lucide-react';
import type { PatientNote } from '../../types';
import { formatDateTime } from '../../utils/logFormatters';
import { NOTE_CATEGORIES } from '../../data/clinicalScales';
import { useLogStore } from '../../store/useLogStore';

interface NoteEntryCardProps {
  note: PatientNote;
  onEdit: (note: PatientNote) => void;
  onDelete: (id: string) => void;
}

export const NoteEntryCard: React.FC<NoteEntryCardProps> = ({ note, onEdit, onDelete }) => {
  const privacyMode = useLogStore((s) => s.privacyMode);
  const catMatch = NOTE_CATEGORIES.find((c) => c.value === note.category);

  return (
    <article className="entry-card">
      <div className="card-header">
        <div className="card-timestamp">
          <Calendar size={14} />
          <span>{formatDateTime(note.timestamp)}</span>
          <span
            className="badge-tag"
            style={{
              marginLeft: '6px',
              backgroundColor: catMatch ? `${catMatch.color}15` : undefined,
              color: catMatch?.color ?? 'var(--text-primary)',
              border: `1px solid ${catMatch?.color ?? 'var(--card-border)'}`
            }}
          >
            {catMatch?.label ?? note.category}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '4px' }}>
          <button
            type="button"
            className="icon-btn"
            style={{ width: '36px', height: '36px' }}
            onClick={() => onEdit(note)}
            aria-label="Edit clinical note"
          >
            <Edit2 size={15} />
          </button>
          <button
            type="button"
            className="icon-btn"
            style={{ width: '36px', height: '36px', color: 'var(--danger)' }}
            onClick={() => {
              if (window.confirm('Delete this note?')) {
                onDelete(note.id);
              }
            }}
            aria-label="Delete clinical note"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {note.title && (
        <h3
          className={privacyMode ? 'privacy-blur' : ''}
          style={{
            fontSize: '1.05rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
            marginBottom: '8px'
          }}
        >
          {note.title}
        </h3>
      )}

      <div
        className={privacyMode ? 'privacy-blur' : ''}
        style={{
          fontSize: '0.9rem',
          color: 'var(--text-secondary)',
          lineHeight: 1.6,
          whiteSpace: 'pre-wrap'
        }}
      >
        {note.content}
      </div>
    </article>
  );
};

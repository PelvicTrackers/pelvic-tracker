import React from 'react';
import { Calendar, Edit2, Trash2, CheckCircle2, XCircle } from 'lucide-react';
import type { CustomFormDefinition, CustomFormEntry, CustomFormField } from '../../types/customForm';
import { formatDateTime, getPainColor } from '../../utils/logFormatters';
import { useLogStore } from '../../store/useLogStore';

interface CustomFormEntryCardProps {
  entry: CustomFormEntry;
  form: CustomFormDefinition;
  onEdit: (entry: CustomFormEntry) => void;
  onDelete: (id: string) => void;
}

export const CustomFormEntryCard: React.FC<CustomFormEntryCardProps> = ({
  entry,
  form,
  onEdit,
  onDelete
}) => {
  const privacyMode = useLogStore((s) => s.privacyMode);

  const renderFieldValue = (field: CustomFormField, val: any) => {
    if (val === undefined || val === null || val === '') {
      return <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Not recorded</span>;
    }

    if (field.type === 'slider-10') {
      const num = typeof val === 'number' ? val : Number(val);
      const painBg = getPainColor(num);
      return (
        <span
          className="badge-tag"
          style={{
            backgroundColor: `${painBg}25`,
            color: 'var(--text-primary)',
            border: `1px solid ${painBg}`,
            fontWeight: 700
          }}
        >
          {privacyMode ? '••' : num} {field.unit ?? '/ 10'}
        </span>
      );
    }

    if (field.type === 'slider-100') {
      const num = typeof val === 'number' ? val : Number(val);
      return (
        <span
          className="badge-tag"
          style={{
            backgroundColor: 'var(--accent-light)',
            color: 'var(--accent-clinical)',
            fontWeight: 700
          }}
        >
          {privacyMode ? '••%' : `${num}%`}
        </span>
      );
    }

    if (field.type === 'boolean') {
      const isTrue = Boolean(val);
      return (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '0.85rem',
            color: isTrue ? 'var(--accent-clinical)' : 'var(--text-muted)',
            fontWeight: 600
          }}
        >
          {isTrue ? (
            <>
              <CheckCircle2 size={16} color="var(--accent-clinical)" /> Yes
            </>
          ) : (
            <>
              <XCircle size={16} /> No
            </>
          )}
        </span>
      );
    }

    if (field.type === 'number') {
      return (
        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
          {privacyMode ? '••' : val} {field.unit ? field.unit : ''}
        </span>
      );
    }

    // select or text
    return (
      <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
        {privacyMode ? '••••••' : String(val)}
      </span>
    );
  };

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
              backgroundColor: 'var(--accent-light)',
              color: 'var(--accent-clinical)',
              fontSize: '0.75rem'
            }}
          >
            {form.title}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '4px' }}>
          <button
            type="button"
            className="icon-btn"
            style={{ width: '36px', height: '36px' }}
            onClick={() => onEdit(entry)}
            aria-label="Edit entry"
          >
            <Edit2 size={15} />
          </button>
          <button
            type="button"
            className="icon-btn"
            style={{ width: '36px', height: '36px' }}
            onClick={() => {
              if (window.confirm('Are you sure you want to delete this custom log entry?')) {
                onDelete(entry.id);
              }
            }}
            aria-label="Delete entry"
          >
            <Trash2 size={15} color="var(--danger)" />
          </button>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '12px',
          marginTop: '12px'
        }}
      >
        {form.fields.map((field) => {
          const val = entry.responses?.[field.id];
          return (
            <div
              key={field.id}
              style={{
                backgroundColor: 'var(--card-hover)',
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              }}
            >
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {field.label}
              </span>
              <div>{renderFieldValue(field, val)}</div>
            </div>
          );
        })}
      </div>

      {entry.notes && (
        <div
          style={{
            marginTop: '12px',
            paddingTop: '8px',
            borderTop: '1px solid var(--card-border)',
            fontSize: '0.88rem',
            color: 'var(--text-secondary)'
          }}
        >
          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Notes: </span>
          {privacyMode ? '••••••••••••••••' : entry.notes}
        </div>
      )}
    </article>
  );
};

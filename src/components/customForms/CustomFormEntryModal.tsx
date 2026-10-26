import React, { useState, useEffect } from 'react';
import { X, Clock, Calendar, Save } from 'lucide-react';
import type { CustomFormDefinition, CustomFormEntry } from '../../types/customForm';
import { formatDateTime, getPainColor } from '../../utils/logFormatters';
import { DateTimeAdjusterModal } from '../common/DateTimeAdjusterModal';

interface CustomFormEntryModalProps {
  isOpen: boolean;
  form: CustomFormDefinition;
  initialEntry?: CustomFormEntry | null;
  onSave: (entryData: Omit<CustomFormEntry, 'id'>) => Promise<void>;
  onClose: () => void;
}

export const CustomFormEntryModal: React.FC<CustomFormEntryModalProps> = ({
  isOpen,
  form,
  initialEntry,
  onSave,
  onClose
}) => {
  const [timestamp, setTimestamp] = useState<string>(() => new Date().toISOString());
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [notes, setNotes] = useState<string>('');
  const [isAdjusterOpen, setIsAdjusterOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (initialEntry) {
      setTimestamp(initialEntry.timestamp);
      setResponses({ ...(initialEntry.responses ?? {}) });
      setNotes(initialEntry.notes ?? '');
    } else {
      setTimestamp(new Date().toISOString());
      // Initialize responses with defaults
      const initialResp: Record<string, any> = {};
      for (const f of form.fields) {
        if (f.type === 'slider-10') initialResp[f.id] = 0;
        else if (f.type === 'slider-100') initialResp[f.id] = 50;
        else if (f.type === 'number') initialResp[f.id] = 0;
        else if (f.type === 'boolean') initialResp[f.id] = false;
        else if (f.type === 'select') initialResp[f.id] = f.options?.[0] ?? '';
        else initialResp[f.id] = '';
      }
      setResponses(initialResp);
      setNotes('');
    }
  }, [initialEntry, form, isOpen]);

  if (!isOpen) return null;

  const handleFieldChange = (fieldId: string, val: any) => {
    setResponses((prev) => ({
      ...prev,
      [fieldId]: val
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave({
        formId: form.id,
        timestamp,
        responses,
        notes: notes.trim() ? notes.trim() : undefined
      });
      onClose();
    } catch (err) {
      console.error('[CustomFormEntryModal] Failed to save entry', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="custom-form-modal-title">
        <div className="modal-content" style={{ maxWidth: '600px' }}>
          <div className="modal-header">
            <div>
              <span className="badge-tag" style={{ backgroundColor: 'var(--accent-light)', color: 'var(--accent-clinical)' }}>
                {form.category}
              </span>
              <h2 id="custom-form-modal-title" style={{ fontSize: '1.25rem', marginTop: '4px' }}>
                {initialEntry ? `Edit Log: ${form.title}` : `Log: ${form.title}`}
              </h2>
              {form.description && (
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {form.description}
                </p>
              )}
            </div>
            <button
              type="button"
              className="icon-btn"
              onClick={onClose}
              aria-label="Close dialog"
              style={{ width: '40px', height: '40px' }}
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Timestamp Selector */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  backgroundColor: 'var(--bg-secondary)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--card-border)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Calendar size={16} color="var(--accent-clinical)" />
                  <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{formatDateTime(timestamp)}</span>
                </div>
                <button
                  type="button"
                  className="btn-secondary"
                  style={{ padding: '4px 10px', fontSize: '0.8rem', gap: '4px' }}
                  onClick={() => setIsAdjusterOpen(true)}
                >
                  <Clock size={14} /> Adjust Time
                </button>
              </div>

              {/* Dynamic Fields */}
              {form.fields.map((field) => {
                const currentVal = responses[field.id];

                return (
                  <div key={field.id} className="form-group" style={{ marginBottom: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
                      <label className="form-label" style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 0 }}>
                        {field.label} {field.required && <span style={{ color: 'var(--danger)' }}>*</span>}
                      </label>
                      {field.unit && (
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          Unit: {field.unit}
                        </span>
                      )}
                    </div>

                    {field.description && (
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '8px', marginTop: 0 }}>
                        {field.description}
                      </p>
                    )}

                    {/* slider-10 */}
                    {field.type === 'slider-10' && (
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>0 (None)</span>
                          <span
                            className="badge-tag"
                            style={{
                              backgroundColor: `${getPainColor(typeof currentVal === 'number' ? currentVal : 0)}25`,
                              color: 'var(--text-primary)',
                              border: `1px solid ${getPainColor(typeof currentVal === 'number' ? currentVal : 0)}`,
                              fontWeight: 700,
                              fontSize: '0.9rem',
                              padding: '2px 10px'
                            }}
                          >
                            Score: {typeof currentVal === 'number' ? currentVal : 0} / 10
                          </span>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>10 (Worst)</span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(11, 1fr)', gap: '4px' }}>
                          {Array.from({ length: 11 }, (_, i) => {
                            const isSelected = (typeof currentVal === 'number' ? currentVal : 0) === i;
                            const color = getPainColor(i);
                            return (
                              <button
                                key={i}
                                type="button"
                                onClick={() => handleFieldChange(field.id, i)}
                                style={{
                                  height: '38px',
                                  borderRadius: 'var(--radius-sm)',
                                  border: isSelected ? `2px solid ${color}` : '1px solid var(--card-border)',
                                  backgroundColor: isSelected ? color : 'var(--card-hover)',
                                  color: isSelected ? '#ffffff' : 'var(--text-primary)',
                                  fontWeight: isSelected ? 700 : 500,
                                  cursor: 'pointer',
                                  fontSize: '0.85rem'
                                }}
                              >
                                {i}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* slider-100 */}
                    {field.type === 'slider-100' && (
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>0%</span>
                          <span style={{ fontWeight: 700, color: 'var(--accent-clinical)' }}>
                            {typeof currentVal === 'number' ? currentVal : 50}%
                          </span>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>100%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="5"
                          value={typeof currentVal === 'number' ? currentVal : 50}
                          onChange={(e) => handleFieldChange(field.id, parseInt(e.target.value, 10))}
                          style={{ width: '100%', accentColor: 'var(--accent-clinical)' }}
                        />
                      </div>
                    )}

                    {/* number */}
                    {field.type === 'number' && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button
                          type="button"
                          className="btn-secondary"
                          style={{ width: '40px', height: '40px', fontSize: '1.2rem', padding: 0 }}
                          onClick={() => {
                            const cur = typeof currentVal === 'number' ? currentVal : 0;
                            handleFieldChange(field.id, Math.max(0, cur - 1));
                          }}
                        >
                          -
                        </button>
                        <input
                          type="number"
                          className="form-input"
                          style={{ textAlign: 'center', fontWeight: 600, fontSize: '1rem', width: '120px' }}
                          value={typeof currentVal === 'number' ? currentVal : ''}
                          onChange={(e) => {
                            const v = e.target.value === '' ? null : Number(e.target.value);
                            handleFieldChange(field.id, v);
                          }}
                        />
                        <button
                          type="button"
                          className="btn-secondary"
                          style={{ width: '40px', height: '40px', fontSize: '1.2rem', padding: 0 }}
                          onClick={() => {
                            const cur = typeof currentVal === 'number' ? currentVal : 0;
                            handleFieldChange(field.id, cur + 1);
                          }}
                        >
                          +
                        </button>
                        {field.unit && (
                          <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                            {field.unit}
                          </span>
                        )}
                      </div>
                    )}

                    {/* select */}
                    {field.type === 'select' && (
                      <select
                        className="form-input"
                        value={currentVal ?? ''}
                        onChange={(e) => handleFieldChange(field.id, e.target.value)}
                        required={field.required}
                      >
                        {field.options?.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    )}

                    {/* text */}
                    {field.type === 'text' && (
                      <input
                        type="text"
                        className="form-input"
                        placeholder={`Enter ${field.label.toLowerCase()}...`}
                        value={currentVal ?? ''}
                        onChange={(e) => handleFieldChange(field.id, e.target.value)}
                        required={field.required}
                      />
                    )}

                    {/* boolean */}
                    {field.type === 'boolean' && (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          type="button"
                          onClick={() => handleFieldChange(field.id, true)}
                          style={{
                            flex: 1,
                            padding: '8px 12px',
                            borderRadius: 'var(--radius-sm)',
                            border: currentVal === true ? '2px solid var(--accent-clinical)' : '1px solid var(--card-border)',
                            backgroundColor: currentVal === true ? 'var(--accent-light)' : 'var(--card-hover)',
                            color: currentVal === true ? 'var(--accent-clinical)' : 'var(--text-primary)',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          Yes
                        </button>
                        <button
                          type="button"
                          onClick={() => handleFieldChange(field.id, false)}
                          style={{
                            flex: 1,
                            padding: '8px 12px',
                            borderRadius: 'var(--radius-sm)',
                            border: currentVal === false ? '2px solid var(--card-border)' : '1px solid var(--card-border)',
                            backgroundColor: currentVal === false ? 'var(--card-surface)' : 'var(--card-hover)',
                            color: currentVal === false ? 'var(--text-muted)' : 'var(--text-primary)',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          No
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Notes Field */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Clinical / Session Notes</label>
                <textarea
                  className="form-input"
                  rows={3}
                  placeholder="Note pelvic floor sensations, triggers, physical therapist instructions..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn-secondary" onClick={onClose} disabled={isSaving}>
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={isSaving}>
                <Save size={16} /> {isSaving ? 'Saving...' : 'Save Entry'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <DateTimeAdjusterModal
        isOpen={isAdjusterOpen}
        currentIso={timestamp}
        onConfirm={(adjusted) => setTimestamp(adjusted)}
        onClose={() => setIsAdjusterOpen(false)}
      />
    </>
  );
};

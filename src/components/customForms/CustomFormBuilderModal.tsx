import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, ArrowUp, ArrowDown, Save, Sparkles } from 'lucide-react';
import type { CustomFormDefinition, CustomFormField, CustomFormFieldType } from '../../types/customForm';
import { PREBUILT_CUSTOM_FORMS } from '../../data/customFormTemplates';

interface CustomFormBuilderModalProps {
  isOpen: boolean;
  initialForm?: CustomFormDefinition | null;
  onSave: (form: CustomFormDefinition) => Promise<void>;
  onClose: () => void;
}

export const CustomFormBuilderModal: React.FC<CustomFormBuilderModalProps> = ({
  isOpen,
  initialForm,
  onSave,
  onClose
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Therapy');
  const [fields, setFields] = useState<CustomFormField[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (initialForm) {
      setTitle(initialForm.title);
      setDescription(initialForm.description);
      setCategory(initialForm.category || 'Therapy');
      setFields(initialForm.fields.map((f) => ({ ...f, options: f.options ? [...f.options] : undefined })));
    } else {
      setTitle('');
      setDescription('');
      setCategory('Therapy');
      setFields([
        {
          id: `f_${Date.now()}_1`,
          label: 'Primary Symptom / Activity Score (0–10)',
          type: 'slider-10',
          required: true,
          unit: '/ 10'
        }
      ]);
    }
    setErrorMsg(null);
  }, [initialForm, isOpen]);

  if (!isOpen) return null;

  const handleAddField = () => {
    const newField: CustomFormField = {
      id: `f_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      label: 'New Question / Field',
      type: 'slider-10',
      required: false,
      unit: ''
    };
    setFields([...fields, newField]);
  };

  const handleRemoveField = (index: number) => {
    if (fields.length <= 1) {
      setErrorMsg('A form must have at least one field.');
      return;
    }
    setFields(fields.filter((_, i) => i !== index));
  };

  const handleMoveField = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= fields.length) return;
    const reordered = [...fields];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIdx, 0, moved);
    setFields(reordered);
  };

  const handleUpdateField = (index: number, updates: Partial<CustomFormField>) => {
    const updated = [...fields];
    updated[index] = { ...updated[index], ...updates };
    setFields(updated);
  };

  const handleApplyPreset = (presetId: string) => {
    const found = PREBUILT_CUSTOM_FORMS.find((p) => p.id === presetId);
    if (!found) return;
    setTitle(found.title);
    setDescription(found.description);
    setCategory(found.category);
    setFields(found.fields.map((f) => ({ ...f, id: `f_${Date.now()}_${f.id}` })));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Please enter a form title.');
      return;
    }
    for (let i = 0; i < fields.length; i++) {
      if (!fields[i].label.trim()) {
        setErrorMsg(`Field #${i + 1} requires a label.`);
        return;
      }
    }

    setIsSaving(true);
    try {
      const formDefinition: CustomFormDefinition = {
        id: initialForm ? initialForm.id : `form_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        title: title.trim(),
        description: description.trim(),
        category: category.trim() || 'General',
        fields: fields.map((f) => ({
          ...f,
          label: f.label.trim(),
          unit: f.unit?.trim() || undefined,
          options: f.type === 'select' && f.options ? f.options.filter((o) => o.trim().length > 0) : undefined
        })),
        createdAt: initialForm ? initialForm.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isPrebuilt: initialForm?.isPrebuilt ?? false
      };

      await onSave(formDefinition);
      onClose();
    } catch (err) {
      console.error('[CustomFormBuilderModal] Failed to save form', err);
      setErrorMsg('Failed to save form to local database.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="form-builder-title">
      <div className="modal-content" style={{ maxWidth: '680px', maxHeight: '90vh' }}>
        <div className="modal-header">
          <div>
            <h2 id="form-builder-title" style={{ fontSize: '1.25rem' }}>
              {initialForm ? 'Edit Custom Form' : 'Create Custom Form'}
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Design a tailored symptom, therapy, or trigger tracking protocol.
            </p>
          </div>
          <button
            type="button"
            className="icon-btn"
            onClick={onClose}
            aria-label="Close form builder"
            style={{ width: '40px', height: '40px' }}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {errorMsg && (
              <div
                style={{
                  padding: '8px 12px',
                  backgroundColor: 'var(--danger-light, #fee2e2)',
                  color: 'var(--danger)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.85rem'
                }}
              >
                {errorMsg}
              </div>
            )}

            {/* Quick Presets Dropdown */}
            {!initialForm && (
              <div
                style={{
                  padding: '10px 14px',
                  backgroundColor: 'var(--accent-light)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkles size={16} color="var(--accent-clinical)" />
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent-clinical)' }}>
                    Quick Start Preset:
                  </span>
                </div>
                <select
                  className="form-input"
                  style={{ width: 'auto', flex: 1, fontSize: '0.85rem', padding: '4px 8px' }}
                  onChange={(e) => {
                    if (e.target.value) handleApplyPreset(e.target.value);
                  }}
                  defaultValue=""
                >
                  <option value="" disabled>
                    Choose a clinical template...
                  </option>
                  {PREBUILT_CUSTOM_FORMS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title} ({p.category})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* General Form Info */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px', gap: '12px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Form Title *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g., Dilator Therapy, Tailbone Pressure..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Category</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Therapy"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Description / Instructions</label>
              <input
                type="text"
                className="form-input"
                placeholder="Brief instructions for when and how to fill out this diary..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Fields List */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label className="form-label" style={{ fontWeight: 700, marginBottom: 0 }}>
                  Form Fields ({fields.length})
                </label>
                <button
                  type="button"
                  className="btn-secondary"
                  style={{ padding: '4px 10px', fontSize: '0.8rem', gap: '4px' }}
                  onClick={handleAddField}
                >
                  <Plus size={14} /> Add Field
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {fields.map((field, idx) => (
                  <div
                    key={field.id}
                    style={{
                      padding: '12px',
                      backgroundColor: 'var(--card-hover)',
                      border: '1px solid var(--card-border)',
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', width: '20px' }}>
                        #{idx + 1}
                      </span>
                      <input
                        type="text"
                        className="form-input"
                        style={{ flex: 1 }}
                        placeholder="Field Question / Label..."
                        value={field.label}
                        onChange={(e) => handleUpdateField(idx, { label: e.target.value })}
                        required
                      />
                      <select
                        className="form-input"
                        style={{ width: '160px' }}
                        value={field.type}
                        onChange={(e) =>
                          handleUpdateField(idx, {
                            type: e.target.value as CustomFormFieldType,
                            options: e.target.value === 'select' ? (field.options ?? ['Option 1', 'Option 2']) : undefined
                          })
                        }
                      >
                        <option value="slider-10">0–10 Scale (Slider)</option>
                        <option value="slider-100">0–100% (Percentage)</option>
                        <option value="number">Number (Count / Min)</option>
                        <option value="select">Select (Dropdown)</option>
                        <option value="text">Text (Single-line)</option>
                        <option value="boolean">Yes / No (Toggle)</option>
                      </select>

                      <div style={{ display: 'flex', gap: '2px' }}>
                        <button
                          type="button"
                          className="icon-btn"
                          style={{ width: '32px', height: '32px' }}
                          disabled={idx === 0}
                          onClick={() => handleMoveField(idx, 'up')}
                          aria-label="Move field up"
                        >
                          <ArrowUp size={14} />
                        </button>
                        <button
                          type="button"
                          className="icon-btn"
                          style={{ width: '32px', height: '32px' }}
                          disabled={idx === fields.length - 1}
                          onClick={() => handleMoveField(idx, 'down')}
                          aria-label="Move field down"
                        >
                          <ArrowDown size={14} />
                        </button>
                        <button
                          type="button"
                          className="icon-btn"
                          style={{ width: '32px', height: '32px' }}
                          onClick={() => handleRemoveField(idx)}
                          aria-label="Remove field"
                        >
                          <Trash2 size={14} color="var(--danger)" />
                        </button>
                      </div>
                    </div>

                    {/* Secondary Field Config: Unit & Options */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.85rem' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={field.required}
                          onChange={(e) => handleUpdateField(idx, { required: e.target.checked })}
                        />
                        <span>Required</span>
                      </label>

                      {(field.type === 'number' || field.type === 'slider-10') && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{ color: 'var(--text-muted)' }}>Unit:</span>
                          <input
                            type="text"
                            className="form-input"
                            style={{ width: '100px', padding: '2px 6px', fontSize: '0.8rem' }}
                            placeholder="minutes, mL..."
                            value={field.unit ?? ''}
                            onChange={(e) => handleUpdateField(idx, { unit: e.target.value })}
                          />
                        </div>
                      )}

                      {field.type === 'select' && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flex: 1 }}>
                          <span style={{ color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>Options (comma-separated):</span>
                          <input
                            type="text"
                            className="form-input"
                            style={{ flex: 1, padding: '2px 6px', fontSize: '0.8rem' }}
                            placeholder="Option 1, Option 2, Option 3..."
                            value={field.options?.join(', ') ?? ''}
                            onChange={(e) =>
                              handleUpdateField(idx, {
                                options: e.target.value.split(',').map((s) => s.trim())
                              })
                            }
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={isSaving}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={isSaving}>
              <Save size={16} /> {isSaving ? 'Saving...' : 'Save Form'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

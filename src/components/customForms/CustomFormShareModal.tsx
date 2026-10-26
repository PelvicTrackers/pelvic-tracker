import React, { useState, useEffect } from 'react';
import { X, Copy, Check, Download, Upload, Share2, Sparkles } from 'lucide-react';
import type { CustomFormDefinition } from '../../types/customForm';
import {
  encodeFormToShareCode,
  decodeFormFromShareCode,
  downloadFormAsJson
} from '../../utils/customFormShare';

interface CustomFormShareModalProps {
  isOpen: boolean;
  activeMode: 'share' | 'import';
  availableForms: CustomFormDefinition[];
  selectedForm: CustomFormDefinition | null;
  onSaveImportedForm: (form: CustomFormDefinition) => Promise<void>;
  onClose: () => void;
}

export const CustomFormShareModal: React.FC<CustomFormShareModalProps> = ({
  isOpen,
  activeMode,
  availableForms,
  selectedForm,
  onSaveImportedForm,
  onClose
}) => {
  const [tab, setTab] = useState<'share' | 'import'>('share');
  const [currentFormId, setCurrentFormId] = useState<string>('');
  const [copiedCode, setCopiedCode] = useState(false);

  // Import state
  const [importInput, setImportInput] = useState('');
  const [parsedForm, setParsedForm] = useState<CustomFormDefinition | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    setTab(activeMode);
    if (selectedForm) {
      setCurrentFormId(selectedForm.id);
    } else if (availableForms.length > 0) {
      setCurrentFormId(availableForms[0].id);
    }
  }, [isOpen, activeMode, selectedForm, availableForms]);

  useEffect(() => {
    if (!importInput.trim()) {
      setParsedForm(null);
      setImportError(null);
      return;
    }
    const decoded = decodeFormFromShareCode(importInput);
    if (decoded) {
      setParsedForm(decoded);
      setImportError(null);
    } else {
      setParsedForm(null);
      setImportError('Invalid form share code or format. Please verify the code.');
    }
  }, [importInput]);

  if (!isOpen) return null;

  const currentForm = availableForms.find((f) => f.id === currentFormId) ?? availableForms[0] ?? null;

  const handleCopyCode = async () => {
    if (!currentForm) return;
    const code = encodeFormToShareCode(currentForm);
    await navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleDownloadFile = () => {
    if (!currentForm) return;
    downloadFormAsJson(currentForm);
  };

  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setImportInput(text);
    } catch (err) {
      console.error('[CustomFormShareModal] Failed to read clipboard', err);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setImportInput(content);
      }
    };
    reader.readAsText(file);
  };

  const handleConfirmImport = async () => {
    if (!parsedForm) return;
    setIsImporting(true);
    try {
      // Create new ID to prevent colliding if desired, or keep structure
      const imported: CustomFormDefinition = {
        ...parsedForm,
        id: `form_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isPrebuilt: false
      };
      await onSaveImportedForm(imported);
      onClose();
    } catch (err) {
      console.error('[CustomFormShareModal] Failed to save imported form', err);
      setImportError('Failed to save imported form.');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="share-modal-title">
      <div className="modal-content" style={{ maxWidth: '580px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Share2 size={20} color="var(--accent-clinical)" />
            <h2 id="share-modal-title" style={{ fontSize: '1.25rem' }}>
              Zero-Cloud Form Sharing
            </h2>
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

        {/* Tab switchers: Share vs Import */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--card-border)', padding: '0 20px' }}>
          <button
            type="button"
            style={{
              flex: 1,
              padding: '10px',
              background: 'none',
              border: 'none',
              borderBottom: tab === 'share' ? '2px solid var(--accent-clinical)' : '2px solid transparent',
              color: tab === 'share' ? 'var(--accent-clinical)' : 'var(--text-muted)',
              fontWeight: tab === 'share' ? 700 : 500,
              cursor: 'pointer'
            }}
            onClick={() => setTab('share')}
          >
            Share / Export Form
          </button>
          <button
            type="button"
            style={{
              flex: 1,
              padding: '10px',
              background: 'none',
              border: 'none',
              borderBottom: tab === 'import' ? '2px solid var(--accent-clinical)' : '2px solid transparent',
              color: tab === 'import' ? 'var(--accent-clinical)' : 'var(--text-muted)',
              fontWeight: tab === 'import' ? 700 : 500,
              cursor: 'pointer'
            }}
            onClick={() => setTab('import')}
          >
            Import Form
          </button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '20px' }}>
          {tab === 'share' ? (
            <>
              {availableForms.length > 1 && (
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Select Form to Share</label>
                  <select
                    className="form-input"
                    value={currentFormId}
                    onChange={(e) => setCurrentFormId(e.target.value)}
                  >
                    {availableForms.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.title} ({f.category})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {currentForm ? (
                <div
                  style={{
                    backgroundColor: 'var(--card-hover)',
                    border: '1px solid var(--card-border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <h3 style={{ fontSize: '1.1rem', margin: 0 }}>{currentForm.title}</h3>
                    <span className="badge-tag" style={{ backgroundColor: 'var(--accent-light)', color: 'var(--accent-clinical)' }}>
                      {currentForm.category}
                    </span>
                  </div>
                  {currentForm.description && (
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
                      {currentForm.description}
                    </p>
                  )}
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {currentForm.fields.length} questions / fields configured
                  </div>

                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '4px' }}>
                    <button
                      type="button"
                      className="btn-primary"
                      style={{ flex: 1, minWidth: '180px', justifyContent: 'center' }}
                      onClick={handleCopyCode}
                    >
                      {copiedCode ? <Check size={16} /> : <Copy size={16} />}
                      {copiedCode ? 'Share Code Copied!' : 'Copy Share Code'}
                    </button>
                    <button
                      type="button"
                      className="btn-secondary"
                      style={{ flex: 1, minWidth: '180px', justifyContent: 'center' }}
                      onClick={handleDownloadFile}
                    >
                      <Download size={16} /> Download .ptform.json
                    </button>
                  </div>
                </div>
              ) : (
                <p style={{ color: 'var(--text-muted)' }}>No form selected.</p>
              )}

              <div
                style={{
                  padding: '10px 14px',
                  backgroundColor: 'var(--accent-light)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.82rem',
                  color: 'var(--accent-clinical)',
                  lineHeight: 1.4
                }}
              >
                <strong>Zero-Cloud Patient Privacy:</strong> Sharing codes contain only the form layout and field questions. No personal patient entries, health records, or identifiers are included.
              </div>
            </>
          ) : (
            <>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <label className="form-label" style={{ marginBottom: 0 }}>
                    Paste Share Code or JSON
                  </label>
                  <button
                    type="button"
                    className="btn-secondary"
                    style={{ padding: '2px 8px', fontSize: '0.78rem', gap: '4px' }}
                    onClick={handlePasteClipboard}
                  >
                    <Copy size={12} /> Paste from Clipboard
                  </button>
                </div>
                <textarea
                  className="form-input"
                  rows={4}
                  placeholder="Paste PTF1_... code or JSON here"
                  value={importInput}
                  onChange={(e) => setImportInput(e.target.value)}
                  style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Or load file:</span>
                <label className="btn-secondary" style={{ padding: '4px 10px', fontSize: '0.8rem', cursor: 'pointer', gap: '4px' }}>
                  <Upload size={14} /> Upload .ptform.json
                  <input
                    type="file"
                    accept=".json,.ptform.json"
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>

              {importError && (
                <div
                  style={{
                    padding: '8px 12px',
                    backgroundColor: 'var(--danger-light, #fee2e2)',
                    color: 'var(--danger)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.85rem'
                  }}
                >
                  {importError}
                </div>
              )}

              {parsedForm && (
                <div
                  style={{
                    backgroundColor: 'var(--card-hover)',
                    border: '1px solid var(--accent-clinical)',
                    borderRadius: 'var(--radius-md)',
                    padding: '14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Sparkles size={16} color="var(--accent-clinical)" />
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-clinical)' }}>
                      Valid Form Detected:
                    </span>
                  </div>
                  <h4 style={{ margin: 0, fontSize: '1rem' }}>{parsedForm.title}</h4>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    {parsedForm.description || 'No description provided'}
                  </p>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Category: <strong>{parsedForm.category}</strong> • Fields: <strong>{parsedForm.fields.length}</strong>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="modal-footer">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Close
          </button>
          {tab === 'import' && (
            <button
              type="button"
              className="btn-primary"
              disabled={!parsedForm || isImporting}
              onClick={handleConfirmImport}
            >
              {isImporting ? 'Importing...' : 'Import & Add Form'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

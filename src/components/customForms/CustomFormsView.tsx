import React, { useState, useMemo } from 'react';
import {
  Plus,
  Share2,
  FilePlus2,
  Edit,
  Trash2,
  ClipboardList,
  Search
} from 'lucide-react';
import { useLogStore } from '../../store/useLogStore';
import type { CustomFormDefinition, CustomFormEntry } from '../../types/customForm';
import { CustomFormEntryCard } from './CustomFormEntryCard';
import { CustomFormEntryModal } from './CustomFormEntryModal';
import { CustomFormBuilderModal } from './CustomFormBuilderModal';
import { CustomFormShareModal } from './CustomFormShareModal';

export const CustomFormsView: React.FC = () => {
  const customForms = useLogStore((s) => s.customForms);
  const customEntries = useLogStore((s) => s.customEntries);
  const activeFormId = useLogStore((s) => s.activeFormId);
  const setActiveFormId = useLogStore((s) => s.setActiveFormId);
  const saveCustomForm = useLogStore((s) => s.saveCustomForm);
  const deleteCustomForm = useLogStore((s) => s.deleteCustomForm);
  const addCustomEntry = useLogStore((s) => s.addCustomEntry);
  const updateCustomEntry = useLogStore((s) => s.updateCustomEntry);
  const deleteCustomEntry = useLogStore((s) => s.deleteCustomEntry);

  // Modal states
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<CustomFormEntry | null>(null);

  const [isBuilderModalOpen, setIsBuilderModalOpen] = useState(false);
  const [editingForm, setEditingForm] = useState<CustomFormDefinition | null>(null);

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareMode, setShareMode] = useState<'share' | 'import'>('share');

  const [searchQuery, setSearchQuery] = useState('');

  // Active form determination
  const activeForm = useMemo(() => {
    return customForms.find((f) => f.id === activeFormId) ?? customForms[0] ?? null;
  }, [customForms, activeFormId]);

  // Entries for the active form
  const entriesForActiveForm = useMemo(() => {
    if (!activeForm) return [];
    return customEntries.filter((e) => e.formId === activeForm.id);
  }, [customEntries, activeForm]);

  // Filtered entries by search
  const filteredEntries = useMemo(() => {
    if (!searchQuery.trim()) return entriesForActiveForm;
    const q = searchQuery.toLowerCase();
    return entriesForActiveForm.filter((e) => {
      if (e.notes && e.notes.toLowerCase().includes(q)) return true;
      for (const val of Object.values(e.responses || {})) {
        if (typeof val === 'string' && val.toLowerCase().includes(q)) return true;
      }
      return false;
    });
  }, [entriesForActiveForm, searchQuery]);

  // Entry Modal Handlers
  const handleOpenNewEntry = () => {
    if (!activeForm) return;
    setEditingEntry(null);
    setIsEntryModalOpen(true);
  };

  const handleOpenEditEntry = (entry: CustomFormEntry) => {
    setEditingEntry(entry);
    setIsEntryModalOpen(true);
  };

  const handleSaveEntry = async (data: Omit<CustomFormEntry, 'id'>) => {
    if (editingEntry) {
      await updateCustomEntry({ ...data, id: editingEntry.id });
    } else {
      await addCustomEntry(data);
    }
  };

  // Form Builder Handlers
  const handleOpenNewForm = () => {
    setEditingForm(null);
    setIsBuilderModalOpen(true);
  };

  const handleOpenEditForm = () => {
    if (!activeForm) return;
    setEditingForm(activeForm);
    setIsBuilderModalOpen(true);
  };

  const handleDeleteActiveForm = async () => {
    if (!activeForm) return;
    const confirm = window.confirm(
      `Are you sure you want to delete "${activeForm.title}" and all its recorded entries?`
    );
    if (confirm) {
      await deleteCustomForm(activeForm.id);
    }
  };

  return (
    <div className="main-view-container">
      {/* View Header */}
      <div className="view-header">
        <div className="view-title-group">
          <h1>Modular Custom Forms</h1>
          <p>Dilator Therapy, Sitting Tolerance, Pelvic Wand & Tailored Protocols</p>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => {
              setShareMode('import');
              setIsShareModalOpen(true);
            }}
          >
            <Share2 size={16} /> Share & Import
          </button>
          <button type="button" className="btn-secondary" onClick={handleOpenNewForm}>
            <FilePlus2 size={16} /> New Form
          </button>
          {activeForm && (
            <button type="button" className="btn-primary" onClick={handleOpenNewEntry}>
              <Plus size={18} /> Log {activeForm.title}
            </button>
          )}
        </div>
      </div>

      {/* Form Tabs Bar */}
      {customForms.length > 0 ? (
        <div
          style={{
            display: 'flex',
            gap: '8px',
            overflowX: 'auto',
            paddingBottom: '8px',
            marginBottom: '16px'
          }}
        >
          {customForms.map((form) => {
            const isSelected = activeForm?.id === form.id;
            const count = customEntries.filter((e) => e.formId === form.id).length;
            return (
              <button
                key={form.id}
                type="button"
                onClick={() => setActiveFormId(form.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: isSelected ? '2px solid var(--accent-clinical)' : '1px solid var(--card-border)',
                  backgroundColor: isSelected ? 'var(--accent-light)' : 'var(--card-surface)',
                  color: isSelected ? 'var(--accent-clinical)' : 'var(--text-primary)',
                  fontWeight: isSelected ? 700 : 500,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  fontSize: '0.88rem'
                }}
              >
                <span>{form.title}</span>
                <span
                  style={{
                    backgroundColor: isSelected ? 'var(--accent-clinical)' : 'var(--bg-secondary)',
                    color: isSelected ? '#ffffff' : 'var(--text-muted)',
                    borderRadius: '12px',
                    padding: '1px 7px',
                    fontSize: '0.75rem',
                    fontWeight: 700
                  }}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="entry-card" style={{ textAlign: 'center', padding: '30px' }}>
          <ClipboardList size={36} color="var(--accent-clinical)" style={{ margin: '0 auto 12px' }} />
          <h3>No Custom Forms Active</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>
            Create a custom symptom diary or import a clinical template to start logging.
          </p>
          <button type="button" className="btn-primary" onClick={handleOpenNewForm}>
            <Plus size={16} /> Create Custom Form
          </button>
        </div>
      )}

      {/* Active Form Card Summary */}
      {activeForm && (
        <div
          className="entry-card"
          style={{
            backgroundColor: 'var(--card-hover)',
            marginBottom: '20px',
            padding: '16px 20px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="badge-tag" style={{ backgroundColor: 'var(--accent-light)', color: 'var(--accent-clinical)' }}>
                  {activeForm.category}
                </span>
                <h2 style={{ fontSize: '1.25rem', margin: 0 }}>{activeForm.title}</h2>
              </div>
              {activeForm.description && (
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '4px', marginBottom: 0 }}>
                  {activeForm.description}
                </p>
              )}
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                {activeForm.fields.length} tracking fields • {entriesForActiveForm.length} total sessions recorded
              </div>
            </div>

            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                type="button"
                className="btn-secondary"
                style={{ padding: '6px 10px', fontSize: '0.82rem' }}
                onClick={() => {
                  setShareMode('share');
                  setIsShareModalOpen(true);
                }}
                title="Share or Export this form definition"
              >
                <Share2 size={14} /> Share Form
              </button>
              <button
                type="button"
                className="btn-secondary"
                style={{ padding: '6px 10px', fontSize: '0.82rem' }}
                onClick={handleOpenEditForm}
                title="Edit form fields"
              >
                <Edit size={14} /> Edit Form
              </button>
              <button
                type="button"
                className="btn-secondary"
                style={{ padding: '6px 10px', fontSize: '0.82rem', color: 'var(--danger)' }}
                onClick={handleDeleteActiveForm}
                title="Delete form and entries"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Entries Section */}
      {activeForm && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, maxWidth: '360px' }}>
              <div className="search-bar" style={{ flex: 1 }}>
                <Search size={16} color="var(--text-muted)" />
                <input
                  type="text"
                  placeholder={`Search ${activeForm.title} logs...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.85rem' }}
                />
              </div>
            </div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Showing {filteredEntries.length} of {entriesForActiveForm.length} logs
            </span>
          </div>

          {filteredEntries.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {filteredEntries.map((entry) => (
                <CustomFormEntryCard
                  key={entry.id}
                  entry={entry}
                  form={activeForm}
                  onEdit={handleOpenEditEntry}
                  onDelete={(id) => deleteCustomEntry(id)}
                />
              ))}
            </div>
          ) : (
            <div className="entry-card" style={{ textAlign: 'center', padding: '36px 16px' }}>
              <p style={{ color: 'var(--text-muted)', marginBottom: '12px' }}>
                {searchQuery ? 'No log entries match your search.' : `No ${activeForm.title} logs recorded yet.`}
              </p>
              <button type="button" className="btn-primary" onClick={handleOpenNewEntry}>
                <Plus size={16} /> Log First Session
              </button>
            </div>
          )}
        </>
      )}

      {/* Entry Modal */}
      {activeForm && (
        <CustomFormEntryModal
          isOpen={isEntryModalOpen}
          form={activeForm}
          initialEntry={editingEntry}
          onSave={handleSaveEntry}
          onClose={() => setIsEntryModalOpen(false)}
        />
      )}

      {/* Form Builder Modal */}
      <CustomFormBuilderModal
        isOpen={isBuilderModalOpen}
        initialForm={editingForm}
        onSave={async (f) => {
          await saveCustomForm(f);
        }}
        onClose={() => setIsBuilderModalOpen(false)}
      />

      {/* Share / Import Modal */}
      <CustomFormShareModal
        isOpen={isShareModalOpen}
        activeMode={shareMode}
        availableForms={customForms}
        selectedForm={activeForm}
        onSaveImportedForm={async (f) => {
          await saveCustomForm(f);
        }}
        onClose={() => setIsShareModalOpen(false)}
      />
    </div>
  );
};

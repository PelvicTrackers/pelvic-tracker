import React, { useState, useMemo } from 'react';
import { Plus, Search, FileText } from 'lucide-react';
import { useLogStore } from '../../store/useLogStore';
import type { PatientNote, NoteCategory } from '../../types';
import { NOTE_CATEGORIES } from '../../data/clinicalScales';
import { NoteEntryCard } from './NoteEntryCard';
import { NoteEntryForm } from './NoteEntryForm';

export const NotesView: React.FC = () => {
  const notes = useLogStore((s) => s.notes);
  const addNote = useLogStore((s) => s.addNote);
  const updateNote = useLogStore((s) => s.updateNote);
  const deleteNote = useLogStore((s) => s.deleteNote);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<PatientNote | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<NoteCategory | 'All'>('All');

  const filteredNotes = useMemo(() => {
    return notes.filter((n) => {
      const matchesCat = selectedCategory === 'All' || n.category === selectedCategory;
      if (!matchesCat) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        n.title.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q) ||
        n.category.toLowerCase().includes(q)
      );
    });
  }, [notes, selectedCategory, searchQuery]);

  const handleOpenNew = () => {
    setEditingNote(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (note: PatientNote) => {
    setEditingNote(note);
    setIsFormOpen(true);
  };

  const handleSaveForm = async (data: Omit<PatientNote, 'id'>) => {
    if (editingNote) {
      await updateNote({ ...data, id: editingNote.id });
    } else {
      await addNote(data);
    }
  };

  return (
    <div className="main-view-container">
      <div className="view-header">
        <div className="view-title-group">
          <h1>Notes & Physical Therapy Questions</h1>
          <p>Journaling, Trigger Tracking, Flare-up Logs & PT Follow-up Lists</p>
        </div>

        <button type="button" className="btn-primary" onClick={handleOpenNew}>
          <Plus size={18} /> Add Note / Question
        </button>
      </div>

      {/* Category Filter Chips */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '8px',
          marginBottom: '16px'
        }}
      >
        <button
          type="button"
          onClick={() => setSelectedCategory('All')}
          className={`badge-tag ${selectedCategory === 'All' ? 'active' : ''}`}
          style={{
            cursor: 'pointer',
            padding: '6px 14px',
            borderRadius: 'var(--radius-full)',
            border: selectedCategory === 'All' ? '1px solid var(--accent-clinical)' : '1px solid var(--card-border)',
            backgroundColor: selectedCategory === 'All' ? 'var(--accent-light)' : 'var(--card-surface)',
            color: selectedCategory === 'All' ? 'var(--accent-clinical)' : 'var(--text-secondary)'
          }}
        >
          All Notes ({notes.length})
        </button>

        {NOTE_CATEGORIES.map((cat) => {
          const count = notes.filter((n) => n.category === cat.value).length;
          const isSelected = selectedCategory === cat.value;
          return (
            <button
              key={cat.value}
              type="button"
              onClick={() => setSelectedCategory(cat.value)}
              style={{
                cursor: 'pointer',
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                border: isSelected ? `2px solid ${cat.color}` : '1px solid var(--card-border)',
                backgroundColor: isSelected ? `${cat.color}15` : 'var(--card-surface)',
                color: isSelected ? cat.color : 'var(--text-secondary)',
                fontWeight: isSelected ? 700 : 500,
                fontSize: '0.8rem',
                whiteSpace: 'nowrap'
              }}
            >
              {cat.label} ({count})
            </button>
          );
        })}
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search
            size={18}
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)'
            }}
          />
          <input
            type="search"
            className="form-input"
            style={{ paddingLeft: '38px' }}
            placeholder="Search notes, triggers, or questions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {filteredNotes.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '48px 20px',
            backgroundColor: 'var(--card-surface)',
            borderRadius: 'var(--radius-lg)',
            border: '1px dashed var(--card-border)'
          }}
        >
          <FileText size={44} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '1.1rem', marginBottom: '6px' }}>No Notes Found</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '380px', margin: '0 auto 18px' }}>
            Write down questions for your next physical therapy appointment, track triggers, or log your home exercise program (HEP) progress.
          </p>
          <button type="button" className="btn-secondary" onClick={handleOpenNew}>
            <Plus size={16} /> Create First Note
          </button>
        </div>
      ) : (
        <div className="feed-list">
          {filteredNotes.map((note) => (
            <NoteEntryCard
              key={note.id}
              note={note}
              onEdit={handleOpenEdit}
              onDelete={deleteNote}
            />
          ))}
        </div>
      )}

      <NoteEntryForm
        isOpen={isFormOpen}
        initialNote={editingNote}
        onSave={handleSaveForm}
        onClose={() => {
          setIsFormOpen(false);
          setEditingNote(null);
        }}
      />
    </div>
  );
};

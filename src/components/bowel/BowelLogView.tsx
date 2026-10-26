import React, { useState, useMemo } from 'react';
import { Plus, Search, CircleGauge } from 'lucide-react';
import { useLogStore } from '../../store/useLogStore';
import type { BowelLogEntry } from '../../types';
import { BowelEntryCard } from './BowelEntryCard';
import { BowelEntryForm } from './BowelEntryForm';

export const BowelLogView: React.FC = () => {
  const bowelEntries = useLogStore((s) => s.bowelEntries);
  const addBowelEntry = useLogStore((s) => s.addBowelEntry);
  const updateBowelEntry = useLogStore((s) => s.updateBowelEntry);
  const deleteBowelEntry = useLogStore((s) => s.deleteBowelEntry);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<BowelLogEntry | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredEntries = useMemo(() => {
    if (!searchQuery.trim()) return bowelEntries;
    const q = searchQuery.toLowerCase();
    return bowelEntries.filter(
      (e) =>
        e.notes.toLowerCase().includes(q) ||
        (e.accidentalLeakage ? e.accidentalLeakage.toLowerCase().includes(q) : false) ||
        e.posturalSplinting.toLowerCase().includes(q)
    );
  }, [bowelEntries, searchQuery]);

  // Clinical Summary Metrics
  const metrics = useMemo(() => {
    if (bowelEntries.length === 0) return null;
    const total = bowelEntries.length;
    const avgStraining = (
      bowelEntries.reduce((acc, curr) => acc + (curr.strainingLevel ?? 0), 0) / total
    ).toFixed(1);
    const incompleteCount = bowelEntries.filter((e) => e.evacuationCompleteness === 'incomplete').length;
    return { total, avgStraining, incompleteCount };
  }, [bowelEntries]);

  const handleOpenNew = () => {
    setEditingEntry(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (entry: BowelLogEntry) => {
    setEditingEntry(entry);
    setIsFormOpen(true);
  };

  const handleSaveForm = async (data: Omit<BowelLogEntry, 'id'>) => {
    if (editingEntry) {
      await updateBowelEntry({ ...data, id: editingEntry.id });
    } else {
      await addBowelEntry(data);
    }
  };

  return (
    <div className="main-view-container">
      <div className="view-header">
        <div className="view-title-group">
          <h1>Bowel & Defecation Diary</h1>
          <p>Bristol Stool Scale, Straining, Tenesmus & Evacuation Record</p>
        </div>

        <button type="button" className="btn-primary" onClick={handleOpenNew}>
          <Plus size={18} /> Log Bowel Movement
        </button>
      </div>

      {metrics && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '12px',
            marginBottom: '20px'
          }}
        >
          <div className="entry-card" style={{ padding: '12px', margin: 0 }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Recorded BMs</span>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--accent-clinical)' }}>
              {metrics.total}
            </div>
          </div>
          <div className="entry-card" style={{ padding: '12px', margin: 0 }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Avg Straining Level</span>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {metrics.avgStraining} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>/ 10</span>
            </div>
          </div>
          <div className="entry-card" style={{ padding: '12px', margin: 0 }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Incomplete Evacuation</span>
            <div
              style={{
                fontSize: '1.4rem',
                fontWeight: 700,
                color: metrics.incompleteCount > 0 ? 'var(--warning)' : 'var(--text-primary)'
              }}
            >
              {metrics.incompleteCount}
            </div>
          </div>
        </div>
      )}

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
            placeholder="Search stool entries, splinting, sensations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {filteredEntries.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '48px 20px',
            backgroundColor: 'var(--card-surface)',
            borderRadius: 'var(--radius-lg)',
            border: '1px dashed var(--card-border)'
          }}
        >
          <CircleGauge size={44} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '1.1rem', marginBottom: '6px' }}>No Bowel Logs Yet</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '380px', margin: '0 auto 18px' }}>
            Tracking Bristol Stool forms, straining levels, splinting habits, and pain helps your physical therapist assess puborectalis coordination.
          </p>
          <button type="button" className="btn-secondary" onClick={handleOpenNew}>
            <Plus size={16} /> Log First BM
          </button>
        </div>
      ) : (
        <div className="feed-list">
          {filteredEntries.map((entry) => (
            <BowelEntryCard
              key={entry.id}
              entry={entry}
              onEdit={handleOpenEdit}
              onDelete={deleteBowelEntry}
            />
          ))}
        </div>
      )}

      <BowelEntryForm
        isOpen={isFormOpen}
        initialEntry={editingEntry}
        onSave={handleSaveForm}
        onClose={() => {
          setIsFormOpen(false);
          setEditingEntry(null);
        }}
      />
    </div>
  );
};

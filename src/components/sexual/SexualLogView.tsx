import React, { useState, useMemo } from 'react';
import { Plus, Search, HeartPulse } from 'lucide-react';
import { useLogStore } from '../../store/useLogStore';
import type { SexualLogEntry } from '../../types';
import { SexualEntryCard } from './SexualEntryCard';
import { SexualEntryForm } from './SexualEntryForm';

export const SexualLogView: React.FC = () => {
  const sexualEntries = useLogStore((s) => s.sexualEntries);
  const addSexualEntry = useLogStore((s) => s.addSexualEntry);
  const updateSexualEntry = useLogStore((s) => s.updateSexualEntry);
  const deleteSexualEntry = useLogStore((s) => s.deleteSexualEntry);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<SexualLogEntry | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredEntries = useMemo(() => {
    if (!searchQuery.trim()) return sexualEntries;
    const q = searchQuery.toLowerCase();
    return sexualEntries.filter(
      (e) =>
        e.activity.toLowerCase().includes(q) ||
        e.position.toLowerCase().includes(q) ||
        e.notes.toLowerCase().includes(q)
    );
  }, [sexualEntries, searchQuery]);

  // Clinical Summary Metrics
  const metrics = useMemo(() => {
    if (sexualEntries.length === 0) return null;
    const total = sexualEntries.length;
    const avgPainDuring = (
      sexualEntries.reduce((acc, curr) => acc + (curr.painDuring ?? 0), 0) / total
    ).toFixed(1);
    const avgArousal = Math.round(
      sexualEntries.reduce((acc, curr) => acc + (curr.erectionArousalScore ?? 0), 0) / total
    );
    return { total, avgPainDuring, avgArousal };
  }, [sexualEntries]);

  const handleOpenNew = () => {
    setEditingEntry(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (entry: SexualLogEntry) => {
    setEditingEntry(entry);
    setIsFormOpen(true);
  };

  const handleSaveForm = async (data: Omit<SexualLogEntry, 'id'>) => {
    if (editingEntry) {
      await updateSexualEntry({ ...data, id: editingEntry.id });
    } else {
      await addSexualEntry(data);
    }
  };

  return (
    <div className="main-view-container">
      <div className="view-header">
        <div className="view-title-group">
          <h1>Sexual Function & Pelvic Pain</h1>
          <p>IPC Sheet Clinical Standard — Pain, Function & Climactic Diary</p>
        </div>

        <button type="button" className="btn-primary" onClick={handleOpenNew}>
          <Plus size={18} /> Log Activity
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
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Recorded Events</span>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--accent-clinical)' }}>
              {metrics.total}
            </div>
          </div>
          <div className="entry-card" style={{ padding: '12px', margin: 0 }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Avg Pain During</span>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {metrics.avgPainDuring} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>/ 10</span>
            </div>
          </div>
          <div className="entry-card" style={{ padding: '12px', margin: 0 }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Avg Arousal / Function</span>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {metrics.avgArousal}%
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
            placeholder="Search by activity, position, symptoms..."
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
          <HeartPulse size={44} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '1.1rem', marginBottom: '6px' }}>No Sexual Health Logs Yet</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '380px', margin: '0 auto 18px' }}>
            Track intimate sessions, pain before/during/after, arousal, and ejaculation to give your physical therapist valuable clinical insights.
          </p>
          <button type="button" className="btn-secondary" onClick={handleOpenNew}>
            <Plus size={16} /> Log First Entry
          </button>
        </div>
      ) : (
        <div className="feed-list">
          {filteredEntries.map((entry) => (
            <SexualEntryCard
              key={entry.id}
              entry={entry}
              onEdit={handleOpenEdit}
              onDelete={deleteSexualEntry}
            />
          ))}
        </div>
      )}

      <SexualEntryForm
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

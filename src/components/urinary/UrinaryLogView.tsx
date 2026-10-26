import React, { useState, useMemo } from 'react';
import { Plus, Search, Droplets, List, CalendarDays } from 'lucide-react';
import { useLogStore } from '../../store/useLogStore';
import type { UrinaryLogEntry } from '../../types';
import { UrinaryEntryCard } from './UrinaryEntryCard';
import { UrinaryEntryForm } from './UrinaryEntryForm';
import { ThreeDayBladderDiaryView } from './ThreeDayBladderDiaryView';
import { formatVolume } from '../../utils/logFormatters';

export const UrinaryLogView: React.FC = () => {
  const urinaryEntries = useLogStore((s) => s.urinaryEntries);
  const addUrinaryEntry = useLogStore((s) => s.addUrinaryEntry);
  const updateUrinaryEntry = useLogStore((s) => s.updateUrinaryEntry);
  const deleteUrinaryEntry = useLogStore((s) => s.deleteUrinaryEntry);
  const volumeUnit = useLogStore((s) => s.volumeUnit);

  const [viewMode, setViewMode] = useState<'feed' | 'diary'>('feed');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<UrinaryLogEntry | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredEntries = useMemo(() => {
    if (!searchQuery.trim()) return urinaryEntries;
    const q = searchQuery.toLowerCase();
    return urinaryEntries.filter(
      (e) =>
        e.fluidType.toLowerCase().includes(q) ||
        e.leakageType.toLowerCase().includes(q) ||
        e.leakageActivity.toLowerCase().includes(q) ||
        e.notes.toLowerCase().includes(q)
    );
  }, [urinaryEntries, searchQuery]);

  // Clinical Summary Metrics
  const metrics = useMemo(() => {
    if (urinaryEntries.length === 0) return null;
    const total = urinaryEntries.length;
    const totalIntake = urinaryEntries.reduce(
      (acc, curr) => acc + (curr.fluidIntakeAmountMl ?? 0),
      0
    );
    const leaksCount = urinaryEntries.filter(
      (e) => e.leakageType !== 'none' || (e.leakageAmount !== 'none' && e.leakageAmount !== undefined)
    ).length;
    return { total, totalIntake, leaksCount };
  }, [urinaryEntries]);

  const handleOpenNew = () => {
    setEditingEntry(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (entry: UrinaryLogEntry) => {
    setEditingEntry(entry);
    setIsFormOpen(true);
  };

  const handleSaveForm = async (data: Omit<UrinaryLogEntry, 'id'>) => {
    if (editingEntry) {
      await updateUrinaryEntry({ ...data, id: editingEntry.id });
    } else {
      await addUrinaryEntry(data);
    }
  };

  return (
    <div className="main-view-container">
      <div className="view-header">
        <div className="view-title-group">
          <h1>Bladder Diary & Fluid Balance</h1>
          <p>Pelvic Floor Incontinence, Frequency, and Hydration Diary</p>
        </div>

        <button type="button" className="btn-primary" onClick={handleOpenNew}>
          <Plus size={18} /> Log Void / Intake
        </button>
      </div>

      {/* View Mode Toggle: All Entries Feed vs 3-Day Clinical Diary */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '16px',
          borderBottom: '1px solid var(--card-border-subtle)',
          paddingBottom: '8px'
        }}
      >
        <button
          type="button"
          onClick={() => setViewMode('feed')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 14px',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            backgroundColor: viewMode === 'feed' ? 'var(--accent-clinical)' : 'transparent',
            color: viewMode === 'feed' ? '#FFFFFF' : 'var(--text-secondary)',
            fontWeight: viewMode === 'feed' ? 700 : 500,
            fontSize: '0.85rem',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <List size={16} /> All Entries Feed ({urinaryEntries.length})
        </button>

        <button
          type="button"
          onClick={() => setViewMode('diary')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 14px',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            backgroundColor: viewMode === 'diary' ? 'var(--accent-clinical)' : 'transparent',
            color: viewMode === 'diary' ? '#FFFFFF' : 'var(--text-secondary)',
            fontWeight: viewMode === 'diary' ? 700 : 500,
            fontSize: '0.85rem',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <CalendarDays size={16} /> 3-Day Clinical Diary
        </button>
      </div>

      {viewMode === 'diary' ? (
        <ThreeDayBladderDiaryView entries={urinaryEntries} onOpenNew={handleOpenNew} />
      ) : (
        <>
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
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Tracked Intake</span>
                <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--accent-secondary)' }}>
                  {formatVolume(metrics.totalIntake, volumeUnit)}
                </div>
              </div>
              <div className="entry-card" style={{ padding: '12px', margin: 0 }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Leakage Incidents</span>
                <div
                  style={{
                    fontSize: '1.4rem',
                    fontWeight: 700,
                    color: metrics.leaksCount > 0 ? 'var(--danger)' : 'var(--success)'
                  }}
                >
                  {metrics.leaksCount}
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
                placeholder="Search fluids, leakage triggers, notes..."
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
              <Droplets size={44} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
              <h3 style={{ fontSize: '1.1rem', marginBottom: '6px' }}>No Bladder Logs Yet</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '380px', margin: '0 auto 18px' }}>
                Logging your fluid intake, void frequency, stream quality, and leakage helps pinpoint pelvic floor dysfunction and bladder irritants.
              </p>
              <button type="button" className="btn-secondary" onClick={handleOpenNew}>
                <Plus size={16} /> Log First Void
              </button>
            </div>
          ) : (
            <div className="feed-list">
              {filteredEntries.map((entry) => (
                <UrinaryEntryCard
                  key={entry.id}
                  entry={entry}
                  onEdit={handleOpenEdit}
                  onDelete={deleteUrinaryEntry}
                />
              ))}
            </div>
          )}
        </>
      )}

      <UrinaryEntryForm
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

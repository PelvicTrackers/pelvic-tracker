import React, { useState } from 'react';
import { X, Check, Clock } from 'lucide-react';
import type { PatientNote, NoteCategory } from '../../types';
import { NOTE_CATEGORIES } from '../../data/clinicalScales';
import { formatDateTime } from '../../utils/logFormatters';
import { DateTimeAdjusterModal } from '../common/DateTimeAdjusterModal';

interface NoteEntryFormProps {
  isOpen: boolean;
  initialNote?: PatientNote | null;
  onSave: (data: Omit<PatientNote, 'id'>) => Promise<void>;
  onClose: () => void;
}

export const NoteEntryForm: React.FC<NoteEntryFormProps> = ({
  isOpen,
  initialNote,
  onSave,
  onClose
}) => {
  const [timestamp, setTimestamp] = useState<string>(
    initialNote?.timestamp ?? new Date().toISOString()
  );
  const [category, setCategory] = useState<NoteCategory>(
    initialNote?.category ?? 'PT Question'
  );
  const [title, setTitle] = useState<string>(initialNote?.title ?? '');
  const [content, setContent] = useState<string>(initialNote?.content ?? '');

  const [showTimeAdjuster, setShowTimeAdjuster] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      await onSave({
        timestamp,
        category,
        title,
        content
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="note-form-title">
        <div className="modal-content">
          <div className="modal-header">
            <div>
              <h2 id="note-form-title">
                {initialNote ? 'Edit Note' : 'Add Note or PT Question'}
              </h2>
              <button
                type="button"
                onClick={() => setShowTimeAdjuster(true)}
                className="privacy-badge"
                style={{ marginTop: '4px' }}
                aria-label="Adjust date and time"
              >
                <Clock size={12} />
                <span>{formatDateTime(timestamp)} (Tap to Adjust)</span>
              </button>
            </div>
            <button
              type="button"
              className="icon-btn"
              onClick={onClose}
              aria-label="Close modal"
              style={{ width: '40px', height: '40px' }}
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="note-category" className="form-label">Category</label>
                <select
                  id="note-category"
                  className="form-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as NoteCategory)}
                >
                  {NOTE_CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="note-title" className="form-label">Title / Topic (Optional)</label>
                <input
                  type="text"
                  id="note-title"
                  className="form-input"
                  placeholder="e.g. Flare-up after long car ride, or Question about pelvic wand"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="note-content" className="form-label">Details / Observations</label>
                <textarea
                  id="note-content"
                  className="form-textarea"
                  style={{ minHeight: '130px' }}
                  placeholder="Write your symptom observations, questions to bring up during your next PT session, or exercise routine details..."
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn-secondary" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={isSubmitting || !content.trim()}>
                <Check size={18} /> {initialNote ? 'Update Note' : 'Save Note'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <DateTimeAdjusterModal
        isOpen={showTimeAdjuster}
        currentIso={timestamp}
        onConfirm={setTimestamp}
        onClose={() => setShowTimeAdjuster(false)}
      />
    </>
  );
};

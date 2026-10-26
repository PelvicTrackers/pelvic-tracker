import React, { useState } from 'react';
import { Clock, Check, X } from 'lucide-react';
import { toInputDateTimeLocal, fromInputDateTimeLocal } from '../../utils/logFormatters';

interface DateTimeAdjusterModalProps {
  isOpen: boolean;
  currentIso: string;
  onConfirm: (adjustedIso: string) => void;
  onClose: () => void;
}

export const DateTimeAdjusterModal: React.FC<DateTimeAdjusterModalProps> = ({
  isOpen,
  currentIso,
  onConfirm,
  onClose
}) => {
  const [localVal, setLocalVal] = useState(() => toInputDateTimeLocal(currentIso));

  if (!isOpen) return null;

  const applyOffsetMinutes = (minutes: number) => {
    const d = new Date(fromInputDateTimeLocal(localVal));
    d.setMinutes(d.getMinutes() + minutes);
    setLocalVal(toInputDateTimeLocal(d.toISOString()));
  };

  const setPreset = (preset: 'now' | 'yesterday') => {
    if (preset === 'now') {
      setLocalVal(toInputDateTimeLocal(new Date().toISOString()));
    } else if (preset === 'yesterday') {
      const d = new Date();
      d.setDate(d.getDate() - 1);
      setLocalVal(toInputDateTimeLocal(d.toISOString()));
    }
  };

  const handleSave = () => {
    const iso = fromInputDateTimeLocal(localVal);
    onConfirm(iso);
    onClose();
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="datetime-modal-title">
      <div className="modal-content" style={{ maxWidth: '420px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={20} color="var(--accent-clinical)" />
            <h2 id="datetime-modal-title" style={{ fontSize: '1.1rem' }}>Adjust Timestamp</h2>
          </div>
          <button
            type="button"
            className="icon-btn"
            onClick={onClose}
            aria-label="Close timestamp modal"
            style={{ width: '40px', height: '40px' }}
          >
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <div className="form-group">
            <label htmlFor="dt-picker" className="form-label">
              Date & Time
            </label>
            <input
              type="datetime-local"
              id="dt-picker"
              className="form-input"
              value={localVal}
              onChange={(e) => setLocalVal(e.target.value)}
              style={{ fontSize: '1rem', minHeight: '48px' }}
            />
          </div>

          <div style={{ marginTop: '16px' }}>
            <span className="form-label" style={{ marginBottom: '8px' }}>
              Quick Presets
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setPreset('now')}
                style={{ justifyContent: 'center', fontSize: '0.8rem', padding: '8px 4px' }}
              >
                Now
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => applyOffsetMinutes(-15)}
                style={{ justifyContent: 'center', fontSize: '0.8rem', padding: '8px 4px' }}
              >
                -15m
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => applyOffsetMinutes(-30)}
                style={{ justifyContent: 'center', fontSize: '0.8rem', padding: '8px 4px' }}
              >
                -30m
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => applyOffsetMinutes(-60)}
                style={{ justifyContent: 'center', fontSize: '0.8rem', padding: '8px 4px' }}
              >
                -1 hr
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => applyOffsetMinutes(-120)}
                style={{ justifyContent: 'center', fontSize: '0.8rem', padding: '8px 4px' }}
              >
                -2 hrs
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setPreset('yesterday')}
                style={{ justifyContent: 'center', fontSize: '0.8rem', padding: '8px 4px' }}
              >
                Yesterday
              </button>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn-primary" onClick={handleSave}>
            <Check size={18} /> Apply Time
          </button>
        </div>
      </div>
    </div>
  );
};

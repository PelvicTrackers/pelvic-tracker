import React from 'react';
import { Minus, Plus, RotateCcw } from 'lucide-react';

export interface DurationPickerProps {
  label?: string;
  value: number | null; // minutes or null if N/A
  onChange: (val: number) => void;
  min?: number;
  max?: number;
  id?: string;
  helperText?: string;
  disabled?: boolean;
  isNA?: boolean;
  hideLabel?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const DurationPicker: React.FC<DurationPickerProps> = ({
  label,
  value,
  onChange,
  min = 0,
  max = 300,
  id,
  helperText,
  disabled = false,
  isNA = false,
  hideLabel = false,
  className = '',
  style
}) => {
  const isInactive = Boolean(disabled || isNA || value === null);
  const safeVal = typeof value === 'number' && !isNA ? value : min;

  const handleStep = (delta: number) => {
    if (isInactive) return;
    const next = Math.max(min, Math.min(max, safeVal + delta));
    onChange(next);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isInactive) return;
    const raw = e.target.value.trim();
    if (raw === '') {
      onChange(min);
      return;
    }
    const parsed = parseInt(raw, 10);
    if (!isNaN(parsed)) {
      const clamped = Math.max(min, Math.min(max, parsed));
      onChange(clamped);
    }
  };

  const formatHoursDisplay = (mins: number): string | null => {
    if (mins < 60) return null;
    const hrs = Math.floor(mins / 60);
    const remMins = mins % 60;
    if (remMins === 0) return `${hrs} hr${hrs > 1 ? 's' : ''}`;
    return `${hrs} hr${hrs > 1 ? 's' : ''} ${remMins} m`;
  };

  const formattedHours = !isInactive ? formatHoursDisplay(safeVal) : null;

  return (
    <div className={`form-group ${className}`.trim()} style={style}>
      {!hideLabel && label && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <label htmlFor={id} className="form-label" style={{ marginBottom: 0 }}>
            {label}
          </label>
          <span
            className="slider-val-badge"
            style={{
              backgroundColor: isInactive ? 'var(--bg-secondary, #EDF2F0)' : 'var(--accent-light, #E3F2ED)',
              color: isInactive ? 'var(--text-muted, #73847C)' : 'var(--accent-clinical, #2B7A68)',
              border: isInactive ? '1px solid var(--card-border, #DCE5E0)' : '1px solid var(--accent-clinical, #2B7A68)',
              fontSize: '0.85rem',
              padding: '3px 8px',
              borderRadius: 'var(--radius-sm, 8px)',
              fontWeight: 600
            }}
          >
            {isInactive ? 'N/A' : `${safeVal} min${formattedHours ? ` (${formattedHours})` : ''}`}
          </span>
        </div>
      )}

      {/* Main Touch Number Display & Steppers */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          width: '100%'
        }}
      >
        <button
          type="button"
          onClick={() => handleStep(-1)}
          disabled={isInactive || safeVal <= min}
          className="slider-step-btn"
          aria-label={label ? `Decrease ${label} by 1 minute` : 'Decrease by 1 minute'}
          style={{ width: '48px', height: '48px', flexShrink: 0 }}
        >
          <Minus size={18} />
        </button>

        <div
          style={{
            flex: 1,
            minHeight: '48px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'var(--bg-secondary, #EDF2F0)',
            borderRadius: 'var(--radius-md, 12px)',
            border: '1px solid var(--card-border, #DCE5E0)',
            padding: '4px 8px'
          }}
        >
          {isInactive ? (
            <span
              style={{
                fontWeight: 700,
                fontSize: '1.25rem',
                color: 'var(--text-muted, #73847C)'
              }}
            >
              N/A
            </span>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
              <input
                type="number"
                id={id}
                min={min}
                max={max}
                step={1}
                value={safeVal}
                onChange={handleInputChange}
                inputMode="numeric"
                pattern="[0-9]*"
                disabled={isInactive}
                className="duration-input"
                style={{ width: '70px' }}
                aria-label={label ? `${label} in minutes, currently ${safeVal}` : `Duration in minutes, currently ${safeVal}`}
              />
              <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-secondary, #4A5B53)' }}>
                min
              </span>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => handleStep(1)}
          disabled={isInactive || safeVal >= max}
          className="slider-step-btn"
          aria-label={label ? `Increase ${label} by 1 minute` : 'Increase by 1 minute'}
          style={{ width: '48px', height: '48px', flexShrink: 0 }}
        >
          <Plus size={18} />
        </button>
      </div>

      {/* Mobile-Friendly Quick Increment & Preset Buttons */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '6px',
          marginTop: '8px'
        }}
      >
        <button
          type="button"
          onClick={() => handleStep(-10)}
          disabled={isInactive || safeVal <= min}
          className="duration-quick-btn"
          aria-label="Subtract 10 minutes"
        >
          -10 min
        </button>

        <button
          type="button"
          onClick={() => handleStep(10)}
          disabled={isInactive || safeVal >= max}
          className="duration-quick-btn"
          aria-label="Add 10 minutes"
        >
          +10 min
        </button>

        <button
          type="button"
          onClick={() => handleStep(60)}
          disabled={isInactive || safeVal >= max}
          className="duration-quick-btn"
          aria-label="Add 60 minutes (1 hour)"
        >
          +60 min (1 hr)
        </button>

        <button
          type="button"
          onClick={() => onChange(min)}
          disabled={isInactive || safeVal <= min}
          className="duration-quick-btn"
          aria-label="Clear duration to 0"
          style={{ gap: '4px' }}
        >
          <RotateCcw size={13} />
          <span>Clear</span>
        </button>
      </div>

      {helperText && <div className="form-help" style={{ marginTop: '6px' }}>{helperText}</div>}
    </div>
  );
};

import React from 'react';
import { Minus, Plus } from 'lucide-react';
import { DualStepSpinner } from './DualStepSpinner';

export interface NumberSpinnerProps {
  label?: string;
  value: number | null;
  onChange: (val: number) => void;
  step?: number;
  largeStep?: number;
  dualStep?: boolean;
  min?: number;
  max?: number;
  unit?: string;
  id?: string;
  helperText?: string;
  disabled?: boolean;
  isNA?: boolean;
  hideLabel?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const NumberSpinner: React.FC<NumberSpinnerProps> = ({
  label,
  value,
  onChange,
  step = 1,
  largeStep = 5,
  dualStep = true,
  min = 0,
  max = 1000,
  unit = '',
  id,
  helperText,
  disabled = false,
  isNA = false,
  hideLabel = false,
  className = '',
  style
}) => {
  if (dualStep) {
    return (
      <DualStepSpinner
        label={label}
        value={value}
        onChange={onChange}
        step={step}
        largeStep={largeStep}
        min={min}
        max={max}
        unit={unit}
        id={id}
        helperText={helperText}
        disabled={disabled}
        isNA={isNA}
        hideLabel={hideLabel}
        className={className}
        style={style}
      />
    );
  }

  const isInactive = Boolean(disabled || isNA);
  const safeVal = typeof value === 'number' && !isNA ? value : min;

  const handleDec = () => {
    if (isInactive) return;
    const next = Math.max(min, safeVal - step);
    onChange(next);
  };

  const handleInc = () => {
    if (isInactive) return;
    const next = Math.min(max, safeVal + step);
    onChange(next);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isInactive) return;
    const valStr = e.target.value.trim();
    if (valStr === '') {
      onChange(min);
      return;
    }
    const parsed = parseInt(valStr, 10);
    if (!isNaN(parsed)) {
      const clamped = Math.max(min, Math.min(max, parsed));
      onChange(clamped);
    }
  };

  return (
    <div className={`form-group ${className}`.trim()} style={style}>
      {!hideLabel && label && (
        <label htmlFor={id} className="form-label">
          {label}
        </label>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          type="button"
          onClick={handleDec}
          disabled={isInactive || safeVal <= min}
          className="stepper-btn"
          aria-label={label ? `Decrease ${label}` : 'Decrease value'}
          style={{
            minWidth: '48px',
            minHeight: '48px',
            height: '48px',
            borderRadius: 'var(--radius-md, 12px)',
            border: '1px solid var(--card-border, #DCE5E0)',
            backgroundColor: 'var(--card-surface, #FFFFFF)',
            color: 'var(--text-primary, #1C2D27)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: isInactive || safeVal <= min ? 0.35 : 1,
            cursor: isInactive || safeVal <= min ? 'not-allowed' : 'pointer'
          }}
        >
          <Minus size={18} />
        </button>

        <div
          style={{
            flex: 1,
            minWidth: '68px',
            minHeight: '48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'var(--bg-secondary, #EDF2F0)',
            borderRadius: 'var(--radius-md, 12px)',
            border: '1px solid var(--card-border, #DCE5E0)',
            padding: '0 8px'
          }}
        >
          {isInactive ? (
            <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-muted, #73847C)' }}>
              N/A
            </span>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
              <input
                type="number"
                id={id}
                min={min}
                max={max}
                step={step}
                value={safeVal}
                onChange={handleInputChange}
                aria-label={label ?? 'Value'}
                style={{
                  width: '100%',
                  height: '46px',
                  background: 'transparent',
                  border: 'none',
                  textAlign: 'center',
                  fontWeight: 700,
                  fontSize: '1.1rem',
                  color: 'var(--text-primary, #1C2D27)',
                  outline: 'none',
                  padding: 0
                }}
              />
              {unit && (
                <span
                  style={{
                    fontSize: '0.8rem',
                    color: 'var(--text-muted, #73847C)',
                    marginLeft: '2px',
                    fontWeight: 600,
                    pointerEvents: 'none',
                    userSelect: 'none'
                  }}
                >
                  {unit}
                </span>
              )}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={handleInc}
          disabled={isInactive || safeVal >= max}
          className="stepper-btn"
          aria-label={label ? `Increase ${label}` : 'Increase value'}
          style={{
            minWidth: '48px',
            minHeight: '48px',
            height: '48px',
            borderRadius: 'var(--radius-md, 12px)',
            border: '1px solid var(--card-border, #DCE5E0)',
            backgroundColor: 'var(--card-surface, #FFFFFF)',
            color: 'var(--text-primary, #1C2D27)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: isInactive || safeVal >= max ? 0.35 : 1,
            cursor: isInactive || safeVal >= max ? 'not-allowed' : 'pointer'
          }}
        >
          <Plus size={18} />
        </button>
      </div>
      {helperText && <div className="form-help">{helperText}</div>}
    </div>
  );
};

export { DualStepSpinner };

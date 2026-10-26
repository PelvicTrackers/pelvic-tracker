import React from 'react';

export interface DualStepSpinnerProps {
  label?: string;
  value: number | null;
  onChange: (val: number) => void;
  step?: number;
  largeStep?: number;
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

export const DualStepSpinner: React.FC<DualStepSpinnerProps> = ({
  label,
  value,
  onChange,
  step = 1,
  largeStep = 5,
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
  const isInactive = Boolean(disabled || isNA);
  const safeVal = typeof value === 'number' && !isNA ? value : min;

  const handleDecLarge = () => {
    if (isInactive) return;
    const next = Math.max(min, safeVal - largeStep);
    onChange(next);
  };

  const handleDecSmall = () => {
    if (isInactive) return;
    const next = Math.max(min, safeVal - step);
    onChange(next);
  };

  const handleIncSmall = () => {
    if (isInactive) return;
    const next = Math.min(max, safeVal + step);
    onChange(next);
  };

  const handleIncLarge = () => {
    if (isInactive) return;
    const next = Math.min(max, safeVal + largeStep);
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

  const btnStyle: React.CSSProperties = {
    minWidth: '48px',
    minHeight: '48px',
    height: '48px',
    borderRadius: 'var(--radius-md, 12px)',
    border: '1px solid var(--card-border, #DCE5E0)',
    backgroundColor: 'var(--card-surface, #FFFFFF)',
    color: 'var(--text-primary, #1C2D27)',
    fontWeight: 700,
    fontSize: '0.88rem',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 8px',
    userSelect: 'none',
    boxSizing: 'border-box',
    transition: 'background-color 0.15s ease, opacity 0.15s ease, transform 0.05s ease'
  };

  return (
    <div className={`form-group ${className}`.trim()} style={style}>
      {!hideLabel && label && (
        <label htmlFor={id} className="form-label">
          {label}
        </label>
      )}

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          width: '100%'
        }}
      >
        {/* [-largeStep] Button */}
        <button
          type="button"
          onClick={handleDecLarge}
          disabled={isInactive || safeVal <= min}
          className="stepper-btn"
          aria-label={label ? `Decrease ${label} by ${largeStep}` : `Decrease by ${largeStep}`}
          style={{
            ...btnStyle,
            opacity: isInactive || safeVal <= min ? 0.35 : 1,
            cursor: isInactive || safeVal <= min ? 'not-allowed' : 'pointer'
          }}
        >
          -{largeStep}
        </button>

        {/* [-step] Button */}
        <button
          type="button"
          onClick={handleDecSmall}
          disabled={isInactive || safeVal <= min}
          className="stepper-btn"
          aria-label={label ? `Decrease ${label} by ${step}` : `Decrease by ${step}`}
          style={{
            ...btnStyle,
            opacity: isInactive || safeVal <= min ? 0.35 : 1,
            cursor: isInactive || safeVal <= min ? 'not-allowed' : 'pointer'
          }}
        >
          -{step}
        </button>

        {/* Center Numeric Display / Input */}
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
            padding: '0 8px',
            position: 'relative'
          }}
        >
          {isInactive ? (
            <span
              style={{
                fontWeight: 700,
                fontSize: '1rem',
                color: 'var(--text-muted, #73847C)'
              }}
            >
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
                aria-label={label ?? 'Duration value'}
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

        {/* [+step] Button */}
        <button
          type="button"
          onClick={handleIncSmall}
          disabled={isInactive || safeVal >= max}
          className="stepper-btn"
          aria-label={label ? `Increase ${label} by ${step}` : `Increase by ${step}`}
          style={{
            ...btnStyle,
            opacity: isInactive || safeVal >= max ? 0.35 : 1,
            cursor: isInactive || safeVal >= max ? 'not-allowed' : 'pointer'
          }}
        >
          +{step}
        </button>

        {/* [+largeStep] Button */}
        <button
          type="button"
          onClick={handleIncLarge}
          disabled={isInactive || safeVal >= max}
          className="stepper-btn"
          aria-label={label ? `Increase ${label} by ${largeStep}` : `Increase by ${largeStep}`}
          style={{
            ...btnStyle,
            opacity: isInactive || safeVal >= max ? 0.35 : 1,
            cursor: isInactive || safeVal >= max ? 'not-allowed' : 'pointer'
          }}
        >
          +{largeStep}
        </button>
      </div>

      {helperText && <div className="form-help">{helperText}</div>}
    </div>
  );
};

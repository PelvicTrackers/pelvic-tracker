import React from 'react';

export interface ClinicalSliderProps {
  label?: string;
  value: number | null; // 0-100 or null if N/A
  onChange: (val: number) => void;
  step?: number;
  min?: number;
  max?: number;
  unit?: string;
  id?: string;
  helperText?: string;
  isNA?: boolean;
  disabled?: boolean;
  hideLabel?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const ClinicalSlider: React.FC<ClinicalSliderProps> = ({
  label,
  value,
  onChange,
  step = 1,
  min = 0,
  max = 100,
  unit = '%',
  id,
  helperText,
  isNA = false,
  disabled = false,
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

  // Generate tick marks every 10% across the range
  const tickInterval = Math.max(1, Math.round((max - min) / 10));
  const tickMarks: number[] = [];
  for (let t = min; t <= max; t += tickInterval) {
    tickMarks.push(t);
  }
  if (tickMarks[tickMarks.length - 1] !== max) {
    tickMarks.push(max);
  }

  return (
    <div className={`form-group ${className}`.trim()} style={style}>
      {!hideLabel && label ? (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
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
              fontWeight: 600,
              minWidth: '38px',
              textAlign: 'center'
            }}
          >
            {isInactive ? 'N/A' : `${safeVal}${unit}`}
          </span>
        </div>
      ) : (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '6px' }}>
          <span
            className="slider-val-badge"
            style={{
              backgroundColor: isInactive ? 'var(--bg-secondary, #EDF2F0)' : 'var(--accent-light, #E3F2ED)',
              color: isInactive ? 'var(--text-muted, #73847C)' : 'var(--accent-clinical, #2B7A68)',
              border: isInactive ? '1px solid var(--card-border, #DCE5E0)' : '1px solid var(--accent-clinical, #2B7A68)',
              fontSize: '0.85rem',
              padding: '3px 8px',
              borderRadius: 'var(--radius-sm, 8px)',
              fontWeight: 600,
              minWidth: '38px',
              textAlign: 'center'
            }}
          >
            {isInactive ? 'N/A' : `${safeVal}${unit}`}
          </span>
        </div>
      )}

      <input
        type="range"
        id={id}
        min={min}
        max={max}
        step={step}
        value={safeVal}
        disabled={isInactive}
        onChange={(e) => {
          if (!isInactive) {
            onChange(Number(e.target.value));
          }
        }}
        style={{
          width: '100%',
          height: '8px',
          accentColor: isInactive ? 'var(--text-muted, #73847C)' : 'var(--accent-clinical, #2B7A68)',
          cursor: isInactive ? 'not-allowed' : 'pointer',
          opacity: isInactive ? 0.45 : 1,
          transition: 'opacity 0.2s ease, accent-color 0.2s ease'
        }}
        aria-label={label ? `${label} slider, currently ${isInactive ? 'N/A' : `${safeVal}${unit}`}` : `Slider value ${safeVal}${unit}`}
        aria-disabled={isInactive}
      />

      {/* Visual Tick Marks every 10% */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          height: '6px',
          margin: '4px 2px 2px',
          padding: '0 2px'
        }}
        aria-hidden="true"
      >
        {tickMarks.map((tick) => {
          const isMajor = tick === min || tick === Math.round((min + max) / 2) || tick === max;
          const isFilled = !isInactive && safeVal >= tick;
          return (
            <div
              key={tick}
              style={{
                width: isMajor ? '2px' : '1px',
                height: isMajor ? '7px' : '4px',
                borderRadius: '1px',
                backgroundColor: isFilled
                  ? 'var(--accent-clinical, #2B7A68)'
                  : 'var(--card-border, #DCE5E0)',
                transition: 'background-color 0.15s ease'
              }}
            />
          );
        })}
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '0.72rem',
          color: 'var(--text-muted, #73847C)',
          marginTop: '2px',
          userSelect: 'none'
        }}
        aria-hidden="true"
      >
        <span>{min}{unit}</span>
        <span>{Math.round((min + max) / 2)}{unit}</span>
        <span>{max}{unit}</span>
      </div>

      {/* Quick Increment Buttons (-10%, -5%, +5%, +10%) */}
      <div
        style={{
          display: 'flex',
          gap: '6px',
          marginTop: '8px',
          justifyContent: 'center'
        }}
      >
        <button
          type="button"
          className="slider-step-btn"
          onClick={() => handleStep(-10)}
          disabled={isInactive || safeVal <= min}
          aria-label={label ? `Decrease ${label} by 10%` : 'Decrease by 10%'}
          style={{ flex: 1, minHeight: '38px' }}
        >
          -10%
        </button>
        <button
          type="button"
          className="slider-step-btn"
          onClick={() => handleStep(-5)}
          disabled={isInactive || safeVal <= min}
          aria-label={label ? `Decrease ${label} by 5%` : 'Decrease by 5%'}
          style={{ flex: 1, minHeight: '38px' }}
        >
          -5%
        </button>
        <button
          type="button"
          className="slider-step-btn"
          onClick={() => handleStep(5)}
          disabled={isInactive || safeVal >= max}
          aria-label={label ? `Increase ${label} by 5%` : 'Increase by 5%'}
          style={{ flex: 1, minHeight: '38px' }}
        >
          +5%
        </button>
        <button
          type="button"
          className="slider-step-btn"
          onClick={() => handleStep(10)}
          disabled={isInactive || safeVal >= max}
          aria-label={label ? `Increase ${label} by 10%` : 'Increase by 10%'}
          style={{ flex: 1, minHeight: '38px' }}
        >
          +10%
        </button>
      </div>

      {helperText && <div className="form-help">{helperText}</div>}
    </div>
  );
};

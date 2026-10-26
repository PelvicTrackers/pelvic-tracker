import React from 'react';
import { getPainColor } from '../../utils/logFormatters';

export interface ClinicalPainSliderProps {
  label?: string;
  value: number | null; // 0-10 NRS or null
  onChange: (val: number) => void;
  id?: string;
  helperText?: string;
  isNA?: boolean;
  disabled?: boolean;
  hideLabel?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const ClinicalPainSlider: React.FC<ClinicalPainSliderProps> = ({
  label,
  value,
  onChange,
  id,
  helperText,
  isNA = false,
  disabled = false,
  hideLabel = false,
  className = '',
  style
}) => {
  const isInactive = Boolean(isNA || value === null || disabled);
  const safeVal = typeof value === 'number' && !isNA ? value : 0;
  const color = isInactive ? 'var(--text-muted, #73847C)' : getPainColor(safeVal);

  const handleStep = (delta: number) => {
    if (isInactive) return;
    const next = Math.max(0, Math.min(10, safeVal + delta));
    onChange(next);
  };

  return (
    <div className={`form-group ${className}`.trim()} style={style}>
      {/* Header with Label and Badge */}
      {!hideLabel && label ? (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <label htmlFor={id} className="form-label" style={{ marginBottom: 0 }}>
            {label}
          </label>
          <span
            className="slider-val-badge"
            style={{
              backgroundColor: isInactive ? 'var(--bg-secondary, #EDF2F0)' : color,
              color: isInactive ? 'var(--text-muted, #73847C)' : '#FFFFFF',
              border: isInactive ? '1px solid var(--card-border, #DCE5E0)' : 'none',
              fontSize: '0.85rem',
              padding: '3px 8px',
              borderRadius: 'var(--radius-sm, 8px)',
              fontWeight: 600,
              minWidth: '38px',
              textAlign: 'center'
            }}
          >
            {isInactive ? 'N/A' : `${safeVal} / 10 NRS`}
          </span>
        </div>
      ) : (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '6px' }}>
          <span
            className="slider-val-badge"
            style={{
              backgroundColor: isInactive ? 'var(--bg-secondary, #EDF2F0)' : color,
              color: isInactive ? 'var(--text-muted, #73847C)' : '#FFFFFF',
              border: isInactive ? '1px solid var(--card-border, #DCE5E0)' : 'none',
              fontSize: '0.85rem',
              padding: '3px 8px',
              borderRadius: 'var(--radius-sm, 8px)',
              fontWeight: 600,
              minWidth: '38px',
              textAlign: 'center'
            }}
          >
            {isInactive ? 'N/A' : `${safeVal} / 10 NRS`}
          </span>
        </div>
      )}

      {/* Slider Input */}
      <input
        type="range"
        id={id}
        min={0}
        max={10}
        step={1}
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
          accentColor: isInactive ? 'var(--text-muted, #73847C)' : color,
          cursor: isInactive ? 'not-allowed' : 'pointer',
          opacity: isInactive ? 0.45 : 1,
          transition: 'opacity 0.2s ease, accent-color 0.2s ease'
        }}
        aria-label={label ? `${label} pain rating 0 to 10 NRS` : 'Pain rating 0 to 10 NRS'}
        aria-disabled={isInactive}
      />

      {/* Objective Color Progression Bar */}
      <div
        style={{
          height: '4px',
          borderRadius: '2px',
          background: isInactive
            ? 'var(--card-border, #DCE5E0)'
            : 'linear-gradient(to right, var(--pain-0, #2E7D32) 0%, var(--pain-mild, #689F38) 30%, var(--pain-mod, #E68A00) 60%, var(--pain-high, #E65100) 80%, var(--pain-severe, #C62828) 100%)',
          margin: '6px 0 2px',
          opacity: isInactive ? 0.3 : 0.85
        }}
        aria-hidden="true"
      />

      {/* Visual Tick Markers (Clear, emphasized markers at anchors 0, 5, and 10) */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          margin: '2px 2px 2px',
          height: '8px'
        }}
        aria-hidden="true"
      >
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
          const isAnchor = num === 0 || num === 5 || num === 10;
          const isSelected = !isInactive && safeVal === num;
          return (
            <div
              key={num}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: '18px'
              }}
            >
              <div
                style={{
                  width: isAnchor ? '3px' : '1px',
                  height: isAnchor ? '8px' : '4px',
                  borderRadius: '1.5px',
                  backgroundColor: isSelected
                    ? color
                    : isAnchor
                    ? 'var(--text-secondary, #4A5B53)'
                    : 'var(--card-border, #DCE5E0)',
                  transition: 'background-color 0.15s ease'
                }}
              />
            </div>
          );
        })}
      </div>

      {/* Strictly Objective 0-10 NRS Numeric Scale with Prominent 0, 5, 10 Anchors */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.75rem',
          color: isInactive ? 'var(--text-muted, #73847C)' : 'var(--text-secondary, #4A5B53)',
          padding: '0 2px',
          userSelect: 'none'
        }}
        aria-hidden="true"
      >
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
          const isAnchor = num === 0 || num === 5 || num === 10;
          const isSelected = !isInactive && safeVal === num;
          return (
            <span
              key={num}
              style={{
                width: '18px',
                textAlign: 'center',
                fontWeight: isSelected ? 800 : isAnchor ? 700 : 400,
                color: isSelected
                  ? 'var(--text-primary, #1C2D27)'
                  : isAnchor
                  ? 'var(--text-primary, #1C2D27)'
                  : undefined,
                transform: isSelected ? 'scale(1.2)' : undefined,
                transition: 'transform 0.1s ease, color 0.1s ease'
              }}
            >
              {num}
            </span>
          );
        })}
      </div>

      {/* Quick Step Buttons (-2, -1, +1, +2) */}
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
          onClick={() => handleStep(-2)}
          disabled={isInactive || safeVal <= 0}
          aria-label={label ? `Decrease ${label} by 2` : 'Decrease pain by 2'}
          style={{ flex: 1, minHeight: '38px' }}
        >
          -2
        </button>
        <button
          type="button"
          className="slider-step-btn"
          onClick={() => handleStep(-1)}
          disabled={isInactive || safeVal <= 0}
          aria-label={label ? `Decrease ${label} by 1` : 'Decrease pain by 1'}
          style={{ flex: 1, minHeight: '38px' }}
        >
          -1
        </button>
        <button
          type="button"
          className="slider-step-btn"
          onClick={() => handleStep(1)}
          disabled={isInactive || safeVal >= 10}
          aria-label={label ? `Increase ${label} by 1` : 'Increase pain by 1'}
          style={{ flex: 1, minHeight: '38px' }}
        >
          +1
        </button>
        <button
          type="button"
          className="slider-step-btn"
          onClick={() => handleStep(2)}
          disabled={isInactive || safeVal >= 10}
          aria-label={label ? `Increase ${label} by 2` : 'Increase pain by 2'}
          style={{ flex: 1, minHeight: '38px' }}
        >
          +2
        </button>
      </div>

      {helperText && <div className="form-help">{helperText}</div>}
    </div>
  );
};

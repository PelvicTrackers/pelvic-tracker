import React from 'react';
import { BRISTOL_STOOL_SCALE, type BristolTypeDetail } from '../../data/clinicalScales';
import type { BristolStoolType } from '../../types';

interface BristolStoolPickerProps {
  value: BristolStoolType | null;
  onChange: (val: BristolStoolType) => void;
  disabled?: boolean;
  isNA?: boolean;
  hideLabel?: boolean;
}

export const BristolStoolPicker: React.FC<BristolStoolPickerProps> = ({
  value,
  onChange,
  disabled = false,
  isNA = false,
  hideLabel = false
}) => {
  const isInactive = Boolean(disabled || isNA);

  return (
    <div className="form-group" style={{ marginBottom: 0 }}>
      {!hideLabel && <label className="form-label">Bristol Stool Scale (Type 1–7)</label>}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
          gap: '8px'
        }}
        role="radiogroup"
        aria-label="Bristol Stool Scale selection"
      >
        {BRISTOL_STOOL_SCALE.map((item: BristolTypeDetail) => {
          const isSelected = !isInactive && value === item.type;
          return (
            <button
              key={item.type}
              type="button"
              role="radio"
              aria-checked={isSelected}
              disabled={isInactive}
              onClick={() => {
                if (!isInactive) {
                  onChange(item.type);
                }
              }}
              style={{
                minHeight: '80px',
                padding: '10px 8px',
                borderRadius: 'var(--radius-md)',
                border: isSelected
                  ? '2px solid var(--accent-clinical)'
                  : '1px solid var(--card-border)',
                backgroundColor: isSelected ? 'var(--accent-light)' : 'var(--card-surface)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                cursor: isInactive ? 'not-allowed' : 'pointer',
                textAlign: 'left',
                opacity: isInactive ? 0.45 : 1,
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', width: '100%' }}>
                <span
                  style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: item.colorHex,
                    display: 'inline-block',
                    flexShrink: 0
                  }}
                />
                <span
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    color: isSelected ? 'var(--accent-clinical)' : 'var(--text-primary)'
                  }}
                >
                  Type {item.type}
                </span>
              </div>
              <div
                style={{
                  fontSize: '0.68rem',
                  color: 'var(--text-secondary)',
                  marginTop: '4px',
                  lineHeight: 1.2
                }}
              >
                {item.description}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

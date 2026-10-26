import React from 'react';
import { Droplets, AlertTriangle, RefreshCw } from 'lucide-react';
import type { UrinaryEventType } from '../../types';

interface UrinaryEventTypeSelectorProps {
  value: UrinaryEventType;
  onChange: (val: UrinaryEventType) => void;
}

export const UrinaryEventTypeSelector: React.FC<UrinaryEventTypeSelectorProps> = ({
  value,
  onChange
}) => {
  return (
    <div
      style={{
        display: 'flex',
        backgroundColor: 'var(--bg-secondary, #EDF2F0)',
        borderRadius: 'var(--radius-md, 12px)',
        padding: '4px',
        gap: '4px',
        marginBottom: '16px'
      }}
      role="tablist"
      aria-label="Event Type Selector"
    >
      <button
        type="button"
        role="tab"
        aria-selected={value === 'void'}
        onClick={() => onChange('void')}
        style={{
          flex: 1,
          padding: '8px 12px',
          borderRadius: 'var(--radius-sm, 8px)',
          border: 'none',
          fontWeight: 700,
          fontSize: '0.85rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          cursor: 'pointer',
          backgroundColor: value === 'void' ? 'var(--card-surface, #FFFFFF)' : 'transparent',
          color: value === 'void' ? 'var(--accent-clinical, #2B7A68)' : 'var(--text-secondary, #4A5B53)',
          boxShadow: value === 'void' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
        }}
      >
        <Droplets size={15} />
        <span>Urination / Void</span>
      </button>

      <button
        type="button"
        role="tab"
        aria-selected={value === 'leakage'}
        onClick={() => onChange('leakage')}
        style={{
          flex: 1,
          padding: '8px 12px',
          borderRadius: 'var(--radius-sm, 8px)',
          border: 'none',
          fontWeight: 700,
          fontSize: '0.85rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          cursor: 'pointer',
          backgroundColor: value === 'leakage' ? 'var(--card-surface, #FFFFFF)' : 'transparent',
          color: value === 'leakage' ? 'var(--danger, #C62828)' : 'var(--text-secondary, #4A5B53)',
          boxShadow: value === 'leakage' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
        }}
      >
        <AlertTriangle size={15} />
        <span>Incontinence / Leak</span>
      </button>

      <button
        type="button"
        role="tab"
        aria-selected={value === 'combined'}
        onClick={() => onChange('combined')}
        style={{
          padding: '8px 12px',
          borderRadius: 'var(--radius-sm, 8px)',
          border: 'none',
          fontWeight: 700,
          fontSize: '0.85rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '4px',
          cursor: 'pointer',
          backgroundColor: value === 'combined' ? 'var(--card-surface, #FFFFFF)' : 'transparent',
          color: value === 'combined' ? 'var(--accent-clinical, #2B7A68)' : 'var(--text-secondary, #4A5B53)',
          boxShadow: value === 'combined' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
        }}
        title="Both Void and Leakage"
      >
        <RefreshCw size={13} />
        <span>Both</span>
      </button>
    </div>
  );
};

import React, { useState } from 'react';
import { Plus, Trash2, Sliders, X } from 'lucide-react';
import type { CustomMetricItem } from '../../types';
import { MetricFieldWrapper } from './MetricFieldWrapper';
import { ClinicalPainSlider } from './ClinicalPainSlider';
import { ClinicalSlider } from './ClinicalSlider';

export interface CustomMetricsSectionProps {
  metrics: CustomMetricItem[];
  onChange: (metrics: CustomMetricItem[]) => void;
  categoryLabel?: string;
}

export const CustomMetricsSection: React.FC<CustomMetricsSectionProps> = ({
  metrics,
  onChange,
  categoryLabel
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newMetricName, setNewMetricName] = useState('');
  const [newMetricScale, setNewMetricScale] = useState<'1-10' | '1-100'>('1-10');

  const handleStartAdd = () => {
    setNewMetricName('');
    setNewMetricScale('1-10');
    setIsAdding(true);
  };

  const handleCancelAdd = () => {
    setIsAdding(false);
    setNewMetricName('');
  };

  const handleConfirmAdd = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newMetricName.trim();
    if (!trimmed) return;

    const newItem: CustomMetricItem = {
      id: `cm_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: trimmed,
      scale: newMetricScale,
      value: newMetricScale === '1-10' ? 0 : 50,
      isNA: false,
      comment: ''
    };

    onChange([...metrics, newItem]);
    setIsAdding(false);
    setNewMetricName('');
  };

  const handleUpdateItem = (index: number, updates: Partial<CustomMetricItem>) => {
    const updated = metrics.map((item, idx) => {
      if (idx !== index) return item;
      return { ...item, ...updates };
    });
    onChange(updated);
  };

  const handleRemoveItem = (index: number) => {
    const updated = metrics.filter((_, idx) => idx !== index);
    onChange(updated);
  };

  return (
    <div
      className="custom-metrics-section"
      style={{
        margin: '20px 0 12px',
        borderTop: '1px solid var(--card-border, #DCE5E0)',
        paddingTop: '16px'
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '8px',
          marginBottom: '12px'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sliders size={16} color="var(--accent-clinical, #2B7A68)" />
            <span
              style={{
                fontSize: '0.92rem',
                fontWeight: 700,
                color: 'var(--text-primary, #1C2D27)'
              }}
            >
              Custom Metrics {categoryLabel ? `(${categoryLabel})` : ''}
            </span>
          </div>
          <span
            style={{
              fontSize: '0.76rem',
              color: 'var(--text-muted, #73847C)',
              display: 'block',
              marginTop: '2px'
            }}
          >
            Track patient-specific symptoms or provider scales (e.g. Tailbone Pain, Spasm, Burning)
          </span>
        </div>

        {!isAdding && (
          <button
            type="button"
            onClick={handleStartAdd}
            className="btn-secondary"
            style={{
              padding: '6px 12px',
              fontSize: '0.82rem',
              minHeight: '36px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
            aria-label="Add custom metric"
          >
            <Plus size={15} />
            <span>Add Custom Metric</span>
          </button>
        )}
      </div>

      {/* Inline Configuration Box to Add a New Custom Metric */}
      {isAdding && (
        <div
          style={{
            padding: '14px',
            backgroundColor: 'var(--bg-secondary, #EDF2F0)',
            borderRadius: 'var(--radius-md, 12px)',
            border: '1px solid var(--accent-clinical, #2B7A68)',
            marginBottom: '14px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontWeight: 700, fontSize: '0.86rem', color: 'var(--text-primary, #1C2D27)' }}>
              Configure New Metric
            </span>
            <button
              type="button"
              onClick={handleCancelAdd}
              className="icon-btn"
              style={{ width: '28px', height: '28px' }}
              aria-label="Cancel adding metric"
            >
              <X size={15} />
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', marginBottom: '12px' }}>
            <div>
              <label htmlFor="custom-metric-name" className="form-label" style={{ fontSize: '0.8rem' }}>
                Metric Name / Symptom
              </label>
              <input
                id="custom-metric-name"
                type="text"
                className="form-input"
                placeholder="e.g. Vulvar Burning, Tailbone Pain, Spasm"
                value={newMetricName}
                onChange={(e) => setNewMetricName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleConfirmAdd();
                  }
                }}
                autoFocus
                required
                style={{ fontSize: '0.85rem' }}
              />
            </div>

            <div>
              <label htmlFor="custom-metric-scale" className="form-label" style={{ fontSize: '0.8rem' }}>
                Measurement Scale
              </label>
              <select
                id="custom-metric-scale"
                className="form-select"
                value={newMetricScale}
                onChange={(e) => setNewMetricScale(e.target.value as '1-10' | '1-100')}
                style={{ fontSize: '0.85rem' }}
              >
                <option value="1-10">0–10 NRS (Pain / Effort / Severity)</option>
                <option value="1-100">0–100% (Percentage / Intensity / Satisfaction)</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <button
              type="button"
              onClick={handleCancelAdd}
              className="btn-secondary"
              style={{ fontSize: '0.82rem', padding: '6px 12px', minHeight: '34px' }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => handleConfirmAdd()}
              className="btn-primary"
              disabled={!newMetricName.trim()}
              style={{ fontSize: '0.82rem', padding: '6px 14px', minHeight: '34px' }}
            >
              Add Metric
            </button>
          </div>
        </div>
      )}

      {/* Render list of configured custom metrics */}
      {metrics.length === 0 && !isAdding && (
        <div
          style={{
            padding: '12px 14px',
            backgroundColor: 'var(--bg-secondary, #EDF2F0)',
            borderRadius: 'var(--radius-sm, 8px)',
            color: 'var(--text-muted, #73847C)',
            fontSize: '0.82rem',
            textAlign: 'center',
            fontStyle: 'italic'
          }}
        >
          No custom metrics added for this entry. Tap "+ Add Custom Metric" to track additional symptoms.
        </div>
      )}

      {metrics.map((metric, index) => {
        const isNA = Boolean(metric.isNA || metric.value === null);

        return (
          <div key={metric.id || index} style={{ position: 'relative' }}>
            <MetricFieldWrapper
              label={metric.name}
              isNA={isNA}
              onNAToggle={(toggled) => {
                handleUpdateItem(index, {
                  isNA: toggled,
                  value: toggled ? null : (metric.scale === '1-10' ? 0 : 50)
                });
              }}
              comment={metric.comment}
              onCommentChange={(comment) => handleUpdateItem(index, { comment })}
              commentPlaceholder={`Clinical comment or notes for ${metric.name}...`}
              badge={
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <span
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      backgroundColor: 'var(--bg-secondary, #EDF2F0)',
                      padding: '2px 6px',
                      borderRadius: 'var(--radius-sm, 6px)',
                      color: 'var(--text-muted, #73847C)'
                    }}
                  >
                    {metric.scale === '1-10' ? '0–10 NRS' : '0–100%'}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(index)}
                    className="icon-btn"
                    title={`Remove ${metric.name}`}
                    aria-label={`Remove ${metric.name}`}
                    style={{ width: '28px', height: '28px', color: 'var(--danger, #C62828)' }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              }
            >
              {metric.scale === '1-10' ? (
                <ClinicalPainSlider
                  hideLabel
                  value={metric.value}
                  onChange={(val) => handleUpdateItem(index, { value: val })}
                  isNA={isNA}
                />
              ) : (
                <ClinicalSlider
                  hideLabel
                  value={metric.value}
                  onChange={(val) => handleUpdateItem(index, { value: val })}
                  isNA={isNA}
                  unit="%"
                />
              )}
            </MetricFieldWrapper>
          </div>
        );
      })}
    </div>
  );
};

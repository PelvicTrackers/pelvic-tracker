import React from 'react';
import { MessageSquareText, Sliders } from 'lucide-react';
import type { CustomMetricItem } from '../../types';
import { getPainColor } from '../../utils/logFormatters';

export interface EntryMetricsDisplayProps {
  customMetrics?: CustomMetricItem[];
  metricComments?: Record<string, string>;
  metricLabels?: Record<string, string>;
  privacyMode?: boolean;
}

export const EntryMetricsDisplay: React.FC<EntryMetricsDisplayProps> = ({
  customMetrics,
  metricComments,
  metricLabels = {},
  privacyMode = false
}) => {
  const activeCustom = customMetrics && customMetrics.length > 0 ? customMetrics : null;

  // Filter out empty or whitespace comments
  const activeComments = metricComments
    ? Object.entries(metricComments).filter(([, val]) => val && val.trim().length > 0)
    : [];

  if (!activeCustom && activeComments.length === 0) {
    return null;
  }

  return (
    <div
      className={`entry-metrics-display ${privacyMode ? 'privacy-blur' : ''}`.trim()}
      style={{
        marginTop: '10px',
        paddingTop: '8px',
        borderTop: '1px dashed var(--card-border-subtle, #E8EFEA)',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}
    >
      {/* Custom Metrics Grid / Badges */}
      {activeCustom && activeCustom.length > 0 && (
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.72rem',
              fontWeight: 700,
              color: 'var(--text-muted, #73847C)',
              marginBottom: '4px',
              textTransform: 'uppercase',
              letterSpacing: '0.04em'
            }}
          >
            <Sliders size={12} color="var(--accent-clinical, #2B7A68)" />
            <span>Custom Metrics</span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
              gap: '6px'
            }}
          >
            {activeCustom.map((cm) => {
              const isNA = Boolean(cm.isNA || cm.value === null);
              const valColor = isNA
                ? 'var(--text-muted, #73847C)'
                : cm.scale === '1-10'
                  ? getPainColor(cm.value)
                  : 'var(--accent-clinical, #2B7A68)';

              return (
                <div
                  key={cm.id || cm.name}
                  style={{
                    padding: '6px 8px',
                    backgroundColor: 'var(--bg-secondary, #EDF2F0)',
                    borderRadius: 'var(--radius-sm, 6px)',
                    border: '1px solid var(--card-border-subtle, #E8EFEA)'
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.7rem',
                      color: 'var(--text-muted, #73847C)',
                      display: 'block',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                    title={cm.name}
                  >
                    {cm.name}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginTop: '2px' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.85rem', color: valColor }}>
                      {isNA
                        ? 'N/A'
                        : cm.scale === '1-10'
                          ? `${cm.value} / 10`
                          : `${cm.value}%`}
                    </span>
                  </div>
                  {cm.comment && cm.comment.trim().length > 0 && (
                    <div
                      style={{
                        fontSize: '0.68rem',
                        color: 'var(--text-secondary, #4A5B53)',
                        marginTop: '3px',
                        fontStyle: 'italic',
                        lineHeight: 1.2
                      }}
                    >
                      {cm.comment}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Field-level Comments */}
      {activeComments.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.72rem',
              fontWeight: 700,
              color: 'var(--text-muted, #73847C)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em'
            }}
          >
            <MessageSquareText size={12} color="var(--accent-clinical, #2B7A68)" />
            <span>Field Notes</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            {activeComments.map(([key, comment]) => {
              const friendlyLabel = metricLabels[key] || key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase());
              return (
                <div
                  key={key}
                  style={{
                    fontSize: '0.74rem',
                    color: 'var(--text-secondary, #4A5B53)',
                    backgroundColor: 'var(--bg-secondary, #EDF2F0)',
                    padding: '3px 8px',
                    borderRadius: 'var(--radius-sm, 6px)',
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: '6px'
                  }}
                >
                  <strong style={{ color: 'var(--text-primary, #1C2D27)', flexShrink: 0 }}>
                    {friendlyLabel}:
                  </strong>
                  <span>{comment}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

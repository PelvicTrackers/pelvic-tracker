import React, { useState, useMemo } from 'react';
import { formatDateTime } from '../../utils/logFormatters';

export interface ChartDataPoint {
  id: string;
  timestamp: string;
  dateLabel: string;
  value: number;
  notes?: string;
  comments?: string;
}

export interface ChartSeries {
  id: string;
  label: string;
  color: string;
  unit?: string;
  points: ChartDataPoint[];
}

interface SymptomTrendChartProps {
  series: ChartSeries[];
  title?: string;
  maxScale?: number; // e.g. 10 for NRS pain, 100 for %
  isPrintMode?: boolean;
}

export const SymptomTrendChart: React.FC<SymptomTrendChartProps> = ({
  series,
  title,
  maxScale = 10,
  isPrintMode = false
}) => {
  // Active series toggles (all enabled by default)
  const [activeSeriesIds, setActiveSeriesIds] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    series.forEach((s) => {
      init[s.id] = true;
    });
    return init;
  });

  // Active hover/touch point
  const [selectedPoint, setSelectedPoint] = useState<{
    point: ChartDataPoint;
    seriesLabel: string;
    seriesColor: string;
    unit?: string;
    x: number;
    y: number;
  } | null>(null);

  const toggleSeries = (id: string) => {
    if (isPrintMode) return;
    setActiveSeriesIds((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Dimensions
  const svgWidth = 640;
  const svgHeight = 220;
  const padding = { top: 20, right: 24, bottom: 32, left: 36 };
  const chartWidth = svgWidth - padding.left - padding.right;
  const chartHeight = svgHeight - padding.top - padding.bottom;

  // Active series list
  const visibleSeries = useMemo(() => {
    return series.filter((s) => isPrintMode || activeSeriesIds[s.id] !== false);
  }, [series, activeSeriesIds, isPrintMode]);

  // Collect all unique sorted timestamps to form chronological X-axis
  const allTimestamps = useMemo(() => {
    const tsSet = new Set<number>();
    visibleSeries.forEach((s) => {
      s.points.forEach((p) => {
        const t = new Date(p.timestamp).getTime();
        if (!isNaN(t)) tsSet.add(t);
      });
    });
    return Array.from(tsSet).sort((a, b) => a - b);
  }, [visibleSeries]);

  const minTime = allTimestamps.length > 0 ? allTimestamps[0] : 0;
  const maxTime = allTimestamps.length > 1 ? allTimestamps[allTimestamps.length - 1] : minTime + 86400000;
  const timeSpan = maxTime - minTime || 1;

  // Calculate coordinates
  const getX = (timestamp: string) => {
    const t = new Date(timestamp).getTime();
    if (allTimestamps.length <= 1) return padding.left + chartWidth / 2;
    return padding.left + ((t - minTime) / timeSpan) * chartWidth;
  };

  const getY = (val: number) => {
    const clamped = Math.max(0, Math.min(val, maxScale));
    return padding.top + chartHeight - (clamped / maxScale) * chartHeight;
  };

  // Y-axis grid ticks (e.g. 0, 5, 10 or 0, 25, 50, 75, 100)
  const yTicks = maxScale <= 10 ? [0, 2, 4, 6, 8, 10] : [0, 25, 50, 75, 100];

  const totalPoints = visibleSeries.reduce((acc, s) => acc + s.points.length, 0);

  if (totalPoints === 0) {
    return (
      <div
        style={{
          padding: '24px',
          textAlign: 'center',
          backgroundColor: isPrintMode ? '#FFFFFF' : 'var(--bg-secondary)',
          borderRadius: 'var(--radius-md)',
          border: '1px dashed var(--card-border)',
          color: 'var(--text-muted)',
          fontSize: '0.85rem'
        }}
      >
        No trend records logged for this metric series yet.
      </div>
    );
  }

  return (
    <div
      style={{
        position: 'relative',
        backgroundColor: isPrintMode ? '#FFFFFF' : 'var(--card-surface)',
        border: isPrintMode ? '1px solid #777777' : '1px solid var(--card-border)',
        borderRadius: 'var(--radius-md)',
        padding: '12px 14px',
        breakInside: 'avoid',
        pageBreakInside: 'avoid'
      }}
    >
      {/* Title & Legend Toggles */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '8px',
          marginBottom: '10px'
        }}
      >
        {title && (
          <h4
            style={{
              margin: 0,
              fontSize: '0.9rem',
              fontWeight: 700,
              color: isPrintMode ? '#1C2D27' : 'var(--text-primary)'
            }}
          >
            {title}
          </h4>
        )}

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {series.map((s) => {
            const isVisible = activeSeriesIds[s.id] !== false;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => toggleSeries(s.id)}
                aria-pressed={isVisible}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  border: `1px solid ${isVisible ? s.color : 'var(--card-border)'}`,
                  backgroundColor: isVisible ? `${s.color}18` : 'transparent',
                  color: isVisible ? s.color : 'var(--text-muted)',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  cursor: isPrintMode ? 'default' : 'pointer',
                  opacity: isVisible ? 1 : 0.6
                }}
              >
                <span
                  style={{
                    display: 'inline-block',
                    width: '7px',
                    height: '7px',
                    borderRadius: '50%',
                    backgroundColor: s.color
                  }}
                />
                {s.label} ({s.points.length})
              </button>
            );
          })}
        </div>
      </div>

      {/* SVG Canvas */}
      <svg
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        style={{ width: '100%', height: 'auto', display: 'block', overflow: 'visible' }}
      >
        <defs>
          {visibleSeries.map((s) => (
            <linearGradient key={`grad-${s.id}`} id={`grad-${s.id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={s.color} stopOpacity="0.25" />
              <stop offset="100%" stopColor={s.color} stopOpacity="0.0" />
            </linearGradient>
          ))}
        </defs>

        {/* Horizontal Grid lines */}
        {yTicks.map((tick) => {
          const y = getY(tick);
          return (
            <g key={`ytick-${tick}`}>
              <line
                x1={padding.left}
                y1={y}
                x2={svgWidth - padding.right}
                y2={y}
                stroke={isPrintMode ? '#CCCCCC' : 'rgba(128, 128, 128, 0.2)'}
                strokeDasharray={tick === 0 ? undefined : '3,3'}
                strokeWidth={tick === 0 ? 1.5 : 0.8}
              />
              <text
                x={padding.left - 6}
                y={y + 3}
                fill={isPrintMode ? '#555555' : 'var(--text-muted)'}
                fontSize="9"
                textAnchor="end"
              >
                {tick}
              </text>
            </g>
          );
        })}

        {/* Render lines and filled areas */}
        {visibleSeries.map((s) => {
          if (s.points.length === 0) return null;
          const sorted = [...s.points].sort(
            (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          );

          const pathPoints = sorted.map((p) => `${getX(p.timestamp)},${getY(p.value)}`);
          const linePath = `M ${pathPoints.join(' L ')}`;

          // Closed path for area gradient
          const firstX = getX(sorted[0].timestamp);
          const lastX = getX(sorted[sorted.length - 1].timestamp);
          const bottomY = getY(0);
          const areaPath = `${linePath} L ${lastX},${bottomY} L ${firstX},${bottomY} Z`;

          return (
            <g key={`series-group-${s.id}`}>
              {!isPrintMode && <path d={areaPath} fill={`url(#grad-${s.id})`} />}
              <path
                d={linePath}
                fill="none"
                stroke={s.color}
                strokeWidth={isPrintMode ? 2 : 2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Data Node Circles */}
              {sorted.map((p) => {
                const cx = getX(p.timestamp);
                const cy = getY(p.value);
                const isSelected = selectedPoint?.point.id === p.id && selectedPoint.seriesLabel === s.label;

                return (
                  <circle
                    key={`${s.id}-${p.id}`}
                    cx={cx}
                    cy={cy}
                    r={isSelected ? 6 : isPrintMode ? 3 : 4}
                    fill={isPrintMode ? '#FFFFFF' : 'var(--card-surface)'}
                    stroke={s.color}
                    strokeWidth={isSelected ? 2.5 : 2}
                    style={{ cursor: isPrintMode ? 'default' : 'pointer' }}
                    onClick={() => {
                      if (isPrintMode) return;
                      setSelectedPoint({
                        point: p,
                        seriesLabel: s.label,
                        seriesColor: s.color,
                        unit: s.unit,
                        x: cx,
                        y: cy
                      });
                    }}
                    onMouseEnter={() => {
                      if (isPrintMode) return;
                      setSelectedPoint({
                        point: p,
                        seriesLabel: s.label,
                        seriesColor: s.color,
                        unit: s.unit,
                        x: cx,
                        y: cy
                      });
                    }}
                  />
                );
              })}
            </g>
          );
        })}

        {/* X-axis date labels */}
        {allTimestamps.length > 0 && (
          <>
            <text
              x={padding.left}
              y={svgHeight - 10}
              fill={isPrintMode ? '#555555' : 'var(--text-muted)'}
              fontSize="9"
              textAnchor="start"
            >
              {new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(new Date(minTime))}
            </text>

            {allTimestamps.length > 1 && (
              <text
                x={svgWidth - padding.right}
                y={svgHeight - 10}
                fill={isPrintMode ? '#555555' : 'var(--text-muted)'}
                fontSize="9"
                textAnchor="end"
              >
                {new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(new Date(maxTime))}
              </text>
            )}
          </>
        )}
      </svg>

      {/* Interactive Tooltip Card */}
      {selectedPoint && !isPrintMode && (
        <div
          style={{
            marginTop: '8px',
            padding: '8px 12px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--bg-secondary)',
            border: `1px solid ${selectedPoint.seriesColor}`,
            fontSize: '0.78rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '3px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 700, color: selectedPoint.seriesColor }}>
              {selectedPoint.seriesLabel}: {selectedPoint.point.value}{selectedPoint.unit || ''}
            </span>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>
              {formatDateTime(selectedPoint.point.timestamp)}
            </span>
          </div>

          {selectedPoint.point.notes && (
            <div style={{ fontStyle: 'italic', color: 'var(--text-secondary)' }}>
              "{selectedPoint.point.notes}"
            </div>
          )}

          {selectedPoint.point.comments && (
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              {selectedPoint.point.comments}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

import React, { useState, useMemo } from 'react';
import {
  Activity,
  HeartPulse,
  Droplets,
  CircleGauge,
  Calendar,
  ArrowDownRight,
  ArrowUpRight,
  Minus
} from 'lucide-react';
import { useLogStore } from '../../store/useLogStore';
import {
  calculateSymptomTrends,
  type TrendPeriodDays,
  type MetricDelta
} from '../../utils/symptomCalculator';
import {
  SymptomTrendChart,
  type ChartSeries
} from './SymptomTrendChart';
import { formatDateOnly } from '../../utils/logFormatters';

export const AnalyticsView: React.FC = () => {
  const sexualEntries = useLogStore((s) => s.sexualEntries);
  const urinaryEntries = useLogStore((s) => s.urinaryEntries);
  const bowelEntries = useLogStore((s) => s.bowelEntries);

  const [periodDays, setPeriodDays] = useState<TrendPeriodDays>(14);
  const [activeCategory, setActiveCategory] = useState<'sexual-pain' | 'urinary' | 'bowel' | 'sexual-func'>('sexual-pain');

  const trends = useMemo(() => {
    return calculateSymptomTrends({
      sexualEntries,
      urinaryEntries,
      bowelEntries,
      periodDays
    });
  }, [sexualEntries, urinaryEntries, bowelEntries, periodDays]);

  // Transform entries into ChartSeries for each domain
  const sexualPainSeries: ChartSeries[] = useMemo(() => {
    return [
      {
        id: 'sex-pain-before',
        label: 'Pain Before',
        color: '#84CC16',
        unit: ' / 10',
        points: sexualEntries
          .filter((e) => typeof e.painBefore === 'number')
          .map((e) => ({
            id: e.id,
            timestamp: e.timestamp,
            dateLabel: formatDateOnly(e.timestamp),
            value: e.painBefore as number,
            notes: e.notes
          }))
      },
      {
        id: 'sex-pain-during',
        label: 'Pain During',
        color: '#EF4444',
        unit: ' / 10',
        points: sexualEntries
          .filter((e) => typeof e.painDuring === 'number')
          .map((e) => ({
            id: e.id,
            timestamp: e.timestamp,
            dateLabel: formatDateOnly(e.timestamp),
            value: e.painDuring as number,
            notes: e.notes
          }))
      },
      {
        id: 'sex-pain-after',
        label: 'Pain After',
        color: '#F59E0B',
        unit: ' / 10',
        points: sexualEntries
          .filter((e) => typeof e.painAfter === 'number')
          .map((e) => ({
            id: e.id,
            timestamp: e.timestamp,
            dateLabel: formatDateOnly(e.timestamp),
            value: e.painAfter as number,
            notes: e.notes
          }))
      }
    ];
  }, [sexualEntries]);

  const urinarySeries: ChartSeries[] = useMemo(() => {
    return [
      {
        id: 'uri-urgency',
        label: 'Urgency Level',
        color: '#EF4444',
        unit: ' (0-3)',
        points: urinaryEntries
          .filter((u) => typeof u.urgencyLevel === 'number')
          .map((u) => ({
            id: u.id,
            timestamp: u.timestamp,
            dateLabel: formatDateOnly(u.timestamp),
            value: u.urgencyLevel as number,
            notes: u.notes
          }))
      },
      {
        id: 'uri-leaks',
        label: 'Leak Episodes',
        color: '#6366F1',
        unit: ' severity',
        points: urinaryEntries
          .filter((u) => u.eventType === 'leakage' || u.eventType === 'combined' || u.leakageAmount !== 'none')
          .map((u) => {
            const score = u.leakageAmount === 'soaked' ? 3 : u.leakageAmount === 'moderate' ? 2 : 1;
            return {
              id: u.id,
              timestamp: u.timestamp,
              dateLabel: formatDateOnly(u.timestamp),
              value: score,
              notes: `${u.leakageAmount} leak (${u.leakageType})${u.notes ? ` - ${u.notes}` : ''}`
            };
          })
      }
    ];
  }, [urinaryEntries]);

  const bowelSeries: ChartSeries[] = useMemo(() => {
    return [
      {
        id: 'bwl-straining',
        label: 'Straining Level',
        color: '#B45309',
        unit: ' / 10',
        points: bowelEntries
          .filter((b) => typeof b.strainingLevel === 'number')
          .map((b) => ({
            id: b.id,
            timestamp: b.timestamp,
            dateLabel: formatDateOnly(b.timestamp),
            value: b.strainingLevel as number,
            notes: b.notes
          }))
      },
      {
        id: 'bwl-pain-during',
        label: 'Pain During Defecation',
        color: '#DC2626',
        unit: ' / 10',
        points: bowelEntries
          .filter((b) => typeof b.painDuring === 'number')
          .map((b) => ({
            id: b.id,
            timestamp: b.timestamp,
            dateLabel: formatDateOnly(b.timestamp),
            value: b.painDuring as number,
            notes: b.notes
          }))
      }
    ];
  }, [bowelEntries]);

  const sexualFuncSeries: ChartSeries[] = useMemo(() => {
    return [
      {
        id: 'sex-pleasure',
        label: 'Pleasure Score',
        color: '#10B981',
        unit: '%',
        points: sexualEntries
          .filter((e) => typeof e.pleasureScore === 'number')
          .map((e) => ({
            id: e.id,
            timestamp: e.timestamp,
            dateLabel: formatDateOnly(e.timestamp),
            value: e.pleasureScore as number,
            notes: e.notes
          }))
      },
      {
        id: 'sex-arousal',
        label: 'Erection / Arousal',
        color: '#8B5CF6',
        unit: '%',
        points: sexualEntries
          .filter((e) => typeof e.erectionArousalScore === 'number')
          .map((e) => ({
            id: e.id,
            timestamp: e.timestamp,
            dateLabel: formatDateOnly(e.timestamp),
            value: e.erectionArousalScore as number,
            notes: e.notes
          }))
      }
    ];
  }, [sexualEntries]);

  return (
    <div className="main-view-container">
      {/* Header */}
      <div className="view-header">
        <div className="view-title-group">
          <h1>Symptom Analytics & Recovery Trends</h1>
          <p>Pelvic Floor Trajectories, Clinical Deltas & Baseline Comparison</p>
        </div>

        {/* Period Selector Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Calendar size={16} color="var(--text-muted)" />
          {([7, 14, 30] as TrendPeriodDays[]).map((days) => (
            <button
              key={days}
              type="button"
              onClick={() => setPeriodDays(days)}
              className={periodDays === days ? 'btn-primary' : 'btn-secondary'}
              style={{
                minHeight: '32px',
                padding: '4px 10px',
                fontSize: '0.8rem',
                borderRadius: 'var(--radius-sm)'
              }}
            >
              {days} Days
            </button>
          ))}
        </div>
      </div>

      {/* Baseline vs Current Summary Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '10px',
          marginBottom: '20px'
        }}
      >
        <DeltaMetricCard
          label="Sexual Pain During"
          metric={trends.pain.sexual.painDuring}
          unit="/ 10"
        />
        <DeltaMetricCard
          label="Bowel Straining"
          metric={trends.bowel.strainingLevel}
          unit="/ 10"
        />
        <div className="entry-card" style={{ padding: '10px 12px', margin: 0 }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Leak Reduction Rate</span>
          <div
            style={{
              fontSize: '1.25rem',
              fontWeight: 700,
              color: trends.urinary.totalLeaks.reductionRate >= 0 ? 'var(--success)' : 'var(--danger)'
            }}
          >
            {trends.urinary.totalLeaks.reductionRate > 0 ? `-${trends.urinary.totalLeaks.reductionRate}%` : `${trends.urinary.totalLeaks.reductionRate}%`}
          </div>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
            {trends.urinary.totalLeaks.baseline} baseline → {trends.urinary.totalLeaks.current} current
          </span>
        </div>
        <div className="entry-card" style={{ padding: '10px 12px', margin: 0 }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Bristol Stool Normalization</span>
          <div
            style={{
              fontSize: '1.25rem',
              fontWeight: 700,
              color: trends.bowel.bristolNormalizationRate.isImproved ? 'var(--success)' : 'var(--text-primary)'
            }}
          >
            {trends.bowel.bristolNormalizationRate.currentPercent}%
          </div>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
            Types 3-4 ({trends.bowel.bristolNormalizationRate.delta > 0 ? `+${trends.bowel.bristolNormalizationRate.delta}%` : `${trends.bowel.bristolNormalizationRate.delta}%`})
          </span>
        </div>
      </div>

      {/* Trend Category Selection Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          borderBottom: '1px solid var(--card-border-subtle)',
          paddingBottom: '8px',
          marginBottom: '16px'
        }}
      >
        <CategoryTabBtn
          active={activeCategory === 'sexual-pain'}
          onClick={() => setActiveCategory('sexual-pain')}
          icon={<HeartPulse size={16} />}
          label="Sexual Pain (NRS)"
        />
        <CategoryTabBtn
          active={activeCategory === 'urinary'}
          onClick={() => setActiveCategory('urinary')}
          icon={<Droplets size={16} />}
          label="Bladder & Urgency"
        />
        <CategoryTabBtn
          active={activeCategory === 'bowel'}
          onClick={() => setActiveCategory('bowel')}
          icon={<CircleGauge size={16} />}
          label="Bowel & Straining"
        />
        <CategoryTabBtn
          active={activeCategory === 'sexual-func'}
          onClick={() => setActiveCategory('sexual-func')}
          icon={<Activity size={16} />}
          label="Function & Pleasure"
        />
      </div>

      {/* Render Selected Trend Chart */}
      {activeCategory === 'sexual-pain' && (
        <SymptomTrendChart
          series={sexualPainSeries}
          title={`Sexual Pelvic Pain Trajectory (${periodDays}-Day Baseline Comparison)`}
          maxScale={10}
        />
      )}

      {activeCategory === 'urinary' && (
        <SymptomTrendChart
          series={urinarySeries}
          title="Bladder Urgency & Incontinence Episodes"
          maxScale={3}
        />
      )}

      {activeCategory === 'bowel' && (
        <SymptomTrendChart
          series={bowelSeries}
          title="Bowel Straining & Defecation Pain Trajectory"
          maxScale={10}
        />
      )}

      {activeCategory === 'sexual-func' && (
        <SymptomTrendChart
          series={sexualFuncSeries}
          title="Arousal & Pleasure Scale Trajectory"
          maxScale={100}
        />
      )}
    </div>
  );
};

interface DeltaMetricCardProps {
  label: string;
  metric: MetricDelta;
  unit?: string;
}

const DeltaMetricCard: React.FC<DeltaMetricCardProps> = ({ label, metric, unit = '' }) => {
  const isImproved = metric.isImproved;
  const isNeutral = metric.delta === 0;

  return (
    <div className="entry-card" style={{ padding: '10px 12px', margin: 0 }}>
      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          {metric.currentAvg}{unit}
        </span>
        {!isNeutral && (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              fontSize: '0.75rem',
              fontWeight: 600,
              color: isImproved ? 'var(--success)' : 'var(--danger)'
            }}
          >
            {isImproved ? <ArrowDownRight size={14} /> : <ArrowUpRight size={14} />}
            {Math.abs(metric.delta)}{unit}
          </span>
        )}
        {isNeutral && <Minus size={14} color="var(--text-muted)" />}
      </div>
      <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
        Baseline: {metric.baselineAvg}{unit} ({metric.baselineCount} logs)
      </span>
    </div>
  );
};

interface CategoryTabBtnProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

const CategoryTabBtn: React.FC<CategoryTabBtnProps> = ({ active, onClick, icon, label }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 12px',
        borderRadius: 'var(--radius-sm)',
        border: 'none',
        backgroundColor: active ? 'var(--accent-clinical)' : 'transparent',
        color: active ? '#FFFFFF' : 'var(--text-secondary)',
        fontWeight: active ? 700 : 500,
        fontSize: '0.82rem',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        transition: 'all 0.15s ease'
      }}
    >
      {icon} {label}
    </button>
  );
};

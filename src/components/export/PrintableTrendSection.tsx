import React, { useMemo } from 'react';
import type { SexualLogEntry, UrinaryLogEntry, BowelLogEntry } from '../../types';
import { SymptomTrendChart, type ChartSeries } from '../analytics/SymptomTrendChart';
import { calculateSymptomTrends } from '../../utils/symptomCalculator';
import { formatDateOnly } from '../../utils/logFormatters';

interface PrintableTrendSectionProps {
  sexual: SexualLogEntry[];
  urinary: UrinaryLogEntry[];
  bowel: BowelLogEntry[];
}

export const PrintableTrendSection: React.FC<PrintableTrendSectionProps> = ({
  sexual,
  urinary,
  bowel
}) => {
  const trends = useMemo(() => {
    return calculateSymptomTrends({
      sexualEntries: sexual,
      urinaryEntries: urinary,
      bowelEntries: bowel,
      periodDays: 14
    });
  }, [sexual, urinary, bowel]);

  const sexualPainSeries: ChartSeries[] = useMemo(() => {
    return [
      {
        id: 'sex-pain-before',
        label: 'Pain Before',
        color: '#65A30D',
        unit: ' / 10',
        points: sexual
          .filter((e) => typeof e.painBefore === 'number')
          .map((e) => ({
            id: e.id,
            timestamp: e.timestamp,
            dateLabel: formatDateOnly(e.timestamp),
            value: e.painBefore as number
          }))
      },
      {
        id: 'sex-pain-during',
        label: 'Pain During',
        color: '#DC2626',
        unit: ' / 10',
        points: sexual
          .filter((e) => typeof e.painDuring === 'number')
          .map((e) => ({
            id: e.id,
            timestamp: e.timestamp,
            dateLabel: formatDateOnly(e.timestamp),
            value: e.painDuring as number
          }))
      },
      {
        id: 'sex-pain-after',
        label: 'Pain After',
        color: '#D97706',
        unit: ' / 10',
        points: sexual
          .filter((e) => typeof e.painAfter === 'number')
          .map((e) => ({
            id: e.id,
            timestamp: e.timestamp,
            dateLabel: formatDateOnly(e.timestamp),
            value: e.painAfter as number
          }))
      }
    ];
  }, [sexual]);

  const bowelSeries: ChartSeries[] = useMemo(() => {
    return [
      {
        id: 'bwl-straining',
        label: 'Straining Level',
        color: '#B45309',
        unit: ' / 10',
        points: bowel
          .filter((b) => typeof b.strainingLevel === 'number')
          .map((b) => ({
            id: b.id,
            timestamp: b.timestamp,
            dateLabel: formatDateOnly(b.timestamp),
            value: b.strainingLevel as number
          }))
      },
      {
        id: 'bwl-pain-during',
        label: 'Pain During Defecation',
        color: '#991B1B',
        unit: ' / 10',
        points: bowel
          .filter((b) => typeof b.painDuring === 'number')
          .map((b) => ({
            id: b.id,
            timestamp: b.timestamp,
            dateLabel: formatDateOnly(b.timestamp),
            value: b.painDuring as number
          }))
      }
    ];
  }, [bowel]);

  return (
    <section className="report-section" style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}>
      <h2>5. Symptomatic Recovery Trajectories & Baseline Comparison</h2>

      {/* Delta Metrics Table */}
      <table style={{ marginBottom: '12px' }}>
        <thead>
          <tr>
            <th style={{ width: '28%' }}>Clinical Domain</th>
            <th style={{ width: '18%', textAlign: 'center' }}>Baseline Period Avg</th>
            <th style={{ width: '18%', textAlign: 'center' }}>Current Period Avg</th>
            <th style={{ width: '18%', textAlign: 'center' }}>Delta (Change)</th>
            <th style={{ width: '18%', textAlign: 'center' }}>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Sexual Pain During (0–10 NRS)</td>
            <td style={{ textAlign: 'center' }}>{trends.pain.sexual.painDuring.baselineAvg} / 10</td>
            <td style={{ textAlign: 'center' }}>{trends.pain.sexual.painDuring.currentAvg} / 10</td>
            <td style={{ textAlign: 'center', fontWeight: 'bold' }}>
              {trends.pain.sexual.painDuring.delta > 0 ? `+${trends.pain.sexual.painDuring.delta}` : trends.pain.sexual.painDuring.delta}
            </td>
            <td style={{ textAlign: 'center', fontWeight: 'bold' }}>
              {trends.pain.sexual.painDuring.isImproved ? 'Improved' : trends.pain.sexual.painDuring.delta === 0 ? 'Stable' : 'Elevated'}
            </td>
          </tr>
          <tr>
            <td>Bowel Straining Level (0–10)</td>
            <td style={{ textAlign: 'center' }}>{trends.bowel.strainingLevel.baselineAvg} / 10</td>
            <td style={{ textAlign: 'center' }}>{trends.bowel.strainingLevel.currentAvg} / 10</td>
            <td style={{ textAlign: 'center', fontWeight: 'bold' }}>
              {trends.bowel.strainingLevel.delta > 0 ? `+${trends.bowel.strainingLevel.delta}` : trends.bowel.strainingLevel.delta}
            </td>
            <td style={{ textAlign: 'center', fontWeight: 'bold' }}>
              {trends.bowel.strainingLevel.isImproved ? 'Improved' : trends.bowel.strainingLevel.delta === 0 ? 'Stable' : 'Elevated'}
            </td>
          </tr>
          <tr>
            <td>Incontinence / Leak Frequency</td>
            <td style={{ textAlign: 'center' }}>{trends.urinary.totalLeaks.baseline} episodes</td>
            <td style={{ textAlign: 'center' }}>{trends.urinary.totalLeaks.current} episodes</td>
            <td style={{ textAlign: 'center', fontWeight: 'bold' }}>
              {trends.urinary.totalLeaks.reductionRate > 0 ? `-${trends.urinary.totalLeaks.reductionRate}%` : `${trends.urinary.totalLeaks.reductionRate}%`}
            </td>
            <td style={{ textAlign: 'center', fontWeight: 'bold' }}>
              {trends.urinary.totalLeaks.reductionRate >= 0 ? 'Reduced' : 'Elevated'}
            </td>
          </tr>
          <tr>
            <td>Bristol Stool Normalization (Types 3–4)</td>
            <td style={{ textAlign: 'center' }}>{trends.bowel.bristolNormalizationRate.baselinePercent}%</td>
            <td style={{ textAlign: 'center' }}>{trends.bowel.bristolNormalizationRate.currentPercent}%</td>
            <td style={{ textAlign: 'center', fontWeight: 'bold' }}>
              {trends.bowel.bristolNormalizationRate.delta > 0 ? `+${trends.bowel.bristolNormalizationRate.delta}%` : `${trends.bowel.bristolNormalizationRate.delta}%`}
            </td>
            <td style={{ textAlign: 'center', fontWeight: 'bold' }}>
              {trends.bowel.bristolNormalizationRate.isImproved ? 'Improved' : 'Stable'}
            </td>
          </tr>
        </tbody>
      </table>

      {/* High-contrast printable charts */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '10px' }}>
        <SymptomTrendChart
          series={sexualPainSeries}
          title="Sexual Pelvic Pain Trajectory (Before / During / After)"
          maxScale={10}
          isPrintMode={true}
        />
        <SymptomTrendChart
          series={bowelSeries}
          title="Bowel Straining & Defecation Pain Trajectory"
          maxScale={10}
          isPrintMode={true}
        />
      </div>
    </section>
  );
};

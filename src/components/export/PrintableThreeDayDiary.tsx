import React from 'react';
import type { UrinaryLogEntry } from '../../types';
import {
  aggregateBladderDiary,
  type DailyBladderSummary
} from '../../utils/bladderDiaryAggregator';
import { getUrinaryUrgencyLabel } from '../../utils/logFormatters';

interface PrintableThreeDayDiaryProps {
  entries: UrinaryLogEntry[];
}

export const PrintableThreeDayDiary: React.FC<PrintableThreeDayDiaryProps> = ({ entries }) => {
  const aggregation = aggregateBladderDiary(entries, 6);
  const { days, overallStats } = aggregation;

  if (entries.length === 0) {
    return (
      <p style={{ fontSize: '9pt', fontStyle: 'italic', color: '#666666' }}>
        No urinary diary records logged during this 3-day diary period.
      </p>
    );
  }

  return (
    <div className="three-day-bladder-diary-print">
      {/* 1. Daily 24-Hour Balance & Nocturia Summary Table */}
      <h3 style={{ fontSize: '10pt', color: '#2B7A68', margin: '8px 0 4px 0' }}>
        2.1 3-Day Frequency-Volume & Fluid Balance Summary (06:00–06:00 Cycles)
      </h3>
      <table>
        <thead>
          <tr>
            <th style={{ width: '8%', textAlign: 'center' }}>Day</th>
            <th style={{ width: '22%' }}>24-Hour Cycle</th>
            <th style={{ width: '13%', textAlign: 'right' }}>Fluid Intake</th>
            <th style={{ width: '13%', textAlign: 'right' }}>Void Output</th>
            <th style={{ width: '12%', textAlign: 'right' }}>Net Balance</th>
            <th style={{ width: '10%', textAlign: 'center' }}>Day Voids</th>
            <th style={{ width: '11%', textAlign: 'center' }}>Nocturia (Night)</th>
            <th style={{ width: '11%', textAlign: 'center' }}>Leak Episodes</th>
          </tr>
        </thead>
        <tbody>
          {days.map((d: DailyBladderSummary) => {
            const prefix = d.fluidBalanceDeltaMl > 0 ? '+' : '';
            return (
              <tr key={d.dateKey}>
                <td style={{ textAlign: 'center', fontWeight: 'bold' }}>Day {d.dayIndex}</td>
                <td>
                  <strong>{d.dateLabel}</strong>
                  <div style={{ fontSize: '7.5pt', color: '#555555' }}>{d.periodLabel}</div>
                </td>
                <td style={{ textAlign: 'right' }}>{d.totalIntakeMl} mL</td>
                <td style={{ textAlign: 'right' }}>{d.totalVoidOutputMl} mL</td>
                <td style={{ textAlign: 'right', fontWeight: 'bold' }}>
                  {prefix}{d.fluidBalanceDeltaMl} mL
                </td>
                <td style={{ textAlign: 'center' }}>{d.daytimeVoidCount}</td>
                <td style={{ textAlign: 'center', fontWeight: d.nocturiaVoidCount >= 2 ? 'bold' : 'normal' }}>
                  {d.nocturiaVoidCount}
                </td>
                <td style={{ textAlign: 'center', fontWeight: d.leakageEpisodeCount > 0 ? 'bold' : 'normal' }}>
                  {d.leakageEpisodeCount}
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr style={{ background: '#F0F4F2', fontWeight: 'bold' }}>
            <td colSpan={2} style={{ textAlign: 'right' }}>3-Day Daily Averages / Total:</td>
            <td style={{ textAlign: 'right' }}>{overallStats.avgDailyIntakeMl} mL/day</td>
            <td style={{ textAlign: 'right' }}>{overallStats.avgDailyVoidOutputMl} mL/day</td>
            <td style={{ textAlign: 'right' }}>
              {overallStats.overallBalanceMl > 0 ? '+' : ''}{overallStats.overallBalanceMl} mL
            </td>
            <td style={{ textAlign: 'center' }}>{overallStats.avgDaytimeVoids} /day</td>
            <td style={{ textAlign: 'center' }}>{overallStats.avgNocturiaVoids} /night</td>
            <td style={{ textAlign: 'center' }}>{overallStats.totalLeaks} leaks</td>
          </tr>
        </tfoot>
      </table>

      {/* 2. Detailed Chronological Diary per 24-hr Day */}
      <h3 style={{ fontSize: '10pt', color: '#2B7A68', margin: '14px 0 6px 0' }}>
        2.2 Chronological 24-Hour Diary Events (Day by Day)
      </h3>

      {days.map((day) => (
        <div key={day.dateKey} style={{ marginBottom: '12px', pageBreakInside: 'avoid', breakInside: 'avoid' }}>
          <div
            style={{
              fontSize: '8.5pt',
              fontWeight: 'bold',
              color: '#1C2D27',
              backgroundColor: '#EAEFEA',
              padding: '3px 8px',
              border: '1px solid #777777',
              borderBottom: 'none'
            }}
          >
            Day {day.dayIndex}: {day.dateLabel} ({day.periodLabel})
          </div>

          <table>
            <thead>
              <tr>
                <th style={{ width: '12%' }}>Time</th>
                <th style={{ width: '22%' }}>Fluid Intake</th>
                <th style={{ width: '20%' }}>Void Output</th>
                <th style={{ width: '12%', textAlign: 'center' }}>Urgency</th>
                <th style={{ width: '18%' }}>Leakage / Pad</th>
                <th>Notes / Symptoms</th>
              </tr>
            </thead>
            <tbody>
              {day.timeline.map((event) => {
                const intakeStr = typeof event.fluidIntakeAmountMl === 'number' && event.fluidIntakeAmountMl >= 0
                  ? `${event.fluidIntakeAmountMl} mL (${event.fluidType})`
                  : '-';
                const voidStr = event.voidVolumeMl !== null
                  ? `${event.voidVolumeMl} mL`
                  : (event.voidVolumeType && event.voidVolumeType !== 'none' ? event.voidVolumeType : '-');
                const isNight = event.isNight;
                const leakStr = event.leakageAmount !== 'none'
                  ? `${event.leakageAmount} (${event.leakageType})`
                  : (event.padUsage !== 'none' && event.padUsage !== 'dry' ? `Pad: ${event.padUsage}` : '-');

                return (
                  <tr key={event.id} style={{ background: isNight ? '#F7F8FC' : '#FFFFFF' }}>
                    <td>
                      <strong>{event.timeFormatted}</strong>
                      {isNight && <span style={{ fontSize: '7pt', color: '#4338CA', display: 'block' }}>[Nocturia]</span>}
                    </td>
                    <td>{intakeStr}</td>
                    <td>
                      {voidStr}
                      {event.voidStream !== 'normal' && <span style={{ fontSize: '7pt', color: '#666' }}> ({event.voidStream})</span>}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {getUrinaryUrgencyLabel(event.urgencyLevel as any)}
                    </td>
                    <td>
                      {leakStr}
                      {event.leakageActivity ? <div style={{ fontSize: '7pt', color: '#555' }}>Act: {event.leakageActivity}</div> : null}
                    </td>
                    <td style={{ fontStyle: 'italic', fontSize: '8pt' }}>
                      {event.notes || '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
};

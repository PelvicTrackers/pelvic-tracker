import React from 'react';
import { useLogStore } from '../../store/useLogStore';
import {
  formatDateTime,
  getSexualActivityName,
  getEjaculationName,
  getUrinaryUrgencyLabel,
  CLINICAL_METRIC_LABELS
} from '../../utils/logFormatters';
import {
  getArousalMetricLabel,
  getClimaxMetricLabel,
  getSplintingLabel
} from '../../data/clinicalScales';
import { filterEntriesByDateRange, formatDateRangeLabel } from '../../utils/dateFilters';
import { ReportLegend } from './ReportLegend';
import { PrintableThreeDayDiary } from './PrintableThreeDayDiary';
import { PrintableTrendSection } from './PrintableTrendSection';
import type { CustomMetricItem } from '../../types';

interface NotesAndMetricsCellProps {
  notes?: string;
  metricComments?: Record<string, string>;
  customMetrics?: CustomMetricItem[];
}

const NotesAndMetricsCell: React.FC<NotesAndMetricsCellProps> = ({
  notes,
  metricComments,
  customMetrics
}) => {
  const activeComments = metricComments
    ? Object.entries(metricComments).filter(([, val]) => val && val.trim().length > 0)
    : [];
  const activeCustom = customMetrics && customMetrics.length > 0 ? customMetrics : [];
  const hasNotes = Boolean(notes && notes.trim().length > 0);

  if (!hasNotes && activeComments.length === 0 && activeCustom.length === 0) {
    return <span>-</span>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
      {hasNotes && (
        <div style={{ fontStyle: 'italic', color: '#1C2D27' }}>
          {notes}
        </div>
      )}
      {activeComments.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px' }}>
          {activeComments.map(([k, v]) => (
            <span key={k} className="sub-metric-pill">
              <strong>{CLINICAL_METRIC_LABELS[k] || k}:</strong> {v}
            </span>
          ))}
        </div>
      )}
      {activeCustom.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px' }}>
          {activeCustom.map((cm) => {
            const val = (cm.isNA || cm.value === null)
              ? 'N/A'
              : cm.scale === '1-10'
                ? `${cm.value}/10`
                : `${cm.value}%`;
            const comment = cm.comment && cm.comment.trim() ? ` (${cm.comment.trim()})` : '';
            return (
              <span key={cm.id || cm.name} className="sub-metric-pill">
                <strong>{cm.name}:</strong> {val}{comment}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
};

export const PrintableClinicalReport: React.FC = () => {
  const sexual = useLogStore((s) => s.sexualEntries);
  const urinary = useLogStore((s) => s.urinaryEntries);
  const bowel = useLogStore((s) => s.bowelEntries);
  const notes = useLogStore((s) => s.notes);
  const patientInitials = useLogStore((s) => s.patientInitials);
  const exportDateRange = useLogStore((s) => s.exportDateRange);
  const customStartDate = useLogStore((s) => s.customStartDate);
  const customEndDate = useLogStore((s) => s.customEndDate);
  const includeChartsInReport = useLogStore((s) => s.includeChartsInReport);
  const anatomyProfile = useLogStore((s) => s.anatomyProfile);
  const customAnatomy = useLogStore((s) => s.customAnatomy);

  const arousalLabel = getArousalMetricLabel(anatomyProfile, customAnatomy);
  const climaxLabel = getClimaxMetricLabel(anatomyProfile);

  const exportDate = React.useMemo(() => formatDateTime(new Date().toISOString()), []);
  const dateFilterLabel = formatDateRangeLabel(exportDateRange, customStartDate, customEndDate);

  const filteredSexual = filterEntriesByDateRange(sexual, exportDateRange, customStartDate, customEndDate);
  const filteredUrinary = filterEntriesByDateRange(urinary, exportDateRange, customStartDate, customEndDate);
  const filteredBowel = filterEntriesByDateRange(bowel, exportDateRange, customStartDate, customEndDate);
  const filteredNotes = filterEntriesByDateRange(notes, exportDateRange, customStartDate, customEndDate);

  const voidEntries = filteredUrinary.filter(
    (u) => u.eventType === 'void' || u.eventType === 'combined' || (!u.eventType && (u.voidVolumeType || typeof u.voidVolumeMl === 'number' || typeof u.fluidIntakeAmountMl === 'number'))
  );
  const leakageEntries = filteredUrinary.filter(
    (u) => u.eventType === 'leakage' || u.eventType === 'combined' || (u.leakageType && u.leakageType !== 'none') || (u.leakageAmount && u.leakageAmount !== 'none')
  );

  return (
    <div className="print-only">
      <header>
        <h1>Pelvic Floor Physical Therapy Clinical Report</h1>
        <div style={{ fontSize: '9pt', color: '#444444', marginTop: '4px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '4px' }}>
          <span><strong>Patient:</strong> {patientInitials || 'Confidential Patient Log'}</span>
          <span><strong>Filter Range:</strong> {dateFilterLabel}</span>
          <span><strong>Report Date:</strong> {exportDate}</span>
          <span><strong>Storage:</strong> Sandboxed Local Device (HIPAA-by-Design)</span>
        </div>
      </header>

      {/* 1. Sexual Function & Pelvic Pain */}
      <section className="report-section">
        <h2>1. Sexual Function & Pelvic Pain Log (IPC Sheet Standard)</h2>
        {filteredSexual.length === 0 ? (
          <p style={{ fontSize: '9pt', fontStyle: 'italic', color: '#666666' }}>No entries recorded in this category for selected range.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th style={{ width: '15%' }}>Date / Time</th>
                <th style={{ width: '13%' }}>Activity</th>
                <th style={{ width: '14%' }}>Position (Dur)</th>
                <th style={{ width: '13%', textAlign: 'center' }}>Pain (B / D / A)</th>
                <th style={{ width: '8%', textAlign: 'center' }}>{arousalLabel}</th>
                <th style={{ width: '8%', textAlign: 'center' }}>Pleasure</th>
                <th style={{ width: '11%' }}>{climaxLabel}</th>
                <th>Clinical Notes & Scales</th>
              </tr>
            </thead>
            <tbody>
              {filteredSexual.map((e) => (
                <tr key={e.id}>
                  <td>{formatDateTime(e.timestamp)}</td>
                  <td>{getSexualActivityName(e.activity)}</td>
                  <td>{e.position || '-'} ({e.durationMinutes !== null ? `${e.durationMinutes}m` : 'N/A'})</td>
                  <td style={{ textAlign: 'center', fontWeight: 'bold' }}>
                    {e.painBefore ?? 'N/A'} / {e.painDuring ?? 'N/A'} / {e.painAfter ?? 'N/A'}
                  </td>
                  <td style={{ textAlign: 'center' }}>{e.erectionArousalScore !== null ? `${e.erectionArousalScore}%` : 'N/A'}</td>
                  <td style={{ textAlign: 'center' }}>{e.pleasureScore !== null ? `${e.pleasureScore}%` : 'N/A'}</td>
                  <td>{getEjaculationName(e.ejaculation, anatomyProfile)}</td>
                  <td>
                    <NotesAndMetricsCell
                      notes={e.notes}
                      metricComments={e.metricComments}
                      customMetrics={e.customMetrics}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* 2. Bladder Diary: 3-Day Clinical Format vs Standard Diary */}
      <section className="report-section">
        <h2>2. Urinary & Bladder Diary</h2>

        {exportDateRange === '3days' ? (
          <PrintableThreeDayDiary entries={filteredUrinary} />
        ) : (
          <>
            {/* 2.1 Voids */}
            <h3>2.1 Urinary Voids & Fluid Intake</h3>
            {voidEntries.length === 0 ? (
              <p style={{ fontSize: '9pt', fontStyle: 'italic', color: '#666666' }}>No voiding records logged during this period.</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th style={{ width: '16%' }}>Date / Time</th>
                    <th style={{ width: '18%' }}>Fluid Intake</th>
                    <th style={{ width: '16%' }}>Void Output</th>
                    <th style={{ width: '12%' }}>Stream</th>
                    <th style={{ width: '13%' }}>Urgency</th>
                    <th>Clinical Notes & Scales</th>
                  </tr>
                </thead>
                <tbody>
                  {voidEntries.map((u) => {
                    const intake = typeof u.fluidIntakeAmountMl === 'number' && u.fluidIntakeAmountMl > 0
                      ? `${u.fluidIntakeAmountMl} mL (${u.fluidType})`
                      : (u.fluidIntakeAmountMl === null ? 'N/A' : '-');
                    const voidDesc = u.voidVolumeType === 'Measured'
                      ? (u.voidVolumeMl !== null ? `${u.voidVolumeMl} mL` : 'N/A')
                      : (u.voidVolumeType ?? 'N/A');
                    return (
                      <tr key={u.id}>
                        <td>{formatDateTime(u.timestamp)}</td>
                        <td>{intake}</td>
                        <td>{voidDesc}</td>
                        <td>{u.voidStream ?? 'N/A'}</td>
                        <td>{getUrinaryUrgencyLabel(u.urgencyLevel)}</td>
                        <td>
                          <NotesAndMetricsCell
                            notes={u.notes}
                            metricComments={u.metricComments}
                            customMetrics={u.customMetrics}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}

            {/* 2.2 Leakage Episodes */}
            <h3 style={{ marginTop: '12px' }}>2.2 Incontinence & Leakage Episodes</h3>
            {leakageEntries.length === 0 ? (
              <p style={{ fontSize: '9pt', fontStyle: 'italic', color: '#666666' }}>No incontinence episodes logged during this period.</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th style={{ width: '16%' }}>Date / Time</th>
                    <th style={{ width: '14%' }}>Leak Type</th>
                    <th style={{ width: '13%' }}>Amount</th>
                    <th style={{ width: '18%' }}>Activity / Trigger</th>
                    <th style={{ width: '12%' }}>Pad Status</th>
                    <th style={{ width: '12%' }}>Urgency</th>
                    <th>Clinical Notes & Scales</th>
                  </tr>
                </thead>
                <tbody>
                  {leakageEntries.map((u) => (
                    <tr key={u.id}>
                      <td>{formatDateTime(u.timestamp)}</td>
                      <td>{u.leakageType !== 'none' ? u.leakageType : 'None'}</td>
                      <td>{u.leakageAmount !== 'none' ? u.leakageAmount : 'None'}</td>
                      <td>{u.leakageActivity || 'None reported'}</td>
                      <td>{u.padUsage ?? 'N/A'}</td>
                      <td>{getUrinaryUrgencyLabel(u.urgencyLevel)}</td>
                      <td>
                        <NotesAndMetricsCell
                          notes={u.notes}
                          metricComments={u.metricComments}
                          customMetrics={u.customMetrics}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        )}
      </section>

      {/* 3. Bowel Diary */}
      <section className="report-section">
        <h2>3. Bowel & Defecation Diary (Bristol Stool Form Scale)</h2>
        {filteredBowel.length === 0 ? (
          <p style={{ fontSize: '9pt', fontStyle: 'italic', color: '#666666' }}>No bowel movements recorded during this period.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th style={{ width: '15%' }}>Date / Time</th>
                <th style={{ width: '12%', textAlign: 'center' }}>Bristol Form</th>
                <th style={{ width: '12%', textAlign: 'center' }}>Straining</th>
                <th style={{ width: '11%' }}>Evacuation</th>
                <th style={{ width: '12%', textAlign: 'center' }}>Pain (B / D / A)</th>
                <th style={{ width: '11%' }}>Leakage</th>
                <th style={{ width: '10%' }}>Splinting</th>
                <th>Clinical Notes & Scales</th>
              </tr>
            </thead>
            <tbody>
              {filteredBowel.map((b) => (
                <tr key={b.id}>
                  <td>{formatDateTime(b.timestamp)}</td>
                  <td style={{ textAlign: 'center' }}>{b.bristolType !== null ? `Type ${b.bristolType}` : 'N/A'}</td>
                  <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{b.strainingLevel !== null ? `${b.strainingLevel} / 10` : 'N/A'}</td>
                  <td>{b.evacuationCompleteness ?? 'N/A'}</td>
                  <td style={{ textAlign: 'center' }}>{b.painBefore ?? 'N/A'} / {b.painDuring ?? 'N/A'} / {b.painAfter ?? 'N/A'}</td>
                  <td>{b.accidentalLeakage ?? 'N/A'}</td>
                  <td>{b.posturalSplinting ? getSplintingLabel(b.posturalSplinting) : 'None'}</td>
                  <td>
                    <NotesAndMetricsCell
                      notes={b.notes}
                      metricComments={b.metricComments}
                      customMetrics={b.customMetrics}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* 4. Notes & PT Questions */}
      <section className="report-section">
        <h2>4. Symptoms, Flare-ups & Questions for PT</h2>
        {filteredNotes.length === 0 ? (
          <p style={{ fontSize: '9pt', fontStyle: 'italic', color: '#666666' }}>No notes recorded for selected range.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {filteredNotes.map((n) => (
              <div key={n.id} className="note-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                  <strong>[{n.category}] {n.title || 'Note'}</strong>
                  <span style={{ color: '#555555', fontSize: '8.5pt' }}>{formatDateTime(n.timestamp)}</span>
                </div>
                <div style={{ whiteSpace: 'pre-wrap', fontSize: '8.5pt' }}>{n.content}</div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 5. Symptomatic Trend Graphs & Baseline Recovery (Optional) */}
      {includeChartsInReport && (
        <PrintableTrendSection
          sexual={filteredSexual}
          urinary={filteredUrinary}
          bowel={filteredBowel}
        />
      )}

      {/* Clinical Reference & Scale Legend */}
      <ReportLegend />
    </div>
  );
};

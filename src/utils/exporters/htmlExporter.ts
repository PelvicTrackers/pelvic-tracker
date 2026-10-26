import type {
  SexualLogEntry,
  UrinaryLogEntry,
  BowelLogEntry,
  PatientNote,
  CustomMetricItem
} from '../../types';
import {
  formatDateTime,
  getSexualActivityName,
  getEjaculationName,
  getUrinaryUrgencyLabel,
  CLINICAL_METRIC_LABELS
} from '../logFormatters';

export function generateHtmlReport(data: {
  sexual: SexualLogEntry[];
  urinary: UrinaryLogEntry[];
  bowel: BowelLogEntry[];
  notes: PatientNote[];
  patientInitials?: string;
  dateRangeLabel?: string;
}): string {
  const exportDate = formatDateTime(new Date().toISOString());
  const patient = data.patientInitials ? `Patient: ${escapeHtml(data.patientInitials)}` : 'Confidential Patient Record';
  const filterMeta = data.dateRangeLabel ? `Filter: ${escapeHtml(data.dateRangeLabel)} | ` : '';

  const voidEntries = data.urinary.filter(
    (u) => u.eventType === 'void' || u.eventType === 'combined' || (!u.eventType && (u.voidVolumeType || typeof u.voidVolumeMl === 'number' || typeof u.fluidIntakeAmountMl === 'number'))
  );
  const leakageEntries = data.urinary.filter(
    (u) => u.eventType === 'leakage' || u.eventType === 'combined' || (u.leakageType && u.leakageType !== 'none') || (u.leakageAmount && u.leakageAmount !== 'none')
  );

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Pelvic Health Clinical Summary - ${exportDate}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
      margin: 30px;
      color: #212529;
      background: #FFFFFF;
      line-height: 1.5;
    }
    .header {
      border-bottom: 2px solid #2B7A68;
      padding-bottom: 12px;
      margin-bottom: 24px;
    }
    h1 {
      font-size: 22px;
      color: #2B7A68;
      margin: 0 0 6px 0;
    }
    .meta {
      font-size: 13px;
      color: #6C757D;
    }
    h2 {
      font-size: 16px;
      margin: 26px 0 10px;
      color: #1C2D27;
      border-bottom: 1px solid #DEE2E6;
      padding-bottom: 4px;
    }
    h3 {
      font-size: 14px;
      margin: 16px 0 8px;
      color: #2B7A68;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
      font-size: 12px;
    }
    th, td {
      border: 1px solid #CED4DA;
      padding: 7px 10px;
      text-align: left;
      vertical-align: top;
    }
    th {
      background-color: #F8F9FA;
      font-weight: 600;
    }
    tr:nth-child(even) td {
      background-color: #FAFCFB;
    }
    .note-card {
      border: 1px solid #CED4DA;
      border-radius: 6px;
      padding: 12px;
      margin-bottom: 12px;
      background: #FDFEFE;
    }
    .note-tag {
      display: inline-block;
      font-size: 11px;
      font-weight: bold;
      background: #E3F2ED;
      color: #2B7A68;
      padding: 2px 6px;
      border-radius: 4px;
      margin-bottom: 6px;
    }
    .entry-note {
      font-style: italic;
      color: #1C2D27;
      margin-bottom: 4px;
    }
    .sub-metric {
      display: inline-block;
      background: #EDF3F0;
      border: 1px solid #D0DDD6;
      border-radius: 4px;
      padding: 1px 6px;
      margin: 2px 2px 2px 0;
      font-size: 11px;
    }
    .report-legend {
      margin-top: 36px;
      padding-top: 16px;
      border-top: 2px solid #2B7A68;
      font-size: 11px;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .legend-header h3 {
      font-size: 14px;
      color: #1C2D27;
      margin: 0 0 2px 0;
    }
    .legend-subtext {
      font-size: 11px;
      color: #6C757D;
      margin: 0 0 12px 0;
    }
    .legend-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }
    .legend-block {
      border: 1px solid #CED4DA;
      border-radius: 4px;
      padding: 10px;
      background: #FDFEFE;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .legend-block-title {
      font-weight: 700;
      color: #2B7A68;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-bottom: 1px solid #E9ECEF;
      padding-bottom: 4px;
      margin-bottom: 6px;
    }
    .legend-list {
      margin: 0;
      padding-left: 16px;
      line-height: 1.4;
    }
    .legend-list li {
      margin-bottom: 3px;
    }
    .legend-divider {
      list-style: none;
      margin: 6px 0;
      border-bottom: 1px dashed #DEE2E6;
    }
    @media print {
      body { margin: 15px; }
      table { page-break-inside: auto; }
      tr { page-break-inside: avoid; page-break-after: auto; }
      .report-legend { page-break-inside: avoid; break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Pelvic Health Clinical Tracking Report</h1>
    <div class="meta">
      <strong>${patient}</strong> | ${filterMeta}Generated: ${exportDate} | HIPAA-by-Design Local-First Log
    </div>
  </div>

  <h2>1. Sexual Function & Pelvic Pain Diary</h2>
  ${renderSexualTable(data.sexual)}

  <h2>2. Urinary & Bladder Diary</h2>
  <h3>2.1 Urinary Voids & Fluid Intake</h3>
  ${renderUrinaryVoidsTable(voidEntries)}

  <h3>2.2 Incontinence & Leakage Episodes</h3>
  ${renderUrinaryLeakageTable(leakageEntries)}

  <h2>3. Bowel & Defecation Diary (Bristol Stool Scale)</h2>
  ${renderBowelTable(data.bowel)}

  <h2>4. Patient Notes, Flare-ups & PT Questions</h2>
  ${renderNotes(data.notes)}

  <footer class="report-legend">
    <div class="legend-header">
      <h3>Clinical Reference & Scale Legend</h3>
      <p class="legend-subtext">Pelvic Floor Physical Therapy Diagnostic & Standard Tracking Codes</p>
    </div>
    <div class="legend-grid">
      <div class="legend-block">
        <div class="legend-block-title">Pain Scoring (0–10 NRS) & Timing</div>
        <ul class="legend-list">
          <li><strong>B:</strong> Pain <em>Before</em> activity</li>
          <li><strong>D:</strong> Pain <em>During</em> activity</li>
          <li><strong>A:</strong> Pain <em>After</em> activity</li>
          <li><strong>0:</strong> No pain (clinically significant baseline)</li>
          <li><strong>1–3:</strong> Mild | <strong>4–6:</strong> Moderate | <strong>7–10:</strong> Severe</li>
        </ul>
      </div>

      <div class="legend-block">
        <div class="legend-block-title">Sexual Activity & Climax Codes</div>
        <ul class="legend-list">
          <li><strong>M:</strong> Masturbation (Neutral Baseline)</li>
          <li><strong>PVI:</strong> Penile-Vaginal Intercourse (Penetrative)</li>
          <li><strong>RVI:</strong> Receptive Vaginal Intercourse</li>
          <li><strong>PAI:</strong> Penile-Anal Intercourse (Penetrative)</li>
          <li><strong>RAI:</strong> Receptive Anal Intercourse</li>
          <li><strong>Other:</strong> Other Intimacy / Non-penetrative</li>
          <li class="legend-divider"></li>
          <li><strong>N:</strong> Normal (Comfortable & expected timing)</li>
          <li><strong>E:</strong> Early (Premature or rapid climax/ejaculation)</li>
          <li><strong>D:</strong> Delayed (Extended effort required)</li>
          <li><strong>A:</strong> Absent (Anorgasmia / unable to climax)</li>
          <li><strong>P:</strong> Painful (Pelvic/perineal/urethral discomfort)</li>
        </ul>
      </div>

      <div class="legend-block">
        <div class="legend-block-title">Urinary Diary Scales</div>
        <ul class="legend-list">
          <li><strong>Urgency 0:</strong> None (Normal sensation, can defer comfortably)</li>
          <li><strong>Urgency 1:</strong> Mild (First sensation of fullness, easy to hold)</li>
          <li><strong>Urgency 2:</strong> Moderate (Strong desire, must empty within minutes)</li>
          <li><strong>Urgency 3:</strong> Severe (Sudden uncontrollable urge, fear of leakage)</li>
          <li class="legend-divider"></li>
          <li><strong>Leakage Amounts:</strong> Few Drops, Moderate Wetness, Soaked / Heavy</li>
          <li><strong>Pad Statuses:</strong> Pad Dry, Pad Damp, Pad Wet, Pad Replaced</li>
        </ul>
      </div>

      <div class="legend-block">
        <div class="legend-block-title">Bristol Stool Form Scale (BSFS)</div>
        <ul class="legend-list">
          <li><strong>Type 1 [Constipation]:</strong> Separate hard lumps, like nuts (hard to pass)</li>
          <li><strong>Type 2 [Constipation]:</strong> Sausage-shaped, but lumpy and firm</li>
          <li><strong>Type 3 [Normal]:</strong> Like a sausage with cracks on surface</li>
          <li><strong>Type 4 [Normal Ideal]:</strong> Smooth and soft, like a sausage or snake</li>
          <li><strong>Type 5 [Normal]:</strong> Soft blobs with clear-cut edges (passed easily)</li>
          <li><strong>Type 6 [Diarrhea/Urgent]:</strong> Fluffy pieces with ragged edges, mushy</li>
          <li><strong>Type 7 [Diarrhea/Urgent]:</strong> Entirely liquid, watery, no solid pieces</li>
        </ul>
      </div>

      <div class="legend-block" style="grid-column: span 2;">
        <div class="legend-block-title">Defecation Assist & Postural Splinting</div>
        <ul class="legend-list">
          <li><strong>Squatty Potty:</strong> Footstool elevating knees above hips to relax puborectalis muscle.</li>
          <li><strong>Manual Splinting:</strong> Manual perineal or posterior vaginal wall pressure support during evacuation.</li>
          <li><strong>Both:</strong> Footstool posture combined with manual perineal support.</li>
        </ul>
      </div>
    </div>
  </footer>
</body>
</html>`;
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function formatNotesAndMetricsHtml(
  notes?: string,
  metricComments?: Record<string, string>,
  customMetrics?: CustomMetricItem[]
): string {
  const parts: string[] = [];
  if (notes && notes.trim().length > 0) {
    parts.push(`<div class="entry-note">${escapeHtml(notes.trim())}</div>`);
  }

  if (metricComments) {
    const comments = Object.entries(metricComments).filter(([, v]) => v && v.trim().length > 0);
    for (const [k, v] of comments) {
      const label = CLINICAL_METRIC_LABELS[k] || k;
      parts.push(`<span class="sub-metric"><strong>${escapeHtml(label)}:</strong> ${escapeHtml(v)}</span>`);
    }
  }

  if (customMetrics && customMetrics.length > 0) {
    for (const cm of customMetrics) {
      const val = (cm.isNA || cm.value === null)
        ? 'N/A'
        : cm.scale === '1-10'
          ? `${cm.value}/10`
          : `${cm.value}%`;
      const comment = cm.comment && cm.comment.trim() ? ` (${escapeHtml(cm.comment.trim())})` : '';
      parts.push(`<span class="sub-metric"><strong>${escapeHtml(cm.name)}:</strong> ${val}${comment}</span>`);
    }
  }

  return parts.length > 0 ? parts.join('') : '-';
}

function renderSexualTable(entries: SexualLogEntry[]): string {
  if (entries.length === 0) return '<p><em>No sexual health entries recorded.</em></p>';
  let rows = '';
  for (const e of entries) {
    const dur = e.durationMinutes !== null ? `${e.durationMinutes}m` : 'N/A';
    const pos = e.position ? `${escapeHtml(e.position)} (${dur})` : dur;
    const painStr = `${e.painBefore ?? 'N/A'} / ${e.painDuring ?? 'N/A'} / ${e.painAfter ?? 'N/A'}`;
    const arousalStr = e.erectionArousalScore !== null ? `${e.erectionArousalScore}%` : 'N/A';
    const pleasureStr = e.pleasureScore !== null ? `${e.pleasureScore}%` : 'N/A';
    const notesAndScales = formatNotesAndMetricsHtml(e.notes, e.metricComments, e.customMetrics);

    rows += `<tr>
      <td>${formatDateTime(e.timestamp)}</td>
      <td>${escapeHtml(getSexualActivityName(e.activity))}</td>
      <td>${pos}</td>
      <td><strong>${painStr}</strong></td>
      <td>${arousalStr}</td>
      <td>${pleasureStr}</td>
      <td>${escapeHtml(getEjaculationName(e.ejaculation))}</td>
      <td>${notesAndScales}</td>
    </tr>`;
  }
  return `<table>
    <thead>
      <tr>
        <th style="width: 15%">Date & Time</th>
        <th style="width: 14%">Activity</th>
        <th style="width: 14%">Position (Dur)</th>
        <th style="width: 13%">Pain (B/D/A)</th>
        <th style="width: 8%">Arousal</th>
        <th style="width: 8%">Pleasure</th>
        <th style="width: 10%">Ejaculation</th>
        <th>Clinical Notes & Scales</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>`;
}

function renderUrinaryVoidsTable(entries: UrinaryLogEntry[]): string {
  if (entries.length === 0) return '<p><em>No voiding records logged during this period.</em></p>';
  let rows = '';
  for (const u of entries) {
    const intake = typeof u.fluidIntakeAmountMl === 'number' && u.fluidIntakeAmountMl > 0
      ? `${u.fluidIntakeAmountMl} mL (${escapeHtml(u.fluidType)})`
      : (u.fluidIntakeAmountMl === null ? 'N/A' : '-');
    const voidDesc = u.voidVolumeType === 'Measured'
      ? (u.voidVolumeMl !== null ? `${u.voidVolumeMl} mL` : 'N/A')
      : (u.voidVolumeType ?? 'N/A');
    const notesAndScales = formatNotesAndMetricsHtml(u.notes, u.metricComments, u.customMetrics);

    rows += `<tr>
      <td>${formatDateTime(u.timestamp)}</td>
      <td>${intake}</td>
      <td>${escapeHtml(voidDesc)}</td>
      <td>${escapeHtml(u.voidStream ?? 'N/A')}</td>
      <td>${escapeHtml(getUrinaryUrgencyLabel(u.urgencyLevel))}</td>
      <td>${notesAndScales}</td>
    </tr>`;
  }
  return `<table>
    <thead>
      <tr>
        <th style="width: 16%">Date & Time</th>
        <th style="width: 18%">Fluid Intake</th>
        <th style="width: 16%">Void Output</th>
        <th style="width: 12%">Stream</th>
        <th style="width: 14%">Urgency</th>
        <th>Clinical Notes & Scales</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>`;
}

function renderUrinaryLeakageTable(entries: UrinaryLogEntry[]): string {
  if (entries.length === 0) return '<p><em>No incontinence episodes logged during this period.</em></p>';
  let rows = '';
  for (const u of entries) {
    const notesAndScales = formatNotesAndMetricsHtml(u.notes, u.metricComments, u.customMetrics);
    rows += `<tr>
      <td>${formatDateTime(u.timestamp)}</td>
      <td>${escapeHtml(u.leakageType !== 'none' ? u.leakageType : 'None')}</td>
      <td>${escapeHtml(u.leakageAmount !== 'none' ? u.leakageAmount : 'None')}</td>
      <td>${escapeHtml(u.leakageActivity || 'None reported')}</td>
      <td>${escapeHtml(u.padUsage ?? 'N/A')}</td>
      <td>${escapeHtml(getUrinaryUrgencyLabel(u.urgencyLevel))}</td>
      <td>${notesAndScales}</td>
    </tr>`;
  }
  return `<table>
    <thead>
      <tr>
        <th style="width: 16%">Date & Time</th>
        <th style="width: 14%">Leak Type</th>
        <th style="width: 13%">Amount</th>
        <th style="width: 18%">Activity / Trigger</th>
        <th style="width: 12%">Pad Status</th>
        <th style="width: 12%">Urgency</th>
        <th>Clinical Notes & Scales</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>`;
}

function renderBowelTable(entries: BowelLogEntry[]): string {
  if (entries.length === 0) return '<p><em>No bowel entries recorded.</em></p>';
  let rows = '';
  for (const b of entries) {
    const strainStr = b.strainingLevel !== null ? `${b.strainingLevel} / 10` : 'N/A';
    const painStr = `${b.painBefore ?? 'N/A'} / ${b.painDuring ?? 'N/A'} / ${b.painAfter ?? 'N/A'}`;
    const notesAndScales = formatNotesAndMetricsHtml(b.notes, b.metricComments, b.customMetrics);

    rows += `<tr>
      <td>${formatDateTime(b.timestamp)}</td>
      <td>${b.bristolType !== null ? `Type ${b.bristolType}` : 'N/A'}</td>
      <td>${strainStr}</td>
      <td>${escapeHtml(b.evacuationCompleteness ?? 'N/A')}</td>
      <td>${painStr}</td>
      <td>${escapeHtml(b.accidentalLeakage ?? 'N/A')}</td>
      <td>${escapeHtml(b.posturalSplinting ?? 'N/A')}</td>
      <td>${notesAndScales}</td>
    </tr>`;
  }
  return `<table>
    <thead>
      <tr>
        <th style="width: 15%">Date & Time</th>
        <th style="width: 12%">Bristol Scale</th>
        <th style="width: 11%">Straining</th>
        <th style="width: 11%">Evacuation</th>
        <th style="width: 12%">Pain (B/D/A)</th>
        <th style="width: 11%">Leakage</th>
        <th style="width: 10%">Splinting</th>
        <th>Clinical Notes & Scales</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>`;
}

function renderNotes(notes: PatientNote[]): string {
  if (notes.length === 0) return '<p><em>No notes recorded.</em></p>';
  let cards = '';
  for (const n of notes) {
    cards += `<div class="note-card">
      <span class="note-tag">${escapeHtml(n.category)}</span>
      <div style="font-weight: bold; margin-bottom: 4px;">${escapeHtml(n.title || 'Untitled Note')} - <span style="font-size: 11px; font-weight: normal; color: #666;">${formatDateTime(n.timestamp)}</span></div>
      <div style="white-space: pre-wrap; font-size: 12px;">${escapeHtml(n.content)}</div>
    </div>`;
  }
  return cards;
}

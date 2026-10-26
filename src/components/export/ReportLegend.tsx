import React from 'react';
import {
  BRISTOL_STOOL_SCALE,
  SEXUAL_ACTIVITIES,
  EJACULATION_OPTIONS,
  URINARY_URGENCY_LEVELS,
  LEAKAGE_AMOUNTS,
  PAD_STATUSES,
  POSTURAL_SPLINTING_OPTIONS
} from '../../data/clinicalScales';

export const ReportLegend: React.FC = () => {
  return (
    <footer className="report-legend">
      <div className="legend-header">
        <h3>Clinical Reference & Scale Legend</h3>
        <p className="legend-subtext">
          Pelvic Floor Physical Therapy Diagnostic & Standard Tracking Codes
        </p>
      </div>

      <div className="legend-grid">
        {/* 1. Pain Scale */}
        <div className="legend-block">
          <div className="legend-block-title">Pain Scoring (0–10 NRS) & Timing</div>
          <ul className="legend-list">
            <li><strong>B:</strong> Pain <em>Before</em> activity</li>
            <li><strong>D:</strong> Pain <em>During</em> activity</li>
            <li><strong>A:</strong> Pain <em>After</em> activity</li>
            <li><strong>0:</strong> No pain (clinically significant baseline)</li>
            <li><strong>1–3:</strong> Mild pain | <strong>4–6:</strong> Moderate pain | <strong>7–10:</strong> Severe pain</li>
          </ul>
        </div>

        {/* 2. Sexual Function */}
        <div className="legend-block">
          <div className="legend-block-title">Sexual Activity & Climax Codes</div>
          <ul className="legend-list">
            {SEXUAL_ACTIVITIES.map((act) => (
              <li key={act.value}>
                <strong>{act.label}:</strong> {act.fullTitle}
              </li>
            ))}
            <li className="legend-divider"></li>
            {EJACULATION_OPTIONS.map((ej) => (
              <li key={ej.value}>
                <strong>{ej.value}:</strong> {ej.description}
              </li>
            ))}
          </ul>
        </div>

        {/* 3. Urinary Scales */}
        <div className="legend-block">
          <div className="legend-block-title">Urinary Diary Scales</div>
          <ul className="legend-list">
            {URINARY_URGENCY_LEVELS.map((urg) => (
              <li key={urg.value}>
                <strong>Urgency {urg.value}:</strong> {urg.description}
              </li>
            ))}
            <li className="legend-divider"></li>
            <li>
              <strong>Leakage Amounts:</strong>{' '}
              {LEAKAGE_AMOUNTS.filter((l) => l.value !== 'none')
                .map((l) => `${l.label} (${l.value})`)
                .join(', ')}
            </li>
            <li>
              <strong>Pad Statuses:</strong>{' '}
              {PAD_STATUSES.filter((p) => p.value !== 'none')
                .map((p) => p.label)
                .join(', ')}
            </li>
          </ul>
        </div>

        {/* 4. Bristol Stool Form Scale */}
        <div className="legend-block">
          <div className="legend-block-title">Bristol Stool Form Scale (BSFS)</div>
          <ul className="legend-list">
            {BRISTOL_STOOL_SCALE.map((b) => (
              <li key={b.type}>
                <strong>Type {b.type} [{b.clinicalCategory}]:</strong> {b.description}
              </li>
            ))}
          </ul>
        </div>

        {/* 5. Defecation & Splinting */}
        <div className="legend-block" style={{ gridColumn: 'span 2' }}>
          <div className="legend-block-title">Defecation Assist & Splinting</div>
          <ul className="legend-list">
            {POSTURAL_SPLINTING_OPTIONS.map((opt) => (
              <li key={opt.value}>
                <strong>{opt.label}:</strong>{' '}
                {opt.value === 'none' && 'Standard seated posture.'}
                {opt.value === 'squatty_potty' && 'Footstool elevating knees above hips to relax the puborectalis muscle.'}
                {opt.value === 'manual_splinting' && 'Manual perineal or posterior vaginal wall pressure to assist complete rectal evacuation.'}
                {opt.value === 'both' && 'Footstool posture combined with manual perineal support.'}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
};

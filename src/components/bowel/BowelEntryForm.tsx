import React, { useState } from 'react';
import { X, Check, Clock } from 'lucide-react';
import type {
  BowelLogEntry,
  BristolStoolType,
  EvacuationCompleteness,
  BowelUrgencyLevel,
  AccidentalBowelLeakage,
  PosturalSplintingAssistance,
  CustomMetricItem
} from '../../types';
import { POSTURAL_SPLINTING_OPTIONS } from '../../data/clinicalScales';
import { formatDateTime } from '../../utils/logFormatters';
import { BristolStoolPicker } from './BristolStoolPicker';
import {
  ClinicalPainSlider,
  MetricFieldWrapper,
  DateTimeAdjusterModal,
  CustomMetricsSection
} from '../common';

interface BowelEntryFormProps {
  isOpen: boolean;
  initialEntry?: BowelLogEntry | null;
  onSave: (data: Omit<BowelLogEntry, 'id'>) => Promise<void>;
  onClose: () => void;
}

export const BowelEntryForm: React.FC<BowelEntryFormProps> = ({
  isOpen,
  initialEntry,
  onSave,
  onClose
}) => {
  const [timestamp, setTimestamp] = useState<string>(
    initialEntry?.timestamp ?? new Date().toISOString()
  );
  const [bristolType, setBristolType] = useState<BristolStoolType | null>(
    initialEntry ? initialEntry.bristolType : 4
  );
  const [strainingLevel, setStrainingLevel] = useState<number | null>(
    initialEntry ? initialEntry.strainingLevel : 0
  );
  const [evacuationCompleteness, setEvacuationCompleteness] = useState<EvacuationCompleteness | null>(
    initialEntry ? initialEntry.evacuationCompleteness : 'complete'
  );
  const [urgencyLevel, setUrgencyLevel] = useState<BowelUrgencyLevel | null>(
    initialEntry ? initialEntry.urgencyLevel : 0
  );
  const [accidentalLeakage, setAccidentalLeakage] = useState<AccidentalBowelLeakage | null>(
    initialEntry ? initialEntry.accidentalLeakage : 'none'
  );
  const [painBefore, setPainBefore] = useState<number | null>(
    initialEntry ? initialEntry.painBefore : 0
  );
  const [painDuring, setPainDuring] = useState<number | null>(
    initialEntry ? initialEntry.painDuring : 0
  );
  const [painAfter, setPainAfter] = useState<number | null>(
    initialEntry ? initialEntry.painAfter : 0
  );
  const [posturalSplinting, setPosturalSplinting] = useState<PosturalSplintingAssistance>(
    initialEntry?.posturalSplinting ?? 'none'
  );
  const [notes, setNotes] = useState<string>(initialEntry?.notes ?? '');
  const [metricComments, setMetricComments] = useState<Record<string, string>>(
    initialEntry?.metricComments ?? {}
  );
  const [customMetrics, setCustomMetrics] = useState<CustomMetricItem[]>(
    initialEntry?.customMetrics ?? []
  );

  const [showTimeAdjuster, setShowTimeAdjuster] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const setMetricComment = (key: string, comment: string) => {
    setMetricComments((prev) => ({
      ...prev,
      [key]: comment
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSave({
        timestamp,
        bristolType,
        strainingLevel,
        evacuationCompleteness,
        urgencyLevel,
        accidentalLeakage,
        painBefore,
        painDuring,
        painAfter,
        posturalSplinting,
        notes,
        metricComments,
        customMetrics
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="bowel-form-title">
        <div className="modal-content">
          <div className="modal-header">
            <div>
              <h2 id="bowel-form-title">
                {initialEntry ? 'Edit Bowel Movement' : 'Log Bowel Movement (BM)'}
              </h2>
              <button
                type="button"
                onClick={() => setShowTimeAdjuster(true)}
                className="privacy-badge"
                style={{ marginTop: '4px' }}
                aria-label="Adjust date and time"
              >
                <Clock size={12} />
                <span>{formatDateTime(timestamp)} (Tap to Adjust)</span>
              </button>
            </div>
            <button
              type="button"
              className="icon-btn"
              onClick={onClose}
              aria-label="Close modal"
              style={{ width: '40px', height: '40px' }}
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
            <div className="modal-body">
              {/* Bristol Stool Form with N/A & Comment */}
              <MetricFieldWrapper
                label="Bristol Stool Scale (Type 1–7)"
                isNA={bristolType === null}
                onNAToggle={(isNA) => setBristolType(isNA ? null : 4)}
                comment={metricComments['bristolType']}
                onCommentChange={(comment) => setMetricComment('bristolType', comment)}
                commentPlaceholder="e.g. Mixed consistency, hard initial fragment..."
              >
                <BristolStoolPicker
                  hideLabel
                  value={bristolType}
                  onChange={setBristolType}
                  isNA={bristolType === null}
                />
              </MetricFieldWrapper>

              {/* Straining & Evacuation Quality */}
              <div style={{ margin: '16px 0 10px', borderTop: '1px solid var(--card-border)', paddingTop: '16px' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '12px' }}>
                  Straining & Evacuation Quality
                </span>

                {/* Straining Slider (Without subjective leading text) */}
                <MetricFieldWrapper
                  label="Straining Effort (0–10 NRS)"
                  isNA={strainingLevel === null}
                  onNAToggle={(isNA) => setStrainingLevel(isNA ? null : 0)}
                  comment={metricComments['strainingLevel']}
                  onCommentChange={(comment) => setMetricComment('strainingLevel', comment)}
                  commentPlaceholder="e.g. Required prolonged Valsalva bearing down..."
                >
                  <ClinicalPainSlider
                    hideLabel
                    value={strainingLevel}
                    onChange={setStrainingLevel}
                    isNA={strainingLevel === null}
                  />
                </MetricFieldWrapper>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                  {/* Evacuation Completeness with N/A & Comment */}
                  <MetricFieldWrapper
                    label="Evacuation Completeness"
                    isNA={evacuationCompleteness === null}
                    onNAToggle={(isNA) => setEvacuationCompleteness(isNA ? null : 'complete')}
                    comment={metricComments['evacuationCompleteness']}
                    onCommentChange={(comment) => setMetricComment('evacuationCompleteness', comment)}
                  >
                    <select
                      id="evac-comp"
                      className="form-select"
                      value={evacuationCompleteness ?? 'complete'}
                      disabled={evacuationCompleteness === null}
                      onChange={(e) => setEvacuationCompleteness(e.target.value as EvacuationCompleteness)}
                    >
                      <option value="complete">Complete evacuation (Empty)</option>
                      <option value="incomplete">Incomplete / Tenesmus sensation</option>
                    </select>
                  </MetricFieldWrapper>

                  {/* Urgency Level with N/A & Comment */}
                  <MetricFieldWrapper
                    label="Bowel Urgency Level"
                    isNA={urgencyLevel === null}
                    onNAToggle={(isNA) => setUrgencyLevel(isNA ? null : 0)}
                    comment={metricComments['urgencyLevel']}
                    onCommentChange={(comment) => setMetricComment('urgencyLevel', comment)}
                  >
                    <select
                      id="bowel-urgency"
                      className="form-select"
                      value={urgencyLevel ?? 0}
                      disabled={urgencyLevel === null}
                      onChange={(e) => setUrgencyLevel(Number(e.target.value) as BowelUrgencyLevel)}
                    >
                      <option value={0}>0 - Normal warning</option>
                      <option value={1}>1 - Mild urge</option>
                      <option value={2}>2 - Moderate / rushed</option>
                      <option value={3}>3 - Severe rush / fear of accident</option>
                    </select>
                  </MetricFieldWrapper>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                  {/* Accidental Bowel Leakage with N/A & Comment */}
                  <MetricFieldWrapper
                    label="Accidental Bowel Leakage"
                    isNA={accidentalLeakage === null}
                    onNAToggle={(isNA) => setAccidentalLeakage(isNA ? null : 'none')}
                    comment={metricComments['accidentalLeakage']}
                    onCommentChange={(comment) => setMetricComment('accidentalLeakage', comment)}
                  >
                    <select
                      id="accidental-leak"
                      className="form-select"
                      value={accidentalLeakage ?? 'none'}
                      disabled={accidentalLeakage === null}
                      onChange={(e) => setAccidentalLeakage(e.target.value as AccidentalBowelLeakage)}
                    >
                      <option value="none">None</option>
                      <option value="gas">Gas with slight leakage</option>
                      <option value="soiling">Minor smearing / soiling</option>
                      <option value="fecal_incontinence">Major fecal incontinence</option>
                    </select>
                  </MetricFieldWrapper>

                  {/* Postural / Splinting Assist */}
                  <MetricFieldWrapper
                    label="Postural / Splinting Assist"
                    comment={metricComments['posturalSplinting']}
                    onCommentChange={(comment) => setMetricComment('posturalSplinting', comment)}
                  >
                    <select
                      id="postural-assist"
                      className="form-select"
                      value={posturalSplinting}
                      onChange={(e) => setPosturalSplinting(e.target.value as PosturalSplintingAssistance)}
                    >
                      {POSTURAL_SPLINTING_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </MetricFieldWrapper>
                </div>
              </div>

              {/* Pelvic & Anorectal Pain Ratings (Without subjective descriptors) */}
              <div style={{ margin: '16px 0 10px', borderTop: '1px solid var(--card-border)', paddingTop: '16px' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '12px' }}>
                  Pelvic & Anorectal Pain Ratings (0–10 NRS)
                </span>

                <MetricFieldWrapper
                  label="Pain Before Defecation"
                  isNA={painBefore === null}
                  onNAToggle={(isNA) => setPainBefore(isNA ? null : 0)}
                  comment={metricComments['painBefore']}
                  onCommentChange={(comment) => setMetricComment('painBefore', comment)}
                >
                  <ClinicalPainSlider
                    hideLabel
                    value={painBefore}
                    onChange={setPainBefore}
                    isNA={painBefore === null}
                  />
                </MetricFieldWrapper>

                <MetricFieldWrapper
                  label="Pain During Defecation"
                  isNA={painDuring === null}
                  onNAToggle={(isNA) => setPainDuring(isNA ? null : 0)}
                  comment={metricComments['painDuring']}
                  onCommentChange={(comment) => setMetricComment('painDuring', comment)}
                >
                  <ClinicalPainSlider
                    hideLabel
                    value={painDuring}
                    onChange={setPainDuring}
                    isNA={painDuring === null}
                  />
                </MetricFieldWrapper>

                <MetricFieldWrapper
                  label="Pain After Defecation"
                  isNA={painAfter === null}
                  onNAToggle={(isNA) => setPainAfter(isNA ? null : 0)}
                  comment={metricComments['painAfter']}
                  onCommentChange={(comment) => setMetricComment('painAfter', comment)}
                >
                  <ClinicalPainSlider
                    hideLabel
                    value={painAfter}
                    onChange={setPainAfter}
                    isNA={painAfter === null}
                  />
                </MetricFieldWrapper>
              </div>

              {/* Custom Metrics Section */}
              <CustomMetricsSection
                metrics={customMetrics}
                onChange={setCustomMetrics}
                categoryLabel="Bowel"
              />

              {/* Clinical Notes */}
              <div className="form-group" style={{ marginTop: '16px' }}>
                <label htmlFor="bowel-notes" className="form-label">Clinical Notes</label>
                <textarea
                  id="bowel-notes"
                  className="form-textarea"
                  placeholder="Record dietary fiber intake, laxatives/supplements used, or rectal sensations..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn-secondary" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={isSubmitting}>
                <Check size={18} /> {initialEntry ? 'Update Entry' : 'Save Entry'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <DateTimeAdjusterModal
        isOpen={showTimeAdjuster}
        currentIso={timestamp}
        onConfirm={setTimestamp}
        onClose={() => setShowTimeAdjuster(false)}
      />
    </>
  );
};

import React, { useState } from 'react';
import { X, Check, Clock } from 'lucide-react';
import type { SexualLogEntry, SexualActivityType, EjaculationType, CustomMetricItem } from '../../types';
import {
  SEXUAL_ACTIVITIES,
  getClimaxOptions,
  getArousalMetricLabel,
  getClimaxMetricLabel
} from '../../data/clinicalScales';
import { formatDateTime } from '../../utils/logFormatters';
import { useLogStore } from '../../store/useLogStore';
import {
  ClinicalPainSlider,
  ClinicalSlider,
  DurationPicker,
  MetricFieldWrapper,
  DateTimeAdjusterModal,
  CustomMetricsSection
} from '../common';

interface SexualEntryFormProps {
  isOpen: boolean;
  initialEntry?: SexualLogEntry | null;
  onSave: (data: Omit<SexualLogEntry, 'id'>) => Promise<void>;
  onClose: () => void;
}

export const SexualEntryForm: React.FC<SexualEntryFormProps> = ({
  isOpen,
  initialEntry,
  onSave,
  onClose
}) => {
  const anatomyProfile = useLogStore((s) => s.anatomyProfile);
  const customAnatomy = useLogStore((s) => s.customAnatomy);

  const arousalLabel = getArousalMetricLabel(anatomyProfile, customAnatomy);
  const climaxLabel = getClimaxMetricLabel(anatomyProfile);
  const climaxOptions = getClimaxOptions(anatomyProfile);
  const [timestamp, setTimestamp] = useState<string>(
    initialEntry?.timestamp ?? new Date().toISOString()
  );
  const [activity, setActivity] = useState<SexualActivityType>(initialEntry?.activity ?? 'M');
  const [position, setPosition] = useState<string>(initialEntry?.position ?? '');
  const [durationMinutes, setDurationMinutes] = useState<number | null>(
    initialEntry ? initialEntry.durationMinutes : 15
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
  const [erectionArousalScore, setErectionArousalScore] = useState<number | null>(
    initialEntry ? initialEntry.erectionArousalScore : 80
  );
  const [pleasureScore, setPleasureScore] = useState<number | null>(
    initialEntry ? initialEntry.pleasureScore : 80
  );
  const [ejaculation, setEjaculation] = useState<EjaculationType>(initialEntry?.ejaculation ?? 'N');
  const [notes, setNotes] = useState<string>(initialEntry?.notes ?? '');
  const [metricComments, setMetricComments] = useState<Record<string, string>>(
    initialEntry?.metricComments ?? {}
  );
  const [customMetrics, setCustomMetrics] = useState<CustomMetricItem[]>(
    initialEntry?.customMetrics ?? []
  );

  const [showTimeAdjuster, setShowTimeAdjuster] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

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
        activity,
        position,
        durationMinutes,
        painBefore,
        painDuring,
        painAfter,
        erectionArousalScore,
        pleasureScore,
        ejaculation,
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
      <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="sex-form-title">
        <div className="modal-content">
          <div className="modal-header">
            <div>
              <h2 id="sex-form-title">
                {initialEntry ? 'Edit Sexual & Pain Entry' : 'Log Sexual & Pain Event'}
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
              {/* Activity & Position */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '14px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label htmlFor="sex-activity" className="form-label">
                    Activity Type
                  </label>
                  <select
                    id="sex-activity"
                    className="form-select"
                    value={activity}
                    onChange={(e) => setActivity(e.target.value as SexualActivityType)}
                  >
                    {SEXUAL_ACTIVITIES.map((act) => (
                      <option key={act.value} value={act.value}>
                        {act.value} - {act.fullTitle}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label htmlFor="sex-position" className="form-label">
                    Position / Posture
                  </label>
                  <input
                    type="text"
                    id="sex-position"
                    className="form-input"
                    placeholder="e.g. Missionary, Side-lying, Standing"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                  />
                </div>
              </div>

              {/* Mobile-Friendly Duration Control */}
              <MetricFieldWrapper
                label="Duration (Minutes)"
                isNA={durationMinutes === null}
                onNAToggle={(isNA) => setDurationMinutes(isNA ? null : 15)}
                comment={metricComments['durationMinutes']}
                onCommentChange={(comment) => setMetricComment('durationMinutes', comment)}
                commentPlaceholder="e.g. Activity paused due to fatigue or pain..."
              >
                <DurationPicker
                  hideLabel
                  value={durationMinutes}
                  onChange={setDurationMinutes}
                  min={0}
                  max={300}
                  isNA={durationMinutes === null}
                />
              </MetricFieldWrapper>

              {/* Pelvic Pain Ratings */}
              <div style={{ margin: '20px 0 10px', borderTop: '1px solid var(--card-border)', paddingTop: '16px' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '12px' }}>
                  Pelvic Pain Ratings (0–10 NRS)
                </span>

                <MetricFieldWrapper
                  label="Pain Before Activity"
                  isNA={painBefore === null}
                  onNAToggle={(isNA) => setPainBefore(isNA ? null : 0)}
                  comment={metricComments['painBefore']}
                  onCommentChange={(comment) => setMetricComment('painBefore', comment)}
                  helperText="Resting pelvic or genital pain prior to activity"
                >
                  <ClinicalPainSlider
                    hideLabel
                    value={painBefore}
                    onChange={setPainBefore}
                    isNA={painBefore === null}
                  />
                </MetricFieldWrapper>

                <MetricFieldWrapper
                  label="Pain During Activity"
                  isNA={painDuring === null}
                  onNAToggle={(isNA) => setPainDuring(isNA ? null : 0)}
                  comment={metricComments['painDuring']}
                  onCommentChange={(comment) => setMetricComment('painDuring', comment)}
                  helperText="Discomfort or pain during sexual activity"
                >
                  <ClinicalPainSlider
                    hideLabel
                    value={painDuring}
                    onChange={setPainDuring}
                    isNA={painDuring === null}
                  />
                </MetricFieldWrapper>

                <MetricFieldWrapper
                  label="Pain After / Post-Orgasm"
                  isNA={painAfter === null}
                  onNAToggle={(isNA) => setPainAfter(isNA ? null : 0)}
                  comment={metricComments['painAfter']}
                  onCommentChange={(comment) => setMetricComment('painAfter', comment)}
                  helperText="Residual pelvic discomfort or spasm following activity"
                >
                  <ClinicalPainSlider
                    hideLabel
                    value={painAfter}
                    onChange={setPainAfter}
                    isNA={painAfter === null}
                  />
                </MetricFieldWrapper>
              </div>

              {/* Function & Satisfaction Metrics */}
              <div style={{ margin: '16px 0 10px', borderTop: '1px solid var(--card-border)', paddingTop: '16px' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '12px' }}>
                  Function & Satisfaction Metrics
                </span>

                <MetricFieldWrapper
                  label={arousalLabel}
                  isNA={erectionArousalScore === null}
                  onNAToggle={(isNA) => setErectionArousalScore(isNA ? null : 80)}
                  comment={metricComments['erectionArousalScore']}
                  onCommentChange={(comment) => setMetricComment('erectionArousalScore', comment)}
                  commentPlaceholder="e.g. Observations regarding response, support, or comfort..."
                >
                  <ClinicalSlider
                    hideLabel
                    value={erectionArousalScore}
                    onChange={setErectionArousalScore}
                    step={1}
                    unit="%"
                    isNA={erectionArousalScore === null}
                  />
                </MetricFieldWrapper>

                <MetricFieldWrapper
                  label="Pleasure & Satisfaction"
                  isNA={pleasureScore === null}
                  onNAToggle={(isNA) => setPleasureScore(isNA ? null : 80)}
                  comment={metricComments['pleasureScore']}
                  onCommentChange={(comment) => setMetricComment('pleasureScore', comment)}
                >
                  <ClinicalSlider
                    hideLabel
                    value={pleasureScore}
                    onChange={setPleasureScore}
                    step={1}
                    unit="%"
                    isNA={pleasureScore === null}
                  />
                </MetricFieldWrapper>

                <MetricFieldWrapper
                  label={climaxLabel}
                  comment={metricComments['ejaculation']}
                  onCommentChange={(comment) => setMetricComment('ejaculation', comment)}
                  commentPlaceholder="e.g. Observations regarding timing, comfort, or sensation..."
                >
                  <select
                    id="sex-ejac"
                    className="form-select"
                    value={ejaculation}
                    onChange={(e) => setEjaculation(e.target.value as EjaculationType)}
                  >
                    {climaxOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label} — {opt.description}
                      </option>
                    ))}
                  </select>
                </MetricFieldWrapper>
              </div>

              {/* Custom Metrics Section */}
              <CustomMetricsSection
                metrics={customMetrics}
                onChange={setCustomMetrics}
                categoryLabel="Sexual"
              />

              {/* Clinical Notes & Symptoms */}
              <div className="form-group" style={{ marginTop: '16px' }}>
                <label htmlFor="sex-notes" className="form-label">
                  Clinical Notes & Symptoms
                </label>
                <textarea
                  id="sex-notes"
                  className="form-textarea"
                  placeholder="Note specific pelvic floor sensations, lubrication used, triggers, or post-activity stretches..."
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

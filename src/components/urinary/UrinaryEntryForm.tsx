import React, { useState } from 'react';
import { X, Check, Clock } from 'lucide-react';
import type {
  UrinaryLogEntry,
  FluidType,
  VoidVolumeDescriptor,
  VoidStreamCharacteristic,
  UrgencyLevel,
  LeakageType,
  LeakageAmount,
  PadStatus,
  CustomMetricItem
} from '../../types';
import {
  FLUID_TYPES,
  URINARY_URGENCY_LEVELS
} from '../../data/clinicalScales';
import { formatDateTime } from '../../utils/logFormatters';
import {
  DualStepSpinner,
  MetricFieldWrapper,
  DateTimeAdjusterModal,
  CustomMetricsSection
} from '../common';
import { UrinaryEventTypeSelector } from './UrinaryEventTypeSelector';
import { UrinaryLeakageFields } from './UrinaryLeakageFields';

interface UrinaryEntryFormProps {
  isOpen: boolean;
  initialEntry?: UrinaryLogEntry | null;
  onSave: (data: Omit<UrinaryLogEntry, 'id'>) => Promise<void>;
  onClose: () => void;
}

export const UrinaryEntryForm: React.FC<UrinaryEntryFormProps> = ({
  isOpen,
  initialEntry,
  onSave,
  onClose
}) => {
  const [timestamp, setTimestamp] = useState<string>(
    initialEntry?.timestamp ?? new Date().toISOString()
  );
  const [activeTab, setActiveTab] = useState<'void' | 'leakage' | 'combined'>(
    initialEntry?.eventType ?? 'void'
  );

  // Void / Fluid fields
  const [fluidIntakeAmountMl, setFluidIntakeAmountMl] = useState<number | null>(
    initialEntry ? initialEntry.fluidIntakeAmountMl : 250
  );
  const [fluidType, setFluidType] = useState<FluidType>(initialEntry?.fluidType ?? 'water');
  const [voidVolumeType, setVoidVolumeType] = useState<VoidVolumeDescriptor>(
    initialEntry?.voidVolumeType ?? 'Medium'
  );
  const [voidVolumeMl, setVoidVolumeMl] = useState<number | null>(
    initialEntry ? initialEntry.voidVolumeMl : 200
  );
  const [voidStream, setVoidStream] = useState<VoidStreamCharacteristic>(
    initialEntry?.voidStream ?? 'normal'
  );
  const [urgencyLevel, setUrgencyLevel] = useState<UrgencyLevel | null>(
    initialEntry ? initialEntry.urgencyLevel : 1
  );

  // Leakage fields
  const [leakageType, setLeakageType] = useState<LeakageType>(
    initialEntry && initialEntry.leakageType !== 'none' ? initialEntry.leakageType : 'stress'
  );
  const [leakageAmount, setLeakageAmount] = useState<LeakageAmount>(
    initialEntry && initialEntry.leakageAmount !== 'none' ? initialEntry.leakageAmount : 'drops'
  );
  const [leakageActivity, setLeakageActivity] = useState<string>(
    initialEntry?.leakageActivity ?? ''
  );
  const [padUsage, setPadUsage] = useState<PadStatus>(initialEntry?.padUsage ?? 'none');

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
      const isVoidOnly = activeTab === 'void';
      const isLeakageOnly = activeTab === 'leakage';

      await onSave({
        timestamp,
        eventType: activeTab,
        fluidIntakeAmountMl: isLeakageOnly ? null : fluidIntakeAmountMl,
        fluidType,
        voidVolumeType: isLeakageOnly ? 'Small' : voidVolumeType,
        voidVolumeMl: isLeakageOnly ? null : (voidVolumeType === 'Measured' ? voidVolumeMl : null),
        voidStream: isLeakageOnly ? 'normal' : voidStream,
        urgencyLevel,
        leakageType: isVoidOnly ? 'none' : leakageType,
        leakageAmount: isVoidOnly ? 'none' : leakageAmount,
        leakageActivity: isVoidOnly ? '' : leakageActivity,
        padUsage: isVoidOnly ? 'none' : padUsage,
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
      <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="urinary-form-title">
        <div className="modal-content">
          <div className="modal-header">
            <div>
              <h2 id="urinary-form-title">
                {initialEntry ? 'Edit Bladder Diary Entry' : 'Log Bladder / Pelvic Diary'}
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
              {/* Segmented Toggle: Urination / Void vs Incontinence / Leakage vs Both */}
              <UrinaryEventTypeSelector value={activeTab} onChange={setActiveTab} />


              {/* 1. URINATION / VOID SECTION */}
              {(activeTab === 'void' || activeTab === 'combined') && (
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px' }}>
                    Urination & Fluid Intake
                  </div>

                  {/* Fluid Intake */}
                  <MetricFieldWrapper
                    label="Fluid Intake (Beverage)"
                    isNA={fluidIntakeAmountMl === null}
                    onNAToggle={(isNA) => setFluidIntakeAmountMl(isNA ? null : 250)}
                    comment={metricComments['fluidIntake']}
                    onCommentChange={(comment) => setMetricComment('fluidIntake', comment)}
                    commentPlaceholder="e.g. 2nd cup of morning coffee, carbonated beverage..."
                  >
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '8px' }}>
                      <select
                        id="fluid-type"
                        className="form-select"
                        value={fluidType}
                        onChange={(e) => setFluidType(e.target.value as FluidType)}
                        aria-label="Fluid Type"
                      >
                        {FLUID_TYPES.map((f) => (
                          <option key={f.value} value={f.value}>{f.label}</option>
                        ))}
                      </select>
                      <DualStepSpinner
                        hideLabel
                        value={fluidIntakeAmountMl}
                        onChange={setFluidIntakeAmountMl}
                        step={50}
                        largeStep={250}
                        min={0}
                        max={2000}
                        unit="mL"
                        isNA={fluidIntakeAmountMl === null}
                      />
                    </div>
                  </MetricFieldWrapper>

                  {/* Void Volume */}
                  <MetricFieldWrapper
                    label="Void Volume Size"
                    comment={metricComments['voidVolume']}
                    onCommentChange={(comment) => setMetricComment('voidVolume', comment)}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <select
                        id="void-vol-type"
                        className="form-select"
                        value={voidVolumeType}
                        onChange={(e) => setVoidVolumeType(e.target.value as VoidVolumeDescriptor)}
                      >
                        <option value="Small">Small void (~100 mL)</option>
                        <option value="Medium">Medium void (~250 mL)</option>
                        <option value="Large">Large void (~400+ mL)</option>
                        <option value="Measured">Measured with graduated hat / beaker</option>
                      </select>
                      {voidVolumeType === 'Measured' && (
                        <DualStepSpinner
                          hideLabel
                          value={voidVolumeMl}
                          onChange={setVoidVolumeMl}
                          step={25}
                          largeStep={100}
                          min={0}
                          max={1500}
                          unit="mL"
                          isNA={voidVolumeMl === null}
                        />
                      )}
                    </div>
                  </MetricFieldWrapper>

                  {/* Stream Sensation */}
                  <MetricFieldWrapper
                    label="Stream Sensation"
                    comment={metricComments['voidStream']}
                    onCommentChange={(comment) => setMetricComment('voidStream', comment)}
                  >
                    <select
                      id="void-stream"
                      className="form-select"
                      value={voidStream}
                      onChange={(e) => setVoidStream(e.target.value as VoidStreamCharacteristic)}
                    >
                      <option value="normal">Normal / steady flow</option>
                      <option value="hesitant">Hesitant (delayed start)</option>
                      <option value="straining">Straining (bearing down)</option>
                      <option value="interrupted">Interrupted / stop & go</option>
                    </select>
                  </MetricFieldWrapper>
                </div>
              )}

              {/* 2. INCONTINENCE / LEAKAGE SECTION */}
              {(activeTab === 'leakage' || activeTab === 'combined') && (
                <UrinaryLeakageFields
                  leakageType={leakageType}
                  onChangeLeakageType={setLeakageType}
                  leakageAmount={leakageAmount}
                  onChangeLeakageAmount={setLeakageAmount}
                  leakageActivity={leakageActivity}
                  onChangeLeakageActivity={setLeakageActivity}
                  padUsage={padUsage}
                  onChangePadUsage={setPadUsage}
                  metricComments={metricComments}
                  onCommentChange={setMetricComment}
                />
              )}


              {/* Shared Urgency Level */}
              <MetricFieldWrapper
                label={activeTab === 'leakage' ? 'Urgency Sensation At Time of Leak' : 'Urgency Sensation'}
                isNA={urgencyLevel === null}
                onNAToggle={(isNA) => setUrgencyLevel(isNA ? null : 1)}
                comment={metricComments['urgencyLevel']}
                onCommentChange={(comment) => setMetricComment('urgencyLevel', comment)}
                commentPlaceholder="e.g. Sudden intense rush upon unlocking front door..."
              >
                <select
                  id="void-urgency"
                  className="form-select"
                  value={urgencyLevel ?? 1}
                  disabled={urgencyLevel === null}
                  onChange={(e) => setUrgencyLevel(Number(e.target.value) as UrgencyLevel)}
                >
                  {URINARY_URGENCY_LEVELS.map((u) => (
                    <option key={u.value} value={u.value}>
                      {u.label} — {u.description}
                    </option>
                  ))}
                </select>
              </MetricFieldWrapper>

              {/* Custom Metrics Section */}
              <CustomMetricsSection
                metrics={customMetrics}
                onChange={setCustomMetrics}
                categoryLabel="Urinary"
              />

              {/* Clinical Notes */}
              <div className="form-group" style={{ marginTop: '16px' }}>
                <label htmlFor="uri-notes" className="form-label">Clinical Notes</label>
                <textarea
                  id="uri-notes"
                  className="form-textarea"
                  placeholder="Record bladder pressure, burning sensations, caffeine sensitivity..."
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

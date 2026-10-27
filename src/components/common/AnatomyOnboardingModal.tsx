import React, { useState } from 'react';
import { ShieldCheck, Check, Sparkles } from 'lucide-react';
import { useLogStore } from '../../store/useLogStore';
import type { AnatomyProfile, CustomAnatomyFeatures } from '../../types';
import { AnatomyProfileSelector } from './AnatomyProfileSelector';

export const AnatomyOnboardingModal: React.FC = () => {
  const showOnboardingModal = useLogStore((s) => s.showOnboardingModal);
  const currentProfile = useLogStore((s) => s.anatomyProfile);
  const currentCustom = useLogStore((s) => s.customAnatomy);
  const volumeUnit = useLogStore((s) => s.volumeUnit);
  const setVolumeUnit = useLogStore((s) => s.setVolumeUnit);
  const patientInitials = useLogStore((s) => s.patientInitials);
  const setPatientInitials = useLogStore((s) => s.setPatientInitials);
  const completeOnboarding = useLogStore((s) => s.completeOnboarding);

  const [selectedProfile, setSelectedProfile] = useState<AnatomyProfile>(currentProfile ?? 'vulvovaginal');
  const [customFeatures, setCustomFeatures] = useState<Partial<CustomAnatomyFeatures>>(currentCustom ?? {});
  const [initials, setInitials] = useState<string>(patientInitials ?? '');
  const [unit, setUnit] = useState<'mL' | 'oz'>(volumeUnit ?? 'mL');

  if (!showOnboardingModal) return null;

  const handleCustomFeatureToggle = (key: keyof CustomAnatomyFeatures, value: boolean) => {
    setCustomFeatures((prev) => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = () => {
    if (initials !== patientInitials) {
      setPatientInitials(initials);
    }
    if (unit !== volumeUnit) {
      setVolumeUnit(unit);
    }
    completeOnboarding(selectedProfile, customFeatures);
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="onboarding-title">
      <div className="modal-content" style={{ maxWidth: '640px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--accent-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-clinical)'
              }}
            >
              <Sparkles size={18} />
            </div>
            <div>
              <h2 id="onboarding-title" style={{ margin: 0, fontSize: '1.25rem' }}>
                Welcome to Pelvic Health Diary
              </h2>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Set up your personalized tracking preferences
              </span>
            </div>
          </div>
        </div>

        <div className="modal-body" style={{ maxHeight: '72vh', overflowY: 'auto' }}>
          {/* Privacy Guarantee Banner */}
          <div
            style={{
              padding: '12px 14px',
              backgroundColor: 'var(--accent-light)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--accent-clinical)',
              display: 'flex',
              gap: '10px',
              alignItems: 'flex-start',
              marginBottom: '16px'
            }}
          >
            <ShieldCheck size={20} style={{ color: 'var(--accent-clinical)', flexShrink: 0, marginTop: '2px' }} />
            <div style={{ fontSize: '0.82rem', color: 'var(--text-primary)', lineHeight: 1.45 }}>
              <strong>100% Offline & Private:</strong> All your symptom records stay strictly on this device in your
              browser's sandboxed storage. No accounts, no cloud servers, and no third-party tracking.
            </div>
          </div>

          {/* Anatomy Preferences Section */}
          <div style={{ marginBottom: '20px' }}>
            <label
              style={{
                display: 'block',
                fontSize: '0.92rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                marginBottom: '4px'
              }}
            >
              Select Your Anatomical Tracking Focus
            </label>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '0 0 12px', lineHeight: 1.4 }}>
              This tailors form metrics (such as natural lubrication vs. erection quality, or splinting techniques)
              to your anatomy. You can adjust this anytime in Settings.
            </p>

            <AnatomyProfileSelector
              selectedProfile={selectedProfile}
              customFeatures={customFeatures}
              onSelectProfile={setSelectedProfile}
              onCustomFeatureChange={handleCustomFeatureToggle}
            />
          </div>

          {/* Optional Profile Setup */}
          <div
            style={{
              paddingTop: '16px',
              borderTop: '1px solid var(--card-border)',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '12px'
            }}
          >
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="onboard-initials" className="form-label">
                Patient Initials / Identifier (Optional)
              </label>
              <input
                id="onboard-initials"
                type="text"
                className="form-input"
                placeholder="e.g. JD"
                maxLength={10}
                value={initials}
                onChange={(e) => setInitials(e.target.value)}
              />
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginTop: '3px' }}>
                Included on printed reports for your physical therapist
              </span>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="onboard-unit" className="form-label">
                Fluid Volume Unit
              </label>
              <select
                id="onboard-unit"
                className="form-select"
                value={unit}
                onChange={(e) => setUnit(e.target.value as 'mL' | 'oz')}
              >
                <option value="mL">Milliliters (mL) — Clinical Standard</option>
                <option value="oz">Fluid Ounces (oz)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => completeOnboarding('neutral')}
          >
            Skip for Now (Neutral Mode)
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={handleSave}
            style={{ minWidth: '150px' }}
          >
            <Check size={18} /> Save & Get Started
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { X, Check, Settings, ShieldCheck } from 'lucide-react';
import { useLogStore } from '../../store/useLogStore';
import type { AnatomyProfile, CustomAnatomyFeatures } from '../../types';
import { AnatomyProfileSelector } from './AnatomyProfileSelector';

export const SettingsModal: React.FC = () => {
  const showSettingsModal = useLogStore((s) => s.showSettingsModal);
  const setShowSettingsModal = useLogStore((s) => s.setShowSettingsModal);
  const currentProfile = useLogStore((s) => s.anatomyProfile);
  const currentCustom = useLogStore((s) => s.customAnatomy);
  const volumeUnit = useLogStore((s) => s.volumeUnit);
  const setVolumeUnit = useLogStore((s) => s.setVolumeUnit);
  const patientInitials = useLogStore((s) => s.patientInitials);
  const setPatientInitials = useLogStore((s) => s.setPatientInitials);
  const setAnatomyProfile = useLogStore((s) => s.setAnatomyProfile);
  const setShowPrivacyModal = useLogStore((s) => s.setShowPrivacyModal);

  const [selectedProfile, setSelectedProfile] = useState<AnatomyProfile>(currentProfile ?? 'neutral');
  const [customFeatures, setCustomFeatures] = useState<Partial<CustomAnatomyFeatures>>(currentCustom ?? {});
  const [initials, setInitials] = useState<string>(patientInitials ?? '');
  const [unit, setUnit] = useState<'mL' | 'oz'>(volumeUnit ?? 'mL');

  if (!showSettingsModal) return null;

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
    setAnatomyProfile(selectedProfile, customFeatures);
    setShowSettingsModal(false);
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="settings-title">
      <div className="modal-content" style={{ maxWidth: '640px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Settings size={20} className="text-accent" />
            <h2 id="settings-title" style={{ margin: 0, fontSize: '1.2rem' }}>
              App & Anatomical Preferences
            </h2>
          </div>
          <button
            type="button"
            className="icon-btn"
            onClick={() => setShowSettingsModal(false)}
            aria-label="Close settings"
            style={{ width: '40px', height: '40px' }}
          >
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ maxHeight: '72vh', overflowY: 'auto' }}>
          {/* Anatomy Preferences */}
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
              Anatomical Tracking Focus
            </label>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '0 0 12px', lineHeight: 1.4 }}>
              Select which terminology and tracking metrics best correspond with your anatomy.
            </p>

            <AnatomyProfileSelector
              selectedProfile={selectedProfile}
              customFeatures={customFeatures}
              onSelectProfile={setSelectedProfile}
              onCustomFeatureChange={handleCustomFeatureToggle}
            />
          </div>

          {/* Clinical Options */}
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
              <label htmlFor="settings-initials" className="form-label">
                Patient Identifier / Initials
              </label>
              <input
                id="settings-initials"
                type="text"
                className="form-input"
                placeholder="e.g. JD"
                maxLength={10}
                value={initials}
                onChange={(e) => setInitials(e.target.value)}
              />
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginTop: '3px' }}>
                Used on exported reports for your therapist
              </span>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="settings-unit" className="form-label">
                Fluid Volume Unit
              </label>
              <select
                id="settings-unit"
                className="form-select"
                value={unit}
                onChange={(e) => setUnit(e.target.value as 'mL' | 'oz')}
              >
                <option value="mL">Milliliters (mL)</option>
                <option value="oz">Fluid Ounces (oz)</option>
              </select>
            </div>
          </div>

          {/* Privacy & Policy Link */}
          <div
            style={{
              marginTop: '16px',
              padding: '12px 14px',
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={18} style={{ color: 'var(--accent-clinical)' }} />
              <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                Offline Local-First Storage (Zero Cloud Sync)
              </span>
            </div>
            <button
              type="button"
              className="btn-secondary"
              style={{ fontSize: '0.78rem', padding: '4px 10px' }}
              onClick={() => {
                setShowSettingsModal(false);
                setShowPrivacyModal(true);
              }}
            >
              Privacy Policy
            </button>
          </div>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => setShowSettingsModal(false)}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={handleSave}
          >
            <Check size={18} /> Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { Heart, Activity, Sliders, Shield } from 'lucide-react';
import type { AnatomyProfile, CustomAnatomyFeatures } from '../../types';

interface AnatomyProfileSelectorProps {
  selectedProfile: AnatomyProfile;
  customFeatures: Partial<CustomAnatomyFeatures>;
  onSelectProfile: (profile: AnatomyProfile) => void;
  onCustomFeatureChange: (key: keyof CustomAnatomyFeatures, value: boolean) => void;
}

interface ProfileOption {
  id: AnatomyProfile;
  title: string;
  badge: string;
  description: string;
  icon: React.ReactNode;
}

const PROFILES: ProfileOption[] = [
  {
    id: 'vulvovaginal',
    title: 'Vulvovaginal Anatomy',
    badge: 'Lubrication & Climax',
    description: 'Tracks natural lubrication, arousal response, orgasm timing/comfort, and vaginal splinting support.',
    icon: <Heart size={20} className="text-accent" />
  },
  {
    id: 'phallic',
    title: 'Phallic & Prostate Anatomy',
    badge: 'Erection & Ejaculation',
    description: 'Tracks erection rigidity, ejaculation timing/comfort, perineal support, and post-void dribble.',
    icon: <Activity size={20} className="text-accent" />
  },
  {
    id: 'custom',
    title: 'Custom / Modular Anatomy',
    badge: 'Tailored Modules',
    description: 'Selectively choose which anatomical features and metrics are shown in your diary.',
    icon: <Sliders size={20} className="text-accent" />
  },
  {
    id: 'neutral',
    title: 'Neutral / Comprehensive',
    badge: 'Inclusive Baseline',
    description: 'Uses broad neutral clinical terminology across all intimacy and pelvic health trackers.',
    icon: <Shield size={20} className="text-accent" />
  }
];

export const AnatomyProfileSelector: React.FC<AnatomyProfileSelectorProps> = ({
  selectedProfile,
  customFeatures,
  onSelectProfile,
  onCustomFeatureChange
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div
        role="radiogroup"
        aria-label="Select Anatomical Profile"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '10px' }}
      >
        {PROFILES.map((p) => {
          const isSelected = selectedProfile === p.id;
          return (
            <div
              key={p.id}
              role="radio"
              aria-checked={isSelected}
              tabIndex={0}
              onClick={() => onSelectProfile(p.id)}
              onKeyDown={(e) => {
                if (e.key === ' ' || e.key === 'Enter') {
                  e.preventDefault();
                  onSelectProfile(p.id);
                }
              }}
              style={{
                border: isSelected ? '2px solid var(--accent-clinical)' : '1px solid var(--card-border)',
                backgroundColor: isSelected ? 'var(--accent-light)' : 'var(--card-surface)',
                borderRadius: 'var(--radius-md)',
                padding: '14px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                position: 'relative'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: 'var(--accent-clinical)' }}>{p.icon}</span>
                  <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                    {p.title}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: isSelected ? 'var(--accent-clinical)' : 'var(--bg-secondary)',
                    color: isSelected ? 'var(--text-inverse)' : 'var(--text-muted)'
                  }}
                >
                  {p.badge}
                </span>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
                {p.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Custom feature toggles if custom profile is active */}
      {selectedProfile === 'custom' && (
        <div
          style={{
            marginTop: '8px',
            padding: '14px',
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--card-border)'
          }}
        >
          <span
            style={{
              fontSize: '0.85rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
              display: 'block',
              marginBottom: '10px'
            }}
          >
            Custom Module Toggles
          </span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={customFeatures.trackLubricationArousal ?? true}
                onChange={(e) => onCustomFeatureChange('trackLubricationArousal', e.target.checked)}
              />
              <span>Arousal & Natural Lubrication</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={customFeatures.trackErection ?? true}
                onChange={(e) => onCustomFeatureChange('trackErection', e.target.checked)}
              />
              <span>Erection Rigidity & Quality</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={customFeatures.trackEjaculation ?? true}
                onChange={(e) => onCustomFeatureChange('trackEjaculation', e.target.checked)}
              />
              <span>Ejaculation / Climax Metrics</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={customFeatures.trackVaginalSplinting ?? true}
                onChange={(e) => onCustomFeatureChange('trackVaginalSplinting', e.target.checked)}
              />
              <span>Vaginal Splinting (Posterior Wall)</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={customFeatures.trackPerinealSplinting ?? true}
                onChange={(e) => onCustomFeatureChange('trackPerinealSplinting', e.target.checked)}
              />
              <span>Perineal Splinting Support</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={customFeatures.trackPostMicturitionDribble ?? true}
                onChange={(e) => onCustomFeatureChange('trackPostMicturitionDribble', e.target.checked)}
              />
              <span>Post-Void / Terminal Dribble</span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
};

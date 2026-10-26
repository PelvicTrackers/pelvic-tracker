import React from 'react';
import { ShieldCheck, Eye, EyeOff, Share2, Activity } from 'lucide-react';
import { useLogStore } from '../../store/useLogStore';

export const TopNav: React.FC = () => {
  const privacyMode = useLogStore((s) => s.privacyMode);
  const togglePrivacyMode = useLogStore((s) => s.togglePrivacyMode);
  const setShowPrivacyModal = useLogStore((s) => s.setShowPrivacyModal);
  const setShowExportModal = useLogStore((s) => s.setShowExportModal);

  return (
    <header className="top-header">
      <div className="brand-section">
        <div className="brand-logo-icon" aria-hidden="true">
          <Activity size={22} />
        </div>
        <div>
          <h1 className="brand-title">Pelvic Health Diary</h1>
          <div className="brand-subtitle">
            <button
              type="button"
              className="privacy-badge"
              onClick={() => setShowPrivacyModal(true)}
              aria-label="View local privacy and HIPAA-by-design policy"
            >
              <ShieldCheck size={12} />
              <span>Local-First (Offline)</span>
            </button>
          </div>
        </div>
      </div>

      <div className="header-actions">
        <button
          type="button"
          className={`icon-btn ${privacyMode ? 'active' : ''}`}
          onClick={togglePrivacyMode}
          title={privacyMode ? 'Disable Discretion Mode (Unblur sensitive scores)' : 'Enable Discretion Mode (Blur sensitive scores on screen)'}
          aria-label={privacyMode ? 'Disable Discretion Mode' : 'Enable Discretion Mode'}
        >
          {privacyMode ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>

        <button
          type="button"
          className="icon-btn"
          onClick={() => setShowExportModal(true)}
          title="Export Clinical Reports (PDF, HTML, Markdown, Backup)"
          aria-label="Open export and clinical report modal"
        >
          <Share2 size={20} />
        </button>
      </div>
    </header>
  );
};

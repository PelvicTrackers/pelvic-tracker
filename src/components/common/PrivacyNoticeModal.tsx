import React from 'react';
import { ShieldCheck, HardDrive, WifiOff, FileSpreadsheet, X } from 'lucide-react';

interface PrivacyNoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyNoticeModal: React.FC<PrivacyNoticeModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="privacy-modal-title">
      <div className="modal-content" style={{ maxWidth: '520px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--accent-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-clinical)'
              }}
            >
              <ShieldCheck size={22} />
            </div>
            <div>
              <h2 id="privacy-modal-title" style={{ fontSize: '1.2rem', marginBottom: '2px' }}>
                HIPAA-by-Design Architecture
              </h2>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Zero-Telemetry Local Privacy Guarantee
              </span>
            </div>
          </div>
          <button
            type="button"
            className="icon-btn"
            onClick={onClose}
            aria-label="Close privacy dialog"
            style={{ width: '40px', height: '40px' }}
          >
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div
            style={{
              padding: '12px 16px',
              backgroundColor: 'var(--accent-light)',
              borderRadius: 'var(--radius-md)',
              borderLeft: '4px solid var(--accent-clinical)',
              color: 'var(--text-primary)',
              fontSize: '0.95rem',
              lineHeight: 1.5,
              fontWeight: 500
            }}
          >
            "Your health data is stored strictly on this device. No data is ever sent to the cloud or third parties."
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '6px' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <HardDrive size={20} color="var(--accent-clinical)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ display: 'block', fontSize: '0.9rem' }}>Local Sandboxed Storage</strong>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  All diary entries, pain scores, and personal reflections live exclusively inside your browser's local IndexedDB database.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <WifiOff size={20} color="var(--accent-clinical)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ display: 'block', fontSize: '0.9rem' }}>No External Sync or Tracking</strong>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Zero analytics SDKs, zero telemetry pings, and zero remote servers. This app functions 100% offline.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <FileSpreadsheet size={20} color="var(--accent-clinical)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ display: 'block', fontSize: '0.9rem' }}>Patient Sovereignty</strong>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Your PHI (Protected Health Information) only leaves this device when you explicitly choose to print a report, export to PDF, copy a Markdown summary for your PT, or backup your JSON database.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn-primary" onClick={onClose} style={{ minWidth: '100px' }}>
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useRef } from 'react';
import {
  Database,
  Download,
  Upload,
  Lock,
  Unlock,
  AlertCircle,
  Eye,
  EyeOff,
  X
} from 'lucide-react';
import { useLogStore } from '../../store/useLogStore';
import {
  exportDatabaseToJson,
  importDatabaseFromJson,
  checkFileIsEncrypted
} from '../../utils/exporters/jsonExporter';
import type {
  SexualLogEntry,
  UrinaryLogEntry,
  BowelLogEntry,
  PatientNote
} from '../../types';

interface JsonBackupPanelProps {
  filteredData?: {
    sexual: SexualLogEntry[];
    urinary: UrinaryLogEntry[];
    bowel: BowelLogEntry[];
    notes: PatientNote[];
  };
  dateRangeLabel?: string;
  isFiltered?: boolean;
}

export const JsonBackupPanel: React.FC<JsonBackupPanelProps> = ({
  filteredData,
  dateRangeLabel,
  isFiltered = false
}) => {
  const initApp = useLogStore((s) => s.initApp);

  const [encryptBackup, setEncryptBackup] = useState(false);
  const [backupPassword, setBackupPassword] = useState('');
  const [showBackupPassword, setShowBackupPassword] = useState(false);

  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  // Modal prompt state for decrypting on restore
  const [pendingEncryptedFile, setPendingEncryptedFile] = useState<File | null>(null);
  const [restorePassword, setRestorePassword] = useState('');
  const [showRestorePassword, setShowRestorePassword] = useState(false);
  const [isDecrypting, setIsDecrypting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportBackup = async () => {
    try {
      setImportError(null);
      if (encryptBackup && !backupPassword.trim()) {
        setImportError('Please enter a password to encrypt your backup.');
        return;
      }

      await exportDatabaseToJson({
        passphrase: encryptBackup ? backupPassword.trim() : undefined,
        customData: isFiltered && filteredData ? { ...filteredData } : undefined,
        dateRangeLabel
      });

      const label = isFiltered ? 'Filtered data downloaded.' : 'JSON backup downloaded.';
      setImportStatus(encryptBackup ? `Encrypted ${label}` : label);
      setTimeout(() => setImportStatus(null), 3000);
    } catch (err: unknown) {
      console.error('[JsonBackupPanel] Export failed', err);
      setImportError('Failed to generate backup file.');
    }
  };

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input so same file can be selected again if needed
    e.target.value = '';

    setImportError(null);
    setImportStatus(null);

    const isEncrypted = await checkFileIsEncrypted(file);

    if (isEncrypted) {
      setPendingEncryptedFile(file);
      setRestorePassword('');
      return;
    }

    // Plaintext backup confirmation
    if (!window.confirm('Restoring will replace current local database records with this file. Proceed?')) {
      return;
    }

    try {
      setImportStatus('Restoring backup...');
      await importDatabaseFromJson(file);
      await initApp();
      setImportStatus('Backup restored successfully!');
      setTimeout(() => setImportStatus(null), 3500);
    } catch (err: unknown) {
      console.error('[JsonBackupPanel] Restore failed', err);
      setImportError('Error restoring backup. Please check file format.');
      setTimeout(() => setImportError(null), 4000);
    }
  };

  const handleConfirmEncryptedRestore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingEncryptedFile) return;

    if (!restorePassword.trim()) {
      setImportError('Passphrase is required to decrypt this backup.');
      return;
    }

    try {
      setIsDecrypting(true);
      setImportError(null);

      await importDatabaseFromJson(pendingEncryptedFile, async () => restorePassword.trim());
      await initApp();

      setPendingEncryptedFile(null);
      setRestorePassword('');
      setImportStatus('Encrypted backup successfully decrypted and restored!');
      setTimeout(() => setImportStatus(null), 3500);
    } catch (err: unknown) {
      console.error('[JsonBackupPanel] Decryption failed', err);
      const message = err instanceof Error ? err.message : 'Incorrect password or corrupted backup file.';
      setImportError(message);
    } finally {
      setIsDecrypting(false);
    }
  };

  return (
    <div
      style={{
        border: '1px solid var(--card-border)',
        borderRadius: 'var(--radius-md)',
        padding: '14px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: '12px',
        backgroundColor: 'var(--card-surface)'
      }}
    >
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6B7280' }}>
          <Database size={20} />
          <strong style={{ fontSize: '0.95rem' }}>Local JSON Backup & Restore</strong>
        </div>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
          {isFiltered
            ? `Exports records for active date range (${dateRangeLabel || 'filtered'}) with optional encryption.`
            : 'Full database backup with optional PBKDF2 & AES-GCM 256-bit client-side encryption.'}
        </p>

        {/* Encryption Toggle */}
        <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid var(--card-border-subtle)' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={encryptBackup}
              onChange={(e) => {
                setEncryptBackup(e.target.checked);
                setImportError(null);
              }}
              style={{ width: '16px', height: '16px', accentColor: 'var(--accent-clinical)' }}
            />
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 600 }}>
              {encryptBackup ? <Lock size={14} color="var(--accent-clinical)" /> : <Unlock size={14} />}
              Encrypt backup with password
            </span>
          </label>

          {encryptBackup && (
            <div style={{ marginTop: '8px' }}>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  type={showBackupPassword ? 'text' : 'password'}
                  id="backup-passphrase"
                  name="backup-passphrase"
                  autoComplete="new-password"
                  placeholder="Enter a strong passphrase"
                  className="form-input"
                  value={backupPassword}
                  onChange={(e) => setBackupPassword(e.target.value)}
                  style={{ minHeight: '38px', paddingRight: '40px', fontSize: '0.88rem' }}
                />
                <button
                  type="button"
                  className="icon-btn"
                  onClick={() => setShowBackupPassword(!showBackupPassword)}
                  aria-label={showBackupPassword ? 'Hide password' : 'Show password'}
                  style={{ position: 'absolute', right: '4px', width: '32px', height: '32px' }}
                >
                  {showBackupPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Uses Web Crypto PBKDF2 (SHA-256, 100k iterations) + AES-GCM. Passwords are never saved or sent anywhere.
              </div>
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '6px' }}>
        <button
          type="button"
          className="btn-secondary"
          onClick={handleExportBackup}
          style={{ flex: 1, padding: '8px 10px' }}
        >
          <Download size={16} /> {isFiltered ? 'Backup Range' : 'Backup'}
        </button>
        <button
          type="button"
          className="btn-secondary"
          onClick={() => fileInputRef.current?.click()}
          style={{ flex: 1, padding: '8px 10px' }}
        >
          <Upload size={16} /> Restore
        </button>
        <input
          type="file"
          ref={fileInputRef}
          accept=".json,application/json"
          style={{ display: 'none' }}
          onChange={handleFileSelected}
        />
      </div>

      {importStatus && (
        <div
          style={{
            padding: '8px 12px',
            backgroundColor: 'var(--accent-light)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--accent-clinical)',
            fontWeight: 600,
            fontSize: '0.82rem'
          }}
        >
          {importStatus}
        </div>
      )}

      {importError && (
        <div
          style={{
            padding: '8px 12px',
            backgroundColor: 'var(--danger-light)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--danger)',
            fontWeight: 600,
            fontSize: '0.82rem',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <AlertCircle size={15} />
          <span>{importError}</span>
        </div>
      )}

      {/* Password Prompt Modal for Encrypted Backups */}
      {pendingEncryptedFile && (
        <div
          className="modal-overlay"
          style={{ zIndex: 120 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="decrypt-dialog-title"
        >
          <div className="modal-content" style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Lock size={18} color="var(--accent-clinical)" />
                <h2 id="decrypt-dialog-title" style={{ fontSize: '1.05rem', margin: 0 }}>
                  Enter Backup Passphrase
                </h2>
              </div>
              <button
                type="button"
                className="icon-btn"
                onClick={() => {
                  setPendingEncryptedFile(null);
                  setRestorePassword('');
                  setImportError(null);
                }}
                aria-label="Cancel restore"
                style={{ width: '36px', height: '36px' }}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleConfirmEncryptedRestore}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
                  This backup file is encrypted. Please enter the passphrase used to create it:
                </p>

                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input
                    type={showRestorePassword ? 'text' : 'password'}
                    id="restore-passphrase"
                    name="restore-passphrase"
                    autoComplete="current-password"
                    className="form-input"
                    placeholder="Enter passphrase"
                    value={restorePassword}
                    onChange={(e) => setRestorePassword(e.target.value)}
                    autoFocus
                    disabled={isDecrypting}
                    style={{ minHeight: '40px', paddingRight: '40px' }}
                  />
                  <button
                    type="button"
                    className="icon-btn"
                    onClick={() => setShowRestorePassword(!showRestorePassword)}
                    aria-label={showRestorePassword ? 'Hide password' : 'Show password'}
                    style={{ position: 'absolute', right: '4px', width: '32px', height: '32px' }}
                  >
                    {showRestorePassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>

                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Decryption occurs strictly in-memory on your device using the browser Web Crypto API.
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    setPendingEncryptedFile(null);
                    setRestorePassword('');
                    setImportError(null);
                  }}
                  disabled={isDecrypting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={isDecrypting || !restorePassword.trim()}
                >
                  {isDecrypting ? 'Decrypting...' : 'Decrypt & Restore'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

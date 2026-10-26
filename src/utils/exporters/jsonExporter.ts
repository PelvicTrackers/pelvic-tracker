import {
  StorageService,
  sanitizeSexualEntry,
  sanitizeUrinaryEntry,
  sanitizeBowelEntry
} from '../../services/storage';
import {
  encryptJsonBackup,
  decryptJsonBackup,
  isEncryptedBackup
} from '../crypto';
import type {
  SexualLogEntry,
  UrinaryLogEntry,
  BowelLogEntry,
  PatientNote,
  AppSettings
} from '../../types';

export interface ExportBackupOptions {
  passphrase?: string;
  customData?: {
    sexual: SexualLogEntry[];
    urinary: UrinaryLogEntry[];
    bowel: BowelLogEntry[];
    notes: PatientNote[];
    settings?: AppSettings;
  };
  dateRangeLabel?: string;
}

export interface RestoredBackupData {
  sexual?: SexualLogEntry[];
  urinary?: UrinaryLogEntry[];
  bowel?: BowelLogEntry[];
  notes?: PatientNote[];
  settings?: AppSettings;
}

/**
 * Exports the full IndexedDB database (or a date-filtered subset) to a downloadable JSON file,
 * optionally encrypted using client-side Web Crypto PBKDF2 & AES-GCM 256.
 */
export async function exportDatabaseToJson(options?: ExportBackupOptions): Promise<void> {
  try {
    const rawData = options?.customData
      ? {
          version: 2,
          exportDate: new Date().toISOString(),
          dateRange: options.dateRangeLabel || 'Filtered Range',
          sexual: options.customData.sexual,
          urinary: options.customData.urinary,
          bowel: options.customData.bowel,
          notes: options.customData.notes,
          settings: options.customData.settings
        }
      : await StorageService.exportFullDatabase();

    let exportPayload: unknown;

    if (options?.passphrase && options.passphrase.trim().length > 0) {
      exportPayload = await encryptJsonBackup(rawData, options.passphrase.trim());
    } else {
      exportPayload = rawData;
    }

    const jsonStr = JSON.stringify(exportPayload, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateStamp = new Date().toISOString().slice(0, 10);
    const prefix = options?.customData ? 'pelvic_data_filtered' : 'pelvic_trackers_backup';
    const encTag = options?.passphrase && options.passphrase.trim().length > 0 ? '_encrypted' : '';
    link.href = url;
    link.download = `${prefix}${encTag}_${dateStamp}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (e) {
    console.error('[StorageService] Failed to export JSON backup', e);
    throw e;
  }
}

/**
 * Inspects a file to check if it's an encrypted backup envelope before prompting.
 */
export async function checkFileIsEncrypted(file: File): Promise<boolean> {
  try {
    const text = await file.text();
    const data = JSON.parse(text);
    return isEncryptedBackup(data);
  } catch {
    return false;
  }
}

/**
 * Parses and sanitizes a JSON backup file (decrypting if necessary).
 */
export async function parseBackupFile(
  file: File,
  getPassphrase?: () => Promise<string | null>
): Promise<RestoredBackupData> {
  const text = await file.text();
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error('Invalid JSON file format. Could not parse file.');
  }

  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Invalid JSON structure: expected root object.');
  }

  if (isEncryptedBackup(parsed)) {
    let passphrase: string | null = null;
    if (getPassphrase) {
      passphrase = await getPassphrase();
    } else {
      passphrase = window.prompt('This backup is encrypted with a password. Please enter your passphrase:');
    }

    if (!passphrase || passphrase.trim().length === 0) {
      throw new Error('Passphrase was not provided. Import cancelled.');
    }

    parsed = await decryptJsonBackup(parsed, passphrase.trim());
    if (!parsed || typeof parsed !== 'object') {
      throw new Error('Decrypted backup content is invalid.');
    }
  }

  const rawData = parsed as {
    sexual?: Partial<SexualLogEntry>[];
    urinary?: Partial<UrinaryLogEntry>[];
    bowel?: Partial<BowelLogEntry>[];
    notes?: PatientNote[];
    settings?: AppSettings;
  };

  return {
    sexual: Array.isArray(rawData.sexual) ? rawData.sexual.map(sanitizeSexualEntry) : [],
    urinary: Array.isArray(rawData.urinary) ? rawData.urinary.map(sanitizeUrinaryEntry) : [],
    bowel: Array.isArray(rawData.bowel) ? rawData.bowel.map(sanitizeBowelEntry) : [],
    notes: Array.isArray(rawData.notes) ? rawData.notes : [],
    settings: rawData.settings
  };
}

/**
 * Restores the IndexedDB database from a JSON file, prompting for password if encrypted,
 * and sanitizing all entries prior to storage.
 */
export async function importDatabaseFromJson(
  file: File,
  getPassphrase?: () => Promise<string | null>
): Promise<void> {
  try {
    const sanitizedData = await parseBackupFile(file, getPassphrase);
    await StorageService.importFullDatabase(sanitizedData);
  } catch (e) {
    console.error('[StorageService] Failed to restore database from JSON file', e);
    throw e;
  }
}

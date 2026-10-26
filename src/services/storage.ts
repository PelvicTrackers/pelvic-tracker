import { openDB, type IDBPDatabase } from 'idb';
import type {
  SexualLogEntry,
  UrinaryLogEntry,
  BowelLogEntry,
  PatientNote,
  AppSettings,
  CustomFormDefinition,
  CustomFormEntry
} from '../types';

const DB_NAME = 'pelvic_trackers_db';
const DB_VERSION = 3;

let dbPromise: Promise<IDBPDatabase> | null = null;

function inferUrinaryEventType(raw: Partial<UrinaryLogEntry> & { leakageActivity?: string }): 'void' | 'leakage' | 'combined' {
  if (raw.eventType === 'void' || raw.eventType === 'leakage' || raw.eventType === 'combined') {
    return raw.eventType;
  }
  const hasLeak = (raw.leakageType && raw.leakageType !== 'none') || (raw.leakageAmount && raw.leakageAmount !== 'none');
  const hasVoid = (typeof raw.voidVolumeMl === 'number' && raw.voidVolumeMl > 0) ||
    (raw.voidVolumeType && raw.voidVolumeType !== 'Small' && raw.voidVolumeType !== 'Medium' && raw.voidVolumeType !== 'Large' && (raw.voidVolumeType as string) !== 'none');
  if (hasLeak && hasVoid) return 'combined';
  if (hasLeak) return 'leakage';
  return 'void';
}

export function sanitizeSexualEntry(raw: Partial<SexualLogEntry>): SexualLogEntry {
  return {
    id: String(raw.id ?? `sex_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`),
    timestamp: typeof raw.timestamp === 'string' ? raw.timestamp : new Date().toISOString(),
    activity: raw.activity ?? 'M',
    position: typeof raw.position === 'string' ? raw.position : '',
    durationMinutes: typeof raw.durationMinutes === 'number' ? raw.durationMinutes : (raw.durationMinutes === null ? null : null),
    painBefore: typeof raw.painBefore === 'number' ? raw.painBefore : (raw.painBefore === null ? null : null),
    painDuring: typeof raw.painDuring === 'number' ? raw.painDuring : (raw.painDuring === null ? null : null),
    painAfter: typeof raw.painAfter === 'number' ? raw.painAfter : (raw.painAfter === null ? null : null),
    erectionArousalScore: typeof raw.erectionArousalScore === 'number' ? raw.erectionArousalScore : (raw.erectionArousalScore === null ? null : null),
    pleasureScore: typeof raw.pleasureScore === 'number' ? raw.pleasureScore : (raw.pleasureScore === null ? null : null),
    ejaculation: raw.ejaculation ?? 'N',
    notes: typeof raw.notes === 'string' ? raw.notes : '',
    metricComments: raw.metricComments && typeof raw.metricComments === 'object' && !Array.isArray(raw.metricComments)
      ? { ...raw.metricComments }
      : {},
    customMetrics: Array.isArray(raw.customMetrics) ? [...raw.customMetrics] : []
  };
}

export function sanitizeUrinaryEntry(raw: Partial<UrinaryLogEntry>): UrinaryLogEntry {
  return {
    id: String(raw.id ?? `uri_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`),
    timestamp: typeof raw.timestamp === 'string' ? raw.timestamp : new Date().toISOString(),
    eventType: inferUrinaryEventType(raw),
    fluidIntakeAmountMl: typeof raw.fluidIntakeAmountMl === 'number' ? raw.fluidIntakeAmountMl : (raw.fluidIntakeAmountMl === null ? null : null),
    fluidType: raw.fluidType ?? 'water',
    voidVolumeType: raw.voidVolumeType ?? 'Medium',
    voidVolumeMl: typeof raw.voidVolumeMl === 'number' ? raw.voidVolumeMl : (raw.voidVolumeMl === null ? null : null),
    voidStream: raw.voidStream ?? 'normal',
    urgencyLevel: typeof raw.urgencyLevel === 'number' ? raw.urgencyLevel : (raw.urgencyLevel === null ? null : null),
    leakageType: raw.leakageType ?? 'none',
    leakageAmount: raw.leakageAmount ?? 'none',
    leakageActivity: typeof raw.leakageActivity === 'string' ? raw.leakageActivity : '',
    padUsage: raw.padUsage ?? 'none',
    notes: typeof raw.notes === 'string' ? raw.notes : '',
    metricComments: raw.metricComments && typeof raw.metricComments === 'object' && !Array.isArray(raw.metricComments)
      ? { ...raw.metricComments }
      : {},
    customMetrics: Array.isArray(raw.customMetrics) ? [...raw.customMetrics] : []
  };
}

export function sanitizeBowelEntry(raw: Partial<BowelLogEntry>): BowelLogEntry {
  return {
    id: String(raw.id ?? `bwl_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`),
    timestamp: typeof raw.timestamp === 'string' ? raw.timestamp : new Date().toISOString(),
    bristolType: typeof raw.bristolType === 'number' ? raw.bristolType : (raw.bristolType === null ? null : 4),
    strainingLevel: typeof raw.strainingLevel === 'number' ? raw.strainingLevel : (raw.strainingLevel === null ? null : null),
    evacuationCompleteness: raw.evacuationCompleteness !== undefined ? raw.evacuationCompleteness : (raw.evacuationCompleteness === null ? null : 'complete'),
    urgencyLevel: typeof raw.urgencyLevel === 'number' ? raw.urgencyLevel : (raw.urgencyLevel === null ? null : null),
    accidentalLeakage: raw.accidentalLeakage !== undefined ? raw.accidentalLeakage : (raw.accidentalLeakage === null ? null : 'none'),
    painBefore: typeof raw.painBefore === 'number' ? raw.painBefore : (raw.painBefore === null ? null : null),
    painDuring: typeof raw.painDuring === 'number' ? raw.painDuring : (raw.painDuring === null ? null : null),
    painAfter: typeof raw.painAfter === 'number' ? raw.painAfter : (raw.painAfter === null ? null : null),
    posturalSplinting: raw.posturalSplinting ?? 'none',
    notes: typeof raw.notes === 'string' ? raw.notes : '',
    metricComments: raw.metricComments && typeof raw.metricComments === 'object' && !Array.isArray(raw.metricComments)
      ? { ...raw.metricComments }
      : {},
    customMetrics: Array.isArray(raw.customMetrics) ? [...raw.customMetrics] : []
  };
}

function getDb(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('sexual_entries')) {
          const store = db.createObjectStore('sexual_entries', { keyPath: 'id' });
          store.createIndex('by_timestamp', 'timestamp');
        }
        if (!db.objectStoreNames.contains('urinary_entries')) {
          const store = db.createObjectStore('urinary_entries', { keyPath: 'id' });
          store.createIndex('by_timestamp', 'timestamp');
        }
        if (!db.objectStoreNames.contains('bowel_entries')) {
          const store = db.createObjectStore('bowel_entries', { keyPath: 'id' });
          store.createIndex('by_timestamp', 'timestamp');
        }
        if (!db.objectStoreNames.contains('patient_notes')) {
          const store = db.createObjectStore('patient_notes', { keyPath: 'id' });
          store.createIndex('by_timestamp', 'timestamp');
        }
        if (!db.objectStoreNames.contains('app_settings')) {
          db.createObjectStore('app_settings', { keyPath: 'key' });
        }
        if (!db.objectStoreNames.contains('custom_forms')) {
          const store = db.createObjectStore('custom_forms', { keyPath: 'id' });
          store.createIndex('by_category', 'category');
        }
        if (!db.objectStoreNames.contains('custom_form_entries')) {
          const store = db.createObjectStore('custom_form_entries', { keyPath: 'id' });
          store.createIndex('by_formId', 'formId');
          store.createIndex('by_timestamp', 'timestamp');
        }
      }
    });
  }
  return dbPromise;
}

export const StorageService = {
  // --- Sexual Entries ---
  async getAllSexualEntries(): Promise<SexualLogEntry[]> {
    try {
      const db = await getDb();
      const rawEntries = (await db.getAll('sexual_entries')) as Partial<SexualLogEntry>[];
      return rawEntries.map(sanitizeSexualEntry);
    } catch (e) {
      console.error('[StorageService] Failed to load sexual entries', e);
      return [];
    }
  },

  async saveSexualEntry(entry: SexualLogEntry): Promise<void> {
    try {
      const db = await getDb();
      const sanitized = sanitizeSexualEntry(entry);
      await db.put('sexual_entries', sanitized);
    } catch (e) {
      console.error('[StorageService] Failed to save sexual entry', e);
      throw e;
    }
  },

  async deleteSexualEntry(id: string): Promise<void> {
    try {
      const db = await getDb();
      await db.delete('sexual_entries', id);
    } catch (e) {
      console.error('[StorageService] Failed to delete sexual entry', e);
      throw e;
    }
  },

  // --- Urinary Entries ---
  async getAllUrinaryEntries(): Promise<UrinaryLogEntry[]> {
    try {
      const db = await getDb();
      const rawEntries = (await db.getAll('urinary_entries')) as Partial<UrinaryLogEntry>[];
      return rawEntries.map(sanitizeUrinaryEntry);
    } catch (e) {
      console.error('[StorageService] Failed to load urinary entries', e);
      return [];
    }
  },

  async saveUrinaryEntry(entry: UrinaryLogEntry): Promise<void> {
    try {
      const db = await getDb();
      const sanitized = sanitizeUrinaryEntry(entry);
      await db.put('urinary_entries', sanitized);
    } catch (e) {
      console.error('[StorageService] Failed to save urinary entry', e);
      throw e;
    }
  },

  async deleteUrinaryEntry(id: string): Promise<void> {
    try {
      const db = await getDb();
      await db.delete('urinary_entries', id);
    } catch (e) {
      console.error('[StorageService] Failed to delete urinary entry', e);
      throw e;
    }
  },

  // --- Bowel Entries ---
  async getAllBowelEntries(): Promise<BowelLogEntry[]> {
    try {
      const db = await getDb();
      const rawEntries = (await db.getAll('bowel_entries')) as Partial<BowelLogEntry>[];
      return rawEntries.map(sanitizeBowelEntry);
    } catch (e) {
      console.error('[StorageService] Failed to load bowel entries', e);
      return [];
    }
  },

  async saveBowelEntry(entry: BowelLogEntry): Promise<void> {
    try {
      const db = await getDb();
      const sanitized = sanitizeBowelEntry(entry);
      await db.put('bowel_entries', sanitized);
    } catch (e) {
      console.error('[StorageService] Failed to save bowel entry', e);
      throw e;
    }
  },

  async deleteBowelEntry(id: string): Promise<void> {
    try {
      const db = await getDb();
      await db.delete('bowel_entries', id);
    } catch (e) {
      console.error('[StorageService] Failed to delete bowel entry', e);
      throw e;
    }
  },

  // --- Patient Notes ---
  async getAllNotes(): Promise<PatientNote[]> {
    try {
      const db = await getDb();
      return (await db.getAll('patient_notes')) as PatientNote[];
    } catch (e) {
      console.error('[StorageService] Failed to load notes', e);
      return [];
    }
  },

  async saveNote(note: PatientNote): Promise<void> {
    try {
      const db = await getDb();
      await db.put('patient_notes', note);
    } catch (e) {
      console.error('[StorageService] Failed to save note', e);
      throw e;
    }
  },

  async deleteNote(id: string): Promise<void> {
    try {
      const db = await getDb();
      await db.delete('patient_notes', id);
    } catch (e) {
      console.error('[StorageService] Failed to delete note', e);
      throw e;
    }
  },

  // --- App Settings ---
  async getSettings(): Promise<AppSettings> {
    const defaultSettings: AppSettings = {
      privacyMode: false,
      volumeUnit: 'mL',
      patientInitials: ''
    };
    try {
      const db = await getDb();
      const val = await db.get('app_settings', 'main');
      if (val && typeof val === 'object' && 'settings' in val) {
        return {
          privacyMode: Boolean((val as { settings: AppSettings }).settings.privacyMode),
          volumeUnit: (val as { settings: AppSettings }).settings.volumeUnit ?? 'mL',
          patientInitials: (val as { settings: AppSettings }).settings.patientInitials ?? ''
        };
      }
      return defaultSettings;
    } catch (e) {
      console.error('[StorageService] Failed to load settings', e);
      return defaultSettings;
    }
  },

  async saveSettings(settings: AppSettings): Promise<void> {
    try {
      const db = await getDb();
      await db.put('app_settings', { key: 'main', settings });
    } catch (e) {
      console.error('[StorageService] Failed to save settings', e);
    }
  },

  // --- Custom Forms & Templates ---
  async getAllCustomForms(): Promise<CustomFormDefinition[]> {
    try {
      const db = await getDb();
      return (await db.getAll('custom_forms')) as CustomFormDefinition[];
    } catch (e) {
      console.error('[StorageService] Failed to load custom forms', e);
      return [];
    }
  },

  async saveCustomForm(form: CustomFormDefinition): Promise<void> {
    try {
      const db = await getDb();
      await db.put('custom_forms', form);
    } catch (e) {
      console.error('[StorageService] Failed to save custom form', e);
      throw e;
    }
  },

  async deleteCustomForm(id: string): Promise<void> {
    try {
      const db = await getDb();
      await db.delete('custom_forms', id);
      // Clean up orphaned entries
      await this.deleteCustomFormEntriesByForm(id);
    } catch (e) {
      console.error('[StorageService] Failed to delete custom form', e);
      throw e;
    }
  },

  // --- Custom Form Entries ---
  async getAllCustomFormEntries(): Promise<CustomFormEntry[]> {
    try {
      const db = await getDb();
      return (await db.getAll('custom_form_entries')) as CustomFormEntry[];
    } catch (e) {
      console.error('[StorageService] Failed to load custom entries', e);
      return [];
    }
  },

  async getCustomFormEntriesByForm(formId: string): Promise<CustomFormEntry[]> {
    try {
      const db = await getDb();
      const index = db.transaction('custom_form_entries').store.index('by_formId');
      return (await index.getAll(formId)) as CustomFormEntry[];
    } catch (e) {
      console.error('[StorageService] Failed to load entries for form', e);
      return [];
    }
  },

  async saveCustomFormEntry(entry: CustomFormEntry): Promise<void> {
    try {
      const db = await getDb();
      await db.put('custom_form_entries', entry);
    } catch (e) {
      console.error('[StorageService] Failed to save custom form entry', e);
      throw e;
    }
  },

  async deleteCustomFormEntry(id: string): Promise<void> {
    try {
      const db = await getDb();
      await db.delete('custom_form_entries', id);
    } catch (e) {
      console.error('[StorageService] Failed to delete custom form entry', e);
      throw e;
    }
  },

  async deleteCustomFormEntriesByForm(formId: string): Promise<void> {
    try {
      const db = await getDb();
      const tx = db.transaction('custom_form_entries', 'readwrite');
      const index = tx.store.index('by_formId');
      let cursor = await index.openCursor(formId);
      while (cursor) {
        await cursor.delete();
        cursor = await cursor.continue();
      }
      await tx.done;
    } catch (e) {
      console.error('[StorageService] Failed to delete entries for form', e);
    }
  },

  // --- Bulk Import / Export (Patient Data Sovereignty) ---
  async exportFullDatabase(): Promise<{
    version: number;
    exportDate: string;
    sexual: SexualLogEntry[];
    urinary: UrinaryLogEntry[];
    bowel: BowelLogEntry[];
    notes: PatientNote[];
    settings: AppSettings;
    customForms: CustomFormDefinition[];
    customEntries: CustomFormEntry[];
  }> {
    const sexual = await this.getAllSexualEntries();
    const urinary = await this.getAllUrinaryEntries();
    const bowel = await this.getAllBowelEntries();
    const notes = await this.getAllNotes();
    const settings = await this.getSettings();
    const customForms = await this.getAllCustomForms();
    const customEntries = await this.getAllCustomFormEntries();

    return {
      version: DB_VERSION,
      exportDate: new Date().toISOString(),
      sexual,
      urinary,
      bowel,
      notes,
      settings,
      customForms,
      customEntries
    };
  },

  async importFullDatabase(data: {
    sexual?: Partial<SexualLogEntry>[];
    urinary?: Partial<UrinaryLogEntry>[];
    bowel?: Partial<BowelLogEntry>[];
    notes?: PatientNote[];
    settings?: AppSettings;
    customForms?: CustomFormDefinition[];
    customEntries?: CustomFormEntry[];
  }): Promise<void> {
    try {
      const db = await getDb();
      const tx = db.transaction(
        [
          'sexual_entries',
          'urinary_entries',
          'bowel_entries',
          'patient_notes',
          'app_settings',
          'custom_forms',
          'custom_form_entries'
        ],
        'readwrite'
      );

      if (data.sexual && Array.isArray(data.sexual)) {
        await tx.objectStore('sexual_entries').clear();
        for (const item of data.sexual) {
          await tx.objectStore('sexual_entries').put(sanitizeSexualEntry(item));
        }
      }
      if (data.urinary && Array.isArray(data.urinary)) {
        await tx.objectStore('urinary_entries').clear();
        for (const item of data.urinary) {
          await tx.objectStore('urinary_entries').put(sanitizeUrinaryEntry(item));
        }
      }
      if (data.bowel && Array.isArray(data.bowel)) {
        await tx.objectStore('bowel_entries').clear();
        for (const item of data.bowel) {
          await tx.objectStore('bowel_entries').put(sanitizeBowelEntry(item));
        }
      }
      if (data.notes && Array.isArray(data.notes)) {
        await tx.objectStore('patient_notes').clear();
        for (const item of data.notes) {
          await tx.objectStore('patient_notes').put(item);
        }
      }
      if (data.settings) {
        await tx.objectStore('app_settings').put({ key: 'main', settings: data.settings });
      }
      if (data.customForms && Array.isArray(data.customForms)) {
        await tx.objectStore('custom_forms').clear();
        for (const item of data.customForms) {
          await tx.objectStore('custom_forms').put(item);
        }
      }
      if (data.customEntries && Array.isArray(data.customEntries)) {
        await tx.objectStore('custom_form_entries').clear();
        for (const item of data.customEntries) {
          await tx.objectStore('custom_form_entries').put(item);
        }
      }

      await tx.done;
    } catch (e) {
      console.error('[StorageService] Failed to import database backup', e);
      throw e;
    }
  }
};

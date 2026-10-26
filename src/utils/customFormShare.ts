import type { CustomFormDefinition, SharedFormEnvelope } from '../types/customForm';

const SHARE_CODE_PREFIX = 'PTF1_';

/**
 * Encodes a CustomFormDefinition into a zero-cloud share code string.
 * Uses UTF-8 safe Base64 encoding with a clean prefix.
 */
export function encodeFormToShareCode(form: CustomFormDefinition): string {
  const envelope: SharedFormEnvelope = {
    format: 'pelvic-tracker-form',
    version: 1,
    form,
    exportedAt: new Date().toISOString()
  };

  const jsonStr = JSON.stringify(envelope);
  // Safe UTF-8 Base64 encoding without external dependencies
  const utf8Bytes = new TextEncoder().encode(jsonStr);
  let binaryStr = '';
  for (let i = 0; i < utf8Bytes.length; i++) {
    binaryStr += String.fromCharCode(utf8Bytes[i]);
  }
  const base64 = btoa(binaryStr);
  return `${SHARE_CODE_PREFIX}${base64}`;
}

/**
 * Validates and parses a share code, raw JSON string, or envelope into a CustomFormDefinition.
 * Returns null if invalid.
 */
export function decodeFormFromShareCode(input: string): CustomFormDefinition | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  try {
    let jsonStr = '';

    // If starts with our share code prefix
    if (trimmed.startsWith(SHARE_CODE_PREFIX)) {
      const base64 = trimmed.slice(SHARE_CODE_PREFIX.length);
      const binaryStr = atob(base64);
      const bytes = new Uint8Array(binaryStr.length);
      for (let i = 0; i < binaryStr.length; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
      }
      jsonStr = new TextDecoder().decode(bytes);
    } else if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      // Direct JSON pasted
      jsonStr = trimmed;
    } else {
      // Try raw Base64 without prefix
      try {
        const binaryStr = atob(trimmed);
        const bytes = new Uint8Array(binaryStr.length);
        for (let i = 0; i < binaryStr.length; i++) {
          bytes[i] = binaryStr.charCodeAt(i);
        }
        jsonStr = new TextDecoder().decode(bytes);
      } catch {
        return null;
      }
    }

    const parsed = JSON.parse(jsonStr);

    // Check envelope or direct form definition
    let candidate: any = parsed;
    if (parsed && typeof parsed === 'object' && parsed.format === 'pelvic-tracker-form' && parsed.form) {
      candidate = parsed.form;
    }

    if (!validateCustomFormDefinition(candidate)) {
      return null;
    }

    return candidate as CustomFormDefinition;
  } catch (err) {
    console.error('[customFormShare] Failed to decode form', err);
    return null;
  }
}

/**
 * Validates that an object conforms to CustomFormDefinition schema.
 */
export function validateCustomFormDefinition(obj: any): boolean {
  if (!obj || typeof obj !== 'object') return false;
  if (typeof obj.title !== 'string' || !obj.title.trim()) return false;
  if (typeof obj.description !== 'string') return false;
  if (!Array.isArray(obj.fields) || obj.fields.length === 0) return false;

  for (const field of obj.fields) {
    if (!field || typeof field !== 'object') return false;
    if (typeof field.id !== 'string' || !field.id.trim()) return false;
    if (typeof field.label !== 'string' || !field.label.trim()) return false;
    if (!['slider-10', 'slider-100', 'number', 'select', 'text', 'boolean'].includes(field.type)) {
      return false;
    }
  }

  return true;
}

/**
 * Triggers a download of the form definition as a .ptform.json file.
 */
export function downloadFormAsJson(form: CustomFormDefinition): void {
  const envelope: SharedFormEnvelope = {
    format: 'pelvic-tracker-form',
    version: 1,
    form,
    exportedAt: new Date().toISOString()
  };

  const jsonStr = JSON.stringify(envelope, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const sanitizedTitle = form.title.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 30);
  const filename = `${sanitizedTitle}.ptform.json`;

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

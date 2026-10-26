/**
 * Client-Side Web Crypto PBKDF2 + AES-GCM 256-bit Encryption
 * Strictly local-first, zero telemetry, zero external dependencies.
 */

export interface EncryptedBackupEnvelope {
  version: number;
  isEncrypted: true;
  kdf: 'PBKDF2';
  iterations: number;
  salt: string; // Base64
  iv: string;   // Base64
  ciphertext: string; // Base64
}

function bufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToBuffer(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export function isEncryptedBackup(obj: unknown): obj is EncryptedBackupEnvelope {
  if (!obj || typeof obj !== 'object') return false;
  const candidate = obj as Record<string, unknown>;
  return candidate.isEncrypted === true &&
    candidate.kdf === 'PBKDF2' &&
    typeof candidate.salt === 'string' &&
    typeof candidate.iv === 'string' &&
    typeof candidate.ciphertext === 'string';
}

/**
 * Derives an AES-GCM 256-bit CryptoKey using PBKDF2 with SHA-256 and given salt/iterations.
 */
async function deriveAesKey(passphrase: string, salt: Uint8Array, iterations: number): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const passwordKey = await crypto.subtle.importKey(
    'raw',
    enc.encode(passphrase),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as BufferSource,
      iterations,
      hash: 'SHA-256'
    },
    passwordKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypts arbitrary serializable data using PBKDF2 and AES-GCM 256.
 */
export async function encryptJsonBackup(data: unknown, passphrase: string): Promise<EncryptedBackupEnvelope> {
  if (!passphrase || passphrase.trim().length === 0) {
    throw new Error('A non-empty passphrase is required for encrypted export.');
  }

  const iterations = 100000;
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const aesKey = await deriveAesKey(passphrase, salt, iterations);

  const enc = new TextEncoder();
  const plaintextBytes = enc.encode(JSON.stringify(data));

  const encryptedBuffer = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv as BufferSource
    },
    aesKey,
    plaintextBytes
  );

  return {
    version: 2,
    isEncrypted: true,
    kdf: 'PBKDF2',
    iterations,
    salt: bufferToBase64(salt),
    iv: bufferToBase64(iv),
    ciphertext: bufferToBase64(encryptedBuffer)
  };
}

/**
 * Decrypts an EncryptedBackupEnvelope using PBKDF2 and AES-GCM 256.
 */
export async function decryptJsonBackup<T = unknown>(envelope: EncryptedBackupEnvelope, passphrase: string): Promise<T> {
  if (!passphrase) {
    throw new Error('Passphrase is required to decrypt backup.');
  }

  const salt = base64ToBuffer(envelope.salt);
  const iv = base64ToBuffer(envelope.iv);
  const ciphertext = base64ToBuffer(envelope.ciphertext);
  const iterations = envelope.iterations || 100000;

  const aesKey = await deriveAesKey(passphrase, salt, iterations);

  try {
    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv as BufferSource
      },
      aesKey,
      ciphertext as BufferSource
    );

    const dec = new TextDecoder('utf-8');
    const jsonStr = dec.decode(decryptedBuffer);
    return JSON.parse(jsonStr) as T;
  } catch (err) {
    console.error('[CryptoService] Decryption failed', err);
    throw new Error('Incorrect passphrase or corrupted backup file.');
  }
}

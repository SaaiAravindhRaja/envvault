/**
 * Client-side encryption utilities
 * Zero-knowledge: all encryption happens here, never on the server
 */

// AES-256-GCM encryption
const ALGORITHM = "AES-GCM";
const KEY_LENGTH = 256;
const NONCE_LENGTH = 12;
const PBKDF2_ITERATIONS = 100000;

export interface EncryptedData {
  ciphertext: string;
  nonce: string;
}

export interface EncryptedSecret {
  keyHash: string;
  keyEncrypted: string;
  valueEncrypted: string;
  nonce: string;
}

/**
 * Derive an encryption key from master password
 */
export async function deriveKey(
  password: string,
  salt: Uint8Array
): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: ALGORITHM, length: KEY_LENGTH },
    false,
    ["encrypt", "decrypt"]
  );
}

/**
 * Generate a random salt
 */
export function generateSalt(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(16));
}

/**
 * Generate a random nonce for AES-GCM
 */
export function generateNonce(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(NONCE_LENGTH));
}

/**
 * Encrypt a string with AES-256-GCM
 */
export async function encrypt(
  key: CryptoKey,
  plaintext: string
): Promise<EncryptedData> {
  const encoder = new TextEncoder();
  const nonce = generateNonce();

  const ciphertext = await crypto.subtle.encrypt(
    { name: ALGORITHM, iv: nonce },
    key,
    encoder.encode(plaintext)
  );

  return {
    ciphertext: bufferToBase64(new Uint8Array(ciphertext)),
    nonce: bufferToBase64(nonce),
  };
}

/**
 * Decrypt a string with AES-256-GCM
 */
export async function decrypt(
  key: CryptoKey,
  ciphertext: string,
  nonce: string
): Promise<string> {
  const decoder = new TextDecoder();

  const decrypted = await crypto.subtle.decrypt(
    { name: ALGORITHM, iv: base64ToBuffer(nonce) },
    key,
    base64ToBuffer(ciphertext)
  );

  return decoder.decode(decrypted);
}

/**
 * Hash a string with SHA-256
 */
export async function sha256(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoder.encode(data));
  return bufferToHex(new Uint8Array(hashBuffer));
}

/**
 * Encrypt a secret (key + value) for storage
 */
export async function encryptSecret(
  encryptionKey: CryptoKey,
  secretKey: string,
  secretValue: string
): Promise<EncryptedSecret> {
  const nonce = generateNonce();
  const nonceBase64 = bufferToBase64(nonce);

  // Hash the key for server-side indexing
  const keyHash = await sha256(secretKey);

  // Encrypt both key and value
  const encoder = new TextEncoder();

  const keyEncrypted = await crypto.subtle.encrypt(
    { name: ALGORITHM, iv: nonce },
    encryptionKey,
    encoder.encode(secretKey)
  );

  const valueEncrypted = await crypto.subtle.encrypt(
    { name: ALGORITHM, iv: nonce },
    encryptionKey,
    encoder.encode(secretValue)
  );

  return {
    keyHash,
    keyEncrypted: bufferToBase64(new Uint8Array(keyEncrypted)),
    valueEncrypted: bufferToBase64(new Uint8Array(valueEncrypted)),
    nonce: nonceBase64,
  };
}

/**
 * Decrypt a secret from storage
 */
export async function decryptSecret(
  encryptionKey: CryptoKey,
  encrypted: EncryptedSecret
): Promise<{ key: string; value: string }> {
  const decoder = new TextDecoder();
  const nonce = base64ToBuffer(encrypted.nonce);

  const keyDecrypted = await crypto.subtle.decrypt(
    { name: ALGORITHM, iv: nonce },
    encryptionKey,
    base64ToBuffer(encrypted.keyEncrypted)
  );

  const valueDecrypted = await crypto.subtle.decrypt(
    { name: ALGORITHM, iv: nonce },
    encryptionKey,
    base64ToBuffer(encrypted.valueEncrypted)
  );

  return {
    key: decoder.decode(keyDecrypted),
    value: decoder.decode(valueDecrypted),
  };
}

// Utility functions
function bufferToBase64(buffer: Uint8Array): string {
  return btoa(String.fromCharCode(...buffer));
}

function base64ToBuffer(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function bufferToHex(buffer: Uint8Array): string {
  return Array.from(buffer)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Store the encryption key in memory (session only)
 * In production, consider more secure storage options
 */
let cachedKey: CryptoKey | null = null;
let cachedSalt: Uint8Array | null = null;

export function setEncryptionKey(key: CryptoKey, salt: Uint8Array): void {
  cachedKey = key;
  cachedSalt = salt;
  // Store salt in localStorage for re-deriving key
  localStorage.setItem("envvault_salt", bufferToBase64(salt));
}

export function getEncryptionKey(): CryptoKey | null {
  return cachedKey;
}

export function getSalt(): Uint8Array | null {
  if (cachedSalt) return cachedSalt;
  const stored = localStorage.getItem("envvault_salt");
  if (stored) {
    cachedSalt = base64ToBuffer(stored);
    return cachedSalt;
  }
  return null;
}

export function clearEncryptionKey(): void {
  cachedKey = null;
  cachedSalt = null;
  localStorage.removeItem("envvault_salt");
}

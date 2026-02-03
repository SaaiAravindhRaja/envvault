/**
 * Key Derivation Functions
 *
 * Derives an AES-256 encryption key from the user's master password.
 * Uses PBKDF2 for browser compatibility (Argon2 not available in WebCrypto).
 */

const DEFAULT_ITERATIONS = 100000;
const SALT_LENGTH = 16;
const KEY_LENGTH = 256;

/**
 * Generate a cryptographically secure random salt
 */
export function generateSalt(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
}

/**
 * Derive an AES-256 encryption key from a master password
 *
 * @param password - User's master password
 * @param salt - Random salt (should be stored alongside encrypted data)
 * @param iterations - PBKDF2 iterations (higher = more secure but slower)
 */
export async function deriveKey(
  password: string,
  salt: Uint8Array,
  iterations: number = DEFAULT_ITERATIONS
): Promise<CryptoKey> {
  // Import password as key material
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  // Derive AES-256-GCM key
  const key = await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations,
      hash: "SHA-256",
    },
    keyMaterial,
    {
      name: "AES-GCM",
      length: KEY_LENGTH,
    },
    false, // Not extractable - more secure
    ["encrypt", "decrypt"]
  );

  return key;
}

/**
 * Convert salt to base64 for storage
 */
export function saltToBase64(salt: Uint8Array): string {
  return btoa(String.fromCharCode(...salt));
}

/**
 * Convert base64 back to salt
 */
export function base64ToSalt(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

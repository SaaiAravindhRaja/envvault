/**
 * AES-256-GCM Encryption/Decryption
 *
 * Provides authenticated encryption with associated data (AEAD).
 * The nonce is randomly generated for each encryption operation.
 */

const NONCE_LENGTH = 12; // 96 bits as recommended for AES-GCM

/**
 * Generate a cryptographically secure random nonce
 */
export function generateNonce(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(NONCE_LENGTH));
}

/**
 * Encrypt plaintext using AES-256-GCM
 *
 * @param key - AES-256 encryption key
 * @param plaintext - Data to encrypt
 * @param nonce - Random nonce (must be unique per encryption)
 * @returns Ciphertext as Uint8Array
 */
export async function encrypt(
  key: CryptoKey,
  plaintext: string,
  nonce: Uint8Array
): Promise<Uint8Array> {
  const encoded = new TextEncoder().encode(plaintext);

  const ciphertext = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: nonce,
    },
    key,
    encoded
  );

  return new Uint8Array(ciphertext);
}

/**
 * Decrypt ciphertext using AES-256-GCM
 *
 * @param key - AES-256 encryption key
 * @param ciphertext - Data to decrypt
 * @param nonce - Nonce used during encryption
 * @returns Decrypted plaintext string
 */
export async function decrypt(
  key: CryptoKey,
  ciphertext: Uint8Array,
  nonce: Uint8Array
): Promise<string> {
  const decrypted = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: nonce,
    },
    key,
    ciphertext
  );

  return new TextDecoder().decode(decrypted);
}

/**
 * Convert Uint8Array to base64 string
 */
export function toBase64(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes));
}

/**
 * Convert base64 string to Uint8Array
 */
export function fromBase64(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

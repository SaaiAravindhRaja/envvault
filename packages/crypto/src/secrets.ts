/**
 * High-level secret encryption/decryption
 *
 * This module provides easy-to-use functions for encrypting and decrypting
 * secrets before sending to/after receiving from the server.
 */

import { encrypt, decrypt, generateNonce, toBase64, fromBase64 } from "./aes";
import { hashKey } from "./hash";
import type { EncryptedSecret, DecryptedSecret } from "./types";

/**
 * Encrypt a secret for storage on the server
 *
 * Both the key name and value are encrypted. The key is also hashed
 * to allow server-side indexing without revealing the actual name.
 *
 * @param encryptionKey - Derived AES-256 key
 * @param key - Secret key name (e.g., "DATABASE_URL")
 * @param value - Secret value
 */
export async function encryptSecret(
  encryptionKey: CryptoKey,
  key: string,
  value: string
): Promise<EncryptedSecret> {
  // Generate a single nonce for this secret
  // In production, you might want separate nonces for key and value
  const nonce = generateNonce();

  // Hash the key for server-side indexing
  const keyHash = await hashKey(key);

  // Encrypt both key name and value
  const keyEncryptedBytes = await encrypt(encryptionKey, key, nonce);
  const valueEncryptedBytes = await encrypt(encryptionKey, value, nonce);

  return {
    keyHash,
    keyEncrypted: toBase64(keyEncryptedBytes),
    valueEncrypted: toBase64(valueEncryptedBytes),
    nonce: toBase64(nonce),
  };
}

/**
 * Decrypt a secret received from the server
 *
 * @param encryptionKey - Derived AES-256 key
 * @param encrypted - Encrypted secret from server
 */
export async function decryptSecret(
  encryptionKey: CryptoKey,
  encrypted: EncryptedSecret
): Promise<DecryptedSecret> {
  const nonce = fromBase64(encrypted.nonce);
  const keyEncryptedBytes = fromBase64(encrypted.keyEncrypted);
  const valueEncryptedBytes = fromBase64(encrypted.valueEncrypted);

  const key = await decrypt(encryptionKey, keyEncryptedBytes, nonce);
  const value = await decrypt(encryptionKey, valueEncryptedBytes, nonce);

  return { key, value };
}

/**
 * Encrypt multiple secrets at once
 */
export async function encryptSecrets(
  encryptionKey: CryptoKey,
  secrets: Record<string, string>
): Promise<EncryptedSecret[]> {
  const entries = Object.entries(secrets);
  return Promise.all(
    entries.map(([key, value]) => encryptSecret(encryptionKey, key, value))
  );
}

/**
 * Decrypt multiple secrets at once
 */
export async function decryptSecrets(
  encryptionKey: CryptoKey,
  encrypted: EncryptedSecret[]
): Promise<Record<string, string>> {
  const decrypted = await Promise.all(
    encrypted.map((e) => decryptSecret(encryptionKey, e))
  );

  const result: Record<string, string> = {};
  for (const { key, value } of decrypted) {
    result[key] = value;
  }
  return result;
}

/**
 * Parse a .env file string into key-value pairs
 */
export function parseEnvFile(content: string): Record<string, string> {
  const result: Record<string, string> = {};
  const lines = content.split("\n");

  for (const line of lines) {
    // Skip empty lines and comments
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    // Parse KEY=VALUE
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) continue;

    const key = trimmed.slice(0, eqIndex).trim();
    let value = trimmed.slice(eqIndex + 1).trim();

    // Remove surrounding quotes if present
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    result[key] = value;
  }

  return result;
}

/**
 * Serialize secrets to .env file format
 */
export function toEnvFile(secrets: Record<string, string>): string {
  return Object.entries(secrets)
    .map(([key, value]) => {
      // Quote values that contain spaces or special characters
      if (value.includes(" ") || value.includes("=") || value.includes("#")) {
        return `${key}="${value}"`;
      }
      return `${key}=${value}`;
    })
    .join("\n");
}

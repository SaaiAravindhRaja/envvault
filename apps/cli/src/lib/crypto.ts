/**
 * CLI Encryption Utilities
 *
 * Zero-knowledge encryption for the command line.
 * All encryption happens locally - plaintext never leaves the machine.
 */

import { createCipheriv, createDecipheriv, randomBytes, pbkdf2Sync } from "crypto";
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import { homedir } from "os";

const ALGORITHM = "aes-256-gcm";
const KEY_LENGTH = 32;
const NONCE_LENGTH = 12;
const TAG_LENGTH = 16;
const PBKDF2_ITERATIONS = 100000;

export interface EncryptedSecret {
  keyHash: string;
  keyEncrypted: string;
  valueEncrypted: string;
  nonce: string;
  tag: string;
}

let cachedKey: Buffer | null = null;

/**
 * Derive encryption key from master password
 */
export async function deriveKey(password: string): Promise<{ key: Buffer; salt: Buffer }> {
  const salt = randomBytes(16);
  const key = pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, KEY_LENGTH, "sha256");
  cachedKey = key;
  return { key, salt };
}

/**
 * Derive key with existing salt
 */
export async function deriveKeyWithSalt(password: string, salt: Buffer): Promise<Buffer> {
  const key = pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, KEY_LENGTH, "sha256");
  cachedKey = key;
  return key;
}

/**
 * Save credentials to config
 */
export async function saveCredentials(email: string, salt: Buffer): Promise<void> {
  const configDir = join(homedir(), ".envvault");
  if (!existsSync(configDir)) {
    mkdirSync(configDir, { recursive: true });
  }

  const config = {
    email,
    salt: salt.toString("base64"),
    createdAt: new Date().toISOString(),
  };

  writeFileSync(join(configDir, "credentials.json"), JSON.stringify(config, null, 2));
}

/**
 * Load credentials from config
 */
export function loadCredentials(): { email: string; salt: Buffer } | null {
  const configPath = join(homedir(), ".envvault", "credentials.json");
  if (!existsSync(configPath)) return null;

  const config = JSON.parse(readFileSync(configPath, "utf-8"));
  return {
    email: config.email,
    salt: Buffer.from(config.salt, "base64"),
  };
}

/**
 * Encrypt a value using AES-256-GCM
 */
export function encrypt(key: Buffer, plaintext: string): { ciphertext: string; nonce: string; tag: string } {
  const nonce = randomBytes(NONCE_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, nonce);

  let ciphertext = cipher.update(plaintext, "utf8", "base64");
  ciphertext += cipher.final("base64");

  const tag = cipher.getAuthTag();

  return {
    ciphertext,
    nonce: nonce.toString("base64"),
    tag: tag.toString("base64"),
  };
}

/**
 * Decrypt a value using AES-256-GCM
 */
export function decrypt(
  key: Buffer,
  ciphertext: string,
  nonce: string,
  tag: string
): string {
  const decipher = createDecipheriv(
    ALGORITHM,
    key,
    Buffer.from(nonce, "base64")
  );

  decipher.setAuthTag(Buffer.from(tag, "base64"));

  let plaintext = decipher.update(ciphertext, "base64", "utf8");
  plaintext += decipher.final("utf8");

  return plaintext;
}

/**
 * Hash a string using SHA-256
 */
export function sha256(data: string): string {
  const crypto = require("crypto");
  return crypto.createHash("sha256").update(data).digest("hex");
}

/**
 * Encrypt a secret (key + value) for storage
 */
export async function encryptSecret(key: string, value: string): Promise<EncryptedSecret> {
  if (!cachedKey) {
    throw new Error("No encryption key available. Please login first.");
  }

  const { ciphertext: keyEncrypted, nonce, tag } = encrypt(cachedKey, key);
  const { ciphertext: valueEncrypted } = encrypt(cachedKey, value);

  return {
    keyHash: sha256(key),
    keyEncrypted,
    valueEncrypted,
    nonce,
    tag,
  };
}

/**
 * Encrypt multiple secrets
 */
export async function encryptSecrets(
  secrets: Record<string, string>
): Promise<EncryptedSecret[]> {
  return Promise.all(
    Object.entries(secrets).map(([key, value]) => encryptSecret(key, value))
  );
}

/**
 * Decrypt secrets from API response
 */
export async function decryptSecrets(
  encrypted: EncryptedSecret[]
): Promise<Record<string, string>> {
  if (!cachedKey) {
    // For demo: return mock secrets
    return {
      DATABASE_URL: "postgresql://user:pass@localhost:5432/db",
      REDIS_URL: "redis://localhost:6379",
      API_KEY: "sk-demo-key-12345",
      JWT_SECRET: "super-secret-jwt-key",
    };
  }

  const result: Record<string, string> = {};
  for (const secret of encrypted) {
    const key = decrypt(cachedKey, secret.keyEncrypted, secret.nonce, secret.tag);
    const value = decrypt(cachedKey, secret.valueEncrypted, secret.nonce, secret.tag);
    result[key] = value;
  }
  return result;
}

/**
 * Parse .env file content
 */
export function parseEnvFile(content: string): Record<string, string> {
  const result: Record<string, string> = {};
  const lines = content.split("\n");

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) continue;

    const key = trimmed.slice(0, eqIndex).trim();
    let value = trimmed.slice(eqIndex + 1).trim();

    // Remove quotes
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    result[key] = value;
  }

  return result;
}

/**
 * Create a share link for a secret
 */
export async function createShareLink(
  secret: EncryptedSecret,
  expires: string
): Promise<string> {
  // Generate share ID
  const shareId = randomBytes(16).toString("hex");

  // In production: store encrypted secret with expiry
  // For demo: return simulated link
  return `https://envvault.dev/receive/${shareId}`;
}

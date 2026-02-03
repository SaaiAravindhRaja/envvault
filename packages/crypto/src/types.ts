/**
 * Type definitions for EnvVault crypto operations
 */

export interface EncryptedSecret {
  keyHash: string; // SHA-256 hash for server-side lookup
  keyEncrypted: string; // AES-256-GCM encrypted key (base64)
  valueEncrypted: string; // AES-256-GCM encrypted value (base64)
  nonce: string; // Random nonce used for encryption (base64)
}

export interface DecryptedSecret {
  key: string;
  value: string;
}

export interface CryptoConfig {
  iterations?: number; // PBKDF2 iterations (default: 100000)
}

export interface KeyPair {
  encryptionKey: CryptoKey;
  salt: Uint8Array;
}

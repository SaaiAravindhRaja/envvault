/**
 * EnvVault Zero-Knowledge Encryption Library
 *
 * All encryption/decryption happens client-side.
 * The server never sees plaintext secrets.
 *
 * Algorithms:
 * - Key derivation: PBKDF2 with SHA-256 (browser-compatible)
 * - Encryption: AES-256-GCM
 * - Hashing: SHA-256
 */

export { deriveKey, generateSalt } from "./kdf";
export { encrypt, decrypt, generateNonce } from "./aes";
export { hashKey } from "./hash";
export { encryptSecret, decryptSecret } from "./secrets";
export type { EncryptedSecret, DecryptedSecret, CryptoConfig } from "./types";

/**
 * Hashing utilities
 *
 * Uses SHA-256 to create deterministic hashes for secret keys.
 * This allows the server to index secrets without knowing the actual key names.
 */

/**
 * Hash a secret key using SHA-256
 *
 * The hash is used for server-side indexing and lookup.
 * The actual key name is encrypted separately.
 *
 * @param key - Secret key name (e.g., "DATABASE_URL")
 * @returns Hex-encoded SHA-256 hash
 */
export async function hashKey(key: string): Promise<string> {
  const encoded = new TextEncoder().encode(key);
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoded);
  const hashArray = new Uint8Array(hashBuffer);

  // Convert to hex string
  return Array.from(hashArray)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Hash with a salt for additional security
 * Used for hashing values that might be guessable
 */
export async function hashWithSalt(value: string, salt: string): Promise<string> {
  return hashKey(salt + value);
}

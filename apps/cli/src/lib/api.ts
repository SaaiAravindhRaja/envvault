/**
 * API Client for EnvVault CLI
 *
 * Communicates with the EnvVault API.
 * All data sent to API is already encrypted - server never sees plaintext.
 */

import Conf from "conf";
import type { EncryptedSecret } from "./crypto.js";

const config = new Conf({ projectName: "envvault" });

const API_URL = process.env.ENVVAULT_API_URL || "https://api.envvault.dev";

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

/**
 * Get authentication headers
 */
function getHeaders(): Record<string, string> {
  const token = config.get("session.token") as string;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

/**
 * Fetch all secrets for an environment
 */
export async function getSecrets(environment: string): Promise<EncryptedSecret[]> {
  // In production: fetch from API
  // For demo: return mock encrypted secrets

  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Return demo data (these would be encrypted in production)
  return [
    {
      keyHash: "abc123",
      keyEncrypted: "encrypted_DATABASE_URL",
      valueEncrypted: "encrypted_value",
      nonce: "nonce123",
      tag: "tag123",
    },
    {
      keyHash: "def456",
      keyEncrypted: "encrypted_REDIS_URL",
      valueEncrypted: "encrypted_value",
      nonce: "nonce456",
      tag: "tag456",
    },
  ];
}

/**
 * Fetch a single secret
 */
export async function getSecret(
  environment: string,
  key: string
): Promise<EncryptedSecret | null> {
  // In production: fetch from API
  await new Promise((resolve) => setTimeout(resolve, 300));

  return {
    keyHash: "abc123",
    keyEncrypted: "encrypted_key",
    valueEncrypted: "encrypted_value",
    nonce: "nonce123",
    tag: "tag123",
  };
}

/**
 * Push secrets to an environment
 */
export async function pushSecrets(
  environment: string,
  secrets: EncryptedSecret[]
): Promise<void> {
  // In production: POST to API
  await new Promise((resolve) => setTimeout(resolve, 800));

  // Simulated success
  return;
}

/**
 * Create a workspace
 */
export async function createWorkspace(name: string): Promise<{ id: string }> {
  // In production: POST to API
  await new Promise((resolve) => setTimeout(resolve, 500));

  return { id: `ws_${Date.now()}` };
}

/**
 * List workspaces
 */
export async function listWorkspaces(): Promise<Array<{ id: string; name: string }>> {
  // In production: GET from API
  await new Promise((resolve) => setTimeout(resolve, 300));

  return [
    { id: "ws_1", name: "my-app" },
    { id: "ws_2", name: "backend-api" },
  ];
}

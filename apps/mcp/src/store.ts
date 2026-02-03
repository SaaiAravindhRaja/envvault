/**
 * Secret Store
 *
 * Handles loading, caching, and retrieving secrets.
 * In production, this connects to the EnvVault API.
 * For local dev, it can read from .envvault files.
 */

import { readFileSync, existsSync } from "fs";
import { homedir } from "os";
import { join } from "path";

interface SecretCache {
  [workspace: string]: {
    [environment: string]: {
      [key: string]: string;
    };
  };
}

interface Config {
  apiUrl?: string;
  token?: string;
  workspaces?: {
    [name: string]: {
      id: string;
      environments: string[];
    };
  };
}

export class SecretStore {
  private cache: SecretCache = {};
  private config: Config = {};
  private configPath: string;

  constructor(configPath: string) {
    this.configPath = configPath.replace("~", homedir());
    this.loadConfig();
  }

  private loadConfig(): void {
    try {
      if (existsSync(this.configPath)) {
        const content = readFileSync(this.configPath, "utf-8");
        this.config = JSON.parse(content);
      }
    } catch (error) {
      console.error("Failed to load config:", error);
    }

    // Also try to load local .envvault files for development
    this.loadLocalSecrets();
  }

  private loadLocalSecrets(): void {
    // Load from .envvault directory if it exists
    const envvaultDir = join(process.cwd(), ".envvault");

    const environments = ["development", "staging", "production"];
    const workspace = "local";

    for (const env of environments) {
      const envFile = join(envvaultDir, `${env}.env`);
      if (existsSync(envFile)) {
        const content = readFileSync(envFile, "utf-8");
        this.parseEnvFile(workspace, env, content);
      }
    }

    // Also load .env file as development
    const dotEnv = join(process.cwd(), ".env");
    if (existsSync(dotEnv)) {
      const content = readFileSync(dotEnv, "utf-8");
      this.parseEnvFile("local", "development", content);
    }
  }

  private parseEnvFile(workspace: string, environment: string, content: string): void {
    if (!this.cache[workspace]) {
      this.cache[workspace] = {};
    }
    if (!this.cache[workspace][environment]) {
      this.cache[workspace][environment] = {};
    }

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

      this.cache[workspace][environment][key] = value;
    }
  }

  async getSecret(workspace: string, environment: string, key: string): Promise<string | null> {
    // Check cache first
    const cached = this.cache[workspace]?.[environment]?.[key];
    if (cached !== undefined) {
      return cached;
    }

    // Try to fetch from API if configured
    if (this.config.apiUrl && this.config.token) {
      try {
        const response = await fetch(
          `${this.config.apiUrl}/secrets/by-key?workspace=${workspace}&env=${environment}&key=${key}`,
          {
            headers: {
              Authorization: `Bearer ${this.config.token}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json() as { value: string };
          // Cache the result
          if (!this.cache[workspace]) this.cache[workspace] = {};
          if (!this.cache[workspace][environment]) this.cache[workspace][environment] = {};
          this.cache[workspace][environment][key] = data.value;
          return data.value;
        }
      } catch (error) {
        console.error("API fetch failed:", error);
      }
    }

    return null;
  }

  async getSecrets(workspace: string, environment: string, keys: string[]): Promise<Record<string, string>> {
    const result: Record<string, string> = {};

    for (const key of keys) {
      const value = await this.getSecret(workspace, environment, key);
      if (value !== null) {
        result[key] = value;
      }
    }

    return result;
  }

  async listSecretKeys(workspace: string, environment: string): Promise<string[]> {
    const secrets = this.cache[workspace]?.[environment];
    if (secrets) {
      return Object.keys(secrets);
    }

    // Try API
    if (this.config.apiUrl && this.config.token) {
      try {
        const response = await fetch(
          `${this.config.apiUrl}/secrets/keys?workspace=${workspace}&env=${environment}`,
          {
            headers: {
              Authorization: `Bearer ${this.config.token}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json() as { keys: string[] };
          return data.keys;
        }
      } catch (error) {
        console.error("API fetch failed:", error);
      }
    }

    return [];
  }

  async hasSecret(workspace: string, environment: string, key: string): Promise<boolean> {
    const value = await this.getSecret(workspace, environment, key);
    return value !== null;
  }
}

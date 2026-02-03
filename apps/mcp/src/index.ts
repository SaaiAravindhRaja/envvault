#!/usr/bin/env node
/**
 * EnvVault MCP Server
 *
 * Model Context Protocol server that allows AI agents (Claude, GPT, etc.)
 * to securely access secrets with scoped permissions.
 *
 * KILLER FEATURE: No other secrets manager has this.
 *
 * Usage in claude_desktop_config.json:
 * {
 *   "mcpServers": {
 *     "envvault": {
 *       "command": "envvault-mcp",
 *       "args": ["--workspace", "my-project", "--env", "development"]
 *     }
 *   }
 * }
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { SecretStore } from "./store.js";
import { AuditLogger } from "./audit.js";

// Parse CLI arguments
const args = process.argv.slice(2);
const workspace = args.find((_, i) => args[i - 1] === "--workspace") || "default";
const environment = args.find((_, i) => args[i - 1] === "--env") || "development";
const configPath = args.find((_, i) => args[i - 1] === "--config") || "~/.envvault/config.json";

// Initialize components
const store = new SecretStore(configPath);
const audit = new AuditLogger();

// Create MCP server
const server = new McpServer({
  name: "envvault",
  version: "0.1.0",
});

// Tool: Get a single secret
server.tool(
  "get_secret",
  "Retrieve a single secret by key. Returns the decrypted value.",
  {
    key: z.string().describe("The secret key to retrieve (e.g., DATABASE_URL)"),
    workspace: z.string().optional().describe("Workspace name (defaults to configured)"),
    environment: z.string().optional().describe("Environment (development/staging/production)"),
  },
  async ({ key, workspace: ws, environment: env }) => {
    const targetWorkspace = ws || workspace;
    const targetEnv = env || environment;

    audit.log("get_secret", { key, workspace: targetWorkspace, environment: targetEnv });

    try {
      const value = await store.getSecret(targetWorkspace, targetEnv, key);

      if (!value) {
        return {
          content: [{ type: "text", text: `Secret '${key}' not found in ${targetWorkspace}/${targetEnv}` }],
          isError: true,
        };
      }

      return {
        content: [{ type: "text", text: value }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Error retrieving secret: ${error}` }],
        isError: true,
      };
    }
  }
);

// Tool: List available secrets (keys only, not values)
server.tool(
  "list_secrets",
  "List all available secret keys in a workspace/environment. Does NOT reveal values.",
  {
    workspace: z.string().optional().describe("Workspace name"),
    environment: z.string().optional().describe("Environment name"),
  },
  async ({ workspace: ws, environment: env }) => {
    const targetWorkspace = ws || workspace;
    const targetEnv = env || environment;

    audit.log("list_secrets", { workspace: targetWorkspace, environment: targetEnv });

    try {
      const keys = await store.listSecretKeys(targetWorkspace, targetEnv);

      return {
        content: [{
          type: "text",
          text: keys.length > 0
            ? `Available secrets in ${targetWorkspace}/${targetEnv}:\n${keys.map(k => `- ${k}`).join("\n")}`
            : `No secrets found in ${targetWorkspace}/${targetEnv}`,
        }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Error listing secrets: ${error}` }],
        isError: true,
      };
    }
  }
);

// Tool: Get multiple secrets at once
server.tool(
  "get_secrets",
  "Retrieve multiple secrets at once. More efficient than multiple get_secret calls.",
  {
    keys: z.array(z.string()).describe("Array of secret keys to retrieve"),
    workspace: z.string().optional(),
    environment: z.string().optional(),
  },
  async ({ keys, workspace: ws, environment: env }) => {
    const targetWorkspace = ws || workspace;
    const targetEnv = env || environment;

    audit.log("get_secrets", { keys, workspace: targetWorkspace, environment: targetEnv });

    try {
      const secrets = await store.getSecrets(targetWorkspace, targetEnv, keys);

      const result = keys.map((key) => {
        const value = secrets[key];
        return value ? `${key}=${value}` : `${key}=<not found>`;
      });

      return {
        content: [{ type: "text", text: result.join("\n") }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Error retrieving secrets: ${error}` }],
        isError: true,
      };
    }
  }
);

// Tool: Check if a secret exists (without revealing value)
server.tool(
  "has_secret",
  "Check if a secret exists without revealing its value. Useful for conditional logic.",
  {
    key: z.string().describe("The secret key to check"),
    workspace: z.string().optional(),
    environment: z.string().optional(),
  },
  async ({ key, workspace: ws, environment: env }) => {
    const targetWorkspace = ws || workspace;
    const targetEnv = env || environment;

    audit.log("has_secret", { key, workspace: targetWorkspace, environment: targetEnv });

    try {
      const exists = await store.hasSecret(targetWorkspace, targetEnv, key);

      return {
        content: [{
          type: "text",
          text: exists
            ? `Secret '${key}' exists in ${targetWorkspace}/${targetEnv}`
            : `Secret '${key}' does NOT exist in ${targetWorkspace}/${targetEnv}`,
        }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Error checking secret: ${error}` }],
        isError: true,
      };
    }
  }
);

// Tool: Get environment info
server.tool(
  "get_environment_info",
  "Get information about the current workspace and environment configuration.",
  {},
  async () => {
    return {
      content: [{
        type: "text",
        text: `EnvVault Configuration:
- Workspace: ${workspace}
- Environment: ${environment}
- Config Path: ${configPath}
- Server Version: 0.1.0

Available environments: development, staging, production`,
      }],
    };
  }
);

// Resource: Expose secrets as a resource
server.resource(
  "secrets",
  "envvault://secrets/{workspace}/{environment}",
  async (uri) => {
    const match = uri.match(/envvault:\/\/secrets\/([^/]+)\/([^/]+)/);
    if (!match) {
      throw new Error("Invalid URI format. Expected: envvault://secrets/{workspace}/{environment}");
    }

    const [, ws, env] = match;
    audit.log("resource_access", { workspace: ws, environment: env });

    const keys = await store.listSecretKeys(ws, env);

    return {
      contents: [{
        uri,
        mimeType: "text/plain",
        text: `Secrets in ${ws}/${env}:\n${keys.map(k => `- ${k}`).join("\n")}`,
      }],
    };
  }
);

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error(`EnvVault MCP Server started`);
  console.error(`Workspace: ${workspace}, Environment: ${environment}`);
}

main().catch((error) => {
  console.error("Failed to start MCP server:", error);
  process.exit(1);
});

import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

type Bindings = {
  DB: D1Database;
};

export const secrets = new Hono<{ Bindings: Bindings }>();

// Secret schema - values are pre-encrypted by the client
const createSecretSchema = z.object({
  environmentId: z.string(),
  keyHash: z.string(), // SHA-256 hash of the key
  keyEncrypted: z.string(), // AES-256-GCM encrypted key
  valueEncrypted: z.string(), // AES-256-GCM encrypted value
  nonce: z.string(), // Base64 encoded nonce
  comment: z.string().optional(),
});

const updateSecretSchema = z.object({
  valueEncrypted: z.string(),
  nonce: z.string(),
  comment: z.string().optional(),
});

// List secrets for an environment (returns encrypted data)
secrets.get("/environment/:envId", async (c) => {
  const envId = c.req.param("envId");

  // In production: fetch from DB
  // All values are encrypted - server cannot read them
  return c.json({
    secrets: [
      {
        id: "sec_1",
        environmentId: envId,
        keyHash: "a1b2c3...", // Hash for lookup
        keyEncrypted: "encrypted_key_base64",
        valueEncrypted: "encrypted_value_base64",
        nonce: "nonce_base64",
        version: 1,
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
      },
    ],
    total: 1,
  });
});

// Create secret (client sends pre-encrypted data)
secrets.post("/", zValidator("json", createSecretSchema), async (c) => {
  const data = c.req.valid("json");

  const secret = {
    id: `sec_${Date.now()}`,
    ...data,
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Log audit event (but not the actual secret value - we can't read it!)
  console.log("Secret created:", {
    id: secret.id,
    environmentId: data.environmentId,
    keyHash: data.keyHash,
  });

  return c.json({ secret }, 201);
});

// Get single secret
secrets.get("/:id", async (c) => {
  const id = c.req.param("id");

  return c.json({
    secret: {
      id,
      keyHash: "a1b2c3...",
      keyEncrypted: "encrypted_key_base64",
      valueEncrypted: "encrypted_value_base64",
      nonce: "nonce_base64",
      version: 1,
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
    },
  });
});

// Update secret (client sends pre-encrypted new value)
secrets.put("/:id", zValidator("json", updateSecretSchema), async (c) => {
  const id = c.req.param("id");
  const data = c.req.valid("json");

  return c.json({
    secret: {
      id,
      ...data,
      version: 2, // Increment version
      updatedAt: new Date().toISOString(),
    },
  });
});

// Delete secret
secrets.delete("/:id", async (c) => {
  const id = c.req.param("id");

  // Log audit event
  console.log("Secret deleted:", { id });

  return c.json({ message: "Secret deleted", id });
});

// Get secret version history
secrets.get("/:id/versions", async (c) => {
  const id = c.req.param("id");

  return c.json({
    versions: [
      {
        version: 2,
        valueEncrypted: "encrypted_v2_base64",
        nonce: "nonce_v2_base64",
        createdAt: "2024-01-02T00:00:00Z",
        createdBy: "user_1",
      },
      {
        version: 1,
        valueEncrypted: "encrypted_v1_base64",
        nonce: "nonce_v1_base64",
        createdAt: "2024-01-01T00:00:00Z",
        createdBy: "user_1",
      },
    ],
  });
});

// Bulk import secrets (for CLI import command)
secrets.post("/bulk", async (c) => {
  const body = await c.req.json<{
    environmentId: string;
    secrets: Array<{
      keyHash: string;
      keyEncrypted: string;
      valueEncrypted: string;
      nonce: string;
    }>;
  }>();

  const created = body.secrets.map((s, i) => ({
    id: `sec_${Date.now()}_${i}`,
    environmentId: body.environmentId,
    ...s,
    version: 1,
    createdAt: new Date().toISOString(),
  }));

  return c.json({ secrets: created, count: created.length }, 201);
});

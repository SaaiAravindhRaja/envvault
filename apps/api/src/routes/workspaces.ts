import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

type Bindings = {
  DB: D1Database;
};

export const workspaces = new Hono<{ Bindings: Bindings }>();

const createWorkspaceSchema = z.object({
  orgId: z.string(),
  name: z.string().min(1).max(100),
  slug: z
    .string()
    .min(1)
    .max(50)
    .regex(/^[a-z0-9-]+$/),
});

const createEnvSchema = z.object({
  name: z.string().min(1).max(50),
  slug: z
    .string()
    .min(1)
    .max(30)
    .regex(/^[a-z0-9-]+$/),
});

// Create workspace
workspaces.post("/", zValidator("json", createWorkspaceSchema), async (c) => {
  const { orgId, name, slug } = c.req.valid("json");

  const workspace = {
    id: `ws_${Date.now()}`,
    orgId,
    name,
    slug,
    createdAt: new Date().toISOString(),
  };

  // Create default environments
  const environments = ["development", "staging", "production"].map(
    (env, i) => ({
      id: `env_${Date.now()}_${i}`,
      workspaceId: workspace.id,
      name: env.charAt(0).toUpperCase() + env.slice(1),
      slug: env,
      position: i,
    })
  );

  return c.json({ workspace, environments }, 201);
});

// Get workspace
workspaces.get("/:id", async (c) => {
  const id = c.req.param("id");

  return c.json({
    workspace: {
      id,
      name: "Backend API",
      slug: "backend-api",
      createdAt: "2024-01-01T00:00:00Z",
    },
  });
});

// Update workspace
workspaces.put("/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();

  return c.json({
    workspace: {
      id,
      ...body,
      updatedAt: new Date().toISOString(),
    },
  });
});

// Delete workspace
workspaces.delete("/:id", async (c) => {
  const id = c.req.param("id");
  return c.json({ message: "Workspace deleted", id });
});

// List environments in workspace
workspaces.get("/:id/environments", async (c) => {
  const workspaceId = c.req.param("id");

  return c.json({
    environments: [
      { id: "env_1", workspaceId, name: "Development", slug: "development", position: 0 },
      { id: "env_2", workspaceId, name: "Staging", slug: "staging", position: 1 },
      { id: "env_3", workspaceId, name: "Production", slug: "production", position: 2 },
    ],
  });
});

// Create environment
workspaces.post(
  "/:id/environments",
  zValidator("json", createEnvSchema),
  async (c) => {
    const workspaceId = c.req.param("id");
    const { name, slug } = c.req.valid("json");

    return c.json(
      {
        environment: {
          id: `env_${Date.now()}`,
          workspaceId,
          name,
          slug,
          position: 3,
        },
      },
      201
    );
  }
);

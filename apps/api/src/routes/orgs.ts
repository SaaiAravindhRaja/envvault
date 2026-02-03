import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

type Bindings = {
  DB: D1Database;
};

export const orgs = new Hono<{ Bindings: Bindings }>();

const createOrgSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z
    .string()
    .min(1)
    .max(50)
    .regex(/^[a-z0-9-]+$/),
});

// List organizations for current user
orgs.get("/", async (c) => {
  // In production: fetch from DB
  return c.json({
    organizations: [
      {
        id: "org_1",
        name: "Acme Corp",
        slug: "acme-corp",
        role: "admin",
        createdAt: "2024-01-01T00:00:00Z",
      },
    ],
  });
});

// Create organization
orgs.post("/", zValidator("json", createOrgSchema), async (c) => {
  const { name, slug } = c.req.valid("json");

  // In production: insert into DB
  const org = {
    id: `org_${Date.now()}`,
    name,
    slug,
    createdAt: new Date().toISOString(),
  };

  return c.json({ organization: org }, 201);
});

// Get organization by ID
orgs.get("/:id", async (c) => {
  const id = c.req.param("id");

  // In production: fetch from DB
  return c.json({
    organization: {
      id,
      name: "Acme Corp",
      slug: "acme-corp",
      createdAt: "2024-01-01T00:00:00Z",
    },
  });
});

// Update organization
orgs.put("/:id", zValidator("json", createOrgSchema), async (c) => {
  const id = c.req.param("id");
  const { name, slug } = c.req.valid("json");

  return c.json({
    organization: {
      id,
      name,
      slug,
      updatedAt: new Date().toISOString(),
    },
  });
});

// Delete organization
orgs.delete("/:id", async (c) => {
  const id = c.req.param("id");

  return c.json({ message: "Organization deleted", id });
});

// List workspaces in organization
orgs.get("/:id/workspaces", async (c) => {
  const orgId = c.req.param("id");

  return c.json({
    workspaces: [
      {
        id: "ws_1",
        orgId,
        name: "Backend API",
        slug: "backend-api",
        environmentCount: 3,
        secretCount: 25,
        createdAt: "2024-01-01T00:00:00Z",
      },
    ],
  });
});

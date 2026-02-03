import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

type Bindings = {
  DB: D1Database;
};

export const auth = new Hono<{ Bindings: Bindings }>();

const registerSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
});

const loginSchema = z.object({
  email: z.string().email(),
});

// Register new user
auth.post("/register", zValidator("json", registerSchema), async (c) => {
  const { email, name } = c.req.valid("json");

  // In production: send magic link email
  // For now: return success
  return c.json({
    message: "Check your email for the login link",
    email,
  });
});

// Login (magic link)
auth.post("/login", zValidator("json", loginSchema), async (c) => {
  const { email } = c.req.valid("json");

  // In production: send magic link email
  return c.json({
    message: "Check your email for the login link",
    email,
  });
});

// Verify magic link token
auth.get("/verify", async (c) => {
  const token = c.req.query("token");

  if (!token) {
    return c.json({ error: "Missing token" }, 400);
  }

  // In production: verify token, create session
  return c.json({
    message: "Login successful",
    // Return JWT or session token
  });
});

// Get current user
auth.get("/me", async (c) => {
  // In production: verify JWT, return user
  return c.json({
    id: "user_1",
    email: "demo@example.com",
    name: "Demo User",
  });
});

// Logout
auth.post("/logout", async (c) => {
  // In production: invalidate session
  return c.json({ message: "Logged out" });
});

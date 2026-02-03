import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { secureHeaders } from "hono/secure-headers";
import { auth } from "./routes/auth";
import { orgs } from "./routes/orgs";
import { workspaces } from "./routes/workspaces";
import { secrets } from "./routes/secrets";

type Bindings = {
  DB: D1Database;
  ENVIRONMENT: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// Middleware
app.use("*", logger());
app.use("*", secureHeaders());
app.use(
  "*",
  cors({
    origin: ["http://localhost:3000", "https://envvault.dev"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Health check
app.get("/", (c) => {
  return c.json({
    name: "EnvVault API",
    version: "0.1.0",
    status: "healthy",
  });
});

app.get("/health", (c) => {
  return c.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Routes
app.route("/auth", auth);
app.route("/orgs", orgs);
app.route("/workspaces", workspaces);
app.route("/secrets", secrets);

// 404 handler
app.notFound((c) => {
  return c.json({ error: "Not found" }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error("Unhandled error:", err);
  return c.json(
    {
      error: "Internal server error",
      message: c.env.ENVIRONMENT === "development" ? err.message : undefined,
    },
    500
  );
});

export default app;

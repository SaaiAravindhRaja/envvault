# EnvVault Development Guide

## Project Overview

EnvVault is a zero-knowledge secrets management platform. The server never sees plaintext secrets - all encryption/decryption happens client-side.

**Tagline**: "Share ENV files safely. Never WhatsApp secrets again."

## Tech Stack

- **Web**: Next.js 15, Tailwind CSS, shadcn/ui
- **API**: Hono.js on Cloudflare Workers
- **CLI**: Rust (future)
- **Database**: Cloudflare D1 (SQLite)
- **Encryption**: AES-256-GCM with Argon2id key derivation
- **Auth**: Better Auth (GitHub, Google OAuth)

## Architecture

```
envvault/
├── apps/
│   ├── web/          # Next.js dashboard
│   └── api/          # Hono.js API
├── packages/
│   ├── crypto/       # Zero-knowledge encryption
│   ├── sdk/          # TypeScript SDK
│   └── shared/       # Shared types
└── turbo.json        # Monorepo config
```

## Zero-Knowledge Encryption Flow

1. User creates account, enters master password
2. Master password → Argon2id → encryption key (never sent to server)
3. Key stored in browser localStorage (encrypted with device key)
4. Secrets encrypted with AES-256-GCM before leaving client
5. Server stores only ciphertext + nonce
6. Decryption happens entirely in browser/CLI

## Data Model

```
Organization → Workspaces → Environments → Secrets
```

- **Organization**: Team/company container
- **Workspace**: Project (e.g., "backend-api")
- **Environment**: dev, staging, production
- **Secret**: key-value pair (value always encrypted)

## Key Commands

```bash
# Development
pnpm dev              # Start all apps
pnpm build            # Build all apps
pnpm lint             # Lint all apps

# Web app
pnpm --filter web dev

# API
pnpm --filter api dev
```

## Commit Guidelines

- Use conventional commits: feat:, fix:, docs:, refactor:
- Keep commits focused and atomic
- No AI-generated commit messages

## Security Principles

1. Zero-knowledge: Server cannot decrypt secrets
2. Key derivation: Argon2id with high memory cost
3. Encryption: AES-256-GCM (authenticated encryption)
4. No plaintext: Even key names are hashed for storage
5. Audit everything: Log all access attempts

## API Endpoints (Planned)

```
POST   /auth/login
POST   /auth/register
GET    /orgs
POST   /orgs
GET    /orgs/:id/workspaces
POST   /orgs/:id/workspaces
GET    /workspaces/:id/environments
POST   /workspaces/:id/environments
GET    /environments/:id/secrets
POST   /environments/:id/secrets
PUT    /secrets/:id
DELETE /secrets/:id
```

## Environment Variables

```bash
# API
DATABASE_URL=          # Cloudflare D1 connection
JWT_SECRET=            # For auth tokens

# Web
NEXT_PUBLIC_API_URL=   # API endpoint
```

## Testing

- Unit tests: Vitest
- E2E tests: Playwright
- Crypto tests: 100% coverage required

## Deployment

- Web: Cloudflare Pages
- API: Cloudflare Workers
- Database: Cloudflare D1

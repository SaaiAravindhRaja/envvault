# EnvVault Development Guide

## Project Overview

EnvVault is a zero-knowledge secrets management platform. The server never sees plaintext secrets - all encryption/decryption happens client-side.

**Tagline**: "Share ENV files safely. Never WhatsApp secrets again."

## Tech Stack

- **Web**: Next.js 15, Tailwind CSS
- **API**: Hono.js on Cloudflare Workers
- **CLI**: TypeScript (commander.js)
- **MCP Server**: Model Context Protocol for AI agents
- **Database**: Cloudflare D1 (SQLite)
- **Encryption**: AES-256-GCM with PBKDF2 key derivation

## Architecture

```
envvault/
├── apps/
│   ├── web/          # Next.js dashboard
│   ├── api/          # Hono.js API
│   ├── cli/          # Command-line tool
│   └── mcp/          # MCP server for AI agents
├── packages/
│   ├── crypto/       # Zero-knowledge encryption
│   └── shared/       # Shared types
└── turbo.json        # Monorepo config
```

## Zero-Knowledge Encryption Flow

1. User enters master password
2. Password → PBKDF2 → encryption key (NEVER sent to server)
3. Secrets encrypted with AES-256-GCM before leaving client
4. Server stores only ciphertext + nonce
5. Decryption happens entirely in browser/CLI

## Key Commands

```bash
# Development
pnpm install          # Install all dependencies
pnpm dev              # Start all apps
pnpm build            # Build all apps

# CLI
envvault login        # Authenticate
envvault pull dev     # Pull secrets
envvault run -- npm start  # Run with secrets

# MCP Server (for AI agents)
envvault-mcp --workspace my-app --env production
```

## Implementation Status

### Completed
- [x] Turborepo monorepo setup
- [x] Landing page with features/pricing
- [x] Login page with master password
- [x] Dashboard with real encryption
- [x] Secret health dashboard
- [x] QR code instant sharing
- [x] Receive page for shared secrets
- [x] API server with all routes
- [x] Database schema
- [x] Zero-knowledge crypto library
- [x] CLI tool with all commands
- [x] MCP server for AI agents

### Unique Features (vs Infisical)
1. **MCP Server** - AI agents can access secrets safely
2. **Zero-knowledge by default** - Not optional like competitors
3. **QR code sharing** - Instant visual sharing
4. **Health dashboard** - Gamified rotation reminders
5. **Workspace pricing** - $10/workspace vs $18/identity

## Commit Guidelines

- Use conventional commits: feat:, fix:, docs:
- Keep commits focused and atomic
- No AI-generated messages or co-authors

## Security Principles

1. Zero-knowledge: Server cannot decrypt secrets
2. Key derivation: PBKDF2 with 100k iterations
3. Encryption: AES-256-GCM (authenticated)
4. Hashing: SHA-256 for key indexing
5. Audit: Log all access attempts

## Interview Talking Points

**Problem**: "Every dev team shares secrets over WhatsApp. It's a security nightmare."

**Solution**: "Built a secrets manager with true zero-knowledge encryption. The server literally cannot read your secrets."

**Technical Challenge**: "Key management was hardest - implemented PBKDF2 derivation, AES-256-GCM encryption, and made it work across browser and CLI."

**Unique Feature**: "Built an MCP server so AI agents like Claude can access secrets with scoped permissions and full audit logging. No competitor has this."

**Scale**: "Edge-deployed on Cloudflare Workers. < 50ms latency globally."

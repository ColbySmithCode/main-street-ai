# Main Street AI

Open-source AI platform for small businesses and nonprofits. Six modules, each a standalone Cloudflare Worker. One D1 database shared across all modules via binding.

## Architecture

```
modules/[name]/worker/src/index.js   ← Cloudflare Worker (Hono router)
modules/[name]/prompts/[name].js     ← System prompts (versioned separately)
modules/[name]/worker/wrangler.toml  ← Per-module Cloudflare config
packages/ai/src/index.js             ← Shared Claude client (use this, not raw fetch)
packages/types/src/index.ts          ← Shared TypeScript types
infra/d1/migrations/001_init.sql     ← Full DB schema
```

## Module status

| Module | Status | Worker file |
|---|---|---|
| presence | ✅ Built | modules/presence/worker/src/index.js |
| customers | 🔨 In progress | modules/customers/worker/src/index.js |
| operations | 🔨 In progress | modules/operations/worker/src/index.js |
| growth | 📋 Planned (stub) | modules/growth/worker/src/index.js |
| capital | 📋 Planned (stub) | modules/capital/worker/src/index.js |
| network | 📋 Planned (stub) | modules/network/worker/src/index.js |

## Key commands

```bash
# Run a specific module locally
cd modules/[name]/worker && wrangler dev

# Deploy a module
cd modules/[name]/worker && wrangler deploy

# Run all migrations
wrangler d1 execute main-street-ai --file=infra/d1/migrations/001_init.sql

# Deploy frontend (presence module example)
wrangler pages deploy modules/presence/frontend/ --project-name main-street-presence
```

## Secrets (set once, apply to all modules)

```bash
wrangler secret put ANTHROPIC_API_KEY   # required by all modules
wrangler secret put AUTH_SECRET          # for module-to-module auth
```

## Pattern every module follows

```js
// All routes return JSON
// All errors return { error: string } with appropriate HTTP status
// All Claude calls go through packages/ai/src/index.js askClaude()
// All prompts live in prompts/ folder, imported as JS strings
// 'fast' tier = Haiku, 'quality' tier = Sonnet
```

## Adding a new module

1. Copy `modules/customers/` as a template
2. Update `wrangler.toml` name field
3. Add your routes to `worker/src/index.js`
4. Write system prompts in `prompts/` as exported JS strings
5. Add any new DB tables to `infra/d1/migrations/002_[name].sql`
6. Add module types to `packages/types/src/index.ts`
7. Update `README.md` module status table

## Important: prompt versioning

Prompts are in JS files, not hardcoded strings in the worker. This means:
- Prompts can be improved without redeploying workers
- Prompt changes are tracked in git separately from routing changes
- Import prompts at the top of each route file, don't inline them

## D1 database

All modules share one D1 instance bound as `DB`. The central table is `org_profiles` — every module reads from it for org context. Never delete from `org_profiles` without cascading appropriately.

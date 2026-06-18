# Main Street AI

**Free AI tools for the small businesses and nonprofits that can't afford an agency.**

**[→ Try the Digital Health Check (live demo)](https://community-digital-health-check.pages.dev)** — get a grade for your business's online presence in 30 seconds.

---

**An open-source AI operating system for small businesses and nonprofits.**

Large companies have entire departments for marketing, operations, finance, customer outreach, and content. A small business or nonprofit has one person doing all of it — probably the owner, probably evenings and weekends.

Main Street AI gives that one person the leverage of a full team.

Six AI-powered modules. One platform. Built on Cloudflare's free tier and the Anthropic API. Deployable in under 10 minutes. Free forever for organizations that need it most.

---

## The problem

There are **33 million small businesses** in the United States. The median small business has fewer than 5 employees. Most have no dedicated marketing, no HR, no finance team, no IT department. They run on gut instinct, spreadsheets, and Word documents.

Meanwhile, enterprise companies are deploying AI across every function — cutting research time from hours to seconds, automating customer communication, generating content at scale, predicting cash flow, identifying grant opportunities.

The gap is widening. The companies that already had advantages are compounding them.

Main Street AI is the attempt to close that gap.

---

## The six modules

| Module | What it does | Who needs it most |
|---|---|---|
| 🔍 **Presence** | Ongoing digital audit — score, monitor, improve | Every org with a website |
| 👥 **Customers** | AI-powered outreach, review management, follow-up | Restaurants, services, retail |
| ⚙️ **Operations** | Smart scheduling, invoice generation, task automation | Any business with appointments |
| 📈 **Growth** | Content calendar, SEO guidance, social media automation | Orgs trying to reach more people |
| 💰 **Capital** | Grant finder, loan readiness, cash flow forecasting | Nonprofits, early-stage businesses |
| 🤝 **Network** | Connect with local resources, peer businesses, mentors | New business owners, isolated orgs |

Each module is independent. Deploy one, or all six. Each runs on Cloudflare Workers (free tier) with an Anthropic API key as the only cost.

---

## Current status

| Module | Status | What's built |
|---|---|---|
| Presence | ✅ Live | Digital audit → A–F grade, quick wins, action plan |
| Customers | ✅ Built | Paste contacts + context → personalized outreach emails per contact |
| Operations | 🔨 In progress | Schema, worker scaffold, scheduling prompt |
| Growth | 📋 Planned | Architecture designed, prompts drafted |
| Capital | 📋 Planned | Grant search prompt designed, worker stub |
| Network | 📋 Planned | Matching algorithm designed |

The Presence module is fully built and deployed. The others have real scaffolding — they're not stubs, they're the first 20% of each module with the architecture decisions already made.

---

## Quick start (Presence module)

```bash
git clone https://github.com/colbysmithcode/main-street-ai
cd main-street-ai/modules/presence/worker
npm install
wrangler secret put ANTHROPIC_API_KEY
wrangler deploy
```

Then open `modules/presence/frontend/index.html`, update the `WORKER_URL`, and deploy:

```bash
wrangler pages deploy modules/presence/frontend/ --project-name main-street-presence
```

Done. You have a live digital health check tool at `your-project.pages.dev`.

---

## Architecture

```
main-street-ai/
├── apps/
│   ├── web/          ← React dashboard (unified UI across all modules)
│   └── api/          ← Central API gateway (auth, routing, rate limiting)
│
├── modules/          ← Six independent AI modules
│   ├── presence/     ← ✅ Built
│   ├── customers/    ← 🔨 In progress
│   ├── operations/   ← 🔨 In progress
│   ├── growth/       ← 📋 Planned
│   ├── capital/      ← 📋 Planned
│   └── network/      ← 📋 Planned
│
├── packages/
│   ├── ai/           ← Shared Claude client, prompt library, response parsers
│   ├── ui/           ← Shared component library
│   └── types/        ← Shared TypeScript types across all modules
│
└── infra/
    ├── d1/           ← Database schema + migrations
    └── kv/           ← KV namespace setup scripts
```

Each module follows the same pattern:
```
modules/[name]/
├── worker/
│   ├── src/index.js  ← Cloudflare Worker (API)
│   └── wrangler.toml
├── frontend/
│   └── index.html    ← Standalone HTML (no build step)
└── prompts/
    └── [name].md     ← System prompt, versioned separately from code
```

Prompts are versioned in Markdown files — not hardcoded strings — so they can be improved without redeploying workers.

---

## Why this is fundable

This platform replaces software that costs small businesses $800–2,000/year in SaaS subscriptions:

| Module replaces | Typical cost |
|---|---|
| Presence (ongoing audit) | BrightLocal: $39/mo |
| Customers (CRM + outreach) | HubSpot Starter: $45/mo |
| Operations (scheduling) | Acuity/Calendly: $16/mo |
| Growth (content + SEO) | Semrush + Buffer: $100/mo |
| Capital (grant finder) | GrantStation: $49/mo |
| Network (business resources) | Chamber memberships: $300/yr |

**Total replaced: ~$2,800/year per organization.**

For a nonprofit running on a shoestring budget, that's a full month of an employee's salary. For a restaurant owner working 70-hour weeks, that's dozens of hours they don't have.

The Anthropic API cost to run all six modules for a typical small business: **under $5/month**.

The model works. The question is deployment scale.

---

## Contributing

This is open source. The most valuable contributions aren't code — they're prompts. If you work with a specific type of organization (faith communities, food businesses, immigrant-owned businesses, rural co-ops) and want to tune the AI advice for that context, the `prompts/` folder in each module is where to start.

See [CONTRIBUTING.md](./CONTRIBUTING.md) for how to add a new module or improve an existing prompt.

---

## License

MIT. Deploy it, fork it, adapt it, build a business on top of it.

---

*Built by [Colby Smith](https://morethanmomentum.com) · Powered by [Claude AI](https://anthropic.com) · Inspired by what small businesses deserve but rarely get.*

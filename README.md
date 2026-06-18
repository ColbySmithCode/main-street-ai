# Main Street AI

**Free AI tools for the small businesses and nonprofits that can't afford an agency.**

**[→ Try the Digital Health Check (live demo)](https://community-digital-health-check.pages.dev)** — get a grade for your business's online presence in 30 seconds.

---

**An open-source AI operating system for small businesses and nonprofits.**

Large companies have entire departments for marketing, operations, finance, customer outreach, and content. A small business or nonprofit has one person doing all of it — probably the owner, probably evenings and weekends.

Main Street AI gives that one person the leverage of a full team.

Ten AI-powered modules — six for any small organization, four built specifically for nonprofits. One platform. Built on Cloudflare's free tier and the Anthropic API. Deployable in under 10 minutes. Free forever for organizations that need it most.

> **Nonprofit organizations:** See [NONPROFITS.md](NONPROFITS.md) for the full playbook on how each module maps to your specific operational challenges.

---

## The problem

There are **33 million small businesses** and **1.5 million nonprofits** in the United States. Most have no dedicated marketing, no IT department, no grant writer, no development director. Staff are doing five jobs at once — on tight budgets, with no margin for expensive software.

Meanwhile, enterprise companies are deploying AI across every function — cutting research time from hours to seconds, automating donor outreach, generating grant proposals at scale.

The gap is widening. Main Street AI is the attempt to close it.

---

## The ten modules

**For any small organization:**

| Module | What it does |
|---|---|
| 🔍 **Presence** | Digital audit — grade your online presence, get a specific action plan |
| 👥 **Customers** | Write personalized outreach emails to your contact list |
| ⚙️ **Operations** | Appointment scheduling + AI task inbox |
| 📈 **Growth** | Social media content calendar, post generation |
| 💰 **Capital** | Funding strategy — loans, crowdfunding, individual giving |
| 🤝 **Network** | Connect with local peer organizations and mentors |

**Built specifically for nonprofits:**

| Module | What it does |
|---|---|
| 📊 **Impact** | Turn program stats into compelling funder reports and stories |
| 📝 **Grants** | Grant finder + Letter of Intent writer + full proposal assistant |
| 💌 **Donors** | Personalized thank-you letters, tax acknowledgments, lapsed donor win-back |
| 🙋 **Volunteers** | Coordination emails, appreciation messages, hour summary reports |

Each module is independent. Deploy one, or all ten. Each runs on Cloudflare Workers with an Anthropic API key as the only cost — roughly **$4/month** for a typical small nonprofit using all modules.

---

## Current status

| Module | Status | What's built |
|---|---|---|
| Presence | ✅ Live | Digital audit → A–F grade, quick wins, action plan |
| Customers | ✅ Built | Outreach drafting, review response, lead scoring |
| Impact | ✅ Built | Program stats → funder narrative, board summary, social posts |
| Grants | ✅ Built | Grant finder, LOI generator, proposal assistant, budget justification |
| Donors | ✅ Built | Thank-you letters, year-end tax acknowledgments, lapsed donor win-back |
| Volunteers | ✅ Built | Shift outreach, appreciation messages, hour summary reports |
| Operations | 🔨 In progress | Scheduling + task inbox scaffold |
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
├── modules/          ← Ten independent AI modules (six general + four nonprofit)
│   ├── presence/     ← ✅ Built
│   ├── customers/    ← 🔨 In progress
│   ├── operations/   ← 🔨 In progress
│   ├── growth/       ← 📋 Planned
│   ├── capital/      ← 📋 Planned
│   ├── network/      ← 📋 Planned
│   ├── impact/       ← ✅ Built (nonprofit)
│   ├── grants/       ← ✅ Built (nonprofit)
│   ├── donors/       ← ✅ Built (nonprofit)
│   └── volunteers/   ← ✅ Built (nonprofit)
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

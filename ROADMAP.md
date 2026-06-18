# Roadmap — Main Street AI

## Phase 1 — Foundation (Complete)

**Goal:** Prove the model works. One module, live, free, useful.

The Presence module is fully built and deployed. It produces a real, specific, actionable digital audit in ~30 seconds for any organization type in any city. It's been tested on restaurants, nonprofits, service businesses, and faith organizations. The output is consistently specific enough to be useful without being overwhelming.

**What Phase 1 proved:**
- The prompt architecture works (structured JSON output, enforced schema, org-type specificity)
- The Cloudflare Workers + Claude Haiku cost model is sustainable ($0.001–0.003 per audit)
- The frontend UX is accessible to non-technical users
- The "no signup, no account, nothing stored" model is the right privacy posture

---

## Phase 2 — Customer Module (In Progress, ~2 months remaining)

**Goal:** Help businesses find and keep customers with zero marketing background required.

### What's built
- Worker scaffold with route structure
- D1 schema for customer records and outreach history
- Outreach prompt (tested, generates personalized emails in ~10 seconds)
- Review response generator (draft a professional response to any review, any tone)

### What's left
- Review monitoring integration (Google Business Profile API)
- Follow-up sequence scheduler (store → Cloudflare Queues → send at intervals)
- Simple contact list import (CSV → D1)
- Frontend for outreach dashboard

### Technical decisions already made
- **No email sending built-in** — the module generates drafts and puts them in a queue. Users send from their own email. This avoids SMTP configuration complexity for non-technical users and eliminates deliverability liability.
- **Review responses are drafts, not auto-posts** — auto-responding to reviews is a reputation risk. Human review before posting is a feature, not a limitation.
- **D1 for contacts, KV for queued outreach** — D1 handles structured query needs (filter by last contacted, sort by score); KV handles the fast-read queue pop pattern.

```
modules/customers/
├── worker/src/
│   ├── index.js          ← router (Hono)
│   ├── routes/
│   │   ├── outreach.js   ← POST /outreach/draft, POST /outreach/queue
│   │   ├── reviews.js    ← GET /reviews, POST /reviews/respond
│   │   └── contacts.js   ← GET/POST /contacts, POST /contacts/import
│   └── lib/
│       ├── scorer.js     ← lead scoring logic
│       └── queue.js      ← outreach queue helpers
├── prompts/
│   ├── outreach.md       ← personalized email prompt (versioned)
│   ├── review-response.md ← review response prompt
│   └── lead-score.md     ← scoring criteria prompt
└── frontend/
    └── index.html        ← (planned)
```

---

## Phase 3 — Operations Module (~3 months)

**Goal:** Give business owners back 5–10 hours per week on scheduling, invoicing, and routine communication.

### Planned capabilities
- **Smart scheduling** — natural language appointment booking ("schedule a 45-minute call sometime next week") via D1-backed calendar + AI availability parsing
- **Invoice generation** — describe the work in plain English, get a formatted invoice PDF
- **Communication templates** — appointment reminders, follow-ups, cancellation handling — AI-generated, human-approved
- **Task inbox** — capture loose tasks in natural language, AI categorizes and prioritizes

### Key technical challenge
The Operations module requires the most stateful infrastructure of any module — calendars, invoice records, task queues. The design uses:
- D1 for appointments, invoices, and tasks
- KV for fast session/draft state
- Cloudflare Queues for scheduled reminders
- Cron Triggers for daily digest generation

### Why this is hard
Scheduling is a deceptively complex NLP problem. "Next week sometime" means something different to a restaurant (they want a specific day/time within business hours) vs. a consultant (any time works, including evenings). The prompt architecture needs to be aware of business type, hours, and timezone — all of which live in a shared `org_profile` table seeded during onboarding.

---

## Phase 4 — Growth Module (~3 months)

**Goal:** Consistent, specific content and SEO execution without a marketing team.

### Planned capabilities
- **Weekly content calendar** — generated every Monday, tailored to org type and recent activity
- **Post drafts** — platform-specific (Facebook, Instagram, Google Posts) with appropriate length, tone, hashtags
- **SEO gap finder** — "what are people searching for in your city that you're invisible for?"
- **Local keyword tracker** — monthly snapshot of rankings for 10 target phrases
- **Google Business Profile optimizer** — specific suggestions for photos, posts, Q&A, attributes

### Technical note on content generation
The Growth module uses claude-sonnet-4-6 (not Haiku) for content drafts — the quality difference in creative writing is significant enough to justify the cost. Each generated piece is stored in D1 with a `status: draft | approved | published` column. Users review before anything goes anywhere.

---

## Phase 5 — Capital Module (~4 months)

**Goal:** Surface funding opportunities most small businesses and nonprofits don't know exist.

### Planned capabilities
- **Grant finder** — describe your org and mission, get a list of foundations accepting applications this quarter that match your work
- **Grant readiness scorer** — "how strong is your application for this grant? what's missing?"
- **Loan readiness assessment** — plain-English assessment of SBA loan eligibility and what to strengthen
- **Cash flow forecaster** — describe your seasonal patterns, get a 6-month projection and a flag if a rough month is coming
- **Financial jargon translator** — paste any financial document, get plain-English explanation

### Why this is the highest-impact module
A single successful grant application can change the trajectory of a nonprofit. Most nonprofits leave grant money on the table not because they don't qualify, but because they don't know the grant exists or don't have the bandwidth to find it.

The grant finder is a research problem at its core — it requires web search and synthesis, not just Claude. The implementation plan uses web search to surface current grant databases, Claude to match against org profiles, and a structured output format that includes deadline, eligibility criteria, required documents, and an estimated fit score.

### Technical challenge
Grant databases change constantly. The Capital module's grant finder needs to be fresh, not cached. The design uses Claude with live web search results rather than a static database — which means the quality depends on search result quality and Claude's ability to synthesize them accurately. Hallucination risk is highest in this module; the prompt includes explicit uncertainty instructions and sourcing requirements.

---

## Phase 6 — Network Module (~3 months)

**Goal:** Connect organizations with people and resources that can actually help them.

### Planned capabilities
- **Local resource finder** — SBDC offices, SCORE mentors, community foundations, legal aid, CDFIs — matched to the user's situation
- **Peer matching** — "find me a restaurant owner in my city who's been through what I'm going through"
- **Expert connection** — connect to pro-bono professionals (lawyers, accountants, marketers) via partner organizations
- **Referral network** — businesses that want to refer customers to each other

### Why this is last
The Network module is the only one that can't be solved by AI alone. Software can find and surface connections, but the relationships are human. Building this requires partner organizations — SBDCs, chambers of commerce, community foundations — to opt in and keep their information current. That's a sales and partnership problem, not just a technical one.

The technical architecture is simpler than the other modules. The hard part is the network itself.

---

## Unified Dashboard (ongoing)

The `apps/web/` and `apps/api/` directories contain the unified React dashboard and central API gateway that will eventually tie all six modules together under one login. Current status: designed, not yet built.

The unified dashboard isn't strictly necessary for the modules to work — each module's `frontend/index.html` is standalone. But for an organization using multiple modules, a unified view is important for usability.

Architecture decisions already made:
- Auth: Cloudflare Access (free, zero-config SSO)
- API gateway: Hono.js on a central Worker that proxies to module Workers via Service Bindings
- Database: shared D1 instance with `org_profile` as the central table all modules read from

---

## What would accelerate this

The technical architecture is largely figured out. The main constraints are:

**Time** — six modules is several months of solo development. The biggest acceleration would be additional contributors, especially people with domain expertise in each module's subject area (someone who's done grant writing, someone who's run a small retail business, etc.).

**Testing with real organizations** — every prompt in this platform improves dramatically when tested against a real organization and real feedback. The more diverse the organizations testing it, the better the advice gets.

**Integration partnerships** — the Capital and Network modules especially benefit from partnerships with existing organizations (SBDC, community foundations, local chambers) that can provide data and distribution.

**Deployment infrastructure** — the goal is one-click deployment for non-technical operators (a community foundation that wants to deploy this for their grantees shouldn't need to understand Cloudflare). A deployment UI or one-click Cloudflare Button is on the roadmap.

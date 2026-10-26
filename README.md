# Main Street AI

Free, open-source AI tools for the small businesses and nonprofits that can't afford an agency.

Each tool is a small Cloudflare Worker with a simple web form in front of it. You fill in the form with things like program stats, donor details, or the grant you're going after. Claude writes the draft a small team never has time for: a grant letter, a donor thank-you, a volunteer reminder, a funder report, or a customer email.

## Why I built this

Most small organizations have one or two people handling marketing, fundraising, and operations all at once. The agencies and software that help with that work cost money these groups usually don't have.

I wanted tools that are cheap to run, easy to fork, and simple enough that someone without a tech background can use the output right away. Everything runs on Cloudflare Workers plus an Anthropic API key. There's no build step and no framework to learn.

## What's in here

| Module | What it does | Status |
|---|---|---|
| **Grants** | Suggests grants an organization is a good fit for, drafts a Letter of Intent, and drafts one proposal section at a time | Built |
| **Donors** | Writes thank-you letters, year-end tax acknowledgment letters, and win-back letters for lapsed donors. It can also batch a thank-you for every donor on a list | Built |
| **Volunteers** | Writes recruitment messages, shift reminders, and appreciation notes, plus a volunteer-hours summary for grant reports | Built |
| **Impact** | Turns raw program numbers into six formats: funder report, board summary, social post, newsletter paragraph, cost-per-outcome, and a headline | Built |
| **Customers** | Drafts outreach emails and replies to customer reviews, and scores leads | In progress |
| **Operations** | Turns plain-English requests into appointment details, invoices, prioritized task lists, and routine messages. It has no web form yet | In progress |

Every module except Operations has a single-file web form in its `frontend` folder.

## How it works

```
Web form (frontend/index.html)
   │  POST JSON
   ▼
Cloudflare Worker (Hono router)
   │  loads the system prompt from the module's prompts/ folder
   ▼
Claude API  ──►  JSON back to the form, rendered as a ready-to-use draft
```

- **Prompts live in their own files** in each module's `prompts` folder, separate from the routing code, so they can be improved on their own.
- **Model choice is per task.** Short, fast jobs use Claude Haiku 4.5. Long-form writing like grant letters and donor letters uses Claude Sonnet 4.6.
- **Nothing is saved yet.** Every request is generated fresh. A database schema for org profiles, contacts, tasks, and grant tracking is in `infra/d1` for when storage gets added.

## Stack

| Layer | Technology |
|---|---|
| Backend | Cloudflare Workers, one per module |
| Routing | Hono |
| AI | Anthropic Claude (Haiku 4.5 and Sonnet 4.6) |
| Frontend | Plain HTML, CSS, and JavaScript, one file per module |
| Database | Cloudflare D1 schema, not wired in yet |
| Tooling | Wrangler (Cloudflare's CLI) |

## Run it locally

You need Node.js 18 or newer and an Anthropic API key. You only need a Cloudflare account if you want to deploy.

This example runs the Grants module. Swap `grants` for any other module name.

```bash
git clone https://github.com/colbysmithcode/main-street-ai
cd main-street-ai/modules/grants/worker
npm install
cp ../../../.dev.vars.example .dev.vars   # then paste your Anthropic key into .dev.vars
npx wrangler dev
```

The worker starts at `http://localhost:8787`. Check that it's up:

```bash
curl http://localhost:8787/health
```

Then open `modules/grants/frontend/index.html`, set `WORKER_URL` in the file's script section to `http://localhost:8787`, and open the file in your browser.

## Deploy your own

From inside a module's `worker` folder:

```bash
npx wrangler d1 create main-street-ai        # paste the database_id it prints into wrangler.toml
npx wrangler secret put ANTHROPIC_API_KEY
npx wrangler deploy
```

Update `WORKER_URL` in that module's `frontend/index.html` to the URL `wrangler deploy` printed. Then publish the form:

```bash
npx wrangler pages deploy ../frontend --project-name main-street-grants
```

## Project layout

```
main-street-ai/
├── modules/
│   ├── grants/        worker/  prompts/  frontend/
│   ├── donors/        worker/  prompts/  frontend/
│   ├── volunteers/    worker/  prompts/  frontend/
│   ├── impact/        worker/  prompts/  frontend/
│   ├── customers/     worker/  prompts/  frontend/
│   └── operations/    worker/
├── packages/
│   ├── ai/            shared Claude helper (the workers currently call the API directly)
│   └── types/         shared TypeScript types
├── infra/d1/          database schema
├── VISION.md          why this exists and where it's headed
└── ROADMAP.md         what's planned next
```

## Contributing

The most useful contributions are usually prompts, not code. If you work with a specific kind of organization and want the drafts to sound right for it, each module's `prompts` folder is the place to start. Pull requests are welcome.

## License

MIT. See [LICENSE](LICENSE).

---

Built by [Colby Smith](https://github.com/colbysmithcode).

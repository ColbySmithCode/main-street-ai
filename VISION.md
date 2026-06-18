# Vision — Main Street AI

## The inequality this addresses

When a Fortune 500 company wants to know if their website is performing, they hire a digital agency. When they want to reach new customers, they run a $50,000 ad campaign with a dedicated strategist. When their cash flow looks uncertain, a CFO builds a model. When they need to hire, an HR department writes the job descriptions and screens the resumes.

None of this is available to a nonprofit food bank director juggling 12 things at once. Or to a second-generation restaurant owner who inherited a business but not a marketing team. Or to the woman who just opened a daycare and has no idea why Google doesn't show her when parents search "daycare near me."

These organizations serve real people. They create real value. They are the backbone of local economies and communities. And they have been systematically excluded from tools that compound advantage over time.

AI is about to make this gap much, much wider — unless someone actively works to prevent it.

## What "AI for everyone" actually means

It's easy to say AI should benefit everyone. It's harder to build the thing that makes it true.

The challenge is specificity. A nonprofit director doesn't want "AI assistance" — she wants to know exactly what her Google Business Profile is missing and what to type in to fix it. A plumber doesn't want a "content strategy" — he wants three post ideas for this week that will make people trust him before they call.

Generic AI tools produce generic advice. Main Street AI is built on the premise that **specificity is the product**. Every output — every audit, every recommendation, every draft — is tailored to the exact organization type, city, and situation. A restaurant in rural Montana gets different advice than a nonprofit in Atlanta. That specificity is what makes the advice actionable instead of overwhelming.

## The compounding problem we're trying to solve

Digital presence isn't a one-time problem. It's a continuous one. A business that doesn't update its Google Business Profile eventually gets buried by competitors that do. A nonprofit that posts inconsistently loses followers to ones that don't. A retailer whose website loads slowly loses sales to whoever loads faster.

The businesses that can afford agencies have someone watching these things constantly. The businesses that can't afford agencies have no one watching them at all — until something breaks badly enough to notice.

Main Street AI is built to be persistent. The Presence module doesn't just audit once — it monitors. The Growth module doesn't just suggest a content calendar — it helps you fill it every week. The Capital module doesn't just find one grant — it tracks deadlines and surfaces new opportunities as they open.

This is the difference between a one-time checkup and a health system.

## Why Claude specifically

Every module in this platform runs on Claude. That's not an accident.

The quality of AI advice for small businesses depends entirely on the quality of reasoning behind it. Generic pattern-matching produces generic advice. Claude's ability to reason about specific situations — to understand that a rural hardware store has different SEO opportunities than an urban yoga studio, that a faith organization has different content goals than a food truck — is what makes the advice actually useful.

Beyond that, Claude's safety and honesty properties matter more here than in most contexts. The organizations using Main Street AI are making real decisions with real consequences. They don't need AI that confidently makes things up. They need AI that says "I'm not sure about this specific local factor, here's how to verify" — and Claude does that.

## The deployment model

Main Street AI is free to deploy and free to use. The only cost is the Anthropic API key — which runs to a few dollars a month for typical usage.

This isn't a freemium model with a paid tier waiting. It's a genuine attempt to make these tools universally available by making the deployment cost negligible and the code open.

The vision is a network of locally-deployed instances: community foundations running it for their grantees, chambers of commerce running it for their members, economic development organizations running it for businesses they're trying to support, individual volunteers running it for organizations in their neighborhood.

The platform is one thing. The deployment network is another. Both are needed.

## The six-module roadmap and why this order

**Presence first** because you can't improve what you can't measure. Before a business does anything else, it needs an honest assessment of where it stands. This is the foundation all other advice builds on.

**Customers second** because revenue is existential. A business that can't find new customers doesn't survive long enough to benefit from the other modules. Outreach automation, review management, and follow-up are survival tools.

**Operations third** because time is the most constrained resource for a small business owner. Every hour saved on scheduling, invoicing, and routine communication is an hour that can go toward actually running the business.

**Growth fourth** because once the business is stable, it can think about scale. Content calendars, SEO guidance, and social media are leverage — they compound over time, but only if you have the bandwidth to execute them.

**Capital fifth** because access to funding is transformative but requires significant research investment. The Capital module's grant finder, loan readiness scorer, and cash flow forecaster turn a months-long research project into an afternoon.

**Network last** because the hardest problem is the one that can't be solved by software alone. Connecting businesses with local mentors, peer organizations, and community resources requires relationships. The Network module can find and facilitate those connections, but the relationships themselves are human.

## What success looks like

In five years, a nonprofit director in a mid-sized American city can open Main Street AI, describe her organization, and get: a real assessment of her digital presence, three outreach campaigns she can run this month, a shortlist of grants she qualifies for with deadlines, and two introductions to peer organizations who've solved problems similar to hers.

In five years, a restaurant owner whose grandfather opened the business doesn't have to choose between keeping the kitchen running and learning how to reach new customers. He has a system that handles the second while he focuses on the first.

In five years, the gap between businesses that can afford agencies and businesses that can't is narrower than it is today.

That's the goal. This is the start.

## Connection to the existing work

The other four repositories in this portfolio aren't side projects — they're production tools built to run a real digital marketing agency. Each one solved a specific operational problem:

- **mtm-automation-system**: Reduced client onboarding from 90 minutes to 4 minutes using Cloudflare Workers and AI-generated websites
- **outpace-social-scheduler**: Built a full social scheduling system on Cloudflare's free tier instead of paying $99/month for a SaaS
- **mtm-tools-dashboard**: 11 AI-powered tools for prospect research, content generation, and meeting intelligence
- **community-digital-health-check**: The Presence module, now live and deployed

Main Street AI takes what those tools proved — that a single developer can build production-quality AI infrastructure on zero infrastructure cost — and turns it toward the organizations that need it most. The architecture is the same. The beneficiaries are different.

## What a year of focused development could produce

**Month 1–2:** Finish the Operations module. Launch the unified multi-module dashboard. Onboard 50 beta organizations.

**Month 3–4:** Build the Capital module (grant finder + loan readiness). Partner with 3–5 nonprofit support organizations to drive adoption. Reach 200 active organizations.

**Month 5–8:** Build Growth and Network modules. Open the self-hosting toolkit with one-click deploy. Reach 1,000 organizations across at least 10 cities.

**Month 9–12:** Community maintenance model. Documentation and training for volunteer developers who want to deploy for their cities. Handoff to community stewardship.

The goal isn't to build a startup. It's to build something that still runs and helps people five years from now — regardless of who's maintaining it.

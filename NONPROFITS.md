# Main Street AI — Nonprofit Playbook

This document explains how Main Street AI is designed for nonprofits — why we built what we built, what problem each module solves, and how it maps to the real operational challenges these organizations face.

---

## Who this is for

Claude Corps is placing fellows at organizations like the International Rescue Committee, YMCA, food banks, Code for America, Reef Environmental Education Foundation, Team Red White & Blue, and hundreds of others across sectors including:

- Food security and hunger relief
- Workforce development and job training
- Housing and homelessness services
- Legal aid and immigration services
- Environmental conservation
- Veterans support
- Youth education and mentorship
- Public health and mental health
- Community development

What these organizations have in common: they serve people who need them, they run on tight budgets, and their staff — often one or two people — are doing the work of five. They can't afford an agency. They don't have a marketing team. They don't have a development director with grant writing experience. They have passion and not enough hours.

Main Street AI is built for exactly those people.

---

## The four nonprofit-specific modules

### 1. Impact — Turn your work into a story funders can fund

**The problem:** A food bank served 12,400 meals last quarter. A job training program placed 34 people in employment. A youth mentorship org logged 8,000 volunteer hours. The people running these programs know their impact — but turning those numbers into a compelling funder report, a board presentation, or a grant narrative takes writing skill and hours they don't have.

**What Impact does:**
- Takes raw program stats (meals served, people helped, volunteer hours, dollars distributed)
- Adds context from the org profile (mission, community, geography)
- Returns a compelling impact narrative in multiple formats: funder report section, board summary, social media post, newsletter blurb, grant progress report
- Generates specific beneficiary stories from program notes
- Calculates cost-per-outcome metrics that funders look for

**Claude model:** Sonnet — quality writing requires the stronger model.

**Who needs this most:** Any nonprofit that submits grant reports, writes annual reports, communicates with donors, or presents to a board. That's every nonprofit.

---

### 2. Grants — Write competitive grant applications without a grant writer

**The problem:** Grant writing is a specialized skill that takes years to develop. Small nonprofits either can't afford a grant writer ($80–150/hr), submit weak proposals because staff write them between other duties, or simply don't apply for grants they'd likely win because the process is too daunting.

The grant landscape in 2026 is also increasingly complex: federal grants require specific narrative sections, foundations want evidence-based program descriptions, and every application uses slightly different terminology for the same concepts.

**What Grants does:**
- **Grant Finder:** Given an org profile (type, mission, location, population served, budget size), searches and ranks grants the org likely qualifies for — foundation grants, government grants, corporate giving programs
- **LOI Generator:** Given a funder name + grant description, drafts a complete Letter of Intent in the funder's language, tailored to the org's profile
- **Proposal Assistant:** Structured walkthrough of common grant application sections — organization overview, statement of need, program description, evaluation plan, budget narrative — with AI drafting each section
- **Budget Justification Writer:** Takes a program budget and writes the narrative explanation funders require

**Claude model:** Sonnet for LOI and proposals (quality matters here — a weak LOI costs real money). Haiku for grant search and initial research.

**Who needs this most:** Every nonprofit that depends on grants. That is most nonprofits. Grant revenue is the primary funding source for 73% of nonprofits with budgets under $1M.

---

### 3. Donors — Build real relationships with every donor, at any scale

**The problem:** Personalized donor stewardship — the kind that makes donors feel seen and valued — is what turns one-time donors into recurring donors and recurring donors into major gift prospects. But a 2-person nonprofit staff can't hand-write 400 thank-you letters or remember which donor gave in memory of their late husband or which first-time donor came through the gala.

**What Donors does:**
- **Thank-You Letter Generator:** Personalized acknowledgment letters that reference the specific gift, the impact it enables, and any context the org has about the donor
- **Year-End Tax Acknowledgment:** IRS-compliant acknowledgment letters for all donors, personalized by gift history, generated in batch
- **Lapsed Donor Win-Back:** For donors who haven't given in 12+ months — personalized re-engagement letters that reference their history with the org
- **Major Gift Cultivation:** For donors above a threshold, draft personalized updates, invitations, and stewardship touchpoints
- **Donor Anniversary Recognition:** Auto-generate recognition for "donor anniversaries" (first gift X years ago, etc.)

**Claude model:** Haiku (volume — potentially hundreds of letters at once) with Sonnet fallback for major gift correspondence.

**Who needs this most:** Any organization that accepts donations. The difference between a 20% and 40% donor retention rate compounds dramatically over years.

---

### 4. Volunteers — Coordinate, appreciate, and retain your volunteer base

**The problem:** Volunteers are essential infrastructure for most nonprofits, but they're also the hardest resource to manage. They have unpredictable schedules. They need training. They burn out. They need to feel valued or they stop showing up. And the staff member coordinating volunteers is usually doing it alongside three other jobs.

**What Volunteers does:**
- **Shift Outreach:** Draft recruitment messages for open volunteer shifts, personalized by volunteer history and availability patterns
- **Reminder System:** Automated (or copy-paste-ready) reminder messages for upcoming shifts
- **Appreciation Messages:** Personalized thank-you notes for individual volunteers, milestone celebrations (100th hour, 1-year anniversary), and group appreciation posts
- **Hour Summary Reports:** Turn volunteer time logs into a formatted report for grant applications or board presentations (grantors often require volunteer hour documentation)
- **Volunteer Recruitment Campaigns:** Draft social media posts and email campaigns to recruit volunteers for specific events or skills gaps

**Claude model:** Haiku for volume messages. Sonnet for milestone and appreciation content where quality matters.

**Who needs this most:** Organizations with large volunteer bases — food banks, environmental orgs, event-based nonprofits, faith communities.

---

## How the modules connect

Main Street AI is designed around a single org profile. When an organization onboards, they provide:

- Name, city, type, mission statement
- Population served
- Annual budget range
- Primary programs
- Current team size

Every module reads from this profile. The Grants module knows what programs to write about. The Impact module knows the right language for the mission. The Donors module personalizes letters with the org's story. The Volunteers module recruits for the right cause.

This is the difference between a tool that helps once and a platform that compounds over time.

---

## Cost to run this for a nonprofit

The only cost is the Anthropic API. Here's what it costs for a typical small nonprofit ($500K budget, 2 staff, 50 volunteers, 300 donors, 5 grant applications/year):

| Module | Typical monthly usage | Est. Claude API cost |
|---|---|---|
| Presence | 1 audit/month | < $0.10 |
| Impact | 4 reports/month | ~$0.50 |
| Grants | 2 LOIs + 1 proposal/month | ~$1.50 |
| Donors | 30 thank-you letters + 1 batch year-end | ~$1.00 |
| Volunteers | 20 coordination messages/month | ~$0.30 |
| Growth | 15 social posts/month | ~$0.40 |
| Operations | 50 tasks managed | ~$0.20 |

**Total: ~$4/month per organization.**

For a community foundation wanting to offer this to all of its grantees, the cost is trivial. For a developer deploying this for their city, it's negligible.

---

## What a Claude Corps fellow could do with this

A Claude Corps fellow placed at a food bank with Main Street AI could:

**Week 1–2:** Run the Presence audit, identify gaps in their Google Business Profile and website, implement the quick wins.

**Month 1:** Set up the Impact module with the food bank's program data. Train staff to generate monthly funder reports in 10 minutes instead of 4 hours.

**Month 2:** Run the Grants module to identify 10 grants the food bank qualifies for that they haven't applied to. Draft 3 LOIs. Submit 2.

**Month 3–4:** Set up Donors module for their 400-donor file. Implement personalized thank-you letters. Watch retention improve.

**Month 5+:** Volunteer module, Growth module, Operations improvements.

**End of year:** The food bank has AI-assisted systems running that will continue after the fellow leaves. Not a dependency — a capability.

---

## Open source, always

Every line of code is MIT licensed. A Claude Corps fellow can:
- Fork it and customize it for their specific host organization
- Add new modules for their org's unique needs
- Contribute improvements back to the main repo
- Self-host it on Cloudflare (free tier covers all but the largest orgs)

This isn't a product that requires an ongoing subscription. It's infrastructure that belongs to the organizations using it.

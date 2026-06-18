/**
 * Main Street AI — Donors Module
 *
 * Personalized donor communications at any scale: thank-you letters,
 * IRS-compliant year-end tax acknowledgments, lapsed-donor win-backs,
 * and batch thank-yous.
 *
 * Routes:
 *   GET  /health             → liveness check
 *   POST /thank-you          → single thank-you letter (Sonnet)
 *   POST /tax-acknowledgment → IRS-compliant acknowledgment (Sonnet)
 *   POST /win-back           → lapsed donor re-engagement letter (Sonnet)
 *   POST /batch-thank-you    → one letter per donor in a list (Haiku)
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { donorLettersPrompt } from '../../prompts/donor-letters.js';

const SONNET = 'claude-sonnet-4-6';
const HAIKU = 'claude-haiku-4-5-20251001';

const app = new Hono();

app.use('*', cors({ origin: '*', allowMethods: ['GET', 'POST', 'OPTIONS'] }));

// Health check
app.get('/health', (c) => c.json({ status: 'ok', module: 'donors' }));

/**
 * POST /thank-you
 * Body: { org_name, org_type, mission, ein?, donor_name, gift_amount, gift_date,
 *         gift_type, what_gift_enables, donor_history? }
 */
app.post('/thank-you', async (c) => {
  const body = await c.req.json().catch(() => null);
  if (!body?.org_name || !body?.donor_name) {
    return c.json({ error: 'org_name and donor_name are required' }, 400);
  }

  const result = await callClaude(c.env, {
    model: SONNET,
    system: donorLettersPrompt,
    user: `Write a warm, specific thank-you letter (not a tax receipt).

Organization: ${body.org_name} (${body.org_type || 'nonprofit'})
Mission: ${body.mission || 'not provided'}
${body.ein ? `EIN: ${body.ein}` : ''}
Donor: ${body.donor_name}
Gift: ${body.gift_amount || 'a gift'} (${body.gift_type || 'cash'}) on ${body.gift_date || 'recently'}
What this gift makes possible: ${body.what_gift_enables || 'not specified — connect it to the mission'}
This donor's history with us: ${body.donor_history || 'not provided'}

Return only valid JSON matching the schema in the system prompt.`,
  });

  if (result.error) return c.json({ error: result.error }, 502);
  return c.json(result.data);
});

/**
 * POST /tax-acknowledgment
 * Body: { org_name, ein, org_address, donor_name, donor_address, gift_amount,
 *         gift_date, gift_type, goods_or_services_provided }
 */
app.post('/tax-acknowledgment', async (c) => {
  const body = await c.req.json().catch(() => null);
  if (!body?.org_name || !body?.donor_name || !body?.gift_amount) {
    return c.json({ error: 'org_name, donor_name, and gift_amount are required' }, 400);
  }

  const result = await callClaude(c.env, {
    model: SONNET,
    system: donorLettersPrompt,
    user: `Write an IRS-compliant year-end tax acknowledgment letter. Accuracy matters.

Organization: ${body.org_name}
EIN: ${body.ein || 'NOT PROVIDED — note that the org should add it'}
Organization address: ${body.org_address || 'not provided'}
Donor: ${body.donor_name}
Donor address: ${body.donor_address || 'not provided'}
Gift amount: ${body.gift_amount}
Gift date: ${body.gift_date || 'not provided'}
Gift type: ${body.gift_type || 'cash'}
Goods or services provided in exchange: ${body.goods_or_services_provided || 'None'}

Required: state the gift amount and date, and explicitly state whether any goods or services were provided in exchange (if none, say so in the IRS-required language; if some, state their fair market value). Include the EIN if provided.
Return only valid JSON matching the schema in the system prompt.`,
  });

  if (result.error) return c.json({ error: result.error }, 502);
  return c.json(result.data);
});

/**
 * POST /win-back
 * Body: { org_name, org_type, mission, donor_name, last_gift_amount,
 *         last_gift_date, what_has_happened_since }
 */
app.post('/win-back', async (c) => {
  const body = await c.req.json().catch(() => null);
  if (!body?.org_name || !body?.donor_name) {
    return c.json({ error: 'org_name and donor_name are required' }, 400);
  }

  const result = await callClaude(c.env, {
    model: SONNET,
    system: donorLettersPrompt,
    user: `Write a lapsed-donor win-back letter. Be honest and personal — acknowledge the time that's passed, don't guilt-trip.

Organization: ${body.org_name} (${body.org_type || 'nonprofit'})
Mission: ${body.mission || 'not provided'}
Donor: ${body.donor_name}
Their last gift: ${body.last_gift_amount || 'unknown'} on ${body.last_gift_date || 'a while ago'}
What's happened since they last gave: ${body.what_has_happened_since || 'not provided — keep it warm and specific to the mission'}

Make a specific ask. Return only valid JSON matching the schema in the system prompt.`,
  });

  if (result.error) return c.json({ error: result.error }, 502);
  return c.json(result.data);
});

/**
 * POST /batch-thank-you
 * Body: { org_name, org_type, mission, donors: [{ name, amount, date, notes }] }
 * Returns: { letters: [{ donor, letter, subject_line, p_s, personalization_notes }] }
 * Uses Haiku — these are volume communications.
 */
app.post('/batch-thank-you', async (c) => {
  const body = await c.req.json().catch(() => null);
  if (!body?.org_name || !Array.isArray(body.donors) || body.donors.length === 0) {
    return c.json({ error: 'org_name and a non-empty donors array are required' }, 400);
  }

  const letters = [];
  for (const d of body.donors) {
    const result = await callClaude(c.env, {
      model: HAIKU,
      maxTokens: 1024,
      system: donorLettersPrompt,
      user: `Write a brief, warm, specific thank-you letter.

Organization: ${body.org_name} (${body.org_type || 'nonprofit'})
Mission: ${body.mission || 'not provided'}
Donor: ${d.name || 'Friend'}
Gift: ${d.amount || 'a gift'} on ${d.date || 'recently'}
Notes about this donor: ${d.notes || 'none'}

Return only valid JSON matching the schema in the system prompt.`,
    });
    letters.push(
      result.error
        ? { donor: d.name || '', error: result.error }
        : { donor: d.name || '', ...result.data }
    );
  }

  return c.json({ letters });
});

// ─── Shared Claude helper ──────────────────────────────────────────────────

async function callClaude(env, { system, user, model = SONNET, maxTokens = 1500 }) {
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens: maxTokens,
        system,
        messages: [{ role: 'user', content: user }],
      }),
    });

    if (!res.ok) {
      console.error('Anthropic error:', res.status, await res.text());
      return { error: 'AI service temporarily unavailable' };
    }

    const data = await res.json();
    const raw = data?.content?.[0]?.text || '';
    const cleaned = raw.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();

    try {
      return { data: JSON.parse(cleaned) };
    } catch {
      console.error('JSON parse failed:', raw);
      return { error: 'Failed to parse AI response' };
    }
  } catch (err) {
    console.error('Fetch failed:', err?.message);
    return { error: 'Network error' };
  }
}

export default app;

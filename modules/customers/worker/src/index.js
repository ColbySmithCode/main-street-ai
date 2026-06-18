/**
 * Main Street AI — Customers Module
 *
 * Routes:
 *   POST /outreach/draft    → Generate personalized outreach email
 *   POST /reviews/respond   → Draft a response to a customer review
 *   POST /contacts/score    → Score a lead by likelihood to convert
 *
 * Status: In progress — draft generation and review response are functional.
 *         Contact storage and outreach queue coming in next sprint.
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { outreachPrompt } from '../../../prompts/outreach.js';
import { reviewResponsePrompt } from '../../../prompts/review-response.js';
import { leadScorePrompt } from '../../../prompts/lead-score.js';

const app = new Hono();

app.use('*', cors({ origin: '*', allowMethods: ['GET', 'POST', 'OPTIONS'] }));

// Health check
app.get('/health', (c) => c.json({ status: 'ok', module: 'customers' }));

/**
 * POST /outreach/draft
 *
 * Body: {
 *   business_name: string,      // who you're reaching out to
 *   business_type: string,      // "restaurant", "contractor", etc.
 *   your_name: string,
 *   your_org: string,
 *   reason: string,             // why you're reaching out
 *   tone: "warm" | "professional" | "casual"
 * }
 *
 * Returns: { subject: string, body: string, follow_up_timing: string }
 */
app.post('/outreach/draft', async (c) => {
  const body = await c.req.json().catch(() => null);
  if (!body?.business_name || !body?.reason) {
    return c.json({ error: 'business_name and reason are required' }, 400);
  }

  const result = await callClaude(c.env, {
    system: outreachPrompt,
    user: `Draft an outreach email with these details:
Business I'm reaching out to: ${body.business_name} (${body.business_type || 'small business'})
My name: ${body.your_name || 'not provided'}
My organization: ${body.your_org || 'not provided'}
Reason for outreach: ${body.reason}
Tone: ${body.tone || 'warm'}

Return only valid JSON matching the schema in the system prompt.`,
  });

  if (result.error) return c.json({ error: result.error }, 502);
  return c.json(result.data);
});

/**
 * POST /reviews/respond
 *
 * Body: {
 *   review_text: string,
 *   review_rating: number,      // 1-5
 *   business_name: string,
 *   business_type: string,
 *   tone: "professional" | "warm" | "brief"
 * }
 *
 * Returns: { response: string, approach_explanation: string }
 */
app.post('/reviews/respond', async (c) => {
  const body = await c.req.json().catch(() => null);
  if (!body?.review_text || !body?.business_name) {
    return c.json({ error: 'review_text and business_name are required' }, 400);
  }

  const result = await callClaude(c.env, {
    system: reviewResponsePrompt,
    user: `Draft a response to this customer review:

Business: ${body.business_name} (${body.business_type || 'small business'})
Rating: ${body.review_rating || '?'}/5
Review text: "${body.review_text}"
Preferred tone: ${body.tone || 'warm'}

Return only valid JSON matching the schema in the system prompt.`,
  });

  if (result.error) return c.json({ error: result.error }, 502);
  return c.json(result.data);
});

/**
 * POST /contacts/score
 *
 * Body: {
 *   business_name: string,
 *   business_type: string,
 *   city: string,
 *   what_you_know: string,     // anything you know about this prospect
 *   your_service: string       // what you offer
 * }
 *
 * Returns: { score: 0-100, tier: "hot" | "warm" | "cold", reasoning: string, suggested_approach: string }
 */
app.post('/contacts/score', async (c) => {
  const body = await c.req.json().catch(() => null);
  if (!body?.business_name || !body?.your_service) {
    return c.json({ error: 'business_name and your_service are required' }, 400);
  }

  const result = await callClaude(c.env, {
    system: leadScorePrompt,
    user: `Score this prospect:

Business: ${body.business_name} (${body.business_type || 'unknown type'}) in ${body.city || 'unknown city'}
What I know about them: ${body.what_you_know || 'nothing yet'}
What I'm offering: ${body.your_service}

Return only valid JSON matching the schema in the system prompt.`,
  });

  if (result.error) return c.json({ error: result.error }, 502);
  return c.json(result.data);
});

// ─── Shared Claude helper ──────────────────────────────────────────────────

async function callClaude(env, { system, user }) {
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
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

/**
 * Main Street AI — Impact Module
 *
 * Turns raw program statistics into compelling, human-centered narratives
 * in six formats: funder report, board summary, social post, newsletter
 * paragraph, cost-per-outcome, and a headline.
 *
 * Routes:
 *   GET  /health     → liveness check
 *   POST /narrative  → generate the six-format impact narrative
 *
 * Uses claude-sonnet-4-6 — quality writing is the entire value here.
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { impactNarrativePrompt } from '../../prompts/impact-narrative.js';

const app = new Hono();

app.use('*', cors({ origin: '*', allowMethods: ['GET', 'POST', 'OPTIONS'] }));

// Health check
app.get('/health', (c) => c.json({ status: 'ok', module: 'impact' }));

/**
 * POST /narrative
 *
 * Body: {
 *   org_name: string,
 *   org_type: string,
 *   mission: string,
 *   program_name: string,
 *   stats: { [metric: string]: string | number },
 *   budget_spent?: number,
 *   period: string,            // e.g. "Q3 2026"
 *   context?: string
 * }
 *
 * Returns the six-format narrative JSON described in impactNarrativePrompt.
 */
app.post('/narrative', async (c) => {
  const body = await c.req.json().catch(() => null);
  if (!body?.org_name || !body?.stats || Object.keys(body.stats).length === 0) {
    return c.json({ error: 'org_name and at least one stat are required' }, 400);
  }

  const statsLines = Object.entries(body.stats)
    .filter(([k]) => k && k.trim())
    .map(([metric, value]) => `- ${metric}: ${value}`)
    .join('\n');

  const result = await callClaude(c.env, {
    system: impactNarrativePrompt,
    user: `Turn these program results into compelling narratives.

Organization: ${body.org_name} (${body.org_type || 'nonprofit'})
Mission: ${body.mission || 'not provided'}
Program: ${body.program_name || 'not provided'}
Reporting period: ${body.period || 'not specified'}
Budget spent on this program: ${body.budget_spent ? '$' + body.budget_spent : 'not provided'}

Program statistics:
${statsLines || 'none provided'}

Additional context: ${body.context || 'none'}

Calculate cost_per_outcome from the budget and the most meaningful outcome metric if a budget is provided.
Return only valid JSON matching the schema in the system prompt.`,
  });

  if (result.error) return c.json({ error: result.error }, 502);
  return c.json(result.data);
});

// ─── Shared Claude helper ──────────────────────────────────────────────────

async function callClaude(env, { system, user, model = 'claude-sonnet-4-6', maxTokens = 3000 }) {
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

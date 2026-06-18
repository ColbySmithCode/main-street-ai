/**
 * Main Street AI — Grants Module
 *
 * Three tools in one: find grants the org qualifies for, write a Letter of
 * Intent for a specific grant, and draft a full proposal section by section.
 *
 * Routes:
 *   GET  /health            → liveness check
 *   POST /find              → suggest grants the org is likely to win
 *   POST /loi               → draft a Letter of Intent
 *   POST /proposal-section  → draft one proposal section
 *
 * Uses claude-sonnet-4-6 on every route — grant writing quality is the value.
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { grantFinderPrompt } from '../../prompts/grant-finder.js';
import { loiWriterPrompt } from '../../prompts/loi-writer.js';
import { proposalAssistantPrompt } from '../../prompts/proposal-assistant.js';

const app = new Hono();

app.use('*', cors({ origin: '*', allowMethods: ['GET', 'POST', 'OPTIONS'] }));

// Health check
app.get('/health', (c) => c.json({ status: 'ok', module: 'grants' }));

/**
 * POST /find
 * Body: { org_name, org_type, mission, location, population_served, annual_budget, programs }
 * Returns: grant list JSON (see grantFinderPrompt)
 */
app.post('/find', async (c) => {
  const body = await c.req.json().catch(() => null);
  if (!body?.org_name || !body?.org_type) {
    return c.json({ error: 'org_name and org_type are required' }, 400);
  }

  const result = await callClaude(c.env, {
    system: grantFinderPrompt,
    maxTokens: 4096,
    user: `Find grants this organization is realistically likely to qualify for and win:

Organization: ${body.org_name} (${body.org_type})
Mission: ${body.mission || 'not provided'}
Location: ${body.location || 'not provided'}
Who they serve: ${body.population_served || 'not provided'}
Annual budget: ${body.annual_budget || 'not provided'}
Primary programs: ${body.programs || 'not provided'}

Return only valid JSON matching the schema in the system prompt.`,
  });

  if (result.error) return c.json({ error: result.error }, 502);
  return c.json(result.data);
});

/**
 * POST /loi
 * Body: { org_name, org_type, mission, location, funder_name, grant_name,
 *         grant_description, amount_requested, program_description, org_strengths }
 * Returns: LOI sections JSON (see loiWriterPrompt)
 */
app.post('/loi', async (c) => {
  const body = await c.req.json().catch(() => null);
  if (!body?.org_name || !body?.funder_name || !body?.grant_name) {
    return c.json({ error: 'org_name, funder_name, and grant_name are required' }, 400);
  }

  const result = await callClaude(c.env, {
    system: loiWriterPrompt,
    maxTokens: 4096,
    user: `Write a Letter of Intent with these details:

Organization: ${body.org_name} (${body.org_type || 'nonprofit'})
Mission: ${body.mission || 'not provided'}
Location: ${body.location || 'not provided'}
Funder: ${body.funder_name}
Grant: ${body.grant_name}
Funder's grant description / RFP language: ${body.grant_description || 'not provided'}
Amount requested: ${body.amount_requested || 'not specified'}
What the program does: ${body.program_description || 'not provided'}
Our relevant strengths: ${body.org_strengths || 'not provided'}

Mirror the funder's language where appropriate. Return only valid JSON matching the schema in the system prompt.`,
  });

  if (result.error) return c.json({ error: result.error }, 502);
  return c.json(result.data);
});

/**
 * POST /proposal-section
 * Body: { org_name, org_type, mission, section, context }
 * Returns: section draft JSON (see proposalAssistantPrompt)
 */
app.post('/proposal-section', async (c) => {
  const body = await c.req.json().catch(() => null);
  if (!body?.org_name || !body?.section) {
    return c.json({ error: 'org_name and section are required' }, 400);
  }

  const result = await callClaude(c.env, {
    system: proposalAssistantPrompt,
    maxTokens: 3000,
    user: `Draft this grant proposal section: "${body.section}"

Organization: ${body.org_name} (${body.org_type || 'nonprofit'})
Mission: ${body.mission || 'not provided'}
Context for this section: ${body.context || 'none provided'}

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

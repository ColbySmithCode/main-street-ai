/**
 * Main Street AI — Volunteers Module
 *
 * Recruit, coordinate, and retain volunteers through personalized,
 * AI-written communications.
 *
 * Routes:
 *   GET  /health      → liveness check
 *   POST /recruit     → recruitment message for a shift/role
 *   POST /remind      → shift reminder with logistics
 *   POST /appreciate  → appreciation / milestone recognition
 *   POST /hour-report → grant-ready volunteer hours report
 *
 * Uses claude-haiku-4-5-20251001 on every route — these are volume messages.
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { volunteerCommsPrompt } from '../../prompts/volunteer-comms.js';

const HAIKU = 'claude-haiku-4-5-20251001';
const DEFAULT_HOURLY_VALUE = 29.95; // Independent Sector 2026 value of volunteer time

const app = new Hono();

app.use('*', cors({ origin: '*', allowMethods: ['GET', 'POST', 'OPTIONS'] }));

// Health check
app.get('/health', (c) => c.json({ status: 'ok', module: 'volunteers' }));

/**
 * POST /recruit
 * Body: { org_name, org_type, mission, shift_date, shift_time, location,
 *         role_description, skills_needed, contact_name }
 */
app.post('/recruit', async (c) => {
  const body = await c.req.json().catch(() => null);
  if (!body?.org_name || !body?.role_description) {
    return c.json({ error: 'org_name and role_description are required' }, 400);
  }

  const result = await callClaude(c.env, {
    system: volunteerCommsPrompt,
    user: `Write a volunteer recruitment message.

Organization: ${body.org_name} (${body.org_type || 'nonprofit'})
Mission: ${body.mission || 'not provided'}
Role: ${body.role_description}
Skills needed: ${body.skills_needed || 'no special skills required'}
When: ${body.shift_date || 'flexible'} ${body.shift_time || ''}
Where: ${body.location || 'not specified'}
Who to contact: ${body.contact_name || 'the volunteer coordinator'}

Make it feel worthwhile, specific, and easy to say yes to. Return only valid JSON matching the schema in the system prompt.`,
  });

  if (result.error) return c.json({ error: result.error }, 502);
  return c.json(result.data);
});

/**
 * POST /remind
 * Body: { org_name, volunteer_name, shift_date, shift_time, location, role,
 *         contact_name, any_updates }
 */
app.post('/remind', async (c) => {
  const body = await c.req.json().catch(() => null);
  if (!body?.org_name || !body?.shift_date) {
    return c.json({ error: 'org_name and shift_date are required' }, 400);
  }

  const result = await callClaude(c.env, {
    system: volunteerCommsPrompt,
    user: `Write a friendly, practical shift reminder.

Organization: ${body.org_name}
Volunteer: ${body.volunteer_name || 'there'}
Role: ${body.role || 'your shift'}
When: ${body.shift_date} ${body.shift_time || ''}
Where: ${body.location || 'not specified'}
Contact on the day: ${body.contact_name || 'the coordinator'}
Anything new they should know: ${body.any_updates || 'nothing new'}

Include the key logistics. Keep it short. Return only valid JSON matching the schema in the system prompt.`,
  });

  if (result.error) return c.json({ error: result.error }, 502);
  return c.json(result.data);
});

/**
 * POST /appreciate
 * Body: { org_name, volunteer_name, contribution, impact, is_milestone, milestone_detail }
 */
app.post('/appreciate', async (c) => {
  const body = await c.req.json().catch(() => null);
  if (!body?.org_name || !body?.volunteer_name) {
    return c.json({ error: 'org_name and volunteer_name are required' }, 400);
  }

  const result = await callClaude(c.env, {
    system: volunteerCommsPrompt,
    user: `Write a specific, warm volunteer appreciation message.

Organization: ${body.org_name}
Volunteer: ${body.volunteer_name}
What they did: ${body.contribution || 'their volunteer work'}
What it meant / the impact: ${body.impact || 'not specified — connect it to the mission'}
${body.is_milestone ? `This celebrates a milestone: ${body.milestone_detail || 'a special milestone'}` : 'This is a general thank-you (not a milestone).'}

Make it specific to this person's contribution, not generic. Return only valid JSON matching the schema in the system prompt.`,
  });

  if (result.error) return c.json({ error: result.error }, 502);
  return c.json(result.data);
});

/**
 * POST /hour-report
 * Body: { org_name, org_type, period, volunteers: [{ name, hours, role }],
 *         total_hours?, avg_hourly_value? }
 * Returns: { message, subject_line, tone_notes, total_hours, dollar_value, hourly_rate }
 */
app.post('/hour-report', async (c) => {
  const body = await c.req.json().catch(() => null);
  if (!body?.org_name || !Array.isArray(body.volunteers) || body.volunteers.length === 0) {
    return c.json({ error: 'org_name and a non-empty volunteers array are required' }, 400);
  }

  const rate = Number(body.avg_hourly_value) > 0 ? Number(body.avg_hourly_value) : DEFAULT_HOURLY_VALUE;
  const totalHours =
    body.total_hours != null && body.total_hours !== ''
      ? Number(body.total_hours)
      : body.volunteers.reduce((sum, v) => sum + (Number(v.hours) || 0), 0);
  const dollarValue = Math.round(totalHours * rate * 100) / 100;
  const roster = body.volunteers
    .map((v) => `- ${v.name || 'Volunteer'} (${v.role || 'volunteer'}): ${v.hours || 0} hours`)
    .join('\n');

  const result = await callClaude(c.env, {
    maxTokens: 1200,
    system: volunteerCommsPrompt,
    user: `Write the "volunteer contributions" narrative paragraph for a grant application.

Organization: ${body.org_name} (${body.org_type || 'nonprofit'})
Reporting period: ${body.period || 'not specified'}
Number of volunteers: ${body.volunteers.length}
Total volunteer hours: ${totalHours}
Dollar value of volunteer time: $${dollarValue.toLocaleString('en-US')} (calculated at $${rate}/hour, the Independent Sector value of volunteer time)
Roster:
${roster}

In the "message" field, write a polished, professional paragraph a grant writer can paste directly into a proposal's volunteer contributions section. Cite the total hours and dollar value. Return only valid JSON matching the schema in the system prompt.`,
  });

  if (result.error) return c.json({ error: result.error }, 502);
  return c.json({ ...result.data, total_hours: totalHours, dollar_value: dollarValue, hourly_rate: rate });
});

// ─── Shared Claude helper ──────────────────────────────────────────────────

async function callClaude(env, { system, user, model = HAIKU, maxTokens = 1024 }) {
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

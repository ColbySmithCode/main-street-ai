/**
 * Main Street AI — Operations Module
 *
 * Routes:
 *   POST /schedule/parse      → Parse natural language into appointment details
 *   POST /invoice/generate    → Generate invoice from plain-English job description
 *   POST /tasks/prioritize    → Prioritize a list of tasks by impact + urgency
 *   POST /comms/draft         → Draft operational communication (reminder, follow-up, etc.)
 *
 * Status: In progress — parse and invoice routes are functional.
 *         Task storage (D1) and scheduled reminders (Queues) coming next.
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';

const app = new Hono();

app.use('*', cors({ origin: '*', allowMethods: ['GET', 'POST', 'OPTIONS'] }));

app.get('/health', (c) => c.json({ status: 'ok', module: 'operations' }));

/**
 * POST /schedule/parse
 *
 * Converts natural language scheduling requests into structured appointment data.
 *
 * Body: {
 *   request: string,            // "schedule a 45 min call next Tuesday afternoon"
 *   business_hours: string,     // "Mon-Fri 9am-5pm CT"
 *   service_duration_mins: number
 * }
 *
 * Returns: {
 *   parsed_date: string,        // ISO-ish best guess
 *   duration_mins: number,
 *   ambiguities: string[],      // things to clarify with the customer
 *   suggested_slots: string[],  // 2-3 specific times that work
 *   confirmation_message: string
 * }
 */
app.post('/schedule/parse', async (c) => {
  const body = await c.req.json().catch(() => null);
  if (!body?.request) return c.json({ error: 'request is required' }, 400);

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  const result = await callClaude(c.env, {
    system: `You are a scheduling assistant for small businesses. Parse natural language appointment requests into structured data.

Today is ${today}.

Return valid JSON in exactly this format:
{
  "parsed_date": "string — best guess at the intended date (YYYY-MM-DD or 'ambiguous')",
  "duration_mins": number,
  "ambiguities": ["string — things that need clarification"],
  "suggested_slots": ["string — 2-3 specific date+time suggestions that fit business hours"],
  "confirmation_message": "string — a friendly confirmation or clarification request to send the customer"
}`,
    user: `Parse this scheduling request:
"${body.request}"

Business hours: ${body.business_hours || 'not specified'}
Service duration: ${body.service_duration_mins || 'not specified'} minutes`,
  });

  if (result.error) return c.json({ error: result.error }, 502);
  return c.json(result.data);
});

/**
 * POST /invoice/generate
 *
 * Body: {
 *   business_name: string,
 *   client_name: string,
 *   job_description: string,    // plain English: "replaced water heater, 3 hours labor"
 *   hourly_rate?: number,
 *   materials?: string,         // "water heater $450, fittings $23"
 *   tax_rate?: number           // percentage, e.g. 8.5
 * }
 *
 * Returns: {
 *   line_items: [{ description, quantity, unit_price, total }],
 *   subtotal: number,
 *   tax: number,
 *   total: number,
 *   invoice_notes: string,
 *   payment_terms: string
 * }
 */
app.post('/invoice/generate', async (c) => {
  const body = await c.req.json().catch(() => null);
  if (!body?.job_description || !body?.client_name) {
    return c.json({ error: 'job_description and client_name are required' }, 400);
  }

  const result = await callClaude(c.env, {
    system: `You are an invoicing assistant for small businesses. Parse job descriptions into structured invoice line items.

Return valid JSON in exactly this format:
{
  "line_items": [
    { "description": "string", "quantity": number, "unit_price": number, "total": number }
  ],
  "subtotal": number,
  "tax": number,
  "total": number,
  "invoice_notes": "string — any relevant notes (warranty, what was done, etc.)",
  "payment_terms": "string — suggested payment terms for this type of job"
}

All monetary values should be numbers, not strings. Be specific and professional in line item descriptions.`,
    user: `Generate an invoice for:

Business: ${body.business_name || 'not provided'}
Client: ${body.client_name}
Job description: "${body.job_description}"
Hourly rate: ${body.hourly_rate ? `$${body.hourly_rate}/hr` : 'not specified'}
Materials: ${body.materials || 'none listed'}
Tax rate: ${body.tax_rate ? `${body.tax_rate}%` : '0%'}`,
  });

  if (result.error) return c.json({ error: result.error }, 502);
  return c.json(result.data);
});

/**
 * POST /tasks/prioritize
 *
 * Body: {
 *   tasks: string[],           // list of tasks in plain English
 *   business_type: string,
 *   context?: string           // "it's Monday morning" or "I have 2 hours before a client meeting"
 * }
 *
 * Returns: {
 *   prioritized: [{ task, priority: "do now" | "today" | "this week" | "delegate" | "drop", reason }]
 * }
 */
app.post('/tasks/prioritize', async (c) => {
  const body = await c.req.json().catch(() => null);
  if (!body?.tasks?.length) return c.json({ error: 'tasks array is required' }, 400);

  const result = await callClaude(c.env, {
    system: `You are an operations advisor for small business owners. Prioritize tasks by real-world impact — revenue protection first, customer commitments second, growth third, admin last.

Return valid JSON in exactly this format:
{
  "prioritized": [
    {
      "task": "string — the original task",
      "priority": "do now | today | this week | delegate | drop",
      "reason": "string — one sentence explaining why this priority"
    }
  ]
}

Order by priority (do now first). Be direct. Small business owners don't have time for hedging.`,
    user: `Prioritize these tasks for a ${body.business_type || 'small business'} owner:

${body.tasks.map((t, i) => `${i + 1}. ${t}`).join('\n')}

Context: ${body.context || 'no additional context'}`,
  });

  if (result.error) return c.json({ error: result.error }, 502);
  return c.json(result.data);
});

/**
 * POST /comms/draft
 *
 * Body: {
 *   type: "reminder" | "follow-up" | "cancellation" | "confirmation" | "thank-you",
 *   recipient_name: string,
 *   context: string,            // "appointment tomorrow at 2pm for a haircut"
 *   business_name: string,
 *   tone: "formal" | "warm" | "brief"
 * }
 *
 * Returns: { subject: string, message: string, channel_recommendation: string }
 */
app.post('/comms/draft', async (c) => {
  const body = await c.req.json().catch(() => null);
  if (!body?.type || !body?.context) {
    return c.json({ error: 'type and context are required' }, 400);
  }

  const result = await callClaude(c.env, {
    system: `You are a business communication assistant. Draft short, professional operational messages for small businesses.

Return valid JSON in exactly this format:
{
  "subject": "string — email subject line or text message opener",
  "message": "string — the full message body",
  "channel_recommendation": "text | email | phone — which channel is best for this type of message"
}

Keep messages concise. No fluff. Customers are busy.`,
    user: `Draft a ${body.type} message:

Business: ${body.business_name || 'the business'}
To: ${body.recipient_name || 'the customer'}
Context: ${body.context}
Tone: ${body.tone || 'warm'}`,
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
      return { error: 'Failed to parse AI response' };
    }
  } catch (err) {
    console.error('Fetch failed:', err?.message);
    return { error: 'Network error' };
  }
}

export default app;

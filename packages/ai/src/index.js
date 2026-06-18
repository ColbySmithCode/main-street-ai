/**
 * Main Street AI — Shared Claude client
 *
 * Used by all module workers. Centralizes:
 * - Model selection (Haiku vs Sonnet by task type)
 * - JSON parse with fence stripping
 * - Error normalization
 * - Token usage logging
 */

/** @typedef {'fast' | 'quality'} ModelTier */
const MODELS = {
  fast: 'claude-haiku-4-5-20251001',      // audit, scoring, short drafts
  quality: 'claude-sonnet-4-6',            // content creation, long-form drafts
};

/**
 * Call Claude and return parsed JSON.
 *
 * @param {object} env - Worker env (needs ANTHROPIC_API_KEY)
 * @param {object} options
 * @param {string} options.system - System prompt
 * @param {string} options.user - User message
 * @param {ModelTier} [options.tier='fast'] - Model tier
 * @param {number} [options.maxTokens=1024] - Max tokens
 * @returns {Promise<{ data?: any, error?: string, usage?: object }>}
 */
export async function askClaude(env, { system, user, tier = 'fast', maxTokens = 1024 }) {
  const model = MODELS[tier] ?? MODELS.fast;

  let res;
  try {
    res = await fetch('https://api.anthropic.com/v1/messages', {
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
  } catch (err) {
    console.error('[claude] fetch failed:', err?.message);
    return { error: 'Network error reaching AI service' };
  }

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    console.error('[claude] API error:', res.status, errText);
    return { error: 'AI service temporarily unavailable' };
  }

  const payload = await res.json();
  const raw = payload?.content?.[0]?.text ?? '';
  const usage = payload?.usage;

  // Strip markdown fences if Claude wraps the JSON
  const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim();

  try {
    return { data: JSON.parse(cleaned), usage };
  } catch {
    console.error('[claude] JSON parse failed. Raw:', raw.slice(0, 200));
    return { error: 'Failed to parse AI response — try again' };
  }
}

/**
 * Convenience: ask Claude for plain text (no JSON parsing).
 */
export async function askClaudeText(env, { system, user, tier = 'fast', maxTokens = 1024 }) {
  const model = MODELS[tier] ?? MODELS.fast;

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

    if (!res.ok) return { error: 'AI service temporarily unavailable' };
    const payload = await res.json();
    return { text: payload?.content?.[0]?.text ?? '' };
  } catch (err) {
    return { error: 'Network error' };
  }
}

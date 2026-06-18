/**
 * Main Street AI — Capital Module (Planned — Phase 5)
 *
 * Routes (designed, not yet built):
 *   POST /grants/find         → Search for grants matching org profile
 *   POST /grants/score        → Score readiness for a specific grant
 *   POST /loans/readiness     → SBA loan readiness assessment
 *   POST /cashflow/forecast   → 6-month cash flow projection from described patterns
 *   POST /docs/explain        → Translate financial document to plain English
 *
 * Architecture notes:
 * - Grant finder requires web search results as input (not a static database)
 * - Hallucination risk is highest in this module — prompts include explicit
 *   uncertainty instructions and require sources for every grant listed
 * - Loan readiness uses structured rubric scoring, not free-form advice
 * - Cash flow forecaster outputs ranges (best/likely/worst), not point estimates
 */

// TODO: implement in Phase 5
export default {
  async fetch(request) {
    return new Response(
      JSON.stringify({ status: 'coming_soon', module: 'capital', phase: 5 }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  }
};

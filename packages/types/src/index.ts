/**
 * Main Street AI — Shared TypeScript types
 *
 * Used across all modules and the unified dashboard.
 */

// ─── Organization profile ──────────────────────────────────────────────────

export type OrgType =
  | 'small_business'
  | 'nonprofit'
  | 'restaurant'
  | 'service_business'
  | 'retail'
  | 'health_wellness'
  | 'faith_organization'
  | 'arts_cultural'
  | 'education'
  | 'community_organization';

export interface OrgProfile {
  id: string;
  name: string;
  city: string;
  state: string;
  type: OrgType;
  website?: string;
  phone?: string;
  email?: string;
  description?: string;
  created_at: number;
  updated_at: number;
}

// ─── Presence module ───────────────────────────────────────────────────────

export type Grade = 'A' | 'B' | 'C' | 'D' | 'F';

export interface PresenceAudit {
  organization: string;
  city: string;
  type: string;
  overall_grade: Grade;
  grade_summary: string;
  score: number;
  quick_wins: QuickWin[];
  website: WebsiteAssessment;
  social_media: SocialAssessment;
  local_seo: SEOAssessment;
  recommended_steps: ActionStep[];
  encouragement: string;
  generated_at?: number;
}

export interface QuickWin {
  action: string;
  why: string;
  cost: 'Free' | 'Under $20/mo' | 'Varies';
  time: string;
}

export interface WebsiteAssessment {
  assessment: string;
  key_issues: string[];
  missing_elements: string[];
  priority_fix: string;
}

export interface SocialAssessment {
  assessment: string;
  platforms_to_prioritize: { platform: string; reason: string }[];
  what_to_post: string;
}

export interface SEOAssessment {
  assessment: string;
  google_business_priority: 'High' | 'Medium' | 'Low';
  google_business_tips: string[];
  search_visibility_gap: string;
}

export interface ActionStep {
  step: number;
  action: string;
  impact: 'High' | 'Medium' | 'Low';
  cost: string;
  time_to_complete: string;
  details: string;
}

// ─── Customers module ──────────────────────────────────────────────────────

export interface OutreachDraft {
  subject: string;
  body: string;
  follow_up_timing: string;
  personalization_notes: string;
}

export interface ReviewResponse {
  response: string;
  approach_explanation: string;
}

export interface LeadScore {
  score: number;
  tier: 'hot' | 'warm' | 'cold';
  reasoning: string;
  suggested_approach: string;
  data_gaps: string[];
}

// ─── Operations module ─────────────────────────────────────────────────────

export interface ParsedAppointment {
  parsed_date: string;
  duration_mins: number;
  ambiguities: string[];
  suggested_slots: string[];
  confirmation_message: string;
}

export interface InvoiceData {
  line_items: { description: string; quantity: number; unit_price: number; total: number }[];
  subtotal: number;
  tax: number;
  total: number;
  invoice_notes: string;
  payment_terms: string;
}

export interface PrioritizedTask {
  task: string;
  priority: 'do now' | 'today' | 'this week' | 'delegate' | 'drop';
  reason: string;
}

// ─── Capital module ────────────────────────────────────────────────────────

export interface GrantOpportunity {
  name: string;
  funder: string;
  amount_range: string;
  deadline: string;
  eligibility_summary: string;
  fit_score: number;
  fit_explanation: string;
  application_url: string;
  required_documents: string[];
}

export interface LoanReadiness {
  overall_score: number;
  strengths: string[];
  gaps: string[];
  recommended_loan_types: string[];
  next_steps: string[];
}

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// ─── Raw DB row types (no joined fields) ─────────────────────────────────────
// These are the pure table row types used in the Database generic for Supabase.

export type AgencyRow = {
  id: string
  name: string
  owner_id: string | null
  logo_url: string | null
  created_at: string
  updated_at: string
}

export type ClientRow = {
  id: string
  agency_id: string
  name: string
  website_url: string
  industry: string | null
  target_location: string | null
  services_products: string | null
  main_goals: string | null
  primary_conversion_goal: string | null
  secondary_conversion_goals: string | null
  target_audience: string | null
  brand_tone: string | null
  content_style_notes: string | null
  client_expectations_notes: string | null
  retainer_value: number | null
  priority_level: 'low' | 'medium' | 'high' | 'critical'
  client_status: 'active' | 'paused' | 'onboarding' | 'churned'
  risk_level: 'low' | 'medium' | 'high' | 'critical'
  seo_health_score: number
  created_at: string
  updated_at: string
}

export type TaskRow = {
  id: string
  client_id: string
  agency_id: string
  title: string
  description: string | null
  task_type: string
  source: string | null
  priority_score: number
  impact: 'low' | 'medium' | 'high' | 'very_high'
  effort: 'low' | 'medium' | 'high'
  urgency: 'low' | 'medium' | 'high' | 'critical'
  status: 'new' | 'planned' | 'in_progress' | 'waiting' | 'completed' | 'skipped'
  due_date: string | null
  assigned_to: string | null
  related_page_url: string | null
  related_keyword: string | null
  recommended_action: string | null
  ai_explanation: string | null
  checklist: Json[]
  notes: string | null
  completion_date: string | null
  created_at: string
  updated_at: string
}

export type OpportunityRow = {
  id: string
  client_id: string
  type: string
  title: string
  description: string | null
  priority_score: number
  impact: 'low' | 'medium' | 'high' | 'very_high'
  effort: 'low' | 'medium' | 'high'
  urgency: 'low' | 'medium' | 'high' | 'critical'
  related_page_url: string | null
  related_keyword: string | null
  data: Json
  status: 'new' | 'task_created' | 'dismissed'
  created_at: string
  updated_at: string
}

export type SopRow = {
  id: string
  agency_id: string | null
  title: string
  category: string
  description: string | null
  steps: Json[]
  checklist: Json[]
  is_built_in: boolean
  created_at: string
  updated_at: string
}

export type GscPropertyRow = {
  id: string
  client_id: string
  property_url: string
  access_token: string | null
  refresh_token: string | null
  token_expiry: string | null
  is_connected: boolean
  last_synced: string | null
  created_at: string
  updated_at: string
}

export type GscQueryDataRow = {
  id: string
  client_id: string
  property_id: string
  query: string
  page: string | null
  clicks: number
  impressions: number
  ctr: number
  position: number
  device: string | null
  country: string | null
  date: string
  created_at: string
}

export type Database = {
  public: {
    Tables: {
      agencies: {
        Row: AgencyRow
        Insert: Partial<AgencyRow>
        Update: Partial<AgencyRow>
      }
      clients: {
        Row: ClientRow
        Insert: Partial<ClientRow>
        Update: Partial<ClientRow>
      }
      tasks: {
        Row: TaskRow
        Insert: Partial<TaskRow>
        Update: Partial<TaskRow>
      }
      opportunities: {
        Row: OpportunityRow
        Insert: Partial<OpportunityRow>
        Update: Partial<OpportunityRow>
      }
      sops: {
        Row: SopRow
        Insert: Partial<SopRow>
        Update: Partial<SopRow>
      }
      gsc_properties: {
        Row: GscPropertyRow
        Insert: Partial<GscPropertyRow>
        Update: Partial<GscPropertyRow>
      }
      gsc_query_data: {
        Row: GscQueryDataRow
        Insert: Omit<GscQueryDataRow, 'id' | 'created_at'>
        Update: Partial<GscQueryDataRow>
      }
      ga4_properties: {
        Row: { [key: string]: unknown }
        Insert: { [key: string]: unknown }
        Update: { [key: string]: unknown }
      }
      ga4_landing_page_data: {
        Row: { [key: string]: unknown }
        Insert: { [key: string]: unknown }
        Update: { [key: string]: unknown }
      }
      competitors: {
        Row: { [key: string]: unknown }
        Insert: { [key: string]: unknown }
        Update: { [key: string]: unknown }
      }
      keywords: {
        Row: { [key: string]: unknown }
        Insert: { [key: string]: unknown }
        Update: { [key: string]: unknown }
      }
      pages: {
        Row: { [key: string]: unknown }
        Insert: { [key: string]: unknown }
        Update: { [key: string]: unknown }
      }
      blog_briefs: {
        Row: { [key: string]: unknown }
        Insert: { [key: string]: unknown }
        Update: { [key: string]: unknown }
      }
      blog_drafts: {
        Row: { [key: string]: unknown }
        Insert: { [key: string]: unknown }
        Update: { [key: string]: unknown }
      }
      content_qa_results: {
        Row: { [key: string]: unknown }
        Insert: { [key: string]: unknown }
        Update: { [key: string]: unknown }
      }
      reports: {
        Row: { [key: string]: unknown }
        Insert: { [key: string]: unknown }
        Update: { [key: string]: unknown }
      }
      calendar_items: {
        Row: { [key: string]: unknown }
        Insert: { [key: string]: unknown }
        Update: { [key: string]: unknown }
      }
      client_history: {
        Row: { [key: string]: unknown }
        Insert: { [key: string]: unknown }
        Update: { [key: string]: unknown }
      }
      technical_issues: {
        Row: { [key: string]: unknown }
        Insert: { [key: string]: unknown }
        Update: { [key: string]: unknown }
      }
      backlink_prospects: {
        Row: { [key: string]: unknown }
        Insert: { [key: string]: unknown }
        Update: { [key: string]: unknown }
      }
      internal_link_suggestions: {
        Row: { [key: string]: unknown }
        Insert: { [key: string]: unknown }
        Update: { [key: string]: unknown }
      }
      local_seo_items: {
        Row: { [key: string]: unknown }
        Insert: { [key: string]: unknown }
        Update: { [key: string]: unknown }
      }
      ubersuggest_imports: {
        Row: { [key: string]: unknown }
        Insert: { [key: string]: unknown }
        Update: { [key: string]: unknown }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}

// ─── Core domain types ────────────────────────────────────────────────────────

export type Agency = {
  id: string
  name: string
  owner_id: string | null
  logo_url: string | null
  created_at: string
  updated_at: string
}

export type Client = {
  id: string
  agency_id: string
  name: string
  website_url: string
  industry: string | null
  target_location: string | null
  services_products: string | null
  main_goals: string | null
  primary_conversion_goal: string | null
  secondary_conversion_goals: string | null
  target_audience: string | null
  brand_tone: string | null
  content_style_notes: string | null
  client_expectations_notes: string | null
  retainer_value: number | null
  priority_level: 'low' | 'medium' | 'high' | 'critical'
  client_status: 'active' | 'paused' | 'onboarding' | 'churned'
  risk_level: 'low' | 'medium' | 'high' | 'critical'
  seo_health_score: number
  created_at: string
  updated_at: string
  // computed/joined fields
  tasks_count?: number
  overdue_tasks_count?: number
  high_priority_tasks_count?: number
}

export type Task = {
  id: string
  client_id: string
  agency_id: string
  title: string
  description: string | null
  task_type:
    | 'technical_seo'
    | 'on_page_seo'
    | 'content_refresh'
    | 'new_blog'
    | 'internal_linking'
    | 'backlink_outreach'
    | 'competitor_analysis'
    | 'reporting'
    | 'local_seo'
    | 'conversion_improvement'
    | 'metadata_rewrite'
    | 'keyword_addition'
    | 'schema_recommendation'
  source: string | null
  priority_score: number
  impact: 'low' | 'medium' | 'high' | 'very_high'
  effort: 'low' | 'medium' | 'high'
  urgency: 'low' | 'medium' | 'high' | 'critical'
  status: 'new' | 'planned' | 'in_progress' | 'waiting' | 'completed' | 'skipped'
  due_date: string | null
  assigned_to: string | null
  related_page_url: string | null
  related_keyword: string | null
  recommended_action: string | null
  ai_explanation: string | null
  checklist: Json[]
  notes: string | null
  completion_date: string | null
  created_at: string
  updated_at: string
  // joined
  client?: Pick<Client, 'id' | 'name'>
}

export type Opportunity = {
  id: string
  client_id: string
  type: string
  title: string
  description: string | null
  priority_score: number
  impact: 'low' | 'medium' | 'high' | 'very_high'
  effort: 'low' | 'medium' | 'high'
  urgency: 'low' | 'medium' | 'high' | 'critical'
  related_page_url: string | null
  related_keyword: string | null
  data: Json
  status: 'new' | 'task_created' | 'dismissed'
  created_at: string
  updated_at: string
}

export type SOP = {
  id: string
  agency_id: string | null
  title: string
  category: string
  description: string | null
  steps: Json[]
  checklist: Json[]
  is_built_in: boolean
  created_at: string
  updated_at: string
}

export type GscProperty = {
  id: string
  client_id: string
  property_url: string
  access_token: string | null
  refresh_token: string | null
  token_expiry: string | null
  is_connected: boolean
  last_synced: string | null
  created_at: string
  updated_at: string
}

export type GscQueryData = {
  id: string
  client_id: string
  property_id: string
  query: string
  page: string | null
  clicks: number
  impressions: number
  ctr: number
  position: number
  device: string | null
  country: string | null
  date: string
  created_at: string
}

export type Competitor = {
  id: string
  client_id: string
  name: string | null
  url: string
  notes: string | null
  data: Json
  created_at: string
  updated_at: string
}

export type Keyword = {
  id: string
  client_id: string
  keyword: string
  search_volume: number | null
  keyword_difficulty: number | null
  cpc: number | null
  position: number | null
  page_url: string | null
  intent: string | null
  source: string | null
  data: Json
  created_at: string
  updated_at: string
}

export type Page = {
  id: string
  client_id: string
  url: string
  title: string | null
  h1: string | null
  meta_description: string | null
  page_type: string | null
  word_count: number | null
  published_date: string | null
  last_modified: string | null
  data: Json
  created_at: string
  updated_at: string
}

export type BlogBrief = {
  id: string
  client_id: string
  title: string
  primary_keyword: string | null
  secondary_keywords: string[] | null
  search_intent: string | null
  target_audience: string | null
  funnel_stage: string | null
  content_angle: string | null
  required_sections: string[] | null
  faqs: Json[]
  internal_links: Json[]
  schema_recommendation: string | null
  cta_suggestion: string | null
  eeat_notes: string | null
  aeo_notes: string | null
  llm_notes: string | null
  competitor_weaknesses: string | null
  recommended_word_count: number | null
  tone_notes: string | null
  status: 'draft' | 'approved' | 'in_progress' | 'published'
  created_at: string
  updated_at: string
}

export type BlogDraft = {
  id: string
  brief_id: string
  client_id: string
  seo_title: string | null
  meta_description: string | null
  url_slug: string | null
  h1: string | null
  content: string | null
  faq_section: string | null
  internal_link_suggestions: Json[]
  schema_suggestion: string | null
  image_suggestions: string[] | null
  cta: string | null
  keyword_usage_summary: Json
  eeat_score: number | null
  aeo_score: number | null
  seo_score: number | null
  human_quality_score: number | null
  ai_risk_score: number | null
  status: string
  created_at: string
  updated_at: string
}

export type Report = {
  id: string
  client_id: string
  title: string
  period_start: string | null
  period_end: string | null
  report_type: 'weekly' | 'monthly'
  summary: string | null
  wins: string | null
  losses: string | null
  tasks_completed: Json[]
  tasks_planned: Json[]
  gsc_summary: Json
  ga4_summary: Json
  backlinks_built: number
  blogs_published: number
  pages_refreshed: number
  next_month_plan: string | null
  status: 'draft' | 'sent'
  created_at: string
  updated_at: string
}

export type CalendarItem = {
  id: string
  client_id: string
  agency_id: string
  title: string
  description: string | null
  item_type: string | null
  due_date: string
  is_recurring: boolean
  recurrence_pattern: string | null
  related_task_id: string | null
  status: 'pending' | 'completed' | 'skipped'
  created_at: string
  updated_at: string
}

export type ClientHistory = {
  id: string
  client_id: string
  action_type: string
  page_url: string | null
  keyword: string | null
  description: string
  changed_by: string | null
  before_value: string | null
  after_value: string | null
  notes: string | null
  related_task_id: string | null
  expected_impact: string | null
  created_at: string
}

export type TechnicalIssue = {
  id: string
  client_id: string
  issue_type: string
  page_url: string | null
  severity: 'info' | 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string | null
  fix_recommendation: string | null
  client_friendly_explanation: string | null
  status: 'open' | 'in_progress' | 'resolved' | 'wont_fix'
  created_at: string
  updated_at: string
}

export type BacklinkProspect = {
  id: string
  client_id: string
  website: string
  niche: string | null
  domain_authority: number | null
  page_authority: number | null
  domain_rating: number | null
  estimated_traffic: number | null
  spam_score: number | null
  contact_email: string | null
  contact_page_url: string | null
  guest_post_page_url: string | null
  price: number | null
  status:
    | 'prospect_found'
    | 'approved'
    | 'outreach_sent'
    | 'negotiating'
    | 'content_required'
    | 'content_sent'
    | 'published'
    | 'live_link_verified'
    | 'indexed'
    | 'rejected'
  notes: string | null
  relevance_score: number | null
  quality_score: number | null
  risk_level: 'low' | 'medium' | 'high'
  target_page_url: string | null
  anchor_text: string | null
  checklist: Json
  created_at: string
  updated_at: string
}

export type InternalLinkSuggestion = {
  id: string
  client_id: string
  source_page_url: string
  source_page_title: string | null
  target_page_url: string
  target_page_title: string | null
  suggested_anchor_text: string | null
  reason: string | null
  priority: 'low' | 'medium' | 'high'
  status: 'suggested' | 'added' | 'skipped' | 'verified'
  created_at: string
  updated_at: string
}

// ─── Form / API input types ───────────────────────────────────────────────────

export type CreateClientInput = {
  name: string
  website_url: string
  industry?: string
  target_location?: string
  services_products?: string
  main_goals?: string
  primary_conversion_goal?: string
  secondary_conversion_goals?: string
  target_audience?: string
  brand_tone?: string
  content_style_notes?: string
  client_expectations_notes?: string
  retainer_value?: number
  priority_level?: Client['priority_level']
  client_status?: Client['client_status']
}

export type CreateTaskInput = {
  client_id: string
  title: string
  description?: string
  task_type: Task['task_type']
  priority_score?: number
  impact?: Task['impact']
  effort?: Task['effort']
  urgency?: Task['urgency']
  due_date?: string
  related_page_url?: string
  related_keyword?: string
  recommended_action?: string
  notes?: string
}

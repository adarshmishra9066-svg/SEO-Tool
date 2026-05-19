-- ============================================================
-- SEO Command Centre — Supabase Schema
-- ============================================================
-- Run this in your Supabase SQL editor to set up the database.
-- Make sure to enable the pgcrypto extension first.

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── Agencies ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS agencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  owner_id UUID REFERENCES auth.users(id),
  logo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ─── Clients ──────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID REFERENCES agencies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  website_url TEXT NOT NULL,
  industry TEXT,
  target_location TEXT,
  services_products TEXT,
  main_goals TEXT,
  primary_conversion_goal TEXT,
  secondary_conversion_goals TEXT,
  target_audience TEXT,
  brand_tone TEXT,
  content_style_notes TEXT,
  client_expectations_notes TEXT,
  retainer_value DECIMAL(10,2),
  priority_level TEXT CHECK (priority_level IN ('low','medium','high','critical')) DEFAULT 'medium',
  client_status TEXT CHECK (client_status IN ('active','paused','onboarding','churned')) DEFAULT 'active',
  risk_level TEXT CHECK (risk_level IN ('low','medium','high','critical')) DEFAULT 'low',
  seo_health_score INTEGER DEFAULT 0 CHECK (seo_health_score BETWEEN 0 AND 100),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ─── Tasks ────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  agency_id UUID REFERENCES agencies(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  task_type TEXT CHECK (task_type IN (
    'technical_seo','on_page_seo','content_refresh','new_blog',
    'internal_linking','backlink_outreach','competitor_analysis',
    'reporting','local_seo','conversion_improvement','metadata_rewrite',
    'keyword_addition','schema_recommendation'
  )) NOT NULL,
  source TEXT,
  priority_score INTEGER DEFAULT 50 CHECK (priority_score BETWEEN 0 AND 100),
  impact TEXT CHECK (impact IN ('low','medium','high','very_high')) DEFAULT 'medium',
  effort TEXT CHECK (effort IN ('low','medium','high')) DEFAULT 'medium',
  urgency TEXT CHECK (urgency IN ('low','medium','high','critical')) DEFAULT 'medium',
  status TEXT CHECK (status IN ('new','planned','in_progress','waiting','completed','skipped')) DEFAULT 'new',
  due_date DATE,
  assigned_to UUID REFERENCES auth.users(id),
  related_page_url TEXT,
  related_keyword TEXT,
  recommended_action TEXT,
  ai_explanation TEXT,
  checklist JSONB DEFAULT '[]',
  notes TEXT,
  completion_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ─── Opportunities ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  priority_score INTEGER DEFAULT 50,
  impact TEXT CHECK (impact IN ('low','medium','high','very_high')) DEFAULT 'medium',
  effort TEXT CHECK (effort IN ('low','medium','high')) DEFAULT 'medium',
  urgency TEXT CHECK (urgency IN ('low','medium','high','critical')) DEFAULT 'medium',
  related_page_url TEXT,
  related_keyword TEXT,
  data JSONB DEFAULT '{}',
  status TEXT CHECK (status IN ('new','task_created','dismissed')) DEFAULT 'new',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ─── GSC Properties ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS gsc_properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  property_url TEXT NOT NULL,
  access_token TEXT,
  refresh_token TEXT,
  token_expiry TIMESTAMPTZ,
  is_connected BOOLEAN DEFAULT false,
  last_synced TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ─── GSC Query Data ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS gsc_query_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  property_id UUID REFERENCES gsc_properties(id) ON DELETE CASCADE,
  query TEXT NOT NULL,
  page TEXT,
  clicks INTEGER DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  ctr DECIMAL(5,4) DEFAULT 0,
  position DECIMAL(6,2) DEFAULT 0,
  device TEXT,
  country TEXT,
  date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_gsc_query_data_client_date ON gsc_query_data(client_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_gsc_query_data_query ON gsc_query_data(query);

-- ─── GA4 Properties ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS ga4_properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  property_id TEXT NOT NULL,
  property_name TEXT,
  access_token TEXT,
  refresh_token TEXT,
  token_expiry TIMESTAMPTZ,
  is_connected BOOLEAN DEFAULT false,
  last_synced TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ─── GA4 Landing Page Data ────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS ga4_landing_page_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  property_id UUID REFERENCES ga4_properties(id) ON DELETE CASCADE,
  page_path TEXT NOT NULL,
  sessions INTEGER DEFAULT 0,
  users INTEGER DEFAULT 0,
  engagement_rate DECIMAL(5,4) DEFAULT 0,
  avg_engagement_time DECIMAL(10,2) DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  revenue DECIMAL(12,2) DEFAULT 0,
  channel TEXT DEFAULT 'organic',
  date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ─── Competitors ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS competitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  name TEXT,
  url TEXT NOT NULL,
  notes TEXT,
  data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ─── Keywords ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS keywords (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  keyword TEXT NOT NULL,
  search_volume INTEGER,
  keyword_difficulty INTEGER,
  cpc DECIMAL(8,2),
  position DECIMAL(6,2),
  page_url TEXT,
  intent TEXT,
  source TEXT,
  data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_keywords_client ON keywords(client_id);
CREATE INDEX IF NOT EXISTS idx_keywords_keyword ON keywords(keyword);

-- ─── Pages ────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  title TEXT,
  h1 TEXT,
  meta_description TEXT,
  page_type TEXT,
  word_count INTEGER,
  published_date DATE,
  last_modified DATE,
  data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ─── Blog Briefs ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS blog_briefs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  primary_keyword TEXT,
  secondary_keywords TEXT[],
  search_intent TEXT,
  target_audience TEXT,
  funnel_stage TEXT,
  content_angle TEXT,
  required_sections TEXT[],
  faqs JSONB DEFAULT '[]',
  internal_links JSONB DEFAULT '[]',
  schema_recommendation TEXT,
  cta_suggestion TEXT,
  eeat_notes TEXT,
  aeo_notes TEXT,
  llm_notes TEXT,
  competitor_weaknesses TEXT,
  recommended_word_count INTEGER,
  tone_notes TEXT,
  status TEXT CHECK (status IN ('draft','approved','in_progress','published')) DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ─── Blog Drafts ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS blog_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brief_id UUID REFERENCES blog_briefs(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  seo_title TEXT,
  meta_description TEXT,
  url_slug TEXT,
  h1 TEXT,
  content TEXT,
  faq_section TEXT,
  internal_link_suggestions JSONB DEFAULT '[]',
  schema_suggestion TEXT,
  image_suggestions TEXT[],
  cta TEXT,
  keyword_usage_summary JSONB DEFAULT '{}',
  eeat_score INTEGER,
  aeo_score INTEGER,
  seo_score INTEGER,
  human_quality_score INTEGER,
  ai_risk_score INTEGER,
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ─── Content QA Results ───────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS content_qa_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  content_url TEXT,
  content_title TEXT,
  raw_content TEXT,
  overall_score INTEGER,
  seo_score INTEGER,
  eeat_score INTEGER,
  aeo_score INTEGER,
  human_quality_score INTEGER,
  ai_detection_risk INTEGER,
  issues JSONB DEFAULT '[]',
  fixes JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ─── Internal Link Suggestions ────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS internal_link_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  source_page_url TEXT NOT NULL,
  source_page_title TEXT,
  target_page_url TEXT NOT NULL,
  target_page_title TEXT,
  suggested_anchor_text TEXT,
  reason TEXT,
  priority TEXT CHECK (priority IN ('low','medium','high')) DEFAULT 'medium',
  status TEXT CHECK (status IN ('suggested','added','skipped','verified')) DEFAULT 'suggested',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ─── Backlink Prospects ───────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS backlink_prospects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  website TEXT NOT NULL,
  niche TEXT,
  domain_authority INTEGER,
  page_authority INTEGER,
  domain_rating INTEGER,
  estimated_traffic INTEGER,
  spam_score INTEGER,
  contact_email TEXT,
  contact_page_url TEXT,
  guest_post_page_url TEXT,
  price DECIMAL(8,2),
  status TEXT CHECK (status IN (
    'prospect_found','approved','outreach_sent','negotiating',
    'content_required','content_sent','published',
    'live_link_verified','indexed','rejected'
  )) DEFAULT 'prospect_found',
  notes TEXT,
  relevance_score INTEGER,
  quality_score INTEGER,
  risk_level TEXT CHECK (risk_level IN ('low','medium','high')) DEFAULT 'low',
  target_page_url TEXT,
  anchor_text TEXT,
  checklist JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ─── Reports ──────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  period_start DATE,
  period_end DATE,
  report_type TEXT CHECK (report_type IN ('weekly','monthly')) DEFAULT 'monthly',
  summary TEXT,
  wins TEXT,
  losses TEXT,
  tasks_completed JSONB DEFAULT '[]',
  tasks_planned JSONB DEFAULT '[]',
  gsc_summary JSONB DEFAULT '{}',
  ga4_summary JSONB DEFAULT '{}',
  backlinks_built INTEGER DEFAULT 0,
  blogs_published INTEGER DEFAULT 0,
  pages_refreshed INTEGER DEFAULT 0,
  next_month_plan TEXT,
  status TEXT CHECK (status IN ('draft','sent')) DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ─── Calendar Items ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS calendar_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  agency_id UUID REFERENCES agencies(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  item_type TEXT,
  due_date DATE NOT NULL,
  is_recurring BOOLEAN DEFAULT false,
  recurrence_pattern TEXT,
  related_task_id UUID REFERENCES tasks(id),
  status TEXT CHECK (status IN ('pending','completed','skipped')) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ─── SOPs ─────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS sops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID REFERENCES agencies(id),
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  steps JSONB DEFAULT '[]',
  checklist JSONB DEFAULT '[]',
  is_built_in BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ─── Client History ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS client_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  page_url TEXT,
  keyword TEXT,
  description TEXT NOT NULL,
  changed_by UUID REFERENCES auth.users(id),
  before_value TEXT,
  after_value TEXT,
  notes TEXT,
  related_task_id UUID REFERENCES tasks(id),
  expected_impact TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_client_history_client ON client_history(client_id, created_at DESC);

-- ─── Technical Issues ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS technical_issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  issue_type TEXT NOT NULL,
  page_url TEXT,
  severity TEXT CHECK (severity IN ('info','low','medium','high','critical')) DEFAULT 'medium',
  title TEXT NOT NULL,
  description TEXT,
  fix_recommendation TEXT,
  client_friendly_explanation TEXT,
  status TEXT CHECK (status IN ('open','in_progress','resolved','wont_fix')) DEFAULT 'open',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ─── Local SEO Items ──────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS local_seo_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending',
  data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ─── Ubersuggest Imports ──────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS ubersuggest_imports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  import_type TEXT NOT NULL,
  filename TEXT,
  column_mapping JSONB DEFAULT '{}',
  raw_data JSONB DEFAULT '[]',
  processed_count INTEGER DEFAULT 0,
  status TEXT CHECK (status IN ('pending','processing','completed','failed')) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- Row Level Security
-- ============================================================

ALTER TABLE agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE gsc_properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE gsc_query_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE ga4_properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE ga4_landing_page_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_briefs ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_qa_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE internal_link_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE backlink_prospects ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE sops ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE technical_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE local_seo_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE ubersuggest_imports ENABLE ROW LEVEL SECURITY;

-- ─── RLS Policies ─────────────────────────────────────────────────────────────

-- Agencies: owner full access
CREATE POLICY "Agency owner full access"
  ON agencies FOR ALL
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

-- Clients: via agency
CREATE POLICY "Client access via agency"
  ON clients FOR ALL
  USING (agency_id IN (SELECT id FROM agencies WHERE owner_id = auth.uid()))
  WITH CHECK (agency_id IN (SELECT id FROM agencies WHERE owner_id = auth.uid()));

-- Tasks: via agency
CREATE POLICY "Task access via agency"
  ON tasks FOR ALL
  USING (agency_id IN (SELECT id FROM agencies WHERE owner_id = auth.uid()))
  WITH CHECK (agency_id IN (SELECT id FROM agencies WHERE owner_id = auth.uid()));

-- Opportunities: via client
CREATE POLICY "Opportunity access via client"
  ON opportunities FOR ALL
  USING (client_id IN (
    SELECT c.id FROM clients c
    JOIN agencies a ON a.id = c.agency_id
    WHERE a.owner_id = auth.uid()
  ));

-- GSC Properties: via client
CREATE POLICY "GSC property access via client"
  ON gsc_properties FOR ALL
  USING (client_id IN (
    SELECT c.id FROM clients c
    JOIN agencies a ON a.id = c.agency_id
    WHERE a.owner_id = auth.uid()
  ));

-- GSC Query Data: via client
CREATE POLICY "GSC query data access via client"
  ON gsc_query_data FOR ALL
  USING (client_id IN (
    SELECT c.id FROM clients c
    JOIN agencies a ON a.id = c.agency_id
    WHERE a.owner_id = auth.uid()
  ));

-- GA4 Properties: via client
CREATE POLICY "GA4 property access via client"
  ON ga4_properties FOR ALL
  USING (client_id IN (
    SELECT c.id FROM clients c
    JOIN agencies a ON a.id = c.agency_id
    WHERE a.owner_id = auth.uid()
  ));

-- GA4 Landing Page Data: via client
CREATE POLICY "GA4 landing page data access via client"
  ON ga4_landing_page_data FOR ALL
  USING (client_id IN (
    SELECT c.id FROM clients c
    JOIN agencies a ON a.id = c.agency_id
    WHERE a.owner_id = auth.uid()
  ));

-- Competitors: via client
CREATE POLICY "Competitor access via client"
  ON competitors FOR ALL
  USING (client_id IN (
    SELECT c.id FROM clients c
    JOIN agencies a ON a.id = c.agency_id
    WHERE a.owner_id = auth.uid()
  ));

-- Keywords: via client
CREATE POLICY "Keyword access via client"
  ON keywords FOR ALL
  USING (client_id IN (
    SELECT c.id FROM clients c
    JOIN agencies a ON a.id = c.agency_id
    WHERE a.owner_id = auth.uid()
  ));

-- Pages: via client
CREATE POLICY "Page access via client"
  ON pages FOR ALL
  USING (client_id IN (
    SELECT c.id FROM clients c
    JOIN agencies a ON a.id = c.agency_id
    WHERE a.owner_id = auth.uid()
  ));

-- Blog Briefs: via client
CREATE POLICY "Blog brief access via client"
  ON blog_briefs FOR ALL
  USING (client_id IN (
    SELECT c.id FROM clients c
    JOIN agencies a ON a.id = c.agency_id
    WHERE a.owner_id = auth.uid()
  ));

-- Blog Drafts: via client
CREATE POLICY "Blog draft access via client"
  ON blog_drafts FOR ALL
  USING (client_id IN (
    SELECT c.id FROM clients c
    JOIN agencies a ON a.id = c.agency_id
    WHERE a.owner_id = auth.uid()
  ));

-- Content QA: via client
CREATE POLICY "Content QA access via client"
  ON content_qa_results FOR ALL
  USING (client_id IN (
    SELECT c.id FROM clients c
    JOIN agencies a ON a.id = c.agency_id
    WHERE a.owner_id = auth.uid()
  ));

-- Internal links: via client
CREATE POLICY "Internal link suggestions access via client"
  ON internal_link_suggestions FOR ALL
  USING (client_id IN (
    SELECT c.id FROM clients c
    JOIN agencies a ON a.id = c.agency_id
    WHERE a.owner_id = auth.uid()
  ));

-- Backlink prospects: via client
CREATE POLICY "Backlink prospect access via client"
  ON backlink_prospects FOR ALL
  USING (client_id IN (
    SELECT c.id FROM clients c
    JOIN agencies a ON a.id = c.agency_id
    WHERE a.owner_id = auth.uid()
  ));

-- Reports: via client
CREATE POLICY "Report access via client"
  ON reports FOR ALL
  USING (client_id IN (
    SELECT c.id FROM clients c
    JOIN agencies a ON a.id = c.agency_id
    WHERE a.owner_id = auth.uid()
  ));

-- Calendar items: via agency
CREATE POLICY "Calendar item access via agency"
  ON calendar_items FOR ALL
  USING (agency_id IN (SELECT id FROM agencies WHERE owner_id = auth.uid()));

-- SOPs: agency-owned or built-in
CREATE POLICY "SOP access"
  ON sops FOR ALL
  USING (
    is_built_in = true
    OR agency_id IN (SELECT id FROM agencies WHERE owner_id = auth.uid())
  );

-- Client History: via client
CREATE POLICY "Client history access via client"
  ON client_history FOR ALL
  USING (client_id IN (
    SELECT c.id FROM clients c
    JOIN agencies a ON a.id = c.agency_id
    WHERE a.owner_id = auth.uid()
  ));

-- Technical Issues: via client
CREATE POLICY "Technical issue access via client"
  ON technical_issues FOR ALL
  USING (client_id IN (
    SELECT c.id FROM clients c
    JOIN agencies a ON a.id = c.agency_id
    WHERE a.owner_id = auth.uid()
  ));

-- Local SEO: via client
CREATE POLICY "Local SEO item access via client"
  ON local_seo_items FOR ALL
  USING (client_id IN (
    SELECT c.id FROM clients c
    JOIN agencies a ON a.id = c.agency_id
    WHERE a.owner_id = auth.uid()
  ));

-- Ubersuggest Imports: via client
CREATE POLICY "Ubersuggest import access via client"
  ON ubersuggest_imports FOR ALL
  USING (client_id IN (
    SELECT c.id FROM clients c
    JOIN agencies a ON a.id = c.agency_id
    WHERE a.owner_id = auth.uid()
  ));

-- ============================================================
-- Utility: Auto-update updated_at timestamp
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at
DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'agencies','clients','tasks','opportunities',
    'gsc_properties','ga4_properties','competitors','keywords','pages',
    'blog_briefs','blog_drafts','internal_link_suggestions',
    'backlink_prospects','reports','calendar_items','sops',
    'technical_issues','local_seo_items','ubersuggest_imports'
  ]
  LOOP
    EXECUTE format(
      'CREATE TRIGGER update_%s_updated_at
       BEFORE UPDATE ON %s
       FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()',
      t, t
    );
  END LOOP;
END $$;

-- ============================================================
-- Seed: Create agency for first user on sign-up (via trigger)
-- ============================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.agencies (name, owner_id)
  VALUES (
    COALESCE(NEW.raw_user_meta_data->>'agency_name', 'My Agency'),
    NEW.id
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

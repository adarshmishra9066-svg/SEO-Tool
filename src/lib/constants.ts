// ─── Task Types ───────────────────────────────────────────────────────────────

export const TASK_TYPES = [
  { value: 'technical_seo', label: 'Technical SEO' },
  { value: 'on_page_seo', label: 'On-Page SEO' },
  { value: 'content_refresh', label: 'Content Refresh' },
  { value: 'new_blog', label: 'New Blog Post' },
  { value: 'internal_linking', label: 'Internal Linking' },
  { value: 'backlink_outreach', label: 'Backlink Outreach' },
  { value: 'competitor_analysis', label: 'Competitor Analysis' },
  { value: 'reporting', label: 'Reporting' },
  { value: 'local_seo', label: 'Local SEO' },
  { value: 'conversion_improvement', label: 'Conversion Improvement' },
  { value: 'metadata_rewrite', label: 'Metadata Rewrite' },
  { value: 'keyword_addition', label: 'Keyword Addition' },
  { value: 'schema_recommendation', label: 'Schema Markup' },
] as const

// ─── Task Statuses ────────────────────────────────────────────────────────────

export const TASK_STATUSES = [
  { value: 'new', label: 'New' },
  { value: 'planned', label: 'Planned' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'waiting', label: 'Waiting' },
  { value: 'completed', label: 'Completed' },
  { value: 'skipped', label: 'Skipped' },
] as const

// ─── Priority Levels ──────────────────────────────────────────────────────────

export const PRIORITY_LEVELS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
] as const

// ─── Client Statuses ──────────────────────────────────────────────────────────

export const CLIENT_STATUSES = [
  { value: 'active', label: 'Active' },
  { value: 'onboarding', label: 'Onboarding' },
  { value: 'paused', label: 'Paused' },
  { value: 'churned', label: 'Churned' },
] as const

// ─── Impact Levels ────────────────────────────────────────────────────────────

export const IMPACT_LEVELS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'very_high', label: 'Very High' },
] as const

// ─── Effort Levels ────────────────────────────────────────────────────────────

export const EFFORT_LEVELS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
] as const

// ─── Urgency Levels ───────────────────────────────────────────────────────────

export const URGENCY_LEVELS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
] as const

// ─── Industries ───────────────────────────────────────────────────────────────

export const INDUSTRIES = [
  { value: 'accounting', label: 'Accounting & Finance' },
  { value: 'automotive', label: 'Automotive' },
  { value: 'construction', label: 'Construction & Trades' },
  { value: 'dental', label: 'Dental & Orthodontics' },
  { value: 'ecommerce', label: 'E-commerce & Retail' },
  { value: 'education', label: 'Education & Training' },
  { value: 'financial_services', label: 'Financial Services' },
  { value: 'health_wellness', label: 'Health & Wellness' },
  { value: 'home_services', label: 'Home Services' },
  { value: 'hospitality', label: 'Hospitality & Travel' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'legal', label: 'Legal Services' },
  { value: 'logistics', label: 'Logistics & Transport' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'medical', label: 'Medical & Healthcare' },
  { value: 'mortgage', label: 'Mortgage & Property' },
  { value: 'nonprofit', label: 'Non-Profit' },
  { value: 'pets', label: 'Pets & Veterinary' },
  { value: 'plumbing_hvac', label: 'Plumbing & HVAC' },
  { value: 'real_estate', label: 'Real Estate' },
  { value: 'restaurants', label: 'Restaurants & Food' },
  { value: 'saas', label: 'SaaS & Software' },
  { value: 'solar_energy', label: 'Solar & Energy' },
  { value: 'technology', label: 'Technology & IT' },
  { value: 'other', label: 'Other' },
] as const

// ─── SOP Categories ───────────────────────────────────────────────────────────

export const SOP_CATEGORIES = [
  { value: 'analytics', label: 'Analytics & Reporting' },
  { value: 'content', label: 'Content & Blogging' },
  { value: 'technical', label: 'Technical SEO' },
  { value: 'on_page', label: 'On-Page Optimisation' },
  { value: 'backlinks', label: 'Backlink Building' },
  { value: 'client_management', label: 'Client Management' },
  { value: 'local_seo', label: 'Local SEO' },
  { value: 'research', label: 'Research & Analysis' },
] as const

// ─── Built-in SOPs ────────────────────────────────────────────────────────────

export type SopStep = {
  order: number
  title: string
  description: string
  tip?: string
}

export type SopChecklistItem = {
  id: string
  label: string
}

export type BuiltInSop = {
  id: string
  title: string
  category: string
  description: string
  estimatedTime: string
  steps: SopStep[]
  checklist: SopChecklistItem[]
}

export const BUILT_IN_SOPS: BuiltInSop[] = [
  {
    id: 'review-gsc',
    title: 'How to Review Google Search Console',
    category: 'analytics',
    description:
      'A systematic process for extracting actionable insights from GSC data every week. Identify declining pages, rising queries, and CTR improvement opportunities.',
    estimatedTime: '30–45 min',
    steps: [
      {
        order: 1,
        title: 'Set the date range',
        description:
          'Set GSC to "Last 28 days" and compare to the previous 28 days. Use 16-month view for seasonal context.',
        tip: 'Always compare like-for-like periods to avoid seasonal distortions.',
      },
      {
        order: 2,
        title: 'Check total clicks and impressions trend',
        description:
          'Look for any sudden drops or spikes. Cross-reference with Google algorithm update dates (use the MozCast or SERPstatus timeline).',
      },
      {
        order: 3,
        title: 'Filter by Queries — sort by Impressions DESC',
        description:
          'Identify queries with 500+ impressions but less than 2% CTR. These are prime CTR improvement candidates.',
        tip: 'Export these to a spreadsheet and tag each as "meta rewrite" or "featured snippet opportunity".',
      },
      {
        order: 4,
        title: 'Filter by Pages — sort by Clicks DESC',
        description:
          'Review your top 20 pages by clicks. Check if any have dropped >20% in clicks vs last period. Flag for investigation.',
      },
      {
        order: 5,
        title: 'Check for indexing issues',
        description:
          'Go to Pages > Not Indexed. Look for "Crawled — currently not indexed" and "Discovered — currently not indexed" categories.',
      },
      {
        order: 6,
        title: 'Review Core Web Vitals',
        description:
          'Check if any URLs have moved from Good to Needs Improvement. Cross-reference with PageSpeed Insights.',
      },
      {
        order: 7,
        title: 'Document findings and create tasks',
        description:
          'For each finding, create a task in the platform with the appropriate type, priority, and recommended action.',
      },
    ],
    checklist: [
      { id: 'gsc-1', label: 'Date range set to 28-day comparison' },
      { id: 'gsc-2', label: 'Total performance trend reviewed' },
      { id: 'gsc-3', label: 'Low CTR / high impression queries identified' },
      { id: 'gsc-4', label: 'Top pages by clicks reviewed' },
      { id: 'gsc-5', label: 'Declining pages flagged' },
      { id: 'gsc-6', label: 'Indexing issues checked' },
      { id: 'gsc-7', label: 'Core Web Vitals reviewed' },
      { id: 'gsc-8', label: 'Tasks created for all findings' },
    ],
  },
  {
    id: 'find-quick-wins',
    title: 'How to Find Quick SEO Wins',
    category: 'research',
    description:
      'Identify the fastest opportunities to move the needle for a client — positions 4–15, pages with good impressions but low CTR, and underperforming content that just needs a refresh.',
    estimatedTime: '45–60 min',
    steps: [
      {
        order: 1,
        title: 'GSC Position 4–15 filter',
        description:
          'In GSC, filter queries by position 4–15 with at least 100 impressions. These are ranking but not getting clicks. Sort by impressions DESC.',
        tip: 'Focus on position 5–8 first — these are most likely to reach page 1 with minor improvements.',
      },
      {
        order: 2,
        title: 'Check the landing pages for each query',
        description:
          'For each query in the 4–15 bucket, visit the ranking page. Ask: Is the query in the title? H1? First 100 words? If not, that\'s an easy win.',
      },
      {
        order: 3,
        title: 'Review page content depth',
        description:
          'Compare your page word count and section coverage with the top 3 ranking pages. If they\'re significantly more comprehensive, a content refresh is needed.',
      },
      {
        order: 4,
        title: 'Identify thin pages with impressions',
        description:
          'Filter by pages with 200+ impressions but less than 500 words of content. These are quick content expansion wins.',
      },
      {
        order: 5,
        title: 'Check internal linking to target pages',
        description:
          'For each quick-win page, verify it receives internal links from relevant high-authority pages. Missing internal links are fast wins.',
      },
      {
        order: 6,
        title: 'Create prioritised task list',
        description:
          'Rank quick wins by: (estimated traffic gain × effort level). Easiest wins with highest traffic potential go first.',
      },
    ],
    checklist: [
      { id: 'qw-1', label: 'GSC positions 4–15 exported' },
      { id: 'qw-2', label: 'Keyword-in-title/H1 checked for each' },
      { id: 'qw-3', label: 'Content depth vs competitors compared' },
      { id: 'qw-4', label: 'Thin pages identified' },
      { id: 'qw-5', label: 'Internal linking gaps noted' },
      { id: 'qw-6', label: 'Tasks created and prioritised' },
    ],
  },
  {
    id: 'improve-ctr',
    title: 'How to Improve CTR on Existing Pages',
    category: 'on_page',
    description:
      'A systematic approach to improving click-through rates by rewriting meta titles and descriptions using proven SERP copywriting techniques.',
    estimatedTime: '20–30 min per page',
    steps: [
      {
        order: 1,
        title: 'Identify CTR improvement candidates',
        description:
          'Use GSC: filter pages with position 1–10 and CTR below the position benchmark (P1: >30%, P2: >15%, P3: >10%, P4–5: >5%).',
      },
      {
        order: 2,
        title: 'Analyse current meta title and description',
        description:
          'Review the current SERP snippet. Is the primary keyword in the title? Is there a clear value proposition? Is there a CTA or benefit statement?',
      },
      {
        order: 3,
        title: 'Check competitor SERP snippets',
        description:
          'Search the primary keyword in a private browser. Analyse what the top 5 results are doing — note power words, numbers, brackets, CTAs.',
      },
      {
        order: 4,
        title: 'Write 3 title variations',
        description:
          'Create 3 variants using formulas: (1) Number + Keyword + Year, (2) Question-based, (3) Benefit-led. Keep titles under 60 characters.',
        tip: 'Use numbers, brackets, and current year to increase CTR by 15–20%.',
      },
      {
        order: 5,
        title: 'Write meta description',
        description:
          'Write a 140–155 character meta description that: includes the primary keyword, answers the search intent, has a soft CTA (Learn how, Discover, Find out).',
      },
      {
        order: 6,
        title: 'Check for rich result eligibility',
        description:
          'Does the page qualify for a featured snippet, FAQ, or How-to schema? If so, optimise content structure and add schema markup.',
      },
      {
        order: 7,
        title: 'Implement and track',
        description:
          'Update the metadata and note the date in the client history log. Check GSC in 28 days to compare CTR performance.',
      },
    ],
    checklist: [
      { id: 'ctr-1', label: 'CTR benchmark compared by position' },
      { id: 'ctr-2', label: 'Current metadata analysed' },
      { id: 'ctr-3', label: 'Competitor SERP snippets reviewed' },
      { id: 'ctr-4', label: '3 title variations written' },
      { id: 'ctr-5', label: 'Meta description written (140–155 chars)' },
      { id: 'ctr-6', label: 'Rich result eligibility checked' },
      { id: 'ctr-7', label: 'Change logged in client history' },
    ],
  },
  {
    id: 'refresh-blog',
    title: 'How to Refresh an Existing Blog Post',
    category: 'content',
    description:
      'A complete blog refresh process to re-establish rankings, improve E-E-A-T signals, add AEO elements, and boost engagement for existing content.',
    estimatedTime: '2–4 hours',
    steps: [
      {
        order: 1,
        title: 'Diagnose the page performance',
        description:
          'In GSC, check the page\'s traffic trend over 16 months. Identify if it\'s declining, stagnant, or never ranked. Note the primary ranking query.',
      },
      {
        order: 2,
        title: 'Perform a content gap analysis',
        description:
          'Search the primary keyword in a private browser. Review the top 5 results: What topics do they cover that your post misses? What questions do they answer?',
      },
      {
        order: 3,
        title: 'Update statistics and data',
        description:
          'Replace all outdated statistics, studies, and data points with current sources (within 12 months). This is critical for E-E-A-T.',
      },
      {
        order: 4,
        title: 'Add missing sections and FAQs',
        description:
          'Use "People Also Ask" results from the SERP, Google Autocomplete, and AnswerThePublic to identify questions to add as FAQ sections.',
        tip: 'Add an FAQ section with 4–8 questions using FAQPage schema for AEO visibility.',
      },
      {
        order: 5,
        title: 'Improve structure and readability',
        description:
          'Check: intro hooks in first 100 words, H2/H3 structure matches search intent, bullet points for scanability, conclusion with clear CTA.',
      },
      {
        order: 6,
        title: 'Strengthen E-E-A-T signals',
        description:
          'Add author bio, cite expert sources, add real examples/case studies, include first-hand experience statements where relevant.',
      },
      {
        order: 7,
        title: 'Internal linking audit',
        description:
          'Add 3–5 internal links to/from the refreshed post using natural anchor text. Link to related service pages and other relevant blogs.',
      },
      {
        order: 8,
        title: 'Update publish date and republish',
        description:
          'Change the "last updated" date, update the URL\'s lastmod in the sitemap, and (optionally) republish on social/email to drive fresh signals.',
      },
    ],
    checklist: [
      { id: 'br-1', label: 'GSC performance diagnosed' },
      { id: 'br-2', label: 'Content gap analysis completed' },
      { id: 'br-3', label: 'Statistics and data updated' },
      { id: 'br-4', label: 'FAQ section added with schema' },
      { id: 'br-5', label: 'Structure and readability improved' },
      { id: 'br-6', label: 'E-E-A-T signals strengthened' },
      { id: 'br-7', label: 'Internal links added (3–5)' },
      { id: 'br-8', label: 'Publish date updated' },
      { id: 'br-9', label: 'Change logged in history' },
    ],
  },
  {
    id: 'optimise-service-page',
    title: 'How to Optimise a Service Page',
    category: 'on_page',
    description:
      'End-to-end optimisation process for a service or product page — from keyword alignment to conversion element placement and technical checks.',
    estimatedTime: '3–5 hours',
    steps: [
      {
        order: 1,
        title: 'Define the primary and secondary keywords',
        description:
          'Confirm the primary keyword (highest volume, best intent match) and 3–5 secondary/LSI keywords. Use the client\'s keyword data in the platform.',
      },
      {
        order: 2,
        title: 'Audit the current page',
        description:
          'Check: keyword in URL, H1, first 100 words, at least 2 H2s, meta title/description. Note word count vs top 3 competitors.',
      },
      {
        order: 3,
        title: 'Optimise on-page elements',
        description:
          'Rewrite H1 to include the primary keyword naturally. Update meta title (55–60 chars) and description (140–155 chars). Optimise image alt text.',
      },
      {
        order: 4,
        title: 'Improve content depth and structure',
        description:
          'Add sections covering: what the service includes, who it\'s for, process/methodology, local area mentions (if local), pricing signals, FAQs.',
      },
      {
        order: 5,
        title: 'Add conversion elements',
        description:
          'Ensure: clear headline CTA above the fold, trust signals (reviews, credentials, years in business), phone number visible, contact form easy to find.',
      },
      {
        order: 6,
        title: 'Add LocalBusiness or Service schema',
        description:
          'Implement appropriate schema markup. For local services: LocalBusiness. For general services: Service schema with aggregateRating if applicable.',
      },
      {
        order: 7,
        title: 'Internal linking',
        description:
          'Add 2–4 contextual internal links from blog posts and other service pages using keyword-rich anchor text.',
      },
      {
        order: 8,
        title: 'Check page speed',
        description:
          'Run PageSpeed Insights. Ensure LCP < 2.5s, CLS < 0.1, INP < 200ms. Flag any issues as technical tasks.',
      },
    ],
    checklist: [
      { id: 'sp-1', label: 'Primary and secondary keywords confirmed' },
      { id: 'sp-2', label: 'On-page elements audited' },
      { id: 'sp-3', label: 'H1, meta title, meta description rewritten' },
      { id: 'sp-4', label: 'Content depth matches competitors' },
      { id: 'sp-5', label: 'Conversion elements verified' },
      { id: 'sp-6', label: 'Schema markup added' },
      { id: 'sp-7', label: 'Internal links added' },
      { id: 'sp-8', label: 'Page speed checked' },
    ],
  },
  {
    id: 'add-internal-links',
    title: 'How to Add Internal Links Strategically',
    category: 'on_page',
    description:
      'A systematic process for building a powerful internal link structure that distributes authority, improves crawlability, and boosts rankings for priority pages.',
    estimatedTime: '1–2 hours per client',
    steps: [
      {
        order: 1,
        title: 'Identify priority pages (link targets)',
        description:
          'List the top 5–10 pages you want to rank higher — typically service pages, location pages, or key commercial content.',
      },
      {
        order: 2,
        title: 'Find relevant source pages',
        description:
          'Use Google Search: site:clientdomain.com "target keyword" to find existing pages that mention the topic. These are natural linking opportunities.',
        tip: 'Also check blog posts and resource pages — they typically have the most linking opportunities.',
      },
      {
        order: 3,
        title: 'Review current internal link counts',
        description:
          'Use Screaming Frog or Ubersuggest to see how many internal links each priority page receives. Pages with few links are underserved by the site\'s authority.',
      },
      {
        order: 4,
        title: 'Plan anchor text variations',
        description:
          'For each link, plan natural anchor text: 50% exact/partial match keyword, 30% related phrases, 20% generic (e.g., "learn more", "our services").',
      },
      {
        order: 5,
        title: 'Add links in context',
        description:
          'Edit each source page to naturally include a contextual link using the planned anchor text. Ensure the link makes editorial sense in context.',
      },
      {
        order: 6,
        title: 'Check for broken internal links',
        description:
          'While auditing, fix any broken internal links (404s) you find. Redirect or update the link destination.',
      },
      {
        order: 7,
        title: 'Log changes in history',
        description:
          'Record all changes in the client history log with page URLs, anchor text used, and expected impact.',
      },
    ],
    checklist: [
      { id: 'il-1', label: 'Priority target pages identified' },
      { id: 'il-2', label: 'Source pages found via site: search' },
      { id: 'il-3', label: 'Current internal link counts reviewed' },
      { id: 'il-4', label: 'Anchor text variations planned' },
      { id: 'il-5', label: 'Links added in context' },
      { id: 'il-6', label: 'Broken internal links fixed' },
      { id: 'il-7', label: 'All changes logged in history' },
    ],
  },
  {
    id: 'check-backlink-quality',
    title: 'How to Check Backlink Quality',
    category: 'backlinks',
    description:
      'Evaluate the quality of existing and new backlinks to protect against penalties, identify valuable links, and assess new link opportunities.',
    estimatedTime: '1–2 hours',
    steps: [
      {
        order: 1,
        title: 'Export the backlink profile',
        description:
          'Use Ubersuggest, Ahrefs, or Moz to export the full backlink profile. Include: URL, anchor text, DR/DA, spam score, follow/nofollow.',
      },
      {
        order: 2,
        title: 'Apply quality filters',
        description:
          'Flag links as suspicious if: Spam Score > 30%, Domain Rating < 10 with generic anchor text, anchor text is exact-match keyword-heavy, link is from a PBN or link farm pattern.',
      },
      {
        order: 3,
        title: 'Assess topical relevance',
        description:
          'For each link source, check: Is the linking page topically related to the client\'s niche? A DA 30 link from a relevant site beats a DA 50 link from an unrelated site.',
      },
      {
        order: 4,
        title: 'Check anchor text distribution',
        description:
          'Calculate: exact-match % (should be < 20%), brand anchors % (should be > 40%), natural/URL anchors %. An over-optimised anchor profile is a risk signal.',
      },
      {
        order: 5,
        title: 'Identify toxic links',
        description:
          'Flag any links from: hacked sites, adult/gambling sites without relevance, spam directories, sites with manual actions. Document these for disavow consideration.',
      },
      {
        order: 6,
        title: 'Create disavow file if needed',
        description:
          'If toxic links are found, create or update the Google disavow file. Submit via Google Search Console. Document what was disavowed and why.',
      },
      {
        order: 7,
        title: 'Identify gap opportunities',
        description:
          'Note high-quality referring domains the client doesn\'t have. Cross-reference with competitor backlink profiles for outreach prospects.',
      },
    ],
    checklist: [
      { id: 'bq-1', label: 'Full backlink profile exported' },
      { id: 'bq-2', label: 'Quality filters applied' },
      { id: 'bq-3', label: 'Topical relevance assessed' },
      { id: 'bq-4', label: 'Anchor text distribution calculated' },
      { id: 'bq-5', label: 'Toxic links identified' },
      { id: 'bq-6', label: 'Disavow file updated if needed' },
      { id: 'bq-7', label: 'Gap opportunities noted' },
    ],
  },
  {
    id: 'prepare-client-report',
    title: 'How to Prepare a Monthly Client Report',
    category: 'client_management',
    description:
      'A structured process for creating clear, value-demonstrating monthly SEO reports that clients actually understand and appreciate.',
    estimatedTime: '2–3 hours',
    steps: [
      {
        order: 1,
        title: 'Pull GSC data (28-day vs prior 28-day)',
        description:
          'Export: total clicks, impressions, CTR, average position. Note top 10 queries by clicks. Flag queries that entered/left top 10.',
      },
      {
        order: 2,
        title: 'Pull GA4 organic traffic data',
        description:
          'Export organic sessions, users, engagement rate, conversions, and revenue. Compare to last month and same month last year (YoY).',
      },
      {
        order: 3,
        title: 'Compile tasks completed this month',
        description:
          'List all completed tasks from the platform. Group by type: technical fixes, content published, links built, optimisations done.',
      },
      {
        order: 4,
        title: 'Write the Wins section',
        description:
          'Highlight 3–5 concrete wins: "Page X jumped from position 12 to 4 for \'keyword\'", "Blog post drove 340 organic sessions", "Fixed 23 broken links".',
        tip: 'Be specific with numbers — vague wins lose client confidence.',
      },
      {
        order: 5,
        title: 'Write the Challenges section',
        description:
          'Be transparent about any drops or issues. Explain why they happened and what\'s being done. Clients respect honesty over spin.',
      },
      {
        order: 6,
        title: 'Write Next Month\'s Plan',
        description:
          'List 5–8 specific actions planned for next month. This demonstrates proactive strategy and gives the client a clear picture of value.',
      },
      {
        order: 7,
        title: 'Format and send',
        description:
          'Use the report template. Keep language client-friendly (no jargon). Add a 1-paragraph executive summary at the top. Send via the platform or email.',
      },
    ],
    checklist: [
      { id: 'cr-1', label: 'GSC 28-day data pulled' },
      { id: 'cr-2', label: 'GA4 organic data pulled' },
      { id: 'cr-3', label: 'Completed tasks listed' },
      { id: 'cr-4', label: 'Wins section written (with specifics)' },
      { id: 'cr-5', label: 'Challenges section written honestly' },
      { id: 'cr-6', label: 'Next month plan written' },
      { id: 'cr-7', label: 'Executive summary added' },
      { id: 'cr-8', label: 'Report reviewed and sent' },
    ],
  },
]

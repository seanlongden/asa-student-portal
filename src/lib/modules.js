export const MODULES = [
  {
    id: 'module-1',
    order: 1,
    title: 'Define Your Offer',
    description: 'Nail down your niche, service, and pricing so you can target the right clients with a compelling offer.',
    lessons: [
      'Why niching down accelerates growth',
      'How to pick a profitable niche',
      'Structuring your service offering',
      'Setting your pricing for scale',
    ],
    inputs: [
      { key: 'target_niche', label: 'Target Niche', type: 'text', placeholder: 'e.g., B2B SaaS companies doing $1M-10M ARR' },
      { key: 'service_offering', label: 'Service Offering', type: 'textarea', placeholder: 'Describe your core service in 2-3 sentences...' },
      { key: 'pricing', label: 'Pricing', type: 'text', placeholder: 'e.g., $3,000/month retainer' },
      { key: 'unique_mechanism', label: 'Unique Mechanism / Differentiator', type: 'textarea', placeholder: 'What makes your approach different?' },
    ],
  },
  {
    id: 'module-2',
    order: 2,
    title: 'Build Your Ideal Client Profile',
    description: 'Identify exactly who you\'re going after so every email lands with the right person.',
    lessons: [
      'Defining your Ideal Client Profile (ICP)',
      'Identifying decision makers and stakeholders',
      'Where to find your ideal prospects',
      'Qualification criteria that matter',
    ],
    inputs: [
      { key: 'icp_description', label: 'Ideal Client Description', type: 'textarea', placeholder: 'Describe your ideal client in detail...' },
      { key: 'target_industries', label: 'Target Industries', type: 'text', placeholder: 'e.g., SaaS, eCommerce, Professional Services' },
      { key: 'target_titles', label: 'Target Job Titles', type: 'text', placeholder: 'e.g., CEO, VP of Marketing, Head of Growth' },
      { key: 'company_size', label: 'Company Size Range', type: 'text', placeholder: 'e.g., 10-50 employees' },
    ],
  },
  {
    id: 'module-3',
    order: 3,
    title: 'Cold Email Infrastructure Setup',
    description: 'Set up your domains, mailboxes, and sending infrastructure the right way from day one.',
    lessons: [
      'How many domains and mailboxes you need',
      'Domain purchasing and DNS configuration',
      'Email warmup strategy and timeline',
      'Choosing and configuring your sending tool',
    ],
    inputs: [
      { key: 'domains_purchased', label: 'Domains Purchased', type: 'textarea', placeholder: 'List your sending domains...' },
      { key: 'mailboxes_count', label: 'Number of Mailboxes', type: 'text', placeholder: 'e.g., 15' },
      { key: 'sending_tool', label: 'Cold Email Tool Selected', type: 'text', placeholder: 'e.g., Instantly, Smartlead' },
      { key: 'warmup_start_date', label: 'Warmup Start Date', type: 'text', placeholder: 'e.g., 2024-01-15' },
    ],
  },
  {
    id: 'module-4',
    order: 4,
    title: 'Build Your Lead List',
    description: 'Source, scrape, and verify leads at scale so you never run out of prospects to email.',
    lessons: [
      'Lead sourcing strategies that work',
      'Using Apollo, LinkedIn Sales Nav, and scrapers',
      'Email verification best practices',
      'Building and segmenting your list',
    ],
    inputs: [
      { key: 'lead_sources', label: 'Lead Sources', type: 'textarea', placeholder: 'Where are you getting leads? (e.g., Apollo, LinkedIn, etc.)' },
      { key: 'weekly_lead_target', label: 'Weekly Lead Target', type: 'text', placeholder: 'e.g., 500 verified leads per week' },
      { key: 'verification_tool', label: 'Email Verification Tool', type: 'text', placeholder: 'e.g., MillionVerifier, NeverBounce' },
    ],
  },
  {
    id: 'module-5',
    order: 5,
    title: 'Write Your Email Sequences',
    description: 'Craft cold emails that get replies using proven templates, frameworks, and sequences.',
    lessons: [
      'The anatomy of a high-converting cold email',
      'Subject line formulas that get opens',
      'Writing your 4-step email sequence',
      'Personalization at scale without losing quality',
    ],
    inputs: [
      { key: 'email_1', label: 'Email 1 (Initial Outreach)', type: 'textarea', placeholder: 'Write your first email...' },
      { key: 'email_2', label: 'Email 2 (Follow-up #1)', type: 'textarea', placeholder: 'Write your first follow-up...' },
      { key: 'email_3', label: 'Email 3 (Follow-up #2)', type: 'textarea', placeholder: 'Write your second follow-up...' },
      { key: 'email_4', label: 'Email 4 (Break-up)', type: 'textarea', placeholder: 'Write your break-up email...' },
    ],
  },
  {
    id: 'module-6',
    order: 6,
    title: 'Launch & Optimize Campaigns',
    description: 'Go live with your campaigns and learn how to read the data to continuously improve results.',
    lessons: [
      'Pre-launch checklist',
      'Daily send volume strategy',
      'Reading and interpreting your campaign metrics',
      'A/B testing for continuous improvement',
    ],
    inputs: [
      { key: 'daily_send_volume', label: 'Daily Send Volume', type: 'text', placeholder: 'e.g., 200 emails/day' },
      { key: 'campaign_start_date', label: 'Campaign Launch Date', type: 'text', placeholder: 'e.g., 2024-02-01' },
      { key: 'ab_test_plan', label: 'A/B Testing Plan', type: 'textarea', placeholder: 'What will you test first? Subject lines, CTAs, etc.' },
    ],
  },
  {
    id: 'module-7',
    order: 7,
    title: 'Handle Replies & Book Calls',
    description: 'Turn positive replies into booked sales calls with a systematic follow-up process.',
    lessons: [
      'Categorizing reply types',
      'Response templates for each reply type',
      'The 5-minute reply rule',
      'Booking calls and reducing no-shows',
    ],
    inputs: [
      { key: 'positive_reply_template', label: 'Positive Reply Response Template', type: 'textarea', placeholder: 'How will you respond to interested prospects?' },
      { key: 'booking_link', label: 'Calendar Booking Link', type: 'text', placeholder: 'e.g., https://calendly.com/yourname' },
      { key: 'objection_responses', label: 'Common Objection Responses', type: 'textarea', placeholder: 'List common objections and your responses...' },
    ],
  },
  {
    id: 'module-8',
    order: 8,
    title: 'Close Deals & Scale to $30K/Month',
    description: 'Master the sales call, close deals, onboard clients, and build the systems to hit $30K MRR.',
    lessons: [
      'The sales call framework that converts',
      'Handling pricing objections with confidence',
      'Client onboarding that maximizes retention',
      'Scaling: hiring, SOPs, and growth levers',
    ],
    inputs: [
      { key: 'sales_script_notes', label: 'Sales Call Framework Notes', type: 'textarea', placeholder: 'Key talking points for your sales calls...' },
      { key: 'onboarding_checklist', label: 'Client Onboarding Checklist', type: 'textarea', placeholder: 'Steps to onboard a new client...' },
      { key: 'revenue_target', label: '90-Day Revenue Target', type: 'text', placeholder: 'e.g., $30,000/month' },
      { key: 'scaling_plan', label: 'Scaling Plan', type: 'textarea', placeholder: 'How will you scale beyond $30K? Hiring plans, systems needed...' },
    ],
  },
];

export function getModuleById(id) {
  return MODULES.find((m) => m.id === id) || null;
}

export function getModuleByOrder(order) {
  return MODULES.find((m) => m.order === order) || null;
}

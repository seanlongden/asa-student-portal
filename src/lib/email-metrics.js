// Email metrics adapters for supported cold email tools.
// Each adapter fetches campaign metrics and returns a normalized format.

export async function fetchMetrics(tool, apiKey) {
  switch (tool?.toLowerCase()) {
    case 'instantly':
      return fetchInstantlyMetrics(apiKey);
    case 'smartlead':
      return fetchSmartleadMetrics(apiKey);
    case 'plusvibe':
      return fetchPlusvibeMetrics(apiKey);
    case 'emailbison':
      return fetchEmailbisonMetrics(apiKey);
    default:
      throw new Error(`Unsupported email tool: ${tool}`);
  }
}

// ---- Instantly ----
// Docs: https://developer.instantly.ai
async function fetchInstantlyMetrics(apiKey) {
  const res = await fetch(
    `https://api.instantly.ai/api/v1/analytics/campaign/summary?api_key=${encodeURIComponent(apiKey)}`,
    { headers: { 'Content-Type': 'application/json' } }
  );
  if (!res.ok) throw new Error(`Instantly API error: ${res.status}`);
  const data = await res.json();

  return normalizeMetrics({
    emailsSent: data.total_emails_sent || 0,
    opens: data.total_opened || 0,
    replies: data.total_replies || 0,
    positiveReplies: data.total_positive_replies || 0,
    bounces: data.total_bounced || 0,
  });
}

// ---- Smartlead ----
// Docs: https://api.smartlead.ai/reference
async function fetchSmartleadMetrics(apiKey) {
  const res = await fetch(
    `https://server.smartlead.ai/api/v1/campaigns?api_key=${encodeURIComponent(apiKey)}`,
    { headers: { 'Content-Type': 'application/json' } }
  );
  if (!res.ok) throw new Error(`Smartlead API error: ${res.status}`);
  const campaigns = await res.json();

  let totals = { emailsSent: 0, opens: 0, replies: 0, positiveReplies: 0, bounces: 0 };

  for (const campaign of campaigns) {
    const statsRes = await fetch(
      `https://server.smartlead.ai/api/v1/campaigns/${campaign.id}/analytics?api_key=${encodeURIComponent(apiKey)}`
    );
    if (statsRes.ok) {
      const stats = await statsRes.json();
      totals.emailsSent += stats.sent_count || 0;
      totals.opens += stats.open_count || 0;
      totals.replies += stats.reply_count || 0;
      totals.bounces += stats.bounce_count || 0;
    }
  }

  return normalizeMetrics(totals);
}

// ---- PlusVibe (formerly pipl.ai) ----
// Docs: https://developer.plusvibe.ai
// Auth: API key passed as query param, workspace_id required
// Rate limit: 5 req/sec
async function fetchPlusvibeMetrics(apiKey) {
  // PlusVibe API key format may include workspace: "key:workspace_id"
  let key = apiKey;
  let workspaceId = '';
  if (apiKey.includes(':')) {
    [key, workspaceId] = apiKey.split(':');
  }

  const params = new URLSearchParams({ api_key: key });
  if (workspaceId) params.set('workspace_id', workspaceId);

  const res = await fetch(
    `https://api.plusvibe.ai/api/v1/campaigns?${params}`,
    { headers: { 'Content-Type': 'application/json' } }
  );
  if (!res.ok) throw new Error(`PlusVibe API error: ${res.status}`);
  const data = await res.json();
  const campaigns = data.campaigns || data || [];

  let totals = { emailsSent: 0, opens: 0, replies: 0, positiveReplies: 0, bounces: 0 };

  for (const campaign of campaigns) {
    const statsRes = await fetch(
      `https://api.plusvibe.ai/api/v1/campaigns/${campaign.id}/analytics?${params}`
    );
    if (statsRes.ok) {
      const stats = await statsRes.json();
      totals.emailsSent += stats.emails_sent || stats.sent || 0;
      totals.opens += stats.emails_opened || stats.opened || 0;
      totals.replies += stats.emails_replied || stats.replied || 0;
      totals.positiveReplies += stats.positive_replies || 0;
      totals.bounces += stats.emails_bounced || stats.bounced || 0;
    }
  }

  return normalizeMetrics(totals);
}

// ---- EmailBison ----
// Docs: https://docs.emailbison.com / https://dedi.emailbison.com/api/reference
// Auth: Bearer token (Authorization: Bearer YOUR_API_KEY)
// Endpoints: /api/campaigns/sequence-steps, /api/replies, etc.
async function fetchEmailbisonMetrics(apiKey) {
  const headers = {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  };

  // Fetch campaign sequence steps to get send stats
  const campaignsRes = await fetch(
    'https://dedi.emailbison.com/api/campaigns/sequence-steps',
    { headers }
  );
  if (!campaignsRes.ok) throw new Error(`EmailBison API error: ${campaignsRes.status}`);
  const campaignData = await campaignsRes.json();
  const steps = campaignData.data || campaignData || [];

  let totals = { emailsSent: 0, opens: 0, replies: 0, positiveReplies: 0, bounces: 0 };

  // Aggregate stats from sequence steps
  for (const step of steps) {
    totals.emailsSent += step.sent_count || step.emails_sent || 0;
    totals.opens += step.open_count || step.opens || 0;
    totals.bounces += step.bounce_count || step.bounces || 0;
  }

  // Fetch replies separately
  const repliesRes = await fetch(
    'https://dedi.emailbison.com/api/replies',
    { headers }
  );
  if (repliesRes.ok) {
    const repliesData = await repliesRes.json();
    const replies = repliesData.data || repliesData || [];
    totals.replies = replies.length;
    // Count "interested" replies as positive
    totals.positiveReplies = replies.filter(
      (r) => r.status === 'interested' || r.is_interested
    ).length;
  }

  return normalizeMetrics(totals);
}

// ---- Normalizer ----
function normalizeMetrics(raw) {
  const emailsSent = raw.emailsSent || 0;
  return {
    emailsSent,
    replies: raw.replies || 0,
    positiveReplies: raw.positiveReplies || 0,
    openRate: emailsSent > 0 ? ((raw.opens || 0) / emailsSent) * 100 : 0,
    bounceRate: emailsSent > 0 ? ((raw.bounces || 0) / emailsSent) * 100 : 0,
  };
}

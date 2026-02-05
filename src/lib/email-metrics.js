// Email metrics adapters for supported cold email tools.
// Each adapter fetches campaign metrics and returns a normalized format.

export async function fetchMetrics(tool, apiKey) {
  switch (tool?.toLowerCase()) {
    case 'instantly':
      return fetchInstantlyMetrics(apiKey);
    case 'smartlead':
      return fetchSmartleadMetrics(apiKey);
    case 'mailshake':
      return fetchMailshakeMetrics(apiKey);
    case 'woodpecker':
      return fetchWoodpeckerMetrics(apiKey);
    default:
      throw new Error(`Unsupported email tool: ${tool}`);
  }
}

// ---- Instantly ----
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

// ---- Mailshake ----
async function fetchMailshakeMetrics(apiKey) {
  const res = await fetch('https://api.mailshake.com/2017-04-01/campaigns/list', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${apiKey}:`).toString('base64')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({}),
  });
  if (!res.ok) throw new Error(`Mailshake API error: ${res.status}`);
  const data = await res.json();

  let totals = { emailsSent: 0, opens: 0, replies: 0, positiveReplies: 0, bounces: 0 };

  if (data.results) {
    for (const campaign of data.results) {
      totals.emailsSent += campaign.sent || 0;
      totals.opens += campaign.opened || 0;
      totals.replies += campaign.replied || 0;
      totals.bounces += campaign.bounced || 0;
    }
  }

  return normalizeMetrics(totals);
}

// ---- Woodpecker ----
async function fetchWoodpeckerMetrics(apiKey) {
  const res = await fetch('https://api.woodpecker.co/rest/v1/campaign_list', {
    headers: {
      Authorization: `Basic ${Buffer.from(`${apiKey}:X`).toString('base64')}`,
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) throw new Error(`Woodpecker API error: ${res.status}`);
  const campaigns = await res.json();

  let totals = { emailsSent: 0, opens: 0, replies: 0, positiveReplies: 0, bounces: 0 };

  for (const campaign of campaigns) {
    const statsRes = await fetch(
      `https://api.woodpecker.co/rest/v1/campaigns/${campaign.id}/stats`,
      {
        headers: {
          Authorization: `Basic ${Buffer.from(`${apiKey}:X`).toString('base64')}`,
        },
      }
    );
    if (statsRes.ok) {
      const stats = await statsRes.json();
      totals.emailsSent += stats.delivered || 0;
      totals.opens += stats.opened || 0;
      totals.replies += stats.replied || 0;
      totals.bounces += stats.bounced || 0;
    }
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

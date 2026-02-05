'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [tab, setTab] = useState('overview');
  const [syncing, setSyncing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/dashboard')
      .then((r) => {
        if (r.status === 403) {
          router.push('/reactivate');
          return null;
        }
        return r.json();
      })
      .then((d) => {
        if (d) setData(d);
      });
  }, [router]);

  const handleSync = async () => {
    setSyncing(true);
    try {
      await fetch('/api/metrics/sync', { method: 'POST' });
      // Refresh dashboard data
      const res = await fetch('/api/dashboard');
      const d = await res.json();
      setData(d);
    } catch (err) {
      console.error('Sync error:', err);
    }
    setSyncing(false);
  };

  if (!data) return <div className="loading">Loading dashboard...</div>;

  const { student, leads, clients, metrics } = data;
  const totalMRR = clients.reduce((sum, c) => sum + (c.monthlyValue || 0), 0);
  const activeClients = clients.filter((c) => c.status === 'Active').length;
  const pipelineCount = leads.filter((l) => l.stage !== 'Won' && l.stage !== 'Lost').length;

  // Latest metrics
  const latestMetrics = metrics[0] || {};
  const totalEmailsSent = metrics.reduce((sum, m) => sum + (m.emailsSent || 0), 0);
  const totalReplies = metrics.reduce((sum, m) => sum + (m.replies || 0), 0);
  const totalPositiveReplies = metrics.reduce(
    (sum, m) => sum + (m.positiveReplies || 0),
    0
  );

  const tabs = ['overview', 'pipeline', 'clients', 'metrics'];

  return (
    <div>
      <div className="page-header">
        <h1>Welcome back, {student.name}</h1>
        <p>Here&apos;s how your agency is performing.</p>
      </div>

      {/* KPI Cards */}
      <div className="card-grid">
        <div className="stat-card">
          <div className="stat-value">${totalMRR.toLocaleString()}</div>
          <div className="stat-label">Monthly Revenue (MRR)</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{activeClients}</div>
          <div className="stat-label">Active Clients</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{pipelineCount}</div>
          <div className="stat-label">Leads in Pipeline</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{totalEmailsSent.toLocaleString()}</div>
          <div className="stat-label">Emails Sent (12 wks)</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        {tabs.map((t) => (
          <button
            key={t}
            className={`tab ${tab === t ? 'active' : ''}`}
            onClick={() => setTab(t)}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {tab === 'overview' && (
        <div>
          <div className="card-grid">
            <div className="card">
              <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>Quick Actions</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <Link href="/training" className="btn btn-primary btn-sm">
                  Continue Training
                </Link>
                <Link href="/my-work" className="btn btn-secondary btn-sm">
                  View My Work
                </Link>
                <Link href="/settings" className="btn btn-secondary btn-sm">
                  Connect Email Tool
                </Link>
              </div>
            </div>
            <div className="card">
              <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>This Week&apos;s Metrics</h3>
              {latestMetrics.emailsSent !== undefined ? (
                <div>
                  <div style={{ marginBottom: '0.5rem' }}>
                    <span className="text-muted text-sm">Emails Sent:</span>{' '}
                    <strong>{latestMetrics.emailsSent}</strong>
                  </div>
                  <div style={{ marginBottom: '0.5rem' }}>
                    <span className="text-muted text-sm">Replies:</span>{' '}
                    <strong>{latestMetrics.replies}</strong>
                  </div>
                  <div style={{ marginBottom: '0.5rem' }}>
                    <span className="text-muted text-sm">Positive Replies:</span>{' '}
                    <strong>{latestMetrics.positiveReplies}</strong>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted">
                  No metrics yet.{' '}
                  <Link href="/settings">Connect your email tool</Link> to start tracking.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Pipeline Tab */}
      {tab === 'pipeline' && (
        <div className="card">
          {leads.length === 0 ? (
            <p className="text-muted">No leads in your pipeline yet.</p>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Lead</th>
                    <th>Company</th>
                    <th>Stage</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((l) => (
                    <tr key={l.id}>
                      <td>{l.name}</td>
                      <td>{l.company}</td>
                      <td>
                        <span
                          className={`badge ${
                            l.stage === 'Won'
                              ? 'badge-success'
                              : l.stage === 'Lost'
                              ? 'badge-danger'
                              : 'badge-primary'
                          }`}
                        >
                          {l.stage}
                        </span>
                      </td>
                      <td className="text-muted">{l.positiveReplyDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Clients Tab */}
      {tab === 'clients' && (
        <div className="card">
          {clients.length === 0 ? (
            <p className="text-muted">No clients yet. Keep working the pipeline!</p>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Client</th>
                    <th>Monthly Value</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map((c) => (
                    <tr key={c.id}>
                      <td>{c.name}</td>
                      <td>${(c.monthlyValue || 0).toLocaleString()}</td>
                      <td>
                        <span
                          className={`badge ${
                            c.status === 'Active' ? 'badge-success' : 'badge-gray'
                          }`}
                        >
                          {c.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Metrics Tab */}
      {tab === 'metrics' && (
        <div>
          <div className="flex-between mb-2">
            <h3 style={{ fontSize: '1rem' }}>Email Campaign Metrics (Last 12 Weeks)</h3>
            {student.hasApiKey && (
              <button
                className="btn btn-secondary btn-sm"
                onClick={handleSync}
                disabled={syncing}
              >
                {syncing ? 'Syncing...' : 'Sync Metrics'}
              </button>
            )}
          </div>

          {!student.hasApiKey && (
            <div className="alert alert-info">
              <Link href="/settings">Connect your email tool</Link> to start seeing metrics
              here.
            </div>
          )}

          {/* Totals */}
          <div className="metrics-grid mb-3">
            <div className="metric-card">
              <div className="metric-value">{totalEmailsSent.toLocaleString()}</div>
              <div className="metric-label">Total Emails Sent</div>
            </div>
            <div className="metric-card">
              <div className="metric-value">{totalReplies}</div>
              <div className="metric-label">Total Replies</div>
            </div>
            <div className="metric-card">
              <div className="metric-value">{totalPositiveReplies}</div>
              <div className="metric-label">Positive Replies</div>
            </div>
            <div className="metric-card">
              <div className="metric-value">
                {totalEmailsSent > 0
                  ? ((totalReplies / totalEmailsSent) * 100).toFixed(1)
                  : 0}
                %
              </div>
              <div className="metric-label">Reply Rate</div>
            </div>
          </div>

          {/* Weekly breakdown */}
          {metrics.length > 0 ? (
            <div className="card">
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Week</th>
                      <th>Emails Sent</th>
                      <th>Replies</th>
                      <th>Positive Replies</th>
                      <th>Reply Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metrics.map((m, i) => (
                      <tr key={i}>
                        <td>{m.weekStarting}</td>
                        <td>{m.emailsSent}</td>
                        <td>{m.replies}</td>
                        <td>{m.positiveReplies}</td>
                        <td>
                          {m.emailsSent > 0
                            ? ((m.replies / m.emailsSent) * 100).toFixed(1)
                            : 0}
                          %
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="card">
              <p className="text-muted text-center">No metrics data yet.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

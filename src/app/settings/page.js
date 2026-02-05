'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const EMAIL_TOOLS = [
  { value: '', label: 'Select your email tool...' },
  { value: 'Instantly', label: 'Instantly' },
  { value: 'Smartlead', label: 'Smartlead' },
  { value: 'Mailshake', label: 'Mailshake' },
  { value: 'Woodpecker', label: 'Woodpecker' },
];

export default function SettingsPage() {
  const [settings, setSettings] = useState(null);
  const [emailTool, setEmailTool] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [company, setCompany] = useState('');
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => {
        if (r.status === 403) {
          router.push('/reactivate');
          return null;
        }
        return r.json();
      })
      .then((d) => {
        if (d) {
          setSettings(d);
          setEmailTool(d.emailTool || '');
          setCompany(d.company || '');
        }
      });
  }, [router]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const body = { emailTool, company };
      if (apiKey) body.apiKey = apiKey;

      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setMessage({ type: 'success', text: 'Settings saved successfully.' });
        setApiKey('');
        // Refresh settings
        const updated = await fetch('/api/settings').then((r) => r.json());
        setSettings(updated);
      } else {
        const data = await res.json();
        setMessage({ type: 'danger', text: data.error || 'Failed to save settings.' });
      }
    } catch {
      setMessage({ type: 'danger', text: 'Failed to save settings.' });
    }
    setSaving(false);
  };

  const handleSync = async () => {
    setSyncing(true);
    setMessage(null);
    try {
      const res = await fetch('/api/metrics/sync', { method: 'POST' });
      const data = await res.json();

      if (res.ok) {
        setMessage({
          type: 'success',
          text: `Metrics synced! ${data.metrics.emailsSent} emails sent, ${data.metrics.replies} replies this week.`,
        });
      } else {
        setMessage({ type: 'danger', text: data.error || 'Failed to sync metrics.' });
      }
    } catch {
      setMessage({ type: 'danger', text: 'Failed to sync metrics.' });
    }
    setSyncing(false);
  };

  if (!settings) return <div className="loading">Loading settings...</div>;

  return (
    <div style={{ maxWidth: 640 }}>
      <div className="page-header">
        <h1>Settings</h1>
        <p>Manage your profile and connect your cold email tool.</p>
      </div>

      {message && (
        <div className={`alert alert-${message.type}`}>{message.text}</div>
      )}

      {/* Profile */}
      <div className="card mb-3">
        <h2 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Profile</h2>
        <div className="form-group">
          <label className="form-label">Name</label>
          <input
            type="text"
            className="form-input"
            value={settings.name || ''}
            disabled
          />
          <span className="form-hint">Contact Sean to update your name.</span>
        </div>
        <div className="form-group">
          <label className="form-label">Email</label>
          <input
            type="email"
            className="form-input"
            value={settings.email || ''}
            disabled
          />
        </div>
        <div className="form-group">
          <label className="form-label">Company / Agency Name</label>
          <input
            type="text"
            className="form-input"
            placeholder="Your agency name"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
          />
        </div>
      </div>

      {/* Email Tool Connection */}
      <div className="card mb-3">
        <h2 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Email Tool Connection</h2>
        <p className="text-sm text-muted mb-2">
          Connect your cold email tool to automatically pull campaign metrics into your
          dashboard.
        </p>

        <form onSubmit={handleSave}>
          <div className="form-group">
            <label className="form-label">Cold Email Tool</label>
            <select
              className="form-select"
              value={emailTool}
              onChange={(e) => setEmailTool(e.target.value)}
            >
              {EMAIL_TOOLS.map((tool) => (
                <option key={tool.value} value={tool.value}>
                  {tool.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">API Key</label>
            <input
              type="password"
              className="form-input"
              placeholder={
                settings.hasApiKey
                  ? 'API key is set (enter new key to update)'
                  : 'Enter your API key'
              }
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            <span className="form-hint">
              {settings.hasApiKey
                ? 'Your API key is connected.'
                : 'Find your API key in your email tool settings.'}
            </span>
          </div>

          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </form>
      </div>

      {/* Sync Metrics */}
      {settings.hasApiKey && emailTool && (
        <div className="card mb-3">
          <h2 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Sync Metrics</h2>
          <p className="text-sm text-muted mb-2">
            Pull the latest campaign metrics from {emailTool} into your dashboard.
          </p>
          <button
            className="btn btn-secondary"
            onClick={handleSync}
            disabled={syncing}
          >
            {syncing ? 'Syncing...' : 'Sync Now'}
          </button>
        </div>
      )}
    </div>
  );
}

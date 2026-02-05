'use client';

import { useState } from 'react';

export default function ReactivatePage() {
  const [loading, setLoading] = useState(false);

  const handleReactivate = async () => {
    setLoading(true);
    try {
      // We need the student email from the cookie - the API will handle this
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reactivate: true }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error('Reactivation error:', err);
    }
    setLoading(false);
  };

  return (
    <div className="public-page" style={{ textAlign: 'center', margin: '80px auto' }}>
      <h1>Your Subscription is Inactive</h1>
      <p>
        Your ASA membership has lapsed. Reactivate now to pick up right where you left off
        &mdash; all your progress and saved work are preserved.
      </p>

      <div className="card" style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
        <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>What you get back:</h3>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li style={{ padding: '0.4rem 0' }}>&#10003; All training modules and your saved progress</li>
          <li style={{ padding: '0.4rem 0' }}>&#10003; Your completed work and inputs</li>
          <li style={{ padding: '0.4rem 0' }}>&#10003; Metrics dashboard with email tool integration</li>
          <li style={{ padding: '0.4rem 0' }}>&#10003; Pipeline and client tracking</li>
          <li style={{ padding: '0.4rem 0' }}>&#10003; Slack community access</li>
        </ul>
      </div>

      <button
        className="btn btn-primary btn-lg"
        onClick={handleReactivate}
        disabled={loading}
        style={{ width: '100%', marginBottom: '1rem' }}
      >
        {loading ? 'Redirecting...' : 'Reactivate My Membership - $497/mo'}
      </button>

      <p className="text-sm text-muted">
        Questions? Reach out to Sean in the Slack community.
      </p>

      <div style={{ marginTop: '1.5rem' }}>
        <a href="/api/auth/logout" className="text-sm text-muted">
          Log out
        </a>
      </div>
    </div>
  );
}

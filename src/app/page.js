'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [enrollName, setEnrollName] = useState('');
  const [enrollEmail, setEnrollEmail] = useState('');
  const [showEnroll, setShowEnroll] = useState(false);
  const searchParams = useSearchParams();

  const error = searchParams.get('error');
  const canceled = searchParams.get('canceled');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch('/api/auth/magic-link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    if (res.ok) setSent(true);
    setLoading(false);
  };

  const handleEnroll = async (e) => {
    e.preventDefault();
    setEnrolling(true);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: enrollEmail, name: enrollName }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error('Enrollment error:', err);
    }
    setEnrolling(false);
  };

  if (sent) {
    return (
      <div className="public-page" style={{ margin: '80px auto', textAlign: 'center' }}>
        <h1>Check your email</h1>
        <p>We sent a login link to <strong>{email}</strong></p>
        <p className="text-sm text-muted">
          The link expires in 15 minutes. Check your spam folder if you don&apos;t see it.
        </p>
      </div>
    );
  }

  return (
    <div className="public-page" style={{ margin: '80px auto' }}>
      <h1>ASA Student Portal</h1>
      <p>Agency Scaling Accelerator</p>

      {error === 'invalid-link' && (
        <div className="alert alert-danger">Invalid login link. Please try again.</div>
      )}
      {error === 'expired-link' && (
        <div className="alert alert-warning">
          Your login link has expired. Please request a new one.
        </div>
      )}
      {canceled && (
        <div className="alert alert-warning">Enrollment canceled. You can try again anytime.</div>
      )}

      {/* Login Form */}
      <form onSubmit={handleLogin}>
        <div className="form-group">
          <label className="form-label">Email Address</label>
          <input
            type="email"
            className="form-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
          {loading ? 'Sending...' : 'Send Magic Link'}
        </button>
      </form>

      <div className="divider">or</div>

      {/* Enrollment */}
      {!showEnroll ? (
        <button
          className="btn btn-secondary"
          style={{ width: '100%' }}
          onClick={() => setShowEnroll(true)}
        >
          New here? Enroll in ASA
        </button>
      ) : (
        <form onSubmit={handleEnroll}>
          <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>
            Join the Agency Scaling Accelerator
          </h3>
          <p className="text-sm text-muted mb-2">
            $3,500 enrollment + $497/month membership
          </p>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              className="form-input"
              value={enrollName}
              onChange={(e) => setEnrollName(e.target.value)}
              placeholder="Your name"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              value={enrollEmail}
              onChange={(e) => setEnrollEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>
          <button type="submit" className="btn btn-success" disabled={enrolling} style={{ width: '100%' }}>
            {enrolling ? 'Redirecting to checkout...' : 'Enroll Now'}
          </button>
        </form>
      )}
    </div>
  );
}

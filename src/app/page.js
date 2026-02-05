'use client';
import { useState } from 'react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [sent, setSent] = useState(false);
    const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
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

  if (sent) {
        return (
                <div style={{ maxWidth: 400, margin: '100px auto', padding: 40, textAlign: 'center' }}>
          <h1>Check your email</h1>
          <p>We sent a login link to {email}</p>
    </div>
      );
}

  return (
        <div style={{ maxWidth: 400, margin: '100px auto', padding: 40 }}>
      <h1>ASA Student Portal</h1>
      <p>Enter your email to sign in</p>
      <form onSubmit={handleSubmit}>
            <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          style={{ width: '100%', padding: 12, marginBottom: 16, fontSize: 16 }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{ width: '100%', padding: 12, fontSize: 16, cursor: 'pointer' }}
        >
{loading ? 'Sending...' : 'Send Magic Link'}
</button>
  </form>
  </div>
  );
}

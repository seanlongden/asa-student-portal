'use client';
import { useEffect, useState } from 'react';

export default function Dashboard() {
    const [data, setData] = useState(null);
    const [tab, setTab] = useState('overview');

  useEffect(() => {
        fetch('/api/dashboard').then(r => r.json()).then(setData);
  }, []);

  if (!data) return <div style={{ padding: 40 }}>Loading...</div>;

  const { student, leads, clients, metrics } = data;
  const totalMRR = clients.reduce((sum, c) => sum + (c.monthlyValue || 0), 0);
  const pipelineValue = leads.filter(l => !l.won && !l.lost).length;

  return (
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: 20 }}>
      <h1>Welcome back, {student.name}</h1>

      <div style={{ display: 'flex', gap: 20, marginBottom: 30 }}>
        <div style={{ flex: 1, padding: 20, background: '#f0f0f0', borderRadius: 8 }}>
          <h3>${totalMRR.toLocaleString()}</h3>
          <p>Monthly Revenue</p>
    </div>
        <div style={{ flex: 1, padding: 20, background: '#f0f0f0', borderRadius: 8 }}>
          <h3>{clients.filter(c => c.status === 'Active').length}</h3>
          <p>Active Clients</p>
    </div>
        <div style={{ flex: 1, padding: 20, background: '#f0f0f0', borderRadius: 8 }}>
          <h3>{pipelineValue}</h3>
          <p>Leads in Pipeline</p>
    </div>
    </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
{['overview', 'pipeline', 'clients', 'metrics'].map(t => (
            <button key={t} onClick={() => setTab(t)} 
            style={{ padding: '10px 20px', background: tab === t ? '#333' : '#eee', color: tab === t ? '#fff' : '#333' }}>
{t.charAt(0).toUpperCase() + t.slice(1)}
</button>
        ))}
</div>

{tab === 'pipeline' && (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr><th>Lead</th><th>Company</th><th>Stage</th><th>Date</th></tr></thead>
            <tbody>
{leads.map(l => (
                <tr key={l.id}><td>{l.name}</td><td>{l.company}</td><td>{l.stage}</td><td>{l.positiveReplyDate}</td></tr>
                       ))}
</tbody>
  </table>
      )}

{tab === 'clients' && (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr><th>Client</th><th>MRR</th><th>Status</th></tr></thead>
          <tbody>
{clients.map(c => (
                <tr key={c.id}><td>{c.name}</td><td>${c.monthlyValue}</td><td>{c.status}</td></tr>
              ))}
</tbody>
  </table>
      )}
</div>
  );
}

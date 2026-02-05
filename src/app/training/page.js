'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function TrainingPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/training')
      .then((r) => {
        if (r.status === 403) {
          router.push('/reactivate');
          return null;
        }
        return r.json();
      })
      .then((d) => {
        if (d) setData(d);
      })
      .catch(() => setError('Failed to load training data'));
  }, [router]);

  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!data) return <div className="loading">Loading training modules...</div>;

  const { modules, progress } = data;

  return (
    <div>
      <div className="page-header">
        <h1>Training Modules</h1>
        <p>Complete each module in order to unlock the next one.</p>
      </div>

      <div className="card mb-3">
        <div className="flex-between mb-1">
          <span className="text-sm font-semibold">Overall Progress</span>
          <span className="text-sm text-muted">
            {progress.completed} of {progress.total} modules completed
          </span>
        </div>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${progress.percentage}%` }}
          />
        </div>
      </div>

      <div className="module-list">
        {modules.map((mod) => {
          const isLocked = mod.status === 'locked';
          const isCompleted = mod.status === 'completed';

          const content = (
            <div className={`module-item ${isLocked ? 'locked' : ''}`}>
              <div
                className={`module-number ${
                  isCompleted ? 'completed' : isLocked ? 'locked' : 'current'
                }`}
              >
                {isCompleted ? '\u2713' : mod.order}
              </div>
              <div className="module-info">
                <h3>{mod.title}</h3>
                <p>{mod.description}</p>
              </div>
              <div className="module-status">
                {isCompleted && <span className="badge badge-success">Completed</span>}
                {mod.status === 'unlocked' && (
                  <span className="badge badge-primary">Start</span>
                )}
                {isLocked && <span className="badge badge-gray">Locked</span>}
              </div>
            </div>
          );

          if (isLocked) {
            return <div key={mod.id}>{content}</div>;
          }

          return (
            <Link key={mod.id} href={`/training/${mod.id}`} style={{ textDecoration: 'none' }}>
              {content}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

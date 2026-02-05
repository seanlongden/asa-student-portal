'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ModulePage() {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState(null);
  const [inputs, setInputs] = useState({});
  const [saving, setSaving] = useState({});
  const [completing, setCompleting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`/api/training/${id}`)
      .then((r) => {
        if (r.status === 403) {
          router.push('/reactivate');
          return null;
        }
        if (!r.ok) throw new Error('Failed to load module');
        return r.json();
      })
      .then((d) => {
        if (d) {
          setData(d);
          setInputs(d.inputValues || {});
        }
      })
      .catch((err) => setError(err.message));
  }, [id, router]);

  const saveInput = useCallback(
    async (inputKey) => {
      if (!data) return;
      setSaving((prev) => ({ ...prev, [inputKey]: true }));
      try {
        await fetch('/api/inputs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            moduleId: data.module.id,
            moduleOrder: data.module.order,
            inputKey,
            value: inputs[inputKey] || '',
          }),
        });
      } catch (err) {
        console.error('Save failed:', err);
      }
      setSaving((prev) => ({ ...prev, [inputKey]: false }));
    },
    [data, inputs]
  );

  const handleComplete = async () => {
    if (!data || completing) return;
    setCompleting(true);
    try {
      const res = await fetch('/api/training/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moduleId: data.module.id }),
      });
      if (res.ok) {
        // Find next module
        const nextOrder = data.module.order + 1;
        const nextId = `module-${nextOrder}`;
        router.push(`/training/${nextId}`);
      }
    } catch (err) {
      console.error('Complete failed:', err);
    }
    setCompleting(false);
  };

  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!data) return <div className="loading">Loading module...</div>;

  const { module: mod } = data;
  const isCompleted = mod.status === 'completed';

  return (
    <div className="module-content">
      <Link href="/training" className="text-sm text-muted" style={{ display: 'inline-block', marginBottom: '1rem' }}>
        &larr; Back to Training
      </Link>

      <div className="flex-between mb-3">
        <div>
          <div className="text-sm text-muted mb-1">Module {mod.order} of 8</div>
          <h1>{mod.title}</h1>
          <p className="text-muted">{mod.description}</p>
        </div>
        {isCompleted && <span className="badge badge-success">Completed</span>}
      </div>

      {/* Lessons */}
      <div className="card mb-3">
        <h2 style={{ fontSize: '1.1rem', marginBottom: '0.75rem' }}>Key Lessons</h2>
        <ul className="lesson-list">
          {mod.lessons.map((lesson, i) => (
            <li key={i}>{lesson}</li>
          ))}
        </ul>
      </div>

      {/* Input Forms */}
      {mod.inputs && mod.inputs.length > 0 && (
        <div className="card mb-3">
          <h2 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Your Work</h2>
          <p className="text-sm text-muted mb-3">
            Fill in the fields below as you work through this module. Your work is saved
            automatically and can be edited anytime from the My Work page.
          </p>

          {mod.inputs.map((input) => (
            <div key={input.key} className="form-group">
              <label className="form-label">{input.label}</label>
              {input.type === 'textarea' ? (
                <textarea
                  className="form-textarea"
                  placeholder={input.placeholder}
                  value={inputs[input.key] || ''}
                  onChange={(e) =>
                    setInputs((prev) => ({ ...prev, [input.key]: e.target.value }))
                  }
                  onBlur={() => saveInput(input.key)}
                />
              ) : (
                <input
                  type="text"
                  className="form-input"
                  placeholder={input.placeholder}
                  value={inputs[input.key] || ''}
                  onChange={(e) =>
                    setInputs((prev) => ({ ...prev, [input.key]: e.target.value }))
                  }
                  onBlur={() => saveInput(input.key)}
                />
              )}
              {saving[input.key] && (
                <span className="form-hint text-muted">Saving...</span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Mark Complete / Navigation */}
      <div className="flex-between">
        {mod.order > 1 && (
          <Link href={`/training/module-${mod.order - 1}`} className="btn btn-secondary">
            &larr; Previous Module
          </Link>
        )}
        <div style={{ marginLeft: 'auto' }}>
          {!isCompleted ? (
            <button
              className="btn btn-success btn-lg"
              onClick={handleComplete}
              disabled={completing}
            >
              {completing ? 'Saving...' : 'Mark Complete & Continue'}
            </button>
          ) : mod.order < 8 ? (
            <Link href={`/training/module-${mod.order + 1}`} className="btn btn-primary btn-lg">
              Next Module &rarr;
            </Link>
          ) : (
            <Link href="/dashboard" className="btn btn-success btn-lg">
              Go to Dashboard
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

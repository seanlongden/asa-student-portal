'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MODULES } from '@/lib/modules';

export default function MyWorkPage() {
  const [inputs, setInputs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState({});
  const [editValues, setEditValues] = useState({});
  const router = useRouter();

  useEffect(() => {
    fetch('/api/inputs')
      .then((r) => {
        if (r.status === 403) {
          router.push('/reactivate');
          return null;
        }
        return r.json();
      })
      .then((d) => {
        if (d) {
          setInputs(d.inputs || []);
          // Initialize edit values from saved inputs
          const values = {};
          (d.inputs || []).forEach((inp) => {
            values[`${inp.moduleId}:${inp.inputKey}`] = inp.value;
          });
          setEditValues(values);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [router]);

  const saveInput = async (moduleId, moduleOrder, inputKey) => {
    const compositeKey = `${moduleId}:${inputKey}`;
    setSaving((prev) => ({ ...prev, [compositeKey]: true }));
    try {
      await fetch('/api/inputs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          moduleId,
          moduleOrder,
          inputKey,
          value: editValues[compositeKey] || '',
        }),
      });
    } catch (err) {
      console.error('Save failed:', err);
    }
    setSaving((prev) => ({ ...prev, [compositeKey]: false }));
  };

  if (loading) return <div className="loading">Loading your work...</div>;

  // Group inputs by module
  const groupedByModule = {};
  inputs.forEach((inp) => {
    if (!groupedByModule[inp.moduleId]) {
      groupedByModule[inp.moduleId] = [];
    }
    groupedByModule[inp.moduleId].push(inp);
  });

  // Get modules that have saved work
  const modulesWithWork = MODULES.filter((m) => groupedByModule[m.id]);

  return (
    <div>
      <div className="page-header">
        <h1>My Work</h1>
        <p>View and edit all the work you&apos;ve saved across your training modules.</p>
      </div>

      {modulesWithWork.length === 0 ? (
        <div className="card text-center" style={{ padding: '3rem' }}>
          <h3 className="text-muted" style={{ marginBottom: '0.5rem' }}>No saved work yet</h3>
          <p className="text-muted" style={{ marginBottom: '1.5rem' }}>
            Start working through the training modules to save your inputs here.
          </p>
          <Link href="/training" className="btn btn-primary">
            Go to Training
          </Link>
        </div>
      ) : (
        modulesWithWork.map((mod) => {
          const moduleInputs = groupedByModule[mod.id] || [];
          // Get the input definitions for this module
          const inputDefs = mod.inputs || [];

          return (
            <div key={mod.id} className="card mb-3">
              <div className="flex-between mb-2">
                <h2 style={{ fontSize: '1.1rem' }}>
                  Module {mod.order}: {mod.title}
                </h2>
                <Link href={`/training/${mod.id}`} className="btn btn-secondary btn-sm">
                  Open Module
                </Link>
              </div>

              {inputDefs.map((def) => {
                const compositeKey = `${mod.id}:${def.key}`;
                const savedInput = moduleInputs.find((inp) => inp.inputKey === def.key);
                const currentValue = editValues[compositeKey] ?? savedInput?.value ?? '';

                return (
                  <div key={def.key} className="form-group">
                    <label className="form-label">{def.label}</label>
                    {def.type === 'textarea' ? (
                      <textarea
                        className="form-textarea"
                        placeholder={def.placeholder}
                        value={currentValue}
                        onChange={(e) =>
                          setEditValues((prev) => ({
                            ...prev,
                            [compositeKey]: e.target.value,
                          }))
                        }
                        onBlur={() => saveInput(mod.id, mod.order, def.key)}
                      />
                    ) : (
                      <input
                        type="text"
                        className="form-input"
                        placeholder={def.placeholder}
                        value={currentValue}
                        onChange={(e) =>
                          setEditValues((prev) => ({
                            ...prev,
                            [compositeKey]: e.target.value,
                          }))
                        }
                        onBlur={() => saveInput(mod.id, mod.order, def.key)}
                      />
                    )}
                    {saving[compositeKey] && (
                      <span className="form-hint text-muted">Saving...</span>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })
      )}
    </div>
  );
}

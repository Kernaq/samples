/**
 * Kernaq Identity — Vite + React sample app
 *
 * Flow:
 *  1. User clicks "Verify Identity"
 *  2. <kernaq-verify> drop-in modal handles document, selfie, liveness
 *  3. On complete, the backend receives the result (already stored)
 *  4. Frontend fetches /verifications to show history
 */
import { useEffect, useRef, useState } from 'react'
import '@kernaq/verify'
import type { VerifyResult } from '@kernaq/verify'

// Tell TypeScript about the custom element
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'kernaq-verify': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        'backend-url'?: string
        country?: string
        reference?: string
        'accent-color'?: string
        'theme-mode'?: string
      }
    }
  }
}

interface Verification {
  id: string
  reference: string
  verdict: 'pass' | 'fail' | 'review'
  score: number
  face_match: boolean
  is_live: boolean
  document_fields?: Record<string, string>
  created_at: string
}

const BACKEND = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'

const VERDICT_COLOR = { pass: '#10b981', fail: '#ef4444', review: '#f59e0b' }
const VERDICT_ICON  = { pass: '✅', fail: '❌', review: '⏳' }

export default function App() {
  const verifyRef                       = useRef<HTMLElement>(null)
  const [showVerify, setShowVerify]     = useState(false)
  const [lastResult, setLastResult]     = useState<VerifyResult | null>(null)
  const [history, setHistory]           = useState<Verification[]>([])
  const [loading, setLoading]           = useState(false)

  async function loadHistory() {
    setLoading(true)
    try {
      const r = await fetch(`${BACKEND}/verifications`)
      if (r.ok) {
        const d = await r.json()
        setHistory(d.verifications ?? [])
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadHistory() }, [])

  // Wire up web component events
  useEffect(() => {
    const el = verifyRef.current
    if (!el) return
    const onComplete = (e: Event) => {
      setLastResult((e as CustomEvent<VerifyResult>).detail)
      setShowVerify(false)
      loadHistory()
    }
    const onCancel = () => setShowVerify(false)
    el.addEventListener('kernaq:complete', onComplete)
    el.addEventListener('kernaq:cancel', onCancel)
    return () => {
      el.removeEventListener('kernaq:complete', onComplete)
      el.removeEventListener('kernaq:cancel', onCancel)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showVerify])

  function openVerify() {
    setLastResult(null)
    setShowVerify(true)
    // open() after mount
    setTimeout(() => {
      const el = verifyRef.current as HTMLElement & { open?: (c: object) => void }
      el?.open?.({
        backendUrl: `${BACKEND}/verify`,
        country: 'KEN',
        reference: `demo_${Date.now()}`,
        theme: { accentColor: '#6366f1', mode: 'dark' },
      })
    }, 50)
  }

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="logo">
          <span className="logo-mark">K</span>
          <span>Kernaq Identity — Sample App</span>
        </div>
        <a href="https://kernaq.com/docs" target="_blank" rel="noreferrer" className="link-muted">
          Docs ↗
        </a>
      </header>

      <main className="main">
        {/* Hero */}
        <section className="hero">
          <h1>KYC Verification Demo</h1>
          <p className="subtitle">
            A full Kernaq Identity integration. The <code>{'<kernaq-verify>'}</code> drop-in component
            handles document capture, selfie, and liveness. The backend stores results in memory.
          </p>
          <div className="actions">
            <button className="btn-primary" onClick={openVerify}>
              Verify Identity
            </button>
            <button className="btn-secondary" onClick={loadHistory} disabled={loading}>
              {loading ? 'Loading…' : '↻ Refresh'}
            </button>
          </div>
        </section>

        {/* Backend URL */}
        <div className="info-bar">
          <span className="muted">Backend:</span>
          <code className="code">{BACKEND}</code>
          <span className="muted small">change VITE_BACKEND_URL in .env</span>
        </div>

        {/* Last result */}
        {lastResult && (
          <section className="section">
            <h2>Last Result</h2>
            <div className="verdict-card" style={{ borderColor: VERDICT_COLOR[lastResult.verdict] + '44', background: VERDICT_COLOR[lastResult.verdict] + '11' }}>
              <div className="verdict-header">
                <span className="verdict-icon">{VERDICT_ICON[lastResult.verdict]}</span>
                <div>
                  <div className="verdict-label" style={{ color: VERDICT_COLOR[lastResult.verdict] }}>
                    {lastResult.verdict.toUpperCase()}
                  </div>
                  <div className="verdict-meta">
                    Score: {lastResult.score} · Face match: {lastResult.faceMatch ? 'Yes' : 'No'} · Live: {lastResult.isLive ? 'Yes' : 'No'}
                  </div>
                </div>
                <code className="ref-id">{lastResult.verificationId}</code>
              </div>
              {lastResult.documentFields && (
                <div className="doc-fields">
                  {Object.entries(lastResult.documentFields).map(([k, v]) =>
                    v ? (
                      <div className="field" key={k}>
                        <span className="field-key">{k.replace(/_/g, ' ')}</span>
                        <span className="field-val">{String(v)}</span>
                      </div>
                    ) : null
                  )}
                </div>
              )}
            </div>
          </section>
        )}

        {/* History */}
        <section className="section">
          <h2>
            Verification History
            <span className="badge">{history.length} in memory</span>
          </h2>
          {loading && history.length === 0 ? (
            <div className="empty">Loading…</div>
          ) : history.length === 0 ? (
            <div className="empty">No verifications yet. Click Verify Identity to run one.</div>
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Reference</th>
                    <th>Verdict</th>
                    <th>Score</th>
                    <th>Face Match</th>
                    <th>Live</th>
                    <th>Name</th>
                    <th>Document #</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map(v => (
                    <tr key={v.id}>
                      <td><code className="small">{v.reference}</code></td>
                      <td>
                        <span className="verdict-pill" style={{ background: VERDICT_COLOR[v.verdict] + '22', color: VERDICT_COLOR[v.verdict] }}>
                          {VERDICT_ICON[v.verdict]} {v.verdict}
                        </span>
                      </td>
                      <td>{v.score}</td>
                      <td>{v.face_match ? '✓' : '✗'}</td>
                      <td>{v.is_live ? '✓' : '✗'}</td>
                      <td>{v.document_fields?.name ?? '—'}</td>
                      <td>{v.document_fields?.document_number ?? '—'}</td>
                      <td className="muted">{new Date(v.created_at).toLocaleTimeString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      {/* Drop-in verify component */}
      {showVerify && (
        <kernaq-verify
          ref={verifyRef}
          backend-url={`${BACKEND}/verify`}
          country="KEN"
          accent-color="#6366f1"
          theme-mode="dark"
        />
      )}
    </div>
  )
}

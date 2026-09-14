/**
 * Kernaq Identity — Vite + React sample app
 *
 * Flow:
 *  1. User clicks "Verify Identity"
 *  2. <kernaq-verify> drop-in widget handles document front+back, selfie, liveness
 *  3. On kernaq:complete the result is displayed and stored via the backend
 *  4. Frontend fetches /verifications to show history
 *
 * The widget cannot be dismissed mid-flow — the user must complete verification.
 * The developer controls visibility via the `visible` state.
 */
import { useEffect, useRef, useState } from 'react'
import '@kernaq/verify'
import type { VerifyResult } from '@kernaq/verify'
import './index.css'

// ── TypeScript — teach React about the custom element ─────────────────────────
type KernaqVerifyAttributes = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLElement>,
  HTMLElement
> & {
  'backend-url'?:    string
  'document-type'?:  string
  country?:          string
  reference?:        string
  steps?:            string
  sandbox?:          boolean | string
  'accent-color'?:   string
  'theme-mode'?:     'light' | 'dark'
  'liveness-tasks'?: string
}

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'kernaq-verify': KernaqVerifyAttributes
    }
  }
}

// ── Types from backend (/verifications endpoint) ──────────────────────────────
interface VerificationRecord {
  id:               string
  verification_id:  string | null
  reference:        string
  verdict:          'pass' | 'fail' | 'review'
  score:            number
  face_match:       boolean
  is_live:          boolean
  document_fields?: {
    name?:             string
    date_of_birth?:    string
    document_number?:  string
    expiry_date?:      string
    country?:          string
    document_type?:    string
  }
  error?:      string
  created_at:  string
}

// ── Config ────────────────────────────────────────────────────────────────────
const BACKEND = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'

const VERDICT_COLOR: Record<string, string> = {
  pass:   '#10b981',
  fail:   '#ef4444',
  review: '#f59e0b',
}

export default function App() {
  const widgetRef                           = useRef<HTMLElement>(null)
  const [showWidget, setShowWidget]         = useState(false)
  const [lastResult, setLastResult]         = useState<VerifyResult | null>(null)
  const [history, setHistory]               = useState<VerificationRecord[]>([])
  const [loading, setLoading]               = useState(false)

  // ── Load history ─────────────────────────────────────────────────────────────
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

  // ── Wire up widget events after it mounts ─────────────────────────────────────
  useEffect(() => {
    const el = widgetRef.current
    if (!el) return

    const onComplete = (e: Event) => {
      const result = (e as CustomEvent<VerifyResult>).detail
      setLastResult(result)
      setShowWidget(false)
      loadHistory()
    }

    el.addEventListener('kernaq:complete', onComplete)
    return () => el.removeEventListener('kernaq:complete', onComplete)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showWidget])

  // ── Open widget ───────────────────────────────────────────────────────────────
  function openVerify() {
    setLastResult(null)
    setShowWidget(true)
    // Programmatically open after mount so the element is in the DOM
    setTimeout(() => {
      const el = widgetRef.current as HTMLElement & {
        open?: (cfg: object) => void
      }
      el?.open?.({
        backendUrl:    `${BACKEND}/verify`,
        country:       'KEN',
        documentType:  'national_id',
        reference:     `demo_${Date.now()}`,
        steps:         ['document', 'selfie', 'liveness'],
        theme: {
          accentColor: '#6366f1',
          mode:        'dark',
        },
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
            A full Kernaq Identity integration using the{' '}
            <code>{'<kernaq-verify>'}</code> drop-in Web Component (v2).
            The widget handles document front &amp; back, selfie, and liveness.
            Results are stored by the backend and shown below.
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

        {/* Backend info */}
        <div className="info-bar">
          <span className="muted">Backend:</span>
          <code className="code">{BACKEND}</code>
          <span className="muted small">— set VITE_BACKEND_URL in .env to switch backends</span>
        </div>

        {/* Last result */}
        {lastResult && (
          <section className="section">
            <h2>Latest result</h2>
            <div
              className="verdict-card"
              style={{
                borderColor: VERDICT_COLOR[lastResult.verdict] + '44',
                background:  VERDICT_COLOR[lastResult.verdict] + '11',
              }}
            >
              <div className="verdict-header">
                <div>
                  <div className="verdict-label" style={{ color: VERDICT_COLOR[lastResult.verdict] }}>
                    {lastResult.verdict.toUpperCase()}
                  </div>
                  <div className="verdict-meta">
                    Score: {lastResult.score}
                    {' · '}Face match: {lastResult.faceMatch ? 'Yes' : 'No'}
                    {' · '}Live: {lastResult.isLive ? 'Yes' : 'No'}
                  </div>
                </div>
                {lastResult.verificationId && (
                  <code className="ref-id">{lastResult.verificationId}</code>
                )}
              </div>
              {lastResult.documentFields && Object.keys(lastResult.documentFields).length > 0 && (
                <div className="doc-fields">
                  {Object.entries(lastResult.documentFields).map(([k, v]) =>
                    v && v !== 'false' ? (
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

        {/* History table */}
        <section className="section">
          <h2>
            Verification History
            <span className="badge">{history.length} in memory</span>
          </h2>
          {loading && history.length === 0 ? (
            <div className="empty">Loading…</div>
          ) : history.length === 0 ? (
            <div className="empty">
              No verifications yet. Click <strong>Verify Identity</strong> to run one.
            </div>
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Reference</th>
                    <th>Verdict</th>
                    <th>Score</th>
                    <th>Face</th>
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
                        <span
                          className="verdict-pill"
                          style={{
                            background: VERDICT_COLOR[v.verdict] + '22',
                            color:      VERDICT_COLOR[v.verdict],
                          }}
                        >
                          {v.verdict}
                        </span>
                      </td>
                      <td>{v.score}</td>
                      <td>{v.face_match ? '✓' : '✗'}</td>
                      <td>{v.is_live ? '✓' : '✗'}</td>
                      <td>{v.document_fields?.name ?? '—'}</td>
                      <td>{v.document_fields?.document_number ?? '—'}</td>
                      <td className="muted">
                        {new Date(v.created_at).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      {/* ── Drop-in verify widget ── */}
      {showWidget && (
        <kernaq-verify
          ref={widgetRef}
          backend-url={`${BACKEND}/verify`}
          document-type="national_id"
          country="KEN"
          steps="document,selfie,liveness"
          accent-color="#6366f1"
          theme-mode="dark"
          liveness-tasks="2"
        />
      )}
    </div>
  )
}

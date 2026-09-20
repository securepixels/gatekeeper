'use client'
import { useState, useRef } from 'react'
import { useTheme } from './ThemeProvider'
import { scanPrompt, riskScore, riskLabel, riskColor, countBySev, RULES } from '@/lib/engine'
import { EXAMPLES } from '@/lib/examples'
import { Finding } from '@/lib/types'

export function Scanner() {
  const { toggle } = useTheme()
  const [input, setInput] = useState('')
  const [findings, setFindings] = useState<Finding[]>([])
  const [scanned, setScanned] = useState(false)
  const [openIdx, setOpenIdx] = useState<Set<number>>(new Set())
  const [filter, setFilter] = useState('all')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  function handleInput(val: string) {
    setInput(val)
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
    }
  }

  function scan() {
    if (!input.trim()) return
    const results = scanPrompt(input)
    setFindings(results)
    setScanned(true)
    setOpenIdx(new Set())
    setFilter('all')
  }

  function loadExample(key: string) {
    handleInput(EXAMPLES[key])
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
        textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
      }
      const results = scanPrompt(EXAMPLES[key])
      setFindings(results)
      setScanned(true)
      setOpenIdx(new Set())
      setFilter('all')
    }, 50)
  }

  function clear() {
    setInput('')
    setFindings([])
    setScanned(false)
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
  }

  function toggleDetail(i: number) {
    setOpenIdx(prev => {
      const next = new Set(prev)
      next.has(i) ? next.delete(i) : next.add(i)
      return next
    })
  }

  function esc(s: string) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  }

  function trunc(s: string, n: number) {
    return s.length > n ? s.slice(0, n) + '...' : s
  }

  const score = riskScore(findings)
  const counts = countBySev(findings)
  const tagClass: Record<string, string> = {
    critical: 'log-tag-crit', high: 'log-tag-high', medium: 'log-tag-med', low: 'log-tag-low'
  }

  const filtered = findings.filter(f => filter === 'all' || f.sev === filter)

  return (
    <>
      {/* Top bar */}
      <div className="topbar">
        <div className="topbar-left">
          <div className="dots">
            <div className="dot dot-r" />
            <div className="dot dot-y" />
            <div className="dot dot-g" />
          </div>
          <span className="topbar-title">gatekeeper ~ scan</span>
        </div>
        <button className="theme-btn" onClick={toggle}>&#9684;</button>
      </div>

      {/* Terminal */}
      <div className="term">
        <div className="prompt-line">
          <span className="prompt-symbol">&#10095;</span>
          <textarea
            ref={textareaRef}
            className="prompt-textarea"
            value={input}
            onChange={e => handleInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); scan() }}}
            placeholder="paste a prompt to scan..."
            rows={4}
          />
        </div>
        <div className="action-bar">
          <span className="char-ct">{input.length} chars</span>
          <div className="action-btns">
            <button className="cmd-btn" onClick={clear}>clear</button>
            <button className="cmd-btn cmd-btn-go" onClick={scan}>scan &#9166;</button>
          </div>
        </div>
      </div>

      {/* Examples */}
      <div className="examples">
        {Object.keys(EXAMPLES).map(k => (
          <button key={k} className="ex-chip" onClick={() => loadExample(k)}>{k.replace('_', ' ')}</button>
        ))}
      </div>

      {/* Results */}
      {scanned && (
        <div>
          <div className="score-bar">
            <div className="score-meter">
              <div className="score-fill" style={{ width: `${score}%`, background: riskColor(score) }} />
            </div>
            <span className="score-text" style={{ color: riskColor(score) }}>
              {score}/100 {riskLabel(score)}
            </span>
            <div className="score-stats">
              {counts.critical > 0 && <span><b style={{ color: 'var(--red)' }}>{counts.critical}</b> crit</span>}
              {counts.high > 0 && <span><b style={{ color: '#f97316' }}>{counts.high}</b> high</span>}
              {counts.medium > 0 && <span><b style={{ color: 'var(--amber)' }}>{counts.medium}</b> med</span>}
              {counts.low > 0 && <span><b style={{ color: 'var(--cyan)' }}>{counts.low}</b> low</span>}
              <span>{RULES.length} rules</span>
            </div>
          </div>

          {findings.length === 0 ? (
            <div className="clean-banner">
              &#10003; all clear
              <span>No injection patterns detected across {RULES.length} rules.</span>
            </div>
          ) : (
            <>
              <div className="output-header">
                <span className="output-title">FINDINGS</span>
                <div className="output-filters">
                  <button className={`f-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>all</button>
                  {counts.critical > 0 && <button className={`f-btn ${filter === 'critical' ? 'active' : ''}`} onClick={() => setFilter('critical')}>crit</button>}
                  {counts.high > 0 && <button className={`f-btn ${filter === 'high' ? 'active' : ''}`} onClick={() => setFilter('high')}>high</button>}
                  {counts.medium > 0 && <button className={`f-btn ${filter === 'medium' ? 'active' : ''}`} onClick={() => setFilter('medium')}>med</button>}
                  {counts.low > 0 && <button className={`f-btn ${filter === 'low' ? 'active' : ''}`} onClick={() => setFilter('low')}>low</button>}
                </div>
              </div>
              {filtered.map((f, i) => (
                <div key={f.id} className="log-entry" data-sev={f.sev} onClick={() => toggleDetail(i)}>
                  <div className="log-head">
                    <span className={`log-tag ${tagClass[f.sev]}`}>{f.sev.toUpperCase()}</span>
                    <span className="log-name">{f.name}</span>
                    <span className="log-cat">{f.cat}</span>
                  </div>
                  <div className="log-match">
                    matched: <em dangerouslySetInnerHTML={{ __html: esc(trunc(f.matched, 70)) }} />
                  </div>
                  <div className={`log-detail ${openIdx.has(i) ? 'open' : ''}`}>
                    <div className="log-detail-label">WHY</div>
                    <div>{f.why}</div>
                    <div className="log-detail-label">MATCHED TEXT</div>
                    <div className="log-detail-code">{f.matched}</div>
                    <div className="log-detail-label">REFERENCE</div>
                    <div>{f.ref}</div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {/* About */}
      <div className="about">
        <div className="about-text" style={{ fontFamily: 'var(--font-sans)' }}>
          I built this because prompt injection is one of those risks everyone talks about but few people actually have tooling for. Gatekeeper runs entirely in your browser. Nothing gets sent anywhere. It matches against a rule set I put together from OWASP&apos;s LLM Top 10, published jailbreak research, and patterns I&apos;ve studied in my AI security coursework.
        </div>
        <div className="about-meta">{RULES.length} detection rules &middot; 7 categories &middot; client-side only</div>
      </div>

      <div className="footer">
        <span>built by chrissy</span>
        <span>gatekeeper v1.0</span>
      </div>
    </>
  )
}

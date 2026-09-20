import { RULES } from './rules'
import { Finding } from './types'

function sevScore(s: string): number {
  const scores: Record<string, number> = { critical: 4, high: 3, medium: 2, low: 1 }
  return scores[s] ?? 0
}

export function scanPrompt(text: string): Finding[] {
  const findings: Finding[] = []
  RULES.forEach(rule => {
    const match = text.match(rule.pattern)
    if (match) {
      findings.push({ ...rule, matched: match[0], index: match.index ?? 0 })
    }
  })
  return findings.sort((a, b) => sevScore(b.sev) - sevScore(a.sev))
}

export function riskScore(findings: Finding[]): number {
  if (!findings.length) return 0
  const base = findings.reduce((a, f) => a + sevScore(f.sev) * 12, 0)
  return Math.min(base + Math.min(findings.length * 5, 20), 100)
}

export function riskLabel(score: number): string {
  if (score === 0) return 'CLEAN'
  if (score <= 30) return 'LOW'
  if (score <= 60) return 'MEDIUM'
  return 'HIGH'
}

export function riskColor(score: number): string {
  if (score === 0) return 'var(--green)'
  if (score <= 30) return 'var(--cyan)'
  if (score <= 60) return 'var(--amber)'
  return 'var(--red)'
}

export function countBySev(findings: Finding[]) {
  return {
    critical: findings.filter(f => f.sev === 'critical').length,
    high: findings.filter(f => f.sev === 'high').length,
    medium: findings.filter(f => f.sev === 'medium').length,
    low: findings.filter(f => f.sev === 'low').length,
  }
}

export { RULES }

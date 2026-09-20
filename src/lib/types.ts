export interface Rule {
  id: string
  cat: string
  name: string
  sev: 'critical' | 'high' | 'medium' | 'low'
  pattern: RegExp
  why: string
  ref: string
}

export interface Finding extends Rule {
  matched: string
  index: number
}

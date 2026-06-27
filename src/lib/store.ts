// ── Pure utility functions ─────────────────────────────

export function calcFinancials(state: any) {
  const fees           = state.expenses.filter((e: any) => e.type === 'fee').reduce((s: number, e: any) => s + e.amount, 0)
  const payouts        = state.expenses.filter((e: any) => e.type === 'payout').reduce((s: number, e: any) => s + e.amount, 0)
  const net            = payouts - fees
  const roi            = fees > 0 ? ((net / fees) * 100) : 0
  const gap            = Math.max(0, fees - payouts)
  const paAccounts     = state.accounts.filter((a: any) => a.status === 'pa')
  const paCount        = paAccounts.length
  const challengeCount = state.accounts.filter((a: any) => a.status === 'challenge').length
  const lostCount      = state.accounts.filter((a: any) => a.status === 'lost').length
  const nPayouts       = state.expenses.filter((e: any) => e.type === 'payout').length
  const nFees          = state.expenses.filter((e: any) => e.type === 'fee').length

  // Challenge success rate
  const totalAttempted = paCount + lostCount
  const successRate    = totalAttempted > 0 ? Math.round((paCount / totalAttempted) * 100) : 0

  // Avg payout per PA
  const avgPayoutPerPA = paAccounts.length > 0
    ? paAccounts.reduce((s: number, a: any) => s + (a.avgPayout || 400), 0) / paAccounts.length
    : 0

  // Monthly income estimate (1.5 payouts/PA/month average)
  const monthlyEstimate = paCount * avgPayoutPerPA * 1.5

  // Avg cost per challenge
  const avgChallengeCost = nFees > 0 ? fees / nFees : 140

  // Months to break even from now
  const monthsToBreakEven = monthlyEstimate > 0 && gap > 0
    ? Math.ceil(gap / (monthlyEstimate * 0.5))
    : 0

  // Sustainability score 0-100
  const sustainScore = Math.min(100, Math.round(
    (paCount >= 2 ? 40 : paCount * 20) +
    (roi > 0 ? Math.min(30, roi / 2) : 0) +
    (successRate > 0 ? Math.min(30, successRate * 0.3) : 0)
  ))

  return {
    fees, payouts, net, roi, gap, paCount, challengeCount, lostCount,
    nPayouts, nFees, successRate, avgPayoutPerPA, monthlyEstimate,
    avgChallengeCost, monthsToBreakEven, sustainScore, paAccounts,
  }
}

export function getDecision(state: any, fin: any) {
  const { paCount, challengeCount, net, monthlyEstimate } = fin
  const meta = state.aiConfig?.meta || 0
  if (state.accounts.length === 0) return { text: 'Agrega tu primera cuenta para comenzar', reason: 'Registra tu primer challenge para que PropFlow pueda analizar tu negocio.', level: 'neutral' }
  if (paCount === 0 && challengeCount > 0) return { text: `Pasa ${challengeCount > 1 ? 'tus challenges' : 'tu challenge'} — no abras más aún`, reason: `Tienes ${challengeCount} cuenta(s) en evaluación. Enfócate en completar el proceso antes de gastar más fees.`, level: 'warning' }
  if (paCount === 0 && challengeCount === 0) return { text: 'Abre al menos 2 challenges para empezar', reason: 'Sin cuentas activas ni en evaluación. El mínimo sostenible son 2 PAs generando payouts al mes.', level: 'danger' }
  if (paCount === 1 && challengeCount === 0) return { text: 'Abre otro challenge — necesitas 2 PAs mínimo', reason: 'Con 1 PA estás por debajo del mínimo sostenible. Reinvierte parte del payout en otra evaluación.', level: 'warning' }
  if (paCount >= 2 && net < 0) return { text: 'Prioriza cobrar payouts — aún no recuperas la inversión', reason: `Tienes ${paCount} PAs activas generando ~${fmtUSD(monthlyEstimate)}/mes. Faltan ${fmtUSD(Math.abs(net))} para breakeven.`, level: 'info' }
  if (paCount >= 2 && net >= 0) {
    if (meta > 0 && monthlyEstimate < meta) return { text: `Escala a ${Math.ceil(meta / (fin.avgPayoutPerPA * 1.5))} PAs para tu meta de ${fmtUSD(meta)}/mes`, reason: `Actualmente generas ~${fmtUSD(monthlyEstimate)}/mes. Reinvierte en más evaluaciones para alcanzar tu objetivo.`, level: 'success' }
    return { text: `Negocio sostenible — escala a ${paCount + 2} PAs para crecer`, reason: `Generas ~${fmtUSD(monthlyEstimate)}/mes con ${paCount} PAs. El siguiente nivel son ${paCount + 2} PAs activas simultáneas.`, level: 'success' }
  }
  return { text: 'Actualiza tus datos para ver la recomendación', reason: '', level: 'neutral' }
}

export function fmtUSD(n: number, compact = false) {
  if (compact && Math.abs(n) >= 1000) return '$' + (n / 1000).toFixed(1) + 'K'
  return '$' + Math.round(n).toLocaleString('en-US')
}

export function fmtDate(d: string) {
  if (!d) return '—'
  try { return new Date(d + 'T00:00:00').toLocaleDateString('es-DO', { day: '2-digit', month: 'short', year: 'numeric' }) }
  catch (_) { return d }
}

// ── Monthly cashflow for bar chart ────────────────────
export interface MonthlyBar { month: string; ingresos: number; gastos: number; neto: number }

export function buildMonthlyCashflow(state: any): MonthlyBar[] {
  const map = new Map<string, { ingresos: number; gastos: number }>()
  for (const e of state.expenses) {
    const d   = e.date ? e.date.slice(0, 7) : 'unknown'
    const cur = map.get(d) || { ingresos: 0, gastos: 0 }
    if (e.type === 'payout') cur.ingresos += e.amount
    else cur.gastos += e.amount
    map.set(d, cur)
  }
  const sorted = Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b)).slice(-6)
  return sorted.map(([key, val]) => {
    const [y, m] = key.split('-')
    const label = new Date(parseInt(y), parseInt(m) - 1).toLocaleDateString('es-DO', { month: 'short', year: '2-digit' })
    return { month: label, ingresos: val.ingresos, gastos: val.gastos, neto: val.ingresos - val.gastos }
  })
}

// ── Snowball 3 scenarios ──────────────────────────────
export interface SnowballPoint { month: string; conservador: number; moderado: number; agresivo: number }

export function buildSnowball(state: any, pct: number): SnowballPoint[] {
  const allFees    = state.expenses.filter((e: any) => e.type === 'fee')
  const avgCost    = allFees.length > 0 ? Math.min(300, allFees.reduce((s: number, e: any) => s + e.amount, 0) / allFees.length) : 140
  const paAccounts = state.accounts.filter((a: any) => a.status === 'pa')
  const currentPA  = Math.max(1, paAccounts.length)
  const avgPayout  = paAccounts.length > 0 ? Math.min(600, paAccounts.reduce((s: number, a: any) => s + (a.avgPayout || 400), 0) / paAccounts.length) : 400
  const neto0      = Math.max(0, state.expenses.filter((e: any) => e.type === 'payout').reduce((s: number, e: any) => s + e.amount, 0) - state.expenses.filter((e: any) => e.type === 'fee').reduce((s: number, e: any) => s + e.amount, 0))
  const MAX_PA     = 20

  const run = (reinvPct: number, failRate: number) => {
    let acum = neto0; let pa = currentPA; const pts: number[] = []
    for (let m = 0; m < 12; m++) {
      pa = Math.max(1, pa - Math.floor(pa * failRate))
      const income  = pa * avgPayout * 1.5
      pa = Math.min(MAX_PA, pa + Math.floor(income * reinvPct / avgCost))
      acum += income * (1 - reinvPct)
      pts.push(Math.round(acum))
    }
    return pts
  }

  const c = run(Math.min(pct, 0.2), 0.15)
  const m = run(pct, 0.08)
  const a = run(Math.min(pct * 1.4, 0.85), 0.03)
  return Array.from({ length: 12 }, (_, i) => ({ month: 'M' + (i + 1), conservador: c[i], moderado: m[i], agresivo: a[i] }))
}

// ── Pure utility functions (no hooks, no state) ────────

export function calcFinancials(state: any) {
  const fees           = state.expenses.filter((e: any) => e.type === 'fee').reduce((s: number, e: any) => s + e.amount, 0)
  const payouts        = state.expenses.filter((e: any) => e.type === 'payout').reduce((s: number, e: any) => s + e.amount, 0)
  const net            = payouts - fees
  const roi            = fees > 0 ? ((net / fees) * 100) : 0
  const gap            = Math.max(0, fees - payouts)
  const paCount        = state.accounts.filter((a: any) => a.status === 'pa').length
  const challengeCount = state.accounts.filter((a: any) => a.status === 'challenge').length
  const lostCount      = state.accounts.filter((a: any) => a.status === 'lost').length
  const nPayouts       = state.expenses.filter((e: any) => e.type === 'payout').length
  const nFees          = state.expenses.filter((e: any) => e.type === 'fee').length
  return { fees, payouts, net, roi, gap, paCount, challengeCount, lostCount, nPayouts, nFees }
}

export function getDecision(state: any, fin: any) {
  const { paCount, challengeCount, net } = fin
  const meta = state.aiConfig?.meta || 0

  if (state.accounts.length === 0) return {
    text:   'Agrega tu primera cuenta para ver la recomendación',
    reason: 'PropFlow analiza tu portafolio en tiempo real y te dice la acción más inteligente ahora mismo.',
    level:  'neutral',
  }
  if (paCount === 0 && challengeCount > 0) return {
    text:   `Enfócate en pasar ${challengeCount > 1 ? 'tus ' + challengeCount + ' challenges' : 'tu challenge'} antes de abrir más`,
    reason: `Tienes ${challengeCount} cuenta(s) en evaluación activa. Completa el proceso antes de gastar más en fees.`,
    level:  'warning',
  }
  if (paCount === 0 && challengeCount === 0) return {
    text:   'Abre al menos 2 challenges para comenzar el negocio',
    reason: 'Sin cuentas activas ni en evaluación. El mínimo sostenible son 2 PAs activas generando payouts.',
    level:  'danger',
  }
  if (paCount === 1 && challengeCount === 0) return {
    text:   'Abre otro challenge ahora — necesitas llegar a 2 PAs activas',
    reason: 'Con 1 PA activa estás bajo el mínimo sostenible. Invierte en otra evaluación mientras esta PA genera ingresos.',
    level:  'warning',
  }
  if (paCount >= 2 && net < 0) return {
    text:   'Mantén las PAs activas y prioriza recuperar la inversión',
    reason: `Estás en el mínimo sostenible pero aún negativo ($${Math.abs(net).toLocaleString()} por recuperar). Cobra payouts antes de escalar.`,
    level:  'info',
  }
  if (paCount >= 2 && net >= 0) {
    const potencial = paCount * 400
    if (meta > 0 && potencial < meta) return {
      text:   `Escala a ${Math.ceil(meta / 400)} PAs activas para alcanzar tu meta de $${meta.toLocaleString()}/mes`,
      reason: `Con ${paCount} PAs generas ~$${potencial.toLocaleString()}/mes. Tu meta es $${meta.toLocaleString()}/mes. Reinvierte parte de los payouts en nuevas evaluaciones.`,
      level:  'success',
    }
    return {
      text:   `Negocio sostenible — el siguiente paso es escalar a ${paCount + 2} PAs activas`,
      reason: `Estás en positivo con ${paCount} PAs activas. Abre ${paCount <= 2 ? 2 : 1} challenge(s) más para aumentar el flujo mensual.`,
      level:  'success',
    }
  }
  return {
    text:   'Registra tus movimientos para obtener la recomendación',
    reason: 'Asegúrate de tener cuentas y movimientos al día.',
    level:  'neutral',
  }
}

export function fmtUSD(n: number, compact = false) {
  if (compact && Math.abs(n) >= 1000) return '$' + (n / 1000).toFixed(1) + 'K'
  return '$' + Math.round(n).toLocaleString('en-US')
}

export function fmtDate(d: string) {
  if (!d) return '—'
  try {
    return new Date(d + 'T00:00:00').toLocaleDateString('es-DO', {
      day: '2-digit', month: 'short', year: 'numeric',
    })
  } catch (_) { return d }
}

// ── Snowball: 3 realistic scenarios ───────────────────
// Conservador: sin reinversión agresiva, pérdidas de cuentas
// Moderado:    reinversión controlada, crecimiento lineal
// Agresivo:    reinversión máxima, todo va para escalar
// Techo: máximo 20 PAs simultáneas (límite realista de prop firms)

export interface SnowballPoint {
  month: string
  conservador: number
  moderado: number
  agresivo: number
}

export function buildSnowball(state: any, pct: number): SnowballPoint[] {
  const allFees     = state.expenses.filter((e: any) => e.type === 'fee')
  const avgCost     = allFees.length > 0
    ? Math.min(300, allFees.reduce((s: number, e: any) => s + e.amount, 0) / allFees.length)
    : 140

  const paAccounts  = state.accounts.filter((a: any) => a.status === 'pa')
  const currentPA   = Math.max(1, paAccounts.length)

  // Avg payout per PA per month (realistic: 1-2 payouts/mes, ~$300-500 cada uno)
  const avgPayoutPA = paAccounts.length > 0
    ? Math.min(600, paAccounts.reduce((s: number, a: any) => s + (a.avgPayout || 400), 0) / paAccounts.length)
    : 400

  const totalGanado  = state.expenses.filter((e: any) => e.type === 'payout').reduce((s: number, e: any) => s + e.amount, 0)
  const totalGastado = state.expenses.filter((e: any) => e.type === 'fee').reduce((s: number, e: any) => s + e.amount, 0)
  const neto0        = Math.max(0, totalGanado - totalGastado)

  // Max realistic PA accounts — Apex allows up to 20 simultaneous
  const MAX_PA = 20

  // Each scenario: different reinvestment rate and account failure rate
  const scenarios = {
    conservador: { reinvPct: Math.min(pct, 0.2),  failRate: 0.15, label: 'conservador' },
    moderado:    { reinvPct: pct,                   failRate: 0.08, label: 'moderado'    },
    agresivo:    { reinvPct: Math.min(pct * 1.4, 0.9), failRate: 0.03, label: 'agresivo' },
  }

  const run = (reinvPct: number, failRate: number) => {
    let acumulado = neto0
    let cuentas   = currentPA
    const points: number[] = []

    for (let m = 1; m <= 12; m++) {
      // Some accounts fail each month (realistic churn)
      const perdidas  = Math.floor(cuentas * failRate)
      cuentas         = Math.max(1, cuentas - perdidas)

      // Income this month: 1.5 payouts per PA on average (not always 2)
      const gananciaMes = cuentas * avgPayoutPA * 1.5

      // Reinvest portion to open new challenges
      const reinversion = gananciaMes * reinvPct
      const retiro      = gananciaMes * (1 - reinvPct)

      // New accounts = reinvestment / cost, capped by MAX_PA
      const nuevas  = Math.floor(reinversion / avgCost)
      cuentas       = Math.min(MAX_PA, cuentas + nuevas)
      acumulado    += retiro

      points.push(Math.round(acumulado))
    }
    return points
  }

  const cons  = run(scenarios.conservador.reinvPct, scenarios.conservador.failRate)
  const mod   = run(scenarios.moderado.reinvPct,    scenarios.moderado.failRate)
  const agres = run(scenarios.agresivo.reinvPct,    scenarios.agresivo.failRate)

  return Array.from({ length: 12 }, (_, i) => ({
    month:        'M' + (i + 1),
    conservador:  cons[i],
    moderado:     mod[i],
    agresivo:     agres[i],
  }))
}

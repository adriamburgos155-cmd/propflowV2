// ── Pure utility functions (no hooks, no state) ────────
// All state management is in src/hooks/useStore.js

export function calcFinancials(state) {
  const fees          = state.expenses.filter(e => e.type === 'fee').reduce((s, e) => s + e.amount, 0)
  const payouts       = state.expenses.filter(e => e.type === 'payout').reduce((s, e) => s + e.amount, 0)
  const net           = payouts - fees
  const roi           = fees > 0 ? ((net / fees) * 100) : 0
  const gap           = Math.max(0, fees - payouts)
  const paCount       = state.accounts.filter(a => a.status === 'pa').length
  const challengeCount= state.accounts.filter(a => a.status === 'challenge').length
  const lostCount     = state.accounts.filter(a => a.status === 'lost').length
  const nPayouts      = state.expenses.filter(e => e.type === 'payout').length
  const nFees         = state.expenses.filter(e => e.type === 'fee').length
  return { fees, payouts, net, roi, gap, paCount, challengeCount, lostCount, nPayouts, nFees }
}

export function getDecision(state, fin) {
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

export function fmtUSD(n, compact = false) {
  if (compact && Math.abs(n) >= 1000) return '$' + (n / 1000).toFixed(1) + 'K'
  return '$' + Math.round(n).toLocaleString('en-US')
}

export function fmtDate(d) {
  if (!d) return '—'
  try {
    return new Date(d + 'T00:00:00').toLocaleDateString('es-DO', {
      day: '2-digit', month: 'short', year: 'numeric',
    })
  } catch (_) { return d }
}

export function buildSnowball(state, pct) {
  const allFees      = state.expenses.filter(e => e.type === 'fee')
  const avgCost      = allFees.length > 0 ? allFees.reduce((s, e) => s + e.amount, 0) / allFees.length : 140
  const paAccounts   = state.accounts.filter(a => a.status === 'pa')
  const currentPA    = paAccounts.length || 1
  const avgPayoutPA  = paAccounts.length > 0
    ? paAccounts.reduce((s, a) => s + (a.avgPayout || 400), 0) / paAccounts.length
    : 400
  const totalGanado  = state.expenses.filter(e => e.type === 'payout').reduce((s, e) => s + e.amount, 0)
  const totalGastado = state.expenses.filter(e => e.type === 'fee').reduce((s, e) => s + e.amount, 0)

  const data = []
  let acumulado = Math.max(0, totalGanado - totalGastado)
  let cuentas   = currentPA

  for (let m = 1; m <= 12; m++) {
    const gananciaMes = cuentas * avgPayoutPA * 2
    const reinversion = gananciaMes * pct
    const retiro      = gananciaMes * (1 - pct)
    const nuevas      = Math.floor(reinversion / avgCost)
    cuentas   += nuevas
    acumulado += retiro
    data.push({ month: 'M' + m, retiro: Math.round(acumulado), cuentas })
  }
  return data
}

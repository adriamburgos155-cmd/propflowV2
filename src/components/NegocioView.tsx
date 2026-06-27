"use client"
import { useState } from "react"
import {
  BarChart, Bar, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from "recharts"
import {
  calcFinancials, getDecision, fmtUSD, fmtDate,
  buildSnowball, buildMonthlyCashflow,
  type SnowballPoint, type MonthlyBar
} from "@/lib/store"

// ── Metric Card ────────────────────────────────────────
function MetricCard({
  label, value, sub, delta, accent, icon
}: {
  label: string; value: string; sub?: string
  delta?: { value: string; positive: boolean }
  accent: string; icon: string
}) {
  return (
    <div className="relative rounded-2xl p-5 overflow-hidden border border-white/06 bg-[#0A0D16] group hover:border-white/10 transition-all duration-200">
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, ${accent}99, transparent 60%)` }} />
      <div className="absolute -top-6 -right-4 w-20 h-20 rounded-full opacity-[0.06] blur-xl pointer-events-none" style={{ background: accent }} />
      <div className="flex items-start justify-between mb-3">
        <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#4A6080]">{label}</span>
        <span className="text-[16px] opacity-40">{icon}</span>
      </div>
      <div className="mono text-[28px] font-bold leading-none mb-2 tracking-tight" style={{ color: accent === '#EF4444' ? '#EF4444' : accent === '#F59E0B' ? '#F59E0B' : '#F0F4FF' }}>
        {value}
      </div>
      <div className="flex items-center gap-2">
        {delta && (
          <span className={`text-[11px] font-semibold px-1.5 py-0.5 rounded-md ${delta.positive ? 'text-[#10B981] bg-[#10B981]/10' : 'text-[#EF4444] bg-[#EF4444]/10'}`}>
            {delta.positive ? '↑' : '↓'} {delta.value}
          </span>
        )}
        {sub && <span className="text-[11px] text-[#4A6080]">{sub}</span>}
      </div>
    </div>
  )
}

// ── Section Title ──────────────────────────────────────
function SectionTitle({ children, sub }: { children: React.ReactNode; sub?: string }) {
  return (
    <div className="mb-4">
      <h2 className="text-[13px] font-bold text-[#C8D8F0] tracking-tight">{children}</h2>
      {sub && <p className="text-[11px] text-[#4A6080] mt-0.5">{sub}</p>}
    </div>
  )
}

// ── Bar Tooltip ────────────────────────────────────────
function BarTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl px-4 py-3 text-[12px] border border-white/08 shadow-2xl" style={{ background: '#0D1220' }}>
      <div className="text-[#4A6080] mono font-semibold mb-2">{label}</div>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center justify-between gap-5 mb-1">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-sm" style={{ background: p.fill }} />
            <span className="text-[#8899BB] capitalize">{p.dataKey === 'ingresos' ? 'Payouts' : p.dataKey === 'gastos' ? 'Fees' : 'Neto'}</span>
          </div>
          <span className="mono font-bold text-[#F0F4FF]">{fmtUSD(p.value)}</span>
        </div>
      ))}
    </div>
  )
}

// ── Snowball Tooltip ───────────────────────────────────
function SnowTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl px-4 py-3 text-[12px] border border-white/08 shadow-2xl" style={{ background: '#0D1220' }}>
      <div className="text-[#4A6080] mono font-semibold mb-2">{label}</div>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center justify-between gap-5 mb-1">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: p.stroke }} />
            <span className="text-[#8899BB] capitalize">{p.dataKey}</span>
          </div>
          <span className="mono font-bold text-[#F0F4FF]">{fmtUSD(p.value)}</span>
        </div>
      ))}
    </div>
  )
}

// ── Sustain Bar ────────────────────────────────────────
function SustainBar({ score, paCount }: { score: number; paCount: number }) {
  const color = score >= 70 ? '#10B981' : score >= 40 ? '#F59E0B' : '#EF4444'
  const label = score >= 70 ? 'Sostenible' : score >= 40 ? 'En desarrollo' : 'Crítico'
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] text-[#4A6080] uppercase tracking-widest font-bold">Score de sostenibilidad</span>
        <span className="mono text-[13px] font-bold" style={{ color }}>{score}/100 — {label}</span>
      </div>
      <div className="h-1.5 bg-white/05 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${score}%`, background: `linear-gradient(90deg, ${color}88, ${color})` }} />
      </div>
      <div className="flex justify-between mt-1.5">
        {[0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20].map(n => (
          <div key={n} className="flex flex-col items-center">
            <div className={`w-0.5 h-1 rounded-full ${n <= paCount * 1 ? '' : 'bg-white/05'}`}
              style={n <= paCount ? { background: color } : {}} />
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-0.5">
        <span className="text-[9px] text-[#2A3A50]">0 PAs</span>
        <span className="text-[9px] text-[#2A3A50]">20 PAs (max)</span>
      </div>
    </div>
  )
}

// ── Activity Feed ──────────────────────────────────────
function ActivityFeed({ expenses }: { expenses: any[] }) {
  const recent = [...expenses]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 6)

  if (recent.length === 0) return (
    <div className="text-center py-8">
      <div className="text-2xl mb-2 opacity-20">◈</div>
      <div className="text-[12px] text-[#4A6080]">Sin movimientos recientes</div>
    </div>
  )

  return (
    <div className="space-y-0">
      {recent.map((e, i) => (
        <div key={e.id} className={`flex items-center gap-3 py-3 ${i < recent.length - 1 ? 'border-b border-white/04' : ''}`}>
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold flex-shrink-0 ${e.type === 'payout' ? 'bg-[#10B981]/10 text-[#10B981]' : 'bg-[#EF4444]/10 text-[#EF4444]'}`}>
            {e.type === 'payout' ? '↑' : '↓'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[12px] font-semibold text-[#C8D8F0] truncate">{e.desc}</div>
            <div className="text-[10px] text-[#4A6080] mt-0.5">{e.firma} · {fmtDate(e.date)}</div>
          </div>
          <div className={`mono text-[13px] font-bold flex-shrink-0 ${e.type === 'payout' ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
            {e.type === 'payout' ? '+' : '-'}{fmtUSD(e.amount)}
          </div>
        </div>
      ))}
    </div>
  )
}

// ── PA Performance ─────────────────────────────────────
function PAPerformance({ accounts }: { accounts: any[] }) {
  const pa = accounts.filter((a: any) => a.status === 'pa')
  if (pa.length === 0) return (
    <div className="text-center py-6">
      <div className="text-[12px] text-[#4A6080]">Sin cuentas PA activas</div>
    </div>
  )
  return (
    <div className="space-y-3">
      {pa.map((a: any) => {
        const potential = (a.avgPayout || 400) * 1.5
        return (
          <div key={a.id} className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full flex-shrink-0 bg-[#10B981]" style={{ boxShadow: '0 0 6px #10B981' }} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[12px] font-semibold text-[#C8D8F0]">{a.firma} {a.plan} ${(a.size / 1000).toFixed(0)}K</span>
                <span className="mono text-[11px] text-[#10B981] font-bold">~{fmtUSD(potential)}/mes</span>
              </div>
              <div className="h-1 bg-white/05 rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-[#10B981]/60 to-[#10B981]"
                  style={{ width: `${Math.min(100, (potential / 800) * 100)}%` }} />
              </div>
              {a.consistency > 0 && (
                <div className="text-[10px] text-[#4A6080] mt-0.5">Límite/día: {fmtUSD(a.consistency)}</div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Main Component ─────────────────────────────────────
interface Props { state: any }

export default function NegocioView({ state }: Props) {
  const [snowPct, setSnowPct] = useState(0.5)

  const fin        = calcFinancials(state)
  const decision   = getDecision(state, fin)
  const cashflow   = buildMonthlyCashflow(state)
  const snowData   = buildSnowball(state, snowPct)

  const last       = snowData[11]
  const decisionColors = {
    success: { bg: 'rgba(16,185,129,0.06)', border: 'rgba(16,185,129,0.2)', dot: '#10B981' },
    warning: { bg: 'rgba(245,158,11,0.05)', border: 'rgba(245,158,11,0.2)', dot: '#F59E0B' },
    danger:  { bg: 'rgba(239,68,68,0.05)',  border: 'rgba(239,68,68,0.2)',  dot: '#EF4444' },
    info:    { bg: 'rgba(59,130,246,0.05)', border: 'rgba(59,130,246,0.2)', dot: '#3B82F6' },
    neutral: { bg: 'rgba(255,255,255,0.02)',border: 'rgba(255,255,255,0.08)',dot: '#4A6080' },
  }
  const dc = decisionColors[decision.level as keyof typeof decisionColors] || decisionColors.neutral

  return (
    <div className="space-y-6 animate-fade-in">

      {/* ── INSIGHT BANNER ── */}
      <div className="relative rounded-2xl px-5 py-4 border overflow-hidden"
        style={{ background: dc.bg, borderColor: dc.border }}>
        <div className="absolute top-0 left-0 right-0 h-px"
          style={{ background: `linear-gradient(90deg, ${dc.dot}CC, transparent 50%)` }} />
        <div className="flex items-start gap-3">
          <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0 animate-pulse-dot"
            style={{ background: dc.dot, boxShadow: `0 0 8px ${dc.dot}` }} />
          <div>
            <div className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#4A6080] mb-1">Insight del negocio</div>
            <div className="text-[15px] font-bold text-[#F0F4FF] leading-snug">{decision.text}</div>
            {decision.reason && <div className="text-[12px] text-[#4A6080] mt-1 leading-relaxed">{decision.reason}</div>}
          </div>
        </div>
      </div>

      {/* ── TOP METRICS ROW ── */}
      <div className="grid grid-cols-4 gap-3">
        <MetricCard
          label="Ingreso total"
          value={fmtUSD(fin.payouts)}
          sub={`${fin.nPayouts} payouts cobrados`}
          delta={fin.payouts > 0 ? { value: fin.roi.toFixed(1) + '% ROI', positive: fin.net >= 0 } : undefined}
          accent="#10B981" icon="↑"
        />
        <MetricCard
          label="Invertido en fees"
          value={fmtUSD(fin.fees)}
          sub={`${fin.nFees} challenges pagados`}
          accent="#EF4444" icon="↓"
        />
        <MetricCard
          label="Ingreso mensual est."
          value={fin.monthlyEstimate > 0 ? fmtUSD(fin.monthlyEstimate) : '—'}
          sub={fin.paCount > 0 ? `${fin.paCount} PA${fin.paCount > 1 ? 's' : ''} × ~${fmtUSD(fin.avgPayoutPerPA)}/payout` : 'Sin PAs activas'}
          accent="#3B82F6" icon="≈"
        />
        <MetricCard
          label="Tasa de éxito"
          value={fin.successRate > 0 ? fin.successRate + '%' : '—'}
          sub={`${fin.paCount} de ${fin.paCount + fin.lostCount} challenges pasados`}
          delta={fin.successRate >= 50 ? { value: 'buen ratio', positive: true } : fin.successRate > 0 ? { value: 'mejorar', positive: false } : undefined}
          accent="#F59E0B" icon="✓"
        />
      </div>

      {/* ── CASHFLOW + ACTIVITY ── */}
      <div className="grid grid-cols-[1fr_340px] gap-4">

        {/* Bar chart — monthly cashflow */}
        <div className="rounded-2xl border border-white/06 bg-[#0A0D16] overflow-hidden">
          <div className="px-5 pt-5 pb-3 border-b border-white/04 flex items-center justify-between">
            <div>
              <div className="text-[13px] font-bold text-[#C8D8F0]">Flujo de caja mensual</div>
              <div className="text-[11px] text-[#4A6080] mt-0.5">Ingresos vs gastos últimos 6 meses</div>
            </div>
            <div className="flex items-center gap-4 text-[10px] text-[#4A6080]">
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-[#10B981]/70" />Payouts</div>
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-[#EF4444]/70" />Fees</div>
            </div>
          </div>
          <div className="px-4 py-4">
            {cashflow.length === 0 ? (
              <div className="h-48 flex flex-col items-center justify-center text-[#4A6080]">
                <div className="text-2xl mb-2 opacity-20">▦</div>
                <div className="text-[12px]">Sin datos de cashflow aún</div>
                <div className="text-[11px] mt-1 opacity-60">Registra gastos y payouts para ver el gráfico</div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={cashflow} barGap={3} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke="rgba(255,255,255,0.03)" strokeDasharray="0" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill: '#3D5068', fontSize: 10, fontFamily: "'JetBrains Mono'" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#3D5068', fontSize: 10, fontFamily: "'JetBrains Mono'" }} axisLine={false} tickLine={false} tickFormatter={v => v >= 1000 ? '$' + (v / 1000).toFixed(0) + 'K' : '$' + v} width={40} />
                  <Tooltip content={<BarTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                  <Bar dataKey="ingresos" fill="#10B981" opacity={0.75} radius={[4, 4, 0, 0]} maxBarSize={32} />
                  <Bar dataKey="gastos"   fill="#EF4444" opacity={0.65} radius={[4, 4, 0, 0]} maxBarSize={32} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
          {/* Net row */}
          <div className="px-5 py-3 border-t border-white/04 flex items-center justify-between">
            <span className="text-[11px] text-[#4A6080]">Resultado neto acumulado</span>
            <span className={`mono text-[14px] font-bold ${fin.net >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
              {fin.net >= 0 ? '+' : ''}{fmtUSD(fin.net)}
            </span>
          </div>
        </div>

        {/* Activity feed */}
        <div className="rounded-2xl border border-white/06 bg-[#0A0D16] overflow-hidden">
          <div className="px-5 pt-5 pb-3 border-b border-white/04">
            <div className="text-[13px] font-bold text-[#C8D8F0]">Actividad reciente</div>
            <div className="text-[11px] text-[#4A6080] mt-0.5">Últimos movimientos</div>
          </div>
          <div className="px-5 py-1">
            <ActivityFeed expenses={state.expenses} />
          </div>
        </div>
      </div>

      {/* ── PA PERFORMANCE + SUSTAINABILITY + STATUS ── */}
      <div className="grid grid-cols-3 gap-4">

        {/* PA Performance */}
        <div className="rounded-2xl border border-white/06 bg-[#0A0D16] overflow-hidden">
          <div className="px-5 pt-5 pb-3 border-b border-white/04">
            <div className="text-[13px] font-bold text-[#C8D8F0]">Rendimiento por PA</div>
            <div className="text-[11px] text-[#4A6080] mt-0.5">Potencial mensual estimado</div>
          </div>
          <div className="px-5 py-4">
            <PAPerformance accounts={state.accounts} />
          </div>
        </div>

        {/* Sustainability */}
        <div className="rounded-2xl border border-white/06 bg-[#0A0D16] overflow-hidden">
          <div className="px-5 pt-5 pb-3 border-b border-white/04">
            <div className="text-[13px] font-bold text-[#C8D8F0]">Salud del negocio</div>
            <div className="text-[11px] text-[#4A6080] mt-0.5">Indicadores de sostenibilidad</div>
          </div>
          <div className="px-5 py-4 space-y-4">
            <SustainBar score={fin.sustainScore} paCount={fin.paCount} />
            <div className="grid grid-cols-2 gap-3 pt-2">
              {[
                { l: 'PAs activas', v: fin.paCount + ' / 20', ok: fin.paCount >= 2 },
                { l: 'Challenges',  v: fin.challengeCount + ' activos', ok: true },
                { l: 'Breakeven',   v: fin.gap > 0 ? fin.monthsToBreakEven + ' meses' : '✓ Recuperado', ok: fin.gap === 0 },
                { l: 'ROI total',   v: (fin.roi >= 0 ? '+' : '') + fin.roi.toFixed(1) + '%', ok: fin.roi >= 0 },
              ].map(({ l, v, ok }) => (
                <div key={l} className="glass-panel rounded-xl p-3 border border-white/04">
                  <div className="text-[10px] text-[#4A6080] uppercase tracking-widest mb-1">{l}</div>
                  <div className={`mono text-[13px] font-bold ${ok ? 'text-[#F0F4FF]' : 'text-[#EF4444]'}`}>{v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Account status */}
        <div className="rounded-2xl border border-white/06 bg-[#0A0D16] overflow-hidden">
          <div className="px-5 pt-5 pb-3 border-b border-white/04">
            <div className="text-[13px] font-bold text-[#C8D8F0]">Estado del portafolio</div>
            <div className="text-[11px] text-[#4A6080] mt-0.5">Distribución de cuentas</div>
          </div>
          <div className="px-5 py-4 space-y-3">
            {[
              { label: 'PA Activas',  count: fin.paCount,        color: '#10B981', pct: fin.paCount / Math.max(1, fin.paCount + fin.challengeCount + fin.lostCount) },
              { label: 'Challenges',  count: fin.challengeCount, color: '#F59E0B', pct: fin.challengeCount / Math.max(1, fin.paCount + fin.challengeCount + fin.lostCount) },
              { label: 'Cerradas',    count: fin.lostCount,      color: '#EF4444', pct: fin.lostCount / Math.max(1, fin.paCount + fin.challengeCount + fin.lostCount) },
            ].map(({ label, count, color, pct }) => (
              <div key={label}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                    <span className="text-[12px] text-[#8899BB]">{label}</span>
                  </div>
                  <span className="mono text-[13px] font-bold text-[#F0F4FF]">{count}</span>
                </div>
                <div className="h-1 bg-white/04 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.round(pct * 100)}%`, background: color, opacity: 0.7 }} />
                </div>
              </div>
            ))}
            <div className="pt-3 border-t border-white/04">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-[#4A6080]">Total cuentas</span>
                <span className="mono text-[13px] font-bold text-[#F0F4FF]">{fin.paCount + fin.challengeCount + fin.lostCount}</span>
              </div>
              <div className="flex items-center justify-between mt-1.5">
                <span className="text-[11px] text-[#4A6080]">Costo promedio challenge</span>
                <span className="mono text-[11px] text-[#8899BB]">{fmtUSD(fin.avgChallengeCost)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── SNOWBALL PROJECTION ── */}
      <div className="rounded-2xl border border-white/06 bg-[#0A0D16] overflow-hidden">
        <div className="px-5 pt-5 pb-3 border-b border-white/04 flex items-center justify-between">
          <div>
            <div className="text-[13px] font-bold text-[#C8D8F0]">Proyección a 12 meses — Bola de Nieve</div>
            <div className="text-[11px] text-[#4A6080] mt-0.5">3 escenarios basados en tu portafolio actual · máx 20 PAs simultáneas</div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-[#4A6080]">Reinversión</span>
            <select value={snowPct} onChange={e => setSnowPct(parseFloat(e.target.value))}
              className="text-[11px] text-[#F0F4FF] border border-white/06 rounded-lg px-2.5 py-1.5 outline-none cursor-pointer font-semibold"
              style={{ background: '#0D1220' }}>
              {[['20%', '0.2'], ['30%', '0.3'], ['50%', '0.5'], ['70%', '0.7']].map(([l, v]) => (
                <option key={v} value={v} style={{ background: '#0D1220' }}>{l}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Scenario cards */}
        <div className="grid grid-cols-3 gap-3 px-5 pt-4">
          {[
            { key: 'conservador', label: 'Conservador', val: last?.conservador || 0, color: '#6B7280', desc: '15% rotación mensual · reinversión mínima' },
            { key: 'moderado',    label: 'Moderado',    val: last?.moderado    || 0, color: '#3B82F6', desc: '8% rotación · balance retiro/reinversión' },
            { key: 'agresivo',    label: 'Agresivo',    val: last?.agresivo    || 0, color: '#10B981', desc: '3% rotación · reinversión máxima' },
          ].map(({ key, label, val, color, desc }) => (
            <div key={key} className="relative rounded-xl p-4 border border-white/05 overflow-hidden" style={{ background: `${color}08` }}>
              <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, ${color}88, transparent)` }} />
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-0.5 rounded-full" style={{ background: color }} />
                <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color }}>{label}</span>
              </div>
              <div className="mono text-[22px] font-bold text-[#F0F4FF] leading-none mb-1">{fmtUSD(val)}</div>
              <div className="text-[10px] text-[#4A6080] leading-relaxed">{desc}</div>
            </div>
          ))}
        </div>

        {/* Chart */}
        <div className="px-4 pt-4 pb-2">
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={snowData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <defs>
                {[['gC','#6B7280'],['gM','#3B82F6'],['gA','#10B981']].map(([id, color]) => (
                  <linearGradient key={id} id={id} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={color} stopOpacity={0.12} />
                    <stop offset="95%" stopColor={color} stopOpacity={0}    />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.03)" strokeDasharray="0" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: '#3D5068', fontSize: 10, fontFamily: "'JetBrains Mono'" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#3D5068', fontSize: 10, fontFamily: "'JetBrains Mono'" }} axisLine={false} tickLine={false}
                tickFormatter={v => v >= 1000 ? '$' + (v / 1000).toFixed(0) + 'K' : '$' + v} width={46} />
              <Tooltip content={<SnowTooltip />} />
              <Area type="monotone" dataKey="conservador" stroke="#6B7280" strokeWidth={1.5} fill="url(#gC)" dot={false} activeDot={{ r: 3, fill: '#6B7280', strokeWidth: 0 }} />
              <Area type="monotone" dataKey="moderado"    stroke="#3B82F6" strokeWidth={2}   fill="url(#gM)" dot={false} activeDot={{ r: 4, fill: '#3B82F6', strokeWidth: 0 }} />
              <Area type="monotone" dataKey="agresivo"    stroke="#10B981" strokeWidth={2}   fill="url(#gA)" dot={false} activeDot={{ r: 4, fill: '#10B981', strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Bottom stats + disclaimer */}
        <div className="px-5 py-4 border-t border-white/04">
          <div className="flex items-center justify-between">
            <div className="flex gap-6">
              <div>
                <div className="text-[10px] text-[#4A6080] uppercase tracking-widest">Rango a 12 meses</div>
                <div className="mono text-[12px] font-semibold text-[#8899BB] mt-0.5">{fmtUSD(last?.conservador || 0)} — {fmtUSD(last?.agresivo || 0)}</div>
              </div>
              <div>
                <div className="text-[10px] text-[#4A6080] uppercase tracking-widest">% para retirar ahora</div>
                <div className="mono text-[12px] font-semibold text-[#F59E0B] mt-0.5">{Math.round((1 - snowPct) * 100)}% de cada payout</div>
              </div>
              <div>
                <div className="text-[10px] text-[#4A6080] uppercase tracking-widest">Límite realista PAs</div>
                <div className="mono text-[12px] font-semibold text-[#F0F4FF] mt-0.5">Máx 20 simultáneas</div>
              </div>
            </div>
            <div className="flex gap-4 text-[10px] text-[#4A6080]">
              {[['#6B7280','Conservador'],['#3B82F6','Moderado'],['#10B981','Agresivo']].map(([c,l]) => (
                <div key={l} className="flex items-center gap-1.5">
                  <div className="w-3 h-0.5 rounded-full" style={{ background: c }} />
                  {l}
                </div>
              ))}
            </div>
          </div>
          <p className="text-[10px] text-[#2A3A50] mt-3 leading-relaxed">
            * Proyección estimada basada en tu portafolio actual. Asume que cada PA genera 1.5 payouts/mes en promedio. Los escenarios modelan diferentes tasas de rotación y reinversión. No garantiza resultados — el trading de futuros implica riesgo real de pérdida.
          </p>
        </div>
      </div>

    </div>
  )
}

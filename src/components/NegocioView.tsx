"use client"
import { useState } from "react"
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from "recharts"
import { Card, CardHeader, CardTitle, Badge, KpiCard, EmptyState, Semaphore } from "@/components/ui"
import { calcFinancials, getDecision, fmtUSD, fmtDate, buildSnowball, type SnowballPoint } from "@/lib/store"

// ── Decision Card ──────────────────────────────────────
function DecisionCard({ decision }: { decision: any }) {
  const cfg: Record<string, { border: string; dot: string; bg: string; label: string }> = {
    success: { border: "rgba(16,185,129,0.2)",  dot: "#10B981", bg: "rgba(16,185,129,0.04)",  label: "Acción recomendada" },
    warning: { border: "rgba(245,158,11,0.2)",  dot: "#F59E0B", bg: "rgba(245,158,11,0.03)",  label: "Atención necesaria"  },
    danger:  { border: "rgba(239,68,68,0.2)",   dot: "#EF4444", bg: "rgba(239,68,68,0.03)",   label: "Acción urgente"      },
    info:    { border: "rgba(59,130,246,0.2)",  dot: "#3B82F6", bg: "rgba(59,130,246,0.04)",  label: "Recomendación"       },
    neutral: { border: "rgba(255,255,255,0.07)",dot: "#3D5280", bg: "transparent",            label: "Estado actual"       },
  }
  const c = cfg[decision.level] || cfg.neutral
  return (
    <div className="rounded-2xl px-5 py-4 mb-5 relative overflow-hidden border"
      style={{ background: c.bg, borderColor: c.border }}>
      <div className="absolute top-0 left-0 right-0 h-px"
        style={{ background: `linear-gradient(90deg, ${c.dot}CC, transparent)` }} />
      <div className="flex items-start gap-3">
        <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0 animate-pulse-dot"
          style={{ background: c.dot, boxShadow: `0 0 8px ${c.dot}` }} />
        <div>
          <div className="text-[10px] font-bold tracking-widest uppercase text-t3 mb-1.5">{c.label}</div>
          <div className="text-[15px] font-bold text-t1 leading-snug mb-1">{decision.text}</div>
          <div className="text-[12px] text-t3 leading-relaxed">{decision.reason}</div>
        </div>
      </div>
    </div>
  )
}

// ── Custom Tooltip ─────────────────────────────────────
function SnowTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="glass rounded-xl px-4 py-3 text-[12px] border border-white/10 shadow-2xl">
      <div className="text-t3 font-mono mb-2.5 font-semibold">{label}</div>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center justify-between gap-6 mb-1.5">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
            <span className="text-t2 capitalize">{p.dataKey}</span>
          </div>
          <span className="mono font-bold text-t1">{fmtUSD(p.value)}</span>
        </div>
      ))}
    </div>
  )
}

// ── Custom Legend ──────────────────────────────────────
function SnowLegend() {
  return (
    <div className="flex items-center justify-center gap-6 mt-2">
      {[
        { color: "#6B7280", label: "Conservador", desc: "Alta rotación de cuentas, reinversión mínima" },
        { color: "#3B82F6", label: "Moderado",    desc: "Balance entre retiro y reinversión"           },
        { color: "#10B981", label: "Agresivo",    desc: "Reinversión máxima, escala rápida"            },
      ].map(({ color, label, desc }) => (
        <div key={label} className="flex items-center gap-2 group relative">
          <div className="w-3 h-0.5 rounded-full" style={{ background: color }} />
          <span className="text-[11px] text-t2">{label}</span>
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 glass rounded-lg px-2.5 py-1.5 text-[10px] text-t3 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 border border-white/08">
            {desc}
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Expense Row ────────────────────────────────────────
function ExpRow({ e }: { e: any }) {
  const firmaStyle =
    e.firma === "Apex"  ? { bg: "rgba(59,130,246,0.1)",  color: "#3B82F6" } :
    e.firma === "Lucid" ? { bg: "rgba(245,158,11,0.1)",  color: "#F59E0B" } :
                          { bg: "rgba(255,255,255,0.05)", color: "#8899BB" }
  const td = "py-2.5 pr-2 border-t border-white/04 text-[13px] text-t2 align-middle"
  return (
    <tr className="group hover:bg-white/02 transition-colors">
      <td className={td}>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${e.type === "fee" ? "bg-red/10 text-red" : "bg-green/10 text-green"}`}>
          {e.type === "fee" ? "↓ GASTO" : "↑ PAYOUT"}
        </span>
      </td>
      <td className={`${td} text-t1`}>{e.desc}</td>
      <td className={td}>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={firmaStyle}>{e.firma}</span>
      </td>
      <td className={`${td} mono text-[11px]`}>{fmtDate(e.date)}</td>
      <td className={`${td} mono font-bold ${e.type === "fee" ? "text-red" : "text-green"}`}>
        {e.type === "fee" ? "-" : "+"}${e.amount.toLocaleString("en-US", { maximumFractionDigits: 0 })}
      </td>
    </tr>
  )
}

// ── Main View ──────────────────────────────────────────
interface Props { state: any }

export default function NegocioView({ state }: Props) {
  const [snowPct, setSnowPct] = useState(0.5)
  const fin      = calcFinancials(state)
  const decision = getDecision(state, fin)
  const snowData = buildSnowball(state, snowPct)

  const expensesSorted = [...state.expenses].sort(
    (a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  const sosLevel: "green" | "yellow" | "red" = fin.paCount >= 2 ? "green" : fin.paCount === 1 ? "yellow" : "red"
  const sosText  = fin.paCount >= 3 ? "Negocio sostenible" : fin.paCount === 2 ? "Mínimo sostenible" : fin.paCount === 1 ? "Por debajo del mínimo" : state.accounts.length === 0 ? "Sin cuentas registradas" : "Sin PAs activas"
  const sosSub   = fin.paCount >= 3 ? `${fin.paCount} PAs generando ingresos` : fin.paCount === 2 ? "2 PAs — abre una más para crecer" : fin.paCount === 1 ? "Necesitas al menos 2 PAs" : "Activa 2 PAs para ser sostenible"
  const sosBadge: any = fin.paCount >= 2 ? "green" : fin.paCount === 1 ? "yellow" : "red"
  const sosBadgeTxt   = fin.paCount >= 3 ? "Sostenible" : fin.paCount === 2 ? "Mínimo OK" : fin.paCount === 1 ? "En riesgo" : "Crítico"

  // Snowball summary stats
  const last = snowData[11]
  const bestCase  = last?.agresivo   || 0
  const baseCase  = last?.moderado   || 0
  const worstCase = last?.conservador || 0

  return (
    <div className="animate-fade-in">
      <DecisionCard decision={decision} />

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-3.5 mb-5">
        <KpiCard label="Total Invertido" value={fmtUSD(fin.fees)}    sub={`${fin.nFees} fees pagados`}    accentColor="#EF4444" valueColor="#EF4444" />
        <KpiCard label="Total Cobrado"   value={fmtUSD(fin.payouts)} sub={`${fin.nPayouts} payouts`}      accentColor="#10B981" valueColor="#10B981" />
        <KpiCard label="ROI Neto"
          value={(fin.net >= 0 ? "+" : "") + fin.roi.toFixed(1) + "%"}
          sub={`resultado ${fmtUSD(fin.net)}`}
          accentColor="#3B82F6"
          valueColor={fin.net >= 0 ? "#10B981" : "#EF4444"} />
        <KpiCard label="Punto Equilibrio" value={fmtUSD(fin.fees)}
          sub={fin.gap > 0 ? `faltan ${fmtUSD(fin.gap)} para cubrir` : fin.fees > 0 ? "✓ inversión recuperada" : "sin gastos aún"}
          accentColor="#F59E0B" />
      </div>

      {/* Sos + Counters */}
      <div className="grid grid-cols-2 gap-4 mb-5">
        <Card>
          <CardHeader>
            <CardTitle>Sostenibilidad mensual</CardTitle>
            <Badge variant={sosBadge}>{sosBadgeTxt}</Badge>
          </CardHeader>
          <div className="px-5 py-4 flex items-center gap-3.5">
            <Semaphore level={sosLevel} />
            <div>
              <div className="text-[13px] font-semibold text-t1">{sosText}</div>
              <div className="text-[11px] text-t3 mt-0.5">{sosSub}</div>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader><CardTitle>Resumen de cuentas</CardTitle></CardHeader>
          <div className="px-4 py-3 grid grid-cols-3 gap-2.5">
            {[
              { label: "PA Activas", val: fin.paCount,        color: "#10B981" },
              { label: "Challenges", val: fin.challengeCount, color: "#F59E0B" },
              { label: "Perdidas",   val: fin.lostCount,      color: "#EF4444" },
            ].map(({ label, val, color }) => (
              <div key={label} className="text-center py-3 glass-panel rounded-xl border border-white/05">
                <div className="mono text-[22px] font-bold leading-none" style={{ color }}>{val}</div>
                <div className="text-[9px] text-t3 uppercase tracking-widest mt-1.5">{label}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* History — read only, no register button */}
      <Card className="mb-5">
        <CardHeader>
          <CardTitle>Historial Financiero</CardTitle>
          <span className="text-[11px] text-t3">Ve a <span className="text-blue">Mis Cuentas</span> para registrar movimientos</span>
        </CardHeader>
        <div className="px-5 pb-4">
          {expensesSorted.length === 0
            ? <EmptyState icon="◈" title="Sin movimientos" subtitle="Registra gastos y payouts desde la sección Mis Cuentas." />
            : (
              <table className="w-full">
                <thead>
                  <tr>
                    {["Tipo", "Descripción", "Firma", "Fecha", "Monto"].map(h => (
                      <th key={h} className="text-[10px] font-bold tracking-widest uppercase text-t3 pb-3 pt-3 text-left pr-2">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {expensesSorted.slice(0, 20).map((e: any) => <ExpRow key={e.id} e={e} />)}
                </tbody>
              </table>
            )
          }
        </div>
      </Card>

      {/* Snowball — 3 realistic scenarios */}
      <Card>
        <CardHeader>
          <CardTitle>Proyección 12 meses — Bola de Nieve</CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-t3">Reinversión base</span>
            <select
              value={snowPct}
              onChange={e => setSnowPct(parseFloat(e.target.value))}
              className="glass-panel text-[11px] text-t1 border border-white/06 rounded-lg px-2 py-1 outline-none cursor-pointer"
              style={{ background: "rgba(8,13,25,0.8)" }}
            >
              {[["20%", "0.2"], ["30%", "0.3"], ["50%", "0.5"], ["70%", "0.7"]].map(([l, v]) => (
                <option key={v} value={v} style={{ background: "#0A0F1E" }}>{l}</option>
              ))}
            </select>
          </div>
        </CardHeader>

        <div className="px-5 py-5">
          {/* Scenario summary cards */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            {[
              { label: "Escenario conservador", val: worstCase, color: "#6B7280", desc: "Alta rotación, sin escalar agresivamente" },
              { label: "Escenario moderado",    val: baseCase,  color: "#3B82F6", desc: "Balance retiro/reinversión. Más probable" },
              { label: "Escenario agresivo",    val: bestCase,  color: "#10B981", desc: "Reinversión máxima, crecimiento acelerado" },
            ].map(({ label, val, color, desc }) => (
              <div key={label} className="glass-panel rounded-xl p-3.5 border border-white/05 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, ${color}88, transparent)` }} />
                <div className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color }}>{label}</div>
                <div className="mono text-[20px] font-bold text-t1 leading-none mb-1">{fmtUSD(val)}</div>
                <div className="text-[10px] text-t3 leading-relaxed">{desc}</div>
              </div>
            ))}
          </div>

          {/* Chart */}
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={snowData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <defs>
                {[
                  { id: "gCons",  color: "#6B7280" },
                  { id: "gMod",   color: "#3B82F6" },
                  { id: "gAgres", color: "#10B981" },
                ].map(({ id, color }) => (
                  <linearGradient key={id} id={id} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={color} stopOpacity={0.15} />
                    <stop offset="95%" stopColor={color} stopOpacity={0}    />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="0" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: "#3D5280", fontSize: 10, fontFamily: "'JetBrains Mono'" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#3D5280", fontSize: 10, fontFamily: "'JetBrains Mono'" }} axisLine={false} tickLine={false}
                tickFormatter={v => v >= 1000 ? "$" + (v / 1000).toFixed(0) + "K" : "$" + v} width={52} />
              <Tooltip content={<SnowTooltip />} />
              <Area type="monotone" dataKey="conservador" stroke="#6B7280" strokeWidth={1.5} fill="url(#gCons)"  dot={false} activeDot={{ r: 3, fill: "#6B7280", strokeWidth: 0 }} />
              <Area type="monotone" dataKey="moderado"    stroke="#3B82F6" strokeWidth={2}   fill="url(#gMod)"   dot={false} activeDot={{ r: 4, fill: "#3B82F6", strokeWidth: 0 }} />
              <Area type="monotone" dataKey="agresivo"    stroke="#10B981" strokeWidth={2}   fill="url(#gAgres)" dot={false} activeDot={{ r: 4, fill: "#10B981", strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>

          <SnowLegend />

          {/* Bottom stats */}
          <div className="flex gap-6 mt-5 pt-4 border-t border-white/05">
            <div>
              <div className="text-[10px] text-t3 uppercase tracking-widest">Retiro acumulado (base)</div>
              <div className="mono text-[14px] font-semibold text-blue mt-1">{fmtUSD(baseCase)}</div>
            </div>
            <div>
              <div className="text-[10px] text-t3 uppercase tracking-widest">% para retirar</div>
              <div className="mono text-[14px] font-semibold text-yellow mt-1">{Math.round((1 - snowPct) * 100)}%</div>
            </div>
            <div>
              <div className="text-[10px] text-t3 uppercase tracking-widest">Límite PAs (realista)</div>
              <div className="mono text-[14px] font-semibold text-t1 mt-1">máx 20 cuentas</div>
            </div>
            <div>
              <div className="text-[10px] text-t3 uppercase tracking-widest">Rango a 12 meses</div>
              <div className="mono text-[14px] font-semibold text-t1 mt-1">
                {fmtUSD(worstCase)} — {fmtUSD(bestCase)}
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <p className="text-[10px] text-t3 mt-3 leading-relaxed opacity-60">
            * Proyección basada en tu portafolio actual. Escenario conservador asume 15% de rotación mensual de cuentas. Moderado 8%. Agresivo 3%. Ningún escenario garantiza resultados — el trading implica riesgo real.
          </p>
        </div>
      </Card>
    </div>
  )
}

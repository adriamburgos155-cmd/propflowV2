"use client"
import { calcFinancials } from "@/lib/store"

const NAV = [
  { id:"negocio",   label:"Mi Negocio",   icon:"◈" },
  { id:"cuentas",   label:"Mis Cuentas",  icon:"⊞" },
  { id:"consejero", label:"Consejero IA", icon:"◎" },
]

interface Props { view: string; setView: (v: string) => void; state: any; user: any; onSignOut: () => void }

export default function Sidebar({ view, setView, state, user, onSignOut }: Props) {
  const fin = calcFinancials(state)
  const level = fin.paCount >= 2 ? "green" : fin.paCount === 1 ? "yellow" : "red"
  const label = fin.paCount >= 3 ? "Sostenible" : fin.paCount === 2 ? "Mínimo viable" : fin.paCount === 1 ? "En riesgo" : "Sin sostenibilidad"
  const sub   = fin.paCount > 0 ? `${fin.paCount} PA${fin.paCount>1?"s":""} activa${fin.paCount>1?"s":""}` : "Sin PAs activas"
  const dotColor = level==="green" ? "#10B981" : level==="yellow" ? "#F59E0B" : "#EF4444"
  const initial = user?.email?.[0]?.toUpperCase() || "?"
  const emailShort = user?.email ? (user.email.length > 20 ? user.email.slice(0,18)+"…" : user.email) : ""

  return (
    <aside className="w-[220px] min-w-[220px] glass-panel border-r border-white/06 flex flex-col fixed top-0 left-0 bottom-0 z-50">
      {/* Logo */}
      <div className="px-5 pt-6 pb-5 border-b border-white/06">
        <div className="mono text-[18px] font-bold text-gradient-blue tracking-tight">PropFlow</div>
        <div className="text-[9px] text-t3 tracking-[0.18em] uppercase mt-1">Prop Firm Manager</div>
      </div>

      {/* Nav */}
      <nav className="p-3 flex-1">
        {NAV.map(item => (
          <button key={item.id} onClick={() => setView(item.id)}
            className={`flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150 mb-1 border text-left
              ${view===item.id
                ? "bg-blue/08 border-blue/18 text-blue"
                : "border-transparent text-t2 hover:bg-white/04 hover:text-t1"}`}>
            <span className="text-[14px] w-4 text-center">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-white/06 space-y-2">
        {/* Status pill */}
        <div className="glass-panel rounded-xl px-3 py-2.5 flex items-center gap-2.5 border border-white/05">
          <div className="w-2 h-2 rounded-full flex-shrink-0 animate-pulse-dot" style={{ background: dotColor, boxShadow: `0 0 6px ${dotColor}` }}/>
          <div>
            <div className="text-[12px] font-semibold text-t1">{label}</div>
            <div className="text-[10px] text-t2 mt-0.5">{sub}</div>
          </div>
        </div>
        {/* User row */}
        <div className="glass-panel rounded-xl px-3 py-2 flex items-center gap-2 border border-white/05">
          <div className="w-6 h-6 rounded-full bg-blue/15 border border-blue/20 flex items-center justify-center text-[10px] font-bold text-blue flex-shrink-0">{initial}</div>
          <div className="flex-1 min-w-0 text-[11px] text-t2 truncate">{emailShort}</div>
          <button onClick={onSignOut} title="Cerrar sesión"
            className="text-t3 hover:text-red transition-colors text-[13px] ml-1 w-5 h-5 flex items-center justify-center rounded hover:bg-red/08">⏻</button>
        </div>
      </div>
    </aside>
  )
}

"use client"
import { Badge, Btn, Card, EmptyState } from "@/components/ui"
import { fmtUSD } from "@/lib/store"

function AccountCard({ a, onEdit, onDelete, onPayout }: any) {
  const statusMap: any = {
    pa:        {label:"PA ACTIVA", badge:"green",  accent:"#10B981"},
    challenge: {label:"CHALLENGE", badge:"yellow", accent:"#F59E0B"},
    lost:      {label:"PERDIDA",   badge:"red",    accent:"#EF4444"},
  }
  const s = statusMap[a.status] || statusMap.lost
  const target = a.size * 1.06
  const pct = a.status==="challenge" ? Math.min(100,Math.max(0,Math.round(((a.balance-a.size)/(target-a.size))*100))) : 0
  const balColor = a.balance > a.size ? "#10B981" : "#F0F4FF"

  return (
    <div className="glass-card rounded-2xl p-5 relative overflow-hidden group transition-all duration-200 hover:border-white/12 hover:-translate-y-px flex flex-col">
      <div className="absolute top-0 left-0 right-0 h-px" style={{background:`linear-gradient(90deg,${s.accent}BB,transparent)`}}/>
      <div className="absolute top-0 left-0 w-32 h-32 rounded-full opacity-[0.035] blur-2xl pointer-events-none" style={{background:s.accent}}/>

      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="text-[10px] text-t3 font-bold uppercase tracking-widest">{a.firma} · {a.plan}</div>
          <div className="text-[15px] font-bold text-t1 mt-0.5">${(a.size/1000).toFixed(0)}K {a.status==="challenge"?"Eval":a.status==="pa"?"PA":"Cerrada"}</div>
        </div>
        <Badge variant={s.badge}>{s.label}</Badge>
      </div>

      <div className="mono text-[24px] font-bold leading-none mb-1" style={{color:balColor}}>{fmtUSD(a.balance)}</div>
      <div className="mono text-[11px] text-t3 mb-3">
        {a.status==="challenge" ? `Meta ${fmtUSD(target)} · progreso ${pct}%` : a.status==="pa" ? `PA activa · ~${fmtUSD(a.avgPayout||400)}/payout` : "Cuenta cerrada"}
      </div>

      {a.status==="challenge" && (
        <div className="h-1 bg-white/05 rounded-full overflow-hidden mb-3">
          <div className="h-full rounded-full transition-all duration-700" style={{width:`${pct}%`,background:s.accent}}/>
        </div>
      )}
      {a.status!=="challenge" && <div className="h-4"/>}

      <div className="flex gap-4 flex-wrap mb-4">
        {[{l:"Costo",v:fmtUSD(a.cost)},{...(a.consistency>0?{l:"Máx/día",v:fmtUSD(a.consistency),c:"#F59E0B"}:{})},{...(a.notes?{l:"Nota",v:a.notes}:{})}].filter(x=>x.l).map((m:any)=>(
          <div key={m.l}>
            <div className="text-[10px] text-t3 uppercase tracking-widest">{m.l}</div>
            <div className="mono text-[12px] font-semibold mt-0.5" style={{color:m.c||"#8899BB"}}>{m.v}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-2 pt-3 border-t border-white/05 mt-auto">
        {a.status==="pa" && (
          <button onClick={()=>onPayout(a)} className="flex-1 text-[11px] font-bold py-1.5 rounded-lg border border-green/20 text-green bg-green/05 hover:bg-green/12 transition-all">↑ Payout</button>
        )}
        <button onClick={()=>onEdit(a)} className="flex-1 text-[11px] font-semibold py-1.5 rounded-lg border border-white/07 text-t2 hover:bg-white/05 hover:text-t1 transition-all">✎ Editar</button>
        <button onClick={()=>onDelete(a.id)} className="text-[11px] font-semibold px-3 py-1.5 rounded-lg border border-red/15 text-red hover:bg-red/08 transition-all">✕</button>
      </div>
    </div>
  )
}

export default function CuentasView({ state, onAdd, onEdit, onDelete, onPayout }: any) {
  const accounts = state.accounts
  const pa = accounts.filter((a:any)=>a.status==="pa")
  const ch = accounts.filter((a:any)=>a.status==="challenge")
  const lo = accounts.filter((a:any)=>a.status==="lost")

  const Section = ({title,items,accent}:{title:string;items:any[];accent:string}) => {
    if(!items.length) return null
    return (
      <div className="mb-7">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-0.5 h-4 rounded-full" style={{background:accent}}/>
          <span className="text-[11px] font-bold uppercase tracking-widest text-t3">{title}</span>
          <span className="mono text-[11px] text-t3">({items.length})</span>
        </div>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-3.5">
          {items.map((a:any)=><AccountCard key={a.id} a={a} onEdit={onEdit} onDelete={onDelete} onPayout={onPayout}/>)}
        </div>
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-[18px] font-bold text-t1">Mis Cuentas</div>
          <div className="text-[12px] text-t3 mt-0.5">{accounts.length} cuenta{accounts.length!==1?"s":""} registrada{accounts.length!==1?"s":""}</div>
        </div>
        <Btn variant="primary" onClick={onAdd}>+ Nueva cuenta</Btn>
      </div>
      {accounts.length===0
        ? <Card><EmptyState icon="⊞" title="No tienes cuentas registradas" subtitle="Agrega tu primera cuenta de prop firm para comenzar." action={<Btn onClick={onAdd}>+ Agregar primera cuenta</Btn>}/></Card>
        : <><Section title="PA Activas" items={pa} accent="#10B981"/><Section title="En Evaluación" items={ch} accent="#F59E0B"/><Section title="Cerradas / Perdidas" items={lo} accent="#EF4444"/></>
      }
    </div>
  )
}

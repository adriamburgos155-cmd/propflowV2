"use client"
import { useState, useEffect } from "react"
import { Modal, Btn, Input, FormGroup, FormRow } from "@/components/ui"

export default function PayoutModal({ open, onClose, onSave, account }: any) {
  const today = new Date().toISOString().split("T")[0]
  const [f, setF] = useState({amount:"",date:today,note:""})
  useEffect(()=>{ if(open&&account) setF({amount:String(account.avgPayout||""),date:today,note:""}) },[open,account])
  const s=(k:string)=>(e:any)=>setF(p=>({...p,[k]:e.target.value}))
  const save=()=>{
    const amt=parseFloat(f.amount); if(!amt||amt<=0) return
    onSave({id:Date.now(),type:"payout",firma:account?.firma||"Otro",desc:f.note||`Payout ${account?.firma||""} ${account?.plan||""}`.trim(),amount:amt,date:f.date})
    onClose()
  }
  return (
    <Modal open={open} onClose={onClose} title="Registrar Payout" footer={<><Btn variant="ghost" onClick={onClose}>Cancelar</Btn><Btn variant="green" onClick={save}>↑ Registrar payout</Btn></>}>
      {account&&<div className="bg-green/05 border border-green/15 rounded-xl px-3.5 py-2.5 mb-4 text-[12px] text-green">{account.firma} {account.plan} — ${(account.size/1000).toFixed(0)}K · Balance: ${account.balance?.toLocaleString()}</div>}
      <FormGroup><FormRow><Input label="Monto cobrado ($)" type="number" value={f.amount} onChange={s("amount")} placeholder="ej: 500"/><Input label="Fecha" type="date" value={f.date} onChange={s("date")}/></FormRow></FormGroup>
      <FormGroup><Input label="Nota (opcional)" value={f.note} onChange={s("note")} placeholder="ej: payout #1 NQ"/></FormGroup>
    </Modal>
  )
}

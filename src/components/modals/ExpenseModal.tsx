"use client"
import { useState, useEffect } from "react"
import { Modal, Btn, Input, Select, FormGroup, FormRow } from "@/components/ui"

export default function ExpenseModal({ open, onClose, onSave }: any) {
  const today = new Date().toISOString().split("T")[0]
  const [f, setF] = useState({type:"fee",firma:"Apex",desc:"",amount:"",date:today})
  useEffect(()=>{ if(open) setF({type:"fee",firma:"Apex",desc:"",amount:"",date:today}) },[open])
  const s=(k:string)=>(e:any)=>setF(p=>({...p,[k]:e.target.value}))
  const save=()=>{
    const amt=parseFloat(f.amount); if(!amt||amt<=0) return
    onSave({id:Date.now(),type:f.type,firma:f.firma,desc:f.desc||(f.type==="fee"?"Fee / Challenge":"Payout cobrado"),amount:amt,date:f.date})
    onClose()
  }
  return (
    <Modal open={open} onClose={onClose} title="Registrar Movimiento" footer={<><Btn variant="ghost" onClick={onClose}>Cancelar</Btn><Btn onClick={save}>Registrar</Btn></>}>
      <FormGroup><FormRow>
        <Select label="Tipo" value={f.type} onChange={s("type")} options={[{value:"fee",label:"Gasto (fee / challenge)"},{value:"payout",label:"Ingreso (payout cobrado)"}]}/>
        <Select label="Firma" value={f.firma} onChange={s("firma")} options={[{value:"Apex",label:"Apex"},{value:"Lucid",label:"Lucid"},{value:"Otro",label:"Otro"}]}/>
      </FormRow></FormGroup>
      <FormGroup><Input label="Descripción" value={f.desc} onChange={s("desc")} placeholder="ej: Challenge 50K LucidFlex, Payout PA #2..."/></FormGroup>
      <FormGroup><FormRow><Input label="Monto ($)" type="number" value={f.amount} onChange={s("amount")} placeholder="0.00"/><Input label="Fecha" type="date" value={f.date} onChange={s("date")}/></FormRow></FormGroup>
    </Modal>
  )
}

"use client"
import { useState, useEffect } from "react"
import { Modal, Btn, Input, Select, FormGroup, FormRow } from "@/components/ui"

const FIRMAS = [{value:"Apex",label:"Apex Trader Funding"},{value:"Lucid",label:"Lucid Trading"},{value:"Otro",label:"Otra firma"}]
const PLANES = [{value:"LucidFlex",label:"LucidFlex"},{value:"LucidPro",label:"LucidPro"},{value:"EOD Apex",label:"EOD (Apex)"},{value:"Personalizado",label:"Personalizado"}]
const SIZES  = [{value:"25000",label:"$25,000"},{value:"50000",label:"$50,000"},{value:"100000",label:"$100,000"},{value:"150000",label:"$150,000"},{value:"200000",label:"$200,000"}]
const STATUSES=[{value:"challenge",label:"Challenge (evaluación)"},{value:"pa",label:"PA Activa (fondeada)"},{value:"lost",label:"Perdida / Cerrada"}]
const E0 = {firma:"Apex",plan:"LucidFlex",size:"50000",status:"challenge",balance:"",cost:"",consistency:"",avgPayout:"",notes:""}

export default function AccountModal({ open, onClose, onSave, editAccount }: any) {
  const [f, setF] = useState(E0)
  useEffect(()=>{
    if(editAccount){setF({firma:editAccount.firma,plan:editAccount.plan,size:String(editAccount.size),status:editAccount.status,balance:String(editAccount.balance||""),cost:String(editAccount.cost||""),consistency:String(editAccount.consistency||""),avgPayout:String(editAccount.avgPayout||""),notes:editAccount.notes||""})}
    else setF(E0)
  },[editAccount,open])
  const s = (k:string)=>(e:any)=>setF(p=>({...p,[k]:e.target.value}))
  const save = ()=>{
    const acc={id:editAccount?editAccount.id:Date.now(),firma:f.firma,plan:f.plan,size:parseInt(f.size),status:f.status,balance:parseFloat(f.balance)||parseInt(f.size),cost:parseFloat(f.cost)||0,consistency:parseFloat(f.consistency)||0,avgPayout:parseFloat(f.avgPayout)||400,notes:f.notes,createdAt:editAccount?.createdAt||new Date().toISOString()}
    onSave(acc,!editAccount); onClose()
  }
  return (
    <Modal open={open} onClose={onClose} title={editAccount?"Editar Cuenta":"Nueva Cuenta"}
      footer={<><Btn variant="ghost" onClick={onClose}>Cancelar</Btn><Btn onClick={save}>Guardar cuenta</Btn></>}>
      <FormGroup><FormRow><Select label="Firma" value={f.firma} onChange={s("firma")} options={FIRMAS}/><Select label="Plan / Tipo" value={f.plan} onChange={s("plan")} options={PLANES}/></FormRow></FormGroup>
      <FormGroup><FormRow><Select label="Tamaño" value={f.size} onChange={s("size")} options={SIZES}/><Select label="Estado" value={f.status} onChange={s("status")} options={STATUSES}/></FormRow></FormGroup>
      <FormGroup><FormRow><Input label="Balance actual ($)" type="number" value={f.balance} onChange={s("balance")} placeholder="ej: 51500"/><Input label="Costo pagado ($)" type="number" value={f.cost} onChange={s("cost")} placeholder="ej: 140"/></FormRow></FormGroup>
      {f.status==="challenge"&&<FormGroup><Input label="Límite diario consistencia ($)" type="number" value={f.consistency} onChange={s("consistency")} placeholder="ej: 1500" hint="Ejemplo: objetivo $3,000 y consistencia 50% → máx/día $1,500"/></FormGroup>}
      <FormGroup><Input label="Ganancia promedio por payout ($)" type="number" value={f.avgPayout} onChange={s("avgPayout")} placeholder="ej: 400 — para proyección bola de nieve"/></FormGroup>
      <FormGroup><Input label="Notas (opcional)" value={f.notes} onChange={s("notes")} placeholder="ej: cuenta principal NQ"/></FormGroup>
    </Modal>
  )
}

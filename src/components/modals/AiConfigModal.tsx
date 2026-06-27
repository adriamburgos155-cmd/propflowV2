"use client"
import { useState, useEffect } from "react"
import { Modal, Btn, Input, Select, FormGroup } from "@/components/ui"

export default function AiConfigModal({ open, onClose, onSave, config }: any) {
  const [f, setF] = useState({persona:"balanced",context:"",meta:""})
  useEffect(()=>{ if(open&&config) setF({persona:config.persona||"balanced",context:config.context||"",meta:String(config.meta||"")}) },[open,config])
  const s=(k:string)=>(e:any)=>setF(p=>({...p,[k]:e.target.value}))
  const save=()=>{ onSave({persona:f.persona,context:f.context,meta:parseFloat(f.meta)||0}); onClose() }
  return (
    <Modal open={open} onClose={onClose} title="Configurar Consejero IA" footer={<><Btn variant="ghost" onClick={onClose}>Cancelar</Btn><Btn onClick={save}>Guardar</Btn></>}>
      <div className="flex items-center gap-3 glass-panel rounded-xl px-3.5 py-3 mb-4 border border-white/05">
        <div className="w-2 h-2 rounded-full bg-green flex-shrink-0" style={{boxShadow:"0 0 6px #10B981"}}/>
        <div><div className="text-[12px] font-semibold text-t1">Claude Sonnet</div><div className="text-[11px] text-t3 mt-0.5">Activo — usa tu portafolio real como contexto</div></div>
      </div>
      <FormGroup><Select label="Perfil del consejero" value={f.persona} onChange={s("persona")} options={[{value:"strict",label:"Estricto — solo datos, cero rodeos"},{value:"balanced",label:"Equilibrado — análisis + recomendación"},{value:"coach",label:"Coach — estratégico y motivador"}]}/></FormGroup>
      <FormGroup><Input label="Meta mensual de retiro ($)" type="number" value={f.meta} onChange={s("meta")} placeholder="ej: 1500 — tu objetivo de ingreso mensual"/></FormGroup>
      <FormGroup><Input label="Contexto extra (opcional)" value={f.context} onChange={s("context")} placeholder="ej: opero NQ/MNQ, London y NY session" hint="Se incluye en cada consulta para personalizar las respuestas"/></FormGroup>
    </Modal>
  )
}

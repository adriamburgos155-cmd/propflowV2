"use client"
import { useState, useRef, useEffect } from "react"
import { ChatInput, ChatInputTextArea, ChatInputSubmit } from "@/components/ui/chat-input"
import { Badge } from "@/components/ui"
import { calcFinancials, fmtUSD } from "@/lib/store"

const QUICK = [
  {label:"¿Abrir otra cuenta?",  text:"¿Debo abrir otra cuenta challenge ahora o esperar?"},
  {label:"¿Cuánto retirar?",     text:"¿Cuánto puedo retirar este mes de manera segura?"},
  {label:"Análisis completo",    text:"Dame un análisis completo de mi situación financiera"},
  {label:"¿Soy sostenible?",     text:"¿Estoy siendo sostenible con mi negocio de prop firms?"},
  {label:"Estrategia de escala", text:"¿Cómo puedo escalar más rápido con mi capital actual?"},
  {label:"¿Cuántas PAs?",        text:"¿Cuántas cuentas PA necesito para vivir del trading?"},
]

function buildPrompt(state: any) {
  const fin = calcFinancials(state)
  const pa  = state.accounts.filter((a:any)=>a.status==="pa")
  const ch  = state.accounts.filter((a:any)=>a.status==="challenge")
  const pm  = {"strict":"Eres un consejero financiero directo y frío. Solo datos y cifras concretas. Respuestas cortas, sin adornos.",
                "balanced":"Eres un consejero financiero inteligente especializado en prop firms de futuros. Das análisis claro con recomendaciones concretas y accionables.",
                "coach":"Eres un coach financiero de trading. Combinas datos reales con visión estratégica y motivación. Directo, enfocado en el crecimiento."}
  const persona = pm[(state.aiConfig?.persona||"balanced") as keyof typeof pm]
  const meta = state.aiConfig?.meta || 0
  return `${persona}

PORTAFOLIO ACTUAL:
- PAs activas: ${pa.length} → ${pa.map((a:any)=>`${a.firma} ${a.plan} $${(a.size/1000).toFixed(0)}K (balance: ${fmtUSD(a.balance)}, avg payout: ${fmtUSD(a.avgPayout||400)})`).join(", ")||"ninguna"}
- Challenges: ${ch.length} → ${ch.map((a:any)=>`${a.firma} ${a.plan} $${(a.size/1000).toFixed(0)}K${a.consistency>0?` (límite/día: ${fmtUSD(a.consistency)})`:"()"}`).join(", ")||"ninguno"}
- Total invertido: ${fmtUSD(fin.fees)} | Total cobrado: ${fmtUSD(fin.payouts)} | Resultado: ${fin.net>=0?"+":""}${fmtUSD(fin.net)} | ROI: ${fin.roi.toFixed(1)}%
- Sostenibilidad: ${pa.length>=2?"✓ Sostenible":pa.length===1?"⚠ Mínimo":"✗ No sostenible"}
${meta>0?`- Meta mensual: ${fmtUSD(meta)}`:""}${state.aiConfig?.context?`\n- Contexto: ${state.aiConfig.context}`:""}

Opera futuros NQ/MNQ, modelo EOD. Mínimo sostenible: 2 PAs activas. Estrategia: bola de nieve.
Responde en español. Usa **negrita** para lo más importante. Sé específico con los números.`
}

interface Msg { role:"user"|"assistant"; content: string; time: string }

export default function ConsejeroView({ state, onOpenConfig }: { state: any; onOpenConfig: () => void }) {
  const [messages, setMessages] = useState<Msg[]>([{
    role:"assistant",
    content:"Hola. Soy tu consejero financiero PropFlow.\n\nTengo acceso completo a tu portafolio — cuentas activas, gastos, payouts y proyecciones. Puedo ayudarte a decidir cuándo escalar, cuándo retirar y cómo gestionar tu negocio de prop firms.\n\n¿Qué quieres analizar?",
    time: new Date().toLocaleTimeString("es",{hour:"2-digit",minute:"2-digit"})
  }])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const histRef = useRef<{role:string;content:string}[]>([])
  const msgsRef = useRef<HTMLDivElement>(null)

  useEffect(() => { if (msgsRef.current) msgsRef.current.scrollTop = msgsRef.current.scrollHeight }, [messages, loading])

  const send = async (text?: string) => {
    const msg = text || input.trim()
    if (!msg || loading) return
    setInput("")
    const time = new Date().toLocaleTimeString("es",{hour:"2-digit",minute:"2-digit"})
    setMessages(m=>[...m,{role:"user",content:msg,time}])
    histRef.current = [...histRef.current,{role:"user",content:msg}]
    setLoading(true)
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({model:"claude-sonnet-4-6",max_tokens:1000,system:buildPrompt(state),messages:histRef.current.slice(-14)})
      })
      const data = await res.json()
      const reply = data.content?.[0]?.text||"Error al obtener respuesta."
      histRef.current=[...histRef.current,{role:"assistant",content:reply}]
      setMessages(m=>[...m,{role:"assistant",content:reply,time:new Date().toLocaleTimeString("es",{hour:"2-digit",minute:"2-digit"})}])
    } catch { setMessages(m=>[...m,{role:"assistant",content:"Error de conexión. Intenta de nuevo.",time:new Date().toLocaleTimeString("es",{hour:"2-digit",minute:"2-digit"})}]) }
    setLoading(false)
  }

  return (
    <div className="glass-card rounded-2xl overflow-hidden flex flex-col animate-fade-in" style={{height:"calc(100vh - 120px)"}}>
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-white/06 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-bold uppercase tracking-widest text-t2">Consejero IA</span>
          <Badge variant="blue">Claude Sonnet</Badge>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-green animate-pulse-dot" style={{boxShadow:"0 0 5px #10B981"}}/>
            <span className="text-[11px] text-t2">Activo</span>
          </div>
          <button onClick={onOpenConfig} className="text-[11px] text-t2 hover:text-t1 border border-white/07 rounded-lg px-2.5 py-1 hover:bg-white/05 hover:border-blue/25 transition-all">⚙ Config</button>
        </div>
      </div>

      {/* Quick prompts */}
      <div className="flex gap-2 px-4 py-2.5 overflow-x-auto scrollbar-none border-b border-white/04 flex-shrink-0">
        {QUICK.map(({label,text})=>(
          <button key={label} onClick={()=>send(text)}
            className="flex-shrink-0 glass-panel text-[11px] text-t2 hover:text-blue border border-white/05 hover:border-blue/20 rounded-full px-3 py-1.5 whitespace-nowrap transition-all duration-150">
            {label}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div ref={msgsRef} className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">
        {messages.map((m,i)=>(
          <div key={i} className={`flex gap-2.5 max-w-[85%] animate-fade-in ${m.role==="user"?"self-end flex-row-reverse":""}`}>
            <div className={`w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center text-[11px] font-bold ${m.role==="assistant"?"bg-blue/12 text-blue border border-blue/18":"glass-panel text-t2 border border-white/07"}`}>
              {m.role==="assistant"?"PF":"Tú"}
            </div>
            <div>
              <div className={`px-4 py-2.5 rounded-xl text-[13px] leading-relaxed ${m.role==="assistant"?"glass-panel border border-white/06 text-t1 rounded-tl-sm":"bg-blue/10 border border-blue/18 text-t1 rounded-tr-sm"}`}
                dangerouslySetInnerHTML={{__html:m.content.replace(/\n/g,"<br>").replace(/\*\*(.*?)\*\*/g,"<strong>$1</strong>")}}/>
              <div className={`mono text-[10px] text-t3 mt-1 ${m.role==="user"?"text-right":""}`}>{m.time}</div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-2.5 max-w-[85%]">
            <div className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center text-[11px] font-bold bg-blue/12 text-blue border border-blue/18">PF</div>
            <div className="glass-panel border border-white/06 rounded-xl rounded-tl-sm px-4 py-3">
              <div className="bounce-dots flex gap-1"><span/><span/><span/></div>
            </div>
          </div>
        )}
      </div>

      {/* Input using shadcn ChatInput */}
      <div className="px-4 py-3 border-t border-white/06 flex-shrink-0">
        <ChatInput
          value={input}
          onChange={e=>setInput(e.target.value)}
          onSubmit={()=>send()}
          loading={loading}
          onStop={()=>setLoading(false)}
          variant="default"
          rows={1}
        >
          <ChatInputTextArea placeholder="Pregunta sobre tu negocio... (Enter para enviar)"/>
          <ChatInputSubmit/>
        </ChatInput>
      </div>
    </div>
  )
}

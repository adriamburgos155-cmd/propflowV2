"use client"
import { useState } from "react"

interface Props { onSignIn: (email: string, password: string) => Promise<void>; onSignUp: (email: string, password: string) => Promise<void> }

export default function AuthScreen({ onSignIn, onSignUp }: Props) {
  const [mode, setMode] = useState<"login"|"signup">("login")
  const [email, setEmail] = useState("")
  const [password, setPass] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const handle = async (e: React.FormEvent) => {
    e.preventDefault(); setError(""); setLoading(true)
    try {
      if (mode === "login") { await onSignIn(email, password) }
      else { await onSignUp(email, password); setDone(true) }
    } catch (err: any) { setError(translateError(err.message)) }
    setLoading(false)
  }

  if (done) return (
    <Shell>
      <div className="text-center">
        <div className="text-4xl mb-4">✉️</div>
        <div className="text-[17px] font-bold text-t1 mb-2">Revisa tu correo</div>
        <div className="text-[13px] text-t3 leading-relaxed">Enviamos un link de confirmación a<br/><span className="mono text-blue">{email}</span></div>
        <button onClick={() => { setDone(false); setMode("login") }} className="mt-5 text-[13px] text-t2 hover:text-t1 transition-colors border border-white/08 rounded-xl px-4 py-2 hover:bg-white/05">Volver al login</button>
      </div>
    </Shell>
  )

  return (
    <Shell>
      {/* Toggle */}
      <div className="flex glass-panel rounded-xl p-1 mb-6 border border-white/06">
        {(["login","signup"] as const).map(m => (
          <button key={m} onClick={() => { setMode(m); setError("") }}
            className={`flex-1 py-2 rounded-lg text-[13px] font-semibold transition-all duration-200 ${mode===m?"glass text-t1 shadow-sm":"text-t3 hover:text-t2"}`}>
            {m==="login"?"Iniciar sesión":"Crear cuenta"}
          </button>
        ))}
      </div>

      <form onSubmit={handle} className="flex flex-col gap-4">
        {[{label:"Email",type:"email",val:email,set:setEmail,ph:"tu@email.com"},{label:"Contraseña",type:"password",val:password,set:setPass,ph:mode==="signup"?"Mínimo 6 caracteres":"••••••••"}].map(f => (
          <div key={f.label}>
            <label className="block text-[11px] font-bold uppercase tracking-widest text-t3 mb-1.5">{f.label}</label>
            <input type={f.type} value={f.val} onChange={e=>f.set(e.target.value)} placeholder={f.ph} required minLength={f.type==="password"?6:undefined}
              className="w-full glass-panel rounded-xl px-3.5 py-2.5 text-[13px] text-t1 placeholder:text-t3 border border-white/06 outline-none transition-all focus:border-blue/40 focus:ring-1 focus:ring-blue/10" />
          </div>
        ))}
        {error && <div className="bg-red/08 border border-red/20 rounded-xl px-3 py-2.5 text-[12px] text-red leading-relaxed">{error}</div>}
        <button type="submit" disabled={loading}
          className="bg-blue text-white rounded-xl py-2.5 text-[14px] font-bold transition-all hover:bg-blue/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-1 shadow-glow-blue">
          {loading && <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin-slow"/>}
          {loading?(mode==="login"?"Entrando...":"Creando cuenta..."):mode==="login"?"Entrar a PropFlow":"Crear mi cuenta"}
        </button>
      </form>
      {mode==="signup"&&<p className="text-[11px] text-t3 text-center mt-4 leading-relaxed">Tus datos son privados y solo tú puedes verlos.</p>}
    </Shell>
  )
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-5 relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue/05 rounded-full blur-3xl pointer-events-none"/>
      <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-green/04 rounded-full blur-3xl pointer-events-none"/>
      {/* Grid bg */}
      <div className="absolute inset-0 bg-grid bg-[size:48px_48px] opacity-30 pointer-events-none"/>
      <div className="relative z-10 w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="mono text-[22px] font-bold text-gradient-blue tracking-tight">PropFlow</div>
          <div className="text-[10px] text-t3 tracking-[0.2em] uppercase mt-1">Prop Firm Manager</div>
        </div>
        <div className="glass rounded-2xl p-7 shadow-2xl">{children}</div>
      </div>
    </div>
  )
}

function translateError(msg: string): string {
  if (msg.includes("Invalid login")) return "Email o contraseña incorrectos."
  if (msg.includes("Email not confirmed")) return "Confirma tu email antes de entrar."
  if (msg.includes("already registered")) return "Este email ya tiene una cuenta."
  if (msg.includes("Password should")) return "La contraseña debe tener al menos 6 caracteres."
  return msg
}

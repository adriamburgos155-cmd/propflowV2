"use client"
import { useState } from "react"

interface Props {
  onSignIn: (email: string, password: string) => Promise<void>
  onSignUp: (email: string, password: string) => Promise<void>
}

export default function AuthScreen({ onSignIn, onSignUp }: Props) {
  const [mode, setMode]       = useState<"login"|"signup">("login")
  const [email, setEmail]     = useState("")
  const [password, setPass]   = useState("")
  const [error, setError]     = useState("")
  const [loading, setLoading] = useState(false)
  const [done, setDone]       = useState(false)

  const handle = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      if (mode === "login") { await onSignIn(email, password) }
      else { await onSignUp(email, password); setDone(true) }
    } catch (err: any) { setError(translateError(err.message)) }
    setLoading(false)
  }

  if (done) return (
    <Shell>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>✉️</div>
        <div style={{ fontSize: 17, fontWeight: 700, color: "#fff", marginBottom: 8 }}>Revisa tu correo</div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", lineHeight: 1.6 }}>
          Enviamos un link de confirmación a<br/>
          <span style={{ fontFamily: "monospace", color: "#fff" }}>{email}</span>
        </div>
        <button
          onClick={() => { setDone(false); setMode("login") }}
          style={{ marginTop: 20, fontSize: 13, color: "rgba(255,255,255,0.5)", background: "transparent", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, padding: "8px 18px", cursor: "pointer" }}
        >
          Volver al login
        </button>
      </div>
    </Shell>
  )

  return (
    <Shell>
      {/* Toggle */}
      <div style={{ display: "flex", background: "#111", borderRadius: 10, padding: 3, marginBottom: 24, border: "1px solid rgba(255,255,255,0.08)" }}>
        {(["login", "signup"] as const).map(m => (
          <button
            key={m}
            onClick={() => { setMode(m); setError("") }}
            style={{
              flex: 1, padding: "8px 0", borderRadius: 8,
              fontSize: 13, fontWeight: 600, cursor: "pointer",
              border: "none", transition: "all 0.15s",
              background: mode === m ? "#1a1a1a" : "transparent",
              color: mode === m ? "#fff" : "rgba(255,255,255,0.35)",
              boxShadow: mode === m ? "0 1px 4px rgba(0,0,0,0.5)" : "none",
            }}
          >
            {m === "login" ? "Iniciar sesión" : "Crear cuenta"}
          </button>
        ))}
      </div>

      <form onSubmit={handle} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Email */}
        <div>
          <label style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: 6 }}>
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="tu@email.com"
            required
            style={{
              width: "100%", background: "#111", border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 10, padding: "10px 14px", fontSize: 13,
              color: "#fff", outline: "none", boxSizing: "border-box",
            }}
            onFocus={e => e.target.style.borderColor = "rgba(255,255,255,0.3)"}
            onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
          />
        </div>

        {/* Password */}
        <div>
          <label style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: 6 }}>
            Contraseña
          </label>
          <input
            type="password"
            value={password}
            onChange={e => setPass(e.target.value)}
            placeholder={mode === "signup" ? "Mínimo 6 caracteres" : "••••••••"}
            required
            minLength={6}
            style={{
              width: "100%", background: "#111", border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 10, padding: "10px 14px", fontSize: 13,
              color: "#fff", outline: "none", boxSizing: "border-box",
            }}
            onFocus={e => e.target.style.borderColor = "rgba(255,255,255,0.3)"}
            onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
          />
        </div>

        {/* Error */}
        {error && (
          <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 10, padding: "10px 14px", fontSize: 12, color: "#EF4444", lineHeight: 1.5 }}>
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          style={{
            background: "#fff", color: "#000", border: "none",
            borderRadius: 10, padding: "11px 0", fontSize: 14,
            fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.5 : 1, marginTop: 4,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            transition: "opacity 0.15s",
          }}
          onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.background = "#e5e5e5" }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "#fff" }}
        >
          {loading && (
            <span style={{ width: 14, height: 14, border: "2px solid rgba(0,0,0,0.2)", borderTopColor: "#000", borderRadius: "50%", animation: "spin 0.8s linear infinite", display: "inline-block" }} />
          )}
          {loading
            ? (mode === "login" ? "Entrando..." : "Creando cuenta...")
            : (mode === "login" ? "Entrar a PropFlow" : "Crear mi cuenta")
          }
        </button>
      </form>

      {mode === "signup" && (
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", textAlign: "center", marginTop: 16, lineHeight: 1.6 }}>
          Tus datos son privados y solo tú puedes verlos.
        </p>
      )}
    </Shell>
  )
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", background: "#000", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 360 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontFamily: "monospace", fontSize: 22, fontWeight: 700, color: "#fff", letterSpacing: "-0.5px" }}>
            PropFlow
          </div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", letterSpacing: "0.2em", textTransform: "uppercase", marginTop: 4 }}>
            Prop Firm Manager
          </div>
        </div>

        {/* Card */}
        <div style={{ background: "#0A0A0A", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 28 }}>
          {children}
        </div>
      </div>
    </div>
  )
}

function translateError(msg: string): string {
  if (msg.includes("Invalid login"))       return "Email o contraseña incorrectos."
  if (msg.includes("Email not confirmed")) return "Confirma tu email antes de entrar."
  if (msg.includes("already registered")) return "Este email ya tiene una cuenta."
  if (msg.includes("Password should"))    return "La contraseña debe tener al menos 6 caracteres."
  return msg
}

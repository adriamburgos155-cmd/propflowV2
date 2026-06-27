"use client"
import React from "react"
import { cn } from "@/lib/utils"

// ── Badge ──────────────────────────────────────────────
interface BadgeProps { children: React.ReactNode; variant?: "blue"|"green"|"yellow"|"red"|"ghost"; className?: string }
export function Badge({ children, variant = "blue", className }: BadgeProps) {
  const styles = {
    blue:   "bg-blue/10 text-blue border-blue/20",
    green:  "bg-green/10 text-green border-green/20",
    yellow: "bg-yellow/10 text-yellow border-yellow/20",
    red:    "bg-red/10 text-red border-red/20",
    ghost:  "bg-white/05 text-t2 border-white/07",
  }
  return (
    <span className={cn("inline-flex items-center font-mono text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full border", styles[variant], className)}>
      {children}
    </span>
  )
}

// ── Card ───────────────────────────────────────────────
interface CardProps { children: React.ReactNode; accentColor?: string; className?: string; onClick?: () => void }
export function Card({ children, accentColor, className, onClick }: CardProps) {
  return (
    <div onClick={onClick} className={cn("glass-card rounded-2xl overflow-hidden relative transition-all duration-200", onClick && "cursor-pointer hover:border-white/12", className)}>
      {accentColor && <div className="absolute top-0 left-0 right-0 h-px opacity-80" style={{ background: `linear-gradient(90deg, ${accentColor}, transparent)` }} />}
      {children}
    </div>
  )
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("px-5 py-3.5 border-b border-white/06 flex items-center justify-between", className)}>{children}</div>
}

export function CardTitle({ children }: { children: React.ReactNode }) {
  return <span className="text-[11px] font-bold tracking-widest uppercase text-t2">{children}</span>
}

// ── Modal ──────────────────────────────────────────────
interface ModalProps { open: boolean; onClose: () => void; title: string; children: React.ReactNode; footer?: React.ReactNode }
export function Modal({ open, onClose, title, children, footer }: ModalProps) {
  if (!open) return null
  return (
    <div onClick={(e) => e.target === e.currentTarget && onClose()} className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="glass rounded-2xl w-[460px] max-w-full overflow-hidden animate-slide-up shadow-2xl border-white/10">
        <div className="px-6 py-4 border-b border-white/06 flex items-center justify-between">
          <span className="text-[15px] font-bold text-t1">{title}</span>
          <button onClick={onClose} className="text-t3 hover:text-t1 transition-colors text-lg leading-none w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/05">✕</button>
        </div>
        <div className="px-6 py-5">{children}</div>
        {footer && <div className="px-6 py-4 border-t border-white/06 flex gap-2 justify-end">{footer}</div>}
      </div>
    </div>
  )
}

// ── Form ───────────────────────────────────────────────
export function FormGroup({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("mb-4", className)}>{children}</div>
}
export function FormRow({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-3">{children}</div>
}

interface InputProps { label?: string; hint?: string; type?: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; placeholder?: string; id?: string }
export function Input({ label, hint, type = "text", value, onChange, placeholder, id }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label htmlFor={id} className="text-[11px] font-semibold uppercase tracking-widest text-t3">{label}</label>}
      <input
        id={id} type={type} value={value} onChange={onChange} placeholder={placeholder}
        className="w-full glass-panel rounded-xl px-3 py-2.5 text-[13px] text-t1 placeholder:text-t3 border border-white/06 outline-none transition-all focus:border-blue/35 focus:ring-1 focus:ring-blue/10"
      />
      {hint && <span className="text-[11px] text-t3 leading-relaxed">{hint}</span>}
    </div>
  )
}

interface SelectProps { label?: string; value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; options: { value: string; label: string }[]; id?: string }
export function Select({ label, value, onChange, options, id }: SelectProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label htmlFor={id} className="text-[11px] font-semibold uppercase tracking-widest text-t3">{label}</label>}
      <select
        id={id} value={value} onChange={onChange}
        className="w-full glass-panel rounded-xl px-3 py-2.5 text-[13px] text-t1 border border-white/06 outline-none cursor-pointer transition-all focus:border-blue/35 appearance-none"
        style={{ background: 'rgba(8,13,25,0.7)' }}
      >
        {options.map(o => <option key={o.value} value={o.value} style={{ background: '#0A0F1E' }}>{o.label}</option>)}
      </select>
    </div>
  )
}

// ── Buttons ────────────────────────────────────────────
interface BtnProps { children: React.ReactNode; onClick?: () => void; disabled?: boolean; variant?: "primary"|"ghost"|"danger"|"green"; size?: "sm"|"md"|"lg"; className?: string; type?: "button"|"submit" }
export function Btn({ children, onClick, disabled, variant = "primary", size = "md", className, type = "button" }: BtnProps) {
  const base = "inline-flex items-center justify-center gap-1.5 font-semibold rounded-xl transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed border"
  const sizes = { sm: "text-[11px] px-3 py-1.5", md: "text-[13px] px-4 py-2", lg: "text-[14px] px-5 py-2.5" }
  const variants = {
    primary: "bg-blue text-white border-transparent hover:bg-blue/90 shadow-glow-blue",
    ghost:   "bg-transparent text-t2 border-white/08 hover:bg-white/05 hover:text-t1",
    danger:  "bg-transparent text-red border-red/20 hover:bg-red/08",
    green:   "bg-green/10 text-green border-green/20 hover:bg-green/15",
  }
  return <button type={type} onClick={onClick} disabled={disabled} className={cn(base, sizes[size], variants[variant], className)}>{children}</button>
}

// ── KPI Card ───────────────────────────────────────────
interface KpiCardProps { label: string; value: string; sub: string; accentColor: string; valueColor?: string }
export function KpiCard({ label, value, sub, accentColor, valueColor }: KpiCardProps) {
  return (
    <div className="glass-card rounded-2xl p-5 relative overflow-hidden group transition-all duration-200 hover:border-white/12">
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, ${accentColor}CC, transparent)` }} />
      <div className="absolute top-0 left-0 w-24 h-24 rounded-full opacity-5 blur-2xl" style={{ background: accentColor }} />
      <div className="text-[10px] font-bold tracking-widest uppercase text-t3 mb-3">{label}</div>
      <div className="mono text-[26px] font-bold leading-none mb-2" style={{ color: valueColor || '#F0F4FF' }}>{value}</div>
      <div className="mono text-[11px] text-t3">{sub}</div>
    </div>
  )
}

// ── Toast ──────────────────────────────────────────────
interface ToastProps { message: string; type?: "success"|"error"; visible: boolean }
export function Toast({ message, type = "success", visible }: ToastProps) {
  if (!visible) return null
  const color = type === "error" ? "#EF4444" : "#10B981"
  return (
    <div className="fixed bottom-6 right-6 z-[9999] glass rounded-xl px-4 py-3 flex items-center gap-3 text-[13px] text-t1 animate-slide-up shadow-2xl" style={{ borderColor: `${color}40` }}>
      <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ background: `${color}20`, color }}>{type === "error" ? "✕" : "✓"}</div>
      {message}
    </div>
  )
}

// ── Progress Bar ───────────────────────────────────────
export function ProgressBar({ value, color = "#3B82F6" }: { value: number; color?: string }) {
  return (
    <div className="h-1 bg-white/05 rounded-full overflow-hidden">
      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.min(100, Math.max(0, value))}%`, background: color }} />
    </div>
  )
}

// ── Semaphore ──────────────────────────────────────────
export function Semaphore({ level }: { level: "green"|"yellow"|"red" }) {
  const colors = { green: "#10B981", yellow: "#F59E0B", red: "#EF4444" }
  const c = colors[level]
  return <div className="w-2.5 h-2.5 rounded-full flex-shrink-0 animate-pulse-dot" style={{ background: c, boxShadow: `0 0 8px ${c}` }} />
}

// ── Empty State ────────────────────────────────────────
interface EmptyProps { icon?: string; title: string; subtitle?: string; action?: React.ReactNode }
export function EmptyState({ icon, title, subtitle, action }: EmptyProps) {
  return (
    <div className="text-center py-14 px-6">
      {icon && <div className="text-3xl mb-3 opacity-30">{icon}</div>}
      <div className="text-[14px] font-semibold text-t2 mb-1">{title}</div>
      {subtitle && <div className="text-[12px] text-t3 leading-relaxed max-w-xs mx-auto">{subtitle}</div>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

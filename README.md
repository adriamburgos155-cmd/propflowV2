# PropFlow v2 — Prop Firm Manager

Gestor financiero premium para traders de prop firms de futuros. Dark mode, glassmorphism, TypeScript, Tailwind CSS, Supabase Auth + DB.

---

## Setup local

```bash
npm install
npm run dev
```

Las variables de entorno ya están en `.env.local` — no necesitas configurar nada.

---

## Deploy en Vercel

1. Sube el repo a GitHub (privado)
2. Ve a [vercel.com](https://vercel.com) → New Project → importa el repo
3. En **Environment Variables** agrega estas dos:

```
NEXT_PUBLIC_SUPABASE_URL=https://isiwrihjsggyufwaemgo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlzaXdyaWhqc2dneXVmd2FlbWdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI0Mzg0OTYsImV4cCI6MjA5ODAxNDQ5Nn0.GiJP_pVprk652Xh0P2DUmbrdjKTPL86jDFOYajJ1UH4
```

4. Click **Deploy** — listo en ~30 segundos.

---

## Stack v2

| Parte | Tecnología |
|---|---|
| Framework | Next.js 14 App Router |
| Lenguaje | TypeScript |
| Estilos | Tailwind CSS + glassmorphism |
| UI | shadcn/ui (Button, ChatInput) |
| Gráficos | Recharts (AreaChart) |
| Auth + DB | Supabase (Auth + PostgreSQL + RLS) |
| IA | Claude Sonnet via Anthropic API |
| Deploy | Vercel |

---

## Base de datos (ya configurada)

Supabase project: `isiwrihjsggyufwaemgo`
- Tabla `accounts` — cuentas de prop firms
- Tabla `expenses` — gastos y payouts
- Tabla `ai_config` — configuración del consejero IA
- RLS activo — cada usuario solo ve sus propios datos

---

## Cómo invitar amigos

1. Despliega en Vercel
2. Comparte la URL
3. Cada quien crea su cuenta — sus datos son completamente privados

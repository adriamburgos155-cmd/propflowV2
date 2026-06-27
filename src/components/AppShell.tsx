"use client"
import { useState } from "react"
import { useAuth }  from "@/hooks/useAuth"
import { useStore } from "@/hooks/useStore"
import { useToast } from "@/hooks/useToast"
import AuthScreen    from "@/components/AuthScreen"
import Sidebar       from "@/components/Sidebar"
import NegocioView   from "@/components/NegocioView"
import CuentasView   from "@/components/CuentasView"
import ConsejeroView from "@/components/ConsejeroView"
import AccountModal  from "@/components/modals/AccountModal"
import ExpenseModal  from "@/components/modals/ExpenseModal"
import PayoutModal   from "@/components/modals/PayoutModal"
import AiConfigModal from "@/components/modals/AiConfigModal"
import { Toast } from "@/components/ui"

const TITLES: Record<string,string> = { negocio:"Mi Negocio", cuentas:"Mis Cuentas", consejero:"Consejero IA" }

export default function AppShell() {
  const { user, loading: authLoading, signIn, signUp, signOut } = useAuth()
  const { state, loaded, addAccount, updateAccount, deleteAccount, addExpense, deleteExpense, saveAiConfig } = useStore(user?.id)
  const { toast, showToast } = useToast()
  const [view, setView] = useState("negocio")
  const [editing, setEditing]     = useState<any>(null)
  const [payoutTgt, setPayoutTgt] = useState<any>(null)
  const [modals, setModals]       = useState({account:false,expense:false,payout:false,aiConfig:false})
  const open  = (id:string) => setModals(m=>({...m,[id]:true}))
  const close = (id:string) => setModals(m=>({...m,[id]:false}))

  if (authLoading) return <Loader text="Cargando..."/>
  if (!user)       return <AuthScreen onSignIn={signIn} onSignUp={signUp}/>
  if (!loaded)     return <Loader text="Cargando tu portafolio..."/>

  const handleSaveAccount = async (acc: any, isNew: boolean) => {
    try {
      if (isNew) {
        await addAccount(acc)
        if (acc.cost > 0) await addExpense({type:"fee",firma:acc.firma,desc:`Challenge ${acc.plan} $${(acc.size/1000).toFixed(0)}K`,amount:acc.cost,date:new Date().toISOString().split("T")[0]})
        showToast("Cuenta agregada")
      } else { await updateAccount(acc); showToast("Cuenta actualizada") }
    } catch { showToast("Error al guardar","error") }
    setEditing(null)
  }

  return (
    <>
      <div className="flex min-h-screen bg-background relative">
        {/* Ambient background glow */}
        <div className="fixed top-0 left-1/3 w-96 h-96 bg-blue/03 rounded-full blur-3xl pointer-events-none -z-0"/>
        <div className="fixed bottom-1/4 right-1/4 w-64 h-64 bg-green/02 rounded-full blur-3xl pointer-events-none -z-0"/>
        <div className="fixed inset-0 bg-grid bg-[size:48px_48px] opacity-[0.18] pointer-events-none -z-0"/>

        <Sidebar view={view} setView={setView} state={state} user={user} onSignOut={signOut}/>

        <div className="ml-[220px] flex-1 flex flex-col min-w-0 relative z-10">
          {/* Topbar */}
          <header className="h-14 border-b border-white/06 glass-panel flex items-center justify-between px-7 sticky top-0 z-40">
            <div className="text-[11px] font-bold uppercase tracking-widest text-t3">{TITLES[view]}</div>
            <div className="flex items-center gap-2.5">
              <div className="mono text-[11px] text-t3 glass-panel border border-white/05 rounded-lg px-3 py-1.5">
                {new Date().toLocaleDateString("es-DO",{weekday:"short",day:"2-digit",month:"short",year:"numeric"})}
              </div>
              <button onClick={()=>{setEditing(null);open("account")}}
                className="bg-blue text-white text-[12px] font-bold rounded-xl px-3.5 py-1.5 hover:bg-blue/90 transition-all shadow-glow-blue">
                + Cuenta
              </button>
            </div>
          </header>

          <main className="p-7 flex-1 overflow-auto">
            {view==="negocio"   && <NegocioView state={state}/>}
            {view==="cuentas"   && <CuentasView state={state} onAdd={()=>{setEditing(null);open("account")}} onEdit={(a:any)=>{setEditing(a);open("account")}} onDelete={async(id:number)=>{if(!confirm("¿Eliminar esta cuenta?"))return;try{await deleteAccount(id);showToast("Cuenta eliminada")}catch{showToast("Error","error")}}} onPayout={(a:any)=>{setPayoutTgt(a);open("payout")}}/>}
            {view==="consejero" && <ConsejeroView state={state} onOpenConfig={()=>open("aiConfig")}/>}
          </main>
        </div>
      </div>

      <AccountModal open={modals.account} onClose={()=>{close("account");setEditing(null)}} onSave={handleSaveAccount} editAccount={editing}/>
      <ExpenseModal open={modals.expense} onClose={()=>close("expense")} onSave={async(e:any)=>{try{await addExpense(e);showToast(e.type==="fee"?"Gasto registrado":"Payout registrado")}catch{showToast("Error","error")}}}/>
      <PayoutModal  open={modals.payout}  onClose={()=>{close("payout");setPayoutTgt(null)}} onSave={async(e:any)=>{try{await addExpense(e);showToast(`Payout $${e.amount.toLocaleString()} registrado`)}catch{showToast("Error","error")}}} account={payoutTgt}/>
      <AiConfigModal open={modals.aiConfig} onClose={()=>close("aiConfig")} onSave={async(c:any)=>{try{await saveAiConfig(c);showToast("Configuración guardada")}catch{showToast("Error","error")}}} config={state.aiConfig}/>

      <Toast message={toast.message} type={toast.type} visible={toast.visible}/>
    </>
  )
}

function Loader({text}:{text:string}) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="mono text-[20px] font-bold text-gradient-blue mb-3">PropFlow</div>
        <div className="flex items-center gap-2 text-[12px] text-t3 justify-center">
          <div className="w-3 h-3 border-2 border-white/10 border-t-blue rounded-full" style={{animation:"spin 0.8s linear infinite"}}/>
          {text}
        </div>
      </div>
    </div>
  )
}

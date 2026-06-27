'use client'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase'

const DEFAULT_STATE = {
  accounts:  [],
  expenses:  [],
  aiConfig:  { persona: 'balanced', context: '', meta: 0 },
}

export function useStore(userId) {
  const [state, setState]   = useState(DEFAULT_STATE)
  const [loaded, setLoaded] = useState(false)
  const supabase = createClient()

  // ── LOAD all user data ─────────────────────────────────
  const loadData = useCallback(async () => {
    if (!userId) return
    setLoaded(false)

    const [accRes, expRes, cfgRes] = await Promise.all([
      supabase.from('accounts').select('*').eq('user_id', userId).order('created_at', { ascending: true }),
      supabase.from('expenses').select('*').eq('user_id', userId).order('date', { ascending: false }),
      supabase.from('ai_config').select('*').eq('user_id', userId).maybeSingle(),
    ])

    const accounts = (accRes.data || []).map(dbToAccount)
    const expenses = (expRes.data || []).map(dbToExpense)
    const aiConfig = cfgRes.data
      ? { persona: cfgRes.data.persona, context: cfgRes.data.context, meta: cfgRes.data.meta }
      : DEFAULT_STATE.aiConfig

    setState({ accounts, expenses, aiConfig })
    setLoaded(true)
  }, [userId])

  useEffect(() => { loadData() }, [loadData])

  // ── ACCOUNTS ───────────────────────────────────────────
  const addAccount = useCallback(async (acc) => {
    const { data, error } = await supabase
      .from('accounts')
      .insert(accountToDB(acc, userId))
      .select()
      .single()
    if (error) throw error
    const saved = dbToAccount(data)
    setState(s => ({ ...s, accounts: [...s.accounts, saved] }))
    return saved
  }, [userId])

  const updateAccount = useCallback(async (acc) => {
    const { error } = await supabase
      .from('accounts')
      .update(accountToDB(acc, userId))
      .eq('id', acc.id)
      .eq('user_id', userId)
    if (error) throw error
    setState(s => ({ ...s, accounts: s.accounts.map(a => a.id === acc.id ? acc : a) }))
  }, [userId])

  const deleteAccount = useCallback(async (id) => {
    const { error } = await supabase
      .from('accounts')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)
    if (error) throw error
    setState(s => ({ ...s, accounts: s.accounts.filter(a => a.id !== id) }))
  }, [userId])

  // ── EXPENSES ───────────────────────────────────────────
  const addExpense = useCallback(async (exp) => {
    const { data, error } = await supabase
      .from('expenses')
      .insert(expenseToDB(exp, userId))
      .select()
      .single()
    if (error) throw error
    const saved = dbToExpense(data)
    setState(s => ({ ...s, expenses: [saved, ...s.expenses] }))
    return saved
  }, [userId])

  const deleteExpense = useCallback(async (id) => {
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)
    if (error) throw error
    setState(s => ({ ...s, expenses: s.expenses.filter(e => e.id !== id) }))
  }, [userId])

  // ── AI CONFIG ──────────────────────────────────────────
  const saveAiConfig = useCallback(async (config) => {
    const { error } = await supabase
      .from('ai_config')
      .upsert({ user_id: userId, ...config }, { onConflict: 'user_id' })
    if (error) throw error
    setState(s => ({ ...s, aiConfig: config }))
  }, [userId])

  return {
    state, loaded,
    addAccount, updateAccount, deleteAccount,
    addExpense, deleteExpense,
    saveAiConfig,
    reload: loadData,
  }
}

// ── DB mappers ─────────────────────────────────────────────
function accountToDB(a, userId) {
  return {
    user_id:     userId,
    firma:       a.firma,
    plan:        a.plan,
    size:        a.size,
    status:      a.status,
    balance:     a.balance,
    cost:        a.cost,
    consistency: a.consistency || 0,
    avg_payout:  a.avgPayout || 400,
    notes:       a.notes || '',
  }
}

function dbToAccount(row) {
  return {
    id:          row.id,
    firma:       row.firma,
    plan:        row.plan,
    size:        row.size,
    status:      row.status,
    balance:     parseFloat(row.balance),
    cost:        parseFloat(row.cost),
    consistency: parseFloat(row.consistency || 0),
    avgPayout:   parseFloat(row.avg_payout || 400),
    notes:       row.notes || '',
    createdAt:   row.created_at,
  }
}

function expenseToDB(e, userId) {
  return {
    user_id:     userId,
    type:        e.type,
    firma:       e.firma,
    description: e.desc || e.description || '',
    amount:      e.amount,
    date:        e.date,
  }
}

function dbToExpense(row) {
  return {
    id:     row.id,
    type:   row.type,
    firma:  row.firma,
    desc:   row.description,
    amount: parseFloat(row.amount),
    date:   row.date,
  }
}

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  }
})

// Helper: ottieni user_id corrente
async function getUserId() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Non autenticato')
  return user.id
}

// ─── CANTINA ──────────────────────────────────────────────────────────────────

export async function getBottiglie() {
  const { data, error } = await supabase.from('cantina').select('*').order('id', { ascending: true })
  if (error) throw error
  return data
}

export async function addBottiglia(b) {
  const user_id = await getUserId()
  const { data, error } = await supabase.from('cantina').insert([{ ...b, user_id }]).select().single()
  if (error) throw error
  return data
}

export async function updateBottiglia(id, changes) {
  const { id: _id, ...rest } = changes
  const { data, error } = await supabase.from('cantina').update(rest).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function deleteBottiglia(id) {
  const { error } = await supabase.from('cantina').delete().eq('id', id)
  if (error) throw error
}

// ─── SCHEDE ASPI ──────────────────────────────────────────────────────────────

export async function getSchede() {
  const { data, error } = await supabase.from('archivio').select('*').order('voto', { ascending: false }).order('id', { ascending: false })
  if (error) throw error
  return data
}

export async function addScheda(s) {
  const user_id = await getUserId()
  const { data, error } = await supabase.from('archivio').insert([{ ...s, user_id }]).select().single()
  if (error) throw error
  return data
}

export async function deleteScheda(id) {
  const { error } = await supabase.from('archivio').delete().eq('id', id)
  if (error) throw error
}

export async function updateScheda(id, changes) {
  const { id: _id, ...rest } = changes
  const { data, error } = await supabase.from('archivio').update(rest).eq('id', id).select().single()
  if (error) throw error
  return data
}

// ─── ANALISI CANTINA ──────────────────────────────────────────────────────────

export async function getAnalisiCantina() {
  const { data, error } = await supabase
    .from('analisi_cantina').select('*')
    .order('id', { ascending: false }).limit(1).maybeSingle()
  if (error) throw error
  return data
}

export async function saveAnalisiCantina(contenuto, cantina_hash) {
  const user_id = await getUserId()
  await supabase.from('analisi_cantina').delete().neq('id', 0)
  const { data, error } = await supabase
    .from('analisi_cantina').insert([{ contenuto, cantina_hash, user_id }]).select().single()
  if (error) throw error
  return data
}

export async function deleteAnalisiCantina() {
  await supabase.from('analisi_cantina').delete().neq('id', 0)
}

// ─── PROFILO UTENTE ───────────────────────────────────────────────────────────

export async function getProfilo() {
  const user_id = await getUserId()
  const { data } = await supabase.from('profili').select('*').eq('id', user_id).maybeSingle()
  return data
}

export async function aggiornaLastSeen() {
  const user_id = await getUserId()
  await supabase.from('profili').update({ last_seen: new Date().toISOString() }).eq('id', user_id)
}

// ─── SEED (solo per sviluppo) ─────────────────────────────────────────────────

export async function seedIfEmpty() {
  const { count } = await supabase.from('cantina').select('*', { count: 'exact', head: true })
  if (count === 0) {
    const user_id = await getUserId().catch(() => null)
    if (!user_id) return
    const DATI = [
      { nome: 'Barolo Bricco Rocche', cantina: 'Ceretto', tipologia: 'Rosso', paese: 'Italia', regione: 'Piemonte', vitigno: 'Nebbiolo', anno: 2016, valutazione: 5, prezzo: 4, invecchiamento: 20, temp: '16-18°C', note: 'Grande annata', quantita: 3, user_id },
      { nome: 'Vermentino di Gallura', cantina: 'Capichera', tipologia: 'Bianco', paese: 'Italia', regione: 'Sardegna', vitigno: 'Vermentino', anno: 2022, valutazione: 4, prezzo: 2, invecchiamento: 3, temp: '10-12°C', note: 'Fresco e aromatico', quantita: 6, user_id },
    ]
    await supabase.from('cantina').insert(DATI)
  }
}

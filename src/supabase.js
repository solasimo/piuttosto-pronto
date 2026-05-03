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
  // Recupera gruppo_id se esiste
  const { data: membro } = await supabase.from('gruppi_membri').select('gruppo_id').eq('user_id', user_id).maybeSingle()
  const gruppo_id = membro?.gruppo_id || null
  const { data, error } = await supabase.from('cantina').insert([{ ...b, user_id, gruppo_id }]).select().single()
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
  const { data: membro } = await supabase.from('gruppi_membri').select('gruppo_id').eq('user_id', user_id).maybeSingle()
  const gruppo_id = membro?.gruppo_id || null
  const { data, error } = await supabase.from('archivio').insert([{ ...s, user_id, gruppo_id }]).select().single()
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

// ─── GRUPPI ───────────────────────────────────────────────────────────────────

async function getToken() {
  const { data: { session } } = await supabase.auth.getSession()
  return session?.access_token
}

async function gruppiCall(action, payload = {}) {
  const token = await getToken()
  const res = await fetch('/api/gruppi', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ action, payload }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error)
  return data
}

export const getGruppo = () => gruppiCall('get_gruppo')
export const creaGruppo = () => gruppiCall('crea_gruppo')
export const creaInvitoGruppo = () => gruppiCall('crea_invito_gruppo')
export const uniscitiGruppo = (codice) => gruppiCall('unisciti', { codice })
export const lasciаGruppo = () => gruppiCall('lascia_gruppo')

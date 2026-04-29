import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// ─── CANTINA ──────────────────────────────────────────────────────────────────

export async function getBottiglie() {
  const { data, error } = await supabase.from('cantina').select('*').order('id', { ascending: true })
  if (error) throw error
  return data
}

export async function addBottiglia(b) {
  const { data, error } = await supabase.from('cantina').insert([b]).select().single()
  if (error) throw error
  return data
}

export async function updateBottiglia(id, changes) {
  const { data, error } = await supabase.from('cantina').update(changes).eq('id', id).select().single()
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
  const { data, error } = await supabase.from('archivio').insert([s]).select().single()
  if (error) throw error
  return data
}

// ─── SEED ─────────────────────────────────────────────────────────────────────

const DATI_INIZIALI = [
  { nome: 'Barolo Bricco Rocche', cantina: 'Ceretto', tipologia: 'Rosso', paese: 'Italia', regione: 'Piemonte', vitigno: 'Nebbiolo', anno: 2016, valutazione: 5, prezzo: 4, invecchiamento: 20, temp: '16-18°C', note: 'Grande annata', quantita: 3 },
  { nome: 'Brunello di Montalcino', cantina: 'Biondi Santi', tipologia: 'Rosso', paese: 'Italia', regione: 'Toscana', vitigno: 'Sangiovese grosso', anno: 2017, valutazione: 4, prezzo: 5, invecchiamento: 25, temp: '16-18°C', note: 'Elegante e longevo', quantita: 2 },
  { nome: 'Vermentino di Gallura', cantina: 'Capichera', tipologia: 'Bianco', paese: 'Italia', regione: 'Sardegna', vitigno: 'Vermentino', anno: 2022, valutazione: 4, prezzo: 2, invecchiamento: 3, temp: '10-12°C', note: 'Fresco e aromatico', quantita: 6 },
  { nome: 'Franciacorta Satèn', cantina: 'Bellavista', tipologia: 'Bollicine', paese: 'Italia', regione: 'Lombardia', vitigno: 'Chardonnay', anno: 2020, valutazione: 4, prezzo: 3, invecchiamento: 5, temp: '6-8°C', note: 'Perlage finissimo', quantita: 4 },
  { nome: 'Amarone della Valpolicella', cantina: 'Allegrini', tipologia: 'Rosso', paese: 'Italia', regione: 'Veneto', vitigno: 'Corvina', anno: 2015, valutazione: 5, prezzo: 4, invecchiamento: 20, temp: '16-18°C', note: 'Classico e potente', quantita: 1 },
  { nome: 'Etna Bianco', cantina: 'Benanti', tipologia: 'Bianco', paese: 'Italia', regione: 'Sicilia', vitigno: 'Carricante', anno: 2021, valutazione: 3, prezzo: 2, invecchiamento: 6, temp: '10-12°C', note: 'Vulcanico, minerale', quantita: 5 },
  { nome: 'Prosecco Superiore DOCG', cantina: 'Bisol', tipologia: 'Bollicine', paese: 'Italia', regione: 'Veneto', vitigno: 'Glera', anno: 2023, valutazione: 3, prezzo: 1, invecchiamento: 2, temp: '6-8°C', note: 'Aperitivo perfetto', quantita: 8 },
  { nome: 'Chianti Classico Gran Selezione', cantina: 'Fèlsina', tipologia: 'Rosso', paese: 'Italia', regione: 'Toscana', vitigno: 'Sangiovese', anno: 2018, valutazione: 4, prezzo: 3, invecchiamento: 15, temp: '16-18°C', note: 'Strutturato', quantita: 2 },
]

export async function seedIfEmpty() {
  const { count } = await supabase.from('cantina').select('*', { count: 'exact', head: true })
  if (count === 0) await supabase.from('cantina').insert(DATI_INIZIALI)
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
    .from('analisi_cantina')
    .select('*')
    .order('id', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (error) throw error
  return data
}

export async function saveAnalisiCantina(contenuto, cantina_hash) {
  // Prima cancella quella vecchia
  await supabase.from('analisi_cantina').delete().neq('id', 0)
  const { data, error } = await supabase
    .from('analisi_cantina')
    .insert([{ contenuto, cantina_hash }])
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteAnalisiCantina() {
  await supabase.from('analisi_cantina').delete().neq('id', 0)
}

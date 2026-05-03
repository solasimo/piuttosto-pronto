import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { codice, user_id } = req.body
  if (!codice) return res.status(400).json({ error: 'Codice mancante' })

  const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  )

  const { data: invito, error } = await supabase
    .from('inviti').select('*')
    .eq('codice', codice.trim().toUpperCase())
    .maybeSingle()

  if (error || !invito) return res.status(404).json({ error: 'Codice non valido' })
  if (invito.usato_da) return res.status(400).json({ error: 'Codice già utilizzato' })
  if (new Date(invito.scade_at) < new Date()) return res.status(400).json({ error: 'Codice scaduto' })

  // Se viene passato user_id, marca subito come usato
  if (user_id) {
    const { error: updErr } = await supabase
      .from('inviti')
      .update({ usato_da: user_id, usato_at: new Date().toISOString() })
      .eq('id', invito.id)
    if (updErr) return res.status(500).json({ error: 'Errore aggiornamento invito: ' + updErr.message })
    // Crea profilo utente
await supabase.from('profili').insert({ 
  id: user_id, 
  email: req.body.email || '', 
  nome: req.body.nome || '',
  cognome: req.body.cognome || '',
  is_active: true 
})
return res.status(200).json({ valido: true, marcato: true })
  }

  return res.status(200).json({ valido: true, id: invito.id })
}

import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { codice } = req.body
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
// Marca l'invito come usato — solo dopo registrazione riuscita
// Questa funzione viene richiamata separatamente dopo signUp
  return res.status(200).json({ valido: true, id: invito.id })
}

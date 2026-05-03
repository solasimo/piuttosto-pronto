import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  // Verifica che chi chiama sia autenticato e admin
  const authHeader = req.headers.authorization
  if (!authHeader) return res.status(401).json({ error: 'Non autorizzato' })

  const supabaseAdmin = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  )

  // Verifica token utente
  const token = authHeader.replace('Bearer ', '')
  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
  if (authError || !user) return res.status(401).json({ error: 'Token non valido' })

  // Verifica che sia admin
  const { data: profilo } = await supabaseAdmin.from('profili').select('is_admin').eq('id', user.id).single()
  if (!profilo?.is_admin) return res.status(403).json({ error: 'Non sei admin' })

  const { action, payload } = req.body

  try {
    switch (action) {

      case 'get_utenti': {
        const { data } = await supabaseAdmin.from('profili').select('*').order('created_at', { ascending: false })
        return res.json({ data })
      }

      case 'get_inviti': {
        const { data } = await supabaseAdmin.from('inviti').select('*').order('created_at', { ascending: false })
        return res.json({ data })
      }

      case 'crea_invito': {
        const codice = nanoid(8)
        const scade_at = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        const { data } = await supabaseAdmin.from('inviti').insert({ codice, creato_da: user.id, scade_at }).select().single()
        return res.json({ data })
      }

      case 'revoca_invito': {
        await supabaseAdmin.from('inviti').delete().eq('id', payload.id)
        return res.json({ ok: true })
      }

      case 'toggle_attivo': {
        await supabaseAdmin.from('profili').update({ is_active: payload.is_active }).eq('id', payload.id)
        return res.json({ ok: true })
      }

      case 'elimina_utente': {
        await supabaseAdmin.from('profili').delete().eq('id', payload.id)
        return res.json({ ok: true })
      }

      default:
        return res.status(400).json({ error: 'Azione non valida' })
    }
  } catch (e) {
    return res.status(500).json({ error: e.message })
  }
}

function nanoid(len = 8) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

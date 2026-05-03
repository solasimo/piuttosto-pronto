import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const authHeader = req.headers.authorization
  if (!authHeader) return res.status(401).json({ error: 'Non autorizzato' })

  const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  )

  const token = authHeader.replace('Bearer ', '')
  const { data: { user }, error: authError } = await supabase.auth.getUser(token)
  if (authError || !user) return res.status(401).json({ error: 'Token non valido' })

  const { action, payload } = req.body

  try {
    switch (action) {

      case 'get_gruppo': {
        const { data: membro } = await supabase
          .from('gruppi_membri').select('gruppo_id, gruppi(id, nome)')
          .eq('user_id', user.id).maybeSingle()
        if (!membro) return res.json({ gruppo: null })
        const { data: membri } = await supabase
          .from('gruppi_membri')
          .select('user_id, ruolo, joined_at, profili(nome, cognome, email)')
          .eq('gruppo_id', membro.gruppo_id)
        return res.json({ gruppo: membro.gruppi, membri })
      }

      case 'crea_invito_gruppo': {
        const { data: membro } = await supabase
          .from('gruppi_membri').select('gruppo_id')
          .eq('user_id', user.id).maybeSingle()
        if (!membro) return res.status(400).json({ error: 'Non sei in nessun gruppo' })
        const codice = 'G' + nanoid(7)
        const scade_at = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        await supabase.from('inviti').insert({ codice, creato_da: user.id, scade_at, gruppo_id: membro.gruppo_id })
        return res.json({ codice })
      }

      case 'unisciti': {
        const { codice } = payload
        if (!codice) return res.status(400).json({ error: 'Codice mancante' })
        const { data: invito } = await supabase
          .from('inviti').select('*')
          .eq('codice', codice.trim().toUpperCase())
          .is('usato_da', null)
          .gt('scade_at', new Date().toISOString())
          .not('gruppo_id', 'is', null)
          .maybeSingle()
        if (!invito) return res.status(400).json({ error: 'Codice non valido o scaduto' })
        const { data: membroEsistente } = await supabase
          .from('gruppi_membri').select('gruppo_id').eq('user_id', user.id).maybeSingle()
        if (membroEsistente) return res.status(400).json({ error: 'Sei già in un gruppo' })
        const gruppo_id = invito.gruppo_id
        await supabase.from('cantina').update({ gruppo_id }).eq('user_id', user.id)
        await supabase.from('archivio').update({ gruppo_id }).eq('user_id', user.id)
        await supabase.from('gruppi_membri').insert({ gruppo_id, user_id: user.id })
        await aggiornaGruppoNome(supabase, gruppo_id)
        await supabase.from('inviti').update({ usato_da: user.id, usato_at: new Date().toISOString() }).eq('id', invito.id)
        return res.json({ ok: true, gruppo_id })
      }

      case 'lascia_gruppo': {
        const { data: membro } = await supabase
          .from('gruppi_membri').select('gruppo_id')
          .eq('user_id', user.id).maybeSingle()
        if (!membro) return res.status(400).json({ error: 'Non sei in nessun gruppo' })
        await supabase.from('gruppi_membri').delete().eq('user_id', user.id)
        await aggiornaGruppoNome(supabase, membro.gruppo_id)
        return res.json({ ok: true })
      }

      default:
        return res.status(400).json({ error: 'Azione non valida' })
    }
  } catch(e) {
    console.error(e)
    return res.status(500).json({ error: e.message })
  }
}

async function aggiornaGruppoNome(supabase, gruppo_id) {
  const { data: membri } = await supabase
    .from('gruppi_membri').select('profili(nome)').eq('gruppo_id', gruppo_id)
  const nomi = (membri || []).map(m => m.profili?.nome).filter(Boolean)
  const nome = nomi.length >= 2
    ? `Cantina di ${nomi.slice(0, -1).join(', ')} e ${nomi[nomi.length - 1]}`
    : nomi.length === 1 ? `Cantina di ${nomi[0]}` : 'Cantina condivisa'
  await supabase.from('gruppi').update({ nome }).eq('id', gruppo_id)
}

function nanoid(len = 7) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

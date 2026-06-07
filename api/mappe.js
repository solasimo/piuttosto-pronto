import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const auth = req.headers.authorization
  if (!auth) return res.status(401).json({ error: 'Non autorizzato' })

  const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  )

  const token = auth.replace('Bearer ', '')
  const { data: { user }, error: authErr } = await supabase.auth.getUser(token)
  if (authErr || !user) return res.status(401).json({ error: 'Token non valido' })

  const { action, payload = {} } = req.body

  try {
    switch (action) {

      // Carica tutte le regioni di un paese
      case 'get_regioni': {
        const { paese } = payload
        const { data, error } = await supabase
          .from('learning_mappe')
          .select('*')
          .eq('paese', paese || 'italia')
          .order('ordine')
        if (error) return res.status(500).json({ error: error.message })
        return res.json({ regioni: data || [] })
      }

      // Carica una singola regione con tutti i dettagli
      case 'get_regione': {
        const { paese, regione_id } = payload
        const { data, error } = await supabase
          .from('learning_mappe')
          .select('*')
          .eq('paese', paese || 'italia')
          .eq('regione_id', regione_id)
          .single()
        if (error) return res.status(500).json({ error: error.message })
        return res.json({ regione: data })
      }

      // Salva progressi atlante utente
      case 'salva_progresso_mappa': {
        const { paese, regione_id, livello_studio } = payload
        // livello_studio: 0=non studiato, 1=in corso, 2=studiato
        const { error } = await supabase
          .from('learning_progressi')
          .upsert({
            user_id: user.id,
            livello: 2,
            categoria: 'atlante',
            argomento: `${paese}_${regione_id}`,
            n_risposte: livello_studio > 0 ? 1 : 0,
            n_corrette: livello_studio === 2 ? 1 : 0,
            pct_corretto: livello_studio === 2 ? 100 : livello_studio === 1 ? 50 : 0,
            ultima_sessione: new Date().toISOString(),
          }, { onConflict: 'user_id,livello,categoria,argomento' })
        if (error) return res.status(500).json({ error: error.message })
        return res.json({ ok: true })
      }

      // Carica progressi atlante utente
      case 'get_progressi_mappa': {
        const { paese } = payload
        const { data, error } = await supabase
          .from('learning_progressi')
          .select('argomento, pct_corretto')
          .eq('user_id', user.id)
          .eq('livello', 2)
          .eq('categoria', 'atlante')
          .like('argomento', `${paese || 'italia'}_%`)
        if (error) return res.status(500).json({ error: error.message })
        // Trasforma in mappa regione_id -> livello
        const progressi = {}
        for (const row of data || []) {
          const reg_id = row.argomento.replace(`${paese || 'italia'}_`, '')
          progressi[reg_id] = row.pct_corretto === 100 ? 2 : row.pct_corretto > 0 ? 1 : 0
        }
        return res.json({ progressi })
      }

      default:
        return res.status(400).json({ error: `Azione sconosciuta: ${action}` })
    }
  } catch (e) {
    console.error('mappe error:', e)
    return res.status(500).json({ error: e.message })
  }
}

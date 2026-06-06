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

  const { action, payload = {} } = req.body

  try {
    switch (action) {

      // Carica KB e genera domande
      case 'genera_domande': {
        const { livello, categoria, lingua } = payload

        let query = supabase.from('learning_kb').select('argomento, contenuto').eq('attivo', true)
        if (livello) query = query.eq('livello', livello)
        if (categoria) query = query.eq('categoria', categoria)
        const { data: kb, error: kbErr } = await query.order('ordine')
        if (kbErr) return res.status(500).json({ error: kbErr.message })
        if (!kb?.length) return res.status(404).json({ error: 'Nessun contenuto trovato per questa selezione' })

        const kbText = kb.map(r => `=== ${r.argomento} ===\n${r.contenuto}`).join('\n\n')
        const linguaLabel = lingua === 'en' ? 'English' : lingua === 'fr' ? 'français' : 'italiano'

        const system = `Sei un generatore di domande d'esame per il corso di sommelier ASSP.
REGOLA ASSOLUTA: usa ESCLUSIVAMENTE le informazioni della KNOWLEDGE BASE fornita. Non aggiungere mai nozioni esterne.
Genera esattamente 10 domande in ${linguaLabel} calibrate sullo stile degli esami ASSP allegati: precise, tecniche, con trabocchetti realistici.
Distribuzione: 4 vero_falso + 3 multipla + 3 aperta.
Rispondi SOLO con JSON valido, zero testo fuori dal JSON:
{"domande":[{"id":1,"tipo":"vero_falso","argomento":"nome","domanda":"testo","risposta_giusta":"V","spiegazione":"spiegazione dalla KB"},{"id":2,"tipo":"multipla","argomento":"nome","domanda":"testo","opzioni":{"A":"","B":"","C":"","D":""},"risposta_giusta":"A","spiegazione":"spiegazione dalla KB"},{"id":3,"tipo":"aperta","argomento":"nome","domanda":"testo","risposta_modello":"risposta completa","punti_chiave":["punto1","punto2"]}]}`

        const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: 'claude-sonnet-4-6',
            max_tokens: 4000,
            system,
            messages: [{ role: 'user', content: `KNOWLEDGE BASE:\n\n${kbText}\n\nCategoria: ${categoria || 'tutto'}. Genera 10 domande.` }],
          }),
        })

        const aiData = await anthropicRes.json()
        if (!anthropicRes.ok) return res.status(500).json({ error: aiData.error?.message || 'Errore AI' })

        const raw = aiData.content[0].text.replace(/```json|```/g, '').trim()
        const parsed = JSON.parse(raw)

        const { data: sessione, error: sessErr } = await supabase
          .from('learning_sessioni')
          .insert({ user_id: user.id, livello: livello || null, categoria: categoria || null, n_domande: parsed.domande.length })
          .select().single()
        if (sessErr) return res.status(500).json({ error: sessErr.message })

        return res.json({ sessione_id: sessione.id, domande: parsed.domande })
      }

      // Correggi risposta aperta
      case 'correggi_aperta': {
        const { domanda, risposta_modello, punti_chiave, risposta_utente, lingua } = payload
        const linguaLabel = lingua === 'en' ? 'English' : lingua === 'fr' ? 'français' : 'italiano'

        const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 600,
            messages: [{ role: 'user', content: `Sei un esaminatore ASSP. Valuta questa risposta in ${linguaLabel}.
Domanda: ${domanda}
Risposta modello: ${risposta_modello}
Punti chiave: ${(punti_chiave || []).join(', ')}
Risposta studente: ${risposta_utente}
Rispondi SOLO con JSON: {"corretta":true/false,"punteggio":0-3,"feedback":"max 2 frasi","punti_mancati":["..."]}` }],
          }),
        })

        const aiData = await anthropicRes.json()
        if (!anthropicRes.ok) return res.status(500).json({ error: 'Errore correzione' })
        const raw = aiData.content[0].text.replace(/```json|```/g, '').trim()
        return res.json(JSON.parse(raw))
      }

      // Salva risposta
      case 'salva_risposta': {
        const { sessione_id, argomento, tipo_domanda, domanda, risposta_utente, risposta_giusta, corretta, spiegazione, tempo_ms } = payload

        await supabase.from('learning_risposte').insert({
          sessione_id, user_id: user.id, argomento, tipo_domanda,
          domanda, risposta_utente, risposta_giusta, corretta, spiegazione, tempo_ms,
        })

        // Upsert progressi
        const { data: prog } = await supabase.from('learning_progressi')
          .select().eq('user_id', user.id).eq('argomento', argomento).maybeSingle()
        const n_risposte = (prog?.n_risposte || 0) + 1
        const n_corrette = (prog?.n_corrette || 0) + (corretta ? 1 : 0)

        const { data: sess } = await supabase.from('learning_sessioni').select('livello,categoria').eq('id', sessione_id).single()

        await supabase.from('learning_progressi').upsert({
          user_id: user.id, livello: sess?.livello || 1, categoria: sess?.categoria || 'vino',
          argomento, n_risposte, n_corrette, pct_corretto: Math.round((n_corrette / n_risposte) * 100),
          ultima_sessione: new Date().toISOString(),
        }, { onConflict: 'user_id,livello,categoria,argomento' })

        return res.json({ ok: true })
      }

      // Chiudi sessione
      case 'chiudi_sessione': {
        const { sessione_id, n_corrette, durata_sec } = payload
        const { data: sess } = await supabase.from('learning_sessioni').select('n_domande').eq('id', sessione_id).single()
        const punteggio = Math.round(((n_corrette || 0) / (sess?.n_domande || 10)) * 100)
        await supabase.from('learning_sessioni').update({ n_corrette, punteggio, durata_sec, completata: true }).eq('id', sessione_id)
        return res.json({ punteggio })
      }

      // Progressi
      case 'get_progressi': {
        const { data, error } = await supabase.from('learning_progressi')
          .select('*').eq('user_id', user.id).order('pct_corretto', { ascending: true })
        if (error) return res.status(500).json({ error: error.message })
        return res.json({ progressi: data || [] })
      }

      default:
        return res.status(400).json({ error: `Azione sconosciuta: ${action}` })
    }
  } catch (e) {
    console.error('learning error:', e)
    return res.status(500).json({ error: e.message })
  }
}

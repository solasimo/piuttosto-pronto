import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const auth = req.headers.authorization?.replace('Bearer ', '')
  if (!auth) return res.status(401).json({ error: 'Non autorizzato' })

  const { data: { user }, error: authErr } = await supabase.auth.getUser(auth)
  if (authErr || !user) return res.status(401).json({ error: 'Non autorizzato' })

  const { action, payload = {} } = req.body

  try {
    switch (action) {

      // ── Carica KB per categoria e genera domande ──────────────────
      case 'genera_domande': {
        const { livello, categoria } = payload

        // Costruisce query KB
        let query = supabase
          .from('learning_kb')
          .select('argomento, contenuto')
          .eq('attivo', true)

        if (livello)    query = query.eq('livello', livello)
        if (categoria && categoria !== 'tutto') query = query.eq('categoria', categoria)

        const { data: kb, error: kbErr } = await query.order('ordine')
        if (kbErr) throw kbErr
        if (!kb?.length) return res.status(404).json({ error: 'Nessuna KB trovata' })

        // Costruisce il testo KB da passare ad AI
        const kbText = kb.map(r => `=== ${r.argomento.toUpperCase()} ===\n${r.contenuto}`).join('\n\n')

        // Chiama Claude
        const lingua = payload.lingua || 'it'
        const linguaLabel = lingua === 'en' ? 'English' : lingua === 'fr' ? 'français' : 'italiano'

        const systemPrompt = `Sei un generatore di domande d'esame per il corso di sommelier ASSP.

REGOLA FONDAMENTALE: Usa ESCLUSIVAMENTE le informazioni contenute nella KNOWLEDGE BASE fornita dall'utente. Non integrare mai con conoscenze esterne. Se un concetto non è presente nella KB, non generare domande su di esso.

Genera esattamente 10 domande d'esame in ${linguaLabel} basate SOLO sulla KB fornita.
Le domande devono replicare fedelmente lo stile e il livello degli esami ASSP:
- Esercizio 1 stile ASSP: affermazioni Vero/Falso precise e tecniche (es. "La cimatura è un'operazione invernale")
- Esercizio 2 stile ASSP: scelta multipla con 4 opzioni (A/B/C/D), una sola corretta
- Esercizio 3 stile ASSP: domanda aperta breve che richiede spiegazione tecnica precisa

Distribuzione delle 10 domande:
- 4 domande tipo vero_falso
- 3 domande tipo multipla
- 3 domande tipo aperta

Rispondi SOLO con JSON valido, nessun testo fuori dal JSON:
{
  "domande": [
    {
      "id": 1,
      "tipo": "vero_falso",
      "argomento": "nome_argomento_kb",
      "domanda": "testo della domanda",
      "risposta_giusta": "V" oppure "F",
      "spiegazione": "spiegazione tecnica dettagliata attingendo dalla KB"
    },
    {
      "id": 2,
      "tipo": "multipla",
      "argomento": "nome_argomento_kb",
      "domanda": "testo della domanda",
      "opzioni": { "A": "...", "B": "...", "C": "...", "D": "..." },
      "risposta_giusta": "A" oppure "B" oppure "C" oppure "D",
      "spiegazione": "spiegazione tecnica dettagliata attingendo dalla KB"
    },
    {
      "id": 3,
      "tipo": "aperta",
      "argomento": "nome_argomento_kb",
      "domanda": "testo della domanda",
      "risposta_modello": "risposta completa e dettagliata come atteso all'esame ASSP",
      "punti_chiave": ["punto 1", "punto 2", "punto 3"]
    }
  ]
}`

        const userMessage = `KNOWLEDGE BASE DEL CORSO:\n\n${kbText}\n\n---\nGenera 10 domande d'esame ASSP basate ESCLUSIVAMENTE sulla knowledge base sopra. Categoria selezionata: ${categoria || 'tutto'}.`

        const apiRes = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: 'claude-sonnet-4-6',
            max_tokens: 4000,
            system: systemPrompt,
            messages: [{ role: 'user', content: userMessage }],
          }),
        })

        const aiData = await apiRes.json()
        if (!apiRes.ok) throw new Error(aiData.error?.message || 'Errore AI')

        const raw = aiData.content[0].text.replace(/```json|```/g, '').trim()
        const parsed = JSON.parse(raw)

        // Crea sessione nel DB
        const { data: sessione, error: sessErr } = await supabase
          .from('learning_sessioni')
          .insert({
            user_id: user.id,
            livello: livello || null,
            categoria: categoria || null,
            n_domande: parsed.domande.length,
          })
          .select()
          .single()
        if (sessErr) throw sessErr

        return res.json({ sessione_id: sessione.id, domande: parsed.domande })
      }

      // ── Correggi risposta aperta con AI ───────────────────────────
      case 'correggi_aperta': {
        const { domanda, risposta_modello, punti_chiave, risposta_utente, lingua } = payload
        const linguaLabel = lingua === 'en' ? 'English' : lingua === 'fr' ? 'français' : 'italiano'

        const prompt = `Sei un esaminatore ASSP che corregge risposte d'esame.

Domanda: ${domanda}
Risposta modello: ${risposta_modello}
Punti chiave attesi: ${punti_chiave.join(', ')}
Risposta dello studente: ${risposta_utente}

Valuta se la risposta è corretta o parzialmente corretta. Rispondi SOLO in ${linguaLabel} con JSON:
{
  "corretta": true o false,
  "punteggio": numero da 0 a 3,
  "feedback": "feedback costruttivo in massimo 2 frasi",
  "punti_centrati": ["punto 1 centrato", ...],
  "punti_mancati": ["punto mancato 1", ...]
}`

        const apiRes = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 600,
            messages: [{ role: 'user', content: prompt }],
          }),
        })

        const aiData = await apiRes.json()
        if (!apiRes.ok) throw new Error(aiData.error?.message || 'Errore AI')

        const raw = aiData.content[0].text.replace(/```json|```/g, '').trim()
        return res.json(JSON.parse(raw))
      }

      // ── Salva risposta e aggiorna progressi ───────────────────────
      case 'salva_risposta': {
        const { sessione_id, argomento, tipo_domanda, domanda,
                risposta_utente, risposta_giusta, corretta, spiegazione, tempo_ms } = payload

        // Inserisce risposta
        const { error: rErr } = await supabase.from('learning_risposte').insert({
          sessione_id, user_id: user.id, argomento, tipo_domanda,
          domanda, risposta_utente, risposta_giusta,
          corretta, spiegazione, tempo_ms,
        })
        if (rErr) throw rErr

        // Aggiorna progressi per argomento (upsert)
        const { data: prog } = await supabase
          .from('learning_progressi')
          .select()
          .eq('user_id', user.id)
          .eq('argomento', argomento)
          .single()

        const n_risposte = (prog?.n_risposte || 0) + 1
        const n_corrette = (prog?.n_corrette || 0) + (corretta ? 1 : 0)
        const pct = Math.round((n_corrette / n_risposte) * 100)

        // Recupera livello e categoria dalla sessione
        const { data: sess } = await supabase
          .from('learning_sessioni')
          .select('livello, categoria')
          .eq('id', sessione_id)
          .single()

        await supabase.from('learning_progressi').upsert({
          user_id: user.id,
          livello: sess?.livello || 1,
          categoria: sess?.categoria || 'tutto',
          argomento,
          n_risposte, n_corrette, pct_corretto: pct,
          ultima_sessione: new Date().toISOString(),
        }, { onConflict: 'user_id,livello,categoria,argomento' })

        return res.json({ ok: true })
      }

      // ── Chiudi sessione con punteggio finale ──────────────────────
      case 'chiudi_sessione': {
        const { sessione_id, n_corrette, durata_sec } = payload
        const { data: sess } = await supabase
          .from('learning_sessioni')
          .select('n_domande')
          .eq('id', sessione_id)
          .single()

        const punteggio = Math.round((n_corrette / (sess?.n_domande || 10)) * 100)

        await supabase.from('learning_sessioni').update({
          n_corrette, punteggio, durata_sec, completata: true,
        }).eq('id', sessione_id)

        return res.json({ punteggio })
      }

      // ── Progressi utente ──────────────────────────────────────────
      case 'get_progressi': {
        const { data, error } = await supabase
          .from('learning_progressi')
          .select('*')
          .eq('user_id', user.id)
          .order('pct_corretto', { ascending: true })
        if (error) throw error
        return res.json({ progressi: data || [] })
      }

      // ── Storico sessioni ──────────────────────────────────────────
      case 'get_sessioni': {
        const { data, error } = await supabase
          .from('learning_sessioni')
          .select('*')
          .eq('user_id', user.id)
          .eq('completata', true)
          .order('created_at', { ascending: false })
          .limit(20)
        if (error) throw error
        return res.json({ sessioni: data || [] })
      }

      default:
        return res.status(400).json({ error: 'Azione non riconosciuta' })
    }
  } catch (e) {
    console.error('Learning API error:', e)
    return res.status(500).json({ error: e.message })
  }
}

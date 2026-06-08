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

      case 'genera_domande': {
        const { livello, categoria, lingua } = payload

        let query = supabase.from('learning_kb').select('argomento, contenuto').eq('attivo', true)
        if (livello) query = query.eq('livello', livello)
        if (categoria) query = query.eq('categoria', categoria)
        const { data: kb, error: kbErr } = await query.order('ordine')
        if (kbErr) return res.status(500).json({ error: kbErr.message })
        if (!kb?.length) return res.status(404).json({ error: 'Nessun contenuto trovato' })

        const kbText = kb.map(r => `=== ${r.argomento} ===\n${r.contenuto}`).join('\n\n')
        const linguaLabel = lingua === 'en' ? 'English' : lingua === 'fr' ? 'français' : 'italiano'

        const system = `Sei un generatore di domande d'esame per il corso di sommelier ASSP.

REGOLA ASSOLUTA: usa ESCLUSIVAMENTE le informazioni della KNOWLEDGE BASE fornita. Non aggiungere mai nozioni esterne.

Genera esattamente 10 domande in ${linguaLabel} calibrate sullo stile degli esami ASSP.
Le domande devono essere precise, tecniche, con trabocchetti realistici, esattamente come all'esame.

TIPI DISPONIBILI e distribuzione consigliata:
- vero_falso: affermazione da giudicare vera o falsa (2-3 domande)
- multipla: 4 opzioni A/B/C/D, una sola corretta (2-3 domande)
- aperta: risposta descrittiva libera (1-2 domande)
- classifica_colore: lista di vitigni da classificare come bianco/rosso (1 domanda)
- abbinamento: collegare elementi di colonna sinistra a colonna destra, es. vitigno→regione, vino→paese (1-2 domande)
- elenco: domanda che richiede di elencare elementi specifici, es. 3 zone + comuni + vitigni (1 domanda)
- mappa: descrivere la posizione geografica di regioni viticole su una mappa descrittiva (0-1 domanda)

Scegli i tipi più adatti al contenuto della KB selezionata. Non usare tutti i tipi se non appropriati.

Rispondi SOLO con JSON valido, nessun testo fuori:
{
  "domande": [
    {
      "id": 1,
      "tipo": "vero_falso",
      "argomento": "nome_argomento",
      "domanda": "testo",
      "risposta_giusta": "V",
      "spiegazione": "spiegazione tecnica dalla KB"
    },
    {
      "id": 2,
      "tipo": "multipla",
      "argomento": "nome_argomento",
      "domanda": "testo",
      "opzioni": {"A": "...", "B": "...", "C": "...", "D": "..."},
      "risposta_giusta": "B",
      "spiegazione": "spiegazione tecnica dalla KB"
    },
    {
      "id": 3,
      "tipo": "aperta",
      "argomento": "nome_argomento",
      "domanda": "testo",
      "risposta_modello": "risposta completa attesa",
      "punti_chiave": ["punto1", "punto2", "punto3"]
    },
    {
      "id": 4,
      "tipo": "classifica_colore",
      "argomento": "nome_argomento",
      "domanda": "Indica se i seguenti vitigni sono bianchi o rossi:",
      "vitigni": ["Vitigno1", "Vitigno2", "Vitigno3", "Vitigno4", "Vitigno5", "Vitigno6"],
      "risposta_giusta": {"Vitigno1": "bianco", "Vitigno2": "rosso", "Vitigno3": "bianco", "Vitigno4": "rosso", "Vitigno5": "bianco", "Vitigno6": "rosso"},
      "spiegazione": "breve spiegazione per i casi meno ovvi"
    },
    {
      "id": 5,
      "tipo": "abbinamento",
      "argomento": "nome_argomento",
      "domanda": "Abbina ogni elemento alla colonna di destra:",
      "istruzione_sx": "Vitigno / Vino / Denominazione",
      "istruzione_dx": "Regione / Paese / Cantone",
      "coppie": [
        {"sx": "Elemento A", "dx": "Risposta A"},
        {"sx": "Elemento B", "dx": "Risposta B"},
        {"sx": "Elemento C", "dx": "Risposta C"},
        {"sx": "Elemento D", "dx": "Risposta D"},
        {"sx": "Elemento E", "dx": "Risposta E"}
      ],
      "spiegazione": "note aggiuntive dalla KB"
    },
    {
      "id": 6,
      "tipo": "elenco",
      "argomento": "nome_argomento",
      "domanda": "testo che chiede di elencare elementi specifici",
      "risposta_modello": "risposta modello completa",
      "punti_chiave": ["elemento1", "elemento2", "elemento3"]
    },
    {
      "id": 7,
      "tipo": "mappa",
      "argomento": "nome_argomento",
      "domanda": "Indica a quale area geografica appartengono le seguenti denominazioni/vitigni/regioni:",
      "elementi": ["Elemento1", "Elemento2", "Elemento3", "Elemento4"],
      "risposta_giusta": {"Elemento1": "Area X", "Elemento2": "Area Y", "Elemento3": "Area Z", "Elemento4": "Area W"},
      "spiegazione": "contesto geografico dalla KB"
    }
  ]
}`

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
            messages: [{ role: 'user', content: `KNOWLEDGE BASE:\n\n${kbText}\n\nCategoria selezionata: ${categoria || 'tutto'}. Genera 10 domande variando i tipi in base al contenuto.` }],
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

      case 'salva_risposta': {
        const { sessione_id, argomento, tipo_domanda, domanda, risposta_utente, risposta_giusta, corretta, spiegazione, tempo_ms } = payload

        await supabase.from('learning_risposte').insert({
          sessione_id, user_id: user.id, argomento, tipo_domanda,
          domanda, risposta_utente: typeof risposta_utente === 'string' ? risposta_utente : JSON.stringify(risposta_utente),
          risposta_giusta: typeof risposta_giusta === 'string' ? risposta_giusta : JSON.stringify(risposta_giusta),
          corretta, spiegazione, tempo_ms,
        })

        const { data: prog } = await supabase.from('learning_progressi')
          .select().eq('user_id', user.id).eq('argomento', argomento).maybeSingle()
        const n_risposte = (prog?.n_risposte || 0) + 1
        const n_corrette = (prog?.n_corrette || 0) + (corretta ? 1 : 0)
        const { data: sess } = await supabase.from('learning_sessioni').select('livello,categoria').eq('id', sessione_id).single()

        await supabase.from('learning_progressi').upsert({
          user_id: user.id, livello: sess?.livello || 1, categoria: sess?.categoria || 'vino',
          argomento, n_risposte, n_corrette,
          pct_corretto: Math.round((n_corrette / n_risposte) * 100),
          ultima_sessione: new Date().toISOString(),
        }, { onConflict: 'user_id,livello,categoria,argomento' })

        return res.json({ ok: true })
      }

      case 'chiudi_sessione': {
        const { sessione_id, n_corrette, durata_sec } = payload
        const { data: sess } = await supabase.from('learning_sessioni').select('n_domande').eq('id', sessione_id).single()
        const punteggio = Math.round(((n_corrette || 0) / (sess?.n_domande || 10)) * 100)
        await supabase.from('learning_sessioni').update({ n_corrette, punteggio, durata_sec, completata: true }).eq('id', sessione_id)
        return res.json({ punteggio })
      }

      case 'get_progressi': {
        const { data, error } = await supabase.from('learning_progressi')
          .select('*').eq('user_id', user.id).order('pct_corretto', { ascending: true })
        if (error) return res.status(500).json({ error: error.message })
        return res.json({ progressi: data || [] })
      }

      case 'genera_esercizi_regione': {
        const { regione, regione_nome } = payload

        const system = `Sei un generatore di esercizi flash per sommelier ASSP.
Usa ESCLUSIVAMENTE le informazioni della regione fornita. Non aggiungere nozioni esterne.

Genera esattamente 8 domande rapide e azionabili su ${regione_nome}.
Mix di tipi: 3 multipla, 2 vero_falso, 3 flash (una flash card con domanda e risposta).

Per "multipla": 4 opzioni, una corretta. Domande brevi e precise.
Per "vero_falso": affermazione da giudicare vera o falsa.
Per "flash": breve domanda con risposta concisa (es. "Qual è il vitigno principale?").

Rispondi SOLO con JSON valido:
{
  "domande": [
    {
      "tipo": "multipla",
      "domanda": "testo domanda",
      "opzioni": ["A","B","C","D"],
      "corretta": "a",
      "spiegazione": "breve spiegazione max 1 frase"
    },
    {
      "tipo": "vero_falso",
      "domanda": "affermazione",
      "corretta": true,
      "spiegazione": "breve spiegazione"
    },
    {
      "tipo": "flash",
      "domanda": "domanda breve",
      "risposta": "risposta concisa"
    }
  ]
}`

        const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 2000,
            system,
            messages: [{ role: 'user', content: `Dati della regione:\n${regione}` }],
          }),
        })

        const aiData = await anthropicRes.json()
        if (!anthropicRes.ok) return res.status(500).json({ error: 'Errore generazione esercizi' })
        const raw = aiData.content[0].text.replace(/```json|```/g, '').trim()
        const parsed = JSON.parse(raw)
        return res.json({ domande: parsed.domande })
      }

      case 'domanda_libera': {
        const { domanda, kb_context } = payload

        const system = `Sei un esperto sommelier ASSP. Rispondi ESCLUSIVAMENTE usando le informazioni della knowledge base fornita.
Se l'informazione non è presente nella KB, dillo esplicitamente con: "Questa informazione non è presente nelle mie note di studio."
Non aggiungere mai nozioni esterne senza segnalarlo.
Se usi conoscenze esterne alla KB, inizia la frase con [FONTE ESTERNA].
Rispondi in italiano, in modo chiaro e preciso, come se spiegassi a uno studente ASSP.`

        const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 800,
            system,
            messages: [{
              role: 'user',
              content: `Knowledge base di studio:\n${kb_context}\n\nDomanda dello studente: ${domanda}`
            }],
          }),
        })

        const aiData = await anthropicRes.json()
        if (!anthropicRes.ok) return res.status(500).json({ error: 'Errore risposta' })
        const risposta = aiData.content[0].text
        const usaFonteEsterna = risposta.includes('[FONTE ESTERNA]')
        return res.json({ risposta, fonte_esterna: usaFonteEsterna })
      }

      default:
        return res.status(400).json({ error: `Azione sconosciuta: ${action}` })
    }
  } catch (e) {
    console.error('learning error:', e)
    return res.status(500).json({ error: e.message })
  }
}

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


      case 'debug_kb': {
        // Debug: conta le righe trovate
        const { sottocategoria } = payload
        const { data, count, error } = await supabase
          .from('learning_kb')
          .select('livello, categoria, sottocategoria, tipo', { count: 'exact' })
          .limit(5)
        const { data: d2 } = await supabase
          .from('learning_kb')
          .select('livello, categoria, sottocategoria, tipo', { count: 'exact' })
          .eq('livello', 1)
          .eq('categoria', 'vino')
          .eq('sottocategoria', sottocategoria || 'viticoltura')
        return res.json({ sample: data, filtered: d2, error: error?.message })
      }

      case 'get_kb_domande': {
        const { sottocategoria, n = 15, lingua, categoria: catPayload } = payload
        const categoria = catPayload || 'vino'
        const tipi = ['multipla','vero_falso','aperta','elenco','classifica_colore','abbinamento']
        let domande = []
        // Almeno 1 per tipo garantita
        for (const tipo of tipi) {
          const { data: pool } = await supabase
            .from('learning_kb')
            .select('*')
            .eq('livello', 1)
            .eq('categoria', categoria)
            .eq('sottocategoria', sottocategoria)
            .eq('tipo', tipo)
          if (pool && pool.length > 0) {
            const r = pool[Math.floor(Math.random() * pool.length)]
            domande.push(r)
          }
        }
        // Riempi fino a n con domande random
        const { data: extra } = await supabase
          .from('learning_kb')
          .select('*')
          .eq('livello', 1)
          .eq('categoria', categoria)
          .eq('sottocategoria', sottocategoria)
          .limit(200)
        if (extra) {
          const shuffled = extra.sort(() => Math.random() - 0.5)
          const usedIds = new Set(domande.map(d => d.id))
          for (const d of shuffled) {
            if (domande.length >= n) break
            if (!usedIds.has(d.id)) { domande.push(d); usedIds.add(d.id) }
          }
        }
        domande = domande.sort(() => Math.random() - 0.5)

        // Crea una sessione in learning_sessioni per tracciare i progressi
        let sessione_id = null
        try {
          const { data: sess } = await supabase.from('learning_sessioni').insert({
            user_id: user.id, livello: 1, categoria: 'vino',
            n_domande: domande.length, completata: false,
          }).select('id').single()
          sessione_id = sess?.id || null
        } catch (_) {}

        // Normalizza al formato atteso dal frontend
        const normalized = domande.map((d, i) => {
          // Converti opzioni da {a,b,c,d} a {A,B,C,D}
          let opzioni = null
          if (d.opzioni) {
            const o = typeof d.opzioni === 'string' ? JSON.parse(d.opzioni) : d.opzioni
            if (o.a !== undefined) opzioni = { A: o.a, B: o.b, C: o.c, D: o.d }
            else opzioni = o
          }
          // Normalizza risposta corretta
          let risposta_giusta = d.corretta
          // corretta arriva da JSONB: può essere booleano, stringa con virgolette, stringa pura
          if (typeof risposta_giusta === 'boolean') {
            risposta_giusta = risposta_giusta ? 'V' : 'F'
          } else if (typeof risposta_giusta === 'string') {
            risposta_giusta = risposta_giusta.replace(/^"|"$/g,'')
            if (risposta_giusta === 'true') risposta_giusta = 'V'
            if (risposta_giusta === 'false') risposta_giusta = 'F'
            if (risposta_giusta.length === 1 && 'abcd'.includes(risposta_giusta)) risposta_giusta = risposta_giusta.toUpperCase()
          }
          // Normalizza tipo
          let tipo = d.tipo
          if (tipo === 'vero_falso') tipo = 'vero_falso'
          // Elementi per classifica_colore e abbinamento
          let elementi = d.elementi
          if (elementi && typeof elementi === 'string') elementi = JSON.parse(elementi)

          // Normalizza classifica_colore: elementi array → vitigni + risposta_giusta come oggetto
          let vitigni = null
          let coppie = null
          if (tipo === 'classifica_colore') {
            // elementi può essere array ["Chardonnay","Merlot"] o {voci:[...], opzioni:[...]}
            const voci = Array.isArray(elementi) ? elementi : (elementi?.voci || elementi?.elementi || [])
            vitigni = voci
            const correttaObj = typeof risposta_giusta === 'string' ? JSON.parse(risposta_giusta) : risposta_giusta
            risposta_giusta = correttaObj
          }

          // Normalizza abbinamento: elementi {sx,dx} → coppie array
          if (tipo === 'abbinamento') {
            const sxArr = elementi?.sx || []
            const dxArr = elementi?.dx || []
            const correttaObj = typeof risposta_giusta === 'string' ? JSON.parse(risposta_giusta) : risposta_giusta
            coppie = sxArr.map(sx => ({ sx, dx: correttaObj?.[sx] || '' }))
            // shuffle le opzioni dx per il select
            const dxShuffled = [...dxArr].sort(() => Math.random() - 0.5)
            coppie = sxArr.map((sx, i) => ({ sx, dx: dxShuffled[i] || '' }))
            risposta_giusta = correttaObj
          }

          // Normalizza elenco: come aperta con risposta_modello
          // (già ok, usa lo stesso renderer dell'aperta)

          return {
            id: i + 1,
            tipo,
            argomento: d.argomento || d.sottocategoria,
            domanda: d.domanda,
            opzioni,
            risposta_giusta,
            risposta_modello: d.risposta_modello || d.spiegazione,
            elementi,
            vitigni,
            coppie,
            istruzione_sx: elementi?.sx ? 'Abbina' : null,
            istruzione_dx: elementi?.dx ? 'alla descrizione' : null,
            spiegazione: d.spiegazione,
          }
        })
        return res.json({ domande: normalized, sessione_id })
      }

      case 'genera_domande': {
        const { livello, categoria, lingua } = payload

        let query = supabase.from('learning_kb').select('argomento, contenuto').eq('attivo', true)
        if (livello) query = query.eq('livello', livello)
        if (categoria === 'italia') query = query.like('categoria', 'italia%')
        else if (categoria) query = query.eq('categoria', categoria)
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
            system: `Sei un esaminatore ASSP benevolo e preciso. Valuti risposte su vino e viticoltura in ${linguaLabel}.

CRITERI DI VALUTAZIONE:
- CORRETTO (corretta:true): Lo studente dimostra comprensione del tema e copre i concetti principali. Piccole omissioni o dettagli tecnici minori (es. gradi esatti, percentuali precise, anni specifici) NON rendono una risposta sbagliata se il concetto generale e corretto.
- PARZIALE (corretta:false, parziale:true): Lo studente ha ragione sui concetti base ma manca almeno meta degli elementi richiesti ESPLICITAMENTE dalla domanda.
- SBAGLIATO (corretta:false, parziale:false): SOLO se la risposta e concettualmente errata, dimostra incomprensione grave, o e completamente fuori tema.

REGOLA D'ORO: Un dettaglio tecnico mancante = suggerimento per migliorare, NON un errore. Inizia sempre il feedback riconoscendo cosa e giusto.`,
            messages: [{ role: 'user', content: `Domanda: ${domanda}
Risposta di riferimento: ${risposta_modello}
Risposta dello studente: ${risposta_utente}

Valuta la risposta. Rispondi SOLO con JSON valido senza altri testi:
{"corretta":true/false,"parziale":true/false,"feedback":"inizia con cosa era giusto, poi cosa mancava se necessario","suggerimenti":["approfondimento utile se disponibile"]}`  }],
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


      case 'genera_mega_quiz': {
        const { paese, paese_nome, lingua } = payload
        const linguaLabel = lingua === 'en' ? 'English' : lingua === 'fr' ? 'français' : 'italiano'

        const system = `Sei un esaminatore ASSP per l'esame di sommelier professionista.
Genera esattamente 25 domande in ${linguaLabel} su TUTTA la viticoltura di ${paese_nome}.
Le domande devono coprire TUTTE le principali regioni/zone del paese, non solo una.
Mix obbligatorio: 12 multipla, 8 vero_falso, 5 flash (curiosità o fatti chiave).
Varia le regioni: ogni regione principale deve avere almeno 1-2 domande.
Le domande devono testare: DOCG/DOC, vitigni autoctoni, stili, classificazioni, produttori iconici, curiosità storiche, abbinamenti, tecniche produttive.
Livello: esame ASSP (difficoltà media-alta).

Rispondi SOLO con JSON valido, nessun testo extra:
{
  "domande": [
    {
      "tipo": "multipla",
      "regione": "nome della regione/zona",
      "domanda": "testo domanda",
      "opzioni": { "a": "...", "b": "...", "c": "...", "d": "..." },
      "corretta": "a",
      "spiegazione": "breve spiegazione"
    },
    {
      "tipo": "vero_falso",
      "regione": "nome regione",
      "domanda": "affermazione vera o falsa",
      "corretta": true,
      "spiegazione": "breve spiegazione"
    },
    {
      "tipo": "flash",
      "regione": "nome regione",
      "domanda": "domanda/concetto chiave",
      "risposta": "risposta completa"
    }
  ]
}`

        const aiRes = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01' },
          body: JSON.stringify({ model: 'claude-haiku-4-5-20251001', max_tokens: 6000,
            system, messages: [{ role: 'user', content: `Genera 25 domande di esame ASSP su ${paese_nome}. Mix di tutte le principali regioni vinicole.` }] })
        })
        const aiData = await aiRes.json()
        const text = aiData.content?.[0]?.text || ''
        const clean = text.replace(/```json|```/g, '').trim()
        const parsed = JSON.parse(clean)
        return res.json(parsed)
      }



      case 'get_italia_mega_quiz': {
        // 25 domande random da tutta la KB italiana - almeno 1 per macro-area
        // Solo tipi compatibili con il renderer del mega quiz
        const tipiMega = ['multipla','vero_falso']
        const macroAree = [
          ['VDA','PIE','LOM'],       // Nord-Ovest
          ['TAA','VEN','FVG'],       // Nord-Est
          ['LIG','EMR'],             // Centro-Nord
          ['TOS','UMB','MAR','LAZ'], // Centro
          ['ABR','MOL','CAM'],       // Centro-Sud
          ['PUG','BAS','CAL'],       // Sud
          ['SIC','SAR'],             // Isole
        ]
        // Normalizza corretta per il renderer Atlante
        const normCorr = (d) => {
          if (d.tipo === 'multipla') {
            const raw = typeof d.corretta === 'string' ? d.corretta.replace(/"/g,'').trim() : String(d.corretta)
            return { ...d, corretta: raw, regione: d.regione_id }
          }
          if (d.tipo === 'vero_falso') {
            let c = d.corretta
            if (typeof c === 'string') c = c.replace(/"/g,'').trim()
            if (c === 'true') c = true
            else if (c === 'false') c = false
            return { ...d, corretta: c, regione: d.regione_id }
          }
          return { ...d, regione: d.regione_id }
        }
        let domande = []
        const usedIds = new Set()
        // Almeno 1 domanda per macro-area (7 garantite)
        for (const area of macroAree) {
          const { data: pool } = await supabase
            .from('italia_quiz_kb').select('*')
            .in('regione_id', area)
            .in('tipo', tipiMega)
          if (pool && pool.length > 0) {
            const r = pool[Math.floor(Math.random() * pool.length)]
            domande.push(normCorr(r))
            usedIds.add(r.id)
          }
        }
        // Riempi fino a 25 con domande random miste
        const { data: extra } = await supabase
          .from('italia_quiz_kb').select('*')
          .in('tipo', tipiMega)
          .limit(500)
        if (extra) {
          const shuffled = extra.sort(() => Math.random() - 0.5)
          for (const d of shuffled) {
            if (domande.length >= 25) break
            if (!usedIds.has(d.id)) {
              domande.push(normCorr(d))
              usedIds.add(d.id)
            }
          }
        }
        domande = domande.sort(() => Math.random() - 0.5)
        return res.json({ domande })
      }

      case 'get_swiss_mega_quiz': {
        // 25 domande random da tutta la KB svizzera - tutte le tipologie
        let domande = []
        // Almeno 1 per regione (6 regioni) garantita
        const regioni = ['VALLESE','VAUD','GINEVRA','TRE_LAGHI','TICINO','SVIZZERA_TEDESCA']
        for (const regione_id of regioni) {
          const { data: pool } = await supabase
            .from('swiss_quiz_kb').select('*').eq('regione_id', regione_id)
          if (pool && pool.length > 0) {
            const r = pool[Math.floor(Math.random() * pool.length)]
            domande.push({ ...r, regione: r.regione_id })
          }
        }
        // Riempi fino a 25 con domande random miste da tutta la KB
        const { data: extra } = await supabase
          .from('swiss_quiz_kb').select('*').limit(180)
        if (extra) {
          const shuffled = extra.sort(() => Math.random() - 0.5)
          const usedIds = new Set(domande.map(d => d.id))
          for (const d of shuffled) {
            if (domande.length >= 25) break
            if (!usedIds.has(d.id)) {
              domande.push({ ...d, regione: d.regione_id })
              usedIds.add(d.id)
            }
          }
        }
        domande = domande.sort(() => Math.random() - 0.5)
        return res.json({ domande })
      }


      case 'get_italia_quiz': {
        const { regione_id, lingua } = payload
        // Estrae domande random dalla KB fissa italiana, almeno 1 per tipo, totale 15
        const tipi = ['multipla','vero_falso','aperta','elenco','classifica_colore','abbinamento']
        let domande = []
        // 1 domanda garantita per ogni tipo
        for (const tipo of tipi) {
          const { data: pool } = await supabase
            .from('italia_quiz_kb')
            .select('*')
            .eq('regione_id', regione_id)
            .eq('tipo', tipo)
          if (pool && pool.length > 0) {
            const r = pool[Math.floor(Math.random() * pool.length)]
            domande.push({ ...r, regione: r.regione_id })
          }
        }
        // Riempi fino a 15 con domande random miste
        const { data: extra } = await supabase
          .from('italia_quiz_kb')
          .select('*')
          .eq('regione_id', regione_id)
          .limit(100)
        if (extra) {
          const shuffled = extra.sort(() => Math.random() - 0.5)
          const usedIds = new Set(domande.map(d => d.id))
          for (const d of shuffled) {
            if (domande.length >= 15) break
            if (!usedIds.has(d.id)) {
              domande.push({ ...d, regione: d.regione_id })
              usedIds.add(d.id)
            }
          }
        }
        domande = domande.sort(() => Math.random() - 0.5)
        // Normalizza campi KB → formato Learning
        const normalize = (d) => {
          // opzioni: {a,b,c,d} → {A,B,C,D}
          let opzioni = d.opzioni
          if (typeof opzioni === 'string') { try { opzioni = JSON.parse(opzioni) } catch(e) { opzioni = {} } }
          if (opzioni && typeof opzioni === 'object' && !Array.isArray(opzioni)) {
            const up = {}
            for (const [k,v] of Object.entries(opzioni)) up[k.toUpperCase()] = v
            opzioni = up
          }
          // corretta: '"a"' o 'a' → 'A' (multipla); boolean/string per vero_falso
          let risposta_giusta = d.corretta
          if (d.tipo === 'multipla') {
            const raw = typeof d.corretta === 'string' ? d.corretta.replace(/"/g,'') : d.corretta
            risposta_giusta = String(raw).toUpperCase()
          } else if (d.tipo === 'vero_falso') {
            if (typeof d.corretta === 'boolean') risposta_giusta = d.corretta
            else if (d.corretta === 'true') risposta_giusta = true
            else if (d.corretta === 'false') risposta_giusta = false
            else risposta_giusta = d.corretta
          } else if (d.tipo === 'abbinamento') {
            // corretta è già un oggetto {sx:dx}
            const raw = typeof d.corretta === 'string' ? JSON.parse(d.corretta) : d.corretta
            risposta_giusta = raw
          } else if (d.tipo === 'elenco' || d.tipo === 'aperta') {
            risposta_giusta = d.risposta_modello || d.corretta
          } else if (d.tipo === 'classifica_colore') {
            const raw = typeof d.corretta === 'string' ? JSON.parse(d.corretta) : d.corretta
            risposta_giusta = raw
          }
          return {
            ...d,
            opzioni,
            risposta_giusta,
            risposta_modello: d.risposta_modello,
            coppie: d.tipo === 'abbinamento' && d.elementi
              ? (() => { const el = typeof d.elementi === 'string' ? JSON.parse(d.elementi) : d.elementi; return (el.sx||[]).map((s,i)=>({sx:s,dx:(el.dx||[])[i]})) })()
              : undefined,
          }
        }
        return res.json({ domande: domande.map(normalize) })
      }

      case 'get_swiss_quiz': {
        const { regione_id, lingua } = payload
        // Estrae domande random dalla KB fissa, almeno 1 per tipo, totale 15
        const tipi = ['multipla','vero_falso','aperta','elenco','classifica_colore','abbinamento','comuni']
        let domande = []
        // 1 domanda garantita per ogni tipo
        for (const tipo of tipi) {
          const { data: pool } = await supabase
            .from('swiss_quiz_kb')
            .select('*')
            .eq('regione_id', regione_id)
            .eq('tipo', tipo)
          if (pool && pool.length > 0) {
            const random = pool[Math.floor(Math.random() * pool.length)]
            domande.push(random)
          }
        }
        // Aggiungi domande random fino a 15 (preferibilmente multipla e vero_falso)
        const { data: extra } = await supabase
          .from('swiss_quiz_kb')
          .select('*')
          .eq('regione_id', regione_id)
          .order('RANDOM()')
          .limit(30)
        if (extra) {
          const usedIds = new Set(domande.map(d => d.id))
          for (const d of extra) {
            if (domande.length >= 15) break
            if (!usedIds.has(d.id)) {
              domande.push(d)
              usedIds.add(d.id)
            }
          }
        }
        // Shuffle
        domande = domande.sort(() => Math.random() - 0.5)
        return res.json({ domande })
      }

      case 'get_francia_quiz': {
        const { regione_id } = payload
        // 15 domande random dalla KB Francia, almeno 1 per tipo disponibile
        const tipi = ['multipla','vero_falso','aperta','elenco','abbinamento']
        let domande = []
        for (const tipo of tipi) {
          const { data: pool } = await supabase
            .from('francia_quiz_kb').select('*')
            .eq('regione_id', regione_id).eq('tipo', tipo)
          if (pool && pool.length > 0) {
            const r = pool[Math.floor(Math.random() * pool.length)]
            domande.push(r)
          }
        }
        const { data: extra } = await supabase
          .from('francia_quiz_kb').select('*')
          .eq('regione_id', regione_id).limit(100)
        if (extra) {
          const usedIds = new Set(domande.map(d => d.id))
          const shuffled = extra.sort(() => Math.random() - 0.5)
          for (const d of shuffled) {
            if (domande.length >= 15) break
            if (!usedIds.has(d.id)) { domande.push(d); usedIds.add(d.id) }
          }
        }
        domande = domande.sort(() => Math.random() - 0.5)
        // Normalizza campi KB → formato Learning (stesso pattern Italia)
        const normalizeFr = (d) => {
          let opzioni = d.opzioni
          if (typeof opzioni === 'string') { try { opzioni = JSON.parse(opzioni) } catch(e) { opzioni = {} } }
          if (opzioni && typeof opzioni === 'object' && !Array.isArray(opzioni)) {
            const up = {}
            for (const [k,v] of Object.entries(opzioni)) up[k.toUpperCase()] = v
            opzioni = up
          }
          let risposta_giusta = d.corretta
          if (d.tipo === 'multipla') {
            const raw = typeof d.corretta === 'string' ? d.corretta.replace(/"/g,'') : d.corretta
            risposta_giusta = String(raw).toUpperCase()
          } else if (d.tipo === 'vero_falso') {
            if (typeof d.corretta === 'boolean') risposta_giusta = d.corretta
            else if (d.corretta === 'true') risposta_giusta = true
            else if (d.corretta === 'false') risposta_giusta = false
            else risposta_giusta = d.corretta
          } else if (d.tipo === 'abbinamento') {
            const raw = typeof d.corretta === 'string' ? JSON.parse(d.corretta) : d.corretta
            risposta_giusta = raw
          } else if (d.tipo === 'elenco' || d.tipo === 'aperta') {
            risposta_giusta = d.risposta_modello || d.corretta
          }
          return {
            ...d, opzioni, risposta_giusta,
            risposta_modello: d.risposta_modello,
            coppie: d.tipo === 'abbinamento' && d.elementi
              ? (() => { const el = typeof d.elementi === 'string' ? JSON.parse(d.elementi) : d.elementi; return (el.sx||[]).map((s,i)=>({sx:s,dx:(el.dx||[])[i]})) })()
              : undefined,
          }
        }
        return res.json({ domande: domande.map(normalizeFr) })
      }

      case 'get_francia_mega_quiz': {
        // 25 domande random da tutta la KB Francia - almeno 1 per regione disponibile
        const tipiMega = ['multipla','vero_falso']
        const regioniFrancia = ['CHAMPAGNE','ALSACE','LORRAINE','BOURGOGNE','BEAUJOLAIS','VALLEE_LOIRA','BORDEAUX','SUD_OUEST','RODANO','PROVENZA','LANGUEDOC_ROUSSILLON','JURA_SAVOIA','CORSICA']
        const normCorrFr = (d) => {
          if (d.tipo === 'multipla') {
            const raw = typeof d.corretta === 'string' ? d.corretta.replace(/"/g,'').trim() : String(d.corretta)
            return { ...d, corretta: raw, regione: d.regione_id }
          }
          if (d.tipo === 'vero_falso') {
            let c = d.corretta
            if (typeof c === 'string') c = c.replace(/"/g,'').trim()
            if (c === 'true') c = true
            else if (c === 'false') c = false
            return { ...d, corretta: c, regione: d.regione_id }
          }
          return { ...d, regione: d.regione_id }
        }
        let domande = []
        const usedIds = new Set()
        // Almeno 1 domanda per regione con dati in KB
        for (const rid of regioniFrancia) {
          const { data: pool } = await supabase
            .from('francia_quiz_kb').select('*')
            .eq('regione_id', rid).in('tipo', tipiMega)
          if (pool && pool.length > 0) {
            const r = pool[Math.floor(Math.random() * pool.length)]
            domande.push(normCorrFr(r))
            usedIds.add(r.id)
            if (domande.length >= 25) break
          }
        }
        // Riempi fino a 25 con domande random miste
        const { data: extraFr } = await supabase
          .from('francia_quiz_kb').select('*').in('tipo', tipiMega).limit(500)
        if (extraFr) {
          const shuffled = extraFr.sort(() => Math.random() - 0.5)
          for (const d of shuffled) {
            if (domande.length >= 25) break
            if (!usedIds.has(d.id)) { domande.push(normCorrFr(d)); usedIds.add(d.id) }
          }
        }
        domande = domande.sort(() => Math.random() - 0.5)
        return res.json({ domande })
      }

      case 'genera_esercizi_regione': {
        const { regione, regione_nome, lingua } = payload
        const linguaLabel = lingua === 'en' ? 'English' : lingua === 'fr' ? 'français' : 'italiano'

        const system = `Sei un generatore di esercizi flash per sommelier ASSP.
Usa ESCLUSIVAMENTE le informazioni della regione fornita. Non aggiungere nozioni esterne.
Rispondi SEMPRE in ${linguaLabel} — tutte le domande, opzioni e spiegazioni devono essere in ${linguaLabel}.

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

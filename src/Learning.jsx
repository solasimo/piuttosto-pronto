import { useState } from 'react'
import { supabase } from './supabase'
import { getLingua } from './i18n'

// ─── API call ─────────────────────────────────────────────────────────────────
async function api(action, payload = {}) {
  const { data: { session } } = await supabase.auth.getSession()
  const r = await fetch('/api/learning', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
    body: JSON.stringify({ action, payload }),
  })
  const d = await r.json()
  if (!r.ok) throw new Error(d.error || `HTTP ${r.status}`)
  return d
}

// ─── Colori ───────────────────────────────────────────────────────────────────
const avorio = '#FBF7F0'
const terra  = '#C4614A'
const oro    = '#B8956A'
const scuro  = '#2C1A0E'
const medio  = '#9A8070'
const chiaro = '#E0D8CC'
const verde  = '#2D6A4F'
const rosso  = '#9B2335'
const giallo = '#C77B13'

// ─── Testi per lingua ─────────────────────────────────────────────────────────
const TX = {
  it: {
    sottotitolo: 'Preparazione esame ASSP',
    scegli: 'Scegli area di studio',
    l1: '1° Livello', l1sub: 'Vino · Birra · Distillati',
    l2: '2° Livello', l2sub: 'Enologia internazionale',
    tutto: 'Tutto', tuttosub: 'Tutti i livelli',
    progressi_btn: '📊 I tuoi progressi',
    scegli_cat: 'Scegli argomento',
    cat_vino: '🍷 Vino', cat_birra: '🍺 Birra', cat_dist: '🥃 Distillati', cat_tutto: '🎯 Tutto il livello',
    scegli_cat_l2: 'Scegli area geografica',
    cat_italia: '🇮🇹 Italia',
    cat_italia_nord_ovest: 'Nord-Ovest (VdA, Piemonte, Lombardia, Liguria)',
    cat_italia_nord_est: 'Nord-Est (Veneto, TAA, Friuli, Emilia)',
    cat_italia_centro: 'Centro (Toscana, Marche, Umbria, Lazio)',
    cat_italia_sud: 'Sud (Abruzzo, Molise, Campania, Puglia, Basilicata)',
    cat_italia_isole: 'Isole (Calabria, Sicilia, Sardegna)',
    cat_tutto_l2: '🎯 Tutta Italia',
    indietro: '← Indietro',
    caricamento: 'Claude sta preparando le domande…',
    caricamento_sub: 'Basandosi sui tuoi appunti del corso ASSP',
    dom_label_vf: 'Vero / Falso', dom_label_m: 'Scelta multipla', dom_label_a: 'Risposta aperta',
    vero: 'VERO', falso: 'FALSO',
    scrivi: 'Scrivi la tua risposta qui…',
    classifica_istr: 'Seleziona bianco o rosso per ogni vitigno:',
    bianco: 'Bianco', rosso: 'Rosso',
    mappa_istr: 'Abbina ogni elemento alla sua area geografica:',
    parziale: 'parzialmente corretto',
    conferma: 'Conferma risposta',
    correzione: 'Correzione in corso…',
    corretta: '✓ Corretto!', sbagliata: '✗ Sbagliato',
    risposta_giusta: 'Risposta corretta:',
    spiegazione: 'Spiegazione:',
    feedback: 'Feedback:',
    punti_mancati: 'Punti mancati:',
    punti_chiave: 'Punti chiave:',
    avanti: 'Prossima domanda →',
    fine: 'Vedi risultati →',
    domanda_n: 'Domanda',
    di: 'di',
    risultati_titolo: 'Risultati sessione',
    corrette_su: 'corrette su',
    nuova: 'Nuova sessione',
    torna: 'Torna al menu',
    progressi_titolo: 'I tuoi progressi',
    nessun_prog: 'Ancora nessuna sessione completata. Inizia a studiare!',
    risposte: 'risposte',
    errore_torna: 'Riprova',
  },
  en: {
    sottotitolo: 'ASSP exam preparation',
    scegli: 'Choose study area',
    l1: '1st Level', l1sub: 'Wine · Beer · Spirits',
    l2: '2nd Level', l2sub: 'International oenology',
    tutto: 'Everything', tuttosub: 'All levels',
    progressi_btn: '📊 Your progress',
    scegli_cat: 'Choose topic',
    cat_vino: '🍷 Wine', cat_birra: '🍺 Beer', cat_dist: '🥃 Spirits', cat_tutto: '🎯 Entire level',
    scegli_cat_l2: 'Choose geographic area',
    cat_italia: '🇮🇹 Italy',
    cat_italia_nord_ovest: 'North-West (VdA, Piedmont, Lombardy, Liguria)',
    cat_italia_nord_est: 'North-East (Veneto, TAA, Friuli, Emilia)',
    cat_italia_centro: 'Centre (Tuscany, Marche, Umbria, Lazio)',
    cat_italia_sud: 'South (Abruzzo, Molise, Campania, Puglia, Basilicata)',
    cat_italia_isole: 'Islands (Calabria, Sicily, Sardinia)',
    cat_tutto_l2: '🎯 All Italy',
    indietro: '← Back',
    caricamento: 'Claude is preparing questions…',
    caricamento_sub: 'Based on your ASSP course notes',
    dom_label_vf: 'True / False', dom_label_m: 'Multiple choice', dom_label_a: 'Open answer',
    vero: 'TRUE', falso: 'FALSE',
    scrivi: 'Write your answer here…',
    classifica_istr: 'Select white or red for each grape variety:',
    bianco: 'White', rosso: 'Red',
    mappa_istr: 'Match each element to its geographic area:',
    parziale: 'partially correct',
    conferma: 'Confirm answer',
    correzione: 'Correcting…',
    corretta: '✓ Correct!', sbagliata: '✗ Wrong',
    risposta_giusta: 'Correct answer:',
    spiegazione: 'Explanation:',
    feedback: 'Feedback:',
    punti_mancati: 'Missing points:',
    punti_chiave: 'Key points:',
    avanti: 'Next question →',
    fine: 'See results →',
    domanda_n: 'Question',
    di: 'of',
    risultati_titolo: 'Session results',
    corrette_su: 'correct out of',
    nuova: 'New session',
    torna: 'Back to menu',
    progressi_titolo: 'Your progress',
    nessun_prog: 'No completed sessions yet. Start studying!',
    risposte: 'answers',
    errore_torna: 'Retry',
  },
  fr: {
    sottotitolo: "Préparation à l'examen ASSP",
    scegli: "Choisir la zone d'étude",
    l1: '1er Niveau', l1sub: 'Vin · Bière · Spiritueux',
    l2: '2e Niveau', l2sub: 'Œnologie internationale',
    tutto: 'Tout', tuttosub: 'Tous les niveaux',
    progressi_btn: '📊 Vos progrès',
    scegli_cat: 'Choisir le sujet',
    cat_vino: '🍷 Vin', cat_birra: '🍺 Bière', cat_dist: '🥃 Spiritueux', cat_tutto: '🎯 Tout le niveau',
    scegli_cat_l2: 'Choisir la zone géographique',
    cat_italia: '🇮🇹 Italie',
    cat_italia_nord_ovest: 'Nord-Ouest (VdA, Piémont, Lombardie, Ligurie)',
    cat_italia_nord_est: 'Nord-Est (Vénétie, TAA, Frioul, Émilie)',
    cat_italia_centro: 'Centre (Toscane, Marches, Ombrie, Latium)',
    cat_italia_sud: 'Sud (Abruzzes, Molise, Campanie, Pouilles, Basilicate)',
    cat_italia_isole: 'Îles (Calabre, Sicile, Sardaigne)',
    cat_tutto_l2: '🎯 Toute l\'Italie',
    indietro: '← Retour',
    caricamento: 'Claude prépare les questions…',
    caricamento_sub: 'Basé sur vos notes du cours ASSP',
    dom_label_vf: 'Vrai / Faux', dom_label_m: 'Choix multiple', dom_label_a: 'Réponse ouverte',
    vero: 'VRAI', falso: 'FAUX',
    scrivi: 'Écrivez votre réponse ici…',
    classifica_istr: 'Sélectionnez blanc ou rouge pour chaque cépage :',
    bianco: 'Blanc', rosso: 'Rouge',
    mappa_istr: 'Associez chaque élément à sa zone géographique :',
    parziale: 'partiellement correct',
    conferma: 'Confirmer la réponse',
    correzione: 'Correction en cours…',
    corretta: '✓ Correct !', sbagliata: '✗ Incorrect',
    risposta_giusta: 'Bonne réponse :',
    spiegazione: 'Explication :',
    feedback: 'Retour :',
    punti_mancati: 'Points manquants :',
    punti_chiave: 'Points clés :',
    avanti: 'Question suivante →',
    fine: 'Voir les résultats →',
    domanda_n: 'Question',
    di: 'sur',
    risultati_titolo: 'Résultats de la session',
    corrette_su: 'correctes sur',
    nuova: 'Nouvelle session',
    torna: 'Retour au menu',
    progressi_titolo: 'Vos progrès',
    nessun_prog: 'Aucune session complétée. Commencez à étudier !',
    risposte: 'réponses',
    errore_torna: 'Réessayer',
  },
}

function tx(key) { return (TX[getLingua()] || TX.it)[key] || key }

// ─── Stili comuni ─────────────────────────────────────────────────────────────
const card = { background: '#fff', border: `1px solid ${chiaro}`, borderRadius: 14, padding: 18, marginBottom: 12 }
const btnBase = { display: 'block', width: '100%', border: 'none', borderRadius: 12, padding: '14px 16px', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: '"DM Sans", sans-serif', textAlign: 'left' }
const btnPrimary = { ...btnBase, background: terra, color: '#fff' }
const btnOutline = { ...btnBase, background: '#fff', color: scuro, border: `1.5px solid ${chiaro}` }
const label10 = { fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: oro, display: 'block', marginBottom: 10 }

// ─── Componente principale ────────────────────────────────────────────────────
export default function Learning() {
  const [vista, setVista] = useState('menu')
  const [loading, setLoading] = useState(false)
  const [errore, setErrore] = useState('')
  const [sessId, setSessId] = useState(null)
  const [sessLivello, setSessLivello] = useState(null)
  const [sessCategoria, setSessCategoria] = useState(null)
  const [domande, setDomande] = useState([])
  const [idx, setIdx] = useState(0)
  const [feedback, setFeedback] = useState(null)
  const [testo, setTesto] = useState('')
  const [nCorrQ, setNCorrQ] = useState(0)
  const [tStart, setTStart] = useState(0)
  const [sessStart, setSessStart] = useState(0)
  const [progressi, setProgressi] = useState([])

  // Domanda libera
  const [dlDomanda, setDlDomanda] = useState('')
  const [dlRisposta, setDlRisposta] = useState('')
  const [dlFonteEsterna, setDlFonteEsterna] = useState(false)
  const [dlLoading, setDlLoading] = useState(false)


  const [classificaRisposte, setClassificaRisposte] = useState({})
  const [abbinamentoRisposte, setAbbinamentoRisposte] = useState({})
  const [mappaRisposte, setMappaRisposte] = useState({})

  const dom = domande[idx] || null

  // ── Avvia sessione ───────────────────────────────────────────────
  async function avvia(livello, categoria) {
    setLoading(true)
    setErrore('')
    setVista('loading')
    try {
      const d = await api('genera_domande', { livello, categoria, lingua: getLingua() })
      setSessId(d.sessione_id)
      setSessLivello(livello)
      setSessCategoria(categoria)
      setDomande(d.domande)
      setIdx(0)
      setNCorrQ(0)
      setFeedback(null)
      setTesto('')
      setClassificaRisposte({})
      setAbbinamentoRisposte({})
      setMappaRisposte({})
      setTStart(Date.now())
      setSessStart(Date.now())
      setVista('gioco')
    } catch (e) {
      setErrore(e.message)
      setVista('errore')
    }
    setLoading(false)
  }


  // ── Correggi classifica colore ───────────────────────────────────
  async function correggiClassifica() {
    if (feedback) return
    const giuste = dom.risposta_giusta
    let nCorr = 0
    Object.keys(giuste).forEach(v => { if (classificaRisposte[v] === giuste[v]) nCorr++ })
    const tot = Object.keys(giuste).length
    const ok = nCorr === tot
    if (ok) setNCorrQ(n => n + 1)
    setFeedback({ ok, scelta: classificaRisposte, spiegazione: dom.spiegazione, parziale: `${nCorr}/${tot}` })
    try {
      await api('salva_risposta', {
        sessione_id: sessId, argomento: dom.argomento, tipo_domanda: dom.tipo,
        domanda: dom.domanda, risposta_utente: JSON.stringify(classificaRisposte),
        risposta_giusta: JSON.stringify(giuste), corretta: ok,
        spiegazione: dom.spiegazione, tempo_ms: Date.now() - tStart,
      })
    } catch (_) {}
  }

  // ── Correggi abbinamento ─────────────────────────────────────────
  async function correggiAbbinamento() {
    if (feedback) return
    let nCorr = 0
    dom.coppie.forEach(({ sx, dx }) => { if (abbinamentoRisposte[sx] === dx) nCorr++ })
    const tot = dom.coppie.length
    const ok = nCorr === tot
    if (ok) setNCorrQ(n => n + 1)
    setFeedback({ ok, scelta: abbinamentoRisposte, spiegazione: dom.spiegazione, parziale: `${nCorr}/${tot}` })
    try {
      await api('salva_risposta', {
        sessione_id: sessId, argomento: dom.argomento, tipo_domanda: dom.tipo,
        domanda: dom.domanda, risposta_utente: JSON.stringify(abbinamentoRisposte),
        risposta_giusta: JSON.stringify(Object.fromEntries(dom.coppie.map(({sx,dx}) => [sx,dx]))),
        corretta: ok, spiegazione: dom.spiegazione, tempo_ms: Date.now() - tStart,
      })
    } catch (_) {}
  }

  // ── Correggi mappa ───────────────────────────────────────────────
  async function correggiMappa() {
    if (feedback) return
    const giuste = dom.risposta_giusta
    let nCorr = 0
    dom.elementi.forEach(el => { if (mappaRisposte[el] === giuste[el]) nCorr++ })
    const tot = dom.elementi.length
    const ok = nCorr === tot
    if (ok) setNCorrQ(n => n + 1)
    setFeedback({ ok, scelta: mappaRisposte, spiegazione: dom.spiegazione, parziale: `${nCorr}/${tot}` })
    try {
      await api('salva_risposta', {
        sessione_id: sessId, argomento: dom.argomento, tipo_domanda: dom.tipo,
        domanda: dom.domanda, risposta_utente: JSON.stringify(mappaRisposte),
        risposta_giusta: JSON.stringify(giuste), corretta: ok,
        spiegazione: dom.spiegazione, tempo_ms: Date.now() - tStart,
      })
    } catch (_) {}
  }

  // ── Rispondi a V/F o multipla ────────────────────────────────────
  async function rispondi(scelta) {
    if (feedback) return
    const ok = scelta === dom.risposta_giusta
    setFeedback({ ok, scelta, giusta: dom.risposta_giusta, spiegazione: dom.spiegazione })
    if (ok) setNCorrQ(n => n + 1)
    try {
      await api('salva_risposta', {
        sessione_id: sessId, argomento: dom.argomento, tipo_domanda: dom.tipo,
        domanda: dom.domanda, risposta_utente: scelta, risposta_giusta: dom.risposta_giusta,
        corretta: ok, spiegazione: dom.spiegazione, tempo_ms: Date.now() - tStart,
      })
    } catch (_) {}
  }

  // ── Invia risposta aperta ────────────────────────────────────────
  async function inviaAperta() {
    if (feedback || !testo.trim()) return
    setFeedback({ loading: true })
    try {
      const corr = await api('correggi_aperta', {
        domanda: dom.domanda, risposta_modello: dom.risposta_modello,
        punti_chiave: dom.punti_chiave, risposta_utente: testo.trim(), lingua: getLingua(),
      })
      setFeedback({ ...corr, ok: corr.corretta, scelta: testo.trim() })
      if (corr.corretta) setNCorrQ(n => n + 1)
      await api('salva_risposta', {
        sessione_id: sessId, argomento: dom.argomento, tipo_domanda: dom.tipo,
        domanda: dom.domanda, risposta_utente: testo.trim(), risposta_giusta: dom.risposta_modello,
        corretta: corr.corretta, spiegazione: corr.feedback, tempo_ms: Date.now() - tStart,
      })
    } catch (e) {
      setFeedback({ ok: false, scelta: testo.trim(), spiegazione: 'Errore correzione', loading: false })
    }
  }

  // ── Avanti ───────────────────────────────────────────────────────
  async function avanti() {
    if (idx < domande.length - 1) {
      setIdx(i => i + 1)
      setFeedback(null)
      setTesto('')
      setTStart(Date.now())
    } else {
      // Fine sessione
      const durata = Math.round((Date.now() - sessStart) / 1000)
      try { await api('chiudi_sessione', { sessione_id: sessId, n_corrette: nCorrQ, durata_sec: durata }) } catch (_) {}
      setVista('risultati')
    }
  }

  // ── Progressi ────────────────────────────────────────────────────
  async function apriProgressi() {
    setLoading(true)
    try {
      const d = await api('get_progressi', {})
      setProgressi(d.progressi || [])
      setVista('progressi')
    } catch (e) {
      setErrore(e.message)
      setVista('errore')
    }
    setLoading(false)
  }

  // ── Domanda libera ───────────────────────────────────────────────
  async function chiediAI() {
    if (!dlDomanda.trim()) return
    setDlLoading(true)
    setDlRisposta('')
    setDlFonteEsterna(false)
    try {
      const { data: kb } = await supabase.from('learning_kb').select('argomento, contenuto').eq('attivo', true).order('ordine')
      const kbText = (kb || []).map(r => `=== ${r.argomento} ===\n${r.contenuto}`).join('\n\n')
      const d = await api('domanda_libera', { domanda: dlDomanda.trim(), kb_context: kbText })
      setDlRisposta(d.risposta)
      setDlFonteEsterna(d.fonte_esterna)
    } catch (e) {
      setDlRisposta('Errore: ' + e.message)
    }
    setDlLoading(false)
  }

  // ════════════════════════════════════════════════════════════════
  // RENDER
  // ════════════════════════════════════════════════════════════════

  // ── Vista domanda libera ─────────────────────────────────────────
  if (vista === 'domanda_libera') {
    const cardDL = { background: '#fff', border: `1px solid ${chiaro}`, borderRadius: 14, padding: '12px 14px', marginBottom: 8 }
    const btnPDL = { width: '100%', padding: '12px 14px', background: terra, color: '#fff', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: '"DM Sans",sans-serif' }
    return (
      <div style={{ paddingBottom: 40 }}>
        <button style={{ background: 'none', border: 'none', color: oro, fontSize: 13, cursor: 'pointer', padding: '0 0 16px', fontFamily: '"DM Sans", sans-serif' }}
          onClick={() => { setVista('menu'); setDlDomanda(''); setDlRisposta('') }}>
          ← Indietro
        </button>
        <div style={{ fontSize: 16, fontWeight: 700, color: scuro, marginBottom: 4 }}>💬 Fammi una domanda</div>
        <div style={{ fontSize: 12, color: medio, marginBottom: 20, lineHeight: 1.5 }}>
          Rispondo usando esclusivamente i tuoi appunti ASSP. Se uso fonti esterne, te lo segnalo.
        </div>
        <div style={{ ...cardDL, borderColor: terra }}>
          <textarea value={dlDomanda} onChange={e => setDlDomanda(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); chiediAI() } }}
            placeholder="Es. Qual è la differenza tra Barolo e Barbaresco? Quante DOCG ha il Veneto?"
            style={{ width: '100%', border: 'none', outline: 'none', fontSize: 14, color: scuro,
              background: 'transparent', fontFamily: '"DM Sans",sans-serif',
              resize: 'none', minHeight: 80, lineHeight: 1.5, boxSizing: 'border-box' }} />
        </div>
        <button style={{ ...btnPDL, opacity: dlLoading || !dlDomanda.trim() ? 0.6 : 1 }}
          onClick={chiediAI} disabled={dlLoading || !dlDomanda.trim()}>
          {dlLoading ? '⏳ Cerco la risposta…' : 'Chiedi →'}
        </button>
        {dlRisposta && (
          <div style={{ marginTop: 16 }}>
            {dlFonteEsterna && (
              <div style={{ ...cardDL, borderColor: '#C77B13', background: '#FFF8EE', marginBottom: 8 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#C77B13', letterSpacing: 1, textTransform: 'uppercase' }}>
                  ⚠️ Contiene informazioni da fonti esterne agli appunti
                </div>
              </div>
            )}
            <div style={{ ...cardDL, borderColor: verde }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: verde, marginBottom: 8, letterSpacing: 1, textTransform: 'uppercase' }}>Risposta</div>
              <div style={{ fontSize: 14, color: scuro, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{dlRisposta}</div>
            </div>
            <button style={{ ...btnPDL, background: '#fff', color: scuro, border: `1.5px solid ${chiaro}`, marginTop: 4 }}
              onClick={() => { setDlDomanda(''); setDlRisposta('') }}>
              Nuova domanda
            </button>
          </div>
        )}
      </div>
    )
  }

  // ── Menu principale ──────────────────────────────────────────────
  if (vista === 'menu') return (
    <div style={{ paddingBottom: 40 }}>
      <div style={{ fontSize: 12, color: medio, marginBottom: 24 }}>{tx('sottotitolo')}</div>

      <span style={label10}>{tx('scegli')}</span>

      {/* 1° Livello */}
      <button style={{ ...card, display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', cursor: 'pointer', border: `1.5px solid ${chiaro}` }}
        onClick={() => setVista('categorie')}>
        <div style={{ textAlign: 'left' }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: scuro, marginBottom: 3 }}>{tx('l1')}</div>
          <div style={{ fontSize: 12, color: medio }}>{tx('l1sub')}</div>
        </div>
        <span style={{ fontSize: 18, color: oro }}>→</span>
      </button>

      {/* 2° Livello */}
      <button style={{ ...card, display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', cursor: 'pointer', border: `1.5px solid ${chiaro}` }}
        onClick={() => setVista('cat_l2')}>
        <div style={{ textAlign: 'left' }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: scuro, marginBottom: 3 }}>{tx('l2')}</div>
          <div style={{ fontSize: 12, color: medio }}>{tx('l2sub')}</div>
        </div>
        <span style={{ fontSize: 18, color: oro }}>→</span>
      </button>

      {/* Tutto */}
      <button style={{ ...card, display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', cursor: 'pointer', border: `1.5px solid ${chiaro}` }}
        onClick={() => avvia(null, null)}>
        <div style={{ textAlign: 'left' }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: scuro, marginBottom: 3 }}>{tx('tutto')}</div>
          <div style={{ fontSize: 12, color: medio }}>{tx('tuttosub')}</div>
        </div>
        <span style={{ fontSize: 18, color: oro }}>→</span>
      </button>



      {/* Progressi */}
      <button style={{ ...card, display: 'flex', alignItems: 'center', gap: 12, width: '100%', cursor: 'pointer', border: `1.5px solid ${chiaro}`, marginTop: 8 }}
        onClick={apriProgressi}>
        <span style={{ fontSize: 24 }}>📊</span>
        <div style={{ textAlign: 'left' }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: scuro }}>{tx('progressi_titolo')}</div>
          <div style={{ fontSize: 12, color: medio }}>Storico e aree da migliorare</div>
        </div>
      </button>

      {/* Fammi una domanda */}
      <button style={{ ...card, display: 'flex', alignItems: 'center', gap: 12, width: '100%', cursor: 'pointer', border: `1.5px solid ${chiaro}`, marginTop: 4 }}
        onClick={() => { setDlDomanda(''); setDlRisposta(''); setVista('domanda_libera') }}>
        <span style={{ fontSize: 24 }}>💬</span>
        <div style={{ textAlign: 'left' }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: scuro }}>Fammi una domanda</div>
          <div style={{ fontSize: 12, color: medio }}>Chiedi qualsiasi cosa sugli appunti ASSP</div>
        </div>
      </button>
    </div>
  )


  // ── Categorie L2 ─────────────────────────────────────────────────
  if (vista === 'cat_l2') return (
    <div style={{ paddingBottom: 40 }}>
      <button style={{ background: 'none', border: 'none', color: oro, fontSize: 13, cursor: 'pointer', padding: '0 0 16px', fontFamily: '"DM Sans", sans-serif' }}
        onClick={() => setVista('menu')}>{tx('indietro')}</button>

      <span style={label10}>{tx('scegli_cat_l2')}</span>

      {[
        { label: tx('cat_italia_nord_ovest'), arg: 'italia_nord_ovest' },
        { label: tx('cat_italia_nord_est'),   arg: 'italia_nord_est' },
        { label: tx('cat_italia_centro'),      arg: 'italia_centro' },
        { label: tx('cat_italia_sud'),         arg: 'italia_sud' },
        { label: tx('cat_italia_isole'),       arg: 'italia_isole' },
        { label: tx('cat_tutto_l2'),           arg: null },
      ].map(({ label, arg }) => (
        <button key={label}
          style={{ ...card, display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', cursor: 'pointer', border: `1.5px solid ${chiaro}` }}
          onClick={() => avvia(2, arg)}>
          <span style={{ fontSize: 14, fontWeight: 600, color: scuro, textAlign: 'left', lineHeight: 1.4 }}>{label}</span>
          <span style={{ color: oro, flexShrink: 0, marginLeft: 8 }}>→</span>
        </button>
      ))}
    </div>
  )

  // ── Categorie L1 ─────────────────────────────────────────────────
  if (vista === 'categorie') return (
    <div style={{ paddingBottom: 40 }}>
      <button style={{ background: 'none', border: 'none', color: oro, fontSize: 13, cursor: 'pointer', padding: '0 0 16px', fontFamily: '"DM Sans", sans-serif' }}
        onClick={() => setVista('menu')}>{tx('indietro')}</button>

      <span style={label10}>{tx('scegli_cat')}</span>

      {[
        { label: tx('cat_vino'),  cat: 'vino' },
        { label: tx('cat_birra'), cat: 'birra' },
        { label: tx('cat_dist'),  cat: 'distillati' },
        { label: tx('cat_tutto'), cat: null },
      ].map(({ label, cat }) => (
        <button key={label}
          style={{ ...card, display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', cursor: 'pointer', border: `1.5px solid ${chiaro}` }}
          onClick={() => avvia(cat ? 1 : null, cat)}>
          <span style={{ fontSize: 15, fontWeight: 600, color: scuro }}>{label}</span>
          <span style={{ color: oro }}>→</span>
        </button>
      ))}
    </div>
  )

  // ── Loading ──────────────────────────────────────────────────────
  if (vista === 'loading') return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 360, gap: 16 }}>
      <div style={{ fontSize: 48 }}>🎓</div>
      <div style={{ fontSize: 16, fontWeight: 700, color: scuro }}>{tx('caricamento')}</div>
      <div style={{ fontSize: 13, color: medio, textAlign: 'center', maxWidth: 260, lineHeight: 1.5 }}>{tx('caricamento_sub')}</div>
    </div>
  )

  // ── Errore ───────────────────────────────────────────────────────
  if (vista === 'errore') return (
    <div style={{ paddingBottom: 40 }}>
      <div style={{ background: '#FDF0EE', border: `1px solid ${terra}44`, borderRadius: 12, padding: 16, marginBottom: 16, color: terra, fontSize: 14, lineHeight: 1.5 }}>
        ⚠️ {errore}
      </div>
      <button style={btnPrimary} onClick={() => setVista('menu')}>{tx('torna')}</button>
    </div>
  )

  // ── Gioco ────────────────────────────────────────────────────────
  if (vista === 'gioco' && dom) {
    const fb = feedback && !feedback.loading
    const isOk = fb && feedback.ok

    return (
      <div style={{ paddingBottom: 40 }}>

        {/* Progress */}
        <div style={{ height: 4, background: chiaro, borderRadius: 2, marginBottom: 16 }}>
          <div style={{ height: '100%', background: terra, borderRadius: 2, width: `${((idx + 1) / domande.length) * 100}%`, transition: 'width 0.3s' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: medio, marginBottom: 16 }}>
          <span style={{ fontWeight: 700, color: scuro }}>{tx('domanda_n')} {idx + 1} {tx('di')} {domande.length}</span>
          <span>{nCorrQ} ✓</span>
        </div>

        {/* Domanda */}
        <div style={{ ...card, borderLeft: `4px solid ${terra}` }}>
          <span style={{ ...label10, marginBottom: 8 }}>
            {dom.tipo === 'vero_falso' ? tx('dom_label_vf') : dom.tipo === 'multipla' ? tx('dom_label_m') : dom.tipo === 'aperta' || dom.tipo === 'elenco' ? tx('dom_label_a') : dom.tipo === 'classifica_colore' ? tx('classifica_istr').split(':')[0] : dom.tipo === 'abbinamento' ? 'Abbinamento' : dom.tipo === 'mappa' ? 'Mappa geografica' : tx('dom_label_a')}
          </span>
          <div style={{ fontSize: 16, fontWeight: 600, color: scuro, lineHeight: 1.6 }}>{dom.domanda}</div>
        </div>

        {/* Vero/Falso */}
        {dom.tipo === 'vero_falso' && (
          <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
            {['V', 'F'].map(opt => {
              const isScelta = fb && feedback.scelta === opt
              const isGiusta = fb && feedback.giusta === opt
              const bg = !fb ? '#fff' : isGiusta ? verde : isScelta ? rosso : '#fff'
              const border = !fb ? chiaro : isGiusta ? verde : isScelta ? rosso : chiaro
              return (
                <button key={opt} disabled={!!feedback} onClick={() => rispondi(opt)}
                  style={{ flex: 1, padding: 18, border: `2px solid ${border}`, borderRadius: 12, background: bg, color: fb && (isGiusta || isScelta) ? '#fff' : scuro, fontSize: 15, fontWeight: 700, cursor: feedback ? 'default' : 'pointer', transition: 'all 0.2s', fontFamily: '"DM Sans", sans-serif' }}>
                  {opt === 'V' ? tx('vero') : tx('falso')}
                </button>
              )
            })}
          </div>
        )}

        {/* Multipla */}
        {dom.tipo === 'multipla' && (
          <div style={{ marginBottom: 14 }}>
            {['A', 'B', 'C', 'D'].map(opt => {
              const isScelta = fb && feedback.scelta === opt
              const isGiusta = fb && feedback.giusta === opt
              const bg = !fb ? '#fff' : isGiusta ? verde : isScelta ? rosso : '#fff'
              const border = !fb ? chiaro : isGiusta ? verde : isScelta ? rosso : chiaro
              return (
                <button key={opt} disabled={!!feedback} onClick={() => rispondi(opt)}
                  style={{ display: 'block', width: '100%', marginBottom: 8, padding: '12px 14px', border: `1.5px solid ${border}`, borderRadius: 10, background: bg, color: fb && (isGiusta || isScelta) ? '#fff' : scuro, fontSize: 14, textAlign: 'left', cursor: feedback ? 'default' : 'pointer', transition: 'all 0.2s', fontFamily: '"DM Sans", sans-serif' }}>
                  <span style={{ fontWeight: 700, marginRight: 8 }}>{opt}.</span>{dom.opzioni[opt]}
                </button>
              )
            })}
          </div>
        )}

        {/* Aperta */}
        {(dom.tipo === 'aperta' || dom.tipo === 'elenco') && !feedback && (
          <div style={{ marginBottom: 14 }}>
            <textarea value={testo} onChange={e => setTesto(e.target.value)} rows={5}
              placeholder={tx('scrivi')}
              style={{ display: 'block', width: '100%', padding: '12px 14px', border: `1.5px solid ${chiaro}`, borderRadius: 12, fontSize: 14, color: scuro, resize: 'none', fontFamily: '"DM Sans", sans-serif', boxSizing: 'border-box', lineHeight: 1.6, background: '#fff' }} />
            <button style={{ ...btnPrimary, marginTop: 10, opacity: testo.trim() ? 1 : 0.5 }}
              disabled={!testo.trim()} onClick={inviaAperta}>
              {tx('conferma')}
            </button>
          </div>
        )}


        {/* Classifica colore */}
        {dom.tipo === 'classifica_colore' && !feedback && (
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12, color: medio, marginBottom: 12, lineHeight: 1.5 }}>
              {tx('classifica_istr')}
            </div>
            {dom.vitigni.map(v => (
              <div key={v} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', ...card, padding: '10px 14px', marginBottom: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: scuro }}>{v}</span>
                <div style={{ display: 'flex', gap: 8 }}>
                  {['bianco', 'rosso'].map(col => {
                    const sel = (classificaRisposte[v] === col)
                    return (
                      <button key={col} onClick={() => setClassificaRisposte(prev => ({ ...prev, [v]: col }))}
                        style={{ padding: '6px 14px', borderRadius: 20, border: `1.5px solid ${sel ? (col === 'bianco' ? '#B8956A' : '#9B2335') : chiaro}`, background: sel ? (col === 'bianco' ? '#FDF5E8' : '#FDF0EE') : '#fff', color: sel ? (col === 'bianco' ? '#8B6A2A' : '#9B2335') : medio, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: '"DM Sans", sans-serif' }}>
                        {col === 'bianco' ? '⬜ ' + tx('bianco') : '🟥 ' + tx('rosso')}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
            <button style={{ ...btnPrimary, marginTop: 10, opacity: Object.keys(classificaRisposte).length === dom.vitigni.length ? 1 : 0.5 }}
              disabled={Object.keys(classificaRisposte).length !== dom.vitigni.length}
              onClick={() => correggiClassifica()}>
              {tx('conferma')}
            </button>
          </div>
        )}

        {/* Classifica colore — feedback */}
        {dom.tipo === 'classifica_colore' && feedback && (
          <div style={{ marginBottom: 14 }}>
            {dom.vitigni.map(v => {
              const giusta = dom.risposta_giusta[v]
              const data_ris = feedback.dettaglio?.[v] || {}
              const ok = feedback.scelta?.[v] === giusta
              return (
                <div key={v} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', ...card, padding: '10px 14px', marginBottom: 8, background: ok ? '#F0F9F4' : '#FDF0EE', border: `1px solid ${ok ? verde : rosso}33` }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: scuro }}>{v}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {!ok && <span style={{ fontSize: 12, color: rosso, textDecoration: 'line-through' }}>{feedback.scelta?.[v]}</span>}
                    <span style={{ fontSize: 12, fontWeight: 700, color: ok ? verde : rosso }}>{giusta}</span>
                    <span>{ok ? '✓' : '✗'}</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Abbinamento */}
        {dom.tipo === 'abbinamento' && !feedback && (
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12, color: medio, marginBottom: 10 }}>
              <span style={{ fontWeight: 700 }}>{dom.istruzione_sx}</span> → <span style={{ fontWeight: 700 }}>{dom.istruzione_dx}</span>
            </div>
            {dom.coppie.map(({ sx }, i) => (
              <div key={sx} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <div style={{ flex: '0 0 40%', ...card, padding: '8px 12px', margin: 0, fontSize: 13, fontWeight: 600, color: scuro }}>{sx}</div>
                <span style={{ color: medio }}>→</span>
                <select value={abbinamentoRisposte[sx] || ''}
                  onChange={e => setAbbinamentoRisposte(prev => ({ ...prev, [sx]: e.target.value }))}
                  style={{ flex: 1, padding: '8px 10px', border: `1.5px solid ${chiaro}`, borderRadius: 10, fontSize: 13, color: scuro, background: '#fff', fontFamily: '"DM Sans", sans-serif' }}>
                  <option value=''>—</option>
                  {dom.coppie.map(({ dx }) => <option key={dx} value={dx}>{dx}</option>)}
                </select>
              </div>
            ))}
            <button style={{ ...btnPrimary, marginTop: 10, opacity: Object.keys(abbinamentoRisposte).length === dom.coppie.length ? 1 : 0.5 }}
              disabled={Object.keys(abbinamentoRisposte).length !== dom.coppie.length}
              onClick={() => correggiAbbinamento()}>
              {tx('conferma')}
            </button>
          </div>
        )}

        {/* Abbinamento — feedback */}
        {dom.tipo === 'abbinamento' && feedback && (
          <div style={{ marginBottom: 14 }}>
            {dom.coppie.map(({ sx, dx }) => {
              const ok = feedback.scelta?.[sx] === dx
              return (
                <div key={sx} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <div style={{ flex: '0 0 40%', ...card, padding: '8px 12px', margin: 0, fontSize: 13, fontWeight: 600, color: scuro }}>{sx}</div>
                  <span>→</span>
                  <div style={{ flex: 1, ...card, padding: '8px 12px', margin: 0, fontSize: 13, background: ok ? '#F0F9F4' : '#FDF0EE', border: `1px solid ${ok ? verde : rosso}33` }}>
                    {!ok && <span style={{ color: rosso, textDecoration: 'line-through', marginRight: 6 }}>{feedback.scelta?.[sx]}</span>}
                    <span style={{ fontWeight: 700, color: ok ? verde : rosso }}>{dx}</span> {ok ? '✓' : '✗'}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Mappa geografica */}
        {dom.tipo === 'mappa' && !feedback && (
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12, color: medio, marginBottom: 12 }}>{tx('mappa_istr')}</div>
            {dom.elementi.map(el => {
              const aree = [...new Set(Object.values(dom.risposta_giusta))]
              return (
                <div key={el} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <div style={{ flex: '0 0 45%', ...card, padding: '8px 12px', margin: 0, fontSize: 13, fontWeight: 600, color: scuro }}>{el}</div>
                  <span style={{ color: medio }}>→</span>
                  <select value={mappaRisposte[el] || ''}
                    onChange={e => setMappaRisposte(prev => ({ ...prev, [el]: e.target.value }))}
                    style={{ flex: 1, padding: '8px 10px', border: `1.5px solid ${chiaro}`, borderRadius: 10, fontSize: 13, color: scuro, background: '#fff', fontFamily: '"DM Sans", sans-serif' }}>
                    <option value=''>—</option>
                    {aree.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
              )
            })}
            <button style={{ ...btnPrimary, marginTop: 10, opacity: Object.keys(mappaRisposte).length === dom.elementi.length ? 1 : 0.5 }}
              disabled={Object.keys(mappaRisposte).length !== dom.elementi.length}
              onClick={() => correggiMappa()}>
              {tx('conferma')}
            </button>
          </div>
        )}

        {/* Mappa — feedback */}
        {dom.tipo === 'mappa' && feedback && (
          <div style={{ marginBottom: 14 }}>
            {dom.elementi.map(el => {
              const giusta = dom.risposta_giusta[el]
              const ok = feedback.scelta?.[el] === giusta
              return (
                <div key={el} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <div style={{ flex: '0 0 45%', ...card, padding: '8px 12px', margin: 0, fontSize: 13, fontWeight: 600, color: scuro }}>{el}</div>
                  <span>→</span>
                  <div style={{ flex: 1, ...card, padding: '8px 12px', margin: 0, fontSize: 13, background: ok ? '#F0F9F4' : '#FDF0EE', border: `1px solid ${ok ? verde : rosso}33` }}>
                    {!ok && <span style={{ color: rosso, textDecoration: 'line-through', marginRight: 6 }}>{feedback.scelta?.[el]}</span>}
                    <span style={{ fontWeight: 700, color: ok ? verde : rosso }}>{giusta}</span> {ok ? '✓' : '✗'}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Correzione in corso */}
        {feedback?.loading && (
          <div style={{ ...card, textAlign: 'center', color: medio, background: '#F5EDE0' }}>{tx('correzione')}</div>
        )}

        {/* Feedback */}
        {fb && (
          <div style={{ ...card, background: isOk ? '#F0F9F4' : '#FDF0EE', border: `1px solid ${isOk ? verde : rosso}33`, marginBottom: 14 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: isOk ? verde : rosso, marginBottom: 12 }}>
              {isOk ? tx('corretta') : tx('sbagliata')}
            </div>

            {dom.tipo !== 'aperta' && !isOk && (
              <div style={{ marginBottom: 10 }}>
                <span style={{ fontSize: 12, color: medio }}>{tx('risposta_giusta')} </span>
                <span style={{ fontWeight: 700, color: verde }}>
                  {feedback.giusta === 'V' ? tx('vero') : feedback.giusta === 'F' ? tx('falso') : `${feedback.giusta}. ${dom.opzioni?.[feedback.giusta] || ''}`}
                </span>
              </div>
            )}

            {(dom.tipo !== 'aperta' && dom.tipo !== 'elenco' && dom.tipo !== 'classifica_colore' && dom.tipo !== 'abbinamento' && dom.tipo !== 'mappa') && (
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: medio, marginBottom: 4 }}>{tx('spiegazione')}</div>
                <div style={{ fontSize: 13, color: scuro, lineHeight: 1.6 }}>{dom.spiegazione}</div>
              </div>
            )}

            {dom.tipo === 'aperta' && (
              <>
                {feedback.punti_mancati?.length > 0 && (
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: rosso, marginBottom: 4 }}>{tx('punti_mancati')}</div>
                    {feedback.punti_mancati.map((p, i) => <div key={i} style={{ fontSize: 13, color: scuro, paddingLeft: 8, marginBottom: 2 }}>• {p}</div>)}
                  </div>
                )}
                <div style={{ fontSize: 12, fontWeight: 700, color: medio, marginBottom: 4 }}>{tx('feedback')}</div>
                <div style={{ fontSize: 13, color: scuro, lineHeight: 1.6, marginBottom: 12 }}>{feedback.feedback}</div>
                <div style={{ background: '#fff', borderRadius: 8, padding: 12, border: `1px solid ${chiaro}` }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: oro, marginBottom: 6 }}>{tx('punti_chiave')}</div>
                  {dom.punti_chiave?.map((p, i) => <div key={i} style={{ fontSize: 13, color: scuro, marginBottom: 2 }}>• {p}</div>)}
                </div>
              </>
            )}
          </div>
        )}


            {feedback?.parziale && (dom.tipo === 'classifica_colore' || dom.tipo === 'abbinamento' || dom.tipo === 'mappa') && (
              <div style={{ fontSize: 13, color: medio, marginBottom: 8 }}>{feedback.parziale} corrette</div>
            )}
            {feedback?.spiegazione && (dom.tipo === 'classifica_colore' || dom.tipo === 'abbinamento' || dom.tipo === 'mappa') && (
              <div style={{ fontSize: 12, color: scuro, lineHeight: 1.6, marginTop: 8 }}>
                <span style={{ fontWeight: 700, color: medio }}>{tx('spiegazione')} </span>{feedback.spiegazione}
              </div>
            )}

        {fb && (
          <button style={btnPrimary} onClick={avanti}>
            {idx < domande.length - 1 ? tx('avanti') : tx('fine')}
          </button>
        )}
      </div>
    )
  }

  // ── Risultati ────────────────────────────────────────────────────
  if (vista === 'risultati') {
    const pct = Math.round((nCorrQ / domande.length) * 100)
    const emoji = pct >= 80 ? '🏆' : pct >= 60 ? '📚' : '💪'
    const col = pct >= 80 ? verde : pct >= 60 ? giallo : rosso
    return (
      <div style={{ paddingBottom: 40 }}>
        <div style={{ ...card, textAlign: 'center', padding: 32, marginBottom: 20 }}>
          <div style={{ fontSize: 52, marginBottom: 12 }}>{emoji}</div>
          <div style={{ fontSize: 13, color: medio, marginBottom: 4 }}>{tx('risultati_titolo')}</div>
          <div style={{ fontSize: 60, fontWeight: 800, color: col, fontFamily: '"DM Sans", sans-serif', lineHeight: 1 }}>{pct}%</div>
          <div style={{ fontSize: 15, color: scuro, marginTop: 8 }}>{nCorrQ} {tx('corrette_su')} {domande.length}</div>
        </div>
        <button style={{ ...btnPrimary, marginBottom: 10 }} onClick={() => avvia(sessLivello, sessCategoria)}>{tx('nuova')}</button>
        <button style={btnOutline} onClick={() => setVista('menu')}>{tx('torna')}</button>
      </div>
    )
  }

  // ── Progressi ────────────────────────────────────────────────────
  if (vista === 'progressi') return (
    <div style={{ paddingBottom: 40 }}>
      <button style={{ background: 'none', border: 'none', color: oro, fontSize: 13, cursor: 'pointer', padding: '0 0 16px', fontFamily: '"DM Sans", sans-serif' }}
        onClick={() => setVista('menu')}>{tx('indietro')}</button>

      <span style={label10}>{tx('progressi_titolo')}</span>

      {progressi.length === 0 ? (
        <div style={{ ...card, textAlign: 'center', padding: 32 }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>📊</div>
          <div style={{ fontSize: 14, color: medio }}>{tx('nessun_prog')}</div>
        </div>
      ) : progressi.map(p => {
        const col = p.pct_corretto >= 80 ? verde : p.pct_corretto >= 60 ? giallo : rosso
        return (
          <div key={p.id} style={{ ...card, display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 50, height: 50, borderRadius: '50%', border: `2.5px solid ${col}`, background: `${col}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: col }}>{p.pct_corretto}%</span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: scuro, marginBottom: 4 }}>{p.argomento.replace(/_/g, ' ')}</div>
              <div style={{ height: 4, background: chiaro, borderRadius: 2 }}>
                <div style={{ height: '100%', background: col, borderRadius: 2, width: `${p.pct_corretto}%` }} />
              </div>
              <div style={{ fontSize: 11, color: medio, marginTop: 3 }}>{p.n_corrette}/{p.n_risposte} {tx('risposte')}</div>
            </div>
          </div>
        )
      })}
    </div>
  )

  return null
}

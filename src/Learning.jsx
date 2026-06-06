import { useState, useEffect, useRef } from 'react'
import { supabase } from './supabase'
import { useT } from './useT'
import { getLingua } from './i18n'

// ── Chiamata API ──────────────────────────────────────────────────────────────
async function learningCall(action, payload = {}) {
  const { data: { session } } = await supabase.auth.getSession()
  const res = await fetch('/api/learning', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
    body: JSON.stringify({ action, payload }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error)
  return data
}

// ── Colori e costanti ─────────────────────────────────────────────────────────
const C = {
  avorio: '#FBF7F0', terracotta: '#C4614A', oro: '#B8956A',
  scuro: '#2C1A0E', medio: '#9A8070', chiaro: '#E0D8CC',
  verde: '#2D6A4F', rosso: '#9B2335', giallo: '#C77B13',
}

const MENU = {
  it: {
    titolo: 'Learning',
    sottotitolo: 'Preparazione esame ASSP',
    livelli: [
      { id: 'l1', label: '1° Livello', sub: 'Vino · Birra · Distillati', livello: 1 },
      { id: 'l2', label: '2° Livello', sub: 'Enologia internazionale', livello: 2, bloccato: true },
      { id: 'l3', label: '3° Livello', sub: 'Abbinamento cibo-vino', livello: 3, bloccato: true },
      { id: 'tutto', label: 'Tutto', sub: 'Tutti i livelli', livello: null },
    ],
    categorie_l1: [
      { id: 'vino', label: '🍷 Vino', cat: 'vino' },
      { id: 'birra', label: '🍺 Birra', cat: 'birra' },
      { id: 'distillati', label: '🥃 Distillati', cat: 'distillati' },
      { id: 'tutto', label: '🎯 Tutto il livello', cat: 'tutto' },
    ],
    caricamento: 'Claude sta generando le domande…',
    vero: 'VERO',
    falso: 'FALSO',
    opzioni: ['A', 'B', 'C', 'D'],
    risposta_aperta: 'Scrivi la tua risposta…',
    conferma: 'Conferma',
    correggo: 'Correzione in corso…',
    avanti: 'Prossima domanda →',
    fine: 'Vedi risultati',
    domanda: 'Domanda',
    di: 'di',
    corretta: '✓ Corretto!',
    sbagliata: '✗ Sbagliato',
    risposta_giusta: 'Risposta corretta:',
    spiegazione: 'Spiegazione:',
    risultati: 'Risultati sessione',
    punteggio: 'Punteggio',
    corrette: 'corrette',
    nuova: 'Nuova sessione',
    torna_menu: 'Torna al menu',
    progressi: 'I tuoi progressi',
    nessun_prog: 'Nessuna sessione completata ancora',
    argomento: 'Argomento',
    perc: '% corretto',
    punti_chiave: 'Punti chiave:',
    feedback: 'Feedback:',
    scrivi_risposta: 'Scrivi la tua risposta qui',
    errore: 'Errore nel caricamento. Riprova.',
  },
  en: {
    titolo: 'Learning',
    sottotitolo: 'ASSP exam preparation',
    livelli: [
      { id: 'l1', label: '1st Level', sub: 'Wine · Beer · Spirits', livello: 1 },
      { id: 'l2', label: '2nd Level', sub: 'International oenology', livello: 2, bloccato: true },
      { id: 'l3', label: '3rd Level', sub: 'Food pairing', livello: 3, bloccato: true },
      { id: 'tutto', label: 'Everything', sub: 'All levels', livello: null },
    ],
    categorie_l1: [
      { id: 'vino', label: '🍷 Wine', cat: 'vino' },
      { id: 'birra', label: '🍺 Beer', cat: 'birra' },
      { id: 'distillati', label: '🥃 Spirits', cat: 'distillati' },
      { id: 'tutto', label: '🎯 Entire level', cat: 'tutto' },
    ],
    caricamento: 'Claude is generating questions…',
    vero: 'TRUE', falso: 'FALSE',
    opzioni: ['A', 'B', 'C', 'D'],
    risposta_aperta: 'Write your answer…',
    conferma: 'Confirm',
    correggo: 'Correcting…',
    avanti: 'Next question →',
    fine: 'See results',
    domanda: 'Question', di: 'of',
    corretta: '✓ Correct!', sbagliata: '✗ Wrong',
    risposta_giusta: 'Correct answer:',
    spiegazione: 'Explanation:',
    risultati: 'Session results',
    punteggio: 'Score',
    corrette: 'correct',
    nuova: 'New session',
    torna_menu: 'Back to menu',
    progressi: 'Your progress',
    nessun_prog: 'No completed sessions yet',
    argomento: 'Topic',
    perc: '% correct',
    punti_chiave: 'Key points:',
    feedback: 'Feedback:',
    scrivi_risposta: 'Write your answer here',
    errore: 'Loading error. Please retry.',
  },
  fr: {
    titolo: 'Learning',
    sottotitolo: "Préparation à l'examen ASSP",
    livelli: [
      { id: 'l1', label: '1er Niveau', sub: 'Vin · Bière · Spiritueux', livello: 1 },
      { id: 'l2', label: '2e Niveau', sub: 'Œnologie internationale', livello: 2, bloccato: true },
      { id: 'l3', label: '3e Niveau', sub: 'Accords mets-vins', livello: 3, bloccato: true },
      { id: 'tutto', label: 'Tout', sub: 'Tous les niveaux', livello: null },
    ],
    categorie_l1: [
      { id: 'vino', label: '🍷 Vin', cat: 'vino' },
      { id: 'birra', label: '🍺 Bière', cat: 'birra' },
      { id: 'distillati', label: '🥃 Spiritueux', cat: 'distillati' },
      { id: 'tutto', label: '🎯 Tout le niveau', cat: 'tutto' },
    ],
    caricamento: 'Claude génère les questions…',
    vero: 'VRAI', falso: 'FAUX',
    opzioni: ['A', 'B', 'C', 'D'],
    risposta_aperta: 'Écrivez votre réponse…',
    conferma: 'Confirmer',
    correggo: 'Correction en cours…',
    avanti: 'Question suivante →',
    fine: 'Voir les résultats',
    domanda: 'Question', di: 'sur',
    corretta: '✓ Correct !', sbagliata: '✗ Incorrect',
    risposta_giusta: 'Bonne réponse :',
    spiegazione: 'Explication :',
    risultati: 'Résultats de la session',
    punteggio: 'Score',
    corrette: 'correctes',
    nuova: 'Nouvelle session',
    torna_menu: 'Retour au menu',
    progressi: 'Vos progrès',
    nessun_prog: 'Aucune session complétée',
    argomento: 'Sujet',
    perc: '% correct',
    punti_chiave: 'Points clés :',
    feedback: 'Retour :',
    scrivi_risposta: 'Écrivez votre réponse ici',
    errore: 'Erreur de chargement. Réessayez.',
  },
}

function useL() { return MENU[getLingua()] || MENU.it }

// ── Componente principale ─────────────────────────────────────────────────────
export default function Learning() {
  const L = useL()
  const [schermata, setSchermata] = useState('menu')       // menu | categorie | gioco | risultati | progressi
  const [livelloSel, setLivelloSel] = useState(null)
  const [categoriaSel, setCategoriaSel] = useState(null)
  const [loading, setLoading] = useState(false)
  const [errore, setErrore] = useState('')
  const [sessioneId, setSessioneId] = useState(null)
  const [domande, setDomande] = useState([])
  const [idx, setIdx] = useState(0)
  const [rispostaData, setRispostaData] = useState(null)   // null | { corretta, ... }
  const [rispostaUtente, setRispostaUtente] = useState('') // per domande aperte
  const [punteggioSess, setPunteggioSess] = useState(0)
  const [n_corrette, setN_corrette] = useState(0)
  const [tempoInizio, setTempoInizio] = useState(null)
  const [sessInizio, setSessInizio] = useState(null)
  const [progressi, setProgressi] = useState([])
  const textareaRef = useRef(null)

  const domanda = domande[idx]

  // Avvia sessione
  const avviaSessione = async (livello, categoria) => {
    setLoading(true)
    setErrore('')
    try {
      const data = await learningCall('genera_domande', {
        livello, categoria: categoria === 'tutto' ? null : categoria,
        lingua: getLingua(),
      })
      setSessioneId(data.sessione_id)
      setDomande(data.domande)
      setIdx(0)
      setN_corrette(0)
      setRispostaData(null)
      setRispostaUtente('')
      setSessInizio(Date.now())
      setTempoInizio(Date.now())
      setSchermata('gioco')
    } catch (e) {
      setErrore(L.errore)
    }
    setLoading(false)
  }

  // Gestisci risposta vero/falso e multipla
  const rispondi = async (scelta) => {
    if (rispostaData) return
    const ms = Date.now() - tempoInizio
    const giusta = domanda.risposta_giusta
    const corretta = scelta === giusta

    setRispostaData({ corretta, scelta, giusta, spiegazione: domanda.spiegazione })
    if (corretta) setN_corrette(p => p + 1)

    await learningCall('salva_risposta', {
      sessione_id: sessioneId,
      argomento: domanda.argomento,
      tipo_domanda: domanda.tipo,
      domanda: domanda.domanda,
      risposta_utente: scelta,
      risposta_giusta: giusta,
      corretta, spiegazione: domanda.spiegazione, tempo_ms: ms,
    })
  }

  // Gestisci risposta aperta
  const rispondiAperta = async () => {
    if (rispostaData || !rispostaUtente.trim()) return
    setRispostaData({ loading: true })
    const ms = Date.now() - tempoInizio
    try {
      const corr = await learningCall('correggi_aperta', {
        domanda: domanda.domanda,
        risposta_modello: domanda.risposta_modello,
        punti_chiave: domanda.punti_chiave,
        risposta_utente: rispostaUtente.trim(),
        lingua: getLingua(),
      })
      setRispostaData({ ...corr, scelta: rispostaUtente.trim() })
      if (corr.corretta) setN_corrette(p => p + 1)

      await learningCall('salva_risposta', {
        sessione_id: sessioneId,
        argomento: domanda.argomento,
        tipo_domanda: domanda.tipo,
        domanda: domanda.domanda,
        risposta_utente: rispostaUtente.trim(),
        risposta_giusta: domanda.risposta_modello,
        corretta: corr.corretta,
        spiegazione: corr.feedback,
        tempo_ms: ms,
      })
    } catch {
      setRispostaData({ corretta: false, scelta: rispostaUtente.trim(), spiegazione: '' })
    }
  }

  // Prossima domanda
  const prossimaD = () => {
    if (idx < domande.length - 1) {
      setIdx(p => p + 1)
      setRispostaData(null)
      setRispostaUtente('')
      setTempoInizio(Date.now())
    } else {
      chiudiSessione()
    }
  }

  const chiudiSessione = async () => {
    const durata = Math.round((Date.now() - sessInizio) / 1000)
    const { punteggio } = await learningCall('chiudi_sessione', {
      sessione_id: sessioneId, n_corrette, durata_sec: durata,
    })
    setPunteggioSess(punteggio)
    setSchermata('risultati')
  }

  const caricaProgressi = async () => {
    const { progressi: p } = await learningCall('get_progressi', {})
    setProgressi(p)
    setSchermata('progressi')
  }

  const S = {
    wrap: { minHeight: '100%', background: C.avorio, paddingBottom: 80 },
    card: { background: '#fff', border: `1px solid ${C.chiaro}`, borderRadius: 16, padding: 18, marginBottom: 12 },
    btn: (active, color) => ({
      width: '100%', padding: '14px 16px', border: `1.5px solid ${active ? color : C.chiaro}`,
      borderRadius: 12, background: active ? color : '#fff', color: active ? '#fff' : C.scuro,
      fontSize: 14, fontWeight: 600, cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
      fontFamily: '"DM Sans", sans-serif',
    }),
    btnPrimary: { width: '100%', padding: 14, background: C.terracotta, color: '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: '"DM Sans", sans-serif' },
    label: { fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: C.oro, marginBottom: 8, display: 'block' },
  }

  // ── SCHERMATA MENU ────────────────────────────────────────────────
  if (schermata === 'menu') return (
    <div style={S.wrap}>
      <div style={{ padding: '0 0 20px' }}>
        <div style={{ fontSize: 13, color: C.medio, marginBottom: 20 }}>{L.sottotitolo}</div>

        <span style={S.label}>{L.livelli[0].label.includes('1') ? 'Seleziona area di studio' : 'Select study area'}</span>
        {L.livelli.map(lv => (
          <button key={lv.id} disabled={lv.bloccato}
            onClick={() => { setLivelloSel(lv.livello); setSchermata(lv.livello === 1 ? 'categorie' : 'gioco'); if (!lv.livello) { setCategoriaSel(null); avviaSessione(null, null) } }}
            style={{ ...S.card, display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: lv.bloccato ? 'default' : 'pointer', opacity: lv.bloccato ? 0.45 : 1, border: `1.5px solid ${lv.bloccato ? C.chiaro : C.chiaro}` }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: C.scuro, marginBottom: 3 }}>{lv.label}</div>
              <div style={{ fontSize: 12, color: C.medio }}>{lv.sub}</div>
            </div>
            <span style={{ fontSize: 18, color: lv.bloccato ? C.chiaro : C.oro }}>
              {lv.bloccato ? '🔒' : '→'}
            </span>
          </button>
        ))}

        <button onClick={caricaProgressi}
          style={{ ...S.card, display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', marginTop: 8 }}>
          <span style={{ fontSize: 24 }}>📊</span>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: C.scuro }}>{L.progressi}</div>
            <div style={{ fontSize: 12, color: C.medio }}>Storico sessioni e aree deboli</div>
          </div>
        </button>
      </div>
    </div>
  )

  // ── SCHERMATA CATEGORIE L1 ────────────────────────────────────────
  if (schermata === 'categorie') return (
    <div style={S.wrap}>
      <button onClick={() => setSchermata('menu')} style={{ background: 'none', border: 'none', color: C.oro, fontSize: 13, cursor: 'pointer', padding: '0 0 16px', fontFamily: '"DM Sans", sans-serif' }}>
        ← Indietro
      </button>
      <span style={S.label}>1° Livello — Scegli argomento</span>
      {L.categorie_l1.map(cat => (
        <button key={cat.id}
          onClick={() => { setCategoriaSel(cat.cat); avviaSessione(cat.cat === 'tutto' ? null : 1, cat.cat) }}
          style={{ ...S.card, display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: C.scuro }}>{cat.label}</div>
          <span style={{ color: C.oro }}>→</span>
        </button>
      ))}
    </div>
  )

  // ── CARICAMENTO ───────────────────────────────────────────────────
  if (loading) return (
    <div style={{ ...S.wrap, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
      <div style={{ fontSize: 40, marginBottom: 16 }}>🎓</div>
      <div style={{ fontSize: 15, color: C.scuro, fontWeight: 600, marginBottom: 8 }}>{L.caricamento}</div>
      <div style={{ fontSize: 13, color: C.medio, textAlign: 'center', maxWidth: 260 }}>Sto preparando 10 domande basate sui tuoi appunti del corso</div>
    </div>
  )

  // ── ERRORE ────────────────────────────────────────────────────────
  if (errore) return (
    <div style={{ ...S.wrap, padding: 20 }}>
      <div style={{ background: '#FDF0EE', border: `1px solid ${C.terracotta}44`, borderRadius: 12, padding: 16, marginBottom: 16, color: C.terracotta }}>{errore}</div>
      <button onClick={() => { setErrore(''); setSchermata('menu') }} style={S.btnPrimary}>{L.torna_menu}</button>
    </div>
  )

  // ── SCHERMATA GIOCO ───────────────────────────────────────────────
  if (schermata === 'gioco' && domanda) {
    const feedback = rispostaData && !rispostaData.loading
    const isCorretta = feedback && rispostaData.corretta
    const isLoading = rispostaData?.loading

    return (
      <div style={S.wrap}>
        {/* Progress bar */}
        <div style={{ height: 4, background: C.chiaro, borderRadius: 2, marginBottom: 20 }}>
          <div style={{ height: '100%', borderRadius: 2, background: C.terracotta, width: `${((idx + 1) / domande.length) * 100}%`, transition: 'width 0.3s' }} />
        </div>

        <div style={{ fontSize: 11, color: C.medio, marginBottom: 12, display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontWeight: 600, color: C.scuro }}>{L.domanda} {idx + 1} {L.di} {domande.length}</span>
          <span>{n_corrette} ✓</span>
        </div>

        {/* Card domanda */}
        <div style={{ ...S.card, borderLeft: `4px solid ${C.terracotta}` }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: C.oro, marginBottom: 10 }}>
            {domanda.tipo === 'vero_falso' ? 'Vero / Falso' : domanda.tipo === 'multipla' ? 'Scelta multipla' : 'Risposta aperta'}
          </div>
          <div style={{ fontSize: 16, fontWeight: 600, color: C.scuro, lineHeight: 1.5 }}>{domanda.domanda}</div>
        </div>

        {/* Risposte Vero/Falso */}
        {domanda.tipo === 'vero_falso' && (
          <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
            {['V', 'F'].map(opt => {
              const isScelta = feedback && rispostaData.scelta === opt
              const isGiusta = feedback && rispostaData.giusta === opt
              const bg = !feedback ? '#fff'
                : isGiusta ? C.verde
                : isScelta && !isGiusta ? C.rosso
                : '#fff'
              const color = !feedback ? C.scuro : (isGiusta || (isScelta && !isGiusta)) ? '#fff' : C.scuro
              return (
                <button key={opt} onClick={() => rispondi(opt)} disabled={!!feedback}
                  style={{ flex: 1, padding: '18px 0', border: `2px solid ${!feedback ? C.chiaro : isGiusta ? C.verde : isScelta ? C.rosso : C.chiaro}`, borderRadius: 12, background: bg, color, fontSize: 16, fontWeight: 700, cursor: feedback ? 'default' : 'pointer', transition: 'all 0.2s', fontFamily: '"DM Sans", sans-serif' }}>
                  {opt === 'V' ? L.vero : L.falso}
                </button>
              )
            })}
          </div>
        )}

        {/* Risposte Multipla */}
        {domanda.tipo === 'multipla' && (
          <div style={{ marginBottom: 16 }}>
            {L.opzioni.map(opt => {
              const testo = domanda.opzioni[opt]
              const isScelta = feedback && rispostaData.scelta === opt
              const isGiusta = feedback && rispostaData.giusta === opt
              const bg = !feedback ? '#fff' : isGiusta ? C.verde : isScelta && !isGiusta ? C.rosso : '#fff'
              const borderColor = !feedback ? C.chiaro : isGiusta ? C.verde : isScelta ? C.rosso : C.chiaro
              return (
                <button key={opt} onClick={() => rispondi(opt)} disabled={!!feedback}
                  style={{ ...S.btn(false, C.terracotta), marginBottom: 8, background: bg, borderColor, color: feedback && (isGiusta || isScelta) ? '#fff' : C.scuro, transition: 'all 0.2s' }}>
                  <span style={{ fontWeight: 700, marginRight: 10, color: 'inherit' }}>{opt}.</span>{testo}
                </button>
              )
            })}
          </div>
        )}

        {/* Risposta aperta */}
        {domanda.tipo === 'aperta' && (
          <div style={{ marginBottom: 16 }}>
            <textarea ref={textareaRef}
              value={rispostaUtente}
              onChange={e => setRispostaUtente(e.target.value)}
              disabled={!!rispostaData}
              placeholder={L.scrivi_risposta}
              rows={5}
              style={{ width: '100%', padding: '12px 14px', border: `1.5px solid ${C.chiaro}`, borderRadius: 12, fontSize: 14, color: C.scuro, background: rispostaData ? '#F5F5F5' : '#fff', resize: 'none', fontFamily: '"DM Sans", sans-serif', boxSizing: 'border-box', lineHeight: 1.6 }} />
            {!rispostaData && (
              <button onClick={rispondiAperta} disabled={!rispostaUtente.trim()}
                style={{ ...S.btnPrimary, marginTop: 10, opacity: rispostaUtente.trim() ? 1 : 0.5 }}>
                {L.conferma}
              </button>
            )}
          </div>
        )}

        {/* Feedback correzione aperta in caricamento */}
        {isLoading && (
          <div style={{ ...S.card, background: '#F5EDE0', textAlign: 'center', color: C.medio }}>
            {L.correggo}
          </div>
        )}

        {/* Feedback risposta */}
        {feedback && (
          <div style={{ ...S.card, background: isCorretta ? '#F0F9F4' : '#FDF0EE', borderColor: isCorretta ? C.verde : C.rosso }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: isCorretta ? C.verde : C.rosso, marginBottom: 10 }}>
              {isCorretta ? L.corretta : L.sbagliata}
            </div>

            {/* Domanda aperta: feedback AI */}
            {domanda.tipo === 'aperta' && (
              <>
                {rispostaData.punti_mancati?.length > 0 && (
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: C.rosso, marginBottom: 4 }}>Punti mancati:</div>
                    {rispostaData.punti_mancati.map((p, i) => <div key={i} style={{ fontSize: 13, color: C.scuro, paddingLeft: 8, marginBottom: 2 }}>• {p}</div>)}
                  </div>
                )}
                <div style={{ fontSize: 12, fontWeight: 700, color: C.medio, marginBottom: 4 }}>{L.feedback}</div>
                <div style={{ fontSize: 13, color: C.scuro, lineHeight: 1.5 }}>{rispostaData.feedback}</div>
                <div style={{ marginTop: 12, padding: '10px 12px', background: '#fff', borderRadius: 8, border: `1px solid ${C.chiaro}` }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.oro, marginBottom: 6 }}>{L.punti_chiave}</div>
                  {domanda.punti_chiave.map((p, i) => <div key={i} style={{ fontSize: 13, color: C.scuro, marginBottom: 2 }}>• {p}</div>)}
                </div>
              </>
            )}

            {/* V/F e multipla: risposta giusta + spiegazione */}
            {domanda.tipo !== 'aperta' && (
              <>
                {!isCorretta && (
                  <div style={{ marginBottom: 10 }}>
                    <span style={{ fontSize: 12, color: C.medio }}>{L.risposta_giusta} </span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: C.verde }}>{rispostaData.giusta === 'V' ? L.vero : rispostaData.giusta === 'F' ? L.falso : `${rispostaData.giusta}. ${domanda.opzioni?.[rispostaData.giusta] || ''}`}</span>
                  </div>
                )}
                <div style={{ fontSize: 12, fontWeight: 700, color: C.medio, marginBottom: 4 }}>{L.spiegazione}</div>
                <div style={{ fontSize: 13, color: C.scuro, lineHeight: 1.6 }}>{domanda.spiegazione}</div>
              </>
            )}
          </div>
        )}

        {/* Pulsante avanti */}
        {feedback && !isLoading && (
          <button onClick={prossimaD} style={{ ...S.btnPrimary, marginTop: 8 }}>
            {idx < domande.length - 1 ? L.avanti : L.fine}
          </button>
        )}
      </div>
    )
  }

  // ── RISULTATI ─────────────────────────────────────────────────────
  if (schermata === 'risultati') {
    const pct = Math.round((n_corrette / domande.length) * 100)
    const emoji = pct >= 80 ? '🏆' : pct >= 60 ? '📚' : '💪'
    const colore = pct >= 80 ? C.verde : pct >= 60 ? C.giallo : C.rosso
    return (
      <div style={S.wrap}>
        <div style={{ ...S.card, textAlign: 'center', padding: 32, marginBottom: 20 }}>
          <div style={{ fontSize: 52, marginBottom: 12 }}>{emoji}</div>
          <div style={{ fontSize: 13, color: C.medio, marginBottom: 4 }}>{L.risultati}</div>
          <div style={{ fontSize: 56, fontWeight: 800, color: colore, fontFamily: '"DM Sans", sans-serif', lineHeight: 1 }}>{pct}%</div>
          <div style={{ fontSize: 15, color: C.scuro, marginTop: 8 }}>{n_corrette} {L.corrette} {L.di} {domande.length}</div>
        </div>
        <button onClick={() => avviaSessione(livelloSel, categoriaSel)} style={{ ...S.btnPrimary, marginBottom: 10 }}>{L.nuova}</button>
        <button onClick={() => setSchermata('menu')} style={{ ...S.btn(false, C.terracotta), textAlign: 'center', padding: 14 }}>{L.torna_menu}</button>
      </div>
    )
  }

  // ── PROGRESSI ─────────────────────────────────────────────────────
  if (schermata === 'progressi') return (
    <div style={S.wrap}>
      <button onClick={() => setSchermata('menu')} style={{ background: 'none', border: 'none', color: C.oro, fontSize: 13, cursor: 'pointer', padding: '0 0 16px', fontFamily: '"DM Sans", sans-serif' }}>
        ← {L.torna_menu}
      </button>
      <span style={S.label}>{L.progressi}</span>
      {progressi.length === 0 ? (
        <div style={{ ...S.card, textAlign: 'center', color: C.medio, padding: 32 }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>📊</div>
          <div>{L.nessun_prog}</div>
        </div>
      ) : progressi.map(p => {
        const col = p.pct_corretto >= 80 ? C.verde : p.pct_corretto >= 60 ? C.giallo : C.rosso
        return (
          <div key={p.id} style={{ ...S.card, display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: `${col}22`, border: `2px solid ${col}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: 14, fontWeight: 800, color: col }}>{p.pct_corretto}%</span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.scuro, marginBottom: 3 }}>{p.argomento.replace(/_/g, ' ')}</div>
              <div style={{ height: 4, background: C.chiaro, borderRadius: 2 }}>
                <div style={{ height: '100%', borderRadius: 2, background: col, width: `${p.pct_corretto}%` }} />
              </div>
              <div style={{ fontSize: 11, color: C.medio, marginTop: 3 }}>{p.n_corrette}/{p.n_risposte} risposte</div>
            </div>
          </div>
        )
      })}
    </div>
  )

  return null
}

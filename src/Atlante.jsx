import { useState, useEffect, useMemo } from 'react'
import { useNavigate as useRouterNavigate } from 'react-router-dom'
import { getLingua } from './i18n'

// ── Traduzioni Atlante ───────────────────────────────────────────────────────
const ATX = {
  it: {
    indietro: '← Indietro',
    esercizi_titolo: 'Esercizi',
    esercizi_desc: (nome) => `Domande flash su sottozone, DOCG/DOC, vitigni e curiosità di ${nome}.`,
    prossima: 'Prossima →',
    nuova_serie: '🔄 Nuova serie',
    riprova: 'Riprova',
    esercizio_titolo: 'Esercizio',
    corrette: 'corrette',
    comuni_chiave: 'Comuni chiave',
    docg_label: 'DOCG',
    doc_label: 'DOC principali',
    grand_cru: '⭐ Grand Cru',
    vitigni_zona: 'Vitigni della zona',
    vitigni_principali: 'Vitigni principali',
    focus_esame: '🎯 Focus esame',
    non_studiata: 'Non studiata',
    in_studio: 'In studio',
    studiata: 'Studiata ✓',
    studiata_label: 'Studiata',
    in_studio_label: 'In studio',
    non_studiata_label: 'Non studiata',
    da_iniziare: 'Da iniziare',
    produzione: 'Produzione',
    zone: 'Zone',
    sottozone_label: 'Sottozone',
    avvia_esercizi: 'Esercizi su questa regione',
    corrette_su: 'corrette su',
  },
  en: {
    indietro: '← Back',
    esercizi_titolo: 'Exercises',
    esercizi_desc: (nome) => `Flash questions on sub-zones, DOCG/DOC, grape varieties and facts about ${nome}.`,
    prossima: 'Next →',
    nuova_serie: '🔄 New series',
    riprova: 'Retry',
    esercizio_titolo: 'Exercise',
    corrette: 'correct',
    comuni_chiave: 'Key towns',
    docg_label: 'DOCG',
    doc_label: 'Main DOC',
    grand_cru: '⭐ Grand Cru',
    vitigni_zona: 'Zone grapes',
    vitigni_principali: 'Main grapes',
    focus_esame: '🎯 Exam focus',
    non_studiata: 'Not studied',
    in_studio: 'Studying',
    studiata: 'Studied ✓',
    studiata_label: 'Studied',
    in_studio_label: 'Studying',
    non_studiata_label: 'Not studied',
    da_iniziare: 'To start',
    produzione: 'Production',
    zone: 'Zones',
    sottozone_label: 'Sub-zones',
    avvia_esercizi: 'Exercises on this region',
    corrette_su: 'correct out of',
  },
  fr: {
    indietro: '← Retour',
    esercizi_titolo: 'Exercices',
    esercizi_desc: (nome) => `Questions flash sur les sous-zones, DOCG/DOC, cépages et curiosités de ${nome}.`,
    prossima: 'Suivant →',
    nuova_serie: '🔄 Nouvelle série',
    riprova: 'Réessayer',
    esercizio_titolo: 'Exercice',
    corrette: 'correctes',
    comuni_chiave: 'Communes clés',
    docg_label: 'DOCG',
    doc_label: 'DOC principales',
    grand_cru: '⭐ Grands Crus',
    vitigni_zona: 'Cépages de la zone',
    vitigni_principali: 'Cépages principaux',
    focus_esame: '🎯 Points clés examen',
    non_studiata: 'Non étudiée',
    in_studio: 'En cours',
    studiata: 'Étudiée ✓',
    studiata_label: 'Étudiée',
    in_studio_label: 'En cours',
    non_studiata_label: 'Non étudiée',
    da_iniziare: 'À commencer',
    produzione: 'Production',
    zone: 'Zones',
    sottozone_label: 'Sous-zones',
    avvia_esercizi: 'Exercices sur cette région',
    corrette_su: 'correctes sur',
  },
}
function atx(key) {
  const lang = getLingua()
  return (ATX[lang] || ATX.it)[key] || (ATX.it)[key] || key
}
import { supabase } from './supabase'
import { SVG_W as IT_SVG_W, SVG_H as IT_SVG_H, REGIONS as IT_REGIONS } from './countrymaps/italySvgData'
import { REGION_MAPS as IT_REGION_MAPS } from './countrymaps/italyRegionMaps'
import { SVG_W as PT_SVG_W, SVG_H as PT_SVG_H, REGIONS as PT_REGIONS } from './countrymaps/portugalSvgData'
import { REGION_MAPS as PT_REGION_MAPS } from './countrymaps/portugalRegionMaps'
import { SVG_W as DE_SVG_W, SVG_H as DE_SVG_H, REGIONS as DE_REGIONS } from './countrymaps/germaniaSvgData'
import { REGION_MAPS as DE_REGION_MAPS } from './countrymaps/germaniaRegionMaps'
import { SVG_W as FR_SVG_W, SVG_H as FR_SVG_H, REGIONS as FR_REGIONS } from './countrymaps/franciaSvgData'
import { REGION_MAPS as FR_REGION_MAPS } from './countrymaps/franciaRegionMaps'
import { SVG_W as AT_SVG_W, SVG_H as AT_SVG_H, REGIONS as AT_REGIONS } from './countrymaps/austriaSvgData'
import { REGION_MAPS as AT_REGION_MAPS } from './countrymaps/austriaRegionMaps'
import { SVG_W as ES_SVG_W, SVG_H as ES_SVG_H, REGIONS as ES_REGIONS } from './countrymaps/spagnaSvgData'
import { REGION_MAPS as ES_REGION_MAPS } from './countrymaps/spagnaRegionMaps'
import { SVG_W as CH_SVG_W, SVG_H as CH_SVG_H, REGIONS as CH_REGIONS } from './countrymaps/svizzeraSvgData'
import { REGION_MAPS as CH_REGION_MAPS } from './countrymaps/svizzeraRegionMaps'

// Mappa paese -> dati SVG
const COUNTRY_DATA = {
  italia:    { SVG_W: IT_SVG_W, SVG_H: IT_SVG_H, REGIONS: IT_REGIONS, REGION_MAPS: IT_REGION_MAPS, label: '🇮🇹 Italia',    totalZones: 20 },
  francia:   { SVG_W: FR_SVG_W, SVG_H: FR_SVG_H, REGIONS: FR_REGIONS, REGION_MAPS: FR_REGION_MAPS, label: '🇫🇷 Francia',   totalZones: 12 },
  germania:  { SVG_W: DE_SVG_W, SVG_H: DE_SVG_H, REGIONS: DE_REGIONS, REGION_MAPS: DE_REGION_MAPS, label: '🇩🇪 Germania',  totalZones: 13 },
  austria:   { SVG_W: AT_SVG_W, SVG_H: AT_SVG_H, REGIONS: AT_REGIONS, REGION_MAPS: AT_REGION_MAPS, label: '🇦🇹 Austria',   totalZones: 6  },
  spagna:    { SVG_W: ES_SVG_W, SVG_H: ES_SVG_H, REGIONS: ES_REGIONS, REGION_MAPS: ES_REGION_MAPS, label: '🇪🇸 Spagna',    totalZones: 11 },
  portogallo:{ SVG_W: PT_SVG_W, SVG_H: PT_SVG_H, REGIONS: PT_REGIONS, REGION_MAPS: PT_REGION_MAPS, label: '🇵🇹 Portogallo',totalZones: 11 },
  svizzera:  { SVG_W: CH_SVG_W, SVG_H: CH_SVG_H, REGIONS: CH_REGIONS, REGION_MAPS: CH_REGION_MAPS, label: '🇨🇭 Svizzera',  totalZones: 6  },
}


// Palette colori sottozone (max 8 per regione)
const ZONA_COLORS = [
  { fill: '#C4614A22', stroke: '#C4614A', label: '#8B2E1A' },
  { fill: '#2D6A4F22', stroke: '#2D6A4F', label: '#1A4530' },
  { fill: '#B8956A22', stroke: '#B8956A', label: '#6B4E1A' },
  { fill: '#4A6FA5aa', stroke: '#2E4F7A', label: '#1A2E4A' },
  { fill: '#9B233522', stroke: '#9B2335', label: '#6B0F1F' },
  { fill: '#C77B1322', stroke: '#C77B13', label: '#6B3D0A' },
  { fill: '#5B4E8A22', stroke: '#3D3060', label: '#2A1F50' },
  { fill: '#2A7A6A22', stroke: '#1A5A4A', label: '#0A3530' },
]

const terra = '#C4614A', oro = '#B8956A', scuro = '#2C1A0E'
const medio = '#9A8070', chiaro = '#E0D8CC', avorio = '#FBF7F0'
const verde = '#2D6A4F', giallo = '#C77B13'

async function apiMappe(action, payload = {}) {
  const { data: { session } } = await supabase.auth.getSession()
  const r = await fetch('/api/mappe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
    body: JSON.stringify({ action, payload }),
  })
  const d = await r.json()
  if (!r.ok) throw new Error(d.error)
  return d
}

// Colore regione in base al livello di studio
function regionColor(livello, selected) {
  if (selected) return terra
  if (livello === 2) return verde
  if (livello === 1) return giallo
  return '#D6CEBE'
}



// ── Barra produzione ─────────────────────────────────────────────────────────
function BarraProduzione({ produzione, compact = false }) {
  if (!produzione || (!produzione.rosso && !produzione.bianco)) return null
  const r = produzione.rosso || 0
  const b = produzione.bianco || 0
  const ro = produzione.rosato || 0
  const tot = r + b + ro
  if (tot === 0) return null
  const pr = Math.round(r / tot * 100)
  const pb = Math.round(b / tot * 100)
  const pro = 100 - pr - pb

  return (
    <div style={{ marginTop: compact ? 6 : 10 }}>
      {!compact && (
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: '#9A8070', marginBottom: 6 }}>
          {atx('produzione')}
        </div>
      )}
      {/* Barra */}
      <div style={{ height: compact ? 6 : 8, borderRadius: 4, overflow: 'hidden', display: 'flex', background: '#E0D8CC' }}>
        {pr > 0 && <div style={{ width: `${pr}%`, background: '#9B2335', transition: 'width 0.4s' }}/>}
        {pb > 0 && <div style={{ width: `${pb}%`, background: '#B8956A', transition: 'width 0.4s' }}/>}
        {pro > 0 && <div style={{ width: `${pro}%`, background: '#F4A7B9', transition: 'width 0.4s' }}/>}
      </div>
      {/* Leggenda */}
      <div style={{ display: 'flex', gap: 10, marginTop: compact ? 4 : 6, flexWrap: 'wrap' }}>
        {pr > 0 && <span style={{ fontSize: 10, color: '#9B2335', fontWeight: 600 }}>🟥 Rosso {pr}%</span>}
        {pb > 0 && <span style={{ fontSize: 10, color: '#8B6A2A', fontWeight: 600 }}>⬜ Bianco {pb}%</span>}
        {pro > 0 && <span style={{ fontSize: 10, color: '#c04f72', fontWeight: 600 }}>🌸 Rosato {pro}%</span>}
      </div>
    </div>
  )
}

// ── Mappa Regione con province colorate per sottozona ────────────────────────
function MappaRegione({ regione_id, sottozone, onSelectZona, selectedZona, REGION_MAPS }) {
  const mapData = REGION_MAPS?.[regione_id?.toUpperCase()]
  if (!mapData) return null

  // Costruisce mappa provincia -> indice sottozona
  const provToZona = {}
  ;(sottozone || []).forEach((sz, idx) => {
    // Le province della sottozona vengono dedotte dai dati in learning_mappe
    // che abbiamo nella struttura sottozone[].province (se presente)
    // Altrimenti usiamo l'ordine per distribuire province tra sottozone
    if (sz.province) {
      sz.province.forEach(p => { provToZona[p] = idx })
    }
  })

  // Se nessuna sottozona ha province esplicite, distribuiamo automaticamente
  // le province tra le sottozone in base all'ordine geografico
  const allProvs = Object.keys(mapData.provinces)
  const hasExplicit = Object.keys(provToZona).length > 0
  if (!hasExplicit && sottozone?.length > 0) {
    const perZona = Math.ceil(allProvs.length / sottozone.length)
    allProvs.forEach((prov, i) => {
      provToZona[prov] = Math.min(Math.floor(i / perZona), sottozone.length - 1)
    })
  }

  // Calcola centroidi delle sottozone per le label
  const zonaCentroids = {}
  allProvs.forEach(prov => {
    const zi = provToZona[prov]
    if (zi === undefined) return
    const pd = mapData.provinces[prov]
    if (!zonaCentroids[zi]) zonaCentroids[zi] = { xs: [], ys: [] }
    zonaCentroids[zi].xs.push(pd.cx)
    zonaCentroids[zi].ys.push(pd.cy)
  })

  return (
    <svg viewBox={`0 0 ${mapData.w} ${mapData.h}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
      <rect width={mapData.w} height={mapData.h} fill="#FBF7F0" rx="8"/>
      {allProvs.map(prov => {
        const pd = mapData.provinces[prov]
        const zi = provToZona[prov] ?? 0
        const col = ZONA_COLORS[zi % ZONA_COLORS.length]
        const isSel = selectedZona !== null && selectedZona === zi
        return (
          <g key={prov} onClick={() => onSelectZona?.(zi)} style={{ cursor: 'pointer' }}>
            <path d={pd.path}
              fill={isSel ? col.stroke + '55' : col.fill}
              stroke={col.stroke}
              strokeWidth={isSel ? 1.5 : 0.8}
              style={{ transition: 'fill 0.15s' }}/>
          </g>
        )
      })}
      {/* Comuni chiave — un punto + label per comune, posizione geografica fissa */}
      {(mapData.comuni_map || []).map(c => (
        <g key={c.nome} pointerEvents="none">
          <circle cx={c.x} cy={c.y} r="2" fill="#C4614A"/>
          <text x={c.x + 3} y={c.y + 1} dominantBaseline="middle"
            fontSize="5.5" fontFamily="DM Sans" fontWeight="600" fill="#5C2A00">
            {c.nome}
          </text>
        </g>
      ))}
    </svg>
  )
}

// ── Mappa Paese (generica) ───────────────────────────────────────────────────
function MappaPaese({ REGIONS, SVG_W, SVG_H, progressi, onSelect, selected, paese }) {
  const SMALL_IDS = paese === 'italia' ? ['VDA','LIG','MOL','UMB','TAA','FVG','MAR'] : []
  const MED_IDS   = paese === 'italia' ? ['ABR','BAS','CAL'] : []
  return (
    <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
      <rect width={SVG_W} height={SVG_H} fill={avorio} rx="8"/>
      {Object.values(REGIONS).map(reg => {
        const livello = progressi[reg.id] || 0
        const isSel = selected === reg.id
        const fill = regionColor(livello, isSel)
        const stroke = isSel ? terra : '#fff'
        const sw = isSel ? 1.5 : 0.5
        const fs = SMALL_IDS.includes(reg.id) ? '5.5' : MED_IDS.includes(reg.id) ? '6' : '7'
        return (
          <g key={reg.id} onClick={() => onSelect(reg.id)} style={{ cursor: 'pointer' }}>
            <path d={reg.path} fill={fill} stroke={stroke} strokeWidth={sw}
              style={{ transition: 'fill 0.2s' }}/>
            <text x={reg.cx} y={reg.cy} textAnchor="middle" dominantBaseline="middle"
              fontSize={fs} fontFamily="DM Sans, sans-serif" fontWeight="700"
              fill={isSel || livello === 2 ? '#fff' : '#333'} pointerEvents="none"
              style={{ textShadow: '0 0 3px rgba(0,0,0,0.3)' }}>
              {reg.label}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

// ── Componente principale ─────────────────────────────────────────────────────
export default function Atlante({ initialPaese }) {
  const routerNavigate = useRouterNavigate()
  const [paese, setPaeseState] = useState(() => {
    const validPaesi = Object.keys(COUNTRY_DATA)
    return (initialPaese && validPaesi.includes(initialPaese)) ? initialPaese : 'italia'
  })
  // Sync paese if URL changes externally
  useEffect(() => {
    if (initialPaese && COUNTRY_DATA[initialPaese]) setPaeseState(initialPaese)
  }, [initialPaese])
  const setPaese = (p) => {
    setPaeseState(p)
    routerNavigate('/atlante/' + p, { replace: true })
  }
  const { SVG_W, SVG_H, REGIONS, REGION_MAPS } = COUNTRY_DATA[paese] || COUNTRY_DATA['italia']

  const [vista, setVista] = useState('mappa')        // mappa | regione | sottozona | esercizio | esercizi_regione | mega_quiz
  const [regioni, setRegioni] = useState([])
  const [progressi, setProgressi] = useState({})
  const [selected, setSelected] = useState(null)
  const [regioneData, setRegioneData] = useState(null)
  const [sottozona, setSottozona] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedZona, setSelectedZona] = useState(null)
  const [esLoading, setEsLoading] = useState(false)

  // Mega Quiz paese
  const [mqDomande, setMqDomande] = useState([])
  const [mqIdx, setMqIdx] = useState(0)
  const [mqRisposta, setMqRisposta] = useState(null)
  const [mqFeedback, setMqFeedback] = useState(null)
  const [mqLoading, setMqLoading] = useState(false)
  const [mqScore, setMqScore] = useState({ corr: 0, tot: 0 })
  const [mqFinished, setMqFinished] = useState(false)

  // Esercizi regione (AI-powered flash quiz)
  const [erDomande, setErDomande] = useState([])       // array domande generate
  const [erIdx, setErIdx] = useState(0)                // domanda corrente
  const [erRisposta, setErRisposta] = useState(null)   // null | 'a'|'b'|'c'|'d' | true | false
  const [erFeedback, setErFeedback] = useState(null)   // { ok, spiegazione }
  const [erLoading, setErLoading] = useState(false)
  const [erScore, setErScore] = useState({ corr: 0, tot: 0 })
  const [erInputAperta, setErInputAperta] = useState('')
  const [erApertaLoading, setErApertaLoading] = useState(false)
  const [erClassifica, setErClassifica] = useState({})
  const [erAbbinamento, setErAbbinamento] = useState({})

  // Esercizio
  const [esMode, setEsMode] = useState('regioni')    // regioni | sottozone
  const [esRegRisposte, setEsRegRisposte] = useState({})
  const [esRegFeedback, setEsRegFeedback] = useState(null)
  const [esRegCorrette, setEsRegCorrette] = useState({})
  const [esSottoRisposte, setEsSottoRisposte] = useState({})
  const [esSottoFeedback, setEsSottoFeedback] = useState(null)
  const [esSottoCorrette, setEsSottoCorrette] = useState({})
  const [esRegSelected, setEsRegSelected] = useState(null)
  const [esSottoSelected, setEsSottoSelected] = useState(null)
  const [esInput, setEsInput] = useState('')
  const [esUltimoFeedback, setEsUltimoFeedback] = useState(null)

  useEffect(() => {
    setRegioni([]); setProgressi({}); setSelected(null)
    setRegioneData(null); setVista('mappa')
    carica()
  }, [paese])

  async function carica() {
    setLoading(true)
    try {
      const [{ regioni: r }, { progressi: p }] = await Promise.all([
        apiMappe('get_regioni', { paese }),
        apiMappe('get_progressi_mappa', { paese }),
      ])
      setRegioni(r)
      setProgressi(p)
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  async function apriRegione(reg_id) {
    setSelected(reg_id)
    setRegioneData(null)
    setSottozona(null)
    setSelectedZona(null)
    setVista('regione')
    try {
      const { regione } = await apiMappe('get_regione', { paese, regione_id: reg_id })
      setRegioneData(regione)
    } catch (e) { console.error(e) }
  }

  async function segnaStudiata(reg_id, livello) {
    await apiMappe('salva_progresso_mappa', { paese, regione_id: reg_id, livello_studio: livello })
    setProgressi(p => ({ ...p, [reg_id]: livello }))
  }

  // Esercizio regioni: click su regione → inserisci nome
  function esClickRegione(reg_id) {
    if (esRegFeedback) return
    // Se già risposta giusta per questa regione, non permettere modifica
    if (esRegCorrette[reg_id]) return
    setEsRegSelected(reg_id)
    setEsInput('')
    setEsUltimoFeedback(null)
  }

  function esConfermaRegione() {
    if (!esRegSelected || !esInput.trim()) return
    const reg = regioni.find(r => r.regione_id === esRegSelected)
    if (!reg) return
    const risposta = esInput.trim().toLowerCase()
    const atteso = reg.regione_nome.toLowerCase()
    const ok = risposta === atteso ||
      (risposta.length >= 4 && atteso.includes(risposta)) ||
      risposta.includes(atteso.split('/')[0].trim().toLowerCase())
    // Salva risposta e feedback immediato
    setEsRegRisposte(prev => ({ ...prev, [esRegSelected]: esInput.trim() }))
    if (ok) setEsRegCorrette(prev => ({ ...prev, [esRegSelected]: true }))
    setEsUltimoFeedback({ ok, atteso: reg.regione_nome, scritto: esInput.trim() })
    setEsInput('')
    setEsRegSelected(null)
  }

  function esVerificaRegioni() {
    const feedback = {}
    let nCorr = 0
    for (const reg of regioni) {
      const risposta = (esRegRisposte[reg.regione_id] || '').toLowerCase().trim()
      const attesa = reg.regione_nome.toLowerCase()
      const ok = risposta === attesa ||
        attesa.includes(risposta) && risposta.length > 4 ||
        risposta.includes(attesa.split('/')[0].trim().toLowerCase())
      feedback[reg.regione_id] = ok
      if (ok) nCorr++
    }
    setEsRegFeedback({ feedback, nCorr, tot: regioni.length })
  }

  function esResetRegioni() {
    setEsRegRisposte({})
    setEsRegCorrette({})
    setEsRegFeedback(null)
    setEsRegSelected(null)
    setEsInput('')
    setEsUltimoFeedback(null)
  }

  // Esercizio sottozone: solo per la regione selezionata
  function esClickSottozona(idx) {
    if (esSottoFeedback) return
    setEsSottoSelected(idx)
    setEsInput(esSottoRisposte[idx] || '')
  }

  function esConfermaSottozona() {
    if (esSottoSelected === null || !esInput.trim()) return
    setEsSottoRisposte(prev => ({ ...prev, [esSottoSelected]: esInput.trim() }))
    setEsInput('')
    setEsSottoSelected(null)
  }

  function esVerificaSottozone() {
    if (!regioneData) return
    const sz = regioneData.sottozone || []
    const feedback = {}
    let nCorr = 0
    sz.forEach((s, i) => {
      const risposta = (esSottoRisposte[i] || '').toLowerCase().trim()
      const attesa = s.nome.toLowerCase()
      const ok = risposta.length > 2 && attesa.includes(risposta)
      feedback[i] = ok
      if (ok) nCorr++
    })
    setEsSottoFeedback({ feedback, nCorr, tot: sz.length })
  }

  // Arricchisce una sottozona grezza del DB con comuni (da comuni_map JS) e grand_cru
  function enrichSz(sz) {
    if (!sz) return sz
    const regionMap = REGION_MAPS?.[selected?.toUpperCase()]
    const mapComuni = (regionMap?.comuni_map || [])
      .filter(c => (sz.province || []).includes(c.provincia))
      .map(c => c.nome)

    const result = {
      ...sz,
      comuni: (sz.comuni_label?.length > 0 ? sz.comuni_label : null) ||
              (sz.comuni?.length > 0 ? sz.comuni : null) ||
              mapComuni,
      grand_cru: sz.grand_cru || [],
    }
    return result
  }

  const card = { background: '#fff', border: `1px solid ${chiaro}`, borderRadius: 14, padding: '12px 14px', marginBottom: 8 }
  const pill = (color) => ({ display: 'inline-block', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, margin: '2px', background: color === 'r' ? '#FEF0EE' : color === 'b' ? '#FAFBEA' : color === 'd' ? '#F5EDE0' : '#F0F7F4', color: color === 'r' ? '#7A1F10' : color === 'b' ? '#6B6B0A' : color === 'd' ? '#6B3D0A' : '#1A5C3A', border: `1px solid ${color === 'r' ? '#C4614A33' : color === 'b' ? '#B8B83033' : color === 'd' ? '#D4A56A33' : '#2D6A4F33'}` })
  const btnP = { width: '100%', padding: '12px 14px', background: terra, color: '#fff', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: '"DM Sans",sans-serif' }
  const btnO = { ...btnP, background: '#fff', color: scuro, border: `1.5px solid ${chiaro}` }

  // ── Genera esercizi regione (AI) ────────────────────────────────
  async function generaEsercizi() {
    if (!regioneData) return
    setErLoading(true)
    setErDomande([])
    setErIdx(0)
    setErRisposta(null)
    setErFeedback(null)
    setErScore({ corr: 0, tot: 0 })
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const regioneCtx = JSON.stringify({
        nome: regioneData.regione_nome,
        vitigni_rossi: regioneData.vitigni_rossi,
        vitigni_bianchi: regioneData.vitigni_bianchi,
        produzione: regioneData.produzione,
        sottozone: (regioneData.sottozone || []).map(sz => {
          // Comuni: prefer DB comuni_label, fallback to JS comuni_map by province code
          const regionMap = REGION_MAPS?.[selected?.toUpperCase()]
          const mapComuni = (regionMap?.comuni_map || [])
            .filter(c => (sz.province || []).includes(c.provincia))
            .map(c => c.nome)
          return {
            nome: sz.nome,
            docg: sz.docg,
            doc: sz.doc,
            grand_cru: sz.grand_cru || [],
            focus_points: sz.focus_points,
            produzione: sz.produzione,
            comuni: (sz.comuni_label?.length > 0 ? sz.comuni_label : null) ||
                    (sz.comuni?.length > 0 ? sz.comuni : null) ||
                    mapComuni,
          }
        }),
        focus_points: regioneData.focus_points,
      })
      // Svizzera: usa KB fissa. Altri paesi: genera con AI
      const isSwiss = paese === 'svizzera'
      const action = isSwiss ? 'get_swiss_quiz' : 'genera_esercizi_regione'
      const payload = isSwiss
        ? { regione_id: selected?.toUpperCase(), lingua: getLingua() }
        : { regione: regioneCtx, regione_nome: regioneData.regione_nome, lingua: getLingua() }
      const res = await fetch('/api/learning', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
        body: JSON.stringify({ action, payload })
      })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error || 'Errore generazione')
      setErDomande(d.domande || [])
    } catch (e) {
      setErDomande([{ tipo: 'errore', testo: e.message }])
    }
    setErLoading(false)
  }

  async function erCorreggiAperta(dom, testo) {
    if (!testo?.trim()) return
    setErApertaLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/learning', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
        body: JSON.stringify({ action: 'correggi_aperta', payload: {
          domanda: dom.domanda, risposta_utente: testo.trim(),
          risposta_modello: dom.risposta_modello || dom.corretta,
          punti_chiave: [], lingua: getLingua()
        }})
      })
      const d = await res.json()
      const ok = d.corretta || false
      const parziale = !ok && d.parziale
      setErFeedback({ ok, parziale, spiegazione: d.feedback || dom.spiegazione || '' })
      setErScore(s => ({ corr: s.corr + (ok ? 1 : parziale ? 0.5 : 0), tot: s.tot + 1 }))
    } catch (e) {
      setErFeedback({ ok: false, spiegazione: 'Errore correzione: ' + e.message })
    }
    setErApertaLoading(false)
  }

  function erConfermaClassifica(dom) {
    const corretta = typeof dom.corretta === 'string' ? JSON.parse(dom.corretta) : dom.corretta
    const elementi = dom.elementi || []
    let nCorr = 0
    elementi.forEach(v => { if ((erClassifica[v]) === corretta[v]) nCorr++ })
    const ok = nCorr === elementi.length
    const parziale = !ok && nCorr > 0
    setErFeedback({ ok, parziale, spiegazione: dom.spiegazione || `${nCorr}/${elementi.length} corretti` })
    setErScore(s => ({ corr: s.corr + (ok ? 1 : parziale ? 0.5 : 0), tot: s.tot + 1 }))
  }

  function erConfermaAbbinamento(dom) {
    const corretta = typeof dom.corretta === 'string' ? JSON.parse(dom.corretta) : dom.corretta
    const sx = dom.elementi?.sx || []
    let nCorr = 0
    sx.forEach(k => { if ((erAbbinamento[k]) === corretta[k]) nCorr++ })
    const ok = nCorr === sx.length
    const parziale = !ok && nCorr > 0
    setErFeedback({ ok, parziale, spiegazione: dom.spiegazione || `${nCorr}/${sx.length} corretti` })
    setErScore(s => ({ corr: s.corr + (ok ? 1 : parziale ? 0.5 : 0), tot: s.tot + 1 }))
  }

  function erRispondi(scelta) {
    if (erFeedback) return
    const dom = erDomande[erIdx]
    let ok = false
    if (dom.tipo === 'multipla' || dom.tipo === 'comuni') ok = scelta === dom.corretta
    else if (dom.tipo === 'vero_falso') ok = scelta === dom.corretta
    else if (dom.tipo === 'flash') ok = true // self-assessed
    setErRisposta(scelta)
    setErFeedback({ ok, spiegazione: dom.spiegazione || '' })
    setErScore(s => ({ corr: s.corr + (ok ? 1 : 0), tot: s.tot + 1 }))
  }

  function erProssima() {
    if (erIdx + 1 >= erDomande.length) {
      setErIdx(0); setErDomande([]); setErFeedback(null); setErRisposta(null); setErInputAperta(''); setErClassifica({}); setErAbbinamento({})
    } else {
      setErIdx(i => i + 1); setErFeedback(null); setErRisposta(null); setErInputAperta(''); setErClassifica({}); setErAbbinamento({})
    }
  }

  // ── MEGA QUIZ PAESE ──────────────────────────────────────────────
  async function avviaMegaQuiz() {
    setMqDomande([]); setMqIdx(0); setMqFeedback(null); setMqRisposta(null)
    setMqScore({ corr: 0, tot: 0 }); setMqFinished(false)
    setMqLoading(true)
    setVista('mega_quiz')
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const paeseLabel = COUNTRY_DATA[paese]?.label || paese
      const isSvizzeraMega = paese === 'svizzera'
      const megaAction = isSvizzeraMega ? 'get_swiss_mega_quiz' : 'genera_mega_quiz'
      const megaPayload = isSvizzeraMega
        ? { lingua: getLingua() }
        : { paese, paese_nome: paeseLabel, lingua: getLingua() }
      const res = await fetch('/api/learning', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
        body: JSON.stringify({ action: megaAction, payload: megaPayload })
      })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error || 'Errore generazione')
      setMqDomande(d.domande || [])
    } catch (e) {
      setMqDomande([{ tipo: 'errore', testo: e.message }])
    }
    setMqLoading(false)
  }

  function mqRispondi(scelta) {
    if (mqFeedback) return
    const dom = mqDomande[mqIdx]
    let ok = false
    if (dom.tipo === 'multipla') ok = scelta === dom.corretta
    else if (dom.tipo === 'vero_falso') ok = scelta === dom.corretta
    else if (dom.tipo === 'flash') ok = true
    setMqRisposta(scelta)
    setMqFeedback({ ok, spiegazione: dom.spiegazione || '' })
    setMqScore(s => ({ corr: s.corr + (ok ? 1 : 0), tot: s.tot + 1 }))
  }

  function mqProssima() {
    const isLast = mqIdx + 1 >= mqDomande.length
    if (isLast) {
      setMqFinished(true)
    } else {
      setMqIdx(i => i + 1); setMqFeedback(null); setMqRisposta(null)
    }
  }

  // ── ESERCIZI REGIONE ─────────────────────────────────────────────
  if (vista === 'esercizi_regione') {
    const dom = erDomande[erIdx]
    return (
      <div style={{ paddingBottom: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <button onClick={() => { setVista('regione'); setErDomande([]); setErFeedback(null); setErRisposta(null) }}
            style={{ background: 'none', border: 'none', color: oro, fontSize: 13, cursor: 'pointer', fontFamily: '"DM Sans",sans-serif', padding: 0 }}>
            {atx('indietro')}
          </button>
          <div style={{ fontSize: 14, fontWeight: 700, color: scuro }}>
            {atx('esercizi_titolo')} — {regioneData?.regione_nome}
          </div>
          {erScore.tot > 0 && (
            <div style={{ marginLeft: 'auto', fontSize: 12, fontWeight: 700, color: verde }}>
              {erScore.corr}/{erScore.tot}
            </div>
          )}
        </div>

        {/* Stato: prima generazione */}
        {!erLoading && erDomande.length === 0 && (
          <div style={{ textAlign: 'center', padding: '32px 0' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🎯</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: scuro, marginBottom: 6 }}>
              Allenamento rapido
            </div>
            <div style={{ fontSize: 13, color: medio, marginBottom: 24, lineHeight: 1.5 }}>
              {atx('esercizi_desc')(regioneData?.regione_nome)}
            </div>
            <button style={btnP} onClick={generaEsercizi}>
              Inizia gli esercizi
            </button>
          </div>
        )}

        {/* Loading */}
        {erLoading && (
          <div style={{ textAlign: 'center', padding: '48px 0', color: medio }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>⏳</div>
            <div style={{ fontSize: 13 }}>Preparo le domande…</div>
          </div>
        )}

        {/* Domanda corrente */}
        {!erLoading && dom && dom.tipo !== 'errore' && (
          <div>
            {/* Indicatore progresso */}
            <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
              {erDomande.map((_, i) => (
                <div key={i} style={{ flex: 1, height: 3, borderRadius: 2,
                  background: i < erIdx ? verde : i === erIdx ? terra : chiaro }} />
              ))}
            </div>

            {/* Card domanda */}
            <div style={{ ...card, borderColor: terra, marginBottom: 12 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: terra, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>
                {dom.tipo === 'multipla' ? 'Scelta multipla' : dom.tipo === 'vero_falso' ? 'Vero o Falso' : dom.tipo === 'flash' ? 'Flash card' : dom.tipo === 'abbinamento' ? 'Abbinamento' : dom.tipo === 'classifica_colore' ? 'Classifica vitigni' : dom.tipo === 'aperta' ? 'Risposta aperta' : dom.tipo === 'elenco' ? 'Elenco' : dom.tipo === 'comuni' ? 'Comuni' : 'Domanda'}
              </div>
              <div style={{ fontSize: 15, fontWeight: 600, color: scuro, lineHeight: 1.5 }}>
                {dom.domanda || dom.testo}
              </div>
            </div>

            {/* Opzioni multipla — supporta sia array che dict {a,b,c,d} */}
            {(dom.tipo === 'multipla' || dom.tipo === 'comuni') && ['a','b','c','d'].map(lettera => {
              const op = Array.isArray(dom.opzioni) ? dom.opzioni[['a','b','c','d'].indexOf(lettera)] : dom.opzioni?.[lettera]
              if (!op) return null
              const isSelected = erRisposta === lettera
              const isCorrect = erFeedback && lettera === dom.corretta
              const isWrong = erFeedback && isSelected && !erFeedback.ok
              return (
                <button key={lettera} onClick={() => erRispondi(lettera)}
                  style={{ ...btnO, marginBottom: 8, textAlign: 'left', display: 'flex', gap: 10, alignItems: 'center',
                    borderColor: isCorrect ? verde : isWrong ? '#9B2335' : isSelected ? terra : chiaro,
                    background: isCorrect ? '#F0F9F4' : isWrong ? '#FDF0EE' : isSelected ? '#FBF7F0' : '#fff',
                    color: scuro, fontWeight: isSelected ? 700 : 500 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: isCorrect ? verde : isWrong ? '#9B2335' : medio,
                    minWidth: 18, textAlign: 'center' }}>{lettera.toUpperCase()}</span>
                  <span style={{ fontSize: 14, lineHeight: 1.4 }}>{op}</span>
                  {erFeedback && isCorrect && <span style={{ marginLeft: 'auto' }}>✓</span>}
                  {erFeedback && isWrong && <span style={{ marginLeft: 'auto' }}>✗</span>}
                </button>
              )
            })}

            {/* Vero/Falso */}
            {dom.tipo === 'vero_falso' && (
              <div style={{ display: 'flex', gap: 8 }}>
                {[true, false].map(val => {
                  const isSelected = erRisposta === val
                  const isCorrect = erFeedback && val === dom.corretta
                  const isWrong = erFeedback && isSelected && !erFeedback.ok
                  return (
                    <button key={String(val)} onClick={() => erRispondi(val)}
                      style={{ ...btnO, flex: 1, fontWeight: 700,
                        borderColor: isCorrect ? verde : isWrong ? '#9B2335' : isSelected ? terra : chiaro,
                        background: isCorrect ? '#F0F9F4' : isWrong ? '#FDF0EE' : isSelected ? '#FBF7F0' : '#fff' }}>
                      {val ? '✓ Vero' : '✗ Falso'}
                    </button>
                  )
                })}
              </div>
            )}

            {/* Flash card — mostra risposta */}
            {dom.tipo === 'flash' && !erFeedback && (
              <button style={btnO} onClick={() => erRispondi('visto')}>
                Mostra risposta
              </button>
            )}
            {dom.tipo === 'flash' && erFeedback && (
              <div style={{ ...card, borderColor: verde, background: '#F0F9F4' }}>
                <div style={{ fontSize: 14, color: scuro, lineHeight: 1.6 }}>{dom.risposta}</div>
              </div>
            )}

            {/* Aperta / Elenco / Comuni — input testuale + correzione AI */}
            {(dom.tipo === 'aperta' || dom.tipo === 'elenco') && !erFeedback && (
              <div>
                <textarea
                  style={{ width: '100%', minHeight: 90, padding: 10, borderRadius: 8, border: `1.5px solid ${chiaro}`,
                    fontFamily: '"DM Sans",sans-serif', fontSize: 13, resize: 'vertical', boxSizing: 'border-box' }}
                  placeholder={dom.tipo === 'elenco' ? 'Elenca gli elementi...' : 'Scrivi la tua risposta...'}
                  value={erInputAperta || ''}
                  onChange={e => setErInputAperta(e.target.value)}
                />
                <button style={{ ...btnP, marginTop: 8 }}
                  onClick={() => erCorreggiAperta(dom, erInputAperta)}>
                  Invia risposta
                </button>
              </div>
            )}

            {/* Classifica colore */}
            {dom.tipo === 'classifica_colore' && !erFeedback && (() => {
              // Opzioni dinamiche: dal campo elementi.opzioni, oppure default Bianco/Rosso
              const elementiRaw = dom.elementi
              let voci = []
              let opzioniClassifica = ['Bianco','Rosso']
              if (Array.isArray(elementiRaw)) {
                voci = elementiRaw
              } else if (elementiRaw && typeof elementiRaw === 'object') {
                voci = elementiRaw.voci || elementiRaw.elementi || []
                if (elementiRaw.opzioni) opzioniClassifica = elementiRaw.opzioni
              }
              const colori = { 'Bianco': { bg: '#FFF8DC', border: '#C9A227', text: '#7A5C00', emoji: '⬜' },
                               'Rosso': { bg: '#FDECEA', border: '#9B2335', text: '#9B2335', emoji: '🟥' },
                               'Menzione/Denominazione': { bg: '#EEF2FF', border: '#4F5BD5', text: '#2D3A8C', emoji: '📋' },
                               'Altro (vento)': { bg: '#E8F5E9', border: '#2E7D32', text: '#1B5E20', emoji: '💨' },
                               'Altro (comune)': { bg: '#FFF3E0', border: '#E65100', text: '#BF360C', emoji: '🏘️' },
                               'Altro (zona geografica)': { bg: '#F3E5F5', border: '#6A1B9A', text: '#4A148C', emoji: '🗺️' },
                               'Specialità (rosato)': { bg: '#FCE4EC', border: '#C2185B', text: '#880E4F', emoji: '🌸' },
                               'Specialità (blanc de noirs)': { bg: '#F3E5F5', border: '#7B1FA2', text: '#4A148C', emoji: '⚪' },
                               'Specialità (Chasselas giovane)': { bg: '#FFFDE7', border: '#F9A825', text: '#F57F17', emoji: '🍾' },
                               'Specialità (etichetta qualità)': { bg: '#E8F5E9', border: '#388E3C', text: '#1B5E20', emoji: '🏅' },
                               'Specialità (vino giovane)': { bg: '#FFFDE7', border: '#F9A825', text: '#F57F17', emoji: '🍾' },
                               'Specialità (blank de noirs)': { bg: '#F3E5F5', border: '#7B1FA2', text: '#4A148C', emoji: '⚪' },
                               'Specialità (AOC)': { bg: '#E3F2FD', border: '#1565C0', text: '#0D47A1', emoji: '📜' },
                             }
              const getStyle = (col) => colori[col] || { bg: '#F5F5F5', border: '#9E9E9E', text: '#424242', emoji: '•' }
              return (
                <div>
                  {voci.map(voce => (
                    <div key={voce} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      ...card, padding: '10px 14px', marginBottom: 8 }}>
                      <span style={{ fontSize: 14, fontWeight: 600 }}>{voce}</span>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                        {opzioniClassifica.map(col => {
                          const sel = (erClassifica || {})[voce]
                          const isSel = sel === col
                          const s = getStyle(col)
                          return (
                            <button key={col} onClick={() => setErClassifica(c => ({...c, [voce]: col}))}
                              style={{ padding: '5px 10px', borderRadius: 16, fontSize: 11, fontWeight: 700, cursor: 'pointer',
                                fontFamily: '"DM Sans",sans-serif',
                                background: isSel ? s.bg : '#fff',
                                border: `1.5px solid ${isSel ? s.border : chiaro}`,
                                color: isSel ? s.text : medio }}>
                              {s.emoji} {col}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                  <button style={{ ...btnP, marginTop: 4 }} onClick={() => erConfermaClassifica(dom)}>
                    Conferma
                  </button>
                </div>
              )
            })()}
            {dom.tipo === 'classifica_colore' && erFeedback && (() => {
              const elementiRaw = dom.elementi
              const voci = Array.isArray(elementiRaw) ? elementiRaw : (elementiRaw?.voci || elementiRaw?.elementi || [])
              const correttaMap = typeof dom.corretta === 'string' ? JSON.parse(dom.corretta) : dom.corretta
              return (
                <div>
                  {voci.map(voce => {
                    const corretta_val = correttaMap?.[voce]
                    const scelta_val = (erClassifica || {})[voce]
                    const ok = scelta_val === corretta_val
                    return (
                      <div key={voce} style={{ ...card, padding: '10px 14px', marginBottom: 8,
                        background: ok ? '#F0F9F4' : '#FDF0EE', borderColor: ok ? verde : '#9B2335' }}>
                        <span style={{ fontWeight: 600 }}>{voce}</span>
                        <span style={{ float: 'right', color: ok ? verde : '#9B2335', fontWeight: 700 }}>
                          {ok ? `✓ ${scelta_val}` : `✗ → ${corretta_val}`}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )
            })()}

            {/* Abbinamento */}
            {dom.tipo === 'abbinamento' && !erFeedback && (
              <div>
                {(dom.elementi?.sx || []).map(sx => (
                  <div key={sx} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, minWidth: 120, flexShrink: 0, color: scuro }}>{sx}</span>
                    <select
                      value={(erAbbinamento || {})[sx] || ''}
                      onChange={e => setErAbbinamento(a => ({...a, [sx]: e.target.value}))}
                      style={{ flex: 1, padding: '8px', borderRadius: 8, border: `1.5px solid ${chiaro}`,
                        fontFamily: '"DM Sans",sans-serif', fontSize: 12, background: '#fff' }}>
                      <option value=''>— scegli —</option>
                      {(dom.elementi?.dx || []).map(dx => (
                        <option key={dx} value={dx}>{dx}</option>
                      ))}
                    </select>
                  </div>
                ))}
                <button style={{ ...btnP, marginTop: 4 }}
                  onClick={() => erConfermaAbbinamento(dom)}>
                  Conferma
                </button>
              </div>
            )}
            {dom.tipo === 'abbinamento' && erFeedback && (
              <div>
                {(dom.elementi?.sx || []).map(sx => {
                  const corretta_map = typeof dom.corretta === 'string' ? JSON.parse(dom.corretta) : dom.corretta
                  const ok = (erAbbinamento || {})[sx] === corretta_map?.[sx]
                  return (
                    <div key={sx} style={{ ...card, padding: '10px 14px', marginBottom: 8,
                      background: ok ? '#F0F9F4' : '#FDF0EE', borderColor: ok ? verde : '#9B2335' }}>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{sx}</div>
                      <div style={{ fontSize: 12, color: ok ? verde : '#9B2335', marginTop: 4 }}>
                        {ok ? `✓ ${corretta_map?.[sx]}` : `✗ → ${corretta_map?.[sx]}`}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Spiegazione dopo risposta */}
            {erFeedback && dom.tipo !== 'flash' && (
              <div style={{ ...card,
                borderColor: erFeedback.ok ? verde : erFeedback.parziale ? '#C77B13' : '#9B2335',
                background: erFeedback.ok ? '#F0F9F4' : erFeedback.parziale ? '#FFF8E1' : '#FDF0EE',
                marginTop: 8 }}>
                <div style={{ fontSize: 12, fontWeight: 700,
                  color: erFeedback.ok ? verde : erFeedback.parziale ? '#C77B13' : '#9B2335',
                  marginBottom: 4 }}>
                  {erFeedback.ok ? '✓ Corretto' : erFeedback.parziale ? '◑ Parzialmente corretto' : '✗ Sbagliato'}
                </div>
                {erFeedback.spiegazione && (
                  <div style={{ fontSize: 13, color: scuro, lineHeight: 1.5 }}>{erFeedback.spiegazione}</div>
                )}
                {(erFeedback.ok || erFeedback.parziale) && erFeedback.suggerimenti?.length > 0 && (
                  <div style={{ marginTop: 8, padding: '8px 10px', background: '#FFFBF0', borderRadius: 8, border: '1px solid #E8D5A0' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#7A5C00', marginBottom: 4 }}>💡 Per approfondire:</div>
                    {erFeedback.suggerimenti.map((s, i) => (
                      <div key={i} style={{ fontSize: 11, color: scuro, lineHeight: 1.5 }}>• {s}</div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Prossima / Nuova serie */}
            {erFeedback && (
              <button style={{ ...btnP, marginTop: 12 }} onClick={erProssima}>
                {erIdx + 1 >= erDomande.length ? atx('nuova_serie') : atx('prossima')}
              </button>
            )}
          </div>
        )}

        {/* Errore */}
        {!erLoading && dom?.tipo === 'errore' && (
          <div style={{ ...card, borderColor: '#9B2335' }}>
            <div style={{ fontSize: 13, color: '#9B2335' }}>Errore: {dom.testo}</div>
            <button style={{ ...btnO, marginTop: 8 }} onClick={generaEsercizi}>{atx('riprova')}</button>
          </div>
        )}
      </div>
    )
  }

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 360, gap: 12 }}>
      <div style={{ fontSize: 40 }}>🗺️</div>
      <div style={{ fontSize: 15, fontWeight: 600, color: scuro }}>Caricamento atlante...</div>
    </div>
  )

  // ── ESERCIZIO ───────────────────────────────────────────────────
  if (vista === 'esercizio') {
    const isRegMode = esMode === 'regioni'
    const nCompilate = isRegMode
      ? Object.keys(esRegRisposte).length
      : Object.keys(esSottoRisposte).length
    const nTot = isRegMode ? regioni.length : (regioneData?.sottozone?.length || 0)

    return (
      <div style={{ paddingBottom: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <button onClick={() => { setVista(isRegMode ? 'mappa' : 'regione'); setEsRegFeedback(null); setEsSottoFeedback(null); setEsRegSelected(null); setEsSottoSelected(null); setEsInput('') }} style={{ background: 'none', border: 'none', color: oro, fontSize: 13, cursor: 'pointer', fontFamily: '"DM Sans",sans-serif', padding: 0 }}>
            {atx('indietro')}
          </button>
          <div style={{ fontSize: 14, fontWeight: 700, color: scuro }}>
            {atx('esercizio_titolo')} — {isRegMode ? `${atx('zone')} ${COUNTRY_DATA[paese]?.label || paese}` : `${atx('sottozone_label')} ${regioneData?.regione_nome}`}
          </div>
        </div>

        <div style={{ fontSize: 12, color: medio, marginBottom: 12, lineHeight: 1.5 }}>
          {isRegMode ? 'Clicca su ogni regione sulla mappa e scrivi il nome corretto.' : 'Clicca su ogni sottozona e scrivi il nome.'}
        </div>

        {/* Mappa esercizio regioni */}
        {isRegMode && (
          <div style={{ ...card, padding: 8, marginBottom: 12 }}>
            <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
              <rect width={SVG_W} height={SVG_H} fill={avorio} rx="8"/>
              {Object.values(REGIONS).map(reg => {
                const risposta = esRegRisposte[reg.id]
                const isSel = esRegSelected === reg.id
                const isCorr = esRegCorrette[reg.id]
                const fb = esRegFeedback?.feedback[reg.id]
                const fill = esRegFeedback
                  ? (fb ? '#2D6A4F' : risposta ? '#9B2335' : '#D6CEBE')
                  : isCorr ? '#2D6A4F'
                  : isSel ? terra
                  : risposta ? '#B8956A'
                  : '#D6CEBE'
                return (
                  <g key={reg.id} onClick={() => esClickRegione(reg.id)} style={{ cursor: esRegFeedback ? 'default' : 'pointer' }}>
                    <path d={reg.path} fill={fill} stroke={isSel ? terra : '#fff'} strokeWidth={isSel ? 2 : 0.5} style={{ transition: 'fill 0.2s' }}/>
                    {/* Durante esercizio: mostra ✓/✗ solo dopo verifica, nessun testo prima */}
                    {esRegFeedback && (
                      <text x={reg.cx} y={reg.cy} textAnchor="middle" dominantBaseline="middle"
                        fontSize="8" fontFamily="DM Sans" fontWeight="700"
                        fill="#fff" pointerEvents="none">
                        {esRegFeedback.feedback[reg.id] ? '✓' : risposta ? '✗' : '?'}
                      </text>
                    )}
                    {!esRegFeedback && isSel && (
                      <text x={reg.cx} y={reg.cy} textAnchor="middle" dominantBaseline="middle"
                        fontSize="8" fontFamily="DM Sans" fill="#fff" pointerEvents="none">✏️</text>
                    )}
                  </g>
                )
              })}
            </svg>
          </div>
        )}

        {/* Esercizio sottozone — lista cliccabile */}
        {!isRegMode && regioneData && (
          <div style={{ marginBottom: 12 }}>
            {(regioneData.sottozone || []).map((sz, i) => {
              const risposta = esSottoRisposte[i]
              const isSel = esSottoSelected === i
              const fb = esSottoFeedback?.feedback[i]
              const bg = esSottoFeedback ? (fb ? '#F0F9F4' : risposta ? '#FDF0EE' : '#fff') : isSel ? '#F5EDE0' : '#fff'
              const borderCol = esSottoFeedback ? (fb ? verde : risposta ? '#9B2335' : chiaro) : isSel ? terra : chiaro
              return (
                <div key={i} onClick={() => esClickSottozona(i)}
                  style={{ ...card, background: bg, borderColor: borderCol, cursor: esSottoFeedback ? 'default' : 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 12, color: medio, marginBottom: 2 }}>Zona {i+1}</div>
                    {risposta
                      ? <div style={{ fontSize: 14, fontWeight: 600, color: esSottoFeedback ? (fb ? verde : '#9B2335') : terra }}>{risposta}</div>
                      : <div style={{ fontSize: 13, color: chiaro }}>— non compilata —</div>
                    }
                    {esSottoFeedback && !fb && (
                      <div style={{ fontSize: 12, color: verde, marginTop: 2 }}>✓ {sz.nome}</div>
                    )}
                  </div>
                  <div style={{ fontSize: 18 }}>{esSottoFeedback ? (fb ? '✓' : '✗') : isSel ? '✏️' : '○'}</div>
                </div>
              )
            })}
          </div>
        )}

        {/* Campo input — senza il nome della regione */}
        {(esRegSelected || esSottoSelected !== null) && !esRegFeedback && !esSottoFeedback && (
          <div style={{ ...card, borderColor: terra, marginBottom: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: terra, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>
              {isRegMode ? 'Qual è il nome di questa regione?' : `Zona ${esSottoSelected + 1} — come si chiama?`}
            </div>
            <input autoFocus value={esInput} onChange={e => setEsInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (isRegMode ? esConfermaRegione() : esConfermaSottozona())}
              placeholder="Scrivi il nome..."
              style={{ width: '100%', border: 'none', outline: 'none', fontSize: 15, color: scuro, background: 'transparent', fontFamily: '"DM Sans",sans-serif', boxSizing: 'border-box' }}/>
          </div>
        )}

        {/* Feedback immediato ultima risposta */}
        {esUltimoFeedback && (
          <div style={{ ...card, background: esUltimoFeedback.ok ? '#F0F9F4' : '#FDF0EE', borderColor: esUltimoFeedback.ok ? verde : terra, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 22 }}>{esUltimoFeedback.ok ? '✓' : '✗'}</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: esUltimoFeedback.ok ? verde : terra }}>
                {esUltimoFeedback.ok ? 'Corretto!' : `Sbagliato — era: ${esUltimoFeedback.atteso}`}
              </div>
              {!esUltimoFeedback.ok && (
                <div style={{ fontSize: 11, color: medio }}>Hai scritto: {esUltimoFeedback.scritto}</div>
              )}
            </div>
          </div>
        )}

        {/* Pulsanti azione */}
        <div style={{ display: 'flex', gap: 8 }}>
          {(esRegSelected || esSottoSelected !== null) && !esRegFeedback && !esSottoFeedback && (
            <button style={{ ...btnP, flex: 1 }} onClick={isRegMode ? esConfermaRegione : esConfermaSottozona}>
              Conferma
            </button>
          )}
          {!esRegFeedback && !esSottoFeedback && nCompilate === nTot && nTot > 0 && !esRegSelected && esSottoSelected === null && (
            <button style={{ ...btnP, flex: 1 }} onClick={isRegMode ? esVerificaRegioni : esVerificaSottozone}>
              Vedi risultato finale →
            </button>
          )}
        </div>

        {/* Risultato finale */}
        {(esRegFeedback || esSottoFeedback) && (() => {
          const fb = esRegFeedback || esSottoFeedback
          const pct = Math.round((fb.nCorr / fb.tot) * 100)
          const emoji = pct >= 80 ? '🏆' : pct >= 60 ? '📚' : '💪'
          return (
            <div style={{ ...card, textAlign: 'center', padding: 24, marginTop: 8 }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>{emoji}</div>
              <div style={{ fontSize: 40, fontWeight: 800, color: pct >= 80 ? verde : pct >= 60 ? giallo : terra }}>{pct}%</div>
              <div style={{ fontSize: 14, color: medio, marginBottom: 16 }}>{fb.nCorr} / {fb.tot} {atx('corrette')}</div>
              <button style={btnP} onClick={isRegMode ? esResetRegioni : () => { setEsSottoRisposte({}); setEsSottoFeedback(null); setEsSottoSelected(null); setEsUltimoFeedback(null) }}>
                {atx('riprova')}
              </button>
            </div>
          )
        })()}

        {/* Progresso */}
        {!esRegFeedback && !esSottoFeedback && (
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: medio, marginTop: 12 }}>
            <span>{nCompilate}/{nTot} compilate</span>
            <span style={{ color: verde }}>{Object.values(isRegMode ? esRegCorrette : esSottoCorrette).filter(Boolean).length} ✓ {atx('corrette')}</span>
          </div>
        )}
      </div>
    )
  }

  // ── DETTAGLIO SOTTOZONA ──────────────────────────────────────────
  if (vista === 'sottozona' && sottozona) {
    return (
      <div style={{ paddingBottom: 40 }}>
        <button onClick={() => setVista('regione')} style={{ background: 'none', border: 'none', color: oro, fontSize: 13, cursor: 'pointer', fontFamily: '"DM Sans",sans-serif', padding: '0 0 14px' }}>
          ← {regioneData?.regione_nome}
        </button>

        <div style={{ ...card, marginBottom: 12 }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: scuro, marginBottom: 4 }}>{sottozona.nome}</div>
          <div style={{ fontSize: 12, color: medio }}>{regioneData?.regione_nome}</div>
        </div>

        {/* Comuni chiave */}
        <div style={card}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: terra, marginBottom: 10 }}>{atx('comuni_chiave')}</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {(sottozona.comuni || []).map(c => (
              <span key={c} style={{ padding: '4px 12px', background: '#F5EDE0', borderRadius: 20, fontSize: 12, fontWeight: 600, color: '#6B3D0A' }}>{c}</span>
            ))}
          </div>
        </div>

        {/* DOCG */}
        {sottozona.docg?.length > 0 && (
          <div style={card}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: terra, marginBottom: 10 }}>{atx('docg_label')}</div>
            <div>{sottozona.docg.map(d => <span key={d} style={pill('d')}>{d}</span>)}</div>
          </div>
        )}

        {/* DOC */}
        {sottozona.doc?.length > 0 && (
          <div style={card}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: verde, marginBottom: 10 }}>{atx('doc_label')}</div>
            <div>{sottozona.doc.map(d => <span key={d} style={pill('g')}>{d}</span>)}</div>
          </div>
        )}

        {/* Grand Cru (France only) */}
        {sottozona.grand_cru?.length > 0 && (
          <div style={card}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: '#8B6914', marginBottom: 10 }}>{atx('grand_cru')}</div>
            <div>{sottozona.grand_cru.map(d => <span key={d} style={{ ...pill('g'), background: '#FFF8E1', borderColor: '#C9A227', color: '#7A5C00' }}>{d}</span>)}</div>
          </div>
        )}

        {/* Vitigni della sottozona */}
        {regioneData && (regioneData.vitigni_rossi?.length > 0 || regioneData.vitigni_bianchi?.length > 0) && (
          <div style={card}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: terra, marginBottom: 10 }}>{atx('vitigni_zona')}</div>
            <div>
              {(regioneData.vitigni_rossi || []).map(v => <span key={v} style={pill('r')}>{v}</span>)}
              {(regioneData.vitigni_bianchi || []).map(v => <span key={v} style={pill('b')}>{v}</span>)}
            </div>
            <BarraProduzione produzione={sottozona.produzione} />
          </div>
        )}

        {/* Focus esame sottozona */}
        {sottozona.focus_points?.length > 0 && (
          <div style={{ ...card, background: '#FFFBF5', border: `1px solid ${oro}44` }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: oro, marginBottom: 10 }}>
              {atx('focus_esame')}
            </div>
            {sottozona.focus_points.map((fp, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, marginBottom: i < sottozona.focus_points.length - 1 ? 10 : 0 }}>
                <span style={{ color: terra, fontSize: 14, flexShrink: 0, marginTop: 1 }}>•</span>
                <span style={{ fontSize: 13, color: scuro, lineHeight: 1.6 }}>{typeof fp === 'string' ? fp : fp.testo}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  // ── DETTAGLIO REGIONE ────────────────────────────────────────────
  if (vista === 'regione') {
    const livello = progressi[selected] || 0
    return (
      <div style={{ paddingBottom: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <button onClick={() => setVista('mappa')} style={{ background: 'none', border: 'none', color: oro, fontSize: 13, cursor: 'pointer', fontFamily: '"DM Sans",sans-serif', padding: 0 }}>
            ← {COUNTRY_DATA[paese]?.label || paese}
          </button>
          <div style={{ flex: 1, height: 4, background: chiaro, borderRadius: 2 }}>
            <div style={{ height: '100%', borderRadius: 2, background: livello === 2 ? verde : livello === 1 ? giallo : chiaro, width: livello === 2 ? '100%' : livello === 1 ? '50%' : '0%', transition: 'width 0.4s' }}/>
          </div>
        </div>

        {!regioneData ? (
          <div style={{ textAlign: 'center', padding: 40, color: medio }}>Caricamento...</div>
        ) : (
          <>
            <div style={{ ...card, marginBottom: 12 }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: scuro, marginBottom: 3 }}>{regioneData.regione_nome}</div>
              <div style={{ fontSize: 12, color: medio }}>
                {(regioneData.sottozone || []).length} zone viticole · {(regioneData.vitigni_rossi || []).length + (regioneData.vitigni_bianchi || []).length} vitigni principali
              </div>
              <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
                {[0,1,2].map(l => (
                  <button key={l} onClick={() => segnaStudiata(regioneData.regione_id, l)}
                    style={{ padding: '5px 12px', borderRadius: 20, border: `1.5px solid ${livello===l ? terra : chiaro}`, background: livello===l ? terra : '#fff', color: livello===l ? '#fff' : medio, fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: '"DM Sans",sans-serif' }}>
                    {l===0?atx('non_studiata'):l===1?atx('in_studio'):atx('studiata')}
                  </button>
                ))}
              </div>
            </div>

            {/* Mappa regione con sottozone */}
            <div style={{ ...card, padding: 8, marginBottom: 12 }}>
              <MappaRegione
                regione_id={regioneData.regione_id}
                sottozone={regioneData.sottozone}
                REGION_MAPS={REGION_MAPS}
                onSelectZona={(zi) => {
                  setSelectedZona(zi === selectedZona ? null : zi)
                  const sz = regioneData.sottozone?.[zi]
                  if (sz) { setSottozona(enrichSz(sz)); setVista('sottozona') }
                }}
                selectedZona={selectedZona}
              />
            </div>

            {/* Legenda colori sottozone */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
              {(regioneData.sottozone || []).map((sz, i) => {
                const col = ZONA_COLORS[i % ZONA_COLORS.length]
                return (
                  <div key={i} onClick={() => { setSottozona(enrichSz(sz)); setVista('sottozona') }}
                    style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 20, background: col.fill, border: `1px solid ${col.stroke}`, cursor: 'pointer' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: col.stroke, flexShrink: 0 }}/>
                    <span style={{ fontSize: 11, fontWeight: 600, color: col.label }}>{sz.nome}</span>
                  </div>
                )
              })}
            </div>

            {/* Vitigni + barra produzione */}
            <div style={card}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: terra, marginBottom: 10 }}>{atx('vitigni_principali')}</div>
              <div>
                {(regioneData.vitigni_rossi || []).map(v => <span key={v} style={pill('r')}>{v}</span>)}
                {(regioneData.vitigni_bianchi || []).map(v => <span key={v} style={pill('b')}>{v}</span>)}
              </div>
              <BarraProduzione produzione={regioneData.produzione} />
            </div>

            {/* DOCG */}
            {(() => {
              const allDocg = (regioneData.sottozone || []).flatMap(sz => sz.docg || [])
              return allDocg.length > 0 ? (
                <div style={card}>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: '#8B3D0A', marginBottom: 10 }}>{atx('docg_label')}</div>
                  <div>{allDocg.map(d => <span key={d} style={pill('d')}>{d}</span>)}</div>
                </div>
              ) : null
            })()}

            {/* DOC */}
            {(() => {
              const allDoc = (regioneData.sottozone || []).flatMap(sz => sz.doc || [])
              return allDoc.length > 0 ? (
                <div style={card}>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: verde, marginBottom: 10 }}>{atx('doc_label')}</div>
                  <div>{allDoc.map(d => <span key={d} style={pill('g')}>{d}</span>)}</div>
                </div>
              ) : null
            })()}

            {/* Grand Cru (France only) */}
            {(() => {
              const allGc = (regioneData.sottozone || []).flatMap(sz => sz.grand_cru || [])
              return allGc.length > 0 ? (
                <div style={card}>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: '#8B6914', marginBottom: 10 }}>{atx('grand_cru')}</div>
                  <div>{allGc.map(d => <span key={d} style={{ ...pill('g'), background: '#FFF8E1', borderColor: '#C9A227', color: '#7A5C00' }}>{d}</span>)}</div>
                </div>
              ) : null
            })()}

            {/* Focus esame */}
            {regioneData.focus_points?.length > 0 && (
              <div style={{ ...card, background: '#FFFBF5', border: `1px solid ${oro}44` }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: oro, marginBottom: 10 }}>
                  {atx('focus_esame')}
                </div>
                {regioneData.focus_points.map((fp, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, marginBottom: i < regioneData.focus_points.length - 1 ? 10 : 0 }}>
                    <span style={{ color: terra, fontSize: 14, flexShrink: 0, marginTop: 1 }}>•</span>
                    <span style={{ fontSize: 13, color: scuro, lineHeight: 1.6 }}>{typeof fp === 'string' ? fp : fp.testo}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Pulsante esercizi regione */}
            <button style={{ ...btnO, marginTop: 4 }} onClick={() => { setVista('esercizi_regione') }}>
              🎯 Esercizi su questa regione
            </button>
          </>
        )}
      </div>
    )
  }

  // ── MEGA QUIZ VIEW ───────────────────────────────────────────────
  if (vista === 'mega_quiz') {
    const dom = mqDomande[mqIdx]
    const paeseLabel = COUNTRY_DATA[paese]?.label || paese
    const pct = mqScore.tot > 0 ? Math.round(mqScore.corr / mqScore.tot * 100) : 0
    const giudizio = pct >= 80 ? '🏆 Eccellente' : pct >= 65 ? '✅ Sufficiente' : pct >= 50 ? '⚠️ Da rivedere' : '❌ Insufficiente'
    return (
      <div style={{ paddingBottom: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <button onClick={() => { setVista('mappa'); setMqDomande([]); setMqFinished(false) }}
            style={{ background: 'none', border: 'none', color: oro, fontSize: 13, cursor: 'pointer', fontFamily: '"DM Sans",sans-serif', padding: 0 }}>
            {atx('indietro')}
          </button>
          <div style={{ flex: 1, height: 4, background: chiaro, borderRadius: 2 }}>
            {mqDomande.length > 0 && <div style={{ height: '100%', borderRadius: 2, background: terra,
              width: `${Math.round((mqIdx / mqDomande.length) * 100)}%`, transition: 'width 0.3s' }}/>}
          </div>
          {mqScore.tot > 0 && <span style={{ fontSize: 12, color: verde, fontWeight: 700 }}>{mqScore.corr}/{mqScore.tot} ✓</span>}
        </div>

        <div style={{ ...card, background: '#FFF8F0', border: `1px solid ${oro}44`, marginBottom: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', color: oro, marginBottom: 4 }}>
            🌍 Mega Quiz — {paeseLabel}
          </div>
          <div style={{ fontSize: 12, color: medio }}>
            {mqDomande.length > 0 ? `Domanda ${mqIdx + 1} di ${mqDomande.length}` : 'Generazione in corso...'}
          </div>
        </div>

        {/* Schermata risultati finali */}
        {mqFinished && (
          <div style={{ ...card, textAlign: 'center', padding: 28 }}>
            <div style={{ fontSize: 48, marginBottom: 8 }}>{pct >= 80 ? '🏆' : pct >= 65 ? '✅' : pct >= 50 ? '⚠️' : '📚'}</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: pct >= 65 ? verde : pct >= 50 ? giallo : rosso, marginBottom: 4 }}>{pct}%</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: scuro, marginBottom: 8 }}>{giudizio}</div>
            <div style={{ fontSize: 14, color: medio, marginBottom: 20 }}>{mqScore.corr} corrette su {mqScore.tot} domande</div>
            <div style={{ fontSize: 12, color: medio, marginBottom: 20 }}>
              {pct >= 80 ? 'Ottima preparazione su ' + paeseLabel + '!' :
               pct >= 65 ? 'Buona base, continua a studiare le aree più deboli.' :
               pct >= 50 ? 'Ripassa le regioni e le sottozone principali.' :
               'Torna all\u2019Atlante e studia sistematicamente ogni regione.'}
            </div>
            <button style={{ ...btnP, marginBottom: 10 }} onClick={avviaMegaQuiz}>🔄 Nuovo quiz</button>
            <button style={{ ...btnO }} onClick={() => { setVista('mappa'); setMqDomande([]); setMqFinished(false) }}>← Torna alla mappa</button>
          </div>
        )}

        {/* Loading */}
        {mqLoading && (
          <div style={{ ...card, textAlign: 'center', padding: 32, color: medio }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>⏳</div>
            <div>Generazione mega quiz in corso...</div>
            <div style={{ fontSize: 12, marginTop: 4 }}>L'AI sta preparando 25 domande su {paeseLabel}</div>
          </div>
        )}

        {/* Domanda attiva */}
        {!mqLoading && !mqFinished && dom && dom.tipo !== 'errore' && (
          <div>
            <div style={{ ...card, marginBottom: 12 }}>
              {dom.regione && <div style={{ fontSize: 10, color: oro, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>📍 {dom.regione}</div>}
              <div style={{ fontSize: 15, fontWeight: 600, color: scuro, lineHeight: 1.5 }}>{dom.domanda || dom.testo}</div>
            </div>

            {/* Multipla */}
            {dom.tipo === 'multipla' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
                {['a','b','c','d'].map(lettera => {
                  const isSelected = mqRisposta === lettera
                  const isCorrect = mqFeedback && lettera === dom.corretta
                  const isWrong = mqFeedback && isSelected && !mqFeedback.ok
                  return (
                    <button key={lettera} onClick={() => mqRispondi(lettera)}
                      style={{ textAlign: 'left', padding: '12px 14px', borderRadius: 10, fontSize: 13, cursor: mqFeedback ? 'default' : 'pointer', fontFamily: '"DM Sans",sans-serif',
                        background: isCorrect ? '#E8F5E9' : isWrong ? '#FDECEA' : isSelected ? '#FFF3E0' : '#fff',
                        border: `1.5px solid ${isCorrect ? verde : isWrong ? rosso : isSelected ? oro : chiaro}`,
                        color: scuro, fontWeight: isSelected ? 700 : 400 }}>
                      <span style={{ color: oro, fontWeight: 700, marginRight: 8 }}>{lettera.toUpperCase()}.</span>
                      {dom.opzioni?.[lettera]}
                    </button>
                  )
                })}
              </div>
            )}

            {/* Vero/Falso */}
            {dom.tipo === 'vero_falso' && (
              <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
                {[true, false].map(val => {
                  const isSelected = mqRisposta === val
                  const isCorrect = mqFeedback && val === dom.corretta
                  const isWrong = mqFeedback && isSelected && !mqFeedback.ok
                  return (
                    <button key={String(val)} onClick={() => mqRispondi(val)}
                      style={{ flex: 1, padding: '14px', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: mqFeedback ? 'default' : 'pointer', fontFamily: '"DM Sans",sans-serif',
                        background: isCorrect ? '#E8F5E9' : isWrong ? '#FDECEA' : isSelected ? '#FFF3E0' : '#fff',
                        border: `1.5px solid ${isCorrect ? verde : isWrong ? rosso : isSelected ? oro : chiaro}`, color: scuro }}>
                      {val ? '✓ Vero' : '✗ Falso'}
                    </button>
                  )
                })}
              </div>
            )}

            {/* Flash */}
            {dom.tipo === 'flash' && !mqFeedback && (
              <div style={{ ...card, background: '#FFFBF5', border: `1px solid ${oro}44`, marginBottom: 12 }}>
                <div style={{ fontSize: 13, color: medio, marginBottom: 8 }}>Risposta:</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: scuro }}>{dom.risposta}</div>
              </div>
            )}

            {/* Feedback */}
            {mqFeedback && (
              <div style={{ ...card, background: mqFeedback.ok ? '#F0F9F4' : dom.tipo === 'flash' ? '#F0F9F4' : '#FDF0EE',
                border: `1px solid ${mqFeedback.ok || dom.tipo === 'flash' ? verde : rosso}33`, marginBottom: 12 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: mqFeedback.ok || dom.tipo === 'flash' ? verde : rosso, marginBottom: mqFeedback.spiegazione ? 8 : 0 }}>
                  {dom.tipo === 'flash' ? '💡 Segna come vista' : mqFeedback.ok ? '✓ Corretto!' : '✗ Sbagliato'}
                </div>
                {mqFeedback.spiegazione && <div style={{ fontSize: 12, color: scuro, lineHeight: 1.6 }}>{mqFeedback.spiegazione}</div>}
              </div>
            )}

            {mqFeedback && (
              <button style={btnP} onClick={mqProssima}>
                {mqIdx + 1 >= mqDomande.length ? '📊 Vedi risultati' : 'Prossima →'}
              </button>
            )}
            {dom.tipo === 'flash' && !mqFeedback && (
              <button style={btnP} onClick={() => mqRispondi('flash_ok')}>Ho capito →</button>
            )}
          </div>
        )}

        {/* Errore */}
        {!mqLoading && dom?.tipo === 'errore' && (
          <div style={{ ...card, background: '#FDF0EE', color: rosso, marginBottom: 12 }}>
            Errore: {dom.testo}
            <button style={{ ...btnO, marginTop: 10 }} onClick={avviaMegaQuiz}>{atx('riprova')}</button>
          </div>
        )}
      </div>
    )
  }

  // ── MAPPA PRINCIPALE ─────────────────────────────────────────────
  const nStudiate = Object.values(progressi).filter(v => v === 2).length
  const nInCorso = Object.values(progressi).filter(v => v === 1).length
  const totalZones = COUNTRY_DATA[paese]?.totalZones || 20

  return (
    <div style={{ paddingBottom: 40 }}>

      {/* Selettore paese */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
        {Object.entries(COUNTRY_DATA).map(([pid, pd]) => (
          <button key={pid} onClick={() => setPaese(pid)}
            style={{ padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: 'pointer',
              background: paese === pid ? terra : '#fff',
              color: paese === pid ? '#fff' : scuro,
              border: `1.5px solid ${paese === pid ? terra : chiaro}`,
              fontFamily: '"DM Sans",sans-serif' }}>
            {pd.label}
          </button>
        ))}
      </div>

      <div style={{ fontSize: 12, color: medio, marginBottom: 14, lineHeight: 1.5 }}>
        Clicca su una zona per esplorare denominazioni, vitigni e sotto-zone.
      </div>

      {/* Mappa */}
      <div style={{ ...card, padding: 8, marginBottom: 12 }}>
        <MappaPaese REGIONS={REGIONS} SVG_W={SVG_W} SVG_H={SVG_H}
          paese={paese} progressi={progressi} onSelect={apriRegione} selected={selected}/>
      </div>

      {/* Legenda */}
      <div style={{ display: 'flex', gap: 14, marginBottom: 14, flexWrap: 'wrap' }}>
        {[[verde,atx('studiata_label')],[giallo,atx('in_studio_label')],['#D6CEBE',atx('non_studiata_label')]].map(([col,lab]) => (
          <div key={lab} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: medio }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: col }}/>
            {lab}
          </div>
        ))}
      </div>

      {/* Progressi */}
      <div style={{ ...card, display: 'flex', justifyContent: 'space-around', textAlign: 'center', marginBottom: 12 }}>
        <div><div style={{ fontSize: 22, fontWeight: 800, color: verde }}>{nStudiate}</div><div style={{ fontSize: 10, color: medio, textTransform: 'uppercase', letterSpacing: 1 }}>Studiate</div></div>
        <div style={{ width: 1, background: chiaro }}/>
        <div><div style={{ fontSize: 22, fontWeight: 800, color: giallo }}>{nInCorso}</div><div style={{ fontSize: 10, color: medio, textTransform: 'uppercase', letterSpacing: 1 }}>{atx('in_studio_label')}</div></div>
        <div style={{ width: 1, background: chiaro }}/>
        <div><div style={{ fontSize: 22, fontWeight: 800, color: scuro }}>{totalZones-nStudiate-nInCorso}</div><div style={{ fontSize: 10, color: medio, textTransform: 'uppercase', letterSpacing: 1 }}>{atx('da_iniziare')}</div></div>
      </div>

      {/* Mega Quiz Paese */}
      <button style={{ ...btnP, marginTop: 8, width: '100%', fontSize: 14, padding: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
        onClick={avviaMegaQuiz}>
        🎓 Mega Quiz — {COUNTRY_DATA[paese]?.label || paese}
      </button>

    </div>
  )
}

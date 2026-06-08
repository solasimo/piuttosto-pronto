import { useState, useEffect, useMemo } from 'react'
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

// Mappa paese -> dati SVG
const COUNTRY_DATA = {
  italia:    { SVG_W: IT_SVG_W, SVG_H: IT_SVG_H, REGIONS: IT_REGIONS, REGION_MAPS: IT_REGION_MAPS, label: '🇮🇹 Italia',    totalZones: 20 },
  francia:   { SVG_W: FR_SVG_W, SVG_H: FR_SVG_H, REGIONS: FR_REGIONS, REGION_MAPS: FR_REGION_MAPS, label: '🇫🇷 Francia',   totalZones: 12 },
  germania:  { SVG_W: DE_SVG_W, SVG_H: DE_SVG_H, REGIONS: DE_REGIONS, REGION_MAPS: DE_REGION_MAPS, label: '🇩🇪 Germania',  totalZones: 13 },
  austria:   { SVG_W: AT_SVG_W, SVG_H: AT_SVG_H, REGIONS: AT_REGIONS, REGION_MAPS: AT_REGION_MAPS, label: '🇦🇹 Austria',   totalZones: 6  },
  spagna:    { SVG_W: ES_SVG_W, SVG_H: ES_SVG_H, REGIONS: ES_REGIONS, REGION_MAPS: ES_REGION_MAPS, label: '🇪🇸 Spagna',    totalZones: 11 },
  portogallo:{ SVG_W: PT_SVG_W, SVG_H: PT_SVG_H, REGIONS: PT_REGIONS, REGION_MAPS: PT_REGION_MAPS, label: '🇵🇹 Portogallo',totalZones: 11 },
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
          Produzione
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
export default function Atlante() {
  const [paese, setPaese] = useState('italia')
  const { SVG_W, SVG_H, REGIONS, REGION_MAPS } = COUNTRY_DATA[paese] || COUNTRY_DATA['italia']

  const [vista, setVista] = useState('mappa')        // mappa | regione | sottozona | esercizio | esercizi_regione
  const [regioni, setRegioni] = useState([])
  const [progressi, setProgressi] = useState({})
  const [selected, setSelected] = useState(null)
  const [regioneData, setRegioneData] = useState(null)
  const [sottozona, setSottozona] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedZona, setSelectedZona] = useState(null)
  const [esLoading, setEsLoading] = useState(false)

  // Esercizi regione (AI-powered flash quiz)
  const [erDomande, setErDomande] = useState([])       // array domande generate
  const [erIdx, setErIdx] = useState(0)                // domanda corrente
  const [erRisposta, setErRisposta] = useState(null)   // null | 'a'|'b'|'c'|'d' | true | false
  const [erFeedback, setErFeedback] = useState(null)   // { ok, spiegazione }
  const [erLoading, setErLoading] = useState(false)
  const [erScore, setErScore] = useState({ corr: 0, tot: 0 })

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
        sottozone: (regioneData.sottozone || []).map(sz => ({
          nome: sz.nome,
          docg: sz.docg,
          doc: sz.doc,
          focus_points: sz.focus_points,
          comuni: sz.comuni,
        })),
        focus_points: regioneData.focus_points,
      })
      const res = await fetch('/api/learning', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
        body: JSON.stringify({
          action: 'genera_esercizi_regione',
          payload: { regione: regioneCtx, regione_nome: regioneData.regione_nome }
        })
      })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error || 'Errore generazione')
      setErDomande(d.domande || [])
    } catch (e) {
      setErDomande([{ tipo: 'errore', testo: e.message }])
    }
    setErLoading(false)
  }

  function erRispondi(scelta) {
    if (erFeedback) return
    const dom = erDomande[erIdx]
    let ok = false
    if (dom.tipo === 'multipla') ok = scelta === dom.corretta
    else if (dom.tipo === 'vero_falso') ok = scelta === dom.corretta
    else if (dom.tipo === 'flash') ok = true // self-assessed
    setErRisposta(scelta)
    setErFeedback({ ok, spiegazione: dom.spiegazione || '' })
    setErScore(s => ({ corr: s.corr + (ok ? 1 : 0), tot: s.tot + 1 }))
  }

  function erProssima() {
    if (erIdx + 1 >= erDomande.length) {
      setErIdx(0); setErDomande([]); setErFeedback(null); setErRisposta(null)
    } else {
      setErIdx(i => i + 1); setErFeedback(null); setErRisposta(null)
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
            ← Indietro
          </button>
          <div style={{ fontSize: 14, fontWeight: 700, color: scuro }}>
            Esercizi — {regioneData?.regione_nome}
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
              Domande flash su sottozone, DOCG/DOC, vitigni e curiosità di {regioneData?.regione_nome}.
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
                {dom.tipo === 'multipla' ? 'Scelta multipla' : dom.tipo === 'vero_falso' ? 'Vero o Falso' : dom.tipo === 'flash' ? 'Flash card' : dom.tipo === 'abbina' ? 'Abbinamento' : 'Domanda'}
              </div>
              <div style={{ fontSize: 15, fontWeight: 600, color: scuro, lineHeight: 1.5 }}>
                {dom.domanda || dom.testo}
              </div>
            </div>

            {/* Opzioni multipla */}
            {dom.tipo === 'multipla' && (dom.opzioni || []).map((op, i) => {
              const lettera = ['a','b','c','d'][i]
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

            {/* Spiegazione dopo risposta */}
            {erFeedback && dom.tipo !== 'flash' && (
              <div style={{ ...card, borderColor: erFeedback.ok ? verde : '#9B2335',
                background: erFeedback.ok ? '#F0F9F4' : '#FDF0EE', marginTop: 8 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: erFeedback.ok ? verde : '#9B2335', marginBottom: 4 }}>
                  {erFeedback.ok ? '✓ Corretto' : '✗ Sbagliato'}
                </div>
                {erFeedback.spiegazione && (
                  <div style={{ fontSize: 13, color: scuro, lineHeight: 1.5 }}>{erFeedback.spiegazione}</div>
                )}
              </div>
            )}

            {/* Prossima / Nuova serie */}
            {erFeedback && (
              <button style={{ ...btnP, marginTop: 12 }} onClick={erProssima}>
                {erIdx + 1 >= erDomande.length ? '🔄 Nuova serie' : 'Prossima →'}
              </button>
            )}
          </div>
        )}

        {/* Errore */}
        {!erLoading && dom?.tipo === 'errore' && (
          <div style={{ ...card, borderColor: '#9B2335' }}>
            <div style={{ fontSize: 13, color: '#9B2335' }}>Errore: {dom.testo}</div>
            <button style={{ ...btnO, marginTop: 8 }} onClick={generaEsercizi}>Riprova</button>
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
            ← Indietro
          </button>
          <div style={{ fontSize: 14, fontWeight: 700, color: scuro }}>
            Esercizio — {isRegMode ? `Zone ${COUNTRY_DATA[paese]?.label || paese}` : `Sottozone ${regioneData?.regione_nome}`}
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
              <div style={{ fontSize: 14, color: medio, marginBottom: 16 }}>{fb.nCorr} / {fb.tot} corrette</div>
              <button style={btnP} onClick={isRegMode ? esResetRegioni : () => { setEsSottoRisposte({}); setEsSottoFeedback(null); setEsSottoSelected(null); setEsUltimoFeedback(null) }}>
                Riprova
              </button>
            </div>
          )
        })()}

        {/* Progresso */}
        {!esRegFeedback && !esSottoFeedback && (
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: medio, marginTop: 12 }}>
            <span>{nCompilate}/{nTot} compilate</span>
            <span style={{ color: verde }}>{Object.values(isRegMode ? esRegCorrette : esSottoCorrette).filter(Boolean).length} ✓ corrette</span>
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
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: terra, marginBottom: 10 }}>Comuni chiave</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {(sottozona.comuni || []).map(c => (
              <span key={c} style={{ padding: '4px 12px', background: '#F5EDE0', borderRadius: 20, fontSize: 12, fontWeight: 600, color: '#6B3D0A' }}>{c}</span>
            ))}
          </div>
        </div>

        {/* DOCG */}
        {sottozona.docg?.length > 0 && (
          <div style={card}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: terra, marginBottom: 10 }}>DOCG</div>
            <div>{sottozona.docg.map(d => <span key={d} style={pill('d')}>{d}</span>)}</div>
          </div>
        )}

        {/* DOC */}
        {sottozona.doc?.length > 0 && (
          <div style={card}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: verde, marginBottom: 10 }}>DOC principali</div>
            <div>{sottozona.doc.map(d => <span key={d} style={pill('g')}>{d}</span>)}</div>
          </div>
        )}

        {/* Vitigni della sottozona */}
        {regioneData && (regioneData.vitigni_rossi?.length > 0 || regioneData.vitigni_bianchi?.length > 0) && (
          <div style={card}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: terra, marginBottom: 10 }}>Vitigni della zona</div>
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
              🎯 Focus esame
            </div>
            {sottozona.focus_points.map((fp, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, marginBottom: i < sottozona.focus_points.length - 1 ? 10 : 0 }}>
                <span style={{ color: terra, fontSize: 14, flexShrink: 0, marginTop: 1 }}>•</span>
                <span style={{ fontSize: 13, color: scuro, lineHeight: 1.6 }}>{fp.testo}</span>
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
            ← Italia
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
                    {l===0?'Non studiata':l===1?'In studio':'Studiata ✓'}
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
                  if (sz) { setSottozona(sz); setVista('sottozona') }
                }}
                selectedZona={selectedZona}
              />
            </div>

            {/* Legenda colori sottozone */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
              {(regioneData.sottozone || []).map((sz, i) => {
                const col = ZONA_COLORS[i % ZONA_COLORS.length]
                return (
                  <div key={i} onClick={() => { setSottozona(sz); setVista('sottozona') }}
                    style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 20, background: col.fill, border: `1px solid ${col.stroke}`, cursor: 'pointer' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: col.stroke, flexShrink: 0 }}/>
                    <span style={{ fontSize: 11, fontWeight: 600, color: col.label }}>{sz.nome}</span>
                  </div>
                )
              })}
            </div>

            {/* Vitigni + barra produzione */}
            <div style={card}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: terra, marginBottom: 10 }}>Vitigni principali</div>
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
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: '#8B3D0A', marginBottom: 10 }}>DOCG</div>
                  <div>{allDocg.map(d => <span key={d} style={pill('d')}>{d}</span>)}</div>
                </div>
              ) : null
            })()}

            {/* DOC */}
            {(() => {
              const allDoc = (regioneData.sottozone || []).flatMap(sz => sz.doc || [])
              return allDoc.length > 0 ? (
                <div style={card}>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: verde, marginBottom: 10 }}>DOC principali</div>
                  <div>{allDoc.map(d => <span key={d} style={pill('g')}>{d}</span>)}</div>
                </div>
              ) : null
            })()}

            {/* Focus esame */}
            {regioneData.focus_points?.length > 0 && (
              <div style={{ ...card, background: '#FFFBF5', border: `1px solid ${oro}44` }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: oro, marginBottom: 10 }}>
                  🎯 Focus esame
                </div>
                {regioneData.focus_points.map((fp, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, marginBottom: i < regioneData.focus_points.length - 1 ? 10 : 0 }}>
                    <span style={{ color: terra, fontSize: 14, flexShrink: 0, marginTop: 1 }}>•</span>
                    <span style={{ fontSize: 13, color: scuro, lineHeight: 1.6 }}>{fp.testo}</span>
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
        {[[verde,'Studiata'],[giallo,'In studio'],['#D6CEBE','Non studiata']].map(([col,lab]) => (
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
        <div><div style={{ fontSize: 22, fontWeight: 800, color: giallo }}>{nInCorso}</div><div style={{ fontSize: 10, color: medio, textTransform: 'uppercase', letterSpacing: 1 }}>In studio</div></div>
        <div style={{ width: 1, background: chiaro }}/>
        <div><div style={{ fontSize: 22, fontWeight: 800, color: scuro }}>{totalZones-nStudiate-nInCorso}</div><div style={{ fontSize: 10, color: medio, textTransform: 'uppercase', letterSpacing: 1 }}>Da iniziare</div></div>
      </div>


    </div>
  )
}

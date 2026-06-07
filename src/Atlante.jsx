import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import { SVG_W, SVG_H, REGIONS } from './italySvgData'
import { REGION_MAPS } from './italyRegionMaps'


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


// ── Mappa Regione con province colorate per sottozona ────────────────────────
function MappaRegione({ regione_id, sottozone, onSelectZona, selectedZona }) {
  const mapData = REGION_MAPS[regione_id]
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
            <text x={pd.cx} y={pd.cy} textAnchor="middle" dominantBaseline="middle"
              fontSize="6" fontFamily="DM Sans" fontWeight="500"
              fill={col.label} pointerEvents="none">
              {prov}
            </text>
          </g>
        )
      })}
      {/* Label sottozone al centroide */}
      {Object.entries(zonaCentroids).map(([zi, pts]) => {
        const cx = pts.xs.reduce((a,b)=>a+b,0)/pts.xs.length
        const cy = pts.ys.reduce((a,b)=>a+b,0)/pts.ys.length
        const col = ZONA_COLORS[parseInt(zi) % ZONA_COLORS.length]
        const sz = sottozone?.[parseInt(zi)]
        if (!sz) return null
        // Abbrevia il nome della sottozona
        const label = sz.nome.length > 16 ? sz.nome.split(' ')[0] : sz.nome
        return (
          <text key={zi} x={cx} y={cy - 10} textAnchor="middle" dominantBaseline="middle"
            fontSize="5.5" fontFamily="DM Sans" fontWeight="700"
            fill={col.stroke} pointerEvents="none">
            {label}
          </text>
        )
      })}
    </svg>
  )
}

// ── Mappa Italia ─────────────────────────────────────────────────────────────
function MappaItalia({ progressi, onSelect, selected }) {
  return (
    <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
      <rect width={SVG_W} height={SVG_H} fill={avorio} rx="8"/>
      {Object.values(REGIONS).map(reg => {
        const livello = progressi[reg.id] || 0
        const isSel = selected === reg.id
        const fill = regionColor(livello, isSel)
        const stroke = isSel ? terra : '#fff'
        const sw = isSel ? 1.5 : 0.5
        return (
          <g key={reg.id} onClick={() => onSelect(reg.id)} style={{ cursor: 'pointer' }}>
            <path d={reg.path} fill={fill} stroke={stroke} strokeWidth={sw}
              style={{ transition: 'fill 0.2s' }}/>
            {/* Label solo per regioni grandi */}
            {['PIE','LOM','VEN','TOS','SIC','SAR','CAM','PUG','LAZ','EMR'].includes(reg.id) && (
              <text x={reg.cx} y={reg.cy} textAnchor="middle" dominantBaseline="middle"
                fontSize="7" fontFamily="DM Sans, sans-serif" fontWeight="600"
                fill={isSel || livello === 2 ? '#fff' : '#555'} pointerEvents="none">
                {reg.label}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}

// ── Componente principale ─────────────────────────────────────────────────────
export default function Atlante() {
  const [vista, setVista] = useState('mappa')        // mappa | regione | sottozona | esercizio
  const [regioni, setRegioni] = useState([])
  const [progressi, setProgressi] = useState({})
  const [selected, setSelected] = useState(null)
  const [regioneData, setRegioneData] = useState(null)
  const [sottozona, setSottozona] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedZona, setSelectedZona] = useState(null)
  const [esLoading, setEsLoading] = useState(false)

  // Esercizio
  const [esMode, setEsMode] = useState('regioni')    // regioni | sottozone
  const [esRegRisposte, setEsRegRisposte] = useState({})
  const [esRegFeedback, setEsRegFeedback] = useState(null)
  const [esSottoRisposte, setEsSottoRisposte] = useState({})
  const [esSottoFeedback, setEsSottoFeedback] = useState(null)
  const [esRegSelected, setEsRegSelected] = useState(null)
  const [esSottoSelected, setEsSottoSelected] = useState(null)
  const [esInput, setEsInput] = useState('')

  useEffect(() => { carica() }, [])

  async function carica() {
    setLoading(true)
    try {
      const [{ regioni: r }, { progressi: p }] = await Promise.all([
        apiMappe('get_regioni', { paese: 'italia' }),
        apiMappe('get_progressi_mappa', { paese: 'italia' }),
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
      const { regione } = await apiMappe('get_regione', { paese: 'italia', regione_id: reg_id })
      setRegioneData(regione)
    } catch (e) { console.error(e) }
  }

  async function segnaStudiata(reg_id, livello) {
    await apiMappe('salva_progresso_mappa', { paese: 'italia', regione_id: reg_id, livello_studio: livello })
    setProgressi(p => ({ ...p, [reg_id]: livello }))
  }

  // Esercizio regioni: click su regione → inserisci nome
  function esClickRegione(reg_id) {
    if (esRegFeedback) return
    setEsRegSelected(reg_id)
    setEsInput(esRegRisposte[reg_id] || '')
  }

  function esConfermaRegione() {
    if (!esRegSelected || !esInput.trim()) return
    setEsRegRisposte(prev => ({ ...prev, [esRegSelected]: esInput.trim() }))
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
    setEsRegFeedback(null)
    setEsRegSelected(null)
    setEsInput('')
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
            Esercizio — {isRegMode ? 'Regioni Italia' : `Sottozone ${regioneData?.regione_nome}`}
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
                const fb = esRegFeedback?.feedback[reg.id]
                const fill = esRegFeedback
                  ? (fb ? '#2D6A4F' : risposta ? '#9B2335' : '#D6CEBE')
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

        {/* Campo input */}
        {(esRegSelected || esSottoSelected !== null) && !esRegFeedback && !esSottoFeedback && (
          <div style={{ ...card, borderColor: terra, marginBottom: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: terra, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>
              {isRegMode ? `Regione selezionata: ${REGIONS[esRegSelected]?.label}` : `Zona ${esSottoSelected + 1}`}
            </div>
            <input autoFocus value={esInput} onChange={e => setEsInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (isRegMode ? esConfermaRegione() : esConfermaSottozona())}
              placeholder="Scrivi il nome..."
              style={{ width: '100%', border: 'none', outline: 'none', fontSize: 15, color: scuro, background: 'transparent', fontFamily: '"DM Sans",sans-serif', boxSizing: 'border-box' }}/>
          </div>
        )}

        {/* Pulsanti azione */}
        <div style={{ display: 'flex', gap: 8 }}>
          {(esRegSelected || esSottoSelected !== null) && !esRegFeedback && !esSottoFeedback && (
            <button style={{ ...btnP, flex: 1 }} onClick={isRegMode ? esConfermaRegione : esConfermaSottozona}>
              Conferma
            </button>
          )}
          {!esRegFeedback && !esSottoFeedback && nCompilate === nTot && nTot > 0 && (
            <button style={{ ...btnP, flex: 1 }} onClick={isRegMode ? esVerificaRegioni : esVerificaSottozone}>
              Verifica tutto →
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
              <button style={btnP} onClick={isRegMode ? esResetRegioni : () => { setEsSottoRisposte({}); setEsSottoFeedback(null); setEsSottoSelected(null) }}>
                Riprova
              </button>
            </div>
          )
        })()}

        {/* Progresso */}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: medio, marginTop: 12 }}>
          <span>{nCompilate}/{nTot} compilate</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <span style={{ color: '#B8956A' }}>● Non compilata</span>
            <span style={{ color: terra }}>● Selezionata</span>
          </div>
        </div>
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

            {/* Vitigni */}
            <div style={card}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: terra, marginBottom: 10 }}>Vitigni</div>
              <div>
                {(regioneData.vitigni_rossi || []).map(v => <span key={v} style={pill('r')}>{v}</span>)}
                {(regioneData.vitigni_bianchi || []).map(v => <span key={v} style={pill('b')}>{v}</span>)}
              </div>
            </div>

            {/* Sottozone */}
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: oro, marginBottom: 8, marginTop: 4 }}>Zone viticole</div>
            {(regioneData.sottozone || []).map((sz, i) => (
              <div key={i} onClick={() => { setSottozona(sz); setVista('sottozona') }}
                style={{ ...card, cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: scuro, marginBottom: 3 }}>{sz.nome}</div>
                  <div style={{ fontSize: 11, color: medio }}>
                    {sz.comuni?.slice(0,3).join(' · ')}
                    {sz.docg?.length > 0 && <span style={{ marginLeft: 6, color: '#8B3D0A', fontWeight: 600 }}>· {sz.docg.length} DOCG</span>}
                  </div>
                </div>
                <span style={{ color: oro, fontSize: 16 }}>›</span>
              </div>
            ))}

            {/* Pulsante esercizio sottozone */}
            <button style={{ ...btnO, marginTop: 8 }} onClick={() => { setEsSottoRisposte({}); setEsSottoFeedback(null); setEsSottoSelected(null); setEsMode('sottozone'); setVista('esercizio') }}>
              🗺️ Esercizio sottozone
            </button>
          </>
        )}
      </div>
    )
  }

  // ── MAPPA PRINCIPALE ─────────────────────────────────────────────
  const nStudiate = Object.values(progressi).filter(v => v === 2).length
  const nInCorso = Object.values(progressi).filter(v => v === 1).length

  return (
    <div style={{ paddingBottom: 40 }}>
      <div style={{ fontSize: 12, color: medio, marginBottom: 14, lineHeight: 1.5 }}>
        Clicca su una regione per esplorare zone viticole, DOCG, DOC e vitigni.
      </div>

      {/* Mappa */}
      <div style={{ ...card, padding: 8, marginBottom: 12 }}>
        <MappaItalia progressi={progressi} onSelect={apriRegione} selected={selected}/>
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
        <div><div style={{ fontSize: 22, fontWeight: 800, color: scuro }}>{20-nStudiate-nInCorso}</div><div style={{ fontSize: 10, color: medio, textTransform: 'uppercase', letterSpacing: 1 }}>Da iniziare</div></div>
      </div>

      {/* Pulsante esercizio regioni */}
      <button style={btnP} onClick={() => { setEsRegRisposte({}); setEsRegFeedback(null); setEsRegSelected(null); setEsMode('regioni'); setVista('esercizio') }}>
        🗺️ Esercizio mappa — Regioni Italia
      </button>
    </div>
  )
}

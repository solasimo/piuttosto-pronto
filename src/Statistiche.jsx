import { useState, useMemo } from 'react'
import { getMaturita, matColor, DettaglioBottiglia } from './Libreria'
import { PAESI_REGIONI } from './dati'

const TIPOLOGIE = ['Rosso','Bianco','Rosato','Orange','Bollicine','Dolce','Fortificato']

const TIPO_COLORS = {
  Rosso:      '#7B1E2E',
  Bianco:     '#C8992A',
  Rosato:     '#993556',
  Orange:     '#C4621D',
  Bollicine:  '#185FA5',
  Dolce:      '#876200',
  Fortificato:'#5B2D8E',
}

const TIPO_BG = {
  Rosso:      '#FAECE7',
  Bianco:     '#FAEEDA',
  Rosato:     '#FBEAF0',
  Orange:     '#FDE8D0',
  Bollicine:  '#E6F1FB',
  Dolce:      '#FDF4DC',
  Fortificato:'#EDE6F5',
}

// ─── Stili ────────────────────────────────────────────────────────────────────
const S = {
  card: { background: '#fff', border: '1px solid #E2DDD6', borderRadius: 16, padding: 16 },
  secTit: { fontSize: 11, fontWeight: 700, color: '#7B1E2E', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 12 },
}

// ─── Sheet bottiglia (riusa DettaglioBottiglia da Libreria) ───────────────────
function BottigliaSheet({ b, onClose }) {
  if (!b) return null
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 300, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(28,20,16,0.6)', backdropFilter: 'blur(2px)' }} />
      <div style={{ position: 'relative', background: '#F4F1EC', borderRadius: '20px 20px 0 0', maxHeight: '92dvh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px' }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: '#D6D0C8' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 20px 12px' }}>
          <span style={{ fontFamily: 'Playfair Display, serif', fontSize: 17, fontWeight: 600, color: '#1C1410', flex: 1, paddingRight: 12 }}>{b.nome}</span>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: '50%', border: 'none', background: '#E2DDD6', cursor: 'pointer', fontSize: 14, color: '#7A6E65' }}>✕</button>
        </div>
        <div style={{ overflowY: 'auto', padding: '0 20px 32px', flex: 1, WebkitOverflowScrolling: 'touch' }}>
          <DettaglioBottiglia b={b} />
        </div>
      </div>
    </div>
  )
}

// ─── Mini card bottiglia nella vista regione ──────────────────────────────────
function MiniCard({ b, onClick }) {
  const m = getMaturita(b)
  const tc = TIPO_COLORS[b.tipologia] || '#7B1E2E'
  const tbg = TIPO_BG[b.tipologia] || '#F1EFE8'
  return (
    <div onClick={onClick} style={{ background: '#fff', border: '1px solid #E2DDD6', borderRadius: 12, padding: 12, cursor: 'pointer', transition: 'border-color 0.15s' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
        <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', padding: '2px 8px', borderRadius: 100, background: tbg, color: tc }}>{b.tipologia}</span>
        <span style={{ fontSize: 11, color: matColor(m.cls), fontWeight: 600 }}>●</span>
      </div>
      <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 13, fontWeight: 600, color: '#1C1410', lineHeight: 1.3, marginBottom: 2 }}>{b.nome}</div>
      <div style={{ fontSize: 11, color: '#7A6E65', marginBottom: 4 }}>{b.cantina}</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#1C1410' }}>{b.anno}</span>
        <span style={{ fontSize: 11, color: '#B0A89E' }}>{b.quantita} bott.</span>
      </div>
    </div>
  )
}

// ─── Vista regione espansa ────────────────────────────────────────────────────
function RegioneRow({ regione, bottiglie, onBottigliaClick }) {
  const [open, setOpen] = useState(false)
  const tot = bottiglie.reduce((s, b) => s + (b.quantita || 0), 0)

  // Breakdown per tipologia
  const byTipo = {}
  bottiglie.forEach(b => {
    byTipo[b.tipologia] = (byTipo[b.tipologia] || 0) + (b.quantita || 0)
  })
  const totTipo = Object.values(byTipo).reduce((s, v) => s + v, 0)

  return (
    <div style={{ marginBottom: 6 }}>
      <div
        onClick={() => setOpen(o => !o)}
        style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: '#fff', border: '1px solid #E2DDD6', borderRadius: open ? '12px 12px 0 0' : 12, cursor: 'pointer', transition: 'border-radius 0.15s' }}>
        {/* Nome regione */}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#1C1410', marginBottom: 4 }}>{regione}</div>
          {/* Barra breakdown tipologie */}
          <div style={{ height: 6, borderRadius: 3, background: '#F0ECE5', overflow: 'hidden', display: 'flex' }}>
            {TIPOLOGIE.filter(t => byTipo[t]).map(t => (
              <div key={t} style={{ height: '100%', width: `${Math.round((byTipo[t] / totTipo) * 100)}%`, background: TIPO_COLORS[t] }} />
            ))}
          </div>
        </div>
        {/* Contatori */}
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#1C1410' }}>{bottiglie.length}</div>
          <div style={{ fontSize: 10, color: '#B0A89E' }}>etich.</div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#1C1410' }}>{tot}</div>
          <div style={{ fontSize: 10, color: '#B0A89E' }}>bott.</div>
        </div>
        <span style={{ fontSize: 14, color: '#B0A89E', transform: open ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }}>›</span>
      </div>

      {/* Espanso: legenda tipologie + card bottiglie */}
      {open && (
        <div style={{ background: '#F9F7F4', border: '1px solid #E2DDD6', borderTop: 'none', borderRadius: '0 0 12px 12px', padding: 12 }}>
          {/* Legenda tipologie */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
            {TIPOLOGIE.filter(t => byTipo[t]).map(t => (
              <span key={t} style={{ fontSize: 11, padding: '3px 10px', borderRadius: 100, background: TIPO_BG[t], color: TIPO_COLORS[t], fontWeight: 600 }}>
                {t}: {byTipo[t]}
              </span>
            ))}
          </div>
          {/* Card bottiglie */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 8 }}>
            {bottiglie.map(b => (
              <MiniCard key={b.id} b={b} onClick={() => onBottigliaClick(b)} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Riga paese con drill-down ────────────────────────────────────────────────
function PaeseSection({ paese, regioni, bottigliePaese, onBottigliaClick }) {
  const [open, setOpen] = useState(false)

  const totEtichette = bottigliePaese.length
  const totBottiglie = bottigliePaese.reduce((s, b) => s + (b.quantita || 0), 0)
  const regioniPresenti = [...new Set(bottigliePaese.map(b => b.regione).filter(Boolean))]
  const totRegioni = regioni.length
  const coperte = regioniPresenti.filter(r => regioni.includes(r)).length

  // Bottiglie per regione
  const byRegione = {}
  bottigliePaese.forEach(b => {
    if (!b.regione) return
    if (!byRegione[b.regione]) byRegione[b.regione] = []
    byRegione[b.regione].push(b)
  })

  // Copertura percentuale
  const pctCopertura = Math.round((coperte / totRegioni) * 100)
  const copertura_color = pctCopertura >= 60 ? '#2D6A4F' : pctCopertura >= 30 ? '#C77B13' : '#9B2335'

  return (
    <div style={{ ...S.card, marginBottom: 12, padding: 0, overflow: 'hidden' }}>
      {/* Header paese */}
      <div onClick={() => setOpen(o => !o)} style={{ padding: '14px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span style={{ fontFamily: 'Playfair Display, serif', fontSize: 16, fontWeight: 600, color: '#1C1410' }}>{paese}</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: copertura_color, background: `${copertura_color}18`, padding: '2px 8px', borderRadius: 100 }}>
              {coperte}/{totRegioni} regioni
            </span>
          </div>
          {/* Barra copertura regioni */}
          <div style={{ height: 5, borderRadius: 3, background: '#F0ECE5', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${pctCopertura}%`, background: copertura_color, borderRadius: 3, transition: 'width 0.5s' }} />
          </div>
        </div>
        <div style={{ textAlign: 'center', flexShrink: 0 }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#1C1410' }}>{totEtichette}</div>
          <div style={{ fontSize: 10, color: '#B0A89E' }}>etich.</div>
        </div>
        <div style={{ textAlign: 'center', flexShrink: 0 }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#1C1410' }}>{totBottiglie}</div>
          <div style={{ fontSize: 10, color: '#B0A89E' }}>bott.</div>
        </div>
        <span style={{ fontSize: 16, color: '#B0A89E', transform: open ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }}>›</span>
      </div>

      {/* Dettaglio regioni */}
      {open && (
        <div style={{ padding: '0 12px 14px', borderTop: '1px solid #F0ECE5' }}>

          {/* Regioni presenti */}
          {regioniPresenti.filter(r => regioni.includes(r)).length > 0 && (
            <div style={{ marginTop: 12, marginBottom: 8 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#2D6A4F', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
                ✓ Regioni presenti ({coperte})
              </div>
              {regioni.filter(r => byRegione[r]).map(r => (
                <RegioneRow key={r} regione={r} bottiglie={byRegione[r]} onBottigliaClick={onBottigliaClick} />
              ))}
            </div>
          )}

          {/* Regioni non coperte */}
          {regioni.filter(r => !byRegione[r]).length > 0 && (
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#B0A89E', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
                ○ Da esplorare ({totRegioni - coperte})
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {regioni.filter(r => !byRegione[r]).map(r => (
                  <span key={r} style={{ fontSize: 12, padding: '4px 10px', borderRadius: 100, background: '#F4F1EC', color: '#B0A89E', border: '1px dashed #D6D0C8' }}>{r}</span>
                ))}
              </div>
            </div>
          )}

          {/* Bottiglie senza regione mappata */}
          {bottigliePaese.filter(b => !b.regione || !regioni.includes(b.regione)).length > 0 && (
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#7A6E65', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
                Regione non specificata
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 8 }}>
                {bottigliePaese.filter(b => !b.regione || !regioni.includes(b.regione)).map(b => (
                  <MiniCard key={b.id} b={b} onClick={() => onBottigliaClick(b)} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Vista tipologie ──────────────────────────────────────────────────────────
function VistaTipologie({ cantina }) {
  const byTipo = {}
  TIPOLOGIE.forEach(t => byTipo[t] = { etichette: 0, bottiglie: 0 })
  cantina.forEach(b => {
    if (!byTipo[b.tipologia]) return
    byTipo[b.tipologia].etichette++
    byTipo[b.tipologia].bottiglie += (b.quantita || 0)
  })
  const maxE = Math.max(...Object.values(byTipo).map(v => v.etichette), 1)

  return (
    <div style={S.card}>
      {TIPOLOGIE.map(t => {
        const v = byTipo[t]
        if (v.etichette === 0 && v.bottiglie === 0) return (
          <div key={t} style={{ marginBottom: 14, opacity: 0.4 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
              <span style={{ fontSize: 13, fontWeight: 500, color: '#B0A89E' }}>{t}</span>
              <span style={{ fontSize: 12, color: '#B0A89E' }}>—</span>
            </div>
            <div style={{ height: 8, borderRadius: 4, background: '#F0ECE5' }} />
          </div>
        )
        return (
          <div key={t} style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, alignItems: 'center' }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: TIPO_COLORS[t] }}>{t}</span>
              <div style={{ display: 'flex', gap: 8 }}>
                <span style={{ fontSize: 12, color: '#7A6E65' }}>{v.etichette} etich.</span>
                <span style={{ fontSize: 12, color: '#B0A89E' }}>·</span>
                <span style={{ fontSize: 12, color: '#7A6E65' }}>{v.bottiglie} bott.</span>
              </div>
            </div>
            <div style={{ height: 8, borderRadius: 4, background: '#F0ECE5', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${Math.round((v.etichette / maxE) * 100)}%`, background: TIPO_COLORS[t], borderRadius: 4, transition: 'width 0.5s' }} />
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── COMPONENTE PRINCIPALE ────────────────────────────────────────────────────
export default function Statistiche({ cantina }) {
  const [vista, setVista] = useState('paesi')
  const [bottSelected, setBottSelected] = useState(null)

  // KPI
  const totBottiglie = cantina.reduce((s, b) => s + (b.quantita || 0), 0)
  const paesiPresenti = new Set(cantina.map(b => b.paese).filter(Boolean))
  const paesiCoperti = Object.keys(PAESI_REGIONI).filter(p => paesiPresenti.has(p)).length
  const totPaesi = Object.keys(PAESI_REGIONI).length
  const tipologiePresenti = new Set(cantina.map(b => b.tipologia).filter(Boolean))
  const tipologieCoperte = [...tipologiePresenti].filter(t => ['Rosso','Bianco','Rosato','Orange','Bollicine','Dolce','Fortificato'].includes(t)).length

  // Bottiglie per paese
  const byPaese = useMemo(() => {
    const m = {}
    cantina.forEach(b => {
      const p = b.paese || 'Altro'
      if (!m[p]) m[p] = []
      m[p].push(b)
    })
    return m
  }, [cantina])

  return (
    <div>
      {/* KPI */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
        {[
          ['🍾', 'Etichette', cantina.length, null],
          ['📦', 'Bottiglie', totBottiglie, null],
          ['🌍', 'Paesi coperti', `${paesiCoperti}/${totPaesi}`, null],
          ['🎨', 'Tipologie', `${tipologieCoperte}/7`, null],
        ].map(([ico, l, v]) => (
          <div key={l} style={{ ...S.card, textAlign: 'center', padding: '16px 10px' }}>
            <div style={{ fontSize: 22, marginBottom: 4 }}>{ico}</div>
            <div style={{ fontSize: 24, fontWeight: 700, fontFamily: 'Playfair Display, serif', color: '#1C1410' }}>{v}</div>
            <div style={{ fontSize: 11, color: '#7A6E65', marginTop: 2 }}>{l}</div>
          </div>
        ))}
      </div>

      {/* Selettore vista */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {[['paesi','🌍 Per paese'],['tipologie','🎨 Per tipologia']].map(([k, l]) => (
          <button key={k} onClick={() => setVista(k)} style={{ flex: 1, padding: '9px 0', borderRadius: 100, border: '1.5px solid', borderColor: vista === k ? '#7B1E2E' : '#E2DDD6', background: vista === k ? '#7B1E2E' : '#fff', color: vista === k ? '#fff' : '#7A6E65', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>{l}</button>
        ))}
      </div>

      {/* Vista paesi */}
      {vista === 'paesi' && (
        <div>
          {Object.entries(PAESI_REGIONI).map(([paese, regioni]) => (
            <PaeseSection
              key={paese}
              paese={paese}
              regioni={regioni}
              bottigliePaese={byPaese[paese] || []}
              onBottigliaClick={setBottSelected}
            />
          ))}
          {/* Bottiglie con paese non in lista */}
          {Object.entries(byPaese).filter(([p]) => !PAESI_REGIONI[p]).map(([paese, bott]) => (
            <div key={paese} style={{ ...S.card, marginBottom: 12 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#7A6E65', marginBottom: 8 }}>{paese || 'Paese non specificato'}</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 8 }}>
                {bott.map(b => <MiniCard key={b.id} b={b} onClick={() => setBottSelected(b)} />)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Vista tipologie */}
      {vista === 'tipologie' && <VistaTipologie cantina={cantina} />}

      {/* Sheet dettaglio bottiglia */}
      <BottigliaSheet b={bottSelected} onClose={() => setBottSelected(null)} />
    </div>
  )
}

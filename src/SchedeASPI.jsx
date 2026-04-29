import { useState, useMemo } from 'react'

// ─── Opzioni filtri ───────────────────────────────────────────────────────────
const TIPOLOGIE = ['Rosso','Bianco','Rosato','Orange','Bollicine','Dolce','Fortificato']

const BOUQUET_TIPOLOGIE = ['Primario','Secondario','Terziario']

const BOUQUET_CATEGORIE = {
  Primario:   ['Agrumi','Frutta fresca','Frutti di bosco','Frutta esotica','Fiori','Erbe aromatiche','Erbaceo/vegetali','Legni aromatici','Minerali'],
  Secondario: ['Vinoso','Da malolattica','Da lieviti'],
  Terziario:  ['Speziato','Tostato','Animale','Confetture','Frutta secca','Sottobosco'],
}

// ─── Stili ────────────────────────────────────────────────────────────────────
const S = {
  card: { background: '#fff', border: '1px solid #E2DDD6', borderRadius: 16, padding: 16 },
  pill: (active) => ({
    padding: '6px 14px', borderRadius: 100, border: '1.5px solid',
    borderColor: active ? '#7B1E2E' : '#E2DDD6',
    background: active ? '#7B1E2E' : '#fff',
    color: active ? '#fff' : '#7A6E65',
    fontSize: 13, fontWeight: active ? 600 : 400, cursor: 'pointer',
    flexShrink: 0, whiteSpace: 'nowrap',
  }),
  subPill: (active) => ({
    padding: '4px 11px', borderRadius: 100, border: '1.5px solid',
    borderColor: active ? '#7B1E2E' : '#E2DDD6',
    background: active ? '#F5EFE0' : '#fff',
    color: active ? '#7B1E2E' : '#7A6E65',
    fontSize: 12, fontWeight: active ? 600 : 400, cursor: 'pointer',
    flexShrink: 0, whiteSpace: 'nowrap',
  }),
  secLabel: { fontSize: 11, fontWeight: 600, color: '#B0A89E', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
}

// ─── Pannello filtri ──────────────────────────────────────────────────────────
function FiltriPanel({ filtri, onChange, onReset, totale, filtrato }) {
  // Toggle helper
  const toggle = (key, val) => {
    const curr = filtri[key] || []
    onChange({ ...filtri, [key]: curr.includes(val) ? curr.filter(x => x !== val) : [...curr, val] })
  }

  // Quando cambiano le tipologie bouquet, pulisce le categorie orfane
  const toggleBouquetTipo = (val) => {
    const curr = filtri.bouquetTipologie || []
    const next = curr.includes(val) ? curr.filter(x => x !== val) : [...curr, val]
    // rimuove categorie che appartengono a tipologie deselezionate
    const nextCat = (filtri.bouquetCategorie || []).filter(c =>
      next.some(t => BOUQUET_CATEGORIE[t]?.includes(c))
    )
    onChange({ ...filtri, bouquetTipologie: next, bouquetCategorie: nextCat })
  }

  const attivi = [
    ...(filtri.tipologie || []),
    ...(filtri.bouquetTipologie || []),
    ...(filtri.bouquetCategorie || []),
    ...(filtri.annate || []),
  ].length

  // Categorie disponibili in base alle tipologie bouquet selezionate
  const catDisponibili = (filtri.bouquetTipologie || []).flatMap(t => BOUQUET_CATEGORIE[t] || [])

  return (
    <div style={{ background: '#fff', border: '1px solid #E2DDD6', borderRadius: 14, padding: 16, marginBottom: 16 }}>

      {/* Header pannello */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#1C1410' }}>
          Filtri attivi: {attivi} {attivi > 0 && <span style={{ color: '#7B1E2E' }}>({filtrato} di {totale})</span>}
        </span>
        {attivi > 0 && (
          <button onClick={onReset} style={{ fontSize: 12, color: '#7B1E2E', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, padding: 0 }}>
            Azzera filtri
          </button>
        )}
      </div>

      {/* Tipologia vino */}
      <div style={{ marginBottom: 16 }}>
        <div style={S.secLabel}>Tipologia vino</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {TIPOLOGIE.map(t => (
            <button key={t} onClick={() => toggle('tipologie', t)} style={S.pill((filtri.tipologie || []).includes(t))}>{t}</button>
          ))}
        </div>
      </div>

      {/* Bouquet — tipologia */}
      <div style={{ marginBottom: catDisponibili.length > 0 ? 12 : 0 }}>
        <div style={S.secLabel}>Bouquet — tipologia</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {BOUQUET_TIPOLOGIE.map(t => (
            <button key={t} onClick={() => toggleBouquetTipo(t)} style={S.pill((filtri.bouquetTipologie || []).includes(t))}>{t}</button>
          ))}
        </div>
      </div>

      {/* Bouquet — categorie (condizionale) */}
      {catDisponibili.length > 0 && (
        <div style={{ marginBottom: 16, paddingLeft: 12, borderLeft: '2px solid #F0ECE5' }}>
          <div style={{ ...S.secLabel, marginTop: 10 }}>Aromi specifici</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {catDisponibili.map(c => (
              <button key={c} onClick={() => toggle('bouquetCategorie', c)} style={S.subPill((filtri.bouquetCategorie || []).includes(c))}>{c}</button>
            ))}
          </div>
        </div>
      )}

      {/* Annata */}
      <div>
        <div style={S.secLabel}>Annata</div>
        <AnnataInput
          valori={filtri.annate || []}
          onChange={v => onChange({ ...filtri, annate: v })}
        />
      </div>
    </div>
  )
}

// Input annata con aggiunta manuale
function AnnataInput({ valori, onChange }) {
  const [input, setInput] = useState('')
  const aggiungi = () => {
    const v = input.trim()
    if (!v || valori.includes(v)) { setInput(''); return }
    if (!/^\d{4}$/.test(v)) return
    onChange([...valori, v])
    setInput('')
  }
  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: valori.length ? 8 : 0 }}>
        <input
          value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && aggiungi()}
          placeholder="es. 2018"
          maxLength={4}
          style={{ width: 90, padding: '7px 12px', border: '1.5px solid #E2DDD6', borderRadius: 8, fontSize: 14, background: '#fff', color: '#1C1410' }}
        />
        <button onClick={aggiungi} style={{ padding: '7px 14px', background: '#7B1E2E', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>+</button>
      </div>
      {valori.length > 0 && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {valori.map(v => (
            <button key={v} onClick={() => onChange(valori.filter(x => x !== v))} style={{ ...S.pill(true), display: 'flex', alignItems: 'center', gap: 6 }}>
              {v} <span style={{ fontSize: 14, opacity: 0.7 }}>×</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Modale conferma eliminazione ────────────────────────────────────────────
function ConfermaElimina({ scheda, onConferma, onAnnulla }) {
  if (!scheda) return null
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div onClick={onAnnulla} style={{ position: 'absolute', inset: 0, background: 'rgba(28,20,16,0.65)', backdropFilter: 'blur(2px)' }} />
      <div style={{ position: 'relative', background: '#fff', borderRadius: 16, padding: 24, width: '100%', maxWidth: 360, boxShadow: '0 8px 40px rgba(0,0,0,0.2)' }}>
        <div style={{ fontSize: 32, textAlign: 'center', marginBottom: 12 }}>🗑️</div>
        <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 17, fontWeight: 600, textAlign: 'center', marginBottom: 8, color: '#1C1410' }}>
          Elimina scheda
        </div>
        <div style={{ fontSize: 14, color: '#7A6E65', textAlign: 'center', marginBottom: 24, lineHeight: 1.6 }}>
          Sei sicuro di voler eliminare la scheda di <strong style={{ color: '#1C1410' }}>{scheda.nomeVino || scheda.nome}</strong>? L'operazione non è reversibile.
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onAnnulla} style={{ flex: 1, padding: 13, background: '#F4F1EC', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer', color: '#7A6E65' }}>
            Annulla
          </button>
          <button onClick={() => onConferma(scheda)} style={{ flex: 1, padding: 13, background: '#9B2335', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer', color: '#fff' }}>
            Elimina
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Card singola scheda ──────────────────────────────────────────────────────
function SchedaCard({ a, onOpen, onElimina }) {
  const votoLabel = ['','Ordinario','Discreto','Buono','Ottimo','Eccellente'][a.voto] || ''
  const bs = {
    Rosso:{ bg:'#FAECE7',color:'#993C1D' }, Bianco:{ bg:'#FAEEDA',color:'#854F0B' },
    Rosato:{ bg:'#FBEAF0',color:'#993556' }, Orange:{ bg:'#FDE8D0',color:'#9A4E0A' },
    Bollicine:{ bg:'#E6F1FB',color:'#185FA5' }, Dolce:{ bg:'#FDF4DC',color:'#876200' },
    Fortificato:{ bg:'#EDE6F5',color:'#5B2D8E' },
  }[a.tipologia] || { bg:'#F1EFE8',color:'#555' }

  return (
    <div style={{ ...S.card, marginBottom: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
        {/* Contenuto principale — cliccabile */}
        <div style={{ flex: 1, cursor: 'pointer' }} onClick={() => onOpen(a)}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            {a.tipologia && (
              <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', padding: '2px 8px', borderRadius: 100, background: bs.bg, color: bs.color }}>
                {a.tipologia}
              </span>
            )}
            {a.annata && <span style={{ fontSize: 12, color: '#B0A89E' }}>{a.annata}</span>}
          </div>
          <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 15, fontWeight: 600, marginBottom: 3, color: '#1C1410' }}>
            {a.nomeVino || a.nome}
          </div>
          <div style={{ fontSize: 12, color: '#7A6E65', marginBottom: 4 }}>
            {[a.cantina, a.denominazione].filter(Boolean).join(' · ')}
          </div>
          <div style={{ fontSize: 11, color: '#B0A89E' }}>
            {a.data} {a.voto > 0 && `· ${'⭐️'.repeat(a.voto)} ${votoLabel}`}
          </div>
        </div>

        {/* Thumbnail foto se presente */}
        {a.foto_url && (
          <div onClick={() => onOpen(a)} style={{ cursor: 'pointer', flexShrink: 0 }}>
            <img src={a.foto_url} alt="" style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 8, border: '1px solid #E2DDD6' }} />
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
          <button
            onClick={() => onOpen(a)}
            style={{ width: 34, height: 34, borderRadius: '50%', border: '1.5px solid #E2DDD6', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}
            title="Modifica">✏️</button>
          <button
            onClick={() => onElimina(a)}
            style={{ width: 34, height: 34, borderRadius: '50%', border: '1.5px solid #FAECE7', background: '#FAECE7', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}
            title="Elimina">🗑️</button>
        </div>
      </div>
    </div>
  )
}

// ─── COMPONENTE PRINCIPALE ────────────────────────────────────────────────────
const FILTRI_VUOTI = { tipologie: [], bouquetTipologie: [], bouquetCategorie: [], annate: [] }

export default function SchedeASPI({ archivio, onOpen, onNuova, onElimina }) {
  const [filtriAperti, setFiltriAperti] = useState(false)
  const [filtri, setFiltri] = useState(FILTRI_VUOTI)
  const [confermaElimina, setConfermaElimina] = useState(null)
  const [cerca, setCerca] = useState('')

  const attiviFiltri = [
    ...(filtri.tipologie || []),
    ...(filtri.bouquetTipologie || []),
    ...(filtri.bouquetCategorie || []),
    ...(filtri.annate || []),
  ].length

  // Logica filtro AND + ricerca testuale
  const filtrate = useMemo(() => {
    return archivio.filter(a => {
      if (cerca.trim() && !(a.nomeVino || a.nome || '').toLowerCase().includes(cerca.toLowerCase())) return false
      if (filtri.tipologie?.length && !filtri.tipologie.includes(a.tipologia)) return false
      if (filtri.annate?.length && !filtri.annate.includes(String(a.annata))) return false
      if (filtri.bouquetTipologie?.length) {
        const aTip = a.bouquetTipologie || []
        if (!filtri.bouquetTipologie.every(t => aTip.includes(t))) return false
      }
      if (filtri.bouquetCategorie?.length) {
        const aCat = Object.values(a.bouquetCategorie || {}).flat()
        if (!filtri.bouquetCategorie.every(c => aCat.includes(c))) return false
      }
      return true
    })
  }, [archivio, filtri, cerca])

  // Raggruppa per voto
  const gruppi = {}
  filtrate.forEach(a => {
    const k = a.voto > 0 ? String(a.voto) : '0'
    if (!gruppi[k]) gruppi[k] = []
    gruppi[k].push(a)
  })
  const ordine = ['5','4','3','2','1','0']
  const labelVoto = { '5':'⭐️⭐️⭐️⭐️⭐️ Eccellenti','4':'⭐️⭐️⭐️⭐️ Ottimi','3':'⭐️⭐️⭐️ Buoni','2':'⭐️⭐️ Discreti','1':'⭐️ Ordinari','0':'Non valutati' }

  const handleConfermaElimina = (scheda) => {
    setConfermaElimina(null)
    onElimina(scheda)
  }

  const inpStyle = { width: '100%', padding: '11px 14px', border: '1.5px solid #E2DDD6', borderRadius: 10, fontSize: 15, background: '#fff', color: '#1C1410', WebkitAppearance: 'none', appearance: 'none', boxSizing: 'border-box' }

  return (
    <div>
      {/* Ricerca testuale */}
      <input
        value={cerca}
        onChange={e => setCerca(e.target.value)}
        placeholder="🔍  Cerca per nome vino..."
        style={{ ...inpStyle, marginBottom: 12 }}
      />

      {/* Barra filtri */}
      <div style={{ marginBottom: 16 }}>
        <button
          onClick={() => setFiltriAperti(v => !v)}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 16px', borderRadius: 100, border: '1.5px solid', borderColor: attiviFiltri > 0 ? '#7B1E2E' : '#E2DDD6', background: attiviFiltri > 0 ? '#F5EFE0' : '#fff', color: attiviFiltri > 0 ? '#7B1E2E' : '#7A6E65', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          <span>⚙️</span>
          Filtra
          {attiviFiltri > 0 && <span style={{ background: '#7B1E2E', color: '#fff', borderRadius: '50%', width: 18, height: 18, fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{attiviFiltri}</span>}
          <span style={{ marginLeft: 2 }}>{filtriAperti ? '▲' : '▼'}</span>
        </button>
      </div>

      {/* Pannello filtri (collassabile) */}
      {filtriAperti && (
        <FiltriPanel
          filtri={filtri}
          onChange={setFiltri}
          onReset={() => setFiltri(FILTRI_VUOTI)}
          totale={archivio.length}
          filtrato={filtrate.length}
        />
      )}

      {/* Lista schede */}
      {archivio.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#B0A89E' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📓</div>
          <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 6 }}>Nessuna scheda ancora</div>
          <div style={{ fontSize: 14 }}>Compila la prima scheda con il pulsante qui sopra</div>
        </div>
      ) : filtrate.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '32px 20px', color: '#B0A89E' }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🔍</div>
          <div style={{ fontSize: 14 }}>Nessuna scheda corrisponde ai criteri di ricerca</div>
          <button onClick={() => { setFiltri(FILTRI_VUOTI); setCerca('') }} style={{ marginTop: 12, fontSize: 13, color: '#7B1E2E', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Azzera tutto</button>
        </div>
      ) : (
        ordine.filter(k => gruppi[k]?.length > 0).map(k => (
          <div key={k} style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#7A6E65', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
              {labelVoto[k]} <span style={{ color: '#B0A89E', fontWeight: 400 }}>({gruppi[k].length})</span>
            </div>
            {gruppi[k].map(a => (
              <SchedaCard key={a.id} a={a} onOpen={onOpen} onElimina={setConfermaElimina} />
            ))}
          </div>
        ))
      )}

      {/* Modale conferma eliminazione */}
      <ConfermaElimina
        scheda={confermaElimina}
        onConferma={handleConfermaElimina}
        onAnnulla={() => setConfermaElimina(null)}
      />
    </div>
  )
}

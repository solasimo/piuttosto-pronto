import { useState, useEffect, useCallback } from 'react'
import { seedIfEmpty, getBottiglie, addBottiglia, updateBottiglia, deleteBottiglia, getSchede, addScheda, deleteScheda, updateScheda } from './supabase'
import AspiForm, { ASPI_EMPTY, TIPOLOGIE } from './AspiForm'
import AspiDetail from './AspiDetail'
import SchedeASPI from './SchedeASPI'

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getMaturita(b) {
  const eta = new Date().getFullYear() - b.anno
  if (!b.invecchiamento) return { label: 'Da bere', cls: 'green' }
  const r = eta / b.invecchiamento
  if (r < 0.7) return { label: 'In evoluzione', cls: 'green' }
  if (r <= 1.1) return { label: 'Al picco', cls: 'amber' }
  return { label: 'Oltre il picco', cls: 'red' }
}
const stars = n => '⭐️'.repeat(n || 0)
const money = n => '💶'.repeat(n || 0)
const today = () => new Date().toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })
const matColor = cls => ({ green: '#2D6A4F', amber: '#C77B13', red: '#9B2335' })[cls]
const badgeStyle = t => ({
  Rosso:      { bg: '#FAECE7', color: '#993C1D' },
  Bianco:     { bg: '#FAEEDA', color: '#854F0B' },
  Rosato:     { bg: '#FBEAF0', color: '#993556' },
  Orange:     { bg: '#FDE8D0', color: '#9A4E0A' },
  Bollicine:  { bg: '#E6F1FB', color: '#185FA5' },
  Dolce:      { bg: '#FDF4DC', color: '#876200' },
  Fortificato:{ bg: '#EDE6F5', color: '#5B2D8E' },
}[t] || { bg: '#F1EFE8', color: '#555' })

// ─── Match engine ─────────────────────────────────────────────────────────────
const RULES = [
  { words: ['bistecca','manzo','cinghiale','selvaggina','agnello','carne','tagliata'], tipi: ['Rosso'], vitigni: ['Nebbiolo','Corvina','Sangiovese grosso','Sangiovese'], regioni: ['Piemonte','Toscana','Veneto'], motivo: 'concordanza per struttura: i tannini si legano alle proteine della carne, ammorbidendosi reciprocamente.' },
  { words: ['pesce','branzino','orata','salmone','trota','merluzzo','rombo'], tipi: ['Bianco','Bollicine'], vitigni: ['Vermentino','Carricante','Chardonnay','Glera'], regioni: ['Sardegna','Sicilia','Lombardia','Veneto'], motivo: "contrapposizione per freschezza: l'acidità bilancia la delicatezza del pesce senza sovrastarlo." },
  { words: ['tartufo','risotto','pasta','fungo','porcini'], tipi: ['Rosso','Bollicine'], vitigni: ['Nebbiolo','Sangiovese','Chardonnay'], regioni: ['Piemonte','Toscana','Lombardia'], motivo: 'concordanza per complessità aromatica: le note terrose si fondono con gli aromi del tartufo.' },
  { words: ['aperitivo','fritto','antipasto','bruschetta','stuzzichino'], tipi: ['Bollicine','Bianco'], vitigni: ['Glera','Chardonnay','Vermentino'], regioni: ['Veneto','Lombardia'], motivo: 'contrapposizione per effervescenza: le bollicine puliscono il palato dai fritti.' },
  { words: ['formaggio','stagionato','grana','parmigiano','pecorino'], tipi: ['Rosso'], vitigni: ['Corvina','Sangiovese grosso','Nebbiolo'], regioni: ['Veneto','Piemonte'], motivo: 'concordanza per intensità: formaggi stagionati richiedono vini strutturati.' },
]
function scoreVino(b, rules) {
  let score = 0; const notes = []
  rules.forEach(r => {
    const tOk = r.tipi.includes(b.tipologia)
    const vOk = r.vitigni?.some(v => (b.vitigno || '').toLowerCase().includes(v.toLowerCase()))
    const rOk = r.regioni?.includes(b.regione)
    if (tOk) score += 3; if (vOk) score += 4; if (rOk) score += 2
    if ((tOk || vOk) && !notes.includes(r.motivo)) notes.push(r.motivo)
  })
  const m = getMaturita(b)
  if (m.label === 'Al picco') score += 3
  if (m.label === 'In evoluzione') score += 1
  if (m.cls === 'red') score -= 2
  if (b.valutazione >= 4) score += 2
  return { score, note: notes[0] || 'abbinamento per tipologia e struttura.' }
}

// ─── Stili ────────────────────────────────────────────────────────────────────
const S = {
  inp: { width: '100%', padding: '11px 14px', border: '1.5px solid #E2DDD6', borderRadius: 10, fontSize: 15, background: '#fff', color: '#1C1410', WebkitAppearance: 'none', appearance: 'none' },
  lbl: { display: 'block', fontSize: 12, fontWeight: 500, color: '#7A6E65', marginBottom: 5 },
  btn: { width: '100%', padding: 14, background: '#7B1E2E', color: '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: 'pointer' },
  card: { background: '#fff', border: '1px solid #E2DDD6', borderRadius: 16, padding: 16 },
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ msg }) {
  if (!msg) return null
  return <div style={{ position: 'fixed', bottom: 'calc(64px + env(safe-area-inset-bottom, 16px) + 12px)', left: '50%', transform: 'translateX(-50%)', background: '#1C1410', color: '#F5EFE0', padding: '12px 24px', borderRadius: 100, fontSize: 14, fontWeight: 500, zIndex: 999, whiteSpace: 'nowrap', boxShadow: '0 4px 20px rgba(0,0,0,0.25)' }}>{msg}</div>
}

// ─── Bottom Sheet ─────────────────────────────────────────────────────────────
function Sheet({ open, onClose, title, children }) {
  if (!open) return null
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(28,20,16,0.6)', backdropFilter: 'blur(2px)' }} />
      <div style={{ position: 'relative', background: '#F4F1EC', borderRadius: '20px 20px 0 0', maxHeight: '95dvh', display: 'flex', flexDirection: 'column', paddingBottom: 'env(safe-area-inset-bottom, 16px)' }}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px' }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: '#D6D0C8' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 20px 12px' }}>
          <span style={{ fontFamily: 'Playfair Display, serif', fontSize: 17, fontWeight: 600, color: '#1C1410', flex: 1, paddingRight: 12 }}>{title}</span>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: '50%', border: 'none', background: '#E2DDD6', cursor: 'pointer', fontSize: 14, color: '#7A6E65', flexShrink: 0 }}>✕</button>
        </div>
        <div style={{ overflowY: 'auto', padding: '0 16px 32px', flex: 1, WebkitOverflowScrolling: 'touch' }}>
          {children}
        </div>
      </div>
    </div>
  )
}

function Spinner() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', gap: 16 }}>
      <div style={{ width: 36, height: 36, border: '3px solid #E2DDD6', borderTopColor: '#7B1E2E', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      <div style={{ fontSize: 14, color: '#7A6E65' }}>Caricamento cantina…</div>
    </div>
  )
}

// ─── Bottiglia Card ───────────────────────────────────────────────────────────
function BottigliaCard({ b, onBevuto, onQty }) {
  const m = getMaturita(b)
  const pct = b.invecchiamento > 0 ? Math.round(Math.min((new Date().getFullYear() - b.anno) / b.invecchiamento, 1) * 100) : 0
  const bs = badgeStyle(b.tipologia)
  return (
    <div style={{ ...S.card, display: 'flex', flexDirection: 'column' }}>
      <span style={{ display: 'inline-block', fontSize: 10, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', padding: '3px 9px', borderRadius: 100, marginBottom: 10, background: bs.bg, color: bs.color, alignSelf: 'flex-start' }}>{b.tipologia || '—'}</span>
      <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 15, fontWeight: 600, lineHeight: 1.3, marginBottom: 3 }}>{b.nome}</div>
      <div style={{ fontSize: 12, color: '#7A6E65', marginBottom: 12 }}>{b.cantina || '—'}</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontSize: 16, fontWeight: 600 }}>{b.anno || '—'}</span>
        <span style={{ fontSize: 12 }}>{stars(b.valutazione)}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <button onClick={() => onQty(b.id, -1)} disabled={b.quantita === 0} style={{ width: 32, height: 32, borderRadius: '50%', border: '1.5px solid #E2DDD6', background: 'none', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: b.quantita === 0 ? 0.3 : 1 }}>−</button>
        <span style={{ fontSize: 15, fontWeight: 600, minWidth: 20, textAlign: 'center' }}>{b.quantita}</span>
        <button onClick={() => onQty(b.id, 1)} style={{ width: 32, height: 32, borderRadius: '50%', border: '1.5px solid #E2DDD6', background: 'none', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
        <span style={{ fontSize: 12, color: '#B0A89E' }}>bott.</span>
      </div>
      <div style={{ height: 5, borderRadius: 3, background: '#F0ECE5', overflow: 'hidden', marginBottom: 10 }}>
        <div style={{ height: '100%', width: `${pct}%`, background: matColor(m.cls), borderRadius: 3 }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: matColor(m.cls) }} />
          <span style={{ fontSize: 12, fontWeight: 500, color: matColor(m.cls) }}>{m.label}</span>
        </div>
        <button onClick={() => onBevuto(b)} disabled={b.quantita === 0} style={{ fontSize: 12, fontWeight: 600, padding: '7px 14px', border: '1.5px solid #7B1E2E', borderRadius: 100, background: 'none', color: '#7B1E2E', cursor: 'pointer', opacity: b.quantita === 0 ? 0.35 : 1 }}>
          L'ho bevuto
        </button>
      </div>
    </div>
  )
}

// ─── TAB Libreria ─────────────────────────────────────────────────────────────
function Libreria({ cantina, onBevuto, onQty }) {
  const [q, setQ] = useState('')
  const [tipo, setTipo] = useState('')
  const filtered = cantina
    .filter(b => !q || (b.nome + b.cantina + (b.vitigno || '')).toLowerCase().includes(q.toLowerCase()))
    .filter(b => !tipo || b.tipologia === tipo)
  return (
    <div>
      <div style={{ position: 'sticky', top: 0, background: 'rgba(244, 241, 236, 0.96)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', paddingBottom: 12, paddingTop: 4, zIndex: 10, marginTop: -4 }}>
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="🔍  Cerca nome, cantina, vitigno..." style={{ ...S.inp, marginBottom: 10 }} />
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 2 }}>
          {['', ...TIPOLOGIE].map(t => (
            <button key={t} onClick={() => setTipo(t)} style={{ flexShrink: 0, padding: '6px 14px', borderRadius: 100, border: '1.5px solid', borderColor: tipo === t ? '#7B1E2E' : '#E2DDD6', background: tipo === t ? '#7B1E2E' : '#fff', color: tipo === t ? '#fff' : '#7A6E65', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
              {t || 'Tutti'}
            </button>
          ))}
        </div>
        <div style={{ fontSize: 12, color: '#B0A89E', marginTop: 8 }}>{filtered.length} bottigli{filtered.length === 1 ? 'a' : 'e'}</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
        {filtered.map(b => <BottigliaCard key={b.id} b={b} onBevuto={onBevuto} onQty={onQty} />)}
      </div>
    </div>
  )
}

// ─── TAB Statistiche ──────────────────────────────────────────────────────────
function Statistiche({ cantina, archivio }) {
  const [st, setSt] = useState('tipo')
  const byTipo = {}, byReg = {}, byPrezzo = {}, byMat = {}
  let tot = 0
  cantina.forEach(b => {
    byTipo[b.tipologia] = (byTipo[b.tipologia] || 0) + 1
    if (b.regione) byReg[b.regione] = (byReg[b.regione] || 0) + 1
    if (b.prezzo) byPrezzo['💶'.repeat(b.prezzo)] = (byPrezzo['💶'.repeat(b.prezzo)] || 0) + 1
    const m = getMaturita(b); byMat[m.label] = (byMat[m.label] || 0) + 1
    tot += (b.quantita || 0)
  })
  const maps = { tipo: byTipo, regione: byReg, prezzo: byPrezzo, maturita: byMat }
  const colors = {
    tipo: { Rosso: '#7B1E2E', Bianco: '#C8992A', Rosato: '#993556', Orange: '#C4621D', Bollicine: '#185FA5', Dolce: '#876200', Fortificato: '#5B2D8E' },
    regione: Object.fromEntries(Object.keys(byReg).map(k => [k, '#7B1E2E'])),
    prezzo: Object.fromEntries(Object.keys(byPrezzo).map(k => [k, '#C8992A'])),
    maturita: { 'In evoluzione': '#2D6A4F', 'Al picco': '#C77B13', 'Oltre il picco': '#9B2335', 'Da bere': '#2D6A4F' },
  }
  const data = maps[st]; const maxV = Math.max(...Object.values(data), 1)
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
        {[['🍾','Etichette',cantina.length],['📦','Bottiglie',tot],['🎯','Al picco',byMat['Al picco']||0],['📓','Schede ASPI',archivio.length]].map(([ico,l,v]) => (
          <div key={l} style={{ ...S.card, textAlign: 'center', padding: '20px 12px' }}>
            <div style={{ fontSize: 24, marginBottom: 4 }}>{ico}</div>
            <div style={{ fontSize: 28, fontWeight: 700, fontFamily: 'Playfair Display, serif' }}>{v}</div>
            <div style={{ fontSize: 12, color: '#7A6E65', marginTop: 2 }}>{l}</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, overflowX: 'auto' }}>
        {[['tipo','Tipologia'],['regione','Regione'],['prezzo','Prezzo'],['maturita','Maturità']].map(([k,l]) => (
          <button key={k} onClick={() => setSt(k)} style={{ flexShrink: 0, padding: '7px 16px', borderRadius: 100, border: '1.5px solid', borderColor: st === k ? '#7B1E2E' : '#E2DDD6', background: st === k ? '#7B1E2E' : '#fff', color: st === k ? '#fff' : '#7A6E65', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>{l}</button>
        ))}
      </div>
      <div style={S.card}>
        {Object.entries(data).map(([k, v]) => (
          <div key={k} style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
              <span style={{ fontSize: 13, fontWeight: 500 }}>{k}</span>
              <span style={{ fontSize: 13, color: '#7A6E65' }}>{v}</span>
            </div>
            <div style={{ height: 8, borderRadius: 4, background: '#F0ECE5', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${Math.round(v / maxV * 100)}%`, background: colors[st][k] || '#7B1E2E', borderRadius: 4, transition: 'width 0.5s ease' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── TAB Abbinamento ──────────────────────────────────────────────────────────
function Abbinamento({ cantina }) {
  const [piatto, setPiatto] = useState('')
  const [res, setRes] = useState(null)
  const [loading, setLoading] = useState(false)
  const cerca = () => {
    if (!piatto.trim()) return
    setLoading(true)
    setTimeout(() => {
      const pL = piatto.toLowerCase()
      const matched = RULES.filter(r => r.words.some(w => pL.includes(w)))
      const rules = matched.length ? matched : RULES
      const scored = cantina.filter(b => b.quantita > 0).map(b => ({ ...b, ...scoreVino(b, rules) })).sort((a, b) => b.score - a.score).slice(0, 3)
      setRes({ piatto, lista: scored }); setLoading(false)
    }, 1400)
  }
  return (
    <div>
      <div style={{ background: '#7B1E2E', borderRadius: 16, padding: 20, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ fontSize: 32 }}>✦</div>
        <div>
          <div style={{ fontFamily: 'Playfair Display, serif', color: '#F5EFE0', fontSize: 18, fontWeight: 600 }}>Sommelier AI</div>
          <div style={{ color: 'rgba(245,239,224,0.7)', fontSize: 13, marginTop: 2 }}>Dimmi cosa mangi, scelgo io.</div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
        <input value={piatto} onChange={e => setPiatto(e.target.value)} onKeyDown={e => e.key === 'Enter' && cerca()} placeholder="es. risotto al tartufo..." style={{ ...S.inp, flex: 1 }} />
        <button onClick={cerca} disabled={loading} style={{ padding: '11px 18px', background: '#7B1E2E', color: '#fff', border: 'none', borderRadius: 12, fontSize: 18, fontWeight: 600, cursor: 'pointer', opacity: loading ? 0.6 : 1, flexShrink: 0 }}>{loading ? '…' : '→'}</button>
      </div>
      {res && res.lista.map((b, i) => (
        <div key={b.id} style={{ ...S.card, marginBottom: 12 }}>
          <div style={{ display: 'flex', gap: 12 }}>
            <span style={{ fontSize: 28, flexShrink: 0 }}>{['🥇','🥈','🥉'][i]}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 16, fontWeight: 600, marginBottom: 2 }}>{b.nome}</div>
              <div style={{ fontSize: 12, color: '#7A6E65', marginBottom: 8 }}>{b.cantina} · {b.anno} · {b.tipologia}</div>
              <div style={{ fontSize: 13, color: '#3D3530', lineHeight: 1.6, fontStyle: 'italic', marginBottom: 8 }}>"{b.note}"</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {[stars(b.valutazione), money(b.prezzo), getMaturita(b).label, `${b.quantita} bott.`].map((tag, j) => (
                  <span key={j} style={{ fontSize: 11, background: '#F5EFE0', color: '#7B1E2E', padding: '3px 8px', borderRadius: 100, fontWeight: 500 }}>{tag}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}



// ─── TAB Aggiungi ─────────────────────────────────────────────────────────────
function FormInput({ label, value, onChange, placeholder, type, min, full }) {
  return (
    <div style={full ? { gridColumn: '1/-1' } : {}}>
      <span style={S.lbl}>{label}</span>
      <input style={S.inp} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder || ''} type={type || 'text'} min={min} />
    </div>
  )
}
function FormSelect({ label, value, onChange, options, full }) {
  return (
    <div style={full ? { gridColumn: '1/-1' } : {}}>
      <span style={S.lbl}>{label}</span>
      <select style={S.inp} value={value} onChange={e => onChange(e.target.value)}>
        {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    </div>
  )
}
const FORM0 = { nome: '', cantina: '', tipologia: '', anno: '', quantita: '1', regione: '', vitigno: '', valutazione: '', prezzo: '', temp: '', invecchiamento: 'non_so', note: '' }
function AggiungiForm({ onAdd, showToast }) {
  const [f, setF] = useState(FORM0)
  const [saving, setSaving] = useState(false)
  const set = k => v => setF(p => ({ ...p, [k]: v }))
  const handleAdd = async () => {
    if (!f.nome.trim()) { showToast('⚠️ Il nome è obbligatorio'); return }
    setSaving(true)
    await onAdd({ nome: f.nome.trim(), cantina: f.cantina.trim(), tipologia: f.tipologia || 'Rosso', paese: 'Italia', regione: f.regione.trim(), vitigno: f.vitigno.trim(), anno: parseInt(f.anno) || new Date().getFullYear(), quantita: Math.max(1, parseInt(f.quantita) || 1), valutazione: parseInt(f.valutazione) || 3, prezzo: parseInt(f.prezzo) || 2, temp: f.temp.trim(), note: f.note.trim(), invecchiamento: f.invecchiamento === 'non_so' ? null : parseInt(f.invecchiamento) })
    setF(FORM0); setSaving(false)
  }
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
      <FormInput label="Nome vino *" value={f.nome} onChange={set('nome')} placeholder="es. Barolo Cannubi 2018" full />
      <FormInput label="Cantina" value={f.cantina} onChange={set('cantina')} placeholder="Produttore" />
      <FormSelect label="Tipologia" value={f.tipologia} onChange={set('tipologia')} options={[['','—'],...TIPOLOGIE.map(t=>[t,t])]} />
      <FormInput label="Anno" value={f.anno} onChange={set('anno')} placeholder="2019" type="number" />
      <FormInput label="Quantità (bott.)" value={f.quantita} onChange={set('quantita')} type="number" min={1} />
      <FormInput label="Regione" value={f.regione} onChange={set('regione')} placeholder="es. Piemonte" />
      <FormInput label="Vitigno" value={f.vitigno} onChange={set('vitigno')} placeholder="es. Nebbiolo" />
      <FormSelect label="Valutazione annata" value={f.valutazione} onChange={set('valutazione')} options={[['','—'],['1','⭐️ 1'],['2','⭐️⭐️ 2'],['3','⭐️⭐️⭐️ 3'],['4','⭐️⭐️⭐️⭐️ 4'],['5','⭐️⭐️⭐️⭐️⭐️ 5']]} />
      <FormSelect label="Fascia prezzo" value={f.prezzo} onChange={set('prezzo')} options={[['','—'],['1','💶 1'],['2','💶💶 2'],['3','💶💶💶 3'],['4','💶💶💶💶 4'],['5','💶💶💶💶💶 5']]} />
      <FormInput label="Temp. servizio" value={f.temp} onChange={set('temp')} placeholder="16-18°C" />
      <FormSelect label="Invecchiamento" value={f.invecchiamento} onChange={set('invecchiamento')} options={[['non_so','Non so'],...Array.from({length:31},(_,i)=>[String(i),`${i} ann${i===1?'o':'i'}`])]} />
      <FormInput label="Note" value={f.note} onChange={set('note')} placeholder="Dove l'hai comprato, ricordi..." full />
      <div style={{ gridColumn: '1/-1', marginTop: 4 }}>
        <button onClick={handleAdd} disabled={saving} style={{ ...S.btn, opacity: saving ? 0.7 : 1 }}>{saving ? 'Salvataggio...' : '+ Aggiungi alla cantina'}</button>
      </div>
    </div>
  )
}

// ─── Bottom Nav ───────────────────────────────────────────────────────────────
const NAV = [
  { id: 'libreria',    icon: '🍾', label: 'Cantina' },
  { id: 'statistiche', icon: '📊', label: 'Statistiche' },
  { id: 'abbinamento', icon: '✦',  label: 'AI Chef' },
  { id: 'schede',      icon: '📓', label: 'Schede ASPI' },
  { id: 'aggiungi',    icon: '+',   label: 'Aggiungi' },
]

// ─── APP ROOT ─────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState('libreria')
  const [cantina, setCantina] = useState([])
  const [archivio, setArchivio] = useState([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState('')
  const [aspiBottiglia, setAspiBottiglia] = useState(null)
  const [aspiLibera, setAspiLibera] = useState(false)
  const [editScheda, setEditScheda] = useState(null)  // scheda in modifica

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(''), 2500) }

  useEffect(() => {
    (async () => {
      try {
        await seedIfEmpty()
        const [c, a] = await Promise.all([getBottiglie(), getSchede()])
        setCantina(c); setArchivio(a)
      } catch (e) {
        showToast('⚠️ Errore connessione database')
        console.error(e)
      } finally { setLoading(false) }
    })()
  }, [])

  const handleQty = useCallback(async (id, delta) => {
    const b = cantina.find(x => x.id === id); if (!b) return
    const nuova = Math.max(0, b.quantita + delta)
    setCantina(prev => prev.map(x => x.id === id ? { ...x, quantita: nuova } : x))
    await updateBottiglia(id, { quantita: nuova })
  }, [cantina])

  // Salva scheda — gestisce sia "da bottiglia" che "libera"
  const handleSaveASPI = useCallback(async (formData) => {
    const oggi = today()
    // Costruisce il record da salvare
    const record = { ...formData, data: oggi }
    // Se viene da "L'ho bevuto" decrementa la quantità
    if (aspiBottiglia) {
      const b = aspiBottiglia
      const nuovaQty = Math.max(0, b.quantita - 1)
      if (nuovaQty === 0) { await deleteBottiglia(b.id); setCantina(prev => prev.filter(x => x.id !== b.id)) }
      else { await updateBottiglia(b.id, { quantita: nuovaQty }); setCantina(prev => prev.map(x => x.id === b.id ? { ...x, quantita: nuovaQty } : x)) }
    }
    const saved = await addScheda(record)
    setArchivio(prev => {
      const nuova = [saved, ...prev]
      return nuova.sort((a, b) => (b.voto || 0) - (a.voto || 0))
    })
    setAspiBottiglia(null)
    setAspiLibera(false)
    showToast('📓 Scheda ASPI salvata!')
    setTab('schede')
  }, [aspiBottiglia])

  const handleAdd = useCallback(async bottiglia => {
    const saved = await addBottiglia(bottiglia)
    setCantina(prev => [...prev, saved])
    showToast(`✓ "${bottiglia.nome}" aggiunta!`)
    setTab('libreria')
  }, [])

  const handleDeleteScheda = useCallback(async (scheda) => {
    await deleteScheda(scheda.id)
    setArchivio(prev => prev.filter(s => s.id !== scheda.id))
    showToast('🗑️ Scheda eliminata')
  }, [])

  const handleUpdateScheda = useCallback(async (formData) => {
    if (!editScheda) return
    const updated = await updateScheda(editScheda.id, { ...formData, data: editScheda.data })
    setArchivio(prev => {
      const nuova = prev.map(s => s.id === editScheda.id ? updated : s)
      return nuova.sort((a, b) => (b.voto || 0) - (a.voto || 0))
    })
    setEditScheda(null)
    showToast('✓ Scheda aggiornata!')
    setTab('schede')
  }, [editScheda])

  // Dati pre-compilati quando arriva da "L'ho bevuto"
  const aspiInitial = aspiBottiglia ? {
    nomeVino: aspiBottiglia.nome || '',
    cantina: aspiBottiglia.cantina || '',
    annata: aspiBottiglia.anno ? String(aspiBottiglia.anno) : '',
    tipologia: aspiBottiglia.tipologia || '',
    temperatura: aspiBottiglia.temp || '',
    denominazione: '',
  } : {}

  const aspiSheetOpen = !!aspiBottiglia || aspiLibera
  const aspiTitle = aspiBottiglia ? `${aspiBottiglia.nome}${aspiBottiglia.anno ? ' ' + aspiBottiglia.anno : ''}` : 'Nuova scheda ASPI'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', background: '#F4F1EC', overflow: 'hidden' }}>
      {/* Topbar */}
      <div style={{ background: '#7B1E2E', padding: '12px 20px', paddingTop: 'calc(12px + env(safe-area-inset-top, 0px))', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div>
          <div style={{ fontFamily: 'Playfair Display, serif', color: '#F5EFE0', fontSize: 20, fontWeight: 600 }}>Piuttosto Pronto</div>
          <div style={{ color: 'rgba(245,239,224,0.6)', fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', marginTop: 1 }}>La mia cantina</div>
        </div>
        <div style={{ fontSize: 26 }}>🍷</div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 16, WebkitOverflowScrolling: 'touch' }}>
        {loading ? <Spinner /> : <>
          {tab === 'libreria'    && <Libreria cantina={cantina} onBevuto={b => { setAspiBottiglia(b); setAspiLibera(false) }} onQty={handleQty} />}
          {tab === 'statistiche' && <Statistiche cantina={cantina} archivio={archivio} />}
          {tab === 'abbinamento' && <Abbinamento cantina={cantina} />}
          {tab === 'schede'      && <SchedeASPI archivio={archivio} onNuova={() => { setAspiBottiglia(null); setAspiLibera(true) }} onElimina={handleDeleteScheda} onOpen={scheda => setEditScheda(scheda)} />}
          {tab === 'aggiungi'    && <AggiungiForm onAdd={handleAdd} showToast={showToast} />}
        </>}
      </div>

      {/* Bottom Nav */}
      <div style={{ flexShrink: 0, background: '#fff', borderTop: '1px solid #E2DDD6', display: 'flex', paddingBottom: 0 }}>
        {NAV.map(({ id, icon, label }) => {
          const active = tab === id
          return (
            <button key={id} onClick={() => setTab(id)} style={{ flex: 1, padding: '10px 4px 10px', border: 'none', background: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
              <span style={{ fontSize: id === 'aggiungi' ? 22 : 20, lineHeight: 1, color: active ? '#7B1E2E' : '#B0A89E', fontWeight: id === 'aggiungi' || id === 'abbinamento' ? 700 : 400 }}>{icon}</span>
              <span style={{ fontSize: 9, fontWeight: active ? 600 : 400, color: active ? '#7B1E2E' : '#B0A89E', textAlign: 'center', lineHeight: 1.2 }}>{label}</span>
              {active && <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#7B1E2E' }} />}
            </button>
          )
        })}
      </div>

      {/* Sheet: compila nuova scheda ASPI */}
      <Sheet open={aspiSheetOpen} onClose={() => { setAspiBottiglia(null); setAspiLibera(false) }} title={aspiTitle}>
        {aspiSheetOpen && <AspiForm initial={aspiInitial} oggi={today()} onSave={handleSaveASPI} />}
      </Sheet>

      {/* Sheet: modifica scheda ASPI esistente */}
      <Sheet open={!!editScheda} onClose={() => setEditScheda(null)} title={editScheda ? `Modifica — ${editScheda.nomeVino || editScheda.nome || 'Scheda ASPI'}` : ''}>
        {editScheda && <AspiForm initial={editScheda} oggi={editScheda.data} onSave={handleUpdateScheda} saveLabel="Salva modifiche" />}
      </Sheet>

      <Toast msg={toast} />
    </div>
  )
}

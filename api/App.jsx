import { useState, useEffect, useCallback } from 'react'
import { seedIfEmpty, getBottiglie, addBottiglia, updateBottiglia, deleteBottiglia, getSchede, addScheda, deleteScheda, updateScheda } from './supabase'
import AspiForm, { ASPI_EMPTY, TIPOLOGIE } from './AspiForm'
import AspiDetail from './AspiDetail'
import SchedeASPI from './SchedeASPI'
import Libreria, { getMaturita, matColor, DettaglioBottiglia, ModificaBottiglia } from './Libreria'
import Statistiche from './Statistiche'
import AIChef from './AIChef'
import { PAESI_REGIONI, PAESI_OPTIONS } from './dati'
import ImageUpload from './ImageUpload'

// ─── Helpers ──────────────────────────────────────────────────────────────────
const stars = n => '⭐️'.repeat(n || 0)
const money = n => '💶'.repeat(n || 0)
const today = () => new Date().toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })
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




// ─── TAB Aggiungi ─────────────────────────────────────────────────────────────
function FormInput({ label, value, onChange, placeholder, type, min, full, aiField }) {
  return (
    <div style={full ? { gridColumn: '1/-1' } : {}}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
        <span style={S.lbl}>{label}</span>
        {aiField && <span style={{ fontSize: 10, background: '#E6F1FB', color: '#185FA5', padding: '1px 6px', borderRadius: 100, fontWeight: 600 }}>AI</span>}
      </div>
      <input style={{ ...S.inp, borderColor: aiField ? '#185FA5' : undefined }} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder || ''} type={type || 'text'} min={min} />
    </div>
  )
}
function FormSelect({ label, value, onChange, options, full, aiField }) {
  return (
    <div style={full ? { gridColumn: '1/-1' } : {}}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
        <span style={S.lbl}>{label}</span>
        {aiField && <span style={{ fontSize: 10, background: '#E6F1FB', color: '#185FA5', padding: '1px 6px', borderRadius: 100, fontWeight: 600 }}>AI</span>}
      </div>
      <select style={{ ...S.inp, borderColor: aiField ? '#185FA5' : undefined }} value={value} onChange={e => onChange(e.target.value)}>
        {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    </div>
  )
}

function FormTextarea({ label, value, onChange, placeholder, aiField }) {
  return (
    <div style={{ gridColumn: '1/-1' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
        <span style={S.lbl}>{label}</span>
        {aiField && <span style={{ fontSize: 10, background: '#E6F1FB', color: '#185FA5', padding: '1px 6px', borderRadius: 100, fontWeight: 600 }}>AI</span>}
      </div>
      <textarea
        style={{ ...S.inp, minHeight: 70, resize: 'vertical', lineHeight: 1.5 }}
        value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder || ''} />
    </div>
  )
}

function SecBox({ title, children }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #E2DDD6', borderRadius: 14, padding: 16, marginBottom: 14 }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: '#7B1E2E', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 14, paddingBottom: 8, borderBottom: '1px solid #F0ECE5' }}>{title}</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {children}
      </div>
    </div>
  )
}

const FORM0 = {
  nome: '', cantina: '', tipologia: '', anno: '', paese: '', regione: '', note: '',
  canale_acquisto: '', prezzo_acquisto: '', prezzo: '', quantita: '1',
  denominazione: '', vitigno: '', valutazione: '', temp: '', invecchiamento: 'non_so',
  info_cantina: '', caratteristiche_bottiglia: '', caratteristiche_annata: '',
  foto_url: '',
}

// Campi compilati dall'AI (per mostrare badge)
const AI_FIELDS_SET = new Set()

async function callAI(payload) {
  const res = await fetch('/api/claude', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const data = await res.json()
  if (data.error) throw new Error(data.error.message)
  const raw = data.content[0].text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  return JSON.parse(raw)
}

function AggiungiForm({ onAdd, showToast }) {
  const [f, setF] = useState(FORM0)
  const [saving, setSaving] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiFields, setAiFields] = useState(new Set()) // campi compilati da AI
  const set = k => v => {
    setAiFields(prev => { const n = new Set(prev); n.delete(k); return n }) // rimuove badge AI se utente modifica
    setF(p => ({ ...p, [k]: v }))
  }

  const regioniOptions = f.paese && PAESI_REGIONI[f.paese]
    ? [['', '— seleziona —'], ...PAESI_REGIONI[f.paese].map(r => [r, r])]
    : null

  // Unica chiamata AI che compila tutto
  const handleAI = async () => {
    if (!f.nome && !f.foto_url) { showToast('⚠️ Inserisci almeno nome o foto'); return }
    setAiLoading(true)
    try {
      const SYSTEM = `Sei un esperto enologo. Analizza le informazioni sul vino e restituisci SOLO JSON valido senza markdown.
Compila solo i campi di cui sei 100% certo. Lascia stringa vuota "" se non sei certo.
Valutazione annata: 1-5 (0 se incerto). Invecchiamento: numero anni (0 se incerto).
{
  "nome":"","cantina":"","tipologia":"","anno":"","paese":"","regione":"","denominazione":"","vitigno":"",
  "valutazione":"","temp":"","invecchiamento":"",
  "info_cantina":"","caratteristiche_bottiglia":"","caratteristiche_annata":"","note":""
}`

      const userContent = []
      if (f.foto_url) {
        // Scarica l'immagine e la converte in base64
        const imgRes = await fetch(f.foto_url)
        const blob = await imgRes.blob()
        const base64 = await new Promise(res => { const r = new FileReader(); r.onload = () => res(r.result.split(',')[1]); r.readAsDataURL(blob) })
        userContent.push({ type: 'image', source: { type: 'base64', media_type: blob.type || 'image/jpeg', data: base64 } })
      }
      const testo = [f.nome, f.cantina, f.anno, f.paese, f.regione, f.vitigno].filter(Boolean).join(', ')
      userContent.push({ type: 'text', text: testo ? `Vino: ${testo}` : 'Analizza l\'etichetta nella foto.' })

      const result = await callAI({
        model: 'claude-sonnet-4-6',
        max_tokens: 800,
        system: SYSTEM,
        messages: [{ role: 'user', content: userContent }],
      })

      // Applica solo campi non vuoti e non già compilati dall'utente
      const newAiFields = new Set()
      const updates = {}
      const campiAI = ['nome','cantina','tipologia','anno','paese','regione','denominazione','vitigno','valutazione','temp','invecchiamento','info_cantina','caratteristiche_bottiglia','caratteristiche_annata','note']
      campiAI.forEach(k => {
        const v = result[k]
        if (v && String(v) !== '0' && String(v) !== '') {
          if (!f[k] || f[k] === '' || f[k] === 'non_so') {
            updates[k] = String(v)
            newAiFields.add(k)
          }
        }
      })
      setF(p => ({ ...p, ...updates }))
      setAiFields(newAiFields)
      if (newAiFields.size === 0) showToast('ℹ️ Nessun campo compilato con certezza')
      else showToast(`✨ ${newAiFields.size} campi compilati dall'AI`)
    } catch (e) {
      showToast('⚠️ Errore AI. Riprova.')
      console.error(e)
    } finally { setAiLoading(false) }
  }

  const handleAdd = async () => {
    if (!f.nome.trim()) { showToast('⚠️ Il nome è obbligatorio'); return }
    setSaving(true)
    await onAdd({
      nome: f.nome.trim(), cantina: f.cantina.trim(),
      tipologia: f.tipologia || null,
      paese: f.paese || null,
      regione: f.paese === 'Altro' ? f.regione.trim() : (f.regione || null),
      denominazione: f.denominazione.trim(), vitigno: f.vitigno.trim(),
      anno: parseInt(f.anno) || null,
      quantita: Math.max(1, parseInt(f.quantita) || 1),
      valutazione: parseInt(f.valutazione) || null,
      prezzo: parseInt(f.prezzo) || null,
      prezzo_acquisto: f.prezzo_acquisto ? parseFloat(f.prezzo_acquisto) : null,
      canale_acquisto: f.canale_acquisto.trim() || null,
      temp: f.temp.trim() || null,
      note: f.note.trim() || null,
      invecchiamento: f.invecchiamento === 'non_so' || f.invecchiamento === '0' ? null : parseInt(f.invecchiamento),
      info_cantina: f.info_cantina.trim() || null,
      caratteristiche_bottiglia: f.caratteristiche_bottiglia.trim() || null,
      caratteristiche_annata: f.caratteristiche_annata.trim() || null,
      foto_url: f.foto_url || null,
    })
    setF(FORM0); setAiFields(new Set()); setSaving(false)
  }

  const ai = k => aiFields.has(k)

  return (
    <div>
      {/* SEZIONE 0 — Foto */}
      <SecBox title="Foto etichetta">
        <div style={{ gridColumn: '1/-1' }}>
          <ImageUpload value={f.foto_url} onChange={set('foto_url')} label="" folder="vini" />
        </div>
        <div style={{ gridColumn: '1/-1' }}>
          <button onClick={handleAI} disabled={aiLoading}
            style={{ width: '100%', padding: 12, background: aiLoading ? '#F4F1EC' : '#1C1410', color: aiLoading ? '#7A6E65' : '#fff', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: aiLoading ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            {aiLoading ? <>⏳ AI sta analizzando…</> : <>✨ Compila con AI</>}
          </button>
          <div style={{ fontSize: 11, color: '#B0A89E', textAlign: 'center', marginTop: 6 }}>
            Usa foto + dati già inseriti · Compila solo i campi certi · I campi AI sono evidenziati in blu
          </div>
        </div>
      </SecBox>

      {/* SEZIONE 1 — Dati del vino */}
      <SecBox title="Dati del vino">
        <FormInput label="Nome vino *" value={f.nome} onChange={set('nome')} placeholder="es. Barolo Cannubi" full aiField={ai('nome')} />
        <FormInput label="Cantina / Produttore" value={f.cantina} onChange={set('cantina')} placeholder="es. Ceretto" aiField={ai('cantina')} />
        <FormSelect label="Tipologia" value={f.tipologia} onChange={set('tipologia')} options={[['','—'],...TIPOLOGIE.map(t=>[t,t])]} aiField={ai('tipologia')} />
        <FormInput label="Anno vendemmia" value={f.anno} onChange={set('anno')} placeholder="2019" type="number" aiField={ai('anno')} />
        <div style={{ gridColumn: '1/-1' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
            <span style={S.lbl}>Paese</span>
            {ai('paese') && <span style={{ fontSize: 10, background: '#E6F1FB', color: '#185FA5', padding: '1px 6px', borderRadius: 100, fontWeight: 600 }}>AI</span>}
          </div>
          <select style={{ ...S.inp, borderColor: ai('paese') ? '#185FA5' : undefined }} value={f.paese} onChange={e => setF(p => ({ ...p, paese: e.target.value, regione: '' }))}>
            {PAESI_OPTIONS.map(p => <option key={p} value={p}>{p || '— seleziona —'}</option>)}
          </select>
        </div>
        {f.paese && f.paese !== 'Altro' && regioniOptions && (
          <div style={{ gridColumn: '1/-1' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
              <span style={S.lbl}>Regione</span>
              {ai('regione') && <span style={{ fontSize: 10, background: '#E6F1FB', color: '#185FA5', padding: '1px 6px', borderRadius: 100, fontWeight: 600 }}>AI</span>}
            </div>
            <select style={{ ...S.inp, borderColor: ai('regione') ? '#185FA5' : undefined }} value={f.regione} onChange={e => set('regione')(e.target.value)}>
              {regioniOptions.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
        )}
        {f.paese === 'Altro' && (
          <FormInput label="Regione" value={f.regione} onChange={set('regione')} placeholder="es. Borgogna" full aiField={ai('regione')} />
        )}
        <FormTextarea label="Note" value={f.note} onChange={set('note')} placeholder="Appunti liberi sul vino..." aiField={ai('note')} />
      </SecBox>

      {/* SEZIONE 2 — Dati di acquisto */}
      <SecBox title="Dati di acquisto">
        <FormInput label="Canale di acquisto" value={f.canale_acquisto} onChange={set('canale_acquisto')} placeholder="es. Enoteca Bianchi" />
        <FormInput label="Prezzo acquisto (€ / bott.)" value={f.prezzo_acquisto} onChange={set('prezzo_acquisto')} placeholder="es. 24.50" type="number" />
        <FormSelect label="Fascia prezzo" value={f.prezzo} onChange={set('prezzo')} options={[['','—'],['1','💶 1'],['2','💶💶 2'],['3','💶💶💶 3'],['4','💶💶💶💶 4'],['5','💶💶💶💶💶 5']]} />
        <FormInput label="Quantità (bott.)" value={f.quantita} onChange={set('quantita')} type="number" min={1} />
      </SecBox>

      {/* SEZIONE 3 — Arricchimento */}
      <SecBox title="Arricchimento">
        <FormInput label="Denominazione" value={f.denominazione} onChange={set('denominazione')} placeholder="es. Barolo DOCG" full aiField={ai('denominazione')} />
        <FormInput label="Vitigno" value={f.vitigno} onChange={set('vitigno')} placeholder="es. Nebbiolo" aiField={ai('vitigno')} />
        <FormSelect label="Valutazione annata" value={f.valutazione} onChange={set('valutazione')} options={[['','—'],['1','⭐️ 1'],['2','⭐️⭐️ 2'],['3','⭐️⭐️⭐️ 3'],['4','⭐️⭐️⭐️⭐️ 4'],['5','⭐️⭐️⭐️⭐️⭐️ 5']]} aiField={ai('valutazione')} />
        <FormInput label="Temperatura di servizio" value={f.temp} onChange={set('temp')} placeholder="16-18°C" aiField={ai('temp')} />
        <FormSelect label="Invecchiamento" value={f.invecchiamento} onChange={set('invecchiamento')} options={[['non_so','Non so'],...Array.from({length:30},(_,i)=>[String(i+1),`${i+1} ann${i+1===1?'o':'i'}`])]} full aiField={ai('invecchiamento')} />
        <FormTextarea label="Informazioni sulla cantina" value={f.info_cantina} onChange={set('info_cantina')} placeholder="Storia, filosofia, territorio..." aiField={ai('info_cantina')} />
        <FormTextarea label="Caratteristiche della bottiglia" value={f.caratteristiche_bottiglia} onChange={set('caratteristiche_bottiglia')} placeholder="Profilo organolettico, stile..." aiField={ai('caratteristiche_bottiglia')} />
        <FormTextarea label="Caratteristiche dell'annata" value={f.caratteristiche_annata} onChange={set('caratteristiche_annata')} placeholder="Clima, resa, particolarità..." aiField={ai('caratteristiche_annata')} />
      </SecBox>

      <button onClick={handleAdd} disabled={saving} style={{ ...S.btn, opacity: saving ? 0.7 : 1, marginBottom: 8 }}>
        {saving ? 'Salvataggio...' : '+ Aggiungi alla cantina'}
      </button>
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
  const [dettaglioBottiglia, setDettaglioBottiglia] = useState(null)
  const [modalitaBottiglia, setModalitaBottiglia] = useState('detail')
  const [savingBottiglia, setSavingBottiglia] = useState(false)
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
    const nuova = Math.max(1, b.quantita + delta)  // minimo 1
    setCantina(prev => prev.map(x => x.id === id ? { ...x, quantita: nuova } : x))
    await updateBottiglia(id, { quantita: nuova })
  }, [cantina])

  const handleDeleteBottiglia = useCallback(async (b) => {
    await deleteBottiglia(b.id)
    setCantina(prev => prev.filter(x => x.id !== b.id))
    showToast(`🗑️ "${b.nome}" eliminata`)
  }, [])

  const handleUpdateBottiglia = useCallback(async (id, changes) => {
    const updated = await updateBottiglia(id, changes)
    setCantina(prev => prev.map(x => x.id === id ? updated : x))
    setDettaglioBottiglia(updated)  // aggiorna il dettaglio aperto
    setModalitaBottiglia('detail')  // torna alla vista dettaglio
    showToast('✓ Bottiglia aggiornata!')
  }, [])

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
    denominazione: aspiBottiglia.denominazione || '',
    paese: aspiBottiglia.paese || '',
    regione: aspiBottiglia.regione || '',
    foto_url: aspiBottiglia.foto_url || '',
  } : {}

  const aspiSheetOpen = !!aspiBottiglia || aspiLibera
  const aspiTitle = aspiBottiglia ? `${aspiBottiglia.nome}${aspiBottiglia.anno ? ' ' + aspiBottiglia.anno : ''}` : 'Nuova scheda ASPI'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#F4F1EC', overflow: 'hidden' }}>
      {/* Topbar */}
      <div style={{ background: '#7B1E2E', padding: '12px 20px', paddingTop: 'calc(12px + env(safe-area-inset-top, 0px))', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div>
          <div style={{ fontFamily: 'Playfair Display, serif', color: '#F5EFE0', fontSize: 20, fontWeight: 600 }}>Piuttosto Pronto</div>
          <div style={{ color: 'rgba(245,239,224,0.6)', fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', marginTop: 1 }}>La mia cantina</div>
        </div>
        <div style={{ fontSize: 26 }}>🍷</div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px 16px', WebkitOverflowScrolling: 'touch' }}>
        {loading ? <Spinner /> : <>
          {tab === 'libreria'    && <Libreria cantina={cantina} onBevuto={b => { setAspiBottiglia(b); setAspiLibera(false) }} onQty={handleQty} onElimina={handleDeleteBottiglia} onUpdate={handleUpdateBottiglia} onDettaglio={b => { setDettaglioBottiglia(b); setModalitaBottiglia('detail') }} />}
          {tab === 'statistiche' && <Statistiche cantina={cantina} />}
          {tab === 'abbinamento' && <AIChef cantina={cantina} />}
          {tab === 'schede'      && <SchedeASPI archivio={archivio} onNuova={() => { setAspiBottiglia(null); setAspiLibera(true) }} onElimina={handleDeleteScheda} onOpen={scheda => setEditScheda(scheda)} />}
          {tab === 'aggiungi'    && (
            <div style={{ paddingTop: 8 }}>
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 20, fontWeight: 600, color: '#1C1410', marginBottom: 6 }}>Cosa vuoi aggiungere?</div>
              <div style={{ fontSize: 14, color: '#7A6E65', marginBottom: 24 }}>Scegli il tipo di inserimento</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <button onClick={() => setTab('aggiungi-bottiglia')} style={{ background: '#fff', border: '1.5px solid #E2DDD6', borderRadius: 16, padding: '20px 20px', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 16 }}>
                  <span style={{ fontSize: 36 }}>🍾</span>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 600, color: '#1C1410', marginBottom: 4 }}>Nuova bottiglia in cantina</div>
                    <div style={{ fontSize: 13, color: '#7A6E65' }}>Aggiungi un vino alla tua collezione</div>
                  </div>
                </button>
                <button onClick={() => { setAspiBottiglia(null); setAspiLibera(true) }} style={{ background: '#fff', border: '1.5px solid #E2DDD6', borderRadius: 16, padding: '20px 20px', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 16 }}>
                  <span style={{ fontSize: 36 }}>📓</span>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 600, color: '#1C1410', marginBottom: 4 }}>Nuova scheda ASPI</div>
                    <div style={{ fontSize: 13, color: '#7A6E65' }}>Compila una scheda di degustazione</div>
                  </div>
                </button>
              </div>
            </div>
          )}
          {tab === 'aggiungi-bottiglia' && <AggiungiForm onAdd={handleAdd} showToast={showToast} />}
        </>}
      </div>

      {/* Bottom Nav */}
      <div style={{ flexShrink: 0, background: '#fff', borderTop: '1px solid #E2DDD6', display: 'flex' }}>
        {NAV.map(({ id, icon, label }) => {
          const active = tab === id || (id === 'aggiungi' && tab === 'aggiungi-bottiglia')
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

      {/* Sheet: dettaglio/modifica bottiglia — montato qui in App per stare sopra tutto */}
      <Sheet open={!!dettaglioBottiglia} onClose={() => setDettaglioBottiglia(null)} title={dettaglioBottiglia?.nome || ''}>
        {dettaglioBottiglia && <>
          <div style={{ display: 'flex', gap: 0, marginBottom: 16, background: '#E2DDD6', borderRadius: 10, padding: 3 }}>
            {[['detail','Dettaglio'],['edit','Modifica']].map(([m, l]) => (
              <button key={m} onClick={() => setModalitaBottiglia(m)} style={{ flex: 1, padding: '8px 0', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', background: modalitaBottiglia === m ? '#fff' : 'transparent', color: modalitaBottiglia === m ? '#1C1410' : '#7A6E65', transition: 'background 0.15s' }}>{l}</button>
            ))}
          </div>
          {modalitaBottiglia === 'detail'
            ? <DettaglioBottiglia b={dettaglioBottiglia} />
            : <ModificaBottiglia
                b={dettaglioBottiglia}
                saving={savingBottiglia}
                onSave={async (changes) => {
                  setSavingBottiglia(true)
                  await handleUpdateBottiglia(dettaglioBottiglia.id, changes)
                  setSavingBottiglia(false)
                  setDettaglioBottiglia(null)
                }}
              />
          }
        </>}
      </Sheet>

      <Toast msg={toast} />
    </div>
  )
}

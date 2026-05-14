import { useState, useEffect, useCallback } from 'react'
import { supabase, seedIfEmpty, getBottiglie, addBottiglia, updateBottiglia, deleteBottiglia, getSchede, addScheda, deleteScheda, updateScheda, getProfilo, aggiornaLastSeen, getGruppo, creaGruppo, creaInvitoGruppo, uniscitiGruppo, aggiornaLingua } from './supabase'
import { t, setLingua, getLingua, LINGUE } from './i18n'
import { useT } from './useT'
import AspiForm, { ASPI_EMPTY, TIPOLOGIE } from './AspiForm'
import AspiDetail from './AspiDetail'
import SchedeASPI from './SchedeASPI'
import Libreria, { getMaturita, matColor, DettaglioBottiglia, ModificaBottiglia } from './Libreria'
import Statistiche from './Statistiche'
import AIChef from './AIChef'
import { PAESI_REGIONI, PAESI_OPTIONS } from './dati'
import ImageUpload from './ImageUpload'
import Auth from './Auth'
import Admin from './Admin'
import BenchmarkASPI from './BenchmarkASPI'

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
    <div style={{ position:'fixed', inset:0, zIndex:200, display:'flex', flexDirection:'column', justifyContent:'flex-end' }}>
      <div onClick={onClose} style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.75)', backdropFilter:'blur(4px)' }} />
      <div style={{ position:'relative', background:'#0f0b08', borderRadius:'20px 20px 0 0', maxHeight:'95dvh', display:'flex', flexDirection:'column', border:'1px solid #1e1a16', borderBottom:'none' }}>
        <div style={{ display:'flex', justifyContent:'center', padding:'12px 0 4px', flexShrink:0 }}>
          <div style={{ width:36, height:4, borderRadius:2, background:'#2a2318' }} />
        </div>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'4px 20px 12px', flexShrink:0, borderBottom:'1px solid #1e1a16' }}>
          <span style={{ fontFamily:'Cormorant Garamond, serif', fontSize:18, fontWeight:400, fontStyle:'italic', color:'#F5EFE0', flex:1, paddingRight:12 }}>{title}</span>
          <button onClick={onClose} style={{ width:32, height:32, borderRadius:'50%', border:'1px solid #2a2318', background:'#1a1611', cursor:'pointer', fontSize:14, color:'#8B7355', flexShrink:0 }}>✕</button>
        </div>
        <div style={{ overflowY:'auto', padding:'16px 16px 40px', flex:1, WebkitOverflowScrolling:'touch', paddingBottom:'max(40px, calc(16px + env(safe-area-inset-bottom, 0px)))' }}>
          {children}
        </div>
      </div>
    </div>
  )
}

function Spinner() {
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'80px 20px', gap:16 }}>
      <div style={{ width:32, height:32, border:'2px solid #2a2318', borderTopColor:'#C8992A', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      <div style={{ fontFamily:'Cormorant Garamond, serif', fontSize:16, color:'#5a4f3f', fontStyle:'italic' }}>{t('gen.caricamento')}</div>
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
  const T = useT()
  const [f, setF] = useState(FORM0)
  const [saving, setSaving] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiFields, setAiFields] = useState(new Set())
  const set = k => v => {
    setAiFields(prev => { const n = new Set(prev); n.delete(k); return n })
    setF(p => ({ ...p, [k]: v }))
  }

  const regioniOptions = f.paese && PAESI_REGIONI[f.paese]
    ? [['', T('form.seleziona')], ...PAESI_REGIONI[f.paese].map(r => [r, r])]
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
        model: 'claude-opus-4-6',
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
      <SecBox title={T('form.foto')}>
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
      <SecBox title={T('form.dati_vino')}>
        <FormInput label={T('form.nome_vino')} value={f.nome} onChange={set('nome')} placeholder={T('form.placeholder.nome')} full aiField={ai('nome')} />
        <FormInput label={T('form.cantina')} value={f.cantina} onChange={set('cantina')} placeholder={T('form.placeholder.cantina')} aiField={ai('cantina')} />
        <FormSelect label={T('form.tipologia')} value={f.tipologia} onChange={set('tipologia')} options={[['','—'],...TIPOLOGIE.map(t=>[t,t])]} aiField={ai('tipologia')} />
        <FormInput label={T('form.anno')} value={f.anno} onChange={set('anno')} placeholder="2019" type="number" aiField={ai('anno')} />
        <div style={{ gridColumn: '1/-1' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
            <span style={S.lbl}>{T('form.paese')}</span>
            {ai('paese') && <span style={{ fontSize: 10, background: '#E6F1FB', color: '#185FA5', padding: '1px 6px', borderRadius: 100, fontWeight: 600 }}>AI</span>}
          </div>
          <select style={{ ...S.inp, borderColor: ai('paese') ? '#185FA5' : undefined }} value={f.paese} onChange={e => setF(p => ({ ...p, paese: e.target.value, regione: '' }))}>
            {PAESI_OPTIONS.map(p => <option key={p} value={p}>{p || T('form.seleziona')}</option>)}
          </select>
        </div>
        {f.paese && f.paese !== 'Altro' && regioniOptions && (
          <div style={{ gridColumn: '1/-1' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
              <span style={S.lbl}>{T('form.regione')}</span>
              {ai('regione') && <span style={{ fontSize: 10, background: '#E6F1FB', color: '#185FA5', padding: '1px 6px', borderRadius: 100, fontWeight: 600 }}>AI</span>}
            </div>
            <select style={{ ...S.inp, borderColor: ai('regione') ? '#185FA5' : undefined }} value={f.regione} onChange={e => set('regione')(e.target.value)}>
              {regioniOptions.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
        )}
        {f.paese === 'Altro' && (
          <FormInput label={T('form.regione')} value={f.regione} onChange={set('regione')} placeholder={T('form.placeholder.regione')} full aiField={ai('regione')} />
        )}
        <FormTextarea label={T('form.note')} value={f.note} onChange={set('note')} placeholder={T('form.placeholder.note')} aiField={ai('note')} />
      </SecBox>

      {/* SEZIONE 2 — Dati di acquisto */}
      <SecBox title={T('form.acquisto')}>
        <FormInput label={T('form.canale')} value={f.canale_acquisto} onChange={set('canale_acquisto')} placeholder={T('form.placeholder.canale')} />
        <FormInput label={T('form.prezzo_acquisto')} value={f.prezzo_acquisto} onChange={set('prezzo_acquisto')} placeholder={T('form.placeholder.prezzo')} type="number" />
        <FormSelect label={T('form.fascia_prezzo')} value={f.prezzo} onChange={set('prezzo')} options={[['','—'],['1','💶 1'],['2','💶💶 2'],['3','💶💶💶 3'],['4','💶💶💶💶 4'],['5','💶💶💶💶💶 5']]} />
        <FormInput label={T('form.quantita')} value={f.quantita} onChange={set('quantita')} type="number" min={1} />
      </SecBox>

      {/* SEZIONE 3 — Arricchimento */}
      <SecBox title={T('form.arricchimento')}>
        <FormInput label={T('form.denominazione')} value={f.denominazione} onChange={set('denominazione')} placeholder={T('form.placeholder.denominazione')} full aiField={ai('denominazione')} />
        <FormInput label={T('form.vitigno')} value={f.vitigno} onChange={set('vitigno')} placeholder={T('form.placeholder.vitigno')} aiField={ai('vitigno')} />
        <FormSelect label={T('form.valutazione')} value={f.valutazione} onChange={set('valutazione')} options={[['','—'],['1','⭐️ 1'],['2','⭐️⭐️ 2'],['3','⭐️⭐️⭐️ 3'],['4','⭐️⭐️⭐️⭐️ 4'],['5','⭐️⭐️⭐️⭐️⭐️ 5']]} aiField={ai('valutazione')} />
        <FormInput label={T('form.temp')} value={f.temp} onChange={set('temp')} placeholder={T('form.placeholder.temp')} aiField={ai('temp')} />
        <FormSelect label={T('form.invecchiamento')} value={f.invecchiamento} onChange={set('invecchiamento')} options={[['non_so',T('form.non_so')],...Array.from({length:30},(_,i)=>[String(i+1),`${i+1} ${i+1===1?T('form.anno_sing'):T('form.anni')}`])]} full aiField={ai('invecchiamento')} />
        <FormTextarea label={T('form.info_cantina')} value={f.info_cantina} onChange={set('info_cantina')} placeholder={T('form.placeholder.info_cantina')} aiField={ai('info_cantina')} />
        <FormTextarea label={T('form.car_bottiglia')} value={f.caratteristiche_bottiglia} onChange={set('caratteristiche_bottiglia')} placeholder={T('form.placeholder.car_bottiglia')} aiField={ai('caratteristiche_bottiglia')} />
        <FormTextarea label={T('form.car_annata')} value={f.caratteristiche_annata} onChange={set('caratteristiche_annata')} placeholder={T('form.placeholder.car_annata')} aiField={ai('caratteristiche_annata')} />
      </SecBox>

      <button onClick={handleAdd} disabled={saving} style={{ ...S.btn, opacity: saving ? 0.7 : 1, marginBottom: 8 }}>
        {saving ? T('form.salvataggio') : T('form.aggiungi')}
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

// ─── Menu utente ─────────────────────────────────────────────────────────────
function UtenteMenu({ profilo, gruppo, isAdmin, onClose, onCondividi, onAdmin, onLogout, showToast, modalitaSommelier, onToggleSommelier, onAvatarUpdate, onCambiaLingua }) {
  const T = useT()
  const [showCambioPassword, setShowCambioPassword] = useState(false)
  const [nuovaPassword, setNuovaPassword] = useState('')
  const [confermaPassword, setConfermaPassword] = useState('')
  const [salvandoPwd, setSalvandoPwd] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState(profilo?.avatar_url || '')
  const [salvandoAvatar, setSalvandoAvatar] = useState(false)

  const handleCambioPassword = async () => {
    if (nuovaPassword.length < 8) { showToast('⚠️ Minimo 8 caratteri'); return }
    if (nuovaPassword !== confermaPassword) { showToast('⚠️ Le password non coincidono'); return }
    setSalvandoPwd(true)
    const { error } = await supabase.auth.updateUser({ password: nuovaPassword })
    if (error) showToast('⚠️ Errore: ' + error.message)
    else { showToast(T('utente.pwd_aggiornata')); setShowCambioPassword(false); setNuovaPassword(''); setConfermaPassword('') }
    setSalvandoPwd(false)
  }

  const handleSalvaAvatar = async (url) => {
    setSalvandoAvatar(true)
    try {
      await supabase.from('profili').update({ avatar_url: url }).eq('id', profilo.id)
      setAvatarUrl(url)
      onAvatarUpdate(url)
      showToast(T('utente.foto_aggiornata'))
    } catch(e) { showToast('⚠️ Errore salvataggio') }
    setSalvandoAvatar(false)
  }

  const S_inp = { width:'100%', padding:'12px 14px', border:'1.5px solid #1e1a16', borderRadius:10, fontSize:15, background:'#1a1611', color:'#F5EFE0', WebkitAppearance:'none', boxSizing:'border-box' }
  const S_btn = { width:'100%', padding:12, background:'#C8992A', color:'#0f0b08', border:'none', borderRadius:10, fontSize:14, fontWeight:700, cursor:'pointer' }

  return (
    <div style={{ position:'fixed', inset:0, zIndex:300, display:'flex', flexDirection:'column', justifyContent:'flex-end' }}>
      <div onClick={onClose} style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.8)', backdropFilter:'blur(4px)' }} />
      <div style={{ position:'relative', background:'#0f0b08', borderRadius:'20px 20px 0 0', maxHeight:'85dvh', display:'flex', flexDirection:'column', paddingBottom:'env(safe-area-inset-bottom, 16px)', border:'1px solid #1e1a16', borderBottom:'none' }}>
        <div style={{ display:'flex', justifyContent:'center', padding:'12px 0 4px' }}>
          <div style={{ width:36, height:4, borderRadius:2, background:'#2a2318' }} />
        </div>

        <div style={{ overflowY:'auto', padding:'8px 20px 32px', flex:1 }}>
          {/* Info utente */}
          <div style={{ background:'#141009', border:'1px solid #1e1a16', borderRadius:14, padding:16, marginBottom:16 }}>
            <div style={{ fontSize:10, fontWeight:700, color:'#C8992A', textTransform:'uppercase', letterSpacing:1, marginBottom:12 }}>{T('utente.titolo')}</div>

            {/* Foto profilo */}
            <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:14 }}>
              <div style={{ position:'relative', flexShrink:0 }}>
                {avatarUrl
                  ? <img src={avatarUrl} alt="profilo" style={{ width:64, height:64, borderRadius:'50%', objectFit:'cover', border:'2px solid #C8992A44' }} />
                  : <div style={{ width:64, height:64, borderRadius:'50%', background:'#1a1611', border:'2px solid #2a2318', display:'flex', alignItems:'center', justifyContent:'center', fontSize:28 }}>👤</div>
                }
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontFamily:'Cormorant Garamond, serif', fontSize:20, fontWeight:400, color:'#F5EFE0', marginBottom:2 }}>{profilo?.nome} {profilo?.cognome}</div>
                <div style={{ fontSize:12, color:'#5a4f3f' }}>{profilo?.email}</div>
              </div>
            </div>

            {/* Upload foto */}
            <div style={{ marginBottom:12 }}>
              <div style={{ fontSize:11, color:'#8B7355', marginBottom:6 }}>{T('utente.foto')}</div>
              <ImageUpload value={avatarUrl} onChange={handleSalvaAvatar} label={T('utente.foto')} folder="avatars" />
            </div>

            {!showCambioPassword ? (
              <button onClick={()=>setShowCambioPassword(true)} style={{ fontSize:12, color:'#C8992A', background:'none', border:'1px solid #C8992A44', borderRadius:8, padding:'6px 12px', cursor:'pointer' }}>
                {T('utente.cambia_pwd')}
              </button>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:10, marginTop:8 }}>
                <input type="password" value={nuovaPassword} onChange={e=>setNuovaPassword(e.target.value)} placeholder={T('utente.nuova_pwd')} style={S_inp} />
                <input type="password" value={confermaPassword} onChange={e=>setConfermaPassword(e.target.value)} placeholder={T('utente.conferma_pwd')} style={S_inp} onKeyDown={e=>e.key==='Enter'&&handleCambioPassword()} />
                <div style={{ display:'flex', gap:8 }}>
                  <button onClick={()=>setShowCambioPassword(false)} style={{ flex:1, padding:10, background:'none', border:'1px solid #2a2318', borderRadius:10, color:'#5a4f3f', fontSize:13, cursor:'pointer' }}>{T('utente.annulla')}</button>
                  <button onClick={handleCambioPassword} disabled={salvandoPwd} style={{ flex:1, padding:10, background:'#C8992A', color:'#0f0b08', border:'none', borderRadius:10, fontSize:13, fontWeight:700, cursor:'pointer', opacity:salvandoPwd?0.7:1 }}>{salvandoPwd?T('form.salvataggio'):T('utente.salva')}</button>
                </div>
              </div>
            )}
          </div>

          {/* Condividi cantina */}
          <button onClick={onCondividi} style={{ width:'100%', display:'flex', alignItems:'center', gap:14, background:'#141009', border:'1px solid #1e1a16', borderRadius:14, padding:16, cursor:'pointer', marginBottom:10, textAlign:'left' }}>
            <span style={{ fontSize:24 }}>👥</span>
            <div>
              <div style={{ fontSize:14, fontWeight:600, color:'#F5EFE0', marginBottom:2 }}>{T('utente.condividi')}</div>
              <div style={{ fontSize:12, color:'#5a4f3f' }}>{gruppo ? `${T('utente.condividi_attiva')} — ${gruppo.nome}` : T('utente.condividi_sub')}</div>
            </div>
            <span style={{ marginLeft:'auto', color:'#5a4f3f', fontSize:16 }}>›</span>
          </button>

          {/* Admin */}
          {isAdmin && (
            <button onClick={onAdmin} style={{ width:'100%', display:'flex', alignItems:'center', gap:14, background:'#141009', border:'1px solid #1e1a16', borderRadius:14, padding:16, cursor:'pointer', marginBottom:10, textAlign:'left' }}>
              <span style={{ fontSize:24 }}>⚙️</span>
              <div>
                <div style={{ fontSize:14, fontWeight:600, color:'#F5EFE0', marginBottom:2 }}>{T('utente.admin')}</div>
                <div style={{ fontSize:12, color:'#5a4f3f' }}>{T('utente.admin_sub')}</div>
              </div>
              <span style={{ marginLeft:'auto', color:'#5a4f3f', fontSize:16 }}>›</span>
            </button>
          )}

          {/* Toggle modalità sommelier */}
          <button onClick={onToggleSommelier} style={{ width:'100%', display:'flex', alignItems:'center', gap:14, background:'#141009', border:'1px solid #1e1a16', borderRadius:14, padding:16, cursor:'pointer', marginBottom:10, textAlign:'left' }}>
            <span style={{ fontSize:24 }}>🎓</span>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:14, fontWeight:600, color:'#F5EFE0', marginBottom:2 }}>{T('utente.sommelier')}</div>
              <div style={{ fontSize:12, color:'#5a4f3f' }}>{modalitaSommelier ? T('utente.sommelier_on') : T('utente.sommelier_off')}</div>
            </div>
            {/* Toggle switch */}
            <div style={{ width:44, height:24, borderRadius:12, background:modalitaSommelier?'#C8992A':'#2a2318', position:'relative', transition:'background 0.2s', flexShrink:0 }}>
              <div style={{ width:20, height:20, borderRadius:'50%', background:'#F5EFE0', position:'absolute', top:2, left:modalitaSommelier?22:2, transition:'left 0.2s' }} />
            </div>
          </button>

          {/* Lingua */}
          <div style={{ background:'#141009', border:'1px solid #1e1a16', borderRadius:14, padding:16, marginBottom:10 }}>
            <div style={{ fontSize:10, fontWeight:700, color:'#C8992A', textTransform:'uppercase', letterSpacing:1, marginBottom:12 }}>{T('utente.lingua')}</div>
            <div style={{ display:'flex', gap:8 }}>
              {LINGUE.map(l => (
                <button key={l.code} onClick={() => onCambiaLingua(l.code)}
                  style={{ flex:1, padding:'10px 8px', border:`1px solid ${getLingua()===l.code?'#C8992A':'#1e1a16'}`, borderRadius:10, background:getLingua()===l.code?'#C8992A22':'none', cursor:'pointer', textAlign:'center' }}>
                  <div style={{ fontSize:20, marginBottom:3 }}>{l.flag}</div>
                  <div style={{ fontSize:11, color:getLingua()===l.code?'#C8992A':'#5a4f3f', fontWeight:getLingua()===l.code?700:400 }}>{l.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Logout */}
          <button onClick={onLogout} style={{ width:'100%', display:'flex', alignItems:'center', gap:14, background:'#1a0a0a', border:'1px solid #2a1010', borderRadius:14, padding:16, cursor:'pointer', textAlign:'left' }}>
            <span style={{ fontSize:24 }}>↩</span>
            <div style={{ fontSize:14, fontWeight:600, color:'#9B2335' }}>{T('utente.logout')}</div>
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Pannello condivisione cantina ───────────────────────────────────────────
function GruppoPanel({ profilo, gruppo, onClose, onGruppoAggiornato, showToast }) {
  const T = useT()
  const [codiceInput, setCodiceInput] = useState('')
  const [codiceGenerato, setCodiceGenerato] = useState('')
  const [loading, setLoading] = useState(false)

  const handleCreaGruppo = async () => {
    setLoading(true)
    try {
      const { gruppo: g } = await creaGruppo()
      showToast('✓ ' + T('gruppo.creata'))
      onGruppoAggiornato(g)
    } catch(e) { showToast('Errore: ' + e.message) }
    setLoading(false)
  }

  const handleCreaInvito = async () => {
    setLoading(true)
    try {
      const { codice } = await creaInvitoGruppo()
      setCodiceGenerato(codice)
    } catch(e) { showToast('Errore: ' + e.message) }
    setLoading(false)
  }

  const handleUnisciti = async () => {
    if (!codiceInput.trim()) return
    setLoading(true)
    try {
      const { gruppo_id } = await uniscitiGruppo(codiceInput.trim())
      showToast('✓ ' + T('gruppo.creata'))
      onGruppoAggiornato({ id: gruppo_id })
      onClose()
    } catch(e) { showToast('Errore: ' + e.message) }
    setLoading(false)
  }

  const S_inp = { width: '100%', padding: '12px 14px', border: '1.5px solid #E2DDD6', borderRadius: 10, fontSize: 15, background: '#fff', color: '#1C1410', WebkitAppearance: 'none', boxSizing: 'border-box' }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 300, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(28,20,16,0.6)', backdropFilter: 'blur(2px)' }} />
      <div style={{ position: 'relative', background: '#F4F1EC', borderRadius: '20px 20px 0 0', maxHeight: '80dvh', display: 'flex', flexDirection: 'column', paddingBottom: 'env(safe-area-inset-bottom, 16px)' }}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px' }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: '#D6D0C8' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 20px 16px' }}>
          <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 18, fontWeight: 400, fontStyle: 'italic', color: '#1C1410' }}>{T('gruppo.titolo')}</div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: '50%', border: 'none', background: '#E2DDD6', cursor: 'pointer', fontSize: 14, color: '#7A6E65' }}>✕</button>
        </div>
        <div style={{ overflowY: 'auto', padding: '0 20px 32px', flex: 1 }}>
          <div style={{ background: '#fff', border: '1px solid #E2DDD6', borderRadius: 14, padding: 16, marginBottom: 20 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#7B1E2E', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>{T('gruppo.la_tua')}</div>
            {gruppo ? (
              <>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#1C1410', marginBottom: 4 }}>{gruppo.nome}</div>
                <div style={{ fontSize: 13, color: '#7A6E65' }}>{T('gruppo.condivisa')}</div>
              </>
            ) : (
              <>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#1C1410', marginBottom: 4 }}>{T('app.cantina_di')} {profilo?.nome}</div>
                <div style={{ fontSize: 13, color: '#7A6E65' }}>{T('gruppo.solo_tu')}</div>
              </>
            )}
          </div>

          <div style={{ background: '#fff', border: '1px solid #E2DDD6', borderRadius: 14, padding: 16, marginBottom: 16 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#7B1E2E', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>{T('gruppo.invita')}</div>
            <div style={{ fontSize: 13, color: '#7A6E65', marginBottom: 14, lineHeight: 1.5 }}>
              {gruppo ? T('gruppo.invita_desc') : T('gruppo.prima_crea')}
            </div>
            {!gruppo ? (
              <button onClick={handleCreaGruppo} disabled={loading}
                style={{ width: '100%', padding: 13, background: '#1C1410', color: '#fff', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
                {loading ? T('gruppo.creando') : T('gruppo.crea')}
              </button>
            ) : codiceGenerato ? (
              <div style={{ background: '#F5EFE0', border: '1px solid #C8992A', borderRadius: 10, padding: 14, textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: '#854F0B', marginBottom: 6 }}>{T('gruppo.codice_generato')}</div>
                <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: 4, color: '#1C1410', fontFamily: 'monospace' }}>{codiceGenerato}</div>
                <div style={{ fontSize: 12, color: '#7A6E65', marginTop: 6 }}>{T('gruppo.condividi_con')}</div>
              </div>
            ) : (
              <button onClick={handleCreaInvito} disabled={loading}
                style={{ width: '100%', padding: 13, background: '#1C1410', color: '#fff', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
                {loading ? T('gruppo.generando') : T('gruppo.genera')}
              </button>
            )}
          </div>

          {!gruppo && (
            <div style={{ background: '#fff', border: '1px solid #E2DDD6', borderRadius: 14, padding: 16 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#7B1E2E', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>{T('gruppo.unisciti')}</div>
              <div style={{ fontSize: 13, color: '#7A6E65', marginBottom: 14, lineHeight: 1.5 }}>{T('gruppo.unisciti_desc')}</div>
              <input value={codiceInput} onChange={e => setCodiceInput(e.target.value.toUpperCase())}
                placeholder={T('gruppo.placeholder')}
                style={{ ...S_inp, marginBottom: 10, letterSpacing: 2, fontFamily: 'monospace' }} />
              <button onClick={handleUnisciti} disabled={loading || !codiceInput.trim()}
                style={{ width: '100%', padding: 13, background: '#7B1E2E', color: '#fff', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: 'pointer', opacity: (loading || !codiceInput.trim()) ? 0.6 : 1 }}>
                {loading ? T('gruppo.connessione') : T('gruppo.unisciti_btn')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── APP ROOT ─────────────────────────────────────────────────────────────────
// ─── APP ROOT ─────────────────────────────────────────────────────────────────
export default function App() {
  const T = useT()
  const [session, setSession] = useState(undefined)
  const [profilo, setProfilo] = useState(null)
  const [gruppo, setGruppo] = useState(null)
  const [showAdmin, setShowAdmin] = useState(false)
  const [showGruppo, setShowGruppo] = useState(false)
  const [showUtente, setShowUtente] = useState(false)
  const [showFab, setShowFab] = useState(false)
  const [modalitaSommelier, setModalitaSommelier] = useState(true)
  const [benchmarkScheda, setBenchmarkScheda] = useState(null)
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
  const [editScheda, setEditScheda] = useState(null)

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(''), 2500) }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (!session) { setCantina([]); setArchivio([]) }
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!session) return
    if (cantina.length > 0) return
    ;(async () => {
      try {
        const [c, a, p, g] = await Promise.all([getBottiglie(), getSchede(), getProfilo(), getGruppo()])
        setCantina(c); setArchivio(a); setProfilo(p); setGruppo(g.gruppo)
        if (p?.lingua) setLingua(p.lingua)
        if (!loading) aggiornaLastSeen()
      } catch (e) {
        showToast(t('gen.errore_connessione'))
        console.error(e)
      } finally { setLoading(false) }
    })()
  }, [session])

  useEffect(() => {
    if (!session) return
    const cantinaChannel = supabase
      .channel('cantina_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cantina' }, () => {
        getBottiglie().then(setCantina).catch(console.error)
      })
      .subscribe()
    const archivioChannel = supabase
      .channel('archivio_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'archivio' }, () => {
        getSchede().then(setArchivio).catch(console.error)
      })
      .subscribe()
    return () => { supabase.removeChannel(cantinaChannel); supabase.removeChannel(archivioChannel) }
  }, [session])

  const handleQty = useCallback(async (id, delta) => {
    const b = cantina.find(x => x.id === id); if (!b) return
    const nuova = Math.max(1, b.quantita + delta)
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
    setDettaglioBottiglia(updated)
    setModalitaBottiglia('detail')
    showToast(t('gen.bottiglia_aggiornata'))
  }, [])

  const handleSaveASPI = useCallback(async (formData) => {
    const oggi = today()
    const record = { ...formData, data: oggi }
    if (aspiBottiglia) {
      const b = aspiBottiglia
      const nuovaQty = Math.max(0, b.quantita - 1)
      if (nuovaQty === 0) { await deleteBottiglia(b.id); setCantina(prev => prev.filter(x => x.id !== b.id)) }
      else { await updateBottiglia(b.id, { quantita: nuovaQty }); setCantina(prev => prev.map(x => x.id === b.id ? { ...x, quantita: nuovaQty } : x)) }
    }
    const saved = await addScheda(record)
    setArchivio(prev => [saved, ...prev].sort((a, b) => (b.voto || 0) - (a.voto || 0)))
    setAspiBottiglia(null); setAspiLibera(false)
    showToast(t('gen.scheda_salvata'))
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
    setArchivio(prev => prev.map(s => s.id === editScheda.id ? updated : s).sort((a, b) => (b.voto || 0) - (a.voto || 0)))
    setEditScheda(null)
    showToast(t('gen.scheda_aggiornata'))
    setTab('schede')
  }, [editScheda])

  const aspiInitial = aspiBottiglia ? {
    nomeVino: aspiBottiglia.nome || '', cantina: aspiBottiglia.cantina || '',
    annata: aspiBottiglia.anno ? String(aspiBottiglia.anno) : '',
    tipologia: aspiBottiglia.tipologia || '', temperatura: aspiBottiglia.temp || '',
    denominazione: aspiBottiglia.denominazione || '', paese: aspiBottiglia.paese || '',
    regione: aspiBottiglia.regione || '', foto_url: aspiBottiglia.foto_url || '',
  } : {}
  const aspiSheetOpen = !!aspiBottiglia || aspiLibera
  const aspiTitle = aspiBottiglia ? `${aspiBottiglia.nome}${aspiBottiglia.anno ? ' ' + aspiBottiglia.anno : ''}` : 'Nuova scheda ASPI'

  // KPI topbar — bottiglie = unità fisiche totali, etichette = righe distinte
  const totBottiglie = cantina.reduce((s,b) => s+(b.quantita||0), 0)
  const totEtichette = cantina.length
  const valoreEur = cantina.reduce((s,b) => s+(b.prezzo_acquisto||0)*(b.quantita||0), 0)
  const fmtEur = v => v > 0 ? `€ ${v.toLocaleString('it-IT',{minimumFractionDigits:0,maximumFractionDigits:0})}` : '—'

  if (session === undefined) return (
    <div style={{ height:'100dvh', display:'flex', alignItems:'center', justifyContent:'center', background:'#0f0b08' }}>
      <div style={{ fontFamily:'Cormorant Garamond, serif', fontSize:40, color:'#C8992A' }}>🍷</div>
    </div>
  )
  if (session === null) return <Auth />

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', background:'#0f0b08', overflow:'hidden' }}>

      {/* Topbar */}
      <div style={{ background:'#0f0b08', paddingTop:'calc(12px + env(safe-area-inset-top, 0px))', flexShrink:0, borderBottom:'1px solid #1e1a16' }}>
        <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', padding:'0 16px' }}>
          <div>
            <div style={{ fontFamily:'Cormorant Garamond, serif', fontSize:10, fontWeight:300, letterSpacing:3, textTransform:'uppercase', color:'#8B7355', marginBottom:3 }}>
              {gruppo?.nome || `${T('app.cantina_di')} ${profilo?.nome || '...'}`}
            </div>
            <div style={{ fontFamily:'Cormorant Garamond, serif', fontSize:26, fontWeight:300, color:'#F5EFE0', fontStyle:'italic', lineHeight:1 }}>
              {T('app.nome')}
            </div>
          </div>
          <button onClick={() => setShowUtente(true)}
            style={{ width:38, height:38, borderRadius:'50%', background:'#1a1611', border:'1px solid #2a2318', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, marginBottom:4, overflow:'hidden', padding:0 }}>
            {profilo?.avatar_url
              ? <img src={profilo.avatar_url} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', borderRadius:'50%' }} />
              : '👤'
            }
          </button>
        </div>
        <div style={{ display:'flex', borderTop:'1px solid #1e1a16', marginTop:10 }}>
          {[[T('kpi.bottiglie'),totBottiglie],[T('kpi.etichette'),totEtichette],[T('kpi.valore'),fmtEur(valoreEur)]].map(([lbl,val])=>(
            <div key={lbl} style={{ flex:1, padding:'8px 12px', borderRight:'1px solid #1e1a16', textAlign:'center' }}>
              <div style={{ fontFamily:'Cormorant Garamond, serif', fontSize:18, fontWeight:300, color:'#F5EFE0', lineHeight:1 }}>{val}</div>
              <div style={{ fontSize:9, letterSpacing:1.5, textTransform:'uppercase', color:'#5a4f3f', marginTop:2 }}>{lbl}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex:1, overflowY:'auto', WebkitOverflowScrolling:'touch', paddingBottom:80 }}>
        {loading ? <Spinner /> : <>
          {tab==='libreria' && <div style={{padding:'12px 14px 0'}}><Libreria cantina={cantina} onBevuto={b=>{
            if (modalitaSommelier) { setAspiBottiglia(b); setAspiLibera(false) }
            else { handleQty(b.id, -1) }
          }} onQty={handleQty} onElimina={handleDeleteBottiglia} onUpdate={handleUpdateBottiglia} onDettaglio={b=>{setDettaglioBottiglia(b);setModalitaBottiglia('detail')}} /></div>}
          {tab==='statistiche' && <div style={{padding:'0 14px'}}><Statistiche cantina={cantina} onBottigliaClick={b=>{setDettaglioBottiglia(b);setModalitaBottiglia('detail')}} /></div>}
          {tab==='abbinamento' && <div style={{padding:'0 14px'}}><AIChef cantina={cantina} /></div>}
          {tab==='schede' && <div style={{padding:'0 14px'}}><SchedeASPI archivio={archivio} onNuova={()=>{setAspiBottiglia(null);setAspiLibera(true)}} onElimina={handleDeleteScheda} onOpen={scheda=>setEditScheda(scheda)} onUpdateScheda={updated=>setArchivio(prev=>prev.map(s=>s.id===updated.id?updated:s))} onBenchmark={setBenchmarkScheda} /></div>}
        </>}
      </div>

      {/* Bottom Nav */}
      <div style={{ position:'fixed', bottom:0, left:0, right:0, background:'#0a0806', borderTop:'1px solid #1e1a16', display:'flex', zIndex:50 }}>
        {[['libreria','🍾',T('nav.cantina')],['statistiche','📊',T('nav.stats')],['abbinamento','✦',T('nav.ai_chef')],...(modalitaSommelier?[['schede','📓',T('nav.schede')]]:[])]
          .map(([id,icon,label])=>{
            const active = tab===id
            return (
              <button key={id} onClick={()=>setTab(id)} style={{ flex:1, padding:'12px 4px 10px', border:'none', background:'none', cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:3 }}>
                <span style={{ fontSize:18, lineHeight:1, color:active?'#C8992A':'#5a4f3f' }}>{icon}</span>
                <span style={{ fontSize:9, letterSpacing:'0.8px', textTransform:'uppercase', fontWeight:active?700:400, color:active?'#C8992A':'#5a4f3f' }}>{label}</span>
              </button>
            )
          })}
        <div style={{ position:'absolute', bottom:'-100px', left:0, right:0, height:'100px', background:'#0a0806' }} />
      </div>

      {/* FAB */}
      <button onClick={()=>setShowFab(v=>!v)}
        style={{ position:'fixed', bottom:70, right:20, width:50, height:50, borderRadius:'50%', background:'#C8992A', border:'none', cursor:'pointer', fontSize:26, color:'#0f0b08', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 4px 20px #C8992A55', zIndex:52, lineHeight:1, fontWeight:300 }}>
        {showFab ? '✕' : '+'}
      </button>

      {/* FAB menu */}
      {showFab && (
        <>
          <div style={{ position:'fixed', inset:0, zIndex:51, background:'rgba(0,0,0,0.5)', backdropFilter:'blur(2px)' }} onClick={()=>setShowFab(false)} />
          <div style={{ position:'fixed', bottom:132, right:20, display:'flex', flexDirection:'column', gap:10, alignItems:'flex-end', zIndex:52 }}>
            {modalitaSommelier && (
              <button onClick={()=>{setShowFab(false);setAspiBottiglia(null);setAspiLibera(true)}}
                style={{ display:'flex', alignItems:'center', gap:12, background:'#1a1611', border:'1px solid #2a2318', borderRadius:12, padding:'13px 18px', cursor:'pointer', boxShadow:'0 4px 20px rgba(0,0,0,0.4)' }}>
                <span style={{ fontSize:13, color:'#F5EFE0', fontWeight:500, fontFamily:'DM Sans, sans-serif' }}>{T('fab.nuova_scheda')}</span>
                <span style={{ fontSize:20 }}>📓</span>
              </button>
            )}
            <button onClick={()=>{setShowFab(false);setTab('aggiungi-bottiglia')}}
              style={{ display:'flex', alignItems:'center', gap:12, background:'#1a1611', border:'1px solid #2a2318', borderRadius:12, padding:'13px 18px', cursor:'pointer', boxShadow:'0 4px 20px rgba(0,0,0,0.4)' }}>
              <span style={{ fontSize:13, color:'#F5EFE0', fontWeight:500, fontFamily:'DM Sans, sans-serif' }}>{T('fab.nuova_bottiglia')}</span>
              <span style={{ fontSize:20 }}>🍾</span>
            </button>
          </div>
        </>
      )}

      {/* Sheet aggiungi bottiglia */}
      <Sheet open={tab==='aggiungi-bottiglia'} onClose={()=>setTab('libreria')} title={t('fab.nuova_bottiglia')}>
        <AggiungiForm onAdd={handleAdd} showToast={showToast} />
      </Sheet>

      {/* Sheet: nuova scheda ASPI */}
      <Sheet open={aspiSheetOpen} onClose={()=>{setAspiBottiglia(null);setAspiLibera(false)}} title={aspiTitle}>
        {aspiSheetOpen && <AspiForm initial={aspiInitial} oggi={today()} onSave={handleSaveASPI} />}
      </Sheet>

      {/* Sheet: modifica scheda ASPI */}
      <Sheet open={!!editScheda} onClose={()=>setEditScheda(null)} title={editScheda?`Modifica — ${editScheda.nomeVino||editScheda.nome||'Scheda ASPI'}`:''}>
        {editScheda && <AspiForm initial={editScheda} oggi={editScheda.data} onSave={handleUpdateScheda} saveLabel="Salva modifiche" />}
      </Sheet>

      {/* Sheet: dettaglio/modifica bottiglia */}
      <Sheet open={!!dettaglioBottiglia} onClose={()=>setDettaglioBottiglia(null)} title={dettaglioBottiglia?.nome||''}>
        {dettaglioBottiglia && <>
          <div style={{ display:'flex', gap:0, marginBottom:16, background:'#1a1611', borderRadius:10, padding:3 }}>
            {[['detail',T('det.dettaglio')],['edit',T('det.modifica')]].map(([m,l])=>(
              <button key={m} onClick={()=>setModalitaBottiglia(m)} style={{ flex:1, padding:'8px 0', border:'none', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer', background:modalitaBottiglia===m?'#2a2318':'transparent', color:modalitaBottiglia===m?'#F5EFE0':'#5a4f3f' }}>{l}</button>
            ))}
          </div>
          {modalitaBottiglia==='detail'
            ?<DettaglioBottiglia b={dettaglioBottiglia}/>
            :<ModificaBottiglia b={dettaglioBottiglia} saving={savingBottiglia} onSave={async(changes)=>{setSavingBottiglia(true);await handleUpdateBottiglia(dettaglioBottiglia.id,changes);setSavingBottiglia(false);setDettaglioBottiglia(null)}}/>
          }
        </>}
      </Sheet>

      {/* Menu utente */}
      {showUtente && (
        <UtenteMenu
          profilo={profilo}
          gruppo={gruppo}
          isAdmin={profilo?.is_admin}
          onClose={()=>setShowUtente(false)}
          onCondividi={()=>{setShowUtente(false);setShowGruppo(true)}}
          onAdmin={()=>{setShowUtente(false);setShowAdmin(true)}}
          onLogout={()=>supabase.auth.signOut()}
          showToast={showToast}
          modalitaSommelier={modalitaSommelier}
          onToggleSommelier={()=>setModalitaSommelier(v=>!v)}
          onAvatarUpdate={url=>setProfilo(p=>({...p,avatar_url:url}))}
          onCambiaLingua={async (l) => { setLingua(l); await aggiornaLingua(l) }}
        />
      )}

      {showAdmin && <Admin onClose={()=>setShowAdmin(false)} />}

      {showGruppo && (
        <GruppoPanel profilo={profilo} gruppo={gruppo} onClose={()=>setShowGruppo(false)}
          onGruppoAggiornato={(g)=>{setGruppo(g);setCantina([]);setArchivio([])}} showToast={showToast} />
      )}

      {benchmarkScheda && (
        <BenchmarkASPI
          scheda={benchmarkScheda}
          onClose={() => setBenchmarkScheda(null)}
          onSaved={updated => {
            setBenchmarkScheda(null)
            setArchivio(prev => prev.map(s => s.id === updated.id ? updated : s))
          }}
        />
      )}

      <Toast msg={toast} />
    </div>
  )
}

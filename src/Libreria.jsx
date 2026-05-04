import { useState, useMemo, useRef } from 'react'
import { TIPOLOGIE } from './AspiForm'
import { PAESI_REGIONI, PAESI_OPTIONS } from './dati'
import ImageUpload from './ImageUpload'

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getMaturita(b) {
  if (b.invecchiamento === null || b.invecchiamento === undefined) return { label: 'Da definire', cls: 'blue', pct: null }
  if (!b.anno) return { label: 'Da definire', cls: 'blue', pct: null }
  const eta = new Date().getFullYear() - b.anno
  if (eta < 0) return { label: 'Da definire', cls: 'blue', pct: null }
  const r = eta / b.invecchiamento
  const pct = Math.round(r * 100)
  if (r > 1.1)  return { label: 'Oltre il picco', cls: 'red',   pct }
  if (r >= 0.9) return { label: 'Al picco',        cls: 'amber', pct }
  return              { label: 'In evoluzione',    cls: 'green', pct }
}

export const matColor = cls => ({ green:'#2D6A4F', amber:'#C8992A', red:'#9B2335', blue:'#1A5FA8' })[cls] || '#5a4f3f'

const TIPO_COLOR = {
  Rosso:      '#993C1D', Bianco:     '#854F0B', Rosato:     '#993556',
  Orange:     '#9A4E0A', Bollicine:  '#185FA5', Dolce:      '#876200', Fortificato:'#5B2D8E',
}
const TIPO_BG = {
  Rosso:      '#FAECE722', Bianco:     '#FAEEDA22', Rosato:     '#FBEAF022',
  Orange:     '#FDE8D022', Bollicine:  '#E6F1FB22', Dolce:      '#FDF4DC22', Fortificato:'#EDE6F522',
}
const TIPO_SOLID = {
  Rosso:      '#7B1E2E', Bianco:     '#6B4A10', Rosato:     '#7B2040',
  Orange:     '#7A3A10', Bollicine:  '#1A4A80', Dolce:      '#5A4400', Fortificato:'#3D1A6E',
}

const stars = n => '⭐️'.repeat(n || 0)
const money = n => '💶'.repeat(n || 0)

const GRUPPI_ORDINE = ['Oltre il picco','Al picco','In evoluzione','Da definire']
const GRUPPI_META = {
  'Oltre il picco': { emoji:'🔴', desc:'Da bere subito',      cls:'red'   },
  'Al picco':       { emoji:'🟡', desc:'Momento ideale',      cls:'amber' },
  'In evoluzione':  { emoji:'🟢', desc:'In affinamento',      cls:'green' },
  'Da definire':    { emoji:'🔵', desc:'Potenziale mancante', cls:'blue'  },
}

const S = {
  inp: { width:'100%', padding:'11px 14px', border:'1.5px solid #1e1a16', borderRadius:10, fontSize:15, background:'#1a1611', color:'#F5EFE0', WebkitAppearance:'none', appearance:'none' },
}

// ─── Confirm dialog ───────────────────────────────────────────────────────────
function ConfirmDialog({ open, nome, onConfirm, onCancel }) {
  if (!open) return null
  return (
    <div style={{ position:'fixed', inset:0, zIndex:400, display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
      <div onClick={onCancel} style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.8)', backdropFilter:'blur(4px)' }} />
      <div style={{ position:'relative', background:'#141009', borderRadius:16, padding:24, width:'100%', maxWidth:340, textAlign:'center', border:'1px solid #2a2318' }}>
        <div style={{ fontSize:32, marginBottom:12 }}>🗑️</div>
        <div style={{ fontFamily:'Cormorant Garamond, serif', fontSize:18, fontWeight:400, color:'#F5EFE0', marginBottom:8 }}>Elimina bottiglia</div>
        <div style={{ fontSize:13, color:'#8B7355', marginBottom:24, lineHeight:1.6 }}>Vuoi eliminare <em>"{nome}"</em> dalla cantina?</div>
        <div style={{ display:'flex', gap:10 }}>
          <button onClick={onCancel} style={{ flex:1, padding:12, background:'#1a1611', color:'#8B7355', border:'1px solid #2a2318', borderRadius:10, fontSize:14, cursor:'pointer' }}>Annulla</button>
          <button onClick={onConfirm} style={{ flex:1, padding:12, background:'#9B2335', color:'#F5EFE0', border:'none', borderRadius:10, fontSize:14, fontWeight:600, cursor:'pointer' }}>Elimina</button>
        </div>
      </div>
    </div>
  )
}

// ─── DettaglioBottiglia ───────────────────────────────────────────────────────
export function DettaglioBottiglia({ b }) {
  const m = getMaturita(b)
  const pct = m.pct !== null ? m.pct : null

  const Row = ({ label, value }) => {
    if (!value && value !== 0) return null
    return (
      <div style={{ display:'flex', gap:12, padding:'9px 0', borderBottom:'1px solid #1e1a16' }}>
        <span style={{ fontSize:12, color:'#5a4f3f', minWidth:130, flexShrink:0 }}>{label}</span>
        <span style={{ fontSize:14, color:'#F5EFE0', lineHeight:1.4, flex:1 }}>{value}</span>
      </div>
    )
  }

  const SecBox = ({ title, children }) => (
    <div style={{ background:'#141009', border:'1px solid #1e1a16', borderRadius:14, padding:16, marginBottom:12 }}>
      <div style={{ fontSize:10, fontWeight:700, color:'#C8992A', textTransform:'uppercase', letterSpacing:1.2, marginBottom:12, paddingBottom:8, borderBottom:'1px solid #1e1a16' }}>{title}</div>
      {children}
    </div>
  )

  return (
    <div>
      {b.foto_url && <img src={b.foto_url} alt={b.nome} style={{ width:'100%', maxHeight:260, objectFit:'cover', borderRadius:14, marginBottom:14, border:'1px solid #1e1a16' }} />}
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
        <span style={{ fontSize:11, fontWeight:600, letterSpacing:0.8, textTransform:'uppercase', padding:'4px 12px', borderRadius:100, background: TIPO_BG[b.tipologia]||'#1a1611', color: TIPO_COLOR[b.tipologia]||'#8B7355', border:`1px solid ${TIPO_COLOR[b.tipologia]||'#5a4f3f'}33` }}>
          {b.tipologia || '—'}
        </span>
        <div style={{ display:'flex', alignItems:'center', gap:5 }}>
          <div style={{ width:8, height:8, borderRadius:'50%', background:matColor(m.cls) }} />
          <span style={{ fontSize:12, fontWeight:600, color:matColor(m.cls) }}>{m.label}</span>
          {pct !== null && <span style={{ fontSize:12, color:'#5a4f3f' }}>({pct}%)</span>}
        </div>
      </div>
      {pct !== null && (
        <div style={{ height:5, borderRadius:3, background:'#1e1a16', overflow:'hidden', marginBottom:16 }}>
          <div style={{ height:'100%', width:`${Math.min(pct,100)}%`, background:matColor(m.cls), borderRadius:3 }} />
        </div>
      )}
      <SecBox title="Dati del vino">
        <Row label="Nome" value={b.nome} />
        <Row label="Cantina" value={b.cantina} />
        <Row label="Anno" value={b.anno} />
        <Row label="Paese" value={b.paese} />
        <Row label="Regione" value={b.regione} />
        <Row label="Vitigno" value={b.vitigno} />
        {b.info_cantina && <Row label="Info cantina" value={b.info_cantina} />}
        {b.caratteristiche_bottiglia && <Row label="Caratteristiche" value={b.caratteristiche_bottiglia} />}
        {b.caratteristiche_annata && <Row label="Annata" value={b.caratteristiche_annata} />}
      </SecBox>
      <SecBox title="Consumo">
        <Row label="Valutazione annata" value={b.valutazione ? stars(b.valutazione) : null} />
        <Row label="Fascia prezzo" value={b.prezzo ? money(b.prezzo) : null} />
        <Row label="Prezzo acquisto" value={b.prezzo_acquisto ? `€ ${Number(b.prezzo_acquisto).toFixed(2)} / bott.` : null} />
        <Row label="Temperatura servizio" value={b.temp} />
        <Row label="Invecchiamento" value={b.invecchiamento ? `${b.invecchiamento} anni` : null} />
        <Row label="Note" value={b.note} />
      </SecBox>
    </div>
  )
}

// ─── Componenti form modifica ─────────────────────────────────────────────────
function EditInput({ label, value, onChange, placeholder, type, full, aiField }) {
  return (
    <div style={full ? { gridColumn:'1/-1' } : {}}>
      <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:5 }}>
        <span style={{ fontSize:12, fontWeight:500, color:'#8B7355' }}>{label}</span>
        {aiField && <span style={{ fontSize:10, background:'#1A5FA822', color:'#185FA5', padding:'1px 6px', borderRadius:100, fontWeight:600, border:'1px solid #185FA533' }}>AI</span>}
      </div>
      <input style={{ ...S.inp, borderColor:aiField?'#185FA5':undefined }} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder||''} type={type||'text'} />
    </div>
  )
}
function EditSelect({ label, value, onChange, options, full, aiField }) {
  return (
    <div style={full ? { gridColumn:'1/-1' } : {}}>
      <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:5 }}>
        <span style={{ fontSize:12, fontWeight:500, color:'#8B7355' }}>{label}</span>
        {aiField && <span style={{ fontSize:10, background:'#1A5FA822', color:'#185FA5', padding:'1px 6px', borderRadius:100, fontWeight:600, border:'1px solid #185FA533' }}>AI</span>}
      </div>
      <select style={{ ...S.inp, borderColor:aiField?'#185FA5':undefined }} value={value} onChange={e=>onChange(e.target.value)}>
        {options.map(([v,l])=><option key={v} value={v}>{l}</option>)}
      </select>
    </div>
  )
}
function EditTextarea({ label, value, onChange, placeholder, aiField }) {
  return (
    <div style={{ gridColumn:'1/-1' }}>
      <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:5 }}>
        <span style={{ fontSize:12, fontWeight:500, color:'#8B7355' }}>{label}</span>
        {aiField && <span style={{ fontSize:10, background:'#1A5FA822', color:'#185FA5', padding:'1px 6px', borderRadius:100, fontWeight:600, border:'1px solid #185FA533' }}>AI</span>}
      </div>
      <textarea style={{ ...S.inp, minHeight:70, resize:'vertical', lineHeight:1.5 }} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder||''} />
    </div>
  )
}
function EditSecBox({ title, children }) {
  return (
    <div style={{ background:'#141009', border:'1px solid #1e1a16', borderRadius:14, padding:16, marginBottom:14 }}>
      <div style={{ fontSize:10, fontWeight:700, color:'#C8992A', textTransform:'uppercase', letterSpacing:1.2, marginBottom:14, paddingBottom:8, borderBottom:'1px solid #1e1a16' }}>{title}</div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>{children}</div>
    </div>
  )
}

async function callAIModifica(payload) {
  const res = await fetch('/api/claude', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload) })
  const data = await res.json()
  if (data.error) throw new Error(data.error.message)
  const raw = data.content[0].text.replace(/```json\n?/g,'').replace(/```\n?/g,'').trim()
  return JSON.parse(raw)
}

export function ModificaBottiglia({ b, onSave, saving }) {
  const [f, setF] = useState({
    nome:b.nome||'', cantina:b.cantina||'', tipologia:b.tipologia||'',
    anno:b.anno?String(b.anno):'', quantita:b.quantita?String(b.quantita):'1',
    paese:b.paese||'', regione:b.regione||'', denominazione:b.denominazione||'',
    vitigno:b.vitigno||'', valutazione:b.valutazione?String(b.valutazione):'',
    prezzo:b.prezzo?String(b.prezzo):'', prezzo_acquisto:b.prezzo_acquisto?String(b.prezzo_acquisto):'',
    canale_acquisto:b.canale_acquisto||'', temp:b.temp||'',
    invecchiamento:b.invecchiamento?String(b.invecchiamento):'non_so',
    note:b.note||'', foto_url:b.foto_url||'',
    info_cantina:b.info_cantina||'', caratteristiche_bottiglia:b.caratteristiche_bottiglia||'',
    caratteristiche_annata:b.caratteristiche_annata||'',
  })
  const [aiFields, setAiFields] = useState(new Set())
  const [aiLoading, setAiLoading] = useState(false)
  const set = k => v => { setAiFields(prev=>{const n=new Set(prev);n.delete(k);return n}); setF(p=>({...p,[k]:v})) }
  const regioniOptions = f.paese && PAESI_REGIONI[f.paese] ? [['','— seleziona —'],...PAESI_REGIONI[f.paese].map(r=>[r,r])] : null
  const ai = k => aiFields.has(k)

  const handleAI = async () => {
    setAiLoading(true)
    try {
      const SYSTEM = `Sei un esperto enologo. Analizza le informazioni sul vino e restituisci SOLO JSON valido senza markdown. Compila solo i campi di cui sei 100% certo. Lascia stringa vuota se non sei certo. Valutazione annata: 1-5 (0 se incerto). Invecchiamento: numero anni (0 se incerto). {"nome":"","cantina":"","tipologia":"","anno":"","paese":"","regione":"","denominazione":"","vitigno":"","valutazione":"","temp":"","invecchiamento":"","info_cantina":"","caratteristiche_bottiglia":"","caratteristiche_annata":"","note":""}`
      const userContent = []
      if (f.foto_url) {
        const imgRes = await fetch(f.foto_url)
        const blob = await imgRes.blob()
        const base64 = await new Promise(res=>{const r=new FileReader();r.onload=()=>res(r.result.split(',')[1]);r.readAsDataURL(blob)})
        userContent.push({type:'image',source:{type:'base64',media_type:blob.type||'image/jpeg',data:base64}})
      }
      const testo = [f.nome,f.cantina,f.anno,f.paese,f.regione,f.vitigno].filter(Boolean).join(', ')
      userContent.push({type:'text',text:testo?`Vino: ${testo}`:"Analizza l'etichetta."})
      const result = await callAIModifica({model:'claude-sonnet-4-6',max_tokens:800,system:SYSTEM,messages:[{role:'user',content:userContent}]})
      const newAiFields=new Set(); const updates={}
      const campi=['nome','cantina','tipologia','anno','paese','regione','denominazione','vitigno','valutazione','temp','invecchiamento','info_cantina','caratteristiche_bottiglia','caratteristiche_annata','note']
      campi.forEach(k=>{const v=result[k];if(v&&String(v)!=='0'&&String(v)!==''){updates[k]=String(v);newAiFields.add(k)}})
      setF(p=>({...p,...updates})); setAiFields(newAiFields)
    } catch(e){console.error(e)} finally{setAiLoading(false)}
  }

  const handleSave = () => {
    onSave({
      nome:f.nome.trim(), cantina:f.cantina.trim(), tipologia:f.tipologia||null,
      paese:f.paese||null, regione:f.paese==='Altro'?f.regione.trim():(f.regione||null),
      denominazione:f.denominazione.trim(), vitigno:f.vitigno.trim(),
      anno:parseInt(f.anno)||b.anno, quantita:Math.max(1,parseInt(f.quantita)||1),
      valutazione:parseInt(f.valutazione)||null, prezzo:parseInt(f.prezzo)||null,
      prezzo_acquisto:f.prezzo_acquisto?parseFloat(f.prezzo_acquisto):null,
      canale_acquisto:f.canale_acquisto.trim()||null, temp:f.temp.trim()||null,
      note:f.note.trim()||null,
      invecchiamento:f.invecchiamento==='non_so'||f.invecchiamento==='0'?null:parseInt(f.invecchiamento),
      foto_url:f.foto_url||null, info_cantina:f.info_cantina.trim()||null,
      caratteristiche_bottiglia:f.caratteristiche_bottiglia.trim()||null,
      caratteristiche_annata:f.caratteristiche_annata.trim()||null,
    })
  }

  return (
    <div>
      <EditSecBox title="Foto etichetta">
        <div style={{gridColumn:'1/-1'}}><ImageUpload value={f.foto_url} onChange={set('foto_url')} label="" folder="vini" /></div>
        <div style={{gridColumn:'1/-1'}}>
          <button onClick={handleAI} disabled={aiLoading} style={{width:'100%',padding:12,background:aiLoading?'#1a1611':'#C8992A22',color:aiLoading?'#5a4f3f':'#C8992A',border:'1px solid #C8992A44',borderRadius:12,fontSize:14,fontWeight:600,cursor:aiLoading?'default':'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
            {aiLoading?<>⏳ AI sta analizzando…</>:<>✨ Aggiorna con AI</>}
          </button>
        </div>
      </EditSecBox>
      <EditSecBox title="Dati del vino">
        <EditInput label="Nome vino *" value={f.nome} onChange={set('nome')} placeholder="es. Barolo Cannubi" full aiField={ai('nome')} />
        <EditInput label="Cantina / Produttore" value={f.cantina} onChange={set('cantina')} placeholder="es. Ceretto" aiField={ai('cantina')} />
        <EditSelect label="Tipologia" value={f.tipologia} onChange={set('tipologia')} options={[['','—'],...TIPOLOGIE.map(t=>[t,t])]} aiField={ai('tipologia')} />
        <EditInput label="Anno" value={f.anno} onChange={set('anno')} placeholder="2019" type="number" aiField={ai('anno')} />
        <div style={{gridColumn:'1/-1'}}>
          <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:5}}>
            <span style={{fontSize:12,fontWeight:500,color:'#8B7355'}}>Paese</span>
            {ai('paese')&&<span style={{fontSize:10,background:'#1A5FA822',color:'#185FA5',padding:'1px 6px',borderRadius:100,fontWeight:600,border:'1px solid #185FA533'}}>AI</span>}
          </div>
          <select style={{...S.inp,borderColor:ai('paese')?'#185FA5':undefined}} value={f.paese} onChange={e=>setF(p=>({...p,paese:e.target.value,regione:''}))}>
            {PAESI_OPTIONS.map(p=><option key={p} value={p}>{p||'— seleziona —'}</option>)}
          </select>
        </div>
        {f.paese&&f.paese!=='Altro'&&regioniOptions&&(
          <div style={{gridColumn:'1/-1'}}>
            <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:5}}>
              <span style={{fontSize:12,fontWeight:500,color:'#8B7355'}}>Regione</span>
              {ai('regione')&&<span style={{fontSize:10,background:'#1A5FA822',color:'#185FA5',padding:'1px 6px',borderRadius:100,fontWeight:600,border:'1px solid #185FA533'}}>AI</span>}
            </div>
            <select style={{...S.inp,borderColor:ai('regione')?'#185FA5':undefined}} value={f.regione} onChange={e=>set('regione')(e.target.value)}>
              {regioniOptions.map(([v,l])=><option key={v} value={v}>{l}</option>)}
            </select>
          </div>
        )}
        {f.paese==='Altro'&&<EditInput label="Regione" value={f.regione} onChange={set('regione')} placeholder="es. Borgogna" full aiField={ai('regione')}/>}
        <EditTextarea label="Note" value={f.note} onChange={set('note')} placeholder="Appunti liberi..." aiField={ai('note')} />
      </EditSecBox>
      <EditSecBox title="Dati di acquisto">
        <EditInput label="Canale di acquisto" value={f.canale_acquisto} onChange={set('canale_acquisto')} placeholder="es. Enoteca Bianchi" />
        <EditInput label="Prezzo acquisto (€ / bott.)" value={f.prezzo_acquisto} onChange={set('prezzo_acquisto')} placeholder="es. 24.50" type="number" />
        <EditSelect label="Fascia prezzo" value={f.prezzo} onChange={set('prezzo')} options={[['','—'],['1','💶 1'],['2','💶💶 2'],['3','💶💶💶 3'],['4','💶💶💶💶 4'],['5','💶💶💶💶💶 5']]} />
        <EditInput label="Quantità (min. 1)" value={f.quantita} onChange={v=>set('quantita')(String(Math.max(1,parseInt(v)||1)))} type="number" />
      </EditSecBox>
      <EditSecBox title="Arricchimento">
        <EditInput label="Denominazione" value={f.denominazione} onChange={set('denominazione')} placeholder="es. Barolo DOCG" full aiField={ai('denominazione')} />
        <EditInput label="Vitigno" value={f.vitigno} onChange={set('vitigno')} placeholder="es. Nebbiolo" aiField={ai('vitigno')} />
        <EditSelect label="Valutazione annata" value={f.valutazione} onChange={set('valutazione')} options={[['','—'],['1','⭐️ 1'],['2','⭐️⭐️ 2'],['3','⭐️⭐️⭐️ 3'],['4','⭐️⭐️⭐️⭐️ 4'],['5','⭐️⭐️⭐️⭐️⭐️ 5']]} aiField={ai('valutazione')} />
        <EditInput label="Temperatura di servizio" value={f.temp} onChange={set('temp')} placeholder="16-18°C" aiField={ai('temp')} />
        <EditSelect label="Invecchiamento" value={f.invecchiamento} onChange={set('invecchiamento')} options={[['non_so','Non so'],...Array.from({length:30},(_,i)=>[String(i+1),`${i+1} ann${i+1===1?'o':'i'}`])]} full aiField={ai('invecchiamento')} />
        <EditTextarea label="Informazioni sulla cantina" value={f.info_cantina} onChange={set('info_cantina')} placeholder="Storia, filosofia, territorio..." aiField={ai('info_cantina')} />
        <EditTextarea label="Caratteristiche della bottiglia" value={f.caratteristiche_bottiglia} onChange={set('caratteristiche_bottiglia')} placeholder="Profilo organolettico, stile..." aiField={ai('caratteristiche_bottiglia')} />
        <EditTextarea label="Caratteristiche dell'annata" value={f.caratteristiche_annata} onChange={set('caratteristiche_annata')} placeholder="Clima, resa, particolarità..." aiField={ai('caratteristiche_annata')} />
      </EditSecBox>
      <button onClick={handleSave} disabled={saving} style={{width:'100%',padding:14,background:'#C8992A',color:'#0f0b08',border:'none',borderRadius:12,fontSize:15,fontWeight:700,cursor:'pointer',opacity:saving?0.7:1,marginBottom:8,fontFamily:'DM Sans, sans-serif'}}>
        {saving?'Salvataggio...':'Salva modifiche'}
      </button>
    </div>
  )
}

// ─── Alert Da bere presto ─────────────────────────────────────────────────────
function DaBerePresto({ cantina, onDettaglio }) {
  const urgenti = cantina.filter(b=>{const m=getMaturita(b);return m.pct!==null&&m.pct>=108&&m.pct<110})
  if (urgenti.length===0) return null
  return (
    <div style={{margin:'0 0 8px',background:'#1a1205',border:'1px solid #C8992A33',borderLeft:'2px solid #C8992A',borderRadius:8,padding:'10px 14px',display:'flex',alignItems:'center',gap:10}}>
      <div style={{width:6,height:6,borderRadius:'50%',background:'#C8992A',flexShrink:0,boxShadow:'0 0 6px #C8992A'}} />
      <div style={{flex:1}}>
        {urgenti.map(b=>(
          <div key={b.id} onClick={()=>onDettaglio(b)} style={{cursor:'pointer',fontSize:12,color:'#C8992A',lineHeight:1.5}}>
            {b.nome} {b.anno} — da bere presto
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Riga bottiglia con swipe ─────────────────────────────────────────────────
function BottigliaRow({ b, onBevuto, onQty, onDettaglio, onElimina }) {
  const m = getMaturita(b)
  const pct = m.pct !== null ? Math.min(m.pct, 100) : 0
  const tipoColor = TIPO_COLOR[b.tipologia] || '#8B7355'
  const tipoBg = TIPO_BG[b.tipologia] || '#1a1611'
  const tipoSolid = TIPO_SOLID[b.tipologia] || '#3a2a1a'

  const [swipeX, setSwipeX] = useState(0)
  const [swiping, setSwiping] = useState(false)
  const startX = useRef(0)
  const THRESHOLD = 72

  const onTouchStart = e => { startX.current = e.touches[0].clientX; setSwiping(true) }
  const onTouchMove = e => {
    const dx = startX.current - e.touches[0].clientX
    if (dx > 0) setSwipeX(Math.min(dx, THRESHOLD + 20))
  }
  const onTouchEnd = () => {
    setSwiping(false)
    if (swipeX >= THRESHOLD) { onBevuto(b); setSwipeX(0) }
    else setSwipeX(0)
  }

  return (
    <div style={{ position:'relative', overflow:'hidden', borderBottom:'1px solid #1a1611' }}>
      {/* Sfondo swipe — pieno, colore tipologia */}
      <div style={{ position:'absolute', right:0, top:0, bottom:0, width:THRESHOLD, background:tipoSolid, display:'flex', alignItems:'center', justifyContent:'center' }}>
        <div style={{ textAlign:'center' }}>
          <div style={{ fontSize:18 }}>🍷</div>
          <div style={{ fontSize:8, color:'rgba(245,239,224,0.7)', letterSpacing:1, textTransform:'uppercase', marginTop:2 }}>Bevuto</div>
        </div>
      </div>

      {/* Hint gradiente — più visibile */}
      <div style={{ position:'absolute', right:0, top:0, bottom:0, width:56, background:`linear-gradient(to left, ${tipoSolid}cc 0%, ${tipoSolid}55 40%, transparent 100%)`, pointerEvents:'none', zIndex:1 }} />

      {/* Riga principale */}
      <div
        onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}
        style={{ display:'flex', alignItems:'center', gap:12, padding:'13px 14px', background:'#0f0b08', position:'relative', zIndex:2, transform:`translateX(-${swipeX}px)`, transition:swiping?'none':'transform 0.25s ease' }}>

        {/* Left */}
        <div style={{ flex:1, minWidth:0 }}>
          {/* Riga controlli: − bott. + 🍷 🗑️ */}
          <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:5 }}>
            <button onClick={e=>{e.stopPropagation();onQty(b.id,-1)}} disabled={b.quantita<=1}
              style={{ width:22, height:22, borderRadius:'50%', border:'1px solid #2a2318', background:'none', color:b.quantita<=1?'#2a2318':'#8B7355', fontSize:16, cursor:b.quantita<=1?'default':'pointer', display:'flex', alignItems:'center', justifyContent:'center', lineHeight:1, flexShrink:0 }}>−</button>
            <span style={{ fontSize:8, fontWeight:700, letterSpacing:1.5, textTransform:'uppercase', padding:'2px 8px', borderRadius:3, background:tipoBg, color:tipoColor, border:`1px solid ${tipoColor}33`, flexShrink:0 }}>{b.tipologia||'—'}</span>
            <span style={{ fontSize:11, color:'#5a4f3f' }}>{b.quantita} bott.</span>
            <button onClick={e=>{e.stopPropagation();onQty(b.id,1)}}
              style={{ width:22, height:22, borderRadius:'50%', border:'1px solid #2a2318', background:'none', color:'#8B7355', fontSize:16, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', lineHeight:1, flexShrink:0 }}>+</button>
            <div style={{ marginLeft:'auto', display:'flex', gap:4 }}>
              {/* Bevuto — icona visibile su desktop */}
              <button onClick={e=>{e.stopPropagation();onBevuto(b)}}
                style={{ width:22, height:22, borderRadius:'50%', border:`1px solid ${tipoColor}44`, background:tipoBg, color:tipoColor, fontSize:11, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }} title="Bevuto">🍷</button>
              <button onClick={e=>{e.stopPropagation();onElimina(b)}}
                style={{ width:22, height:22, borderRadius:'50%', border:'1px solid #2a2318', background:'none', color:'#5a4f3f', fontSize:11, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>🗑️</button>
            </div>
          </div>
          <div onClick={() => onDettaglio(b)} style={{ cursor:'pointer' }}>
            <div style={{ fontFamily:'Cormorant Garamond, serif', fontSize:17, fontWeight:400, color:'#F5EFE0', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', marginBottom:2, lineHeight:1.2 }}>{b.nome}</div>
            <div style={{ fontSize:11, color:'#5a4f3f', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{b.cantina}</div>
          </div>
        </div>

        {/* Right — cliccabile per dettaglio */}
        <div style={{ flexShrink:0, textAlign:'right', minWidth:70 }} onClick={() => onDettaglio(b)}>
          <div style={{ fontFamily:'Cormorant Garamond, serif', fontSize:22, fontWeight:300, color:'#8B7355', lineHeight:1, marginBottom:8 }}>{b.anno||'—'}</div>
          <div style={{ width:70, height:5, background:'#1e1a16', borderRadius:3, overflow:'hidden', marginBottom:5 }}>
            <div style={{ height:'100%', width:`${pct}%`, background:matColor(m.cls), borderRadius:3 }} />
          </div>
          <div style={{ display:'flex', justifyContent:'flex-end', alignItems:'center', gap:4 }}>
            <div style={{ width:5, height:5, borderRadius:'50%', background:matColor(m.cls) }} />
            <span style={{ fontSize:12, fontWeight:600, color:matColor(m.cls) }}>{m.pct!==null?`${m.pct}%`:m.label}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── COMPONENTE PRINCIPALE ────────────────────────────────────────────────────
export default function Libreria({ cantina, onBevuto, onQty, onElimina, onUpdate, onDettaglio }) {
  const [q, setQ] = useState('')
  const [confirmB, setConfirmB] = useState(null)

  const filtered = useMemo(() =>
    cantina.filter(b=>!q||(b.nome+(b.cantina||'')+(b.vitigno||'')).toLowerCase().includes(q.toLowerCase())),
    [cantina,q]
  )

  // Conteggio bottiglie totali (unità fisiche) per la barra di ricerca
  const totFiltered = filtered.reduce((s,b)=>s+(b.quantita||0), 0)

  const gruppi = useMemo(() => {
    const g={'Oltre il picco':[],'Al picco':[],'In evoluzione':[],'Da definire':[]}
    filtered.forEach(b=>{const m=getMaturita(b);g[m.label].push({...b,_pct:m.pct})})
    Object.keys(g).forEach(k=>{
      g[k].sort((a,b)=>{
        if(a._pct===null&&b._pct===null)return 0
        if(a._pct===null)return 1;if(b._pct===null)return -1
        return b._pct-a._pct
      })
    })
    return g
  }, [filtered])

  const handleConfirmElimina = async () => { await onElimina(confirmB); setConfirmB(null) }

  return (
    <>
      {/* Search */}
      <div style={{ position:'sticky', top:0, background:'#0f0b08', paddingBottom:10, paddingTop:16, zIndex:10, borderBottom:'1px solid #1e1a16' }}>
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="🔍  Cerca nome, cantina, vitigno..." style={{ ...S.inp, width:'100%' }} />
        <div style={{ fontSize:11, color:'#5a4f3f', marginTop:8, letterSpacing:0.5 }}>{totFiltered} bottigli{totFiltered===1?'a':'e'} · {filtered.length} etichett{filtered.length===1?'a':'e'}</div>
      </div>

      {/* Alert da bere presto */}
      <DaBerePresto cantina={cantina} onDettaglio={onDettaglio} />

      {/* Gruppi — con separazione visiva netta */}
      {GRUPPI_ORDINE.map((gruppo, idx)=>{
        const bott=gruppi[gruppo]
        if(bott.length===0)return null
        const meta=GRUPPI_META[gruppo]
        const colore=matColor(meta.cls)
        return (
          <div key={gruppo} style={{ marginTop: idx > 0 ? 0 : 0 }}>
            {/* Header gruppo — banda colorata */}
            <div style={{ background:`${colore}12`, borderTop:`2px solid ${colore}44`, borderBottom:`1px solid ${colore}22`, padding:'10px 14px', display:'flex', alignItems:'center', gap:8 }}>
              <div style={{ width:8, height:8, borderRadius:'50%', background:colore, flexShrink:0, boxShadow:`0 0 6px ${colore}88` }} />
              <span style={{ fontSize:11, fontWeight:700, letterSpacing:2, textTransform:'uppercase', color:colore }}>{gruppo}</span>
              <span style={{ fontSize:11, color:'#5a4f3f', marginLeft:'auto' }}>{meta.desc} · {bott.length} {bott.length===1?'etichetta':'etichette'}</span>
            </div>
            {bott.map(b=>(
              <BottigliaRow key={b.id} b={b} onBevuto={onBevuto} onQty={onQty} onDettaglio={onDettaglio} onElimina={setConfirmB} />
            ))}
          </div>
        )
      })}

      {filtered.length===0&&(
        <div style={{ textAlign:'center', padding:'64px 20px', color:'#5a4f3f' }}>
          <div style={{ fontFamily:'Cormorant Garamond, serif', fontSize:40, marginBottom:12, fontStyle:'italic' }}>🍾</div>
          <div style={{ fontFamily:'Cormorant Garamond, serif', fontSize:18, fontWeight:300, fontStyle:'italic' }}>Nessuna bottiglia trovata</div>
        </div>
      )}

      <ConfirmDialog open={!!confirmB} nome={confirmB?.nome||''} onConfirm={handleConfirmElimina} onCancel={()=>setConfirmB(null)} />
    </>
  )
}

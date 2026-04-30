import { useState, useMemo } from 'react'
import { TIPOLOGIE } from './AspiForm'
import { PAESI_REGIONI, PAESI_OPTIONS } from './dati'
import ImageUpload from './ImageUpload'

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

export const matColor = cls => ({ green:'#2D6A4F', amber:'#C77B13', red:'#9B2335', blue:'#1A5FA8' })[cls] || '#7A6E65'

const badgeStyle = t => ({
  Rosso:{bg:'#FAECE7',color:'#993C1D'}, Bianco:{bg:'#FAEEDA',color:'#854F0B'},
  Rosato:{bg:'#FBEAF0',color:'#993556'}, Orange:{bg:'#FDE8D0',color:'#9A4E0A'},
  Bollicine:{bg:'#E6F1FB',color:'#185FA5'}, Dolce:{bg:'#FDF4DC',color:'#876200'},
  Fortificato:{bg:'#EDE6F5',color:'#5B2D8E'},
}[t] || {bg:'#F1EFE8',color:'#555'})

const stars = n => '⭐️'.repeat(n || 0)
const money = n => '💶'.repeat(n || 0)

const GRUPPI_ORDINE = ['Oltre il picco','Al picco','In evoluzione','Da definire']
const GRUPPI_LABEL = {
  'Oltre il picco':{emoji:'🔴',desc:'Da bere subito'},
  'Al picco':{emoji:'🟡',desc:'Momento ideale'},
  'In evoluzione':{emoji:'🟢',desc:'Ancora in affinamento'},
  'Da definire':{emoji:'🔵',desc:'Invecchiamento non specificato'},
}

const S = {
  inp: { width:'100%', padding:'11px 14px', border:'1.5px solid #E2DDD6', borderRadius:10, fontSize:15, background:'#fff', color:'#1C1410', WebkitAppearance:'none', appearance:'none' },
  card: { background:'#fff', border:'1px solid #E2DDD6', borderRadius:16, padding:16 },
}

function ConfirmDialog({ open, nome, onConfirm, onCancel }) {
  if (!open) return null
  return (
    <div style={{ position:'fixed', inset:0, zIndex:400, display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
      <div onClick={onCancel} style={{ position:'absolute', inset:0, background:'rgba(28,20,16,0.6)', backdropFilter:'blur(2px)' }} />
      <div style={{ position:'relative', background:'#fff', borderRadius:16, padding:24, width:'100%', maxWidth:340, textAlign:'center' }}>
        <div style={{ fontSize:32, marginBottom:12 }}>🗑️</div>
        <div style={{ fontSize:16, fontWeight:600, color:'#1C1410', marginBottom:8 }}>Elimina bottiglia</div>
        <div style={{ fontSize:14, color:'#7A6E65', marginBottom:24, lineHeight:1.5 }}>Vuoi eliminare <strong>"{nome}"</strong> dalla cantina? L'operazione non è reversibile.</div>
        <div style={{ display:'flex', gap:10 }}>
          <button onClick={onCancel} style={{ flex:1, padding:12, background:'#F4F1EC', color:'#1C1410', border:'none', borderRadius:10, fontSize:14, fontWeight:600, cursor:'pointer' }}>Annulla</button>
          <button onClick={onConfirm} style={{ flex:1, padding:12, background:'#9B2335', color:'#fff', border:'none', borderRadius:10, fontSize:14, fontWeight:600, cursor:'pointer' }}>Elimina</button>
        </div>
      </div>
    </div>
  )
}

export function DettaglioBottiglia({ b }) {
  const m = getMaturita(b)
  const pct = m.pct !== null ? m.pct : null
  const bs = badgeStyle(b.tipologia)
  const Row = ({ label, value }) => {
    if (!value && value !== 0) return null
    return (
      <div style={{ display:'flex', gap:12, padding:'9px 0', borderBottom:'1px solid #F0ECE5' }}>
        <span style={{ fontSize:12, color:'#7A6E65', minWidth:130, flexShrink:0 }}>{label}</span>
        <span style={{ fontSize:14, color:'#1C1410', lineHeight:1.4, flex:1 }}>{value}</span>
      </div>
    )
  }
  const SecBox = ({ title, children }) => (
    <div style={{ background:'#fff', border:'1px solid #E2DDD6', borderRadius:14, padding:16, marginBottom:12 }}>
      <div style={{ fontSize:10, fontWeight:700, color:'#7B1E2E', textTransform:'uppercase', letterSpacing:1.2, marginBottom:12, paddingBottom:8, borderBottom:'1px solid #F0ECE5' }}>{title}</div>
      {children}
    </div>
  )
  return (
    <div>
      {b.foto_url && <img src={b.foto_url} alt={b.nome} style={{ width:'100%', maxHeight:260, objectFit:'cover', borderRadius:14, marginBottom:14, border:'1px solid #E2DDD6' }} />}
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
        <span style={{ fontSize:11, fontWeight:600, letterSpacing:0.8, textTransform:'uppercase', padding:'4px 12px', borderRadius:100, background:bs.bg, color:bs.color }}>{b.tipologia || '—'}</span>
        <div style={{ display:'flex', alignItems:'center', gap:5 }}>
          <div style={{ width:8, height:8, borderRadius:'50%', background:matColor(m.cls) }} />
          <span style={{ fontSize:12, fontWeight:600, color:matColor(m.cls) }}>{m.label}</span>
          {pct !== null && <span style={{ fontSize:12, color:'#B0A89E' }}>({pct}%)</span>}
        </div>
      </div>
      {pct !== null && (
        <div style={{ height:5, borderRadius:3, background:'#E2DDD6', overflow:'hidden', marginBottom:16 }}>
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

function EditInput({ label, value, onChange, placeholder, type, full, aiField }) {
  return (
    <div style={full ? { gridColumn:'1/-1' } : {}}>
      <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:5 }}>
        <span style={{ fontSize:12, fontWeight:500, color:'#7A6E65' }}>{label}</span>
        {aiField && <span style={{ fontSize:10, background:'#E6F1FB', color:'#185FA5', padding:'1px 6px', borderRadius:100, fontWeight:600 }}>AI</span>}
      </div>
      <input style={{ ...S.inp, borderColor:aiField ? '#185FA5' : undefined }}
        value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder || ''} type={type || 'text'} />
    </div>
  )
}
function EditSelect({ label, value, onChange, options, full, aiField }) {
  return (
    <div style={full ? { gridColumn:'1/-1' } : {}}>
      <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:5 }}>
        <span style={{ fontSize:12, fontWeight:500, color:'#7A6E65' }}>{label}</span>
        {aiField && <span style={{ fontSize:10, background:'#E6F1FB', color:'#185FA5', padding:'1px 6px', borderRadius:100, fontWeight:600 }}>AI</span>}
      </div>
      <select style={{ ...S.inp, borderColor:aiField ? '#185FA5' : undefined }} value={value} onChange={e => onChange(e.target.value)}>
        {options.map(([v,l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    </div>
  )
}
function EditTextarea({ label, value, onChange, placeholder, aiField }) {
  return (
    <div style={{ gridColumn:'1/-1' }}>
      <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:5 }}>
        <span style={{ fontSize:12, fontWeight:500, color:'#7A6E65' }}>{label}</span>
        {aiField && <span style={{ fontSize:10, background:'#E6F1FB', color:'#185FA5', padding:'1px 6px', borderRadius:100, fontWeight:600 }}>AI</span>}
      </div>
      <textarea style={{ ...S.inp, minHeight:70, resize:'vertical', lineHeight:1.5 }}
        value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder || ''} />
    </div>
  )
}
function EditSecBox({ title, children }) {
  return (
    <div style={{ background:'#fff', border:'1px solid #E2DDD6', borderRadius:14, padding:16, marginBottom:14 }}>
      <div style={{ fontSize:10, fontWeight:700, color:'#7B1E2E', textTransform:'uppercase', letterSpacing:1.2, marginBottom:14, paddingBottom:8, borderBottom:'1px solid #F0ECE5' }}>{title}</div>
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
  const set = k => v => { setAiFields(prev => { const n=new Set(prev); n.delete(k); return n }); setF(p => ({...p,[k]:v})) }
  const regioniOptions = f.paese && PAESI_REGIONI[f.paese] ? [['','— seleziona —'],...PAESI_REGIONI[f.paese].map(r=>[r,r])] : null
  const ai = k => aiFields.has(k)

  const handleAI = async () => {
    setAiLoading(true)
    try {
      const SYSTEM = 'Sei un esperto enologo. Analizza le informazioni sul vino e restituisci SOLO JSON valido senza markdown. Compila solo i campi di cui sei 100% certo. Lascia stringa vuota se non sei certo. Valutazione annata: 1-5 (0 se incerto). Invecchiamento: numero anni (0 se incerto). {"nome":"","cantina":"","tipologia":"","anno":"","paese":"","regione":"","denominazione":"","vitigno":"","valutazione":"","temp":"","invecchiamento":"","info_cantina":"","caratteristiche_bottiglia":"","caratteristiche_annata":"","note":""}'
      const userContent = []
      if (f.foto_url) {
        const imgRes = await fetch(f.foto_url)
        const blob = await imgRes.blob()
        const base64 = await new Promise(res => { const r=new FileReader(); r.onload=()=>res(r.result.split(',')[1]); r.readAsDataURL(blob) })
        userContent.push({ type:'image', source:{ type:'base64', media_type:blob.type||'image/jpeg', data:base64 } })
      }
      const testo = [f.nome,f.cantina,f.anno,f.paese,f.regione,f.vitigno].filter(Boolean).join(', ')
      userContent.push({ type:'text', text:testo ? `Vino: ${testo}` : "Analizza l'etichetta." })
      const result = await callAIModifica({ model:'claude-sonnet-4-6', max_tokens:800, system:SYSTEM, messages:[{role:'user',content:userContent}] })
      const newAiFields = new Set(); const updates = {}
      const campi = ['nome','cantina','tipologia','anno','paese','regione','denominazione','vitigno','valutazione','temp','invecchiamento','info_cantina','caratteristiche_bottiglia','caratteristiche_annata','note']
      campi.forEach(k => { const v=result[k]; if (v && String(v)!=='0' && String(v)!=='') { updates[k]=String(v); newAiFields.add(k) } })
      setF(p=>({...p,...updates})); setAiFields(newAiFields)
    } catch(e) { console.error(e) } finally { setAiLoading(false) }
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
        <div style={{ gridColumn:'1/-1' }}><ImageUpload value={f.foto_url} onChange={set('foto_url')} label="" folder="vini" /></div>
        <div style={{ gridColumn:'1/-1' }}>
          <button onClick={handleAI} disabled={aiLoading}
            style={{ width:'100%', padding:12, background:aiLoading?'#F4F1EC':'#1C1410', color:aiLoading?'#7A6E65':'#fff', border:'none', borderRadius:12, fontSize:14, fontWeight:600, cursor:aiLoading?'default':'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
            {aiLoading ? <>⏳ AI sta analizzando…</> : <>✨ Aggiorna con AI</>}
          </button>
        </div>
      </EditSecBox>

      <EditSecBox title="Dati del vino">
        <EditInput label="Nome vino *" value={f.nome} onChange={set('nome')} placeholder="es. Barolo Cannubi" full aiField={ai('nome')} />
        <EditInput label="Cantina / Produttore" value={f.cantina} onChange={set('cantina')} placeholder="es. Ceretto" aiField={ai('cantina')} />
        <EditSelect label="Tipologia" value={f.tipologia} onChange={set('tipologia')} options={[['','—'],...TIPOLOGIE.map(t=>[t,t])]} aiField={ai('tipologia')} />
        <EditInput label="Anno" value={f.anno} onChange={set('anno')} placeholder="2019" type="number" aiField={ai('anno')} />
        <div style={{ gridColumn:'1/-1' }}>
          <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:5 }}>
            <span style={{ fontSize:12, fontWeight:500, color:'#7A6E65' }}>Paese</span>
            {ai('paese') && <span style={{ fontSize:10, background:'#E6F1FB', color:'#185FA5', padding:'1px 6px', borderRadius:100, fontWeight:600 }}>AI</span>}
          </div>
          <select style={{ ...S.inp, borderColor:ai('paese')?'#185FA5':undefined }} value={f.paese} onChange={e=>setF(p=>({...p,paese:e.target.value,regione:''}))}>
            {PAESI_OPTIONS.map(p=><option key={p} value={p}>{p||'— seleziona —'}</option>)}
          </select>
        </div>
        {f.paese && f.paese!=='Altro' && regioniOptions && (
          <div style={{ gridColumn:'1/-1' }}>
            <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:5 }}>
              <span style={{ fontSize:12, fontWeight:500, color:'#7A6E65' }}>Regione</span>
              {ai('regione') && <span style={{ fontSize:10, background:'#E6F1FB', color:'#185FA5', padding:'1px 6px', borderRadius:100, fontWeight:600 }}>AI</span>}
            </div>
            <select style={{ ...S.inp, borderColor:ai('regione')?'#185FA5':undefined }} value={f.regione} onChange={e=>set('regione')(e.target.value)}>
              {regioniOptions.map(([v,l])=><option key={v} value={v}>{l}</option>)}
            </select>
          </div>
        )}
        {f.paese==='Altro' && <EditInput label="Regione" value={f.regione} onChange={set('regione')} placeholder="es. Borgogna" full aiField={ai('regione')} />}
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

      <button onClick={handleSave} disabled={saving}
        style={{ width:'100%', padding:14, background:'#7B1E2E', color:'#fff', border:'none', borderRadius:12, fontSize:15, fontWeight:600, cursor:'pointer', opacity:saving?0.7:1, marginBottom:8 }}>
        {saving ? 'Salvataggio...' : 'Salva modifiche'}
      </button>
    </div>
  )
}

function DaBerePresto({ cantina, onDettaglio }) {
  const urgenti = cantina.filter(b => { const m=getMaturita(b); return m.pct!==null && m.pct>=108 && m.pct<110 })
  if (urgenti.length===0) return null
  return (
    <div style={{ background:'#FEF3E2', border:'1.5px solid #F6A623', borderRadius:14, padding:14, marginBottom:20 }}>
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
        <span style={{ fontSize:18 }}>⚠️</span>
        <span style={{ fontSize:13, fontWeight:700, color:'#854F0B' }}>Da bere presto — {urgenti.length} {urgenti.length===1?'bottiglia':'bottiglie'}</span>
      </div>
      {urgenti.map(b => (
        <div key={b.id} onClick={()=>onDettaglio(b)}
          style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 10px', background:'#fff', borderRadius:10, marginBottom:6, cursor:'pointer', border:'1px solid #F6A62333' }}>
          <div>
            <div style={{ fontSize:13, fontWeight:600, color:'#1C1410' }}>{b.nome}</div>
            <div style={{ fontSize:11, color:'#7A6E65' }}>{b.cantina} · {b.anno}</div>
          </div>
          <div style={{ textAlign:'right', flexShrink:0 }}>
            <div style={{ fontSize:12, fontWeight:700, color:'#C77B13' }}>{b.quantita} bott.</div>
            <div style={{ fontSize:10, color:'#B0A89E' }}>{getMaturita(b).pct}% del potenziale</div>
          </div>
        </div>
      ))}
    </div>
  )
}

function BottigliaCard({ b, onBevuto, onQty, onDettaglio, onElimina }) {
  const m = getMaturita(b)
  const pct = m.pct!==null ? Math.min(m.pct,100) : 0
  const bs = badgeStyle(b.tipologia)
  return (
    <div style={{ ...S.card, display:'flex', flexDirection:'column' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
        <span style={{ fontSize:10, fontWeight:600, letterSpacing:1, textTransform:'uppercase', padding:'3px 9px', borderRadius:100, background:bs.bg, color:bs.color }}>{b.tipologia||'—'}</span>
        <button onClick={()=>onElimina(b)} style={{ width:28, height:28, borderRadius:'50%', border:'none', background:'#FFF0F0', cursor:'pointer', fontSize:13, display:'flex', alignItems:'center', justifyContent:'center' }}>🗑️</button>
      </div>
      <div onClick={()=>onDettaglio(b)} style={{ cursor:'pointer', flex:1 }}>
        <div style={{ fontFamily:'Playfair Display, serif', fontSize:15, fontWeight:600, lineHeight:1.3, marginBottom:3 }}>{b.nome}</div>
        <div style={{ fontSize:12, color:'#7A6E65', marginBottom:10 }}>{b.cantina||'—'}</div>
        <div style={{ fontSize:16, fontWeight:600, marginBottom:8 }}>{b.anno||'—'}</div>
        {b.valutazione>0 && <div style={{ fontSize:12, color:'#7A6E65', marginBottom:4 }}><span style={{ fontWeight:500 }}>Annata: </span>{'⭐️'.repeat(b.valutazione)}</div>}
        {b.prezzo>0 && <div style={{ fontSize:12, color:'#7A6E65', marginBottom:10 }}><span style={{ fontWeight:500 }}>Prezzo: </span>{'💶'.repeat(b.prezzo)}</div>}
      </div>
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
        <button onClick={()=>onQty(b.id,-1)} disabled={b.quantita<=1} style={{ width:32, height:32, borderRadius:'50%', border:'1.5px solid #E2DDD6', background:'none', fontSize:18, cursor:b.quantita<=1?'default':'pointer', display:'flex', alignItems:'center', justifyContent:'center', opacity:b.quantita<=1?0.3:1 }}>−</button>
        <span style={{ fontSize:15, fontWeight:600, minWidth:20, textAlign:'center' }}>{b.quantita}</span>
        <button onClick={()=>onQty(b.id,1)} style={{ width:32, height:32, borderRadius:'50%', border:'1.5px solid #E2DDD6', background:'none', fontSize:18, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>+</button>
        <span style={{ fontSize:12, color:'#B0A89E' }}>bott.</span>
      </div>
      <div style={{ height:5, borderRadius:3, background:'#F0ECE5', overflow:'hidden', marginBottom:6 }}>
        <div style={{ height:'100%', width:`${pct}%`, background:matColor(m.cls), borderRadius:3 }} />
      </div>
      <div style={{ display:'flex', alignItems:'center', gap:5, marginBottom:10 }}>
        <div style={{ width:8, height:8, borderRadius:'50%', background:matColor(m.cls), flexShrink:0 }} />
        <span style={{ fontSize:11, fontWeight:500, color:matColor(m.cls) }}>{m.label}</span>
        {m.pct!==null && <span style={{ fontSize:11, color:'#B0A89E', marginLeft:2 }}>({m.pct}%)</span>}
      </div>
      <button onClick={()=>onBevuto(b)} style={{ width:'100%', padding:'9px 0', border:'none', borderRadius:10, background:'#7B1E2E', color:'#fff', fontSize:13, fontWeight:600, cursor:'pointer' }}>Bevuto</button>
    </div>
  )
}

export default function Libreria({ cantina, onBevuto, onQty, onElimina, onUpdate, onDettaglio }) {
  const [q, setQ] = useState('')
  const [tipo, setTipo] = useState('')
  const [confirmB, setConfirmB] = useState(null)

  const filtered = useMemo(() =>
    cantina
      .filter(b => !q || (b.nome+(b.cantina||'')+(b.vitigno||'')).toLowerCase().includes(q.toLowerCase()))
      .filter(b => !tipo || b.tipologia===tipo),
    [cantina,q,tipo]
  )

  const gruppi = useMemo(() => {
    const g = {'Oltre il picco':[],'Al picco':[],'In evoluzione':[],'Da definire':[]}
    filtered.forEach(b => { const m=getMaturita(b); g[m.label].push({...b,_pct:m.pct}) })
    Object.keys(g).forEach(k => {
      g[k].sort((a,b) => {
        if (a._pct===null && b._pct===null) return 0
        if (a._pct===null) return 1
        if (b._pct===null) return -1
        return b._pct-a._pct
      })
    })
    return g
  }, [filtered])

  const handleConfirmElimina = async () => { await onElimina(confirmB); setConfirmB(null) }

  return (
    <>
      <div style={{ position:'sticky', top:0, background:'#F4F1EC', paddingBottom:12, paddingTop:16, zIndex:10 }}>
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="🔍  Cerca nome, cantina, vitigno..." style={{ ...S.inp, marginBottom:10 }} />
        <div style={{ display:'flex', gap:8, overflowX:'auto', paddingBottom:2 }}>
          {['',...TIPOLOGIE].map(t => (
            <button key={t} onClick={()=>setTipo(t)} style={{ flexShrink:0, padding:'6px 14px', borderRadius:100, border:'1.5px solid', borderColor:tipo===t?'#7B1E2E':'#E2DDD6', background:tipo===t?'#7B1E2E':'#fff', color:tipo===t?'#fff':'#7A6E65', fontSize:13, fontWeight:500, cursor:'pointer' }}>
              {t||'Tutti'}
            </button>
          ))}
        </div>
        <div style={{ fontSize:12, color:'#B0A89E', marginTop:8 }}>{filtered.length} bottigli{filtered.length===1?'a':'e'}</div>
      </div>

      <DaBerePresto cantina={cantina} onDettaglio={onDettaglio} />

      {GRUPPI_ORDINE.map(gruppo => {
        const bott = gruppi[gruppo]
        if (bott.length===0) return null
        const info = GRUPPI_LABEL[gruppo]
        const colore = matColor({'Oltre il picco':'red','Al picco':'amber','In evoluzione':'green','Da definire':'blue'}[gruppo])
        return (
          <div key={gruppo} style={{ marginBottom:24 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12, paddingBottom:8, borderBottom:`2px solid ${colore}22` }}>
              <span style={{ fontSize:16 }}>{info.emoji}</span>
              <div>
                <div style={{ fontSize:13, fontWeight:700, color:colore }}>{gruppo}</div>
                <div style={{ fontSize:11, color:'#B0A89E' }}>{info.desc} · {bott.length} {bott.length===1?'bottiglia':'bottiglie'}</div>
              </div>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(160px, 1fr))', gap:12 }}>
              {bott.map(b => (
                <BottigliaCard key={b.id} b={b} onBevuto={onBevuto} onQty={onQty} onDettaglio={onDettaglio} onElimina={setConfirmB} />
              ))}
            </div>
          </div>
        )
      })}

      {filtered.length===0 && (
        <div style={{ textAlign:'center', padding:'48px 20px', color:'#B0A89E' }}>
          <div style={{ fontSize:40, marginBottom:10 }}>🍾</div>
          <div style={{ fontSize:15, fontWeight:500 }}>Nessuna bottiglia trovata</div>
        </div>
      )}

      <ConfirmDialog open={!!confirmB} nome={confirmB?.nome||''} onConfirm={handleConfirmElimina} onCancel={()=>setConfirmB(null)} />
    </>
  )
}

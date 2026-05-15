import { useState, useMemo, useRef, useEffect } from 'react'
import { TIPOLOGIE } from './AspiForm'
import { PAESI_REGIONI, PAESI_OPTIONS } from './dati'
import ImageUpload from './ImageUpload'
import { useT } from './useT'
import { t, tPaese, getLingua } from './i18n'

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getMaturita(b) {
  if (b.invecchiamento === null || b.invecchiamento === undefined) return { label: t('lib.da_definire'), cls: 'blue', pct: null }
  if (!b.anno) return { label: t('lib.da_definire'), cls: 'blue', pct: null }
  const eta = new Date().getFullYear() - b.anno
  if (eta < 0) return { label: t('lib.da_definire'), cls: 'blue', pct: null }
  const r = eta / b.invecchiamento
  const pct = Math.round(r * 100)
  if (r > 1.1)  return { label: t('lib.oltre_picco'), cls: 'red',   pct }
  if (r >= 0.9) return { label: t('lib.al_picco'),    cls: 'amber', pct }
  return { label: t('lib.in_evoluzione'), cls: 'green', pct }
}

// Mappa cls -> chiave italiana fissa (per raggruppamento stabile)
const CLS_TO_KEY = { red: 'Oltre il picco', amber: 'Al picco', green: 'In evoluzione', blue: 'Da definire' }

export const matColor = cls => ({ green:'#2D6A4F', amber:'#C4614A', red:'#9B2335', blue:'#1A5FA8' })[cls] || '#9A8070'

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

const getGruppiMeta = () => ({
  'Oltre il picco': { emoji:'🔴', desc: t('lib.da_bere_subito'),      cls:'red'   },
  'Al picco':       { emoji:'🟡', desc: t('lib.momento_ideale'),      cls:'amber' },
  'In evoluzione':  { emoji:'🟢', desc: t('lib.in_affinamento'),      cls:'green' },
  'Da definire':    { emoji:'🔵', desc: t('lib.potenziale_mancante'), cls:'blue'  },
})

export const GRUPPI_ORDINE = ['Oltre il picco','Al picco','In evoluzione','Da definire']

const S = {
  inp: { width:'100%', padding:'11px 14px', border:'1.5px solid #E2DDD6', borderRadius:10, fontSize:15, background:'#fff', color:'#1C1410', WebkitAppearance:'none', appearance:'none' },
}

// ─── Confirm dialog ───────────────────────────────────────────────────────────
function ConfirmDialog({ open, nome, onConfirm, onCancel }) {
  const T = useT()
  if (!open) return null
  return (
    <div style={{ position:'fixed', inset:0, zIndex:400, display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
      <div onClick={onCancel} style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.8)', backdropFilter:'blur(4px)' }} />
      <div style={{ position:'relative', background:'#F5EDE0', borderRadius:16, padding:24, width:'100%', maxWidth:340, textAlign:'center', border:'1px solid #D6CEBE' }}>
        <div style={{ fontSize:32, marginBottom:12 }}>🗑️</div>
        <div style={{ fontFamily:'Cormorant Garamond, serif', fontSize:18, fontWeight:400, color:'#2C1A0E', marginBottom:8 }}>{T('lib.elimina_titolo')}</div>
        <div style={{ fontSize:13, color:'#B8956A', marginBottom:24, lineHeight:1.6 }}>{T('lib.elimina_testo').replace('questa bottiglia', `"${nome}"`)}</div>
        <div style={{ display:'flex', gap:10 }}>
          <button onClick={onCancel} style={{ flex:1, padding:12, background:'#EAE2D6', color:'#B8956A', border:'1px solid #D6CEBE', borderRadius:10, fontSize:14, cursor:'pointer' }}>{T('lib.annulla')}</button>
          <button onClick={onConfirm} style={{ flex:1, padding:12, background:'#9B2335', color:'#2C1A0E', border:'none', borderRadius:10, fontSize:14, fontWeight:600, cursor:'pointer' }}>{T('lib.elimina')}</button>
        </div>
      </div>
    </div>
  )
}

// ─── DettaglioBottiglia ───────────────────────────────────────────────────────
export function DettaglioBottiglia({ b }) {
  const T = useT()
  const m = getMaturita(b)
  const pct = m.pct !== null ? m.pct : null

  const Row = ({ label, value }) => {
    if (!value && value !== 0) return null
    return (
      <div style={{ display:'flex', gap:12, padding:'9px 0', borderBottom:'1px solid #E0D8CC' }}>
        <span style={{ fontSize:12, color:'#9A8070', minWidth:130, flexShrink:0 }}>{label}</span>
        <span style={{ fontSize:14, color:'#2C1A0E', lineHeight:1.4, flex:1 }}>{value}</span>
      </div>
    )
  }

  const SecBox = ({ title, children }) => (
    <div style={{ background:'#F5EDE0', border:'1px solid #E0D8CC', borderRadius:14, padding:16, marginBottom:12 }}>
      <div style={{ fontSize:10, fontWeight:700, color:'#C4614A', textTransform:'uppercase', letterSpacing:1.2, marginBottom:12, paddingBottom:8, borderBottom:'1px solid #E0D8CC' }}>{title}</div>
      {children}
    </div>
  )

  return (
    <div>
      {b.foto_url && <img src={b.foto_url} alt={b.nome} style={{ width:'100%', maxHeight:260, objectFit:'cover', borderRadius:14, marginBottom:14, border:'1px solid #E0D8CC' }} />}
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
        <span style={{ fontSize:11, fontWeight:600, letterSpacing:0.8, textTransform:'uppercase', padding:'4px 12px', borderRadius:100, background: TIPO_BG[b.tipologia]||'#EAE2D6', color: TIPO_COLOR[b.tipologia]||'#B8956A', border:`1px solid ${TIPO_COLOR[b.tipologia]||'#9A8070'}33` }}>
          {b.tipologia ? T(`tipo.${b.tipologia}`) : '—'}
        </span>
        <div style={{ display:'flex', alignItems:'center', gap:5 }}>
          <div style={{ width:8, height:8, borderRadius:'50%', background:matColor(m.cls) }} />
          <span style={{ fontSize:12, fontWeight:600, color:matColor(m.cls) }}>{m.label}</span>
          {pct !== null && <span style={{ fontSize:12, color:'#9A8070' }}>({pct}%)</span>}
        </div>
      </div>
      {pct !== null && (
        <div style={{ height:5, borderRadius:3, background:'#E0D8CC', overflow:'hidden', marginBottom:16 }}>
          <div style={{ height:'100%', width:`${Math.min(pct,100)}%`, background:matColor(m.cls), borderRadius:3 }} />
        </div>
      )}
      <SecBox title={T('form.dati_vino')}>
        <Row label={T('det.nome')} value={b.nome} />
        <Row label={T('det.cantina')} value={b.cantina} />
        <Row label={T('form.anno')} value={b.anno} />
        <Row label={T('form.paese')} value={tPaese(b.paese)} />
        <Row label={T('form.regione')} value={b.regione} />
        <Row label={T('form.vitigno')} value={b.vitigno} />
        {b.info_cantina && <Row label={T('det.info_cantina')} value={b.info_cantina} />}
        {b.caratteristiche_bottiglia && <Row label={T('det.caratteristiche')} value={b.caratteristiche_bottiglia} />}
        {b.caratteristiche_annata && <Row label={T('det.annata')} value={b.caratteristiche_annata} />}
      </SecBox>
      <SecBox title={T('det.consumo')}>
        <Row label={T('form.valutazione')} value={b.valutazione ? stars(b.valutazione) : null} />
        <Row label={T('form.fascia_prezzo')} value={b.prezzo ? money(b.prezzo) : null} />
        <Row label={T('det.prezzo_acquisto')} value={b.prezzo_acquisto ? `€ ${Number(b.prezzo_acquisto).toFixed(2)} / ${t('lib.bott')}` : null} />
        <Row label={T('det.temperatura')} value={b.temp} />
        <Row label={T('form.invecchiamento')} value={b.invecchiamento ? `${b.invecchiamento} ${t('form.anni')}` : null} />
        <Row label={T('form.note')} value={b.note} />
      </SecBox>
    </div>
  )
}

// ─── Componenti form modifica ─────────────────────────────────────────────────
function EditInput({ label, value, onChange, placeholder, type, full, aiField }) {
  const T = useT()
  return (
    <div style={full ? { gridColumn:'1/-1' } : {}}>
      <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:5 }}>
        <span style={{ fontSize:12, fontWeight:500, color:'#B8956A' }}>{label}</span>
        {aiField && <span style={{ fontSize:10, background:'#1A5FA822', color:'#185FA5', padding:'1px 6px', borderRadius:100, fontWeight:600, border:'1px solid #185FA533' }}>AI</span>}
      </div>
      <input style={{ ...S.inp, borderColor:aiField?'#185FA5':undefined }} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder||''} type={type||'text'} />
    </div>
  )
}
function EditSelect({ label, value, onChange, options, full, aiField }) {
  const T = useT()
  return (
    <div style={full ? { gridColumn:'1/-1' } : {}}>
      <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:5 }}>
        <span style={{ fontSize:12, fontWeight:500, color:'#B8956A' }}>{label}</span>
        {aiField && <span style={{ fontSize:10, background:'#1A5FA822', color:'#185FA5', padding:'1px 6px', borderRadius:100, fontWeight:600, border:'1px solid #185FA533' }}>AI</span>}
      </div>
      <select style={{ ...S.inp, borderColor:aiField?'#185FA5':undefined }} value={value} onChange={e=>onChange(e.target.value)}>
        {options.map(([v,l])=><option key={v} value={v}>{l}</option>)}
      </select>
    </div>
  )
}
function EditTextarea({ label, value, onChange, placeholder, aiField }) {
  const T = useT()
  return (
    <div style={{ gridColumn:'1/-1' }}>
      <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:5 }}>
        <span style={{ fontSize:12, fontWeight:500, color:'#B8956A' }}>{label}</span>
        {aiField && <span style={{ fontSize:10, background:'#1A5FA822', color:'#185FA5', padding:'1px 6px', borderRadius:100, fontWeight:600, border:'1px solid #185FA533' }}>AI</span>}
      </div>
      <textarea style={{ ...S.inp, minHeight:70, resize:'vertical', lineHeight:1.5 }} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder||''} />
    </div>
  )
}
function EditSecBox({ title, children }) {
  const T = useT()
  return (
    <div style={{ background:'#F5EDE0', border:'1px solid #E0D8CC', borderRadius:14, padding:16, marginBottom:14 }}>
      <div style={{ fontSize:10, fontWeight:700, color:'#C4614A', textTransform:'uppercase', letterSpacing:1.2, marginBottom:14, paddingBottom:8, borderBottom:'1px solid #E0D8CC' }}>{title}</div>
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
  const T = useT()
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
      const SYSTEM = `Sei un esperto enologo. Analizza le informazioni sul vino e restituisci SOLO JSON valido senza markdown. Rispondi SEMPRE in ${getLingua() === 'it' ? 'italiano' : getLingua() === 'en' ? 'inglese' : 'francese'} per i campi testuali. Compila solo i campi di cui sei 100% certo. Lascia stringa vuota se non sei certo. Valutazione annata: 1-5 (0 se incerto). Invecchiamento: numero anni (0 se incerto). {"nome":"","cantina":"","tipologia":"","anno":"","paese":"","regione":"","denominazione":"","vitigno":"","valutazione":"","temp":"","invecchiamento":"","info_cantina":"","caratteristiche_bottiglia":"","caratteristiche_annata":"","note":""}`
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
      <EditSecBox title={T('form.foto')}>
        <div style={{gridColumn:'1/-1'}}><ImageUpload value={f.foto_url} onChange={set('foto_url')} label="" folder="vini" /></div>
        <div style={{gridColumn:'1/-1'}}>
          <button onClick={handleAI} disabled={aiLoading} style={{width:'100%',padding:12,background:aiLoading?'#EAE2D6':'#C4614A22',color:aiLoading?'#9A8070':'#C4614A',border:'1px solid #C4614A44',borderRadius:12,fontSize:14,fontWeight:600,cursor:aiLoading?'default':'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
            {aiLoading?<>{T('form.ai_analizza')}</>:<>{T('form.aggiorna_ai')}</>}
          </button>
        </div>
      </EditSecBox>
      <EditSecBox title={T('form.dati_vino')}>
        <EditInput label={T('form.nome_vino')} value={f.nome} onChange={set('nome')} placeholder={T('form.placeholder.nome')} full aiField={ai('nome')} />
        <EditInput label={T('form.cantina')} value={f.cantina} onChange={set('cantina')} placeholder={T('form.placeholder.cantina')} aiField={ai('cantina')} />
        <EditSelect label={T('form.tipologia')} value={f.tipologia} onChange={set('tipologia')} options={[['','—'],...TIPOLOGIE.map(t=>[t,t])]} aiField={ai('tipologia')} />
        <EditInput label={T('form.anno')} value={f.anno} onChange={set('anno')} placeholder="2019" type="number" aiField={ai('anno')} />
        <div style={{gridColumn:'1/-1'}}>
          <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:5}}>
            <span style={{fontSize:12,fontWeight:500,color:'#B8956A'}}>{T('form.paese')}</span>
            {ai('paese')&&<span style={{fontSize:10,background:'#1A5FA822',color:'#185FA5',padding:'1px 6px',borderRadius:100,fontWeight:600,border:'1px solid #185FA533'}}>AI</span>}
          </div>
          <select style={{...S.inp,borderColor:ai('paese')?'#185FA5':undefined}} value={f.paese} onChange={e=>setF(p=>({...p,paese:e.target.value,regione:''}))}>
            {PAESI_OPTIONS.map(p=><option key={p} value={p}>{p ? tPaese(p) : T('form.seleziona')}</option>)}
          </select>
        </div>
        {f.paese&&f.paese!=='Altro'&&regioniOptions&&(
          <div style={{gridColumn:'1/-1'}}>
            <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:5}}>
              <span style={{fontSize:12,fontWeight:500,color:'#B8956A'}}>{T('form.regione')}</span>
              {ai('regione')&&<span style={{fontSize:10,background:'#1A5FA822',color:'#185FA5',padding:'1px 6px',borderRadius:100,fontWeight:600,border:'1px solid #185FA533'}}>AI</span>}
            </div>
            <select style={{...S.inp,borderColor:ai('regione')?'#185FA5':undefined}} value={f.regione} onChange={e=>set('regione')(e.target.value)}>
              {regioniOptions.map(([v,l])=><option key={v} value={v}>{l}</option>)}
            </select>
          </div>
        )}
        {f.paese==='Altro'&&<EditInput label={T('form.regione')} value={f.regione} onChange={set('regione')} placeholder={T('form.placeholder.regione')} full aiField={ai('regione')}/>}
        <EditTextarea label={T('form.note')} value={f.note} onChange={set('note')} placeholder={T('form.placeholder.note')} aiField={ai('note')} />
      </EditSecBox>
      <EditSecBox title={T('form.acquisto')}>
        <EditInput label={T('form.canale')} value={f.canale_acquisto} onChange={set('canale_acquisto')} placeholder={T('form.placeholder.canale')} />
        <EditInput label={T('form.prezzo_acquisto')} value={f.prezzo_acquisto} onChange={set('prezzo_acquisto')} placeholder="es. 24.50" type="number" />
        <EditSelect label={T('form.fascia_prezzo')} value={f.prezzo} onChange={set('prezzo')} options={[['','—'],['1','💶 1'],['2','💶💶 2'],['3','💶💶💶 3'],['4','💶💶💶💶 4'],['5','💶💶💶💶💶 5']]} />
        <EditInput label={T('form.quantita')} value={f.quantita} onChange={v=>set('quantita')(String(Math.max(1,parseInt(v)||1)))} type="number" />
      </EditSecBox>
      <EditSecBox title={T('form.arricchimento')}>
        <EditInput label={T('form.denominazione')} value={f.denominazione} onChange={set('denominazione')} placeholder={T('form.placeholder.denominazione')} full aiField={ai('denominazione')} />
        <EditInput label={T('form.vitigno')} value={f.vitigno} onChange={set('vitigno')} placeholder={T('form.placeholder.vitigno')} aiField={ai('vitigno')} />
        <EditSelect label={T('form.valutazione')} value={f.valutazione} onChange={set('valutazione')} options={[['','—'],['1','⭐️ 1'],['2','⭐️⭐️ 2'],['3','⭐️⭐️⭐️ 3'],['4','⭐️⭐️⭐️⭐️ 4'],['5','⭐️⭐️⭐️⭐️⭐️ 5']]} aiField={ai('valutazione')} />
        <EditInput label={T('form.temp')} value={f.temp} onChange={set('temp')} placeholder={T('form.placeholder.temp')} aiField={ai('temp')} />
        <EditSelect label={T('form.invecchiamento')} value={f.invecchiamento} onChange={set('invecchiamento')} options={[['non_so',T('form.non_so')],...Array.from({length:30},(_,i)=>[String(i+1),`${i+1} ${i+1===1?T('form.anno_sing'):T('form.anni')}`])]} full aiField={ai('invecchiamento')} />
        <EditTextarea label={T('form.info_cantina')} value={f.info_cantina} onChange={set('info_cantina')} placeholder={T('form.placeholder.info_cantina')} aiField={ai('info_cantina')} />
        <EditTextarea label={T('form.car_bottiglia')} value={f.caratteristiche_bottiglia} onChange={set('caratteristiche_bottiglia')} placeholder={T('form.placeholder.car_bottiglia')} aiField={ai('caratteristiche_bottiglia')} />
        <EditTextarea label={T('form.car_annata')} value={f.caratteristiche_annata} onChange={set('caratteristiche_annata')} placeholder={T('form.placeholder.car_annata')} aiField={ai('caratteristiche_annata')} />
      </EditSecBox>
      <button onClick={handleSave} disabled={saving} style={{width:'100%',padding:14,background:'#C4614A',color:'#FBF7F0',border:'none',borderRadius:12,fontSize:15,fontWeight:700,cursor:'pointer',opacity:saving?0.7:1,marginBottom:8,fontFamily:'DM Sans, sans-serif'}}>
        {saving?T('form.salvataggio'):T('form.salva')}
      </button>
    </div>
  )
}

// ─── Alert Da bere presto ─────────────────────────────────────────────────────
function DaBerePresto({ cantina, onDettaglio }) {
  const T = useT()
  const urgenti = cantina.filter(b=>{const m=getMaturita(b);return m.pct!==null&&m.pct>=108&&m.pct<110})
  if (urgenti.length===0) return null
  return (
    <div style={{margin:'0 0 8px',background:'#FDF8F0',border:'1px solid #C4614A33',borderLeft:'2px solid #C4614A',borderRadius:8,padding:'10px 14px',display:'flex',alignItems:'center',gap:10}}>
      <div style={{width:6,height:6,borderRadius:'50%',background:'#C4614A',flexShrink:0,boxShadow:'0 0 6px #C4614A'}} />
      <div style={{flex:1}}>
        {urgenti.map(b=>(
          <div key={b.id} onClick={()=>onDettaglio(b)} style={{cursor:'pointer',fontSize:12,color:'#C4614A',lineHeight:1.5}}>
            {b.nome} {b.anno} — {t('lib.da_bere_presto')}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Riga bottiglia con swipe ─────────────────────────────────────────────────
function BottigliaRow({ b, onBevuto, onQty, onDettaglio, onElimina, showHint }) {
  const T = useT()
  const m = getMaturita(b)
  const pct = m.pct !== null ? Math.min(m.pct, 100) : 0
  const tipoColor = TIPO_COLOR[b.tipologia] || '#B8956A'
  const tipoBg = TIPO_BG[b.tipologia] || '#F1EFE8'
  const tipoSolid = TIPO_SOLID[b.tipologia] || '#3a2a1a'

  const [swipeX, setSwipeX] = useState(0)
  const [swiping, setSwiping] = useState(false)
  const [hinting, setHinting] = useState(false)
  const startX = useRef(0)
  const isDragging = useRef(false)
  const THRESHOLD = 72

  // Animazione hint sulla prima riga
  useEffect(() => {
    if (!showHint) return
    const t = setTimeout(() => {
      setHinting(true)
      setTimeout(() => setHinting(false), 600)
    }, 800)
    return () => clearTimeout(t)
  }, [showHint])

  // Touch
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

  // Mouse (desktop)
  const onMouseDown = e => { startX.current = e.clientX; isDragging.current = true; setSwiping(true) }
  const onMouseMove = e => {
    if (!isDragging.current) return
    const dx = startX.current - e.clientX
    if (dx > 0) setSwipeX(Math.min(dx, THRESHOLD + 20))
  }
  const onMouseUp = () => {
    if (!isDragging.current) return
    isDragging.current = false; setSwiping(false)
    if (swipeX >= THRESHOLD) { onBevuto(b); setSwipeX(0) }
    else setSwipeX(0)
  }

  const translateX = hinting ? 22 : swipeX
  const isAnimating = hinting || !swiping

  return (
    <div style={{ position:'relative', overflow:'hidden', borderBottom:'1px solid #E2DDD6', background:'#FAF6EF' }}>
      {/* Sfondo swipe — stesso colore del gradiente, nessun rettangolo */}
      <div style={{ position:'absolute', right:0, top:0, bottom:0, left:0, background:`linear-gradient(to left, ${tipoSolid} 0%, ${tipoSolid} ${THRESHOLD}px, #FAF6EF ${THRESHOLD + 40}px)` }} />

      {/* Riga principale */}
      <div
        onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}
        onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}
        style={{ display:'flex', alignItems:'center', gap:12, padding:'13px 14px', background:'#FAF6EF', position:'relative', zIndex:2, transform:`translateX(-${translateX}px)`, transition:isAnimating?'transform 0.3s ease':'none', cursor:'grab', userSelect:'none' }}>

        {/* Gradiente hint — leggero, sfuma verso il colore tipologia */}
        <div style={{ position:'absolute', right:0, top:0, bottom:0, width:36, background:`linear-gradient(to left, ${tipoSolid}55, transparent)`, pointerEvents:'none', zIndex:3 }} />

        {/* Left */}
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:5 }}>
            <span style={{ fontSize:8, fontWeight:700, letterSpacing:1.5, textTransform:'uppercase', padding:'2px 8px', borderRadius:3, background:tipoBg, color:tipoColor, border:`1px solid ${tipoColor}44`, flexShrink:0 }}>{b.tipologia ? T(`tipo.${b.tipologia}`) : '—'}</span>
            <button onClick={e=>{e.stopPropagation();onQty(b.id,-1)}} disabled={b.quantita<=1}
              style={{ width:20, height:20, borderRadius:'50%', border:'1px solid #D6D0C8', background:'none', color:b.quantita<=1?'#D6D0C8':'#7A6E65', fontSize:14, cursor:b.quantita<=1?'default':'pointer', display:'flex', alignItems:'center', justifyContent:'center', lineHeight:1, flexShrink:0 }}>−</button>
            <span style={{ fontSize:11, color:'#7A6E65', flexShrink:0 }}>{b.quantita} {T('lib.bott')}</span>
            <button onClick={e=>{e.stopPropagation();onQty(b.id,1)}}
              style={{ width:20, height:20, borderRadius:'50%', border:'1px solid #D6D0C8', background:'none', color:'#7A6E65', fontSize:14, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', lineHeight:1, flexShrink:0 }}>+</button>
            <div style={{ marginLeft:'auto', display:'flex', gap:4 }}>
              <button onClick={e=>{e.stopPropagation();onElimina(b)}}
                style={{ width:22, height:22, borderRadius:'50%', border:'1px solid #E2DDD6', background:'none', color:'#B0A89E', fontSize:11, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>🗑️</button>
            </div>
          </div>
          <div onClick={() => onDettaglio(b)} style={{ cursor:'pointer' }}>
            <div style={{ fontFamily:'Cormorant Garamond, serif', fontSize:17, fontWeight:600, color:'#1C1410', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', marginBottom:2, lineHeight:1.2 }}>{b.nome}</div>
            <div style={{ fontSize:11, color:'#7A6E65', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{b.cantina}</div>
          </div>
        </div>

        {/* Right */}
        <div style={{ flexShrink:0, textAlign:'right', minWidth:70 }} onClick={() => onDettaglio(b)}>
          <div style={{ fontFamily:'Cormorant Garamond, serif', fontSize:22, fontWeight:300, color:'#7A6E65', lineHeight:1, marginBottom:8 }}>{b.anno||'—'}</div>
          <div style={{ width:70, height:5, background:'#E2DDD6', borderRadius:3, overflow:'hidden', marginBottom:5 }}>
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
  const T = useT()
  const [q, setQ] = useState('')
  const [confirmB, setConfirmB] = useState(null)

  const filtered = useMemo(() =>
    cantina.filter(b=>!q||(b.nome+(b.cantina||'')+(b.vitigno||'')).toLowerCase().includes(q.toLowerCase())),
    [cantina,q]
  )

  const totFiltered = filtered.reduce((s,b)=>s+(b.quantita||0), 0)

  const gruppi = useMemo(() => {
    const g={'Oltre il picco':[],'Al picco':[],'In evoluzione':[],'Da definire':[]}
    filtered.forEach(b=>{
      const m=getMaturita(b)
      const key=CLS_TO_KEY[m.cls]||'Da definire'
      g[key].push({...b,_pct:m.pct})
    })
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
      <div style={{ position:'sticky', top:0, background:'#FBF7F0', paddingBottom:10, paddingTop:0, zIndex:10, borderBottom:'1px solid #E0D8CC' }}>
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder={`🔍  ${T('lib.cerca')}`} style={{ ...S.inp, width:'100%' }} />
        <div style={{ fontSize:11, color:'#B8956A', marginTop:8, letterSpacing:0.5 }}>
          {totFiltered} {totFiltered===1?T('lib.bottiglia'):T('lib.bottiglie')} · {filtered.length} {filtered.length===1?T('lib.etichetta'):T('lib.etichette')}
        </div>
      </div>

      <DaBerePresto cantina={cantina} onDettaglio={onDettaglio} />

      {GRUPPI_ORDINE.map((gruppo, idx)=>{
        const bott=gruppi[gruppo]
        if(bott.length===0)return null
        const meta=getGruppiMeta()[gruppo]
        const colore=matColor(meta.cls)
        return (
          <div key={gruppo}>
            <div style={{ background:`${colore}10`, borderTop:`2px solid ${colore}55`, borderBottom:`1px solid ${colore}22`, padding:'10px 14px', display:'flex', alignItems:'center', gap:8 }}>
              <div style={{ width:8, height:8, borderRadius:'50%', background:colore, flexShrink:0 }} />
              <span style={{ fontSize:11, fontWeight:700, letterSpacing:2, textTransform:'uppercase', color:colore }}>{T(`lib.${meta.cls === 'red' ? 'oltre_picco' : meta.cls === 'amber' ? 'al_picco' : meta.cls === 'green' ? 'in_evoluzione' : 'da_definire'}`)}</span>
              <span style={{ fontSize:11, color:'#B0A89E', marginLeft:'auto' }}>{meta.desc} · {bott.length} {bott.length===1?T('lib.etichetta'):T('lib.etichette')}</span>
            </div>
            {bott.map((b, i)=>(
              <BottigliaRow key={b.id} b={b} onBevuto={onBevuto} onQty={onQty} onDettaglio={onDettaglio} onElimina={setConfirmB} showHint={idx===0 && i===0} />
            ))}
          </div>
        )
      })}

      {filtered.length===0&&(
        <div style={{ textAlign:'center', padding:'64px 20px', color:'#9A8070' }}>
          <div style={{ fontFamily:'Cormorant Garamond, serif', fontSize:40, marginBottom:12, fontStyle:'italic' }}>🍾</div>
          <div style={{ fontFamily:'Cormorant Garamond, serif', fontSize:18, fontWeight:300, fontStyle:'italic' }}>{T('lib.nessuna')}</div>
        </div>
      )}

      <ConfirmDialog open={!!confirmB} nome={confirmB?.nome||''} onConfirm={handleConfirmElimina} onCancel={()=>setConfirmB(null)} />
    </>
  )
}

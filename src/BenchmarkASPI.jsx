import { useState } from 'react'
import { updateScheda } from './supabase'

// ─── Valori ASPI aggiornati ───────────────────────────────────────────────────
const VALORI_ASPI = {
  limpidezza: ['Velato','Limpido','Molto limpido','Cristallino','Brillante'],
  trasparenza: ['Molto trasparente','Poco trasparente','Profondo'],
  tonalitaRosso: ['Rosso porpora','Rosso rubino','Rosso granato','Rosso aranciato'],
  tonalitaRosato: ['Rosa salmone','Rosa buccia di cipolla','Rosa cerasuolo','Rosa chiaretto'],
  tonalitaBianco: ['Giallo verdolino','Giallo paglierino','Giallo oro / dorato','Giallo ambrato'],
  riflessiRosso: ['Purpureo/inchiostro','Violaceo','Granato/aranciato','Mattonato'],
  riflessiRosato: ['Rosa tenue','Ramato','Rosa vivace','Rosa violaceo'],
  riflessiAltri: ['Verdognolo','Grigio verde','Paglia chiaro','Oro antico/ambrato','Topazio/oro verde'],
  rifleeeiBianco: ['Verdognolo','Grigio verde','Paglia chiaro','Oro antico/ambrato','Topazio/oro verde'],
  fluidita: ['Molto fluido','Scorrevole','Piuttosto consistente','Consistente','Denso'],
  archetti: ['Assenti','Stretti','Medi','Ampi'],
  intensitaOlf: ['Sfuggente','Poco intenso','Piuttosto intenso','Intenso','Penetrante'],
  complessita: ['Semplice','Media','Complesso','Ampio'],
  qualitaOlf: ['Comune','Poco fine','Piuttosto fine','Fine','Eccellente'],
  zuccheri: ['Secco','Abboccato','Amabile','Dolce','Stucchevole'],
  alcoli: ['Leggero','Appena caldo','Piuttosto caldo','Caldo','Alcolico'],
  polialcoli: ['Spigoloso','Poco spigoloso','Piuttosto morbido','Morbido','Pastoso'],
  acidi: ['Piatto','Leggermente fresco','Piuttosto fresco','Fresco','Acidulo'],
  tannini: ['Molle','Leggermente tannico','Piuttosto tannico','Tannico','Astringente'],
  saliMinerali: ['Scipito','Leggermente sapido','Piuttosto sapido','Sapido','Salato'],
  struttura: ['Magro','Leggero','Media','Di corpo','Robusto','Pesante'],
  equilibrio: ['Scarsamente equilibrato','Piuttosto equilibrato','Equilibrato'],
  intensitaGust: ['Sfuggente','Poco intenso','Piuttosto intenso','Intenso','Penetrante'],
  persistenzaGust: ['Molto breve','Di media durata','Lunga','Molto lunga'],
  qualitaGust: ['Comune','Poco fine','Piuttosto fine','Fine','Eccellente'],
  armonia: ['Disarmonico','Piuttosto armonico','Armonico'],
  statoEvolutivo: ['Immaturo','Giovane','Pronto','Maturo','Vecchio'],
  formaCalice: ['Tulipano','Flûte','Ballon','Tumbler'],
  rapportoQP: ['Scarso','Corretto','Equilibrato','Eccellente'],
  tempServizio: ['6-8°C','8-10°C','10-12°C','12-14°C','14-16°C','16-18°C','18-20°C'],
}

const TIPOLOGIE_CON_TANNINI = ['Rosso','Rosato','Orange','Dolce','Fortificato']

const SEZIONI = [
  {
    titolo: 'Esame visivo',
    campi: [
      { key: 'limpidezza', label: 'Limpidezza', opts: VALORI_ASPI.limpidezza },
      { key: 'trasparenza', label: 'Trasparenza', opts: VALORI_ASPI.trasparenza },
      { key: 'tonalita', label: 'Tonalità', optsKey: 'tonalita' },
      { key: 'riflessi', label: 'Riflessi', optsKey: 'riflessi' },
      { key: 'fluidita', label: 'Fluidità', opts: VALORI_ASPI.fluidita },
      { key: 'archetti', label: 'Archetti', opts: VALORI_ASPI.archetti },
    ]
  },
  {
    titolo: 'Esame olfattivo',
    campi: [
      { key: 'intensitaOlf', label: 'Intensità olfattiva', opts: VALORI_ASPI.intensitaOlf },
      { key: 'complessita', label: 'Complessità', opts: VALORI_ASPI.complessita },
      { key: 'qualitaOlf', label: 'Qualità olfattiva', opts: VALORI_ASPI.qualitaOlf },
    ]
  },
  {
    titolo: 'Esame gustativo',
    campi: [
      { key: 'zuccheri', label: 'Zuccheri', opts: VALORI_ASPI.zuccheri },
      { key: 'alcoli', label: 'Alcoli', opts: VALORI_ASPI.alcoli },
      { key: 'polialcoli', label: 'Polialcoli', opts: VALORI_ASPI.polialcoli },
      { key: 'acidi', label: 'Acidi', opts: VALORI_ASPI.acidi },
      { key: 'tannini', label: 'Tannini', opts: VALORI_ASPI.tannini, soloTipologie: TIPOLOGIE_CON_TANNINI },
      { key: 'saliMinerali', label: 'Sali minerali', opts: VALORI_ASPI.saliMinerali },
      { key: 'struttura', label: 'Struttura', opts: VALORI_ASPI.struttura },
      { key: 'equilibrio', label: 'Equilibrio', opts: VALORI_ASPI.equilibrio },
      { key: 'intensitaGust', label: 'Intensità gustativa', opts: VALORI_ASPI.intensitaGust },
      { key: 'persistenzaGust', label: 'Persistenza gustativa', opts: VALORI_ASPI.persistenzaGust },
      { key: 'qualitaGust', label: 'Qualità gustativa', opts: VALORI_ASPI.qualitaGust },
    ]
  },
  {
    titolo: 'Considerazioni finali',
    campi: [
      { key: 'armonia', label: 'Armonia', opts: VALORI_ASPI.armonia },
      { key: 'statoEvolutivo', label: 'Stato evolutivo', opts: VALORI_ASPI.statoEvolutivo },
      { key: 'tempServizio', label: 'Temperatura di servizio', opts: VALORI_ASPI.tempServizio },
      { key: 'formaCalice', label: 'Forma calice', opts: VALORI_ASPI.formaCalice },
      { key: 'rapportoQP', label: 'Rapporto Q/P', opts: VALORI_ASPI.rapportoQP },
    ]
  },
]

function getTonalitaOpts(tipologia) {
  if (['Rosso','Fortificato'].includes(tipologia)) return VALORI_ASPI.tonalitaRosso
  if (tipologia === 'Rosato') return VALORI_ASPI.tonalitaRosato
  return VALORI_ASPI.tonalitaBianco
}

function getRiflessiOpts(tipologia) {
  if (['Rosso','Fortificato'].includes(tipologia)) return VALORI_ASPI.riflessiRosso
  if (tipologia === 'Rosato') return VALORI_ASPI.riflessiRosato
  return VALORI_ASPI.riflessiAltri
}

function ChipValore({ value, match }) {
  if (!value) return <span style={{ fontSize:13, color:'#B0A89E', fontStyle:'italic' }}>—</span>
  const color = match === true ? '#2D6A4F' : match === false ? '#9B2335' : '#1C1410'
  const bg = match === true ? '#F0F7F3' : match === false ? '#FFF0F0' : '#FAF6EF'
  return (
    <span style={{ fontSize:12, fontWeight:600, padding:'4px 10px', borderRadius:100, background:bg, color, display:'inline-block' }}>
      {match === true ? '✓ ' : match === false ? '✗ ' : ''}{value}
    </span>
  )
}

async function generaBenchmark(scheda) {
  const SYSTEM = `Sei un esperto sommelier ASPI. Analizza il vino e compila la scheda ASPI con valori attesi.
Rispondi SOLO con JSON valido, nessun markdown. Lascia "" se non hai info sufficienti.
Usa ESCLUSIVAMENTE i valori elencati — nessun valore inventato.
VALORI AMMESSI: ${JSON.stringify(VALORI_ASPI)}
Campi: limpidezza, trasparenza, tonalita, riflessi, fluidita, archetti, intensitaOlf, complessita, qualitaOlf, zuccheri, alcoli, polialcoli, acidi, tannini, saliMinerali, struttura, equilibrio, intensitaGust, persistenzaGust, qualitaGust, armonia, statoEvolutivo, tempServizio, formaCalice, rapportoQP`

  const info = [scheda.nomeVino, scheda.cantina, scheda.denominazione, scheda.tipologia, scheda.annata, scheda.paese, scheda.regione, scheda.vitigno ? `Vitigno: ${scheda.vitigno}` : ''].filter(Boolean).join(', ')
  const res = await fetch('/api/claude', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model:'claude-sonnet-4-6', max_tokens:1200, system:SYSTEM, messages:[{ role:'user', content:`Vino: ${info}\nAnnata: ${scheda.annata||'non specificata'}` }] }),
  })
  const data = await res.json()
  if (data.error) throw new Error(data.error.message)
  const raw = data.content[0].text.replace(/```json\n?/g,'').replace(/```\n?/g,'').trim()
  return JSON.parse(raw)
}

export default function BenchmarkASPI({ scheda, onClose, onSaved }) {
  const [generando, setGenerando] = useState(false)
  const [benchmarkLocale, setBenchmarkLocale] = useState(scheda.benchmark_ai || null)
  const [valoriUtente, setValoriUtente] = useState({ ...scheda })
  const [saving, setSaving] = useState(false)
  const [errore, setErrore] = useState('')
  const hasBenchmark = !!benchmarkLocale

  const handleGenera = async () => {
    setGenerando(true); setErrore('')
    try {
      const result = await generaBenchmark(scheda)
      setBenchmarkLocale(result)
      await updateScheda(scheda.id, { benchmark_ai: result })
    } catch(e) { setErrore('Errore nella generazione. Riprova.'); console.error(e) }
    finally { setGenerando(false) }
  }

  const handleSalva = async () => {
    setSaving(true)
    try {
      await updateScheda(scheda.id, {
        limpidezza:valoriUtente.limpidezza, trasparenza:valoriUtente.trasparenza,
        tonalita:valoriUtente.tonalita, riflessi:valoriUtente.riflessi,
        fluidita:valoriUtente.fluidita, archetti:valoriUtente.archetti,
        intensitaOlf:valoriUtente.intensitaOlf, complessita:valoriUtente.complessita,
        qualitaOlf:valoriUtente.qualitaOlf, zuccheri:valoriUtente.zuccheri,
        alcoli:valoriUtente.alcoli, polialcoli:valoriUtente.polialcoli,
        acidi:valoriUtente.acidi, tannini:valoriUtente.tannini,
        saliMinerali:valoriUtente.saliMinerali, struttura:valoriUtente.struttura,
        equilibrio:valoriUtente.equilibrio, intensitaGust:valoriUtente.intensitaGust,
        persistenzaGust:valoriUtente.persistenzaGust, qualitaGust:valoriUtente.qualitaGust,
        armonia:valoriUtente.armonia, statoEvolutivo:valoriUtente.statoEvolutivo,
        tempServizio:valoriUtente.tempServizio, formaCalice:valoriUtente.formaCalice, rapportoQP:valoriUtente.rapportoQP,
      })
      onSaved({ ...scheda, ...valoriUtente, benchmark_ai: benchmarkLocale })
      onClose()
    } catch(e) { console.error(e) }
    finally { setSaving(false) }
  }

  const S_inp = { width:'100%', padding:'8px 10px', border:'1.5px solid #E2DDD6', borderRadius:8, fontSize:13, background:'#fff', color:'#1C1410', WebkitAppearance:'none', appearance:'none' }

  return (
    <div style={{ position:'fixed', inset:0, zIndex:500, background:'#FAF6EF', display:'flex', flexDirection:'column' }}>
      {/* Header — dark, safe area top */}
      <div style={{ background:'#FBF7F0', padding:'14px 16px', paddingTop:'calc(14px + env(safe-area-inset-top, 0px))', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0, borderBottom:'1px solid #E0D8CC' }}>
        <div>
          <div style={{ fontFamily:'Cormorant Garamond, serif', color:'#2C1A0E', fontSize:17, fontWeight:400, fontStyle:'italic' }}>{scheda.nomeVino}</div>
          <div style={{ color:'#B8956A', fontSize:12 }}>Benchmark AI · {scheda.cantina} {scheda.annata}</div>
        </div>
        <button onClick={onClose} style={{ width:34, height:34, borderRadius:'50%', border:'1px solid #D6CEBE', background:'#EAE2D6', color:'#2C1A0E', fontSize:16, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>✕</button>
      </div>

      {/* Stato: nessun benchmark */}
      {!hasBenchmark && (
        <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:24 }}>
          <div style={{ fontSize:40, marginBottom:16 }}>🎓</div>
          <div style={{ fontFamily:'Cormorant Garamond, serif', fontSize:22, fontWeight:400, fontStyle:'italic', color:'#1C1410', marginBottom:8, textAlign:'center' }}>Benchmark ASPI</div>
          <div style={{ fontSize:14, color:'#7A6E65', marginBottom:24, textAlign:'center', lineHeight:1.6, maxWidth:280 }}>
            Genera il benchmark AI per confrontare la tua degustazione. Viene generato una sola volta.
          </div>
          {errore && <div style={{ fontSize:13, color:'#9B2335', marginBottom:16, textAlign:'center' }}>{errore}</div>}
          <button onClick={handleGenera} disabled={generando}
            style={{ padding:'14px 32px', background:generando?'#FAF6EF':'#FBF7F0', color:generando?'#7A6E65':'#2C1A0E', border:'none', borderRadius:14, fontSize:15, fontWeight:600, cursor:generando?'default':'pointer' }}>
            {generando ? '⏳ Generando…' : '✨ Genera benchmark'}
          </button>
        </div>
      )}

      {/* Vista a due colonne */}
      {hasBenchmark && (
        <>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', background:'#1C1410', padding:'10px 16px', flexShrink:0 }}>
            <div style={{ fontSize:11, fontWeight:700, color:'#2C1A0E', textTransform:'uppercase', letterSpacing:1 }}>La tua scheda</div>
            <div style={{ fontSize:11, fontWeight:700, color:'#C4614A', textTransform:'uppercase', letterSpacing:1 }}>✨ Benchmark AI</div>
          </div>
          <div style={{ display:'flex', gap:12, padding:'8px 16px', background:'#F9F7F4', borderBottom:'1px solid #E2DDD6', flexShrink:0 }}>
            <span style={{ fontSize:11, color:'#2D6A4F' }}>✓ Concordante</span>
            <span style={{ fontSize:11, color:'#9B2335' }}>✗ Divergente</span>
            <span style={{ fontSize:11, color:'#B0A89E' }}>— Non valorizzato</span>
          </div>
          <div style={{ flex:1, overflowY:'auto', WebkitOverflowScrolling:'touch', padding:'12px 16px', paddingBottom:'calc(80px + env(safe-area-inset-bottom, 0px))' }}>
            {SEZIONI.map(sez => (
              <div key={sez.titolo} style={{ marginBottom:20 }}>
                <div style={{ fontSize:10, fontWeight:700, color:'#7B1E2E', textTransform:'uppercase', letterSpacing:1.2, marginBottom:10, paddingBottom:6, borderBottom:'1px solid #E2DDD6' }}>{sez.titolo}</div>
                {sez.campi.map(campo => {
                  // Nasconde tannini per tipologie senza tannini
                  if (campo.soloTipologie && !campo.soloTipologie.includes(scheda.tipologia)) return null
                  const opts = campo.optsKey === 'tonalita' ? getTonalitaOpts(scheda.tipologia)
                    : campo.optsKey === 'riflessi' ? getRiflessiOpts(scheda.tipologia)
                    : campo.opts
                  const valU = valoriUtente[campo.key] || ''
                  const valAI = benchmarkLocale?.[campo.key] || ''
                  const match = valU && valAI ? valU === valAI : undefined
                  return (
                    <div key={campo.key} style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:10, alignItems:'start' }}>
                      <div>
                        <div style={{ fontSize:11, color:'#7A6E65', marginBottom:4, fontWeight:500 }}>{campo.label}</div>
                        <select style={{ ...S_inp, borderColor: match === false ? '#9B2335' : match === true ? '#2D6A4F' : undefined }}
                          value={valU} onChange={e => setValoriUtente(p => ({...p, [campo.key]: e.target.value}))}>
                          <option value="">—</option>
                          {opts.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                      </div>
                      <div style={{ paddingTop:22 }}>
                        <ChipValore value={valAI} match={match} />
                      </div>
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
          <div style={{ padding:'12px 16px', paddingBottom:'calc(12px + env(safe-area-inset-bottom, 0px))', background:'#fff', borderTop:'1px solid #E2DDD6', flexShrink:0 }}>
            <button onClick={handleSalva} disabled={saving}
              style={{ width:'100%', padding:14, background:'#C4614A', color:'#FBF7F0', border:'none', borderRadius:12, fontSize:15, fontWeight:700, cursor:'pointer', opacity:saving?0.7:1 }}>
              {saving ? 'Salvataggio…' : 'Salva modifiche'}
            </button>
          </div>
        </>
      )}
    </div>
  )
}

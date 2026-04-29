import { useState, useEffect, useMemo } from 'react'
import { getMaturita } from './Libreria'
import { getAnalisiCantina, saveAnalisiCantina, deleteAnalisiCantina } from './supabase'

// Hash semplice della cantina per rilevare cambiamenti
function hashCantina(cantina) {
  return cantina
    .map(b => `${b.id}:${b.quantita}:${b.prezzo_acquisto || 0}`)
    .sort()
    .join('|')
}

// Payload minimizzato per Claude
function buildAnalisiPayload(cantina) {
  const byPaese = {}, byTipo = {}, byStato = {}
  let valTotale = 0

  cantina.forEach(b => {
    const m = getMaturita(b)
    const p = b.paese || 'Non specificato'
    const r = b.regione || 'Non specificata'
    if (!byPaese[p]) byPaese[p] = {}
    if (!byPaese[p][r]) byPaese[p][r] = []
    byPaese[p][r].push({ nome: b.nome, tipologia: b.tipologia, vitigno: b.vitigno, anno: b.anno, stato: m.label, quantita: b.quantita })
    byTipo[b.tipologia] = (byTipo[b.tipologia] || 0) + 1
    byStato[m.label] = (byStato[m.label] || 0) + 1
    valTotale += (b.prezzo_acquisto || 0) * (b.quantita || 0)
  })

  return { byPaese, byTipo, byStato, totEtichette: cantina.length, totBottiglie: cantina.reduce((s,b) => s+(b.quantita||0),0), valTotale }
}

const SYSTEM_ANALISI = `Sei un consulente enologo esperto che analizza la cantina personale di un appassionato.

Analizza i dati forniti e produci un report strutturato. Rispondi SOLO con JSON valido:
{
  "punti_forza": ["<punto 1>", "<punto 2>", "<punto 3>"],
  "lacune": [
    { "tipo": "<geografica|tipologia|evolutiva>", "descrizione": "<lacuna specifica>", "priorita": "<alta|media>" }
  ],
  "acquisti_consigliati": [
    { "vino": "<nome specifico: vitigno, regione, stile>", "motivo": "<perché colma una lacuna>", "urgenza": "<subito|prossimi mesi|quando capita>" }
  ],
  "equilibrio_evolutivo": "<analisi dello stato della cantina: troppi vini maturi? troppo giovani?>",
  "consiglio_strategico": "<un consiglio concreto per i prossimi 6-12 mesi>"
}`

async function callClaude(payload) {
  const res = await fetch('/api/claude', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1200,
      system: SYSTEM_ANALISI,
      messages: [{ role: 'user', content: `CANTINA:\n${JSON.stringify(payload)}` }],
    }),
  })
  const data = await res.json()
  if (data.error) throw new Error(data.error.message)
  const raw = data.content[0].text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  return JSON.parse(raw)
}

// ─── COMPONENTE ───────────────────────────────────────────────────────────────
export default function AnalisiAI({ cantina }) {
  const [analisi, setAnalisi] = useState(null)      // analisi salvata
  const [hashSalvato, setHashSalvato] = useState(null)
  const [loading, setLoading] = useState(false)
  const [loadingInit, setLoadingInit] = useState(true)

  const hashAttuale = useMemo(() => hashCantina(cantina), [cantina])
  const cantinaModificata = hashSalvato && hashSalvato !== hashAttuale

  // Carica analisi salvata al mount
  useEffect(() => {
    (async () => {
      try {
        const saved = await getAnalisiCantina()
        if (saved) {
          setAnalisi(JSON.parse(saved.contenuto))
          setHashSalvato(saved.cantina_hash)
        }
      } catch (e) { console.error(e) }
      finally { setLoadingInit(false) }
    })()
  }, [])

  const lancia = async () => {
    setLoading(true)
    try {
      const payload = buildAnalisiPayload(cantina)
      const risultato = await callClaude(payload)
      await saveAnalisiCantina(JSON.stringify(risultato), hashAttuale)
      setAnalisi(risultato)
      setHashSalvato(hashAttuale)
    } catch (e) {
      console.error(e)
      alert('Errore nell\'analisi. Riprova.')
    } finally { setLoading(false) }
  }

  const cancella = async () => {
    await deleteAnalisiCantina()
    setAnalisi(null)
    setHashSalvato(null)
  }

  const urgColor = { subito:'#9B2335', 'prossimi mesi':'#C77B13', 'quando capita':'#2D6A4F' }
  const priColor = { alta:'#9B2335', media:'#C77B13' }

  if (loadingInit) return null

  return (
    <div style={{ marginTop: 24 }}>
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16, paddingTop:16, borderTop:'1px solid #E2DDD6' }}>
        <span style={{ fontSize:20 }}>💡</span>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:13, fontWeight:700, color:'#1C1410' }}>Analisi AI della cantina</div>
          <div style={{ fontSize:12, color:'#7A6E65' }}>Powered by Claude Haiku</div>
        </div>
        {analisi && !cantinaModificata && (
          <button onClick={cancella} style={{ fontSize:12, color:'#B0A89E', background:'none', border:'none', cursor:'pointer' }}>Cancella</button>
        )}
      </div>

      {/* Cantina modificata — mostra avviso invece dell'analisi */}
      {cantinaModificata ? (
        <div style={{ background:'#FEF3E2', border:'1px solid #F6A623', borderRadius:14, padding:16, marginBottom:16 }}>
          <div style={{ fontSize:14, fontWeight:600, color:'#854F0B', marginBottom:6 }}>⚠️ La cantina è cambiata dall'ultima analisi</div>
          <div style={{ fontSize:13, color:'#854F0B', marginBottom:14 }}>I dati potrebbero non essere aggiornati. Vuoi aggiornare l'analisi?</div>
          <div style={{ display:'flex', gap:10 }}>
            <button onClick={lancia} disabled={loading} style={{ flex:1, padding:10, background:'#7B1E2E', color:'#fff', border:'none', borderRadius:10, fontSize:14, fontWeight:600, cursor:'pointer' }}>
              {loading ? 'Analizzando…' : 'Aggiorna analisi'}
            </button>
            <button onClick={cancella} style={{ padding:'10px 16px', background:'none', border:'1px solid #E2DDD6', borderRadius:10, fontSize:14, color:'#7A6E65', cursor:'pointer' }}>
              Scarta
            </button>
          </div>
        </div>
      ) : !analisi ? (
        /* Nessuna analisi — bottone per lanciarla */
        <button onClick={lancia} disabled={loading}
          style={{ width:'100%', padding:14, background: loading ? '#F4F1EC' : '#1C1410', color: loading ? '#7A6E65' : '#F5EFE0', border:'none', borderRadius:14, fontSize:15, fontWeight:600, cursor: loading ? 'default' : 'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:10 }}>
          {loading ? <>⏳ Analizzando la cantina…</> : <>💡 Analizza la mia cantina</>}
        </button>
      ) : (
        /* Analisi presente e aggiornata */
        <div>
          {/* Punti di forza */}
          <div style={{ background:'#F0F7F3', border:'1px solid #2D6A4F33', borderRadius:14, padding:16, marginBottom:12 }}>
            <div style={{ fontSize:11, fontWeight:700, color:'#2D6A4F', textTransform:'uppercase', letterSpacing:1, marginBottom:10 }}>✅ Punti di forza</div>
            {analisi.punti_forza?.map((p, i) => (
              <div key={i} style={{ display:'flex', gap:8, marginBottom:6 }}>
                <span style={{ color:'#2D6A4F', fontWeight:700, flexShrink:0 }}>·</span>
                <span style={{ fontSize:13, color:'#1C1410', lineHeight:1.5 }}>{p}</span>
              </div>
            ))}
          </div>

          {/* Lacune */}
          {analisi.lacune?.length > 0 && (
            <div style={{ background:'#FFF8F0', border:'1px solid #C77B1333', borderRadius:14, padding:16, marginBottom:12 }}>
              <div style={{ fontSize:11, fontWeight:700, color:'#C77B13', textTransform:'uppercase', letterSpacing:1, marginBottom:10 }}>🔍 Aree da sviluppare</div>
              {analisi.lacune.map((l, i) => (
                <div key={i} style={{ display:'flex', gap:10, marginBottom:8, alignItems:'flex-start' }}>
                  <span style={{ fontSize:10, fontWeight:700, color: priColor[l.priorita] || '#7A6E65', background: (priColor[l.priorita] || '#7A6E65') + '20', padding:'2px 7px', borderRadius:100, flexShrink:0, marginTop:1 }}>{l.priorita}</span>
                  <span style={{ fontSize:13, color:'#1C1410', lineHeight:1.5 }}>{l.descrizione}</span>
                </div>
              ))}
            </div>
          )}

          {/* Acquisti consigliati */}
          {analisi.acquisti_consigliati?.length > 0 && (
            <div style={{ background:'#F5EFE0', border:'1px solid #C8992A33', borderRadius:14, padding:16, marginBottom:12 }}>
              <div style={{ fontSize:11, fontWeight:700, color:'#854F0B', textTransform:'uppercase', letterSpacing:1, marginBottom:10 }}>🛒 Acquisti consigliati</div>
              {analisi.acquisti_consigliati.map((a, i) => (
                <div key={i} style={{ background:'#fff', borderRadius:10, padding:'10px 12px', marginBottom:8 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:4 }}>
                    <span style={{ fontSize:14, fontWeight:600, color:'#1C1410' }}>{a.vino}</span>
                    <span style={{ fontSize:10, fontWeight:700, color: urgColor[a.urgenza] || '#7A6E65', background: (urgColor[a.urgenza]||'#7A6E65')+'15', padding:'2px 8px', borderRadius:100 }}>{a.urgenza}</span>
                  </div>
                  <span style={{ fontSize:12, color:'#7A6E65' }}>{a.motivo}</span>
                </div>
              ))}
            </div>
          )}

          {/* Equilibrio evolutivo */}
          {analisi.equilibrio_evolutivo && (
            <div style={{ background:'#F4F1EC', borderRadius:14, padding:16, marginBottom:12 }}>
              <div style={{ fontSize:11, fontWeight:700, color:'#7A6E65', textTransform:'uppercase', letterSpacing:1, marginBottom:8 }}>⏳ Equilibrio evolutivo</div>
              <p style={{ fontSize:13, color:'#1C1410', lineHeight:1.6, margin:0 }}>{analisi.equilibrio_evolutivo}</p>
            </div>
          )}

          {/* Consiglio strategico */}
          {analisi.consiglio_strategico && (
            <div style={{ background:'#7B1E2E', borderRadius:14, padding:16 }}>
              <div style={{ fontSize:11, fontWeight:700, color:'rgba(245,239,224,0.7)', textTransform:'uppercase', letterSpacing:1, marginBottom:8 }}>🎯 Consiglio strategico</div>
              <p style={{ fontSize:14, color:'#F5EFE0', lineHeight:1.6, margin:0, fontStyle:'italic' }}>{analisi.consiglio_strategico}</p>
            </div>
          )}

          <button onClick={lancia} disabled={loading} style={{ width:'100%', marginTop:12, padding:11, background:'none', border:'1px solid #E2DDD6', borderRadius:12, fontSize:13, color:'#7A6E65', cursor:'pointer' }}>
            {loading ? 'Aggiornando…' : '🔄 Aggiorna analisi'}
          </button>
        </div>
      )}
    </div>
  )
}

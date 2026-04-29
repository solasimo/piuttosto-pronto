import { useState, useMemo } from 'react'
import { getMaturita } from './Libreria'

const WINE_EMOJI = { Rosso:'🍷', Bianco:'🥂', Bollicine:'🍾', Rosato:'🌸', Orange:'🍊', Dolce:'🍯', Fortificato:'🫙' }

// Costruisce il payload minimizzato per Claude
function buildCantinaSummary(cantina) {
  return cantina.map(b => {
    const m = getMaturita(b)
    return {
      id: b.id,
      nome: b.nome,
      cantina: b.cantina,
      tipologia: b.tipologia,
      vitigno: b.vitigno,
      regione: b.regione,
      anno: b.anno,
      stato: m.label,
      pct: m.pct,
      note: b.note,
      quantita: b.quantita,
    }
  }).filter(b => b.quantita > 0)
}

function priorityScore(b) {
  if (b.stato === 'Oltre il picco') return 3
  if (b.stato === 'Al picco') return 2
  if (b.stato === 'Da definire') return 1
  return 0 // In evoluzione — lowest priority
}

async function callClaude(systemPrompt, userMessage) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1000,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    }),
  })
  const data = await res.json()
  if (data.error) throw new Error(data.error.message)
  return data.content[0].text
}

const SYSTEM_ABBINAMENTO = `Sei un sommelier ASPI esperto. L'utente ha una cantina personale e vuole abbinare un piatto a un vino.

REGOLE DI PRIORITÀ (rispettale sempre):
1. Suggerisci prima vini "Oltre il picco" (da consumare subito)
2. Poi vini "Al picco" (momento ideale)
3. Vini "In evoluzione" solo se non ci sono alternative, con disclaimer chiaro sui rischi di berlo troppo presto
4. Se nessun vino è adatto, suggerisci UNA tipologia da acquistare (specifica: vitigno, regione, stile)

FORMATO RISPOSTA — rispondi SOLO con JSON valido, nessun testo fuori:
{
  "valido": true,
  "vini": [
    {
      "id": <id bottiglia>,
      "nome": "<nome esatto>",
      "cantina": "<cantina>",
      "anno": <anno>,
      "stato": "<stato evolutivo>",
      "match": "<punteggio 1-10>",
      "tipo_abbinamento": "<concordanza|contrapposizione>",
      "spiegazione": "<2-3 righe specifiche su questo vino e questo piatto>",
      "avvertenza": "<solo se In evoluzione, spiega il rischio>"
    }
  ],
  "acquisto": "<solo se nessun vino è adatto: suggerimento specifico da acquistare>",
  "nota_generale": "<una frase sull'abbinamento ideale per questo piatto>"
}

Se la richiesta non riguarda abbinamento cibo-vino, rispondi con:
{"valido": false, "messaggio": "<invita a inserire un piatto>"}`

const SYSTEM_INVERSO = `Sei un sommelier ASPI esperto. L'utente ha un vino specifico e vuole sapere cosa cucinare.

FORMATO RISPOSTA — rispondi SOLO con JSON valido:
{
  "valido": true,
  "piatti": [
    {
      "nome": "<nome piatto>",
      "categoria": "<primo|secondo|antipasto|dessert|formaggi>",
      "spiegazione": "<2-3 righe specifiche su perché funziona con questo vino>",
      "tipo_abbinamento": "<concordanza|contrapposizione>"
    }
  ],
  "consiglio_chef": "<un consiglio pratico di preparazione per esaltare l'abbinamento>"
}

Se la richiesta non ha senso, rispondi con:
{"valido": false, "messaggio": "<messaggio di errore>"}`

// ─── Componente risultato abbinamento ─────────────────────────────────────────
function RisultatoAbbinamento({ vino, rank }) {
  const medals = ['🥇','🥈','🥉']
  const statoColor = { 'Oltre il picco':'#9B2335','Al picco':'#C77B13','In evoluzione':'#2D6A4F','Da definire':'#1A5FA8' }
  return (
    <div style={{ background:'#fff', border:'1px solid #E2DDD6', borderRadius:14, padding:16, marginBottom:12 }}>
      <div style={{ display:'flex', gap:12, alignItems:'flex-start' }}>
        <span style={{ fontSize:28, flexShrink:0 }}>{medals[rank]}</span>
        <div style={{ flex:1 }}>
          <div style={{ fontFamily:'Playfair Display, serif', fontSize:16, fontWeight:600, color:'#1C1410', marginBottom:2 }}>{vino.nome}</div>
          <div style={{ fontSize:12, color:'#7A6E65', marginBottom:8 }}>{vino.cantina} · {vino.anno}</div>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:10 }}>
            <span style={{ fontSize:11, background:'#F5EFE0', color:'#7B1E2E', padding:'3px 9px', borderRadius:100, fontWeight:600 }}>
              Match {vino.match}/10
            </span>
            <span style={{ fontSize:11, background:'#F4F1EC', color:'#7A6E65', padding:'3px 9px', borderRadius:100 }}>
              {vino.tipo_abbinamento}
            </span>
            <span style={{ fontSize:11, color: statoColor[vino.stato] || '#7A6E65', background: (statoColor[vino.stato] || '#7A6E65') + '15', padding:'3px 9px', borderRadius:100, fontWeight:600 }}>
              {vino.stato}
            </span>
          </div>
          <p style={{ fontSize:13, color:'#3D3530', lineHeight:1.6, margin:0 }}>{vino.spiegazione}</p>
          {vino.avvertenza && (
            <div style={{ marginTop:8, background:'#FEF3E2', border:'1px solid #F6A623', borderRadius:8, padding:'8px 12px', fontSize:12, color:'#854F0B' }}>
              ⚠️ {vino.avvertenza}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Componente risultato inverso ─────────────────────────────────────────────
function RisultatoInverso({ piatto, rank }) {
  const medals = ['🥇','🥈','🥉']
  const catIcons = { primo:'🍝', secondo:'🥩', antipasto:'🧀', dessert:'🍮', formaggi:'🧀' }
  return (
    <div style={{ background:'#fff', border:'1px solid #E2DDD6', borderRadius:14, padding:16, marginBottom:12 }}>
      <div style={{ display:'flex', gap:12, alignItems:'flex-start' }}>
        <span style={{ fontSize:28, flexShrink:0 }}>{medals[rank]}</span>
        <div style={{ flex:1 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
            <span style={{ fontSize:16 }}>{catIcons[piatto.categoria] || '🍽️'}</span>
            <div style={{ fontFamily:'Playfair Display, serif', fontSize:16, fontWeight:600, color:'#1C1410' }}>{piatto.nome}</div>
          </div>
          <span style={{ fontSize:11, background:'#F4F1EC', color:'#7A6E65', padding:'3px 9px', borderRadius:100, marginBottom:10, display:'inline-block' }}>
            {piatto.tipo_abbinamento}
          </span>
          <p style={{ fontSize:13, color:'#3D3530', lineHeight:1.6, margin:'8px 0 0' }}>{piatto.spiegazione}</p>
        </div>
      </div>
    </div>
  )
}

// ─── COMPONENTE PRINCIPALE ────────────────────────────────────────────────────
export default function AIChef({ cantina }) {
  const [modo, setModo] = useState('abbinamento') // 'abbinamento' | 'inverso'
  const [input, setInput] = useState('')
  const [vinoSelezionato, setVinoSelezionato] = useState('')
  const [loading, setLoading] = useState(false)
  const [risultato, setRisultato] = useState(null)
  const [errore, setErrore] = useState('')

  const bottDisponibili = useMemo(() => cantina.filter(b => b.quantita > 0).sort((a,b) => priorityScore(b) - priorityScore(a)), [cantina])

  const cerca = async () => {
    if (modo === 'abbinamento' && !input.trim()) return
    if (modo === 'inverso' && !vinoSelezionato) return

    setLoading(true)
    setRisultato(null)
    setErrore('')

    try {
      const summary = buildCantinaSummary(cantina)

      let rawText
      if (modo === 'abbinamento') {
        const userMsg = `CANTINA (${summary.length} vini disponibili):\n${JSON.stringify(summary)}\n\nPIATTO: ${input}`
        rawText = await callClaude(SYSTEM_ABBINAMENTO, userMsg)
      } else {
        const vino = cantina.find(b => String(b.id) === vinoSelezionato)
        const vinoInfo = { nome: vino.nome, cantina: vino.cantina, tipologia: vino.tipologia, vitigno: vino.vitigno, regione: vino.regione, anno: vino.anno, note: vino.note }
        rawText = await callClaude(SYSTEM_INVERSO, `VINO: ${JSON.stringify(vinoInfo)}`)
      }

      const parsed = JSON.parse(rawText)

      if (!parsed.valido) {
        setErrore(parsed.messaggio || 'Input non valido. Inserisci un piatto o un vino.')
        return
      }

      setRisultato(parsed)
    } catch (e) {
      setErrore('Errore nella chiamata AI. Riprova.')
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const inpStyle = { flex:1, padding:'11px 14px', border:'1.5px solid #E2DDD6', borderRadius:10, fontSize:15, background:'#fff', color:'#1C1410', WebkitAppearance:'none' }

  return (
    <div>
      {/* Header */}
      <div style={{ background:'#7B1E2E', borderRadius:16, padding:20, marginBottom:20, display:'flex', alignItems:'center', gap:14 }}>
        <span style={{ fontSize:32 }}>✦</span>
        <div>
          <div style={{ fontFamily:'Playfair Display, serif', color:'#F5EFE0', fontSize:18, fontWeight:600 }}>Sommelier AI</div>
          <div style={{ color:'rgba(245,239,224,0.7)', fontSize:13, marginTop:2 }}>Powered by Claude Haiku</div>
        </div>
      </div>

      {/* Toggle modo */}
      <div style={{ display:'flex', gap:0, marginBottom:20, background:'#E2DDD6', borderRadius:12, padding:3 }}>
        {[['abbinamento','🍽️ Ho un piatto'],['inverso','🍷 Ho un vino']].map(([k,l]) => (
          <button key={k} onClick={() => { setModo(k); setRisultato(null); setErrore('') }}
            style={{ flex:1, padding:'9px 0', border:'none', borderRadius:10, fontSize:13, fontWeight:600, cursor:'pointer', background: modo===k ? '#fff' : 'transparent', color: modo===k ? '#1C1410' : '#7A6E65', transition:'background 0.15s' }}>{l}</button>
        ))}
      </div>

      {/* Input */}
      {modo === 'abbinamento' ? (
        <div style={{ display:'flex', gap:10, marginBottom:20 }}>
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key==='Enter' && cerca()}
            placeholder="es. risotto al tartufo, branzino al sale..." style={inpStyle} />
          <button onClick={cerca} disabled={loading} style={{ padding:'11px 18px', background:'#7B1E2E', color:'#fff', border:'none', borderRadius:12, fontSize:18, fontWeight:700, cursor:'pointer', opacity: loading ? 0.6 : 1, flexShrink:0 }}>
            {loading ? '…' : '→'}
          </button>
        </div>
      ) : (
        <div style={{ marginBottom:20 }}>
          <select value={vinoSelezionato} onChange={e => { setVinoSelezionato(e.target.value); setRisultato(null) }}
            style={{ ...inpStyle, flex:'none', width:'100%', marginBottom:12 }}>
            <option value="">— Seleziona un vino dalla cantina —</option>
            {bottDisponibili.map(b => (
              <option key={b.id} value={String(b.id)}>
                {WINE_EMOJI[b.tipologia] || '🍷'} {b.nome} {b.anno ? `(${b.anno})` : ''} — {getMaturita(b).label}
              </option>
            ))}
          </select>
          <button onClick={cerca} disabled={loading || !vinoSelezionato}
            style={{ width:'100%', padding:13, background:'#7B1E2E', color:'#fff', border:'none', borderRadius:12, fontSize:15, fontWeight:600, cursor:'pointer', opacity: (loading || !vinoSelezionato) ? 0.6 : 1 }}>
            {loading ? 'Sto pensando…' : 'Cosa cucino stasera? →'}
          </button>
        </div>
      )}

      {/* Errore */}
      {errore && (
        <div style={{ background:'#FEF3E2', border:'1px solid #F6A623', borderRadius:12, padding:'12px 16px', marginBottom:16, fontSize:14, color:'#854F0B', display:'flex', gap:10, alignItems:'center' }}>
          <span style={{ fontSize:20 }}>⚠️</span>
          <span>{errore}</span>
        </div>
      )}

      {/* Risultati abbinamento */}
      {risultato && modo === 'abbinamento' && (
        <>
          {risultato.nota_generale && (
            <div style={{ background:'#F5EFE0', borderRadius:12, padding:'12px 16px', marginBottom:16, fontSize:13, color:'#7B1E2E', fontStyle:'italic' }}>
              💡 {risultato.nota_generale}
            </div>
          )}
          {risultato.vini?.slice(0,3).map((v, i) => <RisultatoAbbinamento key={i} vino={v} rank={i} />)}
          {risultato.acquisto && (
            <div style={{ background:'#F4F1EC', border:'1px dashed #B0A89E', borderRadius:14, padding:16, marginTop:8 }}>
              <div style={{ fontSize:12, fontWeight:700, color:'#7A6E65', textTransform:'uppercase', letterSpacing:1, marginBottom:6 }}>💡 Considera di acquistare</div>
              <p style={{ fontSize:14, color:'#1C1410', margin:0, lineHeight:1.6 }}>{risultato.acquisto}</p>
            </div>
          )}
        </>
      )}

      {/* Risultati inverso */}
      {risultato && modo === 'inverso' && (
        <>
          {risultato.piatti?.slice(0,3).map((p, i) => <RisultatoInverso key={i} piatto={p} rank={i} />)}
          {risultato.consiglio_chef && (
            <div style={{ background:'#F5EFE0', borderRadius:12, padding:'12px 16px', marginTop:4, fontSize:13, color:'#7B1E2E', fontStyle:'italic' }}>
              👨‍🍳 {risultato.consiglio_chef}
            </div>
          )}
        </>
      )}
    </div>
  )
}

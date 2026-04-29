function PaeseSection({ paese, regioni, bottigliePaese, onBottigliaClick }) {
  const [open, setOpen] = useState(false)
  const totEtichette = bottigliePaese.length
  const totBottiglie = bottigliePaese.reduce((s, b) => s + (b.quantita || 0), 0)
  const valoreEur = bottigliePaese.reduce((s, b) => s + (b.prezzo_acquisto || 0) * (b.quantita || 0), 0)
  const regioniPresenti = [...new Set(bottigliePaese.map(b => b.regione).filter(Boolean))]
  const totRegioni = regioni.length
  const coperte = regioniPresenti.filter(r => regioni.includes(r)).length
  const byRegione = {}
  bottigliePaese.forEach(b => {
    if (!b.regione) return
    if (!byRegione[b.regione]) byRegione[b.regione] = []
    byRegione[b.regione].push(b)
  })
  const pctCopertura = Math.round((coperte / totRegioni) * 100)
  const copertura_color = pctCopertura >= 60 ? '#2D6A4F' : pctCopertura >= 30 ? '#C77B13' : '#9B2335'
  return (
    <div style={{ ...S.card, marginBottom: 12, padding: 0, overflow: 'hidden' }}>
      <div onClick={() => setOpen(o => !o)} style={{ padding: '14px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span style={{ fontFamily: 'Playfair Display, serif', fontSize: 16, fontWeight: 600, color: '#1C1410' }}>{paese}</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: copertura_color, background: copertura_color + '18', padding: '2px 8px', borderRadius: 100 }}>{coperte}/{totRegioni} regioni</span>
          </div>
          <div style={{ height: 5, borderRadius: 3, background: '#F0ECE5', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: pctCopertura + '%', background: copertura_color, borderRadius: 3, transition: 'width 0.5s' }} />
          </div>
        </div>
        <div style={{ textAlign: 'center', flexShrink: 0 }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: '#1C1410' }}>{totEtichette}</div>
          <div style={{ fontSize: 10, color: '#B0A89E' }}>etich.</div>
        </div>
        <div style={{ textAlign: 'center', flexShrink: 0 }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: '#1C1410' }}>{totBottiglie}</div>
          <div style={{ fontSize: 10, color: '#B0A89E' }}>bott.</div>
        </div>
        {valoreEur > 0 && (
          <div style={{ textAlign: 'center', flexShrink: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#2D6A4F' }}>€{valoreEur.toFixed(0)}</div>
            <div style={{ fontSize: 10, color: '#B0A89E' }}>valore</div>
          </div>
        )}
        <span style={{ fontSize: 16, color: '#B0A89E', transform: open ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }}>›</span>
      </div>
      {open && (
        <div style={{ padding: '0 12px 14px', borderTop: '1px solid #F0ECE5' }}>
          {regioni.filter(r => byRegione[r]).length > 0 && (
            <div style={{ marginTop: 12, marginBottom: 8 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#2D6A4F', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Regioni presenti ({coperte})</div>
              {regioni.filter(r => byRegione[r]).map(r => (
                <RegioneRow key={r} regione={r} bottiglie={byRegione[r]} onBottigliaClick={onBottigliaClick} />
              ))}
            </div>
          )}
          {regioni.filter(r => !byRegione[r]).length > 0 && (
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#B0A89E', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Da esplorare ({totRegioni - coperte})</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {regioni.filter(r => !byRegione[r]).map(r => (
                  <span key={r} style={{ fontSize: 12, padding: '4px 10px', borderRadius: 100, background: '#F4F1EC', color: '#B0A89E', border: '1px dashed #D6D0C8' }}>{r}</span>
                ))}
              </div>
            </div>
          )}
          {bottigliePaese.filter(b => !b.regione || !regioni.includes(b.regione)).length > 0 && (
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#7A6E65', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Regione non specificata</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 8 }}>
                {bottigliePaese.filter(b => !b.regione || !regioni.includes(b.regione)).map(b => (
                  <MiniCard key={b.id} b={b} onClick={() => onBottigliaClick(b)} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// --- COMPONENTE PRINCIPALE ---
export default function Statistiche({ cantina }) {
  const [vista, setVista] = useState('paesi')
  const [bottSelected, setBottSelected] = useState(null)
  const totBottiglie = cantina.reduce((s, b) => s + (b.quantita || 0), 0)
  const valoreTotale = cantina.reduce((s, b) => s + (b.prezzo_acquisto || 0) * (b.quantita || 0), 0)
  const paesiPresenti = new Set(cantina.map(b => b.paese).filter(Boolean))
  const paesiCoperti = Object.keys(PAESI_REGIONI).filter(p => paesiPresenti.has(p)).length
  const totPaesi = Object.keys(PAESI_REGIONI).length
  const tipologiePresenti = new Set(cantina.map(b => b.tipologia).filter(Boolean))
  const tipologieCoperte = [...tipologiePresenti].filter(t => TIPOLOGIE.includes(t)).length
  const byPaese = useMemo(() => {
    const m = {}
    cantina.forEach(b => { const p = b.paese || 'Altro'; if (!m[p]) m[p] = []; m[p].push(b) })
    return m
  }, [cantina])
  const fmtVal = v => v > 0 ? '€ ' + v.toLocaleString('it-IT', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) : '—'
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
        {[['🍾','Etichette',cantina.length],['📦','Bottiglie',totBottiglie],['🌍','Paesi coperti',paesiCoperti+'/'+totPaesi],['🎨','Tipologie',tipologieCoperte+'/7']].map(([ico,l,v]) => (
          <div key={l} style={{ ...S.card, textAlign: 'center', padding: '14px 10px' }}>
            <div style={{ fontSize: 20, marginBottom: 3 }}>{ico}</div>
            <div style={{ fontSize: 22, fontWeight: 700, fontFamily: 'Playfair Display, serif', color: '#1C1410' }}>{v}</div>
            <div style={{ fontSize: 11, color: '#7A6E65', marginTop: 2 }}>{l}</div>
          </div>
        ))}
      </div>
      <div style={{ ...S.card, textAlign: 'center', padding: '16px', marginBottom: 20, background: valoreTotale > 0 ? '#F5EFE0' : '#fff', border: valoreTotale > 0 ? '1px solid #C8992A' : '1px solid #E2DDD6' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#7A6E65', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Valore cantina</div>
        <div style={{ fontSize: 30, fontWeight: 700, fontFamily: 'Playfair Display, serif', color: valoreTotale > 0 ? '#854F0B' : '#B0A89E' }}>{fmtVal(valoreTotale)}</div>
        {valoreTotale === 0 && <div style={{ fontSize: 12, color: '#B0A89E', marginTop: 4 }}>Aggiungi il prezzo di acquisto alle bottiglie</div>}
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {[['paesi','🌍 Per paese'],['tipologie','🎨 Per tipologia']].map(([k,l]) => (
          <button key={k} onClick={() => setVista(k)} style={{ flex: 1, padding: '9px 0', borderRadius: 100, border: '1.5px solid', borderColor: vista === k ? '#7B1E2E' : '#E2DDD6', background: vista === k ? '#7B1E2E' : '#fff', color: vista === k ? '#fff' : '#7A6E65', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>{l}</button>
        ))}
      </div>
      {vista === 'paesi' && (
        <div>
          {Object.entries(PAESI_REGIONI).map(([paese, regioni]) => (
            <PaeseSection key={paese} paese={paese} regioni={regioni} bottigliePaese={byPaese[paese] || []} onBottigliaClick={setBottSelected} />
          ))}
          {Object.entries(byPaese).filter(([p]) => !PAESI_REGIONI[p] && p !== 'Altro').map(([paese, bott]) => (
            <div key={paese} style={{ ...S.card, marginBottom: 12 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#7A6E65', marginBottom: 8 }}>{paese || 'Paese non specificato'}</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 8 }}>
                {bott.map(b => <MiniCard key={b.id} b={b} onClick={() => setBottSelected(b)} />)}
              </div>
            </div>
          ))}
        </div>
      )}
      {vista === 'tipologie' && <VistaTipologie cantina={cantina} />}
      <BottigliaSheet b={bottSelected} onClose={() => setBottSelected(null)} />
    </div>
  )
}

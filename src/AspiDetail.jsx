// Visualizzazione sola lettura di una scheda ASPI salvata

const S = {
  secBox: { background: '#fff', border: '1px solid #E2DDD6', borderRadius: 14, padding: 16, marginBottom: 14 },
  secTit: { fontSize: 11, fontWeight: 700, color: '#7B1E2E', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 12, paddingBottom: 8, borderBottom: '1px solid #F0ECE5' },
  subTit: { fontSize: 10, fontWeight: 600, color: '#B0A89E', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, marginTop: 12 },
}

function Row({ label, value }) {
  if (!value || value === '') return null
  return (
    <div style={{ display: 'flex', gap: 12, padding: '8px 0', borderBottom: '1px solid #F9F7F4' }}>
      <span style={{ fontSize: 12, color: '#7A6E65', minWidth: 140, flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: 13, color: '#1C1410', lineHeight: 1.5, flex: 1 }}>{value}</span>
    </div>
  )
}

function Pills({ label, values }) {
  if (!values || values.length === 0) return null
  return (
    <div style={{ padding: '8px 0', borderBottom: '1px solid #F9F7F4' }}>
      <span style={{ fontSize: 12, color: '#7A6E65', display: 'block', marginBottom: 6 }}>{label}</span>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {values.map(v => (
          <span key={v} style={{ fontSize: 12, background: '#F5EFE0', color: '#7B1E2E', padding: '3px 10px', borderRadius: 100, fontWeight: 500 }}>{v}</span>
        ))}
      </div>
    </div>
  )
}

export default function AspiDetail({ scheda: s }) {
  const stars = s.voto > 0 ? '⭐️'.repeat(s.voto) : '—'
  const votoLabel = ['','Ordinario','Discreto','Buono','Ottimo','Eccellente'][s.voto] || ''

  // Raccoglie tutte le categorie bouquet selezionate
  const allBouquetCat = Object.entries(s.bouquetCategorie || {}).flatMap(([tip, cats]) =>
    (cats || []).map(c => `${c} (${tip})`)
  )

  return (
    <div>
      {/* Header */}
      <div style={S.secBox}>
        <div style={S.secTit}>Dati del vino</div>
        <div style={{ background: '#F5EFE0', borderRadius: 8, padding: '8px 12px', marginBottom: 12, fontSize: 13, color: '#7B1E2E', fontWeight: 500 }}>
          📅 {s.data} &nbsp;·&nbsp; {stars} {votoLabel}
        </div>
        <Row label="Nome del vino" value={s.nomeVino} />
        <Row label="Cantina" value={s.cantina} />
        <Row label="Denominazione" value={s.denominazione} />
        <Row label="Annata" value={s.annata} />
        <Row label="Tipologia" value={s.tipologia} />
        <Row label="Temperatura" value={s.temperatura} />
        <Row label="Paese" value={s.paese} />
        <Row label="Regione" value={s.regione} />
      </div>

      {/* Visivo */}
      <div style={S.secBox}>
        <div style={S.secTit}>Esame Visivo</div>
        <Row label="Limpidezza" value={s.limpidezza} />
        <Row label="Trasparenza" value={s.trasparenza} />
        <Row label="Tonalità / Intensità" value={s.tonalita} />
        <Row label="Riflessi / Sfumature" value={s.riflessi} />
        <Row label="Fluidità / Consistenza" value={s.fluidita} />
        <Row label="Archetti" value={s.archetti} />
        {s.spuma && <>
          <div style={S.subTit}>Effervescenza</div>
          <Row label="Spuma" value={s.spuma} />
          <Row label="Grana bollicine" value={s.granaBollicine} />
          <Row label="Numero bollicine" value={s.numeroBollicine} />
          <Row label="Persistenza bollicine" value={s.persistenzaBollicine} />
        </>}
      </div>

      {/* Olfattivo */}
      <div style={S.secBox}>
        <div style={S.secTit}>Esame Olfattivo</div>
        <Row label="Intensità" value={s.intensitaOlf} />
        <Pills label="Bouquet — Tipologia" values={s.bouquetTipologie} />
        <Pills label="Aromi identificati" values={allBouquetCat} />
        <Row label="Riconoscimento aromi" value={s.riconoscimentoAromi} />
        <Row label="Complessità" value={s.complessita} />
        <Row label="Qualità" value={s.qualitaOlf} />
      </div>

      {/* Gustativo */}
      <div style={S.secBox}>
        <div style={S.secTit}>Esame Gustativo</div>
        <div style={S.subTit}>Sensazioni Morbide</div>
        <Row label="Zuccheri" value={s.zuccheri} />
        <Row label="Alcoli" value={s.alcoli} />
        <Row label="Polialcoli" value={s.polialcoli} />
        <div style={S.subTit}>Sensazioni Dure</div>
        <Row label="Acidi" value={s.acidi} />
        <Row label="Tannini" value={s.tannini} />
        <Row label="Sali minerali" value={s.saliMinerali} />
        <div style={S.subTit}>Struttura e Finale</div>
        <Row label="Struttura generale" value={s.struttura} />
        <Row label="Equilibrio" value={s.equilibrio} />
        <Row label="Intensità gustativa" value={s.intensitaGust} />
        <Row label="Persistenza P.A.I." value={s.persistenzaGust} />
        <Row label="Qualità gustativa" value={s.qualitaGust} />
      </div>

      {/* Finali */}
      <div style={S.secBox}>
        <div style={S.secTit}>Considerazioni Finali</div>
        <Row label="Armonia" value={s.armonia} />
        <Row label="Stato evolutivo" value={s.statoEvolutivo} />
        <Row label="Potenzialità invecchiamento" value={s.potenzialitaInv} />
        <Row label="Riconoscimento vitigno/i" value={s.riconoscimentoVitigno} />
        <Row label="Vino da abbinare a" value={s.abbinare} />
        <Row label="Temperatura di servizio" value={s.tempServizio} />
        <Row label="Forma del calice" value={s.formaCalice} />
        <Row label="Rapporto qualità/prezzo" value={s.rapportoQP} />
      </div>

      {/* Note */}
      {s.note && (
        <div style={S.secBox}>
          <div style={S.secTit}>Note</div>
          <p style={{ fontSize: 14, color: '#1C1410', lineHeight: 1.7 }}>{s.note}</p>
        </div>
      )}

      {/* Foto */}
      {s.foto_url && (
        <div style={S.secBox}>
          <div style={S.secTit}>Foto</div>
          <img src={s.foto_url} alt="Foto degustazione" style={{ width: '100%', maxHeight: 280, objectFit: 'cover', borderRadius: 10, border: '1px solid #E2DDD6' }} />
        </div>
      )}
    </div>
  )
}

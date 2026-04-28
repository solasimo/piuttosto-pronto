import { useState } from 'react'

// ─── Costanti ASPI ────────────────────────────────────────────────────────────

export const TIPOLOGIE = ['Rosso', 'Bianco', 'Rosato', 'Orange', 'Bollicine', 'Dolce', 'Fortificato']

const TEMP_SERVIZIO = ['6-8°C','8-10°C','10-12°C','12-14°C','14-16°C','16-18°C','18-20°C']

const VISIVO = {
  limpidezza: ['Velato','Limpido','Molto limpido','Cristallino','Brillante'],
  trasparenza: ['Molto trasparente','Poco trasparente','Profondo'],
  tonalita: {
    Rosso:     ['Rosso porpora','Rosso rubino','Rosso granato','Rosso aranciato'],
    Rosato:    ['Rosa salmone','Rosa buccia di cipolla','Rosa cerasuolo','Rosa chiaretto'],
    Bianco:    ['Giallo verdolino','Giallo paglierino','Giallo oro / dorato','Giallo ambrato'],
    Orange:    ['Giallo verdolino','Giallo paglierino','Giallo oro / dorato','Giallo ambrato'],
    Bollicine: ['Giallo verdolino','Giallo paglierino','Giallo oro / dorato','Giallo ambrato'],
    Dolce:     ['Giallo verdolino','Giallo paglierino','Giallo oro / dorato','Giallo ambrato'],
    Fortificato:['Rosso porpora','Rosso rubino','Rosso granato','Rosso aranciato'],
  },
  riflessi: {
    Rosso:      ['Purpureo/inchiostro','Violaceo','Granato/aranciato','Mattonato'],
    Rosato:     ['Rosa tenue','Ramato','Rosa vivace','Rosa violaceo'],
    Bianco:     ['Verdognolo','Grigio verde','Paglia chiaro','Oro antico/ambrato','Topazio/oro verde'],
    Orange:     ['Verdognolo','Grigio verde','Paglia chiaro','Oro antico/ambrato','Topazio/oro verde'],
    Bollicine:  ['Verdognolo','Grigio verde','Paglia chiaro','Oro antico/ambrato','Topazio/oro verde'],
    Dolce:      ['Verdognolo','Grigio verde','Paglia chiaro','Oro antico/ambrato','Topazio/oro verde'],
    Fortificato:['Purpureo/inchiostro','Violaceo','Granato/aranciato','Mattonato'],
  },
  fluidita: ['Molto fluido','Scorrevole','Piuttosto consistente','Consistente','Denso'],
  archetti: ['Assenti','Stretti','Medi','Ampi'],
  // Effervescenza — solo Bollicine
  spuma: ['Assente','Evanescente','A collaretto','Abbondante'],
  granaBollicine: ['Grossolane','Medie','Molto fini','Finissime'],
  numeroBollicine: ['Scarse','Piuttosto numerose','Numerose','Molto numerose'],
  persistenzaBollicine: ['Limitata','Piuttosto persistente','Persistente','Molto persistente'],
}

const OLFATTIVO = {
  intensita: ['Sfuggente','Poco intenso','Piuttosto intenso','Intenso','Penetrante'],
  bouquetTipologie: ['Primario','Secondario','Terziario'],
  bouquetCategorie: {
    Primario: ['Agrumi','Frutta fresca','Frutti di bosco','Frutta esotica','Fiori','Erbe aromatiche','Erbaceo/vegetali','Legni aromatici','Minerali'],
    Secondario: ['Vinoso','Da malolattica','Da lieviti'],
    Terziario: ['Speziato','Tostato','Animale','Confetture','Frutta secca','Sottobosco'],
  },
  complessita: ['Semplice','Complesso','Ampio'],
  qualita: ['Comune','Poco fine','Piuttosto fine','Fine','Eccellente'],
}

const GUSTATIVO = {
  zuccheri: ['Secco','Abboccato','Amabile','Dolce','Stucchevole'],
  alcoli: ['Leggero','Appena caldo','Piuttosto caldo','Caldo','Alcolico'],
  polialcoli: ['Spigoloso','Poco spigoloso','Piuttosto morbido','Morbido','Pastoso'],
  acidi: ['Piatto','Leggermente fresco','Piuttosto fresco','Fresco','Acidulo'],
  tannini: ['Molle','Leggermente tannico','Piuttosto tannico','Tannico','Astringente'],
  saliMinerali: ['Scipito','Leggermente sapido','Piuttosto sapido','Sapido','Salato'],
  struttura: ['Magro','Leggero','Di corpo','Robusto','Pesante'],
  equilibrio: ['Scarsamente equilibrato','Piuttosto equilibrato','Equilibrato'],
  intensitaGustativa: ['Sfuggente','Poco intenso','Piuttosto intenso','Intenso','Penetrante'],
  persistenza: ['Molto breve','Di media durata','Lunga','Molto lunga'],
  qualitaGustativa: ['Comune','Poco fine','Piuttosto fine','Fine','Eccellente'],
}

const FINALI = {
  armonia: ['Disarmonico','Piuttosto armonico','Armonico'],
  statoEvolutivo: ['Immaturo','Giovane','Pronto','Maturo','Vecchio'],
  formaCalice: ['Tulipano','Flûte','Ballon','Tumbler'],
  rapportoQP: ['Scarso','Corretto','Equilibrato','Eccellente'],
}

// ─── Stato iniziale ───────────────────────────────────────────────────────────

export const ASPI_EMPTY = {
  // Header
  temperatura: '', denominazione: '', annata: '', nomeVino: '', tipologia: '', cantina: '',
  // Visivo
  limpidezza: '', trasparenza: '', tonalita: '', riflessi: '', fluidita: '', archetti: '',
  spuma: '', granaBollicine: '', numeroBollicine: '', persistenzaBollicine: '',
  // Olfattivo
  intensitaOlf: '', bouquetTipologie: [], bouquetCategorie: {}, riconoscimentoAromi: '',
  complessita: '', qualitaOlf: '',
  // Gustativo
  zuccheri: '', alcoli: '', polialcoli: '',
  acidi: '', tannini: '', saliMinerali: '',
  struttura: '', equilibrio: '', intensitaGust: '', persistenzaGust: '', qualitaGust: '',
  // Finali
  armonia: '', statoEvolutivo: '', potenzialitaInv: '', riconoscimentoVitigno: '',
  abbinare: '', tempServizio: '', formaCalice: '', rapportoQP: '',
  // Extra
  note: '', voto: 0,
}

// ─── Stili condivisi ──────────────────────────────────────────────────────────

const S = {
  inp: {
    width: '100%', padding: '11px 14px', border: '1.5px solid #E2DDD6',
    borderRadius: 10, fontSize: 15, background: '#fff', color: '#1C1410',
    WebkitAppearance: 'none', appearance: 'none',
  },
  lbl: { display: 'block', fontSize: 12, fontWeight: 500, color: '#7A6E65', marginBottom: 5 },
  secBox: { background: '#fff', border: '1px solid #E2DDD6', borderRadius: 14, padding: 16, marginBottom: 16 },
  secTit: { fontSize: 11, fontWeight: 700, color: '#7B1E2E', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 14, paddingBottom: 8, borderBottom: '1px solid #F0ECE5' },
  subTit: { fontSize: 10, fontWeight: 600, color: '#B0A89E', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10, marginTop: 14 },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  full: { gridColumn: '1/-1' },
}

// ─── Componenti atomici ───────────────────────────────────────────────────────

function Field({ label, children, full }) {
  return (
    <div style={full ? S.full : {}}>
      {label && <span style={S.lbl}>{label}</span>}
      {children}
    </div>
  )
}

function Sel({ label, value, onChange, options, placeholder, full }) {
  return (
    <Field label={label} full={full}>
      <select style={S.inp} value={value} onChange={e => onChange(e.target.value)}>
        <option value="">{placeholder || '— seleziona —'}</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </Field>
  )
}

function Inp({ label, value, onChange, placeholder, full }) {
  return (
    <Field label={label} full={full}>
      <input style={S.inp} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder || ''} />
    </Field>
  )
}

function Textarea({ label, value, onChange, placeholder }) {
  return (
    <Field label={label} full>
      <textarea
        style={{ ...S.inp, minHeight: 80, resize: 'vertical', lineHeight: 1.5 }}
        value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder || ''}
      />
    </Field>
  )
}

// Multi-select a pill per bouquet
function PillSelect({ label, selected, onChange, options }) {
  const toggle = opt => {
    if (selected.includes(opt)) onChange(selected.filter(x => x !== opt))
    else onChange([...selected, opt])
  }
  return (
    <Field label={label} full>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 2 }}>
        {options.map(o => (
          <button key={o} type="button" onClick={() => toggle(o)} style={{
            padding: '6px 14px', borderRadius: 100, border: '1.5px solid',
            borderColor: selected.includes(o) ? '#7B1E2E' : '#E2DDD6',
            background: selected.includes(o) ? '#7B1E2E' : '#fff',
            color: selected.includes(o) ? '#fff' : '#7A6E65',
            fontSize: 13, fontWeight: 500, cursor: 'pointer',
          }}>{o}</button>
        ))}
      </div>
    </Field>
  )
}

// Stelle voto
function StarRating({ value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 8, justifyContent: 'center', padding: '8px 0' }}>
      {[1,2,3,4,5].map(n => (
        <button key={n} type="button" onClick={() => onChange(n === value ? 0 : n)} style={{
          fontSize: 32, background: 'none', border: 'none', cursor: 'pointer',
          opacity: n <= value ? 1 : 0.25, transition: 'opacity 0.15s',
        }}>⭐️</button>
      ))}
    </div>
  )
}

// ─── FORM PRINCIPALE ──────────────────────────────────────────────────────────

export default function AspiForm({ initial = {}, onSave, oggi }) {
  const [f, setF] = useState({ ...ASPI_EMPTY, ...initial })
  const s = k => v => setF(p => ({ ...p, [k]: v }))

  const isBollicine = f.tipologia === 'Bollicine'
  const hasTannini = ['Rosso','Rosato','Orange','Dolce','Fortificato'].includes(f.tipologia)

  // Quando cambia tipologia, reset campi dipendenti
  const onTipologiaChange = v => {
    setF(p => ({ ...p, tipologia: v, tonalita: '', riflessi: '' }))
  }

  // Gestione categorie bouquet per tipologia selezionata
  const onBouquetTipologiaChange = (newTipologie) => {
    setF(p => {
      const newCat = { ...p.bouquetCategorie }
      // Rimuovi categorie di tipologie deselezionate
      Object.keys(newCat).forEach(k => {
        if (!newTipologie.includes(k)) delete newCat[k]
      })
      return { ...p, bouquetTipologie: newTipologie, bouquetCategorie: newCat }
    })
  }

  const onBouquetCatChange = (tipologia, cats) => {
    setF(p => ({ ...p, bouquetCategorie: { ...p.bouquetCategorie, [tipologia]: cats } }))
  }

  return (
    <div>
      {/* ── HEADER ── */}
      <div style={S.secBox}>
        <div style={S.secTit}>Dati del vino</div>
        {oggi && (
          <div style={{ background: '#F5EFE0', borderRadius: 8, padding: '8px 12px', marginBottom: 14, fontSize: 13, color: '#7B1E2E', fontWeight: 500 }}>
            📅 {oggi}
          </div>
        )}
        <div style={S.grid2}>
          <Inp label="Nome del vino" value={f.nomeVino} onChange={s('nomeVino')} placeholder="es. Barolo Cannubi" />
          <Inp label="Cantina" value={f.cantina} onChange={s('cantina')} placeholder="es. Ceretto" />
          <Inp label="Denominazione" value={f.denominazione} onChange={s('denominazione')} placeholder="es. Barolo DOCG" />
          <Inp label="Annata" value={f.annata} onChange={s('annata')} placeholder="es. 2018" />
          <Field label="Tipologia">
            <select style={S.inp} value={f.tipologia} onChange={e => onTipologiaChange(e.target.value)}>
              <option value="">— seleziona —</option>
              {TIPOLOGIE.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </Field>
          <Sel label="Temperatura di servizio" value={f.temperatura} onChange={s('temperatura')} options={TEMP_SERVIZIO} />
        </div>
      </div>

      {/* ── ESAME VISIVO ── */}
      <div style={S.secBox}>
        <div style={S.secTit}>Esame Visivo</div>
        <div style={S.grid2}>
          <Sel label="Limpidezza" value={f.limpidezza} onChange={s('limpidezza')} options={VISIVO.limpidezza} />
          <Sel label="Trasparenza" value={f.trasparenza} onChange={s('trasparenza')} options={VISIVO.trasparenza} />
          <Sel
            label="Tonalità / Intensità"
            value={f.tonalita}
            onChange={s('tonalita')}
            options={f.tipologia ? VISIVO.tonalita[f.tipologia] || [] : []}
            placeholder={f.tipologia ? '— seleziona —' : '— prima scegli tipologia —'}
          />
          <Sel
            label="Riflessi / Sfumature"
            value={f.riflessi}
            onChange={s('riflessi')}
            options={f.tipologia ? VISIVO.riflessi[f.tipologia] || [] : []}
            placeholder={f.tipologia ? '— seleziona —' : '— prima scegli tipologia —'}
          />

          {/* Fluidità e Archetti: nascosti per Bollicine */}
          {!isBollicine && <>
            <Sel label="Fluidità / Consistenza" value={f.fluidita} onChange={s('fluidita')} options={VISIVO.fluidita} />
            <Sel label="Archetti" value={f.archetti} onChange={s('archetti')} options={VISIVO.archetti} />
          </>}

          {/* Effervescenza: solo Bollicine */}
          {isBollicine && <>
            <div style={{ ...S.full }}>
              <div style={{ ...S.subTit, marginTop: 4 }}>Effervescenza</div>
              <div style={S.grid2}>
                <Sel label="Spuma" value={f.spuma} onChange={s('spuma')} options={VISIVO.spuma} />
                <Sel label="Grana bollicine" value={f.granaBollicine} onChange={s('granaBollicine')} options={VISIVO.granaBollicine} />
                <Sel label="Numero bollicine" value={f.numeroBollicine} onChange={s('numeroBollicine')} options={VISIVO.numeroBollicine} />
                <Sel label="Persistenza bollicine" value={f.persistenzaBollicine} onChange={s('persistenzaBollicine')} options={VISIVO.persistenzaBollicine} />
              </div>
            </div>
          </>}
        </div>
      </div>

      {/* ── ESAME OLFATTIVO ── */}
      <div style={S.secBox}>
        <div style={S.secTit}>Esame Olfattivo</div>
        <div style={S.grid2}>
          <Sel label="Intensità" value={f.intensitaOlf} onChange={s('intensitaOlf')} options={OLFATTIVO.intensita} full />

          {/* Bouquet multi-select */}
          <PillSelect
            label="Bouquet — Tipologia (seleziona una o più)"
            selected={f.bouquetTipologie}
            onChange={onBouquetTipologiaChange}
            options={OLFATTIVO.bouquetTipologie}
          />

          {/* Categorie condizionali per ogni tipologia selezionata */}
          {f.bouquetTipologie.map(tip => (
            <div key={tip} style={S.full}>
              <div style={{ ...S.subTit, color: '#7B1E2E', marginTop: 8 }}>
                {tip === 'Primario' ? 'Primario — Da uva / terroir' :
                 tip === 'Secondario' ? 'Secondario — Da operazioni di cantina' :
                 'Terziario — Da invecchiamento'}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {OLFATTIVO.bouquetCategorie[tip].map(cat => {
                  const sel = (f.bouquetCategorie[tip] || []).includes(cat)
                  return (
                    <button key={cat} type="button"
                      onClick={() => {
                        const curr = f.bouquetCategorie[tip] || []
                        onBouquetCatChange(tip, sel ? curr.filter(x => x !== cat) : [...curr, cat])
                      }}
                      style={{ padding: '5px 12px', borderRadius: 100, border: '1.5px solid', borderColor: sel ? '#7B1E2E' : '#E2DDD6', background: sel ? '#F5EFE0' : '#fff', color: sel ? '#7B1E2E' : '#7A6E65', fontSize: 12, fontWeight: sel ? 600 : 400, cursor: 'pointer' }}>
                      {cat}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}

          <Textarea label="Riconoscimento degli aromi" value={f.riconoscimentoAromi} onChange={s('riconoscimentoAromi')} placeholder="es. rosa, lampone, pepe nero, tabacco..." />
          <Sel label="Complessità" value={f.complessita} onChange={s('complessita')} options={OLFATTIVO.complessita} />
          <Sel label="Qualità" value={f.qualitaOlf} onChange={s('qualitaOlf')} options={OLFATTIVO.qualita} />
        </div>
      </div>

      {/* ── ESAME GUSTATIVO ── */}
      <div style={S.secBox}>
        <div style={S.secTit}>Esame Gustativo</div>

        <div style={S.subTit}>Sensazioni Morbide</div>
        <div style={{ ...S.grid2, marginBottom: 16 }}>
          <Sel label="Zuccheri" value={f.zuccheri} onChange={s('zuccheri')} options={GUSTATIVO.zuccheri} />
          <Sel label="Alcoli" value={f.alcoli} onChange={s('alcoli')} options={GUSTATIVO.alcoli} />
          <Sel label="Polialcoli" value={f.polialcoli} onChange={s('polialcoli')} options={GUSTATIVO.polialcoli} full />
        </div>

        <div style={{ height: 1, background: '#F0ECE5', marginBottom: 14 }} />

        <div style={S.subTit}>Sensazioni Dure</div>
        <div style={{ ...S.grid2, marginBottom: 16 }}>
          <Sel label="Acidi" value={f.acidi} onChange={s('acidi')} options={GUSTATIVO.acidi} />
          {hasTannini && <Sel label="Tannini" value={f.tannini} onChange={s('tannini')} options={GUSTATIVO.tannini} />}
          <Sel label="Sali minerali" value={f.saliMinerali} onChange={s('saliMinerali')} options={GUSTATIVO.saliMinerali} full={!hasTannini} />
        </div>

        <div style={{ height: 1, background: '#F0ECE5', marginBottom: 14 }} />

        <div style={S.subTit}>Struttura e Finale</div>
        <div style={S.grid2}>
          <Sel label="Struttura generale" value={f.struttura} onChange={s('struttura')} options={GUSTATIVO.struttura} />
          <Sel label="Equilibrio" value={f.equilibrio} onChange={s('equilibrio')} options={GUSTATIVO.equilibrio} />
          <Sel label="Intensità gustativa" value={f.intensitaGust} onChange={s('intensitaGust')} options={GUSTATIVO.intensitaGustativa} />
          <Sel label="Persistenza P.A.I." value={f.persistenzaGust} onChange={s('persistenzaGust')} options={GUSTATIVO.persistenza} />
          <Sel label="Qualità gustativa" value={f.qualitaGust} onChange={s('qualitaGust')} options={GUSTATIVO.qualitaGustativa} full />
        </div>
      </div>

      {/* ── CONSIDERAZIONI FINALI ── */}
      <div style={S.secBox}>
        <div style={S.secTit}>Considerazioni Finali</div>
        <div style={S.grid2}>
          <Sel label="Armonia" value={f.armonia} onChange={s('armonia')} options={FINALI.armonia} />
          <Sel label="Stato evolutivo" value={f.statoEvolutivo} onChange={s('statoEvolutivo')} options={FINALI.statoEvolutivo} />
          <Inp label="Potenzialità d'invecchiamento" value={f.potenzialitaInv} onChange={s('potenzialitaInv')} placeholder="es. 5-8 anni" />
          <Inp label="Riconoscimento vitigno/i" value={f.riconoscimentoVitigno} onChange={s('riconoscimentoVitigno')} placeholder="es. Nebbiolo" />
          <Inp label="Vino da abbinare a" value={f.abbinare} onChange={s('abbinare')} placeholder="es. selvaggina, tartufo" full />
          <Sel label="Temperatura di servizio consigliata" value={f.tempServizio} onChange={s('tempServizio')} options={TEMP_SERVIZIO} />
          <Sel label="Forma del calice" value={f.formaCalice} onChange={s('formaCalice')} options={FINALI.formaCalice} />
          <Sel label="Rapporto qualità/prezzo" value={f.rapportoQP} onChange={s('rapportoQP')} options={FINALI.rapportoQP} full />
        </div>
      </div>

      {/* ── NOTE ── */}
      <div style={S.secBox}>
        <div style={S.secTit}>Note</div>
        <Textarea value={f.note} onChange={s('note')} placeholder="Impressioni libere, contesto della degustazione, ricordi..." />
      </div>

      {/* ── VOTO ── */}
      <div style={{ ...S.secBox, textAlign: 'center' }}>
        <div style={S.secTit}>Voto personale</div>
        <StarRating value={f.voto} onChange={v => setF(p => ({ ...p, voto: v }))} />
        <div style={{ fontSize: 13, color: '#B0A89E', marginTop: 4 }}>
          {f.voto === 0 ? 'Non valutato' : ['','Ordinario','Discreto','Buono','Ottimo','Eccellente'][f.voto]}
        </div>
      </div>

      {/* ── SALVA ── */}
      <button
        onClick={() => onSave(f)}
        style={{ width: '100%', padding: 16, background: '#7B1E2E', color: '#fff', border: 'none', borderRadius: 12, fontSize: 16, fontWeight: 700, cursor: 'pointer', marginBottom: 8, letterSpacing: '0.3px' }}>
        Salva Scheda ASPI
      </button>
    </div>
  )
}

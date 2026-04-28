# Piuttosto Pronto 🍷 — La mia cantina

## Avvio rapido

### 1. Prerequisiti
```
node -v   # deve mostrare v18.x.x o superiore
```

### 2. Installa le dipendenze (solo la prima volta)
```
cd piuttosto-pronto
npm install
```

### 3. Avvia
```
npm run dev
```
Apri il browser su → **http://localhost:5173**

---

## Come funziona la persistenza

I dati sono salvati nel browser tramite **IndexedDB** (gestito da **Dexie.js**).

| Azione | Cosa viene scritto nel DB |
|--------|--------------------------|
| Aggiungi bottiglia | Nuova riga in `cantina` |
| Modifica quantità (+ / −) | Aggiornamento riga esistente |
| Salva scheda ASPI | Nuova riga in `archivio` + decremento quantità |

I dati sopravvivono a ricarica pagina, chiusura browser, riavvio PC.
Vengono persi solo cancellando i dati del sito dal browser, o in navigazione privata.

---

## Schema database

```
PiuttostoProntoDB
├── cantina   (id, nome, cantina, tipologia, paese, regione, vitigno,
│              anno, valutazione, prezzo, invecchiamento, temp, quantita, note)
└── archivio  (id, nome, data, voto,
               visiva{}, olfattiva{}, gustativa{}, conclusioni{})
```

---

## Comandi

```bash
npm run dev      # sviluppo su http://localhost:5173
npm run build    # build di produzione in /dist
npm run preview  # anteprima build
```

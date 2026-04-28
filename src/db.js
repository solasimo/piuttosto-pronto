import Dexie from 'dexie';

// Definizione del database e delle sue tabelle
export const db = new Dexie('PiuttostoProntoDB');

db.version(1).stores({
  // Indici: id (auto-increment), + campi su cui vogliamo cercare/filtrare
  cantina:  '++id, nome, tipologia, regione, paese, vitigno, anno, prezzo, valutazione',
  archivio: '++id, nome, data, voto',
});

// ─── Funzioni CANTINA ────────────────────────────────────────────────────────

export async function getBottiglie() {
  return db.cantina.toArray();
}

export async function addBottiglia(bottiglia) {
  // Restituisce l'id generato automaticamente
  return db.cantina.add(bottiglia);
}

export async function updateBottiglia(id, changes) {
  return db.cantina.update(id, changes);
}

export async function deleteBottiglia(id) {
  return db.cantina.delete(id);
}

// ─── Funzioni ARCHIVIO ───────────────────────────────────────────────────────

export async function getSchede() {
  // Ordinate dalla più recente
  return db.archivio.orderBy('id').reverse().toArray();
}

export async function addScheda(scheda) {
  return db.archivio.add(scheda);
}

// ─── Seed dati iniziali (solo al primo avvio) ────────────────────────────────

const DATI_INIZIALI = [
  { nome: 'Barolo Bricco Rocche', cantina: 'Ceretto', tipologia: 'Rosso', paese: 'Italia', regione: 'Piemonte', vitigno: 'Nebbiolo', anno: 2016, valutazione: 5, prezzo: 4, invecchiamento: 20, temp: '16-18°C', note: 'Grande annata', quantita: 3 },
  { nome: 'Brunello di Montalcino', cantina: 'Biondi Santi', tipologia: 'Rosso', paese: 'Italia', regione: 'Toscana', vitigno: 'Sangiovese grosso', anno: 2017, valutazione: 4, prezzo: 5, invecchiamento: 25, temp: '16-18°C', note: 'Elegante e longevo', quantita: 2 },
  { nome: 'Vermentino di Gallura', cantina: 'Capichera', tipologia: 'Bianco', paese: 'Italia', regione: 'Sardegna', vitigno: 'Vermentino', anno: 2022, valutazione: 4, prezzo: 2, invecchiamento: 3, temp: '10-12°C', note: 'Fresco e aromatico', quantita: 6 },
  { nome: 'Franciacorta Satèn', cantina: 'Bellavista', tipologia: 'Bollicine', paese: 'Italia', regione: 'Lombardia', vitigno: 'Chardonnay', anno: 2020, valutazione: 4, prezzo: 3, invecchiamento: 5, temp: '6-8°C', note: 'Perlage finissimo', quantita: 4 },
  { nome: 'Amarone della Valpolicella', cantina: 'Allegrini', tipologia: 'Rosso', paese: 'Italia', regione: 'Veneto', vitigno: 'Corvina', anno: 2015, valutazione: 5, prezzo: 4, invecchiamento: 20, temp: '16-18°C', note: 'Classico e potente', quantita: 1 },
  { nome: 'Etna Bianco', cantina: 'Benanti', tipologia: 'Bianco', paese: 'Italia', regione: 'Sicilia', vitigno: 'Carricante', anno: 2021, valutazione: 3, prezzo: 2, invecchiamento: 6, temp: '10-12°C', note: 'Vulcanico, minerale', quantita: 5 },
  { nome: 'Prosecco Superiore DOCG', cantina: 'Bisol', tipologia: 'Bollicine', paese: 'Italia', regione: 'Veneto', vitigno: 'Glera', anno: 2023, valutazione: 3, prezzo: 1, invecchiamento: 2, temp: '6-8°C', note: 'Aperitivo perfetto', quantita: 8 },
  { nome: 'Chianti Classico Gran Selezione', cantina: 'Fèlsina', tipologia: 'Rosso', paese: 'Italia', regione: 'Toscana', vitigno: 'Sangiovese', anno: 2018, valutazione: 4, prezzo: 3, invecchiamento: 15, temp: '16-18°C', note: 'Strutturato', quantita: 2 },
];

export async function seedIfEmpty() {
  const count = await db.cantina.count();
  if (count === 0) {
    await db.cantina.bulkAdd(DATI_INIZIALI);
  }
}

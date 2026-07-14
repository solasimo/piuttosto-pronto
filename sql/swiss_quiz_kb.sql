-- ================================================================
-- SVIZZERA — KB Quiz Fissa
-- Tabella: swiss_quiz_kb
-- Pool di domande per ogni regione, estratte random (15 per quiz)
-- ================================================================

CREATE TABLE IF NOT EXISTS swiss_quiz_kb (
  id SERIAL PRIMARY KEY,
  regione_id TEXT NOT NULL,  -- VALLESE, VAUD, GINEVRA, TRE_LAGHI, TICINO, SVIZZERA_TEDESCA
  tipo TEXT NOT NULL,        -- multipla, vero_falso, aperta, elenco, classifica_colore, abbinamento, mappa, comuni
  domanda TEXT NOT NULL,
  opzioni JSONB,             -- per multipla: {a,b,c,d}
  corretta JSONB,            -- risposta corretta (testo, lettera, bool, array, oggetto)
  risposta_modello TEXT,     -- per aperta/elenco: risposta di riferimento per la correzione AI
  elementi JSONB,            -- per classifica_colore, abbinamento, mappa
  spiegazione TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Abilita RLS
ALTER TABLE swiss_quiz_kb ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read" ON swiss_quiz_kb FOR SELECT TO authenticated USING (true);

-- ================================================================
-- VALLESE
-- ================================================================
INSERT INTO swiss_quiz_kb (regione_id, tipo, domanda, opzioni, corretta, spiegazione) VALUES

-- MULTIPLA
('VALLESE', 'multipla',
 'Qual è il cantone con la maggiore superficie vitata in Svizzera?',
 '{"a":"Vaud","b":"Ticino","c":"Vallese","d":"Ginevra"}', '"c"',
 'Il Vallese ha 4.800 ha, circa un terzo della produzione vinicola svizzera totale. È il cantone numero 1.'),

('VALLESE', 'multipla',
 'Come si chiama la denominazione protetta del Vallese per il vino 100% da uve Chasselas?',
 '{"a":"Dorin","b":"Fendant","c":"Johannisberg","d":"Dole"}', '"b"',
 'Fendant è la denominazione AOC esclusiva del Vallese per Chasselas 100%. Dorin è il termine usato nel Vaud.'),

('VALLESE', 'multipla',
 'Quante AOC Grand Cru esistono nel Vallese?',
 '{"a":"6","b":"8","c":"10","d":"12"}', '"c"',
 'Il Vallese ha esattamente 10 AOC Grand Cru, tra cui Visperterminen, Chamoson, Vétroz, Sion, Sierre, Salquenen e altre.'),

('VALLESE', 'multipla',
 'Il Vin des Glaciers è prodotto nella Val d\'Anniviers con quale tecnica di affinamento?',
 '{"a":"Metodo classico","b":"Sistema Solera","c":"Macerazione carbonica","d":"Appassimento"}', '"b"',
 'Il Vin des Glaciers usa un sistema equivalente alla Solera spagnola: il vino evaporato viene reintegrato con vino più giovane, conservato in botti di larice.'),

('VALLESE', 'multipla',
 'Qual è il vitigno bianco autoctono più emblematico del Vallese, noto per i vini dolci nobili?',
 '{"a":"Rèze","b":"Chasselas","c":"Petite Arvine","d":"Marsanne"}', '"c"',
 'La Petite Arvine è il vitigno bianco nobile per eccellenza del Vallese, spesso vinificata in versione dolce o da uve appassite per il Grain Noble ConfidenCiel.'),

('VALLESE', 'multipla',
 'Dove si trovano i vigneti più alti d\'Europa nel Vallese?',
 '{"a":"Sierre","b":"Visperterminen","c":"Sion","d":"Martigny"}', '"b"',
 'Visperterminen ospita vigneti fino a 1.100 m s.l.m., tra i più alti d\'Europa. Ha anche la propria AOC Grand Cru.'),

('VALLESE', 'multipla',
 'La Dole Blanche è ottenuta da quali uve vinificate in bianco?',
 '{"a":"Chasselas e Sylvaner","b":"Pinot Noir e Gamay con dominanza Pinot Noir","c":"Petite Arvine e Amigne","d":"Humagne Blanche e Marsanne"}', '"b"',
 'La Dole Blanche è la versione bianca della Dole: stesse uve rosse (Pinot Noir con dominanza + Gamay) ma vinificate in bianco, come un blanc de noirs.'),

-- VERO/FALSO
('VALLESE', 'vero_falso',
 'Il Vallese è la regione più secca della Svizzera, con circa 650 mm di precipitazioni annue.',
 NULL, 'true',
 'Vero. Le Alpi proteggono il Vallese dalle perturbazioni atlantiche, rendendolo il cantone più arido della Svizzera con massima insolazione (2.500 ore/anno).'),

('VALLESE', 'vero_falso',
 'Il Johannisberg del Vallese è un vino prodotto al 100% da uve Riesling.',
 NULL, 'false',
 'Falso. Il Johannisberg è prodotto al 100% da uve Sylvaner, non Riesling. È una denominazione protetta esclusiva del Vallese.'),

('VALLESE', 'vero_falso',
 'Il Grain Noble ConfidenCiel è un\'etichetta di qualità per vini dolci da uve appassite, riservata esclusivamente ai vitigni autoctoni del Vallese.',
 NULL, 'true',
 'Vero. Creato nel 1996 da circa 30 produttori, prevede l\'uso esclusivo di varietà tradizionali del Vallese (Petite Arvine, Ermitage, Amigne, Paien, Malvoisie, Johannisberg) con minimo 130 gradi Oechslé e invecchiamento in legno.'),

('VALLESE', 'vero_falso',
 'La Dole AOC può essere prodotta con qualsiasi assemblaggio di uve rosse del Vallese.',
 NULL, 'false',
 'Falso. La Dole è un AOC del Vallese che richiede almeno il 51% di Pinot Noir e Gamay, con dominanza del Pinot Noir.'),

('VALLESE', 'vero_falso',
 'La Petite Arvine è un vitigno autoctono esclusivo del Vallese, presente anche nelle Valli d\'Aosta e in Savoia.',
 NULL, 'true',
 'Vero. Originaria del Vallese, la Petite Arvine è coltivata anche in Valle d\'Aosta (dove si chiama Prié Blanc in alcuni casi) e in piccole quantità in Savoia, ma il Vallese rimane la sua patria principale.'),

-- APERTA
('VALLESE', 'aperta',
 'Descrivi le caratteristiche climatiche principali del Vallese e il loro impatto sulla viticoltura.',
 NULL, NULL,
 'Clima continentale protetto dalle Alpi. Circa 650 mm di pioggia (il più secco della Svizzera). Massima insolazione: 2.500 ore/anno. Vento Föhn che accelera la maturazione. Rischio di gelate. Viticoltura eroica su terrazze (tablar) con meccanizzazione quasi impossibile. I vini risultano concentrati e strutturati grazie all\'irraggiamento e alla siccità.',
 'Clima continentale protetto dalle Alpi con circa 650 mm di precipitazioni, 2.500 ore di sole, vento Föhn che accelera la maturazione, viticoltura eroica su terrazze (tablar) meccanizzabili quasi impossibili.'),

('VALLESE', 'aperta',
 'Cos\'è il Vin des Glaciers del Vallese e quale tecnica produttiva lo caratterizza?',
 NULL, NULL,
 'Vino bianco ossidativo della Val d\'Anniviers. Assemblaggio di vitigni autoctoni (Rèze, Ermitage/Marsanne, Malvoisie/Pinot Gris, Païen/Heida). Conservato in botti di larice con sistema Solera equivalente a quello spagnolo: il vino che evapora o viene consumato viene rimpiazzato con vino più giovane. Produce un vino di carattere ossidativo unico.',
 'Vino bianco ossidativo della Val d\'Anniviers, conservato in botti di larice con sistema Solera (il vino evaporato viene reintegrato con vino più giovane). Assemblaggio di vitigni autoctoni tra cui Rèze, Ermitage, Malvoisie, Païen.'),

-- ELENCO
('VALLESE', 'elenco',
 'Elenca almeno 5 vitigni bianchi autoctoni del Vallese.',
 NULL, NULL,
 'Petite Arvine, Amigne, Humagne Blanche, Rèze, Lafnetscha, Himbertscha, Savagnin Blanc (Païen/Heida), Pinot Gris (Malvoisie), Marsanne (Ermitage), Muscat.',
 'Petite Arvine, Amigne, Humagne Blanche, Rèze, Lafnetscha, Himbertscha, Savagnin Blanc (Païen/Heida), Pinot Gris (Malvoisie), Marsanne (Ermitage)'),

('VALLESE', 'elenco',
 'Elenca i 10 Grand Cru AOC del Vallese.',
 NULL, NULL,
 'AOC Visperterminen Grand Cru, AOC Saillon Grand Cru, AOC Leytron Grand Cru, AOC Chamoson Grand Cru, AOC Vétroz Grand Cru, AOC Conthey Grand Cru, AOC Ville de Sion Grand Cru, AOC Saint-Léonard Grand Cru, AOC Sierre Grand Cru, AOC Salquenen Grand Cru.',
 'Visperterminen, Saillon, Leytron, Chamoson, Vétroz, Conthey, Sion, Saint-Léonard, Sierre, Salquenen');

INSERT INTO swiss_quiz_kb (regione_id, tipo, domanda, elementi, corretta, spiegazione) VALUES

-- CLASSIFICA_COLORE
('VALLESE', 'classifica_colore',
 'Indica per ogni vitigno se è a bacca bianca o rossa nel Vallese:',
 '["Petite Arvine","Cornalin","Humagne Rouge","Amigne","Rèze","Humagne Blanche","Gamay","Chasselas"]',
 '{"Petite Arvine":"Bianco","Cornalin":"Rosso","Humagne Rouge":"Rosso","Amigne":"Bianco","Rèze":"Bianco","Humagne Blanche":"Bianco","Gamay":"Rosso","Chasselas":"Bianco"}',
 'Il Vallese ha numerosi autoctoni. I rossi autoctoni principali sono Cornalin e Humagne Rouge. I bianchi autoctoni includono Petite Arvine, Amigne, Rèze e Humagne Blanche.'),

-- ABBINAMENTO
('VALLESE', 'abbinamento',
 'Abbina ogni denominazione protetta del Vallese al suo vitigno/blend:',
 '{"sx":["Fendant","Johannisberg","Dole","Dole Blanche","Vin des Glaciers"],"dx":["Chasselas 100%","Sylvaner 100%","Pinot Noir + Gamay (rosso)","Pinot Noir + Gamay (vinificato in bianco)","Assemblaggio autoctoni in botti di larice"]}',
 '{"Fendant":"Chasselas 100%","Johannisberg":"Sylvaner 100%","Dole":"Pinot Noir + Gamay (rosso)","Dole Blanche":"Pinot Noir + Gamay (vinificato in bianco)","Vin des Glaciers":"Assemblaggio autoctoni in botti di larice"}',
 'Le denominazioni protette del Vallese sono strettamente legate ai vitigni: Fendant=Chasselas, Johannisberg=Sylvaner, Dole=Pinot Noir/Gamay rosso, Dole Blanche=idem vinificato in bianco.');

-- COMUNI
INSERT INTO swiss_quiz_kb (regione_id, tipo, domanda, opzioni, corretta, spiegazione) VALUES
('VALLESE', 'comuni',
 'Quale comune del Vallese è noto per l\'Amigne, vitigno autoctono coltivato quasi esclusivamente su morena glaciale e scisto nero?',
 '{"a":"Sierre","b":"Vétroz","c":"Martigny","d":"Visp"}', '"b"',
 'Vétroz è il comune per eccellenza dell\'Amigne nel Vallese, con suoli di morena glaciale e scisto nero che danno al vitigno autoctono il suo carattere unico.'),

('VALLESE', 'comuni',
 'Chamoson nel Vallese è noto per essere:',
 '{"a":"Il comune con i vigneti più alti della Svizzera","b":"La più grande regione vinicola del Vallese e secondo comune viticolo svizzero per estensione","c":"Il principale produttore di Vin des Glaciers","d":"L\'unico comune con AOC per il Cornalin"}', '"b"',
 'Con circa 400 ha, Chamoson è la più grande regione vinicola del Vallese ed è anche il secondo comune viticolo svizzero per estensione, dopo Satigny nel cantone di Ginevra.');

-- ================================================================
-- VAUD
-- ================================================================
INSERT INTO swiss_quiz_kb (regione_id, tipo, domanda, opzioni, corretta, spiegazione) VALUES

('VAUD', 'multipla',
 'Quale zona del Vaud è Patrimonio UNESCO ed è celebre per l\'effetto dei "tre soli"?',
 '{"a":"La Côte","b":"Chablais","c":"Lavaux","d":"Nord Vaudois"}', '"c"',
 'Il Lavaux è Patrimonio UNESCO dal 2007. I "tre soli" sono: il sole diretto, il riflesso sul Lago Lemano e il calore rilasciato dai muri a secco delle terrazze.'),

('VAUD', 'multipla',
 'Qual è il Grand Cru più celebre del Lavaux, noto per la roccia "poudingue" che produce vini longevi fino a 20-30 anni?',
 '{"a":"Calamin","b":"Dézaley","c":"Dorin","d":"Salvagnin"}', '"b"',
 'Dézaley è il Grand Cru più prestigioso del Lavaux, su roccia poudingue (conglomerato) e marne. Produce Chasselas opulenti e minerali con note di tostato e cera d\'api, longevi 20-30 anni.'),

('VAUD', 'multipla',
 'Quale è il vitigno principale del Vaud in termini di superficie vitata?',
 '{"a":"Pinot Nero","b":"Gamay","c":"Chasselas","d":"Chardonnay"}', '"c"',
 'Il Chasselas copre circa il 60% della superficie vitata del Vaud. È il vitigno simbolo del cantone, chiamato anche Dorin nella tradizione locale.'),

('VAUD', 'multipla',
 'Cos\'è il "Servagnin de Morges" nel Vaud?',
 '{"a":"Un bianco autoctono simile al Chasselas","b":"Una denominazione storica per Pinot Noir con regole su resa e invecchiamento","c":"Un Gamay rosato tipico della zona","d":"Una cooperativa vitivinicola del Vaud"}', '"b"',
 'Il Servagnin de Morges è una denominazione storica riservata al Servagnin (antico clone locale di Pinot Nero protetto a Morges), con regole su resa per ettaro e invecchiamento.'),

('VAUD', 'multipla',
 'Quante AOC regionali ha il cantone Vaud?',
 '{"a":"3","b":"4","c":"5","d":"6"}', '"d"',
 'Il Vaud ha 6 AOC regionali: Lavaux, La Côte, Chablais, Côtes-de-l\'Orbe, Bonvillars e Vully (condivisa con Friburgo).'),

('VAUD', 'vero_falso',
 'Il Dézaley è un Grand Cru del Vaud prodotto esclusivamente da Chasselas.',
 NULL, 'true',
 'Vero. Il Dézaley (come tutti i Grand Cru del Vaud) è prodotto esclusivamente da Chasselas, il vitigno bianco dominante nel cantone.'),

('VAUD', 'vero_falso',
 'Il Doral è un vitigno autoctono rosso del Vaud.',
 NULL, 'false',
 'Falso. Il Doral è un vitigno bianco autoctono del Vaud (incrocio Chasselas x Chardonnay). I vitigni rossi autoctoni del Vaud sono Plant Robert e Servagnin.'),

('VAUD', 'vero_falso',
 'Il "Lauriers d\'Or Terravin" è un\'etichetta di qualità della Federazione dei Viticoltori del Vaud assegnata tramite degustazione da esperti.',
 NULL, 'true',
 'Vero. Il Lauriers d\'Or Terravin è un marchio di qualità riservato ai migliori vini del Vaud selezionati da una commissione di degustatori esperti.'),

('VAUD', 'aperta',
 'Descrivi il fenomeno dei "tre soli" nel Lavaux e il suo impatto sulla viticoltura.',
 NULL, NULL,
 'Il Lavaux (Vaud) beneficia di tre fonti di calore: 1) il sole diretto sulle viti; 2) il riflesso del sole sul Lago Lemano che amplifica l\'irraggiamento; 3) il calore accumulato dai muri a secco delle terrazze che viene rilasciato di notte alle viti. Questo microclima eccezionale permette al Chasselas di maturare perfettamente e produce i Grand Cru Dézaley e Calamin di grande struttura.',
 'Tre fonti di calore: sole diretto, riflesso sul lago Lemano, e calore rilasciato dai muri a secco delle terrazze di notte. Questo microclima eccezionale permette al Chasselas di raggiungere piena maturazione nei Grand Cru Dézaley e Calamin.');

INSERT INTO swiss_quiz_kb (regione_id, tipo, domanda, elementi, corretta, spiegazione) VALUES

('VAUD', 'classifica_colore',
 'Classifica i seguenti vitigni del Vaud come bianchi o rossi:',
 '["Chasselas","Doral","Plant Robert","Servagnin","Charmont","Gamay","Pinot Noir","Chardonnay"]',
 '{"Chasselas":"Bianco","Doral":"Bianco","Plant Robert":"Rosso","Servagnin":"Rosso","Charmont":"Bianco","Gamay":"Rosso","Pinot Noir":"Rosso","Chardonnay":"Bianco"}',
 'I bianchi autoctoni del Vaud sono Doral e Charmont. I rossi autoctoni sono Plant Robert e Servagnin. Chasselas e Chardonnay sono bianchi internazionali.'),

('VAUD', 'abbinamento',
 'Abbina ogni sottozona del Vaud alla sua caratteristica principale:',
 '{"sx":["Lavaux","La Côte","Chablais","Nord Vaudois (Bonvillars, Côtes-de-l\'Orbe)"],"dx":["Patrimonio UNESCO, effetto tre soli, Grand Cru Dézaley e Calamin","La più grande zona vitivinicola del Vaud per superficie","Confine con il Vallese, influenza del föhn","Zone più fresche vicino al Giura, Chasselas leggero"]}',
 '{"Lavaux":"Patrimonio UNESCO, effetto tre soli, Grand Cru Dézaley e Calamin","La Côte":"La più grande zona vitivinicola del Vaud per superficie","Chablais":"Confine con il Vallese, influenza del föhn","Nord Vaudois (Bonvillars, Côtes-de-l\'Orbe)":"Zone più fresche vicino al Giura, Chasselas leggero"}',
 'Ogni sottozona del Vaud ha caratteristiche pedoclimatiche distinte: Lavaux con i tre soli, La Côte la più grande, Chablais con il Föhn, Nord Vaudois più fresco.'),

('VAUD', 'elenco',
 'Elenca i 3 Grand Cru AOC del Vaud e la loro zona di produzione.',
 NULL, NULL,
 '1. AOC Grand Cru Dézaley (Lavaux) - su roccia poudingue, vini opulenti e minerali longevi 20-30 anni. 2. AOC Grand Cru Calamin (Lavaux) - vini eleganti e floreali. 3. AOC Dézaley-Marsens Grand Cru (Lavaux) - parcella storica specifica.',
 'Grand Cru Dézaley (Lavaux, su poudingue), Grand Cru Calamin (Lavaux), Dézaley-Marsens Grand Cru (Lavaux).');

INSERT INTO swiss_quiz_kb (regione_id, tipo, domanda, opzioni, corretta, spiegazione) VALUES
('VAUD', 'comuni',
 'Nella zona del Lavaux (Vaud), quale comune è associato al Grand Cru Dézaley?',
 '{"a":"Morges","b":"Epesses e Rivaz","c":"Nyon","d":"Aigle"}', '"b"',
 'Il Grand Cru Dézaley si trova nel territorio dei comuni di Epesses e Rivaz, nel cuore del Lavaux UNESCO, tra Lausanne e Vevey.');

-- ================================================================
-- GINEVRA
-- ================================================================
INSERT INTO swiss_quiz_kb (regione_id, tipo, domanda, opzioni, corretta, spiegazione) VALUES

('GINEVRA', 'multipla',
 'Satigny nel cantone di Ginevra detiene quale primato in Svizzera?',
 '{"a":"Il comune viticolo più alto","b":"Il comune viticolo più esteso","c":"Il comune con più Grand Cru","d":"Il comune con più vitigni autoctoni"}', '"b"',
 'Satigny è il comune viticolo più grande della Svizzera per estensione. Si trova nella Riva Destra (tra Rodano e Giura), la principale area vinicola del cantone.'),

('GINEVRA', 'multipla',
 'Quale percentuale della produzione di Ginevra è rappresentata da vini rossi?',
 '{"a":"44%","b":"56%","c":"70%","d":"35%"}', '"b"',
 'Il cantone di Ginevra produce il 56% di vini rossi e il 44% di bianchi. Il Gamay (20%) e il Chasselas (19%) sono i vitigni più piantati.'),

('GINEVRA', 'multipla',
 'Cos\'è l\'"Esprit de Genève"?',
 '{"a":"Un vino dolce tipico di Ginevra","b":"Una menzione per blend con almeno 50% Gamay e max 20% altri vitigni non Gamay/Gamaret/Garanoir","c":"Il nome locale del Chasselas di Ginevra","d":"Un Grand Cru della riva sinistra del Rodano"}', '"b"',
 'L\'Esprit de Genève è una menzione speciale per vini rossi con almeno 50% Gamay e massimo 20% di altri vitigni (esclusi Gamay, Gamaret, Garanoir). Prevede vincoli di qualità su resa e grado alcolico, con assaggio da commissione.'),

('GINEVRA', 'vero_falso',
 'Il cantone di Ginevra ha vitigni autoctoni locali.',
 NULL, 'false',
 'Falso. Ginevra non ha vitigni autoctoni. La produzione si concentra su vitigni internazionali e incroci svizzeri recenti come Gamaret e Garanoir.'),

('GINEVRA', 'vero_falso',
 'La riva destra del Rodano (es. Satigny, Dardagny) è la zona vinicola più grande del cantone di Ginevra.',
 NULL, 'true',
 'Vero. La Riva Destra comprende la zona tra il Rodano e il Giura (comuni come Satigny e Dardagny) ed è la più estesa del cantone, ospitando anche Satigny, il comune viticolo più grande di tutta la Svizzera.');

INSERT INTO swiss_quiz_kb (regione_id, tipo, domanda, elementi, corretta, spiegazione) VALUES
('GINEVRA', 'classifica_colore',
 'Classifica i seguenti vitigni coltivati a Ginevra:',
 '["Gamay","Chasselas","Gamaret","Pinot Noir","Chardonnay","Garanoir","Merlot","Sauvignon Blanc"]',
 '{"Gamay":"Rosso","Chasselas":"Bianco","Gamaret":"Rosso","Pinot Noir":"Rosso","Chardonnay":"Bianco","Garanoir":"Rosso","Merlot":"Rosso","Sauvignon Blanc":"Bianco"}',
 'Gamaret e Garanoir sono incroci svizzeri recenti a bacca rossa. Chassis, Chardonnay e Sauvignon Blanc sono bianchi. Gamay, Pinot Noir e Merlot sono rossi.'),

('GINEVRA', 'abbinamento',
 'Abbina ogni area del cantone di Ginevra alla sua descrizione:',
 '{"sx":["Riva Destra (Satigny, Dardagny)","Tra Arve e Rodano (Bernex, Bardonnex)","Tra Arve e Lago (Meinier)"],"dx":["La zona più grande, Satigny è il comune viticolo più esteso di Svizzera","Zona urbana a sud della città, suoli morenici e alluvionali","Zona est vicino al lago, Premier Cru Mandement de Jussy"]}',
 '{"Riva Destra (Satigny, Dardagny)":"La zona più grande, Satigny è il comune viticolo più esteso di Svizzera","Tra Arve e Rodano (Bernex, Bardonnex)":"Zona urbana a sud della città, suoli morenici e alluvionali","Tra Arve e Lago (Meinier)":"Zona est vicino al lago, Premier Cru Mandement de Jussy"}',
 'Le tre zone del cantone di Ginevra si dividono geograficamente in relazione ai fiumi Rodano e Arve e al lago.');

INSERT INTO swiss_quiz_kb (regione_id, tipo, domanda, opzioni, corretta, spiegazione, risposta_modello) VALUES
('GINEVRA', 'aperta',
 'Descrivi la struttura delle denominazioni nel cantone di Ginevra (AOC cantonale e Premier Cru).',
 NULL, NULL,
 'Il cantone di Ginevra ha 1 AOC cantonale (AOC Genève) e 22 AOC Premier Cru per aree specifiche. La menzione Esprit de Genève si applica ai vini rossi con almeno 50% Gamay che superano i controlli di qualità.',
 'Ginevra ha 1 AOC cantonale (AOC Genève) e 22 AOC Premier Cru per aree specifiche del cantone. La menzione Esprit de Genève è riservata ai rossi con almeno 50% Gamay che superano i controlli di qualità su resa, grado alcolico e degustazione.');

INSERT INTO swiss_quiz_kb (regione_id, tipo, domanda, opzioni, corretta, spiegazione) VALUES
('GINEVRA', 'comuni',
 'In quale comune si trovano le Coteaux de Dardagny, uno dei Premier Cru più noti di Ginevra?',
 '{"a":"Bernex","b":"Meinier","c":"Dardagny","d":"Satigny"}', '"c"',
 'Le Coteaux de Dardagny sono il Premier Cru associato al comune di Dardagny, nella riva destra del Rodano, zona più importante del cantone per produzione vinicola.');

-- ================================================================
-- TRE LAGHI (TROIS LACS)
-- ================================================================
INSERT INTO swiss_quiz_kb (regione_id, tipo, domanda, opzioni, corretta, spiegazione) VALUES

('TRE_LAGHI', 'multipla',
 'Quali sono i tre laghi che danno il nome alla regione Trois Lacs?',
 '{"a":"Lemano, Maggiore, Lugano","b":"Neuchâtel, Bienna, Morat","c":"Costanza, Zurigo, Zugo","d":"Thun, Brienz, Lucerna"}', '"b"',
 'La regione Trois Lacs (Tre Laghi) prende il nome dai laghi di Neuchâtel, Bienna (Bienne) e Morat (Murten). Il clima è moderato dall\'influenza di questi tre laghi.'),

('TRE_LAGHI', 'multipla',
 'Come si chiama il vento freddo tipico del cantone Neuchâtel che obbliga ad allevare le viti con fili di sostegno?',
 '{"a":"Bise","b":"Föhn","c":"Joran","d":"Tramontana"}', '"c"',
 'Il "Joran" è un vento forte e freddo dal Giura tipico del Neuchâtel. Il rischio di freddo che ne deriva obbliga i viticoltori ad usare fili di sostegno per proteggere le viti.'),

('TRE_LAGHI', 'multipla',
 'L\'Oeil de Perdrix è una specialità di Neuchâtel. Di cosa si tratta?',
 '{"a":"Un Chasselas non filtrato","b":"Un rosato da Pinot Noir con macerazione breve","c":"Un Pinot Noir vinificato in bianco","d":"Un vino dolce da uve botritizzate"}', '"b"',
 'L\'Oeil de Perdrix è un rosato tipico di Neuchâtel prodotto da Pinot Nero con macerazione breve. Il nome (occhio di pernice) descrive il caratteristico colore rosa tenue.'),

('TRE_LAGHI', 'multipla',
 'Il "Non Filtré" di Neuchâtel è commercializzato ogni anno a partire da quando?',
 '{"a":"3° giovedì di novembre","b":"3° mercoledì di gennaio","c":"1° dicembre","d":"3° venerdì di ottobre"}', '"b"',
 'Il Non Filtré (Chasselas non filtrato, dal 1995) viene commercializzato a partire dal terzo mercoledì di gennaio, come vino giovane e fresco della nuova annata.'),

('TRE_LAGHI', 'vero_falso',
 'Il Pinot Noir è il vitigno più piantato nella regione Trois Lacs con circa il 49% della superficie.',
 NULL, 'true',
 'Vero. Il Pinot Noir copre il 49% della superficie vitata dei Tre Laghi, seguito dal Chasselas al 28%. La regione produce il 56% di vini rossi.'),

('TRE_LAGHI', 'vero_falso',
 'La Perdrix Blanche è un Pinot Nero vinificato in bianco, specialità esclusiva di Neuchâtel.',
 NULL, 'true',
 'Vero. La Perdrix Blanche è il Pinot Nero vinificato in bianco (blanc de noirs), etichetta protetta e specialità tipica del cantone Neuchâtel.'),

('TRE_LAGHI', 'aperta',
 'Descrivi le specialità enologiche della regione di Neuchâtel (almeno 3).',
 NULL, NULL,
 '1. Oeil de Perdrix: rosato da Pinot Nero con macerazione breve, colore rosa tenue. 2. Perdrix Blanche: Pinot Nero vinificato in bianco (blanc de noirs), etichetta protetta. 3. Non Filtré: Chasselas non filtrato, commercializzato dal 3° mercoledì di gennaio. 4. Gerle d\'Or: marchio per i migliori Chasselas AOC selezionati per qualità.',
 'Tre specialità principali: Oeil de Perdrix (rosato da Pinot Nero), Perdrix Blanche (Pinot Nero in bianco), Non Filtré (Chasselas non filtrato da gennaio). Bonus: Gerle d\'Or come etichetta di qualità per i migliori Chasselas.');

INSERT INTO swiss_quiz_kb (regione_id, tipo, domanda, elementi, corretta, spiegazione) VALUES
('TRE_LAGHI', 'abbinamento',
 'Abbina ogni cantone/zona dei Tre Laghi alla sua AOC principale:',
 '{"sx":["Canton Neuchâtel","Canton Berna","Canton Friburgo (zona Vully)","Canton Friburgo (zona Cheyres)"],"dx":["AOC Neuchâtel","AOC Lac de Bienne","AOC Vully","AOC Cheyres"]}',
 '{"Canton Neuchâtel":"AOC Neuchâtel","Canton Berna":"AOC Lac de Bienne","Canton Friburgo (zona Vully)":"AOC Vully","Canton Friburgo (zona Cheyres)":"AOC Cheyres"}',
 'I Tre Laghi si estendono su tre cantoni principali: Neuchâtel (AOC Neuchâtel), Berna (AOC Lac de Bienne) e Friburgo (AOC Vully e AOC Cheyres). L\'AOC Vully è condivisa con il Vaud.');

INSERT INTO swiss_quiz_kb (regione_id, tipo, domanda, opzioni, corretta, spiegazione) VALUES
('TRE_LAGHI', 'comuni',
 'In quale città si trova la principale area vinicola del Cantone di Neuchâtel, famosa per l\'Oeil de Perdrix?',
 '{"a":"Fribourg","b":"Biel/Bienne","c":"Neuchâtel","d":"Murten"}', '"c"',
 'La città di Neuchâtel è il centro della regione vinicola omonima. Le vigne si estendono sulle rive del lago, con esposizione favorevole e clima mitigato dall\'acqua.');

-- ================================================================
-- TICINO
-- ================================================================
INSERT INTO swiss_quiz_kb (regione_id, tipo, domanda, opzioni, corretta, spiegazione) VALUES

('TICINO', 'multipla',
 'Qual è il vitigno dominante in Ticino che rappresenta circa l\'80% della produzione?',
 '{"a":"Bondola","b":"Pinot Nero","c":"Merlot","d":"Cabernet Sauvignon"}', '"c"',
 'Il Merlot copre circa l\'80% della superficie vitata del Ticino, rendendolo il cantone svizzero più monograficamente legato a un vitigno internazionale.'),

('TICINO', 'multipla',
 'Come è diviso il Ticino dalla montagna del Monte Ceneri?',
 '{"a":"In Ovest e Est","b":"In Sopraceneri e Sottoceneri","c":"In Alto Ticino e Basso Ticino","d":"In Canton Nord e Canton Sud"}', '"b"',
 'Il Monte Ceneri divide il Ticino in Sopraceneri (fondovalle e valli alpine, suoli granitici e gneis) e Sottoceneri (colline e Lugano, suoli morenichi con argilla e calcare).'),

('TICINO', 'multipla',
 'Cos\'è il Merlot Bianco ticinese?',
 '{"a":"Un Merlot rosato prodotto con macerazione brevissima","b":"Un blanc de noirs da Merlot, specialità emblematica del Ticino","c":"Un incrocio locale tra Merlot e Pinot Grigio","d":"Un Merlot dolce da uve appassite"}', '"b"',
 'Il Merlot Bianco (blanc de noirs da Merlot) è una specialità emblematica del Ticino. Le uve rosse del Merlot vengono pressate senza macerazione, producendo un vino bianco con profumi del Merlot.'),

('TICINO', 'multipla',
 'Cosa prevede la menzione "Riserva" dell\'AOC Ticino per i vini rossi?',
 '{"a":"Almeno 6 mesi in legno","b":"Millesimo obbligatorio e minimo 18 mesi di invecchiamento","c":"Solo da uve di singola vigna","d":"Almeno 12 mesi in barrique nuova"}', '"b"',
 'La menzione Riserva nell\'AOC Ticino prevede millesimo obbligatorio e invecchiamento minimo di 18 mesi per i rossi (12 mesi per i bianchi).'),

('TICINO', 'vero_falso',
 'Il Ticino ha circa 2.200 ore di sole annue, il che lo rende il "solarium della Svizzera".',
 NULL, 'true',
 'Vero. Il Ticino, a sud delle Alpi con forte influenza mediterranea, ha circa 2.200 ore di sole annue. Tuttavia detiene anche il record di precipitazioni (1.600-1.800 mm/anno), spesso sotto forma di intensi temporali.'),

('TICINO', 'vero_falso',
 'La Bondola è il principale vitigno autoctono rosso del Ticino.',
 NULL, 'true',
 'Vero. La Bondola è l\'unico vitigno autoctono rosso del Ticino. In passato molto diffusa, oggi è quasi scomparsa a favore del Merlot, ma alcuni produttori la coltivano ancora.'),

('TICINO', 'aperta',
 'Descrivi le differenze tra Sopraceneri e Sottoceneri in Ticino dal punto di vista pedologico.',
 NULL, NULL,
 'Sopraceneri (Bellinzona, Locarno, Vallemaggia): suoli di origine glaciale e fluviale, ricchi di granito, gneiss, rocce cristalline, sabbia e ghiaia. Suoli più acidi e poveri. Sottoceneri (Lugano, Mendrisiotto, Malcantone): suoli di origine morenica con argilla, sabbia, ghiaia e calcari. Suoli più fertili e diversificati. Entrambe le zone producono prevalentemente Merlot nell\'unica AOC regionale (Ticino DOC).',
 'Sopraceneri: suoli glaciali e fluviali, granito, gneiss, rocce cristalline. Sottoceneri: suoli morenichi con argilla, sabbia, ghiaia e calcari. Entrambe producono Merlot nell\'unica AOC Ticino DOC.'),

('TICINO', 'elenco',
 'Elenca le tipologie di vini che rientrano nell\'AOC Ticino (Ticino DOC).',
 NULL, NULL,
 'Ticino DOC include: Rosso – Bianco – Rosato – del Ticino/Ticinese. La menzione del vitigno è consentita solo se >10%, l\'indicazione esclusiva del vitigno solo se >90%. La menzione Riserva richiede millesimo e invecchiamento minimo (18 mesi rossi, 12 bianchi).',
 'Rosso, Bianco, Rosato, del Ticino/Ticinese. Menzione vitigno possibile se >10%, indicazione esclusiva se >90%. Menzione Riserva con millesimo e invecchiamento minimo.');

INSERT INTO swiss_quiz_kb (regione_id, tipo, domanda, elementi, corretta, spiegazione) VALUES
('TICINO', 'abbinamento',
 'Abbina ogni zona del Ticino ai suoi suoli caratteristici:',
 '{"sx":["Sopraceneri (Bellinzona, Locarno)","Sottoceneri (Lugano, Mendrisiotto)"],"dx":["Suoli glaciali e fluviali: granito, gneiss, sabbia e ghiaia","Suoli morenichi: argilla, sabbia, ghiaia e calcari"]}',
 '{"Sopraceneri (Bellinzona, Locarno)":"Suoli glaciali e fluviali: granito, gneiss, sabbia e ghiaia","Sottoceneri (Lugano, Mendrisiotto)":"Suoli morenichi: argilla, sabbia, ghiaia e calcari"}',
 'La divisione del Ticino da parte del Monte Ceneri crea due zone pedologicamente distinte: il nord con suoli alpini cristallini, il sud con suoli morenichi più fertili.');

INSERT INTO swiss_quiz_kb (regione_id, tipo, domanda, opzioni, corretta, spiegazione) VALUES
('TICINO', 'comuni',
 'Quale zona del Ticino è nota per la produzione di Merlot di alta qualità nel Mendrisiotto?',
 '{"a":"Locarnese","b":"Sottoceneri - Mendrisiotto","c":"Sopraceneri - Bellinzonese","d":"Valle Maggia"}', '"b"',
 'Il Mendrisiotto, nel Sottoceneri, è considerato la zona di eccellenza per il Merlot ticinese. Suoli morenichi con argilla e calcare, microclima favorevole vicino al confine italiano, producono i Merlot più strutturati e longevi del cantone.');

-- ================================================================
-- SVIZZERA TEDESCA
-- ================================================================
INSERT INTO swiss_quiz_kb (regione_id, tipo, domanda, opzioni, corretta, spiegazione) VALUES

('SVIZZERA_TEDESCA', 'multipla',
 'Qual è il vitigno principale della Svizzera Tedesca?',
 '{"a":"Müller-Thurgau","b":"Completer","c":"Pinot Noir (Blauburgunder)","d":"Räuschling"}', '"c"',
 'Il Pinot Noir (chiamato localmente Blauburgunder, o Klevner a Zurigo) è il vitigno dominante della Svizzera Tedesca, coprendo la maggior parte della superficie vitata dei 17 cantoni.'),

('SVIZZERA_TEDESCA', 'multipla',
 'Chi ha creato il Müller-Thurgau e quando?',
 '{"a":"Johann Gutenberg nel 1820","b":"Hermann Müller originario del cantone Turgovia (Thurgau), nel 1882","c":"Un viticoltore di Zurigo nel 1920","d":"Un istituto viticolo austriaco nel 1900"}', '"b"',
 'Hermann Müller, originario del cantone di Turgovia (Thurgau), ha creato il Müller-Thurgau nel 1882. È un incrocio tra Riesling e Madeleine Royale (non Riesling x Sylvaner come si credeva). In Svizzera è ancora chiamato Riesling-Sylvaner.'),

('SVIZZERA_TEDESCA', 'multipla',
 'Cosa è la Bündner Herrschaft nei Grigioni?',
 '{"a":"Una cooperativa vinicola storica","b":"La principale zona vinicola dei Grigioni, considerata la Borgogna della Svizzera","c":"Un Grand Cru per il Completer","d":"Il sistema di allevamento tradizionale della vite nei Grigioni"}', '"b"',
 'La Bündner Herrschaft è la zona vinicola principale dei Grigioni, composta da quattro comuni (Maienfeld, Jenins, Malans, Fläsch). È chiamata "la Borgogna della Svizzera" per la qualità del Pinot Noir su suoli profondi di argilla e minerali.'),

('SVIZZERA_TEDESCA', 'multipla',
 'Il Completer è un vitigno autoctono di quale cantone?',
 '{"a":"Zurigo","b":"Sciaffusa","c":"Grigioni (Graubünden)","d":"Argovia"}', '"c"',
 'Il Completer è il vitigno bianco autoctono dei Grigioni, con origini storiche che risalgono al Medioevo. Rarissimo, produce vini di grande longevità e complessità.'),

('SVIZZERA_TEDESCA', 'vero_falso',
 'Il Räuschling è un vitigno storico autoctono della zona di Zurigo.',
 NULL, 'true',
 'Vero. Il Räuschling è il vitigno bianco storico e locale di Zurigo. Quasi scomparso nel XX secolo, è stato recuperato da alcuni produttori come simbolo della tradizione viticola zurighese.'),

('SVIZZERA_TEDESCA', 'vero_falso',
 'La Svizzera Tedesca comprende esattamente 5 cantoni viticoli.',
 NULL, 'false',
 'Falso. La Svizzera Tedesca comprende ben 17 cantoni viticoli, tra cui Zurigo, Grigioni, Sciaffusa, Argovia, Turgovia, Basilea, San Gallo e altri.'),

('SVIZZERA_TEDESCA', 'vero_falso',
 'Il Föhn viene chiamato "Traubenkocher" (cuocitore d\'uva) nella Svizzera Tedesca per il suo effetto positivo sulla maturazione delle uve.',
 NULL, 'true',
 'Vero. Il Föhn (vento caldo e secco dall\'Alpi) è chiamato colloquialmente "Traubenkocher" perché accelera la maturazione delle uve in un clima altrimenti fresco e umido. È fondamentale per raggiungere la maturazione ottimale nei cantoni più settentrionali.'),

('SVIZZERA_TEDESCA', 'aperta',
 'Descrivi le caratteristiche del Müller-Thurgau e il suo nome tradizionale in Svizzera.',
 NULL, NULL,
 'Il Müller-Thurgau è stato creato nel 1882 da Hermann Müller del cantone di Turgovia (Thurgau). In Svizzera è ancora tradizionalmente chiamato Riesling-Sylvaner, ma gli studi genetici hanno dimostrato che è in realtà un incrocio tra Riesling e Madeleine Royale. È il vitigno bianco più importante della Svizzera Tedesca: matura precocemente, produce vini floreali e aromatici, con buona acidità. È diffuso in tutta la Svizzera Tedesca ma specialmente in Turgovia e Argovia.',
 'Müller-Thurgau: creato nel 1882 da Hermann Müller del cantone Thurgau. In Svizzera chiamato Riesling-Sylvaner. Incrocio Riesling x Madeleine Royale (non Riesling x Sylvaner). Vitigno bianco più importante della Svizzera Tedesca, matura precocemente, vini floreali.');

INSERT INTO swiss_quiz_kb (regione_id, tipo, domanda, elementi, corretta, spiegazione) VALUES
('SVIZZERA_TEDESCA', 'classifica_colore',
 'Classifica i seguenti vitigni tipici della Svizzera Tedesca:',
 '["Pinot Noir (Blauburgunder)","Räuschling","Completer","Müller-Thurgau","Regent","Cabernet Jura","Gamaret","Pinot Gris"]',
 '{"Pinot Noir (Blauburgunder)":"Rosso","Räuschling":"Bianco","Completer":"Bianco","Müller-Thurgau":"Bianco","Regent":"Rosso","Cabernet Jura":"Rosso","Gamaret":"Rosso","Pinot Gris":"Bianco"}',
 'Räuschling e Completer sono i due bianchi autoctoni. Regent e Cabernet Jura sono incroci rossi moderni resistenti alle malattie. Gamaret è un incrocio rosso svizzero.'),

('SVIZZERA_TEDESCA', 'abbinamento',
 'Abbina ogni cantone della Svizzera Tedesca al suo vitigno/caratteristica più nota:',
 '{"sx":["Zurigo","Grigioni (Graubünden)","Sciaffusa"],"dx":["Räuschling (vitigno storico locale) e Pinot Nero","Completer (autoctono medievale) e Pinot Nero della Bündner Herrschaft","Pinot Nero su suoli calcarei, vicino al confine tedesco"]}',
 '{"Zurigo":"Räuschling (vitigno storico locale) e Pinot Nero","Grigioni (Graubünden)":"Completer (autoctono medievale) e Pinot Nero della Bündner Herrschaft","Sciaffusa":"Pinot Nero su suoli calcarei, vicino al confine tedesco"}',
 'Ogni cantone della Svizzera Tedesca ha la propria identità viticola: Zurigo con il Räuschling, i Grigioni con il Completer e la Bündner Herrschaft, Sciaffusa con i vini di confine.');

INSERT INTO swiss_quiz_kb (regione_id, tipo, domanda, opzioni, corretta, spiegazione) VALUES
('SVIZZERA_TEDESCA', 'comuni',
 'In quale area dei Grigioni si trova la Bündner Herrschaft, la zona vinicola più rinomata per il Pinot Noir?',
 '{"a":"Coira (Chur)","b":"Maienfeld, Jenins, Malans, Fläsch","c":"Davos","d":"St. Moritz"}', '"b"',
 'La Bündner Herrschaft si trova nei comuni di Maienfeld, Jenins, Malans e Fläsch, a nord dei Grigioni, al confine con il Liechtenstein. I suoli profondi di argilla e minerali e il Föhn creano condizioni eccezionali per il Pinot Nero.');

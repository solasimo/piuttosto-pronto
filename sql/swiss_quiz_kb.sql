-- ================================================================
-- SVIZZERA — KB Quiz Fissa
-- ================================================================

CREATE TABLE IF NOT EXISTS swiss_quiz_kb (
  id SERIAL PRIMARY KEY,
  regione_id TEXT NOT NULL,
  tipo TEXT NOT NULL,
  domanda TEXT NOT NULL,
  opzioni JSONB,
  corretta JSONB,
  risposta_modello TEXT,
  elementi JSONB,
  spiegazione TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE swiss_quiz_kb ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated read" ON swiss_quiz_kb;
CREATE POLICY "Authenticated read" ON swiss_quiz_kb FOR SELECT TO authenticated USING (true);

-- Svuota e reinserisce
DELETE FROM swiss_quiz_kb;

-- ================================================================
-- Colonne: regione_id, tipo, domanda, opzioni, corretta, risposta_modello, elementi, spiegazione
-- ================================================================
INSERT INTO swiss_quiz_kb (regione_id, tipo, domanda, opzioni, corretta, risposta_modello, elementi, spiegazione) VALUES

-- ================================================================
-- VALLESE — multipla
-- ================================================================
('VALLESE','multipla','Qual è il cantone con la maggiore superficie vitata in Svizzera?','{"a":"Vaud","b":"Ticino","c":"Vallese","d":"Ginevra"}','"c"',NULL,NULL,'Il Vallese ha 4.800 ha, circa un terzo della produzione vinicola svizzera totale.'),
('VALLESE','multipla','Come si chiama la denominazione protetta del Vallese per il vino 100% da uve Chasselas?','{"a":"Dorin","b":"Fendant","c":"Johannisberg","d":"Dole"}','"b"',NULL,NULL,'Fendant è la denominazione AOC esclusiva del Vallese per Chasselas 100%. Dorin è il termine usato nel Vaud.'),
('VALLESE','multipla','Quante AOC Grand Cru esistono nel Vallese?','{"a":"6","b":"8","c":"10","d":"12"}','"c"',NULL,NULL,'Il Vallese ha esattamente 10 AOC Grand Cru: Visperterminen, Saillon, Leytron, Chamoson, Vétroz, Conthey, Sion, Saint-Léonard, Sierre, Salquenen.'),
('VALLESE','multipla','Il Vin des Glaciers della Val d''Anniviers usa quale tecnica di affinamento?','{"a":"Metodo classico","b":"Sistema Solera","c":"Macerazione carbonica","d":"Appassimento"}','"b"',NULL,NULL,'Il Vin des Glaciers usa un sistema equivalente alla Solera spagnola: il vino evaporato viene reintegrato con vino più giovane, conservato in botti di larice.'),
('VALLESE','multipla','Qual è il vitigno bianco autoctono più emblematico del Vallese?','{"a":"Rèze","b":"Chasselas","c":"Petite Arvine","d":"Marsanne"}','"c"',NULL,NULL,'La Petite Arvine è il vitigno bianco nobile per eccellenza del Vallese, spesso vinificata in versione dolce per il Grain Noble ConfidenCiel.'),
('VALLESE','multipla','Dove si trovano i vigneti più alti d''Europa nel Vallese?','{"a":"Sierre","b":"Visperterminen","c":"Sion","d":"Martigny"}','"b"',NULL,NULL,'Visperterminen ospita vigneti fino a 1.100 m s.l.m., tra i più alti d''Europa.'),
('VALLESE','multipla','La Dole Blanche è ottenuta da quali uve vinificate in bianco?','{"a":"Chasselas e Sylvaner","b":"Pinot Noir e Gamay con dominanza Pinot Noir","c":"Petite Arvine e Amigne","d":"Humagne Blanche e Marsanne"}','"b"',NULL,NULL,'La Dole Blanche è la versione bianca della Dole: stesse uve rosse vinificate in bianco (blanc de noirs).'),

-- VALLESE — vero_falso
('VALLESE','vero_falso','Il Vallese è la regione più secca della Svizzera con circa 650 mm di precipitazioni annue.',NULL,'true',NULL,NULL,'Vero. Le Alpi proteggono il Vallese dalle perturbazioni atlantiche. Massima insolazione: 2.500 ore/anno.'),
('VALLESE','vero_falso','Il Johannisberg del Vallese è un vino prodotto al 100% da uve Riesling.',NULL,'false',NULL,NULL,'Falso. Il Johannisberg è prodotto al 100% da uve Sylvaner, non Riesling.'),
('VALLESE','vero_falso','Il Grain Noble ConfidenCiel è riservato esclusivamente ai vitigni autoctoni del Vallese con minimo 130 gradi Oechslé.',NULL,'true',NULL,NULL,'Vero. Creato nel 1996, prevede varietà tradizionali del Vallese e minimo 130 gradi Oechslé, con invecchiamento in legno.'),
('VALLESE','vero_falso','La Dole AOC può essere prodotta con qualsiasi assemblaggio di uve rosse del Vallese.',NULL,'false',NULL,NULL,'Falso. La Dole richiede almeno il 51% di Pinot Noir e Gamay, con dominanza del Pinot Noir.'),
('VALLESE','vero_falso','La Petite Arvine è presente anche in Valle d''Aosta e in Savoia oltre che in Vallese.',NULL,'true',NULL,NULL,'Vero. Originaria del Vallese, la Petite Arvine è coltivata anche in Valle d''Aosta e in piccole quantità in Savoia.'),

-- VALLESE — aperta
('VALLESE','aperta','Descrivi le caratteristiche climatiche principali del Vallese e il loro impatto sulla viticoltura.',NULL,NULL,'Clima continentale protetto dalle Alpi. Circa 650 mm di pioggia. 2.500 ore di sole/anno. Vento Föhn che accelera la maturazione. Viticoltura eroica su terrazze (tablar). Vini concentrati e strutturati.',NULL,'Clima continentale protetto dalle Alpi con circa 650 mm di precipitazioni, 2.500 ore di sole, vento Föhn che accelera la maturazione, viticoltura eroica su terrazze.'),
('VALLESE','aperta','Cos''è il Vin des Glaciers del Vallese e quale tecnica produttiva lo caratterizza?',NULL,NULL,'Vino bianco ossidativo della Val d''Anniviers. Assemblaggio di vitigni autoctoni (Rèze, Ermitage, Malvoisie, Païen). Conservato in botti di larice con sistema Solera: il vino evaporato viene rimpiazzato con vino più giovane.',NULL,'Vino bianco ossidativo della Val d''Anniviers con sistema Solera in botti di larice. Assemblaggio di vitigni autoctoni tra cui Rèze, Ermitage, Malvoisie, Païen.'),

-- VALLESE — elenco
('VALLESE','elenco','Elenca almeno 5 vitigni bianchi autoctoni del Vallese.',NULL,NULL,'Petite Arvine, Amigne, Humagne Blanche, Rèze, Lafnetscha, Himbertscha, Savagnin Blanc (Païen/Heida), Pinot Gris (Malvoisie), Marsanne (Ermitage).',NULL,'Petite Arvine, Amigne, Humagne Blanche, Rèze, Lafnetscha, Himbertscha, Savagnin Blanc (Païen/Heida), Malvoisie, Ermitage.'),
('VALLESE','elenco','Elenca i 10 Grand Cru AOC del Vallese.',NULL,NULL,'Visperterminen, Saillon, Leytron, Chamoson, Vétroz, Conthey, Ville de Sion, Saint-Léonard, Sierre, Salquenen.',NULL,'Visperterminen, Saillon, Leytron, Chamoson, Vétroz, Conthey, Sion, Saint-Léonard, Sierre, Salquenen.'),

-- VALLESE — classifica_colore
('VALLESE','classifica_colore','Indica per ogni vitigno se è a bacca bianca o rossa nel Vallese:',NULL,'{"Petite Arvine":"Bianco","Cornalin":"Rosso","Humagne Rouge":"Rosso","Amigne":"Bianco","Rèze":"Bianco","Humagne Blanche":"Bianco","Gamay":"Rosso","Chasselas":"Bianco"}',NULL,'["Petite Arvine","Cornalin","Humagne Rouge","Amigne","Rèze","Humagne Blanche","Gamay","Chasselas"]','I rossi autoctoni principali sono Cornalin e Humagne Rouge. I bianchi autoctoni includono Petite Arvine, Amigne, Rèze e Humagne Blanche.'),

-- VALLESE — abbinamento
('VALLESE','abbinamento','Abbina ogni denominazione protetta del Vallese al suo vitigno/blend:',NULL,'{"Fendant":"Chasselas 100%","Johannisberg":"Sylvaner 100%","Dole":"Pinot Noir + Gamay (rosso)","Dole Blanche":"Pinot Noir + Gamay (bianco)","Vin des Glaciers":"Assemblaggio autoctoni in botti di larice"}',NULL,'{"sx":["Fendant","Johannisberg","Dole","Dole Blanche","Vin des Glaciers"],"dx":["Chasselas 100%","Sylvaner 100%","Pinot Noir + Gamay (rosso)","Pinot Noir + Gamay (bianco)","Assemblaggio autoctoni in botti di larice"]}','Le denominazioni protette del Vallese sono strettamente legate ai vitigni: Fendant=Chasselas, Johannisberg=Sylvaner, Dole=rosso, Dole Blanche=bianco.'),

-- VALLESE — comuni
('VALLESE','comuni','Quale comune del Vallese è noto per l''Amigne su morena glaciale e scisto nero?','{"a":"Sierre","b":"Vétroz","c":"Martigny","d":"Visp"}','"b"',NULL,NULL,'Vétroz è il comune per eccellenza dell''Amigne nel Vallese, con suoli di morena glaciale e scisto nero.'),
('VALLESE','comuni','Chamoson nel Vallese è noto per essere la più grande regione vinicola del Vallese e il secondo comune viticolo svizzero per estensione?','{"a":"Vero","b":"Falso"}','"a"',NULL,NULL,'Con circa 400 ha, Chamoson è la più grande regione vinicola del Vallese, secondo solo a Satigny (Ginevra) per estensione.'),

-- ================================================================
-- VAUD — multipla
-- ================================================================
('VAUD','multipla','Quale zona del Vaud è Patrimonio UNESCO ed è celebre per l''effetto dei tre soli?','{"a":"La Côte","b":"Chablais","c":"Lavaux","d":"Nord Vaudois"}','"c"',NULL,NULL,'Il Lavaux è Patrimonio UNESCO dal 2007. I tre soli: sole diretto, riflesso sul Lago Lemano, calore dei muri a secco.'),
('VAUD','multipla','Qual è il Grand Cru più celebre del Lavaux su roccia poudingue?','{"a":"Calamin","b":"Dézaley","c":"Dorin","d":"Salvagnin"}','"b"',NULL,NULL,'Dézaley è il Grand Cru più prestigioso del Lavaux, su roccia poudingue. Vini opulenti e minerali, longevi 20-30 anni.'),
('VAUD','multipla','Quale è il vitigno principale del Vaud in termini di superficie vitata?','{"a":"Pinot Nero","b":"Gamay","c":"Chasselas","d":"Chardonnay"}','"c"',NULL,NULL,'Il Chasselas copre circa il 60% della superficie vitata del Vaud. Chiamato anche Dorin nella tradizione locale.'),
('VAUD','multipla','Cos''è il Servagnin de Morges nel Vaud?','{"a":"Un bianco autoctono simile al Chasselas","b":"Una denominazione storica per Pinot Noir con regole su resa e invecchiamento","c":"Un Gamay rosato tipico della zona","d":"Una cooperativa vitivinicola del Vaud"}','"b"',NULL,NULL,'Il Servagnin de Morges è una denominazione storica riservata all''antico clone locale di Pinot Nero protetto a Morges.'),
('VAUD','multipla','Quante AOC regionali ha il cantone Vaud?','{"a":"3","b":"4","c":"5","d":"6"}','"d"',NULL,NULL,'Il Vaud ha 6 AOC regionali: Lavaux, La Côte, Chablais, Côtes-de-l''Orbe, Bonvillars e Vully.'),

-- VAUD — vero_falso
('VAUD','vero_falso','Il Dézaley è un Grand Cru del Vaud prodotto esclusivamente da Chasselas.',NULL,'true',NULL,NULL,'Vero. Il Dézaley è prodotto esclusivamente da Chasselas, il vitigno bianco dominante nel cantone.'),
('VAUD','vero_falso','Il Doral è un vitigno autoctono rosso del Vaud.',NULL,'false',NULL,NULL,'Falso. Il Doral è un vitigno bianco autoctono del Vaud (incrocio Chasselas x Chardonnay).'),
('VAUD','vero_falso','Il Lauriers d''Or Terravin è un''etichetta di qualità assegnata tramite degustazione da esperti.',NULL,'true',NULL,NULL,'Vero. Il Lauriers d''Or Terravin è un marchio di qualità riservato ai migliori vini del Vaud selezionati da commissione.'),

-- VAUD — aperta
('VAUD','aperta','Descrivi il fenomeno dei tre soli nel Lavaux e il suo impatto sulla viticoltura.',NULL,NULL,'Tre fonti di calore: 1) sole diretto; 2) riflesso del sole sul Lago Lemano; 3) calore accumulato dai muri a secco delle terrazze rilasciato di notte. Permette al Chasselas di maturare perfettamente nei Grand Cru Dézaley e Calamin.',NULL,'Tre fonti di calore: sole diretto, riflesso sul lago Lemano, calore rilasciato dai muri a secco di notte. Permette al Chasselas di raggiungere piena maturazione nei Grand Cru Dézaley e Calamin.'),

-- VAUD — elenco
('VAUD','elenco','Elenca i 3 Grand Cru AOC del Vaud con la loro zona di produzione.',NULL,NULL,'1. AOC Grand Cru Dézaley (Lavaux, su roccia poudingue, vini longevi 20-30 anni). 2. AOC Grand Cru Calamin (Lavaux, vini eleganti e floreali). 3. AOC Dézaley-Marsens Grand Cru (Lavaux, parcella storica).',NULL,'Grand Cru Dézaley (Lavaux, su poudingue), Grand Cru Calamin (Lavaux), Dézaley-Marsens Grand Cru (Lavaux).'),

-- VAUD — classifica_colore
('VAUD','classifica_colore','Classifica i seguenti vitigni del Vaud come bianchi o rossi:',NULL,'{"Chasselas":"Bianco","Doral":"Bianco","Plant Robert":"Rosso","Servagnin":"Rosso","Charmont":"Bianco","Gamay":"Rosso","Pinot Noir":"Rosso","Chardonnay":"Bianco"}',NULL,'["Chasselas","Doral","Plant Robert","Servagnin","Charmont","Gamay","Pinot Noir","Chardonnay"]','I bianchi autoctoni del Vaud sono Doral e Charmont. I rossi autoctoni sono Plant Robert e Servagnin.'),

-- VAUD — abbinamento
('VAUD','abbinamento','Abbina ogni sottozona del Vaud alla sua caratteristica principale:',NULL,'{"Lavaux":"Patrimonio UNESCO, tre soli, Grand Cru Dézaley e Calamin","La Côte":"La più grande zona vitivinicola del Vaud per superficie","Chablais":"Confine con il Vallese, influenza del föhn","Nord Vaudois":"Zone più fresche vicino al Giura, Chasselas leggero"}',NULL,'{"sx":["Lavaux","La Côte","Chablais","Nord Vaudois"],"dx":["Patrimonio UNESCO, tre soli, Grand Cru Dézaley e Calamin","La più grande zona vitivinicola del Vaud per superficie","Confine con il Vallese, influenza del föhn","Zone più fresche vicino al Giura, Chasselas leggero"]}','Ogni sottozona del Vaud ha caratteristiche pedoclimatiche distinte.'),

-- VAUD — comuni
('VAUD','comuni','In quale territorio si trova il Grand Cru Dézaley nel Lavaux?','{"a":"Morges","b":"Epesses e Rivaz","c":"Nyon","d":"Aigle"}','"b"',NULL,NULL,'Il Grand Cru Dézaley si trova nel territorio dei comuni di Epesses e Rivaz, nel cuore del Lavaux UNESCO.'),

-- ================================================================
-- GINEVRA — multipla
-- ================================================================
('GINEVRA','multipla','Satigny nel cantone di Ginevra detiene quale primato in Svizzera?','{"a":"Il comune viticolo più alto","b":"Il comune viticolo più esteso","c":"Il comune con più Grand Cru","d":"Il comune con più vitigni autoctoni"}','"b"',NULL,NULL,'Satigny è il comune viticolo più grande della Svizzera per estensione, nella Riva Destra (tra Rodano e Giura).'),
('GINEVRA','multipla','Quale percentuale della produzione di Ginevra è rappresentata da vini rossi?','{"a":"44%","b":"56%","c":"70%","d":"35%"}','"b"',NULL,NULL,'Il cantone di Ginevra produce il 56% di vini rossi e il 44% di bianchi. Il Gamay (20%) e il Chasselas (19%) sono i vitigni più piantati.'),
('GINEVRA','multipla','Cos''è l''Esprit de Genève?','{"a":"Un vino dolce tipico di Ginevra","b":"Una menzione per blend con almeno 50% Gamay e max 20% altri vitigni","c":"Il nome locale del Chasselas di Ginevra","d":"Un Grand Cru della riva sinistra del Rodano"}','"b"',NULL,NULL,'L''Esprit de Genève è una menzione speciale per vini rossi con almeno 50% Gamay e massimo 20% di altri vitigni, con controlli di qualità.'),

-- GINEVRA — vero_falso
('GINEVRA','vero_falso','Il cantone di Ginevra ha vitigni autoctoni locali.',NULL,'false',NULL,NULL,'Falso. Ginevra non ha vitigni autoctoni. La produzione si concentra su vitigni internazionali e incroci svizzeri come Gamaret e Garanoir.'),
('GINEVRA','vero_falso','La riva destra del Rodano con Satigny e Dardagny è la zona vinicola più grande del cantone di Ginevra.',NULL,'true',NULL,NULL,'Vero. La Riva Destra è la più estesa del cantone, ospitando Satigny, il comune viticolo più grande di tutta la Svizzera.'),

-- GINEVRA — aperta
('GINEVRA','aperta','Descrivi la struttura delle denominazioni nel cantone di Ginevra.',NULL,NULL,'Ginevra ha 1 AOC cantonale (AOC Genève) e 22 AOC Premier Cru per aree specifiche. La menzione Esprit de Genève è riservata ai rossi con almeno 50% Gamay che superano i controlli di qualità su resa, grado alcolico e degustazione.',NULL,'AOC Genève (1 AOC cantonale) e 22 AOC Premier Cru. Menzione Esprit de Genève per rossi con almeno 50% Gamay con controlli qualità.'),

-- GINEVRA — classifica_colore
('GINEVRA','classifica_colore','Classifica i seguenti vitigni coltivati a Ginevra:',NULL,'{"Gamay":"Rosso","Chasselas":"Bianco","Gamaret":"Rosso","Pinot Noir":"Rosso","Chardonnay":"Bianco","Garanoir":"Rosso","Merlot":"Rosso","Sauvignon Blanc":"Bianco"}',NULL,'["Gamay","Chasselas","Gamaret","Pinot Noir","Chardonnay","Garanoir","Merlot","Sauvignon Blanc"]','Gamaret e Garanoir sono incroci svizzeri a bacca rossa. Chasselas, Chardonnay e Sauvignon Blanc sono bianchi.'),

-- GINEVRA — abbinamento
('GINEVRA','abbinamento','Abbina ogni area del cantone di Ginevra alla sua descrizione:',NULL,'{"Riva Destra (Satigny, Dardagny)":"La zona più grande, Satigny è il comune viticolo più esteso di Svizzera","Tra Arve e Rodano (Bernex)":"Zona urbana a sud della città, suoli morenici e alluvionali","Tra Arve e Lago (Meinier)":"Zona est vicino al lago, Premier Cru Mandement de Jussy"}',NULL,'{"sx":["Riva Destra (Satigny, Dardagny)","Tra Arve e Rodano (Bernex)","Tra Arve e Lago (Meinier)"],"dx":["La zona più grande, Satigny è il comune viticolo più esteso di Svizzera","Zona urbana a sud della città, suoli morenici e alluvionali","Zona est vicino al lago, Premier Cru Mandement de Jussy"]}','Le tre zone del cantone di Ginevra si dividono geograficamente in relazione ai fiumi Rodano e Arve e al lago.'),

-- GINEVRA — comuni
('GINEVRA','comuni','In quale comune si trovano le Coteaux de Dardagny, uno dei Premier Cru più noti di Ginevra?','{"a":"Bernex","b":"Meinier","c":"Dardagny","d":"Satigny"}','"c"',NULL,NULL,'Le Coteaux de Dardagny sono il Premier Cru del comune di Dardagny, nella riva destra del Rodano.'),

-- ================================================================
-- TRE LAGHI — multipla
-- ================================================================
('TRE_LAGHI','multipla','Quali sono i tre laghi che danno il nome alla regione Trois Lacs?','{"a":"Lemano, Maggiore, Lugano","b":"Neuchâtel, Bienna, Morat","c":"Costanza, Zurigo, Zugo","d":"Thun, Brienz, Lucerna"}','"b"',NULL,NULL,'La regione Trois Lacs prende il nome dai laghi di Neuchâtel, Bienna (Bienne) e Morat (Murten).'),
('TRE_LAGHI','multipla','Come si chiama il vento freddo del Giura tipico del cantone Neuchâtel?','{"a":"Bise","b":"Föhn","c":"Joran","d":"Tramontana"}','"c"',NULL,NULL,'Il Joran è un vento forte e freddo dal Giura tipico del Neuchâtel, che obbliga ad usare fili di sostegno per le viti.'),
('TRE_LAGHI','multipla','L''Oeil de Perdrix è una specialità di Neuchâtel. Di cosa si tratta?','{"a":"Un Chasselas non filtrato","b":"Un rosato da Pinot Noir con macerazione breve","c":"Un Pinot Noir vinificato in bianco","d":"Un vino dolce da uve botritizzate"}','"b"',NULL,NULL,'L''Oeil de Perdrix è un rosato da Pinot Nero con macerazione breve, tipico di Neuchâtel.'),
('TRE_LAGHI','multipla','Il Non Filtré di Neuchâtel è commercializzato ogni anno a partire da quando?','{"a":"3° giovedì di novembre","b":"3° mercoledì di gennaio","c":"1° dicembre","d":"3° venerdì di ottobre"}','"b"',NULL,NULL,'Il Non Filtré (Chasselas non filtrato, dal 1995) viene commercializzato a partire dal terzo mercoledì di gennaio.'),

-- TRE LAGHI — vero_falso
('TRE_LAGHI','vero_falso','Il Pinot Noir è il vitigno più piantato nella regione Trois Lacs con circa il 49% della superficie.',NULL,'true',NULL,NULL,'Vero. Il Pinot Noir copre il 49% della superficie vitata dei Tre Laghi, seguito dal Chasselas al 28%.'),
('TRE_LAGHI','vero_falso','La Perdrix Blanche è un Pinot Nero vinificato in bianco, specialità esclusiva di Neuchâtel.',NULL,'true',NULL,NULL,'Vero. La Perdrix Blanche è il Pinot Nero vinificato in bianco (blanc de noirs), etichetta protetta di Neuchâtel.'),

-- TRE LAGHI — aperta
('TRE_LAGHI','aperta','Descrivi le specialità enologiche della regione di Neuchâtel (almeno 3).',NULL,NULL,'1. Oeil de Perdrix: rosato da Pinot Nero con macerazione breve. 2. Perdrix Blanche: Pinot Nero vinificato in bianco. 3. Non Filtré: Chasselas non filtrato commercializzato dal 3° mercoledì di gennaio. 4. Gerle d''Or: marchio per i migliori Chasselas AOC.',NULL,'Oeil de Perdrix (rosato da Pinot Nero), Perdrix Blanche (Pinot Nero in bianco), Non Filtré (Chasselas non filtrato da gennaio), Gerle d''Or (etichetta qualità).'),

-- TRE LAGHI — abbinamento
('TRE_LAGHI','abbinamento','Abbina ogni cantone dei Tre Laghi alla sua AOC principale:',NULL,'{"Canton Neuchâtel":"AOC Neuchâtel","Canton Berna":"AOC Lac de Bienne","Canton Friburgo (Vully)":"AOC Vully","Canton Friburgo (Cheyres)":"AOC Cheyres"}',NULL,'{"sx":["Canton Neuchâtel","Canton Berna","Canton Friburgo (Vully)","Canton Friburgo (Cheyres)"],"dx":["AOC Neuchâtel","AOC Lac de Bienne","AOC Vully","AOC Cheyres"]}','I Tre Laghi si estendono su tre cantoni: Neuchâtel (AOC Neuchâtel), Berna (AOC Lac de Bienne) e Friburgo (AOC Vully e Cheyres).'),

-- TRE LAGHI — comuni
('TRE_LAGHI','comuni','In quale città si concentra la produzione principale del cantone di Neuchâtel?','{"a":"Fribourg","b":"Biel/Bienne","c":"Neuchâtel","d":"Murten"}','"c"',NULL,NULL,'La città di Neuchâtel è il centro della regione vinicola omonima, con vigne sulle rive del lago.'),

-- ================================================================
-- TICINO — multipla
-- ================================================================
('TICINO','multipla','Qual è il vitigno dominante in Ticino che rappresenta circa l''80% della produzione?','{"a":"Bondola","b":"Pinot Nero","c":"Merlot","d":"Cabernet Sauvignon"}','"c"',NULL,NULL,'Il Merlot copre circa l''80% della superficie vitata del Ticino.'),
('TICINO','multipla','Come è diviso il Ticino dalla montagna del Monte Ceneri?','{"a":"In Ovest e Est","b":"In Sopraceneri e Sottoceneri","c":"In Alto Ticino e Basso Ticino","d":"In Canton Nord e Canton Sud"}','"b"',NULL,NULL,'Il Monte Ceneri divide il Ticino in Sopraceneri (suoli granitici e gneis) e Sottoceneri (suoli morenichi con argilla e calcare).'),
('TICINO','multipla','Cos''è il Merlot Bianco ticinese?','{"a":"Un Merlot rosato","b":"Un blanc de noirs da Merlot, specialità emblematica del Ticino","c":"Un incrocio locale tra Merlot e Pinot Grigio","d":"Un Merlot dolce da uve appassite"}','"b"',NULL,NULL,'Il Merlot Bianco (blanc de noirs da Merlot) è una specialità emblematica del Ticino: uve rosse pressate senza macerazione.'),
('TICINO','multipla','Cosa prevede la menzione Riserva dell''AOC Ticino per i vini rossi?','{"a":"Almeno 6 mesi in legno","b":"Millesimo obbligatorio e minimo 18 mesi di invecchiamento","c":"Solo da uve di singola vigna","d":"Almeno 12 mesi in barrique nuova"}','"b"',NULL,NULL,'La menzione Riserva nell''AOC Ticino prevede millesimo obbligatorio e invecchiamento minimo di 18 mesi per i rossi.'),

-- TICINO — vero_falso
('TICINO','vero_falso','Il Ticino ha circa 2.200 ore di sole annue, il che lo rende il solarium della Svizzera.',NULL,'true',NULL,NULL,'Vero. Il Ticino, a sud delle Alpi, ha circa 2.200 ore di sole annue ma anche il record di precipitazioni (1.600-1.800 mm/anno).'),
('TICINO','vero_falso','La Bondola è il principale vitigno autoctono rosso del Ticino.',NULL,'true',NULL,NULL,'Vero. La Bondola è l''unico vitigno autoctono rosso del Ticino, oggi quasi scomparso a favore del Merlot.'),

-- TICINO — aperta
('TICINO','aperta','Descrivi le differenze pedologiche tra Sopraceneri e Sottoceneri in Ticino.',NULL,NULL,'Sopraceneri (Bellinzona, Locarno): suoli di origine glaciale e fluviale, granito, gneiss, rocce cristalline, sabbia e ghiaia. Suoli più acidi e poveri. Sottoceneri (Lugano, Mendrisiotto): suoli di origine morenica con argilla, sabbia, ghiaia e calcari. Suoli più fertili e diversificati.',NULL,'Sopraceneri: suoli glaciali e fluviali, granito, gneiss, rocce cristalline. Sottoceneri: suoli morenichi con argilla, sabbia, ghiaia e calcari.'),

-- TICINO — elenco
('TICINO','elenco','Elenca le tipologie di vini che rientrano nell''AOC Ticino (Ticino DOC).',NULL,NULL,'Ticino DOC include: Rosso, Bianco, Rosato. La menzione del vitigno è consentita se >10%, indicazione esclusiva se >90%. Menzione Riserva: millesimo obbligatorio e invecchiamento minimo (18 mesi rossi, 12 bianchi).',NULL,'Rosso, Bianco, Rosato. Menzione vitigno possibile se >10%, esclusiva se >90%. Riserva: millesimo + invecchiamento minimo.'),

-- TICINO — abbinamento
('TICINO','abbinamento','Abbina ogni zona del Ticino ai suoi suoli caratteristici:',NULL,'{"Sopraceneri (Bellinzona, Locarno)":"Suoli glaciali e fluviali: granito, gneiss, sabbia e ghiaia","Sottoceneri (Lugano, Mendrisiotto)":"Suoli morenichi: argilla, sabbia, ghiaia e calcari"}',NULL,'{"sx":["Sopraceneri (Bellinzona, Locarno)","Sottoceneri (Lugano, Mendrisiotto)"],"dx":["Suoli glaciali e fluviali: granito, gneiss, sabbia e ghiaia","Suoli morenichi: argilla, sabbia, ghiaia e calcari"]}','La divisione del Ticino da parte del Monte Ceneri crea due zone pedologicamente distinte.'),

-- TICINO — comuni
('TICINO','comuni','Quale zona del Ticino è nota per la produzione di Merlot di alta qualità?','{"a":"Locarnese","b":"Mendrisiotto (Sottoceneri)","c":"Bellinzonese (Sopraceneri)","d":"Valle Maggia"}','"b"',NULL,NULL,'Il Mendrisiotto, nel Sottoceneri, è la zona di eccellenza per il Merlot ticinese con suoli morenichi ideali.'),

-- ================================================================
-- SVIZZERA TEDESCA — multipla
-- ================================================================
('SVIZZERA_TEDESCA','multipla','Qual è il vitigno principale della Svizzera Tedesca?','{"a":"Müller-Thurgau","b":"Completer","c":"Pinot Noir (Blauburgunder)","d":"Räuschling"}','"c"',NULL,NULL,'Il Pinot Noir (Blauburgunder) è il vitigno dominante della Svizzera Tedesca.'),
('SVIZZERA_TEDESCA','multipla','Chi ha creato il Müller-Thurgau e quando?','{"a":"Johann Gutenberg nel 1820","b":"Hermann Müller del cantone Thurgau nel 1882","c":"Un viticoltore di Zurigo nel 1920","d":"Un istituto austriaco nel 1900"}','"b"',NULL,NULL,'Hermann Müller, originario del cantone di Turgovia (Thurgau), ha creato il Müller-Thurgau nel 1882. Incrocio Riesling x Madeleine Royale.'),
('SVIZZERA_TEDESCA','multipla','Cosa è la Bündner Herrschaft nei Grigioni?','{"a":"Una cooperativa vinicola storica","b":"La principale zona vinicola dei Grigioni, la Borgogna della Svizzera","c":"Un Grand Cru per il Completer","d":"Il sistema di allevamento tradizionale nei Grigioni"}','"b"',NULL,NULL,'La Bündner Herrschaft (Maienfeld, Jenins, Malans, Fläsch) è chiamata la Borgogna della Svizzera per la qualità del Pinot Nero.'),
('SVIZZERA_TEDESCA','multipla','Il Completer è un vitigno autoctono di quale cantone?','{"a":"Zurigo","b":"Sciaffusa","c":"Grigioni","d":"Argovia"}','"c"',NULL,NULL,'Il Completer è il vitigno bianco autoctono dei Grigioni, con origini medievali. Rarissimo, produce vini longevi.'),

-- SVIZZERA TEDESCA — vero_falso
('SVIZZERA_TEDESCA','vero_falso','Il Räuschling è un vitigno storico autoctono della zona di Zurigo.',NULL,'true',NULL,NULL,'Vero. Il Räuschling è il vitigno bianco storico di Zurigo, quasi scomparso nel XX secolo e ora in fase di recupero.'),
('SVIZZERA_TEDESCA','vero_falso','La Svizzera Tedesca comprende esattamente 5 cantoni viticoli.',NULL,'false',NULL,NULL,'Falso. La Svizzera Tedesca comprende ben 17 cantoni viticoli, tra cui Zurigo, Grigioni, Sciaffusa, Argovia, Turgovia.'),
('SVIZZERA_TEDESCA','vero_falso','Il Föhn viene chiamato Traubenkocher (cuocitore d''uva) per il suo effetto positivo sulla maturazione.',NULL,'true',NULL,NULL,'Vero. Il Föhn è fondamentale per raggiungere la maturazione ottimale nei cantoni più settentrionali della Svizzera.'),

-- SVIZZERA TEDESCA — aperta
('SVIZZERA_TEDESCA','aperta','Descrivi le caratteristiche del Müller-Thurgau e il suo nome tradizionale in Svizzera.',NULL,NULL,'Creato nel 1882 da Hermann Müller del cantone Thurgau. In Svizzera chiamato Riesling-Sylvaner, ma è in realtà un incrocio Riesling x Madeleine Royale. Matura precocemente, produce vini floreali e aromatici. Diffuso in tutta la Svizzera Tedesca, specialmente in Turgovia e Argovia.',NULL,'Müller-Thurgau: creato 1882, cantone Thurgau. In Svizzera: Riesling-Sylvaner. Incrocio Riesling x Madeleine Royale. Matura precocemente, vini floreali.'),

-- SVIZZERA TEDESCA — classifica_colore
('SVIZZERA_TEDESCA','classifica_colore','Classifica i seguenti vitigni tipici della Svizzera Tedesca:',NULL,'{"Pinot Noir":"Rosso","Räuschling":"Bianco","Completer":"Bianco","Müller-Thurgau":"Bianco","Regent":"Rosso","Cabernet Jura":"Rosso","Gamaret":"Rosso","Pinot Gris":"Bianco"}',NULL,'["Pinot Noir","Räuschling","Completer","Müller-Thurgau","Regent","Cabernet Jura","Gamaret","Pinot Gris"]','Räuschling e Completer sono i due bianchi autoctoni. Regent e Cabernet Jura sono incroci rossi moderni resistenti.'),

-- SVIZZERA TEDESCA — abbinamento
('SVIZZERA_TEDESCA','abbinamento','Abbina ogni cantone della Svizzera Tedesca al suo vitigno/caratteristica più nota:',NULL,'{"Zurigo":"Räuschling (vitigno storico) e Pinot Nero","Grigioni":"Completer (autoctono medievale) e Pinot Nero della Bündner Herrschaft","Sciaffusa":"Pinot Nero su suoli calcarei, vicino al confine tedesco"}',NULL,'{"sx":["Zurigo","Grigioni","Sciaffusa"],"dx":["Räuschling (vitigno storico) e Pinot Nero","Completer (autoctono medievale) e Pinot Nero della Bündner Herrschaft","Pinot Nero su suoli calcarei, vicino al confine tedesco"]}','Ogni cantone della Svizzera Tedesca ha la propria identità viticola.'),

-- SVIZZERA TEDESCA — comuni
('SVIZZERA_TEDESCA','comuni','In quale area dei Grigioni si trova la Bündner Herrschaft, zona d''eccellenza per il Pinot Nero?','{"a":"Coira (Chur)","b":"Maienfeld, Jenins, Malans, Fläsch","c":"Davos","d":"St. Moritz"}','"b"',NULL,NULL,'La Bündner Herrschaft si trova nei comuni di Maienfeld, Jenins, Malans e Fläsch, a nord dei Grigioni.');

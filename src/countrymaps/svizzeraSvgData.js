// Svizzera — 6 regioni vinicole
// Coordinate basate sulla forma reale della Svizzera, vista dall'alto
// ViewBox 300x200, orientamento ovest-est (Ginevra in basso-sx, Grigioni in destra)
export const SVG_W = 300, SVG_H = 200;

export const REGIONS = {
  // Vallese: grande valle alpina centrale, orientamento E-W lungo il Rodano
  VALLESE: {
    id: 'VALLESE',
    label: 'Vallese',
    cx: 130, cy: 140,
    path: 'M68,155 L75,148 L90,145 L110,142 L130,138 L150,136 L170,138 L185,142 L192,148 L195,155 L190,162 L175,168 L155,170 L135,172 L115,170 L95,165 L80,160 Z'
  },
  // Vaud: lungo il lago Lemano, nord-est di Ginevra
  VAUD: {
    id: 'VAUD',
    label: 'Vaud',
    cx: 85, cy: 105,
    path: 'M48,128 L55,118 L62,110 L68,100 L72,90 L80,82 L92,80 L105,78 L118,80 L125,88 L122,98 L115,108 L108,118 L100,128 L88,135 L75,135 L62,132 Z'
  },
  // Ginevra: punta sudovest, attorno al lago di Ginevra
  GINEVRA: {
    id: 'GINEVRA',
    label: 'Ginevra',
    cx: 42, cy: 128,
    path: 'M22,118 L32,112 L42,108 L52,110 L58,118 L55,128 L48,136 L38,140 L28,138 L20,130 Z'
  },
  // Tre Laghi: zona centrale (Neuchâtel, Biel, Morat)
  TRE_LAGHI: {
    id: 'TRE_LAGHI',
    label: 'Tre Laghi',
    cx: 118, cy: 62,
    path: 'M82,82 L92,70 L102,60 L112,52 L128,48 L142,50 L150,58 L148,68 L140,78 L130,84 L118,88 L105,88 L92,86 Z'
  },
  // Svizzera Tedesca: grande area del nord, comprende 17 cantoni
  SVIZZERA_TEDESCA: {
    id: 'SVIZZERA_TEDESCA',
    label: 'Svizzera Tedesca',
    cx: 198, cy: 72,
    path: 'M128,48 L142,50 L158,48 L175,44 L195,38 L218,36 L240,38 L260,42 L278,50 L285,62 L280,75 L268,85 L252,92 L235,98 L215,102 L195,104 L178,102 L165,96 L155,86 L150,76 L148,68 L150,58 Z'
  },
  // Ticino: a sud delle Alpi, orientamento longitudinale
  TICINO: {
    id: 'TICINO',
    label: 'Ticino',
    cx: 210, cy: 148,
    path: 'M185,142 L195,138 L205,132 L215,126 L225,124 L235,128 L240,138 L238,150 L232,160 L222,168 L210,172 L198,170 L190,162 L188,152 Z'
  },
};

// Svizzera — mappe sottozone per ogni regione vinicola
// Ogni regione ha "province" (zone viticole) con path SVG, cx/cy centroidi
// e comuni_map con coordinate per i comuni chiave

export const REGION_MAPS = {

  // ── VALLESE ────────────────────────────────────────────────────────────────
  // 3 sottozone: Basso Vallese, Vallese Centrale, Alto Vallese
  VALLESE: {
    w: 340, h: 220,
    comuni_map: [
      { nome: 'Martigny',      x: 52,  y: 110, provincia: 'BASSO_VALLESE' },
      { nome: 'Fully',         x: 75,  y: 125, provincia: 'BASSO_VALLESE' },
      { nome: 'Saillon',       x: 100, y: 115, provincia: 'BASSO_VALLESE' },
      { nome: 'Chamoson',      x: 130, y: 108, provincia: 'VALLESE_CENTRALE' },
      { nome: 'Vétroz',        x: 155, y: 115, provincia: 'VALLESE_CENTRALE' },
      { nome: 'Sion',          x: 180, y: 105, provincia: 'VALLESE_CENTRALE' },
      { nome: 'Sierre',        x: 212, y: 110, provincia: 'VALLESE_CENTRALE' },
      { nome: 'Visp',          x: 258, y: 105, provincia: 'ALTO_VALLESE' },
      { nome: 'Visperterminen',x: 268, y: 88,  provincia: 'ALTO_VALLESE' },
      { nome: 'Salquenen',     x: 228, y: 118, provincia: 'ALTO_VALLESE' },
    ],
    provinces: {
      BASSO_VALLESE: {
        path: 'M14,80 L14,180 L128,180 L128,140 L110,125 L85,115 L60,118 L42,110 L28,90 Z',
        cx: 72, cy: 135
      },
      VALLESE_CENTRALE: {
        path: 'M128,140 L128,180 L232,180 L232,145 L215,130 L198,122 L175,118 L155,120 L138,130 Z',
        cx: 182, cy: 153
      },
      ALTO_VALLESE: {
        path: 'M232,145 L232,180 L326,180 L326,80 L295,70 L265,72 L248,85 L240,100 L238,120 Z',
        cx: 278, cy: 132
      },
    },
  },

  // ── VAUD ───────────────────────────────────────────────────────────────────
  // 4 sottozone: Lavaux, La Côte, Chablais, Nord Vaudois
  VAUD: {
    w: 340, h: 260,
    comuni_map: [
      { nome: 'Lausanne',    x: 145, y: 148, provincia: 'LAVAUX' },
      { nome: 'Vevey',       x: 188, y: 138, provincia: 'LAVAUX' },
      { nome: 'Montreux',    x: 210, y: 148, provincia: 'LAVAUX' },
      { nome: 'Dézaley',     x: 172, y: 130, provincia: 'LAVAUX' },
      { nome: 'Morges',      x: 110, y: 148, provincia: 'LA_COTE' },
      { nome: 'Nyon',        x: 68,  y: 158, provincia: 'LA_COTE' },
      { nome: 'Rolle',       x: 88,  y: 155, provincia: 'LA_COTE' },
      { nome: 'Aigle',       x: 235, y: 168, provincia: 'CHABLAIS' },
      { nome: 'Villeneuve',  x: 218, y: 162, provincia: 'CHABLAIS' },
      { nome: 'Neuchâtel',   x: 155, y: 72,  provincia: 'NORD_VAUDOIS' },
      { nome: 'Bonvillars',  x: 120, y: 85,  provincia: 'NORD_VAUDOIS' },
    ],
    provinces: {
      LAVAUX: {
        path: 'M138,120 L138,200 L230,200 L230,165 L215,150 L198,138 L175,125 L155,122 Z',
        cx: 182, cy: 162
      },
      LA_COTE: {
        path: 'M42,140 L42,200 L138,200 L138,120 L115,118 L90,122 L65,132 L48,140 Z',
        cx: 90, cy: 162
      },
      CHABLAIS: {
        path: 'M230,165 L230,200 L298,200 L298,155 L270,145 L248,148 L235,158 Z',
        cx: 264, cy: 178
      },
      NORD_VAUDOIS: {
        path: 'M42,100 L42,140 L48,140 L65,132 L90,122 L115,118 L138,120 L155,122 L172,110 L168,80 L148,65 L118,62 L88,68 L62,82 L46,95 Z',
        cx: 105, cy: 98
      },
    },
  },

  // ── GINEVRA ────────────────────────────────────────────────────────────────
  // 3 sottozone: Riva Destra, Tra Arve e Rodano, Tra Arve e Lago
  GINEVRA: {
    w: 340, h: 280,
    comuni_map: [
      { nome: 'Satigny',     x: 148, y: 90,  provincia: 'RIVA_DESTRA' },
      { nome: 'Dardagny',    x: 115, y: 88,  provincia: 'RIVA_DESTRA' },
      { nome: 'Russin',      x: 130, y: 100, provincia: 'RIVA_DESTRA' },
      { nome: 'Bernex',      x: 165, y: 170, provincia: 'ARVE_RODANO' },
      { nome: 'Bardonnex',   x: 188, y: 188, provincia: 'ARVE_RODANO' },
      { nome: 'Meinier',     x: 232, y: 152, provincia: 'ARVE_LAGO' },
      { nome: 'Genève',      x: 175, y: 135, provincia: 'RIVA_DESTRA' },
    ],
    provinces: {
      RIVA_DESTRA: {
        path: 'M62,62 L62,148 L175,148 L200,130 L215,108 L200,80 L178,65 L148,58 L118,60 L90,62 Z',
        cx: 145, cy: 102
      },
      ARVE_RODANO: {
        path: 'M145,148 L145,230 L240,230 L240,195 L218,175 L200,160 L180,150 L162,148 Z',
        cx: 195, cy: 190
      },
      ARVE_LAGO: {
        path: 'M175,148 L200,130 L278,148 L278,220 L240,220 L240,195 L218,175 L200,160 Z',
        cx: 232, cy: 178
      },
    },
  },

  // ── TRE LAGHI ──────────────────────────────────────────────────────────────
  // 3 sottozone: Canton Neuchâtel, Lac de Bienne (Berna), Vully/Friburgo
  TRE_LAGHI: {
    w: 340, h: 240,
    comuni_map: [
      { nome: 'Neuchâtel',   x: 132, y: 118, provincia: 'NEUCHATEL' },
      { nome: 'Auvernier',   x: 115, y: 128, provincia: 'NEUCHATEL' },
      { nome: 'Cortaillod',  x: 105, y: 142, provincia: 'NEUCHATEL' },
      { nome: 'Twann',       x: 200, y: 105, provincia: 'LAC_BIENNE' },
      { nome: 'Ligerz',      x: 218, y: 112, provincia: 'LAC_BIENNE' },
      { nome: 'Vully',       x: 255, y: 148, provincia: 'VULLY_FRIBURGO' },
      { nome: 'Cheyres',     x: 285, y: 168, provincia: 'VULLY_FRIBURGO' },
    ],
    provinces: {
      NEUCHATEL: {
        path: 'M42,80 L42,200 L165,200 L165,155 L148,140 L135,122 L125,102 L110,85 L80,75 L58,76 Z',
        cx: 100, cy: 138
      },
      LAC_BIENNE: {
        path: 'M165,80 L165,200 L240,200 L240,155 L228,135 L215,115 L200,98 L185,82 Z',
        cx: 202, cy: 142
      },
      VULLY_FRIBURGO: {
        path: 'M240,80 L240,200 L298,200 L298,120 L280,88 L260,80 Z',
        cx: 268, cy: 148
      },
    },
  },

  // ── SVIZZERA TEDESCA ───────────────────────────────────────────────────────
  // 4 sottozone: Zurigo, Grigioni (Bündner Herrschaft), Sciaffusa, Altri cantoni
  SVIZZERA_TEDESCA: {
    w: 340, h: 280,
    comuni_map: [
      { nome: 'Zürich',      x: 145, y: 130, provincia: 'ZURIGO' },
      { nome: 'Meilen',      x: 162, y: 148, provincia: 'ZURIGO' },
      { nome: 'Hallau',      x: 120, y: 58,  provincia: 'SCIAFFUSA' },
      { nome: 'Maienfeld',   x: 272, y: 128, provincia: 'GRIGIONI' },
      { nome: 'Malans',      x: 258, y: 138, provincia: 'GRIGIONI' },
      { nome: 'Aarau',       x: 98,  y: 138, provincia: 'ALTRI' },
      { nome: 'Frauenfeld',  x: 185, y: 75,  provincia: 'ALTRI' },
    ],
    provinces: {
      ZURIGO: {
        path: 'M115,100 L115,200 L210,200 L210,108 L185,95 L158,90 L135,92 Z',
        cx: 162, cy: 148
      },
      SCIAFFUSA: {
        path: 'M62,42 L62,100 L162,100 L162,58 L140,42 L105,38 L78,40 Z',
        cx: 112, cy: 72
      },
      GRIGIONI: {
        path: 'M210,80 L210,240 L298,240 L298,80 L270,62 L245,60 L225,68 Z',
        cx: 255, cy: 160
      },
      ALTRI: {
        path: 'M42,42 L42,200 L115,200 L115,100 L95,95 L80,85 L65,65 L48,48 Z',
        cx: 80, cy: 132
      },
    },
  },

  // ── TICINO ─────────────────────────────────────────────────────────────────
  // 2 sottozone: Sopraceneri, Sottoceneri
  TICINO: {
    w: 340, h: 280,
    comuni_map: [
      { nome: 'Bellinzona',  x: 148, y: 88,  provincia: 'SOPRACENERI' },
      { nome: 'Locarno',     x: 112, y: 105, provincia: 'SOPRACENERI' },
      { nome: 'Lugano',      x: 162, y: 185, provincia: 'SOTTOCENERI' },
      { nome: 'Mendrisio',   x: 188, y: 218, provincia: 'SOTTOCENERI' },
      { nome: 'Ascona',      x: 95,  y: 118, provincia: 'SOPRACENERI' },
    ],
    provinces: {
      SOPRACENERI: {
        path: 'M42,42 L42,160 L180,160 L298,100 L298,42 L220,30 L148,28 L92,38 Z',
        cx: 165, cy: 100
      },
      SOTTOCENERI: {
        path: 'M42,160 L42,260 L298,260 L298,160 L180,160 Z',
        cx: 170, cy: 210
      },
    },
  },

};

// File dedicato ai dati statici condivisi tra componenti
// Separato per evitare import circolari

export const PAESI_REGIONI = {
  Italia: ['Abruzzo','Basilicata','Calabria','Campania','Emilia-Romagna','Friuli Venezia Giulia','Lazio','Liguria','Lombardia','Marche','Molise','Piemonte','Puglia','Sardegna','Sicilia','Toscana','Trentino-Alto Adige','Umbria','Valle d\'Aosta','Veneto'],
  Francia: ['Bordeaux','Bourgogne','Champagne','Loira','Alsazia','Lorena e Mosella','Jura','Savoia','Valle del Rodano','Provenza','Languedoc-Roussillon','Sud-Ovest','Corsica'],
  Germania: ['Ahr','Baden','Franken','Hessische Bergstraße','Mittelrhein','Mosel','Nahe','Pfalz','Rheingau','Rheinhessen','Saale-Unstrut','Sachsen','Württemberg'],
  Austria: ['Niederösterreich','Burgenland','Steiermark','Wien'],
  Svizzera: ['Vallese','Vaud','Ginevra','Ticino','Tre Laghi','Svizzera Tedesca'],
  Spagna: ['Rioja','Ribera del Duero / Rueda / Toro','Priorat','Cava','Galizia','Jerez','Canarie'],
  Portogallo: ['Vinho Verde','Douro / Porto','Dão','Bairrada','Alentejo','Setúbal','Madeira'],
}

export const PAESI_OPTIONS = ['', ...Object.keys(PAESI_REGIONI), 'Altro']

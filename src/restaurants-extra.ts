import type { AreaId } from "./catalog";
import type { Restaurant } from "./guide";

export type CatalogRestaurant = Restaurant & { id: string; area: AreaId; minutes: number };
const search = (name: string, area: string) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${name} ${area} Malta`)}`;
const row = (id: string, name: string, area: AreaId, cuisine: string, budget: Restaurant["budget"], euros: number, location: string, url?: string, visitMinutes?: number): CatalogRestaurant => ({
  id, name, area, cuisine, budget, averagePrice: `≈ ${euros} €`, location,
  cue: "Comprobad carta, apertura y disponibilidad para la fecha del viaje.",
  minutes: visitMinutes ?? (budget === "Caro" ? 90 : budget === "Medio" ? 65 : 45),
  googleUrl: search(name, location), url: url ?? search(name, location),
});

// Importes orientativos por persona para plato principal y bebida sin alcohol.
// No se atribuyen estrellas de Google sin una comprobación verificable.
export const extraRestaurants: CatalogRestaurant[] = [
  row("r-noni", "Noni", "valletta", "Maltesa contemporánea", "Caro", 75, "Republic Street, La Valeta", "https://noni.com.mt/", 120),
  row("r-rubino", "Rubino", "valletta", "Mediterránea", "Medio", 32, "Old Bakery Street, La Valeta", "https://rubinorestaurant.com/"),
  row("r-impasta", "Impasta Valletta", "valletta", "Pasta italiana", "Barato", 17, "La Valeta", "https://impastagroup.mt/"),
  row("r-talpetut", "Tal-Petut", "birgu", "Maltesa tradicional", "Caro", 42, "Birgu", "https://www.google.com/maps/search/?api=1&query=Tal-Petut+Birgu+Malta"),
  row("r-bebirgu", "BeBirgu", "birgu", "Mediterránea", "Medio", 25, "Birgu", "https://www.google.com/maps/search/?api=1&query=BeBirgu+Birgu+Malta"),
  row("r-sottovento", "Sottovento", "birgu", "Italiana y pizza", "Barato", 18, "Birgu Waterfront", "https://www.google.com/maps/search/?api=1&query=Sottovento+Birgu+Malta"),
  row("r-ilpirata-s", "Il Pirata Senglea", "senglea", "Italiana y pizza", "Medio", 25, "Triq il-Miġja tal-Papa, Senglea", "https://ilpirata.com.mt/senglea"),
  row("r-enchante", "Enchanté", "senglea", "Pescado y mediterránea", "Caro", 38, "Triq ix-Xatt Juan B. Azzopardo, Senglea", "https://www.enchanterestaurant.com/"),
  row("r-regatta", "Le Regatta Bistro by the Sea", "senglea", "Bistró", "Barato", 18, "Senglea waterfront"),
  row("r-cafe-rouge", "Cafe Rouge", "cospicua", "Mediterránea", "Medio", 25, "Triq Dom Mintoff, Cospicua", "https://caferougemalta.com/"),
  row("r-3cities", "3 Cities Take Away", "cospicua", "Pizza y bocados", "Barato", 14, "Triq l-Inkurunazzjoni, Cospicua"),
  row("r-dockone", "Cafe Du Brazil Dock One", "cospicua", "Café y platos ligeros", "Barato", 16, "Dock No. 1, Cospicua"),
  row("r-kolina", "Ta' Kolina", "sliema", "Maltesa", "Medio", 27, "151 Tower Road, Sliema", "https://www.takolinamalta.com/"),
  row("r-fernando", "Fernandõ Gastrotheque", "sliema", "Degustación contemporánea", "Caro", 100, "Tigné Street, Sliema", "https://www.fernando.com.mt/", 150),
  row("r-eeetwell", "eeetwell Sliema", "sliema", "Saludable y vegetariana", "Barato", 15, "Bisazza Street, Sliema", "https://eeetwell.com/"),
  row("r-alibaba", "Ali Baba", "gzira", "Libanesa", "Medio", 24, "Gżira"),
  row("r-adams", "Adam's Seafood Market", "gzira", "Pescado y marisco", "Caro", 43, "Gżira"),
  row("r-balance", "Balance Bowl", "gzira", "Vegetariana", "Barato", 16, "Gżira"),
  row("r-gozitan", "Gozitan Restaurant", "stjulians", "Maltesa y gozitana", "Medio", 28, "Paceville Street, San Julián", "https://gozitanrestaurant.com/"),
  row("r-biancos", "Bianco's", "stjulians", "Mediterránea y pizza", "Medio", 27, "Spinola Bay, San Julián", "https://www.biancos.info/"),
  row("r-obi", "OBI", "stjulians", "Japonesa de fusión", "Caro", 44, "Triq Ball, San Julián", "https://obi.com.mt/"),
  row("r-commando", "Commando", "mellieha", "Mediterránea", "Caro", 40, "Mellieħa"),
  row("r-core", "The Core", "mellieha", "Mediterránea", "Medio", 26, "Main Square, Mellieħa"),
  row("r-ilpirata-m", "Il Pirata Mellieħa", "mellieha", "Italiana", "Barato", 19, "Mellieħa", "https://ilpirata.com.mt/"),
  row("r-pawla", "Ta' Pawla", "stpauls", "Maltesa", "Medio", 26, "Bahía de San Pablo", "https://tapawlarestaurant.com/"),
  row("r-loa", "LOA", "stpauls", "Mediterránea contemporánea", "Caro", 42, "Bahía de San Pablo"),
  row("r-woodhut", "The Woodhut", "stpauls", "Parrilla y bocados", "Barato", 17, "Buġibba / Qawra"),
  row("r-medina", "The Medina Restaurant", "mdina", "Mediterránea", "Caro", 45, "7 Holy Cross Street, Mdina", "https://medinarestaurant.xaracollection.com/"),
  row("r-coogis", "Coogi's", "mdina", "Italiana y mediterránea", "Medio", 27, "Mdina"),
  row("r-trattoria", "Trattoria AD 1530", "mdina", "Italiana", "Barato", 20, "Mdina"),
  row("r-townhouse", "Townhouse No. 3", "rabat", "Mediterránea", "Caro", 38, "Rabat"),
  row("r-peristyle", "Peristyle", "rabat", "Maltesa y mediterránea", "Medio", 24, "Rabat", "https://www.peristylerestaurant.com/"),
  row("r-yanas", "Yana's", "rabat", "Mediterránea", "Medio", 23, "55 Triq Santu Wistin, Rabat"),
  row("r-arkati", "L'Arkati", "marsaxlokk", "Pescado y marisco", "Medio", 32, "70 Xatt is-Sajjieda, Marsaxlokk", "https://larkati.com/"),
  row("r-tartarun", "Tartarun", "marsaxlokk", "Pescado", "Caro", 48, "Marsaxlokk"),
  row("r-tannamari", "T'Annamari", "marsaxlokk", "Siciliana", "Medio", 28, "28 Xatt is-Sajjieda, Marsaxlokk", "https://www.tannamari.com/"),
  row("r-ricardu", "Ta' Rikardu", "gozo", "Gozitana", "Medio", 23, "Ċittadella, Victoria, Gozo"),
  row("r-maldonado", "Maldonado Bistro", "gozo", "Mediterránea", "Caro", 37, "Victoria, Gozo"),
  row("r-casavostra", "Casa Vostra", "gozo", "Pizza napolitana", "Barato", 18, "62 Republic Street, Victoria, Gozo", "https://casavostra.mt/casa-vostra-restaurant/"),
  row("r-karolina", "Ta' Karolina", "gozo", "Pescado y mediterránea", "Medio", 30, "Xlendi, Gozo", "https://karolinarestaurant.com/"),
];

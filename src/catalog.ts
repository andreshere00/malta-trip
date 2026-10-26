import type { EventKind } from "./data";

export const areas = [
  ["valletta", "La Valeta"], ["birgu", "Birgu"], ["senglea", "Senglea"], ["cospicua", "Cospicua"],
  ["sliema", "Sliema"], ["gzira", "Gżira"], ["stjulians", "San Julián y Paceville"],
  ["mellieha", "Mellieħa"], ["stpauls", "Bahía de San Pablo"], ["mdina", "Mdina"],
  ["rabat", "Rabat"], ["marsaxlokk", "Marsaxlokk"], ["gozo", "Gozo"], ["comino", "Comino"],
] as const;
export type AreaId = typeof areas[number][0];
export const areaName = Object.fromEntries(areas) as Record<AreaId, string>;

export type CatalogEvent = {
  id: string; title: string; area: AreaId; coordinates: [number, number]; minutes: number;
  kind: EventKind; description: string; price: number; url: string;
};
const mapUrl = (name: string, area: string) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${name} ${area} Malta`)}`;
const e = (id: string, title: string, area: AreaId, lon: number, lat: number, minutes: number, kind: EventKind, description: string): CatalogEvent => ({
  id, title, area, coordinates: [lon, lat], minutes, kind, description, price: 0, url: mapUrl(title, areaName[area]),
});

// These are outdoor/public stops. Zero is the entry estimate, not an estimate for getting there.
export const catalogEvents: CatalogEvent[] = [
  e("v-citygate", "City Gate y Parlamento", "valletta", 14.5091, 35.8993, 75, "monument", "Paseo exterior por la entrada contemporánea de La Valeta."),
  e("v-strait", "Strait Street y calles antiguas", "valletta", 14.5134, 35.8990, 105, "leisure", "Recorrido a pie por el centro histórico."),
  e("v-lower", "Lower Barrakka y costa", "valletta", 14.5171, 35.8969, 90, "leisure", "Mirador del Grand Harbour y paseo por la costa."),
  e("v-elmo", "Fort St Elmo · exterior", "valletta", 14.5184, 35.9028, 105, "monument", "Paseo alrededor del fuerte y sus murallas; no incluye entrada."),
  e("b-waterfront", "Birgu Waterfront", "birgu", 14.5240, 35.8883, 105, "leisure", "Paseo junto a los muelles históricos."),
  e("b-victory", "Victory Square y callejuelas", "birgu", 14.5221, 35.8869, 90, "monument", "Recorrido por el casco antiguo de Vittoriosa."),
  e("b-angelo", "Fort St Angelo · exterior", "birgu", 14.5233, 35.8923, 75, "monument", "Vistas del fuerte desde el frente marítimo; no incluye entrada."),
  e("s-gardjola", "Gardjola Gardens", "senglea", 14.5187, 35.8868, 105, "leisure", "Mirador del puerto desde el extremo de Senglea."),
  e("s-waterfront", "Paseo marítimo de Senglea", "senglea", 14.5183, 35.8845, 90, "leisure", "Muelles, barcas y vistas a Birgu."),
  e("s-church", "Basílica de Senglea · exterior", "senglea", 14.5176, 35.8870, 75, "monument", "Plaza y fachada de la basílica; acceso interior sujeto a horario."),
  e("c-dock", "Dock No. 1", "cospicua", 14.5210, 35.8840, 105, "leisure", "Recorrido por el antiguo dique y la marina."),
  e("c-gate", "St Helen Gate y murallas", "cospicua", 14.5200, 35.8807, 90, "monument", "Puerta monumental y fortificaciones de Bormla."),
  e("c-church", "Iglesia de la Inmaculada · exterior", "cospicua", 14.5222, 35.8824, 75, "monument", "Fachada y calles cercanas; interior según apertura."),
  e("sl-promenade", "Paseo de Sliema", "sliema", 14.5018, 35.9130, 105, "leisure", "Costa urbana y vistas a La Valeta."),
  e("sl-tigne", "Tigné Point y miradores", "sliema", 14.5114, 35.9087, 90, "leisure", "Camino costero cerca de B Suites."),
  e("sl-exiles", "Exiles Bay", "sliema", 14.4968, 35.9163, 75, "leisure", "Paseo por la bahía y el frente marítimo."),
  e("g-manoel", "Manoel Island · paseo exterior", "gzira", 14.5051, 35.9025, 105, "leisure", "Vistas del puerto y del fuerte desde los accesos abiertos."),
  e("g-strand", "Gżira Strand", "gzira", 14.4987, 35.9053, 90, "leisure", "Paseo junto a Marsamxett Harbour."),
  e("g-garden", "Jardines de Gżira", "gzira", 14.4964, 35.9056, 75, "leisure", "Pausa en los jardines públicos junto al paseo."),
  e("st-spinola", "Spinola Bay", "stjulians", 14.4900, 35.9193, 105, "leisure", "Barcas y paseo alrededor de la bahía."),
  e("st-balluta", "Balluta Bay", "stjulians", 14.4940, 35.9185, 90, "leisure", "Arquitectura y paseo marítimo."),
  e("st-george", "St George's Bay y Paceville", "stjulians", 14.4875, 35.9263, 75, "leisure", "Recorrido breve por la bahía y el barrio."),
  e("m-red", "Red Tower · exterior", "mellieha", 14.3429, 35.9708, 105, "monument", "Torre y panorámica del norte; no incluye entrada."),
  e("m-sanctuary", "Santuario de Mellieħa · exterior", "mellieha", 14.3636, 35.9605, 90, "monument", "Plaza y miradores; interior según horario."),
  e("m-ghadira", "Għadira Bay", "mellieha", 14.3570, 35.9680, 75, "leisure", "Paseo por la bahía, sin actividad de baño."),
  e("p-bugibba", "Plaza de Buġibba", "stpauls", 14.4125, 35.9517, 105, "leisure", "Paseo por el centro y la costa."),
  e("p-qawra", "Paseo de Qawra", "stpauls", 14.4305, 35.9562, 90, "leisure", "Ruta frente al mar."),
  e("p-tower", "Wignacourt Tower · exterior", "stpauls", 14.3985, 35.9491, 75, "monument", "Torre costera vista desde el paseo; no incluye entrada."),
  e("md-gate", "Puerta de Mdina y murallas", "mdina", 14.4040, 35.8861, 150, "monument", "Circuito a pie por la ciudad amurallada."),
  e("md-bastion", "Bastiones de Mdina", "mdina", 14.4023, 35.8873, 105, "leisure", "Vistas del interior de Malta desde la muralla."),
  e("md-square", "Plaza de la Catedral · exterior", "mdina", 14.4038, 35.8868, 90, "monument", "Plaza y fachadas históricas; no incluye entrada."),
  e("r-howard", "Howard Gardens", "rabat", 14.4050, 35.8845, 150, "leisure", "Paseo y pausa entre Mdina y Rabat."),
  e("r-stpaul", "Iglesia de San Pablo · exterior", "rabat", 14.3992, 35.8813, 105, "monument", "Plaza, fachada y calles de Rabat."),
  e("r-streets", "Rabat histórico", "rabat", 14.3999, 35.8834, 90, "leisure", "Callejuelas y plazas alrededor de Mdina."),
  e("mx-harbour", "Puerto pesquero de Marsaxlokk", "marsaxlokk", 14.5435, 35.8415, 165, "leisure", "Luzzu, paseo marítimo y fachadas del puerto."),
  e("mx-market", "Mercado dominical de Marsaxlokk", "marsaxlokk", 14.5431, 35.8412, 105, "leisure", "Puestos junto al puerto; confirmar actividad en noviembre."),
  e("mx-stpeter", "St Peter's Pool · mirador", "marsaxlokk", 14.5640, 35.8331, 90, "leisure", "Costa rocosa; requiere traslado y precaución con viento o lluvia."),
  e("go-dwejra", "Dwejra e Inland Sea", "gozo", 14.1914, 36.0536, 165, "leisure", "Paisaje costero; el traslado desde Victoria es considerable."),
  e("go-ramla", "Ramla Bay", "gozo", 14.2846, 36.0619, 105, "leisure", "Paseo por la playa de arena roja."),
  e("go-salt", "Salinas de Xwejni", "gozo", 14.2390, 36.0780, 90, "leisure", "Paseo costero por las salinas de Gozo."),
  e("go-pinu", "Santuario de Ta' Pinu · exterior", "gozo", 14.2152, 36.0623, 90, "monument", "Basílica y entorno rural; interior sujeto a horario."),
  e("co-blue", "Blue Lagoon · paseo", "comino", 14.3235, 36.0134, 165, "leisure", "Costa de Comino; requiere ferry específico."),
  e("co-santamaria", "Santa Marija Bay", "comino", 14.3378, 36.0200, 105, "leisure", "Sendero hasta la bahía, sujeto al tiempo."),
  e("co-tower", "Santa Marija Tower · exterior", "comino", 14.3246, 36.0091, 90, "monument", "Caminata hasta la torre; no incluye visita interior."),
];

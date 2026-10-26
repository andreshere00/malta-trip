import type { BookingId, RestaurantArea } from "./guide";
import { catalogEvents } from "./catalog";

export type DayId = "sat" | "sun" | "mon";
export type MondayPlan = "mdina" | "popeye";
export type SundayPlan = "gozo" | "comino" | "malta";
export type Transport = "ferry" | "bus" | "walk" | "transfer";
export type EventKind = "food" | "monument" | "leisure" | "transport";

export type Place = {
  id: string;
  name: string;
  short: string;
  coordinates: [number, number];
  detail: string;
};

export type Stop = {
  id: string;
  place: string;
  time: string;
  title: string;
  description: string;
  phase: "morning" | "afternoon";
  kind: EventKind;
  mode?: Transport;
  bookingIds?: BookingId[];
  restaurantArea?: RestaurantArea;
  infoUrl?: string;
};

export type RouteLine = {
  id: string;
  coordinates: [number, number][];
  mode: Transport;
};

export const places: Record<string, Place> = {
  ...Object.fromEntries(catalogEvents.map((event) => [event.id, { id: event.id, name: event.title, short: event.title, coordinates: event.coordinates, detail: event.description }])),
  apartment: { id: "apartment", name: "B Suites · 136 Triq Tigne'", short: "B Suites, Tas-Sliema", coordinates: [14.5065, 35.9099], detail: "B Suites, 136 Triq Tigne', Tas-Sliema, Malta. Marcador orientativo: comprobad el acceso en la reserva." },
  sliema: { id: "sliema", name: "Sliema Ferries", short: "Embarcadero", coordinates: [14.5051, 35.9087], detail: "Embarcaderos de La Valeta y del ferry rápido a Gozo, en Triq ix-Xatt." },
  vallettaPier: { id: "vallettaPier", name: "Ferry de La Valeta", short: "Llegada a La Valeta", coordinates: [14.5069, 35.9014], detail: "Terminal de Marsamxett; desde aquí se sube al casco histórico." },
  cathedral: { id: "cathedral", name: "Concatedral de San Juan", short: "Concatedral", coordinates: [14.5126, 35.8976], detail: "Visita cultural principal del sábado. Abre al turismo de lunes a sábado; cierra los domingos." },
  museum: { id: "museum", name: "Museo Arqueológico Nacional", short: "Museo Arqueológico", coordinates: [14.5105, 35.8982], detail: "Colección de la prehistoria maltesa en la Auberge de Provence. Visita opcional del sábado." },
  barrakka: { id: "barrakka", name: "Upper Barrakka Gardens", short: "Mirador", coordinates: [14.5125, 35.8959], detail: "Mirador sobre el Grand Harbour y las Tres Ciudades." },
  lowerBarrakka: { id: "lowerBarrakka", name: "Lower Barrakka Gardens", short: "Jardines Lower Barrakka", coordinates: [14.5171, 35.8969], detail: "Jardines y mirador sobre la entrada del Grand Harbour." },
  hastings: { id: "hastings", name: "Hastings Gardens", short: "Jardines Hastings", coordinates: [14.5063, 35.8999], detail: "Jardines junto a las murallas de La Valeta, con vistas a Marsamxett." },
  palaceExterior: { id: "palaceExterior", name: "Palacio del Gran Maestre", short: "Palacio, exterior", coordinates: [14.5144, 35.8990], detail: "Paseo por St George's Square y el exterior del palacio." },
  lascaris: { id: "lascaris", name: "Muelle de Lascaris", short: "Ferry a las Tres Ciudades", coordinates: [14.5133, 35.8942], detail: "Terminal de La Valeta para cruzar el Grand Harbour hacia Cospicua." },
  cospicua: { id: "cospicua", name: "Ferry de Cospicua", short: "Tres Ciudades", coordinates: [14.51985, 35.88409], detail: "Llegada del ferry de La Valeta hacia las Tres Ciudades." },
  birgu: { id: "birgu", name: "Birgu / Vittoriosa", short: "Birgu", coordinates: [14.5231, 35.8882], detail: "Paseo por las calles históricas y el frente marítimo." },
  senglea: { id: "senglea", name: "Gardjola Gardens, Senglea", short: "Mirador de Senglea", coordinates: [14.5187, 35.8868], detail: "Mirador sobre el Grand Harbour desde Senglea." },
  bugibba: { id: "bugibba", name: "Escala en Buġibba", short: "Escala del ferry", coordinates: [14.407, 35.952], detail: "Escala en el muelle de Buġibba; el ferry continúa hacia Gozo." },
  mgarr: { id: "mgarr", name: "Puerto de Mġarr, Gozo", short: "Puerto de Gozo", coordinates: [14.299, 36.022], detail: "Llegada por mar al puerto; desde la terminal, el autobús 301 lleva al centro de Victoria." },
  victoria: { id: "victoria", name: "Victoria", short: "Victoria", coordinates: [14.2392, 36.0441], detail: "Capital de Gozo; buen lugar para comer y conectar con los autobuses de la isla." },
  citadel: { id: "citadel", name: "Ċittadella", short: "Ciudadela", coordinates: [14.2396, 36.0463], detail: "Fortaleza sobre Victoria, con murallas y vistas de Gozo." },
  stGeorge: { id: "stGeorge", name: "Basílica de San Jorge", short: "San Jorge, Victoria", coordinates: [14.2387, 36.0444], detail: "Basílica y plaza en el centro de Victoria; comprobad el acceso interior." },
  villaRundle: { id: "villaRundle", name: "Villa Rundle Gardens", short: "Jardines de Victoria", coordinates: [14.2440, 36.0440], detail: "Jardines públicos cerca del centro de Victoria." },
  ggantija: { id: "ggantija", name: "Templos de Ġgantija", short: "Ġgantija", coordinates: [14.2693, 36.0478], detail: "Visita arqueológica de aproximadamente una hora; autobús 307 desde Victoria." },
  xaghra: { id: "xaghra", name: "Plaza de Xagħra", short: "Xagħra", coordinates: [14.2680, 36.0500], detail: "Paseo por la plaza del pueblo, a poca distancia de Ġgantija." },
  xlendi: { id: "xlendi", name: "Bahía de Xlendi", short: "Xlendi", coordinates: [14.2168, 36.0300], detail: "Paseo marítimo de Gozo para la última hora de luz y la cena." },
  dwejra: { id: "dwejra", name: "Dwejra y el Inland Sea", short: "Dwejra", coordinates: [14.1914, 36.0536], detail: "Paisaje costero del oeste de Gozo; requiere traslado adicional para llegar a la cena de Xlendi." },
  mdina: { id: "mdina", name: "Mdina", short: "Mdina", coordinates: [14.4033, 35.8858], detail: "Paseo por la antigua ciudad amurallada de Malta." },
  rabat: { id: "rabat", name: "Rabat", short: "Rabat", coordinates: [14.3993, 35.8817], detail: "Calles, comida y, si hay tiempo, las catacumbas de San Pablo." },
  catacombs: { id: "catacombs", name: "Catacumbas de San Pablo", short: "Catacumbas", coordinates: [14.4011, 35.8802], detail: "Yacimiento subterráneo de Rabat gestionado por Heritage Malta. Confirmad el horario del lunes." },
  mellieha: { id: "mellieha", name: "Mellieħa", short: "Almuerzo en Mellieħa", coordinates: [14.3609, 35.9574], detail: "Parada para comer tras Popeye Village; requiere un traslado corto desde Anchor Bay." },
  redTower: { id: "redTower", name: "Red Tower", short: "Red Tower", coordinates: [14.3429, 35.9708], detail: "Torre y mirador al norte de Mellieħa. Comprobad horario y acceso si queréis visitar el interior." },
  melliehaChurch: { id: "melliehaChurch", name: "Santuario de Mellieħa", short: "Mellieħa, paseo", coordinates: [14.3636, 35.9605], detail: "Paseo por la zona del santuario y sus miradores; acceso interior sujeto a horario." },
  popeye: { id: "popeye", name: "Popeye Village", short: "Popeye Village", coordinates: [14.3411, 35.9608], detail: "Antiguo decorado de la película de Popeye en Anchor Bay. En estas fechas abre 09:30–17:00; entrada de adulto: 15 € según la tarifa publicada." },
  airport: { id: "airport", name: "Aeropuerto de Malta", short: "Aeropuerto", coordinates: [14.4775, 35.8574], detail: "El lunes se sale a las 17:00 directamente desde la última zona visitada, con el equipaje." },
  hagarQim: { id: "hagarQim", name: "Ħaġar Qim y Mnajdra", short: "Templos de Ħaġar Qim", coordinates: [14.4414, 35.8270], detail: "Parque arqueológico del sur de Malta; entrada oficial de Heritage Malta." },
  cominoPier: { id: "cominoPier", name: "Blue Lagoon, Comino", short: "Desembarco en Comino", coordinates: [14.3238, 36.0135], detail: "Ferry desde Ċirkewwa/Marfa; consulta el último regreso." },
  cirkewwa: { id: "cirkewwa", name: "Ċirkewwa", short: "Puerto de Ċirkewwa", coordinates: [14.3272, 35.9894], detail: "Salida en barco hacia Comino." },
  marsaxlokk: { id: "marsaxlokk", name: "Marsaxlokk", short: "Puerto pesquero", coordinates: [14.5435, 35.8415], detail: "Paseo y restaurantes del puerto." },
};

export const dayMeta: Record<DayId, { date: string; weekday: string; title: string; subtitle: string; color: string }> = {
  sat: { date: "14 nov", weekday: "Sábado", title: "La Valeta y Birgu", subtitle: "Visitas 09:00–14:00 y 16:00–20:00", color: "#d43f5d" },
  sun: { date: "15 nov", weekday: "Domingo", title: "Gozo y Victoria", subtitle: "Visitas 09:00–14:00 y 16:00–20:00", color: "#5c1b35" },
  mon: { date: "16 nov", weekday: "Lunes", title: "Popeye o Mdina", subtitle: "09:00–14:00 · aeropuerto a las 17:00", color: "#f2a772" },
};

export const saturday: Stop[] = [
  { id: "sat-out", place: "sliema", time: "09:00", title: "Ferry a La Valeta", description: "Salida desde Sliema Ferries hacia el centro histórico.", phase: "morning", kind: "transport", mode: "ferry", bookingIds: ["vallettaFerry"] },
  { id: "sat-cathedral", place: "cathedral", time: "09:30–11:15", title: "Concatedral de San Juan", description: "Interior barroco y audioguía; el domingo cierra al turismo.", phase: "morning", kind: "monument", bookingIds: ["cathedral"] },
  { id: "sat-walk", place: "barrakka", time: "11:15–13:00", title: "La Valeta y Upper Barrakka", description: "Calles del centro, Grand Harbour y miradores.", phase: "morning", kind: "leisure", mode: "walk" },
  { id: "sat-lunch", place: "barrakka", time: "13:00–14:00", title: "Comida en La Valeta", description: "Dos opciones por la zona, desde mercado hasta cocina maltesa.", phase: "morning", kind: "food", restaurantArea: "valletta" },
  { id: "sat-cities", place: "lascaris", time: "15:45", title: "Ferry hacia Cospicua", description: "Embarque en Lascaris, entre las dos franjas de visitas.", phase: "afternoon", kind: "transport", mode: "ferry", bookingIds: ["threeCitiesFerry"] },
  { id: "sat-birgu", place: "birgu", time: "16:00–17:45", title: "Birgu / Vittoriosa", description: "Casco antiguo y frente marítimo al atardecer.", phase: "afternoon", kind: "monument", mode: "walk" },
  { id: "sat-return", place: "cospicua", time: "18:00", title: "Ferry de regreso", description: "Llegada a La Valeta a las 18:15; paso a Sliema a las 18:45.", phase: "afternoon", kind: "transport", mode: "ferry", bookingIds: ["threeCitiesFerry", "vallettaFerry"] },
  { id: "sat-sliema", place: "sliema", time: "18:45–19:00", title: "Paseo por Sliema", description: "Un paseo breve antes de cenar cerca del apartamento.", phase: "afternoon", kind: "leisure", mode: "walk" },
  { id: "sat-dinner", place: "apartment", time: "19:00–20:30", title: "Cena en Sliema / Tigné", description: "Tres opciones: barata, media y especial.", phase: "afternoon", kind: "food", restaurantArea: "sliema" },
];

export const saturdayWithMuseum: Stop[] = [
  ...saturday.slice(0, 2),
  { id: "sat-museum", place: "museum", time: "11:20–12:20", title: "Museo Arqueológico Nacional", description: "Opción de una hora para ver las piezas prehistóricas de Malta.", phase: "morning", kind: "monument", bookingIds: ["museum"] },
  { id: "sat-walk-short", place: "barrakka", time: "12:20–13:00", title: "Upper Barrakka", description: "Paseo breve y mirador del Grand Harbour.", phase: "morning", kind: "leisure", mode: "walk" },
  ...saturday.slice(3),
];

export const sunday: Stop[] = [
  { id: "sun-out", place: "sliema", time: "06:45", title: "Ferry rápido a Gozo", description: "Viaje antes de las visitas; llegada a Mġarr a las 08:00.", phase: "morning", kind: "transport", mode: "ferry", bookingIds: ["gozoFerry"] },
  { id: "sun-stop", place: "bugibba", time: "07:15–07:30", title: "Escala en Buġibba", description: "Continuad en el mismo ferry hacia Gozo.", phase: "morning", kind: "transport", mode: "ferry", bookingIds: ["gozoFerry"] },
  { id: "sun-mgarr", place: "mgarr", time: "08:00–09:00", title: "Puerto y bus a Victoria", description: "Autobús 301 y desayuno cerca del centro.", phase: "morning", kind: "transport", mode: "bus", bookingIds: ["bus"] },
  { id: "sun-citadel", place: "citadel", time: "09:00–10:30", title: "Ċittadella de Victoria", description: "Murallas, vistas y calles históricas.", phase: "morning", kind: "monument", mode: "walk" },
  { id: "sun-ggantija", place: "ggantija", time: "11:00–12:30", title: "Templos de Ġgantija", description: "Autobús 307 desde Victoria; entrada combinada con Ta' Kola.", phase: "morning", kind: "monument", mode: "bus", bookingIds: ["ggantija", "bus"] },
  { id: "sun-lunch", place: "victoria", time: "13:00–15:00", title: "Comida en Victoria", description: "Dos restaurantes cerca de la estación y tiempo para descansar.", phase: "morning", kind: "food", restaurantArea: "victoria" },
  { id: "sun-xlendi", place: "xlendi", time: "16:00–18:45", title: "Paseo por Xlendi", description: "Bahía, última luz y paseo antes de la cena.", phase: "afternoon", kind: "leisure", mode: "bus", bookingIds: ["bus"] },
  { id: "sun-dinner", place: "xlendi", time: "19:00–20:00", title: "Cena en Xlendi", description: "Tres opciones frente al mar, de pizza a pescado.", phase: "afternoon", kind: "food", restaurantArea: "xlendi" },
  { id: "sun-port", place: "mgarr", time: "20:00–21:00", title: "Traslado a Mġarr", description: "Taxi recomendado tras la cena para llegar con margen al ferry.", phase: "afternoon", kind: "transport", mode: "transfer", bookingIds: ["taxi"] },
  { id: "sun-back", place: "mgarr", time: "21:15", title: "Ferry de vuelta a Sliema", description: "Llegada prevista a Sliema a las 22:30.", phase: "afternoon", kind: "transport", mode: "ferry", bookingIds: ["gozoFerry"] },
];

// Alternativas de jornada completa: la ruta maltesa conserva historia, arqueología y costa.
export const sundayMalta: Stop[] = [
  { id: "sm-out", place: "apartment", time: "08:00–09:00", title: "Traslado a Mdina", description: "Taxi desde B Suites; confirmad el precio antes de salir.", phase: "morning", kind: "transport", mode: "transfer", bookingIds: ["taxi"] },
  { id: "sm-mdina", place: "mdina", time: "09:00–10:30", title: "Mdina y sus murallas", description: "Ciudad fortificada y miradores, como alternativa histórica a la Ciudadela de Gozo.", phase: "morning", kind: "monument", mode: "walk" },
  { id: "sm-transfer-temples", place: "hagarQim", time: "10:30–11:00", title: "Traslado a Ħaġar Qim", description: "Taxi entre Mdina y el parque arqueológico.", phase: "morning", kind: "transport", mode: "transfer", bookingIds: ["taxi"] },
  { id: "sm-temples", place: "hagarQim", time: "11:00–12:30", title: "Ħaġar Qim y Mnajdra", description: "Templos prehistóricos en la isla principal, análogos a Ġgantija.", phase: "morning", kind: "monument", bookingIds: ["hagarQim"] },
  { id: "sm-transfer-harbour", place: "marsaxlokk", time: "12:30–13:00", title: "Traslado a Marsaxlokk", description: "Taxi al puerto pesquero para comer.", phase: "morning", kind: "transport", mode: "transfer", bookingIds: ["taxi"] },
  { id: "sm-lunch", place: "marsaxlokk", time: "13:00–14:30", title: "Comida en Marsaxlokk", description: "Pescado o cocina local junto al puerto.", phase: "morning", kind: "food", restaurantArea: "marsaxlokk" },
  { id: "sm-coast", place: "marsaxlokk", time: "16:00–18:45", title: "Puerto y paseo de Marsaxlokk", description: "Costa, barcas tradicionales y última luz, como alternativa a Xlendi.", phase: "afternoon", kind: "leisure", mode: "walk" },
  { id: "sm-dinner", place: "marsaxlokk", time: "19:00–20:00", title: "Cena en Marsaxlokk", description: "Cena temprana antes del regreso a Sliema.", phase: "afternoon", kind: "food", restaurantArea: "marsaxlokk" },
  { id: "sm-back", place: "apartment", time: "20:00–21:00", title: "Regreso a B Suites", description: "Taxi de vuelta al alojamiento.", phase: "afternoon", kind: "transport", mode: "transfer", bookingIds: ["taxi"] },
];

export const sundayComino: Stop[] = [
  { id: "sc-out", place: "apartment", time: "08:00–09:30", title: "Traslado a Ċirkewwa", description: "Taxi hasta el embarcadero de Comino.", phase: "morning", kind: "transport", mode: "transfer", bookingIds: ["taxi"] },
  { id: "sc-ferry", place: "cirkewwa", time: "09:40–10:00", title: "Ferry a Comino", description: "Trayecto a Blue Lagoon; confirmad operación según tiempo marítimo.", phase: "morning", kind: "transport", mode: "ferry", bookingIds: ["cominoFerry"] },
  { id: "sc-blue", place: "cominoPier", time: "10:00–12:30", title: "Blue Lagoon y costa", description: "Paseo costero; noviembre no es un plan de baño garantizado.", phase: "morning", kind: "leisure", mode: "walk" },
  { id: "sc-trail", place: "co-santamaria", time: "12:30–13:00", title: "Sendero hacia Santa Marija", description: "Tramo a pie sujeto a viento y estado del camino.", phase: "morning", kind: "leisure", mode: "walk" },
  { id: "sc-lunch", place: "co-santamaria", time: "13:00–14:00", title: "Comida de picnic en Comino", description: "Llevad comida y agua desde Malta; no contéis con restaurantes abiertos en noviembre.", phase: "morning", kind: "food", restaurantArea: "comino" },
  { id: "sc-back", place: "cominoPier", time: "14:30–15:00", title: "Ferry de vuelta a Ċirkewwa", description: "Regreso temprano para evitar depender del último barco.", phase: "afternoon", kind: "transport", mode: "ferry", bookingIds: ["cominoFerry"] },
  { id: "sc-mellieha", place: "mellieha", time: "16:00–18:30", title: "Mellieħa y miradores", description: "Paseo en la isla principal tras la excursión marítima.", phase: "afternoon", kind: "leisure", mode: "walk" },
  { id: "sc-dinner", place: "mellieha", time: "19:00–20:30", title: "Cena en Mellieħa", description: "Cena antes de regresar a Sliema.", phase: "afternoon", kind: "food", restaurantArea: "mellieha" },
  { id: "sc-home", place: "apartment", time: "20:30–21:30", title: "Regreso a B Suites", description: "Taxi desde Mellieħa.", phase: "afternoon", kind: "transport", mode: "transfer", bookingIds: ["taxi"] },
];

export const mondayMdina: Stop[] = [
  { id: "mon-mdina-out", place: "apartment", time: "09:00", title: "Salida con equipaje", description: "Dejad el apartamento con maletas o mochilas. Taxi recomendado hacia Mdina/Rabat.", phase: "morning", kind: "transport", mode: "transfer", bookingIds: ["taxi"] },
  { id: "mon-mdina", place: "mdina", time: "10:00–12:30", title: "Mdina", description: "Ciudad amurallada y miradores.", phase: "morning", kind: "monument", mode: "walk" },
  { id: "mon-rabat", place: "rabat", time: "12:30–13:00", title: "Paseo por Rabat", description: "Calles junto a Mdina antes de comer.", phase: "morning", kind: "leisure", mode: "walk" },
  { id: "mon-rabat-lunch", place: "rabat", time: "13:00–14:00", title: "Comida en Rabat / Mdina", description: "Dos opciones: pastizzi o una comida con vistas.", phase: "morning", kind: "food", restaurantArea: "rabat" },
  { id: "mon-mdina-pause", place: "rabat", time: "14:00–16:00", title: "Pausa con equipaje", description: "Descanso o café después de comer; las visitas se retoman a las 16:00.", phase: "afternoon", kind: "leisure" },
  { id: "mon-mdina-afternoon", place: "rabat", time: "16:00–16:30", title: "Último paseo por Rabat", description: "Paseo breve por calles accesibles con equipaje antes del taxi.", phase: "afternoon", kind: "leisure", mode: "walk" },
  { id: "mon-mdina-airport", place: "airport", time: "17:00", title: "Salida directa al aeropuerto", description: "Taxi desde Rabat/Mdina con el equipaje. No hace falta regresar a Sliema.", phase: "afternoon", kind: "transport", mode: "transfer", bookingIds: ["taxi"] },
];

export const mondayPopeye: Stop[] = [
  { id: "mon-popeye-out", place: "apartment", time: "08:00", title: "Salida con equipaje", description: "Dejad el apartamento con las maletas o mochilas. Taxi recomendado hacia Anchor Bay.", phase: "morning", kind: "transport", mode: "transfer", bookingIds: ["taxi"] },
  { id: "mon-anchor", place: "popeye", time: "09:00–09:30", title: "Mirador de Anchor Bay", description: "Fotos de la bahía antes de entrar al recinto.", phase: "morning", kind: "leisure", mode: "walk" },
  { id: "mon-popeye", place: "popeye", time: "09:30–12:30", title: "Popeye Village", description: "Visita al decorado de cine y sus atracciones.", phase: "morning", kind: "leisure", bookingIds: ["popeye"] },
  { id: "mon-mellieha-transfer", place: "mellieha", time: "12:30–13:00", title: "Traslado a Mellieħa", description: "Traslado corto desde Anchor Bay con el equipaje.", phase: "morning", kind: "transport", mode: "transfer", bookingIds: ["taxi"] },
  { id: "mon-mellieha-lunch", place: "mellieha", time: "13:00–14:00", title: "Comida en Mellieħa", description: "Dos opciones de precio barato o medio.", phase: "morning", kind: "food", restaurantArea: "mellieha" },
  { id: "mon-mellieha-pause", place: "mellieha", time: "14:00–16:00", title: "Pausa con equipaje", description: "Descanso o café después de comer; las visitas se retoman a las 16:00.", phase: "afternoon", kind: "leisure" },
  { id: "mon-mellieha-afternoon", place: "mellieha", time: "16:00–16:30", title: "Último paseo por Mellieħa", description: "Mirador cercano antes del traslado al aeropuerto.", phase: "afternoon", kind: "leisure", mode: "walk" },
  { id: "mon-popeye-airport", place: "airport", time: "17:00", title: "Salida directa al aeropuerto", description: "Taxi desde Mellieħa con el equipaje. No hace falta regresar a Sliema.", phase: "afternoon", kind: "transport", mode: "transfer", bookingIds: ["taxi"] },
];

export const routes: Record<DayId | "satMuseum" | "monPopeye", RouteLine[]> = {
  sat: [
    { id: "sat-ferry", mode: "ferry", coordinates: [places.sliema.coordinates, places.vallettaPier.coordinates] },
    { id: "sat-walk", mode: "walk", coordinates: [places.vallettaPier.coordinates, places.cathedral.coordinates, places.barrakka.coordinates, places.lascaris.coordinates] },
    { id: "sat-cross", mode: "ferry", coordinates: [[14.5132, 35.894], [14.5204, 35.8858], [14.52, 35.884]] },
    { id: "sat-birgu", mode: "walk", coordinates: [places.cospicua.coordinates, places.birgu.coordinates] },
  ],
  satMuseum: [
    { id: "sat-museum-ferry", mode: "ferry", coordinates: [places.sliema.coordinates, places.vallettaPier.coordinates] },
    { id: "sat-museum-walk", mode: "walk", coordinates: [places.vallettaPier.coordinates, places.cathedral.coordinates, places.museum.coordinates, places.barrakka.coordinates, places.lascaris.coordinates] },
    { id: "sat-museum-cross", mode: "ferry", coordinates: [[14.5132, 35.894], [14.5204, 35.8858], [14.52, 35.884]] },
    { id: "sat-museum-birgu", mode: "walk", coordinates: [places.cospicua.coordinates, places.birgu.coordinates] },
  ],
  sun: [
    { id: "sun-ferry", mode: "ferry", coordinates: [
      places.sliema.coordinates,
      [14.505, 35.908], [14.512, 35.905], [14.515, 35.905],
      [14.518, 35.908], [14.491, 35.932], [14.429, 35.963],
      [14.418, 35.963],
      places.bugibba.coordinates,
      [14.397, 35.968], [14.367, 36.0], [14.323, 36.002],
      places.mgarr.coordinates,
    ] },
    { id: "sun-bus", mode: "bus", coordinates: [places.mgarr.coordinates, places.victoria.coordinates] },
    { id: "sun-citadel", mode: "walk", coordinates: [places.victoria.coordinates, places.citadel.coordinates] },
    { id: "sun-ggantija", mode: "bus", coordinates: [places.victoria.coordinates, places.ggantija.coordinates] },
    { id: "sun-xlendi", mode: "bus", coordinates: [places.victoria.coordinates, places.xlendi.coordinates] },
  ],
  mon: [
    { id: "mon-out", mode: "transfer", coordinates: [places.apartment.coordinates, places.mdina.coordinates] },
    { id: "mon-walk", mode: "walk", coordinates: [places.mdina.coordinates, places.rabat.coordinates] },
    { id: "mon-airport", mode: "transfer", coordinates: [places.rabat.coordinates, places.airport.coordinates] },
  ],
  monPopeye: [
    { id: "mon-popeye", mode: "transfer", coordinates: [places.apartment.coordinates, places.mellieha.coordinates, places.popeye.coordinates] },
    { id: "mon-popeye-mellieha", mode: "transfer", coordinates: [places.popeye.coordinates, places.mellieha.coordinates] },
    { id: "mon-popeye-airport", mode: "transfer", coordinates: [places.mellieha.coordinates, places.airport.coordinates] },
  ],
};

export const sourceLinks = [
  { label: "Concatedral", url: "https://www.stjohnscocathedral.com/visit/" },
  { label: "Ferris de La Valeta", url: "https://www.vallettaferryservices.com/schedule/" },
  { label: "Ferry rápido a Gozo", url: "https://gozohighspeed.com/pages/schedule" },
  { label: "Ferry a Comino", url: "https://cominoferries.com/schedule/" },
  { label: "Ħaġar Qim y Mnajdra", url: "https://heritagemalta.mt/explore/hagar-qim-and-mnajdra-archaeological-park/" },
  { label: "Autobuses de Malta", url: "https://www.publictransport.com.mt/routes-timetables/" },
  { label: "Popeye Village", url: "https://www.popeyemalta.com/packages/mid-season-2026/07-6-nov-30-april" },
  { label: "Heritage Malta", url: "https://heritagemalta.mt/opening-hours/" },
  { label: "Traslados eCabs", url: "https://ecabs.com.mt/how-to-book-a-ride-with-ecabs/" },
];

import { areas, areaName, type AreaId } from "./catalog";
import { extraRestaurants } from "./restaurants-extra";

export type BookingId = "vallettaFerry" | "threeCitiesFerry" | "gozoFerry" | "cominoFerry" | "hagarQim" | "cathedral" | "museum" | "ggantija" | "popeye" | "catacombs" | "bus" | "taxi" | "airbnb";
export type RestaurantArea = AreaId | "victoria" | "xlendi";

export type Booking = {
  id: BookingId;
  title: string;
  context: string;
  price?: string;
  note: string;
  url: string;
  action: string;
};

export const airbnbUrl = "https://www.airbnb.es/trips/v1/1796630891099537374";

export const bookings: Record<BookingId, Booking> = {
  vallettaFerry: { id: "vallettaFerry", title: "Ferry Sliema ⇄ La Valeta", context: "Sábado · 09:00 y 18:45", price: "€3 por trayecto, adulto", note: "El operador publica horarios y tarifas; el billete se puede obtener en el muelle. Confirmad la salida de regreso.", url: "https://www.vallettaferryservices.com/schedule/", action: "Ver horarios y tarifas" },
  threeCitiesFerry: { id: "threeCitiesFerry", title: "Ferry La Valeta ⇄ Cospicua", context: "Sábado · 15:45 y 18:00", note: "Embarque en Lascaris y Bormla/Cospicua. Revisad el horario de invierno antes del viaje.", url: "https://www.vallettaferryservices.com/schedule/", action: "Ver horarios y tarifas" },
  gozoFerry: { id: "gozoFerry", title: "Ferry rápido Sliema ⇄ Gozo", context: "Domingo · ida 06:45, vuelta 21:15", price: "€8,50 por trayecto, adulto", note: "La ida hace escala en Buġibba. Elegid Sliema como origen y Mġarr como destino; reservad también la vuelta.", url: "https://gozohighspeed.com/", action: "Comprar en Gozo Highspeed" },
  cominoFerry: { id: "cominoFerry", title: "Ferry Ċirkewwa ⇄ Comino", context: "Domingo · alternativa de Comino", price: "≈ 15 € ida y vuelta", note: "Comino Ferries anuncia salidas regulares, pero confirmad el horario de noviembre y el tiempo marítimo. La vuelta propuesta sale de Blue Lagoon a las 14:30.", url: "https://cominoferries.com/schedule/", action: "Ver horarios y billetes" },
  hagarQim: { id: "hagarQim", title: "Ħaġar Qim y Mnajdra", context: "Domingo · alternativa por Malta", price: "10 € adulto", note: "La visita oficial suele durar de 90 minutos a 3 horas; confirmad horario de noviembre.", url: "https://heritagemalta.mt/explore/hagar-qim-and-mnajdra-archaeological-park/", action: "Ver entrada oficial" },
  cathedral: { id: "cathedral", title: "Concatedral de San Juan", context: "Sábado · 09:30", price: "€15 adulto", note: "Abre al turismo de lunes a sábado. La visita recomendada dura aproximadamente 1 h 45 min.", url: "https://www.stjohnscocathedral.com/visit/", action: "Ver entrada oficial" },
  museum: { id: "museum", title: "Museo Arqueológico Nacional", context: "Sábado · opción 11:20", price: "€5 adulto", note: "Opción que sustituye parte del paseo libre por La Valeta. Está en Republic Street.", url: "https://heritagemalta.mt/store/s7/", action: "Comprar entrada oficial" },
  ggantija: { id: "ggantija", title: "Ġgantija y Ta' Kola", context: "Domingo · 11:00", price: "€10 adulto", note: "Entrada combinada oficial. Comprobad horarios de apertura y la conexión en autobús desde Victoria.", url: "https://heritagemalta.mt/store/c37/", action: "Comprar entrada oficial" },
  popeye: { id: "popeye", title: "Popeye Village", context: "Lunes · 09:30", price: "€15 adulto", note: "Tarifa de temporada baja del 6 de noviembre de 2026 al 30 de abril de 2027.", url: "https://www.popeyemalta.com/packages/mid-season-2026/07-6-nov-30-april", action: "Comprar entrada oficial" },
  catacombs: { id: "catacombs", title: "Catacumbas de San Pablo", context: "Lunes · opción en Rabat", price: "€6 adulto", note: "Heritage Malta indica que la visita dura entre una y dos horas. Comprobad el horario del lunes antes de reservar.", url: "https://heritagemalta.mt/explore/st-pauls-catacombs/", action: "Ver entrada oficial" },
  bus: { id: "bus", title: "Autobuses de Malta y Gozo", context: "Traslados de sábado a lunes", note: "Se puede pagar a bordo con efectivo o tarjeta sin contacto; consultad si os compensa un pase de varios días.", url: "https://www.publictransport.com.mt/fares-and-tickets/", action: "Ver billetes y pases" },
  taxi: { id: "taxi", title: "Taxis y traslados", context: "Gozo el domingo · Malta el lunes", note: "Reservad los traslados con equipaje y comprobad el precio final en la app antes de confirmar. El lunes se va al aeropuerto directamente desde la última visita.", url: "https://ecabs.com.mt/how-to-book-a-ride-with-ecabs/", action: "Ver cómo reservar taxi" },
  airbnb: { id: "airbnb", title: "B Suites · Tas-Sliema", context: "13–16 noviembre · 136 Triq Tigne', Tas-Sliema, Malta", note: "Enlace a vuestra reserva. La página requiere vuestra sesión de Airbnb; verificad allí el acceso y las instrucciones de llegada.", url: airbnbUrl, action: "Abrir reserva de Airbnb" },
};

export type Restaurant = {
  name: string;
  budget: "Barato" | "Medio" | "Caro";
  cuisine: string;
  averagePrice: string;
  minutes?: number;
  googleRating?: number;
  googleReviews?: number;
  googleUrl: string;
  location: string;
  cue: string;
  url: string;
};

const baseRestaurantAreas: Partial<Record<RestaurantArea, { title: string; meal: "Comida" | "Cena"; options: Restaurant[] }>> = {
  valletta: { title: "La Valeta", meal: "Comida", options: [
    { name: "Is-Suq tal-Belt", budget: "Barato", cuisine: "Puestos de cocina internacional", averagePrice: "≈ 15 €", location: "Triq il-Merkanti, La Valeta", cue: "Mercado gastronómico con varios puestos; práctico para comer sin reserva.", googleRating: 4.3, googleReviews: 8604, googleUrl: "https://www.google.com/maps/search/Is-Suq%20tal-Belt%20Valletta%20Malta", url: "https://issuqtalbelt.com/" },
    { name: "Ta' Nenu", budget: "Medio", cuisine: "Maltesa tradicional", averagePrice: "≈ 22 €", location: "143 St Dominic Street, La Valeta", cue: "Cocina maltesa en una antigua panadería; conviene reservar.", googleRating: 4.5, googleReviews: 4052, googleUrl: "https://www.google.com/maps/search/Ta%20Nenu%20Valletta%20Malta", url: "https://tanenu.com/" },
  ] },
  sliema: { title: "Sliema / Tigné", meal: "Cena", options: [
    { name: "Marrobbio", budget: "Barato", cuisine: "Italiana y pizza", averagePrice: "≈ 17 €", location: "117 Tower Road, Sliema", cue: "Pizza cerca del paseo marítimo.", googleRating: 4.5, googleReviews: 2531, googleUrl: "https://www.google.com/maps/search/Marrobbio%20117%20Tower%20Road%20Sliema%20Malta", url: "https://marrobbio.com.mt/book" },
    { name: "Ta' Kris", budget: "Medio", cuisine: "Maltesa y mediterránea", averagePrice: "≈ 24 €", location: "154 The Strand, Gżira", cue: "Platos malteses y mediterráneos; reservad mesa.", googleRating: 4.4, googleReviews: 8190, googleUrl: "https://www.google.com/maps/search/Ta%20Kris%20154%20The%20Strand%20Gzira%20Malta", url: "https://dine.mt/ta-kris-restaurant" },
    { name: "The Chophouse", budget: "Caro", cuisine: "Carnes a la parrilla", averagePrice: "≈ 50 €", location: "Tigné Point, Sliema", cue: "Cena de carne con vistas a La Valeta, en Tigné Point.", googleRating: 4.5, googleReviews: 1538, googleUrl: "https://www.google.com/maps/search/The%20Chophouse%20Tigne%20Point%20Sliema%20Malta", url: "https://chophouse.com.mt/" },
  ] },
  victoria: { title: "Victoria, Gozo", meal: "Comida", options: [
    { name: "Café Jubilee", budget: "Barato", cuisine: "Café y platos malteses", averagePrice: "≈ 13 €", location: "6 Library Street, Victoria", cue: "Ftira, pastizzi y platos rápidos en el centro.", googleRating: 4.4, googleReviews: 1622, googleUrl: "https://www.google.com/maps/search/Caf%C3%A9%20Jubilee%20Victoria%20Gozo%20Malta", url: "https://cafejubilee.com/victoria-menus/" },
    { name: "Chapeau Bistro", budget: "Medio", cuisine: "Bistró, pizza y pasta", averagePrice: "≈ 17 €", location: "Triq Salvatore Psaila, Victoria", cue: "Pasta y cocina local frente a la estación de autobuses.", googleRating: 4.6, googleReviews: 533, googleUrl: "https://www.google.com/maps/search/Chapeau%20Bistro%20Victoria%20Gozo%20Malta", url: "https://chapeaugozo.com/lunch-dinner-gozo/" },
  ] },
  xlendi: { title: "Xlendi", meal: "Cena", options: [
    { name: "Churchill", budget: "Barato", cuisine: "Mediterránea y pizza", averagePrice: "≈ 20 €", location: "Paseo de la bahía de Xlendi", cue: "Opción de pizza y platos sencillos junto a la bahía.", googleRating: 4.4, googleReviews: 1409, googleUrl: "https://www.google.com/maps/search/Churchill%20Restaurant%20Xlendi%20Gozo%20Malta", url: "https://churchill-gozo.com/" },
    { name: "Zafiro", budget: "Medio", cuisine: "Local y mediterránea", averagePrice: "≈ 25 €", location: "Xatt ix-Xlendi, Xlendi", cue: "Pasta y cocina mediterránea en el paseo marítimo.", googleRating: 4.5, googleReviews: 389, googleUrl: "https://www.google.com/maps/search/Zafiro%20Restaurant%20Xlendi%20Gozo%20Malta", url: "https://zafiro.mt/" },
    { name: "The Boathouse", budget: "Caro", cuisine: "Pescado y marisco", averagePrice: "≈ 32 €", location: "Xatt ix-Xlendi, Munxar", cue: "Cena de pescado junto al agua; reservad con antelación.", googleRating: 4.6, googleReviews: 1858, googleUrl: "https://www.google.com/maps/search/The%20Boathouse%20Xlendi%20Gozo%20Malta", url: "https://theboathousegozo.com/" },
  ] },
  mellieha: { title: "Mellieħa", meal: "Comida", options: [
    { name: "Belleview", budget: "Barato", cuisine: "Bistró, café y pizza", averagePrice: "≈ 15 €", location: "Triq il-Kbira, Mellieħa", cue: "Restaurante familiar con carta amplia; abre los lunes al mediodía.", googleRating: 4.5, googleReviews: 633, googleUrl: "https://www.google.com/maps/search/Belleview%20Mellieha%20Malta", url: "https://belleview.mt/" },
    { name: "one80 Mellieħa", budget: "Medio", cuisine: "Mediterránea", averagePrice: "≈ 28 €", location: "30 Triq Wied ta' Ruman, Mellieħa", cue: "Menú de mediodía y vistas a la bahía; conviene reservar.", googleRating: 4.7, googleReviews: 2921, googleUrl: "https://www.google.com/maps/search/one80%20Mellieha%20Malta", url: "https://one80.com.mt/mellieha/" },
  ] },
  rabat: { title: "Rabat / Mdina", meal: "Comida", options: [
    { name: "Is-Serkin", budget: "Barato", cuisine: "Pastizzi y repostería maltesa", averagePrice: "≈ 6 €", location: "84 Triq San Pawl, Rabat", cue: "Pastizzi y bocado rápido; opción informal junto a Mdina.", googleRating: 4.6, googleReviews: 4065, googleUrl: "https://www.google.com/maps/search/Is-Serkin%20Crystal%20Palace%20Rabat%20Malta", url: "https://wolt.com/mt/mlt/malta/restaurant/is-serkin-crystal-palace" },
    { name: "Fontanella Tea Garden", budget: "Medio", cuisine: "Café, pizza y platos ligeros", averagePrice: "≈ 16 €", location: "1 Bastion Street, Mdina", cue: "Ftira, lasaña y tartas con vistas desde la muralla de Mdina.", googleRating: 4.3, googleReviews: 9945, googleUrl: "https://www.google.com/maps/search/Fontanella%20Tea%20Garden%20Mdina%20Malta", url: "https://www.fontanellateagarden.com.mt/home" },
  ] },
};

export const restaurantAreas: Record<RestaurantArea, { title: string; meal: "Comida" | "Cena"; options: Restaurant[] }> = {
  ...Object.fromEntries(areas.map(([id, title]) => [id, { title, meal: "Comida", options: extraRestaurants.filter((restaurant) => restaurant.area === id) }])),
  ...Object.fromEntries(Object.entries(baseRestaurantAreas).map(([id, group]) => [id, { ...group, options: [...(group?.options ?? []), ...extraRestaurants.filter((restaurant) => restaurant.area === id)] }])),
  victoria: baseRestaurantAreas.victoria!, xlendi: baseRestaurantAreas.xlendi!,
} as Record<RestaurantArea, { title: string; meal: "Comida" | "Cena"; options: Restaurant[] }>;

export { areaName };

export const commonBookingIds: BookingId[] = ["airbnb", "vallettaFerry", "threeCitiesFerry", "gozoFerry", "cathedral", "ggantija", "bus", "taxi"];

import { dayBudget } from "./budget";
import { mondayMdina, mondayPopeye, places, routes, saturday, saturdayWithMuseum, sunday, sundayComino, sundayMalta, type DayId, type MondayPlan, type SundayPlan, type RouteLine, type Stop } from "./data";
import { catalogEvents, type AreaId } from "./catalog";
import { extraRestaurants } from "./restaurants-extra";
import { restaurantAreas, type BookingId } from "./guide";

export type Choice = {
  id: string;
  title: string;
  description: string;
  place: string;
  minutes: number;
  min: number;
  max: number;
  bookingIds?: BookingId[];
  kind?: Stop["kind"];
  restaurantArea?: Stop["restaurantArea"];
  new?: boolean;
  area?: AreaId;
  infoUrl?: string;
};
export type PlannerEdits = { titles: Partial<Record<DayId, string>>; choices: Record<string, string> };
export type PlannedDay = {
  stops: Stop[];
  start: string;
  end: string;
  span: string;
  activeMinutes: number;
  extraTravelMinutes: number;
  min: number;
  max: number;
  breakdown: string[];
  warnings: string[];
};
export const emptyEdits: PlannerEdits = { titles: {}, choices: {} };

const alternatives: Record<string, Choice[]> = {
  "sat-cathedral": [
    { id: "palace-exterior", title: "Palacio del Gran Maestre · exterior", description: "St George's Square y fachada del palacio; paseo sin entrada.", place: "palaceExterior", minutes: 65, min: 0, max: 0, kind: "monument", new: true },
    { id: "sat-museum-choice", title: "Museo Arqueológico Nacional", description: "Colección prehistórica en Republic Street. Confirmad el horario.", place: "museum", minutes: 75, min: 5, max: 5, kind: "monument", bookingIds: ["museum"] },
  ],
  "sat-walk": [
    { id: "lower-barrakka", title: "Lower Barrakka Gardens", description: "Jardines y mirador sobre la entrada del Grand Harbour.", place: "lowerBarrakka", minutes: 75, min: 0, max: 0, kind: "leisure", new: true },
    { id: "hastings", title: "Hastings Gardens", description: "Paseo por las murallas y vistas a Marsamxett.", place: "hastings", minutes: 80, min: 0, max: 0, kind: "leisure", new: true },
  ],
  "sat-walk-short": [
    { id: "lower-barrakka-short", title: "Lower Barrakka Gardens", description: "Mirador breve sobre la entrada del Grand Harbour.", place: "lowerBarrakka", minutes: 35, min: 0, max: 0, kind: "leisure", new: true },
  ],
  "sat-birgu": [
    { id: "senglea", title: "Senglea y Gardjola Gardens", description: "Paseo por Senglea y mirador al Grand Harbour.", place: "senglea", minutes: 90, min: 0, max: 0, kind: "leisure", new: true },
  ],
  "sun-citadel": [
    { id: "st-george", title: "Basílica de San Jorge y Victoria", description: "Plaza y centro histórico; acceso interior sujeto a horario.", place: "stGeorge", minutes: 75, min: 0, max: 0, kind: "monument", new: true },
    { id: "villa-rundle", title: "Villa Rundle Gardens", description: "Paseo tranquilo por los jardines de Victoria.", place: "villaRundle", minutes: 60, min: 0, max: 0, kind: "leisure", new: true },
  ],
  "sun-ggantija": [
    { id: "xaghra", title: "Xagħra, paseo por el pueblo", description: "Plaza y calles junto a Ġgantija; opción sin entrada.", place: "xaghra", minutes: 65, min: 0, max: 0, kind: "leisure", new: true },
  ],
  "sun-xlendi": [
    { id: "dwejra", title: "Dwejra e Inland Sea", description: "Paisaje costero. Añade traslado para llegar a la cena en Xlendi.", place: "dwejra", minutes: 120, min: 0, max: 0, kind: "leisure", new: true },
  ],
  "mon-popeye": [
    { id: "red-tower", title: "Red Tower y miradores", description: "Paseo y vistas; consultad acceso interior. Traslado extra desde Anchor Bay.", place: "redTower", minutes: 105, min: 0, max: 0, kind: "monument", new: true },
  ],
  "mon-mdina": [
    { id: "catacombs-main", title: "Catacumbas de San Pablo", description: "Visita arqueológica en Rabat; confirmad la apertura del lunes.", place: "catacombs", minutes: 105, min: 6, max: 6, kind: "monument", bookingIds: ["catacombs"], new: true },
  ],
  "mon-mellieha-afternoon": [
    { id: "mellieha-sanctuary", title: "Santuario y miradores de Mellieħa", description: "Paseo por el centro antes del taxi al aeropuerto.", place: "melliehaChurch", minutes: 75, min: 0, max: 0, kind: "leisure", new: true },
  ],
  "mon-mdina-afternoon": [
    { id: "catacombs-late", title: "Catacumbas de San Pablo", description: "Visita de 1 h 30 min; confirmad horario y dónde dejar el equipaje.", place: "catacombs", minutes: 90, min: 6, max: 6, kind: "monument", bookingIds: ["catacombs"], new: true },
  ],
};

const baseMinutes: Record<string, number> = {
  "sat-out": 15, "sat-cities": 15, "sat-return": 45, "sun-out": 30, "sun-back": 75, "mon-mdina-out": 60, "mon-popeye-out": 60, "mon-mdina-airport": 0, "mon-popeye-airport": 0,
};
const baseCosts: Record<string, [number, number]> = {
  "sat-cathedral": [15, 15], "sat-museum": [5, 5], "sun-ggantija": [10, 10], "mon-popeye": [15, 15],
  "sat-lunch": [15, 22], "sat-dinner": [17, 50], "sun-lunch": [13, 17], "sun-dinner": [20, 32],
  "mon-mellieha-lunch": [15, 28], "mon-rabat-lunch": [6, 16],
  "sm-temples": [10, 10], "sm-lunch": [18, 30], "sm-dinner": [20, 40],
  "sc-lunch": [8, 12], "sc-dinner": [20, 38],
};
const fixedStartIds = new Set(["sat-out", "sat-lunch", "sat-cities", "sat-return", "sat-dinner", "sun-out", "sun-stop", "sun-mgarr", "sun-lunch", "sun-dinner", "sun-port", "sun-back", "sm-out", "sm-transfer-temples", "sm-transfer-harbour", "sm-lunch", "sm-dinner", "sm-back", "sc-out", "sc-ferry", "sc-lunch", "sc-back", "sc-dinner", "sc-home", "mon-mdina-out", "mon-popeye-out", "mon-mellieha-transfer", "mon-mellieha-lunch", "mon-rabat-lunch", "mon-mdina-airport", "mon-popeye-airport"]);

export function baseStops(day: DayId, museum: boolean, mondayPlan: MondayPlan, sundayPlan: SundayPlan = "gozo"): Stop[] {
  return day === "sat" ? museum ? saturdayWithMuseum : saturday : day === "sun" ? sundayPlan === "malta" ? sundayMalta : sundayPlan === "comino" ? sundayComino : sunday : mondayPlan === "popeye" ? mondayPopeye : mondayMdina;
}
function timeToMinutes(value: string) { const [h, m] = value.split(":").map(Number); return h * 60 + m; }
function formatTime(value: number) { return `${String(Math.floor(value / 60)).padStart(2, "0")}:${String(value % 60).padStart(2, "0")}`; }
export function formatDuration(value: number) { const h = Math.floor(value / 60); const m = value % 60; return h ? `${h} h${m ? ` ${m} min` : ""}` : `${m} min`; }
function durationOf(stop: Stop) { const [start, end] = stop.time.split("–"); return end ? timeToMinutes(end) - timeToMinutes(start) : baseMinutes[stop.id] ?? 20; }
function baseCost(stop: Stop): [number, number] { return baseCosts[stop.id] ?? [0, 0]; }
function restaurantMinutes(budget: string) { return budget === "Caro" ? 90 : budget === "Medio" ? 65 : 45; }
const placeArea: Record<string, AreaId> = {
  cathedral: "valletta", museum: "valletta", barrakka: "valletta", lowerBarrakka: "valletta", hastings: "valletta", palaceExterior: "valletta",
  birgu: "birgu", senglea: "senglea", cospicua: "cospicua", sliema: "sliema", apartment: "sliema", popeye: "mellieha", mellieha: "mellieha", redTower: "mellieha", melliehaChurch: "mellieha",
  bugibba: "stpauls", mdina: "mdina", rabat: "rabat", catacombs: "rabat", marsaxlokk: "marsaxlokk", hagarQim: "marsaxlokk",
  victoria: "gozo", citadel: "gozo", stGeorge: "gozo", villaRundle: "gozo", ggantija: "gozo", xaghra: "gozo", xlendi: "gozo", dwejra: "gozo", mgarr: "gozo",
  cominoPier: "comino", cirkewwa: "mellieha",
};
export function areaFor(stop: Stop): AreaId { return catalogEvents.find((item) => item.id === stop.place)?.area ?? placeArea[stop.place] ?? "valletta"; }
const restaurantPlace: Record<string, string> = { valletta: "barrakka", birgu: "birgu", senglea: "senglea", cospicua: "cospicua", sliema: "sliema", gzira: "g-strand", stjulians: "st-spinola", mellieha: "mellieha", stpauls: "bugibba", mdina: "mdina", rabat: "rabat", marsaxlokk: "marsaxlokk", gozo: "victoria", comino: "cominoPier" };
function allowedArea(stop: Stop, area: AreaId) {
  if (stop.id.startsWith("sat-")) {
    if (["sat-cathedral", "sat-walk", "sat-walk-short", "sat-museum", "sat-lunch"].includes(stop.id)) return area === "valletta";
    if (stop.id === "sat-birgu") return ["birgu", "senglea", "cospicua"].includes(area);
    return ["sliema", "gzira", "stjulians"].includes(area);
  }
  if (areaFor(stop) === "gozo") return area === "gozo";
  if (areaFor(stop) === "comino") return area === "comino";
  if (stop.id.startsWith("sc-") && stop.id !== "sc-lunch") return ["mellieha", "stpauls"].includes(area);
  return area !== "gozo" && area !== "comino";
}

export function choicesFor(stop: Stop): Choice[] {
  const [min, max] = baseCost(stop);
  const original: Choice = { id: "original", title: stop.title, description: stop.description, place: stop.place, minutes: durationOf(stop), min, max, bookingIds: stop.bookingIds, kind: stop.kind, restaurantArea: stop.restaurantArea, area: areaFor(stop) };
  if (stop.restaurantArea === "comino") return [original, { id: "comino-blue-picnic", title: "Comida de picnic junto a Blue Lagoon", description: "Llevad comida y agua compradas en Malta; sin depender de puestos estacionales.", place: "cominoPier", minutes: durationOf(stop), min: 8, max: 12, kind: "food", restaurantArea: "comino", area: "comino", new: true }];
  const restaurantChoices: Choice[] = stop.restaurantArea ? restaurantAreas[stop.restaurantArea].options.map((restaurant, index) => {
    const price = Number(restaurant.averagePrice.match(/\d+/)?.[0] ?? 0);
    const service = restaurant.minutes ?? restaurantMinutes(restaurant.budget);
    return { id: `restaurant-${index}`, title: `${stop.title.startsWith("Cena") ? "Cena" : "Comida"} · ${restaurant.name}`, description: `${restaurant.cuisine} · ${restaurant.location} · mesa ≈ ${service} min`, place: stop.place, minutes: Math.max(durationOf(stop), service), min: price, max: price, kind: "food" as const, restaurantArea: stop.restaurantArea, area: areaFor(stop), infoUrl: restaurant.url };
  }) : [];
  const otherRestaurants: Choice[] = stop.restaurantArea ? extraRestaurants.filter((restaurant) => restaurant.area !== stop.restaurantArea && allowedArea(stop, restaurant.area)).map((restaurant) => {
    const price = Number(restaurant.averagePrice.match(/\d+/)?.[0] ?? 0);
    return { id: restaurant.id, title: `${stop.title.startsWith("Cena") ? "Cena" : "Comida"} · ${restaurant.name}`, description: `${restaurant.cuisine} · ${restaurant.location} · mesa ≈ ${restaurant.minutes} min`, place: restaurant.id === "r-karolina" ? "xlendi" : restaurantPlace[restaurant.area], minutes: Math.max(durationOf(stop), restaurant.minutes), min: price, max: price, kind: "food", restaurantArea: restaurant.area, area: restaurant.area, infoUrl: restaurant.url, new: true };
  }) : [];
  const visits: Choice[] = stop.kind !== "food" && stop.kind !== "transport" ? catalogEvents.filter((event) => allowedArea(stop, event.area)).map((event) => ({ id: `event-${event.id}`, title: event.title, description: event.description, place: event.id, minutes: event.minutes, min: event.price, max: event.price, kind: event.kind, area: event.area, infoUrl: event.url, new: true })) : [];
  const localAlternatives = (alternatives[stop.id] ?? []).map((choice) => ({ ...choice, area: areaFor({ ...stop, place: choice.place }) })).filter((choice) => choice.area && allowedArea(stop, choice.area));
  return [original, ...restaurantChoices, ...localAlternatives, ...otherRestaurants, ...visits];
}
export function canEdit(stop: Stop) { return stop.kind === "food" || (stop.kind !== "transport" && stop.place !== "airport"); }

function geoKm(a: string, b: string) {
  const [lon1, lat1] = places[a].coordinates; const [lon2, lat2] = places[b].coordinates;
  const dy = (lat2 - lat1) * 111; const dx = (lon2 - lon1) * 91;
  return Math.hypot(dx, dy);
}
function extraTransfer(baseA: Stop, baseB: Stop, nextA: Stop, nextB: Stop) {
  const delta = geoKm(nextA.place, nextB.place) - geoKm(baseA.place, baseB.place);
  if (delta <= 0.35) return 0;
  const mode = baseB.mode === "walk" || geoKm(nextA.place, nextB.place) < 1 ? 12 : 3.5;
  return Math.ceil(delta * mode / 5) * 5;
}

export function planDay(day: DayId, museum: boolean, mondayPlan: MondayPlan, edits: PlannerEdits, sundayPlan: SundayPlan = "gozo"): PlannedDay {
  const original = baseStops(day, museum, mondayPlan, sundayPlan);
  const selected = original.map((stop) => {
    const choice = choicesFor(stop).find((item) => item.id === edits.choices[stop.id]) ?? choicesFor(stop)[0];
    return { ...stop, title: choice.title, description: choice.description, place: choice.place, kind: choice.kind ?? stop.kind, bookingIds: choice.bookingIds, restaurantArea: choice.restaurantArea, infoUrl: choice.infoUrl, duration: choice.minutes, cost: [choice.min, choice.max] as [number, number], changed: choice.id !== "original" };
  });
  const warnings: string[] = [];
  const stops: Stop[] = [];
  let previousEnd = -1;
  let extraTravelMinutes = 0;
  let activeMinutes = 0;
  selected.forEach((stop, index) => {
    const baseStart = timeToMinutes(original[index].time.split("–")[0]);
    const extra = index ? extraTransfer(original[index - 1], original[index], selected[index - 1], stop) : 0;
    extraTravelMinutes += extra;
    const earliest = previousEnd < 0 ? baseStart : previousEnd + extra;
    const fixed = fixedStartIds.has(stop.id);
    const start = fixed ? baseStart : Math.max(baseStart, earliest);
    if (fixed && earliest > baseStart + 5) warnings.push(`${stop.title}: faltan ${earliest - baseStart} min antes de esta parada fija.`);
    const end = start + stop.duration;
    previousEnd = end;
    activeMinutes += stop.duration + (stop.id === "sun-stop" ? 30 : 0);
    const time = (stop.changed || start !== baseStart) && stop.duration > 0 ? `${formatTime(start)}–${formatTime(end)}` : original[index].time;
    stops.push({ ...stop, time });
  });
  const baseline = dayBudget(day, museum, mondayPlan, sundayPlan);
  const deltaMin = selected.reduce((sum, stop, index) => sum + stop.cost[0] - baseCost(original[index])[0], 0);
  const deltaMax = selected.reduce((sum, stop, index) => sum + stop.cost[1] - baseCost(original[index])[1], 0);
  const extraCost = Math.ceil(extraTravelMinutes / 20) * 3;
  const first = timeToMinutes(stops[0].time.split("–")[0]);
  const last = Math.max(previousEnd, timeToMinutes(baseline.hours.split("–")[1]));
  if (day === "mon" && last > 17 * 60) warnings.push("El plan rebasa la salida al aeropuerto de las 17:00.");
  const food = stops.filter((stop) => stop.kind === "food");
  for (const meal of food) {
    const [start, end] = meal.time.split("–").map(timeToMinutes);
    const dinner = meal.title.toLowerCase().startsWith("cena");
    if (end && (start < (dinner ? 19 : 13) * 60 || end > (dinner ? 21 : 15) * 60)) warnings.push(`${meal.title}: queda fuera del horario previsto de ${dinner ? "cena" : "comida"}.`);
  }
  return {
    stops, start: formatTime(first), end: formatTime(last), span: formatDuration(last - first), activeMinutes, extraTravelMinutes,
    min: Math.max(0, baseline.min + deltaMin + extraCost), max: Math.max(0, baseline.max + deltaMax + extraCost),
    breakdown: [...baseline.breakdown, ...selected.filter((stop) => stop.changed).map((stop) => `${stop.title}: ${stop.cost[0] === stop.cost[1] ? `${stop.cost[0]} €` : `${stop.cost[0]}–${stop.cost[1]} €`} · ${formatDuration(stop.duration)}`), ...(extraTravelMinutes ? [`Desvíos: ≈ ${extraTravelMinutes} min y ${extraCost} € / persona`] : [])],
    warnings: [...new Set(warnings)],
  };
}

export function planRoutes(day: DayId, stops: Stop[]): RouteLine[] {
  const lines: RouteLine[] = [];
  const add = (id: string, mode: RouteLine["mode"], points: [number, number][]) => lines.push({ id, mode, coordinates: points });
  if (day === "sat") {
    add("sat-ferry-out", "ferry", routes.sat[0].coordinates);
    add("sat-ferry-cities", "ferry", routes.sat[2].coordinates);
    add("sat-ferry-return", "ferry", [...routes.sat[2].coordinates].reverse());
    add("sat-ferry-sliema", "ferry", [...routes.sat[0].coordinates].reverse());
    const firstVisit = stops.find((stop) => stop.id === "sat-cathedral");
    if (firstVisit) add("sat-pier-visit", "walk", [places.vallettaPier.coordinates, places[firstVisit.place].coordinates]);
    const birgu = stops.find((stop) => stop.id === "sat-birgu");
    if (birgu) add("sat-cities-visit", "walk", [places.cospicua.coordinates, places[birgu.place].coordinates, places.cospicua.coordinates]);
    add("sat-return-piers", "walk", [places.lascaris.coordinates, places.vallettaPier.coordinates]);
  } else if (day === "sun" && stops.some((stop) => stop.id === "sun-out")) {
    add("sun-ferry-out", "ferry", routes.sun[0].coordinates);
    add("sun-ferry-return", "ferry", [...routes.sun[0].coordinates].reverse());
  } else if (day === "sun" && stops.some((stop) => stop.id === "sc-ferry")) {
    const northRoad: [number, number][] = [places.apartment.coordinates, [14.497, 35.907], [14.477, 35.904], [14.456, 35.909], [14.429, 35.916], [14.417, 35.934], [14.398, 35.948], [14.374, 35.95], [14.353, 35.966], [14.335, 35.982], places.cirkewwa.coordinates];
    add("sc-road-out", "transfer", northRoad);
    add("sc-ferry-out", "ferry", [places.cirkewwa.coordinates, [14.325, 36.001], places.cominoPier.coordinates]);
    add("sc-ferry-back", "ferry", [places.cominoPier.coordinates, [14.325, 36.001], places.cirkewwa.coordinates]);
    add("sc-road-mellieha", "transfer", [places.cirkewwa.coordinates, [14.335, 35.982], [14.353, 35.966], places.mellieha.coordinates]);
    add("sc-road-home", "transfer", [places.mellieha.coordinates, [14.374, 35.95], ...northRoad.slice(1, 7).reverse(), places.apartment.coordinates]);
  }
  for (let i = 1; i < stops.length; i++) {
    const before = stops[i - 1]; const after = stops[i];
    if (before.place === after.place) continue;
    if (day === "sat" && (["sat-out", "sat-cities", "sat-return"].includes(before.id) || after.id === "sat-return")) continue;
    if (day === "sun" && (["sun-out", "sun-stop", "sun-back", "sc-ferry", "sc-back"].includes(before.id) || ["sun-stop", "sun-mgarr", "sun-back", "sc-ferry", "sc-back"].includes(after.id))) continue;
    if (day === "sun" && before.id === "sc-dinner" && after.id === "sc-home") continue;
    const distance = geoKm(before.place, after.place);
    const mode: RouteLine["mode"] = after.mode === "transfer" || (day === "mon" && distance > 1.3) ? "transfer" : after.mode === "bus" || (day === "sun" && distance > 1.3) ? "bus" : "walk";
    add(`${day}-${before.id}-${after.id}`, mode, [places[before.place].coordinates, places[after.place].coordinates]);
  }
  return lines;
}

export function loadEdits(): PlannerEdits {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem("malta-planner-v1") ?? "null");
    if (!parsed || typeof parsed !== "object") return emptyEdits;
    const data = parsed as Partial<PlannerEdits>;
    const titles: PlannerEdits["titles"] = {};
    for (const day of ["sat", "sun", "mon"] as DayId[]) if (typeof data.titles?.[day] === "string") titles[day] = data.titles[day]!.slice(0, 60);
    const choices: Record<string, string> = {};
    if (data.choices && typeof data.choices === "object") for (const [key, value] of Object.entries(data.choices)) if (typeof value === "string") choices[key] = value;
    return { titles, choices };
  } catch { return emptyEdits; }
}

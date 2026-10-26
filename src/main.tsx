import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { Anchor, ArrowUpRight, BedDouble, BriefcaseBusiness, BusFront, Camera, CarFront, Check, Clock3, Clapperboard, Compass, Download, Footprints, Landmark, MapPin, Moon, Pencil, Plane, Search, Ship, Star, Sun, Ticket, UtensilsCrossed, X } from "lucide-react";
import { Map, MapControls, MapMarker, MapRoute, MarkerContent, MarkerPopup, MarkerTooltip } from "@/components/ui/map";
import { dayMeta, places, routes, sourceLinks, type DayId, type MondayPlan, type SundayPlan, type RouteLine, type Stop } from "@/data";
import { areas, areaName, type AreaId } from "@/catalog";
import { airbnbUrl, bookings, restaurantAreas, type BookingId, type RestaurantArea } from "@/guide";
import { areaFor, baseStops, canEdit, choicesFor, emptyEdits, formatDuration, loadEdits, planDay, planRoutes, type PlannedDay, type PlannerEdits } from "@/planner";
import "./index.css";

type View = "all" | DayId;
type PhaseFilter = "all" | "morning" | "afternoon";
type Modal = { type: "event"; stop: Stop; day: DayId } | { type: "bookings" } | { type: "airbnb" } | { type: "restaurants" } | null;

const days: DayId[] = ["sat", "sun", "mon"];
const darkDayColors: Record<DayId, string> = { sat: "#e18c50", sun: "#e1cc6e", mon: "#caccc2" };

function uniqueStops(stops: Stop[]) {
  return stops.filter((stop, index) => stops.findIndex((item) => item.place === stop.place) === index);
}

function EventIcon({ stop, size = 16 }: { stop: Stop; size?: number }) {
  if (stop.place === "airport") return <Plane size={size} />;
  if (stop.mode === "ferry") return <Ship size={size} />;
  if (stop.mode === "bus") return <BusFront size={size} />;
  if (stop.kind === "transport") return <CarFront size={size} />;
  if (stop.kind === "food") return <UtensilsCrossed size={size} />;
  if (stop.kind === "monument") return <Landmark size={size} />;
  if (stop.id === "mon-popeye") return <Clapperboard size={size} />;
  if (stop.id === "mon-anchor") return <Camera size={size} />;
  return <Footprints size={size} />;
}

function BookingCard({ id, managed, onToggle }: { id: BookingId; managed: boolean; onToggle: (id: BookingId) => void }) {
  const booking = bookings[id];
  return (
    <article className="booking-card">
      <div className="booking-card-top"><strong>{booking.title}</strong>{booking.price && <span className="price-tag">{booking.price}</span>}</div>
      <p className="booking-context">{booking.context}</p>
      <p>{booking.note}</p>
      <div className="booking-actions">
        <a href={booking.url} target="_blank" rel="noopener noreferrer">{booking.action} <ArrowUpRight size={13} /></a>
        <button type="button" className="managed-button" aria-pressed={managed} onClick={() => onToggle(id)}><Check size={13} />{managed ? "Gestionado" : "Marcar gestionado"}</button>
      </div>
    </article>
  );
}

function RestaurantList({ area, time, meal }: { area: RestaurantArea; time?: string; meal?: "Comida" | "Cena" }) {
  const group = restaurantAreas[area];
  const minutes = time?.includes("–") ? (() => { const [a, b] = time.split("–"); const [ah, am] = a.split(":").map(Number); const [bh, bm] = b.split(":").map(Number); return bh * 60 + bm - ah * 60 - am; })() : 60;
  const mealMinutes = (place: typeof group.options[number]) => place.minutes ?? (place.budget === "Caro" ? 90 : place.budget === "Medio" ? 65 : 45);
  const ordered = [...group.options].sort((a, b) => {
    const fit = (place: typeof a) => mealMinutes(place) <= minutes ? 0 : 1;
    return fit(a) - fit(b) || Number(a.averagePrice.match(/\d+/)?.[0] ?? 0) - Number(b.averagePrice.match(/\d+/)?.[0] ?? 0);
  });
  return (
    <div className="restaurant-list">
      <div className="modal-section-head"><h3>{meal ? `${meal} por ${group.title}` : `Opciones en ${group.title}`}</h3><span>{time ? `${time} · ${formatDuration(minutes)} disponibles` : "Precios orientativos"}</span></div>
      {ordered.map((place) => (
        <article key={place.name} className="restaurant-card">
          <span className="restaurant-copy">
            <span className="restaurant-heading"><strong>{place.name}</strong><span className={`budget budget-${place.budget.toLowerCase()}`}>{place.budget}</span></span>
            {time && <span className="restaurant-fit" data-fit={mealMinutes(place) <= minutes}>{mealMinutes(place) <= minutes ? `Recomendado para vuestra parada de ${formatDuration(minutes)}` : `Necesita ≈ ${formatDuration(mealMinutes(place))} de mesa; vuestra parada es de ${formatDuration(minutes)}`}</span>}
            <span className="restaurant-facts"><span><UtensilsCrossed size={15} aria-hidden="true" />{place.cuisine}</span><span><strong>Precio medio</strong> {place.averagePrice} / persona</span><span><MapPin size={15} aria-hidden="true" />{place.location}</span></span>
            <small>{place.cue}</small>
            {place.googleRating != null && place.googleReviews != null ? <span className="restaurant-rating"><Star size={16} fill="currentColor" aria-hidden="true" /><strong>{place.googleRating.toFixed(1).replace(".", ",")}/5</strong><span>· {new Intl.NumberFormat("es-ES").format(place.googleReviews)} reseñas en Google</span></span> : <span className="restaurant-rating"><Star size={16} aria-hidden="true" /><span>Valoración actual: ver en Google</span></span>}
            <span className="restaurant-links"><a href={place.url} target="_blank" rel="noopener noreferrer">{place.url.includes("google.com/maps") ? "Ver en Google Maps" : "Ver carta o reservar"} <ArrowUpRight size={15} aria-hidden="true" /></a>{place.url !== place.googleUrl && <a href={place.googleUrl} target="_blank" rel="noopener noreferrer">Ver reseñas <ArrowUpRight size={15} aria-hidden="true" /></a>}</span>
          </span>
        </article>
      ))}
      {ordered.length === 0 && <p className="empty-options">No hay un restaurante verificable para esta zona en noviembre. En Comino llevad comida y agua desde Malta.</p>}
      {ordered.length > 0 && <p className="modal-footnote">Tiempo de mesa orientativo: 45, 65 o 90 min según el tipo de local; las degustaciones necesitan más margen. Precio por persona estimado; comprobad la carta. Las valoraciones disponibles se consultaron el 26 de octubre de 2026. Confirmad apertura y reservas.</p>}
    </div>
  );
}

function TimeMark({ stop }: { stop: Stop }) {
  const [start, end] = stop.time.split("–");
  const departure = stop.kind === "transport" && !end;
  return <span className="time-mark"><strong>{start}</strong><small>{end ? `hasta ${end}` : departure ? "salida" : "hora prevista"}</small></span>;
}

function AlternativePicker({ slot, selected, preview, onChoose, onMap }: { slot: Stop; selected: string; preview: PlannedDay; onChoose: (id: string) => void; onMap: () => void }) {
  const [area, setArea] = useState<AreaId | "all">(areaFor(slot));
  const [query, setQuery] = useState("");
  const allChoices = choicesFor(slot);
  const originalMinutes = allChoices[0].minutes;
  const availableAreas = areas.filter(([id]) => allChoices.some((choice) => choice.area === id));
  const choices = allChoices.filter((choice) => (area === "all" || choice.area === area) && `${choice.title} ${choice.description}`.toLocaleLowerCase("es").includes(query.toLocaleLowerCase("es")));
  const recommended = choices.filter((choice) => choice.minutes === originalMinutes);
  const others = choices.filter((choice) => choice.minutes !== originalMinutes);
  const renderChoice = (choice: typeof choices[number]) => <button type="button" key={choice.id} className="alternative" aria-pressed={selected === choice.id} onClick={() => onChoose(choice.id)}><span><strong>{choice.title}</strong><small>{choice.area ? areaName[choice.area] : "Zona próxima"} · {choice.description}</small><em>{formatDuration(choice.minutes)} · {choice.min === choice.max ? `${choice.min} €` : `${choice.min}–${choice.max} €`} / persona</em></span><span className="alternative-check">{selected === choice.id && <Check size={16} />}</span></button>;
  return <div className="alternative-list" aria-label={`Alternativas para ${slot.title}`}>
    <div className="option-controls"><label><span>Zona</span><select value={area} onChange={(event) => setArea(event.target.value as AreaId | "all")}><option value="all">Todas las zonas posibles</option>{availableAreas.map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></label><label><span>Buscar</span><span className="search-field"><Search size={15} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar visita o restaurante" /></span></label></div>
    <div className="recommendation-label"><Check size={14} /><strong>Recomendadas · misma duración ({formatDuration(originalMinutes)})</strong></div>
    {recommended.length ? recommended.map(renderChoice) : <p className="empty-options">No hay opciones de la misma duración en este filtro. Probad otra zona.</p>}
    {others.length > 0 && <details className="other-options"><summary>Otras duraciones · {others.length} opciones</summary><div>{others.map(renderChoice)}</div></details>}
    {!choices.length && <p className="empty-options">No se encontraron opciones. Quitad el filtro o buscad otra zona.</p>}
    {selected !== "original" && <div className="choice-preview" role="status"><strong>Vista previa actualizada</strong><span>{preview.start}–{preview.end} · {preview.min}–{preview.max} € / persona{preview.extraTravelMinutes ? ` · ≈ ${preview.extraTravelMinutes} min de desvíos` : ""}</span><button type="button" onClick={onMap}>Ver ruta en el mapa <ArrowUpRight size={14} /></button></div>}
    <p className="option-footnote">La ruta, la hora y el presupuesto se actualizan al elegir. Los traslados son estimaciones y pueden requerir más margen.</p>
  </div>;
}

function BudgetPanel({ estimate }: { estimate: PlannedDay }) {
  return <details className="budget-panel"><summary><span><strong>Tiempo del itinerario</strong><small>{estimate.start}–{estimate.end} · {estimate.span}</small><em>{formatDuration(estimate.activeMinutes + estimate.extraTravelMinutes)} de actividades y traslados</em></span><span><strong>Precio orientativo</strong><small>{estimate.min}–{estimate.max} € / persona</small></span></summary><div className="budget-breakdown"><strong>Desglose</strong><ul>{estimate.breakdown.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}</ul><p>Estimación para dos adultos que comparten los taxis. Excluye alojamiento, vuelos, desayuno y bebidas alcohólicas. Los desvíos se estiman; confirmad rutas y precios antes de reservar.</p></div></details>;
}

function MotionScene({ kind, replay }: { kind: "ferry" | "plane"; replay: number }) {
  return (
    <div key={`${kind}-${replay}`} className={`motion-scene motion-${kind}`} aria-label={kind === "ferry" ? "Animación del ferry cruzando el mar" : "Animación de un avión despegando"}>
      <span className="motion-orbit" />
      <span className="motion-vehicle">{kind === "ferry" ? <Ship size={33} /> : <Plane size={34} />}</span>
      <span className="motion-caption">{kind === "ferry" ? "Rumbo a la siguiente orilla" : "Próxima parada: el aeropuerto"}</span>
    </div>
  );
}

function pointOnPath(path: [number, number][], fraction: number): [number, number] {
  const lengths = path.slice(1).map((point, index) => Math.hypot((point[0] - path[index][0]) * 0.81, point[1] - path[index][1]));
  const total = lengths.reduce((sum, length) => sum + length, 0);
  let distance = total * fraction;
  for (let index = 0; index < lengths.length; index++) {
    if (distance <= lengths[index] || index === lengths.length - 1) {
      const ratio = lengths[index] ? Math.min(1, distance / lengths[index]) : 0;
      return [path[index][0] + (path[index + 1][0] - path[index][0]) * ratio, path[index][1] + (path[index + 1][1] - path[index][1]) * ratio];
    }
    distance -= lengths[index];
  }
  return path[path.length - 1];
}

function App() {
  const [view, setView] = useState<View>("all");
  const [mondayPlan, setMondayPlan] = useState<MondayPlan>("popeye");
  const [sundayPlan, setSundayPlan] = useState<SundayPlan>("gozo");
  const [includeMuseum, setIncludeMuseum] = useState(false);
  const [phaseFilter, setPhaseFilter] = useState<PhaseFilter>("all");
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    try { return localStorage.getItem("malta-theme") === "dark" ? "dark" : "light"; }
    catch { return "light"; }
  });
  const [selectedPlace, setSelectedPlace] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [cameraRevision, setCameraRevision] = useState(0);
  const [modal, setModal] = useState<Modal>(null);
  const [motionReplay, setMotionReplay] = useState(0);
  const [ferryPath, setFerryPath] = useState<[number, number][] | null>(null);
  const [ferryPosition, setFerryPosition] = useState<[number, number] | null>(null);
  const [savedEdits, setSavedEdits] = useState<PlannerEdits>(loadEdits);
  const [draftEdits, setDraftEdits] = useState<PlannerEdits>(emptyEdits);
  const [editMode, setEditMode] = useState(false);
  const [editingSlot, setEditingSlot] = useState<string | null>(null);
  const [restaurantDay, setRestaurantDay] = useState<DayId>("sat");
  const [restaurantBrowseArea, setRestaurantBrowseArea] = useState<AreaId>("valletta");
  const [pdfBusy, setPdfBusy] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [pdfHref, setPdfHref] = useState<string | null>(null);
  const [managedBookings, setManagedBookings] = useState<BookingId[]>(() => {
    try { const saved: unknown = JSON.parse(localStorage.getItem("malta-managed-bookings") ?? "[]"); return Array.isArray(saved) ? saved.filter((item): item is BookingId => typeof item === "string" && item in bookings) : []; }
    catch { return []; }
  });
  const dialogRef = useRef<HTMLDialogElement>(null);
  const mapPanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", theme === "dark" ? "#131112" : "#e2edb7");
    try { localStorage.setItem("malta-theme", theme); } catch { /* storage may be unavailable */ }
  }, [theme]);

  useEffect(() => {
    try { localStorage.setItem("malta-managed-bookings", JSON.stringify(managedBookings)); } catch { /* storage may be unavailable */ }
  }, [managedBookings]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (modal && !dialog.open) dialog.showModal();
    if (!modal && dialog.open) dialog.close();
  }, [modal]);

  useEffect(() => {
    if (!ferryPath) return;
    let frame = 0;
    let clearTimer = 0;
    const start = performance.now();
    const duration = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 3200;
    const move = (now: number) => {
      const progress = duration ? Math.min(1, (now - start) / duration) : 1;
      setFerryPosition(pointOnPath(ferryPath, progress));
      if (progress < 1) frame = requestAnimationFrame(move);
      else clearTimer = window.setTimeout(() => setFerryPosition(null), 400);
    };
    frame = requestAnimationFrame(move);
    return () => { cancelAnimationFrame(frame); window.clearTimeout(clearTimer); setFerryPosition(null); };
  }, [ferryPath, motionReplay]);

  const currentEdits = editMode ? draftEdits : savedEdits;
  const plans: Record<DayId, PlannedDay> = { sat: planDay("sat", includeMuseum, mondayPlan, currentEdits, sundayPlan), sun: planDay("sun", includeMuseum, mondayPlan, currentEdits, sundayPlan), mon: planDay("mon", includeMuseum, mondayPlan, currentEdits, sundayPlan) };
  const dayStops: Record<DayId, Stop[]> = { sat: plans.sat.stops, sun: plans.sun.stops, mon: plans.mon.stops };
  const activeStops = view === "all" ? [] : dayStops[view];
  const filteredStops = phaseFilter === "all" ? activeStops : activeStops.filter((stop) => stop.phase === phaseFilter);
  const dayColors = theme === "dark" ? darkDayColors : { sat: dayMeta.sat.color, sun: dayMeta.sun.color, mon: dayMeta.mon.color };

  const activeRoutes: { day: DayId; line: RouteLine }[] = useMemo(() => {
    const shown = view === "all" ? days : [view];
    return shown.flatMap((day) => planRoutes(day, dayStops[day]).map((line) => ({ day, line })));
  }, [view, mondayPlan, sundayPlan, includeMuseum, currentEdits]);

  const visibleStops = useMemo(() => {
    if (view !== "all") return uniqueStops(phaseFilter === "all" ? dayStops[view] : dayStops[view].filter((stop) => stop.phase === phaseFilter));
    return uniqueStops([...dayStops.sat, ...dayStops.sun, ...dayStops.mon]);
  }, [view, mondayPlan, sundayPlan, includeMuseum, phaseFilter, currentEdits]);

  const bookingIds: BookingId[] = [...new Set<BookingId>(["airbnb", ...days.flatMap((day) => dayStops[day].flatMap((stop) => stop.bookingIds ?? []))])];
  const activeColor = view === "all" ? "var(--primary)" : dayColors[view];
  const overallBudget = { min: days.reduce((sum, day) => sum + plans[day].min, 0), max: days.reduce((sum, day) => sum + plans[day].max, 0), activeMinutes: days.reduce((sum, day) => sum + plans[day].activeMinutes + plans[day].extraTravelMinutes, 0) };
  const dayTitle = (day: DayId) => currentEdits.titles[day]?.trim() || (day === "mon" ? mondayPlan === "popeye" ? "Popeye Village" : "Mdina y Rabat" : day === "sun" ? sundayPlan === "gozo" ? "Gozo y Victoria" : sundayPlan === "comino" ? "Comino y Mellieħa" : "Mdina, templos y Marsaxlokk" : dayMeta[day].title);
  useEffect(() => { setPdfHref((current) => { if (current) URL.revokeObjectURL(current); return null; }); }, [currentEdits, includeMuseum, mondayPlan, sundayPlan]);

  const colorFor = (placeId: string) => {
    const day: DayId = dayStops.sat.some((stop) => stop.place === placeId) ? "sat" : dayStops.sun.some((stop) => stop.place === placeId) ? "sun" : "mon";
    return { background: dayColors[day], foreground: theme === "dark" || day === "mon" ? "#131112" : "#ffffff" };
  };

  const camera = selectedPlace
    ? { center: places[selectedPlace].coordinates, zoom: 13.1 }
    : view === "sat" ? { center: [14.514, 35.896] as [number, number], zoom: 12.2 }
      : view === "sun" ? sundayPlan === "gozo" ? { center: [14.375, 35.979] as [number, number], zoom: 10.2 } : sundayPlan === "comino" ? { center: [14.36, 35.986] as [number, number], zoom: 10.5 } : { center: [14.46, 35.859] as [number, number], zoom: 10.4 }
        : view === "mon" ? mondayPlan === "popeye"
          ? { center: [14.426, 35.931] as [number, number], zoom: 10.5 }
          : { center: [14.457, 35.886] as [number, number], zoom: 11.2 }
          : { center: [14.383, 35.950] as [number, number], zoom: 9.3 };

  const chooseView = (nextView: View) => {
    setView(nextView);
    setPhaseFilter("all");
    setSelectedPlace(null);
    setSelectedEvent(null);
    setFerryPath(null);
    setTheme("light");
    setCameraRevision((value) => value + 1);
    setEditingSlot(null);
  };

  const choosePhase = (phase: PhaseFilter) => {
    setPhaseFilter(phase);
    setSelectedPlace(null);
    setSelectedEvent(null);
    setFerryPath(null);
    setTheme(phase === "afternoon" ? "dark" : "light");
    setCameraRevision((value) => value + 1);
  };

  const chooseMondayPlan = (plan: MondayPlan) => {
    setMondayPlan(plan);
    setPhaseFilter("all");
    setSelectedPlace(null);
    setSelectedEvent(null);
    setTheme("light");
    setCameraRevision((value) => value + 1);
    setEditingSlot(null);
  };
  const chooseSundayPlan = (plan: SundayPlan) => {
    setSundayPlan(plan); setPhaseFilter("all"); setSelectedPlace(null); setSelectedEvent(null); setFerryPath(null); setTheme("light"); setCameraRevision((value) => value + 1); setEditingSlot(null);
  };

  const startEditing = () => {
    if (view === "all") setView("sat");
    setDraftEdits({ titles: { ...savedEdits.titles }, choices: { ...savedEdits.choices } });
    setEditingSlot(null);
    setEditMode(true);
  };
  const cancelEditing = () => { setEditMode(false); setEditingSlot(null); setSelectedPlace(null); };
  const saveEditing = () => {
    if (days.some((day) => plans[day].warnings.length)) return;
    const next = { titles: { ...draftEdits.titles }, choices: { ...draftEdits.choices } };
    setSavedEdits(next);
    try { localStorage.setItem("malta-planner-v1", JSON.stringify(next)); } catch { /* storage may be unavailable */ }
    setEditMode(false);
    setEditingSlot(null);
  };
  const chooseAlternative = (slotId: string, optionId: string) => {
    setDraftEdits((current) => ({ ...current, choices: { ...current.choices, [slotId]: optionId } }));
    setSelectedPlace(null);
    setSelectedEvent(null);
    setCameraRevision((value) => value + 1);
  };
  const downloadPdf = async () => {
    setPdfBusy(true);
    setPdfError(null);
    try {
      const { prepareCurrentPdf } = await import("@/pdf");
      const url = await prepareCurrentPdf({ plans, titles: { sat: dayTitle("sat"), sun: dayTitle("sun"), mon: dayTitle("mon") }, totalMin: overallBudget.min, totalMax: overallBudget.max, totalMinutes: overallBudget.activeMinutes });
      setPdfHref((current) => { if (current) URL.revokeObjectURL(current); return url; });
    } catch {
      setPdfError("No se pudo preparar el PDF. Probad de nuevo o descargad el PDF original.");
    } finally { setPdfBusy(false); }
  };

  const chooseEvent = (stop: Stop, day: DayId) => {
    setSelectedEvent(stop.id);
    setTheme(stop.phase === "afternoon" ? "dark" : "light");
    setSelectedPlace(stop.mode === "ferry" ? null : stop.place);
    setCameraRevision((value) => value + 1);
    setModal({ type: "event", stop, day });
    setMotionReplay((value) => value + 1);
    if (stop.mode === "ferry") {
      const path = stop.id === "sc-ferry" ? [places.cirkewwa.coordinates, [14.325, 36.001] as [number, number], places.cominoPier.coordinates]
        : stop.id === "sc-back" ? [places.cominoPier.coordinates, [14.325, 36.001] as [number, number], places.cirkewwa.coordinates]
        : stop.id === "sat-out" ? routes.sat[0].coordinates
        : stop.id === "sat-cities" ? routes.sat[2].coordinates
          : stop.id === "sat-return" ? [...routes.sat[2].coordinates].reverse()
            : stop.id === "sun-back" ? [...routes.sun[0].coordinates].reverse()
              : routes.sun[0].coordinates;
      setFerryPath(path);
    } else setFerryPath(null);
  };

  const toggleBooking = (id: BookingId) => setManagedBookings((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  const modalStop = modal?.type === "event" ? modal.stop : null;
  const motionKind = modalStop?.mode === "ferry" ? "ferry" : modalStop?.place === "airport" ? "plane" : null;

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand"><span className="brand-mark"><Compass size={17} strokeWidth={1.8} /></span> Malta en tres días</div>
        <div className="header-right">
          <div className="top-meta"><span>13–16 noviembre 2026</span><span>Base: Tas-Sliema</span></div>
          <button className="header-action" type="button" aria-label="Abrir entradas y reservas" onClick={() => setModal({ type: "bookings" })}><Ticket size={15} /><span>Entradas</span></button>
          <button className="header-action" type="button" aria-label="Abrir recomendaciones de restaurantes" onClick={() => { setRestaurantDay(view === "all" ? "sat" : view); setModal({ type: "restaurants" }); }}><UtensilsCrossed size={15} /><span>Restaurantes</span></button>
          <button className="header-action stay-action" type="button" aria-label="Abrir detalles del Airbnb" onClick={() => setModal({ type: "airbnb" })}><BedDouble size={15} /><span>Airbnb</span></button>
          <button className="theme-toggle" type="button" onClick={() => setTheme(theme === "light" ? "dark" : "light")} aria-label={theme === "light" ? "Activar modo oscuro" : "Activar modo claro"}>{theme === "light" ? <Moon size={17} /> : <Sun size={17} />}</button>
        </div>
      </header>

      <section className="intro" aria-labelledby="page-title">
        <div>
          <div className="eyebrow">El viaje, de un vistazo</div>
          <h1 id="page-title">Tres días para descubrir Malta.</h1>
          <p>La Valeta el sábado, Gozo o una excursión alternativa el domingo, y Popeye Village o Mdina el lunes. Elegid las visitas y restaurantes para previsualizar rutas, horarios y costes.</p>
        </div>
        <div className="intro-actions"><div className="time-guide" aria-label="Horarios importantes"><div><Clock3 size={17} /><span><strong>Visitas</strong><small>09:00–14:00 · 16:00–20:00</small></span></div><div><UtensilsCrossed size={17} /><span><strong>Comidas</strong><small>13:00–15:00 · 19:00–21:00</small></span></div><div className="time-guide-departure"><BriefcaseBusiness size={17} /><span><strong>Lunes · salida 17:00</strong><small>Al aeropuerto, con equipaje</small></span></div></div><div className="pdf-actions"><button className="download-button" type="button" onClick={downloadPdf} disabled={pdfBusy}><Download size={17} /> {pdfBusy ? "Preparando PDF…" : pdfHref ? "Actualizar PDF personalizado" : "Preparar PDF personalizado"}</button>{pdfHref && <a className="prepared-pdf-link" href={pdfHref} download="itinerario-malta-personalizado-13-16-noviembre-2026.pdf"><Download size={15} /> Descargar PDF preparado</a>}<a className="base-pdf-link" href={`${import.meta.env.BASE_URL}itinerario-malta-2026.pdf`} download="itinerario-malta-base-13-16-noviembre-2026.pdf">Descargar PDF original</a>{pdfError && <span className="pdf-error" role="alert">{pdfError}</span>}</div></div>
      </section>

      <section className="board" aria-label="Mapa interactivo del itinerario">
        <aside className="sidebar" style={{ "--day-color": activeColor } as React.CSSProperties}>
          <div className="sidebar-topline"><div className="section-kicker">Planificar por día</div>{!editMode && <button className="edit-trigger" type="button" onClick={startEditing}><Pencil size={14} /> Editar plan</button>}</div>
          <div className="tabs" role="tablist" aria-label="Día del itinerario">
            {(["all", ...days] as View[]).map((item) => <button key={item} className="tab" type="button" role="tab" aria-selected={view === item} onClick={() => chooseView(item)}>{item === "all" ? "Todos" : dayMeta[item].weekday.slice(0, 3)}</button>)}
          </div>

            {view === "all" ? <>
            <div className="day-head"><div className="day-date"><i />13–16 noviembre 2026</div><h2>El recorrido completo</h2><p>Elegid un día para ver sus paradas y opciones.</p></div>
            <div className="trip-budget"><strong>Presupuesto de los tres días</strong><span>{overallBudget.min}–{overallBudget.max} € / persona</span><small>{formatDuration(overallBudget.activeMinutes)} de actividades y traslados · dos adultos compartiendo taxis</small></div>
            <div className="all-summary">{days.map((day) => { const budget = plans[day]; return <button key={day} type="button" className="all-card" style={{ "--day-color": dayColors[day] } as React.CSSProperties} onClick={() => chooseView(day)}><span>{dayMeta[day].weekday} · {dayMeta[day].date}</span><strong>{dayTitle(day)}</strong><small>{budget.start}–{budget.end} · {budget.span}</small><small>{formatDuration(budget.activeMinutes + budget.extraTravelMinutes)} de actividades y traslados</small><small className="all-card-price">{budget.min}–{budget.max} € / persona</small></button>; })}</div>
            <div className="all-tip"><Ticket size={15} /> Preparad ferris y atracciones desde «Entradas». El lunes lleváis el equipaje y vais directamente desde la última visita al aeropuerto.</div>
            <button className="airbnb-card" type="button" onClick={() => setModal({ type: "airbnb" })}><BedDouble size={18} /><span><strong>Vuestro apartamento · B Suites</strong><small>136 Triq Tigne', Tas-Sliema · abrir reserva</small></span><ArrowUpRight size={15} /></button>
          </> : <>
            <div className="day-head"><div className="day-date"><i />{dayMeta[view].weekday} · {dayMeta[view].date}</div>{editMode ? <label className="title-editor"><span>Título del día</span><input aria-label={`Título del ${dayMeta[view].weekday.toLowerCase()}`} maxLength={60} value={draftEdits.titles[view] ?? dayTitle(view)} onChange={(event) => setDraftEdits((current) => ({ ...current, titles: { ...current.titles, [view]: event.target.value } }))} /></label> : <h2>{dayTitle(view)}</h2>}<p>{dayMeta[view].subtitle}</p></div>
            {view === "sat" && <div className="choice"><span className="choice-label">Opción cultural</span><button className="museum-toggle" type="button" aria-pressed={includeMuseum} onClick={() => { setIncludeMuseum((value) => !value); setSelectedPlace(null); setSelectedEvent(null); setCameraRevision((value) => value + 1); }}><Landmark size={16} /><span><strong>{includeMuseum ? "Museo incluido" : "Incluir Museo Arqueológico"}</strong><small>Sustituye una hora de paseo libre</small></span><span className="switch-track"><span /></span></button></div>}
            {view === "sun" && <div className="choice"><span className="choice-label">Excursión del domingo</span><div className="choice-buttons sunday-options"><button type="button" className="option" aria-pressed={sundayPlan === "gozo"} onClick={() => chooseSundayPlan("gozo")}>Gozo</button><button type="button" className="option" aria-pressed={sundayPlan === "comino"} onClick={() => chooseSundayPlan("comino")}>Comino</button><button type="button" className="option" aria-pressed={sundayPlan === "malta"} onClick={() => chooseSundayPlan("malta")}>Malta · sin ferry</button></div><p className="route-choice-note">La ruta por Malta conserva fortificaciones, templos y costa. Comino depende del tiempo marítimo.</p></div>}
            {view === "mon" && <div className="choice"><span className="choice-label">Elegid una opción</span><div className="choice-buttons"><button type="button" className="option" aria-pressed={mondayPlan === "mdina"} onClick={() => chooseMondayPlan("mdina")}>Mdina + Rabat</button><button type="button" className="option" aria-pressed={mondayPlan === "popeye"} onClick={() => chooseMondayPlan("popeye")}>Popeye Village</button></div></div>}
            {editMode && <div className="edit-toolbar"><div><strong>Vista previa de la ruta</strong><small>Elegid una alternativa en cada visita. Los cambios se guardan solo en este navegador.</small></div><div className="edit-actions"><button type="button" onClick={cancelEditing}>Cancelar</button><button type="button" className="save-edit" onClick={saveEditing} disabled={days.some((day) => plans[day].warnings.length)}>Guardar</button></div></div>}
            <BudgetPanel estimate={plans[view]} />
            {plans[view].warnings.length > 0 && <div className="plan-warning" role="alert"><strong>Revisad antes de guardar</strong>{plans[view].warnings.map((warning) => <p key={warning}>{warning}</p>)}</div>}
            {view === "mon" && <p className="luggage-note">Llevad el equipaje desde la salida. Si elegís Popeye Village con maletas grandes, confirmad antes si podéis guardarlas durante la visita.</p>}
            <div className="phase-tabs" role="group" aria-label="Franja del día"><button type="button" aria-pressed={phaseFilter === "all"} onClick={() => choosePhase("all")}>Todo</button><button type="button" aria-pressed={phaseFilter === "morning"} onClick={() => choosePhase("morning")}><Sun size={13} /> Mañana</button><button type="button" aria-pressed={phaseFilter === "afternoon"} onClick={() => choosePhase("afternoon")}><Moon size={13} /> Tarde</button></div>
            <div className="stops" aria-label="Paradas del día">{filteredStops.map((stop, index) => {
              const base = baseStops(view, includeMuseum, mondayPlan, sundayPlan).find((item) => item.id === stop.id)!;
              return <React.Fragment key={stop.id}>
                {(index === 0 || stop.phase !== filteredStops[index - 1].phase) && <div className="phase-label">{stop.phase === "morning" ? "Mañana · visitas 09:00–14:00" : view === "mon" ? "Tarde · aeropuerto 17:00" : "Tarde · visitas 16:00–20:00"}</div>}
                <div className="stop-row" data-kind={stop.kind} data-departure={stop.place === "airport"}>
                  <button type="button" className="stop-button" data-active={selectedEvent === stop.id} onClick={() => chooseEvent(stop, view)} aria-label={`${stop.time}, ${stop.title}. Abrir detalles`}>
                    <TimeMark stop={stop} /><span className="stop-icon" data-kind={stop.kind}><EventIcon stop={stop} size={16} /></span><span className="stop-copy"><strong>{stop.title}</strong><small>{stop.description}</small></span><ArrowUpRight className="stop-arrow" size={13} />
                  </button>
                  {editMode && canEdit(base) && <button className="change-stop" type="button" aria-expanded={editingSlot === stop.id} onClick={() => setEditingSlot(editingSlot === stop.id ? null : stop.id)}><Pencil size={13} /> Cambiar</button>}
                  {editMode && editingSlot === stop.id && <AlternativePicker key={`${stop.id}-${sundayPlan}`} slot={base} selected={draftEdits.choices[stop.id] ?? "original"} preview={plans[view]} onChoose={(id) => chooseAlternative(stop.id, id)} onMap={() => mapPanelRef.current?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" })} />}
                </div>
              </React.Fragment>;
            })}</div>
          </>}
          <div className="sidebar-footer">Los recorridos son esquemáticos. Confirmad horarios, disponibilidad y reservas antes de viajar.</div>
        </aside>

        <div ref={mapPanelRef} className="map-panel" style={{ "--day-color": activeColor } as React.CSSProperties}>
          <div className="map-wrap"><Map key={`${view}-${mondayPlan}-${sundayPlan}-${includeMuseum}-${selectedPlace ?? "overview"}-${cameraRevision}`} center={camera.center} zoom={camera.zoom} theme={theme}>
            {activeRoutes.map(({ day, line }) => <MapRoute key={line.id} coordinates={line.coordinates} color={dayColors[day]} width={line.mode === "ferry" ? 3.5 : 2.5} opacity={view === "all" ? 0.72 : 0.9} dashArray={line.mode === "ferry" ? [1.5, 1.5] : line.mode === "transfer" ? [0.6, 2] : undefined} />)}
            {visibleStops.map((stop) => { const place = places[stop.place]; const base = stop.place === "apartment" || stop.place === "sliema"; const pinColor = colorFor(place.id); return <MapMarker key={place.id} longitude={place.coordinates[0]} latitude={place.coordinates[1]}><MarkerContent><span className={`pin ${base ? "pin-base" : ""}`} style={{ "--pin-color": pinColor.background, "--pin-foreground": pinColor.foreground } as React.CSSProperties} aria-label={place.name}>{base ? <MapPin size={16} strokeWidth={2.5} /> : view === "all" ? "•" : dayStops[view].findIndex((item) => item.place === stop.place) + 1}</span></MarkerContent><MarkerTooltip>{place.short}</MarkerTooltip><MarkerPopup><div className="popup"><div className="popup-kicker">{view === "all" ? "Parada del viaje" : dayMeta[view].weekday}</div><strong>{place.name}</strong><p>{place.detail}</p></div></MarkerPopup></MapMarker>; })}
            {ferryPosition && <MapMarker longitude={ferryPosition[0]} latitude={ferryPosition[1]}><MarkerContent><span className="moving-ferry"><Ship size={19} /></span></MarkerContent></MapMarker>}
            <MapControls position="top-right" showZoom showCompass showFullscreen />
          </Map></div>
          <div className="map-overlay"><i />{editMode ? "Vista previa · " : ""}{view === "all" ? "Malta · 3 días" : `${dayMeta[view].weekday} ${dayMeta[view].date} · ${dayTitle(view)}`}</div>
          <div className="map-legend" aria-label="Leyenda del mapa"><span className="legend-item"><span className="legend-line" /> paseo / autobús</span><span className="legend-item"><span className="legend-line dashed" /> ferry</span><span className="legend-item"><span className="legend-line dotted" /> traslado</span></div>
        </div>
      </section>

      <footer className="under-board"><p><Anchor size={14} style={{ display: "inline", verticalAlign: "-2px", marginRight: 5 }} />Museo opcional el sábado. {sundayPlan === "gozo" ? "Cena en Gozo antes del ferry de las 21:15." : sundayPlan === "comino" ? "Comino requiere confirmar ferris y llevar picnic." : "El domingo queda en la isla principal."} El lunes salís con equipaje hacia el aeropuerto a las 17:00.</p><nav className="sources" aria-label="Fuentes oficiales">{sourceLinks.map((source) => <a key={source.url} href={source.url} target="_blank" rel="noreferrer">{source.label} <ArrowUpRight size={10} style={{ display: "inline" }} /></a>)}</nav></footer>

      <section className="print-sheet" aria-label="Versión imprimible del itinerario">
        <h1>Malta · 13–16 noviembre 2026</h1><p>B Suites, 136 Triq Tigne', Tas-Sliema, Malta · <a href={airbnbUrl}>Reserva de Airbnb</a></p>
        <p>Presupuesto de los tres días: {overallBudget.min}–{overallBudget.max} € por persona. Tiempo de actividades y traslados: {formatDuration(overallBudget.activeMinutes)}. Estimación para dos adultos; no incluye alojamiento, vuelos, desayuno ni alcohol.</p>
        {days.map((day) => <article className="print-day" key={day}><h2>{dayMeta[day].weekday} {dayMeta[day].date} · {dayTitle(day)}</h2><p>{plans[day].start}–{plans[day].end} · {plans[day].span} de itinerario · {formatDuration(plans[day].activeMinutes + plans[day].extraTravelMinutes)} de actividades y traslados · {plans[day].min}–{plans[day].max} € / persona</p><ol>{plans[day].stops.map((stop) => <li key={stop.id}><strong>{stop.time} · {stop.title}</strong><br />{stop.description}{stop.bookingIds?.map((id) => <span key={id}> · <a href={bookings[id].url}>{bookings[id].title}</a></span>)}{stop.infoUrl && <span> · <a href={stop.infoUrl}>Ver en el mapa</a></span>}{stop.restaurantArea && <span><br />Restaurantes: {restaurantAreas[stop.restaurantArea].options.slice(0, 5).map((restaurant, index) => <span key={restaurant.name}>{index ? " · " : ""}<a href={restaurant.url}>{restaurant.name}</a> ({restaurant.averagePrice}, {restaurant.cuisine}, {restaurant.location}{restaurant.googleRating != null ? `, Google ${restaurant.googleRating.toFixed(1).replace(".", ",")}/5` : ""})</span>)}</span>}</li>)}</ol></article>)}
        <p>El lunes lleváis el equipaje y salís directamente de la última zona visitada hacia el aeropuerto a las 17:00. Las rutas y precios son orientativos; confirmad horarios, reservas y traslados antes de viajar.</p>
      </section>

      <dialog ref={dialogRef} className="detail-dialog" onClose={() => setModal(null)} onClick={(event) => { if (event.target === dialogRef.current) dialogRef.current?.close(); }} aria-label={modal?.type === "event" ? modal.stop.title : modal?.type === "airbnb" ? "Apartamento y Airbnb" : modal?.type === "restaurants" ? "Restaurantes recomendados" : "Entradas y reservas"}>
        {modal && <div className="modal-body"><button className="modal-close" type="button" aria-label="Cerrar modal" onClick={() => setModal(null)}><X size={18} /></button>
          {modal.type === "event" && <><div className="modal-eyebrow">{dayMeta[modal.day].weekday} · {modal.stop.time} · {modal.stop.phase === "morning" ? "Mañana" : "Tarde"}</div><div className="modal-title-row"><span className="modal-event-icon"><EventIcon stop={modal.stop} size={23} /></span><h2>{modal.stop.title}</h2></div><p className="modal-lead">{modal.stop.description}</p>{motionKind && <MotionScene kind={motionKind} replay={motionReplay} />}{modal.stop.place === "airport" && <p className="modal-footnote">La animación representa vuestro vuelo. El traslado al aeropuerto es por tierra y sale directamente desde {mondayPlan === "popeye" ? "Mellieħa" : "Rabat/Mdina"} a las 17:00.</p>}{modal.stop.bookingIds && <div className="modal-section"><div className="modal-section-head"><h3>Entradas y transporte</h3><span>Enlaces oficiales</span></div>{modal.stop.bookingIds.map((id) => <BookingCard key={id} id={id} managed={managedBookings.includes(id)} onToggle={toggleBooking} />)}</div>}{modal.stop.infoUrl && <a className="primary-link" href={modal.stop.infoUrl} target="_blank" rel="noopener noreferrer">Ver sitio y acceso <ArrowUpRight size={15} /></a>}{modal.stop.restaurantArea && <RestaurantList area={modal.stop.restaurantArea} time={modal.stop.time} meal={modal.stop.title.toLowerCase().startsWith("cena") ? "Cena" : "Comida"} />}{!modal.stop.bookingIds && !modal.stop.restaurantArea && !modal.stop.infoUrl && <p className="modal-footnote">Esta parada no necesita entrada anticipada. Seleccionad otra parada o cerrad para volver al mapa.</p>}</>}
          {modal.type === "bookings" && <><div className="modal-eyebrow">Preparad el viaje</div><div className="modal-title-row"><span className="modal-event-icon"><Ticket size={23} /></span><h2>Entradas y reservas</h2></div><p className="modal-lead">Todos los enlaces relevantes para el plan actual. Marcad lo que ya tengáis gestionado; se guardará en este navegador.</p><div className="booking-list">{bookingIds.map((id) => <BookingCard key={id} id={id} managed={managedBookings.includes(id)} onToggle={toggleBooking} />)}</div><p className="modal-footnote">Precios orientativos consultados el 26 de octubre de 2026. La compra y las condiciones finales se confirman en cada web oficial.</p></>}
          {modal.type === "restaurants" && <><div className="modal-eyebrow">Comer según vuestro horario</div><div className="modal-title-row"><span className="modal-event-icon"><UtensilsCrossed size={23} /></span><h2>Restaurantes recomendados</h2></div><p className="modal-lead">Primero veréis los lugares de las paradas actuales y el tiempo disponible. También podéis explorar las 14 zonas y escoger un restaurante desde «Editar plan».</p><div className="restaurant-day-tabs" role="group" aria-label="Día de restaurantes">{days.map((day) => <button type="button" key={day} aria-pressed={restaurantDay === day} onClick={() => setRestaurantDay(day)}>{dayMeta[day].weekday}</button>)}</div>{plans[restaurantDay].stops.filter((stop) => stop.restaurantArea).map((stop) => <RestaurantList key={stop.id} area={stop.restaurantArea!} time={stop.time} meal={stop.title.toLowerCase().startsWith("cena") ? "Cena" : "Comida"} />)}<details className="restaurant-explorer"><summary>Explorar restaurantes por zona</summary><label><span>Zona</span><select value={restaurantBrowseArea} onChange={(event) => setRestaurantBrowseArea(event.target.value as AreaId)}>{areas.map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></label><RestaurantList area={restaurantBrowseArea} /></details></>}
          {modal.type === "airbnb" && <><div className="modal-eyebrow">Vuestra base en Malta</div><div className="modal-title-row"><span className="modal-event-icon"><BedDouble size={23} /></span><h2>B Suites, Tas-Sliema</h2></div><p className="modal-lead">136 Triq Tigne', Tas-Sliema, Malta · 13–16 noviembre 2026</p><div className="stay-panel"><MapPin size={18} /><div><strong>Dirección del alojamiento</strong><p>B Suites, 136 Triq Tigne', Tas-Sliema, Malta. El marcador del mapa sigue siendo orientativo; comprobad el acceso y el check-in en vuestra reserva.</p></div></div><a className="primary-link" href={airbnbUrl} target="_blank" rel="noopener noreferrer">Abrir vuestra reserva en Airbnb <ArrowUpRight size={15} /></a><p className="modal-footnote">El enlace puede requerir iniciar sesión en Airbnb. No mostramos datos privados de la reserva dentro de esta web.</p></>}
        </div>}
      </dialog>
    </main>
  );
}

const root = createRoot(document.getElementById("root")!);
root.render(<React.StrictMode><App /></React.StrictMode>);
if (import.meta.hot) import.meta.hot.dispose(() => root.unmount());

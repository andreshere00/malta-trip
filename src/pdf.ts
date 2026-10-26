import type { jsPDF } from "jspdf";
import type { DayId } from "./data";
import { dayMeta } from "./data";
import { airbnbUrl, bookings, restaurantAreas } from "./guide";
import { formatDuration, type PlannedDay } from "./planner";

type PdfData = { plans: Record<DayId, PlannedDay>; titles: Record<DayId, string>; totalMin: number; totalMax: number; totalMinutes: number };
type Rgb = [number, number, number];

const hex = (value: string): Rgb => [1, 3, 5].map((i) => parseInt(value.slice(i, i + 2), 16)) as Rgb;
const mix = (a: Rgb, b: Rgb, weight: number): Rgb => a.map((c, i) => Math.round(c * weight + b[i] * (1 - weight))) as Rgb;

const WHITE: Rgb = [255, 255, 255];
const INK = hex("#5c1b35");
const ROSE = hex("#d43f5d");
const PEACH = hex("#f2a772");
const YELLOW = hex("#e8d890");
const PAPER = mix(hex("#e2edb7"), WHITE, 0.12);
const MUTED = mix(INK, WHITE, 0.69);
const BORDER = mix(INK, WHITE, 0.16);
const ACCENT = mix(PEACH, WHITE, 0.24);
const SOFT = mix(YELLOW, WHITE, 0.18);
const ROSE_TEXT = hex("#ae2e4b");
const MARGIN = 16;
const TOP = 18;

function toBase64(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let offset = 0; offset < bytes.length; offset += 8192) binary += String.fromCharCode(...bytes.subarray(offset, offset + 8192));
  return btoa(binary);
}

export async function prepareCurrentPdf(data: PdfData) {
  const [{ jsPDF }, fontResponse] = await Promise.all([import("jspdf"), fetch(`${import.meta.env.BASE_URL}fonts/RobotoSlab.ttf`)]);
  if (!fontResponse.ok) throw new Error("No se pudo cargar la fuente del PDF");
  const doc: jsPDF = new jsPDF({ unit: "mm", format: "a4", compress: true });
  doc.addFileToVFS("RobotoSlab.ttf", toBase64(await fontResponse.arrayBuffer()));
  doc.addFont("RobotoSlab.ttf", "RobotoSlab", "normal");
  doc.setFont("RobotoSlab", "normal");

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const right = pageWidth - MARGIN;
  const textWidth = right - MARGIN;
  let y = TOP;
  let page = 1;

  const fill = (color: Rgb) => doc.setFillColor(...color);
  const stroke = (color: Rgb) => doc.setDrawColor(...color);
  const paintPage = () => { fill(PAPER); doc.rect(0, 0, pageWidth, pageHeight, "F"); };
  function newPage() { doc.addPage(); page++; paintPage(); y = TOP; }
  function ensure(height: number) { if (y + height > pageHeight - 18) newPage(); }

  function text(value: string, x: number, baseline: number, size: number, color: Rgb, options: { url?: string; maxWidth?: number; align?: "right" } = {}) {
    doc.setFontSize(size);
    doc.setTextColor(...color);
    const lines = options.maxWidth ? (doc.splitTextToSize(value, options.maxWidth) as string[]) : [value];
    doc.text(lines, x, baseline, options.align ? { align: options.align } : undefined);
    const height = lines.length * size * 0.46;
    if (options.url) doc.link(x, baseline - size * 0.35, options.maxWidth ?? doc.getTextWidth(value), height + 1, { url: options.url });
    return height;
  }

  function paragraph(value: string, opts: { size?: number; color?: Rgb; gap?: number; indent?: number; url?: string } = {}) {
    const size = opts.size ?? 9;
    const indent = opts.indent ?? 0;
    doc.setFontSize(size);
    const rows = (doc.splitTextToSize(value, textWidth - indent) as string[]).length;
    const height = rows * size * 0.46;
    ensure(height + (opts.gap ?? 2));
    text(value, MARGIN + indent, y, size, opts.color ?? INK, { url: opts.url, maxWidth: textWidth - indent });
    y += height + (opts.gap ?? 2);
  }

  function card(height: number, accent: Rgb) {
    fill(WHITE); stroke(BORDER); doc.setLineWidth(0.25);
    doc.roundedRect(MARGIN, y, textWidth, height, 2.2, 2.2, "FD");
    fill(accent); doc.rect(MARGIN + 0.6, y + 2, 1.2, height - 4, "F");
  }

  function cover() {
    fill(INK); doc.rect(0, 0, pageWidth, 62, "F");
    fill(ROSE); doc.rect(0, 62, pageWidth, 1.6, "F");
    [ROSE, PEACH, YELLOW].forEach((color, i) => { fill(color); doc.circle(MARGIN + 2 + i * 7, 17, 2.4, "F"); });
    text("MALTA · 13–16 NOVIEMBRE 2026", MARGIN, 32, 9, YELLOW);
    text("Itinerario para dos adultos", MARGIN, 45, 24, WHITE);
    text("B Suites · 136 Triq Tigne', Tas-Sliema, Malta", MARGIN, 54, 9, mix(WHITE, INK, 0.8), { url: airbnbUrl });
    y = 76;

    const stats: [string, string][] = [
      ["PRESUPUESTO", `${data.totalMin}–${data.totalMax} € / persona`],
      ["ACTIVIDADES Y TRASLADOS", formatDuration(data.totalMinutes)],
      ["DÍAS", "Sáb · Dom · Lun"],
    ];
    const width = (textWidth - 8) / 3;
    stats.forEach(([label, value], i) => {
      const x = MARGIN + i * (width + 4);
      fill(WHITE); stroke(BORDER); doc.roundedRect(x, y, width, 20, 2.2, 2.2, "FD");
      text(label, x + 4, y + 7, 6.5, MUTED);
      text(value, x + 4, y + 15, 10.5, INK);
    });
    y += 27;
    paragraph("Estimación sin alojamiento, vuelos, desayuno ni alcohol. Los importes de restaurantes y taxis son orientativos.", { size: 8, color: MUTED, gap: 6 });
    paragraph("Abrir reserva de Airbnb", { size: 8.5, color: ROSE_TEXT, url: airbnbUrl, gap: 4 });
  }

  function dayHeader(day: DayId, plan: PlannedDay) {
    const color = hex(dayMeta[day].color);
    ensure(30);
    fill(color); doc.roundedRect(MARGIN, y, textWidth, 1.6, 0.8, 0.8, "F");
    y += 8;
    fill(color); doc.circle(MARGIN + 1.6, y - 1.2, 1.3, "F");
    text(`${dayMeta[day].weekday} · ${dayMeta[day].date}`.toUpperCase(), MARGIN + 5, y, 8, MUTED);
    y += 8;
    y += text(data.titles[day], MARGIN, y, 17, INK, { maxWidth: textWidth }) + 2.5;
    paragraph(`${plan.start}–${plan.end} · ${plan.span} · ${formatDuration(plan.activeMinutes + plan.extraTravelMinutes)} de actividades y traslados · ${plan.min}–${plan.max} € / persona`, { size: 8.3, color: MUTED, gap: 5 });
    return color;
  }

  function stopCard(stop: PlannedDay["stops"][number], color: Rgb) {
    const inner = textWidth - 33;
    const descRows = (doc.setFontSize(8), doc.splitTextToSize(stop.description, inner) as string[]).length;
    const extras: { label: string; url: string; size: number }[] = [];
    for (const id of stop.bookingIds ?? []) {
      const booking = bookings[id];
      extras.push({ label: `Entrada o transporte: ${booking.title.replaceAll("⇄", "-").replaceAll("→", "-")}${booking.price ? ` · ${booking.price}` : ""}`, url: booking.url, size: 7.8 });
    }
    if (stop.infoUrl) extras.push({ label: "Información y ubicación de la opción elegida", url: stop.infoUrl, size: 7.8 });
    if (stop.restaurantArea) {
      for (const r of restaurantAreas[stop.restaurantArea].options.slice(0, 5)) {
        extras.push({ label: `${r.name} · ${r.cuisine} · ${r.averagePrice}/persona${r.googleRating != null ? ` · Google ${r.googleRating.toFixed(1).replace(".", ",")}/5` : ""} · ${r.location}`, url: r.url, size: 7.4 });
      }
    }
    const extraRows = extras.map((e) => (doc.setFontSize(e.size), (doc.splitTextToSize(e.label, inner) as string[]).length));
    const titleRows = (doc.setFontSize(10), doc.splitTextToSize(stop.title, inner) as string[]).length;
    const height = 6 + titleRows * 4.6 + descRows * 3.7 + extraRows.reduce((sum, rows, i) => sum + rows * extras[i].size * 0.46 + 1.2, 0) + 2.5;
    ensure(height + 3);
    card(height, color);
    fill(ACCENT); doc.roundedRect(MARGIN + 5, y + 3.6, 17, 5.4, 2.7, 2.7, "F");
    doc.setFontSize(7.6); doc.setTextColor(...INK);
    doc.text(stop.time, MARGIN + 13.5, y + 7.3, { align: "center" });
    let cursor = y + 7.6;
    cursor += text(stop.title, MARGIN + 27, cursor, 10, INK, { maxWidth: inner }) + 1.2;
    cursor += text(stop.description, MARGIN + 27, cursor + 0.4, 8, MUTED, { maxWidth: inner }) + 1;
    extras.forEach((extra) => { cursor += text(extra.label, MARGIN + 27, cursor + 0.8, extra.size, ROSE_TEXT, { url: extra.url, maxWidth: inner }) + 1.2; });
    y += height + 3;
  }

  paintPage();
  cover();
  for (const day of ["sat", "sun", "mon"] as DayId[]) {
    if (day !== "sat") newPage();
    const plan = data.plans[day];
    const color = dayHeader(day, plan);
    plan.stops.forEach((stop) => stopCard(stop, color));
    if (plan.warnings.length) {
      ensure(14);
      paragraph("Horario por revisar", { size: 10, color: ROSE_TEXT, gap: 2 });
      plan.warnings.forEach((warning) => paragraph(warning, { size: 8.2, color: ROSE_TEXT }));
    }
  }

  newPage();
  fill(INK); doc.roundedRect(MARGIN, y, textWidth, 1.6, 0.8, 0.8, "F"); y += 9;
  paragraph("Reservas y notas prácticas", { size: 17, gap: 5 });
  const notes = [
    "El lunes lleváis las maletas o mochilas desde B Suites. A las 17:00 salís directamente de la última zona visitada hacia el aeropuerto; no regresáis a Sliema.",
    "Los trazados del mapa son esquemáticos. Confirmad horarios de ferris, apertura de atracciones, disponibilidad de restaurantes y precio de taxis antes del viaje.",
  ];
  notes.forEach((note) => { doc.setFontSize(8.8); const height = (doc.splitTextToSize(note, textWidth - 10) as string[]).length * 4.1 + 6; ensure(height + 3); fill(SOFT); stroke(BORDER); doc.roundedRect(MARGIN, y, textWidth, height, 2.2, 2.2, "FD"); text(note, MARGIN + 5, y + 6.2, 8.8, INK, { maxWidth: textWidth - 10 }); y += height + 3; });
  y += 2;
  [
    ["Heritage Malta · horarios oficiales", "https://heritagemalta.mt/opening-hours/"],
    ["Valletta Ferry Services · horarios", "https://www.vallettaferryservices.com/schedule/"],
    ["Gozo Highspeed · horarios", "https://gozohighspeed.com/pages/schedule"],
  ].forEach(([label, url]) => paragraph(label, { size: 8.6, color: ROSE_TEXT, url, gap: 3 }));

  for (let index = 1; index <= page; index++) {
    doc.setPage(index);
    if (index > 1) { fill(ROSE); doc.rect(0, 0, pageWidth, 2.2, "F"); }
    stroke(BORDER); doc.line(MARGIN, pageHeight - 13, right, pageHeight - 13);
    text("MALTA · NOVIEMBRE 2026", MARGIN, pageHeight - 8.5, 7, MUTED);
    text(`${index}/${page}`, right, pageHeight - 8.5, 7, MUTED, { align: "right" });
  }
  return URL.createObjectURL(doc.output("blob"));
}

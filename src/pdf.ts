import type { DayId } from "./data";
import { dayMeta } from "./data";
import { airbnbUrl, bookings, restaurantAreas } from "./guide";
import { formatDuration, type PlannedDay } from "./planner";

type PdfData = { plans: Record<DayId, PlannedDay>; titles: Record<DayId, string>; totalMin: number; totalMax: number; totalMinutes: number };

function toBase64(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let offset = 0; offset < bytes.length; offset += 8192) binary += String.fromCharCode(...bytes.subarray(offset, offset + 8192));
  return btoa(binary);
}

export async function prepareCurrentPdf(data: PdfData) {
  const [{ jsPDF }, fontResponse] = await Promise.all([import("jspdf"), fetch(`${import.meta.env.BASE_URL}fonts/RobotoSlab.ttf`)]);
  if (!fontResponse.ok) throw new Error("No se pudo cargar la fuente del PDF");
  const doc = new jsPDF({ unit: "mm", format: "a4", compress: true });
  doc.addFileToVFS("RobotoSlab.ttf", toBase64(await fontResponse.arrayBuffer()));
  doc.addFont("RobotoSlab.ttf", "RobotoSlab", "normal");
  doc.setFont("RobotoSlab", "normal");
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const left = 17;
  const right = pageWidth - 17;
  const textWidth = right - left;
  let y = 20;
  let page = 1;
  const ink: [number, number, number] = [50, 31, 39];
  const rose: [number, number, number] = [174, 46, 75];
  const muted: [number, number, number] = [105, 94, 98];
  function newPage() { doc.addPage(); page++; y = 20; }
  function ensure(height: number) { if (y + height > pageHeight - 18) newPage(); }
  function line(text: string, opts: { size?: number; color?: [number, number, number]; gap?: number; indent?: number; url?: string } = {}) {
    const size = opts.size ?? 9;
    const indent = opts.indent ?? 0;
    doc.setFontSize(size);
    doc.setTextColor(...(opts.color ?? ink));
    const lines = doc.splitTextToSize(text, textWidth - indent) as string[];
    const height = Math.max(1, lines.length) * size * 0.46;
    ensure(height + (opts.gap ?? 2));
    const top = y;
    doc.text(lines, left + indent, y);
    if (opts.url) doc.link(left + indent, top - size * 0.35, textWidth - indent, height + 2, { url: opts.url });
    y += height + (opts.gap ?? 2);
  }
  function heading(text: string) { ensure(17); y += 4; line(text, { size: 15, color: rose, gap: 4 }); }
  function subheading(text: string) { ensure(11); line(text, { size: 10.5, color: rose, gap: 2 }); }

  line("MALTA · 13–16 NOVIEMBRE 2026", { size: 21, color: rose, gap: 6 });
  line("Itinerario actualizado para dos adultos", { size: 11, color: ink, gap: 6 });
  line("B Suites · 136 Triq Tigne', Tas-Sliema, Malta", { size: 10, gap: 2 });
  line("Abrir reserva de Airbnb", { size: 9, color: rose, url: airbnbUrl, gap: 5 });
  line(`Presupuesto: ${data.totalMin}–${data.totalMax} € por persona · Actividades y traslados: ${formatDuration(data.totalMinutes)}.`, { size: 10, gap: 5 });
  line("Estimación sin alojamiento, vuelos, desayuno ni alcohol. Los importes de restaurantes y taxis son orientativos.", { size: 8.5, color: muted, gap: 7 });

  for (const day of ["sat", "sun", "mon"] as DayId[]) {
    if (day !== "sat") newPage();
    const plan = data.plans[day];
    heading(`${dayMeta[day].weekday} ${dayMeta[day].date} · ${data.titles[day]}`);
    line(`${plan.start}–${plan.end} · ${plan.span} de itinerario · ${formatDuration(plan.activeMinutes + plan.extraTravelMinutes)} de actividades y traslados · ${plan.min}–${plan.max} € / persona`, { size: 9, color: muted, gap: 4 });
    for (const stop of plan.stops) {
      ensure(12);
      line(`${stop.time} · ${stop.title}`, { size: 9.5, color: ink, gap: 1 });
      line(stop.description, { size: 8.2, color: muted, gap: 2, indent: 4 });
      for (const id of stop.bookingIds ?? []) {
        const booking = bookings[id];
        line(`Entrada o transporte: ${booking.title.replaceAll("⇄", "-").replaceAll("→", "-")}${booking.price ? ` · ${booking.price}` : ""}`, { size: 8, color: rose, gap: 2, indent: 4, url: booking.url });
      }
      if (stop.infoUrl) line("Información y ubicación de la opción elegida", { size: 8, color: rose, gap: 2, indent: 4, url: stop.infoUrl });
      if (stop.restaurantArea) {
        const area = restaurantAreas[stop.restaurantArea];
        for (const restaurant of area.options.slice(0, 5)) {
          line(`${restaurant.name} · ${restaurant.cuisine} · ${restaurant.averagePrice}/persona${restaurant.googleRating != null ? ` · Google ${restaurant.googleRating.toFixed(1).replace(".", ",")}/5` : ""} · ${restaurant.location}`, { size: 7.8, color: rose, gap: 1, indent: 4, url: restaurant.url });
        }
        y += 1;
      }
    }
    if (plan.warnings.length) { subheading("Horario por revisar"); for (const warning of plan.warnings) line(warning, { size: 8.2, color: rose }); }
  }
  heading("Reservas y notas prácticas");
  line("El lunes lleváis las maletas o mochilas desde B Suites. A las 17:00 salís directamente de la última zona visitada hacia el aeropuerto; no regresáis a Sliema.", { size: 9, gap: 5 });
  line("Los trazados del mapa son esquemáticos. Confirmad horarios de ferris, apertura de atracciones, disponibilidad de restaurantes y precio de taxis antes del viaje.", { size: 8.5, color: muted, gap: 5 });
  line("Heritage Malta · horarios oficiales", { size: 8.5, color: rose, url: "https://heritagemalta.mt/opening-hours/" });
  line("Valletta Ferry Services · horarios", { size: 8.5, color: rose, url: "https://www.vallettaferryservices.com/schedule/" });
  line("Gozo Highspeed · horarios", { size: 8.5, color: rose, url: "https://gozohighspeed.com/pages/schedule" });
  for (let index = 1; index <= page; index++) {
    doc.setPage(index); doc.setDrawColor(220, 211, 208); doc.line(left, pageHeight - 13, right, pageHeight - 13);
    doc.setFontSize(7); doc.setTextColor(...muted); doc.text(`Malta · noviembre 2026  ·  ${index}/${page}`, right, pageHeight - 9, { align: "right" });
  }
  const blob = doc.output("blob");
  return URL.createObjectURL(blob);
}

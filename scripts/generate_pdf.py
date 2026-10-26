"""Generate the downloadable, comprehensive Malta itinerary from the site data."""

from __future__ import annotations

import html
import json
import re
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.utils import simpleSplit
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    HRFlowable,
    KeepTogether,
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "public" / "itinerario-malta-2026.pdf"
DATA = (ROOT / "src" / "data.ts").read_text()
GUIDE = (ROOT / "src" / "guide.ts").read_text()

BURGUNDY = colors.HexColor("#5c1b35")
PINK = colors.HexColor("#d43f5d")
PEACH = colors.HexColor("#f2a772")
YELLOW = colors.HexColor("#e8d890")
PALE = colors.HexColor("#e2edb7")
LIGHT = colors.HexColor("#fbf9f7")
GREY = colors.HexColor("#65565d")

FONT_DIR = Path("/System/Library/Fonts/Supplemental")
pdfmetrics.registerFont(TTFont("Arial", str(FONT_DIR / "Arial.ttf")))
pdfmetrics.registerFont(TTFont("Arial-Bold", str(FONT_DIR / "Arial Bold.ttf")))
pdfmetrics.registerFont(TTFont("Georgia", str(FONT_DIR / "Georgia.ttf")))
pdfmetrics.registerFont(TTFont("Georgia-Bold", str(FONT_DIR / "Georgia Bold.ttf")))
pdfmetrics.registerFontFamily("Arial", normal="Arial", bold="Arial-Bold")
pdfmetrics.registerFontFamily("Georgia", normal="Georgia", bold="Georgia-Bold")

styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name="CoverTitle", fontName="Georgia-Bold", fontSize=29, leading=34, textColor=BURGUNDY, spaceAfter=11))
styles.add(ParagraphStyle(name="Deck", fontName="Arial", fontSize=11, leading=16, textColor=GREY, spaceAfter=12))
styles.add(ParagraphStyle(name="SectionTitle", fontName="Georgia-Bold", fontSize=18, leading=23, textColor=BURGUNDY, spaceBefore=5, spaceAfter=10))
styles.add(ParagraphStyle(name="SubTitle", fontName="Georgia-Bold", fontSize=12.5, leading=17, textColor=BURGUNDY, spaceBefore=13, spaceAfter=6))
styles.add(ParagraphStyle(name="BodyTextCustom", fontName="Arial", fontSize=9.5, leading=14, textColor=BURGUNDY, spaceAfter=6))
styles.add(ParagraphStyle(name="SmallText", fontName="Arial", fontSize=8.3, leading=12.3, textColor=GREY, spaceAfter=5))
styles.add(ParagraphStyle(name="TimeText", fontName="Arial-Bold", fontSize=8.5, leading=12, textColor=PINK))
styles.add(ParagraphStyle(name="CardText", fontName="Arial", fontSize=9, leading=13, textColor=BURGUNDY))
styles.add(ParagraphStyle(name="WhiteText", fontName="Arial-Bold", fontSize=10, leading=14, textColor=colors.white))
styles.add(ParagraphStyle(name="CenterSmall", fontName="Arial", fontSize=8, leading=11, textColor=GREY, alignment=TA_CENTER))


def parse_fields(line: str) -> dict[str, object]:
    pairs = re.findall(r'(\w+):\s*("(?:[^"\\]|\\.)*"|\d+(?:\.\d+)?)', line)
    return {key: json.loads(value) for key, value in pairs}


def stop_list(name: str) -> list[dict[str, object]]:
    match = re.search(rf"export const {name}: Stop\[\] = \[(.*?)\n\];", DATA, re.S)
    if not match:
        raise ValueError(f"Stop list missing: {name}")
    return [parse_fields(line) for line in match.group(1).splitlines() if '{ id: "' in line]


def all_restaurants() -> list[tuple[str, list[dict[str, object]]]]:
    groups: list[tuple[str, list[dict[str, object]]]] = []
    current: list[dict[str, object]] | None = None
    for line in GUIDE.splitlines():
        section = re.search(r'^\s*\w+: \{ title: "([^"]+)", meal: "([^"]+)"', line)
        if section:
            current = []
            groups.append((f"{section.group(2)} · {section.group(1)}", current))
        elif current is not None and '{ name: "' in line:
            current.append(parse_fields(line))
    return groups


def bookings() -> list[dict[str, object]]:
    return [parse_fields(line) for line in GUIDE.splitlines() if re.match(r'^\s*\w+: \{ id: "', line)]


def esc(value: object) -> str:
    return html.escape(str(value), quote=True)


def link(url: object, label: str) -> str:
    return f'<link href="{esc(url)}" color="#b93453"><u>{esc(label)}</u></link>'


def para(text: str, style: str = "BodyTextCustom") -> Paragraph:
    return Paragraph(text, styles[style])


def day_header(title: str, date: str, timing: str, cost: str, note: str) -> list:
    return [
        para(esc(date).upper(), "SmallText"),
        para(esc(title), "SectionTitle"),
        Table([[para(f"<b>Horario</b><br/>{esc(timing)}", "CardText"), para(f"<b>Precio estimado</b><br/>{esc(cost)}", "CardText")]],
              colWidths=[245, 245], style=TableStyle([
                  ("BACKGROUND", (0, 0), (-1, -1), LIGHT),
                  ("BOX", (0, 0), (-1, -1), .6, YELLOW),
                  ("VALIGN", (0, 0), (-1, -1), "TOP"),
                  ("LEFTPADDING", (0, 0), (-1, -1), 12),
                  ("RIGHTPADDING", (0, 0), (-1, -1), 12),
                  ("TOPPADDING", (0, 0), (-1, -1), 10),
                  ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
              ])),
        Spacer(1, 10),
        para(esc(note), "SmallText"),
    ]


def stop_table(stops: list[dict[str, object]]) -> Table:
    rows = []
    for stop in stops:
        title = esc(stop["title"])
        desc = esc(stop["description"])
        rows.append([para(esc(stop["time"]), "TimeText"), para(f"<b>{title}</b><br/>{desc}", "CardText")])
    table = Table(rows, colWidths=[88, 402], repeatRows=0, hAlign="LEFT")
    table.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("ROWBACKGROUNDS", (0, 0), (-1, -1), [colors.white, LIGHT]),
        ("LINEBELOW", (0, 0), (-1, -1), .35, colors.HexColor("#e4d9dd")),
        ("LEFTPADDING", (0, 0), (-1, -1), 9),
        ("RIGHTPADDING", (0, 0), (-1, -1), 9),
        ("TOPPADDING", (0, 0), (-1, -1), 7),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
    ]))
    return table


def add_restaurants(story: list, heading: str, restaurants: list[dict[str, object]]) -> None:
    story.append(para(esc(heading), "SubTitle"))
    for place in restaurants:
        rating = str(place["googleRating"]).replace(".", ",")
        details = (
            f"<b>{esc(place['name'])}</b> · Google {rating}/5 "
            f"({int(place['googleReviews']):,} reseñas)<br/>"
            f"{esc(place['cuisine'])} · {esc(place['averagePrice'])} por persona · {esc(place['location'])}<br/>"
            f"{link(place['url'], 'Carta / reserva')} &nbsp;&nbsp; {link(place['googleUrl'], 'Reseñas en Google')}"
        )
        story.append(KeepTogether([para(details, "CardText"), Spacer(1, 7)]))


def add_page_footer(canvas, doc) -> None:
    canvas.saveState()
    width, _ = A4
    canvas.setStrokeColor(YELLOW)
    canvas.setLineWidth(.7)
    canvas.line(48, 42, width - 48, 42)
    canvas.setFont("Arial", 8)
    canvas.setFillColor(GREY)
    canvas.drawString(48, 29, "MALTA · 13–16 NOVIEMBRE 2026")
    canvas.drawRightString(width - 48, 29, f"{doc.page}")
    canvas.restoreState()


def main() -> None:
    saturday = stop_list("saturday")
    special = stop_list("saturdayWithMuseum")
    saturday_museum = saturday[:2] + special + saturday[3:]
    sunday = stop_list("sunday")
    popeye = stop_list("mondayPopeye")
    mdina = stop_list("mondayMdina")
    restaurants = dict(all_restaurants())
    booking_items = bookings()

    doc = SimpleDocTemplate(str(OUTPUT), pagesize=A4, leftMargin=52, rightMargin=52,
                            topMargin=57, bottomMargin=58, title="Malta en tres días · 13–16 noviembre 2026",
                            author="Itinerario Malta")
    story: list = []

    story += [Spacer(1, 32), para("MALTA EN TRES DÍAS", "SmallText"),
              para("Tres días entre dos islas.", "CoverTitle"),
              para("La Valeta, Gozo y una última jornada entre Mdina o Popeye Village. Del viernes 13 al lunes 16 de noviembre de 2026, con base en B Suites, 136 Triq Tigne', Tas-Sliema, Malta.", "Deck"),
              HRFlowable(width="100%", thickness=2, color=PINK), Spacer(1, 20),
              para("Resumen de tiempo y presupuesto", "SectionTitle")]

    summary_rows = [[para("Día", "WhiteText"), para("Tiempo", "WhiteText"), para("Precio / persona", "WhiteText")],
                    [para("Sábado · La Valeta y Birgu", "CardText"), para("09:00–20:30 · 11 h 30 min", "CardText"), para("57–97 €", "CardText")],
                    [para("Domingo · Gozo", "CardText"), para("06:45–22:30 · 15 h 45 min", "CardText"), para("80–105 €", "CardText")],
                    [para("Lunes · Mdina y Rabat", "CardText"), para("09:00–17:00 · 8 h", "CardText"), para("25–45 €", "CardText")],
                    [para("Lunes · Popeye (alternativa)", "CardText"), para("08:00–17:00 · 9 h", "CardText"), para("70–100 €", "CardText")]]
    table = Table(summary_rows, colWidths=[191, 161, 138], hAlign="LEFT")
    table.setStyle(TableStyle([("BACKGROUND", (0, 0), (-1, 0), BURGUNDY), ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, LIGHT]),
                               ("BOX", (0, 0), (-1, -1), .6, YELLOW), ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                               ("LEFTPADDING", (0, 0), (-1, -1), 10), ("RIGHTPADDING", (0, 0), (-1, -1), 9),
                               ("TOPPADDING", (0, 0), (-1, -1), 10), ("BOTTOMPADDING", (0, 0), (-1, -1), 10)]))
    story += [table, Spacer(1, 12),
              para("Total con Mdina: <b>162–247 € por persona</b> y 35 h 15 min de itinerario. Con Popeye: <b>207–302 €</b> y 36 h 15 min. Añadid 5 € si visitáis el Museo Arqueológico Nacional.", "BodyTextCustom"),
              para("Los importes son estimaciones para dos adultos que comparten taxis. Incluyen las comidas recomendadas, transporte y entradas del plan; excluyen alojamiento, vuelos, desayuno y bebidas alcohólicas. Confirmad horarios, tarifas y precios de taxi antes de reservar.", "SmallText"),
              Spacer(1, 14), para("Lo esencial", "SectionTitle"),
              para("<b>Viernes 13:</b> llegada por la noche y alojamiento. <b>Comidas:</b> de 13:00 a 15:00. <b>Cenas:</b> de 19:00 a 21:00. <b>Lunes 16:</b> salid con el equipaje desde el apartamento y tomad un taxi al aeropuerto directamente desde la última visita a las 17:00.", "BodyTextCustom"),
              para(f"<b>Airbnb:</b> B Suites, 136 Triq Tigne', Tas-Sliema, Malta · {link('https://www.airbnb.es/trips/v1/1796630891099537374', 'Abrir vuestra reserva')}. El marcador del mapa es aproximado; confirmad el acceso y el check-in en Airbnb.", "BodyTextCustom"),
              PageBreak()]

    story += day_header("La Valeta y Birgu", "Sábado 14 de noviembre", "09:00–20:30 · 11 h 30 min", "57–97 € / persona", "Ferris ≈ 10 €, Concatedral 15 €, comida y cena ≈ 32–72 €. Incluye el Palacio del Gran Maestre y Lower Barrakka. El Museo Arqueológico opcional añade 5 €.")
    story.append(stop_table(saturday))
    story += [para("Opción: Museo Arqueológico Nacional", "SubTitle"),
              para("Sustituye el Palacio y el paseo de 11:15–13:00 por el Museo de 11:20–12:20 y Palacio con Upper Barrakka de 12:20–13:00. Entrada estimada: 5 €. La comida permanece a las 13:00.", "BodyTextCustom"),
              para("El ferry a Cospicua y el regreso cruzan el Grand Harbour por mar. Confirmad las salidas de invierno; las rutas del mapa son esquemáticas.", "SmallText"), PageBreak()]

    story += day_header("Gozo y Victoria", "Domingo 15 de noviembre", "06:45–22:30 · 15 h 45 min", "80–105 € / persona", "Ferry rápido ida y vuelta 17 €, Ġgantija 10 €, autobuses ≈ 6–8 €, taxi compartido ≈ 13–18 € por persona, comidas ≈ 33–49 €.")
    story.append(stop_table(sunday))
    story += [para("El ferry rápido sale de Sliema a las 06:45 con escala en Buġibba. Para la vuelta se ha previsto Mġarr a las 21:15 y llegada a Sliema a las 22:30. Reservad la ida y la vuelta y comprobad posibles cambios por meteorología.", "SmallText"), PageBreak()]

    story += day_header("Mdina o Popeye Village", "Lunes 16 de noviembre", "Mdina 09:00–17:00 · Popeye 08:00–17:00", "Mdina 25–45 € · Popeye 70–100 €", "Llevad las maletas o mochilas desde el inicio. El plan termina con salida directa al aeropuerto a las 17:00; no se regresa a Sliema.")
    story += [para("Opción A (recomendada) · Mdina y Rabat", "SubTitle"), stop_table(mdina),
              para("Mdina tiene calles empedradas: con maletas, priorizad un paseo corto o una pausa en Rabat. Salid en taxi hacia el aeropuerto a las 17:00.", "SmallText"),
              para("Opción B (alternativa) · Popeye Village y Mellieħa", "SubTitle"), stop_table(popeye),
              para("Si lleváis maletas grandes, confirmad con Popeye Village si podéis guardarlas durante la visita. Los taxis estimados se comparten entre dos adultos.", "SmallText")]

    story += [para("Dónde comer", "SectionTitle"), para("Cocina, precio medio orientativo por persona, ubicación y reseñas de Google. Las cifras se consultaron el 26 de octubre de 2026 y pueden cambiar.", "SmallText")]
    for heading, options in restaurants.items():
        add_restaurants(story, heading, options)
    story += [para("Billetes, entradas y enlaces", "SectionTitle"),
              para("Usad los enlaces para revisar horarios y hacer las reservas. Las compras y condiciones finales se confirman en cada proveedor.", "SmallText")]
    for booking in booking_items:
        if booking["id"] == "airbnb":
            continue
        price = f" · {esc(booking['price'])}" if "price" in booking else ""
        row = f"<b>{esc(booking['title'])}</b>{price}<br/>{esc(booking['context'])}. {esc(booking['note'])}<br/>{link(booking['url'], str(booking['action']))}"
        story.append(KeepTogether([para(row, "CardText"), Spacer(1, 10)]))
    story += [Spacer(1, 6), para("Comprobaciones antes de salir", "SubTitle"),
              para("Revisad los ferris de invierno, posibles cancelaciones por viento, la apertura de atracciones y restaurantes en noviembre, el acceso con equipaje a Popeye Village y la hora límite de facturación de vuestro vuelo.", "BodyTextCustom"),
              para("Fuentes principales: Valletta Ferry Services, Gozo Highspeed, Heritage Malta, Concatedral de San Juan, Malta Public Transport, Popeye Village y las páginas de cada restaurante. El precio de taxi es orientativo y se confirma en la app del proveedor.", "SmallText")]

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    doc.build(story, onFirstPage=add_page_footer, onLaterPages=add_page_footer)
    print(OUTPUT)


if __name__ == "__main__":
    main()

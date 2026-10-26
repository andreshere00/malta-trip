# Malta · itinerario interactivo

## Propósito

Web de planificación para un viaje de tres días a Malta (13–16 de noviembre de 2026) con base en B Suites, 136 Triq Tigne', Tas-Sliema. Reúne en un solo sitio el mapa, los horarios, las reservas, los restaurantes y el presupuesto por persona, y permite adaptar el plan sin perder la coherencia de tiempos.

Reglas del plan:

- Visitas de 09:00 a 14:00 y de 16:00 a 20:00; comidas de 13:00 a 15:00 y cenas de 19:00 a 21:00.
- El lunes se sale con equipaje desde la última visita directamente al aeropuerto a las 17:00.

### Itinerario por defecto

| Día | Plan | Notas |
|---|---|---|
| Sábado 14 | La Valeta y Birgu | Ferry desde Sliema, Concatedral, Palacio del Gran Maestre, Upper y Lower Barrakka, comida en La Valeta y tarde en Birgu. El Museo Arqueológico es opcional. |
| Domingo 15 | Gozo y Victoria | Alternativas de jornada completa: Comino, o Mdina, Ħaġar Qim y Marsaxlokk sin ferry. |
| Lunes 16 | Mdina y Rabat | Elegido por defecto por cercanía al aeropuerto. Popeye Village y Mellieħa quedan como alternativa. |

## Funcionalidades

- **Mapa** con MapLibre y [mapcn](https://www.mapcn.dev/): rutas por día, filtro de mañana/tarde y tema claro/oscuro.
- **Paradas** con modal de detalle, entradas oficiales y restaurantes cercanos. Los ferris y el aeropuerto muestran animaciones.
- **Centro de reservas**: marca billetes y entradas ya gestionados.
- **Editar plan**: cambia visitas, paseos y restaurantes con alternativas compatibles con cada tramo, y personaliza el título de cada día. El catálogo añade 44 visitas y 40 restaurantes en 14 zonas.
- **Validación**: si una opción solapa una conexión fija (ferris, comidas, salida al aeropuerto), avisa y no deja guardar.
- **Presupuesto y duración** recalculados en cada cambio.
- **PDF**: el original (`public/itinerario-malta-2026.pdf`) y uno personalizado generado en el navegador.

## Arquitectura

Aplicación de una sola página (React 19 + TypeScript + Vite + Tailwind 4) sin backend. El estado persiste en `localStorage` (`malta-theme`, `malta-managed-bookings`, `malta-planner-v1`).

```text
src/
├── data.ts              Fuente de verdad: lugares, paradas por día, rutas y fuentes
├── catalog.ts           Catálogo de visitas adicionales con coordenadas y área
├── restaurants-extra.ts Restaurantes adicionales por zona
├── guide.ts             Reservas, enlaces oficiales y restaurantes base
├── planner.ts           Motor de edición: alternativas, horarios, desvíos y validación
├── budget.ts            Presupuesto y duración por día y total
├── pdf.ts               PDF personalizado (jsPDF)
├── main.tsx             Interfaz, estado y mapa
├── components/ui/map.tsx  Componente de mapa (mapcn)
└── index.css, theme.css   Estilos y paletas clara/oscura
scripts/generate_pdf.py  PDF original (reportlab), leyendo `src/data.ts`
```

Flujo de datos:

1. `data.ts` define las paradas base (`saturday`, `saturdayWithMuseum`, `sunday`, `sundayMalta`, `sundayComino`, `mondayMdina`, `mondayPopeye`).
2. `planner.ts` elige las paradas según el plan activo (`baseStops`) y aplica las ediciones guardadas (`planDay`), recalculando horarios y costes.
3. `budget.ts` calcula el presupuesto y la duración de cada día.
4. `main.tsx` pinta el resultado en el mapa, en la lista de paradas y en los modales.
5. `pdf.ts` serializa el plan actual a PDF.

`scripts/generate_pdf.py` lee `data.ts` con expresiones regulares, así que cada parada debe seguir en una sola línea con `{ id: "…" }`.

### Despliegue

Los workflows de `.github/workflows` ejecutan la comprobación y el build en CI, y publican en GitHub Pages al hacer push a `main`.

## Desarrollo

```bash
npm install
npm run dev      # servidor local de Vite
npm run build    # tsc -b + vite build
```

Regenerar el PDF original (requiere Python y `reportlab`):

```bash
python3 -m venv .venv && .venv/bin/pip install reportlab
.venv/bin/python scripts/generate_pdf.py
```

## Avisos

Los trazados son esquemáticos y no sirven como navegación calle a calle ni marítima. La ubicación del apartamento es aproximada. Los precios son estimaciones por persona para dos adultos que comparten taxi. Confirmad ferris, autobuses, aperturas y la hora exacta del vuelo antes de viajar.

## Fuentes de horarios

- [Concatedral de San Juan](https://www.stjohnscocathedral.com/visit/)
- [Valletta Ferry Services](https://www.vallettaferryservices.com/schedule/)
- [Gozo Highspeed](https://gozohighspeed.com/pages/schedule)
- [Comino Ferries](https://cominoferries.com/schedule/)
- [Ħaġar Qim y Mnajdra](https://heritagemalta.mt/explore/hagar-qim-and-mnajdra-archaeological-park/)
- [Malta Public Transport](https://www.publictransport.com.mt/routes-timetables/)
- [Popeye Village, temporada baja 2026–2027](https://www.popeyemalta.com/packages/mid-season-2026/07-6-nov-30-april)
- [Heritage Malta](https://heritagemalta.mt/opening-hours/)
- [Catacumbas de San Pablo](https://heritagemalta.mt/explore/st-pauls-catacombs/)
- [Visit Gozo](https://visitgozo.com/discover-gozo-island/)

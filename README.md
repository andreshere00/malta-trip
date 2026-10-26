# Malta · itinerario interactivo

Mapa en React + TypeScript con el componente [mapcn](https://www.mapcn.dev/) del ecosistema shadcn/ui y MapLibre. Presenta el itinerario del 14 al 16 de noviembre de 2026 desde Sliema. Las visitas se organizan de 09:00 a 14:00 y de 16:00 a 20:00; el lunes se sale hacia el aeropuerto a las 17:00. Popeye Village es la opción predeterminada del lunes y se puede cambiar por Mdina y Rabat. El Museo Arqueológico Nacional es una opción del sábado.

Cada parada abre un modal con entradas oficiales o restaurantes cercanos. El centro de reservas permite marcar billetes y entradas ya gestionados; ese estado se guarda solo en el navegador. Los eventos de ferry y aeropuerto muestran animaciones. Al elegir una parada o la franja de tarde, la aplicación activa el tema oscuro; al elegir mañana, vuelve al claro. El tema usa las paletas proporcionadas para ambos modos.

«Editar plan» permite cambiar visitas, paseos y restaurantes mediante alternativas compatibles con cada tramo, además de personalizar el título de cada día. El catálogo añade 44 opciones de visitas públicas y 40 restaurantes por 14 zonas. Las opciones de idéntica duración aparecen primero y se pueden buscar o filtrar por zona. Para la excursión dominical hay tres rutas completas: Gozo, Comino y una alternativa sin ferry por Mdina, Ħaġar Qim y Marsaxlokk. Comino usa picnic llevado desde Malta porque no se presupone que sus puestos estén abiertos en noviembre. Los ferris y la salida al aeropuerto mantienen sus horarios fijos. El mapa muestra la ruta provisional mientras se edita y los tiempos, desvíos y presupuestos se recalculan. Si una opción solapa una conexión fija, aparece un aviso y se impide guardar hasta resolverlo. Los cambios guardados se conservan en el navegador.

El botón «Restaurantes» muestra las opciones de comida y cena de cada día según la ubicación y el tiempo disponible en cada parada, además de un explorador por zona. Los precios adicionales son estimaciones por persona; las nuevas fichas enlazan a Google Maps para comprobar valoración y apertura actuales sin inventar puntuaciones. «Preparar PDF personalizado» genera un PDF de la versión actual; después aparece el enlace de descarga. El PDF original sigue disponible por separado. El alojamiento es B Suites, 136 Triq Tigne', Tas-Sliema, Malta; el marcador del mapa es orientativo.

## Abrir en local

```bash
npm install
npm run dev
```

La aplicación mostrará una dirección local de Vite. Para generar la versión estática:

```bash
npm run build
```

Los trazados son esquemáticos; no sirven como navegación calle a calle ni marítima. Los tramos de ferry siguen puntos sobre el mar para rodear la costa. La ubicación del apartamento es aproximada. Confirmad ferris, autobuses y la hora exacta del vuelo antes de viajar.

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

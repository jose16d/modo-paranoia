# ADR-0002 — Las fechas legibles se pintan en UTC

- **Estado:** Aceptado
- **Fecha:** 2026-08-22
- **Afecta a:** `src/lib/articulos.ts`, `src/components/TarjetaArticulo.astro`,
  `src/pages/articulos/[...slug].astro`

## Contexto

Cada artículo declara su fecha en el front matter como un día suelto, sin hora ni zona:

```yaml
fecha: 2026-08-20
```

El esquema la convierte con `z.coerce.date()` (`src/content.config.ts`), y JavaScript
interpreta una fecha sin hora como **medianoche UTC**: `2026-08-20T00:00:00.000Z`. Hasta ahí,
correcto. El fallo estaba al pintarla: `toLocaleDateString` sin la opción `timeZone` convierte
ese instante **a la zona de la máquina que ejecuta el código**, y en cualquier huso al oeste de
Greenwich la medianoche UTC todavía es el día anterior. En Colombia (UTC−5) son las siete de la
tarde del 19.

Se descubrió en local, mirando tarjetas de prueba antes de publicar el primer artículo: una
pieza con `fecha: 2026-08-20` aparecía como «19 de ago de 2026». En el cambio de año el error
se lleva las tres cifras: `2026-01-01` se pintaba como «31 de diciembre de 2025».

Lo que convierte esto en una decisión de arquitectura y no en una corrección puntual es que
**el resultado dependía de dónde se compilara.** GitHub Actions (`ubuntu-latest`) y Cloudflare
Pages compilan en UTC, así que ahí la fecha salía bien; en un equipo en Colombia salía mal; en
uno en España, bien otra vez. Es la misma familia de error que el
[ADR-0001](0001-compresion-de-html-desactivada.md) —local y producción no coinciden, y mirar
solo uno de los dos no lo delata—, esta vez al revés: fallaba el local. Por eso no llegó a
ningún lector.

Había además un segundo punto de fallo. El formato corto de las tarjetas estaba escrito a mano
dentro de `TarjetaArticulo.astro`, con su propio `toLocaleDateString`. Arreglar solo la
cabecera del artículo habría dejado la portada con el día equivocado.

## Opciones consideradas

*Las opciones 1 y 2 son las que se evaluaron el 22 de agosto de 2026. La 3, la 4 y la 5 se
añaden al redactar este ADR, el 13 de septiembre de 2026, y se rebaten con el código de ese
momento: no consta que se discutieran entonces.*

1. **Formatear en `America/Bogota`.** La tentación obvia —el autor escribe desde Colombia— y
   la que reintroduce el fallo exacto. Fija la zona, pero en la equivocada: la medianoche UTC
   sigue cayendo en el día anterior, ahora **en todas las máquinas**. Pasa de ser un error que
   depende del entorno a uno consistente, que es peor, porque deja de parecer un error. La
   tabla de «Cómo se verificó» lo muestra.

2. **Formatear en UTC, con la zona en una sola constante.** Es la que se toma. UTC es la zona
   en la que el esquema ya interpretó la fecha, así que pintarla ahí devuelve exactamente el
   día que está escrito.

3. **Forzar `TZ=UTC` en el entorno.** Arreglaría el síntoma sin tocar el código, pero saca la
   decisión del código y la reparte por el entorno: tendría que cumplirse en `npm run dev`, en
   `npm run build`, en `npm run preview`, en CI y en Cloudflare, y cualquier forma nueva de
   ejecutar el proyecto la olvidaría. Además, un script de npm escrito como
   `TZ=UTC astro build` no funciona en Windows, que es donde se desarrolla este proyecto, sin
   añadir una dependencia como `cross-env`.

4. **Escribir hora y zona en el front matter** (`fecha: 2026-08-20T00:00:00-05:00`). Traslada
   el problema a quien escribe, que tendría que acertar la zona en cada pieza. Y rompe algo que
   hoy funciona: `src/lib/sitemap.ts` lee `fecha` del disco con una expresión que exige
   `YYYY-MM-DD` a secas, y con la hora detrás el build se detiene con error.

5. **No hacer nada.** Opción real, porque producción salía bien. Descartada por dos motivos.
   Ese «bien» dependía de que Cloudflare y GitHub sigan compilando en UTC, que es un detalle de
   su infraestructura y no un compromiso con este proyecto. Y `npm run preview` —la puerta que
   existe justamente para ver en local lo que verá el visitante— enseñaba una fecha falsa.

## Decisión

Todas las fechas legibles del sitio se formatean con `timeZone: 'UTC'`, desde una única
constante `ZONA` en `src/lib/articulos.ts`. Aplicado en el commit `0f56043` (PR #10).

`formatearFecha()` («20 de agosto de 2026», cabecera del artículo) y `formatearFechaCorta()`
(«20 de ago de 2026», tarjetas y navegación entre piezas) viven juntas en ese archivo, y el
formato que `TarjetaArticulo.astro` tenía escrito a mano pasa a usar la segunda. La constante
lleva un comentario que prohíbe cambiarla a `America/Bogota` y explica por qué.

## Consecuencias

**Lo que se gana.** La fecha pintada es la que dice el front matter, en cualquier máquina y en
cualquier zona. El resultado deja de depender del entorno, y la decisión vive en un solo sitio:
`toLocaleDateString` aparece únicamente en las dos funciones de `articulos.ts`.

**Lo que no hubo que tocar.** Las fechas que leen las máquinas ya eran correctas y se quedan
como estaban: el `datetime` de las etiquetas `<time>` y el JSON-LD usan `toISOString()`, y el
RSS usa `toUTCString()`. Las dos son UTC por definición.

**Lo que se paga.** Aquí no hay bytes: el costo es conceptual. «UTC» no es la zona desde la que
se publica, sino una convención para que un día suelto siga siendo ese día, y a quien lea el
código desde Colombia le va a parecer un descuido. Ese es el riesgo real de esta decisión: que
alguien la «corrija». Para eso están el comentario de la constante y este ADR.

**Qué hay que vigilar.** Dos condiciones, las dos comprobables:

1. **Que `fecha` pase a llevar hora de publicación.** Con un instante real, UTC deja de ser
   neutral —las ocho de la noche en Bogotá ya son el día siguiente en UTC— y habría que decidir
   en qué zona se lee. Si el esquema cambia así, esto se reabre.
2. **Que aparezca un formateo de fecha fuera de `articulos.ts`.** Un `toLocaleDateString`
   nuevo en otro componente reintroduce el fallo sin que nada avise. Se comprueba con:

   ```bash
   git grep -n "toLocaleDateString" -- src
   ```

   El resultado correcto son dos líneas, las dos de `src/lib/articulos.ts`.

## Cómo se verificó

**En su momento, el 22 de agosto de 2026, en local.** El fallo se midió en el equipo donde
aparecía, no se dedujo: `fecha: 2026-08-20` se pintaba «19 de ago» y `2026-01-01`, «31 de
diciembre de 2025». Con `ZONA = 'UTC'` las dos salieron con el día escrito.

**Reproducido el 13 de septiembre de 2026** con Node 24.19.0, simulando tres máquinas en tres
zonas para la misma `fecha: 2026-01-01`:

| Zona de la máquina | Sin `timeZone` | `timeZone: 'UTC'` | `timeZone: 'America/Bogota'` |
|---|---|---|---|
| `America/Bogota` | **31 de diciembre de 2025** | 01 de enero de 2026 | **31 de diciembre de 2025** |
| `UTC` | 01 de enero de 2026 | 01 de enero de 2026 | **31 de diciembre de 2025** |
| `Europe/Madrid` | 01 de enero de 2026 | 01 de enero de 2026 | **31 de diciembre de 2025** |

La primera columna es el fallo original: depende de la máquina. La segunda es la decisión:
igual en las tres. La tercera es la opción 1: igual en las tres, y mal en las tres.

Se reproduce abriendo `node` en cualquier terminal y pegando esto:

```js
const o = { day: '2-digit', month: 'long', year: 'numeric' };
for (const tz of ['America/Bogota', 'UTC', 'Europe/Madrid']) {
  process.env.TZ = tz; // simula una máquina en esa zona
  const d = new Date('2026-01-01'); // lo mismo que produce z.coerce.date()
  console.log(
    tz,
    '|', d.toLocaleDateString('es-CO', o),
    '|', d.toLocaleDateString('es-CO', { ...o, timeZone: 'UTC' }),
    '|', d.toLocaleDateString('es-CO', { ...o, timeZone: 'America/Bogota' }),
  );
}
```

**Sobre el sitio desplegado, el mismo 13 de septiembre**, pidiendo el HTML y el RSS con `curl`.
Las cuatro fechas publicadas (`2026-08-22`, `2026-08-29`, `2026-09-05` y `2026-09-12`)
coinciden con lo que ve el visitante: el artículo del 12 lleva
`datetime="2026-09-12T00:00:00.000Z"` y el texto «12 de septiembre de 2026», las tarjetas de la
portada van de «22 de ago de 2026» a «12 de sept de 2026», y el RSS publica
`Sat, 12 Sep 2026 00:00:00 GMT`.

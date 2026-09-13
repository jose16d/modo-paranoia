# ADR-0003 — El `<lastmod>` del sitemap se decide URL por URL, y solo donde hay una fecha real

- **Estado:** Aceptado
- **Fecha:** 2026-09-05
- **Afecta a:** `astro.config.mjs`, `src/lib/sitemap.ts`

## Contexto

El sitemap lo genera `@astrojs/sitemap`. Hasta el 5 de septiembre de 2026 salía con **24 URLs
y ninguna fecha**, así que Google no tenía ninguna señal de qué había cambiado. `<lastmod>` es
la forma estándar de dar esa señal: «esta URL es nueva o cambió, vuelve a rastrearla».

Dos reglas externas acotan qué se puede poner ahí:

- **El protocolo lo hace opcional por URL.** [sitemaps.org](https://www.sitemaps.org/protocol.html)
  marca `<lastmod>` como *optional* y pide que sea la fecha en que la página se modificó. Una
  URL sin fecha es válida.
- **Google solo lo usa si es de fiar.** Su
  [documentación sobre sitemaps](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
  dice que usa el valor si es *consistently and verifiably accurate*, comprobándolo contra la
  página, y que debe reflejar una actualización **significativa** del contenido. Una fecha que
  no se sostiene no es neutra: es una señal que Google aprende a descartar.

La integración trae una opción que se llama exactamente como lo que se buscaba, `lastmod`. Pero
**su tipo es un único `Date`** (`z.date().optional()` en su esquema), y en
`dist/generate-sitemap.js` se ve qué hace con él: lo convierte una sola vez con
`toISOString()` y **asigna ese mismo valor a todas las URLs**.

Y hay una restricción de Astro que descarta el camino limpio. El sitemap se genera en el hook
`astro:build:done`, fuera del renderizado, y `astro.config.mjs` no puede importar
`astro:content`: **la colección de artículos no está disponible donde se escribe el sitemap.**
Es el mismo motivo por el que el `filter` de la integración excluye `/gracias` a mano en vez de
leer la prop `noIndexar`.

## Opciones consideradas

*Las opciones 1, 2 y 3 son las que se evaluaron el 5 de septiembre de 2026. La 4 y la 5 se
añaden al redactar este ADR, el 13 de septiembre de 2026, y se rebaten con el repositorio de ese
momento: no consta que se discutieran entonces.*

1. **`sitemap({ lastmod: new Date() })`.** La opción evidente, y la trampa. Estampa la fecha de
   compilación en las 24 URLs, así que **cada despliegue declara que el sitio entero cambió**,
   incluidas páginas como `/privacidad` que llevan semanas sin tocarse. Es exactamente el
   `<lastmod>` que no pasa el filtro de Google. Descartada porque sale peor que el hueco: se
   pasa de no tener señal a tener una que desacredita las demás.

2. **`serialize` con las fechas de la colección de contenido.** Sería lo ideal, porque usaría
   los mismos datos que ya validó Zod. Descartada porque no es posible: la colección no existe
   en el momento en que se genera el sitemap (ver Contexto).

3. **`serialize` con las fechas leídas del front matter en disco.** Es la que se toma.

4. **La fecha del último commit de cada archivo.** Tiene aspecto de dato objetivo y falla por
   dos lados. En CI, `actions/checkout@v4` sin `fetch-depth` descarga un solo commit, así que
   no hay historial por archivo y todos recibirían la misma fecha: la opción 1 otra vez. Y aun
   con el historial completo, git cuenta cambios que el lector no ve. El artículo de MCP se
   publicó el 5 de septiembre y recibió dos commits más: el 6, `imagen` e `imagenAlt` para la
   tarjeta de portada, y el 12, quitar la línea `destacado: true`. Ninguno tocó el texto de la
   pieza, y con esta opción su `<lastmod>` diría 12 de septiembre.

5. **No hacer nada.** Opción real: el protocolo permite omitir la fecha. Descartada porque la
   fecha verdadera **ya existe** en el front matter de cada artículo, y las URLs que más
   necesitan la señal —la portada y las piezas nuevas— son justo las que la tienen.

## Decisión

El `<lastmod>` se asigna URL por URL en el `serialize` de `@astrojs/sitemap`, con fechas que
`src/lib/sitemap.ts` lee del front matter en disco, y **toda URL sin una fecha real se queda sin
`<lastmod>`**. La opción `lastmod` de la integración no se usa. Aplicado en el commit `4c5701c`
(PR #22).

Qué recibe fecha y de dónde sale:

| URL | `<lastmod>` |
|---|---|
| Artículos | `actualizado ?? fecha` de su front matter: la misma pareja que alimenta `dateModified` en el JSON-LD de `Base.astro` |
| Portada y `/seccion/*` | La fecha de su artículo más reciente, porque esas páginas cambian de verdad cuando entra una pieza |
| Institucionales, `/etiquetas` y `/etiqueta/*` | Ninguna |

Las etiquetas se quedan sin fecha por un motivo concreto: `etiquetas` es un array de texto
libre, y sacarlo del front matter obligaría a escribir un segundo intérprete de YAML dentro de
la configuración para las URLs que menos importan al rastreo.

Cuatro detalles del diseño que conviene no deshacer sin leer antes el comentario de
`src/lib/sitemap.ts`:

- **Las fechas viajan como texto `YYYY-MM-DD`, nunca como `Date`.** En ese formato el orden
  alfabético es el cronológico, así que no hace falta construir objetos de fecha, y sin ellos
  el fallo de zona horaria del [ADR-0002](0002-fechas-en-utc.md) no tiene por dónde entrar.
- **Solo cuenta lo que declara `borrador: false`.** El esquema pone `borrador: true` por
  defecto, así que un archivo sin el campo se trata como borrador. Sin ese filtro, una pieza a
  medio escribir con fecha futura adelantaría el `<lastmod>` de la portada.
- **Si un front matter no se deja leer, el build falla** con el nombre del archivo. Devolver un
  mapa vacío dejaría otra vez el sitemap sin fechas, y eso no lo notaría nadie.
- **El mapa se calcula dentro de `serialize`**, no al cargar la configuración, para que
  `astro dev` no abra archivos de contenido ni falle por un front matter a medio escribir.

## Consecuencias

**Lo que se gana.** Fechas reales donde las hay y ninguna inventada. De rebote, el índice
`sitemap-index.xml` también lleva una fecha verdadera: la integración le asigna la más reciente
de su archivo hijo (`getLatestLastmod`, en `dist/utils/lastmod.js`). Y el sitemap y los datos
estructurados no pueden contarle a Google dos historias distintas, porque leen la misma pareja
de campos.

**Lo que se paga.**

- **Una línea de configuración se convierte en un módulo de 142 líneas**, más el `serialize`
  en `astro.config.mjs`.
- **Hay un segundo lector del front matter.** `sitemap.ts` interpreta con expresiones regulares
  cuatro campos que Zod ya valida en `src/content.config.ts`. Si el formato cambia, hay que
  cambiarlo en los dos sitios. Por eso falla con ruido y no en silencio.
- **`actualizado` depende de que alguien lo escriba.** Si una pieza se reescribe a fondo sin
  declararlo, su `<lastmod>` se queda en la fecha de publicación. Es una omisión y no una
  invención, que es el lado seguro del error, pero hay que recordarlo al corregir un artículo.
  A 13 de septiembre de 2026, ningún artículo lo declara.
- **Las páginas de etiqueta no llevan fecha**, aunque podrían tener una derivada.

**Qué hay que vigilar.** Tres condiciones, todas comprobables:

1. **Que cambie el formato de `fecha`, `actualizado`, `seccion` o `borrador`** en el front
   matter; por ejemplo, una fecha con hora. El build falla con el nombre del archivo y la
   corrección va en las expresiones de `sitemap.ts`.
2. **Que aparezca un tipo de página nuevo que dependa de los artículos.** Su ruta se añade al
   mapa de `sitemap.ts`. Si nadie la añade, la página simplemente no lleva fecha: se degrada
   bien y no rompe nada.
3. **Que una actualización de `@astrojs/sitemap` cambie `serialize` o la opción `lastmod`.**
   Después de actualizarla se compila y se cuentan las fechas del sitemap generado:

   ```bash
   npm run build
   grep -o "<lastmod>" dist/sitemap-0.xml | wc -l
   ```

   La cifra correcta es artículos publicados + 1 (la portada) + secciones con al menos una
   pieza. Con cuatro artículos repartidos en tres secciones, **8**.

## Cómo se verificó

**En su momento, el 5 de septiembre de 2026.** Primero con cuatro archivos de prueba fuera del
repositorio, uno por caso límite: un `actualizado` posterior a `fecha`, un borrador fechado en
2027, finales de línea CRLF, y un `.webp` y un `.gitkeep` en la misma carpeta que los
artículos. Después, sobre el sitemap de producción: **6 de 24 URLs con fecha**, que eran los
tres artículos, la portada y las dos secciones que tenían piezas, y **cero fechas inventadas**.

**La trampa de la opción 1, reproducida el 13 de septiembre de 2026** con `@astrojs/sitemap`
3.7.3, llamando a su propia función con `lastmod: new Date()`. Las tres URLs de prueba salen con
la misma fecha y hora, `/privacidad` incluida:

```text
2026-09-13T16:58:03.278Z https://modoparanoia.com/
2026-09-13T16:58:03.278Z https://modoparanoia.com/articulos/2026-08-22-bre-b-a-los-diez-meses-quien-responde-cuando
2026-09-13T16:58:03.278Z https://modoparanoia.com/privacidad
```

Se reproduce abriendo `node` en la raíz del repositorio y pegando esto:

```js
import('./node_modules/@astrojs/sitemap/dist/generate-sitemap.js').then(({ generateSitemap }) => {
  const paginas = [
    'https://modoparanoia.com/',
    'https://modoparanoia.com/privacidad',
    'https://modoparanoia.com/articulos/2026-08-22-bre-b-a-los-diez-meses-quien-responde-cuando',
  ];
  for (const item of generateSitemap(paginas, 'https://modoparanoia.com', { lastmod: new Date() })) {
    console.log(item.lastmod, item.url);
  }
});
```

Va en una sola expresión con `.then` y no con `await` a propósito: la versión con
`const { generateSitemap } = await import(...)`, pegada de golpe en la consola de `node`, falló
con `generateSitemap is not a function`. Esta se probó pegada igual y funciona.

**Sobre el sitio desplegado, el mismo 13 de septiembre**, pidiendo `sitemap-index.xml` y
`sitemap-0.xml` con `curl`. **28 URLs y 8 `<lastmod>`**, exactamente los esperados:

| URL | `<lastmod>` |
|---|---|
| `/` | `2026-09-12` |
| Los cuatro artículos | Su `fecha`: `2026-08-22`, `2026-08-29`, `2026-09-05` y `2026-09-12` |
| `/seccion/letra-pequena` | `2026-08-29` |
| `/seccion/lo-bueno-lo-malo-lo-feo` | `2026-09-05` |
| `/seccion/modo-autopsia` | `2026-09-12` |
| Las 20 restantes (institucionales y etiquetas) | Ninguna |

El índice declara `2026-09-12`, la más reciente de su archivo hijo. El sitemap sirve las fechas
como medianoche UTC (`2026-09-12T00:00:00.000Z`), la misma que `z.coerce.date()` le da a
`fecha` en el esquema.

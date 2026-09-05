import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Fechas reales para el `<lastmod>` del sitemap.
 *
 * **El problema que resuelve.** El sitemap salía con 24 URLs y cero fechas, así que
 * Google no tenía ninguna señal de que algo hubiera cambiado: `<lastmod>` es la forma
 * estándar de decir «esto es nuevo, vuelve a rastrearlo».
 *
 * **Y el arreglo obvio era peor que el problema.** `@astrojs/sitemap` acepta una opción
 * `lastmod` de un solo valor, y mirando su `generate-sitemap.js` se ve lo que hace: la
 * aplica **a todas las URLs por igual**. Poner ahí la fecha de compilación marcaría las
 * 24 páginas como modificadas en cada despliegue; Google detecta esos sitemaps y deja de
 * creerse el `lastmod` del sitio entero. La única implementación honesta es fecha real
 * solo donde la hay, y por eso esto lee el front matter en vez de mirar el reloj.
 *
 * **Por qué se lee del disco y no de la colección.** El sitemap se genera en
 * `astro:build:done`, fuera del renderizado, y `astro.config.mjs` no puede importar
 * `astro:content` — es el mismo motivo por el que el `filter` de la integración excluye
 * `/gracias` a mano en vez de leer la prop `noIndexar`. Así que aquí se abre el archivo.
 *
 * **Qué URLs reciben fecha, y por qué esas.**
 *
 * - **Los artículos:** `actualizado ?? fecha` del front matter. Es exactamente la misma
 *   pareja que ya alimenta `dateModified` del JSON-LD en `Base.astro`, así que el sitemap
 *   y los datos estructurados no pueden contarle a Google dos historias distintas.
 * - **La portada y las páginas de sección:** la fecha del artículo más reciente que
 *   listan. No es una fecha inventada: esas páginas cambian de verdad cuando entra una
 *   pieza, y la portada es la URL que Google vuelve a mirar para descubrir lo nuevo.
 * - **Las institucionales** (`/contacto`, `/privacidad`, `/quien-escribe`…): **nada**. No
 *   hay una fecha real que poner y el sitemap no es sitio para adivinar. Un `<lastmod>`
 *   por URL es opcional en el estándar; inventarlo, no.
 * - **`/etiquetas` y `/etiqueta/*`: nada, a propósito.** Serían derivables igual que las
 *   secciones, pero `etiquetas` es un array de texto libre y sacarlo de aquí obligaría a
 *   escribir un segundo intérprete de YAML dentro de la configuración. Es la clase de
 *   duplicación que ya cuesta cara con el taller del editor, y son justo las URLs que
 *   menos importan para el rastreo. Si algún día valen la pena, se hace bien.
 *
 * **Las fechas se manejan como texto `YYYY-MM-DD`, nunca como `Date`.** Ordenar y comparar
 * en ese formato es lo mismo alfabéticamente que cronológicamente, así que no hace falta
 * construir ni un solo objeto de fecha — y sin objetos de fecha no hay zona horaria que
 * pueda retrasar un día lo que dice el front matter. Es la nota 5 evitada por diseño en
 * vez de resuelta con un `timeZone`. Del texto al `<lastmod>` del XML se encarga el
 * paquete `sitemap`, que lo pasa por `new Date(...).toISOString()`; una cadena de solo
 * fecha la interpreta el estándar como medianoche **UTC**, que es la misma medianoche que
 * `z.coerce.date()` le da al esquema.
 */

/*
 * Se resuelve desde el directorio de trabajo y no desde `import.meta.url` porque este
 * módulo lo importa `astro.config.mjs`, y la configuración de Astro se carga empaquetada:
 * `import.meta.url` puede apuntar a un archivo temporal en otra carpeta. `astro build`
 * siempre corre desde la raíz del proyecto, tanto en el `npm run build` local como en CI.
 */
const DIRECTORIO = join(process.cwd(), 'src', 'content', 'articulos');

/*
 * Nada de esto pretende ser un intérprete de YAML: son cuatro campos escalares, cada uno
 * en su línea, que escribe el taller del editor y valida Zod. Lo que sí hace falta es que
 * **falle a gritos**. Si mañana cambia el formato del front matter, esto revienta el build
 * con el nombre del archivo delante, y CI lo caza en el PR. La alternativa —devolver un
 * mapa vacío y seguir— dejaría el sitemap sin fechas otra vez, y sin que nadie se entere:
 * exactamente el fallo silencioso que este archivo existe para quitar.
 *
 * El `\r?` no es decorativo: en Windows los archivos del árbol de trabajo tienen CRLF.
 */
const FRONT_MATTER = /^---\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)/;
const FECHA = /^fecha:[ \t]*['"]?(\d{4}-\d{2}-\d{2})['"]?[ \t]*$/m;
const ACTUALIZADO = /^actualizado:[ \t]*['"]?(\d{4}-\d{2}-\d{2})['"]?[ \t]*$/m;
const SECCION = /^seccion:[ \t]*['"]?([a-z0-9-]+)['"]?[ \t]*$/m;

/*
 * `borrador` es `true` por defecto en el esquema, así que aquí se comprueba lo contrario:
 * publicado es **solo** lo que declara `borrador: false` a la cara. Un archivo sin el
 * campo, o con el campo escrito de otra forma, cuenta como borrador y se ignora — que es
 * el lado seguro del error. Importa porque un borrador con fecha futura, si colara,
 * empujaría hacia adelante el `<lastmod>` de la portada sin que exista la pieza.
 */
const PUBLICADO = /^borrador:[ \t]*false[ \t]*$/m;

interface Ficha {
  /** El `id` de la colección: el nombre del archivo sin extensión. Es lo que va en la URL. */
  slug: string;
  seccion: string;
  /** `YYYY-MM-DD`. Ya resuelta la preferencia de `actualizado` sobre `fecha`. */
  lastmod: string;
}

function leerFichas(): Ficha[] {
  const fichas: Ficha[] = [];

  for (const archivo of readdirSync(DIRECTORIO)) {
    // En la carpeta también viven las imágenes de portada y un `.gitkeep`.
    if (!archivo.endsWith('.md') && !archivo.endsWith('.mdx')) continue;

    const bloque = FRONT_MATTER.exec(readFileSync(join(DIRECTORIO, archivo), 'utf8'))?.[1];
    if (bloque === undefined) {
      throw new Error(`${archivo}: no se encontró el front matter para el <lastmod> del sitemap.`);
    }

    if (!PUBLICADO.test(bloque)) continue;

    const fecha = ACTUALIZADO.exec(bloque)?.[1] ?? FECHA.exec(bloque)?.[1];
    if (fecha === undefined) {
      throw new Error(`${archivo}: no se pudo leer «fecha» del front matter para el <lastmod>.`);
    }

    const seccion = SECCION.exec(bloque)?.[1];
    if (seccion === undefined) {
      throw new Error(`${archivo}: no se pudo leer «seccion» del front matter para el <lastmod>.`);
    }

    fichas.push({ slug: archivo.replace(/\.mdx?$/, ''), seccion, lastmod: fecha });
  }

  return fichas;
}

/**
 * Ruta del sitio (`/articulos/mi-pieza`, `/seccion/modo-autopsia`, `/`) → `YYYY-MM-DD`.
 *
 * Lo que no esté en el mapa se queda sin `<lastmod>`, que es el comportamiento correcto
 * para las páginas fijas.
 */
export function mapaDeLastmod(): Map<string, string> {
  const mapa = new Map<string, string>();

  /** Una página de listado vale por su pieza más reciente, no por la última que se leyó. */
  const masReciente = (ruta: string, fecha: string): void => {
    const previa = mapa.get(ruta);
    if (previa === undefined || fecha > previa) mapa.set(ruta, fecha);
  };

  for (const { slug, seccion, lastmod } of leerFichas()) {
    mapa.set(`/articulos/${slug}`, lastmod);
    masReciente('/', lastmod);
    masReciente(`/seccion/${seccion}`, lastmod);
  }

  return mapa;
}

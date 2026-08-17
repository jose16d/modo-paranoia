/**
 * Puente entre el kit de marca y el sitio.
 *
 * Los SVG viven en `docs/assets/` y ese directorio es la única fuente de verdad:
 * el mismo archivo que se ve en el kit es el que sale publicado. Aquí se leen en
 * **tiempo de compilación** con `import.meta.glob` y se convierten en cadenas que
 * `Icono.astro` escribe directamente dentro del HTML.
 *
 * Por qué inline y no `<img src="/iconos/x.svg">`:
 *
 * 1. Un SVG inline hereda el color con `currentColor`. Uno cargado por `<img>` no:
 *    habría que tener una copia por color de sección.
 * 2. Cero peticiones extra. Estos iconos pesan entre 100 y 400 bytes; la cabecera
 *    HTTP de pedirlos costaría más que el archivo.
 * 3. Cero JavaScript en el navegador. Todo esto ocurre al construir el sitio.
 *
 * El precio, que conviene conocer: los nombres no son tipos literales, así que un
 * nombre mal escrito NO lo detecta `astro check`. Lo detecta `astro build`, que
 * falla con la lista de iconos disponibles. Se prefirió un fallo ruidoso en el
 * build a mantener a mano una lista de 43 nombres que se desincronizaría sola.
 */

const CATALOGO_CRUDO = {
  iconos: import.meta.glob('/docs/assets/iconos/*.svg', {
    query: '?raw',
    import: 'default',
    eager: true,
  }),
  secciones: import.meta.glob('/docs/assets/secciones/*.svg', {
    query: '?raw',
    import: 'default',
    eager: true,
  }),
} as const;

export type FamiliaIcono = keyof typeof CATALOGO_CRUDO;

/**
 * Atributos de presentación que se conservan del archivo original.
 *
 * `color` queda fuera a propósito. Los archivos sueltos lo llevan (`color="#E8EAF0"`)
 * para que `currentColor` resuelva a Niebla cuando se abren fuera del sitio o dentro
 * de un `<img>`, donde no llega el CSS de la página. Insertados inline sobra: el color
 * lo pone el contenedor.
 */
const ATRIBUTOS_CONSERVADOS = [
  'viewBox',
  'fill',
  'stroke',
  'stroke-width',
  'stroke-linecap',
  'stroke-linejoin',
];

const ETIQUETA_RAIZ = /<svg([^>]*)>([\s\S]*)<\/svg>/;
const ATRIBUTO = /([a-zA-Z-]+)="([^"]*)"/g;
const COLOR_HEX = /^#[0-9A-Fa-f]{3,8}$/;

export interface IconoInline {
  /** Contenido interno del `<svg>`: paths, circles, rects. */
  cuerpo: string;
  /** Atributos de presentación heredados del archivo, ya normalizados. */
  atributos: Record<string, string>;
}

function indexarPorNombre(modulos: Record<string, unknown>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(modulos).map(([ruta, svg]) => [
      ruta.split('/').pop()!.replace(/\.svg$/, ''),
      svg as string,
    ]),
  );
}

const CATALOGO: Record<FamiliaIcono, Record<string, string>> = {
  iconos: indexarPorNombre(CATALOGO_CRUDO.iconos),
  secciones: indexarPorNombre(CATALOGO_CRUDO.secciones),
};

/** Nombres disponibles, para documentación y para el mensaje de error del build. */
export function nombresDeIconos(familia: FamiliaIcono = 'iconos'): string[] {
  return Object.keys(CATALOGO[familia]).sort();
}

export function obtenerIcono(nombre: string, familia: FamiliaIcono = 'iconos'): IconoInline {
  const archivo = CATALOGO[familia][nombre];

  if (!archivo) {
    throw new Error(
      `No existe el icono "${nombre}" en docs/assets/${familia}/.\n` +
        `Disponibles: ${nombresDeIconos(familia).join(', ')}`,
    );
  }

  const coincidencia = archivo.match(ETIQUETA_RAIZ);
  if (!coincidencia) {
    throw new Error(`docs/assets/${familia}/${nombre}.svg no contiene una etiqueta <svg> válida.`);
  }

  const [, atributosCrudos, cuerpo] = coincidencia;
  const atributos: Record<string, string> = {};

  for (const [, clave, valor] of atributosCrudos.matchAll(ATRIBUTO)) {
    if (!ATRIBUTOS_CONSERVADOS.includes(clave)) continue;
    // `width` y `height` se descartan a propósito: el tamaño lo decide quien usa el
    // componente, no el archivo.
    //
    // El color del elemento raíz sí se sustituye por `currentColor`. Los iconos de
    // sección traen su color de marca escrito para que el archivo suelto se vea bien
    // al abrirlo; dentro de la página debe mandar el contexto, que es quien sabe de
    // qué sección se trata.
    atributos[clave] = COLOR_HEX.test(valor) ? 'currentColor' : valor;
  }

  // Los colores escritos en elementos internos NO se tocan: son deliberados. El icono
  // de «Lo bueno, lo malo y lo feo» son tres barras verde / ámbar / alerta, y esa
  // tricromía es justamente lo que lo hace reconocible.
  return { cuerpo, atributos };
}

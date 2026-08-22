import type { Articulo } from './articulos';

/**
 * Índice de etiquetas: la mirada transversal del medio hecha navegable.
 *
 * Las secciones dicen qué **forma** tiene la pieza y viven en src/lib/secciones.ts
 * con una lista cerrada. Las etiquetas dicen de **qué** trata y son texto libre en
 * el front matter, a propósito: el diferenciador del medio —la mirada local,
 * Colombia y LATAM— atraviesa los tres formatos y no cabe en un cajón. Ver la
 * decisión del 21 ago 2026 en BITACORA.md.
 */

/**
 * Reduce una etiqueta escrita a mano a la clave que va en la URL:
 * «Reconocimiento facial» → `reconocimiento-facial`, «Ley 1581» → `ley-1581`.
 *
 * El efecto secundario es deliberado y es la mitad del valor: «Colombia»,
 * «colombia» y «COLOMBIA» caen en la misma clave y por tanto en la misma página.
 * Sin esto, un despiste de mayúsculas parte una etiqueta en dos y ninguna de las
 * dos reúne piezas suficientes para servir de nada.
 */
export function aClave(etiqueta: string): string {
  return etiqueta
    // NFD separa la letra de su tilde («ó» pasa a ser «o» + un acento suelto)
    .normalize('NFD')
    // y aquí se borra el acento suelto, que ocupa ese rango de Unicode
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    // cualquier racha de lo que no sea letra o número se vuelve un solo guion
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export interface Etiqueta {
  /** Lo que va en la URL: `/etiqueta/{clave}`. */
  clave: string;
  /** La etiqueta tal como se escribió en el front matter, para mostrarla. */
  nombre: string;
  /** Piezas que la llevan, de la más reciente a la más antigua. */
  articulos: Articulo[];
}

/**
 * Agrupa los artículos por etiqueta.
 *
 * Recibe los artículos como parámetro en vez de llamar a `obtenerArticulos()`
 * por su cuenta por dos motivos: quien llama ya los tiene cargados, y así este
 * archivo no importa nada de `astro:content` — lo puede usar `content.config.ts`
 * para validar el esquema sin morderse la cola.
 *
 * **Qué grafía se muestra.** Varias grafías pueden compartir clave, así que hay
 * que elegir una: gana la más usada y, si empatan, la del artículo más reciente
 * (esta función recibe la lista ya ordenada por fecha descendente, y el `Map`
 * conserva el orden de inserción). La regla importa poco cuando hay tres piezas
 * y mucho cuando hay cincuenta; lo que importa es que sea determinista, para que
 * dos compilaciones del mismo contenido den exactamente el mismo HTML.
 *
 * El resultado va ordenado por número de piezas y, a igualdad, alfabéticamente.
 */
export function indiceDeEtiquetas(articulos: Articulo[]): Etiqueta[] {
  const indice = new Map<string, { grafias: Map<string, number>; articulos: Articulo[] }>();

  for (const articulo of articulos) {
    // Un artículo que repitiera la misma etiqueta con dos grafías se contaría
    // dos veces en su propia página. Esto lo cuenta una sola vez.
    const yaContadas = new Set<string>();

    for (const etiqueta of articulo.data.etiquetas) {
      const clave = aClave(etiqueta);

      // El esquema ya rechaza las etiquetas sin letras ni números; esto es el
      // cinturón por si alguien toca el esquema y no este archivo.
      if (clave === '') continue;

      /*
       * La grafía se guarda sin espacios sobrantes. El HTML los colapsaría al
       * pintarla, pero el <title> y la meta descripción no: ahí viajan tal cual
       * y se ven. Se recorta el espacio, nunca las mayúsculas ni las tildes, que
       * son justo lo que se quiere conservar de cómo lo escribió el autor.
       */
      const grafia = etiqueta.trim().replace(/\s+/g, ' ');

      let entrada = indice.get(clave);
      if (!entrada) {
        entrada = { grafias: new Map(), articulos: [] };
        indice.set(clave, entrada);
      }

      entrada.grafias.set(grafia, (entrada.grafias.get(grafia) ?? 0) + 1);

      if (!yaContadas.has(clave)) {
        yaContadas.add(clave);
        entrada.articulos.push(articulo);
      }
    }
  }

  return [...indice]
    .map(([clave, entrada]) => ({
      clave,
      // `reduce` conserva el acumulador cuando hay empate, y el primero
      // insertado es el del artículo más reciente.
      nombre: [...entrada.grafias].reduce((a, b) => (b[1] > a[1] ? b : a))[0],
      articulos: entrada.articulos,
    }))
    .sort(
      (a, b) =>
        b.articulos.length - a.articulos.length || a.clave.localeCompare(b.clave, 'es'),
    );
}

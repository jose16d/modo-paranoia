import { getCollection, type CollectionEntry } from 'astro:content';

export type Articulo = CollectionEntry<'articulos'>;

/**
 * Devuelve los artículos publicables, del más reciente al más antiguo.
 *
 * En desarrollo se incluyen los borradores para poder previsualizarlos;
 * en producción se excluyen. `borrador` es `true` por defecto en el esquema
 * (ver src/content.config.ts), así que nada se publica por accidente.
 */
export async function obtenerArticulos(): Promise<Articulo[]> {
  const articulos = await getCollection('articulos', ({ data }) =>
    import.meta.env.DEV ? true : data.borrador === false,
  );

  return articulos.sort((a, b) => b.data.fecha.valueOf() - a.data.fecha.valueOf());
}

/**
 * Zona en la que se pintan **todas** las fechas legibles del sitio.
 *
 * El front matter escribe `fecha: 2026-08-20`, sin hora ni zona, y `z.coerce.date()`
 * interpreta una fecha suelta como medianoche **UTC**. Al formatearla en la zona de
 * la máquina, esa medianoche retrocede al día anterior en cualquier huso al oeste de
 * Greenwich: en Colombia (−5) el artículo del 20 se publicaba «el 19».
 *
 * Y era peor que un día de menos: el resultado dependía de **dónde** se compilara.
 * En el PC de Bogotá salía el 19; en Cloudflare Pages y en GitHub Actions, que corren
 * en UTC, salía el 20. Local y producción no coincidían — la misma familia de error
 * invisible que `compressHTML`, que solo se notaba en el sitio ya desplegado.
 *
 * Con la zona fijada, la fecha pintada es siempre, y en cualquier máquina, la que
 * está escrita en el front matter. No se cambia a `America/Bogota`: eso volvería a
 * mover la medianoche UTC un día atrás, que es justo el fallo que esto arregla.
 */
const ZONA = 'UTC';

/** «20 de agosto de 2026» — cabecera de un artículo. */
export function formatearFecha(fecha: Date): string {
  return fecha.toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    timeZone: ZONA,
  });
}

/**
 * «20 de ago de 2026» — pie de una tarjeta.
 *
 * Vive aquí y no dentro de `TarjetaArticulo.astro`, que es donde estaba escrita a
 * mano, para que la decisión de zona horaria esté en un solo sitio. Duplicada eran
 * dos formatos que podían divergir, y de hecho solo uno se habría arreglado.
 */
export function formatearFechaCorta(fecha: Date): string {
  return fecha.toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: ZONA,
  });
}

/** Estimación de lectura a 200 palabras por minuto, mínimo 1. */
export function minutosDeLectura(texto: string): number {
  const palabras = texto.trim().split(/\s+/).length;
  return Math.max(1, Math.round(palabras / 200));
}

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

export function formatearFecha(fecha: Date): string {
  return fecha.toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

/** Estimación de lectura a 200 palabras por minuto, mínimo 1. */
export function minutosDeLectura(texto: string): number {
  const palabras = texto.trim().split(/\s+/).length;
  return Math.max(1, Math.round(palabras / 200));
}

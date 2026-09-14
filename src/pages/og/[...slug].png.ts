import type { APIRoute } from 'astro';
import { obtenerArticulos } from '../../lib/articulos';
import { generarTarjeta } from '../../lib/og';

/**
 * Una tarjeta social por artículo, en `/og/{id}.png`.
 *
 * Es un endpoint estático: `astro build` lo ejecuta una vez por artículo y escribe
 * el PNG en `dist/`. En producción no corre nada — Cloudflare Pages sirve un archivo,
 * igual que el resto del sitio.
 *
 * Sale de `obtenerArticulos()`, así que sigue el mismo filtro que las páginas: en
 * producción **no hay tarjeta para un borrador**, y en `npm run dev` sí, para poder verla
 * antes de publicar. La tarjeta se compila en el mismo despliegue que publica la pieza,
 * así que no hay un momento en que el artículo exista y su tarjeta todavía no.
 */
export async function getStaticPaths() {
  const articulos = await obtenerArticulos();
  return articulos.map((articulo) => ({
    params: { slug: articulo.id },
    props: { articulo },
  }));
}

export const GET: APIRoute = async ({ props }) => {
  const { articulo } = props as { articulo: Awaited<ReturnType<typeof obtenerArticulos>>[number] };

  const png = await generarTarjeta({
    titulo: articulo.data.titulo,
    seccion: articulo.data.seccion,
  });

  return new Response(new Uint8Array(png), {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};

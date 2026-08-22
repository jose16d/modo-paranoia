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
 * Se genera también para los borradores. Cuestan unos milisegundos y evitan el fallo
 * tonto de compartir una pieza recién publicada y que la tarjeta no exista todavía.
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

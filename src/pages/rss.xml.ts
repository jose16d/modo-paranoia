import type { APIRoute } from 'astro';
import { obtenerArticulos } from '../lib/articulos';
import { SECCIONES, SITIO } from '../lib/secciones';

/**
 * Feed RSS generado a mano, sin dependencias.
 * Si más adelante instalas @astrojs/rss, este archivo se puede reemplazar.
 */

/** Escapa los cinco caracteres que rompen un XML. */
function escapar(texto: string): string {
  return texto
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export const GET: APIRoute = async ({ site }) => {
  const base = (site ?? new URL(SITIO.url)).href.replace(/\/$/, '');
  const articulos = (await obtenerArticulos()).filter((a) => !a.data.borrador);

  const items = articulos
    .map((a) => {
      const url = `${base}/articulos/${a.id}`;
      return `    <item>
      <title>${escapar(a.data.titulo)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${escapar(a.data.bajada)}</description>
      <category>${escapar(SECCIONES[a.data.seccion].nombre)}</category>
      <pubDate>${a.data.fecha.toUTCString()}</pubDate>
    </item>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapar(SITIO.nombre)}</title>
    <link>${base}</link>
    <description>${escapar(SITIO.descripcion)}</description>
    <language>es-CO</language>
    <atom:link href="${base}/rss.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};

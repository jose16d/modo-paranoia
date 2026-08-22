import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';
import { aClave } from './lib/etiquetas';

const secciones = [
  'lo-bueno-lo-malo-lo-feo',
  'modo-autopsia',
  'letra-pequena',
] as const;

const articulos = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/articulos' }),
  /*
   * `portada` y `portadaAlt` vivieron aquí desde la Fase 4 y **nunca los pintó nada**:
   * eran campos muertos que invitaban a rellenarlos creyendo que hacían algo. La
   * tarjeta social se genera del título en src/lib/og.ts, así que no hacen falta. Si
   * algún día una pieza pide una imagen propia —una captura de una cláusula, una
   * gráfica—, se vuelven a añadir con `image()` y `og.ts` los toma como excepción.
   */
  schema: z.object({
    titulo: z.string().max(90),
    bajada: z.string().max(180),
    seccion: z.enum(secciones),
    autor: z.string().default('jose'),
    fecha: z.coerce.date(),
    actualizado: z.coerce.date().optional(),
    /*
     * Las etiquetas son texto libre a propósito, pero su clave es la URL
     * (`/etiqueta/{clave}`), y `aClave` descarta todo lo que no sea letra o
     * número. Una etiqueta como «···» daría clave vacía y una ruta rota, así
     * que se rechaza aquí: `astro check` lo caza en el PR, no en producción.
     */
    etiquetas: z
      .array(
        z.string().refine((e) => aClave(e) !== '', {
          message:
            'Una etiqueta necesita al menos una letra o un número: es lo que forma su URL.',
        }),
      )
      .default([]),
    destacado: z.boolean().default(false),
    borrador: z.boolean().default(true),
    fuentes: z
      .array(z.object({ titulo: z.string(), url: z.url() }))
      .default([]),
    /*
     * `usoIA` vivió aquí y pintaba un bloque al final de cada artículo. Se quitó el
     * 22 ago 2026: la declaración del uso de IA es de sitio, no de pieza, y vive
     * entera en `/metodologia` —qué se hace con modelos de lenguaje y qué no—. Esa
     * página nunca prometió una declaración por artículo, así que quitarlo no rompe
     * ninguna promesa pública. Se elimina del esquema y no solo de la plantilla para
     * no dejar un campo muerto, que es el error que ya se cometió con `portada`.
     *
     * Sigue en pie lo que sí promete `/metodologia`: una imagen generada se declara
     * **en su pie de foto**. Eso es cosa del pie, no de este campo.
     */
  }),
});

const autores = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/autores' }),
  schema: z.object({
    nombre: z.string(),
    bio: z.string(),
    rol: z.string(),
    enlaces: z.array(z.object({ etiqueta: z.string(), url: z.url() })).default([]),
  }),
});

export const collections = { articulos, autores };
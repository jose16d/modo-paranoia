import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const secciones = [
  'lo-bueno-lo-malo-lo-feo',
  'modo-autopsia',
  'letra-pequena',
] as const;

const articulos = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/articulos' }),
  schema: ({ image }) =>
    z.object({
      titulo: z.string().max(90),
      bajada: z.string().max(180),
      seccion: z.enum(secciones),
      autor: z.string().default('jose'),
      fecha: z.coerce.date(),
      actualizado: z.coerce.date().optional(),
      portada: image().optional(),
      portadaAlt: z.string().optional(),
      etiquetas: z.array(z.string()).default([]),
      destacado: z.boolean().default(false),
      borrador: z.boolean().default(true),
      fuentes: z
        .array(z.object({ titulo: z.string(), url: z.url() }))
        .default([]),
      usoIA: z.string().optional(),
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
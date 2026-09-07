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
   * `imagen` e `imagenAlt` son el regreso, con motivo, de los antiguos `portada` y
   * `portadaAlt`. Aquellos se quitaron el 22 ago 2026 por ser campos muertos: nada los
   * pintaba y solo invitaban a rellenarlos. Vuelven el 6 sep 2026 porque ahora sí hay
   * quien los pinte —la tarjeta de artículo— y porque la imagen que ya tenía cada pieza
   * vivía únicamente dentro del Markdown, donde la colección no puede verla.
   *
   * Se llaman `imagen` y no `portada` a propósito: en src/pages/index.astro `portada` ya
   * es el artículo destacado. Dos cosas con el mismo nombre en el mismo archivo es cómo
   * se fabrica el siguiente error invisible.
   *
   * El esquema se declara como función para recibir el helper `image()`, que valida que
   * el archivo exista, lo optimiza y expone sus dimensiones. Sin dimensiones no hay
   * defensa contra el desplazamiento de la maqueta, y el CLS móvil ya está en 0,062
   * sobre un umbral de reapertura de 0,1.
   *
   * Los dos son **obligatorios**. Opcionales dejarían pasar una pieza sin imagen hasta
   * producción, con la tarjeta coja; obligatorios, `astro check` para el PR. La tarjeta
   * social sigue generándose del título en src/lib/og.ts y no usa este campo.
   */
  schema: ({ image }) =>
    z.object({
      titulo: z.string().max(90),
      bajada: z.string().max(180),
      seccion: z.enum(secciones),
      imagen: image(),
      imagenAlt: z.string().max(180),
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
       * no dejar un campo muerto, que es el error que ya se cometió con `portada`. Ese
       * error es justo el que `imagen` no repite: vuelve porque hay quien la pinte.
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
// @ts-check
import { defineConfig } from 'astro/config';

import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  // Necesario para generar URLs absolutas en el RSS, el sitemap y las etiquetas canónicas.
  site: 'https://modoparanoia.com',

  trailingSlash: 'never',

  /*
   * NO volver a poner esto en `true` (que es el valor por defecto de Astro).
   *
   * Con la compresión activada, un salto de línea entre texto y una etiqueta en
   * línea no se colapsa a un espacio: desaparece. Una plantilla escrita así,
   * que es como está escrito todo el repositorio:
   *
   *     Para ejercerlos basta con escribir a
   *     <a href={`mailto:${SITIO.correo}`}>{SITIO.correo}</a>.
   *
   * se compilaba como «escribir ahola@modoparanoia.com». Había once casos
   * repartidos por las páginas institucionales, incluidas las dos legales.
   *
   * Lo que lo hace peligroso es que **solo ocurre al compilar**: `npm run dev`
   * no comprime, así que el sitio se ve bien en local y sale mal en producción.
   * Se detectó mirando el sitio ya desplegado, no antes.
   *
   * El costo medido de desactivarlo son 895 bytes en las 12 páginas después de
   * gzip — unos 75 bytes por página. A cambio desaparece una clase entera de
   * error invisible en prosa que ya está publicada.
   *
   * Los artículos en Markdown NO estaban afectados: su HTML se genera al
   * renderizar y no pasa por el compresor. El problema era solo de los `.astro`.
   */
  compressHTML: false,

  build: {
    format: 'file',
  },

  integrations: [
    sitemap({
      /*
       * El sitemap solo lista lo que queremos que Google indexe. Una página que
       * declara `noIndexar` en Base.astro y a la vez aparece aquí manda dos señales
       * opuestas: «esta URL existe, tenla en cuenta» y «no la indexes».
       *
       * `/404` ya lo excluye la integración por su cuenta. `/gracias` hay que
       * excluirlo a mano porque es una página normal a ojos del build.
       *
       * **Si algún día añades otra página con `noIndexar`, va también en esta lista.**
       * No se puede automatizar: el sitemap se genera fuera del renderizado y no ve
       * las props con las que se llamó al layout.
       */
      filter: (pagina) => !pagina.endsWith('/gracias'),
    }),
  ],
});
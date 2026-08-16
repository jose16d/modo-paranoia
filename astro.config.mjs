// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  // Necesario para generar URLs absolutas en el RSS, el sitemap y las etiquetas canónicas.
  site: 'https://modoparanoia.com',
  trailingSlash: 'never',
  build: {
    format: 'file',
  },
});

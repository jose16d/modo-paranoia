# Modo Paranoia

Medio digital de análisis crítico de tecnología en español.
Modelo de ensayo, no de noticia.

**En producción:** https://modoparanoia.com

## Arquitectura

Sitio estático generado con **Astro 7** y desplegado en **Cloudflare Pages**.
La edición se hace desde un CMS basado en Git: el panel escribe un commit mediante la API
de GitHub, y ese commit dispara el build. No hay servidor ni base de datos que mantener, y
el contenido son archivos Markdown de este repositorio — sin dependencia de proveedor.

| Capa | Tecnología |
|---|---|
| Framework | Astro 7 · Content Collections validadas con Zod |
| Hosting | Cloudflare Pages |
| CMS | Sveltia CMS en `/admin` |
| Autenticación del panel | Cloudflare Workers · OAuth de GitHub |
| Analítica | Cloudflare Web Analytics (sin cookies) |
| CI | GitHub Actions · `astro check` + build |

## Estructura

```
src/
├── lib/          fuente de verdad de secciones y consulta de artículos
├── styles/       tokens de diseño y sistema de componentes
├── layouts/      Base (head, SEO, JSON-LD) y Pagina
├── components/   cabecera, pie, tarjeta de artículo
├── content/      artículos y autores en Markdown
└── pages/        rutas del sitio
docs/             kit de marca, ADR y diagramas
```

## Ejecutar en local

    npm install
    npm run dev      # http://localhost:4321
    npm run check    # validación de tipos y de esquemas de contenido
    npm run build

## Documentación

- Kit de marca, paleta y tipografía: `docs/kit-de-marca.html`
- Decisiones de arquitectura: `docs/adr/`

## Licencia

El **código** de este repositorio está bajo licencia MIT — ver `LICENSE`.

Los **textos publicados** en modoparanoia.com no están cubiertos por esa licencia:
todos los derechos reservados. Puedes citar fragmentos breves enlazando al original.

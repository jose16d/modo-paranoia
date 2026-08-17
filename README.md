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
├── lib/          fuente de verdad de secciones, artículos e iconos
├── styles/       tokens de diseño y sistema de componentes
├── layouts/      Base (head, SEO, JSON-LD) y Pagina
├── components/   cabecera, pie, tarjeta de artículo, Icono
├── content/      artículos y autores en Markdown
└── pages/        rutas del sitio
public/           lo que se sirve tal cual: favicon, og.png, robots.txt, _headers
docs/
├── kit-de-marca.html
├── assets/       logotipos, iconos, patrones y recursos sociales
├── adr/          decisiones de arquitectura
└── diagramas/    diagramas Mermaid
```

## Recursos de marca

`docs/assets/` es la **única** fuente de los recursos de marca; el sitio no guarda
copias. Los iconos se insertan en el HTML al compilar mediante
`src/components/Icono.astro`, que los lee de ahí con `import.meta.glob`. Así heredan
el color del texto con `currentColor`, no cuestan una petición cada uno y no envían
JavaScript al navegador.

Los archivos que el navegador pide por URL —`favicon.svg`, `favicon.ico`,
`apple-touch-icon.png`, `og.png`— sí viven en `public/`, porque son direcciones fijas.

Los logotipos y la imagen de Open Graph son SVG con el texto convertido a trazos: un
`<text font-family="Syne">` depende de que la fuente esté instalada en quien lo dibuja,
y no lo está en los rastreadores de redes sociales. La imagen de Open Graph va además
en PNG porque ninguna red social acepta SVG en `og:image`.

## Ejecutar en local

    npm install
    npm run dev      # http://localhost:4321
    npm run check    # validación de tipos y de esquemas de contenido
    npm run build

## Despliegue

Cloudflare Pages construye desde `main`. Configuración del proyecto:

| Campo | Valor |
|---|---|
| Framework preset | Astro |
| Comando de build | `npm run build` |
| Directorio de salida | `dist` |
| Variable de entorno | `NODE_VERSION` = `24` |

`public/_headers` lo lee Cloudflare al desplegar: aplica las cabeceras de seguridad
y cachea `/_astro/*` de forma inmutable, que es seguro porque Astro pone una huella
en el nombre de cada recurso compilado.

La redirección de `www` a la raíz se configura como *Redirect Rule* en el panel de
Cloudflare, no en este repositorio: es DNS, no build.

## Documentación

- Kit de marca, paleta y tipografía: `docs/kit-de-marca.html`
- Decisiones de arquitectura: `docs/adr/`

## Licencia

El **código** de este repositorio está bajo licencia MIT — ver `LICENSE`.

Los **textos publicados** en modoparanoia.com no están cubiertos por esa licencia:
todos los derechos reservados. Puedes citar fragmentos breves enlazando al original.

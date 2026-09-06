# Modo Paranoia

Medio digital de análisis crítico de tecnología en español.
Modelo de ensayo, no de noticia.

**En producción:** https://modoparanoia.com

## Arquitectura

Sitio estático generado con **Astro 7** y desplegado en **Cloudflare Pages**.
El contenido son archivos Markdown de este repositorio: se escriben, entran por *pull
request* y el merge dispara el build. No hay servidor, base de datos ni panel que mantener,
y no hay dependencia de proveedor — el sitio entero se reconstruye desde este repositorio.

| Capa | Tecnología |
|---|---|
| Framework | Astro 7 · Content Collections validadas con Zod |
| Hosting | Cloudflare Pages |
| Edición | Markdown en el repositorio, vía pull request |
| Tarjetas sociales | Generadas al compilar con satori + sharp, una por artículo |
| Buscador | Pendiente (Pagefind) |
| CI | GitHub Actions · `astro check` + build |

> **Sobre el panel de edición.** El plan original contemplaba un CMS basado en Git
> (Sveltia CMS en `/admin`, autenticado con un Worker y OAuth de GitHub). Se descartó al
> comprobar que el requisito real —publicar desde otro computador— ya lo resuelve el editor
> web de GitHub sin infraestructura añadida. Lo que aportaba el CMS era un formulario que
> valida el *front matter*, no una capacidad nueva; esa validación la hace `astro check` en
> cada *pull request*. **Nunca se desplegó, y el README lo anunciaba como si existiera.**

## Estructura

```
src/
├── lib/          fuente de verdad de secciones, artículos e iconos
├── styles/       tokens de diseño y sistema de componentes
├── layouts/      Base (head, SEO, JSON-LD) y Pagina
├── components/   cabecera, pie, tarjeta de artículo, Icono
├── content/      artículos y autores en Markdown, con sus imágenes al lado
└── pages/
    ├── og/       endpoint que genera la tarjeta social de cada artículo
    └── ...       rutas del sitio
public/           lo que se sirve tal cual: favicon, og.png, robots.txt, _headers
docs/
├── kit-de-marca.html
├── adr/          registro de decisiones de arquitectura (ADR)
├── diagramas/    arquitectura y flujos del sistema en Mermaid
└── assets/       logotipos, iconos, patrones y recursos sociales
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
    npm run preview  # http://localhost:4321 — sirve el dist/ ya compilado

`npm run preview` no es un lujo: es el único modo de ver en local lo que verá el visitante.
El servidor de desarrollo no compila el HTML igual que el build, así que hay fallos que
sencillamente no se ven en `npm run dev`. Este proyecto se llevó uno —el espacio que
desaparecía antes de un enlace, resuelto con `compressHTML: false` en `astro.config.mjs`— y
se detectó mirando el sitio ya desplegado, que es el peor sitio para enterarse.

Ocupa el mismo puerto que `dev`, así que los dos no corren a la vez. Para levantarlos en
paralelo: `npm run preview -- --port 4322`.

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
- Diagramas de arquitectura y flujos: `docs/diagramas/`

## Licencia

El **código** de este repositorio está bajo licencia MIT — ver `LICENSE`.

Los **textos publicados** en modoparanoia.com no están cubiertos por esa licencia:
todos los derechos reservados. Puedes citar fragmentos breves enlazando al original.

# Guía para agentes

Modo Paranoia es un medio digital de análisis crítico de tecnología en español, con
modelo de ensayo. Este repositorio es el sitio: Astro 7 generando HTML estático que
sirve Cloudflare Pages, con el contenido en Markdown dentro del propio repositorio.

Lee también el `README.md`: explica la arquitectura, el despliegue y por qué los
recursos de marca viven en `docs/assets/` y no en `public/`.

## Ejecutar y comprobar

    npm install
    npm run dev      # http://localhost:4321
    npm run check    # tipos, plantillas .astro y esquemas Zod del contenido
    npm run build
    npm run preview  # sirve el dist/ ya compilado

**`npm run preview` no es opcional antes de dar por buena una plantilla.** El servidor
de desarrollo no compila el HTML igual que el build, así que hay fallos que no se ven
en `npm run dev`. Este proyecto se llevó uno —un espacio que desaparecía antes de un
enlace, en once sitios, incluidas las dos páginas legales— y se detectó en el sitio ya
desplegado. La decisión que lo resolvió está en `docs/adr/0001-compresion-de-html-desactivada.md`.

`npm run check` es la red de seguridad real: valida los esquemas Zod de las colecciones,
así que un artículo con el front matter mal escrito muere ahí y no en producción. La
integración continua corre `check` y `build` en cada *pull request*.

## Reglas que no se rompen

**Contenido** — el esquema vive en `src/content.config.ts`:

- `borrador: true` es el valor por defecto. No se cambia: nada se publica por accidente.
- `titulo` admite 90 caracteres como máximo y `bajada` 180. Son límites duros.
- `fuentes` es un array obligatorio, aunque vaya vacío.
- `imagen` e `imagenAlt` son obligatorios. La imagen se declara con el helper `image()`,
  que valida que el archivo exista y expone sus dimensiones.
- Las etiquetas son texto libre, pero su clave forma la URL. Una etiqueta sin letras ni
  números se rechaza en el esquema.

**Diseño** — la paleta y sus ratios están en `docs/kit-de-marca.html`, y los tokens en
`src/styles/tokens.css`:

- Texto sobre el verde `#00FF66` es **siempre** el ónix `#0D0E12`: 14,23:1. Blanco sobre
  ese verde da 1,36:1 y es ilegible.
- Toda superficie `#1F232B` lleva `border: 1px solid #2C313C`. Sin borde no se separa del
  fondo: 1,21:1.
- El texto principal es `#E8EAF0`, no blanco puro.
- El verde es acento. Nunca fondo de bloques de texto, nunca más del 10% de una pantalla.

**Rendimiento** — el sitio vive de los Core Web Vitals y hoy no envía JavaScript al
navegador:

- Antes de añadir una dependencia que mande JavaScript al cliente, pregúntate si hace
  falta. El TBT de 0 ms sostiene la elección de stack entera.
- Fuentes locales con `@fontsource`, nunca por CDN.
- Imágenes por `astro:assets`, siempre. Una imagen escrita como HTML crudo se queda sin
  optimizar y sin dimensiones, y sin dimensiones no hay defensa contra el CLS.
- La política de seguridad de contenido de `public/_headers` es estricta a propósito. Si
  algo necesita ensancharla, se ensancha **solo la directiva que lo necesita**.

## Estructura

    src/lib/          fuente de verdad de secciones, artículos, etiquetas e iconos
    src/styles/       tokens de diseño y sistema de componentes
    src/layouts/      Base (head, SEO, JSON-LD) y Pagina
    src/components/   cabecera, pie, tarjeta de artículo, suscripción, Icono
    src/content/      artículos y autores en Markdown, con sus imágenes al lado
    src/pages/        rutas del sitio, más el endpoint que genera cada tarjeta social
    public/           lo que se sirve tal cual: favicon, og.png, robots.txt, _headers
    docs/             kit de marca, ADR, diagramas y recursos de marca

Las fechas del front matter se formatean **en UTC**, siempre. `z.coerce.date()` lee una
fecha suelta como medianoche UTC, y pintarla en la zona local la retrasa un día en
cualquier huso al oeste de Greenwich — con el agravante de que el resultado depende de
dónde se compile, así que local y producción discrepan. La decisión está centralizada en
`src/lib/articulos.ts`; no la repliques en un componente.

## Convenciones de Git

- `main` está protegida. El trabajo va en ramas `feat/...` o `fix/...`.
- Commits convencionales: `feat:`, `fix:`, `docs:`, `style:`, `refactor:`, `chore:`.
- Todo entra por *pull request* con descripción, aunque el repositorio tenga un solo autor.

## Dónde está el porqué

- `docs/adr/` — decisiones de arquitectura, con el contexto medido y las alternativas
  descartadas. Incluye una sección propia de este proyecto, «Cómo se verificó»: aquí una
  decisión que no puede decir con qué prueba se comprobó todavía es una intención.
- `docs/diagramas/` — flujos y arquitectura en Mermaid, para que GitHub los dibuje.
- `docs/kit-de-marca.html` — paleta, tipografía, voz y los ratios de contraste.

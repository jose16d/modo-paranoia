# ADR-0004 — La CSP no se abre para los scripts que inyecta Cloudflare

- **Estado:** Aceptado
- **Fecha:** 2026-08-22
- **Afecta a:** `public/_headers` (directiva `script-src`) y la configuración de la zona en
  Cloudflare (Web Analytics apagada)

## Contexto

El sitio **no envía JavaScript propio.** Lo único que hay en una etiqueta `<script>` es el
JSON-LD de `Base.astro`, con `type="application/ld+json"`: es un dato, el navegador no lo
ejecuta y la CSP no le aplica. La cabecera `Content-Security-Policy` de `public/_headers` existe
desde el primer despliegue (commit `26693db`, 16 de agosto de 2026) con `script-src 'self'` y
**sin `'unsafe-inline'`**, para que un script inyectado no se ejecute. Cuando entró el formulario
de El Correo (commit `e1e8f65`, 22 de agosto) se ensanchó solo `form-action` hacia Kit,
precisamente para no tocar `script-src`.

El 22 de agosto de 2026, en la primera medición de PageSpeed tras el lanzamiento, la categoría
**Recomendaciones de escritorio bajó de 100 a 92** por errores en la consola. En un sitio sin
JavaScript propio eso no cuadraba. La causa eran **dos scripts que Cloudflare inserta en las
respuestas HTML**, sin que el sitio los pida:

1. **El beacon de Web Analytics** (`static.cloudflareinsights.com/beacon.min.js`), inyectado por
   tener Web Analytics activada en el proyecto de Pages.
2. **El cargador de JavaScript Detections**, un script en línea que carga lo que hay bajo
   `/cdn-cgi/challenge-platform/`. Es parte de Bot Fight Mode.

**`script-src 'self'` bloqueaba los dos.** La consecuencia grave no era el 92: **la analítica
no había recogido un solo dato desde el lanzamiento.** El panel de Cloudflare la mostraba
activada, y el fallo solo se veía abriendo la consola del navegador.

Dos hechos de Cloudflare acotan las salidas:

- **JavaScript Detections no se puede apagar por separado.** Su
  [documentación](https://developers.cloudflare.com/cloudflare-challenges/challenge-types/javascript-detections/)
  dice que con Bot Fight Mode se activa automáticamente y no se puede desactivar. Recomienda
  *nonces* en la CSP y desaconseja `'unsafe-inline'`.
- **El script en línea cambia en cada respuesta.** Lleva dentro un testigo `r:'…'` que es el
  identificador de la petición, el mismo valor que la cabecera `cf-ray`. Su hash SHA-256 es
  distinto en cada respuesta, así que **ningún hash fijo en la CSP coincidiría nunca.**

## Opciones consideradas

*Las opciones 1, 2 y 3 son las que se evaluaron el 22 de agosto de 2026. La 4, la 5, la 6 y la 7
se añaden al redactar este ADR, el 13 de septiembre de 2026, con la documentación de Cloudflare
de ese día: no consta que se discutieran entonces.*

1. **Abrir `script-src`** al dominio de Cloudflare **y a `'unsafe-inline'`**, que es lo que
   exigen los dos scripts. Descartada: `'unsafe-inline'` vale para todo el sitio, así que
   devuelve a cualquier script inyectado la capacidad de ejecutarse, que es exactamente lo que
   la CSP existe para impedir. Sería abrir un agujero real para recuperar una analítica y una
   puntuación de bots.

2. **Autorizar el script en línea por su hash.** Descartada porque no es posible: el hash cambia
   con cada respuesta (ver Contexto).

3. **Apagar Web Analytics y dejar JavaScript Detections inyectado y bloqueado.** Es la que se
   toma.

4. **Un *nonce* en la CSP**, que es lo que recomienda Cloudflare: lee el nonce de la cabecera y
   lo añade a los scripts que inyecta. El nonce solo protege si es **distinto e imprevisible en
   cada respuesta**, y `public/_headers` es un archivo estático: serviría siempre el mismo, que
   es lo mismo que publicar la contraseña. Generarlo por petición exigiría una función que
   procese cada respuesta HTML, en un sitio cuya arquitectura entera es no ejecutar nada por
   petición, y todo para que corra un script cuyo resultado este plan no usa (ver
   Consecuencias).

5. **Apagar Bot Fight Mode.** Es la única forma documentada de quitar JavaScript Detections
   desde el panel. Descartada: renuncia a la protección contra bots del plan gratuito para
   quitar un error de consola que no afecta al lector.

6. **Enviar `Cache-Control: no-transform` en las respuestas HTML.** Según la misma
   documentación, con esa directiva Cloudflare **no inyecta** JavaScript Detections. **No se
   ha probado:** falta comprobar que Cloudflare trate la cabecera de `_headers` como la del
   origen y que la directiva no desactive otras transformaciones que sí interesan. Queda como
   condición de reapertura, no como opción descartada.

7. **No hacer nada.** Dejar Web Analytics encendida y bloqueada. Descartada porque es pagar la
   inyección de un script sin recibir nada, y porque el proyecto declaraba una analítica que no
   existía.

## Decisión

`script-src` se queda en `'self'`, **sin ninguna excepción para Cloudflare.** Web Analytics se
apaga en el panel y la analítica pasa a ser la **analítica de zona**, que Cloudflare calcula en
su proxy sin JavaScript. El script de JavaScript Detections se deja **inyectado y bloqueado**.

La decisión no cambió ninguna línea de `public/_headers`: lo que se decidió es que la cabecera
**no se toca**. Por eso este ADR existe. Sin él, la próxima persona que vea el error en la
consola va a «arreglarlo» abriendo la CSP.

## Consecuencias

**Lo que se gana.**

- **La CSP sigue siendo una barrera real contra XSS**, sin `'unsafe-inline'` en `script-src`.
- **El sitio sigue sin ejecutar JavaScript de terceros.** El TBT se mantuvo en **0 ms** en
  móvil y escritorio en la medición de PageSpeed del 5 de septiembre de 2026.
- **Una analítica que funciona de verdad.** La de zona da peticiones, visitantes, rutas y países
  aunque el visitante bloquee scripts.

**Lo que se paga.**

- **Se pierde el detalle de Web Analytics:** los referentes y las métricas de campo de Core Web
  Vitals. Las segundas las dará CrUX en PageSpeed cuando haya tráfico suficiente.
- **Un error de CSP en la consola de cada página HTML**, en cada visita, con un hash distinto
  cada vez. Lo ve quien abra las herramientas de desarrollo, no el lector.
- **Las herramientas de medición no coinciden entre sí.** El 22 de agosto, con los dos scripts,
  PageSpeed daba 92 en Recomendaciones de escritorio. El 5 de septiembre, ya solo con
  JavaScript Detections, PageSpeed daba **100** en los dos formatos, mientras un Lighthouse
  local daba **93** por este mismo script. Para comparar contra la línea base, siempre con la
  misma herramienta.
- **Cloudflare no recibe la señal de JavaScript Detections.** El script nunca se ejecuta: no hay
  peticiones a `/cdn-cgi/challenge-platform/` ni cookie `cf_clearance`. Según su documentación,
  exigir que un visitante la supere es una regla de Bot Management para Enterprise, así que en
  este plan el bloqueo no le pone ningún desafío al lector.
- **Las respuestas HTML salen sin `ETag`**, mientras que la hoja de estilos y `robots.txt` sí lo
  llevan. Es coherente con lo que documenta Cloudflare —JavaScript Detections quita el `ETag` de
  las respuestas donde se inyecta—, aunque no se ha aislado apagándolo.
- **Las páginas legales siguieron describiendo Web Analytics** hasta el 5 de septiembre de 2026:
  la decisión se tomó en un panel y nadie releyó `/privacidad` ni `/cookies`. Se corrigieron en
  el commit `520f7cb` (PR #25).

**Lo que la CSP no bloquea, para no sobrestimarla.** `'self'` autoriza cualquier script servido
desde el propio dominio, **incluidos los que Cloudflare sirve bajo `/cdn-cgi/`**. El 13 de
septiembre de 2026, la ofuscación de direcciones de correo de Cloudflare inyectaba
`/cdn-cgi/scripts/…/email-decode.min.js` en `/contacto`, `/privacidad` y `/cookies`, y ese script
**sí se ejecuta**. Lo que esta CSP bloquea es lo que va en línea, no todo lo que añade Cloudflare.

**Qué hay que vigilar.** Tres condiciones comprobables:

1. **Que `Cache-Control: no-transform` quite la inyección** (opción 6). Si se prueba en
   producción y la consola queda limpia sin perder nada más, este ADR queda reemplazado por uno
   nuevo.
2. **Que se encienda cualquier función de Cloudflare que inyecte un script**, como volver a
   activar Web Analytics. Después de activarla se abre la consola **del sitio en producción**:
   un interruptor encendido en el panel no demuestra que la función esté funcionando.
3. **Que el sitio empiece a enviar JavaScript propio.** Si hace falta un script en línea, se
   autoriza por hash o por nonce, **nunca** con `'unsafe-inline'`.

La primera comprobación, sin navegador, es contar el beacon y el cargador en el HTML servido:

```bash
curl -s https://modoparanoia.com/ | grep -c "cloudflareinsights"
curl -s https://modoparanoia.com/ | grep -c "__CF\$cv\$params"
```

Hoy el resultado correcto es **0** y **1**: sin beacon, y con el cargador inyectado y bloqueado.

## Cómo se verificó

**En su momento, el 22 de agosto de 2026**, con PageSpeed: Recomendaciones de escritorio en 92, y
en la consola del sitio desplegado los dos scripts bloqueados por `script-src 'self'`.

**El 5 de septiembre de 2026**, en la línea base de rendimiento: PageSpeed en 100 de
Recomendaciones y **TBT de 0 ms** en móvil y escritorio.

**El 13 de septiembre de 2026, sobre el sitio desplegado:**

- **Consola de Chromium 152** en la portada y en un artículo: **un único error** de CSP por
  página, `Executing inline script violates … 'script-src 'self''`, con un hash distinto en cada
  una. `document.scripts` lista solo el JSON-LD y el cargador. No hay peticiones a
  `/cdn-cgi/challenge-platform/` ni cookie `cf_clearance`.
- **Sin beacon:** `cloudflareinsights` no aparece en la portada, en `/privacidad` ni en un
  artículo.
- **La cabecera servida** es idéntica a la de `public/_headers`.
- **El testigo del script es el `cf-ray`**, y el hash cambia con cada respuesta. Dos peticiones
  seguidas a la portada:

  ```text
  petición 1 | cf-ray: a3a8c447b845433b-MIA | token r: a3a8c447b845433b | sha256-22jqbCIVP4sDwJpoaInuRkrTCAu4xCNs0x3BYTDN/Vw=
  petición 2 | cf-ray: a3a8c448ab2e433b-MIA | token r: a3a8c448ab2e433b | sha256-JVmu2G1ZyQ2tImEAbqFJOSk7G97klOpsC0MnWQplAOM=
  ```

Se reproduce abriendo `node` en cualquier terminal y pegando esto:

```js
(async () => {
  const { createHash } = await import('node:crypto');
  for (let i = 1; i <= 2; i++) {
    const res = await fetch('https://modoparanoia.com/', { headers: { 'user-agent': 'Mozilla/5.0 Chrome/140.0' } });
    const html = await res.text();
    const inyectado = html.match(/<script>([\s\S]*?)<\/script>/)?.[1] ?? '';
    console.log(
      `petición ${i}`,
      '| cf-ray:', res.headers.get('cf-ray'),
      '| token r:', inyectado.match(/r:'([^']*)'/)?.[1],
      '| sha256-' + createHash('sha256').update(inyectado).digest('base64'),
    );
  }
})();
```

**Lo que no se pudo repetir ese día:** PageSpeed. Su API devolvió **429** (cuota diaria anónima
agotada), así que la cifra de Recomendaciones vigente es la del 5 de septiembre.

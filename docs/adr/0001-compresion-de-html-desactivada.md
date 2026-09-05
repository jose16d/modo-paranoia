# ADR-0001 — La compresión de HTML se queda desactivada

- **Estado:** Aceptado
- **Fecha:** 2026-08-16
- **Afecta a:** `astro.config.mjs`, y por extensión toda plantilla `.astro` de `src/pages/`

## Contexto

Astro trae `compressHTML: true` como valor por defecto. Con esa opción activada, **un salto
de línea entre texto y una etiqueta en línea no se colapsa a un espacio: desaparece.**

Todas las plantillas de este repositorio se escriben con las líneas cortadas a unos 95
caracteres, así que el patrón que dispara el fallo es el más común de la casa:

```astro
Para ejercerlos basta con escribir a
<a href={`mailto:${SITIO.correo}`}>{SITIO.correo}</a>.
```

Eso se compilaba como «escribir ahola@modoparanoia.com». Había **once casos** repartidos por
las páginas institucionales, **las dos legales incluidas** — es decir, en las páginas cuyo
único trabajo es decir con precisión cómo ejercer un derecho.

Lo que convierte esto en una decisión de arquitectura y no en una corrección de texto es
**cuándo se manifiesta: solo al compilar.** `npm run dev` no comprime, así que el sitio se ve
perfecto en local y sale mal en producción. No lo encontró ninguna revisión del código: se
descubrió leyendo el sitio ya desplegado.

El diagnóstico inicial además fue **equivocado**. Se atribuyó el fallo a dos mecanismos
sumados —la compresión de Astro y el recorte de espacios de JSX dentro de las expresiones
`{}`— y sobre esa lectura se había parcheado `index.astro` con un `{' '}` explícito. Al
comprobarlo, el salto de línea sobrevive dentro de la expresión en cuanto se desactiva la
compresión: **el mecanismo era uno solo.** El parche se retiró.

## Opciones consideradas

1. **Dejar `compressHTML: true` y no cortar la línea antes de un enlace.** Cuesta cero bytes
   y no requiere tocar nada. Descartada porque es una regla que solo funciona mientras
   alguien la recuerde, en un repositorio que existe para ser mantenido durante años. La
   primera vez que se olvide, el error vuelve a aparecer en producción y otra vez sin avisar.

2. **Dejar `compressHTML: true` y escribir `{' '}` en cada punto afectado.** Descartada por
   dos motivos. El primero es que trata el síntoma once veces en vez de la causa una. El
   segundo es más grave: **ese parche nació de un diagnóstico falso**, y una solución que
   funciona por una razón equivocada no protege del siguiente caso — habría fallado igual en
   el archivo número doce.

3. **Desactivar la compresión.** Es la que se toma.

4. **No hacer nada.** Opción real, y por eso se escribe: el sitio funcionaba, cargaba rápido
   y nadie se había quejado. Descartada porque el texto roto estaba **en las páginas legales
   ya publicadas**, que es exactamente donde una palabra pegada deja de ser cosmética.

## Decisión

`compressHTML: false` en `astro.config.mjs`, con un comentario en el propio archivo que
explica por qué no se debe revertir. Aplicado en el commit `34ba1a9`.

El comentario no es decorativo: la opción desactivada se ve rara sin contexto, y el valor por
defecto de Astro empuja a devolverla a `true` en cuanto alguien pase por ahí buscando bytes.

## Consecuencias

**Lo que se gana.** Desaparece una clase entera de error, no once casos. El fallo era
invisible en desarrollo, aparecía en prosa ya publicada y solo se detectaba leyendo el sitio
en producción con atención — la combinación más cara de encontrar que existe.

**Lo que se paga.** **895 bytes en las 12 páginas después de gzip**, unos 75 bytes por
página. Es el costo real y medido, no una estimación.

**Lo que queda acotado.** Los artículos en Markdown **no estaban afectados**: su HTML se
genera al renderizar y no pasa por el compresor. El problema era exclusivo de los archivos
`.astro`. Conviene tenerlo presente para no buscar el fallo donde nunca estuvo.

**Qué hay que vigilar.** Una sola condición, y es comprobable: **que Astro cambie el
comportamiento del compresor** y pase a colapsar el salto de línea en un espacio en vez de
borrarlo. Se comprueba compilando y mirando el `dist/`, nunca leyendo el registro de cambios
de la dependencia.

**El costo no es la condición de reapertura.** 895 bytes tras gzip no van a cruzar ningún
umbral de rendimiento del proyecto, así que «recuperar esos bytes» no es motivo para reabrir
esto. Queda escrito aquí para que no haga falta volver a discutirlo.

## Cómo se verificó

**Sobre el sitio desplegado, no sobre el panel ni sobre el `dist/` local.** El 17 de agosto de
2026 a las 19:40 UTC se pidieron las seis páginas institucionales en producción y se
comprobaron tres cosas:

1. **Cero textos pegados y cero espacios dobles.** El fallo original y su corrección
   excesiva, buscados a la vez: un arreglo que hubiera metido espacios de más habría pasado
   igual de desapercibido.
2. **El HTML llega sin comprimir.** Es la firma de `compressHTML: false`, y sirve como prueba
   de que la configuración desplegada es la que creemos y no una compilación anterior en
   caché.
3. **El salto de línea sobrevive dentro de una expresión `{}`**, que es lo que descartó el
   segundo mecanismo y permitió retirar el parche `{' '}`.

Para reproducirlo en local hace falta servir el `dist/` ya compilado, no el servidor de
desarrollo:

```bash
npm run build
npm run preview
```

`npm run preview` es el único modo de ver en local lo que verá el visitante. Está documentado
en el [README](../../README.md) por esta misma razón.

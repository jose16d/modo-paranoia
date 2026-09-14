# Registro de cambios

Los cambios del sitio y de su documentación, del más reciente al más antiguo. El formato se
basa en [Keep a Changelog 1.1.0](https://keepachangelog.com/es-ES/1.1.0/), con las categorías
en español.

- **No hay números de versión.** Cada fusión en `main` se despliega en producción, así que no
  existe una «versión» que publicar: las entradas se agrupan por **fecha de fusión**, en hora
  de Colombia (UTC−5), y cada línea enlaza su pull request.
- **Las piezas editoriales no entran.** Publicar un artículo o corregir su texto se ve en el
  propio sitio y en el [RSS](https://modoparanoia.com/rss.xml). Sí entran los cambios en el
  esquema, las plantillas, la configuración y las páginas del sitio, legales incluidas.
- **Se mantiene en el mismo PR del cambio:** cada PR añade su línea bajo la fecha en que se
  fusiona.

## 2026-09-13

### Añadido

- Fechas de publicación y modificación de cada artículo en Open Graph
  (`article:published_time`, `article:modified_time`), y prioridad alta de descarga para la
  imagen principal de la portada. ([#44](https://github.com/jose16d/modo-paranoia/pull/44))
- Nota visible de corrección en los artículos, arriba del texto, y la fecha de actualización
  junto a la de publicación. El campo `correcciones` del esquema exige mover `actualizado`
  con cada corrección. ([#49](https://github.com/jose16d/modo-paranoia/pull/49))
- Archivo de artículos en `/articulos`, que antes daba 404: todas las piezas en una lista por
  año, enlazada desde la cabecera, el pie y la portada. La portada muestra ahora la pieza más
  reciente y las 6 siguientes. ([#51](https://github.com/jose16d/modo-paranoia/pull/51))

### Cambiado

- `/quien-escribe`, `/metodologia`, `/politica-editorial` y el kit de marca dejan de dar por
  hecho un lector colombiano o latinoamericano: la regla de oro pide «un dato verificado sobre
  el terreno» en lugar de «un dato local», y el SENA se explica.
  ([#48](https://github.com/jose16d/modo-paranoia/pull/48))

### Corregido

- Los titulares con palabras largas se salían de la pantalla en teléfonos estrechos y
  obligaban a desplazarse de lado: a 320 px pasaba en 11 de las 30 páginas. Ahora la palabra se
  parte, con guion en móvil. ([#50](https://github.com/jose16d/modo-paranoia/pull/50))
- `/privacidad`, `/cookies` y `/contacto` se ajustan a lo que ocurre de verdad: el formulario
  solo pide el correo, darse de baja no borra el registro en Kit, El Correo mide las aperturas
  y los plazos de respuesta son los de la Ley 1581.
  ([#48](https://github.com/jose16d/modo-paranoia/pull/48))

- La etiqueta de Modo Autopsia en las tarjetas no alcanzaba el contraste AA de WCAG (4,44:1):
  su texto usa ahora una variante aclarada del rojo de alerta (4,96:1).
  ([#45](https://github.com/jose16d/modo-paranoia/pull/45))

### Documentación

- El comentario de la ruta de las tarjetas sociales decía que se generan también para los
  borradores, y en producción no es así.
  ([#50](https://github.com/jose16d/modo-paranoia/pull/50))
- ADR-0002: las fechas legibles se pintan en UTC.
  ([#37](https://github.com/jose16d/modo-paranoia/pull/37))
- ADR-0003: el `<lastmod>` del sitemap se decide URL por URL.
  ([#38](https://github.com/jose16d/modo-paranoia/pull/38))
- ADR-0004: la CSP no se abre para los scripts que inyecta Cloudflare.
  ([#39](https://github.com/jose16d/modo-paranoia/pull/39))
- Diagramas de la arquitectura de contenido y de la cadena de correo.
  ([#41](https://github.com/jose16d/modo-paranoia/pull/41))

### Seguridad

- Astro 7.3.2 y sharp 0.35.4, que corrigen una ejecución remota de código al optimizar
  imágenes AVIF, y las dependencias transitivas `svgo` y `fast-uri` con avisos de seguridad.
  ([#43](https://github.com/jose16d/modo-paranoia/pull/43))

## 2026-09-12

### Eliminado

- El campo `destacado` del esquema de contenido: nada del sitio lo leía.
  ([#36](https://github.com/jose16d/modo-paranoia/pull/36))

### Corregido

- `/privacidad` declara las cláusulas contractuales tipo como mecanismo de transferencia de
  datos a Kit. ([#34](https://github.com/jose16d/modo-paranoia/pull/34))

## 2026-09-06

### Añadido

- La imagen de cada artículo en su tarjeta de portada. `imagen` e `imagenAlt` pasan a ser
  obligatorios en el esquema. ([#31](https://github.com/jose16d/modo-paranoia/pull/31))

### Documentación

- Comentarios del código alineados con el alcance editorial vigente, sin referencias a
  archivos que no están en el repositorio, y `AGENTS.md` reescrito para este proyecto.
  ([#32](https://github.com/jose16d/modo-paranoia/pull/32))

## 2026-09-05

### Añadido

- `<lastmod>` real por URL en el sitemap, solo donde hay una fecha verdadera.
  ([#22](https://github.com/jose16d/modo-paranoia/pull/22))
- Suscripción a El Correo al final de cada artículo, y navegación al artículo anterior y al
  siguiente. ([#28](https://github.com/jose16d/modo-paranoia/pull/28))
- Más jerarquía en la tarjeta principal de la portada, y recuadros editoriales para cifras,
  cláusulas y alertas dentro del texto. ([#29](https://github.com/jose16d/modo-paranoia/pull/29))

### Corregido

- `/privacidad` y `/cookies` describían una analítica que ya estaba apagada, y
  `/politica-editorial` y `/etiquetas` declaraban un alcance editorial anterior.
  ([#25](https://github.com/jose16d/modo-paranoia/pull/25))
- `/cookies` y la portada mencionaban un panel de edición en `/admin` que no existe.
  ([#26](https://github.com/jose16d/modo-paranoia/pull/26))
- Cabecera compacta con navegación horizontal en móvil: los nombres largos de sección se
  partían en vertical. ([#27](https://github.com/jose16d/modo-paranoia/pull/27))

### Documentación

- ADR-0001 y la estructura del registro de decisiones en `docs/adr/`.
  ([#23](https://github.com/jose16d/modo-paranoia/pull/23))
- Diagrama del flujo de publicación. ([#24](https://github.com/jose16d/modo-paranoia/pull/24))
- README con la estructura actual del repositorio, y diagrama del flujo corregido.
  ([#30](https://github.com/jose16d/modo-paranoia/pull/30))

## 2026-09-04

### Eliminado

- La carpeta `.claude/` del repositorio. Lo que documentaba —por qué hay que revisar el build
  con `npm run preview`— pasa al README. ([#20](https://github.com/jose16d/modo-paranoia/pull/20))

## 2026-08-22

### Añadido

- Páginas de etiqueta: `/etiqueta/{clave}` y el índice `/etiquetas`.
  ([#9](https://github.com/jose16d/modo-paranoia/pull/9))
- Tarjeta social de cada artículo, generada al compilar.
  ([#11](https://github.com/jose16d/modo-paranoia/pull/11))
- Formulario de suscripción a El Correo sin JavaScript de terceros, y la página `/gracias`.
  ([#12](https://github.com/jose16d/modo-paranoia/pull/12))
- Pie de foto en los artículos. ([#14](https://github.com/jose16d/modo-paranoia/pull/14))
- **Lanzamiento:** se quita el modo en construcción y el sitio pasa a ser indexable.
  ([#17](https://github.com/jose16d/modo-paranoia/pull/17))

### Cambiado

- La portada y `/politica-editorial` fijan el sábado como día de publicación.
  ([#13](https://github.com/jose16d/modo-paranoia/pull/13))

### Eliminado

- La declaración de uso de IA en cada artículo: es del sitio, y vive en `/metodologia`.
  ([#15](https://github.com/jose16d/modo-paranoia/pull/15))

### Corregido

- Las fechas se pintaban un día antes cuando el sitio se compilaba al oeste de UTC.
  ([#10](https://github.com/jose16d/modo-paranoia/pull/10))

### Documentación

- README sin los componentes que nunca se llegaron a desplegar.
  ([#18](https://github.com/jose16d/modo-paranoia/pull/18))

## 2026-08-21

### Cambiado

- La sección Modo Local se disuelve en una mirada transversal, marcada con etiquetas.
  ([#7](https://github.com/jose16d/modo-paranoia/pull/7))
- `/politica-editorial` y `/quien-escribe` ajustan el ritmo declarado a un ensayo por semana.
  ([#8](https://github.com/jose16d/modo-paranoia/pull/8))

## 2026-08-16

### Añadido

- Sitio inicial en Astro sobre Cloudflare Pages, con la licencia y el kit de marca.
  ([`eaacbc6`](https://github.com/jose16d/modo-paranoia/commit/eaacbc6))
- Finales de línea normalizados a LF con `.gitattributes`.
  ([`277342f`](https://github.com/jose16d/modo-paranoia/commit/277342f))
- Iconografía, logotipos y recursos de marca.
  ([#1](https://github.com/jose16d/modo-paranoia/pull/1))
- Integración continua: tipos, esquemas y build en cada push y pull request.
  ([#2](https://github.com/jose16d/modo-paranoia/pull/2))
- Sitemap, y datos del autor en el JSON-LD.
  ([#3](https://github.com/jose16d/modo-paranoia/pull/3))
- Modo «en construcción»: aviso en todas las páginas y `noindex` mientras el sitio vivía en
  `pages.dev`. ([#5](https://github.com/jose16d/modo-paranoia/pull/5))

### Cambiado

- `/privacidad` y `/cookies`, revisadas, pierden la marca de borrador, y se borra el artículo
  de prueba. ([#4](https://github.com/jose16d/modo-paranoia/pull/4))

### Corregido

- Desaparecía el espacio antes de los enlaces en las páginas institucionales, legales
  incluidas: se desactiva la compresión de HTML. Ver el
  [ADR-0001](docs/adr/0001-compresion-de-html-desactivada.md).
  ([#6](https://github.com/jose16d/modo-paranoia/pull/6))

# Diagramas

Los diagramas de este proyecto se escriben en **Mermaid, dentro del repositorio**, no como
imágenes exportadas.

El motivo es de mantenimiento, no de gusto. Un diagrama en PNG se queda quieto mientras el
sistema que describe cambia, y nadie se entera hasta que alguien lo sigue y no le cuadra. Un
diagrama en texto entra por PR como cualquier otro archivo: se revisa, se le ve el cambio en
el `diff` y vive en el mismo commit que el código que describe.

GitHub renderiza los bloques ` ```mermaid ` directamente en la vista del archivo, así que se
lee sin instalar nada.

## Cómo se comprueba antes de subirlo

Un diagrama con un error de sintaxis **no avisa**: GitHub dibuja un recuadro de error donde
debería estar el gráfico, y solo se ve al abrir la página. `astro check` no lo mira — estos
archivos están fuera de las colecciones de contenido, así que no entran en el build.

La comprobación es abrirlo renderizado antes de fusionar: la vista previa del propio pull
request en GitHub ya lo dibuja, y es el sitio donde conviene mirarlo.

## Índice

| Diagrama | Qué explica |
|---|---|
| [flujo-de-publicacion.md](flujo-de-publicacion.md) | Del cambio en el disco a producción: rama, pull request, CI, fusión y despliegue en Cloudflare Pages. Incluye las tres puertas que pueden parar el cambio y la salida de emergencia cuando Pages se queda mudo |
| [arquitectura-de-contenido.md](arquitectura-de-contenido.md) | Del Markdown a todo lo que se publica: esquema Zod, `obtenerArticulos()`, rutas, tarjeta social, RSS y sitemap. Incluye los dos caminos hacia el mismo archivo y los tres sitios donde se filtra un borrador |
| [cadena-de-correo.md](cadena-de-correo.md) | Las tres cadenas que comparten el dominio: correo entrante por Email Routing, respuestas desde Gmail y El Correo por Kit. Incluye cada registro DNS, por qué DMARC sigue en `p=none` y cómo se comprueba la cadena |

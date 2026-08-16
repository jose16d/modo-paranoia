---
titulo: Por qué existe Modo Paranoia
bajada: >-
  Hay medios de tecnología en español de sobra. Ninguno explica qué significan estas
  tecnologías acá, con nuestra regulación y nuestros sueldos. Ese es el hueco.
seccion: modo-local
autor: jose
fecha: 2026-08-16
etiquetas:
  - manifiesto
destacado: true
borrador: true
fuentes:
  - titulo: "Google Search: políticas de spam — scaled content abuse"
    url: https://developers.google.com/search/docs/essentials/spam-policies
usoIA: >-
  Usé un modelo de lenguaje para generar la posición contraria a este texto y comprobar
  si el argumento se sostenía. El texto final está escrito y reescrito por mí.
---

Este es un artículo de prueba. Sirve para verificar que el modelo de contenido, las
plantillas y el despliegue funcionan de punta a punta.

Está marcado como `borrador: true`, así que **no aparece en producción**: solo se ve
mientras corres `npm run dev`. Ese es el comportamiento correcto y es deliberado — el
esquema pone `borrador` en `true` por defecto para que nada se publique por accidente.

## Cómo publicar de verdad

Cambia `borrador: true` por `borrador: false` en el bloque de arriba, guarda, y haz
`git push`. Cloudflare Pages reconstruye el sitio y la pieza queda publicada.

## Qué revisar en esta página

- Que el color de acento corresponda a la sección.
- Que las fuentes aparezcan numeradas al final.
- Que el bloque de uso de IA se renderice.
- Que el tiempo estimado de lectura tenga sentido.

Cuando todo esto se vea bien, borra este archivo y escribe el primero de verdad.

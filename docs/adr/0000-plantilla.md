# ADR-NNNN — Título en una línea, en presente y sin rodeos

- **Estado:** Propuesto | Aceptado | Reemplazado por ADR-NNNN | Derogado
- **Fecha:** AAAA-MM-DD
- **Afecta a:** `ruta/del/archivo`, `otra/ruta`

## Contexto

Qué problema había, con hechos comprobables: la cifra medida, el error literal, el commit
donde apareció. Si el problema se descubrió por casualidad o después de desplegar, decirlo —
esa es justamente la parte que evita que se repita.

Lo que va aquí es el estado del mundo **antes** de decidir. Sin la solución todavía, y sin
adjetivos: si hace falta convencer al lector con un «claramente», es que falta un dato.

## Opciones consideradas

1. **La opción A.** Qué implicaba y por qué se descartó.
2. **La opción B.** Ídem.
3. **No hacer nada.** Casi siempre es una opción real y casi nunca se escribe. Cuando el
   costo de la solución es alto, esta es la que hay que rebatir.

## Decisión

Qué se hace, en una frase, en presente y en voz activa. El detalle va en las consecuencias;
aquí solo la decisión.

## Consecuencias

**Lo que se gana.** Concreto y, si se puede, medido.

**Lo que se paga.** El costo aceptado, con su cifra. Un ADR sin costo declarado es
sospechoso: casi ninguna decisión de arquitectura sale gratis, y ocultar el precio es lo que
hace que alguien la revierta sin entender qué estaba comprando.

**Qué hay que vigilar.** La condición concreta que obligaría a reabrir esto — un umbral, una
versión de una dependencia, un cambio en un servicio de terceros. Escribir «revisar en el
futuro» no sirve: si no hay una condición que se pueda comprobar, no hay vigilancia.

## Cómo se verificó

La prueba concreta que demuestra que la decisión funcionó: el comando que se corrió, la URL
que se pidió, el número que cambió y en qué dirección. **Comprobado sobre el resultado real
—el sitio desplegado, el `dist/` compilado—, no sobre el panel de control ni sobre la
intención.**

Si la verificación se hizo con una herramienta concreta, nombrarla: dos herramientas
distintas dan números distintos y luego no se pueden comparar.

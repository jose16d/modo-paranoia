# Registro de decisiones de arquitectura (ADR)

Un **ADR** (*Architecture Decision Record*) es un documento corto que deja por escrito una
decisión técnica **y el razonamiento que la sostiene**. No documenta cómo funciona el código
—para eso está el código—, sino **por qué está así y no de otra manera**.

Aquí se registran las decisiones que cumplen al menos una de estas tres condiciones:

1. **Costaron un error real.** Algo se rompió, se diagnosticó y la solución fue una decisión
   de diseño, no un parche.
2. **La opción evidente era la equivocada.** Quien llegue después va a proponer justo lo que
   ya se descartó, y sin el ADR va a tener razón aparente.
3. **Tienen un costo aceptado a cambio de algo.** Si nadie escribe el intercambio, dentro de
   seis meses alguien «optimiza» el costo y se lleva por delante el beneficio.

Lo que **no** va aquí: preferencias de estilo, decisiones reversibles en cinco minutos y
cualquier cosa que se explique sola leyendo el archivo donde vive.

## Formato

Cada ADR es un archivo `NNNN-titulo-en-kebab-case.md` numerado en orden de creación, sin
reutilizar números. La plantilla está en [`0000-plantilla.md`](0000-plantilla.md).

Las secciones son estas, y el orden importa: **el contexto va antes que la decisión** porque
un ADR se lee para entender un problema, no para consultar una conclusión.

| Sección | Qué responde |
|---|---|
| **Estado** | ¿Sigue vigente? |
| **Contexto** | ¿Qué problema había, y qué se midió? |
| **Opciones consideradas** | ¿Qué más se pudo hacer, y por qué no se hizo? |
| **Decisión** | ¿Qué se hizo, en una frase? |
| **Consecuencias** | ¿Qué se ganó, qué se pagó y qué hay que vigilar? |
| **Cómo se verificó** | ¿Con qué prueba se sabe que funcionó? |

**«Cómo se verificó» no es una sección estándar de los ADR: es propia de este proyecto.**
Aquí ninguna decisión se da por buena porque suene razonable, y varias de las que están
registradas se tomaron *después* de que la intuición fallara. Si un ADR no puede decir cómo
se comprobó su decisión, probablemente todavía no es una decisión: es una intención.

## Estados

- **Propuesto** — escrito, aún no aplicado en el código.
- **Aceptado** — vigente. Es el estado normal.
- **Reemplazado por ADR-NNNN** — se cambió de opinión. **El ADR viejo no se borra ni se
  edita**: se marca y se enlaza el nuevo. Un registro que se reescribe deja de ser un
  registro.
- **Derogado** — el problema dejó de existir (se quitó la dependencia, se rehízo el módulo).

## Cómo se añade uno

1. Copiar `0000-plantilla.md` al número siguiente.
2. Escribir el **contexto** primero y con hechos verificables: cifras medidas, mensajes de
   error literales, el commit donde ocurrió. Un contexto escrito de memoria envejece mal.
3. Rellenar el resto. Si «Opciones consideradas» tiene una sola entrada, o no era una
   decisión, o falta pensar.
4. Entra por PR como cualquier otro cambio.

## Índice

| # | Decisión | Estado |
|---|---|---|
| [0001](0001-compresion-de-html-desactivada.md) | La compresión de HTML se queda desactivada | Aceptado |

import { createRequire } from 'node:module';
import { readFile } from 'node:fs/promises';
import satori from 'satori';
import sharp from 'sharp';
import { SECCIONES, SITIO, type ClaveSeccion, type Seccion } from './secciones';

/**
 * Tarjeta social (`og:image`) de cada artículo, generada al compilar.
 *
 * **Por qué generada y no una imagen por pieza.** WhatsApp, LinkedIn, X y Facebook
 * cachean la tarjeta de forma agresiva: la que se sirva el día que se comparte un
 * artículo es la que se queda. Con un ensayo semanal y una sola persona, depender de
 * conseguir y recortar una imagen cada sábado garantiza que tarde o temprano una
 * pieza salga con la tarjeta genérica — y esa es justo la que no se puede corregir
 * después. Generarla del título elimina el paso manual y, de paso, el riesgo de
 * derechos de imagen.
 *
 * **Por qué satori y no un SVG con `<text>`.** Ya está aprendido en este proyecto: un
 * `<svg>` con `<text font-family="Syne">` solo se dibuja bien si Syne está instalada
 * en la máquina que lo dibuja, y no lo está en los rastreadores de las redes. Satori
 * recibe la fuente como buffer y convierte el texto a trazos (`embedFont`, su valor
 * por defecto), así que el resultado no depende de ninguna fuente del sistema. Eso
 * además deja a `sharp` rasterizar un SVG que ya no tiene texto que resolver.
 *
 * **Formato.** PNG de 1200×630. Ninguna red social acepta SVG como `og:image`, y la
 * URL tiene que ser absoluta — de eso se encarga `Base.astro`.
 */

const requerir = createRequire(import.meta.url);

/** Lee un `.woff` de @fontsource. Satori acepta ttf, otf y woff; **woff2 no**. */
async function fuente(especificador: string): Promise<Buffer> {
  return readFile(requerir.resolve(especificador));
}

/**
 * Los tokens de color viven en `src/styles/tokens.css`, pero satori no lee CSS: aquí
 * hacen falta los hexadecimales. El tipo es `Record<Seccion['color'], string>` a
 * propósito — si algún día una sección reclama otro token, la unión crece y
 * TypeScript obliga a añadirlo aquí en vez de dejar la tarjeta sin color.
 */
const HEX: Record<Seccion['color'], string> = {
  '--neon': '#00FF66',
  '--ambar': '#FFB020',
  '--alerta': '#FF5A5F',
};

const ONIX = '#0D0E12';
const TEXTO = '#E8EAF0';
const TEXTO_2 = '#A0A6B3';

/**
 * El titular se encoge por tramos en vez de con una fórmula continua.
 * `titulo` está limitado a 90 caracteres por el esquema, así que el peor caso está
 * acotado y tres tramos lo cubren. Medido sobre tarjetas ya generadas, no estimado:
 * en el ancho útil de 1058px entran ~15 caracteres por línea a 68px y ~24 a 50px, así
 * que el peor caso —90 caracteres a 50px— ocupa cuatro líneas y sobra espacio.
 */
function tamanoTitular(titulo: string): number {
  if (titulo.length <= 40) return 68;
  if (titulo.length <= 65) return 58;
  return 50;
}

export interface DatosTarjeta {
  titulo: string;
  seccion: ClaveSeccion;
}

export async function generarTarjeta({ titulo, seccion }: DatosTarjeta): Promise<Buffer> {
  const meta = SECCIONES[seccion];
  const acento = HEX[meta.color];

  const [syne, grotesk, mono] = await Promise.all([
    fuente('@fontsource/syne/files/syne-latin-800-normal.woff'),
    fuente('@fontsource/space-grotesk/files/space-grotesk-latin-700-normal.woff'),
    fuente('@fontsource/jetbrains-mono/files/jetbrains-mono-latin-400-normal.woff'),
  ]);

  const svg = await satori(
    {
      type: 'div',
      props: {
        style: {
          display: 'flex',
          width: 1200,
          height: 630,
          backgroundColor: ONIX,
        },
        children: [
          // Barra de acento: ~1% de la superficie. La regla del 10% de verde sobra.
          {
            type: 'div',
            props: { style: { width: 14, height: '100%', backgroundColor: acento } },
          },
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                flex: 1,
                padding: 64,
              },
              children: [
                // Sección, en monoespaciada y en el color del formato
                {
                  type: 'div',
                  props: {
                    style: {
                      fontFamily: 'JetBrains Mono',
                      fontSize: 24,
                      letterSpacing: 2,
                      color: acento,
                    },
                    children: meta.nombre.toUpperCase(),
                  },
                },
                // Titular
                {
                  type: 'div',
                  props: {
                    style: {
                      fontFamily: 'Syne',
                      fontSize: tamanoTitular(titulo),
                      lineHeight: 1.12,
                      letterSpacing: -1,
                      color: TEXTO,
                      // Sin esto satori estira el bloque y el titular deja de
                      // apoyarse en el espacio entre la sección y el pie.
                      display: 'flex',
                    },
                    children: titulo,
                  },
                },
                // Pie: marca a la izquierda, dominio a la derecha
                {
                  type: 'div',
                  props: {
                    style: {
                      display: 'flex',
                      alignItems: 'flex-end',
                      justifyContent: 'space-between',
                    },
                    children: [
                      {
                        type: 'div',
                        props: {
                          style: {
                            display: 'flex',
                            fontFamily: 'Space Grotesk',
                            fontSize: 30,
                            letterSpacing: 1,
                          },
                          children: [
                            { type: 'span', props: { style: { color: TEXTO }, children: 'MODO' } },
                            {
                              type: 'span',
                              props: { style: { color: HEX['--neon'] }, children: 'PARANOIA' },
                            },
                          ],
                        },
                      },
                      {
                        type: 'div',
                        props: {
                          style: {
                            fontFamily: 'JetBrains Mono',
                            fontSize: 22,
                            color: TEXTO_2,
                          },
                          children: SITIO.url.replace('https://', ''),
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: 'Syne', data: syne, weight: 800, style: 'normal' },
        { name: 'Space Grotesk', data: grotesk, weight: 700, style: 'normal' },
        { name: 'JetBrains Mono', data: mono, weight: 400, style: 'normal' },
      ],
    },
  );

  return sharp(Buffer.from(svg)).png().toBuffer();
}

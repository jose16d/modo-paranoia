/**
 * Metadatos de las secciones editoriales.
 * La clave debe coincidir exactamente con el enum `secciones` de src/content.config.ts.
 * Si añades una sección, hay que tocar los dos archivos: el esquema valida, esto presenta.
 *
 * Iconos: cada clave necesita un SVG homónimo en `docs/assets/secciones/`
 * (`modo-autopsia` → `docs/assets/secciones/modo-autopsia.svg`). No hay un campo
 * `icono` porque sería repetir la clave; la convención se verifica sola, ya que
 * `astro build` falla si el archivo no existe. Ver src/lib/iconos.ts.
 */
export interface Seccion {
  nombre: string;
  descripcion: string;
  /** Variable CSS del color de acento. Ver src/styles/tokens.css */
  color: '--neon' | '--ambar' | '--alerta' | '--neon-deep';
  ritmo: string;
}

export const SECCIONES = {
  'lo-bueno-lo-malo-lo-feo': {
    nombre: 'Lo bueno, lo malo y lo feo',
    descripcion:
      'Tres actos sobre una tecnología concreta. Lo que promete, lo que cuesta y lo que nadie quiere mirar de frente.',
    color: '--neon',
    ritmo: 'Quincenal',
  },
  'modo-autopsia': {
    nombre: 'Modo Autopsia',
    descripcion:
      'Post-mortem de un producto o una promesa que fracasó. Qué falló, quién lo sabía y por qué el siguiente lo va a repetir.',
    color: '--alerta',
    ritmo: 'Mensual',
  },
  'letra-pequena': {
    nombre: 'Letra pequeña',
    descripcion:
      'Leemos los términos de servicio, el paper o la resolución que nadie lee, y traducimos lo que realmente dicen.',
    color: '--ambar',
    ritmo: 'Mensual',
  },
  'modo-local': {
    nombre: 'Modo Local',
    descripcion:
      'Una tendencia global aterrizada con datos y regulación de Colombia y América Latina.',
    color: '--neon-deep',
    ritmo: 'Quincenal',
  },
} as const satisfies Record<string, Seccion>;

export type ClaveSeccion = keyof typeof SECCIONES;

export const CLAVES_SECCION = Object.keys(SECCIONES) as ClaveSeccion[];

export const SITIO = {
  nombre: 'Modo Paranoia',
  eslogan: 'Tecnología, futuro y paranoia controlada.',
  descripcion:
    'Análisis crítico de la tecnología que viene, antes de que cambie la forma en que vivimos, trabajamos o pensamos.',
  url: 'https://modoparanoia.com',
  correo: 'hola@modoparanoia.com',
  idioma: 'es',
} as const;

/**
 * Interruptor del modo «sitio en construcción».
 *
 * Con `true`, Base.astro hace dos cosas de una vez: pinta el aviso en todas las
 * páginas y declara `noindex`. El aviso es para las personas; el `noindex` es
 * para que Google no se quede con el montaje indexado mientras el sitio vive en
 * `*.pages.dev`. Para lanzar de verdad se pone en `false`: una sola edición
 * apaga las dos cosas, que es justamente el punto de que sea una sola variable.
 *
 * El tipo se anota como `boolean` a propósito. Sin la anotación, TypeScript lo
 * infiere como el literal `true` y da por imposible cualquier rama que cuente
 * con que valga `false`.
 */
export const EN_CONSTRUCCION: boolean = true;

# rem0 · portfolio de Rubén Remacha

Portfolio en Next.js con forma de cajón de carpetas: la carpeta **rem0** es el índice y cada
sección (webs, trayectoria, premios, contacto) es una carpeta que sube desde abajo y se encaja
dentro, con su pestaña encima de la del índice.

## Desarrollo

```bash
npm install
npm run dev
```

Abre http://localhost:3000. En desarrollo aparece el panel **tweaks** (abajo a la derecha) para
cambiar el lema, la forma de las carpetas y los 5 colores. En producción solo sale si añades
`?tweaks` a la URL.

## Publicar en Vercel

1. Sube el repositorio a GitHub.
2. En [vercel.com/new](https://vercel.com/new) importa el repositorio (framework: Next.js, sin
   cambiar nada más).
3. Si usas un dominio propio, añádelo en *Settings → Domains* y define la variable de entorno
   `NEXT_PUBLIC_SITE_URL` (p. ej. `https://rem0.dev`) para que la URL canónica, el sitemap y la
   imagen de compartir apunten a él. Sin ella se usa el dominio de producción de Vercel.

Antes de publicar conviene comprobar la build en local:

```bash
npm run build
npm start
```

## Dónde se cambia cada cosa

| Qué | Dónde |
| --- | --- |
| Textos, proyectos, trayectoria, premios, contacto | `src/lib/data.ts` |
| Título, descripción y URL de la web (SEO) | `src/lib/site.ts` |
| Colores por defecto, lema, forma | `src/components/Providers.tsx` (`defaultTweaks`) y `src/app/globals.css` |
| Capturas de las webs | `public/webs/` |
| Fotos de los premios | `public/premios/` |
| Imagen al compartir el enlace | `src/app/opengraph-image.tsx` |
| Comportamiento del cajón (apilado, pausa entre carpetas) | `src/components/StackLayer.tsx` |

## Cómo funciona el cajón

`StackLayer.tsx` tiene un único controlador (`<Stack>`) que mide todas las carpetas, decide
dónde se pega cada una (todas comparten la línea de su fila de pestañas, `data-stack-nav`) y en
cada frame de scroll calcula cuánto tapa cada carpeta a la anterior y el giro 3D de entrada.
Cada carpeta tiene después un tramo de pausa (`hold`, en % de la pantalla) en el que se queda
quieta antes de que suba la siguiente.

Stack: Next.js 16, React 19, Tailwind CSS 4, Motion y Lenis (scroll suave).

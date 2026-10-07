# DEEPSCAN — sitio web

Sitio de deepscan.com.co en Next.js (App Router), exportado como sitio estático y desplegado en Cloudflare Workers con archivos estáticos (gratis, uso comercial permitido).

## Desarrollo

```bash
npm install
npm run dev   # http://localhost:3100
```

## Estructura

- `app/` — layout, página, metadatos, `robots.txt` y `sitemap.xml`
- `app/globals.css` — estilos del sitio
- `components/markup.ts` — contenido del home (portado de la propuesta HTML; pendiente dividirlo en componentes)
- `components/SiteScripts.tsx` — inicia las interacciones en el cliente
- `lib/site.js` — scroll suave, hero, órbita, formulario, etc.
- `lib/journey.js` — recorrido 3D de "Respaldo oficial" (Three.js)
- `public/assets/` — logos, sellos e imágenes

## Despliegue (Cloudflare Workers)

- Configuración: `wrangler.jsonc` (sirve la carpeta `out/`)
- Comando de build: `npm run build`
- Comando de despliegue: `npx wrangler deploy`
- Despliegue de ramas (preview): `npx wrangler versions upload`

## Formulario de contacto

`worker/index.js` recibe `POST /api/contacto` y crea una fila en la base de Notion **Prospectos web** (estado "Nuevo", con responsable asignado). Necesita el secreto `NOTION_TOKEN` en Cloudflare (Settings → Variables and Secrets); `NOTION_DB_ID` y `NOTION_OWNER_ID` están en `wrangler.jsonc`. Incluye trampa para bots y validación de datos.

Probar en local: `npm run build && npx wrangler dev`.

## Flujo de trabajo

Cada cambio va en una rama → Cloudflare genera un link de preview → se revisa en claro/oscuro y móvil → recién ahí se fusiona a `main`.

## Modo lanzamiento

Lo que aún no tiene dato real está escondido con CSS (bloque "Modo lanzamiento" en `app/globals.css`): fichas de casos, vitrina de anuncios de ejemplo, enlaces "Verificar" y LinkedIn vacíos. Al completar cada dato se quita de esa regla.

El worker redirige las URLs del WordPress anterior (`/servicios/`, `/casos-de-exito/`, `/metodo/`, `/contacto/`, entradas de ejemplo) y `www` → dominio principal. `/panel/` (Hub) se excluye con una ruta de Cloudflare sin worker.

## Antes de producción


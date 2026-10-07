# DEEPSCAN — sitio web

Sitio de deepscan.com.co en Next.js (App Router), desplegado en Vercel.

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

## Flujo de trabajo

Cada cambio va en una rama → Vercel genera un link de preview → se revisa en claro/oscuro y móvil → recién ahí se fusiona a `main`.

## Antes de producción

- Completar los pendientes (botón amarillo "Pendientes" en la página) y quitar ese botón.
- Conectar el formulario de contacto (hoy no envía datos).
- Quitar `window.__lenis` (solo para pruebas).

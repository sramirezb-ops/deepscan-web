// DEEPSCAN — Worker de Cloudflare.
// Sirve el sitio estático (out/) y recibe el formulario de contacto en POST /api/contacto,
// que crea una fila en la base "Prospectos web" de Notion.
//
// Configuración:
//   - NOTION_TOKEN  (secreto, se pone en el panel de Cloudflare; nunca en el repositorio)
//   - NOTION_DB_ID, NOTION_OWNER_ID (variables en wrangler.jsonc)

const INVERSION = [
  'Menos de $20M COP', '$20M – $80M COP', '$80M – $200M COP', 'Más de $200M COP',
  'Menos de US$5K', 'US$5K – US$20K', 'US$20K – US$50K', 'Más de US$50K',
];

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json; charset=utf-8' } });

const clean = (v, max) => String(v ?? '').replace(/\s+/g, ' ').trim().slice(0, max);
const text = (v) => (v ? [{ type: 'text', text: { content: v } }] : []);

async function handleContacto(request, env) {
  // Solo aceptamos envíos desde el propio sitio.
  const origin = request.headers.get('origin');
  if (origin && new URL(origin).host !== new URL(request.url).host) return json({ ok: false, error: 'Origen no permitido.' }, 403);

  let body;
  try { body = await request.json(); } catch { return json({ ok: false, error: 'Datos inválidos.' }, 400); }

  // Trampa para bots: campo oculto que una persona nunca llena.
  if (clean(body.empresa_web, 200)) return json({ ok: true });

  const nombre = clean(body.nombre, 120);
  const correo = clean(body.correo, 160).toLowerCase();
  const telefono = clean(body.telefono, 30);
  const negocio = clean(body.negocio, 160);
  let web = clean(body.web, 300);
  const inversion = INVERSION.includes(body.inversion) ? body.inversion : 'Sin respuesta';
  const paises = clean(body.paises, 200);
  const objetivos = String(body.objetivos ?? '').trim().slice(0, 2000);

  const faltan = [];
  if (!nombre) faltan.push('nombre');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(correo)) faltan.push('correo');
  if (!/^[+\d][\d\s().-]{5,}$/.test(telefono)) faltan.push('teléfono');
  if (!negocio) faltan.push('negocio');
  if (faltan.length) return json({ ok: false, error: `Revisa: ${faltan.join(', ')}.` }, 422);

  if (web && !/^https?:\/\//i.test(web)) web = `https://${web}`;
  try { if (web) new URL(web); } catch { web = ''; }

  if (!env.NOTION_TOKEN || !env.NOTION_DB_ID) return json({ ok: false, error: 'El formulario aún no está conectado.' }, 503);

  const properties = {
    Nombre: { title: text(nombre) },
    Negocio: { rich_text: text(negocio) },
    Correo: { email: correo },
    'Teléfono': { phone_number: telefono },
    'Sitio web': { url: web || null },
    'Inversión mensual': { select: { name: inversion } },
    'Países': { rich_text: text(paises) },
    Objetivos: { rich_text: text(objetivos) },
    Estado: { select: { name: 'Nuevo' } },
    Origen: { select: { name: 'Formulario web' } },
  };
  if (env.NOTION_OWNER_ID) properties.Responsable = { people: [{ id: env.NOTION_OWNER_ID }] };

  const res = await fetch('https://api.notion.com/v1/pages', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.NOTION_TOKEN}`,
      'Notion-Version': '2022-06-28',
      'content-type': 'application/json',
    },
    body: JSON.stringify({ parent: { database_id: env.NOTION_DB_ID }, properties }),
  });

  if (!res.ok) {
    console.error('Notion respondió', res.status, await res.text());
    return json({ ok: false, error: 'No pudimos guardar tu información. Escríbenos por WhatsApp.' }, 502);
  }
  return json({ ok: true });
}

// Páginas del WordPress anterior → su sección en el sitio nuevo (301 para conservar el SEO).
const REDIRECTS = {
  '/servicios/': '/#servicios',
  '/casos-de-exito/': '/#casos',
  '/metodo/': '/#como-trabajamos',
  '/contacto/': '/#contacto',
  '/thank-you/': '/',
  '/hola-mundo/': '/',
};
// Entradas de ejemplo que traía la plantilla de WordPress: se mandan al inicio.
const OLD_DEMO_POSTS = /^\/(creativo-jovenes-a-lead-designers|definitive-guide-to-make-a-daily|the-highly-creative-ui-ux-workflow)[^/]*\/?$/;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // www.deepscan.com.co → deepscan.com.co
    if (url.hostname.startsWith('www.')) {
      url.hostname = url.hostname.slice(4);
      return Response.redirect(url.toString(), 301);
    }

    const path = url.pathname.endsWith('/') ? url.pathname : `${url.pathname}/`;
    if (REDIRECTS[path]) return Response.redirect(new URL(REDIRECTS[path], url.origin).toString(), 301);
    if (OLD_DEMO_POSTS.test(url.pathname)) return Response.redirect(new URL('/', url.origin).toString(), 301);

    if (url.pathname === '/api/contacto') {
      if (request.method !== 'POST') return json({ ok: false, error: 'Método no permitido.' }, 405);
      return handleContacto(request, env);
    }
    return env.ASSETS.fetch(request);
  },
};

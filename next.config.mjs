/** @type {import('next').NextConfig} */
const nextConfig = {
  // Sitio 100% estático: `next build` genera la carpeta `out/` para Cloudflare Pages.
  output: 'export',
  // URLs con barra final, igual que el WordPress anterior (mismas direcciones para Google).
  trailingSlash: true,
  // Las animaciones se inicializan una sola vez; el modo estricto las duplicaría en desarrollo.
  reactStrictMode: false,
};

export default nextConfig;

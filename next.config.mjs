/** @type {import('next').NextConfig} */
const nextConfig = {
  // Sitio 100% estático: `next build` genera la carpeta `out/` para Cloudflare Pages.
  output: 'export',
  // Las animaciones se inicializan una sola vez; el modo estricto las duplicaría en desarrollo.
  reactStrictMode: false,
};

export default nextConfig;

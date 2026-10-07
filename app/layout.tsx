import type { Metadata, Viewport } from 'next';
import './globals.css';

const title = 'DEEPSCAN — Agencia de publicidad digital en Colombia';
const description =
  'Agencia de publicidad digital en Colombia. Creamos anuncios que venden, los publicamos en Meta, Google y TikTok y medimos cuánto vende cada peso invertido.';

export const metadata: Metadata = {
  metadataBase: new URL('https://deepscan.com.co'),
  title,
  description,
  alternates: { canonical: '/' },
  openGraph: { title, description, url: '/', siteName: 'DEEPSCAN', locale: 'es_CO', type: 'website' },
  twitter: { card: 'summary_large_image', title, description },
};

export const viewport: Viewport = { themeColor: '#0a0a0a' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Anton&family=Inter+Tight:wght@400;500;600&family=JetBrains+Mono:wght@400;500&family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&family=Archivo:wght@800&display=swap"
        />
      </head>
      <body className="loading" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}

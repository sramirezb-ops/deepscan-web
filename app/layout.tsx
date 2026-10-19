import type { Metadata, Viewport } from 'next';
import './globals.css';

const title = 'DEEPSCAN | Agencia de marketing y publicidad digital en Colombia';
const description =
  'Agencia de marketing y publicidad digital en Colombia. Creamos anuncios que venden, los publicamos en Meta, Google y TikTok y medimos cuánto vende cada peso invertido.';

export const metadata: Metadata = {
  metadataBase: new URL('https://deepscan.com.co'),
  title,
  description,
  alternates: { canonical: '/' },
  openGraph: {
    title,
    description,
    url: '/',
    siteName: 'DEEPSCAN',
    locale: 'es_CO',
    type: 'website',
    images: [{ url: '/og.jpg', width: 1200, height: 630, alt: 'DEEPSCAN — Generamos ventas usando storytelling' }],
  },
  twitter: { card: 'summary_large_image', title, description, images: ['/og.jpg'] },
};

export const viewport: Viewport = { themeColor: '#0a0a0a' };

// Datos para que Google entienda quiénes somos (nombre, logo, redes, país y contacto).
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  '@id': 'https://deepscan.com.co/#agencia',
  name: 'DEEPSCAN',
  legalName: 'DEEPSCAN SAS',
  url: 'https://deepscan.com.co/',
  logo: 'https://deepscan.com.co/assets/deepscan-logo.png',
  image: 'https://deepscan.com.co/og.jpg',
  description,
  slogan: 'Generamos ventas usando storytelling',
  email: 'info@deepscan.com.co',
  telephone: '+57 321 203 5766',
  address: { '@type': 'PostalAddress', addressCountry: 'CO' },
  areaServed: [{ '@type': 'Country', name: 'Colombia' }, { '@type': 'Country', name: 'México' }],
  knowsAbout: ['Publicidad en Meta', 'Google Ads', 'TikTok Ads', 'Anuncios UGC', 'E-commerce', 'Email marketing', 'Analítica de marketing'],
  sameAs: ['https://www.instagram.com/deepscan_marketing/', 'https://www.tiktok.com/@deepscan0'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* Tipografías del sitio (necesarias al cargar) */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Anton&family=Archivo:wdth,wght@125,800;125,900&family=Inter+Tight:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap"
        />
        {/* Tipografías de la réplica del dashboard: se cargan sin frenar la primera pantalla */}
        <link
          rel="preload"
          as="style"
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&family=Archivo:wght@800&display=swap"
        />
        <link
          rel="stylesheet"
          media="print"
          id="dash-fonts"
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&family=Archivo:wght@800&display=swap"
        />
        <script dangerouslySetInnerHTML={{ __html: "document.getElementById('dash-fonts').media='all'" }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body className="loading" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}

import type { Metadata } from 'next';
import { IBM_Plex_Sans, IBM_Plex_Mono, Sora } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import { ErrorBoundary } from '@/components/ErrorBoundary';

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'IncentEdge',
  url: 'https://incentedge.com',
  logo: 'https://incentedge.com/logo.png',
  description:
    'AI-powered platform for IRA tax credit discovery, application, and monetization.',
  sameAs: ['https://linkedin.com/company/incentedge'],
};

const softwareApplicationSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'IncentEdge',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  url: 'https://incentedge.com',
  offers: {
    '@type': 'Offer',
    price: '299',
    priceCurrency: 'USD',
  },
  description:
    'AI-powered platform for IRA tax credit discovery and monetization',
};

// V41: IBM Plex Sans for body text
const ibmPlexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
});

// V41: IBM Plex Mono for numbers and metrics
const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mono',
  display: 'swap',
});

// V41: Sora for headings
const sora = Sora({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-sora',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://incentedge.com'),
  title: 'IncentEdge | IRA Tax Credit Discovery & Monetization Platform',
  description:
    'AI-powered platform for incentive discovery, application, and monetization. Transform from minority to majority owner with integrated tax credit optimization.',
  keywords: [
    'incentives',
    'tax credits',
    'real estate',
    'clean energy',
    'grants',
    'LIHTC',
    'ITC',
    'PTC',
    'IRA',
    'Inflation Reduction Act',
    '45L',
    '179D',
    '45V',
    '48C',
    '45Q',
  ],
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://incentedge.com',
  },
  openGraph: {
    title: 'IncentEdge | IRA Tax Credit Discovery & Monetization Platform',
    description:
      'AI-powered platform for incentive discovery, application, and monetization. Transform from minority to majority owner with integrated tax credit optimization.',
    url: 'https://incentedge.com',
    siteName: 'IncentEdge',
    type: 'website',
    images: [
      {
        url: 'https://incentedge.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'IncentEdge — IRA Tax Credit Discovery & Monetization Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'IncentEdge | IRA Tax Credit Discovery & Monetization Platform',
    description:
      'AI-powered platform for incentive discovery, application, and monetization. Transform from minority to majority owner with integrated tax credit optimization.',
    images: ['https://incentedge.com/og-image.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* V44: Deep/Teal institutional favicon */}
        <link
          rel="icon"
          type="image/svg+xml"
          href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' rx='6' fill='%23112E3C'/><text x='16' y='22' text-anchor='middle' font-family='system-ui' font-weight='700' font-size='14' fill='%234A99A8'>IE</text></svg>"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationSchema) }}
        />
      </head>
      <body className={`${ibmPlexSans.variable} ${ibmPlexMono.variable} ${sora.variable} font-sans antialiased`}>
        <ErrorBoundary section="App">
          <Providers>{children}</Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}

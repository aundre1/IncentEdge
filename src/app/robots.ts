import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
      },
      {
        userAgent: ['GPTBot', 'Google-Extended', 'PerplexityBot', 'Bytespider', 'CCBot'],
        disallow: '/',
      },
    ],
    sitemap: 'https://incentedge.com/sitemap.xml',
    host: 'https://incentedge.com',
  };
}

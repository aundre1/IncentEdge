import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/', '/(dashboard)/', '/login', '/signup'],
      },
      // Allow AI search crawlers — GEO: these index content for AI-generated answers
      {
        userAgent: 'GPTBot',
        allow: '/',
        disallow: ['/(dashboard)/'],
      },
      {
        userAgent: 'OAI-SearchBot',
        allow: '/',
        disallow: ['/(dashboard)/'],
      },
      {
        userAgent: 'ChatGPT-User',
        allow: '/',
        disallow: ['/(dashboard)/'],
      },
      {
        userAgent: 'ClaudeBot',
        allow: '/',
        disallow: ['/(dashboard)/'],
      },
      {
        userAgent: 'anthropic-ai',
        allow: '/',
        disallow: ['/(dashboard)/'],
      },
      {
        userAgent: 'PerplexityBot',
        allow: '/',
        disallow: ['/(dashboard)/'],
      },
      {
        userAgent: 'Bytespider',
        allow: '/',
        disallow: ['/(dashboard)/'],
      },
      {
        userAgent: 'cohere-ai',
        allow: '/',
        disallow: ['/(dashboard)/'],
      },
      {
        userAgent: 'Google-Extended',
        allow: '/',
        disallow: ['/(dashboard)/'],
      },
      // Block training-only crawlers that don't drive search visibility
      {
        userAgent: 'CCBot',
        disallow: '/',
      },
    ],
    sitemap: 'https://incentedge.com/sitemap.xml',
    host: 'https://incentedge.com',
  };
}

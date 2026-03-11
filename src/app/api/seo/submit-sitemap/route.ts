import { NextResponse } from 'next/server'

export async function POST() {
  const sitemapUrl = encodeURIComponent('https://incentedge.com/sitemap.xml')

  const pings = [
    `https://www.google.com/ping?sitemap=${sitemapUrl}`,
    `https://www.bing.com/ping?sitemap=${sitemapUrl}`,
  ]

  const results = await Promise.allSettled(
    pings.map(url => fetch(url, { method: 'GET' }).then(r => ({ url, status: r.status })))
  )

  return NextResponse.json({
    message: 'Sitemap submitted',
    results: results.map(r =>
      r.status === 'fulfilled' ? r.value : { error: String(r) }
    ),
  })
}

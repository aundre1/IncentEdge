import { NextResponse } from 'next/server'

const INDEXNOW_KEY = process.env.INDEXNOW_KEY || '06e472b05a7f24600f4a07ac7187c38e'
const SITE_URL = 'https://incentedge.com'

const ALL_URLS = [
  '/',
  '/pricing',
  '/incentives',
  '/incentives/federal',
  '/incentives/federal/45l',
  '/incentives/federal/179d',
  '/incentives/federal/itc',
  '/incentives/federal/ptc',
  '/incentives/federal/48c',
  '/incentives/federal/45q',
  '/incentives/federal/45v',
  '/blog',
  '/blog/tax-equity-vs-transferability',
  '/blog/ira-incentive-due-diligence',
  '/blog/prevailing-wage-apprenticeship-requirements',
  '/blog/direct-pay-election',
  '/blog/ira-bonus-adders-explained',
  '/blog/section-45l-guide',
  '/blog/179d-guide',
  '/blog/itc-vs-ptc-comparison',
  '/blog/transferable-tax-credits-guide',
  '/blog/ira-project-finance-incentives',
  '/blog/ira-policy-update-march-2026',
  '/blog/top-10-ira-credits-real-estate',
  '/blog/new-york-clean-energy-incentives',
  '/blog/california-ira-incentives',
  '/blog/lihtc-ira-stacking',
  '/blog/45q-carbon-capture-guide',
  '/blog/45v-clean-hydrogen-guide',
  '/blog/incentedge-api-developer-workflow',
  '/blog/pace-financing-ira-combination',
  '/blog/state-of-ira-incentives-2026',
  '/use-cases',
  '/use-cases/developers',
  '/use-cases/finance-teams',
  '/use-cases/real-estate',
  '/use-cases/clean-energy',
  '/developers',
  '/developers/api',
  '/developers/quickstart',
  '/resources',
  '/resources/ira-guide',
]

export async function POST(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.INDEXNOW_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const urls = ALL_URLS.map(path => `${SITE_URL}${path}`)

  try {
    const response = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        host: 'incentedge.com',
        key: INDEXNOW_KEY,
        keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
        urlList: urls,
      }),
    })

    return NextResponse.json({
      status: response.status,
      submitted: urls.length,
      urls,
    })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    info: 'POST to submit all URLs to IndexNow. Requires Authorization: Bearer header.',
    totalUrls: ALL_URLS.length,
    key: INDEXNOW_KEY,
    keyFile: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
  })
}

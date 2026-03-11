#!/usr/bin/env node
/**
 * Post-deploy SEO verification script
 * Usage: node scripts/verify-seo.mjs [base-url]
 * Default base URL: https://incentedge.com
 */

const BASE_URL = process.argv[2] || 'https://incentedge.com'

const CHECKS = [
  // Critical files
  { url: '/robots.txt', expect: 'text/plain', mustContain: 'Sitemap', name: 'robots.txt exists' },
  { url: '/sitemap.xml', expect: 'text/xml', mustContain: '<urlset', name: 'sitemap.xml exists' },
  { url: '/llms.txt', expect: 'text/plain', mustContain: 'IncentEdge', name: 'llms.txt exists' },

  // Core pages — must NOT have noindex
  { url: '/', noindex: false, name: 'Homepage indexable' },
  { url: '/pricing', noindex: false, name: 'Pricing indexable' },

  // New SEO pages — must return 200
  { url: '/incentives', status: 200, name: '/incentives' },
  { url: '/incentives/federal', status: 200, name: '/incentives/federal' },
  { url: '/incentives/federal/45l', status: 200, name: '/incentives/federal/45l' },
  { url: '/incentives/federal/179d', status: 200, name: '/incentives/federal/179d' },
  { url: '/incentives/federal/itc', status: 200, name: '/incentives/federal/itc' },
  { url: '/incentives/federal/ptc', status: 200, name: '/incentives/federal/ptc' },
  { url: '/incentives/federal/48c', status: 200, name: '/incentives/federal/48c' },
  { url: '/incentives/federal/45q', status: 200, name: '/incentives/federal/45q' },
  { url: '/incentives/federal/45v', status: 200, name: '/incentives/federal/45v' },
  { url: '/blog', status: 200, name: '/blog' },
  { url: '/blog/transferable-tax-credits-guide', status: 200, name: 'Blog: transferable credits' },
  { url: '/blog/ira-bonus-adders-explained', status: 200, name: 'Blog: bonus adders' },
  { url: '/use-cases', status: 200, name: '/use-cases' },
  { url: '/use-cases/developers', status: 200, name: '/use-cases/developers' },
  { url: '/use-cases/finance-teams', status: 200, name: '/use-cases/finance-teams' },
  { url: '/developers', status: 200, name: '/developers' },
  { url: '/developers/api', status: 200, name: '/developers/api' },
  { url: '/resources/ira-guide', status: 200, name: '/resources/ira-guide' },
]

async function run() {
  console.log(`\nSEO Verification: ${BASE_URL}\n${'─'.repeat(50)}`)

  let passed = 0
  let failed = 0
  const failures = []

  for (const check of CHECKS) {
    try {
      const res = await fetch(`${BASE_URL}${check.url}`, { redirect: 'follow' })
      const text = await res.text()

      let ok = true
      let reason = ''

      if (check.status && res.status !== check.status) {
        ok = false
        reason = `Expected ${check.status}, got ${res.status}`
      }
      if (check.mustContain && !text.includes(check.mustContain)) {
        ok = false
        reason = `Missing: "${check.mustContain}"`
      }
      if (check.noindex === false && text.includes('noindex')) {
        ok = false
        reason = 'noindex tag found — page will not be indexed!'
      }

      if (ok) {
        console.log(`  PASS  ${check.name}`)
        passed++
      } else {
        console.log(`  FAIL  ${check.name} — ${reason}`)
        failed++
        failures.push({ check: check.name, reason })
      }
    } catch (e) {
      console.log(`  FAIL  ${check.name} — ${e.message}`)
      failed++
      failures.push({ check: check.name, reason: e.message })
    }
  }

  console.log(`\n${'─'.repeat(50)}`)
  console.log(`Results: ${passed} passed, ${failed} failed`)

  if (failures.length > 0) {
    console.log('\nFailures:')
    failures.forEach(f => console.log(`  - ${f.check}: ${f.reason}`))
    process.exit(1)
  } else {
    console.log('\nAll SEO checks passed!')
  }
}

run().catch(console.error)

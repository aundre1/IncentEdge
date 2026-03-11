import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { PublicPageShell } from '@/components/public/PublicPageShell';

export const metadata: Metadata = {
  title: 'Building an Automated Incentive Discovery Workflow with the IncentEdge API',
  description:
    'Step-by-step guide to automating clean energy incentive discovery using the IncentEdge API. Fetch matched programs, calculate values, and trigger alerts — in Python and JavaScript.',
  alternates: { canonical: 'https://incentedge.com/blog/incentedge-api-developer-workflow' },
  openGraph: {
    title: 'Building an Automated Incentive Discovery Workflow with the IncentEdge API',
    description:
      'Step-by-step guide to automating clean energy incentive discovery using the IncentEdge API in Python and JavaScript.',
    url: 'https://incentedge.com/blog/incentedge-api-developer-workflow',
    siteName: 'IncentEdge',
    type: 'article',
  },
};

const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'TechArticle',
  headline: 'Building an Automated Incentive Discovery Workflow with the IncentEdge API',
  description: 'Developer tutorial for automating incentive discovery with the IncentEdge API.',
  url: 'https://incentedge.com/blog/incentedge-api-developer-workflow',
  author: { '@type': 'Organization', name: 'IncentEdge Research Team' },
  publisher: { '@type': 'Organization', name: 'IncentEdge', url: 'https://incentedge.com' },
  datePublished: '2026-03-01',
  dateModified: '2026-03-11',
  programmingLanguage: ['Python', 'JavaScript'],
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://incentedge.com' },
    { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://incentedge.com/blog' },
    { '@type': 'ListItem', position: 3, name: 'IncentEdge API Developer Workflow', item: 'https://incentedge.com/blog/incentedge-api-developer-workflow' },
  ],
};

export default function APIDevWorkflowPage() {
  return (
    <PublicPageShell breadcrumbs={[{ label: 'Blog', href: '/blog' }, { label: 'API Developer Workflow' }]}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <article className="max-w-3xl mx-auto px-6 py-12">
        <header className="mb-10">
          <div className="inline-flex items-center rounded-full border border-teal-200 dark:border-teal-700 bg-teal-50 dark:bg-teal-900/20 px-3 py-1 text-[12px] text-teal-700 dark:text-teal-300 mb-4">
            Developer Tutorial
          </div>
          <h1 className="font-sora text-4xl font-bold tracking-tight text-deep-900 dark:text-white leading-[1.1] mb-4">
            Automate Incentive Discovery with the IncentEdge API
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-[13px] text-deep-500 dark:text-sage-500 pb-6 border-b border-deep-100 dark:border-deep-800">
            <span>By IncentEdge Research Team</span>
            <span>March 2026</span>
            <span>15 min read</span>
            <span className="px-2 py-0.5 rounded bg-deep-100 dark:bg-deep-800 font-mono text-[11px]">Python + JavaScript</span>
          </div>
        </header>

        <div className="space-y-8 text-[15px] text-deep-700 dark:text-sage-300 leading-relaxed">

          <p className="text-lg text-deep-600 dark:text-sage-400 leading-relaxed">
            If you are building a project finance platform, a development pipeline tool, or a customer-facing application for clean energy or real estate, you should not be hardcoding incentive data. The IncentEdge API provides programmatic access to 217,000+ incentive programs with real-time matching, calculated values, and webhook alerts for new programs — so your users always see the current incentive landscape for their projects.
          </p>

          {/* What You Will Build */}
          <section>
            <h2 className="font-sora text-2xl font-bold text-deep-900 dark:text-deep-100 mb-4">
              What You Will Build
            </h2>
            <p className="mb-4">
              In this tutorial, you will build a complete automated incentive discovery workflow that:
            </p>
            <ul className="space-y-2 ml-4">
              {[
                'Authenticates with the IncentEdge API using your API key',
                'Submits a project for matching against 217,000+ incentive programs',
                'Parses the matched programs response and calculates total incentive value',
                'Builds a simple summary dashboard output',
                'Sets up a webhook to receive alerts when new programs match your project criteria',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-[14px]">
                  <span className="w-5 h-5 rounded-full bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 flex items-center justify-center flex-shrink-0 mt-0.5 text-[10px] font-bold">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </section>

          {/* Step 1: API Key Setup */}
          <section>
            <h2 className="font-sora text-2xl font-bold text-deep-900 dark:text-deep-100 mb-4">
              Step 1: API Key Setup
            </h2>
            <p className="mb-4">
              Get your API key from your IncentEdge dashboard at <code className="px-1.5 py-0.5 rounded bg-deep-100 dark:bg-deep-800 font-mono text-[13px] text-teal-600 dark:text-teal-400">app.incentedge.com/settings/api</code>. Store it as an environment variable — never hardcode API keys in source code.
            </p>

            <div className="rounded-xl bg-deep-950 dark:bg-deep-900 border border-deep-800 overflow-hidden mb-4">
              <div className="flex items-center justify-between px-4 py-2 border-b border-deep-800">
                <span className="text-[12px] font-mono text-sage-400">.env</span>
              </div>
              <pre className="px-5 py-4 text-[13px] font-mono text-teal-300 overflow-x-auto">
                <code>{`INCENTEDGE_API_KEY=your_api_key_here
INCENTEDGE_BASE_URL=https://api.incentedge.com/v1`}</code>
              </pre>
            </div>

            <p className="text-[14px] text-deep-600 dark:text-sage-400">
              All API requests are authenticated using the <code className="px-1 py-0.5 rounded bg-deep-100 dark:bg-deep-800 font-mono text-[12px]">Authorization: Bearer YOUR_KEY</code> header. Rate limits: 100 requests/minute on Starter plans, 1,000/minute on Professional, unlimited on Enterprise.
            </p>
          </section>

          {/* Step 2: Project Matching */}
          <section>
            <h2 className="font-sora text-2xl font-bold text-deep-900 dark:text-deep-100 mb-4">
              Step 2: Submit a Project for Matching
            </h2>
            <p className="mb-4">
              The <code className="px-1.5 py-0.5 rounded bg-deep-100 dark:bg-deep-800 font-mono text-[13px] text-teal-600 dark:text-teal-400">POST /projects/match</code> endpoint is the core of the IncentEdge API. Submit your project details and receive a list of matched incentive programs with calculated values.
            </p>

            <div className="rounded-xl bg-deep-950 dark:bg-deep-900 border border-deep-800 overflow-hidden mb-4">
              <div className="flex items-center justify-between px-4 py-2 border-b border-deep-800">
                <span className="text-[12px] font-mono text-sage-400">Python</span>
              </div>
              <pre className="px-5 py-4 text-[13px] font-mono text-teal-300 overflow-x-auto leading-relaxed">
                <code>{`import os
import httpx

API_KEY = os.environ["INCENTEDGE_API_KEY"]
BASE_URL = os.environ["INCENTEDGE_BASE_URL"]

def match_project(project_data: dict) -> dict:
    response = httpx.post(
        f"{BASE_URL}/projects/match",
        headers={"Authorization": f"Bearer {API_KEY}"},
        json=project_data,
        timeout=30.0,
    )
    response.raise_for_status()
    return response.json()

project = {
    "project_type": "solar_pv",
    "technology": "solar",
    "capacity_kw": 500,
    "location": {
        "address": "123 Main St",
        "city": "Albany",
        "state": "NY",
        "zip": "12207",
    },
    "owner_type": "for_profit",
    "sector": "commercial",
    "construction_start": "2026-06-01",
    "prevailing_wage": True,
    "domestic_content": True,
}

result = match_project(project)
print(f"Found {len(result['programs'])} matching programs")
print(f"Total estimated value: \${result['total_value']:,.0f}")`}</code>
              </pre>
            </div>

            <div className="rounded-xl bg-deep-950 dark:bg-deep-900 border border-deep-800 overflow-hidden mb-4">
              <div className="flex items-center justify-between px-4 py-2 border-b border-deep-800">
                <span className="text-[12px] font-mono text-sage-400">JavaScript / Node.js</span>
              </div>
              <pre className="px-5 py-4 text-[13px] font-mono text-teal-300 overflow-x-auto leading-relaxed">
                <code>{`const API_KEY = process.env.INCENTEDGE_API_KEY;
const BASE_URL = process.env.INCENTEDGE_BASE_URL;

async function matchProject(projectData) {
  const response = await fetch(\`\${BASE_URL}/projects/match\`, {
    method: 'POST',
    headers: {
      'Authorization': \`Bearer \${API_KEY}\`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(projectData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(\`API error: \${error.message}\`);
  }

  return response.json();
}

const project = {
  project_type: 'solar_pv',
  technology: 'solar',
  capacity_kw: 500,
  location: { city: 'Albany', state: 'NY', zip: '12207' },
  owner_type: 'for_profit',
  prevailing_wage: true,
  domestic_content: true,
};

const result = await matchProject(project);
console.log(\`Found \${result.programs.length} programs\`);
console.log(\`Total value: \$\${result.total_value.toLocaleString()}\`);`}</code>
              </pre>
            </div>
          </section>

          {/* Step 3: Parsing Results */}
          <section>
            <h2 className="font-sora text-2xl font-bold text-deep-900 dark:text-deep-100 mb-4">
              Step 3: Parsing the Results
            </h2>
            <p className="mb-4">
              The matching endpoint returns a structured JSON response. Here is the response schema and how to work with it:
            </p>

            <div className="rounded-xl bg-deep-950 dark:bg-deep-900 border border-deep-800 overflow-hidden mb-4">
              <div className="flex items-center justify-between px-4 py-2 border-b border-deep-800">
                <span className="text-[12px] font-mono text-sage-400">Response Schema (JSON)</span>
              </div>
              <pre className="px-5 py-4 text-[13px] font-mono text-teal-300 overflow-x-auto leading-relaxed">
                <code>{`{
  "project_id": "proj_abc123",
  "total_value": 892000,
  "programs": [
    {
      "id": "prog_itc_federal",
      "name": "Investment Tax Credit (ITC)",
      "code": "48/48E",
      "jurisdiction": "federal",
      "program_type": "tax_credit",
      "estimated_value": 750000,
      "credit_rate": 0.40,
      "transferable": true,
      "direct_pay_eligible": false,
      "confidence": 0.97,
      "requirements": [
        "Prevailing wage compliance",
        "Energy community siting verified"
      ],
      "documentation": [
        "Form 3468",
        "Form 3800"
      ],
      "deadline": null
    },
    {
      "id": "prog_ny_sun",
      "name": "NY-Sun Incentive Program",
      "jurisdiction": "state_ny",
      "program_type": "grant",
      "estimated_value": 75000,
      "unit": "per_watt",
      "rate": 0.15,
      "confidence": 0.89
    }
  ],
  "metadata": {
    "matched_at": "2026-03-11T10:30:00Z",
    "programs_scanned": 217423,
    "scan_duration_ms": 847
  }
}`}</code>
              </pre>
            </div>

            <div className="rounded-xl bg-deep-950 dark:bg-deep-900 border border-deep-800 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 border-b border-deep-800">
                <span className="text-[12px] font-mono text-sage-400">Python — Parse and summarize results</span>
              </div>
              <pre className="px-5 py-4 text-[13px] font-mono text-teal-300 overflow-x-auto leading-relaxed">
                <code>{`def summarize_incentives(result: dict) -> None:
    programs = result["programs"]

    # Group by jurisdiction
    by_jurisdiction = {}
    for prog in programs:
        j = prog["jurisdiction"]
        by_jurisdiction.setdefault(j, []).append(prog)

    print(f"\\nIncentive Stack Summary")
    print(f"{'='*40}")
    print(f"Total estimated value: \${result['total_value']:,.0f}")
    print(f"Programs matched: {len(programs)}")
    print(f"Programs scanned: {result['metadata']['programs_scanned']:,}")

    for jurisdiction, progs in by_jurisdiction.items():
        subtotal = sum(p["estimated_value"] for p in progs)
        print(f"\\n{jurisdiction.upper()}: \${subtotal:,.0f}")
        for prog in sorted(progs, key=lambda p: -p["estimated_value"]):
            transferable = " [transferable]" if prog.get("transferable") else ""
            print(f"  {prog['name']}: \${prog['estimated_value']:,.0f}{transferable}")

summarize_incentives(result)`}</code>
              </pre>
            </div>
          </section>

          {/* Step 4: Webhooks */}
          <section>
            <h2 className="font-sora text-2xl font-bold text-deep-900 dark:text-deep-100 mb-4">
              Step 4: Setting Up Webhooks for New Programs
            </h2>
            <p className="mb-4">
              The IncentEdge webhook system notifies your application whenever new incentive programs are added that match your saved project criteria. Register a webhook endpoint using the <code className="px-1.5 py-0.5 rounded bg-deep-100 dark:bg-deep-800 font-mono text-[13px]">POST /webhooks</code> endpoint.
            </p>

            <div className="rounded-xl bg-deep-950 dark:bg-deep-900 border border-deep-800 overflow-hidden mb-4">
              <div className="flex items-center justify-between px-4 py-2 border-b border-deep-800">
                <span className="text-[12px] font-mono text-sage-400">JavaScript — Register webhook + handler</span>
              </div>
              <pre className="px-5 py-4 text-[13px] font-mono text-teal-300 overflow-x-auto leading-relaxed">
                <code>{`// Register webhook
async function registerWebhook(projectId, callbackUrl) {
  const response = await fetch(\`\${BASE_URL}/webhooks\`, {
    method: 'POST',
    headers: {
      'Authorization': \`Bearer \${API_KEY}\`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      project_id: projectId,
      url: callbackUrl,
      events: ['new_program_matched', 'program_value_changed'],
    }),
  });
  return response.json();
}

// Express.js webhook handler
import express from 'express';
import crypto from 'crypto';

const app = express();
app.use(express.raw({ type: 'application/json' }));

app.post('/webhooks/incentedge', (req, res) => {
  // Verify webhook signature
  const signature = req.headers['x-incentedge-signature'];
  const expectedSig = crypto
    .createHmac('sha256', process.env.WEBHOOK_SECRET)
    .update(req.body)
    .digest('hex');

  if (signature !== \`sha256=\${expectedSig}\`) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  const event = JSON.parse(req.body.toString());

  if (event.type === 'new_program_matched') {
    const { program, project_id, estimated_value } = event.data;
    console.log(\`New program for \${project_id}: \${program.name} (\$\${estimated_value})\`);
    // Trigger your notification workflow here
  }

  res.json({ received: true });
});`}</code>
              </pre>
            </div>
          </section>

          {/* API Reference Summary */}
          <section>
            <h2 className="font-sora text-2xl font-bold text-deep-900 dark:text-deep-100 mb-4">
              Key API Endpoints Reference
            </h2>
            <div className="overflow-x-auto rounded-xl border border-deep-100 dark:border-deep-800">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="bg-deep-50 dark:bg-deep-800/50 border-b border-deep-100 dark:border-deep-700">
                    <th className="text-left px-4 py-3 font-semibold text-deep-700 dark:text-deep-300">Endpoint</th>
                    <th className="text-left px-4 py-3 font-semibold text-deep-700 dark:text-deep-300">Method</th>
                    <th className="text-left px-4 py-3 font-semibold text-deep-700 dark:text-deep-300">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-deep-100 dark:divide-deep-800">
                  {[
                    { endpoint: '/projects/match', method: 'POST', desc: 'Match a project against all 217K+ incentive programs' },
                    { endpoint: '/projects/{id}', method: 'GET', desc: 'Retrieve a previously matched project and results' },
                    { endpoint: '/programs', method: 'GET', desc: 'Browse all programs with filtering (state, type, sector)' },
                    { endpoint: '/programs/{id}', method: 'GET', desc: 'Get full details for a specific incentive program' },
                    { endpoint: '/webhooks', method: 'POST', desc: 'Register a webhook for project alerts' },
                    { endpoint: '/webhooks', method: 'GET', desc: 'List all registered webhooks' },
                    { endpoint: '/reports/{project_id}', method: 'GET', desc: 'Generate a formatted PDF/JSON report for a project' },
                  ].map((row) => (
                    <tr key={row.endpoint} className="hover:bg-deep-50/50 dark:hover:bg-deep-800/30">
                      <td className="px-4 py-3 font-mono text-teal-600 dark:text-teal-400">{row.endpoint}</td>
                      <td className="px-4 py-3 font-mono text-deep-500 dark:text-sage-500">{row.method}</td>
                      <td className="px-4 py-3 text-deep-600 dark:text-sage-400">{row.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* CTA */}
          <div className="rounded-xl bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-900/10 dark:to-emerald-900/10 border border-teal-100 dark:border-teal-800 p-8 text-center">
            <h3 className="font-sora text-xl font-bold text-deep-900 dark:text-deep-100 mb-2">
              Get your API key — free to start
            </h3>
            <p className="text-deep-600 dark:text-sage-400 mb-6 text-[14px] max-w-md mx-auto">
              Access 217,000+ programs via REST API. Build incentive discovery into your platform in under an hour.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-[14px] font-semibold transition-colors"
            >
              Get API access free
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Related Articles */}
          <div className="pt-6 border-t border-deep-100 dark:border-deep-800">
            <h3 className="font-sora text-lg font-bold text-deep-900 dark:text-deep-100 mb-4">Related Articles</h3>
            <div className="grid gap-3 md:grid-cols-3">
              {[
                { title: 'IncentEdge Developer Hub', href: '/developers' },
                { title: 'API Reference Documentation', href: '/api-docs' },
                { title: 'IRA Tax Credit Resources Hub', href: '/resources' },
              ].map((a) => (
                <Link key={a.href} href={a.href} className="block p-4 rounded-lg border border-deep-100 dark:border-deep-800 hover:border-teal-200 dark:hover:border-teal-700 transition-colors group">
                  <p className="text-[13px] font-medium text-deep-900 dark:text-deep-100 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors leading-snug">{a.title}</p>
                  <span className="inline-flex items-center gap-1 text-[12px] text-teal-600 dark:text-teal-400 mt-2">View <ArrowRight className="w-3 h-3" /></span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </article>
    </PublicPageShell>
  );
}

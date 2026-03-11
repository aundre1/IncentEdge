import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Terminal } from 'lucide-react';
import { PublicPageShell } from '@/components/public/PublicPageShell';

export const metadata: Metadata = {
  title: 'IncentEdge API Reference | REST API Docs',
  description:
    'Complete REST API reference for IncentEdge. Endpoints for program search, project matching, compliance tracking, and incentive calculations.',
  alternates: {
    canonical: 'https://incentedge.com/developers/api',
  },
  openGraph: {
    title: 'IncentEdge API Reference | REST API Docs',
    description:
      'Complete REST API reference for IncentEdge. Endpoints for program search, project matching, compliance tracking, and incentive calculations.',
    url: 'https://incentedge.com/developers/api',
    siteName: 'IncentEdge',
    type: 'website',
  },
};

const techArticleSchema = {
  '@context': 'https://schema.org',
  '@type': 'TechArticle',
  headline: 'IncentEdge API Reference',
  description:
    'Complete REST API reference for IncentEdge incentive platform. All endpoints documented with request parameters and response schemas.',
  url: 'https://incentedge.com/developers/api',
  publisher: {
    '@type': 'Organization',
    name: 'IncentEdge',
    url: 'https://incentedge.com',
  },
};

interface Endpoint {
  method: 'GET' | 'POST';
  path: string;
  title: string;
  description: string;
  params?: { name: string; type: string; required: boolean; desc: string }[];
  requestBody?: string;
  responseBody: string;
}

const endpoints: Endpoint[] = [
  {
    method: 'GET',
    path: '/programs',
    title: 'List Programs',
    description: 'Returns a paginated list of all incentive programs. Supports filtering by state, type, technology, and keyword.',
    params: [
      { name: 'state', type: 'string', required: false, desc: 'Two-letter state code (e.g. NY, CA)' },
      { name: 'type', type: 'string', required: false, desc: 'Program type: federal | state | local | utility' },
      { name: 'technology', type: 'string', required: false, desc: 'Technology category: solar | wind | storage | hydrogen' },
      { name: 'q', type: 'string', required: false, desc: 'Keyword search across name and description' },
      { name: 'limit', type: 'integer', required: false, desc: 'Results per page (default: 20, max: 100)' },
      { name: 'offset', type: 'integer', required: false, desc: 'Pagination offset (default: 0)' },
    ],
    responseBody: `{
  "programs": [
    {
      "id": "prog_abc123",
      "name": "NY-SUN Megawatt Block Program",
      "type": "state",
      "state": "NY",
      "technology": ["solar"],
      "estimatedValue": "$0.20/W",
      "deadline": "2025-12-31",
      "url": "https://nysun.com/..."
    }
  ],
  "total": 1847,
  "limit": 20,
  "offset": 0
}`,
  },
  {
    method: 'POST',
    path: '/programs/match',
    title: 'Match Programs to a Project',
    description: 'Returns a ranked list of incentive programs matching the project parameters. This is the primary endpoint for project-level incentive analysis.',
    requestBody: `{
  "projectType": "solar",       // Required: technology type
  "state": "NY",                // Required: two-letter state code
  "capacity": 5000,             // Optional: capacity in kW
  "projectSize": "commercial",  // Optional: residential | commercial | utility
  "includeBonus": true          // Optional: include IRA bonus adders
}`,
    responseBody: `{
  "programs": [
    {
      "id": "prog_itc_fed",
      "name": "Investment Tax Credit (ITC)",
      "jurisdiction": "Federal",
      "estimatedValue": "$450,000",
      "creditRate": "30%",
      "bonusAdders": ["energy_community", "domestic_content"],
      "eligibilityScore": 0.95
    }
  ],
  "totalValue": "$890,000",
  "programCount": 12
}`,
  },
  {
    method: 'GET',
    path: '/programs/{id}',
    title: 'Get Program Details',
    description: 'Returns full details for a specific program including eligibility requirements, application process, deadlines, and related programs.',
    params: [
      { name: 'id', type: 'string', required: true, desc: 'Program ID from the list or match endpoints' },
    ],
    responseBody: `{
  "id": "prog_itc_fed",
  "name": "Investment Tax Credit (ITC)",
  "type": "federal",
  "creditCode": "Sec. 48",
  "baseRate": 0.30,
  "bonusAdders": {
    "energyCommunity": 0.10,
    "domesticContent": 0.10,
    "lowIncome": 0.20
  },
  "eligibilityRequirements": [...],
  "applicationUrl": "https://irs.gov/...",
  "deadline": null,
  "updatedAt": "2025-11-01T00:00:00Z"
}`,
  },
  {
    method: 'POST',
    path: '/calculate',
    title: 'Calculate Incentive Value',
    description: 'Calculates the estimated dollar value of a specific incentive program for a given project. Accounts for bonus adders, prevailing wage, and project-specific factors.',
    requestBody: `{
  "programId": "prog_itc_fed",
  "projectCost": 1500000,
  "state": "NY",
  "capacity": 5000,
  "qualifiesForBonus": {
    "energyCommunity": true,
    "domesticContent": false,
    "lowIncome": false
  }
}`,
    responseBody: `{
  "programId": "prog_itc_fed",
  "baseCredit": 450000,
  "bonusCredit": 150000,
  "totalCredit": 600000,
  "effectiveRate": 0.40,
  "breakdown": {
    "base": 0.30,
    "energyCommunityBonus": 0.10
  }
}`,
  },
  {
    method: 'GET',
    path: '/programs/federal',
    title: 'List Federal Programs',
    description: 'Returns all federal incentive programs. Subset of /programs filtered to federal jurisdiction. Supports same query parameters.',
    params: [
      { name: 'technology', type: 'string', required: false, desc: 'Filter by technology category' },
      { name: 'limit', type: 'integer', required: false, desc: 'Results per page (default: 20, max: 100)' },
    ],
    responseBody: `{
  "programs": [...],
  "total": 47,
  "limit": 20,
  "offset": 0
}`,
  },
  {
    method: 'GET',
    path: '/programs/state/{state}',
    title: 'List State Programs',
    description: 'Returns all incentive programs for a specific state. Includes state, utility, and local programs for that state.',
    params: [
      { name: 'state', type: 'string', required: true, desc: 'Two-letter state code (e.g. NY, CA, TX)' },
      { name: 'technology', type: 'string', required: false, desc: 'Filter by technology category' },
    ],
    responseBody: `{
  "state": "NY",
  "stateName": "New York",
  "programs": [...],
  "total": 234,
  "limit": 20,
  "offset": 0
}`,
  },
];

function MethodBadge({ method }: { method: 'GET' | 'POST' }) {
  const colors = {
    GET: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
    POST: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-bold ${colors[method]}`}
    >
      {method}
    </span>
  );
}

export default function DevelopersApiPage() {
  return (
    <PublicPageShell
      breadcrumbs={[
        { label: 'Developer Hub', href: '/developers' },
        { label: 'API Reference' },
      ]}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(techArticleSchema) }}
      />

      {/* Header */}
      <section className="max-w-[1200px] mx-auto px-6 pt-16 pb-10">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-teal-100 dark:bg-teal-900/30">
                <Terminal className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              </div>
              <div>
                <h1 className="font-sora text-3xl md:text-4xl font-bold text-deep-900 dark:text-white">
                  API Reference
                </h1>
                <p className="text-[12px] font-mono text-teal-600 dark:text-teal-400 mt-0.5">
                  Base URL: https://api.incentedge.com/v1
                </p>
              </div>
            </div>
            <p className="text-deep-500 dark:text-sage-400 max-w-2xl">
              All endpoints accept and return JSON. Authenticate with a Bearer token in the{' '}
              <code className="font-mono text-[12px] bg-deep-100 dark:bg-deep-800 px-1.5 py-0.5 rounded text-teal-600 dark:text-teal-400">
                Authorization
              </code>{' '}
              header. 429 status indicates rate limit exceeded.
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/developers/quickstart"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-600 text-white text-[13px] font-semibold hover:bg-teal-700 transition-colors"
            >
              Quick Start
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Endpoints */}
      <section className="max-w-[1200px] mx-auto px-6 pb-20">
        <div className="space-y-10">
          {endpoints.map((ep) => (
            <div
              key={`${ep.method}-${ep.path}`}
              id={ep.path.replace(/\//g, '-').replace(/[{}]/g, '')}
              className="rounded-xl border border-deep-100 dark:border-deep-800 bg-white dark:bg-deep-900 overflow-hidden"
            >
              {/* Endpoint Header */}
              <div className="flex items-center gap-3 px-6 py-4 border-b border-deep-100 dark:border-deep-800 bg-deep-50/50 dark:bg-deep-900/80">
                <MethodBadge method={ep.method} />
                <code className="font-mono text-[14px] font-semibold text-deep-900 dark:text-deep-100">
                  {ep.path}
                </code>
                <span className="text-deep-400 dark:text-sage-600 text-[13px] ml-auto hidden sm:block">
                  {ep.title}
                </span>
              </div>

              <div className="p-6">
                <p className="text-[14px] text-deep-600 dark:text-sage-400 mb-6 leading-relaxed">
                  {ep.description}
                </p>

                {/* Parameters */}
                {ep.params && ep.params.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-[11px] font-semibold uppercase tracking-widest text-deep-400 dark:text-sage-600 mb-3">
                      {ep.method === 'GET' ? 'Query Parameters' : 'Path Parameters'}
                    </h3>
                    <div className="overflow-hidden rounded-lg border border-deep-100 dark:border-deep-800">
                      <table className="w-full text-[12px]">
                        <thead>
                          <tr className="border-b border-deep-100 dark:border-deep-800 bg-deep-50 dark:bg-deep-900">
                            <th className="text-left px-4 py-2.5 font-semibold text-deep-600 dark:text-sage-400">Name</th>
                            <th className="text-left px-4 py-2.5 font-semibold text-deep-600 dark:text-sage-400">Type</th>
                            <th className="text-left px-4 py-2.5 font-semibold text-deep-600 dark:text-sage-400">Required</th>
                            <th className="text-left px-4 py-2.5 font-semibold text-deep-600 dark:text-sage-400">Description</th>
                          </tr>
                        </thead>
                        <tbody>
                          {ep.params.map((param, i) => (
                            <tr
                              key={param.name}
                              className={i < ep.params!.length - 1 ? 'border-b border-deep-100 dark:border-deep-800' : ''}
                            >
                              <td className="px-4 py-2.5 font-mono font-semibold text-teal-600 dark:text-teal-400">
                                {param.name}
                              </td>
                              <td className="px-4 py-2.5 font-mono text-deep-500 dark:text-sage-500">
                                {param.type}
                              </td>
                              <td className="px-4 py-2.5">
                                <span
                                  className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                                    param.required
                                      ? 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                                      : 'bg-deep-100 dark:bg-deep-800 text-deep-500 dark:text-sage-500'
                                  }`}
                                >
                                  {param.required ? 'required' : 'optional'}
                                </span>
                              </td>
                              <td className="px-4 py-2.5 text-deep-600 dark:text-sage-400">
                                {param.desc}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Request Body */}
                  {ep.requestBody && (
                    <div>
                      <h3 className="text-[11px] font-semibold uppercase tracking-widest text-deep-400 dark:text-sage-600 mb-2">
                        Request Body
                      </h3>
                      <div className="rounded-lg bg-deep-900 dark:bg-deep-950 border border-deep-800 overflow-hidden">
                        <pre className="overflow-x-auto p-4 text-[12px] font-mono leading-relaxed text-sage-300">
                          <code>{ep.requestBody}</code>
                        </pre>
                      </div>
                    </div>
                  )}

                  {/* Response */}
                  <div className={ep.requestBody ? '' : 'md:col-span-2'}>
                    <h3 className="text-[11px] font-semibold uppercase tracking-widest text-deep-400 dark:text-sage-600 mb-2">
                      Response (200 OK)
                    </h3>
                    <div className="rounded-lg bg-deep-900 dark:bg-deep-950 border border-deep-800 overflow-hidden">
                      <pre className="overflow-x-auto p-4 text-[12px] font-mono leading-relaxed text-sage-300">
                        <code>{ep.responseBody}</code>
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Error Codes */}
      <section className="border-t border-deep-100 dark:border-deep-800 bg-deep-50/50 dark:bg-deep-900/30">
        <div className="max-w-[1200px] mx-auto px-6 py-12">
          <h2 className="font-sora text-xl font-bold text-deep-900 dark:text-deep-100 mb-4">
            Error Codes
          </h2>
          <div className="overflow-hidden rounded-xl border border-deep-100 dark:border-deep-800">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-deep-100 dark:border-deep-800 bg-deep-50 dark:bg-deep-900">
                  <th className="text-left px-4 py-3 font-semibold text-deep-600 dark:text-sage-400">Status</th>
                  <th className="text-left px-4 py-3 font-semibold text-deep-600 dark:text-sage-400">Meaning</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { code: '200', desc: 'Success' },
                  { code: '400', desc: 'Bad request — check request body or query parameters' },
                  { code: '401', desc: 'Unauthorized — API key missing or invalid' },
                  { code: '403', desc: 'Forbidden — endpoint not available on your plan' },
                  { code: '404', desc: 'Not found — program ID does not exist' },
                  { code: '429', desc: 'Rate limit exceeded — slow down requests' },
                  { code: '500', desc: 'Server error — retry with exponential backoff' },
                ].map((row, i, arr) => (
                  <tr
                    key={row.code}
                    className={`${i < arr.length - 1 ? 'border-b border-deep-100 dark:border-deep-800' : ''} bg-white dark:bg-deep-900`}
                  >
                    <td className="px-4 py-3 font-mono font-semibold text-teal-600 dark:text-teal-400">
                      {row.code}
                    </td>
                    <td className="px-4 py-3 text-deep-600 dark:text-sage-400">{row.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-deep-100 dark:border-deep-800">
        <div className="max-w-[1200px] mx-auto px-6 py-14 text-center">
          <h2 className="font-sora text-2xl font-bold text-deep-900 dark:text-deep-100 mb-3">
            Ready to build?
          </h2>
          <p className="text-deep-500 dark:text-sage-400 mb-7 max-w-lg mx-auto">
            Get your API key in minutes. Full access on Pro plan with 14-day free trial.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-teal-600 text-white text-[14px] font-semibold hover:bg-teal-700 transition-colors"
            >
              Get API Key
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/developers/quickstart"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-deep-200 dark:border-deep-700 text-deep-700 dark:text-sage-300 text-[14px] font-semibold hover:bg-deep-50 dark:hover:bg-deep-800 transition-colors"
            >
              Quick Start Guide
            </Link>
          </div>
        </div>
      </section>
    </PublicPageShell>
  );
}

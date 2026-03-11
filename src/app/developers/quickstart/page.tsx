import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, Terminal } from 'lucide-react';
import { PublicPageShell } from '@/components/public/PublicPageShell';

export const metadata: Metadata = {
  title: 'IncentEdge API Quick Start Guide | Get Your First Results in 5 Minutes',
  description:
    'Set up the IncentEdge API in minutes. Get your API key, make your first call, and retrieve matched incentive programs for your clean energy project.',
  alternates: {
    canonical: 'https://incentedge.com/developers/quickstart',
  },
  openGraph: {
    title: 'IncentEdge API Quick Start Guide | Get Your First Results in 5 Minutes',
    description:
      'Set up the IncentEdge API in minutes. Get your API key, make your first call, and retrieve matched incentive programs for your clean energy project.',
    url: 'https://incentedge.com/developers/quickstart',
    siteName: 'IncentEdge',
    type: 'website',
  },
};

const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'IncentEdge API Quick Start Guide',
  description:
    'Get your IncentEdge API key and retrieve matched incentive programs for a clean energy project in 5 minutes.',
  totalTime: 'PT5M',
  step: [
    {
      '@type': 'HowToStep',
      position: 1,
      name: 'Create an account and get your API key',
      text: 'Sign up at incentedge.com/signup and navigate to Settings > API Keys to generate your Bearer token.',
    },
    {
      '@type': 'HowToStep',
      position: 2,
      name: 'Make your first API call',
      text: 'POST to https://api.incentedge.com/v1/programs/match with projectType, state, and capacity.',
    },
    {
      '@type': 'HowToStep',
      position: 3,
      name: 'Parse the response',
      text: 'The API returns a JSON object with a programs array and totalValue. Each program includes name, estimatedValue, and eligibility criteria.',
    },
    {
      '@type': 'HowToStep',
      position: 4,
      name: 'Filter by program type',
      text: 'Use the type query parameter on GET /programs to filter by federal, state, local, or utility programs.',
    },
    {
      '@type': 'HowToStep',
      position: 5,
      name: 'Build a real use case',
      text: 'Integrate the match endpoint into your project finance model to automatically populate incentive values for any project.',
    },
  ],
};

interface Step {
  number: number;
  title: string;
  description: string;
  tabs: { label: string; code: string; lang: string }[];
  note?: string;
}

const steps: Step[] = [
  {
    number: 1,
    title: 'Create an account and get your API key',
    description:
      'Sign up for an IncentEdge Pro or Enterprise account. After signup, navigate to Settings > API Keys and generate a new Bearer token. Copy it — you\'ll use it in every request.',
    tabs: [
      {
        label: 'Dashboard',
        lang: 'text',
        code: `1. Go to incentedge.com/signup
2. Complete registration
3. Navigate to Settings > API Keys
4. Click "Generate New Key"
5. Copy your Bearer token`,
      },
    ],
    note: 'Keep your API key secret. Never commit it to version control. Use environment variables.',
  },
  {
    number: 2,
    title: 'Make your first API call',
    description:
      'POST to /v1/programs/match with your project details. The endpoint returns a ranked list of matching programs with estimated values.',
    tabs: [
      {
        label: 'curl',
        lang: 'bash',
        code: `curl -X POST https://api.incentedge.com/v1/programs/match \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "projectType": "solar",
    "state": "NY",
    "capacity": 5000
  }'`,
      },
      {
        label: 'JavaScript',
        lang: 'javascript',
        code: `const response = await fetch('https://api.incentedge.com/v1/programs/match', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    projectType: 'solar',
    state: 'NY',
    capacity: 5000,
  }),
});

const data = await response.json();
console.log(data);`,
      },
      {
        label: 'Python',
        lang: 'python',
        code: `import requests

response = requests.post(
    'https://api.incentedge.com/v1/programs/match',
    headers={
        'Authorization': 'Bearer YOUR_API_KEY',
        'Content-Type': 'application/json',
    },
    json={
        'projectType': 'solar',
        'state': 'NY',
        'capacity': 5000,
    }
)

data = response.json()
print(data)`,
      },
    ],
  },
  {
    number: 3,
    title: 'Parse the response',
    description:
      'The response is a JSON object with a programs array and a totalValue. Each program has a name, estimatedValue, creditRate, eligibilityScore, and application URL.',
    tabs: [
      {
        label: 'JavaScript',
        lang: 'javascript',
        code: `const { programs, totalValue, programCount } = data;

console.log(\`Found \${programCount} programs\`);
console.log(\`Total estimated value: \${totalValue}\`);

// Iterate over programs
programs.forEach(program => {
  console.log(\`\${program.name}: \${program.estimatedValue}\`);
  console.log(\`  Eligibility score: \${program.eligibilityScore}\`);
  console.log(\`  Apply: \${program.applicationUrl}\`);
});`,
      },
      {
        label: 'Python',
        lang: 'python',
        code: `programs = data['programs']
total_value = data['totalValue']

print(f"Found {len(programs)} programs")
print(f"Total estimated value: {total_value}")

for program in programs:
    print(f"{program['name']}: {program['estimatedValue']}")
    print(f"  Eligibility score: {program['eligibilityScore']}")`,
      },
    ],
  },
  {
    number: 4,
    title: 'Filter by program type',
    description:
      'Use the type query parameter to narrow results. Combine with technology and state filters for precise matching.',
    tabs: [
      {
        label: 'curl',
        lang: 'bash',
        code: `# Federal programs only
curl "https://api.incentedge.com/v1/programs/federal?technology=solar" \\
  -H "Authorization: Bearer YOUR_API_KEY"

# State programs for New York
curl "https://api.incentedge.com/v1/programs/state/NY?technology=solar" \\
  -H "Authorization: Bearer YOUR_API_KEY"

# Full program list with filters
curl "https://api.incentedge.com/v1/programs?type=state&state=NY&technology=wind" \\
  -H "Authorization: Bearer YOUR_API_KEY"`,
      },
      {
        label: 'JavaScript',
        lang: 'javascript',
        code: `// Federal programs for solar
const federal = await fetch(
  'https://api.incentedge.com/v1/programs/federal?technology=solar',
  { headers: { 'Authorization': 'Bearer YOUR_API_KEY' } }
).then(r => r.json());

// NY state programs
const nyPrograms = await fetch(
  'https://api.incentedge.com/v1/programs/state/NY',
  { headers: { 'Authorization': 'Bearer YOUR_API_KEY' } }
).then(r => r.json());

console.log(\`Federal: \${federal.total} programs\`);
console.log(\`NY State: \${nyPrograms.total} programs\`);`,
      },
    ],
  },
  {
    number: 5,
    title: 'Build a real use case',
    description:
      'Integrate the match endpoint into a project finance model that automatically populates incentive values. Here\'s a complete example that fetches and summarizes incentives for any project.',
    tabs: [
      {
        label: 'JavaScript',
        lang: 'javascript',
        code: `async function getProjectIncentives(project) {
  const API_KEY = process.env.INCENTEDGE_API_KEY;

  const response = await fetch(
    'https://api.incentedge.com/v1/programs/match',
    {
      method: 'POST',
      headers: {
        'Authorization': \`Bearer \${API_KEY}\`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        projectType: project.type,
        state: project.state,
        capacity: project.capacityKW,
        includeBonus: true,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(\`API error: \${response.status}\`);
  }

  const { programs, totalValue } = await response.json();

  return {
    programCount: programs.length,
    totalEstimatedValue: totalValue,
    topProgram: programs[0],
    allPrograms: programs,
  };
}

// Example usage
const result = await getProjectIncentives({
  type: 'solar',
  state: 'CA',
  capacityKW: 10000,
});

console.log(\`Project qualifies for \${result.programCount} programs\`);
console.log(\`Total value: \${result.totalEstimatedValue}\`);`,
      },
      {
        label: 'Python',
        lang: 'python',
        code: `import os
import requests

def get_project_incentives(project_type, state, capacity_kw):
    api_key = os.environ['INCENTEDGE_API_KEY']

    response = requests.post(
        'https://api.incentedge.com/v1/programs/match',
        headers={
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json',
        },
        json={
            'projectType': project_type,
            'state': state,
            'capacity': capacity_kw,
            'includeBonus': True,
        }
    )

    response.raise_for_status()
    data = response.json()

    return {
        'program_count': len(data['programs']),
        'total_value': data['totalValue'],
        'programs': data['programs'],
    }

# Example usage
result = get_project_incentives('solar', 'CA', 10000)
print(f"Found {result['program_count']} programs")
print(f"Total value: {result['total_value']}")`,
      },
    ],
  },
];

export default function DevelopersQuickstartPage() {
  return (
    <PublicPageShell
      breadcrumbs={[
        { label: 'Developer Hub', href: '/developers' },
        { label: 'Quick Start' },
      ]}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />

      {/* Header */}
      <section className="max-w-[1200px] mx-auto px-6 pt-16 pb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-teal-100 dark:bg-teal-900/30">
            <Terminal className="w-5 h-5 text-teal-600 dark:text-teal-400" />
          </div>
          <div>
            <h1 className="font-sora text-3xl md:text-4xl font-bold text-deep-900 dark:text-white">
              Quick Start Guide
            </h1>
            <p className="text-[12px] text-deep-500 dark:text-sage-400 mt-0.5">
              Get your first incentive results in under 5 minutes
            </p>
          </div>
        </div>
        <p className="text-deep-500 dark:text-sage-400 max-w-2xl">
          This guide walks you through creating an account, getting your API key, and retrieving
          matched incentive programs for your first project. Examples in curl, JavaScript, and Python.
        </p>
      </section>

      {/* Steps */}
      <section className="max-w-[1200px] mx-auto px-6 pb-20">
        <div className="space-y-10">
          {steps.map((step) => (
            <div
              key={step.number}
              id={`step-${step.number}`}
              className="rounded-xl border border-deep-100 dark:border-deep-800 bg-white dark:bg-deep-900 overflow-hidden"
            >
              {/* Step Header */}
              <div className="flex items-center gap-4 px-6 py-4 border-b border-deep-100 dark:border-deep-800 bg-deep-50/50 dark:bg-deep-900/80">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-teal-600 text-white font-mono font-bold text-sm flex-shrink-0">
                  {step.number}
                </div>
                <h2 className="font-sora font-bold text-[16px] text-deep-900 dark:text-deep-100">
                  {step.title}
                </h2>
                <div className="ml-auto">
                  <CheckCircle2 className="w-5 h-5 text-deep-200 dark:text-deep-700" />
                </div>
              </div>

              <div className="p-6">
                <p className="text-[14px] text-deep-600 dark:text-sage-400 mb-6 leading-relaxed">
                  {step.description}
                </p>

                {/* Code Tabs */}
                <div className="space-y-4">
                  {step.tabs.length === 1 ? (
                    <div className="rounded-xl bg-deep-900 dark:bg-deep-950 border border-deep-800 overflow-hidden">
                      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-deep-800">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                        <span className="ml-2 text-[11px] font-mono text-sage-600">
                          {step.tabs[0].label}
                        </span>
                      </div>
                      <pre className="overflow-x-auto p-5 text-[12px] font-mono leading-relaxed text-sage-300">
                        <code>{step.tabs[0].code}</code>
                      </pre>
                    </div>
                  ) : (
                    <div>
                      {/* Multi-tab — render all with label headers */}
                      <div className="grid gap-4">
                        {step.tabs.map((tab) => (
                          <div
                            key={tab.label}
                            className="rounded-xl bg-deep-900 dark:bg-deep-950 border border-deep-800 overflow-hidden"
                          >
                            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-deep-800">
                              <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                              <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                              <span className="ml-2 text-[11px] font-mono text-sage-600">
                                {tab.label}
                              </span>
                            </div>
                            <pre className="overflow-x-auto p-5 text-[12px] font-mono leading-relaxed text-sage-300">
                              <code>{tab.code}</code>
                            </pre>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {step.note && (
                  <div className="mt-4 flex items-start gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800">
                    <span className="text-amber-500 flex-shrink-0 mt-0.5">!</span>
                    <p className="text-[12px] text-amber-700 dark:text-amber-300">{step.note}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Next Steps */}
      <section className="border-t border-deep-100 dark:border-deep-800 bg-deep-50/50 dark:bg-deep-900/30">
        <div className="max-w-[1200px] mx-auto px-6 py-14">
          <h2 className="font-sora text-2xl font-bold text-deep-900 dark:text-deep-100 mb-6">
            Next Steps
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              {
                title: 'Full API Reference',
                description: 'All endpoints, parameters, and response schemas.',
                href: '/developers/api',
              },
              {
                title: 'Developer Hub',
                description: 'Authentication, rate limits, webhooks, and SDKs.',
                href: '/developers',
              },
              {
                title: 'Use Cases for Developers',
                description: 'What you can build with the IncentEdge API.',
                href: '/use-cases/developers',
              },
            ].map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="group flex items-center justify-between p-5 rounded-xl border border-deep-100 dark:border-deep-800 bg-white dark:bg-deep-900 hover:border-teal-200 dark:hover:border-teal-700 hover:shadow-md transition-all"
              >
                <div>
                  <div className="font-semibold text-deep-900 dark:text-deep-100 mb-1">
                    {item.title}
                  </div>
                  <div className="text-[12px] text-deep-500 dark:text-sage-400">
                    {item.description}
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-teal-500 ml-3 flex-shrink-0 group-hover:translate-x-1 transition-transform" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-deep-100 dark:border-deep-800">
        <div className="max-w-[1200px] mx-auto px-6 py-14 text-center">
          <h2 className="font-sora text-2xl font-bold text-deep-900 dark:text-deep-100 mb-3">
            Get your API key now
          </h2>
          <p className="text-deep-500 dark:text-sage-400 mb-7 max-w-md mx-auto">
            Pro plan includes full API access with 5,000 requests/min. 14-day free trial.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg bg-teal-600 text-white text-[14px] font-semibold hover:bg-teal-700 transition-colors"
          >
            Start Free Trial
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </PublicPageShell>
  );
}

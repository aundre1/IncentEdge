import { Metadata } from 'next';
import { PrintButton } from '@/components/ui/print-button';

export const metadata: Metadata = {
  title: 'Privacy Policy | IncentEdge',
  description: 'IncentEdge Privacy Policy - Learn how we collect, use, and protect your personal information.',
};

export default function PrivacyPolicyPage() {
  const lastUpdated = 'January 19, 2026';
  const effectiveDate = 'January 19, 2026';

  return (
    <div className="space-y-8">
      {/* Title Section */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Privacy Policy</h1>
          <p className="mt-2 text-muted-foreground">
            Last Updated: {lastUpdated} | Effective Date: {effectiveDate}
          </p>
        </div>
        <div className="no-print">
          <PrintButton />
        </div>
      </div>

      {/* Table of Contents */}
      <nav className="rounded-lg border bg-muted/30 p-6 no-print">
        <h2 className="mb-4 text-lg font-semibold">Table of Contents</h2>
        <ol className="grid gap-2 text-sm md:grid-cols-2">
          {[
            { id: 'introduction', title: '1. Introduction' },
            { id: 'information-we-collect', title: '2. Information We Collect' },
            { id: 'how-we-use', title: '3. How We Use Your Information' },
            { id: 'how-we-share', title: '4. How We Share Your Information' },
            { id: 'data-retention', title: '5. Data Retention' },
            { id: 'your-rights', title: '6. Your Rights and Choices' },
            { id: 'data-security', title: '7. Data Security' },
            { id: 'international-transfers', title: '8. International Data Transfers' },
            { id: 'childrens-privacy', title: "9. Children's Privacy" },
            { id: 'third-party-links', title: '10. Third-Party Links' },
            { id: 'cookies', title: '11. Cookies and Tracking' },
            { id: 'changes', title: '12. Changes to This Policy' },
            { id: 'contact', title: '13. Contact Us' },
          ].map((item) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className="text-primary hover:underline"
              >
                {item.title}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      {/* Policy Content */}
      <article className="prose prose-slate dark:prose-invert max-w-none">
        {/* Section 1: Introduction */}
        <section id="introduction" className="scroll-mt-24">
          <h2 className="text-2xl font-bold">1. Introduction</h2>
          <p>
            Welcome to IncentEdge. This Privacy Policy explains how AoRa Development LLC,
            doing business as IncentEdge (&quot;IncentEdge,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;),
            collects, uses, discloses, and protects your personal information when you use
            our AI-powered incentive discovery platform and related services (collectively,
            the &quot;Service&quot;).
          </p>
          <p>
            This Privacy Policy applies to information we collect through our website at
            incentedge.com, our web application, and any other services, features, or
            content we offer.
          </p>
          <p>
            By using our Service, you agree to the collection and use of information in
            accordance with this Privacy Policy. If you do not agree with our policies
            and practices, please do not use our Service.
          </p>
          <div className="rounded-lg border bg-muted/30 p-4 text-sm not-prose">
            <p className="font-semibold">Contact Information:</p>
            <p>AoRa Development LLC dba IncentEdge</p>
            <p>Email: <a href="mailto:privacy@incentedge.com" className="text-primary hover:underline">privacy@incentedge.com</a></p>
          </div>
        </section>

        {/* Section 2: Information We Collect */}
        <section id="information-we-collect" className="mt-12 scroll-mt-24">
          <h2 className="text-2xl font-bold">2. Information We Collect</h2>

          <h3 className="text-xl font-semibold">2.1 Information You Provide</h3>
          <p>We collect information you voluntarily provide to us, including:</p>
          <ul>
            <li>
              <strong>Account Registration:</strong> Name, email address, password,
              organization name, job title, and professional contact information.
            </li>
            <li>
              <strong>Project Data:</strong> Property addresses, building types, project
              specifications, financial details, construction timelines, and other
              information about real estate development projects you submit for
              incentive matching.
            </li>
            <li>
              <strong>Payment Information:</strong> When you subscribe to paid services,
              payment information is collected and processed by our payment processor,
              Stripe. We do not store complete credit card numbers on our servers.
            </li>
            <li>
              <strong>Communications:</strong> Information you provide when contacting
              our support team, responding to surveys, or participating in promotional
              activities.
            </li>
          </ul>

          <h3 className="text-xl font-semibold">2.2 Information Collected Automatically</h3>
          <p>When you access or use our Service, we automatically collect:</p>
          <ul>
            <li>
              <strong>Usage Data:</strong> Pages visited, features used, search queries,
              incentive programs viewed, reports generated, and interaction patterns
              within the platform.
            </li>
            <li>
              <strong>Device Information:</strong> Browser type and version, operating
              system, device type, screen resolution, and device identifiers.
            </li>
            <li>
              <strong>Log Data:</strong> IP address, access times, referring URLs, and
              pages viewed before and after using our Service.
            </li>
            <li>
              <strong>Location Information:</strong> Approximate geographic location
              based on IP address (city/region level, not precise location).
            </li>
            <li>
              <strong>Cookies and Similar Technologies:</strong> As described in
              Section 11 below.
            </li>
          </ul>

          <h3 className="text-xl font-semibold">2.3 Information from Third Parties</h3>
          <p>We may receive information from other sources, including:</p>
          <ul>
            <li>
              <strong>OAuth Providers:</strong> If you choose to sign in using Google,
              GitHub, or other OAuth providers, we receive basic profile information
              (name, email) from those services.
            </li>
            <li>
              <strong>Public Records:</strong> We access publicly available information
              about incentive programs, tax credits, grants, and regulatory requirements
              from government sources to provide our matching services.
            </li>
            <li>
              <strong>Business Partners:</strong> We may receive information from partners
              who refer users to our Service or integrate with our platform.
            </li>
          </ul>
        </section>

        {/* Section 3: How We Use Your Information */}
        <section id="how-we-use" className="mt-12 scroll-mt-24">
          <h2 className="text-2xl font-bold">3. How We Use Your Information</h2>
          <p>We use the information we collect for the following purposes:</p>
          <ul>
            <li>
              <strong>Provide and Improve the Service:</strong> To operate our platform,
              process incentive matching requests, generate reports, and continuously
              improve our algorithms and user experience.
            </li>
            <li>
              <strong>Process Transactions:</strong> To manage subscriptions, process
              payments, and maintain billing records.
            </li>
            <li>
              <strong>Communications:</strong> To send transactional emails (account
              confirmations, password resets), service notifications (new incentive
              matches, deadline reminders), and marketing communications (with your
              consent).
            </li>
            <li>
              <strong>Analytics and Research:</strong> To analyze usage patterns, measure
              performance, identify trends, and conduct research to improve our services.
            </li>
            <li>
              <strong>Security and Fraud Prevention:</strong> To detect, prevent, and
              respond to security incidents, fraudulent activity, and violations of our
              terms of service.
            </li>
            <li>
              <strong>Legal Compliance:</strong> To comply with applicable laws,
              regulations, legal processes, and governmental requests.
            </li>
            <li>
              <strong>AI Model Improvement:</strong> We may use anonymized and aggregated
              data to train and improve our AI models. Individual project data is not
              used for model training without explicit consent.
            </li>
          </ul>
        </section>

        {/* Section 4: How We Share Your Information */}
        <section id="how-we-share" className="mt-12 scroll-mt-24">
          <h2 className="text-2xl font-bold">4. How We Share Your Information</h2>
          <p>We may share your information in the following circumstances:</p>

          <h3 className="text-xl font-semibold">4.1 Service Providers</h3>
          <p>
            We share information with third-party service providers who perform services
            on our behalf:
          </p>
          <ul>
            <li><strong>Supabase:</strong> Database hosting and authentication services</li>
            <li><strong>Anthropic:</strong> AI processing for incentive matching and analysis</li>
            <li><strong>Stripe:</strong> Payment processing</li>
            <li><strong>Vercel:</strong> Website and application hosting</li>
            <li><strong>Analytics providers:</strong> Usage analytics and performance monitoring</li>
          </ul>
          <p>
            These providers are contractually obligated to protect your information and
            use it only for the services they provide to us.
          </p>

          <h3 className="text-xl font-semibold">4.2 With Your Consent</h3>
          <p>
            We may share your information with third parties when you explicitly consent
            or direct us to do so, such as when sharing project data with application
            assistance partners.
          </p>

          <h3 className="text-xl font-semibold">4.3 Legal Requirements</h3>
          <p>
            We may disclose your information if required to do so by law or in response
            to valid requests by public authorities (e.g., court orders, subpoenas,
            government investigations).
          </p>

          <h3 className="text-xl font-semibold">4.4 Business Transfers</h3>
          <p>
            If IncentEdge is involved in a merger, acquisition, asset sale, or bankruptcy,
            your information may be transferred as part of that transaction. We will
            provide notice before your information is subject to a different privacy policy.
          </p>

          <div className="rounded-lg border-2 border-primary/20 bg-primary/5 p-4 not-prose">
            <p className="font-bold text-primary">
              We Do NOT Sell Your Personal Information
            </p>
            <p className="mt-2 text-sm">
              IncentEdge does not sell, rent, or trade your personal information to
              third parties for their marketing purposes. This applies to all users,
              including California residents under the CCPA.
            </p>
          </div>
        </section>

        {/* Section 5: Data Retention */}
        <section id="data-retention" className="mt-12 scroll-mt-24">
          <h2 className="text-2xl font-bold">5. Data Retention</h2>
          <p>
            We retain your information for as long as necessary to fulfill the purposes
            described in this Privacy Policy, unless a longer retention period is required
            or permitted by law.
          </p>
          <ul>
            <li>
              <strong>Account Data:</strong> Retained for the duration of your account
              plus 30 days after account deletion to allow for account recovery.
            </li>
            <li>
              <strong>Project Data:</strong> User-controlled. You may delete individual
              projects at any time. Deleted project data is removed within 30 days.
            </li>
            <li>
              <strong>Usage Analytics:</strong> Retained for up to 2 years in anonymized
              and aggregated form for research and improvement purposes.
            </li>
            <li>
              <strong>Payment Records:</strong> Retained for 7 years as required by
              financial regulations and tax laws.
            </li>
            <li>
              <strong>Legal Holds:</strong> If we are involved in litigation or
              government investigation, relevant data may be retained beyond normal
              retention periods.
            </li>
          </ul>
        </section>

        {/* Section 6: Your Rights and Choices */}
        <section id="your-rights" className="mt-12 scroll-mt-24">
          <h2 className="text-2xl font-bold">6. Your Rights and Choices</h2>

          <h3 className="text-xl font-semibold">6.1 All Users</h3>
          <p>Regardless of your location, you have the right to:</p>
          <ul>
            <li>
              <strong>Access Your Data:</strong> Request a copy of the personal
              information we hold about you.
            </li>
            <li>
              <strong>Correct Inaccurate Data:</strong> Update or correct information
              that is inaccurate or incomplete.
            </li>
            <li>
              <strong>Delete Your Account:</strong> Request deletion of your account
              and associated personal information.
            </li>
            <li>
              <strong>Export Your Data:</strong> Request your data in a portable,
              machine-readable format.
            </li>
            <li>
              <strong>Opt Out of Marketing:</strong> Unsubscribe from marketing
              communications at any time using the link in our emails or through
              account settings.
            </li>
          </ul>

          <h3 className="text-xl font-semibold">6.2 California Residents (CCPA/CPRA)</h3>
          <p>
            If you are a California resident, you have additional rights under the
            California Consumer Privacy Act (CCPA) and the California Privacy Rights
            Act (CPRA):
          </p>
          <ul>
            <li>
              <strong>Right to Know:</strong> You may request information about the
              categories and specific pieces of personal information we have collected,
              the sources of collection, the purposes of collection, and the categories
              of third parties with whom we share personal information.
            </li>
            <li>
              <strong>Right to Delete:</strong> You may request deletion of your personal
              information, subject to certain exceptions.
            </li>
            <li>
              <strong>Right to Correct:</strong> You may request correction of inaccurate
              personal information.
            </li>
            <li>
              <strong>Right to Opt-Out of Sale/Sharing:</strong> We do not sell or share
              your personal information for cross-context behavioral advertising.
              Therefore, no opt-out is necessary.
            </li>
            <li>
              <strong>Right to Limit Use of Sensitive Personal Information:</strong> We
              do not use sensitive personal information for purposes beyond those
              permitted under CCPA/CPRA.
            </li>
            <li>
              <strong>Non-Discrimination:</strong> We will not discriminate against you
              for exercising your privacy rights.
            </li>
          </ul>
          <p>
            To exercise these rights, please contact us at{' '}
            <a href="mailto:privacy@incentedge.com" className="text-primary">
              privacy@incentedge.com
            </a>
            . We will respond to verifiable consumer requests within 45 days.
          </p>

          <h3 className="text-xl font-semibold">6.3 EU/UK Residents (GDPR)</h3>
          <p>
            If you are located in the European Economic Area (EEA) or United Kingdom,
            you have rights under the General Data Protection Regulation (GDPR):
          </p>
          <ul>
            <li>
              <strong>Legal Basis for Processing:</strong> We process your personal data
              based on: (a) your consent, (b) performance of a contract with you,
              (c) our legitimate business interests, or (d) compliance with legal
              obligations.
            </li>
            <li>
              <strong>Right of Access:</strong> Request access to your personal data.
            </li>
            <li>
              <strong>Right to Rectification:</strong> Request correction of inaccurate
              or incomplete data.
            </li>
            <li>
              <strong>Right to Erasure:</strong> Request deletion of your personal data
              (&quot;right to be forgotten&quot;).
            </li>
            <li>
              <strong>Right to Data Portability:</strong> Receive your personal data in
              a structured, commonly used, machine-readable format.
            </li>
            <li>
              <strong>Right to Object:</strong> Object to processing based on legitimate
              interests or for direct marketing purposes.
            </li>
            <li>
              <strong>Right to Restrict Processing:</strong> Request restriction of
              processing in certain circumstances.
            </li>
            <li>
              <strong>Right to Withdraw Consent:</strong> Where processing is based on
              consent, you may withdraw consent at any time.
            </li>
            <li>
              <strong>Right to Lodge a Complaint:</strong> You have the right to lodge a
              complaint with a supervisory authority in your country of residence.
            </li>
          </ul>
          <p>
            To exercise these rights, please contact our Data Protection Officer at{' '}
            <a href="mailto:legal@incentedge.com" className="text-primary">
              legal@incentedge.com
            </a>
            .
          </p>
        </section>

        {/* Section 7: Data Security */}
        <section id="data-security" className="mt-12 scroll-mt-24">
          <h2 className="text-2xl font-bold">7. Data Security</h2>
          <p>
            We implement appropriate technical and organizational measures to protect
            your personal information against unauthorized access, alteration, disclosure,
            or destruction:
          </p>
          <ul>
            <li>
              <strong>Encryption in Transit:</strong> All data transmitted between your
              browser and our servers is encrypted using TLS 1.2 or higher.
            </li>
            <li>
              <strong>Encryption at Rest:</strong> Personal information stored in our
              databases is encrypted using AES-256 encryption.
            </li>
            <li>
              <strong>Access Controls:</strong> We implement strict role-based access
              controls, ensuring only authorized personnel can access personal data,
              and only to the extent necessary for their job functions.
            </li>
            <li>
              <strong>Infrastructure Security:</strong> Our infrastructure is hosted on
              SOC 2 Type II certified platforms with continuous monitoring.
            </li>
            <li>
              <strong>Regular Security Assessments:</strong> We conduct periodic security
              assessments, vulnerability scans, and penetration testing.
            </li>
            <li>
              <strong>Incident Response:</strong> We maintain incident response procedures
              to promptly address any security breaches and notify affected users as
              required by law.
            </li>
          </ul>
          <p>
            While we strive to protect your personal information, no method of
            transmission over the Internet or electronic storage is 100% secure. We
            cannot guarantee absolute security.
          </p>
        </section>

        {/* Section 8: International Data Transfers */}
        <section id="international-transfers" className="mt-12 scroll-mt-24">
          <h2 className="text-2xl font-bold">8. International Data Transfers</h2>
          <p>
            IncentEdge is based in the United States. If you access our Service from
            outside the United States, your information will be transferred to, stored,
            and processed in the United States where our servers are located.
          </p>
          <p>
            For users in the EEA, UK, or other jurisdictions with data protection laws,
            we rely on the following mechanisms to ensure adequate protection of your
            personal data:
          </p>
          <ul>
            <li>
              <strong>Standard Contractual Clauses (SCCs):</strong> We use EU-approved
              Standard Contractual Clauses with our service providers and data
              processors.
            </li>
            <li>
              <strong>Data Processing Agreements:</strong> We maintain data processing
              agreements with all third-party processors that include appropriate
              safeguards.
            </li>
            <li>
              <strong>Privacy Shield Successor Mechanisms:</strong> We monitor and
              implement applicable data transfer frameworks as they become available.
            </li>
          </ul>
        </section>

        {/* Section 9: Children's Privacy */}
        <section id="childrens-privacy" className="mt-12 scroll-mt-24">
          <h2 className="text-2xl font-bold">9. Children&apos;s Privacy</h2>
          <p>
            Our Service is designed for business professionals and is not directed to
            individuals under the age of 18. We do not knowingly collect personal
            information from children under 18.
          </p>
          <p>
            If we become aware that we have collected personal information from a child
            under 18, we will take steps to delete that information promptly. If you
            believe we may have collected information from a child under 18, please
            contact us at{' '}
            <a href="mailto:privacy@incentedge.com" className="text-primary">
              privacy@incentedge.com
            </a>
            .
          </p>
        </section>

        {/* Section 10: Third-Party Links */}
        <section id="third-party-links" className="mt-12 scroll-mt-24">
          <h2 className="text-2xl font-bold">10. Third-Party Links</h2>
          <p>
            Our Service may contain links to third-party websites, including government
            incentive program portals, regulatory agencies, and partner organizations.
            We are not responsible for the privacy practices or content of these
            third-party sites.
          </p>
          <p>
            When you click on a link to a third-party website, you are leaving our
            Service, and any information you provide to those sites will be governed
            by their privacy policies. We encourage you to review the privacy policies
            of any third-party sites you visit.
          </p>
        </section>

        {/* Section 11: Cookies and Tracking */}
        <section id="cookies" className="mt-12 scroll-mt-24">
          <h2 className="text-2xl font-bold">11. Cookies and Tracking</h2>
          <p>
            We use cookies and similar tracking technologies to collect and track
            information about your use of our Service.
          </p>

          <h3 className="text-xl font-semibold">Types of Cookies We Use</h3>
          <ul>
            <li>
              <strong>Essential Cookies:</strong> Required for the Service to function
              properly. These cookies enable core functionality such as authentication,
              session management, and security features. You cannot opt out of these
              cookies.
            </li>
            <li>
              <strong>Analytics Cookies:</strong> Help us understand how users interact
              with our Service by collecting information about pages visited, features
              used, and performance metrics. This data is used to improve our Service.
            </li>
            <li>
              <strong>Preference Cookies:</strong> Remember your settings and preferences
              (such as language or display preferences) to provide a personalized
              experience.
            </li>
          </ul>

          <h3 className="text-xl font-semibold">Managing Cookies</h3>
          <p>
            Most web browsers allow you to control cookies through their settings. You
            can typically:
          </p>
          <ul>
            <li>View and delete cookies stored on your device</li>
            <li>Block all cookies or only third-party cookies</li>
            <li>Configure cookie preferences per website</li>
          </ul>
          <p>
            Note that blocking certain cookies may impact the functionality of our
            Service. For more information about cookies and how to manage them, visit{' '}
            <a
              href="https://www.allaboutcookies.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary"
            >
              www.allaboutcookies.org
            </a>
            .
          </p>
        </section>

        {/* Section 12: Changes to This Policy */}
        <section id="changes" className="mt-12 scroll-mt-24">
          <h2 className="text-2xl font-bold">12. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time to reflect changes in
            our practices, technologies, legal requirements, or for other operational
            reasons.
          </p>
          <p>
            When we make material changes, we will:
          </p>
          <ul>
            <li>Update the &quot;Last Updated&quot; date at the top of this policy</li>
            <li>Notify you by email (for registered users) if the changes are significant</li>
            <li>Display a prominent notice on our Service</li>
          </ul>
          <p>
            Your continued use of the Service after any changes to this Privacy Policy
            constitutes your acceptance of such changes. We encourage you to review this
            Privacy Policy periodically.
          </p>
        </section>

        {/* Section 13: Contact Us */}
        <section id="contact" className="mt-12 scroll-mt-24">
          <h2 className="text-2xl font-bold">13. Contact Us</h2>
          <p>
            If you have any questions, concerns, or requests regarding this Privacy
            Policy or our data practices, please contact us:
          </p>
          <div className="rounded-lg border bg-muted/30 p-6 not-prose">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="font-semibold">General Privacy Inquiries</p>
                <p className="text-sm text-muted-foreground">
                  Email:{' '}
                  <a href="mailto:privacy@incentedge.com" className="text-primary hover:underline">
                    privacy@incentedge.com
                  </a>
                </p>
              </div>
              <div>
                <p className="font-semibold">Data Protection Officer</p>
                <p className="text-sm text-muted-foreground">
                  Email:{' '}
                  <a href="mailto:legal@incentedge.com" className="text-primary hover:underline">
                    legal@incentedge.com
                  </a>
                </p>
              </div>
            </div>
            <div className="mt-4 border-t pt-4">
              <p className="font-semibold">Mailing Address</p>
              <p className="text-sm text-muted-foreground">
                AoRa Development LLC<br />
                dba IncentEdge<br />
                Attn: Privacy Team<br />
                United States
              </p>
            </div>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            For CCPA requests, please include &quot;CCPA Request&quot; in the subject line.
            For GDPR requests, please include &quot;GDPR Request&quot; in the subject line.
            We will respond to your request within the timeframes required by applicable law.
          </p>
        </section>
      </article>
    </div>
  );
}

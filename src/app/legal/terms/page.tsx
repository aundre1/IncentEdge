import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms of Service | IncentEdge',
  description: 'Terms of Service for IncentEdge - AI-powered incentive discovery, application, and monetization platform.',
};

const sections = [
  { id: 'acceptance', title: '1. Acceptance of Terms' },
  { id: 'description', title: '2. Description of Service' },
  { id: 'registration', title: '3. Account Registration' },
  { id: 'subscription', title: '4. Subscription Plans & Billing' },
  { id: 'success-fees', title: '5. Success Fees' },
  { id: 'acceptable-use', title: '6. Acceptable Use' },
  { id: 'intellectual-property', title: '7. Intellectual Property' },
  { id: 'data-privacy', title: '8. Data & Privacy' },
  { id: 'disclaimers', title: '9. Disclaimers' },
  { id: 'limitation', title: '10. Limitation of Liability' },
  { id: 'indemnification', title: '11. Indemnification' },
  { id: 'termination', title: '12. Termination' },
  { id: 'governing-law', title: '13. Governing Law' },
  { id: 'contact', title: '14. Contact Information' },
];

export default function TermsOfServicePage() {
  return (
    <article className="max-w-none">
      {/* Header */}
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight">Terms of Service</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Please read these terms carefully before using IncentEdge.
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          <strong>Last Updated:</strong> January 19, 2026
        </p>
        <p className="text-sm text-muted-foreground">
          <strong>Effective Date:</strong> January 19, 2026
        </p>
      </div>

      {/* Table of Contents */}
      <nav className="mb-12 rounded-lg border bg-muted/50 p-6 print:break-inside-avoid">
        <h2 className="mb-4 text-lg font-semibold">Table of Contents</h2>
        <ul className="grid gap-2 sm:grid-cols-2">
          {sections.map((section) => (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground hover:underline"
              >
                {section.title}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* Introduction */}
      <p className="mb-8 text-lg leading-relaxed text-muted-foreground">
        Welcome to IncentEdge, a product of AoRa Development LLC (&quot;Company,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;).
        These Terms of Service (&quot;Terms&quot;) govern your access to and use of the IncentEdge platform,
        including our website, applications, APIs, and related services (collectively, the &quot;Service&quot;).
      </p>

      {/* Section 1: Acceptance of Terms */}
      <section id="acceptance" className="mb-10 scroll-mt-20">
        <h2 className="mb-6 text-2xl font-semibold">1. Acceptance of Terms</h2>

        <h3 className="mb-3 text-lg font-medium">1.1 Agreement to be Bound</h3>
        <p className="mb-4 leading-relaxed text-muted-foreground">
          By accessing or using the Service, you agree to be bound by these Terms and our{' '}
          <Link href="/legal/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
          If you do not agree to these Terms, you may not access or use the Service. Your continued use
          of the Service following the posting of any changes to these Terms constitutes acceptance of those changes.
        </p>

        <h3 className="mb-3 text-lg font-medium">1.2 Eligibility</h3>
        <p className="mb-2 text-muted-foreground">To use the Service, you must:</p>
        <ul className="mb-4 list-disc space-y-1 pl-6 text-muted-foreground">
          <li>Be at least 18 years of age;</li>
          <li>Have the legal capacity to enter into a binding agreement;</li>
          <li>Be an authorized representative of the organization on whose behalf you are using the Service;</li>
          <li>Not be barred from using the Service under applicable law.</li>
        </ul>

        <h3 className="mb-3 text-lg font-medium">1.3 Changes to Terms</h3>
        <p className="mb-4 leading-relaxed text-muted-foreground">
          We reserve the right to modify these Terms at any time. We will notify you of material changes
          by posting the updated Terms on the Service and updating the &quot;Last Updated&quot; date. For significant
          changes, we will provide additional notice, such as email notification or an in-app alert. Changes
          become effective upon posting unless otherwise specified.
        </p>
      </section>

      {/* Section 2: Description of Service */}
      <section id="description" className="mb-10 scroll-mt-20">
        <h2 className="mb-6 text-2xl font-semibold">2. Description of Service</h2>

        <h3 className="mb-3 text-lg font-medium">2.1 Platform Overview</h3>
        <p className="mb-4 leading-relaxed text-muted-foreground">
          IncentEdge is an AI-powered incentive discovery, application, and monetization platform designed
          to help real estate developers, infrastructure investors, and related professionals identify and
          capture available incentives, tax credits, grants, and other financial programs.
        </p>

        <h3 className="mb-3 text-lg font-medium">2.2 Core Features</h3>
        <p className="mb-2 text-muted-foreground">The Service includes:</p>
        <ul className="mb-4 list-disc space-y-1 pl-6 text-muted-foreground">
          <li><strong>Incentive Discovery:</strong> AI-powered search and analysis of federal, state, and local incentive programs;</li>
          <li><strong>Eligibility Analysis:</strong> Automated assessment of project eligibility for various programs;</li>
          <li><strong>Report Generation:</strong> Professional reports summarizing incentive opportunities and recommendations;</li>
          <li><strong>Application Assistance:</strong> Tools and guidance to support incentive application preparation;</li>
          <li><strong>Tax Credit Monetization:</strong> Marketplace connectivity for tax credit transfers and sales.</li>
        </ul>

        <h3 className="mb-3 text-lg font-medium">2.3 Important Limitations</h3>
        <p className="mb-2 font-semibold uppercase text-foreground">
          THE SERVICE IS PROVIDED FOR INFORMATIONAL PURPOSES ONLY AND DOES NOT CONSTITUTE:
        </p>
        <ul className="mb-4 list-disc space-y-1 pl-6 text-muted-foreground">
          <li>Legal advice or legal representation;</li>
          <li>Tax advice or tax planning services;</li>
          <li>Financial advice or investment recommendations;</li>
          <li>Accounting services or audit opinions;</li>
          <li>Guarantees of incentive approval or funding.</li>
        </ul>
        <p className="mb-4 leading-relaxed text-muted-foreground">
          You should consult with qualified legal, tax, and financial professionals before making decisions
          based on information provided by the Service. We strongly recommend engaging appropriate advisors
          for all significant financial decisions.
        </p>
      </section>

      {/* Section 3: Account Registration */}
      <section id="registration" className="mb-10 scroll-mt-20">
        <h2 className="mb-6 text-2xl font-semibold">3. Account Registration</h2>

        <h3 className="mb-3 text-lg font-medium">3.1 Account Creation</h3>
        <p className="mb-4 leading-relaxed text-muted-foreground">
          To access certain features of the Service, you must register for an account. When registering,
          you agree to provide accurate, current, and complete information and to update such information
          to keep it accurate, current, and complete.
        </p>

        <h3 className="mb-3 text-lg font-medium">3.2 Account Security</h3>
        <p className="mb-2 text-muted-foreground">
          You are responsible for safeguarding your account credentials and for all activities that occur
          under your account. You agree to:
        </p>
        <ul className="mb-4 list-disc space-y-1 pl-6 text-muted-foreground">
          <li>Maintain the confidentiality of your password and other login credentials;</li>
          <li>Use strong, unique passwords and enable multi-factor authentication when available;</li>
          <li>Immediately notify us of any unauthorized use of your account or any other security breach;</li>
          <li>Not share your account credentials with any third party.</li>
        </ul>

        <h3 className="mb-3 text-lg font-medium">3.3 Organization Accounts</h3>
        <p className="mb-4 leading-relaxed text-muted-foreground">
          Each organization may maintain one primary account. Additional user seats may be added according
          to your subscription plan. The account administrator is responsible for managing user access and
          ensuring all users comply with these Terms.
        </p>
      </section>

      {/* Section 4: Subscription Plans & Billing */}
      <section id="subscription" className="mb-10 scroll-mt-20">
        <h2 className="mb-6 text-2xl font-semibold">4. Subscription Plans & Billing</h2>

        <h3 className="mb-3 text-lg font-medium">4.1 Subscription Tiers</h3>
        <p className="mb-4 text-muted-foreground">The Service is offered through the following subscription plans:</p>

        <div className="my-6 overflow-x-auto print:break-inside-avoid">
          <table className="w-full border-collapse rounded-lg border text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="p-4 text-left font-semibold">Plan</th>
                <th className="p-4 text-left font-semibold">Monthly Price</th>
                <th className="p-4 text-left font-semibold">Annual Price</th>
                <th className="p-4 text-left font-semibold">Key Features</th>
              </tr>
            </thead>
            <tbody className="text-muted-foreground">
              <tr className="border-b">
                <td className="p-4 font-medium text-foreground">Starter</td>
                <td className="p-4">$299/month</td>
                <td className="p-4">$2,990/year (2 months free)</td>
                <td className="p-4">Up to 5 projects, basic reports, email support</td>
              </tr>
              <tr className="border-b">
                <td className="p-4 font-medium text-foreground">Pro</td>
                <td className="p-4">$999/month</td>
                <td className="p-4">$9,990/year (2 months free)</td>
                <td className="p-4">Unlimited projects, advanced reports, priority support, API access</td>
              </tr>
              <tr>
                <td className="p-4 font-medium text-foreground">Enterprise</td>
                <td className="p-4">Custom pricing</td>
                <td className="p-4">Custom pricing</td>
                <td className="p-4">Custom integrations, dedicated support, SLA guarantees</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="mb-3 text-lg font-medium">4.2 Billing Cycles</h3>
        <p className="mb-4 leading-relaxed text-muted-foreground">
          Subscriptions are billed in advance on a monthly or annual basis, depending on your selected plan.
          Your subscription will automatically renew at the end of each billing period unless you cancel
          before the renewal date.
        </p>

        <h3 className="mb-3 text-lg font-medium">4.3 Payment Methods</h3>
        <p className="mb-4 leading-relaxed text-muted-foreground">
          We accept major credit cards, ACH transfers, and wire transfers (Enterprise only). You authorize
          us to charge your selected payment method for all fees and charges associated with your subscription.
        </p>

        <h3 className="mb-3 text-lg font-medium">4.4 Cancellation Policy</h3>
        <p className="mb-2 text-muted-foreground">
          You may cancel your subscription at any time through your account settings or by contacting support.
          Upon cancellation:
        </p>
        <ul className="mb-4 list-disc space-y-1 pl-6 text-muted-foreground">
          <li>Your subscription will remain active until the end of the current billing period;</li>
          <li>You will retain access to your data for 30 days after the subscription ends;</li>
          <li>After 30 days, your data may be deleted in accordance with our data retention policies.</li>
        </ul>

        <h3 className="mb-3 text-lg font-medium">4.5 Refund Policy</h3>
        <ul className="mb-4 list-disc space-y-1 pl-6 text-muted-foreground">
          <li><strong>Monthly subscriptions:</strong> No refunds for partial months. You may use the Service until the end of your billing period.</li>
          <li><strong>Annual subscriptions:</strong> Prorated refunds are available within the first 30 days. After 30 days, cancellation will take effect at the end of the annual term.</li>
          <li><strong>Enterprise agreements:</strong> Refunds are governed by the terms of your individual agreement.</li>
        </ul>
      </section>

      {/* Section 5: Success Fees */}
      <section id="success-fees" className="mb-10 scroll-mt-20">
        <h2 className="mb-6 text-2xl font-semibold">5. Success Fees</h2>

        <h3 className="mb-3 text-lg font-medium">5.1 Fee Structure</h3>
        <p className="mb-2 text-muted-foreground">
          In addition to subscription fees, IncentEdge may charge success fees for certain services,
          particularly related to tax credit monetization and transfer facilitation:
        </p>
        <ul className="mb-4 list-disc space-y-1 pl-6 text-muted-foreground">
          <li><strong>Tax Credit Transfers:</strong> 2-5% of the transaction value, depending on credit type and transaction complexity;</li>
          <li><strong>Grant Application Assistance:</strong> Fee structure varies by program and is disclosed prior to engagement;</li>
          <li><strong>Marketplace Transactions:</strong> Fees are disclosed in the marketplace terms for each transaction type.</li>
        </ul>

        <h3 className="mb-3 text-lg font-medium">5.2 When Fees Apply</h3>
        <p className="mb-2 text-muted-foreground">Success fees are only charged when:</p>
        <ul className="mb-4 list-disc space-y-1 pl-6 text-muted-foreground">
          <li>A transaction is successfully completed through the IncentEdge platform or with our assistance;</li>
          <li>You have agreed to the specific fee structure prior to the transaction;</li>
          <li>The fee terms are documented in a separate agreement or engagement letter.</li>
        </ul>

        <h3 className="mb-3 text-lg font-medium">5.3 Payment Terms</h3>
        <p className="mb-4 leading-relaxed text-muted-foreground">
          Success fees are typically due within 30 days of transaction closing unless otherwise specified
          in your agreement. We will provide detailed invoices for all success fees charged.
        </p>
      </section>

      {/* Section 6: Acceptable Use */}
      <section id="acceptable-use" className="mb-10 scroll-mt-20">
        <h2 className="mb-6 text-2xl font-semibold">6. Acceptable Use</h2>

        <h3 className="mb-3 text-lg font-medium">6.1 Permitted Uses</h3>
        <p className="mb-2 text-muted-foreground">You may use the Service to:</p>
        <ul className="mb-4 list-disc space-y-1 pl-6 text-muted-foreground">
          <li>Search and analyze incentive programs for legitimate business purposes;</li>
          <li>Generate reports and documentation for your projects;</li>
          <li>Collaborate with team members and authorized users within your organization;</li>
          <li>Access the API in accordance with your subscription plan and our API documentation.</li>
        </ul>

        <h3 className="mb-3 text-lg font-medium">6.2 Prohibited Activities</h3>
        <p className="mb-2 text-muted-foreground">You agree NOT to:</p>
        <ul className="mb-4 list-disc space-y-1 pl-6 text-muted-foreground">
          <li>Scrape, crawl, or use automated means to access the Service beyond permitted API usage;</li>
          <li>Reverse engineer, decompile, or disassemble any part of the Service;</li>
          <li>Attempt to gain unauthorized access to any portion of the Service or its systems;</li>
          <li>Use the Service to develop a competing product or service;</li>
          <li>Resell, sublicense, or redistribute the Service without authorization;</li>
          <li>Submit false, misleading, or fraudulent information;</li>
          <li>Use the Service for any illegal purpose or in violation of any applicable laws;</li>
          <li>Interfere with or disrupt the Service or servers or networks connected to the Service;</li>
          <li>Circumvent any usage limits, access controls, or security measures;</li>
          <li>Share your account credentials or allow unauthorized access to your account.</li>
        </ul>

        <h3 className="mb-3 text-lg font-medium">6.3 Rate Limits</h3>
        <p className="mb-4 leading-relaxed text-muted-foreground">
          To ensure fair usage and system stability, API access is subject to rate limits based on your
          subscription tier. Exceeding rate limits may result in temporary access restrictions. Current
          rate limits are documented in our API documentation.
        </p>
      </section>

      {/* Section 7: Intellectual Property */}
      <section id="intellectual-property" className="mb-10 scroll-mt-20">
        <h2 className="mb-6 text-2xl font-semibold">7. Intellectual Property</h2>

        <h3 className="mb-3 text-lg font-medium">7.1 IncentEdge Ownership</h3>
        <p className="mb-4 leading-relaxed text-muted-foreground">
          The Service, including all software, algorithms, databases, user interfaces, graphics, trademarks,
          and content provided by IncentEdge (excluding User Content), is owned by AoRa Development LLC and
          is protected by copyright, trademark, patent, and other intellectual property laws. Nothing in
          these Terms grants you any right, title, or interest in the Service except as expressly provided.
        </p>

        <h3 className="mb-3 text-lg font-medium">7.2 User Content Ownership</h3>
        <p className="mb-4 leading-relaxed text-muted-foreground">
          You retain all ownership rights to the data and content you submit to the Service (&quot;User Content&quot;),
          including project information, financial data, and documents you upload. We do not claim ownership
          of your User Content.
        </p>

        <h3 className="mb-3 text-lg font-medium">7.3 License to User Content</h3>
        <p className="mb-2 text-muted-foreground">
          By submitting User Content to the Service, you grant IncentEdge a non-exclusive, worldwide,
          royalty-free license to use, process, and display your User Content solely for the purposes of:
        </p>
        <ul className="mb-4 list-disc space-y-1 pl-6 text-muted-foreground">
          <li>Providing and operating the Service;</li>
          <li>Improving the Service and developing new features;</li>
          <li>Generating anonymized, aggregated analytics and insights.</li>
        </ul>
        <p className="mb-4 leading-relaxed text-muted-foreground">
          We will not sell your User Content or use it for advertising purposes. Our use of your data is
          further governed by our <Link href="/legal/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
        </p>
      </section>

      {/* Section 8: Data & Privacy */}
      <section id="data-privacy" className="mb-10 scroll-mt-20">
        <h2 className="mb-6 text-2xl font-semibold">8. Data & Privacy</h2>

        <h3 className="mb-3 text-lg font-medium">8.1 Privacy Policy</h3>
        <p className="mb-4 leading-relaxed text-muted-foreground">
          Your use of the Service is also governed by our <Link href="/legal/privacy" className="text-primary hover:underline">Privacy Policy</Link>,
          which describes how we collect, use, and protect your personal information. By using the Service,
          you consent to our data practices as described in the Privacy Policy.
        </p>

        <h3 className="mb-3 text-lg font-medium">8.2 Data Retention</h3>
        <p className="mb-4 leading-relaxed text-muted-foreground">
          We retain your User Content and account information for as long as your account is active. After
          account termination, we will retain your data for a reasonable period to allow for data export
          and to comply with legal obligations. Specific retention periods are detailed in our Privacy Policy.
        </p>

        <h3 className="mb-3 text-lg font-medium">8.3 Data Export Rights</h3>
        <p className="mb-4 leading-relaxed text-muted-foreground">
          You have the right to export your User Content at any time during your active subscription. We
          provide data export functionality through the Service interface and upon request to our support
          team. After account termination, you have 30 days to request a data export.
        </p>

        <h3 className="mb-3 text-lg font-medium">8.4 Data Security</h3>
        <p className="mb-4 leading-relaxed text-muted-foreground">
          We implement industry-standard security measures to protect your data, including encryption in
          transit and at rest, access controls, and regular security audits. However, no method of electronic
          transmission or storage is completely secure, and we cannot guarantee absolute security.
        </p>
      </section>

      {/* Section 9: Disclaimers */}
      <section id="disclaimers" className="mb-10 scroll-mt-20">
        <h2 className="mb-6 text-2xl font-semibold">9. Disclaimers</h2>

        <h3 className="mb-3 text-lg font-medium">9.1 Service Provided &quot;As-Is&quot;</h3>
        <p className="mb-4 font-semibold uppercase text-foreground">
          THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND,
          EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY,
          FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT.
        </p>

        <h3 className="mb-3 text-lg font-medium">9.2 No Professional Advice</h3>
        <p className="mb-4 leading-relaxed text-muted-foreground">
          The information provided through the Service is for general informational purposes only and is
          not a substitute for professional legal, tax, financial, or accounting advice. You should always
          consult with qualified professionals before making decisions that could affect your legal rights
          or financial obligations.
        </p>

        <h3 className="mb-3 text-lg font-medium">9.3 Accuracy of Information</h3>
        <p className="mb-2 text-muted-foreground">
          While we strive to provide accurate and up-to-date information, we do not warrant that:
        </p>
        <ul className="mb-4 list-disc space-y-1 pl-6 text-muted-foreground">
          <li>The incentive program information is complete, accurate, or current;</li>
          <li>The eligibility assessments are error-free;</li>
          <li>The Service will meet your specific requirements;</li>
          <li>The Service will be uninterrupted, timely, secure, or error-free.</li>
        </ul>
        <p className="mb-4 leading-relaxed text-muted-foreground">
          Incentive programs are subject to change without notice by the administering agencies. Program
          details, eligibility requirements, funding availability, and deadlines may change at any time.
        </p>

        <h3 className="mb-3 text-lg font-medium">9.4 No Guarantee of Results</h3>
        <p className="mb-2 font-semibold text-foreground">WE DO NOT GUARANTEE:</p>
        <ul className="mb-4 list-disc space-y-1 pl-6 text-muted-foreground">
          <li>Approval of any incentive application;</li>
          <li>Receipt of any funding or tax credits;</li>
          <li>Specific financial outcomes or returns;</li>
          <li>Successful completion of any transaction.</li>
        </ul>
        <p className="mb-4 leading-relaxed text-muted-foreground">
          Past performance and success rates are not indicative of future results. Your actual results
          will depend on many factors outside our control.
        </p>
      </section>

      {/* Section 10: Limitation of Liability */}
      <section id="limitation" className="mb-10 scroll-mt-20">
        <h2 className="mb-6 text-2xl font-semibold">10. Limitation of Liability</h2>

        <h3 className="mb-3 text-lg font-medium">10.1 Cap on Damages</h3>
        <p className="mb-4 font-semibold uppercase text-foreground">
          TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL AORA DEVELOPMENT LLC,
          ITS OFFICERS, DIRECTORS, EMPLOYEES, AGENTS, OR AFFILIATES BE LIABLE FOR ANY DAMAGES EXCEEDING
          THE GREATER OF: (A) THE TOTAL FEES PAID BY YOU TO INCENTEDGE IN THE TWELVE (12) MONTHS
          PRECEDING THE EVENT GIVING RISE TO THE CLAIM; OR (B) ONE HUNDRED DOLLARS ($100).
        </p>

        <h3 className="mb-3 text-lg font-medium">10.2 Exclusion of Consequential Damages</h3>
        <p className="mb-4 font-semibold uppercase text-foreground">
          IN NO EVENT SHALL WE BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR
          PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, USE, GOODWILL, OR
          OTHER INTANGIBLE LOSSES, REGARDLESS OF WHETHER WE HAVE BEEN ADVISED OF THE POSSIBILITY OF
          SUCH DAMAGES AND REGARDLESS OF THE LEGAL THEORY UPON WHICH THE CLAIM IS BASED.
        </p>

        <h3 className="mb-3 text-lg font-medium">10.3 Basis of the Bargain</h3>
        <p className="mb-4 leading-relaxed text-muted-foreground">
          The limitations of liability in this section reflect a reasonable allocation of risk and are
          a fundamental element of the basis of the bargain between you and IncentEdge. The Service would
          not be provided without these limitations.
        </p>
      </section>

      {/* Section 11: Indemnification */}
      <section id="indemnification" className="mb-10 scroll-mt-20">
        <h2 className="mb-6 text-2xl font-semibold">11. Indemnification</h2>
        <p className="mb-2 text-muted-foreground">
          You agree to indemnify, defend, and hold harmless AoRa Development LLC and its officers,
          directors, employees, agents, and affiliates from and against any and all claims, damages,
          losses, liabilities, costs, and expenses (including reasonable attorneys&apos; fees) arising out
          of or relating to:
        </p>
        <ul className="mb-4 list-disc space-y-1 pl-6 text-muted-foreground">
          <li>Your use of the Service;</li>
          <li>Your User Content;</li>
          <li>Your violation of these Terms;</li>
          <li>Your violation of any applicable laws or regulations;</li>
          <li>Your violation of any third-party rights, including intellectual property rights;</li>
          <li>Any disputes between you and third parties related to your use of the Service.</li>
        </ul>
        <p className="mb-4 leading-relaxed text-muted-foreground">
          We reserve the right to assume the exclusive defense and control of any matter subject to
          indemnification by you, in which event you will cooperate with us in asserting any available
          defenses.
        </p>
      </section>

      {/* Section 12: Termination */}
      <section id="termination" className="mb-10 scroll-mt-20">
        <h2 className="mb-6 text-2xl font-semibold">12. Termination</h2>

        <h3 className="mb-3 text-lg font-medium">12.1 Termination by You</h3>
        <p className="mb-4 leading-relaxed text-muted-foreground">
          You may terminate your account at any time by canceling your subscription through your account
          settings or by contacting our support team. Upon termination, you remain responsible for any
          outstanding fees.
        </p>

        <h3 className="mb-3 text-lg font-medium">12.2 Termination by IncentEdge</h3>
        <p className="mb-2 text-muted-foreground">We may suspend or terminate your access to the Service immediately, without prior notice, if:</p>
        <ul className="mb-4 list-disc space-y-1 pl-6 text-muted-foreground">
          <li>You breach any provision of these Terms;</li>
          <li>We are required to do so by law;</li>
          <li>We reasonably believe your actions may cause legal liability for us or other users;</li>
          <li>Your account has been inactive for an extended period;</li>
          <li>We discontinue the Service or any portion thereof.</li>
        </ul>

        <h3 className="mb-3 text-lg font-medium">12.3 Effect of Termination</h3>
        <p className="mb-2 text-muted-foreground">Upon termination:</p>
        <ul className="mb-4 list-disc space-y-1 pl-6 text-muted-foreground">
          <li>Your right to access and use the Service will immediately cease;</li>
          <li>We will not be obligated to maintain or provide any of your User Content;</li>
          <li>We may delete your User Content after the data retention period;</li>
          <li>All provisions of these Terms that by their nature should survive will survive, including
              ownership provisions, warranty disclaimers, indemnification, and limitations of liability;</li>
          <li>Any outstanding fees will become immediately due and payable.</li>
        </ul>
      </section>

      {/* Section 13: Governing Law */}
      <section id="governing-law" className="mb-10 scroll-mt-20">
        <h2 className="mb-6 text-2xl font-semibold">13. Governing Law</h2>

        <h3 className="mb-3 text-lg font-medium">13.1 Choice of Law</h3>
        <p className="mb-4 leading-relaxed text-muted-foreground">
          These Terms shall be governed by and construed in accordance with the laws of the State of
          Delaware, United States, without regard to its conflict of law provisions.
        </p>

        <h3 className="mb-3 text-lg font-medium">13.2 Dispute Resolution</h3>
        <p className="mb-2 text-muted-foreground">
          Any dispute arising out of or relating to these Terms or the Service shall be resolved through
          the following process:
        </p>
        <ol className="mb-4 list-decimal space-y-2 pl-6 text-muted-foreground">
          <li><strong>Informal Resolution:</strong> You agree to first contact us at legal@incentedge.com
              to attempt to resolve any dispute informally within 30 days.</li>
          <li><strong>Binding Arbitration:</strong> If informal resolution fails, any dispute shall be
              resolved by binding arbitration administered by the American Arbitration Association (AAA)
              in accordance with its Commercial Arbitration Rules. The arbitration shall take place in
              Wilmington, Delaware, or at another mutually agreed location.</li>
          <li><strong>Class Action Waiver:</strong> You agree that any arbitration or court proceeding
              shall be conducted on an individual basis and not as a class action, collective action,
              or representative proceeding.</li>
        </ol>

        <h3 className="mb-3 text-lg font-medium">13.3 Exceptions</h3>
        <p className="mb-4 leading-relaxed text-muted-foreground">
          Notwithstanding the above, either party may seek injunctive or other equitable relief in any
          court of competent jurisdiction to protect its intellectual property rights or confidential
          information.
        </p>
      </section>

      {/* Section 14: Contact Information */}
      <section id="contact" className="mb-10 scroll-mt-20">
        <h2 className="mb-6 text-2xl font-semibold">14. Contact Information</h2>
        <p className="mb-4 text-muted-foreground">
          If you have any questions about these Terms of Service, please contact us:
        </p>

        <div className="my-6 rounded-lg border bg-muted/50 p-6 print:break-inside-avoid">
          <h3 className="mb-4 font-semibold">AoRa Development LLC</h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>
              <strong className="text-foreground">Legal Inquiries:</strong>{' '}
              <a href="mailto:legal@incentedge.com" className="text-primary hover:underline">
                legal@incentedge.com
              </a>
            </p>
            <p>
              <strong className="text-foreground">General Support:</strong>{' '}
              <a href="mailto:support@incentedge.com" className="text-primary hover:underline">
                support@incentedge.com
              </a>
            </p>
            <p>
              <strong className="text-foreground">Mailing Address:</strong><br />
              AoRa Development LLC<br />
              Attn: Legal Department<br />
              [Address to be added]<br />
              United States
            </p>
          </div>
        </div>

        <p className="mb-4 text-muted-foreground">
          We will respond to all inquiries within a reasonable timeframe, typically within 5-10 business days.
        </p>
      </section>

      {/* Closing */}
      <hr className="my-12 border-border" />

      <div className="rounded-lg border bg-muted/30 p-6 text-center print:break-inside-avoid">
        <p className="text-sm text-muted-foreground">
          By using IncentEdge, you acknowledge that you have read, understood, and agree to be bound by
          these Terms of Service.
        </p>
        <p className="mt-4 text-xs text-muted-foreground">
          This document was last updated on January 19, 2026.
        </p>
      </div>
    </article>
  );
}

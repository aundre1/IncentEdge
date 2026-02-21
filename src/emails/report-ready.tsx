/**
 * Report Ready Email Template
 *
 * Sent when an incentive analysis report is ready for a project.
 */

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
  Row,
  Column,
} from '@react-email/components';
import * as React from 'react';

interface ReportReadyEmailProps {
  userName: string;
  projectName: string;
  projectId: string;
  incentivesFound: number;
  totalValue: number;
  directPayEligible: boolean;
  directPayValue?: number;
  reportUrl?: string;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://incentedge.com';

function formatCurrency(value: number): string {
  if (value >= 1000000000) return `$${(value / 1000000000).toFixed(2)}B`;
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
  return `$${value.toLocaleString()}`;
}

export const ReportReadyEmail = ({
  userName = 'there',
  projectName = 'Your Project',
  projectId = 'demo',
  incentivesFound = 48,
  totalValue = 252200000,
  directPayEligible = true,
  directPayValue = 88000000,
  reportUrl,
}: ReportReadyEmailProps) => {
  const previewText = `Your incentive analysis for ${projectName} is ready - ${formatCurrency(totalValue)} in potential incentives identified`;
  const viewReportUrl = reportUrl || `${baseUrl}/projects/${projectId}/report?source=email`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header with Logo */}
          <Section style={logoSection}>
            <Img
              src={`${baseUrl}/logo.png`}
              width="150"
              height="40"
              alt="IncentEdge"
              style={logo}
            />
          </Section>

          {/* Main Content */}
          <Section style={contentSection}>
            <Heading style={heading}>Your Incentive Analysis is Ready</Heading>

            <Text style={paragraph}>
              Hi {userName},
            </Text>

            <Text style={paragraph}>
              Great news! We&apos;ve completed the incentive analysis for <strong>{projectName}</strong>.
              Our AI has identified significant opportunities to reduce your project costs.
            </Text>

            {/* Stats Section */}
            <Section style={statsContainer}>
              <Row>
                <Column style={statBox}>
                  <Text style={statNumber}>{incentivesFound}</Text>
                  <Text style={statLabel}>Incentives Found</Text>
                </Column>
                <Column style={statBox}>
                  <Text style={statNumberGreen}>{formatCurrency(totalValue)}</Text>
                  <Text style={statLabel}>Total Potential Value</Text>
                </Column>
              </Row>
            </Section>

            {/* Direct Pay Highlight */}
            {directPayEligible && directPayValue && (
              <Section style={directPaySection}>
                <Text style={directPayBadge}>IRA Direct Pay Eligible</Text>
                <Text style={directPayText}>
                  Your project qualifies for <strong>{formatCurrency(directPayValue)}</strong> in
                  IRA Section 6417 Direct Pay provisions - receive cash payments directly from
                  the IRS without needing tax liability.
                </Text>
              </Section>
            )}

            {/* CTA */}
            <Section style={ctaSection}>
              <Button
                style={ctaButton}
                href={viewReportUrl}
              >
                View Full Report
              </Button>
            </Section>

            <Hr style={divider} />

            {/* What's in the Report */}
            <Text style={sectionTitle}>What&apos;s Included in Your Report:</Text>

            <Section style={featureList}>
              <Text style={featureItem}>
                <strong>Eligibility Analysis</strong> - Detailed breakdown of which incentives
                your project qualifies for and why
              </Text>
              <Text style={featureItem}>
                <strong>Value Estimates</strong> - Conservative, realistic, and optimistic
                scenarios with probability weighting
              </Text>
              <Text style={featureItem}>
                <strong>Application Timeline</strong> - Deadlines and recommended submission
                schedule for each incentive
              </Text>
              <Text style={featureItem}>
                <strong>Stacking Opportunities</strong> - Which incentives can be combined
                for maximum benefit
              </Text>
            </Section>

            <Text style={paragraph}>
              Questions about your report? Reply to this email and our team will be happy to help.
            </Text>

            <Text style={signature}>
              Best regards,
              <br />
              The IncentEdge Team
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              IncentEdge - Infrastructure&apos;s Bloomberg Terminal for Incentives
            </Text>
            <Text style={footerText}>
              <Link href={`${baseUrl}/privacy`} style={footerLink}>
                Privacy Policy
              </Link>
              {' | '}
              <Link href={`${baseUrl}/terms`} style={footerLink}>
                Terms of Service
              </Link>
            </Text>
            <Text style={footerAddress}>
              AoRa Development LLC
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

ReportReadyEmail.PreviewProps = {
  userName: 'John',
  projectName: 'Mount Vernon Mixed-Use',
  projectId: 'mt-vernon',
  incentivesFound: 48,
  totalValue: 252200000,
  directPayEligible: true,
  directPayValue: 88000000,
} as ReportReadyEmailProps;

export default ReportReadyEmail;

// ============================================================================
// STYLES
// ============================================================================

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
};

const logoSection = {
  padding: '32px 20px',
  textAlign: 'center' as const,
};

const logo = {
  margin: '0 auto',
};

const contentSection = {
  padding: '0 48px',
};

const heading = {
  color: '#1a1a1a',
  fontSize: '28px',
  fontWeight: '700',
  lineHeight: '1.3',
  margin: '0 0 24px',
  textAlign: 'center' as const,
};

const paragraph = {
  color: '#525f7f',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '0 0 16px',
};

const statsContainer = {
  margin: '32px 0',
  padding: '0',
};

const statBox = {
  textAlign: 'center' as const,
  padding: '20px',
  backgroundColor: '#f8fafc',
  borderRadius: '8px',
  margin: '0 8px',
};

const statNumber = {
  color: '#1a1a1a',
  fontSize: '32px',
  fontWeight: '700',
  lineHeight: '1',
  margin: '0 0 8px',
};

const statNumberGreen = {
  color: '#10b981',
  fontSize: '32px',
  fontWeight: '700',
  lineHeight: '1',
  margin: '0 0 8px',
};

const statLabel = {
  color: '#8898aa',
  fontSize: '13px',
  fontWeight: '500',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
  margin: '0',
};

const directPaySection = {
  backgroundColor: '#ecfdf5',
  border: '1px solid #a7f3d0',
  borderRadius: '8px',
  padding: '20px 24px',
  margin: '24px 0',
};

const directPayBadge = {
  backgroundColor: '#10b981',
  color: '#ffffff',
  fontSize: '11px',
  fontWeight: '600',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
  padding: '4px 10px',
  borderRadius: '4px',
  display: 'inline-block',
  margin: '0 0 12px',
};

const directPayText = {
  color: '#065f46',
  fontSize: '15px',
  lineHeight: '1.6',
  margin: '0',
};

const ctaSection = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const ctaButton = {
  backgroundColor: '#10b981',
  borderRadius: '6px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 28px',
};

const divider = {
  borderColor: '#e6ebf1',
  margin: '32px 0',
};

const sectionTitle = {
  color: '#1a1a1a',
  fontSize: '18px',
  fontWeight: '600',
  lineHeight: '1.4',
  margin: '0 0 16px',
};

const featureList = {
  margin: '16px 0 24px',
  padding: '0 16px',
};

const featureItem = {
  color: '#525f7f',
  fontSize: '15px',
  lineHeight: '1.6',
  margin: '0 0 12px',
  paddingLeft: '8px',
  borderLeft: '3px solid #10b981',
};

const signature = {
  color: '#525f7f',
  fontSize: '15px',
  lineHeight: '1.8',
  margin: '24px 0 0',
};

const footer = {
  padding: '32px 20px',
  textAlign: 'center' as const,
};

const footerText = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '1.5',
  margin: '0 0 8px',
};

const footerLink = {
  color: '#8898aa',
  textDecoration: 'underline',
};

const footerAddress = {
  color: '#aab7c4',
  fontSize: '11px',
  lineHeight: '1.5',
  margin: '16px 0 0',
};

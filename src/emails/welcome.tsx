/**
 * Welcome Email Template
 *
 * Sent when a new user signs up for IncentEdge.
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
} from '@react-email/components';
import * as React from 'react';

interface WelcomeEmailProps {
  userName: string;
  userEmail?: string;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://incentedge.com';

export const WelcomeEmail = ({
  userName = 'there',
}: WelcomeEmailProps) => {
  const previewText = `Welcome to IncentEdge - Your gateway to $500B+ in incentives`;

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
            <Heading style={heading}>Welcome to IncentEdge!</Heading>

            <Text style={paragraph}>
              Hi {userName},
            </Text>

            <Text style={paragraph}>
              Thank you for joining IncentEdge - the AI-powered platform that transforms
              how infrastructure developers discover, qualify for, and capture incentives.
            </Text>

            <Text style={paragraph}>
              With IncentEdge, you now have access to:
            </Text>

            <Section style={featureList}>
              <Text style={featureItem}>
                <strong>30,000+ Incentive Programs</strong> - Federal, state, local, and utility
                incentives covering tax credits, grants, rebates, and more
              </Text>
              <Text style={featureItem}>
                <strong>AI-Powered Matching</strong> - Our intelligent engine analyzes your
                projects and identifies the most valuable incentive opportunities
              </Text>
              <Text style={featureItem}>
                <strong>Direct Pay Analysis</strong> - Instantly see which IRA Section 6417
                direct pay provisions apply to your projects
              </Text>
              <Text style={featureItem}>
                <strong>Stacking Optimization</strong> - Maximize your returns by combining
                compatible incentives strategically
              </Text>
            </Section>

            <Section style={ctaSection}>
              <Button
                style={ctaButton}
                href={`${baseUrl}/dashboard?source=welcome-email`}
              >
                Start Your First Analysis
              </Button>
            </Section>

            <Hr style={divider} />

            <Text style={helpText}>
              Need help getting started? Check out our resources:
            </Text>

            <Section style={linksSection}>
              <Link href={`${baseUrl}/docs/getting-started`} style={link}>
                Getting Started Guide
              </Link>
              {' | '}
              <Link href={`${baseUrl}/docs/incentive-types`} style={link}>
                Understanding Incentive Types
              </Link>
              {' | '}
              <Link href={`${baseUrl}/docs/api`} style={link}>
                API Documentation
              </Link>
            </Section>

            <Text style={paragraph}>
              If you have any questions, just reply to this email - we&apos;re here to help!
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

WelcomeEmail.PreviewProps = {
  userName: 'John',
} as WelcomeEmailProps;

export default WelcomeEmail;

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

const featureList = {
  margin: '24px 0',
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

const helpText = {
  color: '#8898aa',
  fontSize: '14px',
  lineHeight: '1.6',
  margin: '0 0 12px',
  textAlign: 'center' as const,
};

const linksSection = {
  textAlign: 'center' as const,
  margin: '0 0 24px',
};

const link = {
  color: '#10b981',
  fontSize: '14px',
  textDecoration: 'underline',
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

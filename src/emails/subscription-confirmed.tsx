/**
 * Subscription Confirmed Email Template
 *
 * Sent when a user successfully subscribes to a paid plan.
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

interface SubscriptionConfirmedEmailProps {
  userName: string;
  planName: string;
  planTier: 'starter' | 'professional' | 'team' | 'enterprise';
  features?: string[];
  nextBillingDate?: string;
  amount?: number;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://incentedge.com';

const PLAN_DETAILS: Record<string, { color: string; icon: string }> = {
  starter: { color: '#3b82f6', icon: 'rocket' },
  professional: { color: '#8b5cf6', icon: 'star' },
  team: { color: '#f59e0b', icon: 'users' },
  enterprise: { color: '#10b981', icon: 'building' },
};

export const SubscriptionConfirmedEmail = ({
  userName = 'there',
  planName = 'Professional',
  planTier = 'professional',
  features = [
    'Unlimited project analyses',
    'AI-powered incentive matching',
    'PDF report generation',
    'Direct Pay eligibility checking',
    'Priority email support',
  ],
  nextBillingDate,
  amount,
}: SubscriptionConfirmedEmailProps) => {
  const previewText = `Welcome to IncentEdge ${planName} - Your subscription is confirmed`;
  const planColor = PLAN_DETAILS[planTier]?.color || '#10b981';

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
            {/* Success Badge */}
            <Section style={successBadgeSection}>
              <Text style={successBadge}>Payment Confirmed</Text>
            </Section>

            <Heading style={heading}>
              Welcome to IncentEdge {planName}!
            </Heading>

            <Text style={paragraph}>
              Hi {userName},
            </Text>

            <Text style={paragraph}>
              Thank you for subscribing to IncentEdge {planName}! Your payment has been
              processed successfully and your account has been upgraded.
            </Text>

            {/* Plan Card */}
            <Section style={{ ...planCard, borderColor: planColor }}>
              <Text style={{ ...planBadge, backgroundColor: planColor }}>
                {planName.toUpperCase()} PLAN
              </Text>

              {amount && (
                <Text style={planPrice}>
                  ${amount.toFixed(2)}/month
                </Text>
              )}

              {nextBillingDate && (
                <Text style={planBillingDate}>
                  Next billing date: {nextBillingDate}
                </Text>
              )}
            </Section>

            {/* What's Included */}
            <Text style={sectionTitle}>What&apos;s Included in Your Plan:</Text>

            <Section style={featureList}>
              {features.map((feature, index) => (
                <Text key={index} style={featureItem}>
                  <span style={checkmark}>&#10003;</span> {feature}
                </Text>
              ))}
            </Section>

            {/* CTA */}
            <Section style={ctaSection}>
              <Button
                style={ctaButton}
                href={`${baseUrl}/dashboard?source=subscription-email`}
              >
                Go to Dashboard
              </Button>
            </Section>

            <Hr style={divider} />

            {/* Next Steps */}
            <Text style={sectionTitle}>Get Started:</Text>

            <Section style={stepsList}>
              <Text style={stepItem}>
                <strong>1. Create Your First Project</strong>
                <br />
                <span style={stepDescription}>
                  Add your real estate project details to start analyzing incentives
                </span>
              </Text>
              <Text style={stepItem}>
                <strong>2. Run an Analysis</strong>
                <br />
                <span style={stepDescription}>
                  Our AI will match your project with 24,000+ incentive programs
                </span>
              </Text>
              <Text style={stepItem}>
                <strong>3. Review Your Report</strong>
                <br />
                <span style={stepDescription}>
                  Get a detailed breakdown of eligible incentives and their values
                </span>
              </Text>
            </Section>

            <Text style={paragraph}>
              Have questions? Our support team is here to help you get the most out
              of your subscription. Just reply to this email.
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
              <Link href={`${baseUrl}/account/billing`} style={footerLink}>
                Manage Subscription
              </Link>
              {' | '}
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

SubscriptionConfirmedEmail.PreviewProps = {
  userName: 'John',
  planName: 'Professional',
  planTier: 'professional',
  features: [
    'Unlimited project analyses',
    'AI-powered incentive matching',
    'PDF report generation',
    'Direct Pay eligibility checking',
    'Priority email support',
  ],
  nextBillingDate: 'February 19, 2026',
  amount: 299,
} as SubscriptionConfirmedEmailProps;

export default SubscriptionConfirmedEmail;

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

const successBadgeSection = {
  textAlign: 'center' as const,
  marginBottom: '16px',
};

const successBadge = {
  backgroundColor: '#dcfce7',
  color: '#166534',
  fontSize: '12px',
  fontWeight: '600',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
  padding: '6px 12px',
  borderRadius: '16px',
  display: 'inline-block',
  margin: '0',
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

const planCard = {
  border: '2px solid',
  borderRadius: '12px',
  padding: '24px',
  margin: '24px 0',
  textAlign: 'center' as const,
};

const planBadge = {
  color: '#ffffff',
  fontSize: '12px',
  fontWeight: '700',
  letterSpacing: '1px',
  padding: '6px 16px',
  borderRadius: '4px',
  display: 'inline-block',
  margin: '0 0 12px',
};

const planPrice = {
  color: '#1a1a1a',
  fontSize: '28px',
  fontWeight: '700',
  margin: '8px 0',
};

const planBillingDate = {
  color: '#8898aa',
  fontSize: '14px',
  margin: '0',
};

const sectionTitle = {
  color: '#1a1a1a',
  fontSize: '18px',
  fontWeight: '600',
  lineHeight: '1.4',
  margin: '24px 0 16px',
};

const featureList = {
  margin: '0 0 24px',
  padding: '0',
};

const featureItem = {
  color: '#525f7f',
  fontSize: '15px',
  lineHeight: '1.6',
  margin: '0 0 10px',
  paddingLeft: '4px',
};

const checkmark = {
  color: '#10b981',
  fontWeight: '700',
  marginRight: '8px',
};

const stepsList = {
  margin: '16px 0 24px',
  padding: '0 16px',
};

const stepItem = {
  color: '#525f7f',
  fontSize: '15px',
  lineHeight: '1.5',
  margin: '0 0 16px',
  paddingLeft: '8px',
  borderLeft: '3px solid #10b981',
};

const stepDescription = {
  color: '#8898aa',
  fontSize: '14px',
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

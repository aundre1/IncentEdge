/**
 * Payment Failed Email Template
 *
 * Sent when a subscription payment fails.
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

interface PaymentFailedEmailProps {
  userName: string;
  planName: string;
  failureReason?: string;
  updatePaymentUrl?: string;
  supportEmail?: string;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://incentedge.com';

export const PaymentFailedEmail = ({
  userName = 'there',
  planName = 'Professional',
  failureReason,
  updatePaymentUrl,
  supportEmail = 'support@incentedge.com',
}: PaymentFailedEmailProps) => {
  const previewText = `Action Required: Your IncentEdge payment could not be processed`;
  const paymentUrl = updatePaymentUrl || `${baseUrl}/account/billing?source=payment-failed-email`;

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
            {/* Warning Badge */}
            <Section style={warningBadgeSection}>
              <Text style={warningBadge}>Action Required</Text>
            </Section>

            <Heading style={heading}>Payment Failed</Heading>

            <Text style={paragraph}>
              Hi {userName},
            </Text>

            <Text style={paragraph}>
              We were unable to process your payment for your IncentEdge {planName} subscription.
              Don&apos;t worry - this is easy to fix.
            </Text>

            {/* Failure Reason Card */}
            {failureReason && (
              <Section style={reasonCard}>
                <Text style={reasonLabel}>Reason:</Text>
                <Text style={reasonText}>{failureReason}</Text>
              </Section>
            )}

            {/* What to Do */}
            <Text style={sectionTitle}>What to do next:</Text>

            <Section style={stepsList}>
              <Text style={stepItem}>
                <strong>1. Update Your Payment Method</strong>
                <br />
                <span style={stepDescription}>
                  Click the button below to add or update your credit card information
                </span>
              </Text>
              <Text style={stepItem}>
                <strong>2. Verify Card Details</strong>
                <br />
                <span style={stepDescription}>
                  Make sure your card has not expired and has sufficient funds
                </span>
              </Text>
              <Text style={stepItem}>
                <strong>3. Contact Your Bank (if needed)</strong>
                <br />
                <span style={stepDescription}>
                  Some banks may block the transaction - contact them to authorize the payment
                </span>
              </Text>
            </Section>

            {/* CTA */}
            <Section style={ctaSection}>
              <Button
                style={ctaButton}
                href={paymentUrl}
              >
                Update Payment Method
              </Button>
            </Section>

            {/* Urgency Note */}
            <Section style={urgencyCard}>
              <Text style={urgencyTitle}>Important:</Text>
              <Text style={urgencyText}>
                Please update your payment method within 3 days to avoid any interruption
                to your IncentEdge service. Your access to premium features will continue
                during this time.
              </Text>
            </Section>

            <Hr style={divider} />

            {/* Support Section */}
            <Text style={supportText}>
              If you believe this is an error or need assistance, please contact our
              support team. We&apos;re here to help!
            </Text>

            <Section style={supportSection}>
              <Text style={supportContact}>
                <strong>Email:</strong>{' '}
                <Link href={`mailto:${supportEmail}`} style={supportLink}>
                  {supportEmail}
                </Link>
              </Text>
            </Section>

            <Text style={paragraph}>
              Thank you for being an IncentEdge customer. We value your business and
              want to ensure uninterrupted access to your incentive analysis tools.
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

PaymentFailedEmail.PreviewProps = {
  userName: 'John',
  planName: 'Professional',
  failureReason: 'Your card was declined. Please check your card details or try a different payment method.',
  supportEmail: 'support@incentedge.com',
} as PaymentFailedEmailProps;

export default PaymentFailedEmail;

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

const warningBadgeSection = {
  textAlign: 'center' as const,
  marginBottom: '16px',
};

const warningBadge = {
  backgroundColor: '#fef2f2',
  color: '#dc2626',
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

const reasonCard = {
  backgroundColor: '#fef2f2',
  border: '1px solid #fecaca',
  borderRadius: '8px',
  padding: '16px 20px',
  margin: '24px 0',
};

const reasonLabel = {
  color: '#991b1b',
  fontSize: '12px',
  fontWeight: '600',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
  margin: '0 0 8px',
};

const reasonText = {
  color: '#7f1d1d',
  fontSize: '15px',
  lineHeight: '1.5',
  margin: '0',
};

const sectionTitle = {
  color: '#1a1a1a',
  fontSize: '18px',
  fontWeight: '600',
  lineHeight: '1.4',
  margin: '24px 0 16px',
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
  borderLeft: '3px solid #f59e0b',
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
  backgroundColor: '#f59e0b',
  borderRadius: '6px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 28px',
};

const urgencyCard = {
  backgroundColor: '#fffbeb',
  border: '1px solid #fde68a',
  borderRadius: '8px',
  padding: '16px 20px',
  margin: '24px 0',
};

const urgencyTitle = {
  color: '#92400e',
  fontSize: '14px',
  fontWeight: '600',
  margin: '0 0 8px',
};

const urgencyText = {
  color: '#78350f',
  fontSize: '14px',
  lineHeight: '1.6',
  margin: '0',
};

const divider = {
  borderColor: '#e6ebf1',
  margin: '32px 0',
};

const supportText = {
  color: '#525f7f',
  fontSize: '15px',
  lineHeight: '1.6',
  margin: '0 0 16px',
  textAlign: 'center' as const,
};

const supportSection = {
  textAlign: 'center' as const,
  margin: '0 0 24px',
};

const supportContact = {
  color: '#525f7f',
  fontSize: '15px',
  margin: '0 0 8px',
};

const supportLink = {
  color: '#10b981',
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

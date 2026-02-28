/**
 * Email Service Framework for IncentEdge
 *
 * Provides email functions for:
 * - Welcome emails (after lead capture)
 * - Report download confirmation
 * - Monthly reminder emails
 * - Promotional campaigns
 *
 * Currently stubs - ready for Resend/SendGrid integration.
 * See src/lib/email.ts for core email infrastructure.
 */

import { sendEmail } from '@/lib/email';

// ============================================================================
// TYPES
// ============================================================================

export interface LeadWelcomeEmailData {
  email: string;
  companyName?: string;
  projectAddress?: string;
  reportUrl?: string;
}

export interface ReportDownloadEmailData {
  email: string;
  reportUrl: string;
  incentiveCount?: number;
  totalValue?: number;
  expiresAt?: string;
}

export interface MonthlyReminderEmailData {
  email: string;
  lastReportDate: string;
  reportUrl?: string;
  nextAvailableDate?: string;
}

// ============================================================================
// EMAIL TEMPLATES
// ============================================================================

function getWelcomeEmailTemplate(data: LeadWelcomeEmailData): {
  subject: string;
  html: string;
} {
  const companyDisplay = data.companyName || 'there';

  return {
    subject: 'Welcome to IncentEdge - Your Free Incentive Report Awaits',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #334155; }
            .container { max-width: 600px; margin: 0 auto; background: #f8fafc; }
            .header { background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: white; padding: 40px 20px; text-align: center; }
            .header h1 { margin: 0; font-size: 28px; }
            .header p { margin: 10px 0 0 0; font-size: 14px; opacity: 0.9; }
            .content { padding: 40px 20px; background: white; }
            .content h2 { color: #0f172a; margin-top: 0; }
            .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 500; margin: 20px 0; }
            .button:hover { background: #2563eb; }
            .footer { background: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #64748b; }
            .highlight { background: #f0f9ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>IncentEdge</h1>
              <p>Infrastructure's Bloomberg Terminal for Incentives</p>
            </div>

            <div class="content">
              <h2>Hello ${companyDisplay},</h2>

              <p>Thank you for exploring IncentEdge! We've prepared a <strong>personalized analysis</strong> of incentive programs available for your project at:</p>

              <div class="highlight">
                <strong>Location:</strong> ${data.projectAddress || 'Your Project Address'}<br>
                <strong>Type:</strong> Real Estate Development
              </div>

              <p>Your free report includes:</p>
              <ul>
                <li>Up to 10 matching incentive programs</li>
                <li>Estimated financial benefits</li>
                <li>Direct Pay eligibility (IRA Section 6417)</li>
                <li>Application timeline estimates</li>
              </ul>

              <p style="text-align: center;">
                <a href="${data.reportUrl || '#'}" class="button">Download Your Free Report</a>
              </p>

              <h3 style="color: #64748b; margin-top: 30px; font-size: 14px; border-top: 1px solid #e2e8f0; padding-top: 20px;">
                What's Next?
              </h3>
              <p style="font-size: 14px; color: #64748b;">
                Your report is valid for 30 days. Review it with your team and reach out if you have questions about any incentive program or need help with applications.
              </p>
            </div>

            <div class="footer">
              <p>© 2026 IncentEdge. All rights reserved.</p>
              <p>
                <a href="https://incentedge.com" style="color: #3b82f6; text-decoration: none;">Website</a> •
                <a href="mailto:support@incentedge.com" style="color: #3b82f6; text-decoration: none;">Support</a>
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
  };
}

function getReportDownloadTemplate(data: ReportDownloadEmailData): {
  subject: string;
  html: string;
} {
  const incentiveText = data.incentiveCount
    ? `We found <strong>${data.incentiveCount} matching programs</strong> worth an estimated <strong>${data.totalValue ? `$${data.totalValue.toLocaleString()}` : 'significant value'}</strong>.`
    : 'Your personalized incentive report has been generated.';

  return {
    subject: 'Your IncentEdge Incentive Report is Ready',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #334155; }
            .container { max-width: 600px; margin: 0 auto; background: #f8fafc; }
            .header { background: #10b981; color: white; padding: 30px 20px; text-align: center; }
            .header h1 { margin: 0; font-size: 24px; }
            .content { padding: 40px 20px; background: white; }
            .button { display: inline-block; background: #10b981; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 500; }
            .footer { background: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #64748b; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✓ Report Ready!</h1>
            </div>

            <div class="content">
              <p>${incentiveText}</p>

              <p style="text-align: center; margin: 30px 0;">
                <a href="${data.reportUrl}" class="button">Download Report</a>
              </p>

              <p style="font-size: 12px; color: #64748b;">
                Report expires in ${data.expiresAt || '30 days'}. Download and share with your team.
              </p>
            </div>

            <div class="footer">
              <p>© 2026 IncentEdge</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };
}

function getMonthlyReminderTemplate(data: MonthlyReminderEmailData): {
  subject: string;
  html: string;
} {
  return {
    subject: 'Your Next IncentEdge Report is Ready to Generate',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #334155; }
            .container { max-width: 600px; margin: 0 auto; }
            .header { background: #3b82f6; color: white; padding: 30px 20px; text-align: center; }
            .content { padding: 40px 20px; background: white; }
            .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Generate Your Next Report</h1>
            </div>

            <div class="content">
              <p>It's been 30 days since you last generated an IncentEdge report. You're now eligible to generate another one!</p>

              <p style="text-align: center;">
                <a href="${data.reportUrl || 'https://incentedge.com'}" class="button">Generate Report</a>
              </p>

              <p style="font-size: 14px; color: #64748b;">
                Check for new incentive programs and updated valuations for your project.
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
  };
}

// ============================================================================
// SEND FUNCTIONS (STUBS - Ready for Integration)
// ============================================================================

/**
 * Send welcome email to new lead
 * Currently: Logs to console
 * TODO: Connect to Resend API when RESEND_API_KEY is configured
 *
 * @param data - Lead welcome email data
 */
export async function sendWelcomeEmail(data: LeadWelcomeEmailData): Promise<void> {
  try {
    const { subject, html } = getWelcomeEmailTemplate(data);

    console.log('[EMAIL] Welcome email template prepared:', {
      email: data.email,
      subject,
      preview: html.substring(0, 150),
    });

    // TODO: Uncomment when Resend is configured
    // const result = await sendEmail({
    //   to: data.email,
    //   subject,
    //   html,
    //   tags: [
    //     { name: 'campaign', value: 'welcome' },
    //     { name: 'lead_email', value: data.email },
    //   ],
    // });
    //
    // if (!result.success) {
    //   throw new Error(`Failed to send welcome email: ${result.error}`);
    // }

    console.log('[EMAIL] Welcome email (stub mode - not sent)');
  } catch (error) {
    console.error('[EMAIL] Error sending welcome email:', error);
    // Don't throw - non-critical for user experience
  }
}

/**
 * Send report download confirmation email
 * Currently: Logs to console
 * TODO: Connect to Resend API when RESEND_API_KEY is configured
 *
 * @param data - Report download email data
 */
export async function sendReportDownloadEmail(
  data: ReportDownloadEmailData
): Promise<void> {
  try {
    const { subject, html } = getReportDownloadTemplate(data);

    console.log('[EMAIL] Report download email template prepared:', {
      email: data.email,
      subject,
      preview: html.substring(0, 150),
    });

    // TODO: Uncomment when Resend is configured
    // const result = await sendEmail({
    //   to: data.email,
    //   subject,
    //   html,
    //   tags: [
    //     { name: 'campaign', value: 'report_ready' },
    //     { name: 'lead_email', value: data.email },
    //   ],
    // });
    //
    // if (!result.success) {
    //   throw new Error(`Failed to send report email: ${result.error}`);
    // }

    console.log('[EMAIL] Report download email (stub mode - not sent)');
  } catch (error) {
    console.error('[EMAIL] Error sending report email:', error);
    // Don't throw - non-critical for user experience
  }
}

/**
 * Send monthly reminder email
 * Currently: Logs to console
 * TODO: Connect to Resend API when RESEND_API_KEY is configured
 *
 * @param data - Monthly reminder email data
 */
export async function sendMonthlyReminderEmail(data: MonthlyReminderEmailData): Promise<void> {
  try {
    const { subject, html } = getMonthlyReminderTemplate(data);

    console.log('[EMAIL] Monthly reminder email template prepared:', {
      email: data.email,
      subject,
      preview: html.substring(0, 150),
    });

    // TODO: Uncomment when Resend is configured
    // const result = await sendEmail({
    //   to: data.email,
    //   subject,
    //   html,
    //   tags: [
    //     { name: 'campaign', value: 'monthly_reminder' },
    //     { name: 'lead_email', value: data.email },
    //   ],
    // });
    //
    // if (!result.success) {
    //   throw new Error(`Failed to send reminder email: ${result.error}`);
    // }

    console.log('[EMAIL] Monthly reminder email (stub mode - not sent)');
  } catch (error) {
    console.error('[EMAIL] Error sending monthly reminder:', error);
    // Don't throw - non-critical for user experience
  }
}

/**
 * Check if email service is ready for production use
 */
export function isEmailServiceReady(): boolean {
  return !!process.env.RESEND_API_KEY;
}

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Contact form submission - stores to DB and sends email notification
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { question, email, name, source = 'ask_us_modal' } = body;

    if (!question || question.trim().length === 0) {
      return NextResponse.json(
        { error: 'Question is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get current user if authenticated
    const { data: { user } } = await supabase.auth.getUser();

    // Store in database
    const { data: inquiry, error: dbError } = await supabase
      .from('contact_inquiries')
      .insert({
        question: question.trim(),
        email: email || user?.email || null,
        name: name || null,
        user_id: user?.id || null,
        source,
        status: 'pending',
        metadata: {
          user_agent: request.headers.get('user-agent'),
          timestamp: new Date().toISOString(),
        },
      })
      .select()
      .single();

    if (dbError) {
      console.error('Error storing inquiry:', dbError);
      return NextResponse.json(
        { error: 'Failed to submit inquiry' },
        { status: 500 }
      );
    }

    // Send email notification (using Resend, SendGrid, or native fetch)
    // This will be configured based on environment variables
    const emailEnabled = process.env.EMAIL_ENABLED === 'true';
    const notifyEmail = process.env.CONTACT_NOTIFY_EMAIL || 'team@incentedge.com';

    if (emailEnabled) {
      try {
        // Try Resend first
        if (process.env.RESEND_API_KEY) {
          await sendWithResend({
            to: notifyEmail,
            subject: `New IncentEdge Inquiry: ${question.substring(0, 50)}...`,
            question,
            email: email || user?.email || 'No email provided',
            source,
          });
        }
        // Fallback to SendGrid
        else if (process.env.SENDGRID_API_KEY) {
          await sendWithSendGrid({
            to: notifyEmail,
            subject: `New IncentEdge Inquiry`,
            question,
            email: email || user?.email || 'No email provided',
            source,
          });
        }
        // Log if no email service configured
        else {
          console.log('Email notification skipped - no email service configured');
        }
      } catch (emailError) {
        // Don't fail the request if email fails, just log it
        console.error('Email notification failed:', emailError);
      }
    }

    return NextResponse.json({
      success: true,
      id: inquiry.id,
      message: 'Inquiry submitted successfully',
    });
  } catch (error) {
    console.error('Contact API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Resend email function
async function sendWithResend(params: {
  to: string;
  subject: string;
  question: string;
  email: string;
  source: string;
}) {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM_EMAIL || 'IncentEdge <notifications@incentedge.com>',
      to: [params.to],
      subject: params.subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #0f172a; padding: 20px; text-align: center;">
            <h1 style="color: #3b82f6; margin: 0;">IncentEdge</h1>
            <p style="color: #94a3b8; margin: 5px 0 0 0;">New Inquiry Received</p>
          </div>

          <div style="padding: 30px; background: #f8fafc;">
            <h2 style="color: #1e293b; margin-top: 0;">Question</h2>
            <div style="background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
              <p style="color: #334155; margin: 0; white-space: pre-wrap;">${params.question}</p>
            </div>

            <h3 style="color: #64748b; margin-bottom: 10px;">Contact Info</h3>
            <p style="color: #334155; margin: 5px 0;"><strong>Email:</strong> ${params.email}</p>
            <p style="color: #334155; margin: 5px 0;"><strong>Source:</strong> ${params.source}</p>
            <p style="color: #334155; margin: 5px 0;"><strong>Time:</strong> ${new Date().toLocaleString()}</p>
          </div>

          <div style="background: #0f172a; padding: 15px; text-align: center;">
            <p style="color: #64748b; margin: 0; font-size: 12px;">
              Reply to this email or log into the admin dashboard to respond.
            </p>
          </div>
        </div>
      `,
    }),
  });

  if (!response.ok) {
    throw new Error(`Resend API error: ${response.status}`);
  }

  return response.json();
}

// SendGrid email function
async function sendWithSendGrid(params: {
  to: string;
  subject: string;
  question: string;
  email: string;
  source: string;
}) {
  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: params.to }] }],
      from: { email: process.env.SENDGRID_FROM_EMAIL || 'notifications@incentedge.com' },
      subject: params.subject,
      content: [
        {
          type: 'text/html',
          value: `
            <h2>New IncentEdge Inquiry</h2>
            <p><strong>Question:</strong></p>
            <blockquote style="background: #f5f5f5; padding: 15px; border-left: 4px solid #3b82f6;">
              ${params.question}
            </blockquote>
            <p><strong>From:</strong> ${params.email}</p>
            <p><strong>Source:</strong> ${params.source}</p>
            <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
          `,
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`SendGrid API error: ${response.status}`);
  }

  return response;
}

// Get inquiries (for admin dashboard)
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check if user is authenticated and has admin role
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');

    let query = supabase
      .from('contact_inquiries')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return NextResponse.json({ inquiries: data });
  } catch (error) {
    console.error('Error fetching inquiries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch inquiries' },
      { status: 500 }
    );
  }
}

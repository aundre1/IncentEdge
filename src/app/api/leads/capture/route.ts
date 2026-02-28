import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { SlidingWindowRateLimiter } from '@/lib/rate-limiter';
import { validateEmail } from '@/lib/email';
import { z } from 'zod';

// ============================================================================
// VALIDATION SCHEMA
// ============================================================================

const LeadCaptureSchema = z.object({
  email: z.string().email('Invalid email address'),
  company_size: z.enum(['1-10', '11-50', '50-200', '200+']).optional(),
  industry: z.string().max(100).optional(),
  project_address: z.string().max(500, 'Address too long'),
  project_type: z.enum([
    'Commercial',
    'Residential',
    'Mixed-Use',
    'Solar',
    'Wind',
    'Storage',
    'Other',
  ]),
  utm_source: z.string().max(100).optional(),
  utm_campaign: z.string().max(100).optional(),
});

type LeadCaptureInput = z.infer<typeof LeadCaptureSchema>;

// ============================================================================
// RATE LIMITING
// ============================================================================

// Max 5 submissions per IP per hour
const ipRateLimiter = new SlidingWindowRateLimiter(
  60 * 60 * 1000, // 1 hour
  5 // max 5 requests
);

// Max 1 report per email per 30 days (enforced in DB)
const emailRateLimiter = new SlidingWindowRateLimiter(
  30 * 24 * 60 * 60 * 1000, // 30 days
  1 // max 1 request per email
);

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown';
  return ip;
}

function generateMockPdfUrl(email: string, leadId: string): string {
  // Mock PDF URL - in production, this would be a real S3/Supabase URL
  // The actual PDF generation happens asynchronously after lead capture
  return `/api/reports/download?lead_id=${leadId}&email=${encodeURIComponent(email)}`;
}

// ============================================================================
// POST HANDLER - Submit lead capture form
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();

    // Get client IP for rate limiting
    const clientIp = getClientIp(request);

    // Rate limit by IP (5 per hour)
    const ipLimit = ipRateLimiter.isAllowed(`ip:${clientIp}`);
    if (!ipLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: 'Too many submissions from this IP',
          details: {
            retryAfter: Math.ceil(
              (ipLimit.resetAt - Date.now()) / 1000
            ),
          },
        },
        {
          status: 429,
          headers: {
            'Retry-After': Math.ceil(
              (ipLimit.resetAt - Date.now()) / 1000
            ).toString(),
          },
        }
      );
    }

    // Validate input
    let validatedData: LeadCaptureInput;
    try {
      validatedData = LeadCaptureSchema.parse(body);
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        return NextResponse.json(
          {
            success: false,
            error: 'Validation error',
            details: validationError.errors.map((err) => ({
              field: err.path.join('.'),
              message: err.message,
            })),
          },
          { status: 400 }
        );
      }
      throw validationError;
    }

    // Rate limit by email (1 per 30 days)
    const emailLimit = emailRateLimiter.isAllowed(`email:${validatedData.email}`);
    if (!emailLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: 'You have already generated a report this month',
          details: {
            message:
              'Each email can generate 1 free report every 30 days. Please try again later.',
            retryAfter: Math.ceil(
              (emailLimit.resetAt - Date.now()) / 1000
            ),
          },
        },
        { status: 429 }
      );
    }

    // Initialize Supabase client
    const supabase = await createClient();

    // Check if this email already has a recent report (DB-level check)
    const { data: existingLead, error: queryError } = await supabase
      .from('lead_captures')
      .select('id, last_report_generated_at, report_count')
      .eq('email', validatedData.email)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (queryError && queryError.code !== 'PGRST116') {
      // PGRST116 = no rows found (expected for new emails)
      console.error('Error checking existing lead:', queryError);
      return NextResponse.json(
        { success: false, error: 'Database error' },
        { status: 500 }
      );
    }

    // Check monthly report limit
    if (existingLead?.last_report_generated_at) {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      if (new Date(existingLead.last_report_generated_at) > thirtyDaysAgo) {
        const daysUntilNext = Math.ceil(
          (new Date(existingLead.last_report_generated_at).getTime() +
            30 * 24 * 60 * 60 * 1000 -
            Date.now()) /
            (24 * 60 * 60 * 1000)
        );

        return NextResponse.json(
          {
            success: false,
            error: 'Monthly report limit reached',
            details: {
              message: `You can generate another report in ${daysUntilNext} days.`,
              daysUntilNext,
              lastReportDate: existingLead.last_report_generated_at,
            },
          },
          { status: 429 }
        );
      }
    }

    // Insert or update lead capture record
    const { data: lead, error: insertError } = await supabase
      .from('lead_captures')
      .insert({
        email: validatedData.email,
        company_size: validatedData.company_size || null,
        industry: validatedData.industry || null,
        project_address: validatedData.project_address,
        project_type: validatedData.project_type,
        ip_address: clientIp,
        user_agent: request.headers.get('user-agent'),
        utm_source: validatedData.utm_source || null,
        utm_campaign: validatedData.utm_campaign || null,
        last_report_generated_at: new Date().toISOString(),
        report_count: (existingLead?.report_count || 0) + 1,
      })
      .select('id')
      .single();

    if (insertError) {
      console.error('Error inserting lead:', insertError);
      return NextResponse.json(
        { success: false, error: 'Failed to save lead information' },
        { status: 500 }
      );
    }

    const leadId = lead.id;

    // Generate mock PDF URL
    // In production, this would trigger an async job to generate a real PDF
    const reportUrl = generateMockPdfUrl(validatedData.email, leadId);

    // Log successful capture
    console.log('[LEAD_CAPTURE] New lead captured:', {
      leadId,
      email: validatedData.email,
      timestamp: new Date().toISOString(),
      ip: clientIp,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Lead captured successfully',
        lead: {
          id: leadId,
          email: validatedData.email,
        },
        report: {
          url: reportUrl,
          expiresIn: '30 days',
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[LEAD_CAPTURE] Unexpected error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// GET HANDLER - Retrieve lead by ID (admin/self-service)
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const leadId = searchParams.get('id');
    const email = searchParams.get('email');

    // Validate parameters
    if (!leadId && !email) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required parameter: id or email',
        },
        { status: 400 }
      );
    }

    let query = supabase.from('lead_captures').select('*');

    if (leadId) {
      query = query.eq('id', leadId);
    } else if (email) {
      query = query.eq('email', email).order('created_at', { ascending: false });
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching lead:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch lead' },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Lead not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      lead: data[0],
    });
  } catch (error) {
    console.error('[LEAD_GET] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

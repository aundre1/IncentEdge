import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

// ============================================================================
// SETTINGS API
// Manages user preferences and organization settings
// ============================================================================

export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  notifications: {
    email: boolean;
    push: boolean;
    deadlineReminders: boolean;
    applicationUpdates: boolean;
    newPrograms: boolean;
    weeklyDigest: boolean;
  };
  display: {
    defaultDashboardView: 'portfolio' | 'projects' | 'applications';
    defaultSortField: string;
    defaultSortDirection: 'asc' | 'desc';
    itemsPerPage: number;
    showTips: boolean;
  };
  defaults: {
    defaultState: string | null;
    defaultBuildingType: string | null;
    defaultSustainabilityTier: string | null;
  };
}

export interface OrganizationSettings {
  general: {
    name: string;
    legalName: string | null;
    timezone: string;
    dateFormat: string;
    currencyFormat: string;
  };
  branding: {
    logoUrl: string | null;
    primaryColor: string;
  };
  defaults: {
    defaultSustainabilityTier: string;
    defaultConstructionType: string;
    requirePrevailingWage: boolean;
    domesticContentPreference: boolean;
  };
  integrations: {
    webhookUrl: string | null;
    apiKeyEnabled: boolean;
  };
}

// Default settings
const DEFAULT_USER_SETTINGS: UserSettings = {
  theme: 'system',
  notifications: {
    email: true,
    push: true,
    deadlineReminders: true,
    applicationUpdates: true,
    newPrograms: false,
    weeklyDigest: true,
  },
  display: {
    defaultDashboardView: 'portfolio',
    defaultSortField: 'created_at',
    defaultSortDirection: 'desc',
    itemsPerPage: 20,
    showTips: true,
  },
  defaults: {
    defaultState: null,
    defaultBuildingType: null,
    defaultSustainabilityTier: null,
  },
};

// ============================================================================
// GET: Retrieve settings
// ============================================================================
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const settingsType = searchParams.get('type') || 'user'; // 'user' or 'organization'

    if (settingsType === 'user') {
      // Get user profile with preferences
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('preferences, organization_id')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Merge with defaults
      const userSettings: UserSettings = {
        ...DEFAULT_USER_SETTINGS,
        ...(profile?.preferences || {}),
      };

      return NextResponse.json({ data: userSettings });
    }

    if (settingsType === 'organization') {
      // Get user's organization
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id, role')
        .eq('id', user.id)
        .single();

      if (!profile?.organization_id) {
        return NextResponse.json({ error: 'No organization found' }, { status: 400 });
      }

      // Get organization settings
      const { data: org, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', profile.organization_id)
        .single();

      if (error) {
        console.error('Error fetching organization:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      const orgSettings: OrganizationSettings = {
        general: {
          name: org.name,
          legalName: org.legal_name,
          timezone: org.settings?.timezone || 'America/New_York',
          dateFormat: org.settings?.dateFormat || 'MM/DD/YYYY',
          currencyFormat: org.settings?.currencyFormat || 'USD',
        },
        branding: {
          logoUrl: org.settings?.logoUrl || null,
          primaryColor: org.settings?.primaryColor || '#0d9488',
        },
        defaults: {
          defaultSustainabilityTier: org.settings?.defaultSustainabilityTier || 'tier_1_efficient',
          defaultConstructionType: org.settings?.defaultConstructionType || 'new-construction',
          requirePrevailingWage: org.settings?.requirePrevailingWage || false,
          domesticContentPreference: org.settings?.domesticContentPreference || false,
        },
        integrations: {
          webhookUrl: org.settings?.webhookUrl || null,
          apiKeyEnabled: org.settings?.apiKeyEnabled || false,
        },
      };

      return NextResponse.json({
        data: orgSettings,
        meta: {
          canEdit: ['admin', 'manager'].includes(profile.role),
        },
      });
    }

    return NextResponse.json({ error: 'Invalid settings type' }, { status: 400 });
  } catch (error) {
    console.error('Error in GET /api/settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ============================================================================
// PATCH: Update settings
// ============================================================================
const updateUserSettingsSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']).optional(),
  notifications: z.object({
    email: z.boolean().optional(),
    push: z.boolean().optional(),
    deadlineReminders: z.boolean().optional(),
    applicationUpdates: z.boolean().optional(),
    newPrograms: z.boolean().optional(),
    weeklyDigest: z.boolean().optional(),
  }).optional(),
  display: z.object({
    defaultDashboardView: z.enum(['portfolio', 'projects', 'applications']).optional(),
    defaultSortField: z.string().optional(),
    defaultSortDirection: z.enum(['asc', 'desc']).optional(),
    itemsPerPage: z.number().min(10).max(100).optional(),
    showTips: z.boolean().optional(),
  }).optional(),
  defaults: z.object({
    defaultState: z.string().nullable().optional(),
    defaultBuildingType: z.string().nullable().optional(),
    defaultSustainabilityTier: z.string().nullable().optional(),
  }).optional(),
});

const updateOrgSettingsSchema = z.object({
  general: z.object({
    name: z.string().min(1).optional(),
    legalName: z.string().nullable().optional(),
    timezone: z.string().optional(),
    dateFormat: z.string().optional(),
    currencyFormat: z.string().optional(),
  }).optional(),
  branding: z.object({
    logoUrl: z.string().nullable().optional(),
    primaryColor: z.string().optional(),
  }).optional(),
  defaults: z.object({
    defaultSustainabilityTier: z.string().optional(),
    defaultConstructionType: z.string().optional(),
    requirePrevailingWage: z.boolean().optional(),
    domesticContentPreference: z.boolean().optional(),
  }).optional(),
  integrations: z.object({
    webhookUrl: z.string().nullable().optional(),
    apiKeyEnabled: z.boolean().optional(),
  }).optional(),
});

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const settingsType = searchParams.get('type') || 'user';

    const body = await request.json();

    if (settingsType === 'user') {
      // Validate user settings
      const validationResult = updateUserSettingsSchema.safeParse(body);
      if (!validationResult.success) {
        return NextResponse.json(
          { error: 'Validation failed', details: validationResult.error.errors },
          { status: 400 }
        );
      }

      // Get current preferences
      const { data: profile } = await supabase
        .from('profiles')
        .select('preferences')
        .eq('id', user.id)
        .single();

      // Merge with updates
      const currentPrefs = profile?.preferences || {};
      const updatedPrefs = deepMerge(currentPrefs, validationResult.data);

      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ preferences: updatedPrefs })
        .eq('id', user.id);

      if (updateError) {
        console.error('Error updating preferences:', updateError);
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }

      return NextResponse.json({ data: updatedPrefs });
    }

    if (settingsType === 'organization') {
      // Check permissions
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id, role')
        .eq('id', user.id)
        .single();

      if (!profile?.organization_id) {
        return NextResponse.json({ error: 'No organization found' }, { status: 400 });
      }

      if (!['admin', 'manager'].includes(profile.role)) {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
      }

      // Validate organization settings
      const validationResult = updateOrgSettingsSchema.safeParse(body);
      if (!validationResult.success) {
        return NextResponse.json(
          { error: 'Validation failed', details: validationResult.error.errors },
          { status: 400 }
        );
      }

      // Get current org settings
      const { data: org } = await supabase
        .from('organizations')
        .select('settings, name')
        .eq('id', profile.organization_id)
        .single();

      const currentSettings = org?.settings || {};
      const updates = validationResult.data;

      // Build update object
      const updateData: Record<string, unknown> = {
        settings: deepMerge(currentSettings, {
          timezone: updates.general?.timezone,
          dateFormat: updates.general?.dateFormat,
          currencyFormat: updates.general?.currencyFormat,
          logoUrl: updates.branding?.logoUrl,
          primaryColor: updates.branding?.primaryColor,
          defaultSustainabilityTier: updates.defaults?.defaultSustainabilityTier,
          defaultConstructionType: updates.defaults?.defaultConstructionType,
          requirePrevailingWage: updates.defaults?.requirePrevailingWage,
          domesticContentPreference: updates.defaults?.domesticContentPreference,
          webhookUrl: updates.integrations?.webhookUrl,
          apiKeyEnabled: updates.integrations?.apiKeyEnabled,
        }),
      };

      // Update name/legal_name separately if provided
      if (updates.general?.name) {
        updateData.name = updates.general.name;
      }
      if (updates.general?.legalName !== undefined) {
        updateData.legal_name = updates.general.legalName;
      }

      // Update organization
      const { error: updateError } = await supabase
        .from('organizations')
        .update(updateData)
        .eq('id', profile.organization_id);

      if (updateError) {
        console.error('Error updating organization:', updateError);
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }

      // Log activity
      await supabase.rpc('log_activity', {
        p_organization_id: profile.organization_id,
        p_user_id: user.id,
        p_action_type: 'update',
        p_entity_type: 'organization',
        p_entity_id: profile.organization_id,
        p_entity_name: org?.name || 'Organization',
        p_details: { updated_fields: Object.keys(updates) },
      });

      return NextResponse.json({ data: { success: true } });
    }

    return NextResponse.json({ error: 'Invalid settings type' }, { status: 400 });
  } catch (error) {
    console.error('Error in PATCH /api/settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ============================================================================
// HELPER: Deep merge objects
// ============================================================================
function deepMerge(target: any, source: any): any {
  const output = { ...target };

  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach((key) => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          Object.assign(output, { [key]: source[key] });
        } else {
          output[key] = deepMerge(target[key], source[key]);
        }
      } else if (source[key] !== undefined) {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }

  return output;
}

function isObject(item: any): boolean {
  return item && typeof item === 'object' && !Array.isArray(item);
}

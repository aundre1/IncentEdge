-- IncentEdge Database Schema
-- Migration: 005_team_permissions
-- Description: Team collaboration and granular permissions system
-- Date: 2026-01-09

-- ============================================================================
-- TEAM ROLES TABLE
-- Custom roles beyond the default admin/manager/analyst/viewer
-- ============================================================================
CREATE TABLE team_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    -- Role hierarchy level (higher = more permissions, 0 = viewer, 100 = admin)
    hierarchy_level INTEGER NOT NULL DEFAULT 0 CHECK (hierarchy_level >= 0 AND hierarchy_level <= 100),
    -- Base role to inherit from
    base_role VARCHAR(20) CHECK (base_role IN ('admin', 'manager', 'analyst', 'viewer')),
    -- Whether this is a system role (cannot be deleted)
    is_system_role BOOLEAN DEFAULT false,
    -- Whether this role can be assigned to project members
    is_project_role BOOLEAN DEFAULT true,
    -- Color for UI display
    color VARCHAR(7) DEFAULT '#6B7280', -- Hex color
    -- Metadata
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    -- Unique role name per organization
    UNIQUE(organization_id, name)
);

-- ============================================================================
-- ROLE PERMISSIONS TABLE
-- Granular permissions per role
-- ============================================================================
CREATE TABLE role_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_id UUID NOT NULL REFERENCES team_roles(id) ON DELETE CASCADE,
    -- Permission categories and actions
    resource VARCHAR(50) NOT NULL, -- project, application, document, program, report, team, settings, billing
    action VARCHAR(50) NOT NULL, -- create, read, update, delete, submit, approve, export, share, manage
    -- Scope of permission
    scope VARCHAR(20) DEFAULT 'own' CHECK (scope IN ('own', 'team', 'organization', 'all')),
    -- Conditions for the permission (JSONB for flexibility)
    conditions JSONB DEFAULT '{}',
    -- Whether this permission is granted or denied (for explicit denials)
    granted BOOLEAN DEFAULT true,
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    -- Unique permission per role
    UNIQUE(role_id, resource, action)
);

-- ============================================================================
-- PROJECT MEMBERS TABLE
-- User access to specific projects with roles
-- ============================================================================
CREATE TABLE project_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    -- Role assignment
    role VARCHAR(20) DEFAULT 'viewer' CHECK (role IN ('owner', 'admin', 'manager', 'analyst', 'viewer')),
    custom_role_id UUID REFERENCES team_roles(id) ON DELETE SET NULL,
    -- Permission overrides for this specific project
    permission_overrides JSONB DEFAULT '{}', -- {"can_edit": true, "can_submit": false, ...}
    -- Access settings
    can_view_financials BOOLEAN DEFAULT false,
    can_edit_project BOOLEAN DEFAULT false,
    can_manage_applications BOOLEAN DEFAULT false,
    can_submit_applications BOOLEAN DEFAULT false,
    can_upload_documents BOOLEAN DEFAULT false,
    can_invite_members BOOLEAN DEFAULT false,
    can_export_data BOOLEAN DEFAULT false,
    can_delete_project BOOLEAN DEFAULT false,
    -- Notification preferences for this project
    notify_on_updates BOOLEAN DEFAULT true,
    notify_on_deadlines BOOLEAN DEFAULT true,
    notify_on_status_changes BOOLEAN DEFAULT true,
    -- Access tracking
    last_accessed_at TIMESTAMPTZ,
    access_count INTEGER DEFAULT 0,
    -- Metadata
    added_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    added_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    -- Notes about the member's role
    notes TEXT,
    -- Unique membership per user per project
    UNIQUE(project_id, user_id)
);

-- ============================================================================
-- PROJECT INVITATIONS TABLE
-- Invite users to specific projects
-- ============================================================================
CREATE TABLE project_invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    -- Invitee info
    email VARCHAR(255) NOT NULL,
    -- Role to assign upon acceptance
    role VARCHAR(20) DEFAULT 'viewer' CHECK (role IN ('admin', 'manager', 'analyst', 'viewer')),
    custom_role_id UUID REFERENCES team_roles(id) ON DELETE SET NULL,
    -- Permission settings to apply upon acceptance
    permissions JSONB DEFAULT '{}', -- Stored permission settings
    -- Invitation details
    message TEXT, -- Personal message from inviter
    invited_by UUID NOT NULL REFERENCES profiles(id),
    -- Token for accepting invitation
    token VARCHAR(100) UNIQUE NOT NULL,
    -- Status
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired', 'revoked')),
    -- Timestamps
    expires_at TIMESTAMPTZ NOT NULL,
    accepted_at TIMESTAMPTZ,
    declined_at TIMESTAMPTZ,
    accepted_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    -- Index for fast lookup by email
    CONSTRAINT valid_expiry CHECK (expires_at > created_at)
);

-- ============================================================================
-- PERMISSION AUDIT LOG TABLE
-- Track permission changes for compliance
-- ============================================================================
CREATE TABLE permission_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    -- Actor
    actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    actor_email VARCHAR(255),
    -- Target
    target_type VARCHAR(50) NOT NULL, -- user, role, project_member, invitation
    target_id UUID,
    target_email VARCHAR(255),
    -- Action
    action VARCHAR(50) NOT NULL, -- grant, revoke, modify, create_role, delete_role, invite, remove
    -- Details
    resource VARCHAR(50), -- What resource was affected
    old_value JSONB, -- Previous state
    new_value JSONB, -- New state
    -- Context
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    ip_address INET,
    user_agent TEXT,
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Team Roles
CREATE INDEX idx_team_roles_organization ON team_roles(organization_id);
CREATE INDEX idx_team_roles_hierarchy ON team_roles(organization_id, hierarchy_level DESC);

-- Role Permissions
CREATE INDEX idx_role_permissions_role ON role_permissions(role_id);
CREATE INDEX idx_role_permissions_resource ON role_permissions(resource);
CREATE INDEX idx_role_permissions_lookup ON role_permissions(role_id, resource, action);

-- Project Members
CREATE INDEX idx_project_members_project ON project_members(project_id);
CREATE INDEX idx_project_members_user ON project_members(user_id);
CREATE INDEX idx_project_members_role ON project_members(role);
CREATE INDEX idx_project_members_lookup ON project_members(project_id, user_id);
CREATE INDEX idx_project_members_custom_role ON project_members(custom_role_id) WHERE custom_role_id IS NOT NULL;

-- Project Invitations
CREATE INDEX idx_project_invitations_project ON project_invitations(project_id);
CREATE INDEX idx_project_invitations_email ON project_invitations(email);
CREATE INDEX idx_project_invitations_token ON project_invitations(token);
CREATE INDEX idx_project_invitations_status ON project_invitations(status) WHERE status = 'pending';
CREATE INDEX idx_project_invitations_expires ON project_invitations(expires_at) WHERE status = 'pending';

-- Permission Audit Logs
CREATE INDEX idx_permission_audit_organization ON permission_audit_logs(organization_id);
CREATE INDEX idx_permission_audit_actor ON permission_audit_logs(actor_id);
CREATE INDEX idx_permission_audit_target ON permission_audit_logs(target_id);
CREATE INDEX idx_permission_audit_action ON permission_audit_logs(action);
CREATE INDEX idx_permission_audit_created ON permission_audit_logs(created_at DESC);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all new tables
ALTER TABLE team_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE permission_audit_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

-- Team Roles: Org members can view, admins can manage
CREATE POLICY "Org members can view team roles" ON team_roles
    FOR SELECT USING (
        organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
    );

CREATE POLICY "Org admins can manage team roles" ON team_roles
    FOR ALL USING (
        organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'manager'))
    );

-- Role Permissions: View if can view the role
CREATE POLICY "Can view role permissions" ON role_permissions
    FOR SELECT USING (
        role_id IN (
            SELECT id FROM team_roles
            WHERE organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
        )
    );

CREATE POLICY "Org admins can manage role permissions" ON role_permissions
    FOR ALL USING (
        role_id IN (
            SELECT id FROM team_roles
            WHERE organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid() AND role = 'admin')
        )
    );

-- Project Members: View if member of project or org admin
CREATE POLICY "Users can view project members" ON project_members
    FOR SELECT USING (
        -- User is a member of the project
        user_id = auth.uid()
        OR
        -- User is in the same org and has access to the project
        project_id IN (
            SELECT id FROM projects
            WHERE organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
        )
    );

CREATE POLICY "Project admins can manage members" ON project_members
    FOR ALL USING (
        -- User is project owner/admin
        project_id IN (
            SELECT project_id FROM project_members
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
        )
        OR
        -- User is org admin
        project_id IN (
            SELECT id FROM projects
            WHERE organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid() AND role = 'admin')
        )
    );

-- Project Invitations: View if inviter or invitee or org admin
CREATE POLICY "Can view project invitations" ON project_invitations
    FOR SELECT USING (
        invited_by = auth.uid()
        OR
        email = (SELECT email FROM profiles WHERE id = auth.uid())
        OR
        organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'manager'))
    );

CREATE POLICY "Can manage project invitations" ON project_invitations
    FOR ALL USING (
        invited_by = auth.uid()
        OR
        organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Permission Audit Logs: Only org admins can view
CREATE POLICY "Org admins can view audit logs" ON permission_audit_logs
    FOR SELECT USING (
        organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to check if a user has a specific permission on a project
CREATE OR REPLACE FUNCTION check_project_permission(
    p_user_id UUID,
    p_project_id UUID,
    p_permission VARCHAR
)
RETURNS BOOLEAN AS $$
DECLARE
    v_membership RECORD;
    v_org_role VARCHAR;
    v_has_permission BOOLEAN := false;
BEGIN
    -- Get user's org role
    SELECT role INTO v_org_role FROM profiles WHERE id = p_user_id;

    -- Org admins have all permissions
    IF v_org_role = 'admin' THEN
        RETURN true;
    END IF;

    -- Get project membership
    SELECT * INTO v_membership
    FROM project_members
    WHERE project_id = p_project_id AND user_id = p_user_id;

    IF NOT FOUND THEN
        RETURN false;
    END IF;

    -- Check specific permission based on column
    CASE p_permission
        WHEN 'view_financials' THEN v_has_permission := v_membership.can_view_financials;
        WHEN 'edit_project' THEN v_has_permission := v_membership.can_edit_project;
        WHEN 'manage_applications' THEN v_has_permission := v_membership.can_manage_applications;
        WHEN 'submit_applications' THEN v_has_permission := v_membership.can_submit_applications;
        WHEN 'upload_documents' THEN v_has_permission := v_membership.can_upload_documents;
        WHEN 'invite_members' THEN v_has_permission := v_membership.can_invite_members;
        WHEN 'export_data' THEN v_has_permission := v_membership.can_export_data;
        WHEN 'delete_project' THEN v_has_permission := v_membership.can_delete_project;
        ELSE v_has_permission := false;
    END CASE;

    -- Check permission overrides
    IF v_membership.permission_overrides ? p_permission THEN
        v_has_permission := (v_membership.permission_overrides->>p_permission)::boolean;
    END IF;

    -- Role-based defaults
    IF v_membership.role IN ('owner', 'admin') THEN
        v_has_permission := true;
    END IF;

    RETURN v_has_permission;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get a user's effective permissions on a project
CREATE OR REPLACE FUNCTION get_project_permissions(
    p_user_id UUID,
    p_project_id UUID
)
RETURNS JSONB AS $$
DECLARE
    v_membership RECORD;
    v_org_role VARCHAR;
    v_permissions JSONB := '{}';
BEGIN
    -- Get user's org role
    SELECT role INTO v_org_role FROM profiles WHERE id = p_user_id;

    -- Org admins have all permissions
    IF v_org_role = 'admin' THEN
        RETURN jsonb_build_object(
            'can_view', true,
            'can_view_financials', true,
            'can_edit_project', true,
            'can_manage_applications', true,
            'can_submit_applications', true,
            'can_upload_documents', true,
            'can_invite_members', true,
            'can_export_data', true,
            'can_delete_project', true,
            'role', 'admin',
            'is_org_admin', true
        );
    END IF;

    -- Get project membership
    SELECT * INTO v_membership
    FROM project_members
    WHERE project_id = p_project_id AND user_id = p_user_id;

    IF NOT FOUND THEN
        -- Check if user is in the same org (basic view access)
        IF EXISTS (
            SELECT 1 FROM projects p
            JOIN profiles pr ON pr.organization_id = p.organization_id
            WHERE p.id = p_project_id AND pr.id = p_user_id
        ) THEN
            RETURN jsonb_build_object(
                'can_view', true,
                'can_view_financials', false,
                'can_edit_project', false,
                'can_manage_applications', false,
                'can_submit_applications', false,
                'can_upload_documents', false,
                'can_invite_members', false,
                'can_export_data', false,
                'can_delete_project', false,
                'role', 'viewer',
                'is_org_member', true
            );
        END IF;
        RETURN jsonb_build_object('can_view', false);
    END IF;

    -- Build permissions from membership
    v_permissions := jsonb_build_object(
        'can_view', true,
        'can_view_financials', v_membership.can_view_financials,
        'can_edit_project', v_membership.can_edit_project,
        'can_manage_applications', v_membership.can_manage_applications,
        'can_submit_applications', v_membership.can_submit_applications,
        'can_upload_documents', v_membership.can_upload_documents,
        'can_invite_members', v_membership.can_invite_members,
        'can_export_data', v_membership.can_export_data,
        'can_delete_project', v_membership.can_delete_project,
        'role', v_membership.role,
        'custom_role_id', v_membership.custom_role_id
    );

    -- Apply permission overrides
    IF v_membership.permission_overrides IS NOT NULL AND v_membership.permission_overrides != '{}' THEN
        v_permissions := v_permissions || v_membership.permission_overrides;
    END IF;

    -- Role-based overrides
    IF v_membership.role IN ('owner', 'admin') THEN
        v_permissions := v_permissions || jsonb_build_object(
            'can_view_financials', true,
            'can_edit_project', true,
            'can_manage_applications', true,
            'can_submit_applications', true,
            'can_upload_documents', true,
            'can_invite_members', true,
            'can_export_data', true
        );
    END IF;

    IF v_membership.role = 'owner' THEN
        v_permissions := v_permissions || jsonb_build_object('can_delete_project', true);
    END IF;

    RETURN v_permissions;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to add a project member with default permissions based on role
CREATE OR REPLACE FUNCTION add_project_member(
    p_project_id UUID,
    p_user_id UUID,
    p_role VARCHAR DEFAULT 'viewer',
    p_added_by UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_member_id UUID;
    v_can_view_financials BOOLEAN := false;
    v_can_edit_project BOOLEAN := false;
    v_can_manage_applications BOOLEAN := false;
    v_can_submit_applications BOOLEAN := false;
    v_can_upload_documents BOOLEAN := false;
    v_can_invite_members BOOLEAN := false;
    v_can_export_data BOOLEAN := false;
    v_can_delete_project BOOLEAN := false;
BEGIN
    -- Set default permissions based on role
    CASE p_role
        WHEN 'owner' THEN
            v_can_view_financials := true;
            v_can_edit_project := true;
            v_can_manage_applications := true;
            v_can_submit_applications := true;
            v_can_upload_documents := true;
            v_can_invite_members := true;
            v_can_export_data := true;
            v_can_delete_project := true;
        WHEN 'admin' THEN
            v_can_view_financials := true;
            v_can_edit_project := true;
            v_can_manage_applications := true;
            v_can_submit_applications := true;
            v_can_upload_documents := true;
            v_can_invite_members := true;
            v_can_export_data := true;
            v_can_delete_project := false;
        WHEN 'manager' THEN
            v_can_view_financials := true;
            v_can_edit_project := true;
            v_can_manage_applications := true;
            v_can_submit_applications := true;
            v_can_upload_documents := true;
            v_can_invite_members := false;
            v_can_export_data := true;
            v_can_delete_project := false;
        WHEN 'analyst' THEN
            v_can_view_financials := true;
            v_can_edit_project := false;
            v_can_manage_applications := false;
            v_can_submit_applications := false;
            v_can_upload_documents := true;
            v_can_invite_members := false;
            v_can_export_data := true;
            v_can_delete_project := false;
        ELSE -- viewer
            v_can_view_financials := false;
            v_can_edit_project := false;
            v_can_manage_applications := false;
            v_can_submit_applications := false;
            v_can_upload_documents := false;
            v_can_invite_members := false;
            v_can_export_data := false;
            v_can_delete_project := false;
    END CASE;

    INSERT INTO project_members (
        project_id, user_id, role, added_by,
        can_view_financials, can_edit_project, can_manage_applications,
        can_submit_applications, can_upload_documents, can_invite_members,
        can_export_data, can_delete_project
    )
    VALUES (
        p_project_id, p_user_id, p_role, p_added_by,
        v_can_view_financials, v_can_edit_project, v_can_manage_applications,
        v_can_submit_applications, v_can_upload_documents, v_can_invite_members,
        v_can_export_data, v_can_delete_project
    )
    ON CONFLICT (project_id, user_id) DO UPDATE SET
        role = EXCLUDED.role,
        can_view_financials = EXCLUDED.can_view_financials,
        can_edit_project = EXCLUDED.can_edit_project,
        can_manage_applications = EXCLUDED.can_manage_applications,
        can_submit_applications = EXCLUDED.can_submit_applications,
        can_upload_documents = EXCLUDED.can_upload_documents,
        can_invite_members = EXCLUDED.can_invite_members,
        can_export_data = EXCLUDED.can_export_data,
        can_delete_project = EXCLUDED.can_delete_project,
        updated_at = NOW()
    RETURNING id INTO v_member_id;

    RETURN v_member_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log permission changes
CREATE OR REPLACE FUNCTION log_permission_change(
    p_organization_id UUID,
    p_actor_id UUID,
    p_target_type VARCHAR,
    p_target_id UUID,
    p_action VARCHAR,
    p_resource VARCHAR DEFAULT NULL,
    p_old_value JSONB DEFAULT NULL,
    p_new_value JSONB DEFAULT NULL,
    p_project_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_log_id UUID;
    v_actor_email VARCHAR;
    v_target_email VARCHAR;
BEGIN
    -- Get actor email
    SELECT email INTO v_actor_email FROM profiles WHERE id = p_actor_id;

    -- Get target email if target is a user
    IF p_target_type IN ('user', 'project_member') THEN
        SELECT email INTO v_target_email FROM profiles WHERE id = p_target_id;
    END IF;

    INSERT INTO permission_audit_logs (
        organization_id, actor_id, actor_email,
        target_type, target_id, target_email,
        action, resource, old_value, new_value, project_id
    )
    VALUES (
        p_organization_id, p_actor_id, v_actor_email,
        p_target_type, p_target_id, v_target_email,
        p_action, p_resource, p_old_value, p_new_value, p_project_id
    )
    RETURNING id INTO v_log_id;

    RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to accept a project invitation
CREATE OR REPLACE FUNCTION accept_project_invitation(
    p_token VARCHAR,
    p_user_id UUID
)
RETURNS JSONB AS $$
DECLARE
    v_invitation RECORD;
    v_member_id UUID;
BEGIN
    -- Get and validate invitation
    SELECT * INTO v_invitation
    FROM project_invitations
    WHERE token = p_token AND status = 'pending' AND expires_at > NOW();

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Invalid or expired invitation');
    END IF;

    -- Verify email matches
    IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = p_user_id AND email = v_invitation.email) THEN
        RETURN jsonb_build_object('success', false, 'error', 'Invitation email does not match');
    END IF;

    -- Add as project member
    v_member_id := add_project_member(
        v_invitation.project_id,
        p_user_id,
        v_invitation.role,
        v_invitation.invited_by
    );

    -- Apply custom permissions if specified
    IF v_invitation.permissions IS NOT NULL AND v_invitation.permissions != '{}' THEN
        UPDATE project_members
        SET permission_overrides = v_invitation.permissions
        WHERE id = v_member_id;
    END IF;

    -- Update invitation status
    UPDATE project_invitations
    SET status = 'accepted', accepted_at = NOW(), accepted_by = p_user_id
    WHERE id = v_invitation.id;

    -- Log the action
    PERFORM log_permission_change(
        v_invitation.organization_id,
        p_user_id,
        'invitation',
        v_invitation.id,
        'accept',
        NULL,
        NULL,
        jsonb_build_object('role', v_invitation.role, 'project_id', v_invitation.project_id),
        v_invitation.project_id
    );

    RETURN jsonb_build_object(
        'success', true,
        'member_id', v_member_id,
        'project_id', v_invitation.project_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-update updated_at for team_roles
CREATE TRIGGER update_team_roles_updated_at BEFORE UPDATE ON team_roles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-update updated_at for project_members
CREATE TRIGGER update_project_members_updated_at BEFORE UPDATE ON project_members
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger to auto-add project creator as owner
CREATE OR REPLACE FUNCTION add_project_creator_as_owner()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.created_by IS NOT NULL THEN
        PERFORM add_project_member(NEW.id, NEW.created_by, 'owner', NEW.created_by);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_project_created
    AFTER INSERT ON projects
    FOR EACH ROW EXECUTE FUNCTION add_project_creator_as_owner();

-- ============================================================================
-- DEFAULT DATA: System Roles
-- ============================================================================

-- Insert default system roles for each organization (executed via a function)
CREATE OR REPLACE FUNCTION create_default_roles_for_org(p_organization_id UUID)
RETURNS VOID AS $$
BEGIN
    -- Insert default roles if they don't exist
    INSERT INTO team_roles (organization_id, name, display_name, description, hierarchy_level, base_role, is_system_role, color)
    VALUES
        (p_organization_id, 'owner', 'Owner', 'Full access to all resources with ability to delete', 100, 'admin', true, '#DC2626'),
        (p_organization_id, 'admin', 'Administrator', 'Full access to all resources except billing', 90, 'admin', true, '#EA580C'),
        (p_organization_id, 'manager', 'Project Manager', 'Can manage projects and applications', 70, 'manager', true, '#2563EB'),
        (p_organization_id, 'analyst', 'Analyst', 'Can view and analyze data, limited edit access', 50, 'analyst', true, '#7C3AED'),
        (p_organization_id, 'viewer', 'Viewer', 'Read-only access to projects', 10, 'viewer', true, '#6B7280')
    ON CONFLICT (organization_id, name) DO NOTHING;

    -- Add default permissions for each role
    -- This would typically be done through the application layer
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create default roles when organization is created
CREATE OR REPLACE FUNCTION on_organization_created()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM create_default_roles_for_org(NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER create_org_default_roles
    AFTER INSERT ON organizations
    FOR EACH ROW EXECUTE FUNCTION on_organization_created();

-- ============================================================================
-- COMMENTS
-- ============================================================================
COMMENT ON TABLE team_roles IS 'Custom roles defined per organization';
COMMENT ON TABLE role_permissions IS 'Granular permissions assigned to roles';
COMMENT ON TABLE project_members IS 'User access to specific projects with roles and permissions';
COMMENT ON TABLE project_invitations IS 'Invitations for users to join specific projects';
COMMENT ON TABLE permission_audit_logs IS 'Audit trail for permission changes';
COMMENT ON FUNCTION check_project_permission IS 'Check if a user has a specific permission on a project';
COMMENT ON FUNCTION get_project_permissions IS 'Get all effective permissions for a user on a project';
COMMENT ON FUNCTION add_project_member IS 'Add a user as a member to a project with role-based default permissions';
COMMENT ON FUNCTION accept_project_invitation IS 'Accept a project invitation and add user as member';

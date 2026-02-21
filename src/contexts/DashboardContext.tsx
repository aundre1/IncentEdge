'use client';

import React, { createContext, useContext, useCallback, useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { useProjectUpdates, useIncentiveMatchUpdates, useNotificationUpdates } from '@/hooks/use-realtime';

// Types
interface Project {
  id: string;
  name: string;
  total_potential_incentives: number;
  total_captured_incentives: number;
  project_status: string;
  [key: string]: unknown;
}

interface DashboardStats {
  totalProjects: number;
  totalPotentialIncentives: number;
  totalCapturedIncentives: number;
  activeApplications: number;
  upcomingDeadlines: number;
  pendingActions: number;
}

interface DashboardContextValue {
  // Data
  projects: Project[];
  stats: DashboardStats | null;
  notifications: any[];
  unreadNotifications: number;

  // Loading states
  isLoading: boolean;
  isConnected: boolean;

  // Actions
  refreshProjects: () => Promise<void>;
  refreshStats: () => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;

  // Selected project
  selectedProjectId: string | null;
  setSelectedProjectId: (id: string | null) => void;
}

const DashboardContext = createContext<DashboardContextValue | undefined>(undefined);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const { user, profile } = useAuth();
  const supabase = createClient();

  // State
  const [projects, setProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  // Realtime subscriptions
  const { isConnected: projectsConnected } = useProjectUpdates(
    undefined,
    (updatedProject) => {
      setProjects((prev) =>
        prev.map((p) => (p.id === updatedProject.id ? { ...p, ...updatedProject } : p))
      );
      // Refresh stats when a project updates
      refreshStats();
    }
  );

  const { isConnected: matchesConnected } = useIncentiveMatchUpdates(
    selectedProjectId || undefined,
    () => {
      // Refresh stats when matches change
      refreshStats();
    }
  );

  const { unreadCount } = useNotificationUpdates(
    user?.id || '',
    (notification) => {
      setNotifications((prev) => [notification, ...prev]);
    }
  );

  // Fetch projects
  const refreshProjects = useCallback(async () => {
    if (!profile?.organization_id) return;

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('organization_id', profile.organization_id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setProjects(data);
    }
  }, [supabase, profile?.organization_id]);

  // Fetch dashboard stats
  const refreshStats = useCallback(async () => {
    if (!profile?.organization_id) return;

    try {
      // Get project stats
      const { data: projectData } = await supabase
        .from('projects')
        .select('total_potential_incentives, total_captured_incentives, project_status')
        .eq('organization_id', profile.organization_id);

      // Get active applications count
      const { count: activeApps } = await supabase
        .from('applications')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', profile.organization_id)
        .in('status', ['draft', 'in-progress', 'submitted', 'under-review']);

      // Get upcoming deadlines (next 30 days)
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

      const { count: upcomingDeadlines } = await supabase
        .from('applications')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', profile.organization_id)
        .lte('deadline', thirtyDaysFromNow.toISOString())
        .gte('deadline', new Date().toISOString());

      if (projectData) {
        setStats({
          totalProjects: projectData.length,
          totalPotentialIncentives: projectData.reduce(
            (sum, p) => sum + (p.total_potential_incentives || 0),
            0
          ),
          totalCapturedIncentives: projectData.reduce(
            (sum, p) => sum + (p.total_captured_incentives || 0),
            0
          ),
          activeApplications: activeApps || 0,
          upcomingDeadlines: upcomingDeadlines || 0,
          pendingActions: projectData.filter((p) => p.project_status === 'active').length,
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  }, [supabase, profile?.organization_id]);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (!user?.id) return;

    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20);

    if (data) {
      setNotifications(data);
    }
  }, [supabase, user?.id]);

  // Mark notification as read
  const markNotificationRead = useCallback(async (id: string) => {
    await supabase
      .from('notifications')
      .update({ read: true, read_at: new Date().toISOString() })
      .eq('id', id);

    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, [supabase]);

  // Mark all notifications as read
  const markAllNotificationsRead = useCallback(async () => {
    if (!user?.id) return;

    await supabase
      .from('notifications')
      .update({ read: true, read_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .eq('read', false);

    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, [supabase, user?.id]);

  // Initial load
  useEffect(() => {
    const loadDashboard = async () => {
      setIsLoading(true);
      await Promise.all([refreshProjects(), refreshStats(), fetchNotifications()]);
      setIsLoading(false);
    };

    if (profile?.organization_id && user?.id) {
      loadDashboard();
    }
  }, [profile?.organization_id, user?.id, refreshProjects, refreshStats, fetchNotifications]);

  const value: DashboardContextValue = {
    projects,
    stats,
    notifications,
    unreadNotifications: unreadCount,
    isLoading,
    isConnected: projectsConnected && matchesConnected,
    refreshProjects,
    refreshStats,
    markNotificationRead,
    markAllNotificationsRead,
    selectedProjectId,
    setSelectedProjectId,
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
}

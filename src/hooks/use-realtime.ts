'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';

// Types for realtime events
type RealtimeEvent = 'INSERT' | 'UPDATE' | 'DELETE';

interface SubscriptionConfig<T extends Record<string, unknown> = Record<string, unknown>> {
  table: string;
  schema?: string;
  event?: RealtimeEvent | '*';
  filter?: string;
  onInsert?: (payload: T) => void;
  onUpdate?: (payload: T) => void;
  onDelete?: (payload: T) => void;
  onChange?: (payload: RealtimePostgresChangesPayload<T>) => void;
}

/**
 * Hook for subscribing to Supabase realtime changes on a table
 */
export function useRealtimeSubscription<T extends Record<string, unknown> = Record<string, unknown>>(
  config: SubscriptionConfig<T>
) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const {
      table,
      schema = 'public',
      event = '*',
      filter,
      onInsert,
      onUpdate,
      onDelete,
      onChange,
    } = config;

    // Create unique channel name
    const channelName = `${schema}:${table}:${event}:${filter || 'all'}`;

    // Set up the subscription
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes' as any,
        {
          event,
          schema,
          table,
          filter,
        },
        (payload: RealtimePostgresChangesPayload<T>) => {
          setLastUpdate(new Date());

          // Call the general onChange handler
          if (onChange) {
            onChange(payload);
          }

          // Call specific handlers based on event type
          const record = payload.new as T || payload.old as T;

          switch (payload.eventType) {
            case 'INSERT':
              if (onInsert && payload.new) onInsert(payload.new as T);
              break;
            case 'UPDATE':
              if (onUpdate && payload.new) onUpdate(payload.new as T);
              break;
            case 'DELETE':
              if (onDelete && payload.old) onDelete(payload.old as T);
              break;
          }
        }
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
      });

    channelRef.current = channel;

    // Cleanup on unmount
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [config.table, config.schema, config.event, config.filter]);

  return { isConnected, lastUpdate };
}

/**
 * Hook for subscribing to project updates
 */
export function useProjectUpdates(
  projectId?: string,
  onUpdate?: (project: any) => void
) {
  return useRealtimeSubscription({
    table: 'projects',
    filter: projectId ? `id=eq.${projectId}` : undefined,
    onUpdate,
    onInsert: onUpdate,
  });
}

/**
 * Hook for subscribing to incentive match updates
 */
export function useIncentiveMatchUpdates(
  projectId?: string,
  onUpdate?: (match: any) => void
) {
  return useRealtimeSubscription({
    table: 'project_incentive_matches',
    filter: projectId ? `project_id=eq.${projectId}` : undefined,
    onUpdate,
    onInsert: onUpdate,
    onDelete: onUpdate,
  });
}

/**
 * Hook for subscribing to application status updates
 */
export function useApplicationUpdates(
  applicationId?: string,
  onUpdate?: (application: any) => void
) {
  return useRealtimeSubscription({
    table: 'applications',
    filter: applicationId ? `id=eq.${applicationId}` : undefined,
    onUpdate,
    onInsert: onUpdate,
  });
}

/**
 * Hook for subscribing to notification updates
 */
export function useNotificationUpdates(
  userId: string,
  onNewNotification?: (notification: any) => void
) {
  const [unreadCount, setUnreadCount] = useState(0);
  const supabase = createClient();

  // Fetch initial unread count
  useEffect(() => {
    const fetchUnreadCount = async () => {
      const { count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('read', false);

      setUnreadCount(count || 0);
    };

    fetchUnreadCount();
  }, [userId, supabase]);

  // Subscribe to new notifications
  const { isConnected } = useRealtimeSubscription({
    table: 'notifications',
    filter: `user_id=eq.${userId}`,
    onInsert: (notification) => {
      setUnreadCount((prev) => prev + 1);
      if (onNewNotification) {
        onNewNotification(notification);
      }
    },
    onUpdate: () => {
      // Refetch count when notification is updated (e.g., marked as read)
      supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('read', false)
        .then(({ count }) => setUnreadCount(count || 0));
    },
  });

  return { isConnected, unreadCount };
}

/**
 * Hook for subscribing to activity log updates
 */
export function useActivityUpdates(
  organizationId: string,
  onNewActivity?: (activity: any) => void
) {
  const [recentActivities, setRecentActivities] = useState<any[]>([]);

  useRealtimeSubscription({
    table: 'activity_logs',
    filter: `organization_id=eq.${organizationId}`,
    onInsert: (activity) => {
      setRecentActivities((prev) => [activity, ...prev.slice(0, 9)]);
      if (onNewActivity) {
        onNewActivity(activity);
      }
    },
  });

  return { recentActivities };
}

/**
 * Presence hook for showing who's currently viewing a project
 */
export function useProjectPresence(projectId: string, userId: string) {
  const [presentUsers, setPresentUsers] = useState<string[]>([]);
  const supabase = createClient();
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    const channel = supabase.channel(`project:${projectId}`, {
      config: {
        presence: {
          key: userId,
        },
      },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const users = Object.keys(state);
        setPresentUsers(users);
      })
      .on('presence', { event: 'join' }, ({ key }) => {
        setPresentUsers((prev) => [...prev, key]);
      })
      .on('presence', { event: 'leave' }, ({ key }) => {
        setPresentUsers((prev) => prev.filter((id) => id !== key));
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ user_id: userId, online_at: new Date().toISOString() });
        }
      });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [projectId, userId, supabase]);

  return { presentUsers };
}

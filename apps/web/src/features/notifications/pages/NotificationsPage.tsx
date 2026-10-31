import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { PageHeader } from '@/components/common/PageHeader';
import { EmptyState } from '@/components/common/EmptyState';
import { SkeletonLoader } from '@/components/common/SkeletonLoader';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Bell,
  CheckCheck,
  Calendar,
  Award,
  UserCheck,
  MessageSquare,
  Clock,
  ChevronRight,
} from 'lucide-react';
import { formatDateTime, formatTimeAgo } from '@/lib/utils';
import { NOTIFICATION_TYPES } from '@hireflow/shared';

export function NotificationsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const { data: notifications, isLoading } = useQuery<any[]>({
    queryKey: ['notifications'],
    queryFn: () => apiClient('/notifications'),
  });

  const markReadMutation = useMutation({
    mutationFn: (notifId: string) =>
      apiClient(`/notifications/${notifId}/read`, {
        method: 'PATCH',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: () =>
      apiClient('/notifications/read-all', {
        method: 'POST',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const handleNotificationClick = (notif: any) => {
    if (!notif.isRead) {
      markReadMutation.mutate(notif.id);
    }
    if (notif.link) {
      navigate(notif.link);
    }
  };

  const filteredNotifications = notifications?.filter((n) =>
    filter === 'unread' ? !n.isRead : true
  );

  const unreadCount = notifications?.filter((n) => !n.isRead).length || 0;

  const getIcon = (type: string) => {
    switch (type) {
      case NOTIFICATION_TYPES.INTERVIEW_SCHEDULED:
        return <Calendar className="h-4 w-4 text-[#0F9D78]" />;
      case NOTIFICATION_TYPES.OFFER_CREATED:
      case NOTIFICATION_TYPES.OFFER_UPDATED:
        return <Award className="h-4 w-4 text-emerald-600" />;
      case NOTIFICATION_TYPES.APPLICATION_MOVED:
      case NOTIFICATION_TYPES.APPLICATION_NEW:
        return <UserCheck className="h-4 w-4 text-blue-500" />;
      case NOTIFICATION_TYPES.MENTION:
        return <MessageSquare className="h-4 w-4 text-purple-500" />;
      default:
        return <Bell className="h-4 w-4 text-slate-400" />;
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader
        title="Activity Notifications"
        description="Real-time alerts, interview reminders, scorecard updates, and candidate status transitions"
        breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Notifications' }]}
        actions={
          unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => markAllReadMutation.mutate()}
              disabled={markAllReadMutation.isPending}
              className="gap-1.5 text-xs"
            >
              <CheckCheck className="h-4 w-4 text-[#0F9D78]" />
              <span>Mark all as read</span>
            </Button>
          )
        }
      />

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900/60 p-1 rounded-xl w-fit">
        <button
          type="button"
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            filter === 'all'
              ? 'bg-white dark:bg-[#142B3B] text-[#0F9D78] shadow-xs'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          All Activity ({notifications?.length || 0})
        </button>
        <button
          type="button"
          onClick={() => setFilter('unread')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            filter === 'unread'
              ? 'bg-white dark:bg-[#142B3B] text-[#0F9D78] shadow-xs'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {/* Notification List */}
      {isLoading ? (
        <div className="space-y-3">
          <SkeletonLoader count={6} className="h-16 rounded-xl" />
        </div>
      ) : filteredNotifications && filteredNotifications.length > 0 ? (
        <div className="space-y-2">
          {filteredNotifications.map((notif) => (
            <Card
              key={notif.id}
              onClick={() => handleNotificationClick(notif)}
              className={`p-4 transition-all flex items-start justify-between gap-4 cursor-pointer hover:border-[#0F9D78]/50 ${
                !notif.isRead
                  ? 'bg-white dark:bg-[#142B3B] border-emerald-200/80 dark:border-emerald-900/60 shadow-xs'
                  : 'bg-slate-50/50 dark:bg-slate-900/20 opacity-75'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 mt-0.5 shrink-0">
                  {getIcon(notif.type)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      {notif.title}
                    </h4>
                    {!notif.isRead && (
                      <span className="h-2 w-2 rounded-full bg-[#0F9D78]" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                    {notif.message}
                  </p>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    {formatTimeAgo(notif.createdAt)} • {formatDateTime(notif.createdAt)}
                  </span>
                </div>
              </div>

              {notif.link && (
                <div className="shrink-0 text-slate-400 mt-1">
                  <ChevronRight className="h-4 w-4" />
                </div>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Bell}
          title={filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
          description="Updates regarding candidate applications, interview evaluations, and offers will appear here."
        />
      )}
    </div>
  );
}

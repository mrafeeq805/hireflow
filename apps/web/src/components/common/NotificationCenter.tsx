import { useState, useEffect } from 'react';
import { Bell, CheckCheck, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuHeader,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { getSocket } from '@/lib/socket';
import { formatTimeAgo } from '@/lib/utils';
import { SOCKET_EVENTS } from '@hireflow/shared';

export function NotificationCenter() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: notifications = [] } = useQuery<any[]>({
    queryKey: ['notifications'],
    queryFn: () => apiClient('/notifications'),
    refetchInterval: 30000,
  });

  const markAllMutation = useMutation({
    mutationFn: () => apiClient('/notifications/mark-all-read', { method: 'POST' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const markOneMutation = useMutation({
    mutationFn: (id: string) => apiClient(`/notifications/${id}/read`, { method: 'PATCH' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  // Real-time socket listener for notifications
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleNewNotification = () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    };

    socket.on(SOCKET_EVENTS.NOTIFICATION_NEW, handleNewNotification);

    return () => {
      socket.off(SOCKET_EVENTS.NOTIFICATION_NEW, handleNewNotification);
    };
  }, [queryClient]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleNotificationClick = (item: any) => {
    if (!item.isRead) {
      markOneMutation.mutate(item.id);
    }
    if (item.link) {
      navigate(item.link);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-8 w-8 rounded-full">
          <Bell className="h-4 w-4 text-slate-600 dark:text-slate-300" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0F9D78] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0F9D78]"></span>
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-[calc(100vw-2rem)] sm:w-80 p-0 shadow-dropdown max-w-sm">
        <div className="flex items-center justify-between border-b border-slate-100 p-3 dark:border-slate-800">
          <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
            Notifications ({unreadCount} new)
          </span>
          {unreadCount > 0 && (
            <button
              onClick={() => markAllMutation.mutate()}
              className="flex items-center gap-1 text-[11px] text-[#0F9D78] hover:underline"
            >
              <CheckCheck className="h-3 w-3" />
              Mark all read
            </button>
          )}
        </div>

        <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
          {notifications.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400">
              No notifications yet
            </div>
          ) : (
            notifications.slice(0, 10).map((n) => (
              <div
                key={n.id}
                onClick={() => handleNotificationClick(n)}
                className={`p-3 text-xs cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40 ${
                  !n.isRead ? 'bg-[#D9F5EA]/20 dark:bg-[#0F9D78]/10' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-1">
                  <p className="font-semibold text-slate-800 dark:text-slate-200">
                    {n.title}
                  </p>
                  <span className="flex items-center gap-0.5 text-[10px] text-slate-400 shrink-0">
                    <Clock className="h-2.5 w-2.5" />
                    {formatTimeAgo(n.createdAt)}
                  </span>
                </div>
                <p className="mt-0.5 text-slate-500 dark:text-slate-400 line-clamp-2">
                  {n.message}
                </p>
              </div>
            ))
          )}
        </div>

        <div className="border-t border-slate-100 p-2 text-center dark:border-slate-800">
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-xs text-slate-600 dark:text-slate-300"
            onClick={() => navigate('/notifications')}
          >
            View all notifications
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}


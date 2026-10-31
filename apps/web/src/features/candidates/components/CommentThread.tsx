import { useState } from 'react';
import { Send, MessageSquare, Clock } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { formatTimeAgo, getInitials } from '@/lib/utils';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

interface CommentThreadProps {
  comments?: any[];
  candidateId?: string;
  applicationId?: string;
  jobId?: string;
}

export function CommentThread({
  comments,
  candidateId,
  applicationId,
  jobId,
}: CommentThreadProps) {
  const queryClient = useQueryClient();
  const [content, setContent] = useState('');

  const { data: fetchedComments } = useQuery<any[]>({
    queryKey: ['comments', { candidateId, applicationId, jobId }],
    queryFn: () => {
      const params = new URLSearchParams();
      if (candidateId) params.append('candidateId', candidateId);
      if (applicationId) params.append('applicationId', applicationId);
      if (jobId) params.append('jobId', jobId);
      return apiClient(`/comments?${params.toString()}`);
    },
    enabled: !comments && !!(candidateId || applicationId || jobId),
  });

  const displayComments = comments || fetchedComments || [];

  const addCommentMutation = useMutation({
    mutationFn: (newContent: string) =>
      apiClient('/comments', {
        method: 'POST',
        body: JSON.stringify({
          content: newContent,
          candidateId,
          applicationId,
          jobId,
        }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['comments'] });
      setContent('');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    addCommentMutation.mutate(content.trim());
  };

  return (
    <div className="space-y-4">
      {/* Existing Comments */}
      <div className="space-y-3">
        {displayComments.map((comment) => (
          <div
            key={comment.id}
            className="flex items-start gap-3 rounded-lg border border-slate-100 bg-slate-50/50 p-3.5 dark:border-slate-800 dark:bg-[#0B1822]/40"
          >
            <Avatar className="h-8 w-8 shrink-0 ring-1 ring-slate-200 dark:ring-slate-700">
              {comment.user?.avatarUrl && (
                <AvatarImage src={comment.user.avatarUrl} alt={comment.user.name} />
              )}
              <AvatarFallback className="text-xs">
                {getInitials(comment.user?.name)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {comment.user?.name || 'Team Member'}
                </span>
                <span className="flex items-center gap-1 text-[10px] text-slate-400">
                  <Clock className="h-2.5 w-2.5" />
                  {formatTimeAgo(comment.createdAt)}
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                {comment.content}
              </p>
            </div>
          </div>
        ))}

        {displayComments.length === 0 && (
          <div className="p-8 text-center text-xs text-slate-400">
            No internal comments yet. Share notes or mention team members below.
          </div>
        )}
      </div>

      {/* Add Comment Input */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Textarea
          rows={2}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Add an internal note or comment... Type @ to mention"
          className="text-xs"
        />
        <Button
          type="submit"
          size="sm"
          disabled={!content.trim() || addCommentMutation.isPending}
          isLoading={addCommentMutation.isPending}
          className="self-end"
        >
          <Send className="h-3.5 w-3.5 mr-1" />
          Post
        </Button>
      </form>
    </div>
  );
}

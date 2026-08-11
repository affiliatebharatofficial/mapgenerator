import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, Trash2, Flag, Reply } from 'lucide-react';
import { CommunityService } from '../../lib/supabase/communityService';
import type { Comment } from '../../types/community';
import { useAuth } from '../../lib/supabase/authStore';

interface CommentsSectionProps {
  targetId: string;
  targetType: 'map' | 'world';
  onReportContent?: (commentId: string) => void;
}

export const CommentsSection: React.FC<CommentsSectionProps> = ({ targetId, targetType, onReportContent }) => {
  const { user, profile } = useAuth();
  const userId = user?.id || 'user_guest';

  const [comments, setComments] = useState<Comment[]>([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [replyParentId, setReplyParentId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const loadComments = () => {
    const list = CommunityService.getCommentsForTarget(targetId, targetType);
    setComments(list);
  };

  useEffect(() => {
    loadComments();
  }, [targetId, targetType]);

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    CommunityService.addComment(
      userId,
      targetId,
      targetType,
      newCommentText,
      {
        name: profile?.display_name || 'Cartographer Explorer',
        username: profile?.username || 'explorer',
        avatar: profile?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces'
      }
    );

    setNewCommentText('');
    loadComments();
  };

  const handleAddReply = (parentId: string) => {
    if (!replyText.trim()) return;

    CommunityService.addComment(
      userId,
      targetId,
      targetType,
      replyText,
      {
        name: profile?.display_name || 'Cartographer Explorer',
        username: profile?.username || 'explorer',
        avatar: profile?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces'
      },
      parentId
    );

    setReplyParentId(null);
    setReplyText('');
    loadComments();
  };

  const handleDelete = (commentId: string) => {
    CommunityService.deleteComment(commentId, userId);
    loadComments();
  };

  return (
    <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6 font-sans select-none">
      <div className="flex items-center gap-2 border-b border-slate-800 pb-4">
        <MessageSquare className="w-5 h-5 text-amber-400" />
        <h3 className="font-cinzel font-bold text-lg text-slate-100">
          Community Discussions ({comments.length})
        </h3>
      </div>

      {/* Top Comment Input */}
      <form onSubmit={handleAddComment} className="flex items-center gap-3">
        <input
          type="text"
          value={newCommentText}
          onChange={(e) => setNewCommentText(e.target.value)}
          placeholder="Share your thoughts on this fantasy creation..."
          className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/40"
        />
        <button
          type="submit"
          disabled={!newCommentText.trim()}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5"
        >
          <Send className="w-3.5 h-3.5" /> Post
        </button>
      </form>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.map((cmt) => (
          <div key={cmt.id} className="p-4 bg-slate-950 border border-slate-800/80 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <img
                  src={cmt.author_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces'}
                  alt={cmt.author_name}
                  className="w-7 h-7 rounded-full object-cover border border-amber-500/30"
                />
                <div>
                  <span className="font-cinzel font-bold text-xs text-slate-100">{cmt.author_name}</span>
                  <span className="text-[10px] font-mono text-slate-400 block">@{cmt.author_username}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-slate-400">
                <button onClick={() => setReplyParentId(cmt.id)} className="hover:text-amber-300 text-xs flex items-center gap-1">
                  <Reply className="w-3.5 h-3.5" /> Reply
                </button>
                {cmt.user_id === userId && (
                  <button onClick={() => handleDelete(cmt.id)} className="hover:text-rose-400">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
                {onReportContent && (
                  <button onClick={() => onReportContent(cmt.id)} className="hover:text-amber-400">
                    <Flag className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed pl-9">{cmt.content}</p>

            {/* Replies List */}
            {cmt.replies && cmt.replies.length > 0 && (
              <div className="pl-9 pt-2 space-y-2 border-l-2 border-slate-800 ml-4">
                {cmt.replies.map((reply) => (
                  <div key={reply.id} className="p-2.5 bg-slate-900/60 rounded-lg text-xs space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-amber-200">{reply.author_name}</span>
                      <span className="text-[10px] text-slate-500 font-mono">@{reply.author_username}</span>
                    </div>
                    <p className="text-slate-300">{reply.content}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Reply Input Form */}
            {replyParentId === cmt.id && (
              <div className="pl-9 pt-2 flex items-center gap-2">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Write a reply..."
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-100"
                  autoFocus
                />
                <button
                  onClick={() => handleAddReply(cmt.id)}
                  disabled={!replyText.trim()}
                  className="px-3 py-2 bg-amber-500 text-slate-950 font-bold text-xs rounded-lg"
                >
                  Reply
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

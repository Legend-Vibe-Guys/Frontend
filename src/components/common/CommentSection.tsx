import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { commentAPI } from '../../api/api';
import { useAuth } from '../../hooks';
import type { Comment } from '../../types';
import { Send, Trash2, Edit3, X, Check, MessageSquare, ChevronUp } from 'lucide-react';
import { formatTimeKorean } from '../../utils/date';

interface CommentSectionProps {
  noticeId: string;
}

export default function CommentSection({ noticeId }: CommentSectionProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Scrollers
  const scrollEndRef = useRef<HTMLDivElement>(null);
  const [showTopBtn, setShowTopBtn] = useState(false);

  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Role-based theme
  const isTeacherSession = user?.role === 'teacher';
  
  // Reverted to Tailwind-friendly Mapping (Softer Indigo/Amber)
  const theme = {
    icon: isTeacherSession ? 'text-indigo-500' : 'text-amber-500',
    loading: isTeacherSession ? 'border-indigo-500' : 'border-amber-500',
    inputFocus: isTeacherSession ? 'focus:border-indigo-200' : 'focus:border-amber-200',
    sendBtn: isTeacherSession ? 'bg-indigo-600 shadow-indigo-100' : 'bg-amber-500 shadow-amber-100',
    selfBubble: isTeacherSession ? 'bg-indigo-500 text-white shadow-indigo-100' : 'bg-amber-500 text-white shadow-amber-100',
    editBorder: isTeacherSession ? 'border-indigo-200' : 'border-amber-200',
    editFocus: isTeacherSession ? 'focus:ring-indigo-100' : 'focus:ring-amber-100',
    editCheck: isTeacherSession ? 'text-indigo-500 hover:text-indigo-700' : 'text-amber-500 hover:text-amber-700',
    topBtn: isTeacherSession ? 'bg-indigo-600 shadow-indigo-200' : 'bg-amber-500 shadow-amber-200'
  };

  const fetchComments = async () => {
    try {
      const res = await commentAPI.getAll(noticeId);
      if (res.success) {
        setComments(res.comments);
      }
    } catch (err) {
      console.error('Failed to fetch comments', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
    
    const mainElement = document.querySelector('main');
    const handleScroll = () => {
      if (mainElement) {
        // 100px 이상 스크롤되면 버튼 표시
        setShowTopBtn(mainElement.scrollTop > 100);
      }
    };

    if (mainElement) {
      mainElement.addEventListener('scroll', handleScroll);
      // 초기 상태 체크
      handleScroll();
    }
    
    return () => {
      if (mainElement) {
        mainElement.removeEventListener('scroll', handleScroll);
      }
    };
  }, [noticeId]);

  const scrollToBottom = () => {
    scrollEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToTop = () => {
    // AppLayout의 main 요소를 찾아 직접 스크롤합니다
    const main = document.querySelector('main');
    if (main) {
      main.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const res = await commentAPI.create(noticeId, newComment.trim());
      if (res.success) {
        setComments((prev) => [...prev, res.comment]);
        setNewComment('');
        // Scroll to bottom after state update
        setTimeout(scrollToBottom, 100);
      }
    } catch (err) {
      console.error('Failed to post comment', err);
      alert('댓글 작성에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!window.confirm('댓글을 삭제하시겠습니까?')) return;

    try {
      const res = await commentAPI.delete(noticeId, commentId);
      if (res.success) {
        setComments((prev) => prev.filter((c) => c.id !== commentId));
      }
    } catch (err) {
      console.error('Failed to delete comment', err);
      alert('댓글 삭제에 실패했습니다.');
    }
  };

  const handleUpdate = async (commentId: string) => {
    if (!editContent.trim() || isUpdating) return;
    
    setIsUpdating(true);
    try {
      const res = await commentAPI.update(noticeId, commentId, editContent.trim());
      if (res.success) {
        setComments((prev) => prev.map(c => c.id === commentId ? { ...c, content: editContent.trim(), isEdited: true } : c));
        setEditingId(null);
        setEditContent('');
      }
    } catch (err) {
      console.error('Failed to update comment', err);
      alert('댓글 수정에 실패했습니다.');
    } finally {
      setIsUpdating(false);
    }
  };

  const startEditing = (comment: Comment) => {
    setEditingId(comment.id);
    setEditContent(comment.content);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className={`w-6 h-6 border-2 ${theme.loading} border-t-transparent rounded-full animate-spin`} />
      </div>
    );
  }

  return (
    <div className="mt-8 border-t border-slate-100 pt-6">
      <h3 className="text-sm font-black text-slate-800 mb-6 flex items-center gap-2">
        <MessageSquare size={16} className={theme.icon} />
        댓글 {comments.length}
      </h3>

      {/* Comment List */}
      <div className="space-y-6 mb-8">
        {comments.length === 0 ? (
          <p className="text-center text-xs text-slate-400 py-4 italic">
            따뜻한 댓글 한마디를 남겨주세요.
          </p>
        ) : (
          comments.map((comment) => {
            const isSelf = user?.uid === comment.authorUid;
            const isEditing = editingId === comment.id;

            return (
              <div key={comment.id} className={`flex gap-3 animate-fade-in group ${isSelf ? 'flex-row-reverse' : ''}`}>
                {/* Avatar - for others only */}
                {!isSelf && (
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold text-white shadow-sm shrink-0 ${
                    comment.authorRole === 'teacher' ? 'bg-indigo-400' : 'bg-amber-400'
                  }`}>
                    {comment.authorName[0]}
                  </div>
                )}

                <div className={`flex flex-col max-w-[80%] ${isSelf ? 'items-end' : 'items-start'}`}>
                  {/* Name & Role Badge & Time */}
                  <div className={`flex items-center gap-2 mb-1 ${isSelf ? 'flex-row-reverse' : ''}`}>
                    <span className="text-[11px] font-black text-slate-700">{comment.authorName}</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold ${
                      comment.authorRole === 'teacher' ? 'bg-indigo-50 text-indigo-600' : 'bg-amber-50 text-amber-600'
                    }`}>
                      {comment.authorRole === 'teacher' ? '선생님' : '학부모'}
                    </span>
                    <span className="text-[9px] text-slate-300 font-medium">
                      {formatTimeKorean(comment.createdAt)}
                    </span>
                  </div>

                  {/* Bubble */}
                  <div className="relative group/bubble">
                    {isEditing ? (
                      <div className="flex flex-col gap-2 min-w-[200px]">
                        <textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          className={`w-full text-[13px] text-slate-700 bg-white border ${theme.editBorder} rounded-xl p-3 outline-none focus:ring-2 ${theme.editFocus} transition-all font-medium`}
                          rows={2}
                          autoFocus
                        />
                        <div className="flex justify-end gap-1.5">
                          <button 
                            onClick={() => setEditingId(null)}
                            className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors"
                          >
                            <X size={14} />
                          </button>
                          <button 
                            onClick={() => handleUpdate(comment.id)}
                            className={`p-1.5 ${theme.editCheck} transition-colors`}
                          >
                            <Check size={14} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className={`px-4 py-2.5 rounded-2xl text-[13px] font-medium leading-relaxed shadow-sm ${
                        isSelf 
                          ? `${theme.selfBubble} rounded-tr-none border border-black/5` 
                          : 'bg-slate-100 text-slate-700 rounded-tl-none border border-slate-200/50'
                      }`}>
                        {comment.content}
                        {comment.isEdited && (
                          <span className={`text-[9px] ml-1.5 opacity-40 italic`}>
                            (수정됨)
                          </span>
                        )}
                      </div>
                    )}

                    {/* Subtle Actions (Self only) */}
                    {isSelf && !isEditing && (
                      <div className={`absolute top-1/2 ${isSelf ? '-left-12' : '-right-12'} -translate-y-1/2 flex gap-1 opacity-0 group-hover/bubble:opacity-100 transition-opacity`}>
                        <button
                          onClick={() => startEditing(comment)}
                          className={`p-1.5 text-slate-300 transition-colors ${isTeacherSession ? 'hover:text-indigo-500' : 'hover:text-amber-500'}`}
                        >
                          <Edit3 size={12} />
                        </button>
                        <button
                          onClick={() => handleDelete(comment.id)}
                          className="p-1.5 text-slate-300 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div ref={scrollEndRef} />

      {/* Comment Input */}
      <form onSubmit={handleSubmit} className="relative mt-8">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="댓글을 입력하세요..."
          className={`w-full bg-slate-100 border border-transparent ${theme.inputFocus} focus:bg-white rounded-2xl pl-4 pr-12 py-3.5 text-sm font-medium outline-none transition-all placeholder:text-slate-400`}
        />
        <button
          type="submit"
          disabled={!newComment.trim() || isSubmitting}
          className={`absolute right-2 top-1.5 w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-95 disabled:opacity-40 text-white ${theme.sendBtn}`}
        >
          <Send size={18} />
        </button>
      </form>

      {/* Top Button - Ultra-Mini & Ghost Center (Portal to escape animation container) */}
      {createPortal(
        <button
          onClick={scrollToTop}
          className={`fixed bottom-[81px] left-1/2 -translate-x-1/2 w-7 h-7 rounded-full shadow-md flex items-center justify-center transition-all duration-300 z-[9999] border border-white/20 bg-white/20 backdrop-blur-[2px] ${
            showTopBtn ? 'opacity-100 translate-y-0 pointer-events-auto scale-100' : 'opacity-0 translate-y-2 pointer-events-none scale-50'
          }`}
        >
          <ChevronUp size={14} className={isTeacherSession ? 'text-indigo-500' : 'text-amber-500'} />
        </button>,
        document.body
      )}
    </div>
  );
}

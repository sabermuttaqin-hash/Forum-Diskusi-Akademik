import React, { useState } from 'react';
import { Discussion } from '../types';
import { useAuth } from '../context/AuthContext';
import { 
  Pin, 
  CheckCircle, 
  MessageSquare, 
  ThumbsUp, 
  Bookmark, 
  Sparkles, 
  Trash2, 
  Building2, 
  GraduationCap,
  Clock,
  HelpCircle,
  Tag
} from 'lucide-react';

interface DiscussionCardProps {
  discussion: Discussion;
  isBookmarked: boolean;
  onOpenDetail: (discussion: Discussion) => void;
  onLike: (discussion: Discussion) => void;
  onToggleBookmark: (discussion: Discussion) => void;
  onTogglePin?: (discussion: Discussion) => void;
  onToggleResolve?: (discussion: Discussion) => void;
  onDelete?: (discussion: Discussion) => void;
  onAnalyzeAI: (discussion: Discussion) => void;
}

export const DiscussionCard: React.FC<DiscussionCardProps> = ({
  discussion,
  isBookmarked,
  onOpenDetail,
  onLike,
  onToggleBookmark,
  onTogglePin,
  onToggleResolve,
  onDelete,
  onAnalyzeAI,
}) => {
  const { currentUser } = useAuth();
  const [likeAnim, setLikeAnim] = useState(false);

  const isAdmin = currentUser?.isAdmin || currentUser?.uid === 'admin_snowprince';
  const isAuthor = currentUser?.uid === discussion.authorId;

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLikeAnim(true);
    setTimeout(() => setLikeAnim(false), 400);
    onLike(discussion);
  };

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleBookmark(discussion);
  };

  const formatDate = (isoStr: string) => {
    try {
      const date = new Date(isoStr);
      return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return 'Baru saja';
    }
  };

  const getRoleStyle = (role?: string) => {
    switch (role) {
      case 'admin':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'lecturer':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'researcher':
        return 'bg-indigo-100 text-indigo-800 border-indigo-300';
      default:
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    }
  };

  return (
    <article 
      onClick={() => onOpenDetail(discussion)}
      className={`group bg-white rounded-2xl border transition-all duration-200 p-5 cursor-pointer relative hover:shadow-md hover:border-indigo-300 ${
        discussion.isPinned 
          ? 'border-indigo-300 bg-gradient-to-b from-indigo-50/30 to-white shadow-xs' 
          : 'border-slate-200'
      }`}
    >
      {/* Top Meta Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          {/* Pinned by Admin badge */}
          {discussion.isPinned && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-300">
              <Pin className="w-3 h-3 fill-indigo-600 text-indigo-600" />
              Disematkan Admin
            </span>
          )}

          {/* Resolved/Consensus badge */}
          {discussion.isResolved && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
              <CheckCircle className="w-3 h-3 text-emerald-600" />
              Telah Tervalidasi
            </span>
          )}

          {/* Category Pill */}
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
            {discussion.category}
          </span>
        </div>

        {/* Timestamp */}
        <div className="flex items-center gap-1 text-[11px] text-slate-400">
          <Clock className="w-3 h-3" />
          <span>{formatDate(discussion.createdAt)}</span>
        </div>
      </div>

      {/* Title */}
      <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors mb-2 line-clamp-2">
        {discussion.title}
      </h3>

      {/* Excerpt */}
      <p className="text-xs sm:text-sm text-slate-600 line-clamp-3 mb-3 leading-relaxed">
        {discussion.content}
      </p>

      {/* Hypothesis / Premise Box (if provided) */}
      {discussion.hypothesis && (
        <div className="mb-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700">
          <span className="font-semibold text-indigo-900 flex items-center gap-1 mb-0.5">
            <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
            Premis / Hipotesis Riset:
          </span>
          <p className="italic text-slate-600 line-clamp-2">
            "{discussion.hypothesis}"
          </p>
        </div>
      )}

      {/* Tags */}
      {discussion.tags && discussion.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {discussion.tags.map((tag, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
            >
              <Tag className="w-2.5 h-2.5 text-slate-400" />
              {tag.startsWith('#') ? tag : `#${tag}`}
            </span>
          ))}
        </div>
      )}

      {/* Bottom Bar: Author info & Metrics */}
      <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Author info */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-[11px]">
            {discussion.authorName?.charAt(0) || 'U'}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-800 text-xs">
                {discussion.authorName}
              </span>
              <span className={`px-1.5 py-0.2 rounded-full border text-[9px] font-semibold ${getRoleStyle(discussion.authorRole)}`}>
                {discussion.authorRole === 'admin' ? 'Admin' : discussion.authorRole === 'lecturer' ? 'Dosen' : discussion.authorRole === 'researcher' ? 'Peneliti' : 'Mahasiswa'}
              </span>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-slate-500">
              <Building2 className="w-3 h-3 text-slate-400" />
              <span className="truncate max-w-[140px] sm:max-w-[200px]">{discussion.authorInstitution || 'Institusi Akademik'}</span>
            </div>
          </div>
        </div>

        {/* Metrics & Action buttons */}
        <div className="flex items-center gap-1.5">
          {/* Like button */}
          <button
            type="button"
            onClick={handleLikeClick}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              likeAnim ? 'scale-110 text-indigo-600 bg-indigo-50' : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
            }`}
            title="Apresiasi argumen ilmiah"
          >
            <ThumbsUp className={`w-3.5 h-3.5 ${likeAnim ? 'fill-indigo-600 text-indigo-600' : ''}`} />
            <span>{discussion.likesCount || 0}</span>
          </button>

          {/* Reply count */}
          <div className="flex items-center gap-1 px-2 py-1 text-xs font-semibold text-slate-600">
            <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
            <span>{discussion.repliesCount || 0}</span>
          </div>

          {/* AI Quick Analysis trigger */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onAnalyzeAI(discussion);
            }}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-medium text-indigo-700 bg-indigo-50/80 hover:bg-indigo-100 transition-all border border-indigo-200/60 cursor-pointer"
            title="Ringkas & telaah dengan Gemini AI"
          >
            <Sparkles className="w-3 h-3 text-indigo-600" />
            <span className="hidden sm:inline">AI Review</span>
          </button>

          {/* Bookmark button */}
          <button
            type="button"
            onClick={handleBookmarkClick}
            className={`p-1.5 rounded-xl transition-all cursor-pointer ${
              isBookmarked 
                ? 'text-amber-600 bg-amber-50 hover:bg-amber-100' 
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
            }`}
            title={isBookmarked ? 'Hapus dari simpanan' : 'Simpan diskusi'}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-amber-600' : ''}`} />
          </button>

          {/* Admin & Author extra controls */}
          {(isAdmin || isAuthor) && (
            <div className="flex items-center gap-1 ml-1 pl-1 border-l border-slate-200">
              {isAdmin && onTogglePin && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onTogglePin(discussion);
                  }}
                  className={`p-1.5 rounded-xl text-xs cursor-pointer ${
                    discussion.isPinned ? 'text-indigo-600 bg-indigo-50' : 'text-slate-400 hover:text-indigo-600'
                  }`}
                  title={discussion.isPinned ? 'Lepas sematan' : 'Sematkan ke atas (Admin)'}
                >
                  <Pin className="w-3.5 h-3.5" />
                </button>
              )}

              {(isAdmin || isAuthor) && onToggleResolve && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleResolve(discussion);
                  }}
                  className={`p-1.5 rounded-xl text-xs cursor-pointer ${
                    discussion.isResolved ? 'text-emerald-600 bg-emerald-50' : 'text-slate-400 hover:text-emerald-600'
                  }`}
                  title={discussion.isResolved ? 'Buka kembali diskusi' : 'Tandai tervalidasi / selesai'}
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                </button>
              )}

              {(isAdmin || isAuthor) && onDelete && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm('Hapus diskusi akademik ini?')) {
                      onDelete(discussion);
                    }
                  }}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                  title="Hapus diskusi"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  );
};

import React, { useState, useEffect, useMemo } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginView } from './components/LoginView';
import { Navbar } from './components/Navbar';
import { DiscussionCard } from './components/DiscussionCard';
import { DiscussionDetailModal } from './components/DiscussionDetailModal';
import { NewDiscussionModal } from './components/NewDiscussionModal';
import { AISuiteModal } from './components/AISuiteModal';
import { AdminPanelModal } from './components/AdminPanelModal';
import { discussionsService, ACADEMIC_CATEGORIES } from './lib/discussions';
import { Discussion, Bookmark } from './types';
import { 
  Sparkles, 
  PlusCircle, 
  Pin, 
  Bookmark as BookmarkIcon, 
  HelpCircle, 
  CheckCircle2, 
  BookOpen, 
  ShieldCheck, 
  SlidersHorizontal,
  Flame,
  Clock,
  Award,
  Layers,
  GraduationCap
} from 'lucide-react';

function AcademicForumApp() {
  const { currentUser, loading } = useAuth();

  // Discussions state
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [selectedDiscussion, setSelectedDiscussion] = useState<Discussion | null>(null);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  
  // Filter & Search state
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeFeedTab, setActiveFeedTab] = useState<'all' | 'pinned' | 'my' | 'saved' | 'verified'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'replies'>('newest');

  // Modals state
  const [isNewDiscussionOpen, setIsNewDiscussionOpen] = useState(false);
  const [isAISuiteOpen, setIsAISuiteOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);

  // Subscribe to discussions
  useEffect(() => {
    if (!currentUser) return;

    const unsub = discussionsService.subscribeDiscussions((list) => {
      setDiscussions(list);
    });

    // Load initial bookmarks for user
    const userBm = discussionsService.getUserBookmarks(currentUser.uid);
    setBookmarks(userBm);

    return () => unsub();
  }, [currentUser]);

  // Keep selectedDiscussion synced with latest discussion state
  useEffect(() => {
    if (selectedDiscussion) {
      const updated = discussions.find((d) => d.id === selectedDiscussion.id);
      if (updated) {
        setSelectedDiscussion(updated);
      }
    }
  }, [discussions]);

  // Mandatory login condition
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
        <div className="w-10 h-10 border-3 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-4" />
        <p className="text-sm font-semibold tracking-wider font-serif-academic text-indigo-300">
          Memuat Ruang Diskusi Akademik...
        </p>
      </div>
    );
  }

  // Wajib Login Guard: Render Login View if user is not authenticated
  if (!currentUser) {
    return <LoginView />;
  }

  // Filter and sort discussions
  const filteredDiscussions = useMemo(() => {
    return discussions
      .filter((disc) => {
        // Tab filtering
        if (activeFeedTab === 'pinned' && !disc.isPinned) return false;
        if (activeFeedTab === 'verified' && !disc.isResolved) return false;
        if (activeFeedTab === 'my' && disc.authorId !== currentUser.uid) return false;
        if (activeFeedTab === 'saved') {
          const isSaved = bookmarks.some((b) => b.discussionId === disc.id);
          if (!isSaved) return false;
        }

        // Category filter
        if (selectedCategory !== 'all') {
          const catObj = ACADEMIC_CATEGORIES.find((c) => c.id === selectedCategory);
          if (catObj && disc.category !== catObj.name) return false;
        }

        // Search filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = disc.title?.toLowerCase().includes(q);
          const matchContent = disc.content?.toLowerCase().includes(q);
          const matchAuthor = disc.authorName?.toLowerCase().includes(q);
          const matchTags = disc.tags?.some((t) => t.toLowerCase().includes(q));
          if (!matchTitle && !matchContent && !matchAuthor && !matchTags) return false;
        }

        return true;
      })
      .sort((a, b) => {
        // Pinned always on top if in 'all' tab
        if (activeFeedTab === 'all') {
          if (a.isPinned && !b.isPinned) return -1;
          if (!a.isPinned && b.isPinned) return 1;
        }

        if (sortBy === 'popular') {
          return (b.likesCount || 0) - (a.likesCount || 0);
        }
        if (sortBy === 'replies') {
          return (b.repliesCount || 0) - (a.repliesCount || 0);
        }
        // Default: newest
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [discussions, activeFeedTab, selectedCategory, searchQuery, sortBy, currentUser.uid, bookmarks]);

  // Handlers
  const handleLike = async (disc: Discussion) => {
    await discussionsService.toggleLike(disc.id, disc.likesCount || 0);
  };

  const handleToggleBookmark = async (disc: Discussion) => {
    await discussionsService.toggleBookmark(currentUser.uid, disc);
    const updatedBm = discussionsService.getUserBookmarks(currentUser.uid);
    setBookmarks(updatedBm);
  };

  const handleTogglePin = async (disc: Discussion) => {
    await discussionsService.togglePin(disc.id, disc.isPinned);
  };

  const handleToggleResolve = async (disc: Discussion) => {
    await discussionsService.toggleResolve(disc.id, disc.isResolved);
  };

  const handleDelete = async (disc: Discussion) => {
    await discussionsService.deleteDiscussion(disc.id);
    if (selectedDiscussion?.id === disc.id) {
      setSelectedDiscussion(null);
    }
  };

  const handleCreateDiscussion = async (data: {
    title: string;
    content: string;
    category: string;
    hypothesis?: string;
    tags: string[];
  }) => {
    const created = await discussionsService.createDiscussion({
      ...data,
      authorId: currentUser.uid,
      authorName: currentUser.displayName,
      authorRole: currentUser.role,
      authorInstitution: currentUser.institution || 'Institusi Akademik',
    });
    setSelectedDiscussion(created);
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans">
      {/* Top Navbar with search and logout button */}
      <Navbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenNewDiscussion={() => setIsNewDiscussionOpen(true)}
        onOpenAISuite={() => setIsAISuiteOpen(true)}
        onOpenAdminPanel={() => setIsAdminPanelOpen(true)}
      />

      {/* Hero / Academic Mission Banner */}
      <section className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white py-8 px-4 sm:px-6 lg:px-8 border-b border-indigo-950 relative overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 flex items-center gap-1">
                <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
                Ruang Diskusi & Peer Review Terbuka
              </span>
              {currentUser.isAdmin && (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-400/30 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  Mode Admin: SnowPrince
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-serif-academic leading-tight mb-2">
              Kaji Metodologi, Uji Hipotesis, dan Sintesis Riset Bersama
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Selamat datang, <strong className="text-white">{currentUser.displayName}</strong> ({currentUser.institution}). Diskusikan naskah ilmiah Anda dan gunakan instrumen server-side Gemini AI untuk telaah pustaka dan peer review otomatis.
            </p>
          </div>

          {/* Quick AI & Create Buttons */}
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setIsAISuiteOpen(true)}
              className="flex-1 sm:flex-initial py-2.5 px-4 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-400/40 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
            >
              <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
              <span>Studio Riset AI</span>
            </button>

            <button
              type="button"
              onClick={() => setIsNewDiscussionOpen(true)}
              className="flex-1 sm:flex-initial py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-white" />
              <span>+ Buat Diskusi Baru</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1">
        
        {/* Category Horizontal Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-4 scrollbar-none">
          {ACADEMIC_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Feed Control Bar: Tabs & Sorting */}
        <div className="bg-white rounded-2xl border border-slate-200 p-2 sm:p-3 mb-6 shadow-xs flex flex-wrap items-center justify-between gap-3">
          
          {/* Feed Filter Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveFeedTab('all')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                activeFeedTab === 'all'
                  ? 'bg-indigo-50 text-indigo-800 border border-indigo-200'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Semua Diskusi</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveFeedTab('pinned')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                activeFeedTab === 'pinned'
                  ? 'bg-indigo-50 text-indigo-800 border border-indigo-200'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Pin className="w-3.5 h-3.5 text-indigo-600" />
              <span>Disematkan</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveFeedTab('verified')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                activeFeedTab === 'verified'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Tervalidasi Ilmiah</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveFeedTab('saved')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                activeFeedTab === 'saved'
                  ? 'bg-amber-50 text-amber-800 border border-amber-200'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <BookmarkIcon className="w-3.5 h-3.5 text-amber-600" />
              <span>Disimpan ({bookmarks.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveFeedTab('my')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                activeFeedTab === 'my'
                  ? 'bg-indigo-50 text-indigo-800 border border-indigo-200'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span>Pertanyaan Saya</span>
            </button>
          </div>

          {/* Sorting Dropdown */}
          <div className="flex items-center gap-2 text-xs ml-auto">
            <span className="text-slate-400 font-medium hidden sm:inline">Urutkan:</span>
            <div className="flex items-center bg-slate-100 rounded-xl p-0.5 border border-slate-200">
              <button
                type="button"
                onClick={() => setSortBy('newest')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1 ${
                  sortBy === 'newest' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Clock className="w-3 h-3" />
                <span>Terbaru</span>
              </button>

              <button
                type="button"
                onClick={() => setSortBy('popular')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1 ${
                  sortBy === 'popular' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Flame className="w-3 h-3 text-amber-500" />
                <span>Populer</span>
              </button>

              <button
                type="button"
                onClick={() => setSortBy('replies')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  sortBy === 'replies' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Tanggapan
              </button>
            </div>
          </div>

        </div>

        {/* Discussion Cards Feed */}
        {filteredDiscussions.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800 mb-1">
              Tidak ada diskusi ditemukan
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
              Coba ganti kata kunci pencarian, ubah filter kategori, atau mulai topik kajian pertama Anda.
            </p>
            <button
              type="button"
              onClick={() => setIsNewDiscussionOpen(true)}
              className="py-2 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs rounded-xl shadow-xs transition-all cursor-pointer"
            >
              + Buat Topik Diskusi Baru
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredDiscussions.map((disc) => (
              <DiscussionCard
                key={disc.id}
                discussion={disc}
                isBookmarked={bookmarks.some((b) => b.discussionId === disc.id)}
                onOpenDetail={(d) => setSelectedDiscussion(d)}
                onLike={handleLike}
                onToggleBookmark={handleToggleBookmark}
                onTogglePin={currentUser.isAdmin ? handleTogglePin : undefined}
                onToggleResolve={handleToggleResolve}
                onDelete={handleDelete}
                onAnalyzeAI={(d) => {
                  setSelectedDiscussion(d);
                }}
              />
            ))}
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-indigo-600" />
            <span className="font-bold text-slate-800">Ruang Diskusi Akademik</span>
            <span>—</span>
            <span>Platform Komprehensif Riset & Verifikasi Ilmiah</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span>Admin: <strong className="text-slate-600 font-mono">SnowPrince</strong></span>
            <span>•</span>
            <span>Firestore Multi-User</span>
            <span>•</span>
            <span>Express /api (Vercel Ready)</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {selectedDiscussion && (
        <DiscussionDetailModal
          discussion={selectedDiscussion}
          onClose={() => setSelectedDiscussion(null)}
          onLike={handleLike}
        />
      )}

      <NewDiscussionModal
        isOpen={isNewDiscussionOpen}
        onClose={() => setIsNewDiscussionOpen(false)}
        onSubmit={handleCreateDiscussion}
      />

      <AISuiteModal
        isOpen={isAISuiteOpen}
        onClose={() => setIsAISuiteOpen(false)}
      />

      <AdminPanelModal
        isOpen={isAdminPanelOpen}
        onClose={() => setIsAdminPanelOpen(false)}
        discussionsCount={discussions.length}
      />

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AcademicForumApp />
    </AuthProvider>
  );
}

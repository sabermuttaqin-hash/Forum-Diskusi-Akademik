import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  GraduationCap, 
  LogOut, 
  PlusCircle, 
  Sparkles, 
  ShieldCheck, 
  Search,
  BookOpen,
  Award,
  UserCheck
} from 'lucide-react';

interface NavbarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenNewDiscussion: () => void;
  onOpenAISuite: () => void;
  onOpenAdminPanel: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  searchQuery,
  onSearchChange,
  onOpenNewDiscussion,
  onOpenAISuite,
  onOpenAdminPanel,
}) => {
  const { currentUser, logout } = useAuth();

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'admin':
        return { label: 'Administrator', bg: 'bg-amber-100 text-amber-800 border-amber-300' };
      case 'lecturer':
        return { label: 'Dosen / Peneliti Senior', bg: 'bg-purple-100 text-purple-800 border-purple-300' };
      case 'researcher':
        return { label: 'Peneliti', bg: 'bg-indigo-100 text-indigo-800 border-indigo-300' };
      default:
        return { label: 'Mahasiswa', bg: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
    }
  };

  const roleInfo = getRoleBadge(currentUser?.role);

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Academic Brand */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-slate-900 to-indigo-900 text-white shadow-md">
              <GraduationCap className="w-6 h-6 text-indigo-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 tracking-tight text-base sm:text-lg font-serif-academic">
                  Ruang Diskusi Akademik
                </span>
                <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Konsorsium Riset
                </span>
              </div>
              <p className="hidden sm:block text-[11px] text-slate-500 font-medium">
                Forum Diskusi Metodologi, Teori & Review Ilmiah
              </p>
            </div>
          </div>

          {/* Search bar */}
          <div className="flex-1 max-w-md hidden md:block">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Cari topik diskusi, metodologi, nama peneliti, atau tag..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-1.5 pl-10 pr-4 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Quick Actions & User Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* AI Assistant Button */}
            <button
              type="button"
              onClick={onOpenAISuite}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-indigo-50 to-blue-50 text-indigo-700 hover:from-indigo-100 hover:to-blue-100 border border-indigo-200/80 shadow-xs transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
              <span className="hidden sm:inline">AI Akademik</span>
            </button>

            {/* Create Discussion Button */}
            <button
              type="button"
              onClick={onOpenNewDiscussion}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white shadow-xs transition-all cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5 text-indigo-300" />
              <span className="hidden sm:inline">Diskusi Baru</span>
              <span className="sm:hidden">Tulis</span>
            </button>

            {/* Admin Dashboard trigger (if admin) */}
            {currentUser?.isAdmin && (
              <button
                type="button"
                onClick={onOpenAdminPanel}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-300 hover:bg-amber-100 transition-all cursor-pointer"
                title="Buka Dasbor Admin SnowPrince"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                <span className="hidden lg:inline">Panel Admin</span>
              </button>
            )}

            {/* User Profile Pill */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="text-right hidden sm:block">
                <div className="flex items-center justify-end gap-1.5">
                  <span className="text-xs font-bold text-slate-800 truncate max-w-[120px]">
                    {currentUser?.displayName}
                  </span>
                  {currentUser?.isAdmin && (
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500 text-white">
                      ADMIN
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-end gap-1 text-[10px] text-slate-500">
                  <span className={`px-1.5 py-0.2 rounded-full border text-[9px] font-medium ${roleInfo.bg}`}>
                    {roleInfo.label}
                  </span>
                  <span className="flex items-center gap-0.5 text-amber-600 font-semibold">
                    <Award className="w-2.5 h-2.5" />
                    {currentUser?.reputation || 100}
                  </span>
                </div>
              </div>

              {/* User Avatar */}
              <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs ring-2 ring-indigo-500/30 overflow-hidden shrink-0">
                {currentUser?.photoURL ? (
                  <img src={currentUser.photoURL} alt={currentUser.displayName} className="w-full h-full object-cover" />
                ) : (
                  currentUser?.displayName?.charAt(0) || 'A'
                )}
              </div>

              {/* Prominent Logout Button */}
              <button
                type="button"
                onClick={logout}
                className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-all cursor-pointer flex items-center gap-1"
                title="Keluar dari akun"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-xs font-semibold hidden md:inline">Keluar</span>
              </button>
            </div>

          </div>
        </div>

        {/* Mobile search bar */}
        <div className="pb-3 md:hidden">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Cari topik diskusi atau nama peneliti..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-1.5 pl-9 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>
    </header>
  );
};

import React, { useState } from 'react';
import { CourseRoom, ScenarioType } from '../types';
import { useAuth } from '../context/AuthContext';
import { 
  GraduationCap, 
  PlusCircle, 
  KeyRound, 
  Compass, 
  Swords, 
  Flame, 
  Users, 
  UploadCloud, 
  ArrowRight, 
  LogOut, 
  Sparkles,
  BookOpen,
  Search,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

interface RoomListViewProps {
  rooms: CourseRoom[];
  onSelectRoom: (room: CourseRoom) => void;
  onOpenCreateModal: () => void;
  onOpenJoinModal: () => void;
  onOpenAISuite: () => void;
}

export const RoomListView: React.FC<RoomListViewProps> = ({
  rooms,
  onSelectRoom,
  onOpenCreateModal,
  onOpenJoinModal,
  onOpenAISuite,
}) => {
  const { currentUser, logout } = useAuth();
  const isAdmin = currentUser?.isAdmin || currentUser?.role === 'admin' || currentUser?.role === 'lecturer';

  const [searchQuery, setSearchQuery] = useState('');
  const [filterScenario, setFilterScenario] = useState<'all' | ScenarioType>('all');

  // Filter rooms
  // If student: show rooms where currentUser.uid is member, or allow viewing public course catalog
  const myRooms = rooms.filter(r => r.members.includes(currentUser?.uid || ''));

  const filteredRooms = (myRooms.length > 0 ? myRooms : rooms).filter(r => {
    if (filterScenario !== 'all' && r.discussionScenario !== filterScenario) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = r.name.toLowerCase().includes(q);
      const matchCode = r.roomCode.toLowerCase().includes(q);
      const matchSubject = r.subject.toLowerCase().includes(q);
      const matchTeacher = r.teacherName.toLowerCase().includes(q);
      if (!matchName && !matchCode && !matchSubject && !matchTeacher) return false;
    }
    return true;
  });

  const getScenarioInfo = (type: ScenarioType) => {
    switch (type) {
      case 'expedition':
        return { label: 'The Expedition Choice', icon: Compass, color: 'text-violet-400 bg-violet-500/10 border-violet-500/20' };
      case 'clash':
        return { label: 'The Clash Arena', icon: Swords, color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' };
      case 'buzz':
        return { label: 'The Buzz Chamber', icon: Flame, color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' };
      default:
        return { label: 'The Expedition Choice', icon: Compass, color: 'text-violet-400 bg-violet-500/10 border-violet-500/20' };
    }
  };

  return (
    <div className="min-h-screen bg-[#080911] text-slate-100 flex flex-col font-sans selection:bg-violet-500/30 selection:text-violet-200">
      
      {/* Lamatic GenAI Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-gradient-to-b from-violet-600/10 via-indigo-600/10 to-transparent blur-[120px] pointer-events-none" />

      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 bg-[#0B0D17]/80 backdrop-blur-xl border-b border-white/10 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            
            {/* Logo */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-500 p-0.5 shadow-md shadow-violet-500/20">
                <div className="w-full h-full bg-[#0B0D17] rounded-[10px] flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-violet-400" />
                </div>
              </div>
              <div>
                <span className="font-extrabold text-white text-base font-serif-academic tracking-tight">
                  Ruang Diskusi Akademik
                </span>
                <span className="hidden sm:inline-block ml-2 px-2 py-0.2 rounded-full text-[10px] font-semibold bg-violet-500/10 border border-violet-500/20 text-violet-300">
                  Google Classroom Hub
                </span>
              </div>
            </div>

            {/* Search Input */}
            <div className="flex-1 max-w-md hidden md:block">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari ruang kelas, pengampu, atau kode room..."
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-1.5 pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
            </div>

            {/* User Controls & Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              
              {/* AI Suite Trigger */}
              <button
                type="button"
                onClick={onOpenAISuite}
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-violet-300 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-violet-400 animate-pulse" />
                <span className="hidden sm:inline">AI Studio</span>
              </button>

              {/* Join Room Button */}
              <button
                type="button"
                onClick={onOpenJoinModal}
                className="px-3.5 py-1.5 rounded-xl bg-violet-600/20 hover:bg-violet-600/30 border border-violet-500/30 text-xs font-semibold text-violet-200 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Gabung Room</span>
              </button>

              {/* Create Room Button (Teachers / Admins) */}
              {isAdmin && (
                <button
                  type="button"
                  onClick={onOpenCreateModal}
                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Buat Room</span>
                </button>
              )}

              {/* User Avatar & Logout */}
              <div className="flex items-center gap-2 pl-2 border-l border-white/10">
                <div className="text-right hidden sm:block">
                  <div className="flex items-center justify-end gap-1.5">
                    <span className="text-xs font-bold text-white max-w-[120px] truncate">
                      {currentUser?.displayName}
                    </span>
                    {currentUser?.isAdmin && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        ADMIN
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 block capitalize">
                    {currentUser?.role === 'admin' ? 'Pengajar Utama' : currentUser?.role}
                  </span>
                </div>

                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs ring-2 ring-white/10">
                  {currentUser?.displayName?.charAt(0) || 'U'}
                </div>

                <button
                  type="button"
                  onClick={logout}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all cursor-pointer"
                  title="Keluar dari akun"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>

            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1 space-y-8">
        
        {/* Hero Banner: Classroom Hub with Lamatic Aesthetic */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-violet-950/40 via-indigo-950/20 to-[#0F111E] border border-white/10 shadow-2xl relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-violet-500/10 border border-violet-500/20 text-violet-300 flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-violet-400" />
                  Google Classroom Style Discussion Suite
                </span>
                {currentUser?.isAdmin && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 border border-amber-500/30 text-amber-300">
                    Akun Pengajar: SnowPrince
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-serif-academic mb-2">
                Ruang Perkuliahan & Pemodelan Diskusi
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Pilih ruang kelas untuk masuk ke materi, pengumpulan tugas, dan simulasi diskusi interaktif (The Expedition Choice, The Clash Arena, atau The Buzz Chamber).
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={onOpenJoinModal}
                className="py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white transition-all cursor-pointer"
              >
                + Masukkan Kode Room
              </button>
              {isAdmin && (
                <button
                  type="button"
                  onClick={onOpenCreateModal}
                  className="py-2.5 px-4 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-lg shadow-violet-600/30 transition-all cursor-pointer"
                >
                  + Buat Kelas Baru
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Filter Pills (All / Expedition / Clash / Buzz) */}
        <div className="flex items-center justify-between gap-4 pb-2 border-b border-white/5">
          <div className="flex items-center gap-2 overflow-x-auto text-xs font-semibold">
            <button
              type="button"
              onClick={() => setFilterScenario('all')}
              className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                filterScenario === 'all'
                  ? 'bg-violet-600/30 border-violet-500 text-violet-200'
                  : 'bg-white/[0.02] border-white/10 text-slate-400 hover:text-white'
              }`}
            >
              Semua Ruang ({filteredRooms.length})
            </button>

            <button
              type="button"
              onClick={() => setFilterScenario('expedition')}
              className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
                filterScenario === 'expedition'
                  ? 'bg-violet-600/30 border-violet-500 text-violet-200'
                  : 'bg-white/[0.02] border-white/10 text-slate-400 hover:text-white'
              }`}
            >
              <Compass className="w-3.5 h-3.5 text-violet-400" />
              <span>Model Ekspedisi</span>
            </button>

            <button
              type="button"
              onClick={() => setFilterScenario('clash')}
              className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
                filterScenario === 'clash'
                  ? 'bg-indigo-600/30 border-indigo-500 text-indigo-200'
                  : 'bg-white/[0.02] border-white/10 text-slate-400 hover:text-white'
              }`}
            >
              <Swords className="w-3.5 h-3.5 text-indigo-400" />
              <span>Model Debat Clash</span>
            </button>

            <button
              type="button"
              onClick={() => setFilterScenario('buzz')}
              className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
                filterScenario === 'buzz'
                  ? 'bg-cyan-600/30 border-cyan-500 text-cyan-200'
                  : 'bg-white/[0.02] border-white/10 text-slate-400 hover:text-white'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-cyan-400" />
              <span>Model Buzz Chamber</span>
            </button>
          </div>

          <span className="text-xs text-slate-400 hidden sm:inline">
            Menampilkan {filteredRooms.length} Ruang Kelas
          </span>
        </div>

        {/* Empty state: If user has no rooms */}
        {myRooms.length === 0 && (
          <div className="p-8 sm:p-12 rounded-3xl bg-[#0F111E] border border-white/10 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-violet-600/20 text-violet-400 flex items-center justify-center mx-auto">
              <BookOpen className="w-7 h-7" />
            </div>
            <div className="max-w-md mx-auto">
              <h3 className="text-lg font-bold text-white mb-1">
                Anda Belum Tergabung ke Ruang Kelas Tertentu
              </h3>
              <p className="text-xs sm:text-sm text-slate-400">
                Masukkan kode room dari pengampu Anda untuk bergabung, atau pilih salah satu kelas di bawah untuk langsung mencoba skenario diskusi.
              </p>
            </div>
            <button
              type="button"
              onClick={onOpenJoinModal}
              className="py-2.5 px-6 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs shadow-md transition-all cursor-pointer inline-flex items-center gap-2"
            >
              <KeyRound className="w-4 h-4" />
              <span>Gabung Kelas dengan Kode</span>
            </button>
          </div>
        )}

        {/* Google Classroom Grid Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRooms.map((room) => {
            const scInfo = getScenarioInfo(room.discussionScenario);
            const ScIcon = scInfo.icon;
            const isMember = room.members.includes(currentUser?.uid || '');

            return (
              <div
                key={room.id}
                onClick={() => onSelectRoom(room)}
                className="group rounded-3xl bg-[#0F111E] border border-white/10 hover:border-violet-500/40 hover:shadow-2xl hover:shadow-violet-950/20 transition-all duration-300 overflow-hidden flex flex-col justify-between cursor-pointer"
              >
                {/* Classroom Header Banner */}
                <div className={`p-6 bg-gradient-to-r ${room.bannerGradient} relative text-white space-y-2`}>
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border backdrop-blur-md ${scInfo.color}`}>
                      <ScIcon className="w-3 h-3" />
                      <span>{scInfo.label}</span>
                    </span>
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-black/40 text-violet-200 border border-white/10">
                      {room.roomCode}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold font-serif-academic line-clamp-2 group-hover:text-violet-200 transition-colors">
                    {room.name}
                  </h3>

                  <p className="text-[11px] text-slate-300 font-medium">
                    {room.section}
                  </p>

                  <div className="pt-2 text-xs text-slate-200 flex items-center justify-between border-t border-white/10">
                    <span>Pengampu: {room.teacherName}</span>
                    <span className="text-[10px] text-slate-300">{room.subject}</span>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                  <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                    {room.description}
                  </p>

                  {/* Metrics Bar: Members & Assignments */}
                  <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-slate-500" />
                      <span>{room.members.length} Mahasiswa</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <UploadCloud className="w-3.5 h-3.5 text-violet-400" />
                      <span>{room.assignments.length} Tugas</span>
                    </div>

                    <span className="text-violet-400 font-semibold group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                      <span>Buka Room</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>

              </div>
            );
          })}
        </div>

      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto px-6 py-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <div>
          <span>Ruang Diskusi Akademik — Hybrid Learning & Multi-Scenario Classroom</span>
        </div>
        <div className="flex items-center gap-4 text-slate-400">
          <span>Admin Kredensial: SnowPrince</span>
          <span>•</span>
          <span>Google Sign-In Ready</span>
          <span>•</span>
          <span>Express Backend AI</span>
        </div>
      </footer>

    </div>
  );
};

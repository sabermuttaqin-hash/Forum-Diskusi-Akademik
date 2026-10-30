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
  CheckCircle2, 
  PackageCheck,
  Layers 
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
  const [filterJenjang, setFilterJenjang] = useState<string>('all');

  const myRooms = rooms.filter(r => r.members.includes(currentUser?.uid || ''));

  const filteredRooms = (myRooms.length > 0 ? myRooms : rooms).filter(r => {
    if (filterJenjang !== 'all' && (r.jenjang || 'Perguruan Tinggi') !== filterJenjang) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = r.name.toLowerCase().includes(q);
      const matchCode = r.roomCode.toLowerCase().includes(q);
      const matchSubject = r.subject.toLowerCase().includes(q);
      const matchTeacher = r.teacherName.toLowerCase().includes(q);
      const matchJenjang = (r.jenjang || '').toLowerCase().includes(q);
      if (!matchName && !matchCode && !matchSubject && !matchTeacher && !matchJenjang) return false;
    }
    return true;
  });

  const getScenarioInfo = (type: ScenarioType) => {
    switch (type) {
      case 'expedition':
        return { label: 'The Expedition Choice', icon: Compass, color: 'text-amber-900 bg-amber-100 border-amber-300' };
      case 'clash':
        return { label: 'The Clash Arena', icon: Swords, color: 'text-rose-900 bg-rose-100 border-rose-300' };
      case 'buzz':
        return { label: 'The Buzz Chamber', icon: Flame, color: 'text-cyan-900 bg-cyan-100 border-cyan-300' };
      default:
        return { label: 'The Expedition Choice', icon: Compass, color: 'text-amber-900 bg-amber-100 border-amber-300' };
    }
  };

  const getCardHeaderColor = (idx: number) => {
    const palettes = [
      'bg-gradient-to-r from-amber-400 via-rose-400 to-rose-500 text-white',
      'bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-500 text-white',
      'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white',
    ];
    return palettes[idx % palettes.length];
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-slate-800 flex flex-col font-sans">
      
      {/* Top Navigation Bar in ToyStore Friendly Clean Style */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b-2 border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 gap-4">
            
            {/* Logo */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="w-12 h-12 rounded-2xl bg-rose-500 text-white flex items-center justify-center shadow-sm">
                <GraduationCap className="w-7 h-7" />
              </div>
              <div>
                <span className="font-extrabold text-slate-900 text-xl font-brand tracking-tight">
                  Ruang Diskusi Akademik
                </span>
                <span className="hidden sm:inline-block ml-2 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                  Google Classroom Hub
                </span>
              </div>
            </div>

            {/* Search Input */}
            <div className="flex-1 max-w-md hidden md:block">
              <div className="relative">
                <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari ruang kelas, nama pengampu, atau kode room..."
                  className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl py-2.5 pl-12 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-rose-400 focus:bg-white transition-all font-medium"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              
              {/* AI Suite Trigger */}
              <button
                type="button"
                onClick={onOpenAISuite}
                className="px-4 py-2.5 rounded-2xl bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer shadow-xs"
              >
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span className="hidden sm:inline">AI Studio</span>
              </button>

              {/* Join Room Button */}
              <button
                type="button"
                onClick={onOpenJoinModal}
                className="px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer"
              >
                <KeyRound className="w-4 h-4 text-slate-600" />
                <span>Gabung Room</span>
              </button>

              {/* Create Room Button (Teachers / Admins) */}
              {isAdmin && (
                <button
                  type="button"
                  onClick={onOpenCreateModal}
                  className="px-4 py-2.5 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white text-xs sm:text-sm font-bold shadow-sm flex items-center gap-2 transition-all cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span className="hidden sm:inline">Buat Kelas Baru</span>
                </button>
              )}

              {/* User Profile & Logout */}
              <div className="flex items-center gap-2.5 pl-3 border-l-2 border-slate-200">
                <div className="text-right hidden sm:block">
                  <span className="text-sm font-extrabold text-slate-900 block max-w-[130px] truncate">
                    {currentUser?.displayName}
                  </span>
                  <span className="text-xs text-rose-600 font-bold capitalize">
                    {currentUser?.role === 'admin' ? 'Pengajar Utama' : currentUser?.role}
                  </span>
                </div>

                <div className="w-10 h-10 rounded-2xl bg-rose-500 text-white flex items-center justify-center font-black text-sm shadow-xs">
                  {currentUser?.displayName?.charAt(0) || 'U'}
                </div>

                <button
                  type="button"
                  onClick={logout}
                  className="p-2.5 rounded-2xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                  title="Keluar dari akun"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>

            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1 space-y-8">
        
        {/* Hero Banner: ToyStore Cheerful & Playful */}
        <div className="p-8 sm:p-10 rounded-3xl bg-white border-2 border-slate-200/90 shadow-md relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="max-w-2xl space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-3.5 py-1 rounded-full text-xs font-extrabold bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1.5">
                  <PackageCheck className="w-4 h-4 text-rose-600" />
                  Google Classroom Hybrid Suite
                </span>
                {currentUser?.isAdmin && (
                  <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-amber-100 text-amber-900 border border-amber-300">
                    Mode Pengajar: SnowPrince
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-brand">
                Ruang Perkuliahan & Pemodelan Diskusi
              </h1>
              
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-medium">
                Pilih ruang kelas untuk mengakses materi pembelajaran, pengumpulan tugas, dan simulasi 3 model diskusi hybrid (The Expedition Choice, The Clash Arena, atau The Buzz Chamber).
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={onOpenJoinModal}
                className="py-3 px-5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs sm:text-sm border-2 border-slate-200 transition-all cursor-pointer"
              >
                + Masukkan Kode Room
              </button>
              {isAdmin && (
                <button
                  type="button"
                  onClick={onOpenCreateModal}
                  className="py-3 px-6 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
                >
                  + Buat Kelas Baru
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Filter Pills by Jenjang Pendidikan */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b-2 border-slate-200/60">
          <div className="flex items-center gap-2 overflow-x-auto text-xs sm:text-sm font-bold">
            {[
              { id: 'all', label: 'Semua Jenjang' },
              { id: 'Perguruan Tinggi', label: 'Perguruan Tinggi' },
              { id: 'SMA/SMK', label: 'SMA / SMK' },
              { id: 'SMP', label: 'SMP / MTs' },
              { id: 'SD', label: 'SD / MI' },
              { id: 'Umum', label: 'Umum' }
            ].map(p => (
              <button
                key={p.id}
                type="button"
                onClick={() => setFilterJenjang(p.id)}
                className={`px-4 py-2 rounded-2xl border-2 transition-all cursor-pointer whitespace-nowrap ${
                  filterJenjang === p.id
                    ? 'bg-[#FF5B37] text-white border-[#E84E2C] shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <span className="text-xs sm:text-sm font-bold text-slate-500 hidden sm:inline">
            Menampilkan {filteredRooms.length} Ruang Kelas
          </span>
        </div>

        {/* Empty state: If user has no rooms */}
        {myRooms.length === 0 && (
          <div className="p-10 sm:p-14 rounded-3xl bg-white border-2 border-slate-200 text-center space-y-4 shadow-sm">
            <div className="w-16 h-16 rounded-3xl bg-[#FFEDE7] text-[#FF5B37] flex items-center justify-center mx-auto">
              <BookOpen className="w-8 h-8" />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h3 className="text-xl font-bold text-slate-900 font-brand">
                Anda Belum Tergabung ke Ruang Kelas Tertentu
              </h3>
              <p className="text-sm text-slate-600">
                Masukkan kode room dari pengampu Anda untuk bergabung, atau pilih salah satu kelas di bawah untuk langsung mencoba skenario diskusi.
              </p>
            </div>
            <button
              type="button"
              onClick={onOpenJoinModal}
              className="py-3 px-6 rounded-2xl bg-[#FF5B37] hover:bg-[#E84E2C] text-white font-bold text-sm shadow-md transition-all cursor-pointer inline-flex items-center gap-2"
            >
              <KeyRound className="w-4 h-4" />
              <span>Gabung Kelas dengan Kode</span>
            </button>
          </div>
        )}

        {/* Google Classroom Grid Cards (ToyStore Retail Style) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRooms.map((room, idx) => {
            const headerColor = getCardHeaderColor(idx);
            const forumCount = room.forums?.length || 1;

            return (
              <div
                key={room.id}
                onClick={() => onSelectRoom(room)}
                className="group rounded-3xl bg-white border-2 border-slate-200/90 hover:border-[#FF5B37]/60 hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between cursor-pointer"
              >
                {/* Classroom Header Banner */}
                <div className={`p-6 sm:p-7 ${headerColor} relative space-y-2.5`}>
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-white/20 backdrop-blur-md text-white border border-white/30">
                      <GraduationCap className="w-3.5 h-3.5" />
                      <span>{room.jenjang || 'Perguruan Tinggi'}</span>
                    </span>
                    <span className="font-mono text-xs px-2.5 py-1 rounded-xl bg-black/30 text-white font-bold border border-white/20">
                      {room.roomCode}
                    </span>
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold font-brand line-clamp-2 leading-snug">
                    {room.name}
                  </h3>

                  <p className="text-xs sm:text-sm text-white/90 font-bold">
                    {room.section}
                  </p>

                  <div className="pt-2 text-xs sm:text-sm text-white/95 flex items-center justify-between border-t border-white/20 font-medium">
                    <span>Pengampu: {room.teacherName}</span>
                    <span className="text-xs bg-white/20 px-2 py-0.5 rounded-md font-bold">{room.subject}</span>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                  <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed font-medium">
                    {room.description}
                  </p>

                  {/* Multi-Forum indicator */}
                  <div className="p-3 rounded-2xl bg-[#FAF8F5] border border-[#EFE9E1] flex items-center gap-2 text-xs font-bold text-slate-700">
                    <Layers className="w-4 h-4 text-[#FF5B37]" />
                    <span>{forumCount} Forum Diskusi Interaktif</span>
                  </div>

                  {/* Metrics Bar */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs sm:text-sm font-bold text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-slate-400" />
                      <span>{room.members.length} Murid</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <UploadCloud className="w-4 h-4 text-[#FF5B37]" />
                      <span>{room.assignments.length} Tugas</span>
                    </div>

                    <span className="text-[#FF5B37] font-extrabold group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                      <span>Buka Room</span>
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>

              </div>
            );
          })}
        </div>

      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto px-6 py-8 border-t-2 border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm text-slate-500 font-medium">
        <div>
          <span>Ruang Diskusi Akademik — Hybrid Learning & Multi-Scenario Classroom</span>
        </div>
        <div className="flex items-center gap-4 text-slate-600 font-bold">
          <span>Admin: SnowPrince</span>
          <span>•</span>
          <span>Google Sign-In</span>
          <span>•</span>
          <span>Express Backend AI</span>
        </div>
      </footer>

    </div>
  );
};

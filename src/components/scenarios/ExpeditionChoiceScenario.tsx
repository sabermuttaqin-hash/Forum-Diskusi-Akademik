import React, { useState } from 'react';
import { CourseRoom, ExpeditionTopic } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { roomsService } from '../../lib/rooms';
import { 
  Compass, 
  Users, 
  MapPin, 
  CheckCircle2, 
  Sliders, 
  FileText, 
  Building,
  Laptop,
  Save,
  X,
  BookOpen,
  ArrowRight,
  RotateCcw,
  UserX,
  Sparkles,
  HelpCircle,
  ExternalLink,
  Layers,
  Award
} from 'lucide-react';

interface ExpeditionChoiceScenarioProps {
  room: CourseRoom;
  forumId?: string;
  forumTitle?: string;
  scenarioData?: any;
  onUpdateRoom?: () => void;
}

export const ExpeditionChoiceScenario: React.FC<ExpeditionChoiceScenarioProps> = ({ 
  room, 
  forumId, 
  forumTitle, 
  scenarioData: propScenarioData, 
  onUpdateRoom 
}) => {
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.isAdmin || currentUser?.uid === room.teacherId || currentUser?.role === 'admin' || currentUser?.role === 'lecturer';

  const effectiveScenarioData = propScenarioData || room.scenarioData || { type: 'expedition' };
  const topics: ExpeditionTopic[] = effectiveScenarioData.expeditionTopics || [];

  // Attendance choice state
  const [myAttendance, setMyAttendance] = useState<'offline' | 'online'>('offline');
  const [worksheetDraft, setWorksheetDraft] = useState('');
  const [activeShowcaseTopic, setActiveShowcaseTopic] = useState<string>(topics[0]?.id || '');

  // Teacher Capacity Management Modal State
  const [isEditingCapacity, setIsEditingCapacity] = useState(false);
  const [topicCapacities, setTopicCapacities] = useState<Record<string, { max: number; offline: number; online: number }>>(() => {
    const initial: Record<string, { max: number; offline: number; online: number }> = {};
    topics.forEach(t => {
      initial[t.id] = {
        max: t.maxQuota,
        offline: t.offlineQuota,
        online: t.onlineQuota
      };
    });
    return initial;
  });

  // Modal "Lihat Materi & Panduan Belajar"
  const [selectedTopicToStudy, setSelectedTopicToStudy] = useState<ExpeditionTopic | null>(null);

  // Find which topic current user has chosen
  const myTopic = topics.find(t => 
    t.selectedMembers.some(m => m.userId === currentUser?.uid)
  );

  // Select Topic (Teacher can select without quota lock)
  const handleSelectTopic = (topicId: string) => {
    if (!currentUser) return;

    const updatedTopics = topics.map(t => {
      const filteredMembers = t.selectedMembers.filter(m => m.userId !== currentUser.uid);

      if (t.id === topicId) {
        // Quota check only applies to non-admin students
        if (!isAdmin && filteredMembers.length >= t.maxQuota) {
          alert('Kuota topik ini sudah PENUH! Silakan pilih topik ekspedisi lain yang masih tersedia.');
          return t;
        }

        filteredMembers.push({
          userId: currentUser.uid,
          userName: currentUser.displayName,
          attendance: myAttendance,
          joinedAt: new Date().toISOString()
        });
      }

      return {
        ...t,
        selectedMembers: filteredMembers
      };
    });

    const persistScenario = (newTopics: ExpeditionTopic[]) => {
      const updated = {
        ...effectiveScenarioData,
        expeditionTopics: newTopics
      };
      if (forumId) {
        roomsService.updateForumScenarioData(room.id, forumId, updated);
      } else {
        roomsService.updateScenarioData(room.id, updated);
      }
      if (onUpdateRoom) onUpdateRoom();
    };

    persistScenario(updatedTopics);
  };

  // CANCEL TOPIC (Guru / Siswa bisa membatalkan pilihan tema kapan saja)
  const handleCancelMyTopic = () => {
    if (!currentUser) return;
    if (forumId) {
      roomsService.cancelForumTopicSelection(room.id, forumId, currentUser.uid);
    } else {
      roomsService.cancelTopicSelection(room.id, currentUser.uid);
    }
    if (selectedTopicToStudy && selectedTopicToStudy.id === myTopic?.id) {
      setSelectedTopicToStudy(null);
    }
    if (onUpdateRoom) onUpdateRoom();
  };

  // Teacher: remove a specific member from a topic
  const handleRemoveMemberFromTopic = (topicId: string, memberUid: string, memberName: string) => {
    if (!isAdmin) return;
    if (window.confirm(`Keluarkan ${memberName} dari tema ini agar dapat memilih ulang?`)) {
      if (forumId) {
        roomsService.removeMemberFromForumTopic(room.id, forumId, topicId, memberUid);
      } else {
        roomsService.removeMemberFromTopic(room.id, topicId, memberUid);
      }
      if (onUpdateRoom) onUpdateRoom();
    }
  };

  // Teacher: reset all topic selections
  const handleResetAllSelections = () => {
    if (!isAdmin) return;
    if (window.confirm('Reset seluruh pilihan siswa di semua tema ekspedisi untuk memulai sesi voting baru?')) {
      const resetTopics = topics.map(t => ({
        ...t,
        selectedMembers: []
      }));
      const updated = {
        ...effectiveScenarioData,
        expeditionTopics: resetTopics
      };
      if (forumId) {
        roomsService.updateForumScenarioData(room.id, forumId, updated);
      } else {
        roomsService.updateScenarioData(room.id, updated);
      }
      if (onUpdateRoom) onUpdateRoom();
    }
  };

  const handleSaveWorksheet = (topicId: string) => {
    if (!worksheetDraft.trim()) return;

    const updatedTopics = topics.map(t => {
      if (t.id === topicId) {
        return {
          ...t,
          teamWorksheet: worksheetDraft.trim()
        };
      }
      return t;
    });

    const updated = {
      ...effectiveScenarioData,
      expeditionTopics: updatedTopics
    };
    if (forumId) {
      roomsService.updateForumScenarioData(room.id, forumId, updated);
    } else {
      roomsService.updateScenarioData(room.id, updated);
    }

    setWorksheetDraft('');
    if (selectedTopicToStudy && selectedTopicToStudy.id === topicId) {
      setSelectedTopicToStudy({
        ...selectedTopicToStudy,
        teamWorksheet: worksheetDraft.trim()
      });
    }
    if (onUpdateRoom) onUpdateRoom();
  };

  const handleSaveAllCapacities = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedTopics = topics.map(t => {
      const cap = topicCapacities[t.id];
      if (cap) {
        return {
          ...t,
          maxQuota: Number(cap.max) || 8,
          offlineQuota: Number(cap.offline) || 4,
          onlineQuota: Number(cap.online) || 4
        };
      }
      return t;
    });

    const updated = {
      ...effectiveScenarioData,
      expeditionTopics: updatedTopics
    };
    if (forumId) {
      roomsService.updateForumScenarioData(room.id, forumId, updated);
    } else {
      roomsService.updateScenarioData(room.id, updated);
    }
    setIsEditingCapacity(false);
    if (onUpdateRoom) onUpdateRoom();
  };

  const totalVotes = topics.reduce((acc, t) => acc + t.selectedMembers.length, 0);

  return (
    <div className="space-y-8 font-sans animate-in fade-in duration-200">
      
      {/* ToyStore-style Cheerful Scenario Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border-2 border-amber-200/90 shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-100/50 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-bold bg-amber-100 text-amber-800 border border-amber-300">
              <Compass className="w-4 h-4 text-amber-600" />
              <span>Skenario: The Expedition Choice (Pemilihan Jalur Topik)</span>
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-brand">
              Voting Topik Riset & Meja Kolaborasi
            </h2>
            
            <p className="text-sm sm:text-base text-slate-600 max-w-2xl leading-relaxed font-medium">
              Tentukan status kehadiran Anda (di kelas atau di rumah), lalu pilih salah satu dari 5 Tema Ekspedisi. Anda dapat melihat materi pembahasan mendalam atau membatalkan pilihan kapan saja.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            {/* Teacher buttons */}
            {isAdmin && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditingCapacity(true)}
                  className="px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs sm:text-sm shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Sliders className="w-4 h-4" />
                  <span>Atur Kapasitas Topik</span>
                </button>

                <button
                  type="button"
                  onClick={handleResetAllSelections}
                  className="p-2.5 rounded-2xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-300 font-bold text-xs transition-all cursor-pointer"
                  title="Reset Semua Pilihan Siswa"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Attendance Toggle Pill */}
            <div className="bg-slate-100 p-1.5 rounded-2xl border border-slate-200 flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setMyAttendance('offline')}
                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  myAttendance === 'offline'
                    ? 'bg-rose-500 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Building className="w-4 h-4" />
                <span>Offline di Kelas</span>
              </button>
              <button
                type="button"
                onClick={() => setMyAttendance('online')}
                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  myAttendance === 'online'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Laptop className="w-4 h-4" />
                <span>Online di Rumah</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ACTIVE USER SELECTION STATUS BANNER (DENGAN TOMBOL LIHAT MATERI & CANCEL PILIHAN) */}
      {myTopic ? (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border-2 border-emerald-300 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-md shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-800">
                  {isAdmin ? 'Status Pengampu' : 'Tema Pilihan Anda'}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-200 text-emerald-900">
                  {myTopic.physicalZone}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 font-brand">
                {myTopic.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 font-medium">
                Tergabung bersama {myTopic.selectedMembers.length} anggota tim lainnya.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            {/* MENU LIHAT MATERI UNTUK SISWA */}
            <button
              type="button"
              onClick={() => setSelectedTopicToStudy(myTopic)}
              className="flex-1 md:flex-initial py-2.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              <span>Lihat Materi Pembahasan</span>
            </button>

            {/* TOMBOL CANCEL / BATALKAN PILIHAN TEMA */}
            <button
              type="button"
              onClick={handleCancelMyTopic}
              className="flex-1 md:flex-initial py-2.5 px-4 rounded-2xl bg-white hover:bg-rose-50 text-rose-600 hover:text-rose-700 border-2 border-rose-300 text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <X className="w-4 h-4" />
              <span>Batalkan Pilihan / Keluar</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-300 text-amber-900 text-xs sm:text-sm font-bold flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              {isAdmin 
                ? 'Guru / Admin: Anda bebas memilih tema untuk bergabung ke meja diskusi, atau memantau jalannya voting.' 
                : 'Anda belum memilih tema ekspedisi. Silakan klik salah satu tema di bawah untuk bergabung ke tim.'}
            </span>
          </div>
        </div>
      )}

      {/* Live Popularity & Drama Kuota Cards Grid */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="text-base sm:text-lg font-bold text-slate-900 font-brand">
              Popularitas 5 Tema Ekspedisi & Sisa Kuota (Total Partisipan: {totalVotes})
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-bold">
            Klik "Lihat Materi" untuk mempelajari topik secara komprehensif
          </span>
        </div>

        {/* 5 Topic Cards with Comfortable Font Sizes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {topics.map((topic, idx) => {
            const isFull = topic.selectedMembers.length >= topic.maxQuota;
            const isSelectedByMe = topic.selectedMembers.some(m => m.userId === currentUser?.uid);
            const percentage = Math.round((topic.selectedMembers.length / topic.maxQuota) * 100);

            return (
              <div
                key={topic.id}
                className={`p-6 rounded-3xl border-2 transition-all flex flex-col justify-between relative shadow-sm ${
                  isSelectedByMe
                    ? 'bg-emerald-50/60 border-emerald-500 ring-2 ring-emerald-400/40'
                    : isFull
                    ? 'bg-slate-50 border-slate-200 opacity-80'
                    : 'bg-white border-slate-200 hover:border-amber-400 hover:shadow-md'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-xs font-black uppercase tracking-wider text-rose-500">
                      Jalur Ekspedisi #{idx + 1}
                    </span>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
                      isFull 
                        ? 'bg-rose-100 text-rose-800 border-rose-300' 
                        : 'bg-amber-100 text-amber-900 border-amber-300'
                    }`}>
                      {topic.selectedMembers.length} / {topic.maxQuota} Kuota
                    </span>
                  </div>

                  <h4 className="text-base sm:text-lg font-bold text-slate-900 mb-2 leading-snug font-brand">
                    {topic.title}
                  </h4>
                  
                  <p className="text-sm text-slate-600 mb-4 line-clamp-3 leading-relaxed font-medium">
                    {topic.description}
                  </p>

                  {/* Physical Zone Badge */}
                  <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-xs sm:text-sm text-slate-700 mb-4 flex items-center gap-2 font-medium">
                    <MapPin className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Zona Kelas: <strong className="text-slate-900">{topic.physicalZone}</strong></span>
                  </div>

                  {/* Quota Progress Bar */}
                  <div className="space-y-1.5 mb-5">
                    <div className="flex justify-between text-xs font-bold text-slate-500">
                      <span>Kapasitas Terisi</span>
                      <span>{percentage}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-200">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          isFull ? 'bg-rose-500' : 'bg-gradient-to-r from-amber-400 to-rose-500'
                        }`}
                        style={{ width: `${Math.min(100, percentage)}%` }}
                      />
                    </div>
                  </div>

                  {/* Member Badges with Teacher Kick Option */}
                  <div className="space-y-2 mb-5">
                    <span className="text-xs font-bold text-slate-500 block">
                      Anggota Tim ({topic.selectedMembers.length}):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {topic.selectedMembers.length === 0 ? (
                        <span className="text-xs text-slate-400 italic">Belum ada peserta</span>
                      ) : (
                        topic.selectedMembers.map((m, mIdx) => (
                          <span
                            key={mIdx}
                            className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-xl font-bold border ${
                              m.attendance === 'offline'
                                ? 'bg-rose-100 text-rose-800 border-rose-300'
                                : 'bg-blue-100 text-blue-800 border-blue-300'
                            }`}
                          >
                            <span>{m.userName}</span>
                            <span className="text-[10px] opacity-70">({m.attendance})</span>
                            {/* Guru can remove a member if they made a mistake */}
                            {isAdmin && (
                              <button
                                type="button"
                                onClick={() => handleRemoveMemberFromTopic(topic.id, m.userId, m.userName)}
                                className="ml-1 p-0.5 rounded-full hover:bg-black/10 text-slate-600 hover:text-rose-700 cursor-pointer"
                                title="Keluarkan siswa dari tema"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            )}
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* Selection Action Buttons */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  {/* Button 1: LIHAT MATERI PEMBAHASAN */}
                  <button
                    type="button"
                    onClick={() => setSelectedTopicToStudy(topic)}
                    className="w-full py-2.5 px-4 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <BookOpen className="w-4 h-4 text-amber-700" />
                    <span>Lihat Materi Pembahasan</span>
                  </button>

                  {/* Button 2: PILIH / BATALKAN */}
                  {isSelectedByMe ? (
                    <button
                      type="button"
                      onClick={handleCancelMyTopic}
                      className="w-full py-2.5 px-4 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      <span>Batalkan Pilihan Tema Ini</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSelectTopic(topic.id)}
                      disabled={isFull && !isAdmin}
                      className={`w-full py-2.5 px-4 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                        isFull && !isAdmin
                          ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                          : 'bg-rose-500 hover:bg-rose-600 text-white shadow-sm'
                      }`}
                    >
                      {isFull && !isAdmin ? (
                        <span>Kuota Penuh</span>
                      ) : (
                        <>
                          <span>Pilih Jalur Ekspedisi Ini</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* Session Showcase & Shared Worksheet Section */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 font-brand">
              Fase Sesi Pleno & Lembar Kerja Kolaborasi Bersama
            </h3>
            <p className="text-xs sm:text-sm text-slate-500">
              Setiap kelompok menuangkan temuan dari meja fisik atau channel virtual ke lembar kerja ini
            </p>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700">
            Cross-Topic Showcase
          </span>
        </div>

        {/* Topic Selector Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {topics.map((t, idx) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveShowcaseTopic(t.id)}
              className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeShowcaseTopic === t.id
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Tema #{idx + 1}
            </button>
          ))}
        </div>

        {/* Active Topic Worksheet Display & Edit */}
        {(() => {
          const activeTopic = topics.find(t => t.id === activeShowcaseTopic) || topics[0];
          if (!activeTopic) return null;
          const isUserInActiveTopic = activeTopic.selectedMembers.some(m => m.userId === currentUser?.uid);

          return (
            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h4 className="text-base font-bold text-slate-900 font-brand">{activeTopic.title}</h4>
                  <span className="text-xs text-slate-500">Zona Meja: {activeTopic.physicalZone}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedTopicToStudy(activeTopic)}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5 text-amber-700" />
                  <span>Lihat Materi Lengkap</span>
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200 min-h-[100px]">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Hasil Lembar Kerja / Peta Konsep Digital Tim:
                </span>
                <p className="text-sm sm:text-base text-slate-800 whitespace-pre-line leading-relaxed font-medium">
                  {activeTopic.teamWorksheet || 'Tim belum menyimpan catatan lembar kerja. Anggota tim dapat mengetikkan draf ringkasan di bawah.'}
                </p>
              </div>

              {(isUserInActiveTopic || isAdmin) && (
                <div className="space-y-3 pt-2">
                  <label className="block text-xs sm:text-sm font-bold text-slate-700">
                    Perbarui Lembar Kerja Tim (Offline & Online Sync):
                  </label>
                  <textarea
                    rows={3}
                    value={worksheetDraft}
                    onChange={(e) => setWorksheetDraft(e.target.value)}
                    placeholder="Ketikkan poin-poin peta konsep, rumusan masalah, atau temuan korpus teks..."
                    className="w-full bg-white border border-slate-300 rounded-2xl p-4 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleSaveWorksheet(activeTopic.id)}
                      disabled={!worksheetDraft.trim()}
                      className="px-5 py-2.5 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs sm:text-sm shadow-sm transition-all disabled:opacity-50 cursor-pointer flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      <span>Simpan ke Lembar Kerja Tim</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })()}
      </div>

      {/* MODAL: LIHAT MATERI & PANDUAN BELAJAR (UNTUK SISWA & GURU) */}
      {selectedTopicToStudy && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
          <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border-2 border-amber-300 overflow-hidden flex flex-col max-h-[92vh]">
            
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-200 bg-amber-50/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-amber-100 text-amber-800">
                  <BookOpen className="w-6 h-6 text-amber-700" />
                </div>
                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-rose-500">
                    Materi & Panduan Belajar Ekspedisi
                  </span>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 font-brand">
                    {selectedTopicToStudy.title}
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedTopicToStudy(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800 text-sm">
              
              {/* Location & Quota Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200">
                  <span className="text-xs font-bold text-amber-900 block mb-1">Zona Fisik / Meja Kelas:</span>
                  <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-amber-600" />
                    <span>{selectedTopicToStudy.physicalZone}</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200">
                  <span className="text-xs font-bold text-blue-900 block mb-1">Kapasitas & Peserta Tergabung:</span>
                  <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-600" />
                    <span>{selectedTopicToStudy.selectedMembers.length} / {selectedTopicToStudy.maxQuota} Mahasiswa</span>
                  </div>
                </div>
              </div>

              {/* 1. Pengantar & Landasan Teori */}
              <div className="space-y-2">
                <h4 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-rose-500" />
                  <span>Landasan Teori & Panduan Belajar</span>
                </h4>
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 leading-relaxed text-slate-700 font-medium">
                  {selectedTopicToStudy.studyGuide || selectedTopicToStudy.description}
                </div>
              </div>

              {/* 2. Capaian & Tujuan Pembelajaran */}
              {selectedTopicToStudy.learningObjectives && selectedTopicToStudy.learningObjectives.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-600" />
                    <span>Capaian Pembelajaran Khusus</span>
                  </h4>
                  <ul className="space-y-2">
                    {selectedTopicToStudy.learningObjectives.map((obj, i) => (
                      <li key={i} className="p-3 rounded-2xl bg-white border border-slate-200 flex items-start gap-2.5 font-medium">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{obj}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 3. Sub-Pokok Bahasan yang Dibedah Tim */}
              {selectedTopicToStudy.subTopics && selectedTopicToStudy.subTopics.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-blue-600" />
                    <span>Sub-Pokok Bahasan Tim</span>
                  </h4>
                  <div className="grid grid-cols-1 gap-2">
                    {selectedTopicToStudy.subTopics.map((sub, i) => (
                      <div key={i} className="p-3.5 rounded-2xl bg-blue-50/40 border border-blue-200/80 font-medium text-slate-800">
                        {sub}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 4. Pertanyaan Pemantik Diskusi Kelompok */}
              {selectedTopicToStudy.discussionPrompts && selectedTopicToStudy.discussionPrompts.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-purple-600" />
                    <span>Pertanyaan Pemantik Diskusi</span>
                  </h4>
                  <div className="space-y-2">
                    {selectedTopicToStudy.discussionPrompts.map((prompt, i) => (
                      <div key={i} className="p-3.5 rounded-2xl bg-purple-50/50 border border-purple-200 text-purple-950 font-medium italic">
                        "{prompt}"
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 5. Referensi & Bahan Bacaan */}
              {selectedTopicToStudy.readings && selectedTopicToStudy.readings.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                    <ExternalLink className="w-4 h-4 text-emerald-600" />
                    <span>Referensi Ilmiah yang Dianjurkan</span>
                  </h4>
                  <div className="space-y-2">
                    {selectedTopicToStudy.readings.map((r, i) => (
                      <div key={i} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
                        <div>
                          <div className="font-bold text-slate-900">{r.title}</div>
                          <div className="text-xs text-slate-500 font-medium">Sumber: {r.source}</div>
                        </div>
                        <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-slate-200 text-slate-700 shrink-0">
                          Rujukan #{i + 1}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 6. Lembar Kerja Tim Digital Saat Ini */}
              <div className="space-y-2 pt-2 border-t border-slate-200">
                <h4 className="text-sm font-extrabold uppercase tracking-wider text-slate-900">
                  Draf Sintesis Tim Saat Ini
                </h4>
                <div className="p-4 rounded-2xl bg-amber-50/40 border border-amber-200 text-slate-800 font-medium whitespace-pre-line">
                  {selectedTopicToStudy.teamWorksheet || 'Belum ada catatan sintesis yang disimpan oleh tim.'}
                </div>
              </div>

            </div>

            {/* Modal Footer with Actions */}
            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
              <div>
                {selectedTopicToStudy.selectedMembers.some(m => m.userId === currentUser?.uid) ? (
                  <button
                    type="button"
                    onClick={handleCancelMyTopic}
                    className="px-4 py-2 rounded-2xl bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                    <span>Batalkan Pilihan / Keluar dari Tema Ini</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      handleSelectTopic(selectedTopicToStudy.id);
                      setSelectedTopicToStudy(null);
                    }}
                    className="px-5 py-2.5 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs sm:text-sm shadow-sm transition-all cursor-pointer flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Pilih Tema Ini Sekarang</span>
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => setSelectedTopicToStudy(null)}
                className="px-5 py-2.5 rounded-2xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs sm:text-sm transition-all cursor-pointer"
              >
                Tutup Panduan Materi
              </button>
            </div>

          </div>
        </div>
      )}

      {/* TEACHER CAPACITY MODAL */}
      {isEditingCapacity && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border-2 border-amber-300 overflow-hidden flex flex-col max-h-[92vh]">
            
            <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between bg-amber-50">
              <div className="flex items-center gap-3">
                <Sliders className="w-6 h-6 text-amber-600" />
                <div>
                  <h3 className="text-lg font-bold text-slate-900 font-brand">
                    Pengaturan Kapasitas Topik (Guru)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Tentukan kuota maksimal, kuota offline (di kelas), dan kuota online per tema
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditingCapacity(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAllCapacities} className="p-6 overflow-y-auto space-y-4 flex-1">
              {topics.map((t, idx) => (
                <div key={t.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <h5 className="text-sm font-bold text-slate-900 font-brand">
                      Tema #{idx + 1}: {t.title}
                    </h5>
                    <span className="text-xs font-bold text-amber-800 px-2.5 py-0.5 rounded-full bg-amber-100">
                      Terisi: {t.selectedMembers.length}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Total Kuota Maksimal
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={50}
                        value={topicCapacities[t.id]?.max ?? t.maxQuota}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setTopicCapacities(prev => ({
                            ...prev,
                            [t.id]: {
                              ...(prev[t.id] || { max: t.maxQuota, offline: t.offlineQuota, online: t.onlineQuota }),
                              max: val
                            }
                          }));
                        }}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Min. Hadir Offline
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={30}
                        value={topicCapacities[t.id]?.offline ?? t.offlineQuota}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setTopicCapacities(prev => ({
                            ...prev,
                            [t.id]: {
                              ...(prev[t.id] || { max: t.maxQuota, offline: t.offlineQuota, online: t.onlineQuota }),
                              offline: val
                            }
                          }));
                        }}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Kuota Siswa Online
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={30}
                        value={topicCapacities[t.id]?.online ?? t.onlineQuota}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setTopicCapacities(prev => ({
                            ...prev,
                            [t.id]: {
                              ...(prev[t.id] || { max: t.maxQuota, offline: t.offlineQuota, online: t.onlineQuota }),
                              online: val
                            }
                          }));
                        }}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>
                </div>
              ))}

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditingCapacity(false)}
                  className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs sm:text-sm shadow-sm cursor-pointer"
                >
                  Simpan Semua Kuota
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};

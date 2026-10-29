import React, { useState } from 'react';
import { CourseRoom, ExpeditionTopic } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { roomsService } from '../../lib/rooms';
import { 
  Compass, 
  Users, 
  MapPin, 
  CheckCircle2, 
  Settings2, 
  Sliders, 
  Timer, 
  FileText, 
  Send,
  Building,
  Laptop,
  Save,
  X,
  Plus,
  Flame,
  Award
} from 'lucide-react';

interface ExpeditionChoiceScenarioProps {
  room: CourseRoom;
  onUpdateRoom?: () => void;
}

export const ExpeditionChoiceScenario: React.FC<ExpeditionChoiceScenarioProps> = ({ room, onUpdateRoom }) => {
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.isAdmin || currentUser?.uid === room.teacherId;

  const topics: ExpeditionTopic[] = room.scenarioData.expeditionTopics || [];

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

  // Find which topic current user has chosen
  const myTopic = topics.find(t => 
    t.selectedMembers.some(m => m.userId === currentUser?.uid)
  );

  const handleSelectTopic = (topicId: string) => {
    if (!currentUser) return;

    const updatedTopics = topics.map(t => {
      const filteredMembers = t.selectedMembers.filter(m => m.userId !== currentUser.uid);

      if (t.id === topicId) {
        if (filteredMembers.length >= t.maxQuota) {
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

    roomsService.updateScenarioData(room.id, {
      ...room.scenarioData,
      expeditionTopics: updatedTopics
    });
    if (onUpdateRoom) onUpdateRoom();
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

    roomsService.updateScenarioData(room.id, {
      ...room.scenarioData,
      expeditionTopics: updatedTopics
    });
    setWorksheetDraft('');
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

    roomsService.updateScenarioData(room.id, {
      ...room.scenarioData,
      expeditionTopics: updatedTopics
    });
    setIsEditingCapacity(false);
    if (onUpdateRoom) onUpdateRoom();
  };

  const totalVotes = topics.reduce((acc, t) => acc + t.selectedMembers.length, 0);

  return (
    <div className="space-y-8 font-sans animate-in fade-in duration-200">
      
      {/* ToyStore-style Cheerful Scenario Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border-2 border-amber-200/80 shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-100/50 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
              <Compass className="w-4 h-4 text-amber-600" />
              <span>Skenario: The Expedition Choice (Pemilihan Jalur Topik)</span>
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 font-brand">
              Voting Topik Riset & Pembagian Tim
            </h2>
            
            <p className="text-sm sm:text-base text-slate-600 max-w-2xl leading-relaxed">
              Pilih status kehadiran Anda (di kelas atau di rumah), lalu pilih salah satu dari 5 Tema Ekspedisi. Kuota dibatasi oleh dosen pengampu secara interaktif.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            {/* Teacher button: Atur Kapasitas Kuota */}
            {isAdmin && (
              <button
                type="button"
                onClick={() => setIsEditingCapacity(true)}
                className="px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs sm:text-sm shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Sliders className="w-4 h-4" />
                <span>Atur Kapasitas Topik (Guru)</span>
              </button>
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

      {/* Live Popularity & Drama Kuota Cards Grid */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="text-sm sm:text-base font-bold text-slate-800">
              Popularitas Tema & Sisa Kuota (Total Peserta: {totalVotes})
            </h3>
          </div>
          {myTopic && (
            <span className="text-xs sm:text-sm px-3.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
              Anda Terdaftar di: {myTopic.title.split(':')[0]}
            </span>
          )}
        </div>

        {/* 5 Topic Cards with Comfortable Font Sizes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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
                    ? 'bg-slate-50 border-slate-200 opacity-70'
                    : 'bg-white border-slate-200 hover:border-amber-400 hover:shadow-md'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-rose-500">
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

                  <h4 className="text-base sm:text-lg font-bold text-slate-900 mb-2 leading-snug">
                    {topic.title}
                  </h4>
                  
                  <p className="text-sm text-slate-600 mb-4 line-clamp-3 leading-relaxed">
                    {topic.description}
                  </p>

                  {/* Physical Zone Badge */}
                  <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-xs sm:text-sm text-slate-700 mb-4 flex items-center gap-2">
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

                  {/* Member Badges */}
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
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* Selection Action Button */}
                <div>
                  <button
                    type="button"
                    onClick={() => handleSelectTopic(topic.id)}
                    disabled={isFull && !isSelectedByMe}
                    className={`w-full py-3 px-4 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      isSelectedByMe
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : isFull
                        ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                        : 'bg-rose-500 hover:bg-rose-600 text-white shadow-md'
                    }`}
                  >
                    {isSelectedByMe ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Anda Berada di Tim Ini</span>
                      </>
                    ) : isFull ? (
                      <span>Kuota Penuh (Pilih Tema Lain)</span>
                    ) : (
                      <span>Pilih Tema Ini ({myAttendance})</span>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Fase 3: Lembar Kerja Bersama Digital */}
      {myTopic && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white border-2 border-emerald-300 shadow-md space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="p-2.5 rounded-2xl bg-emerald-100 text-emerald-700">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 font-brand">
                Lembar Kerja Kolaborasi Tim: {myTopic.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600">
                Pengerjaan bersama antara siswa di <strong className="text-slate-900">{myTopic.physicalZone}</strong> dan siswa online di Breakout Room.
              </p>
            </div>
          </div>

          {/* Current Saved Worksheet */}
          {myTopic.teamWorksheet && (
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-sm text-slate-800 leading-relaxed font-sans">
              <span className="text-xs font-bold text-emerald-800 block mb-1">
                Catatan Sintesis Tim Saat Ini:
              </span>
              {myTopic.teamWorksheet}
            </div>
          )}

          <div className="space-y-3">
            <textarea
              rows={3}
              value={worksheetDraft}
              onChange={(e) => setWorksheetDraft(e.target.value)}
              placeholder="Ketikkan poin peta konsep atau hasil diskusi kelompok Anda di sini..."
              className="w-full bg-slate-50 border border-slate-300 rounded-2xl p-4 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            />
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => handleSaveWorksheet(myTopic.id)}
                disabled={!worksheetDraft.trim()}
                className="py-2.5 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-sm transition-all disabled:opacity-40 cursor-pointer flex items-center gap-1.5"
              >
                <Send className="w-4 h-4" />
                <span>Simpan Lembar Kerja Tim</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fase 4: Sesi Pleno / Cross-Topic Showcase */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 font-brand flex items-center gap-2">
              <Timer className="w-5 h-5 text-amber-500" />
              Sesi Pleno: Presentasi Lintas Tema
            </h3>
            <p className="text-xs sm:text-sm text-slate-600">
              Presentasi giliran tim (5 menit per kelompok) di layar utama kelas.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm font-bold text-slate-600">Pilih Giliran:</span>
            <select
              value={activeShowcaseTopic}
              onChange={(e) => setActiveShowcaseTopic(e.target.value)}
              className="bg-slate-100 border border-slate-300 text-xs sm:text-sm font-bold text-slate-800 rounded-xl py-2 px-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              {topics.map((t, idx) => (
                <option key={t.id} value={t.id}>
                  Tema {idx + 1}: {t.title.slice(0, 32)}...
                </option>
              ))}
            </select>
          </div>
        </div>

        {(() => {
          const showcaseTopic = topics.find(t => t.id === activeShowcaseTopic);
          if (!showcaseTopic) return null;

          return (
            <div className="p-5 rounded-2xl bg-amber-50/50 border border-amber-200 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm font-extrabold text-slate-900">
                  {showcaseTopic.title}
                </span>
                <span className="text-xs font-bold text-amber-800 px-3 py-1 rounded-full bg-amber-100 border border-amber-300">
                  Zona: {showcaseTopic.physicalZone}
                </span>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed bg-white p-4 rounded-xl border border-amber-200/80">
                {showcaseTopic.teamWorksheet || 'Tim belum mengunggah lembar kerja digital.'}
              </p>
              <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-slate-600 pt-1">
                <span>Presenter Tim:</span>
                {showcaseTopic.selectedMembers.map((m, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-800">
                    {m.userName} ({m.attendance})
                  </span>
                ))}
              </div>
            </div>
          );
        })()}
      </div>

      {/* TEACHER CAPACITY MODAL */}
      {isEditingCapacity && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border-2 border-amber-300 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between bg-amber-50">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-amber-600" />
                <h3 className="text-base sm:text-lg font-bold text-slate-900 font-brand">
                  Atur Kapasitas & Kuota Murid Per Topik
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEditingCapacity(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAllCapacities} className="p-6 overflow-y-auto space-y-4 flex-1">
              <p className="text-xs sm:text-sm text-slate-600">
                Tentukan batas kuota maksimal untuk masing-masing dari 5 tema ekspedisi. Siswa yang memilih melebihi kuota akan diarahkan ke tema lain secara otomatis.
              </p>

              <div className="space-y-3">
                {topics.map((t, idx) => {
                  const cap = topicCapacities[t.id] || { max: t.maxQuota, offline: t.offlineQuota, online: t.onlineQuota };

                  return (
                    <div key={t.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs sm:text-sm font-bold text-slate-900">
                          Tema #{idx + 1}: {t.title.slice(0, 40)}...
                        </span>
                        <span className="text-xs font-bold text-slate-500">
                          Terisi: {t.selectedMembers.length} Siswa
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-3 pt-1">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Total Kuota Maksimal
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="50"
                            value={cap.max}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              setTopicCapacities(prev => ({
                                ...prev,
                                [t.id]: { ...cap, max: val }
                              }));
                            }}
                            className="w-full bg-white border border-slate-300 rounded-xl py-1.5 px-3 text-xs sm:text-sm font-bold text-slate-900 focus:ring-2 focus:ring-amber-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Kuota Offline (Kelas)
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="50"
                            value={cap.offline}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              setTopicCapacities(prev => ({
                                ...prev,
                                [t.id]: { ...cap, offline: val }
                              }));
                            }}
                            className="w-full bg-white border border-slate-300 rounded-xl py-1.5 px-3 text-xs sm:text-sm font-bold text-slate-900 focus:ring-2 focus:ring-amber-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Kuota Online (Rumah)
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="50"
                            value={cap.online}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              setTopicCapacities(prev => ({
                                ...prev,
                                [t.id]: { ...cap, online: val }
                              }));
                            }}
                            className="w-full bg-white border border-slate-300 rounded-xl py-1.5 px-3 text-xs sm:text-sm font-bold text-slate-900 focus:ring-2 focus:ring-amber-500"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditingCapacity(false)}
                  className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs sm:text-sm shadow-md"
                >
                  Simpan Semua Kapasitas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

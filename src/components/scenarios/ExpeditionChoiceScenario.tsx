import React, { useState } from 'react';
import { CourseRoom, ExpeditionTopic } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { roomsService } from '../../lib/rooms';
import { 
  Compass, 
  Users, 
  MapPin, 
  Wifi, 
  CheckCircle2, 
  Sparkles, 
  AlertTriangle, 
  Share2, 
  Play, 
  Timer, 
  FileText, 
  Send,
  Building,
  Laptop
} from 'lucide-react';

interface ExpeditionChoiceScenarioProps {
  room: CourseRoom;
  onUpdateRoom?: () => void;
}

export const ExpeditionChoiceScenario: React.FC<ExpeditionChoiceScenarioProps> = ({ room, onUpdateRoom }) => {
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.isAdmin || currentUser?.uid === room.teacherId;

  const topics: ExpeditionTopic[] = room.scenarioData.expeditionTopics || [];

  // User attendance choice state
  const [myAttendance, setMyAttendance] = useState<'offline' | 'online'>('offline');
  const [worksheetDraft, setWorksheetDraft] = useState('');
  const [activeShowcaseTopic, setActiveShowcaseTopic] = useState<string>(topics[0]?.id || '');
  const [showcaseTimer, setShowcaseTimer] = useState<number>(300); // 5 mins
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  // Find which topic current user has chosen
  const myTopic = topics.find(t => 
    t.selectedMembers.some(m => m.userId === currentUser?.uid)
  );

  const handleSelectTopic = (topicId: string) => {
    if (!currentUser) return;

    const updatedTopics = topics.map(t => {
      // Remove user from all other topics
      const filteredMembers = t.selectedMembers.filter(m => m.userId !== currentUser.uid);

      if (t.id === topicId) {
        // Check quota drama
        const currentCount = filteredMembers.length;
        if (currentCount >= t.maxQuota) {
          alert('Kuota topik ini sudah PENUH! Silakan berebut dan pilih topik ekspedisi lainnya yang masih tersedia.');
          return t;
        }

        // Add user with attendance mode
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

    const updatedScenario = {
      ...room.scenarioData,
      expeditionTopics: updatedTopics
    };

    roomsService.updateScenarioData(room.id, updatedScenario);
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

  // Total students joined across topics
  const totalVotes = topics.reduce((acc, t) => acc + t.selectedMembers.length, 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Scenario Header & Hybrid Attendance Selector */}
      <div className="p-6 rounded-3xl bg-[#0F111E] border border-white/10 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-violet-500/10 border border-violet-500/20 text-violet-300 mb-2">
              <Compass className="w-3.5 h-3.5 text-violet-400" />
              <span>Skenario A: The Expedition Choice (Pemilihan Jalur Topik)</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white font-serif-academic mb-2">
              Voting Topik Riset & Matchmaking Kelompok Hybrid
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
              Pilih status kehadiran Anda (di kelas atau di rumah), lalu pilih salah satu dari 5 Tema Ekspedisi. Sistem otomatis mengelompokkan Anda ke zona meja fisik atau breakout room virtual.
            </p>
          </div>

          {/* Attendance Toggle Pill */}
          <div className="bg-white/5 p-1.5 rounded-2xl border border-white/10 flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setMyAttendance('offline')}
              className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                myAttendance === 'offline'
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Building className="w-3.5 h-3.5" />
              <span>Offline (di Kelas)</span>
            </button>
            <button
              type="button"
              onClick={() => setMyAttendance('online')}
              className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                myAttendance === 'online'
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Laptop className="w-3.5 h-3.5" />
              <span>Online (di Rumah)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Live Popularity Board (Layar Proyektor Kelas / Drama Kuota) */}
      <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Live Popularitas Topik & Sisa Kuota (Total Partisipan: {totalVotes})
            </h3>
          </div>
          {myTopic && (
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30 font-semibold">
              Anda di: {myTopic.title.split(':')[0]}
            </span>
          )}
        </div>

        {/* 5 Topics Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {topics.map((topic, idx) => {
            const isFull = topic.selectedMembers.length >= topic.maxQuota;
            const isSelectedByMe = topic.selectedMembers.some(m => m.userId === currentUser?.uid);
            const percentage = Math.round((topic.selectedMembers.length / topic.maxQuota) * 100);

            return (
              <div
                key={topic.id}
                className={`p-5 rounded-2xl border transition-all flex flex-col justify-between relative overflow-hidden backdrop-blur-md ${
                  isSelectedByMe
                    ? 'bg-violet-950/30 border-violet-500/60 shadow-lg shadow-violet-900/20 ring-1 ring-violet-500/30'
                    : isFull
                    ? 'bg-white/[0.01] border-white/5 opacity-60'
                    : 'bg-white/[0.03] border-white/10 hover:border-violet-500/30 hover:bg-white/[0.05]'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-[11px] font-bold text-violet-400 tracking-wider">
                      Jalur Ekspedisi #{idx + 1}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isFull ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'
                    }`}>
                      {topic.selectedMembers.length}/{topic.maxQuota} Kuota
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-white mb-1.5 leading-snug">
                    {topic.title}
                  </h4>
                  <p className="text-xs text-slate-400 mb-3 line-clamp-2">
                    {topic.description}
                  </p>

                  {/* Physical Zone Callout */}
                  <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-[11px] text-slate-300 mb-3 flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>Zona: <strong className="text-white">{topic.physicalZone}</strong></span>
                  </div>

                  {/* Quota Progress Bar */}
                  <div className="space-y-1 mb-4">
                    <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          isFull ? 'bg-rose-500' : 'bg-gradient-to-r from-violet-500 to-indigo-400'
                        }`}
                        style={{ width: `${Math.min(100, percentage)}%` }}
                      />
                    </div>
                  </div>

                  {/* Joined Members Avatars & Mode */}
                  <div className="space-y-1 mb-4">
                    <span className="text-[10px] font-semibold text-slate-400 block">
                      Anggota Tim ({topic.selectedMembers.length}):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {topic.selectedMembers.length === 0 ? (
                        <span className="text-[11px] text-slate-500 italic">Belum ada yang memilih</span>
                      ) : (
                        topic.selectedMembers.map((m, mIdx) => (
                          <span
                            key={mIdx}
                            className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md border font-medium ${
                              m.attendance === 'offline'
                                ? 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                                : 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20'
                            }`}
                          >
                            <span>{m.userName.split(' ')[0]}</span>
                            <span className="text-[9px] opacity-70">({m.attendance})</span>
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
                    className={`w-full py-2.5 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      isSelectedByMe
                        ? 'bg-emerald-600/30 border border-emerald-500 text-emerald-300'
                        : isFull
                        ? 'bg-white/5 text-slate-500 cursor-not-allowed'
                        : 'bg-violet-600 hover:bg-violet-500 text-white shadow-md'
                    }`}
                  >
                    {isSelectedByMe ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
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

      {/* Fase 3: Kolaborasi & Lembar Kerja Bersama Digital (Hybrid Execution) */}
      {myTopic && (
        <div className="p-6 rounded-3xl bg-gradient-to-b from-violet-950/20 to-[#0F111E] border border-violet-500/30">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-violet-600/20 text-violet-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Lembar Kerja Digital Tim: {myTopic.title}
              </h3>
              <p className="text-xs text-slate-400">
                Kolaborasi langsung antara siswa di <strong className="text-white">{myTopic.physicalZone}</strong> dan siswa daring di Breakout Room.
              </p>
            </div>
          </div>

          {/* Current Saved Worksheet */}
          {myTopic.teamWorksheet && (
            <div className="mb-4 p-4 rounded-2xl bg-white/[0.04] border border-white/10 text-xs sm:text-sm text-slate-200 leading-relaxed font-mono">
              <span className="text-[11px] text-violet-300 font-sans font-bold block mb-1">
                Catatan & Sintesis Tim Saat Ini:
              </span>
              {myTopic.teamWorksheet}
            </div>
          )}

          {/* Worksheet Editor */}
          <div className="space-y-3">
            <textarea
              rows={3}
              value={worksheetDraft}
              onChange={(e) => setWorksheetDraft(e.target.value)}
              placeholder="Ketikkan poin peta konsep, temuan argumen, atau ringkasan sintesis kelompok Anda di sini..."
              className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-3.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
            />
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => handleSaveWorksheet(myTopic.id)}
                disabled={!worksheetDraft.trim()}
                className="py-2 px-4 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs transition-all disabled:opacity-40 cursor-pointer flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Simpan ke Lembar Kerja Tim</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fase 4: Sesi Pleno / Cross-Topic Showcase */}
      <div className="p-6 rounded-3xl bg-[#0F111E] border border-white/10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-white/10">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Timer className="w-4 h-4 text-violet-400" />
              Sesi Pleno: Presentasi Lintas Tema (Cross-Topic Showcase)
            </h3>
            <p className="text-xs text-slate-400">
              Setiap tim mempresentasikan temuan selama 5 menit secara bergantian ke seluruh kelas.
            </p>
          </div>

          {/* Showcase Topic Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Giliran Tim:</span>
            <select
              value={activeShowcaseTopic}
              onChange={(e) => setActiveShowcaseTopic(e.target.value)}
              className="bg-white/5 border border-white/10 text-xs text-white rounded-xl py-1.5 px-3 focus:outline-none"
            >
              {topics.map((t, idx) => (
                <option key={t.id} value={t.id} className="bg-slate-900 text-white">
                  Tema {idx + 1}: {t.title.slice(0, 30)}...
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Active Presentation Card */}
        {(() => {
          const showcaseTopic = topics.find(t => t.id === activeShowcaseTopic);
          if (!showcaseTopic) return null;

          return (
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-violet-300">
                  {showcaseTopic.title}
                </span>
                <span className="text-[11px] text-slate-400">
                  Lokasi Fisik: {showcaseTopic.physicalZone}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {showcaseTopic.teamWorksheet || 'Tim belum mengunggah ringkasan digital lembar kerja.'}
              </p>
              <div className="flex items-center gap-2 pt-2 text-[11px] text-slate-400">
                <span>Presenter Gabungan:</span>
                {showcaseTopic.selectedMembers.map((m, i) => (
                  <span key={i} className="px-2 py-0.5 rounded bg-white/5 text-slate-200">
                    {m.userName} ({m.attendance})
                  </span>
                ))}
              </div>
            </div>
          );
        })()}
      </div>

    </div>
  );
};

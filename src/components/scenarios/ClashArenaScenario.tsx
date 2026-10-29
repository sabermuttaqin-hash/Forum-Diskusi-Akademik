import React, { useState } from 'react';
import { CourseRoom, ClashBulletChat } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { roomsService } from '../../lib/rooms';
import { 
  ShieldAlert, 
  Swords, 
  Send, 
  CheckCircle2, 
  ThumbsUp, 
  Flame, 
  Mic, 
  Laptop, 
  Radio, 
  BarChart3,
  Sparkles,
  Zap
} from 'lucide-react';

interface ClashArenaScenarioProps {
  room: CourseRoom;
  onUpdateRoom?: () => void;
}

export const ClashArenaScenario: React.FC<ClashArenaScenarioProps> = ({ room, onUpdateRoom }) => {
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.isAdmin || currentUser?.uid === room.teacherId;

  const scenario = room.scenarioData;
  const proMembers = scenario.clashProMembers || [];
  const contraMembers = scenario.clashContraMembers || [];
  const bulletChats: ClashBulletChat[] = scenario.clashBulletChats || [];
  const votes = scenario.clashVotes || { pro: 15, contra: 12, userVotes: {} };

  // Local input state
  const [bulletMessage, setBulletMessage] = useState('');
  const [isFactCheck, setIsFactCheck] = useState(false);
  const [mySide, setMySide] = useState<'pro' | 'contra' | 'neutral'>(() => {
    if (proMembers.some(m => m.userId === currentUser?.uid)) return 'pro';
    if (contraMembers.some(m => m.userId === currentUser?.uid)) return 'contra';
    return 'neutral';
  });

  const handleJoinSide = (side: 'pro' | 'contra') => {
    if (!currentUser) return;

    let updatedPro = proMembers.filter(m => m.userId !== currentUser.uid);
    let updatedContra = contraMembers.filter(m => m.userId !== currentUser.uid);

    const memberObj = {
      userId: currentUser.uid,
      userName: currentUser.displayName,
      attendance: (currentUser.role === 'admin' ? 'offline' : 'online') as 'offline' | 'online',
      isSpokesperson: false
    };

    if (side === 'pro') {
      updatedPro.push(memberObj);
      setMySide('pro');
    } else {
      updatedContra.push(memberObj);
      setMySide('contra');
    }

    roomsService.updateScenarioData(room.id, {
      ...scenario,
      clashProMembers: updatedPro,
      clashContraMembers: updatedContra
    });

    if (onUpdateRoom) onUpdateRoom();
  };

  const handleSendBullet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulletMessage.trim() || mySide === 'neutral' || !currentUser) return;

    const newChat: ClashBulletChat = {
      id: `bc_${Date.now()}`,
      side: mySide,
      authorName: `${currentUser.displayName} (${currentUser.role === 'admin' ? 'Offline' : 'Online'})`,
      attendance: currentUser.role === 'admin' ? 'offline' : 'online',
      message: bulletMessage.trim(),
      isFactCheck,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedChats = [newChat, ...bulletChats];

    roomsService.updateScenarioData(room.id, {
      ...scenario,
      clashBulletChats: updatedChats
    });

    setBulletMessage('');
    setIsFactCheck(false);
    if (onUpdateRoom) onUpdateRoom();
  };

  const handleSlidoVote = (targetSide: 'pro' | 'contra') => {
    if (!currentUser) return;
    const currentVotes = { ...votes };
    const userVotes = currentVotes.userVotes || {};

    const previousVote = userVotes[currentUser.uid];
    if (previousVote === targetSide) return; // already voted for this side

    if (previousVote === 'pro') currentVotes.pro = Math.max(0, currentVotes.pro - 1);
    if (previousVote === 'contra') currentVotes.contra = Math.max(0, currentVotes.contra - 1);

    if (targetSide === 'pro') currentVotes.pro += 1;
    if (targetSide === 'contra') currentVotes.contra += 1;

    userVotes[currentUser.uid] = targetSide;
    currentVotes.userVotes = userVotes;

    roomsService.updateScenarioData(room.id, {
      ...scenario,
      clashVotes: currentVotes
    });

    if (onUpdateRoom) onUpdateRoom();
  };

  const totalVotes = (votes.pro || 0) + (votes.contra || 0);
  const proPercentage = totalVotes > 0 ? Math.round((votes.pro / totalVotes) * 100) : 50;
  const contraPercentage = 100 - proPercentage;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Top Banner: Controversial Topic */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#0F111E] border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 mb-3">
            <Swords className="w-3.5 h-3.5 text-indigo-400" />
            <span>Skenario B: The Clash Arena (Arena Debat Strategis Berbasis Kubu)</span>
          </div>

          <h2 className="text-xl sm:text-3xl font-extrabold text-white font-serif-academic mb-3 leading-tight">
            "{scenario.clashTopic || 'Penggunaan AI dalam Pembelajaran Bahasa: Membantu atau Mematikan Kreativitas?'}"
          </h2>

          <p className="text-xs sm:text-sm text-slate-400 mb-6">
            Pilih kubu Anda. Siswa di rumah bertindak sebagai <strong className="text-indigo-300">Tim Riset & Amunisi (War Room)</strong>, sedangkan siswa di kelas bertindak sebagai <strong className="text-amber-300">Juru Bicara Podium</strong>.
          </p>

          {/* Kubu Selection Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => handleJoinSide('pro')}
              className={`w-full sm:w-auto px-6 py-3 rounded-2xl font-bold text-xs sm:text-sm border transition-all cursor-pointer flex items-center justify-center gap-2 ${
                mySide === 'pro'
                  ? 'bg-emerald-600 text-white border-emerald-400 shadow-lg shadow-emerald-600/30 ring-2 ring-emerald-500/40'
                  : 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300 hover:bg-emerald-900/30'
              }`}
            >
              <span>Gabung KUBU PRO (Pendukung)</span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/20 font-mono">
                {proMembers.length} Orang
              </span>
            </button>

            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">VS</span>

            <button
              type="button"
              onClick={() => handleJoinSide('contra')}
              className={`w-full sm:w-auto px-6 py-3 rounded-2xl font-bold text-xs sm:text-sm border transition-all cursor-pointer flex items-center justify-center gap-2 ${
                mySide === 'contra'
                  ? 'bg-rose-600 text-white border-rose-400 shadow-lg shadow-rose-600/30 ring-2 ring-rose-500/40'
                  : 'bg-rose-950/20 border-rose-500/30 text-rose-300 hover:bg-rose-900/30'
              }`}
            >
              <span>Gabung KUBU KONTRA (Penentang)</span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-rose-500/20 font-mono">
                {contraMembers.length} Orang
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Sli.do Style Live Audience Voting Bar */}
      <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/10">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-violet-400" />
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Live Sli.do Audience Meter: Argumen Siapa Paling Meyakinkan?
            </span>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Total Suara: {totalVotes}
          </span>
        </div>

        {/* Meter progress bar */}
        <div className="w-full bg-white/10 h-4 rounded-full overflow-hidden flex mb-3 p-0.5">
          <div 
            className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-full rounded-l-full transition-all duration-500"
            style={{ width: `${proPercentage}%` }}
          />
          <div 
            className="bg-gradient-to-r from-rose-500 to-rose-600 h-full rounded-r-full transition-all duration-500"
            style={{ width: `${contraPercentage}%` }}
          />
        </div>

        {/* Voting triggers */}
        <div className="flex items-center justify-between text-xs font-bold">
          <button
            type="button"
            onClick={() => handleSlidoVote('pro')}
            className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5 cursor-pointer transition-all"
          >
            <ThumbsUp className="w-3.5 h-3.5" />
            <span>Dukung Pro ({proPercentage}%)</span>
          </button>

          <span className="text-slate-500 text-[11px] hidden sm:inline">
            Klik tombol di sisi untuk memberikan voting real-time setiap ronde
          </span>

          <button
            type="button"
            onClick={() => handleSlidoVote('contra')}
            className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center gap-1.5 cursor-pointer transition-all"
          >
            <ThumbsUp className="w-3.5 h-3.5" />
            <span>Dukung Kontra ({contraPercentage}%)</span>
          </button>
        </div>
      </div>

      {/* 2 Podia: Pro vs Contra War Rooms & Live Bullet Chat */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* KUBU PRO PANEL */}
        <div className="p-6 rounded-3xl bg-emerald-950/10 border border-emerald-500/20 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-emerald-500/20 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Kubu Pro: War Room & Amunisi Riset
                </h3>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold">
                {proMembers.length} Anggota
              </span>
            </div>

            {/* Spokesperson Callout (Di Kelas Offline) */}
            <div className="p-3 rounded-xl bg-white/[0.03] border border-emerald-500/30 text-xs text-slate-300 mb-4 flex items-center gap-2.5">
              <Mic className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <span className="text-[10px] text-emerald-400 uppercase font-bold block">Juru Bicara Podium (Kelas Offline):</span>
                <span className="text-white font-medium">
                  {proMembers.find(m => m.isSpokesperson)?.userName || proMembers[0]?.userName || 'Belum ditunjuk'}
                </span>
              </div>
            </div>

            {/* Bullet Chats for Pro */}
            <div className="space-y-2.5 max-h-72 overflow-y-auto mb-4 pr-1">
              {bulletChats.filter(c => c.side === 'pro').map((chat) => (
                <div key={chat.id} className="p-3 rounded-xl bg-white/[0.03] border border-emerald-500/20 text-xs space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-emerald-400">
                    <span className="font-bold">{chat.authorName}</span>
                    <span>{chat.timestamp}</span>
                  </div>
                  <p className="text-slate-200 leading-relaxed font-sans">{chat.message}</p>
                  {chat.isFactCheck && (
                    <span className="inline-flex items-center gap-1 text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                      <Zap className="w-2.5 h-2.5" /> Terverifikasi Fakta
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* KUBU KONTRA PANEL */}
        <div className="p-6 rounded-3xl bg-rose-950/10 border border-rose-500/20 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-rose-500/20 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Kubu Kontra: War Room & Amunisi Riset
                </h3>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-semibold">
                {contraMembers.length} Anggota
              </span>
            </div>

            {/* Spokesperson Callout */}
            <div className="p-3 rounded-xl bg-white/[0.03] border border-rose-500/30 text-xs text-slate-300 mb-4 flex items-center gap-2.5">
              <Mic className="w-4 h-4 text-rose-400 shrink-0" />
              <div>
                <span className="text-[10px] text-rose-400 uppercase font-bold block">Juru Bicara Podium (Kelas Offline):</span>
                <span className="text-white font-medium">
                  {contraMembers.find(m => m.isSpokesperson)?.userName || contraMembers[0]?.userName || 'Belum ditunjuk'}
                </span>
              </div>
            </div>

            {/* Bullet Chats for Contra */}
            <div className="space-y-2.5 max-h-72 overflow-y-auto mb-4 pr-1">
              {bulletChats.filter(c => c.side === 'contra').map((chat) => (
                <div key={chat.id} className="p-3 rounded-xl bg-white/[0.03] border border-rose-500/20 text-xs space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-rose-400">
                    <span className="font-bold">{chat.authorName}</span>
                    <span>{chat.timestamp}</span>
                  </div>
                  <p className="text-slate-200 leading-relaxed font-sans">{chat.message}</p>
                  {chat.isFactCheck && (
                    <span className="inline-flex items-center gap-1 text-[9px] px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 font-mono">
                      <Zap className="w-2.5 h-2.5" /> Data Sanggahan
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Live Bullet Chat Input Form (Amunisi Kilat ke Juru Bicara) */}
      <div className="p-5 rounded-2xl bg-[#0F111E] border border-white/10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-indigo-400 animate-pulse" />
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Kirim Amunisi Argumen Kilat (Tampil Langsung di Layar Monitor Juru Bicara)
            </h4>
          </div>
          <span className="text-xs text-slate-400">
            Anda mengirim sebagai: <strong className="text-white">{mySide === 'pro' ? 'Kubu Pro' : mySide === 'contra' ? 'Kubu Kontra' : 'Penonton (Pilih Kubu Terlebih Dahulu)'}</strong>
          </span>
        </div>

        <form onSubmit={handleSendBullet} className="flex flex-col sm:flex-row items-center gap-3">
          <input
            type="text"
            disabled={mySide === 'neutral'}
            value={bulletMessage}
            onChange={(e) => setBulletMessage(e.target.value)}
            placeholder={
              mySide === 'neutral'
                ? 'Pilih Kubu Pro atau Kontra di atas terlebih dahulu untuk mengirim argumen...'
                : 'Ketik sanggahan cepat, fakta penelitian, atau argumen kunci untuk juru bicara...'
            }
            className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <label className="flex items-center gap-1.5 text-xs text-slate-300 whitespace-nowrap cursor-pointer">
            <input
              type="checkbox"
              checked={isFactCheck}
              onChange={(e) => setIsFactCheck(e.target.checked)}
              className="rounded border-white/10 text-indigo-600 focus:ring-0"
            />
            <span>Tandai sebagai Data/Fakta</span>
          </label>

          <button
            type="submit"
            disabled={mySide === 'neutral' || !bulletMessage.trim()}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all disabled:opacity-40 cursor-pointer flex items-center justify-center gap-2 shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Kirim Amunisi</span>
          </button>
        </form>
      </div>

    </div>
  );
};

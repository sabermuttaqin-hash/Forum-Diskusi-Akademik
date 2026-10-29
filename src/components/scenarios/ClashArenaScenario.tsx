import React, { useState } from 'react';
import { CourseRoom, ClashBulletChat } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { roomsService } from '../../lib/rooms';
import { 
  Swords, 
  Send, 
  ThumbsUp, 
  Mic, 
  Laptop, 
  BarChart3,
  Zap,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

interface ClashArenaScenarioProps {
  room: CourseRoom;
  onUpdateRoom?: () => void;
}

export const ClashArenaScenario: React.FC<ClashArenaScenarioProps> = ({ room, onUpdateRoom }) => {
  const { currentUser } = useAuth();

  const scenario = room.scenarioData;
  const proMembers = scenario.clashProMembers || [];
  const contraMembers = scenario.clashContraMembers || [];
  const bulletChats: ClashBulletChat[] = scenario.clashBulletChats || [];
  const votes = scenario.clashVotes || { pro: 15, contra: 12, userVotes: {} };

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
    if (previousVote === targetSide) return;

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
    <div className="space-y-8 font-sans animate-in fade-in duration-200">
      
      {/* Top Banner: Controversial Topic in ToyStore Playful Style */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border-2 border-indigo-200 shadow-md relative overflow-hidden">
        <div className="relative z-10 text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-300">
            <Swords className="w-4 h-4 text-indigo-600" />
            <span>Skenario: The Clash Arena (Arena Debat Strategis Berbasis Kubu)</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-brand leading-tight">
            "{scenario.clashTopic || 'Penggunaan AI dalam Pembelajaran Bahasa: Membantu atau Mematikan Kreativitas?'}"
          </h2>

          <p className="text-sm sm:text-base text-slate-600">
            Pilih kubu Anda. Siswa di rumah bertindak sebagai <strong className="text-indigo-700">Tim Riset & Amunisi (War Room)</strong>, sedangkan siswa di kelas bertindak sebagai <strong className="text-rose-600">Juru Bicara Podium</strong>.
          </p>

          {/* Kubu Selection Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-3">
            <button
              type="button"
              onClick={() => handleJoinSide('pro')}
              className={`w-full sm:w-auto px-6 py-3.5 rounded-2xl font-bold text-sm sm:text-base border-2 transition-all cursor-pointer flex items-center justify-center gap-2.5 ${
                mySide === 'pro'
                  ? 'bg-emerald-500 text-white border-emerald-600 shadow-md ring-2 ring-emerald-300'
                  : 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100'
              }`}
            >
              <span>Gabung KUBU PRO (Pendukung)</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/40 font-mono font-bold">
                {proMembers.length} Orang
              </span>
            </button>

            <span className="text-sm font-extrabold text-slate-400">VS</span>

            <button
              type="button"
              onClick={() => handleJoinSide('contra')}
              className={`w-full sm:w-auto px-6 py-3.5 rounded-2xl font-bold text-sm sm:text-base border-2 transition-all cursor-pointer flex items-center justify-center gap-2.5 ${
                mySide === 'contra'
                  ? 'bg-rose-500 text-white border-rose-600 shadow-md ring-2 ring-rose-300'
                  : 'bg-rose-50 border-rose-300 text-rose-800 hover:bg-rose-100'
              }`}
            >
              <span>Gabung KUBU KONTRA (Penentang)</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/40 font-mono font-bold">
                {contraMembers.length} Orang
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Sli.do Style Live Audience Voting Bar */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-600" />
            <span className="text-sm sm:text-base font-bold text-slate-800 font-brand">
              Live Sli.do Audience Meter: Argumen Kubu Mana Paling Kuat?
            </span>
          </div>
          <span className="text-xs sm:text-sm text-slate-500 font-bold">
            Total Suara: {totalVotes}
          </span>
        </div>

        {/* Meter progress bar */}
        <div className="w-full bg-slate-100 h-5 rounded-full overflow-hidden flex p-0.5 border border-slate-200">
          <div 
            className="bg-emerald-500 h-full rounded-l-full transition-all duration-500 flex items-center justify-center text-[11px] font-bold text-white"
            style={{ width: `${proPercentage}%` }}
          >
            {proPercentage > 15 ? `${proPercentage}% Pro` : ''}
          </div>
          <div 
            className="bg-rose-500 h-full rounded-r-full transition-all duration-500 flex items-center justify-center text-[11px] font-bold text-white"
            style={{ width: `${contraPercentage}%` }}
          >
            {contraPercentage > 15 ? `${contraPercentage}% Kontra` : ''}
          </div>
        </div>

        {/* Voting triggers */}
        <div className="flex items-center justify-between text-xs sm:text-sm font-bold pt-1">
          <button
            type="button"
            onClick={() => handleSlidoVote('pro')}
            className="px-4 py-2 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border border-emerald-300 flex items-center gap-2 cursor-pointer transition-all shadow-xs"
          >
            <ThumbsUp className="w-4 h-4 text-emerald-600" />
            <span>Vote Kubu Pro ({proPercentage}%)</span>
          </button>

          <span className="text-slate-500 text-xs hidden sm:inline">
            Klik tombol di sisi untuk memberikan voting real-time setiap ronde
          </span>

          <button
            type="button"
            onClick={() => handleSlidoVote('contra')}
            className="px-4 py-2 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-800 border border-rose-300 flex items-center gap-2 cursor-pointer transition-all shadow-xs"
          >
            <ThumbsUp className="w-4 h-4 text-rose-600" />
            <span>Vote Kubu Kontra ({contraPercentage}%)</span>
          </button>
        </div>
      </div>

      {/* 2 Podia: Pro vs Contra War Rooms & Live Bullet Chat */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* KUBU PRO PANEL */}
        <div className="p-6 rounded-3xl bg-emerald-50/60 border-2 border-emerald-200 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-emerald-200 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full bg-emerald-500" />
                <h3 className="text-base font-bold text-emerald-950 font-brand">
                  Kubu Pro: War Room & Amunisi Riset
                </h3>
              </div>
              <span className="text-xs px-3 py-1 rounded-full bg-emerald-200 text-emerald-900 font-bold">
                {proMembers.length} Anggota
              </span>
            </div>

            {/* Spokesperson Callout */}
            <div className="p-3.5 rounded-2xl bg-white border border-emerald-200 text-sm text-slate-700 mb-4 flex items-center gap-3 shadow-xs">
              <Mic className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <span className="text-xs font-bold text-emerald-800 block">Juru Bicara Podium (Di Kelas):</span>
                <span className="text-slate-900 font-extrabold text-sm sm:text-base">
                  {proMembers.find(m => m.isSpokesperson)?.userName || proMembers[0]?.userName || 'Belum ditunjuk'}
                </span>
              </div>
            </div>

            {/* Bullet Chats for Pro */}
            <div className="space-y-3 max-h-80 overflow-y-auto mb-4 pr-1">
              {bulletChats.filter(c => c.side === 'pro').map((chat) => (
                <div key={chat.id} className="p-4 rounded-2xl bg-white border border-emerald-200 text-sm space-y-1.5 shadow-xs">
                  <div className="flex items-center justify-between text-xs text-emerald-800 font-bold">
                    <span>{chat.authorName}</span>
                    <span>{chat.timestamp}</span>
                  </div>
                  <p className="text-slate-800 leading-relaxed font-sans">{chat.message}</p>
                  {chat.isFactCheck && (
                    <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                      <Zap className="w-3 h-3 text-emerald-600" /> Terverifikasi Fakta
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* KUBU KONTRA PANEL */}
        <div className="p-6 rounded-3xl bg-rose-50/60 border-2 border-rose-200 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-rose-200 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full bg-rose-500" />
                <h3 className="text-base font-bold text-rose-950 font-brand">
                  Kubu Kontra: War Room & Amunisi Riset
                </h3>
              </div>
              <span className="text-xs px-3 py-1 rounded-full bg-rose-200 text-rose-900 font-bold">
                {contraMembers.length} Anggota
              </span>
            </div>

            {/* Spokesperson Callout */}
            <div className="p-3.5 rounded-2xl bg-white border border-rose-200 text-sm text-slate-700 mb-4 flex items-center gap-3 shadow-xs">
              <Mic className="w-5 h-5 text-rose-600 shrink-0" />
              <div>
                <span className="text-xs font-bold text-rose-800 block">Juru Bicara Podium (Di Kelas):</span>
                <span className="text-slate-900 font-extrabold text-sm sm:text-base">
                  {contraMembers.find(m => m.isSpokesperson)?.userName || contraMembers[0]?.userName || 'Belum ditunjuk'}
                </span>
              </div>
            </div>

            {/* Bullet Chats for Contra */}
            <div className="space-y-3 max-h-80 overflow-y-auto mb-4 pr-1">
              {bulletChats.filter(c => c.side === 'contra').map((chat) => (
                <div key={chat.id} className="p-4 rounded-2xl bg-white border border-rose-200 text-sm space-y-1.5 shadow-xs">
                  <div className="flex items-center justify-between text-xs text-rose-800 font-bold">
                    <span>{chat.authorName}</span>
                    <span>{chat.timestamp}</span>
                  </div>
                  <p className="text-slate-800 leading-relaxed font-sans">{chat.message}</p>
                  {chat.isFactCheck && (
                    <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold">
                      <Zap className="w-3 h-3 text-rose-600" /> Data Sanggahan
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Live Bullet Chat Input Form */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h4 className="text-sm font-bold text-slate-900 font-brand">
            Kirim Amunisi Argumen Kilat (Tampil di Monitor Juru Bicara)
          </h4>
          <span className="text-xs font-bold text-slate-600">
            Mengirim sebagai: <strong className="text-slate-900">{mySide === 'pro' ? 'Kubu Pro' : mySide === 'contra' ? 'Kubu Kontra' : 'Penonton (Pilih Kubu Terlebih Dahulu)'}</strong>
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
                : 'Ketik sanggahan cepat, fakta riset, atau amunisi argumen untuk juru bicara...'
            }
            className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
          />

          <label className="flex items-center gap-2 text-xs font-bold text-slate-700 whitespace-nowrap cursor-pointer">
            <input
              type="checkbox"
              checked={isFactCheck}
              onChange={(e) => setIsFactCheck(e.target.checked)}
              className="rounded text-indigo-600 w-4 h-4"
            />
            <span>Data / Fakta Ilmiah</span>
          </label>

          <button
            type="submit"
            disabled={mySide === 'neutral' || !bulletMessage.trim()}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm transition-all disabled:opacity-40 cursor-pointer flex items-center justify-center gap-2 shrink-0 shadow-sm"
          >
            <Send className="w-4 h-4" />
            <span>Kirim Amunisi</span>
          </button>
        </form>
      </div>

    </div>
  );
};

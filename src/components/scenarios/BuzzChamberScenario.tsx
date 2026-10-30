import React, { useState, useEffect } from 'react';
import { CourseRoom, BuzzStation, BuzzIdea } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { roomsService } from '../../lib/rooms';
import { 
  Flame, 
  Lock, 
  Send, 
  Play, 
  Volume2, 
  CheckCircle2, 
  Sparkles,
  Timer,
  Clock
} from 'lucide-react';

interface BuzzChamberScenarioProps {
  room: CourseRoom;
  forumId?: string;
  forumTitle?: string;
  scenarioData?: any;
  onUpdateRoom?: () => void;
}

export const BuzzChamberScenario: React.FC<BuzzChamberScenarioProps> = ({ 
  room, 
  forumId, 
  forumTitle, 
  scenarioData: propScenarioData, 
  onUpdateRoom 
}) => {
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.isAdmin || currentUser?.uid === room.teacherId;

  const scenario = propScenarioData || room.scenarioData || { type: 'buzz' };
  const stations: BuzzStation[] = scenario.buzzStations || [];
  const ideas: BuzzIdea[] = scenario.buzzIdeas || [];

  const saveScenario = (updated: any) => {
    if (forumId) {
      roomsService.updateForumScenarioData(room.id, forumId, updated);
    } else {
      roomsService.updateScenarioData(room.id, updated);
    }
    if (onUpdateRoom) onUpdateRoom();
  };

  const [phase, setPhase] = useState<'ideation' | 'synthesis' | 'showcase' | 'idle'>(scenario.buzzPhase || 'ideation');
  const [timeLeft, setTimeLeft] = useState<number>(scenario.buzzTimeRemaining ?? 300);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [isLocked, setIsLocked] = useState<boolean>(scenario.buzzIsLocked || false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  const [selectedStationId, setSelectedStationId] = useState<string>(stations[0]?.id || '');
  const [newIdeaText, setNewIdeaText] = useState('');
  const [synthesisInput, setSynthesisInput] = useState('');
  const [activeShowcaseIdx, setActiveShowcaseIdx] = useState<number>(0);

  const playBuzzerSound = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(220, audioCtx.currentTime + 0.6);

      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.6);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.6);
    } catch (e) {
      console.warn('Audio buzzer notice:', e);
    }
  };

  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timeLeft > 0 && !isLocked) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            setIsTimerRunning(false);
            setIsLocked(true);
            playBuzzerSound();
            return 0;
          }
          if (prev === 60 || prev === 10) {
            playBuzzerSound();
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timeLeft, isLocked, soundEnabled]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartTimer = (durationSeconds: number, targetPhase: 'ideation' | 'synthesis') => {
    setTimeLeft(durationSeconds);
    setPhase(targetPhase);
    setIsLocked(false);
    setIsTimerRunning(true);
    playBuzzerSound();
  };

  const handleAddIdea = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIdeaText.trim() || isLocked || !currentUser) return;

    const newIdea: BuzzIdea = {
      id: `idea_${Date.now()}`,
      stationId: selectedStationId,
      authorName: currentUser.displayName,
      attendance: currentUser.role === 'admin' ? 'offline' : 'online',
      text: newIdeaText.trim(),
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedIdeas = [newIdea, ...ideas];
    saveScenario({
      ...scenario,
      buzzIdeas: updatedIdeas
    });

    setNewIdeaText('');
  };

  const handleSaveSynthesis = (stationId: string) => {
    if (!synthesisInput.trim()) return;

    const updatedStations = stations.map(s => {
      if (s.id === stationId) {
        return {
          ...s,
          synthesisResult: synthesisInput.trim()
        };
      }
      return s;
    });

    saveScenario({
      ...scenario,
      buzzStations: updatedStations
    });

    setSynthesisInput('');
  };

  const selectedStation = stations.find(s => s.id === selectedStationId);
  const stationIdeas = ideas.filter(i => i.stationId === selectedStationId);

  return (
    <div className="space-y-8 font-sans animate-in fade-in duration-200">
      
      {/* Top Banner & Blitz Countdown Monitor */}
      <div className={`p-6 sm:p-8 rounded-3xl border-2 transition-all duration-300 relative overflow-hidden shadow-md ${
        isLocked 
          ? 'bg-rose-50 border-rose-300' 
          : timeLeft <= 30 && isTimerRunning 
          ? 'bg-amber-50 border-amber-400' 
          : 'bg-white border-cyan-200'
      }`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-cyan-100 text-cyan-800 border border-cyan-300">
              <Flame className="w-4 h-4 text-cyan-600" />
              <span>Skenario: The Buzz Chamber (Letupan Ide Kilat 5 Menit)</span>
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-brand">
              The 5-Minute Blitz: {scenario.buzzMainTheme || 'Inovasi Cepat'}
            </h2>
            
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Putaran 1: Curah ide tanpa sensor (5 menit). Putaran 2: Sintesis 1 kesimpulan inti (5 menit). Sistem otomatis mengunci lembar kerja saat waktu habis!
            </p>
          </div>

          {/* Countdown Display Card */}
          <div className="flex flex-col items-center p-5 rounded-3xl bg-slate-50 border border-slate-200 shrink-0 shadow-xs">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-1">
              {phase === 'ideation' ? 'Fase 1: Ideation Blitz' : phase === 'synthesis' ? 'Fase 2: The Synthesis' : 'Selesai'}
            </span>

            <div className={`text-4xl sm:text-5xl font-black font-mono tracking-tight ${
              isLocked 
                ? 'text-rose-600' 
                : timeLeft <= 30 
                ? 'text-amber-500 animate-bounce' 
                : 'text-slate-900'
            }`}>
              {formatTimer(timeLeft)}
            </div>

            {isLocked && (
              <span className="inline-flex items-center gap-1.5 mt-2 text-xs px-3 py-1 rounded-full bg-rose-100 text-rose-800 border border-rose-300 font-bold">
                <Lock className="w-3.5 h-3.5" /> Terkunci Otomatis
              </span>
            )}

            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="mt-3 text-xs text-slate-500 hover:text-slate-900 font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Volume2 className={`w-3.5 h-3.5 ${soundEnabled ? 'text-cyan-600' : 'text-slate-400'}`} />
              <span>Buzzer Audio: {soundEnabled ? 'Aktif' : 'Mati'}</span>
            </button>
          </div>
        </div>

        {/* Guru Controls */}
        {isAdmin && (
          <div className="mt-6 pt-4 border-t border-slate-200 flex flex-wrap items-center gap-3">
            <span className="text-xs sm:text-sm font-bold text-slate-700">Kontrol Waktu Guru:</span>
            
            <button
              type="button"
              onClick={() => handleStartTimer(300, 'ideation')}
              className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <Play className="w-4 h-4" />
              <span>Mulai Putaran 1: Curah Ide (5 Mnt)</span>
            </button>

            <button
              type="button"
              onClick={() => handleStartTimer(300, 'synthesis')}
              className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <Play className="w-4 h-4" />
              <span>Mulai Putaran 2: Sintesis (5 Mnt)</span>
            </button>

            <button
              type="button"
              onClick={() => { setIsLocked(!isLocked); playBuzzerSound(); }}
              className="px-4 py-2 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-800 border border-rose-300 text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              <span>{isLocked ? 'Buka Kunci' : 'Kunci Paksa (Buzzer)'}</span>
            </button>
          </div>
        )}
      </div>

      {/* 5 Buzz Stations Selector */}
      <div className="space-y-3">
        <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-700">
          Pilih Stasiun Buzz Sub-Masalah:
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {stations.map((station, idx) => {
            const isSelected = station.id === selectedStationId;
            const ideasCount = ideas.filter(i => i.stationId === station.id).length;

            return (
              <button
                key={station.id}
                type="button"
                onClick={() => setSelectedStationId(station.id)}
                className={`p-5 rounded-3xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-cyan-50 border-cyan-500 shadow-md ring-2 ring-cyan-300'
                    : 'bg-white border-slate-200 hover:border-cyan-300'
                }`}
              >
                <div>
                  <span className="text-xs font-extrabold uppercase tracking-wider text-cyan-600 block mb-1">
                    Stasiun {idx + 1}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 mb-1.5 leading-snug">
                    {station.title}
                  </h4>
                  <p className="text-xs text-slate-500 line-clamp-2">
                    {station.subProblem}
                  </p>
                </div>

                <div className="mt-4 pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-500">{ideasCount} Ide</span>
                  {station.synthesisResult && (
                    <span className="text-emerald-600">Tersintesis</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Station Workspace */}
      {selectedStation && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <span className="text-xs sm:text-sm font-extrabold text-cyan-600 uppercase tracking-wider">
                Ruang Kolaborasi: {selectedStation.title}
              </span>
              <p className="text-base font-bold text-slate-900 mt-1">
                Sub-Masalah: {selectedStation.subProblem}
              </p>
            </div>
            
            <div className="flex items-center gap-2 text-xs sm:text-sm font-bold">
              <span className="text-slate-500">Status Kunci:</span>
              <span className={`px-3 py-1 rounded-full border ${
                isLocked ? 'bg-rose-100 text-rose-800 border-rose-300' : 'bg-emerald-100 text-emerald-800 border-emerald-300'
              }`}>
                {isLocked ? 'Terkunci' : 'Bebas Ketik'}
              </span>
            </div>
          </div>

          {/* Sticky Ideas Board (Putaran 1) */}
          <div>
            <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2 font-brand">
              <Sparkles className="w-4 h-4 text-cyan-600" />
              Papan Curah Ide Tanpa Sensor ({stationIdeas.length} Ide Masuk):
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-4">
              {stationIdeas.length === 0 ? (
                <div className="col-span-full py-8 text-center text-sm text-slate-400 italic bg-slate-50 rounded-2xl border border-slate-200">
                  Belum ada ide yang dilempar. Ketikkan ide spontan Anda di kolom bawah!
                </div>
              ) : (
                stationIdeas.map((idea) => (
                  <div key={idea.id} className="p-4 rounded-2xl bg-cyan-50/60 border border-cyan-200 text-sm space-y-2 shadow-xs">
                    <p className="text-slate-900 leading-relaxed font-sans font-medium">{idea.text}</p>
                    <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-cyan-100">
                      <span className="font-bold">{idea.authorName} ({idea.attendance})</span>
                      <span>{idea.createdAt}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleAddIdea} className="flex gap-2">
              <input
                type="text"
                disabled={isLocked}
                value={newIdeaText}
                onChange={(e) => setNewIdeaText(e.target.value)}
                placeholder={
                  isLocked 
                    ? 'Waktu habis! Lembar kerja telah dikunci oleh sistem.' 
                    : 'Ketikkan ide spontan Anda secepat kilat (jangan disensor)...'
                }
                className="flex-1 bg-slate-50 border border-slate-300 rounded-2xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:bg-white"
              />
              <button
                type="submit"
                disabled={isLocked || !newIdeaText.trim()}
                className="px-6 py-3 rounded-2xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-sm transition-all disabled:opacity-40 cursor-pointer flex items-center gap-2 shadow-sm"
              >
                <Send className="w-4 h-4" />
                <span>Lempar Ide</span>
              </button>
            </form>
          </div>

          {/* Putaran 2: The Synthesis */}
          <div className="pt-6 border-t border-slate-100 space-y-3">
            <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2 font-brand">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Putaran 2: Sintesis 1 Kesimpulan Inti Terkuat
            </h4>

            {selectedStation.synthesisResult && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-sm text-slate-800">
                <span className="font-bold text-emerald-900 block mb-1">Kesimpulan Final Stasiun Ini:</span>
                "{selectedStation.synthesisResult}"
              </div>
            )}

            <div className="flex gap-2">
              <input
                type="text"
                disabled={isLocked}
                value={synthesisInput}
                onChange={(e) => setSynthesisInput(e.target.value)}
                placeholder="Rangkum seluruh ide di atas menjadi 1 kalimat rekomendasi inti..."
                className="flex-1 bg-slate-50 border border-slate-300 rounded-2xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
              <button
                type="button"
                onClick={() => handleSaveSynthesis(selectedStation.id)}
                disabled={isLocked || !synthesisInput.trim()}
                className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-all disabled:opacity-40 cursor-pointer shadow-sm"
              >
                Simpan Sintesis
              </button>
            </div>
          </div>

        </div>
      )}

      {/* Fase Penutup: The Chain Presentation */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 font-brand flex items-center gap-2">
              <Timer className="w-5 h-5 text-cyan-600" />
              Fase Penutup: The Chain Presentation (Estafet 1 Menit)
            </h3>
            <p className="text-xs sm:text-sm text-slate-600">
              Setiap stasiun memiliki waktu tepat 1 menit untuk membacakan kesimpulan intinya di layar kelas.
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            {stations.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActiveShowcaseIdx(i)}
                className={`w-9 h-9 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeShowcaseIdx === i 
                    ? 'bg-cyan-600 text-white shadow-sm' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>

        {(() => {
          const st = stations[activeShowcaseIdx];
          if (!st) return null;
          return (
            <div className="p-5 rounded-2xl bg-cyan-50/50 border border-cyan-200 space-y-2">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="font-bold text-slate-900 text-sm sm:text-base">{st.title}</span>
                <span className="text-slate-500 font-bold">Stasiun #{activeShowcaseIdx + 1}</span>
              </div>
              <p className="text-sm text-slate-700">
                <strong>Masalah:</strong> {st.subProblem}
              </p>
              <div className="mt-2 p-3.5 rounded-xl bg-white border border-cyan-200 text-sm text-slate-900">
                <strong>Hasil Sintesis Kilat:</strong> {st.synthesisResult || 'Belum menyelesaikan sintesis 1 kalimat.'}
              </div>
            </div>
          );
        })()}
      </div>

    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { CourseRoom, BuzzStation, BuzzIdea } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { roomsService } from '../../lib/rooms';
import { 
  Timer, 
  Sparkles, 
  Flame, 
  Lock, 
  Send, 
  Play, 
  RotateCcw, 
  Volume2, 
  AlertCircle,
  Clock,
  Layers,
  CheckCircle2,
  BellRing
} from 'lucide-react';

interface BuzzChamberScenarioProps {
  room: CourseRoom;
  onUpdateRoom?: () => void;
}

export const BuzzChamberScenario: React.FC<BuzzChamberScenarioProps> = ({ room, onUpdateRoom }) => {
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.isAdmin || currentUser?.uid === room.teacherId;

  const scenario = room.scenarioData;
  const stations: BuzzStation[] = scenario.buzzStations || [];
  const ideas: BuzzIdea[] = scenario.buzzIdeas || [];

  const [phase, setPhase] = useState<'ideation' | 'synthesis' | 'showcase' | 'idle'>(scenario.buzzPhase || 'ideation');
  const [timeLeft, setTimeLeft] = useState<number>(scenario.buzzTimeRemaining ?? 300); // 5 mins
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [isLocked, setIsLocked] = useState<boolean>(scenario.buzzIsLocked || false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // User input states
  const [selectedStationId, setSelectedStationId] = useState<string>(stations[0]?.id || '');
  const [newIdeaText, setNewIdeaText] = useState('');
  const [synthesisInput, setSynthesisInput] = useState('');
  const [activeShowcaseIdx, setActiveShowcaseIdx] = useState<number>(0);

  // Play synthesized audio beep buzzer using Web Audio API
  const playBuzzerSound = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
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

  // Timer interval effect
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
    roomsService.updateScenarioData(room.id, {
      ...scenario,
      buzzIdeas: updatedIdeas
    });

    setNewIdeaText('');
    if (onUpdateRoom) onUpdateRoom();
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

    roomsService.updateScenarioData(room.id, {
      ...scenario,
      buzzStations: updatedStations
    });

    setSynthesisInput('');
    if (onUpdateRoom) onUpdateRoom();
  };

  const selectedStation = stations.find(s => s.id === selectedStationId);
  const stationIdeas = ideas.filter(i => i.stationId === selectedStationId);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Top Banner & Blitz Countdown Monitor */}
      <div className={`p-6 sm:p-8 rounded-3xl border transition-all duration-300 relative overflow-hidden ${
        isLocked 
          ? 'bg-rose-950/20 border-rose-500/50 shadow-2xl shadow-rose-950/30' 
          : timeLeft <= 30 && isTimerRunning 
          ? 'bg-amber-950/20 border-amber-500 animate-pulse' 
          : 'bg-[#0F111E] border-white/10'
      }`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 mb-2">
              <Flame className="w-3.5 h-3.5 text-cyan-400" />
              <span>Skenario C: The Buzz Chamber (Letupan Ide Kilat & Sintesis Cepat)</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white font-serif-academic mb-2">
              The 5-Minute Blitz: {scenario.buzzMainTheme || 'Inovasi Kolaboratif'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
              Putaran 1: Curah ide tanpa sensor (5 menit). Putaran 2: Sintesis 1 kesimpulan inti (5 menit). Saat waktu habis, lembar kerja otomatis terkunci!
            </p>
          </div>

          {/* Large Countdown Display & Buzzer */}
          <div className="flex flex-col items-center p-4 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md shrink-0">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
              {phase === 'ideation' ? 'Fase 1: Ideation Blitz' : phase === 'synthesis' ? 'Fase 2: The Synthesis' : 'Waktu Selesai'}
            </span>

            <div className={`text-3xl sm:text-4xl font-extrabold font-mono tracking-tight ${
              isLocked 
                ? 'text-rose-400' 
                : timeLeft <= 30 
                ? 'text-amber-400 animate-ping' 
                : 'text-white'
            }`}>
              {formatTimer(timeLeft)}
            </div>

            {/* Lock / Alarm Indicator */}
            {isLocked && (
              <span className="inline-flex items-center gap-1 mt-2 text-[11px] px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold">
                <Lock className="w-3 h-3" /> Lembar Kerja Terkunci!
              </span>
            )}

            {/* Audio Buzzer toggle */}
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="mt-2 text-[10px] text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
            >
              <Volume2 className={`w-3 h-3 ${soundEnabled ? 'text-emerald-400' : 'text-slate-500'}`} />
              <span>Buzzer Audio: {soundEnabled ? 'Aktif' : 'Nonaktif'}</span>
            </button>
          </div>
        </div>

        {/* Guru / Admin Timer Controls */}
        {isAdmin && (
          <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center gap-3">
            <span className="text-xs font-semibold text-slate-300">Kontrol Waktu Guru:</span>
            
            <button
              type="button"
              onClick={() => handleStartTimer(300, 'ideation')}
              className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Play className="w-3 h-3" />
              <span>Mulai Putaran 1: Curah Ide (5 Mnt)</span>
            </button>

            <button
              type="button"
              onClick={() => handleStartTimer(300, 'synthesis')}
              className="px-3 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Play className="w-3 h-3" />
              <span>Mulai Putaran 2: Sintesis (5 Mnt)</span>
            </button>

            <button
              type="button"
              onClick={() => { setIsLocked(!isLocked); playBuzzerSound(); }}
              className="px-3 py-1.5 rounded-xl bg-rose-600/30 hover:bg-rose-600/50 text-rose-300 border border-rose-500/40 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <Lock className="w-3 h-3" />
              <span>{isLocked ? 'Buka Kunci' : 'Kunci Paksa (Buzzer)'}</span>
            </button>
          </div>
        )}
      </div>

      {/* 5 Buzz Stations Selector */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
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
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-cyan-950/30 border-cyan-500 shadow-lg shadow-cyan-950/40 ring-1 ring-cyan-500/30'
                    : 'bg-white/[0.02] border-white/10 hover:bg-white/[0.04]'
                }`}
              >
                <div>
                  <span className="text-[10px] font-bold text-cyan-400 block mb-1">
                    Stasiun {idx + 1}
                  </span>
                  <h4 className="text-xs font-bold text-white mb-1 line-clamp-2">
                    {station.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 line-clamp-2">
                    {station.subProblem}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-400">
                  <span>{ideasCount} Ide Masuk</span>
                  {station.synthesisResult && (
                    <span className="text-emerald-400 font-bold">Tersintesis</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Station Workspace (Putaran 1 & Putaran 2) */}
      {selectedStation && (
        <div className="p-6 rounded-3xl bg-[#0F111E] border border-white/10 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
            <div>
              <span className="text-xs font-bold text-cyan-400">
                Ruang Kolaborasi: {selectedStation.title}
              </span>
              <p className="text-sm font-medium text-white mt-1">
                Sub-Masalah: {selectedStation.subProblem}
              </p>
            </div>
            
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400">Status Kunci:</span>
              <span className={`px-2 py-0.5 rounded-full font-bold ${
                isLocked ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'
              }`}>
                {isLocked ? 'Terkunci' : 'Bebas Ketik'}
              </span>
            </div>
          </div>

          {/* Sticky Ideas Board (Putaran 1 - Curah Ide Kilat) */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              Papan Curah Ide Tanpa Sensor ({stationIdeas.length} Ide Masuk):
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-4">
              {stationIdeas.length === 0 ? (
                <div className="col-span-full py-8 text-center text-xs text-slate-500 italic bg-white/[0.01] rounded-2xl border border-white/5">
                  Belum ada ide yang dilempar. Ketikkan ide spontan Anda di kolom bawah!
                </div>
              ) : (
                stationIdeas.map((idea) => (
                  <div key={idea.id} className="p-3.5 rounded-2xl bg-white/[0.03] border border-cyan-500/20 text-xs space-y-2">
                    <p className="text-white leading-relaxed font-sans">{idea.text}</p>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-white/5">
                      <span>{idea.authorName} ({idea.attendance})</span>
                      <span>{idea.createdAt}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Input Form for Putaran 1 */}
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
                className="flex-1 bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              <button
                type="submit"
                disabled={isLocked || !newIdeaText.trim()}
                className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition-all disabled:opacity-40 cursor-pointer flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Lempar Ide</span>
              </button>
            </form>
          </div>

          {/* Putaran 2: The Synthesis (Menyaring menjadi 1 kesimpulan inti) */}
          <div className="pt-6 border-t border-white/10 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-violet-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Putaran 2: Sintesis 1 Kesimpulan Inti Terkuat
            </h4>

            {selectedStation.synthesisResult && (
              <div className="p-4 rounded-2xl bg-violet-950/30 border border-violet-500/40 text-xs sm:text-sm text-violet-200">
                <span className="font-bold text-white block mb-1">Kesimpulan Final Stasiun Ini:</span>
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
                className="flex-1 bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
              <button
                type="button"
                onClick={() => handleSaveSynthesis(selectedStation.id)}
                disabled={isLocked || !synthesisInput.trim()}
                className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs transition-all disabled:opacity-40 cursor-pointer"
              >
                Simpan Sintesis
              </button>
            </div>
          </div>

        </div>
      )}

      {/* Fase Penutup: The Chain Presentation (1 Menit per Stasiun) */}
      <div className="p-6 rounded-3xl bg-[#0F111E] border border-white/10 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Timer className="w-4 h-4 text-cyan-400" />
              Fase Penutup: The Chain Presentation (Estafet 1 Menit)
            </h3>
            <p className="text-xs text-slate-400">
              Setiap stasiun memiliki waktu tepat 1 menit untuk membacakan kesimpulan intinya di layar proyektor kelas.
            </p>
          </div>
          <div className="flex items-center gap-1">
            {stations.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActiveShowcaseIdx(i)}
                className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeShowcaseIdx === i 
                    ? 'bg-cyan-500 text-slate-950 font-mono shadow-md' 
                    : 'bg-white/5 text-slate-400 hover:text-white'
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
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-cyan-300">{st.title}</span>
                <span className="text-slate-400">Stasiun #{activeShowcaseIdx + 1}</span>
              </div>
              <p className="text-xs text-slate-300">
                <strong>Masalah:</strong> {st.subProblem}
              </p>
              <div className="mt-2 p-3 rounded-xl bg-cyan-950/20 border border-cyan-500/30 text-xs text-cyan-200">
                <strong>Hasil Sintesis Kilat:</strong> {st.synthesisResult || 'Belum menyelesaikan sintesis 1 kalimat.'}
              </div>
            </div>
          );
        })()}
      </div>

    </div>
  );
};

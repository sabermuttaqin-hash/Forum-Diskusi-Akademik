import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { roomsService } from '../lib/rooms';
import { CourseRoom } from '../types';
import { 
  X, 
  KeyRound, 
  Building, 
  Laptop, 
  CheckCircle2, 
  AlertCircle,
  ArrowRight
} from 'lucide-react';

interface JoinRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJoined: (room: CourseRoom) => void;
  initialCode?: string;
}

export const JoinRoomModal: React.FC<JoinRoomModalProps> = ({ 
  isOpen, 
  onClose, 
  onJoined,
  initialCode = ''
}) => {
  const { currentUser } = useAuth();
  const [code, setCode] = useState(initialCode);
  const [attendance, setAttendance] = useState<'offline' | 'online'>('offline');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !currentUser) return;
    setErrorMsg(null);

    const res = roomsService.joinRoomByCode(code.trim(), currentUser, attendance);
    if (!res.success || !res.room) {
      setErrorMsg(res.message || 'Gagal bergabung ke room.');
      return;
    }

    onJoined(res.room);
    onClose();
  };

  const handleQuickPick = (sampleCode: string) => {
    setCode(sampleCode);
    setErrorMsg(null);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-[#0B0D19] w-full max-w-md rounded-3xl shadow-2xl border border-white/10 overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-violet-600/20 text-violet-400">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-serif-academic">
                Gabung ke Ruang Kelas
              </h3>
              <p className="text-xs text-slate-400">
                Masukkan kode room dari pengampu Anda
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Kode Room Kelas
            </label>
            <input
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="Contoh: EXP890"
              className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-center text-lg font-mono font-bold tracking-widest text-violet-300 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 uppercase"
            />
          </div>

          {/* Quick Code samples */}
          <div className="text-[11px] text-slate-400">
            <span className="block mb-1.5 text-slate-500 font-semibold">Coba Kode Room Skenario:</span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleQuickPick('EXP890')}
                className="px-2.5 py-1 rounded-lg bg-violet-500/10 hover:bg-violet-500/20 text-violet-300 border border-violet-500/20 cursor-pointer font-mono font-bold"
              >
                EXP890 (Expedition)
              </button>
              <button
                type="button"
                onClick={() => handleQuickPick('CLS404')}
                className="px-2.5 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 cursor-pointer font-mono font-bold"
              >
                CLS404 (Clash Debat)
              </button>
              <button
                type="button"
                onClick={() => handleQuickPick('BUZ303')}
                className="px-2.5 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/20 cursor-pointer font-mono font-bold"
              >
                BUZ303 (Buzz 5-Mnt)
              </button>
            </div>
          </div>

          {/* Attendance Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Status Kehadiran Sesi Ini:
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setAttendance('offline')}
                className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                  attendance === 'offline'
                    ? 'bg-violet-600/30 border-violet-500 text-white shadow-md'
                    : 'bg-white/[0.02] border-white/10 text-slate-400 hover:text-white'
                }`}
              >
                <Building className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold">Hadir Offline di Kelas</span>
                <span className="text-[10px] text-slate-400">Duduk di Meja Fisik</span>
              </button>

              <button
                type="button"
                onClick={() => setAttendance('online')}
                className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                  attendance === 'online'
                    ? 'bg-violet-600/30 border-violet-500 text-white shadow-md'
                    : 'bg-white/[0.02] border-white/10 text-slate-400 hover:text-white'
                }`}
              >
                <Laptop className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-bold">Hadir Online di Rumah</span>
                <span className="text-[10px] text-slate-400">War Room / Breakout</span>
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={!code.trim()}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-xs sm:text-sm shadow-md transition-all disabled:opacity-40 cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Gabung Kelas Sekarang</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

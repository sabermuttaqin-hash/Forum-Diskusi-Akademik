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
  ArrowRight,
  Sparkles
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
      setErrorMsg(res.message || 'Gagal bergabung ke ruang kelas.');
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-[#EFE9E1] overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#EFE9E1] bg-[#FAF8F5] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#FFEDE7] text-[#FF5B37]">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 font-serif-academic">
                Gabung ke Ruang Kelas
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Masukkan 6-karakter kode room dari pengampu
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1.5">
              Kode Room Kelas
            </label>
            <input
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="Contoh: EXP101 atau CLS202"
              className="w-full bg-[#FAF8F5] border border-[#E5DFD5] rounded-2xl py-3 px-4 text-center text-lg font-mono font-black tracking-widest text-slate-900 placeholder-slate-400 uppercase focus:outline-none focus:ring-2 focus:ring-[#FF5B37]/30 focus:border-[#FF5B37]"
            />
          </div>

          {/* Quick code pills */}
          <div>
            <span className="text-[11px] font-bold text-slate-500 block mb-1.5 uppercase tracking-wider">
              Pilihan Cepat Skenario Tersedia:
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleQuickPick('EXP101')}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-violet-50 text-violet-700 border border-violet-200 hover:bg-violet-100 transition-all cursor-pointer"
              >
                EXP101 (The Expedition)
              </button>
              <button
                type="button"
                onClick={() => handleQuickPick('CLS202')}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition-all cursor-pointer"
              >
                CLS202 (The Clash Arena)
              </button>
              <button
                type="button"
                onClick={() => handleQuickPick('BUZ303')}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-50 text-[#FF5B37] border border-rose-200 hover:bg-rose-100 transition-all cursor-pointer"
              >
                BUZ303 (The Buzz Chamber)
              </button>
            </div>
          </div>

          {/* Attendance Status */}
          <div>
            <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-2">
              Status Kehadiran Anda Saat Ini:
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setAttendance('offline')}
                className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                  attendance === 'offline'
                    ? 'bg-[#FFEDE7] border-[#FF5B37] text-[#FF5B37] font-bold shadow-xs'
                    : 'bg-[#FAF8F5] border-[#E5DFD5] text-slate-600 font-medium hover:border-slate-300'
                }`}
              >
                <Building className="w-5 h-5 mx-auto mb-1 text-slate-700" />
                <span className="text-xs sm:text-sm block">Di Kelas (Offline)</span>
              </button>

              <button
                type="button"
                onClick={() => setAttendance('online')}
                className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                  attendance === 'online'
                    ? 'bg-sky-50 border-sky-400 text-sky-700 font-bold shadow-xs'
                    : 'bg-[#FAF8F5] border-[#E5DFD5] text-slate-600 font-medium hover:border-slate-300'
                }`}
              >
                <Laptop className="w-5 h-5 mx-auto mb-1 text-slate-700" />
                <span className="text-xs sm:text-sm block">Di Rumah (Online)</span>
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={!code.trim()}
              className="px-6 py-2.5 rounded-2xl bg-[#FF5B37] hover:bg-[#E84E2C] text-white font-bold text-xs sm:text-sm shadow-md shadow-[#FF5B37]/25 transition-all disabled:opacity-50 cursor-pointer flex items-center gap-2"
            >
              <span>Masuk Kelas</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

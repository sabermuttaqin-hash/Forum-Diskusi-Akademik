import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { CourseRoom, JenjangType } from '../types';
import { roomsService } from '../lib/rooms';
import { 
  X, 
  PlusCircle, 
  BookOpen, 
  GraduationCap, 
  Palette, 
  Sparkles,
  Layers
} from 'lucide-react';

interface NewRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRoomCreated: (newRoom: CourseRoom) => void;
}

const JENJANG_OPTIONS: { id: JenjangType; label: string; desc: string }[] = [
  { id: 'SD', label: 'SD / Madrasah', desc: 'Sekolah Dasar' },
  { id: 'SMP', label: 'SMP / MTs', desc: 'Sekolah Menengah Pertama' },
  { id: 'SMA/SMK', label: 'SMA / SMK / MA', desc: 'Sekolah Menengah Atas/Kejuruan' },
  { id: 'Perguruan Tinggi', label: 'Perguruan Tinggi', desc: 'Universitas / Institut / Vokasi' },
  { id: 'Umum', label: 'Umum & Komunitas', desc: 'Pendidikan Terbuka & Riset' },
];

export const NewRoomModal: React.FC<NewRoomModalProps> = ({ isOpen, onClose, onRoomCreated }) => {
  const { currentUser } = useAuth();

  const [name, setName] = useState('');
  const [jenjang, setJenjang] = useState<JenjangType>('Perguruan Tinggi');
  const [subject, setSubject] = useState('Kajian Bahasa & Linguistik');
  const [section, setSection] = useState('Kelas A - Semester Ganjil');
  const [description, setDescription] = useState('');
  const [bannerGradient, setBannerGradient] = useState('from-[#FF5B37] via-[#FF8A65] to-[#FFA726]');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !currentUser) return;

    // Generate room code e.g. CLS890, KLS404
    const randPrefix = 'ROOM';
    const randNum = Math.floor(100 + Math.random() * 900);
    const roomCode = `${randPrefix}${randNum}`;

    const created = roomsService.createRoom({
      name: name.trim(),
      jenjang,
      section: section.trim() || 'Kelas Reguler',
      subject: subject.trim() || 'Mata Kuliah / Pelajaran',
      roomCode,
      teacherId: currentUser.uid,
      teacherName: currentUser.displayName,
      description: description.trim() || `Ruang kelas akademik untuk mata pelajaran ${subject.trim()}. Guru dapat membuat beberapa sesi forum diskusi interaktif di dalamnya.`,
      bannerGradient,
      forums: []
    });

    onRoomCreated(created);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-[#EFE9E1] overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#EFE9E1] bg-[#FAF8F5] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#FFEDE7] text-[#FF5B37]">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 font-serif-academic">
                Buat Ruang Kelas Baru
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Pilih jenjang pendidikan dan nama kelas (Model diskusi dibuat per-forum di dalam room)
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
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* Room Name */}
          <div>
            <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1.5">
              Nama Ruang Kelas / Course <span className="text-[#FF5B37]">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Analisis Teks Kritis & Sastra Kontemporer"
              className="w-full bg-[#FAF8F5] border border-[#E5DFD5] rounded-2xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FF5B37]/30 focus:border-[#FF5B37]"
            />
          </div>

          {/* Jenjang Pendidikan Selector */}
          <div>
            <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-2 flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-[#FF5B37]" />
              <span>Jenjang Pendidikan <span className="text-[#FF5B37]">*</span></span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {JENJANG_OPTIONS.map((opt) => {
                const isSelected = jenjang === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setJenjang(opt.id)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#FFEDE7] border-[#FF5B37] ring-2 ring-[#FF5B37]/30 text-slate-900 shadow-sm'
                        : 'bg-[#FAF8F5] border-[#EFE9E1] text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <div className="text-xs sm:text-sm font-black font-serif-academic text-slate-800">
                      {opt.label}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5 leading-tight">
                      {opt.desc}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Subject & Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1.5">
                Subjek / Mata Pelajaran <span className="text-[#FF5B37]">*</span>
              </label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Contoh: Bahasa & Komunikasi, IPA, Fisika"
                className="w-full bg-[#FAF8F5] border border-[#E5DFD5] rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FF5B37]/30"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1.5">
                Bagian / Kelas / Sesi
              </label>
              <input
                type="text"
                value={section}
                onChange={(e) => setSection(e.target.value)}
                placeholder="Contoh: Kelas 10-A, Semester Ganjil"
                className="w-full bg-[#FAF8F5] border border-[#E5DFD5] rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FF5B37]/30"
              />
            </div>
          </div>

          {/* Banner Gradient Palette */}
          <div>
            <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Palette className="w-4 h-4 text-slate-500" />
              <span>Warna Kartu Room (Tema ToyStore)</span>
            </label>
            <div className="flex items-center gap-3">
              {[
                { name: 'Warm Coral', val: 'from-[#FF5B37] via-[#FF8A65] to-[#FFA726]' },
                { name: 'Royal Indigo', val: 'from-[#4F46E5] via-[#6366F1] to-[#818CF8]' },
                { name: 'Mint Emerald', val: 'from-[#059669] via-[#10B981] to-[#34D399]' },
                { name: 'Ocean Cyan', val: 'from-[#0284C7] via-[#0EA5E9] to-[#38BDF8]' },
                { name: 'Berry Violet', val: 'from-[#7C3AED] via-[#9333EA] to-[#C084FC]' }
              ].map((g) => (
                <button
                  key={g.name}
                  type="button"
                  onClick={() => setBannerGradient(g.val)}
                  className={`w-9 h-9 rounded-2xl bg-gradient-to-r ${g.val} transition-transform cursor-pointer ${
                    bannerGradient === g.val ? 'ring-3 ring-[#FF5B37] scale-110' : 'opacity-80 hover:opacity-100'
                  }`}
                  title={g.name}
                />
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1.5">
              Deskripsi Kelas (Opsional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Jelaskan silabus singkat atau tujuan pembelajaran kelas ini..."
              className="w-full bg-[#FAF8F5] border border-[#E5DFD5] rounded-2xl p-3 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FF5B37]/30 resize-none"
            />
          </div>

          <div className="bg-[#FAF8F5] p-3 rounded-2xl border border-[#EFE9E1] text-xs text-slate-600 flex items-start gap-2">
            <Layers className="w-4 h-4 text-[#FF5B37] shrink-0 mt-0.5" />
            <span>
              <strong>Arsitektur Multi-Forum:</strong> Setelah ruang kelas ini dibuat, Anda dapat menambahkan beberapa forum diskusi di dalamnya dengan model diskusi berbeda (The Expedition Choice, Clash Arena, Buzz Chamber) dan topik pembahasan yang dapat disesuaikan sepenuhnya.
            </span>
          </div>

          {/* Action Footer */}
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
              disabled={!name.trim()}
              className="px-6 py-2.5 rounded-2xl bg-[#FF5B37] hover:bg-[#E84E2C] text-white font-bold text-xs sm:text-sm shadow-md shadow-[#FF5B37]/25 transition-all disabled:opacity-50 cursor-pointer"
            >
              Buat Kelas Sekarang
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

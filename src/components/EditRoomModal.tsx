import React, { useState, useEffect } from 'react';
import { CourseRoom, JenjangType } from '../types';
import { roomsService } from '../lib/rooms';
import { 
  X, 
  Edit3, 
  Palette, 
  Save, 
  CheckCircle2, 
  GraduationCap
} from 'lucide-react';

interface EditRoomModalProps {
  room: CourseRoom;
  isOpen: boolean;
  onClose: () => void;
  onRoomUpdated: (updatedRoom: CourseRoom) => void;
}

const JENJANG_OPTIONS: { id: JenjangType; label: string }[] = [
  { id: 'SD', label: 'SD / Madrasah' },
  { id: 'SMP', label: 'SMP / MTs' },
  { id: 'SMA/SMK', label: 'SMA / SMK / MA' },
  { id: 'Perguruan Tinggi', label: 'Perguruan Tinggi' },
  { id: 'Umum', label: 'Umum' },
];

export const EditRoomModal: React.FC<EditRoomModalProps> = ({
  room,
  isOpen,
  onClose,
  onRoomUpdated
}) => {
  const [name, setName] = useState(room.name);
  const [jenjang, setJenjang] = useState<JenjangType>((room.jenjang as JenjangType) || 'Perguruan Tinggi');
  const [section, setSection] = useState(room.section);
  const [subject, setSubject] = useState(room.subject);
  const [description, setDescription] = useState(room.description);
  const [bannerGradient, setBannerGradient] = useState(room.bannerGradient || 'from-[#FF5B37] via-[#FF8A65] to-[#FFA726]');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setName(room.name);
      setJenjang((room.jenjang as JenjangType) || 'Perguruan Tinggi');
      setSection(room.section);
      setSubject(room.subject);
      setDescription(room.description);
      setBannerGradient(room.bannerGradient || 'from-[#FF5B37] via-[#FF8A65] to-[#FFA726]');
      setSuccessMsg(null);
    }
  }, [isOpen, room]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const updated = roomsService.updateRoom(room.id, {
      name: name.trim(),
      jenjang,
      section: section.trim(),
      subject: subject.trim(),
      description: description.trim(),
      bannerGradient
    });

    if (updated) {
      setSuccessMsg('Perubahan informasi ruang kelas berhasil disimpan!');
      onRoomUpdated(updated);
      setTimeout(() => {
        onClose();
      }, 700);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border-2 border-amber-300 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#EFE9E1] bg-amber-50/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-100 text-amber-800">
              <Edit3 className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 font-serif-academic">
                Edit Informasi Ruang Kelas (Guru)
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Perbarui nama, jenjang pendidikan, subjek, atau deskripsi ruang kelas
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
          {successMsg && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-xs sm:text-sm font-bold text-slate-800 mb-1.5">
              Nama Ruang Kelas <span className="text-[#FF5B37]">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Kajian Wacana Kritis & Linguistik Terapan"
              className="w-full bg-[#FAF8F5] border border-[#E5DFD5] rounded-2xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FF5B37]/30 focus:border-[#FF5B37]"
            />
          </div>

          {/* Jenjang Selector */}
          <div>
            <label className="block text-xs sm:text-sm font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-[#FF5B37]" />
              <span>Jenjang Pendidikan</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {JENJANG_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setJenjang(opt.id)}
                  className={`p-2.5 rounded-xl border text-center text-xs font-bold transition-all cursor-pointer ${
                    jenjang === opt.id
                      ? 'bg-[#FFEDE7] border-[#FF5B37] ring-2 ring-[#FF5B37]/20 text-slate-900'
                      : 'bg-[#FAF8F5] border-[#EFE9E1] text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs sm:text-sm font-bold text-slate-800 mb-1.5">
                Bagian / Sesi Kelas
              </label>
              <input
                type="text"
                value={section}
                onChange={(e) => setSection(e.target.value)}
                placeholder="Contoh: Kelas A - Semester Ganjil"
                className="w-full bg-[#FAF8F5] border border-[#E5DFD5] rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FF5B37]/30"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-bold text-slate-800 mb-1.5">
                Bidang Studi / Subjek
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Contoh: Linguistik & Filsafat"
                className="w-full bg-[#FAF8F5] border border-[#E5DFD5] rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FF5B37]/30"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-bold text-slate-800 mb-1.5">
              Deskripsi & Silabus Kelas
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tuliskan petunjuk pembelajaran atau silabus singkat..."
              className="w-full bg-[#FAF8F5] border border-[#E5DFD5] rounded-2xl p-3.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FF5B37]/30 resize-none"
            />
          </div>

          {/* Banner Palette */}
          <div>
            <label className="block text-xs sm:text-sm font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
              <Palette className="w-4 h-4 text-slate-500" />
              <span>Warna Kartu Room</span>
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
                    bannerGradient === g.val ? 'ring-3 ring-amber-500 scale-110' : 'opacity-80 hover:opacity-100'
                  }`}
                  title={g.name}
                />
              ))}
            </div>
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
              className="px-6 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs sm:text-sm shadow-md transition-all disabled:opacity-50 cursor-pointer flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Perubahan</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

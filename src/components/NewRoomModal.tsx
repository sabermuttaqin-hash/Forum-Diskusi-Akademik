import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { CourseRoom, ScenarioType } from '../types';
import { roomsService } from '../lib/rooms';
import { 
  X, 
  Compass, 
  Swords, 
  Flame, 
  PlusCircle, 
  BookOpen,
  Sparkles,
  Palette
} from 'lucide-react';

interface NewRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRoomCreated: (newRoom: CourseRoom) => void;
}

export const NewRoomModal: React.FC<NewRoomModalProps> = ({ isOpen, onClose, onRoomCreated }) => {
  const { currentUser } = useAuth();

  const [name, setName] = useState('');
  const [section, setSection] = useState('Kelas A - Semester Ganjil');
  const [subject, setSubject] = useState('Kajian Bahasa & Linguistik');
  const [description, setDescription] = useState('');
  const [scenario, setScenario] = useState<ScenarioType>('expedition');
  const [bannerGradient, setBannerGradient] = useState('from-[#FF5B37] via-[#FF8A65] to-[#FFA726]');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !currentUser) return;

    // Generate random code e.g. EXP890 or CLS404
    const prefix = scenario === 'expedition' ? 'EXP' : scenario === 'clash' ? 'CLS' : 'BUZ';
    const randNum = Math.floor(100 + Math.random() * 900);
    const roomCode = `${prefix}${randNum}`;

    let defaultScenarioData: any = { type: scenario };

    if (scenario === 'expedition') {
      defaultScenarioData.expeditionTopics = [
        {
          id: 'topic_custom_1',
          title: 'Tema 1: Pendekatan Wacana Multimodal Digital',
          description: 'Eksplorasi integrasi visual dan teks pada narasi publik.',
          physicalZone: 'Meja 1 (Zona Depan Kiri)',
          maxQuota: 10,
          offlineQuota: 5,
          onlineQuota: 5,
          selectedMembers: []
        },
        {
          id: 'topic_custom_2',
          title: 'Tema 2: Konstruksi Identitas Budaya Lokal',
          description: 'Analisis pelestarian dialek daerah dalam era komunikasi global.',
          physicalZone: 'Meja 2 (Zona Depan Kanan)',
          maxQuota: 10,
          offlineQuota: 5,
          onlineQuota: 5,
          selectedMembers: []
        },
        {
          id: 'topic_custom_3',
          title: 'Tema 3: Semiotika Konten Media Sosial',
          description: 'Membongkar makna tersembunyi leksikon viral.',
          physicalZone: 'Meja 3 (Zona Tengah)',
          maxQuota: 10,
          offlineQuota: 5,
          onlineQuota: 5,
          selectedMembers: []
        },
        {
          id: 'topic_custom_4',
          title: 'Tema 4: Retorika Argumentatif Debat Kebijakan',
          description: 'Strategi persuasi wacana perundang-undangan.',
          physicalZone: 'Meja 4 (Zona Belakang Kiri)',
          maxQuota: 10,
          offlineQuota: 5,
          onlineQuota: 5,
          selectedMembers: []
        },
        {
          id: 'topic_custom_5',
          title: 'Tema 5: Linguistik Forensik & Verifikasi Ujaran',
          description: 'Metodologi analisis bukti bahasa pada konteks hukum.',
          physicalZone: 'Meja 5 (Zona Belakang Kanan)',
          maxQuota: 10,
          offlineQuota: 5,
          onlineQuota: 5,
          selectedMembers: []
        }
      ];
    } else if (scenario === 'clash') {
      defaultScenarioData.clashTopic = `Debat Kritis: ${name}`;
      defaultScenarioData.clashQuestion = 'Apakah integrasi model ini memberikan peningkatan kualitas akademik yang terukur?';
      defaultScenarioData.clashProMembers = [];
      defaultScenarioData.clashContraMembers = [];
      defaultScenarioData.clashBulletChats = [];
      defaultScenarioData.clashVotes = { pro: 10, contra: 10, userVotes: {} };
    } else {
      defaultScenarioData.buzzMainTheme = name;
      defaultScenarioData.buzzPhase = 'ideation';
      defaultScenarioData.buzzTimeRemaining = 300;
      defaultScenarioData.buzzIsLocked = false;
      defaultScenarioData.buzzStations = [
        { id: 'bz_c1', title: 'Stasiun 1: Formulasi Gagasan Cepat', subProblem: 'Ide terobosan spontan.', members: [] },
        { id: 'bz_c2', title: 'Stasiun 2: Reduksi Hambatan Lapangan', subProblem: 'Identifikasi kendala implementasi.', members: [] },
        { id: 'bz_c3', title: 'Stasiun 3: Optimalisasi Waktu & Sarana', subProblem: 'Efisiensi teknis pembelajaran.', members: [] },
        { id: 'bz_c4', title: 'Stasiun 4: Partisipasi Siswa Inklusif', subProblem: 'Menjangkau siswa pasif & hybrid.', members: [] },
        { id: 'bz_c5', title: 'Stasiun 5: Evaluasi & Metrik Keberhasilan', subProblem: 'Indikator ketercapaian.', members: [] }
      ];
      defaultScenarioData.buzzIdeas = [];
    }

    const created = roomsService.createRoom({
      name: name.trim(),
      section: section.trim(),
      subject: subject.trim(),
      roomCode,
      teacherId: currentUser.uid,
      teacherName: currentUser.displayName,
      description: description.trim() || `Ruang perkuliahan interaktif dengan model diskusi hybrid ${scenario.toUpperCase()}.`,
      bannerGradient,
      discussionScenario: scenario,
      scenarioData: defaultScenarioData
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
                Format Google Classroom dengan Model Diskusi Hybrid
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
          <div>
            <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1.5">
              Nama Mata Kuliah / Ruang Kelas <span className="text-[#FF5B37]">*</span>
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1.5">
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
              <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1.5">
                Bidang Studi / Subjek
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Contoh: Bahasa & Komunikasi"
                className="w-full bg-[#FAF8F5] border border-[#E5DFD5] rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FF5B37]/30"
              />
            </div>
          </div>

          {/* Model Diskusi Selection */}
          <div>
            <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-2">
              Pilih Model Diskusi Interaktif yang Diterapkan:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              
              <button
                type="button"
                onClick={() => setScenario('expedition')}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  scenario === 'expedition'
                    ? 'bg-violet-50 border-violet-400 ring-2 ring-violet-200 text-slate-900'
                    : 'bg-[#FAF8F5] border-[#EFE9E1] text-slate-600 hover:border-slate-300'
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center mb-2">
                  <Compass className="w-4 h-4" />
                </div>
                <h5 className="text-xs sm:text-sm font-bold font-serif-academic mb-0.5">The Expedition</h5>
                <p className="text-[11px] leading-tight text-slate-500">
                  5 Tema, kuota hybrid, meja fisik vs daring.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setScenario('clash')}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  scenario === 'clash'
                    ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-200 text-slate-900'
                    : 'bg-[#FAF8F5] border-[#EFE9E1] text-slate-600 hover:border-slate-300'
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-2">
                  <Swords className="w-4 h-4" />
                </div>
                <h5 className="text-xs sm:text-sm font-bold font-serif-academic mb-0.5">The Clash Arena</h5>
                <p className="text-[11px] leading-tight text-slate-500">
                  Debat Pro vs Kontra, War Room, & voting Sli.do.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setScenario('buzz')}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  scenario === 'buzz'
                    ? 'bg-rose-50 border-rose-400 ring-2 ring-rose-200 text-slate-900'
                    : 'bg-[#FAF8F5] border-[#EFE9E1] text-slate-600 hover:border-slate-300'
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-rose-100 text-[#FF5B37] flex items-center justify-center mb-2">
                  <Flame className="w-4 h-4" />
                </div>
                <h5 className="text-xs sm:text-sm font-bold font-serif-academic mb-0.5">The Buzz Chamber</h5>
                <p className="text-[11px] leading-tight text-slate-500">
                  Blitz 5 menit, audio buzzer & sintesis tim.
                </p>
              </button>

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

          <div>
            <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1.5">
              Deskripsi Kelas (Opsional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Jelaskan silabus singkat atau tujuan capaian pembelajaran..."
              className="w-full bg-[#FAF8F5] border border-[#E5DFD5] rounded-2xl p-3 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FF5B37]/30 resize-none"
            />
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

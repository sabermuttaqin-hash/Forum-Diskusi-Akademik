import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { CourseRoom, ScenarioType } from '../types';
import { roomsService } from '../lib/rooms';
import { 
  X, 
  Compass, 
  Swords, 
  Flame, 
  Sparkles, 
  PlusCircle, 
  Building2, 
  BookOpen,
  Layers
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
  const [bannerGradient, setBannerGradient] = useState('from-violet-950 via-indigo-950 to-slate-950');

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
          maxQuota: 8,
          offlineQuota: 4,
          onlineQuota: 4,
          selectedMembers: []
        },
        {
          id: 'topic_custom_2',
          title: 'Tema 2: Konstruksi Identitas Budaya Lokal',
          description: 'Analisis pelestarian dialek daerah dalam era komunikasi global.',
          physicalZone: 'Meja 2 (Zona Depan Kanan)',
          maxQuota: 8,
          offlineQuota: 4,
          onlineQuota: 4,
          selectedMembers: []
        },
        {
          id: 'topic_custom_3',
          title: 'Tema 3: Semiotika Konten Media Sosial',
          description: 'Membongkar makna tersembunyi leksikon viral.',
          physicalZone: 'Meja 3 (Zona Tengah)',
          maxQuota: 8,
          offlineQuota: 4,
          onlineQuota: 4,
          selectedMembers: []
        },
        {
          id: 'topic_custom_4',
          title: 'Tema 4: Retorika Argumentatif Debat Kebijakan',
          description: 'Strategi persuasi wacana perundang-undangan.',
          physicalZone: 'Meja 4 (Zona Belakang Kiri)',
          maxQuota: 8,
          offlineQuota: 4,
          onlineQuota: 4,
          selectedMembers: []
        },
        {
          id: 'topic_custom_5',
          title: 'Tema 5: Linguistik Forensik & Verifikasi Ujaran',
          description: 'Metodologi analisis bukti bahasa pada konteks hukum.',
          physicalZone: 'Meja 5 (Zona Belakang Kanan)',
          maxQuota: 8,
          offlineQuota: 4,
          onlineQuota: 4,
          selectedMembers: []
        }
      ];
    } else if (scenario === 'clash') {
      defaultScenarioData.clashTopic = `Debat Kritis: ${name}`;
      defaultScenarioData.clashQuestion = 'Apakah strategi ini memberikan dampak positif signifikan bagi efektivitas pembelajaran?';
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
        { id: 'bz_c1', title: 'Stasiun 1: Formulasi Solusi Kreatif', subProblem: 'Ide terobosan spontan.', members: [] },
        { id: 'bz_c2', title: 'Stasiun 2: Reduksi Hambatan Lapangan', subProblem: 'Identifikasi kendala implementasi.', members: [] },
        { id: 'bz_c3', title: 'Stasiun 3: Efisiensi Model Pembelajaran', subProblem: 'Optimalisasi waktu & sarana.', members: [] },
        { id: 'bz_c4', title: 'Stasiun 4: Partisipasi Siswa Inklusif', subProblem: 'Menjangkau siswa pasif.', members: [] },
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
      description: description.trim() || `Ruang perkuliahan interaktif dengan skenario diskusi hybrid ${scenario.toUpperCase()}.`,
      bannerGradient,
      discussionScenario: scenario,
      scenarioData: defaultScenarioData
    });

    onRoomCreated(created);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-[#0B0D19] w-full max-w-xl rounded-3xl shadow-2xl border border-white/10 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-violet-600/20 text-violet-400">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-serif-academic">
                Buat Ruang Kelas Baru (Course Room)
              </h3>
              <p className="text-xs text-slate-400">
                Format Google Classroom dengan Pemodelan Diskusi Hybrid
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
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Nama Mata Kuliah / Ruang Kelas <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Kajian Wacana Kritis & Linguistik Terapan"
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Bagian / Sesi Kelas
              </label>
              <input
                type="text"
                value={section}
                onChange={(e) => setSection(e.target.value)}
                placeholder="Contoh: Kelas A - Semester Ganjil"
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Bidang Studi / Subjek
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Contoh: Bahasa & Komunikasi"
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
          </div>

          {/* Model Diskusi Selection (The 3 Scenarios!) */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Pilih Model Diskusi Interaktif yang Diterapkan:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              
              <button
                type="button"
                onClick={() => setScenario('expedition')}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                  scenario === 'expedition'
                    ? 'bg-violet-950/40 border-violet-500 shadow-md ring-1 ring-violet-500/40 text-white'
                    : 'bg-white/[0.02] border-white/10 text-slate-400 hover:text-white'
                }`}
              >
                <Compass className="w-4 h-4 text-violet-400 mb-1" />
                <h5 className="text-xs font-bold mb-0.5">The Expedition</h5>
                <p className="text-[10px] leading-tight opacity-80">
                  5 Topik, kuota hybrid, meja fisik vs online.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setScenario('clash')}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                  scenario === 'clash'
                    ? 'bg-indigo-950/40 border-indigo-500 shadow-md ring-1 ring-indigo-500/40 text-white'
                    : 'bg-white/[0.02] border-white/10 text-slate-400 hover:text-white'
                }`}
              >
                <Swords className="w-4 h-4 text-indigo-400 mb-1" />
                <h5 className="text-xs font-bold mb-0.5">The Clash Arena</h5>
                <p className="text-[10px] leading-tight opacity-80">
                  Debat Pro vs Kontra, War Room, & voting Sli.do.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setScenario('buzz')}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                  scenario === 'buzz'
                    ? 'bg-cyan-950/40 border-cyan-500 shadow-md ring-1 ring-cyan-500/40 text-white'
                    : 'bg-white/[0.02] border-white/10 text-slate-400 hover:text-white'
                }`}
              >
                <Flame className="w-4 h-4 text-cyan-400 mb-1" />
                <h5 className="text-xs font-bold mb-0.5">The Buzz Chamber</h5>
                <p className="text-[10px] leading-tight opacity-80">
                  Curah ide 5 mnt, buzzer alarm, lock submission.
                </p>
              </button>

            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Deskripsi Kelas & Panduan Umum
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Jelaskan tujuan perkuliahan atau ketentuan bagi mahasiswa..."
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-md transition-all disabled:opacity-40 cursor-pointer"
            >
              Buat Room Kelas
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { CourseRoom, ScenarioType, RoomForum, ExpeditionTopic, BuzzStation } from '../types';
import { roomsService } from '../lib/rooms';
import { 
  X, 
  Compass, 
  Swords, 
  Flame, 
  PlusCircle, 
  Sparkles, 
  Layers, 
  Sliders, 
  Trash2, 
  Plus, 
  HelpCircle 
} from 'lucide-react';

interface CreateForumModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: CourseRoom;
  onForumCreated: (newForum: RoomForum) => void;
}

export const CreateForumModal: React.FC<CreateForumModalProps> = ({
  isOpen,
  onClose,
  room,
  onForumCreated
}) => {
  const { currentUser } = useAuth();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [scenarioType, setScenarioType] = useState<ScenarioType>('expedition');

  // Customization for Expedition
  const [expeditionTopics, setExpeditionTopics] = useState<Array<{
    title: string;
    description: string;
    physicalZone: string;
    maxQuota: number;
    offlineQuota: number;
    onlineQuota: number;
  }>>([
    {
      title: 'Tema 1: Pendekatan Kritis & Analisis Wacana Kontemporer',
      description: 'Menganalisis teks berita, framing politik, dan konstruksi pesan di media massa.',
      physicalZone: 'Meja 1 (Zona Depan Kiri)',
      maxQuota: 8,
      offlineQuota: 4,
      onlineQuota: 4
    },
    {
      title: 'Tema 2: Bahasa Inklusif & Representasi Identitas Sosial',
      description: 'Mengkaji terminologi inklusif dan dekonstruksi stereotip dalam regulasi publik.',
      physicalZone: 'Meja 2 (Zona Depan Kanan)',
      maxQuota: 8,
      offlineQuota: 4,
      onlineQuota: 4
    },
    {
      title: 'Tema 3: Fenomena Alih Kode & Bahasa Komunitas Digital',
      description: 'Dinamika sosiolinguistik penggunaan ragam bahasa santai di ruang virtual.',
      physicalZone: 'Meja 3 (Zona Tengah)',
      maxQuota: 8,
      offlineQuota: 4,
      onlineQuota: 4
    },
    {
      title: 'Tema 4: Retorika Persuasif & Eufemisme Krisis',
      description: 'Strategi pembingkaian bahasa saat mitigasi risiko organisasi.',
      physicalZone: 'Meja 4 (Zona Belakang Kiri)',
      maxQuota: 8,
      offlineQuota: 4,
      onlineQuota: 4
    },
    {
      title: 'Tema 5: Wacana Ekologi & Narasi Krisis Iklim',
      description: 'Analisis semantik greenwashing dan kesadaran lingkungan biosfer.',
      physicalZone: 'Meja 5 (Zona Belakang Kanan)',
      maxQuota: 8,
      offlineQuota: 4,
      onlineQuota: 4
    }
  ]);

  // Customization for Clash Arena
  const [clashTopic, setClashTopic] = useState('Penggunaan AI dalam Pembelajaran Bahasa: Membantu atau Mematikan Kreativitas?');
  const [clashQuestion, setClashQuestion] = useState('Apakah integrasi teknologi AI meningkatkan kompetensi kritis atau menimbulkan ketergantungan kognitif?');

  // Customization for Buzz Chamber
  const [buzzTheme, setBuzzTheme] = useState('Desain Solusi Gamifikasi Inovatif Rendah Kuota untuk Kelas Hybrid');
  const [buzzStations, setBuzzStations] = useState<Array<{ title: string; subProblem: string }>>([
    { title: 'Stasiun 1: Formulasi Ide Terobosan Cepat', subProblem: 'Gagasan radikal apa yang bisa diimplementasikan langsung besok?' },
    { title: 'Stasiun 2: Reduksi Hambatan Kuota & Fasilitas', subProblem: 'Bagaimana membuat materi interaktif berukuran di bawah 1MB?' },
    { title: 'Stasiun 3: Efisiensi Alur Pembelajaran', subProblem: 'Bagaimana memadukan aktivitas siswa di kelas dan di rumah tanpa jeda?' },
    { title: 'Stasiun 4: Partisipasi Aktif & Inklusivitas', subProblem: 'Mekanisme apa yang menjamin siswa pemalu tetap bersuara?' },
    { title: 'Stasiun 5: Evaluasi Cepat & Refleksi Bersama', subProblem: 'Metrik apa yang menunjukkan keberhasilan kolaborasi tim?' }
  ]);

  if (!isOpen) return null;

  // Add / Remove Expedition Topic
  const handleAddExpeditionTopic = () => {
    if (expeditionTopics.length >= 6) return;
    const num = expeditionTopics.length + 1;
    setExpeditionTopics([
      ...expeditionTopics,
      {
        title: `Tema ${num}: Topik Pembahasan Baru`,
        description: 'Jelaskan fokus materi yang akan dibedah oleh kelompok siswa ini.',
        physicalZone: `Meja ${num} (Zona Khusus)`,
        maxQuota: 8,
        offlineQuota: 4,
        onlineQuota: 4
      }
    ]);
  };

  const handleRemoveExpeditionTopic = (index: number) => {
    if (expeditionTopics.length <= 2) return;
    setExpeditionTopics(expeditionTopics.filter((_, i) => i !== index));
  };

  // Add / Remove Buzz Station
  const handleAddBuzzStation = () => {
    if (buzzStations.length >= 6) return;
    const num = buzzStations.length + 1;
    setBuzzStations([
      ...buzzStations,
      {
        title: `Stasiun ${num}: Tantangan Baru`,
        subProblem: 'Rumuskan masalah spesifik yang harus diselesaikan dalam waktu 5 menit.'
      }
    ]);
  };

  const handleRemoveBuzzStation = (index: number) => {
    if (buzzStations.length <= 2) return;
    setBuzzStations(buzzStations.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !currentUser) return;

    let scenarioData: any = { type: scenarioType };

    if (scenarioType === 'expedition') {
      scenarioData.expeditionTopics = expeditionTopics.map((t, idx) => ({
        id: `topic_${Date.now()}_${idx}`,
        title: t.title,
        description: t.description,
        physicalZone: t.physicalZone,
        maxQuota: Number(t.maxQuota) || 8,
        offlineQuota: Number(t.offlineQuota) || 4,
        onlineQuota: Number(t.onlineQuota) || 4,
        selectedMembers: [],
        studyGuide: `Panduan Belajar untuk ${t.title}. Silakan lakukan eksplorasi bersama rekan meja fisik dan tim daring.`,
        learningObjectives: [
          `Mengidentifikasi konsep esensial dari ${t.title}.`,
          'Menganalisis studi kasus terkait di lapangan.',
          'Menyusun kesimpulan bersama dalam bentuk lembar kerja tim.'
        ],
        subTopics: [
          '1. Konsep Dasar & Kerangka Teoretis',
          '2. Studi Kasus Nyata & Bukti Empiris',
          '3. Sintesis & Rekomendasi Solusi'
        ],
        discussionPrompts: [
          `Apa tantangan terbesar dalam membedah topik ${t.title}?`,
          'Bagaimana menyelaraskan perspektif siswa di kelas dan siswa online?'
        ]
      }));
    } else if (scenarioType === 'clash') {
      scenarioData.clashTopic = clashTopic.trim();
      scenarioData.clashQuestion = clashQuestion.trim();
      scenarioData.clashProMembers = [];
      scenarioData.clashContraMembers = [];
      scenarioData.clashBulletChats = [];
      scenarioData.clashVotes = { pro: 10, contra: 10, userVotes: {} };
      scenarioData.clashRound = 1;
    } else {
      scenarioData.buzzMainTheme = buzzTheme.trim();
      scenarioData.buzzPhase = 'ideation';
      scenarioData.buzzTimeRemaining = 300;
      scenarioData.buzzIsLocked = false;
      scenarioData.buzzStations = buzzStations.map((s, idx) => ({
        id: `bz_st_${Date.now()}_${idx}`,
        title: s.title,
        subProblem: s.subProblem,
        members: []
      }));
      scenarioData.buzzIdeas = [];
    }

    const createdForum = roomsService.createForum(room.id, {
      roomId: room.id,
      title: title.trim(),
      description: description.trim() || `Sesi forum diskusi menggunakan model ${scenarioType.toUpperCase()}.`,
      scenarioType,
      scenarioData,
      authorId: currentUser.uid,
      authorName: currentUser.displayName,
      isActive: true,
      targetObjective: `Meningkatkan partisipasi aktif murid lewat model ${scenarioType}.`
    });

    onForumCreated(createdForum);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-[#EFE9E1] overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#EFE9E1] bg-[#FAF8F5] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#FFEDE7] text-[#FF5B37]">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 font-serif-academic">
                Buat Forum Diskusi Baru di Room Ini
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Ruang Kelas: <span className="font-bold text-slate-800">{room.name}</span> ({room.jenjang || 'Akademik'})
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
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Forum Title & Description */}
          <div>
            <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1.5">
              Judul Forum Diskusi <span className="text-[#FF5B37]">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Sesi 2: Pemilihan Topik Riset Wacana Media"
              className="w-full bg-[#FAF8F5] border border-[#E5DFD5] rounded-2xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FF5B37]/30 focus:border-[#FF5B37]"
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1.5">
              Deskripsi & Instruksi Diskusi
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Jelaskan instruksi atau aturan bagi siswa dalam forum diskusi ini..."
              className="w-full bg-[#FAF8F5] border border-[#E5DFD5] rounded-2xl p-3 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FF5B37]/30 resize-none"
            />
          </div>

          {/* Model Selection */}
          <div>
            <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-2">
              Pilih Model Diskusi untuk Forum Ini:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              
              <button
                type="button"
                onClick={() => setScenarioType('expedition')}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  scenarioType === 'expedition'
                    ? 'bg-violet-50 border-violet-400 ring-2 ring-violet-200 text-slate-900 shadow-sm'
                    : 'bg-[#FAF8F5] border-[#EFE9E1] text-slate-600 hover:border-slate-300'
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center mb-2">
                  <Compass className="w-4 h-4" />
                </div>
                <h5 className="text-xs sm:text-sm font-bold font-serif-academic mb-0.5">The Expedition</h5>
                <p className="text-[11px] leading-tight text-slate-500">
                  Pemilihan tema topik hybrid, kuota meja fisik vs online.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setScenarioType('clash')}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  scenarioType === 'clash'
                    ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-200 text-slate-900 shadow-sm'
                    : 'bg-[#FAF8F5] border-[#EFE9E1] text-slate-600 hover:border-slate-300'
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-2">
                  <Swords className="w-4 h-4" />
                </div>
                <h5 className="text-xs sm:text-sm font-bold font-serif-academic mb-0.5">The Clash Arena</h5>
                <p className="text-[11px] leading-tight text-slate-500">
                  Debat Pro vs Kontra, War Room daring & voting interaktif.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setScenarioType('buzz')}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  scenarioType === 'buzz'
                    ? 'bg-rose-50 border-rose-400 ring-2 ring-rose-200 text-slate-900 shadow-sm'
                    : 'bg-[#FAF8F5] border-[#EFE9E1] text-slate-600 hover:border-slate-300'
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-rose-100 text-[#FF5B37] flex items-center justify-center mb-2">
                  <Flame className="w-4 h-4" />
                </div>
                <h5 className="text-xs sm:text-sm font-bold font-serif-academic mb-0.5">The Buzz Chamber</h5>
                <p className="text-[11px] leading-tight text-slate-500">
                  Blitz curah ide kilat 5 menit, audio buzzer & sintesis.
                </p>
              </button>

            </div>
          </div>

          {/* Model Theme Customization Form */}
          <div className="bg-[#FAF8F5] p-4 sm:p-5 rounded-3xl border border-[#EAE3D9] space-y-4">
            
            {/* Customization for Expedition */}
            {scenarioType === 'expedition' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs sm:text-sm font-black text-slate-900 font-serif-academic flex items-center gap-1.5">
                      <Compass className="w-4 h-4 text-violet-600" />
                      <span>Sesuaikan Tema & Kuota Meja Pembahasan</span>
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Tentukan topik teks atau materi yang dapat dipilih oleh murid (dapat ditambah/diedit).
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddExpeditionTopic}
                    disabled={expeditionTopics.length >= 6}
                    className="px-3 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs flex items-center gap-1 transition-all disabled:opacity-40 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Tema</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {expeditionTopics.map((topic, idx) => (
                    <div key={idx} className="bg-white p-3.5 rounded-2xl border border-[#E5DFD5] shadow-xs space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-black text-violet-700 bg-violet-50 px-2.5 py-1 rounded-lg">
                          Jalur #{idx + 1}
                        </span>
                        {expeditionTopics.length > 2 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveExpeditionTopic(idx)}
                            className="p-1 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                            title="Hapus tema ini"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <div>
                        <input
                          type="text"
                          required
                          value={topic.title}
                          onChange={(e) => {
                            const updated = [...expeditionTopics];
                            updated[idx].title = e.target.value;
                            setExpeditionTopics(updated);
                          }}
                          placeholder={`Judul Tema ${idx + 1}`}
                          className="w-full bg-[#FAF8F5] border border-[#EFE9E1] rounded-xl px-3 py-1.5 text-xs sm:text-sm font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-violet-400"
                        />
                      </div>

                      <div>
                        <textarea
                          rows={1}
                          value={topic.description}
                          onChange={(e) => {
                            const updated = [...expeditionTopics];
                            updated[idx].description = e.target.value;
                            setExpeditionTopics(updated);
                          }}
                          placeholder="Deskripsi materi / isu yang dibahas kelompok ini..."
                          className="w-full bg-[#FAF8F5] border border-[#EFE9E1] rounded-xl px-3 py-1.5 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-violet-400 resize-none"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 border-t border-[#F2ECE4]">
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Zona Fisik / Meja</label>
                          <input
                            type="text"
                            value={topic.physicalZone}
                            onChange={(e) => {
                              const updated = [...expeditionTopics];
                              updated[idx].physicalZone = e.target.value;
                              setExpeditionTopics(updated);
                            }}
                            className="w-full bg-[#FAF8F5] border border-[#EFE9E1] rounded-lg px-2.5 py-1 text-xs text-slate-800"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Kuota Offline (Kelas)</label>
                          <input
                            type="number"
                            min={1}
                            max={30}
                            value={topic.offlineQuota}
                            onChange={(e) => {
                              const updated = [...expeditionTopics];
                              const val = Math.max(1, parseInt(e.target.value) || 1);
                              updated[idx].offlineQuota = val;
                              updated[idx].maxQuota = val + updated[idx].onlineQuota;
                              setExpeditionTopics(updated);
                            }}
                            className="w-full bg-[#FAF8F5] border border-[#EFE9E1] rounded-lg px-2.5 py-1 text-xs text-slate-800"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Kuota Online (Rumah)</label>
                          <input
                            type="number"
                            min={1}
                            max={30}
                            value={topic.onlineQuota}
                            onChange={(e) => {
                              const updated = [...expeditionTopics];
                              const val = Math.max(1, parseInt(e.target.value) || 1);
                              updated[idx].onlineQuota = val;
                              updated[idx].maxQuota = updated[idx].offlineQuota + val;
                              setExpeditionTopics(updated);
                            }}
                            className="w-full bg-[#FAF8F5] border border-[#EFE9E1] rounded-lg px-2.5 py-1 text-xs text-slate-800"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Customization for Clash Arena */}
            {scenarioType === 'clash' && (
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs sm:text-sm font-black text-slate-900 font-serif-academic flex items-center gap-1.5 mb-1">
                    <Swords className="w-4 h-4 text-amber-600" />
                    <span>Topik Mosi Debat Kontroversial</span>
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Siswa akan memilih kubu Pro atau Kontra, lalu bertanding argumen melalui War Room dan podium kelas.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mosi Debat Utama <span className="text-amber-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={clashTopic}
                    onChange={(e) => setClashTopic(e.target.value)}
                    placeholder="Contoh: Penggunaan Bahasa Asing dalam Ruang Publik Menurunkan Jiwa Nasionalisme"
                    className="w-full bg-white border border-[#E5DFD5] rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Pertanyaan Pemantik Argumen
                  </label>
                  <textarea
                    rows={2}
                    value={clashQuestion}
                    onChange={(e) => setClashQuestion(e.target.value)}
                    placeholder="Contoh: Sejauh mana regulasi bahasa harus membatasi ekspresi komunikasi modern?"
                    className="w-full bg-white border border-[#E5DFD5] rounded-2xl p-3 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200">
                    <div className="text-xs font-black text-emerald-800 mb-0.5">Kubu Pro (Pendukung)</div>
                    <div className="text-[11px] text-emerald-700">Menyusun riset data empiris pendukung mosi.</div>
                  </div>
                  <div className="p-3 rounded-2xl bg-rose-50/70 border border-rose-200">
                    <div className="text-xs font-black text-rose-800 mb-0.5">Kubu Kontra (Penentang)</div>
                    <div className="text-[11px] text-rose-700">Mempersiapkan sanggahan kritis dan studi tandingan.</div>
                  </div>
                </div>
              </div>
            )}

            {/* Customization for Buzz Chamber */}
            {scenarioType === 'buzz' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs sm:text-sm font-black text-slate-900 font-serif-academic flex items-center gap-1.5 mb-1">
                      <Flame className="w-4 h-4 text-[#FF5B37]" />
                      <span>Masalah Utama & Stasiun Tantangan Buzz</span>
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Diskusi kilat 5 menit curah gagasan di stasiun tantangan terpisah.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddBuzzStation}
                    disabled={buzzStations.length >= 6}
                    className="px-3 py-1.5 rounded-xl bg-[#FF5B37] hover:bg-[#E84E2C] text-white font-bold text-xs flex items-center gap-1 transition-all disabled:opacity-40 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Stasiun</span>
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tema Sentral Masalah <span className="text-[#FF5B37]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={buzzTheme}
                    onChange={(e) => setBuzzTheme(e.target.value)}
                    placeholder="Contoh: Strategi Efektif Mengatasi Krisis Membaca Siswa di Era Reels & TikTok"
                    className="w-full bg-white border border-[#E5DFD5] rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FF5B37]/30"
                  />
                </div>

                <div className="space-y-2.5">
                  {buzzStations.map((st, idx) => (
                    <div key={idx} className="bg-white p-3 rounded-2xl border border-[#E5DFD5] space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">
                          Stasiun #{idx + 1}
                        </span>
                        {buzzStations.length > 2 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveBuzzStation(idx)}
                            className="p-1 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <input
                        type="text"
                        value={st.title}
                        onChange={(e) => {
                          const updated = [...buzzStations];
                          updated[idx].title = e.target.value;
                          setBuzzStations(updated);
                        }}
                        className="w-full bg-[#FAF8F5] border border-[#EFE9E1] rounded-xl px-3 py-1 text-xs font-bold text-slate-800"
                        placeholder="Judul Stasiun"
                      />
                      <input
                        type="text"
                        value={st.subProblem}
                        onChange={(e) => {
                          const updated = [...buzzStations];
                          updated[idx].subProblem = e.target.value;
                          setBuzzStations(updated);
                        }}
                        className="w-full bg-[#FAF8F5] border border-[#EFE9E1] rounded-xl px-3 py-1 text-xs text-slate-700"
                        placeholder="Sub-pertanyaan tantangan di stasiun ini..."
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

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
              disabled={!title.trim()}
              className="px-6 py-2.5 rounded-2xl bg-[#FF5B37] hover:bg-[#E84E2C] text-white font-bold text-xs sm:text-sm shadow-md shadow-[#FF5B37]/25 transition-all disabled:opacity-50 cursor-pointer"
            >
              Buat Forum Diskusi
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

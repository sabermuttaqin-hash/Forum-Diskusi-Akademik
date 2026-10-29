import React, { useState } from 'react';
import { academicApi, AICritiqueResult, AICitationsResult, AIRefineResult, AITitleSuggestionsResult } from '../lib/api';
import { 
  X, 
  Sparkles, 
  BookOpen, 
  CheckCircle2, 
  Copy, 
  Check, 
  FileCheck, 
  MessageSquare, 
  Compass, 
  Send,
  HelpCircle,
  Lightbulb,
  Award
} from 'lucide-react';

interface AISuiteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AISuiteModal: React.FC<AISuiteModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'peerReview' | 'citations' | 'refine' | 'titles' | 'consult'>('peerReview');

  // Peer review tab state
  const [prTitle, setPrTitle] = useState('');
  const [prContent, setPrContent] = useState('');
  const [prHypothesis, setPrHypothesis] = useState('');
  const [prLoading, setPrLoading] = useState(false);
  const [prResult, setPrResult] = useState<AICritiqueResult | null>(null);

  // Citations tab state
  const [citTopic, setCitTopic] = useState('');
  const [citKeywords, setCitKeywords] = useState('');
  const [citLoading, setCitLoading] = useState(false);
  const [citResult, setCitResult] = useState<AICitationsResult | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Tone refiner state
  const [refineText, setRefineText] = useState('');
  const [refineTarget, setRefineTarget] = useState('Formal Publikasi Jurnal / Tesis');
  const [refineLoading, setRefineLoading] = useState(false);
  const [refineResult, setRefineResult] = useState<AIRefineResult | null>(null);

  // Title generator state
  const [titleField, setTitleField] = useState('Ilmu Komputer & Sistem Informasi');
  const [titleProblem, setTitleProblem] = useState('');
  const [titleLoading, setTitleLoading] = useState(false);
  const [titleResult, setTitleResult] = useState<AITitleSuggestionsResult | null>(null);

  // Consult state
  const [consultQuery, setConsultQuery] = useState('');
  const [consultLoading, setConsultLoading] = useState(false);
  const [consultHistory, setConsultHistory] = useState<Array<{ sender: 'user' | 'ai'; text: string }>>([
    {
      sender: 'ai',
      text: 'Salam ilmiah! Saya Prof. Arga, asisten kecerdasan buatan untuk metodologi riset dan penulisan akademik. Ada kendala dalam pemilihan uji statistik, desain sampling, atau kerangka berpikir teoretis yang ingin Anda diskusikan?',
    },
  ]);

  if (!isOpen) return null;

  const handleRunPeerReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prContent.trim()) return;
    setPrLoading(true);
    try {
      const res = await academicApi.critiqueArgument(prTitle, prContent, prHypothesis);
      setPrResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setPrLoading(false);
    }
  };

  const handleRunCitations = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!citTopic.trim()) return;
    setCitLoading(true);
    try {
      const kw = citKeywords.split(',').map((k) => k.trim()).filter(Boolean);
      const res = await academicApi.getCitations(citTopic, kw);
      setCitResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setCitLoading(false);
    }
  };

  const handleRunRefine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refineText.trim()) return;
    setRefineLoading(true);
    try {
      const res = await academicApi.refineAcademicTone(refineText, refineTarget);
      setRefineResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setRefineLoading(false);
    }
  };

  const handleRunTitles = async (e: React.FormEvent) => {
    e.preventDefault();
    setTitleLoading(true);
    try {
      const res = await academicApi.suggestTitles(titleField, titleProblem);
      setTitleResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setTitleLoading(false);
    }
  };

  const handleSendConsult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consultQuery.trim() || consultLoading) return;
    const q = consultQuery.trim();
    setConsultQuery('');
    setConsultHistory((prev) => [...prev, { sender: 'user', text: q }]);
    setConsultLoading(true);
    try {
      const res = await academicApi.consultAssistant(q);
      setConsultHistory((prev) => [...prev, { sender: 'ai', text: res.reply }]);
    } catch (err) {
      setConsultHistory((prev) => [
        ...prev,
        { sender: 'ai', text: 'Maaf, terjadi kendala saat memproses jawaban. Silakan ulangi.' },
      ]);
    } finally {
      setConsultLoading(false);
    }
  };

  const copyText = (txt: string, id: string) => {
    navigator.clipboard.writeText(txt);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-600/30 text-indigo-400 border border-indigo-500/30">
              <Sparkles className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-serif-academic">
                Pusat Studi AI Akademik (Gemini Server-Side)
              </h3>
              <p className="text-xs text-slate-400">
                Instrumen bantu telaah metodologis, sitasi jurnal, dan polesan publikasi ilmiah
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 overflow-x-auto text-xs font-semibold">
          {[
            { id: 'peerReview', label: 'Peer Reviewer AI', icon: FileCheck },
            { id: 'citations', label: 'Asisten Sitasi (APA/IEEE)', icon: BookOpen },
            { id: 'refine', label: 'Poles Bahasa Ilmiah', icon: Sparkles },
            { id: 'titles', label: 'Ide Judul Skripsi / Tesis', icon: Lightbulb },
            { id: 'consult', label: 'Konsultasi Riset (Prof. Arga)', icon: MessageSquare },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3 px-4 flex items-center gap-2 border-b-2 whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'border-indigo-600 text-indigo-600 bg-white font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">

          {/* TAB 1: PEER REVIEWER */}
          {activeTab === 'peerReview' && (
            <div className="space-y-5">
              <div>
                <h4 className="text-sm font-bold text-slate-800 mb-1">
                  Uji Argumen & Telaah Sejawat (Simulasi Reviewer Jurnal)
                </h4>
                <p className="text-xs text-slate-500">
                  Uji naskah abstrak atau proposal Anda untuk menemukan celah metodologi, bias, dan rekomendasi teori tandingan.
                </p>
              </div>

              <form onSubmit={handleRunPeerReview} className="space-y-3">
                <input
                  type="text"
                  value={prTitle}
                  onChange={(e) => setPrTitle(e.target.value)}
                  placeholder="Judul Penelitian / Judul Naskah..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2 px-3 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />

                <input
                  type="text"
                  value={prHypothesis}
                  onChange={(e) => setPrHypothesis(e.target.value)}
                  placeholder="Hipotesis Utama atau Premis Ilmiah (Opsional)..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2 px-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 italic"
                />

                <textarea
                  rows={4}
                  required
                  value={prContent}
                  onChange={(e) => setPrContent(e.target.value)}
                  placeholder="Masukkan ringkasan abstrak, metode yang digunakan, atau uraian argumentasi penelitian..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />

                <button
                  type="submit"
                  disabled={prLoading || !prContent.trim()}
                  className="py-2.5 px-5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs rounded-xl shadow-md flex items-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {prLoading ? (
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <FileCheck className="w-4 h-4" />
                      <span>Jalankan Peer Review AI</span>
                    </>
                  )}
                </button>
              </form>

              {prResult && (
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4 animate-in fade-in">
                  <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200">
                    <div>
                      <span className="text-xs text-slate-500">Skor Ketajaman Ilmiah:</span>
                      <div className="text-2xl font-bold text-indigo-700">{prResult.overallScore}/100</div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-slate-500">Rekomendasi Reviewer:</span>
                      <div className="text-xs font-bold text-slate-800">{prResult.recommendation}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-slate-200">
                      <h5 className="font-bold text-emerald-700 text-xs mb-2">Kekuatan Naskah:</h5>
                      <ul className="list-disc list-inside space-y-1 text-xs text-slate-700">
                        {prResult.strengths?.map((s, idx) => (
                          <li key={idx}>{s}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-slate-200">
                      <h5 className="font-bold text-rose-700 text-xs mb-2">Celah / Kritik Metodologis:</h5>
                      <ul className="list-disc list-inside space-y-1 text-xs text-slate-700">
                        {prResult.critiques?.map((c, idx) => (
                          <li key={idx}>{c}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {prResult.recommendedTheories && (
                    <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-xs">
                      <span className="font-bold text-slate-800">Rekomendasi Kerangka Teori Tambahan:</span>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {prResult.recommendedTheories.map((t, i) => (
                          <span key={i} className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-800 border border-indigo-200 font-medium">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CITATIONS & LITERATURE */}
          {activeTab === 'citations' && (
            <div className="space-y-5">
              <div>
                <h4 className="text-sm font-bold text-slate-800 mb-1">
                  Pencari Sitasi Standar APA 7th, IEEE, & Chicago
                </h4>
                <p className="text-xs text-slate-500">
                  Temukan paper rujukan seminal dan format sitasi instan untuk penulisan skripsi, tesis, dan jurnal.
                </p>
              </div>

              <form onSubmit={handleRunCitations} className="space-y-3">
                <input
                  type="text"
                  required
                  value={citTopic}
                  onChange={(e) => setCitTopic(e.target.value)}
                  placeholder="Topik Riset (contoh: Adopsi Machine Learning dalam Diagnostik Medis)..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2 px-3 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />

                <input
                  type="text"
                  value={citKeywords}
                  onChange={(e) => setCitKeywords(e.target.value)}
                  placeholder="Kata Kunci Utama (pisahkan dengan koma: Deep Learning, CNN, Healthcare Ethics)..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2 px-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />

                <button
                  type="submit"
                  disabled={citLoading || !citTopic.trim()}
                  className="py-2.5 px-5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs rounded-xl shadow-md flex items-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {citLoading ? (
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <BookOpen className="w-4 h-4" />
                      <span>Cari Literatur & Buat Sitasi</span>
                    </>
                  )}
                </button>
              </form>

              {citResult && (
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4 animate-in fade-in">
                  <h5 className="font-bold text-xs text-slate-800">
                    Format Sitasi Siap Salin:
                  </h5>

                  <div className="space-y-3">
                    {citResult.sampleCitations?.map((item, idx) => (
                      <div key={idx} className="bg-white p-3.5 rounded-xl border border-slate-200 flex items-start justify-between gap-3">
                        <div>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase">
                            {item.format}
                          </span>
                          <p className="font-mono text-xs text-slate-800 mt-1.5 leading-relaxed">
                            {item.citation}
                          </p>
                          <p className="text-[11px] text-slate-500 mt-1 italic">
                            Relevansi: {item.notes}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => copyText(item.citation, `cit_tab_${idx}`)}
                          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all shrink-0 cursor-pointer"
                          title="Salin Sitasi"
                        >
                          {copiedId === `cit_tab_${idx}` ? (
                            <Check className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>

                  {citResult.searchStrategies && (
                    <div className="bg-white p-3 rounded-xl border border-slate-200 text-xs">
                      <span className="font-bold text-slate-800">Query Pencarian Scopus & Google Scholar Rekomendasi:</span>
                      <ul className="list-disc list-inside space-y-1 mt-1 text-slate-600">
                        {citResult.searchStrategies.map((q, i) => (
                          <li key={i} className="font-mono">{q}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: TONE REFINER */}
          {activeTab === 'refine' && (
            <div className="space-y-5">
              <div>
                <h4 className="text-sm font-bold text-slate-800 mb-1">
                  Pemoles Bahasa Ilmiah (Scholarly Tone Enhancer)
                </h4>
                <p className="text-xs text-slate-500">
                  Ubah draf kalimat informal atau terjemahan kaku menjadi terminologi ilmiah baku berwibawa.
                </p>
              </div>

              <form onSubmit={handleRunRefine} className="space-y-3">
                <textarea
                  rows={4}
                  required
                  value={refineText}
                  onChange={(e) => setRefineText(e.target.value)}
                  placeholder="Ketik kalimat atau paragraf Anda di sini untuk disempurnakan..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-600 font-semibold">Gaya Target:</span>
                    <select
                      value={refineTarget}
                      onChange={(e) => setRefineTarget(e.target.value)}
                      className="bg-slate-50 border border-slate-300 rounded-xl py-1 px-2.5 text-xs text-slate-800"
                    >
                      <option value="Formal Publikasi Jurnal / Tesis">Formal Publikasi Jurnal (Bahasa Indonesia)</option>
                      <option value="International Peer-Reviewed Academic English">International Academic English (Q1/Q2)</option>
                      <option value="Kerangka Teori & Epistemologi">Kerangka Teori & Epistemologi</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={refineLoading || !refineText.trim()}
                    className="py-2 px-5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs rounded-xl shadow-md flex items-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {refineLoading ? (
                      <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Poles Kalimat Ilmiah</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

              {refineResult && (
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">Hasil Narasi Akademis:</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-semibold">
                      {refineResult.readabilityLevel}
                    </span>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-slate-200 relative group">
                    <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-serif-academic">
                      {refineResult.refinedText}
                    </p>
                    <button
                      type="button"
                      onClick={() => copyText(refineResult.refinedText, 'refine_out')}
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer transition-all"
                      title="Salin hasil polesan"
                    >
                      {copiedId === 'refine_out' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>

                  {refineResult.changes && refineResult.changes.length > 0 && (
                    <div className="text-xs text-slate-600">
                      <span className="font-semibold text-slate-800 block mb-1">Perbaikan yang Dilakukan:</span>
                      <ul className="list-disc list-inside space-y-0.5">
                        {refineResult.changes.map((c, i) => (
                          <li key={i}>{c}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: TITLES GENERATOR */}
          {activeTab === 'titles' && (
            <div className="space-y-5">
              <div>
                <h4 className="text-sm font-bold text-slate-800 mb-1">
                  Generator Ide Judul Skripsi & Tesis Bernilai Novelty Tinggi
                </h4>
                <p className="text-xs text-slate-500">
                  Dapatkan 5 proposal judul riset lengkap dengan penentuan metodologi dan variabel penelitian.
                </p>
              </div>

              <form onSubmit={handleRunTitles} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Bidang Ilmu / Program Studi
                    </label>
                    <input
                      type="text"
                      required
                      value={titleField}
                      onChange={(e) => setTitleField(e.target.value)}
                      placeholder="Contoh: Manajemen Keuangan / Teknik Informatika..."
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Fokus Fenomena Masalah
                    </label>
                    <input
                      type="text"
                      value={titleProblem}
                      onChange={(e) => setTitleProblem(e.target.value)}
                      placeholder="Contoh: Penurunan kepatuhan pajak UMKM digital..."
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={titleLoading || !titleField.trim()}
                  className="py-2.5 px-5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs rounded-xl shadow-md flex items-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {titleLoading ? (
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Lightbulb className="w-4 h-4" />
                      <span>Hasilkan Rekomendasi Judul Riset</span>
                    </>
                  )}
                </button>
              </form>

              {titleResult && (
                <div className="space-y-3 animate-in fade-in">
                  {titleResult.titles?.map((t, idx) => (
                    <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <div className="flex items-start justify-between gap-3 mb-1.5">
                        <h5 className="font-bold text-slate-900 text-xs sm:text-sm font-serif-academic">
                          {idx + 1}. {t.title}
                        </h5>
                        <button
                          type="button"
                          onClick={() => copyText(t.title, `title_${idx}`)}
                          className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 cursor-pointer transition-all shrink-0"
                          title="Salin judul"
                        >
                          {copiedId === `title_${idx}` ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs mt-2">
                        <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                          <span className="font-semibold text-indigo-700 block text-[11px]">Metodologi:</span>
                          <span className="text-slate-700">{t.methodology}</span>
                        </div>
                        <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                          <span className="font-semibold text-emerald-700 block text-[11px]">Urgensi / Novelty:</span>
                          <span className="text-slate-700">{t.significance}</span>
                        </div>
                      </div>

                      {t.variables && t.variables.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1 text-[11px]">
                          {t.variables.map((v, i) => (
                            <span key={i} className="px-2 py-0.5 rounded bg-slate-200/80 text-slate-700 font-mono">
                              {v}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: METHODOLOGY CHAT CONSULTATION */}
          {activeTab === 'consult' && (
            <div className="flex flex-col h-[460px]">
              <div className="flex-1 overflow-y-auto space-y-3 p-3 bg-slate-50 rounded-2xl border border-slate-200 mb-3">
                {consultHistory.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex items-start gap-2.5 ${
                      msg.sender === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {msg.sender === 'ai' && (
                      <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                        PA
                      </div>
                    )}
                    <div
                      className={`max-w-[85%] sm:max-w-[75%] p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-indigo-600 text-white rounded-tr-none'
                          : 'bg-white text-slate-800 rounded-tl-none border border-slate-200 shadow-xs'
                      }`}
                    >
                      <p className="whitespace-pre-line">{msg.text}</p>
                    </div>
                  </div>
                ))}
                {consultLoading && (
                  <div className="flex items-center gap-2 text-xs text-slate-400 p-2">
                    <div className="w-3.5 h-3.5 border-2 border-indigo-400/40 border-t-indigo-600 rounded-full animate-spin" />
                    <span>Prof. Arga sedang menelaah rujukan...</span>
                  </div>
                )}
              </div>

              <form onSubmit={handleSendConsult} className="flex gap-2">
                <input
                  type="text"
                  value={consultQuery}
                  onChange={(e) => setConsultQuery(e.target.value)}
                  placeholder="Ajukan pertanyaan metodologis (e.g. beda ANOVA vs ANCOVA, teknik purposive sampling)..."
                  className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-4 py-2 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                />
                <button
                  type="submit"
                  disabled={consultLoading || !consultQuery.trim()}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span className="hidden sm:inline">Kirim</span>
                </button>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

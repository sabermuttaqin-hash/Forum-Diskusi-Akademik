import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ACADEMIC_CATEGORIES } from '../lib/discussions';
import { academicApi } from '../lib/api';
import { 
  X, 
  PlusCircle, 
  Sparkles, 
  HelpCircle, 
  FileText, 
  Tag, 
  Send,
  AlertCircle
} from 'lucide-react';

interface NewDiscussionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    content: string;
    category: string;
    hypothesis?: string;
    tags: string[];
  }) => Promise<void>;
}

export const NewDiscussionModal: React.FC<NewDiscussionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const { currentUser } = useAuth();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(ACADEMIC_CATEGORIES[1].name);
  const [hypothesis, setHypothesis] = useState('');
  const [content, setContent] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isPolishing, setIsPolishing] = useState(false);
  const [polishMessage, setPolishMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePolishWithAI = async () => {
    if (!content.trim() && !title.trim()) return;
    setIsPolishing(true);
    setPolishMessage(null);
    try {
      if (content.trim()) {
        const res = await academicApi.refineAcademicTone(content);
        if (res.refinedText) {
          setContent(res.refinedText);
          setPolishMessage('Konten berhasil dipoles dengan ragam bahasa ilmiah formal.');
        }
      }
    } catch (e: any) {
      console.warn('Refine notice:', e);
    } finally {
      setIsPolishing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setSubmitting(true);
    try {
      const parsedTags = tagsInput
        .split(',')
        .map((t) => t.trim().replace(/^#/, ''))
        .filter(Boolean);

      await onSubmit({
        title: title.trim(),
        content: content.trim(),
        category,
        hypothesis: hypothesis.trim() || undefined,
        tags: parsedTags.length > 0 ? parsedTags : ['Akademik', category.replace(/\s+/g, '')],
      });

      setTitle('');
      setContent('');
      setHypothesis('');
      setTagsInput('');
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-600/10 text-indigo-700">
              <PlusCircle className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Mulai Diskusi Akademik Baru
              </h3>
              <p className="text-xs text-slate-500">
                Publikasikan inquiry ilmiah, premis teori, atau telaah metodologis
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {polishMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{polishMessage}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Judul Riset / Masalah Pokok <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Analisis Validitas Konstruk Model Pengukuran SEM-PLS pada Sampel Terbatas..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2 px-3 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            />
          </div>

          {/* Category Dropdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Kategori Bidang Kajian <span className="text-rose-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              >
                {ACADEMIC_CATEGORIES.filter((c) => c.id !== 'all').map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Author Attribution */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Pengirim & Afiliasi
              </label>
              <div className="py-2 px-3 bg-slate-100 rounded-xl text-xs text-slate-700 font-medium truncate border border-slate-200">
                {currentUser?.displayName} ({currentUser?.institution})
              </div>
            </div>
          </div>

          {/* Hypothesis / Research Premise */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
                Premis Teori / Hipotesis Kerja (Opsional)
              </span>
              <span className="text-[10px] text-slate-400 font-normal">
                Membantu reviewer memahami arah argumen
              </span>
            </label>
            <input
              type="text"
              value={hypothesis}
              onChange={(e) => setHypothesis(e.target.value)}
              placeholder="Contoh: Hipotesis: Variabel mediasi memperkuat pengaruh variabel laten secara signifikan..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2 px-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white italic"
            />
          </div>

          {/* Main Discussion Content */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-800">
                Deskripsi Lengkap Masalah & Latar Belakang Ilmiah <span className="text-rose-500">*</span>
              </label>

              {/* AI Polish Button */}
              <button
                type="button"
                onClick={handlePolishWithAI}
                disabled={isPolishing || !content.trim()}
                className="text-xs inline-flex items-center gap-1 text-indigo-700 hover:text-indigo-800 font-medium px-2 py-0.5 rounded-lg hover:bg-indigo-50 transition-all disabled:opacity-40 cursor-pointer"
                title="Sempurnakan narasi dengan terminologi akademik"
              >
                <Sparkles className="w-3 h-3 text-indigo-600" />
                <span>{isPolishing ? 'Sedang Memoles...' : 'Poles Bahasa Ilmiah (AI)'}</span>
              </button>
            </div>

            <textarea
              rows={6}
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Uraikan konteks penelitian, landasan teori yang digunakan, dilema metodologis atau analisis data yang dihadapi, serta pertanyaan inti untuk para akademisi..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white leading-relaxed"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-slate-500" />
              Kata Kunci / Tagar (Pisahkan dengan koma)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="Contoh: SEM, Kuantitatif, Metodologi, Skripsi, SPSS"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2 px-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-4 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting || !title.trim() || !content.trim()}
              className="py-2 px-5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer"
            >
              {submitting ? (
                <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Publikasikan ke Forum</span>
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

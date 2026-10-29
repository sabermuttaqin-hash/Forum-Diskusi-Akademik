import React, { useEffect, useState } from 'react';
import { Discussion, Reply } from '../types';
import { useAuth } from '../context/AuthContext';
import { discussionsService } from '../lib/discussions';
import { academicApi, AISummaryResult, AICritiqueResult, AICitationsResult } from '../lib/api';
import { 
  X, 
  Send, 
  Sparkles, 
  CheckCircle2, 
  Award, 
  Building2, 
  BookOpen, 
  ThumbsUp, 
  Tag, 
  AlertCircle,
  HelpCircle,
  FileText,
  Quote,
  ShieldCheck,
  Check,
  Copy
} from 'lucide-react';

interface DiscussionDetailModalProps {
  discussion: Discussion;
  onClose: () => void;
  onLike: (d: Discussion) => void;
}

export const DiscussionDetailModal: React.FC<DiscussionDetailModalProps> = ({
  discussion,
  onClose,
  onLike,
}) => {
  const { currentUser } = useAuth();
  const [replies, setReplies] = useState<Reply[]>([]);
  const [newReplyContent, setNewReplyContent] = useState('');
  const [newCitation, setNewCitation] = useState('');
  const [citationsList, setCitationsList] = useState<string[]>([]);
  const [submittingReply, setSubmittingReply] = useState(false);

  // AI Tab state
  const [activeAITab, setActiveAITab] = useState<'none' | 'summary' | 'critique' | 'citations'>('none');
  const [aiLoading, setAiLoading] = useState(false);
  const [summaryData, setSummaryData] = useState<AISummaryResult | null>(null);
  const [critiqueData, setCritiqueData] = useState<AICritiqueResult | null>(null);
  const [citationsData, setCitationsData] = useState<AICitationsResult | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  // Refine reply state
  const [isRefining, setIsRefining] = useState(false);
  const [copiedCitation, setCopiedCitation] = useState<string | null>(null);

  const isAdmin = currentUser?.isAdmin || currentUser?.uid === 'admin_snowprince';
  const isLecturerOrAdmin = isAdmin || currentUser?.role === 'lecturer';

  useEffect(() => {
    const unsub = discussionsService.subscribeReplies(discussion.id, (list) => {
      setReplies(list);
    });
    return () => unsub();
  }, [discussion.id]);

  const handleAddCitation = () => {
    if (newCitation.trim()) {
      setCitationsList([...citationsList, newCitation.trim()]);
      setNewCitation('');
    }
  };

  const handleRemoveCitation = (index: number) => {
    setCitationsList(citationsList.filter((_, i) => i !== index));
  };

  const handleRefineMyReply = async () => {
    if (!newReplyContent.trim()) return;
    setIsRefining(true);
    try {
      const res = await academicApi.refineAcademicTone(newReplyContent);
      if (res.refinedText) {
        setNewReplyContent(res.refinedText);
      }
    } catch (err: any) {
      console.warn('Refine notice:', err);
    } finally {
      setIsRefining(false);
    }
  };

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReplyContent.trim() || !currentUser) return;
    setSubmittingReply(true);
    try {
      await discussionsService.addReply(discussion.id, {
        discussionId: discussion.id,
        content: newReplyContent.trim(),
        authorId: currentUser.uid,
        authorName: currentUser.displayName,
        authorRole: currentUser.role,
        authorInstitution: currentUser.institution || 'Institusi Akademik',
        citations: citationsList.length > 0 ? citationsList : undefined,
      });
      setNewReplyContent('');
      setCitationsList([]);
    } catch (err: any) {
      console.error('Error submitting reply:', err);
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleToggleEndorse = async (reply: Reply) => {
    if (!isLecturerOrAdmin) return;
    try {
      await discussionsService.toggleEndorseReply(discussion.id, reply.id, reply.isEndorsed);
    } catch (err) {
      console.error(err);
    }
  };

  // Trigger Gemini AI calls
  const handleFetchAISummary = async () => {
    setActiveAITab('summary');
    if (summaryData) return;
    setAiLoading(true);
    setAiError(null);
    try {
      const res = await academicApi.summarizeDiscussion(discussion.title, discussion.content, replies);
      setSummaryData(res);
    } catch (err: any) {
      setAiError(err?.message || 'Gagal memanggil ringkasan AI');
    } finally {
      setAiLoading(false);
    }
  };

  const handleFetchAICritique = async () => {
    setActiveAITab('critique');
    if (critiqueData) return;
    setAiLoading(true);
    setAiError(null);
    try {
      const res = await academicApi.critiqueArgument(discussion.title, discussion.content, discussion.hypothesis);
      setCritiqueData(res);
    } catch (err: any) {
      setAiError(err?.message || 'Gagal memanggil peer review AI');
    } finally {
      setAiLoading(false);
    }
  };

  const handleFetchAICitations = async () => {
    setActiveAITab('citations');
    if (citationsData) return;
    setAiLoading(true);
    setAiError(null);
    try {
      const res = await academicApi.getCitations(discussion.title, discussion.tags);
      setCitationsData(res);
    } catch (err: any) {
      setAiError(err?.message || 'Gagal merekomendasikan sitasi');
    } finally {
      setAiLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCitation(id);
    setTimeout(() => setCopiedCitation(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header Bar */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
              {discussion.category}
            </span>
            {discussion.isPinned && (
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
                Disematkan Admin
              </span>
            )}
            {discussion.isResolved && (
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                Tervalidasi
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Main Discussion Header & Author */}
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3 leading-snug">
              {discussion.title}
            </h2>

            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-9 h-9 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs ring-2 ring-indigo-500/20">
                {discussion.authorName?.charAt(0) || 'A'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-800 text-sm">
                    {discussion.authorName}
                  </span>
                  <span className="px-2 py-0.2 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {discussion.authorRole}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>{discussion.authorInstitution}</span>
                </div>
              </div>

              <div className="ml-auto">
                <button
                  type="button"
                  onClick={() => onLike(discussion)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition-all cursor-pointer"
                >
                  <ThumbsUp className="w-4 h-4 text-indigo-600" />
                  <span>{discussion.likesCount} Apresiasi</span>
                </button>
              </div>
            </div>
          </div>

          {/* Research Premise / Hypothesis Card */}
          {discussion.hypothesis && (
            <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-50/60 to-blue-50/60 border border-indigo-100 text-xs sm:text-sm">
              <span className="font-semibold text-indigo-950 flex items-center gap-1.5 mb-1">
                <HelpCircle className="w-4 h-4 text-indigo-600" />
                Premis / Hipotesis Kerja Ilmiah:
              </span>
              <p className="text-indigo-900/90 italic leading-relaxed">
                "{discussion.hypothesis}"
              </p>
            </div>
          )}

          {/* Full Discussion Content */}
          <div className="prose prose-slate max-w-none text-sm sm:text-base leading-relaxed text-slate-700 whitespace-pre-line">
            {discussion.content}
          </div>

          {/* Tags */}
          {discussion.tags && discussion.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-2">
              {discussion.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-600"
                >
                  <Tag className="w-3 h-3 text-slate-400" />
                  {tag.startsWith('#') ? tag : `#${tag}`}
                </span>
              ))}
            </div>
          )}

          {/* Gemini AI Academic Toolkit Panel */}
          <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-lg border border-slate-800">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-indigo-600/30 text-indigo-400 border border-indigo-500/30">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">
                    Asisten Analisis Akademik (Gemini Server-Side)
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Sintesis otomatis, peer-review metodologi, dan rekomendasi literatur
                  </p>
                </div>
              </div>

              {/* Action Tabs */}
              <div className="flex items-center gap-1.5 text-xs">
                <button
                  type="button"
                  onClick={handleFetchAISummary}
                  className={`px-3 py-1.5 rounded-xl font-medium transition-all cursor-pointer ${
                    activeAITab === 'summary' 
                      ? 'bg-indigo-600 text-white shadow-xs' 
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  Ringkas Diskusi
                </button>
                <button
                  type="button"
                  onClick={handleFetchAICritique}
                  className={`px-3 py-1.5 rounded-xl font-medium transition-all cursor-pointer ${
                    activeAITab === 'critique' 
                      ? 'bg-indigo-600 text-white shadow-xs' 
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  Peer Review & Kritik
                </button>
                <button
                  type="button"
                  onClick={handleFetchAICitations}
                  className={`px-3 py-1.5 rounded-xl font-medium transition-all cursor-pointer ${
                    activeAITab === 'citations' 
                      ? 'bg-indigo-600 text-white shadow-xs' 
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  Rekomendasi Sitasi
                </button>
              </div>
            </div>

            {/* AI Output Area */}
            {aiLoading && (
              <div className="py-8 text-center">
                <div className="w-8 h-8 border-3 border-indigo-500/30 border-t-indigo-400 rounded-full animate-spin mx-auto mb-2" />
                <p className="text-xs text-slate-300">
                  Sedang menelaah dengan Gemini AI di server Express...
                </p>
              </div>
            )}

            {aiError && (
              <div className="p-3 bg-rose-500/20 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{aiError}</span>
              </div>
            )}

            {!aiLoading && activeAITab === 'summary' && summaryData && (
              <div className="space-y-3 text-xs sm:text-sm animate-in fade-in">
                <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700/60">
                  <h5 className="font-bold text-indigo-300 mb-1 flex items-center gap-1.5">
                    <FileText className="w-4 h-4" />
                    Intisari Pokok Bahasan:
                  </h5>
                  <p className="text-slate-200 leading-relaxed whitespace-pre-line">
                    {summaryData.summary}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
                    <span className="font-semibold text-emerald-400 block mb-1">
                      Konsensus / Titik Temu Ilmiah:
                    </span>
                    <p className="text-slate-300 text-xs">
                      {summaryData.consensus}
                    </p>
                  </div>
                  <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
                    <span className="font-semibold text-amber-400 block mb-1">
                      Pertanyaan Riset Terbuka:
                    </span>
                    <ul className="list-disc list-inside text-slate-300 text-xs space-y-1">
                      {summaryData.openQuestions?.map((q, i) => (
                        <li key={i}>{q}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {!aiLoading && activeAITab === 'critique' && critiqueData && (
              <div className="space-y-3 text-xs sm:text-sm animate-in fade-in">
                <div className="flex items-center justify-between p-3 bg-slate-800/80 rounded-xl border border-slate-700/60">
                  <div>
                    <span className="text-xs text-slate-400 block">Indeks Ketajaman Metodologis:</span>
                    <span className="text-xl font-bold text-white">{critiqueData.overallScore}/100</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">Rekomendasi Reviewer:</span>
                    <span className="text-xs font-semibold text-indigo-300">{critiqueData.recommendation}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
                    <span className="font-semibold text-emerald-400 block mb-1.5">Kekuatan Argumen:</span>
                    <ul className="list-disc list-inside text-slate-300 text-xs space-y-1">
                      {critiqueData.strengths?.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
                    <span className="font-semibold text-rose-400 block mb-1.5">Celah & Batasan (Critiques):</span>
                    <ul className="list-disc list-inside text-slate-300 text-xs space-y-1">
                      {critiqueData.critiques?.map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {!aiLoading && activeAITab === 'citations' && citationsData && (
              <div className="space-y-3 text-xs sm:text-sm animate-in fade-in">
                <h5 className="font-semibold text-indigo-300">
                  Rujukan Literatur & Format Sitasi Terstandar:
                </h5>
                <div className="space-y-2">
                  {citationsData.sampleCitations?.map((cit, idx) => (
                    <div key={idx} className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60 flex items-start justify-between gap-3">
                      <div>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 uppercase">
                          {cit.format}
                        </span>
                        <p className="text-slate-200 font-mono text-xs mt-1 leading-relaxed">
                          {cit.citation}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-1 italic">
                          Catatan: {cit.notes}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(cit.citation, `cit_${idx}`)}
                        className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 transition-all shrink-0 cursor-pointer"
                        title="Salin Sitasi"
                      >
                        {copiedCitation === `cit_${idx}` ? (
                          <Check className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeAITab === 'none' && (
              <p className="text-xs text-slate-400 text-center py-2">
                Pilih salah satu fitur di atas untuk mengekstrak analisis mendalam dari naskah diskusi ini.
              </p>
            )}
          </div>

          {/* Peer Replies & Scholarly Discussion Thread */}
          <div className="pt-4 border-t border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center justify-between">
              <span>Tanggapan & Diskusi Sejawat ({replies.length})</span>
              <span className="text-xs font-normal text-slate-500">
                Peer Review Ilmiah Terverifikasi
              </span>
            </h3>

            {/* Replies List */}
            <div className="space-y-4 mb-6">
              {replies.length === 0 ? (
                <div className="text-center py-8 bg-slate-50 rounded-2xl border border-slate-200/60">
                  <BookOpen className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-700">Belum ada tanggapan ilmiah</p>
                  <p className="text-xs text-slate-500">Jadilah yang pertama memberikan perspektif teoritis atau empiris.</p>
                </div>
              ) : (
                replies.map((reply) => (
                  <div
                    key={reply.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      reply.isEndorsed 
                        ? 'border-emerald-300 bg-emerald-50/20 shadow-xs' 
                        : 'border-slate-200 bg-white'
                    }`}
                  >
                    {/* Reply Author info */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs">
                          {reply.authorName?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-800 text-xs">
                              {reply.authorName}
                            </span>
                            <span className="px-1.5 py-0.2 rounded-full text-[9px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                              {reply.authorRole}
                            </span>
                            {reply.isEndorsed && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.2 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                <Award className="w-3 h-3 text-emerald-600" />
                                Terverifikasi Ilmiah
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400">{reply.authorInstitution}</span>
                        </div>
                      </div>

                      {/* Endorse action for Admin or Lecturer */}
                      {isLecturerOrAdmin && (
                        <button
                          type="button"
                          onClick={() => handleToggleEndorse(reply)}
                          className={`text-xs px-2.5 py-1 rounded-xl font-medium border transition-all cursor-pointer ${
                            reply.isEndorsed 
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
                              : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-300 hover:text-emerald-700'
                          }`}
                          title="Tandai sebagai konsensus ilmiah valid"
                        >
                          {reply.isEndorsed ? 'Cabut Verifikasi' : 'Verifikasi Jawaban (Dosen/Admin)'}
                        </button>
                      )}
                    </div>

                    {/* Content */}
                    <p className="text-xs sm:text-sm text-slate-700 whitespace-pre-line leading-relaxed mb-3">
                      {reply.content}
                    </p>

                    {/* Citations referenced in reply */}
                    {reply.citations && reply.citations.length > 0 && (
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 mb-2">
                        <span className="font-semibold text-slate-700 flex items-center gap-1 mb-1">
                          <Quote className="w-3 h-3 text-indigo-600" />
                          Rujukan / Sitasi:
                        </span>
                        <ul className="list-disc list-inside space-y-0.5 text-[11px] font-mono text-slate-700">
                          {reply.citations.map((c, idx) => (
                            <li key={idx}>{c}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Submit New Reply Form */}
            <form onSubmit={handleSubmitReply} className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-slate-800">
                  Kontribusi Argumen / Telaah Ilmiah Anda:
                </label>
                
                {/* AI Refine Button */}
                <button
                  type="button"
                  onClick={handleRefineMyReply}
                  disabled={isRefining || !newReplyContent.trim()}
                  className="text-xs inline-flex items-center gap-1 text-indigo-700 hover:text-indigo-800 font-medium px-2 py-1 rounded-lg hover:bg-indigo-50 transition-all disabled:opacity-40 cursor-pointer"
                  title="Poles tata bahasa menjadi standar publikasi ilmiah"
                >
                  <Sparkles className="w-3 h-3 text-indigo-600" />
                  <span>{isRefining ? 'Memoles...' : 'Poles Bahasa Ilmiah (AI)'}</span>
                </button>
              </div>

              <textarea
                rows={3}
                required
                value={newReplyContent}
                onChange={(e) => setNewReplyContent(e.target.value)}
                placeholder="Tuliskan analisis komparatif, sanggahan metodologis, atau bukti empiris..."
                className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-3"
              />

              {/* Citations Adder */}
              <div className="mb-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCitation}
                    onChange={(e) => setNewCitation(e.target.value)}
                    placeholder="Tambahkan referensi sitasi (e.g. Creswell, 2018 / DOI)..."
                    className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddCitation}
                    className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold rounded-xl transition-all cursor-pointer"
                  >
                    + Rujukan
                  </button>
                </div>

                {citationsList.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {citationsList.map((c, i) => (
                      <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] bg-indigo-50 text-indigo-800 border border-indigo-200">
                        {c}
                        <button type="button" onClick={() => handleRemoveCitation(i)} className="text-slate-400 hover:text-rose-600">×</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submittingReply || !newReplyContent.trim()}
                  className="py-2 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {submittingReply ? (
                    <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Kirim Tanggapan Ilmiah</span>
                    </>
                  )}
                </button>
              </div>
            </form>

          </div>

        </div>
      </div>
    </div>
  );
};

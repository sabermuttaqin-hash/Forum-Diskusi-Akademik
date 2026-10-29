import React, { useState } from 'react';
import { CourseRoom, CourseMaterial, Assignment, Submission } from '../types';
import { useAuth } from '../context/AuthContext';
import { roomsService } from '../lib/rooms';
import { ExpeditionChoiceScenario } from './scenarios/ExpeditionChoiceScenario';
import { ClashArenaScenario } from './scenarios/ClashArenaScenario';
import { BuzzChamberScenario } from './scenarios/BuzzChamberScenario';
import { 
  ArrowLeft, 
  Copy, 
  Check, 
  Share2, 
  PlusCircle, 
  FileText, 
  UploadCloud, 
  Users, 
  Compass, 
  Swords, 
  Flame, 
  Building, 
  Laptop, 
  CheckCircle2, 
  Calendar, 
  Award,
  Sparkles,
  UserPlus
} from 'lucide-react';

interface RoomDetailViewProps {
  room: CourseRoom;
  onBack: () => void;
  onRefreshRoom: () => void;
}

export const RoomDetailView: React.FC<RoomDetailViewProps> = ({ room, onBack, onRefreshRoom }) => {
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.isAdmin || currentUser?.uid === room.teacherId;

  const [activeTab, setActiveTab] = useState<'stream' | 'scenario' | 'assignments' | 'members'>('scenario');
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Material creation state (for teachers)
  const [isAddingMaterial, setIsAddingMaterial] = useState(false);
  const [materialTitle, setMaterialTitle] = useState('');
  const [materialContent, setMaterialContent] = useState('');

  // Assignment submission state (for students)
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string>(room.assignments[0]?.id || '');
  const [submissionText, setSubmissionText] = useState('');
  const [attachmentName, setAttachmentName] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Invite member state
  const [inviteInput, setInviteInput] = useState('');
  const [inviteSuccessMsg, setInviteSuccessMsg] = useState<string | null>(null);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(room.roomCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyShareLink = () => {
    const link = `${window.location.origin}?roomCode=${room.roomCode}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCreateMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!materialTitle.trim() || !materialContent.trim()) return;

    roomsService.addMaterial(room.id, {
      title: materialTitle.trim(),
      content: materialContent.trim(),
      authorName: currentUser?.displayName || 'Pengajar',
      type: 'topic',
      tags: ['MateriBaru', room.subject.split(' ')[0]]
    });

    setMaterialTitle('');
    setMaterialContent('');
    setIsAddingMaterial(false);
    onRefreshRoom();
  };

  const handleSubmitAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!submissionText.trim() || !currentUser) return;

    roomsService.submitAssignment(room.id, selectedAssignmentId, {
      assignmentId: selectedAssignmentId,
      studentId: currentUser.uid,
      studentName: currentUser.displayName,
      studentRole: currentUser.role,
      content: submissionText.trim(),
      attachmentName: attachmentName.trim() || undefined,
    });

    setSubmissionText('');
    setAttachmentName('');
    setSubmitSuccess(true);
    setTimeout(() => setSubmitSuccess(false), 3000);
    onRefreshRoom();
  };

  const handleInviteStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteInput.trim()) return;

    const res = roomsService.inviteMemberDirect(room.id, inviteInput.trim(), 'online');
    setInviteSuccessMsg(res.message);
    setInviteInput('');
    setTimeout(() => setInviteSuccessMsg(null), 3000);
    onRefreshRoom();
  };

  const getScenarioBadge = () => {
    switch (room.discussionScenario) {
      case 'expedition':
        return { label: 'The Expedition Choice', icon: Compass, color: 'text-violet-400 bg-violet-500/10 border-violet-500/20' };
      case 'clash':
        return { label: 'The Clash Arena', icon: Swords, color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' };
      case 'buzz':
        return { label: 'The Buzz Chamber', icon: Flame, color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' };
      default:
        return { label: 'The Expedition Choice', icon: Compass, color: 'text-violet-400 bg-violet-500/10 border-violet-500/20' };
    }
  };

  const scenarioBadge = getScenarioBadge();
  const ScenarioIcon = scenarioBadge.icon;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Top back button */}
      <div>
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Daftar Ruang Kelas</span>
        </button>
      </div>

      {/* Google Classroom Banner with Lamatic GenAI Aesthetic */}
      <div className={`p-6 sm:p-10 rounded-3xl bg-gradient-to-r ${room.bannerGradient} border border-white/10 shadow-2xl relative overflow-hidden text-white`}>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${scenarioBadge.color}`}>
                <ScenarioIcon className="w-3.5 h-3.5" />
                <span>Model: {scenarioBadge.label}</span>
              </span>
              <span className="text-xs text-slate-300 px-2 py-0.5 rounded-full bg-black/30 border border-white/10">
                {room.section}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight font-serif-academic leading-tight">
              {room.name}
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Pengampu: <strong className="text-white">{room.teacherName}</strong> • Bidang: {room.subject}
            </p>
          </div>

          {/* Room Code Card (Google Classroom Style) */}
          <div className="bg-[#0B0D17]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-xl shrink-0 min-w-[220px]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Kode Masuk Room Kelas
            </span>
            <div className="flex items-center justify-between gap-3 mb-2">
              <span className="text-2xl font-black font-mono tracking-widest text-violet-300">
                {room.roomCode}
              </span>
              <button
                type="button"
                onClick={handleCopyCode}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 cursor-pointer transition-all"
                title="Salin kode room"
              >
                {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <button
              type="button"
              onClick={handleCopyShareLink}
              className="w-full py-1.5 px-2.5 rounded-xl bg-violet-600/30 hover:bg-violet-600/50 border border-violet-500/30 text-[11px] font-semibold text-violet-200 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Share2 className="w-3 h-3 text-violet-400" />
              <span>{copiedLink ? 'Tautan Disalin!' : 'Bagikan Link Room'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Classroom Navigation Tabs */}
      <div className="flex border-b border-white/10 bg-[#0F111E] p-1 rounded-2xl overflow-x-auto text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab('scenario')}
          className={`py-2.5 px-4 rounded-xl flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'scenario'
              ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <ScenarioIcon className="w-4 h-4" />
          <span>Skenario Diskusi ({scenarioBadge.label})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('stream')}
          className={`py-2.5 px-4 rounded-xl flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'stream'
              ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Materi & Pembahasan ({room.materials.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('assignments')}
          className={`py-2.5 px-4 rounded-xl flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'assignments'
              ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <UploadCloud className="w-4 h-4" />
          <span>Pengumpulan Tugas ({room.assignments.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('members')}
          className={`py-2.5 px-4 rounded-xl flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'members'
              ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Anggota Kelas ({room.members.length})</span>
        </button>
      </div>

      {/* TAB 1: Skenario Diskusi Interaktif (Expedition / Clash / Buzz) */}
      {activeTab === 'scenario' && (
        <div>
          {room.discussionScenario === 'expedition' && (
            <ExpeditionChoiceScenario room={room} onUpdateRoom={onRefreshRoom} />
          )}
          {room.discussionScenario === 'clash' && (
            <ClashArenaScenario room={room} onUpdateRoom={onRefreshRoom} />
          )}
          {room.discussionScenario === 'buzz' && (
            <BuzzChamberScenario room={room} onUpdateRoom={onRefreshRoom} />
          )}
        </div>
      )}

      {/* TAB 2: Stream Materi & Silabus */}
      {activeTab === 'stream' && (
        <div className="space-y-6">
          {/* Guru action: Add Material */}
          {isAdmin && (
            <div className="p-5 rounded-2xl bg-[#0F111E] border border-white/10">
              {!isAddingMaterial ? (
                <button
                  type="button"
                  onClick={() => setIsAddingMaterial(true)}
                  className="w-full py-3 px-4 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 text-xs font-semibold text-slate-300 hover:text-white flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4 text-violet-400" />
                  <span>+ Publikasikan Materi Baru atau Panduan Topik</span>
                </button>
              ) : (
                <form onSubmit={handleCreateMaterial} className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-violet-300">
                    Tambah Materi / Tema Pembahasan Baru:
                  </h4>
                  <input
                    type="text"
                    required
                    value={materialTitle}
                    onChange={(e) => setMaterialTitle(e.target.value)}
                    placeholder="Judul Materi / Topik Kajian..."
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                  <textarea
                    rows={3}
                    required
                    value={materialContent}
                    onChange={(e) => setMaterialContent(e.target.value)}
                    placeholder="Uraikan instruksi bacaan, tema diskusi, atau tautan referensi..."
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl p-3.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingMaterial(false)}
                      className="px-3 py-1.5 rounded-xl text-xs text-slate-400 hover:text-white"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs shadow-md"
                    >
                      Posting Materi
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* List of Materials */}
          <div className="space-y-4">
            {room.materials.map((mat) => (
              <div key={mat.id} className="p-6 rounded-3xl bg-[#0F111E] border border-white/10 space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-violet-400" />
                    <span className="text-xs font-bold text-white">{mat.title}</span>
                  </div>
                  <span className="text-[11px] text-slate-500">
                    Diposting oleh {mat.authorName}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                  {mat.content}
                </p>
                {mat.tags && (
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {mat.tags.map((t, idx) => (
                      <span key={idx} className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 text-slate-400">
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Tempat Pengumpulan Tugas (Google Classroom Assignment Workflow) */}
      {activeTab === 'assignments' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Left: Assignment List Selector */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Daftar Tugas Aktif:
              </h3>
              {room.assignments.map((assign) => {
                const isSelected = assign.id === selectedAssignmentId;
                const mySub = assign.submissions.find(s => s.studentId === currentUser?.uid);

                return (
                  <button
                    key={assign.id}
                    type="button"
                    onClick={() => setSelectedAssignmentId(assign.id)}
                    className={`w-full p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-violet-950/30 border-violet-500 shadow-md ring-1 ring-violet-500/30'
                        : 'bg-[#0F111E] border-white/10 hover:bg-white/[0.03]'
                    }`}
                  >
                    <h4 className="text-xs font-bold text-white mb-1">{assign.title}</h4>
                    <p className="text-[11px] text-slate-400 mb-2">Batas: {assign.dueDate.split('T')[0]}</p>
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-violet-300 font-bold">{assign.points} Poin</span>
                      {mySub ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                          Sudah Mengumpulkan
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold">
                          Belum Dikumpulkan
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Right: Submission Details & Form */}
            <div className="md:col-span-2 space-y-5">
              {(() => {
                const currentAssign = room.assignments.find(a => a.id === selectedAssignmentId);
                if (!currentAssign) return null;

                const mySub = currentAssign.submissions.find(s => s.studentId === currentUser?.uid);

                return (
                  <div className="p-6 rounded-3xl bg-[#0F111E] border border-white/10 space-y-5">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-base font-bold text-white">{currentAssign.title}</h3>
                        <span className="text-xs px-2.5 py-1 rounded-full bg-violet-500/20 text-violet-300 font-bold">
                          Nilai Maks: {currentAssign.points}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-4">
                        {currentAssign.description}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Batas Waktu Pengumpulan: {new Date(currentAssign.dueDate).toLocaleDateString('id-ID', { dateStyle: 'long' })}</span>
                      </div>
                    </div>

                    {/* Status Pengumpulan Siswa Saat Ini */}
                    {mySub ? (
                      <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-300">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            Tugas Anda Telah Dikumpulkan
                          </span>
                          {mySub.score !== undefined && (
                            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-bold">
                              Nilai: {mySub.score}/{currentAssign.points}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-200 font-mono bg-white/[0.02] p-2.5 rounded-xl border border-white/5">
                          "{mySub.content}"
                        </p>
                        {mySub.attachmentName && (
                          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5 text-violet-400" />
                            <span>Lampiran: {mySub.attachmentName}</span>
                          </div>
                        )}
                        {mySub.feedback && (
                          <div className="p-2.5 rounded-xl bg-violet-950/30 text-xs text-violet-200 border border-violet-500/30">
                            <strong>Catatan Dosen:</strong> {mySub.feedback}
                          </div>
                        )}
                      </div>
                    ) : (
                      /* Form Pengumpulan Tugas Siswa */
                      <form onSubmit={handleSubmitAssignment} className="space-y-4 pt-4 border-t border-white/10">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                          <UploadCloud className="w-4 h-4 text-violet-400" />
                          Formulir Pengumpulan Tugas Anda:
                        </h4>

                        {submitSuccess && (
                          <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Tugas berhasil dikirim ke Pengampu Ruang Kelas!</span>
                          </div>
                        )}

                        <textarea
                          rows={4}
                          required
                          value={submissionText}
                          onChange={(e) => setSubmissionText(e.target.value)}
                          placeholder="Ketikkan teks jawaban tugas, link Google Docs/Drive, atau sintesis kelompok..."
                          className="w-full bg-white/[0.03] border border-white/10 rounded-xl p-3.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
                        />

                        <input
                          type="text"
                          value={attachmentName}
                          onChange={(e) => setAttachmentName(e.target.value)}
                          placeholder="Nama Berkas Lampiran (contoh: Laporan_Sintesis_Kelompok_A.pdf)"
                          className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
                        />

                        <button
                          type="submit"
                          disabled={!submissionText.trim()}
                          className="py-2.5 px-5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs shadow-md transition-all disabled:opacity-40 cursor-pointer flex items-center gap-2"
                        >
                          <UploadCloud className="w-4 h-4" />
                          <span>Serahkan Tugas Sekarang</span>
                        </button>
                      </form>
                    )}

                    {/* Guru Panel: Review all student submissions */}
                    {isAdmin && (
                      <div className="pt-6 border-t border-white/10 space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-violet-300">
                          Panel Penilaian Dosen ({currentAssign.submissions.length} Siswa Mengumpulkan):
                        </h4>

                        <div className="space-y-2">
                          {currentAssign.submissions.map((sub) => (
                            <div key={sub.id} className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 text-xs space-y-1.5">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-white">{sub.studentName}</span>
                                <span className="text-[11px] text-slate-400">{sub.submittedAt.split('T')[0]}</span>
                              </div>
                              <p className="text-slate-300 font-mono text-[11px]">{sub.content}</p>
                              <div className="flex items-center justify-between pt-1">
                                <span className="text-emerald-400 font-bold">Status: {sub.status}</span>
                                {sub.score ? (
                                  <span className="text-violet-300 font-bold">Nilai: {sub.score}</span>
                                ) : (
                                  <span className="text-amber-400 italic">Menunggu Evaluasi</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

          </div>
        </div>
      )}

      {/* TAB 4: Anggota & Tim (Mengundang Murid Langsung & Kode Room) */}
      {activeTab === 'members' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-[#0F111E] border border-white/10 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
            <div>
              <h3 className="text-base font-bold text-white">
                Daftar Mahasiswa & Partisipan Kelas
              </h3>
              <p className="text-xs text-slate-400">
                Terdiri dari peserta yang hadir fisik di kelas (Offline) dan daring (Online).
              </p>
            </div>

            {/* Invite Form */}
            {isAdmin && (
              <form onSubmit={handleInviteStudent} className="flex gap-2 w-full sm:w-auto">
                <input
                  type="text"
                  required
                  value={inviteInput}
                  onChange={(e) => setInviteInput(e.target.value)}
                  placeholder="Nama / Email Mahasiswa..."
                  className="bg-white/[0.03] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Undang Langsung</span>
                </button>
              </form>
            )}
          </div>

          {inviteSuccessMsg && (
            <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{inviteSuccessMsg}</span>
            </div>
          )}

          {/* Members List Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {room.memberProfiles?.map((mem) => (
              <div key={mem.uid} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center font-bold text-xs text-white">
                    {mem.displayName.charAt(0)}
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white">{mem.displayName}</h5>
                    <span className="text-[10px] text-slate-400 capitalize">{mem.role}</span>
                  </div>
                </div>

                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                  mem.attendance === 'offline'
                    ? 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                    : 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20'
                }`}>
                  {mem.attendance === 'offline' ? 'Offline di Kelas' : 'Online di Rumah'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

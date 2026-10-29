import React, { useState } from 'react';
import { CourseRoom, CourseMaterial, Assignment, Submission } from '../types';
import { useAuth } from '../context/AuthContext';
import { roomsService } from '../lib/rooms';
import { ExpeditionChoiceScenario } from './scenarios/ExpeditionChoiceScenario';
import { ClashArenaScenario } from './scenarios/ClashArenaScenario';
import { BuzzChamberScenario } from './scenarios/BuzzChamberScenario';
import { EditRoomModal } from './EditRoomModal';
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
  Edit3,
  Trash2,
  X,
  Save,
  UserPlus,
  BookOpen
} from 'lucide-react';

interface RoomDetailViewProps {
  room: CourseRoom;
  onBack: () => void;
  onRefreshRoom: () => void;
}

export const RoomDetailView: React.FC<RoomDetailViewProps> = ({ room, onBack, onRefreshRoom }) => {
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.isAdmin || currentUser?.uid === room.teacherId || currentUser?.role === 'admin' || currentUser?.role === 'lecturer';

  const [activeTab, setActiveTab] = useState<'stream' | 'scenario' | 'assignments' | 'members'>('scenario');
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isEditRoomOpen, setIsEditRoomOpen] = useState(false);

  // Material creation state
  const [isAddingMaterial, setIsAddingMaterial] = useState(false);
  const [materialTitle, setMaterialTitle] = useState('');
  const [materialContent, setMaterialContent] = useState('');

  // Material editing state (GURU BISA EDIT MATERI)
  const [editingMaterial, setEditingMaterial] = useState<CourseMaterial | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');

  // Assignment submission state
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

  const handleStartEditMaterial = (mat: CourseMaterial) => {
    setEditingMaterial(mat);
    setEditTitle(mat.title);
    setEditContent(mat.content);
  };

  const handleSaveEditedMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMaterial || !editTitle.trim() || !editContent.trim()) return;

    roomsService.editMaterial(room.id, editingMaterial.id, {
      title: editTitle.trim(),
      content: editContent.trim()
    });

    setEditingMaterial(null);
    onRefreshRoom();
  };

  const handleDeleteMaterial = (materialId: string) => {
    if (window.confirm('Hapus materi pembahasan ini dari ruang kelas?')) {
      roomsService.deleteMaterial(room.id, materialId);
      onRefreshRoom();
    }
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
        return { label: 'The Expedition Choice', icon: Compass, color: 'text-amber-800 bg-amber-100 border-amber-300' };
      case 'clash':
        return { label: 'The Clash Arena', icon: Swords, color: 'text-indigo-800 bg-indigo-100 border-indigo-300' };
      case 'buzz':
        return { label: 'The Buzz Chamber', icon: Flame, color: 'text-cyan-800 bg-cyan-100 border-cyan-300' };
      default:
        return { label: 'The Expedition Choice', icon: Compass, color: 'text-amber-800 bg-amber-100 border-amber-300' };
    }
  };

  const scenarioBadge = getScenarioBadge();
  const ScenarioIcon = scenarioBadge.icon;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 font-sans">
      
      {/* Back button */}
      <div>
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Hub Ruang Kelas</span>
        </button>
      </div>

      {/* ToyStore-style Cheerful Classroom Banner */}
      <div className="p-8 sm:p-10 rounded-3xl bg-white border-2 border-slate-200/90 shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-rose-50/80 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs sm:text-sm font-extrabold border ${scenarioBadge.color}`}>
                <ScenarioIcon className="w-4 h-4" />
                <span>Model: {scenarioBadge.label}</span>
              </span>
              <span className="text-xs sm:text-sm text-slate-700 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 font-bold">
                {room.section}
              </span>
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => setIsEditRoomOpen(true)}
                  className="px-3.5 py-1 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                >
                  <Edit3 className="w-3.5 h-3.5 text-amber-700" />
                  <span>Edit Info Kelas</span>
                </button>
              )}
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-brand leading-tight">
              {room.name}
            </h1>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-medium">
              Pengampu: <strong className="text-slate-900 font-bold">{room.teacherName}</strong> • Bidang: {room.subject}
            </p>
          </div>

          {/* Room Code Card (ToyStore Retail Style) */}
          <div className="bg-amber-50/80 border-2 border-amber-300 rounded-3xl p-5 shadow-sm shrink-0 min-w-[240px]">
            <span className="text-xs font-extrabold uppercase tracking-wider text-amber-900 block mb-1">
              Kode Masuk Room Kelas
            </span>
            <div className="flex items-center justify-between gap-3 mb-3">
              <span className="text-2xl sm:text-3xl font-black font-mono tracking-widest text-slate-900">
                {room.roomCode}
              </span>
              <button
                type="button"
                onClick={handleCopyCode}
                className="p-2 rounded-xl bg-white border border-amber-300 text-slate-700 hover:bg-amber-100 cursor-pointer transition-all shadow-xs"
                title="Salin kode room"
              >
                {copiedCode ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <button
              type="button"
              onClick={handleCopyShareLink}
              className="w-full py-2 px-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
            >
              <Share2 className="w-4 h-4" />
              <span>{copiedLink ? 'Tautan Disalin!' : 'Bagikan Link Room'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Classroom Navigation Tabs (ToyStore Chunky Pills) */}
      <div className="flex bg-white p-2 rounded-3xl border border-slate-200 overflow-x-auto text-sm font-bold shadow-xs gap-1.5">
        <button
          type="button"
          onClick={() => setActiveTab('scenario')}
          className={`py-3 px-5 rounded-2xl flex items-center gap-2.5 whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'scenario'
              ? 'bg-rose-500 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <ScenarioIcon className="w-4 h-4" />
          <span>Skenario Diskusi ({scenarioBadge.label})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('stream')}
          className={`py-3 px-5 rounded-2xl flex items-center gap-2.5 whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'stream'
              ? 'bg-rose-500 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Materi & Pembahasan ({room.materials.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('assignments')}
          className={`py-3 px-5 rounded-2xl flex items-center gap-2.5 whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'assignments'
              ? 'bg-rose-500 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <UploadCloud className="w-4 h-4" />
          <span>Pengumpulan Tugas ({room.assignments.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('members')}
          className={`py-3 px-5 rounded-2xl flex items-center gap-2.5 whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'members'
              ? 'bg-rose-500 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Anggota Kelas ({room.members.length})</span>
        </button>
      </div>

      {/* TAB 1: Skenario Diskusi Interaktif */}
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

      {/* TAB 2: Stream Materi & Pembahasan (DENGAN FITUR EDIT MATERI GURU) */}
      {activeTab === 'stream' && (
        <div className="space-y-6">
          {/* Guru action: Add Material */}
          {isAdmin && (
            <div className="p-6 rounded-3xl bg-white border-2 border-slate-200 shadow-sm">
              {!isAddingMaterial ? (
                <button
                  type="button"
                  onClick={() => setIsAddingMaterial(true)}
                  className="w-full py-3.5 px-4 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-300 text-sm font-bold text-slate-800 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <PlusCircle className="w-5 h-5 text-rose-500" />
                  <span>+ Tambah Materi / Tema Pembahasan Baru</span>
                </button>
              ) : (
                <form onSubmit={handleCreateMaterial} className="space-y-4">
                  <h4 className="text-base font-bold text-slate-900 font-brand">
                    Publikasikan Materi Baru untuk Mahasiswa:
                  </h4>
                  <input
                    type="text"
                    required
                    value={materialTitle}
                    onChange={(e) => setMaterialTitle(e.target.value)}
                    placeholder="Judul Materi / Topik Kajian..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white"
                  />
                  <textarea
                    rows={4}
                    required
                    value={materialContent}
                    onChange={(e) => setMaterialContent(e.target.value)}
                    placeholder="Tuliskan isi instruksi materi, landasan teori, atau topik pembahasan..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-2xl p-4 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white"
                  />
                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setIsAddingMaterial(false)}
                      className="px-4 py-2 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-sm shadow-sm cursor-pointer"
                    >
                      Posting Materi
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* List of Materials with Edit & Delete options for teachers */}
          <div className="space-y-4">
            {room.materials.map((mat) => (
              <div key={mat.id} className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-2xl bg-amber-100 text-amber-800">
                      <FileText className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 font-brand">{mat.title}</h3>
                      <span className="text-xs text-slate-500">
                        Oleh: {mat.authorName} • {mat.createdAt.split('T')[0]}
                      </span>
                    </div>
                  </div>

                  {/* Teacher Edit & Delete Controls */}
                  {isAdmin && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleStartEditMaterial(mat)}
                        className="px-3 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs sm:text-sm font-bold border border-amber-300 flex items-center gap-1.5 transition-all cursor-pointer"
                        title="Edit Materi Ini"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-amber-700" />
                        <span>Edit Materi</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteMaterial(mat.id)}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                        title="Hapus Materi"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                <p className="text-sm sm:text-base text-slate-700 leading-relaxed whitespace-pre-line font-medium">
                  {mat.content}
                </p>

                {mat.tags && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {mat.tags.map((t, idx) => (
                      <span key={idx} className="text-xs px-3 py-1 rounded-xl bg-slate-100 text-slate-700 font-bold">
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

      {/* EDIT MATERIAL MODAL FOR GURU */}
      {editingMaterial && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border-2 border-amber-300 overflow-hidden flex flex-col">
            <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between bg-amber-50">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-amber-600" />
                <h3 className="text-base sm:text-lg font-bold text-slate-900 font-brand">
                  Edit Materi / Pembahasan (Guru)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingMaterial(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditedMaterial} className="p-6 space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-bold text-slate-800 mb-1.5">
                  Judul Materi
                </label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-bold text-slate-800 mb-1.5">
                  Isi Pembahasan
                </label>
                <textarea
                  rows={5}
                  required
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-2xl p-4 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white leading-relaxed"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingMaterial(null)}
                  className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs sm:text-sm shadow-md flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Perubahan Materi</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 3: Tempat Pengumpulan Tugas */}
      {activeTab === 'assignments' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Left: Assignment List Selector */}
            <div className="space-y-3">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-600">
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
                    className={`w-full p-5 rounded-3xl border-2 text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-rose-50/70 border-rose-500 shadow-sm ring-2 ring-rose-300'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <h4 className="text-sm font-bold text-slate-900 mb-1">{assign.title}</h4>
                    <p className="text-xs text-slate-500 mb-3">Batas: {assign.dueDate.split('T')[0]}</p>
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-rose-600">{assign.points} Poin</span>
                      {mySub ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          Sudah Mengumpulkan
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900">
                          Belum Mengumpulkan
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Right: Submission Form */}
            <div className="md:col-span-2 space-y-5">
              {(() => {
                const currentAssign = room.assignments.find(a => a.id === selectedAssignmentId);
                if (!currentAssign) return null;

                const mySub = currentAssign.submissions.find(s => s.studentId === currentUser?.uid);

                return (
                  <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-5">
                    <div>
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <h3 className="text-lg sm:text-xl font-bold text-slate-900 font-brand">{currentAssign.title}</h3>
                        <span className="text-xs sm:text-sm px-3.5 py-1 rounded-full bg-rose-100 text-rose-800 font-extrabold border border-rose-300">
                          Nilai Maks: {currentAssign.points}
                        </span>
                      </div>
                      <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-4">
                        {currentAssign.description}
                      </p>
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 font-medium">
                        <Calendar className="w-4 h-4 text-rose-500" />
                        <span>Batas Waktu: {new Date(currentAssign.dueDate).toLocaleDateString('id-ID', { dateStyle: 'long' })}</span>
                      </div>
                    </div>

                    {mySub ? (
                      <div className="p-5 rounded-2xl bg-emerald-50 border-2 border-emerald-300 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="inline-flex items-center gap-2 text-sm font-bold text-emerald-900">
                            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                            Tugas Anda Telah Berhasil Dikumpulkan
                          </span>
                          {mySub.score !== undefined && (
                            <span className="text-sm px-3 py-1 rounded-full bg-emerald-600 text-white font-black">
                              Nilai: {mySub.score} / {currentAssign.points}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-800 bg-white p-4 rounded-xl border border-emerald-200 leading-relaxed font-sans">
                          "{mySub.content}"
                        </p>
                        {mySub.attachmentName && (
                          <div className="text-xs sm:text-sm text-slate-600 flex items-center gap-2">
                            <FileText className="w-4 h-4 text-rose-500" />
                            <span>Lampiran: <strong>{mySub.attachmentName}</strong></span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <form onSubmit={handleSubmitAssignment} className="space-y-4 pt-4 border-t border-slate-100">
                        <h4 className="text-sm font-bold text-slate-900 font-brand flex items-center gap-2">
                          <UploadCloud className="w-4 h-4 text-rose-500" />
                          Formulir Pengumpulan Tugas Anda:
                        </h4>

                        {submitSuccess && (
                          <div className="p-4 rounded-2xl bg-emerald-100 border border-emerald-300 text-emerald-900 text-sm font-bold flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                            <span>Tugas berhasil dikirim ke pengampu ruang kelas!</span>
                          </div>
                        )}

                        <textarea
                          rows={4}
                          required
                          value={submissionText}
                          onChange={(e) => setSubmissionText(e.target.value)}
                          placeholder="Ketikkan teks jawaban tugas, link Google Docs, atau kesimpulan kelompok Anda..."
                          className="w-full bg-slate-50 border border-slate-300 rounded-2xl p-4 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white"
                        />

                        <input
                          type="text"
                          value={attachmentName}
                          onChange={(e) => setAttachmentName(e.target.value)}
                          placeholder="Nama Berkas Lampiran (contoh: Laporan_Sintesis_Kelompok_A.pdf)"
                          className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white"
                        />

                        <button
                          type="submit"
                          disabled={!submissionText.trim()}
                          className="py-3 px-6 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-sm shadow-md transition-all disabled:opacity-40 cursor-pointer flex items-center gap-2"
                        >
                          <UploadCloud className="w-4 h-4" />
                          <span>Serahkan Tugas Sekarang</span>
                        </button>
                      </form>
                    )}

                    {/* Teacher review panel */}
                    {isAdmin && (
                      <div className="pt-6 border-t border-slate-200 space-y-3">
                        <h4 className="text-sm font-bold text-slate-900 font-brand">
                          Panel Penilaian Dosen ({currentAssign.submissions.length} Siswa Mengumpulkan):
                        </h4>

                        <div className="space-y-2.5">
                          {currentAssign.submissions.map((sub) => (
                            <div key={sub.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-sm space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-slate-900 text-sm">{sub.studentName}</span>
                                <span className="text-xs text-slate-500">{sub.submittedAt.split('T')[0]}</span>
                              </div>
                              <p className="text-slate-700 bg-white p-3 rounded-xl border border-slate-200 text-xs sm:text-sm font-sans">{sub.content}</p>
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

      {/* TAB 4: Anggota Kelas */}
      {activeTab === 'members' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-lg font-bold text-slate-900 font-brand">
                Daftar Mahasiswa & Partisipan Kelas
              </h3>
              <p className="text-sm text-slate-600">
                Terdiri dari peserta yang hadir fisik di kelas (Offline) dan daring (Online).
              </p>
            </div>

            {isAdmin && (
              <form onSubmit={handleInviteStudent} className="flex gap-2 w-full sm:w-auto">
                <input
                  type="text"
                  required
                  value={inviteInput}
                  onChange={(e) => setInviteInput(e.target.value)}
                  placeholder="Nama / Email Mahasiswa..."
                  className="bg-slate-50 border border-slate-300 rounded-2xl px-4 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
                <button
                  type="submit"
                  className="px-5 py-2 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-1.5 shrink-0 shadow-sm"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Undang Langsung</span>
                </button>
              </form>
            )}
          </div>

          {inviteSuccessMsg && (
            <div className="p-4 rounded-2xl bg-emerald-100 border border-emerald-300 text-emerald-900 text-sm font-bold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>{inviteSuccessMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {room.memberProfiles?.map((mem) => (
              <div key={mem.uid} className="p-5 rounded-3xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-rose-500 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                    {mem.displayName.charAt(0)}
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-slate-900">{mem.displayName}</h5>
                    <span className="text-xs text-slate-500 capitalize">{mem.role}</span>
                  </div>
                </div>

                <span className={`text-xs px-3 py-1 rounded-full font-bold border ${
                  mem.attendance === 'offline'
                    ? 'bg-amber-100 text-amber-900 border-amber-300'
                    : 'bg-blue-100 text-blue-900 border-blue-300'
                }`}>
                  {mem.attendance === 'offline' ? 'Offline' : 'Online'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* EDIT ROOM MODAL FOR GURU */}
      <EditRoomModal
        room={room}
        isOpen={isEditRoomOpen}
        onClose={() => setIsEditRoomOpen(false)}
        onRoomUpdated={() => {
          onRefreshRoom();
        }}
      />

    </div>
  );
};

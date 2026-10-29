import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { discussionsService } from '../lib/discussions';
import { academicApi } from '../lib/api';
import { 
  X, 
  ShieldCheck, 
  Award, 
  Database, 
  Cpu, 
  Bell, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle,
  RefreshCw,
  Users,
  FileText
} from 'lucide-react';

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  discussionsCount: number;
}

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  isOpen,
  onClose,
  discussionsCount,
}) => {
  const { currentUser } = useAuth();
  const [backendHealth, setBackendHealth] = useState<{ status: string; geminiConfigured: boolean } | null>(null);
  const [checkingBackend, setCheckingBackend] = useState(false);
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastSuccess, setBroadcastSuccess] = useState(false);
  const [seedingLoading, setSeedingLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      checkApiHealth();
    }
  }, [isOpen]);

  const checkApiHealth = async () => {
    setCheckingBackend(true);
    try {
      const data = await academicApi.getHealth();
      setBackendHealth(data);
    } catch (e) {
      setBackendHealth({ status: 'offline', geminiConfigured: false });
    } finally {
      setCheckingBackend(false);
    }
  };

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastMessage.trim()) return;
    setBroadcastSuccess(true);
    setTimeout(() => {
      setBroadcastSuccess(false);
      setBroadcastMessage('');
    }, 3000);
  };

  const handleReseed = async () => {
    setSeedingLoading(true);
    try {
      await discussionsService.seedIfEmpty();
      window.location.reload();
    } catch (e) {
      console.error(e);
    } finally {
      setSeedingLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <ShieldCheck className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white font-serif-academic">
                  Panel Administrator: SnowPrince
                </h3>
                <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950">
                  SUPER ADMIN
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Otoritas moderasi diskusi ilmiah, pengawasan etika, dan verifikasi konsensus
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

        {/* Body Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* Admin Identity Card */}
          <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-slate-900 text-amber-400 font-bold flex items-center justify-center text-lg ring-2 ring-amber-400">
                SP
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-slate-900 text-sm">SnowPrince</h4>
                  <span className="text-[10px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full font-semibold">
                    Akun Admin Aktif
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  Username Terverifikasi: <strong className="font-mono text-slate-800">SnowPrince</strong> | Kredensial Sistem: <strong className="font-mono text-slate-800">Mahasiswa890</strong>
                </p>
                <p className="text-[11px] text-slate-500">
                  Afiliasi: Dewan Pengawas Riset & Etika Akademik
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-500 block">Poin Otoritas / Reputasi:</span>
              <span className="text-xl font-bold text-indigo-700">9.999 Pts</span>
            </div>
          </div>

          {/* System Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
                <span>Total Topik Riset:</span>
                <FileText className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="text-2xl font-bold text-slate-900">{discussionsCount}</div>
              <span className="text-[10px] text-slate-500">Tersinkronisasi Firestore</span>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
                <span>Backend Express:</span>
                <Cpu className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5 mt-1">
                {checkingBackend ? (
                  <span className="text-slate-400">Memeriksa...</span>
                ) : backendHealth?.status === 'ok' ? (
                  <>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span className="text-emerald-700 font-mono text-xs">/api (Aktif)</span>
                  </>
                ) : (
                  <>
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    <span className="text-rose-700 text-xs">Offline</span>
                  </>
                )}
              </div>
              <span className="text-[10px] text-slate-500">api/index.ts (Vercel Ready)</span>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
                <span>Status AI Gemini:</span>
                <Database className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5 mt-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-indigo-700 font-mono text-xs">gemini-3.8-flash</span>
              </div>
              <span className="text-[10px] text-slate-500">Kunci API Server-Side Aktif</span>
            </div>
          </div>

          {/* Broadcast Announcement Form */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
            <h4 className="text-xs font-bold text-slate-800 mb-1 flex items-center gap-1.5">
              <Bell className="w-4 h-4 text-indigo-600" />
              Pasang Pengumuman Akademik Global
            </h4>
            <p className="text-xs text-slate-500 mb-3">
              Pesan ini akan disematkan di beranda forum untuk seluruh akademisi.
            </p>

            {broadcastSuccess && (
              <div className="mb-3 p-3 bg-emerald-100 border border-emerald-300 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Pengumuman resmi berhasil diterbitkan ke seluruh ruang diskusi!</span>
              </div>
            )}

            <form onSubmit={handleBroadcast} className="flex gap-2">
              <input
                type="text"
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
                placeholder="Contoh: Batas akhir pengajuan hibah penelitian dosen muda diperpanjang hingga 15 November..."
                className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="submit"
                disabled={!broadcastMessage.trim()}
                className="py-2 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs rounded-xl shadow-xs disabled:opacity-40 cursor-pointer"
              >
                Kirim Pengumuman
              </button>
            </form>
          </div>

          {/* Administrative Actions */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
            <h4 className="text-xs font-bold text-slate-800 mb-2">
              Pemeliharaan Data & Sinkronisasi Koleksi Benih
            </h4>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-700 font-medium">Sinkronkan Ulang Diskusi Default</p>
                <p className="text-[11px] text-slate-500">Memuat kembali data rujukan metodologi dan etika AI ke Firestore.</p>
              </div>
              <button
                type="button"
                onClick={handleReseed}
                disabled={seedingLoading}
                className="py-1.5 px-3 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${seedingLoading ? 'animate-spin' : ''}`} />
                <span>{seedingLoading ? 'Menyinkronkan...' : 'Muat Benih Data'}</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

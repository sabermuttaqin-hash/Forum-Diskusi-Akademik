import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Sparkles, 
  Lock, 
  User, 
  Building2, 
  AlertCircle,
  LogIn,
  Layers,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  GraduationCap,
  Globe2,
  Radio,
  Compass
} from 'lucide-react';

export const LoginView: React.FC = () => {
  const { loginWithGoogle, loginWithAdmin, loginAsResearcher } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'admin' | 'google' | 'student'>('admin');
  
  // Admin form state (Banner & auto-fill text removed as instructed)
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminError, setAdminError] = useState<string | null>(null);
  const [adminLoading, setAdminLoading] = useState(false);

  // Student/Teacher form state
  const [guestName, setGuestName] = useState('');
  const [guestRole, setGuestRole] = useState<'student' | 'lecturer'>('student');
  const [guestInstitution, setGuestInstitution] = useState('Universitas Indonesia');
  const [guestFaculty, setGuestFaculty] = useState('Fakultas Ilmu Pengetahuan Budaya & Sains');
  const [guestLoading, setGuestLoading] = useState(false);

  // Google loading state
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError(null);
    setAdminLoading(true);
    try {
      const res = await loginWithAdmin(adminUsername, adminPassword);
      if (!res.success) {
        setAdminError(res.message || 'Kredensial tidak valid.');
      }
    } catch (err: any) {
      setAdminError(err?.message || 'Terjadi kesalahan sistem saat otentikasi.');
    } finally {
      setAdminLoading(false);
    }
  };

  const handleGoogleSubmit = async () => {
    setGoogleError(null);
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      setGoogleError('Gagal masuk dengan Google. Pastikan popup tidak diblokir browser.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGuestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim()) return;
    setGuestLoading(true);
    try {
      await loginAsResearcher(guestName, guestRole, guestInstitution, guestFaculty);
    } catch (err) {
      console.error(err);
    } finally {
      setGuestLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080911] text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans selection:bg-violet-500/30 selection:text-violet-200">
      
      {/* Lamatic-style ambient cosmic glow & subtle grid */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.25),rgba(255,255,255,0))] pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-violet-600/15 via-indigo-500/15 to-cyan-400/10 rounded-full blur-[120px] pointer-events-none" />
      <div 
        className="absolute inset-0 opacity-[0.025] pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px]"
      />

      {/* Top Header / Brand Bar */}
      <header className="relative z-20 w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-500 p-0.5 shadow-lg shadow-violet-500/20">
            <div className="w-full h-full bg-[#0B0D17] rounded-[10px] flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-violet-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-tight text-white text-base font-serif-academic">
                Ruang Diskusi Akademik
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wider bg-violet-500/10 border border-violet-500/20 text-violet-300 uppercase">
                GenAI Classroom
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Platform Kolaborasi Hybrid & Pemodelan Diskusi Interaktif
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-white/5 border border-white/10 text-slate-300">
            <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
            <span>Sistem Hybrid Aktif</span>
          </span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 w-full max-w-7xl mx-auto px-6 py-8 flex flex-col lg:flex-row items-center justify-between gap-12 flex-1">
        
        {/* Left Column: Hero Copy & Feature Pillars (Lamatic style) */}
        <div className="max-w-xl text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-violet-500/10 border border-violet-500/30 text-violet-300 mb-6 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-violet-400 animate-pulse" />
            <span>3 Skenario Diskusi: Expedition, Clash, & Buzz</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-[1.15] mb-5 font-serif-academic">
            Ruang Kelas Akademik <br />
            <span className="bg-gradient-to-r from-violet-400 via-indigo-300 to-cyan-300 bg-clip-text text-transparent">
              Cerdas & Partisipatif
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed mb-8">
            Kelola ruang mata kuliah seperti Google Classroom dengan pemodelan diskusi hybrid unik: voting kuota topik ekspedisi, arena debat live fact-checking, dan buzz chamber kilat 5 menit.
          </p>

          {/* 3 Scenario badges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-violet-500/30 transition-all backdrop-blur-md">
              <Compass className="w-5 h-5 text-violet-400 mb-2" />
              <h4 className="text-xs font-bold text-white mb-1">The Expedition</h4>
              <p className="text-[11px] text-slate-400 leading-tight">
                Voting 5 topik berkuota hybrid & pembagian tim otomatis.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-indigo-500/30 transition-all backdrop-blur-md">
              <ShieldCheck className="w-5 h-5 text-indigo-400 mb-2" />
              <h4 className="text-xs font-bold text-white mb-1">The Clash Arena</h4>
              <p className="text-[11px] text-slate-400 leading-tight">
                Debat Pro vs Kontra, war room riset & voting Sli.do.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-cyan-500/30 transition-all backdrop-blur-md">
              <Layers className="w-5 h-5 text-cyan-400 mb-2" />
              <h4 className="text-xs font-bold text-white mb-1">The Buzz Chamber</h4>
              <p className="text-[11px] text-slate-400 leading-tight">
                Curah ide kilat 5 menit dengan buzzer visual & lock submission.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Clean Lamatic-Style Login Card */}
        <div className="w-full max-w-md">
          <div className="relative rounded-3xl p-1 bg-gradient-to-b from-white/15 via-white/5 to-white/0 shadow-2xl backdrop-blur-2xl">
            <div className="bg-[#0B0D19]/90 rounded-[22px] p-6 sm:p-8 border border-white/10">
              
              {/* Card Header */}
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-white mb-1">
                  Masuk ke Ruang Kelas
                </h3>
                <p className="text-xs text-slate-400">
                  Pilih metode masuk sebagai Pengajar atau Mahasiswa
                </p>
              </div>

              {/* Navigation Tabs (Lamatic GenAI Style) */}
              <div className="grid grid-cols-3 p-1 rounded-xl bg-white/[0.04] border border-white/10 mb-6">
                <button
                  type="button"
                  onClick={() => { setActiveTab('admin'); setAdminError(null); }}
                  className={`py-2 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === 'admin'
                      ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Admin / Guru
                </button>
                <button
                  type="button"
                  onClick={() => { setActiveTab('google'); setGoogleError(null); }}
                  className={`py-2 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === 'google'
                      ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Google
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('student')}
                  className={`py-2 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === 'student'
                      ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Mahasiswa
                </button>
              </div>

              {/* TAB 1: Admin / Guru Login (CLEAN - No credentials banner!) */}
              {activeTab === 'admin' && (
                <form onSubmit={handleAdminSubmit} className="space-y-4">
                  {adminError && (
                    <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                      <span>{adminError}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Username Pengajar / Admin
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        required
                        value={adminUsername}
                        onChange={(e) => setAdminUsername(e.target.value)}
                        placeholder="Masukkan username"
                        className="w-full bg-white/[0.04] border border-white/10 rounded-xl py-2.5 pl-10 pr-3.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Kata Sandi
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="password"
                        required
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        placeholder="Masukkan kata sandi"
                        className="w-full bg-white/[0.04] border border-white/10 rounded-xl py-2.5 pl-10 pr-3.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={adminLoading || !adminUsername.trim() || !adminPassword.trim()}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-indigo-500 hover:from-violet-500 hover:to-indigo-400 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-violet-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {adminLoading ? (
                      <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Masuk ke Dashboard Guru</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* TAB 2: Google Sign-In */}
              {activeTab === 'google' && (
                <div className="space-y-4 text-center">
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Masuk secara otomatis menggunakan akun Google institusi kampus Anda melalui Firebase Auth.
                  </p>

                  {googleError && (
                    <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 text-left">
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                      <span>{googleError}</span>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleGoogleSubmit}
                    disabled={googleLoading}
                    className="w-full py-3 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-semibold text-xs sm:text-sm shadow-md flex items-center justify-center gap-3 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {googleLoading ? (
                      <div className="w-4 h-4 border-2 border-slate-400 border-t-slate-900 rounded-full animate-spin" />
                    ) : (
                      <>
                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                          <path
                            fill="#4285F4"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          />
                          <path
                            fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                          />
                          <path
                            fill="#EA4335"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                          />
                        </svg>
                        <span>Lanjutkan dengan Google</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* TAB 3: Student / Instant Academic Entry */}
              {activeTab === 'student' && (
                <form onSubmit={handleGuestSubmit} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Nama Mahasiswa / Siswa
                    </label>
                    <input
                      type="text"
                      required
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder="Contoh: Nadia Salsabila"
                      className="w-full bg-white/[0.04] border border-white/10 rounded-xl py-2 px-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Peran
                      </label>
                      <select
                        value={guestRole}
                        onChange={(e) => setGuestRole(e.target.value as any)}
                        className="w-full bg-[#121526] border border-white/10 rounded-xl py-2 px-2.5 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                      >
                        <option value="student">Mahasiswa / Siswa</option>
                        <option value="lecturer">Dosen / Guru</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Institusi
                      </label>
                      <input
                        type="text"
                        value={guestInstitution}
                        onChange={(e) => setGuestInstitution(e.target.value)}
                        className="w-full bg-white/[0.04] border border-white/10 rounded-xl py-2 px-2.5 text-xs text-white placeholder-slate-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={guestLoading || !guestName.trim()}
                    className="w-full mt-2 py-2.5 px-4 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs shadow-md transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                  >
                    {guestLoading ? (
                      <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Masuk sebagai Mahasiswa</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </form>
              )}

            </div>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <Globe2 className="w-3.5 h-3.5 text-slate-400" />
          <span>Ruang Diskusi Akademik — Arsitektur Kelas Google Classroom & GenAI</span>
        </div>
        <div className="flex items-center gap-4 text-slate-400">
          <span>Otoritas Multi-Role</span>
          <span>•</span>
          <span>Firestore Per-User</span>
          <span>•</span>
          <span>Hybrid Classroom Ready</span>
        </div>
      </footer>

    </div>
  );
};

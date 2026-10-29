import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Sparkles, 
  Lock, 
  User, 
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  GraduationCap,
  Globe2,
  Radio,
  Compass,
  Layers,
  HeartHandshake,
  BookOpen
} from 'lucide-react';

export const LoginView: React.FC = () => {
  const { loginWithGoogle, loginWithAdmin, loginAsResearcher } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'admin' | 'google' | 'student'>('admin');
  
  // Admin form state (NO credentials banner or auto-fill text as instructed)
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
        setAdminError(res.message || 'Username atau kata sandi tidak cocok.');
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
      setGoogleError('Gagal masuk dengan Google. Pastikan izin popup peramban aktif.');
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
    <div className="min-h-screen bg-[#FAF8F5] text-slate-800 flex flex-col justify-between relative overflow-hidden font-sans selection:bg-[#FF5B37]/20 selection:text-[#FF5B37]">
      
      {/* ToyStore subtle background decorations: soft pastel blobs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#FFE7D6] rounded-full blur-3xl opacity-60 pointer-events-none" />
      <div className="absolute top-1/3 -right-24 w-80 h-80 bg-[#E0F2FE] rounded-full blur-3xl opacity-60 pointer-events-none" />
      <div className="absolute -bottom-24 left-1/4 w-96 h-96 bg-[#FEF3C7] rounded-full blur-3xl opacity-50 pointer-events-none" />

      {/* Top Navbar / ToyStore Warm Header */}
      <header className="relative z-20 w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#FF5B37] text-white flex items-center justify-center shadow-lg shadow-[#FF5B37]/25 transform -rotate-2 hover:rotate-0 transition-transform">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-tight text-slate-900 text-lg sm:text-xl font-serif-academic">
                Ruang Diskusi Akademik
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#FFEDE7] text-[#FF5B37]">
                Kelas Hybrid
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Platform Kolaborasi Belajar & Diskusi Interaktif
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2.5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Sesi Kelas Aktif</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 sm:py-10 flex flex-col lg:flex-row items-center justify-between gap-12 flex-1">
        
        {/* Left Column: ToyStore Friendly Hero Presentation */}
        <div className="max-w-xl text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#FFF4ED] text-[#FF5B37] border border-[#FFD9C7] mb-5 shadow-xs">
            <Sparkles className="w-4 h-4 text-[#FF5B37]" />
            <span>3 Mode Diskusi Terintegrasi (Expedition, Clash, Buzz)</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 leading-[1.2] mb-5 font-serif-academic">
            Belajar Bersama Jadi <br />
            <span className="text-[#FF5B37] relative inline-block">
              Lebih Hidup & Seru
              <svg className="absolute -bottom-2 left-0 w-full" height="8" viewBox="0 0 200 8" fill="none">
                <path d="M1 5.5C50 2 150 2 199 5.5" stroke="#F59E0B" strokeWidth="4" strokeLinecap="round" />
              </svg>
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed mb-8 font-normal">
            Selamat datang di portal akademik interaktif. Pengajar dapat mengelola materi, mengatur kuota topik ekspedisi, memandu arena debat sengit, dan memicu curah gagasan cepat 5 menit.
          </p>

          {/* 3 Scenario Cards in ToyStore Retail Style */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
            
            {/* 1. The Expedition */}
            <div className="p-4 rounded-2xl bg-white border border-[#EFE9E1] shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all">
              <div className="w-9 h-9 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center mb-3">
                <Compass className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 mb-1 font-serif-academic">The Expedition</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Pemilihan 5 tema dengan kuota hybrid (offline/online) & meja kolaborasi.
              </p>
            </div>

            {/* 2. The Clash Arena */}
            <div className="p-4 rounded-2xl bg-white border border-[#EFE9E1] shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all">
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-3">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 mb-1 font-serif-academic">The Clash Arena</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Debat Pro vs Kontra, War Room daring & barometer sentimen langsung.
              </p>
            </div>

            {/* 3. The Buzz Chamber */}
            <div className="p-4 rounded-2xl bg-white border border-[#EFE9E1] shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all">
              <div className="w-9 h-9 rounded-xl bg-rose-100 text-[#FF5B37] flex items-center justify-center mb-3">
                <Layers className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 mb-1 font-serif-academic">The Buzz Chamber</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Curah ide kilat 5 menit dengan lonceng buzzer & sintesis berkelompok.
              </p>
            </div>

          </div>
        </div>

        {/* Right Column: Clean ToyStore Login Box */}
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EFE9E1] shadow-xl shadow-slate-200/50">
            
            {/* Form Title */}
            <div className="text-center mb-6">
              <h3 className="text-2xl font-black text-slate-900 font-serif-academic mb-1.5">
                Masuk ke Kelas
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                Pilih akses masuk sebagai Pengajar atau Mahasiswa
              </p>
            </div>

            {/* Pill Tabs in ToyStore Style */}
            <div className="grid grid-cols-3 p-1.5 rounded-2xl bg-[#F5F2EB] mb-6">
              <button
                type="button"
                onClick={() => { setActiveTab('admin'); setAdminError(null); }}
                className={`py-2 px-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeTab === 'admin'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Guru / Admin
              </button>
              <button
                type="button"
                onClick={() => { setActiveTab('google'); setGoogleError(null); }}
                className={`py-2 px-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeTab === 'google'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Google
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('student')}
                className={`py-2 px-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeTab === 'student'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Mahasiswa
              </button>
            </div>

            {/* TAB 1: Guru / Admin Login */}
            {activeTab === 'admin' && (
              <form onSubmit={handleAdminSubmit} className="space-y-4">
                {adminError && (
                  <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm flex items-center gap-2.5">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                    <span>{adminError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1.5">
                    Username Pengajar
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      required
                      value={adminUsername}
                      onChange={(e) => setAdminUsername(e.target.value)}
                      placeholder="Masukkan username"
                      className="w-full bg-[#FAF8F5] border border-[#E5DFD5] rounded-2xl py-3 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FF5B37]/30 focus:border-[#FF5B37] transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1.5">
                    Kata Sandi
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="password"
                      required
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="Masukkan kata sandi"
                      className="w-full bg-[#FAF8F5] border border-[#E5DFD5] rounded-2xl py-3 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FF5B37]/30 focus:border-[#FF5B37] transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={adminLoading || !adminUsername.trim() || !adminPassword.trim()}
                  className="w-full py-3.5 px-5 rounded-2xl bg-[#FF5B37] hover:bg-[#E84E2C] text-white font-bold text-sm shadow-md shadow-[#FF5B37]/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer mt-2"
                >
                  {adminLoading ? (
                    <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Masuk ke Dashboard Guru</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* TAB 2: Google Sign-in */}
            {activeTab === 'google' && (
              <div className="space-y-4 text-center">
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Gunakan akun Google institusi pendidikan Anda untuk masuk dan menyinkronkan aktivitas kelas melalui Firebase Auth.
                </p>

                {googleError && (
                  <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm flex items-center gap-2.5 text-left">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                    <span>{googleError}</span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleGoogleSubmit}
                  disabled={googleLoading}
                  className="w-full py-3.5 px-5 rounded-2xl bg-white hover:bg-slate-50 border border-[#E5DFD5] text-slate-800 font-bold text-sm shadow-sm flex items-center justify-center gap-3 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {googleLoading ? (
                    <div className="w-5 h-5 border-2 border-slate-400 border-t-slate-800 rounded-full animate-spin" />
                  ) : (
                    <>
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
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

            {/* TAB 3: Student Entry */}
            {activeTab === 'student' && (
              <form onSubmit={handleGuestSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1">
                    Nama Lengkap Siswa / Mahasiswa
                  </label>
                  <input
                    type="text"
                    required
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="Contoh: Farhan Alamsyah"
                    className="w-full bg-[#FAF8F5] border border-[#E5DFD5] rounded-2xl py-3 px-3.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FF5B37]/30 focus:border-[#FF5B37]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Peran di Kelas
                    </label>
                    <select
                      value={guestRole}
                      onChange={(e) => setGuestRole(e.target.value as any)}
                      className="w-full bg-[#FAF8F5] border border-[#E5DFD5] rounded-2xl py-2.5 px-3 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FF5B37]/30"
                    >
                      <option value="student">Mahasiswa / Siswa</option>
                      <option value="lecturer">Dosen / Guru</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Institusi / Kampus
                    </label>
                    <input
                      type="text"
                      value={guestInstitution}
                      onChange={(e) => setGuestInstitution(e.target.value)}
                      className="w-full bg-[#FAF8F5] border border-[#E5DFD5] rounded-2xl py-2.5 px-3 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FF5B37]/30"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={guestLoading || !guestName.trim()}
                  className="w-full mt-2 py-3.5 px-5 rounded-2xl bg-[#FF5B37] hover:bg-[#E84E2C] text-white font-bold text-sm shadow-md shadow-[#FF5B37]/25 transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                >
                  {guestLoading ? (
                    <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Masuk ke Ruang Kelas</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

          </div>
        </div>

      </main>

      {/* ToyStore Clean Footer */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 border-t border-[#EFE9E1] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-2 font-medium">
          <Globe2 className="w-4 h-4 text-[#FF5B37]" />
          <span>Ruang Diskusi Akademik — Format Google Classroom & Hybrid Scenarios</span>
        </div>
        <div className="flex items-center gap-3 text-slate-500 font-semibold">
          <span>Hak Akses Multi-Peran</span>
          <span>•</span>
          <span>Firestore Aman Per-User</span>
          <span>•</span>
          <span>Siap Deploy Vercel</span>
        </div>
      </footer>

    </div>
  );
};

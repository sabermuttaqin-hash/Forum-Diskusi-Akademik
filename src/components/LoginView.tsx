import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  GraduationCap, 
  ShieldCheck, 
  BookOpen, 
  Sparkles, 
  Lock, 
  User, 
  Building2, 
  AlertCircle,
  LogIn,
  CheckCircle2,
  Cpu
} from 'lucide-react';

export const LoginView: React.FC = () => {
  const { loginWithGoogle, loginWithAdmin, loginAsResearcher } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'admin' | 'google' | 'guest'>('admin');
  
  // Admin form state
  const [adminUsername, setAdminUsername] = useState('SnowPrince');
  const [adminPassword, setAdminPassword] = useState('Mahasiswa890');
  const [adminError, setAdminError] = useState<string | null>(null);
  const [adminLoading, setAdminLoading] = useState(false);

  // Guest/Researcher form state
  const [guestName, setGuestName] = useState('');
  const [guestRole, setGuestRole] = useState<'student' | 'researcher' | 'lecturer'>('student');
  const [guestInstitution, setGuestInstitution] = useState('Universitas Indonesia');
  const [guestFaculty, setGuestFaculty] = useState('Fakultas Sains & Teknologi');
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
        setAdminError(res.message || 'Login gagal.');
      }
    } catch (err: any) {
      setAdminError(err?.message || 'Terjadi kesalahan sistem saat login.');
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
      setGoogleError('Gagal masuk dengan Google. Pastikan popup tidak diblokir atau gunakan login akun di tab lainnya.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGuestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim()) {
      return;
    }
    setGuestLoading(true);
    try {
      await loginAsResearcher(guestName, guestRole, guestInstitution, guestFaculty);
    } catch (err) {
      console.error(err);
    } finally {
      setGuestLoading(false);
    }
  };

  const fillAdminCredentials = () => {
    setAdminUsername('SnowPrince');
    setAdminPassword('Mahasiswa890');
    setAdminError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-slate-100 flex flex-col justify-center items-center px-4 py-8 relative overflow-hidden">
      {/* Decorative background illumination */}
      <div className="absolute top-0 -left-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 -right-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      
      {/* Academic Crest & Header */}
      <div className="w-full max-w-md text-center mb-6 z-10">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-indigo-500/10 border border-indigo-400/30 text-indigo-300 shadow-xl mb-4 backdrop-blur-md">
          <GraduationCap className="w-10 h-10 text-indigo-400" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2 font-serif-academic">
          Ruang Diskusi Akademik
        </h1>
        <p className="text-xs tracking-widest uppercase font-semibold text-indigo-300/80 mb-1">
          Veritas • Scientia • Investigatio
        </p>
        <p className="text-sm text-slate-400 max-w-sm mx-auto">
          Portal pertukaran pemikiran ilmiah, verifikasi metodologi, dan telaah sejawat bertenaga Gemini AI.
        </p>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-xl border border-slate-700/60 rounded-2xl shadow-2xl overflow-hidden z-10">
        {/* Navigation Tabs */}
        <div className="grid grid-cols-3 border-b border-slate-800 bg-slate-950/40 p-1">
          <button
            type="button"
            onClick={() => setActiveTab('admin')}
            className={`py-2.5 px-3 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'admin'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
            <span>Admin</span>
          </button>
          
          <button
            type="button"
            onClick={() => setActiveTab('google')}
            className={`py-2.5 px-3 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'google'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Google Auth</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('guest')}
            className={`py-2.5 px-3 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'guest'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Akademisi</span>
          </button>
        </div>

        {/* Tab 1: Admin Login (SnowPrince / Mahasiswa890) */}
        {activeTab === 'admin' && (
          <div className="p-6">
            <div className="mb-4 bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 text-xs text-amber-200 flex items-start gap-2.5">
              <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-300 mb-0.5">Kredensial Resmi Admin:</p>
                <p className="text-slate-300">
                  Username: <strong className="text-white font-mono">SnowPrince</strong> | Sandi: <strong className="text-white font-mono">Mahasiswa890</strong>
                </p>
                <button
                  type="button"
                  onClick={fillAdminCredentials}
                  className="mt-2 text-xs font-medium text-amber-300 hover:text-amber-200 underline flex items-center gap-1"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Isi Otomatis Kredensial Admin
                </button>
              </div>
            </div>

            {adminError && (
              <div className="mb-4 bg-rose-500/10 border border-rose-500/30 rounded-xl p-3 text-xs text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{adminError}</span>
              </div>
            )}

            <form onSubmit={handleAdminSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Username Admin
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={adminUsername}
                    onChange={(e) => setAdminUsername(e.target.value)}
                    placeholder="Contoh: SnowPrince"
                    className="w-full bg-slate-950/60 border border-slate-700 rounded-xl py-2.5 pl-10 pr-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="Masukkan sandi admin"
                    className="w-full bg-slate-950/60 border border-slate-700 rounded-xl py-2.5 pl-10 pr-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={adminLoading}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-medium text-sm rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {adminLoading ? (
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Masuk sebagai Administrator</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* Tab 2: Google Sign-In */}
        {activeTab === 'google' && (
          <div className="p-6 text-center">
            <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white">
              <svg className="w-6 h-6" viewBox="0 0 24 24">
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
            </div>

            <h3 className="text-base font-semibold text-white mb-1">
              Autentikasi Firebase Google
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Masuk aman menggunakan akun Google institusi kampus atau akun pribadi Anda.
            </p>

            {googleError && (
              <div className="mb-4 bg-rose-500/10 border border-rose-500/30 rounded-xl p-3 text-xs text-rose-300 flex items-center gap-2 text-left">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{googleError}</span>
              </div>
            )}

            <button
              type="button"
              onClick={handleGoogleSubmit}
              disabled={googleLoading}
              className="w-full py-3 px-4 bg-white hover:bg-slate-100 text-slate-900 font-medium text-sm rounded-xl shadow-lg flex items-center justify-center gap-3 transition-all disabled:opacity-50"
            >
              {googleLoading ? (
                <div className="w-4 h-4 border-2 border-slate-400 border-t-slate-800 rounded-full animate-spin" />
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
                  <span>Masuk dengan Google</span>
                </>
              )}
            </button>

            <p className="text-[11px] text-slate-500 mt-4">
              Data profil Anda disinkronkan secara aman ke database Firestore per-pengguna.
            </p>
          </div>
        )}

        {/* Tab 3: Guest / Custom Academic Profile */}
        {activeTab === 'guest' && (
          <div className="p-6">
            <p className="text-xs text-slate-400 mb-4">
              Masuk cepat untuk mahasiswa, dosen, atau peneliti tamu untuk mulai berdiskusi:
            </p>

            <form onSubmit={handleGuestSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Nama Lengkap & Gelar (jika ada)
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="Contoh: Rahmat Hidayat, S.Si."
                    className="w-full bg-slate-950/60 border border-slate-700 rounded-xl py-2 pl-10 pr-3.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Peran Akademik
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'student', label: 'Mahasiswa' },
                    { id: 'researcher', label: 'Peneliti' },
                    { id: 'lecturer', label: 'Dosen' },
                  ].map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setGuestRole(r.id as any)}
                      className={`py-2 px-2 rounded-xl text-xs font-medium border text-center transition-all ${
                        guestRole === r.id
                          ? 'bg-indigo-600/30 border-indigo-500 text-indigo-300'
                          : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Nama Universitas / Lembaga Riset
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={guestInstitution}
                    onChange={(e) => setGuestInstitution(e.target.value)}
                    placeholder="Contoh: Universitas Gadjah Mada"
                    className="w-full bg-slate-950/60 border border-slate-700 rounded-xl py-2 pl-10 pr-3.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Fakultas / Program Studi
                </label>
                <input
                  type="text"
                  required
                  value={guestFaculty}
                  onChange={(e) => setGuestFaculty(e.target.value)}
                  placeholder="Contoh: Ilmu Komputer & Sains Data"
                  className="w-full bg-slate-950/60 border border-slate-700 rounded-xl py-2 px-3.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <button
                type="submit"
                disabled={guestLoading || !guestName.trim()}
                className="w-full mt-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {guestLoading ? (
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <BookOpen className="w-4 h-4" />
                    <span>Masuk ke Ruang Diskusi</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Feature highlights footer */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Firestore Secured Per-User</span>
        </div>
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-indigo-400" />
          <span>Server-Side Gemini API</span>
        </div>
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>AI Peer Reviewer & Sitasi</span>
        </div>
      </div>
    </div>
  );
};

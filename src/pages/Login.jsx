import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Eye, EyeOff, AlertCircle, Sparkles, X, ChevronDown, Sun, Moon, ArrowRight } from 'lucide-react';
import { FALLBACK_CHANGELOGS } from './Changelog';
import { KjBrandLockup } from '../components/Brand/KasiJadiIcons';

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showChangelog, setShowChangelog] = useState(false);
  const [showDemo, setShowDemo] = useState(false);

  const { login } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.password) {
      setError('Username dan password wajib diisi');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await login(form.username, form.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Login gagal. Periksa username dan password Anda.');
    } finally {
      setLoading(false);
    }
  };

  const demoUsers = [
    { username: 'admin', label: 'KPA / Admin', tag: 'KPA' },
    { username: 'kasubbag', label: 'Kasubbag', tag: 'Penilai' },
    { username: 'budi', label: 'Budi Santoso', tag: 'Pegawai' },
    { username: 'sari', label: 'Sari Dewi', tag: 'Pegawai' },
  ];

  return (
    <div className="min-h-screen bg-[#F4F6F9] dark:bg-[#0B1120] flex flex-col justify-between p-4 sm:p-6 relative overflow-hidden">
      {/* Left & Right Geometric Tenun Borders */}
      <div className="hidden md:block fixed left-2 top-0 bottom-0 w-5 kj-tenun-v opacity-20 pointer-events-none" />
      <div className="hidden md:block fixed right-2 top-0 bottom-0 w-5 kj-tenun-v opacity-20 pointer-events-none" />

      {/* Top Utility Bar */}
      <div className="relative z-10 w-full max-w-5xl mx-auto flex items-center justify-between">
        <KjBrandLockup logoSize="w-9 h-9" />

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowChangelog(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border-2 border-[#1E293B] dark:border-slate-400 bg-white dark:bg-[#1E293B] hover:bg-[#F4F6F9] dark:hover:bg-slate-800 text-xs font-bold text-[#1E293B] dark:text-slate-100 shadow-[2px_2px_0px_#1E293B] dark:shadow-[2px_2px_0px_#020617] hover:-translate-y-0.5 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#FF6B35]" />
            <span>Changelog</span>
            <span className="font-mono text-[10px] text-[#0052FF] dark:text-[#00B4D8]">v1.4</span>
          </button>

          <button
            type="button"
            onClick={toggleTheme}
            aria-label={isDark ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
            className="btn-icon"
          >
            {isDark ? <Sun className="w-4 h-4 text-[#FF6B35]" /> : <Moon className="w-4 h-4 text-[#1E293B]" />}
          </button>
        </div>
      </div>

      {/* Main Centered Login Card */}
      <div className="relative z-10 w-full max-w-[430px] mx-auto my-8">
        <div className="card overflow-hidden animate-fade-in-up">
          <div className="h-3.5 kj-tenun-h opacity-25 border-b-2 border-[#1E293B] dark:border-slate-500" />
          <div className="p-6 sm:p-8">
            {/* Brand Title */}
            <div className="mb-6">
              <span className="inline-block font-mono text-[10.5px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#00B4D8]/15 text-[#007a94] dark:bg-[#00B4D8]/25 dark:text-[#67e8f9] border-[1.5px] border-[#1E293B] dark:border-slate-400 mb-3">
                Kanal Sistem Jurnal Aktivitas Dan Kinerja
              </span>
              <h1 className="text-2xl font-extrabold text-[#1E293B] dark:text-white tracking-tight">
                Masuk ke KASI <span className="text-[#0052FF] dark:text-[#00B4D8]">JADI</span>
              </h1>
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 mt-1">
                Kasi Jadi Hari Ini, Sat-Set No Drama!
              </p>
            </div>

            {error && (
              <div className="flex items-start gap-2.5 p-3 bg-rose-50 dark:bg-rose-950/60 border-2 border-[#1E293B] dark:border-rose-400 rounded-xl text-rose-700 dark:text-rose-200 text-xs font-semibold mb-5 shadow-[2px_2px_0px_#1E293B]">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="form-group">
                <label className="label" htmlFor="login-username">Username</label>
                <input
                  className="input py-2.5"
                  type="text"
                  placeholder="Masukkan username"
                  value={form.username}
                  onChange={e => setForm({ ...form, username: e.target.value })}
                  autoComplete="username"
                  id="login-username"
                />
              </div>

              <div className="form-group">
                <label className="label" htmlFor="login-password">Password</label>
                <div className="relative">
                  <input
                    className="input py-2.5 pr-10"
                    type={showPass ? 'text' : 'password'}
                    placeholder="Masukkan password"
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    autoComplete="current-password"
                    id="login-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    aria-label="Tampilkan password"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-[#1E293B] dark:hover:text-white transition-colors"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-orange w-full py-3 mt-2 text-sm"
                id="login-submit"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    <span>Memproses...</span>
                  </>
                ) : (
                  <>
                    <span>GAS MASUK!</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Collapsible Demo Accounts */}
            <div className="mt-6 pt-5 border-t-2 border-dashed border-slate-300 dark:border-slate-600">
              <button
                type="button"
                onClick={() => setShowDemo(!showDemo)}
                className="w-full flex items-center justify-between text-xs font-bold text-[#1E293B] dark:text-slate-200 hover:text-[#0052FF] dark:hover:text-[#00B4D8] transition-colors"
              >
                <span>Akses Akun Demo (Uji Coba)</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-150 ${showDemo ? 'rotate-180' : ''}`} />
              </button>

              {showDemo && (
                <div className="mt-3 space-y-2.5 animate-fade-in">
                  <div className="grid grid-cols-2 gap-2.5">
                    {demoUsers.map(u => (
                      <button
                        key={u.username}
                        type="button"
                        onClick={() => setForm({ username: u.username, password: 'password123' })}
                        className="text-left p-2.5 rounded-xl border-2 border-[#1E293B] dark:border-slate-500 bg-[#F4F6F9] dark:bg-slate-800 hover:bg-white dark:hover:bg-slate-700 shadow-[2px_2px_0px_#1E293B] dark:shadow-[2px_2px_0px_#020617] hover:-translate-y-0.5 transition-all"
                      >
                        <div className="flex items-center justify-between gap-1">
                          <p className="text-xs font-extrabold text-[#1E293B] dark:text-white truncate">{u.label}</p>
                          <span className="font-mono text-[10px] font-bold text-[#0052FF] dark:text-[#00B4D8]">{u.tag}</span>
                        </div>
                        <p className="font-mono text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">@{u.username}</p>
                      </button>
                    ))}
                  </div>
                  <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 text-center">
                    Password default: <code className="font-mono text-[#1E293B] dark:text-white">password123</code>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 text-center text-xs font-semibold text-slate-500 dark:text-slate-400">
        © 2026 KASI JADI · Kanal Sistem Jurnal Aktivitas Dan Kinerja
      </footer>

      {/* Modal Changelog Publik */}
      {showChangelog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/65 backdrop-blur-[2px] animate-fade-in" onClick={() => setShowChangelog(false)} />
          <div className="relative bg-white dark:bg-[#1E293B] border-2 border-[#1E293B] dark:border-slate-400 rounded-2xl shadow-[6px_8px_0px_#1E293B] dark:shadow-[6px_8px_0px_#020617] w-full max-w-xl max-h-[85vh] flex flex-col overflow-hidden animate-fade-in-up">
            <div className="px-5 py-4 border-b-2 border-[#1E293B] dark:border-slate-500 flex items-center justify-between bg-[#F4F6F9] dark:bg-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#0052FF] border-2 border-[#1E293B] flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-[#1E293B] dark:text-white">Riwayat Pembaruan Sistem</h3>
                  <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400">KASI JADI · Web &amp; Mobile</p>
                </div>
              </div>
              <button
                type="button"
                aria-label="Tutup"
                onClick={() => setShowChangelog(false)}
                className="btn-icon p-1.5"
              >
                <X className="w-4 h-4 text-[#1E293B] dark:text-slate-100" />
              </button>
            </div>
            <div className="p-5 overflow-y-auto space-y-4">
              {FALLBACK_CHANGELOGS.map((rel, idx) => (
                <div key={rel.versi} className="border-2 border-[#1E293B] dark:border-slate-500 rounded-xl overflow-hidden shadow-[2px_3px_0px_#1E293B] dark:shadow-[2px_3px_0px_#020617]">
                  <div className="px-4 py-3 bg-[#F4F6F9] dark:bg-slate-800 border-b-2 border-[#1E293B] dark:border-slate-500 space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`font-mono px-2.5 py-0.5 rounded-full border-[1.5px] border-[#1E293B] text-xs font-bold ${
                        idx === 0
                          ? 'bg-[#0052FF] text-white'
                          : 'bg-white text-[#1E293B] dark:bg-slate-700 dark:text-slate-100'
                      }`}>
                        {rel.versi}
                      </span>
                      <span className="font-mono text-[11px] font-bold text-slate-500 dark:text-slate-400 flex-shrink-0">{rel.tanggal}</span>
                    </div>
                    <h4 className="font-bold text-xs sm:text-sm text-[#1E293B] dark:text-white leading-snug">{rel.judul}</h4>
                  </div>
                  <div className="p-4 space-y-2.5 bg-white dark:bg-[#1E293B]">
                    {rel.perubahan.map((item, i) => (
                      <div key={i} className="text-xs text-[#1E293B] dark:text-slate-200 flex items-start gap-2.5 leading-relaxed">
                        <span className="px-2 py-0.5 rounded-full bg-[#00B4D8]/15 text-[#007a94] dark:text-[#67e8f9] border border-[#1E293B] dark:border-slate-400 font-bold text-[10px] flex-shrink-0 mt-0.5">
                          {item.kategori}
                        </span>
                        <span>{item.deskripsi}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

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
      setError('Username dan password wajib diisi.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await login(form.username, form.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Login gagal. Periksa kembali username dan password Anda.');
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
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] flex flex-col justify-between p-4 sm:p-6 relative">
      {/* Top Utility Bar */}
      <div className="w-full max-w-5xl mx-auto flex items-center justify-between">
        <KjBrandLockup logoSize="w-9 h-9" />

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowChangelog(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#111827] hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-sm transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#0052FF] dark:text-[#38BDF8]" />
            <span>Changelog</span>
            <span className="tabular-num text-[10.5px] font-bold text-[#0052FF] dark:text-[#38BDF8]">v1.4</span>
          </button>

          <button
            type="button"
            onClick={toggleTheme}
            aria-label={isDark ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
            className="btn-icon"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>
        </div>
      </div>

      {/* Main Centered Login Card */}
      <div className="w-full max-w-[430px] mx-auto my-8">
        <div className="card overflow-hidden animate-fade-in-up shadow-elevated">
          <div className="h-1 bg-gradient-to-r from-[#0052FF] via-[#0D9488] to-[#0052FF]" />
          <div className="p-6 sm:p-8">
            {/* Brand Title */}
            <div className="mb-6">
              <span className="inline-block text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-md bg-blue-50 text-[#0052FF] dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800/70 mb-3">
                Kanal Sistem Jurnal Aktivitas Dan Kinerja
              </span>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                Masuk ke KASI <span className="text-[#0052FF] dark:text-[#38BDF8]">JADI</span>
              </h1>
              <p className="text-sm font-normal text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                Sistem pencatatan jurnal aktivitas harian, dokumentasi bukti dukung, dan evaluasi capaian kinerja pegawai.
              </p>
            </div>

            {error && (
              <div className="flex items-start gap-2.5 p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-lg text-rose-700 dark:text-rose-200 text-xs font-medium mb-5">
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
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-2.5 mt-2 text-sm"
                id="login-submit"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    <span>Memproses...</span>
                  </>
                ) : (
                  <>
                    <span>Masuk</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Collapsible Demo Accounts */}
            <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowDemo(!showDemo)}
                className="w-full flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-[#0052FF] dark:hover:text-[#38BDF8] transition-colors"
              >
                <span>Akses Akun Demo (Uji Coba)</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-150 ${showDemo ? 'rotate-180' : ''}`} />
              </button>

              {showDemo && (
                <div className="mt-3 space-y-2.5 animate-fade-in">
                  <div className="grid grid-cols-2 gap-2">
                    {demoUsers.map(u => (
                      <button
                        key={u.username}
                        type="button"
                        onClick={() => setForm({ username: u.username, password: 'password123' })}
                        className="text-left p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 hover:border-[#0052FF] dark:hover:border-[#38BDF8] hover:bg-white dark:hover:bg-slate-800 transition-all"
                      >
                        <div className="flex items-center justify-between gap-1">
                          <p className="text-xs font-semibold text-slate-800 dark:text-white truncate">{u.label}</p>
                          <span className="text-[10px] font-semibold text-[#0052FF] dark:text-[#38BDF8]">{u.tag}</span>
                        </div>
                        <p className="tabular-num text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">@{u.username}</p>
                      </button>
                    ))}
                  </div>
                  <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 text-center">
                    Password default: <span className="font-semibold text-slate-700 dark:text-slate-200">password123</span>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center text-xs font-medium text-slate-500 dark:text-slate-400">
        © 2026 KASI JADI · Kanal Sistem Jurnal Aktivitas Dan Kinerja
      </footer>

      {/* Modal Changelog Publik */}
      {showChangelog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-[2px] animate-fade-in" onClick={() => setShowChangelog(false)} />
          <div className="relative bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-700 rounded-xl shadow-elevated w-full max-w-xl max-h-[85vh] flex flex-col overflow-hidden animate-fade-in-up">
            <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/60">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#0052FF] flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">Riwayat Pembaruan Sistem</h3>
                  <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">KASI JADI · Web &amp; Mobile</p>
                </div>
              </div>
              <button
                type="button"
                aria-label="Tutup"
                onClick={() => setShowChangelog(false)}
                className="btn-icon p-1.5"
              >
                <X className="w-4 h-4 text-slate-600 dark:text-slate-200" />
              </button>
            </div>
            <div className="p-5 overflow-y-auto space-y-4">
              {FALLBACK_CHANGELOGS.map((rel, idx) => (
                <div key={rel.versi} className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
                  <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`tabular-num px-2.5 py-0.5 rounded-full text-xs font-semibold ${idx === 0
                          ? 'bg-[#0052FF] text-white'
                          : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200'
                        }`}>
                        {rel.versi}
                      </span>
                      <span className="tabular-num text-[11px] font-medium text-slate-500 dark:text-slate-400 flex-shrink-0">{rel.tanggal}</span>
                    </div>
                    <h4 className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white leading-snug">{rel.judul}</h4>
                  </div>
                  <div className="p-4 space-y-2.5 bg-white dark:bg-[#111827]">
                    {rel.perubahan.map((item, i) => (
                      <div key={i} className="text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2.5 leading-relaxed">
                        <span className="px-2 py-0.5 rounded-md bg-blue-50 text-[#0052FF] dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200/70 dark:border-blue-800/70 font-semibold text-[10px] flex-shrink-0 mt-0.5">
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

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Eye, EyeOff, AlertCircle, Sparkles, X, ChevronDown, Sun, Moon, ArrowRight } from 'lucide-react';
import { FALLBACK_CHANGELOGS } from './Changelog';

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
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#090E1A] flex flex-col justify-between p-4 sm:p-6 relative overflow-hidden">
      {/* Subtle architectural dot background */}
      <div
        className="absolute inset-0 pointer-events-none opacity-45 dark:opacity-20"
        style={{
          backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Minimal Top Utility Bar */}
      <div className="relative z-10 w-full max-w-5xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-primary-600 dark:bg-sky-500 rounded-lg flex items-center justify-center shadow-card">
            <svg className="w-4 h-4 text-white dark:text-slate-950" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <span className="font-bold text-sm text-slate-900 dark:text-white tracking-tight">SI-CKP Harian</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowChangelog(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium text-slate-600 dark:text-slate-300 shadow-card transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-primary-600 dark:text-sky-400" />
            <span>Changelog</span>
            <span className="font-mono text-[10px] text-slate-400">v1.3</span>
          </button>

          <button
            type="button"
            onClick={toggleTheme}
            aria-label={isDark ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 shadow-card transition-colors"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Centered Login Card */}
      <div className="relative z-10 w-full max-w-[420px] mx-auto my-8">
        <div className="card p-7 sm:p-8 shadow-elevated animate-fade-in-up">
          {/* Brand Title */}
          <div className="mb-7">
            <p className="font-mono text-[11px] font-semibold uppercase tracking-widest text-primary-600 dark:text-sky-400 mb-2">
              Dinas Statistik Daerah
            </p>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Masuk ke SI-CKP
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Sistem Informasi Capaian Kinerja Pegawai
            </p>
          </div>

          {error && (
            <div className="flex items-start gap-2.5 p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/70 rounded-lg text-rose-700 dark:text-rose-300 text-xs mb-5">
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-2.5 mt-2"
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
          <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setShowDemo(!showDemo)}
              className="w-full flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
            >
              <span>Akses Akun Demo (Uji Coba)</span>
              <ChevronDown className={`w-4 h-4 transition-transform duration-150 ${showDemo ? 'rotate-180' : ''}`} />
            </button>

            {showDemo && (
              <div className="mt-3 space-y-2 animate-fade-in">
                <div className="grid grid-cols-2 gap-2">
                  {demoUsers.map(u => (
                    <button
                      key={u.username}
                      type="button"
                      onClick={() => setForm({ username: u.username, password: 'password123' })}
                      className="text-left p-2.5 rounded-lg border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:border-primary-400 dark:hover:border-sky-500/60 hover:bg-primary-50/40 dark:hover:bg-slate-800 transition-all"
                    >
                      <div className="flex items-center justify-between gap-1">
                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">{u.label}</p>
                        <span className="font-mono text-[10px] text-primary-600 dark:text-sky-400">{u.tag}</span>
                      </div>
                      <p className="font-mono text-[11px] text-slate-400 mt-0.5">@{u.username}</p>
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 text-center">
                  Password default: <code className="font-mono text-slate-600 dark:text-slate-300">password123</code>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Subtle Footer */}
      <footer className="relative z-10 text-center text-xs text-slate-400 dark:text-slate-500">
        © 2026 SI-CKP · Dinas Statistik Daerah
      </footer>

      {/* Modal Changelog Publik */}
      {showChangelog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px] animate-fade-in" onClick={() => setShowChangelog(false)} />
          <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-elevated w-full max-w-xl max-h-[85vh] flex flex-col overflow-hidden animate-fade-in-up">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-sky-950 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-primary-600 dark:text-sky-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-slate-900 dark:text-white">Riwayat Pembaruan Sistem</h3>
                  <p className="text-[11px] text-slate-400">SI-CKP Web & Mobile</p>
                </div>
              </div>
              <button
                type="button"
                aria-label="Tutup"
                onClick={() => setShowChangelog(false)}
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 overflow-y-auto space-y-4">
              {FALLBACK_CHANGELOGS.map((rel, idx) => (
                <div key={rel.versi} className="border border-slate-200/80 dark:border-slate-800 rounded-xl overflow-hidden">
                  <div className="px-4 py-3 bg-slate-50/70 dark:bg-slate-800/50 border-b border-slate-200/70 dark:border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`font-mono px-2 py-0.5 rounded text-xs font-semibold ${
                        idx === 0
                          ? 'bg-primary-600 text-white dark:bg-sky-500 dark:text-slate-950'
                          : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200'
                      }`}>
                        {rel.versi}
                      </span>
                      <span className="font-mono text-[11px] text-slate-400 flex-shrink-0">{rel.tanggal}</span>
                    </div>
                    <h4 className="font-semibold text-xs sm:text-sm text-slate-800 dark:text-slate-100 leading-snug">{rel.judul}</h4>
                  </div>
                  <div className="p-4 space-y-2.5">
                    {rel.perubahan.map((item, i) => (
                      <div key={i} className="text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2.5 leading-relaxed">
                        <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/70 dark:border-slate-700 font-medium text-[10px] flex-shrink-0 mt-0.5">
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

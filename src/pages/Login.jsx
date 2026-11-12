import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Eye, EyeOff, AlertCircle, Smartphone, Monitor, Sparkles, X, Tag } from 'lucide-react';
import { FALLBACK_CHANGELOGS } from './Changelog';

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showChangelog, setShowChangelog] = useState(false);
  const { login } = useAuth();
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
    { username: 'admin', label: 'KPA / Admin', color: 'text-red-600' },
    { username: 'kasubbag', label: 'Kasubbag', color: 'text-blue-600' },
    { username: 'budi', label: 'Budi (Pegawai)', color: 'text-green-600' },
    { username: 'sari', label: 'Sari (Pegawai)', color: 'text-green-600' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-800 via-primary-700 to-primary-900 flex items-center justify-center p-4">
      {/* Background pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-white/5 rounded-full" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-white/5 rounded-full" />
      </div>

      <div className="w-full max-w-md relative">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up">
          {/* Header stripe */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-800 p-6 text-white text-center">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3 backdrop-blur-sm">
              <Monitor className="w-8 h-8 text-white" />
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/15 text-primary-100 text-[11px] font-medium mb-1.5">
              <span>Web & Mobile Terintegrasi</span>
            </div>
            <h1 className="text-xl font-bold">SI-CKP Harian</h1>
            <p className="text-primary-200 text-sm mt-1">Sistem Informasi Capaian Kinerja Pegawai</p>
            <p className="text-primary-300 text-xs mt-0.5">Dinas Statistik Daerah</p>
          </div>

          {/* Form */}
          <div className="p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-3">Masuk ke SI-CKP Harian</h2>

            {/* Mobile ecosystem info banner */}
            <div className="flex items-start gap-2.5 p-3 bg-blue-50 border border-blue-100 rounded-xl text-blue-800 text-xs mb-4">
              <Smartphone className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Input CKP Harian via Web maupun Aplikasi Mobile</p>
                <p className="text-blue-600 mt-0.5 leading-relaxed">
                  Anda dapat menginput kegiatan harian, mengunggah bukti dukung, serta mengunduh laporan hasil kerja per periode langsung di <strong>Website ini</strong> maupun melalui <strong>Aplikasi Mobile SI-CKP</strong> (dilengkapi Kamera Geotag & Timestamp).
                </p>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm mb-4">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="form-group">
                <label className="label">Username</label>
                <input
                  className="input"
                  type="text"
                  placeholder="Masukkan username"
                  value={form.username}
                  onChange={e => setForm({ ...form, username: e.target.value })}
                  autoComplete="username"
                  id="login-username"
                />
              </div>

              <div className="form-group">
                <label className="label">Password</label>
                <div className="relative">
                  <input
                    className="input pr-10"
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
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full justify-center py-2.5"
                id="login-submit"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Memproses...
                  </>
                ) : 'Masuk'}
              </button>
            </form>

            {/* Demo accounts */}
            <div className="mt-5 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-slate-500 font-medium">Akun Demo (password: password123)</p>
                <button
                  type="button"
                  onClick={() => setShowChangelog(true)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-primary-600 hover:text-primary-700"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Lihat Changelog (v1.3)
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {demoUsers.map(u => (
                  <button
                    key={u.username}
                    onClick={() => setForm({ username: u.username, password: 'password123' })}
                    className="text-left p-2 rounded-lg border border-slate-100 hover:border-primary-200 hover:bg-primary-50/50 transition-colors"
                  >
                    <p className={`text-xs font-semibold ${u.color}`}>{u.label}</p>
                    <p className="text-xs text-slate-500">{u.username}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-primary-300 text-xs mt-4">
          © 2026 SI-CKP · Dinas Statistik Daerah
        </p>
      </div>

      {/* Modal Changelog Publik */}
      {showChangelog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 animate-fade-in" onClick={() => setShowChangelog(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[85vh] flex flex-col overflow-hidden animate-fade-in-up">
            <div className="px-5 py-4 bg-gradient-to-r from-primary-600 to-primary-800 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                <h3 className="font-bold text-sm sm:text-base">Changelog & Pembaruan Sistem SI-CKP</h3>
              </div>
              <button onClick={() => setShowChangelog(false)} className="p-1 hover:bg-white/20 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 overflow-y-auto space-y-4">
              {FALLBACK_CHANGELOGS.map((rel, idx) => (
                <div key={rel.versi} className="border border-slate-100 rounded-xl overflow-hidden">
                  <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${idx === 0 ? 'bg-primary-600 text-white' : 'bg-slate-700 text-white'}`}>
                        {rel.versi}
                      </span>
                      <span className="font-semibold text-xs sm:text-sm text-slate-800">{rel.judul}</span>
                    </div>
                    <span className="text-[11px] text-slate-400">{rel.tanggal}</span>
                  </div>
                  <div className="p-3.5 space-y-2">
                    {rel.perubahan.map((item, i) => (
                      <div key={i} className="text-xs text-slate-600 flex items-start gap-2">
                        <span className="px-1.5 py-0.5 rounded bg-primary-50 text-primary-700 font-semibold text-[10px] flex-shrink-0 mt-0.5">
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

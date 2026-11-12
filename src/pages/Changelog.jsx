import { useEffect, useState } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles, Plus, Trash2, Calendar, Tag, Smartphone, Monitor, Server, CheckCircle2, Wrench, RefreshCw, X
} from 'lucide-react';

export const FALLBACK_CHANGELOGS = [
  {
    id: 1,
    versi: 'v1.3.0',
    judul: 'Fitur Changelog Publik & Penghapusan Verifikasi KPA',
    tanggal: '2026-11-12',
    tipe: 'major',
    perubahan: [
      {
        kategori: 'Fitur Baru',
        platform: 'Web & Mobile',
        deskripsi: 'Menambahkan menu dan halaman Changelog (Riwayat Pembaruan Sistem) yang dapat dilihat oleh seluruh pengguna (KPA, Kasubbag, dan Pegawai/Anggota).'
      },
      {
        kategori: 'Perubahan',
        platform: 'Web, Mobile & Backend',
        deskripsi: 'Menghapus alur dan status verifikasi kegiatan harian oleh KPA di seluruh halaman (Dashboard, Kegiatan Harian, Kalender, Laporan Cetak/Excel, dan Aplikasi Mobile) sehingga pencatatan kegiatan langsung tercatat tanpa menunggu verifikasi KPA.'
      },
      {
        kategori: 'Fitur Baru',
        platform: 'Web',
        deskripsi: 'Admin/KPA kini dapat menambahkan catatan rilis (changelog) baru secara langsung dari halaman Changelog.'
      }
    ]
  },
  {
    id: 2,
    versi: 'v1.2.0',
    judul: 'Kamera Geotag GPS & Timestamp, Input Web & Mobile, Export Periode & Hold RK',
    tanggal: '2026-11-12',
    tipe: 'major',
    perubahan: [
      {
        kategori: 'Fitur Baru',
        platform: 'Mobile',
        deskripsi: 'Kamera bukti dukung pada SI-CKP Mobile otomatis menangkap titik koordinat GPS (Latitude, Longitude, Akurasi) dan Timestamp, lalu mencetak watermark langsung pada foto serta menyimpan metadatanya.'
      },
      {
        kategori: 'Fitur Baru',
        platform: 'Web & Mobile',
        deskripsi: 'Fitur Download Hasil Kerja per Periode dalam format Excel (.xlsx) dan Cetak/PDF tersedia langsung di Dashboard, Kegiatan Harian, Nilai CKP, serta Aplikasi Mobile.'
      },
      {
        kategori: 'Perubahan',
        platform: 'Web',
        deskripsi: 'Mengaktifkan kembali fitur tambah, edit, dan hapus kegiatan harian serta unggah bukti dukung pada Website sehingga pegawai dapat menginput dari Web maupun Mobile.'
      },
      {
        kategori: 'Perubahan',
        platform: 'Web, Mobile & Backend',
        deskripsi: 'Menonaktifkan sementara (hold) fitur Rencana Kinerja (RK) pada menu, form, tabel, dan laporan; perhitungan nilai capaian mengacu pada rata-rata capaian kegiatan harian.'
      }
    ]
  },
  {
    id: 3,
    versi: 'v1.1.0',
    judul: 'Peluncuran Aplikasi SI-CKP Mobile (Android) & Integrasi Cloud',
    tanggal: '2026-11-12',
    tipe: 'major',
    perubahan: [
      {
        kategori: 'Fitur Baru',
        platform: 'Mobile',
        deskripsi: 'Rilis aplikasi SI-CKP Mobile untuk Android (APK) dengan fitur Beranda, Input Kegiatan Harian, Upload Bukti Dukung, Riwayat Kegiatan, dan Monitoring Nilai CKP.'
      },
      {
        kategori: 'Perbaikan',
        platform: 'Backend',
        deskripsi: 'Migrasi database ke PostgreSQL (Supabase) dan penyimpanan bukti dukung ke Supabase Storage untuk sinkronisasi real-time antara Web dan Mobile.'
      }
    ]
  },
  {
    id: 4,
    versi: 'v1.0.0',
    judul: 'Rilis Awal Sistem Informasi CKP Harian (SI-CKP)',
    tanggal: '2026-11-02',
    tipe: 'major',
    perubahan: [
      {
        kategori: 'Fitur Baru',
        platform: 'Web & Backend',
        deskripsi: 'Peluncuran perdana SI-CKP Harian meliputi pencatatan kegiatan harian pegawai, manajemen bukti dukung (file & link), kalender pengisian harian, penilaian perilaku kerja (BerAKHLAK), dan perhitungan nilai CKP bulanan.'
      }
    ]
  }
];

const KATEGORI_STYLES = {
  'Fitur Baru': {
    badge: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
    icon: Sparkles,
  },
  'Perubahan': {
    badge: 'bg-blue-100 text-blue-800 border border-blue-200',
    icon: RefreshCw,
  },
  'Perbaikan': {
    badge: 'bg-amber-100 text-amber-800 border border-amber-200',
    icon: Wrench,
  },
};

function getPlatformIcon(platform = '') {
  const p = platform.toLowerCase();
  if (p.includes('mobile') && p.includes('web')) return <Sparkles className="w-3.5 h-3.5 text-primary-600" />;
  if (p.includes('mobile')) return <Smartphone className="w-3.5 h-3.5 text-emerald-600" />;
  if (p.includes('web')) return <Monitor className="w-3.5 h-3.5 text-blue-600" />;
  return <Server className="w-3.5 h-3.5 text-purple-600" />;
}

export default function Changelog() {
  const { isKPA } = useAuth();
  const [changelogs, setChangelogs] = useState(FALLBACK_CHANGELOGS);
  const [loading, setLoading] = useState(true);
  const [filterKategori, setFilterKategori] = useState('Semua');
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    versi: '',
    judul: '',
    tanggal: new Date().toISOString().split('T')[0],
    tipe: 'minor',
    items: [{ kategori: 'Fitur Baru', platform: 'Web & Mobile', deskripsi: '' }]
  });

  const fetchChangelogs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/changelogs');
      if (Array.isArray(res.data) && res.data.length > 0) {
        setChangelogs(res.data);
      }
    } catch {
      // Gunakan fallback jika gagal fetch
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChangelogs();
  }, []);

  const addFormItem = () => {
    setForm(f => ({
      ...f,
      items: [...f.items, { kategori: 'Fitur Baru', platform: 'Web & Mobile', deskripsi: '' }]
    }));
  };

  const updateFormItem = (idx, patch) => {
    setForm(f => ({
      ...f,
      items: f.items.map((it, i) => (i === idx ? { ...it, ...patch } : it))
    }));
  };

  const removeFormItem = (idx) => {
    setForm(f => ({
      ...f,
      items: f.items.filter((_, i) => i !== idx)
    }));
  };

  const handleCreateChangelog = async (e) => {
    e.preventDefault();
    const validItems = form.items.filter(it => it.deskripsi.trim() !== '');
    if (!form.versi || !form.judul || validItems.length === 0) {
      return alert('Mohon lengkapi versi, judul, dan minimal 1 poin perubahan.');
    }
    setSubmitting(true);
    try {
      await api.post('/changelogs', {
        versi: form.versi.trim(),
        judul: form.judul.trim(),
        tanggal: form.tanggal,
        tipe: form.tipe,
        perubahan: validItems
      });
      setModalOpen(false);
      setForm({
        versi: '',
        judul: '',
        tanggal: new Date().toISOString().split('T')[0],
        tipe: 'minor',
        items: [{ kategori: 'Fitur Baru', platform: 'Web & Mobile', deskripsi: '' }]
      });
      await fetchChangelogs();
    } catch (err) {
      alert(err.response?.data?.error || 'Gagal menyimpan changelog');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteChangelog = async (id, versi) => {
    if (!confirm(`Hapus catatan rilis ${versi}?`)) return;
    try {
      await api.delete(`/changelogs/${id}`);
      await fetchChangelogs();
    } catch (err) {
      alert(err.response?.data?.error || 'Gagal menghapus changelog');
    }
  };

  const categories = ['Semua', 'Fitur Baru', 'Perubahan', 'Perbaikan'];

  return (
    <div className="space-y-5">
      {/* Header Banner */}
      <div className="p-5 bg-gradient-to-r from-primary-700 via-primary-600 to-blue-700 text-white rounded-2xl shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-white/15 flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold">Changelog & Riwayat Pembaruan SI-CKP</h2>
              <span className="px-2.5 py-0.5 text-xs font-bold bg-emerald-400/20 border border-emerald-300/40 text-emerald-100 rounded-full">
                {changelogs[0]?.versi || 'v1.3.0'}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-primary-100 mt-1">
              Informasi transparan mengenai fitur baru, peningkatan fungsi, dan perubahan sistem untuk seluruh pengguna Web & Mobile.
            </p>
          </div>
        </div>

        {isKPA && (
          <button
            onClick={() => setModalOpen(true)}
            className="btn-sm bg-white text-primary-700 hover:bg-primary-50 font-semibold rounded-xl px-3.5 py-2 flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Tambah Catatan Rilis
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="card p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 mr-1">Filter Kategori:</span>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilterKategori(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterKategori === cat
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <button onClick={fetchChangelogs} className="btn-secondary btn-sm" disabled={loading}>
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Segarkan
        </button>
      </div>

      {/* Timeline List */}
      <div className="space-y-4">
        {changelogs.map((release, idx) => {
          const items = Array.isArray(release.perubahan) ? release.perubahan : [];
          const filteredItems = filterKategori === 'Semua'
            ? items
            : items.filter(it => it.kategori === filterKategori);

          if (filteredItems.length === 0) return null;

          const isLatest = idx === 0;

          return (
            <div
              key={release.id || release.versi}
              className={`card overflow-hidden border transition-all ${
                isLatest ? 'border-primary-200 ring-1 ring-primary-100' : 'border-slate-100'
              }`}
            >
              {/* Release Header */}
              <div className={`px-5 py-4 border-b flex flex-wrap items-center justify-between gap-3 ${
                isLatest ? 'bg-primary-50/60 border-primary-100' : 'bg-slate-50/60 border-slate-100'
              }`}>
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 ${
                    isLatest
                      ? 'bg-primary-600 text-white shadow-sm'
                      : 'bg-slate-800 text-white'
                  }`}>
                    <Tag className="w-3.5 h-3.5" />
                    {release.versi}
                  </span>
                  {isLatest && (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                      Rilis Terbaru
                    </span>
                  )}
                  <h3 className="font-bold text-slate-800 text-sm sm:text-base">
                    {release.judul}
                  </h3>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      {new Date(release.tanggal + 'T00:00:00').toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  {isKPA && release.id && (
                    <button
                      onClick={() => handleDeleteChangelog(release.id, release.versi)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Hapus Catatan Rilis"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Release Items */}
              <div className="p-5 divide-y divide-slate-100">
                {filteredItems.map((item, i) => {
                  const style = KATEGORI_STYLES[item.kategori] || {
                    badge: 'bg-slate-100 text-slate-700 border border-slate-200',
                    icon: CheckCircle2
                  };
                  const IconComp = style.icon;
                  return (
                    <div key={i} className={`flex items-start gap-3 ${i > 0 ? 'pt-3.5 mt-3.5' : ''}`}>
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 flex-shrink-0 mt-0.5 ${style.badge}`}>
                        <IconComp className="w-3 h-3" />
                        {item.kategori || 'Pembaruan'}
                      </span>

                      <div className="flex-1 min-w-0">
                        {item.platform && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded mb-1">
                            {getPlatformIcon(item.platform)}
                            {item.platform}
                          </span>
                        )}
                        <p className="text-sm text-slate-700 leading-relaxed">
                          {item.deskripsi}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Tambah Changelog (KPA) */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 animate-fade-in" onClick={() => setModalOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl animate-fade-in-up max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h3 className="font-semibold text-slate-800">Tambah Catatan Rilis (Changelog)</h3>
              <button onClick={() => setModalOpen(false)} className="p-1.5 hover:bg-slate-100 rounded-lg">
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleCreateChangelog} className="p-5 overflow-y-auto space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="label">Versi *</label>
                  <input
                    className="input"
                    required
                    placeholder="Contoh: v1.4.0"
                    value={form.versi}
                    onChange={e => setForm({ ...form, versi: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">Tanggal Rilis *</label>
                  <input
                    type="date"
                    className="input"
                    required
                    value={form.tanggal}
                    onChange={e => setForm({ ...form, tanggal: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">Tipe Rilis</label>
                  <select
                    className="input"
                    value={form.tipe}
                    onChange={e => setForm({ ...form, tipe: e.target.value })}
                  >
                    <option value="major">Major Update</option>
                    <option value="minor">Minor Update</option>
                    <option value="patch">Patch / Bugfix</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="label">Judul Rilis *</label>
                <input
                  className="input"
                  required
                  placeholder="Contoh: Peningkatan Performa & Fitur Baru"
                  value={form.judul}
                  onChange={e => setForm({ ...form, judul: e.target.value })}
                />
              </div>

              <div className="space-y-3 border-t border-slate-100 pt-3">
                <div className="flex items-center justify-between">
                  <label className="label mb-0">Daftar Perubahan *</label>
                  <button type="button" onClick={addFormItem} className="btn-secondary btn-sm">
                    <Plus className="w-3.5 h-3.5" /> Tambah Poin
                  </button>
                </div>

                {form.items.map((item, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-xl space-y-2 border border-slate-100">
                    <div className="grid grid-cols-2 sm:grid-cols-[1fr_1fr_auto] gap-2">
                      <select
                        className="input text-xs"
                        value={item.kategori}
                        onChange={e => updateFormItem(idx, { kategori: e.target.value })}
                      >
                        <option value="Fitur Baru">Fitur Baru</option>
                        <option value="Perubahan">Perubahan</option>
                        <option value="Perbaikan">Perbaikan</option>
                      </select>
                      <select
                        className="input text-xs"
                        value={item.platform}
                        onChange={e => updateFormItem(idx, { platform: e.target.value })}
                      >
                        <option value="Web & Mobile">Web & Mobile</option>
                        <option value="Web">Web</option>
                        <option value="Mobile">Mobile</option>
                        <option value="Backend">Backend</option>
                        <option value="Web, Mobile & Backend">Web, Mobile & Backend</option>
                      </select>
                      {form.items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeFormItem(idx)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <textarea
                      className="input resize-none text-sm"
                      rows={2}
                      required
                      placeholder="Deskripsi perubahan..."
                      value={item.deskripsi}
                      onChange={e => updateFormItem(idx, { deskripsi: e.target.value })}
                    />
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">
                  Batal
                </button>
                <button type="submit" disabled={submitting} className="btn-primary">
                  {submitting ? 'Menyimpan...' : 'Publikasikan Changelog'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

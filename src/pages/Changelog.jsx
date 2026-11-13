import { useEffect, useState } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles, Plus, Trash2, Calendar, Tag, Smartphone, Monitor, Server, CheckCircle2, Wrench, RefreshCw, X
} from 'lucide-react';

export const FALLBACK_CHANGELOGS = [
  {
    id: 5,
    versi: 'v1.4.0',
    judul: 'Transformasi Identitas KASI JADI & Pembaruan Desain Formal',
    tanggal: '2026-11-13',
    tipe: 'major',
    perubahan: [
      {
        kategori: 'Perubahan',
        platform: 'Web & Mobile',
        deskripsi: 'Transformasi identitas sistem menjadi KASI JADI (Kanal Sistem Jurnal Aktivitas Dan Kinerja) dengan palet Biru Korporat (#0052FF) dan tipografi Plus Jakarta Sans.'
      },
      {
        kategori: 'Fitur Baru',
        platform: 'Web & Mobile',
        deskripsi: 'Integrasi logo monogram KJ, ikon outline formal, tata letak instansi yang rapi pada Web & Android, serta pencatatan aktivitas dengan koordinat lokasi dan rekap periode.'
      }
    ]
  },
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
        deskripsi: 'Kamera bukti dukung pada KASI JADI Mobile otomatis menangkap titik koordinat GPS (Latitude, Longitude, Akurasi) dan Timestamp, lalu mencetak watermark langsung pada foto serta menyimpan metadatanya.'
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
    judul: 'Peluncuran Aplikasi KASI JADI Mobile (Android) & Integrasi Cloud',
    tanggal: '2026-11-12',
    tipe: 'major',
    perubahan: [
      {
        kategori: 'Fitur Baru',
        platform: 'Mobile',
        deskripsi: 'Rilis aplikasi KASI JADI Mobile untuk Android (APK) dengan fitur Beranda, Input Kegiatan Harian, Upload Bukti Dukung, Riwayat Kegiatan, dan Monitoring Nilai CKP.'
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
    judul: 'Rilis Awal Kanal Sistem Jurnal Aktivitas Dan Kinerja (KASI JADI)',
    tanggal: '2026-11-02',
    tipe: 'major',
    perubahan: [
      {
        kategori: 'Fitur Baru',
        platform: 'Web & Backend',
        deskripsi: 'Peluncuran perdana sistem KASI JADI meliputi pencatatan kegiatan harian pegawai, manajemen bukti dukung (file & link), kalender pengisian harian, penilaian perilaku kerja (BerAKHLAK), dan perhitungan nilai CKP bulanan.'
      }
    ]
  }
];

const KATEGORI_STYLES = {
  'Fitur Baru': {
    badge: 'badge-success',
    icon: Sparkles,
  },
  'Perubahan': {
    badge: 'badge-info',
    icon: RefreshCw,
  },
  'Perbaikan': {
    badge: 'badge-warning',
    icon: Wrench,
  },
};

function getPlatformIcon(platform = '') {
  const p = platform.toLowerCase();
  if (p.includes('mobile') && p.includes('web')) return <Sparkles className="w-3 h-3 text-[#0052FF] dark:text-blue-400" />;
  if (p.includes('mobile')) return <Smartphone className="w-3 h-3 text-teal-600 dark:text-teal-400" />;
  if (p.includes('web')) return <Monitor className="w-3 h-3 text-[#0052FF] dark:text-blue-400" />;
  return <Server className="w-3 h-3 text-slate-600 dark:text-slate-300" />;
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
    <div className="space-y-6">
      {/* KASI JADI Header */}
      <div className="page-header mb-0">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 className="page-title">Changelog &amp; Riwayat Pembaruan</h2>
            <span className="badge-info tabular-num text-[11px]">{changelogs[0]?.versi || 'v1.4.0'}</span>
          </div>
          <p className="page-subtitle">Catatan rilis fitur, penyempurnaan antarmuka, dan pembaruan sistem KASI JADI</p>
        </div>

        {isKPA && (
          <button onClick={() => setModalOpen(true)} className="btn-primary btn-sm">
            <Plus className="w-3.5 h-3.5" />
            Tambah Catatan Rilis
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="card p-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilterKategori(cat)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                filterKategori === cat
                  ? 'bg-[#0052FF] text-white border-[#0052FF] shadow-sm'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800'
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
              className={`card overflow-hidden ${isLatest ? 'ring-1 ring-[#0052FF]/25 dark:ring-blue-500/30 border-[#0052FF]/30 dark:border-blue-500/40' : ''}`}
            >
              {/* Release Header */}
              <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/60 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className={`tabular-num px-2.5 py-0.5 rounded-md border text-xs font-semibold inline-flex items-center gap-1.5 ${
                    isLatest
                      ? 'bg-[#0052FF] text-white border-[#0052FF]'
                      : 'bg-white text-slate-700 dark:bg-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700'
                  }`}>
                    <Tag className="w-3 h-3" />
                    {release.versi}
                  </span>
                  {isLatest && (
                    <span className="badge-success text-[11px]">Rilis Terbaru</span>
                  )}
                  <h3 className="font-semibold text-slate-900 dark:text-white text-sm">
                    {release.judul}
                  </h3>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-[#0052FF] dark:text-blue-400" />
                    <span className="tabular-num text-[11px]">
                      {new Date(release.tanggal + 'T00:00:00').toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  {isKPA && release.id && (
                    <button
                      onClick={() => handleDeleteChangelog(release.id, release.versi)}
                      className="p-1.5 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg border border-transparent hover:border-rose-200 dark:hover:border-rose-800/60 transition-colors"
                      title="Hapus Catatan Rilis"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Release Items */}
              <div className="p-5 divide-y divide-slate-200/80 dark:divide-slate-800">
                {filteredItems.map((item, i) => {
                  const style = KATEGORI_STYLES[item.kategori] || {
                    badge: 'badge-gray',
                    icon: CheckCircle2
                  };
                  const IconComp = style.icon;
                  return (
                    <div key={i} className={`flex items-start gap-3 ${i > 0 ? 'pt-3.5 mt-3.5' : ''}`}>
                      <span className={`${style.badge} text-[11px] flex-shrink-0 mt-0.5`}>
                        <IconComp className="w-3 h-3" />
                        {item.kategori || 'Pembaruan'}
                      </span>

                      <div className="flex-1 min-w-0">
                        {item.platform && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded-md mb-1.5">
                            {getPlatformIcon(item.platform)}
                            {item.platform}
                          </span>
                        )}
                        <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
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
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px] animate-fade-in" onClick={() => setModalOpen(false)} />
          <div className="relative bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-elevated w-full max-w-2xl animate-fade-in-up max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
              <h3 className="font-semibold text-sm text-slate-900 dark:text-white">Tambah Catatan Rilis</h3>
              <button onClick={() => setModalOpen(false)} className="btn-icon p-1.5">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateChangelog} className="p-5 overflow-y-auto space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="label">Versi *</label>
                  <input
                    className="input tabular-num"
                    required
                    placeholder="v1.5.0"
                    value={form.versi}
                    onChange={e => setForm({ ...form, versi: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">Tanggal Rilis *</label>
                  <input
                    type="date"
                    className="input tabular-num"
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
                  placeholder="Contoh: Peningkatan Performa &amp; Fitur Baru"
                  value={form.judul}
                  onChange={e => setForm({ ...form, judul: e.target.value })}
                />
              </div>

              <div className="space-y-3 border-t border-slate-200 dark:border-slate-800 pt-3">
                <div className="flex items-center justify-between">
                  <label className="label mb-0">Daftar Perubahan *</label>
                  <button type="button" onClick={addFormItem} className="btn-secondary btn-sm">
                    <Plus className="w-3.5 h-3.5" /> Tambah Poin
                  </button>
                </div>

                {form.items.map((item, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-800/70 rounded-xl space-y-2 border border-slate-200 dark:border-slate-700">
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
                        <option value="Web & Mobile">Web &amp; Mobile</option>
                        <option value="Web">Web</option>
                        <option value="Mobile">Mobile</option>
                        <option value="Backend">Backend</option>
                        <option value="Web, Mobile & Backend">Web, Mobile &amp; Backend</option>
                      </select>
                      {form.items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeFormItem(idx)}
                          className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg"
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

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">
                  Batal
                </button>
                <button type="submit" disabled={submitting} className="btn-teal">
                  {submitting ? 'Menyimpan...' : 'Publikasikan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

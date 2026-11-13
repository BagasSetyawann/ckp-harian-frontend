import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../utils/api';
import {
  CheckCircle2, XCircle, Clock, Users, ClipboardList, BarChart3,
  Award, AlertCircle, FileText, Plus, Download, ArrowUpRight
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

function StatCard({ icon: Icon, label, value, sub, tone = 'navy' }) {
  const toneMap = {
    navy: 'bg-primary-50 text-primary-600 border-primary-100 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800/60',
    success: 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60',
    warning: 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/60',
    danger: 'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800/60',
    neutral: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
  };

  return (
    <div className="card p-4 flex flex-col justify-between gap-3">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 leading-snug">{label}</p>
        <div className={`w-8 h-8 rounded-lg border flex items-center justify-center flex-shrink-0 ${toneMap[tone]}`}>
          <Icon className="w-4 h-4" strokeWidth={1.8} />
        </div>
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-900 dark:text-white tabular-num tracking-tight">
          {value ?? '—'}
        </p>
        {sub && <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 truncate">{sub}</p>}
      </div>
    </div>
  );
}

function ProgressBar({ value, color = 'navy', label, meta }) {
  const colorMap = {
    navy: 'bg-primary-600 dark:bg-sky-400',
    success: 'bg-emerald-600 dark:bg-emerald-400',
    warning: 'bg-amber-500 dark:bg-amber-400',
    danger: 'bg-rose-600 dark:bg-rose-400',
  };
  const clampedValue = Math.min(Math.max(value || 0, 0), 100);
  return (
    <div className="space-y-2">
      {label && (
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-slate-600 dark:text-slate-300">{label}</span>
          <div className="flex items-center gap-2">
            {meta && <span className="text-slate-400 dark:text-slate-500 tabular-num">{meta}</span>}
            <span className="font-mono font-semibold text-slate-800 dark:text-white tabular-num">{clampedValue}%</span>
          </div>
        </div>
      )}
      <div className="progress-bar">
        <div className={`progress-fill ${colorMap[color]}`} style={{ width: `${clampedValue}%` }} />
      </div>
    </div>
  );
}

function KPADashboard() {
  const { isDark } = useTheme();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/kpa').then(r => setData(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <div className="w-7 h-7 border-2 border-primary-600 dark:border-sky-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!data) return null;

  const { stats, belum_isi_list, trend_data, employee_summary, period } = data;

  const handleDownloadPeriodExcel = async () => {
    if (!period?.id) return;
    try {
      const response = await api.get('/export/excel', { params: { period_id: period.id }, responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Hasil_Kerja_${(period.nama || period.id).replace(/\s+/g, '_')}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      alert('Gagal mengunduh hasil kerja periode ini');
    }
  };

  return (
    <div className="space-y-6">
      {/* Executive Page Header */}
      <div className="page-header mb-0">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="page-title">Ringkasan Kinerja Pegawai</h2>
            {period?.nama && (
              <span className="badge-info font-mono text-[11px]">{period.nama}</span>
            )}
          </div>
          <p className="page-subtitle">Pemantauan pelaporan kegiatan harian dan capaian kinerja periode berjalan</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link to="/kegiatan" className="btn-secondary btn-sm">
            <ClipboardList className="w-3.5 h-3.5" />
            Lihat Kegiatan
          </Link>
          {period?.id && (
            <button onClick={handleDownloadPeriodExcel} className="btn-primary btn-sm">
              <Download className="w-3.5 h-3.5" />
              Export Excel
            </button>
          )}
        </div>
      </div>

      {/* Subtle Incomplete Alert */}
      {stats.belum_isi > 0 && (
        <div className="flex items-start gap-3 p-3.5 bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/50 rounded-xl">
          <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="min-w-0">
            <p className="text-xs font-semibold text-amber-900 dark:text-amber-200">
              {stats.belum_isi} pegawai belum menginput kegiatan hari ini
            </p>
            <p className="text-xs text-amber-700/90 dark:text-amber-300/80 mt-0.5 leading-relaxed">
              {belum_isi_list.map(e => e.nama).join(', ')}
            </p>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
        <StatCard icon={Users} label="Total Pegawai" value={stats.total_pegawai} tone="navy" />
        <StatCard icon={CheckCircle2} label="Sudah Isi" value={stats.sudah_isi} tone="success" sub="Hari ini" />
        <StatCard icon={XCircle} label="Belum Isi" value={stats.belum_isi} tone="danger" sub="Hari ini" />
        <StatCard icon={ClipboardList} label="Kegiatan Hari Ini" value={stats.kegiatan_hari_ini} tone="neutral" />
        <StatCard icon={BarChart3} label="Total Kegiatan" value={stats.kegiatan_bulan_ini ?? 0} tone="warning" sub={period?.nama || 'Bulan ini'} />
        <StatCard icon={Award} label="Rata-rata CKP" value={stats.rata_rata_ckp ? `${stats.rata_rata_ckp}` : '—'} tone="navy" sub="Bulan ini" />
      </div>

      {/* Charts & Today Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Monthly Trend */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white text-sm">Tren Kegiatan Bulanan</h3>
              <p className="text-xs text-slate-400 mt-0.5">Jumlah aktivitas tercatat per periode</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={trend_data} barSize={22}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#1e293b' : '#f1f5f9'} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: isDark ? '#94a3b8' : '#64748b' }}
                axisLine={{ stroke: isDark ? '#1e293b' : '#e2e8f0' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: isDark ? '#94a3b8' : '#64748b' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                cursor={{ fill: isDark ? 'rgba(51, 65, 85, 0.25)' : 'rgba(241, 245, 249, 0.7)' }}
                contentStyle={{
                  fontSize: 12,
                  borderRadius: 10,
                  backgroundColor: isDark ? '#0f172a' : '#ffffff',
                  borderColor: isDark ? '#334155' : '#e2e8f0',
                  color: isDark ? '#f8fafc' : '#0f172a',
                  boxShadow: '0 4px 12px rgba(15,23,42,0.12)',
                }}
              />
              <Bar
                dataKey="total_kegiatan"
                fill={isDark ? '#38bdf8' : '#0f3d6e'}
                name="Kegiatan"
                radius={[5, 5, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Employee Status Today */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white text-sm">Status Pengisian Hari Ini</h3>
              <p className="text-xs text-slate-400 mt-0.5">Kehadiran input aktivitas harian pegawai</p>
            </div>
            <span className="font-mono text-xs text-slate-400 tabular-num">
              {stats.sudah_isi}/{stats.total_pegawai}
            </span>
          </div>
          <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
            {employee_summary.map(emp => (
              <div key={emp.id} className="flex items-center gap-3 px-2.5 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${emp.isi_hari_ini ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">{emp.nama}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 truncate">{emp.unit_kerja}</p>
                </div>
                <div className="flex items-center gap-2.5 flex-shrink-0">
                  <span className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-200 tabular-num">
                    {emp.nilai_ckp || '—'}
                  </span>
                  {emp.isi_hari_ini
                    ? <span className="badge-success text-[11px]">Sudah</span>
                    : <span className="badge-danger text-[11px]">Belum</span>
                  }
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Employee Summary Table */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="font-semibold text-slate-900 dark:text-white text-sm">Rekap Pegawai — {period?.nama}</h3>
          <Link to="/nilai-ckp" className="text-xs font-medium text-primary-600 dark:text-sky-400 hover:underline inline-flex items-center gap-1">
            <span>Evaluasi CKP</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Nama Pegawai</th>
                <th>Unit Kerja</th>
                <th>Hari Ini</th>
                <th>Kegiatan</th>
                <th>Hari Pengisian</th>
                <th className="text-right">Nilai CKP</th>
              </tr>
            </thead>
            <tbody>
              {employee_summary.map(emp => (
                <tr key={emp.id}>
                  <td className="font-medium text-slate-900 dark:text-slate-100">{emp.nama}</td>
                  <td className="text-slate-500 dark:text-slate-400">{emp.unit_kerja}</td>
                  <td>
                    {emp.isi_hari_ini ? (
                      <span className="badge-success">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Sudah
                      </span>
                    ) : (
                      <span className="badge-danger">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                        Belum
                      </span>
                    )}
                  </td>
                  <td className="font-mono tabular-num">{emp.total_kegiatan}</td>
                  <td className="tabular-num">{emp.hari_pengisian} hari</td>
                  <td className="text-right">
                    {emp.nilai_ckp ? (
                      <span className="font-mono font-semibold text-primary-600 dark:text-sky-400 tabular-num">{emp.nilai_ckp}</span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function PegawaiDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/pegawai').then(r => setData(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <div className="w-7 h-7 border-2 border-primary-600 dark:border-sky-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!data) return null;

  const { period, sudah_isi_hari_ini, today_activities, today_avg_capaian, month_stats, ckp_score } = data;
  const todayDate = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const handleDownloadMyExcel = async () => {
    if (!period?.id) return;
    try {
      const response = await api.get('/export/excel', { params: { period_id: period.id }, responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Hasil_Kerja_${(period.nama || period.id).replace(/\s+/g, '_')}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      alert('Gagal mengunduh hasil kerja periode ini');
    }
  };

  const hariPercent = month_stats.hari_kerja > 0
    ? Math.round((month_stats.hari_pengisian / month_stats.hari_kerja) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Executive Today Status Bar */}
      <div className="card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className={`w-10 h-10 rounded-lg border flex items-center justify-center flex-shrink-0 ${
            sudah_isi_hari_ini
              ? 'bg-emerald-50 text-emerald-600 border-emerald-200/80 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60'
              : 'bg-amber-50 text-amber-600 border-amber-200/80 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/60'
          }`}>
            {sudah_isi_hari_ini ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400 dark:text-slate-500">{todayDate}</p>
            <h2 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
              {sudah_isi_hari_ini ? 'CKP Hari Ini Sudah Terisi' : 'Belum Ada Input Kegiatan Hari Ini'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 tabular-num">
              {sudah_isi_hari_ini
                ? `${today_activities.length} kegiatan tercatat · Rata-rata capaian ${today_avg_capaian}%`
                : 'Catat kegiatan harian Anda beserta bukti dukung pada periode aktif.'
              }
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
          {period?.id && (
            <button onClick={handleDownloadMyExcel} className="btn-secondary btn-sm">
              <Download className="w-3.5 h-3.5" />
              Unduh Hasil Kerja
            </button>
          )}
          <Link to="/kegiatan" className="btn-primary btn-sm">
            <Plus className="w-3.5 h-3.5" />
            Input Kegiatan
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <StatCard icon={ClipboardList} label="Kegiatan Hari Ini" value={today_activities.length} tone="navy" />
        <StatCard icon={BarChart3} label="Kegiatan Bulan Ini" value={month_stats.total_kegiatan} tone="neutral" sub={period?.nama} />
        <StatCard icon={FileText} label="Bukti Dukung" value={month_stats.bukti_dukung} tone="warning" sub="File & Tautan" />
        <StatCard icon={Award} label="Nilai CKP" value={ckp_score?.nilai_ckp || '—'} tone="success" sub={ckp_score?.status === 'final' ? 'Final' : 'Draft'} />
      </div>

      {/* Progress & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="card p-5 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-900 dark:text-white text-sm">Progres Periode — {period?.nama}</h3>
          </div>
          <ProgressBar
            value={hariPercent}
            label="Hari Pengisian"
            meta={`${month_stats.hari_pengisian}/${month_stats.hari_kerja} hari kerja`}
            color="navy"
          />
          <ProgressBar
            value={month_stats.avg_capaian}
            label="Rata-rata Capaian Kegiatan"
            color="success"
          />
        </div>

        <div className="card p-5 flex flex-col justify-between gap-4">
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white text-sm">Aksi Cepat & Laporan</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Kelola catatan harian atau ekspor rekap hasil kerja untuk periode <strong className="font-semibold text-slate-700 dark:text-slate-200">{period?.nama || 'aktif'}</strong>.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <Link to="/kegiatan" className="btn-primary btn-sm py-2.5">
              <Plus className="w-3.5 h-3.5" />
              Tambah Kegiatan
            </Link>
            <Link to="/bukti-dukung" className="btn-secondary btn-sm py-2.5">
              <FileText className="w-3.5 h-3.5" />
              Kelola Bukti Dukung
            </Link>
            <button onClick={handleDownloadMyExcel} className="btn-secondary btn-sm py-2.5 sm:col-span-2">
              <Download className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              Download Rekap Excel ({period?.nama || 'Periode Aktif'})
            </button>
          </div>
        </div>
      </div>

      {/* Today's activities list */}
      {today_activities.length > 0 && (
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900 dark:text-white text-sm">Daftar Kegiatan Hari Ini</h3>
            <Link to="/kegiatan" className="text-xs font-medium text-primary-600 dark:text-sky-400 hover:underline">
              Lihat semua
            </Link>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {today_activities.map(act => (
              <div key={act.id} className="px-5 py-3.5 flex items-start gap-3 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                  act.status_kegiatan === 'selesai' ? 'bg-emerald-500' :
                  act.status_kegiatan === 'dalam_proses' ? 'bg-amber-400' : 'bg-slate-300 dark:bg-slate-600'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{act.nama_kegiatan}</p>
                  {act.deskripsi && <p className="text-xs text-slate-400 dark:text-slate-500 truncate mt-0.5">{act.deskripsi}</p>}
                </div>
                <div className="flex items-center gap-2.5 flex-shrink-0">
                  <span className="font-mono text-xs font-semibold text-primary-600 dark:text-sky-400 tabular-num">
                    {act.persentase_capaian}%
                  </span>
                  {act.status_kegiatan === 'selesai'
                    ? <span className="badge-success">Selesai</span>
                    : <span className="badge-warning">{act.status_kegiatan}</span>
                  }
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Dashboard() {
  const { isKPA, isKasubbag } = useAuth();
  if (isKPA || isKasubbag) return <KPADashboard />;
  return <PegawaiDashboard />;
}

import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
import {
  KjReminderBanner, KjAnalyticsIcon, KjDailyLogIcon
} from '../components/Brand/KasiJadiIcons';

function StatCard({ icon: Icon, label, value, sub, tone = 'blue' }) {
  const toneMap = {
    blue: 'bg-[#0052FF]/10 text-[#0052FF] border-[#1E293B] dark:bg-[#0052FF]/20 dark:text-[#60A5FA] dark:border-slate-500',
    navy: 'bg-[#0052FF]/10 text-[#0052FF] border-[#1E293B] dark:bg-[#0052FF]/20 dark:text-[#60A5FA] dark:border-slate-500',
    teal: 'bg-[#00B4D8]/15 text-[#0077B6] border-[#1E293B] dark:bg-[#00B4D8]/20 dark:text-[#00B4D8] dark:border-slate-500',
    success: 'bg-[#00B4D8]/15 text-[#0077B6] border-[#1E293B] dark:bg-[#00B4D8]/20 dark:text-[#00B4D8] dark:border-slate-500',
    orange: 'bg-[#FF6B35]/15 text-[#D9480F] border-[#1E293B] dark:bg-[#FF6B35]/20 dark:text-[#FF8A5C] dark:border-slate-500',
    warning: 'bg-amber-100 text-amber-800 border-[#1E293B] dark:bg-amber-950/60 dark:text-amber-300 dark:border-slate-500',
    danger: 'bg-rose-100 text-rose-700 border-[#1E293B] dark:bg-rose-950/60 dark:text-rose-300 dark:border-slate-500',
    neutral: 'bg-[#F4F6F9] text-[#1E293B] border-[#1E293B] dark:bg-slate-800 dark:text-slate-200 dark:border-slate-500',
  };

  return (
    <div className="card p-4 flex flex-col justify-between gap-3">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 leading-snug">{label}</p>
        <div className={`w-9 h-9 rounded-lg border-2 shadow-[2px_2px_0px_#1E293B] dark:shadow-[2px_2px_0px_#020617] flex items-center justify-center flex-shrink-0 ${toneMap[tone] || toneMap.blue}`}>
          <Icon className="w-4 h-4" strokeWidth={2.2} />
        </div>
      </div>
      <div>
        <p className="text-2xl font-extrabold text-[#1E293B] dark:text-white tabular-num tracking-tight">
          {value ?? '—'}
        </p>
        {sub && <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1 truncate">{sub}</p>}
      </div>
    </div>
  );
}

function ProgressBar({ value, color = 'blue', label, meta }) {
  const colorMap = {
    blue: 'bg-[#0052FF]',
    navy: 'bg-[#0052FF]',
    teal: 'bg-[#00B4D8]',
    success: 'bg-[#00B4D8]',
    orange: 'bg-[#FF6B35]',
    warning: 'bg-amber-500',
    danger: 'bg-rose-600',
  };
  const clampedValue = Math.min(Math.max(value || 0, 0), 100);
  return (
    <div className="space-y-2">
      {label && (
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-[#1E293B] dark:text-slate-200">{label}</span>
          <div className="flex items-center gap-2">
            {meta && <span className="text-slate-500 dark:text-slate-400 tabular-num font-medium">{meta}</span>}
            <span className="font-mono font-bold text-[#0052FF] dark:text-[#00B4D8] tabular-num">{clampedValue}%</span>
          </div>
        </div>
      )}
      <div className="progress-bar">
        <div className={`progress-fill ${colorMap[color] || colorMap.blue}`} style={{ width: `${clampedValue}%` }} />
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
        <div className="w-8 h-8 border-2 border-[#0052FF] dark:border-[#00B4D8] border-t-transparent rounded-full animate-spin" />
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
      {/* KASI JADI Page Header */}
      <div className="page-header mb-0">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 className="page-title">Ringkasan Kinerja Pegawai</h2>
            {period?.nama && (
              <span className="badge-info font-mono text-[11px]">{period.nama}</span>
            )}
          </div>
          <p className="page-subtitle">Pantau jurnal aktivitas harian &amp; capaian kinerja KASI JADI — Sat-Set No Drama!</p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <Link to="/kegiatan" className="btn-secondary btn-sm">
            <KjDailyLogIcon className="w-3.5 h-3.5" />
            Lihat Kegiatan
          </Link>
          {period?.id && (
            <button onClick={handleDownloadPeriodExcel} className="btn-teal btn-sm">
              <Download className="w-3.5 h-3.5" />
              Export Excel
            </button>
          )}
        </div>
      </div>

      {/* Incomplete Alert Card (Neo-Brutalism) */}
      {stats.belum_isi > 0 && (
        <div className="flex items-start gap-3 p-4 bg-[#FF6B35]/10 dark:bg-[#FF6B35]/15 border-2 border-[#1E293B] dark:border-slate-500 rounded-xl shadow-[3px_4px_0px_#1E293B] dark:shadow-[3px_4px_0px_#020617]">
          <span className="flex h-3 w-3 relative mt-1 flex-shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF6B35] opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-[#FF6B35]" />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-extrabold text-[#1E293B] dark:text-white">
              {stats.belum_isi} pegawai belum spill kerjaan hari ini, Jo!
            </p>
            <p className="text-xs font-medium text-slate-700 dark:text-slate-300 mt-0.5 leading-relaxed">
              {belum_isi_list.map(e => e.nama).join(', ')}
            </p>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
        <StatCard icon={Users} label="Total Pegawai" value={stats.total_pegawai} tone="blue" />
        <StatCard icon={CheckCircle2} label="Sudah Isi" value={stats.sudah_isi} tone="teal" sub="Hari ini" />
        <StatCard icon={XCircle} label="Belum Isi" value={stats.belum_isi} tone="orange" sub="Hari ini" />
        <StatCard icon={ClipboardList} label="Kegiatan Hari Ini" value={stats.kegiatan_hari_ini} tone="neutral" />
        <StatCard icon={BarChart3} label="Total Kegiatan" value={stats.kegiatan_bulan_ini ?? 0} tone="warning" sub={period?.nama || 'Bulan ini'} />
        <StatCard icon={Award} label="Rata-rata CKP" value={stats.rata_rata_ckp ? `${stats.rata_rata_ckp}` : '—'} tone="blue" sub="Bulan ini" />
      </div>

      {/* Charts & Today Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Monthly Trend */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#0052FF]/10 dark:bg-[#00B4D8]/15 border-2 border-[#1E293B] dark:border-slate-500 flex items-center justify-center">
                <KjAnalyticsIcon className="w-4 h-4 text-[#0052FF] dark:text-[#00B4D8]" />
              </div>
              <div>
                <h3 className="font-bold text-[#1E293B] dark:text-white text-sm">Tren Kegiatan Bulanan</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Jumlah aktivitas tercatat per periode</p>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={trend_data} barSize={22}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#334155' : '#cbd5e1'} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fontWeight: 600, fill: isDark ? '#cbd5e1' : '#1E293B' }}
                axisLine={{ stroke: isDark ? '#475569' : '#1E293B', strokeWidth: 1.5 }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fontWeight: 600, fill: isDark ? '#94a3b8' : '#475569' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                cursor={{ fill: isDark ? 'rgba(0, 180, 216, 0.12)' : 'rgba(0, 82, 255, 0.08)' }}
                contentStyle={{
                  fontSize: 12,
                  fontWeight: 600,
                  borderRadius: 12,
                  backgroundColor: isDark ? '#1E293B' : '#ffffff',
                  border: isDark ? '2px solid #64748b' : '2px solid #1E293B',
                  color: isDark ? '#f8fafc' : '#1E293B',
                  boxShadow: isDark ? '3px 4px 0px #020617' : '3px 4px 0px #1E293B',
                }}
              />
              <Bar
                dataKey="total_kegiatan"
                fill={isDark ? '#00B4D8' : '#0052FF'}
                stroke="#1E293B"
                strokeWidth={1.5}
                name="Kegiatan"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Employee Status Today */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-[#1E293B] dark:text-white text-sm">Status Pengisian Hari Ini</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Kehadiran input aktivitas harian pegawai</p>
            </div>
            <span className="badge-info font-mono text-xs tabular-num">
              {stats.sudah_isi}/{stats.total_pegawai}
            </span>
          </div>
          <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
            {employee_summary.map(emp => (
              <div key={emp.id} className="flex items-center gap-3 px-2.5 py-2 rounded-lg border border-transparent hover:border-[#1E293B]/30 dark:hover:border-slate-600 hover:bg-[#F4F6F9] dark:hover:bg-slate-800/60 transition-colors">
                <span className={`w-2.5 h-2.5 rounded-full border border-[#1E293B] flex-shrink-0 ${emp.isi_hari_ini ? 'bg-[#00B4D8]' : 'bg-[#FF6B35]'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-[#1E293B] dark:text-slate-100 truncate">{emp.nama}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{emp.unit_kerja}</p>
                </div>
                <div className="flex items-center gap-2.5 flex-shrink-0">
                  <span className="font-mono text-xs font-bold text-[#1E293B] dark:text-slate-200 tabular-num">
                    {emp.nilai_ckp || '—'}
                  </span>
                  {emp.isi_hari_ini
                    ? <span className="badge-success text-[10px]">BERES!</span>
                    : <span className="badge-danger text-[10px]">Belum</span>
                  }
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Employee Summary Table */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b-2 border-[#1E293B] dark:border-slate-600 flex items-center justify-between bg-[#F4F6F9]/60 dark:bg-slate-800/40">
          <h3 className="font-bold text-[#1E293B] dark:text-white text-sm">Rekap Pegawai — {period?.nama}</h3>
          <Link to="/nilai-ckp" className="text-xs font-bold text-[#0052FF] dark:text-[#00B4D8] hover:underline inline-flex items-center gap-1">
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
                  <td className="font-bold text-[#1E293B] dark:text-slate-100">{emp.nama}</td>
                  <td className="text-slate-500 dark:text-slate-400">{emp.unit_kerja}</td>
                  <td>
                    {emp.isi_hari_ini ? (
                      <span className="badge-success">
                        <span className="w-1.5 h-1.5 rounded-full bg-white" />
                        BERES!
                      </span>
                    ) : (
                      <span className="badge-danger">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                        Belum
                      </span>
                    )}
                  </td>
                  <td className="font-mono font-bold tabular-num">{emp.total_kegiatan}</td>
                  <td className="tabular-num">{emp.hari_pengisian} hari</td>
                  <td className="text-right">
                    {emp.nilai_ckp ? (
                      <span className="font-mono font-extrabold text-[#0052FF] dark:text-[#00B4D8] tabular-num">{emp.nilai_ckp}</span>
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
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dismissReminder, setDismissReminder] = useState(false);

  useEffect(() => {
    api.get('/dashboard/pegawai').then(r => setData(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <div className="w-8 h-8 border-2 border-[#0052FF] dark:border-[#00B4D8] border-t-transparent rounded-full animate-spin" />
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
      {/* Sulteng Reminder Banner */}
      {!sudah_isi_hari_ini && !dismissReminder && (
        <KjReminderBanner
          message="Jangan lupa spill kerjaan hari ini, Jo!"
          subtext="Catat aktivitas harian &amp; bukti dukungmu sekarang di KASI JADI — Sat-Set No Drama!"
          actionLabel="GAS ISI!"
          onAction={() => navigate('/kegiatan')}
          onDismiss={() => setDismissReminder(true)}
        />
      )}

      {/* KASI JADI Today Status Card */}
      <div className="card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className={`w-11 h-11 rounded-xl border-2 border-[#1E293B] dark:border-slate-500 shadow-[2px_3px_0px_#1E293B] dark:shadow-[2px_3px_0px_#020617] flex items-center justify-center flex-shrink-0 ${
            sudah_isi_hari_ini
              ? 'bg-[#00B4D8] text-white'
              : 'bg-[#FF6B35] text-white'
          }`}>
            {sudah_isi_hari_ini ? <CheckCircle2 className="w-5 h-5" strokeWidth={2.3} /> : <Clock className="w-5 h-5" strokeWidth={2.3} />}
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{todayDate}</p>
            <h2 className="text-base font-extrabold text-[#1E293B] dark:text-white mt-0.5">
              {sudah_isi_hari_ini ? 'BERES! Jurnal Hari Ini Sudah Terisi' : 'Belum Spill Kerjaan Hari Ini, Jo!'}
            </h2>
            <p className="text-xs font-medium text-slate-600 dark:text-slate-300 mt-0.5 tabular-num">
              {sudah_isi_hari_ini
                ? `${today_activities.length} kegiatan tercatat · Rata-rata capaian ${today_avg_capaian}%`
                : 'Catat kegiatan harian Anda beserta bukti dukung pada periode aktif.'
              }
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 flex-shrink-0">
          {period?.id && (
            <button onClick={handleDownloadMyExcel} className="btn-secondary btn-sm">
              <Download className="w-3.5 h-3.5" />
              Unduh Hasil Kerja
            </button>
          )}
          <Link to="/kegiatan" className={sudah_isi_hari_ini ? 'btn-primary btn-sm' : 'btn-orange btn-sm'}>
            <Plus className="w-3.5 h-3.5" />
            {sudah_isi_hari_ini ? 'Tambah Kegiatan' : 'GAS ISI!'}
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <StatCard icon={ClipboardList} label="Kegiatan Hari Ini" value={today_activities.length} tone="blue" />
        <StatCard icon={BarChart3} label="Kegiatan Bulan Ini" value={month_stats.total_kegiatan} tone="neutral" sub={period?.nama} />
        <StatCard icon={FileText} label="Bukti Dukung" value={month_stats.bukti_dukung} tone="orange" sub="File & Tautan" />
        <StatCard icon={Award} label="Nilai CKP" value={ckp_score?.nilai_ckp || '—'} tone="teal" sub={ckp_score?.status === 'final' ? 'BERES! Final' : 'Draft'} />
      </div>

      {/* Progress & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="card p-5 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-[#1E293B] dark:text-white text-sm">Progres Periode — {period?.nama}</h3>
            <span className="badge-info text-[11px]">Aktif</span>
          </div>
          <ProgressBar
            value={hariPercent}
            label="Hari Pengisian"
            meta={`${month_stats.hari_pengisian}/${month_stats.hari_kerja} hari kerja`}
            color="blue"
          />
          <ProgressBar
            value={month_stats.avg_capaian}
            label="Rata-rata Capaian Kegiatan"
            color="teal"
          />
        </div>

        <div className="card p-5 flex flex-col justify-between gap-4">
          <div>
            <h3 className="font-bold text-[#1E293B] dark:text-white text-sm">Aksi Cepat &amp; Laporan</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
              Kelola catatan harian atau ekspor rekap hasil kerja untuk periode <strong className="font-bold text-[#1E293B] dark:text-white">{period?.nama || 'aktif'}</strong>.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <Link to="/kegiatan" className="btn-orange btn-sm py-2.5">
              <Plus className="w-3.5 h-3.5" />
              GAS ISI! Kegiatan
            </Link>
            <Link to="/bukti-dukung" className="btn-secondary btn-sm py-2.5">
              <FileText className="w-3.5 h-3.5" />
              Kelola Bukti Dukung
            </Link>
            <button onClick={handleDownloadMyExcel} className="btn-teal btn-sm py-2.5 sm:col-span-2">
              <Download className="w-3.5 h-3.5" />
              Download Rekap Excel ({period?.nama || 'Periode Aktif'})
            </button>
          </div>
        </div>
      </div>

      {/* Today's activities list */}
      {today_activities.length > 0 && (
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b-2 border-[#1E293B] dark:border-slate-600 flex items-center justify-between bg-[#F4F6F9]/60 dark:bg-slate-800/40">
            <h3 className="font-bold text-[#1E293B] dark:text-white text-sm">Daftar Kegiatan Hari Ini</h3>
            <Link to="/kegiatan" className="text-xs font-bold text-[#0052FF] dark:text-[#00B4D8] hover:underline">
              Lihat semua
            </Link>
          </div>
          <div className="divide-y-2 divide-[#1E293B]/10 dark:divide-slate-700/80">
            {today_activities.map(act => (
              <div key={act.id} className="px-5 py-3.5 flex items-start gap-3 hover:bg-[#F4F6F9]/70 dark:hover:bg-slate-800/50 transition-colors">
                <span className={`w-2.5 h-2.5 rounded-full border border-[#1E293B] mt-1.5 flex-shrink-0 ${
                  act.status_kegiatan === 'selesai' ? 'bg-[#00B4D8]' :
                  act.status_kegiatan === 'dalam_proses' ? 'bg-[#FF6B35]' : 'bg-slate-300 dark:bg-slate-600'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-[#1E293B] dark:text-slate-100">{act.nama_kegiatan}</p>
                  {act.deskripsi && <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">{act.deskripsi}</p>}
                </div>
                <div className="flex items-center gap-2.5 flex-shrink-0">
                  <span className="font-mono text-xs font-extrabold text-[#0052FF] dark:text-[#00B4D8] tabular-num">
                    {act.persentase_capaian}%
                  </span>
                  {act.status_kegiatan === 'selesai'
                    ? <span className="badge-success">BERES!</span>
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

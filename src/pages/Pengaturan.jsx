import { useEffect, useState } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Save, Plus, AlertCircle, Download, FileSpreadsheet, Printer } from 'lucide-react';

function ExportView() {
  const { isAnggota } = useAuth();
  const [periods, setPeriods] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [filterPeriod, setFilterPeriod] = useState('');
  const [filterEmployee, setFilterEmployee] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/periods').then(r => {
      setPeriods(r.data);
      const active = r.data.find(p => p.is_active);
      if (active) setFilterPeriod(String(active.id));
    });
    if (!isAnggota) api.get('/users/employees').then(r => setEmployees(r.data.filter(e => e.role === 'Anggota')));
  }, [isAnggota]);

  const handleExcelExport = async () => {
    if (!filterPeriod) return alert('Pilih periode terlebih dahulu');
    setLoading(true);
    try {
      const params = { period_id: filterPeriod };
      if (filterEmployee) params.employee_id = filterEmployee;
      const response = await api.get('/export/excel', { params, responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const period = periods.find(p => String(p.id) === filterPeriod);
      link.setAttribute('download', `Rekap_CKP_${period?.nama || filterPeriod}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      alert('Gagal mengekspor Excel');
    } finally { setLoading(false); }
  };

  const handlePrintPDF = async () => {
    if (!filterPeriod) return alert('Pilih periode terlebih dahulu');
    setLoading(true);
    try {
      const params = { period_id: filterPeriod };
      if (filterEmployee) params.employee_id = filterEmployee;
      const r = await api.get('/export/pdf-data', { params });
      const data = r.data;
      const period = periods.find(p => String(p.id) === filterPeriod);
      const printWindow = window.open('', '_blank');
      const html = generatePrintHTML(data, period);
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.print();
    } catch {
      alert('Gagal membuat laporan');
    } finally { setLoading(false); }
  };

  function generatePrintHTML(data, period) {
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>KASI JADI — Rekap CKP ${period?.nama || ''}</title>
  <style>
    body { font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif; font-size: 12px; margin: 20px; color: #0f172a; }
    h1 { font-size: 16px; text-align: center; margin-bottom: 4px; color: #0052FF; font-weight: 700; }
    h2 { font-size: 13px; text-align: center; color: #475569; margin-bottom: 20px; font-weight: normal; }
    h3 { font-size: 13px; margin: 16px 0 8px; color: #0f172a; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 16px; border: 1px solid #cbd5e1; }
    th { background: #0052FF; color: white; padding: 6px 8px; text-align: left; font-size: 11px; border-bottom: 1px solid #0043D1; }
    td { padding: 5px 8px; border-bottom: 1px solid #e2e8f0; }
    tr:nth-child(even) td { background: #f8fafc; }
    .emp-header { background: #f8fafc; padding: 8px 12px; border: 1px solid #cbd5e1; border-left: 4px solid #0052FF; margin: 16px 0 8px; }
    .score-row { background: #f0fdfa; font-weight: bold; }
    @media print { .no-print { display: none; } }
  </style>
</head>
<body>
<h1>KASI JADI — REKAP CAPAIAN KINERJA PEGAWAI (CKP)</h1>
<h2>${period?.nama || 'Periode tidak diketahui'}</h2>
${data.map(d => {
  if (!d.employee) return '';
  return `
<div class="emp-header">
  <strong>${d.employee.nama}</strong> — ${d.employee.jabatan} | ${d.employee.unit_kerja}
  | NIP: ${d.employee.nip || '-'}
</div>
<h3>Kegiatan Harian</h3>
<table>
  <thead><tr><th>Tanggal</th><th>Kegiatan</th><th>Deskripsi</th><th>Target</th><th>Realisasi</th><th>Capaian</th><th>Status</th><th>Bukti / Geotag</th></tr></thead>
  <tbody>
    ${(d.activities || []).map(a => `<tr><td>${a.tanggal}</td><td>${a.nama_kegiatan}</td><td>${a.deskripsi || '-'}</td><td>${a.target || '-'} ${a.satuan || ''}</td><td>${a.realisasi || '-'}</td><td>${a.persentase_capaian || 0}%</td><td>${a.status_kegiatan}</td><td>${a.info_bukti || '-'}</td></tr>`).join('')}
  </tbody>
</table>
${d.ckp ? `
<div class="score-row">
  <table><tr>
    <td>Nilai PK: <strong>${d.ckp.nilai_pk}</strong></td>
    <td>Nilai Perilaku: <strong>${d.ckp.nilai_perilaku || '—'}</strong></td>
    <td>NILAI CKP: <strong>${d.ckp.nilai_ckp}</strong></td>
    <td>Status: <strong>${d.ckp.status}</strong></td>
  </tr></table>
</div>` : ''}
`;
}).join('<hr style="margin: 20px 0;">')}
<div style="margin-top:30px; text-align:right; color:#64748b; font-size:11px;">
  Dicetak pada: ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
</div>
</body>
</html>`;
  }

  return (
    <div className="space-y-5">
      <div className="card p-4 flex flex-wrap gap-3">
        <div>
          <label className="label">Periode *</label>
          <select className="input w-44" value={filterPeriod} onChange={e => setFilterPeriod(e.target.value)}>
            <option value="">Pilih Periode</option>
            {periods.map(p => <option key={p.id} value={p.id}>{p.nama}</option>)}
          </select>
        </div>
        {!isAnggota && (
          <div>
            <label className="label">Pegawai</label>
            <select className="input w-48" value={filterEmployee} onChange={e => setFilterEmployee(e.target.value)}>
              <option value="">Semua Pegawai</option>
              {employees.map(e => <option key={e.id} value={e.id}>{e.nama}</option>)}
            </select>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="card p-6 flex flex-col justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 bg-teal-50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800/60 rounded-xl flex items-center justify-center flex-shrink-0">
              <FileSpreadsheet className="w-5 h-5 text-teal-600 dark:text-teal-400" strokeWidth={1.8} />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-slate-900 dark:text-white">Export Excel (.xlsx)</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Ekspor rekap kegiatan harian, capaian PK, dan nilai akhir CKP dalam format spreadsheet.
              </p>
            </div>
          </div>
          <button onClick={handleExcelExport} disabled={loading} className="btn-teal w-full">
            <Download className="w-4 h-4" />
            {loading ? 'Memproses...' : 'Download Excel'}
          </button>
        </div>

        <div className="card p-6 flex flex-col justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 bg-[#0052FF]/10 dark:bg-[#0052FF]/15 border border-blue-200/70 dark:border-blue-800/60 rounded-xl flex items-center justify-center flex-shrink-0">
              <Printer className="w-5 h-5 text-[#0052FF] dark:text-blue-400" strokeWidth={1.8} />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-slate-900 dark:text-white">Cetak Laporan (PDF)</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Buka tampilan cetak resmi siap simpan sebagai dokumen PDF atau cetak langsung.
              </p>
            </div>
          </div>
          <button onClick={handlePrintPDF} disabled={loading} className="btn-primary w-full">
            <Printer className="w-4 h-4" />
            {loading ? 'Memproses...' : 'Cetak / Simpan PDF'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Pengaturan() {
  const [periods, setPeriods] = useState([]);
  const [settings, setSettings] = useState({});
  const [activePeriodWeights, setActivePeriodWeights] = useState([]);
  const [activePeriod, setActivePeriod] = useState(null);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('periode');

  const [periodForm, setPeriodForm] = useState({ nama: '', tahun: 2026, bulan: '', tanggal_mulai: '', tanggal_akhir: '', batas_pengisian: '', status: 'draft' });

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    const [periodsRes, , settingsRes] = await Promise.all([
      api.get('/periods'),
      api.get('/ckp-config/components'),
      api.get('/ckp-config/settings'),
    ]);
    setPeriods(periodsRes.data);
    setSettings(settingsRes.data);

    const active = periodsRes.data.find(p => p.is_active);
    setActivePeriod(active);
    if (active) {
      const wRes = await api.get(`/ckp-config/weights/${active.id}`);
      setActivePeriodWeights(wRes.data);
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      await api.put('/ckp-config/settings', settings);
      alert('Pengaturan berhasil disimpan');
    } catch { alert('Gagal menyimpan'); }
    finally { setSaving(false); }
  };

  const handleSaveWeights = async () => {
    if (!activePeriod) return;
    const total = activePeriodWeights.reduce((s, w) => s + parseFloat(w.bobot || 0), 0);
    if (Math.abs(total - 100) > 0.01) {
      alert(`Total bobot harus 100%. Saat ini: ${total.toFixed(1)}%`);
      return;
    }
    setSaving(true);
    try {
      await api.put(`/ckp-config/weights/${activePeriod.id}`, {
        weights: activePeriodWeights.map(w => ({ component_id: w.component_id, bobot: parseFloat(w.bobot) }))
      });
      alert('Bobot berhasil disimpan');
    } catch (err) { alert(err.response?.data?.error || 'Gagal menyimpan'); }
    finally { setSaving(false); }
  };

  const handleCreatePeriod = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/periods', periodForm);
      fetchAll();
      setPeriodForm({ nama: '', tahun: 2026, bulan: '', tanggal_mulai: '', tanggal_akhir: '', batas_pengisian: '', status: 'draft' });
      alert('Periode berhasil dibuat');
    } catch (err) { alert(err.response?.data?.error || 'Gagal'); }
    finally { setSaving(false); }
  };

  const handleActivatePeriod = async (id) => {
    if (!confirm('Aktifkan periode ini? Periode aktif sebelumnya akan dinonaktifkan.')) return;
    await api.put(`/periods/${id}/activate`);
    fetchAll();
  };

  const totalBobot = activePeriodWeights.reduce((s, w) => s + parseFloat(w.bobot || 0), 0);

  const TABS = [
    { id: 'periode', label: 'Manajemen Periode' },
    { id: 'bobot', label: 'Bobot CKP' },
    { id: 'pengaturan', label: 'Pengaturan Umum' },
    { id: 'export', label: 'Export Data' },
  ];

  return (
    <div className="space-y-6">
      <div className="page-header mb-0">
        <div>
          <h2 className="page-title">Pengaturan & Export</h2>
          <p className="page-subtitle">Konfigurasi periode, bobot komponen penilaian, dan ekspor laporan (Khusus KPA)</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="inline-flex flex-wrap gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === t.id
                ? 'bg-white dark:bg-slate-900 text-[#0052FF] dark:text-blue-400 shadow-sm border border-slate-200/80 dark:border-slate-700'
                : 'border border-transparent text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Periode Tab */}
      {activeTab === 'periode' && (
        <div className="space-y-5">
          <div className="card p-5">
            <h3 className="font-semibold text-sm text-slate-900 dark:text-white mb-4">Tambah Periode Baru</h3>
            <form onSubmit={handleCreatePeriod} className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="form-group col-span-2 sm:col-span-1">
                <label className="label">Nama Periode *</label>
                <input className="input" required placeholder="September 2026" value={periodForm.nama} onChange={e => setPeriodForm({ ...periodForm, nama: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="label">Bulan *</label>
                <select className="input tabular-num" required value={periodForm.bulan} onChange={e => setPeriodForm({ ...periodForm, bulan: e.target.value })}>
                  <option value="">Pilih</option>
                  {Array.from({length: 12}, (_, i) => <option key={i+1} value={i+1}>{i+1}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="label">Tahun *</label>
                <input className="input tabular-num" type="number" required value={periodForm.tahun} onChange={e => setPeriodForm({ ...periodForm, tahun: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="label">Tanggal Mulai *</label>
                <input className="input tabular-num" type="date" required value={periodForm.tanggal_mulai} onChange={e => setPeriodForm({ ...periodForm, tanggal_mulai: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="label">Tanggal Akhir *</label>
                <input className="input tabular-num" type="date" required value={periodForm.tanggal_akhir} onChange={e => setPeriodForm({ ...periodForm, tanggal_akhir: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="label">Batas Pengisian</label>
                <input className="input tabular-num" type="date" value={periodForm.batas_pengisian} onChange={e => setPeriodForm({ ...periodForm, batas_pengisian: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="label">Status</label>
                <select className="input" value={periodForm.status} onChange={e => setPeriodForm({ ...periodForm, status: e.target.value })}>
                  <option value="draft">Draft</option>
                  <option value="aktif">Aktif</option>
                </select>
              </div>
              <div className="flex items-end col-span-2 sm:col-span-3">
                <button type="submit" disabled={saving} className="btn-primary">
                  <Plus className="w-4 h-4" /> {saving ? 'Menyimpan...' : 'Tambah Periode'}
                </button>
              </div>
            </form>
          </div>

          <div className="card overflow-hidden">
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Nama Periode</th>
                    <th>Mulai</th>
                    <th>Akhir</th>
                    <th>Batas Isi</th>
                    <th>Status</th>
                    <th>Aktif</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {periods.map(p => (
                    <tr key={p.id} className={p.is_active ? 'bg-blue-50/60 dark:bg-blue-950/30' : ''}>
                      <td className="font-semibold text-slate-900 dark:text-slate-100">{p.nama}</td>
                      <td className="tabular-num text-xs">{p.tanggal_mulai}</td>
                      <td className="tabular-num text-xs">{p.tanggal_akhir}</td>
                      <td className="tabular-num text-xs">{p.batas_pengisian || '—'}</td>
                      <td>
                        <span className={p.status === 'aktif' ? 'badge-success' : p.status === 'tutup' ? 'badge-gray' : 'badge-warning'}>{p.status}</span>
                      </td>
                      <td>
                        {p.is_active ? (
                          <span className="badge-success">
                            <span className="w-1.5 h-1.5 rounded-full bg-white" />
                            Aktif
                          </span>
                        ) : '—'}
                      </td>
                      <td>
                        {!p.is_active && (
                          <button onClick={() => handleActivatePeriod(p.id)} className="btn-secondary btn-sm">Aktifkan</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Bobot Tab */}
      {activeTab === 'bobot' && (
        <div className="card p-5 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-sm text-slate-900 dark:text-white">Bobot Komponen CKP</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Periode aktif: {activePeriod?.nama || 'Tidak ada periode aktif'}</p>
            </div>
            <div className={`text-right ${Math.abs(totalBobot - 100) < 0.01 ? 'text-teal-600 dark:text-teal-400' : 'text-amber-600 dark:text-amber-400'}`}>
              <p className="text-[11px] font-semibold uppercase tracking-wider">Total Bobot</p>
              <p className="text-2xl font-bold tabular-num">{totalBobot.toFixed(0)}%</p>
            </div>
          </div>

          {Math.abs(totalBobot - 100) > 0.01 && (
            <div className="flex items-center gap-2 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 rounded-xl text-rose-700 dark:text-rose-300 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 flex-shrink-0" /> Total bobot harus tepat 100%
            </div>
          )}

          <div className="space-y-3">
            {activePeriodWeights.map((w, i) => (
              <div key={w.component_id} className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{w.nama}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{w.deskripsi}</p>
                </div>
                <div className="flex items-center gap-2.5">
                  <input
                    type="number" min="0" max="100" step="5"
                    className="input w-24 text-center tabular-num font-semibold"
                    value={w.bobot}
                    onChange={e => {
                      const updated = [...activePeriodWeights];
                      updated[i] = { ...updated[i], bobot: e.target.value };
                      setActivePeriodWeights(updated);
                    }}
                  />
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">%</span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={handleSaveWeights} disabled={saving || Math.abs(totalBobot - 100) > 0.01} className="btn-teal">
              <Save className="w-4 h-4" /> {saving ? 'Menyimpan...' : 'Simpan Bobot'}
            </button>
          </div>
        </div>
      )}

      {/* General Settings Tab */}
      {activeTab === 'pengaturan' && (
        <div className="card p-5 space-y-5">
          <h3 className="font-semibold text-sm text-slate-900 dark:text-white">Pengaturan Umum</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="label">Nama Aplikasi</label>
              <input className="input" value={settings.app_name || ''} onChange={e => setSettings({ ...settings, app_name: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="label">Nama Instansi</label>
              <input className="input" value={settings.instansi || ''} onChange={e => setSettings({ ...settings, instansi: e.target.value })} />
            </div>
          </div>

          <div className="form-group">
            <label className="label">Hari Kerja (Pengisian Wajib)</label>
            <input className="input" value={settings.hari_kerja || ''} onChange={e => setSettings({ ...settings, hari_kerja: e.target.value })} placeholder="senin,selasa,rabu,kamis,jumat" />
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Pisahkan dengan koma. Contoh: senin,selasa,rabu,kamis,jumat</p>
          </div>

          <div className="form-group">
            <label className="label">Toleransi Keterlambatan Pengisian (hari)</label>
            <input className="input tabular-num w-32" type="number" min="0" value={settings.toleransi_hari || ''} onChange={e => setSettings({ ...settings, toleransi_hari: e.target.value })} />
          </div>

          <div className="form-group">
            <label className="inline-flex items-center gap-2.5 text-sm font-semibold text-slate-800 dark:text-slate-200 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border border-slate-300 dark:border-slate-600 text-[#0052FF] focus:ring-[#0052FF]"
                checked={settings.reminder_enabled === 'true'}
                onChange={e => setSettings({ ...settings, reminder_enabled: e.target.checked ? 'true' : 'false' })}
              />
              Aktifkan reminder otomatis
            </label>
          </div>

          <button onClick={handleSaveSettings} disabled={saving} className="btn-primary">
            <Save className="w-4 h-4" /> {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
          </button>
        </div>
      )}

      {activeTab === 'export' && <ExportView />}
    </div>
  );
}

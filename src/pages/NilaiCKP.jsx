import { useEffect, useState, useCallback } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Award, Lock, Save, UserCheck, Download, CheckCircle2, Clock } from 'lucide-react';

function TabSwitch({ tabs, active, onChange }) {
  return (
    <div className="inline-flex gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700 w-fit">
      {tabs.map(t => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            active === t.id
              ? 'bg-white dark:bg-slate-900 text-[#0052FF] dark:text-blue-400 shadow-sm border border-slate-200/80 dark:border-slate-700'
              : 'border border-transparent text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          {t.icon && <t.icon className="w-3.5 h-3.5" />}
          {t.label}
        </button>
      ))}
    </div>
  );
}

function NilaiCKPView({ periods, employees, isKPA, isAnggota, user }) {
  const [filterPeriod, setFilterPeriod] = useState('');
  const [filterEmployee, setFilterEmployee] = useState('');
  const [ckpData, setCkpData] = useState(null);
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(false);
  const [savingScore, setSavingScore] = useState(false);
  const [finalizing, setFinalizing] = useState(false);

  const [inputPK, setInputPK] = useState('');
  const [inputCatatan, setInputCatatan] = useState('');

  useEffect(() => {
    const active = periods.find(p => p.is_active);
    if (active) setFilterPeriod(String(active.id));
  }, [periods]);

  const fetchCKP = useCallback(async () => {
    const empId = isAnggota ? user?.employeeId : filterEmployee;
    if (!filterPeriod || !empId) { setCkpData(null); return; }
    setLoading(true);
    try {
      const r = await api.get('/scores/ckp', { params: { period_id: filterPeriod, employee_id: empId } });
      setCkpData(r.data);
      setInputPK(r.data?.nilai_pk ?? 0);
      setInputCatatan(r.data?.catatan || '');
    } catch { setCkpData(null); }
    finally { setLoading(false); }
  }, [filterPeriod, filterEmployee, isAnggota, user]);

  const fetchSummary = useCallback(async () => {
    if (!filterPeriod || isAnggota) return;
    try {
      const r = await api.get('/scores/summary', { params: { period_id: filterPeriod } });
      setSummary(r.data);
    } catch {}
  }, [filterPeriod, isAnggota]);

  useEffect(() => { fetchCKP(); fetchSummary(); }, [fetchCKP, fetchSummary]);

  const handleSaveScore = async () => {
    if (!filterEmployee || !filterPeriod) return;
    setSavingScore(true);
    try {
      await api.put('/scores/ckp', {
        employee_id: filterEmployee,
        period_id: filterPeriod,
        nilai_pk: parseFloat(inputPK) || 0,
        catatan: inputCatatan
      });
      await fetchCKP();
      await fetchSummary();
      alert('Nilai CKP berhasil disimpan oleh KPA');
    } catch (err) {
      alert(err.response?.data?.error || 'Gagal menyimpan nilai CKP');
    } finally {
      setSavingScore(false);
    }
  };

  const handleFinalize = async () => {
    const empId = filterEmployee;
    if (!empId || !filterPeriod) return;
    if (!confirm('Finalisasi nilai CKP? Nilai akan dikunci.')) return;
    setFinalizing(true);
    try {
      await api.post('/scores/ckp/finalize', {
        employee_id: empId,
        period_id: filterPeriod,
        nilai_pk: parseFloat(inputPK) || 0
      });
      fetchCKP();
      fetchSummary();
      alert('Nilai CKP berhasil difinalisasi');
    } catch (err) { alert(err.response?.data?.error || 'Gagal'); }
    finally { setFinalizing(false); }
  };

  const getNilaiLabel = (nilai) => {
    if (nilai >= 110) return { label: 'Sangat Baik', color: 'text-teal-600 dark:text-teal-400' };
    if (nilai >= 90) return { label: 'Baik', color: 'text-[#0052FF] dark:text-blue-400' };
    if (nilai >= 70) return { label: 'Cukup', color: 'text-amber-600 dark:text-amber-400' };
    return { label: 'Kurang', color: 'text-rose-600 dark:text-rose-400' };
  };

  const nilaiLabel = ckpData ? getNilaiLabel(ckpData.nilai_ckp) : null;

  const handleDownloadPeriodExcel = async () => {
    if (!filterPeriod) return alert('Pilih periode terlebih dahulu');
    try {
      const params = { period_id: filterPeriod };
      if (!isAnggota && filterEmployee) params.employee_id = filterEmployee;
      const response = await api.get('/export/excel', { params, responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const period = periods.find(p => String(p.id) === String(filterPeriod));
      link.setAttribute('download', `Hasil_Kerja_${(period?.nama || filterPeriod).replace(/\s+/g, '_')}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      alert('Gagal mengunduh hasil kerja periode');
    }
  };

  return (
    <div className="space-y-5">
      {/* Filters */}
      <div className="card p-4 flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-wrap gap-3">
          <div>
            <label className="label">Periode</label>
            <select className="input w-44" value={filterPeriod} onChange={e => setFilterPeriod(e.target.value)}>
              <option value="">Pilih Periode</option>
              {periods.map(p => <option key={p.id} value={p.id}>{p.nama}</option>)}
            </select>
          </div>
          {!isAnggota && (
            <div>
              <label className="label">Pegawai</label>
              <select className="input w-52" value={filterEmployee} onChange={e => setFilterEmployee(e.target.value)}>
                <option value="">Pilih Pegawai</option>
                {employees.map(e => <option key={e.id} value={e.id}>{e.nama}</option>)}
              </select>
            </div>
          )}
        </div>
        <button onClick={handleDownloadPeriodExcel} className="btn-teal btn-sm">
          <Download className="w-3.5 h-3.5" />
          Download Excel Periode
        </button>
      </div>

      {loading && (
        <div className="flex justify-center py-12">
          <div className="w-7 h-7 border-2 border-[#0052FF] dark:border-blue-400 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* CKP Detail */}
      {ckpData && !loading && (
        <>
          {/* Score Showcase */}
          <div className="rounded-2xl bg-gradient-to-br from-[#0052FF] to-[#003EC7] dark:from-[#111827] dark:to-[#1E293B] border border-[#0052FF]/20 dark:border-slate-700 text-white p-6 shadow-card">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-blue-100 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">Nilai Akhir CKP</p>
                <p className="text-5xl font-bold tracking-tight tabular-num mt-1.5">{ckpData.nilai_ckp}</p>
                <p className={`text-sm font-semibold mt-2 ${ckpData.nilai_ckp >= 90 ? 'text-teal-200 dark:text-teal-300' : 'text-amber-200 dark:text-amber-300'}`}>
                  Predikat: {nilaiLabel?.label}
                </p>
              </div>
              <div className="flex flex-col items-end gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/15 dark:bg-slate-800 border border-white/25 dark:border-slate-700 flex items-center justify-center">
                  <Award className="w-6 h-6 text-white dark:text-blue-400" strokeWidth={1.8} />
                </div>
                {ckpData.status === 'final' ? (
                  <span className="inline-flex items-center gap-1.5 bg-teal-500/20 border border-teal-300/40 text-teal-50 dark:bg-teal-950/60 dark:border-teal-700 dark:text-teal-300 px-3 py-1 rounded-full text-xs font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Final
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 bg-amber-500/20 border border-amber-300/40 text-amber-50 dark:bg-amber-950/60 dark:border-amber-700 dark:text-amber-300 px-3 py-1 rounded-full text-xs font-semibold">
                    <Clock className="w-3.5 h-3.5" />
                    Draft
                  </span>
                )}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/15 dark:border-slate-700 grid grid-cols-2 gap-4">
              <div>
                <p className="text-blue-100 dark:text-slate-400 text-xs font-medium">Nilai Capaian (PK)</p>
                <p className="text-2xl font-bold tabular-num mt-0.5">{ckpData.nilai_pk}</p>
              </div>
              <div>
                <p className="text-blue-100 dark:text-slate-400 text-xs font-medium">Nilai Perilaku</p>
                <p className="text-2xl font-bold tabular-num mt-0.5">{ckpData.nilai_perilaku || '—'}</p>
              </div>
            </div>
          </div>

          {/* Components Breakdown */}
          {ckpData.components?.length > 0 && (
            <div className="card p-5 space-y-5">
              <h3 className="font-semibold text-slate-900 dark:text-white text-sm">Komponen Nilai CKP</h3>
              <div className="space-y-3">
                {ckpData.components.map(c => (
                  <div key={c.kode} className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl">
                    <div className="w-10 h-10 bg-[#0052FF]/10 dark:bg-[#0052FF]/15 border border-blue-200/70 dark:border-blue-800/60 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-[#0052FF] dark:text-blue-400 font-bold text-xs tabular-num">{c.kode}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between mb-1.5 gap-2">
                        <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                          {c.kode === 'PK' ? 'Nilai Capaian Kinerja' : 'Nilai Perilaku Kerja'}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 tabular-num flex-shrink-0">
                          Bobot <strong className="text-slate-900 dark:text-white">{c.bobot}%</strong>
                        </span>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-fill bg-[#0052FF] dark:bg-blue-500" style={{ width: `${Math.min(c.nilai, 100)}%` }} />
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 w-28 tabular-num">
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">Nilai × Bobot</p>
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">{c.nilai} × {c.bobot}%</p>
                      <p className="text-sm text-[#0052FF] dark:text-blue-400 font-bold">= {c.nilai_tertimbang}</p>
                    </div>
                  </div>
                ))}

                {/* Formula */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl">
                  <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Formula Perhitungan</p>
                  <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 tabular-num">
                    Nilai CKP = {ckpData.components?.map(c => `(${c.nilai} × ${c.bobot}%)`).join(' + ')}
                    {' = '}<strong className="text-[#0052FF] dark:text-blue-400 font-bold">{ckpData.nilai_ckp}</strong>
                  </p>
                </div>
              </div>

              {isKPA && filterEmployee && (
                <div className="pt-5 border-t border-slate-200 dark:border-slate-800 space-y-4">
                  <div>
                    <h4 className="font-semibold text-sm text-slate-900 dark:text-white">Input Penilaian CKP oleh KPA</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Referensi rata-rata capaian kegiatan harian: <span className="font-semibold tabular-num text-[#0052FF] dark:text-blue-400">{ckpData.nilai_pk_auto ?? 0}%</span>
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="form-group">
                      <label className="label">Nilai Capaian Kinerja / PK (0–120)</label>
                      <input
                        type="number"
                        min="0"
                        max="120"
                        step="0.5"
                        className="input tabular-num font-semibold text-[#0052FF] dark:text-blue-400"
                        value={inputPK}
                        onChange={e => setInputPK(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label className="label">Catatan Penilaian CKP</label>
                      <input
                        type="text"
                        className="input"
                        placeholder="Catatan KPA untuk nilai CKP..."
                        value={inputCatatan}
                        onChange={e => setInputCatatan(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    <button onClick={handleSaveScore} disabled={savingScore} className="btn-primary">
                      <Save className="w-4 h-4" />
                      {savingScore ? 'Menyimpan...' : 'Simpan Nilai CKP'}
                    </button>
                    {ckpData.status !== 'final' && (
                      <button onClick={handleFinalize} disabled={finalizing} className="btn-teal">
                        <Lock className="w-4 h-4" />
                        {finalizing ? 'Memproses...' : 'Finalisasi CKP'}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* All employees summary table */}
      {!isAnggota && summary.length > 0 && (
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40">
            <h3 className="font-semibold text-sm text-slate-900 dark:text-white">Rekap Nilai CKP Semua Pegawai</h3>
          </div>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Pegawai</th>
                  <th>Unit Kerja</th>
                  <th>Hari Pengisian</th>
                  <th>Nilai PK</th>
                  <th>Nilai CKP</th>
                  <th>Status</th>
                  <th>Predikat</th>
                </tr>
              </thead>
              <tbody>
                {summary.map(emp => {
                  const label = emp.nilai_ckp ? getNilaiLabel(emp.nilai_ckp) : null;
                  return (
                    <tr key={emp.id}>
                      <td className="font-semibold text-slate-900 dark:text-slate-100">{emp.nama}</td>
                      <td className="text-slate-500 dark:text-slate-400 text-xs">{emp.unit_kerja}</td>
                      <td className="tabular-num">{emp.hari_pengisian} hari</td>
                      <td>
                        {emp.nilai_pk
                          ? <span className="font-semibold tabular-num text-[#0052FF] dark:text-blue-400">{emp.nilai_pk}</span>
                          : <span className="text-slate-400">—</span>
                        }
                      </td>
                      <td>
                        {emp.nilai_ckp
                          ? <span className={`text-base font-bold tabular-num ${label?.color}`}>{emp.nilai_ckp}</span>
                          : <span className="text-slate-400 text-xs">Belum dihitung</span>
                        }
                      </td>
                      <td>
                        {emp.status_ckp === 'final'
                          ? <span className="badge-success">Final</span>
                          : <span className="badge-warning">Draft</span>
                        }
                      </td>
                      <td>
                        {label ? (
                          <span className={`badge ${emp.nilai_ckp >= 90 ? 'badge-success' : emp.nilai_ckp >= 70 ? 'badge-info' : 'badge-warning'}`}>
                            {label.label}
                          </span>
                        ) : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

const ASPEK = [
  { key: 'orientasi_pelayanan', label: 'Orientasi Pelayanan', desc: 'Komitmen memberikan pelayanan prima' },
  { key: 'akuntabel', label: 'Akuntabel', desc: 'Bertanggung jawab atas kepercayaan' },
  { key: 'kompeten', label: 'Kompeten', desc: 'Terus belajar dan mengembangkan kapabilitas' },
  { key: 'harmonis', label: 'Harmonis', desc: 'Saling peduli dan menghargai perbedaan' },
  { key: 'loyal', label: 'Loyal', desc: 'Berdedikasi dan mengutamakan kepentingan bangsa' },
  { key: 'adaptif', label: 'Adaptif', desc: 'Terus berinovasi dan antusias dalam perubahan' },
  { key: 'kolaboratif', label: 'Kolaboratif', desc: 'Membangun sinergi untuk hasil yang lebih baik' },
];

function ScoreInput({ value, onChange, disabled }) {
  const num = parseFloat(value) || 0;
  const color = num >= 90
    ? 'text-teal-600 dark:text-teal-400'
    : num >= 75
      ? 'text-[#0052FF] dark:text-blue-400'
      : num >= 60
        ? 'text-amber-600 dark:text-amber-400'
        : 'text-rose-600 dark:text-rose-400';
  return (
    <div className="flex items-center gap-3">
      <input
        type="number" min="0" max="100" step="0.5"
        disabled={disabled}
        className={`input w-24 text-center tabular-num font-semibold ${color} ${disabled ? 'bg-slate-50 dark:bg-slate-800/50' : ''}`}
        value={value}
        onChange={e => onChange(e.target.value)}
      />
      <div className="flex-1 progress-bar">
        <div
          className={`progress-fill ${
            num >= 90 ? 'bg-teal-500' : num >= 75 ? 'bg-[#0052FF]' : num >= 60 ? 'bg-amber-500' : 'bg-rose-500'
          }`}
          style={{ width: `${Math.min(num, 100)}%` }}
        />
      </div>
      <span className={`text-xs font-bold w-12 text-right tabular-num ${color}`}>{num.toFixed(1)}</span>
    </div>
  );
}

function PerilakuView({ periods, employees, isKPA, isAnggota, user }) {
  const [filterPeriod, setFilterPeriod] = useState('');
  const [filterEmployee, setFilterEmployee] = useState('');
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    orientasi_pelayanan: 0, akuntabel: 0, kompeten: 0,
    harmonis: 0, loyal: 0, adaptif: 0, kolaboratif: 0, catatan: ''
  });
  const [existingId, setExistingId] = useState(null);

  const nilai_akhir = Math.round(
    ASPEK.reduce((s, a) => s + (parseFloat(form[a.key]) || 0), 0) / ASPEK.length * 10
  ) / 10;

  useEffect(() => {
    const active = periods.find(p => p.is_active);
    if (active) setFilterPeriod(String(active.id));
  }, [periods]);

  const fetchAssessments = useCallback(async () => {
    const params = {};
    if (filterPeriod) params.period_id = filterPeriod;
    if (filterEmployee) params.employee_id = filterEmployee;
    setLoading(true);
    try {
      const r = await api.get('/behavior', { params });
      setAssessments(r.data);
      if (filterEmployee && filterPeriod) {
        const existing = r.data[0];
        if (existing) {
          setExistingId(existing.id);
          setForm({
            orientasi_pelayanan: existing.orientasi_pelayanan,
            akuntabel: existing.akuntabel,
            kompeten: existing.kompeten,
            harmonis: existing.harmonis,
            loyal: existing.loyal,
            adaptif: existing.adaptif,
            kolaboratif: existing.kolaboratif,
            catatan: existing.catatan || ''
          });
        } else {
          setExistingId(null);
          setForm({ orientasi_pelayanan: 0, akuntabel: 0, kompeten: 0, harmonis: 0, loyal: 0, adaptif: 0, kolaboratif: 0, catatan: '' });
        }
      }
    } finally { setLoading(false); }
  }, [filterPeriod, filterEmployee]);

  useEffect(() => { fetchAssessments(); }, [fetchAssessments]);

  const handleSave = async () => {
    if (!filterPeriod || (!isAnggota && !filterEmployee)) {
      alert('Pilih pegawai dan periode terlebih dahulu');
      return;
    }
    setSaving(true);
    try {
      const payload = { ...form, period_id: filterPeriod, employee_id: isAnggota ? user?.employeeId : filterEmployee };
      if (existingId) await api.put(`/behavior/${existingId}`, payload);
      else await api.post('/behavior', payload);
      fetchAssessments();
      alert('Penilaian perilaku berhasil disimpan');
    } catch (err) { alert(err.response?.data?.error || 'Gagal menyimpan'); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-5">
      <div className="card p-4 flex flex-wrap gap-3">
        <div>
          <label className="label">Periode</label>
          <select className="input w-44" value={filterPeriod} onChange={e => setFilterPeriod(e.target.value)}>
            <option value="">Pilih Periode</option>
            {periods.map(p => <option key={p.id} value={p.id}>{p.nama}</option>)}
          </select>
        </div>
        {!isAnggota && (
          <div>
            <label className="label">Pegawai</label>
            <select className="input w-52" value={filterEmployee} onChange={e => setFilterEmployee(e.target.value)}>
              <option value="">Pilih Pegawai</option>
              {employees.map(e => <option key={e.id} value={e.id}>{e.nama}</option>)}
            </select>
          </div>
        )}
      </div>

      {isKPA && filterEmployee && filterPeriod && (
        <div className="card p-5">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm text-slate-900 dark:text-white">Input Nilai Perilaku</h3>
              {existingId && <span className="badge-warning text-[11px]">Mode Edit</span>}
            </div>
            <div className="text-right">
              <p className="text-[11px] font-semibold uppercase text-slate-500 dark:text-slate-400">Rata-rata</p>
              <p className={`text-2xl font-bold tabular-num ${
                nilai_akhir >= 90 ? 'text-teal-600 dark:text-teal-400' : nilai_akhir >= 75 ? 'text-[#0052FF] dark:text-blue-400' : 'text-amber-600 dark:text-amber-400'
              }`}>
                {nilai_akhir}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {ASPEK.map(aspek => (
              <div key={aspek.key} className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{aspek.label}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{aspek.desc}</p>
                </div>
                <div className="md:col-span-2">
                  <ScoreInput
                    value={form[aspek.key]}
                    onChange={v => setForm({ ...form, [aspek.key]: v })}
                  />
                </div>
              </div>
            ))}

            <div className="form-group pt-3 border-t border-slate-200 dark:border-slate-800">
              <label className="label">Catatan</label>
              <textarea
                className="input resize-none" rows={2}
                placeholder="Catatan penilaian..."
                value={form.catatan}
                onChange={e => setForm({ ...form, catatan: e.target.value })}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={handleSave} disabled={saving} className="btn-teal">
                <Save className="w-4 h-4" />
                {saving ? 'Menyimpan...' : existingId ? 'Perbarui Nilai' : 'Simpan Penilaian'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40">
          <h3 className="font-semibold text-sm text-slate-900 dark:text-white">Riwayat Penilaian Perilaku</h3>
        </div>
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-6 h-6 border-2 border-[#0052FF] dark:border-blue-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  {!isAnggota && <th>Pegawai</th>}
                  <th>Periode</th>
                  <th>Orientasi</th>
                  <th>Akuntabel</th>
                  <th>Kompeten</th>
                  <th>Harmonis</th>
                  <th>Loyal</th>
                  <th>Adaptif</th>
                  <th>Kolab.</th>
                  <th>Akhir</th>
                  <th>Penilai</th>
                </tr>
              </thead>
              <tbody>
                {assessments.length === 0 && (
                  <tr><td colSpan="12" className="text-center text-slate-400 py-10">Belum ada data penilaian</td></tr>
                )}
                {assessments.map(a => (
                  <tr key={a.id}>
                    {!isAnggota && <td className="font-semibold text-slate-900 dark:text-slate-100">{a.pegawai_nama}</td>}
                    <td className="text-xs">{a.period_nama}</td>
                    {ASPEK.map(asp => (
                      <td key={asp.key} className="text-center tabular-num">
                        <span className={`font-semibold ${
                          a[asp.key] >= 90 ? 'text-teal-600 dark:text-teal-400' : a[asp.key] >= 75 ? 'text-[#0052FF] dark:text-blue-400' : 'text-amber-600 dark:text-amber-400'
                        }`}>
                          {a[asp.key]}
                        </span>
                      </td>
                    ))}
                    <td className="tabular-num">
                      <span className={`font-bold ${
                        a.nilai_akhir >= 90 ? 'text-teal-600 dark:text-teal-400' : a.nilai_akhir >= 75 ? 'text-[#0052FF] dark:text-blue-400' : 'text-amber-600 dark:text-amber-400'
                      }`}>
                        {a.nilai_akhir}
                      </span>
                    </td>
                    <td className="text-xs text-slate-500 dark:text-slate-400">{a.assessed_by_name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default function NilaiCKP() {
  const { isKPA, isKasubbag, isAnggota, user } = useAuth();
  const [activeTab, setActiveTab] = useState('ckp');
  const [periods, setPeriods] = useState([]);
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    api.get('/periods').then(r => setPeriods(r.data));
    if (!isAnggota) api.get('/users/employees').then(r => setEmployees(r.data.filter(e => e.role === 'Anggota')));
  }, [isAnggota]);

  const TABS = [
    { id: 'ckp', label: 'Nilai CKP', icon: Award },
    { id: 'perilaku', label: 'Penilaian Perilaku', icon: UserCheck },
  ];

  return (
    <div className="space-y-6">
      <div className="page-header mb-0">
        <div>
          <h2 className="page-title">Nilai & Evaluasi CKP</h2>
          <p className="page-subtitle">Capaian kinerja dan penilaian perilaku pegawai BerAKHLAK</p>
        </div>
        <TabSwitch tabs={TABS} active={activeTab} onChange={setActiveTab} />
      </div>

      {activeTab === 'ckp' && (
        <NilaiCKPView
          periods={periods}
          employees={employees}
          isKPA={isKPA}
          isKasubbag={isKasubbag}
          isAnggota={isAnggota}
          user={user}
        />
      )}

      {activeTab === 'perilaku' && (
        <PerilakuView
          periods={periods}
          employees={employees}
          isKPA={isKPA}
          isAnggota={isAnggota}
          user={user}
        />
      )}
    </div>
  );
}

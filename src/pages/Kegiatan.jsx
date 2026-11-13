import { useEffect, useState, useCallback } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import {
  Plus, Edit2, Trash2, Eye, X, Check, ChevronLeft, ChevronRight,
  List, RefreshCw, Upload, Link as LinkIcon, Download,
  Printer, MapPin, Paperclip, Minus
} from 'lucide-react';
import { KjCalendarIcon, KjDailyLogIcon } from '../components/Brand/KasiJadiIcons';

const STATUS_LABELS = {
  selesai: { label: 'BERES!', class: 'badge-success' },
  dalam_proses: { label: 'Dalam Proses', class: 'badge-warning' },
  ditunda: { label: 'Ditunda', class: 'badge-gray' },
  dibatalkan: { label: 'Dibatalkan', class: 'badge-danger' },
};

const STATUS_CONFIG = {
  lengkap: {
    label: 'Sudah Diisi',
    dot: 'bg-[#00B4D8]',
    tile: 'bg-[#00B4D8]/15 dark:bg-[#00B4D8]/20 text-[#1E293B] dark:text-[#7ce8ff] border-[#1E293B] dark:border-slate-500 shadow-[1px_2px_0px_#1E293B] dark:shadow-[1px_2px_0px_#020617]',
  },
  sebagian: {
    label: 'Belum Lengkap',
    dot: 'bg-[#FF6B35]',
    tile: 'bg-[#FF6B35]/15 dark:bg-[#FF6B35]/20 text-[#1E293B] dark:text-[#ffb499] border-[#1E293B] dark:border-slate-500 shadow-[1px_2px_0px_#1E293B] dark:shadow-[1px_2px_0px_#020617]',
  },
  belum: {
    label: 'Belum Diisi',
    dot: 'bg-rose-500',
    tile: 'bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 border-[#1E293B]/60 dark:border-slate-600',
  },
  weekend: {
    label: 'Hari Libur',
    dot: 'bg-slate-300 dark:bg-slate-700',
    tile: 'bg-[#F4F6F9]/60 dark:bg-slate-900/40 text-slate-400 dark:text-slate-600 border-transparent',
  },
};

const MONTHS_ID = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
const DAYS_ID = ['Min','Sen','Sel','Rab','Kam','Jum','Sab'];

function getDaysInMonth(year, month) { return new Date(year, month + 1, 0).getDate(); }
function getFirstDayOfMonth(year, month) { return new Date(year, month, 1).getDay(); }
function isWeekend(year, month, day) { const dow = new Date(year, month, day).getDay(); return dow === 0 || dow === 6; }
function dateStr(year, month, day) { return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`; }

function Modal({ open, onClose, title, children, size = 'md' }) {
  if (!open) return null;
  const sizeMap = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px] animate-fade-in" onClick={onClose} />
      <div className={`relative bg-white dark:bg-[#1E293B] border-2 border-[#1E293B] dark:border-slate-400 rounded-2xl shadow-[5px_6px_0px_#1E293B] dark:shadow-[5px_6px_0px_#020617] w-full ${sizeMap[size]} animate-fade-in-up max-h-[90vh] flex flex-col overflow-hidden`}>
        <div className="flex items-center justify-between px-5 py-4 border-b-2 border-[#1E293B] dark:border-slate-600 bg-[#F4F6F9] dark:bg-slate-800 flex-shrink-0">
          <h3 className="font-bold text-sm text-[#1E293B] dark:text-white">{title}</h3>
          <button onClick={onClose} className="p-1.5 bg-white dark:bg-slate-700 border-[1.5px] border-[#1E293B] dark:border-slate-500 shadow-[1px_2px_0px_#1E293B] dark:shadow-[1px_2px_0px_#020617] rounded-lg text-[#1E293B] dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 p-5">{children}</div>
      </div>
    </div>
  );
}

function TabSwitch({ tabs, active, onChange }) {
  return (
    <div className="inline-flex gap-1.5 bg-[#F4F6F9] dark:bg-slate-800 p-1.5 rounded-xl border-2 border-[#1E293B] dark:border-slate-500 shadow-[2px_3px_0px_#1E293B] dark:shadow-[2px_3px_0px_#020617] w-fit">
      {tabs.map(t => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
            active === t.id
              ? 'bg-[#0052FF] text-white border-2 border-[#1E293B] dark:border-slate-400 shadow-[1px_2px_0px_#1E293B] dark:shadow-[1px_2px_0px_#020617]'
              : 'border-2 border-transparent text-[#1E293B] dark:text-slate-300 hover:bg-white/70 dark:hover:bg-slate-700/60'
          }`}
        >
          {t.icon && <t.icon className="w-4 h-4" />}
          {t.label}
        </button>
      ))}
    </div>
  );
}

function KegiatanForm({ periods, employees, onSubmit, loading, initialData }) {
  const { isAnggota, user } = useAuth();
  const today = new Date().toISOString().split('T')[0];
  const activePeriod = periods.find(p => p.is_active) || periods.find(p => p.status === 'aktif');

  const [form, setForm] = useState({
    period_id: activePeriod ? String(activePeriod.id) : '',
    employee_id: isAnggota ? user?.employeeId : '',
    performance_plan_id: '',
    tanggal: today,
    nama_kegiatan: '',
    deskripsi: '',
    target: '',
    satuan: '',
    realisasi: '',
    status_kegiatan: 'selesai',
    catatan: '',
    ...initialData
  });
  const [files, setFiles] = useState([]);
  const [links, setLinks] = useState([]);

  const addLink = () => setLinks(l => [...l, { judul: '', url: '', platform: '', keterangan: '' }]);
  const updateLink = (i, patch) => setLinks(l => l.map((x, idx) => idx === i ? { ...x, ...patch } : x));
  const removeLink = (i) => setLinks(l => l.filter((_, idx) => idx !== i));

  const capaian = form.target && form.realisasi
    ? Math.min(Math.round((parseFloat(form.realisasi) / parseFloat(form.target)) * 100), 100)
    : 0;

  return (
    <form onSubmit={e => { e.preventDefault(); onSubmit(form, { files, links: links.filter(l => l.judul || l.url) }); }} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="form-group">
          <label className="label">Periode *</label>
          <select className="input" required value={form.period_id} onChange={e => setForm({ ...form, period_id: e.target.value })}>
            <option value="">Pilih Periode</option>
            {periods.filter(p => p.status === 'aktif').map(p => <option key={p.id} value={p.id}>{p.nama}</option>)}
          </select>
        </div>
        {!isAnggota && (
          <div className="form-group">
            <label className="label">Pegawai *</label>
            <select className="input" required value={form.employee_id} onChange={e => setForm({ ...form, employee_id: e.target.value })}>
              <option value="">Pilih Pegawai</option>
              {employees.map(e => <option key={e.id} value={e.id}>{e.nama}</option>)}
            </select>
          </div>
        )}
        <div className="form-group">
          <label className="label">Tanggal *</label>
          <input className="input font-mono" type="date" required value={form.tanggal} onChange={e => setForm({ ...form, tanggal: e.target.value })} />
        </div>
      </div>

      <div className="form-group">
        <label className="label">Nama Kegiatan *</label>
        <input className="input" required placeholder="Contoh: Pemeriksaan data hasil survei lapangan" value={form.nama_kegiatan} onChange={e => setForm({ ...form, nama_kegiatan: e.target.value })} />
      </div>

      <div className="form-group">
        <label className="label">Deskripsi Kegiatan</label>
        <textarea className="input resize-none" rows={2} placeholder="Deskripsi singkat kegiatan..." value={form.deskripsi} onChange={e => setForm({ ...form, deskripsi: e.target.value })} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="form-group">
          <label className="label">Target</label>
          <input className="input font-mono" type="number" min="0" placeholder="0" value={form.target} onChange={e => setForm({ ...form, target: e.target.value })} />
        </div>
        <div className="form-group">
          <label className="label">Satuan</label>
          <input className="input" placeholder="Dokumen" value={form.satuan} onChange={e => setForm({ ...form, satuan: e.target.value })} />
        </div>
        <div className="form-group">
          <label className="label">Realisasi</label>
          <input className="input font-mono" type="number" min="0" placeholder="0" value={form.realisasi} onChange={e => setForm({ ...form, realisasi: e.target.value })} />
        </div>
        <div className="form-group">
          <label className="label">Capaian</label>
          <div className={`input font-mono font-extrabold tabular-num bg-[#F4F6F9] dark:bg-slate-800/70 ${
            capaian >= 100
              ? 'text-[#00B4D8]'
              : capaian >= 70
                ? 'text-[#0052FF] dark:text-[#60A5FA]'
                : 'text-[#FF6B35]'
          }`}>
            {capaian}%
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="form-group">
          <label className="label">Status Kegiatan</label>
          <select className="input" value={form.status_kegiatan} onChange={e => setForm({ ...form, status_kegiatan: e.target.value })}>
            <option value="selesai">BERES! (Selesai)</option>
            <option value="dalam_proses">Dalam Proses</option>
            <option value="ditunda">Ditunda</option>
            <option value="dibatalkan">Dibatalkan</option>
          </select>
        </div>
        <div className="form-group">
          <label className="label">Catatan</label>
          <input className="input" placeholder="Catatan tambahan..." value={form.catatan} onChange={e => setForm({ ...form, catatan: e.target.value })} />
        </div>
      </div>

      {/* Bukti Dukung */}
      <div className="space-y-3 border-t-2 border-[#1E293B]/15 dark:border-slate-700 pt-4">
        <p className="label">Bukti Dukung (opsional)</p>
        <div className="flex gap-2 flex-wrap">
          <label className="btn-secondary btn-sm cursor-pointer">
            <Upload className="w-3.5 h-3.5" /> Pilih File
            <input type="file" className="hidden" multiple accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip"
              onChange={e => { setFiles(f => [...f, ...Array.from(e.target.files)]); e.target.value = ''; }} />
          </label>
          <button type="button" onClick={addLink} className="btn-secondary btn-sm">
            <LinkIcon className="w-3.5 h-3.5" /> Tambah Link
          </button>
        </div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400">Format: JPG, PNG, PDF, DOC, XLS, PPT, ZIP (maks 10MB). Dapat ditambahkan kapan saja di menu Bukti Dukung.</p>
        {files.map((f, i) => (
          <div key={i} className="flex items-center justify-between gap-2 px-3 py-2 bg-[#F4F6F9] dark:bg-slate-800/70 border-2 border-[#1E293B] dark:border-slate-500 rounded-lg text-xs">
            <span className="truncate font-bold">{f.name}</span>
            <button type="button" onClick={() => setFiles(fs => fs.filter((_, idx) => idx !== i))} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
        {links.map((l, i) => (
          <div key={i} className="grid grid-cols-1 sm:grid-cols-[1fr_1.5fr_auto] gap-2 items-center">
            <input className="input" placeholder="Judul link" value={l.judul} onChange={e => updateLink(i, { judul: e.target.value })} />
            <input className="input" type="url" placeholder="https://drive.google.com/..." value={l.url} onChange={e => updateLink(i, { url: e.target.value })} />
            <button type="button" onClick={() => removeLink(i)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
              <X className="w-4 h-4 text-slate-500" />
            </button>
          </div>
        ))}
      </div>

      <div className="flex justify-end gap-2 pt-3 border-t-2 border-[#1E293B]/15 dark:border-slate-700">
        <button type="submit" disabled={loading} className={initialData?.id ? 'btn-teal' : 'btn-orange'}>
          {loading ? 'Menyimpan...' : initialData?.id ? 'BERES! Perbarui' : 'GAS SIMPAN!'}
        </button>
      </div>
    </form>
  );
}

function CalendarView({ periods, employees, canSeeAll }) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [calendarData, setCalendarData] = useState({});
  const [dailyStatus, setDailyStatus] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const active = periods.find(p => p.is_active);
    if (active) setSelectedPeriod(String(active.id));
  }, [periods]);

  const fetchCalendar = useCallback(() => {
    if (!selectedPeriod) return;
    setLoading(true);
    const params = { period_id: selectedPeriod, year, month: month + 1 };
    if (selectedEmployee) params.employee_id = selectedEmployee;
    api.get('/activities/calendar', { params }).then(r => {
      const map = {};
      r.data.forEach(d => { map[d.tanggal] = d; });
      setCalendarData(map);
    }).finally(() => setLoading(false));
  }, [selectedPeriod, selectedEmployee, year, month]);

  useEffect(() => { fetchCalendar(); }, [fetchCalendar]);

  const fetchDailyStatus = async (date) => {
    if (!canSeeAll) return;
    try {
      const r = await api.get('/activities/daily-status', { params: { tanggal: date } });
      setDailyStatus(r.data);
    } catch {}
  };

  const handleDateClick = (day) => {
    const ds = dateStr(year, month, day);
    setSelectedDate(ds);
    fetchDailyStatus(ds);
  };

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const todayStr = today.toISOString().split('T')[0];

  const getDayStatus = (day) => {
    const ds = dateStr(year, month, day);
    if (isWeekend(year, month, day)) return 'weekend';
    const d = calendarData[ds];
    if (!d || d.jumlah_kegiatan === 0) return 'belum';
    if (d.avg_capaian >= 80) return 'lengkap';
    return 'sebagian';
  };

  return (
    <div className="space-y-5">
      <div className="card p-4 flex flex-wrap gap-3 items-end">
        <div>
          <label className="label">Periode</label>
          <select className="input w-44" value={selectedPeriod} onChange={e => setSelectedPeriod(e.target.value)}>
            <option value="">Pilih Periode</option>
            {periods.map(p => <option key={p.id} value={p.id}>{p.nama}</option>)}
          </select>
        </div>
        {canSeeAll && (
          <div>
            <label className="label">Pegawai</label>
            <select className="input w-52" value={selectedEmployee} onChange={e => setSelectedEmployee(e.target.value)}>
              <option value="">Semua Pegawai</option>
              {employees.map(e => <option key={e.id} value={e.id}>{e.nama}</option>)}
            </select>
          </div>
        )}
        <button onClick={fetchCalendar} className="btn-secondary btn-sm" disabled={loading}>
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Segarkan
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Calendar */}
        <div className="lg:col-span-2 card p-5">
          <div className="flex items-center justify-between mb-5">
            <button onClick={prevMonth} className="btn-secondary btn-sm btn-icon" aria-label="Bulan sebelumnya">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <h2 className="font-extrabold text-sm text-[#1E293B] dark:text-white tracking-tight">{MONTHS_ID[month]} {year}</h2>
            <button onClick={nextMonth} className="btn-secondary btn-sm btn-icon" aria-label="Bulan berikutnya">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-7 mb-1.5">
            {DAYS_ID.map(d => (
              <div key={d} className={`text-center text-[11px] font-bold uppercase tracking-wider py-2 ${d === 'Min' || d === 'Sab' ? 'text-slate-400 dark:text-slate-600' : 'text-[#1E293B] dark:text-slate-300'}`}>{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const ds = dateStr(year, month, day);
              const status = getDayStatus(day);
              const cfg = STATUS_CONFIG[status];
              const isToday = ds === todayStr;
              const isSelected = ds === selectedDate;
              const d = calendarData[ds];

              return (
                <button
                  key={day}
                  onClick={() => !isWeekend(year, month, day) && handleDateClick(day)}
                  disabled={isWeekend(year, month, day)}
                  className={`
                    relative rounded-xl p-2 min-h-[60px] flex flex-col items-center justify-between transition-all border-2
                    ${status === 'weekend' ? 'cursor-default' : 'cursor-pointer hover:border-[#0052FF] dark:hover:border-[#00B4D8] hover:-translate-y-0.5'}
                    ${cfg.tile}
                    ${isToday ? 'ring-2 ring-[#FF6B35] font-extrabold' : ''}
                    ${isSelected ? 'ring-2 ring-[#0052FF] dark:ring-[#00B4D8]' : ''}
                  `}
                >
                  <span className={`font-mono text-xs tabular-num ${isToday ? 'font-extrabold' : 'font-bold'}`}>{day}</span>
                  {status !== 'weekend' && (
                    <span className={`w-2 h-2 rounded-full border border-[#1E293B]/60 ${cfg.dot}`} />
                  )}
                  {d && d.jumlah_kegiatan > 0 ? (
                    <span className="font-mono text-[10px] font-bold tabular-num">{d.jumlah_kegiatan} keg</span>
                  ) : (
                    <span className="text-[10px] opacity-0">0</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 mt-5 pt-4 border-t-2 border-[#1E293B]/15 dark:border-slate-700">
            {Object.entries(STATUS_CONFIG).filter(([k]) => k !== 'weekend').map(([k, v]) => (
              <div key={k} className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full border border-[#1E293B] ${v.dot}`} />
                <span className="text-xs font-bold text-[#1E293B] dark:text-slate-300">{v.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Daily Detail */}
        <div className="card p-5">
          {selectedDate ? (
            <>
              <h3 className="font-bold text-sm text-[#1E293B] dark:text-white mb-4">
                {new Date(selectedDate + 'T00:00:00').toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
              </h3>

              {canSeeAll && dailyStatus ? (
                <div className="space-y-3">
                  <div className="flex justify-between text-xs pb-2 border-b-2 border-[#1E293B]/15 dark:border-slate-700">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Total Pegawai</span>
                    <span className="font-mono font-bold text-[#1E293B] dark:text-slate-100">{dailyStatus.employees?.length}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="badge-success tabular-num">{dailyStatus.employees?.filter(e => e.status !== 'belum').length} BERES!</span>
                    <span className="badge-danger tabular-num">{dailyStatus.employees?.filter(e => e.status === 'belum').length} Belum</span>
                  </div>
                  <div className="space-y-1 max-h-72 overflow-y-auto pt-1">
                    {dailyStatus.employees?.map(emp => (
                      <div key={emp.id} className="flex items-center gap-2.5 py-2 border-b border-[#1E293B]/10 dark:border-slate-800/70 last:border-0">
                        <span className={`w-2.5 h-2.5 rounded-full border border-[#1E293B] flex-shrink-0 ${emp.status === 'belum' ? 'bg-rose-500' : emp.status === 'lengkap' ? 'bg-[#00B4D8]' : 'bg-[#FF6B35]'}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-[#1E293B] dark:text-slate-200 truncate">{emp.nama}</p>
                        </div>
                        <div className="text-right tabular-num">
                          <p className="text-xs text-slate-500 dark:text-slate-400">{emp.jumlah_kegiatan} keg</p>
                          {emp.avg_capaian > 0 && <p className="font-mono text-[11px] text-[#0052FF] dark:text-[#00B4D8] font-bold">{emp.avg_capaian}%</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  {calendarData[selectedDate] ? (
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500 dark:text-slate-400">Jumlah Kegiatan</span>
                        <span className="font-mono font-bold text-[#1E293B] dark:text-white">{calendarData[selectedDate].jumlah_kegiatan}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500 dark:text-slate-400">Rata-rata Capaian</span>
                        <span className="font-mono font-bold text-[#0052FF] dark:text-[#00B4D8]">{Math.round(calendarData[selectedDate].avg_capaian || 0)}%</span>
                      </div>
                      <div className="flex justify-between text-sm items-center">
                        <span className="text-slate-500 dark:text-slate-400">Bukti Dukung</span>
                        {calendarData[selectedDate].has_bukti
                          ? <span className="badge-success"><Check className="w-3 h-3" /> Ada</span>
                          : <span className="badge-gray"><Minus className="w-3 h-3" /> Belum</span>
                        }
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-slate-400 dark:text-slate-500 text-xs">Belum ada kegiatan pada tanggal ini</p>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <KjCalendarIcon className="w-9 h-9 text-slate-400 dark:text-slate-600 mx-auto mb-2.5" />
              <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">Pilih tanggal di kalender untuk melihat detail</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ActivityListView({ periods, employees, canEdit, isAnggota }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [detailData, setDetailData] = useState(null);

  const [filterPeriod, setFilterPeriod] = useState('');
  const [filterEmployee, setFilterEmployee] = useState('');
  const [filterDate, setFilterDate] = useState('');

  useEffect(() => {
    const active = periods.find(p => p.is_active);
    if (active) setFilterPeriod(String(active.id));
  }, [periods]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterPeriod) params.period_id = filterPeriod;
      if (filterEmployee) params.employee_id = filterEmployee;
      if (filterDate) params.tanggal = filterDate;
      const r = await api.get('/activities', { params });
      setActivities(r.data);
    } finally {
      setLoading(false);
    }
  }, [filterPeriod, filterEmployee, filterDate]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSubmit = async (form, evidence = { files: [], links: [] }) => {
    setSubmitting(true);
    try {
      let actId = editData?.id;
      if (actId) {
        await api.put(`/activities/${actId}`, form);
      } else {
        const r = await api.post('/activities', form);
        actId = r.data?.id;
      }
      if (actId) {
        try {
          if (evidence.files.length) {
            for (const file of evidence.files) {
              const res = await api.post(`/evidence/upload-url/${actId}`, {
                nama_file: file.name,
                mime_type: file.type || 'application/octet-stream',
                ukuran_file: file.size
              });
              const { signedUrl, path } = res.data;
              await fetch(signedUrl, {
                method: 'PUT',
                body: file,
                headers: { 'Content-Type': file.type || 'application/octet-stream' }
              });
              await api.post(`/evidence/file/${actId}`, {
                path: path,
                nama_file: file.name,
                mime_type: file.type || 'application/octet-stream',
                ukuran_file: file.size
              });
            }
          }
          for (const l of evidence.links) {
            if (!l.judul || !l.url) continue;
            await api.post(`/evidence/link/${actId}`, l);
          }
        } catch (err) {
          alert('Kegiatan tersimpan, tetapi bukti dukung gagal diunggah: ' + (err.response?.data?.error || 'error'));
        }
      }
      setModalOpen(false);
      setEditData(null);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Gagal menyimpan');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Hapus kegiatan ini?')) return;
    try {
      await api.delete(`/activities/${id}`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Gagal menghapus');
    }
  };

  const handleDownloadExcel = async () => {
    if (!filterPeriod) return alert('Pilih periode terlebih dahulu untuk mengunduh hasil kerja.');
    try {
      const params = { period_id: filterPeriod };
      if (filterEmployee) params.employee_id = filterEmployee;
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
      alert('Gagal mengunduh Excel hasil kerja');
    }
  };

  const handlePrintPDF = async () => {
    if (!filterPeriod) return alert('Pilih periode terlebih dahulu untuk mencetak hasil kerja.');
    try {
      const params = { period_id: filterPeriod };
      if (filterEmployee) params.employee_id = filterEmployee;
      const r = await api.get('/export/pdf-data', { params });
      const data = r.data || [];
      const period = periods.find(p => String(p.id) === String(filterPeriod));
      const printWindow = window.open('', '_blank');
      const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>KASI JADI — Hasil Kerja Pegawai (${period?.nama || ''})</title>
  <style>
    body { font-family: Arial, sans-serif; font-size: 12px; margin: 20px; color: #1E293B; }
    h1 { font-size: 16px; text-align: center; margin-bottom: 4px; color: #0052FF; font-weight: 800; }
    h2 { font-size: 13px; text-align: center; color: #475569; margin-bottom: 20px; font-weight: normal; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 16px; border: 2px solid #1E293B; }
    th { background: #0052FF; color: white; padding: 6px 8px; text-align: left; font-size: 11px; border-bottom: 2px solid #1E293B; }
    td { padding: 6px 8px; border-bottom: 1px solid #cbd5e1; vertical-align: top; }
    tr:nth-child(even) td { background: #F4F6F9; }
    .emp-header { background: #F4F6F9; padding: 8px 12px; border: 2px solid #1E293B; border-left: 6px solid #00B4D8; margin: 16px 0 8px; }
    .score-row { background: #ecfeff; font-weight: bold; }
  </style>
</head>
<body>
  <h1>KASI JADI — LAPORAN HASIL KERJA HARIAN PEGAWAI (CKP)</h1>
  <h2>Periode: ${period?.nama || '-'}</h2>
  ${data.map(d => {
    if (!d.employee) return '';
    return `
      <div class="emp-header">
        <strong>${d.employee.nama}</strong> — ${d.employee.jabatan || ''} | ${d.employee.unit_kerja || ''} | NIP: ${d.employee.nip || '-'}
      </div>
      <table>
        <thead>
          <tr>
            <th>No</th>
            <th>Tanggal</th>
            <th>Nama Kegiatan</th>
            <th>Deskripsi</th>
            <th>Target</th>
            <th>Realisasi</th>
            <th>Capaian</th>
            <th>Status</th>
            <th>Bukti / Geotag</th>
          </tr>
        </thead>
        <tbody>
          ${(d.activities || []).length === 0
            ? '<tr><td colspan="9" style="text-align:center;color:#94a3b8;">Belum ada kegiatan tercatat</td></tr>'
            : (d.activities || []).map((a, idx) => `
              <tr>
                <td>${idx + 1}</td>
                <td>${a.tanggal}</td>
                <td><strong>${a.nama_kegiatan}</strong></td>
                <td>${a.deskripsi || '-'}</td>
                <td>${a.target ?? '-'} ${a.satuan || ''}</td>
                <td>${a.realisasi ?? '-'}</td>
                <td>${a.persentase_capaian || 0}%</td>
                <td>${a.status_kegiatan}</td>
                <td>${a.info_bukti || ((a.jumlah_bukti || 0) + (a.jumlah_link || 0) > 0 ? `${(a.jumlah_bukti || 0) + (a.jumlah_link || 0)} bukti` : '-')}</td>
              </tr>
            `).join('')}
        </tbody>
      </table>
      ${d.ckp ? `
        <div class="score-row">
          <table><tr>
            <td>Nilai Capaian (PK): <strong>${d.ckp.nilai_pk}</strong></td>
            <td>Nilai Perilaku: <strong>${d.ckp.nilai_perilaku || '—'}</strong></td>
            <td>NILAI AKHIR CKP: <strong>${d.ckp.nilai_ckp}</strong> (${d.ckp.status})</td>
          </tr></table>
        </div>
      ` : ''}
    `;
  }).join('<hr style="margin:20px 0;border:none;border-top:1px dashed #cbd5e1;">')}
  <div style="margin-top:24px;text-align:right;color:#64748b;font-size:11px;">
    Dicetak pada: ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
  </div>
</body>
</html>`;
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.print();
    } catch {
      alert('Gagal mencetak laporan hasil kerja');
    }
  };

  return (
    <div className="space-y-5">
      {/* Filters & Export Bar */}
      <div className="card p-4 flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="label">Periode</label>
            <select className="input w-44" value={filterPeriod} onChange={e => setFilterPeriod(e.target.value)}>
              <option value="">Semua Periode</option>
              {periods.map(p => <option key={p.id} value={p.id}>{p.nama}</option>)}
            </select>
          </div>
          {!isAnggota && (
            <div>
              <label className="label">Pegawai</label>
              <select className="input w-44" value={filterEmployee} onChange={e => setFilterEmployee(e.target.value)}>
                <option value="">Semua Pegawai</option>
                {employees.map(e => <option key={e.id} value={e.id}>{e.nama}</option>)}
              </select>
            </div>
          )}
          <div>
            <label className="label">Tanggal</label>
            <input className="input font-mono" type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} />
          </div>
          <button onClick={() => { setFilterDate(''); setFilterEmployee(''); }} className="btn-secondary btn-sm">
            Reset
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button onClick={handleDownloadExcel} className="btn-teal btn-sm" title="Download Hasil Kerja Periode (.xlsx)">
            <Download className="w-3.5 h-3.5" />
            Excel Periode
          </button>
          <button onClick={handlePrintPDF} className="btn-secondary btn-sm" title="Cetak / Simpan PDF Hasil Kerja Periode">
            <Printer className="w-3.5 h-3.5" />
            Cetak / PDF
          </button>
          {canEdit && (
            <button onClick={() => { setEditData(null); setModalOpen(true); }} className="btn-orange btn-sm">
              <Plus className="w-3.5 h-3.5" />
              GAS ISI! Kegiatan
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="px-5 py-3.5 border-b-2 border-[#1E293B] dark:border-slate-600 bg-[#F4F6F9]/70 dark:bg-slate-800/40 flex items-center justify-between">
          <p className="text-xs font-bold text-[#1E293B] dark:text-slate-200 tabular-num">{activities.length} kegiatan tercatat</p>
        </div>
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-7 h-7 border-2 border-[#0052FF] dark:border-[#00B4D8] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Tanggal</th>
                  {!isAnggota && <th>Pegawai</th>}
                  <th>Kegiatan</th>
                  <th>Target</th>
                  <th>Realisasi</th>
                  <th>Capaian</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {activities.length === 0 && (
                  <tr>
                    <td colSpan="8" className="text-center text-slate-400 dark:text-slate-500 py-10">
                      Belum ada kegiatan tercatat
                    </td>
                  </tr>
                )}
                {activities.map(act => (
                  <tr key={act.id}>
                    <td className="whitespace-nowrap font-mono text-xs text-slate-600 dark:text-slate-300 tabular-num">
                      {new Date(act.tanggal + 'T00:00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                    </td>
                    {!isAnggota && <td className="font-bold text-[#1E293B] dark:text-slate-100">{act.pegawai_nama}</td>}
                    <td>
                      <p className="font-bold text-[#1E293B] dark:text-slate-100 max-w-64 truncate">{act.nama_kegiatan}</p>
                      {(act.jumlah_bukti > 0 || act.jumlah_link > 0) && (
                        <p className="text-[11px] font-bold text-[#0052FF] dark:text-[#00B4D8] mt-0.5 inline-flex items-center gap-1 mr-2">
                          <Paperclip className="w-3 h-3" />
                          <span className="tabular-num">{(act.jumlah_bukti || 0) + (act.jumlah_link || 0)} bukti</span>
                        </p>
                      )}
                      {act.bukti_keterangan && (
                        <p className="text-[11px] font-bold text-[#0077B6] dark:text-[#00B4D8] bg-[#00B4D8]/15 border border-[#1E293B]/60 dark:border-slate-500 rounded px-1.5 py-0.5 mt-1 inline-flex items-center gap-1 max-w-xs truncate" title={act.bukti_keterangan}>
                          <MapPin className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate font-mono text-[10px]">{act.bukti_keterangan}</span>
                        </p>
                      )}
                    </td>
                    <td className="tabular-num">{act.target ? `${act.target} ${act.satuan || ''}` : '—'}</td>
                    <td className="font-mono font-semibold tabular-num">{act.realisasi ?? '—'}</td>
                    <td>
                      <span className={`font-mono font-extrabold tabular-num ${
                        (act.persentase_capaian || 0) >= 100
                          ? 'text-[#00B4D8]'
                          : (act.persentase_capaian || 0) >= 70
                            ? 'text-[#0052FF] dark:text-[#60A5FA]'
                            : 'text-[#FF6B35]'
                      }`}>
                        {act.persentase_capaian || 0}%
                      </span>
                    </td>
                    <td>
                      <span className={STATUS_LABELS[act.status_kegiatan]?.class || 'badge-gray'}>
                        {STATUS_LABELS[act.status_kegiatan]?.label}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => setDetailData(act)} className="btn-icon btn-secondary btn-sm" title="Detail">
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        {canEdit && (
                          <button onClick={() => { setEditData(act); setModalOpen(true); }} className="btn-icon btn-secondary btn-sm" title="Edit">
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {isAnggota && (
                          <button onClick={() => handleDelete(act.id)} className="btn-icon btn-danger btn-sm" title="Hapus">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setEditData(null); }} title={editData ? 'Edit Kegiatan' : 'GAS ISI! Kegiatan Harian'} size="lg">
        <KegiatanForm
          periods={periods}
          employees={employees}
          onSubmit={handleSubmit}
          loading={submitting}
          initialData={editData}
        />
      </Modal>

      {/* Detail Modal */}
      <Modal open={!!detailData} onClose={() => setDetailData(null)} title="Detail Kegiatan" size="md">
        {detailData && (
          <div className="space-y-4 text-sm">
            <div className="space-y-2">
              <div className="flex justify-between gap-4">
                <span className="text-slate-500 dark:text-slate-400">Pegawai</span>
                <span className="font-bold text-[#1E293B] dark:text-white text-right">{detailData.pegawai_nama}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-500 dark:text-slate-400">Tanggal</span>
                <span className="font-mono font-bold text-[#1E293B] dark:text-white">{detailData.tanggal}</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 text-xs">Kegiatan</span>
                <p className="font-extrabold text-[#1E293B] dark:text-white mt-0.5">{detailData.nama_kegiatan}</p>
              </div>
              {detailData.deskripsi && (
                <div>
                  <span className="text-slate-500 dark:text-slate-400 text-xs">Deskripsi</span>
                  <p className="text-slate-700 dark:text-slate-300 mt-0.5 leading-relaxed">{detailData.deskripsi}</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3 bg-[#F4F6F9] dark:bg-slate-800/70 border-2 border-[#1E293B] dark:border-slate-500 p-3.5 rounded-xl">
              <div>
                <p className="text-slate-500 dark:text-slate-400 text-[11px] font-bold">Target</p>
                <p className="font-mono font-bold text-[#1E293B] dark:text-white mt-0.5">{detailData.target || '—'} {detailData.satuan}</p>
              </div>
              <div>
                <p className="text-slate-500 dark:text-slate-400 text-[11px] font-bold">Realisasi</p>
                <p className="font-mono font-bold text-[#1E293B] dark:text-white mt-0.5">{detailData.realisasi || '—'}</p>
              </div>
              <div>
                <p className="text-slate-500 dark:text-slate-400 text-[11px] font-bold">Capaian</p>
                <p className="font-mono font-extrabold text-[#0052FF] dark:text-[#00B4D8] mt-0.5">{detailData.persentase_capaian || 0}%</p>
              </div>
            </div>

            {detailData.bukti_keterangan && (
              <div className="p-3 bg-[#00B4D8]/15 dark:bg-[#00B4D8]/20 border-2 border-[#1E293B] dark:border-slate-500 rounded-xl text-xs text-[#1E293B] dark:text-slate-100">
                <p className="font-bold inline-flex items-center gap-1.5 mb-1">
                  <MapPin className="w-3.5 h-3.5 text-[#0052FF] dark:text-[#00B4D8]" />
                  Geotag &amp; Timestamp Bukti Foto
                </p>
                <p className="font-mono text-[11px]">{detailData.bukti_keterangan}</p>
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t-2 border-[#1E293B]/15 dark:border-slate-700">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Status</span>
              <span className={STATUS_LABELS[detailData.status_kegiatan]?.class || 'badge-gray'}>
                {STATUS_LABELS[detailData.status_kegiatan]?.label}
              </span>
            </div>

            {detailData.catatan && (
              <div>
                <span className="text-slate-500 dark:text-slate-400 text-xs">Catatan</span>
                <p className="text-slate-700 dark:text-slate-300 mt-0.5">{detailData.catatan}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

export default function Kegiatan() {
  const { isKPA, isKasubbag, isAnggota } = useAuth();
  const canEdit = isAnggota;
  const canSeeAll = isKPA || isKasubbag;

  const [activeTab, setActiveTab] = useState('daftar');
  const [periods, setPeriods] = useState([]);
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    api.get('/periods').then(r => setPeriods(r.data));
    if (!isAnggota) {
      api.get('/users/employees').then(r => setEmployees(r.data.filter(e => e.role === 'Anggota')));
    }
  }, [isAnggota]);

  const TABS = [
    { id: 'daftar', label: 'Daftar Kegiatan', icon: KjDailyLogIcon },
    { id: 'kalender', label: 'Kalender', icon: KjCalendarIcon },
  ];

  return (
    <div className="space-y-6">
      <div className="page-header mb-0">
        <div>
          <h2 className="page-title">Kegiatan Harian</h2>
          <p className="page-subtitle">Input, kelola, dan ekspor laporan kegiatan harian per periode</p>
        </div>
        <TabSwitch tabs={TABS} active={activeTab} onChange={setActiveTab} />
      </div>

      {activeTab === 'daftar' && (
        <ActivityListView
          periods={periods}
          employees={employees}
          canEdit={canEdit}
          isAnggota={isAnggota}
        />
      )}

      {activeTab === 'kalender' && (
        <CalendarView
          periods={periods}
          employees={employees}
          canSeeAll={canSeeAll}
        />
      )}
    </div>
  );
}

import { useEffect, useState, useCallback } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Upload, Link as LinkIcon, Trash2, X, ExternalLink, FileText, Image, File, MapPin } from 'lucide-react';

function Modal({ open, onClose, title, children, size = 'md' }) {
  if (!open) return null;
  const sizeMap = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl' };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px] animate-fade-in" onClick={onClose} />
      <div className={`relative bg-white dark:bg-[#1E293B] border-2 border-[#1E293B] dark:border-slate-400 rounded-2xl shadow-[5px_6px_0px_#1E293B] dark:shadow-[5px_6px_0px_#020617] w-full ${sizeMap[size]} animate-fade-in-up max-h-[90vh] flex flex-col overflow-hidden`}>
        <div className="flex items-center justify-between px-5 py-4 border-b-2 border-[#1E293B] dark:border-slate-600 bg-[#F4F6F9] dark:bg-slate-800 flex-shrink-0">
          <h3 className="font-bold text-sm text-[#1E293B] dark:text-white">{title}</h3>
          <button onClick={onClose} className="p-1.5 bg-white dark:bg-slate-700 border-[1.5px] border-[#1E293B] dark:border-slate-500 shadow-[1px_2px_0px_#1E293B] dark:shadow-[1px_2px_0px_#020617] rounded-lg text-[#1E293B] dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 p-5">{children}</div>
      </div>
    </div>
  );
}

function getFileIcon(mime) {
  if (mime?.startsWith('image/')) return <Image className="w-4 h-4 text-[#0052FF] dark:text-[#00B4D8]" />;
  if (mime === 'application/pdf') return <FileText className="w-4 h-4 text-[#FF6B35]" />;
  return <File className="w-4 h-4 text-slate-600 dark:text-slate-300" />;
}

function formatFileSize(bytes) {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function BuktiDukung() {
  const { isAnggota } = useAuth();
  const [activities, setActivities] = useState([]);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [evidence, setEvidence] = useState({ files: [], links: [] });
  const [filterPeriod, setFilterPeriod] = useState('');
  const [filterEmployee, setFilterEmployee] = useState('');
  const [periods, setPeriods] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [linkModal, setLinkModal] = useState(false);
  const [linkForm, setLinkForm] = useState({ judul: '', url: '', platform: '', keterangan: '' });

  useEffect(() => {
    api.get('/periods').then(r => {
      setPeriods(r.data);
      const active = r.data.find(p => p.is_active);
      if (active) setFilterPeriod(String(active.id));
    });
    if (!isAnggota) api.get('/users/employees').then(r => setEmployees(r.data.filter(e => e.role === 'Anggota')));
  }, [isAnggota]);

  const fetchActivities = useCallback(async () => {
    const params = {};
    if (filterPeriod) params.period_id = filterPeriod;
    if (filterEmployee) params.employee_id = filterEmployee;
    const r = await api.get('/activities', { params });
    setActivities(r.data);
  }, [filterPeriod, filterEmployee]);

  useEffect(() => { fetchActivities(); }, [fetchActivities]);

  const fetchEvidence = async (actId) => {
    try {
      const r = await api.get(`/evidence/activity/${actId}`);
      setEvidence(r.data);
    } catch {}
  };

  const selectActivity = (act) => {
    setSelectedActivity(act);
    fetchEvidence(act.id);
  };

  const handleFileUpload = async (e) => {
    const files = e.target.files;
    if (!files.length || !selectedActivity) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const res = await api.post(`/evidence/upload-url/${selectedActivity.id}`, {
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

        await api.post(`/evidence/file/${selectedActivity.id}`, {
          path: path,
          nama_file: file.name,
          mime_type: file.type || 'application/octet-stream',
          ukuran_file: file.size
        });
      }
      fetchEvidence(selectedActivity.id);
    } catch (err) {
      alert(err.response?.data?.error || err.message || 'Gagal mengunggah file');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleAddLink = async () => {
    if (!linkForm.judul || !linkForm.url) return alert('Judul dan URL wajib diisi');
    try {
      await api.post(`/evidence/link/${selectedActivity.id}`, linkForm);
      setLinkModal(false);
      setLinkForm({ judul: '', url: '', platform: '', keterangan: '' });
      fetchEvidence(selectedActivity.id);
    } catch (err) { alert(err.response?.data?.error || 'Gagal menambah link'); }
  };

  const handleDeleteFile = async (id) => {
    if (!confirm('Hapus bukti dukung ini?')) return;
    await api.delete(`/evidence/file/${id}`);
    fetchEvidence(selectedActivity.id);
  };

  const handleDeleteLink = async (id) => {
    if (!confirm('Hapus link ini?')) return;
    await api.delete(`/evidence/link/${id}`);
    fetchEvidence(selectedActivity.id);
  };

  return (
    <div className="space-y-6">
      <div className="page-header mb-0">
        <div>
          <h2 className="page-title">Bukti Dukung Kegiatan</h2>
          <p className="page-subtitle">Dokumentasi file, foto lapangan ber-geotag & timestamp, dan tautan lampiran</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-3">
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
            <select className="input w-48" value={filterEmployee} onChange={e => setFilterEmployee(e.target.value)}>
              <option value="">Semua Pegawai</option>
              {employees.map(e => <option key={e.id} value={e.id}>{e.nama}</option>)}
            </select>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Activity list */}
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b-2 border-[#1E293B] dark:border-slate-600 bg-[#F4F6F9]/70 dark:bg-slate-800/40">
            <h3 className="font-bold text-sm text-[#1E293B] dark:text-white">Pilih Kegiatan</h3>
          </div>
          <div className="divide-y-2 divide-[#1E293B]/10 dark:divide-slate-700/80 max-h-[28rem] overflow-y-auto">
            {activities.length === 0 && (
              <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-10">Tidak ada kegiatan pada filter ini</p>
            )}
            {activities.map(act => {
              const isSelected = selectedActivity?.id === act.id;
              return (
                <button
                  key={act.id}
                  onClick={() => selectActivity(act)}
                  className={`w-full text-left px-5 py-3.5 transition-colors border-l-4 ${
                    isSelected
                      ? 'bg-[#0052FF]/10 dark:bg-[#00B4D8]/15 border-[#0052FF] dark:border-[#00B4D8]'
                      : 'border-transparent hover:bg-[#F4F6F9]/80 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-[#1E293B] dark:text-slate-100 truncate">{act.nama_kegiatan}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        <span className="font-mono">{act.tanggal}</span> · {act.pegawai_nama}
                      </p>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <div className="flex gap-1 justify-end">
                        {act.jumlah_bukti > 0 && <span className="badge-info text-[10px]">{act.jumlah_bukti} file</span>}
                        {act.jumlah_link > 0 && <span className="badge-gray text-[10px]">{act.jumlah_link} link</span>}
                      </div>
                      <p className={`font-mono text-xs font-extrabold mt-1 tabular-num ${
                        act.persentase_capaian >= 100
                          ? 'text-[#00B4D8]'
                          : 'text-[#0052FF] dark:text-[#60A5FA]'
                      }`}>
                        {act.persentase_capaian || 0}%
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Evidence panel */}
        <div className="card overflow-hidden">
          {selectedActivity ? (
            <>
              <div className="px-5 py-4 border-b-2 border-[#1E293B] dark:border-slate-600 bg-[#F4F6F9]/70 dark:bg-slate-800/40 flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="font-bold text-sm text-[#1E293B] dark:text-white truncate">{selectedActivity.nama_kegiatan}</h3>
                  <p className="font-mono text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{selectedActivity.tanggal}</p>
                </div>
                {isAnggota && (
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <label className="btn-orange btn-sm cursor-pointer">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{uploading ? 'Mengunggah...' : 'Upload File'}</span>
                      <input
                        type="file"
                        className="hidden"
                        multiple
                        disabled={uploading}
                        accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip"
                        onChange={handleFileUpload}
                      />
                    </label>
                    <button onClick={() => setLinkModal(true)} className="btn-secondary btn-sm">
                      <LinkIcon className="w-3.5 h-3.5" />
                      <span>Tambah Link</span>
                    </button>
                  </div>
                )}
              </div>
              <div className="p-5 space-y-5">
                {evidence.files.length > 0 && (
                  <div>
                    <p className="section-title">File Bukti</p>
                    <div className="space-y-2.5">
                      {evidence.files.map(f => (
                        <div key={f.id} className="flex items-center gap-3 p-3 bg-[#F4F6F9] dark:bg-slate-800/70 border-2 border-[#1E293B] dark:border-slate-500 rounded-xl shadow-[2px_3px_0px_#1E293B] dark:shadow-[2px_3px_0px_#020617]">
                          {getFileIcon(f.mime_type)}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-[#1E293B] dark:text-slate-100 truncate">{f.nama_file}</p>
                            <p className="font-mono text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{f.jenis} · {formatFileSize(f.ukuran_file)}</p>
                            {f.keterangan && (
                              <p className="text-[11px] font-bold text-[#0077B6] dark:text-[#00B4D8] bg-[#00B4D8]/15 border border-[#1E293B] dark:border-slate-500 rounded px-2 py-0.5 mt-1.5 inline-flex items-center gap-1 font-mono">
                                <MapPin className="w-3 h-3 flex-shrink-0" />
                                <span>{f.keterangan}</span>
                              </p>
                            )}
                          </div>
                          <div className="flex gap-1.5">
                            <a href={f.path_file} target="_blank" rel="noopener noreferrer" className="btn-icon btn-secondary btn-sm" title="Buka File">
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                            {isAnggota && (
                              <button onClick={() => handleDeleteFile(f.id)} className="btn-icon btn-danger btn-sm" title="Hapus File">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {evidence.links.length > 0 && (
                  <div>
                    <p className="section-title">Link Bukti</p>
                    <div className="space-y-2.5">
                      {evidence.links.map(l => (
                        <div key={l.id} className="flex items-center gap-3 p-3 bg-[#F4F6F9] dark:bg-slate-800/70 border-2 border-[#1E293B] dark:border-slate-500 rounded-xl shadow-[2px_3px_0px_#1E293B] dark:shadow-[2px_3px_0px_#020617]">
                          <LinkIcon className="w-4 h-4 text-[#0052FF] dark:text-[#00B4D8] flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-[#1E293B] dark:text-slate-100 truncate">{l.judul}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">{l.url}</p>
                            {l.platform && <span className="badge-info text-[10px] mt-1">{l.platform}</span>}
                          </div>
                          <div className="flex gap-1.5">
                            <a href={l.url} target="_blank" rel="noopener noreferrer" className="btn-icon btn-secondary btn-sm" title="Buka Tautan">
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                            {isAnggota && (
                              <button onClick={() => handleDeleteLink(l.id)} className="btn-icon btn-danger btn-sm" title="Hapus Link">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {evidence.files.length === 0 && evidence.links.length === 0 && (
                  <div className="text-center py-8">
                    <FileText className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto mb-2" strokeWidth={1.5} />
                    <p className="text-xs text-slate-400 dark:text-slate-500">Belum ada bukti dukung untuk kegiatan ini</p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
              <FileText className="w-10 h-10 text-slate-300 dark:text-slate-700 mb-3" strokeWidth={1.5} />
              <p className="text-xs text-slate-400 dark:text-slate-500 max-w-xs leading-relaxed">
                Pilih kegiatan dari daftar di sebelah kiri untuk melihat atau mengunggah bukti dukung
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Add Link Modal */}
      <Modal open={linkModal} onClose={() => setLinkModal(false)} title="Tambah Link Bukti Dukung" size="sm">
        <div className="space-y-4">
          <div className="form-group">
            <label className="label">Judul *</label>
            <input className="input" placeholder="Laporan di Google Drive" value={linkForm.judul} onChange={e => setLinkForm({ ...linkForm, judul: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="label">URL *</label>
            <input className="input" type="url" placeholder="https://drive.google.com/..." value={linkForm.url} onChange={e => setLinkForm({ ...linkForm, url: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="label">Platform</label>
            <select className="input" value={linkForm.platform} onChange={e => setLinkForm({ ...linkForm, platform: e.target.value })}>
              <option value="">Pilih Platform</option>
              <option>Google Drive</option><option>OneDrive</option><option>SharePoint</option>
              <option>Dropbox</option><option>Website Instansi</option><option>Lainnya</option>
            </select>
          </div>
          <div className="form-group">
            <label className="label">Keterangan</label>
            <input className="input" placeholder="Keterangan tambahan..." value={linkForm.keterangan} onChange={e => setLinkForm({ ...linkForm, keterangan: e.target.value })} />
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t-2 border-[#1E293B]/15 dark:border-slate-700">
            <button onClick={() => setLinkModal(false)} className="btn-secondary">Batal</button>
            <button onClick={handleAddLink} className="btn-teal">BERES! Tambah Link</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

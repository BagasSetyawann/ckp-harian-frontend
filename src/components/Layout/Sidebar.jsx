import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, ClipboardList, FileText, Award,
  Settings, LogOut, ChevronLeft, ChevronRight, X, Activity, Sparkles
} from 'lucide-react';

const NAV_SECTIONS = [
  {
    label: 'Menu Utama',
    items: [
      { to: '/', label: 'Dashboard', icon: LayoutDashboard, exact: true, roles: ['KPA', 'Kasubbag', 'Anggota'] },
      { to: '/kegiatan', label: 'Kegiatan Harian', icon: ClipboardList, roles: ['KPA', 'Kasubbag', 'Anggota'] },
      { to: '/bukti-dukung', label: 'Bukti Dukung', icon: FileText, roles: ['KPA', 'Kasubbag', 'Anggota'] },
      { to: '/nilai-ckp', label: 'Nilai & Evaluasi CKP', icon: Award, roles: ['KPA', 'Kasubbag', 'Anggota'] },
      { to: '/changelog', label: 'Changelog', icon: Sparkles, roles: ['KPA', 'Kasubbag', 'Anggota'], badge: 'v1.3' },
    ],
  },
  {
    label: 'Administrasi',
    items: [
      { to: '/audit-log', label: 'Riwayat Aktivitas', icon: Activity, roles: ['KPA'] },
      { to: '/pengaturan', label: 'Pengaturan & Export', icon: Settings, roles: ['KPA'] },
    ],
  },
];

const ROLE_STYLES = {
  KPA: 'bg-rose-50 text-rose-700 border-rose-200/70 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800/60',
  Kasubbag: 'bg-primary-50 text-primary-700 border-primary-200/70 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800/60',
  Anggota: 'bg-emerald-50 text-emerald-700 border-emerald-200/70 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60',
};

export default function Sidebar({ collapsed, setCollapsed, mobileOpen, setMobileOpen }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full select-none">
      {/* Brand Header */}
      <div className={`flex items-center gap-3 px-4 h-14 border-b border-slate-200/80 dark:border-slate-800 ${collapsed ? 'justify-center px-2' : ''}`}>
        <div className="w-8 h-8 bg-primary-600 dark:bg-sky-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-card">
          <svg className="w-4 h-4 text-white dark:text-slate-950" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <div className="font-bold text-slate-900 dark:text-white text-sm tracking-tight leading-tight">SI-CKP</div>
            <div className="text-[11px] font-medium text-slate-400 dark:text-slate-500 leading-tight truncate">Capaian Kinerja</div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 overflow-y-auto space-y-5">
        {NAV_SECTIONS.map(section => {
          const visibleItems = section.items.filter(item => item.roles.includes(user?.role));
          if (visibleItems.length === 0) return null;
          return (
            <div key={section.label}>
              {!collapsed ? (
                <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-3 mb-2">
                  {section.label}
                </p>
              ) : (
                <div className="border-t border-slate-100 dark:border-slate-800 my-2" />
              )}
              <div className="space-y-0.5">
                {visibleItems.map(item => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.exact}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      `sidebar-link ${isActive ? 'active' : ''} ${collapsed ? 'justify-center px-2' : ''}`
                    }
                    title={collapsed ? item.label : ''}
                  >
                    {({ isActive }) => (
                      <>
                        <item.icon className="w-4 h-4 flex-shrink-0" strokeWidth={isActive ? 2 : 1.75} />
                        {!collapsed && (
                          <>
                            <span className="truncate flex-1">{item.label}</span>
                            {item.badge && (
                              <span
                                className={`font-mono px-1.5 py-0.5 text-[10px] font-semibold rounded ${
                                  isActive
                                    ? 'bg-white/15 text-white'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/70 dark:border-slate-700'
                                }`}
                              >
                                {item.badge}
                              </span>
                            )}
                          </>
                        )}
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          );
        })}
      </nav>

      {/* Footer User & Logout */}
      <div className="p-3 border-t border-slate-200/80 dark:border-slate-800 space-y-2">
        {!collapsed && (
          <div className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-50/90 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
            <div className="w-8 h-8 bg-primary-50 dark:bg-sky-950 border border-primary-200/70 dark:border-sky-800/60 rounded-full flex items-center justify-center text-primary-700 dark:text-sky-300 font-bold text-xs flex-shrink-0">
              {user?.employee?.nama?.charAt(0) || user?.username?.charAt(0)?.toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">
                {user?.employee?.nama || user?.username}
              </p>
              <span className={`inline-block mt-0.5 text-[10px] px-1.5 py-0.2 rounded border font-medium ${ROLE_STYLES[user?.role] || ''}`}>
                {user?.role}
              </span>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className={`sidebar-link w-full text-slate-500 dark:text-slate-400 hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-950/40 dark:hover:text-rose-300 ${collapsed ? 'justify-center px-2' : ''}`}
          title={collapsed ? 'Keluar' : ''}
        >
          <LogOut className="w-4 h-4 flex-shrink-0" strokeWidth={1.75} />
          {!collapsed && <span>Keluar</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={`hidden lg:flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 transition-all duration-200 ${collapsed ? 'w-16' : 'w-60'} relative flex-shrink-0`}>
        <SidebarContent />
        <button
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? 'Perluas sidebar' : 'Perkecil sidebar'}
          className="absolute -right-3 top-16 w-6 h-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-full flex items-center justify-center shadow-card hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors z-10"
        >
          {collapsed ? <ChevronRight className="w-3 h-3 text-slate-500 dark:text-slate-400" /> : <ChevronLeft className="w-3 h-3 text-slate-500 dark:text-slate-400" />}
        </button>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-[1px] animate-fade-in" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 h-full shadow-elevated animate-fade-in">
            <button
              onClick={() => setMobileOpen(false)}
              aria-label="Tutup menu"
              className="absolute top-3.5 right-3 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}
    </>
  );
}

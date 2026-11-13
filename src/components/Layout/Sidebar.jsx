import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  FileText, Settings, LogOut, ChevronLeft, ChevronRight, X, Activity, Sparkles
} from 'lucide-react';
import {
  KjBrandLockup, KjLogo, KjDashboardIcon, KjDailyLogIcon, KjAnalyticsIcon
} from '../Brand/KasiJadiIcons';

const NAV_SECTIONS = [
  {
    label: 'Menu Utama',
    items: [
      { to: '/', label: 'Dashboard', icon: KjDashboardIcon, exact: true, roles: ['KPA', 'Kasubbag', 'Anggota'] },
      { to: '/kegiatan', label: 'Kegiatan Harian', icon: KjDailyLogIcon, roles: ['KPA', 'Kasubbag', 'Anggota'] },
      { to: '/bukti-dukung', label: 'Bukti Dukung', icon: FileText, roles: ['KPA', 'Kasubbag', 'Anggota'] },
      { to: '/nilai-ckp', label: 'Nilai CKP', icon: KjAnalyticsIcon, roles: ['KPA', 'Kasubbag', 'Anggota'] },
      { to: '/changelog', label: 'Changelog', icon: Sparkles, roles: ['KPA', 'Kasubbag', 'Anggota'], badge: 'v1.4' },
    ],
  },
  {
    label: 'Administrasi',
    items: [
      { to: '/audit-log', label: 'Riwayat Aktivitas', icon: Activity, roles: ['KPA'] },
      { to: '/pengaturan', label: 'Pengaturan & Ekspor', icon: Settings, roles: ['KPA'] },
    ],
  },
];

const ROLE_STYLES = {
  KPA: 'bg-blue-50 text-[#0052FF] border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800/80',
  Kasubbag: 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/60 dark:text-teal-300 dark:border-teal-800/80',
  Anggota: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
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
      <div className={`flex items-center px-4 h-16 border-b border-slate-200 dark:border-slate-800 ${collapsed ? 'justify-center px-2' : ''}`}>
        {collapsed ? <KjLogo className="w-8 h-8" /> : <KjBrandLockup logoSize="w-9 h-9" />}
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
                <div className="border-t border-slate-200 dark:border-slate-800 my-2" />
              )}
              <div className="space-y-1">
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
                        <item.icon className="w-[18px] h-[18px] flex-shrink-0" strokeWidth={isActive ? 2 : 1.75} />
                        {!collapsed && (
                          <>
                            <span className="truncate flex-1">{item.label}</span>
                            {item.badge && (
                              <span
                                className={`tabular-num px-1.5 py-0.5 text-[10px] font-semibold rounded-md border ${
                                  isActive
                                    ? 'bg-[#0052FF] text-white border-[#0052FF]'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
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
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
        {!collapsed && (
          <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
            <div className="w-8 h-8 bg-[#0052FF] rounded-lg flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
              {user?.employee?.nama?.charAt(0) || user?.username?.charAt(0)?.toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                {user?.employee?.nama || user?.username}
              </p>
              <span className={`inline-block mt-0.5 text-[10px] px-2 py-0.2 rounded-full border font-semibold ${ROLE_STYLES[user?.role] || ''}`}>
                {user?.role}
              </span>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className={`sidebar-link w-full text-slate-600 dark:text-slate-300 hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-950/40 dark:hover:text-rose-300 ${collapsed ? 'justify-center px-2' : ''}`}
          title={collapsed ? 'Keluar' : ''}
        >
          <LogOut className="w-4 h-4 flex-shrink-0" strokeWidth={1.8} />
          {!collapsed && <span>Keluar</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={`hidden lg:flex flex-col bg-white dark:bg-[#111827] border-r border-slate-200 dark:border-slate-800 transition-all duration-200 ${collapsed ? 'w-16' : 'w-64'} relative flex-shrink-0`}>
        <SidebarContent />
        <button
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? 'Perluas sidebar' : 'Perkecil sidebar'}
          className="absolute -right-3 top-16 w-6 h-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full flex items-center justify-center shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors z-10"
        >
          {collapsed ? <ChevronRight className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" /> : <ChevronLeft className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />}
        </button>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-[1px] animate-fade-in" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-68 max-w-[82vw] bg-white dark:bg-[#111827] border-r border-slate-200 dark:border-slate-800 h-full shadow-xl animate-fade-in">
            <button
              onClick={() => setMobileOpen(false)}
              aria-label="Tutup menu"
              className="absolute top-4 right-3 p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
            >
              <X className="w-4 h-4 text-slate-600 dark:text-slate-200" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}
    </>
  );
}

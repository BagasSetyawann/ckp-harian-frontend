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
      { to: '/kegiatan', label: 'Daily Log', icon: KjDailyLogIcon, roles: ['KPA', 'Kasubbag', 'Anggota'] },
      { to: '/bukti-dukung', label: 'Bukti Dukung', icon: FileText, roles: ['KPA', 'Kasubbag', 'Anggota'] },
      { to: '/nilai-ckp', label: 'Performance Analytics', icon: KjAnalyticsIcon, roles: ['KPA', 'Kasubbag', 'Anggota'] },
      { to: '/changelog', label: 'Changelog', icon: Sparkles, roles: ['KPA', 'Kasubbag', 'Anggota'], badge: 'v1.4' },
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
  KPA: 'bg-[#FF6B35]/15 text-[#c2410c] border-[#1E293B] dark:bg-[#FF6B35]/25 dark:text-[#fdba74] dark:border-slate-400',
  Kasubbag: 'bg-[#0052FF]/10 text-[#0052FF] border-[#1E293B] dark:bg-[#0052FF]/30 dark:text-[#93C5FD] dark:border-slate-400',
  Anggota: 'bg-[#00B4D8]/15 text-[#007a94] border-[#1E293B] dark:bg-[#00B4D8]/25 dark:text-[#67e8f9] dark:border-slate-400',
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
      <div className={`flex items-center px-4 h-16 border-b-2 border-[#1E293B] dark:border-slate-500 ${collapsed ? 'justify-center px-2' : ''}`}>
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
                <p className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-3 mb-2">
                  {section.label}
                </p>
              ) : (
                <div className="border-t-2 border-slate-200 dark:border-slate-700 my-2" />
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
                        <item.icon className="w-[18px] h-[18px] flex-shrink-0" strokeWidth={isActive ? 2.2 : 1.9} />
                        {!collapsed && (
                          <>
                            <span className="truncate flex-1">{item.label}</span>
                            {item.badge && (
                              <span
                                className={`font-mono px-1.5 py-0.5 text-[10px] font-bold rounded-full border ${
                                  isActive
                                    ? 'bg-white text-[#1E293B] border-[#1E293B]'
                                    : 'bg-[#FF6B35]/15 text-[#c2410c] dark:text-[#fdba74] border-[#1E293B] dark:border-slate-400'
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

      {/* Tenun accent divider */}
      <div className="h-3 kj-tenun-h opacity-20 mx-3 mb-1" />

      {/* Footer User & Logout */}
      <div className="p-3 border-t-2 border-[#1E293B] dark:border-slate-500 space-y-2">
        {!collapsed && (
          <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#F4F6F9] dark:bg-slate-800/80 border-2 border-[#1E293B] dark:border-slate-500 shadow-[2px_2px_0px_#1E293B] dark:shadow-[2px_2px_0px_#020617]">
            <div className="w-8 h-8 bg-[#00B4D8] border-2 border-[#1E293B] rounded-full flex items-center justify-center text-white font-extrabold text-xs flex-shrink-0">
              {user?.employee?.nama?.charAt(0) || user?.username?.charAt(0)?.toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-extrabold text-[#1E293B] dark:text-slate-100 truncate">
                {user?.employee?.nama || user?.username}
              </p>
              <span className={`inline-block mt-0.5 text-[10px] px-2 py-0.2 rounded-full border-[1.5px] font-bold ${ROLE_STYLES[user?.role] || ''}`}>
                {user?.role}
              </span>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className={`sidebar-link w-full text-slate-600 dark:text-slate-300 hover:bg-rose-100 hover:text-rose-700 hover:border-[#1E293B] dark:hover:bg-rose-950/60 dark:hover:text-rose-300 ${collapsed ? 'justify-center px-2' : ''}`}
          title={collapsed ? 'Keluar' : ''}
        >
          <LogOut className="w-4 h-4 flex-shrink-0" strokeWidth={2} />
          {!collapsed && <span>Keluar</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={`hidden lg:flex flex-col bg-white dark:bg-[#1E293B] border-r-2 border-[#1E293B] dark:border-slate-500 transition-all duration-200 ${collapsed ? 'w-16' : 'w-64'} relative flex-shrink-0`}>
        <SidebarContent />
        <button
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? 'Perluas sidebar' : 'Perkecil sidebar'}
          className="absolute -right-3.5 top-16 w-7 h-7 bg-white dark:bg-slate-800 border-2 border-[#1E293B] dark:border-slate-400 rounded-full flex items-center justify-center shadow-[2px_2px_0px_#1E293B] dark:shadow-[2px_2px_0px_#020617] hover:bg-[#F4F6F9] dark:hover:bg-slate-700 transition-colors z-10"
        >
          {collapsed ? <ChevronRight className="w-3.5 h-3.5 text-[#1E293B] dark:text-slate-200" /> : <ChevronLeft className="w-3.5 h-3.5 text-[#1E293B] dark:text-slate-200" />}
        </button>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-[1px] animate-fade-in" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-68 max-w-[82vw] bg-white dark:bg-[#1E293B] border-r-2 border-[#1E293B] dark:border-slate-500 h-full shadow-[6px_0px_0px_#1E293B] animate-fade-in">
            <button
              onClick={() => setMobileOpen(false)}
              aria-label="Tutup menu"
              className="absolute top-4 right-3 p-1.5 rounded-lg border-2 border-[#1E293B] dark:border-slate-400 bg-[#F4F6F9] dark:bg-slate-800"
            >
              <X className="w-4 h-4 text-[#1E293B] dark:text-slate-200" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}
    </>
  );
}

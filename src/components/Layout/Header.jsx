import { useLocation, Link } from 'react-router-dom';
import { Menu, Bell, Sun, Moon, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const PAGE_TITLES = {
  '/': 'Dashboard',
  '/kegiatan': 'Daily Log & Kegiatan',
  '/bukti-dukung': 'Bukti Dukung',
  '/nilai-ckp': 'Performance Analytics',
  '/changelog': 'Changelog Sistem',
  '/pengaturan': 'Pengaturan & Export',
  '/audit-log': 'Riwayat Aktivitas',
};

const TODAY = new Date().toLocaleDateString('id-ID', {
  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
});

export default function Header({ setMobileOpen, unreadNotifications }) {
  const location = useLocation();
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const title = PAGE_TITLES[location.pathname] || 'KASI JADI';

  return (
    <header className="bg-white dark:bg-[#1E293B] border-b-2 border-[#1E293B] dark:border-slate-500 px-4 lg:px-7 h-16 flex items-center justify-between flex-shrink-0 sticky top-0 z-30">
      {/* Left: Mobile menu + Title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={() => setMobileOpen(prev => !prev)}
          aria-label="Buka navigasi"
          className="lg:hidden btn-icon"
        >
          <Menu className="w-4 h-4 text-[#1E293B] dark:text-slate-100" />
        </button>
        <div className="min-w-0">
          <h1 className="text-[15.5px] font-extrabold text-[#1E293B] dark:text-white tracking-tight truncate">{title}</h1>
          <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 hidden sm:block leading-tight">{TODAY}</p>
        </div>
      </div>

      {/* Right: Changelog + Theme Switcher + Notifications + User */}
      <div className="flex items-center gap-2">
        <Link
          to="/changelog"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border-2 border-[#1E293B] dark:border-slate-400 bg-[#F4F6F9] dark:bg-slate-800 hover:bg-white dark:hover:bg-slate-700 text-[#1E293B] dark:text-slate-100 text-xs font-bold shadow-[2px_2px_0px_#1E293B] dark:shadow-[2px_2px_0px_#020617] hover:-translate-y-0.5 transition-all"
          title="Lihat Changelog KASI JADI"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#FF6B35]" />
          <span>Changelog</span>
          <span className="font-mono text-[10px] text-[#0052FF] dark:text-[#00B4D8]">v1.4</span>
        </Link>

        {/* Theme Switcher */}
        <button
          onClick={toggleTheme}
          aria-label={isDark ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
          title={isDark ? 'Mode Terang' : 'Mode Gelap'}
          className="btn-icon"
        >
          {isDark ? <Sun className="w-4 h-4 text-[#FF6B35]" /> : <Moon className="w-4 h-4 text-[#1E293B]" />}
        </button>

        {/* Notification bell */}
        <button
          aria-label="Notifikasi"
          className="btn-icon relative"
        >
          <Bell className="w-4 h-4 text-[#1E293B] dark:text-slate-100" />
          {unreadNotifications > 0 && (
            <span className="font-mono absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#FF6B35] border-2 border-[#1E293B] text-white text-[10px] rounded-full flex items-center justify-center font-bold">
              {unreadNotifications > 9 ? '9+' : unreadNotifications}
            </span>
          )}
        </button>

        {/* User info */}
        <div className="flex items-center gap-2.5 pl-2.5 ml-1 border-l-2 border-[#1E293B]/20 dark:border-slate-600">
          <div className="w-8 h-8 bg-[#0052FF] border-2 border-[#1E293B] dark:border-slate-300 rounded-full flex items-center justify-center text-white font-extrabold text-xs shadow-[2px_2px_0px_#1E293B] dark:shadow-[2px_2px_0px_#020617]">
            {user?.employee?.nama?.charAt(0) || user?.username?.charAt(0)?.toUpperCase()}
          </div>
          <div className="hidden md:block">
            <p className="text-xs font-extrabold text-[#1E293B] dark:text-slate-100 leading-tight max-w-36 truncate">
              {user?.employee?.nama || user?.username}
            </p>
            <p className="text-[11px] font-bold text-[#0052FF] dark:text-[#00B4D8] leading-tight">{user?.role}</p>
          </div>
        </div>
      </div>
    </header>
  );
}

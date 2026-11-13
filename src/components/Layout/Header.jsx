import { useLocation, Link } from 'react-router-dom';
import { Menu, Bell, Sun, Moon, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const PAGE_TITLES = {
  '/': 'Dashboard',
  '/kegiatan': 'Kegiatan Harian',
  '/bukti-dukung': 'Bukti Dukung',
  '/nilai-ckp': 'Nilai & Evaluasi CKP',
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
  const title = PAGE_TITLES[location.pathname] || 'SI-CKP Harian';

  return (
    <header className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-b border-slate-200/80 dark:border-slate-800 px-4 lg:px-7 h-14 flex items-center justify-between flex-shrink-0 sticky top-0 z-30">
      {/* Left: Mobile menu + Title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={() => setMobileOpen(prev => !prev)}
          aria-label="Buka navigasi"
          className="lg:hidden p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <Menu className="w-5 h-5 text-slate-600 dark:text-slate-300" />
        </button>
        <div className="min-w-0">
          <h1 className="text-[15px] font-semibold text-slate-900 dark:text-white tracking-tight truncate">{title}</h1>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 hidden sm:block leading-tight">{TODAY}</p>
        </div>
      </div>

      {/* Right: Changelog + Theme Switcher + Notifications + User */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        <Link
          to="/changelog"
          className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/70 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-medium transition-colors"
          title="Lihat Changelog Sistem"
        >
          <Sparkles className="w-3.5 h-3.5 text-primary-600 dark:text-sky-400" />
          <span>Changelog</span>
          <span className="font-mono text-[10px] text-slate-400 dark:text-slate-400">v1.3</span>
        </Link>

        {/* Theme Switcher */}
        <button
          onClick={toggleTheme}
          aria-label={isDark ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
          title={isDark ? 'Mode Terang' : 'Mode Gelap'}
          className="p-2 rounded-lg border border-transparent hover:border-slate-200 dark:hover:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Notification bell */}
        <button
          aria-label="Notifikasi"
          className="relative p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
        >
          <Bell className="w-4 h-4" />
          {unreadNotifications > 0 && (
            <span className="font-mono absolute top-1 right-1 w-4 h-4 bg-rose-600 text-white text-[10px] rounded-full flex items-center justify-center font-semibold">
              {unreadNotifications > 9 ? '9+' : unreadNotifications}
            </span>
          )}
        </button>

        {/* User info */}
        <div className="flex items-center gap-2 pl-2 ml-1 border-l border-slate-200/80 dark:border-slate-800">
          <div className="w-7 h-7 bg-primary-50 dark:bg-sky-950 border border-primary-200/70 dark:border-sky-800/70 rounded-full flex items-center justify-center text-primary-700 dark:text-sky-300 font-bold text-xs">
            {user?.employee?.nama?.charAt(0) || user?.username?.charAt(0)?.toUpperCase()}
          </div>
          <div className="hidden md:block">
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 leading-tight max-w-36 truncate">
              {user?.employee?.nama || user?.username}
            </p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-tight">{user?.role}</p>
          </div>
        </div>
      </div>
    </header>
  );
}

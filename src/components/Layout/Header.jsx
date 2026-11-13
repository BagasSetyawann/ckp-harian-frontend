import { useLocation, Link } from 'react-router-dom';
import { Menu, Bell, Sun, Moon, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const PAGE_TITLES = {
  '/': 'Dashboard Kinerja',
  '/kegiatan': 'Kegiatan Harian',
  '/bukti-dukung': 'Bukti Dukung',
  '/nilai-ckp': 'Nilai & Evaluasi CKP',
  '/changelog': 'Riwayat Pembaruan Sistem',
  '/pengaturan': 'Pengaturan & Ekspor',
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
    <header className="bg-white/95 dark:bg-[#111827]/95 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800 px-4 lg:px-7 h-16 flex items-center justify-between flex-shrink-0 sticky top-0 z-30">
      {/* Left: Mobile menu + Title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={() => setMobileOpen(prev => !prev)}
          aria-label="Buka navigasi"
          className="lg:hidden btn-icon"
        >
          <Menu className="w-4 h-4 text-slate-700 dark:text-slate-200" />
        </button>
        <div className="min-w-0">
          <h1 className="text-[15.5px] font-bold text-slate-900 dark:text-white tracking-tight truncate">{title}</h1>
          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 hidden sm:block leading-tight">{TODAY}</p>
        </div>
      </div>

      {/* Right: Changelog + Theme Switcher + Notifications + User */}
      <div className="flex items-center gap-2">
        <Link
          to="/changelog"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors"
          title="Lihat Changelog KASI JADI"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#0052FF] dark:text-[#38BDF8]" />
          <span>Changelog</span>
          <span className="tabular-num text-[10.5px] text-[#0052FF] dark:text-[#38BDF8] font-bold">v1.4</span>
        </Link>

        {/* Theme Switcher */}
        <button
          onClick={toggleTheme}
          aria-label={isDark ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
          title={isDark ? 'Mode Terang' : 'Mode Gelap'}
          className="btn-icon"
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>

        {/* Notification bell */}
        <button
          aria-label="Notifikasi"
          className="btn-icon relative"
        >
          <Bell className="w-4 h-4 text-slate-600 dark:text-slate-200" />
          {unreadNotifications > 0 && (
            <span className="tabular-num absolute -top-1 -right-1 w-4.5 h-4.5 min-w-[18px] px-1 bg-[#0052FF] text-white text-[10px] rounded-full flex items-center justify-center font-bold border border-white dark:border-slate-900">
              {unreadNotifications > 9 ? '9+' : unreadNotifications}
            </span>
          )}
        </button>

        {/* User info */}
        <div className="flex items-center gap-2.5 pl-3 ml-1 border-l border-slate-200 dark:border-slate-700/80">
          <div className="w-8 h-8 bg-[#0052FF] rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-sm">
            {user?.employee?.nama?.charAt(0) || user?.username?.charAt(0)?.toUpperCase()}
          </div>
          <div className="hidden md:block">
            <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 leading-tight max-w-36 truncate">
              {user?.employee?.nama || user?.username}
            </p>
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 leading-tight">{user?.role}</p>
          </div>
        </div>
      </div>
    </header>
  );
}

export function KjLogo({ className = 'w-10 h-10' }) {
  return (
    <svg className={className} viewBox="0 0 120 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M20 15V85M20 50L55 15M35 35L60 85"
        stroke="#0052FF"
        strokeWidth="14"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M90 45V65C90 78.8071 78.8071 90 65 90C55.5 90 47.5 84.5 44 76"
        stroke="#00B4D8"
        strokeWidth="14"
        strokeLinecap="round"
      />
      <path
        d="M62 48L76 62L105 20"
        stroke="#FF6B35"
        strokeWidth="12"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function KjBrandLockup({ compact = false, logoSize = 'w-9 h-9' }) {
  return (
    <div className="inline-flex items-center gap-2.5 select-none min-w-0">
      <KjLogo className={`${logoSize} flex-shrink-0`} />
      {!compact && (
        <div className="flex flex-col min-w-0">
          <span className="text-lg font-extrabold tracking-tight text-[#1E293B] dark:text-white leading-none truncate">
            KASI <span className="text-[#0052FF] dark:text-[#00B4D8]">JADI</span>
          </span>
          <span className="text-[9.5px] font-bold text-slate-500 dark:text-slate-400 tracking-wider uppercase mt-0.5 truncate">
            Jurnal Aktivitas &amp; Kinerja
          </span>
        </div>
      )}
    </div>
  );
}

export function KjDashboardIcon({ className = 'w-5 h-5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <line x1="3" y1="9" x2="21" y2="9" />
      <line x1="7" y1="13" x2="10" y2="13" />
      <line x1="7" y1="16" x2="10" y2="16" />
      <circle cx="15.5" cy="14.5" r="2.5" />
      <path d="M15.5 14.5L17 13" />
    </svg>
  );
}

export function KjDailyLogIcon({ className = 'w-5 h-5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <rect x="8" y="2" width="8" height="4" rx="1" />
      <path d="M8 11h4" />
      <path d="M8 15h3" />
      <path d="M14.5 17.5L19 13l-2-2-4.5 4.5v2h2z" />
    </svg>
  );
}

export function KjAnalyticsIcon({ className = 'w-5 h-5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
      <path d="M22 12A10 10 0 0 0 12 2v10z" />
      <polyline points="7 15 10 12 12 14 16 10" />
    </svg>
  );
}

export function KjCalendarIcon({ className = 'w-5 h-5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <circle cx="8" cy="14" r="1" fill="currentColor" />
      <circle cx="12" cy="14" r="1" fill="currentColor" />
      <circle cx="16" cy="14" r="1" fill="currentColor" />
      <circle cx="8" cy="18" r="1" fill="currentColor" />
      <circle cx="12" cy="18" r="1" fill="currentColor" />
      <circle cx="16" cy="18" r="1" fill="currentColor" />
    </svg>
  );
}

export function KjReminderBanner({
  message = 'Jangan lupa spill kerjaan hari ini, Jo!',
  subtext,
  actionLabel,
  onAction,
  onDismiss,
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-[#F4F6F9] dark:bg-[#1E293B] border-2 border-[#1E293B] dark:border-slate-500 rounded-xl shadow-[3px_4px_0px_#1E293B] dark:shadow-[3px_4px_0px_#020617]">
      <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
        <span className="flex h-3 w-3 relative flex-shrink-0 mt-1 sm:mt-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF6B35] opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-[#FF6B35]" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-bold text-[#1E293B] dark:text-white leading-snug">{message}</p>
          {subtext && <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">{subtext}</p>}
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {actionLabel && onAction && (
          <button type="button" onClick={onAction} className="btn-orange btn-sm">
            {actionLabel}
          </button>
        )}
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Tutup pengingat"
            className="text-slate-500 hover:text-[#1E293B] dark:text-slate-400 dark:hover:text-white font-bold text-lg leading-none px-1.5"
          >
            &times;
          </button>
        )}
      </div>
    </div>
  );
}

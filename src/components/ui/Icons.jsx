function createIcon(path, className = '') {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {path}
    </svg>
  )
}

export function SearchIcon({ className = '' }) {
  return createIcon(
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20 17 17" />
    </>,
    className,
  )
}

export function MapPinIcon({ className = '' }) {
  return createIcon(
    <>
      <path d="M12 21s6-5.2 6-11a6 6 0 1 0-12 0c0 5.8 6 11 6 11Z" />
      <circle cx="12" cy="10" r="2.5" />
    </>,
    className,
  )
}

export function CalendarIcon({ className = '' }) {
  return createIcon(
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M16 3v4M8 3v4M3 10h18" />
    </>,
    className,
  )
}

export function PlusSquareIcon({ className = '' }) {
  return createIcon(
    <>
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <path d="M12 8v8M8 12h8" />
    </>,
    className,
  )
}

export function UserPlusIcon({ className = '' }) {
  return createIcon(
    <>
      <path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
      <circle cx="9.5" cy="7" r="4" />
      <path d="M19 8v6M16 11h6" />
    </>,
    className,
  )
}

export function LogInIcon({ className = '' }) {
  return createIcon(
    <>
      <path d="M10 17 15 12 10 7" />
      <path d="M15 12H3" />
      <path d="M13 3h5a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-5" />
    </>,
    className,
  )
}

export function MenuIcon({ className = '' }) {
  return createIcon(
    <>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </>,
    className,
  )
}

export function MoreVerticalIcon({ className = '' }) {
  return createIcon(
    <>
      <circle cx="12" cy="5" r="1.4" />
      <circle cx="12" cy="12" r="1.4" />
      <circle cx="12" cy="19" r="1.4" />
    </>,
    className,
  )
}

export function CloseIcon({ className = '' }) {
  return createIcon(
    <>
      <path d="m6 6 12 12M18 6 6 18" />
    </>,
    className,
  )
}

export function ArrowRightIcon({ className = '' }) {
  return createIcon(
    <>
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </>,
    className,
  )
}

export function ChevronLeftIcon({ className = '' }) {
  return createIcon(
    <>
      <path d="m15 18-6-6 6-6" />
    </>,
    className,
  )
}

export function ChevronRightIcon({ className = '' }) {
  return createIcon(
    <>
      <path d="m9 6 6 6-6 6" />
    </>,
    className,
  )
}

export function LayoutGridIcon({ className = '' }) {
  return createIcon(
    <>
      <rect x="4" y="4" width="6" height="6" rx="1.2" />
      <rect x="14" y="4" width="6" height="6" rx="1.2" />
      <rect x="4" y="14" width="6" height="6" rx="1.2" />
      <rect x="14" y="14" width="6" height="6" rx="1.2" />
    </>,
    className,
  )
}

export function HeartIcon({ className = '', filled = false }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 20.5S4 15.2 4 9.3C4 6.4 6.2 4 9 4c1.7 0 3.3.8 4.2 2.2C14.2 4.8 15.8 4 17.5 4 20.3 4 22.5 6.4 22.5 9.3 22.5 15.2 14.5 20.5 12 20.5Z" />
    </svg>
  )
}

export function BookmarkIcon({ className = '', filled = false }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M6 4h12v16l-6-4-6 4V4Z" />
    </svg>
  )
}

export function CheckIcon({ className = '' }) {
  return createIcon(
    <>
      <path d="m5 13 4 4L19 7" />
    </>,
    className,
  )
}

export function UsersIcon({ className = '' }) {
  return createIcon(
    <>
      <path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
      <circle cx="9.5" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.9" />
      <path d="M16.5 3.2a4 4 0 0 1 0 7.6" />
    </>,
    className,
  )
}

export function ShareIcon({ className = '' }) {
  return createIcon(
    <>
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="m8.6 10.7 6.8-4.4M8.6 13.3l6.8 4.4" />
    </>,
    className,
  )
}

export function UploadIcon({ className = '' }) {
  return createIcon(
    <>
      <path d="M12 16V4" />
      <path d="m7 9 5-5 5 5" />
      <path d="M5 20h14" />
    </>,
    className,
  )
}

export function MusicIcon({ className = '' }) {
  return createIcon(
    <>
      <path d="M9 18V6l10-2v12" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="16" cy="16" r="3" />
    </>,
    className,
  )
}

export function PaletteIcon({ className = '' }) {
  return createIcon(
    <>
      <path d="M12 3a9 9 0 1 0 0 18h1a2 2 0 0 0 0-4h-1a2 2 0 0 1 0-4h2a4 4 0 0 0 0-8h-2Z" />
      <circle cx="7.5" cy="10" r="1" />
      <circle cx="10" cy="7" r="1" />
      <circle cx="14" cy="7.5" r="1" />
    </>,
    className,
  )
}

export function BriefcaseIcon({ className = '' }) {
  return createIcon(
    <>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 12h18" />
    </>,
    className,
  )
}

export function UtensilsIcon({ className = '' }) {
  return createIcon(
    <>
      <path d="M4 3v8a2 2 0 0 0 2 2v8" />
      <path d="M8 3v8" />
      <path d="M14 3v18" />
      <path d="M14 8h4a3 3 0 0 0 0-5h-4" />
    </>,
    className,
  )
}

export function UsersRoundIcon({ className = '' }) {
  return createIcon(
    <>
      <circle cx="9" cy="8" r="3" />
      <circle cx="17" cy="10" r="2.5" />
      <path d="M4 19a5 5 0 0 1 10 0" />
      <path d="M14.5 19a4 4 0 0 1 5.5-3.7" />
    </>,
    className,
  )
}

export function LaptopIcon({ className = '' }) {
  return createIcon(
    <>
      <rect x="4" y="5" width="16" height="11" rx="2" />
      <path d="M2 19h20" />
    </>,
    className,
  )
}

export function CodeIcon({ className = '' }) {
  return createIcon(
    <>
      <path d="m8 9-4 3 4 3" />
      <path d="m16 9 4 3-4 3" />
      <path d="m14 5-4 14" />
    </>,
    className,
  )
}

export function CompassIcon({ className = '' }) {
  return createIcon(
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m15.5 8.5-3 7-4-4 7-3Z" />
    </>,
    className,
  )
}

export function MessageCircleIcon({ className = '' }) {
  return createIcon(
    <>
      <path d="M20 11.5a7.5 7.5 0 0 1-7.5 7.5 7.7 7.7 0 0 1-3.1-.6L4 20l1.7-4.5A7.5 7.5 0 1 1 20 11.5Z" />
    </>,
    className,
  )
}

export function ShieldIcon({ className = '' }) {
  return createIcon(
    <>
      <path d="M12 21s7-3.8 7-10V5l-7-2-7 2v6c0 6.2 7 10 7 10Z" />
    </>,
    className,
  )
}

export function LightbulbIcon({ className = '' }) {
  return createIcon(
    <>
      <path d="M9 18h6" />
      <path d="M10 22h4" />
      <path d="M12 2a6 6 0 0 0-3.7 10.7c.7.5 1.2 1.3 1.4 2.2L10 16h4l.3-1.1c.2-.9.7-1.7 1.4-2.2A6 6 0 0 0 12 2Z" />
    </>,
    className,
  )
}

export function MailIcon({ className = '' }) {
  return createIcon(
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m4 7 8 6 8-6" />
    </>,
    className,
  )
}

export function HelpCircleIcon({ className = '' }) {
  return createIcon(
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.6 9.4a2.4 2.4 0 1 1 4.2 1.6c-.7.7-1.8 1.3-1.8 2.5" />
      <path d="M12 17h.01" />
    </>,
    className,
  )
}

export function MoonIcon({ className = '' }) {
  return createIcon(
    <>
      <path d="M21 12.8A8.8 8.8 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
    </>,
    className,
  )
}

export function SunIcon({ className = '' }) {
  return createIcon(
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2.2M12 19.8V22M4.9 4.9l1.6 1.6M17.5 17.5l1.6 1.6M2 12h2.2M19.8 12H22M4.9 19.1l1.6-1.6M17.5 6.5l1.6-1.6" />
    </>,
    className,
  )
}

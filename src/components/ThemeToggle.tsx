'use client'

/** Gece/gündüz düğmesi; seçimi localStorage "tema"ya yazar. Simgeler CSS ile değişir. */
export function ThemeToggle({ label }: { label: string }) {
  const toggle = () => {
    const root = document.documentElement
    const t = root.dataset.theme === 'dark' ? 'light' : 'dark'
    root.dataset.theme = t
    try {
      localStorage.setItem('tema', t)
    } catch {}
  }

  return (
    <button
      type="button"
      className="circle"
      id="tbtn"
      aria-label={label}
      title={label}
      onClick={toggle}
    >
      <svg
        className="moon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" />
      </svg>
      <svg
        className="sun"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      >
        <circle cx="12" cy="12" r="4.2" />
        <path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6" />
      </svg>
    </button>
  )
}

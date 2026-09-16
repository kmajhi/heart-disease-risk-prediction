import type { ReactNode } from 'react'

interface FormSectionProps {
  id: string
  title: string
  subtitle?: string
  badge?: string
  complete?: boolean
  children: ReactNode
}

export function FormSection({ id, title, subtitle, badge, complete, children }: FormSectionProps) {
  return (
    <section
      id={id}
      className="animate-fade-in-up scroll-mt-24 rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-sm transition-all duration-150 hover:border-slate-700 hover:shadow-md sm:p-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-base font-bold text-white">
          <span
            className={`inline-block h-2 w-2 shrink-0 rounded-full transition-colors ${
              complete ? 'bg-gradient-to-r from-emerald-400 to-cyan-400' : 'bg-slate-700'
            }`}
            aria-hidden
          />
          {title}
        </h2>
        {badge && (
          <span className="rounded-full bg-cyan-500/10 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-cyan-300">
            {badge}
          </span>
        )}
      </div>
      {subtitle && <p className="mt-1 text-sm text-slate-400">{subtitle}</p>}
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>
    </section>
  )
}

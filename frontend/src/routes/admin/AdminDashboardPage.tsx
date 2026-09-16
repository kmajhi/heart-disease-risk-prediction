import { accentFor } from '../../features/shared/accentColors'
import { BarChartIcon, ClockIcon, FileTextIcon, GaugeIcon, UserIcon } from '../../features/shared/icons'
import { useAdminStats } from '../../hooks/useAdminStats'

const RISK_BAR: Record<string, string> = {
  Low: 'bg-emerald-400',
  Moderate: 'bg-amber-400',
  High: 'bg-red-400',
}

const TIER_BAR: Record<string, string> = {
  Basic: 'bg-indigo-400',
  Enhanced: 'bg-cyan-400',
  Legacy: 'bg-slate-500',
}

function StatCard({
  icon: Icon,
  label,
  value,
  accentIndex,
}: {
  icon: typeof UserIcon
  label: string
  value: string | number
  accentIndex: number
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <span
        className={`flex size-9 items-center justify-center rounded-lg bg-gradient-to-br text-white ${accentFor(accentIndex)}`}
      >
        <Icon className="size-[18px]" />
      </span>
      <p className="mt-3 text-2xl font-bold text-white">{value}</p>
      <p className="text-xs text-slate-400">{label}</p>
    </div>
  )
}

function BreakdownBars({
  title,
  entries,
  colors,
}: {
  title: string
  entries: { label: string; count: number }[]
  colors: Record<string, string>
}) {
  const total = entries.reduce((sum, e) => sum + e.count, 0)
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <h2 className="text-sm font-semibold text-slate-200">{title}</h2>
      <div className="mt-4 space-y-3">
        {entries.map((entry) => {
          const pct = total > 0 ? Math.round((entry.count / total) * 100) : 0
          return (
            <div key={entry.label}>
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>{entry.label}</span>
                <span>
                  {entry.count} · {pct}%
                </span>
              </div>
              <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-slate-800">
                <div
                  className={`animate-grow-bar h-full rounded-full ${colors[entry.label] ?? 'bg-indigo-400'}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function PredictionsPerDayChart({ data }: { data: { date: string; count: number }[] }) {
  const max = Math.max(1, ...data.map((d) => d.count))
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <h2 className="text-sm font-semibold text-slate-200">Predictions per day — last 14 days</h2>
      <div className="mt-5 flex h-32 items-end gap-1.5 sm:gap-2">
        {data.map((day) => {
          const heightPct = Math.max(4, Math.round((day.count / max) * 100))
          const label = new Date(day.date + 'T00:00:00').toLocaleDateString(undefined, {
            month: 'numeric',
            day: 'numeric',
          })
          return (
            <div key={day.date} className="flex flex-1 flex-col items-center gap-1.5" title={`${label}: ${day.count}`}>
              <div className="flex h-24 w-full items-end">
                <div
                  className="w-full rounded-t-md bg-gradient-to-t from-indigo-500 to-cyan-400 transition-all duration-500"
                  style={{ height: `${heightPct}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-500">{label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function AdminDashboardPage() {
  const { data, isLoading, isError } = useAdminStats()

  return (
    <div className="mx-auto max-w-6xl space-y-8 py-4">
      <header className="animate-fade-in-up">
        <h1 className="text-2xl font-bold tracking-tight text-white">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-slate-400">
          Live usage and model statistics, aggregated from real prediction records.
        </p>
      </header>

      {isLoading && <p className="text-sm text-slate-500">Loading statistics…</p>}

      {isError && (
        <p className="rounded-2xl border border-red-900 bg-red-950 px-4 py-3 text-sm text-red-200">
          Couldn&apos;t load admin statistics. Please try again shortly.
        </p>
      )}

      {data && (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard icon={UserIcon} label="Total users" value={data.total_users} accentIndex={0} />
            <StatCard icon={FileTextIcon} label="Total predictions" value={data.total_predictions} accentIndex={1} />
            <StatCard icon={ClockIcon} label="Predictions (last 7 days)" value={data.predictions_last_7_days} accentIndex={2} />
            <StatCard
              icon={GaugeIcon}
              label="Average estimated risk"
              value={data.average_probability !== null ? `${Math.round(data.average_probability * 100)}%` : '—'}
              accentIndex={3}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <BreakdownBars
              title="Assessment tier breakdown"
              colors={TIER_BAR}
              entries={[
                { label: 'Basic', count: data.tier_counts.basic },
                { label: 'Enhanced', count: data.tier_counts.enhanced },
                { label: 'Legacy', count: data.tier_counts.legacy },
              ]}
            />
            <BreakdownBars
              title="Risk label breakdown"
              colors={RISK_BAR}
              entries={[
                { label: 'Low', count: data.risk_label_counts.Low },
                { label: 'Moderate', count: data.risk_label_counts.Moderate },
                { label: 'High', count: data.risk_label_counts.High },
              ]}
            />
          </div>

          <PredictionsPerDayChart data={data.predictions_per_day} />

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="flex items-center gap-2">
              <span className={`flex size-8 items-center justify-center rounded-lg bg-gradient-to-br text-white ${accentFor(1)}`}>
                <BarChartIcon className="size-4" />
              </span>
              <h2 className="text-sm font-semibold text-slate-200">Model versions in use</h2>
            </div>
            {data.model_version_counts.length === 0 ? (
              <p className="mt-3 text-sm text-slate-500">No predictions yet.</p>
            ) : (
              <ul className="mt-4 space-y-3">
                {data.model_version_counts.map((row) => {
                  const pct =
                    data.total_predictions > 0 ? Math.round((row.count / data.total_predictions) * 100) : 0
                  return (
                    <li key={row.model_version}>
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span className="font-medium text-slate-200">{row.model_version}</span>
                        <span>
                          {row.count} · {pct}%
                        </span>
                      </div>
                      <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-slate-800">
                        <div
                          className="animate-grow-bar h-full rounded-full bg-gradient-to-r from-indigo-400 to-cyan-400"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  )
}

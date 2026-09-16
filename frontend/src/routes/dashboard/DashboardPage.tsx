import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../features/auth/AuthContext'
import { TierBadge } from '../../features/prediction-result/TierBadge'
import { accentFor } from '../../features/shared/accentColors'
import {
  ArrowRightIcon,
  BarChartIcon,
  ClockIcon,
  DownloadIcon,
  FileTextIcon,
  LayersIcon,
  PlusIcon,
  SparklesIcon,
} from '../../features/shared/icons'
import { usePredictionExplanation, usePredictionHistory } from '../../hooks/usePredictionMutations'
import type { PredictionResult, RiskLabel, Tier } from '../../types/prediction'

const RISK_STYLES: Record<RiskLabel, string> = {
  Low: 'bg-emerald-500/10 text-emerald-300',
  Moderate: 'bg-amber-500/10 text-amber-300',
  High: 'bg-red-500/10 text-red-300',
}

const RISK_RING: Record<RiskLabel, string> = {
  Low: '#34d399',
  Moderate: '#fbbf24',
  High: '#f87171',
}

const RISK_BAR: Record<RiskLabel, string> = {
  Low: 'bg-emerald-400',
  Moderate: 'bg-amber-400',
  High: 'bg-red-400',
}

const RISK_DOT: Record<RiskLabel, string> = {
  Low: 'bg-emerald-400',
  Moderate: 'bg-amber-400',
  High: 'bg-red-400',
}

const QUICK_ACTIONS = [
  { to: '/predict', icon: PlusIcon, title: 'New assessment', description: 'Start a Basic or Enhanced risk assessment.' },
  { to: '/history', icon: ClockIcon, title: 'Full history', description: 'Browse every past assessment you’ve run.' },
  { to: '/models/compare', icon: BarChartIcon, title: 'Model comparison', description: 'Real evaluation results for the ML-5 models.' },
]

type Filter = 'all' | Tier

function displayName(firstName: string, lastName: string, email: string) {
  const name = `${firstName} ${lastName}`.trim()
  return name || email
}

function timeAgo(dateStr: string) {
  const diffMs = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.round(diffMs / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.round(hours / 24)
  if (days < 30) return `${days}d ago`
  const months = Math.round(days / 30)
  return `${months}mo ago`
}

function RiskRing({ percent, color }: { percent: number; color: string }) {
  const radius = 28
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - percent / 100)
  return (
    <svg viewBox="0 0 68 68" className="size-16 shrink-0 -rotate-90">
      <circle cx="34" cy="34" r={radius} fill="none" stroke="currentColor" strokeWidth="6" className="text-slate-800" />
      <circle
        cx="34"
        cy="34"
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        className="transition-[stroke-dashoffset] duration-700 ease-out"
      />
    </svg>
  )
}

function ProportionBar({ value, total, color }: { value: number; total: number; color: string }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0
  return (
    <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
      <div
        className="animate-grow-bar h-full rounded-full"
        style={{ width: `${pct}%`, backgroundColor: color }}
      />
    </div>
  )
}

function HeartVisual() {
  return (
    <div className="relative flex h-full flex-col items-center justify-center overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-8 shadow-sm">
      <div aria-hidden="true" className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-12 -left-12 h-56 w-56 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute -bottom-12 -right-10 h-56 w-56 rounded-full bg-cyan-500/10 blur-3xl" />
      </div>

      <svg aria-hidden="true" viewBox="0 0 100 60" className="absolute right-5 top-5 h-14 w-20 text-indigo-400/50">
        <g fill="currentColor">
          <circle cx="10" cy="10" r="2.2" />
          <circle cx="40" cy="5" r="2.2" />
          <circle cx="70" cy="15" r="2.2" />
          <circle cx="25" cy="35" r="2.2" />
          <circle cx="60" cy="40" r="2.2" />
          <circle cx="90" cy="30" r="2.2" />
        </g>
        <g stroke="currentColor" strokeWidth="0.8" opacity="0.6">
          <path d="M10 10 40 5M40 5 70 15M10 10 25 35M25 35 60 40M40 5 60 40M60 40 90 30M70 15 90 30" />
        </g>
      </svg>

      <div className="animate-pulse-soft flex items-center justify-center">
        <svg viewBox="0 0 100 90" className="h-32 w-32 drop-shadow-sm" role="img" aria-label="Stylized heart graphic">
          <defs>
            <linearGradient id="dashboardHeartGradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
          </defs>
          <path
            fill="url(#dashboardHeartGradient)"
            d="M50 82C22 63 6 46 6 28.5 6 14.8 17 4 30 4c8 0 15 4 20 10 5-6 12-10 20-10 13 0 24 10.8 24 24.5C94 46 78 63 50 82Z"
          />
        </svg>
      </div>

      <svg viewBox="0 0 240 40" className="mx-auto -mt-2 h-10 w-full max-w-xs text-cyan-400" aria-hidden="true">
        <path
          className="animate-ecg-draw"
          d="M0 20 H70 L82 20 L90 4 L100 36 L110 20 H150 L160 8 L168 32 L176 20 H240"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      <p className="mt-3 text-center text-xs font-medium text-slate-500">
        Illustrative visualization — not a live reading
      </p>
    </div>
  )
}

function RiskBreakdown({ predictions }: { predictions: PredictionResult[] }) {
  const total = predictions.length
  const counts: Record<RiskLabel, number> = { Low: 0, Moderate: 0, High: 0 }
  predictions.forEach((p) => {
    counts[p.risk_label] += 1
  })

  const trend = useMemo(() => {
    if (predictions.length < 2) return null
    const [latest, previous] = predictions
    const deltaPts = Math.round((latest.probability - previous.probability) * 100)
    if (deltaPts === 0) return { direction: 'flat' as const, deltaPts: 0 }
    return { direction: deltaPts > 0 ? ('up' as const) : ('down' as const), deltaPts: Math.abs(deltaPts) }
  }, [predictions])

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-slate-200">Risk breakdown</h2>
        {trend && (
          <span
            className={`inline-flex items-center gap-1 text-xs font-medium ${
              trend.direction === 'up' ? 'text-red-300' : trend.direction === 'down' ? 'text-emerald-300' : 'text-slate-400'
            }`}
          >
            {trend.direction !== 'flat' && (
              <ArrowRightIcon className={`size-3.5 ${trend.direction === 'up' ? '-rotate-90' : 'rotate-90'}`} />
            )}
            {trend.direction === 'flat' ? 'No change' : `${trend.deltaPts} pts`} vs previous assessment
          </span>
        )}
      </div>

      <div className="mt-4 flex h-2.5 w-full overflow-hidden rounded-full bg-slate-800">
        {(['Low', 'Moderate', 'High'] as RiskLabel[]).map((label) =>
          counts[label] > 0 ? (
            <div
              key={label}
              className={`${RISK_BAR[label]} h-full`}
              style={{ width: `${(counts[label] / total) * 100}%` }}
            />
          ) : null,
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5">
        {(['Low', 'Moderate', 'High'] as RiskLabel[]).map((label) => (
          <span key={label} className="inline-flex items-center gap-1.5 text-xs text-slate-400">
            <span className={`size-2 rounded-full ${RISK_DOT[label]}`} />
            {label} · {counts[label]}
          </span>
        ))}
      </div>
    </div>
  )
}

function LatestInsight({ latest }: { latest: PredictionResult }) {
  const { data, isLoading, isError } = usePredictionExplanation(String(latest.id), true)

  if (isError) return null

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <div className="flex items-center gap-2">
        <span className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-fuchsia-400 to-purple-500 text-white">
          <SparklesIcon className="size-4" />
        </span>
        <h2 className="text-sm font-semibold text-slate-200">Latest AI summary</h2>
      </div>
      {isLoading && <p className="mt-3 text-sm text-slate-500">Generating summary…</p>}
      {!isLoading && data && (
        <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-slate-400">{data.llm_summary}</p>
      )}
      <Link
        to={`/predictions/${latest.id}`}
        className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-indigo-400 hover:text-indigo-300"
      >
        Read full analysis
        <ArrowRightIcon className="size-3.5" />
      </Link>
    </div>
  )
}

export function DashboardPage() {
  const { user } = useAuth()
  const { data: predictions, isLoading } = usePredictionHistory()
  const [filter, setFilter] = useState<Filter>('all')

  if (!user) return null

  const total = predictions?.length ?? 0
  const basicCount = predictions?.filter((p) => p.tier === 'basic').length ?? 0
  const enhancedCount = predictions?.filter((p) => p.tier === 'enhanced').length ?? 0
  const latest = predictions?.[0]
  const latestPercent = latest ? Math.round(latest.probability * 100) : 0
  const ringColor = latest ? RISK_RING[latest.risk_label] : '#818cf8'

  const filtered = useMemo(() => {
    const list = predictions ?? []
    const byTier = filter === 'all' ? list : list.filter((p) => p.tier === filter)
    return byTier.slice(0, 5)
  }, [predictions, filter])

  return (
    <div className="mx-auto max-w-6xl space-y-8 py-4">
      {/* Header */}
      <header className="animate-fade-in-up flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Welcome back, {displayName(user.first_name, user.last_name, user.email)}
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Here&apos;s a summary of your risk assessments and quick access to what you can do next.
            {latest && <span className="text-slate-500"> · Last assessment {timeAgo(latest.created_at)}</span>}
          </p>
        </div>
        {total > 0 && (
          <div className="flex items-center gap-1 rounded-full border border-slate-800 bg-slate-900 p-1">
            {(['all', 'basic', 'enhanced'] as Filter[]).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-medium capitalize transition-all duration-150 ${
                  filter === f
                    ? 'bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-sm shadow-indigo-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        )}
      </header>

      {isLoading && <p className="text-sm text-slate-500">Loading your dashboard…</p>}

      {!isLoading && total === 0 && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-10 text-center shadow-sm">
          <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 text-white">
            <PlusIcon className="size-7" />
          </span>
          <h2 className="mt-4 text-lg font-semibold text-white">No assessments yet</h2>
          <p className="mx-auto mt-1 max-w-sm text-sm text-slate-400">
            Run your first heart disease risk assessment to see your results and quick stats here.
          </p>
          <Link
            to="/predict"
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-indigo-500/25 transition-all duration-150 hover:shadow-md"
          >
            Start your first assessment
          </Link>
        </div>
      )}

      {/* Body */}
      {!isLoading && total > 0 && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px]">
            <HeartVisual />

            <div className="grid grid-cols-2 content-start gap-4">
              <div className="col-span-2 flex items-center gap-4 rounded-2xl border border-slate-800 bg-slate-900 p-5">
                <RiskRing percent={latestPercent} color={ringColor} />
                <div>
                  <p className="text-xs text-slate-400">Latest estimated risk</p>
                  <p className="text-2xl font-bold text-white">{latestPercent}%</p>
                  {latest && (
                    <span
                      className={`mt-1 inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
                        latest.tier === 'legacy' ? 'bg-slate-800 text-slate-300' : RISK_STYLES[latest.risk_label]
                      }`}
                    >
                      {latest.risk_label} risk
                    </span>
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
                <span className={`flex size-9 items-center justify-center rounded-lg bg-gradient-to-br text-white ${accentFor(0)}`}>
                  <FileTextIcon className="size-[18px]" />
                </span>
                <p className="mt-3 text-2xl font-bold text-white">{total}</p>
                <p className="text-xs text-slate-400">Total assessments</p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
                <span className={`flex size-9 items-center justify-center rounded-lg bg-gradient-to-br text-white ${accentFor(2)}`}>
                  <LayersIcon className="size-[18px]" />
                </span>
                <p className="mt-3 text-2xl font-bold text-white">{basicCount}</p>
                <p className="text-xs text-slate-400">Basic assessments</p>
                <ProportionBar value={basicCount} total={total} color="#34d399" />
              </div>

              <div className="col-span-2 rounded-2xl border border-slate-800 bg-slate-900 p-5">
                <span className={`flex size-9 items-center justify-center rounded-lg bg-gradient-to-br text-white ${accentFor(3)}`}>
                  <LayersIcon className="size-[18px]" />
                </span>
                <p className="mt-3 text-2xl font-bold text-white">{enhancedCount}</p>
                <p className="text-xs text-slate-400">Enhanced assessments</p>
                <ProportionBar value={enhancedCount} total={total} color="#f97316" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <RiskBreakdown predictions={predictions ?? []} />
            {latest && <LatestInsight latest={latest} />}
          </div>

          {/* Recent activity */}
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-200">Recent activity</h2>
              <Link to="/history" className="text-xs font-medium text-indigo-400 hover:text-indigo-300">
                View all →
              </Link>
            </div>
            {filtered.length === 0 ? (
              <p className="mt-3 text-sm text-slate-500">No {filter} assessments yet.</p>
            ) : (
              <ul className="mt-3 space-y-3">
                {filtered.map((item) => (
                  <li key={item.id}>
                    <Link
                      to={`/predictions/${item.id}`}
                      className="flex items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900 p-4 shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:border-slate-700 hover:shadow-md hover:shadow-indigo-500/10"
                    >
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <TierBadge tier={item.tier} />
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              item.tier === 'legacy' ? 'bg-slate-800 text-slate-300' : RISK_STYLES[item.risk_label]
                            }`}
                          >
                            {item.risk_label} risk
                          </span>
                        </div>
                        <p className="mt-1.5 text-xs text-slate-500">
                          {new Date(item.created_at).toLocaleString()} · {item.model_version}
                        </p>
                      </div>
                      <span className="shrink-0 bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-lg font-bold text-transparent">
                        {Math.round(item.probability * 100)}%
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-800 pt-6">
        <h2 className="text-sm font-semibold text-slate-200">Quick actions</h2>
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {QUICK_ACTIONS.map(({ to, icon: Icon, title, description }, i) => (
            <Link
              key={to}
              to={to}
              className="rounded-2xl border border-slate-800 bg-slate-900 p-5 transition-all duration-150 hover:-translate-y-0.5 hover:border-slate-700 hover:shadow-md"
            >
              <span className={`flex size-10 items-center justify-center rounded-xl bg-gradient-to-br text-white ${accentFor(i)}`}>
                <Icon className="size-5" />
              </span>
              <h3 className="mt-3 text-sm font-semibold text-white">{title}</h3>
              <p className="mt-1 text-xs text-slate-400">{description}</p>
            </Link>
          ))}
          {latest && (
            <a
              href={`/api/predictions/${latest.id}/report/`}
              download
              className="rounded-2xl border border-slate-800 bg-slate-900 p-5 transition-all duration-150 hover:-translate-y-0.5 hover:border-slate-700 hover:shadow-md"
            >
              <span className={`flex size-10 items-center justify-center rounded-xl bg-gradient-to-br text-white ${accentFor(3)}`}>
                <DownloadIcon className="size-5" />
              </span>
              <h3 className="mt-3 text-sm font-semibold text-white">Download latest report</h3>
              <p className="mt-1 text-xs text-slate-400">Get a PDF copy of your most recent assessment.</p>
            </a>
          )}
        </div>
      </footer>
    </div>
  )
}

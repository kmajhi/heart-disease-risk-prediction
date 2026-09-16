import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { TierBadge } from '../../features/prediction-result/TierBadge'
import { downloadPredictionsCsv } from '../../features/shared/exportCsv'
import { DownloadIcon, FileTextIcon } from '../../features/shared/icons'
import { usePredictionHistory } from '../../hooks/usePredictionMutations'
import type { RiskLabel } from '../../types/prediction'

const RISK_STYLES: Record<RiskLabel, string> = {
  Low: 'bg-emerald-500/10 text-emerald-300',
  Moderate: 'bg-amber-500/10 text-amber-300',
  High: 'bg-red-500/10 text-red-300',
}

export function PredictionHistoryPage() {
  const { data, isLoading, error } = usePredictionHistory()
  const [selected, setSelected] = useState<number[]>([])
  const navigate = useNavigate()

  const toggleSelected = (id: number) => {
    setSelected((current) => {
      if (current.includes(id)) return current.filter((existing) => existing !== id)
      if (current.length >= 2) return [current[1], id]
      return [...current, id]
    })
  }

  const handleCompare = () => {
    if (selected.length !== 2) return
    // Oldest-first, so the compare page reads as "then vs. now".
    const [newer, older] = selected[0] > selected[1] ? [selected[0], selected[1]] : [selected[1], selected[0]]
    navigate(`/predictions/compare/${older}/${newer}`)
  }

  return (
    <div className="-mx-4 -my-8 bg-slate-950 px-4 py-8">
      <div className="mx-auto max-w-3xl space-y-6 pb-16">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Your Assessment History</h1>
            <p className="mt-1 text-sm text-slate-400">
              A log of your past risk assessments — probability, risk label, and the model used at the time.
              Select two to compare them.
            </p>
          </div>
          {data && data.length > 0 && (
            <button
              type="button"
              onClick={() => downloadPredictionsCsv(data)}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-200 transition-all duration-150 hover:border-indigo-500/50 hover:text-indigo-300"
            >
              <DownloadIcon className="size-3.5" />
              Export CSV
            </button>
          )}
        </div>

        {isLoading && <p className="text-sm text-slate-500">Loading…</p>}

        {error && (
          <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            Could not load your history. Please try again shortly.
          </p>
        )}

        {data && data.length === 0 && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center shadow-sm">
            <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-400">
              <FileTextIcon className="size-6" />
            </span>
            <h2 className="mt-4 text-sm font-semibold text-slate-100">No assessments yet</h2>
            <p className="mt-1 text-sm text-slate-400">
              Once you complete a risk assessment, it will show up here.
            </p>
            <Link
              to="/predict"
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-indigo-500/25 transition-all duration-150 hover:shadow-md"
            >
              Start an assessment
            </Link>
          </div>
        )}

        {data && data.length > 0 && (
          <ul className="space-y-3">
            {data.map((item) => {
              const isSelected = selected.includes(item.id)
              return (
                <li key={item.id}>
                  <div
                    className={`flex items-center gap-3 rounded-2xl border p-4 shadow-sm transition-all duration-150 ${
                      isSelected
                        ? 'border-indigo-500/60 bg-indigo-500/5'
                        : 'border-slate-800 bg-slate-900 hover:border-slate-700'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelected(item.id)}
                      aria-label={`Select assessment from ${new Date(item.created_at).toLocaleString()} to compare`}
                      className="size-4 shrink-0 rounded border-slate-600 bg-slate-800 text-indigo-500 focus:ring-indigo-500/40"
                    />
                    <Link
                      to={`/predictions/${item.id}`}
                      className="flex min-w-0 flex-1 items-center justify-between gap-4 hover:-translate-y-0.5 hover:shadow-md hover:shadow-indigo-500/10"
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
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {selected.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-800 bg-slate-900/95 px-4 py-3 backdrop-blur-lg">
          <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
            <p className="text-sm text-slate-300">
              {selected.length} of 2 selected{selected.length === 1 ? ' — pick one more to compare' : ''}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSelected([])}
                className="rounded-full px-3.5 py-1.5 text-xs font-medium text-slate-400 hover:text-white"
              >
                Clear
              </button>
              <button
                type="button"
                disabled={selected.length !== 2}
                onClick={handleCompare}
                className="rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500 px-4 py-1.5 text-xs font-semibold text-white shadow-sm shadow-indigo-500/30 transition-all duration-150 hover:shadow-md disabled:opacity-40"
              >
                Compare
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

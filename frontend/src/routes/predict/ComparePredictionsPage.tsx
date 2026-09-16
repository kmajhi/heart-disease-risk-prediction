import { Link, useParams } from 'react-router-dom'
import { ExplanationCard } from '../../features/prediction-result/ExplanationCard'
import { TierBadge } from '../../features/prediction-result/TierBadge'
import { ArrowRightIcon } from '../../features/shared/icons'
import { usePrediction } from '../../hooks/usePredictionMutations'
import type { PredictionResult, RiskLabel } from '../../types/prediction'

const RISK_STYLES: Record<RiskLabel, string> = {
  Low: 'bg-emerald-500/10 text-emerald-300',
  Moderate: 'bg-amber-500/10 text-amber-300',
  High: 'bg-red-500/10 text-red-300',
}

function PredictionColumn({
  id,
  data,
  isLoading,
  isError,
}: {
  id: string | undefined
  data: PredictionResult | undefined
  isLoading: boolean
  isError: boolean
}) {
  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
        <p className="text-sm text-slate-500">Loading…</p>
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="rounded-2xl border border-red-900 bg-red-950/30 p-5">
        <p className="text-sm text-red-300">
          Couldn&apos;t load prediction #{id}. It may not exist or belong to another account.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <TierBadge tier={data.tier} />
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
              data.tier === 'legacy' ? 'bg-slate-800 text-slate-300' : RISK_STYLES[data.risk_label]
            }`}
          >
            {data.risk_label} risk
          </span>
        </div>
        <p className="mt-1.5 text-xs text-slate-500">
          {new Date(data.created_at).toLocaleString()} · {data.model_version}
        </p>
      </div>

      <div className="flex items-end gap-4">
        <p className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-4xl font-bold text-transparent">
          {Math.round(data.probability * 100)}%
        </p>
        {data.bmi !== null && <p className="pb-1 text-xs text-slate-400">BMI {data.bmi.toFixed(1)}</p>}
      </div>

      <ExplanationCard explanation={data.explanation} />

      <Link
        to={`/predictions/${data.id}`}
        className="inline-flex items-center gap-1 text-xs font-medium text-indigo-400 hover:text-indigo-300"
      >
        View full result
        <ArrowRightIcon className="size-3.5" />
      </Link>
    </div>
  )
}

export function ComparePredictionsPage() {
  const { a, b } = useParams<{ a: string; b: string }>()
  const first = usePrediction(a)
  const second = usePrediction(b)

  const deltaPts =
    first.data && second.data ? Math.round((second.data.probability - first.data.probability) * 100) : null

  return (
    <div className="mx-auto max-w-5xl space-y-6 py-4">
      <header className="animate-fade-in-up">
        <h1 className="text-2xl font-bold tracking-tight text-white">Compare assessments</h1>
        <p className="mt-1 text-sm text-slate-400">
          A side-by-side look at two of your past assessments and what changed.
        </p>
      </header>

      {deltaPts !== null && (
        <div
          className={`rounded-2xl border p-4 text-sm font-medium ${
            deltaPts > 0
              ? 'border-red-900 bg-red-950/30 text-red-300'
              : deltaPts < 0
                ? 'border-emerald-900 bg-emerald-950/30 text-emerald-300'
                : 'border-slate-800 bg-slate-900 text-slate-300'
          }`}
        >
          {deltaPts === 0
            ? 'Estimated risk is unchanged between these two assessments.'
            : `Estimated risk ${deltaPts > 0 ? 'increased' : 'decreased'} by ${Math.abs(deltaPts)} percentage points from the first to the second assessment.`}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <PredictionColumn id={a} data={first.data} isLoading={first.isLoading} isError={first.isError} />
        <PredictionColumn id={b} data={second.data} isLoading={second.isLoading} isError={second.isError} />
      </div>
    </div>
  )
}

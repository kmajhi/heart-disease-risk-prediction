import type { Tier } from '../../types/prediction'

export function AssessmentSummary({
  tier,
  completed,
  total,
}: {
  tier: Tier
  completed: number
  total: number
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-sm">
      <h2 className="text-sm font-semibold text-slate-100">Ready to Analyze?</h2>
      <dl className="mt-3 grid grid-cols-3 gap-3 text-center">
        <div>
          <dt className="text-xs text-slate-500">Assessment</dt>
          <dd className="mt-0.5 text-sm font-semibold capitalize text-slate-100">{tier}</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-500">Required information</dt>
          <dd className="mt-0.5 text-sm font-semibold text-slate-100">
            {completed} / {total} completed
          </dd>
        </div>
        <div>
          <dt className="text-xs text-slate-500">AI model</dt>
          <dd className="mt-0.5 text-sm font-semibold text-slate-100">XGBoost</dd>
        </div>
      </dl>
    </div>
  )
}

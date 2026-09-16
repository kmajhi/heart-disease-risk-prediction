import type { Tier } from '../../types/prediction'

export function TierBadge({ tier }: { tier: Tier | 'legacy' }) {
  if (tier === 'legacy') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800 dark:bg-amber-950 dark:text-amber-200">
        Legacy Model Prediction
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium capitalize text-slate-700 dark:bg-slate-800 dark:text-slate-200">
      {tier} prediction
    </span>
  )
}

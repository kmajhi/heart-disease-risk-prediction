import type { Tier } from '../../types/prediction'

const RATIONALE: Record<'basic' | 'enhanced', string> = {
  basic:
    'chosen to balance sensitivity and specificity (Youden’s index) — pushing for higher sensitivity alone would have cost too much specificity given this tier’s more limited information.',
  enhanced:
    'chosen to prioritize sensitivity (catching true positive cases) over specificity — appropriate for a screening/decision-support tool, where missing a case is costlier than a false alarm.',
}

export function ThresholdInfoNote({ threshold, tier }: { threshold: number; tier: Tier | 'legacy' }) {
  const rationale = tier === 'basic' || tier === 'enhanced' ? RATIONALE[tier] : null

  return (
    <p className="text-xs text-slate-500 dark:text-slate-400">
      Classified using a probability threshold of {Math.round(threshold * 1000) / 10}%
      {rationale ? `, ${rationale}` : '.'}
    </p>
  )
}

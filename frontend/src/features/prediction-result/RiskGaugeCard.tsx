import type { RiskLabel } from '../../types/prediction'

const RISK_STYLES: Record<RiskLabel, string> = {
  Low: 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200',
  Moderate: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200',
  High: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200',
}

export function RiskGaugeCard({
  probability,
  riskLabel,
}: {
  probability: number
  riskLabel: RiskLabel
}) {
  const percent = Math.round(probability * 1000) / 10

  return (
    <div className="rounded-lg border border-slate-200 p-6 text-center dark:border-slate-800">
      <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
        Estimated risk
      </p>
      <p className="mt-1 text-4xl font-bold">{percent}%</p>
      <span className={`mt-3 inline-block rounded-full px-3 py-1 text-sm font-medium ${RISK_STYLES[riskLabel]}`}>
        {riskLabel} risk
      </span>
    </div>
  )
}

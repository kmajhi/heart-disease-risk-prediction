import { useParams } from 'react-router-dom'
import { ApiError } from '../../api/client'
import { ExplanationCard } from '../../features/prediction-result/ExplanationCard'
import { LlmSummaryCard } from '../../features/prediction-result/LlmSummaryCard'
import { ModelUsedBadge } from '../../features/prediction-result/ModelUsedBadge'
import { PredictionMetaFooter } from '../../features/prediction-result/PredictionMetaFooter'
import { RiskGaugeCard } from '../../features/prediction-result/RiskGaugeCard'
import { ThresholdInfoNote } from '../../features/prediction-result/ThresholdInfoNote'
import { TierBadge } from '../../features/prediction-result/TierBadge'
import { ErrorBanner } from '../../features/shared/ErrorBanner'
import { DownloadIcon } from '../../features/shared/icons'
import { ShareButtons } from '../../features/shared/ShareButtons'
import { usePrediction } from '../../hooks/usePredictionMutations'

export function PredictionResultPage() {
  const { id } = useParams()
  const { data, isLoading, error } = usePrediction(id)

  if (isLoading) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">Loading…</p>
  }

  if (error) {
    const message =
      error instanceof ApiError && error.status === 404
        ? "This prediction doesn't exist or doesn't belong to your account."
        : 'Could not load this prediction.'
    return <ErrorBanner message={message} />
  }

  if (!data) return null

  const isLegacy = data.tier === 'legacy'

  return (
    <div className="animate-fade-in-up mx-auto max-w-xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Risk Assessment Result</h1>
        <TierBadge tier={data.tier} />
      </div>

      {isLegacy && (
        <p className="rounded border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
          This prediction was produced by an earlier, retired single-tier model — not the
          current Basic/Enhanced system. It is kept for your records but is not directly
          comparable to new predictions.
        </p>
      )}

      <RiskGaugeCard probability={data.probability} riskLabel={data.risk_label} />

      {data.bmi !== null && (
        <p className="text-sm text-slate-600 dark:text-slate-300">
          BMI: <span className="font-medium">{data.bmi}</span>{' '}
          <span className="text-xs text-slate-400">(for reference only — not used by the model)</span>
        </p>
      )}

      <div className="space-y-2">
        <ModelUsedBadge modelVersion={data.model_version} />
        <ThresholdInfoNote threshold={data.threshold_used} tier={data.tier} />
      </div>

      {/* Legacy rows never have a SHAP explanation — never fabricated, only rendered when real. */}
      <ExplanationCard explanation={data.explanation} />

      <LlmSummaryCard id={data.id} tier={data.tier} />

      <div className="rounded-2xl border border-slate-200/70 bg-white/60 p-4 backdrop-blur-sm dark:border-slate-800/70 dark:bg-slate-900/40">
        <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Share &amp; download</h2>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Download a PDF copy of this report, or share a link back to this result. No personal data
          beyond what&apos;s already on this page is included.
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <a
            href={`/api/predictions/${data.id}/report/`}
            download
            className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm shadow-indigo-500/30 transition-all duration-150 hover:shadow-md"
          >
            <DownloadIcon className="size-3.5" />
            Download Report (PDF)
          </a>
        </div>
        {!isLegacy && (
          <div className="mt-3">
            <ShareButtons
              url={window.location.href}
              text={`My Heart Risk AI screening result: ${data.risk_label} risk (${Math.round(
                data.probability * 100,
              )}% estimated probability). Research prototype, not a medical diagnosis.`}
            />
          </div>
        )}
      </div>

      <PredictionMetaFooter input={data.input} createdAt={data.created_at} />
    </div>
  )
}

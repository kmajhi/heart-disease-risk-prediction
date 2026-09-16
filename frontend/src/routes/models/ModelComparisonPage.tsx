import { useState } from 'react'
import {
  CONFUSION_MATRICES,
  DEV_CV_AUC_BY_ALGORITHM,
  DEV_CV_TOP_CONTENDERS,
  FINAL_TEST_RESULTS,
  MAJORITY_CLASS_BASELINE_ACCURACY,
  SIGNIFICANCE_TEST,
  THRESHOLD_RATIONALE,
  TIER_SAMPLE_SIZES,
} from '../../features/model-comparison/comparisonData'
import type { Tier } from '../../types/prediction'

function pct(value: number) {
  return `${(value * 100).toFixed(1)}%`
}

function TierPicker({ tier, onChange }: { tier: Tier; onChange: (tier: Tier) => void }) {
  return (
    <div className="inline-flex rounded-xl border border-slate-700 bg-slate-900 p-1">
      {(['basic', 'enhanced'] as const).map((t) => (
        <button
          key={t}
          type="button"
          onClick={() => onChange(t)}
          className={`rounded-lg px-4 py-2 text-sm font-medium capitalize transition-all duration-150 ${
            tier === t
              ? 'bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-sm shadow-indigo-500/30'
              : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
          }`}
        >
          {t}
        </button>
      ))}
    </div>
  )
}

function AucBars({ tier }: { tier: Tier }) {
  const maxAuc = Math.max(...DEV_CV_AUC_BY_ALGORITHM.map((a) => a[tier]))
  return (
    <ul className="space-y-3">
      {[...DEV_CV_AUC_BY_ALGORITHM]
        .sort((a, b) => b[tier] - a[tier])
        .map((row) => (
          <li key={row.algorithm}>
            <div className="flex items-baseline justify-between text-sm">
              <span className={`font-medium ${row.isSelected ? 'text-indigo-300' : 'text-slate-300'}`}>
                {row.algorithm}
                {row.isSelected && (
                  <span className="ml-2 rounded-full bg-indigo-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-indigo-300">
                    Selected
                  </span>
                )}
              </span>
              <span className="text-slate-500">{row[tier].toFixed(3)}</span>
            </div>
            <div className="mt-1 h-2.5 w-full overflow-hidden rounded-full bg-slate-800">
              <div
                className={`h-full rounded-full ${row.isSelected ? 'bg-gradient-to-r from-indigo-500 to-cyan-500' : 'bg-slate-600'}`}
                style={{ width: `${(row[tier] / maxAuc) * 100}%` }}
              />
            </div>
          </li>
        ))}
    </ul>
  )
}

function MetricsTable({
  rows,
  extraColumns,
}: {
  rows: { algorithm: string; auc: number; accuracy: number; precision: number; recall: number; specificity: number; f1: number; isSelected?: boolean; threshold?: number; brier?: number }[]
  extraColumns?: boolean
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[560px] text-left text-sm">
        <thead>
          <tr className="border-b border-slate-800 text-xs uppercase tracking-wide text-slate-500">
            <th className="py-2 pr-3 font-medium">Algorithm</th>
            {extraColumns && <th className="px-3 py-2 font-medium">Threshold</th>}
            <th className="px-3 py-2 font-medium">AUC</th>
            <th className="px-3 py-2 font-medium">Accuracy</th>
            <th className="px-3 py-2 font-medium">Precision</th>
            <th className="px-3 py-2 font-medium">Recall</th>
            <th className="px-3 py-2 font-medium">Specificity</th>
            <th className="px-3 py-2 font-medium">F1</th>
            {extraColumns && <th className="px-3 py-2 font-medium">Brier</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.algorithm} className={`border-b border-slate-800/70 ${row.isSelected ? 'bg-indigo-500/5' : ''}`}>
              <td className="py-2.5 pr-3 font-medium text-slate-200">
                {row.algorithm}
                {row.isSelected && <span className="ml-1.5 text-xs text-indigo-400">(selected)</span>}
              </td>
              {extraColumns && <td className="px-3 py-2.5 text-slate-400">{row.threshold?.toFixed(4)}</td>}
              <td className="px-3 py-2.5 text-slate-400">{row.auc.toFixed(3)}</td>
              <td className="px-3 py-2.5 text-slate-400">{pct(row.accuracy)}</td>
              <td className="px-3 py-2.5 text-slate-400">{pct(row.precision)}</td>
              <td className="px-3 py-2.5 text-slate-400">{pct(row.recall)}</td>
              <td className="px-3 py-2.5 text-slate-400">{pct(row.specificity)}</td>
              <td className="px-3 py-2.5 text-slate-400">{pct(row.f1)}</td>
              {extraColumns && <td className="px-3 py-2.5 text-slate-400">{row.brier?.toFixed(4)}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function ConfusionMatrix({ tier }: { tier: Tier }) {
  const m = CONFUSION_MATRICES[tier]
  const cell = (label: string, value: number, tone: string) => (
    <div className={`rounded-xl p-4 text-center ${tone}`}>
      <p className="text-2xl font-bold">{value}</p>
      <p className="mt-1 text-xs text-slate-400">{label}</p>
    </div>
  )
  return (
    <div className="grid grid-cols-2 gap-2 sm:w-80">
      {cell('True Negative', m.tn, 'bg-emerald-500/10 text-emerald-300')}
      {cell('False Positive', m.fp, 'bg-amber-500/10 text-amber-300')}
      {cell('False Negative', m.fn, 'bg-red-500/10 text-red-300')}
      {cell('True Positive', m.tp, 'bg-emerald-500/10 text-emerald-300')}
    </div>
  )
}

export function ModelComparisonPage() {
  const [tier, setTier] = useState<Tier>('basic')
  const sig = SIGNIFICANCE_TEST[tier]
  const thresholdInfo = THRESHOLD_RATIONALE[tier]

  return (
    <div className="-mx-4 -my-8 bg-slate-950 px-4 py-8">
      <div className="mx-auto max-w-6xl space-y-10">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-white">Model Comparison</h1>
          <p className="mx-auto mt-2 max-w-xl text-slate-400">
            Real evaluation results from the finalized ML-5 methodology — development
            cross-validation and a held-out final test set, evaluated once. Nothing here is a
            placeholder number.
          </p>
          <div className="mt-6 flex justify-center">
            <TierPicker tier={tier} onChange={setTier} />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          {/* Dev-CV comparison across all 6 algorithms */}
          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-100">
              Development Cross-Validation — All 6 Required Algorithms
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Stratified 5-fold CV on the {TIER_SAMPLE_SIZES.development}-record development set. This is
              not the final test result (see below).
            </p>
            <div className="mt-5">
              <AucBars tier={tier} />
            </div>
          </section>

          {/* Full metrics for top contenders */}
          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-100">Full Metrics — Top Contenders (Development CV)</h2>
            <div className="mt-4">
              <MetricsTable rows={DEV_CV_TOP_CONTENDERS[tier]} />
            </div>
          </section>
        </div>

        {/* RF vs XGBoost significance */}
        <section className="rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-slate-900 to-indigo-950/40 p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-100">Random Forest vs. XGBoost</h2>
          <p className="mt-2 text-sm text-slate-300">
            Paired significance test on development-CV fold AUCs: t = {sig.t.toFixed(3)}, p = {sig.p.toFixed(3)}.
            No statistically significant difference was detected — the two algorithms show{' '}
            <strong className="font-semibold text-white">comparable performance</strong>, not
            "statistically equivalent" (5 paired folds is low statistical power, so this means no evidence
            of a difference was found, not proof of true equivalence). XGBoost is the primary model for
            both tiers per the finalized configuration; Random Forest is retained as the documented
            alternative.
          </p>
        </section>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          {/* Final held-out test */}
          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-sm xl:col-span-2">
            <h2 className="text-sm font-semibold text-slate-100">
              Final Held-Out Test Set (n = {TIER_SAMPLE_SIZES.finalTest}, evaluated once)
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Majority-class baseline accuracy: {pct(MAJORITY_CLASS_BASELINE_ACCURACY)} — both models clear
              it decisively.
            </p>
            <div className="mt-4">
              <MetricsTable rows={FINAL_TEST_RESULTS[tier]} extraColumns />
            </div>
          </section>

          {/* Confusion matrix */}
          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-100">
              Confusion Matrix — {tier === 'basic' ? 'Basic' : 'Enhanced'} XGBoost (Final Test)
            </h2>
            <div className="mt-4">
              <ConfusionMatrix tier={tier} />
            </div>
          </section>

          {/* Threshold rationale */}
          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-100">
              Decision Threshold — {thresholdInfo.threshold.toFixed(4)} ({thresholdInfo.label})
            </h2>
            <p className="mt-2 text-sm text-slate-300">{thresholdInfo.rationale}</p>
          </section>
        </div>

        <p className="text-center text-xs text-slate-500">
          Single-institution, retrospective cohort ({TIER_SAMPLE_SIZES.totalAdultRecords} adult records).
          No external validation cohort exists — these results demonstrate within-sample performance, not
          generalization to a different population or institution.
        </p>
      </div>
    </div>
  )
}

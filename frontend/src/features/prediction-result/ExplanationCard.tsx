import type { Explanation, ExplanationFactor } from '../../types/prediction'

const FEATURE_LABELS: Record<string, string> = {
  Age: 'Age',
  Sex: 'Sex',
  'Height (cm)': 'Height',
  'Weight (kg)': 'Weight',
  'BP(mmHg)': 'Blood pressure',
  'Family H/O': 'Family history',
  Hypertension: 'Hypertension',
  Diabetes: 'Diabetes',
  'H/O ChestPain': 'Chest pain history',
  'Total_Cholesterol(mg/dL)': 'Total cholesterol',
  'LDL(mg/dL)': 'LDL',
  'Triglycerides(mg/dL)': 'Triglycerides',
  'RBS(mmol/L)': 'Random blood sugar',
}

const BINARY_FEATURES = new Set(['Family H/O', 'Hypertension', 'Diabetes', 'H/O ChestPain'])

function labelFor(feature: string) {
  return FEATURE_LABELS[feature] ?? feature
}

function formatFactorValue(feature: string, value: ExplanationFactor['value']) {
  if (BINARY_FEATURES.has(feature)) return Number(value) === 1 ? 'Yes' : 'No'
  return String(value)
}

function FactorBar({ factor, maxAbsContribution }: { factor: ExplanationFactor; maxAbsContribution: number }) {
  const widthPct = maxAbsContribution > 0 ? (Math.abs(factor.contribution) / maxAbsContribution) * 100 : 0
  const isIncreasing = factor.direction === 'increases_risk'

  return (
    <li>
      <div className="flex items-baseline justify-between text-sm">
        <span className="font-medium text-slate-700 dark:text-slate-200">{labelFor(factor.feature)}</span>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {formatFactorValue(factor.feature, factor.value)}
        </span>
      </div>
      <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        <div
          className={`h-full rounded-full ${isIncreasing ? 'bg-red-500' : 'bg-green-500'}`}
          style={{ width: `${widthPct}%` }}
        />
      </div>
    </li>
  )
}

export function ExplanationCard({ explanation }: { explanation: Explanation | null }) {
  if (!explanation || explanation.top_factors.length === 0) return null

  const maxAbsContribution = Math.max(...explanation.top_factors.map((f) => Math.abs(f.contribution)))
  const increasing = explanation.top_factors.filter((f) => f.direction === 'increases_risk')
  const decreasing = explanation.top_factors.filter((f) => f.direction === 'decreases_risk')

  return (
    <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
      <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
        Why did the model make this prediction?
      </h2>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
        These factors contributed to this specific model estimate — they describe how the
        model weighed the information you provided, not a medical cause. For example,
        "{labelFor(explanation.top_factors[0].feature)} contributed to a higher
        model-estimated risk in this prediction" — not a diagnosis.
      </p>

      {increasing.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-medium uppercase tracking-wide text-red-600 dark:text-red-400">
            Contributed to a higher model-estimated risk
          </p>
          <ul className="mt-2 space-y-3">
            {increasing.map((factor) => (
              <FactorBar key={factor.feature} factor={factor} maxAbsContribution={maxAbsContribution} />
            ))}
          </ul>
        </div>
      )}

      {decreasing.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-medium uppercase tracking-wide text-green-600 dark:text-green-400">
            Contributed to a lower model-estimated risk
          </p>
          <ul className="mt-2 space-y-3">
            {decreasing.map((factor) => (
              <FactorBar key={factor.feature} factor={factor} maxAbsContribution={maxAbsContribution} />
            ))}
          </ul>
        </div>
      )}

      <p className="mt-4 text-xs text-slate-400">
        This is a research prototype's model output, not a medical diagnosis.
      </p>
    </div>
  )
}

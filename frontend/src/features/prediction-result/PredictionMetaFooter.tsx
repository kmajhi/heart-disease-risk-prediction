// Superset of labels across Basic/Enhanced/legacy inputs — legacy rows can
// contain fields (hdl, max_hr, troponin_i, ...) that no longer exist in the
// active ML-5 schema, and still need a readable label when viewed.
const FIELD_LABELS: Record<string, string> = {
  age: 'Age',
  sex: 'Sex',
  height_cm: 'Height (cm)',
  weight_kg: 'Weight (kg)',
  bmi: 'BMI',
  family_history: 'Family history',
  hypertension: 'Hypertension',
  diabetes: 'Diabetes',
  total_cholesterol: 'Total cholesterol (mg/dL)',
  bp: 'Blood pressure (mmHg)',
  chest_pain_history: 'Chest pain history',
  rbs: 'Random blood sugar (mmol/L)',
  hdl: 'HDL (mg/dL)',
  ldl: 'LDL (mg/dL)',
  triglycerides: 'Triglycerides (mg/dL)',
  max_hr: 'Max heart rate',
  haemoglobin: 'Haemoglobin (g/dL)',
  creatinine: 'Creatinine (mg/dL)',
  platelets: 'Platelets',
  sodium: 'Sodium (mmol/L)',
  potassium: 'Potassium (mmol/L)',
  chloride: 'Chloride (mmol/L)',
  troponin_i: 'Troponin-I (ng/mL)',
  troponin_censored_high: 'Troponin value censored',
}

function labelFor(key: string): string {
  if (FIELD_LABELS[key]) return FIELD_LABELS[key]
  return key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

function formatValue(value: unknown) {
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  return String(value)
}

export function PredictionMetaFooter({
  input,
  createdAt,
}: {
  input: Record<string, unknown>
  createdAt: string
}) {
  const entries = Object.entries(input).filter(([key]) => key !== 'tier')

  return (
    <details className="rounded-lg border border-slate-200 p-4 text-sm dark:border-slate-800">
      <summary className="cursor-pointer font-medium text-slate-700 dark:text-slate-300">
        Submitted inputs ({new Date(createdAt).toLocaleString()})
      </summary>
      <dl className="mt-3 grid grid-cols-1 gap-x-6 gap-y-1 sm:grid-cols-2">
        {entries.map(([key, value]) => (
          <div key={key} className="flex justify-between border-b border-slate-100 py-1 dark:border-slate-800">
            <dt className="text-slate-500 dark:text-slate-400">{labelFor(key)}</dt>
            <dd>{formatValue(value)}</dd>
          </div>
        ))}
      </dl>
    </details>
  )
}

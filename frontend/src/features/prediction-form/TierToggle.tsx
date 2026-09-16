import { CheckIcon } from '../shared/icons'
import type { Tier } from '../../types/prediction'

const OPTIONS: {
  value: Tier
  title: string
  label: string
  description: string
  chips: string[]
  note?: string
}[] = [
  {
    value: 'basic',
    title: 'Basic Assessment',
    label: 'Essential health information',
    description: 'A streamlined assessment using key demographic, physical, and medical-history information.',
    chips: ['Age', 'Blood Pressure', 'Family History', 'Hypertension', 'Diabetes'],
  },
  {
    value: 'enhanced',
    title: 'Enhanced Assessment',
    label: 'Expanded health information',
    description: 'Adds selected laboratory measurements to provide the model with additional information.',
    chips: ['Cholesterol', 'LDL', 'Triglycerides', 'RBS'],
    note: 'Recommended if you have recent lab results',
  },
]

export function TierToggle({ tier, onChange }: { tier: Tier; onChange: (tier: Tier) => void }) {
  return (
    <div role="radiogroup" aria-label="Assessment tier" className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {OPTIONS.map((option) => {
        const selected = tier === option.value
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(option.value)}
            className={`relative rounded-2xl border p-5 text-left transition-all duration-150 ${
              selected
                ? 'border-transparent bg-gradient-to-br from-indigo-500/10 to-cyan-500/10 shadow-md shadow-indigo-500/15 ring-2 ring-indigo-500'
                : 'border-slate-800 bg-slate-900 hover:border-slate-700 hover:shadow-sm'
            }`}
          >
            {selected && (
              <span className="absolute right-4 top-4 flex size-5 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 text-white">
                <CheckIcon className="size-3" />
              </span>
            )}
            <span className="text-xs font-medium uppercase tracking-wide text-indigo-400">{option.label}</span>
            <h3 className="mt-1 text-base font-bold text-white">{option.title}</h3>
            <p className="mt-1.5 text-sm text-slate-400">{option.description}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {option.chips.map((chip) => (
                <span
                  key={chip}
                  className="rounded-full bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-300"
                >
                  {chip}
                </span>
              ))}
            </div>
            {option.note && (
              <p className="mt-3 text-xs font-medium text-cyan-400">{option.note}</p>
            )}
          </button>
        )
      })}
    </div>
  )
}

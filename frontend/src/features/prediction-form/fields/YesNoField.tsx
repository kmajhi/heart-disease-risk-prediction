import type { UseFormRegisterReturn } from 'react-hook-form'

interface YesNoFieldProps {
  label: string
  hint?: string
  error?: string
  registration: UseFormRegisterReturn
}

export function YesNoField({ label, hint, error, registration }: YesNoFieldProps) {
  return (
    <fieldset>
      <legend className="text-sm font-medium text-slate-300">{label}</legend>
      {hint && <p className="text-xs text-slate-500">{hint}</p>}
      <div className="mt-1.5 inline-flex rounded-xl border border-slate-700 bg-slate-950/50 p-1">
        {(['yes', 'no'] as const).map((option) => (
          <label key={option} className="relative">
            <input type="radio" value={option} className="peer sr-only" {...registration} />
            <span className="block cursor-pointer rounded-lg px-4 py-1.5 text-sm font-medium text-slate-400 transition-all duration-150 peer-checked:bg-gradient-to-r peer-checked:from-indigo-500 peer-checked:to-cyan-500 peer-checked:text-white peer-checked:shadow-sm peer-checked:shadow-indigo-500/30 peer-focus-visible:ring-2 peer-focus-visible:ring-indigo-400 hover:text-slate-100">
              {option === 'yes' ? 'Yes' : 'No'}
            </span>
          </label>
        ))}
      </div>
      {error && <p className="mt-1.5 text-xs text-red-400">{error}</p>}
    </fieldset>
  )
}

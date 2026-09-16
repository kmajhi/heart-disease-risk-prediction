import { forwardRef, type InputHTMLAttributes } from 'react'

interface NumericFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string
  unit?: string
  hint?: string
  error?: string
}

export const NumericField = forwardRef<HTMLInputElement, NumericFieldProps>(
  ({ label, unit, hint, error, id, ...props }, ref) => {
    const fieldId = id ?? props.name
    return (
      <div>
        <label htmlFor={fieldId} className="block text-sm font-medium text-slate-300">
          {label}
          {unit && <span className="text-slate-500"> ({unit})</span>}
        </label>
        {hint && <p className="text-xs text-slate-500">{hint}</p>}
        <input
          ref={ref}
          id={fieldId}
          type="number"
          step="any"
          inputMode="decimal"
          className={`mt-1.5 w-full rounded-xl border bg-slate-950/50 px-3 py-2.5 text-sm text-slate-100 outline-none transition-all duration-150 placeholder:text-slate-500 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/15 ${
            error ? 'border-red-500' : 'border-slate-700'
          }`}
          {...props}
        />
        {error && <p className="mt-1.5 text-xs text-red-400">{error}</p>}
      </div>
    )
  },
)
NumericField.displayName = 'NumericField'

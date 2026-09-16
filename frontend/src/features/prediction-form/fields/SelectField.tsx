import { forwardRef, type SelectHTMLAttributes } from 'react'

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  hint?: string
  error?: string
  options: { value: string; label: string }[]
}

export const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(
  ({ label, hint, error, options, id, ...props }, ref) => {
    const fieldId = id ?? props.name
    return (
      <div>
        <label htmlFor={fieldId} className="block text-sm font-medium text-slate-300">
          {label}
        </label>
        {hint && <p className="text-xs text-slate-500">{hint}</p>}
        <select
          ref={ref}
          id={fieldId}
          defaultValue=""
          className={`mt-1.5 w-full rounded-xl border bg-slate-950/50 px-3 py-2.5 text-sm text-slate-100 outline-none transition-all duration-150 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/15 ${
            error ? 'border-red-500' : 'border-slate-700'
          }`}
          {...props}
        >
          <option value="" disabled>
            Select…
          </option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && <p className="mt-1.5 text-xs text-red-400">{error}</p>}
      </div>
    )
  },
)
SelectField.displayName = 'SelectField'

import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react'

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  icon?: ReactNode
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  ({ label, error, icon, id, ...props }, ref) => {
    const fieldId = id ?? props.name
    return (
      <div>
        <label htmlFor={fieldId} className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          {label}
        </label>
        <div className="relative mt-1.5">
          {icon && (
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 dark:text-slate-500">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={fieldId}
            className={`w-full rounded-xl border bg-white/70 px-3 py-2.5 text-sm text-slate-900 outline-none transition-all duration-150 placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-500/15 dark:bg-slate-950/40 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-indigo-400 dark:focus:bg-slate-950/70 dark:focus:ring-indigo-400/15 ${
              icon ? 'pl-9' : ''
            } ${error ? 'border-red-400 dark:border-red-500' : 'border-slate-300/80 dark:border-slate-700/80'}`}
            {...props}
          />
        </div>
        {error && <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">{error}</p>}
      </div>
    )
  },
)
TextField.displayName = 'TextField'

import { forwardRef, type InputHTMLAttributes } from 'react'

interface CheckboxFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string
  hint?: string
}

export const CheckboxField = forwardRef<HTMLInputElement, CheckboxFieldProps>(
  ({ label, hint, id, ...props }, ref) => {
    const fieldId = id ?? props.name
    return (
      <div>
        <label htmlFor={fieldId} className="flex items-center gap-2 text-sm">
          <input ref={ref} id={fieldId} type="checkbox" {...props} />
          {label}
        </label>
        {hint && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{hint}</p>}
      </div>
    )
  },
)
CheckboxField.displayName = 'CheckboxField'

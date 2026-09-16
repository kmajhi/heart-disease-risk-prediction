import { useState } from 'react'
import { ChevronDownIcon, InfoIcon } from '../shared/icons'

export function InfoBanner() {
  const [open, setOpen] = useState(false)

  return (
    <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-4">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-indigo-500/15 text-indigo-300">
          <InfoIcon className="size-3.5" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-semibold text-slate-100">How your information is used</h2>
          <p className="mt-1 text-sm text-slate-400">
            Your responses are processed by our machine-learning prediction system to estimate heart
            disease risk. The result is accompanied by an explanation of the factors that contributed to
            the model&apos;s prediction.
          </p>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-indigo-300 hover:text-indigo-200"
          >
            About this assessment
            <ChevronDownIcon className={`size-3.5 transition-transform duration-150 ${open ? 'rotate-180' : ''}`} />
          </button>
          {open && (
            <p className="mt-2 text-xs text-slate-500">
              Choose the Basic tier for a streamlined assessment, or Enhanced if you have recent lab
              results — both use the same trained model family and give the model additional information
              to work with, not a different medical judgment. This is a research prototype, not a
              diagnostic tool.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

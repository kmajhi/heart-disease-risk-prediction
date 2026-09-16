import { Link } from 'react-router-dom'
import { CheckIcon } from '../shared/icons'

const BASIC_FIELDS = [
  'Age',
  'Sex',
  'Height & Weight',
  'Blood Pressure',
  'Family History',
  'Hypertension',
  'Diabetes',
  'Chest Pain History',
]

const ENHANCED_FIELDS = ['Total Cholesterol', 'LDL', 'Triglycerides', 'RBS']

export function AssessmentTiersSection() {
  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-bold tracking-tight text-white">
          Choose the Level of Assessment That Fits You
        </h2>
      </div>

      <div className="mx-auto mt-10 grid max-w-4xl grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Basic */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-7 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-indigo-500/40 hover:shadow-xl hover:shadow-indigo-500/10">
          <span className="inline-flex items-center rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-300">
            Essential Information
          </span>
          <h3 className="mt-4 text-xl font-bold text-white">Basic Assessment</h3>
          <p className="mt-2 text-sm text-slate-400">
            Uses key demographic, physical, blood-pressure, family-history, hypertension, diabetes, and
            chest-pain history information.
          </p>
          <ul className="mt-5 grid grid-cols-2 gap-x-4 gap-y-2">
            {BASIC_FIELDS.map((field) => (
              <li key={field} className="flex items-center gap-2 text-sm text-slate-300">
                <CheckIcon className="size-3.5 shrink-0 text-indigo-400" />
                {field}
              </li>
            ))}
          </ul>
          <Link
            to="/predict"
            className="mt-6 inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-5 py-2.5 text-sm font-semibold text-indigo-300 shadow-sm transition-all duration-150 hover:border-indigo-400/60 hover:bg-indigo-500/20 hover:text-white hover:shadow-md hover:shadow-indigo-500/20 active:scale-[0.98]"
          >
            Start Basic Assessment
          </Link>
        </div>

        {/* Enhanced */}
        <div className="relative rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-slate-900 to-cyan-950/40 p-7 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-cyan-400/50 hover:shadow-xl hover:shadow-cyan-500/15">
          <span className="inline-flex items-center rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-300">
            Expanded Clinical Information
          </span>
          <h3 className="mt-4 text-xl font-bold text-white">Enhanced Assessment</h3>
          <p className="mt-2 text-sm text-slate-400">
            Builds on the Basic assessment by incorporating additional laboratory measurements used by the
            finalized Enhanced ML model — it provides the model with additional information.
          </p>
          <p className="mt-4 text-xs font-medium uppercase tracking-wide text-slate-500">Also includes all Basic fields, plus:</p>
          <ul className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2">
            {ENHANCED_FIELDS.map((field) => (
              <li key={field} className="flex items-center gap-2 text-sm text-slate-300">
                <CheckIcon className="size-3.5 shrink-0 text-cyan-400" />
                {field}
              </li>
            ))}
          </ul>
          <Link
            to="/predict"
            className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-cyan-500/20 transition-all duration-150 hover:shadow-lg hover:shadow-cyan-500/40 active:scale-[0.98]"
          >
            Start Enhanced Assessment
          </Link>
        </div>
      </div>
    </section>
  )
}

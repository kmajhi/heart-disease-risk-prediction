import { accentFor } from '../shared/accentColors'

const STEPS = [
  {
    n: '01',
    title: 'Enter Your Information',
    description: 'Provide relevant demographic, physical, and medical-history information.',
  },
  {
    n: '02',
    title: 'Choose Your Assessment',
    description: 'Use the Basic assessment for essential information or Enhanced assessment for additional laboratory measurements.',
  },
  {
    n: '03',
    title: 'AI Analysis',
    description: "The trained XGBoost model processes the submitted information and estimates heart disease risk.",
  },
  {
    n: '04',
    title: 'Understand Your Result',
    description: "View the estimated risk and the major factors contributing to the model's prediction.",
  },
]

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="scroll-mt-20 bg-slate-900/40 px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-bold tracking-tight text-white">How It Works</h2>
        <p className="mt-3 text-slate-400">
          From health information to an understandable AI prediction in four simple steps.
        </p>
      </div>

      <div className="relative mx-auto mt-12 grid max-w-6xl grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {/* Connecting line, desktop only */}
        <div aria-hidden="true" className="absolute left-0 right-0 top-6 hidden h-px bg-gradient-to-r from-indigo-500/40 via-cyan-500/40 to-emerald-500/40 lg:block" />

        {STEPS.map((step, i) => (
          <div key={step.n} className="relative text-center">
            <span
              className={`relative z-10 mx-auto flex size-12 items-center justify-center rounded-full bg-gradient-to-br text-sm font-bold text-white shadow-md ${accentFor(i)}`}
            >
              {step.n}
            </span>
            <h3 className="mt-4 text-sm font-semibold text-white">{step.title}</h3>
            <p className="mt-1.5 text-sm text-slate-400">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

interface MockFactor {
  label: string
  widthPct: number
}

const INCREASING: MockFactor[] = [
  { label: 'Age', widthPct: 100 },
  { label: 'LDL', widthPct: 73 },
  { label: 'Total Cholesterol', widthPct: 60 },
  { label: 'Triglycerides', widthPct: 40 },
]

const DECREASING: MockFactor[] = [
  { label: 'Family History', widthPct: 70 },
  { label: 'Blood Pressure', widthPct: 50 },
  { label: 'Diabetes', widthPct: 30 },
]

function FactorRow({ factor, colorClass, delay }: { factor: MockFactor; colorClass: string; delay: number }) {
  return (
    <li>
      <div className="flex items-baseline justify-between text-sm">
        <span className="font-medium text-slate-200">{factor.label}</span>
      </div>
      <div className="mt-1 h-2.5 w-full overflow-hidden rounded-full bg-slate-800">
        <div
          className={`animate-grow-bar h-full rounded-full ${colorClass}`}
          style={{ width: `${factor.widthPct}%`, animationDelay: `${delay}ms` }}
        />
      </div>
    </li>
  )
}

export function ExplainableAISection() {
  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-bold tracking-tight text-white">Don&apos;t Just Get a Prediction. Understand It.</h2>
        <p className="mt-4 text-slate-400">
          Our system uses Explainable AI to show which factors contributed most to an individual
          model-estimated risk. This makes the prediction easier to interpret instead of presenting it as
          a black-box result.
        </p>
      </div>

      <div className="mx-auto mt-10 max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-sm sm:p-8">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">Why did the model make this prediction?</h3>
          <span className="rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-400">
            Example explanation
          </span>
        </div>

        <div className="mt-6">
          <p className="text-xs font-medium uppercase tracking-wide text-red-400">
            Contributed to a higher model-estimated risk
          </p>
          <ul className="mt-3 space-y-4">
            {INCREASING.map((factor, i) => (
              <FactorRow key={factor.label} factor={factor} colorClass="bg-red-500" delay={i * 120} />
            ))}
          </ul>
        </div>

        <div className="mt-6">
          <p className="text-xs font-medium uppercase tracking-wide text-emerald-400">
            Contributed to a lower model-estimated risk
          </p>
          <ul className="mt-3 space-y-4">
            {DECREASING.map((factor, i) => (
              <FactorRow key={factor.label} factor={factor} colorClass="bg-emerald-500" delay={480 + i * 120} />
            ))}
          </ul>
        </div>

        <p className="mt-6 text-xs text-slate-500">
          Illustrative example only — not a real prediction. Your own result will show the factors from
          your submitted information.
        </p>
      </div>
    </section>
  )
}

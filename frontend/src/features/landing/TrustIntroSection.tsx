import { accentFor } from '../shared/accentColors'
import { BarChartIcon, BrainCircuitIcon, FlaskIcon, LayersIcon } from '../shared/icons'

const FEATURES = [
  {
    icon: BrainCircuitIcon,
    title: 'AI-Powered Analysis',
    description: 'Machine-learning models analyze relevant health information to estimate heart disease risk.',
  },
  {
    icon: BarChartIcon,
    title: 'Explainable Results',
    description:
      'SHAP-based explanations help users understand which input factors contributed most to the prediction.',
  },
  {
    icon: LayersIcon,
    title: 'Two Assessment Levels',
    description: 'Choose between a Basic assessment and an Enhanced assessment with additional laboratory information.',
  },
  {
    icon: FlaskIcon,
    title: 'Research-Focused',
    description:
      'Developed as an academic CSE research/project prototype with an emphasis on responsible and interpretable machine learning.',
  },
]

export function TrustIntroSection() {
  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-3xl font-bold tracking-tight text-white">Intelligent Prediction. Clear Explanations.</h2>
        <p className="mt-4 text-slate-400">
          Our system combines machine learning with explainable AI to estimate heart disease risk from
          relevant health information. Instead of providing only a prediction, the system highlights the
          factors that contributed to the model-estimated result.
        </p>
      </div>

      <div className="mx-auto mt-10 grid max-w-6xl grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map(({ icon: Icon, title, description }, i) => (
          <div
            key={title}
            className="group rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-slate-700 hover:shadow-xl hover:shadow-indigo-500/10"
          >
            <span
              className={`flex size-10 items-center justify-center rounded-xl bg-gradient-to-br text-white transition-transform duration-200 group-hover:scale-110 ${accentFor(i)}`}
            >
              <Icon className="size-5" />
            </span>
            <h3 className="mt-4 text-sm font-semibold text-white">{title}</h3>
            <p className="mt-1.5 text-sm text-slate-400">{description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

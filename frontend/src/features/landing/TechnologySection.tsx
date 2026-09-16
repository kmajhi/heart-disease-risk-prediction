import { accentFor } from '../shared/accentColors'
import { BarChartIcon, GaugeIcon, OrbitIcon, ServerIcon } from '../shared/icons'

const TECHNOLOGIES = [
  { icon: GaugeIcon, name: 'XGBoost', description: 'Primary prediction model used in the finalized Basic and Enhanced systems.' },
  { icon: BarChartIcon, name: 'SHAP', description: 'Used to generate individual feature-contribution explanations.' },
  { icon: OrbitIcon, name: 'React', description: 'Interactive frontend application.' },
  { icon: ServerIcon, name: 'Django REST Framework', description: 'Backend API and prediction service.' },
]

export function TechnologySection() {
  return (
    <section className="bg-slate-900/40 px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-bold tracking-tight text-white">Powered by Machine Learning &amp; Explainable AI</h2>
      </div>

      <div className="mx-auto mt-10 grid max-w-5xl grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {TECHNOLOGIES.map(({ icon: Icon, name, description }, i) => (
          <div
            key={name}
            className="group rounded-2xl border border-slate-800 bg-slate-900 p-5 text-center shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-slate-700 hover:shadow-xl hover:shadow-indigo-500/10"
          >
            <span
              className={`mx-auto flex size-10 items-center justify-center rounded-xl bg-gradient-to-br text-white transition-transform duration-200 group-hover:scale-110 ${accentFor(i)}`}
            >
              <Icon className="size-5" />
            </span>
            <h3 className="mt-3 text-sm font-semibold text-white">{name}</h3>
            <p className="mt-1 text-xs text-slate-400">{description}</p>
          </div>
        ))}
      </div>

      <p className="mx-auto mt-8 max-w-2xl text-center text-sm font-medium text-slate-500">
        Machine Learning · Explainable AI · REST API · Responsive Web Application
      </p>
    </section>
  )
}

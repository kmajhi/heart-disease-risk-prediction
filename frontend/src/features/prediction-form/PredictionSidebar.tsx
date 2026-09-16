import { accentFor } from '../shared/accentColors'
import { BarChartIcon, GaugeIcon, LayersIcon } from '../shared/icons'

const ITEMS = [
  {
    icon: GaugeIcon,
    title: 'Risk estimate',
    description: 'A model-estimated probability.',
  },
  {
    icon: LayersIcon,
    title: 'Risk category',
    description: 'A classification based on the configured prediction threshold.',
  },
  {
    icon: BarChartIcon,
    title: 'AI explanation',
    description: 'The main factors contributing toward or away from the model-estimated risk.',
  },
]

export function PredictionSidebar() {
  return (
    <aside className="hidden lg:block">
      <div className="sticky top-20 space-y-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-100">What you&apos;ll receive</h2>
          <ul className="mt-4 space-y-4">
            {ITEMS.map(({ icon: Icon, title, description }, i) => (
              <li key={title} className="flex gap-3">
                <span className={`flex size-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-white ${accentFor(i)}`}>
                  <Icon className="size-4" />
                </span>
                <div>
                  <p className="text-sm font-medium text-slate-100">{title}</p>
                  <p className="text-xs text-slate-500">{description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 text-xs text-amber-200">
          <strong className="font-semibold">Research Prototype:</strong> This system is developed for
          academic/research purposes and is not a medical diagnostic tool. The result is a
          machine-learning estimate and should not replace professional medical advice.
        </p>
      </div>
    </aside>
  )
}

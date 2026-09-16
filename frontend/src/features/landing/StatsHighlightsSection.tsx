const HIGHLIGHTS = [
  { value: '2', label: 'Prediction Tiers', gradient: 'from-indigo-400 to-violet-400' },
  { value: '6', label: 'ML Algorithms Evaluated', gradient: 'from-cyan-400 to-sky-400' },
  { value: 'SHAP', label: 'Explainable AI', gradient: 'from-emerald-400 to-teal-400' },
  { value: 'XGBoost', label: 'Primary Model', gradient: 'from-amber-400 to-orange-400' },
]

export function StatsHighlightsSection() {
  return (
    <section className="px-4 py-14 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-4xl grid-cols-2 gap-6 rounded-3xl border border-slate-800 bg-slate-900 px-6 py-8 shadow-sm sm:grid-cols-4">
        {HIGHLIGHTS.map((item) => (
          <div key={item.label} className="text-center">
            <p className={`bg-gradient-to-r bg-clip-text text-2xl font-bold text-transparent ${item.gradient}`}>
              {item.value}
            </p>
            <p className="mt-1 text-xs font-medium text-slate-400">{item.label}</p>
          </div>
        ))}
      </div>
      <p className="mx-auto mt-3 max-w-4xl text-center text-xs text-slate-500">
        Research evaluation highlights — not clinical performance metrics.
      </p>
    </section>
  )
}

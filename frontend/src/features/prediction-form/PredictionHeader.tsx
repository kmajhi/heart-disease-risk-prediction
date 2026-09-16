import { SparklesIcon } from '../shared/icons'

export function PredictionHeader() {
  return (
    <div className="animate-fade-in-up text-center">
      <div className="flex flex-wrap items-center justify-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-300">
          <SparklesIcon className="size-3.5" />
          AI-Powered Risk Assessment
        </span>
        <span className="inline-flex items-center rounded-full border border-slate-800 bg-slate-900 px-3 py-1 text-xs font-medium text-slate-400">
          Research Prototype • Explainable AI
        </span>
      </div>
      <h1 className="mt-4 text-3xl font-bold tracking-tight text-white">Assess Your Heart Health with AI</h1>
      <p className="mx-auto mt-2 max-w-xl text-sm text-slate-400">
        Enter relevant health information to receive a model-estimated heart disease risk and an
        explanation of the factors that influenced the prediction.
      </p>
    </div>
  )
}

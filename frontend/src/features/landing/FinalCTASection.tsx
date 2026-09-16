import { Link } from 'react-router-dom'

export function FinalCTASection() {
  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-600 to-cyan-500 px-8 py-14 text-center text-white shadow-xl shadow-indigo-500/25">
        <div aria-hidden="true" className="absolute -top-16 -right-16 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
        <h2 className="text-3xl font-bold tracking-tight">Take the First Step Toward Understanding Your Heart Risk</h2>
        <p className="mx-auto mt-3 max-w-lg text-white/90">
          Explore your model-estimated heart disease risk and see which factors contributed to the
          prediction.
        </p>
        <Link
          to="/predict"
          className="mt-7 inline-block rounded-full bg-white px-7 py-3 text-sm font-semibold text-indigo-700 shadow-md transition-transform duration-150 hover:scale-105 active:scale-100"
        >
          Start a Prediction
        </Link>

        <p className="mx-auto mt-8 max-w-xl rounded-xl bg-white/10 px-4 py-3 text-xs text-white/90">
          <strong className="font-semibold">Research Prototype:</strong> This system is developed for
          academic/research purposes and is not a medical diagnostic tool. Its predictions should not
          replace professional medical advice.
        </p>
      </div>
    </section>
  )
}

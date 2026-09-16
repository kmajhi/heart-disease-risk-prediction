import { Link } from 'react-router-dom'
import { AuroraBackdrop } from '../shared/AuroraBackdrop'
import { ArrowRightIcon, SparklesIcon } from '../shared/icons'

function HeroVisual() {
  return (
    <div className="relative mx-auto w-full max-w-md py-6 sm:py-10">
      {/* Ambient glow behind the heart, unclipped so floating elements can escape it */}
      <div aria-hidden="true" className="absolute inset-0 -z-10 flex items-center justify-center">
        <div className="h-72 w-72 rounded-full bg-gradient-to-br from-indigo-500/30 via-violet-500/20 to-cyan-500/25 blur-3xl" />
      </div>

      {/* Decorative molecule / network cluster, bottom-left */}
      <svg
        aria-hidden="true"
        viewBox="0 0 100 60"
        className="absolute -bottom-4 -left-4 h-16 w-24 text-indigo-400/50 sm:-left-8 sm:h-20 sm:w-28"
      >
        <g fill="currentColor">
          <circle cx="10" cy="10" r="2.4" />
          <circle cx="40" cy="5" r="2.4" />
          <circle cx="70" cy="15" r="2.4" />
          <circle cx="25" cy="35" r="2.4" />
          <circle cx="60" cy="40" r="2.4" />
          <circle cx="90" cy="30" r="2.4" />
        </g>
        <g stroke="currentColor" strokeWidth="0.8" opacity="0.6">
          <path d="M10 10 40 5M40 5 70 15M10 10 25 35M25 35 60 40M40 5 60 40M60 40 90 30M70 15 90 30" />
        </g>
      </svg>

      {/* Large heart + ECG, floating directly on the section background rather than boxed */}
      <div className="animate-pulse-soft flex flex-col items-center">
        <svg viewBox="0 0 100 90" className="h-48 w-48 drop-shadow-[0_0_35px_rgba(99,102,241,0.35)] sm:h-56 sm:w-56" role="img" aria-label="Stylized heart graphic">
          <defs>
            <linearGradient id="heroHeartGradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#818cf8" />
              <stop offset="55%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#22d3ee" />
            </linearGradient>
          </defs>
          <path
            fill="url(#heroHeartGradient)"
            d="M50 82C22 63 6 46 6 28.5 6 14.8 17 4 30 4c8 0 15 4 20 10 5-6 12-10 20-10 13 0 24 10.8 24 24.5C94 46 78 63 50 82Z"
          />
        </svg>

        <svg viewBox="0 0 240 40" className="-mt-3 h-10 w-56 text-cyan-300 sm:w-64" aria-hidden="true">
          <path
            className="animate-ecg-draw"
            d="M0 20 H70 L82 20 L90 4 L100 36 L110 20 H150 L160 8 L168 32 L176 20 H240"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <p className="mt-1 text-center text-xs font-medium text-slate-500">
        Illustrative visualization — not a live reading
      </p>

      {/* Floating feature card, mid-right of the heart — kept clear of the
          disclaimer line below so it never overlaps that text. */}
      <div
        className="animate-float-y absolute -right-2 top-10 w-52 rounded-2xl border border-slate-700 bg-slate-900/90 p-4 shadow-xl shadow-indigo-500/10 backdrop-blur sm:-right-10 sm:top-6 sm:w-56"
        style={{ animationDelay: '0.6s' }}
      >
        <div className="flex items-center gap-2">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-fuchsia-400 to-purple-500 text-white">
            <SparklesIcon className="size-4" />
          </span>
          <p className="text-sm font-semibold text-white">Explainable AI</p>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-slate-400">
          SHAP-based factors explain what drove every individual prediction.
        </p>
      </div>
    </div>
  )
}

export function HeroSection() {
  return (
    <section className="relative overflow-hidden px-4 pb-24 pt-14 sm:px-6 lg:px-8 lg:pt-20 xl:mx-auto xl:max-w-7xl">
      <AuroraBackdrop />

      <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div className="animate-fade-in-up text-center lg:text-left">
          <span className="inline-flex items-center rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-300">
            Academic Research Prototype
          </span>
          <h1 className="mt-6 text-4xl font-bold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl">
            Understand Your Heart Health with{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">
              AI
            </span>
          </h1>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
            <Link
              to="/predict"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-500/25 transition-all duration-150 hover:shadow-lg hover:shadow-indigo-500/40 active:scale-[0.97]"
            >
              Check Your Heart Risk
              <ArrowRightIcon className="size-4" />
            </Link>
            <a
              href="#how-it-works"
              className="rounded-full border border-slate-700 bg-slate-900 px-6 py-3 text-sm font-semibold text-slate-200 transition-all duration-150 hover:border-indigo-500/50 hover:text-indigo-300"
            >
              How It Works
            </a>
          </div>
        </div>

        <div>
          <HeroVisual />
          <p className="mx-auto max-w-sm text-center text-sm leading-relaxed text-slate-400 lg:mx-0 lg:text-left">
            Comprehensive machine-learning risk assessment — personalized probability estimates,
            explainable factors, and plain-language guidance for preventive heart health.
          </p>
        </div>
      </div>
    </section>
  )
}

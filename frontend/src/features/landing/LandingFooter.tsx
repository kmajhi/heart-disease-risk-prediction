import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { HeartPulseIcon } from '../shared/icons'

export function LandingFooter() {
  const { user } = useAuth()

  return (
    <footer className="border-t border-slate-800 bg-slate-950 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 text-center sm:flex-row sm:items-start sm:justify-between sm:text-left">
        <div className="max-w-xs">
          <div className="flex items-center justify-center gap-2 sm:justify-start">
            <span className="flex size-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-500 text-white">
              <HeartPulseIcon className="size-4" />
            </span>
            <span className="text-sm font-bold text-white">Heart Risk AI</span>
          </div>
          <p className="mt-2 text-xs text-slate-500">AI-driven Heart Disease Prediction System</p>
        </div>

        <nav aria-label="Footer" className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-slate-400">
          <Link to="/" className="transition-colors duration-150 hover:text-indigo-400">
            Home
          </Link>
          <Link to="/predict" className="transition-colors duration-150 hover:text-indigo-400">
            Prediction
          </Link>
          <Link to="/about" className="transition-colors duration-150 hover:text-indigo-400">
            About
          </Link>
          <Link to="/disclaimer" className="transition-colors duration-150 hover:text-indigo-400">
            Disclaimer
          </Link>
          {!user && (
            <>
              <Link to="/login" className="transition-colors duration-150 hover:text-indigo-400">
                Login
              </Link>
              <Link to="/register" className="transition-colors duration-150 hover:text-indigo-400">
                Register
              </Link>
            </>
          )}
        </nav>
      </div>

      <p className="mx-auto mt-8 max-w-5xl text-center text-xs text-slate-500">
        © {new Date().getFullYear()} Heart Risk AI — an academic research prototype.
      </p>
    </footer>
  )
}

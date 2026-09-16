import { Link } from 'react-router-dom'
import { useAuth } from '../features/auth/AuthContext'
import { ArrowRightIcon } from '../features/shared/icons'

export function NotFoundPage() {
  const { user } = useAuth()

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <p className="bg-gradient-to-r from-indigo-400 via-violet-400 to-cyan-400 bg-clip-text text-7xl font-bold text-transparent">
        404
      </p>
      <h1 className="mt-4 text-2xl font-bold tracking-tight text-white">Page not found</h1>
      <p className="mx-auto mt-2 max-w-sm text-sm text-slate-400">
        The page you&apos;re looking for doesn&apos;t exist or may have moved.
      </p>
      <Link
        to={user ? '/dashboard' : '/'}
        className="mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-500/25 transition-all duration-150 hover:shadow-lg hover:shadow-indigo-500/40 active:scale-[0.97]"
      >
        {user ? 'Back to Dashboard' : 'Back to Home'}
        <ArrowRightIcon className="size-4" />
      </Link>
    </div>
  )
}

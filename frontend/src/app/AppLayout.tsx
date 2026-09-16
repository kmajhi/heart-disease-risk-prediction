import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../features/auth/AuthContext'
import { useLogoutMutation } from '../hooks/useAuthMutations'
import { DisclaimerBanner } from '../features/shared/DisclaimerBanner'
import { HeartPulseIcon, LogOutIcon } from '../features/shared/icons'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-full px-3.5 py-1.5 text-sm font-medium transition-all duration-150 ${
    isActive
      ? 'bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-sm shadow-indigo-500/30'
      : 'text-slate-600 hover:bg-slate-900/5 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white'
  }`

function initialsFor(email: string, firstName: string, lastName: string) {
  const combined = `${firstName?.[0] ?? ''}${lastName?.[0] ?? ''}`.trim()
  return (combined || email[0] || '?').toUpperCase()
}

export function AppLayout() {
  const { user } = useAuth()
  const logoutMutation = useLogoutMutation()
  const navigate = useNavigate()

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => navigate('/'),
    })
  }

  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/75 backdrop-blur-lg dark:border-slate-800/70 dark:bg-slate-950/75">
        <nav className="mx-auto flex max-w-7xl flex-wrap items-center gap-1.5 px-4 py-3">
          <NavLink to="/" className="mr-4 flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 text-white shadow-sm shadow-indigo-500/40">
              <HeartPulseIcon className="size-[18px]" />
            </span>
            <span className="bg-gradient-to-r from-indigo-500 to-cyan-500 bg-clip-text text-base font-bold tracking-tight text-transparent">
              Heart Risk AI
            </span>
          </NavLink>
          {user && (
            <NavLink to="/dashboard" className={navLinkClass}>
              Dashboard
            </NavLink>
          )}
          <NavLink to="/models/compare" className={navLinkClass}>
            Model Comparison
          </NavLink>
          <NavLink to="/about" className={navLinkClass}>
            About
          </NavLink>
          <NavLink to="/predict" className={navLinkClass}>
            Predict
          </NavLink>
          <NavLink to="/history" className={navLinkClass}>
            History
          </NavLink>
          {user?.role === 'admin' && (
            <NavLink to="/admin" className={navLinkClass}>
              Admin
            </NavLink>
          )}
          <div className="ml-auto flex items-center gap-2">
            {user ? (
              <>
                <NavLink
                  to="/profile"
                  className={({ isActive }) =>
                    `flex items-center gap-2 rounded-full py-1 pl-1 pr-3.5 text-sm font-medium transition-all duration-150 ${
                      isActive
                        ? 'bg-slate-900/5 text-slate-900 dark:bg-white/10 dark:text-white'
                        : 'text-slate-600 hover:bg-slate-900/5 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white'
                    }`
                  }
                >
                  {user.avatar ? (
                    <img src={user.avatar} alt="" className="size-6 rounded-full object-cover" />
                  ) : (
                    <span className="flex size-6 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 text-[11px] font-semibold text-white">
                      {initialsFor(user.email, user.first_name, user.last_name)}
                    </span>
                  )}
                  <span className="hidden sm:inline">{user.email}</span>
                </NavLink>
                <button
                  onClick={handleLogout}
                  disabled={logoutMutation.isPending}
                  className="flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium text-slate-600 transition-all duration-150 hover:bg-slate-900/5 hover:text-slate-900 disabled:opacity-50 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
                >
                  <LogOutIcon className="size-4" />
                  Log out
                </button>
              </>
            ) : (
              <>
                <NavLink
                  to="/login"
                  className="rounded-full px-3.5 py-1.5 text-sm font-medium text-slate-600 transition-all duration-150 hover:bg-slate-900/5 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
                >
                  Log in
                </NavLink>
                <NavLink
                  to="/register"
                  className="rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500 px-4 py-1.5 text-sm font-semibold text-white shadow-sm shadow-indigo-500/30 transition-all duration-150 hover:shadow-md hover:shadow-indigo-500/40 active:scale-[0.97]"
                >
                  Register
                </NavLink>
              </>
            )}
          </div>
        </nav>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8">
        <Outlet />
      </main>

      <DisclaimerBanner />
    </div>
  )
}

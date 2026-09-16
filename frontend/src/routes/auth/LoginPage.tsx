import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { ApiError } from '../../api/client'
import { GoogleSignInButton } from '../../features/auth/GoogleSignInButton'
import { AuroraBackdrop } from '../../features/shared/AuroraBackdrop'
import { ErrorBanner } from '../../features/shared/ErrorBanner'
import { LockIcon, MailIcon } from '../../features/shared/icons'
import { TextField } from '../../features/shared/TextField'
import { useGoogleLoginMutation, useLoginMutation } from '../../hooks/useAuthMutations'

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
})

type LoginForm = z.infer<typeof loginSchema>

export function LoginPage() {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) })
  const loginMutation = useLoginMutation()
  const googleLoginMutation = useGoogleLoginMutation()
  const [googleError, setGoogleError] = useState<string | null>(null)
  const navigate = useNavigate()
  const location = useLocation()
  const locationState = location.state as { from?: Location; passwordReset?: boolean } | null
  const from = locationState?.from?.pathname ?? '/'
  const passwordJustReset = locationState?.passwordReset ?? false

  const onSubmit = handleSubmit(async (values) => {
    try {
      await loginMutation.mutateAsync(values)
      navigate(from, { replace: true })
    } catch (error) {
      if (error instanceof ApiError) {
        setError('root', { message: error.detail })
      } else {
        setError('root', { message: 'Something went wrong. Please try again.' })
      }
    }
  })

  const handleGoogleCredential = async (credential: string) => {
    setGoogleError(null)
    try {
      await googleLoginMutation.mutateAsync(credential)
      navigate(from, { replace: true })
    } catch (error) {
      setGoogleError(
        error instanceof ApiError ? error.detail : 'Google sign-in failed. Please try again.',
      )
    }
  }

  return (
    <div className="relative isolate flex min-h-[70vh] items-center justify-center py-8">
      <AuroraBackdrop />
      <div className="animate-fade-in-up relative w-full max-w-sm rounded-2xl border border-slate-200/70 bg-white/80 p-8 shadow-xl shadow-indigo-500/5 backdrop-blur-xl dark:border-slate-800/70 dark:bg-slate-900/60">
        <div className="flex flex-col items-center text-center">
          <span className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-500 text-white shadow-md shadow-indigo-500/30">
            <LockIcon className="size-5" />
          </span>
          <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Log in to continue your risk assessments.
          </p>
        </div>

        <form onSubmit={onSubmit} className="mt-7 space-y-4" noValidate>
          {passwordJustReset && !errors.root && (
            <div className="rounded border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200">
              Your password has been reset. Log in with your new password.
            </div>
          )}
          {errors.root && <ErrorBanner message={errors.root.message ?? 'Login failed.'} />}
          <TextField
            label="Email"
            type="email"
            autoComplete="email"
            icon={<MailIcon className="size-4" />}
            error={errors.email?.message}
            {...register('email')}
          />
          <div>
            <TextField
              label="Password"
              type="password"
              autoComplete="current-password"
              icon={<LockIcon className="size-4" />}
              error={errors.password?.message}
              {...register('password')}
            />
            <Link
              to="/forgot-password"
              className="mt-1.5 inline-block text-xs font-medium text-indigo-600 transition-colors hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              Forgot password?
            </Link>
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/30 transition-all duration-150 hover:shadow-lg hover:shadow-indigo-500/40 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100"
          >
            {isSubmitting ? 'Logging in…' : 'Log in'}
          </button>
        </form>

        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
          <span className="text-xs font-medium text-slate-400 dark:text-slate-500">or continue with</span>
          <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
        </div>

        {googleError && (
          <div className="mb-3">
            <ErrorBanner message={googleError} />
          </div>
        )}
        <GoogleSignInButton onCredential={handleGoogleCredential} />

        <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
          Don&apos;t have an account?{' '}
          <Link
            to="/register"
            className="font-medium text-indigo-600 transition-colors hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  )
}

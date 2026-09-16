import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { z } from 'zod'
import { ApiError } from '../../api/client'
import { AuroraBackdrop } from '../../features/shared/AuroraBackdrop'
import { ErrorBanner } from '../../features/shared/ErrorBanner'
import { CheckIcon, MailIcon } from '../../features/shared/icons'
import { TextField } from '../../features/shared/TextField'
import { useRequestPasswordResetMutation } from '../../hooks/useAuthMutations'

const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
})

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>

export function ForgotPasswordPage() {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordForm>({ resolver: zodResolver(forgotPasswordSchema) })
  const requestResetMutation = useRequestPasswordResetMutation()
  const [sent, setSent] = useState(false)

  const onSubmit = handleSubmit(async (values) => {
    try {
      await requestResetMutation.mutateAsync(values.email)
      setSent(true)
    } catch (error) {
      setError('root', {
        message: error instanceof ApiError ? error.detail : 'Something went wrong. Please try again.',
      })
    }
  })

  return (
    <div className="relative isolate flex min-h-[70vh] items-center justify-center py-8">
      <AuroraBackdrop />
      <div className="animate-fade-in-up relative w-full max-w-sm rounded-2xl border border-slate-200/70 bg-white/80 p-8 shadow-xl shadow-indigo-500/5 backdrop-blur-xl dark:border-slate-800/70 dark:bg-slate-900/60">
        {sent ? (
          <div className="flex flex-col items-center text-center">
            <span className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/30">
              <CheckIcon className="size-5" />
            </span>
            <h1 className="text-xl font-bold tracking-tight">Check your email</h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              If an account exists for that email, we&apos;ve sent a link to reset your password.
            </p>
            <Link
              to="/login"
              className="mt-6 font-medium text-indigo-600 transition-colors hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              Back to log in
            </Link>
          </div>
        ) : (
          <>
            <div className="flex flex-col items-center text-center">
              <span className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-500 text-white shadow-md shadow-indigo-500/30">
                <MailIcon className="size-5" />
              </span>
              <h1 className="text-2xl font-bold tracking-tight">Forgot your password?</h1>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Enter your email and we&apos;ll send you a link to reset it.
              </p>
            </div>

            <form onSubmit={onSubmit} className="mt-7 space-y-4" noValidate>
              {errors.root && <ErrorBanner message={errors.root.message ?? 'Something went wrong.'} />}
              <TextField
                label="Email"
                type="email"
                autoComplete="email"
                icon={<MailIcon className="size-4" />}
                error={errors.email?.message}
                {...register('email')}
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/30 transition-all duration-150 hover:shadow-lg hover:shadow-indigo-500/40 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100"
              >
                {isSubmitting ? 'Sending…' : 'Send reset link'}
              </button>
            </form>
            <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
              <Link
                to="/login"
                className="font-medium text-indigo-600 transition-colors hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
              >
                Back to log in
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  )
}

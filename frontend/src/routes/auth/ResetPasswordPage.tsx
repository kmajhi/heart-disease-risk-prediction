import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { z } from 'zod'
import { ApiError } from '../../api/client'
import { AuroraBackdrop } from '../../features/shared/AuroraBackdrop'
import { ErrorBanner } from '../../features/shared/ErrorBanner'
import { LockIcon } from '../../features/shared/icons'
import { TextField } from '../../features/shared/TextField'
import { useConfirmPasswordResetMutation } from '../../hooks/useAuthMutations'

const resetPasswordSchema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>

export function ResetPasswordPage() {
  const { uid, token } = useParams<{ uid: string; token: string }>()
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordForm>({ resolver: zodResolver(resetPasswordSchema) })
  const confirmResetMutation = useConfirmPasswordResetMutation()

  const onSubmit = handleSubmit(async (values) => {
    if (!uid || !token) return
    try {
      await confirmResetMutation.mutateAsync({ uid, token, new_password: values.password })
      navigate('/login', { state: { passwordReset: true }, replace: true })
    } catch (error) {
      setError('root', {
        message: error instanceof ApiError ? error.detail : 'Something went wrong. Please try again.',
      })
    }
  })

  if (!uid || !token) {
    return (
      <div className="relative isolate flex min-h-[70vh] items-center justify-center py-8">
        <AuroraBackdrop />
        <div className="relative w-full max-w-sm rounded-2xl border border-slate-200/70 bg-white/80 p-8 text-center shadow-xl shadow-indigo-500/5 backdrop-blur-xl dark:border-slate-800/70 dark:bg-slate-900/60">
          <p className="text-sm text-slate-500 dark:text-slate-400">This password reset link is invalid.</p>
          <Link
            to="/forgot-password"
            className="mt-4 inline-block font-medium text-indigo-600 transition-colors hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
          >
            Request a new link
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="relative isolate flex min-h-[70vh] items-center justify-center py-8">
      <AuroraBackdrop />
      <div className="animate-fade-in-up relative w-full max-w-sm rounded-2xl border border-slate-200/70 bg-white/80 p-8 shadow-xl shadow-indigo-500/5 backdrop-blur-xl dark:border-slate-800/70 dark:bg-slate-900/60">
        <div className="flex flex-col items-center text-center">
          <span className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-500 text-white shadow-md shadow-indigo-500/30">
            <LockIcon className="size-5" />
          </span>
          <h1 className="text-2xl font-bold tracking-tight">Set a new password</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Choose a new password for your account.</p>
        </div>

        <form onSubmit={onSubmit} className="mt-7 space-y-4" noValidate>
          {errors.root && (
            <ErrorBanner message={errors.root.message ?? 'This link may be invalid or expired.'} />
          )}
          <TextField
            label="New password"
            type="password"
            autoComplete="new-password"
            icon={<LockIcon className="size-4" />}
            error={errors.password?.message}
            {...register('password')}
          />
          <TextField
            label="Confirm new password"
            type="password"
            autoComplete="new-password"
            icon={<LockIcon className="size-4" />}
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/30 transition-all duration-150 hover:shadow-lg hover:shadow-indigo-500/40 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100"
          >
            {isSubmitting ? 'Saving…' : 'Save new password'}
          </button>
        </form>
      </div>
    </div>
  )
}

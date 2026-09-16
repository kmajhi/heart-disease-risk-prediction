import { zodResolver } from '@hookform/resolvers/zod'
import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { ApiError } from '../../api/client'
import { useAuth } from '../../features/auth/AuthContext'
import { ErrorBanner } from '../../features/shared/ErrorBanner'
import { CheckIcon, LockIcon, ShieldIcon, SparklesIcon, TrashIcon } from '../../features/shared/icons'
import { TextField } from '../../features/shared/TextField'
import { useChangePasswordMutation, useDeleteAccountMutation } from '../../hooks/useAuthMutations'

function buildPasswordSchema(requireCurrent: boolean) {
  return z
    .object({
      currentPassword: z.string().optional(),
      newPassword: z.string().min(8, 'Password must be at least 8 characters'),
      confirmNewPassword: z.string().min(1, 'Please confirm your new password'),
    })
    .superRefine((values, ctx) => {
      if (requireCurrent && !values.currentPassword) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Current password is required',
          path: ['currentPassword'],
        })
      }
      if (values.newPassword !== values.confirmNewPassword) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Passwords do not match',
          path: ['confirmNewPassword'],
        })
      }
    })
}

type PasswordForm = {
  currentPassword?: string
  newPassword: string
  confirmNewPassword: string
}

function PasswordSection({ hasUsablePassword }: { hasUsablePassword: boolean }) {
  const schema = useMemo(() => buildPasswordSchema(hasUsablePassword), [hasUsablePassword])
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<PasswordForm>({ resolver: zodResolver(schema) })
  const changePasswordMutation = useChangePasswordMutation()
  const [success, setSuccess] = useState(false)

  const onSubmit = handleSubmit(async (values) => {
    setSuccess(false)
    try {
      await changePasswordMutation.mutateAsync({
        current_password: values.currentPassword,
        new_password: values.newPassword,
      })
      setSuccess(true)
      reset()
    } catch (error) {
      if (error instanceof ApiError && error.fieldErrors?.current_password) {
        setError('currentPassword', { message: error.fieldErrors.current_password[0] })
      } else {
        setError('root', {
          message: error instanceof ApiError ? error.detail : 'Something went wrong. Please try again.',
        })
      }
    }
  })

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <div className="flex items-center gap-2">
        <span className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-500 text-white">
          <LockIcon className="size-4" />
        </span>
        <h2 className="text-sm font-semibold text-slate-200">
          {hasUsablePassword ? 'Change password' : 'Set a password'}
        </h2>
      </div>
      {!hasUsablePassword && (
        <p className="mt-2 text-xs text-slate-400">
          Your account currently signs in with Google only. Set a password to also enable email
          sign-in.
        </p>
      )}

      <form onSubmit={onSubmit} className="mt-4 space-y-3" noValidate>
        {errors.root && <ErrorBanner message={errors.root.message ?? 'Something went wrong.'} />}
        {success && (
          <div className="flex items-center gap-1.5 rounded border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200">
            <CheckIcon className="size-4 shrink-0" />
            {hasUsablePassword ? 'Password changed.' : 'Password set — you can now log in with it too.'}
          </div>
        )}
        {hasUsablePassword && (
          <TextField
            label="Current password"
            type="password"
            autoComplete="current-password"
            error={errors.currentPassword?.message}
            {...register('currentPassword')}
          />
        )}
        <TextField
          label="New password"
          type="password"
          autoComplete="new-password"
          error={errors.newPassword?.message}
          {...register('newPassword')}
        />
        <TextField
          label="Confirm new password"
          type="password"
          autoComplete="new-password"
          error={errors.confirmNewPassword?.message}
          {...register('confirmNewPassword')}
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-150 hover:shadow-md disabled:opacity-50"
        >
          {isSubmitting ? 'Saving…' : hasUsablePassword ? 'Change password' : 'Set password'}
        </button>
      </form>
    </div>
  )
}

function DeleteAccountSection({ hasUsablePassword }: { hasUsablePassword: boolean }) {
  const navigate = useNavigate()
  const deleteAccountMutation = useDeleteAccountMutation()
  const [open, setOpen] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmText, setConfirmText] = useState('')
  const [error, setError] = useState<string | null>(null)

  const canConfirm = hasUsablePassword ? password.length > 0 : confirmText.trim().toUpperCase() === 'DELETE'

  const handleDelete = async () => {
    setError(null)
    try {
      await deleteAccountMutation.mutateAsync(hasUsablePassword ? password : undefined)
      navigate('/', { replace: true })
    } catch (err) {
      setError(err instanceof ApiError ? err.detail : 'Could not delete your account. Please try again.')
    }
  }

  return (
    <div className="rounded-2xl border border-red-900/50 bg-red-950/20 p-6">
      <div className="flex items-center gap-2">
        <span className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-red-500 to-rose-600 text-white">
          <TrashIcon className="size-4" />
        </span>
        <h2 className="text-sm font-semibold text-red-300">Delete account</h2>
      </div>
      <p className="mt-2 text-xs text-slate-400">
        Permanently deletes your account and every prediction you&apos;ve made. This cannot be undone.
      </p>

      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-4 rounded-xl border border-red-800 bg-red-950/40 px-4 py-2 text-sm font-semibold text-red-300 transition-all duration-150 hover:bg-red-950/70"
        >
          Delete my account
        </button>
      ) : (
        <div className="mt-4 space-y-3">
          {error && <ErrorBanner message={error} />}
          {hasUsablePassword ? (
            <TextField
              label="Confirm your password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          ) : (
            <TextField
              label='Type "DELETE" to confirm'
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
            />
          )}
          <div className="flex gap-2">
            <button
              type="button"
              disabled={!canConfirm || deleteAccountMutation.isPending}
              onClick={handleDelete}
              className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-all duration-150 hover:bg-red-500 disabled:opacity-50"
            >
              {deleteAccountMutation.isPending ? 'Deleting…' : 'Permanently delete'}
            </button>
            <button
              type="button"
              onClick={() => {
                setOpen(false)
                setPassword('')
                setConfirmText('')
                setError(null)
              }}
              className="rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-300 transition-all duration-150 hover:bg-slate-800"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export function SettingsPage() {
  const { user } = useAuth()
  if (!user) return null

  return (
    <div className="mx-auto max-w-2xl space-y-6 py-4">
      <header className="animate-fade-in-up">
        <h1 className="text-2xl font-bold tracking-tight text-white">Account settings</h1>
        <p className="mt-1 text-sm text-slate-400">Manage how you sign in and your account data.</p>
      </header>

      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 text-white">
            <ShieldIcon className="size-4" />
          </span>
          <h2 className="text-sm font-semibold text-slate-200">Sign-in method</h2>
        </div>
        <div className="mt-3 flex items-center justify-between text-sm">
          <span className="text-slate-400">Email</span>
          <span className="font-medium text-slate-200">{user.email}</span>
        </div>
        <div className="mt-2 flex items-center justify-between text-sm">
          <span className="text-slate-400">Password sign-in</span>
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
              user.has_usable_password
                ? 'bg-emerald-500/10 text-emerald-300'
                : 'bg-slate-800 text-slate-400'
            }`}
          >
            {user.has_usable_password ? (
              <>
                <CheckIcon className="size-3" /> Enabled
              </>
            ) : (
              <>
                <SparklesIcon className="size-3" /> Google only
              </>
            )}
          </span>
        </div>
      </div>

      <PasswordSection hasUsablePassword={user.has_usable_password} />
      <DeleteAccountSection hasUsablePassword={user.has_usable_password} />
    </div>
  )
}

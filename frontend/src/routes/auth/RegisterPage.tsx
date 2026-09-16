import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { ApiError } from '../../api/client'
import { AuroraBackdrop } from '../../features/shared/AuroraBackdrop'
import { ErrorBanner } from '../../features/shared/ErrorBanner'
import { LockIcon, MailIcon, UserPlusIcon } from '../../features/shared/icons'
import { TextField } from '../../features/shared/TextField'
import { useRegisterMutation } from '../../hooks/useAuthMutations'

const registerSchema = z
  .object({
    firstName: z.string().max(150).optional(),
    lastName: z.string().max(150).optional(),
    email: z.string().min(1, 'Email is required').email('Enter a valid email'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type RegisterForm = z.infer<typeof registerSchema>

export function RegisterPage() {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) })
  const registerMutation = useRegisterMutation()
  const navigate = useNavigate()

  const onSubmit = handleSubmit(async (values) => {
    try {
      await registerMutation.mutateAsync({
        email: values.email,
        password: values.password,
        first_name: values.firstName,
        last_name: values.lastName,
      })
      navigate('/', { replace: true })
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.fieldErrors?.email) {
          setError('email', { message: error.fieldErrors.email[0] })
        } else if (error.fieldErrors?.password) {
          setError('password', { message: error.fieldErrors.password[0] })
        } else {
          setError('root', { message: error.detail })
        }
      } else {
        setError('root', { message: 'Something went wrong. Please try again.' })
      }
    }
  })

  return (
    <div className="relative isolate flex min-h-[70vh] items-center justify-center py-8">
      <AuroraBackdrop />
      <div className="animate-fade-in-up relative w-full max-w-sm rounded-2xl border border-slate-200/70 bg-white/80 p-8 shadow-xl shadow-indigo-500/5 backdrop-blur-xl dark:border-slate-800/70 dark:bg-slate-900/60">
        <div className="flex flex-col items-center text-center">
          <span className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-500 text-white shadow-md shadow-indigo-500/30">
            <UserPlusIcon className="size-5" />
          </span>
          <h1 className="text-2xl font-bold tracking-tight">Create your account</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Get started with your first risk assessment.
          </p>
        </div>

        <form onSubmit={onSubmit} className="mt-7 space-y-4" noValidate>
          {errors.root && <ErrorBanner message={errors.root.message ?? 'Registration failed.'} />}
          <div className="grid grid-cols-2 gap-3">
            <TextField
              label="First name"
              autoComplete="given-name"
              error={errors.firstName?.message}
              {...register('firstName')}
            />
            <TextField
              label="Last name"
              autoComplete="family-name"
              error={errors.lastName?.message}
              {...register('lastName')}
            />
          </div>
          <TextField
            label="Email"
            type="email"
            autoComplete="email"
            icon={<MailIcon className="size-4" />}
            error={errors.email?.message}
            {...register('email')}
          />
          <TextField
            label="Password"
            type="password"
            autoComplete="new-password"
            icon={<LockIcon className="size-4" />}
            error={errors.password?.message}
            {...register('password')}
          />
          <TextField
            label="Confirm password"
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
            {isSubmitting ? 'Creating account…' : 'Create account'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-medium text-indigo-600 transition-colors hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  )
}

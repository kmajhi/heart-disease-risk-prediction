import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useRef, useState, type ChangeEvent, type ReactNode } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { useAuth } from '../../features/auth/AuthContext'
import {
  CameraIcon,
  ChevronDownIcon,
  FacebookIcon,
  FileTextIcon,
  LinkedInIcon,
  LogOutIcon,
  ShieldIcon,
  TwitterIcon,
  UserIcon,
  WhatsAppIcon,
} from '../../features/shared/icons'
import { TextField } from '../../features/shared/TextField'
import { ToggleSwitch } from '../../features/shared/ToggleSwitch'
import {
  useLogoutMutation,
  useUpdateProfileMutation,
  useUploadAvatarMutation,
} from '../../hooks/useAuthMutations'
import type { ShareChannel } from '../../types/user'

const profileSchema = z.object({
  firstName: z.string().max(150).optional(),
  lastName: z.string().max(150).optional(),
})

type ProfileForm = z.infer<typeof profileSchema>

const SHARE_CHANNELS: { id: ShareChannel; label: string; icon: typeof TwitterIcon }[] = [
  { id: 'twitter', label: 'X (Twitter)', icon: TwitterIcon },
  { id: 'linkedin', label: 'LinkedIn', icon: LinkedInIcon },
  { id: 'facebook', label: 'Facebook', icon: FacebookIcon },
  { id: 'whatsapp', label: 'WhatsApp', icon: WhatsAppIcon },
]

function initialsFor(email: string, firstName: string, lastName: string) {
  const combined = `${firstName?.[0] ?? ''}${lastName?.[0] ?? ''}`.trim()
  return (combined || email[0] || '?').toUpperCase()
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-800 py-3 text-sm last:border-b-0">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-slate-200">{value}</span>
    </div>
  )
}

function Row({
  icon,
  label,
  control,
  onClick,
  tone = 'default',
}: {
  icon: ReactNode
  label: string
  control?: ReactNode
  onClick?: () => void
  tone?: 'default' | 'danger'
}) {
  const Comp = onClick ? 'button' : 'div'
  return (
    <Comp
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={`flex w-full items-center justify-between border-b border-slate-800 py-4 text-left last:border-b-0 ${
        onClick ? 'transition-colors hover:bg-slate-800/50' : ''
      }`}
    >
      <span className={`flex items-center gap-3 text-sm font-medium ${tone === 'danger' ? 'text-red-400' : 'text-slate-200'}`}>
        <span className={tone === 'danger' ? 'text-red-400' : 'text-slate-500'}>{icon}</span>
        {label}
      </span>
      {control}
    </Comp>
  )
}

export function ProfilePage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const updateProfileMutation = useUpdateProfileMutation()
  const uploadAvatarMutation = useUploadAvatarMutation()
  const logoutMutation = useLogoutMutation()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [avatarError, setAvatarError] = useState<string | null>(null)
  const [localPreview, setLocalPreview] = useState<string | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  // Mirrors user.share_preferences for rendering, but the ref is the real
  // source of truth for computing the *next* toggle value: React state
  // updates are batched, so two toggle clicks in the same tick would both
  // read the same stale `sharePrefs` state and race (whichever PATCH
  // response landed last would silently clobber the other toggle). The ref
  // is mutated synchronously, so every click always chains off the latest
  // value regardless of render/batching timing.
  const [sharePrefs, setSharePrefs] = useState(user?.share_preferences ?? {})
  const sharePrefsRef = useRef(sharePrefs)

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, isDirty },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: { firstName: user?.first_name ?? '', lastName: user?.last_name ?? '' },
  })

  useEffect(() => {
    reset({ firstName: user?.first_name ?? '', lastName: user?.last_name ?? '' })
    sharePrefsRef.current = user?.share_preferences ?? {}
    setSharePrefs(sharePrefsRef.current)
  }, [user, reset])

  if (!user) return null

  const onSubmit = handleSubmit(async (values) => {
    await updateProfileMutation.mutateAsync({
      first_name: values.firstName,
      last_name: values.lastName,
    })
  })

  const handleAvatarPick = () => fileInputRef.current?.click()

  const handleAvatarChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    setAvatarError(null)
    if (!file.type.startsWith('image/')) {
      setAvatarError('Please choose an image file.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setAvatarError('Image must be smaller than 5 MB.')
      return
    }

    const objectUrl = URL.createObjectURL(file)
    setLocalPreview(objectUrl)
    try {
      await uploadAvatarMutation.mutateAsync(file)
    } catch {
      setAvatarError('Could not upload photo. Please try again.')
    } finally {
      URL.revokeObjectURL(objectUrl)
      setLocalPreview(null)
    }
  }

  const toggleShareChannel = (channel: ShareChannel) => {
    const current = sharePrefsRef.current
    const next = { ...current, [channel]: !current[channel] }
    sharePrefsRef.current = next
    setSharePrefs(next)
    updateProfileMutation.mutate({ share_preferences: next })
  }

  const handleLogout = () => {
    logoutMutation.mutate(undefined, { onSuccess: () => navigate('/') })
  }

  const avatarSrc = localPreview ?? user.avatar
  const displayName =
    user.first_name || user.last_name ? `${user.first_name} ${user.last_name}`.trim() : 'Your profile'

  return (
    <div className="mx-auto max-w-md py-4">
      <div className="animate-fade-in-up overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 shadow-sm">
        {/* Hero band + overlapping avatar */}
        <div className="relative h-28 bg-gradient-to-br from-indigo-500 via-violet-500 to-cyan-500">
          <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
            <div className="relative">
              {avatarSrc ? (
                <img
                  src={avatarSrc}
                  alt=""
                  className="size-24 rounded-full border-4 border-slate-900 object-cover shadow-md"
                />
              ) : (
                <span className="flex size-24 items-center justify-center rounded-full border-4 border-slate-900 bg-gradient-to-br from-indigo-500 to-cyan-500 text-2xl font-semibold text-white shadow-md">
                  {initialsFor(user.email, user.first_name, user.last_name)}
                </span>
              )}
              <button
                type="button"
                onClick={handleAvatarPick}
                disabled={uploadAvatarMutation.isPending}
                title="Change photo"
                className="absolute -bottom-1 -right-1 flex size-8 items-center justify-center rounded-full border-2 border-slate-900 bg-gradient-to-br from-indigo-500 to-cyan-500 text-white shadow-sm transition-transform duration-150 hover:scale-105 disabled:opacity-50"
              >
                <CameraIcon className="size-4" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>
          </div>
        </div>

        <div className="px-6 pb-2 pt-16 text-center">
          {uploadAvatarMutation.isPending && <p className="text-xs text-slate-500">Uploading…</p>}
          {avatarError && <p className="text-xs text-red-400">{avatarError}</p>}
          <h1 className="text-xl font-bold text-white">{displayName}</h1>
        </div>

        {/* Info rows */}
        <div className="px-6 pb-2 pt-2">
          <InfoRow label="Email" value={user.email} />
          <InfoRow label="Role" value={user.role.charAt(0).toUpperCase() + user.role.slice(1)} />
          <InfoRow label="Joined" value={new Date(user.date_joined).toLocaleDateString()} />
        </div>

        <div className="h-2 bg-slate-950/40" />

        {/* Settings-style list */}
        <div className="px-6">
          <Row
            icon={<UserIcon className="size-5" />}
            label="Profile details"
            onClick={() => setDetailsOpen((v) => !v)}
            control={
              <ChevronDownIcon
                className={`size-4 text-slate-500 transition-transform duration-150 ${detailsOpen ? 'rotate-180' : ''}`}
              />
            }
          />
          {detailsOpen && (
            <form onSubmit={onSubmit} className="space-y-3 border-b border-slate-800 pb-5 pt-1">
              <div className="grid grid-cols-2 gap-3">
                <TextField label="First name" autoComplete="given-name" {...register('firstName')} />
                <TextField label="Last name" autoComplete="family-name" {...register('lastName')} />
              </div>
              <button
                type="submit"
                disabled={isSubmitting || !isDirty}
                className="w-full rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-150 hover:shadow-md disabled:opacity-50"
              >
                {isSubmitting ? 'Saving…' : 'Save changes'}
              </button>
              {updateProfileMutation.isSuccess && (
                <p className="text-center text-xs text-emerald-400">Saved.</p>
              )}
            </form>
          )}

          {SHARE_CHANNELS.map(({ id, label, icon: Icon }) => (
            <Row
              key={id}
              icon={<Icon className="size-5" />}
              label={label}
              control={<ToggleSwitch checked={Boolean(sharePrefs[id])} onChange={() => toggleShareChannel(id)} label={`Share to ${label}`} />}
            />
          ))}

          <Link to="/history" className="block">
            <Row icon={<FileTextIcon className="size-5" />} label="My reports" />
          </Link>

          <Link to="/settings" className="block">
            <Row icon={<ShieldIcon className="size-5" />} label="Account settings" />
          </Link>

          <Row
            icon={<LogOutIcon className="size-5" />}
            label="Log out"
            tone="danger"
            onClick={handleLogout}
          />
        </div>
        <div className="h-4" />
      </div>
    </div>
  )
}

export type UserRole = 'user' | 'admin'

export type ShareChannel = 'twitter' | 'linkedin' | 'facebook' | 'whatsapp' | 'email'

export interface CurrentUser {
  id: number
  email: string
  first_name: string
  last_name: string
  avatar: string | null
  share_preferences: Partial<Record<ShareChannel, boolean>>
  role: UserRole
  date_joined: string
  has_usable_password: boolean
}

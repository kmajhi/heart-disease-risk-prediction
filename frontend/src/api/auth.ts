import { ApiError, request } from './client'
import type { CurrentUser, ShareChannel } from '../types/user'

export interface RegisterPayload {
  email: string
  password: string
  first_name?: string
  last_name?: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface UpdateProfilePayload {
  first_name?: string
  last_name?: string
  share_preferences?: Partial<Record<ShareChannel, boolean>>
}

export function register(payload: RegisterPayload) {
  return request<CurrentUser>('/auth/register/', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function login(payload: LoginPayload) {
  return request<CurrentUser>('/auth/login/', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function loginWithGoogle(credential: string) {
  return request<CurrentUser>('/auth/google/', {
    method: 'POST',
    body: JSON.stringify({ credential }),
  })
}

export function logout() {
  return request<void>('/auth/logout/', { method: 'POST' })
}

export function requestPasswordReset(email: string) {
  return request<{ detail: string }>('/auth/password-reset/', {
    method: 'POST',
    body: JSON.stringify({ email }),
  })
}

export interface ConfirmPasswordResetPayload {
  uid: string
  token: string
  new_password: string
}

export function confirmPasswordReset(payload: ConfirmPasswordResetPayload) {
  return request<void>('/auth/password-reset/confirm/', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export interface ChangePasswordPayload {
  current_password?: string
  new_password: string
}

export function changePassword(payload: ChangePasswordPayload) {
  return request<CurrentUser>('/auth/password/change/', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function deleteAccount(password?: string) {
  return request<void>('/auth/me/delete/', {
    method: 'POST',
    body: JSON.stringify({ password }),
  })
}

export async function fetchCurrentUser(): Promise<CurrentUser | null> {
  try {
    return await request<CurrentUser>('/auth/me/')
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return null
    throw error
  }
}

export function updateProfile(payload: UpdateProfilePayload) {
  return request<CurrentUser>('/auth/me/', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export function uploadAvatar(file: File) {
  const formData = new FormData()
  formData.append('avatar', file)
  return request<CurrentUser>('/auth/me/avatar/', {
    method: 'POST',
    body: formData,
  })
}

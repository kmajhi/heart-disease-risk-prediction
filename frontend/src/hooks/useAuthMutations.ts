import { useMutation, useQueryClient } from '@tanstack/react-query'
import * as authApi from '../api/auth'
import { AUTH_QUERY_KEY } from '../features/auth/AuthContext'

export function useRegisterMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: authApi.register,
    onSuccess: (user) => queryClient.setQueryData(AUTH_QUERY_KEY, user),
  })
}

export function useLoginMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (user) => queryClient.setQueryData(AUTH_QUERY_KEY, user),
  })
}

export function useGoogleLoginMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: authApi.loginWithGoogle,
    onSuccess: (user) => queryClient.setQueryData(AUTH_QUERY_KEY, user),
  })
}

export function useRequestPasswordResetMutation() {
  return useMutation({ mutationFn: authApi.requestPasswordReset })
}

export function useConfirmPasswordResetMutation() {
  return useMutation({ mutationFn: authApi.confirmPasswordReset })
}

export function useChangePasswordMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: authApi.changePassword,
    onSuccess: (user) => queryClient.setQueryData(AUTH_QUERY_KEY, user),
  })
}

export function useDeleteAccountMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: authApi.deleteAccount,
    onSuccess: () => queryClient.setQueryData(AUTH_QUERY_KEY, null),
  })
}

export function useLogoutMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => queryClient.setQueryData(AUTH_QUERY_KEY, null),
  })
}

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: authApi.updateProfile,
    onSuccess: (user) => queryClient.setQueryData(AUTH_QUERY_KEY, user),
  })
}

export function useUploadAvatarMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: authApi.uploadAvatar,
    onSuccess: (user) => queryClient.setQueryData(AUTH_QUERY_KEY, user),
  })
}

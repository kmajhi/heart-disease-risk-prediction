import { createContext, useContext, type ReactNode } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchCurrentUser } from '../../api/auth'
import type { CurrentUser } from '../../types/user'

interface AuthContextValue {
  user: CurrentUser | null
  isLoading: boolean
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export const AUTH_QUERY_KEY = ['auth', 'me'] as const

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data, isLoading } = useQuery({
    queryKey: AUTH_QUERY_KEY,
    queryFn: fetchCurrentUser,
    staleTime: 60_000,
  })

  return (
    <AuthContext.Provider value={{ user: data ?? null, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

/** Call after login/register/logout mutations to resync the cached session. */
export function useRefreshAuth() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY })
}

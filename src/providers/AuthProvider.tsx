
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type {
  AuthSession,
  AuthUser,
} from '../domain/repositories/IAuthRepository'
import { ADMIN_EMAIL } from '../application/services/AuthService'

type AuthContextValue = {
  user: AuthUser | null
  session: AuthSession | null
  loading: boolean
  isAuthenticated: boolean
  isAdmin: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [session, setSession] = useState<AuthSession | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    let unsubscribe = () => {}

    void import('../bootstrap/services').then(({ authService }) => {
      unsubscribe = authService.onAuthStateChanged(
        (nextUser, nextSession) => {
          if (!mounted) return
          setUser(nextUser)
          setSession(nextSession)
          setLoading(false)
        },
      )
      return authService.getCurrentSession()
    })
      .then((current) => {
        if (!mounted) return
        setSession(current)
        setUser(current?.user ?? null)
      })
      .catch((error) => {
        console.error('Supabase session recovery failed:', error)
        if (!mounted) return
        setSession(null)
        setUser(null)
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })

    return () => {
      mounted = false
      unsubscribe()
    }
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    const { authService } = await import('../bootstrap/services')
    const nextSession = await authService.signIn(email, password)
    setSession(nextSession)
    setUser(nextSession.user)
  }, [])

  const signOut = useCallback(async () => {
    const { authService } = await import('../bootstrap/services')
    await authService.signOut()
    setSession(null)
    setUser(null)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      session,
      loading,
      isAuthenticated: Boolean(session && user),
      isAdmin:
        user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase(),
      signIn,
      signOut,
    }),
    [user, session, loading, signIn, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('AuthProvider missing')
  return context
}

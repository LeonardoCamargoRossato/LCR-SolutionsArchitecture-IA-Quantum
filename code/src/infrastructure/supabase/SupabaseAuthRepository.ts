
import type {
  AuthSession,
  AuthUser,
  IAuthRepository,
} from '../../domain/repositories/IAuthRepository'
import { requireSupabase } from './supabaseClient'

function mapUser(user: {
  id: string
  email?: string
  user_metadata?: Record<string, unknown>
}): AuthUser {
  return {
    uid: user.id,
    email: user.email ?? null,
    displayName:
      (user.user_metadata?.full_name as string | undefined) ??
      (user.user_metadata?.name as string | undefined) ??
      null,
    photoURL:
      (user.user_metadata?.avatar_url as string | undefined) ??
      (user.user_metadata?.picture as string | undefined) ??
      null,
  }
}

function mapSession(session: {
  user: {
    id: string
    email?: string
    user_metadata?: Record<string, unknown>
  }
  expires_at?: number
}): AuthSession {
  return {
    user: mapUser(session.user),
    expiresAt: session.expires_at,
  }
}

export class SupabaseAuthRepository implements IAuthRepository {
  async signIn(email: string, password: string) {
    const { data, error } = await requireSupabase().auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error
    if (!data.session) {
      throw new Error('O Supabase não retornou uma sessão autenticada.')
    }

    return mapSession(data.session)
  }

  async signOut() {
    const { error } = await requireSupabase().auth.signOut()
    if (error) throw error
  }

  async getCurrentUser() {
    const { data, error } = await requireSupabase().auth.getUser()
    if (error) throw error
    return data.user ? mapUser(data.user) : null
  }

  async getCurrentSession() {
    const { data, error } = await requireSupabase().auth.getSession()
    if (error) throw error
    return data.session ? mapSession(data.session) : null
  }

  onAuthStateChanged(
    callback: (user: AuthUser | null, session: AuthSession | null) => void,
  ) {
    const {
      data: { subscription },
    } = requireSupabase().auth.onAuthStateChange((_event, session) => {
      const mapped = session ? mapSession(session) : null
      callback(mapped?.user ?? null, mapped)
    })

    return () => subscription.unsubscribe()
  }
}

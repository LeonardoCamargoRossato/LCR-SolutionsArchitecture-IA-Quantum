
export type AuthUser = {
  uid: string
  email: string | null
  displayName: string | null
  photoURL?: string | null
}

export type AuthSession = {
  user: AuthUser
  expiresAt?: number
}

export interface IAuthRepository {
  signIn(email: string, password: string): Promise<AuthSession>
  signOut(): Promise<void>
  getCurrentUser(): Promise<AuthUser | null>
  getCurrentSession(): Promise<AuthSession | null>
  onAuthStateChanged(
    callback: (user: AuthUser | null, session: AuthSession | null) => void,
  ): () => void
}

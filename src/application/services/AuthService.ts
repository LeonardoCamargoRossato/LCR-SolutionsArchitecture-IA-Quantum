
import type { IAuthRepository } from '../../domain/repositories/IAuthRepository'

export const ADMIN_EMAIL = 'leo.c.rossato@gmail.com'

export class AuthService {
  constructor(private repository: IAuthRepository) {}

  signIn(email: string, password: string) {
    return this.repository.signIn(email, password)
  }

  signOut() {
    return this.repository.signOut()
  }

  getCurrentUser() {
    return this.repository.getCurrentUser()
  }

  getCurrentSession() {
    return this.repository.getCurrentSession()
  }

  onAuthStateChanged(
    callback: Parameters<IAuthRepository['onAuthStateChanged']>[0],
  ) {
    return this.repository.onAuthStateChanged(callback)
  }

  isAdmin(user: { email?: string | null } | null | undefined) {
    return user?.email?.toLowerCase() === ADMIN_EMAIL
  }
}

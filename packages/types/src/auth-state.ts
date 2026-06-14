import type { User } from './user.js'

export interface AuthState {
  user: User | null
  loading: boolean
}
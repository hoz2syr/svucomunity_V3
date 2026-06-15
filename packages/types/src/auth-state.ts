export interface AuthState {
  user: import('./user.js').User | null
  loading: boolean
}

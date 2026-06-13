export * from './user';
export * from './course';
export * from './group';
export * from './resource';

export interface Schedule {
  id: string
  group_id: string
  day_of_week: number
  start_time: string
  end_time: string
  location: string
}

export interface AuthState {
  user: import('./user').User | null
  loading: boolean
}

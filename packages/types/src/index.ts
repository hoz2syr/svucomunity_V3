export * from './user.js';
export * from './course.js';
export * from './group.js';
export * from './resource.js';

export interface Schedule {
  id: string
  group_id: string
  day_of_week: number
  start_time: string
  end_time: string
  location: string
}

export interface AuthState {
  user: import('./user.js').User | null
  loading: boolean
}

import type { User, Course, Group, Schedule, AuthState } from '../src/index';

describe('types', () => {
  it('User type is exported', () => {
    const user: User = {
      id: '1', email: 'a@b.com', username: 'u',
      is_admin: false, is_active: true, created_at: '2024-01-01', updated_at: '2024-01-01',
    };
    expect(user.id).toBe('1');
  });

  it('User type works without optional fields', () => {
    const user: User = {
      id: '1', email: 'a@b.com', username: 'u',
      is_admin: false, is_active: true, created_at: '2024-01-01', updated_at: '2024-01-01',
    };
    expect(user.id).toBe('1');
  });

  it('Course type is exported', () => {
    const course: Course = {
      id: '1', code: 'CS101', name: 'Intro', major: 'CS',
      description: null, is_active: true, created_at: '2024-01-01',
    };
    expect(course.code).toBe('CS101');
  });

  it('Course type works with optional fields omitted', () => {
    const course: Course = {
      id: '1', code: 'CS101', name: 'Intro', major: 'CS',
      description: null, is_active: true, created_at: '2024-01-01',
    };
    expect(course.code).toBe('CS101');
  });

  it('Group type is exported', () => {
    const group: Group = {
      id: '1', course_code: 'CS101', creator_id: 'u1',
      members: [], is_private: false,
      created_at: '2024-01-01', updated_at: '2024-01-01',
    };
    expect(group.id).toBe('1');
  });

  it('Schedule type is exported', () => {
    const schedule: Schedule = {
      id: '1', group_id: 'g1', day_of_week: 0,
      start_time: '09:00', end_time: '10:00', location: 'Room 1',
    };
    expect(schedule.location).toBe('Room 1');
  });

  it('AuthState type is exported', () => {
    const auth: AuthState = { user: null, loading: false };
    expect(auth.loading).toBe(false);
  });

  it('AuthState type works with real User object', () => {
    const user: User = {
      id: '1', email: 'a@b.com', username: 'u',
      is_admin: false, is_active: true, created_at: '2024-01-01', updated_at: '2024-01-01',
    };
    const auth: AuthState = { user, loading: false };
    expect(auth.user?.id).toBe('1');
  });
});

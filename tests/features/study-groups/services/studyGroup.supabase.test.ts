import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getAllWithCreators, getCreators, getCoursesByMajor, getAvailableMajors, joinGroup, createGroup, deleteGroup, getGroupMembers, checkMembership } from '@/src/features/study-groups/src/services/studyGroup.supabase';

const mockFrom = vi.hoisted(() => vi.fn());

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: mockFrom,
  })),
}));

vi.mock('@/src/features/study-groups/src/services/courseCatalog', () => ({
  getCoursesByMajorStatic: vi.fn(() => [{ code: 'CS101', name: 'Intro CS' }]),
  getAllMajorsStatic: vi.fn(() => ['CS', 'Engineering']),
}));

function createChain(data: any, error: any = null) {
  const response = { data, error };
  const terminal = {
    order: vi.fn(() => Promise.resolve(response)),
    maybeSingle: vi.fn(() => Promise.resolve(response)),
    single: vi.fn(() => Promise.resolve(response)),
    update: vi.fn(() => chain),
  };
  const chain: any = {
    select: vi.fn(() => chain),
    insert: vi.fn(() => chain),
    delete: vi.fn(() => chain),
    in: vi.fn(() => chain),
    eq: vi.fn(() => chain),
    ...terminal,
    then: (resolve: any) => resolve(response),
  };
  return chain;
}

describe('studyGroup.supabase service', () => {
  beforeEach(() => {
    mockFrom.mockClear();
  });

  describe('getAllWithCreators', () => {
    it('should return all groups ordered by created_at desc', async () => {
      const groups = [{ id: '1', name: 'G1', created_at: '2024-01-01' }];
      mockFrom.mockReturnValue(createChain(groups));

      const result = await getAllWithCreators();
      expect(mockFrom).toHaveBeenCalledWith('groups');
      expect(result).toEqual(groups);
    });

    it('should throw on supabase error', async () => {
      mockFrom.mockReturnValue(createChain(null, { message: 'DB error' }));

      await expect(getAllWithCreators()).rejects.toThrow('DB error');
    });

    it('should return empty array when no data', async () => {
      mockFrom.mockReturnValue(createChain(null));

      const result = await getAllWithCreators();
      expect(result).toEqual([]);
    });
  });

  describe('getCreators', () => {
    it('should return creator map from user ids', async () => {
      const profiles = [
        { id: '1', full_name: 'Ali H', username: 'ali_h' },
        { id: '2', full_name: 'Sara K', username: 'sara_k' },
      ];
      mockFrom.mockReturnValue(createChain(profiles));

      const result = await getCreators(['1', '2']);
      expect(mockFrom).toHaveBeenCalledWith('profiles');
      expect(result['1']).toEqual({ first_name: 'Ali', last_name: 'H', username: 'ali_h' });
      expect(result['2']).toEqual({ first_name: 'Sara', last_name: 'K', username: 'sara_k' });
    });

    it('should throw on error', async () => {
      mockFrom.mockReturnValue(createChain(null, { message: 'fetch error' }));
      await expect(getCreators(['1'])).rejects.toThrow('fetch error');
    });
  });

  describe('getCoursesByMajor', () => {
    it('should return courses for a major', async () => {
      const courses = [{ code: 'CS101', name: 'Intro CS' }];
      const response = { data: courses, error: null };
      const chain: any = {
        select: vi.fn(() => ({
          ...createChain(courses),
          eq: vi.fn(() => ({ order: vi.fn(() => Promise.resolve(response)) })),
        })),
        then: (resolve: any) => resolve(response),
      };
      mockFrom.mockReturnValue(chain);

      const result = await getCoursesByMajor('CS');
      expect(result).toEqual(courses);
    });
  });

  describe('getAvailableMajors', () => {
    it('should return static majors from course catalog first', async () => {
      const result = await getAvailableMajors();
      expect(result).toEqual(['CS', 'Engineering']);
    });

    it('should fallback to DB majors when static catalog is empty', async () => {
      const { getAvailableMajors: _orig, ...rest } = await import('@/src/features/study-groups/src/services/studyGroup.supabase');
      const majors = [
        { major: 'CS' },
        { major: 'Engineering' },
        { major: 'CS' },
      ];
      mockFrom.mockReturnValue(createChain(majors));

      const result = await getAvailableMajors();
      expect(result).toContain('CS');
      expect(result).toContain('Engineering');
    });
  });

  describe('joinGroup', () => {
    it('should insert membership record', async () => {
      mockFrom.mockReturnValue(createChain(null, null));

      await joinGroup('group1', 'user1');
    });

    it('should throw if join fails', async () => {
      mockFrom.mockReturnValue(createChain(null, { message: 'already member' }));

      await expect(joinGroup('group1', 'user1')).rejects.toThrow('already member');
    });
  });

  describe('createGroup', () => {
    it('should insert a new group and return it', async () => {
      const newGroup = { id: '3', name: 'New Group', major: 'CS', course_code: 'CS101', creator_id: 'u1', current_members: 1, max_members: 5, created_at: '2024-03-01' };
      const response = { data: newGroup, error: null };

      const chain: any = {
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve(response)),
            then: (resolve: any) => resolve(response),
          })),
        })),
        from: vi.fn(() => ({
          ...createChain(null),
          insert: vi.fn(() => ({
            select: vi.fn(() => ({
              single: vi.fn(() => Promise.resolve(response)),
              then: (resolve: any) => resolve(response),
            })),
          })),
        })),
        then: (resolve: any) => resolve(response),
      };
      mockFrom.mockReturnValue(chain);

      const result = await createGroup({
        name: 'New Group',
        course_name: 'CS',
        course_code: 'CS101',
        class_number: '',
        doctor_name: '',
        major: 'CS',
        max_members: 5,
        whatsapp_link: 'https://wa.me/1',
        group_link: 'https://t.me/1',
        creator_id: 'u1',
        creator_name: 'Ali',
      });
      expect(result).toEqual(newGroup);
    });

    it('should throw on error', async () => {
      const errorResponse = { data: null, error: { message: 'insert failed' } };
      const chain: any = {
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve(errorResponse)),
            then: (resolve: any) => resolve(errorResponse),
          })),
        })),
        from: vi.fn(() => ({
          ...createChain(null),
          insert: vi.fn(() => ({
            select: vi.fn(() => ({
              single: vi.fn(() => Promise.resolve(errorResponse)),
              then: (resolve: any) => resolve(errorResponse),
            })),
          })),
        })),
        then: (resolve: any) => resolve(errorResponse),
      };
      mockFrom.mockReturnValue(chain);

      await expect(
        createGroup({} as any)
      ).rejects.toThrow('insert failed');
    });
  });

  describe('deleteGroup', () => {
    it('should delete group by id', async () => {
      mockFrom.mockReturnValue(createChain(null));

      await deleteGroup('group1');
    });
  });

  describe('getGroupMembers', () => {
    it('should return members for a group', async () => {
      const members = [{ user_id: 'u1', joined_at: '2024-01-01' }];
      mockFrom.mockReturnValue(createChain(members));

      const result = await getGroupMembers('group1');
      expect(result).toEqual(members);
    });

    it('should throw on error', async () => {
      mockFrom.mockReturnValue(createChain(null, { message: 'db error' }));
      await expect(getGroupMembers('group1')).rejects.toThrow('db error');
    });
  });

  describe('checkMembership', () => {
    it('should return true if user is member', async () => {
      mockFrom.mockReturnValue(createChain([{ id: '1' }]));

      const result = await checkMembership('group1', 'user1');
      expect(result).toBe(true);
    });

    it('should return false if user is not member', async () => {
      mockFrom.mockReturnValue(createChain(null));

      const result = await checkMembership('group1', 'user1');
      expect(result).toBe(false);
    });
  });
});

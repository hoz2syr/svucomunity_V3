import { describe, it, expect } from 'vitest';
import type { StudyGroup, StudyGroupFilters, CreateGroupData, Course, StudyGroupStatus } from '../src/types/index';

describe('StudyGroup types', () => {
  it('should accept a valid StudyGroup object', () => {
    const group: StudyGroup = {
      id: '1',
      name: 'Test Group',
      course_name: 'Math',
      course_code: 'MATH101',
      class_number: 'A',
      doctor_name: 'Dr. Smith',
      major: 'CS',
      max_members: 5,
      current_members: 3,
      whatsapp_link: 'https://wa.me/123',
      group_link: 'https://t.me/group',
      creator_id: 'user1',
      creator_name: 'Ali',
      created_at: '2024-01-01T00:00:00Z',
    };
    expect(group.id).toBe('1');
    expect(group.major).toBe('CS');
  });

  it('should accept a StudyGroup with optional fields undefined', () => {
    const group: StudyGroup = {
      id: '2',
      name: 'Group 2',
      course_name: 'Physics',
      course_code: 'PHYS101',
      major: 'Engineering',
      max_members: 10,
      current_members: 10,
      whatsapp_link: 'https://wa.me/456',
      creator_id: 'user2',
      creator_name: 'Sara',
      created_at: '2024-02-01T00:00:00Z',
    };
    expect(group.class_number).toBeUndefined();
    expect(group.doctor_name).toBeUndefined();
  });

  it('should accept a valid StudyGroupFilters object', () => {
    const filters: StudyGroupFilters = {
      search: 'math',
      major: 'CS',
      course_code: 'MATH101',
      class_number: 'A',
      status: 'available',
    };
    expect(filters.status).toBe('available');
    expect(filters.search).toBe('math');
  });

  it('should accept a StudyGroupFilters with default "all" status', () => {
    const filters: StudyGroupFilters = {
      search: '',
      major: '',
      course_code: '',
      class_number: '',
      status: 'all',
    };
    expect(filters.status).toBe('all');
  });

  it('should accept a valid CreateGroupData object', () => {
    const data: CreateGroupData = {
      name: 'New Group',
      course_name: 'Chemistry',
      course_code: 'CHEM101',
      class_number: 'B',
      doctor_name: 'Dr. Jones',
      major: 'Biology',
      max_members: 8,
      whatsapp_link: 'https://wa.me/789',
      group_link: 'https://t.me/newgroup',
    };
    expect(data.max_members).toBe(8);
    expect(data.doctor_name).toBe('Dr. Jones');
  });

  it('should accept CreateGroupData without optional group_link', () => {
    const data: CreateGroupData = {
      name: 'New Group',
      course_name: 'Chemistry',
      course_code: 'CHEM101',
      class_number: 'B',
      doctor_name: 'Dr. Jones',
      major: 'Biology',
      max_members: 8,
      whatsapp_link: 'https://wa.me/789',
    };
    expect(data.group_link).toBeUndefined();
  });

  it('should accept Course type', () => {
    const course: Course = { code: 'CS101', name: 'Intro to CS' };
    expect(course.code).toBe('CS101');
  });

  it('should accept StudyGroupStatus type', () => {
    const statuses: StudyGroupStatus[] = ['loading', 'success', 'error', 'empty'];
    expect(statuses).toHaveLength(4);
  });
});

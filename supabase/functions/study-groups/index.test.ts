import { describe, it, expect } from 'https://deno.land/std@0.168.0/testing/bdd.ts';
import { validateUrl, validateGroupPayload } from './index.ts';

describe('validation functions', () => {
  describe('validateUrl', () => {
    it('should return true for valid http URLs', () => {
      expect(validateUrl('https://chat.whatsapp.com/123')).toBe(true);
      expect(validateUrl('http://example.com')).toBe(true);
    });
    
    it('should return true for undefined URLs', () => {
      expect(validateUrl(undefined)).toBe(true);
    });
    
    it('should return false for invalid URLs', () => {
      expect(validateUrl('not-a-url')).toBe(false);
      expect(validateUrl('ftp://example.com')).toBe(false);
      expect(validateUrl('javascript:alert(1)')).toBe(false);
    });
  });

  describe('validateGroupPayload', () => {
    it('should return error for missing name', () => {
      const result = validateGroupPayload({});
      expect(result).toContain('اسم المجموعة مطلوب');
    });
    
    it('should return error for short name', () => {
      const result = validateGroupPayload({ name: 'ab' });
      expect(result).toContain('3 أحرف على الأقل');
    });
    
    it('should return error for missing course_name', () => {
      const result = validateGroupPayload({ name: 'Test Group' });
      expect(result).toContain('اسم المادة مطلوب');
    });
    
    it('should return error for missing course_code', () => {
      const result = validateGroupPayload({ name: 'Test Group', course_name: 'Course' });
      expect(result).toContain('رمز المادة مطلوب');
    });
    
    it('should return error for missing major', () => {
      const result = validateGroupPayload({ name: 'Test Group', course_name: 'Course', course_code: 'CS101' });
      expect(result).toContain('التخصص مطلوب');
    });
    
    it('should return error for missing whatsapp_link', () => {
      const result = validateGroupPayload({ name: 'Test Group', course_name: 'Course', course_code: 'CS101', major: 'CS' });
      expect(result).toContain('رابط الواتساب مطلوب');
    });
    
    it('should return error for invalid whatsapp_link URL', () => {
      const result = validateGroupPayload({
        name: 'Test Group',
        course_name: 'Course',
        course_code: 'CS101',
        major: 'CS',
        whatsapp_link: 'not-a-url',
      });
      expect(result).toContain('رابط الواتساب غير صالح');
    });
    
    it('should return error for invalid group_link URL', () => {
      const result = validateGroupPayload({
        name: 'Test Group',
        course_name: 'Course',
        course_code: 'CS101',
        major: 'CS',
        whatsapp_link: 'https://chat.whatsapp.com/123',
        group_link: 'not-a-url',
      });
      expect(result).toContain('رابط المجموعة غير صالح');
    });
    
    it('should return error for invalid max_members', () => {
      const result = validateGroupPayload({
        name: 'Test Group',
        course_name: 'Course',
        course_code: 'CS101',
        major: 'CS',
        whatsapp_link: 'https://chat.whatsapp.com/123',
        max_members: 1,
      });
      expect(result).toContain('عدد الأعضاء يجب أن يكون بين 2 و 20');
    });
    
    it('should return null for valid payload', () => {
      const result = validateGroupPayload({
        name: 'Test Group',
        course_name: 'Course',
        course_code: 'CS101',
        major: 'CS',
        whatsapp_link: 'https://chat.whatsapp.com/123',
        max_members: 5,
      });
      expect(result).toBeNull();
    });
    
    it('should return null for valid payload with optional fields', () => {
      const result = validateGroupPayload({
        name: 'Test Group',
        course_name: 'Course',
        course_code: 'CS101',
        class_number: 'C1',
        doctor_name: 'Dr. Smith',
        major: 'CS',
        whatsapp_link: 'https://chat.whatsapp.com/123',
        max_members: 10,
      });
      expect(result).toBeNull();
    });
  });
});
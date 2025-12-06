/**
 * Unit Tests for I18n Manager
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { I18nManager } from '@/config/i18n';

describe('I18nManager', () => {
  let i18n: I18nManager;

  beforeEach(() => {
    i18n = I18nManager.getInstance();
    i18n.setLocale('en'); // Reset to English for each test
  });

  describe('getInstance', () => {
    it('should return singleton instance', () => {
      const instance1 = I18nManager.getInstance();
      const instance2 = I18nManager.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('setLocale and getLocale', () => {
    it('should set and get current locale', () => {
      i18n.setLocale('en');
      expect(i18n.getLocale()).toBe('en');
      
      i18n.setLocale('es');
      expect(i18n.getLocale()).toBe('es');
    });

    it('should support all defined locales', () => {
      const locales = ['en', 'es', 'fr', 'de', 'ja', 'zh'];
      locales.forEach(locale => {
        i18n.setLocale(locale as any);
        expect(i18n.getLocale()).toBe(locale);
      });
    });

    it('should default to en for invalid locale', () => {
      i18n.setLocale('invalid' as any);
      expect(i18n.getLocale()).toBe('en');
    });
  });

  describe('t', () => {
    it('should return translation object', () => {
      const strings = i18n.t();
      expect(strings).toBeDefined();
      expect(strings.common).toBeDefined();
      expect(strings.auth).toBeDefined();
      expect(strings.validation).toBeDefined();
    });

    it('should translate common strings', () => {
      const strings = i18n.t();
      expect(strings.common.save).toBe('Save');
      expect(strings.common.cancel).toBe('Cancel');
      expect(strings.common.delete).toBe('Delete');
      expect(strings.common.loading).toBe('Loading...');
    });

    it('should translate auth strings', () => {
      const strings = i18n.t();
      expect(strings.auth.signIn).toBe('Sign In');
      expect(strings.auth.signOut).toBe('Sign Out');
      expect(strings.auth.email).toBe('Email');
      expect(strings.auth.password).toBe('Password');
    });

    it('should translate validation strings', () => {
      const strings = i18n.t();
      expect(strings.validation.required).toBe('This field is required');
      expect(strings.validation.invalidEmail).toBe('Invalid email address');
      expect(strings.validation.passwordTooShort).toBe('Password must be at least 8 characters');
    });

    it('should translate error strings', () => {
      const strings = i18n.t();
      expect(strings.errors.unauthorized).toBe('Unauthorized access');
      expect(strings.errors.forbidden).toBe('Access forbidden');
      expect(strings.errors.notFound).toBe('Resource not found');
      expect(strings.errors.internalServerError).toBe('Internal server error');
    });

    it('should translate success strings', () => {
      const strings = i18n.t();
      expect(strings.success.created).toBe('Successfully created');
      expect(strings.success.updated).toBe('Successfully updated');
      expect(strings.success.deleted).toBe('Successfully deleted');
    });

    it('should translate project strings', () => {
      const strings = i18n.t();
      expect(strings.projects.title).toBe('Projects');
      expect(strings.projects.create).toBe('Create Project');
      expect(strings.projects.name).toBe('Project Name');
      expect(strings.projects.noProjects).toBe('No projects found');
    });

    it('should translate resource strings', () => {
      const strings = i18n.t();
      expect(strings.resources.title).toBe('Resources');
      expect(strings.resources.create).toBe('Create Resource');
      expect(strings.resources.fields).toBe('Fields');
      expect(strings.resources.addField).toBe('Add Field');
    });

    it('should translate api strings', () => {
      const strings = i18n.t();
      expect(strings.apis.title).toBe('Custom APIs');
      expect(strings.apis.path).toBe('Path');
      expect(strings.apis.method).toBe('Method');
      expect(strings.apis.statusCode).toBe('Status Code');
    });
  });

  describe('locale switching', () => {
    it('should return different locales correctly', () => {
      i18n.setLocale('en');
      const enStrings = i18n.t();
      expect(enStrings.common.save).toBe('Save');
      
      i18n.setLocale('es');
      const esStrings = i18n.t();
      // Currently placeholders, so same as English
      expect(esStrings.common.save).toBe('Save');
      
      i18n.setLocale('en'); // Reset
    });

    it('should maintain consistent structure across locales', () => {
      const locales: Array<'en' | 'es' | 'fr' | 'de' | 'ja' | 'zh'> = ['en', 'es', 'fr'];
      
      locales.forEach(locale => {
        i18n.setLocale(locale);
        const strings = i18n.t();
        
        expect(strings.common).toBeDefined();
        expect(strings.auth).toBeDefined();
        expect(strings.validation).toBeDefined();
        expect(strings.errors).toBeDefined();
        expect(strings.success).toBeDefined();
        expect(strings.projects).toBeDefined();
        expect(strings.resources).toBeDefined();
        expect(strings.apis).toBeDefined();
        expect(strings.dashboard).toBeDefined();
      });
      
      i18n.setLocale('en'); // Reset
    });
  });
});

// auth_utils.test.ts
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { getCookie, getToken, removeToken, setToken } from './auth_utils';

// ✅ КОНСТАНТЫ: тестовые данные (меняем в одном месте)
export const TEST_ACCESS_TOKEN = 'access_123';
export const TEST_REFRESH_TOKEN = 'refresh_456';
export const TEST_USER_EMAIL = 'test@example.com';

// ✅ КОНСТАНТЫ: ключи хранилища (если меняются — правим здесь)
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
} as const;

// ✅ HELPER: установка токенов (убираем дублирование setToken)
export const setupTokens = (
  access: string = TEST_ACCESS_TOKEN,
  refresh: string = TEST_REFRESH_TOKEN
) => {
  setToken(access, refresh);
};

// ✅ HELPER: очистка хранилища (выносим повторяющуюся логику)
export const clearStorage = () => {
  localStorage.clear();
  document.cookie.split(';').forEach((c) => {
    document.cookie = c
      .replace(/^ +/, '')
      .replace(/=.*/, `=;expires=${new Date(0).toUTCString()};path=/`);
  });
};

describe('Auth Utils', () => {
  beforeEach(() => {
    clearStorage(); // ✅ используем helper вместо дублей
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('setToken', () => {
    it('should store accessToken in localStorage', () => {
      setupTokens(); // ✅ одна строка вместо setToken('...', '...')
      expect(localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)).toBe(TEST_ACCESS_TOKEN);
    });

    it('should store refreshToken in document.cookie', () => {
      setupTokens();
      expect(document.cookie).toContain(
        `${STORAGE_KEYS.REFRESH_TOKEN}=${TEST_REFRESH_TOKEN}`
      );
    });

    it('should not store anything if accessToken is empty', () => {
      setToken('', TEST_REFRESH_TOKEN); // ✅ используем константу для refresh
      expect(localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)).toBeNull();
      expect(getCookie(STORAGE_KEYS.REFRESH_TOKEN)).toBeUndefined();
    });

    it('should set cookie successfully (attributes are internal to browser/jsdom)', () => {
      setupTokens();
      const cookies = document.cookie;
      expect(cookies).toContain(`${STORAGE_KEYS.REFRESH_TOKEN}=${TEST_REFRESH_TOKEN}`);
      expect(getCookie(STORAGE_KEYS.REFRESH_TOKEN)).toBe(TEST_REFRESH_TOKEN);
    });
  });

  describe('getToken', () => {
    it('should return null accessToken when not set', () => {
      const tokens = getToken();
      expect(tokens.accessToken).toBeNull();
      expect(tokens.refreshToken).toBeUndefined();
    });

    it('should return accessToken from localStorage', () => {
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, TEST_ACCESS_TOKEN); // ✅ константы
      const tokens = getToken();
      expect(tokens.accessToken).toBe(TEST_ACCESS_TOKEN);
    });

    it('should return refreshToken from cookie', () => {
      document.cookie = `${STORAGE_KEYS.REFRESH_TOKEN}=${TEST_REFRESH_TOKEN}; path=/`;
      const tokens = getToken();
      expect(tokens.refreshToken).toBe(TEST_REFRESH_TOKEN);
    });

    it('should return both tokens when both are set', () => {
      // ✅ используем helper для установки
      setupTokens();
      const tokens = getToken();
      expect(tokens).toEqual({
        accessToken: TEST_ACCESS_TOKEN,
        refreshToken: TEST_REFRESH_TOKEN,
      });
    });

    it('should handle cookie with multiple values', () => {
      document.cookie = 'other=value; path=/';
      document.cookie = `${STORAGE_KEYS.REFRESH_TOKEN}=${TEST_REFRESH_TOKEN}; path=/`;
      document.cookie = 'another=test; path=/';

      const tokens = getToken();
      expect(tokens.refreshToken).toBe(TEST_REFRESH_TOKEN);
    });
  });

  describe('removeToken', () => {
    beforeEach(() => {
      // ✅ setupTokens вместо ручного setToken
      setupTokens();
    });

    it('should remove accessToken from localStorage', () => {
      removeToken();
      expect(localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)).toBeNull();
    });

    it('should remove refreshToken from cookies', () => {
      removeToken();
      expect(getCookie(STORAGE_KEYS.REFRESH_TOKEN)).toBeUndefined();
    });

    it('should remove both tokens', () => {
      removeToken();
      expect(localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)).toBeNull();
      expect(getCookie(STORAGE_KEYS.REFRESH_TOKEN)).toBeUndefined();
    });
  });

  describe('getCookie', () => {
    it('should return undefined when cookie does not exist', () => {
      expect(getCookie('nonexistent')).toBeUndefined();
    });

    it('should return cookie value when it exists', () => {
      document.cookie = 'testCookie=testValue; path=/';
      expect(getCookie('testCookie')).toBe('testValue');
    });

    it('should handle cookie with special characters', () => {
      document.cookie = 'authToken=abc%20def; path=/';
      expect(getCookie('authToken')).toBe('abc%20def');
    });

    it('should return correct value when multiple cookies exist', () => {
      document.cookie = 'first=1; path=/';
      document.cookie = 'second=2; path=/';
      document.cookie = 'target=expected; path=/';

      expect(getCookie('target')).toBe('expected');
      expect(getCookie('first')).toBe('1');
      expect(getCookie('second')).toBe('2');
    });

    it('should handle empty cookie value', () => {
      document.cookie = 'emptyCookie=; path=/';
      expect(getCookie('emptyCookie')).toBe('');
    });
  });

  describe('Integration: setToken + getToken', () => {
    it('should store and retrieve tokens correctly', () => {
      const access = 'new_access_token';
      const refresh = 'new_refresh_token';

      setupTokens(access, refresh); // ✅ helper с кастомными значениями
      const retrieved = getToken();

      expect(retrieved.accessToken).toBe(access);
      expect(retrieved.refreshToken).toBe(refresh);
    });

    it('should return null/undefined after removeToken', () => {
      setupTokens(); // ✅ вместо setToken('access_123', 'refresh_456')
      removeToken();

      const tokens = getToken();
      expect(tokens.accessToken).toBeNull();
      expect(tokens.refreshToken).toBeUndefined();
    });
  });
});
// src/services/auth_utils.ts

// ==================== ТИПЫ ====================
interface TokenResponse {
  accessToken: string | null;
  refreshToken: string | undefined;
}

// ==================== ФУНКЦИИ ДЛЯ РАБОТЫ С ТОКЕНАМИ ====================

/**
 * Сохраняет токены в localStorage и cookie
 * @param accessToken - токен доступа
 * @param refreshToken - токен обновления
 */
export const setToken = (accessToken: string, refreshToken: string): void => {
  if (accessToken) {
    localStorage.setItem('accessToken', accessToken);
    document.cookie = `refreshToken=${refreshToken}; path=/; max-age=3600; secure; samesite=strict`;
  }
};

/**
 * Получает токены из localStorage и cookie
 * @returns объект с accessToken и refreshToken
 */
export const getToken = (): TokenResponse => {
  const accessToken = localStorage.getItem('accessToken');
  const refreshToken = getCookie('refreshToken');
  return { accessToken, refreshToken };
};

/**
 * Удаляет токены из localStorage и cookie
 */
export const removeToken = (): void => {
  localStorage.removeItem('accessToken');
  document.cookie = 'refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
};

/**
 * Получает значение cookie по имени
 * @param name - имя cookie
 * @returns значение cookie или undefined, если не найдено
 */
export const getCookie = (name: string): string | undefined => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  
  if (parts.length === 2) {
    const lastPart = parts.pop();
    if (lastPart) {
      return lastPart.split(';').shift();
    }
  }
  
  return undefined;
};

// ==================== ДОПОЛНИТЕЛЬНЫЕ УТИЛИТЫ ====================

/**
 * Проверяет, есть ли токен доступа
 * @returns true если токен существует
 */
export const hasAccessToken = (): boolean => {
  return !!localStorage.getItem('accessToken');
};

/**
 * Проверяет, есть ли токен обновления
 * @returns true если токен существует
 */
export const hasRefreshToken = (): boolean => {
  return !!getCookie('refreshToken');
};

/**
 * Проверяет, авторизован ли пользователь
 * @returns true если есть оба токена
 */
export const isAuthenticated = (): boolean => {
  return hasAccessToken() && hasRefreshToken();
};

/**
 * Получает только accessToken
 * @returns accessToken или null
 */
export const getAccessToken = (): string | null => {
  return localStorage.getItem('accessToken');
};

/**
 * Получает только refreshToken
 * @returns refreshToken или undefined
 */
export const getRefreshToken = (): string | undefined => {
  return getCookie('refreshToken');
};
// auth_slice.test.ts
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { authApi } from '@utils/api';

import authReducer, {
  checkAuth,
  clearError,
  getUserData,
  initialState,
  loginUser,
  logoutUser,
  refreshUserToken,
  registerUser,
  setCheckAuthStarted,
  updateUserData,
} from './auth_slice';
import { getToken, removeToken, setToken } from './auth_utils';

import type { AuthState } from './auth_slice';

// Мокаем внешние зависимости через Vitest API
vi.mock('@utils/api');
vi.mock('./auth_utils');

const mockedAuthApi = vi.mocked(authApi);
const mockedTokenUtils = vi.mocked({ getToken, setToken, removeToken });

describe('Auth Slice', () => {
  const mockUser = {
    name: 'Test User',
    email: 'test@example.com',
  };

  const mockTokens = {
    accessToken: 'access_123',
    refreshToken: 'refresh_456',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial state', () => {
    it('should return initial state when undefined state passed', () => {
      const result = authReducer(undefined, { type: 'UNKNOWN' });
      expect(result).toEqual(initialState);
    });
  });

  describe('Sync reducers', () => {
    it('should handle clearError', () => {
      const stateWithErrors: AuthState = { ...initialState, error: 'Some error' };
      const result = authReducer(stateWithErrors, clearError());
      expect(result.error).toBeNull();
    });

    it('should handle setCheckAuthStarted', () => {
      const result = authReducer(initialState, setCheckAuthStarted());
      expect(result.isCheckAuthStarted).toBe(true);
    });
  });

  describe('loginUser thunk', () => {
    const loginData = { email: 'test@example.com', password: '123456' };

    it('should handle loginUser.pending', () => {
      const result = authReducer(
        initialState,
        loginUser.pending('requestId', loginData)
      );
      expect(result.isLoading).toBe(true);
      expect(result.error).toBeNull();
    });

    it('should handle loginUser.fulfilled', () => {
      // ✅ ВАЖНО: action creator возвращает объект { type, payload, meta }
      const action = loginUser.fulfilled(mockUser, 'requestId', loginData);
      expect(action.payload).toEqual(mockUser);
      expect(action.type).toBe('auth/loginUser/fulfilled');

      // Проверяем, что редьюсер правильно обрабатывает action
      const result = authReducer(initialState, action);
      expect(result.user).toEqual(mockUser);
      expect(result.isAuth).toBe(true);
      expect(result.isLoading).toBe(false);
    });

    it('should handle loginUser.rejected', () => {
      const error = 'Invalid credentials';
      const action = loginUser.rejected(new Error(error), 'requestId', loginData, error);
      const result = authReducer(initialState, action);
      expect(result.isLoading).toBe(false);
      expect(result.error).toBe(error);
      expect(result.isAuth).toBe(false);
    });
  });

  describe('registerUser thunk', () => {
    const registerData = {
      email: 'new@example.com',
      password: '123456',
      name: 'New User',
    };

    it('should handle registerUser.pending', () => {
      const result = authReducer(
        initialState,
        registerUser.pending('requestId', registerData)
      );
      expect(result.isLoading).toBe(true);
      expect(result.error).toBeNull();
    });

    it('should handle registerUser.fulfilled', () => {
      const action = registerUser.fulfilled(mockUser, 'requestId', registerData);
      expect(action.payload).toEqual(mockUser);

      const result = authReducer(initialState, action);
      expect(result.user).toEqual(mockUser);
      expect(result.isAuth).toBe(true);
    });

    it('should handle registerUser.rejected', () => {
      const error = 'Email already exists';
      const action = registerUser.rejected(
        new Error(error),
        'requestId',
        registerData,
        error
      );
      const result = authReducer(initialState, action);
      expect(result.isLoading).toBe(false);
      expect(result.error).toBe(error);
      expect(result.isAuth).toBe(false);
    });
  });

  describe('logoutUser thunk', () => {
    it('should handle logoutUser.fulfilled', () => {
      // ✅ Тестируем только редьюсер — side effects (removeToken) тестируются отдельно
      const action = logoutUser.fulfilled('requestId', undefined);
      const result = authReducer(initialState, action);
      expect(result.user).toBeNull();
      expect(result.isAuth).toBe(false);
      expect(result.error).toBeNull();
      expect(result.isLoading).toBe(false);
    });

    it('should handle logoutUser.rejected but still clear state', () => {
      const error = 'Logout failed';
      const action = logoutUser.rejected(
        new Error(error),
        'requestId',
        undefined,
        error
      );
      const result = authReducer(initialState, action);
      expect(result.user).toBeNull();
      expect(result.isAuth).toBe(false);
      expect(result.error).toBe(error);
    });
  });

  describe('checkAuth thunk', () => {
    it('should handle checkAuth.fulfilled with true', () => {
      const action = checkAuth.fulfilled(true, 'requestId', undefined);
      expect(action.payload).toBe(true);

      const result = authReducer(initialState, action);
      expect(result.isLoading).toBe(false);
      expect(result.isAuth).toBe(true);
    });

    it('should handle checkAuth.fulfilled with false', () => {
      const action = checkAuth.fulfilled(false, 'requestId', undefined);
      expect(action.payload).toBe(false);

      const result = authReducer(initialState, action);
      expect(result.isAuth).toBe(false);
    });

    it('should handle checkAuth.pending', () => {
      const result = authReducer(
        initialState,
        checkAuth.pending('requestId', undefined)
      );
      expect(result.isLoading).toBe(true);
      expect(result.isCheckAuthStarted).toBe(true);
    });

    it('should handle checkAuth.rejected', () => {
      const error = 'Token expired';
      const action = checkAuth.rejected(new Error(error), 'requestId', undefined, error);
      const result = authReducer(initialState, action);
      expect(result.isLoading).toBe(false);
      expect(result.isAuth).toBe(false);
      expect(result.user).toBeNull();
      expect(result.error).toBe(error);
    });
  });

  describe('getUserData thunk', () => {
    it('should handle getUserData.fulfilled', () => {
      const action = getUserData.fulfilled(mockUser, 'requestId', undefined);
      const result = authReducer(initialState, action);
      expect(result.user).toEqual(mockUser);
    });

    it('should handle getUserData.rejected', () => {
      const error = 'Unauthorized';
      const action = getUserData.rejected(
        new Error(error),
        'requestId',
        undefined,
        error
      );
      const result = authReducer(initialState, action);
      expect(result.user).toBeNull();
      expect(result.error).toBe(error);
    });
  });

  describe('refreshUserToken thunk', () => {
    it('should handle refreshUserToken.rejected', () => {
      const error = 'Session expired';
      const action = refreshUserToken.rejected(
        new Error(error),
        'requestId',
        undefined,
        error
      );
      const result = authReducer(initialState, action);
      expect(result.isLoading).toBe(false);
      expect(result.error).toBe(error);
      expect(result.isAuth).toBe(false);
      expect(result.user).toBeNull();
    });
  });

  describe('updateUserData thunk', () => {
    const updateData = { name: 'Updated Name', email: 'updated@example.com' };

    it('should handle updateUserData.pending', () => {
      const result = authReducer(
        initialState,
        updateUserData.pending('requestId', updateData)
      );
      expect(result.isLoading).toBe(true);
      expect(result.error).toBeNull();
    });

    it('should handle updateUserData.fulfilled', () => {
      const updatedUser = { ...mockUser, name: 'Updated Name' };
      const action = updateUserData.fulfilled(updatedUser, 'requestId', updateData);
      const result = authReducer(initialState, action);
      expect(result.isLoading).toBe(false);
      expect(result.user).toEqual(updatedUser);
    });

    it('should handle updateUserData.rejected', () => {
      const error = 'Update failed';
      const action = updateUserData.rejected(
        new Error(error),
        'requestId',
        updateData,
        error
      );
      const result = authReducer(initialState, action);
      expect(result.isLoading).toBe(false);
      expect(result.error).toBe(error);
    });
  });

  describe('State persistence across actions', () => {
    it('should maintain state correctly through multiple actions', () => {
      let state = initialState;

      // Login pending
      state = authReducer(
        state,
        loginUser.pending('req1', { email: 't@t.com', password: '123' })
      );
      expect(state.isLoading).toBe(true);

      // Login fulfilled
      state = authReducer(
        state,
        loginUser.fulfilled(mockUser, 'req1', { email: 't@t.com', password: '123' })
      );
      expect(state.isLoading).toBe(false);
      expect(state.user).toEqual(mockUser);
      expect(state.isAuth).toBe(true);

      // Clear error
      state = authReducer({ ...state, error: 'test' }, clearError());
      expect(state.error).toBeNull();
      expect(state.user).toEqual(mockUser);
    });
  });
});
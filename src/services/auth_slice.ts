import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { authApi } from '@utils/api';
import { getToken, removeToken, setToken } from './auth_utils.js';

// src/services/auth_slice.ts
import type { PayloadAction } from '@reduxjs/toolkit';

// ==================== ТИПЫ ====================
interface User {
  name: string;
  email: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isAuth: boolean;
  isCheckAuthStarted: boolean;
}

interface LoginData {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
}

interface UpdateUserData {
  name: string;
  email: string;
  password?: string;
}

interface ApiError {
  message: string;
  status?: number;
}

// ==================== КОНСТАНТЫ ====================
const ERROR_MESSAGES = {
  LOGIN_FAILED: 'Ошибка входа',
  REGISTER_FAILED: 'Ошибка регистрации',
  LOGOUT_FAILED: 'Выход не удался',
  UNAUTHORIZED: 'Не авторизован',
  UPDATE_FAILED: 'Не удалось обновить данные',
  SESSION_EXPIRED: 'Сессия истекла',
  AUTH_CHECK_FAILED: 'Auth check failed',
} as const;

// Логирование только в development
const log = process.env.NODE_ENV === 'development' ? console.log : (): void => {};
const logError = process.env.NODE_ENV === 'development' ? console.error : (): void => {};

// ==================== НАЧАЛЬНОЕ СОСТОЯНИЕ ====================
const initialState: AuthState = {
  user: null,
  isLoading: false,
  error: null,
  isAuth: false,
  isCheckAuthStarted: false,
};

// ==================== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ====================
const getAuthHeaders = (): { Authorization?: string } => {
  const { accessToken } = getToken();
  return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
};

const getErrorMessage = (err: unknown, defaultMessage: string): string => {
  if (err instanceof Error) {
    return err.message || defaultMessage;
  }
  
  if (typeof err === 'string') {
    return err;
  }
  
  if (err && typeof err === 'object' && 'message' in err && typeof err.message === 'string') {
    return err.message;
  }
  
  return defaultMessage;
};

const isUnauthorizedError = (err: unknown): boolean => {
  if (err instanceof Error) {
    return err.message?.includes('401') || err.message?.includes('Unauthorized');
  }
  return false;
};

// ==================== ASYNC THUNKS ====================

/**
 * Вход пользователя
 */
export const loginUser = createAsyncThunk<User, LoginData, { rejectValue: string }>(
  'auth/loginUser',
  async ({ email, password }, { rejectWithValue, dispatch }): Promise<User> => {
    try {
      log('[auth_slice] loginUser: starting login process');
      const data = await authApi.login({ email, password });
      
      log('[auth_slice] loginUser: received tokens, setting and fetching user data...');
      setToken(data.accessToken, data.refreshToken);
      
      await dispatch(getUserData());
      log('[auth_slice] loginUser: successful, returning user data');
      
      return data.user;
    } catch (err) {
      const message = getErrorMessage(err, ERROR_MESSAGES.LOGIN_FAILED);
      logError('[auth_slice] loginUser: failed', message);
      return rejectWithValue(message);
    }
  }
);

/**
 * Регистрация пользователя
 */
export const registerUser = createAsyncThunk<User, RegisterData, { rejectValue: string }>(
  'auth/registerUser',
  async ({ email, password, name }, { rejectWithValue, dispatch }): Promise<User> => {
    try {
      log('[auth_slice] registerUser: starting registration process');
      const data = await authApi.register({ email, password, name });
      
      log('[auth_slice] registerUser: received tokens, setting and fetching user data...');
      setToken(data.accessToken, data.refreshToken);
      
      await dispatch(getUserData());
      log('[auth_slice] registerUser: successful, returning user data');
      
      return data.user;
    } catch (err) {
      const message = getErrorMessage(err, ERROR_MESSAGES.REGISTER_FAILED);
      logError('[auth_slice] registerUser: failed', message);
      return rejectWithValue(message);
    }
  }
);

/**
 * Выход пользователя
 */
export const logoutUser = createAsyncThunk<void, void, { rejectValue: string }>(
  'auth/logoutUser',
  async (_, { rejectWithValue }): Promise<void> => {
    try {
      const { refreshToken } = getToken();
      log('[auth_slice] logoutUser: calling API logout with refreshToken...');
      
      if (refreshToken) {
        await authApi.logout({ token: refreshToken });
      }
      
      log('[auth_slice] logoutUser: API call successful');
    } catch (err) {
      const message = getErrorMessage(err, ERROR_MESSAGES.LOGOUT_FAILED);
      logError('[auth_slice] logoutUser: API call failed', message);
      return rejectWithValue(message);
    } finally {
      // Всегда удаляем токены, даже если API запрос не удался
      removeToken();
      log('[auth_slice] logoutUser: tokens removed');
    }
  }
);

/**
 * Проверка авторизации при загрузке приложения
 */
export const checkAuth = createAsyncThunk<boolean, void, { rejectValue: string }>(
  'auth/checkAuth',
  async (_, { dispatch, rejectWithValue }): Promise<boolean> => {
    try {
      const { accessToken } = getToken();
      log('[auth_slice] checkAuth: starting, token exists?', !!accessToken);
      
      if (!accessToken) {
        log('[auth_slice] checkAuth: no token, returning false');
        return false;
      }
      
      log('[auth_slice] checkAuth: token exists, dispatching getUserData...');
      const resultAction = await dispatch(getUserData());
      
      if (getUserData.fulfilled.match(resultAction)) {
        log('[auth_slice] checkAuth: getUserData successful, returning true');
        return true;
      } else {
        const errorPayload = resultAction.payload;
        const errorMessage = typeof errorPayload === 'string' 
          ? errorPayload 
          : ERROR_MESSAGES.AUTH_CHECK_FAILED;
        throw new Error(errorMessage);
      }
    } catch (err) {
      const message = getErrorMessage(err, ERROR_MESSAGES.UNAUTHORIZED);
      logError('[auth_slice] checkAuth: error during check or getUserData:', message);
      removeToken();
      log('[auth_slice] checkAuth: token removed due to error');
      return rejectWithValue(message);
    }
  }
);

/**
 * Обновление токена
 */
export const refreshUserToken = createAsyncThunk<boolean, void, { rejectValue: string }>(
  'auth/refreshUserToken',
  async (_, { rejectWithValue, dispatch }): Promise<boolean> => {
    try {
      const { refreshToken } = getToken();
      log('[auth_slice] refreshUserToken: starting with refreshToken exists?', !!refreshToken);
      
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }
      
      const data = await authApi.refreshToken({ token: refreshToken });
      log('[auth_slice] refreshUserToken: API call successful, setting new tokens...');
      
      setToken(data.accessToken, data.refreshToken);
      await dispatch(getUserData());
      
      log('[auth_slice] refreshUserToken: getUserData after refresh successful, returning true');
      return true;
    } catch (err) {
      const message = getErrorMessage(err, ERROR_MESSAGES.SESSION_EXPIRED);
      logError('[auth_slice] refreshUserToken: failed', message);
      removeToken();
      return rejectWithValue(message);
    }
  }
);

/**
 * Получение данных пользователя
 */
export const getUserData = createAsyncThunk<User, void, { rejectValue: string }>(
  'auth/getUserData',
  async (_, { rejectWithValue }): Promise<User> => {
    try {
      const headers = getAuthHeaders();
      log('[auth_slice] getUserData: attempting to fetch user data with headers.Authorization?', !!headers.Authorization);
      
      if (!headers.Authorization) {
        throw new Error('No authorization token');
      }
      
      const data = await authApi.getUser(headers.Authorization);
      log('[auth_slice] getUserData: successful, returning user data');
      
      return data.user;
    } catch (err) {
      const message = getErrorMessage(err, ERROR_MESSAGES.UNAUTHORIZED);
      logError('[auth_slice] getUserData: failed', message);
      
      // Проверяем на 401 ошибку
      if (isUnauthorizedError(err)) {
        log('[auth_slice] getUserData: 401 detected, removing tokens');
        removeToken();
      }
      
      return rejectWithValue(message);
    }
  }
);

/**
 * Обновление данных пользователя
 */
export const updateUserData = createAsyncThunk<User, UpdateUserData, { rejectValue: string }>(
  'auth/updateUserData',
  async ({ name, email, password }, { rejectWithValue }): Promise<User> => {
    try {
      const headers = getAuthHeaders();
      
      if (!headers.Authorization) {
        throw new Error('No authorization token');
      }

      const payload: { name: string; email: string; password?: string } = { name, email };
      if (password) {
        payload.password = password;
      }

      const data = await authApi.updateUser(payload, headers.Authorization);
      log('[auth_slice] updateUserData: successful, returning user data');
      
      return data.user;
    } catch (err) {
      const message = getErrorMessage(err, ERROR_MESSAGES.UPDATE_FAILED);
      logError('[auth_slice] updateUserData: failed', message);
      return rejectWithValue(message);
    }
  }
);

// ==================== SLICE ====================
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state): void => {
      state.error = null;
    },
    setCheckAuthStarted: (state): void => {
      state.isCheckAuthStarted = true;
    },
    resetCheckAuthStarted: (state): void => {
      state.isCheckAuthStarted = false;
    },
    resetAuth: (state): void => {
      state.user = null;
      state.isAuth = false;
      state.error = null;
      state.isLoading = false;
      state.isCheckAuthStarted = false;
      removeToken();
    },
  },
  extraReducers: (builder) => {
    builder
      // ===== LOGIN =====
      .addCase(loginUser.pending, (state) => {
        log('[auth_slice] Reducer: loginUser.pending');
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<User>) => {
        log('[auth_slice] Reducer: loginUser.fulfilled');
        state.isLoading = false;
        state.user = action.payload;
        state.isAuth = true;
      })
      .addCase(loginUser.rejected, (state, action: PayloadAction<string | undefined>) => {
        log('[auth_slice] Reducer: loginUser.rejected');
        state.isLoading = false;
        state.error = action.payload || ERROR_MESSAGES.LOGIN_FAILED;
        state.isAuth = false;
      })

      // ===== REGISTER =====
      .addCase(registerUser.pending, (state) => {
        log('[auth_slice] Reducer: registerUser.pending');
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action: PayloadAction<User>) => {
        log('[auth_slice] Reducer: registerUser.fulfilled');
        state.isLoading = false;
        state.user = action.payload;
        state.isAuth = true;
      })
      .addCase(registerUser.rejected, (state, action: PayloadAction<string | undefined>) => {
        log('[auth_slice] Reducer: registerUser.rejected');
        state.isLoading = false;
        state.error = action.payload || ERROR_MESSAGES.REGISTER_FAILED;
        state.isAuth = false;
      })

      // ===== LOGOUT =====
      .addCase(logoutUser.pending, (state) => {
        log('[auth_slice] Reducer: logoutUser.pending');
        state.isLoading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        log('[auth_slice] Reducer: logoutUser.fulfilled');
        state.user = null;
        state.isAuth = false;
        state.error = null;
        state.isLoading = false;
        state.isCheckAuthStarted = false;
      })
      .addCase(logoutUser.rejected, (state, action: PayloadAction<string | undefined>) => {
        log('[auth_slice] Reducer: logoutUser.rejected');
        state.error = action.payload || ERROR_MESSAGES.LOGOUT_FAILED;
        state.user = null;
        state.isAuth = false;
        state.isLoading = false;
        state.isCheckAuthStarted = false;
      })

      // ===== CHECK AUTH =====
      .addCase(checkAuth.pending, (state) => {
        log('[auth_slice] Reducer: checkAuth.pending');
        state.isLoading = true;
        state.isCheckAuthStarted = true;
      })
      .addCase(checkAuth.fulfilled, (state, action: PayloadAction<boolean>) => {
        log('[auth_slice] Reducer: checkAuth.fulfilled');
        state.isLoading = false;
        state.isAuth = action.payload;
      })
      .addCase(checkAuth.rejected, (state, action: PayloadAction<string | undefined>) => {
        log('[auth_slice] Reducer: checkAuth.rejected');
        state.isLoading = false;
        state.isAuth = false;
        state.user = null;
        state.error = action.payload || ERROR_MESSAGES.UNAUTHORIZED;
      })

      // ===== GET USER DATA =====
      .addCase(getUserData.fulfilled, (state, action: PayloadAction<User>) => {
        log('[auth_slice] Reducer: getUserData.fulfilled');
        state.user = action.payload;
      })
      .addCase(getUserData.rejected, (state, action: PayloadAction<string | undefined>) => {
        log('[auth_slice] Reducer: getUserData.rejected');
        state.user = null;
        state.error = action.payload || ERROR_MESSAGES.UNAUTHORIZED;
      })

      // ===== REFRESH TOKEN =====
      .addCase(refreshUserToken.pending, (state) => {
        log('[auth_slice] Reducer: refreshUserToken.pending');
        state.isLoading = true;
      })
      .addCase(refreshUserToken.fulfilled, (state) => {
        log('[auth_slice] Reducer: refreshUserToken.fulfilled');
        state.isLoading = false;
      })
      .addCase(refreshUserToken.rejected, (state, action: PayloadAction<string | undefined>) => {
        log('[auth_slice] Reducer: refreshUserToken.rejected');
        state.isLoading = false;
        state.error = action.payload || ERROR_MESSAGES.SESSION_EXPIRED;
        state.isAuth = false;
        state.user = null;
        // Токены уже удалены в thunk
      })

      // ===== UPDATE USER DATA =====
      .addCase(updateUserData.pending, (state) => {
        log('[auth_slice] Reducer: updateUserData.pending');
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUserData.fulfilled, (state, action: PayloadAction<User>) => {
        log('[auth_slice] Reducer: updateUserData.fulfilled');
        state.isLoading = false;
        state.user = action.payload;
      })
      .addCase(updateUserData.rejected, (state, action: PayloadAction<string | undefined>) => {
        log('[auth_slice] Reducer: updateUserData.rejected');
        state.isLoading = false;
        state.error = action.payload || ERROR_MESSAGES.UPDATE_FAILED;
      });
  },
});

// ==================== EXPORTS ====================
export const { 
  clearError, 
  setCheckAuthStarted, 
  resetCheckAuthStarted,
  resetAuth 
} = authSlice.actions;

export default authSlice.reducer;
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { authApi } from '@utils/api';

import { getToken, removeToken, setToken } from './auth_utils.ts';

// src/services/auth_slice.ts
import type { PayloadAction } from '@reduxjs/toolkit';

type User = {
  name: string;
  email: string;
  // Добавь другие поля, если есть
};

type AuthState = {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isAuth: boolean;
  isCheckAuthStarted: boolean;
};

const initialState: AuthState = {
  user: null,
  isLoading: false,
  error: null,
  isAuth: false,
  isCheckAuthStarted: false,
};

const getAuthHeaders = () => {
  const { accessToken } = getToken();
  return accessToken ? { Authorization: accessToken } : {};
};

type LoginData = {
  email: string;
  password: string;
};

export const loginUser = createAsyncThunk<User, LoginData, { rejectValue: string }>(
  'auth/loginUser',
  async ({ email, password }, { rejectWithValue, dispatch }) => {
    try {
      const data = await authApi.login({ email, password });
      console.log(
        '[auth_slice] loginUser: received tokens, setting and fetching user data...'
      );
      setToken(data.accessToken, data.refreshToken);
      await dispatch(getUserData());
      console.log('[auth_slice] loginUser: successful, returning user data');
      return data.user;
    } catch (err: any) {
      console.error('[auth_slice] loginUser: failed', err.message);
      return rejectWithValue(err.message || 'Ошибка входа');
    }
  }
);

type RegisterData = {
  email: string;
  password: string;
  name: string;
};

export const registerUser = createAsyncThunk<
  User,
  RegisterData,
  { rejectValue: string }
>(
  'auth/registerUser',
  async ({ email, password, name }, { rejectWithValue, dispatch }) => {
    try {
      const data = await authApi.register({ email, password, name });
      console.log(
        '[auth_slice] registerUser: received tokens, setting and fetching user data...'
      );
      setToken(data.accessToken, data.refreshToken);
      await dispatch(getUserData());
      console.log('[auth_slice] registerUser: successful, returning user data');
      return data.user;
    } catch (err: any) {
      console.error('[auth_slice] registerUser: failed', err.message);
      return rejectWithValue(err.message || 'Ошибка регистрации');
    }
  }
);

export const logoutUser = createAsyncThunk<void, void, { rejectValue: string }>(
  'auth/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      const { refreshToken } = getToken();
      console.log('[auth_slice] logoutUser: calling API logout with refreshToken...');
      await authApi.logout({ token: refreshToken });
      console.log('[auth_slice] logoutUser: API call successful, removing tokens...');
      removeToken();
      console.log('[auth_slice] logoutUser: tokens removed, returning null');
    } catch (err: any) {
      console.error(
        '[auth_slice] logoutUser: failed or error during API call, removing tokens anyway...',
        err.message
      );
      removeToken();
      return rejectWithValue(err.message || 'Выход не удался');
    }
  }
);

export const checkAuth = createAsyncThunk<boolean, void, { rejectValue: string }>(
  'auth/checkAuth',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const { accessToken } = getToken();
      console.log('[auth_slice] checkAuth: starting, token exists?', !!accessToken);
      if (!accessToken) {
        console.log('[auth_slice] checkAuth: no token, returning false');
        return false;
      }
      console.log('[auth_slice] checkAuth: token exists, dispatching getUserData...');
      const resultAction = await dispatch(getUserData());
      if (getUserData.fulfilled.match(resultAction)) {
        console.log('[auth_slice] checkAuth: getUserData successful, returning true');
        return true;
      } else {
        console.log(
          '[auth_slice] checkAuth: getUserData failed (rejected match), throwing error'
        );
        throw new Error(
          resultAction.payload || 'Failed to get user data during checkAuth'
        );
      }
    } catch (error: any) {
      console.error(
        '[auth_slice] checkAuth: error during check or getUserData:',
        error.message
      );
      removeToken();
      console.log(
        '[auth_slice] checkAuth: token removed due to error, rejecting with message'
      );
      return rejectWithValue(error.message || 'Auth check failed');
    }
  }
);

export const refreshUserToken = createAsyncThunk<boolean, void, { rejectValue: string }>(
  'auth/refreshUserToken',
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const { refreshToken } = getToken();
      console.log(
        '[auth_slice] refreshUserToken: starting with refreshToken exists?',
        !!refreshToken
      );
      const data = await authApi.refreshToken({ token: refreshToken });
      console.log(
        '[auth_slice] refreshUserToken: API call successful, setting new tokens...'
      );
      setToken(data.accessToken, data.refreshToken);
      await dispatch(getUserData());
      console.log(
        '[auth_slice] refreshUserToken: getUserData after refresh successful, returning true'
      );
      return true;
    } catch (err: any) {
      console.error('[auth_slice] refreshUserToken: failed', err.message);
      removeToken();
      return rejectWithValue(err.message || 'Сессия истекла');
    }
  }
);

export const getUserData = createAsyncThunk<User, void, { rejectValue: string }>(
  'auth/getUserData',
  async (_, { rejectWithValue }) => {
    try {
      const headers = getAuthHeaders();
      console.log(
        '[auth_slice] getUserData: attempting to fetch user data with headers.Authorization?',
        !!headers.Authorization
      );
      const data = await authApi.getUser(headers.Authorization);
      console.log('[auth_slice] getUserData: successful, returning user data');
      return data.user;
    } catch (err: any) {
      console.error('[auth_slice] getUserData: failed', err.message);
      if (err.message?.includes('401') || err.message?.includes('Unauthorized')) {
        console.log('[auth_slice] getUserData: 401 detected, removing tokens');
        removeToken();
      }
      return rejectWithValue(err.message || 'Не авторизован');
    }
  }
);

type UpdateUserData = {
  name: string;
  email: string;
  password?: string;
};

export const updateUserData = createAsyncThunk<
  User,
  UpdateUserData,
  { rejectValue: string }
>('auth/updateUserData', async ({ name, email, password }, { rejectWithValue }) => {
  try {
    const headers = getAuthHeaders();

    const payload = { name, email };
    if (password) payload.password = password;

    const data = await authApi.updateUser(payload, headers.Authorization);
    console.log('[auth_slice] updateUserData: successful, returning user data');
    return data.user;
  } catch (err: any) {
    console.error('[auth_slice] updateUserData: failed', err.message);
    return rejectWithValue(err.message || 'Не удалось обновить данные');
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },

    setCheckAuthStarted: (state) => {
      state.isCheckAuthStarted = true;
    },
  },
  extraReducers: (builder) => {
    builder

      .addCase(loginUser.pending, (state) => {
        console.log(
          '[auth_slice] Reducer: loginUser.pending - isLoading true, error null'
        );
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<User>) => {
        console.log(
          '[auth_slice] Reducer: loginUser.fulfilled - isLoading false, user set, isAuth true'
        );
        state.isLoading = false;
        state.user = action.payload;
        state.isAuth = true;
      })
      .addCase(
        loginUser.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          console.log(
            '[auth_slice] Reducer: loginUser.rejected - isLoading false, error set, isAuth false'
          );
          state.isLoading = false;
          state.error = action.payload || null;
          state.isAuth = false;
        }
      )

      .addCase(registerUser.pending, (state) => {
        console.log(
          '[auth_slice] Reducer: registerUser.pending - isLoading true, error null'
        );
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action: PayloadAction<User>) => {
        console.log(
          '[auth_slice] Reducer: registerUser.fulfilled - isLoading false, user set, isAuth true'
        );
        state.isLoading = false;
        state.user = action.payload;
        state.isAuth = true;
      })
      .addCase(
        registerUser.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          console.log(
            '[auth_slice] Reducer: registerUser.rejected - isLoading false, error set, isAuth false'
          );
          state.isLoading = false;
          state.error = action.payload || null;
          state.isAuth = false;
        }
      )

      .addCase(logoutUser.fulfilled, (state) => {
        console.log(
          '[auth_slice] Reducer: logoutUser.fulfilled - user null, isAuth false, error null, isLoading false'
        );
        state.user = null;
        state.isAuth = false;
        state.error = null;
        state.isLoading = false;
      })
      .addCase(
        logoutUser.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          console.log(
            '[auth_slice] Reducer: logoutUser.rejected - error set, user null, isAuth false, isLoading false'
          );
          state.error = action.payload || null;
          state.user = null;
          state.isAuth = false;
          state.isLoading = false;
        }
      )

      .addCase(checkAuth.pending, (state) => {
        console.log(
          '[auth_slice] Reducer: checkAuth.pending - isLoading true, isCheckAuthStarted true'
        );
        state.isLoading = true;
        state.isCheckAuthStarted = true;
      })
      .addCase(checkAuth.fulfilled, (state, action: PayloadAction<boolean>) => {
        console.log(
          '[auth_slice] Reducer: checkAuth.fulfilled - isLoading false, isAuth set to',
          action.payload
        );
        state.isLoading = false;
        state.isAuth = action.payload;
      })
      .addCase(
        checkAuth.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          console.log(
            '[auth_slice] Reducer: checkAuth.rejected - isLoading false, isAuth false, error set'
          );
          state.isLoading = false;
          state.isAuth = false;
          state.user = null;
          state.error = action.payload || null;
        }
      )

      .addCase(getUserData.fulfilled, (state, action: PayloadAction<User>) => {
        console.log(
          '[auth_slice] Reducer: getUserData.fulfilled - user set. isLoading/isAuth managed by checkAuth.'
        );
        state.user = action.payload;
      })
      .addCase(
        getUserData.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          console.log(
            '[auth_slice] Reducer: getUserData.rejected - user cleared, error set. isLoading/isAuth managed by checkAuth.'
          );
          state.user = null;
          state.error = action.payload || null;
        }
      )

      .addCase(
        refreshUserToken.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          console.log(
            '[auth_slice] Reducer: refreshUserToken.rejected - isLoading false, error set, isAuth false, user null, tokens removed'
          );
          state.isLoading = false;
          state.error = action.payload || null;
          state.isAuth = false;
          state.user = null;
          removeToken();
        }
      )

      .addCase(updateUserData.pending, (state) => {
        console.log(
          '[auth_slice] Reducer: updateUserData.pending - isLoading true, error null'
        );
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUserData.fulfilled, (state, action: PayloadAction<User>) => {
        console.log(
          '[auth_slice] Reducer: updateUserData.fulfilled - isLoading false, user set'
        );
        state.isLoading = false;
        state.user = action.payload;
      })
      .addCase(
        updateUserData.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          console.log(
            '[auth_slice] Reducer: updateUserData.rejected - isLoading false, error set'
          );
          state.isLoading = false;
          state.error = action.payload || null;
        }
      );
  },
});

export const { clearError, setCheckAuthStarted } = authSlice.actions;

export default authSlice.reducer;
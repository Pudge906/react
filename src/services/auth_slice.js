import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { authApi } from '../utils/api';
import { getToken, removeToken, setToken } from './auth_utils.js';

const initialState = {
  user: null,
  isLoading: false,
  error: null,
  isAuth: false,
};

const getAuthHeaders = () => {
  const { accessToken } = getToken();
  return accessToken ? { Authorization: accessToken } : {};
};

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ email, password }, { rejectWithValue, dispatch }) => {
    try {
      const data = await authApi.login({ email, password });

      setToken(data.accessToken, data.refreshToken);
      await dispatch(getUserData());
      return data.user;
    } catch (err) {
      return rejectWithValue(err.message || 'Ошибка входа');
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async ({ email, password, name }, { rejectWithValue, dispatch }) => {
    try {
      const data = await authApi.register({ email, password, name });
      setToken(data.accessToken, data.refreshToken);
      await dispatch(getUserData());
      return data.user;
    } catch (err) {
      return rejectWithValue(err.message || 'Ошибка регистрации');
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      const { refreshToken } = getToken();
      await authApi.logout({ token: refreshToken });
      removeToken();
      return null;
    } catch (err) {
      removeToken();
      return rejectWithValue(err.message || 'Выход не удался');
    }
  }
);

export const checkAuth = createAsyncThunk('auth/checkAuth', async (_, { dispatch }) => {
  try {
    const { accessToken } = getToken();
    if (!accessToken) return false;
    await dispatch(getUserData());
    return true;
  } catch {
    removeToken();
    return false;
  }
});

export const refreshUserToken = createAsyncThunk(
  'auth/refreshUserToken',
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const { refreshToken } = getToken();
      const data = await authApi.refreshToken({ token: refreshToken });
      setToken(data.accessToken, data.refreshToken);
      await dispatch(getUserData());
      return true;
    } catch (err) {
      removeToken();
      return rejectWithValue(err.message || 'Сессия истекла');
    }
  }
);

export const getUserData = createAsyncThunk(
  'auth/getUserData',
  async (_, { rejectWithValue }) => {
    try {
      const headers = getAuthHeaders();
      const data = await authApi.getUser(headers.Authorization);
      return data.user;
    } catch (err) {
      if (err.message?.includes('401') || err.message?.includes('Unauthorized')) {
        removeToken();
      }
      return rejectWithValue(err.message || 'Не авторизован');
    }
  }
);

export const updateUserData = createAsyncThunk(
  'auth/updateUserData',
  async ({ name, email, password }, { rejectWithValue }) => {
    try {
      const headers = getAuthHeaders();

      const payload = { name, email };
      if (password) payload.password = password;

      const data = await authApi.updateUser(payload, headers.Authorization);
      return data.user;
    } catch (err) {
      return rejectWithValue(err.message || 'Не удалось обновить данные');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder

      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuth = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.isAuth = false;
      })

      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuth = true;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.isAuth = false;
      })

      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuth = false;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.error = action.payload;

        state.user = null;
        state.isAuth = false;
      })

      .addCase(checkAuth.fulfilled, (state, action) => {
        state.isAuth = action.payload;
      })
      .addCase(checkAuth.rejected, (state) => {
        state.isAuth = false;
        state.user = null;
      })

      .addCase(refreshUserToken.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.isAuth = false;
        state.user = null;
        removeToken();
      })

      .addCase(getUserData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getUserData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuth = true;
      })
      .addCase(getUserData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.isAuth = false;
        state.user = null;
      })

      .addCase(updateUserData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUserData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
      })
      .addCase(updateUserData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = authSlice.actions;

export default authSlice.reducer;

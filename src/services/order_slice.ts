import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { request } from '@utils/api';

import { clearConstructor } from './constructor_slice';

// src/services/order_slice.ts
import type { PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from './store';

// ==================== ТИПЫ ====================
interface User {
  accessToken?: string;
}

interface AuthState {
  user: User | null;
}

interface Order {
  _id: string;
  number: number;
  name?: string;
  ingredients?: string[];
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface OrderState {
  currentOrder: Order | null;
  orderNumber: number | null;
  loading: boolean;
  error: string | null;
  success: boolean;
  isModalOpen: boolean;
}

interface OrderResponse {
  order: Order;
  success: boolean;
  name?: string;
}

// ==================== НАЧАЛЬНОЕ СОСТОЯНИЕ ====================
const initialState: OrderState = {
  currentOrder: null,
  orderNumber: null,
  loading: false,
  error: null,
  success: false,
  isModalOpen: false,
};

// ==================== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ====================
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

// ==================== ASYNC THUNKS ====================
export const createOrder = createAsyncThunk<
  Order,
  string[],
  { rejectValue: string; state: RootState }
>('order/create', async (ingredientIds: string[], { rejectWithValue, getState, dispatch }): Promise<Order> => {
  try {
    const state = getState();
    const token = (state.auth as AuthState).user?.accessToken;

    const response = await request('/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ ingredients: ingredientIds }),
    }) as OrderResponse;

    dispatch(clearConstructor());

    return response.order;
  } catch (err: unknown) {
    const message = getErrorMessage(err, 'Неизвестная ошибка при создании заказа');
    return rejectWithValue(message);
  }
});

// ==================== SLICE ====================
const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    clearOrder: (state): void => {
      state.currentOrder = null;
      state.orderNumber = null;
      state.error = null;
      state.success = false;
    },
    openOrderModal: (state): void => {
      state.isModalOpen = true;
    },
    closeOrderModal: (state): void => {
      state.isModalOpen = false;
    },
    clearOrderError: (state): void => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createOrder.fulfilled, (state, action: PayloadAction<Order>) => {
        state.loading = false;
        state.currentOrder = action.payload;
        state.orderNumber = action.payload.number;
        state.success = true;
        state.isModalOpen = true;
      })
      .addCase(
        createOrder.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          state.loading = false;
          state.error = action.payload || 'Неизвестная ошибка';
          state.success = false;
        }
      );
  },
});

// ==================== EXPORTS ====================
export const { clearOrder, openOrderModal, closeOrderModal, clearOrderError } =
  orderSlice.actions;

export default orderSlice.reducer;
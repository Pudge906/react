import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { request } from '@utils/api';

import { clearConstructor } from './constructor_slice';

// src/services/order_slice.ts
import type { PayloadAction } from '@reduxjs/toolkit';

type User = {
  accessToken?: string;
};

type AuthState = {
  user: User | null;
};

type RootState = {
  auth: AuthState;
};

type Ingredient = {
  _id: string;
  [key: string]: any;
};

type Order = {
  _id: string;
  number: number;
  [key: string]: any;
};

type OrderState = {
  currentOrder: Order | null;
  orderNumber: number | null;
  loading: boolean;
  error: string | null;
  success: boolean;
  isModalOpen: boolean;
};

export const createOrder = createAsyncThunk<
  Order,
  string[],
  { rejectValue: string; state: RootState }
>('order/create', async (ingredientIds, { rejectWithValue, getState, dispatch }) => {
  try {
    const state = getState();
    const token = state.auth.user?.accessToken;

    const response = await request('/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
      },
      body: JSON.stringify({ ingredients: ingredientIds }),
    });

    dispatch(clearConstructor());

    return response.order;
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

const initialState: OrderState = {
  currentOrder: null,
  orderNumber: null,
  loading: false,
  error: null,
  success: false,
  isModalOpen: false,
};

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    clearOrder: (state) => {
      state.currentOrder = null;
      state.orderNumber = null;
      state.error = null;
      state.success = false;
    },
    openOrderModal: (state) => {
      state.isModalOpen = true;
    },
    closeOrderModal: (state) => {
      state.isModalOpen = false;
    },
    clearOrderError: (state) => {
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

export const { clearOrder, openOrderModal, closeOrderModal, clearOrderError } =
  orderSlice.actions;

export default orderSlice.reducer;
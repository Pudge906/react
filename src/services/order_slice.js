import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { request } from '../utils/api.js';
import { clearConstructor } from './constructor_slice.js';

export const createOrder = createAsyncThunk(
  'order/create',
  async (ingredientIds, { rejectWithValue, getState, dispatch }) => {
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
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  currentOrder: null,
  orderNumber: null,
  loading: false,
  error: null,
  success: false,
  isModalOpen: false,
};

const order_slice = createSlice({
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
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrder = action.payload;
        state.orderNumber = action.payload.number;
        state.success = true;
        state.isModalOpen = true;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      });
  },
});

export const { clearOrder, openOrderModal, closeOrderModal, clearOrderError } =
  order_slice.actions;

export default order_slice.reducer;

import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { checkResponse } from '../utils/api-utils';
import { BASE_URL } from '../utils/conts'; // Импортируем BASE_URL

export const createOrder = createAsyncThunk(
  'order/create',
  async (ingredientIds, { rejectWithValue }) => {
    try {
      const response = await fetch(`${BASE_URL}/orders`, {
        // Используем BASE_URL
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ingredients: ingredientIds }),
      });

      const data = await checkResponse(response);

      if (!data.success) {
        throw new Error('Ошибка API');
      }

      return data.order;
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
  orderSlice.actions;

export default orderSlice.reducer;

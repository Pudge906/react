import { createSlice } from '@reduxjs/toolkit';

// src/services/order_feed_slice.ts
import type { PayloadAction } from '@reduxjs/toolkit';

import type { Order, OrdersWsResponse } from '../types/order';

type OrderFeedState = {
  wsConnected: boolean;
  orders: Order[];
  total: number;
  totalToday: number;
  error?: string;
};

const initialState: OrderFeedState = {
  wsConnected: false,
  orders: [],
  total: 0,
  totalToday: 0,
  error: undefined,
};

const orderFeedSlice = createSlice({
  name: '@@ws/order-feed',
  initialState,
  reducers: {
    wsConnecting: (state) => {
      state.wsConnected = false;
      state.error = undefined;
    },
    wsOpen: (state) => {
      state.wsConnected = true;
      state.error = undefined;
    },
    wsClose: (state) => {
      state.wsConnected = false;
    },
    wsMessage: (state, action: PayloadAction<OrdersWsResponse>) => {
      const { orders, total, totalToday } = action.payload;

      // Валидация: пропускаем некорректные заказы
      const validOrders = orders.filter((order) => {
        return (
          order._id &&
          order.number &&
          order.ingredients &&
          Array.isArray(order.ingredients)
        );
      });

      state.orders = validOrders;
      state.total = total;
      state.totalToday = totalToday;
    },
    wsError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.wsConnected = false;
    },
  },
});

export default orderFeedSlice.reducer;
export const { wsConnecting, wsOpen, wsClose, wsMessage, wsError } =
  orderFeedSlice.actions;
// order_feed_slice.test.ts
import { describe, expect, it } from 'vitest';

import orderFeedReducer, {
  wsClose,
  wsConnecting,
  wsError,
  wsMessage,
  wsOpen,
} from './order_feed_slice';

import type { Order, OrdersWsResponse } from '../types/order';
import type { OrderFeedState } from './order_feed_slice';

describe('Order Feed Slice (WebSocket)', () => {
  const mockOrder: Order = {
    _id: 'order-123',
    number: 12345,
    status: 'done',
    name: 'Бургер №12345',
    createdAt: '2024-01-01T12:00:00.000Z',
    updatedAt: '2024-01-01T12:05:00.000Z',
    ingredients: ['ing-1', 'ing-2'],
  };

  const mockWsResponse: OrdersWsResponse = {
    orders: [mockOrder],
    total: 150,
    totalToday: 25,
  };

  const initialState: OrderFeedState = {
    wsConnected: false,
    orders: [],
    total: 0,
    totalToday: 0,
    error: undefined,
  };

  describe('Initial state', () => {
    it('should return initial state when undefined state passed', () => {
      const result = orderFeedReducer(undefined, { type: 'UNKNOWN' });
      expect(result).toEqual(initialState);
    });
  });

  describe('wsConnecting', () => {
    it('should set wsConnected to false and clear error', () => {
      const stateWithError: OrderFeedState = {
        ...initialState,
        wsConnected: true,
        error: 'Previous error',
      };

      const result = orderFeedReducer(stateWithError, wsConnecting());

      expect(result.wsConnected).toBe(false);
      expect(result.error).toBeUndefined();
      expect(result.orders).toEqual([]); // unchanged
    });

    it('should handle when already connecting', () => {
      const result = orderFeedReducer(initialState, wsConnecting());
      expect(result.wsConnected).toBe(false);
      expect(result.error).toBeUndefined();
    });
  });

  describe('wsOpen', () => {
    it('should set wsConnected to true and clear error', () => {
      const stateWithError: OrderFeedState = {
        ...initialState,
        error: 'Connection failed',
      };

      const result = orderFeedReducer(stateWithError, wsOpen());

      expect(result.wsConnected).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should handle when already connected', () => {
      const connectedState: OrderFeedState = {
        ...initialState,
        wsConnected: true,
        orders: [mockOrder],
      };

      const result = orderFeedReducer(connectedState, wsOpen());

      expect(result.wsConnected).toBe(true);
      expect(result.orders).toEqual([mockOrder]); // unchanged
    });
  });

  describe('wsClose', () => {
    it('should set wsConnected to false', () => {
      const connectedState: OrderFeedState = {
        ...initialState,
        wsConnected: true,
        orders: [mockOrder],
        total: 100,
      };

      const result = orderFeedReducer(connectedState, wsClose());

      expect(result.wsConnected).toBe(false);
      expect(result.orders).toEqual([mockOrder]); // data preserved
      expect(result.total).toBe(100);
    });

    it('should handle when already disconnected', () => {
      const result = orderFeedReducer(initialState, wsClose());
      expect(result.wsConnected).toBe(false);
    });

    it('should not clear error on close', () => {
      const stateWithError: OrderFeedState = {
        ...initialState,
        error: 'Some error',
      };

      const result = orderFeedReducer(stateWithError, wsClose());

      expect(result.wsConnected).toBe(false);
      expect(result.error).toBe('Some error'); // preserved
    });
  });

  describe('wsMessage', () => {
    it('should update orders, total and totalToday from valid payload', () => {
      const result = orderFeedReducer(initialState, wsMessage(mockWsResponse));

      expect(result.orders).toEqual([mockOrder]);
      expect(result.total).toBe(150);
      expect(result.totalToday).toBe(25);
      expect(result.wsConnected).toBe(false); // unchanged
      expect(result.error).toBeUndefined();
    });

    it('should filter out invalid orders (missing _id)', () => {
      const responseWithInvalid: OrdersWsResponse = {
        orders: [
          mockOrder,
          {
            _id: '',
            number: 999,
            status: 'pending',
            name: 'Invalid',
            createdAt: '',
            updatedAt: '',
            ingredients: [],
          } as Order,
        ],
        total: 200,
        totalToday: 30,
      };

      const result = orderFeedReducer(initialState, wsMessage(responseWithInvalid));

      expect(result.orders).toEqual([mockOrder]); // only valid order
      expect(result.total).toBe(200);
    });

    it('should filter out invalid orders (missing number)', () => {
      const responseWithInvalid: OrdersWsResponse = {
        orders: [
          mockOrder,
          {
            _id: 'bad',
            number: undefined as any,
            status: 'pending',
            name: 'Invalid',
            createdAt: '',
            updatedAt: '',
            ingredients: [],
          } as Order,
        ],
        total: 200,
        totalToday: 30,
      };

      const result = orderFeedReducer(initialState, wsMessage(responseWithInvalid));

      expect(result.orders).toEqual([mockOrder]);
    });

    it('should filter out invalid orders (missing ingredients array)', () => {
      const responseWithInvalid: OrdersWsResponse = {
        orders: [
          mockOrder,
          {
            _id: 'bad',
            number: 111,
            status: 'pending',
            name: 'Invalid',
            createdAt: '',
            updatedAt: '',
            ingredients: undefined as any,
          } as Order,
        ],
        total: 200,
        totalToday: 30,
      };

      const result = orderFeedReducer(initialState, wsMessage(responseWithInvalid));

      expect(result.orders).toEqual([mockOrder]);
    });

    it('should handle empty orders array', () => {
      const emptyResponse: OrdersWsResponse = {
        orders: [],
        total: 0,
        totalToday: 0,
      };

      const result = orderFeedReducer(initialState, wsMessage(emptyResponse));

      expect(result.orders).toHaveLength(0);
      expect(result.total).toBe(0);
      expect(result.totalToday).toBe(0);
    });

    it('should replace existing orders with new data', () => {
      const oldState: OrderFeedState = {
        ...initialState,
        orders: [{ ...mockOrder, _id: 'old', number: 999 }],
        total: 999,
      };

      const result = orderFeedReducer(oldState, wsMessage(mockWsResponse));

      expect(result.orders).toEqual([mockOrder]); // replaced
      expect(result.total).toBe(150);
    });

    it('should handle multiple valid orders', () => {
      const orders: Order[] = [
        { ...mockOrder, _id: 'o1', number: 1 },
        { ...mockOrder, _id: 'o2', number: 2 },
        { ...mockOrder, _id: 'o3', number: 3 },
      ];

      const response: OrdersWsResponse = {
        orders,
        total: 300,
        totalToday: 50,
      };

      const result = orderFeedReducer(initialState, wsMessage(response));

      expect(result.orders).toHaveLength(3);
      expect(result.orders.map((o) => o.number)).toEqual([1, 2, 3]);
      expect(result.total).toBe(300);
    });
  });

  describe('wsError', () => {
    it('should set error message and disconnect', () => {
      const connectedState: OrderFeedState = {
        ...initialState,
        wsConnected: true,
      };

      const result = orderFeedReducer(connectedState, wsError('WebSocket failed'));

      expect(result.error).toBe('WebSocket failed');
      expect(result.wsConnected).toBe(false);
    });

    it('should preserve orders and totals on error', () => {
      const stateWithData: OrderFeedState = {
        ...initialState,
        orders: [mockOrder],
        total: 150,
        totalToday: 25,
        wsConnected: true,
      };

      const result = orderFeedReducer(stateWithData, wsError('Error'));

      expect(result.error).toBe('Error');
      expect(result.wsConnected).toBe(false);
      expect(result.orders).toEqual([mockOrder]); // preserved
      expect(result.total).toBe(150);
    });

    it('should overwrite previous error', () => {
      const stateWithError: OrderFeedState = {
        ...initialState,
        error: 'Old error',
      };

      const result = orderFeedReducer(stateWithError, wsError('New error'));

      expect(result.error).toBe('New error');
    });
  });

  describe('Complex WebSocket lifecycle', () => {
    it('should handle full connection cycle: connecting → open → message → close → error → reconnect', () => {
      let state = initialState;

      // 1. Начинаем подключение
      state = orderFeedReducer(state, wsConnecting());
      expect(state.wsConnected).toBe(false);
      expect(state.error).toBeUndefined();

      // 2. Успешное подключение
      state = orderFeedReducer(state, wsOpen());
      expect(state.wsConnected).toBe(true);

      // 3. Получаем данные
      state = orderFeedReducer(state, wsMessage(mockWsResponse));
      expect(state.orders).toEqual([mockOrder]);
      expect(state.total).toBe(150);

      // 4. Закрываем соединение
      state = orderFeedReducer(state, wsClose());
      expect(state.wsConnected).toBe(false);
      expect(state.orders).toEqual([mockOrder]); // данные сохранены

      // 5. Ошибка при попытке reconnect
      state = orderFeedReducer(state, wsError('Reconnect failed'));
      expect(state.error).toBe('Reconnect failed');
      expect(state.wsConnected).toBe(false);

      // 6. Повторное подключение (очищает ошибку)
      state = orderFeedReducer(state, wsOpen());
      expect(state.wsConnected).toBe(true);
      expect(state.error).toBeUndefined();
    });

    it('should handle rapid connection state changes', () => {
      let state = initialState;

      state = orderFeedReducer(state, wsOpen());
      state = orderFeedReducer(state, wsClose());
      state = orderFeedReducer(state, wsOpen());
      state = orderFeedReducer(state, wsConnecting());
      state = orderFeedReducer(state, wsOpen());

      expect(state.wsConnected).toBe(true);
      expect(state.error).toBeUndefined();
    });

    it('should handle message received while disconnected', () => {
      // Технически маловероятно, но редьюсер должен обработать
      const result = orderFeedReducer(initialState, wsMessage(mockWsResponse));

      expect(result.orders).toEqual([mockOrder]);
      expect(result.total).toBe(150);
      // wsConnected остаётся false (не менялся)
      expect(result.wsConnected).toBe(false);
    });
  });

  describe('Edge cases', () => {
    it('should handle order with minimal required fields', () => {
      const minimalOrder: Order = {
        _id: 'min',
        number: 1,
        status: 'pending',
        name: 'Min',
        createdAt: '',
        updatedAt: '',
        ingredients: [],
      };

      const response: OrdersWsResponse = {
        orders: [minimalOrder],
        total: 10,
        totalToday: 1,
      };

      const result = orderFeedReducer(initialState, wsMessage(response));
      expect(result.orders).toEqual([minimalOrder]);
    });

    it('should handle very large orders list', () => {
      const manyOrders: Order[] = Array.from({ length: 100 }, (_, i) => ({
        ...mockOrder,
        _id: `order-${i}`,
        number: i + 1,
      }));

      const response: OrdersWsResponse = {
        orders: manyOrders,
        total: 10000,
        totalToday: 500,
      };

      const result = orderFeedReducer(initialState, wsMessage(response));
      expect(result.orders).toHaveLength(100);
      expect(result.total).toBe(10000);
    });

    it('should handle zero totals', () => {
      const response: OrdersWsResponse = {
        orders: [],
        total: 0,
        totalToday: 0,
      };

      const result = orderFeedReducer(initialState, wsMessage(response));
      expect(result.total).toBe(0);
      expect(result.totalToday).toBe(0);
    });

    it('should maintain immutability', () => {
      const originalState = { ...initialState };
      const result = orderFeedReducer(originalState, wsMessage(mockWsResponse));

      expect(result).not.toBe(originalState);
      expect(originalState.orders).toHaveLength(0); // original unchanged
    });
  });

  describe('Validation edge cases', () => {
    it('should filter order with null _id', () => {
      const response: OrdersWsResponse = {
        orders: [
          {
            _id: null as any,
            number: 1,
            status: 'pending',
            name: 'Bad',
            createdAt: '',
            updatedAt: '',
            ingredients: [],
          } as Order,
        ],
        total: 10,
        totalToday: 1,
      };

      const result = orderFeedReducer(initialState, wsMessage(response));
      expect(result.orders).toHaveLength(0);
    });

    it('should filter order with ingredients as non-array', () => {
      const response: OrdersWsResponse = {
        orders: [
          {
            _id: 'bad',
            number: 1,
            status: 'pending',
            name: 'Bad',
            createdAt: '',
            updatedAt: '',
            ingredients: 'not-array' as any,
          } as Order,
        ],
        total: 10,
        totalToday: 1,
      };

      const result = orderFeedReducer(initialState, wsMessage(response));
      expect(result.orders).toHaveLength(0);
    });

    it('should accept order with empty but valid ingredients array', () => {
      const validEmptyIngredients: Order = {
        ...mockOrder,
        _id: 'valid-empty',
        ingredients: [],
      };

      const response: OrdersWsResponse = {
        orders: [validEmptyIngredients],
        total: 10,
        totalToday: 1,
      };

      const result = orderFeedReducer(initialState, wsMessage(response));
      expect(result.orders).toEqual([validEmptyIngredients]);
    });
  });
});
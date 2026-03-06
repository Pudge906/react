// profile_orders_slice.test.ts
import { describe, expect, it } from 'vitest';

import profileOrdersReducer, {
  wsClose,
  wsConnecting,
  wsError,
  wsMessage,
  wsOpen,
} from './profile_orders_slice';

import type { Order, OrdersWsResponse } from '../types/order';
import type { ProfileOrdersState } from './profile_orders_slice';

describe('Profile Orders Slice (WebSocket - Personal)', () => {
  const mockPersonalOrder: Order = {
    _id: 'personal-order-123',
    number: 67890,
    status: 'done',
    name: 'Мой бургер №67890',
    createdAt: '2024-01-01T12:00:00.000Z',
    updatedAt: '2024-01-01T12:05:00.000Z',
    ingredients: ['ing-1', 'ing-2'],
  };

  const mockWsResponse: OrdersWsResponse = {
    orders: [mockPersonalOrder],
    total: 150,
    totalToday: 25,
  };

  const initialState: ProfileOrdersState = {
    wsConnected: false,
    orders: [],
    total: 0,
    totalToday: 0,
    error: undefined,
  };

  describe('Initial state', () => {
    it('should return initial state when undefined state passed', () => {
      const result = profileOrdersReducer(undefined, { type: 'UNKNOWN' });
      expect(result).toEqual(initialState);
    });
  });

  describe('wsConnecting', () => {
    it('should set wsConnected to false and clear error', () => {
      const stateWithError: ProfileOrdersState = {
        ...initialState,
        wsConnected: true,
        error: 'Previous connection error',
      };

      const result = profileOrdersReducer(stateWithError, wsConnecting());

      expect(result.wsConnected).toBe(false);
      expect(result.error).toBeUndefined();
      expect(result.orders).toEqual([]); // unchanged
    });

    it('should handle when already connecting', () => {
      const result = profileOrdersReducer(initialState, wsConnecting());
      expect(result.wsConnected).toBe(false);
      expect(result.error).toBeUndefined();
    });
  });

  describe('wsOpen', () => {
    it('should set wsConnected to true and clear error', () => {
      const stateWithError: ProfileOrdersState = {
        ...initialState,
        error: 'Failed to connect',
      };

      const result = profileOrdersReducer(stateWithError, wsOpen());

      expect(result.wsConnected).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should handle when already connected', () => {
      const connectedState: ProfileOrdersState = {
        ...initialState,
        wsConnected: true,
        orders: [mockPersonalOrder],
      };

      const result = profileOrdersReducer(connectedState, wsOpen());

      expect(result.wsConnected).toBe(true);
      expect(result.orders).toEqual([mockPersonalOrder]); // unchanged
    });
  });

  describe('wsClose', () => {
    it('should set wsConnected to false', () => {
      const connectedState: ProfileOrdersState = {
        ...initialState,
        wsConnected: true,
        orders: [mockPersonalOrder],
        total: 100,
      };

      const result = profileOrdersReducer(connectedState, wsClose());

      expect(result.wsConnected).toBe(false);
      expect(result.orders).toEqual([mockPersonalOrder]); // data preserved
      expect(result.total).toBe(100);
    });

    it('should handle when already disconnected', () => {
      const result = profileOrdersReducer(initialState, wsClose());
      expect(result.wsConnected).toBe(false);
    });

    it('should not clear error on close', () => {
      const stateWithError: ProfileOrdersState = {
        ...initialState,
        error: 'Some error',
      };

      const result = profileOrdersReducer(stateWithError, wsClose());

      expect(result.wsConnected).toBe(false);
      expect(result.error).toBe('Some error'); // preserved
    });
  });

  describe('wsMessage', () => {
    it('should update orders, total and totalToday from valid payload', () => {
      const result = profileOrdersReducer(initialState, wsMessage(mockWsResponse));

      expect(result.orders).toEqual([mockPersonalOrder]);
      expect(result.total).toBe(150);
      expect(result.totalToday).toBe(25);
      expect(result.wsConnected).toBe(false); // unchanged
      expect(result.error).toBeUndefined();
    });

    it('should filter out invalid orders (missing _id)', () => {
      const responseWithInvalid: OrdersWsResponse = {
        orders: [
          mockPersonalOrder,
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

      const result = profileOrdersReducer(initialState, wsMessage(responseWithInvalid));

      expect(result.orders).toEqual([mockPersonalOrder]); // only valid
      expect(result.total).toBe(200);
    });

    it('should filter out invalid orders (missing number)', () => {
      const responseWithInvalid: OrdersWsResponse = {
        orders: [
          mockPersonalOrder,
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

      const result = profileOrdersReducer(initialState, wsMessage(responseWithInvalid));

      expect(result.orders).toEqual([mockPersonalOrder]);
    });

    it('should filter out invalid orders (missing ingredients array)', () => {
      const responseWithInvalid: OrdersWsResponse = {
        orders: [
          mockPersonalOrder,
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

      const result = profileOrdersReducer(initialState, wsMessage(responseWithInvalid));

      expect(result.orders).toEqual([mockPersonalOrder]);
    });

    it('should handle empty orders array', () => {
      const emptyResponse: OrdersWsResponse = {
        orders: [],
        total: 0,
        totalToday: 0,
      };

      const result = profileOrdersReducer(initialState, wsMessage(emptyResponse));

      expect(result.orders).toHaveLength(0);
      expect(result.total).toBe(0);
      expect(result.totalToday).toBe(0);
    });

    it('should replace existing orders with new data', () => {
      const oldState: ProfileOrdersState = {
        ...initialState,
        orders: [{ ...mockPersonalOrder, _id: 'old', number: 999 }],
        total: 999,
      };

      const result = profileOrdersReducer(oldState, wsMessage(mockWsResponse));

      expect(result.orders).toEqual([mockPersonalOrder]); // replaced
      expect(result.total).toBe(150);
    });

    it('should handle multiple valid personal orders', () => {
      const orders: Order[] = [
        { ...mockPersonalOrder, _id: 'p1', number: 1 },
        { ...mockPersonalOrder, _id: 'p2', number: 2 },
        { ...mockPersonalOrder, _id: 'p3', number: 3 },
      ];

      const response: OrdersWsResponse = {
        orders,
        total: 300,
        totalToday: 50,
      };

      const result = profileOrdersReducer(initialState, wsMessage(response));

      expect(result.orders).toHaveLength(3);
      expect(result.orders.map((o) => o.number)).toEqual([1, 2, 3]);
      expect(result.total).toBe(300);
    });
  });

  describe('wsError', () => {
    it('should set error message and disconnect', () => {
      const connectedState: ProfileOrdersState = {
        ...initialState,
        wsConnected: true,
      };

      const result = profileOrdersReducer(connectedState, wsError('WebSocket failed'));

      expect(result.error).toBe('WebSocket failed');
      expect(result.wsConnected).toBe(false);
    });

    it('should preserve orders and totals on error', () => {
      const stateWithData: ProfileOrdersState = {
        ...initialState,
        orders: [mockPersonalOrder],
        total: 150,
        totalToday: 25,
        wsConnected: true,
      };

      const result = profileOrdersReducer(stateWithData, wsError('Error'));

      expect(result.error).toBe('Error');
      expect(result.wsConnected).toBe(false);
      expect(result.orders).toEqual([mockPersonalOrder]); // preserved
      expect(result.total).toBe(150);
    });

    it('should overwrite previous error', () => {
      const stateWithError: ProfileOrdersState = {
        ...initialState,
        error: 'Old error',
      };

      const result = profileOrdersReducer(stateWithError, wsError('New error'));

      expect(result.error).toBe('New error');
    });
  });

  describe('Complex WebSocket lifecycle', () => {
    it('should handle full connection cycle: connecting → open → message → close → error → reconnect', () => {
      let state = initialState;

      // 1. Начинаем подключение
      state = profileOrdersReducer(state, wsConnecting());
      expect(state.wsConnected).toBe(false);
      expect(state.error).toBeUndefined();

      // 2. Успешное подключение
      state = profileOrdersReducer(state, wsOpen());
      expect(state.wsConnected).toBe(true);

      // 3. Получаем личные заказы
      state = profileOrdersReducer(state, wsMessage(mockWsResponse));
      expect(state.orders).toEqual([mockPersonalOrder]);
      expect(state.total).toBe(150);

      // 4. Закрываем соединение
      state = profileOrdersReducer(state, wsClose());
      expect(state.wsConnected).toBe(false);
      expect(state.orders).toEqual([mockPersonalOrder]); // данные сохранены

      // 5. Ошибка при reconnect
      state = profileOrdersReducer(state, wsError('Reconnect failed'));
      expect(state.error).toBe('Reconnect failed');
      expect(state.wsConnected).toBe(false);

      // 6. Повторное подключение
      state = profileOrdersReducer(state, wsOpen());
      expect(state.wsConnected).toBe(true);
      expect(state.error).toBeUndefined();
    });

    it('should handle rapid connection state changes', () => {
      let state = initialState;

      state = profileOrdersReducer(state, wsOpen());
      state = profileOrdersReducer(state, wsClose());
      state = profileOrdersReducer(state, wsOpen());
      state = profileOrdersReducer(state, wsConnecting());
      state = profileOrdersReducer(state, wsOpen());

      expect(state.wsConnected).toBe(true);
      expect(state.error).toBeUndefined();
    });

    it('should handle message received while disconnected', () => {
      const result = profileOrdersReducer(initialState, wsMessage(mockWsResponse));

      expect(result.orders).toEqual([mockPersonalOrder]);
      expect(result.total).toBe(150);
      expect(result.wsConnected).toBe(false); // unchanged
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

      const result = profileOrdersReducer(initialState, wsMessage(response));
      expect(result.orders).toEqual([minimalOrder]);
    });

    it('should handle very large orders list', () => {
      const manyOrders: Order[] = Array.from({ length: 100 }, (_, i) => ({
        ...mockPersonalOrder,
        _id: `order-${i}`,
        number: i + 1,
      }));

      const response: OrdersWsResponse = {
        orders: manyOrders,
        total: 10000,
        totalToday: 500,
      };

      const result = profileOrdersReducer(initialState, wsMessage(response));
      expect(result.orders).toHaveLength(100);
      expect(result.total).toBe(10000);
    });

    it('should handle zero totals', () => {
      const response: OrdersWsResponse = {
        orders: [],
        total: 0,
        totalToday: 0,
      };

      const result = profileOrdersReducer(initialState, wsMessage(response));
      expect(result.total).toBe(0);
      expect(result.totalToday).toBe(0);
    });

    it('should maintain immutability', () => {
      const originalState = { ...initialState };
      const result = profileOrdersReducer(originalState, wsMessage(mockWsResponse));

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

      const result = profileOrdersReducer(initialState, wsMessage(response));
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

      const result = profileOrdersReducer(initialState, wsMessage(response));
      expect(result.orders).toHaveLength(0);
    });

    it('should accept order with empty but valid ingredients array', () => {
      const validEmptyIngredients: Order = {
        ...mockPersonalOrder,
        _id: 'valid-empty',
        ingredients: [],
      };

      const response: OrdersWsResponse = {
        orders: [validEmptyIngredients],
        total: 10,
        totalToday: 1,
      };

      const result = profileOrdersReducer(initialState, wsMessage(response));
      expect(result.orders).toEqual([validEmptyIngredients]);
    });
  });

  describe('Profile-specific behavior', () => {
    it('should handle personal orders with user-specific data', () => {
      // Личные заказы могут содержать дополнительные поля пользователя
      const personalOrderWithUser: Order = {
        ...mockPersonalOrder,
        userId: 'user-123',
        userEmail: 'test@example.com',
      };

      const response: OrdersWsResponse = {
        orders: [personalOrderWithUser],
        total: 100,
        totalToday: 10,
      };

      const result = profileOrdersReducer(initialState, wsMessage(response));
      expect(result.orders[0]).toEqual(personalOrderWithUser);
    });

    it('should preserve order history across reconnections', () => {
      let state = initialState;

      // Первое подключение: получаем историю
      state = profileOrdersReducer(state, wsOpen());
      state = profileOrdersReducer(state, wsMessage(mockWsResponse));
      expect(state.orders).toHaveLength(1);

      // Разрыв соединения
      state = profileOrdersReducer(state, wsClose());
      expect(state.wsConnected).toBe(false);
      expect(state.orders).toHaveLength(1); // история сохранена

      // Повторное подключение: новые данные заменяют старые
      const newOrder: Order = { ...mockPersonalOrder, _id: 'new', number: 99999 };
      const newResponse: OrdersWsResponse = {
        orders: [newOrder],
        total: 200,
        totalToday: 30,
      };
      state = profileOrdersReducer(state, wsOpen());
      state = profileOrdersReducer(state, wsMessage(newResponse));

      expect(state.orders).toEqual([newOrder]); // replaced, not merged
      expect(state.total).toBe(200);
    });
  });
});
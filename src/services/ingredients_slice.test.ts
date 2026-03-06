// ingredients_slice.test.ts
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { request } from '@utils/api';

import ingredientsReducer, {
  clearIngredientsError,
  fetchIngredients,
  resetIngredients,
  setIngredients,
} from './ingredients_slice';

import type { Ingredient, IngredientsState } from './ingredients_slice';

// Мокаем API модуль
vi.mock('@utils/api');
const mockedRequest = vi.mocked(request);

describe('Ingredients Slice', () => {
  const mockBun: Ingredient = {
    _id: 'bun-1',
    name: 'Булка',
    type: 'bun',
    proteins: 10,
    fat: 5,
    carbohydrates: 50,
    calories: 300,
    price: 100,
    image: 'bun.png',
    image_mobile: 'bun-m.png',
    image_large: 'bun-l.png',
    __v: 0,
  };

  const mockSauce: Ingredient = {
    _id: 'sauce-1',
    name: 'Соус',
    type: 'sauce',
    proteins: 2,
    fat: 10,
    carbohydrates: 5,
    calories: 80,
    price: 50,
    image: 'sauce.png',
    image_mobile: 'sauce-m.png',
    image_large: 'sauce-l.png',
    __v: 0,
  };

  const mockMain: Ingredient = {
    _id: 'main-1',
    name: 'Котлета',
    type: 'main',
    proteins: 20,
    fat: 15,
    carbohydrates: 2,
    calories: 200,
    price: 200,
    image: 'main.png',
    image_mobile: 'main-m.png',
    image_large: 'main-l.png',
    __v: 0,
  };

  const allIngredients: Ingredient[] = [mockBun, mockSauce, mockMain];

  const initialState: IngredientsState = {
    items: [],
    bun: [],
    sauce: [],
    main: [],
    loading: false,
    error: null,
    success: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial state', () => {
    it('should return initial state when undefined state passed', () => {
      const result = ingredientsReducer(undefined, { type: 'UNKNOWN' });
      expect(result).toEqual(initialState);
    });
  });

  describe('Sync reducers', () => {
    describe('setIngredients', () => {
      it('should set all items and filter by type correctly', () => {
        const result = ingredientsReducer(initialState, setIngredients(allIngredients));

        expect(result.items).toHaveLength(3);
        expect(result.bun).toEqual([mockBun]);
        expect(result.sauce).toEqual([mockSauce]);
        expect(result.main).toEqual([mockMain]);
        expect(result.loading).toBe(false);
        expect(result.error).toBeNull();
        expect(result.success).toBe(true);
      });

      it('should handle empty array', () => {
        const result = ingredientsReducer(initialState, setIngredients([]));

        expect(result.items).toHaveLength(0);
        expect(result.bun).toHaveLength(0);
        expect(result.sauce).toHaveLength(0);
        expect(result.main).toHaveLength(0);
        expect(result.success).toBe(true);
      });

      it('should handle array with only one type', () => {
        const onlyBuns = [mockBun, { ...mockBun, _id: 'bun-2', name: 'Bun 2' }];
        const result = ingredientsReducer(initialState, setIngredients(onlyBuns));

        expect(result.items).toHaveLength(2);
        expect(result.bun).toHaveLength(2);
        expect(result.sauce).toHaveLength(0);
        expect(result.main).toHaveLength(0);
      });

      it('should clear error and set success flag', () => {
        const stateWithError: IngredientsState = {
          ...initialState,
          error: 'Previous error',
          success: false,
        };

        const result = ingredientsReducer(stateWithError, setIngredients([mockBun]));

        expect(result.error).toBeNull();
        expect(result.success).toBe(true);
      });
    });

    describe('clearIngredientsError', () => {
      it('should clear error without affecting other state', () => {
        const stateWithError: IngredientsState = {
          ...initialState,
          items: [mockBun],
          error: 'Some error',
          loading: true,
        };

        const result = ingredientsReducer(stateWithError, clearIngredientsError());

        expect(result.error).toBeNull();
        expect(result.items).toEqual([mockBun]);
        expect(result.loading).toBe(true);
      });

      it('should handle when error is already null', () => {
        const result = ingredientsReducer(initialState, clearIngredientsError());
        expect(result.error).toBeNull();
      });
    });

    describe('resetIngredients', () => {
      it('should reset state to initial values', () => {
        const modifiedState: IngredientsState = {
          items: [mockBun, mockSauce],
          bun: [mockBun],
          sauce: [mockSauce],
          main: [mockMain],
          loading: true,
          error: 'Error',
          success: true,
        };

        const result = ingredientsReducer(modifiedState, resetIngredients());

        expect(result).toEqual(initialState);
        expect(result).not.toBe(initialState);
      });
    });
  });

  describe('fetchIngredients async thunk', () => {
    describe('pending state', () => {
      it('should set loading true and clear error', () => {
        const action = fetchIngredients.pending('requestId', undefined);
        const result = ingredientsReducer(initialState, action);

        expect(result.loading).toBe(true);
        expect(result.error).toBeNull();
        expect(result.success).toBe(false);
      });

      it('should clear previous success flag', () => {
        const stateWithSuccess: IngredientsState = {
          ...initialState,
          success: true,
          items: [mockBun],
        };

        const action = fetchIngredients.pending('requestId', undefined);
        const result = ingredientsReducer(stateWithSuccess, action);

        expect(result.loading).toBe(true);
        expect(result.success).toBe(false);
        expect(result.items).toEqual([mockBun]);
      });
    });

    describe('fulfilled state', () => {
      it('should populate state with fetched ingredients and filter by type', () => {
        const action = fetchIngredients.fulfilled(
          allIngredients,
          'requestId',
          undefined
        );
        const result = ingredientsReducer(initialState, action);

        expect(result.items).toEqual(allIngredients);
        expect(result.bun).toEqual([mockBun]);
        expect(result.sauce).toEqual([mockSauce]);
        expect(result.main).toEqual([mockMain]);
        expect(result.loading).toBe(false);
        expect(result.error).toBeNull();
        expect(result.success).toBe(true);
      });

      it('should handle empty response', () => {
        const action = fetchIngredients.fulfilled([], 'requestId', undefined);
        const result = ingredientsReducer(initialState, action);

        expect(result.items).toHaveLength(0);
        expect(result.bun).toHaveLength(0);
        expect(result.sauce).toHaveLength(0);
        expect(result.main).toHaveLength(0);
        expect(result.success).toBe(true);
      });

      it('should replace existing items with new data', () => {
        const oldState: IngredientsState = {
          ...initialState,
          items: [{ ...mockBun, name: 'Old Bun' }],
          bun: [{ ...mockBun, name: 'Old Bun' }],
        };

        const action = fetchIngredients.fulfilled(
          allIngredients,
          'requestId',
          undefined
        );
        const result = ingredientsReducer(oldState, action);

        expect(result.items).toEqual(allIngredients);
        expect(result.bun).toEqual([mockBun]);
      });
    });

    describe('rejected state', () => {
      it('should set error message and loading false', () => {
        const error = 'Network error';
        const action = fetchIngredients.rejected(
          new Error(error),
          'requestId',
          undefined,
          error
        );
        const result = ingredientsReducer(initialState, action);

        expect(result.loading).toBe(false);
        expect(result.error).toBe(error);
        expect(result.success).toBe(false);
      });

      it('should handle undefined error payload', () => {
        const action = fetchIngredients.rejected(
          new Error('test'),
          'requestId',
          undefined,
          undefined
        );
        const result = ingredientsReducer(initialState, action);

        expect(result.error).toBe('Неизвестная ошибка');
      });

      it('should preserve items on error (no data loss)', () => {
        const stateWithData: IngredientsState = {
          ...initialState,
          items: [mockBun],
          success: true,
        };

        const action = fetchIngredients.rejected(
          new Error('Error'),
          'requestId',
          undefined,
          'Error'
        );
        const result = ingredientsReducer(stateWithData, action);

        expect(result.items).toEqual([mockBun]);
        expect(result.error).toBe('Error');
        expect(result.success).toBe(false);
      });
    });
  });

  describe('Filtering logic', () => {
    it('should correctly filter mixed ingredient types', () => {
      const mixed: Ingredient[] = [
        { ...mockBun, _id: 'b1' },
        { ...mockBun, _id: 'b2' },
        { ...mockSauce, _id: 's1' },
        { ...mockMain, _id: 'm1' },
        { ...mockMain, _id: 'm2' },
        { ...mockMain, _id: 'm3' },
      ];

      const result = ingredientsReducer(initialState, setIngredients(mixed));

      expect(result.bun).toHaveLength(2);
      expect(result.sauce).toHaveLength(1);
      expect(result.main).toHaveLength(3);
      expect(result.items).toHaveLength(6);
    });

    it('should handle unknown type gracefully (not included in any category)', () => {
      const unknownType = { ...mockBun, type: 'unknown' as any };
      const result = ingredientsReducer(initialState, setIngredients([unknownType]));

      expect(result.items).toHaveLength(1);
      expect(result.bun).toHaveLength(0);
      expect(result.sauce).toHaveLength(0);
      expect(result.main).toHaveLength(0);
    });
  });

  describe('Complex state transitions', () => {
    it('should handle full fetch lifecycle: pending → fulfilled', () => {
      let state = initialState;

      state = ingredientsReducer(state, fetchIngredients.pending('req1', undefined));
      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();

      const fulfilledAction = fetchIngredients.fulfilled(
        allIngredients,
        'req1',
        undefined
      );
      state = ingredientsReducer(state, fulfilledAction);

      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
      expect(state.success).toBe(true);
      expect(state.items).toEqual(allIngredients);
    });

    it('should handle fetch error flow: pending → rejected → retry', () => {
      let state = initialState;

      state = ingredientsReducer(state, fetchIngredients.pending('req1', undefined));
      expect(state.loading).toBe(true);

      const rejectedAction = fetchIngredients.rejected(
        new Error('Failed'),
        'req1',
        undefined,
        'Failed'
      );
      state = ingredientsReducer(state, rejectedAction);

      expect(state.loading).toBe(false);
      expect(state.error).toBe('Failed');

      state = ingredientsReducer(state, fetchIngredients.pending('req2', undefined));
      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();

      const fulfilledAction = fetchIngredients.fulfilled([mockBun], 'req2', undefined);
      state = ingredientsReducer(state, fulfilledAction);

      expect(state.success).toBe(true);
      expect(state.items).toEqual([mockBun]);
    });

    it('should handle setIngredients after failed fetch', () => {
      let state = initialState;

      state = ingredientsReducer(
        state,
        fetchIngredients.rejected(new Error('Error'), 'req', undefined, 'Error')
      );
      expect(state.error).toBe('Error');

      state = ingredientsReducer(state, setIngredients([mockBun]));

      expect(state.error).toBeNull();
      expect(state.success).toBe(true);
      expect(state.items).toEqual([mockBun]);
    });
  });

  describe('Edge cases', () => {
    it('should handle ingredient with missing optional fields', () => {
      const minimal: Ingredient = {
        _id: 'min',
        name: 'Min',
        type: 'main',
        proteins: 0,
        fat: 0,
        carbohydrates: 0,
        calories: 0,
        price: 0,
        image: '',
        image_mobile: '',
        image_large: '',
        __v: 0,
      };

      const result = ingredientsReducer(initialState, setIngredients([minimal]));
      expect(result.main).toEqual([minimal]);
    });

    it('should handle very large ingredient list', () => {
      const manyIngredients: Ingredient[] = Array.from({ length: 100 }, (_, i) => ({
        ...mockMain,
        _id: `main-${i}`,
        name: `Ingredient ${i}`,
      }));

      const result = ingredientsReducer(initialState, setIngredients(manyIngredients));
      expect(result.items).toHaveLength(100);
      expect(result.main).toHaveLength(100);
      expect(result.bun).toHaveLength(0);
    });

    it('should maintain immutability', () => {
      const originalState = { ...initialState };
      const result = ingredientsReducer(originalState, setIngredients([mockBun]));

      expect(result).not.toBe(originalState);
      expect(originalState.items).toHaveLength(0);
    });
  });
});
// constructor_slice.test.ts
import { beforeEach, describe, expect, it, vi } from 'vitest';

import constructorReducer, {
  addIngredient,
  clearConstructor,
  initialState,
  moveIngredient,
  removeIngredient,
  setBun,
} from './constructor_slice';

import type { ConstructorState, Ingredient } from './constructor_slice';

describe('Constructor Slice', () => {
  const mockBun: Ingredient = {
    _id: 'bun-1',
    name: 'Булка',
    price: 100,
    type: 'bun',
  };

  const mockFilling: Ingredient = {
    _id: 'filling-1',
    name: 'Котлета',
    price: 200,
    type: 'main',
  };

  const mockSauce: Ingredient = {
    _id: 'sauce-1',
    name: 'Соус',
    price: 50,
    type: 'sauce',
  };

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-01T00:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Initial state', () => {
    it('should return initial state when undefined state passed', () => {
      const result = constructorReducer(undefined, { type: 'UNKNOWN' });
      expect(result).toEqual(initialState);
    });
  });

  describe('setBun', () => {
    it('should set bun and calculate total (bun price * 2)', () => {
      const result = constructorReducer(initialState, setBun(mockBun));
      expect(result.bun).toEqual(mockBun);
      expect(result.total).toBe(200);
      expect(result.count).toBe(0);
    });

    it('should replace existing bun and recalculate total', () => {
      const stateWithBun: ConstructorState = {
        ...initialState,
        bun: mockBun,
        total: 200,
      };

      const newBun: Ingredient = { ...mockBun, price: 150 };
      const result = constructorReducer(stateWithBun, setBun(newBun));

      expect(result.bun).toEqual(newBun);
      expect(result.total).toBe(300);
    });

    it('should calculate total with bun and ingredients', () => {
      const stateWithIngredients: ConstructorState = {
        ...initialState,
        ingredients: [mockFilling, mockSauce],
        count: 2,
        total: 250,
      };

      const result = constructorReducer(stateWithIngredients, setBun(mockBun));
      expect(result.total).toBe(450);
    });
  });

  describe('addIngredient', () => {
    it('should add ingredient with generated uniqueId via prepare', () => {
      const action = addIngredient({
        _id: 'filling-1',
        name: 'Котлета',
        price: 200,
        type: 'main',
      });

      expect(action.payload.uniqueId).toBeDefined();
      expect(action.payload.uniqueId).toMatch(/^filling-1-\d+-[a-z0-9]+$/);
    });

    it('should add ingredient to state and update count/total', () => {
      const action = addIngredient({
        _id: 'filling-1',
        name: 'Котлета',
        price: 200,
        type: 'main',
      });

      const result = constructorReducer(initialState, action);
      expect(result.ingredients).toHaveLength(1);
      expect(result.ingredients[0]).toEqual(
        expect.objectContaining({
          _id: 'filling-1',
          price: 200,
        })
      );
      expect(result.ingredients[0].uniqueId).toBeDefined();
      expect(result.count).toBe(1);
      expect(result.total).toBe(200);
    });

    // ✅ ИСПРАВЛЕНО: добавляем advanceTimersByTime между вызовами
    it('should add multiple ingredients and sum total correctly', () => {
      vi.setSystemTime(new Date('2024-01-01T00:00:00.000Z'));

      const action1 = addIngredient({ _id: 'f1', name: 'F1', price: 100, type: 'main' });
      let state = constructorReducer(initialState, action1);

      vi.advanceTimersByTime(301);

      const action2 = addIngredient({ _id: 'f2', name: 'F2', price: 150, type: 'main' });
      state = constructorReducer(state, action2);

      expect(state.ingredients).toHaveLength(2);
      expect(state.count).toBe(2);
      expect(state.total).toBe(250);
    });

    it('should reject ingredient without uniqueId (security check)', () => {
      const action = {
        type: 'constructor/addIngredient',
        payload: { _id: 'bad', price: 100 } as Ingredient,
      };

      const result = constructorReducer(initialState, action as any);
      expect(result.ingredients).toHaveLength(0);
      expect(result.count).toBe(0);
    });

    it('should enforce 300ms rate limiting on addIngredient', () => {
      vi.setSystemTime(new Date('2024-01-01T00:00:00.000Z'));

      const action1 = addIngredient({ _id: 'f1', name: 'F1', price: 100, type: 'main' });
      let state = constructorReducer(initialState, action1);

      expect(state.ingredients).toHaveLength(1);
      expect(state._lastAdd).toBe(Date.now());

      const action2 = addIngredient({ _id: 'f2', name: 'F2', price: 150, type: 'main' });
      state = constructorReducer(state, action2);

      expect(state.ingredients).toHaveLength(1);
      expect(state.count).toBe(1);

      vi.advanceTimersByTime(301);

      const action3 = addIngredient({ _id: 'f3', name: 'F3', price: 200, type: 'main' });
      state = constructorReducer(state, action3);

      expect(state.ingredients).toHaveLength(2);
      expect(state.count).toBe(2);
    });

    it('should handle empty ingredients array safely', () => {
      const stateWithEmpty: ConstructorState = {
        ...initialState,
        ingredients: [],
      };

      const action = addIngredient({ _id: 'f1', name: 'F1', price: 100, type: 'main' });
      const result = constructorReducer(stateWithEmpty, action);

      expect(result.ingredients).toHaveLength(1);
    });
  });

  describe('removeIngredient', () => {
    it('should remove ingredient by uniqueId', () => {
      const actionAdd = addIngredient({
        _id: 'f1',
        name: 'F1',
        price: 100,
        type: 'main',
      });
      const state = constructorReducer(initialState, actionAdd);

      const uniqueId = state.ingredients[0].uniqueId!;
      const result = constructorReducer(state, removeIngredient(uniqueId));

      expect(result.ingredients).toHaveLength(0);
      expect(result.count).toBe(0);
      expect(result.total).toBe(0);
    });

    it('should not remove anything if uniqueId not found', () => {
      const actionAdd = addIngredient({
        _id: 'f1',
        name: 'F1',
        price: 100,
        type: 'main',
      });
      const state = constructorReducer(initialState, actionAdd);

      const result = constructorReducer(state, removeIngredient('non-existent-id'));

      expect(result.ingredients).toHaveLength(1);
      expect(result.count).toBe(1);
    });

    // ✅ ИСПРАВЛЕНО: добавляем advanceTimersByTime
    it('should recalculate total after removal', () => {
      vi.setSystemTime(new Date('2024-01-01T00:00:00.000Z'));

      const action1 = addIngredient({ _id: 'f1', name: 'F1', price: 100, type: 'main' });
      let state = constructorReducer(initialState, action1);

      vi.advanceTimersByTime(301);

      const action2 = addIngredient({ _id: 'f2', name: 'F2', price: 200, type: 'main' });
      state = constructorReducer(state, action2);

      expect(state.total).toBe(300);

      const uniqueId = state.ingredients[0].uniqueId!;
      const result = constructorReducer(state, removeIngredient(uniqueId));

      expect(result.total).toBe(200);
    });

    it('should handle removal when ingredients array is empty', () => {
      const result = constructorReducer(initialState, removeIngredient('any-id'));
      expect(result.ingredients).toHaveLength(0);
    });
  });

  describe('moveIngredient', () => {
    it('should move ingredient from lower to higher index', () => {
      const actions = [
        addIngredient({ _id: 'f1', name: 'F1', price: 100, type: 'main' }),
        addIngredient({ _id: 'f2', name: 'F2', price: 200, type: 'main' }),
        addIngredient({ _id: 'f3', name: 'F3', price: 300, type: 'main' }),
      ];

      let state = initialState;
      for (const action of actions) {
        state = constructorReducer(state, action);
        vi.advanceTimersByTime(301);
      }

      expect(state.ingredients.map((i) => i._id)).toEqual(['f1', 'f2', 'f3']);

      const result = constructorReducer(
        state,
        moveIngredient({ fromIndex: 0, toIndex: 2 })
      );

      expect(result.ingredients.map((i) => i._id)).toEqual(['f2', 'f3', 'f1']);
      expect(result.total).toBe(600);
    });

    it('should move ingredient from higher to lower index', () => {
      const actions = [
        addIngredient({ _id: 'f1', name: 'F1', price: 100, type: 'main' }),
        addIngredient({ _id: 'f2', name: 'F2', price: 200, type: 'main' }),
        addIngredient({ _id: 'f3', name: 'F3', price: 300, type: 'main' }),
      ];

      let state = initialState;
      for (const action of actions) {
        state = constructorReducer(state, action);
        vi.advanceTimersByTime(301);
      }

      const result = constructorReducer(
        state,
        moveIngredient({ fromIndex: 2, toIndex: 0 })
      );

      expect(result.ingredients.map((i) => i._id)).toEqual(['f3', 'f1', 'f2']);
    });

    it('should not move if fromIndex is invalid', () => {
      const state = constructorReducer(
        initialState,
        addIngredient({ _id: 'f1', name: 'F1', price: 100, type: 'main' })
      );

      const result = constructorReducer(
        state,
        moveIngredient({ fromIndex: -1, toIndex: 0 })
      );
      expect(result.ingredients).toEqual(state.ingredients);
    });

    it('should not move if toIndex is invalid', () => {
      const state = constructorReducer(
        initialState,
        addIngredient({ _id: 'f1', name: 'F1', price: 100, type: 'main' })
      );

      const result = constructorReducer(
        state,
        moveIngredient({ fromIndex: 0, toIndex: 10 })
      );
      expect(result.ingredients).toEqual(state.ingredients);
    });

    it('should not move if fromIndex === toIndex', () => {
      const state = constructorReducer(
        initialState,
        addIngredient({ _id: 'f1', name: 'F1', price: 100, type: 'main' })
      );

      const result = constructorReducer(
        state,
        moveIngredient({ fromIndex: 0, toIndex: 0 })
      );
      expect(result.ingredients).toEqual(state.ingredients);
    });

    it('should handle empty ingredients array', () => {
      const result = constructorReducer(
        initialState,
        moveIngredient({ fromIndex: 0, toIndex: 1 })
      );
      expect(result.ingredients).toHaveLength(0);
    });
  });

  describe('clearConstructor', () => {
    it('should reset state to initial values', () => {
      const actionAdd = addIngredient({
        _id: 'f1',
        name: 'F1',
        price: 100,
        type: 'main',
      });
      let state = constructorReducer(initialState, actionAdd);
      state = constructorReducer(state, setBun(mockBun));

      expect(state.bun).toBeTruthy();
      expect(state.ingredients.length).toBe(1);
      expect(state.total).toBeGreaterThan(0);

      const result = constructorReducer(state, clearConstructor());

      expect(result).toEqual(initialState);
    });

    it('should create new state object (immutability)', () => {
      const state = constructorReducer(initialState, clearConstructor());
      expect(state).not.toBe(initialState);
      expect(state).toEqual(initialState);
    });
  });

  describe('calculateTotal edge cases', () => {
    it('should handle ingredient without price field', () => {
      const ingredientNoPrice = { _id: 'bad', name: 'Bad' } as Ingredient;
      const action = addIngredient(ingredientNoPrice);

      const result = constructorReducer(initialState, action);
      expect(result.total).toBe(0);
    });

    it('should handle negative prices correctly', () => {
      const negativePrice = { _id: 'neg', name: 'Neg', price: -50, type: 'main' };
      const action = addIngredient(negativePrice);

      const result = constructorReducer(initialState, action);
      expect(result.total).toBe(-50);
    });

    it('should handle bun with zero price', () => {
      const freeBun = { ...mockBun, price: 0 };
      const result = constructorReducer(initialState, setBun(freeBun));
      expect(result.total).toBe(0);
    });
  });

  describe('Complex state transitions', () => {
    it('should handle full burger assembly flow', () => {
      vi.setSystemTime(new Date('2024-01-01T00:00:00.000Z'));

      let state = initialState;

      state = constructorReducer(state, setBun(mockBun));
      expect(state.bun).toEqual(mockBun);
      expect(state.total).toBe(200);

      vi.advanceTimersByTime(301);
      state = constructorReducer(state, addIngredient(mockFilling));
      expect(state.count).toBe(1);
      expect(state.total).toBe(400);

      vi.advanceTimersByTime(301);
      state = constructorReducer(state, addIngredient(mockSauce));
      expect(state.count).toBe(2);
      expect(state.total).toBe(450);

      state = constructorReducer(state, moveIngredient({ fromIndex: 1, toIndex: 0 }));
      expect(state.ingredients.map((i) => i._id)).toEqual(['sauce-1', 'filling-1']);
      expect(state.total).toBe(450);

      const sauceId = state.ingredients[0].uniqueId!;
      state = constructorReducer(state, removeIngredient(sauceId));
      expect(state.count).toBe(1);
      expect(state.total).toBe(400);

      state = constructorReducer(state, clearConstructor());
      expect(state).toEqual(initialState);
    });
  });
});
// ingredient_detailsSlice.test.ts
import { describe, expect, it } from 'vitest';

import ingredientDetailsReducer, {
  closeIngredientModal,
  initialState,
  openIngredientModal,
  resetIngredientDetails,
  setCurrentIngredient,
} from './ingredient_detailsSlice';

import type { IngredientDetailsState } from './ingredient_detailsSlice';

describe('Ingredient Details Slice', () => {
  const mockIngredient = {
    _id: 'ing-123',
    name: 'Флюоресцентная булка R2-D3',
    price: 4400,
    type: 'bun',
    calories: 420,
    proteins: 15,
    fat: 24,
    carbohydrates: 53,
    image: 'https://example.com/bun.png',
    image_mobile: 'https://example.com/bun-mobile.png',
    image_large: 'https://example.com/bun-large.png',
  };

  describe('Initial state', () => {
    it('should return initial state when undefined state passed', () => {
      const result = ingredientDetailsReducer(undefined, { type: 'UNKNOWN' });
      expect(result).toEqual(initialState);
    });
  });

  describe('setCurrentIngredient', () => {
    it('should set currentIngredient to provided value', () => {
      const result = ingredientDetailsReducer(
        initialState,
        setCurrentIngredient(mockIngredient)
      );
      expect(result.currentIngredient).toEqual(mockIngredient);
      expect(result.isModalOpen).toBe(false); // modal state unchanged
    });

    it('should set currentIngredient to null', () => {
      const stateWithIngredient: IngredientDetailsState = {
        currentIngredient: mockIngredient,
        isModalOpen: false,
      };

      const result = ingredientDetailsReducer(
        stateWithIngredient,
        setCurrentIngredient(null)
      );
      expect(result.currentIngredient).toBeNull();
      expect(result.isModalOpen).toBe(false);
    });

    it('should not affect isModalOpen flag', () => {
      const stateWithOpenModal: IngredientDetailsState = {
        currentIngredient: null,
        isModalOpen: true,
      };

      const result = ingredientDetailsReducer(
        stateWithOpenModal,
        setCurrentIngredient(mockIngredient)
      );
      expect(result.currentIngredient).toEqual(mockIngredient);
      expect(result.isModalOpen).toBe(true); // unchanged
    });
  });

  describe('openIngredientModal', () => {
    it('should set currentIngredient and open modal', () => {
      const result = ingredientDetailsReducer(
        initialState,
        openIngredientModal(mockIngredient)
      );
      expect(result.currentIngredient).toEqual(mockIngredient);
      expect(result.isModalOpen).toBe(true);
    });

    it('should replace existing ingredient when opening modal', () => {
      const oldIngredient = { ...mockIngredient, _id: 'old-id', name: 'Old' };
      const stateWithIngredient: IngredientDetailsState = {
        currentIngredient: oldIngredient,
        isModalOpen: false,
      };

      const newIngredient = { ...mockIngredient, _id: 'new-id', name: 'New' };
      const result = ingredientDetailsReducer(
        stateWithIngredient,
        openIngredientModal(newIngredient)
      );

      expect(result.currentIngredient).toEqual(newIngredient);
      expect(result.isModalOpen).toBe(true);
    });

    it('should open modal even if it was already open with different ingredient', () => {
      const stateWithOpenModal: IngredientDetailsState = {
        currentIngredient: { ...mockIngredient, _id: 'old' },
        isModalOpen: true,
      };

      const result = ingredientDetailsReducer(
        stateWithOpenModal,
        openIngredientModal(mockIngredient)
      );

      expect(result.currentIngredient).toEqual(mockIngredient);
      expect(result.isModalOpen).toBe(true);
    });
  });

  describe('closeIngredientModal', () => {
    it('should close modal and clear currentIngredient', () => {
      const stateWithOpenModal: IngredientDetailsState = {
        currentIngredient: mockIngredient,
        isModalOpen: true,
      };

      const result = ingredientDetailsReducer(
        stateWithOpenModal,
        closeIngredientModal()
      );

      expect(result.currentIngredient).toBeNull();
      expect(result.isModalOpen).toBe(false);
    });

    it('should handle closing already closed modal', () => {
      const result = ingredientDetailsReducer(initialState, closeIngredientModal());
      expect(result).toEqual(initialState);
    });

    it('should clear ingredient even if modal was already closed', () => {
      const stateWithIngredient: IngredientDetailsState = {
        currentIngredient: mockIngredient,
        isModalOpen: false,
      };

      const result = ingredientDetailsReducer(
        stateWithIngredient,
        closeIngredientModal()
      );

      expect(result.currentIngredient).toBeNull();
      expect(result.isModalOpen).toBe(false);
    });
  });

  describe('resetIngredientDetails', () => {
    it('should reset state to initial values', () => {
      const modifiedState: IngredientDetailsState = {
        currentIngredient: mockIngredient,
        isModalOpen: true,
      };

      const result = ingredientDetailsReducer(modifiedState, resetIngredientDetails());

      expect(result).toEqual(initialState);
      expect(result).not.toBe(initialState); // new object reference
    });

    it('should reset from any state', () => {
      const states: IngredientDetailsState[] = [
        { currentIngredient: null, isModalOpen: false },
        { currentIngredient: mockIngredient, isModalOpen: false },
        { currentIngredient: null, isModalOpen: true },
        { currentIngredient: mockIngredient, isModalOpen: true },
      ];

      states.forEach((state) => {
        const result = ingredientDetailsReducer(state, resetIngredientDetails());
        expect(result).toEqual(initialState);
      });
    });
  });

  describe('Complex state transitions', () => {
    it('should handle full modal lifecycle: open → change → close → reset', () => {
      let state = initialState;

      // 1. Открываем модалку с ингредиентом
      state = ingredientDetailsReducer(state, openIngredientModal(mockIngredient));
      expect(state.isModalOpen).toBe(true);
      expect(state.currentIngredient?._id).toBe('ing-123');

      // 2. Меняем ингредиент в открытой модалке
      const newIngredient = {
        ...mockIngredient,
        _id: 'ing-456',
        name: 'New Ingredient',
      };
      state = ingredientDetailsReducer(state, setCurrentIngredient(newIngredient));
      expect(state.currentIngredient?._id).toBe('ing-456');
      expect(state.isModalOpen).toBe(true);

      // 3. Закрываем модалку
      state = ingredientDetailsReducer(state, closeIngredientModal());
      expect(state.isModalOpen).toBe(false);
      expect(state.currentIngredient).toBeNull();

      // 4. Сбрасываем состояние (для надёжности)
      state = ingredientDetailsReducer(state, resetIngredientDetails());
      expect(state).toEqual(initialState);
    });

    it('should handle rapid open/close cycles', () => {
      let state = initialState;

      // Быстрое открытие/закрытие
      state = ingredientDetailsReducer(state, openIngredientModal(mockIngredient));
      state = ingredientDetailsReducer(state, closeIngredientModal());
      state = ingredientDetailsReducer(state, openIngredientModal(mockIngredient));
      state = ingredientDetailsReducer(state, closeIngredientModal());

      expect(state).toEqual(initialState);
    });

    it('should handle setting null then opening modal', () => {
      let state = ingredientDetailsReducer(
        initialState,
        setCurrentIngredient(mockIngredient)
      );
      state = ingredientDetailsReducer(state, setCurrentIngredient(null));

      expect(state.currentIngredient).toBeNull();

      state = ingredientDetailsReducer(state, openIngredientModal(mockIngredient));
      expect(state.currentIngredient).toEqual(mockIngredient);
      expect(state.isModalOpen).toBe(true);
    });
  });

  describe('Edge cases', () => {
    it('should handle ingredient with minimal properties', () => {
      const minimalIngredient = { _id: 'min', name: 'Min' };
      const result = ingredientDetailsReducer(
        initialState,
        openIngredientModal(minimalIngredient as any)
      );
      expect(result.currentIngredient).toEqual(minimalIngredient);
      expect(result.isModalOpen).toBe(true);
    });

    it('should handle ingredient with extra properties', () => {
      const extendedIngredient = {
        ...mockIngredient,
        customProp: 'custom',
        nested: { deep: 'value' },
      };
      const result = ingredientDetailsReducer(
        initialState,
        openIngredientModal(extendedIngredient)
      );
      expect(result.currentIngredient).toEqual(extendedIngredient);
    });

    it('should maintain immutability', () => {
      const originalState: IngredientDetailsState = {
        currentIngredient: null,
        isModalOpen: false,
      };

      const result = ingredientDetailsReducer(
        originalState,
        openIngredientModal(mockIngredient)
      );

      expect(result).not.toBe(originalState);
      expect(originalState.isModalOpen).toBe(false); // original unchanged
    });
  });
});
import { createSlice } from '@reduxjs/toolkit';

import type { PayloadAction } from '@reduxjs/toolkit';

// ==================== ТИПЫ ====================
interface Ingredient {
  _id: string;
  name: string;
  type: 'bun' | 'sauce' | 'main';
  price: number;
  image: string;
  image_mobile?: string;
  image_large?: string;
  proteins?: number;
  fat?: number;
  carbohydrates?: number;
  calories?: number;
  __v?: number;
}

interface ConstructorIngredient extends Ingredient {
  uniqueId: string;
}

interface ConstructorState {
  bun: Ingredient | null;
  ingredients: ConstructorIngredient[];
  total: number;
  count: number;
  _lastAdd: number | null;
}

// ==================== НАЧАЛЬНОЕ СОСТОЯНИЕ ====================
const initialState: ConstructorState = {
  bun: null,
  ingredients: [],
  total: 0,
  count: 0,
  _lastAdd: null,
};

// ==================== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ====================
const calculateTotal = (state: ConstructorState): number => {
  const bunPrice = state.bun ? state.bun.price * 2 : 0;
  const ingredientsPrice = state.ingredients.reduce(
    (sum: number, item: ConstructorIngredient): number => sum + (item.price || 0),
    0
  );
  return bunPrice + ingredientsPrice;
};

const ensureIngredientsArray = (ingredients: unknown): ConstructorIngredient[] => {
  return Array.isArray(ingredients) ? ingredients : [];
};

// ==================== SLICE ====================
const constructorSlice = createSlice({
  name: 'constructor',
  initialState,
  reducers: {
    setBun: (state, action: PayloadAction<Ingredient>): ConstructorState => {
      const newState: ConstructorState = {
        ...state,
        bun: action.payload,
      };
      newState.total = calculateTotal(newState);
      return newState;
    },

    addIngredient: {
      reducer: (state, action: PayloadAction<ConstructorIngredient>): ConstructorState => {
        const now = Date.now();
        
        // Защита от двойного добавления
        if (state._lastAdd && now - state._lastAdd < 300) {
          return state;
        }

        const currentIngredients = ensureIngredientsArray(state.ingredients);
        const newIngredient = action.payload;

        const newState: ConstructorState = {
          ...state,
          ingredients: [...currentIngredients, newIngredient],
          count: state.count + 1,
          _lastAdd: now,
        };

        newState.total = calculateTotal(newState);
        return newState;
      },
      prepare: (ingredient: Omit<Ingredient, 'uniqueId'>): { payload: ConstructorIngredient } => {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 9);
        const uniqueId = `${ingredient._id}-${timestamp}-${random}`;

        return {
          payload: {
            ...ingredient,
            uniqueId,
          } as ConstructorIngredient,
        };
      },
    },

    removeIngredient: (state, action: PayloadAction<string>): ConstructorState => {
      const currentIngredients = ensureIngredientsArray(state.ingredients);
      const index = currentIngredients.findIndex(
        (item: ConstructorIngredient): boolean => item.uniqueId === action.payload
      );

      if (index === -1) {
        return state;
      }

      const newState: ConstructorState = {
        ...state,
        ingredients: currentIngredients.filter((_, i: number): boolean => i !== index),
        count: state.count - 1,
      };

      newState.total = calculateTotal(newState);
      return newState;
    },

    moveIngredient: (
      state,
      action: PayloadAction<{ fromIndex: number; toIndex: number }>
    ): ConstructorState => {
      const currentIngredients = ensureIngredientsArray(state.ingredients);
      const { fromIndex, toIndex } = action.payload;

      // Валидация индексов
      if (
        fromIndex < 0 ||
        fromIndex >= currentIngredients.length ||
        toIndex < 0 ||
        toIndex >= currentIngredients.length ||
        fromIndex === toIndex
      ) {
        return state;
      }

      const newIngredients = [...currentIngredients];
      const [movedItem] = newIngredients.splice(fromIndex, 1);
      newIngredients.splice(toIndex, 0, movedItem);

      return {
        ...state,
        ingredients: newIngredients,
      };
    },

    clearConstructor: (): ConstructorState => initialState,
  },
});

// ==================== EXPORTS ====================
export const {
  setBun,
  addIngredient,
  removeIngredient,
  moveIngredient,
  clearConstructor,
} = constructorSlice.actions;

export default constructorSlice.reducer;
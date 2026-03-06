import { createSlice } from '@reduxjs/toolkit';

// src/services/constructor_slice.ts
import type { PayloadAction } from '@reduxjs/toolkit';

type Ingredient = {
  _id: string;
  price: number;
  uniqueId?: string;
  [key: string]: any;
};

type ConstructorState = {
  bun: Ingredient | null;
  ingredients: Ingredient[];
  total: number;
  count: number;
  _lastAdd: number | null;
};

const initialState: ConstructorState = {
  bun: null,
  ingredients: [],
  total: 0,
  count: 0,
  _lastAdd: null,
};

const calculateTotal = (state: ConstructorState): number => {
  const bunPrice = state.bun ? state.bun.price * 2 : 0;
  const ingredientsPrice = state.ingredients.reduce(
    (sum, item) => sum + (item.price || 0),
    0
  );
  return bunPrice + ingredientsPrice;
};

const constructorSlice = createSlice({
  name: 'constructor',
  initialState,
  reducers: {
    setBun: (state, action: PayloadAction<Ingredient>) => {
      const newState = {
        ...state,
        bun: action.payload,
      };
      newState.total = calculateTotal(newState);
      return newState;
    },

    addIngredient: {
      reducer: (state, action: PayloadAction<Ingredient>) => {
        const now = Date.now();
        if (state._lastAdd && now - state._lastAdd < 300) {
          return state;
        }

        const currentIngredients = Array.isArray(state.ingredients)
          ? state.ingredients
          : [];

        const newIngredient = action.payload;

        if (!newIngredient.uniqueId) {
          return state;
        }

        const newState = {
          ...state,
          ingredients: [...currentIngredients, newIngredient],
          count: state.count + 1,
          _lastAdd: now,
        };

        newState.total = calculateTotal(newState);
        return newState;
      },
      prepare: (ingredient: Omit<Ingredient, 'uniqueId'>) => {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 9);
        const uniqueId = `${ingredient._id}-${timestamp}-${random}`;

        return {
          payload: {
            ...ingredient,
            uniqueId,
          },
        };
      },
    },

    removeIngredient: (state, action: PayloadAction<string>) => {
      const currentIngredients = Array.isArray(state.ingredients)
        ? state.ingredients
        : [];

      const index = currentIngredients.findIndex(
        (item) => item.uniqueId === action.payload
      );

      if (index === -1) {
        return state;
      }

      const newState = {
        ...state,
        ingredients: currentIngredients.filter((_, i) => i !== index),
        count: state.count - 1,
      };

      newState.total = calculateTotal(newState);
      return newState;
    },

    moveIngredient: (
      state,
      action: PayloadAction<{ fromIndex: number; toIndex: number }>
    ) => {
      const currentIngredients = Array.isArray(state.ingredients)
        ? state.ingredients
        : [];

      const { fromIndex, toIndex } = action.payload;

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

   clearConstructor: () => ({
  bun: null,
  ingredients: [],
  total: 0,
  count: 0,
  _lastAdd: null,
}),
  },
});

export const {
  setBun,
  addIngredient,
  removeIngredient,
  moveIngredient,
  clearConstructor,
} = constructorSlice.actions;

export default constructorSlice.reducer;
export { initialState };
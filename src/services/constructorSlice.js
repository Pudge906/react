import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  bun: null,
  ingredients: [],
  total: 0,
  count: 0,
  _lastAdd: null,
};

const calculateTotal = (state) => {
  const bunPrice = state.bun ? state.bun.price * 2 : 0;
  const ingredientsPrice = (state.ingredients || []).reduce(
    (sum, item) => sum + (item.price || 0),
    0
  );
  const total = bunPrice + ingredientsPrice;

  return total;
};

const constructorSlice = createSlice({
  name: 'constructor',
  initialState,
  reducers: {
    setBun: {
      reducer: (state, action) => {
        const newState = {
          ...state,
          bun: action.payload,
        };

        newState.total = calculateTotal(newState);

        return newState;
      },
      prepare: (bun) => {
        return { payload: bun };
      },
    },

    addIngredient: {
      reducer: (state, action) => {
        const now = Date.now();
        if (state._lastAdd && now - state._lastAdd < 300) {
          return state;
        }

        const currentIngredients = Array.isArray(state.ingredients)
          ? state.ingredients
          : [];
        const newIngredient = {
          ...action.payload,
          uniqueId: `${action.payload._id}-${Date.now()}-${Math.random()}`,
        };

        const newState = {
          ...state,
          ingredients: [...currentIngredients, newIngredient],
          count: state.count + 1,
          _lastAdd: now,
        };

        newState.total = calculateTotal(newState);

        return newState;
      },
      prepare: (ingredient) => {
        return { payload: ingredient };
      },
    },

    removeIngredient: (state, action) => {
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

      console.log('New total after removeIngredient:', newState.total);

      return newState;
    },

    moveIngredient: (state, action) => {
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

    clearConstructor: () => {
      return initialState;
    },
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

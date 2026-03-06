import { createSlice } from '@reduxjs/toolkit';

// src/services/ingredient_detailsSlice.ts
import type { PayloadAction } from '@reduxjs/toolkit';

type Ingredient = Record<string, any>;

type IngredientDetailsState = {
  currentIngredient: Ingredient | null;
  isModalOpen: boolean;
};

export const initialState: IngredientDetailsState = {
  currentIngredient: null,
  isModalOpen: false,
};

const ingredientDetailsSlice = createSlice({
  name: 'ingredientDetails',
  initialState,
  reducers: {
    setCurrentIngredient: (state, action: PayloadAction<Ingredient | null>) => {
      state.currentIngredient = action.payload;
    },

    openIngredientModal: (state, action: PayloadAction<Ingredient>) => {
      state.currentIngredient = action.payload;
      state.isModalOpen = true;
    },

    closeIngredientModal: (state) => {
      state.currentIngredient = null;
      state.isModalOpen = false;
    },

    resetIngredientDetails: () => ({ ...initialState }),
  },
});

export const {
  setCurrentIngredient,
  openIngredientModal,
  closeIngredientModal,
  resetIngredientDetails,
} = ingredientDetailsSlice.actions;

export default ingredientDetailsSlice.reducer;
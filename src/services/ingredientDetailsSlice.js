import { createSlice } from '@reduxjs/toolkit';

// Начальное состояние
const initialState = {
  currentIngredient: null,
  isModalOpen: false,
};

const ingredientDetailsSlice = createSlice({
  name: 'ingredientDetails',
  initialState,
  reducers: {
    setCurrentIngredient: (state, action) => {
      state.currentIngredient = action.payload;
    },

    openIngredientModal: (state, action) => {
      state.currentIngredient = action.payload;
      state.isModalOpen = true;
    },

    closeIngredientModal: (state) => {
      state.currentIngredient = null;
      state.isModalOpen = false;
    },

    resetIngredientDetails: () => initialState,
  },
});

export const {
  setCurrentIngredient,
  openIngredientModal,
  closeIngredientModal,
  resetIngredientDetails,
} = ingredientDetailsSlice.actions;

export default ingredientDetailsSlice.reducer;

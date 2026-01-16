import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentIngredient: null,
  isModalOpen: false,
};

const privateReducers = {
  setCurrentIngredient: (state, action) => {
    state.currentIngredient = action.payload;
  },
  setIsModalOpen: (state, action) => {
    state.isModalOpen = action.payload;
  },
};

const ingredient_detailsSlice = createSlice({
  name: 'ingredientDetails',
  initialState,
  reducers: {
    setCurrentIngredient: {
      reducer: (state, action) => {
        privateReducers.setCurrentIngredient(state, { payload: action.payload });
      },
      prepare: (payload) => ({ payload }),
    },

    openIngredientModal: {
      reducer: (state, action) => {
        privateReducers.setCurrentIngredient(state, { payload: action.payload });
        privateReducers.setIsModalOpen(state, { payload: true });
      },
      prepare: (payload) => ({ payload }),
    },

    closeIngredientModal: {
      reducer: (state) => {
        privateReducers.setCurrentIngredient(state, { payload: null });
        privateReducers.setIsModalOpen(state, { payload: false });
      },
      prepare: () => ({}),
    },

    resetIngredientDetails: () => initialState,
  },
});

export const {
  setCurrentIngredient,
  openIngredientModal,
  closeIngredientModal,
  resetIngredientDetails,
} = ingredient_detailsSlice.actions;

export default ingredient_detailsSlice.reducer;

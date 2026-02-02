import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { request } from '@utils/api.js';

export const fetchIngredients = createAsyncThunk(
  'ingredients/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const data = await request('/ingredients');
      return data.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  items: [],
  bun: [],
  sauce: [],
  main: [],
  loading: false,
  error: null,
  success: false,
};

const ingredients_slice = createSlice({
  name: 'ingredients',
  initialState,
  reducers: {
    setIngredients: (state, action) => {
      const items = action.payload;
      state.items = items;
      state.bun = items.filter((i) => i.type === 'bun');
      state.sauce = items.filter((i) => i.type === 'sauce');
      state.main = items.filter((i) => i.type === 'main');
      state.loading = false;
      state.error = null;
      state.success = true;
    },
    clearIngredientsError: (state) => {
      state.error = null;
    },
    resetIngredients: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchIngredients.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(fetchIngredients.fulfilled, (state, action) => {
        const items = action.payload;
        state.items = items;
        state.bun = items.filter((i) => i.type === 'bun');
        state.sauce = items.filter((i) => i.type === 'sauce');
        state.main = items.filter((i) => i.type === 'main');
        state.loading = false;
        state.error = null;
        state.success = true;
      })
      .addCase(fetchIngredients.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      });
  },
});

export const { setIngredients, clearIngredientsError, resetIngredients } =
  ingredients_slice.actions;

export default ingredients_slice.reducer;

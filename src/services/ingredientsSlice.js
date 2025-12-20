import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

export const fetchIngredients = createAsyncThunk(
  'ingredients/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(
        'https://norma.education-services.ru/api/ingredients'
      );

      if (!response.ok) {
        throw new Error(`Ошибка: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error('Ошибка API');
      }

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

const ingredientsSlice = createSlice({
  name: 'ingredients',
  initialState,
  reducers: {
    setIngredients: (state, action) => {
      const items = action.payload;
      state.items = items;
      state.bun = items.filter((item) => item.type === 'bun');
      state.sauce = items.filter((item) => item.type === 'sauce');
      state.main = items.filter((item) => item.type === 'main');
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
        state.bun = items.filter((item) => item.type === 'bun');
        state.sauce = items.filter((item) => item.type === 'sauce');
        state.main = items.filter((item) => item.type === 'main');
        state.loading = false;
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
  ingredientsSlice.actions;

export default ingredientsSlice.reducer;

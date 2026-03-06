import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { request } from '@utils/api';

// src/services/ingredients_slice.ts
import type { PayloadAction } from '@reduxjs/toolkit';

type Ingredient = {
  _id: string;
  name: string;
  type: 'bun' | 'sauce' | 'main';
  proteins: number;
  fat: number;
  carbohydrates: number;
  calories: number;
  price: number;
  image: string;
  image_mobile: string;
  image_large: string;
  __v: number;
};

type IngredientsState = {
  items: Ingredient[];
  bun: Ingredient[];
  sauce: Ingredient[];
  main: Ingredient[];
  loading: boolean;
  error: string | null;
  success: boolean;
};

export const fetchIngredients = createAsyncThunk<
  Ingredient[],
  void,
  { rejectValue: string }
>('ingredients/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const data = await request<{ data: Ingredient[] }>('/ingredients');
    return data.data;
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

const initialState: IngredientsState = {
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
    setIngredients: (state, action: PayloadAction<Ingredient[]>) => {
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
      .addCase(
        fetchIngredients.fulfilled,
        (state, action: PayloadAction<Ingredient[]>) => {
          const items = action.payload;
          state.items = items;
          state.bun = items.filter((i) => i.type === 'bun');
          state.sauce = items.filter((i) => i.type === 'sauce');
          state.main = items.filter((i) => i.type === 'main');
          state.loading = false;
          state.error = null;
          state.success = true;
        }
      )
      .addCase(
        fetchIngredients.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          state.loading = false;
          state.error = action.payload || 'Неизвестная ошибка';
          state.success = false;
        }
      );
  },
});

export const { setIngredients, clearIngredientsError, resetIngredients } =
  ingredientsSlice.actions;

export default ingredientsSlice.reducer;

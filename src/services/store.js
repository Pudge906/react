import { configureStore } from '@reduxjs/toolkit';

import authReducer from './auth_slice.js';
import constructorReducer from './constructor_slice.js';
import ingredientDetailsReducer from './ingredient_detailsSlice.js';
import ingredientsReducer from './ingredients_slice.js';
import orderReducer from './order_slice.js';

export const store = configureStore({
  reducer: {
    ingredients: ingredientsReducer,
    constructor: constructorReducer,
    ingredientDetails: ingredientDetailsReducer,
    order: orderReducer,
    auth: authReducer,
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
      immutableCheck: false,
    }),
  devTools: true,
});

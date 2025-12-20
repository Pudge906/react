import { configureStore } from '@reduxjs/toolkit';

import constructorReducer from './constructorSlice';
import ingredientDetailsReducer from './ingredientDetailsSlice';
import ingredientsReducer from './ingredientsSlice';
import orderReducer from './orderSlice';

export const store = configureStore({
  reducer: {
    ingredients: ingredientsReducer,
    constructor: constructorReducer,
    ingredientDetails: ingredientDetailsReducer,
    order: orderReducer,
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
      immutableCheck: false,
    }),
  devTools: true,
});

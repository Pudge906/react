import { configureStore } from '@reduxjs/toolkit';

import authReducer from './auth_slice';
import constructorReducer from './constructor_slice';
import ingredientDetailsReducer from './ingredient_detailsSlice';
import ingredientsReducer from './ingredients_slice';
import orderReducer from './order_slice';

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

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

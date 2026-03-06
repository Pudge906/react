import { configureStore } from '@reduxjs/toolkit';

import authReducer from './auth_slice.ts';
import constructorReducer from './constructor_slice.ts';
import ingredientDetailsReducer from './ingredient_detailsSlice.ts';
import ingredientsReducer from './ingredients_slice.ts';
import orderFeedReducer from './order_feed_slice';
import orderReducer from './order_slice.ts';
import profileOrdersReducer from './profile_orders_slice';
import { wsMiddleware } from './wsMiddleware';

// URL для WebSocket
const wsUrlAll = 'wss://norma.education-services.ru/orders/all';
const wsUrlPersonal = 'wss://norma.education-services.ru/orders';

// Подключаем мидлвары
const wsOrdersAllMiddleware = wsMiddleware(wsUrlAll, false);
const wsOrdersProfileMiddleware = wsMiddleware(wsUrlPersonal, true);

export const store = configureStore({
  reducer: {
    ingredients: ingredientsReducer,
    constructor: constructorReducer,
    ingredientDetails: ingredientDetailsReducer,
    order: orderReducer,
    auth: authReducer,
    orderFeed: orderFeedReducer,
    profileOrders: profileOrdersReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
      immutableCheck: false,
    }).concat([wsOrdersAllMiddleware, wsOrdersProfileMiddleware]),
  devTools: true,
});

// Типы
export type AppStore = typeof store;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];

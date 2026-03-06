// src/services/store.test.ts
import { describe, it, expect } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import constructorReducer from './constructor_slice';
import ingredientsReducer from './ingredients_slice';
import ingredientDetailsReducer from './ingredient_detailsSlice';
import orderReducer from './order_slice';
import profileOrdersReducer from './profile_orders_slice';
import authReducer from './auth_slice';

describe('Redux Store', () => {
  it('should have correct initial state for all slices', () => {
    const store = configureStore({
      reducer: {
        burgerConstructor: constructorReducer,
        ingredients: ingredientsReducer,
        ingredientDetails: ingredientDetailsReducer,
        order: orderReducer,
        profileOrders: profileOrdersReducer,
        auth: authReducer,
      },
    });

    const state = store.getState();

    // Проверяем структуру
    expect(state).toHaveProperty('burgerConstructor');
    expect(state).toHaveProperty('ingredients');
    expect(state).toHaveProperty('ingredientDetails');
    expect(state).toHaveProperty('order');
    expect(state).toHaveProperty('profileOrders');
    expect(state).toHaveProperty('auth');

    // Проверяем начальное состояние конструктора
    expect(state.burgerConstructor).toEqual({
      bun: null,
      ingredients: [],
      total: 0,
      count: 0,
      _lastAdd: null,
    });

    // Проверяем начальное состояние ингредиентов
    expect(state.ingredients).toEqual({
      items: [],
      bun: [],
      sauce: [],
      main: [],
      loading: false,
      error: null,
      success: false,
    });

    // Проверяем начальное состояние деталей ингредиента
    expect(state.ingredientDetails).toEqual({
      currentIngredient: null,
      isModalOpen: false,
    });

    // Проверяем начальное состояние заказа
    expect(state.order).toEqual({
      currentOrder: null,
      orderNumber: null,
      isModalOpen: false,
      success: false,
      loading: false,
      error: null,
    });

    // Проверяем начальное состояние профиля заказов - ИСПРАВЛЕНО!
    expect(state.profileOrders).toEqual({
      orders: [],
      total: 0,
      totalToday: 0,
      wsConnected: false,
      error: undefined,
    });

    // Проверяем начальное состояние авторизации
    expect(state.auth).toEqual({
      user: null,
      isAuth: false,
      isLoading: false,
      error: null,
      isCheckAuthStarted: false,
    });
  });

  it('should return the same state for unknown action', () => {
    const store = configureStore({
      reducer: {
        burgerConstructor: constructorReducer,
        ingredients: ingredientsReducer,
        ingredientDetails: ingredientDetailsReducer,
        order: orderReducer,
        profileOrders: profileOrdersReducer,
        auth: authReducer,
      },
    });

    const initialState = store.getState();
    store.dispatch({ type: 'UNKNOWN_ACTION' });
    
    expect(store.getState()).toEqual(initialState);
  });
});
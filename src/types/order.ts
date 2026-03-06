// src/types/order.ts
export type Ingredient = {
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

export type Order = {
  _id: string;
  ingredients: string[]; // IDs
  status: 'created' | 'pending' | 'done';
  name: string;
  createdAt: string; // ISO
  updatedAt: string; // ISO
  number: number;
  owner?: string;
  price?: number;
};

export type OrdersWsResponse = {
  success: boolean;
  orders: Order[];
  total: number;
  totalToday: number;
  message?: string;
};

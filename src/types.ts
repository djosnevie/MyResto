export interface Ingredient {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  type: 'ingredient';
}

export interface Boisson {
  id: string;
  name: string;
  quantity: number;
  price: number;
  type: 'boisson';
}

export interface Recipe {
  id: string;
  ingredients: {
    ingredientId: string;
    quantity: number;
  }[];
}

export interface Plat {
  id: string;
  name: string;
  price: number;
  recipeId: string;
  type: 'plat';
}

export interface Table {
  id: string;
  number: number;
  status: 'libre' | 'occupee' | 'servie';
}

export interface OrderItem {
  id: string;
  itemId: string;
  itemType: 'plat' | 'boisson';
  quantity: number;
  price: number;
}

export type PaymentMethod = 'cash' | 'card';

export interface Order {
  id: string;
  tableId: string;
  items: OrderItem[];
  status: 'en_attente' | 'servie' | 'payee';
  total: number;
  createdAt: string;
  paymentMethod?: PaymentMethod;
}
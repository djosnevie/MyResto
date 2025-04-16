import { create } from 'zustand';
import { Table, Order, Plat, Boisson, Ingredient, Recipe, PaymentMethod } from '../types';
import { format } from 'date-fns';

interface StoreState {
  tables: Table[];
  orders: Order[];
  plats: Plat[];
  boissons: Boisson[];
  ingredients: Ingredient[];
  recipes: Recipe[];
  updateTableStatus: (tableId: string, status: Table['status']) => void;
  createOrder: (tableId: string, items: Order['items']) => void;
  updateOrderStatus: (orderId: string, status: Order['status'], paymentMethod?: PaymentMethod) => void;
  updateStock: (orderId: string) => void;
  printInvoice: (orderId: string) => void;
}

export const useStore = create<StoreState>((set) => ({
  tables: Array.from({ length: 12 }, (_, i) => ({
    id: `table-${i + 1}`,
    number: i + 1,
    status: 'libre',
  })),
  orders: [],
  plats: [
    { id: 'plat-1', name: 'Steak Frites', price: 18.50, recipeId: 'recipe-1', type: 'plat' },
    { id: 'plat-2', name: 'Salade César', price: 14.00, recipeId: 'recipe-2', type: 'plat' },
  ],
  boissons: [
    { id: 'boisson-1', name: 'Coca-Cola', quantity: 100, price: 3.50, type: 'boisson' },
    { id: 'boisson-2', name: 'Eau minérale', quantity: 150, price: 2.50, type: 'boisson' },
  ],
  ingredients: [
    { id: 'ing-1', name: 'Steak', quantity: 50, unit: 'pièce', type: 'ingredient' },
    { id: 'ing-2', name: 'Pommes de terre', quantity: 100, unit: 'kg', type: 'ingredient' },
    { id: 'ing-3', name: 'Salade', quantity: 30, unit: 'kg', type: 'ingredient' },
  ],
  recipes: [
    {
      id: 'recipe-1',
      ingredients: [
        { ingredientId: 'ing-1', quantity: 1 },
        { ingredientId: 'ing-2', quantity: 0.3 },
      ],
    },
    {
      id: 'recipe-2',
      ingredients: [
        { ingredientId: 'ing-3', quantity: 0.2 },
      ],
    },
  ],
  updateTableStatus: (tableId: string, status: Table['status']) =>
    set((state) => ({
      tables: state.tables.map((table) =>
        table.id === tableId ? { ...table, status } : table
      ),
    })),
  createOrder: (tableId: string, items: Order['items']) =>
    set((state) => {
      const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const newOrder: Order = {
        id: `order-${Date.now()}`,
        tableId,
        items,
        status: 'en_attente',
        total,
        createdAt: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss"),
      };
      return {
        orders: [...state.orders, newOrder],
        tables: state.tables.map((table) =>
          table.id === tableId ? { ...table, status: 'occupee' } : table
        ),
      };
    }),
  updateOrderStatus: (orderId: string, status: Order['status'], paymentMethod?: PaymentMethod) =>
    set((state) => {
      const updatedOrders = state.orders.map((order) =>
        order.id === orderId
          ? { ...order, status, ...(paymentMethod && { paymentMethod }) }
          : order
      );

      return {
        orders: updatedOrders,
        tables: state.tables.map((table) =>
          table.id === state.orders.find((o) => o.id === orderId)?.tableId
            ? { ...table, status: status === 'payee' ? 'libre' : 'servie' }
            : table
        ),
      };
    }),
  updateStock: (orderId: string) =>
    set((state) => {
      const order = state.orders.find((o) => o.id === orderId);
      if (!order) return state;

      const updatedIngredients = [...state.ingredients];
      const updatedBoissons = [...state.boissons];

      order.items.forEach((item) => {
        if (item.itemType === 'plat') {
          const plat = state.plats.find((p) => p.id === item.itemId);
          if (!plat) return;

          const recipe = state.recipes.find((r) => r.id === plat.recipeId);
          if (!recipe) return;

          recipe.ingredients.forEach((recipeIng) => {
            const ingredientIndex = updatedIngredients.findIndex(
              (i) => i.id === recipeIng.ingredientId
            );
            if (ingredientIndex !== -1) {
              updatedIngredients[ingredientIndex] = {
                ...updatedIngredients[ingredientIndex],
                quantity:
                  updatedIngredients[ingredientIndex].quantity -
                  recipeIng.quantity * item.quantity,
              };
            }
          });
        } else if (item.itemType === 'boisson') {
          const boissonIndex = updatedBoissons.findIndex((b) => b.id === item.itemId);
          if (boissonIndex !== -1) {
            updatedBoissons[boissonIndex] = {
              ...updatedBoissons[boissonIndex],
              quantity: updatedBoissons[boissonIndex].quantity - item.quantity,
            };
          }
        }
      });

      return {
        ingredients: updatedIngredients,
        boissons: updatedBoissons,
      };
    }),
  printInvoice: (orderId: string) => {
    const order = useStore.getState().orders.find((o) => o.id === orderId);
    if (!order) return;

    const table = useStore.getState().tables.find((t) => t.id === order.tableId);
    const items = order.items.map((item) => {
      const itemDetails = item.itemType === 'plat'
        ? useStore.getState().plats.find((p) => p.id === item.itemId)
        : useStore.getState().boissons.find((b) => b.id === item.itemId);
      return {
        name: itemDetails?.name,
        quantity: item.quantity,
        price: item.price,
        total: item.quantity * item.price
      };
    });

    // Create and print the invoice
    const invoice = window.open('', 'PRINT', 'height=800,width=600');
    if (!invoice) return;

    invoice.document.write(`
      <html>
        <head>
          <title>Facture</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 20px; }
            .details { margin-bottom: 20px; }
            .items { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            .items th, .items td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .total { text-align: right; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Restaurant Manager</h1>
            <p>Facture #${order.id}</p>
          </div>
          <div class="details">
            <p>Date: ${format(new Date(order.createdAt), 'dd/MM/yyyy HH:mm')}</p>
            <p>Table: ${table?.number}</p>
            <p>Mode de paiement: ${order.paymentMethod === 'card' ? 'Carte bancaire' : 'Espèces'}</p>
          </div>
          <table class="items">
            <thead>
              <tr>
                <th>Article</th>
                <th>Quantité</th>
                <th>Prix unitaire</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${items.map(item => `
                <tr>
                  <td>${item.name}</td>
                  <td>${item.quantity}</td>
                  <td>${item.price.toFixed(2)}€</td>
                  <td>${item.total.toFixed(2)}€</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="total">
            <p>Total: ${order.total.toFixed(2)}€</p>
          </div>
        </body>
      </html>
    `);
    invoice.document.close();
    invoice.focus();
    invoice.print();
    invoice.close();
  },
}));
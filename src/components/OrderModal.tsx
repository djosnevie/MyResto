import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useStore } from '../lib/store';
import { OrderItem } from '../types';

interface OrderModalProps {
  tableId: string;
  onClose: () => void;
}

export function OrderModal({ tableId, onClose }: OrderModalProps) {
  const { plats, boissons, createOrder } = useStore();
  const [items, setItems] = useState<OrderItem[]>([]);

  const addItem = (itemId: string, itemType: 'plat' | 'boisson') => {
    const item = itemType === 'plat'
      ? plats.find((p) => p.id === itemId)
      : boissons.find((b) => b.id === itemId);

    if (!item) return;

    const existingItem = items.find((i) => i.itemId === itemId);
    if (existingItem) {
      setItems(items.map((i) =>
        i.itemId === itemId
          ? { ...i, quantity: i.quantity + 1 }
          : i
      ));
    } else {
      setItems([...items, {
        id: `item-${Date.now()}`,
        itemId: item.id,
        itemType,
        quantity: 1,
        price: item.price,
      }]);
    }
  };

  const removeItem = (itemId: string) => {
    setItems(items.filter((i) => i.itemId !== itemId));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    createOrder(tableId, items);
    onClose();
  };

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Nouvelle Commande</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="font-medium mb-2">Plats</h3>
              <div className="space-y-2">
                {plats.map((plat) => (
                  <button
                    key={plat.id}
                    type="button"
                    onClick={() => addItem(plat.id, 'plat')}
                    className="w-full text-left px-4 py-2 rounded border hover:bg-gray-50"
                  >
                    {plat.name} - {plat.price.toFixed(2)}€
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-2">Boissons</h3>
              <div className="space-y-2">
                {boissons.map((boisson) => (
                  <button
                    key={boisson.id}
                    type="button"
                    onClick={() => addItem(boisson.id, 'boisson')}
                    className="w-full text-left px-4 py-2 rounded border hover:bg-gray-50"
                  >
                    {boisson.name} - {boisson.price.toFixed(2)}€
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-medium mb-2">Commande en cours</h3>
            <div className="space-y-2 mb-4">
              {items.map((item) => {
                const itemDetails = item.itemType === 'plat'
                  ? plats.find((p) => p.id === item.itemId)
                  : boissons.find((b) => b.id === item.itemId);

                return (
                  <div key={item.id} className="flex justify-between items-center">
                    <span>
                      {itemDetails?.name} x{item.quantity}
                    </span>
                    <div className="flex items-center space-x-2">
                      <span>{(item.price * item.quantity).toFixed(2)}€</span>
                      <button
                        type="button"
                        onClick={() => removeItem(item.itemId)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between items-center font-semibold text-lg mb-4">
              <span>Total</span>
              <span>{total.toFixed(2)}€</span>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={items.length === 0}
                className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
              >
                Valider la commande
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
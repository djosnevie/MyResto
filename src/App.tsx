import React from 'react';
import { CircleUserRound, Coffee, UtensilsCrossed } from 'lucide-react';
import { useState } from 'react';
import { useStore } from './lib/store';
import { OrderModal } from './components/OrderModal';
import { format } from 'date-fns';
import { PaymentMethod } from './types';

function App() {
  const [activeTab, setActiveTab] = useState<'tables' | 'stock' | 'orders'>('tables');
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const { tables, orders, plats, boissons, ingredients, updateOrderStatus, updateStock, printInvoice } = useStore();

  const handleOrderStatus = (orderId: string, newStatus: 'en_attente' | 'servie' | 'payee') => {
    if (newStatus === 'payee') {
      setSelectedOrderId(orderId);
      setShowPaymentModal(true);
    } else {
      updateOrderStatus(orderId, newStatus);
      if (newStatus === 'servie') {
        updateStock(orderId);
      }
    }
  };

  const handlePayment = (paymentMethod: PaymentMethod) => {
    if (selectedOrderId) {
      updateOrderStatus(selectedOrderId, 'payee', paymentMethod);
      updateStock(selectedOrderId);
      printInvoice(selectedOrderId);
      setShowPaymentModal(false);
      setSelectedOrderId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <UtensilsCrossed className="h-8 w-8 text-indigo-600" />
              <h1 className="ml-2 text-xl font-semibold text-gray-900">Restaurant Manager</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 rounded-full hover:bg-gray-100">
                <Coffee className="h-6 w-6 text-gray-600" />
              </button>
              <button className="p-2 rounded-full hover:bg-gray-100">
                <CircleUserRound className="h-6 w-6 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('tables')}
              className={`px-3 py-2 text-sm font-medium ${
                activeTab === 'tables'
                  ? 'border-b-2 border-indigo-500 text-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Tables
            </button>
            <button
              onClick={() => setActiveTab('stock')}
              className={`px-3 py-2 text-sm font-medium ${
                activeTab === 'stock'
                  ? 'border-b-2 border-indigo-500 text-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Stock
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-3 py-2 text-sm font-medium ${
                activeTab === 'orders'
                  ? 'border-b-2 border-indigo-500 text-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Commandes
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'tables' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tables.map((table) => (
              <div
                key={table.id}
                className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">Table {table.number}</h3>
                  <span
                    className={`px-2 py-1 text-sm rounded-full ${
                      table.status === 'libre'
                        ? 'bg-green-100 text-green-800'
                        : table.status === 'occupee'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {table.status.charAt(0).toUpperCase() + table.status.slice(1)}
                  </span>
                </div>
                <div className="mt-4">
                  <button
                    onClick={() => setSelectedTableId(table.id)}
                    disabled={table.status !== 'libre'}
                    className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50"
                  >
                    Prendre commande
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'stock' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Plats</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {plats.map((plat) => (
                    <div key={plat.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{plat.name}</span>
                        <span className="text-gray-600">{plat.price.toFixed(2)}€</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Boissons</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {boissons.map((boisson) => (
                    <div key={boisson.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{boisson.name}</span>
                        <span className="text-gray-600">{boisson.quantity} en stock</span>
                      </div>
                      <div className="mt-2 text-sm text-gray-600">
                        Prix: {boisson.price.toFixed(2)}€
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Ingrédients</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {ingredients.map((ingredient) => (
                    <div key={ingredient.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{ingredient.name}</span>
                        <span className="text-gray-600">
                          {ingredient.quantity} {ingredient.unit}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-6">
            {orders.map((order) => {
              const table = tables.find((t) => t.id === order.tableId);
              return (
                <div key={order.id} className="bg-white rounded-lg shadow">
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          Commande - Table {table?.number}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {format(new Date(order.createdAt), 'dd/MM/yyyy HH:mm')}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 text-sm rounded-full ${
                          order.status === 'en_attente'
                            ? 'bg-yellow-100 text-yellow-800'
                            : order.status === 'servie'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {order.status.replace('_', ' ').charAt(0).toUpperCase() +
                          order.status.slice(1)}
                      </span>
                    </div>

                    <div className="mt-4 space-y-2">
                      {order.items.map((item) => {
                        const itemDetails = item.itemType === 'plat'
                          ? plats.find((p) => p.id === item.itemId)
                          : boissons.find((b) => b.id === item.itemId);
                        return (
                          <div key={item.id} className="flex justify-between items-center">
                            <span>
                              {itemDetails?.name} x{item.quantity}
                            </span>
                            <span>{(item.price * item.quantity).toFixed(2)}€</span>
                          </div>
                        );
                      })}
                      <div className="pt-2 border-t flex justify-between items-center font-semibold">
                        <span>Total</span>
                        <span>{order.total.toFixed(2)}€</span>
                      </div>
                    </div>

                    <div className="mt-4 flex justify-end space-x-2">
                      {order.status === 'en_attente' && (
                        <button
                          onClick={() => handleOrderStatus(order.id, 'servie')}
                          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                        >
                          Marquer comme servie
                        </button>
                      )}
                      {order.status === 'servie' && (
                        <button
                          onClick={() => handleOrderStatus(order.id, 'payee')}
                          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                        >
                          Procéder au paiement
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {selectedTableId && (
        <OrderModal
          tableId={selectedTableId}
          onClose={() => setSelectedTableId(null)}
        />
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Choisir le mode de paiement</h2>
            <div className="space-y-3">
              <button
                onClick={() => handlePayment('card')}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
              >
                Carte bancaire
              </button>
              <button
                onClick={() => handlePayment('cash')}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
              >
                Espèces
              </button>
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  setSelectedOrderId(null);
                }}
                className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  ArrowRight, 
  CheckCircle,
  Truck,
  CreditCard,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const Cart: React.FC = () => {
  const { user } = useAuth();
  const { items, updateQuantity, removeFromCart, clearCart, totalAmount, totalItems } = useCart();
  
  // Checkout loading/success states
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Shipping calculation
  const shippingCost = totalAmount > 100 || totalAmount === 0 ? 0 : 15;
  const finalTotal = totalAmount + shippingCost;

  const handleCheckout = async () => {
    if (items.length === 0) return;
    if (!user) {
      setErrorMsg('Debes iniciar sesión para finalizar la compra.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      // Loop through cart items and decrement stock in Firestore
      for (const item of items) {
        const productRef = doc(db, 'products', item.product.id);
        const productSnap = await getDoc(productRef);

        if (productSnap.exists()) {
          const currentStock = Number(productSnap.data().stock || 0);
          const newStock = Math.max(0, currentStock - item.quantity);
          await updateDoc(productRef, { stock: newStock });
        }
      }

      // Success sequence
      setSuccess(true);
      clearCart();
    } catch (error) {
      console.error('Error during simulated purchase:', error);
      setErrorMsg('Error al procesar la compra en la base de datos. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md mx-auto text-center py-16 px-6 bg-white border border-gray-100 rounded-3xl shadow-sm space-y-6"
      >
        <div className="h-16 w-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">¡Compra Confirmada!</h2>
          <p className="text-sm text-gray-500 leading-relaxed">
            Tu pedido ha sido procesado con éxito. Hemos descontado el stock correspondiente de la base de datos de Firestore.
          </p>
        </div>
        <div className="pt-4 border-t border-gray-50 flex flex-col space-y-2">
          <button
            onClick={() => {
              setSuccess(false);
              window.location.hash = '#/productos';
            }}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-xl text-sm transition-colors shadow-sm cursor-pointer"
          >
            Seguir Comprando
          </button>
        </div>
      </motion.div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center py-16 px-6 bg-white border border-gray-100 rounded-3xl shadow-sm space-y-6">
        <div className="h-14 w-14 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
          <ShoppingBag className="h-6 w-6" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-gray-900">Tu carrito está vacío</h2>
          <p className="text-sm text-gray-500 leading-relaxed">
            Parece que aún no has agregado ningún producto. Visita nuestra sección de catálogo para empezar a comprar.
          </p>
        </div>
        <div className="pt-2">
          <a
            href="#/productos"
            className="inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl text-sm shadow-sm transition-colors cursor-pointer"
          >
            <span>Ver Catálogo</span>
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Tu Carrito</h1>
        <p className="text-sm text-gray-500">Revisa y ajusta las cantidades de tus productos seleccionados.</p>
      </div>

      {errorMsg && (
        <div className="bg-amber-50 text-amber-700 p-4 rounded-2xl border border-amber-100 flex items-center space-x-2 text-sm">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items List Column */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-gray-50 pb-4">
              <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">Detalle del Producto</span>
              <button
                onClick={clearCart}
                className="text-xs text-red-500 hover:text-red-700 font-semibold flex items-center space-x-1 hover:underline cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Vaciar Carrito</span>
              </button>
            </div>

            <div className="divide-y divide-gray-50">
              {items.map((item) => (
                <div key={item.product.id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Photo & Name */}
                  <div className="flex items-center space-x-4">
                    <img
                      src={item.product.image}
                      alt={item.product.title}
                      referrerPolicy="no-referrer"
                      className="h-16 w-16 object-cover rounded-xl border border-gray-100"
                    />
                    <div>
                      <span className="text-xxs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider">
                        {item.product.category}
                      </span>
                      <h3 className="font-bold text-gray-900 mt-1">{item.product.title}</h3>
                      <span className="text-xs text-gray-400">Stock disponible: {item.product.stock}</span>
                    </div>
                  </div>

                  {/* Quantity and Price adjustment */}
                  <div className="flex items-center justify-between sm:justify-end gap-6 sm:gap-8">
                    {/* Price */}
                    <div className="text-left sm:text-right">
                      <span className="text-xs text-gray-400 block font-medium">Precio</span>
                      <span className="font-bold text-gray-900">${item.product.price.toLocaleString('es-ES')}</span>
                    </div>

                    {/* Quantity Selector */}
                    <div className="flex items-center space-x-1 bg-gray-50 p-1.5 rounded-xl border border-gray-100">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="p-1 text-gray-500 hover:bg-white rounded-lg transition-colors cursor-pointer"
                        title="Restar unidad"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-8 text-center text-xs font-bold text-gray-800">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        disabled={item.quantity >= item.product.stock}
                        className={`p-1 rounded-lg transition-colors cursor-pointer ${
                          item.quantity >= item.product.stock 
                            ? 'text-gray-300 cursor-not-allowed'
                            : 'text-gray-500 hover:bg-white'
                        }`}
                        title="Sumar unidad"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {/* Delete button */}
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                      title="Quitar del carrito"
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Checkout summary column */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-6">
            <h3 className="text-lg font-bold text-gray-900 border-b border-gray-50 pb-4">Resumen de Compra</h3>

            <div className="space-y-3.5 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal ({totalItems} items)</span>
                <span className="font-bold text-gray-900">${totalAmount.toLocaleString('es-ES')}</span>
              </div>

              <div className="flex justify-between text-gray-600 items-center">
                <span className="flex items-center space-x-1">
                  <Truck className="h-4 w-4 text-gray-400" />
                  <span>Envío</span>
                </span>
                {shippingCost === 0 ? (
                  <span className="text-emerald-600 font-bold">Gratis</span>
                ) : (
                  <span className="font-bold text-gray-900">${shippingCost}</span>
                )}
              </div>

              {shippingCost > 0 && (
                <div className="text-xxs text-amber-600 bg-amber-50 p-2.5 rounded-lg border border-amber-100 leading-normal">
                  ¡Agrega <strong>${(100 - totalAmount).toFixed(0)}</strong> más en productos para obtener envío gratis!
                </div>
              )}

              <hr className="border-gray-50 my-1" />

              <div className="flex justify-between items-end text-base">
                <span className="font-bold text-gray-900">Total</span>
                <span className="text-xl font-black text-indigo-600">${finalTotal.toLocaleString('es-ES')}</span>
              </div>
            </div>

            {/* User Session checks before Checkout */}
            {user ? (
              <button
                onClick={handleCheckout}
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-4 rounded-xl text-sm transition-all flex items-center justify-center space-x-2 shadow-sm cursor-pointer hover:shadow-indigo-500/20 active:scale-95 disabled:bg-indigo-400 disabled:cursor-not-allowed"
              >
                <CreditCard className="h-4 w-4" />
                <span>{loading ? 'Procesando...' : 'Finalizar Compra'}</span>
              </button>
            ) : (
              <div className="space-y-3">
                <a
                  href="#/auth"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-4 rounded-xl text-sm transition-all flex items-center justify-center space-x-2 shadow-sm cursor-pointer text-center"
                >
                  <span>Iniciar Sesión para Pagar</span>
                </a>
                <span className="text-xxs text-gray-400 block text-center">Debes estar registrado para guardar tus compras.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

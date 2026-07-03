import React from 'react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { ShoppingCart, Eye, AlertTriangle } from 'lucide-react';
import { motion } from 'motion/react';

interface ProductCardProps {
  product: Product;
  onOpenDetails: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onOpenDetails }) => {
  const { addToCart, items } = useCart();

  // Find quantity in cart
  const cartItem = items.find((item) => item.product.id === product.id);
  const qtyInCart = cartItem ? cartItem.quantity : 0;
  const remainingStock = product.stock - qtyInCart;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (remainingStock > 0) {
      addToCart(product, 1);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-xs hover:shadow-md transition-all flex flex-col h-full group"
    >
      {/* Product Image */}
      <div 
        onClick={() => onOpenDetails(product)}
        className="relative pt-[75%] bg-gray-50 overflow-hidden cursor-pointer"
      >
        <img
          src={product.image}
          alt={product.title}
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          <span className="bg-white/90 backdrop-blur-xs text-indigo-700 font-semibold px-2.5 py-1 rounded-full text-xxs tracking-wider uppercase">
            {product.category}
          </span>
        </div>
        
        {/* Hover overlay for details */}
        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenDetails(product);
            }}
            className="p-3 bg-white text-gray-900 rounded-full shadow-lg hover:bg-indigo-600 hover:text-white transition-colors cursor-pointer"
            title="Ver Detalle"
          >
            <Eye className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Product Details */}
      <div className="p-5 flex flex-col flex-grow">
        <div className="mb-2">
          <span className="text-xs text-gray-400 font-medium tracking-wide uppercase">
            {product.category}
          </span>
          <h3 
            onClick={() => onOpenDetails(product)}
            className="text-base font-semibold text-gray-900 hover:text-indigo-600 transition-colors mt-0.5 line-clamp-1 cursor-pointer"
          >
            {product.title}
          </h3>
        </div>

        <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-grow">
          {product.description}
        </p>

        {/* Stock status */}
        <div className="mb-4">
          {product.stock === 0 ? (
            <span className="inline-flex items-center space-x-1 text-xs text-red-500 font-medium">
              <AlertTriangle className="h-3 w-3" />
              <span>Sin stock disponible</span>
            </span>
          ) : remainingStock === 0 ? (
            <span className="inline-flex items-center space-x-1 text-xs text-amber-500 font-medium">
              <AlertTriangle className="h-3 w-3" />
              <span>Límite de stock en carrito</span>
            </span>
          ) : remainingStock <= 3 ? (
            <span className="inline-flex items-center space-x-1 text-xs text-amber-500 font-medium">
              <span>¡Solo quedan {remainingStock} unidades!</span>
            </span>
          ) : (
            <span className="inline-flex items-center space-x-1 text-xs text-emerald-600 font-medium">
              <span>{remainingStock} disponibles</span>
            </span>
          )}
        </div>

        {/* Price & Action Button */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-50 mt-auto">
          <span className="text-lg font-bold text-gray-900">
            ${product.price.toLocaleString('es-ES')}
          </span>
          
          <button
            onClick={handleAddToCart}
            disabled={remainingStock <= 0}
            className={`flex items-center space-x-1 px-4 py-2 rounded-xl text-xs font-semibold transition-all shadow-xs cursor-pointer ${
              remainingStock > 0
                ? 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            <ShoppingCart className="h-4 w-4" />
            <span>{qtyInCart > 0 ? `En Carrito (${qtyInCart})` : 'Añadir'}</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};

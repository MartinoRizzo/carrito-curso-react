import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { 
  ShoppingCart, 
  Menu, 
  X, 
  LogOut, 
  LayoutDashboard, 
  ShoppingBag,
  User
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleLogout = async () => {
    try {
      await logout();
      window.location.hash = '#/';
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const navLinks = [
    { label: 'Inicio', href: '#/' },
    { label: 'Productos', href: '#/productos' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <a href="#/" className="flex items-center space-x-2 text-indigo-600 font-bold text-xl tracking-tight">
              <ShoppingBag className="h-6 w-6" />
              <span>ElectroCart</span>
            </a>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-gray-600 hover:text-indigo-600 font-medium transition-colors text-sm"
              >
                {link.label}
              </a>
            ))}

            {/* Admin Dashboard Link */}
            {user?.role === 'admin' && (
              <a
                href="#/dashboard"
                className="flex items-center space-x-1 text-amber-600 hover:text-amber-700 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-lg font-medium transition-colors text-xs"
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>Panel Admin</span>
              </a>
            )}
          </div>

          {/* Action buttons & Cart */}
          <div className="hidden md:flex items-center space-x-4">
            <a href="#/carrito" className="relative p-2 text-gray-600 hover:text-indigo-600 transition-colors">
              <ShoppingCart className="h-6 w-6" />
              {totalItems > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xxs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full"
                >
                  {totalItems}
                </motion.span>
              )}
            </a>

            {user ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-gray-700 font-medium text-sm">
                  <div className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                    {user.displayName ? user.displayName.charAt(0).toUpperCase() : <User className="h-4 w-4" />}
                  </div>
                  <span className="max-w-[120px] truncate">{user.displayName || 'Usuario'}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 text-gray-500 hover:text-red-600 p-2 text-sm font-medium transition-colors cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Salir</span>
                </button>
              </div>
            ) : (
              <a
                href="#/auth"
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-colors cursor-pointer"
              >
                Iniciar Sesión
              </a>
            )}
          </div>

          {/* Mobile hamburger button */}
          <div className="flex items-center md:hidden space-x-4">
            {/* Mobile Cart Button */}
            <a href="#/carrito" className="relative p-2 text-gray-600 hover:text-indigo-600 transition-colors">
              <ShoppingCart className="h-6 w-6" />
              {totalItems > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xxs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
                  {totalItems}
                </span>
              )}
            </a>

            <button
              onClick={toggleMenu}
              className="p-2 rounded-md text-gray-600 hover:text-gray-900 focus:outline-hidden cursor-pointer"
              id="hamburger-btn"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-gray-100 overflow-hidden"
          >
            <div className="px-2 pt-2 pb-4 space-y-1 sm:px-3">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50 transition-colors"
                >
                  {link.label}
                </a>
              ))}

              {user?.role === 'admin' && (
                <a
                  href="#/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-amber-600 hover:bg-amber-50"
                >
                  <LayoutDashboard className="h-5 w-5" />
                  <span>Panel Administrador</span>
                </a>
              )}

              <hr className="my-2 border-gray-100" />

              {user ? (
                <div className="space-y-2">
                  <div className="flex items-center space-x-3 px-3 py-2">
                    <div className="h-10 w-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-lg">
                      {user.displayName ? user.displayName.charAt(0).toUpperCase() : <User className="h-5 w-5" />}
                    </div>
                    <div>
                      <div className="text-base font-medium text-gray-800">{user.displayName || 'Usuario'}</div>
                      <div className="text-sm font-medium text-gray-500">{user.email}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      handleLogout();
                    }}
                    className="flex w-full items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50 cursor-pointer"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Cerrar Sesión</span>
                  </button>
                </div>
              ) : (
                <a
                  href="#/auth"
                  onClick={() => setIsOpen(false)}
                  className="block text-center px-4 py-2 mx-3 border border-transparent text-base font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs"
                >
                  Iniciar Sesión
                </a>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

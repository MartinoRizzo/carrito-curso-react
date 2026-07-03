import { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { Products } from './pages/Products';
import { Dashboard } from './pages/Dashboard';
import { Cart } from './pages/Cart';
import { Auth } from './pages/Auth';
import { ProductDetailModal } from './components/ProductDetailModal';
import { db } from './firebase';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { seedProductsIfEmpty } from './utils/seed';
import { Product } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Sparkles, MapPin, Phone, Mail } from 'lucide-react';

function MainApp() {
  const [currentHash, setCurrentHash] = useState(() => window.location.hash || '#/');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Hash listener for in-memory / bookmark-friendly state-routing
  useEffect(() => {
    const handleHashChange = () => {
      setCurrentHash(window.location.hash || '#/');
      // Scroll to top upon transition
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Seed Firestore products if empty & set up real-time listener
  useEffect(() => {
    const initializeCatalog = async () => {
      // First seed the catalog if Firestore has zero items
      await seedProductsIfEmpty();

      // Listen for products in real-time
      const productsRef = collection(db, 'products');
      const q = query(productsRef);

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const items: Product[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          items.push({
            id: doc.id,
            title: data.title,
            price: Number(data.price),
            description: data.description,
            image: data.image,
            stock: Number(data.stock),
            category: data.category
          });
        });
        setProducts(items);
        setLoading(false);
      }, (error) => {
        console.error("Error with products listener:", error);
        setLoading(false);
      });

      return unsubscribe;
    };

    const cleanupPromise = initializeCatalog();
    return () => {
      cleanupPromise.then((unsubscribe) => {
        if (typeof unsubscribe === 'function') unsubscribe();
      });
    };
  }, []);

  const navigateToProducts = () => {
    window.location.hash = '#/productos';
  };

  // Route Dispatcher
  const renderRoute = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-indigo-600 border-r-2"></div>
          <span className="text-sm text-gray-500 font-medium">Iniciando catálogo y conectando con Firestore...</span>
        </div>
      );
    }

    switch (currentHash) {
      case '#/':
      case '#':
        return (
          <Home 
            products={products} 
            onOpenDetails={setSelectedProduct} 
            onNavigateToProducts={navigateToProducts} 
          />
        );
      case '#/productos':
        return (
          <Products 
            products={products} 
            onOpenDetails={setSelectedProduct} 
          />
        );
      case '#/dashboard':
        return <Dashboard />;
      case '#/carrito':
        return <Cart />;
      case '#/auth':
        return <Auth />;
      default:
        return (
          <div className="text-center py-20 space-y-4">
            <h2 className="text-xl font-bold text-gray-900">404 - Página no encontrada</h2>
            <a href="#/" className="text-indigo-600 hover:underline">Volver al inicio</a>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col text-gray-800">
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentHash}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {renderRoute()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 mt-20 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 pb-8 border-b border-slate-800">
            {/* Column 1: Info */}
            <div className="space-y-4">
              <span className="text-white font-bold text-lg tracking-tight flex items-center space-x-2">
                <Sparkles className="h-5 w-5 text-indigo-400" />
                <span>ElectroCart Premium</span>
              </span>
              <p className="text-xs text-slate-400 leading-relaxed">
                Plataforma de comercio electrónico diseñada como Proyecto Final de React JS, integrada de forma nativa con Firebase Authentication y Cloud Firestore.
              </p>
            </div>

            {/* Column 2: Tech Specs */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Especificaciones Técnicas</h4>
              <ul className="text-xs text-slate-400 space-y-2 font-mono">
                <li>• React 19 + TypeScript</li>
                <li>• Tailwind CSS v4 (Mobile First)</li>
                <li>• Cloud Firestore Real-time Engine</li>
                <li>• Firebase Email Authentication</li>
              </ul>
            </div>

            {/* Column 3: Contact */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Contacto & Soporte</h4>
              <div className="text-xs text-slate-400 space-y-2">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-3.5 w-3.5 text-slate-500" />
                  <span>Soporte Académico - React JS</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="h-3.5 w-3.5 text-slate-500" />
                  <span>+54 (11) 5555-0199</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="h-3.5 w-3.5 text-slate-500" />
                  <span>martingabriel.rizzo@gmail.com</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between text-xxs text-slate-500">
            <span>© 2026 ElectroCart. Todos los derechos reservados. Proyecto Final de Alto Rendimiento.</span>
            <div className="flex items-center space-x-2 mt-2 sm:mt-0 font-medium">
              <Shield className="h-3.5 w-3.5 text-indigo-400" />
              <span className="text-slate-400">Protección por Reglas de Seguridad de Firestore</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <MainApp />
      </CartProvider>
    </AuthProvider>
  );
}

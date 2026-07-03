import React from 'react';
import { Product } from '../types';
import { ShoppingBag, Truck, ShieldCheck, Headphones, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

interface HomeProps {
  products: Product[];
  onOpenDetails: (product: Product) => void;
  onNavigateToProducts: () => void;
}

export const Home: React.FC<HomeProps> = ({ products, onOpenDetails, onNavigateToProducts }) => {
  // Get top 4 products for featured section
  const featuredProducts = products.slice(0, 4);

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative rounded-3xl overflow-hidden bg-slate-900 text-white shadow-xl">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1468495244123-6c6c332eeece?auto=format&fit=crop&q=80&w=1200"
            alt="Hero background"
            className="w-full h-full object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/90 to-transparent" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-2xl px-6 py-16 sm:px-12 sm:py-24 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="bg-indigo-600 text-white font-bold tracking-wider text-xxs uppercase px-3 py-1 rounded-full">
              Nueva Colección 2026
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-5xl font-black tracking-tight leading-none"
          >
            Tecnología Premium a un clic de distancia
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-base text-slate-300 leading-relaxed max-w-lg"
          >
            Explora nuestra cuidada selección de dispositivos electrónicos de alta gama. Equipamiento de primer nivel para tus necesidades diarias.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="pt-2"
          >
            <button
              onClick={onNavigateToProducts}
              className="inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-3.5 rounded-xl shadow-md hover:shadow-indigo-500/20 active:scale-95 transition-all cursor-pointer text-sm"
            >
              <span>Explorar Productos</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          {
            icon: <Truck className="h-6 w-6 text-indigo-600" />,
            title: "Envío Gratis Express",
            desc: "En compras superiores a $100 en todo el país."
          },
          {
            icon: <ShieldCheck className="h-6 w-6 text-indigo-600" />,
            title: "Garantía Oficial",
            desc: "Todos nuestros productos tienen 1 año de garantía escrita."
          },
          {
            icon: <Headphones className="h-6 w-6 text-indigo-600" />,
            title: "Soporte Premium 24/7",
            desc: "Atención personalizada para resolver todas tus dudas."
          }
        ].map((badge, i) => (
          <div
            key={i}
            className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs flex items-start space-x-4"
          >
            <div className="p-3 bg-indigo-50 rounded-xl">
              {badge.icon}
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900 mb-0.5">{badge.title}</h4>
              <p className="text-xs text-gray-500 leading-normal">{badge.desc}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Featured Section */}
      <section className="space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Productos Destacados</h2>
            <p className="text-sm text-gray-500">Nuestros productos más valorados por los usuarios.</p>
          </div>
          <button
            onClick={onNavigateToProducts}
            className="text-indigo-600 hover:text-indigo-700 font-bold text-sm flex items-center space-x-1 hover:underline cursor-pointer"
          >
            <span>Ver todos</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {featuredProducts.length === 0 ? (
          <div className="text-center py-12 text-gray-400">Cargando productos destacados...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((p) => (
              <motion.div
                key={p.id}
                whileHover={{ y: -5 }}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col h-full group"
                onClick={() => onOpenDetails(p)}
              >
                <div className="relative pt-[75%] bg-gray-50 overflow-hidden">
                  <img
                    src={p.image}
                    alt={p.title}
                    referrerPolicy="no-referrer"
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs text-indigo-700 font-bold px-2.5 py-0.5 rounded-full text-xxs tracking-wider uppercase">
                    {p.category}
                  </span>
                </div>
                <div className="p-4 flex flex-col flex-grow">
                  <h3 className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-1 mb-1">
                    {p.title}
                  </h3>
                  <p className="text-xs text-gray-500 line-clamp-2 mb-3">
                    {p.description}
                  </p>
                  <div className="flex items-center justify-between pt-3 border-t border-gray-50 mt-auto">
                    <span className="font-extrabold text-gray-900">
                      ${p.price.toLocaleString('es-ES')}
                    </span>
                    <span className="text-xxs font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">
                      Ver Detalle
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Banner promo */}
      <section className="bg-linear-to-r from-indigo-600 to-indigo-800 text-white p-8 sm:p-12 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-8 shadow-lg">
        <div className="space-y-2 max-w-lg">
          <h3 className="text-xl sm:text-2xl font-black">Regístrate para recibir beneficios exclusivos</h3>
          <p className="text-sm text-indigo-100 leading-relaxed">
            Crea tu cuenta hoy y obtén un 10% de descuento en tu primera compra, además de acceso a ofertas exclusivas para miembros.
          </p>
        </div>
        <a
          href="#/auth"
          className="bg-white text-indigo-700 font-bold px-6 py-3 rounded-xl shadow-md hover:bg-indigo-50 transition-colors whitespace-nowrap text-sm cursor-pointer"
        >
          Crear mi Cuenta
        </a>
      </section>
    </div>
  );
};

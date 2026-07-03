import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ProductCRUD } from '../components/ProductCRUD';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { 
  Lock, 
  ArrowLeft, 
  BarChart3, 
  Package, 
  Layers, 
  TrendingUp, 
  UserCheck 
} from 'lucide-react';
import { motion } from 'motion/react';

export const Dashboard: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalStock: 0,
    avgPrice: 0,
    categoriesCount: 0
  });
  const [statsLoading, setStatsLoading] = useState(false);

  useEffect(() => {
    if (user?.role !== 'admin') return;

    const fetchStats = async () => {
      setStatsLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, 'products'));
        let count = 0;
        let stockSum = 0;
        let priceSum = 0;
        const uniqCategories = new Set<string>();

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          count++;
          stockSum += Number(data.stock || 0);
          priceSum += Number(data.price || 0);
          if (data.category) uniqCategories.add(data.category);
        });

        setStats({
          totalProducts: count,
          totalStock: stockSum,
          avgPrice: count > 0 ? Math.round(priceSum / count) : 0,
          categoriesCount: uniqCategories.size
        });
      } catch (error) {
        console.error('Error fetching admin stats:', error);
      } finally {
        setStatsLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  // Loading state
  if (authLoading) {
    return (
      <div className="text-center py-24 text-gray-500">
        Verificando credenciales de administrador...
      </div>
    );
  }

  // Authorization barrier
  if (!user || user.role !== 'admin') {
    return (
      <div className="max-w-md mx-auto text-center py-20 px-6 bg-white border border-gray-100 rounded-3xl shadow-sm space-y-6">
        <div className="h-14 w-14 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
          <Lock className="h-6 w-6" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-gray-900">Acceso No Autorizado</h2>
          <p className="text-sm text-gray-500 leading-relaxed">
            Esta sección es exclusiva para administradores del sitio. Inicia sesión con una cuenta de administrador para continuar.
          </p>
        </div>
        <div className="flex flex-col space-y-2">
          <a
            href="#/auth"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-4 rounded-xl text-sm transition-colors shadow-xs"
          >
            Iniciar Sesión como Admin
          </a>
          <a
            href="#/"
            className="w-full text-gray-500 hover:bg-gray-50 font-semibold py-2.5 px-4 rounded-xl text-sm transition-colors flex items-center justify-center space-x-1"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Volver al Inicio</span>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Dashboard Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center space-x-3">
            <BarChart3 className="h-8 w-8 text-amber-500" />
            <span>Panel de Control Administrativo</span>
          </h1>
          <p className="text-sm text-gray-500">Gestiona el catálogo de productos de ElectroCart en tiempo real en Firestore.</p>
        </div>
        <div className="text-xs text-gray-400 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg font-mono">
          Rol: <span className="font-bold text-amber-600 uppercase">{user.role}</span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            icon: <Package className="h-5 w-5 text-indigo-600" />,
            title: "Total Productos",
            value: statsLoading ? "..." : stats.totalProducts,
            desc: "Disponibles en catálogo"
          },
          {
            icon: <Layers className="h-5 w-5 text-emerald-600" />,
            title: "Categorías",
            value: statsLoading ? "..." : stats.categoriesCount,
            desc: "Rubros activos"
          },
          {
            icon: <TrendingUp className="h-5 w-5 text-amber-600" />,
            title: "Precio Promedio",
            value: statsLoading ? "..." : `$${stats.avgPrice}`,
            desc: "Valor medio de catálogo"
          },
          {
            icon: <UserCheck className="h-5 w-5 text-pink-600" />,
            title: "Stock Total",
            value: statsLoading ? "..." : stats.totalStock,
            desc: "Unidades en almacén"
          }
        ].map((metric, i) => (
          <div
            key={i}
            className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{metric.title}</span>
              <div className="p-2 bg-gray-50 rounded-lg">{metric.icon}</div>
            </div>
            <div>
              <span className="text-2xl font-black text-gray-900 tracking-tight">{metric.value}</span>
              <p className="text-xxs text-gray-400 mt-0.5">{metric.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* CRUD Controls */}
      <ProductCRUD />
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { ProductCard } from '../components/ProductCard';
import { Search, Filter, ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react';

interface ProductsProps {
  products: Product[];
  onOpenDetails: (product: Product) => void;
}

const ITEMS_PER_PAGE = 6;

export const Products: React.FC<ProductsProps> = ({ products, onOpenDetails }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);

  // Categories list
  const categories = ['All', 'Tecnología', 'Audio', 'Accesorios'];

  // Reset page when search or category changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory]);

  // Filtering
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Pagination Calculation
  const totalItems = filteredProducts.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  return (
    <div className="space-y-8">
      {/* Title Header */}
      <div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Nuestro Catálogo</h1>
        <p className="text-sm text-gray-500">Encuentra los mejores gadgets y accesorios de tecnología premium.</p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Buscar dispositivos, marcas, accesorios..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-sm bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-hidden"
          />
          <Search className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        {/* Categories */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto justify-start md:justify-end">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mr-2 hidden sm:inline-flex items-center space-x-1">
            <Filter className="h-3.5 w-3.5" />
            <span>Categorías:</span>
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              {cat === 'All' ? 'Todos' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products list or empty state */}
      {currentProducts.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 shadow-xs">
          <SlidersHorizontal className="h-10 w-10 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-gray-800">No se encontraron productos</h3>
          <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
            Prueba a buscar con otros términos o cambia la categoría seleccionada.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onOpenDetails={onOpenDetails}
              />
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <span className="text-xs text-gray-500 font-medium">
                Mostrando {startIndex + 1} - {Math.min(endIndex, totalItems)} de {totalItems} productos
              </span>

              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className={`p-2 rounded-xl border border-gray-200 transition-colors cursor-pointer ${
                    currentPage === 1
                      ? 'text-gray-300 bg-gray-50 cursor-not-allowed'
                      : 'text-gray-600 bg-white hover:bg-gray-50'
                  }`}
                  title="Página anterior"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`h-9 w-9 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                      currentPage === pageNum
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-gray-600 hover:bg-gray-50 border border-gray-200'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className={`p-2 rounded-xl border border-gray-200 transition-colors cursor-pointer ${
                    currentPage === totalPages
                      ? 'text-gray-300 bg-gray-50 cursor-not-allowed'
                      : 'text-gray-600 bg-white hover:bg-gray-50'
                  }`}
                  title="Siguiente página"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

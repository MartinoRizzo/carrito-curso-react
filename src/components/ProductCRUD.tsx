import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { db } from '../firebase';
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc 
} from 'firebase/firestore';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  PlusCircle, 
  AlertCircle, 
  Check,
  Search,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const ProductCRUD: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form State
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [stock, setStock] = useState('');
  const [category, setCategory] = useState('Tecnología');
  
  // UI Messages
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'products'));
      const fetchedProducts: Product[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        fetchedProducts.push({
          id: doc.id,
          title: data.title,
          price: Number(data.price),
          description: data.description,
          image: data.image,
          stock: Number(data.stock),
          category: data.category
        });
      });
      setProducts(fetchedProducts);
    } catch (err) {
      console.error('Error fetching products inside CRUD:', err);
      setErrorMsg('No se pudieron cargar los productos de Firestore.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const resetForm = () => {
    setTitle('');
    setPrice('');
    setDescription('');
    setImage('');
    setStock('');
    setCategory('Tecnología');
    setIsEditing(false);
    setEditId(null);
    setErrorMsg('');
  };

  const handleEditClick = (product: Product) => {
    setTitle(product.title);
    setPrice(product.price.toString());
    setDescription(product.description);
    setImage(product.image);
    setStock(product.stock.toString());
    setCategory(product.category);
    setIsEditing(true);
    setEditId(product.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteClick = async (id: string) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      return;
    }
    try {
      setLoading(true);
      await deleteDoc(doc(db, 'products', id));
      setSuccessMsg('Producto eliminado con éxito.');
      setTimeout(() => setSuccessMsg(''), 3000);
      fetchProducts();
    } catch (err) {
      console.error('Error deleting product:', err);
      setErrorMsg('Error al eliminar el producto de Firestore.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    // Validations
    if (!title.trim() || !description.trim() || !category.trim()) {
      setErrorMsg('Todos los campos de texto son obligatorios.');
      return;
    }

    const priceNum = Number(price);
    const stockNum = Number(stock);

    if (isNaN(priceNum) || priceNum <= 0) {
      setErrorMsg('El precio debe ser un número mayor a 0.');
      return;
    }

    if (isNaN(stockNum) || stockNum < 0) {
      setErrorMsg('El stock debe ser un número entero mayor o igual a 0.');
      return;
    }

    // Default image if empty
    const finalImage = image.trim() || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=600';

    try {
      setLoading(true);
      const productData = {
        title: title.trim(),
        price: priceNum,
        description: description.trim(),
        image: finalImage,
        stock: Math.floor(stockNum),
        category: category,
        updatedAt: new Date().toISOString()
      };

      if (isEditing && editId) {
        await updateDoc(doc(db, 'products', editId), productData);
        setSuccessMsg('¡Producto actualizado con éxito!');
      } else {
        await addDoc(collection(db, 'products'), {
          ...productData,
          createdAt: new Date().toISOString()
        });
        setSuccessMsg('¡Producto creado con éxito!');
      }

      resetForm();
      setTimeout(() => setSuccessMsg(''), 4000);
      fetchProducts();
    } catch (err: any) {
      console.error('Error saving product:', err);
      setErrorMsg('Ocurrió un error al guardar en Firestore.');
    } finally {
      setLoading(false);
    }
  };

  // Filtered Products
  const filteredProducts = products.filter((p) =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Messages */}
      <AnimatePresence>
        {errorMsg && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-red-50 text-red-700 p-4 rounded-2xl border border-red-100 flex items-center space-x-2 text-sm"
          >
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span>{errorMsg}</span>
          </motion.div>
        )}
        {successMsg && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-emerald-50 text-emerald-700 p-4 rounded-2xl border border-emerald-100 flex items-center space-x-2 text-sm font-medium"
          >
            <Check className="h-5 w-5 flex-shrink-0" />
            <span>{successMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Column */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center space-x-2">
              <PlusCircle className="h-5 w-5 text-indigo-600" />
              <span>{isEditing ? 'Editar Producto' : 'Crear Nuevo Producto'}</span>
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Título del Producto</label>
                <input
                  type="text"
                  placeholder="Ej. iPhone 15 Pro Max"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-sm bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-hidden"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Precio ($)</label>
                  <input
                    type="number"
                    placeholder="Ej. 1299"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full text-sm bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-hidden"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Stock</label>
                  <input
                    type="number"
                    placeholder="Ej. 10"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="w-full text-sm bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-hidden"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Categoría</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full text-sm bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-hidden"
                >
                  <option value="Tecnología">Tecnología</option>
                  <option value="Audio">Audio</option>
                  <option value="Accesorios">Accesorios</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">URL de Imagen</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  className="w-full text-sm bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-hidden"
                />
                <span className="text-xxs text-gray-400 mt-1 block">Opcional. Se asignará una imagen por defecto de alta calidad.</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Descripción</label>
                <textarea
                  placeholder="Detalles sobre las especificaciones, materiales, etc."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full text-sm bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-hidden resize-none"
                  required
                />
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-grow flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-4 rounded-xl text-sm transition-colors cursor-pointer"
                >
                  <Save className="h-4 w-4" />
                  <span>{isEditing ? 'Actualizar' : 'Crear Producto'}</span>
                </button>
                {isEditing && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="p-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl transition-colors cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Product List Column */}
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <h3 className="text-lg font-bold text-gray-900">Listado de Productos</h3>
              
              <div className="flex items-center space-x-2">
                {/* Search */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Buscar producto..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 pr-4 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-hidden w-full sm:w-48"
                  />
                  <Search className="h-3.5 w-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                </div>
                
                <button
                  onClick={fetchProducts}
                  className="p-1.5 text-gray-500 hover:text-indigo-600 bg-gray-50 hover:bg-gray-100 border border-gray-100 rounded-lg cursor-pointer"
                  title="Actualizar catálogo"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>
            </div>

            {loading && products.length === 0 ? (
              <div className="text-center py-12 text-sm text-gray-500">Cargando catálogo...</div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-12 text-sm text-gray-400 border border-dashed border-gray-100 rounded-2xl">
                No se encontraron productos en esta lista.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
                      <th className="py-3 px-2">Imagen</th>
                      <th className="py-3 px-2">Producto</th>
                      <th className="py-3 px-2">Categoría</th>
                      <th className="py-3 px-2 text-right">Precio</th>
                      <th className="py-3 px-2 text-center">Stock</th>
                      <th className="py-3 px-2 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 text-sm">
                    {filteredProducts.map((p) => (
                      <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="py-3 px-2">
                          <img
                            src={p.image}
                            alt={p.title}
                            referrerPolicy="no-referrer"
                            className="h-10 w-10 object-cover rounded-lg border border-gray-100"
                          />
                        </td>
                        <td className="py-3 px-2 max-w-[160px] truncate">
                          <span className="font-semibold text-gray-900 block" title={p.title}>
                            {p.title}
                          </span>
                          <span className="text-xxs text-gray-400 block max-w-[150px] truncate">
                            {p.description}
                          </span>
                        </td>
                        <td className="py-3 px-2">
                          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                            {p.category}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-right font-bold text-gray-900">
                          ${p.price.toLocaleString('es-ES')}
                        </td>
                        <td className="py-3 px-2 text-center">
                          <span className={`text-xs font-semibold ${p.stock === 0 ? 'text-red-500' : 'text-gray-700'}`}>
                            {p.stock}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-center">
                          <div className="flex items-center justify-center space-x-1">
                            <button
                              onClick={() => handleEditClick(p)}
                              className="p-1.5 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                              title="Editar"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(p.id)}
                              className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              title="Eliminar"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Product, Review } from '../types';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  addDoc 
} from 'firebase/firestore';
import { 
  X, 
  ShoppingCart, 
  Star, 
  MessageSquare, 
  Send, 
  AlertCircle,
  User
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, onClose }) => {
  const { user } = useAuth();
  const { addToCart, items } = useCart();
  
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Find quantity in cart
  const cartItem = product ? items.find((item) => item.product.id === product.id) : null;
  const qtyInCart = cartItem ? cartItem.quantity : 0;
  const remainingStock = product ? product.stock - qtyInCart : 0;

  useEffect(() => {
    if (!product) return;

    setLoadingReviews(true);
    // Setup real-time listener for reviews
    const reviewsRef = collection(db, 'reviews');
    const q = query(
      reviewsRef, 
      where('productId', '==', product.id),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedReviews: Review[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        fetchedReviews.push({
          id: doc.id,
          productId: data.productId,
          userName: data.userName,
          userEmail: data.userEmail,
          rating: data.rating,
          comment: data.comment,
          createdAt: data.createdAt
        });
      });
      setReviews(fetchedReviews);
      setLoadingReviews(false);
    }, (error) => {
      console.error("Error fetching reviews:", error);
      setLoadingReviews(false);
    });

    return () => unsubscribe();
  }, [product]);

  if (!product) return null;

  const handleAddToCart = () => {
    if (remainingStock > 0) {
      addToCart(product, 1);
    }
  };

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setErrorMsg('Debes iniciar sesión para dejar una opinión.');
      return;
    }
    if (!comment.trim()) {
      setErrorMsg('Por favor escribe un comentario.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const newReview = {
        productId: product.id,
        userName: user.displayName || user.email?.split('@')[0] || 'Anónimo',
        userEmail: user.email || '',
        rating: rating,
        comment: comment.trim(),
        createdAt: new Date().toISOString()
      };

      await addDoc(collection(db, 'reviews'), newReview);
      setComment('');
      setRating(5);
      setSuccessMsg('¡Opinión agregada con éxito!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      console.error('Error adding review:', err);
      setErrorMsg('Ocurrió un error al enviar tu opinión. Inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Average Rating Calculation
  const avgRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto z-10 flex flex-col md:flex-row overflow-hidden border border-gray-100"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 bg-white/80 hover:bg-white rounded-full shadow-md text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Left Column: Image */}
          <div className="md:w-1/2 bg-gray-50 relative flex items-center justify-center min-h-[300px] md:min-h-full">
            <img
              src={product.image}
              alt={product.title}
              referrerPolicy="no-referrer"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent" />
          </div>

          {/* Right Column: Details & Reviews */}
          <div className="md:w-1/2 p-6 md:p-8 flex flex-col h-full overflow-y-auto max-h-[90vh]">
            <div className="border-b border-gray-100 pb-5 mb-5">
              <span className="bg-indigo-50 text-indigo-700 font-semibold px-2.5 py-1 rounded-full text-xxs tracking-wider uppercase">
                {product.category}
              </span>
              <h2 className="text-2xl font-bold text-gray-900 mt-3 mb-1">{product.title}</h2>
              
              {/* Star Rating summary */}
              <div className="flex items-center space-x-2 mt-2">
                <div className="flex items-center text-amber-400">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${
                        avgRating && parseFloat(avgRating) >= star ? 'fill-current' : 'text-gray-200'
                      }`}
                    />
                  ))}
                </div>
                {avgRating ? (
                  <span className="text-sm font-semibold text-gray-700">
                    {avgRating} <span className="text-gray-400 font-normal">({reviews.length} opiniones)</span>
                  </span>
                ) : (
                  <span className="text-sm text-gray-400">Sin opiniones aún</span>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Descripción</h4>
              <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>
            </div>

            {/* Price & Cart Actions */}
            <div className="bg-gray-50 p-4 rounded-2xl flex items-center justify-between mb-8">
              <div>
                <span className="text-xs text-gray-400 block font-medium">Precio</span>
                <span className="text-2xl font-bold text-gray-900">${product.price.toLocaleString('es-ES')}</span>
              </div>

              <div className="text-right">
                <button
                  onClick={handleAddToCart}
                  disabled={remainingStock <= 0}
                  className={`flex items-center space-x-1.5 px-5 py-3 rounded-xl font-semibold text-sm shadow-sm transition-all cursor-pointer ${
                    remainingStock > 0
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <ShoppingCart className="h-4 w-4" />
                  <span>{remainingStock > 0 ? 'Añadir al carrito' : 'Límite stock'}</span>
                </button>
                <span className="text-xxs text-gray-500 block mt-1">
                  {remainingStock > 0 ? `${remainingStock} unidades disponibles` : 'Sin stock disponible'}
                </span>
              </div>
            </div>

            {/* Reviews Section */}
            <div className="mt-auto border-t border-gray-100 pt-6">
              <h3 className="text-base font-bold text-gray-900 flex items-center space-x-2 mb-4">
                <MessageSquare className="h-5 w-5 text-gray-400" />
                <span>Opiniones del Producto</span>
              </h3>

              {/* Add review form */}
              {user ? (
                <form onSubmit={handleAddReview} className="mb-6 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <span className="text-xs font-semibold text-gray-700 block mb-2">Dejar una valoración</span>
                  
                  {/* Stars select */}
                  <div className="flex items-center space-x-1 mb-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setRating(star)}
                        className="p-0.5 text-amber-400 focus:outline-hidden cursor-pointer"
                      >
                        <Star className={`h-6 w-6 ${rating >= star ? 'fill-current' : 'text-gray-200'}`} />
                      </button>
                    ))}
                  </div>

                  {/* Comment */}
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      placeholder="¿Qué te pareció el producto?..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="flex-grow text-sm bg-white border border-gray-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-hidden"
                    />
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors cursor-pointer"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </div>

                  {errorMsg && (
                    <div className="mt-2 text-xs text-red-500 flex items-center space-x-1">
                      <AlertCircle className="h-3.5 w-3.5" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  {successMsg && (
                    <div className="mt-2 text-xs text-emerald-600 font-medium">
                      {successMsg}
                    </div>
                  )}
                </form>
              ) : (
                <div className="mb-6 text-center py-3 px-4 bg-amber-50 text-amber-700 border border-amber-100 rounded-xl text-xs">
                  Para opinar, <a href="#/auth" onClick={onClose} className="font-semibold underline">Inicia Sesión</a> en tu cuenta.
                </div>
              )}

              {/* Reviews List */}
              <div className="space-y-4 max-h-[250px] overflow-y-auto pr-1">
                {loadingReviews ? (
                  <div className="text-center py-4 text-xs text-gray-500">Cargando opiniones...</div>
                ) : reviews.length === 0 ? (
                  <div className="text-center py-6 text-xs text-gray-400 italic">No hay valoraciones todavía para este producto. ¡Sé el primero en opinar!</div>
                ) : (
                  reviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                      <div className="flex justify-between items-start mb-1">
                        <div className="flex items-center space-x-1.5">
                          <div className="h-6 w-6 rounded-full bg-gray-100 flex items-center justify-center">
                            <User className="h-3 w-3 text-gray-500" />
                          </div>
                          <span className="text-xs font-semibold text-gray-800">{review.userName}</span>
                        </div>
                        <span className="text-xxs text-gray-400">
                          {new Date(review.createdAt).toLocaleDateString('es-ES')}
                        </span>
                      </div>
                      
                      <div className="flex items-center text-amber-400 mb-1.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-3 w-3 ${review.rating >= star ? 'fill-current' : 'text-gray-200'}`}
                          />
                        ))}
                      </div>

                      <p className="text-xs text-gray-600 pl-7">{review.comment}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

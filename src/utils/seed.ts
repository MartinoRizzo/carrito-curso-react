import { collection, getDocs, writeBatch, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { Product } from '../types';

const INITIAL_PRODUCTS: Omit<Product, 'id'>[] = [
  {
    title: "iPhone 15 Pro Max",
    price: 1299,
    description: "El iPhone más potente hasta la fecha, con titanio de calidad aeroespacial, el chip A17 Pro de última generación y un sistema de cámara de 48 megapíxeles más avanzado que nunca.",
    image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&q=80&w=600",
    stock: 12,
    category: "Tecnología"
  },
  {
    title: "Sony WH-1000XM5",
    price: 399,
    description: "Auriculares inalámbricos con cancelación de ruido líder en la industria, calidad de sonido excepcional y un diseño ultracómodo con controles táctiles intuitivos.",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=600",
    stock: 25,
    category: "Audio"
  },
  {
    title: "MacBook Pro M3 Max",
    price: 2499,
    description: "La laptop definitiva para creadores y desarrolladores. Cuenta con la pantalla Liquid Retina XDR de 16 pulgadas y la potencia incomparable del nuevo procesador de Apple.",
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=600",
    stock: 8,
    category: "Tecnología"
  },
  {
    title: "Keychron K2 V2 Keyboard",
    price: 99,
    description: "Teclado mecánico inalámbrico con distribución compacta del 75%, retroiluminación RGB, interruptores Gateron y compatibilidad total con macOS y Windows.",
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&q=80&w=600",
    stock: 45,
    category: "Accesorios"
  },
  {
    title: "Apple Watch Series 9",
    price: 429,
    description: "El reloj inteligente que te ayuda a llevar una vida más saludable y conectada. Nuevo chip S9, pantalla el doble de brillante y el revolucionario gesto de doble toque.",
    image: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&q=80&w=600",
    stock: 15,
    category: "Tecnología"
  },
  {
    title: "Bose QuietComfort Ultra",
    price: 349,
    description: "Auriculares intraurales con la mejor cancelación de ruido de su clase, audio espacial inmersivo y almohadillas rediseñadas para un ajuste ergonómico perfecto.",
    image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&q=80&w=600",
    stock: 18,
    category: "Audio"
  },
  {
    title: "Logitech MX Master 3S",
    price: 119,
    description: "Mouse inalámbrico de alto rendimiento con clics discretos y silenciosos, sensor de 8,000 DPI que funciona en cualquier superficie, incluido el vidrio.",
    image: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&q=80&w=600",
    stock: 30,
    category: "Accesorios"
  },
  {
    title: "iPad Pro M4",
    price: 999,
    description: "La tablet definitiva con un diseño increíblemente delgado, pantalla Ultra Retina XDR con tecnología Tandem OLED y la potencia extrema del chip Apple M4.",
    image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&q=80&w=600",
    stock: 10,
    category: "Tecnología"
  }
];

export async function seedProductsIfEmpty(): Promise<void> {
  try {
    const productsCollectionRef = collection(db, 'products');
    const snapshot = await getDocs(productsCollectionRef);
    
    if (snapshot.empty) {
      console.log('No products found in Firestore. Seeding initial catalog...');
      const batch = writeBatch(db);
      
      INITIAL_PRODUCTS.forEach((product) => {
        // Create an auto-generated ID doc ref
        const newDocRef = doc(productsCollectionRef);
        batch.set(newDocRef, {
          ...product,
          createdAt: new Date().toISOString()
        });
      });
      
      await batch.commit();
      console.log('Seeding completed successfully!');
    } else {
      console.log('Products already exist in Firestore. Skipping seed.');
    }
  } catch (error) {
    console.error('Error seeding products:', error);
  }
}

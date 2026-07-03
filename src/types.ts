export interface Product {
  id: string;
  title: string;
  price: number;
  description: string;
  image: string;
  stock: number;
  category: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Review {
  id: string;
  productId: string;
  userName: string;
  userEmail: string;
  rating: number; // 1 to 5
  comment: string;
  createdAt: string;
}

export interface UserSession {
  uid: string;
  email: string | null;
  role: 'admin' | 'user';
  displayName?: string | null;
  isSimulated?: boolean;
}

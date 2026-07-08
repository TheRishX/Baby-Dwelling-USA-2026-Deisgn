export interface Product {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewsCount: number;
  image: string;
  category: 'carriers' | 'pouches' | 'combos' | 'accessories';
  badge?: string;
  tagline: string;
  description?: string;
  images?: string[];
  retailer: 'amazon' | 'walmart';
  buyUrl: string;
  colors?: string[];
  specs?: Record<string, string>;
  inStock?: boolean;
}

export interface Review {
  id: string;
  name: string;
  babyAge: string;
  rating: number;
  comment: string;
  date: string;
  verified: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor?: string;
}

export interface CustomPage {
  id: string;
  title: string;
  slug: string;
  body: string;
  isPublished: boolean;
  createdAt: string;
}

export type ActiveView = 'home' | 'shop' | 'detail' | 'admin' | 'page' | 'seo';


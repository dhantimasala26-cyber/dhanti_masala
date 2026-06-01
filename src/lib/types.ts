export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  short_description: string | null;
  description: string | null;
  category_id: string | null;
  images: string[];
  price: number;
  discount_price: number | null;
  weight_variants: string[];
  stock_quantities: Record<string, number>; // variant weight -> stock quantity
  prices?: Record<string, { price: number; discount_price: number | null }>;
  sku: string | null;
  featured: boolean;
  status: 'active' | 'draft' | 'archived';
  seo_title: string | null;
  seo_description: string | null;
  shelf_life?: string | null;
  origin?: string | null;
  purity_checklist?: string | null;
  created_at: string;
  category?: Category; // Joined category
}

export interface OrderItem {
  productId: string;
  name: string;
  variant: string;
  qty: number;
  price: number;
  image: string;
}

export interface Order {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  pincode: string;
  city: string;
  state: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  total: number;
  payment_method: 'online' | 'cod';
  payment_status: 'pending' | 'paid' | 'failed';
  delivery_status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  transaction_id: string | null;
  coupon_code: string | null;
  tracking_code?: string | null;
  delivery_partner?: string | null;
  created_at: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  total_orders: number;
  total_spent: number;
  last_order_date: string | null;
  created_at: string;
}

export interface Coupon {
  id: string;
  code: string;
  discount_type: 'percentage' | 'flat';
  discount_value: number;
  expiry_date: string | null;
  min_order_amount: number;
  usage_limit: number | null;
  usage_count: number;
  created_at: string;
}

export interface CMSHero {
  title: string;
  subheading: string;
  cta_shop: string;
  cta_learn: string;
  banner_image: string;
}

export interface CMSWhyChooseItem {
  title: string;
  description: string;
  icon: string;
}

export interface CMSQualityStep {
  title: string;
  description: string;
}

export interface CMSTestimonial {
  name: string;
  location: string;
  stars: number;
  comment: string;
}

export interface CMSFeaturedMeal {
  title: string;
  subheading: string;
  button_text: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  product_type?: string;
  is_published: number;
  created_at?: string;
  updated_at?: string;
}

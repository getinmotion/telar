export interface CartItem {
  id: string;
  user_id?: string;
  session_id?: string;
  product_id: string;
  quantity: number;
  price: number;
  created_at: string;
  updated_at: string;
  // Product details for display
  product?: {
    id: string;
    name: string;
    images: any;
    shop_id: string;
    inventory: number;
    active: boolean;
  };
}

export interface CartSummary {
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  itemCount: number;
}

export interface ShippingOption {
  id: string;
  name: string;
  description: string;
  price: number;
  estimatedDays: string;
}

export interface CheckoutFormData {
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  shipping: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  billing: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    sameAsShipping: boolean;
  };
  shippingMethod: string;
  paymentMethod: string;
  notes?: string;
}
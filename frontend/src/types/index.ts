// tipos para as entidades do sistema
export interface Customer {
  id: string;
  name: string;
  email: string;
  document: string;
  phone?: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  description?: string;
  category?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: number;
  total: number;
  product?: Product;
}

export interface Order {
  id: string;
  customerId: string;
  status: OrderStatus;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  orderItems?: OrderItem[];
  customer?: Customer;
}

export enum OrderStatus {
  PENDING_PAYMENT = 'PENDING_PAYMENT',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  PAYMENT_FAILED = 'PAYMENT_FAILED'
}

// tipos para criacao de entidades
export interface CreateCustomerData {
  name: string;
  email: string;
  document: string;
  phone?: string;
  address?: string;
}

export interface CreateProductData {
  name: string;
  price: number;
  stock: number;
  description?: string;
  category?: string;
}

export interface CreateOrderData {
  customerId: string;
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
  }>;
}

// tipos para carrinho de compras
export interface CartItem {
  product: Product;
  quantity: number;
}

// tipos para paginacao
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// tipos para API responses
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
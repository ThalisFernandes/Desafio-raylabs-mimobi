// tipos para as entidades do sistema
import { Decimal } from '@prisma/client/runtime/library';

// enum para status do pedido
export enum OrderStatus {
  PENDING_PAYMENT = 'PENDING_PAYMENT',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED'
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  document: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  id: string;
  name: string;
  price: Decimal;
  stock: number;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Order {
  id: string;
  customerId: string;
  status: string;
  total: Decimal;
  createdAt: Date;
  updatedAt: Date;
  orderItems?: OrderItem[];
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: Decimal;
  total: Decimal;
}

// tipos para criacao de entidades
export interface CreateCustomerData {
  name: string;
  email: string;
  document: string;
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
  }>;
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

// tipos para eventos de mensageria
export interface OrderCreatedEvent {
  orderId: string;
  customerId: string;
  total: number;
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
  }>;
  createdAt: Date;
}

export interface PaymentProcessedEvent {
  orderId: string;
  status: 'CONFIRMED' | 'FAILED';
  amount: number;
  processedAt: Date;
}

export interface StockUpdatedEvent {
  orderId: string;
  status: 'CONFIRMED' | 'FAILED';
  items: Array<{
    productId: string;
    quantity: number;
    available: boolean;
  }>;
  updatedAt: Date;
}
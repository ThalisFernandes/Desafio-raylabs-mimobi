// tipos para as entidades do sistema

export interface Customer {
  id: string;
  name: string;
  email: string;
  document: string; // CPF ou CNPJ
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Order {
  id: string;
  customerId: string;
  status: OrderStatus;
  total: number;
  createdAt: Date;
  updatedAt: Date;
  customer?: Customer;
  orderItems?: OrderItem[];
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: number; // preco no momento da compra
  total: number; // quantity * price
  order?: Order;
  product?: Product;
}

export enum OrderStatus {
  PENDING_PAYMENT = 'PENDING_PAYMENT',
  PAYMENT_CONFIRMED = 'PAYMENT_CONFIRMED',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
}

// DTOs para criacao e atualizacao
export interface CreateCustomerDTO {
  name: string;
  email: string;
  document: string;
}

export interface CreateProductDTO {
  name: string;
  price: number;
  stock: number;
  description?: string;
}

export interface CreateOrderDTO {
  customerId: string;
  items: CreateOrderItemDTO[];
}

export interface CreateOrderItemDTO {
  productId: string;
  quantity: number;
}

// tipos para eventos de mensageria
export interface OrderCreatedEvent {
  orderId: string;
  customerId: string;
  total: number;
  items: OrderItem[];
  timestamp: Date;
}

export interface PaymentProcessedEvent {
  orderId: string;
  status: 'CONFIRMED' | 'FAILED';
  timestamp: Date;
}

export interface StockUpdatedEvent {
  orderId: string;
  status: 'CONFIRMED' | 'CANCELLED';
  reason?: string;
  timestamp: Date;
}

// tipos para respostas da API
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
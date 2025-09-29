import axios from 'axios';
import {
  Customer,
  Product,
  Order,
  CreateCustomerData,
  CreateProductData,
  CreateOrderData,
  PaginatedResponse,
  ApiResponse
} from '../types';
import { API_CONFIG, getDefaultHeaders } from '../config/api';

// configuracao base da API
const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: getDefaultHeaders(),
});

// interceptor para tratamento de erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Erro na API:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// servicos para clientes
export const customerService = {
  async create(data: CreateCustomerData): Promise<ApiResponse<Customer>> {
    const response = await api.post<ApiResponse<Customer>>('/customers', data);
    return response.data;
  },

  async getAll(page = 1, limit = 10): Promise<PaginatedResponse<Customer>> {
    const response = await api.get<PaginatedResponse<Customer>>('/customers', {
      params: { page, limit }
    });
    return response.data;
  },

  async getById(id: string): Promise<Customer> {
    const response = await api.get<Customer>(`/customers/${id}`);
    return response.data;
  },

  async getByEmail(email: string): Promise<Customer> {
    const response = await api.get<Customer>(`/customers/email/${email}`);
    return response.data;
  }
};

// servicos para produtos
export const productService = {
  async create(data: CreateProductData): Promise<Product> {
    const response = await api.post<Product>('/products', data);
    return response.data;
  },

  async getAll(page = 1, limit = 10): Promise<PaginatedResponse<Product>> {
    const response = await api.get<PaginatedResponse<Product>>('/products', {
      params: { page, limit }
    });
    return response.data;
  },

  async getById(id: string): Promise<Product> {
    const response = await api.get<Product>(`/products/${id}`);
    return response.data;
  },

  async update(id: string, data: Partial<CreateProductData>): Promise<Product> {
    const response = await api.put<Product>(`/products/${id}`, data);
    return response.data;
  },

  async getStock(id: string): Promise<{ productId: string; stock: number }> {
    const response = await api.get<{ productId: string; stock: number }>(`/products/${id}/stock`);
    return response.data;
  }
};

// servicos para pedidos
export const orderService = {
  async create(data: CreateOrderData): Promise<Order> {
    const response = await api.post<Order>('/orders', data);
    return response.data;
  },

  async getAll(page = 1, limit = 10): Promise<PaginatedResponse<Order>> {
    const response = await api.get<PaginatedResponse<Order>>('/orders', {
      params: { page, limit }
    });
    return response.data;
  },

  async getById(id: string): Promise<Order> {
    const response = await api.get<Order>(`/orders/${id}`);
    return response.data;
  },

  async getByCustomer(customerId: string, page = 1, limit = 10): Promise<PaginatedResponse<Order>> {
    const response = await api.get<PaginatedResponse<Order>>(`/orders/customer/${customerId}`, {
      params: { page, limit }
    });
    return response.data;
  },

  async updateStatus(id: string, status: string): Promise<Order> {
    const response = await api.put<Order>(`/orders/${id}/status`, { status });
    return response.data;
  }
};

// servico para health check
export const healthService = {
  async check(): Promise<{ status: string; timestamp: string }> {
    const response = await api.get<{ status: string; timestamp: string }>('/health');
    return response.data;
  }
};

export default api;
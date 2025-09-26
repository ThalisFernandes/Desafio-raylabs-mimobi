import { prisma } from '../config/database';
import { CreateProductDTO, Product } from '../types';
import { NotFoundError, ValidationError } from '../utils/errors';
import { logInfo, logError } from '../config/logger';

export class ProductService {
  // criar novo produto
  async createProduct(data: CreateProductDTO): Promise<Product> {
    try {
      const product = await prisma.product.create({
        data: {
          name: data.name,
          price: data.price,
          stock: data.stock,
          description: data.description,
        }
      });

      logInfo('Produto criado com sucesso', { productId: product.id });
      return product;
    } catch (error) {
      logError('Erro ao criar produto', error);
      throw error;
    }
  }

  // buscar produto por id
  async getProductById(id: string): Promise<Product> {
    try {
      const product = await prisma.product.findUnique({
        where: { id }
      });

      if (!product) {
        throw new NotFoundError('Produto');
      }

      return product;
    } catch (error) {
      logError('Erro ao buscar produto', error);
      throw error;
    }
  }

  // listar todos os produtos com paginacao
  async getAllProducts(page: number = 1, limit: number = 10) {
    try {
      const skip = (page - 1) * limit;

      const [products, total] = await Promise.all([
        prisma.product.findMany({
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' }
        }),
        prisma.product.count()
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        products,
        pagination: {
          page,
          limit,
          total,
          totalPages
        }
      };
    } catch (error) {
      logError('Erro ao listar produtos', error);
      throw error;
    }
  }

  // verificar disponibilidade de estoque
  async checkStock(productId: string, quantity: number): Promise<boolean> {
    try {
      const product = await this.getProductById(productId);
      return product.stock >= quantity;
    } catch (error) {
      logError('Erro ao verificar estoque', error);
      throw error;
    }
  }

  // debitar estoque (usado pelo servico de estoque)
  async debitStock(productId: string, quantity: number): Promise<Product> {
    try {
      const product = await this.getProductById(productId);

      if (product.stock < quantity) {
        throw new ValidationError('Estoque insuficiente para o produto');
      }

      const updatedProduct = await prisma.product.update({
        where: { id: productId },
        data: {
          stock: product.stock - quantity
        }
      });

      logInfo('Estoque debitado com sucesso', { 
        productId, 
        quantityDebited: quantity, 
        newStock: updatedProduct.stock 
      });

      return updatedProduct;
    } catch (error) {
      logError('Erro ao debitar estoque', error);
      throw error;
    }
  }

  // creditar estoque (para cancelamentos)
  async creditStock(productId: string, quantity: number): Promise<Product> {
    try {
      const product = await this.getProductById(productId);

      const updatedProduct = await prisma.product.update({
        where: { id: productId },
        data: {
          stock: product.stock + quantity
        }
      });

      logInfo('Estoque creditado com sucesso', { 
        productId, 
        quantityCredited: quantity, 
        newStock: updatedProduct.stock 
      });

      return updatedProduct;
    } catch (error) {
      logError('Erro ao creditar estoque', error);
      throw error;
    }
  }

  // atualizar produto
  async updateProduct(id: string, data: Partial<CreateProductDTO>): Promise<Product> {
    try {
      // verifica se produto existe
      await this.getProductById(id);

      const updatedProduct = await prisma.product.update({
        where: { id },
        data
      });

      logInfo('Produto atualizado com sucesso', { productId: id });
      return updatedProduct;
    } catch (error) {
      logError('Erro ao atualizar produto', error);
      throw error;
    }
  }
}
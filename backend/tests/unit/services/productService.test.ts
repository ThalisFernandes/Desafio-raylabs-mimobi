import { ProductService } from '../../../src/services/productService';
import { PrismaClient } from '@prisma/client';
import { NotFoundError, ValidationError } from '../../../src/utils/errors';

// mock do prisma
jest.mock('@prisma/client');
const mockPrisma = {
  product: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
  },
} as any;

describe('ProductService', () => {
  let productService: ProductService;

  beforeEach(() => {
    productService = new ProductService();
    (productService as any).prisma = mockPrisma;
    jest.clearAllMocks();
  });

  describe('createProduct', () => {
    const productData = {
      name: 'Produto Teste',
      description: 'Descrição do produto',
      price: 99.99,
      stock: 10,
      category: 'Eletrônicos'
    };

    it('deve criar um produto com sucesso', async () => {
      // arrange
      mockPrisma.product.create.mockResolvedValue({
        id: '1',
        ...productData,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // act
      const result = await productService.createProduct(productData);

      // assert
      expect(result).toHaveProperty('id', '1');
      expect(result.name).toBe(productData.name);
      expect(mockPrisma.product.create).toHaveBeenCalledWith({
        data: productData
      });
    });
  });

  describe('getProductById', () => {
    it('deve retornar produto por id', async () => {
      // arrange
      const product = {
        id: '1',
        name: 'Produto Teste',
        price: 99.99,
        stock: 10
      };
      mockPrisma.product.findUnique.mockResolvedValue(product);

      // act
      const result = await productService.getProductById('1');

      // assert
      expect(result).toEqual(product);
      expect(mockPrisma.product.findUnique).toHaveBeenCalledWith({
        where: { id: '1' }
      });
    });

    it('deve lancar erro se produto nao existir', async () => {
      // arrange
      mockPrisma.product.findUnique.mockResolvedValue(null);

      // act & assert
      await expect(productService.getProductById('999'))
        .rejects.toThrow(NotFoundError);
    });
  });

  describe('checkStock', () => {
    it('deve retornar true se estoque suficiente', async () => {
      // arrange
      mockPrisma.product.findUnique.mockResolvedValue({
        id: '1',
        stock: 10
      });

      // act
      const result = await productService.checkStock('1', 5);

      // assert
      expect(result).toBe(true);
    });

    it('deve retornar false se estoque insuficiente', async () => {
      // arrange
      mockPrisma.product.findUnique.mockResolvedValue({
        id: '1',
        stock: 3
      });

      // act
      const result = await productService.checkStock('1', 5);

      // assert
      expect(result).toBe(false);
    });

    it('deve lancar erro se produto nao existir', async () => {
      // arrange
      mockPrisma.product.findUnique.mockResolvedValue(null);

      // act & assert
      await expect(productService.checkStock('999', 5))
        .rejects.toThrow(NotFoundError);
    });
  });

  describe('debitStock', () => {
    it('deve debitar estoque com sucesso', async () => {
      // arrange
      const product = { id: '1', stock: 10 };
      mockPrisma.product.findUnique.mockResolvedValue(product);
      mockPrisma.product.update.mockResolvedValue({
        ...product,
        stock: 5
      });

      // act
      const result = await productService.debitStock('1', 5);

      // assert
      expect(result.stock).toBe(5);
      expect(mockPrisma.product.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { stock: 5 }
      });
    });

    it('deve lancar erro se estoque insuficiente', async () => {
      // arrange
      mockPrisma.product.findUnique.mockResolvedValue({
        id: '1',
        stock: 3
      });

      // act & assert
      await expect(productService.debitStock('1', 5))
        .rejects.toThrow(ValidationError);
      
      expect(mockPrisma.product.update).not.toHaveBeenCalled();
    });
  });

  describe('creditStock', () => {
    it('deve creditar estoque com sucesso', async () => {
      // arrange
      const product = { id: '1', stock: 5 };
      mockPrisma.product.findUnique.mockResolvedValue(product);
      mockPrisma.product.update.mockResolvedValue({
        ...product,
        stock: 10
      });

      // act
      const result = await productService.creditStock('1', 5);

      // assert
      expect(result.stock).toBe(10);
      expect(mockPrisma.product.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { stock: 10 }
      });
    });
  });

  describe('getAllProducts', () => {
    it('deve retornar lista paginada de produtos', async () => {
      // arrange
      const products = [
        { id: '1', name: 'Produto 1' },
        { id: '2', name: 'Produto 2' }
      ];
      mockPrisma.product.findMany.mockResolvedValue(products);
      mockPrisma.product.count.mockResolvedValue(2);

      // act
      const result = await productService.getAllProducts(1, 10);

      // assert
      expect(result.data).toEqual(products);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });
  });
});
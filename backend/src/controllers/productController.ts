import { Request, Response, NextFunction } from 'express';
import { ProductService } from '../services/productService';
import { validateData } from '../utils/validation';
import { createProductSchema, paginationSchema } from '../utils/validation';
import { logInfo } from '../config/logger';

export class ProductController {
  private productService: ProductService;

  constructor() {
    this.productService = new ProductService();
  }

  // criar produto
  createProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = validateData(createProductSchema, req.body);
      
      const product = await this.productService.createProduct(validatedData);
      
      logInfo('Produto criado via API', { productId: product.id });
      
      res.status(201).json({
        success: true,
        message: 'Produto criado com sucesso',
        data: product
      });
    } catch (error) {
      next(error);
    }
  };

  // buscar produto por id
  getProductById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      
      const product = await this.productService.getProductById(id);
      
      res.json({
        success: true,
        data: product
      });
    } catch (error) {
      next(error);
    }
  };

  // listar todos os produtos
  getAllProducts = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page = 1, limit = 10 } = validateData(paginationSchema, req.query);
      
      const result = await this.productService.getAllProducts(
        Number(page), 
        Number(limit)
      );
      
      res.json({
        success: true,
        data: result.products,
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  };

  // verificar estoque
  checkStock = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { quantity } = req.query;
      
      if (!quantity) {
        return res.status(400).json({
          success: false,
          message: 'Quantidade e obrigatoria'
        });
      }
      
      const hasStock = await this.productService.checkStock(id, Number(quantity));
      
      res.json({
        success: true,
        data: {
          productId: id,
          quantity: Number(quantity),
          available: hasStock
        }
      });
    } catch (error) {
      next(error);
    }
  };

  // atualizar produto
  updateProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      
      // validacao parcial do schema de produto
      const allowedFields = ['name', 'price', 'stock', 'description'];
      const updateData: any = {};
      
      for (const field of allowedFields) {
        if (req.body[field] !== undefined) {
          updateData[field] = req.body[field];
        }
      }
      
      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Nenhum campo valido para atualizacao'
        });
      }
      
      const product = await this.productService.updateProduct(id, updateData);
      
      logInfo('Produto atualizado via API', { productId: id });
      
      res.json({
        success: true,
        message: 'Produto atualizado com sucesso',
        data: product
      });
    } catch (error) {
      next(error);
    }
  };
}
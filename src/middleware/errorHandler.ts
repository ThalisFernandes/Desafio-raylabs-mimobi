import { Request, Response, NextFunction } from 'express';
import { 
  AppError, 
  ValidationError, 
  NotFoundError, 
  ConflictError, 
  UnauthorizedError, 
  ForbiddenError,
  isOperationalError 
} from '../utils/errors';
import { logError } from '../config/logger';
import { env } from '../config/env';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // log do erro
  logError('Erro capturado pelo middleware', {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    body: req.body,
    params: req.params,
    query: req.query
  });

  // se e um erro operacional conhecido
  if (isOperationalError(error)) {
    const appError = error as AppError;
    
    return res.status(appError.statusCode).json({
      success: false,
      message: appError.message,
      ...(env.NODE_ENV === 'development' && { stack: appError.stack })
    });
  }

  // erro de validacao do joi
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Dados invalidos',
      details: error.message
    });
  }

  // erro do prisma - registro nao encontrado
  if (error.name === 'NotFoundError' || error.message.includes('Record to update not found')) {
    return res.status(404).json({
      success: false,
      message: 'Recurso nao encontrado'
    });
  }

  // erro do prisma - violacao de constraint unica
  if (error.message.includes('Unique constraint failed')) {
    return res.status(409).json({
      success: false,
      message: 'Recurso ja existe'
    });
  }

  // erro do prisma - violacao de foreign key
  if (error.message.includes('Foreign key constraint failed')) {
    return res.status(400).json({
      success: false,
      message: 'Referencia invalida'
    });
  }

  // erro generico do servidor
  res.status(500).json({
    success: false,
    message: 'Erro interno do servidor',
    ...(env.NODE_ENV === 'development' && { 
      error: error.message,
      stack: error.stack 
    })
  });
};
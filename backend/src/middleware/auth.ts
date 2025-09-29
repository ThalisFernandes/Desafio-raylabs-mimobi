import { Request, Response, NextFunction } from 'express';
import { UnauthorizedError } from '../utils/errors';
import { logInfo, logWarn } from '../config/logger';

// interface para extender o Request com informacoes de auth
export interface AuthenticatedRequest extends Request {
  isAuthenticated?: boolean;
}

/**
 * Middleware de autenticacao com API key estatica
 * Valida se o header Authorization contem Bearer token valido
 */
export const authenticateApiKey = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    
    // verifica se o header authorization existe
    if (!authHeader) {
      logWarn('Tentativa de acesso sem header Authorization', {
        url: req.url,
        method: req.method,
        ip: req.ip
      });
      
      throw new UnauthorizedError('Header Authorization e obrigatorio');
    }

    // verifica se o header tem o formato Bearer token
    if (!authHeader.startsWith('Bearer ')) {
      logWarn('Header Authorization com formato invalido', {
        url: req.url,
        method: req.method,
        authHeader: authHeader.substring(0, 20) + '...', // log parcial por seguranca
        ip: req.ip
      });
      
      throw new UnauthorizedError('Formato do token invalido. Use: Bearer <token>');
    }

    // extrai o token do header
    const token = authHeader.substring(7); // remove "Bearer "
    
    // valida se o token nao esta vazio
    if (!token || token.trim() === '') {
      logWarn('Token vazio fornecido', {
        url: req.url,
        method: req.method,
        ip: req.ip
      });
      
      throw new UnauthorizedError('Token nao pode estar vazio');
    }

    // obtem a API key do ambiente
    const validApiKey = process.env.API_KEY;
    
    // verifica se a API key esta configurada
    if (!validApiKey) {
      logWarn('API_KEY nao configurada no ambiente', {
        url: req.url,
        method: req.method
      });
      
      throw new UnauthorizedError('Servico de autenticacao indisponivel');
    }

    // valida o token contra a API key estatica
    if (token !== validApiKey) {
      logWarn('Token invalido fornecido', {
        url: req.url,
        method: req.method,
        tokenLength: token.length,
        ip: req.ip
      });
      
      throw new UnauthorizedError('Token invalido');
    }

    // token valido - adiciona flag de autenticacao
    req.isAuthenticated = true;
    
    logInfo('Acesso autorizado com sucesso', {
      url: req.url,
      method: req.method,
      ip: req.ip
    });

    next();
  } catch (error) {
    // se for um erro conhecido, repassa
    if (error instanceof UnauthorizedError) {
      next(error);
      return;
    }

    // erro inesperado
    logWarn('Erro inesperado no middleware de auth', {
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      url: req.url,
      method: req.method
    });
    
    next(new UnauthorizedError('Erro na validacao do token'));
  }
};

/**
 * Middleware opcional de autenticacao
 * Nao bloqueia a requisicao se nao houver token, apenas marca como nao autenticada
 */
export const optionalAuth = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    
    // se nao tem header, marca como nao autenticado e continua
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.isAuthenticated = false;
      return next();
    }

    // tenta validar o token
    const token = authHeader.substring(7);
    const validApiKey = process.env.API_KEY;
    
    if (validApiKey && token === validApiKey) {
      req.isAuthenticated = true;
      logInfo('Acesso com autenticacao opcional bem-sucedida', {
        url: req.url,
        method: req.method
      });
    } else {
      req.isAuthenticated = false;
      logInfo('Token invalido em autenticacao opcional', {
        url: req.url,
        method: req.method
      });
    }

    next();
  } catch (error) {
    // em caso de erro, marca como nao autenticado e continua
    req.isAuthenticated = false;
    next();
  }
};
import Joi from 'joi';

// validacao para CPF/CNPJ (simplificada)
const documentValidation = Joi.string()
  .pattern(/^[0-9]{11}$|^[0-9]{14}$/)
  .required()
  .messages({
    'string.pattern.base': 'Documento deve ter 11 digitos (CPF) ou 14 digitos (CNPJ)',
  });

// schemas de validacao para clientes
export const createCustomerSchema = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    'string.min': 'Nome deve ter pelo menos 2 caracteres',
    'string.max': 'Nome deve ter no maximo 100 caracteres',
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Email deve ter um formato valido',
  }),
  document: documentValidation,
});

// schemas de validacao para produtos
export const createProductSchema = Joi.object({
  name: Joi.string().min(2).max(200).required().messages({
    'string.min': 'Nome do produto deve ter pelo menos 2 caracteres',
    'string.max': 'Nome do produto deve ter no maximo 200 caracteres',
  }),
  price: Joi.number().positive().precision(2).required().messages({
    'number.positive': 'Preco deve ser um valor positivo',
  }),
  stock: Joi.number().integer().min(0).required().messages({
    'number.min': 'Estoque nao pode ser negativo',
    'number.integer': 'Estoque deve ser um numero inteiro',
  }),
  description: Joi.string().max(500).optional().messages({
    'string.max': 'Descricao deve ter no maximo 500 caracteres',
  }),
  category: Joi.string().max(100).optional().messages({
    'string.max': 'Categoria deve ter no maximo 100 caracteres',
  }),
});

// schemas de validacao para pedidos
export const createOrderSchema = Joi.object({
  customerId: Joi.string().required().messages({
    'string.empty': 'ID do cliente e obrigatorio',
  }),
  items: Joi.array()
    .items(
      Joi.object({
        productId: Joi.string().required().messages({
          'string.empty': 'ID do produto e obrigatorio',
        }),
        quantity: Joi.number().integer().positive().required().messages({
          'number.positive': 'Quantidade deve ser um valor positivo',
          'number.integer': 'Quantidade deve ser um numero inteiro',
        }),
      })
    )
    .min(1)
    .required()
    .messages({
      'array.min': 'Pedido deve ter pelo menos um item',
    }),
});

// schema para paginacao
export const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
});

// funcao helper para validar dados
export const validateData = <T>(schema: Joi.ObjectSchema, data: any): T => {
  const { error, value } = schema.validate(data, { abortEarly: false });
  
  if (error) {
    const errorMessage = error.details.map(detail => detail.message).join(', ');
    throw new Error(`Erro de validacao: ${errorMessage}`);
  }
  
  return value as T;
};
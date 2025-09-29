import dotenv from 'dotenv';
import Joi from 'joi';

// carrega as variaveis de ambiente
dotenv.config();

// schema de validacao das variaveis de ambiente
const envSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().default(3000),
  DATABASE_URL: Joi.string().required(),
  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRES_IN: Joi.string().default('24h'),
  API_KEY: Joi.string().required(),
  RABBITMQ_URL: Joi.string().default('amqp://localhost:5672'),
  RABBITMQ_USER: Joi.string().default('guest'),
  RABBITMQ_PASSWORD: Joi.string().default('guest'),
  REDIS_URL: Joi.string().default('redis://localhost:6379'),
  LOG_LEVEL: Joi.string().valid('error', 'warn', 'info', 'debug').default('info'),
}).unknown();

// valida as variaveis de ambiente
const { error, value: envVars } = envSchema.validate(process.env);

if (error) {
  throw new Error(`Erro na configuracao das variaveis de ambiente: ${error.message}`);
}

// exporta as configuracoes validadas
export const config = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  database: {
    url: envVars.DATABASE_URL,
  },
  jwt: {
    secret: envVars.JWT_SECRET,
    expiresIn: envVars.JWT_EXPIRES_IN,
  },
  auth: {
    apiKey: envVars.API_KEY,
  },
  rabbitmq: {
    url: envVars.RABBITMQ_URL,
    user: envVars.RABBITMQ_USER,
    password: envVars.RABBITMQ_PASSWORD,
  },
  redis: {
    url: envVars.REDIS_URL,
  },
  log: {
    level: envVars.LOG_LEVEL,
  },
};

// exporta tambem como env para compatibilidade
export const env = {
  NODE_ENV: envVars.NODE_ENV,
  PORT: envVars.PORT,
  DATABASE_URL: envVars.DATABASE_URL,
  JWT_SECRET: envVars.JWT_SECRET,
  JWT_EXPIRES_IN: envVars.JWT_EXPIRES_IN,
  API_KEY: envVars.API_KEY,
  RABBITMQ_URL: envVars.RABBITMQ_URL,
  RABBITMQ_USER: envVars.RABBITMQ_USER,
  RABBITMQ_PASSWORD: envVars.RABBITMQ_PASSWORD,
  REDIS_URL: envVars.REDIS_URL,
  LOG_LEVEL: envVars.LOG_LEVEL,
};
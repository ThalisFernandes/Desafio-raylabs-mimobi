import { execSync } from 'child_process';
import { PrismaClient } from '@prisma/client';

export default async function globalSetup() {
  console.log('Configurando ambiente de testes...');

  // configurar variaveis de ambiente
  process.env.NODE_ENV = 'test';
  process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/ecommerce_test_db?schema=public';
  
  try {
    // criar banco de dados de teste
    console.log('Criando banco de dados de teste...');
    execSync('createdb ecommerce_test_db', { stdio: 'ignore' });
  } catch (error) {
    // banco ja existe, continuar
  }

  try {
    // executar migracoes no banco de teste
    console.log('Executando migracoes...');
    execSync('npx prisma migrate deploy', {
      env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL },
      stdio: 'inherit'
    });

    // gerar cliente prisma
    execSync('npx prisma generate', { stdio: 'inherit' });

  } catch (error) {
    console.error('Erro ao configurar banco de teste:', error);
    throw error;
  }

  console.log('Ambiente de testes configurado com sucesso!');
}
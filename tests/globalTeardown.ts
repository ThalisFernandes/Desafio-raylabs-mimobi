import { execSync } from 'child_process';

export default async function globalTeardown() {
  console.log('Limpando ambiente de testes...');

  try {
    // remover banco de dados de teste
    console.log('Removendo banco de dados de teste...');
    execSync('dropdb ecommerce_test_db', { stdio: 'ignore' });
  } catch (error) {
    // ignorar erro se banco nao existir
    console.log('Banco de teste ja foi removido ou nao existe');
  }

  console.log('Ambiente de testes limpo com sucesso!');
}